const express = require('express');
const { pipeline } = require('@xenova/transformers');
const promClient = require('prom-client');
const redis = require('redis');
require('dotenv').config();

const app = express();
const PORT = process.env.EMBEDDING_PORT || 8080;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const embeddingRequestCounter = new promClient.Counter({
  name: 'embedding_requests_total',
  help: 'Total embedding requests',
  labelNames: ['status'],
  registers: [register]
});

const embeddingLatencyHistogram = new promClient.Histogram({
  name: 'embedding_latency_seconds',
  help: 'Embedding generation latency',
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const embeddingBatchSizeHistogram = new promClient.Histogram({
  name: 'embedding_batch_size',
  help: 'Batch size distribution',
  buckets: [1, 8, 16, 32, 64, 128],
  registers: [register]
});

// Redis client for caching
let redisClient;
if (process.env.REDIS_ENABLED !== 'false') {
  redisClient = redis.createClient({
    url: process.env.REDIS_INTERNAL_URL || 'redis://redis:6379'
  });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  redisClient.connect().catch(console.error);
}

// Middleware
app.use(express.json({ limit: '10mb' }));

// Embedding pipeline (lazy-loaded)
let embeddingPipeline = null;
const MODEL_NAME = process.env.EMBEDDING_MODEL || 'Xenova/all-MiniLM-L6-v2';
const BATCH_SIZE = parseInt(process.env.EMBEDDING_BATCH_SIZE || '32');
const MAX_SEQ_LENGTH = parseInt(process.env.EMBEDDING_MAX_SEQUENCE_LENGTH || '512');

// Initialize pipeline
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log(`Loading embedding model: ${MODEL_NAME}...`);
    embeddingPipeline = await pipeline('feature-extraction', MODEL_NAME, {
      device: process.env.EMBEDDING_DEVICE || 'cuda',
      cache_dir: process.env.EMBEDDING_CACHE_DIR || '/cache'
    });
    console.log('Embedding model loaded successfully');
  }
  return embeddingPipeline;
}

// Cache key generation
function getCacheKey(text, model) {
  const crypto = require('crypto');
  return `embed:${model}:${crypto.createHash('md5').update(text).digest('hex')}`;
}

// Generate embeddings
async function generateEmbeddings(texts, options = {}) {
  const startTime = Date.now();
  const model = options.model || MODEL_NAME;
  const normalize = options.normalize !== false;

  try {
    const pipeline = await getEmbeddingPipeline();

    // Check cache for each text
    const results = [];
    const uncachedTexts = [];
    const uncachedIndices = [];

    if (redisClient && redisClient.isOpen) {
      for (let i = 0; i < texts.length; i++) {
        const cacheKey = getCacheKey(texts[i], model);
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          results[i] = JSON.parse(cached);
        } else {
          uncachedTexts.push(texts[i]);
          uncachedIndices.push(i);
        }
      }
    } else {
      uncachedTexts.push(...texts);
      uncachedIndices.push(...Array.from({ length: texts.length }, (_, i) => i));
    }

    // Generate embeddings for uncached texts
    if (uncachedTexts.length > 0) {
      const embeddings = await pipeline(uncachedTexts, {
        pooling: 'mean',
        normalize: normalize
      });

      // Convert to array and cache
      for (let i = 0; i < uncachedTexts.length; i++) {
        const embedding = Array.from(embeddings.data.slice(
          i * embeddings.dims[1],
          (i + 1) * embeddings.dims[1]
        ));

        results[uncachedIndices[i]] = embedding;

        // Cache for 1 hour
        if (redisClient && redisClient.isOpen) {
          const cacheKey = getCacheKey(uncachedTexts[i], model);
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(embedding));
        }
      }
    }

    const duration = (Date.now() - startTime) / 1000;
    embeddingLatencyHistogram.observe(duration);
    embeddingBatchSizeHistogram.observe(texts.length);
    embeddingRequestCounter.inc({ status: 'success' });

    return {
      embeddings: results,
      model: model,
      dimension: results[0]?.length || 0,
      count: texts.length,
      duration: duration,
      cached: texts.length - uncachedTexts.length
    };
  } catch (error) {
    embeddingRequestCounter.inc({ status: 'error' });
    throw error;
  }
}

// ============================================================================
// API Endpoints
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    model: MODEL_NAME,
    pipeline_loaded: embeddingPipeline !== null,
    redis_connected: redisClient?.isOpen || false,
    uptime: process.uptime()
  });
});

// Generate embeddings (single or batch)
app.post('/embed', async (req, res) => {
  try {
    const { texts, model, normalize, batch_size } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts array is required' });
    }

    const batchSize = batch_size || BATCH_SIZE;
    const results = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const result = await generateEmbeddings(batch, { model, normalize });
      results.push(...result.embeddings);
    }

    res.json({
      embeddings: results,
      model: model || MODEL_NAME,
      dimension: results[0]?.length || 0,
      count: results.length
    });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Batch processing endpoint
app.post('/embed/batch', async (req, res) => {
  try {
    const { texts, model, normalize } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ error: 'texts array is required' });
    }

    const result = await generateEmbeddings(texts, { model, normalize });

    res.json(result);
  } catch (error) {
    console.error('Batch embedding error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Similarity search
app.post('/similarity', async (req, res) => {
  try {
    const { query, candidates, top_k = 5 } = req.body;

    if (!query || !candidates || !Array.isArray(candidates)) {
      return res.status(400).json({ error: 'query and candidates array required' });
    }

    // Generate embeddings
    const allTexts = [query, ...candidates];
    const result = await generateEmbeddings(allTexts);
    const embeddings = result.embeddings;

    const queryEmbedding = embeddings[0];
    const candidateEmbeddings = embeddings.slice(1);

    // Calculate cosine similarity
    const similarities = candidateEmbeddings.map((candidate, idx) => {
      const dotProduct = queryEmbedding.reduce((sum, val, i) => sum + val * candidate[i], 0);
      const magnitudeA = Math.sqrt(queryEmbedding.reduce((sum, val) => sum + val * val, 0));
      const magnitudeB = Math.sqrt(candidate.reduce((sum, val) => sum + val * val, 0));
      const similarity = dotProduct / (magnitudeA * magnitudeB);

      return {
        index: idx,
        text: candidates[idx],
        similarity: similarity
      };
    });

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    res.json({
      query: query,
      results: similarities.slice(0, top_k),
      total: candidates.length
    });
  } catch (error) {
    console.error('Similarity error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Model info
app.get('/model', (req, res) => {
  res.json({
    model: MODEL_NAME,
    loaded: embeddingPipeline !== null,
    batch_size: BATCH_SIZE,
    max_sequence_length: MAX_SEQ_LENGTH,
    device: process.env.EMBEDDING_DEVICE || 'cuda'
  });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker-3060 Embedding Service running on port ${PORT}`);
  console.log(`Model: ${MODEL_NAME}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Max sequence length: ${MAX_SEQ_LENGTH}`);
  console.log(`Device: ${process.env.EMBEDDING_DEVICE || 'cuda'}`);

  // Preload model in background
  getEmbeddingPipeline().catch(console.error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
  }
  process.exit(0);
});
