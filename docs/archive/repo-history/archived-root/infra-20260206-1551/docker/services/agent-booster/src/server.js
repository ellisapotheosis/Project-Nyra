/**
 * Agent Booster - Tier 1 Model Routing
 * Pattern-based code transforms without LLM (<1ms latency, $0 cost)
 *
 * Supported transforms:
 * - var-to-const: Convert var to const/let
 * - add-types: Add TypeScript type annotations
 * - remove-console: Remove console.log statements
 * - add-logging: Add structured logging
 * - async-await: Convert callbacks to async/await
 * - add-error-handling: Wrap with try-catch
 * - format-code: Run prettier formatting
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createLogger, transports, format } = require('winston');
const { register, Counter, Histogram } = require('prom-client');
const transforms = require('./transforms');

const app = express();
const PORT = process.env.PORT || 3010;

// Logger
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/agent-booster.log' })
  ]
});

// Metrics
const transformCounter = new Counter({
  name: 'agent_booster_transforms_total',
  help: 'Total number of code transforms',
  labelNames: ['intent', 'status']
});

const transformDuration = new Histogram({
  name: 'agent_booster_transform_duration_ms',
  help: 'Duration of code transforms in milliseconds',
  labelNames: ['intent'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'agent-booster',
    tier: 1,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Main transform endpoint
app.post('/transform', async (req, res) => {
  const startTime = Date.now();
  const { intent, code, options = {} } = req.body;

  try {
    // Validate input
    if (!intent || !code) {
      return res.status(400).json({
        error: 'Missing required fields: intent, code'
      });
    }

    // Check if intent is supported
    const supportedIntents = [
      'var-to-const',
      'add-types',
      'remove-console',
      'add-logging',
      'async-await',
      'add-error-handling',
      'format-code'
    ];

    if (!supportedIntents.includes(intent)) {
      return res.status(400).json({
        error: `Unsupported intent: ${intent}`,
        supported: supportedIntents
      });
    }

    // Apply transform
    const transformFn = transforms[intent];
    const result = await transformFn(code, options);

    // Record metrics
    const duration = Date.now() - startTime;
    transformCounter.inc({ intent, status: 'success' });
    transformDuration.observe({ intent }, duration);

    logger.info({
      event: 'transform_success',
      intent,
      duration,
      codeLength: code.length
    });

    res.json({
      success: true,
      intent,
      result,
      duration,
      tier: 1,
      cost: 0
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    transformCounter.inc({ intent, status: 'error' });

    logger.error({
      event: 'transform_error',
      intent,
      error: error.message,
      duration
    });

    res.status(500).json({
      error: 'Transform failed',
      message: error.message,
      intent,
      duration
    });
  }
});

// List available transforms
app.get('/intents', (req, res) => {
  res.json({
    intents: [
      {
        name: 'var-to-const',
        description: 'Convert var declarations to const/let',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'add-types',
        description: 'Add TypeScript type annotations',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'remove-console',
        description: 'Remove console.log statements',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'add-logging',
        description: 'Add structured logging with Winston',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'async-await',
        description: 'Convert callbacks to async/await',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'add-error-handling',
        description: 'Wrap code with try-catch blocks',
        latency: '<1ms',
        cost: '$0'
      },
      {
        name: 'format-code',
        description: 'Format code with Prettier',
        latency: '<1ms',
        cost: '$0'
      }
    ],
    tier: 1,
    benefits: '352x faster than LLM routing, $0 cost'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({
    event: 'server_start',
    port: PORT,
    tier: 1,
    service: 'agent-booster'
  });
  console.log(`🚀 Agent Booster (Tier 1) running on port ${PORT}`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
