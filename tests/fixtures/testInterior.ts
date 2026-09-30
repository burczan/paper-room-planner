import type { Interior } from "../../src/types/interior.js";

export const testInterior: Interior = {
  room: {
    widthMm: 3500,
    lengthMm: 6000,
  },
  items: [
    {
      name: "Sofa",
      shape: "rectangle",
      widthMm: 2500,
      lengthMm: 1800,
    },
    {
      name: "Desk",
      shape: "rectangle",
      widthMm: 1100,
      lengthMm: 1200,
    },
    {
      name: "Big wardrobe",
      shape: "rectangle",
      widthMm: 3000,
      lengthMm: 650,
    },
    {
      name: "Small wardrobe",
      shape: "rectangle",
      widthMm: 1600,
      lengthMm: 500,
    },
    {
      name: "Table",
      shape: "rectangle",
      widthMm: 1200,
      lengthMm: 600,
    },
  ],
};
