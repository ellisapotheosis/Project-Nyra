import axios, { AxiosError } from 'axios';
import crypto from 'crypto';
import { config, Worker } from '../config';
import { createLogger } from '../utils/logger';
import { RedisClient } from './redis-client';

const logger = createLogger('worker-manager');

interface WorkerHealth {
  workerId: string;
  healthy: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

interface RoutingDecision {
  worker: Worker | null;
  provider: 'local' | 'anthropic' | 'openrouter';
  reason: string;
}

export class WorkerManager {
  private static instance: WorkerManager;
  private workerHealth: Map<string, WorkerHealth> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private redis: RedisClient;

  private constructor() {
    this.redis = RedisClient.getInstance();
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing Worker Manager...');

    // Initial health check for all workers
    for (const worker of config.workers.local) {
      await this.checkWorkerHealth(worker);
    }

    // Start periodic health checks
    this.startHealthChecks();

    logger.info(`Worker Manager initialized with ${config.workers.local.length} local workers`);
  }

  private startHealthChecks(): void {
    // Health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      for (const worker of config.workers.local) {
        await this.checkWorkerHealth(worker);
      }
    }, 30000);
  }

  private async checkWorkerHealth(worker: Worker): Promise<void> {
    const workerId = this.getWorkerId(worker.url);
    const startTime = Date.now();

    try {
      const response = await axios.get(`${worker.url}/health`, {
        timeout: 5000,
      });

      const responseTime = Date.now() - startTime;
      const healthy = response.status === 200;

      this.workerHealth.set(workerId, {
        workerId,
        healthy,
        lastCheck: new Date(),
        responseTime,
      });

      await this.redis.setWorkerStatus(workerId, healthy ? 'healthy' : 'unhealthy', 300);

      if (healthy) {
        logger.debug(`Worker ${workerId} healthy (${responseTime}ms)`);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.workerHealth.set(workerId, {
        workerId,
        healthy: false,
        lastCheck: new Date(),
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      await this.redis.setWorkerStatus(workerId, 'unhealthy', 300);
      logger.warn(`Worker ${workerId} unhealthy: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  private getWorkerId(url: string): string {
    return crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  }

  public async routeRequest(model: string, taskType?: string): Promise<RoutingDecision> {
    // Check if we should prefer local
    if (!config.routing.preferLocal) {
      return this.routeToCloud();
    }

    // Try to find a suitable local worker
    const suitableWorker = this.findBestWorker(model, taskType);

    if (suitableWorker) {
      const workerId = this.getWorkerId(suitableWorker.url);
      const health = this.workerHealth.get(workerId);

      if (health?.healthy) {
        logger.info(`Routing to local worker ${workerId} for model ${model}`);
        await this.redis.incrementMetric('requests:local');
        return {
          worker: suitableWorker,
          provider: 'local',
          reason: `Local worker available (${suitableWorker.primaryUse})`,
        };
      }
    }

    // Fallback to cloud if configured
    if (config.routing.fallbackCloud) {
      logger.info(`No healthy local workers, falling back to cloud for model ${model}`);
      await this.redis.incrementMetric('requests:cloud');
      return this.routeToCloud();
    }

    // No workers available
    throw new Error('No available workers (local unhealthy, cloud fallback disabled)');
  }

  private findBestWorker(model: string, taskType?: string): Worker | null {
    const healthyWorkers = config.workers.local.filter((worker) => {
      const workerId = this.getWorkerId(worker.url);
      const health = this.workerHealth.get(workerId);
      return health?.healthy;
    });

    if (healthyWorkers.length === 0) {
      return null;
    }

    // Check if any worker explicitly supports this model
    const workerWithModel = healthyWorkers.find((worker) =>
      worker.models.some((m) => m.toLowerCase().includes(model.toLowerCase()))
    );

    if (workerWithModel) {
      return workerWithModel;
    }

    // Match by task type
    if (taskType) {
      const workerByType = healthyWorkers.find(
        (worker) => worker.primaryUse.toLowerCase() === taskType.toLowerCase()
      );
      if (workerByType) {
        return workerByType;
      }
    }

    // Return the worker with the most available capacity
    return healthyWorkers.reduce((best, current) => {
      return current.maxConcurrent > best.maxConcurrent ? current : best;
    }, healthyWorkers[0]);
  }

  private routeToCloud(): RoutingDecision {
    // Prefer Anthropic if API key is configured
    if (config.workers.cloud.anthropic.apiKey) {
      return {
        worker: null,
        provider: 'anthropic',
        reason: 'Using Anthropic cloud API',
      };
    }

    // Fallback to OpenRouter
    if (config.workers.cloud.openrouter.apiKey) {
      return {
        worker: null,
        provider: 'openrouter',
        reason: 'Using OpenRouter cloud API',
      };
    }

    throw new Error('No cloud providers configured');
  }

  public async sendCompletionRequest(
    decision: RoutingDecision,
    requestBody: any
  ): Promise<any> {
    if (decision.provider === 'local' && decision.worker) {
      return await this.sendToLocalWorker(decision.worker, requestBody);
    } else if (decision.provider === 'anthropic') {
      return await this.sendToAnthropic(requestBody);
    } else if (decision.provider === 'openrouter') {
      return await this.sendToOpenRouter(requestBody);
    }

    throw new Error('Invalid routing decision');
  }

  private async sendToLocalWorker(worker: Worker, requestBody: any): Promise<any> {
    try {
      const response = await axios.post(
        `${worker.url}/v1/chat/completions`,
        requestBody,
        {
          timeout: worker.timeout,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Local worker error: ${error.message}`);
        throw new Error(`Worker request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToAnthropic(requestBody: any): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: config.workers.cloud.anthropic.model,
          max_tokens: config.workers.cloud.anthropic.maxTokens,
          messages: requestBody.messages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.workers.cloud.anthropic.apiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Anthropic API error: ${error.message}`);
        throw new Error(`Anthropic request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToOpenRouter(requestBody: any): Promise<any> {
    try {
      const response = await axios.post(
        `${config.workers.cloud.openrouter.baseUrl}/chat/completions`,
        {
          model: config.workers.cloud.openrouter.fallbackModel,
          messages: requestBody.messages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.workers.cloud.openrouter.apiKey}`,
            'HTTP-Referer': 'https://nexus-router.local',
            'X-Title': 'Nexus Router',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`OpenRouter API error: ${error.message}`);
        throw new Error(`OpenRouter request failed: ${error.message}`);
      }
      throw error;
    }
  }

  public getWorkerHealthStatus(): WorkerHealth[] {
    return Array.from(this.workerHealth.values());
  }

  public async getMetrics() {
    const localRequests = await this.redis.getMetric('requests:local');
    const cloudRequests = await this.redis.getMetric('requests:cloud');

    return {
      totalRequests: localRequests + cloudRequests,
      localRequests,
      cloudRequests,
      workers: this.getWorkerHealthStatus(),
    };
  }

  public shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    logger.info('Worker Manager shut down');
  }
}
