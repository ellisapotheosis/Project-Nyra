/**
 * Unit Tests for IntelligentCacheManager
 * Comprehensive test coverage for advanced caching strategies and optimization
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentCacheManager, CacheEntry, CacheStrategy, EvictionPolicy } from '../../../src/database/caching/intelligent-cache-manager';

describe('IntelligentCacheManager', () => {
  let cacheManager: IntelligentCacheManager;
  const nodeId = 'test-node-1';

  beforeEach(() => {
    cacheManager = new IntelligentCacheManager(nodeId);
  });

  afterEach(() => {
    cacheManager.destroy();
  });

  describe('Basic Cache Operations', () => {
    it('should get and put cache entries successfully', async () => {
      const cacheId = 'test-cache';
      const key = 'test-key';
      const value = { data: 'test-value', timestamp: Date.now() };

      // PUT operation
      await cacheManager.put(cacheId, key, value, { ttl: 60000 });

      // GET operation
      const result = await cacheManager.get(cacheId, key);

      expect(result).toEqual(value);

      const stats = cacheManager.getOptimizedStatistics(cacheId);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.operationCounts.gets).toBe(1);
      expect(stats.operationCounts.puts).toBe(1);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheManager.get('test-cache', 'non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle TTL expiration correctly', async () => {
      const cacheId = 'ttl-test';
      const key = 'expiring-key';
      const value = 'will-expire';

      await cacheManager.put(cacheId, key, value, { ttl: 100 }); // 100ms TTL

      // Should exist immediately
      let result = await cacheManager.get(cacheId, key);
      expect(result).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      result = await cacheManager.get(cacheId, key);
      expect(result).toBeNull();
    });
  });

  describe('Access Pattern Tracking', () => {
    it('should track access patterns correctly', async () => {
      const cacheId = 'pattern-test';
      const key = 'tracked-key';
      const value = 'tracked-value';

      await cacheManager.put(cacheId, key, value);

      // Access multiple times
      for (let i = 0; i < 5; i++) {
        await cacheManager.get(cacheId, key);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const entry = cacheManager.getCacheEntry(cacheId, key);
      expect(entry).toBeDefined();
      expect(entry!.accessPattern.accessCount).toBe(5);
      expect(entry!.accessPattern.accessTimes.length).toBe(5);
    });

    it('should detect temporal patterns', async () => {
      const cacheId = 'temporal-test';
      const key = 'pattern-key';
      const value = 'pattern-value';

      await cacheManager.put(cacheId, key, value);

      // Regular access pattern
      for (let i = 0; i < 10; i++) {
        await cacheManager.get(cacheId, key);
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms intervals
      }

      const entry = cacheManager.getCacheEntry(cacheId, key);
      expect(entry!.accessPattern.temporalPattern).toBe('regular');
    });
  });

  describe('Eviction Strategies', () => {
    it('should evict entries using LRU policy', async () => {
      const cacheId = 'lru-test';
      const strategy: CacheStrategy = {
        name: 'lru-test-strategy',
        evictionPolicy: {
          algorithm: 'lru',
          parameters: {
            maxSize: 3, // Only 3 entries max
            memoryThreshold: 0.8,
            importanceWeight: 1,
            accessPatternWeight: 1,
            temporalWeight: 1
          }
        },
        prefetchPolicy: { enabled: false, strategies: [], maxPrefetchSize: 0, confidence_threshold: 0, networkBandwidthLimit: 0 },
        ttlPolicy: { defaultTTL: 300000, dynamicTTL: false, factors: { accessFrequency: 1, importance: 1, dataType: 1, updateFrequency: 1 } },
        partitioningStrategy: { enabled: false, type: 'hash', partitions: [], rebalanceThreshold: 0.7 },
        replicationStrategy: { enabled: false, factor: 1, consistency: 'eventual', placement: 'performance' }
      };

      cacheManager.setCacheStrategy(cacheId, strategy);

      // Add 4 entries (exceeds limit of 3)
      await cacheManager.put(cacheId, 'key1', 'value1');
      await cacheManager.put(cacheId, 'key2', 'value2');
      await cacheManager.put(cacheId, 'key3', 'value3');

      // Access key1 to make it recently used
      await cacheManager.get(cacheId, 'key1');

      // Add 4th entry, should evict key2 (least recently used)
      await cacheManager.put(cacheId, 'key4', 'value4');

      expect(await cacheManager.get(cacheId, 'key1')).toBe('value1'); // Still exists
      expect(await cacheManager.get(cacheId, 'key2')).toBeNull();     // Evicted
      expect(await cacheManager.get(cacheId, 'key3')).toBe('value3'); // Still exists
      expect(await cacheManager.get(cacheId, 'key4')).toBe('value4'); // New entry
    });

    it('should respect importance weights in eviction', async () => {
      const cacheId = 'importance-test';
      const strategy: CacheStrategy = {
        name: 'importance-strategy',
        evictionPolicy: {
          algorithm: 'adaptive_lru',
          parameters: {
            maxSize: 2,
            memoryThreshold: 0.8,
            importanceWeight: 10, // High importance weight
            accessPatternWeight: 1,
            temporalWeight: 1
          }
        },
        prefetchPolicy: { enabled: false, strategies: [], maxPrefetchSize: 0, confidence_threshold: 0, networkBandwidthLimit: 0 },
        ttlPolicy: { defaultTTL: 300000, dynamicTTL: false, factors: { accessFrequency: 1, importance: 1, dataType: 1, updateFrequency: 1 } },
        partitioningStrategy: { enabled: false, type: 'hash', partitions: [], rebalanceThreshold: 0.7 },
        replicationStrategy: { enabled: false, factor: 1, consistency: 'eventual', placement: 'performance' }
      };

      cacheManager.setCacheStrategy(cacheId, strategy);

      // Add high importance entry
      await cacheManager.put(cacheId, 'important', 'high-value', { importance: 10 });

      // Add low importance entry
      await cacheManager.put(cacheId, 'unimportant', 'low-value', { importance: 1 });

      // Add third entry, should evict the low importance one
      await cacheManager.put(cacheId, 'medium', 'med-value', { importance: 5 });

      expect(await cacheManager.get(cacheId, 'important')).toBe('high-value');
      expect(await cacheManager.get(cacheId, 'unimportant')).toBeNull();
      expect(await cacheManager.get(cacheId, 'medium')).toBe('med-value');
    });
  });

  describe('Predictive Prefetching', () => {
    it('should predict sequential access patterns', async () => {
      const cacheId = 'prefetch-sequential';

      // Enable prefetching
      const strategy = cacheManager.getCacheStrategy(cacheId);
      strategy.prefetchPolicy.enabled = true;
      strategy.prefetchPolicy.strategies = [
        {
          type: 'sequential',
          parameters: { lookAhead: 3, confidence: 0.8 },
          weight: 1,
          enabled: true
        }
      ];

      // Access sequential keys to establish pattern
      for (let i = 1; i <= 5; i++) {
        await cacheManager.put(cacheId, `item-${i}`, `value-${i}`);
        await cacheManager.get(cacheId, `item-${i}`);
      }

      // Access item-6, should trigger prefetch of item-7, item-8, item-9
      await cacheManager.get(cacheId, 'item-6');

      // Wait for prefetch to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if prefetched items exist in prediction cache
      const prefetchMetrics = cacheManager.getPrefetchMetrics(cacheId);
      expect(prefetchMetrics.totalPredictions).toBeGreaterThan(0);
    });

    it('should handle associative prefetching', async () => {
      const cacheId = 'prefetch-associative';

      const strategy = cacheManager.getCacheStrategy(cacheId);
      strategy.prefetchPolicy.enabled = true;
      strategy.prefetchPolicy.strategies = [
        {
          type: 'associative',
          parameters: { maxAssociations: 5, minCorrelation: 0.3 },
          weight: 1,
          enabled: true
        }
      ];

      // Create association pattern: A->B, A->C, B->C
      const associations = [
        ['page-A', 'page-B'],
        ['page-A', 'page-C'],
        ['page-B', 'page-C'],
        ['page-A', 'page-B'], // Reinforce association
        ['page-A', 'page-C']  // Reinforce association
      ];

      for (const [first, second] of associations) {
        await cacheManager.put(cacheId, first, `content-${first}`);
        await cacheManager.get(cacheId, first);
        await cacheManager.put(cacheId, second, `content-${second}`);
        await cacheManager.get(cacheId, second);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Access page-A, should trigger prefetch of associated pages
      await cacheManager.get(cacheId, 'page-A');

      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = cacheManager.getPrefetchMetrics(cacheId);
      expect(stats.strategiesPerformance.get('associative')?.predictions).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle cache corruption gracefully', async () => {
      const cacheId = 'corruption-test';

      // Put valid entry
      await cacheManager.put(cacheId, 'valid-key', 'valid-value');

      // Simulate corruption by modifying internal state
      const cache = cacheManager.getCache(cacheId);
      const entry = cache.get('valid-key')!;
      entry.checksum = 'invalid-checksum';

      // Should detect corruption and return null
      const result = await cacheManager.get(cacheId, 'valid-key');
      expect(result).toBeNull();

      // Should emit corruption event
      const corruptionPromise = new Promise(resolve => {
        cacheManager.once('corruption', resolve);
      });

      await cacheManager.get(cacheId, 'valid-key');
      await corruptionPromise;
    });

    it('should handle memory pressure', async () => {
      const cacheId = 'memory-pressure-test';

      // Set low memory threshold
      const strategy = cacheManager.getCacheStrategy(cacheId);
      strategy.evictionPolicy.parameters.memoryThreshold = 0.1; // Very low threshold

      // Fill cache beyond memory threshold
      const largeValue = 'x'.repeat(1024 * 1024); // 1MB string

      await expect(async () => {
        for (let i = 0; i < 100; i++) {
          await cacheManager.put(cacheId, `large-${i}`, largeValue);
        }
      }).not.toThrow();

      const stats = cacheManager.getOptimizedStatistics(cacheId);
      expect(stats.evictionCount).toBeGreaterThan(0);
    });

    it('should handle concurrent access correctly', async () => {
      const cacheId = 'concurrent-test';
      const key = 'concurrent-key';
      const numConcurrent = 50;

      // Start concurrent operations
      const operations = Array(numConcurrent).fill(0).map(async (_, i) => {
        if (i % 2 === 0) {
          await cacheManager.put(cacheId, key, `value-${i}`);
        } else {
          await cacheManager.get(cacheId, key);
        }
      });

      await expect(Promise.all(operations)).resolves.not.toThrow();

      const stats = cacheManager.getOptimizedStatistics(cacheId);
      expect(stats.operationCounts.gets + stats.operationCounts.puts).toBe(numConcurrent);
    });
  });

  describe('Performance Optimization', () => {
    it('should batch operations for better performance', async () => {
      const cacheId = 'batch-test';
      const batchSize = 100;

      const start = Date.now();

      // Batch operations
      const batchOps = Array(batchSize).fill(0).map((_, i) => ({
        key: `batch-${i}`,
        value: `value-${i}`,
        ttl: 60000
      }));

      await cacheManager.putBatch(cacheId, batchOps);
      const batchKeys = batchOps.map(op => op.key);
      const results = await cacheManager.getBatch(cacheId, batchKeys);

      const duration = Date.now() - start;

      expect(results.size).toBe(batchSize);
      expect(duration).toBeLessThan(1000); // Should be fast

      const stats = cacheManager.getOptimizedStatistics(cacheId);
      expect(stats.operationCounts.puts).toBe(batchSize);
      expect(stats.operationCounts.gets).toBe(batchSize);
    });

    it('should maintain performance under load', async () => {
      const cacheId = 'load-test';
      const operations = 1000;
      const maxLatency = 100; // 100ms max per operation

      const latencies: number[] = [];

      for (let i = 0; i < operations; i++) {
        const start = Date.now();

        if (i % 3 === 0) {
          await cacheManager.put(cacheId, `load-${i}`, `value-${i}`);
        } else {
          await cacheManager.get(cacheId, `load-${i % 100}`); // Access recent items
        }

        const latency = Date.now() - start;
        latencies.push(latency);
      }

      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const maxObservedLatency = Math.max(...latencies);

      expect(avgLatency).toBeLessThan(50); // Average should be under 50ms
      expect(maxObservedLatency).toBeLessThan(maxLatency);
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks in circular buffer', async () => {
      const cacheId = 'memory-leak-test';

      // Add many entries with access patterns
      for (let i = 0; i < 10000; i++) {
        await cacheManager.put(cacheId, `key-${i}`, `value-${i}`);
        await cacheManager.get(cacheId, `key-${i}`);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memUsage = process.memoryUsage();

      // Memory usage should be reasonable (less than 100MB for test)
      expect(memUsage.heapUsed).toBeLessThan(100 * 1024 * 1024);

      // Access patterns should be capped
      const cache = cacheManager.getCache(cacheId);
      for (const [, entry] of cache) {
        expect(entry.accessPattern.accessTimes.length).toBeLessThanOrEqual(1000);
      }
    });

    it('should clean up expired entries properly', async () => {
      const cacheId = 'cleanup-test';

      // Add entries with short TTL
      for (let i = 0; i < 100; i++) {
        await cacheManager.put(cacheId, `temp-${i}`, `value-${i}`, { ttl: 50 });
      }

      expect(cacheManager.getCache(cacheId).size).toBe(100);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger cleanup
      await cacheManager.runCleanupCycle(cacheId);

      expect(cacheManager.getCache(cacheId).size).toBe(0);
    });
  });
});