import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { RedisClient } from './redis-client';
import { MetricsCollectorService } from './metrics-collector';
import { createLogger } from '../utils/logger';
import {
  ProviderConfig,
  ProviderHealth,
  ProviderTestResult,
  CreateProviderRequest,
  UpdateProviderRequest,
  ProviderType,
} from '../types/providers';

const logger = createLogger('provider-manager');

export class ProviderManager {
  private static instance: ProviderManager;
  private redis: RedisClient;
  private metricsCollector: MetricsCollectorService;
  private providers: Map<string, ProviderConfig> = new Map();
  private readonly PROVIDERS_KEY = 'providers:all';
  private readonly PROVIDER_KEY_PREFIX = 'providers:';

  // Default models for each provider type
  private readonly DEFAULT_MODELS: Record<ProviderType, string[]> = {
    'anthropic': [
      'claude-opus-4',
      'claude-sonnet-4',
      'claude-sonnet-3.5',
      'claude-haiku-3.5',
    ],
    'aws-bedrock': [
      'anthropic.claude-3-opus',
      'anthropic.claude-3-sonnet',
      'anthropic.claude-3-haiku',
      'amazon.titan-text-express',
    ],
    'google-gemini': [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ],
    'openai': [
      'gpt-5.2-codex',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'gpt-3.5-turbo',
    ],
    'openrouter': [
      'deepseek/deepseek-r1',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.5-pro',
      'openai/gpt-4o',
    ],
    'meta-llama': [
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-405b-instruct',
    ],
    'cohere': [
      'command-r-plus',
      'command-r',
      'command',
    ],
  };

  private readonly API_ENDPOINTS: Record<ProviderType, string> = {
    'anthropic': 'https://api.anthropic.com/v1',
    'aws-bedrock': 'https://bedrock-runtime.{region}.amazonaws.com',
    'google-gemini': 'https://generativelanguage.googleapis.com/v1',
    'openai': 'https://api.openai.com/v1',
    'openrouter': 'https://openrouter.ai/api/v1',
    'meta-llama': 'https://api.together.xyz/v1',
    'cohere': 'https://api.cohere.ai/v1',
  };

  private constructor() {
    this.redis = RedisClient.getInstance();
    this.metricsCollector = MetricsCollectorService.getInstance();
  }

  public static getInstance(): ProviderManager {
    if (!ProviderManager.instance) {
      ProviderManager.instance = new ProviderManager();
    }
    return ProviderManager.instance;
  }

  public async initialize(): Promise<void> {
    logger.info('Initializing Provider Manager...');
    await this.loadProviders();
    await this.discoverProviders();
    logger.info(`Loaded ${this.providers.size} provider(s)`);
  }

  /**
   * Auto-discover providers from environment variables
   */
  private async discoverProviders(): Promise<void> {
    const discoveries: Array<{ type: ProviderType; apiKey: string }> = [];

    // Check for API keys in environment
    if (process.env.ANTHROPIC_API_KEY) {
      discoveries.push({ type: 'anthropic', apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.OPENAI_API_KEY) {
      discoveries.push({ type: 'openai', apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY) {
      discoveries.push({
        type: 'google-gemini',
        apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || ''
      });
    }
    if (process.env.OPENROUTER_API_KEY) {
      discoveries.push({ type: 'openrouter', apiKey: process.env.OPENROUTER_API_KEY });
    }
    if (process.env.COHERE_API_KEY) {
      discoveries.push({ type: 'cohere', apiKey: process.env.COHERE_API_KEY });
    }
    if (process.env.TOGETHER_API_KEY) {
      discoveries.push({ type: 'meta-llama', apiKey: process.env.TOGETHER_API_KEY });
    }

    // Add discovered providers if they don't already exist
    for (const { type, apiKey } of discoveries) {
      const existing = Array.from(this.providers.values()).find(p => p.type === type);
      if (!existing) {
        logger.info(`Auto-discovered ${type} provider from environment`);
        await this.createProvider({
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} (Auto-discovered)`,
          type,
          apiKey,
          enabled: true,
          tokenForwarding: false,
          models: this.DEFAULT_MODELS[type],
        });
      }
    }
  }

  /**
   * Load all providers from Redis
   */
  private async loadProviders(): Promise<void> {
    try {
      const data = await this.redis.get(this.PROVIDERS_KEY);
      if (data) {
        const providers: ProviderConfig[] = JSON.parse(data);
        this.providers.clear();
        providers.forEach(provider => {
          this.providers.set(provider.id, provider);
          this.metricsCollector.registerProviderName(provider.id, provider.name);
        });
        logger.info(`Loaded ${providers.length} providers from Redis`);
      }
    } catch (error) {
      logger.warn('Failed to load providers from Redis, starting fresh:', error);
    }
  }

  /**
   * Save all providers to Redis
   */
  private async saveProviders(): Promise<void> {
    try {
      const providers = Array.from(this.providers.values());
      await this.redis.set(this.PROVIDERS_KEY, JSON.stringify(providers));
    } catch (error) {
      logger.error('Failed to save providers to Redis:', error);
    }
  }

  /**
   * Create a new provider
   */
  public async createProvider(request: CreateProviderRequest): Promise<ProviderConfig> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const provider: ProviderConfig = {
      id,
      name: request.name,
      type: request.type,
      enabled: request.enabled ?? true,
      apiKey: request.apiKey,
      baseUrl: request.baseUrl || this.API_ENDPOINTS[request.type],
      models: request.models || this.DEFAULT_MODELS[request.type],
      tokenForwarding: request.tokenForwarding ?? false,
      maxTokens: request.maxTokens,
      timeout: request.timeout || 120000,
      priority: request.priority || 50,
      metadata: request.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    this.providers.set(id, provider);
    this.metricsCollector.registerProviderName(provider.id, provider.name);
    await this.saveProviders();

    logger.info(`Created provider: ${provider.name} (${provider.type})`);
    return provider;
  }

  /**
   * Get all providers
   */
  public async listProviders(): Promise<ProviderConfig[]> {
    return Array.from(this.providers.values());
  }

  /**
   * Get a specific provider by ID
   */
  public async getProvider(id: string): Promise<ProviderConfig | null> {
    return this.providers.get(id) || null;
  }

  /**
   * Update a provider
   */
  public async updateProvider(id: string, request: UpdateProviderRequest): Promise<ProviderConfig | null> {
    const provider = this.providers.get(id);
    if (!provider) {
      return null;
    }

    const updated: ProviderConfig = {
      ...provider,
      name: request.name ?? provider.name,
      enabled: request.enabled ?? provider.enabled,
      apiKey: request.apiKey ?? provider.apiKey,
      baseUrl: request.baseUrl ?? provider.baseUrl,
      models: request.models ?? provider.models,
      tokenForwarding: request.tokenForwarding ?? provider.tokenForwarding,
      maxTokens: request.maxTokens ?? provider.maxTokens,
      timeout: request.timeout ?? provider.timeout,
      priority: request.priority ?? provider.priority,
      metadata: request.metadata ?? provider.metadata,
      updatedAt: new Date().toISOString(),
    };

    this.providers.set(id, updated);
    this.metricsCollector.registerProviderName(updated.id, updated.name);
    await this.saveProviders();

    logger.info(`Updated provider: ${updated.name} (${updated.type})`);
    return updated;
  }

  /**
   * Delete a provider
   */
  public async deleteProvider(id: string): Promise<boolean> {
    const provider = this.providers.get(id);
    if (!provider) {
      return false;
    }

    this.providers.delete(id);
    this.metricsCollector.unregisterProviderName(id);
    await this.saveProviders();

    logger.info(`Deleted provider: ${provider.name} (${provider.type})`);
    return true;
  }

  /**
   * Check provider health
   */
  public async checkProviderHealth(id: string): Promise<ProviderHealth> {
    const provider = this.providers.get(id);
    if (!provider) {
      return {
        providerId: id,
        healthy: false,
        lastCheck: new Date().toISOString(),
        error: 'Provider not found',
      };
    }

    if (!provider.enabled) {
      return {
        providerId: id,
        healthy: false,
        lastCheck: new Date().toISOString(),
        error: 'Provider is disabled',
      };
    }

    const startTime = Date.now();
    try {
      // Perform a lightweight health check based on provider type
      await this.performHealthCheck(provider);

      const responseTime = Date.now() - startTime;
      return {
        providerId: id,
        healthy: true,
        responseTime,
        lastCheck: new Date().toISOString(),
        details: {
          modelsAvailable: provider.models.length,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        providerId: id,
        healthy: false,
        responseTime,
        lastCheck: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  /**
   * Test provider connection
   */
  public async testProvider(id: string): Promise<ProviderTestResult> {
    const provider = this.providers.get(id);
    if (!provider) {
      return {
        providerId: id,
        success: false,
        responseTime: 0,
        error: 'Provider not found',
      };
    }

    const startTime = Date.now();
    try {
      const details = await this.performConnectionTest(provider);
      const responseTime = Date.now() - startTime;

      return {
        providerId: id,
        success: true,
        responseTime,
        details,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        providerId: id,
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  /**
   * Perform health check for a provider
   */
  private async performHealthCheck(provider: ProviderConfig): Promise<void> {
    if (!provider.apiKey) {
      throw new Error('API key not configured');
    }

    const headers: Record<string, string> = {};

    switch (provider.type) {
      case 'anthropic':
        headers['x-api-key'] = provider.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        // Simple health check - list models endpoint
        await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 5000,
        });
        break;

      case 'openai':
      case 'openrouter':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 5000,
        });
        break;

      case 'google-gemini':
        await axios.get(`${provider.baseUrl}/models?key=${provider.apiKey}`, {
          timeout: 5000,
        });
        break;

      case 'cohere':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        await axios.get(`${provider.baseUrl}/check-api-key`, {
          headers,
          timeout: 5000,
        });
        break;

      case 'meta-llama':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 5000,
        });
        break;

      case 'aws-bedrock':
        // AWS Bedrock requires AWS SDK, simplified check
        throw new Error('AWS Bedrock health check not implemented (requires AWS SDK)');

      default:
        throw new Error(`Health check not implemented for provider type: ${provider.type}`);
    }
  }

  /**
   * Perform connection test for a provider
   */
  private async performConnectionTest(provider: ProviderConfig): Promise<{
    modelsDiscovered?: string[];
    apiVersion?: string;
    capabilities?: string[];
  }> {
    if (!provider.apiKey) {
      throw new Error('API key not configured');
    }

    const headers: Record<string, string> = {};
    let response;

    switch (provider.type) {
      case 'anthropic':
        headers['x-api-key'] = provider.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        response = await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 10000,
        });
        return {
          modelsDiscovered: response.data?.data?.map((m: any) => m.id) || provider.models,
          apiVersion: '2023-06-01',
          capabilities: ['chat', 'streaming', 'function-calling'],
        };

      case 'openai':
      case 'openrouter':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        response = await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 10000,
        });
        return {
          modelsDiscovered: response.data?.data?.map((m: any) => m.id).slice(0, 10) || provider.models,
          apiVersion: 'v1',
          capabilities: ['chat', 'streaming', 'function-calling'],
        };

      case 'google-gemini':
        response = await axios.get(`${provider.baseUrl}/models?key=${provider.apiKey}`, {
          timeout: 10000,
        });
        return {
          modelsDiscovered: response.data?.models?.map((m: any) => m.name.replace('models/', '')).slice(0, 10) || provider.models,
          apiVersion: 'v1',
          capabilities: ['chat', 'streaming', 'multi-modal'],
        };

      case 'cohere':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        await axios.get(`${provider.baseUrl}/check-api-key`, {
          headers,
          timeout: 10000,
        });
        return {
          modelsDiscovered: provider.models,
          apiVersion: 'v1',
          capabilities: ['chat', 'streaming', 'embeddings'],
        };

      case 'meta-llama':
        headers['Authorization'] = `Bearer ${provider.apiKey}`;
        response = await axios.get(`${provider.baseUrl}/models`, {
          headers,
          timeout: 10000,
        });
        return {
          modelsDiscovered: response.data?.data?.map((m: any) => m.id).filter((id: string) => id.includes('llama')).slice(0, 10) || provider.models,
          apiVersion: 'v1',
          capabilities: ['chat', 'streaming'],
        };

      case 'aws-bedrock':
        throw new Error('AWS Bedrock connection test not implemented (requires AWS SDK)');

      default:
        throw new Error(`Connection test not implemented for provider type: ${provider.type}`);
    }
  }

  /**
   * Get provider statistics
   */
  public async getStatistics(): Promise<{
    total: number;
    enabled: number;
    disabled: number;
    byType: Record<ProviderType, number>;
  }> {
    const providers = Array.from(this.providers.values());

    const stats = {
      total: providers.length,
      enabled: providers.filter(p => p.enabled).length,
      disabled: providers.filter(p => !p.enabled).length,
      byType: {} as Record<ProviderType, number>,
    };

    // Count by type
    providers.forEach(provider => {
      stats.byType[provider.type] = (stats.byType[provider.type] || 0) + 1;
    });

    return stats;
  }
}
