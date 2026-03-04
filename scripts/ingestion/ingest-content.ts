#!/usr/bin/env node
/**
 * Content Ingestion Pipeline - Main Script
 *
 * Scans source directories for content files, processes them based on type,
 * validates content structure, and moves them to appropriate webapp locations.
 *
 * Usage:
 *   node ingest-content.ts --source ./content --dry-run
 *   node ingest-content.ts --source ./docs --source ./assets --target ./apps/webapp/public/content
 */

import path from 'path';
import { Command } from 'commander';
import {
  IngestionConfig,
  FileMetadata,
  FileType,
  ProcessingResult
} from './types';
import {
  DEFAULT_CONFIG,
  FILE_TYPE_MAP,
  TARGET_STRUCTURE,
  mergeConfig,
  validateConfig
} from './config';
import { createLogger } from './utils/logger';
import {
  scanFiles,
  calculateFileHash,
  getFileStats,
  getFileExtension,
  ensureDir
} from './utils/file-operations';
import { createManifest, saveManifest, getManifestSummary } from './utils/manifest';
import { createProcessorRegistry } from './processors';
import { createValidatorRegistry } from './validators';

/**
 * Main ingestion pipeline
 */
class IngestionPipeline {
  private config: IngestionConfig;
  private logger;
  private processorRegistry;
  private validatorRegistry;

  constructor(config: Partial<IngestionConfig>) {
    this.config = mergeConfig(DEFAULT_CONFIG, config);
    this.logger = createLogger(this.config.logLevel, false);
    this.processorRegistry = createProcessorRegistry({
      config: this.config,
      logger: this.logger
    });
    this.validatorRegistry = createValidatorRegistry();
  }

  /**
   * Run the ingestion pipeline
   */
  async run(): Promise<void> {
    this.logger.info('Starting content ingestion pipeline...');
    this.logger.info(`Dry run mode: ${this.config.dryRun ? 'ENABLED' : 'DISABLED'}`);

    // Validate configuration
    const configValidation = validateConfig(this.config);
    if (!configValidation.valid) {
      this.logger.error('Configuration validation failed:');
      configValidation.errors.forEach(error => this.logger.error(`  - ${error}`));
      process.exit(1);
    }

    // Ensure target directory exists
    if (!this.config.dryRun) {
      await ensureDir(this.config.targetDir);
    }

    // Scan and process files
    const allFiles: FileMetadata[] = [];

    for (const sourceDir of this.config.sourceDirs) {
      this.logger.info(`Scanning source directory: ${sourceDir}`);
      const files = await this.scanDirectory(sourceDir);
      allFiles.push(...files);
    }

    this.logger.info(`Found ${allFiles.length} files to process`);

    // Process files
    const results = await this.processFiles(allFiles);

    // Generate manifest
    if (this.config.generateManifest) {
      await this.generateManifest(allFiles);
    }

    // Print summary
    this.printSummary(results);
  }

  /**
   * Scan directory for files
   */
  private async scanDirectory(sourceDir: string): Promise<FileMetadata[]> {
    const filePaths = await scanFiles(
      sourceDir,
      this.config.includePatterns,
      this.config.excludePatterns,
      this.logger
    );

    const files: FileMetadata[] = [];

    for (const filePath of filePaths) {
      try {
        const fileType = this.detectFileType(filePath);
        const stats = await getFileStats(filePath);
        const hash = await calculateFileHash(filePath);
        const targetPath = this.calculateTargetPath(filePath, fileType);

        const file: FileMetadata = {
          sourcePath: filePath,
          targetPath,
          fileType,
          size: stats.size,
          hash,
          modified: stats.mtime,
          status: 'pending'
        };

        files.push(file);
      } catch (error) {
        this.logger.error(`Failed to process file ${filePath}: ${error}`);
      }
    }

    return files;
  }

  /**
   * Detect file type from extension
   */
  private detectFileType(filePath: string): FileType {
    const extension = getFileExtension(filePath);
    return (FILE_TYPE_MAP[extension] as FileType) || 'unknown';
  }

  /**
   * Calculate target path based on file type
   */
  private calculateTargetPath(sourcePath: string, fileType: FileType): string {
    const filename = path.basename(sourcePath);
    const typeDir = TARGET_STRUCTURE[fileType] || 'other';
    return path.join(this.config.targetDir, typeDir, filename);
  }

  /**
   * Process all files
   */
  private async processFiles(files: FileMetadata[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const file of files) {
      // Validate file
      const validation = await this.validatorRegistry.validateAll(file);

      if (!validation.valid) {
        this.logger.error(`Validation failed for ${file.sourcePath}:`);
        validation.errors.forEach(error => this.logger.error(`  - ${error}`));
        file.status = 'error';
        file.error = validation.errors.join(', ');
        results.push({
          success: false,
          file,
          message: 'Validation failed',
          warnings: validation.warnings
        });
        continue;
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach(warning =>
          this.logger.warn(`${file.sourcePath}: ${warning}`)
        );
      }

      // Process file
      const processor = this.processorRegistry.getProcessor(file.fileType);

      if (!processor) {
        this.logger.warn(`No processor found for file type: ${file.fileType}`);
        file.status = 'skipped';
        results.push({
          success: false,
          file,
          message: 'No processor available'
        });
        continue;
      }

      const result = await processor.process(file);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate manifest file
   */
  private async generateManifest(files: FileMetadata[]): Promise<void> {
    this.logger.info('Generating manifest...');

    const manifest = createManifest(files, this.config.targetDir);

    if (!this.config.dryRun) {
      await saveManifest(manifest, this.config.manifestPath);
      this.logger.info(`Manifest saved to: ${this.config.manifestPath}`);
    }

    this.logger.info(getManifestSummary(manifest));
  }

  /**
   * Print summary of results
   */
  private printSummary(results: ProcessingResult[]): void {
    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success && r.file.status === 'error').length,
      skipped: results.filter(r => !r.success && r.file.status === 'skipped').length
    };

    this.logger.info('');
    this.logger.info('='.repeat(50));
    this.logger.info('INGESTION SUMMARY');
    this.logger.info('='.repeat(50));
    this.logger.info(`Total files:     ${summary.total}`);
    this.logger.info(`Successful:      ${summary.success}`);
    this.logger.info(`Failed:          ${summary.failed}`);
    this.logger.info(`Skipped:         ${summary.skipped}`);
    this.logger.info('='.repeat(50));

    if (this.config.dryRun) {
      this.logger.info('');
      this.logger.info('NOTE: Dry run mode - no files were actually copied');
    }
  }
}

/**
 * CLI Command
 */
async function main() {
  const program = new Command();

  program
    .name('ingest-content')
    .description('Content ingestion pipeline for apps/webapp')
    .version('1.0.0')
    .option('-s, --source <dirs...>', 'Source directories to scan')
    .option('-t, --target <dir>', 'Target directory for ingested content')
    .option('-d, --dry-run', 'Run without actually copying files', false)
    .option('--no-manifest', 'Skip manifest generation')
    .option('--overwrite', 'Overwrite existing files', false)
    .option('--max-size <bytes>', 'Maximum file size in bytes', '10485760')
    .option('--log-level <level>', 'Log level (debug, info, warn, error)', 'info')
    .parse(process.argv);

  const options = program.opts();

  // Validate required options
  if (!options.source || options.source.length === 0) {
    console.error('Error: At least one source directory must be specified');
    console.error('Usage: ingest-content --source <dir> [--source <dir2>...]');
    process.exit(1);
  }

  // Build configuration
  const config: Partial<IngestionConfig> = {
    sourceDirs: options.source,
    dryRun: options.dryRun,
    overwrite: options.overwrite,
    generateManifest: options.manifest !== false,
    maxFileSize: parseInt(options.maxSize, 10),
    logLevel: options.logLevel
  };

  if (options.target) {
    config.targetDir = options.target;
  }

  // Run pipeline
  try {
    const pipeline = new IngestionPipeline(config);
    await pipeline.run();
  } catch (error) {
    console.error('Pipeline failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { IngestionPipeline };
