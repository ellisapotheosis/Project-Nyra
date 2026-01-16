import { ComponentId, ValidationResult } from '../types/manifest';
import { runPowerShellCommand, runWSLCommand, checkWSLAvailable } from './scriptRunner';
import { Logger, createLogger } from './logger';

export interface ValidatorOptions {
  logger?: Logger;
  timeout?: number;
}

/**
 * Health check and validation service for system components
 */
export class Validator {
  private logger: Logger;
  private timeout: number;

  constructor(options: ValidatorOptions = {}) {
    this.logger = options.logger || createLogger({ component: 'Validator' });
    this.timeout = options.timeout || 30000;
  }

  /**
   * Validate Docker Desktop installation and status
   */
  async validateDocker(): Promise<ValidationResult> {
    this.logger.info('Checking Docker Desktop installation...');

    try {
      // Check if Docker command exists
      const versionResult = await runPowerShellCommand('docker --version');

      if (versionResult.exitCode !== 0) {
        return {
          component: 'docker',
          valid: false,
          message: 'Docker CLI not found',
          details: 'Please install Docker Desktop',
        };
      }

      // Check if Docker daemon is running
      const pingResult = await runPowerShellCommand('docker ps');

      if (pingResult.exitCode !== 0) {
        return {
          component: 'docker',
          valid: false,
          message: 'Docker daemon not running',
          details: 'Please start Docker Desktop',
        };
      }

      this.logger.success('Docker Desktop is installed and running');
      return {
        component: 'docker',
        valid: true,
        message: 'Docker Desktop is operational',
        details: versionResult.stdout.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to validate Docker', (error as Error).message);
      return {
        component: 'docker',
        valid: false,
        message: 'Docker validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate WSL installation and configuration
   */
  async validateWSL(): Promise<ValidationResult> {
    this.logger.info('Checking WSL installation...');

    try {
      const isAvailable = await checkWSLAvailable();

      if (!isAvailable) {
        return {
          component: 'wsl-setup',
          valid: false,
          message: 'WSL not available',
          details: 'Please install WSL2',
        };
      }

      // Check WSL version
      const versionResult = await runWSLCommand('cat /etc/os-release');

      this.logger.success('WSL is installed and accessible');
      return {
        component: 'wsl-setup',
        valid: true,
        message: 'WSL is operational',
        details: versionResult.stdout,
      };
    } catch (error) {
      this.logger.error('Failed to validate WSL', (error as Error).message);
      return {
        component: 'wsl-setup',
        valid: false,
        message: 'WSL validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate Claude Code CLI installation
   */
  async validateClaudeCode(): Promise<ValidationResult> {
    this.logger.info('Checking Claude Code installation...');

    try {
      const result = await runPowerShellCommand('claude --version');

      if (result.exitCode !== 0) {
        return {
          component: 'claude-code',
          valid: false,
          message: 'Claude Code CLI not found',
          details: 'Please install Claude Code',
        };
      }

      this.logger.success('Claude Code CLI is installed');
      return {
        component: 'claude-code',
        valid: true,
        message: 'Claude Code is operational',
        details: result.stdout.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to validate Claude Code', (error as Error).message);
      return {
        component: 'claude-code',
        valid: false,
        message: 'Claude Code validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate Claude Flow MCP server
   */
  async validateClaudeFlow(): Promise<ValidationResult> {
    this.logger.info('Checking Claude Flow MCP server...');

    try {
      const result = await runPowerShellCommand(
        'npx @claude-flow/cli@latest status'
      );

      if (result.exitCode !== 0) {
        return {
          component: 'claude-flow',
          valid: false,
          message: 'Claude Flow not responding',
          details: result.stderr,
        };
      }

      this.logger.success('Claude Flow MCP server is operational');
      return {
        component: 'claude-flow',
        valid: true,
        message: 'Claude Flow is operational',
        details: result.stdout,
      };
    } catch (error) {
      this.logger.error('Failed to validate Claude Flow', (error as Error).message);
      return {
        component: 'claude-flow',
        valid: false,
        message: 'Claude Flow validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate NVIDIA GPU drivers (for worker PCs)
   */
  async validateNVIDIA(): Promise<ValidationResult> {
    this.logger.info('Checking NVIDIA GPU drivers...');

    try {
      const result = await runPowerShellCommand('nvidia-smi --query-gpu=name --format=csv,noheader');

      if (result.exitCode !== 0) {
        return {
          component: 'nvidia',
          valid: false,
          message: 'NVIDIA drivers not found',
          details: 'Please install NVIDIA GPU drivers',
        };
      }

      this.logger.success('NVIDIA GPU drivers are installed');
      return {
        component: 'nvidia',
        valid: true,
        message: 'NVIDIA GPU detected',
        details: result.stdout.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to validate NVIDIA', (error as Error).message);
      return {
        component: 'nvidia',
        valid: false,
        message: 'NVIDIA validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate Gitea installation (optional)
   */
  async validateGitea(): Promise<ValidationResult> {
    this.logger.info('Checking Gitea installation...');

    try {
      const result = await runPowerShellCommand('docker ps --filter "name=gitea" --format "{{.Status}}"');

      if (result.exitCode !== 0 || !result.stdout.includes('Up')) {
        return {
          component: 'gitea',
          valid: false,
          message: 'Gitea container not running',
          details: 'Gitea is optional for this deployment',
        };
      }

      this.logger.success('Gitea is running');
      return {
        component: 'gitea',
        valid: true,
        message: 'Gitea is operational',
        details: result.stdout.trim(),
      };
    } catch (error) {
      return {
        component: 'gitea',
        valid: false,
        message: 'Gitea validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate Infisical secrets management
   */
  async validateInfisical(): Promise<ValidationResult> {
    this.logger.info('Checking Infisical installation...');

    try {
      const result = await runPowerShellCommand('infisical --version');

      if (result.exitCode !== 0) {
        return {
          component: 'infisical',
          valid: false,
          message: 'Infisical CLI not found',
          details: 'Please install Infisical CLI',
        };
      }

      this.logger.success('Infisical CLI is installed');
      return {
        component: 'infisical',
        valid: true,
        message: 'Infisical is operational',
        details: result.stdout.trim(),
      };
    } catch (error) {
      this.logger.error('Failed to validate Infisical', (error as Error).message);
      return {
        component: 'infisical',
        valid: false,
        message: 'Infisical validation failed',
        details: (error as Error).message,
      };
    }
  }

  /**
   * Validate all components in parallel
   */
  async validateAll(components: ComponentId[]): Promise<ValidationResult[]> {
    this.logger.info(`Validating ${components.length} components...`);

    const validationPromises = components.map((component) => {
      switch (component) {
        case 'docker':
          return this.validateDocker();
        case 'wsl-setup':
          return this.validateWSL();
        case 'claude-code':
          return this.validateClaudeCode();
        case 'claude-flow':
          return this.validateClaudeFlow();
        case 'nvidia':
          return this.validateNVIDIA();
        case 'gitea':
          return this.validateGitea();
        case 'infisical':
          return this.validateInfisical();
        default:
          return Promise.resolve({
            component,
            valid: false,
            message: `Unknown component: ${component}`,
          });
      }
    });

    const results = await Promise.all(validationPromises);

    const validCount = results.filter((r) => r.valid).length;
    const invalidCount = results.length - validCount;

    this.logger.info(
      `Validation complete: ${validCount} valid, ${invalidCount} invalid`
    );

    return results;
  }

  /**
   * Validate a single component by ID
   */
  async validateComponent(component: ComponentId): Promise<ValidationResult> {
    const results = await this.validateAll([component]);
    return results[0];
  }
}

/**
 * Create a validator instance
 */
export function createValidator(options: ValidatorOptions = {}): Validator {
  return new Validator(options);
}
