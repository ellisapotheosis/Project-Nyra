/**
 * Xenova/Transformers Embedding Service
 * WASM SIMD-accelerated embeddings for AgentDB integration
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pino = require('pino');
const { pipeline, env } = require('@xenova/transformers');

// Configuration
const PORT = process.env.PORT || 8002;
const MODEL_NAME = process.env.MODEL_NAME || 'Xenova/all-MiniLM-L6-v2';
const CACHE_DIR = process.env.CACHE_DIR || '/app/models';
const MAX_BATCH_SIZE = parseInt(process.env.MAX_BATCH_SIZE || '32');

// Configure transformers cache
env.cacheDir = CACHE_DIR;
env.allowLocalModels = true;

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    }
  }
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Global state
let embeddingPipeline = null;
const availableModels = {
  'all-MiniLM-L6-v2': {
    name: 'Xenova/all-MiniLM-L6-v2',
    dimensions: 384,
    speed: 'fast',
    description: 'Fast, efficient embeddings for semantic search'
  },
  'multilingual-e5-small': {
    name: 'Xenova/multilingual-e5-small',
    dimensions: 384,
    speed: 'medium',
    description: 'Multilingual embeddings (100+ languages)'
  },
  'bge-small-en-v1.5': {
    name: 'Xenova/bge-small-en-v1.5',
    dimensions: 384,
    speed: 'medium',
    description: 'High-quality embeddings for English text'
  }
};

/**
 * Initialize embedding pipeline
 */
async function initializePipeline() {
  try {
    logger.info({ model: MODEL_NAME }, 'Loading embedding model...');
    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
      quantized: true,  // Use quantized model for faster inference
    });
    logger.info({ model: MODEL_NAME }, 'Model loaded successfully');
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to load model');
    throw error;
  }
}

/**
 * Generate embeddings for text
 */
async function generateEmbeddings(texts, normalize = true) {
  if (!embeddingPipeline) {
    throw new Error('Embedding pipeline not initialized');
  }

  const startTime = Date.now();

  // Batch processing
  const batches = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    batches.push(texts.slice(i, i + MAX_BATCH_SIZE));
  }

  const allEmbeddings = [];

  for (const batch of batches) {
    const output = await embeddingPipeline(batch, {
      pooling: 'mean',
      normalize: normalize
    });

    // Convert tensor to array
    const embeddings = batch.map((_, idx) => {
      return Array.from(output[idx].data);
    });

    allEmbeddings.push(...embeddings);
  }

  const latency = Date.now() - startTime;

  return {
    embeddings: allEmbeddings,
    dimensions: allEmbeddings[0].length,
    count: allEmbeddings.length,
    latency_ms: latency
  };
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    model: MODEL_NAME,
    pipeline_ready: embeddingPipeline !== null,
    cache_dir: CACHE_DIR,
    wasm_simd: true
  });
});

/**
 * Generate embeddings endpoint
 */
app.post('/embed', async (req, res) => {
  try {
    const { texts, normalize = true } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({
        error: 'Invalid request. Expected { texts: string[], normalize?: boolean }'
      });
    }

    if (texts.length === 0) {
      return res.status(400).json({ error: 'Empty text array' });
    }

    logger.info({ count: texts.length }, 'Generating embeddings');

    const result = await generateEmbeddings(texts, normalize);

    res.json(result);
  } catch (error) {
    logger.error({ error: error.message }, 'Embedding generation failed');
    res.status(500).json({ error: error.message });
  }
});

/**
 * Batch embed endpoint (alias)
 */
app.post('/embed/batch', async (req, res) => {
  return app._router.handle(req, res);
});

/**
 * List available models
 */
app.get('/models', (req, res) => {
  res.json({
    available_models: availableModels,
    current_model: MODEL_NAME
  });
});

/**
 * Model info endpoint
 */
app.get('/model/info', (req, res) => {
  const modelKey = Object.keys(availableModels).find(
    key => availableModels[key].name === MODEL_NAME
  );

  const modelInfo = modelKey ? availableModels[modelKey] : null;

  res.json({
    model_name: MODEL_NAME,
    pipeline_ready: embeddingPipeline !== null,
    ...modelInfo
  });
});

/**
 * Start server
 */
async function startServer() {
  try {
    // Initialize embedding pipeline
    await initializePipeline();

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info({ port: PORT }, 'Xenova embedding service started');
      logger.info({ model: MODEL_NAME }, 'Ready to generate embeddings');
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
