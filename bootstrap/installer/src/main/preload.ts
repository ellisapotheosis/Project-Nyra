import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('bootstrap', {
  detectPCRole: () => ipcRenderer.invoke('detect-pc-role'),
  configureStaticIP: (config: { ip: string; role: string }) =>
    ipcRenderer.invoke('configure-static-ip', config),
  checkDocker: () => ipcRenderer.invoke('check-docker'),
  installDocker: () => ipcRenderer.invoke('install-docker'),
  setupTailscale: (authKey: string) => ipcRenderer.invoke('setup-tailscale', authKey),
  deployServices: (config: { role: string; ip: string }) =>
    ipcRenderer.invoke('deploy-services', config),
  configureGPUWorker: () => ipcRenderer.invoke('configure-gpu-worker'),
  healthCheck: () => ipcRenderer.invoke('health-check'),
  execPrivileged: (command: string) => ipcRenderer.invoke('exec-privileged', command),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  loadConfig: () => ipcRenderer.invoke('load-config'),

  // Phase 2 - New handlers
  installPrerequisites: (options: { skipDocker?: boolean; skipNodeJS?: boolean; silent?: boolean }) =>
    ipcRenderer.invoke('install-prerequisites', options),
  detectHardware: () => ipcRenderer.invoke('detect-hardware'),
  setupCloudflareTunnel: (config: { role: string; domain: string; tunnelName?: string; skipInstall?: boolean; skipDNS?: boolean }) =>
    ipcRenderer.invoke('setup-cloudflare-tunnel', config),
  detectGPU: () => ipcRenderer.invoke('detect-gpu'),
  setupVLLM: (config: { workerID: string; model: string; enableLMCache: boolean; redisHost: string; redisPort: number; maxModelLen: number; gpuMemoryUtilization: number }) =>
    ipcRenderer.invoke('setup-vllm', config),
  setupOllama: (config: { models: string[] }) =>
    ipcRenderer.invoke('setup-ollama', config),

  // Event listeners
  onDeploymentProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('deployment-progress', (event, data) => callback(data));
  },
  onGPUProgress: (callback: (data: any) => void) => {
    ipcRenderer.on('gpu-progress', (event, data) => callback(data));
  }
});

declare global {
  interface Window {
    bootstrap: {
      detectPCRole: () => Promise<any>;
      configureStaticIP: (config: { ip: string; role: string }) => Promise<any>;
      checkDocker: () => Promise<any>;
      installDocker: () => Promise<any>;
      setupTailscale: (authKey: string) => Promise<any>;
      deployServices: (config: { role: string; ip: string }) => Promise<any>;
      configureGPUWorker: () => Promise<any>;
      healthCheck: () => Promise<any>;
      execPrivileged: (command: string) => Promise<any>;
      saveConfig: (config: any) => Promise<any>;
      loadConfig: () => Promise<any>;
      // Phase 2 - New methods
      installPrerequisites: (options: { skipDocker?: boolean; skipNodeJS?: boolean; silent?: boolean }) => Promise<any>;
      detectHardware: () => Promise<any>;
      setupCloudflareTunnel: (config: { role: string; domain: string; tunnelName?: string; skipInstall?: boolean; skipDNS?: boolean }) => Promise<any>;
      detectGPU: () => Promise<any>;
      setupVLLM: (config: { workerID: string; model: string; enableLMCache: boolean; redisHost: string; redisPort: number; maxModelLen: number; gpuMemoryUtilization: number }) => Promise<any>;
      setupOllama: (config: { models: string[] }) => Promise<any>;
      onDeploymentProgress: (callback: (data: any) => void) => void;
      onGPUProgress: (callback: (data: any) => void) => void;
    };
  }
}
