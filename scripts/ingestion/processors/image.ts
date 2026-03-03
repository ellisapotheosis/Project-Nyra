/**
 * Image file processor
 */

import path from 'path';
import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { copyFile, getFileStats } from '../utils/file-operations';

/**
 * Image processor
 * Handles common image formats: jpg, jpeg, png, webp, svg, gif
 */
export class ImageProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['image'];
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

      // Extract basic metadata
      const stats = await getFileStats(file.sourcePath);
      const extension = path.extname(file.sourcePath).toLowerCase();

      file.metadata = {
        filename: path.basename(file.sourcePath),
        format: extension.substring(1), // Remove the dot
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        // TODO: Extract image dimensions using sharp or similar library
        note: 'Image dimension extraction requires sharp library'
      };

      // Validate image format
      const allowedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
      if (!allowedFormats.includes(extension)) {
        file.status = 'error';
        file.error = `Unsupported image format: ${extension}`;
        return {
          success: false,
          file,
          message: file.error
        };
      }

      // Copy file to target (in dry-run, we skip the actual copy)
      if (!this.options.config.dryRun) {
        await copyFile(file.sourcePath, file.targetPath, this.options.logger);
      }

      file.status = 'success';
      this.logSuccess(file);

      return {
        success: true,
        file,
        message: 'Image file processed successfully'
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
}

/**
 * TODO: Enhanced image processor with dimension extraction and optimization
 *
 * To add full image processing capabilities:
 * 1. Install sharp: pnpm add sharp
 * 2. Uncomment the enhanced processor below
 * 3. Use EnhancedImageProcessor instead of ImageProcessor
 */

/*
import sharp from 'sharp';

export class EnhancedImageProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['image'];
  }

  async process(file: FileMetadata): Promise<ProcessingResult> {
    this.logStart(file);

    try {
      const validation = await this.validateFile(file);
      if (!validation.valid) {
        file.status = 'error';
        file.error = validation.errors.join(', ');
        return { success: false, file, message: file.error };
      }

      const stats = await getFileStats(file.sourcePath);
      const extension = path.extname(file.sourcePath).toLowerCase();

      // Get image metadata using sharp
      let imageMetadata;
      try {
        imageMetadata = await sharp(file.sourcePath).metadata();
      } catch (sharpError) {
        // SVG files may not work with sharp
        this.options.logger.warn(`Could not extract image metadata: ${sharpError}`);
      }

      file.metadata = {
        filename: path.basename(file.sourcePath),
        format: extension.substring(1),
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        width: imageMetadata?.width,
        height: imageMetadata?.height,
        colorSpace: imageMetadata?.space,
        hasAlpha: imageMetadata?.hasAlpha,
        orientation: imageMetadata?.orientation
      };

      if (!this.options.config.dryRun) {
        await copyFile(file.sourcePath, file.targetPath, this.options.logger);
      }

      file.status = 'success';
      this.logSuccess(file);

      return { success: true, file, message: 'Image processed with metadata extraction' };
    } catch (error) {
      file.status = 'error';
      file.error = error instanceof Error ? error.message : 'Unknown error';
      this.logError(file, error as Error);
      return { success: false, file, message: file.error };
    }
  }
}
*/
