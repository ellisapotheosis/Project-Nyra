/**
 * SQL Injection Prevention
 * Validates SQL queries and parameters
 */

import { createLogger } from '../utils/logger';

const logger = createLogger('SQLValidator');

export class SQLValidator {
  private dangerousPatterns: RegExp[] = [
    /(\bUNION\b.*\bSELECT\b)/gi,
    /(\bSELECT\b.*\bFROM\b.*\bWHERE\b.*\bOR\b.*=.*)/gi,
    /(;.*\b(DROP|DELETE|UPDATE|INSERT)\b)/gi,
    /(\bEXEC\b|\bEXECUTE\b)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bxp_\w+)/gi, // SQL Server extended procedures
    /(\bsp_\w+)/gi, // SQL Server stored procedures
    /(@@\w+)/g, // SQL Server global variables
    /(\b(INFORMATION_SCHEMA|sys\.)\w+)/gi,
    /('\s*OR\s*'?\d+'?\s*=\s*'?\d+'?)/gi, // OR 1=1 pattern
    /('\s*OR\s*'\w+'\s*=\s*'\w+')/gi, // OR 'a'='a' pattern
  ];

  private allowedFunctions: Set<string> = new Set([
    'COUNT',
    'SUM',
    'AVG',
    'MAX',
    'MIN',
    'UPPER',
    'LOWER',
    'TRIM',
    'LENGTH',
    'SUBSTRING',
    'CONCAT',
    'COALESCE',
    'NULLIF',
    'CAST',
    'CONVERT',
  ]);

  validateQuery(query: string): { valid: boolean; reason?: string } {
    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(query)) {
        logger.warn('Dangerous SQL pattern detected', { pattern: pattern.source });
        return {
          valid: false,
          reason: `Dangerous pattern detected: ${pattern.source}`,
        };
      }
    }

    logger.debug('SQL query validated', { query: query.substring(0, 100) });
    return { valid: true };
  }

  validateParameter(param: string | number | boolean | null): { valid: boolean; reason?: string } {
    if (param === null) return { valid: true };
    if (typeof param === 'number' || typeof param === 'boolean') return { valid: true };

    const paramStr = String(param);

    // Check for SQL injection patterns
    if (/[';-]/.test(paramStr)) {
      logger.warn('SQL injection pattern in parameter', { param: paramStr.substring(0, 50) });
      return {
        valid: false,
        reason: 'Parameter contains SQL injection pattern',
      };
    }

    // Check for encoded attacks
    if (/%27|%3B|%2D%2D/.test(paramStr)) {
      logger.warn('Encoded SQL injection pattern', { param: paramStr.substring(0, 50) });
      return {
        valid: false,
        reason: 'Parameter contains encoded SQL pattern',
      };
    }

    return { valid: true };
  }

  escapeParameter(param: string): string {
    // Basic escaping for string parameters
    // NOTE: Always prefer parameterized queries over escaping
    return param
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "''")
      .replace(/"/g, '""')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x00/g, '\\0')
      .replace(/\x1a/g, '\\Z');
  }

  buildParameterizedQuery(template: string, params: Record<string, any>): { query: string; values: any[] } {
    const values: any[] = [];
    let paramIndex = 1;
    const paramMap: Record<string, string> = {};

    // Replace named parameters with positional parameters
    const query = template.replace(/:(\w+)/g, (match, paramName) => {
      if (!(paramName in params)) {
        throw new Error(`Missing parameter: ${paramName}`);
      }

      if (!(paramName in paramMap)) {
        paramMap[paramName] = `$${paramIndex++}`;
        values.push(params[paramName]);
      }

      return paramMap[paramName];
    });

    logger.debug('Built parameterized query', { template, paramCount: values.length });
    return { query, values };
  }

  validateWhereClause(whereClause: string): { valid: boolean; reason?: string } {
    // Ensure WHERE clause doesn't contain dangerous patterns
    const validation = this.validateQuery(`SELECT * FROM table WHERE ${whereClause}`);
    if (!validation.valid) {
      return validation;
    }

    // Check for always-true conditions
    if (/\b(1\s*=\s*1|'a'\s*=\s*'a'|true\s*=\s*true)\b/gi.test(whereClause)) {
      logger.warn('Always-true condition in WHERE clause', { whereClause });
      return {
        valid: false,
        reason: 'WHERE clause contains always-true condition',
      };
    }

    return { valid: true };
  }

  sanitizeTableName(tableName: string): { valid: boolean; sanitized?: string; reason?: string } {
    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      logger.warn('Invalid table name', { tableName });
      return {
        valid: false,
        reason: 'Table name contains invalid characters',
      };
    }

    // Check against reserved words
    const reservedWords = ['SELECT', 'FROM', 'WHERE', 'DROP', 'DELETE', 'UPDATE', 'INSERT', 'EXEC'];
    if (reservedWords.includes(tableName.toUpperCase())) {
      logger.warn('Table name is reserved word', { tableName });
      return {
        valid: false,
        reason: 'Table name is a reserved SQL word',
      };
    }

    return {
      valid: true,
      sanitized: tableName,
    };
  }

  sanitizeColumnName(columnName: string): { valid: boolean; sanitized?: string; reason?: string } {
    // Only allow alphanumeric and underscore
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      logger.warn('Invalid column name', { columnName });
      return {
        valid: false,
        reason: 'Column name contains invalid characters',
      };
    }

    return {
      valid: true,
      sanitized: columnName,
    };
  }
}
