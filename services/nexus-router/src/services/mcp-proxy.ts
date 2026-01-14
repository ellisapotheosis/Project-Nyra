import axios, { AxiosInstance } from 'axios';
import Fuse from 'fuse.js';
import { createLogger } from '../utils/logger';
import { RedisClient } from './redis-client';

const logger = createLogger('mcp-proxy');

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  priority: number;
  tools?: MCPTool[];
  lastSync?: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  server: string;
}

export interface MCPRequest {
  method: string;
  params?: any;
}

export interface MCPResponse {
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface FuzzySearchResult {
  tool: MCPTool;
  score: number;
  matches: readonly any[];
}

export class MCPProxyService {
  private static instance: MCPProxyService;
  private servers: Map<string, MCPServer> = new Map();
  private allTools: MCPTool[] = [];
  private fuse: Fuse<MCPTool> | null = null;
  private axiosInstances: Map<string, AxiosInstance> = new Map();
  private redis: RedisClient;

  private constructor() {
    this.redis = RedisClient.getInstance();
  }

  public static getInstance(): MCPProxyService {
    if (!MCPProxyService.instance) {
      MCPProxyService.instance = new MCPProxyService();
    }
    return MCPProxyService.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing MCP Proxy Service...');

    // Load MCP servers from environment or configuration
    await this.loadMCPServers();

    // Sync tools from all servers
    await this.syncAllTools();

    // Initialize Fuse.js for fuzzy search
    this.initializeFuzzySearch();

    // Start periodic sync
    setInterval(() => this.syncAllTools(), 300000); // Every 5 minutes

    logger.info(`MCP Proxy initialized with ${this.servers.size} servers`);
  }

  private async loadMCPServers(): Promise<void> {
    // Load from environment variables
    const mcpServersEnv = process.env.MCP_SERVERS;
    if (mcpServersEnv) {
      try {
        const servers = JSON.parse(mcpServersEnv) as MCPServer[];
        for (const server of servers) {
          this.registerServer(server);
        }
      } catch (error) {
        logger.error('Failed to parse MCP_SERVERS env:', error);
      }
    }

    // Default MCP servers for Project Nyra
    const defaultServers: MCPServer[] = [
      {
        id: 'claude-flow',
        name: 'Claude Flow MCP',
        url: process.env.CLAUDE_FLOW_MCP_URL || 'http://localhost:9000/mcp',
        enabled: true,
        priority: 1,
      },
      {
        id: 'archon-os',
        name: 'Archon OS MCP',
        url: process.env.ARCHON_MCP_URL || 'http://localhost:9001/mcp',
        enabled: true,
        priority: 2,
      },
      {
        id: 'infisical',
        name: 'Infisical MCP',
        url: process.env.INFISICAL_MCP_URL || 'http://localhost:4002',
        enabled: true,
        priority: 3,
      },
      {
        id: 'bitwarden',
        name: 'Bitwarden MCP',
        url: process.env.BITWARDEN_MCP_URL || 'http://localhost:4003',
        enabled: false,
        priority: 4,
      },
    ];

    for (const server of defaultServers) {
      if (!this.servers.has(server.id)) {
        this.registerServer(server);
      }
    }
  }

  public registerServer(server: MCPServer): void {
    this.servers.set(server.id, server);
    this.axiosInstances.set(
      server.id,
      axios.create({
        baseURL: server.url,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
    logger.info(`Registered MCP server: ${server.name} (${server.url})`);
  }

  public unregisterServer(serverId: string): void {
    this.servers.delete(serverId);
    this.axiosInstances.delete(serverId);
    logger.info(`Unregistered MCP server: ${serverId}`);
  }

  private async syncAllTools(): Promise<void> {
    logger.debug('Syncing tools from all MCP servers...');

    const tools: MCPTool[] = [];

    for (const [serverId, server] of this.servers.entries()) {
      if (!server.enabled) continue;

      try {
        const serverTools = await this.fetchToolsFromServer(serverId);
        tools.push(...serverTools);
        server.tools = serverTools;
        server.lastSync = new Date();
        logger.debug(`Synced ${serverTools.length} tools from ${server.name}`);
      } catch (error) {
        logger.warn(`Failed to sync tools from ${server.name}:`, error);
      }
    }

    this.allTools = tools;
    this.initializeFuzzySearch();

    // Cache tools in Redis
    await this.redis.set('mcp:tools', JSON.stringify(tools), 300);

    logger.info(`Total tools available: ${tools.length}`);
  }

  private async fetchToolsFromServer(serverId: string): Promise<MCPTool[]> {
    const instance = this.axiosInstances.get(serverId);
    if (!instance) throw new Error(`No axios instance for server ${serverId}`);

    const response = await instance.post('/', {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 1,
    });

    if (response.data.error) {
      throw new Error(`MCP error: ${response.data.error.message}`);
    }

    const tools = response.data.result?.tools || [];
    return tools.map((tool: any) => ({
      ...tool,
      server: serverId,
    }));
  }

  private initializeFuzzySearch(): void {
    if (this.allTools.length === 0) {
      logger.warn('No tools available for fuzzy search initialization');
      return;
    }

    this.fuse = new Fuse(this.allTools, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'description', weight: 1 },
        { name: 'server', weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });

    logger.debug('Fuzzy search initialized with Fuse.js');
  }

  public fuzzySearchTools(query: string, limit: number = 10): FuzzySearchResult[] {
    if (!this.fuse) {
      logger.warn('Fuzzy search not initialized');
      return [];
    }

    const results = this.fuse.search(query, { limit });

    return results.map((result) => ({
      tool: result.item,
      score: result.score || 0,
      matches: result.matches || [],
    }));
  }

  public async proxyRequest(serverId: string, request: MCPRequest): Promise<MCPResponse> {
    const server = this.servers.get(serverId);
    if (!server) {
      return {
        error: {
          code: -32001,
          message: `Server '${serverId}' not found`,
        },
      };
    }

    if (!server.enabled) {
      return {
        error: {
          code: -32002,
          message: `Server '${serverId}' is disabled`,
        },
      };
    }

    const instance = this.axiosInstances.get(serverId);
    if (!instance) {
      return {
        error: {
          code: -32003,
          message: `No connection to server '${serverId}'`,
        },
      };
    }

    try {
      logger.debug(`Proxying ${request.method} to ${server.name}`);

      const response = await instance.post('/', {
        jsonrpc: '2.0',
        method: request.method,
        params: request.params,
        id: Date.now(),
      });

      // Update metrics
      await this.redis.incrementMetric(`mcp:${serverId}:requests`);

      return response.data;
    } catch (error) {
      logger.error(`MCP proxy error for ${server.name}:`, error);

      return {
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : 'Proxy request failed',
        },
      };
    }
  }

  public async callTool(toolName: string, params: any): Promise<any> {
    // Find the tool
    const tool = this.allTools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Proxy the call to the appropriate server
    const response = await this.proxyRequest(tool.server, {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    });

    if (response.error) {
      throw new Error(`Tool call failed: ${response.error.message}`);
    }

    return response.result;
  }

  public getAllServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  public getAllTools(): MCPTool[] {
    return this.allTools;
  }

  public getServerTools(serverId: string): MCPTool[] {
    return this.allTools.filter((tool) => tool.server === serverId);
  }

  public async getMetrics() {
    const metrics: Record<string, number> = {};

    for (const [serverId] of this.servers) {
      metrics[serverId] = await this.redis.getMetric(`mcp:${serverId}:requests`);
    }

    return {
      totalServers: this.servers.size,
      enabledServers: Array.from(this.servers.values()).filter((s) => s.enabled).length,
      totalTools: this.allTools.length,
      serverMetrics: metrics,
    };
  }
}
