/**
 * GPU Worker Management Types
 * Types for Wake-on-LAN and GPU worker management
 */

export interface GPUInfo {
  model: string;
  vram: string;
  cuda_cores: number;
  utilization?: number;
  memory_used?: number;
  memory_total?: number;
  temperature?: number;
}

export interface GPUWorker {
  name: string;
  displayName: string;
  hostname: string;
  ip: string;
  mac: string;
  gpu: GPUInfo;
  wol_enabled: boolean;
  always_on: boolean;
  disconnectable?: boolean;
  role: 'primary-worker' | 'mobile-worker' | 'worker';
  ssh_user: string;
  ssh_port: number;
  status: WorkerStatus;
  last_wake_time?: string;
  last_sleep_time?: string;
  boot_time?: number; // seconds
}

export type WorkerStatus = 'online' | 'offline' | 'waking' | 'sleeping' | 'error' | 'unknown';

export interface WakeResult {
  success: boolean;
  worker_name: string;
  status: WorkerStatus;
  boot_time?: number;
  message?: string;
  error?: string;
}

export interface SleepResult {
  success: boolean;
  worker_name: string;
  status: WorkerStatus;
  shutdown_time?: number;
  message?: string;
  error?: string;
}

export interface GPUUtilization {
  worker_name: string;
  gpu_name: string;
  utilization: number;
  memory_used: number;
  memory_total: number;
  temperature: number;
  timestamp: string;
}

export interface WorkerNotification {
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  worker_name?: string;
  timestamp: string;
}

export interface HardwareDetectionConfig {
  version: string;
  description: string;
  workers: Record<string, Omit<GPUWorker, 'status' | 'displayName' | 'name'>>;
  network: {
    subnet: string;
    broadcast: string;
    gateway: string;
    wol_port: number;
  };
  notifications: {
    enabled: boolean;
    methods: string[];
    webhook_url: string | null;
  };
  monitoring: {
    boot_timeout: number;
    ping_interval: number;
    ssh_timeout: number;
    gpu_check_enabled: boolean;
  };
}
