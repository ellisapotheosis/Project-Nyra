import { EventBus } from '../events/EventBus';
import { SystemEvent, MCPServerStatus, GPUMetrics } from '../types';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('nexus-integration');

interface NexusClient {
  get<T = any>(path: string): Promise<{ data: T }>;
  post<T = any>(path: string, body: unknown): Promise<{ data: T }>;
}

function createNexusClient(baseUrl: string, apiKey?: string): NexusClient {
  const request = async <T>(path: string, init?: RequestInit): Promise<{ data: T }> => {
    const response = await fetch(new URL(path, baseUrl), {
      ...init,
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Nexus Router request failed: ${response.status} ${response.statusText}`);
    }

    return { data: (await response.json()) as T };
  };

  return {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  };
}

export class NexusIntegration {
  private client: NexusClient | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;

    if (config.nexusRouterUrl) {
      this.client = createNexusClient(config.nexusRouterUrl, config.nexusRouterApiKey);
      logger.info({ url: config.nexusRouterUrl }, 'Nexus Router integration initialized');
    } else {
      logger.warn('Nexus Router URL not configured, integration disabled');
    }
  }

  async startPolling(interval: number = 10000) {
    if (!this.client) {
      logger.warn('Nexus Router client not initialized, polling disabled');
      return;
    }

    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollMCPStatus();
        await this.pollGPUMetrics();
      } catch (error) {
        logger.error({ error }, 'Polling error');
      }
    }, interval);

    logger.info({ interval }, 'Started polling Nexus Router');

    // Poll immediately on start
    await this.pollMCPStatus();
    await this.pollGPUMetrics();
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      logger.info('Stopped polling Nexus Router');
    }
  }

  private async pollMCPStatus() {
    try {
      const response = await this.client!.get('/mcp/status');
      const mcpServers: MCPServerStatus[] = response.data.servers || [];

      const event: SystemEvent = {
        type: 'mcp_status',
        source: 'nexus-router',
        timestamp: new Date().toISOString(),
        data: { servers: mcpServers },
      };

      this.eventBus.emit('mcp:status', event);
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to poll MCP status');
    }
  }

  private async pollGPUMetrics() {
    try {
      const response = await this.client!.get('/gpu/metrics');
      const gpuMetrics: GPUMetrics[] = response.data.workers || [];

      const event: SystemEvent = {
        type: 'gpu_metrics',
        source: 'nexus-router',
        timestamp: new Date().toISOString(),
        data: { workers: gpuMetrics },
      };

      this.eventBus.emit('gpu:metrics', event);
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to poll GPU metrics');
    }
  }

  async queryToolDiscovery(): Promise<void> {
    if (!this.client) return;

    try {
      const response = await this.client.get('/mcp/tools');
      const tools = response.data.tools || [];

      const event: SystemEvent = {
        type: 'tool_discovery',
        source: 'nexus-router',
        timestamp: new Date().toISOString(),
        data: { tools },
      };

      this.eventBus.emit('tools:discovery', event);
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Failed to query tool discovery');
    }
  }

  async sendCommand(command: string, params: any): Promise<any> {
    if (!this.client) {
      throw new Error('Nexus Router client not initialized');
    }

    try {
      const response = await this.client.post('/command', {
        command,
        params,
      });
      return response.data;
    } catch (error) {
      logger.error({ error: error instanceof Error ? error.message : String(error), command }, 'Failed to send command');
      throw error;
    }
  }
}
