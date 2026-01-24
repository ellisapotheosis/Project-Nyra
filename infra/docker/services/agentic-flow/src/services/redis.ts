/**
 * Redis Service - Cache and queue initialization
 */

import Redis from 'ioredis';
import type { Logger } from 'pino';
import { config } from '../config/index.js';

export async function initializeRedis(logger: Logger): Promise<Redis> {
  try {
    logger.info(`Connecting to Redis: ${config.redisUrl}`);

    const redis = new Redis(config.redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn({ times, delay }, 'Retrying Redis connection');
        return delay;
      },
      maxRetriesPerRequest: 3,
    });

    await new Promise<void>((resolve, reject) => {
      redis.on('ready', () => {
        logger.info('Redis connected successfully');
        resolve();
      });
      redis.on('error', (error) => {
        logger.error({ error }, 'Redis connection error');
        reject(error);
      });
    });

    return redis;
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis');
    throw error;
  }
}
