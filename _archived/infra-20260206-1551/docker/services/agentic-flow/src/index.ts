/**
 * Agentic-Flow Alpha - Main Entry Point
 *
 * Core orchestration primitives for Project Nyra
 * Extended by claude-flow for specialized workflows
 */

import express from 'express';
import { createServer } from 'http';
import pino from 'pino';
import { config } from './config/index.js';
import { initializeAgentDB } from './services/agentdb.js';
import { initializeRedis } from './services/redis.js';
import { initializePostgres } from './services/postgres.js';
import { createHealthRouter } from './routes/health.js';
import { createAgentRouter } from './routes/agents.js';
import { createMemoryRouter } from './routes/memory.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';

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
    logger.info('Starting Agentic-Flow Alpha...');

    // Initialize services
    logger.info('Initializing services...');
    const [agentdb, redis, postgres] = await Promise.all([
      initializeAgentDB(logger),
      initializeRedis(logger),
      initializePostgres(logger),
    ]);

    logger.info('Services initialized successfully');

    // Create Express app
    const app = express();

    // Middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Authentication (if enabled)
    if (config.enableAuth) {
      app.use(authMiddleware);
    }

    // Routes
    app.use('/health', createHealthRouter({ agentdb, redis, postgres }));
    app.use('/agents', createAgentRouter({ agentdb, redis, postgres }));
    app.use('/memory', createMemoryRouter({ agentdb, redis, postgres }));

    // Error handling
    app.use(errorHandler);

    // Create HTTP server
    const server = createServer(app);

    // Start server
    server.listen(config.port, () => {
      logger.info(`Agentic-Flow Alpha listening on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(`AgentDB: ${agentdb ? 'Connected' : 'Disconnected'}`);
      logger.info(`Redis: ${redis ? 'Connected' : 'Disconnected'}`);
      logger.info(`PostgreSQL: ${postgres ? 'Connected' : 'Disconnected'}`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      await Promise.all([
        redis?.quit(),
        postgres?.end(),
      ]);

      logger.info('Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error({ error }, 'Failed to start Agentic-Flow');
    process.exit(1);
  }
}

// Start application
bootstrap();
