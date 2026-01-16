/**
 * Folder Structure Manager
 * Manages the new 8-folder bootstrap structure
 */

import { PCId, ComponentId } from '../types/manifest';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface FolderStructure {
  pcFolders: {
    orchestratorMini: string;
    workerRtx3060: string;
    workerRtx3090ti: string;
    workerRtx5090: string;
  };
  sharedFolders: {
    configs: string;
    scripts: string;
    windows: string;
    wsl: string;
  };
}

export interface PCFolderContents {
  configs: string[];
  docker: string[];
  scripts: string[];
  setup: string[];
}

export interface ComponentFiles {
  configFiles: string[];
  scriptFiles: string[];
  dockerFiles: string[];
}

export class FolderStructureManager {
  private baseBootstrapPath: string;
  private structure: FolderStructure;

  constructor(baseBootstrapPath: string) {
    this.baseBootstrapPath = baseBootstrapPath;
    this.structure = this.initializeStructure();
  }

  /**
   * Initialize the folder structure paths
   */
  private initializeStructure(): FolderStructure {
    return {
      pcFolders: {
        orchestratorMini: path.join(this.baseBootstrapPath, 'orchestrator-mini'),
        workerRtx3060: path.join(this.baseBootstrapPath, 'worker-rtx3060'),
        workerRtx3090ti: path.join(this.baseBootstrapPath, 'worker-rtx3090ti'),
        workerRtx5090: path.join(this.baseBootstrapPath, 'worker-rtx5090'),
      },
      sharedFolders: {
        configs: path.join(this.baseBootstrapPath, 'configs'),
        scripts: path.join(this.baseBootstrapPath, 'scripts'),
        windows: path.join(this.baseBootstrapPath, 'windows'),
        wsl: path.join(this.baseBootstrapPath, 'wsl'),
      },
    };
  }

  /**
   * Get PC-specific folder path
   */
  getPCFolder(pcId: PCId): string {
    const folderMap = {
      'orchestrator-mini': this.structure.pcFolders.orchestratorMini,
      'worker-rtx3060': this.structure.pcFolders.workerRtx3060,
      'worker-rtx3090ti': this.structure.pcFolders.workerRtx3090ti,
      'worker-rtx5090': this.structure.pcFolders.workerRtx5090,
    };
    return folderMap[pcId];
  }

  /**
   * Get PC-specific subfolder path
   */
  getPCSubfolder(pcId: PCId, subfolder: 'configs' | 'docker' | 'scripts' | 'setup'): string {
    return path.join(this.getPCFolder(pcId), subfolder);
  }

  /**
   * Get shared configs folder
   */
  getSharedConfigsFolder(): string {
    return this.structure.sharedFolders.configs;
  }

  /**
   * Get shared scripts folder
   */
  getSharedScriptsFolder(): string {
    return this.structure.sharedFolders.scripts;
  }

  /**
   * Get shared Windows folder
   */
  getSharedWindowsFolder(): string {
    return this.structure.sharedFolders.windows;
  }

  /**
   * Get shared WSL folder
   */
  getSharedWSLFolder(): string {
    return this.structure.sharedFolders.wsl;
  }

  /**
   * List all files in a PC-specific folder
   */
  async listPCFolderContents(pcId: PCId): Promise<PCFolderContents> {
    const pcFolder = this.getPCFolder(pcId);
    const result: PCFolderContents = {
      configs: [],
      docker: [],
      scripts: [],
      setup: [],
    };

    try {
      // Check if PC folder exists
      await fs.access(pcFolder);

      // List each subfolder
      for (const subfolder of ['configs', 'docker', 'scripts', 'setup'] as const) {
        const subfolderPath = path.join(pcFolder, subfolder);
        try {
          await fs.access(subfolderPath);
          const files = await fs.readdir(subfolderPath);
          result[subfolder] = files;
        } catch (error) {
          // Subfolder doesn't exist, leave empty array
        }
      }
    } catch (error) {
      console.warn(`PC folder not found: ${pcFolder}`);
    }

    return result;
  }

  /**
   * Get component files for a specific PC
   */
  async getComponentFiles(pcId: PCId, componentId: ComponentId): Promise<ComponentFiles> {
    const result: ComponentFiles = {
      configFiles: [],
      scriptFiles: [],
      dockerFiles: [],
    };

    // Check PC-specific component files
    const pcFolder = this.getPCFolder(pcId);
    const configsPath = path.join(pcFolder, 'configs', componentId);
    const scriptsPath = path.join(pcFolder, 'scripts', componentId);
    const dockerPath = path.join(pcFolder, 'docker', componentId);

    try {
      result.configFiles = await this.listFilesInDirectory(configsPath);
    } catch (error) {
      // No configs for this component
    }

    try {
      result.scriptFiles = await this.listFilesInDirectory(scriptsPath);
    } catch (error) {
      // No scripts for this component
    }

    try {
      result.dockerFiles = await this.listFilesInDirectory(dockerPath);
    } catch (error) {
      // No docker files for this component
    }

    // Check shared configs
    const sharedConfigsPath = path.join(this.getSharedConfigsFolder(), componentId);
    try {
      const sharedConfigs = await this.listFilesInDirectory(sharedConfigsPath);
      result.configFiles.push(...sharedConfigs);
    } catch (error) {
      // No shared configs
    }

    // Check shared scripts
    const sharedScriptsPath = path.join(this.getSharedScriptsFolder(), componentId);
    try {
      const sharedScripts = await this.listFilesInDirectory(sharedScriptsPath);
      result.scriptFiles.push(...sharedScripts);
    } catch (error) {
      // No shared scripts
    }

    return result;
  }

  /**
   * List all files in a directory (non-recursive)
   */
  private async listFilesInDirectory(dirPath: string): Promise<string[]> {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => path.join(dirPath, entry.name));
  }

  /**
   * Get installation options for a specific PC
   */
  async getInstallationOptions(pcId: PCId): Promise<{
    availableComponents: ComponentId[];
    recommendedComponents: ComponentId[];
    optionalComponents: ComponentId[];
  }> {
    const contents = await this.listPCFolderContents(pcId);

    // Define PC-specific component availability
    const componentMap: Record<PCId, {
      available: ComponentId[];
      recommended: ComponentId[];
      optional: ComponentId[];
    }> = {
      'orchestrator-mini': {
        available: ['claude-code', 'claude-desktop', 'claude-flow', 'wsl-setup', 'docker', 'gitea', 'infisical'],
        recommended: ['claude-code', 'claude-desktop', 'claude-flow', 'wsl-setup', 'docker', 'infisical'],
        optional: ['gitea'],
      },
      'worker-rtx3090ti': {
        available: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        recommended: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        optional: [],
      },
      'worker-rtx5090': {
        available: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        recommended: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        optional: [],
      },
      'worker-rtx3060': {
        available: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        recommended: ['claude-code', 'claude-flow', 'docker', 'nvidia'],
        optional: [],
      },
    };

    return componentMap[pcId];
  }

  /**
   * Verify folder structure integrity
   */
  async verifyStructure(): Promise<{
    valid: boolean;
    missingFolders: string[];
    emptyFolders: string[];
  }> {
    const missingFolders: string[] = [];
    const emptyFolders: string[] = [];

    // Check all PC folders
    for (const [key, folderPath] of Object.entries(this.structure.pcFolders)) {
      try {
        await fs.access(folderPath);
        const files = await fs.readdir(folderPath);
        if (files.length === 0) {
          emptyFolders.push(folderPath);
        }
      } catch (error) {
        missingFolders.push(folderPath);
      }
    }

    // Check shared folders
    for (const [key, folderPath] of Object.entries(this.structure.sharedFolders)) {
      try {
        await fs.access(folderPath);
      } catch (error) {
        missingFolders.push(folderPath);
      }
    }

    return {
      valid: missingFolders.length === 0,
      missingFolders,
      emptyFolders,
    };
  }

  /**
   * Get all available setup scripts for a PC
   */
  async getSetupScripts(pcId: PCId): Promise<string[]> {
    const setupPath = this.getPCSubfolder(pcId, 'setup');
    try {
      return await this.listFilesInDirectory(setupPath);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get all Docker compose files for a PC
   */
  async getDockerComposeFiles(pcId: PCId): Promise<string[]> {
    const dockerPath = this.getPCSubfolder(pcId, 'docker');
    try {
      const files = await this.listFilesInDirectory(dockerPath);
      return files.filter(file =>
        file.endsWith('.yml') ||
        file.endsWith('.yaml') ||
        file.includes('docker-compose')
      );
    } catch (error) {
      return [];
    }
  }
}
