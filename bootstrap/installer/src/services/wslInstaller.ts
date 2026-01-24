/**
 * WSL2 Installation and Configuration Service
 * Handles WSL2 installation, distro setup, and configuration for Windows PCs
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { Logger, createLogger } from './logger';

const execAsync = promisify(exec);

export interface WSLStatus {
  installed: boolean;
  version?: string;
  distrosInstalled: string[];
  defaultDistro?: string;
  wslConfigExists: boolean;
}

export interface WSLConfig {
  memory: string; // e.g., "8GB"
  processors: number;
  swap: string; // e.g., "2GB"
  localhostForwarding: boolean;
}

export interface WSLInstallResult {
  success: boolean;
  message: string;
  requiresReboot?: boolean;
  details?: any;
}

export class WSLInstaller {
  private logger: Logger;
  private platform: string;

  constructor(logger?: Logger) {
    this.logger = logger || createLogger({ component: 'WSLInstaller' });
    this.platform = os.platform();
  }

  /**
   * Check if WSL2 is installed and get status
   */
  async checkStatus(): Promise<WSLStatus> {
    this.logger.info('Checking WSL2 status');

    if (this.platform !== 'win32') {
      throw new Error('WSL is only available on Windows');
    }

    try {
      // Check if WSL is installed
      const { stdout } = await execAsync('wsl --status');
      const version = stdout.match(/Default Version: (\d+)/)?.[1];

      // List installed distros
      const { stdout: listOutput } = await execAsync('wsl --list --verbose');
      const lines = listOutput.split('\n').filter((line) => line.trim());
      const distros: string[] = [];
      let defaultDistro: string | undefined;

      for (const line of lines.slice(1)) {
        // Skip header
        if (line.includes('*')) {
          defaultDistro = line.replace('*', '').trim().split(/\s+/)[0];
          distros.push(defaultDistro);
        } else {
          const distroName = line.trim().split(/\s+/)[0];
          if (distroName) distros.push(distroName);
        }
      }

      // Check if .wslconfig exists
      const wslConfigPath = `${process.env.USERPROFILE}\\.wslconfig`;
      let wslConfigExists = false;
      try {
        const fs = await import('fs/promises');
        await fs.access(wslConfigPath);
        wslConfigExists = true;
      } catch {
        wslConfigExists = false;
      }

      const status: WSLStatus = {
        installed: true,
        version,
        distrosInstalled: distros,
        defaultDistro,
        wslConfigExists,
      };

      this.logger.success(
        `WSL${version} is installed with ${distros.length} distro(s)`
      );
      return status;
    } catch (error) {
      // WSL not installed
      this.logger.info('WSL is not installed');
      return {
        installed: false,
        distrosInstalled: [],
        wslConfigExists: false,
      };
    }
  }

  /**
   * Install WSL2 with Ubuntu 22.04
   */
  async install(): Promise<WSLInstallResult> {
    this.logger.info('Starting WSL2 installation');

    if (this.platform !== 'win32') {
      return {
        success: false,
        message: 'WSL is only available on Windows',
      };
    }

    try {
      // Enable WSL feature
      this.logger.info('Enabling WSL feature');
      await execAsync(
        'dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart',
        { timeout: 60000 }
      );

      // Enable Virtual Machine Platform
      this.logger.info('Enabling Virtual Machine Platform');
      await execAsync(
        'dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart',
        { timeout: 60000 }
      );

      // Set WSL2 as default
      this.logger.info('Setting WSL2 as default version');
      await execAsync('wsl --set-default-version 2');

      // Install Ubuntu 22.04
      this.logger.info('Installing Ubuntu 22.04 LTS');
      await execAsync('wsl --install -d Ubuntu-22.04', { timeout: 300000 }); // 5 min timeout

      this.logger.success('WSL2 installation completed');
      return {
        success: true,
        message:
          'WSL2 and Ubuntu 22.04 installed successfully. A system restart is required.',
        requiresReboot: true,
      };
    } catch (error: any) {
      this.logger.error('WSL2 installation failed', error.message);
      return {
        success: false,
        message: `Installation failed: ${error.message}`,
        details: error,
      };
    }
  }

  /**
   * Configure WSL2 settings (.wslconfig)
   */
  async configure(config: WSLConfig): Promise<WSLInstallResult> {
    this.logger.info('Configuring WSL2 settings');

    try {
      const wslConfigPath = `${process.env.USERPROFILE}\\.wslconfig`;
      const configContent = `[wsl2]
memory=${config.memory}
processors=${config.processors}
swap=${config.swap}
localhostForwarding=${config.localhostForwarding}

# Additional settings
kernelCommandLine=vsyscall=emulate

# GUI support (WSL2g)
guiApplications=false

# Nested virtualization
nestedVirtualization=false

# Page reporting
pageReporting=false
`;

      const fs = await import('fs/promises');
      await fs.writeFile(wslConfigPath, configContent, 'utf8');

      this.logger.success('WSL2 configuration written successfully');
      return {
        success: true,
        message: 'WSL2 configured successfully. Restart WSL to apply changes.',
      };
    } catch (error: any) {
      this.logger.error('WSL2 configuration failed', error.message);
      return {
        success: false,
        message: `Configuration failed: ${error.message}`,
      };
    }
  }

  /**
   * Setup nyra user in Ubuntu distro
   */
  async setupUser(distro: string = 'Ubuntu-22.04'): Promise<WSLInstallResult> {
    this.logger.info(`Setting up nyra user in ${distro}`);

    try {
      // Create nyra user with sudo privileges
      await execAsync(
        `wsl -d ${distro} -- bash -c "sudo useradd -m -s /bin/bash nyra && echo 'nyra:nyra' | sudo chpasswd && sudo usermod -aG sudo nyra"`
      );

      // Set nyra as default user
      await execAsync(`wsl -d ${distro} --user root -- usermod -aG sudo nyra`);

      this.logger.success('User setup completed');
      return {
        success: true,
        message: 'User "nyra" created successfully with sudo privileges',
      };
    } catch (error: any) {
      this.logger.error('User setup failed', error.message);
      return {
        success: false,
        message: `User setup failed: ${error.message}`,
      };
    }
  }

  /**
   * Install Docker in WSL distro
   */
  async installDockerInWSL(
    distro: string = 'Ubuntu-22.04'
  ): Promise<WSLInstallResult> {
    this.logger.info(`Installing Docker + Volta/Node/pnpm in ${distro}`);

    try {
      const dockerInstallScript = `
        set -e
        
        # Update package index
        sudo apt-get update

        # Install prerequisites
        sudo apt-get install -y ca-certificates curl gnupg lsb-release

        # Add Docker's official GPG key
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        # Set up repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

        # Add nyra user to docker group
        if id "nyra" >/dev/null 2>&1; then
          sudo usermod -aG docker nyra
        fi

        # Start Docker service if available
        if command -v service >/dev/null 2>&1; then
          sudo service docker start || true
        fi

        # -----------------------------
        # Volta + Node LTS + pnpm setup
        # -----------------------------
        if id "nyra" >/dev/null 2>&1; then
          echo "Installing Volta for user nyra..."
          sudo -u nyra bash -c "curl https://get.volta.sh | bash" || true

          # Ensure Volta is on PATH for this script execution
          export VOLTA_HOME="/home/nyra/.volta"
          export PATH="$VOLTA_HOME/bin:$PATH"

          echo "Installing Node LTS and pnpm via Volta..."
          sudo -u nyra bash -c "export VOLTA_HOME=\"$VOLTA_HOME\"; export PATH=\"$VOLTA_HOME/bin:$PATH\"; volta install node@lts || true"
          sudo -u nyra bash -c "export VOLTA_HOME=\"$VOLTA_HOME\"; export PATH=\"$VOLTA_HOME/bin:$PATH\"; volta install pnpm || true"
        fi
      `;

      await execAsync(`wsl -d ${distro} -- bash -c "${dockerInstallScript}"`, {
        timeout: 300000, // 5 minutes
      });

      this.logger.success('Docker + Volta/Node/pnpm installed in WSL');
      return {
        success: true,
        message: 'Docker and developer tooling installed successfully in WSL',
      };
    } catch (error: any) {
      this.logger.error('Docker/dev tooling installation in WSL failed', error.message);
      return {
        success: false,
        message: `Docker/dev tooling installation failed: ${error.message}`,
      };
    }
  }

  /**
   * Enable systemd in WSL distro
   */
  async enableSystemd(
    distro: string = 'Ubuntu-22.04'
  ): Promise<WSLInstallResult> {
    this.logger.info(`Enabling systemd in ${distro}`);

    try {
      // Create or update /etc/wsl.conf
      const wslConfContent = `[boot]
systemd=true

[network]
generateResolvConf=true

[interop]
enabled=true
appendWindowsPath=true
`;

      await execAsync(
        `wsl -d ${distro} -- bash -c "echo '${wslConfContent}' | sudo tee /etc/wsl.conf > /dev/null"`
      );

      // Restart WSL to apply
      await execAsync(`wsl --shutdown`);

      this.logger.success('Systemd enabled in WSL');
      return {
        success: true,
        message: 'Systemd enabled. WSL will restart.',
      };
    } catch (error: any) {
      this.logger.error('Systemd enablement failed', error.message);
      return {
        success: false,
        message: `Systemd enablement failed: ${error.message}`,
      };
    }
  }

  /**
   * Validate WSL2 installation
   */
  async validate(): Promise<boolean> {
    this.logger.info('Validating WSL2 installation');

    try {
      const status = await this.checkStatus();

      if (!status.installed) {
        this.logger.error('WSL2 is not installed');
        return false;
      }

      if (status.version !== '2') {
        this.logger.error('WSL version is not 2');
        return false;
      }

      if (status.distrosInstalled.length === 0) {
        this.logger.error('No distros installed');
        return false;
      }

      this.logger.success('WSL2 validation passed');
      return true;
    } catch (error: any) {
      this.logger.error('WSL2 validation failed', error.message);
      return false;
    }
  }

  /**
   * Get recommended WSL config based on PC type and available RAM
   */
  static getRecommendedConfig(
    pcType: string,
    totalRAMGB: number
  ): WSLConfig {
    const cpuCount = os.cpus().length;

    let memory: string;
    let processors: number;
    let swap: string;

    if (pcType === 'orchestrator-mini') {
      // Orchestrator: conservative settings
      memory = `${Math.min(8, Math.floor(totalRAMGB * 0.5))}GB`;
      processors = Math.max(2, Math.floor(cpuCount / 2));
      swap = '2GB';
    } else {
      // Workers: more generous settings for Docker workloads
      memory = `${Math.min(16, Math.floor(totalRAMGB * 0.6))}GB`;
      processors = Math.max(4, Math.floor(cpuCount * 0.75));
      swap = '4GB';
    }

    return {
      memory,
      processors,
      swap,
      localhostForwarding: true,
    };
  }
}
