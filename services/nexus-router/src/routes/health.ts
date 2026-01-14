import { Router, Request, Response } from 'express';
import { RedisClient } from '../services/redis-client';
import { WorkerManager } from '../services/worker-manager';
import { createLogger } from '../utils/logger';

const logger = createLogger('health-route');
const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const redis = RedisClient.getInstance();
    const workerManager = WorkerManager.getInstance();

    const redisHealthy = redis.isConnected();
    const workerHealth = workerManager.getWorkerHealthStatus();
    const metrics = await workerManager.getMetrics();

    const healthyWorkers = workerHealth.filter((w) => w.healthy).length;
    const totalWorkers = workerHealth.length;

    const status = {
      service: 'nexus-router',
      status: redisHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      components: {
        redis: {
          status: redisHealthy ? 'healthy' : 'unhealthy',
          connected: redisHealthy,
        },
        workers: {
          status: healthyWorkers > 0 ? 'healthy' : 'unhealthy',
          healthy: healthyWorkers,
          total: totalWorkers,
          details: workerHealth.map((w) => ({
            id: w.workerId,
            healthy: w.healthy,
            responseTime: w.responseTime,
            lastCheck: w.lastCheck,
            error: w.error,
          })),
        },
      },
      metrics: {
        totalRequests: metrics.totalRequests,
        localRequests: metrics.localRequests,
        cloudRequests: metrics.cloudRequests,
        localPercentage:
          metrics.totalRequests > 0
            ? ((metrics.localRequests / metrics.totalRequests) * 100).toFixed(2)
            : '0.00',
      },
    };

    const statusCode = status.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(status);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      service: 'nexus-router',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const redis = RedisClient.getInstance();
    const isReady = redis.isConnected();

    if (isReady) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        reason: 'Redis not connected',
      });
    }
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };
