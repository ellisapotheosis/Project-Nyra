import { WebSocket } from 'ws';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export interface SessionData {
  ws: WebSocket;
  userId?: string;
  sessionId: string;
  permissions: string[];
  createdAt: Date;
  lastActivity: Date;
  subscriptions: Set<string>;
  metadata: Record<string, any>;
}

export interface AuthToken {
  userId: string;
  permissions: string[];
  exp?: number;
  iat?: number;
}

export interface SystemEvent {
  type: 'mcp_status' | 'gpu_metrics' | 'tool_discovery' | 'agent_coordination' | 'swarm_update' | 'task_progress';
  source: string;
  timestamp: string;
  data: any;
}

export interface MCPServerStatus {
  serverId: string;
  name: string;
  status: 'online' | 'offline' | 'degraded';
  url: string;
  toolCount: number;
  latency?: number;
  lastUpdate: string;
}

export interface GPUMetrics {
  workerId: string;
  gpuUtilization: number;
  memoryUsed: number;
  memoryTotal: number;
  temperature: number;
  powerUsage: number;
  activeModels: string[];
  timestamp: string;
}

export interface ToolDiscoveryEvent {
  serverId: string;
  tools: {
    name: string;
    description: string;
    inputSchema: any;
  }[];
  timestamp: string;
}

export interface AgentCoordinationMessage {
  agentId: string;
  agentType: string;
  action: 'spawn' | 'terminate' | 'status' | 'coordination';
  swarmId?: string;
  data: any;
  timestamp: string;
}

export interface ClientMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping' | 'query' | 'command';
  payload?: any;
}

export interface ServerMessage {
  type: 'connection' | 'event' | 'error' | 'pong' | 'response';
  sessionId?: string;
  payload?: any;
  timestamp: string;
}

export interface RateLimitConfig {
  points: number;
  duration: number;
  blockDuration: number;
}

export interface ServerMetrics {
  connections: number;
  activeSubscriptions: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
  uptime: number;
}
