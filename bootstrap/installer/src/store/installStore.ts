import { create } from 'zustand';
import {
  PCId,
  ComponentId,
  InstallPhase,
  LogEntry,
  InstallState,
  EnvironmentType,
  MCPServer,
  ShimConfig,
  CloudflareTunnelConfig,
  CloudflareTunnelService,
} from '../types/manifest';
import { PCDetectionResult } from '../services/pcDetector';

interface ExtendedInstallState extends InstallState {
  selectedEnvironment: EnvironmentType | null;
  enabledMCPServers: Set<string>;
  shimConfigs: ShimConfig[];
  dockerServicesEnabled: Set<string>;
  cloudflareTunnel: CloudflareTunnelConfig | null;
  detectionResult: PCDetectionResult | null;
  isAutoDetected: boolean;
}

interface InstallStore extends ExtendedInstallState {
  // Actions
  selectPC: (pcId: PCId) => void;
  selectEnvironment: (env: EnvironmentType) => void;
  toggleComponent: (componentId: ComponentId) => void;
  toggleMCPServer: (serverId: string) => void;
  addShimConfig: (shim: ShimConfig) => void;
  toggleDockerService: (serviceName: string) => void;
  setCloudflareTunnel: (config: CloudflareTunnelConfig) => void;
  updateTunnelService: (serviceId: string, enabled: boolean) => void;
  setPhase: (phase: InstallPhase) => void;
  setProgress: (progress: number) => void;
  addLog: (log: Omit<LogEntry, 'timestamp'>) => void;
  addError: (error: Error) => void;
  setInstalling: (isInstalling: boolean) => void;
  setDetectionResult: (result: PCDetectionResult) => void;
  setAutoDetected: (isAuto: boolean) => void;
  reset: () => void;
}

const initialState: ExtendedInstallState = {
  selectedPC: null,
  selectedEnvironment: null,
  enabledComponents: new Set<ComponentId>(),
  enabledMCPServers: new Set<string>(['claude-flow']), // Default enabled
  shimConfigs: [],
  dockerServicesEnabled: new Set<string>(),
  cloudflareTunnel: null,
  detectionResult: null,
  isAutoDetected: false,
  currentPhase: 'selection',
  currentStep: 0,
  totalSteps: 10,
  progress: 0,
  logs: [],
  errors: [],
  isInstalling: false,
  canRollback: false,
};

export const useInstallStore = create<InstallStore>((set) => ({
  ...initialState,

  selectPC: (pcId) => set({ selectedPC: pcId }),

  selectEnvironment: (env) => set({ selectedEnvironment: env }),

  toggleComponent: (componentId) =>
    set((state) => {
      const newComponents = new Set(state.enabledComponents);
      if (newComponents.has(componentId)) {
        newComponents.delete(componentId);
      } else {
        newComponents.add(componentId);
      }
      return { enabledComponents: newComponents };
    }),

  toggleMCPServer: (serverId) =>
    set((state) => {
      const newServers = new Set(state.enabledMCPServers);
      if (newServers.has(serverId)) {
        newServers.delete(serverId);
      } else {
        newServers.add(serverId);
      }
      return { enabledMCPServers: newServers };
    }),

  addShimConfig: (shim) =>
    set((state) => ({
      shimConfigs: [...state.shimConfigs, shim],
    })),

  toggleDockerService: (serviceName) =>
    set((state) => {
      const newServices = new Set(state.dockerServicesEnabled);
      if (newServices.has(serviceName)) {
        newServices.delete(serviceName);
      } else {
        newServices.add(serviceName);
      }
      return { dockerServicesEnabled: newServices };
    }),

  setCloudflareTunnel: (config) =>
    set({ cloudflareTunnel: config }),

  updateTunnelService: (serviceId, enabled) =>
    set((state) => {
      if (!state.cloudflareTunnel) return state;

      const updatedServices = state.cloudflareTunnel.services.map((service) =>
        service.id === serviceId ? { ...service, enabled } : service
      );

      return {
        cloudflareTunnel: {
          ...state.cloudflareTunnel,
          services: updatedServices,
        },
      };
    }),

  setPhase: (phase) => set({ currentPhase: phase }),

  setProgress: (progress) => set({ progress }),

  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          ...log,
          timestamp: new Date(),
        },
      ],
    })),

  addError: (error) =>
    set((state) => ({
      errors: [...state.errors, error],
    })),

  setInstalling: (isInstalling) => set({ isInstalling }),

  setDetectionResult: (result) => set({ detectionResult: result }),

  setAutoDetected: (isAuto) => set({ isAutoDetected: isAuto }),

  reset: () => set(initialState),
}));
