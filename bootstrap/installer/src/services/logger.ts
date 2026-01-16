import { LogEntry } from '../types/manifest';

export type LogLevel = 'info' | 'warn' | 'error' | 'success';

export interface LoggerOptions {
  component?: string;
  silent?: boolean;
  onLog?: (entry: LogEntry) => void;
}

/**
 * Structured logging service for the installer
 */
export class Logger {
  private component?: string;
  private silent: boolean;
  private onLog?: (entry: LogEntry) => void;

  constructor(options: LoggerOptions = {}) {
    this.component = options.component;
    this.silent = options.silent || false;
    this.onLog = options.onLog;
  }

  /**
   * Log an info message
   */
  info(message: string, details?: string): LogEntry {
    return this.log('info', message, details);
  }

  /**
   * Log a warning message
   */
  warn(message: string, details?: string): LogEntry {
    return this.log('warn', message, details);
  }

  /**
   * Log an error message
   */
  error(message: string, details?: string): LogEntry {
    return this.log('error', message, details);
  }

  /**
   * Log a success message
   */
  success(message: string, details?: string): LogEntry {
    return this.log('success', message, details);
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, details?: string): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      component: this.component,
      details,
    };

    // Console output if not silent
    if (!this.silent) {
      const prefix = this.component ? `[${this.component}]` : '';
      const timestamp = entry.timestamp.toISOString();
      const detailsStr = details ? `\n  ${details}` : '';

      switch (level) {
        case 'info':
          console.log(`ℹ️ ${timestamp} ${prefix} ${message}${detailsStr}`);
          break;
        case 'warn':
          console.warn(`⚠️ ${timestamp} ${prefix} ${message}${detailsStr}`);
          break;
        case 'error':
          console.error(`❌ ${timestamp} ${prefix} ${message}${detailsStr}`);
          break;
        case 'success':
          console.log(`✅ ${timestamp} ${prefix} ${message}${detailsStr}`);
          break;
      }
    }

    // Call callback if provided
    if (this.onLog) {
      this.onLog(entry);
    }

    return entry;
  }

  /**
   * Create a child logger with a specific component name
   */
  child(component: string): Logger {
    return new Logger({
      component,
      silent: this.silent,
      onLog: this.onLog,
    });
  }

  /**
   * Log a command execution
   */
  command(command: string, cwd?: string): LogEntry {
    const details = cwd ? `Working directory: ${cwd}` : undefined;
    return this.info(`Executing: ${command}`, details);
  }

  /**
   * Log a file operation
   */
  file(operation: string, filePath: string): LogEntry {
    return this.info(`${operation}: ${filePath}`);
  }

  /**
   * Log a step in the installation process
   */
  step(stepNumber: number, totalSteps: number, description: string): LogEntry {
    return this.info(`[${stepNumber}/${totalSteps}] ${description}`);
  }
}

/**
 * Create a logger instance
 */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}

/**
 * Default logger instance for global use
 */
export const defaultLogger = createLogger();
