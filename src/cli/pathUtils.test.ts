import { describe, expect, it } from "vitest";
import { deriveOutputPath, deriveInputPathFromArguments } from "./pathUtils.js";

describe("deriveInputPathFromArguments()", () => {
  it("accepts exactly one input path", () => {
    const inpuPath = deriveInputPathFromArguments(["room.json"]);
    expect(inpuPath).toBe("room.json");
  });

  it("rejects a missing input path", () => {
    const fn = () => deriveInputPathFromArguments([]);
    expect(fn).toThrow(/Usage:/);
  });

  it("rejects extra positional arguments", () => {
    const fn = () => deriveInputPathFromArguments(["room.json", "extra.json"]);
    expect(fn).toThrow(/Usage:/);
  });
});

describe("deriveOutputPath()", () => {
  it("derives output filename from input filename", () => {
    const outputPath = deriveOutputPath("room.json");
    expect(outputPath).toMatch(/output\/room\.pdf$/);
  });

  it("derives output filenames from file path", () => {
    const outputPath = deriveOutputPath("test/room.json");
    expect(outputPath).toMatch(/output\/room\.pdf$/);
  });
});
