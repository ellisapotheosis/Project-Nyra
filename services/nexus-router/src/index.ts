/**
 * Nexus Router - Intelligent LLM Request Routing Service
 *
 * Routes LLM requests intelligently:
 * - Local GPU workers (priority) for cost savings
 * - Cloud APIs (fallback) for guaranteed availability
 *
 * Routing Strategy:
 * 1. Check local GPU worker availability
 * 2. Route based on model requirements (VRAM, capabilities)
 * 3. Fallback to cloud if local workers unavailable/overloaded
 * 4. Load balance across available workers
 * 5. Cache responses for identical requests
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createLogger } from './utils/logger';
import { config } from './config';
import { healthRouter } from './routes/health';
import { completionRouter } from './routes/completion';
import { modelsRouter } from './routes/models';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { RedisClient } from './services/redis-client';
import { WorkerManager } from './services/worker-manager';

const logger = createLogger('nexus-router');

async function startServer(): Promise<void> {
  const app: Application = express();

  // Initialize services
  logger.info('Initializing Nexus Router...');

  // Connect to Redis
  await RedisClient.getInstance().connect();
  logger.info('Redis connected');

  // Initialize worker manager
  const workerManager = WorkerManager.getInstance();
  await workerManager.initialize();
  logger.info('Worker manager initialized');

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.server.corsOrigins,
    credentials: true
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.server.rateLimitWindow,
    max: config.server.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use('/v1', limiter);

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use(requestLogger);

  // Routes
  app.use('/health', healthRouter);
  app.use('/v1/chat/completions', completionRouter);
  app.use('/v1/models', modelsRouter);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      name: 'Nexus Router',
      version: '1.0.0',
      description: 'Intelligent LLM request routing service',
      endpoints: {
        health: '/health',
        completions: '/v1/chat/completions',
        models: '/v1/models'
      },
      routing: {
        strategy: config.routing.strategy,
        preferLocal: config.routing.preferLocal,
        fallbackCloud: config.routing.fallbackCloud
      }
    });
  });

  // Error handling
  app.use(errorHandler);

  // Start server
  const PORT = config.server.port;
  app.listen(PORT, () => {
    logger.info(`🚀 Nexus Router running on port ${PORT}`);
    logger.info(`📊 Strategy: ${config.routing.strategy}`);
    logger.info(`💻 Local workers: ${config.workers.local.length}`);
    logger.info(`☁️  Cloud fallback: ${config.routing.fallbackCloud ? 'enabled' : 'disabled'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await RedisClient.getInstance().disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await RedisClient.getInstance().disconnect();
    process.exit(0);
  });
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start Nexus Router:', error);
  process.exit(1);
});
