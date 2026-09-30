import { basename, extname, resolve } from "node:path";

export function deriveInputPathFromArguments(args_: readonly string[]): string {
  if (args_.length !== 1) {
    throw new Error("Usage: npm run generate -- <input.json>");
  }

  return args_[0];
}

export function deriveOutputPath(inputPath: string): string {
  const inputBasename = basename(inputPath);
  const outputBasename = basename(inputBasename, extname(inputBasename));

  return resolve("output", `${outputBasename}.pdf`);
}
