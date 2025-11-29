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
  private alertingIntervalMs = 15000; // 15 seconds
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
  recordMetric(name: string, value: number, labels: Record<string, string> = {}): void {
    const metric: MetricValue = {
      name,
      value,
      labels: { nodeId: this.nodeId, ...labels },
      timestamp: new Date(),
      nodeId: this.nodeId
    };

    if (!this.metricValues.has(name)) {
      this.metricValues.set(name, []);
    }

    this.metricValues.get(name)!.push(metric);

    // Emit metric event for real-time processing
    this.emit('metricRecorded', metric);
  }

  /**
   * Get metric values within time range
   */
  getMetrics(name: string, timeRange: TimeRange, labels?: Record<string, string>): MetricValue[] {
    const values = this.metricValues.get(name) || [];

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
  async analyzeTrends(metrics: string[], timeRange: TimeRange): Promise<PerformanceTrend[]> {
    const trends: PerformanceTrend[] = [];

    for (const metricName of metrics) {
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
  async detectAnomalies(timeRange: TimeRange): Promise<PerformanceAnomaly[]> {
    const anomalies: PerformanceAnomaly[] = [];

    for (const metricName of this.metrics.keys()) {
      const values = this.getMetrics(metricName, timeRange);
      const baseline = this.baselines.get(`${metricName}_${this.nodeId}`);

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
    return utilization;
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
      this.recordMetric('cpu_utilization', utilization.cpu.usage);
      this.recordMetric('memory_utilization', (utilization.memory.used / utilization.memory.total) * 100);
      this.recordMetric('disk_utilization', (utilization.disk.used / utilization.disk.total) * 100);
      this.recordMetric('network_throughput', utilization.network.bytesIn + utilization.network.bytesOut, { direction: 'total' });

      if (utilization.gpu) {
        this.recordMetric('gpu_utilization', utilization.gpu.usage);
        this.recordMetric('gpu_temperature', utilization.gpu.temperature);
        this.recordMetric('gpu_power', utilization.gpu.powerUsage);
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
   * Check for alert conditions
   */
  private async checkAlerts(): Promise<void> {
    for (const [metricName, thresholds] of this.thresholds) {
      for (const threshold of thresholds) {
        const alertTriggered = await this.evaluateThreshold(metricName, threshold);
        if (alertTriggered) {
          await this.createAlert(metricName, threshold);
        }
      }
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
  private async evaluateThreshold(metricName: string, threshold: PerformanceThreshold): Promise<boolean> { return false; }
  private async createAlert(metricName: string, threshold: PerformanceThreshold): Promise<void> { }
  private async cleanupOldData(): Promise<void> { }

  destroy(): void {
    if (this.collectionInterval) clearInterval(this.collectionInterval);
    if (this.analysisInterval) clearInterval(this.analysisInterval);
    if (this.alertingInterval) clearInterval(this.alertingInterval);
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.removeAllListeners();
  }
}

// Supporting classes (simplified implementations)

class TrendAnalyzer {
  async analyze(metricName: string, values: MetricValue[]): Promise<PerformanceTrend> {
    // Simplified trend analysis
    return {
      metric: metricName,
      direction: 'stable',
      rate: 0,
      confidence: 0.5,
      prediction: []
    };
  }
}

class AnomalyDetector {
  async detect(values: MetricValue[], baseline: PerformanceBaseline): Promise<PerformanceAnomaly[]> {
    // Simplified anomaly detection
    return [];
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
    this.monitor.emit('alertCreated', alert);

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
  severity: 'low' | 'medium' | 'high';
}

export interface DashboardData {
  dashboard: PerformanceDashboard;
  panels: Array<{
    panel: DashboardPanel;
    data: any;
  }>;
  lastUpdated: Date;
}