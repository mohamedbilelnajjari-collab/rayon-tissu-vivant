import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { geometricBlur, magnification } from "@/lib/radio";

export const Route = createFileRoute("/flou")({
  head: () => ({
    meta: [
      { title: "Flou géométrique en radiologie — simulateur" },
      { name: "description", content: "Visualisez la pénombre selon la taille du foyer et les distances foyer-détecteur et patient-détecteur." },
      { property: "og:title", content: "Flou géométrique en radiologie" },
      { property: "og:description", content: "Agrandissement M = l/(l−h) et flou = foyer × h/(l−h) en direct." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Blur,
});

function Blur() {
  const [f, setF] = useState(1.2);
  const [l, setL] = useState(100);
  const [h, setH] = useState(20);
  const M = magnification(l, h);
  const B = geometricBlur(f, l, h);

  // schéma : 1 cm = 2 px verticalement (l max 180 → 360 px)
  const s = 2, top = 20, cx = 200;
  const yDet = top + l * s, yObj = yDet - h * s;
  const fw = f * 12; // foyer exagéré pour la lisibilité
  const ow = 30; // demi-largeur objet
  // projection d'un point x0 depuis la source xs à travers le bord objet
  const proj = (xs: number, xo: number) => xs + (xo - xs) * ((yDet - top) / (yObj - top || 1));
  const L1 = proj(cx - fw, cx - ow), L2 = proj(cx + fw, cx - ow);
  const R1 = proj(cx - fw, cx + ow), R2 = proj(cx + fw, cx + ow);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Flou géométrique</h1>
        <p className="mt-2 text-muted-foreground">La pénombre dépend de la taille du foyer et des distances.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-[340px_1fr]">
        <section className="space-y-5 rounded-2xl border bg-card p-6 shadow-soft">
          <Range label="Taille du foyer" v={f} min={0.3} max={2} step={0.1} unit="mm" set={setF} />
          <Range label="Distance foyer-détecteur l" v={l} min={80} max={180} step={1} unit="cm" set={setL} />
          <Range label="Distance patient-détecteur h" v={h} min={0} max={40} step={1} unit="cm" set={setH} />
          <div className="space-y-3 rounded-xl bg-secondary p-4 font-mono text-sm text-secondary-foreground">
            <p>M = l / (l − h) = {l} / {l - h} = <b className="text-lg text-primary">{M.toFixed(3)}</b></p>
            <p>Flou = f × h / (l − h) = {f.toFixed(1)} × {h} / {l - h} = <b className="text-lg text-primary">{B.toFixed(3)} mm</b></p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Solutions pour réduire le flou</p>
            <div className="grid gap-2">
              <Sol onClick={() => setF(0.3)}>Petit foyer</Sol>
              <Sol onClick={() => setH(0)}>Patient près du détecteur</Sol>
              <Sol onClick={() => setL(180)}>Distance foyer-patient plus grande</Sol>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4 shadow-soft">
          <svg viewBox="0 0 400 400" className="w-full">
            <polygon points={`${cx - fw},${top} ${cx + fw},${top} ${R2},${yDet} ${L1},${yDet}`} className="fill-ray" opacity="0.12" />
            <polygon points={`${cx - fw},${top} ${cx - ow},${yObj} ${L1},${yDet}`} className="fill-ray" opacity="0" />
            {[[cx - fw, cx - ow, L1], [cx + fw, cx - ow, L2], [cx - fw, cx + ow, R1], [cx + fw, cx + ow, R2]].map(([a, b, c], i) => (
              <line key={i} x1={a} y1={top} x2={c} y2={yDet} className="stroke-ray" strokeWidth="1" strokeDasharray="3 3" style={{ transition: "all .3s" }} />
            ))}
            <rect x={cx - fw} y={top - 6} width={fw * 2} height={8} rx={2} className="fill-destructive" style={{ transition: "all .3s" }} />
            <text x={cx + fw + 8} y={top + 2} className="fill-foreground text-[11px]">Foyer ({f.toFixed(1)} mm)</text>
            <rect x={cx - ow} y={yObj - 4} width={ow * 2} height={8} className="fill-primary" style={{ transition: "all .3s" }} />
            <text x={cx + ow + 8} y={yObj + 4} className="fill-foreground text-[11px]">Objet</text>
            {/* ombre nette et pénombre */}
            <rect x={Math.min(L1, L2)} y={yDet} width={Math.abs(L2 - L1)} height={14} className="fill-destructive" opacity="0.5" style={{ transition: "all .3s" }} />
            <rect x={Math.min(R1, R2)} y={yDet} width={Math.abs(R2 - R1)} height={14} className="fill-destructive" opacity="0.5" style={{ transition: "all .3s" }} />
            <rect x={Math.max(L1, L2)} y={yDet} width={Math.max(0, Math.min(R1, R2) - Math.max(L1, L2))} height={14} className="fill-primary" style={{ transition: "all .3s" }} />
            <line x1="20" x2="380" y1={yDet} y2={yDet} className="stroke-foreground" strokeWidth="3" />
            <text x="20" y={Math.min(yDet + 30, 395)} className="fill-foreground text-[11px]">Détecteur — rouge : pénombre (flou)</text>
          </svg>
          <p className="mt-2 text-sm text-muted-foreground">Taille du foyer exagérée sur le schéma pour rendre la pénombre visible.</p>
        </section>
      </div>
    </div>
  );
}

function Range({ label, v, min, max, step, unit, set }: { label: string; v: number; min: number; max: number; step: number; unit: string; set: (n: number) => void }) {
  return (
    <label className="block">
      <div className="flex justify-between text-sm font-medium text-foreground">
        <span>{label}</span><span className="font-mono text-primary">{step < 1 ? v.toFixed(1) : v} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => set(+e.target.value)} className="mt-2 w-full accent-primary" />
    </label>
  );
}

function Sol({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-lg border border-primary px-3 py-2 text-left text-sm font-medium text-primary hover:bg-secondary">
      ✓ {children}
    </button>
  );
}
