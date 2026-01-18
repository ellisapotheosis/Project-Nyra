/**
 * Content structure validator
 */

import path from 'path';
import { BaseValidator } from './base';
import { ValidationResult, FileMetadata } from '../types';
import { VALIDATION_RULES } from '../config';
import { fileExists, isSafePath } from '../utils/file-operations';

/**
 * Validates file size, path safety, and content structure
 */
export class ContentValidator extends BaseValidator {
  getName(): string {
    return 'ContentValidator';
  }

  async validate(file: FileMetadata): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate file exists
    const exists = await fileExists(file.sourcePath);
    if (!exists) {
      errors.push(`Source file does not exist: ${file.sourcePath}`);
      return this.error(errors, warnings);
    }

    // Validate file size
    const fileSizeResult = this.validateFileSize(file);
    if (!fileSizeResult.valid) {
      errors.push(...fileSizeResult.errors);
    }
    warnings.push(...fileSizeResult.warnings);

    // Validate path safety
    const pathSafetyResult = this.validatePathSafety(file);
    if (!pathSafetyResult.valid) {
      errors.push(...pathSafetyResult.errors);
    }

    // Validate file extension
    const extensionResult = this.validateExtension(file);
    if (!extensionResult.valid) {
      errors.push(...extensionResult.errors);
    }

    // Validate file naming
    const namingResult = this.validateNaming(file);
    warnings.push(...namingResult.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate file size against limits
   */
  private validateFileSize(file: FileMetadata): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rules = VALIDATION_RULES[file.fileType];
    if (!rules) {
      warnings.push(`No validation rules found for file type: ${file.fileType}`);
      return this.success(warnings);
    }

    if (file.size > rules.maxSize) {
      errors.push(
        `File size ${file.size} bytes exceeds maximum ${rules.maxSize} bytes for ${file.fileType}`
      );
    }

    // Warning for large files
    if (file.size > rules.maxSize * 0.8) {
      warnings.push(
        `File size ${file.size} bytes is approaching the limit of ${rules.maxSize} bytes`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate path safety (prevent directory traversal)
   */
  private validatePathSafety(file: FileMetadata): ValidationResult {
    const errors: string[] = [];

    // Check source path
    if (file.sourcePath.includes('..')) {
      errors.push('Source path contains directory traversal: ..');
    }

    // Check target path
    if (file.targetPath.includes('..')) {
      errors.push('Target path contains directory traversal: ..');
    }

    // Validate target path is within allowed directory
    const targetDir = path.dirname(file.targetPath);
    if (!isSafePath(targetDir, file.targetPath)) {
      errors.push('Target path is outside allowed directory');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate file extension
   */
  private validateExtension(file: FileMetadata): ValidationResult {
    const errors: string[] = [];
    const extension = path.extname(file.sourcePath).toLowerCase();

    const rules = VALIDATION_RULES[file.fileType];
    if (rules && rules.allowedExtensions.length > 0) {
      if (!rules.allowedExtensions.includes(extension)) {
        errors.push(
          `File extension ${extension} not allowed for ${file.fileType}. ` +
          `Allowed: ${rules.allowedExtensions.join(', ')}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate file naming conventions
   */
  private validateNaming(file: FileMetadata): ValidationResult {
    const warnings: string[] = [];
    const filename = path.basename(file.sourcePath);

    // Check for spaces in filename
    if (filename.includes(' ')) {
      warnings.push('Filename contains spaces, consider using hyphens or underscores');
    }

    // Check for special characters
    const specialChars = /[^a-zA-Z0-9._-]/;
    if (specialChars.test(filename)) {
      warnings.push('Filename contains special characters');
    }

    // Check filename length
    if (filename.length > 100) {
      warnings.push('Filename is very long (>100 characters)');
    }

    return this.success(warnings);
  }
}
