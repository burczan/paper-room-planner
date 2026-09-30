import { describe, expect, it } from "vitest";
import { calibrationSectionTopYCoordinateMm } from "./pageGeometry.js";

describe("page geometry", () => {
  it("derives the calibration section top Y coordinate", () => {
    expect(calibrationSectionTopYCoordinateMm).toBe(180);
  });
});
