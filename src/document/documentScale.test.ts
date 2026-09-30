import { describe, expect, it } from "vitest";
import { selectDocumentScale } from "./documentScale.js";
import type { Item, RealWorldRoomDimensionsMm } from "../types/interior.js";

const defaultRoom: RealWorldRoomDimensionsMm = {
  widthMm: 6000,
  lengthMm: 3500,
};

describe("selectDocumentScale()", () => {
  describe("room requirements", () => {
    it("selects the smallest whole-number denominator required by the room when there are no items", () => {
      const { scaleDenominator } = selectDocumentScale(defaultRoom, []);

      expect(scaleDenominator).toBe(22);
    });

    it("uses scale 1:1 when the room and items already fit on their pages", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 100,
        lengthMm: 100,
      };

      const items: Item[] = [
        {
          name: "Small item",
          shape: "rectangle",
          widthMm: 100,
          lengthMm: 100,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(1);
    });

    it("rounds up when the room requirement is fractional", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 1901,
        lengthMm: 2770,
      };
      const { scaleDenominator } = selectDocumentScale(room, []);

      expect(scaleDenominator).toBe(11);
    });
  });

  describe("item requirements", () => {
    it("keeps the room-required scale when all items fit at that scale", () => {
      const items: Item[] = [
        {
          name: "Table",
          shape: "rectangle",
          widthMm: 1200,
          lengthMm: 600,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(defaultRoom, items);

      expect(scaleDenominator).toBe(22);
    });

    it("increases the common denominator when an item requires it", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 3500,
        lengthMm: 6000,
      };

      const items: Item[] = [
        {
          name: "Large item",
          shape: "rectangle",
          widthMm: 6925,
          lengthMm: 1000,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(25);
    });

    it("calculates room dimensions using the item-required denominator", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 3500,
        lengthMm: 6000,
      };

      const items: Item[] = [
        {
          name: "Large item",
          shape: "rectangle",
          widthMm: 6925,
          lengthMm: 1000,
        },
      ];

      const { roomWidthOnPageMm, roomHeightOnPageMm } = selectDocumentScale(
        room,
        items,
      );

      expect(roomWidthOnPageMm).toBe(140);
      expect(roomHeightOnPageMm).toBe(240);
    });

    it("uses the largest scale denominator required by the items", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 100,
        lengthMm: 100,
      };

      const items: Item[] = [
        {
          name: "Smaller requirement",
          shape: "rectangle",
          widthMm: 5540,
          lengthMm: 1000,
        },
        {
          name: "Larger requirement",
          shape: "rectangle",
          widthMm: 6925,
          lengthMm: 1000,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(25);
    });

    it("uses the longer item side against the item page width", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 100,
        lengthMm: 100,
      };

      const items: Item[] = [
        {
          name: "Long item",
          shape: "rectangle",
          widthMm: 1000,
          lengthMm: 6925,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(25);
    });

    it("uses the shorter item side against the item page height", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 100,
        lengthMm: 100,
      };

      const items: Item[] = [
        {
          name: "Slightly too tall",
          shape: "rectangle",
          widthMm: 277,
          lengthMm: 191,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(2);
    });

    it("does not increase the denominator when an item exactly fits a regular item page", () => {
      const room: RealWorldRoomDimensionsMm = {
        widthMm: 100,
        lengthMm: 100,
      };

      const items: Item[] = [
        {
          name: "Exact fit",
          shape: "rectangle",
          widthMm: 277,
          lengthMm: 190,
        },
      ];

      const { scaleDenominator } = selectDocumentScale(room, items);

      expect(scaleDenominator).toBe(1);
    });
  });

  describe("page orientation", () => {
    it("selects portrait when an item makes the final orientation candidates equal", () => {
      const items: Item[] = [
        {
          name: "Large item",
          shape: "rectangle",
          widthMm: 8864,
          lengthMm: 1000,
        },
      ];

      const { pageOrientation, scaleDenominator } = selectDocumentScale(
        defaultRoom,
        items,
      );

      expect(pageOrientation).toBe("portrait");
      expect(scaleDenominator).toBe(32);
    });

    it("selects landscape when its final common denominator is smaller", () => {
      const items: Item[] = [
        {
          name: "Large item",
          shape: "rectangle",
          widthMm: 6925,
          lengthMm: 1000,
        },
      ];

      const { pageOrientation } = selectDocumentScale(defaultRoom, items);

      expect(pageOrientation).toBe("landscape");
    });
  });
});
