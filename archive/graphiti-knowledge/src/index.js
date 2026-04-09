import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { KnowledgeGraphEngine } from './core/knowledge-graph-engine.js';
import { TemporalTracker } from './core/temporal-tracker.js';
import { EntityExtractor } from './services/entity-extractor.js';
import { GraphQueryAPI } from './api/graph-query-api.js';
import { VisualizationEndpoint } from './api/visualization-endpoint.js';
import { FalkorDBConnector } from './database/falkordb-connector.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize components
const falkorDB = new FalkorDBConnector({
  host: process.env.FALKOR_HOST || 'localhost',
  port: process.env.FALKOR_PORT || 6379
});

const entityExtractor = new EntityExtractor();
const temporalTracker = new TemporalTracker();
const knowledgeGraph = new KnowledgeGraphEngine(falkorDB, temporalTracker);
const graphQueryAPI = new GraphQueryAPI(knowledgeGraph);
const visualizationEndpoint = new VisualizationEndpoint(knowledgeGraph);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'graphiti-knowledge',
    version: '1.0.0'
  });
});

// Entity extraction endpoint
app.post('/api/extract', async (req, res) => {
  try {
    const { text, options } = req.body;
    const entities = await entityExtractor.extract(text, options);
    res.json({ success: true, entities });
  } catch (error) {
    logger.error('Entity extraction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Knowledge graph construction
app.post('/api/graph/build', async (req, res) => {
  try {
    const { text, entities, timestamp } = req.body;
    const graph = await knowledgeGraph.buildFromText(text, entities, timestamp);
    res.json({ success: true, graph });
  } catch (error) {
    logger.error('Graph building error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mount API routes
app.use('/api/query', graphQueryAPI.router);
app.use('/api/visualize', visualizationEndpoint.router);

// Temporal query endpoints
app.get('/api/temporal/range', async (req, res) => {
  try {
    const { startTime, endTime, entityId } = req.query;
    const results = await temporalTracker.queryTimeRange(startTime, endTime, entityId);
    res.json({ success: true, results });
  } catch (error) {
    logger.error('Temporal query error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/temporal/snapshot', async (req, res) => {
  try {
    const { timestamp, entityId } = req.query;
    const snapshot = await temporalTracker.getSnapshot(timestamp, entityId);
    res.json({ success: true, snapshot });
  } catch (error) {
    logger.error('Snapshot error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
async function start() {
  try {
    await falkorDB.connect();
    logger.info('Connected to FalkorDB');

    app.listen(PORT, () => {
      logger.info(`Graphiti Knowledge Graph service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start service:', error);
    process.exit(1);
  }
}

start();

export { app, knowledgeGraph, entityExtractor, temporalTracker };
