/**
 * Base processor interface for content ingestion
 */

import { FileType, ProcessingResult, FileMetadata, ProcessorOptions } from '../types';

/**
 * Abstract base class for file processors
 */
export abstract class BaseProcessor {
  protected options: ProcessorOptions;

  constructor(options: ProcessorOptions) {
    this.options = options;
  }

  /**
   * Get the file types this processor can handle
   */
  abstract getSupportedTypes(): FileType[];

  /**
   * Process a file
   */
  abstract process(file: FileMetadata): Promise<ProcessingResult>;

  /**
   * Validate file before processing
   */
  protected async validateFile(file: FileMetadata): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.options.config.maxFileSize) {
      errors.push(
        `File size ${file.size} exceeds maximum ${this.options.config.maxFileSize}`
      );
    }

    // Check if file type is supported
    if (!this.getSupportedTypes().includes(file.fileType)) {
      errors.push(`File type ${file.fileType} not supported by this processor`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Log processing start
   */
  protected logStart(file: FileMetadata): void {
    this.options.logger.info(`Processing ${file.fileType}: ${file.sourcePath}`);
  }

  /**
   * Log processing success
   */
  protected logSuccess(file: FileMetadata): void {
    this.options.logger.info(
      `Successfully processed: ${file.sourcePath} -> ${file.targetPath}`
    );
  }

  /**
   * Log processing error
   */
  protected logError(file: FileMetadata, error: Error): void {
    this.options.logger.error(
      `Failed to process ${file.sourcePath}: ${error.message}`
    );
  }
}

/**
 * Processor registry for managing file processors
 */
export class ProcessorRegistry {
  private processors: Map<FileType, BaseProcessor> = new Map();

  /**
   * Register a processor
   */
  register(processor: BaseProcessor): void {
    for (const type of processor.getSupportedTypes()) {
      this.processors.set(type, processor);
    }
  }

  /**
   * Get processor for file type
   */
  getProcessor(fileType: FileType): BaseProcessor | undefined {
    return this.processors.get(fileType);
  }

  /**
   * Check if a processor exists for file type
   */
  hasProcessor(fileType: FileType): boolean {
    return this.processors.has(fileType);
  }

  /**
   * Get all registered file types
   */
  getSupportedTypes(): FileType[] {
    return Array.from(this.processors.keys());
  }
}
