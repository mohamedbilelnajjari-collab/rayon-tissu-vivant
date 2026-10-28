import { describe, it, expect } from "vitest";
import { mu, transmission } from "@/lib/attenuation";

describe("atténuation", () => {
  it("μ os 40 keV = 0.0541 × 1850 m⁻¹", () => {
    expect(mu("os", 40)).toBeCloseTo(100.085, 3);
  });
  it("tissu mou 100 keV, 10 cm : I/I0 = e^(-1.67)", () => {
    expect(transmission("mou", 100, 10)).toBeCloseTo(Math.exp(-1.67), 6);
  });
  it("x = 0 donne 100 %", () => {
    expect(transmission("os", 400, 0)).toBe(1);
  });
});
