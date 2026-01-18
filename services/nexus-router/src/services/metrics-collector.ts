/**
 * Metrics Collector Service
 *
 * Collects, aggregates, and stores metrics for observability.
 * - Tracks requests, latencies, errors, tokens, costs
 * - Calculates percentiles (p50, p95, p99)
 * - Maintains histograms for latency distribution
 * - Stores traces and logs
 * - Broadcasts real-time updates via WebSocket
 */

import { EventEmitter } from 'events';
import {
  SystemMetrics,
  ProviderMetrics,
  RouteMetrics,
  RequestMetrics,
  LatencyPercentiles,
  Trace,
  LogEntry,
  MetricsHistoryPoint,
  TimeRange,
  MetricsWebSocketMessage,
  LatencyHistogram,
  HistogramBucket,
  MetricsCollectorConfig,
  OTelMetric,
  OTelTrace,
} from '../types/metrics';

/**
 * Single request record for internal tracking
 */
interface RequestRecord {
  timestamp: number;
  provider: string;
  route: string;
  latency: number; // milliseconds
  status: 'success' | 'error' | 'timeout';
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  cached: boolean;
  traceId?: string;
}

/**
 * Metrics Collector Service
 * Singleton pattern for centralized metrics collection
 */
export class MetricsCollectorService extends EventEmitter {
  private static instance: MetricsCollectorService;

  private config: MetricsCollectorConfig = {
    enabled: true,
    flushInterval: 5000, // 5 seconds
    retentionPeriod: 24 * 60 * 60, // 24 hours
    aggregationWindow: 60, // 1 minute
    enableTracing: true,
    enableLogging: true,
    maxTraces: 1000,
    maxLogs: 5000,
    percentiles: [50, 95, 99],
  };

  private startTime: number = Date.now();
  private requests: RequestRecord[] = [];
  private traces: Map<string, Trace> = new Map();
  private logs: LogEntry[] = [];
  private historyPoints: MetricsHistoryPoint[] = [];

  // Latency histogram buckets (in milliseconds)
  private readonly latencyBuckets = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  private constructor() {
    super();
    this.startCleanupInterval();
    this.startAggregationInterval();
  }

  public static getInstance(): MetricsCollectorService {
    if (!MetricsCollectorService.instance) {
      MetricsCollectorService.instance = new MetricsCollectorService();
    }
    return MetricsCollectorService.instance;
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  public updateConfig(config: Partial<MetricsCollectorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): MetricsCollectorConfig {
    return { ...this.config };
  }

  // ============================================================================
  // RECORD METHODS
  // ============================================================================

  /**
   * Record a single request
   */
  public recordRequest(record: RequestRecord): void {
    if (!this.config.enabled) return;

    this.requests.push(record);

    // Emit real-time update
    this.emitUpdate('metrics_update', {
      metric: 'requests',
      value: 1,
      provider: record.provider,
      route: record.route,
    });

    // Clean up old requests
    this.cleanOldRequests();
  }

  /**
   * Record a trace
   */
  public recordTrace(trace: Trace): void {
    if (!this.config.enabled || !this.config.enableTracing) return;

    this.traces.set(trace.traceId, trace);

    // Emit trace created event
    this.emitUpdate('trace_created', trace);

    // Limit trace storage
    if (this.traces.size > this.config.maxTraces) {
      // Remove oldest trace
      const oldestKey = this.traces.keys().next().value;
      this.traces.delete(oldestKey);
    }
  }

  /**
   * Record a log entry
   */
  public recordLog(log: LogEntry): void {
    if (!this.config.enabled || !this.config.enableLogging) return;

    this.logs.push(log);

    // Emit log entry event
    this.emitUpdate('log_entry', log);

    // Limit log storage
    if (this.logs.length > this.config.maxLogs) {
      this.logs.shift(); // Remove oldest
    }
  }

  // ============================================================================
  // GET METRICS
  // ============================================================================

  /**
   * Get current system metrics snapshot
   */
  public getSystemMetrics(): SystemMetrics {
    const now = Date.now();
    const recentRequests = this.getRecentRequests(300); // Last 5 minutes

    // Overall request metrics
    const overallRequests = this.calculateRequestMetrics(recentRequests);
    const overallLatency = this.calculateLatencyPercentiles(
      recentRequests.map((r) => r.latency)
    );

    // Token usage
    const tokenUsage = recentRequests.reduce(
      (acc, r) => ({
        input: acc.input + r.tokens.input,
        output: acc.output + r.tokens.output,
        total: acc.total + r.tokens.total,
      }),
      { input: 0, output: 0, total: 0 }
    );

    // Total cost
    const totalCost = recentRequests.reduce((acc, r) => acc + r.cost, 0);

    // Cache hit rate
    const cachedRequests = recentRequests.filter((r) => r.cached).length;
    const cacheHitRate =
      recentRequests.length > 0 ? (cachedRequests / recentRequests.length) * 100 : 0;

    // Provider metrics
    const providers = this.calculateProviderMetrics(recentRequests);

    // Route metrics
    const routes = this.calculateRouteMetrics(recentRequests);

    // Memory usage
    const memoryUsage = process.memoryUsage();

    return {
      timestamp: now,
      uptime: Math.floor((now - this.startTime) / 1000),
      requests: overallRequests,
      latency: overallLatency,
      tokenUsage,
      totalCost,
      cacheHitRate,
      activeConnections: 0, // TODO: Track WebSocket connections
      memoryUsage: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      providers,
      routes,
    };
  }

  /**
   * Get metrics history for a time range
   */
  public getMetricsHistory(timeRange: TimeRange): MetricsHistoryPoint[] {
    const now = Date.now();
    const rangeMs = this.getTimeRangeMs(timeRange);
    const startTime = now - rangeMs;

    return this.historyPoints.filter((point) => point.timestamp >= startTime);
  }

  /**
   * Get recent traces
   */
  public getTraces(limit: number = 100, offset: number = 0): Trace[] {
    const tracesArray = Array.from(this.traces.values())
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(offset, offset + limit);

    return tracesArray;
  }

  /**
   * Get recent logs
   */
  public getLogs(
    level?: string,
    limit: number = 100,
    offset: number = 0
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = filteredLogs.filter((log) => log.level === level);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(offset, offset + limit);
  }

  /**
   * Get latency histogram
   */
  public getLatencyHistogram(): LatencyHistogram {
    const recentRequests = this.getRecentRequests(300); // Last 5 minutes
    const latencies = recentRequests.map((r) => r.latency);

    const buckets: HistogramBucket[] = this.latencyBuckets.map((le) => ({
      le,
      count: latencies.filter((l) => l <= le).length,
    }));

    const sum = latencies.reduce((acc, l) => acc + l, 0);
    const count = latencies.length;

    return { buckets, sum, count };
  }

  // ============================================================================
  // EXPORT METHODS
  // ============================================================================

  /**
   * Export metrics in OpenTelemetry format
   */
  public exportOpenTelemetry(): { metrics: OTelMetric[]; traces: OTelTrace[] } {
    const systemMetrics = this.getSystemMetrics();
    const now = Date.now();

    // Convert to OpenTelemetry metrics
    const metrics: OTelMetric[] = [
      {
        name: 'http_requests_total',
        description: 'Total number of HTTP requests',
        unit: '1',
        type: 'counter',
        dataPoints: [
          {
            timestamp: now,
            value: systemMetrics.requests.total,
            attributes: {},
          },
        ],
      },
      {
        name: 'http_request_duration_ms',
        description: 'HTTP request latency in milliseconds',
        unit: 'ms',
        type: 'histogram',
        dataPoints: [
          {
            timestamp: now,
            value: systemMetrics.latency.mean,
            attributes: { percentile: 'mean' },
          },
          {
            timestamp: now,
            value: systemMetrics.latency.p50,
            attributes: { percentile: 'p50' },
          },
          {
            timestamp: now,
            value: systemMetrics.latency.p95,
            attributes: { percentile: 'p95' },
          },
          {
            timestamp: now,
            value: systemMetrics.latency.p99,
            attributes: { percentile: 'p99' },
          },
        ],
      },
      {
        name: 'llm_tokens_total',
        description: 'Total LLM tokens used',
        unit: '1',
        type: 'counter',
        dataPoints: [
          {
            timestamp: now,
            value: systemMetrics.tokenUsage.total,
            attributes: {},
          },
        ],
      },
      {
        name: 'llm_cost_usd',
        description: 'Total cost in USD',
        unit: 'USD',
        type: 'counter',
        dataPoints: [
          {
            timestamp: now,
            value: systemMetrics.totalCost,
            attributes: {},
          },
        ],
      },
    ];

    // Convert traces to OpenTelemetry format
    const traces: OTelTrace[] = Array.from(this.traces.values()).map((trace) => ({
      traceId: trace.traceId,
      spans: trace.spans.map((span) => ({
        spanId: span.spanId,
        parentSpanId: span.parentSpanId,
        name: span.name,
        kind: 'server' as const,
        startTimeUnixNano: (span.startTime * 1000000).toString(),
        endTimeUnixNano: (span.endTime * 1000000).toString(),
        attributes: span.attributes,
        status: {
          code: span.status === 'ok' ? 'ok' : 'error',
          message: span.status !== 'ok' ? `Span ended with status: ${span.status}` : undefined,
        },
      })),
    }));

    return { metrics, traces };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getRecentRequests(seconds: number): RequestRecord[] {
    const cutoff = Date.now() - seconds * 1000;
    return this.requests.filter((r) => r.timestamp >= cutoff);
  }

  private calculateRequestMetrics(requests: RequestRecord[]): RequestMetrics {
    const total = requests.length;
    const success = requests.filter((r) => r.status === 'success').length;
    const error = requests.filter((r) => r.status === 'error').length;
    const timeout = requests.filter((r) => r.status === 'timeout').length;
    const successRate = total > 0 ? (success / total) * 100 : 0;

    return { total, success, error, timeout, successRate };
  }

  private calculateLatencyPercentiles(latencies: number[]): LatencyPercentiles {
    if (latencies.length === 0) {
      return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, mean: 0 };
    }

    const sorted = [...latencies].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, l) => acc + l, 0);

    return {
      p50: this.percentile(sorted, 50),
      p95: this.percentile(sorted, 95),
      p99: this.percentile(sorted, 99),
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / sorted.length,
    };
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  private calculateProviderMetrics(requests: RequestRecord[]): ProviderMetrics[] {
    const providerMap = new Map<string, RequestRecord[]>();

    // Group by provider
    for (const request of requests) {
      if (!providerMap.has(request.provider)) {
        providerMap.set(request.provider, []);
      }
      providerMap.get(request.provider)!.push(request);
    }

    // Calculate metrics for each provider
    return Array.from(providerMap.entries()).map(([providerId, providerRequests]) => {
      const requests = this.calculateRequestMetrics(providerRequests);
      const latency = this.calculateLatencyPercentiles(
        providerRequests.map((r) => r.latency)
      );
      const tokenUsage = providerRequests.reduce(
        (acc, r) => ({
          input: acc.input + r.tokens.input,
          output: acc.output + r.tokens.output,
          total: acc.total + r.tokens.total,
        }),
        { input: 0, output: 0, total: 0 }
      );
      const cost = providerRequests.reduce((acc, r) => acc + r.cost, 0);
      const cacheHits = providerRequests.filter((r) => r.cached).length;
      const cacheMisses = providerRequests.length - cacheHits;
      const cacheHitRate =
        providerRequests.length > 0 ? (cacheHits / providerRequests.length) * 100 : 0;

      return {
        providerId,
        providerName: providerId, // TODO: Get actual name from provider config
        requests,
        latency,
        tokenUsage,
        cost,
        cacheHits,
        cacheMisses,
        cacheHitRate,
      };
    });
  }

  private calculateRouteMetrics(requests: RequestRecord[]): RouteMetrics[] {
    const routeMap = new Map<string, RequestRecord[]>();

    // Group by route
    for (const request of requests) {
      if (!routeMap.has(request.route)) {
        routeMap.set(request.route, []);
      }
      routeMap.get(request.route)!.push(request);
    }

    // Calculate metrics for each route
    return Array.from(routeMap.entries()).map(([route, routeRequests]) => {
      const requests = this.calculateRequestMetrics(routeRequests);
      const latency = this.calculateLatencyPercentiles(
        routeRequests.map((r) => r.latency)
      );

      // Calculate per-provider metrics for this route
      const providerMap = new Map<string, RequestRecord[]>();
      for (const request of routeRequests) {
        if (!providerMap.has(request.provider)) {
          providerMap.set(request.provider, []);
        }
        providerMap.get(request.provider)!.push(request);
      }

      const providers: Record<string, ProviderMetrics> = {};
      for (const [providerId, providerRequests] of providerMap.entries()) {
        providers[providerId] = this.calculateProviderMetrics(providerRequests)[0];
      }

      return {
        route,
        requests,
        latency,
        providers,
      };
    });
  }

  private cleanOldRequests(): void {
    const cutoff = Date.now() - this.config.retentionPeriod * 1000;
    this.requests = this.requests.filter((r) => r.timestamp >= cutoff);
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanOldRequests();

      // Clean old logs
      const logCutoff = Date.now() - this.config.retentionPeriod * 1000;
      this.logs = this.logs.filter((log) => log.timestamp >= logCutoff);

      // Clean old traces
      const traceCutoff = Date.now() - this.config.retentionPeriod * 1000;
      for (const [traceId, trace] of this.traces.entries()) {
        if (trace.timestamp < traceCutoff) {
          this.traces.delete(traceId);
        }
      }
    }, 60000); // Run every minute
  }

  private startAggregationInterval(): void {
    setInterval(() => {
      // Create history point
      const now = Date.now();
      const recentRequests = this.getRecentRequests(this.config.aggregationWindow);
      const metrics = this.calculateRequestMetrics(recentRequests);
      const latencies = recentRequests.map((r) => r.latency);
      const avgLatency =
        latencies.length > 0
          ? latencies.reduce((acc, l) => acc + l, 0) / latencies.length
          : 0;
      const totalTokens = recentRequests.reduce((acc, r) => acc + r.tokens.total, 0);
      const totalCost = recentRequests.reduce((acc, r) => acc + r.cost, 0);
      const cachedRequests = recentRequests.filter((r) => r.cached).length;
      const cacheHitRate =
        recentRequests.length > 0 ? (cachedRequests / recentRequests.length) * 100 : 0;

      const historyPoint: MetricsHistoryPoint = {
        timestamp: now,
        requestCount: metrics.total,
        successRate: metrics.successRate,
        avgLatency,
        totalTokens,
        totalCost,
        errorCount: metrics.error + metrics.timeout,
        cacheHitRate,
      };

      this.historyPoints.push(historyPoint);

      // Clean old history points (keep last 30 days)
      const historyCutoff = now - 30 * 24 * 60 * 60 * 1000;
      this.historyPoints = this.historyPoints.filter(
        (point) => point.timestamp >= historyCutoff
      );

      // Emit snapshot
      this.emitUpdate('metrics_snapshot', this.getSystemMetrics());
    }, this.config.flushInterval);
  }

  private emitUpdate(type: string, data: any): void {
    const message: MetricsWebSocketMessage = {
      type: type as any,
      timestamp: Date.now(),
      data,
    };

    this.emit('metrics', message);
  }

  private getTimeRangeMs(timeRange: TimeRange): number {
    const ranges: Record<TimeRange, number> = {
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };

    return ranges[timeRange] || ranges['24h'];
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================

  public shutdown(): void {
    this.removeAllListeners();
  }
}
