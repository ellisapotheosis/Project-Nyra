import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('rate-limiter');

export class RateLimiter {
  private limiter: RateLimiterMemory | RateLimiterRedis;

  constructor(redis?: Redis) {
    const opts = {
      points: config.rateLimitPoints,
      duration: config.rateLimitDuration,
      blockDuration: 60,
    };

    if (redis && config.redisEnabled) {
      this.limiter = new RateLimiterRedis({
        ...opts,
        storeClient: redis,
        keyPrefix: 'ws:ratelimit',
      });
      logger.info('Rate limiter initialized with Redis');
    } else {
      this.limiter = new RateLimiterMemory(opts);
      logger.info('Rate limiter initialized with in-memory storage');
    }
  }

  async consume(key: string, points: number = 1): Promise<boolean> {
    try {
      await this.limiter.consume(key, points);
      return true;
    } catch (rejRes: any) {
      logger.warn({ key, msBeforeNext: rejRes.msBeforeNext }, 'Rate limit exceeded');
      return false;
    }
  }

  async getRemainingPoints(key: string): Promise<number> {
    try {
      const res = await this.limiter.get(key);
      return res ? res.remainingPoints : config.rateLimitPoints;
    } catch (error) {
      logger.error({ error }, 'Failed to get remaining points');
      return 0;
    }
  }
}
