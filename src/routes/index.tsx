import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { mu, transmission, type Energy, type Tissue } from "@/lib/attenuation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Simulateur d'atténuation des rayons X" },
      { name: "description", content: "Simulez I = I0·e^(-μx) pour le tissu mou et l'os à 40, 100 et 400 keV." },
      { property: "og:title", content: "Simulateur d'atténuation des rayons X" },
      { property: "og:description", content: "Courbe d'atténuation et animation de photons traversant le tissu ou l'os." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const ENERGIES: Energy[] = [40, 100, 400];
const TISSUES: { id: Tissue; label: string }[] = [
  { id: "mou", label: "Tissu mou" },
  { id: "os", label: "Os" },
];

function Index() {
  const [x, setX] = useState(5);
  const [energy, setEnergy] = useState<Energy>(100);
  const [tissue, setTissue] = useState<Tissue>("mou");
  const T = transmission(tissue, energy, x);
  const m = mu(tissue, energy);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Physique médicale</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground">Atténuation des rayons X</h1>
          <p className="mt-2 font-mono text-lg text-muted-foreground">I = I₀ · e<sup>−μx</sup></p>
        </header>

        <div className="grid gap-6 md:grid-cols-[320px_1fr]">
          <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
            <div>
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span>Épaisseur x</span>
                <span className="font-mono">{x.toFixed(1)} cm</span>
              </div>
              <input type="range" min={0} max={20} step={0.1} value={x}
                onChange={(e) => setX(+e.target.value)} className="mt-3 w-full accent-primary" />
            </div>
            <Choice label="Énergie" options={ENERGIES.map((e) => ({ id: e, label: `${e} keV` }))} value={energy} onChange={setEnergy} />
            <Choice label="Tissu" options={TISSUES} value={tissue} onChange={setTissue} />
            <div className="rounded-xl bg-secondary p-5 text-center">
              <p className="text-sm text-muted-foreground">Transmission I/I₀</p>
              <p className="mt-1 font-mono text-5xl font-bold text-primary">{(T * 100).toFixed(2)} %</p>
              <p className="mt-2 text-xs text-muted-foreground">μ = {m.toFixed(2)} m⁻¹ ({(m / 100).toFixed(4)} cm⁻¹)</p>
            </div>
          </section>

          <section className="space-y-6">
            <Photons transmission={T} x={x} tissue={tissue} />
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <h2 className="mb-3 font-semibold text-foreground">Courbe d'atténuation I/I₀ en fonction de x</h2>
              <Chart tissue={tissue} energy={energy} x={x} />
              <p className="mt-4 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                Plus x ou μ augmente, plus l'image est claire sur le détecteur : moins de photons le
                traversent jusqu'au détecteur, la zone apparaît donc blanche (comme les os sur une radiographie).
              </p>
            </div>
          </section>
        </div>
    </div>
  );
}

function Choice<T extends string | number>({ label, options, value, onChange }: {
  label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="flex gap-2">
        {options.map((o) => (
          <button key={o.id} onClick={() => onChange(o.id)}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              value === o.id ? "border-primary bg-primary text-primary-foreground" : "bg-background text-foreground hover:bg-accent"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Chart({ tissue, energy, x }: { tissue: Tissue; energy: Energy; x: number }) {
  const W = 600, H = 260, P = 40;
  const sx = (v: number) => P + (v / 20) * (W - 2 * P);
  const sy = (v: number) => H - P - v * (H - 2 * P);
  const pts = Array.from({ length: 201 }, (_, i) => {
    const xv = i / 10;
    return `${sx(xv)},${sy(transmission(tissue, energy, xv))}`;
  }).join(" ");
  const ty = transmission(tissue, energy, x);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <line x1={P} x2={W - P} y1={sy(v)} y2={sy(v)} className="stroke-border" />
          <text x={P - 6} y={sy(v) + 4} textAnchor="end" className="fill-muted-foreground text-[10px]">{v * 100}%</text>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((v) => (
        <text key={v} x={sx(v)} y={H - P + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{v} cm</text>
      ))}
      <polyline points={pts} fill="none" className="stroke-primary" strokeWidth={3} />
      <line x1={sx(x)} x2={sx(x)} y1={sy(0)} y2={sy(ty)} className="stroke-ray" strokeDasharray="4 4" />
      <circle cx={sx(x)} cy={sy(ty)} r={6} className="fill-ray" />
    </svg>
  );
}

type P = { x: number; y: number; stopAt: number | null; alive: boolean };

function Photons({ transmission: T, x, tissue }: { transmission: number; x: number; tissue: Tissue }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const params = useRef({ T, x, tissue });
  params.current = { T, x, tissue };

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const css = getComputedStyle(document.documentElement);
    const col = (n: string) => css.getPropertyValue(n).trim();
    let photons: P[] = [];
    let raf = 0, last = 0;
    const W = c.width, H = c.height;
    const tick = (t: number) => {
      const { T, x, tissue } = params.current;
      const slabW = (x / 20) * (W * 0.5);
      const x0 = W * 0.25, x1 = x0 + slabW;
      if (t - last > 40) {
        last = t;
        const absorbed = Math.random() > T;
        photons.push({ x: 0, y: 20 + Math.random() * (H - 40), alive: true,
          stopAt: absorbed && slabW > 0 ? x0 + Math.random() * slabW : null });
      }
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = col(tissue === "os" ? "--bone" : "--tissue");
      ctx.fillRect(x0, 0, slabW, H);
      ctx.fillStyle = col("--muted-foreground");
      ctx.fillRect(W - 14, 0, 14, H);
      for (const p of photons) {
        if (p.alive) {
          p.x += 4;
          if (p.stopAt !== null && p.x >= p.stopAt) { p.alive = false; p.x = p.stopAt; }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.alive ? col("--ray") : col("--destructive");
        ctx.globalAlpha = p.alive ? 1 : 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      photons = photons.filter((p) => p.x < W - 14 && (p.alive || Math.random() > 0.02));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center justify-between text-sm">
        <h2 className="font-semibold text-foreground">Photons traversant le milieu</h2>
        <span className="text-muted-foreground">Source → milieu → détecteur</span>
      </div>
      <canvas ref={ref} width={800} height={220} className="w-full rounded-lg bg-stage" />
      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-ray" /> transmis</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-destructive" /> arrêtés</span>
      </div>
    </div>
  );
}
