export type Verdict = "claire" | "noire" | "contraste" | "correct";

/** Exposition relative : mAs × (kVp/100)² (le kVp augmente aussi le noircissement) */
export function exposure(kvp: number, ma: number, ms: number) {
  return ((ma * ms) / 1000) * (kvp / 100) ** 2;
}

/** Radio du thorax : kVp idéal 70–125, exposition relative entre 2 et 10 */
export function evaluate(kvp: number, ma: number, ms: number): Verdict {
  if (kvp < 70) return "claire";
  const e = exposure(kvp, ma, ms);
  if (e < 2) return "claire";
  if (e > 10) return "noire";
  if (kvp > 125) return "contraste";
  return "correct";
}

export const magnification = (l: number, h: number) => l / (l - h);
export const geometricBlur = (f: number, l: number, h: number) => (f * h) / (l - h);
