import { jsPDF } from "jspdf";
import { describe, expect, it, vi } from "vitest";
import { drawRoomPage } from "./roomRenderer.js";
import type { Interior, RoomPage } from "../types/interior.js";

describe("drawRoomPage()", () => {
  it("draws the room using its page placement", () => {
    const interior: Interior = {
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [],
    };
    const roomPage: RoomPage = {
      kind: "room",
      pageOrientation: "portrait",
      roomShapePlacement: {
        shape: "rectangle",
        xMm: 12,
        yMm: 18,
        widthMm: 170,
        heightMm: 250,
      },
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const rect = vi.spyOn(pdfDocument, "rect");

    drawRoomPage(pdfDocument, interior, roomPage);

    expect(rect).toHaveBeenCalledOnce();
    expect(rect).toHaveBeenCalledWith(12, 18, 170, 250);
  });

  it("renders the real-world room dimensions inside the room", () => {
    const interior: Interior = {
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [],
    };
    const roomPage: RoomPage = {
      kind: "room",
      pageOrientation: "portrait",
      roomShapePlacement: {
        shape: "rectangle",
        xMm: 10,
        yMm: 10,
        widthMm: 190,
        heightMm: 277,
      },
    };
    const pdfDocument = new jsPDF({ unit: "mm" });
    const text = vi.spyOn(pdfDocument, "text");

    drawRoomPage(pdfDocument, interior, roomPage);

    const textCalls = text.mock.calls.map(([content, xMm, yMm]) => ({
      content,
      xMm,
      yMm,
    }));

    expect(textCalls).toEqual([
      {
        content: "Room: 3.5 × 6 m",
        xMm: 14,
        yMm: 18,
      },
    ]);
  });
});
