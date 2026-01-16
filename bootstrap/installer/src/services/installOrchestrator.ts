import { PCId, ComponentId, InstallPhase, LogEntry } from '../types/manifest';
import { runPowerShellScript, runWSLScript } from './scriptRunner';
import { createFileDeployer, DeployResult } from './fileDeployer';
import { createValidator } from './validator';
import { createLogger, Logger } from './logger';

export interface InstallOptions {
  pcId: PCId;
  components: ComponentId[];
  dryRun?: boolean;
  backup?: boolean;
  force?: boolean;
  onProgress?: (phase: InstallPhase, progress: number, step: number, total: number) => void;
  onLog?: (log: LogEntry) => void;
  onPhaseChange?: (phase: InstallPhase) => void;
}

export interface InstallResult {
  success: boolean;
  phase: InstallPhase;
  message: string;
  deployResults?: DeployResult[];
  validationResults?: any[];
  error?: Error;
}

/**
 * Installation orchestrator that coordinates the entire bootstrap process
 */
export class InstallOrchestrator {
  private logger: Logger;
  private validator;
  private deployer;
  private options: InstallOptions;
  private deployHistory: DeployResult[] = [];

  constructor(options: InstallOptions) {
    this.options = options;
    this.logger = createLogger({
      component: 'InstallOrchestrator',
      onLog: options.onLog,
    });
    this.validator = createValidator({ logger: this.logger });
    this.deployer = createFileDeployer({
      logger: this.logger,
      dryRun: options.dryRun,
      backup: options.backup,
      force: options.force,
    });
  }

  /**
   * Run the complete installation process
   */
  async install(): Promise<InstallResult> {
    const { pcId, components } = this.options;

    this.logger.info(`Starting installation for ${pcId}`, `Components: ${components.join(', ')}`);

    try {
      // Phase 1: Pre-installation validation
      await this.runPhase('validation', async () => {
        this.logger.step(1, 5, 'Pre-installation validation');
        const validationResults = await this.validator.validateAll(components);
        const invalid = validationResults.filter((r) => !r.valid);

        if (invalid.length > 0) {
          throw new Error(
            `Validation failed for: ${invalid.map((r) => r.component).join(', ')}`
          );
        }

        return validationResults;
      });

      // Phase 2: Windows bootstrap
      await this.runPhase('windows', async () => {
        this.logger.step(2, 5, 'Running Windows bootstrap scripts');
        await this.runWindowsBootstrap(pcId, components);
      });

      // Phase 3: WSL bootstrap
      await this.runPhase('wsl', async () => {
        this.logger.step(3, 5, 'Running WSL bootstrap scripts');
        await this.runWSLBootstrap(pcId, components);
      });

      // Phase 4: Deploy configuration files
      await this.runPhase('deployment', async () => {
        this.logger.step(4, 5, 'Deploying configuration files');
        await this.deployConfigFiles(pcId, components);
      });

      // Phase 5: Post-installation validation
      await this.runPhase('validation', async () => {
        this.logger.step(5, 5, 'Post-installation validation');
        const validationResults = await this.validator.validateAll(components);
        const invalid = validationResults.filter((r) => !r.valid);

        if (invalid.length > 0) {
          this.logger.warn(
            'Some components failed post-installation validation',
            invalid.map((r) => `${r.component}: ${r.message}`).join(', ')
          );
        }

        return validationResults;
      });

      // Phase 6: Complete
      this.setPhase('complete');
      this.logger.success('Installation completed successfully!');

      return {
        success: true,
        phase: 'complete',
        message: 'Installation completed successfully',
        deployResults: this.deployHistory,
      };
    } catch (error) {
      this.logger.error('Installation failed', (error as Error).message);
      this.setPhase('error');

      return {
        success: false,
        phase: 'error',
        message: 'Installation failed',
        error: error as Error,
        deployResults: this.deployHistory,
      };
    }
  }

  /**
   * Rollback the installation using backups
   */
  async rollback(): Promise<boolean> {
    this.logger.info('Starting rollback process...');

    if (this.deployHistory.length === 0) {
      this.logger.warn('No deployment history available for rollback');
      return false;
    }

    const resultsWithBackup = this.deployHistory.filter((r) => r.backupPath);

    if (resultsWithBackup.length === 0) {
      this.logger.warn('No backups available for rollback');
      return false;
    }

    this.logger.info(`Rolling back ${resultsWithBackup.length} files...`);

    let successCount = 0;
    for (const result of resultsWithBackup.reverse()) {
      const success = await this.deployer.rollback(result);
      if (success) {
        successCount++;
      }
    }

    const allSuccess = successCount === resultsWithBackup.length;
    if (allSuccess) {
      this.logger.success(`Successfully rolled back ${successCount} files`);
    } else {
      this.logger.warn(
        `Rolled back ${successCount}/${resultsWithBackup.length} files`
      );
    }

    return allSuccess;
  }

  /**
   * Run a phase with progress tracking
   */
  private async runPhase<T>(
    phase: InstallPhase,
    action: () => Promise<T>
  ): Promise<T> {
    this.setPhase(phase);
    return await action();
  }

  /**
   * Update phase and notify observers
   */
  private setPhase(phase: InstallPhase): void {
    if (this.options.onPhaseChange) {
      this.options.onPhaseChange(phase);
    }
  }

  /**
   * Update progress and notify observers
   */
  private updateProgress(progress: number, step: number, total: number): void {
    const phase = this.getCurrentPhase();
    if (this.options.onProgress) {
      this.options.onProgress(phase, progress, step, total);
    }
  }

  /**
   * Get current phase based on step
   */
  private getCurrentPhase(): InstallPhase {
    // This is a simplified version - in reality would track current phase
    return 'windows';
  }

  /**
   * Run Windows bootstrap scripts for selected PC and components
   */
  private async runWindowsBootstrap(
    pcId: PCId,
    components: ComponentId[]
  ): Promise<void> {
    const scriptsToRun: string[] = [];

    // Add PC-specific bootstrap script
    scriptsToRun.push(`bootstrap/windows/${pcId}/bootstrap.ps1`);

    // Add component-specific scripts
    for (const component of components) {
      const scriptPath = `bootstrap/windows/components/${component}.ps1`;
      scriptsToRun.push(scriptPath);
    }

    for (let i = 0; i < scriptsToRun.length; i++) {
      const scriptPath = scriptsToRun[i];
      this.logger.info(`Running Windows script: ${scriptPath}`);

      const result = await runPowerShellScript(scriptPath, {
        logger: this.logger,
        timeout: 300000, // 5 minutes
      });

      if (result.exitCode !== 0) {
        throw new Error(`Windows script failed: ${scriptPath}\n${result.stderr}`);
      }

      this.updateProgress(((i + 1) / scriptsToRun.length) * 100, i + 1, scriptsToRun.length);
    }
  }

  /**
   * Run WSL bootstrap scripts for selected PC and components
   */
  private async runWSLBootstrap(
    pcId: PCId,
    components: ComponentId[]
  ): Promise<void> {
    const scriptsToRun: string[] = [];

    // Add PC-specific bootstrap script
    scriptsToRun.push(`bootstrap/wsl/${pcId}/bootstrap.sh`);

    // Add component-specific scripts
    for (const component of components) {
      const scriptPath = `bootstrap/wsl/components/${component}.sh`;
      scriptsToRun.push(scriptPath);
    }

    for (let i = 0; i < scriptsToRun.length; i++) {
      const scriptPath = scriptsToRun[i];
      this.logger.info(`Running WSL script: ${scriptPath}`);

      const result = await runWSLScript(scriptPath, {
        logger: this.logger,
        timeout: 300000, // 5 minutes
      });

      if (result.exitCode !== 0) {
        throw new Error(`WSL script failed: ${scriptPath}\n${result.stderr}`);
      }

      this.updateProgress(((i + 1) / scriptsToRun.length) * 100, i + 1, scriptsToRun.length);
    }
  }

  /**
   * Deploy configuration files for selected PC and components
   */
  private async deployConfigFiles(
    pcId: PCId,
    components: ComponentId[]
  ): Promise<void> {
    // Define config file mappings (this would typically come from a manifest)
    const configFiles = this.getConfigFilesForComponents(pcId, components);

    if (configFiles.length === 0) {
      this.logger.info('No configuration files to deploy');
      return;
    }

    // Deploy to Windows
    const windowsFiles = configFiles.filter((f) => !f.target.startsWith('/'));
    if (windowsFiles.length > 0) {
      this.logger.info(`Deploying ${windowsFiles.length} files to Windows...`);
      const results = await this.deployer.deployBatch(windowsFiles, 'windows');
      this.deployHistory.push(...results);

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        throw new Error(
          `Failed to deploy ${failed.length} Windows files: ${failed.map((r) => r.file.target).join(', ')}`
        );
      }
    }

    // Deploy to WSL
    const wslFiles = configFiles.filter((f) => f.target.startsWith('/'));
    if (wslFiles.length > 0) {
      this.logger.info(`Deploying ${wslFiles.length} files to WSL...`);
      const results = await this.deployer.deployBatch(wslFiles, 'wsl');
      this.deployHistory.push(...results);

      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        throw new Error(
          `Failed to deploy ${failed.length} WSL files: ${failed.map((r) => r.file.target).join(', ')}`
        );
      }
    }
  }

  /**
   * Get configuration files for PC and components
   * This is a placeholder - would typically load from a manifest file
   */
  private getConfigFilesForComponents(pcId: PCId, components: ComponentId[]) {
    const files = [];

    // Example: Claude Code config
    if (components.includes('claude-code')) {
      files.push({
        source: 'bootstrap/configs/claude-code/.mcp.json',
        target: `${process.env.USERPROFILE}\\.claude\\.mcp.json`,
        checksum: undefined,
      });
    }

    // Example: Claude Flow config
    if (components.includes('claude-flow')) {
      files.push({
        source: 'bootstrap/configs/claude-flow/.env.claude-flow',
        target: `${process.env.USERPROFILE}\\.env.claude-flow`,
        checksum: undefined,
      });
      files.push({
        source: 'bootstrap/configs/claude-flow/.claude/settings.json',
        target: '/home/user/.claude/settings.json',
        checksum: undefined,
      });
    }

    return files;
  }
}

/**
 * Create an installation orchestrator instance
 */
export function createInstallOrchestrator(
  options: InstallOptions
): InstallOrchestrator {
  return new InstallOrchestrator(options);
}
