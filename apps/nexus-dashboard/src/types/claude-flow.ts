// Claude Flow Type Definitions

export interface ClaudeFlowStatus {
  user: {
    name: string;
    gitBranch: string;
    modelName: string;
  };
  v3Progress: {
    domainsCompleted: number;
    totalDomains: number;
    dddProgress: number;
    patternsLearned: number;
    sessionsCompleted: number;
  };
  security: {
    status: string;
    cvesFixed: number;
    totalCves: number;
  };
  swarm: {
    activeAgents: number;
    maxAgents: number;
    coordinationActive: boolean;
  };
  system: {
    memoryMB: number;
    contextPct: number;
    intelligencePct: number;
    subAgents: number;
  };
}

export interface Agent {
  id: string;
  type: string;
  status: 'idle' | 'active' | 'busy' | 'error';
  health: number;
  taskCount: number;
  domain?: string;
}

export interface SwarmStatus {
  swarmId: string;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star' | 'hybrid';
  agents: Agent[];
  activeAgents: number;
  maxAgents: number;
  coordinationActive: boolean;
  health: number;
}

export interface MemoryStats {
  totalEntries: number;
  namespaces: string[];
  memoryMB: number;
  indexSize: number;
  searchLatencyMs: number;
}

export interface Task {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  latency: number;
  throughput: number;
  requestsPerSecond: number;
}

export interface HookMetrics {
  totalHooks: number;
  activeHooks: number;
  successRate: number;
  averageLatency: number;
  recentExecutions: {
    hook: string;
    status: 'success' | 'failure';
    latency: number;
    timestamp: Date;
  }[];
}

export interface WorkerStatus {
  id: string;
  trigger: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  priority: 'low' | 'normal' | 'high' | 'critical';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
}

export interface NeuralStatus {
  patternsLearned: number;
  trainingEpochs: number;
  sonaAdaptationTime: number;
  modelAccuracy: number;
  recentPredictions: {
    input: string;
    prediction: string;
    confidence: number;
    timestamp: Date;
  }[];
}

export interface SessionInfo {
  id: string;
  name: string;
  startedAt: Date;
  lastActivity: Date;
  tasksCompleted: number;
  agentsSpawned: number;
}
