import { execFileSync } from "node:child_process";
import { readdirSync, renameSync } from "node:fs";
import { basename, join } from "node:path";

const examplesDirPath = "examples";
const outputDirPath = "output";
const npmExecutable = process.platform === "win32" ? "npm.cmd" : "npm";

const exampleJsonFileNames = readdirSync(examplesDirPath)
  .filter((fileName) => fileName.endsWith(".json"))
  .sort();

for (const fileName of exampleJsonFileNames) {
  const exampleName = basename(fileName, ".json");
  const inputPath = join(examplesDirPath, fileName);

  execFileSync(npmExecutable, ["run", "generate", "--", inputPath], {
    stdio: "inherit",
  });

  renameSync(
    join(outputDirPath, `${exampleName}.pdf`),
    join(examplesDirPath, `${exampleName}.pdf`),
  );
}
