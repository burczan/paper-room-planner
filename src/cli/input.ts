import { readFile } from "node:fs/promises";
import { z } from "zod";
import type { Item, Interior } from "../types/interior.js";

function metresToWholeMillimetres(metres: number): number {
  return Math.round(metres * 1000);
}

function isWholeMillimetres(metres: number): boolean {
  const floatingPointToleranceMm = 1e-9;
  const millimetres = metres * 1000;
  const wholeMillimetres = metresToWholeMillimetres(metres);

  return Math.abs(millimetres - wholeMillimetres) < floatingPointToleranceMm;
}

const MetresDimensionSchema = z.number().positive().refine(isWholeMillimetres, {
  message: "must be representable in whole millimetres",
});

const RoomSchema = z
  .object({
    width: MetresDimensionSchema,
    length: MetresDimensionSchema,
  })
  .strict();

const RectangularItemSchema = z
  .object({
    name: z.string().trim().min(1),
    shape: z.literal("rectangle"),
    width: MetresDimensionSchema,
    length: MetresDimensionSchema,
  })
  .strict();

const ItemSchema = z.discriminatedUnion("shape", [RectangularItemSchema]);

const InteriorInputSchema = z
  .object({
    room: RoomSchema,
    items: z.array(ItemSchema),
  })
  .strict();

export type InteriorInput = z.infer<typeof InteriorInputSchema>;

function normalizeItem(item: InteriorInput["items"][number]): Item {
  switch (item.shape) {
    case "rectangle":
      return {
        name: item.name,
        shape: "rectangle",
        widthMm: metresToWholeMillimetres(item.width),
        lengthMm: metresToWholeMillimetres(item.length),
      };
  }
}

export async function loadInteriorInput(inputPath: string): Promise<Interior> {
  const json: unknown = JSON.parse(await readFile(inputPath, "utf8"));
  const input: InteriorInput = InteriorInputSchema.parse(json);

  return {
    room: {
      widthMm: metresToWholeMillimetres(input.room.width),
      lengthMm: metresToWholeMillimetres(input.room.length),
    },
    items: input.items.map(normalizeItem),
  };
}
