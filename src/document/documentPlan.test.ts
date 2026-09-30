import { describe, expect, it } from "vitest";
import { createDocumentPlan } from "./documentPlan.js";
import type { Interior } from "../types/interior.js";

describe("createDocumentPlan()", () => {
  it("uses the selected document scale for item cutouts", () => {
    const interior: Interior = {
      room: {
        widthMm: 1900,
        lengthMm: 2770,
      },
      items: [
        {
          name: "Desk",
          shape: "rectangle",
          widthMm: 1000,
          lengthMm: 500,
        },
      ],
    };
    const { pages, scale } = createDocumentPlan(interior);
    const itemPages = pages.filter((page) => page.kind === "item");
    const cutoutDimensions = itemPages.flatMap(({ cutoutPlacements }) =>
      cutoutPlacements.map(({ widthMm, heightMm }) => {
        return {
          widthMm,
          heightMm,
        };
      }),
    );

    expect(scale.scaleDenominator).toBe(10);
    expect(cutoutDimensions).toEqual([
      {
        widthMm: 100,
        heightMm: 50,
      },
    ]);
  });

  describe("room page", () => {
    it("uses the selected page orientation", () => {
      const interior: Interior = {
        room: {
          widthMm: 6000,
          lengthMm: 3500,
        },
        items: [],
      };
      const { pages } = createDocumentPlan(interior);
      const roomPage = pages.find((page) => page.kind === "room");

      if (!roomPage) {
        throw new Error("Expected a room page.");
      }

      expect(roomPage.pageOrientation).toBe("landscape");
    });

    it("uses the room dimensions on the page for the page size", () => {
      const interior: Interior = {
        room: {
          widthMm: 6000,
          lengthMm: 3500,
        },
        items: [],
      };
      const { pages } = createDocumentPlan(interior);
      const roomPage = pages.find((page) => page.kind === "room");

      if (!roomPage) {
        throw new Error("Expected a room page.");
      }

      expect(roomPage.roomShapePlacement.widthMm).toBeCloseTo(272.727, 3);
      expect(roomPage.roomShapePlacement.heightMm).toBeCloseTo(159.091, 3);
    });

    it("centers the room on the page within the available page area", () => {
      const interior: Interior = {
        room: {
          widthMm: 6000,
          lengthMm: 3500,
        },
        items: [],
      };

      const { pages } = createDocumentPlan(interior);
      const roomPage = pages.find((page) => page.kind === "room");

      if (!roomPage) {
        throw new Error("Expected a room page.");
      }

      expect(roomPage.roomShapePlacement.xMm).toBeCloseTo(12.136, 3);
      expect(roomPage.roomShapePlacement.yMm).toBeCloseTo(25.455, 3);
    });
  });

  describe("item pages", () => {
    const multiPageInterior: Interior = {
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [
        {
          name: "First large item",
          shape: "rectangle",
          widthMm: 5000,
          lengthMm: 3500,
        },
        {
          name: "Second large item",
          shape: "rectangle",
          widthMm: 5000,
          lengthMm: 3500,
        },
        {
          name: "Third large item",
          shape: "rectangle",
          widthMm: 5000,
          lengthMm: 3500,
        },
      ],
    };

    it("includes a calibration-only item page when there are no items", () => {
      const interior: Interior = {
        room: {
          widthMm: 3500,
          lengthMm: 6000,
        },
        items: [],
      };
      const { pages } = createDocumentPlan(interior);
      const pageKinds = pages.map(({ kind }) => kind);
      const itemPage = pages.find((page) => page.kind === "item");

      expect(pageKinds).toEqual(["room", "item"]);
      expect(itemPage).toMatchObject({
        hasCalibrationReference: true,
        cutoutPlacements: [],
      });
    });

    it("places item pages after the room page", () => {
      const { pages } = createDocumentPlan(multiPageInterior);
      const pageKinds = pages.map(({ kind }) => kind);

      expect(pageKinds).toEqual(["room", "item", "item", "item"]);
    });

    it("uses landscape orientation for every item page", () => {
      const { pages } = createDocumentPlan(multiPageInterior);
      const itemPages = pages.filter((page) => page.kind === "item");
      const itemPageOrientations = itemPages.map(({ pageOrientation }) => {
        return pageOrientation;
      });

      expect(itemPageOrientations).toEqual([
        "landscape",
        "landscape",
        "landscape",
      ]);
    });

    it("assigns each cutout to its item page", () => {
      const { pages } = createDocumentPlan(multiPageInterior);
      const itemPages = pages.filter((page) => page.kind === "item");
      const cutoutsByPage = itemPages.map(
        ({ itemPageIndex, cutoutPlacements }) => {
          return {
            itemPageIndex,
            cutoutNames: cutoutPlacements.map(({ name }) => name),
          };
        },
      );

      expect(cutoutsByPage).toEqual([
        {
          itemPageIndex: 0,
          cutoutNames: ["First large item"],
        },
        {
          itemPageIndex: 1,
          cutoutNames: ["Second large item"],
        },
        {
          itemPageIndex: 2,
          cutoutNames: ["Third large item"],
        },
      ]);
    });

    it("marks only the first item page for calibration", () => {
      const { pages } = createDocumentPlan(multiPageInterior);
      const itemPages = pages.filter((page) => page.kind === "item");
      const calibrationSettings = itemPages.map(
        ({ itemPageIndex, hasCalibrationReference }) => {
          return {
            itemPageIndex,
            hasCalibrationReference,
          };
        },
      );

      expect(calibrationSettings).toEqual([
        {
          itemPageIndex: 0,
          hasCalibrationReference: true,
        },
        {
          itemPageIndex: 1,
          hasCalibrationReference: false,
        },
        {
          itemPageIndex: 2,
          hasCalibrationReference: false,
        },
      ]);
    });
  });

  it("uses an item-required scale when an item exceeds the room-only scale", () => {
    const interior: Interior = {
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [
        {
          name: "Large item",
          shape: "rectangle",
          widthMm: 6925,
          lengthMm: 1000,
        },
      ],
    };
    const { scale } = createDocumentPlan(interior);

    expect(scale.scaleDenominator).toBe(25);
  });
});
