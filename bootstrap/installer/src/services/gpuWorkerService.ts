/**
 * GPU Worker Service
 * Handles Wake-on-LAN, status checks, and GPU monitoring
 */

import { GPUWorker, WorkerStatus, WakeResult, SleepResult, GPUUtilization, HardwareDetectionConfig } from '../types/gpu-worker';

class GPUWorkerService {
  private workers: Map<string, GPUWorker> = new Map();
  private configPath: string = '../../../configs/hardware-detection.json';
  private statusCheckInterval: number = 30000; // 30 seconds
  private intervalId?: NodeJS.Timeout;

  /**
   * Load worker configuration from hardware-detection.json
   */
  async loadWorkers(): Promise<GPUWorker[]> {
    try {
      // In production, this would load from the actual config file
      // For now, we'll use a mock implementation
      const config = await this.loadHardwareConfig();

      const workers: GPUWorker[] = Object.entries(config.workers).map(([key, workerConfig]) => ({
        name: key,
        displayName: this.formatDisplayName(key),
        ...workerConfig,
        status: 'unknown' as WorkerStatus,
      }));

      workers.forEach(worker => {
        this.workers.set(worker.name, worker);
      });

      return workers;
    } catch (error) {
      console.error('Failed to load workers:', error);
      return [];
    }
  }

  /**
   * Load hardware detection config
   */
  private async loadHardwareConfig(): Promise<HardwareDetectionConfig> {
    // In production, this would read from the actual file
    // For GUI preview, return mock data
    return {
      version: "1.0.0",
      description: "Hardware detection configuration for GPU workers",
      workers: {
        "worker-rtx3090ti": {
          hostname: "nyra-rtx3090ti",
          ip: "10.0.0.4",
          mac: "XX:XX:XX:XX:XX:XX",
          gpu: {
            model: "RTX 3090 Ti",
            vram: "24GB",
            cuda_cores: 10752
          },
          wol_enabled: false,
          always_on: true,
          role: "primary-worker",
          ssh_user: "nyra",
          ssh_port: 22
        },
        "worker-rtx5090": {
          hostname: "nyra-rtx5090",
          ip: "10.0.0.5",
          mac: "YY:YY:YY:YY:YY:YY",
          gpu: {
            model: "RTX 5090",
            vram: "32GB",
            cuda_cores: 16384
          },
          wol_enabled: true,
          always_on: false,
          disconnectable: true,
          role: "mobile-worker",
          ssh_user: "nyra",
          ssh_port: 22
        },
        "worker-rtx3060": {
          hostname: "nyra-rtx3060",
          ip: "10.0.0.6",
          mac: "ZZ:ZZ:ZZ:ZZ:ZZ:ZZ",
          gpu: {
            model: "RTX 3060",
            vram: "12GB",
            cuda_cores: 3584
          },
          wol_enabled: true,
          always_on: false,
          disconnectable: true,
          role: "mobile-worker",
          ssh_user: "nyra",
          ssh_port: 22
        }
      },
      network: {
        subnet: "10.0.0.0/24",
        broadcast: "10.0.0.255",
        gateway: "10.0.0.1",
        wol_port: 9
      },
      notifications: {
        enabled: true,
        methods: ["desktop", "log"],
        webhook_url: null
      },
      monitoring: {
        boot_timeout: 120,
        ping_interval: 5,
        ssh_timeout: 10,
        gpu_check_enabled: true
      }
    };
  }

  /**
   * Format worker name for display
   */
  private formatDisplayName(name: string): string {
    return name
      .replace('worker-', '')
      .split('-')
      .map(part => part.toUpperCase())
      .join(' ');
  }

  /**
   * Check worker status (ping)
   */
  async checkWorkerStatus(workerName: string): Promise<WorkerStatus> {
    const worker = this.workers.get(workerName);
    if (!worker) return 'unknown';

    try {
      // Call the wake-gpu-worker.sh script to check status
      // In production, this would execute the script
      // For now, simulate status check
      const isOnline = await this.pingWorker(worker.ip);
      const newStatus: WorkerStatus = isOnline ? 'online' : 'offline';

      worker.status = newStatus;
      this.workers.set(workerName, worker);

      return newStatus;
    } catch (error) {
      console.error(`Failed to check status for ${workerName}:`, error);
      return 'error';
    }
  }

  /**
   * Ping worker to check if it's online
   */
  private async pingWorker(ip: string): Promise<boolean> {
    // In production, this would execute: ping -c 1 -W 1 ${ip}
    // For GUI preview, simulate ping
    return Math.random() > 0.5; // Random status for demo
  }

  /**
   * Wake worker using Wake-on-LAN
   */
  async wakeWorker(workerName: string): Promise<WakeResult> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      return {
        success: false,
        worker_name: workerName,
        status: 'error',
        error: 'Worker not found'
      };
    }

    try {
      // Update status to waking
      worker.status = 'waking';
      this.workers.set(workerName, worker);

      // In production, execute: ./scripts/orchestrator/wake-gpu-worker.sh ${workerName}
      // For GUI preview, simulate wake
      const result = await this.executeWakeScript(workerName);

      if (result.success) {
        worker.status = 'online';
        worker.last_wake_time = new Date().toISOString();
        worker.boot_time = result.boot_time;
      } else {
        worker.status = 'offline';
      }

      this.workers.set(workerName, worker);

      return result;
    } catch (error) {
      worker.status = 'error';
      this.workers.set(workerName, worker);

      return {
        success: false,
        worker_name: workerName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute wake script
   */
  private async executeWakeScript(workerName: string): Promise<WakeResult> {
    // In production, this would execute the actual bash script
    // For GUI preview, simulate wake sequence
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          worker_name: workerName,
          status: 'online',
          boot_time: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
          message: 'Worker woken successfully'
        });
      }, 2000); // Simulate 2 second wake
    });
  }

  /**
   * Sleep worker (graceful shutdown)
   */
  async sleepWorker(workerName: string): Promise<SleepResult> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      return {
        success: false,
        worker_name: workerName,
        status: 'error',
        error: 'Worker not found'
      };
    }

    try {
      // Update status to sleeping
      worker.status = 'sleeping';
      this.workers.set(workerName, worker);

      // In production, execute: ./bootstrap/orchestrator-mini/scripts/sleep-gpu-worker.sh ${workerName}
      const result = await this.executeSleepScript(workerName);

      if (result.success) {
        worker.status = 'offline';
        worker.last_sleep_time = new Date().toISOString();
      } else {
        worker.status = 'online';
      }

      this.workers.set(workerName, worker);

      return result;
    } catch (error) {
      worker.status = 'error';
      this.workers.set(workerName, worker);

      return {
        success: false,
        worker_name: workerName,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute sleep script
   */
  private async executeSleepScript(workerName: string): Promise<SleepResult> {
    // In production, this would execute the actual bash script
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          worker_name: workerName,
          status: 'offline',
          shutdown_time: Math.floor(Math.random() * 30) + 15, // 15-45 seconds
          message: 'Worker shutdown successfully'
        });
      }, 1500); // Simulate 1.5 second shutdown
    });
  }

  /**
   * Wake all WoL-enabled workers
   */
  async wakeAllWorkers(): Promise<WakeResult[]> {
    const wolWorkers = Array.from(this.workers.values()).filter(w => w.wol_enabled);
    const results = await Promise.all(
      wolWorkers.map(worker => this.wakeWorker(worker.name))
    );
    return results;
  }

  /**
   * Get GPU utilization for worker
   */
  async getGPUUtilization(workerName: string): Promise<GPUUtilization | null> {
    const worker = this.workers.get(workerName);
    if (!worker || worker.status !== 'online') return null;

    try {
      // In production, execute: ssh ${worker.ssh_user}@${worker.ip} nvidia-smi --query-gpu=...
      // For GUI preview, simulate GPU stats
      return {
        worker_name: workerName,
        gpu_name: worker.gpu.model,
        utilization: Math.floor(Math.random() * 100),
        memory_used: Math.floor(Math.random() * parseInt(worker.gpu.vram)),
        memory_total: parseInt(worker.gpu.vram),
        temperature: Math.floor(Math.random() * 40) + 40, // 40-80°C
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Failed to get GPU utilization for ${workerName}:`, error);
      return null;
    }
  }

  /**
   * Get all workers
   */
  getWorkers(): GPUWorker[] {
    return Array.from(this.workers.values());
  }

  /**
   * Start periodic status checks
   */
  startStatusMonitoring(interval: number = this.statusCheckInterval): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(async () => {
      const workers = this.getWorkers();
      await Promise.all(
        workers.map(worker => this.checkWorkerStatus(worker.name))
      );
    }, interval);
  }

  /**
   * Stop status monitoring
   */
  stopStatusMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}

export const gpuWorkerService = new GPUWorkerService();
