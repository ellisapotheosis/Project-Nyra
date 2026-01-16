/**
 * Windows Hardware Detection Implementation
 * Uses PowerShell and wmic commands
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

export class WindowsHardwareDetector implements HardwareDetectorService {
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
    try {
      const { stdout } = await execAsync('wmic os get Caption,Version,OSArchitecture /format:csv');
      const lines = stdout.trim().split('\n').filter(line => line.trim());

      if (lines.length > 1) {
        const [, caption, architecture, version] = lines[1].split(',');
        return {
          hostname: os.hostname(),
          platform: 'Windows',
          platformVersion: `${caption?.trim()} ${version?.trim()}`,
          architecture: architecture?.trim() || os.arch(),
        };
      }
    } catch (error) {
      console.error('System detection error:', error);
    }

    // Fallback
    return {
      hostname: os.hostname(),
      platform: 'Windows',
      platformVersion: os.release(),
      architecture: os.arch(),
    };
  }

  async detectCPU(): Promise<CPUInfo> {
    try {
      const { stdout } = await execAsync(
        'wmic cpu get Name,NumberOfCores,NumberOfLogicalProcessors,MaxClockSpeed,Manufacturer /format:csv'
      );
      const lines = stdout.trim().split('\n').filter(line => line.trim());

      if (lines.length > 1) {
        const [, manufacturer, maxSpeed, name, cores, threads] = lines[1].split(',');

        return {
          model: name?.trim() || 'Unknown CPU',
          cores: parseInt(cores?.trim() || '0', 10),
          threads: parseInt(threads?.trim() || '0', 10),
          architecture: os.arch(),
          maxFrequency: maxSpeed ? `${maxSpeed.trim()} MHz` : undefined,
          vendor: manufacturer?.trim(),
        };
      }
    } catch (error) {
      console.error('CPU detection error:', error);
    }

    // Fallback to os module
    const cpus = os.cpus();
    return {
      model: cpus[0]?.model || 'Unknown CPU',
      cores: cpus.length,
      threads: cpus.length,
      architecture: os.arch(),
      frequency: cpus[0]?.speed ? `${cpus[0].speed} MHz` : undefined,
    };
  }

  async detectRAM(): Promise<RAMInfo> {
    const modules: RAMModule[] = [];
    let totalGB = Math.round(os.totalmem() / (1024 ** 3));
    let type = 'Unknown';

    try {
      // Get physical memory details
      const { stdout } = await execAsync(
        'wmic memorychip get Capacity,Speed,MemoryType,Manufacturer,DeviceLocator /format:csv'
      );
      const lines = stdout.trim().split('\n').filter(line => line.trim());

      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const [, capacity, locator, manufacturer, memType, speed] = lines[i].split(',');

          if (capacity) {
            const sizeGB = Math.round(parseInt(capacity.trim(), 10) / (1024 ** 3));
            const ramType = this.getRAMType(parseInt(memType?.trim() || '0', 10));

            modules.push({
              size: `${sizeGB} GB`,
              type: ramType,
              speed: speed ? `${speed.trim()} MHz` : undefined,
              manufacturer: manufacturer?.trim(),
              slot: locator?.trim(),
            });

            if (ramType !== 'Unknown') {
              type = ramType;
            }
          }
        }
      }
    } catch (error) {
      console.error('RAM detection error:', error);
    }

    // If no modules detected, create a fallback
    if (modules.length === 0) {
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
      // Try nvidia-smi first for NVIDIA GPUs
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
        // nvidia-smi not available
      }

      // Fallback to wmic for all GPUs
      if (gpus.length === 0) {
        const { stdout } = await execAsync(
          'wmic path win32_VideoController get Name,AdapterRAM,DriverVersion /format:csv'
        );
        const lines = stdout.trim().split('\n').filter(line => line.trim());

        if (lines.length > 1) {
          for (let i = 1; i < lines.length; i++) {
            const [, ram, driver, name] = lines[i].split(',');

            if (name && !name.toLowerCase().includes('microsoft basic')) {
              const vramBytes = parseInt(ram?.trim() || '0', 10);
              const vramGB = vramBytes > 0 ? `${Math.round(vramBytes / (1024 ** 3))} GB` : 'Unknown';

              const isNvidia = name.toLowerCase().includes('nvidia');
              const isAMD = name.toLowerCase().includes('amd') || name.toLowerCase().includes('radeon');
              const isIntel = name.toLowerCase().includes('intel');

              gpus.push({
                model: name.trim(),
                vram: vramGB,
                driver: driver?.trim(),
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

    try {
      // Get network adapter information
      const { stdout } = await execAsync(
        'wmic nic where "NetEnabled=true" get Name,MACAddress,Speed /format:csv'
      );
      const lines = stdout.trim().split('\n').filter(line => line.trim());

      const osInterfaces = os.networkInterfaces();

      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const [, mac, name, speed] = lines[i].split(',');

          if (mac && name) {
            const macAddr = mac.trim().replace(/:/g, '-').toUpperCase();

            // Find corresponding IP from os.networkInterfaces()
            let ipv4: string | undefined;
            let ipv6: string | undefined;

            for (const [ifName, addrs] of Object.entries(osInterfaces)) {
              if (addrs) {
                for (const addr of addrs) {
                  if (addr.mac.replace(/:/g, '-').toUpperCase() === macAddr) {
                    if (addr.family === 'IPv4') {
                      ipv4 = addr.address;
                    } else if (addr.family === 'IPv6') {
                      ipv6 = addr.address;
                    }
                  }
                }
              }
            }

            const speedMbps = speed ? `${Math.round(parseInt(speed.trim(), 10) / 1000000)} Mbps` : undefined;

            interfaces.push({
              name: name.trim(),
              type: this.getNetworkType(name.trim()),
              macAddress: macAddr,
              ipv4,
              ipv6,
              isActive: true,
              speed: speedMbps,
            });
          }
        }
      }
    } catch (error) {
      console.error('Network detection error:', error);

      // Fallback to os.networkInterfaces()
      const osInterfaces = os.networkInterfaces();
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

  private getRAMType(memoryType: number): string {
    const types: Record<number, string> = {
      0: 'Unknown',
      20: 'DDR',
      21: 'DDR2',
      22: 'DDR2 FB-DIMM',
      24: 'DDR3',
      26: 'DDR4',
      34: 'DDR5',
    };
    return types[memoryType] || 'Unknown';
  }

  private getNetworkType(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('wi-fi') || lower.includes('wireless') || lower.includes('802.11')) {
      return 'Wi-Fi';
    } else if (lower.includes('ethernet') || lower.includes('local area')) {
      return 'Ethernet';
    } else if (lower.includes('bluetooth')) {
      return 'Bluetooth';
    } else {
      return 'Other';
    }
  }
}
