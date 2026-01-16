import { promises as fs } from 'fs';
import { join, dirname, basename } from 'path';
import { ConfigFile } from '../types/manifest';
import { runPowerShellCommand, runWSLCommand } from './scriptRunner';
import { Logger, createLogger } from './logger';

export interface DeployOptions {
  logger?: Logger;
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
}

export interface DeployResult {
  file: ConfigFile;
  success: boolean;
  message: string;
  backupPath?: string;
  error?: Error;
}

/**
 * File deployment service for copying config files to Windows and WSL paths
 */
export class FileDeployer {
  private logger: Logger;
  private dryRun: boolean;
  private backup: boolean;
  private force: boolean;

  constructor(options: DeployOptions = {}) {
    this.logger = options.logger || createLogger({ component: 'FileDeployer' });
    this.dryRun = options.dryRun || false;
    this.backup = options.backup || false;
    this.force = options.force || false;
  }

  /**
   * Deploy a single config file to Windows path
   */
  async deployToWindows(file: ConfigFile): Promise<DeployResult> {
    this.logger.info(`Deploying ${basename(file.source)} to ${file.target}`);

    if (this.dryRun) {
      this.logger.info(`[DRY RUN] Would deploy: ${file.source} → ${file.target}`);
      return {
        file,
        success: true,
        message: 'Dry run - no changes made',
      };
    }

    try {
      // Check if source exists
      const sourceExists = await this.fileExists(file.source);
      if (!sourceExists) {
        throw new Error(`Source file not found: ${file.source}`);
      }

      // Create target directory if needed
      const targetDir = dirname(file.target);
      await this.ensureDirectory(targetDir);

      // Backup existing file if requested
      let backupPath: string | undefined;
      if (this.backup) {
        const targetExists = await this.fileExists(file.target);
        if (targetExists) {
          backupPath = `${file.target}.backup.${Date.now()}`;
          await fs.copyFile(file.target, backupPath);
          this.logger.info(`Created backup: ${backupPath}`);
        }
      }

      // Check if target exists and force is not set
      if (!this.force) {
        const targetExists = await this.fileExists(file.target);
        if (targetExists) {
          return {
            file,
            success: false,
            message: 'Target file exists (use force=true to overwrite)',
          };
        }
      }

      // Copy file
      await fs.copyFile(file.source, file.target);

      // Verify checksum if provided
      if (file.checksum) {
        const valid = await this.verifyChecksum(file.target, file.checksum);
        if (!valid) {
          throw new Error('Checksum verification failed');
        }
      }

      this.logger.success(`Deployed: ${file.target}`);
      return {
        file,
        success: true,
        message: 'File deployed successfully',
        backupPath,
      };
    } catch (error) {
      this.logger.error(`Failed to deploy ${file.source}`, (error as Error).message);
      return {
        file,
        success: false,
        message: 'Deployment failed',
        error: error as Error,
      };
    }
  }

  /**
   * Deploy a single config file to WSL path
   */
  async deployToWSL(file: ConfigFile): Promise<DeployResult> {
    this.logger.info(`Deploying ${basename(file.source)} to WSL:${file.target}`);

    if (this.dryRun) {
      this.logger.info(`[DRY RUN] Would deploy to WSL: ${file.source} → ${file.target}`);
      return {
        file,
        success: true,
        message: 'Dry run - no changes made',
      };
    }

    try {
      // Check if source exists
      const sourceExists = await this.fileExists(file.source);
      if (!sourceExists) {
        throw new Error(`Source file not found: ${file.source}`);
      }

      // Convert Windows path to WSL path for the target directory
      const targetDir = dirname(file.target);
      const mkdirResult = await runWSLCommand(`mkdir -p "${targetDir}"`);
      if (mkdirResult.exitCode !== 0) {
        throw new Error(`Failed to create WSL directory: ${mkdirResult.stderr}`);
      }

      // Backup existing file if requested
      let backupPath: string | undefined;
      if (this.backup) {
        const checkResult = await runWSLCommand(`test -f "${file.target}" && echo "exists"`);
        if (checkResult.stdout.includes('exists')) {
          backupPath = `${file.target}.backup.${Date.now()}`;
          await runWSLCommand(`cp "${file.target}" "${backupPath}"`);
          this.logger.info(`Created WSL backup: ${backupPath}`);
        }
      }

      // Check if target exists and force is not set
      if (!this.force) {
        const checkResult = await runWSLCommand(`test -f "${file.target}" && echo "exists"`);
        if (checkResult.stdout.includes('exists')) {
          return {
            file,
            success: false,
            message: 'Target file exists in WSL (use force=true to overwrite)',
          };
        }
      }

      // Copy file to WSL using wsl command
      const windowsPath = file.source.replace(/\\/g, '/');
      const copyResult = await runWSLCommand(`cp "${windowsPath}" "${file.target}"`);

      if (copyResult.exitCode !== 0) {
        throw new Error(`Failed to copy to WSL: ${copyResult.stderr}`);
      }

      // Verify checksum if provided
      if (file.checksum) {
        const checksumResult = await runWSLCommand(
          `sha256sum "${file.target}" | awk '{print $1}'`
        );
        const actualChecksum = checksumResult.stdout.trim();
        if (actualChecksum !== file.checksum) {
          throw new Error('Checksum verification failed');
        }
      }

      this.logger.success(`Deployed to WSL: ${file.target}`);
      return {
        file,
        success: true,
        message: 'File deployed to WSL successfully',
        backupPath,
      };
    } catch (error) {
      this.logger.error(`Failed to deploy to WSL: ${file.source}`, (error as Error).message);
      return {
        file,
        success: false,
        message: 'WSL deployment failed',
        error: error as Error,
      };
    }
  }

  /**
   * Deploy multiple files in batch
   */
  async deployBatch(
    files: ConfigFile[],
    target: 'windows' | 'wsl'
  ): Promise<DeployResult[]> {
    this.logger.info(`Starting batch deployment of ${files.length} files to ${target}`);

    const deployFn = target === 'windows'
      ? this.deployToWindows.bind(this)
      : this.deployToWSL.bind(this);

    const results = await Promise.all(files.map(deployFn));

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    this.logger.info(
      `Batch deployment complete: ${successCount} succeeded, ${failureCount} failed`
    );

    return results;
  }

  /**
   * Check if a file exists (Windows)
   */
  private async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure directory exists (Windows)
   */
  private async ensureDirectory(path: string): Promise<void> {
    try {
      await fs.mkdir(path, { recursive: true });
    } catch (error) {
      // Ignore if directory already exists
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Verify file checksum (Windows)
   */
  private async verifyChecksum(path: string, expectedChecksum: string): Promise<boolean> {
    try {
      const result = await runPowerShellCommand(
        `(Get-FileHash -Path "${path}" -Algorithm SHA256).Hash`
      );

      if (result.exitCode !== 0) {
        return false;
      }

      const actualChecksum = result.stdout.trim().toLowerCase();
      return actualChecksum === expectedChecksum.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Rollback a deployment using backup
   */
  async rollback(result: DeployResult): Promise<boolean> {
    if (!result.backupPath) {
      this.logger.warn('No backup available for rollback');
      return false;
    }

    this.logger.info(`Rolling back: ${result.file.target}`);

    try {
      if (result.file.target.startsWith('/')) {
        // WSL path
        const rollbackResult = await runWSLCommand(
          `cp "${result.backupPath}" "${result.file.target}"`
        );
        return rollbackResult.exitCode === 0;
      } else {
        // Windows path
        await fs.copyFile(result.backupPath, result.file.target);
        return true;
      }
    } catch (error) {
      this.logger.error('Rollback failed', (error as Error).message);
      return false;
    }
  }
}

/**
 * Create a file deployer instance
 */
export function createFileDeployer(options: DeployOptions = {}): FileDeployer {
  return new FileDeployer(options);
}
