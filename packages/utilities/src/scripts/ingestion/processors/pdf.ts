/**
 * PDF file processor
 */

import path from 'path';
import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { copyFile, getFileStats, readFileBuffer } from '../utils/file-operations';

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

      const stats = await getFileStats(file.sourcePath);
      const pdfMetadata = await extractPdfMetadata(file.sourcePath);
      file.metadata = {
        filename: path.basename(file.sourcePath),
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        ...pdfMetadata
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

async function extractPdfMetadata(filePath: string): Promise<Record<string, any>> {
  const buffer = await readFileBuffer(filePath);
  const header = buffer.subarray(0, 16).toString('latin1');
  const text = buffer.toString('latin1');
  const pageMatches = text.match(/\/Type\s*\/Page\b/g) || [];

  return {
    format: 'pdf',
    version: header.startsWith('%PDF-') ? header.slice(5, 8) : undefined,
    pages: pageMatches.length || undefined,
    title: getPdfInfoValue(text, 'Title'),
    author: getPdfInfoValue(text, 'Author'),
    subject: getPdfInfoValue(text, 'Subject'),
    keywords: getPdfInfoValue(text, 'Keywords'),
    createdDate: getPdfInfoValue(text, 'CreationDate'),
    modifiedDate: getPdfInfoValue(text, 'ModDate')
  };
}

function getPdfInfoValue(pdfText: string, key: string): string | undefined {
  const match = new RegExp(`/${key}\\s*\\(([^)]*)\\)`).exec(pdfText);
  return match?.[1]?.replace(/\\([()\\])/g, '$1');
}
