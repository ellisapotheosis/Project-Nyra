/**
 * Vector Embedding Service
 * Supports multiple providers: OpenAI, Cohere, Local models
 */

import OpenAI from 'openai';
import { CohereClient } from 'cohere-ai';
import { pipeline, Pipeline } from '@xenova/transformers';
import pino from 'pino';
import { EmbeddingRequest, EmbeddingResponse, EmbeddingProvider } from '../types';
import { getModelConfig, chunkTextByTokens } from './embedding-models';

const logger = pino({ name: 'embedding-service' });

export class EmbeddingService {
  private openaiClient?: OpenAI;
  private cohereClient?: CohereClient;
  private localPipelines: Map<string, Pipeline> = new Map();
  private initialized = false;

  constructor(
    private config: {
      openaiApiKey?: string;
      cohereApiKey?: string;
      defaultProvider?: EmbeddingProvider;
      defaultModel?: string;
    }
  ) {}

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Initialize OpenAI
    if (this.config.openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.openaiApiKey,
      });
      logger.info('OpenAI client initialized');
    }

    // Initialize Cohere
    if (this.config.cohereApiKey) {
      this.cohereClient = new CohereClient({
        token: this.config.cohereApiKey,
      });
      logger.info('Cohere client initialized');
    }

    this.initialized = true;
    logger.info('Embedding service initialized');
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const provider = request.provider || this.config.defaultProvider || 'openai';
    const texts = Array.isArray(request.text) ? request.text : [request.text];

    switch (provider) {
      case 'openai':
        return await this.embedOpenAI(texts, request.model);
      case 'cohere':
        return await this.embedCohere(texts, request.model);
      case 'local':
        return await this.embedLocal(texts, request.model);
      default:
        throw new Error(`Unknown embedding provider: ${provider}`);
    }
  }

  private async embedOpenAI(texts: string[], model?: string): Promise<EmbeddingResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Provide API key.');
    }

    const modelKey = model || 'text-embedding-3-small';
    const modelConfig = getModelConfig(`openai-${modelKey.split('-').pop()}`);

    logger.debug({ model: modelKey, count: texts.length }, 'Generating OpenAI embeddings');

    const response = await this.openaiClient.embeddings.create({
      model: modelKey,
      input: texts,
      dimensions: modelConfig.dimensions,
    });

    return {
      embeddings: response.data.map(item => item.embedding),
      model: modelKey,
      provider: 'openai',
      dimensions: modelConfig.dimensions,
      tokensUsed: response.usage.total_tokens,
    };
  }

  private async embedCohere(texts: string[], model?: string): Promise<EmbeddingResponse> {
    if (!this.cohereClient) {
      throw new Error('Cohere client not initialized. Provide API key.');
    }

    const modelKey = model || 'embed-english-v3.0';
    const modelConfig = getModelConfig('cohere-english');

    logger.debug({ model: modelKey, count: texts.length }, 'Generating Cohere embeddings');

    const response = await this.cohereClient.embed({
      texts,
      model: modelKey,
      inputType: 'search_document',
    });

    return {
      embeddings: response.embeddings,
      model: modelKey,
      provider: 'cohere',
      dimensions: modelConfig.dimensions,
    };
  }

  private async embedLocal(texts: string[], model?: string): Promise<EmbeddingResponse> {
    const modelKey = model || 'Xenova/all-MiniLM-L6-v2';
    const modelConfig = getModelConfig('local-minilm');

    logger.debug({ model: modelKey, count: texts.length }, 'Generating local embeddings');

    // Get or create pipeline
    let pipe = this.localPipelines.get(modelKey);
    if (!pipe) {
      pipe = await pipeline('feature-extraction', modelKey);
      this.localPipelines.set(modelKey, pipe);
      logger.info({ model: modelKey }, 'Local model pipeline created');
    }

    // Generate embeddings
    const embeddings: number[][] = [];
    for (const text of texts) {
      const output = await pipe(text, { pooling: 'mean', normalize: true });
      embeddings.push(Array.from(output.data));
    }

    return {
      embeddings,
      model: modelKey,
      provider: 'local',
      dimensions: modelConfig.dimensions,
    };
  }

  async embedWithChunking(
    text: string,
    provider?: EmbeddingProvider,
    model?: string
  ): Promise<number[][]> {
    const modelKey = model || this.config.defaultModel || 'text-embedding-3-small';
    const modelConfig = getModelConfig(modelKey);

    const chunks = chunkTextByTokens(text, modelConfig.maxTokens || 8000);
    logger.debug({ chunks: chunks.length }, 'Text chunked for embedding');

    const response = await this.embed({
      text: chunks,
      provider: provider || this.config.defaultProvider,
      model,
    });

    return response.embeddings;
  }

  async embedQuery(query: string, provider?: EmbeddingProvider): Promise<number[]> {
    const response = await this.embed({
      text: query,
      provider: provider || this.config.defaultProvider,
    });

    return response.embeddings[0];
  }

  getAvailableProviders(): EmbeddingProvider[] {
    const providers: EmbeddingProvider[] = ['local'];

    if (this.openaiClient) providers.push('openai');
    if (this.cohereClient) providers.push('cohere');

    return providers;
  }

  async close(): Promise<void> {
    // Clear local pipelines
    this.localPipelines.clear();
    this.initialized = false;
    logger.info('Embedding service closed');
  }
}
