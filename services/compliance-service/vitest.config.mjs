import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "../..");

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@nyra/domain-models": resolve(
        repoRoot,
        "packages/domain-models/src/index.ts"
      ),
      "@nyra/compliance-domain": resolve(
        repoRoot,
        "packages/compliance-domain/src/index.ts"
      ),
    },
  },
});
