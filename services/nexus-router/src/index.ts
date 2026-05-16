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
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createLogger } from './utils/logger';
import { config } from './config';
import { healthRouter } from './routes/health';
import { completionRouter } from './routes/completion';
import { modelsRouter } from './routes/models';
import { mcpRouter } from './routes/mcp';
import { rateLimitsRouter } from './routes/rate-limits';
import { routingRouter, initializeRoutingRules } from './routes/routing';
import { providersRouter } from './routes/providers';
import { metricsRouter, setupMetricsWebSocket } from './routes/metrics';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import { metricsTracker } from './middleware/metrics-tracker';
import { RedisClient } from './services/redis-client';
import { WorkerManager } from './services/worker-manager';
import { MCPProxyService } from './services/mcp-proxy';
import { ModelDiscoveryService } from './services/model-discovery';
import { RateLimitStore } from './services/rate-limit-store';
import { ProviderManager } from './services/provider-manager';
import { MetricsCollectorService } from './services/metrics-collector';
import { AuditLogger } from './services/audit-logger';

const logger = createLogger('nexus-router');

async function startServer(): Promise<void> {
  const app: Application = express();

  // Initialize services
  logger.info('Initializing Nexus Router...');

  // Connect to Redis (optional - service works without it)
  try {
    await RedisClient.getInstance().connect();
    logger.info('Redis connected - caching enabled');
  } catch (error) {
    logger.warn('Redis unavailable - running without caching:', error);
    logger.info('Service will continue without Redis cache');
  }

  // Initialize worker manager
  const workerManager = WorkerManager.getInstance();
  await workerManager.initialize();
  logger.info('Worker manager initialized');

  // Initialize model discovery
  const modelDiscovery = ModelDiscoveryService.getInstance();
  await modelDiscovery.initialize();
  logger.info('Model discovery initialized');

  // Initialize MCP proxy
  const mcpProxy = MCPProxyService.getInstance();
  await mcpProxy.initialize();
  logger.info('MCP proxy initialized');

  // Initialize rate limit store
  const rateLimitStore = RateLimitStore.getInstance();
  await rateLimitStore.initialize();
  logger.info('Rate limit store initialized');

  // Initialize routing rules from Redis
  await initializeRoutingRules();
  logger.info('Routing rules initialized');
  // Initialize provider manager
  const providerManager = ProviderManager.getInstance();
  await providerManager.initialize();
  logger.info('Provider manager initialized');

  // Initialize metrics collector
  const metricsCollector = MetricsCollectorService.getInstance();
  logger.info('Metrics collector initialized');

  // Initialize audit logger
  const auditLogger = AuditLogger.getInstance();
  if (auditLogger.isEnabled()) {
    logger.info(`Audit logging enabled: ${auditLogger.getLogPath()}`);
  } else {
    logger.info('Audit logging disabled');
  }

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

  // Metrics tracking middleware
  app.use(metricsTracker);

  // Routes
  app.use('/health', healthRouter);
  app.use('/v1/chat/completions', completionRouter);
  app.use('/v1/models', modelsRouter);
  app.use('/mcp', mcpRouter);
  app.use('/api/rate-limits', rateLimitsRouter);
  app.use('/api/routing', routingRouter);
  app.use('/api/providers', providersRouter);
  app.use(metricsRouter); // Metrics API routes

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Nexus Router',
      version: '1.0.0',
      description: 'Intelligent LLM request routing service with MCP proxy aggregator',
      endpoints: {
        health: '/health',
        completions: '/v1/chat/completions',
        models: {
          list: '/v1/models',
          details: '/v1/models/:id',
          discoveryRefresh: '/v1/models/discovery/refresh',
          discoveryStatus: '/v1/models/discovery/status'
        },
        rateLimits: {
          config: '/api/rate-limits',
          global: '/api/rate-limits/global',
          perIp: '/api/rate-limits/per-ip',
          perServer: '/api/rate-limits/per-server',
          perTool: '/api/rate-limits/per-tool',
          stats: '/api/rate-limits/stats'
        },
        mcp: {
          servers: '/mcp/servers',
          tools: '/mcp/tools',
          search: '/mcp/tools/search',
          call: '/mcp/tools/call',
          proxy: '/mcp/proxy/:serverId',
          metrics: '/mcp/metrics'
        },
        providers: {
          list: '/api/providers',
          create: '/api/providers',
          get: '/api/providers/:id',
          update: '/api/providers/:id',
          delete: '/api/providers/:id',
          health: '/api/providers/:id/health',
          test: '/api/providers/:id/test'
        },
        routing: {
          config: '/api/routing/config',
          rules: '/api/routing/rules',
          simulate: '/api/routing/simulate'
        },
        metrics: {
          current: '/api/metrics',
          history: '/api/metrics/history',
          traces: '/api/metrics/traces',
          logs: '/api/metrics/logs',
          histogram: '/api/metrics/histogram',
          export: '/api/metrics/export',
          opentelemetry: '/api/metrics/opentelemetry',
          websocket: 'ws://localhost:8000/ws/metrics'
        }
      },
      routing: {
        strategy: config.routing.strategy,
        preferLocal: config.routing.preferLocal,
        fallbackCloud: config.routing.fallbackCloud
      },
      features: {
        rateLimiting: true,
        multiLevelRateLimits: true,
        fuzzyToolSearch: true,
        mcpAggregator: true,
        caching: true,
        healthChecks: true,
        providerManagement: true,
        modelDiscovery: true,
        capabilityMatrix: true,
        costTracking: true,
        observability: true,
        distributedTracing: true,
        realTimeMetrics: true
      }
    });
  });

  // Error handling
  app.use(errorHandler);

  // Create HTTP server
  const PORT = config.server.port;
  const server = createServer(app);

  // Setup WebSocket server for metrics
  const wss = new WebSocketServer({
    server,
    path: '/ws/metrics',
  });

  wss.on('connection', (ws) => {
    setupMetricsWebSocket(ws);
  });

  // Start server
  server.listen(PORT, () => {
    logger.info(`🚀 Nexus Router running on port ${PORT}`);
    logger.info(`📊 Strategy: ${config.routing.strategy}`);
    logger.info(`💻 Local workers: ${config.workers.local.length}`);
    logger.info(`☁️  Cloud fallback: ${config.routing.fallbackCloud ? 'enabled' : 'disabled'}`);
    logger.info(`📈 Observability: WebSocket metrics at ws://localhost:${PORT}/ws/metrics`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    AuditLogger.getInstance().close();
    wss.close();
    server.close();
    MetricsCollectorService.getInstance().shutdown();
    ModelDiscoveryService.getInstance().shutdown();
    WorkerManager.getInstance().shutdown();
    MCPProxyService.getInstance().shutdown();
    RateLimitStore.getInstance().destroy();
    await RedisClient.getInstance().disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    AuditLogger.getInstance().close();
    wss.close();
    server.close();
    MetricsCollectorService.getInstance().shutdown();
    ModelDiscoveryService.getInstance().shutdown();
    WorkerManager.getInstance().shutdown();
    MCPProxyService.getInstance().shutdown();
    RateLimitStore.getInstance().destroy();
    await RedisClient.getInstance().disconnect();
    process.exit(0);
  });
}

// Start the server
startServer().catch((error) => {
  logger.error('Failed to start Nexus Router:', error);
  process.exit(1);
});
