import { arrangeItemCutouts } from "./itemCutoutArrangement.js";
import {
  maximumItemCutoutHeightMm,
  maximumItemCutoutWidthMm,
} from "./pageGeometry.js";
import { scaleRealWorldMillimetresToPageMillimetres } from "./utils.js";
import type {
  ItemCutoutPlacementPlan,
  Item,
  ItemCutout,
} from "../types/interior.js";

type CutoutDimensions = {
  widthMm: number;
  heightMm: number;
};

function orientCutoutWithLongestSideHorizontal(
  firstSideMm: number,
  secondSideMm: number,
): CutoutDimensions {
  return {
    widthMm: Math.max(firstSideMm, secondSideMm),
    heightMm: Math.min(firstSideMm, secondSideMm),
  };
}

function createItemCutouts(
  items: readonly Item[],
  scaleDenominator: number,
): ItemCutout[] {
  return items.map((item) => {
    const itemWidthOnPageMm = scaleRealWorldMillimetresToPageMillimetres(
      item.widthMm,
      scaleDenominator,
    );
    const itemLengthOnPageMm = scaleRealWorldMillimetresToPageMillimetres(
      item.lengthMm,
      scaleDenominator,
    );
    const { widthMm, heightMm } = orientCutoutWithLongestSideHorizontal(
      itemWidthOnPageMm,
      itemLengthOnPageMm,
    );

    const cutoutFitsOnRegularItemPage =
      widthMm <= maximumItemCutoutWidthMm &&
      heightMm <= maximumItemCutoutHeightMm;

    if (!cutoutFitsOnRegularItemPage) {
      throw new Error(
        `Item "${item.name}" cannot fit ` +
          `on an A4 landscape item page at 1:${scaleDenominator}.`,
      );
    }

    return {
      name: item.name,
      realWorldWidthMm: item.widthMm,
      realWorldLengthMm: item.lengthMm,
      widthMm,
      heightMm,
    };
  });
}

export function createItemCutoutPlacementPlan(
  items: readonly Item[],
  scaleDenominator: number,
): ItemCutoutPlacementPlan {
  const itemCutouts = createItemCutouts(items, scaleDenominator);
  const { pageCount, cutoutPlacements } = arrangeItemCutouts(itemCutouts);

  return {
    scaleDenominator,
    pageCount,
    cutoutPlacements,
  };
}
