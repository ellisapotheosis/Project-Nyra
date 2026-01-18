import Redis from 'ioredis';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('redis-client');

export class RedisClient {
  private static instance: RedisClient;
  private client: Redis;
  private connected: boolean = false;

  private constructor() {
    this.client = new Redis(config.redis.url, {
      retryStrategy: (times: number) => {
        // Stop retrying after 3 attempts to avoid memory leaks
        if (times > 3) {
          logger.error('Redis connection failed after 3 attempts, giving up');
          return null;
        }
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis connection retry attempt ${times}, delay: ${delay}ms`);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      enableOfflineQueue: false, // Don't queue commands when disconnected
    });

    this.client.on('connect', () => {
      logger.info('Redis connecting...');
    });

    this.client.on('ready', () => {
      this.connected = true;
      logger.info('Redis connected and ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
      this.connected = false;
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
      this.connected = false;
    });
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.connected) {
      // Add timeout to prevent hanging indefinitely
      const connectPromise = this.client.connect();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout after 5s')), 5000)
      );

      await Promise.race([connectPromise, timeoutPromise]);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  // Cache operations
  public async get(key: string): Promise<string | null> {
    if (!this.connected) return null;
    try {
      const fullKey = `${config.redis.cacheKeyPrefix}${key}`;
      return await this.client.get(fullKey);
    } catch (error) {
      logger.warn(`Redis get failed for key ${key}:`, error);
      return null;
    }
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.connected) return;
    try {
      const fullKey = `${config.redis.cacheKeyPrefix}${key}`;
      const ttlSeconds = ttl || config.redis.cacheTtl;
      await this.client.setex(fullKey, ttlSeconds, value);
    } catch (error) {
      logger.warn(`Redis set failed for key ${key}:`, error);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.connected) return;
    try {
      const fullKey = `${config.redis.cacheKeyPrefix}${key}`;
      await this.client.del(fullKey);
    } catch (error) {
      logger.warn(`Redis del failed for key ${key}:`, error);
    }
  }

  // Metrics operations
  public async incrementMetric(metric: string): Promise<void> {
    if (!this.connected) return;
    try {
      const key = `${config.redis.cacheKeyPrefix}metrics:${metric}`;
      await this.client.incr(key);
    } catch (error) {
      logger.warn(`Redis incrementMetric failed for ${metric}:`, error);
    }
  }

  public async getMetric(metric: string): Promise<number> {
    if (!this.connected) return 0;
    try {
      const key = `${config.redis.cacheKeyPrefix}metrics:${metric}`;
      const value = await this.client.get(key);
      return value ? parseInt(value, 10) : 0;
    } catch (error) {
      logger.warn(`Redis getMetric failed for ${metric}:`, error);
      return 0;
    }
  }

  // Request deduplication
  public async checkRequestCache(requestHash: string): Promise<string | null> {
    return await this.get(`request:${requestHash}`);
  }

  public async cacheRequest(requestHash: string, response: string, ttl?: number): Promise<void> {
    await this.set(`request:${requestHash}`, response, ttl);
  }

  // Worker status tracking
  public async setWorkerStatus(workerId: string, status: string, ttl: number = 300): Promise<void> {
    const key = `worker:${workerId}:status`;
    await this.set(key, status, ttl);
  }

  public async getWorkerStatus(workerId: string): Promise<string | null> {
    return await this.get(`worker:${workerId}:status`);
  }

  public getClient(): Redis {
    return this.client;
  }
}
