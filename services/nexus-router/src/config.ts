import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import {
  getDefaultGeminiModel,
  getDefaultOpenAIModel,
} from './services/cloud-provider-adapters';

dotenvConfig();

const WorkerSchema = z.object({
  url: z.string().url(),
  models: z.array(z.string()),
  primaryUse: z.enum(['reasoning', 'analysis', 'coding', 'general']),
  maxConcurrent: z.number().default(4),
  timeout: z.number().default(120000),
});

const ConfigSchema = z.object({
  server: z.object({
    port: z.number().default(8000),
    mcpPort: z.number().default(4001),
    corsOrigins: z.array(z.string()).default(['http://localhost:3000', 'http://localhost:3001']),
    rateLimitWindow: z.number().default(60000),
    rateLimitMaxRequests: z.number().default(100),
  }),
  redis: z.object({
    url: z.string(),
    cacheKeyPrefix: z.string().default('nexus:'),
    cacheTtl: z.number().default(3600),
  }),
  routing: z.object({
    strategy: z.enum(['cost-optimized', 'latency-optimized', 'quality-optimized']).default('cost-optimized'),
    preferLocal: z.boolean().default(true),
    fallbackCloud: z.boolean().default(true),
    costThreshold: z.number().default(0.10),
  }),
  workers: z.object({
    local: z.array(WorkerSchema),
    cloud: z.object({
      openai: z.object({
        apiKey: z.string(),
        baseUrl: z.string().default('https://api.openai.com/v1'),
        model: z.string().default(getDefaultOpenAIModel()),
        maxTokens: z.number().default(4096),
      }),
      googleGemini: z.object({
        apiKey: z.string(),
        baseUrl: z.string().default('https://generativelanguage.googleapis.com/v1'),
        model: z.string().default(getDefaultGeminiModel()),
        maxTokens: z.number().default(8192),
      }),
      anthropic: z.object({
        apiKey: z.string(),
        model: z.string().default('claude-sonnet-4-20250514'),
        maxTokens: z.number().default(4096),
      }),
      openrouter: z.object({
        apiKey: z.string(),
        baseUrl: z.string().default('https://openrouter.ai/api/v1'),
        fallbackModel: z.string().default('deepseek/deepseek-r1'),
      }),
    }),
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    metricsInterval: z.number().default(60000),
  }),
});

// Parse local workers from environment
const parseLocalWorkers = (): z.infer<typeof WorkerSchema>[] => {
  const workers: z.infer<typeof WorkerSchema>[] = [];

  // Worker 5090 (48GB VRAM) - Large models
  if (process.env.WORKER_5090_URL) {
    workers.push({
      url: process.env.WORKER_5090_URL,
      models: (process.env.WORKER_5090_MODELS || '').split(',').filter(Boolean),
      primaryUse: 'reasoning',
      maxConcurrent: 4,
      timeout: 180000,
    });
  }

  // Worker 3090 (24GB VRAM) - Medium-large models
  if (process.env.WORKER_3090_URL) {
    workers.push({
      url: process.env.WORKER_3090_URL,
      models: (process.env.WORKER_3090_MODELS || '').split(',').filter(Boolean),
      primaryUse: 'analysis',
      maxConcurrent: 6,
      timeout: 120000,
    });
  }

  // Worker 3060 (12GB VRAM) - Specialized models
  if (process.env.WORKER_3060_URL) {
    workers.push({
      url: process.env.WORKER_3060_URL,
      models: (process.env.WORKER_3060_MODELS || '').split(',').filter(Boolean),
      primaryUse: 'coding',
      maxConcurrent: 8,
      timeout: 90000,
    });
  }

  return workers;
};

export const config = ConfigSchema.parse({
  server: {
    port: parseInt(process.env.NEXUS_ROUTER_PORT || '8000', 10),
    mcpPort: parseInt(process.env.NEXUS_ROUTER_MCP_PORT || '4001', 10),
    corsOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    rateLimitWindow: 60000,
    rateLimitMaxRequests: 100,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    cacheKeyPrefix: 'nexus:',
    cacheTtl: 3600,
  },
  routing: {
    strategy: (process.env.MODEL_ROUTING_STRATEGY || 'cost-optimized') as 'cost-optimized',
    preferLocal: process.env.MODEL_ROUTING_PREFER_LOCAL === 'true',
    fallbackCloud: process.env.MODEL_ROUTING_FALLBACK_CLOUD === 'true',
    costThreshold: parseFloat(process.env.MODEL_ROUTING_COST_THRESHOLD || '0.10'),
  },
  workers: {
    local: parseLocalWorkers(),
    cloud: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        model: process.env.OPENAI_MODEL || getDefaultOpenAIModel(),
        maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
      },
      googleGemini: {
        apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '',
        baseUrl:
          process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1',
        model: process.env.GEMINI_MODEL || getDefaultGeminiModel(),
        maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192', 10),
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
      },
      openrouter: {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
        fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL || 'deepseek/deepseek-r1',
      },
    },
  },
  monitoring: {
    enabled: process.env.NEXUS_MONITORING_ENABLED !== 'false',
    metricsInterval: 60000,
  },
});

export type Config = z.infer<typeof ConfigSchema>;
export type Worker = z.infer<typeof WorkerSchema>;
