import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDocumentPlan } from "../../src/document/documentPlan.js";
import { generatePDF } from "../../src/pdf/generatePdf.js";
import type { Interior, DocumentPlan } from "../../src/types/interior.js";

const interior: Interior = {
  room: {
    widthMm: 3500,
    lengthMm: 6000,
  },
  items: [
    {
      name: "Desk",
      shape: "rectangle",
      widthMm: 1200,
      lengthMm: 600,
    },
  ],
};

const documentPlan: DocumentPlan = {
  scale: {
    pageOrientation: "portrait",
    scaleDenominator: 25,
    availablePageWidthMm: 190,
    availablePageHeightMm: 277,
    roomWidthOnPageMm: 140,
    roomHeightOnPageMm: 240,
  },
  pages: [
    {
      kind: "room",
      pageOrientation: "portrait",
      roomShapePlacement: {
        shape: "rectangle",
        xMm: 35,
        yMm: 28.5,
        widthMm: 140,
        heightMm: 240,
      },
    },
    {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 0,
      hasCalibrationReference: true,
      cutoutPlacements: [
        {
          name: "Desk",
          realWorldWidthMm: 1200,
          realWorldLengthMm: 600,
          pageIndex: 0,
          xMm: 10,
          yMm: 10,
          widthMm: 48,
          heightMm: 24,
        },
      ],
    },
  ],
};

describe("generatePDF() integration", () => {
  let tmpDirPath: string;

  beforeEach(async () => {
    tmpDirPath = await mkdtemp(join(tmpdir(), "paper-room-planner-"));
  });

  afterEach(async () => {
    await rm(tmpDirPath, {
      force: true,
      recursive: true,
    });
  });

  it("generates a PDF at the requested output path", async () => {
    const outputPath = join(tmpDirPath, "room.pdf");

    await generatePDF(interior, documentPlan, outputPath);

    const pdfBytes = await readFile(outputPath);
    const pdfHeader = pdfBytes.subarray(0, 5).toString("ascii");

    expect(pdfHeader).toBe("%PDF-");
  });

  it("throws before writing a PDF when an item name contains unsupported characters", async () => {
    const invalidInterior: Interior = {
      ...interior,
      items: [
        {
          ...interior.items[0],
          name: "家具",
        },
      ],
    };
    const documentPlan = createDocumentPlan(invalidInterior);
    const outputPath = join(tmpDirPath, "unsupported.pdf");

    const result = generatePDF(invalidInterior, documentPlan, outputPath);

    await expect(result).rejects.toThrow(
      'Item "家具" contains characters unsupported by Noto Sans: "家", "具"',
    );
    expect(existsSync(outputPath)).toBe(false);
  });

  it("creates missing parent directories before generating the PDF", async () => {
    const outputPath = join(tmpDirPath, "nested", "output", "room.pdf");

    await generatePDF(interior, documentPlan, outputPath);

    const pdfBytes = await readFile(outputPath);
    const pdfHeader = pdfBytes.subarray(0, 5).toString("ascii");

    expect(pdfHeader).toBe("%PDF-");
  });

  it("generates a PDF for a room with no item", async () => {
    const interior: Interior = {
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [],
    };
    const documentPlan = createDocumentPlan(interior);
    const outputPath = join(tmpDirPath, "room-only.pdf");

    await generatePDF(interior, documentPlan, outputPath);

    const pdfBytes = await readFile(outputPath);
    const pdfHeader = pdfBytes.subarray(0, 5).toString("ascii");

    expect(pdfHeader).toBe("%PDF-");
  });

  it("generates a PDF when an item requires a larger common scale", async () => {
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
    const documentPlan = createDocumentPlan(interior);
    const outputPath = join(tmpDirPath, "item-driven-scale.pdf");

    await generatePDF(interior, documentPlan, outputPath);

    const pdfBytes = await readFile(outputPath);
    const pdfHeader = pdfBytes.subarray(0, 5).toString("ascii");

    expect(pdfHeader).toBe("%PDF-");
  });
});
