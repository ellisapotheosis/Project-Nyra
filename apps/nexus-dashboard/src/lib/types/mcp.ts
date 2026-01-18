// MCP Server Configuration Types

export type MCPProtocol = 'stdio' | 'sse' | 'http';
export type MCPAuthType = 'none' | 'bearer' | 'basic';
export type MCPServerStatus = 'online' | 'offline' | 'error';

export interface MCPServerConfig {
  protocol: MCPProtocol;

  // STDIO specific
  command?: string;
  args?: string[];
  workingDir?: string;
  env?: Record<string, string>;

  // SSE specific
  sseUrl?: string;

  // HTTP specific
  httpUrl?: string;

  // Auth configuration
  authType: MCPAuthType;
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  customHeaders?: Record<string, string>;
}

export interface EnhancedMCPServer {
  id: string;
  name: string;
  description?: string;
  status: MCPServerStatus;
  protocol: MCPProtocol;
  config: MCPServerConfig;
  enabled: boolean;
  toolsCount: number;
  latency?: number;
  lastCheck?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  serverId: string;
  serverName: string;
  category?: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface MCPToolCallParams {
  toolId: string;
  parameters: Record<string, any>;
}

export interface MCPToolCallResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
}
