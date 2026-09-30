import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";
import { drawCalibrationSection } from "./calibrationRenderer.js";

describe("drawCalibrationSection()", () => {
  it("renders the selected scale and calibration instructions", () => {
    const pdfDocument = new jsPDF({ unit: "mm" });
    const text = vi.spyOn(pdfDocument, "text");

    drawCalibrationSection(pdfDocument, 22);

    const renderedText = text.mock.calls.map(([content]) => content);

    expect(renderedText).toEqual([
      "Scale: 1:22",
      "Calibration line: 100 mm at Actual Size/100%",
    ]);
  });

  it("draws a horizontal calibration line with a physical length of 100 mm", () => {
    const pdfDocument = new jsPDF({ unit: "mm" });
    const line = vi.spyOn(pdfDocument, "line");

    drawCalibrationSection(pdfDocument, 22);

    expect(line).toHaveBeenCalledOnce();

    const [startXMm, startYMm, endXMm, endYMm] = line.mock.calls[0];
    const lineLengthMm = endXMm - startXMm;

    expect(lineLengthMm).toBe(100);
    expect(endYMm).toBe(startYMm);
  });
});
