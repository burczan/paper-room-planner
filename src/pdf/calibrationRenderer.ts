import { jsPDF } from "jspdf";
import {
  calibrationSectionTopYCoordinateMm,
  calibrationLineLengthMm,
  pageMarginMm,
} from "../document/pageGeometry.js";
import { itemPageStyle } from "./style.js";

const { verticalSpacingMm, fontSizePt } = itemPageStyle;

function calculateCalibrationSectionCoordinates() {
  const scaleTextYCoordinateMm =
    calibrationSectionTopYCoordinateMm + verticalSpacingMm;

  const descriptionYCoordinateMm = scaleTextYCoordinateMm + verticalSpacingMm;

  const calibrationLineYCoordinateMm =
    descriptionYCoordinateMm + verticalSpacingMm;

  return {
    contentStartXCoordinateMm: pageMarginMm,
    scaleTextYCoordinateMm,
    descriptionYCoordinateMm,
    calibrationLineYCoordinateMm,
  };
}

export function drawCalibrationSection(
  pdfDocument: jsPDF,
  scaleDenominator: number,
): void {
  const {
    contentStartXCoordinateMm,
    scaleTextYCoordinateMm,
    descriptionYCoordinateMm,
    calibrationLineYCoordinateMm,
  } = calculateCalibrationSectionCoordinates();

  pdfDocument.setFontSize(fontSizePt);

  pdfDocument.text(
    `Scale: 1:${scaleDenominator} (1 cm on paper = ${scaleDenominator} cm in the room)`,
    contentStartXCoordinateMm,
    scaleTextYCoordinateMm,
  );

  pdfDocument.text(
    `Calibration line: ${calibrationLineLengthMm} mm at Actual Size/100%`,
    contentStartXCoordinateMm,
    descriptionYCoordinateMm,
  );

  pdfDocument.line(
    contentStartXCoordinateMm,
    calibrationLineYCoordinateMm,
    contentStartXCoordinateMm + calibrationLineLengthMm,
    calibrationLineYCoordinateMm,
  );
}
