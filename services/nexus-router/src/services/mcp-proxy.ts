import axios, { AxiosInstance } from "axios";
import Fuse from "fuse.js";
import { spawn, ChildProcess } from "child_process";
import * as EventSourceModule from "eventsource";
import { createLogger } from "../utils/logger";
import { RedisClient } from "./redis-client";

const EventSource = (EventSourceModule as any).default || EventSourceModule;

const logger = createLogger("mcp-proxy");

export type MCPProtocol = "stdio" | "sse" | "http";

export interface MCPServerConfig {
  // STDIO config
  command?: string;
  args?: string[];
  workingDir?: string;
  env?: Record<string, string>;

  // SSE/HTTP config
  url?: string;
  baseURL?: string;
}

export interface MCPServerAuth {
  type: "bearer" | "basic" | "none";
  token?: string;
  username?: string;
  password?: string;
  headers?: Record<string, string>;
}

export interface MCPServer {
  id: string;
  name: string;
  protocol: MCPProtocol;
  config: MCPServerConfig;
  auth?: MCPServerAuth;
  enabled: boolean;
  priority: number;
  tools?: MCPTool[];
  lastSync?: Date;
  status?: "connected" | "disconnected" | "error";
  errorMessage?: string;
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
  private stdioProcesses: Map<string, ChildProcess> = new Map();
  private sseConnections: Map<string, EventSource> = new Map();
  private redis: RedisClient;
  private syncInterval?: NodeJS.Timeout;

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
    logger.info("Initializing MCP Proxy Service...");

    // Load MCP servers from environment or configuration
    await this.loadMCPServers();

    // Sync tools from all servers
    await this.syncAllTools();

    // Initialize Fuse.js for fuzzy search
    this.initializeFuzzySearch();

    // Start periodic sync
    this.syncInterval = setInterval(() => this.syncAllTools(), 300000); // Every 5 minutes

    logger.info(`MCP Proxy initialized with ${this.servers.size} servers`);
  }

  public shutdown(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }

    for (const process of this.stdioProcesses.values()) {
      if (!process.killed) process.kill();
    }
    this.stdioProcesses.clear();

    for (const connection of this.sseConnections.values()) {
      (connection as any).close?.();
    }
    this.sseConnections.clear();
    this.axiosInstances.clear();
  }

  private async loadMCPServers(): Promise<void> {
    // Load from environment variables
    const mcpServersEnv = process.env.MCP_SERVERS;
    if (mcpServersEnv) {
      try {
        const servers = JSON.parse(mcpServersEnv) as MCPServer[];
        for (const server of servers) {
          await this.registerServer(server);
        }
      } catch (error) {
        logger.error("Failed to parse MCP_SERVERS env:", error);
      }
    }

    // Default MCP servers for Project Nyra
    const defaultServers: MCPServer[] = [
      {
        id: "github",
        name: "GitHub MCP",
        protocol: "http",
        config: {
          url: process.env.GITHUB_MCP_URL || "http://github-mcp:8813",
        },
        enabled: true,
        priority: 2,
      },
      {
        id: "git",
        name: "Git MCP",
        protocol: "http",
        config: {
          url: process.env.GIT_MCP_URL || "http://git-mcp:8812",
        },
        enabled: true,
        priority: 3,
      },
      {
        id: "bitwarden",
        name: "Bitwarden MCP",
        protocol: "http",
        config: {
          url: process.env.BITWARDEN_MCP_URL || "http://bitwarden-mcp:8814",
        },
        enabled: true,
        priority: 4,
      },
      {
        id: "infisical",
        name: "Infisical MCP",
        protocol: "http",
        config: {
          url: process.env.INFISICAL_MCP_URL || "http://infisical-mcp:8815",
        },
        enabled: true,
        priority: 5,
      },
      {
        id: "docker",
        name: "Docker MCP",
        protocol: "http",
        config: {
          url: process.env.DOCKER_MCP_URL || "http://docker-mcp-toolkit:8811",
        },
        enabled: true,
        priority: 6,
      },
      {
        id: "twentycrm",
        name: "TwentyCRM MCP",
        protocol: "http",
        config: {
          url: process.env.TWENTYCRM_MCP_URL || "http://twentycrm-mcp:8182",
        },
        enabled: true,
        priority: 7,
      },
      {
        id: "gemini",
        name: "Gemini MCP",
        protocol: "http",
        config: {
          url: process.env.GEMINI_MCP_URL || "http://gemini-mcp:8085/mcp",
        },
        enabled: true,
        priority: 8,
      },
      {
        id: "sequential-thinking",
        name: "Sequential Thinking MCP",
        protocol: "http",
        config: {
          url:
            process.env.SEQUENTIAL_THINKING_MCP_URL ||
            "http://sequential-thinking-mcp:8093/mcp",
        },
        enabled: true,
        priority: 9,
      },
    ];

    for (const server of defaultServers) {
      if (!this.servers.has(server.id)) {
        await this.registerServer(server);
      }
    }
  }

  public async registerServer(server: MCPServer): Promise<void> {
    try {
      // Initialize connection based on protocol
      switch (server.protocol) {
        case "stdio":
          await this.initializeStdioConnection(server);
          break;
        case "sse":
          await this.initializeSseConnection(server);
          break;
        case "http":
          await this.initializeHttpConnection(server);
          break;
        default:
          throw new Error(`Unsupported protocol: ${server.protocol}`);
      }

      server.status = "connected";
      this.servers.set(server.id, server);
      logger.info(`Registered MCP server: ${server.name} (${server.protocol})`);
    } catch (error) {
      server.status = "error";
      server.errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.servers.set(server.id, server);
      logger.error(`Failed to register MCP server ${server.name}:`, error);
      throw error;
    }
  }

  public async unregisterServer(serverId: string): Promise<void> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    // Clean up connections based on protocol
    switch (server.protocol) {
      case "stdio":
        await this.cleanupStdioConnection(serverId);
        break;
      case "sse":
        this.cleanupSseConnection(serverId);
        break;
      case "http":
        this.axiosInstances.delete(serverId);
        break;
    }

    this.servers.delete(serverId);
    logger.info(`Unregistered MCP server: ${serverId}`);
  }

  private async initializeStdioConnection(server: MCPServer): Promise<void> {
    if (!server.config.command) {
      throw new Error("STDIO protocol requires command in config");
    }

    const childProcess = spawn(
      server.config.command,
      server.config.args || [],
      {
        cwd: server.config.workingDir,
        env: { ...process.env, ...server.config.env },
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    childProcess.on("error", (error) => {
      logger.error(`STDIO process error for ${server.name}:`, error);
      server.status = "error";
      server.errorMessage = error.message;
    });

    childProcess.on("exit", (code) => {
      logger.warn(`STDIO process exited for ${server.name} with code ${code}`);
      server.status = "disconnected";
    });

    this.stdioProcesses.set(server.id, childProcess);
  }

  private async initializeSseConnection(server: MCPServer): Promise<void> {
    if (!server.config.url) {
      throw new Error("SSE protocol requires url in config");
    }

    const headers: Record<string, string> = {
      "Content-Type": "text/event-stream",
      ...this.getAuthHeaders(server.auth),
    };

    const eventSource = new EventSource(server.config.url, { headers });

    eventSource.on("error", (error: any) => {
      logger.error(`SSE connection error for ${server.name}:`, error);
      server.status = "error";
      server.errorMessage = error.message || "SSE connection failed";
    });

    eventSource.on("open", () => {
      logger.info(`SSE connection opened for ${server.name}`);
      server.status = "connected";
    });

    this.sseConnections.set(server.id, eventSource);
  }

  private async initializeHttpConnection(server: MCPServer): Promise<void> {
    if (!server.config.url && !server.config.baseURL) {
      throw new Error("HTTP protocol requires url or baseURL in config");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeaders(server.auth),
    };

    const instance = axios.create({
      baseURL: server.config.url || server.config.baseURL,
      timeout: 30000,
      headers,
    });

    this.axiosInstances.set(server.id, instance);
  }

  private getAuthHeaders(auth?: MCPServerAuth): Record<string, string> {
    if (!auth || auth.type === "none") {
      return {};
    }

    const headers: Record<string, string> = { ...auth.headers };

    if (auth.type === "bearer" && auth.token) {
      headers["Authorization"] = `Bearer ${auth.token}`;
    } else if (auth.type === "basic" && auth.username && auth.password) {
      const credentials = Buffer.from(
        `${auth.username}:${auth.password}`
      ).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    return headers;
  }

  private async cleanupStdioConnection(serverId: string): Promise<void> {
    const childProcess = this.stdioProcesses.get(serverId);
    if (childProcess) {
      childProcess.kill();
      this.stdioProcesses.delete(serverId);
    }
  }

  private cleanupSseConnection(serverId: string): void {
    const eventSource = this.sseConnections.get(serverId);
    if (eventSource) {
      eventSource.close();
      this.sseConnections.delete(serverId);
    }
  }

  private async syncAllTools(): Promise<void> {
    logger.debug("Syncing tools from all MCP servers...");

    const tools: MCPTool[] = [];

    for (const [serverId, server] of Array.from(this.servers.entries())) {
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
    await this.redis.set("mcp:tools", JSON.stringify(tools), 300);

    logger.info(`Total tools available: ${tools.length}`);
  }

  private async fetchToolsFromServer(serverId: string): Promise<MCPTool[]> {
    const instance = this.axiosInstances.get(serverId);
    if (!instance) throw new Error(`No axios instance for server ${serverId}`);

    const response = await instance.post("/", {
      jsonrpc: "2.0",
      method: "tools/list",
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
      logger.warn("No tools available for fuzzy search initialization");
      return;
    }

    this.fuse = new Fuse(this.allTools, {
      keys: [
        { name: "name", weight: 2 },
        { name: "description", weight: 1 },
        { name: "server", weight: 0.5 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });

    logger.debug("Fuzzy search initialized with Fuse.js");
  }

  public fuzzySearchTools(
    query: string,
    limit: number = 10
  ): FuzzySearchResult[] {
    if (!this.fuse) {
      logger.warn("Fuzzy search not initialized");
      return [];
    }

    const results = this.fuse.search(query, { limit });

    return results.map((result) => ({
      tool: result.item,
      score: result.score || 0,
      matches: result.matches || [],
    }));
  }

  public async updateServer(
    serverId: string,
    updates: Partial<MCPServer>
  ): Promise<MCPServer> {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    // If protocol or config changed, need to reconnect
    const protocolChanged =
      updates.protocol && updates.protocol !== server.protocol;
    const configChanged =
      updates.config &&
      JSON.stringify(updates.config) !== JSON.stringify(server.config);

    if (protocolChanged || configChanged) {
      // Clean up old connection
      await this.unregisterServer(serverId);

      // Register with new config
      const updatedServer = { ...server, ...updates };
      await this.registerServer(updatedServer);
      return updatedServer;
    }

    // Simple updates without reconnection
    const updatedServer = { ...server, ...updates };
    this.servers.set(serverId, updatedServer);
    logger.info(`Updated MCP server: ${serverId}`);
    return updatedServer;
  }

  public async testConnection(
    serverId: string
  ): Promise<{ success: boolean; message: string; latency?: number }> {
    const server = this.servers.get(serverId);
    if (!server) {
      return { success: false, message: `Server ${serverId} not found` };
    }

    const startTime = Date.now();

    try {
      switch (server.protocol) {
        case "stdio":
          return await this.testStdioConnection(server);
        case "sse":
          return await this.testSseConnection(server);
        case "http":
          return await this.testHttpConnection(server, startTime);
        default:
          return {
            success: false,
            message: `Unsupported protocol: ${server.protocol}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Connection test failed",
      };
    }
  }

  private async testStdioConnection(
    server: MCPServer
  ): Promise<{ success: boolean; message: string; latency?: number }> {
    const childProcess = this.stdioProcesses.get(server.id);
    if (!childProcess || childProcess.killed) {
      return { success: false, message: "STDIO process not running" };
    }

    // Send a simple ping via stdin and wait for response
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, message: "STDIO connection timeout" });
      }, 5000);

      const pingRequest =
        JSON.stringify({
          jsonrpc: "2.0",
          method: "ping",
          id: Date.now(),
        }) + "\n";

      const startTime = Date.now();

      const handleData = (data: Buffer) => {
        clearTimeout(timeout);
        const latency = Date.now() - startTime;
        childProcess.stdout?.off("data", handleData);
        resolve({
          success: true,
          message: "STDIO connection healthy",
          latency,
        });
      };

      childProcess.stdout?.once("data", handleData);
      childProcess.stdin?.write(pingRequest);
    });
  }

  private async testSseConnection(
    server: MCPServer
  ): Promise<{ success: boolean; message: string }> {
    const eventSource = this.sseConnections.get(server.id);
    if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
      return { success: false, message: "SSE connection not open" };
    }

    return { success: true, message: "SSE connection healthy" };
  }

  private async testHttpConnection(
    server: MCPServer,
    startTime: number
  ): Promise<{ success: boolean; message: string; latency?: number }> {
    const instance = this.axiosInstances.get(server.id);
    if (!instance) {
      return { success: false, message: "HTTP client not initialized" };
    }

    try {
      const response = await instance.post("/", {
        jsonrpc: "2.0",
        method: "ping",
        id: Date.now(),
      });

      const latency = Date.now() - startTime;

      if (response.status === 200) {
        return { success: true, message: "HTTP connection healthy", latency };
      }

      return { success: false, message: `HTTP error: ${response.status}` };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "HTTP connection failed",
      };
    }
  }

  public async proxyRequest(
    serverId: string,
    request: MCPRequest
  ): Promise<MCPResponse> {
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

    try {
      logger.debug(
        `Proxying ${request.method} to ${server.name} via ${server.protocol}`
      );

      let response: MCPResponse;

      switch (server.protocol) {
        case "stdio":
          response = await this.proxyStdioRequest(serverId, request);
          break;
        case "sse":
          response = await this.proxySseRequest(serverId, request);
          break;
        case "http":
          response = await this.proxyHttpRequest(serverId, request);
          break;
        default:
          return {
            error: {
              code: -32004,
              message: `Unsupported protocol: ${server.protocol}`,
            },
          };
      }

      // Update metrics
      await this.redis.incrementMetric(`mcp:${serverId}:requests`);

      return response;
    } catch (error) {
      logger.error(`MCP proxy error for ${server.name}:`, error);

      return {
        error: {
          code: -32000,
          message:
            error instanceof Error ? error.message : "Proxy request failed",
        },
      };
    }
  }

  private async proxyStdioRequest(
    serverId: string,
    request: MCPRequest
  ): Promise<MCPResponse> {
    const childProcess = this.stdioProcesses.get(serverId);
    if (!childProcess || childProcess.killed) {
      return {
        error: {
          code: -32003,
          message: "STDIO process not running",
        },
      };
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          error: {
            code: -32000,
            message: "STDIO request timeout",
          },
        });
      }, 30000);

      const jsonrpcRequest =
        JSON.stringify({
          jsonrpc: "2.0",
          method: request.method,
          params: request.params,
          id: Date.now(),
        }) + "\n";

      const handleData = (data: Buffer) => {
        clearTimeout(timeout);
        childProcess.stdout?.off("data", handleData);

        try {
          const response = JSON.parse(data.toString());
          resolve(response);
        } catch (error) {
          resolve({
            error: {
              code: -32700,
              message: "Failed to parse STDIO response",
            },
          });
        }
      };

      childProcess.stdout?.once("data", handleData);
      childProcess.stdin?.write(jsonrpcRequest);
    });
  }

  private async proxySseRequest(
    serverId: string,
    request: MCPRequest
  ): Promise<MCPResponse> {
    const eventSource = this.sseConnections.get(serverId);
    if (!eventSource || eventSource.readyState !== EventSource.OPEN) {
      return {
        error: {
          code: -32003,
          message: "SSE connection not open",
        },
      };
    }

    // For SSE, we need to send the request via a separate HTTP POST
    // and listen for the response via the EventSource
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({
          error: {
            code: -32000,
            message: "SSE request timeout",
          },
        });
      }, 30000);

      const requestId = Date.now();

      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.id === requestId) {
          clearTimeout(timeout);
          eventSource.removeEventListener("message", handleMessage);
          resolve(data);
        }
      };

      eventSource.addEventListener("message", handleMessage);

      // Send request via HTTP POST to SSE endpoint
      const server = this.servers.get(serverId);
      if (server?.config.url) {
        axios
          .post(server.config.url, {
            jsonrpc: "2.0",
            method: request.method,
            params: request.params,
            id: requestId,
          })
          .catch((error) => {
            clearTimeout(timeout);
            eventSource.removeEventListener("message", handleMessage);
            resolve({
              error: {
                code: -32000,
                message: error.message,
              },
            });
          });
      }
    });
  }

  private async proxyHttpRequest(
    serverId: string,
    request: MCPRequest
  ): Promise<MCPResponse> {
    const instance = this.axiosInstances.get(serverId);
    if (!instance) {
      return {
        error: {
          code: -32003,
          message: `No HTTP client for server '${serverId}'`,
        },
      };
    }

    try {
      const response = await instance.post("/", {
        jsonrpc: "2.0",
        method: request.method,
        params: request.params,
        id: Date.now(),
      });

      return response.data;
    } catch (error) {
      return {
        error: {
          code: -32000,
          message:
            error instanceof Error ? error.message : "HTTP request failed",
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
      method: "tools/call",
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

    for (const [serverId] of Array.from(this.servers)) {
      metrics[serverId] = await this.redis.getMetric(
        `mcp:${serverId}:requests`
      );
    }

    return {
      totalServers: this.servers.size,
      enabledServers: Array.from(this.servers.values()).filter((s) => s.enabled)
        .length,
      totalTools: this.allTools.length,
      serverMetrics: metrics,
    };
  }
}
