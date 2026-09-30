import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { jsPDF } from "jspdf";
import {
  assertItemNamesSupportedByDocumentFont,
  registerDocumentFont,
} from "./documentFont.js";
import { drawItemPage } from "./itemRenderer.js";
import { drawRoomPage } from "./roomRenderer.js";
import type { DocumentPlan, Interior } from "../types/interior.js";

export async function generatePDF(
  interior: Interior,
  documentPlan: DocumentPlan,
  outputPath: string,
): Promise<void> {
  assertItemNamesSupportedByDocumentFont(interior.items);

  const firstPage = documentPlan.pages[0];
  // https://parallax.github.io/jsPDF/docs/jsPDF.html
  const pdf = new jsPDF({
    format: "a4",
    orientation: firstPage.pageOrientation,
    unit: "mm",
  });
  registerDocumentFont(pdf);

  for (const [pageIndex, page] of documentPlan.pages.entries()) {
    if (pageIndex > 0) {
      pdf.addPage("a4", page.pageOrientation);
    }

    if (page.kind === "room") {
      drawRoomPage(pdf, interior, page);
    } else if (page.kind === "item") {
      drawItemPage(pdf, page, documentPlan.scale.scaleDenominator);
    }
  }

  await mkdir(dirname(outputPath), {
    recursive: true,
  });
  await writeFile(outputPath, new Uint8Array(pdf.output("arraybuffer")));
}
