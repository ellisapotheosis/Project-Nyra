// Claude Flow Event Server - Event Types

export enum EventType {
  // Agent Lifecycle Events
  AGENT_SPAWN = 'agent:spawn',
  AGENT_STATUS = 'agent:status',
  AGENT_COMPLETE = 'agent:complete',
  AGENT_ERROR = 'agent:error',

  // Task Events
  TASK_START = 'task:start',
  TASK_PROGRESS = 'task:progress',
  TASK_COMPLETE = 'task:complete',
  TASK_ERROR = 'task:error',

  // Message Events
  MESSAGE_INTER_AGENT = 'message:inter-agent',
  MESSAGE_SYSTEM = 'message:system',

  // Memory Events
  MEMORY_READ = 'memory:read',
  MEMORY_WRITE = 'memory:write',
  MEMORY_EVICTION = 'memory:eviction',

  // Topology Events
  TOPOLOGY_NODE_ADD = 'topology:node-add',
  TOPOLOGY_NODE_REMOVE = 'topology:node-remove',
  TOPOLOGY_EDGE_ADD = 'topology:edge-add',
  TOPOLOGY_EDGE_REMOVE = 'topology:edge-remove',

  // System Events
  SYSTEM_START = 'system:start',
  SYSTEM_HEARTBEAT = 'system:heartbeat'
}

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  source: string;
  traceId?: string;
}

export interface AgentEvent extends BaseEvent {
  agentId: string;
  agentType?: string;
  status?: string;
  payload?: any;
}

export interface TaskEvent extends BaseEvent {
  taskId: string;
  agentId?: string;
  progress?: number;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  dependencies?: string[];
  payload?: any;
}

export interface MessageEvent extends BaseEvent {
  senderId: string;
  recipientId?: string;
  messageType?: string;
  content: any;
}

export interface MemoryEvent extends BaseEvent {
  namespace: string;
  key: string;
  operation: 'read' | 'write' | 'evict';
  size?: number;
}

export interface TopologyEvent extends BaseEvent {
  nodeId?: string;
  edgeId?: string;
  action: 'add' | 'remove';
}

export interface SystemEvent extends BaseEvent {
  uptime?: number;
  connectionsCount?: number;
  systemLoad?: {
    cpu: number;
    memory: number;
  };
}