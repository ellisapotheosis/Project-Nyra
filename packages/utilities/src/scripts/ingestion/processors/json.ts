/**
 * JSON file processor
 */

import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { readFileContent, copyFile } from '../utils/file-operations';

/**
 * JSON processor
 */
export class JsonProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['json'];
  }

  async process(file: FileMetadata): Promise<ProcessingResult> {
    this.logStart(file);

    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        file.status = 'error';
        file.error = validation.errors.join(', ');
        return {
          success: false,
          file,
          message: file.error
        };
      }

      // Read and parse JSON
      const content = await readFileContent(file.sourcePath);
      let jsonData: any;

      try {
        jsonData = JSON.parse(content);
      } catch (parseError) {
        file.status = 'error';
        file.error = `Invalid JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`;
        return {
          success: false,
          file,
          message: file.error
        };
      }

      // Extract metadata
      file.metadata = {
        schema: this.detectSchema(jsonData),
        keys: Object.keys(jsonData),
        depth: this.calculateDepth(jsonData),
        hasArrays: this.hasArrays(jsonData),
        itemCount: Array.isArray(jsonData) ? jsonData.length : Object.keys(jsonData).length
      };

      // Copy file to target (in dry-run, we skip the actual copy)
      if (!this.options.config.dryRun) {
        await copyFile(file.sourcePath, file.targetPath, this.options.logger);
      }

      file.status = 'success';
      this.logSuccess(file);

      return {
        success: true,
        file,
        message: 'JSON file processed successfully'
      };
    } catch (error) {
      file.status = 'error';
      file.error = error instanceof Error ? error.message : 'Unknown error';
      this.logError(file, error as Error);

      return {
        success: false,
        file,
        message: file.error
      };
    }
  }

  /**
   * Detect JSON schema type
   */
  private detectSchema(data: any): string {
    if (Array.isArray(data)) {
      return 'array';
    } else if (typeof data === 'object' && data !== null) {
      return 'object';
    }
    return 'primitive';
  }

  /**
   * Calculate object depth
   */
  private calculateDepth(obj: any, currentDepth = 1): number {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth;
    }

    const depths = Object.values(obj).map(value =>
      this.calculateDepth(value, currentDepth + 1)
    );

    return Math.max(currentDepth, ...depths);
  }

  /**
   * Check if JSON contains arrays
   */
  private hasArrays(obj: any): boolean {
    if (Array.isArray(obj)) {
      return true;
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => this.hasArrays(value));
    }

    return false;
  }
}
