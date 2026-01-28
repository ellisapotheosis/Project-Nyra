/**
 * Performance Tests for Caching System
 * Tests V3 performance targets and optimization effectiveness
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { performance } from 'perf_hooks';
import { CachingPerformanceBenchmark } from '../../src/database/caching/performance-benchmark-suite';
import { OptimizedCacheManager } from '../../src/database/caching/optimized-cache-manager';
import { IntelligentPrefetchSystem } from '../../src/database/caching/intelligent-prefetch-system';

describe('Caching Performance Tests', () => {
  let benchmark: CachingPerformanceBenchmark;
  let cacheManager: OptimizedCacheManager;
  let prefetchSystem: IntelligentPrefetchSystem;

  const V3_PERFORMANCE_TARGETS = {
    flashAttentionSpeedup: { min: 2.49, max: 7.47 },
    hnswSearchImprovement: { min: 150, max: 12500 },
    memoryReduction: { min: 0.50, max: 0.75 },
    mcpResponseTime: { max: 100 }, // ms
    sonaAdaptationTime: { max: 0.05 } // ms
  };

  beforeEach(() => {
    benchmark = new CachingPerformanceBenchmark();
    cacheManager = new OptimizedCacheManager('perf-test-node', {
      maxMemoryUsage: 512 * 1024 * 1024, // 512MB
      enableOptimizations: true
    });
    prefetchSystem = new IntelligentPrefetchSystem({
      maxBandwidthBps: 100 * 1024 * 1024, // 100 Mbps
      adaptiveBandwidth: true,
      maxTrainingData: 50000
    });
  });

  afterEach(async () => {
    await benchmark.cleanup();
    await cacheManager.destroy();
    await prefetchSystem.destroy();
  });

  describe('V3 Performance Target Validation', () => {
    it('should achieve MCP response time target (<100ms)', async () => {
      const iterations = 100;
      const latencies: number[] = [];

      // Warm up cache
      for (let i = 0; i < 10; i++) {
        await cacheManager.put('perf-cache', `warmup-${i}`, `value-${i}`);
      }

      // Measure response times
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await cacheManager.get('perf-cache', `warmup-${i % 10}`);
        const latency = performance.now() - start;
        latencies.push(latency);
      }

      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(0.95 * latencies.length)];
      const p99Latency = latencies.sort((a, b) => a - b)[Math.floor(0.99 * latencies.length)];

      expect(avgLatency).toBeLessThan(V3_PERFORMANCE_TARGETS.mcpResponseTime.max);
      expect(p95Latency).toBeLessThan(V3_PERFORMANCE_TARGETS.mcpResponseTime.max * 2);
      expect(p99Latency).toBeLessThan(V3_PERFORMANCE_TARGETS.mcpResponseTime.max * 3);

      console.log(`MCP Response Times - Avg: ${avgLatency.toFixed(2)}ms, P95: ${p95Latency.toFixed(2)}ms, P99: ${p99Latency.toFixed(2)}ms`);
    });

    it('should achieve memory reduction targets (50-75%)', async () => {
      const baselineData = Array(10000).fill(0).map((_, i) => ({
        key: `baseline-${i}`,
        value: {
          id: i,
          data: `baseline data ${i}`.repeat(10),
          metadata: { created: Date.now(), type: 'baseline' }
        }
      }));

      // Measure baseline memory usage (unoptimized)
      const baselineMemBefore = process.memoryUsage().heapUsed;
      const baselineCache = new Map();

      baselineData.forEach(({ key, value }) => {
        baselineCache.set(key, {
          value,
          accessTimes: Array(100).fill(Date.now()), // Unoptimized: unbounded array
          metadata: { ...value.metadata, extraData: 'unoptimized' }
        });
      });

      const baselineMemAfter = process.memoryUsage().heapUsed;
      const baselineMemUsage = baselineMemAfter - baselineMemBefore;

      // Measure optimized memory usage
      const optimizedMemBefore = process.memoryUsage().heapUsed;

      for (const { key, value } of baselineData) {
        await cacheManager.put('memory-test', key, value);
      }

      const optimizedMemAfter = process.memoryUsage().heapUsed;
      const optimizedMemUsage = optimizedMemAfter - optimizedMemBefore;

      const memoryReduction = (baselineMemUsage - optimizedMemUsage) / baselineMemUsage;

      expect(memoryReduction).toBeGreaterThanOrEqual(V3_PERFORMANCE_TARGETS.memoryReduction.min);
      expect(memoryReduction).toBeLessThanOrEqual(V3_PERFORMANCE_TARGETS.memoryReduction.max);

      console.log(`Memory Reduction: ${(memoryReduction * 100).toFixed(1)}% (Baseline: ${(baselineMemUsage / 1024 / 1024).toFixed(1)}MB, Optimized: ${(optimizedMemUsage / 1024 / 1024).toFixed(1)}MB)`);
    });

    it('should achieve HNSW search improvement targets (150x-12,500x)', async () => {
      const searchData = Array(5000).fill(0).map((_, i) => ({
        key: `search-${i}`,
        value: {
          content: `searchable content ${i} with various keywords and metadata`,
          vector: Array(128).fill(0).map(() => Math.random()),
          category: `category-${i % 10}`,
          tags: [`tag-${i % 20}`, `type-${i % 5}`]
        }
      }));

      // Add data to cache
      for (const { key, value } of searchData) {
        await cacheManager.put('search-test', key, value);
      }

      // Measure linear search (baseline)
      const linearSearchStart = performance.now();
      let linearResults = 0;
      const searchQuery = 'searchable content';

      for (let i = 0; i < 100; i++) {
        // Simulate linear search through all entries
        for (const { value } of searchData) {
          if (value.content.includes(searchQuery)) {
            linearResults++;
          }
        }
      }

      const linearSearchTime = performance.now() - linearSearchStart;

      // Measure optimized search (HNSW-like optimized search)
      const optimizedSearchStart = performance.now();
      let optimizedResults = 0;

      for (let i = 0; i < 100; i++) {
        const results = await cacheManager.searchSimilar('search-test', searchQuery, 10);
        optimizedResults += results.length;
      }

      const optimizedSearchTime = performance.now() - optimizedSearchStart;

      const speedupRatio = linearSearchTime / optimizedSearchTime;

      expect(speedupRatio).toBeGreaterThanOrEqual(V3_PERFORMANCE_TARGETS.hnswSearchImprovement.min);

      console.log(`Search Speedup: ${speedupRatio.toFixed(1)}x (Linear: ${linearSearchTime.toFixed(2)}ms, Optimized: ${optimizedSearchTime.toFixed(2)}ms)`);
    });

    it('should achieve SONA adaptation time target (<0.05ms)', async () => {
      // Simulate rapid parameter adaptation scenarios
      const adaptationTimes: number[] = [];
      const numAdaptations = 1000;

      for (let i = 0; i < numAdaptations; i++) {
        const start = performance.now();

        // Simulate SONA adaptation (parameter adjustment based on performance)
        await cacheManager.adaptStrategy('sona-test', {
          performanceMetric: Math.random(),
          targetValue: 0.8,
          adaptationRate: 0.01
        });

        const adaptationTime = performance.now() - start;
        adaptationTimes.push(adaptationTime);
      }

      const avgAdaptationTime = adaptationTimes.reduce((a, b) => a + b) / adaptationTimes.length;
      const maxAdaptationTime = Math.max(...adaptationTimes);
      const p95AdaptationTime = adaptationTimes.sort((a, b) => a - b)[Math.floor(0.95 * adaptationTimes.length)];

      expect(avgAdaptationTime).toBeLessThan(V3_PERFORMANCE_TARGETS.sonaAdaptationTime.max);
      expect(p95AdaptationTime).toBeLessThan(V3_PERFORMANCE_TARGETS.sonaAdaptationTime.max * 2);

      console.log(`SONA Adaptation Times - Avg: ${avgAdaptationTime.toFixed(4)}ms, Max: ${maxAdaptationTime.toFixed(4)}ms, P95: ${p95AdaptationTime.toFixed(4)}ms`);
    });
  });

  describe('Load Testing', () => {
    it('should maintain performance under high concurrent load', async () => {
      const concurrentUsers = 50;
      const operationsPerUser = 100;
      const maxLatencyThreshold = 200; // ms

      const userOperations = Array(concurrentUsers).fill(0).map(async (_, userId) => {
        const userLatencies: number[] = [];

        for (let i = 0; i < operationsPerUser; i++) {
          const start = performance.now();

          if (i % 3 === 0) {
            await cacheManager.put(`load-test-${userId}`, `key-${i}`, {
              userId,
              data: `user ${userId} data ${i}`,
              timestamp: Date.now()
            });
          } else {
            await cacheManager.get(`load-test-${userId}`, `key-${i % 30}`);
          }

          const latency = performance.now() - start;
          userLatencies.push(latency);
        }

        return userLatencies;
      });

      const allLatencies = (await Promise.all(userOperations)).flat();
      const avgLatency = allLatencies.reduce((a, b) => a + b) / allLatencies.length;
      const maxLatency = Math.max(...allLatencies);
      const p95Latency = allLatencies.sort((a, b) => a - b)[Math.floor(0.95 * allLatencies.length)];

      expect(avgLatency).toBeLessThan(maxLatencyThreshold);
      expect(p95Latency).toBeLessThan(maxLatencyThreshold * 2);

      console.log(`Load Test Results - Avg: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms, P95: ${p95Latency.toFixed(2)}ms`);

      // Verify no operations failed
      const stats = cacheManager.getOptimizedStatistics('load-test-0');
      expect(stats.errorRate).toBeLessThan(0.01); // Less than 1% error rate
    });

    it('should handle memory pressure gracefully', async () => {
      const largeDataSize = 1024 * 1024; // 1MB per entry
      const numEntries = 600; // Should exceed 512MB limit

      const memoryBefore = process.memoryUsage();
      let successfulInserts = 0;

      for (let i = 0; i < numEntries; i++) {
        try {
          await cacheManager.put('memory-pressure-test', `large-${i}`, {
            data: 'x'.repeat(largeDataSize),
            index: i
          });
          successfulInserts++;
        } catch (error) {
          // Expected to start failing at some point due to memory limits
          break;
        }

        // Check if we're approaching memory limits
        const currentMemory = process.memoryUsage();
        if (currentMemory.heapUsed > memoryBefore.heapUsed + (512 * 1024 * 1024)) {
          break;
        }
      }

      const memoryAfter = process.memoryUsage();
      const memoryUsed = memoryAfter.heapUsed - memoryBefore.heapUsed;

      // Should not exceed configured memory limit significantly
      expect(memoryUsed).toBeLessThan(600 * 1024 * 1024); // 600MB max

      // Should have successfully handled memory pressure
      expect(successfulInserts).toBeGreaterThan(100);

      // Cache should still be responsive
      const testStart = performance.now();
      await cacheManager.get('memory-pressure-test', 'large-0');
      const testLatency = performance.now() - testStart;

      expect(testLatency).toBeLessThan(100); // Still fast despite memory pressure

      console.log(`Memory Pressure Test - Inserted: ${successfulInserts} entries, Memory Used: ${(memoryUsed / 1024 / 1024).toFixed(1)}MB, Response Time: ${testLatency.toFixed(2)}ms`);
    });
  });

  describe('Prefetch System Performance', () => {
    it('should improve hit rates with predictive prefetching', async () => {
      // Establish access pattern
      const sequentialKeys = Array(100).fill(0).map((_, i) => `seq-${i}`);

      // Add data
      for (const key of sequentialKeys) {
        await cacheManager.put('prefetch-test', key, `data-${key}`);
      }

      // Create access pattern without prefetching
      cacheManager.disablePrefetching('prefetch-test');

      let baselineHits = 0;
      for (let i = 0; i < 50; i++) {
        const result = await cacheManager.get('prefetch-test', sequentialKeys[i]);
        if (result) baselineHits++;
      }

      cacheManager.clearCache('prefetch-test');

      // Add data back
      for (const key of sequentialKeys) {
        await cacheManager.put('prefetch-test', key, `data-${key}`);
      }

      // Enable prefetching
      cacheManager.enablePrefetching('prefetch-test', {
        strategies: ['sequential', 'temporal'],
        confidence: 0.7,
        maxPrefetchSize: 10
      });

      // Create same access pattern with prefetching
      let prefetchHits = 0;
      for (let i = 0; i < 50; i++) {
        const result = await cacheManager.get('prefetch-test', sequentialKeys[i]);
        if (result) prefetchHits++;

        // Allow time for prefetching
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }

      const hitRateImprovement = (prefetchHits - baselineHits) / baselineHits;

      expect(hitRateImprovement).toBeGreaterThan(0.1); // At least 10% improvement
      expect(prefetchHits).toBeGreaterThanOrEqual(baselineHits);

      console.log(`Prefetch Hit Rate Improvement: ${(hitRateImprovement * 100).toFixed(1)}% (Baseline: ${baselineHits}, Prefetch: ${prefetchHits})`);
    });

    it('should respect bandwidth limits during prefetching', async () => {
      const bandwidthLimit = 10 * 1024 * 1024; // 10 MB/s
      prefetchSystem.setBandwidthLimit(bandwidthLimit);

      const largeData = 'x'.repeat(100 * 1024); // 100KB per item
      const numItems = 200; // 20MB total

      // Add large data items
      for (let i = 0; i < numItems; i++) {
        await cacheManager.put('bandwidth-test', `large-${i}`, largeData);
      }

      const prefetchStart = performance.now();

      // Trigger aggressive prefetching
      await prefetchSystem.prefetchRange('bandwidth-test', 'large-0', 'large-199');

      const prefetchDuration = performance.now() - prefetchStart;
      const expectedMinDuration = (20 * 1024 * 1024) / bandwidthLimit * 1000; // ms

      // Should respect bandwidth limits (allow some tolerance)
      expect(prefetchDuration).toBeGreaterThan(expectedMinDuration * 0.8);

      console.log(`Bandwidth Limited Prefetch - Duration: ${prefetchDuration.toFixed(0)}ms, Expected Min: ${expectedMinDuration.toFixed(0)}ms`);
    });
  });

  describe('Comprehensive Performance Benchmark', () => {
    it('should run full benchmark suite and achieve target scores', async () => {
      const report = await benchmark.runFullSuite();

      expect(report.summary.overallScore).toBeGreaterThan(80); // 80+ overall score
      expect(report.summary.criticalIssues).toHaveLength(0);

      // Check individual component scores
      const cacheManagerResults = report.results.cacheManager;
      const redisClientResults = report.results.redisClient;
      const prefetchSystemResults = report.results.prefetchSystem;
      const integratedResults = report.results.integrated;

      // All components should have passing tests
      expect(cacheManagerResults.every(result => result.succeeded)).toBe(true);
      expect(redisClientResults.every(result => result.succeeded)).toBe(true);
      expect(prefetchSystemResults.every(result => result.succeeded)).toBe(true);
      expect(integratedResults.every(result => result.succeeded)).toBe(true);

      // Performance targets should be met
      const targetsAchievedRatio = report.summary.targetsAchieved / report.summary.totalTargets;
      expect(targetsAchievedRatio).toBeGreaterThan(0.9); // 90%+ targets achieved

      console.log(`Benchmark Results:
        Overall Score: ${report.summary.overallScore}
        Targets Achieved: ${report.summary.targetsAchieved}/${report.summary.totalTargets} (${(targetsAchievedRatio * 100).toFixed(1)}%)
        Cache Manager Tests: ${cacheManagerResults.length} passed
        Redis Client Tests: ${redisClientResults.length} passed
        Prefetch System Tests: ${prefetchSystemResults.length} passed
        Integrated Tests: ${integratedResults.length} passed
      `);

      if (report.summary.recommendations.length > 0) {
        console.log('Recommendations:');
        report.summary.recommendations.forEach(rec => {
          console.log(`  - ${rec.title}: ${rec.description}`);
        });
      }
    });
  });

  describe('Regression Prevention', () => {
    it('should maintain consistent performance over time', async () => {
      const measurements = [];
      const numRounds = 10;
      const operationsPerRound = 1000;

      for (let round = 0; round < numRounds; round++) {
        const roundStart = performance.now();

        for (let i = 0; i < operationsPerRound; i++) {
          if (i % 2 === 0) {
            await cacheManager.put('regression-test', `key-${i}`, `value-${i}`);
          } else {
            await cacheManager.get('regression-test', `key-${i - 1}`);
          }
        }

        const roundDuration = performance.now() - roundStart;
        const opsPerSecond = operationsPerRound / (roundDuration / 1000);

        measurements.push({
          round,
          duration: roundDuration,
          opsPerSecond,
          memoryUsage: process.memoryUsage().heapUsed
        });

        // Brief pause between rounds
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Performance should be stable (coefficient of variation < 0.2)
      const avgOpsPerSecond = measurements.reduce((sum, m) => sum + m.opsPerSecond, 0) / measurements.length;
      const stdDev = Math.sqrt(
        measurements.reduce((sum, m) => sum + Math.pow(m.opsPerSecond - avgOpsPerSecond, 2), 0) / measurements.length
      );
      const coefficientOfVariation = stdDev / avgOpsPerSecond;

      expect(coefficientOfVariation).toBeLessThan(0.2); // Less than 20% variation

      // Memory usage should be stable (no significant leaks)
      const firstMemory = measurements[0].memoryUsage;
      const lastMemory = measurements[measurements.length - 1].memoryUsage;
      const memoryGrowth = (lastMemory - firstMemory) / firstMemory;

      expect(memoryGrowth).toBeLessThan(0.1); // Less than 10% memory growth

      console.log(`Regression Test Results:
        Avg Ops/sec: ${avgOpsPerSecond.toFixed(0)}
        Performance Stability: ${(coefficientOfVariation * 100).toFixed(1)}% CV
        Memory Growth: ${(memoryGrowth * 100).toFixed(1)}%
      `);
    });
  });
});