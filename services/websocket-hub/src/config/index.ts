import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(8080),
  metricsPort: z.coerce.number().default(9090),
  jwtSecret: z.string().min(32),
  allowedOrigins: z.string().transform(s => s.split(',')),
  redisUrl: z.string().optional(),
  redisEnabled: z.coerce.boolean().default(false),
  rateLimitPoints: z.coerce.number().default(10),
  rateLimitDuration: z.coerce.number().default(60),
  nexusRouterUrl: z.string().url().optional(),
  nexusRouterApiKey: z.string().optional(),
  sessionTimeout: z.coerce.number().default(3600),
  maxConnectionsPerUser: z.coerce.number().default(5),
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error']).default('info'),
  healthCheckInterval: z.coerce.number().default(30000),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  try {
    return configSchema.parse({
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT,
      metricsPort: process.env.METRICS_PORT,
      jwtSecret: process.env.JWT_SECRET,
      allowedOrigins: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
      redisUrl: process.env.REDIS_URL,
      redisEnabled: process.env.REDIS_ENABLED,
      rateLimitPoints: process.env.RATE_LIMIT_POINTS,
      rateLimitDuration: process.env.RATE_LIMIT_DURATION,
      nexusRouterUrl: process.env.NEXUS_ROUTER_URL,
      nexusRouterApiKey: process.env.NEXUS_ROUTER_API_KEY,
      sessionTimeout: process.env.SESSION_TIMEOUT,
      maxConnectionsPerUser: process.env.MAX_CONNECTIONS_PER_USER,
      logLevel: process.env.LOG_LEVEL,
      healthCheckInterval: process.env.HEALTH_CHECK_INTERVAL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Configuration validation failed:');
      error.errors.forEach(err => {
        console.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration');
    }
    throw error;
  }
}

export const config = loadConfig();
