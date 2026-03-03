/**
 * PDF file processor
 */

import path from 'path';
import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { copyFile, getFileStats } from '../utils/file-operations';

/**
 * PDF processor
 * Note: For full PDF processing, you'd need a library like pdf-parse
 * This is a basic implementation that handles metadata extraction
 */
export class PdfProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['pdf'];
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
      file.metadata = {
        filename: path.basename(file.sourcePath),
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        // TODO: Extract PDF metadata using pdf-parse or similar library
        // For now, just include basic file info
        note: 'Full PDF text extraction requires pdf-parse library'
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
        message: 'PDF file processed successfully'
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
 * TODO: Enhanced PDF processor with text extraction
 *
 * To add full PDF processing capabilities:
 * 1. Install pdf-parse: pnpm add pdf-parse
 * 2. Uncomment the enhanced processor below
 * 3. Use EnhancedPdfProcessor instead of PdfProcessor
 */

/*
import pdfParse from 'pdf-parse';

export class EnhancedPdfProcessor extends BaseProcessor {
  getSupportedTypes(): FileType[] {
    return ['pdf'];
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

      // Read PDF content
      const dataBuffer = await readFileBuffer(file.sourcePath);
      const pdfData = await pdfParse(dataBuffer);

      // Extract metadata
      file.metadata = {
        filename: path.basename(file.sourcePath),
        title: pdfData.info?.Title || path.basename(file.sourcePath, '.pdf'),
        author: pdfData.info?.Author,
        pages: pdfData.numpages,
        textLength: pdfData.text.length,
        keywords: pdfData.info?.Keywords,
        createdDate: pdfData.info?.CreationDate,
        modifiedDate: pdfData.info?.ModDate
      };

      if (!this.options.config.dryRun) {
        await copyFile(file.sourcePath, file.targetPath, this.options.logger);
      }

      file.status = 'success';
      this.logSuccess(file);

      return { success: true, file, message: 'PDF processed with text extraction' };
    } catch (error) {
      file.status = 'error';
      file.error = error instanceof Error ? error.message : 'Unknown error';
      this.logError(file, error as Error);
      return { success: false, file, message: file.error };
    }
  }
}
*/
