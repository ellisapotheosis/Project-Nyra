import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/vitest.setup.ts"],
    include: [
      "tests/unit/agents/agent-coordination.test.ts",
      "tests/unit/database/sync-algorithms/crdt-tests.test.ts",
      "tests/unit/mortgage/dti-calculation.test.ts",
      "tests/unit/mortgage/ltv-calculation.test.ts",
      "tests/unit/nexus-router/routing.test.ts",
      "tests/unit/swarm/regression-suite.test.ts",
      "tests/unit/webapp/api-clients.test.ts",
      "tests/unit/webapp/lead-cockpit.test.ts",
      "tests/unit/webapp/lead-radar-events.test.ts",
      "tests/unit/logic/lead-normalization.test.ts",
      "tests/unit/logic/tcpa-sentinel.test.ts",
      "tests/unit/scripts/lead-lifecycle-smoke.test.ts",
    ],
    exclude: ["node_modules/**", "dist/**", "build/**", ".next/**"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./apps/projectnyra"),
      "@tests": resolve(__dirname, "./tests"),
      "@utils": resolve(__dirname, "./tests/utils"),
      "@nyra/crm-types": resolve(
        __dirname,
        "./packages/crm-types/src/index.ts"
      ),
      "@nyra/domain-models": resolve(
        __dirname,
        "./packages/domain-models/src/index.ts"
      ),
      "@nyra/integration-adapters": resolve(
        __dirname,
        "./packages/integration-adapters/src/index.ts"
      ),
      "@jest/globals": resolve(
        __dirname,
        "./tests/setup/jest-globals-compat.ts"
      ),
    },
  },
};
