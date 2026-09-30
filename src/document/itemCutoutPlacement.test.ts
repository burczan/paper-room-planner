import { describe, expect, it } from "vitest";
import { createItemCutoutPlacementPlan } from "./itemCutoutPlacement.js";
import type { Item } from "../types/interior.js";

describe("createItemCutoutPlacementPlan()", () => {
  it("scales real-world dimensions using the supplied scale denominator", () => {
    const items: Item[] = [
      {
        name: "Square table",
        shape: "rectangle",
        widthMm: 2500,
        lengthMm: 2500,
      },
    ];

    const { cutoutPlacements } = createItemCutoutPlacementPlan(items, 25);

    const cutoutDimensions = cutoutPlacements.map(({ widthMm, heightMm }) => ({
      widthMm,
      heightMm,
    }));

    expect(cutoutDimensions).toEqual([
      {
        widthMm: 100,
        heightMm: 100,
      },
    ]);
  });

  it("orients the longer cutout side horizontally", () => {
    const items: Item[] = [
      {
        name: "Sofa",
        shape: "rectangle",
        widthMm: 1800,
        lengthMm: 2500,
      },
    ];

    const { cutoutPlacements } = createItemCutoutPlacementPlan(items, 25);

    const cutoutDimensions = cutoutPlacements.map(({ widthMm, heightMm }) => ({
      widthMm,
      heightMm,
    }));

    expect(cutoutDimensions).toEqual([
      {
        widthMm: 100,
        heightMm: 72,
      },
    ]);
  });

  it("carries real-world display dimensions into the placement", () => {
    const items: Item[] = [
      {
        name: "Sofa",
        shape: "rectangle",
        widthMm: 1800,
        lengthMm: 2500,
      },
    ];

    const { cutoutPlacements } = createItemCutoutPlacementPlan(items, 25);
    const cutoutDisplayData = cutoutPlacements.map(
      ({ name, realWorldWidthMm, realWorldLengthMm }) => ({
        name,
        realWorldWidthMm,
        realWorldLengthMm,
      }),
    );

    expect(cutoutDisplayData).toEqual([
      { name: "Sofa", realWorldWidthMm: 1800, realWorldLengthMm: 2500 },
    ]);
  });

  it("creates a placement plan when a cutout exactly fits a regular item page", () => {
    const items: Item[] = [
      {
        name: "Maximum",
        shape: "rectangle",
        widthMm: 277,
        lengthMm: 190,
      },
    ];

    const { cutoutPlacements } = createItemCutoutPlacementPlan(items, 1);

    const cutoutDimensions = cutoutPlacements.map(({ widthMm, heightMm }) => ({
      widthMm,
      heightMm,
    }));

    expect(cutoutDimensions).toEqual([
      {
        widthMm: 277,
        heightMm: 190,
      },
    ]);
  });

  it("throws error when a cutout is wider than a regular item page", () => {
    const items: Item[] = [
      {
        name: "Too wide",
        shape: "rectangle",
        widthMm: 278,
        lengthMm: 190,
      },
    ];

    const createPlacementPlan = () => createItemCutoutPlacementPlan(items, 1);

    expect(createPlacementPlan).toThrow(
      'Item "Too wide" cannot fit on an A4 landscape item page at 1:1.',
    );
  });

  it("throws error when a cutout is taller than a regular item page", () => {
    const items: Item[] = [
      {
        name: "Too tall",
        shape: "rectangle",
        widthMm: 200,
        lengthMm: 191,
      },
    ];

    const createPlacementPlan = () => createItemCutoutPlacementPlan(items, 1);

    expect(createPlacementPlan).toThrow(
      'Item "Too tall" cannot fit on an A4 landscape item page at 1:1.',
    );
  });
});
