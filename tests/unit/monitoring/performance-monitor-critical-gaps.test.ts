/**
 * Critical Gap Tests for PerformanceMonitor
 * Tests alert storm prevention, anomaly detection, and distributed metrics
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { PerformanceMonitor } from '../../../src/monitoring/performance-monitor';

describe('PerformanceMonitor - Critical Gap Tests', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor('test-node');
  });

  afterEach(async () => {
    await performanceMonitor?.destroy();
  });

  describe('Alert Storm Prevention - CRITICAL GAP', () => {
    it('should detect and prevent alert storms', async () => {
      const metricName = 'cpu_usage';

      // Simulate rapid threshold violations that would cause alert storm
      const rapidAlerts = [];
      for (let i = 0; i < 50; i++) {
        rapidAlerts.push(performanceMonitor.recordMetric({
          name: metricName,
          value: 95, // Above threshold
          labels: { host: 'test-host' },
          timestamp: new Date(Date.now() + i * 1000), // 1 second apart
          nodeId: 'test-node'
        }));
      }

      await Promise.all(rapidAlerts);

      const alertHistory = await performanceMonitor.getAlertHistory(metricName, {
        timeRange: { from: new Date(Date.now() - 60000), to: new Date() }
      });

      // Should have detected alert storm and suppressed redundant alerts
      expect(alertHistory.suppressedAlerts).toBeGreaterThan(40);
      expect(alertHistory.stormDetected).toBe(true);

      // Should have only sent summary alerts instead of individual ones
      expect(alertHistory.summaryAlerts).toBeGreaterThan(0);
      expect(alertHistory.totalAlerts).toBeLessThan(10); // Much fewer than 50
    });

    it('should implement alert rate limiting per metric', async () => {
      const metrics = ['cpu_usage', 'memory_usage', 'disk_usage'];

      // Configure different rate limits per metric
      await performanceMonitor.setAlertRateLimit('cpu_usage', { maxAlertsPerMinute: 2 });
      await performanceMonitor.setAlertRateLimit('memory_usage', { maxAlertsPerMinute: 5 });
      await performanceMonitor.setAlertRateLimit('disk_usage', { maxAlertsPerMinute: 1 });

      // Generate alerts for each metric
      const alertPromises = [];
      for (const metric of metrics) {
        for (let i = 0; i < 10; i++) {
          alertPromises.push(performanceMonitor.triggerAlert({
            type: 'threshold_exceeded',
            severity: 'high',
            title: `${metric} alert ${i}`,
            description: 'Test alert',
            nodeId: 'test-node',
            metric,
            value: 90,
            threshold: 80,
            timestamp: new Date()
          }));
        }
      }

      await Promise.allSettled(alertPromises);

      // Check rate limiting was applied
      const cpuAlerts = await performanceMonitor.getActiveAlerts('cpu_usage');
      const memoryAlerts = await performanceMonitor.getActiveAlerts('memory_usage');
      const diskAlerts = await performanceMonitor.getActiveAlerts('disk_usage');

      expect(cpuAlerts.length).toBeLessThanOrEqual(2);
      expect(memoryAlerts.length).toBeLessThanOrEqual(5);
      expect(diskAlerts.length).toBeLessThanOrEqual(1);
    });

    it('should escalate persistent issues instead of suppressing', async () => {
      const criticalMetric = 'system_health';

      // Simulate persistent critical issue
      for (let hour = 0; hour < 6; hour++) {
        await performanceMonitor.recordMetric({
          name: criticalMetric,
          value: 0, // Critical failure
          labels: { component: 'database' },
          timestamp: new Date(Date.now() - (5 - hour) * 3600000), // 6 hours ago to now
          nodeId: 'test-node'
        });
      }

      const escalationResult = await performanceMonitor.checkEscalation(criticalMetric);

      expect(escalationResult.shouldEscalate).toBe(true);
      expect(escalationResult.escalationLevel).toBe('critical');
      expect(escalationResult.persistenceDuration).toBeGreaterThanOrEqual(5 * 3600000); // 5+ hours
      expect(escalationResult.notificationChannels).toContain('pager');
    });

    it('should use intelligent alert grouping', async () => {
      const relatedMetrics = [
        'database_cpu',
        'database_memory',
        'database_connections',
        'database_query_time'
      ];

      // Generate alerts for related database metrics simultaneously
      const alertPromises = relatedMetrics.map(metric =>
        performanceMonitor.triggerAlert({
          type: 'threshold_exceeded',
          severity: 'high',
          title: `${metric} critical`,
          description: 'Database performance issue',
          nodeId: 'test-node',
          metric,
          value: 95,
          threshold: 80,
          timestamp: new Date()
        })
      );

      await Promise.all(alertPromises);

      const alertGroups = await performanceMonitor.getAlertGroups();

      // Should have grouped database-related alerts
      const databaseGroup = alertGroups.find(group =>
        group.category === 'database_performance'
      );

      expect(databaseGroup).toBeDefined();
      expect(databaseGroup.alerts.length).toBe(4);
      expect(databaseGroup.priority).toBe('high');
    });
  });

  describe('Anomaly Detection Accuracy - HIGH PRIORITY GAP', () => {
    it('should detect statistical anomalies with low false positive rate', async () => {
      const metricName = 'request_latency';

      // Generate normal baseline data (mean=100, stddev=10)
      const baselineData = [];
      for (let i = 0; i < 1000; i++) {
        const value = 100 + (Math.random() - 0.5) * 20; // Normal distribution approximation
        baselineData.push({
          name: metricName,
          value,
          labels: { service: 'api' },
          timestamp: new Date(Date.now() - (1000 - i) * 60000), // Past 1000 minutes
          nodeId: 'test-node'
        });
      }

      // Record baseline data
      await performanceMonitor.recordMetrics(baselineData);

      // Train anomaly detection model
      await performanceMonitor.trainAnomalyDetection(metricName);

      // Test with known anomalies and normal values
      const testCases = [
        { value: 102, expected: false }, // Normal
        { value: 98, expected: false },  // Normal
        { value: 200, expected: true },  // Anomaly (2x normal)
        { value: 50, expected: true },   // Anomaly (0.5x normal)
        { value: 105, expected: false }  // Normal
      ];

      const results = [];
      for (const testCase of testCases) {
        const anomalyResult = await performanceMonitor.detectAnomaly(metricName, testCase.value);
        results.push({
          value: testCase.value,
          predicted: anomalyResult.isAnomaly,
          expected: testCase.expected,
          confidence: anomalyResult.confidence
        });
      }

      // Calculate accuracy
      const correct = results.filter(r => r.predicted === r.expected).length;
      const accuracy = correct / results.length;

      expect(accuracy).toBeGreaterThanOrEqual(0.8); // 80% accuracy minimum

      // Check false positive rate on normal data
      const normalResults = results.filter(r => !r.expected);
      const falsePositives = normalResults.filter(r => r.predicted).length;
      const falsePositiveRate = falsePositives / normalResults.length;

      expect(falsePositiveRate).toBeLessThanOrEqual(0.1); // 10% false positive rate maximum
    });

    it('should adapt to changing baselines over time', async () => {
      const metricName = 'adaptive_metric';

      // Generate data with changing baseline (gradual increase)
      const dataPoints = [];
      for (let day = 0; day < 30; day++) {
        const baseValue = 100 + day * 2; // Baseline increases by 2 per day

        for (let hour = 0; hour < 24; hour++) {
          const value = baseValue + (Math.random() - 0.5) * 10;
          dataPoints.push({
            name: metricName,
            value,
            labels: { trend: 'increasing' },
            timestamp: new Date(Date.now() - (30 - day) * 24 * 3600000 + hour * 3600000),
            nodeId: 'test-node'
          });
        }
      }

      await performanceMonitor.recordMetrics(dataPoints);

      // Train adaptive model
      await performanceMonitor.trainAdaptiveAnomalyDetection(metricName, {
        windowSize: 7 * 24, // 7 days
        adaptationRate: 0.1
      });

      // Test recent baseline (should be ~158)
      const recentNormalValue = 160;
      const oldBaselineValue = 105; // Would be normal 30 days ago

      const recentResult = await performanceMonitor.detectAnomaly(metricName, recentNormalValue);
      const oldBaselineResult = await performanceMonitor.detectAnomaly(metricName, oldBaselineValue);

      // Recent value should be normal, old baseline should be anomalous
      expect(recentResult.isAnomaly).toBe(false);
      expect(oldBaselineResult.isAnomaly).toBe(true);
    });

    it('should handle seasonal patterns in anomaly detection', async () => {
      const metricName = 'seasonal_metric';

      // Generate data with daily seasonal pattern (higher during day)
      const dataPoints = [];
      for (let day = 0; day < 14; day++) {
        for (let hour = 0; hour < 24; hour++) {
          // Daily pattern: low at night (0-6), high during day (9-17), medium evening
          let baseValue = 50;
          if (hour >= 9 && hour <= 17) {
            baseValue = 100; // Business hours
          } else if (hour >= 18 && hour <= 23) {
            baseValue = 75; // Evening
          }

          const value = baseValue + (Math.random() - 0.5) * 10;
          dataPoints.push({
            name: metricName,
            value,
            labels: { pattern: 'daily_seasonal' },
            timestamp: new Date(Date.now() - (14 - day) * 24 * 3600000 + hour * 3600000),
            nodeId: 'test-node'
          });
        }
      }

      await performanceMonitor.recordMetrics(dataPoints);

      // Train seasonal anomaly detection
      await performanceMonitor.trainSeasonalAnomalyDetection(metricName, {
        seasonalityPeriod: 24 * 3600000, // 24 hours
        seasonalComponents: ['hourly', 'daily']
      });

      // Test seasonal awareness
      const midnightTimestamp = new Date();
      midnightTimestamp.setHours(2, 0, 0, 0); // 2 AM

      const businessHourTimestamp = new Date();
      businessHourTimestamp.setHours(14, 0, 0, 0); // 2 PM

      // High value at 2 AM should be anomalous
      const midnightAnomaly = await performanceMonitor.detectSeasonalAnomaly(
        metricName, 100, midnightTimestamp
      );

      // High value at 2 PM should be normal
      const businessHourNormal = await performanceMonitor.detectSeasonalAnomaly(
        metricName, 100, businessHourTimestamp
      );

      expect(midnightAnomaly.isAnomaly).toBe(true);
      expect(businessHourNormal.isAnomaly).toBe(false);
    });
  });

  describe('Distributed Metric Consistency - CRITICAL GAP', () => {
    it('should synchronize metrics across multiple nodes', async () => {
      const nodeIds = ['node-1', 'node-2', 'node-3'];
      const metricName = 'distributed_cpu';

      // Simulate metrics from different nodes
      const distributedMetrics = nodeIds.map((nodeId, index) => ({
        name: metricName,
        value: 70 + index * 5, // Slightly different values
        labels: { region: 'us-east-1' },
        timestamp: new Date(),
        nodeId
      }));

      await performanceMonitor.recordDistributedMetrics(distributedMetrics);

      // Check metric consistency across nodes
      const consistencyReport = await performanceMonitor.checkMetricConsistency(
        metricName,
        nodeIds,
        { tolerancePercentage: 10 }
      );

      expect(consistencyReport.isConsistent).toBe(true);
      expect(consistencyReport.variance).toBeLessThanOrEqual(25); // 5^2
      expect(consistencyReport.outlierNodes).toHaveLength(0);
    });

    it('should detect and handle clock skew between nodes', async () => {
      const metricName = 'time_sensitive_metric';

      // Simulate metrics with clock skew
      const skewedMetrics = [
        {
          name: metricName,
          value: 100,
          labels: {},
          timestamp: new Date(Date.now() - 1000), // 1 second behind
          nodeId: 'node-1'
        },
        {
          name: metricName,
          value: 101,
          labels: {},
          timestamp: new Date(), // Current time
          nodeId: 'node-2'
        },
        {
          name: metricName,
          value: 102,
          labels: {},
          timestamp: new Date(Date.now() + 2000), // 2 seconds ahead
          nodeId: 'node-3'
        }
      ];

      await performanceMonitor.recordDistributedMetrics(skewedMetrics);

      const clockSkewReport = await performanceMonitor.detectClockSkew([
        'node-1', 'node-2', 'node-3'
      ]);

      expect(clockSkewReport.maxSkew).toBeGreaterThanOrEqual(2000); // 2 seconds
      expect(clockSkewReport.nodesWithSkew).toContain('node-1');
      expect(clockSkewReport.nodesWithSkew).toContain('node-3');

      // Should apply time synchronization correction
      const correctedMetrics = await performanceMonitor.getTimeCorrectedMetrics(
        metricName,
        { timeRange: { from: new Date(Date.now() - 5000), to: new Date() } }
      );

      // All timestamps should be normalized
      const timestamps = correctedMetrics.map(m => m.timestamp.getTime());
      const maxTimestampDiff = Math.max(...timestamps) - Math.min(...timestamps);
      expect(maxTimestampDiff).toBeLessThanOrEqual(100); // Within 100ms after correction
    });

    it('should handle network partitions in metric collection', async () => {
      const allNodes = ['node-1', 'node-2', 'node-3', 'node-4'];
      const partition1 = ['node-1', 'node-2'];
      const partition2 = ['node-3', 'node-4'];

      // Simulate network partition
      await performanceMonitor.simulateNetworkPartition(partition1, partition2);

      // Record metrics in both partitions
      const partition1Metrics = partition1.map(nodeId => ({
        name: 'partitioned_metric',
        value: 50,
        labels: { partition: '1' },
        timestamp: new Date(),
        nodeId
      }));

      const partition2Metrics = partition2.map(nodeId => ({
        name: 'partitioned_metric',
        value: 60,
        labels: { partition: '2' },
        timestamp: new Date(),
        nodeId
      }));

      await performanceMonitor.recordMetrics(partition1Metrics);
      await performanceMonitor.recordMetrics(partition2Metrics, { partition: 2 });

      // Check partition detection
      const partitionStatus = await performanceMonitor.getPartitionStatus();
      expect(partitionStatus.isPartitioned).toBe(true);
      expect(partitionStatus.partitions).toHaveLength(2);

      // Heal partition and check metric reconciliation
      await performanceMonitor.healNetworkPartition();

      const reconciliationResult = await performanceMonitor.reconcilePartitionedMetrics(
        'partitioned_metric'
      );

      expect(reconciliationResult.reconciledCount).toBeGreaterThan(0);
      expect(reconciliationResult.conflicts).toBeDefined();
    });

    it('should aggregate metrics with different sampling rates', async () => {
      const metricName = 'variable_sampling_metric';

      // Node 1: High frequency sampling (every 10 seconds)
      const highFreqMetrics = [];
      for (let i = 0; i < 60; i++) {
        highFreqMetrics.push({
          name: metricName,
          value: 100 + Math.sin(i / 10) * 5,
          labels: { sampling: 'high' },
          timestamp: new Date(Date.now() - (60 - i) * 10000),
          nodeId: 'high-freq-node'
        });
      }

      // Node 2: Low frequency sampling (every minute)
      const lowFreqMetrics = [];
      for (let i = 0; i < 10; i++) {
        lowFreqMetrics.push({
          name: metricName,
          value: 100 + Math.sin(i * 6 / 10) * 5,
          labels: { sampling: 'low' },
          timestamp: new Date(Date.now() - (10 - i) * 60000),
          nodeId: 'low-freq-node'
        });
      }

      await performanceMonitor.recordMetrics([...highFreqMetrics, ...lowFreqMetrics]);

      // Aggregate with sampling rate normalization
      const aggregatedMetrics = await performanceMonitor.aggregateVariableSamplingMetrics(
        metricName,
        {
          timeRange: { from: new Date(Date.now() - 600000), to: new Date() },
          targetSamplingRate: 30000, // 30 seconds
          aggregationMethod: 'weighted_average'
        }
      );

      expect(aggregatedMetrics.length).toBeGreaterThan(0);
      expect(aggregatedMetrics[0]).toHaveProperty('normalizedValue');
      expect(aggregatedMetrics[0]).toHaveProperty('samplingWeight');
    });
  });

  describe('Baseline Recalibration - HIGH PRIORITY GAP', () => {
    it('should automatically recalibrate baselines when drift is detected', async () => {
      const metricName = 'drifting_baseline';

      // Phase 1: Establish initial baseline (around 100)
      const phase1Data = [];
      for (let i = 0; i < 100; i++) {
        phase1Data.push({
          name: metricName,
          value: 100 + (Math.random() - 0.5) * 10,
          labels: { phase: 'initial' },
          timestamp: new Date(Date.now() - (200 - i) * 60000),
          nodeId: 'test-node'
        });
      }

      await performanceMonitor.recordMetrics(phase1Data);
      await performanceMonitor.calculateBaseline(metricName);

      const initialBaseline = await performanceMonitor.getBaseline(metricName);
      expect(initialBaseline.expectedValue).toBeCloseTo(100, 0);

      // Phase 2: Gradual drift to new level (around 150)
      const phase2Data = [];
      for (let i = 0; i < 100; i++) {
        const driftValue = 100 + (i / 100) * 50; // Gradual increase to 150
        phase2Data.push({
          name: metricName,
          value: driftValue + (Math.random() - 0.5) * 10,
          labels: { phase: 'drift' },
          timestamp: new Date(Date.now() - (100 - i) * 60000),
          nodeId: 'test-node'
        });
      }

      await performanceMonitor.recordMetrics(phase2Data);

      // Should detect baseline drift and trigger recalibration
      const driftDetection = await performanceMonitor.detectBaselineDrift(metricName);
      expect(driftDetection.hasDrift).toBe(true);
      expect(driftDetection.driftMagnitude).toBeGreaterThan(30);

      // Automatic recalibration
      await performanceMonitor.recalibrateBaseline(metricName, { automatic: true });

      const newBaseline = await performanceMonitor.getBaseline(metricName);
      expect(newBaseline.expectedValue).toBeCloseTo(150, 1);
      expect(newBaseline.version).toBeGreaterThan(initialBaseline.version);
    });

    it('should maintain multiple baselines for different time contexts', async () => {
      const metricName = 'contextual_metric';

      // Generate different baselines for different times of day
      const contexts = [
        { hour: 2, baseline: 50, label: 'night' },    // Night time
        { hour: 10, baseline: 100, label: 'morning' }, // Morning
        { hour: 14, baseline: 150, label: 'afternoon' }, // Afternoon
        { hour: 20, baseline: 75, label: 'evening' }  // Evening
      ];

      for (const context of contexts) {
        const contextData = [];
        for (let day = 0; day < 7; day++) {
          for (let variation = 0; variation < 12; variation++) { // 12 samples per context
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - (7 - day));
            timestamp.setHours(context.hour, variation * 5, 0, 0);

            contextData.push({
              name: metricName,
              value: context.baseline + (Math.random() - 0.5) * 20,
              labels: { timeContext: context.label },
              timestamp,
              nodeId: 'test-node'
            });
          }
        }

        await performanceMonitor.recordMetrics(contextData);
      }

      // Calculate contextual baselines
      await performanceMonitor.calculateContextualBaselines(metricName, {
        contexts: ['hourly', 'daily']
      });

      // Verify different baselines for different times
      const nightBaseline = await performanceMonitor.getContextualBaseline(metricName, {
        hour: 2
      });
      const afternoonBaseline = await performanceMonitor.getContextualBaseline(metricName, {
        hour: 14
      });

      expect(nightBaseline.expectedValue).toBeCloseTo(50, 1);
      expect(afternoonBaseline.expectedValue).toBeCloseTo(150, 1);
      expect(Math.abs(afternoonBaseline.expectedValue - nightBaseline.expectedValue)).toBeGreaterThan(50);
    });
  });
});