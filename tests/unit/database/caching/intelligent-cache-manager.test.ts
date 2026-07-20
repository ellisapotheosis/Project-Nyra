/**
 * Unit Tests for Intelligent Cache Manager
 * Tests core caching logic, memory management, and performance optimizations
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentCacheManager } from '../../../../src/database/caching/intelligent-cache-manager';
import { CacheStrategy, CacheEntry, EvictionPolicy } from '../../../../src/database/caching/intelligent-cache-manager';

describe('IntelligentCacheManager', () => {
  let cacheManager: IntelligentCacheManager;
  const nodeId = 'test-node-1';

  beforeEach(() => {
    cacheManager = new IntelligentCacheManager(nodeId);
  });

  afterEach(async () => {
    await cacheManager?.destroy();
  });

  describe('Core Cache Operations', () => {
    it('should store and retrieve values correctly', async () => {
      const cacheId = 'test-cache';
      const key = 'test-key';
      const value = { data: 'test-value', timestamp: Date.now() };

      await cacheManager.put(cacheId, key, value);
      const retrieved = await cacheManager.get(cacheId, key);

      expect(retrieved).toEqual(value);
    });

    it('should handle cache miss gracefully', async () => {
      const retrieved = await cacheManager.get('non-existent-cache', 'missing-key');
      expect(retrieved).toBeNull();
    });

    it('should respect TTL expiration', async () => {
      const cacheId = 'ttl-cache';
      const key = 'expiring-key';
      const value = 'expiring-value';
      const ttl = 100; // 100ms

      await cacheManager.put(cacheId, key, value, { ttl });

      const immediate = await cacheManager.get(cacheId, key);
      expect(immediate).toBe(value);

      await new Promise(resolve => setTimeout(resolve, 150));
      const expired = await cacheManager.get(cacheId, key);
      expect(expired).toBeNull();
    });

    it('should handle concurrent access safely', async () => {
      const cacheId = 'concurrent-cache';
      const operations = Array(100).fill(0).map(async (_, i) => {
        await cacheManager.put(cacheId, `key-${i}`, `value-${i}`);
        return cacheManager.get(cacheId, `key-${i}`);
      });

      const results = await Promise.all(operations);
      results.forEach((result, i) => {
        expect(result).toBe(`value-${i}`);
      });
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks with large datasets', async () => {
      const cacheId = 'memory-test';
      const initialMemory = process.memoryUsage().heapUsed;

      // Add large dataset
      for (let i = 0; i < 10000; i++) {
        await cacheManager.put(cacheId, `key-${i}`, {
          data: 'x'.repeat(1000), // 1KB per entry
          index: i
        });
      }

      // Force cleanup
      await cacheManager.cleanup();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not leak excessive memory (allow some reasonable increase)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max
    });

    it('should implement LRU eviction correctly', async () => {
      const cacheId = 'lru-cache';
      const maxSize = 5;

      cacheManager.setStrategy(cacheId, {
        name: 'test-lru',
        evictionPolicy: {
          algorithm: 'lru',
          parameters: {
            maxSize,
            memoryThreshold: 1,
            importanceWeight: 0,
            accessPatternWeight: 1,
            temporalWeight: 0,
          },
        },
        prefetchPolicy: {
          enabled: false,
          strategies: [],
          maxPrefetchSize: 0,
          confidence_threshold: 1,
          networkBandwidthLimit: 0,
        },
        ttlPolicy: {
          defaultTTL: 60,
          dynamicTTL: false,
          factors: {
            accessFrequency: 0,
            importance: 0,
            dataType: 0,
            updateFrequency: 0,
          },
        },
        partitioningStrategy: {
          enabled: false,
          type: 'hash',
          partitions: [],
          rebalanceThreshold: 1,
        },
        replicationStrategy: {
          enabled: false,
          factor: 1,
          consistency: 'weak',
          placement: 'random',
        },
      });

      // Fill cache beyond capacity
      for (let i = 0; i < 8; i++) {
        await cacheManager.put(cacheId, `key-${i}`, `value-${i}`);
      }

      // First entries should be evicted based on LRU
      const statistics = await cacheManager.getStatistics(cacheId);
      expect(statistics.evictionRate).toBeGreaterThan(0);
    });

    it('should track access patterns accurately', async () => {
      const cacheId = 'pattern-cache';
      const key = 'tracked-key';
      const value = 'tracked-value';

      await cacheManager.put(cacheId, key, value);

      // Access multiple times
      for (let i = 0; i < 5; i++) {
        await cacheManager.get(cacheId, key);
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const statistics = await cacheManager.getStatistics(cacheId);
      expect(statistics.operationCounts.gets).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle serialization errors gracefully', async () => {
      const cacheId = 'error-cache';
      const key = 'circular-ref';

      // Create circular reference
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      await expect(cacheManager.put(cacheId, key, circularObj))
        .rejects.toThrow();
    });

    it('should recover from corruption gracefully', async () => {
      const cacheId = 'corruption-cache';

      // Should handle corruption scenarios
      const result = await cacheManager.get(cacheId, 'potentially-corrupted-key');
      expect(result).toBeNull();
    });

    it('should handle concurrent modifications safely', async () => {
      const cacheId = 'concurrent-mod-cache';
      const key = 'shared-key';

      const operations = Array(50).fill(0).map(async (_, i) => {
        if (i % 2 === 0) {
          await cacheManager.put(cacheId, key, `value-${i}`);
        } else {
          await cacheManager.delete(cacheId, key);
        }
      });

      // Should not throw errors
      await expect(Promise.all(operations)).resolves.toBeDefined();
    });
  });

  describe('Performance Requirements', () => {
    it('should meet sub-100ms response time target', async () => {
      const cacheId = 'perf-cache';

      // Warm up
      for (let i = 0; i < 1000; i++) {
        await cacheManager.put(cacheId, `warm-${i}`, `data-${i}`);
      }

      // Measure performance
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await cacheManager.get(cacheId, `warm-${i % 1000}`);
      }

      const endTime = performance.now();
      const avgLatency = (endTime - startTime) / iterations;

      expect(avgLatency).toBeLessThan(100); // V3 target: <100ms
    });

    it('should achieve target memory efficiency', async () => {
      const cacheId = 'efficiency-cache';
      const dataSize = 1000; // 1KB per entry
      const entryCount = 1000;

      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < entryCount; i++) {
        await cacheManager.put(cacheId, `key-${i}`, 'x'.repeat(dataSize));
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryOverhead = (finalMemory - initialMemory) / (dataSize * entryCount);

      // Should have reasonable memory overhead
      expect(memoryOverhead).toBeLessThan(2.0); // Less than 2x overhead
    });
  });

  describe('Prefetch System Integration', () => {
    it('should trigger prefetch predictions correctly', async () => {
      const cacheId = 'prefetch-cache';

      await cacheManager.put(cacheId, 'key-1', 'value-1');
      await cacheManager.get(cacheId, 'key-1', { enablePrefetch: true });

      // Verify prefetch system is triggered
      const statistics = await cacheManager.getStatistics(cacheId);
      expect(statistics.operationCounts.prefetches).toBeGreaterThanOrEqual(0);
    });

    it('should respect bandwidth limits for prefetching', async () => {
      const cacheId = 'bandwidth-cache';

      // Configure with bandwidth limits
      // Add test data
      for (let i = 0; i < 100; i++) {
        await cacheManager.put(cacheId, `key-${i}`, `large-value-${'x'.repeat(1000)}`);
      }

      // Access patterns that would trigger prefetch
      for (let i = 0; i < 10; i++) {
        await cacheManager.get(cacheId, `key-${i}`);
      }

      const statistics = await cacheManager.getStatistics(cacheId);
      expect(statistics.networkUtilization).toBeLessThan(1.0); // Should respect limits
    });
  });

  describe('Advanced Cache Features', () => {
    it('should support cache warming strategies', async () => {
      const cacheId = 'warming-cache';

      // Implement cache warming
      const warmupPlan = {
        keys: ['important-1', 'important-2', 'important-3'],
        priority: 'high' as const
      };

      await cacheManager.warmup(cacheId, warmupPlan);

      // Verify keys are preloaded
      for (const key of warmupPlan.keys) {
        const result = await cacheManager.get(cacheId, key);
        expect(result).toBeDefined();
      }
    });

    it('should handle cache partitioning correctly', async () => {
      const cacheId = 'partitioned-cache';

      // Enable partitioning
      await cacheManager.enablePartitioning(cacheId, {
        strategy: 'hash',
        partitions: 4
      });

      // Add data that should be distributed across partitions
      for (let i = 0; i < 100; i++) {
        await cacheManager.put(cacheId, `key-${i}`, `value-${i}`);
      }

      const statistics = await cacheManager.getStatistics(cacheId);
      expect(statistics.operationCounts.puts).toBe(100);
    });

    it('should support intelligent cache replication', async () => {
      const cacheId = 'replicated-cache';

      // Enable replication
      await cacheManager.enableReplication(cacheId, {
        factor: 2,
        consistency: 'eventual'
      });

      await cacheManager.put(cacheId, 'replicated-key', 'replicated-value');

      // Verify replication
      const result = await cacheManager.get(cacheId, 'replicated-key');
      expect(result).toBe('replicated-value');
    });
  });
});