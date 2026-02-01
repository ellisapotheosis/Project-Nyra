/**
 * Critical Gap Tests for OptimizedRedisClient
 * Tests connection pooling failures, circuit breaker, and memory pressure scenarios
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { OptimizedRedisClient } from '../../../../src/database/caching/optimized-redis-client';
import { EventEmitter } from 'events';

describe('OptimizedRedisClient - Critical Gap Tests', () => {
  let redisClient: OptimizedRedisClient;
  let mockRedis: any;

  const testConfig = {
    url: 'redis://localhost:6379',
    cacheKeyPrefix: 'test:',
    cacheTtl: 3600,
    maxPoolSize: 10,
    minPoolSize: 2,
    acquireTimeoutMs: 5000,
    idleTimeoutMs: 30000,
    enableClustering: false
  };

  beforeEach(() => {
    redisClient = OptimizedRedisClient.getInstance(testConfig);
    mockRedis = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      pipeline: jest.fn(),
      multi: jest.fn(),
      exec: jest.fn()
    };
  });

  afterEach(async () => {
    await redisClient?.destroy();
  });

  describe('Connection Pool Exhaustion - CRITICAL GAP', () => {
    it('should handle pool exhaustion gracefully', async () => {
      // Exhaust all connections in pool
      const operations = [];
      for (let i = 0; i < 15; i++) { // More than maxPoolSize
        operations.push(redisClient.get(`key-${i}`));
      }

      // Some operations should queue, not fail immediately
      const results = await Promise.allSettled(operations);

      const successful = results.filter(r => r.status === 'fulfilled');
      const failed = results.filter(r => r.status === 'rejected');

      // Should have some successful operations (pool size)
      expect(successful.length).toBeGreaterThan(0);

      // Failed operations should have timeout errors, not connection errors
      failed.forEach(result => {
        if (result.status === 'rejected') {
          expect(result.reason.message).toMatch(/timeout|queue/i);
        }
      });
    });

    it('should expand pool when under pressure', async () => {
      const initialStats = await redisClient.getConnectionStats();

      // Create sustained load
      const sustainedLoad = [];
      for (let i = 0; i < 20; i++) {
        sustainedLoad.push(redisClient.get(`sustained-key-${i}`));
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      await Promise.allSettled(sustainedLoad);

      const finalStats = await redisClient.getConnectionStats();

      // Pool should have expanded (up to maxPoolSize)
      expect(finalStats.totalConnections).toBeGreaterThan(initialStats.totalConnections);
      expect(finalStats.totalConnections).toBeLessThanOrEqual(testConfig.maxPoolSize);
    });

    it('should recover idle connections during high load', async () => {
      // Create connections and let them idle
      await redisClient.get('warmup-key');

      // Wait for idle timeout simulation
      await redisClient.simulateIdleTimeout();

      const statsAfterIdle = await redisClient.getConnectionStats();
      expect(statsAfterIdle.idleConnections).toBe(0);

      // New requests should create fresh connections
      await redisClient.get('post-idle-key');

      const statsAfterRecovery = await redisClient.getConnectionStats();
      expect(statsAfterRecovery.activeConnections).toBeGreaterThan(0);
    });
  });

  describe('Circuit Breaker Activation - HIGH PRIORITY GAP', () => {
    it('should open circuit breaker after consecutive failures', async () => {
      // Simulate Redis server failures
      mockRedis.get.mockRejectedValue(new Error('Connection refused'));

      // Make multiple failing requests
      const failures = [];
      for (let i = 0; i < 10; i++) {
        failures.push(
          redisClient.get(`failing-key-${i}`).catch(err => err)
        );
      }

      await Promise.all(failures);

      // Circuit breaker should be open
      const circuitState = await redisClient.getCircuitBreakerState();
      expect(circuitState.isOpen).toBe(true);
      expect(circuitState.failureCount).toBeGreaterThanOrEqual(5);
    });

    it('should fail fast when circuit breaker is open', async () => {
      // Force circuit breaker open
      await redisClient.forceCircuitBreakerOpen();

      const start = Date.now();

      try {
        await redisClient.get('test-key');
        fail('Should have failed fast');
      } catch (error) {
        const duration = Date.now() - start;

        // Should fail immediately (< 100ms)
        expect(duration).toBeLessThan(100);
        expect(error.message).toMatch(/circuit.*breaker.*open/i);
      }
    });

    it('should attempt recovery after timeout period', async () => {
      // Open circuit breaker
      await redisClient.forceCircuitBreakerOpen();

      // Wait for recovery timeout
      await redisClient.waitForCircuitBreakerRecovery();

      // Mock successful response for recovery attempt
      mockRedis.get.mockResolvedValueOnce('recovery-value');

      // Next request should attempt recovery
      const result = await redisClient.get('recovery-test');
      expect(result).toBe('recovery-value');

      // Circuit should be closed
      const circuitState = await redisClient.getCircuitBreakerState();
      expect(circuitState.isOpen).toBe(false);
    });
  });

  describe('Batch Operation Timeout Handling - HIGH PRIORITY GAP', () => {
    it('should handle individual operation timeouts in batch', async () => {
      const batchOps = [
        { type: 'get', key: 'fast-key' },
        { type: 'get', key: 'slow-key' }, // Will timeout
        { type: 'set', key: 'another-key', value: 'value' }
      ];

      // Mock slow response for one key
      mockRedis.get.mockImplementation((key) => {
        if (key === 'slow-key') {
          return new Promise(resolve => setTimeout(resolve, 10000)); // 10s delay
        }
        return Promise.resolve('fast-response');
      });

      const batchResult = await redisClient.executeBatch(batchOps, { timeout: 1000 });

      expect(batchResult.success).toBe(false);
      expect(batchResult.results.get('fast-key')).toBe('fast-response');
      expect(batchResult.errors.has('slow-key')).toBe(true);
      expect(batchResult.errors.get('slow-key').message).toMatch(/timeout/i);
    });

    it('should handle batch operation memory pressure', async () => {
      // Create very large batch
      const largeBatch = [];
      for (let i = 0; i < 10000; i++) {
        largeBatch.push({
          type: 'set',
          key: `large-key-${i}`,
          value: 'x'.repeat(1000) // 1KB per operation
        });
      }

      // Should chunk the batch to prevent memory issues
      const result = await redisClient.executeBatch(largeBatch, {
        chunkSize: 100,
        maxMemoryUsage: 1024 * 1024 // 1MB limit
      });

      expect(result.executionTime).toBeDefined();
      // Should complete without memory errors
      expect(result.success).toBe(true);
    });

    it('should handle partial batch failures', async () => {
      const mixedBatch = [
        { type: 'set', key: 'good-key-1', value: 'value1' },
        { type: 'get', key: 'non-existent' },
        { type: 'set', key: 'invalid-key', value: null }, // Invalid operation
        { type: 'set', key: 'good-key-2', value: 'value2' }
      ];

      mockRedis.set.mockImplementation((key, value) => {
        if (value === null) {
          throw new Error('Invalid value');
        }
        return Promise.resolve('OK');
      });

      const result = await redisClient.executeBatch(mixedBatch, {
        continueOnError: true
      });

      expect(result.success).toBe(false);
      expect(result.results.get('good-key-1')).toBe('OK');
      expect(result.results.get('good-key-2')).toBe('OK');
      expect(result.errors.has('invalid-key')).toBe(true);
    });
  });

  describe('Memory Pressure Scenarios - CRITICAL GAP', () => {
    it('should handle Redis memory pressure with eviction', async () => {
      // Simulate Redis memory pressure
      mockRedis.info.mockResolvedValue(`
        used_memory:1073741824
        maxmemory:1073741824
        used_memory_rss:1073741824
      `);

      // Operations should adapt to memory pressure
      await redisClient.handleMemoryPressure();

      const memoryStats = await redisClient.getMemoryStats();
      expect(memoryStats.isUnderPressure).toBe(true);

      // Should have reduced TTL or enabled compression
      const adaptations = await redisClient.getMemoryAdaptations();
      expect(adaptations.length).toBeGreaterThan(0);
    });

    it('should compress large values under memory pressure', async () => {
      const largeValue = 'x'.repeat(10000); // 10KB value

      // Enable compression under memory pressure
      await redisClient.setMemoryPressureMode(true);

      await redisClient.set('large-key', largeValue);

      const compressionStats = await redisClient.getCompressionStats();
      expect(compressionStats.compressedOperations).toBeGreaterThan(0);
      expect(compressionStats.spaceSaved).toBeGreaterThan(0);
    });

    it('should prioritize important data during memory pressure', async () => {
      const operations = [
        { key: 'critical-data', value: 'important', priority: 10 },
        { key: 'normal-data', value: 'normal', priority: 5 },
        { key: 'cache-data', value: 'temporary', priority: 1 }
      ];

      // Set all data
      for (const op of operations) {
        await redisClient.set(op.key, op.value, { priority: op.priority });
      }

      // Simulate memory pressure and eviction
      await redisClient.simulateMemoryEviction(0.5); // Evict 50%

      // Critical data should remain
      const critical = await redisClient.get('critical-data');
      expect(critical).toBe('important');

      // Cache data likely evicted (but don't assert as it's probabilistic)
      const cache = await redisClient.get('cache-data');
      // May or may not exist depending on eviction algorithm
    });
  });

  describe('Replication Lag Handling - HIGH PRIORITY GAP', () => {
    it('should detect replication lag', async () => {
      // Mock replication info with lag
      mockRedis.info.mockResolvedValue(`
        role:master
        connected_slaves:2
        slave0:ip=127.0.0.1,port=6380,state=online,offset=1000,lag=5
        slave1:ip=127.0.0.1,port=6381,state=online,offset=950,lag=10
      `);

      const replicationStatus = await redisClient.getReplicationStatus();
      expect(replicationStatus.maxLag).toBe(10);
      expect(replicationStatus.isHealthy).toBe(false); // Lag > threshold
    });

    it('should handle read-after-write consistency with replication lag', async () => {
      // Write to master
      await redisClient.set('consistency-key', 'new-value');

      // Immediate read should go to master to ensure consistency
      const value = await redisClient.get('consistency-key', {
        ensureConsistency: true,
        maxLagTolerance: 0
      });

      expect(value).toBe('new-value');

      // Verify read went to master
      const readStats = await redisClient.getReadStats();
      expect(readStats.masterReads).toBeGreaterThan(0);
    });

    it('should fall back to master when slave lag is too high', async () => {
      // Configure high lag scenario
      await redisClient.setMaxReplicationLag(1000); // 1 second

      // Mock high lag
      mockRedis.info.mockResolvedValue(`
        role:slave
        master_last_io_seconds_ago:5
        master_sync_in_progress:0
      `);

      // Read should fallback to master
      await redisClient.get('lag-test-key');

      const fallbackStats = await redisClient.getFallbackStats();
      expect(fallbackStats.masterFallbacks).toBeGreaterThan(0);
    });
  });
});