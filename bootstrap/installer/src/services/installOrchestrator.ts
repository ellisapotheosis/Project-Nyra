import { PCId, ComponentId, InstallPhase, LogEntry } from '../types/manifest';
import { runPowerShellScript, runWSLScript } from './scriptRunner';
import { createFileDeployer, DeployResult } from './fileDeployer';
import { createValidator } from './validator';
import { createLogger, Logger } from './logger';
import path from 'path';
import os from 'os';
import { WSLInstaller } from './wslInstaller';

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
    // Resolve bootstrap root. Prefer BOOTSTRAP_PATH env, fall back to ../bootstrap
    const bootstrapRoot =
      process.env.BOOTSTRAP_PATH || path.resolve(process.cwd(), '..', 'bootstrap');

    type ScriptSpec = { scriptPath: string; args?: string[] };
    const scriptsToRun: ScriptSpec[] = [];

    // PC-specific bootstrap scripts wired to existing orchestrator/worker entrypoints
    if (pcId === 'orchestrator-mini') {
      scriptsToRun.push({
        scriptPath: path.join(
          bootstrapRoot,
          'orchestrator-mini',
          'scripts',
          'bootstrap-orchestrator.ps1'
        ),
      });
    } else if (pcId === 'worker-rtx3060') {
      scriptsToRun.push({
        scriptPath: path.join(
          bootstrapRoot,
          'worker-rtx3060',
          'scripts',
          'bootstrap-worker.ps1'
        ),
        args: ['-WorkerRole', 'worker-2'],
      });
    } else if (pcId === 'worker-rtx5090') {
      scriptsToRun.push({
        scriptPath: path.join(
          bootstrapRoot,
          'worker-rtx5090',
          'scripts',
          'bootstrap-worker.ps1'
        ),
        args: ['-WorkerRole', 'worker-3'],
      });
    } else if (pcId === 'worker-rtx3090ti') {
      scriptsToRun.push({
        scriptPath: path.join(
          bootstrapRoot,
          'worker-rtx3090ti',
          'scripts',
          'bootstrap-worker.ps1'
        ),
        args: ['-WorkerRole', 'worker-4'],
      });
    }

  // Append shared developer environment setup script (Volta/Node/pnpm/Claude hints)
  const devEnvScript = path.join(
    bootstrapRoot,
    'scripts',
    'setup',
    'setup-dev-env.ps1'
  );
  scriptsToRun.push({ scriptPath: devEnvScript });

  // Apply Nyra Windows Terminal Preview profiles (Nyra Full/Minimal/Starship, etc.)
  const terminalScript = path.join(
    bootstrapRoot,
    'scripts',
    'setup',
    'setup-windows-terminal.ps1'
  );
  scriptsToRun.push({ scriptPath: terminalScript });

  if (scriptsToRun.length === 0) {
    this.logger.warn(`No Windows bootstrap scripts mapped for PC: ${pcId}`);
    return;
  }

    for (let i = 0; i < scriptsToRun.length; i++) {
      const spec = scriptsToRun[i];
      this.logger.info(`Running Windows script: ${spec.scriptPath}`);

      const result = await runPowerShellScript(spec.scriptPath, {
        logger: this.logger,
        timeout: 900000, // up to 15 minutes for installs
        cwd: bootstrapRoot,
        args: spec.args,
      });

      if (result.exitCode !== 0) {
        throw new Error(
          `Windows script failed: ${spec.scriptPath}\n${result.stderr}`
        );
      }

      this.updateProgress(
        ((i + 1) / scriptsToRun.length) * 100,
        i + 1,
        scriptsToRun.length
      );
    }
  }

  /**
   * Run WSL bootstrap scripts for selected PC and components
   */
  private async runWSLBootstrap(
    pcId: PCId,
    components: ComponentId[]
  ): Promise<void> {
    // Only run WSL bootstrap if the wsl-setup component is selected
    if (!components.includes('wsl-setup')) {
      this.logger.info('WSL setup component not selected; skipping WSL bootstrap');
      return;
    }

    const installer = new WSLInstaller(this.logger);

    // 1) Ensure WSL2 + Ubuntu 22.04 is installed
    const status = await installer.checkStatus();
    if (!status.installed) {
      this.logger.info('WSL2 is not installed; starting installation');
      const installResult = await installer.install();
      if (!installResult.success) {
        throw new Error(`WSL2 installation failed: ${installResult.message}`);
      }
      if (installResult.requiresReboot) {
        this.logger.warn(
          'WSL2 installation completed but requires a reboot before continuing'
        );
      }
    }

    // 2) Configure .wslconfig based on PC type and RAM
    const totalRAMGB = Math.round(os.totalmem() / (1024 ** 3));
    const cfg = WSLInstaller.getRecommendedConfig(pcId, totalRAMGB);
    const cfgResult = await installer.configure(cfg);
    if (!cfgResult.success) {
      throw new Error(`WSL configuration failed: ${cfgResult.message}`);
    }

    // 3) Ensure nyra user and Docker inside WSL
    const userResult = await installer.setupUser();
    if (!userResult.success) {
      this.logger.warn(`WSL user setup warning: ${userResult.message}`);
    }

    const dockerResult = await installer.installDockerInWSL();
    if (!dockerResult.success) {
      this.logger.warn(`WSL Docker/dev tooling setup warning: ${dockerResult.message}`);
    }

    const systemdResult = await installer.enableSystemd();
    if (!systemdResult.success) {
      this.logger.warn(`WSL systemd enablement warning: ${systemdResult.message}`);
    }

    // 4) Run Nyra shell helper to configure zsh + oh-my-zsh for nyra
    try {
      const bootstrapRoot =
        process.env.BOOTSTRAP_PATH || path.resolve(process.cwd(), '..', 'bootstrap');
      const helperScript = path.join(
        bootstrapRoot,
        'wsl',
        'nyra-shell-setup.sh'
      );
      this.logger.info(`Running WSL shell helper: ${helperScript}`);
      const helperResult = await runWSLScript(helperScript, {
        logger: this.logger,
        timeout: 300000,
      });
      if (helperResult.exitCode !== 0) {
        this.logger.warn(
          `WSL shell helper exited with non-zero code: ${helperResult.exitCode}`
        );
      }
    } catch (error) {
      this.logger.warn(
        'WSL shell helper failed; continuing without zsh/oh-my-zsh autoconfig',
        (error as Error).message
      );
    }

    // 5) Final validation
    const valid = await installer.validate();
    if (!valid) {
      throw new Error('WSL validation failed after installation/configuration');
    }

    this.logger.success('WSL bootstrap completed successfully');
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
    const files = [] as ConfigFile[];

    // Claude Code MCP configuration (Windows + WSL)
    if (components.includes('claude-code')) {
      const appData = process.env.APPDATA || (process.env.USERPROFILE
        ? `${process.env.USERPROFILE}\\AppData\\Roaming`
        : '');

      if (appData) {
        files.push({
          // Use the shared MCP config as Claude's mcp.json
          source: 'bootstrap/configs/mcp/mcp.development.json',
          target: `${appData}\\Claude\\mcp.json`,
          checksum: undefined,
        });
      }

      // WSL side: nyra user's Claude MCP config
      files.push({
        source: 'bootstrap/configs/mcp/mcp.development.json',
        target: '/home/nyra/.claude/mcp.json',
        checksum: undefined,
      });
    }

    // Claude Flow configuration (Windows + WSL)
    if (components.includes('claude-flow')) {
      const userProfile = process.env.USERPROFILE || '';

      if (userProfile) {
        files.push({
          source: 'bootstrap/configs/claude-flow/settings.json',
          target: `${userProfile}\\.claude-flow\\settings.json`,
          checksum: undefined,
        });
        files.push({
          source: 'bootstrap/configs/claude-flow/claude-flow.config.json',
          target: `${userProfile}\\.claude-flow\\claude-flow.config.json`,
          checksum: undefined,
        });
      }

      // WSL side: nyra user's Claude Flow config
      files.push({
        source: 'bootstrap/configs/claude-flow/settings.json',
        target: '/home/nyra/.claude-flow/settings.json',
        checksum: undefined,
      });
      files.push({
        source: 'bootstrap/configs/claude-flow/claude-flow.config.json',
        target: '/home/nyra/.claude-flow/claude-flow.config.json',
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
