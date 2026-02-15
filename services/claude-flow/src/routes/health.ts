/**
 * Health Routes - Health check endpoints
 */

import { Router } from 'express';
import type { Logger } from 'pino';
import type { RedisClient } from '../services/redis.js';
import type { RuvectorClient } from '../services/ruvector.js';
import type { MemoryClient } from '../services/memory.js';

interface HealthDependencies {
  redis: RedisClient | null;
  ruvector: RuvectorClient | null;
  memory: MemoryClient | null;
  logger: Logger;
}

export function createHealthRouter(deps: HealthDependencies): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        redis: deps.redis ? 'connected' : 'disconnected',
        ruvector: deps.ruvector ? 'connected' : 'disconnected',
        memory: deps.memory ? 'initialized' : 'disabled',
      },
    };

    // Deep health checks
    try {
      if (deps.redis) {
        await deps.redis.ping();
      }
    } catch (error) {
      checks.services.redis = 'error';
      checks.status = 'degraded';
    }

    try {
      if (deps.ruvector) {
        await deps.ruvector.query('SELECT 1');
      }
    } catch (error) {
      checks.services.ruvector = 'error';
      checks.status = 'degraded';
    }

    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  });

  router.get('/ready', async (req, res) => {
    // Readiness check - service is ready to accept traffic
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/live', (req, res) => {
    // Liveness check - service is alive
    res.json({
      alive: true,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
