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
    this.log.debug(message, meta);
  }
  info(message: string, meta?: unknown): void {
    this.log.info(message, meta);
  }
  warn(message: string, meta?: unknown): void {
    this.log.warn(message, meta);
  }
  error(message: string, meta?: unknown): void {
    this.log.error(message, meta);
  }
}

/**
 * @deprecated Use `createLogger` from `@nyra/shared` directly for new code.
 */
export { LoggerCompat as Logger };

export { _createLogger as createLogger };
