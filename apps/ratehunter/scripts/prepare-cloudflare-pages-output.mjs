import { access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";

const outputDir = join(process.cwd(), ".open-next");
const workerEntry = join(outputDir, "worker.js");
const pagesWorkerEntry = join(outputDir, "_worker.js");

await access(workerEntry, constants.R_OK);
await copyFile(workerEntry, pagesWorkerEntry);

console.log(
  "Prepared Cloudflare Pages advanced-mode worker at .open-next/_worker.js"
);
