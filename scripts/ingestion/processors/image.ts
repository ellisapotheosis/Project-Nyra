/**
 * Image file processor
 */

import path from 'path';
import { BaseProcessor } from './base';
import { FileType, ProcessingResult, FileMetadata } from '../types';
import { copyFile, getFileStats, readFileBuffer } from '../utils/file-operations';

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

      const stats = await getFileStats(file.sourcePath);
      const extension = path.extname(file.sourcePath).toLowerCase();

      const imageMetadata = await extractImageMetadata(file.sourcePath, extension);
      file.metadata = {
        filename: path.basename(file.sourcePath),
        format: extension.substring(1), // Remove the dot
        fileSize: stats.size,
        lastModified: stats.mtime.toISOString(),
        ...imageMetadata
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

async function extractImageMetadata(filePath: string, extension: string): Promise<Record<string, any>> {
  const buffer = await readFileBuffer(filePath);

  if (extension === '.png' && buffer.length >= 24) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if ((extension === '.jpg' || extension === '.jpeg') && buffer.length >= 4) {
    return getJpegDimensions(buffer);
  }

  if (extension === '.gif' && buffer.length >= 10) {
    return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
  }

  if (extension === '.webp' && buffer.length >= 30) {
    return getWebpDimensions(buffer);
  }

  if (extension === '.svg') {
    return getSvgDimensions(buffer.toString('utf-8'));
  }

  return {};
}

function getJpegDimensions(buffer: Buffer): Record<string, any> {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }
  return {};
}

function getWebpDimensions(buffer: Buffer): Record<string, any> {
  const chunk = buffer.subarray(12, 16).toString('ascii');
  if (chunk === 'VP8X' && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3)
    };
  }
  if (chunk === 'VP8 ' && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff
    };
  }
  if (chunk === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1
    };
  }
  return {};
}

function getSvgDimensions(svg: string): Record<string, any> {
  const width = getSvgNumber(svg, 'width');
  const height = getSvgNumber(svg, 'height');
  if (width && height) return { width, height };

  const viewBox = /viewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i.exec(svg);
  return viewBox
    ? { width: Number(viewBox[1]), height: Number(viewBox[2]) }
    : {};
}

function getSvgNumber(svg: string, attribute: string): number | undefined {
  const match = new RegExp(`${attribute}=["']([\\d.]+)`).exec(svg);
  return match ? Number(match[1]) : undefined;
}
