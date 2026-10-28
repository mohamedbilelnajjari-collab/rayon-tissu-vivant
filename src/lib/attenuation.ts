export type Tissue = "mou" | "os";
export type Energy = 40 | 100 | 400;

// μ/ρ en m²/kg
export const MASS_ATT: Record<Tissue, Record<Energy, number>> = {
  mou: { 40: 0.0245, 100: 0.0167, 400: 0.0106 },
  os: { 40: 0.0541, 100: 0.0175, 400: 0.0102 },
};
// ρ en kg/m³
export const DENSITY: Record<Tissue, number> = { mou: 1000, os: 1850 };

/** μ linéaire en m⁻¹ */
export function mu(t: Tissue, e: Energy) {
  return MASS_ATT[t][e] * DENSITY[t];
}

/** I/I0 pour une épaisseur x en cm */
export function transmission(t: Tissue, e: Energy, xCm: number) {
  return Math.exp(-mu(t, e) * (xCm / 100));
}
