import { describe, expect, it } from "vitest";
import { scaleRealWorldMillimetresToPageMillimetres } from "./utils.js";

describe("scaleRealWorldMillimetresToPageMillimetres()", () => {
  it("scales a real-world dimension by the scale denominator", () => {
    const pageMillimetres = scaleRealWorldMillimetresToPageMillimetres(
      6000,
      25,
    );

    expect(pageMillimetres).toBe(240);
  });

  it("preserves fractional page-space dimensions", () => {
    const pageMillimetres = scaleRealWorldMillimetresToPageMillimetres(1000, 3);

    expect(pageMillimetres).toBeCloseTo(333.333, 3);
  });

  it("keeps the dimension unchanged at scale 1:1", () => {
    const pageMillimetres = scaleRealWorldMillimetresToPageMillimetres(6000, 1);

    expect(pageMillimetres).toBe(6000);
  });
});
