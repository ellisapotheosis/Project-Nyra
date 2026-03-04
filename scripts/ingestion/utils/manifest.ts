/**
 * Manifest generation for ingested content
 */

import path from 'path';
import { Manifest, ManifestEntry, FileMetadata } from '../types';
import { writeFile } from './file-operations';

/**
 * Create a manifest from processed files
 */
export function createManifest(
  files: FileMetadata[],
  targetDir: string
): Manifest {
  const successfulFiles = files.filter(f => f.status === 'success');

  const entries: ManifestEntry[] = successfulFiles.map(file => ({
    path: path.relative(targetDir, file.targetPath),
    type: file.fileType,
    size: file.size,
    hash: file.hash,
    ingestedAt: new Date().toISOString(),
    source: file.sourcePath,
    metadata: file.metadata
  }));

  const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalFiles: entries.length,
    totalSize,
    entries
  };
}

/**
 * Save manifest to file
 */
export async function saveManifest(
  manifest: Manifest,
  manifestPath: string
): Promise<void> {
  const manifestJson = JSON.stringify(manifest, null, 2);
  await writeFile(manifestPath, manifestJson);
}

/**
 * Load existing manifest
 */
export async function loadManifest(manifestPath: string): Promise<Manifest | null> {
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content) as Manifest;
  } catch {
    return null;
  }
}

/**
 * Merge manifests (useful for incremental updates)
 */
export function mergeManifests(existing: Manifest, newManifest: Manifest): Manifest {
  // Create a map of existing entries by path
  const existingMap = new Map<string, ManifestEntry>(
    existing.entries.map(entry => [entry.path, entry])
  );

  // Update or add new entries
  for (const entry of newManifest.entries) {
    existingMap.set(entry.path, entry);
  }

  const mergedEntries = Array.from(existingMap.values());
  const totalSize = mergedEntries.reduce((sum, entry) => sum + entry.size, 0);

  return {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    totalFiles: mergedEntries.length,
    totalSize,
    entries: mergedEntries
  };
}

/**
 * Generate manifest summary for logging
 */
export function getManifestSummary(manifest: Manifest): string {
  const byType: Record<string, number> = {};
  for (const entry of manifest.entries) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
  }

  const typeStats = Object.entries(byType)
    .map(([type, count]) => `${type}: ${count}`)
    .join(', ');

  const sizeMB = (manifest.totalSize / (1024 * 1024)).toFixed(2);

  return `Manifest: ${manifest.totalFiles} files (${sizeMB} MB) - ${typeStats}`;
}
