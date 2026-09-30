import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { ZodError } from "zod";
import { describe, expect, it } from "vitest";
import { testInterior } from "../../tests/fixtures/testInterior.js";
import { loadInteriorInput, type InteriorInput } from "./input.js";

async function loadInput(input: unknown) {
  const directoryPath = await mkdtemp(join(tmpdir(), "test-"));
  const inputPath = join(directoryPath, "input.json");

  try {
    await writeFile(inputPath, JSON.stringify(input));
    return await loadInteriorInput(inputPath);
  } finally {
    await rm(directoryPath, { force: true, recursive: true });
  }
}

const input: InteriorInput = {
  room: {
    width: 3.5,
    length: 6,
  },
  items: [
    {
      name: "Shelf",
      shape: "rectangle",
      width: 1.2,
      length: 0.35,
    },
  ],
};

describe("loadInteriorInput()", () => {
  it("parses the input json file", async () => {
    const result = loadInteriorInput("tests/fixtures/testInput.json");

    await expect(result).resolves.toEqual(testInterior);
  });

  it("converts whole-millimetre metre value", async () => {
    const result = loadInput(input);

    await expect(result).resolves.toEqual({
      room: {
        widthMm: 3500,
        lengthMm: 6000,
      },
      items: [
        {
          name: "Shelf",
          shape: "rectangle",
          widthMm: 1200,
          lengthMm: 350,
        },
      ],
    });
  });

  it("throws error if value cannot be represented in whole millimetres", async () => {
    const invalidInput: InteriorInput = {
      ...input,
      room: {
        ...input.room,
        width: 3.5005,
      },
    };
    const result = loadInput(invalidInput);

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws error for an unsupported item shape", async () => {
    const invalidInput = {
      ...input,
      items: [
        {
          ...input.items[0],
          shape: "circle",
        },
      ],
    };
    const result = loadInput(invalidInput);

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws error for unknown property in an otherwise valid input", async () => {
    const invalidInput = {
      ...input,
      unknownProperty: true,
    };
    const result = loadInput(invalidInput);

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws error for input with a missing room width", async () => {
    const invalidInput = {
      ...input,
      room: {
        length: 6,
      },
    };
    const result = loadInput(invalidInput);

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws error for input with a missing room length", async () => {
    const invalidInput = {
      ...input,
      room: {
        width: 3.5,
      },
    };
    const result = loadInput(invalidInput);

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws when an item name is empty", async () => {
    const result = loadInput({
      ...input,
      items: [
        {
          ...input.items[0],
          name: "",
        },
      ],
    });

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("throws when an item name contains only whitespace", async () => {
    const result = loadInput({
      ...input,
      items: [
        {
          ...input.items[0],
          name: " \t ",
        },
      ],
    });

    await expect(result).rejects.toBeInstanceOf(ZodError);
  });

  it("trims leading and trailing whitespace from an item name", async () => {
    const result = loadInput({
      ...input,
      items: [
        {
          ...input.items[0],
          name: "  Shelf  ",
        },
      ],
    });

    await expect(result).resolves.toMatchObject({
      items: [
        {
          name: "Shelf",
        },
      ],
    });
  });

  it("accepts input with no items", async () => {
    const validInput: InteriorInput = {
      room: input.room,
      items: [],
    };
    const result = loadInput(validInput);

    await expect(result).resolves.toMatchObject({
      items: [],
    });
  });
});
