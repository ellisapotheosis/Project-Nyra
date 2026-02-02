/**
 * Path Traversal Protection
 * Prevents directory traversal attacks
 */

import { resolve, normalize, relative, sep } from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('PathValidator');

export class PathValidator {
  private allowedBasePaths: Set<string> = new Set();
  private blockedPatterns: RegExp[] = [
    /\.\./g, // Parent directory
    /~\//g, // Home directory
    /^\/etc/i, // System config
    /^\/proc/i, // Process info
    /^\/sys/i, // System info
    /^\/dev/i, // Devices
    /^\/var\/log/i, // System logs
    /^\/root/i, // Root home
    /\0/g, // Null bytes
    /%00/g, // URL-encoded null
    /%2e%2e/gi, // URL-encoded ..
    /\.\.\\/g, // Windows-style parent
    /\.\.\//g, // Unix-style parent
  ];

  constructor(allowedPaths: string[] = []) {
    allowedPaths.forEach((path) => this.addAllowedPath(path));
  }

  addAllowedPath(basePath: string): void {
    const normalized = resolve(basePath);
    this.allowedBasePaths.add(normalized);
    logger.info('Added allowed base path', { path: normalized });
  }

  removeAllowedPath(basePath: string): void {
    const normalized = resolve(basePath);
    this.allowedBasePaths.delete(normalized);
    logger.info('Removed allowed base path', { path: normalized });
  }

  validatePath(inputPath: string, basePath?: string): { valid: boolean; reason?: string; safePath?: string } {
    // Check for null bytes and malicious patterns
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(inputPath)) {
        logger.warn('Path contains blocked pattern', { path: inputPath, pattern: pattern.source });
        return {
          valid: false,
          reason: `Path contains blocked pattern: ${pattern.source}`,
        };
      }
    }

    // Normalize the path
    const normalized = normalize(inputPath);

    // If basePath provided, ensure path is within it
    if (basePath) {
      const resolvedBase = resolve(basePath);
      const resolvedPath = resolve(resolvedBase, normalized);
      const relativePath = relative(resolvedBase, resolvedPath);

      // Check if path escapes base directory
      if (relativePath.startsWith('..') || resolve(resolvedPath) !== resolvedPath) {
        logger.warn('Path traversal attempt detected', {
          input: inputPath,
          base: basePath,
          resolved: resolvedPath,
        });
        return {
          valid: false,
          reason: 'Path traversal attempt detected',
        };
      }

      logger.debug('Path validated against base', { path: inputPath, base: basePath });
      return {
        valid: true,
        safePath: resolvedPath,
      };
    }

    // If no basePath, check against allowed paths
    if (this.allowedBasePaths.size > 0) {
      const resolvedPath = resolve(normalized);
      const isAllowed = Array.from(this.allowedBasePaths).some((allowedPath) => {
        const rel = relative(allowedPath, resolvedPath);
        return !rel.startsWith('..') && !resolve(rel).startsWith(sep);
      });

      if (!isAllowed) {
        logger.warn('Path not in allowed paths', { path: inputPath });
        return {
          valid: false,
          reason: 'Path not in allowed directories',
        };
      }

      logger.debug('Path validated against allowed paths', { path: inputPath });
      return {
        valid: true,
        safePath: resolvedPath,
      };
    }

    // No restrictions, just check for obvious attacks
    const resolvedPath = resolve(normalized);
    logger.debug('Path validated (no restrictions)', { path: inputPath });
    return {
      valid: true,
      safePath: resolvedPath,
    };
  }

  sanitizePath(inputPath: string): string {
    // Remove dangerous characters and normalize
    return normalize(inputPath)
      .replace(/\0/g, '')
      .replace(/%00/g, '')
      .replace(/\.\./g, '');
  }

  isAbsolutePath(path: string): boolean {
    return resolve(path) === normalize(path);
  }

  joinSafe(basePath: string, ...segments: string[]): { valid: boolean; path?: string; reason?: string } {
    try {
      const joined = segments.join(sep);
      const validation = this.validatePath(joined, basePath);

      if (!validation.valid) {
        return validation;
      }

      return {
        valid: true,
        path: validation.safePath,
      };
    } catch (error) {
      logger.error('Error joining paths', { basePath, segments, error });
      return {
        valid: false,
        reason: 'Error joining paths',
      };
    }
  }
}
