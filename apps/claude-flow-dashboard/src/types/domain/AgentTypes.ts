export enum AgentStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  type: string;
  startedAt: string;
  completedAt?: string;
  metrics: {
    cpuUsage: number;
    memoryUsage: number;
  };
}

export interface AgentEvent {
  type: 'spawn' | 'status-change' | 'metric-update';
  agent: Agent;
  timestamp: string;
}