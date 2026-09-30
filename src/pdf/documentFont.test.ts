import { describe, expect, it, vi } from "vitest";
import { jsPDF } from "jspdf";
import {
  assertItemNamesSupportedByDocumentFont,
  registerDocumentFont,
} from "./documentFont.js";
import type { Item } from "../types/interior.js";

function createItem(name: string): Item {
  return {
    name,
    shape: "rectangle",
    widthMm: 1000,
    lengthMm: 500,
  };
}

describe("assertItemNamesSupportedByDocumentFont()", () => {
  it("does not throw when item names contain characters supported by the document font", () => {
    const items: Item[] = [
      createItem("Łóżko"),
      createItem("Café table"),
      createItem("Καρέκλα"),
      createItem("Стол"),
    ];

    const fn = () => assertItemNamesSupportedByDocumentFont(items);
    expect(fn).not.toThrow();
  });

  it("throws when an item name contains characters unsupported by the document font", () => {
    const items: Item[] = [createItem("家具")];
    const fn = () => assertItemNamesSupportedByDocumentFont(items);

    expect(fn).toThrow(
      'Item "家具" contains characters unsupported by Noto Sans: "家", "具"',
    );
  });

  it("throws when an item name contains an unsupported emoji", () => {
    const items: Item[] = [createItem("Sofa 🛋️")];
    const fn = () => assertItemNamesSupportedByDocumentFont(items);

    expect(fn).toThrow(/Item "Sofa 🛋️"/);
  });
});

describe("registerDocumentFont()", () => {
  it("registers and selects the bundled Noto Sans font", () => {
    const pdf = new jsPDF();

    const addFileToVFSSpy = vi.spyOn(pdf, "addFileToVFS");
    const addFontSpy = vi.spyOn(pdf, "addFont");
    const setFontSpy = vi.spyOn(pdf, "setFont");

    registerDocumentFont(pdf);

    expect(addFileToVFSSpy).toHaveBeenCalledWith(
      "NotoSans-Regular.ttf",
      expect.any(String),
    );
    expect(addFontSpy).toHaveBeenCalledWith(
      "NotoSans-Regular.ttf",
      "NotoSans",
      "normal",
    );
    expect(setFontSpy).toHaveBeenCalledWith("NotoSans", "normal");
  });
});
