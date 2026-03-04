/**
 * Core type definitions for the content ingestion pipeline
 */

export type FileType = 'markdown' | 'json' | 'pdf' | 'image' | 'unknown';

export type ProcessingStatus = 'pending' | 'processing' | 'success' | 'error' | 'skipped';

export interface IngestionConfig {
  /** Source directories to scan for content */
  sourceDirs: string[];
  /** Target directory in webapp */
  targetDir: string;
  /** File patterns to include (glob patterns) */
  includePatterns: string[];
  /** File patterns to exclude (glob patterns) */
  excludePatterns: string[];
  /** Whether to run in dry-run mode */
  dryRun: boolean;
  /** Whether to overwrite existing files */
  overwrite: boolean;
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize: number;
  /** Whether to generate manifest file */
  generateManifest: boolean;
  /** Manifest output path */
  manifestPath: string;
  /** Log level */
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface FileMetadata {
  /** Original file path */
  sourcePath: string;
  /** Target file path */
  targetPath: string;
  /** File type */
  fileType: FileType;
  /** File size in bytes */
  size: number;
  /** File hash (for duplicate detection) */
  hash: string;
  /** Last modified timestamp */
  modified: Date;
  /** Processing status */
  status: ProcessingStatus;
  /** Error message if processing failed */
  error?: string;
  /** Additional metadata extracted during processing */
  metadata?: Record<string, any>;
}

export interface ProcessingResult {
  /** Whether processing was successful */
  success: boolean;
  /** File metadata */
  file: FileMetadata;
  /** Processing message */
  message?: string;
  /** Warnings encountered during processing */
  warnings?: string[];
}

export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

export interface ManifestEntry {
  /** File path relative to target directory */
  path: string;
  /** File type */
  type: FileType;
  /** File size in bytes */
  size: number;
  /** File hash */
  hash: string;
  /** Ingestion timestamp */
  ingestedAt: string;
  /** Source path (for reference) */
  source: string;
  /** Extracted metadata */
  metadata?: Record<string, any>;
}

export interface Manifest {
  /** Manifest version */
  version: string;
  /** Generation timestamp */
  generatedAt: string;
  /** Total files ingested */
  totalFiles: number;
  /** Total size in bytes */
  totalSize: number;
  /** Manifest entries */
  entries: ManifestEntry[];
}

export interface ProcessorOptions {
  /** Configuration */
  config: IngestionConfig;
  /** Logger instance */
  logger: Logger;
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
}
