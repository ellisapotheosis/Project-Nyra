/**
 * Base validator interface for content validation
 */

import { ValidationResult, FileMetadata } from '../types';

/**
 * Abstract base class for content validators
 */
export abstract class BaseValidator {
  /**
   * Validate file metadata and content
   */
  abstract validate(file: FileMetadata): Promise<ValidationResult>;

  /**
   * Get validator name
   */
  abstract getName(): string;

  /**
   * Combine validation results
   */
  protected combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let valid = true;

    for (const result of results) {
      if (!result.valid) {
        valid = false;
      }
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      valid,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Create success result
   */
  protected success(warnings: string[] = []): ValidationResult {
    return {
      valid: true,
      errors: [],
      warnings
    };
  }

  /**
   * Create error result
   */
  protected error(errors: string[], warnings: string[] = []): ValidationResult {
    return {
      valid: false,
      errors,
      warnings
    };
  }
}

/**
 * Validator registry for managing validators
 */
export class ValidatorRegistry {
  private validators: BaseValidator[] = [];

  /**
   * Register a validator
   */
  register(validator: BaseValidator): void {
    this.validators.push(validator);
  }

  /**
   * Run all validators on a file
   */
  async validateAll(file: FileMetadata): Promise<ValidationResult> {
    const results: ValidationResult[] = [];

    for (const validator of this.validators) {
      const result = await validator.validate(file);
      results.push(result);
    }

    return this.combineResults(...results);
  }

  /**
   * Combine multiple validation results
   */
  private combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];
    let valid = true;

    for (const result of results) {
      if (!result.valid) {
        valid = false;
      }
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      valid,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Get all registered validators
   */
  getValidators(): BaseValidator[] {
    return this.validators;
  }
}
