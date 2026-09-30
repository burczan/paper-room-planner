import { describe, expect, it, beforeEach, vi } from "vitest";
import { jsPDF } from "jspdf";
import { mkdir, writeFile } from "node:fs/promises";
import { generatePDF } from "./generatePdf.js";
import { drawRoomPage } from "./roomRenderer.js";
import { drawItemPage } from "./itemRenderer.js";
import type { Interior, DocumentPlan } from "../types/interior.js";

const mocks = vi.hoisted(() => {
  const pdf = {
    addPage: vi.fn(),
    addFileToVFS: vi.fn(),
    addFont: vi.fn(),
    setFont: vi.fn(),
    output: vi.fn(),
  };

  return {
    pdf,
    jsPDF: vi.fn(function MockJsPDF() {
      return pdf;
    }),
    drawRoomPage: vi.fn(),
    drawItemPage: vi.fn(),
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  };
});

vi.mock("jspdf", () => ({
  jsPDF: mocks.jsPDF,
}));

vi.mock("./roomRenderer.js", () => ({
  drawRoomPage: mocks.drawRoomPage,
}));

vi.mock("./itemRenderer.js", () => ({
  drawItemPage: mocks.drawItemPage,
}));

vi.mock("node:fs/promises", () => ({
  mkdir: mocks.mkdir,
  writeFile: mocks.writeFile,
}));

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

describe("generatePDF()", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.pdf.output.mockReturnValue(new Uint8Array([1, 2, 3]).buffer);
  });

  it("creates an A4 PDF using the first page orientation", async () => {
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
      ],
    };

    await generatePDF(interior, documentPlan, "output/room.pdf");

    expect(jsPDF).toHaveBeenCalledWith({
      format: "a4",
      orientation: "portrait",
      unit: "mm",
    });
  });

  it("adds subsequent pages using their page orientations", async () => {
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
          cutoutPlacements: [],
        },
        {
          kind: "item",
          pageOrientation: "landscape",
          itemPageIndex: 1,
          hasCalibrationReference: false,
          cutoutPlacements: [],
        },
      ],
    };

    await generatePDF(interior, documentPlan, "output/room.pdf");

    expect(mocks.pdf.addPage).toHaveBeenCalledTimes(2);
    expect(mocks.pdf.addPage).toHaveBeenNthCalledWith(1, "a4", "landscape");
    expect(mocks.pdf.addPage).toHaveBeenNthCalledWith(2, "a4", "landscape");
  });

  it("renders room pages with the room renderer", async () => {
    const roomPage: DocumentPlan["pages"][number] = {
      kind: "room",
      pageOrientation: "portrait",
      roomShapePlacement: {
        shape: "rectangle",
        xMm: 35,
        yMm: 28.5,
        widthMm: 140,
        heightMm: 240,
      },
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
      pages: [roomPage],
    };

    await generatePDF(interior, documentPlan, "output/room.pdf");

    expect(drawRoomPage).toHaveBeenCalledOnce();
    expect(drawRoomPage).toHaveBeenCalledWith(mocks.pdf, interior, roomPage);
  });

  it("renders item pages with the document scale denominator", async () => {
    const itemPage: DocumentPlan["pages"][number] = {
      kind: "item",
      pageOrientation: "landscape",
      itemPageIndex: 0,
      hasCalibrationReference: true,
      cutoutPlacements: [],
    };
    const documentPlan: DocumentPlan = {
      scale: {
        pageOrientation: "landscape",
        scaleDenominator: 22,
        availablePageWidthMm: 277,
        availablePageHeightMm: 190,
        roomWidthOnPageMm: 272.727,
        roomHeightOnPageMm: 159.091,
      },
      pages: [itemPage],
    };

    await generatePDF(interior, documentPlan, "output/room.pdf");

    expect(drawItemPage).toHaveBeenCalledOnce();
    expect(drawItemPage).toHaveBeenCalledWith(mocks.pdf, itemPage, 22);
  });

  it("creates the output directory and writes the generated PDF bytes", async () => {
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
      ],
    };

    await generatePDF(interior, documentPlan, "output/nested/room.pdf");

    expect(mkdir).toHaveBeenCalledWith("output/nested", {
      recursive: true,
    });

    expect(mocks.pdf.output).toHaveBeenCalledWith("arraybuffer");

    const writtenBytes = vi.mocked(writeFile).mock.calls[0][1];

    expect(writtenBytes).toEqual(new Uint8Array([1, 2, 3]));
  });
});
