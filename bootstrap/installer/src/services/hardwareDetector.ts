/**
 * Hardware Detection Service
 * Cross-platform hardware detection using system tools
 */

export interface NetworkInterface {
  name: string;
  type: string;
  macAddress: string;
  ipv4?: string;
  ipv6?: string;
  isActive: boolean;
  speed?: string;
}

export interface CPUInfo {
  model: string;
  cores: number;
  threads: number;
  architecture: string;
  frequency?: string;
  maxFrequency?: string;
  vendor?: string;
}

export interface RAMInfo {
  totalGB: number;
  type: string; // DDR4, DDR5, etc.
  speed?: string; // MHz
  modules: RAMModule[];
}

export interface RAMModule {
  size: string;
  type: string;
  speed?: string;
  manufacturer?: string;
  slot?: string;
}

export interface GPUInfo {
  model: string;
  vram: string;
  driver?: string;
  vendor: string;
  isNvidia: boolean;
  isAMD: boolean;
  isIntel: boolean;
}

export interface SystemInfo {
  hostname: string;
  platform: string;
  platformVersion: string;
  architecture: string;
}

export interface HardwareInfo {
  system: SystemInfo;
  cpu: CPUInfo;
  ram: RAMInfo;
  gpus: GPUInfo[];
  networkInterfaces: NetworkInterface[];
  detectedAt: Date;
}

export interface HardwareDetectorService {
  detectAll(): Promise<HardwareInfo>;
  detectSystem(): Promise<SystemInfo>;
  detectCPU(): Promise<CPUInfo>;
  detectRAM(): Promise<RAMInfo>;
  detectGPU(): Promise<GPUInfo[]>;
  detectNetwork(): Promise<NetworkInterface[]>;
}

/**
 * Factory to get platform-specific hardware detector
 */
export async function getHardwareDetector(): Promise<HardwareDetectorService> {
  const platform = process.platform;

  if (platform === 'win32') {
    const { WindowsHardwareDetector } = await import('./hardwareDetector.windows');
    return new WindowsHardwareDetector();
  } else if (platform === 'linux' || platform === 'darwin') {
    const { LinuxHardwareDetector } = await import('./hardwareDetector.linux');
    return new LinuxHardwareDetector();
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Quick detection for basic info
 */
export async function quickDetect(): Promise<Partial<HardwareInfo>> {
  const os = await import('os');

  return {
    system: {
      hostname: os.hostname(),
      platform: process.platform,
      platformVersion: os.release(),
      architecture: os.arch(),
    },
    cpu: {
      model: os.cpus()[0]?.model || 'Unknown',
      cores: os.cpus().length,
      threads: os.cpus().length,
      architecture: os.arch(),
    },
    ram: {
      totalGB: Math.round(os.totalmem() / (1024 ** 3)),
      type: 'Unknown',
      modules: [],
    },
    detectedAt: new Date(),
  };
}
