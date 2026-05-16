import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@nyra/domain-models": resolve("../../packages/domain-models/src/index.ts"),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
