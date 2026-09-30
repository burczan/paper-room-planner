import {
  calibrationSectionHeightMm,
  itemCutoutSpacingMm,
  itemPageSize,
  pageMarginMm,
} from "./pageGeometry.js";
import type { ItemCutoutPlacement, ItemCutout } from "../types/interior.js";

type ItemCutoutArrangementState = {
  itemPageIndex: number;
  nextCutoutXCoordinateMm: number;
  currentRowYCoordinateMm: number;
  maximumCutoutHeightInCurrentRowMm: number;
};

type ItemCutoutArrangement = {
  pageCount: number;
  cutoutPlacements: ItemCutoutPlacement[];
};

function sortCutoutsByDescendingHeight(
  cutouts: readonly ItemCutout[],
): readonly ItemCutout[] {
  return [...cutouts].sort((first, second) => {
    return second.heightMm - first.heightMm;
  });
}

function calculateMaximumAllowedCutoutBottomYCoordinate(
  itemPageIndex: number,
): number {
  const hasCalibrationSection = itemPageIndex === 0;
  const reservedCalibrationSectionHeightMm = hasCalibrationSection
    ? calibrationSectionHeightMm
    : 0;

  return (
    itemPageSize.heightMm - pageMarginMm - reservedCalibrationSectionHeightMm
  );
}

function createInitialArrangementState(): ItemCutoutArrangementState {
  return {
    itemPageIndex: 0,
    nextCutoutXCoordinateMm: pageMarginMm,
    currentRowYCoordinateMm: pageMarginMm,
    maximumCutoutHeightInCurrentRowMm: 0,
  };
}

function doesCutoutRequireNewRow(
  cutout: ItemCutout,
  arrangementState: ItemCutoutArrangementState,
): boolean {
  const cutoutRightXCoordinateMm =
    arrangementState.nextCutoutXCoordinateMm + cutout.widthMm;
  const maximumCutoutRightXCoordinateMm = itemPageSize.widthMm - pageMarginMm;

  return cutoutRightXCoordinateMm > maximumCutoutRightXCoordinateMm;
}

function startNewRow(arrangementState: ItemCutoutArrangementState): void {
  arrangementState.nextCutoutXCoordinateMm = pageMarginMm;
  arrangementState.currentRowYCoordinateMm +=
    arrangementState.maximumCutoutHeightInCurrentRowMm + itemCutoutSpacingMm;
  arrangementState.maximumCutoutHeightInCurrentRowMm = 0;
}

function doesCutoutRequireNewPage(
  cutout: ItemCutout,
  arrangementState: ItemCutoutArrangementState,
): boolean {
  const cutoutBottomYCoordinateMm =
    arrangementState.currentRowYCoordinateMm + cutout.heightMm;
  const maximumCutoutBottomYCoordinateMm =
    calculateMaximumAllowedCutoutBottomYCoordinate(
      arrangementState.itemPageIndex,
    );

  return cutoutBottomYCoordinateMm > maximumCutoutBottomYCoordinateMm;
}

function startNewItemPage(arrangementState: ItemCutoutArrangementState): void {
  arrangementState.itemPageIndex += 1;
  arrangementState.nextCutoutXCoordinateMm = pageMarginMm;
  arrangementState.currentRowYCoordinateMm = pageMarginMm;
  arrangementState.maximumCutoutHeightInCurrentRowMm = 0;
}

function createCutoutPlacement(
  cutout: ItemCutout,
  arrangementState: ItemCutoutArrangementState,
): ItemCutoutPlacement {
  return {
    name: cutout.name,
    pageIndex: arrangementState.itemPageIndex,
    xMm: arrangementState.nextCutoutXCoordinateMm,
    yMm: arrangementState.currentRowYCoordinateMm,
    realWorldWidthMm: cutout.realWorldWidthMm,
    realWorldLengthMm: cutout.realWorldLengthMm,
    widthMm: cutout.widthMm,
    heightMm: cutout.heightMm,
  };
}

function advanceArrangementStateAfterCutoutPlacement(
  cutout: ItemCutout,
  arrangementState: ItemCutoutArrangementState,
): void {
  arrangementState.nextCutoutXCoordinateMm +=
    cutout.widthMm + itemCutoutSpacingMm;
  arrangementState.maximumCutoutHeightInCurrentRowMm = Math.max(
    arrangementState.maximumCutoutHeightInCurrentRowMm,
    cutout.heightMm,
  );
}

export function arrangeItemCutouts(
  itemCutouts: readonly ItemCutout[],
): ItemCutoutArrangement {
  if (itemCutouts.length === 0) {
    return {
      pageCount: 1,
      cutoutPlacements: [],
    };
  }

  const sortedCutouts = sortCutoutsByDescendingHeight(itemCutouts);
  const cutoutPlacements: ItemCutoutPlacement[] = [];
  const arrangementState = createInitialArrangementState();

  for (const cutout of sortedCutouts) {
    if (doesCutoutRequireNewRow(cutout, arrangementState)) {
      startNewRow(arrangementState);
    }

    if (doesCutoutRequireNewPage(cutout, arrangementState)) {
      startNewItemPage(arrangementState);
    }

    cutoutPlacements.push(createCutoutPlacement(cutout, arrangementState));
    advanceArrangementStateAfterCutoutPlacement(cutout, arrangementState);
  }

  return {
    pageCount: arrangementState.itemPageIndex + 1,
    cutoutPlacements,
  };
}
