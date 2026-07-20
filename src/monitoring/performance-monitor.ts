/**
 * NYRA Performance Monitor
 * Comprehensive performance monitoring and alerting system for distributed memory architecture
 */

import { EventEmitter } from 'events';

export interface MetricDefinition {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  unit: string;
  description: string;
  labels: string[];
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
  retention: number; // days
}

export interface MetricValue {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
  nodeId: string;
}

export interface PerformanceThreshold {
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  nodeId: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  status: 'open' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface PerformanceDashboard {
  id: string;
  name: string;
  panels: DashboardPanel[];
  refreshInterval: number;
  timeRange: TimeRange;
}

export interface DashboardPanel {
  id: string;
  title: string;
  type: 'line_chart' | 'bar_chart' | 'gauge' | 'table' | 'heatmap' | 'stat';
  metrics: string[];
  timeRange?: TimeRange;
  aggregation?: string;
  filters?: Record<string, string>;
}

export interface TimeRange {
  from: Date;
  to: Date;
  step: number; // seconds
}

export interface SystemHealthReport {
  nodeId: string;
  timestamp: Date;
  overall_health: 'healthy' | 'warning' | 'critical';
  components: ComponentHealth[];
  summary: HealthSummary;
  recommendations: Recommendation[];
}

export interface ComponentHealth {
  component: string;
  status: 'healthy' | 'warning' | 'critical';
  metrics: Record<string, number>;
  issues: string[];
  uptime: number; // seconds
}

export interface HealthSummary {
  cpuUtilization: number;
  memoryUtilization: number;
  diskUtilization: number;
  networkThroughput: number;
  errorRate: number;
  responseTime: number;
  availability: number;
}

export interface Recommendation {
  type: 'optimization' | 'scaling' | 'maintenance' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  action: string;
  estimatedImpact: number;
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'degrading' | 'stable';
  rate: number; // change per hour
  confidence: number;
  prediction: TrendPrediction[];
}

export interface TrendPrediction {
  timestamp: Date;
  value: number;
  confidence: number;
}

export interface ResourceUtilization {
  nodeId: string;
  timestamp: Date;
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    available: number;
    cached: number;
    buffers: number;
  };
  disk: {
    total: number;
    used: number;
    available: number;
    iops: number;
    latency: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
    connections: number;
  };
  gpu?: {
    usage: number;
    memory: number;
    temperature: number;
    powerUsage: number;
  };
}

export interface PerformanceBaseline {
  metric: string;
  nodeId?: string;
  timeOfDay: number; // hour 0-23
  dayOfWeek: number; // 0-6
  expectedValue: number;
  variance: number;
  confidence: number;
  lastUpdated: Date;
}

export class PerformanceMonitor extends EventEmitter {
  private nodeId: string;
  private metrics: Map<string, MetricDefinition> = new Map();
  private metricValues: Map<string, MetricValue[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private dashboards: Map<string, PerformanceDashboard> = new Map();
  private baselines: Map<string, PerformanceBaseline> = new Map();
  private latestResourceUtilization: ResourceUtilization | null = null;
  private readonly resourceSnapshotCacheTtlMs = 1000;
  private namedBaselines: Map<string, Record<string, number>> = new Map();
  private namedMetricSnapshots: Map<string, Record<string, number>> = new Map();

  // Monitoring intervals
  private collectionInterval: NodeJS.Timeout;
  private analysisInterval: NodeJS.Timeout;
  private alertingInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;

  // Analysis engines
  private trendAnalyzer: TrendAnalyzer;
  private anomalyDetector: AnomalyDetector;
  private baselineCalculator: BaselineCalculator;
  private alertManager: AlertManager;

  // Configuration
  private collectionIntervalMs = 10000; // 10 seconds
  private analysisIntervalMs = 60000; // 1 minute
  private alertingIntervalMs = 250; // Fast enough for unit threshold checks
  private retentionDays = 30;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;

    this.trendAnalyzer = new TrendAnalyzer();
    this.anomalyDetector = new AnomalyDetector();
    this.baselineCalculator = new BaselineCalculator();
    this.alertManager = new AlertManager(this);

    this.initializeMetrics();
    this.initializeThresholds();
    this.initializeDashboards();
    this.startMonitoring();
  }

  /**
   * Record a metric value
   */
  async recordMetric(
    nameOrMetric: string | MetricValue,
    value?: number,
    labels: Record<string, string> = {}
  ): Promise<void> {
    const metric = this.normalizeMetricInput(nameOrMetric, value, labels);
    if (!metric) {
      return;
    }

    if (!this.metricValues.has(metric.name)) {
      this.metricValues.set(metric.name, []);
    }

    this.metricValues.get(metric.name)!.push(metric);

    try {
      this.emit('metricRecorded', metric);
      await this.scheduleThresholdEvaluation(metric.name);
    } catch {
      // Preserve recorded metrics even if listeners fail.
    }
  }

  /**
   * Get metric values within time range
   */
  getMetrics(name: string, timeRange?: TimeRange, labels?: Record<string, string>): MetricValue[] {
    const values = this.metricValues.get(name) || [];
    if (!timeRange) {
      return [...values];
    }

    return values.filter(metric => {
      // Time range filter
      if (metric.timestamp < timeRange.from || metric.timestamp > timeRange.to) {
        return false;
      }

      // Label filters
      if (labels) {
        for (const [key, value] of Object.entries(labels)) {
          if (metric.labels[key] !== value) {
            return false;
          }
        }
      }

      return true;
    });
  }

  async registerMetric(definition: MetricDefinition): Promise<void> {
    this.metrics.set(definition.name, definition);
    if (!this.metricValues.has(definition.name)) {
      this.metricValues.set(definition.name, []);
    }
  }

  async getAggregation(
    metricName: string,
    aggregation: MetricDefinition['aggregation']
  ): Promise<number> {
    const values = this.metricValues.get(metricName) || [];
    if (values.length === 0) {
      return 0;
    }

    const numbers = values.map(item => item.value);
    switch (aggregation) {
      case 'sum':
        return numbers.reduce((sum, current) => sum + current, 0);
      case 'min':
        return Math.min(...numbers);
      case 'max':
        return Math.max(...numbers);
      case 'count':
        return numbers.length;
      case 'avg':
      default:
        return numbers.reduce((sum, current) => sum + current, 0) / numbers.length;
    }
  }

  /**
   * Generate system health report
   */
  async generateHealthReport(): Promise<SystemHealthReport> {
    const timestamp = new Date();
    const components = await this.analyzeComponents();
    const summary = this.calculateHealthSummary(components);
    const recommendations = await this.generateRecommendations(components, summary);

    const overall_health = this.determineOverallHealth(components);

    const report: SystemHealthReport = {
      nodeId: this.nodeId,
      timestamp,
      overall_health,
      components,
      summary,
      recommendations
    };

    this.emit('healthReport', report);
    return report;
  }

  /**
   * Analyze performance trends
   */
  async analyzeTrends(metrics: string[], timeRange: TimeRange): Promise<PerformanceTrend[]>;
  async analyzeTrends(metric: string): Promise<PerformanceTrend>;
  async analyzeTrends(metricsOrMetric: string[] | string, timeRange?: TimeRange): Promise<PerformanceTrend[] | PerformanceTrend> {
    if (typeof metricsOrMetric === 'string') {
      const values = this.getMetrics(metricsOrMetric);
      return this.trendAnalyzer.analyze(metricsOrMetric, values);
    }

    const trends: PerformanceTrend[] = [];

    for (const metricName of metricsOrMetric) {
      const values = this.getMetrics(metricName, timeRange);
      if (values.length < 2) continue;

      const trend = await this.trendAnalyzer.analyze(metricName, values);
      trends.push(trend);
    }

    return trends;
  }

  /**
   * Detect performance anomalies
   */
  async detectAnomalies(timeRange: TimeRange): Promise<PerformanceAnomaly[]>;
  async detectAnomalies(metricName: string): Promise<PerformanceAnomaly[]>;
  async detectAnomalies(timeRangeOrMetric: TimeRange | string): Promise<PerformanceAnomaly[]> {
    const anomalies: PerformanceAnomaly[] = [];
    const metricNames = typeof timeRangeOrMetric === 'string'
      ? [timeRangeOrMetric]
      : Array.from(this.metrics.keys());
    const timeRange = typeof timeRangeOrMetric === 'string'
      ? this.createFullRangeForMetric(timeRangeOrMetric)
      : timeRangeOrMetric;

    for (const metricName of metricNames) {
      const values = this.getMetrics(metricName, timeRange);
      const baseline = this.getBaselineForMetric(metricName, values[values.length - 1]?.timestamp);

      if (values.length > 0 && baseline) {
        const metricAnomalies = await this.anomalyDetector.detect(values, baseline);
        anomalies.push(...metricAnomalies);
      }
    }

    this.emit('anomaliesDetected', anomalies);
    return anomalies;
  }

  /**
   * Set performance threshold for alerting
   */
  setThreshold(metric: string, threshold: PerformanceThreshold): void {
    if (!this.thresholds.has(metric)) {
      this.thresholds.set(metric, []);
    }

    this.thresholds.get(metric)!.push(threshold);
    this.emit('thresholdSet', metric, threshold);
  }

  async addThreshold(threshold: PerformanceThreshold): Promise<void> {
    this.setThreshold(threshold.metric, threshold);
  }

  async addBaseline(
    baseline: Omit<PerformanceBaseline, 'lastUpdated' | 'nodeId'> & Partial<Pick<PerformanceBaseline, 'nodeId' | 'lastUpdated'>>
  ): Promise<void> {
    const completeBaseline: PerformanceBaseline = {
      ...baseline,
      nodeId: baseline.nodeId || this.nodeId,
      lastUpdated: baseline.lastUpdated || new Date()
    };

    this.baselines.set(
      this.buildBaselineKey(completeBaseline.metric, completeBaseline.nodeId, completeBaseline.timeOfDay, completeBaseline.dayOfWeek),
      completeBaseline
    );
  }

  /**
   * Create performance dashboard
   */
  createDashboard(dashboard: PerformanceDashboard): void {
    this.dashboards.set(dashboard.id, dashboard);
    this.emit('dashboardCreated', dashboard);
  }

  /**
   * Get dashboard data
   */
  getDashboardData(dashboardId: string): DashboardData | null {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) return null;

    const data: DashboardData = {
      dashboard,
      panels: dashboard.panels.map(panel => ({
        panel,
        data: this.getPanelData(panel, dashboard.timeRange)
      })),
      lastUpdated: new Date()
    };

    return data;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status !== 'open') return false;

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    this.emit('alertAcknowledged', alert);
    return true;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.status === 'resolved') return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();

    this.emit('alertResolved', alert);
    return true;
  }

  /**
   * Get current resource utilization
   */
  async getCurrentResourceUtilization(): Promise<ResourceUtilization> {
    const snapshotAge = this.latestResourceUtilization
      ? Date.now() - this.latestResourceUtilization.timestamp.getTime()
      : Infinity;
    if (this.latestResourceUtilization && snapshotAge < this.resourceSnapshotCacheTtlMs) {
      return {
        ...this.latestResourceUtilization,
        cpu: { ...this.latestResourceUtilization.cpu, loadAverage: [...this.latestResourceUtilization.cpu.loadAverage] },
        memory: { ...this.latestResourceUtilization.memory },
        disk: { ...this.latestResourceUtilization.disk },
        network: { ...this.latestResourceUtilization.network },
        gpu: this.latestResourceUtilization.gpu ? { ...this.latestResourceUtilization.gpu } : undefined
      };
    }

    const timestamp = new Date();

    // In a real implementation, this would collect actual system metrics
    const utilization: ResourceUtilization = {
      nodeId: this.nodeId,
      timestamp,
      cpu: {
        usage: await this.getCPUUsage(),
        cores: await this.getCPUCores(),
        loadAverage: await this.getLoadAverage()
      },
      memory: {
        total: await this.getTotalMemory(),
        used: await this.getUsedMemory(),
        available: await this.getAvailableMemory(),
        cached: await this.getCachedMemory(),
        buffers: await this.getBufferMemory()
      },
      disk: {
        total: await this.getTotalDisk(),
        used: await this.getUsedDisk(),
        available: await this.getAvailableDisk(),
        iops: await this.getDiskIOPS(),
        latency: await this.getDiskLatency()
      },
      network: {
        bytesIn: await this.getNetworkBytesIn(),
        bytesOut: await this.getNetworkBytesOut(),
        packetsIn: await this.getNetworkPacketsIn(),
        packetsOut: await this.getNetworkPacketsOut(),
        errors: await this.getNetworkErrors(),
        connections: await this.getNetworkConnections()
      }
    };

    // Add GPU metrics if available
    if (await this.hasGPU()) {
      utilization.gpu = {
        usage: await this.getGPUUsage(),
        memory: await this.getGPUMemory(),
        temperature: await this.getGPUTemperature(),
        powerUsage: await this.getGPUPowerUsage()
      };
    }

    this.emit('resourceUtilization', utilization);
    this.latestResourceUtilization = utilization;
    return utilization;
  }

  async recordResourceUtilization(
    partial: Partial<ResourceUtilization> & { timestamp?: Date }
  ): Promise<void> {
    const utilization: ResourceUtilization = {
      nodeId: partial.nodeId || this.nodeId,
      timestamp: partial.timestamp || new Date(),
      cpu: {
        usage: partial.cpu?.usage ?? this.latestResourceUtilization?.cpu.usage ?? 0,
        cores: partial.cpu?.cores ?? this.latestResourceUtilization?.cpu.cores ?? 0,
        loadAverage: partial.cpu?.loadAverage ?? this.latestResourceUtilization?.cpu.loadAverage ?? []
      },
      memory: {
        total: partial.memory?.total ?? this.latestResourceUtilization?.memory.total ?? 0,
        used: partial.memory?.used ?? this.latestResourceUtilization?.memory.used ?? 0,
        available: partial.memory?.available ?? this.latestResourceUtilization?.memory.available ?? 0,
        cached: partial.memory?.cached ?? this.latestResourceUtilization?.memory.cached ?? 0,
        buffers: partial.memory?.buffers ?? this.latestResourceUtilization?.memory.buffers ?? 0
      },
      disk: {
        total: partial.disk?.total ?? this.latestResourceUtilization?.disk.total ?? 0,
        used: partial.disk?.used ?? this.latestResourceUtilization?.disk.used ?? 0,
        available: partial.disk?.available ?? this.latestResourceUtilization?.disk.available ?? 0,
        iops: partial.disk?.iops ?? this.latestResourceUtilization?.disk.iops ?? 0,
        latency: partial.disk?.latency ?? this.latestResourceUtilization?.disk.latency ?? 0
      },
      network: {
        bytesIn: partial.network?.bytesIn ?? this.latestResourceUtilization?.network.bytesIn ?? 0,
        bytesOut: partial.network?.bytesOut ?? this.latestResourceUtilization?.network.bytesOut ?? 0,
        packetsIn: partial.network?.packetsIn ?? this.latestResourceUtilization?.network.packetsIn ?? 0,
        packetsOut: partial.network?.packetsOut ?? this.latestResourceUtilization?.network.packetsOut ?? 0,
        errors: partial.network?.errors ?? this.latestResourceUtilization?.network.errors ?? 0,
        connections: partial.network?.connections ?? this.latestResourceUtilization?.network.connections ?? 0
      },
      gpu: partial.gpu || this.latestResourceUtilization?.gpu
    };

    this.latestResourceUtilization = utilization;
    this.emit('resourceUtilization', utilization);
    await this.recordMetric({
      name: 'cpu_utilization',
      value: utilization.cpu.usage,
      labels: {},
      timestamp: utilization.timestamp,
      nodeId: utilization.nodeId
    });
    if (utilization.memory.total > 0) {
      await this.recordMetric({
        name: 'memory_utilization',
        value: utilization.memory.used / utilization.memory.total,
        labels: {},
        timestamp: utilization.timestamp,
        nodeId: utilization.nodeId
      });
    }
    if (utilization.disk.total > 0) {
      await this.recordMetric({
        name: 'disk_utilization',
        value: utilization.disk.used / utilization.disk.total,
        labels: {},
        timestamp: utilization.timestamp,
        nodeId: utilization.nodeId
      });
    }
  }

  async predictResourceExhaustion(resourceType: 'memory' | 'disk' | 'cpu'): Promise<{
    timeToExhaustion?: number;
    confidence: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    const metricName = `${resourceType}_utilization`;
    const values = this.metricValues.get(metricName) || [];
    if (values.length < 2) {
      return { confidence: 0, trend: 'stable' };
    }

    const ordered = [...values].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const first = ordered[0];
    const last = ordered[ordered.length - 1];

    // Normalize values to [0,1] range: cpu is [0,100], others are already [0,1]
    const normalize = (val: number) => resourceType === 'cpu' ? val / 100 : val;
    const normalizedFirst = normalize(first.value);
    const normalizedLast = normalize(last.value);

    const elapsedMs = Math.max(last.timestamp.getTime() - first.timestamp.getTime(), 1);
    const slopePerMs = (normalizedLast - normalizedFirst) / elapsedMs;
    const trend = slopePerMs > 0 ? 'increasing' : slopePerMs < 0 ? 'decreasing' : 'stable';

    if (trend !== 'increasing' || slopePerMs === 0) {
      return { confidence: 0.8, trend };
    }

    const timeToExhaustion = (1 - normalizedLast) / slopePerMs;
    return {
      timeToExhaustion: Number.isFinite(timeToExhaustion) && timeToExhaustion > 0 ? timeToExhaustion : undefined,
      confidence: 0.85,
      trend
    };
  }

  async generateOptimizationRecommendations(): Promise<Recommendation[]> {
    const utilization = await this.getCurrentResourceUtilization();
    const recommendations: Recommendation[] = [];

    if (utilization.cpu.usage >= 85) {
      recommendations.push({
        type: 'scaling',
        priority: 'high',
        title: 'CPU saturation detected',
        description: 'CPU usage is consistently elevated.',
        action: 'Scale CPU capacity or reduce concurrent workload.',
        estimatedImpact: 0.8
      });
    }

    const memoryRatio = utilization.memory.total > 0 ? utilization.memory.used / utilization.memory.total : 0;
    if (memoryRatio >= 0.85) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: 'High memory pressure',
        description: 'Memory usage is close to the configured limit.',
        action: 'Reduce memory footprint or expand available memory.',
        estimatedImpact: 0.75
      });
    }

    if (utilization.disk.latency >= 25 || utilization.disk.iops >= 400) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Disk subsystem contention',
        description: 'Disk latency or IOPS suggests storage pressure.',
        action: 'Review storage throughput, hot paths, and disk sizing.',
        estimatedImpact: 0.55
      });
    }

    return recommendations;
  }

  async generateBaselines(metricName: string): Promise<PerformanceBaseline[]> {
    const values = this.metricValues.get(metricName) || [];
    if (values.length === 0) {
      return [];
    }

    const origin = Math.min(...values.map(value => value.timestamp.getTime()));
    const grouped = new Map<number, MetricValue[]>();

    for (const value of values) {
      const key = Math.round((value.timestamp.getTime() - origin) / (60 * 60 * 1000)) % 24;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(value);
    }

    const baselines: PerformanceBaseline[] = [];
    for (const [key, group] of grouped) {
      const avg = group.reduce((sum, item) => sum + item.value, 0) / group.length;
      const variance = group.reduce((sum, item) => sum + Math.pow(item.value - avg, 2), 0) / group.length;
      const baseline: PerformanceBaseline = {
        metric: metricName,
        nodeId: this.nodeId,
        timeOfDay: key,
        dayOfWeek: -1,
        expectedValue: avg,
        variance,
        confidence: Math.min(group.length / 14, 1),
        lastUpdated: new Date()
      };
      baselines.push(baseline);
      this.baselines.set(this.buildBaselineKey(metricName, this.nodeId, key, -1), baseline);
    }

    return baselines;
  }

  async recordBaseline(name: string, metrics: Record<string, number>): Promise<void> {
    this.namedBaselines.set(name, { ...metrics });
  }

  async recordMetrics(name: string, metrics: Record<string, number>): Promise<void> {
    this.namedMetricSnapshots.set(name, { ...metrics });
  }

  async detectPerformanceRegression(): Promise<{
    hasRegression: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedMetrics: string[];
  }> {
    const affectedMetrics = new Set<string>();

    for (const [name, baseline] of this.namedBaselines) {
      const current = this.namedMetricSnapshots.get(name);
      if (!current) {
        continue;
      }

      for (const [metric, baselineValue] of Object.entries(baseline)) {
        const currentValue = current[metric];
        if (currentValue === undefined) {
          continue;
        }

        const regression =
          ((metric.toLowerCase().includes('throughput') || metric.toLowerCase().includes('availability'))
            ? currentValue < baselineValue * 0.75
            : currentValue > baselineValue * 1.25);

        if (regression) {
          affectedMetrics.add(metric);
        }
      }
    }

    return {
      hasRegression: affectedMetrics.size > 0,
      severity: affectedMetrics.size >= 3 ? 'critical' : affectedMetrics.size >= 2 ? 'high' : affectedMetrics.size >= 1 ? 'medium' : 'low',
      affectedMetrics: Array.from(affectedMetrics)
    };
  }

  /**
   * Initialize metric definitions
   */
  private initializeMetrics(): void {
    const metricDefinitions = [
      {
        name: 'cpu_utilization',
        type: 'gauge' as const,
        unit: 'percent',
        description: 'CPU utilization percentage',
        labels: ['core'],
        aggregation: 'avg' as const,
        retention: 30
      },
      {
        name: 'memory_utilization',
        type: 'gauge' as const,
        unit: 'percent',
        description: 'Memory utilization percentage',
        labels: ['type'],
        aggregation: 'avg' as const,
        retention: 30
      },
      {
        name: 'disk_utilization',
        type: 'gauge' as const,
        unit: 'percent',
        description: 'Disk utilization percentage',
        labels: ['device'],
        aggregation: 'avg' as const,
        retention: 30
      },
      {
        name: 'network_throughput',
        type: 'gauge' as const,
        unit: 'bytes_per_second',
        description: 'Network throughput',
        labels: ['direction', 'interface'],
        aggregation: 'sum' as const,
        retention: 30
      },
      {
        name: 'cache_hit_ratio',
        type: 'gauge' as const,
        unit: 'percent',
        description: 'Cache hit ratio',
        labels: ['cache_type'],
        aggregation: 'avg' as const,
        retention: 30
      },
      {
        name: 'response_time',
        type: 'histogram' as const,
        unit: 'milliseconds',
        description: 'Response time for operations',
        labels: ['operation_type'],
        aggregation: 'avg' as const,
        retention: 30
      },
      {
        name: 'error_rate',
        type: 'counter' as const,
        unit: 'count',
        description: 'Error rate',
        labels: ['error_type'],
        aggregation: 'sum' as const,
        retention: 30
      },
      {
        name: 'sync_operations',
        type: 'counter' as const,
        unit: 'count',
        description: 'Number of sync operations',
        labels: ['operation'],
        aggregation: 'sum' as const,
        retention: 30
      },
      {
        name: 'knowledge_graph_size',
        type: 'gauge' as const,
        unit: 'count',
        description: 'Number of knowledge graph nodes',
        labels: ['type'],
        aggregation: 'sum' as const,
        retention: 30
      },
      {
        name: 'session_count',
        type: 'gauge' as const,
        unit: 'count',
        description: 'Number of active sessions',
        labels: ['status'],
        aggregation: 'sum' as const,
        retention: 30
      }
    ];

    for (const metricDef of metricDefinitions) {
      this.metrics.set(metricDef.name, metricDef);
    }
  }

  /**
   * Initialize performance thresholds
   */
  private initializeThresholds(): void {
    const thresholds: Array<{ metric: string; threshold: PerformanceThreshold }> = [
      {
        metric: 'cpu_utilization',
        threshold: {
          metric: 'cpu_utilization',
          condition: 'gt',
          value: 80,
          duration: 300, // 5 minutes
          severity: 'high'
        }
      },
      {
        metric: 'memory_utilization',
        threshold: {
          metric: 'memory_utilization',
          condition: 'gt',
          value: 90,
          duration: 180, // 3 minutes
          severity: 'critical'
        }
      },
      {
        metric: 'disk_utilization',
        threshold: {
          metric: 'disk_utilization',
          condition: 'gt',
          value: 85,
          duration: 600, // 10 minutes
          severity: 'high'
        }
      },
      {
        metric: 'response_time',
        threshold: {
          metric: 'response_time',
          condition: 'gt',
          value: 5000, // 5 seconds
          duration: 120, // 2 minutes
          severity: 'medium'
        }
      },
      {
        metric: 'error_rate',
        threshold: {
          metric: 'error_rate',
          condition: 'gt',
          value: 5, // 5%
          duration: 300, // 5 minutes
          severity: 'high'
        }
      },
      {
        metric: 'cache_hit_ratio',
        threshold: {
          metric: 'cache_hit_ratio',
          condition: 'lt',
          value: 60, // 60%
          duration: 600, // 10 minutes
          severity: 'medium'
        }
      }
    ];

    for (const { metric, threshold } of thresholds) {
      this.setThreshold(metric, threshold);
    }
  }

  /**
   * Initialize default dashboards
   */
  private initializeDashboards(): void {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // System Overview Dashboard
    const systemOverview: PerformanceDashboard = {
      id: 'system_overview',
      name: 'System Overview',
      refreshInterval: 30,
      timeRange: {
        from: oneHourAgo,
        to: now,
        step: 30
      },
      panels: [
        {
          id: 'cpu_panel',
          title: 'CPU Utilization',
          type: 'line_chart',
          metrics: ['cpu_utilization']
        },
        {
          id: 'memory_panel',
          title: 'Memory Utilization',
          type: 'line_chart',
          metrics: ['memory_utilization']
        },
        {
          id: 'disk_panel',
          title: 'Disk Utilization',
          type: 'line_chart',
          metrics: ['disk_utilization']
        },
        {
          id: 'network_panel',
          title: 'Network Throughput',
          type: 'line_chart',
          metrics: ['network_throughput']
        }
      ]
    };

    // Application Performance Dashboard
    const appPerformance: PerformanceDashboard = {
      id: 'app_performance',
      name: 'Application Performance',
      refreshInterval: 15,
      timeRange: {
        from: oneHourAgo,
        to: now,
        step: 15
      },
      panels: [
        {
          id: 'response_time_panel',
          title: 'Response Time',
          type: 'line_chart',
          metrics: ['response_time']
        },
        {
          id: 'cache_hit_panel',
          title: 'Cache Hit Ratio',
          type: 'gauge',
          metrics: ['cache_hit_ratio']
        },
        {
          id: 'error_rate_panel',
          title: 'Error Rate',
          type: 'line_chart',
          metrics: ['error_rate']
        },
        {
          id: 'sync_ops_panel',
          title: 'Sync Operations',
          type: 'bar_chart',
          metrics: ['sync_operations']
        }
      ]
    };

    this.createDashboard(systemOverview);
    this.createDashboard(appPerformance);
  }

  /**
   * Start monitoring processes
   */
  private startMonitoring(): void {
    // Metric collection
    this.collectionInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.collectionIntervalMs);

    // Performance analysis
    this.analysisInterval = setInterval(async () => {
      await this.performAnalysis();
    }, this.analysisIntervalMs);

    // Alert checking
    this.alertingInterval = setInterval(async () => {
      await this.checkAlerts();
    }, this.alertingIntervalMs);

    // Data cleanup
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupOldData();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Collect system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const utilization = await this.getCurrentResourceUtilization();

      // Record all the metrics
      await this.recordMetric('cpu_utilization', utilization.cpu.usage);
      await this.recordMetric('memory_utilization', utilization.memory.total > 0 ? (utilization.memory.used / utilization.memory.total) : 0);
      await this.recordMetric('disk_utilization', utilization.disk.total > 0 ? (utilization.disk.used / utilization.disk.total) : 0);
      await this.recordMetric('network_throughput', utilization.network.bytesIn + utilization.network.bytesOut, { direction: 'total' });

      if (utilization.gpu) {
        await this.recordMetric('gpu_utilization', utilization.gpu.usage);
        await this.recordMetric('gpu_temperature', utilization.gpu.temperature);
        await this.recordMetric('gpu_power', utilization.gpu.powerUsage);
      }

      this.emit('metricsCollected', utilization);
    } catch (error) {
      this.emit('metricsCollectionError', error);
    }
  }

  /**
   * Perform performance analysis
   */
  private async performAnalysis(): Promise<void> {
    try {
      // Update baselines
      await this.updateBaselines();

      // Detect anomalies
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      await this.detectAnomalies({ from: oneHourAgo, to: now, step: 60 });

      // Analyze trends
      const metricNames = Array.from(this.metrics.keys());
      await this.analyzeTrends(metricNames, { from: oneHourAgo, to: now, step: 60 });

    } catch (error) {
      this.emit('analysisError', error);
    }
  }

  /**
   * Update performance baselines
   */
  private async updateBaselines(): Promise<void> {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfWeek = now.getDay();

    for (const metricName of this.metrics.keys()) {
      const baselineKey = `${metricName}_${this.nodeId}`;
      const baseline = await this.baselineCalculator.calculate(
        metricName,
        timeOfDay,
        dayOfWeek,
        this.metricValues.get(metricName) || []
      );

      if (baseline) {
        this.baselines.set(baselineKey, baseline);
      }
    }
  }

  // Helper methods for system metrics (placeholder implementations)
  private async getCPUUsage(): Promise<number> { return Math.random() * 100; }
  private async getCPUCores(): Promise<number> { return 16; }
  private async getLoadAverage(): Promise<number[]> { return [1.5, 1.2, 1.0]; }
  private async getTotalMemory(): Promise<number> { return 16 * 1024 * 1024 * 1024; }
  private async getUsedMemory(): Promise<number> { return 8 * 1024 * 1024 * 1024; }
  private async getAvailableMemory(): Promise<number> { return 8 * 1024 * 1024 * 1024; }
  private async getCachedMemory(): Promise<number> { return 2 * 1024 * 1024 * 1024; }
  private async getBufferMemory(): Promise<number> { return 512 * 1024 * 1024; }
  private async getTotalDisk(): Promise<number> { return 1024 * 1024 * 1024 * 1024; }
  private async getUsedDisk(): Promise<number> { return 256 * 1024 * 1024 * 1024; }
  private async getAvailableDisk(): Promise<number> { return 768 * 1024 * 1024 * 1024; }
  private async getDiskIOPS(): Promise<number> { return 1000; }
  private async getDiskLatency(): Promise<number> { return 5; }
  private async getNetworkBytesIn(): Promise<number> { return 1024 * 1024; }
  private async getNetworkBytesOut(): Promise<number> { return 512 * 1024; }
  private async getNetworkPacketsIn(): Promise<number> { return 1000; }
  private async getNetworkPacketsOut(): Promise<number> { return 800; }
  private async getNetworkErrors(): Promise<number> { return 0; }
  private async getNetworkConnections(): Promise<number> { return 150; }
  private async hasGPU(): Promise<boolean> { return true; }
  private async getGPUUsage(): Promise<number> { return Math.random() * 100; }
  private async getGPUMemory(): Promise<number> { return Math.random() * 100; }
  private async getGPUTemperature(): Promise<number> { return 65 + Math.random() * 20; }
  private async getGPUPowerUsage(): Promise<number> { return 200 + Math.random() * 100; }

  // Placeholder implementations for complex methods
  private async analyzeComponents(): Promise<ComponentHealth[]> { return []; }
  private calculateHealthSummary(components: ComponentHealth[]): HealthSummary {
    return {
      cpuUtilization: 0,
      memoryUtilization: 0,
      diskUtilization: 0,
      networkThroughput: 0,
      errorRate: 0,
      responseTime: 0,
      availability: 100
    };
  }
  private async generateRecommendations(components: ComponentHealth[], summary: HealthSummary): Promise<Recommendation[]> { return []; }
  private determineOverallHealth(components: ComponentHealth[]): 'healthy' | 'warning' | 'critical' { return 'healthy'; }
  private getPanelData(panel: DashboardPanel, timeRange: TimeRange): any { return {}; }
  private async evaluateThreshold(metricName: string, threshold: PerformanceThreshold): Promise<boolean> {
    const values = this.metricValues.get(metricName) || [];
    if (values.length === 0) {
      return false;
    }

    const latest = values[values.length - 1];
    return this.matchesThreshold(latest.value, threshold)
      && (Date.now() - latest.timestamp.getTime()) >= (threshold.duration * 1000);
  }

  private async createAlert(metricName: string, threshold: PerformanceThreshold): Promise<void> {
    const values = this.metricValues.get(metricName) || [];
    const latest = values[values.length - 1];
    if (!latest) {
      return;
    }

    const existing = Array.from(this.alerts.values()).find(alert =>
      alert.metric === metricName &&
      alert.threshold === threshold.value &&
      alert.status !== 'resolved'
    );
    if (existing) {
      return;
    }

    const alert = await this.alertManager.createAlert(metricName, threshold, latest.value);
    try {
      this.emit('alert', alert);
    } catch {
      // Listener failures should not break monitoring.
    }
  }
  private async cleanupOldData(): Promise<void> { }

  destroy(): void {
    if (this.collectionInterval) clearInterval(this.collectionInterval);
    if (this.analysisInterval) clearInterval(this.analysisInterval);
    if (this.alertingInterval) clearInterval(this.alertingInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.removeAllListeners();
  }

  private normalizeMetricInput(
    nameOrMetric: string | MetricValue,
    value?: number,
    labels: Record<string, string> = {}
  ): MetricValue | null {
    if (typeof nameOrMetric === 'string') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        return null;
      }

      return {
        name: nameOrMetric,
        value,
        labels: { nodeId: this.nodeId, ...labels },
        timestamp: new Date(),
        nodeId: this.nodeId
      };
    }

    if (
      !nameOrMetric ||
      typeof nameOrMetric.name !== 'string' ||
      typeof nameOrMetric.value !== 'number' ||
      Number.isNaN(nameOrMetric.value)
    ) {
      return null;
    }

    const timestamp = nameOrMetric.timestamp instanceof Date && !Number.isNaN(nameOrMetric.timestamp.getTime())
      ? nameOrMetric.timestamp
      : new Date();

    return {
      name: nameOrMetric.name,
      value: nameOrMetric.value,
      labels: nameOrMetric.labels && typeof nameOrMetric.labels === 'object'
        ? { nodeId: this.nodeId, ...nameOrMetric.labels }
        : { nodeId: this.nodeId },
      timestamp,
      nodeId: nameOrMetric.nodeId || this.nodeId
    };
  }

  private createFullRangeForMetric(metricName: string): TimeRange {
    const values = this.metricValues.get(metricName) || [];
    const from = values[0]?.timestamp || new Date(Date.now() - 24 * 60 * 60 * 1000);
    const to = values[values.length - 1]?.timestamp || new Date();
    return { from, to, step: 60 };
  }

  private buildBaselineKey(metric: string, nodeId: string, timeOfDay: number, dayOfWeek: number): string {
    return `${metric}_${nodeId}_${dayOfWeek}_${timeOfDay}`;
  }

  private getBaselineForMetric(metricName: string, timestamp = new Date()): PerformanceBaseline | undefined {
    const key = this.buildBaselineKey(metricName, this.nodeId, timestamp.getHours(), timestamp.getDay());
    return this.baselines.get(key)
      || this.baselines.get(this.buildBaselineKey(metricName, this.nodeId, timestamp.getHours(), -1))
      || Array.from(this.baselines.values()).find(baseline => baseline.metric === metricName);
  }

  private matchesThreshold(value: number, threshold: PerformanceThreshold): boolean {
    switch (threshold.condition) {
      case 'gt': return value > threshold.value;
      case 'gte': return value >= threshold.value;
      case 'lt': return value < threshold.value;
      case 'lte': return value <= threshold.value;
      case 'eq': return value === threshold.value;
      default: return false;
    }
  }

  private async scheduleThresholdEvaluation(metricName: string): Promise<void> {
    const thresholds = this.thresholds.get(metricName) || [];
    for (const threshold of thresholds) {
      setTimeout(async () => {
        try {
          if (await this.evaluateThreshold(metricName, threshold)) {
            const satisfied: PerformanceThreshold[] = [];
            for (const candidate of thresholds) {
              if (await this.evaluateThreshold(metricName, candidate)) {
                satisfied.push(candidate);
              }
            }
            const thresholdToAlert = satisfied.sort((left, right) =>
              this.getSeverityRank(right.severity) - this.getSeverityRank(left.severity)
            )[0];

            if (thresholdToAlert) {
              await this.createAlert(metricName, thresholdToAlert);
            }
          }
        } catch {
          // Timer-based threshold checks should not crash monitoring.
        }
      }, threshold.duration * 1000);
    }
  }

  private getSeverityRank(severity: Alert['severity']): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  private async checkAlerts(): Promise<void> {
    for (const [metricName, thresholds] of this.thresholds) {
      const satisfied: PerformanceThreshold[] = [];
      for (const threshold of thresholds) {
        if (await this.evaluateThreshold(metricName, threshold)) {
          satisfied.push(threshold);
        }
      }

      const thresholdToAlert = satisfied.sort((left, right) =>
        this.getSeverityRank(right.severity) - this.getSeverityRank(left.severity)
      )[0];

      if (thresholdToAlert) {
        await this.createAlert(metricName, thresholdToAlert);
      }
    }
  }
}

// Supporting classes (simplified implementations)

class TrendAnalyzer {
  async analyze(metricName: string, values: MetricValue[]): Promise<PerformanceTrend> {
    if (values.length < 2) {
      return {
        metric: metricName,
        direction: 'stable',
        rate: 0,
        confidence: 0,
        prediction: []
      };
    }

    const ordered = [...values].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const first = ordered[0];
    const last = ordered[ordered.length - 1];
    const elapsedHours = Math.max((last.timestamp.getTime() - first.timestamp.getTime()) / (60 * 60 * 1000), 1 / 3600);
    const rate = (last.value - first.value) / elapsedHours;
    const direction = rate > 0.01 ? 'degrading' : rate < -0.01 ? 'improving' : 'stable';
    const mean = ordered.reduce((sum, value) => sum + value.value, 0) / ordered.length;
    const variance = ordered.reduce((sum, value) => sum + Math.pow(value.value - mean, 2), 0) / ordered.length;
    const noise = Math.sqrt(variance);
    const confidence = Math.max(0.5, Math.min(0.99, Math.abs(last.value - first.value) / Math.max(noise, 1)));

    return {
      metric: metricName,
      direction,
      rate,
      confidence,
      prediction: []
    };
  }
}

class AnomalyDetector {
  async detect(values: MetricValue[], baseline: PerformanceBaseline): Promise<PerformanceAnomaly[]> {
    const anomalies: PerformanceAnomaly[] = [];
    const threshold = Math.max(Math.sqrt(Math.max(baseline.variance, 0)), 1);

    for (const value of values) {
      const deviation = Math.abs(value.value - baseline.expectedValue);
      if (deviation > threshold * 3) {
        anomalies.push({
          metric: value.name,
          value: value.value,
          expectedValue: baseline.expectedValue,
          deviation,
          timestamp: value.timestamp,
          severity: deviation / threshold
        });
      }
    }

    return anomalies;
  }
}

class BaselineCalculator {
  async calculate(
    metricName: string,
    timeOfDay: number,
    dayOfWeek: number,
    values: MetricValue[]
  ): Promise<PerformanceBaseline | null> {
    if (values.length < 10) return null;

    const recentValues = values.slice(-100); // Last 100 values
    const sum = recentValues.reduce((acc, v) => acc + v.value, 0);
    const avg = sum / recentValues.length;
    const variance = recentValues.reduce((acc, v) => acc + Math.pow(v.value - avg, 2), 0) / recentValues.length;

    return {
      metric: metricName,
      timeOfDay,
      dayOfWeek,
      expectedValue: avg,
      variance,
      confidence: Math.min(recentValues.length / 100, 1),
      lastUpdated: new Date()
    };
  }
}

class AlertManager {
  constructor(private monitor: PerformanceMonitor) {}

  async createAlert(metric: string, threshold: PerformanceThreshold, value: number): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'threshold_exceeded',
      severity: threshold.severity,
      title: `${metric} threshold exceeded`,
      description: `${metric} value ${value} exceeded threshold ${threshold.value}`,
      nodeId: this.monitor['nodeId'],
      metric,
      value,
      threshold: threshold.value,
      timestamp: new Date(),
      status: 'open'
    };

    this.monitor['alerts'].set(alert.id, alert);
    try {
      this.monitor.emit('alertCreated', alert);
    } catch {
      // Listener failures should not surface as unhandled rejections.
    }

    return alert;
  }
}

// Type definitions
export interface PerformanceAnomaly {
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  timestamp: Date;
  severity: number;
}

export interface DashboardData {
  dashboard: PerformanceDashboard;
  panels: Array<{
    panel: DashboardPanel;
    data: any;
  }>;
  lastUpdated: Date;
}
