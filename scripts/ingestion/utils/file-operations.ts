/**
 * File system operations for content ingestion
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { glob } from 'glob';
import { Logger } from '../types';

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure directory exists (create if needed)
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * Calculate file hash (SHA-256)
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  const fileBuffer = await fs.readFile(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string) {
  return await fs.stat(filePath);
}

/**
 * Copy file from source to destination
 */
export async function copyFile(
  sourcePath: string,
  targetPath: string,
  logger: Logger
): Promise<void> {
  try {
    await ensureDir(path.dirname(targetPath));
    await fs.copyFile(sourcePath, targetPath);
    logger.debug(`Copied file: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    throw new Error(`Failed to copy file ${sourcePath} to ${targetPath}: ${error}`);
  }
}

/**
 * Move file from source to destination
 */
export async function moveFile(
  sourcePath: string,
  targetPath: string,
  logger: Logger
): Promise<void> {
  try {
    await ensureDir(path.dirname(targetPath));
    await fs.rename(sourcePath, targetPath);
    logger.debug(`Moved file: ${sourcePath} -> ${targetPath}`);
  } catch (error) {
    throw new Error(`Failed to move file ${sourcePath} to ${targetPath}: ${error}`);
  }
}

/**
 * Read file content as string
 */
export async function readFileContent(filePath: string): Promise<string> {
  return await fs.readFile(filePath, 'utf-8');
}

/**
 * Read file content as buffer
 */
export async function readFileBuffer(filePath: string): Promise<Buffer> {
  return await fs.readFile(filePath);
}

/**
 * Write content to file
 */
export async function writeFile(filePath: string, content: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Scan directory for files matching patterns
 */
export async function scanFiles(
  baseDir: string,
  includePatterns: string[],
  excludePatterns: string[],
  logger: Logger
): Promise<string[]> {
  const allFiles: string[] = [];

  for (const pattern of includePatterns) {
    const fullPattern = path.join(baseDir, pattern);
    logger.debug(`Scanning with pattern: ${fullPattern}`);

    const files = await glob(fullPattern, {
      ignore: excludePatterns.map(p => path.join(baseDir, p)),
      nodir: true,
      absolute: true
    });

    allFiles.push(...files);
  }

  // Remove duplicates
  const uniqueFiles = [...new Set(allFiles)];
  logger.info(`Found ${uniqueFiles.length} files in ${baseDir}`);

  return uniqueFiles;
}

/**
 * Check if file size is within limit
 */
export async function checkFileSize(filePath: string, maxSize: number): Promise<boolean> {
  const stats = await getFileStats(filePath);
  return stats.size <= maxSize;
}

/**
 * Get file extension (including dot)
 */
export function getFileExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

/**
 * Generate safe filename (remove special characters)
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Check if path is safe (prevent directory traversal)
 */
export function isSafePath(targetDir: string, filePath: string): boolean {
  const resolvedTarget = path.resolve(targetDir);
  const resolvedPath = path.resolve(filePath);
  return resolvedPath.startsWith(resolvedTarget);
}
