import { describe, it, expect } from "vitest";
import { evaluate, magnification, geometricBlur } from "@/lib/radio";

describe("technicien radio", () => {
  it("120 kVp, 200 mA, 20 ms → correct", () => expect(evaluate(120, 200, 20)).toBe("correct"));
  it("mAs très faible → trop claire", () => expect(evaluate(110, 50, 10)).toBe("claire"));
  it("mAs très élevé → trop noire", () => expect(evaluate(110, 600, 500)).toBe("noire"));
  it("kVp 140 exposition normale → contraste faible", () => expect(evaluate(140, 100, 30)).toBe("contraste"));
});

describe("flou géométrique", () => {
  it("M = l/(l-h)", () => expect(magnification(100, 20)).toBeCloseTo(1.25));
  it("flou = f·h/(l-h)", () => expect(geometricBlur(1, 100, 20)).toBeCloseTo(0.25));
});
