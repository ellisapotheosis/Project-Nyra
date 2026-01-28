/**
 * Critical Missing Tests: PerformanceMonitor Core Functions
 * Tests the untested anomaly detection, alerting, and baseline calculation logic
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PerformanceMonitor } from '../../../src/monitoring/performance-monitor';

describe('PerformanceMonitor - Core Functions (CRITICAL GAPS)', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor('test-node');
  });

  afterEach(async () => {
    await performanceMonitor?.destroy();
  });

  describe('Anomaly Detection - UNTESTED', () => {
    it('should detect performance anomalies using statistical analysis', async () => {
      // CRITICAL: Test anomaly detection algorithms
      const normalMetrics = Array(100).fill(0).map((_, i) => ({
        name: 'response_time',
        value: 100 + Math.random() * 20, // Normal: 100-120ms
        labels: { service: 'cache' },
        timestamp: new Date(Date.now() - i * 60000), // 1 minute intervals
        nodeId: 'test-node'
      }));

      const anomalousMetrics = [
        {
          name: 'response_time',
          value: 500, // Anomaly: 5x normal
          labels: { service: 'cache' },
          timestamp: new Date(),
          nodeId: 'test-node'
        }
      ];

      // Record normal baseline
      for (const metric of normalMetrics) {
        await performanceMonitor.recordMetric(metric);
      }

      // MISSING: Test detectAnomalies() method
      const baselineResult = await performanceMonitor.calculateBaseline('response_time');
      expect(baselineResult.mean).toBeCloseTo(110, -1);
      expect(baselineResult.standardDeviation).toBeLessThan(20);

      // Record anomaly and detect
      await performanceMonitor.recordMetric(anomalousMetrics[0]);

      const anomalies = await performanceMonitor.detectAnomalies('response_time', {
        method: 'statistical',
        threshold: 2.5, // 2.5 standard deviations
        timeWindow: 3600000 // 1 hour
      });

      expect(anomalies.length).toBe(1);
      expect(anomalies[0].severity).toBe('high');
      expect(anomalies[0].deviationFactor).toBeGreaterThan(2.5);
    });

    it('should use machine learning for anomaly detection', async () => {
      // CRITICAL: Test ML-based anomaly detection
      const trainingData = Array(500).fill(0).map((_, i) => ({
        timestamp: Date.now() - i * 60000,
        features: {
          responseTime: 100 + Math.sin(i * 0.1) * 10, // Seasonal pattern
          cpuUsage: 50 + Math.random() * 10,
          memoryUsage: 60 + Math.random() * 15,
          requestRate: 100 + Math.random() * 20
        },
        isAnomaly: false
      }));

      // Add some known anomalies to training data
      trainingData.push(
        {
          timestamp: Date.now(),
          features: { responseTime: 800, cpuUsage: 95, memoryUsage: 90, requestRate: 200 },
          isAnomaly: true
        },
        {
          timestamp: Date.now() - 300000,
          features: { responseTime: 50, cpuUsage: 10, memoryUsage: 20, requestRate: 5 },
          isAnomaly: true
        }
      );

      // Train anomaly detection model
      const model = await performanceMonitor.trainAnomalyDetectionModel(trainingData);
      expect(model.accuracy).toBeGreaterThan(0.8);
      expect(model.falsePositiveRate).toBeLessThan(0.1);

      // Test detection on new data
      const testCase = {
        responseTime: 750,
        cpuUsage: 92,
        memoryUsage: 88,
        requestRate: 180
      };

      const prediction = await performanceMonitor.predictAnomaly(testCase);
      expect(prediction.isAnomaly).toBe(true);
      expect(prediction.confidence).toBeGreaterThan(0.7);
    });

    it('should detect multi-dimensional anomalies', async () => {
      // CRITICAL: Test complex anomaly patterns
      const metrics = [
        { name: 'cpu_usage', baseline: 50, current: 45 }, // Normal
        { name: 'memory_usage', baseline: 60, current: 85 }, // High
        { name: 'response_time', baseline: 100, current: 300 }, // Very high
        { name: 'error_rate', baseline: 0.01, current: 0.15 } // Very high
      ];

      const correlationMatrix = await performanceMonitor.calculateCorrelationMatrix(
        metrics.map(m => m.name)
      );

      const multiDimensionalAnomaly = await performanceMonitor.detectMultiDimensionalAnomaly(
        metrics,
        correlationMatrix
      );

      expect(multiDimensionalAnomaly.detected).toBe(true);
      expect(multiDimensionalAnomaly.suspiciousMetrics).toContain('memory_usage');
      expect(multiDimensionalAnomaly.suspiciousMetrics).toContain('response_time');
      expect(multiDimensionalAnomaly.suspiciousMetrics).toContain('error_rate');
      expect(multiDimensionalAnomaly.anomalyScore).toBeGreaterThan(0.7);
    });
  });

  describe('Alert System - UNTESTED', () => {
    it('should generate alerts based on thresholds', async () => {
      // CRITICAL: Test alert generation logic
      const threshold = {
        metric: 'cpu_usage',
        condition: 'gt' as const,
        value: 80,
        duration: 300000, // 5 minutes
        severity: 'high' as const
      };

      await performanceMonitor.addThreshold(threshold);

      // Simulate metrics exceeding threshold
      const highCpuMetrics = Array(6).fill(0).map((_, i) => ({
        name: 'cpu_usage',
        value: 85,
        labels: { server: 'worker-1' },
        timestamp: new Date(Date.now() - (5 - i) * 60000), // 5 minutes of high CPU
        nodeId: 'test-node'
      }));

      for (const metric of highCpuMetrics) {
        await performanceMonitor.recordMetric(metric);
      }

      // MISSING: Test triggerAlerts() method
      const alerts = await performanceMonitor.triggerAlerts();

      expect(alerts.length).toBeGreaterThan(0);

      const cpuAlert = alerts.find(a => a.metric === 'cpu_usage');
      expect(cpuAlert).toBeDefined();
      expect(cpuAlert?.severity).toBe('high');
      expect(cpuAlert?.status).toBe('open');
      expect(cpuAlert?.value).toBe(85);
    });

    it('should escalate alerts based on duration and severity', async () => {
      // CRITICAL: Test alert escalation
      const criticalAlert = {
        id: 'alert-1',
        type: 'performance_degradation',
        severity: 'critical' as const,
        title: 'System Overload',
        description: 'Multiple metrics exceeding thresholds',
        nodeId: 'test-node',
        metric: 'system_health',
        value: 0.2,
        threshold: 0.5,
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        status: 'open' as const
      };

      await performanceMonitor.createAlert(criticalAlert);

      // Run escalation check
      const escalatedAlerts = await performanceMonitor.checkEscalation();

      expect(escalatedAlerts.length).toBe(1);

      const escalated = escalatedAlerts[0];
      expect(escalated.escalationLevel).toBeGreaterThan(0);
      expect(escalated.notificationsSent).toContain('email');
      expect(escalated.lastEscalated).toBeInstanceOf(Date);
    });

    it('should auto-resolve alerts when conditions normalize', async () => {
      // CRITICAL: Test alert auto-resolution
      const alert = {
        id: 'auto-resolve-test',
        type: 'high_response_time',
        severity: 'medium' as const,
        metric: 'response_time',
        value: 500,
        threshold: 200,
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        status: 'open' as const,
        nodeId: 'test-node',
        title: 'High Response Time',
        description: 'Response time exceeding threshold'
      };

      await performanceMonitor.createAlert(alert);

      // Record metrics showing recovery
      const recoveryMetrics = Array(5).fill(0).map((_, i) => ({
        name: 'response_time',
        value: 150, // Back to normal
        timestamp: new Date(Date.now() - (4 - i) * 60000),
        labels: {},
        nodeId: 'test-node'
      }));

      for (const metric of recoveryMetrics) {
        await performanceMonitor.recordMetric(metric);
      }

      // Check for auto-resolution
      const resolvedAlerts = await performanceMonitor.checkAutoResolution();

      expect(resolvedAlerts.length).toBe(1);
      expect(resolvedAlerts[0].id).toBe(alert.id);
      expect(resolvedAlerts[0].status).toBe('resolved');
      expect(resolvedAlerts[0].resolvedAt).toBeInstanceOf(Date);
    });
  });

  describe('Baseline Calculation - UNTESTED', () => {
    it('should calculate performance baselines by time patterns', async () => {
      // CRITICAL: Test baseline calculation logic
      const timePatternData = Array(168).fill(0).map((_, hour) => ({
        name: 'request_rate',
        value: 100 + Math.sin(hour * Math.PI / 12) * 30 + Math.random() * 10, // Daily pattern
        timestamp: new Date(Date.now() - (168 - hour) * 3600000), // 1 week of hourly data
        labels: { service: 'api' },
        nodeId: 'test-node'
      }));

      for (const metric of timePatternData) {
        await performanceMonitor.recordMetric(metric);
      }

      // MISSING: Test calculateBaselines() method
      const baselines = await performanceMonitor.calculateBaselines('request_rate', {
        granularity: 'hourly',
        timeWindow: 604800000, // 1 week
        patterns: ['daily', 'weekly']
      });

      expect(baselines.length).toBe(24); // 24 hours

      // Morning hours should have different baseline than evening
      const morningBaseline = baselines.find(b => b.timeOfDay === 9);
      const eveningBaseline = baselines.find(b => b.timeOfDay === 21);

      expect(morningBaseline?.expectedValue).not.toBeCloseTo(
        eveningBaseline?.expectedValue,
        0
      );
    });

    it('should adapt baselines to seasonal changes', async () => {
      // CRITICAL: Test adaptive baseline calculation
      const seasonalData = Array(90).fill(0).map((_, day) => {
        const seasonalFactor = 1 + Math.sin(day * Math.PI / 45) * 0.3; // 90-day seasonal pattern
        return {
          name: 'transaction_volume',
          value: 1000 * seasonalFactor + Math.random() * 100,
          timestamp: new Date(Date.now() - (90 - day) * 86400000), // 90 days of daily data
          labels: { type: 'business' },
          nodeId: 'test-node'
        };
      });

      for (const metric of seasonalData) {
        await performanceMonitor.recordMetric(metric);
      }

      const adaptiveBaseline = await performanceMonitor.calculateAdaptiveBaseline(
        'transaction_volume',
        {
          adaptationRate: 0.1,
          seasonalityPeriod: 90,
          trendDetection: true
        }
      );

      expect(adaptiveBaseline.trendDetected).toBe(true);
      expect(adaptiveBaseline.seasonalityStrength).toBeGreaterThan(0.5);
      expect(adaptiveBaseline.currentBaseline).toBeGreaterThan(
        adaptiveBaseline.historicalBaseline
      );
    });

    it('should detect baseline shifts and anomalies', async () => {
      // CRITICAL: Test baseline shift detection
      const stableData = Array(50).fill(0).map((_, i) => ({
        name: 'memory_usage',
        value: 60 + Math.random() * 5, // Stable around 60%
        timestamp: new Date(Date.now() - (100 - i) * 3600000),
        labels: {},
        nodeId: 'test-node'
      }));

      const shiftedData = Array(50).fill(0).map((_, i) => ({
        name: 'memory_usage',
        value: 75 + Math.random() * 5, // Shift to 75%
        timestamp: new Date(Date.now() - (50 - i) * 3600000),
        labels: {},
        nodeId: 'test-node'
      }));

      // Record stable period
      for (const metric of stableData) {
        await performanceMonitor.recordMetric(metric);
      }

      const initialBaseline = await performanceMonitor.calculateBaseline('memory_usage');
      expect(initialBaseline.mean).toBeCloseTo(60, 0);

      // Record shifted period
      for (const metric of shiftedData) {
        await performanceMonitor.recordMetric(metric);
      }

      const shiftDetection = await performanceMonitor.detectBaselineShift('memory_usage');

      expect(shiftDetection.detected).toBe(true);
      expect(shiftDetection.shiftMagnitude).toBeCloseTo(15, 0);
      expect(shiftDetection.confidence).toBeGreaterThan(0.8);
      expect(shiftDetection.newBaseline).toBeCloseTo(75, 0);
    });
  });

  describe('Health Report Generation - UNTESTED', () => {
    it('should generate comprehensive system health reports', async () => {
      // CRITICAL: Test health report generation
      const mockSystemMetrics = {
        cpu: { usage: 65, cores: 8, loadAverage: [1.2, 1.1, 1.0] },
        memory: { used: 8589934592, total: 17179869184, available: 8589934592 },
        disk: { used: 500000000000, total: 1000000000000, iops: 150 },
        network: { bytesIn: 1048576000, bytesOut: 524288000, errors: 5 }
      };

      await performanceMonitor.recordSystemMetrics(mockSystemMetrics);

      // MISSING: Test generateHealthReports() method
      const healthReport = await performanceMonitor.generateHealthReport();

      expect(healthReport.nodeId).toBe('test-node');
      expect(healthReport.timestamp).toBeInstanceOf(Date);
      expect(healthReport.overall_health).toMatch(/healthy|warning|critical/);

      expect(healthReport.components).toContainEqual(
        expect.objectContaining({
          component: 'cpu',
          status: expect.stringMatching(/healthy|warning|critical/)
        })
      );

      expect(healthReport.summary.cpuUtilization).toBe(65);
      expect(healthReport.summary.memoryUtilization).toBeCloseTo(0.5, 1);
      expect(healthReport.recommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should prioritize recommendations by impact and urgency', async () => {
      // CRITICAL: Test recommendation prioritization
      const criticalMetrics = {
        cpu: { usage: 95 },
        memory: { used: 16106127360, total: 17179869184 }, // 93.75% usage
        disk: { iops: 500, latency: 50 },
        errors: { rate: 0.15, count: 1500 }
      };

      await performanceMonitor.recordSystemMetrics(criticalMetrics);

      const healthReport = await performanceMonitor.generateHealthReport();

      expect(healthReport.overall_health).toBe('critical');
      expect(healthReport.recommendations.length).toBeGreaterThan(0);

      const sortedRecommendations = healthReport.recommendations.sort(
        (a, b) => b.priority === 'critical' ? 1 : -1
      );

      const criticalRec = sortedRecommendations[0];
      expect(criticalRec.priority).toBe('critical');
      expect(criticalRec.type).toMatch(/scaling|optimization|maintenance/);
      expect(criticalRec.estimatedImpact).toBeGreaterThan(0.5);
    });
  });

  describe('Performance Trend Analysis - UNTESTED', () => {
    it('should identify performance trends and predict future issues', async () => {
      // CRITICAL: Test trend analysis
      const trendData = Array(30).fill(0).map((_, day) => ({
        name: 'database_connections',
        value: 50 + day * 2 + Math.random() * 5, // Growing trend
        timestamp: new Date(Date.now() - (30 - day) * 86400000), // 30 days
        labels: { database: 'primary' },
        nodeId: 'test-node'
      }));

      for (const metric of trendData) {
        await performanceMonitor.recordMetric(metric);
      }

      const trendAnalysis = await performanceMonitor.analyzeTrend('database_connections');

      expect(trendAnalysis.direction).toBe('increasing');
      expect(trendAnalysis.rate).toBeGreaterThan(1.5); // ~2 connections per day
      expect(trendAnalysis.confidence).toBeGreaterThan(0.8);

      // Should predict future values
      expect(trendAnalysis.prediction.length).toBeGreaterThan(0);

      const futureValue = trendAnalysis.prediction.find(
        p => p.timestamp > Date.now() + 86400000 * 7 // 1 week ahead
      );
      expect(futureValue?.value).toBeGreaterThan(
        trendData[trendData.length - 1].value
      );
    });

    it('should detect performance degradation patterns', async () => {
      // CRITICAL: Test degradation detection
      const degradationData = Array(20).fill(0).map((_, i) => {
        const degradationFactor = 1 + i * 0.05; // 5% degradation per interval
        return {
          name: 'api_response_time',
          value: 100 * degradationFactor + Math.random() * 10,
          timestamp: new Date(Date.now() - (20 - i) * 3600000), // Hourly data
          labels: { endpoint: '/api/quotes' },
          nodeId: 'test-node'
        };
      });

      for (const metric of degradationData) {
        await performanceMonitor.recordMetric(metric);
      }

      const degradationAnalysis = await performanceMonitor.detectDegradation(
        'api_response_time'
      );

      expect(degradationAnalysis.detected).toBe(true);
      expect(degradationAnalysis.severity).toBe('high');
      expect(degradationAnalysis.degradationRate).toBeGreaterThan(0.04); // >4% per hour
      expect(degradationAnalysis.estimatedTimeToFailure).toBeLessThan(
        86400000 // Less than 24 hours
      );
    });
  });

  describe('Memory and Resource Management - MISSING COVERAGE', () => {
    it('should prevent memory leaks in metric storage', async () => {
      // CRITICAL: Test memory leak prevention
      const initialMemory = process.memoryUsage().heapUsed;

      // Generate large amount of metrics
      for (let i = 0; i < 10000; i++) {
        await performanceMonitor.recordMetric({
          name: `test_metric_${i % 100}`,
          value: Math.random() * 100,
          timestamp: new Date(Date.now() - i * 1000),
          labels: { iteration: i.toString() },
          nodeId: 'test-node'
        });
      }

      // Trigger cleanup
      await performanceMonitor.performCleanup();

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = finalMemory - initialMemory;

      // Memory growth should be reasonable (less than 50MB)
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);

      // Should maintain only recent metrics
      const storedMetrics = await performanceMonitor.getMetricCount();
      expect(storedMetrics).toBeLessThan(5000); // Should have cleaned old metrics
    });

    it('should handle high-frequency metric ingestion', async () => {
      // CRITICAL: Test high throughput performance
      const metricsPerSecond = 1000;
      const durationSeconds = 10;
      const totalMetrics = metricsPerSecond * durationSeconds;

      const start = Date.now();

      const promises = Array(totalMetrics).fill(0).map(async (_, i) => {
        return performanceMonitor.recordMetric({
          name: 'high_frequency_test',
          value: Math.random() * 100,
          timestamp: new Date(start + i),
          labels: { batch: Math.floor(i / 1000).toString() },
          nodeId: 'test-node'
        });
      });

      await Promise.all(promises);
      const duration = Date.now() - start;

      // Should process all metrics within reasonable time
      expect(duration).toBeLessThan(30000); // Less than 30 seconds

      // Should maintain performance metrics accuracy
      const stats = await performanceMonitor.getIngestionStats();
      expect(stats.metricsPerSecond).toBeGreaterThan(metricsPerSecond * 0.8);
      expect(stats.errorRate).toBeLessThan(0.01);
    });
  });
});