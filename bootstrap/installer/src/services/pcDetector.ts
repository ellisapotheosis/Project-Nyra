/**
 * PC Detection Service
 * Detects which PC type is running based on hardware specs, network config, and GPU
 */

import { PCId, PCRole, ComponentId } from '../types/manifest';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PCDetectionResult {
  detectedPC: PCId;
  confidence: number;
  role: PCRole;
  specs: {
    hostname: string;
    cpu: string;
    totalMemory: number;
    gpus: GPUInfo[];
    platform: string;
    networkInterfaces: NetworkInfo[];
    isDockerHost: boolean;
  };
  alternativePCs?: PCId[];
  recommendedComponents: ComponentId[];
  skipComponents: ComponentId[];
}

export interface GPUInfo {
  name: string;
  vendor: string;
  vram?: number;
  detected: boolean;
}

export interface NetworkInfo {
  name: string;
  address: string;
  isStatic: boolean;
}

export class PCDetector {
  private static readonly PC_SIGNATURES = {
    'orchestrator-mini': {
      patterns: ['ryzen 7 6800h', 'mini pc', 'orchestrator'],
      minRAM: 12, // GB
      maxRAM: 20,
      requiresGPU: false,
    },
    'worker-rtx3090ti': {
      patterns: ['rtx 3090 ti', '3090ti', 'intel i7 12700'],
      minRAM: 28,
      maxRAM: 40,
      requiresGPU: true,
      gpuPattern: '3090',
    },
    'worker-rtx5090': {
      patterns: ['rtx 5090', '5090', 'alienware area-51', 'area 51'],
      minRAM: 28,
      maxRAM: 40,
      requiresGPU: true,
      gpuPattern: '5090',
    },
    'worker-rtx3060': {
      patterns: ['rtx 3060', '3060', 'alienware m15r7', 'm15 r7'],
      minRAM: 28,
      maxRAM: 40,
      requiresGPU: true,
      gpuPattern: '3060',
    },
  };

  /**
   * Detect the current PC type with enhanced logic
   */
  static async detect(): Promise<PCDetectionResult> {
    const specs = await this.getSystemSpecs();
    const scores: Record<PCId, number> = {
      'orchestrator-mini': 0,
      'worker-rtx3090ti': 0,
      'worker-rtx3060': 0,
      'worker-rtx5090': 0,
    };

    // Score each PC type based on system specs
    for (const [pcId, signature] of Object.entries(this.PC_SIGNATURES)) {
      let score = 0;

      // Check CPU patterns
      const cpuMatch = signature.patterns.some((pattern) =>
        specs.cpu.toLowerCase().includes(pattern.toLowerCase())
      );
      if (cpuMatch) score += 30;

      // Check hostname patterns
      const hostnameMatch = signature.patterns.some((pattern) =>
        specs.hostname.toLowerCase().includes(pattern.toLowerCase())
      );
      if (hostnameMatch) score += 20;

      // Check RAM range
      const ramGB = specs.totalMemory / (1024 * 1024 * 1024);
      if (ramGB >= signature.minRAM && ramGB <= signature.maxRAM) {
        score += 20;
      }

      // Check GPU requirements
      if (signature.requiresGPU) {
        const hasGPU = specs.gpus.some(gpu => gpu.detected);
        if (!hasGPU) {
          score = 0; // Disqualify if GPU required but not found
        } else if (signature.gpuPattern) {
          const gpuMatch = specs.gpus.some((gpu) =>
            gpu.name.toLowerCase().includes(signature.gpuPattern.toLowerCase())
          );
          if (gpuMatch) score += 30;
        }
      } else if (!signature.requiresGPU && specs.gpus.filter(g => g.detected).length === 0) {
        // Bonus for orchestrator if no GPU detected
        score += 10;
      }

      // Check network patterns for orchestrator (static IP, multiple interfaces)
      if (pcId === 'orchestrator-mini' && specs.isDockerHost) {
        score += 15;
      }

      scores[pcId as PCId] = score;
    }

    // Find the highest scoring PC
    const sortedPCs = (Object.keys(scores) as PCId[]).sort(
      (a, b) => scores[b] - scores[a]
    );
    const detectedPC = sortedPCs[0];
    const confidence = scores[detectedPC];

    // Find alternative PCs with similar scores
    const alternativePCs = sortedPCs
      .slice(1)
      .filter((pc) => scores[pc] >= confidence * 0.7);

    // Determine role
    const role: PCRole = detectedPC === 'orchestrator-mini' ? 'orchestrator' : 'worker';

    // Get recommended and skip components
    const { recommendedComponents, skipComponents } = this.getComponentRecommendations(
      detectedPC,
      specs
    );

    return {
      detectedPC,
      confidence,
      role,
      specs,
      alternativePCs: alternativePCs.length > 0 ? alternativePCs : undefined,
      recommendedComponents,
      skipComponents,
    };
  }

  /**
   * Get detailed system specifications
   */
  private static async getSystemSpecs(): Promise<PCDetectionResult['specs']> {
    const hostname = os.hostname();
    const cpu = this.getCPUInfo();
    const totalMemory = os.totalmem();
    const platform = os.platform();
    const gpus = await this.detectGPUs();
    const networkInterfaces = this.getNetworkInterfaces();
    const isDockerHost = await this.checkDockerHost();

    return {
      hostname,
      cpu,
      totalMemory,
      gpus,
      platform,
      networkInterfaces,
      isDockerHost,
    };
  }

  /**
   * Get CPU information
   */
  private static getCPUInfo(): string {
    const cpus = os.cpus();
    if (cpus.length > 0) {
      return cpus[0].model;
    }
    return 'Unknown CPU';
  }

  /**
   * Detect GPUs using nvidia-smi or wmic
   */
  private static async detectGPUs(): Promise<GPUInfo[]> {
    const gpus: GPUInfo[] = [];

    try {
      // Try nvidia-smi first (for NVIDIA GPUs)
      const { stdout } = await execAsync(
        'nvidia-smi --query-gpu=name,memory.total --format=csv,noheader'
      );
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        const [name, vram] = line.split(',').map((s) => s.trim());
        gpus.push({
          name,
          vendor: 'NVIDIA',
          vram: parseInt(vram),
          detected: true,
        });
      }
    } catch (error) {
      // nvidia-smi not available, try wmic (Windows)
      try {
        if (os.platform() === 'win32') {
          const { stdout } = await execAsync(
            'wmic path win32_VideoController get name'
          );
          const lines = stdout
            .trim()
            .split('\n')
            .slice(1)
            .filter((line) => line.trim());
          for (const line of lines) {
            const name = line.trim();
            const isNVIDIA = name.toLowerCase().includes('nvidia');
            gpus.push({
              name,
              vendor: isNVIDIA
                ? 'NVIDIA'
                : name.includes('AMD')
                ? 'AMD'
                : 'Unknown',
              detected: isNVIDIA, // Only count NVIDIA GPUs as "detected" for worker PCs
            });
          }
        }
      } catch (wmicError) {
        // No GPU detection available
      }
    }

    return gpus;
  }

  /**
   * Get network interface information
   */
  private static getNetworkInterfaces(): NetworkInfo[] {
    const interfaces = os.networkInterfaces();
    const networkInfo: NetworkInfo[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;

      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          // Check if it looks like a static IP (192.168.x.x pattern with lower numbers)
          const isStatic = addr.address.match(/^192\.168\.\d{1,2}\.\d{1,2}$/) !== null;
          networkInfo.push({
            name,
            address: addr.address,
            isStatic,
          });
        }
      }
    }

    return networkInfo;
  }

  /**
   * Check if Docker is running (indicates orchestrator)
   */
  private static async checkDockerHost(): Promise<boolean> {
    try {
      await execAsync('docker ps');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get component recommendations based on PC type
   */
  private static getComponentRecommendations(
    pcId: PCId,
    specs: PCDetectionResult['specs']
  ): {
    recommendedComponents: ComponentId[];
    skipComponents: ComponentId[];
  } {
    const recommendedComponents: ComponentId[] = ['claude-code', 'claude-flow', 'docker'];
    const skipComponents: ComponentId[] = [];

    if (pcId === 'orchestrator-mini') {
      // Orchestrator-specific components
      recommendedComponents.push('claude-desktop', 'wsl-setup', 'infisical');
      // Skip GPU components on orchestrator
      skipComponents.push('nvidia');
      // Gitea is optional but can be included
    } else {
      // Worker-specific components
      const hasGPU = specs.gpus.some((gpu) => gpu.detected);
      if (hasGPU) {
        recommendedComponents.push('nvidia');
      }
      // All PCs should have WSL available for dev; keep it recommended here
      recommendedComponents.push('wsl-setup');
      // Skip orchestrator-only components on workers (but NOT wsl-setup)
      skipComponents.push('claude-desktop', 'gitea', 'infisical');
    }

    return { recommendedComponents, skipComponents };
  }

  /**
   * Validate if a PC can run a specific PC configuration
   */
  static validatePCCompatibility(
    specs: PCDetectionResult['specs'],
    targetPC: PCId
  ): { compatible: boolean; issues: string[] } {
    const signature = this.PC_SIGNATURES[targetPC];
    const issues: string[] = [];

    // Check RAM requirements
    const ramGB = specs.totalMemory / (1024 * 1024 * 1024);
    if (ramGB < signature.minRAM) {
      issues.push(
        `Insufficient RAM: ${ramGB.toFixed(1)}GB (minimum: ${signature.minRAM}GB)`
      );
    }

    // Check GPU requirements
    if (signature.requiresGPU && specs.gpus.length === 0) {
      issues.push('GPU required but not detected');
    }

    return {
      compatible: issues.length === 0,
      issues,
    };
  }

  /**
   * Get PC-specific folder path
   */
  static getPCFolderPath(pcId: PCId, baseBootstrapPath: string): string {
    return `${baseBootstrapPath}/${pcId}`;
  }

  /**
   * Get shared configs folder path
   */
  static getConfigsFolderPath(baseBootstrapPath: string): string {
    return `${baseBootstrapPath}/configs`;
  }

  /**
   * Get shared scripts folder path
   */
  static getScriptsFolderPath(baseBootstrapPath: string): string {
    return `${baseBootstrapPath}/scripts`;
  }
}
