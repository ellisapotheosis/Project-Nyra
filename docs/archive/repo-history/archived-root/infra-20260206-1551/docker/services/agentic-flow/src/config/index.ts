/**
 * Agentic-Flow Configuration
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration schema
const configSchema = z.object({
  // Core
  nodeEnv: z.enum(['development', 'production', 'test']).default('production'),
  port: z.coerce.number().default(8080),
  mcpPort: z.coerce.number().default(8081),

  // Database
  databaseUrl: z.string().url(),
  agentdbPath: z.string().default('/app/data/agentdb/agentic.db'),

  // Redis
  redisUrl: z.string().url(),
  redisCacheTtl: z.coerce.number().default(3600),

  // AgentDB
  agentdbEnabled: z.coerce.boolean().default(true),
  agentdbQuantization: z.enum(['none', 'scalar', 'binary', 'product']).default('binary'),
  agentdbCacheSize: z.coerce.number().default(2000),
  agentdbHnswM: z.coerce.number().default(16),
  agentdbHnswEf: z.coerce.number().default(100),

  // Learning & Intelligence
  agentdbLearning: z.coerce.boolean().default(true),
  agentdbReasoning: z.coerce.boolean().default(true),
  enableReasoningbank: z.coerce.boolean().default(true),
  enableNeuralOptimization: z.coerce.boolean().default(true),

  // QUIC Synchronization
  agentdbQuicSync: z.coerce.boolean().default(true),
  agentdbQuicPort: z.coerce.number().default(4433),
  agentdbQuicPeers: z.string().default(''),

  // LLM Providers
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
  openrouterApiKey: z.string().optional(),

  // Service URLs
  nexusRouterUrl: z.string().url().optional(),
  claudeFlowUrl: z.string().url().optional(),
  claudeFlowIntegration: z.coerce.boolean().default(true),

  // Agent Configuration
  agentConfigPath: z.string().default('/app/data/agent-configs'),
  maxConcurrentAgents: z.coerce.number().default(35),
  agentTimeout: z.coerce.number().default(300000),

  // Performance
  enableCaching: z.coerce.boolean().default(true),
  enableCompression: z.coerce.boolean().default(true),
  enableBatchProcessing: z.coerce.boolean().default(true),
  workerThreads: z.coerce.number().default(4),

  // Monitoring
  enableTelemetry: z.coerce.boolean().default(true),
  prometheusEnabled: z.coerce.boolean().default(true),
  prometheusPort: z.coerce.number().default(9091),

  // Logging
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  logFormat: z.enum(['json', 'pretty']).default('json'),
  logPath: z.string().default('/app/data/logs'),

  // Security
  enableAuth: z.coerce.boolean().default(true),
  jwtSecret: z.string().optional(),
  apiKey: z.string().optional(),
});

// Parse and validate configuration
export const config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  mcpPort: process.env.MCP_PORT,

  databaseUrl: process.env.DATABASE_URL,
  agentdbPath: process.env.AGENTDB_PATH,

  redisUrl: process.env.REDIS_URL,
  redisCacheTtl: process.env.REDIS_CACHE_TTL,

  agentdbEnabled: process.env.AGENTDB_ENABLED,
  agentdbQuantization: process.env.AGENTDB_QUANTIZATION,
  agentdbCacheSize: process.env.AGENTDB_CACHE_SIZE,
  agentdbHnswM: process.env.AGENTDB_HNSW_M,
  agentdbHnswEf: process.env.AGENTDB_HNSW_EF,

  agentdbLearning: process.env.AGENTDB_LEARNING,
  agentdbReasoning: process.env.AGENTDB_REASONING,
  enableReasoningbank: process.env.ENABLE_REASONINGBANK,
  enableNeuralOptimization: process.env.ENABLE_NEURAL_OPTIMIZATION,

  agentdbQuicSync: process.env.AGENTDB_QUIC_SYNC,
  agentdbQuicPort: process.env.AGENTDB_QUIC_PORT,
  agentdbQuicPeers: process.env.AGENTDB_QUIC_PEERS,

  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openrouterApiKey: process.env.OPENROUTER_API_KEY,

  nexusRouterUrl: process.env.NEXUS_ROUTER_URL,
  claudeFlowUrl: process.env.CLAUDE_FLOW_URL,
  claudeFlowIntegration: process.env.CLAUDE_FLOW_INTEGRATION,

  agentConfigPath: process.env.AGENT_CONFIG_PATH,
  maxConcurrentAgents: process.env.MAX_CONCURRENT_AGENTS,
  agentTimeout: process.env.AGENT_TIMEOUT,

  enableCaching: process.env.ENABLE_CACHING,
  enableCompression: process.env.ENABLE_COMPRESSION,
  enableBatchProcessing: process.env.ENABLE_BATCH_PROCESSING,
  workerThreads: process.env.WORKER_THREADS,

  enableTelemetry: process.env.ENABLE_TELEMETRY,
  prometheusEnabled: process.env.PROMETHEUS_ENABLED,
  prometheusPort: process.env.PROMETHEUS_PORT,

  logLevel: process.env.LOG_LEVEL,
  logFormat: process.env.LOG_FORMAT,
  logPath: process.env.LOG_PATH,

  enableAuth: process.env.ENABLE_AUTH,
  jwtSecret: process.env.JWT_SECRET,
  apiKey: process.env.API_KEY,
});

export type Config = z.infer<typeof configSchema>;
