/**
 * Folder Structure Hook
 * React hook for managing the 8-folder bootstrap structure
 */

import { useState, useEffect, useCallback } from 'react';
import { PCId, ComponentId } from '../types/manifest';
import {
  FolderStructureManager,
  PCFolderContents,
  ComponentFiles,
} from '../services/folderStructureManager';

export interface UseFolderStructureResult {
  manager: FolderStructureManager | null;
  pcContents: PCFolderContents | null;
  componentFiles: ComponentFiles | null;
  availableComponents: ComponentId[];
  recommendedComponents: ComponentId[];
  optionalComponents: ComponentId[];
  isLoading: boolean;
  error: Error | null;
  loadPCContents: (pcId: PCId) => Promise<void>;
  loadComponentFiles: (pcId: PCId, componentId: ComponentId) => Promise<void>;
  verifyStructure: () => Promise<void>;
}

export const useFolderStructure = (
  baseBootstrapPath: string
): UseFolderStructureResult => {
  const [manager, setManager] = useState<FolderStructureManager | null>(null);
  const [pcContents, setPCContents] = useState<PCFolderContents | null>(null);
  const [componentFiles, setComponentFiles] = useState<ComponentFiles | null>(null);
  const [availableComponents, setAvailableComponents] = useState<ComponentId[]>([]);
  const [recommendedComponents, setRecommendedComponents] = useState<ComponentId[]>([]);
  const [optionalComponents, setOptionalComponents] = useState<ComponentId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize manager
  useEffect(() => {
    if (baseBootstrapPath) {
      setManager(new FolderStructureManager(baseBootstrapPath));
    }
  }, [baseBootstrapPath]);

  /**
   * Load PC folder contents
   */
  const loadPCContents = useCallback(
    async (pcId: PCId) => {
      if (!manager) return;

      setIsLoading(true);
      setError(null);

      try {
        const contents = await manager.listPCFolderContents(pcId);
        setPCContents(contents);

        // Load installation options
        const options = await manager.getInstallationOptions(pcId);
        setAvailableComponents(options.availableComponents);
        setRecommendedComponents(options.recommendedComponents);
        setOptionalComponents(options.optionalComponents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load PC contents'));
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  /**
   * Load component files
   */
  const loadComponentFiles = useCallback(
    async (pcId: PCId, componentId: ComponentId) => {
      if (!manager) return;

      setIsLoading(true);
      setError(null);

      try {
        const files = await manager.getComponentFiles(pcId, componentId);
        setComponentFiles(files);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load component files'));
      } finally {
        setIsLoading(false);
      }
    },
    [manager]
  );

  /**
   * Verify folder structure integrity
   */
  const verifyStructure = useCallback(async () => {
    if (!manager) return;

    setIsLoading(true);
    setError(null);

    try {
      const verification = await manager.verifyStructure();
      if (!verification.valid) {
        throw new Error(
          `Folder structure validation failed:\nMissing: ${verification.missingFolders.join(', ')}\nEmpty: ${verification.emptyFolders.join(', ')}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Structure verification failed'));
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  return {
    manager,
    pcContents,
    componentFiles,
    availableComponents,
    recommendedComponents,
    optionalComponents,
    isLoading,
    error,
    loadPCContents,
    loadComponentFiles,
    verifyStructure,
  };
};
