/**
 * Linux/macOS Hardware Detection Implementation
 * Uses bash commands (lscpu, dmidecode, lspci, etc.)
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import {
  HardwareDetectorService,
  HardwareInfo,
  SystemInfo,
  CPUInfo,
  RAMInfo,
  GPUInfo,
  NetworkInterface,
  RAMModule,
} from './hardwareDetector';

const execAsync = promisify(exec);

export class LinuxHardwareDetector implements HardwareDetectorService {
  private isMac = process.platform === 'darwin';

  async detectAll(): Promise<HardwareInfo> {
    const [system, cpu, ram, gpus, networkInterfaces] = await Promise.all([
      this.detectSystem(),
      this.detectCPU(),
      this.detectRAM(),
      this.detectGPU(),
      this.detectNetwork(),
    ]);

    return {
      system,
      cpu,
      ram,
      gpus,
      networkInterfaces,
      detectedAt: new Date(),
    };
  }

  async detectSystem(): Promise<SystemInfo> {
    let platformVersion = os.release();

    try {
      if (this.isMac) {
        const { stdout } = await execAsync('sw_vers');
        const lines = stdout.split('\n');
        const version = lines.find(l => l.includes('ProductVersion'))?.split(':')[1]?.trim();
        if (version) platformVersion = version;
      } else {
        // Try to get Linux distribution info
        try {
          const { stdout } = await execAsync('cat /etc/os-release');
          const prettyName = stdout.split('\n').find(l => l.startsWith('PRETTY_NAME='));
          if (prettyName) {
            platformVersion = prettyName.split('=')[1].replace(/"/g, '');
          }
        } catch {
          // Fallback to kernel version
        }
      }
    } catch (error) {
      console.error('System detection error:', error);
    }

    return {
      hostname: os.hostname(),
      platform: this.isMac ? 'macOS' : 'Linux',
      platformVersion,
      architecture: os.arch(),
    };
  }

  async detectCPU(): Promise<CPUInfo> {
    try {
      if (this.isMac) {
        return await this.detectCPUMac();
      } else {
        return await this.detectCPULinux();
      }
    } catch (error) {
      console.error('CPU detection error:', error);

      // Fallback
      const cpus = os.cpus();
      return {
        model: cpus[0]?.model || 'Unknown CPU',
        cores: cpus.length,
        threads: cpus.length,
        architecture: os.arch(),
        frequency: cpus[0]?.speed ? `${cpus[0].speed} MHz` : undefined,
      };
    }
  }

  private async detectCPUMac(): Promise<CPUInfo> {
    const { stdout: brandString } = await execAsync('sysctl -n machdep.cpu.brand_string');
    const { stdout: coresStr } = await execAsync('sysctl -n hw.physicalcpu');
    const { stdout: threadsStr } = await execAsync('sysctl -n hw.logicalcpu');

    return {
      model: brandString.trim(),
      cores: parseInt(coresStr.trim(), 10),
      threads: parseInt(threadsStr.trim(), 10),
      architecture: os.arch(),
      vendor: 'Apple/Intel',
    };
  }

  private async detectCPULinux(): Promise<CPUInfo> {
    const { stdout } = await execAsync('lscpu');
    const lines = stdout.split('\n');

    const modelLine = lines.find(l => l.includes('Model name:'));
    const coresLine = lines.find(l => l.includes('Core(s) per socket:'));
    const socketsLine = lines.find(l => l.includes('Socket(s):'));
    const threadsLine = lines.find(l => l.includes('Thread(s) per core:'));
    const vendorLine = lines.find(l => l.includes('Vendor ID:'));
    const freqLine = lines.find(l => l.includes('CPU MHz:'));
    const maxFreqLine = lines.find(l => l.includes('CPU max MHz:'));

    const model = modelLine?.split(':')[1]?.trim() || 'Unknown CPU';
    const coresPerSocket = parseInt(coresLine?.split(':')[1]?.trim() || '1', 10);
    const sockets = parseInt(socketsLine?.split(':')[1]?.trim() || '1', 10);
    const threadsPerCore = parseInt(threadsLine?.split(':')[1]?.trim() || '1', 10);
    const cores = coresPerSocket * sockets;
    const threads = cores * threadsPerCore;
    const vendor = vendorLine?.split(':')[1]?.trim();
    const freq = freqLine?.split(':')[1]?.trim();
    const maxFreq = maxFreqLine?.split(':')[1]?.trim();

    return {
      model,
      cores,
      threads,
      architecture: os.arch(),
      frequency: freq ? `${freq} MHz` : undefined,
      maxFrequency: maxFreq ? `${maxFreq} MHz` : undefined,
      vendor,
    };
  }

  async detectRAM(): Promise<RAMInfo> {
    const totalGB = Math.round(os.totalmem() / (1024 ** 3));
    const modules: RAMModule[] = [];
    let type = 'Unknown';

    try {
      if (this.isMac) {
        // macOS memory info is limited
        modules.push({
          size: `${totalGB} GB`,
          type: 'Unified Memory',
        });
        type = 'Unified Memory';
      } else {
        // Linux - try dmidecode (requires root)
        try {
          const { stdout } = await execAsync('sudo dmidecode -t memory');
          const sections = stdout.split('Memory Device');

          for (const section of sections) {
            if (section.includes('Size:') && !section.includes('No Module Installed')) {
              const sizeLine = section.split('\n').find(l => l.includes('Size:'));
              const typeLine = section.split('\n').find(l => l.includes('Type:') && !l.includes('Type Detail'));
              const speedLine = section.split('\n').find(l => l.includes('Speed:'));
              const mfgLine = section.split('\n').find(l => l.includes('Manufacturer:'));
              const locatorLine = section.split('\n').find(l => l.includes('Locator:') && !l.includes('Bank'));

              const size = sizeLine?.split(':')[1]?.trim();
              const ramType = typeLine?.split(':')[1]?.trim();
              const speed = speedLine?.split(':')[1]?.trim();
              const mfg = mfgLine?.split(':')[1]?.trim();
              const locator = locatorLine?.split(':')[1]?.trim();

              if (size && size !== 'No Module Installed') {
                modules.push({
                  size,
                  type: ramType || 'Unknown',
                  speed,
                  manufacturer: mfg,
                  slot: locator,
                });

                if (ramType) type = ramType;
              }
            }
          }
        } catch {
          // dmidecode requires root, fallback
          modules.push({
            size: `${totalGB} GB`,
            type: 'Unknown',
          });
        }
      }
    } catch (error) {
      console.error('RAM detection error:', error);
      modules.push({
        size: `${totalGB} GB`,
        type: 'Unknown',
      });
    }

    return {
      totalGB,
      type,
      speed: modules[0]?.speed,
      modules,
    };
  }

  async detectGPU(): Promise<GPUInfo[]> {
    const gpus: GPUInfo[] = [];

    try {
      if (this.isMac) {
        // macOS GPU detection
        const { stdout } = await execAsync('system_profiler SPDisplaysDataType');
        const lines = stdout.split('\n');

        let currentGPU: Partial<GPUInfo> | null = null;

        for (const line of lines) {
          if (line.includes('Chipset Model:')) {
            if (currentGPU) gpus.push(currentGPU as GPUInfo);
            const model = line.split(':')[1]?.trim();
            currentGPU = {
              model: model || 'Unknown GPU',
              vram: 'Unknown',
              vendor: model?.includes('Apple') ? 'Apple' : model?.includes('Intel') ? 'Intel' : 'AMD',
              isNvidia: false,
              isAMD: model?.toLowerCase().includes('amd') || false,
              isIntel: model?.toLowerCase().includes('intel') || false,
            };
          } else if (currentGPU && line.includes('VRAM')) {
            currentGPU.vram = line.split(':')[1]?.trim() || 'Unknown';
          }
        }

        if (currentGPU) gpus.push(currentGPU as GPUInfo);
      } else {
        // Linux - try nvidia-smi first
        try {
          const { stdout } = await execAsync(
            'nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader'
          );
          const lines = stdout.trim().split('\n');

          for (const line of lines) {
            const [name, vram, driver] = line.split(',').map(s => s.trim());
            gpus.push({
              model: name,
              vram: vram,
              driver: driver,
              vendor: 'NVIDIA',
              isNvidia: true,
              isAMD: false,
              isIntel: false,
            });
          }
        } catch {
          // nvidia-smi not available, try lspci
          const { stdout } = await execAsync('lspci | grep -i vga');
          const lines = stdout.trim().split('\n');

          for (const line of lines) {
            const parts = line.split(':');
            if (parts.length >= 3) {
              const model = parts.slice(2).join(':').trim();
              const isNvidia = model.toLowerCase().includes('nvidia');
              const isAMD = model.toLowerCase().includes('amd') || model.toLowerCase().includes('radeon');
              const isIntel = model.toLowerCase().includes('intel');

              gpus.push({
                model,
                vram: 'Unknown',
                vendor: isNvidia ? 'NVIDIA' : isAMD ? 'AMD' : isIntel ? 'Intel' : 'Unknown',
                isNvidia,
                isAMD,
                isIntel,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('GPU detection error:', error);
    }

    return gpus;
  }

  async detectNetwork(): Promise<NetworkInterface[]> {
    const interfaces: NetworkInterface[] = [];
    const osInterfaces = os.networkInterfaces();

    try {
      if (this.isMac) {
        // macOS network detection
        for (const [name, addrs] of Object.entries(osInterfaces)) {
          if (addrs && addrs.length > 0) {
            const ipv4 = addrs.find(a => a.family === 'IPv4')?.address;
            const ipv6 = addrs.find(a => a.family === 'IPv6')?.address;
            const mac = addrs[0].mac;

            if (mac !== '00:00:00:00:00:00') {
              interfaces.push({
                name,
                type: this.getNetworkType(name),
                macAddress: mac,
                ipv4,
                ipv6,
                isActive: !addrs[0].internal,
              });
            }
          }
        }
      } else {
        // Linux network detection with ip command
        const { stdout } = await execAsync('ip -o link show');
        const lines = stdout.trim().split('\n');

        for (const line of lines) {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const name = parts[1].trim();
            const macMatch = line.match(/link\/\w+\s+([0-9a-f:]+)/);
            const mac = macMatch ? macMatch[1] : undefined;

            if (mac && mac !== '00:00:00:00:00:00') {
              const addrs = osInterfaces[name];
              const ipv4 = addrs?.find(a => a.family === 'IPv4')?.address;
              const ipv6 = addrs?.find(a => a.family === 'IPv6')?.address;
              const isActive = line.includes('state UP');

              interfaces.push({
                name,
                type: this.getNetworkType(name),
                macAddress: mac,
                ipv4,
                ipv6,
                isActive,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Network detection error:', error);

      // Fallback
      for (const [name, addrs] of Object.entries(osInterfaces)) {
        if (addrs && addrs.length > 0) {
          const ipv4 = addrs.find(a => a.family === 'IPv4')?.address;
          const ipv6 = addrs.find(a => a.family === 'IPv6')?.address;
          const mac = addrs[0].mac;

          if (mac !== '00:00:00:00:00:00') {
            interfaces.push({
              name,
              type: this.getNetworkType(name),
              macAddress: mac,
              ipv4,
              ipv6,
              isActive: !addrs[0].internal,
            });
          }
        }
      }
    }

    return interfaces;
  }

  private getNetworkType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('wifi') || lower.includes('wlan') || lower.includes('wireless')) {
      return 'Wi-Fi';
    } else if (lower.includes('eth') || lower.includes('en') || lower.includes('ethernet')) {
      return 'Ethernet';
    } else if (lower.includes('bluetooth') || lower.includes('bt')) {
      return 'Bluetooth';
    } else if (lower.includes('lo') || lower.includes('loopback')) {
      return 'Loopback';
    } else {
      return 'Other';
    }
  }
}
