/**
 * Memory Management Routes
 */

import { Router } from 'express';
import { z } from 'zod';
import type { AgentDBClient } from '../services/agentdb.js';
import type Redis from 'ioredis';
import type pg from 'pg';

interface Services {
  agentdb: AgentDBClient | null;
  redis: Redis;
  postgres: pg.Pool;
}

const storeMemorySchema = z.object({
  namespace: z.string(),
  key: z.string(),
  value: z.any(),
  embedding: z.array(z.number()).optional(),
  ttl: z.number().optional(),
});

const searchMemorySchema = z.object({
  query: z.string(),
  namespace: z.string().optional(),
  k: z.number().default(10),
});

export function createMemoryRouter(services: Services): Router {
  const router = Router();

  // Store memory
  router.post('/store', async (req, res, next) => {
    try {
      const input = storeMemorySchema.parse(req.body);
      const key = `memory:${input.namespace}:${input.key}`;

      // Store in Redis
      const ttl = input.ttl || 3600;
      await services.redis.setex(key, ttl, JSON.stringify(input.value));

      // Store in AgentDB if embedding provided
      if (input.embedding && services.agentdb) {
        await services.agentdb.insert({
          key: input.key,
          namespace: input.namespace,
          embedding: input.embedding,
          data: input.value,
        });
      }

      res.status(201).json({
        success: true,
        key: input.key,
        namespace: input.namespace,
      });
    } catch (error) {
      next(error);
    }
  });

  // Search memory
  router.post('/search', async (req, res, next) => {
    try {
      const input = searchMemorySchema.parse(req.body);

      if (!services.agentdb) {
        res.status(503).json({ error: 'AgentDB not available' });
        return;
      }

      // TODO: Generate embedding from query
      const embedding = new Array(1536).fill(0);

      // Search AgentDB
      const results = await services.agentdb.search(embedding, input.k);

      res.json({
        query: input.query,
        results,
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // Retrieve memory
  router.get('/retrieve/:namespace/:key', async (req, res, next) => {
    try {
      const { namespace, key } = req.params;
      const redisKey = `memory:${namespace}:${key}`;

      const data = await services.redis.get(redisKey);

      if (!data) {
        res.status(404).json({ error: 'Memory not found' });
        return;
      }

      res.json({
        namespace,
        key,
        value: JSON.parse(data),
      });
    } catch (error) {
      next(error);
    }
  });

  // AgentDB stats
  router.get('/stats', async (req, res, next) => {
    try {
      if (!services.agentdb) {
        res.status(503).json({ error: 'AgentDB not available' });
        return;
      }

      const stats = await services.agentdb.stats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
