import { ZodError } from "zod";
import { createDocumentPlan } from "../document/documentPlan.js";
import { generatePDF } from "../pdf/generatePdf.js";
import { deriveOutputPath, deriveInputPathFromArguments } from "./pathUtils.js";
import { loadInteriorInput } from "./input.js";

function reportInputError(error: unknown): string {
  if (error instanceof SyntaxError) {
    return `Invalid JSON: ${error.message}`;
  }

  if (error instanceof ZodError) {
    const issues = error.issues
      .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
      .join("\n");

    return `Invalid input:\n${issues}`;
  }

  if (error instanceof Error) {
    return `Could not read input file: ${error.message}`;
  }

  return "Could not read input file.";
}

async function main(): Promise<void> {
  let inputPath: string;

  try {
    inputPath = deriveInputPathFromArguments(process.argv.slice(2));
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : "Invalid arguments.",
    );
    process.exitCode = 1;
    return;
  }

  let interior;
  try {
    interior = await loadInteriorInput(inputPath);
  } catch (error) {
    console.error(reportInputError(error));
    process.exitCode = 1;
    return;
  }

  let documentPlan;
  try {
    documentPlan = createDocumentPlan(interior);
  } catch (error) {
    console.error(
      `Could not create item placement plan: ${
        error instanceof Error ? error.message : "unknown error"
      }`,
    );
    process.exitCode = 1;
    return;
  }

  const outputPath = deriveOutputPath(inputPath);
  try {
    await generatePDF(interior, documentPlan, outputPath);
  } catch (error) {
    console.error(
      `Could not write output PDF: ${error instanceof Error ? error.message : "unknown error"}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Wrote ${outputPath}`);
}

await main();
