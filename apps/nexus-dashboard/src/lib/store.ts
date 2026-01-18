import { create } from 'zustand';
import { EnhancedMCPServer, MCPTool } from './types/mcp';

export interface MCPServer {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'error';
  url: string;
  tools: number;
  latency: number;
  lastCheck: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  server: string;
  category: string;
  parameters: Record<string, any>;
}

export interface GPUWorker {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'offline';
  gpuModel: string;
  vramTotal: number;
  vramUsed: number;
  utilization: number;
  temperature: number;
  tasksProcessed: number;
  currentModel?: string;
}

export interface ModelRoute {
  id: string;
  pattern: string;
  targetModel: string;
  priority: number;
  enabled: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  alias?: string;
  provider: string;
  contextLength: number;
  vramRequired?: number;
  supportsStreaming: boolean;
  supportsTools: boolean;
  costPer1kTokens: number;
  availability: 'online' | 'offline' | 'limited';
  discoveredAt: string;
  capabilities?: string[];
}

export interface DashboardMetrics {
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  activeConnections: number;
  queuedTasks: number;
  totalCost: number;
}

export interface AIProvider {
  id: string;
  name: string;
  type: 'anthropic' | 'aws-bedrock' | 'google' | 'openai' | 'openrouter' | 'meta' | 'cohere';
  status: 'online' | 'offline' | 'error';
  enabled: boolean;
  apiKey?: string;
  tokenForwarding: boolean;
  lastHealthCheck?: string;
  config?: Record<string, any>;
}

interface NexusStore {
  // State
  servers: MCPServer[];
  tools: Tool[];
  gpuWorkers: GPUWorker[];
  modelRoutes: ModelRoute[];
  models: AIModel[];
  metrics: DashboardMetrics;
  wsConnected: boolean;
  lastDiscovery?: string;
  providers: AIProvider[];

  // Enhanced MCP State
  enhancedServers: EnhancedMCPServer[];
  mcpTools: MCPTool[];

  // Actions
  setServers: (servers: MCPServer[]) => void;
  setTools: (tools: Tool[]) => void;
  setGPUWorkers: (workers: GPUWorker[]) => void;
  setModelRoutes: (routes: ModelRoute[]) => void;
  setModels: (models: AIModel[]) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setWSConnected: (connected: boolean) => void;
  setLastDiscovery: (timestamp: string) => void;
  updateServer: (id: string, updates: Partial<MCPServer>) => void;
  updateGPUWorker: (id: string, updates: Partial<GPUWorker>) => void;
  updateModelRoute: (id: string, updates: Partial<ModelRoute>) => void;
  setProviders: (providers: AIProvider[]) => void;
  updateProvider: (id: string, updates: Partial<AIProvider>) => void;
  addProvider: (provider: AIProvider) => void;
  removeProvider: (id: string) => void;

  // Enhanced MCP Actions
  setEnhancedServers: (servers: EnhancedMCPServer[]) => void;
  addEnhancedServer: (server: EnhancedMCPServer) => void;
  updateEnhancedServer: (id: string, updates: Partial<EnhancedMCPServer>) => void;
  deleteEnhancedServer: (id: string) => void;
  setMCPTools: (tools: MCPTool[]) => void;
}

export const useNexusStore = create<NexusStore>((set) => ({
  servers: [],
  tools: [],
  gpuWorkers: [],
  modelRoutes: [],
  models: [],
  metrics: {
    totalRequests: 0,
    successRate: 0,
    avgLatency: 0,
    activeConnections: 0,
    queuedTasks: 0,
    totalCost: 0,
  },
  wsConnected: false,
  lastDiscovery: undefined,
  providers: [],
  enhancedServers: [],
  mcpTools: [],

  setServers: (servers) => set({ servers }),
  setTools: (tools) => set({ tools }),
  setGPUWorkers: (workers) => set({ gpuWorkers: workers }),
  setModelRoutes: (routes) => set({ modelRoutes: routes }),
  setModels: (models) => set({ models }),
  setMetrics: (metrics) => set({ metrics }),
  setWSConnected: (connected) => set({ wsConnected: connected }),
  setLastDiscovery: (timestamp) => set({ lastDiscovery: timestamp }),

  updateServer: (id, updates) =>
    set((state) => ({
      servers: state.servers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  updateGPUWorker: (id, updates) =>
    set((state) => ({
      gpuWorkers: state.gpuWorkers.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    })),

  updateModelRoute: (id, updates) =>
    set((state) => ({
      modelRoutes: state.modelRoutes.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),

  setProviders: (providers) => set({ providers }),

  updateProvider: (id, updates) =>
    set((state) => ({
      providers: state.providers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  addProvider: (provider) =>
    set((state) => ({
      providers: [...state.providers, provider],
    })),

  removeProvider: (id) =>
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
    })),

  // Enhanced MCP Actions
  setEnhancedServers: (servers) => set({ enhancedServers: servers }),

  addEnhancedServer: (server) =>
    set((state) => ({
      enhancedServers: [...state.enhancedServers, server],
    })),

  updateEnhancedServer: (id, updates) =>
    set((state) => ({
      enhancedServers: state.enhancedServers.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  deleteEnhancedServer: (id) =>
    set((state) => ({
      enhancedServers: state.enhancedServers.filter((s) => s.id !== id),
    })),

  setMCPTools: (tools) => set({ mcpTools: tools }),
}));
