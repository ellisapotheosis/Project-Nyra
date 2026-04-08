import axios from 'axios';
import crypto from 'crypto';
import { config, Worker } from '../config';
import { createLogger } from '../utils/logger';
import { RedisClient } from './redis-client';
import {
  buildGeminiRequestBody,
  CloudProvider,
  withResolvedModel,
} from './cloud-provider-adapters';

const logger = createLogger('worker-manager');
const LOCAL_CLUSTER_ALIASES = new Set([
  'local-cluster',
  'local_cluster',
  'nyra/local-cluster',
]);
const REMOTE_OPENAI_ALIASES = new Set([
  'openai-codex',
  'remote/openai-codex',
  'remote-codex',
]);
const REMOTE_GEMINI_ALIASES = new Set([
  'remote/gemini-1.5-pro',
  'remote-gemini-1.5-pro',
  'gemini-1.5-pro-expert',
]);

export function normalizeRoutingModel(model?: string): string {
  return model?.trim().toLowerCase() || '';
}

export function isLocalClusterAlias(model?: string): boolean {
  return LOCAL_CLUSTER_ALIASES.has(normalizeRoutingModel(model));
}

export function isRemoteOpenAIAlias(model?: string): boolean {
  return REMOTE_OPENAI_ALIASES.has(normalizeRoutingModel(model));
}

export function isRemoteGeminiAlias(model?: string): boolean {
  return REMOTE_GEMINI_ALIASES.has(normalizeRoutingModel(model));
}

export function resolveProviderModelAlias(
  requestedModel: string | undefined,
  provider: 'openai' | 'google-gemini',
  fallbackModel: string
): string {
  if (!requestedModel || requestedModel === 'default') {
    return fallbackModel;
  }

  if (provider === 'openai' && isRemoteOpenAIAlias(requestedModel)) {
    return fallbackModel;
  }

  if (provider === 'google-gemini' && isRemoteGeminiAlias(requestedModel)) {
    return fallbackModel;
  }

  return requestedModel;
}

function getExplicitWorkerTarget(model?: string): '5090' | '3090' | '3060' | 'cluster' | null {
  const normalized = normalizeRoutingModel(model);

  if (isLocalClusterAlias(normalized)) {
    return 'cluster';
  }

  if (
    normalized === 'local-5090' ||
    normalized === 'nyra/local-5090' ||
    normalized === 'worker-5090'
  ) {
    return '5090';
  }

  if (
    normalized === 'local-3090' ||
    normalized === 'nyra/local-3090' ||
    normalized === 'worker-3090'
  ) {
    return '3090';
  }

  if (
    normalized === 'local-3060' ||
    normalized === 'nyra/local-3060' ||
    normalized === 'worker-3060'
  ) {
    return '3060';
  }

  return null;
}

interface WorkerHealth {
  workerId: string;
  healthy: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

interface RoutingDecision {
  worker: Worker | null;
  provider: 'local' | CloudProvider;
  reason: string;
}

interface RoutingConfig {
  strategy: 'cost-optimized' | 'latency-optimized' | 'quality-optimized';
  preferLocal: boolean;
  fallbackCloud: boolean;
  costThreshold: number;
}

export class WorkerManager {
  private static instance: WorkerManager;
  private workerHealth: Map<string, WorkerHealth> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private redis: RedisClient;
  private routingConfig: RoutingConfig;

  private constructor() {
    this.redis = RedisClient.getInstance();
    // Initialize with default config values
    this.routingConfig = {
      strategy: config.routing.strategy,
      preferLocal: config.routing.preferLocal,
      fallbackCloud: config.routing.fallbackCloud,
      costThreshold: config.routing.costThreshold,
    };
  }

  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing Worker Manager...');

    // Load routing config from Redis if available
    await this.loadRoutingConfig();

    // Initial health check for all workers
    for (const worker of config.workers.local) {
      await this.checkWorkerHealth(worker);
    }

    // Start periodic health checks
    this.startHealthChecks();

    logger.info(`Worker Manager initialized with ${config.workers.local.length} local workers`);
    logger.info(`Routing strategy: ${this.routingConfig.strategy}`);
  }

  private async loadRoutingConfig(): Promise<void> {
    try {
      if (!this.redis.isConnected()) {
        logger.debug('Redis not connected, using default routing config');
        return;
      }

      const savedConfig = await this.redis.get('routing:config');
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        this.routingConfig = { ...this.routingConfig, ...parsedConfig };
        logger.info('Loaded routing config from Redis');
      }
    } catch (error) {
      logger.warn('Error loading routing config from Redis:', error);
    }
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
    const explicitRoute = await this.routeExplicitAlias(model, taskType);
    if (explicitRoute) {
      return explicitRoute;
    }

    // Apply routing strategy
    switch (this.routingConfig.strategy) {
      case 'latency-optimized':
        return this.routeLatencyOptimized(model, taskType);
      case 'quality-optimized':
        return this.routeQualityOptimized(model, taskType);
      case 'cost-optimized':
      default:
        return this.routeCostOptimized(model, taskType);
    }
  }

  private async routeExplicitAlias(
    model: string,
    taskType?: string
  ): Promise<RoutingDecision | null> {
    if (isRemoteOpenAIAlias(model) || isRemoteGeminiAlias(model)) {
      await this.redis.incrementMetric('requests:cloud');
      return this.routeToCloud(model);
    }

    const explicitWorker = this.findExplicitLocalWorker(model, taskType);
    if (!explicitWorker) {
      return null;
    }

    const workerId = this.getWorkerId(explicitWorker.url);
    const health = this.workerHealth.get(workerId);

    if (health?.healthy) {
      await this.redis.incrementMetric('requests:local');
      return {
        worker: explicitWorker,
        provider: 'local',
        reason: `Explicit local route selected for ${model}`,
      };
    }

    if (this.routingConfig.fallbackCloud) {
      await this.redis.incrementMetric('requests:cloud');
      return this.routeToCloud(model);
    }

    throw new Error(`Explicit local route requested for ${model}, but no healthy worker was available`);
  }

  private async routeCostOptimized(model: string, taskType?: string): Promise<RoutingDecision> {
    // Check if we should prefer local
    if (!this.routingConfig.preferLocal) {
      return this.routeToCloud(model);
    }

    // Try to find a suitable local worker
    const suitableWorker = this.findBestWorker(model, taskType);

    if (suitableWorker) {
      const workerId = this.getWorkerId(suitableWorker.url);
      const health = this.workerHealth.get(workerId);

      if (health?.healthy) {
        logger.info(`Routing to local worker ${workerId} for model ${model} (cost-optimized)`);
        await this.redis.incrementMetric('requests:local');
        return {
          worker: suitableWorker,
          provider: 'local',
          reason: `Local worker available (${suitableWorker.primaryUse}) - Cost optimized`,
        };
      }
    }

    // Fallback to cloud if configured
    if (this.routingConfig.fallbackCloud) {
      logger.info(`No healthy local workers, falling back to cloud for model ${model}`);
      await this.redis.incrementMetric('requests:cloud');
      return this.routeToCloud(model);
    }

    // No workers available
    throw new Error('No available workers (local unhealthy, cloud fallback disabled)');
  }

  private async routeLatencyOptimized(model: string, taskType?: string): Promise<RoutingDecision> {
    // Find worker with best response time
    const healthyWorkers = config.workers.local.filter((worker) => {
      const workerId = this.getWorkerId(worker.url);
      const health = this.workerHealth.get(workerId);
      return health?.healthy;
    });

    if (healthyWorkers.length > 0) {
      // Sort by response time (ascending)
      const fastestWorker = healthyWorkers.reduce((fastest, current) => {
        const fastestId = this.getWorkerId(fastest.url);
        const currentId = this.getWorkerId(current.url);
        const fastestHealth = this.workerHealth.get(fastestId);
        const currentHealth = this.workerHealth.get(currentId);

        if (!fastestHealth?.responseTime) return current;
        if (!currentHealth?.responseTime) return fastest;

        return currentHealth.responseTime < fastestHealth.responseTime ? current : fastest;
      });

      const workerId = this.getWorkerId(fastestWorker.url);
      const health = this.workerHealth.get(workerId);

      logger.info(`Routing to fastest worker ${workerId} (${health?.responseTime}ms) for model ${model}`);
      await this.redis.incrementMetric('requests:local');

      return {
        worker: fastestWorker,
        provider: 'local',
        reason: `Fastest local worker (${health?.responseTime}ms response time)`,
      };
    }

    // Fallback to cloud
    if (this.routingConfig.fallbackCloud) {
      await this.redis.incrementMetric('requests:cloud');
      return this.routeToCloud(model);
    }

    throw new Error('No available workers');
  }

  private async routeQualityOptimized(model: string, taskType?: string): Promise<RoutingDecision> {
    // For quality-optimized, prefer cloud providers (especially Anthropic)
    // unless explicitly preferring local or cost threshold is met

    // Check cost threshold - if request is below threshold, use local
    const estimatedCost = this.estimateRequestCost(model);
    if (estimatedCost < this.routingConfig.costThreshold && this.routingConfig.preferLocal) {
      const suitableWorker = this.findBestWorker(model, taskType);
      if (suitableWorker) {
        const workerId = this.getWorkerId(suitableWorker.url);
        const health = this.workerHealth.get(workerId);

        if (health?.healthy) {
          logger.info(`Routing to local worker ${workerId} (cost ${estimatedCost} < threshold ${this.routingConfig.costThreshold})`);
          await this.redis.incrementMetric('requests:local');
          return {
            worker: suitableWorker,
            provider: 'local',
            reason: `Cost below threshold (${estimatedCost} < ${this.routingConfig.costThreshold})`,
          };
        }
      }
    }

    // Route to cloud for best quality
    logger.info(`Routing to cloud for quality optimization (model: ${model})`);
    await this.redis.incrementMetric('requests:cloud');
    return this.routeToCloud(model);
  }

  private estimateRequestCost(model: string): number {
    // Simple cost estimation based on model name
    // In production, this would use actual pricing data
    if (model.toLowerCase().includes('opus') || model.toLowerCase().includes('gpt-4')) {
      return 0.15;
    } else if (model.toLowerCase().includes('sonnet') || model.toLowerCase().includes('gpt-3.5')) {
      return 0.05;
    }
    return 0.01; // Default low cost for other models
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

  private findExplicitLocalWorker(model: string, taskType?: string): Worker | null {
    const target = getExplicitWorkerTarget(model);
    if (!target) {
      return null;
    }

    const workers = config.workers.local;
    if (workers.length === 0) {
      return null;
    }

    if (target === 'cluster') {
      const clusterWorkers = workers.filter((worker) => {
        const url = worker.url.toLowerCase();
        return (
          url.includes('5090') ||
          url.includes('3090') ||
          worker.primaryUse === 'reasoning' ||
          worker.primaryUse === 'analysis'
        );
      });

      if (clusterWorkers.length === 0) {
        return null;
      }

      const preferredUse = taskType === 'reasoning' ? 'reasoning' : 'analysis';
      const healthyClusterWorkers = clusterWorkers.filter((worker) => {
        const workerId = this.getWorkerId(worker.url);
        return this.workerHealth.get(workerId)?.healthy;
      });
      const candidates = healthyClusterWorkers.length > 0 ? healthyClusterWorkers : clusterWorkers;

      return (
        candidates.find((worker) => worker.primaryUse === preferredUse) ||
        candidates.find((worker) => worker.primaryUse === 'reasoning') ||
        candidates[0]
      );
    }

    return workers.find((worker) => worker.url.toLowerCase().includes(target)) || null;
  }

  private routeToCloud(model?: string): RoutingDecision {
    const normalizedModel = normalizeRoutingModel(model);
    const openAiAvailable = Boolean(config.workers.cloud.openai.apiKey);
    const geminiAvailable = Boolean(config.workers.cloud.googleGemini.apiKey);

    if (isRemoteGeminiAlias(model)) {
      if (!geminiAvailable) {
        throw new Error(
          'Gemini 1.5 Pro remote expert requested, but GOOGLE_API_KEY/GEMINI_API_KEY is not configured'
        );
      }
      return {
        worker: null,
        provider: 'google-gemini',
        reason: 'Using Google Gemini cloud API for explicit NYRA remote expert request',
      };
    }

    if (isRemoteOpenAIAlias(model)) {
      if (!openAiAvailable) {
        throw new Error('OpenAI Codex remote expert requested, but OPENAI_API_KEY is not configured');
      }
      return {
        worker: null,
        provider: 'openai',
        reason: 'Using OpenAI cloud API for explicit NYRA remote expert request',
      };
    }

    if (geminiAvailable && normalizedModel.includes('gemini')) {
      return {
        worker: null,
        provider: 'google-gemini',
        reason: 'Using Google Gemini cloud API for Gemini model request',
      };
    }

    if (
      openAiAvailable &&
      (normalizedModel.includes('gpt') ||
        normalizedModel.includes('codex') ||
        normalizedModel.includes('openai'))
    ) {
      return {
        worker: null,
        provider: 'openai',
        reason: 'Using OpenAI cloud API for OpenAI model request',
      };
    }

    if (openAiAvailable) {
      return {
        worker: null,
        provider: 'openai',
        reason: 'Using OpenAI cloud API',
      };
    }

    if (geminiAvailable) {
      return {
        worker: null,
        provider: 'google-gemini',
        reason: 'Using Google Gemini cloud API',
      };
    }

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
    } else if (decision.provider === 'openai') {
      return await this.sendToOpenAI(requestBody);
    } else if (decision.provider === 'google-gemini') {
      return await this.sendToGoogleGemini(requestBody);
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
          model:
            requestBody.model && requestBody.model !== 'default'
              ? requestBody.model
              : config.workers.cloud.anthropic.model,
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

  private async sendToOpenAI(requestBody: any): Promise<any> {
    try {
      const response = await axios.post(
        `${config.workers.cloud.openai.baseUrl}/chat/completions`,
        withResolvedModel(
          {
            ...requestBody,
            model: resolveProviderModelAlias(
              requestBody.model,
              'openai',
              config.workers.cloud.openai.model
            ),
          },
          config.workers.cloud.openai.model
        ),
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.workers.cloud.openai.apiKey}`,
          },
          timeout: 120000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`OpenAI API error: ${error.message}`);
        throw new Error(`OpenAI request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToGoogleGemini(requestBody: any): Promise<any> {
    try {
      const model = resolveProviderModelAlias(
        requestBody.model,
        'google-gemini',
        config.workers.cloud.googleGemini.model
      );

      const response = await axios.post(
        `${config.workers.cloud.googleGemini.baseUrl}/models/${model}:generateContent`,
        buildGeminiRequestBody(requestBody),
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': config.workers.cloud.googleGemini.apiKey,
          },
          timeout: 120000,
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Gemini API error: ${error.message}`);
        throw new Error(`Gemini request failed: ${error.message}`);
      }
      throw error;
    }
  }

  private async sendToOpenRouter(requestBody: any): Promise<any> {
    try {
      const response = await axios.post(
        `${config.workers.cloud.openrouter.baseUrl}/chat/completions`,
        withResolvedModel(requestBody, config.workers.cloud.openrouter.fallbackModel),
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

  public getRoutingConfig(): RoutingConfig {
    return { ...this.routingConfig };
  }

  public updateRoutingConfig(updates: Partial<RoutingConfig>): void {
    this.routingConfig = {
      ...this.routingConfig,
      ...updates,
    };
    logger.info('Routing configuration updated:', this.routingConfig);
  }

  public shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    logger.info('Worker Manager shut down');
  }
}
