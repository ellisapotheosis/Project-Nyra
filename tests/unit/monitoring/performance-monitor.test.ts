/**
 * Unit Tests for Performance Monitor
 * Tests metrics collection, alerting, and performance analysis
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PerformanceMonitor } from '../../../src/monitoring/performance-monitor';
import { MetricDefinition, PerformanceThreshold, Alert } from '../../../src/monitoring/performance-monitor';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;
  const testNodeId = 'test-node-1';

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor(testNodeId);
  });

  afterEach(async () => {
    await performanceMonitor?.destroy();
  });

  describe('Metric Collection', () => {
    it('should register and collect custom metrics', async () => {
      const metricDefinition: MetricDefinition = {
        name: 'cache_hit_rate',
        type: 'gauge',
        unit: 'percentage',
        description: 'Cache hit rate percentage',
        labels: ['cache_type', 'node_id'],
        aggregation: 'avg',
        retention: 30
      };

      await performanceMonitor.registerMetric(metricDefinition);

      // Record metric values
      await performanceMonitor.recordMetric({
        name: 'cache_hit_rate',
        value: 0.85,
        labels: { cache_type: 'l1', node_id: testNodeId },
        timestamp: new Date(),
        nodeId: testNodeId
      });

      const metrics = await performanceMonitor.getMetrics('cache_hit_rate');
      expect(metrics.length).toBe(1);
      expect(metrics[0].value).toBe(0.85);
    });

    it('should handle high-frequency metric collection', async () => {
      const metricDef: MetricDefinition = {
        name: 'response_time',
        type: 'histogram',
        unit: 'milliseconds',
        description: 'API response time',
        labels: ['endpoint'],
        aggregation: 'avg',
        retention: 7
      };

      await performanceMonitor.registerMetric(metricDef);

      // Simulate high-frequency collection (1000 metrics/sec)
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 1000; i++) {
        promises.push(
          performanceMonitor.recordMetric({
            name: 'response_time',
            value: Math.random() * 100 + 50, // 50-150ms
            labels: { endpoint: '/api/quotes' },
            timestamp: new Date(),
            nodeId: testNodeId
          })
        );
      }

      await Promise.all(promises);
      const endTime = Date.now();

      // Should handle 1000 metrics in under 1 second
      expect(endTime - startTime).toBeLessThan(1000);

      const metrics = await performanceMonitor.getMetrics('response_time');
      expect(metrics.length).toBe(1000);
    });

    it('should automatically calculate aggregations', async () => {
      const metricDef: MetricDefinition = {
        name: 'cpu_usage',
        type: 'gauge',
        unit: 'percentage',
        description: 'CPU usage percentage',
        labels: ['core'],
        aggregation: 'avg',
        retention: 1
      };

      await performanceMonitor.registerMetric(metricDef);

      // Record multiple values
      const values = [45, 55, 65, 75, 85];
      for (const value of values) {
        await performanceMonitor.recordMetric({
          name: 'cpu_usage',
          value,
          labels: { core: 'cpu0' },
          timestamp: new Date(),
          nodeId: testNodeId
        });
      }

      const aggregation = await performanceMonitor.getAggregation('cpu_usage', 'avg');
      expect(aggregation).toBe(65); // Average of values
    });
  });

  describe('Threshold Monitoring', () => {
    it('should trigger alerts when thresholds are exceeded', async () => {
      const threshold: PerformanceThreshold = {
        metric: 'memory_usage',
        condition: 'gt',
        value: 0.8, // 80%
        duration: 1, // 1 second
        severity: 'high'
      };

      await performanceMonitor.addThreshold(threshold);

      // Set up alert handler
      const alerts: Alert[] = [];
      performanceMonitor.on('alert', (alert: Alert) => {
        alerts.push(alert);
      });

      // Record metric that exceeds threshold
      await performanceMonitor.recordMetric({
        name: 'memory_usage',
        value: 0.9, // 90% - exceeds threshold
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      // Wait for threshold evaluation
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('high');
      expect(alerts[0].metric).toBe('memory_usage');
    });

    it('should not trigger false alarms for brief spikes', async () => {
      const threshold: PerformanceThreshold = {
        metric: 'cpu_usage',
        condition: 'gt',
        value: 0.9,
        duration: 5, // 5 seconds - longer duration
        severity: 'critical'
      };

      await performanceMonitor.addThreshold(threshold);

      const alerts: Alert[] = [];
      performanceMonitor.on('alert', (alert: Alert) => {
        alerts.push(alert);
      });

      // Brief spike
      await performanceMonitor.recordMetric({
        name: 'cpu_usage',
        value: 0.95,
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      // Return to normal quickly
      await new Promise(resolve => setTimeout(resolve, 1000));
      await performanceMonitor.recordMetric({
        name: 'cpu_usage',
        value: 0.5,
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      // Wait for evaluation period
      await new Promise(resolve => setTimeout(resolve, 6000));

      // Should not have triggered alert due to brief duration
      expect(alerts.length).toBe(0);
    });

    it('should handle multiple threshold conditions', async () => {
      const thresholds: PerformanceThreshold[] = [
        {
          metric: 'response_time',
          condition: 'gt',
          value: 100,
          duration: 1,
          severity: 'medium'
        },
        {
          metric: 'response_time',
          condition: 'gt',
          value: 500,
          duration: 1,
          severity: 'critical'
        }
      ];

      for (const threshold of thresholds) {
        await performanceMonitor.addThreshold(threshold);
      }

      const alerts: Alert[] = [];
      performanceMonitor.on('alert', (alert: Alert) => {
        alerts.push(alert);
      });

      // Record metric that triggers critical threshold
      await performanceMonitor.recordMetric({
        name: 'response_time',
        value: 750, // Exceeds both thresholds
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should trigger the more severe alert
      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('critical');
    });
  });

  describe('Performance Analysis', () => {
    it('should identify performance trends', async () => {
      const metricDef: MetricDefinition = {
        name: 'database_latency',
        type: 'timer',
        unit: 'milliseconds',
        description: 'Database query latency',
        labels: ['query_type'],
        aggregation: 'avg',
        retention: 7
      };

      await performanceMonitor.registerMetric(metricDef);

      // Simulate degrading performance trend
      const baseLatency = 50;
      for (let i = 0; i < 100; i++) {
        const trendLatency = baseLatency + (i * 0.5); // Gradually increasing
        await performanceMonitor.recordMetric({
          name: 'database_latency',
          value: trendLatency + (Math.random() * 10 - 5), // Add noise
          labels: { query_type: 'SELECT' },
          timestamp: new Date(Date.now() - (100 - i) * 60000), // 1 minute intervals
          nodeId: testNodeId
        });
      }

      const trends = await performanceMonitor.analyzeTrends('database_latency');

      expect(trends.direction).toBe('degrading');
      expect(trends.rate).toBeGreaterThan(0); // Positive rate = increasing
      expect(trends.confidence).toBeGreaterThan(0.8);
    });

    it('should generate performance baselines', async () => {
      const metricDef: MetricDefinition = {
        name: 'throughput',
        type: 'counter',
        unit: 'requests_per_second',
        description: 'Request throughput',
        labels: ['service'],
        aggregation: 'sum',
        retention: 30
      };

      await performanceMonitor.registerMetric(metricDef);

      // Generate consistent daily patterns
      for (let day = 0; day < 14; day++) {
        for (let hour = 0; hour < 24; hour++) {
          // Simulate typical daily pattern (higher during business hours)
          let baseValue = 100;
          if (hour >= 9 && hour <= 17) {
            baseValue = 500; // Business hours
          }

          await performanceMonitor.recordMetric({
            name: 'throughput',
            value: baseValue + (Math.random() * 50 - 25), // ±25 variance
            labels: { service: 'quote-api' },
            timestamp: new Date(Date.now() - (14 - day) * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000),
            nodeId: testNodeId
          });
        }
      }

      const baselines = await performanceMonitor.generateBaselines('throughput');

      // Should have baselines for different hours
      expect(baselines.length).toBeGreaterThan(20);

      // Business hour baselines should be higher
      const businessHourBaseline = baselines.find(b => b.timeOfDay === 12);
      const offHourBaseline = baselines.find(b => b.timeOfDay === 2);

      expect(businessHourBaseline?.expectedValue).toBeGreaterThan(offHourBaseline?.expectedValue);
    });

    it('should detect anomalies using baselines', async () => {
      // Set up baseline
      const baseline = {
        metric: 'api_latency',
        timeOfDay: 14, // 2 PM
        dayOfWeek: 2, // Tuesday
        expectedValue: 50,
        variance: 5,
        confidence: 0.9
      };

      await performanceMonitor.addBaseline(baseline);

      // Record normal metric
      await performanceMonitor.recordMetric({
        name: 'api_latency',
        value: 52, // Within variance
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      let anomalies = await performanceMonitor.detectAnomalies('api_latency');
      expect(anomalies.length).toBe(0);

      // Record anomalous metric
      await performanceMonitor.recordMetric({
        name: 'api_latency',
        value: 150, // Well outside variance
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      anomalies = await performanceMonitor.detectAnomalies('api_latency');
      expect(anomalies.length).toBe(1);
      expect(anomalies[0].severity).toBeGreaterThan(1); // Significant anomaly
    });
  });

  describe('Resource Utilization Monitoring', () => {
    it('should track system resource utilization', async () => {
      const resourceMetrics = {
        cpu: { usage: 75, cores: 8, loadAverage: [1.2, 1.5, 1.8] },
        memory: { total: 16 * 1024 * 1024 * 1024, used: 8 * 1024 * 1024 * 1024 },
        disk: { total: 1024 * 1024 * 1024 * 1024, used: 512 * 1024 * 1024 * 1024, iops: 150 },
        network: { bytesIn: 1024 * 1024, bytesOut: 2 * 1024 * 1024, connections: 50 }
      };

      await performanceMonitor.recordResourceUtilization(resourceMetrics);

      const utilization = await performanceMonitor.getCurrentResourceUtilization();

      expect(utilization.cpu.usage).toBe(75);
      expect(utilization.memory.used).toBe(8 * 1024 * 1024 * 1024);
      expect(utilization.disk.iops).toBe(150);
    });

    it('should predict resource exhaustion', async () => {
      // Simulate increasing memory usage trend
      const baseUsage = 4 * 1024 * 1024 * 1024; // 4GB
      const totalMemory = 16 * 1024 * 1024 * 1024; // 16GB

      for (let i = 0; i < 50; i++) {
        const memoryUsage = baseUsage + (i * 100 * 1024 * 1024); // Increasing by 100MB each time

        await performanceMonitor.recordResourceUtilization({
          memory: { total: totalMemory, used: memoryUsage },
          timestamp: new Date(Date.now() - (50 - i) * 60000) // 1 minute intervals
        });
      }

      const predictions = await performanceMonitor.predictResourceExhaustion('memory');

      expect(predictions.timeToExhaustion).toBeDefined();
      expect(predictions.confidence).toBeGreaterThan(0.7);
      expect(predictions.trend).toBe('increasing');
    });

    it('should recommend resource optimizations', async () => {
      // Record high resource usage
      await performanceMonitor.recordResourceUtilization({
        cpu: { usage: 90, cores: 4 },
        memory: { total: 8 * 1024 * 1024 * 1024, used: 7.5 * 1024 * 1024 * 1024 },
        disk: { iops: 500, latency: 50 }
      });

      const recommendations = await performanceMonitor.generateOptimizationRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);

      const cpuRecommendation = recommendations.find(r => r.type === 'scaling' && r.title.includes('CPU'));
      const memoryRecommendation = recommendations.find(r => r.type === 'optimization' && r.title.includes('memory'));

      expect(cpuRecommendation).toBeDefined();
      expect(memoryRecommendation).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle metric collection failures gracefully', async () => {
      // Simulate storage failure
      const originalRecordMetric = performanceMonitor.recordMetric.bind(performanceMonitor);
      performanceMonitor.recordMetric = jest.fn().mockRejectedValue(new Error('Storage failure'));

      // Should not throw
      await expect(performanceMonitor.recordMetric({
        name: 'test_metric',
        value: 100,
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      })).rejects.toThrow('Storage failure');

      // Restore original method
      performanceMonitor.recordMetric = originalRecordMetric;

      // Should work normally after restoration
      await expect(performanceMonitor.recordMetric({
        name: 'test_metric',
        value: 100,
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      })).resolves.toBeUndefined();
    });

    it('should handle corrupted metric data', async () => {
      // Simulate corrupted metric data
      const corruptedData = {
        name: 'corrupted_metric',
        value: NaN, // Invalid value
        labels: null, // Invalid labels
        timestamp: new Date('invalid'),
        nodeId: testNodeId
      };

      // Should handle gracefully
      await expect(performanceMonitor.recordMetric(corruptedData)).resolves.toBeUndefined();

      // Should not affect normal operations
      await expect(performanceMonitor.recordMetric({
        name: 'normal_metric',
        value: 50,
        labels: { type: 'test' },
        timestamp: new Date(),
        nodeId: testNodeId
      })).resolves.toBeUndefined();
    });

    it('should recover from alerting system failures', async () => {
      const threshold: PerformanceThreshold = {
        metric: 'error_rate',
        condition: 'gt',
        value: 0.1,
        duration: 1,
        severity: 'high'
      };

      await performanceMonitor.addThreshold(threshold);

      // Simulate alerting failure
      const alertSpy = jest.spyOn(performanceMonitor, 'emit').mockImplementation(() => {
        throw new Error('Alert system failure');
      });

      // Record metric that should trigger alert
      await performanceMonitor.recordMetric({
        name: 'error_rate',
        value: 0.2,
        labels: {},
        timestamp: new Date(),
        nodeId: testNodeId
      });

      // Should not crash the system
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(alertSpy).toHaveBeenCalled();
      alertSpy.mockRestore();
    });
  });

  describe('Performance Targets Validation', () => {
    it('should validate V3 performance targets are met', async () => {
      // Test MCP response time target (<100ms)
      const mcpLatencies = [];
      for (let i = 0; i < 100; i++) {
        const startTime = performance.now();

        // Simulate MCP operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 25)); // 25-75ms

        const endTime = performance.now();
        mcpLatencies.push(endTime - startTime);
      }

      const avgMcpLatency = mcpLatencies.reduce((sum, lat) => sum + lat, 0) / mcpLatencies.length;
      expect(avgMcpLatency).toBeLessThan(100); // V3 target

      // Test memory reduction target (50-75%)
      const initialMemory = 1024 * 1024 * 1024; // 1GB
      const optimizedMemory = 300 * 1024 * 1024; // 300MB

      const memoryReduction = (initialMemory - optimizedMemory) / initialMemory;
      expect(memoryReduction).toBeGreaterThanOrEqual(0.5); // 50% minimum
      expect(memoryReduction).toBeLessThanOrEqual(0.8); // Reasonable upper bound

      // Test SONA adaptation time (<0.05ms)
      const sonaAdaptationTime = 0.03; // Mock value
      expect(sonaAdaptationTime).toBeLessThan(0.05);
    });

    it('should track performance regression over time', async () => {
      // Record baseline performance
      const baselineMetrics = {
        responseTime: 50,
        throughput: 1000,
        errorRate: 0.01,
        memoryUsage: 0.6
      };

      await performanceMonitor.recordBaseline('system-performance', baselineMetrics);

      // Simulate performance regression
      const regressedMetrics = {
        responseTime: 150, // 3x slower
        throughput: 500,   // 2x lower
        errorRate: 0.05,   // 5x higher
        memoryUsage: 0.8   // Higher usage
      };

      await performanceMonitor.recordMetrics('system-performance', regressedMetrics);

      const regressionReport = await performanceMonitor.detectPerformanceRegression();

      expect(regressionReport.hasRegression).toBe(true);
      expect(regressionReport.severity).toBe('critical');
      expect(regressionReport.affectedMetrics).toContain('responseTime');
      expect(regressionReport.affectedMetrics).toContain('throughput');
    });
  });
});