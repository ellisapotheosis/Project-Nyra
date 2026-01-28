/**
 * Input Validation with Zod
 * Prevents injection attacks and malformed data
 */

import { z } from 'zod';
import { createLogger } from '../utils/logger';

const logger = createLogger('InputValidator');

export class InputValidator {
  private schemas: Map<string, z.ZodSchema> = new Map();

  constructor() {
    this.initializeCommonSchemas();
  }

  private initializeCommonSchemas(): void {
    // Email validation
    this.schemas.set(
      'email',
      z.string().email().max(255).trim().toLowerCase()
    );

    // Username validation (alphanumeric + underscore/hyphen)
    this.schemas.set(
      'username',
      z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .trim()
    );

    // Password validation (strong requirements)
    this.schemas.set(
      'password',
      z
        .string()
        .min(12)
        .max(128)
        .regex(/[A-Z]/, 'Must contain uppercase')
        .regex(/[a-z]/, 'Must contain lowercase')
        .regex(/[0-9]/, 'Must contain number')
        .regex(/[^A-Za-z0-9]/, 'Must contain special character')
    );

    // File path validation (no traversal)
    this.schemas.set(
      'filepath',
      z
        .string()
        .max(1024)
        .refine((path) => !path.includes('..'), 'Path traversal not allowed')
        .refine((path) => !path.startsWith('/'), 'Absolute paths not allowed')
        .refine((path) => !/[<>:"|?*]/.test(path), 'Invalid characters')
    );

    // URL validation
    this.schemas.set(
      'url',
      z
        .string()
        .url()
        .max(2048)
        .refine(
          (url) => {
            const parsed = new URL(url);
            return ['http:', 'https:'].includes(parsed.protocol);
          },
          'Only HTTP(S) URLs allowed'
        )
    );

    // SQL parameter validation (prevent injection)
    this.schemas.set(
      'sql-param',
      z
        .string()
        .max(1000)
        .refine((param) => !/[';-]/.test(param), 'SQL injection pattern detected')
    );

    // Shell command argument validation
    this.schemas.set(
      'shell-arg',
      z
        .string()
        .max(1000)
        .refine((arg) => !/[;&|<>`$()]/.test(arg), 'Shell metacharacters not allowed')
    );

    // JWT token validation
    this.schemas.set(
      'jwt',
      z
        .string()
        .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    );

    // UUID validation
    this.schemas.set(
      'uuid',
      z.string().uuid()
    );

    // Phone number validation (flexible format)
    this.schemas.set(
      'phone',
      z
        .string()
        .regex(/^\+?[1-9]\d{1,14}$/)
        .transform((val) => val.replace(/\D/g, ''))
    );

    // SSN validation (mortgage domain)
    this.schemas.set(
      'ssn',
      z
        .string()
        .regex(/^\d{3}-?\d{2}-?\d{4}$/)
        .transform((val) => val.replace(/-/g, ''))
    );

    // Loan amount validation (mortgage domain)
    this.schemas.set(
      'loan-amount',
      z.number().int().positive().min(1000).max(10000000)
    );

    // Interest rate validation (mortgage domain)
    this.schemas.set(
      'interest-rate',
      z.number().positive().min(0.01).max(30)
    );

    // Credit score validation
    this.schemas.set(
      'credit-score',
      z.number().int().min(300).max(850)
    );
  }

  registerSchema(name: string, schema: z.ZodSchema): void {
    this.schemas.set(name, schema);
    logger.info('Schema registered', { name });
  }

  validate<T>(schemaName: string, data: unknown): { success: boolean; data?: T; errors?: string[] } {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      logger.error('Schema not found', { schemaName });
      return {
        success: false,
        errors: [`Schema '${schemaName}' not found`],
      };
    }

    try {
      const result = schema.parse(data);
      logger.debug('Validation succeeded', { schemaName });
      return {
        success: true,
        data: result as T,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`);
        logger.warn('Validation failed', { schemaName, errors });
        return {
          success: false,
          errors,
        };
      }

      logger.error('Validation error', { schemaName, error });
      return {
        success: false,
        errors: ['Validation error'],
      };
    }
  }

  sanitizeString(input: string): string {
    // Basic XSS prevention
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  validateMultiple(validations: Array<{ schema: string; data: unknown }>): boolean {
    return validations.every(({ schema, data }) => this.validate(schema, data).success);
  }
}
