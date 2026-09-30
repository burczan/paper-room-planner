import { jsPDF } from "jspdf";
import { millimetresToMetres } from "./utils.js";
import type { ItemCutoutPlacement, ItemPage } from "../types/interior.js";
import { drawCalibrationSection } from "./calibrationRenderer.js";
import { itemPageStyle } from "./style.js";

function calculateItemCutoutLabelCoordinates(
  cutoutPlacement: ItemCutoutPlacement,
) {
  const contentStartXCoordinateMm =
    cutoutPlacement.xMm + itemPageStyle.verticalSpacingMm;

  const itemNameYCoordinateMm =
    cutoutPlacement.yMm + itemPageStyle.verticalSpacingMm;

  const itemDimensionsYCoordinateMm =
    itemNameYCoordinateMm + itemPageStyle.verticalSpacingMm;

  return {
    contentStartXCoordinateMm,
    itemNameYCoordinateMm,
    itemDimensionsYCoordinateMm,
  };
}

function drawItemCutout(
  pdf: jsPDF,
  cutoutPlacement: ItemCutoutPlacement,
): void {
  const itemCutoutLabelCoordinates =
    calculateItemCutoutLabelCoordinates(cutoutPlacement);

  pdf.rect(
    cutoutPlacement.xMm,
    cutoutPlacement.yMm,
    cutoutPlacement.widthMm,
    cutoutPlacement.heightMm,
  );

  pdf.text(
    cutoutPlacement.name,
    itemCutoutLabelCoordinates.contentStartXCoordinateMm,
    itemCutoutLabelCoordinates.itemNameYCoordinateMm,
  );

  pdf.text(
    `${millimetresToMetres(cutoutPlacement.realWorldWidthMm)} × ${millimetresToMetres(cutoutPlacement.realWorldLengthMm)} m`,
    itemCutoutLabelCoordinates.contentStartXCoordinateMm,
    itemCutoutLabelCoordinates.itemDimensionsYCoordinateMm,
  );
}

export function drawItemPage(
  pdf: jsPDF,
  itemPage: ItemPage,
  scaleDenominator: number,
): void {
  pdf.setFontSize(itemPageStyle.fontSizePt);

  for (const cutoutPlacement of itemPage.cutoutPlacements) {
    drawItemCutout(pdf, cutoutPlacement);
  }

  if (itemPage.hasCalibrationReference) {
    drawCalibrationSection(pdf, scaleDenominator);
  }
}
