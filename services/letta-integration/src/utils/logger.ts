type LogLevel = "debug" | "info" | "warn" | "error";

const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
  /api[_-]?key|authorization|cookie|password|secret|session|token/i;
const SENSITIVE_TEXT_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  /\b\d{3}-?\d{2}-?\d{4}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b(?:api[_-]?key|token|secret|authorization|password)\b\s*[:=]\s*["']?[^"',\s}]+/gi,
];

export function redactForLog(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[REDACTED_DEPTH]";
  if (typeof value === "string") {
    return SENSITIVE_TEXT_PATTERNS.reduce(
      (current, pattern) => current.replace(pattern, REDACTED),
      value
    );
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value == null
  ) {
    return value;
  }
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactForLog(value.message),
      stack: redactForLog(value.stack ?? ""),
    };
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactForLog(entry, depth + 1));
  }
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        SENSITIVE_KEY_PATTERN.test(key)
          ? REDACTED
          : redactForLog(entry, depth + 1),
      ])
    );
  }
  return REDACTED;
}

export class Logger {
  constructor(private readonly scope: string) {}

  debug(message: string, meta?: unknown): void {
    this.log("debug", message, meta);
  }

  info(message: string, meta?: unknown): void {
    this.log("info", message, meta);
  }

  warn(message: string, meta?: unknown): void {
    this.log("warn", message, meta);
  }

  error(message: string, meta?: unknown): void {
    this.log("error", message, meta);
  }

  private log(level: LogLevel, message: string, meta?: unknown): void {
    const safeMessage = redactForLog(message);
    const payload =
      meta === undefined ? "" : ` ${JSON.stringify(redactForLog(meta))}`;
    console[level](`[${this.scope}] ${safeMessage}${payload}`);
  }
}
