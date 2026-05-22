export interface WebSocketClientOptions {
  token?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  debug?: boolean;
}

export interface ClientMessage {
  type: "subscribe" | "unsubscribe" | "ping" | "query" | "command";
  payload?: any;
}

export interface ServerMessage {
  type: "connection" | "event" | "error" | "pong" | "response";
  sessionId?: string;
  payload?: any;
  timestamp: string;
}

export interface ConnectionInfo {
  sessionId: string;
  status: "connected";
  version: string;
  features: string[];
}

export interface SystemEvent {
  type: SystemEventType;
  source: string;
  timestamp: string;
  correlationId?: string;
  traceId?: string;
  state?: string;
  mode?: "live" | "mock";
  data: any;
}

export type ControlEventType =
  | "mcp_status"
  | "gpu_metrics"
  | "tool_discovery"
  | "agent_coordination"
  | "swarm_update"
  | "task_progress";

export type ProductEventChannel =
  | "lead:updates"
  | "hotlead:alerts"
  | "quote:viewed"
  | "quote:lock_expiring"
  | "campaign:reply"
  | "campaign:blocked"
  | "pipeline:milestone"
  | "service:health";

export type SystemEventType = ControlEventType | ProductEventChannel;

export interface ProductEvent extends SystemEvent {
  type: ProductEventChannel;
  correlationId: string;
  state: string;
  mode: "live" | "mock";
  data: Record<string, unknown>;
}

export interface MCPServerStatus {
  serverId: string;
  name: string;
  status: "online" | "offline" | "degraded";
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

export type EventCallback = (event: SystemEvent) => void;
export type ConnectionCallback = (connected: boolean) => void;
export type ErrorCallback = (error: Error) => void;
