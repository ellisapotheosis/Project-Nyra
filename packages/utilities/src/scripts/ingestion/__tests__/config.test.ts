/**
 * Tests for configuration module
 */

import { describe, it, expect } from 'vitest';
import { mergeConfig, validateConfig, DEFAULT_CONFIG } from '../config';
import { IngestionConfig } from '../types';

describe('Configuration', () => {
  describe('mergeConfig', () => {
    it('should merge configs with defaults', () => {
      const custom: Partial<IngestionConfig> = {
        dryRun: true,
        logLevel: 'debug'
      };

      const result = mergeConfig(DEFAULT_CONFIG, custom);

      expect(result.dryRun).toBe(true);
      expect(result.logLevel).toBe('debug');
      expect(result.maxFileSize).toBe(DEFAULT_CONFIG.maxFileSize);
    });

    it('should override arrays properly', () => {
      const custom: Partial<IngestionConfig> = {
        sourceDirs: ['/custom/path']
      };

      const result = mergeConfig(DEFAULT_CONFIG, custom);

      expect(result.sourceDirs).toEqual(['/custom/path']);
    });
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', () => {
      const config: IngestionConfig = {
        ...DEFAULT_CONFIG,
        sourceDirs: ['/valid/path']
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty source directories', () => {
      const config: IngestionConfig = {
        ...DEFAULT_CONFIG,
        sourceDirs: []
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('At least one source directory must be specified');
    });

    it('should reject missing target directory', () => {
      const config: IngestionConfig = {
        ...DEFAULT_CONFIG,
        sourceDirs: ['/valid/path'],
        targetDir: ''
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Target directory must be specified');
    });

    it('should reject invalid max file size', () => {
      const config: IngestionConfig = {
        ...DEFAULT_CONFIG,
        sourceDirs: ['/valid/path'],
        maxFileSize: -1
      };

      const result = validateConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Max file size must be positive');
    });
  });
});
