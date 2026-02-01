/**
 * Unit Tests for Intelligent Prefetch System
 * Tests ML-based predictions, bandwidth management, and cache warming strategies
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentPrefetchSystem } from '../../../../src/database/caching/intelligent-prefetch-system';

describe('IntelligentPrefetchSystem', () => {
  let prefetchSystem: IntelligentPrefetchSystem;
  const testConfig = {
    maxBandwidthBps: 50 * 1024 * 1024, // 50 MB/s
    reservedBandwidthPercent: 0.8,
    adaptiveBandwidth: true,
    maxTrainingData: 10000
  };

  beforeEach(() => {
    prefetchSystem = new IntelligentPrefetchSystem(testConfig);
  });

  afterEach(async () => {
    await prefetchSystem.destroy();
  });

  describe('Prediction Engine', () => {
    it('should make accurate sequential predictions', async () => {
      // Train with sequential access pattern
      const trainingData = Array(100).fill(0).map((_, i) => ({
        key: `seq-${i}`,
        timestamp: Date.now() + i * 1000,
        accessType: 'sequential'
      }));

      await prefetchSystem.trainModel('sequential', trainingData);

      // Get predictions
      const predictions = await prefetchSystem.predictNextAccess('seq-50', {
        strategy: 'sequential',
        lookAhead: 5
      });

      expect(predictions).toHaveLength(5);
      expect(predictions[0].key).toBe('seq-51');
      expect(predictions[1].key).toBe('seq-52');
      expect(predictions[0].confidence).toBeGreaterThan(0.7);
    });

    it('should detect temporal access patterns', async () => {
      const now = Date.now();
      const hourlyPattern = Array(24).fill(0).map((_, hour) => ({
        key: `hourly-data`,
        timestamp: now + hour * 3600000, // Every hour
        accessType: 'temporal'
      }));

      await prefetchSystem.trainModel('temporal', hourlyPattern);

      const predictions = await prefetchSystem.predictNextAccess('hourly-data', {
        strategy: 'temporal',
        timeWindow: 7200000 // 2 hours
      });

      expect(predictions.length).toBeGreaterThan(0);
      expect(predictions[0].accessPattern).toBe('regular');
    });

    it('should identify associative relationships', async () => {
      // Train with co-accessed items
      const associativeData = [
        { keys: ['user-123', 'profile-123', 'settings-123'], timestamp: Date.now() },
        { keys: ['user-456', 'profile-456', 'settings-456'], timestamp: Date.now() + 1000 },
        { keys: ['user-789', 'profile-789', 'settings-789'], timestamp: Date.now() + 2000 }
      ];

      await prefetchSystem.trainAssociativeModel(associativeData);

      const predictions = await prefetchSystem.predictNextAccess('user-999', {
        strategy: 'associative',
        maxAssociations: 3
      });

      expect(predictions.some(p => p.key.includes('profile-999'))).toBe(true);
      expect(predictions.some(p => p.key.includes('settings-999'))).toBe(true);
    });

    it('should use ML models for complex prediction', async () => {
      // Create complex training dataset
      const complexData = Array(1000).fill(0).map((_, i) => ({
        features: [
          i % 24, // Hour of day
          Math.floor(i / 7) % 7, // Day of week
          Math.random(), // Random factor
          i % 10 // Pattern factor
        ],
        nextAccess: `item-${(i + Math.floor(Math.random() * 5) + 1) % 1000}`,
        timestamp: Date.now() + i * 60000
      }));

      await prefetchSystem.trainNeuralNetwork('complex', complexData);

      const predictions = await prefetchSystem.predictWithML('item-500', {
        features: [14, 3, 0.5, 5], // Current context
        modelType: 'neural_network'
      });

      expect(predictions).toHaveLength.toBeGreaterThan(0);
      expect(predictions[0].confidence).toBeGreaterThan(0.5);
    });
  });

  describe('Bandwidth Management', () => {
    it('should respect bandwidth limits', async () => {
      const bandwidthLimit = 1024 * 1024; // 1 MB/s
      prefetchSystem.setBandwidthLimit(bandwidthLimit);

      const largeItems = Array(10).fill(0).map((_, i) => ({
        key: `large-${i}`,
        size: 512 * 1024, // 512KB each
        priority: 'medium'
      }));

      const startTime = performance.now();
      await prefetchSystem.prefetchItems(largeItems);
      const duration = performance.now() - startTime;

      const totalSize = largeItems.length * 512 * 1024; // 5MB total
      const minExpectedDuration = (totalSize / bandwidthLimit) * 1000; // ms

      expect(duration).toBeGreaterThan(minExpectedDuration * 0.8); // Allow 20% tolerance
    });

    it('should adapt bandwidth based on network quality', async () => {
      // Simulate poor network quality
      prefetchSystem.updateNetworkQuality('poor');

      const items = Array(5).fill(0).map((_, i) => ({
        key: `adaptive-${i}`,
        size: 100 * 1024,
        priority: 'medium'
      }));

      const poorNetworkStart = performance.now();
      await prefetchSystem.prefetchItems(items);
      const poorNetworkDuration = performance.now() - poorNetworkStart;

      // Simulate excellent network quality
      prefetchSystem.updateNetworkQuality('excellent');

      const excellentNetworkStart = performance.now();
      await prefetchSystem.prefetchItems(items);
      const excellentNetworkDuration = performance.now() - excellentNetworkStart;

      // Should be faster with better network quality
      expect(excellentNetworkDuration).toBeLessThan(poorNetworkDuration);
    });

    it('should prioritize high-priority items', async () => {
      const mixedPriorityItems = [
        { key: 'critical-1', size: 1024, priority: 'critical' },
        { key: 'low-1', size: 1024, priority: 'low' },
        { key: 'high-1', size: 1024, priority: 'high' },
        { key: 'medium-1', size: 1024, priority: 'medium' },
        { key: 'critical-2', size: 1024, priority: 'critical' }
      ];

      const fetchOrder = [];
      const mockPrefetch = jest.spyOn(prefetchSystem as any, 'fetchItem')
        .mockImplementation(async (item) => {
          fetchOrder.push(item.key);
          return { success: true, data: `data-${item.key}` };
        });

      await prefetchSystem.prefetchItems(mixedPriorityItems);

      // Critical items should be fetched first
      expect(fetchOrder[0]).toMatch(/critical/);
      expect(fetchOrder[1]).toMatch(/critical/);

      mockPrefetch.mockRestore();
    });

    it('should handle bandwidth exhaustion gracefully', async () => {
      const veryLowBandwidth = 1024; // 1KB/s
      prefetchSystem.setBandwidthLimit(veryLowBandwidth);

      const largeItems = Array(5).fill(0).map((_, i) => ({
        key: `huge-${i}`,
        size: 1024 * 1024, // 1MB each
        priority: 'medium'
      }));

      // Should not throw error even with insufficient bandwidth
      await expect(prefetchSystem.prefetchItems(largeItems)).resolves.toBeDefined();

      const metrics = prefetchSystem.getMetrics();
      expect(metrics.bandwidthSaved).toBeGreaterThan(0);
    });
  });

  describe('Cache Warming', () => {
    it('should execute warming plans efficiently', async () => {
      const warmingPlan = {
        id: 'startup-warming',
        priority: 'high' as const,
        strategy: 'startup' as const,
        keys: Array(50).fill(0).map((_, i) => `startup-${i}`),
        estimatedTime: 5000,
        estimatedBandwidth: 10 * 1024 * 1024,
        dependencies: [],
        schedule: new Date(),
        status: 'pending' as const
      };

      const startTime = performance.now();
      await prefetchSystem.executeWarmingPlan(warmingPlan);
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(warmingPlan.estimatedTime * 1.2); // Within 20% of estimate

      const plan = await prefetchSystem.getWarmingPlan(warmingPlan.id);
      expect(plan?.status).toBe('completed');
    });

    it('should handle warming plan dependencies', async () => {
      const basePlan = {
        id: 'base-warming',
        priority: 'high' as const,
        strategy: 'startup' as const,
        keys: ['base-1', 'base-2'],
        estimatedTime: 1000,
        estimatedBandwidth: 1024,
        dependencies: [],
        schedule: new Date(),
        status: 'pending' as const
      };

      const dependentPlan = {
        id: 'dependent-warming',
        priority: 'medium' as const,
        strategy: 'predictive' as const,
        keys: ['dependent-1', 'dependent-2'],
        estimatedTime: 2000,
        estimatedBandwidth: 2048,
        dependencies: ['base-warming'],
        schedule: new Date(),
        status: 'pending' as const
      };

      // Start both plans
      const promises = [
        prefetchSystem.executeWarmingPlan(basePlan),
        prefetchSystem.executeWarmingPlan(dependentPlan)
      ];

      await Promise.all(promises);

      const baseResult = await prefetchSystem.getWarmingPlan('base-warming');
      const dependentResult = await prefetchSystem.getWarmingPlan('dependent-warming');

      expect(baseResult?.status).toBe('completed');
      expect(dependentResult?.status).toBe('completed');
    });

    it('should schedule warming plans optimally', async () => {
      const criticalPlan = {
        id: 'critical-warming',
        priority: 'critical' as const,
        keys: ['critical-data'],
        schedule: new Date(Date.now() + 1000)
      };

      const lowPlan = {
        id: 'low-warming',
        priority: 'low' as const,
        keys: ['low-priority-data'],
        schedule: new Date(Date.now() + 500)
      };

      await prefetchSystem.scheduleWarmingPlan(criticalPlan);
      await prefetchSystem.scheduleWarmingPlan(lowPlan);

      // Critical should be executed first despite later schedule
      const executionOrder = [];
      const mockExecute = jest.spyOn(prefetchSystem as any, 'executeWarmingPlan')
        .mockImplementation(async (plan) => {
          executionOrder.push(plan.id);
          return { success: true };
        });

      await prefetchSystem.processScheduledWarmups();

      expect(executionOrder[0]).toBe('critical-warming');

      mockExecute.mockRestore();
    });
  });

  describe('Performance Metrics', () => {
    it('should track prediction accuracy over time', async () => {
      // Generate training data with known outcomes
      const trainingOutcomes = Array(100).fill(0).map((_, i) => ({
        prediction: `predicted-${i}`,
        actualAccess: i % 2 === 0 ? `predicted-${i}` : `different-${i}`,
        confidence: 0.8,
        timestamp: Date.now() + i * 1000
      }));

      for (const outcome of trainingOutcomes) {
        await prefetchSystem.recordPredictionOutcome(outcome);
      }

      const metrics = prefetchSystem.getMetrics();
      expect(metrics.accuratePredictions).toBe(50); // 50% accuracy
      expect(metrics.totalPredictions).toBe(100);

      const strategyMetrics = metrics.strategiesPerformance.get('sequential');
      expect(strategyMetrics?.accuracy).toBeCloseTo(0.5, 1);
    });

    it('should measure bandwidth savings', async () => {
      // Simulate cache hits from prefetching
      const prefetchedItems = ['item-1', 'item-2', 'item-3'];

      for (const item of prefetchedItems) {
        await prefetchSystem.recordCacheHit(item, {
          size: 1024,
          savings: 50, // 50ms latency saved
          hitFromPrefetch: true
        });
      }

      const metrics = prefetchSystem.getMetrics();
      expect(metrics.latencyReduced).toBe(150); // 3 * 50ms
      expect(metrics.hitRateImprovement).toBeGreaterThan(0);
    });

    it('should monitor strategy performance', async () => {
      const strategies = ['sequential', 'associative', 'temporal'];

      for (const strategy of strategies) {
        // Simulate predictions and outcomes for each strategy
        for (let i = 0; i < 10; i++) {
          await prefetchSystem.recordPredictionOutcome({
            strategy,
            prediction: `${strategy}-${i}`,
            actualAccess: i % 2 === 0 ? `${strategy}-${i}` : `other-${i}`,
            confidence: 0.7,
            timestamp: Date.now()
          });
        }
      }

      const metrics = prefetchSystem.getMetrics();

      for (const strategy of strategies) {
        const strategyMetrics = metrics.strategiesPerformance.get(strategy);
        expect(strategyMetrics).toBeDefined();
        expect(strategyMetrics?.predictions).toBe(10);
        expect(strategyMetrics?.accuracy).toBeCloseTo(0.5, 1);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle prediction model failures', async () => {
      // Mock model failure
      jest.spyOn(prefetchSystem as any, 'executeMLPrediction')
        .mockRejectedValueOnce(new Error('Model inference failed'));

      // Should fall back to simpler strategies
      const predictions = await prefetchSystem.predictNextAccess('test-key', {
        strategy: 'ml_prediction',
        fallback: 'sequential'
      });

      expect(predictions).toBeDefined();
      expect(predictions.length).toBeGreaterThan(0);
    });

    it('should handle network failures during prefetch', async () => {
      const networkError = new Error('Network unreachable');
      jest.spyOn(prefetchSystem as any, 'fetchItem')
        .mockRejectedValueOnce(networkError);

      const items = [{ key: 'network-fail-test', size: 1024, priority: 'medium' }];

      // Should not throw and should record the failure
      await expect(prefetchSystem.prefetchItems(items)).resolves.toBeDefined();

      const metrics = prefetchSystem.getMetrics();
      expect(metrics.falsePositives).toBeGreaterThan(0);
    });

    it('should handle memory pressure during training', async () => {
      // Simulate memory pressure
      const largeDissimilarDataset = Array(100000).fill(0).map((_, i) => ({
        features: Array(1000).fill(0).map(() => Math.random()),
        target: Math.random(),
        timestamp: Date.now() + i
      }));

      // Should handle gracefully without crashing
      await expect(prefetchSystem.trainNeuralNetwork('memory-test', largeDissimilarDataset))
        .resolves.toBeDefined();
    });

    it('should validate prediction inputs', async () => {
      // Test invalid inputs
      await expect(prefetchSystem.predictNextAccess('', { strategy: 'sequential' }))
        .rejects.toThrow('Invalid key');

      await expect(prefetchSystem.predictNextAccess('valid-key', {
        strategy: 'invalid' as any
      })).rejects.toThrow('Invalid strategy');

      await expect(prefetchSystem.predictNextAccess('valid-key', {
        strategy: 'sequential',
        lookAhead: -1
      })).rejects.toThrow('Invalid lookAhead');
    });
  });

  describe('V3 Performance Requirements', () => {
    it('should meet prediction latency targets (<1ms)', async () => {
      // Train a small model first
      const trainingData = Array(100).fill(0).map((_, i) => ({
        key: `perf-${i}`,
        timestamp: Date.now() + i * 1000,
        accessType: 'sequential'
      }));

      await prefetchSystem.trainModel('performance-test', trainingData);

      // Measure prediction performance
      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await prefetchSystem.predictNextAccess(`perf-${i}`, {
          strategy: 'sequential',
          lookAhead: 3
        });
        latencies.push(performance.now() - start);
      }

      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(0.95 * latencies.length)];

      expect(avgLatency).toBeLessThan(1); // < 1ms average
      expect(p95Latency).toBeLessThan(5); // < 5ms P95
    });

    it('should achieve target prefetch accuracy (>70%)', async () => {
      // Create predictable access pattern
      const sequentialAccess = Array(200).fill(0).map((_, i) => ({
        key: `accuracy-${i}`,
        timestamp: Date.now() + i * 1000
      }));

      await prefetchSystem.trainModel('accuracy-test', sequentialAccess);

      let correct = 0;
      let total = 0;

      for (let i = 0; i < 50; i++) {
        const predictions = await prefetchSystem.predictNextAccess(`accuracy-${i}`, {
          strategy: 'sequential',
          lookAhead: 1
        });

        total++;
        if (predictions.length > 0 && predictions[0].key === `accuracy-${i + 1}`) {
          correct++;
        }
      }

      const accuracy = correct / total;
      expect(accuracy).toBeGreaterThan(0.7); // > 70% accuracy target
    });

    it('should scale to handle 1000+ predictions/second', async () => {
      // Prepare model
      const trainingData = Array(500).fill(0).map((_, i) => ({
        key: `scale-${i}`,
        timestamp: Date.now() + i * 100
      }));

      await prefetchSystem.trainModel('scale-test', trainingData);

      // Generate concurrent predictions
      const concurrency = 100;
      const predictionsPerBatch = 10;

      const startTime = performance.now();

      const batches = Array(concurrency).fill(0).map(async (_, batch) => {
        const promises = Array(predictionsPerBatch).fill(0).map(async (_, i) => {
          return prefetchSystem.predictNextAccess(`scale-${batch * predictionsPerBatch + i}`, {
            strategy: 'sequential',
            lookAhead: 1
          });
        });
        return Promise.all(promises);
      });

      await Promise.all(batches);

      const duration = performance.now() - startTime;
      const totalPredictions = concurrency * predictionsPerBatch;
      const predictionsPerSecond = totalPredictions / (duration / 1000);

      expect(predictionsPerSecond).toBeGreaterThan(1000); // > 1000 predictions/sec
    });
  });
});