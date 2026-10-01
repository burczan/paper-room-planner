import { cp } from "node:fs/promises";

await cp("src/assets", "dist/assets", { recursive: true });
