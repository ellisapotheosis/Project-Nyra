const API_BASE = process.env.NEXT_PUBLIC_NEXUS_URL || 'http://localhost:8000';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Provider {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  baseUrl?: string;
  apiKey?: string;
  config?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  type: 'text' | 'image' | 'audio' | 'video';
  capabilities: string[];
  costPer1kTokens?: number;
  rateLimitPerMin?: number;
  contextWindow?: number;
  discoveredAt: string;
}

export interface SearchTerm {
  id: string;
  term: string;
  category?: string;
  frequency: number;
  lastUsed: string;
}

export interface RoutingConfig {
  id: string;
  name: string;
  description?: string;
  rules: RoutingRule[];
  defaultProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  condition: string;
  targetProvider: string;
  priority: number;
  weight: number;
}

export interface RoutingSimulation {
  input: string;
  selectedProvider: string;
  selectedModel: string;
  estimatedCost: number;
  estimatedLatency: number;
  matchedRules: RoutingRule[];
}

export interface MetricsData {
  timestamp: string;
  requestCount: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  totalCost: number;
  errorCount: number;
}

export interface MetricsHistory {
  period: 'hour' | 'day' | 'week' | 'month';
  data: MetricsData[];
}

export interface Trace {
  id: string;
  timestamp: string;
  requestId: string;
  provider: string;
  model: string;
  status: 'success' | 'error' | 'timeout';
  latency: number;
  tokens: number;
  cost: number;
  error?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, any>;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  type: 'local' | 'remote';
  status: 'connected' | 'disconnected' | 'error';
  tools: number;
  config?: Record<string, any>;
  lastHealthCheck?: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  serverId: string;
  inputSchema: Record<string, any>;
  outputSchema: Record<string, any>;
}

export interface ToolSearchResult {
  tools: Tool[];
  total: number;
}

export interface ToolCallResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
}

export interface Worker {
  id: string;
  name: string;
  type: 'agent' | 'processor' | 'monitor';
  status: 'idle' | 'busy' | 'error';
  taskCount: number;
  uptime: number;
  config?: Record<string, any>;
}

export interface WorkerDetails extends Worker {
  recentTasks: string[];
  metrics: {
    tasksProcessed: number;
    successRate: number;
    avgExecutionTime: number;
  };
}

export interface RateLimit {
  id: string;
  name: string;
  limit: number;
  window: 'minute' | 'hour' | 'day';
  current: number;
  resetAt: string;
}

export interface RateLimitStats {
  limits: RateLimit[];
  totalRequests: number;
  blockedRequests: number;
  resetTimes: Record<string, string>;
}

export interface OAuth2Config {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  scopes: string[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  actions: string[];
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  memberCount: number;
  createdAt: string;
}

export interface TokenTestResult {
  valid: boolean;
  expiresAt?: string;
  scopes?: string[];
  error?: string;
}

export interface APIError extends Error {
  status: number;
  data?: any;
}

// ============================================================================
// API CLIENT
// ============================================================================

export class NexusAPI {
  private static async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = new Error(
          `API Error: ${response.statusText}`
        ) as APIError;
        error.status = response.status;
        try {
          error.data = await response.json();
        } catch {
          error.data = null;
        }
        throw error;
      }

      return response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new Error(
        `API Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ========================================================================
  // PROVIDERS
  // ========================================================================

  static async getProviders(): Promise<Provider[]> {
    return this.fetch<Provider[]>('/api/providers');
  }

  static async addProvider(provider: Omit<Provider, 'id' | 'createdAt' | 'updatedAt'>): Promise<Provider> {
    return this.fetch<Provider>('/api/providers', {
      method: 'POST',
      body: JSON.stringify(provider),
    });
  }

  static async updateProvider(
    id: string,
    updates: Partial<Provider>
  ): Promise<Provider> {
    return this.fetch<Provider>(`/api/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteProvider(id: string): Promise<void> {
    await this.fetch<void>(`/api/providers/${id}`, {
      method: 'DELETE',
    });
  }

  static async testProvider(id: string): Promise<{ success: boolean; error?: string }> {
    return this.fetch<{ success: boolean; error?: string }>(
      `/api/providers/${id}/test`,
      {
        method: 'POST',
      }
    );
  }

  // ========================================================================
  // MODELS
  // ========================================================================

  static async getModels(providerId?: string): Promise<Model[]> {
    const query = providerId ? `?providerId=${providerId}` : '';
    return this.fetch<Model[]>(`/api/models${query}`);
  }

  static async getModelDetails(modelId: string): Promise<Model> {
    return this.fetch<Model>(`/api/models/${modelId}`);
  }

  static async refreshDiscovery(providerId?: string): Promise<{ discovered: number; total: number }> {
    return this.fetch<{ discovered: number; total: number }>(
      '/api/models/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ providerId }),
      }
    );
  }

  // ========================================================================
  // SEARCH TERMS
  // ========================================================================

  static async getSearchTerms(limit?: number): Promise<SearchTerm[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.fetch<SearchTerm[]>(`/api/search-terms${query}`);
  }

  static async addSearchTerm(term: string, category?: string): Promise<SearchTerm> {
    return this.fetch<SearchTerm>('/api/search-terms', {
      method: 'POST',
      body: JSON.stringify({ term, category }),
    });
  }

  static async updateSearchTerm(
    id: string,
    updates: Partial<SearchTerm>
  ): Promise<SearchTerm> {
    return this.fetch<SearchTerm>(`/api/search-terms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteSearchTerm(id: string): Promise<void> {
    await this.fetch<void>(`/api/search-terms/${id}`, {
      method: 'DELETE',
    });
  }

  // ========================================================================
  // ROUTING
  // ========================================================================

  static async getRoutingConfig(id?: string): Promise<RoutingConfig | RoutingConfig[]> {
    if (id) {
      return this.fetch<RoutingConfig>(`/api/routing/${id}`);
    }
    return this.fetch<RoutingConfig[]>('/api/routing');
  }

  static async updateRoutingConfig(
    id: string,
    updates: Partial<RoutingConfig>
  ): Promise<RoutingConfig> {
    return this.fetch<RoutingConfig>(`/api/routing/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async addRoutingRule(
    configId: string,
    rule: Omit<RoutingRule, 'id'>
  ): Promise<RoutingRule> {
    return this.fetch<RoutingRule>(`/api/routing/${configId}/rules`, {
      method: 'POST',
      body: JSON.stringify(rule),
    });
  }

  static async deleteRoutingRule(configId: string, ruleId: string): Promise<void> {
    await this.fetch<void>(`/api/routing/${configId}/rules/${ruleId}`, {
      method: 'DELETE',
    });
  }

  static async simulateRouting(
    configId: string,
    input: string
  ): Promise<RoutingSimulation> {
    return this.fetch<RoutingSimulation>(
      `/api/routing/${configId}/simulate`,
      {
        method: 'POST',
        body: JSON.stringify({ input }),
      }
    );
  }

  // ========================================================================
  // METRICS
  // ========================================================================

  static async getMetrics(): Promise<MetricsData> {
    return this.fetch<MetricsData>('/api/metrics');
  }

  static async getMetricsHistory(
    period: 'hour' | 'day' | 'week' | 'month'
  ): Promise<MetricsHistory> {
    return this.fetch<MetricsHistory>(`/api/metrics/history?period=${period}`);
  }

  static async getTraces(limit?: number, offset?: number): Promise<{ traces: Trace[]; total: number }> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<{ traces: Trace[]; total: number }>(
      `/api/metrics/traces${query}`
    );
  }

  static async getLogs(
    level?: string,
    limit?: number
  ): Promise<{ logs: LogEntry[]; total: number }> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.fetch<{ logs: LogEntry[]; total: number }>(
      `/api/metrics/logs${query}`
    );
  }

  // ========================================================================
  // MCP SERVERS
  // ========================================================================

  static async getMCPServers(): Promise<MCPServer[]> {
    return this.fetch<MCPServer[]>('/api/mcp/servers');
  }

  static async addMCPServer(
    server: Omit<MCPServer, 'id' | 'status' | 'tools'>
  ): Promise<MCPServer> {
    return this.fetch<MCPServer>('/api/mcp/servers', {
      method: 'POST',
      body: JSON.stringify(server),
    });
  }

  static async updateMCPServer(
    id: string,
    updates: Partial<MCPServer>
  ): Promise<MCPServer> {
    return this.fetch<MCPServer>(`/api/mcp/servers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteMCPServer(id: string): Promise<void> {
    await this.fetch<void>(`/api/mcp/servers/${id}`, {
      method: 'DELETE',
    });
  }

  static async testMCPServer(id: string): Promise<{ success: boolean; error?: string }> {
    return this.fetch<{ success: boolean; error?: string }>(
      `/api/mcp/servers/${id}/test`,
      {
        method: 'POST',
      }
    );
  }

  // ========================================================================
  // TOOLS
  // ========================================================================

  static async getTools(serverId?: string): Promise<Tool[]> {
    const query = serverId ? `?serverId=${serverId}` : '';
    return this.fetch<Tool[]>(`/api/tools${query}`);
  }

  static async searchTools(query: string, limit?: number): Promise<ToolSearchResult> {
    const params = new URLSearchParams({ q: query });
    if (limit) params.append('limit', limit.toString());
    return this.fetch<ToolSearchResult>(`/api/tools/search?${params.toString()}`);
  }

  static async callTool(
    toolId: string,
    input: Record<string, any>
  ): Promise<ToolCallResult> {
    return this.fetch<ToolCallResult>(`/api/tools/${toolId}/call`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  // ========================================================================
  // WORKERS
  // ========================================================================

  static async getWorkers(): Promise<Worker[]> {
    return this.fetch<Worker[]>('/api/workers');
  }

  static async getWorkerDetails(id: string): Promise<WorkerDetails> {
    return this.fetch<WorkerDetails>(`/api/workers/${id}`);
  }

  static async updateWorker(
    id: string,
    updates: Partial<Worker>
  ): Promise<Worker> {
    return this.fetch<Worker>(`/api/workers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // ========================================================================
  // RATE LIMITS
  // ========================================================================

  static async getRateLimits(): Promise<RateLimit[]> {
    return this.fetch<RateLimit[]>('/api/rate-limits');
  }

  static async updateRateLimits(limits: Partial<RateLimit>[]): Promise<RateLimit[]> {
    return this.fetch<RateLimit[]>('/api/rate-limits', {
      method: 'PATCH',
      body: JSON.stringify({ limits }),
    });
  }

  static async getRateLimitStats(): Promise<RateLimitStats> {
    return this.fetch<RateLimitStats>('/api/rate-limits/stats');
  }

  // ========================================================================
  // SECURITY
  // ========================================================================

  static async getOAuth2Config(): Promise<OAuth2Config> {
    return this.fetch<OAuth2Config>('/api/security/oauth2');
  }

  static async updateOAuth2Config(
    config: Partial<OAuth2Config>
  ): Promise<OAuth2Config> {
    return this.fetch<OAuth2Config>('/api/security/oauth2', {
      method: 'PATCH',
      body: JSON.stringify(config),
    });
  }

  static async testToken(token: string): Promise<TokenTestResult> {
    return this.fetch<TokenTestResult>('/api/security/token/test', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  static async getPermissions(): Promise<Permission[]> {
    return this.fetch<Permission[]>('/api/security/permissions');
  }

  static async updatePermissions(
    permissions: Partial<Permission>[]
  ): Promise<Permission[]> {
    return this.fetch<Permission[]>('/api/security/permissions', {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });
  }

  static async getGroups(): Promise<Group[]> {
    return this.fetch<Group[]>('/api/security/groups');
  }

  static async createGroup(group: Omit<Group, 'id' | 'memberCount' | 'createdAt'>): Promise<Group> {
    return this.fetch<Group>('/api/security/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  }

  // ========================================================================
  // WEBSOCKET
  // ========================================================================

  static connectMetricsWebSocket(
    onMessage: (data: any) => void,
    onError?: (error: Event) => void,
    onClose?: () => void
  ): WebSocket {
    const protocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = API_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const ws = new WebSocket(`${protocol}://${baseUrl}/ws/metrics`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    if (onError) {
      ws.onerror = onError;
    }

    if (onClose) {
      ws.onclose = onClose;
    }

    return ws;
  }

  static connectWebSocket(onMessage: (data: any) => void): WebSocket {
    const protocol = API_BASE.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = API_BASE.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const ws = new WebSocket(`${protocol}://${baseUrl}/ws`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    return ws;
  }

  // ========================================================================
  // LEGACY METHODS (for backward compatibility)
  // ========================================================================

  static async getServers() {
    return this.fetch('/api/servers');
  }

  static async getGPUWorkers() {
    return this.fetch('/api/gpu/workers');
  }

  static async getModelRoutes() {
    return this.fetch('/api/routes');
  }

  static async updateModelRoute(id: string, updates: any) {
    return this.fetch(`/api/routes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async testServer(serverId: string) {
    return this.fetch(`/api/servers/${serverId}/test`, {
      method: 'POST',
    });
  }
}
