import { create } from 'zustand';

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

export interface DashboardMetrics {
  totalRequests: number;
  successRate: number;
  avgLatency: number;
  activeConnections: number;
  queuedTasks: number;
  totalCost: number;
}

interface NexusStore {
  // State
  servers: MCPServer[];
  tools: Tool[];
  gpuWorkers: GPUWorker[];
  modelRoutes: ModelRoute[];
  metrics: DashboardMetrics;
  wsConnected: boolean;

  // Actions
  setServers: (servers: MCPServer[]) => void;
  setTools: (tools: Tool[]) => void;
  setGPUWorkers: (workers: GPUWorker[]) => void;
  setModelRoutes: (routes: ModelRoute[]) => void;
  setMetrics: (metrics: DashboardMetrics) => void;
  setWSConnected: (connected: boolean) => void;
  updateServer: (id: string, updates: Partial<MCPServer>) => void;
  updateGPUWorker: (id: string, updates: Partial<GPUWorker>) => void;
  updateModelRoute: (id: string, updates: Partial<ModelRoute>) => void;
}

export const useNexusStore = create<NexusStore>((set) => ({
  servers: [],
  tools: [],
  gpuWorkers: [],
  modelRoutes: [],
  metrics: {
    totalRequests: 0,
    successRate: 0,
    avgLatency: 0,
    activeConnections: 0,
    queuedTasks: 0,
    totalCost: 0,
  },
  wsConnected: false,

  setServers: (servers) => set({ servers }),
  setTools: (tools) => set({ tools }),
  setGPUWorkers: (workers) => set({ gpuWorkers: workers }),
  setModelRoutes: (routes) => set({ modelRoutes: routes }),
  setMetrics: (metrics) => set({ metrics }),
  setWSConnected: (connected) => set({ wsConnected: connected }),

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
}));
