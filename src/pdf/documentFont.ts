import { readFileSync } from "node:fs";
import opentype from "opentype.js";
import type { jsPDF } from "jspdf";
import type { Item } from "../types/interior.js";

const fontName = "NotoSans";
const fontDisplayName = "Noto Sans";
const fontFileName = "NotoSans-Regular.ttf";
const fontUrl = new URL(`../assets/fonts/${fontFileName}`, import.meta.url);

function readDocumentFont(): opentype.Font {
  const fontBuffer = readFileSync(fontUrl);

  return opentype.parse(
    fontBuffer.buffer.slice(
      fontBuffer.byteOffset,
      fontBuffer.byteOffset + fontBuffer.byteLength,
    ),
  );
}

function findUnsupportedCharacters(
  text: string,
  font: opentype.Font,
): string[] {
  const unsupportedCharacters = new Set<string>();

  for (const char of text) {
    if (!font.hasChar(char)) {
      unsupportedCharacters.add(char);
    }
  }

  return [...unsupportedCharacters];
}

export function assertItemNamesSupportedByDocumentFont(
  items: readonly Item[],
): void {
  const font = readDocumentFont();

  for (const item of items) {
    const unsupportedCharacters = findUnsupportedCharacters(item.name, font);

    if (unsupportedCharacters.length > 0) {
      const formattedCharacters = unsupportedCharacters
        .map((character) => JSON.stringify(character))
        .join(", ");

      throw new Error(
        `Item ${JSON.stringify(item.name)} contains characters unsupported by ${fontDisplayName}: ${formattedCharacters}`,
      );
    }
  }
}

export function registerDocumentFont(pdf: jsPDF): void {
  const fontData = readFileSync(fontUrl).toString("base64");

  pdf.addFileToVFS(fontFileName, fontData);
  pdf.addFont(fontFileName, fontName, "normal");
  pdf.setFont(fontName, "normal");
}
