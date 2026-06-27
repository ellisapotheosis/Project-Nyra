import { createClient } from "redis";
import { createLogger } from "@nyra/shared";

const logger = createLogger("mortgage-assistant-api:redis");

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || "0"),
});

redisClient.on("connect", () => {
  logger.info("Redis client connected");
});

redisClient.on("error", (err) => {
  logger.error("redis error", { error: String(err) });
});

redisClient.on("ready", () => {
  logger.info("Redis client ready");
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info("Redis connected successfully");
  } catch (error) {
    logger.error("redis connection error", { error: String(error) });
    // Don't exit process, caching is not critical
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.quit();
    logger.info("Redis disconnected successfully");
  } catch (error) {
    logger.error("redis disconnection error", { error: String(error) });
  }
};

export default redisClient;
