/**
 * Letta API Client
 * Handles all communication with Letta memory service
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { LettaConfig, Memory, MemoryType } from '../types';
import { Logger } from '../utils/logger';

export class LettaClient {
  private client: AxiosInstance;
  private logger: Logger;
  private config: LettaConfig;

  constructor(config: LettaConfig) {
    this.config = config;
    this.logger = new Logger('LettaClient');

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        this.logger.debug('Request:', { url: config.url, method: config.method });
        return config;
      },
      (error) => {
        this.logger.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        this.logger.debug('Response:', { status: response.status, url: response.config.url });
        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 429 && this.config.retryAttempts) {
          return this.retryRequest(error);
        }
        this.logger.error('Response error:', error);
        return Promise.reject(error);
      }
    );
  }

  private async retryRequest(error: AxiosError, attempt = 1): Promise<any> {
    if (attempt > (this.config.retryAttempts || 3)) {
      throw error;
    }

    const delay = Math.pow(2, attempt) * 1000;
    this.logger.info(`Retrying request (attempt ${attempt}) after ${delay}ms`);

    await new Promise(resolve => setTimeout(resolve, delay));
    return this.client.request(error.config!);
  }

  async createMemory(memory: Omit<Memory, 'id' | 'timestamp'>): Promise<Memory> {
    try {
      const response = await this.client.post('/memories', memory);
      this.logger.info('Memory created:', { id: response.data.id });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create memory:', error);
      throw error;
    }
  }

  async getMemory(memoryId: string): Promise<Memory> {
    try {
      const response = await this.client.get(`/memories/${memoryId}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get memory:', error);
      throw error;
    }
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<Memory> {
    try {
      const response = await this.client.patch(`/memories/${memoryId}`, updates);
      this.logger.info('Memory updated:', { id: memoryId });
      return response.data;
    } catch (error) {
      this.logger.error('Failed to update memory:', error);
      throw error;
    }
  }

  async deleteMemory(memoryId: string): Promise<void> {
    try {
      await this.client.delete(`/memories/${memoryId}`);
      this.logger.info('Memory deleted:', { id: memoryId });
    } catch (error) {
      this.logger.error('Failed to delete memory:', error);
      throw error;
    }
  }

  async listMemories(agentId: string, type?: MemoryType, limit = 100): Promise<Memory[]> {
    try {
      const response = await this.client.get('/memories', {
        params: { agentId, type, limit },
      });
      return response.data.memories;
    } catch (error) {
      this.logger.error('Failed to list memories:', error);
      throw error;
    }
  }

  async searchMemories(query: string, agentId: string, limit = 10): Promise<Memory[]> {
    try {
      const response = await this.client.post('/memories/search', {
        query,
        agentId,
        limit,
      });
      return response.data.results;
    } catch (error) {
      this.logger.error('Failed to search memories:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.post('/embeddings', { text });
      return response.data.embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      throw error;
    }
  }

  async bulkCreateMemories(memories: Omit<Memory, 'id' | 'timestamp'>[]): Promise<Memory[]> {
    try {
      const response = await this.client.post('/memories/bulk', { memories });
      this.logger.info('Bulk memories created:', { count: memories.length });
      return response.data.memories;
    } catch (error) {
      this.logger.error('Failed to create bulk memories:', error);
      throw error;
    }
  }

  async getAgentMemoryStats(agentId: string): Promise<any> {
    try {
      const response = await this.client.get(`/agents/${agentId}/stats`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get agent stats:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
