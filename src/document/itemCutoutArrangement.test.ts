import { describe, expect, it } from "vitest";
import { arrangeItemCutouts } from "./itemCutoutArrangement.js";
import type { ItemCutout } from "../types/interior.js";

describe("arrangeItemCutouts()", () => {
  describe("cutout ordering", () => {
    it("orders cutouts by descending height", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Short",
          realWorldWidthMm: 60,
          realWorldLengthMm: 20,
          widthMm: 60,
          heightMm: 20,
        },
        {
          name: "Tall",
          realWorldWidthMm: 80,
          realWorldLengthMm: 50,
          widthMm: 80,
          heightMm: 50,
        },
        {
          name: "Medium",
          realWorldWidthMm: 70,
          realWorldLengthMm: 30,
          widthMm: 70,
          heightMm: 30,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);
      const cutoutNames = cutoutPlacements.map(({ name }) => name);

      expect(cutoutNames).toEqual(["Tall", "Medium", "Short"]);
    });

    it("keeps real-world display information with the correct cutout after sorting", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Short",
          realWorldWidthMm: 60,
          realWorldLengthMm: 20,
          widthMm: 60,
          heightMm: 20,
        },
        {
          name: "Tall",
          realWorldWidthMm: 80,
          realWorldLengthMm: 50,
          widthMm: 80,
          heightMm: 50,
        },
        {
          name: "Medium",
          realWorldWidthMm: 70,
          realWorldLengthMm: 30,
          widthMm: 70,
          heightMm: 30,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);
      const placedCutoutDisplayData = cutoutPlacements.map(
        ({ name, realWorldWidthMm, realWorldLengthMm }) => {
          return { name, realWorldWidthMm, realWorldLengthMm };
        },
      );

      expect(placedCutoutDisplayData).toEqual([
        { name: "Tall", realWorldWidthMm: 80, realWorldLengthMm: 50 },
        { name: "Medium", realWorldWidthMm: 70, realWorldLengthMm: 30 },
        { name: "Short", realWorldWidthMm: 60, realWorldLengthMm: 20 },
      ]);
    });

    it("does not change the order of the input cutouts", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Short",
          realWorldWidthMm: 60,
          realWorldLengthMm: 20,
          widthMm: 60,
          heightMm: 20,
        },
        {
          name: "Tall",
          realWorldWidthMm: 80,
          realWorldLengthMm: 50,
          widthMm: 80,
          heightMm: 50,
        },
        {
          name: "Medium",
          realWorldWidthMm: 70,
          realWorldLengthMm: 30,
          widthMm: 70,
          heightMm: 30,
        },
      ];

      arrangeItemCutouts(itemCutouts);
      const inputCutoutNames = itemCutouts.map(({ name }) => name);

      expect(inputCutoutNames).toEqual(["Short", "Tall", "Medium"]);
    });
  });

  describe("row arrangement", () => {
    it("places the next cutout in the same row with horizontal spacing", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "First",
          realWorldWidthMm: 100,
          realWorldLengthMm: 20,
          widthMm: 100,
          heightMm: 20,
        },
        {
          name: "Second",
          realWorldWidthMm: 50,
          realWorldLengthMm: 10,
          widthMm: 50,
          heightMm: 10,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);
      const cutoutCoordinates = cutoutPlacements.map(({ xMm, yMm }) => {
        return {
          xMm,
          yMm,
        };
      });

      expect(cutoutCoordinates).toEqual([
        {
          xMm: 10,
          yMm: 10,
        },
        {
          xMm: 115,
          yMm: 10,
        },
      ]);
    });

    it("keeps a cutout in the current row when its right edge exactly reaches the allowed boundary", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "First",
          realWorldWidthMm: 100,
          realWorldLengthMm: 20,
          widthMm: 100,
          heightMm: 20,
        },
        {
          name: "Exact fit",
          realWorldWidthMm: 172,
          realWorldLengthMm: 10,
          widthMm: 172,
          heightMm: 10,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);
      const exactFitPlacement = cutoutPlacements.find(({ name }) => {
        return name === "Exact fit";
      });

      const exactFitCoordinates = {
        xMm: exactFitPlacement?.xMm,
        yMm: exactFitPlacement?.yMm,
      };

      expect(exactFitCoordinates).toEqual({
        xMm: 115,
        yMm: 10,
      });
    });

    it("starts a new row when the next cutout does not fit in the current row", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Wide",
          realWorldWidthMm: 200,
          realWorldLengthMm: 20,
          widthMm: 200,
          heightMm: 20,
        },
        {
          name: "Next row",
          realWorldWidthMm: 100,
          realWorldLengthMm: 10,
          widthMm: 100,
          heightMm: 10,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const nextRowPlacement = cutoutPlacements.find(({ name }) => {
        return name === "Next row";
      });

      const nextRowCoordinates = {
        xMm: nextRowPlacement?.xMm,
        yMm: nextRowPlacement?.yMm,
      };

      expect(nextRowCoordinates).toEqual({
        xMm: 10,
        yMm: 35,
      });
    });

    it("positions a new row below the tallest cutout in the previous row", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Tall",
          realWorldWidthMm: 150,
          realWorldLengthMm: 30,
          widthMm: 150,
          heightMm: 30,
        },
        {
          name: "Short",
          realWorldWidthMm: 100,
          realWorldLengthMm: 20,
          widthMm: 100,
          heightMm: 20,
        },
        {
          name: "Next row",
          realWorldWidthMm: 50,
          realWorldLengthMm: 10,
          widthMm: 50,
          heightMm: 10,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const nextRowPlacement = cutoutPlacements.find(({ name }) => {
        return name === "Next row";
      });

      const nextRowCoordinates = {
        xMm: nextRowPlacement?.xMm,
        yMm: nextRowPlacement?.yMm,
      };

      expect(nextRowCoordinates).toEqual({
        xMm: 10,
        yMm: 45,
      });
    });
  });

  describe("page arrangement", () => {
    it("keeps a cutout on the first page when it exactly fits above the calibration section", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Exact first-page fit",
          realWorldWidthMm: 200,
          realWorldLengthMm: 170,
          widthMm: 200,
          heightMm: 170,
        },
      ];

      const { cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const itemPageIndexes = cutoutPlacements.map(
        ({ pageIndex }) => pageIndex,
      );

      expect(itemPageIndexes).toEqual([0]);
    });

    it("moves a cutout to the next page when it does not fit above the calibration section", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "Too tall for first page",
          realWorldWidthMm: 200,
          realWorldLengthMm: 180,
          widthMm: 200,
          heightMm: 180,
        },
      ];

      const { pageCount, cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const cutoutCoordinates = cutoutPlacements.map(
        ({ pageIndex, xMm, yMm }) => {
          return {
            pageIndex,
            xMm,
            yMm,
          };
        },
      );

      expect(pageCount).toBe(2);
      expect(cutoutCoordinates).toEqual([
        {
          pageIndex: 1,
          xMm: 10,
          yMm: 10,
        },
      ]);
    });

    it("starts a new page when the next row does not fit on the current page", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "First",
          realWorldWidthMm: 150,
          realWorldLengthMm: 80,
          widthMm: 150,
          heightMm: 80,
        },
        {
          name: "Second",
          realWorldWidthMm: 150,
          realWorldLengthMm: 79,
          widthMm: 150,
          heightMm: 79,
        },
        {
          name: "Third",
          realWorldWidthMm: 150,
          realWorldLengthMm: 78,
          widthMm: 150,
          heightMm: 78,
        },
      ];

      const { pageCount, cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const thirdPlacement = cutoutPlacements.find(
        ({ name }) => name === "Third",
      );

      const thirdPlacementCoordinates = {
        pageIndex: thirdPlacement?.pageIndex,
        xMm: thirdPlacement?.xMm,
        yMm: thirdPlacement?.yMm,
      };

      expect(pageCount).toBe(2);
      expect(thirdPlacementCoordinates).toEqual({
        pageIndex: 1,
        xMm: 10,
        yMm: 10,
      });
    });

    it("uses the additional bottom space available on pages after the first", () => {
      const itemCutouts: readonly ItemCutout[] = [
        {
          name: "First-page cutout",
          realWorldWidthMm: 200,
          realWorldLengthMm: 170,
          widthMm: 200,
          heightMm: 170,
        },
        {
          name: "Regular page 1",
          realWorldWidthMm: 200,
          realWorldLengthMm: 30,
          widthMm: 200,
          heightMm: 30,
        },
        {
          name: "Regular page 2",
          realWorldWidthMm: 200,
          realWorldLengthMm: 29,
          widthMm: 200,
          heightMm: 29,
        },
        {
          name: "Regular page 3",
          realWorldWidthMm: 200,
          realWorldLengthMm: 28,
          widthMm: 200,
          heightMm: 28,
        },
        {
          name: "Regular page 4",
          realWorldWidthMm: 200,
          realWorldLengthMm: 27,
          widthMm: 200,
          heightMm: 27,
        },
        {
          name: "Regular page 5",
          realWorldWidthMm: 200,
          realWorldLengthMm: 26,
          widthMm: 200,
          heightMm: 26,
        },
        {
          name: "Regular page 6",
          realWorldWidthMm: 200,
          realWorldLengthMm: 25,
          widthMm: 200,
          heightMm: 25,
        },
      ];

      const { pageCount, cutoutPlacements } = arrangeItemCutouts(itemCutouts);

      const finalPlacement = cutoutPlacements.find(({ name }) => {
        return name === "Regular page 6";
      });

      const finalPlacementCoordinates = {
        pageIndex: finalPlacement?.pageIndex,
        yMm: finalPlacement?.yMm,
      };

      expect(pageCount).toBe(2);
      expect(finalPlacementCoordinates).toEqual({
        pageIndex: 1,
        yMm: 175,
      });
    });
  });
});
