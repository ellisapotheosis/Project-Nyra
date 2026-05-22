import { EventBus } from "../events/EventBus";
import { SystemEvent, MCPServerStatus, GPUMetrics } from "../types";
import { config } from "../config";
import { createLogger } from "../utils/logger";

const logger = createLogger("nexus-integration");

export class NexusIntegration {
  private baseUrl: string | null = null;
  private headers: Record<string, string> = {};
  private pollingInterval: NodeJS.Timeout | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;

    if (config.nexusRouterUrl) {
      this.baseUrl = config.nexusRouterUrl;
      this.headers = config.nexusRouterApiKey
        ? { Authorization: `Bearer ${config.nexusRouterApiKey}` }
        : {};
      logger.info(
        { url: config.nexusRouterUrl },
        "Nexus Router integration initialized"
      );
    } else {
      logger.warn("Nexus Router URL not configured, integration disabled");
    }
  }

  async startPolling(interval: number = 10000) {
    if (!this.baseUrl) {
      logger.warn("Nexus Router client not initialized, polling disabled");
      return;
    }

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollMCPStatus();
        await this.pollGPUMetrics();
      } catch (error) {
        logger.error({ error }, "Polling error");
      }
    }, interval);

    logger.info({ interval }, "Started polling Nexus Router");

    // Poll immediately on start
    await this.pollMCPStatus();
    await this.pollGPUMetrics();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info("Stopped polling Nexus Router");
    }
  }

  private async pollMCPStatus() {
    try {
      const response = await this.getJson<{ servers?: MCPServerStatus[] }>(
        "/mcp/status"
      );
      const mcpServers: MCPServerStatus[] = response.servers || [];

      const event: SystemEvent = {
        type: "mcp_status",
        source: "nexus-router",
        timestamp: new Date().toISOString(),
        data: { servers: mcpServers },
      };

      this.eventBus.emit("mcp:status", event);
    } catch (error: any) {
      logger.error({ error: error.message }, "Failed to poll MCP status");
    }
  }

  private async pollGPUMetrics() {
    try {
      const response = await this.getJson<{ workers?: GPUMetrics[] }>(
        "/gpu/metrics"
      );
      const gpuMetrics: GPUMetrics[] = response.workers || [];

      const event: SystemEvent = {
        type: "gpu_metrics",
        source: "nexus-router",
        timestamp: new Date().toISOString(),
        data: { workers: gpuMetrics },
      };

      this.eventBus.emit("gpu:metrics", event);
    } catch (error: any) {
      logger.error({ error: error.message }, "Failed to poll GPU metrics");
    }
  }

  async queryToolDiscovery(): Promise<void> {
    if (!this.baseUrl) return;

    try {
      const response = await this.getJson<{ tools?: unknown[] }>("/mcp/tools");
      const tools = response.tools || [];

      const event: SystemEvent = {
        type: "tool_discovery",
        source: "nexus-router",
        timestamp: new Date().toISOString(),
        data: { tools },
      };

      this.eventBus.emit("tools:discovery", event);
    } catch (error: any) {
      logger.error({ error: error.message }, "Failed to query tool discovery");
    }
  }

  async sendCommand(command: string, params: any): Promise<any> {
    if (!this.baseUrl) {
      throw new Error("Nexus Router client not initialized");
    }

    try {
      return await this.postJson("/command", {
        command,
        params,
      });
    } catch (error: any) {
      logger.error({ error: error.message, command }, "Failed to send command");
      throw error;
    }
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await this.fetchWithTimeout(path, { method: "GET" });
    return (await response.json()) as T;
  }

  private async postJson<T>(path: string, body: unknown): Promise<T> {
    const response = await this.fetchWithTimeout(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as T;
  }

  private async fetchWithTimeout(
    path: string,
    init: RequestInit
  ): Promise<Response> {
    if (!this.baseUrl) {
      throw new Error("Nexus Router client not initialized");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(new URL(path, this.baseUrl), {
        ...init,
        headers: {
          ...this.headers,
          ...(init.headers || {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Nexus Router request failed: ${response.status}`);
      }

      return response;
    } finally {
      clearTimeout(timeout);
    }
  }
}
