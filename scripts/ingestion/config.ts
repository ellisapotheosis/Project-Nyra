/**
 * Configuration for content ingestion pipeline
 */

import path from 'path';
import { IngestionConfig } from './types';

/**
 * Default ingestion configuration
 */
export const DEFAULT_CONFIG: IngestionConfig = {
  sourceDirs: [],
  targetDir: path.join(process.cwd(), 'apps', 'webapp', 'public', 'content'),
  includePatterns: [
    '**/*.md',
    '**/*.json',
    '**/*.pdf',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.png',
    '**/*.webp',
    '**/*.svg'
  ],
  excludePatterns: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.next/**',
    '**/dist/**',
    '**/build/**',
    '**/__tests__/**',
    '**/*.test.*',
    '**/*.spec.*'
  ],
  dryRun: false,
  overwrite: false,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  generateManifest: true,
  manifestPath: path.join(process.cwd(), 'apps', 'webapp', 'public', 'content', 'manifest.json'),
  logLevel: 'info'
};

/**
 * File type detection based on extension
 */
export const FILE_TYPE_MAP: Record<string, string> = {
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.json': 'json',
  '.pdf': 'pdf',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.webp': 'image',
  '.svg': 'image',
  '.gif': 'image'
};

/**
 * Validation rules for different file types
 */
export const VALIDATION_RULES = {
  markdown: {
    maxSize: 5 * 1024 * 1024, // 5MB
    requiredFields: [] as string[],
    allowedExtensions: ['.md', '.markdown']
  },
  json: {
    maxSize: 2 * 1024 * 1024, // 2MB
    requiredFields: [] as string[],
    allowedExtensions: ['.json']
  },
  pdf: {
    maxSize: 20 * 1024 * 1024, // 20MB
    requiredFields: [] as string[],
    allowedExtensions: ['.pdf']
  },
  image: {
    maxSize: 10 * 1024 * 1024, // 10MB
    requiredFields: [] as string[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
  }
};

/**
 * Target directory structure
 */
export const TARGET_STRUCTURE = {
  markdown: 'docs',
  json: 'data',
  pdf: 'documents',
  image: 'images'
};

/**
 * Load configuration from file or environment
 */
export function loadConfig(configPath?: string): Partial<IngestionConfig> {
  // TODO: Implement config file loading
  // For now, return empty config to use defaults
  return {};
}

/**
 * Merge configurations with defaults
 */
export function mergeConfig(
  baseConfig: IngestionConfig,
  overrides: Partial<IngestionConfig>
): IngestionConfig {
  return {
    ...baseConfig,
    ...overrides,
    // Ensure arrays are properly merged
    sourceDirs: overrides.sourceDirs || baseConfig.sourceDirs,
    includePatterns: overrides.includePatterns || baseConfig.includePatterns,
    excludePatterns: overrides.excludePatterns || baseConfig.excludePatterns
  };
}

/**
 * Validate configuration
 */
export function validateConfig(config: IngestionConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.sourceDirs || config.sourceDirs.length === 0) {
    errors.push('At least one source directory must be specified');
  }

  if (!config.targetDir) {
    errors.push('Target directory must be specified');
  }

  if (config.maxFileSize <= 0) {
    errors.push('Max file size must be positive');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
