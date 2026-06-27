/**
 * Re-exports the shared Nyra logger.
 * Previously contained a pino-based logger; now delegates to @nyra/shared.
 */
import { createLogger as _createLogger } from "@nyra/shared";

export const logger = _createLogger("websocket-hub");

export function createLogger(context: string) {
  return _createLogger(`websocket-hub:${context}`);
}
