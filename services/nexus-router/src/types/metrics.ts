/**
 * Metrics Types for Nexus Router Observability
 *
 * Defines TypeScript types for metrics collection, aggregation, and real-time streaming.
 * Inspired by OpenTelemetry and Grafbase Nexus patterns.
 */

// ============================================================================
// METRICS DATA TYPES
// ============================================================================

export interface MetricDataPoint {
  timestamp: number;
  value: number;
  labels?: Record<string, string>;
}

export interface LatencyPercentiles {
  p50: number;  // Median
  p95: number;  // 95th percentile
  p99: number;  // 99th percentile
  p999?: number; // 99.9th percentile (optional)
  min: number;
  max: number;
  mean: number;
}

export interface RequestMetrics {
  total: number;
  success: number;
  error: number;
  timeout: number;
  successRate: number; // Percentage (0-100)
}

export interface ProviderMetrics {
  providerId: string;
  providerName: string;
  requests: RequestMetrics;
  latency: LatencyPercentiles;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number; // Percentage (0-100)
}

export interface RouteMetrics {
  route: string;
  requests: RequestMetrics;
  latency: LatencyPercentiles;
  providers: Record<string, ProviderMetrics>;
}

export interface SystemMetrics {
  timestamp: number;
  uptime: number; // seconds
  requests: RequestMetrics;
  latency: LatencyPercentiles;
  tokenUsage: {
    input: number;
    output: number;
    total: number;
  };
  totalCost: number;
  cacheHitRate: number;
  activeConnections: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  providers: ProviderMetrics[];
  routes: RouteMetrics[];
}

// ============================================================================
// HISTORICAL METRICS
// ============================================================================

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface MetricsHistoryPoint {
  timestamp: number;
  requestCount: number;
  successRate: number;
  avgLatency: number;
  totalTokens: number;
  totalCost: number;
  errorCount: number;
  cacheHitRate: number;
}

export interface MetricsHistory {
  timeRange: TimeRange;
  interval: number; // seconds between data points
  dataPoints: MetricsHistoryPoint[];
  aggregation: 'sum' | 'avg' | 'min' | 'max';
}

// ============================================================================
// DISTRIBUTED TRACING
// ============================================================================

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: number;
  endTime: number;
  duration: number; // milliseconds
  status: 'ok' | 'error' | 'timeout';
  attributes: Record<string, any>;
  events?: TraceEvent[];
}

export interface TraceEvent {
  timestamp: number;
  name: string;
  attributes: Record<string, any>;
}

export interface Trace {
  traceId: string;
  requestId: string;
  timestamp: number;
  duration: number; // milliseconds
  status: 'success' | 'error' | 'timeout';
  provider: string;
  model: string;
  route: string;
  method: string;
  statusCode: number;
  latency: number; // milliseconds
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  cached: boolean;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  spans: TraceSpan[];
  metadata?: Record<string, any>;
}

// ============================================================================
// LOGGING
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  service: string;
  traceId?: string;
  requestId?: string;
  context?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface LogQuery {
  level?: LogLevel;
  service?: string;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
  search?: string; // Search in message or context
}

// ============================================================================
// WEBSOCKET MESSAGES
// ============================================================================

export type MetricsMessageType =
  | 'metrics_snapshot'
  | 'metrics_update'
  | 'trace_created'
  | 'log_entry'
  | 'alert'
  | 'heartbeat';

export interface MetricsWebSocketMessage {
  type: MetricsMessageType;
  timestamp: number;
  data: any;
}

export interface MetricsSnapshotMessage extends MetricsWebSocketMessage {
  type: 'metrics_snapshot';
  data: SystemMetrics;
}

export interface MetricsUpdateMessage extends MetricsWebSocketMessage {
  type: 'metrics_update';
  data: {
    metric: 'requests' | 'latency' | 'tokens' | 'cost' | 'cache' | 'errors';
    value: number;
    delta?: number;
    provider?: string;
    route?: string;
  };
}

export interface TraceCreatedMessage extends MetricsWebSocketMessage {
  type: 'trace_created';
  data: Trace;
}

export interface LogEntryMessage extends MetricsWebSocketMessage {
  type: 'log_entry';
  data: LogEntry;
}

export interface AlertMessage extends MetricsWebSocketMessage {
  type: 'alert';
  data: {
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
    timestamp: number;
    metadata?: Record<string, any>;
  };
}

// ============================================================================
// METRICS COLLECTOR CONFIGURATION
// ============================================================================

export interface MetricsCollectorConfig {
  enabled: boolean;
  flushInterval: number; // milliseconds
  retentionPeriod: number; // seconds
  aggregationWindow: number; // seconds
  enableTracing: boolean;
  enableLogging: boolean;
  maxTraces: number;
  maxLogs: number;
  percentiles: number[]; // e.g., [50, 95, 99, 99.9]
}

// ============================================================================
// HISTOGRAM BUCKETS (for latency distribution)
// ============================================================================

export interface HistogramBucket {
  le: number; // Less than or equal to (upper bound in milliseconds)
  count: number;
}

export interface LatencyHistogram {
  buckets: HistogramBucket[];
  sum: number; // Total of all values
  count: number; // Total number of observations
}

// ============================================================================
// OPENTELEMETRY EXPORT FORMAT
// ============================================================================

export interface OTelMetric {
  name: string;
  description: string;
  unit: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  dataPoints: Array<{
    timestamp: number;
    value: number;
    attributes: Record<string, string>;
  }>;
}

export interface OTelTrace {
  traceId: string;
  spans: Array<{
    spanId: string;
    parentSpanId?: string;
    name: string;
    kind: 'server' | 'client' | 'internal';
    startTimeUnixNano: string;
    endTimeUnixNano: string;
    attributes: Record<string, any>;
    status: {
      code: 'ok' | 'error';
      message?: string;
    };
  }>;
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

export type ExportFormat = 'json' | 'csv' | 'opentelemetry';

export interface ExportRequest {
  format: ExportFormat;
  timeRange: TimeRange;
  metrics?: string[]; // Specific metrics to export
  includeTraces?: boolean;
  includeLogs?: boolean;
}

export interface ExportResult {
  format: ExportFormat;
  timestamp: number;
  data: string | object;
  filename: string;
  size: number; // bytes
}
