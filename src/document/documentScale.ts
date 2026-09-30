import { scaleRealWorldMillimetresToPageMillimetres } from "./utils.js";
import {
  a4PageSizes,
  maximumItemCutoutHeightMm,
  maximumItemCutoutWidthMm,
  pageMarginMm,
} from "./pageGeometry.js";
import type {
  Item,
  PageOrientation,
  RealWorldRoomDimensionsMm,
  RoomScaleResult,
} from "../types/interior.js";

function calculateItemRequiredScaleDenominator(item: Item): number {
  const longerSideMm = Math.max(item.widthMm, item.lengthMm);
  const shorterSideMm = Math.min(item.widthMm, item.lengthMm);

  return Math.ceil(
    Math.max(
      longerSideMm / maximumItemCutoutWidthMm,
      shorterSideMm / maximumItemCutoutHeightMm,
    ),
  );
}

function calculateItemsRequiredScaleDenominator(
  items: readonly Item[],
): number {
  let requiredScaleDenominator = 1;

  for (const item of items) {
    requiredScaleDenominator = Math.max(
      requiredScaleDenominator,
      calculateItemRequiredScaleDenominator(item),
    );
  }

  return requiredScaleDenominator;
}

function calculateDocumentScaleForPageOrientation(
  roomDimensions: RealWorldRoomDimensionsMm,
  itemRequiredScaleDenominator: number,
  pageOrientation: PageOrientation,
): RoomScaleResult {
  const pageSize = a4PageSizes[pageOrientation];
  const availablePageWidthMm = pageSize.widthMm - pageMarginMm * 2;
  const availablePageHeightMm = pageSize.heightMm - pageMarginMm * 2;

  const roomRequiredScaleDenominator = Math.ceil(
    Math.max(
      roomDimensions.widthMm / availablePageWidthMm,
      roomDimensions.lengthMm / availablePageHeightMm,
    ),
  );

  const scaleDenominator = Math.max(
    roomRequiredScaleDenominator,
    itemRequiredScaleDenominator,
  );

  return {
    pageOrientation,
    scaleDenominator,
    availablePageWidthMm,
    availablePageHeightMm,
    roomWidthOnPageMm: scaleRealWorldMillimetresToPageMillimetres(
      roomDimensions.widthMm,
      scaleDenominator,
    ),
    roomHeightOnPageMm: scaleRealWorldMillimetresToPageMillimetres(
      roomDimensions.lengthMm,
      scaleDenominator,
    ),
  };
}

export function selectDocumentScale(
  room: RealWorldRoomDimensionsMm,
  items: readonly Item[],
): RoomScaleResult {
  const itemRequiredScaleDenominator =
    calculateItemsRequiredScaleDenominator(items);

  const portraitScale = calculateDocumentScaleForPageOrientation(
    room,
    itemRequiredScaleDenominator,
    "portrait",
  );

  const landscapeScale = calculateDocumentScaleForPageOrientation(
    room,
    itemRequiredScaleDenominator,
    "landscape",
  );

  if (landscapeScale.scaleDenominator < portraitScale.scaleDenominator) {
    return landscapeScale;
  }

  return portraitScale;
}
