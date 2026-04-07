/**
 * Memory Routes - Memory management endpoints
 */

import { Router } from 'express';
import type { Logger } from 'pino';
import type { RedisClient } from '../services/redis.js';
import type { RuvectorClient } from '../services/ruvector.js';
import type { MemoryClient } from '../services/memory.js';

interface MemoryDependencies {
  redis: RedisClient | null;
  ruvector: RuvectorClient | null;
  memory: MemoryClient | null;
  logger: Logger;
}

export function createMemoryRouter(deps: MemoryDependencies): Router {
  const router = Router();

  // Store memory
  router.post('/store', async (req, res, next) => {
    try {
      const { namespace, key, value, metadata } = req.body;

      if (!namespace || !key || value === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: namespace, key, value',
        });
      }

      if (deps.memory) {
        await deps.memory.store(namespace, key, value, metadata);
      } else if (deps.redis) {
        const redisKey = `memory:${namespace}:${key}`;
        await deps.redis.set(redisKey, JSON.stringify({ value, metadata }), 'EX', 86400);
      } else {
        return res.status(503).json({ error: 'Memory service unavailable' });
      }

      res.json({
        success: true,
        id: `${namespace}:${key}`,
      });
    } catch (error) {
      next(error);
    }
  });

  // Retrieve memory
  router.get('/retrieve/:namespace/:key', async (req, res, next) => {
    try {
      const { namespace, key } = req.params;

      let result = null;

      if (deps.memory) {
        result = await deps.memory.retrieve(namespace, key);
      } else if (deps.redis) {
        const redisKey = `memory:${namespace}:${key}`;
        const data = await deps.redis.get(redisKey);
        if (data) {
          result = JSON.parse(data);
        }
      }

      if (!result) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  });

  // Search memory
  router.get('/search/:namespace', async (req, res, next) => {
    try {
      const { namespace } = req.params;
      const { query, limit } = req.query;

      if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
      }

      if (deps.memory) {
        const results = await deps.memory.search(
          namespace,
          query as string,
          Number(limit) || 10
        );
        res.json({ results });
      } else {
        res.json({ results: [], message: 'Search not available without memory service' });
      }
    } catch (error) {
      next(error);
    }
  });

  // List memory in namespace
  router.get('/list/:namespace', async (req, res, next) => {
    try {
      const { namespace } = req.params;
      const { limit } = req.query;

      if (deps.memory) {
        const results = await deps.memory.list(namespace, Number(limit) || 100);
        res.json({ results });
      } else {
        res.json({ results: [] });
      }
    } catch (error) {
      next(error);
    }
  });

  // Delete memory
  router.delete('/:namespace/:key', async (req, res, next) => {
    try {
      const { namespace, key } = req.params;

      let deleted = false;

      if (deps.memory) {
        deleted = await deps.memory.delete(namespace, key);
      } else if (deps.redis) {
        const redisKey = `memory:${namespace}:${key}`;
        deleted = (await deps.redis.del(redisKey)) > 0;
      }

      res.json({ deleted });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
