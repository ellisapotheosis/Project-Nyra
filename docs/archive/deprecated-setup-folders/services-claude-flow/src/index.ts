/**
 * Claude Flow Brain - Main Entry Point
 *
 * Multi-agent orchestration MCP server for Project Nyra
 */

import express from 'express';
import { createServer } from 'http';
import pino from 'pino';
import { config } from './config/index.js';
import { initializeRedis } from './services/redis.js';
import { initializeRuvector } from './services/ruvector.js';
import { initializeMemory } from './services/memory.js';
import { createHealthRouter } from './routes/health.js';
import { createMemoryRouter } from './routes/memory.js';
import { createAgentRouter } from './routes/agents.js';
import { errorHandler } from './middleware/error-handler.js';

// Initialize logger
const logger = pino({
  level: config.logLevel,
  transport: config.nodeEnv === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
});

async function bootstrap() {
  try {
    logger.info('Starting Claude Flow Brain...');

    // Initialize services
    logger.info('Initializing services...');
    const [redis, ruvector, memory] = await Promise.all([
      initializeRedis(config, logger),
      initializeRuvector(config, logger),
      initializeMemory(config, logger),
    ]);

    logger.info('Services initialized successfully');

    // Create Express app
    const app = express();

    // Middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // CORS for dashboard
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });

    // Routes
    app.use('/health', createHealthRouter({ redis, ruvector, memory, logger }));
    app.use('/memory', createMemoryRouter({ redis, ruvector, memory, logger }));
    app.use('/agents', createAgentRouter({ redis, memory, logger }));

    // Error handling
    app.use(errorHandler);

    // Create HTTP server
    const server = createServer(app);

    // Start server
    server.listen(config.port, config.host, () => {
      logger.info(`Claude Flow Brain listening on ${config.host}:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`Redis: ${redis ? 'Connected' : 'Disconnected'}`);
      logger.info(`RuVector: ${ruvector ? 'Connected' : 'Disconnected'}`);
      logger.info(`Memory: ${memory ? 'Initialized' : 'Disabled'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close connections
      await Promise.all([
        redis?.quit(),
        ruvector?.end(),
      ]);

      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error({ error }, 'Failed to start Claude Flow Brain');
    process.exit(1);
  }
}

// Start application
bootstrap();
