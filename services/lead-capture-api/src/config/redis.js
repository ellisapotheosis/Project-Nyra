const redis = require('redis');
const logger = require('./logger');

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD || undefined,
  database: parseInt(process.env.REDIS_DB || '0'),
});

client.on('connect', () => {
  logger.info('Redis connection established');
});

client.on('error', (err) => {
  logger.error('Redis error', { error: err.message });
});

client.on('ready', () => {
  logger.info('Redis client ready');
});

async function connect() {
  if (!client.isOpen) {
    await client.connect();
  }
}

async function get(key) {
  try {
    return await client.get(key);
  } catch (error) {
    logger.error('Redis GET error', { key, error: error.message });
    throw error;
  }
}

async function set(key, value, options = {}) {
  try {
    if (options.ttl) {
      return await client.setEx(key, options.ttl, value);
    }
    return await client.set(key, value);
  } catch (error) {
    logger.error('Redis SET error', { key, error: error.message });
    throw error;
  }
}

async function del(key) {
  try {
    return await client.del(key);
  } catch (error) {
    logger.error('Redis DEL error', { key, error: error.message });
    throw error;
  }
}

async function exists(key) {
  try {
    return await client.exists(key);
  } catch (error) {
    logger.error('Redis EXISTS error', { key, error: error.message });
    throw error;
  }
}

async function incr(key) {
  try {
    return await client.incr(key);
  } catch (error) {
    logger.error('Redis INCR error', { key, error: error.message });
    throw error;
  }
}

async function expire(key, seconds) {
  try {
    return await client.expire(key, seconds);
  } catch (error) {
    logger.error('Redis EXPIRE error', { key, error: error.message });
    throw error;
  }
}

async function hset(key, field, value) {
  try {
    return await client.hSet(key, field, value);
  } catch (error) {
    logger.error('Redis HSET error', { key, field, error: error.message });
    throw error;
  }
}

async function hget(key, field) {
  try {
    return await client.hGet(key, field);
  } catch (error) {
    logger.error('Redis HGET error', { key, field, error: error.message });
    throw error;
  }
}

async function hgetall(key) {
  try {
    return await client.hGetAll(key);
  } catch (error) {
    logger.error('Redis HGETALL error', { key, error: error.message });
    throw error;
  }
}

async function healthCheck() {
  try {
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return false;
  }
}

async function disconnect() {
  if (client.isOpen) {
    await client.quit();
  }
}

module.exports = {
  client,
  connect,
  get,
  set,
  del,
  exists,
  incr,
  expire,
  hset,
  hget,
  hgetall,
  healthCheck,
  disconnect,
};
