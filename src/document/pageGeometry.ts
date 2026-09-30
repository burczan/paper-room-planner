import type { PageOrientation, PageSize } from "../types/interior.js";

export const a4PageSizes = {
  portrait: {
    widthMm: 210,
    heightMm: 297,
  },
  landscape: {
    widthMm: 297,
    heightMm: 210,
  },
} as const satisfies Record<PageOrientation, PageSize>;

export const itemPageSize = a4PageSizes.landscape;

export const pageMarginMm = 10;
export const itemCutoutSpacingMm = 5;

export const maximumItemCutoutWidthMm = itemPageSize.widthMm - pageMarginMm * 2;
export const maximumItemCutoutHeightMm =
  itemPageSize.heightMm - pageMarginMm * 2;
export const calibrationSectionHeightMm = 20;
export const calibrationLineLengthMm = 100;

export const calibrationSectionTopYCoordinateMm =
  itemPageSize.heightMm - pageMarginMm - calibrationSectionHeightMm;
