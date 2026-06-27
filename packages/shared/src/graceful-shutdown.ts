/**
 * Graceful shutdown helper for Node.js services.
 *
 * Consolidates the duplicated SIGTERM / SIGINT handlers from:
 *   - services/nexus-router/src/index.ts
 *   - (and any other Express service entrypoint)
 *
 * Usage:
 *   import { onShutdown } from "@nyra/shared";
 *   onShutdown(async () => {
 *     server.close();
 *     await redis.disconnect();
 *   });
 */

import { createLogger } from "./logger.js";

const log = createLogger("shutdown");

/**
 * Register a cleanup function that runs on SIGTERM and SIGINT.
 * Multiple calls are supported — handlers execute in registration order.
 */
export function onShutdown(cleanup: () => void | Promise<void>): void {
  const handler = async (signal: string) => {
    log.info(`${signal} received, shutting down gracefully…`);
    try {
      await cleanup();
    } catch (err) {
      log.error("shutdown cleanup error", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    process.exit(0);
  };

  process.once("SIGTERM", () => void handler("SIGTERM"));
  process.once("SIGINT", () => void handler("SIGINT"));
}
