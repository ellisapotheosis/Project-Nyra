/**
 * Metrics API Routes
 *
 * REST endpoints for observability metrics:
 * - GET /api/metrics - Current metrics snapshot
 * - GET /api/metrics/history - Historical metrics data
 * - GET /api/metrics/traces - Distributed traces
 * - GET /api/metrics/logs - Log entries
 * - GET /api/metrics/histogram - Latency histogram
 * - GET /api/metrics/export - Export metrics in various formats
 * - GET /api/metrics/opentelemetry - OpenTelemetry format export
 *
 * WebSocket endpoint for real-time updates:
 * - WS /ws/metrics - Real-time metrics stream
 */

import { Router, Request, Response } from 'express';
import { MetricsCollectorService } from '../services/metrics-collector';
import { createLogger } from '../utils/logger';
import { TimeRange, ExportFormat } from '../types/metrics';

const router = Router();
const logger = createLogger('metrics-routes');
const metricsCollector = MetricsCollectorService.getInstance();

// ============================================================================
// REST API ENDPOINTS
// ============================================================================

/**
 * GET /api/metrics
 * Get current system metrics snapshot
 */
router.get('/api/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = metricsCollector.getSystemMetrics();
    res.json(metrics);
  } catch (error) {
    logger.error('Error fetching metrics:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/history
 * Get historical metrics data
 * Query params:
 *   - period: '1h' | '6h' | '24h' | '7d' | '30d' (default: '24h')
 */
router.get('/api/metrics/history', (req: Request, res: Response) => {
  try {
    const period = (req.query.period as TimeRange) || '24h';

    // Validate period
    const validPeriods: TimeRange[] = ['1h', '6h', '24h', '7d', '30d'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        error: 'Invalid period',
        message: `Period must be one of: ${validPeriods.join(', ')}`,
      });
    }

    const history = metricsCollector.getMetricsHistory(period);

    res.json({
      period,
      dataPoints: history,
      count: history.length,
    });
  } catch (error) {
    logger.error('Error fetching metrics history:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/traces
 * Get distributed traces
 * Query params:
 *   - limit: number (default: 100, max: 1000)
 *   - offset: number (default: 0)
 */
router.get('/api/metrics/traces', (req: Request, res: Response) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit as string) || 100,
      1000
    );
    const offset = parseInt(req.query.offset as string) || 0;

    const traces = metricsCollector.getTraces(limit, offset);

    res.json({
      traces,
      total: traces.length,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error fetching traces:', error);
    res.status(500).json({
      error: 'Failed to fetch traces',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/logs
 * Get log entries
 * Query params:
 *   - level: 'debug' | 'info' | 'warn' | 'error' | 'fatal'
 *   - limit: number (default: 100, max: 1000)
 *   - offset: number (default: 0)
 */
router.get('/api/metrics/logs', (req: Request, res: Response) => {
  try {
    const level = req.query.level as string | undefined;
    const limit = Math.min(
      parseInt(req.query.limit as string) || 100,
      1000
    );
    const offset = parseInt(req.query.offset as string) || 0;

    // Validate level if provided
    if (level) {
      const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
      if (!validLevels.includes(level)) {
        return res.status(400).json({
          error: 'Invalid log level',
          message: `Level must be one of: ${validLevels.join(', ')}`,
        });
      }
    }

    const logs = metricsCollector.getLogs(level, limit, offset);

    res.json({
      logs,
      total: logs.length,
      level: level || 'all',
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error fetching logs:', error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/histogram
 * Get latency histogram
 */
router.get('/api/metrics/histogram', (_req: Request, res: Response) => {
  try {
    const histogram = metricsCollector.getLatencyHistogram();
    res.json(histogram);
  } catch (error) {
    logger.error('Error fetching latency histogram:', error);
    res.status(500).json({
      error: 'Failed to fetch latency histogram',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/export
 * Export metrics in various formats
 * Query params:
 *   - format: 'json' | 'csv' | 'opentelemetry' (default: 'json')
 *   - period: '1h' | '6h' | '24h' | '7d' | '30d' (default: '24h')
 */
router.get('/api/metrics/export', (req: Request, res: Response) => {
  try {
    const format = (req.query.format as ExportFormat) || 'json';
    const period = (req.query.period as TimeRange) || '24h';

    // Validate format
    const validFormats: ExportFormat[] = ['json', 'csv', 'opentelemetry'];
    if (!validFormats.includes(format)) {
      return res.status(400).json({
        error: 'Invalid format',
        message: `Format must be one of: ${validFormats.join(', ')}`,
      });
    }

    const metrics = metricsCollector.getSystemMetrics();
    const history = metricsCollector.getMetricsHistory(period);

    // Export based on format
    if (format === 'json') {
      const exportData = {
        timestamp: Date.now(),
        period,
        current: metrics,
        history,
      };

      res.setHeader('Content-Disposition', `attachment; filename=metrics-${Date.now()}.json`);
      res.setHeader('Content-Type', 'application/json');
      res.json(exportData);
    } else if (format === 'csv') {
      // Convert to CSV
      const csvLines: string[] = [
        'timestamp,requestCount,successRate,avgLatency,totalTokens,totalCost,errorCount,cacheHitRate',
      ];

      for (const point of history) {
        csvLines.push(
          [
            point.timestamp,
            point.requestCount,
            point.successRate.toFixed(2),
            point.avgLatency.toFixed(2),
            point.totalTokens,
            point.totalCost.toFixed(4),
            point.errorCount,
            point.cacheHitRate.toFixed(2),
          ].join(',')
        );
      }

      const csv = csvLines.join('\n');

      res.setHeader('Content-Disposition', `attachment; filename=metrics-${Date.now()}.csv`);
      res.setHeader('Content-Type', 'text/csv');
      res.send(csv);
    } else if (format === 'opentelemetry') {
      const otelData = metricsCollector.exportOpenTelemetry();

      res.setHeader('Content-Disposition', `attachment; filename=metrics-otel-${Date.now()}.json`);
      res.setHeader('Content-Type', 'application/json');
      res.json(otelData);
    }
  } catch (error) {
    logger.error('Error exporting metrics:', error);
    res.status(500).json({
      error: 'Failed to export metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/opentelemetry
 * Get metrics in OpenTelemetry format
 */
router.get('/api/metrics/opentelemetry', (_req: Request, res: Response) => {
  try {
    const otelData = metricsCollector.exportOpenTelemetry();
    res.json(otelData);
  } catch (error) {
    logger.error('Error exporting OpenTelemetry metrics:', error);
    res.status(500).json({
      error: 'Failed to export OpenTelemetry metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/metrics/config
 * Get metrics collector configuration
 */
router.get('/api/metrics/config', (_req: Request, res: Response) => {
  try {
    const config = metricsCollector.getConfig();
    res.json(config);
  } catch (error) {
    logger.error('Error fetching metrics config:', error);
    res.status(500).json({
      error: 'Failed to fetch metrics config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * PATCH /api/metrics/config
 * Update metrics collector configuration
 */
router.patch('/api/metrics/config', (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // Validate updates
    if (typeof updates !== 'object' || updates === null) {
      return res.status(400).json({
        error: 'Invalid request body',
        message: 'Request body must be an object',
      });
    }

    metricsCollector.updateConfig(updates);
    const newConfig = metricsCollector.getConfig();

    logger.info('Metrics config updated:', updates);

    res.json({
      success: true,
      config: newConfig,
    });
  } catch (error) {
    logger.error('Error updating metrics config:', error);
    res.status(500).json({
      error: 'Failed to update metrics config',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ============================================================================
// WEBSOCKET SETUP (to be integrated in main server)
// ============================================================================

/**
 * WebSocket connection handler
 * This should be called from the main server when a WebSocket connection is established
 */
export function setupMetricsWebSocket(ws: any): void {
  logger.info('New metrics WebSocket connection established');
  const unregisterConnection = metricsCollector.registerWebSocketConnection();

  // Send initial snapshot
  const initialMetrics = metricsCollector.getSystemMetrics();
  ws.send(JSON.stringify({
    type: 'metrics_snapshot',
    timestamp: Date.now(),
    data: initialMetrics,
  }));

  // Forward metrics updates to this client
  const metricsHandler = (message: any) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  };

  metricsCollector.on('metrics', metricsHandler);

  // Heartbeat to keep connection alive
  const heartbeatInterval = setInterval(() => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now(),
        data: null,
      }));
    } else {
      clearInterval(heartbeatInterval);
    }
  }, 30000); // Every 30 seconds

  // Handle client messages
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);

      // Handle ping
      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now(),
          data: null,
        }));
      }
    } catch (error) {
      logger.error('Error handling WebSocket message:', error);
    }
  });

  // Cleanup on close
  ws.on('close', () => {
    logger.info('Metrics WebSocket connection closed');
    metricsCollector.off('metrics', metricsHandler);
    clearInterval(heartbeatInterval);
    unregisterConnection();
  });

  // Handle errors
  ws.on('error', (error: Error) => {
    logger.error('Metrics WebSocket error:', error);
    unregisterConnection();
  });
}

export const metricsRouter = router;
