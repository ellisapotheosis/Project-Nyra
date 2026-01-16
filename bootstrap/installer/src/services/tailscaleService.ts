/**
 * Tailscale Service
 * Handles Tailscale setup, configuration, and integration with Infisical
 */

export interface TailscaleConfig {
  authKey: string;
  hostname: string;
  nodeType: 'orchestrator' | 'worker';
  exitNode?: boolean;
  advertiseRoutes?: string[];
  acceptRoutes?: boolean;
  acceptDns?: boolean;
  enableSsh?: boolean;
}

export interface NetworkInfo {
  interfaceName: string;
  interfaceIndex?: number;
  ipAddress: string;
  macAddress: string;
}

export interface TailscaleStatus {
  connected: boolean;
  ipv4?: string;
  ipv6?: string;
  hostname?: string;
  online: boolean;
  exitNode: boolean;
}

export interface TailscaleNodeInfo {
  nodeType: string;
  nodeName: string;
  tailscaleIp: string;
  tailscaleIp6?: string;
  macAddress: string;
  primaryInterface: string;
  localIp: string;
  exitNode: boolean;
  worker?: boolean;
  subnetRoutes?: string[];
  updatedAt: string;
}

export class TailscaleService {
  private config: TailscaleConfig;
  private platform: 'windows' | 'linux' | 'darwin';

  constructor(config: TailscaleConfig) {
    this.config = config;
    this.platform = this.detectPlatform();
  }

  private detectPlatform(): 'windows' | 'linux' | 'darwin' {
    if (typeof window !== 'undefined' && 'navigator' in window) {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes('win')) return 'windows';
      if (userAgent.includes('mac')) return 'darwin';
      return 'linux';
    }
    return 'linux';
  }

  /**
   * Detect network information
   */
  async detectNetworkInfo(): Promise<NetworkInfo> {
    // This would typically call a native module or execute system commands
    // For now, returning mock data that would be replaced with actual detection
    try {
      // In a real implementation, this would use:
      // - Windows: Get-NetAdapter, Get-NetIPAddress
      // - Linux: ip addr, ifconfig
      const response = await this.executeCommand('detect-network');
      return response as NetworkInfo;
    } catch (error) {
      throw new Error(`Failed to detect network info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Tailscale is installed
   */
  async isInstalled(): Promise<boolean> {
    try {
      const result = await this.executeCommand('check-installed');
      return result.installed === true;
    } catch {
      return false;
    }
  }

  /**
   * Get Tailscale version
   */
  async getVersion(): Promise<string | null> {
    try {
      const result = await this.executeCommand('get-version');
      return result.version || null;
    } catch {
      return null;
    }
  }

  /**
   * Install Tailscale
   */
  async install(onProgress?: (message: string) => void): Promise<void> {
    onProgress?.('Downloading Tailscale installer...');

    try {
      if (this.platform === 'windows') {
        await this.installWindows(onProgress);
      } else {
        await this.installLinux(onProgress);
      }

      onProgress?.('Tailscale installed successfully');
    } catch (error) {
      throw new Error(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async installWindows(onProgress?: (message: string) => void): Promise<void> {
    const installerUrl = 'https://pkgs.tailscale.com/stable/tailscale-setup-latest.exe';

    onProgress?.('Downloading Windows installer...');
    // Download and run installer silently
    await this.executeCommand('install-windows', { url: installerUrl, silent: true });

    onProgress?.('Waiting for Tailscale service to start...');
    await this.waitForService();
  }

  private async installLinux(onProgress?: (message: string) => void): Promise<void> {
    onProgress?.('Running Tailscale installation script...');
    await this.executeCommand('install-linux');
  }

  /**
   * Configure Tailscale with provided settings
   */
  async configure(onProgress?: (message: string) => void): Promise<TailscaleStatus> {
    onProgress?.('Checking if Tailscale is already connected...');

    // Check current status
    const currentStatus = await this.getStatus();
    if (currentStatus.connected) {
      onProgress?.('Tailscale is already connected. Reconfiguring...');
      await this.disconnect();
    }

    onProgress?.('Starting Tailscale with configuration...');

    // Build tailscale up command arguments
    const args = this.buildConfigArgs();

    try {
      await this.executeCommand('tailscale-up', { args });
      onProgress?.('Tailscale configured successfully');

      // Get and return status
      return await this.getStatus();
    } catch (error) {
      throw new Error(`Configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildConfigArgs(): string[] {
    const args = [
      `--authkey=${this.config.authKey}`,
      `--hostname=${this.config.hostname}`,
    ];

    if (this.config.exitNode) {
      args.push('--advertise-exit-node');
    }

    if (this.config.advertiseRoutes && this.config.advertiseRoutes.length > 0) {
      args.push(`--advertise-routes=${this.config.advertiseRoutes.join(',')}`);
    }

    if (this.config.acceptRoutes) {
      args.push('--accept-routes');
    }

    if (this.config.acceptDns) {
      args.push('--accept-dns');
    }

    if (this.config.enableSsh) {
      args.push('--ssh');
    }

    args.push('--shields-up=false');

    return args;
  }

  /**
   * Get current Tailscale status
   */
  async getStatus(): Promise<TailscaleStatus> {
    try {
      const result = await this.executeCommand('tailscale-status');
      return {
        connected: result.connected || false,
        ipv4: result.ipv4,
        ipv6: result.ipv6,
        hostname: result.hostname,
        online: result.online || false,
        exitNode: result.exitNode || false,
      };
    } catch {
      return {
        connected: false,
        online: false,
        exitNode: false,
      };
    }
  }

  /**
   * Disconnect from Tailscale
   */
  async disconnect(): Promise<void> {
    await this.executeCommand('tailscale-down');
  }

  /**
   * Store node information
   */
  async storeNodeInfo(networkInfo: NetworkInfo, tailscaleStatus: TailscaleStatus): Promise<TailscaleNodeInfo> {
    const nodeInfo: TailscaleNodeInfo = {
      nodeType: this.config.nodeType,
      nodeName: this.config.hostname,
      tailscaleIp: tailscaleStatus.ipv4 || '',
      tailscaleIp6: tailscaleStatus.ipv6,
      macAddress: networkInfo.macAddress,
      primaryInterface: networkInfo.interfaceName,
      localIp: networkInfo.ipAddress,
      exitNode: this.config.exitNode || false,
      worker: this.config.nodeType === 'worker',
      subnetRoutes: this.config.advertiseRoutes,
      updatedAt: new Date().toISOString(),
    };

    // Store locally
    await this.saveToFile(nodeInfo);

    // Store in Infisical if available
    await this.storeInInfisical(nodeInfo);

    return nodeInfo;
  }

  private async saveToFile(nodeInfo: TailscaleNodeInfo): Promise<void> {
    await this.executeCommand('save-node-info', { data: nodeInfo });
  }

  private async storeInInfisical(nodeInfo: TailscaleNodeInfo): Promise<void> {
    try {
      const nodeTypeUpper = nodeInfo.nodeType.toUpperCase().replace('-', '_');

      await this.executeCommand('infisical-set', {
        secrets: [
          { key: `TAILSCALE_NODE_${nodeTypeUpper}_IP`, value: nodeInfo.tailscaleIp },
          { key: `TAILSCALE_NODE_${nodeTypeUpper}_MAC`, value: nodeInfo.macAddress },
          { key: `TAILSCALE_NODE_${nodeTypeUpper}_NAME`, value: nodeInfo.nodeName },
        ],
      });
    } catch (error) {
      console.warn('Failed to store in Infisical:', error);
      // Don't throw - Infisical storage is optional
    }
  }

  /**
   * Wait for Tailscale service to be ready
   */
  private async waitForService(maxAttempts = 10, delayMs = 1000): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const status = await this.getStatus();
        if (status.connected) {
          return;
        }
      } catch {
        // Service not ready yet
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    throw new Error('Tailscale service failed to start');
  }

  /**
   * Execute a command (placeholder for actual implementation)
   * In a real implementation, this would use IPC to communicate with the Electron main process
   * or call native modules
   */
  private async executeCommand(command: string, params?: any): Promise<any> {
    // This is a placeholder. In a real implementation, you would:
    // 1. Send IPC message to Electron main process
    // 2. Main process executes the actual system command
    // 3. Return the result

    if (typeof window !== 'undefined' && 'ipc' in window) {
      // Use Electron IPC
      return await (window as any).ipc.invoke('tailscale-command', { command, params });
    }

    // For development/testing
    console.log('Tailscale command:', command, params);
    return { success: true };
  }

  /**
   * Configure firewall rules for Tailscale
   */
  async configureFirewall(): Promise<void> {
    if (this.platform === 'windows') {
      await this.executeCommand('configure-firewall-windows');
    } else {
      await this.executeCommand('configure-firewall-linux');
    }
  }

  /**
   * Enable Tailscale service to start on boot
   */
  async enableAutoStart(): Promise<void> {
    await this.executeCommand('enable-autostart');
  }

  /**
   * Test connectivity to a specific node
   */
  async testConnectivity(targetHost: string): Promise<boolean> {
    try {
      const result = await this.executeCommand('tailscale-ping', { host: targetHost });
      return result.success === true;
    } catch {
      return false;
    }
  }
}

/**
 * Create Tailscale service instance
 */
export function createTailscaleService(config: TailscaleConfig): TailscaleService {
  return new TailscaleService(config);
}
