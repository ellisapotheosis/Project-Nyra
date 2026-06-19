type LogLevel = "debug" | "info" | "warn" | "error";

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
    const payload = meta === undefined ? "" : ` ${JSON.stringify(meta)}`;
    console[level](`[${this.scope}] ${message}${payload}`);
  }
}
