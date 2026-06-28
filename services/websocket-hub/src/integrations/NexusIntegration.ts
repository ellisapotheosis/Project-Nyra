import axios, { AxiosInstance } from 'axios';
import { EventBus } from '../events/EventBus';
import { SystemEvent, MCPServerStatus, GPUMetrics } from '../types';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('nexus-integration');

export class NexusIntegration {
  private client: AxiosInstance | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;

    if (config.nexusRouterUrl) {
      this.client = axios.create({
        baseURL: config.nexusRouterUrl,
        timeout: 5000,
        headers: config.nexusRouterApiKey
          ? { 'Authorization': `Bearer ${config.nexusRouterApiKey}` }
          : {},
      });
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
    } catch (error: any) {
      logger.warn({ error: error.message, url: this.client?.defaults?.baseURL }, 'Failed to poll MCP status — subscribers will not receive updates');
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
    } catch (error: any) {
      logger.warn({ error: error.message, url: this.client?.defaults?.baseURL }, 'Failed to poll GPU metrics — subscribers will not receive updates');
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
    } catch (error: any) {
      logger.warn({ error: error.message }, 'Failed to query tool discovery');
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
    } catch (error: any) {
      logger.error({ error: error.message, command }, 'Failed to send command');
      throw error;
    }
  }
}
