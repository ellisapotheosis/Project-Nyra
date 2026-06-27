/**
 * Structured JSON logger for all Nyra services.
 *
 * Zero external dependencies — outputs newline-delimited JSON to stdout/stderr
 * so any log collector (Loki, Fluent Bit, CloudWatch) can ingest it as-is.
 *
 * Usage:
 *   import { createLogger } from "@nyra/shared";
 *   const log = createLogger("my-service");
 *   log.info("server started", { port: 3000 });
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function resolveMinLevel(): LogLevel {
  const env = (process.env["LOG_LEVEL"] ?? "").toLowerCase();
  if (env === "debug" || env === "info" || env === "warn" || env === "error") {
    return env;
  }
  return process.env["NODE_ENV"] === "production" ? "info" : "debug";
}

export interface LogEntry {
  level: LogLevel;
  service: string;
  msg: string;
  ts: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(msg: string, meta?: Record<string, unknown> | unknown): void;
  info(msg: string, meta?: Record<string, unknown> | unknown): void;
  warn(msg: string, meta?: Record<string, unknown> | unknown): void;
  error(msg: string, meta?: Record<string, unknown> | unknown): void;
  child(context: Record<string, unknown>): Logger;
}

function normalizeMeta(meta: unknown): Record<string, unknown> {
  if (meta == null) return {};
  if (meta instanceof Error) return { error: meta.message, stack: meta.stack };
  if (typeof meta === "object" && !Array.isArray(meta))
    return meta as Record<string, unknown>;
  return { value: meta };
}

function buildLogger(
  service: string,
  baseContext: Record<string, unknown>,
  minLevel: LogLevel
): Logger {
  function emit(level: LogLevel, msg: string, meta?: unknown): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[minLevel]) return;

    const entry: LogEntry = {
      level,
      service,
      msg,
      ts: new Date().toISOString(),
      ...baseContext,
      ...normalizeMeta(meta),
    };

    const line = JSON.stringify(entry);

    if (level === "error" || level === "warn") {
      process.stderr.write(line + "\n");
    } else {
      process.stdout.write(line + "\n");
    }
  }

  return {
    debug: (msg, meta?) => emit("debug", msg, meta),
    info: (msg, meta?) => emit("info", msg, meta),
    warn: (msg, meta?) => emit("warn", msg, meta),
    error: (msg, meta?) => emit("error", msg, meta),
    child(context) {
      return buildLogger(service, { ...baseContext, ...context }, minLevel);
    },
  };
}

/**
 * Create a structured logger scoped to a service name.
 *
 * ```ts
 * const log = createLogger("nexus-router");
 * log.info("request handled", { method: "POST", duration: 42 });
 * // => {"level":"info","service":"nexus-router","msg":"request handled","ts":"...","method":"POST","duration":42}
 * ```
 */
export function createLogger(service: string): Logger {
  return buildLogger(service, {}, resolveMinLevel());
}
