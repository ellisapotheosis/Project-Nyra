import { Registry, Counter, Gauge, Histogram } from 'prom-client';
import express from 'express';
import { config } from '../config';
import { createLogger } from '../utils/logger';

const logger = createLogger('metrics');

export class MetricsCollector {
  private readonly registry: Registry;
  private readonly app: express.Application;

  // Metrics
  public readonly connections: Gauge;
  public readonly messages: Counter;
  public readonly errors: Counter;
  public readonly messageDuration: Histogram;
  public readonly subscriptions: Gauge;

  constructor() {
    this.registry = new Registry();
    this.app = express();

    // Initialize metrics
    this.connections = new Gauge({
      name: 'websocket_connections_total',
      help: 'Total number of active WebSocket connections',
      registers: [this.registry],
    });

    this.messages = new Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['direction', 'type'],
      registers: [this.registry],
    });

    this.errors = new Counter({
      name: 'websocket_errors_total',
      help: 'Total number of WebSocket errors',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.messageDuration = new Histogram({
      name: 'websocket_message_duration_seconds',
      help: 'Duration of message processing',
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      registers: [this.registry],
    });

    this.subscriptions = new Gauge({
      name: 'websocket_subscriptions_total',
      help: 'Total number of active subscriptions',
      labelNames: ['channel'],
      registers: [this.registry],
    });

    this.setupEndpoints();
  }

  private setupEndpoints() {
    this.app.get('/metrics', async (req, res) => {
      res.set('Content-Type', this.registry.contentType);
      res.send(await this.registry.metrics());
    });

    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    });
  }

  start() {
    this.app.listen(config.metricsPort, () => {
      logger.info({ port: config.metricsPort }, 'Metrics server started');
    });
  }
}
