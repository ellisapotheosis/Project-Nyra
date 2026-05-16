/**
 * Audit Logger Service - File-based audit logging for MCP operations
 *
 * Logs all sensitive operations (especially GitHub write operations) to a dedicated audit log file
 * with optional sensitive data redaction for compliance and security.
 */

import fs from 'fs';
import path from 'path';
import { createLogger } from '../utils/logger';
import { config } from '../config';

const logger = createLogger('audit-logger');

export interface AuditLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  operation: string;
  tool: string;
  status: 'success' | 'failure';
  clientId?: string;
  arguments?: Record<string, unknown>;
  result?: unknown;
  errorMessage?: string;
  duration?: number; // milliseconds
}

export class AuditLogger {
  private static instance: AuditLogger;
  private logPath: string;
  private enabled: boolean;
  private redactSecrets: boolean;
  private writeStream: fs.WriteStream | null = null;

  private constructor() {
    this.enabled = config.mcp.auditLogging.enabled;
    this.logPath = config.mcp.auditLogging.logPath;
    this.redactSecrets = config.mcp.auditLogging.redactSecrets;

    if (this.enabled) {
      this.initializeLogFile();
    }
  }

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  /**
   * Initialize audit log file and stream
   */
  private initializeLogFile(): void {
    try {
      // Ensure log directory exists
      const logDir = path.dirname(this.logPath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Create or append to log file
      this.writeStream = fs.createWriteStream(this.logPath, { flags: 'a' });

      // Write log header if file is empty
      const stats = fs.statSync(this.logPath);
      if (stats.size === 0) {
        const header = `# Nexus Router MCP Audit Log
# Started: ${new Date().toISOString()}
# Format: JSON Lines (one entry per line)
---
`;
        this.writeStream.write(header);
      }

      logger.info(`Audit logging enabled: ${this.logPath}`);
    } catch (error) {
      logger.error('Failed to initialize audit log file:', error);
      this.enabled = false;
    }
  }

  /**
   * Log GitHub write operation
   */
  public logGitHubWrite(entry: AuditLogEntry): void {
    if (!this.enabled) return;

    const auditEntry: AuditLogEntry = {
      ...entry,
      level: entry.level || 'INFO',
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    // Redact sensitive data if enabled
    if (this.redactSecrets && auditEntry.arguments) {
      auditEntry.arguments = this.redactSensitiveData(auditEntry.arguments);
    }

    this.writeLog(auditEntry);
  }

  /**
   * Log tool call (success or failure)
   */
  public logToolCall(
    tool: string,
    arguments_: Record<string, unknown>,
    success: boolean,
    result?: unknown,
    errorMessage?: string,
    duration?: number,
    clientId?: string
  ): void {
    if (!this.enabled) return;

    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      level: success ? 'INFO' : 'ERROR',
      operation: 'tool_call',
      tool,
      status: success ? 'success' : 'failure',
      clientId,
      arguments: arguments_,
      result: result && typeof result === 'object' ? this.truncateResult(result) : result,
      errorMessage,
      duration,
    };

    this.logGitHubWrite(entry);
  }

  /**
   * Redact sensitive data from parameters
   */
  private redactSensitiveData(params: Record<string, unknown>): Record<string, unknown> {
    const redacted = { ...params };
    const sensitiveKeys = [
      'token',
      'password',
      'secret',
      'auth',
      'key',
      'apiKey',
      'api_key',
      'authorization',
      'bearer',
      'credential',
      'credentials',
    ];

    const redactValue = (value: any): any => {
      if (typeof value === 'string' && value.length > 0) {
        // Keep first 4 and last 4 chars for tokens, redact middle
        if (value.length > 8) {
          return `${value.slice(0, 4)}...[REDACTED]...${value.slice(-4)}`;
        }
        return '[REDACTED]';
      }
      if (typeof value === 'object' && value !== null) {
        return Array.isArray(value) ? value.map(redactValue) : this.redactObject(value);
      }
      return value;
    };

    for (const [key, value] of Object.entries(redacted)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        redacted[key] = redactValue(value);
      }
    }

    return redacted;
  }

  /**
   * Recursively redact object fields
   */
  private redactObject(obj: any): any {
    const result: any = {};
    const sensitiveKeys = [
      'token',
      'password',
      'secret',
      'auth',
      'key',
      'apiKey',
      'api_key',
      'authorization',
      'bearer',
      'credential',
      'credentials',
    ];

    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        result[key] = typeof value === 'string' ? '[REDACTED]' : value;
      } else if (typeof value === 'object' && value !== null) {
        result[key] = Array.isArray(value) ? value : this.redactObject(value);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Truncate large result objects for audit log (keep first 500 chars)
   */
  private truncateResult(result: any): any {
    const str = JSON.stringify(result);
    if (str.length > 500) {
      return JSON.parse(str.slice(0, 500) + '...[TRUNCATED]');
    }
    return result;
  }

  /**
   * Write log entry to file
   */
  private writeLog(entry: AuditLogEntry): void {
    if (!this.writeStream) {
      logger.warn('Write stream not initialized, cannot log audit entry');
      return;
    }

    try {
      const logLine = JSON.stringify(entry) + '\n';
      this.writeStream.write(logLine);
    } catch (error) {
      logger.error('Failed to write audit log entry:', error);
    }
  }

  /**
   * Close audit log file
   */
  public close(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
      logger.info('Audit log closed');
    }
  }

  /**
   * Get audit log path (for monitoring/rotation)
   */
  public getLogPath(): string {
    return this.logPath;
  }

  /**
   * Check if audit logging is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();
