/**
 * Redis Service - State management and pub/sub
 */

import Redis from 'ioredis';
import type { Logger } from 'pino';
import type { Config } from '../config/index.js';

export async function initializeRedis(config: Config, logger: Logger): Promise<Redis | null> {
  if (!config.redisUrl) {
    logger.warn('Redis URL not configured, running without Redis');
    return null;
  }

  try {
    const redis = new Redis(config.redisUrl, {
      password: config.redisPassword,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => {
      logger.info('Redis connected');
    });

    redis.on('error', (err) => {
      logger.error({ err }, 'Redis error');
    });

    // Test connection
    await redis.ping();
    logger.info('Redis connection verified');

    return redis;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis');
    return null;
  }
}

export type RedisClient = Redis;
