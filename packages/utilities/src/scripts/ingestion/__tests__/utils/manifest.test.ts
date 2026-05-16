/**
 * Tests for manifest generation
 */

import { describe, it, expect } from 'vitest';
import { createManifest, mergeManifests, getManifestSummary } from '../../utils/manifest';
import { FileMetadata, Manifest } from '../../types';

describe('Manifest Utils', () => {
  describe('createManifest', () => {
    it('should create manifest from successful files', () => {
      const files: FileMetadata[] = [
        {
          sourcePath: '/source/file1.md',
          targetPath: '/target/docs/file1.md',
          fileType: 'markdown',
          size: 1000,
          hash: 'hash1',
          modified: new Date(),
          status: 'success',
          metadata: { title: 'File 1' }
        },
        {
          sourcePath: '/source/file2.json',
          targetPath: '/target/data/file2.json',
          fileType: 'json',
          size: 2000,
          hash: 'hash2',
          modified: new Date(),
          status: 'success'
        },
        {
          sourcePath: '/source/file3.md',
          targetPath: '/target/docs/file3.md',
          fileType: 'markdown',
          size: 500,
          hash: 'hash3',
          modified: new Date(),
          status: 'error',
          error: 'Failed'
        }
      ];

      const manifest = createManifest(files, '/target');

      expect(manifest.totalFiles).toBe(2); // Only successful files
      expect(manifest.totalSize).toBe(3000);
      expect(manifest.entries).toHaveLength(2);
      expect(manifest.version).toBe('1.0.0');
    });

    it('should calculate relative paths correctly', () => {
      const files: FileMetadata[] = [
        {
          sourcePath: '/source/file1.md',
          targetPath: '/target/docs/subfolder/file1.md',
          fileType: 'markdown',
          size: 1000,
          hash: 'hash1',
          modified: new Date(),
          status: 'success'
        }
      ];

      const manifest = createManifest(files, '/target');

      expect(manifest.entries[0].path).toBe('docs/subfolder/file1.md');
    });
  });

  describe('mergeManifests', () => {
    it('should merge two manifests', () => {
      const existing: Manifest = {
        version: '1.0.0',
        generatedAt: '2024-01-01T00:00:00.000Z',
        totalFiles: 1,
        totalSize: 1000,
        entries: [
          {
            path: 'docs/file1.md',
            type: 'markdown',
            size: 1000,
            hash: 'hash1',
            ingestedAt: '2024-01-01T00:00:00.000Z',
            source: '/source/file1.md'
          }
        ]
      };

      const newManifest: Manifest = {
        version: '1.0.0',
        generatedAt: '2024-01-02T00:00:00.000Z',
        totalFiles: 1,
        totalSize: 2000,
        entries: [
          {
            path: 'docs/file2.md',
            type: 'markdown',
            size: 2000,
            hash: 'hash2',
            ingestedAt: '2024-01-02T00:00:00.000Z',
            source: '/source/file2.md'
          }
        ]
      };

      const merged = mergeManifests(existing, newManifest);

      expect(merged.totalFiles).toBe(2);
      expect(merged.totalSize).toBe(3000);
      expect(merged.entries).toHaveLength(2);
    });

    it('should update existing entries', () => {
      const existing: Manifest = {
        version: '1.0.0',
        generatedAt: '2024-01-01T00:00:00.000Z',
        totalFiles: 1,
        totalSize: 1000,
        entries: [
          {
            path: 'docs/file1.md',
            type: 'markdown',
            size: 1000,
            hash: 'hash1',
            ingestedAt: '2024-01-01T00:00:00.000Z',
            source: '/source/file1.md'
          }
        ]
      };

      const newManifest: Manifest = {
        version: '1.0.0',
        generatedAt: '2024-01-02T00:00:00.000Z',
        totalFiles: 1,
        totalSize: 1500,
        entries: [
          {
            path: 'docs/file1.md', // Same path
            type: 'markdown',
            size: 1500, // Updated size
            hash: 'hash1-updated',
            ingestedAt: '2024-01-02T00:00:00.000Z',
            source: '/source/file1.md'
          }
        ]
      };

      const merged = mergeManifests(existing, newManifest);

      expect(merged.totalFiles).toBe(1);
      expect(merged.entries[0].size).toBe(1500);
      expect(merged.entries[0].hash).toBe('hash1-updated');
    });
  });

  describe('getManifestSummary', () => {
    it('should generate summary string', () => {
      const manifest: Manifest = {
        version: '1.0.0',
        generatedAt: '2024-01-01T00:00:00.000Z',
        totalFiles: 3,
        totalSize: 5242880, // 5MB
        entries: [
          {
            path: 'docs/file1.md',
            type: 'markdown',
            size: 1048576,
            hash: 'hash1',
            ingestedAt: '2024-01-01T00:00:00.000Z',
            source: '/source/file1.md'
          },
          {
            path: 'docs/file2.md',
            type: 'markdown',
            size: 1048576,
            hash: 'hash2',
            ingestedAt: '2024-01-01T00:00:00.000Z',
            source: '/source/file2.md'
          },
          {
            path: 'data/file3.json',
            type: 'json',
            size: 3145728,
            hash: 'hash3',
            ingestedAt: '2024-01-01T00:00:00.000Z',
            source: '/source/file3.json'
          }
        ]
      };

      const summary = getManifestSummary(manifest);

      expect(summary).toContain('3 files');
      expect(summary).toContain('5.00 MB');
      expect(summary).toContain('markdown: 2');
      expect(summary).toContain('json: 1');
    });
  });
});
