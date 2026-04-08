import axios from 'axios';
import crypto from 'crypto';
import { EventEmitter } from 'events';
import { config, Worker } from '../config';
import { createLogger } from '../utils/logger';
import { WorkerManager } from './worker-manager';

const logger = createLogger('model-discovery');

/**
 * Model capability information
 */
export interface ModelCapabilities {
  id: string;
  name: string;
  aliases: string[];
  provider: 'local-gpu' | 'anthropic' | 'openrouter' | 'ollama' | 'openai' | 'google-gemini';
  availability: 'available' | 'unavailable' | 'degraded';

  // Performance characteristics
  maxContextLength: number;
  vramRequirements?: number; // GB
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsVision: boolean;

  // Cost information (per 1K tokens)
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;

  // Additional metadata
  parameterSize?: string; // e.g., "70B", "8B"
  quantization?: string; // e.g., "Q4_K_M", "FP16"
  architecture?: string; // e.g., "llama", "mistral", "claude"

  // Runtime info
  workerUrl?: string;
  workerId?: string;
  lastChecked: Date;
  responseTime?: number;
}

/**
 * Discovery status
 */
export interface DiscoveryStatus {
  lastDiscovery: Date;
  nextDiscovery: Date;
  totalModels: number;
  availableModels: number;
  unavailableModels: number;
  discovering: boolean;
  errors: string[];
}

/**
 * Model Discovery Service
 * Implements watch channel pattern for lock-free lookups
 * Inspired by Grafbase Nexus architecture
 */
export class ModelDiscoveryService extends EventEmitter {
  private static instance: ModelDiscoveryService;

  // Watch channel for lock-free reads
  private modelsCache: Map<string, ModelCapabilities> = new Map();
  private cacheVersion: number = 0;

  private discoveryInterval: NodeJS.Timeout | null = null;
  private discovering: boolean = false;
  private lastDiscovery: Date | null = null;
  private discoveryErrors: string[] = [];

  private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly DISCOVERY_TIMEOUT = 10000; // 10 seconds per model

  private workerManager: WorkerManager;

  private constructor() {
    super();
    this.workerManager = WorkerManager.getInstance();
  }

  public static getInstance(): ModelDiscoveryService {
    if (!ModelDiscoveryService.instance) {
      ModelDiscoveryService.instance = new ModelDiscoveryService();
    }
    return ModelDiscoveryService.instance;
  }

  /**
   * Initialize discovery service with startup scan
   */
  public async initialize(): Promise<void> {
    logger.info('Initializing Model Discovery Service...');

    // Initial discovery
    await this.discoverModels();

    // Start background refresh
    this.startBackgroundRefresh();

    logger.info(
      `Model Discovery initialized with ${this.modelsCache.size} models. ` +
      `Next refresh in ${this.REFRESH_INTERVAL / 1000}s`
    );
  }

  /**
   * Start background refresh every 5 minutes
   */
  private startBackgroundRefresh(): void {
    this.discoveryInterval = setInterval(async () => {
      logger.debug('Running scheduled model discovery...');
      await this.discoverModels();
    }, this.REFRESH_INTERVAL);
  }

  /**
   * Main discovery orchestration
   */
  public async discoverModels(): Promise<void> {
    if (this.discovering) {
      logger.warn('Discovery already in progress, skipping...');
      return;
    }

    this.discovering = true;
    this.discoveryErrors = [];
    const startTime = Date.now();

    try {
      logger.info('Starting model discovery...');

      // Discover from all sources in parallel
      const [localModels, cloudModels] = await Promise.all([
        this.discoverLocalModels(),
        this.discoverCloudModels(),
      ]);

      // Update cache atomically with new version
      const newCache = new Map<string, ModelCapabilities>();

      [...localModels, ...cloudModels].forEach((model) => {
        newCache.set(model.id, model);
        // Also index by aliases
        model.aliases.forEach((alias) => {
          newCache.set(alias, model);
        });
      });

      // Atomic cache swap
      this.modelsCache = newCache;
      this.cacheVersion++;
      this.lastDiscovery = new Date();

      const duration = Date.now() - startTime;
      logger.info(
        `Discovery complete: ${this.modelsCache.size} models found in ${duration}ms`
      );

      // Emit event for subscribers
      this.emit('discovery-complete', {
        totalModels: this.modelsCache.size,
        duration,
        timestamp: this.lastDiscovery,
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Discovery failed:', error);
      this.discoveryErrors.push(errorMsg);
      this.emit('discovery-error', error);
    } finally {
      this.discovering = false;
    }
  }

  /**
   * Discover models from local GPU workers
   */
  private async discoverLocalModels(): Promise<ModelCapabilities[]> {
    const models: ModelCapabilities[] = [];
    const workerHealth = this.workerManager.getWorkerHealthStatus();

    for (const worker of config.workers.local) {
      try {
        const workerId = crypto
          .createHash('md5')
          .update(worker.url)
          .digest('hex')
          .substring(0, 8);
        const health = workerHealth.find((h) => h.workerId === workerId);

        if (!health?.healthy) {
          logger.debug(`Skipping unhealthy worker: ${workerId}`);
          continue;
        }

        // Try to fetch model details from worker
        const workerModels = await this.fetchWorkerModels(worker, workerId);
        models.push(...workerModels);

      } catch (error) {
        const errorMsg = `Worker ${worker.url} discovery failed: ${
          error instanceof Error ? error.message : 'Unknown'
        }`;
        logger.warn(errorMsg);
        this.discoveryErrors.push(errorMsg);
      }
    }

    models.push(...this.getLocalClusterModels(models));

    return models;
  }

  private getLocalClusterModels(localModels: ModelCapabilities[]): ModelCapabilities[] {
    const clusterMembers = localModels.filter((model) => {
      const workerUrl = model.workerUrl?.toLowerCase() || '';
      return workerUrl.includes('5090') || workerUrl.includes('3090');
    });

    if (clusterMembers.length === 0) {
      return [];
    }

    const primaryMember =
      clusterMembers.find((model) => model.workerUrl?.includes('5090')) || clusterMembers[0];

    return [
      {
        id: 'local-cluster',
        name: 'NYRA Local Cluster',
        aliases: ['local-cluster', 'nyra/local-cluster'],
        provider: 'local-gpu',
        availability: 'available',
        maxContextLength: Math.max(...clusterMembers.map((model) => model.maxContextLength)),
        supportsStreaming: true,
        supportsToolCalling: clusterMembers.some((model) => model.supportsToolCalling),
        supportsVision: clusterMembers.some((model) => model.supportsVision),
        vramRequirements: Math.max(
          ...clusterMembers.map((model) => model.vramRequirements || 0)
        ),
        parameterSize: 'cluster',
        architecture: 'nyra-grid',
        workerUrl: primaryMember.workerUrl,
        workerId: primaryMember.workerId,
        lastChecked: new Date(),
      },
    ];
  }

  /**
   * Fetch models from a specific worker
   */
  private async fetchWorkerModels(
    worker: Worker,
    workerId: string
  ): Promise<ModelCapabilities[]> {
    const models: ModelCapabilities[] = [];

    try {
      // Try to fetch from /v1/models endpoint
      const response = await axios.get(`${worker.url}/v1/models`, {
        timeout: this.DISCOVERY_TIMEOUT,
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        // OpenAI-compatible format
        for (const modelData of response.data.data) {
          models.push(this.parseLocalModel(modelData, worker, workerId));
        }
      }
    } catch (error) {
      // Fallback: use models from config
      logger.debug(`Worker ${workerId} has no /v1/models endpoint, using config`);

      for (const modelName of worker.models) {
        models.push(this.createLocalModelFromConfig(modelName, worker, workerId));
      }
    }

    return models;
  }

  /**
   * Parse model from OpenAI-compatible format
   */
  private parseLocalModel(
    modelData: any,
    worker: Worker,
    workerId: string
  ): ModelCapabilities {
    const modelId = modelData.id || modelData.name || 'unknown';
    const capabilities = this.inferModelCapabilities(modelId);

    return {
      id: modelId,
      name: modelId,
      aliases: [modelId],
      provider: 'local-gpu',
      availability: 'available',
      maxContextLength: capabilities.maxContextLength || 4096,
      supportsStreaming: capabilities.supportsStreaming ?? true,
      supportsToolCalling: capabilities.supportsToolCalling ?? false,
      supportsVision: capabilities.supportsVision ?? false,
      vramRequirements: capabilities.vramRequirements,
      parameterSize: capabilities.parameterSize,
      quantization: capabilities.quantization,
      architecture: capabilities.architecture,
      workerUrl: worker.url,
      workerId,
      lastChecked: new Date(),
    };
  }

  /**
   * Create model entry from config when no API available
   */
  private createLocalModelFromConfig(
    modelName: string,
    worker: Worker,
    workerId: string
  ): ModelCapabilities {
    const capabilities = this.inferModelCapabilities(modelName);

    return {
      id: modelName,
      name: modelName,
      aliases: [modelName],
      provider: 'local-gpu',
      availability: 'available',
      maxContextLength: capabilities.maxContextLength || 4096,
      supportsStreaming: capabilities.supportsStreaming ?? true,
      supportsToolCalling: capabilities.supportsToolCalling ?? false,
      supportsVision: capabilities.supportsVision ?? false,
      vramRequirements: capabilities.vramRequirements,
      parameterSize: capabilities.parameterSize,
      quantization: capabilities.quantization,
      architecture: capabilities.architecture,
      workerUrl: worker.url,
      workerId,
      lastChecked: new Date(),
    };
  }

  /**
   * Infer model capabilities from model name/ID
   */
  private inferModelCapabilities(modelName: string): Partial<ModelCapabilities> {
    const lowerName = modelName.toLowerCase();
    const capabilities: Partial<ModelCapabilities> = {
      supportsStreaming: true,
      supportsToolCalling: false,
      supportsVision: false,
      maxContextLength: 4096,
    };

    // DeepSeek models
    if (lowerName.includes('deepseek')) {
      if (lowerName.includes('r1')) {
        capabilities.parameterSize = '671B';
        capabilities.maxContextLength = 64000;
        capabilities.supportsToolCalling = true;
        capabilities.vramRequirements = 48;
      } else if (lowerName.includes('v3')) {
        capabilities.parameterSize = '671B';
        capabilities.maxContextLength = 128000;
        capabilities.supportsToolCalling = true;
        capabilities.vramRequirements = 40;
      }
      capabilities.architecture = 'deepseek';
    }

    // Llama models
    if (lowerName.includes('llama')) {
      if (lowerName.includes('70b') || lowerName.includes('405b')) {
        capabilities.parameterSize = lowerName.includes('405b') ? '405B' : '70B';
        capabilities.vramRequirements = lowerName.includes('405b') ? 200 : 48;
        capabilities.maxContextLength = 8192;
      } else if (lowerName.includes('13b')) {
        capabilities.parameterSize = '13B';
        capabilities.vramRequirements = 16;
        capabilities.maxContextLength = 4096;
      } else if (lowerName.includes('7b') || lowerName.includes('8b')) {
        capabilities.parameterSize = lowerName.includes('8b') ? '8B' : '7B';
        capabilities.vramRequirements = 8;
        capabilities.maxContextLength = 4096;
      }
      capabilities.architecture = 'llama';
      capabilities.supportsToolCalling = lowerName.includes('3.1') || lowerName.includes('3.3');
    }

    // Qwen models
    if (lowerName.includes('qwen')) {
      if (lowerName.includes('72b')) {
        capabilities.parameterSize = '72B';
        capabilities.vramRequirements = 48;
      } else if (lowerName.includes('14b')) {
        capabilities.parameterSize = '14B';
        capabilities.vramRequirements = 16;
      }
      capabilities.maxContextLength = 32768;
      capabilities.supportsToolCalling = true;
      capabilities.architecture = 'qwen';
    }

    // Mistral models
    if (lowerName.includes('mistral')) {
      capabilities.architecture = 'mistral';
      capabilities.maxContextLength = 8192;
      capabilities.supportsToolCalling = lowerName.includes('instruct');

      if (lowerName.includes('7b')) {
        capabilities.parameterSize = '7B';
        capabilities.vramRequirements = 8;
      }
    }

    // Quantization detection
    if (lowerName.includes('q4')) {
      capabilities.quantization = 'Q4_K_M';
      if (capabilities.vramRequirements) {
        capabilities.vramRequirements = capabilities.vramRequirements * 0.5;
      }
    } else if (lowerName.includes('q5')) {
      capabilities.quantization = 'Q5_K_M';
      if (capabilities.vramRequirements) {
        capabilities.vramRequirements = capabilities.vramRequirements * 0.6;
      }
    } else if (lowerName.includes('q8')) {
      capabilities.quantization = 'Q8_0';
      if (capabilities.vramRequirements) {
        capabilities.vramRequirements = capabilities.vramRequirements * 0.75;
      }
    } else {
      capabilities.quantization = 'FP16';
    }

    return capabilities;
  }

  /**
   * Discover models from cloud providers
   */
  private async discoverCloudModels(): Promise<ModelCapabilities[]> {
    const models: ModelCapabilities[] = [];

    // OpenAI models
    if (config.workers.cloud.openai.apiKey) {
      models.push(...this.getOpenAIModels());
    }

    // Gemini models
    if (config.workers.cloud.googleGemini.apiKey) {
      models.push(...this.getGoogleGeminiModels());
    }

    // Anthropic models
    if (config.workers.cloud.anthropic.apiKey) {
      models.push(...this.getAnthropicModels());
    }

    // OpenRouter models
    if (config.workers.cloud.openrouter.apiKey) {
      models.push(...await this.getOpenRouterModels());
    }

    return models;
  }

  private getOpenAIModels(): ModelCapabilities[] {
    return [
      {
        id: config.workers.cloud.openai.model,
        name: 'OpenAI Codex',
        aliases: [
          config.workers.cloud.openai.model,
          'codex',
          'openai-codex',
          'remote/openai-codex',
        ],
        provider: 'openai',
        availability: 'available',
        maxContextLength: 400000,
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: false,
        architecture: 'gpt',
        lastChecked: new Date(),
      },
    ];
  }

  private getGoogleGeminiModels(): ModelCapabilities[] {
    return [
      {
        id: config.workers.cloud.googleGemini.model,
        name: 'Gemini 2.5 Pro',
        aliases: [
          config.workers.cloud.googleGemini.model,
          'gemini-2.5-pro',
          'remote/gemini-2.5-pro',
        ],
        provider: 'google-gemini',
        availability: 'available',
        maxContextLength: 1048576,
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: true,
        architecture: 'gemini',
        lastChecked: new Date(),
      },
    ];
  }

  /**
   * Get Anthropic model definitions
   */
  private getAnthropicModels(): ModelCapabilities[] {
    return [
      {
        id: 'claude-opus-4',
        name: 'Claude Opus 4',
        aliases: ['claude-opus-4', 'opus-4'],
        provider: 'anthropic',
        availability: 'available',
        maxContextLength: 200000,
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: true,
        costPer1kInputTokens: 0.015,
        costPer1kOutputTokens: 0.075,
        architecture: 'claude',
        lastChecked: new Date(),
      },
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        aliases: ['claude-sonnet-4', 'sonnet-4', config.workers.cloud.anthropic.model],
        provider: 'anthropic',
        availability: 'available',
        maxContextLength: 200000,
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: true,
        costPer1kInputTokens: 0.003,
        costPer1kOutputTokens: 0.015,
        architecture: 'claude',
        lastChecked: new Date(),
      },
      {
        id: 'claude-sonnet-3.5',
        name: 'Claude Sonnet 3.5',
        aliases: ['claude-sonnet-3.5', 'sonnet-3.5'],
        provider: 'anthropic',
        availability: 'available',
        maxContextLength: 200000,
        supportsStreaming: true,
        supportsToolCalling: true,
        supportsVision: true,
        costPer1kInputTokens: 0.003,
        costPer1kOutputTokens: 0.015,
        architecture: 'claude',
        lastChecked: new Date(),
      },
    ];
  }

  /**
   * Get OpenRouter model definitions
   */
  private async getOpenRouterModels(): Promise<ModelCapabilities[]> {
    const models: ModelCapabilities[] = [];

    try {
      // Try to fetch live model list from OpenRouter
      const response = await axios.get('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${config.workers.cloud.openrouter.apiKey}`,
        },
        timeout: this.DISCOVERY_TIMEOUT,
      });

      if (response.data?.data && Array.isArray(response.data.data)) {
        // Parse relevant models
        for (const modelData of response.data.data) {
          const modelId = modelData.id;

          // Only include popular/useful models
          if (
            modelId.includes('deepseek') ||
            modelId.includes('claude') ||
            modelId.includes('gpt') ||
            modelId.includes('gemini')
          ) {
            models.push({
              id: modelId,
              name: modelData.name || modelId,
              aliases: [modelId],
              provider: 'openrouter',
              availability: 'available',
              maxContextLength: modelData.context_length || 8192,
              supportsStreaming: true,
              supportsToolCalling: modelData.supports_functions || false,
              supportsVision: modelData.supports_vision || false,
              costPer1kInputTokens: modelData.pricing?.prompt
                ? parseFloat(modelData.pricing.prompt) * 1000
                : undefined,
              costPer1kOutputTokens: modelData.pricing?.completion
                ? parseFloat(modelData.pricing.completion) * 1000
                : undefined,
              architecture: modelId.split('/')[1]?.split('-')[0],
              lastChecked: new Date(),
            });
          }
        }
      }
    } catch (error) {
      logger.warn('Failed to fetch OpenRouter models, using fallback list');

      // Fallback to static list
      models.push(
        {
          id: 'deepseek/deepseek-r1',
          name: 'DeepSeek R1',
          aliases: ['deepseek/deepseek-r1', 'deepseek-r1'],
          provider: 'openrouter',
          availability: 'available',
          maxContextLength: 64000,
          supportsStreaming: true,
          supportsToolCalling: true,
          supportsVision: false,
          costPer1kInputTokens: 0.0008,
          costPer1kOutputTokens: 0.008,
          architecture: 'deepseek',
          parameterSize: '671B',
          lastChecked: new Date(),
        },
        {
          id: 'deepseek/deepseek-chat',
          name: 'DeepSeek Chat',
          aliases: ['deepseek/deepseek-chat', 'deepseek-chat'],
          provider: 'openrouter',
          availability: 'available',
          maxContextLength: 64000,
          supportsStreaming: true,
          supportsToolCalling: true,
          supportsVision: false,
          costPer1kInputTokens: 0.0003,
          costPer1kOutputTokens: 0.0006,
          architecture: 'deepseek',
          parameterSize: '236B',
          lastChecked: new Date(),
        }
      );
    }

    return models;
  }

  /**
   * Lock-free lookup by model ID or alias
   */
  public getModel(modelId: string): ModelCapabilities | undefined {
    return this.modelsCache.get(modelId);
  }

  /**
   * Lock-free list all models
   */
  public getAllModels(): ModelCapabilities[] {
    const uniqueModels = new Map<string, ModelCapabilities>();

    // Convert iterator to array first to avoid TypeScript downlevelIteration issue
    const allModels = Array.from(this.modelsCache.values());

    for (const model of allModels) {
      // Only add once per unique model (avoid alias duplicates)
      if (!uniqueModels.has(model.id)) {
        uniqueModels.set(model.id, model);
      }
    }

    return Array.from(uniqueModels.values());
  }

  /**
   * Get models filtered by criteria
   */
  public getModels(filter?: {
    provider?: string;
    availability?: string;
    supportsToolCalling?: boolean;
    supportsVision?: boolean;
    minContextLength?: number;
    maxVramRequirements?: number;
  }): ModelCapabilities[] {
    let models = this.getAllModels();

    if (filter) {
      if (filter.provider) {
        models = models.filter((m) => m.provider === filter.provider);
      }
      if (filter.availability) {
        models = models.filter((m) => m.availability === filter.availability);
      }
      if (filter.supportsToolCalling !== undefined) {
        models = models.filter((m) => m.supportsToolCalling === filter.supportsToolCalling);
      }
      if (filter.supportsVision !== undefined) {
        models = models.filter((m) => m.supportsVision === filter.supportsVision);
      }
      if (filter.minContextLength) {
        models = models.filter((m) => m.maxContextLength >= filter.minContextLength!);
      }
      if (filter.maxVramRequirements) {
        models = models.filter(
          (m) =>
            !m.vramRequirements || m.vramRequirements <= filter.maxVramRequirements!
        );
      }
    }

    return models;
  }

  /**
   * Get discovery status
   */
  public getStatus(): DiscoveryStatus {
    const allModels = this.getAllModels();
    const availableModels = allModels.filter((m) => m.availability === 'available');
    const unavailableModels = allModels.filter((m) => m.availability === 'unavailable');

    return {
      lastDiscovery: this.lastDiscovery || new Date(0),
      nextDiscovery: this.lastDiscovery
        ? new Date(this.lastDiscovery.getTime() + this.REFRESH_INTERVAL)
        : new Date(),
      totalModels: allModels.length,
      availableModels: availableModels.length,
      unavailableModels: unavailableModels.length,
      discovering: this.discovering,
      errors: this.discoveryErrors,
    };
  }

  /**
   * Get cache version for optimistic locking
   */
  public getCacheVersion(): number {
    return this.cacheVersion;
  }

  /**
   * Shutdown and cleanup
   */
  public shutdown(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }
    this.removeAllListeners();
    logger.info('Model Discovery Service shut down');
  }
}
