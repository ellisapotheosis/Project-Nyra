/**
 * Agent Routes - Agent management endpoints
 */

import { Router } from 'express';
import type { Logger } from 'pino';
import type { RedisClient } from '../services/redis.js';
import type { MemoryClient } from '../services/memory.js';

interface AgentDependencies {
  redis: RedisClient | null;
  memory: MemoryClient | null;
  logger: Logger;
}

interface Agent {
  id: string;
  type: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export function createAgentRouter(deps: AgentDependencies): Router {
  const router = Router();

  // List agents
  router.get('/', async (req, res, next) => {
    try {
      const agents: Agent[] = [];

      if (deps.redis) {
        const keys = await deps.redis.keys('agent:*');
        for (const key of keys) {
          const data = await deps.redis.get(key);
          if (data) {
            agents.push(JSON.parse(data));
          }
        }
      }

      res.json({ agents });
    } catch (error) {
      next(error);
    }
  });

  // Get agent by ID
  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;

      if (deps.redis) {
        const data = await deps.redis.get(`agent:${id}`);
        if (data) {
          return res.json(JSON.parse(data));
        }
      }

      res.status(404).json({ error: 'Agent not found' });
    } catch (error) {
      next(error);
    }
  });

  // Spawn agent
  router.post('/spawn', async (req, res, next) => {
    try {
      const { type, config = {} } = req.body;

      if (!type) {
        return res.status(400).json({ error: 'Missing required field: type' });
      }

      const id = `agent-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const agent: Agent = {
        id,
        type,
        status: 'idle',
        config,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (deps.redis) {
        await deps.redis.set(`agent:${id}`, JSON.stringify(agent), 'EX', 3600);
      }

      // Store in memory for coordination
      if (deps.memory) {
        await deps.memory.store('agents', id, agent);
      }

      deps.logger.info({ agentId: id, type }, 'Agent spawned');

      res.status(201).json(agent);
    } catch (error) {
      next(error);
    }
  });

  // Update agent status
  router.patch('/:id/status', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['idle', 'running', 'completed', 'error'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      if (deps.redis) {
        const data = await deps.redis.get(`agent:${id}`);
        if (!data) {
          return res.status(404).json({ error: 'Agent not found' });
        }

        const agent: Agent = JSON.parse(data);
        agent.status = status;
        agent.updatedAt = new Date().toISOString();

        await deps.redis.set(`agent:${id}`, JSON.stringify(agent), 'EX', 3600);

        deps.logger.info({ agentId: id, status }, 'Agent status updated');
        return res.json(agent);
      }

      res.status(503).json({ error: 'Redis unavailable' });
    } catch (error) {
      next(error);
    }
  });

  // Delete agent
  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;

      let deleted = false;

      if (deps.redis) {
        deleted = (await deps.redis.del(`agent:${id}`)) > 0;
      }

      if (deps.memory) {
        await deps.memory.delete('agents', id);
      }

      if (deleted) {
        deps.logger.info({ agentId: id }, 'Agent deleted');
      }

      res.json({ deleted });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
