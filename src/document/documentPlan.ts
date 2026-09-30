import { createItemCutoutPlacementPlan } from "./itemCutoutPlacement.js";
import { pageMarginMm } from "./pageGeometry.js";
import type {
  Interior,
  ItemPage,
  DocumentPlan,
  RoomScaleResult,
} from "../types/interior.js";
import { selectDocumentScale } from "./documentScale.js";

type RoomTopLeftCoordinates = {
  roomXCoordinateMm: number;
  roomYCoordinateMm: number;
};

function calculateRoomTopLeftCoordinates(
  scale: RoomScaleResult,
): RoomTopLeftCoordinates {
  const {
    availablePageWidthMm,
    availablePageHeightMm,
    roomWidthOnPageMm,
    roomHeightOnPageMm,
  } = scale;
  const horizontalUnusedSpaceMm = availablePageWidthMm - roomWidthOnPageMm;
  const verticalUnusedSpaceMm = availablePageHeightMm - roomHeightOnPageMm;

  return {
    roomXCoordinateMm: pageMarginMm + horizontalUnusedSpaceMm / 2,
    roomYCoordinateMm: pageMarginMm + verticalUnusedSpaceMm / 2,
  };
}

export function createDocumentPlan(interior: Interior): DocumentPlan {
  const scale = selectDocumentScale(interior.room, interior.items);

  const { pageCount, cutoutPlacements } = createItemCutoutPlacementPlan(
    interior.items,
    scale.scaleDenominator,
  );

  const { roomXCoordinateMm, roomYCoordinateMm } =
    calculateRoomTopLeftCoordinates(scale);

  const itemPages: ItemPage[] = [];

  for (let itemPageIndex = 0; itemPageIndex < pageCount; itemPageIndex += 1) {
    itemPages.push({
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex,
      hasCalibrationReference: itemPageIndex === 0,
      cutoutPlacements: cutoutPlacements.filter(
        (placement) => placement.pageIndex === itemPageIndex,
      ),
    });
  }

  return {
    scale,
    pages: [
      {
        kind: "room",
        pageOrientation: scale.pageOrientation,
        roomShapePlacement: {
          shape: "rectangle",
          xMm: roomXCoordinateMm,
          yMm: roomYCoordinateMm,
          widthMm: scale.roomWidthOnPageMm,
          heightMm: scale.roomHeightOnPageMm,
        },
      },
      ...itemPages,
    ],
  };
}
