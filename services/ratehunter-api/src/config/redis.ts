import { createClient, RedisClientType } from "redis";
import { createLogger } from "@nyra/shared";

const logger = createLogger("ratehunter-api:redis");

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<RedisClientType> => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || "0"),
    });

    redisClient.on("error", (err) => {
      logger.error("redis client error", { error: String(err) });
    });

    redisClient.on("connect", () => {
      logger.info("Redis connected successfully");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error("failed to connect to redis", { error: String(error) });
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info("Redis disconnected successfully");
    } catch (error) {
      logger.error("failed to disconnect from redis", { error: String(error) });
      throw error;
    }
  }
};

export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error("cache get error", { key, error: String(error) });
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = 300
): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    logger.error("cache set error", { key, error: String(error) });
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error("cache delete error", { key, error: String(error) });
  }
};

export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    logger.error("cache delete pattern error", {
      pattern,
      error: String(error),
    });
  }
};
