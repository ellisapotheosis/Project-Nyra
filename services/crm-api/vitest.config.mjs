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
      "@nyra/crm-client": resolve(repoRoot, "packages/crm-client/src/index.ts"),
      "@nyra/crm-types": resolve(repoRoot, "packages/crm-types/src/index.ts"),
      "@nyra/integration-adapters": resolve(
        repoRoot,
        "packages/integration-adapters/src/index.ts"
      ),
    },
  },
});
