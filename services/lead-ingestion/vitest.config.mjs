import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@nyra/domain-models": new URL("../../packages/domain-models/src/index.ts", import.meta.url).pathname,
      "@nyra/integration-adapters": new URL("../../packages/integration-adapters/src/index.ts", import.meta.url).pathname,
    },
  },
});
