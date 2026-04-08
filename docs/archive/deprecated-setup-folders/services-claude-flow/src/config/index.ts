/**
 * Claude Flow Brain Configuration
 */

import { z } from 'zod';
import 'dotenv/config';

const configSchema = z.object({
  // Server
  nodeEnv: z.enum(['development', 'production', 'test']).default('production'),
  port: z.coerce.number().default(8080),
  host: z.string().default('0.0.0.0'),
  logLevel: z.string().default('info'),

  // Features
  enableReasoningBank: z.coerce.boolean().default(true),
  enableAgentDB: z.coerce.boolean().default(true),
  enableRuvector: z.coerce.boolean().default(true),

  // Redis
  redisUrl: z.string().optional(),
  redisPassword: z.string().optional(),

  // RuVector
  ruvectorHost: z.string().default('localhost'),
  ruvectorPort: z.coerce.number().default(5432),
  ruvectorUser: z.string().default('claude'),
  ruvectorPassword: z.string().optional(),
  ruvectorDatabase: z.string().default('claude_flow'),

  // API Keys
  anthropicApiKey: z.string().optional(),
  openaiApiKey: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse({
  nodeEnv: process.env.NODE_ENV,
  port: process.env.CLAUDE_FLOW_PORT,
  host: process.env.CLAUDE_FLOW_HOST,
  logLevel: process.env.LOG_LEVEL,

  enableReasoningBank: process.env.CLAUDE_FLOW_ENABLE_REASONING_BANK,
  enableAgentDB: process.env.CLAUDE_FLOW_ENABLE_AGENT_DB,
  enableRuvector: process.env.CLAUDE_FLOW_ENABLE_RUVECTOR,

  redisUrl: process.env.REDIS_URL,
  redisPassword: process.env.REDIS_PASSWORD,

  ruvectorHost: process.env.RUVECTOR_HOST,
  ruvectorPort: process.env.RUVECTOR_PORT,
  ruvectorUser: process.env.RUVECTOR_USER,
  ruvectorPassword: process.env.RUVECTOR_PASSWORD,
  ruvectorDatabase: process.env.RUVECTOR_DATABASE,

  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
});
