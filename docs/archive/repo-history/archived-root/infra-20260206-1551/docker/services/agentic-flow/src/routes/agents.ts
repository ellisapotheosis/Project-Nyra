/**
 * Agent Management Routes
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

const spawnAgentSchema = z.object({
  type: z.string(),
  config: z.object({
    model: z.string().optional(),
    maxTokens: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
});

export function createAgentRouter(services: Services): Router {
  const router = Router();

  // Spawn agent
  router.post('/spawn', async (req, res, next) => {
    try {
      const input = spawnAgentSchema.parse(req.body);

      // TODO: Implement actual agent spawning
      const agentId = `agent-${Date.now()}`;

      // Store in Redis
      await services.redis.setex(
        `agent:${agentId}`,
        3600,
        JSON.stringify({
          id: agentId,
          type: input.type,
          config: input.config,
          status: 'running',
          createdAt: new Date().toISOString(),
        })
      );

      res.status(201).json({
        agentId,
        type: input.type,
        status: 'spawned',
      });
    } catch (error) {
      next(error);
    }
  });

  // Get agent status
  router.get('/:agentId/status', async (req, res, next) => {
    try {
      const { agentId } = req.params;
      const data = await services.redis.get(`agent:${agentId}`);

      if (!data) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }

      res.json(JSON.parse(data));
    } catch (error) {
      next(error);
    }
  });

  // Terminate agent
  router.post('/:agentId/terminate', async (req, res, next) => {
    try {
      const { agentId } = req.params;
      await services.redis.del(`agent:${agentId}`);

      res.json({
        agentId,
        status: 'terminated',
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
