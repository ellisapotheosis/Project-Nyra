import pino from "pino";
import { config } from "../config";

const REDACTED_KEYS = [
  "authorization",
  "cookie",
  "password",
  "apiKey",
  "api_key",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "*.authorization",
  "*.cookie",
  "*.password",
  "*.apiKey",
  "*.api_key",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.secret",
];

export const logger = pino({
  level: config.logLevel,
  redact: {
    paths: REDACTED_KEYS,
    censor: "[REDACTED]",
  },
  transport:
    config.nodeEnv === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
  base: {
    service: "websocket-hub",
    env: config.nodeEnv,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function createLogger(context: string) {
  return logger.child({ context });
}
