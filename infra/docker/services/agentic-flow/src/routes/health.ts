/**
 * Health Check Routes
 */

import { Router } from 'express';
import type { AgentDBClient } from '../services/agentdb.js';
import type Redis from 'ioredis';
import type pg from 'pg';

interface Services {
  agentdb: AgentDBClient | null;
  redis: Redis;
  postgres: pg.Pool;
}

export function createHealthRouter(services: Services): Router {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const checks = await Promise.allSettled([
        checkAgentDB(services.agentdb),
        checkRedis(services.redis),
        checkPostgres(services.postgres),
      ]);

      const [agentdb, redis, postgres] = checks;

      const healthy = checks.every(check => check.status === 'fulfilled');

      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'unhealthy',
        version: '2.0.0-alpha',
        services: {
          agentdb: agentdb.status === 'fulfilled' ? 'connected' : 'disconnected',
          redis: redis.status === 'fulfilled' ? 'connected' : 'disconnected',
          postgres: postgres.status === 'fulfilled' ? 'connected' : 'disconnected',
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  router.get('/ready', async (req, res) => {
    // Readiness check - all services must be ready
    try {
      await Promise.all([
        checkRedis(services.redis),
        checkPostgres(services.postgres),
      ]);
      res.status(200).json({ ready: true });
    } catch {
      res.status(503).json({ ready: false });
    }
  });

  router.get('/live', (req, res) => {
    // Liveness check - process is alive
    res.status(200).json({ live: true });
  });

  return router;
}

async function checkAgentDB(client: AgentDBClient | null): Promise<void> {
  if (!client) return;
  await client.stats();
}

async function checkRedis(client: Redis): Promise<void> {
  await client.ping();
}

async function checkPostgres(pool: pg.Pool): Promise<void> {
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
}
