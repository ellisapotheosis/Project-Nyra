/**
 * Logging utility for content ingestion pipeline
 */

import { Logger } from '../types';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m'
};

export class ConsoleLogger implements Logger {
  private level: LogLevel;
  private silent: boolean;

  constructor(level: LogLevel = 'info', silent = false) {
    this.level = level;
    this.silent = silent;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.silent) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const formattedArgs = args.length > 0 ? ' ' + JSON.stringify(args) : '';
    return `${COLORS[level]}[${timestamp}] ${levelStr}${COLORS.reset} ${message}${formattedArgs}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, ...args));
    }
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }
}

/**
 * Create a logger instance
 */
export function createLogger(level: LogLevel = 'info', silent = false): Logger {
  return new ConsoleLogger(level, silent);
}
