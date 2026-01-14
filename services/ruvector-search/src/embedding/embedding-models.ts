/**
 * Embedding model configurations and interfaces
 */

export interface EmbeddingModelConfig {
  provider: string;
  model: string;
  dimensions: number;
  maxTokens?: number;
  batchSize: number;
}

export const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig> = {
  // OpenAI Models
  'openai-small': {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },
  'openai-large': {
    provider: 'openai',
    model: 'text-embedding-3-large',
    dimensions: 3072,
    maxTokens: 8191,
    batchSize: 100,
  },
  'openai-ada': {
    provider: 'openai',
    model: 'text-embedding-ada-002',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },

  // Cohere Models
  'cohere-english': {
    provider: 'cohere',
    model: 'embed-english-v3.0',
    dimensions: 1024,
    batchSize: 96,
  },
  'cohere-multilingual': {
    provider: 'cohere',
    model: 'embed-multilingual-v3.0',
    dimensions: 1024,
    batchSize: 96,
  },

  // Local Models (via Transformers.js)
  'local-minilm': {
    provider: 'local',
    model: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    batchSize: 32,
  },
  'local-mpnet': {
    provider: 'local',
    model: 'Xenova/all-mpnet-base-v2',
    dimensions: 768,
    batchSize: 16,
  },
  'local-e5': {
    provider: 'local',
    model: 'Xenova/e5-small-v2',
    dimensions: 384,
    batchSize: 32,
  },
};

export function getModelConfig(modelKey: string): EmbeddingModelConfig {
  const config = EMBEDDING_MODELS[modelKey];
  if (!config) {
    throw new Error(`Unknown model: ${modelKey}. Available models: ${Object.keys(EMBEDDING_MODELS).join(', ')}`);
  }
  return config;
}

export function getModelsByProvider(provider: string): EmbeddingModelConfig[] {
  return Object.values(EMBEDDING_MODELS).filter(m => m.provider === provider);
}

export function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

export function chunkTextByTokens(text: string, maxTokens: number): string[] {
  const estimatedTokens = estimateTokens(text);

  if (estimatedTokens <= maxTokens) {
    return [text];
  }

  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  let currentChunk = '';
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > maxTokens) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
      currentTokens = sentenceTokens;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
      currentTokens += sentenceTokens;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
