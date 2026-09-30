import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";
import { drawCalibrationSection } from "./calibrationRenderer.js";
import { drawItemPage } from "./itemRenderer.js";
import type { ItemPage } from "../types/interior.js";

vi.mock("./calibrationRenderer.js", () => ({
  drawCalibrationSection: vi.fn(),
}));

describe("drawItemPage()", () => {
  it("draws a cutout using its placement", () => {
    const itemPage: ItemPage = {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 0,
      hasCalibrationReference: false,
      cutoutPlacements: [
        {
          name: "Desk",
          realWorldWidthMm: 1000,
          realWorldLengthMm: 500,
          pageIndex: 0,
          xMm: 12,
          yMm: 18,
          widthMm: 100,
          heightMm: 50,
        },
      ],
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const rect = vi.spyOn(pdfDocument, "rect");

    drawItemPage(pdfDocument, itemPage, 10);

    expect(rect).toHaveBeenCalledOnce();
    expect(rect).toHaveBeenCalledWith(12, 18, 100, 50);
  });

  it("renders labels from placement data", () => {
    const itemPage: ItemPage = {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 0,
      hasCalibrationReference: false,
      cutoutPlacements: [
        {
          name: "Shelf",
          realWorldWidthMm: 1000,
          realWorldLengthMm: 300,
          pageIndex: 0,
          xMm: 10,
          yMm: 10,
          widthMm: 100,
          heightMm: 30,
        },
      ],
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const text = vi.spyOn(pdfDocument, "text");

    drawItemPage(pdfDocument, itemPage, 10);

    const renderedText = text.mock.calls.map(([content]) => content);

    expect(renderedText).toEqual(["Shelf", "1 × 0.3 m"]);
  });

  it("renders the calibration section when the page requests it", () => {
    const itemPage: ItemPage = {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 0,
      hasCalibrationReference: true,
      cutoutPlacements: [],
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const drawCalibration = vi.mocked(drawCalibrationSection);
    drawCalibration.mockClear();

    drawItemPage(pdfDocument, itemPage, 22);

    expect(drawCalibration).toHaveBeenCalledOnce();
    expect(drawCalibration).toHaveBeenCalledWith(pdfDocument, 22);
  });

  it("does not render the calibration section when the page does not request it", () => {
    const itemPage: ItemPage = {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 1,
      hasCalibrationReference: false,
      cutoutPlacements: [],
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const drawCalibration = vi.mocked(drawCalibrationSection);
    drawCalibration.mockClear();

    drawItemPage(pdfDocument, itemPage, 22);

    expect(drawCalibration).not.toHaveBeenCalled();
  });
});
