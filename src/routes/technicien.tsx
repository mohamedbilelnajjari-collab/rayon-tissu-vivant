import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { evaluate, exposure, type Verdict } from "@/lib/radio";

export const Route = createFileRoute("/technicien")({
  head: () => ({
    meta: [
      { title: "Vous êtes le technicien radio — mini-jeu" },
      { name: "description", content: "Réglez kVp, mA et temps de pose pour réussir une radio du thorax." },
      { property: "og:title", content: "Vous êtes le technicien radio" },
      { property: "og:description", content: "Mini-jeu pédagogique sur l'exposition en radiologie." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Game,
});

const RESULTS: Record<Verdict, { title: string; text: string; ok: boolean }> = {
  claire: { title: "Image trop claire (sous-exposée)", ok: false,
    text: "Pas assez de photons atteignent le détecteur : augmentez mA × temps (ou un kVp trop bas ne pénètre pas le thorax)." },
  noire: { title: "Image trop noire (surexposée)", ok: false,
    text: "Trop de photons : mA × temps est trop élevé. Réduisez la quantité de photons (et la dose au patient)." },
  contraste: { title: "Contraste trop faible", ok: false,
    text: "Le kVp est trop élevé : le faisceau très pénétrant atténue presque autant les os que les tissus mous. Baissez le kVp." },
  correct: { title: "Image correcte !", ok: true,
    text: "Bon équilibre : kVp adapté au thorax pour un bon contraste, et mA × temps juste suffisant pour le noircissement." },
};

function Game() {
  const [kvp, setKvp] = useState(80);
  const [ma, setMa] = useState(100);
  const [ms, setMs] = useState(50);
  const [tries, setTries] = useState<Verdict[]>([]);
  const [result, setResult] = useState<Verdict | null>(null);
  const score = tries.filter((t) => t === "correct").length;
  const over = tries.length >= 3 && result === null;

  const validate = () => {
    const v = evaluate(kvp, ma, ms);
    setResult(v);
    setTries((t) => [...t, v]);
  };
  const replay = () => {
    setResult(null);
    if (tries.length >= 3) setTries([]);
  };

  // aperçu : luminosité et contraste simulés
  const e = exposure(kvp, ma, ms);
  const dark = Math.min(1, Math.max(0, Math.log10(e / 0.5) / Math.log10(60)));
  const contrast = Math.max(0.15, 1 - (kvp - 50) / 110);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Vous êtes le technicien radio</h1>
          <p className="mt-2 text-lg text-muted-foreground">Radio du thorax de face — trouvez les bons réglages.</p>
        </div>
        <div className="rounded-2xl bg-primary px-6 py-3 text-center text-primary-foreground">
          <p className="text-sm opacity-80">Score</p>
          <p className="font-mono text-3xl font-bold">{score} / 3</p>
          <p className="text-xs opacity-80">Essai {Math.min(tries.length + (result ? 0 : 1), 3)} sur 3</p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-6 rounded-2xl border bg-card p-6 shadow-soft">
          <Slider label="kVp (qualité / contraste)" value={kvp} min={50} max={140} step={1} unit="kVp" onChange={setKvp} disabled={!!result || over} />
          <Slider label="mA (intensité)" value={ma} min={50} max={600} step={10} unit="mA" onChange={setMa} disabled={!!result || over} />
          <Slider label="Temps de pose" value={ms} min={10} max={500} step={5} unit="ms" onChange={setMs} disabled={!!result || over} />
          <p className="rounded-lg bg-secondary p-3 text-lg text-secondary-foreground">
            mA × temps = <b className="font-mono">{((ma * ms) / 1000).toFixed(1)} mAs</b>
          </p>
          {over ? (
            <button onClick={() => setTries([])} className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground">
              Nouvelle partie (score final : {score}/3)
            </button>
          ) : !result ? (
            <button onClick={validate} className="w-full rounded-xl bg-primary py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90">
              Valider l'exposition
            </button>
          ) : null}
        </section>

        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-stage p-4">
            <svg viewBox="0 0 200 200" className="mx-auto h-64"
              style={{ filter: result ? `brightness(${1.6 - dark * 1.4}) contrast(${contrast})` : "blur(6px) brightness(0.6)" }}>
              <rect width="200" height="200" className="fill-stage" />
              <ellipse cx="65" cy="105" rx="38" ry="70" className="fill-muted-foreground" opacity="0.35" />
              <ellipse cx="135" cy="105" rx="38" ry="70" className="fill-muted-foreground" opacity="0.35" />
              {Array.from({ length: 7 }, (_, i) => (
                <g key={i} className="stroke-background" strokeWidth="4" fill="none" opacity="0.9">
                  <path d={`M100 ${45 + i * 18} Q60 ${35 + i * 18} 30 ${60 + i * 18}`} />
                  <path d={`M100 ${45 + i * 18} Q140 ${35 + i * 18} 170 ${60 + i * 18}`} />
                </g>
              ))}
              <rect x="94" y="20" width="12" height="170" className="fill-background" />
              <ellipse cx="115" cy="140" rx="25" ry="20" className="fill-background" opacity="0.7" />
            </svg>
            {!result && <p className="text-center text-sm text-primary-foreground">L'image apparaîtra après validation</p>}
          </div>
          {result && (
            <div className={`rounded-2xl border-2 p-6 ${RESULTS[result].ok ? "border-primary bg-secondary" : "border-destructive bg-card"}`}>
              <h2 className={`text-2xl font-bold ${RESULTS[result].ok ? "text-primary" : "text-destructive"}`}>{RESULTS[result].title}</h2>
              <p className="mt-2 text-lg text-foreground">{RESULTS[result].text}</p>
              <button onClick={replay} className="mt-4 rounded-xl bg-primary px-6 py-3 text-lg font-semibold text-primary-foreground">
                {tries.length >= 3 ? `Rejouer (score : ${score}/3)` : "Rejouer"}
              </button>
            </div>
          )}
        </section>
      </div>
      <p className="text-muted-foreground">
        Rappel : le kVp contrôle la qualité du faisceau (kVp élevé = plus de pénétration, moins de contraste) ;
        mA × temps = quantité de photons = noircissement.
      </p>
    </div>
  );
}

export function Slider({ label, value, min, max, step, unit, onChange, disabled }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void; disabled?: boolean;
}) {
  return (
    <label className="block">
      <div className="flex justify-between text-lg font-medium text-foreground">
        <span>{label}</span>
        <span className="font-mono text-primary">{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
        onChange={(e) => onChange(+e.target.value)} className="mt-2 w-full accent-primary" />
    </label>
  );
}
