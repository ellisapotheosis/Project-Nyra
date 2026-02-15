/**
 * Embeddings Service - Vector embeddings generation
 *
 * Supports multiple embedding providers
 */

import type { Logger } from 'pino';
import type { Config } from '../config/index.js';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  dimensions: number;
  usage?: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingsClient {
  embed: (text: string) => Promise<EmbeddingResult>;
  embedBatch: (texts: string[]) => Promise<EmbeddingResult[]>;
  dimensions: number;
}

/**
 * Simple hash-based embedding for development (deterministic, no API needed)
 */
function simpleHashEmbedding(text: string, dimensions: number = 384): number[] {
  const embedding = new Array(dimensions).fill(0);
  
  // Simple deterministic embedding based on text hash
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const idx = i % dimensions;
    embedding[idx] = (embedding[idx] + charCode / 255) % 1;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

export async function initializeEmbeddings(
  config: Config,
  logger: Logger
): Promise<EmbeddingsClient> {
  const dimensions = 384; // Default dimensions

  // Use OpenAI if API key is available
  if (config.openaiApiKey) {
    logger.info('Using OpenAI embeddings');
    
    return {
      dimensions,
      async embed(text: string): Promise<EmbeddingResult> {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: text,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json() as {
          data: Array<{ embedding: number[] }>;
          usage: { prompt_tokens: number; total_tokens: number };
        };

        return {
          embedding: data.data[0].embedding,
          model: 'text-embedding-3-small',
          dimensions: data.data[0].embedding.length,
          usage: data.usage,
        };
      },

      async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
        const response = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.openaiApiKey}`,
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: texts,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.status}`);
        }

        const data = await response.json() as {
          data: Array<{ embedding: number[]; index: number }>;
          usage: { prompt_tokens: number; total_tokens: number };
        };

        return data.data
          .sort((a, b) => a.index - b.index)
          .map((item) => ({
            embedding: item.embedding,
            model: 'text-embedding-3-small',
            dimensions: item.embedding.length,
          }));
      },
    };
  }

  // Fallback to simple hash-based embeddings
  logger.warn('No embedding API key configured, using simple hash embeddings');
  
  return {
    dimensions,
    async embed(text: string): Promise<EmbeddingResult> {
      return {
        embedding: simpleHashEmbedding(text, dimensions),
        model: 'simple-hash',
        dimensions,
      };
    },

    async embedBatch(texts: string[]): Promise<EmbeddingResult[]> {
      return texts.map((text) => ({
        embedding: simpleHashEmbedding(text, dimensions),
        model: 'simple-hash',
        dimensions,
      }));
    },
  };
}
