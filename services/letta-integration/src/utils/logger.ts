/**
 * Re-exports the shared Nyra logger for backward compatibility.
 * Previously contained a bespoke Logger class; now delegates to @nyra/shared.
 */
import { createLogger as _createLogger } from "@nyra/shared";
import type { Logger } from "@nyra/shared";

export { type Logger };

export class LoggerCompat {
  private readonly log: Logger;
  constructor(scope: string) {
    this.log = _createLogger(scope);
  }
  debug(message: string, meta?: unknown): void {
    this.log.debug(message, meta != null ? { meta } : undefined);
  }
  info(message: string, meta?: unknown): void {
    this.log.info(message, meta != null ? { meta } : undefined);
  }
  warn(message: string, meta?: unknown): void {
    this.log.warn(message, meta != null ? { meta } : undefined);
  }
  error(message: string, meta?: unknown): void {
    this.log.error(message, meta != null ? { meta } : undefined);
  }
}

/**
 * @deprecated Use `createLogger` from `@nyra/shared` directly for new code.
 */
export { LoggerCompat as Logger };

export { _createLogger as createLogger };
