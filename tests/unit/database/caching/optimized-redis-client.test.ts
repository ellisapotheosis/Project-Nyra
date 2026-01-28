/**
 * Unit Tests for Optimized Redis Client
 * Tests connection pooling, circuit breaker, and memory leak prevention
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { OptimizedRedisClient } from '../../../../src/database/caching/optimized-redis-client';

describe('OptimizedRedisClient', () => {
  let redisClient: OptimizedRedisClient;
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
  });

  afterEach(async () => {
    await redisClient.destroy();
  });

  describe('Connection Pool Management', () => {
    it('should maintain minimum pool size', async () => {
      const stats = await redisClient.getConnectionStats();
      expect(stats.totalConnections).toBeGreaterThanOrEqual(testConfig.minPoolSize);
    });

    it('should not exceed maximum pool size under load', async () => {
      const promises = Array(20).fill(0).map(async (_, i) => {
        return redisClient.get(`load-test-${i}`);
      });

      await Promise.all(promises);
      const stats = await redisClient.getConnectionStats();
      expect(stats.totalConnections).toBeLessThanOrEqual(testConfig.maxPoolSize);
    });

    it('should reuse idle connections efficiently', async () => {
      // Perform operations to create connections
      await redisClient.set('test1', 'value1');
      await redisClient.set('test2', 'value2');

      const initialStats = await redisClient.getConnectionStats();

      // Wait for connections to become idle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform more operations
      await redisClient.set('test3', 'value3');
      await redisClient.set('test4', 'value4');

      const finalStats = await redisClient.getConnectionStats();

      // Should reuse existing connections
      expect(finalStats.totalConnections).toBeLessThanOrEqual(initialStats.totalConnections + 1);
    });

    it('should handle connection failures gracefully', async () => {
      // Mock connection failure
      const mockConnection = jest.spyOn(redisClient as any, 'createConnection')
        .mockRejectedValueOnce(new Error('Connection failed'));

      await expect(redisClient.get('test-key')).resolves.toBeDefined();

      mockConnection.mockRestore();
    });

    it('should clean up idle connections', async () => {
      // Create connections
      const promises = Array(5).fill(0).map(async (_, i) => {
        return redisClient.set(`cleanup-test-${i}`, `value-${i}`);
      });

      await Promise.all(promises);

      const beforeCleanup = await redisClient.getConnectionStats();

      // Wait for idle timeout
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger cleanup
      await redisClient.cleanupIdleConnections();

      const afterCleanup = await redisClient.getConnectionStats();
      expect(afterCleanup.idleConnections).toBeLessThanOrEqual(beforeCleanup.idleConnections);
    });
  });

  describe('Circuit Breaker Pattern', () => {
    it('should open circuit on repeated failures', async () => {
      // Mock Redis failures
      const mockGet = jest.spyOn(redisClient as any, 'executeCommand')
        .mockRejectedValue(new Error('Redis unavailable'));

      // Generate failures to trip circuit breaker
      for (let i = 0; i < 6; i++) {
        try {
          await redisClient.get(`fail-test-${i}`);
        } catch (error) {
          // Expected failures
        }
      }

      const circuitState = await redisClient.getCircuitBreakerState();
      expect(circuitState.isOpen).toBe(true);

      mockGet.mockRestore();
    });

    it('should fail fast when circuit is open', async () => {
      // Trip circuit breaker
      await redisClient.tripCircuitBreaker();

      const startTime = performance.now();
      const result = await redisClient.get('fast-fail-test');
      const duration = performance.now() - startTime;

      expect(result).toBeNull();
      expect(duration).toBeLessThan(10); // Should fail fast
    });

    it('should reset circuit after timeout', async () => {
      // Trip circuit breaker
      await redisClient.tripCircuitBreaker();

      expect(await redisClient.getCircuitBreakerState()).toMatchObject({
        isOpen: true
      });

      // Wait for circuit breaker timeout
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should attempt to reset
      const result = await redisClient.get('reset-test');
      const circuitState = await redisClient.getCircuitBreakerState();

      expect(circuitState.isOpen).toBe(false);
    });
  });

  describe('Batch Operations', () => {
    it('should execute batch operations efficiently', async () => {
      const operations = [
        { type: 'set' as const, key: 'batch1', value: 'value1' },
        { type: 'set' as const, key: 'batch2', value: 'value2' },
        { type: 'get' as const, key: 'batch1' },
        { type: 'get' as const, key: 'batch2' }
      ];

      const startTime = performance.now();
      const results = await redisClient.executeBatch(operations);
      const duration = performance.now() - startTime;

      expect(results.success).toBe(true);
      expect(results.results.size).toBe(4);
      expect(duration).toBeLessThan(100); // Batch should be fast
    });

    it('should handle partial batch failures', async () => {
      const operations = [
        { type: 'set' as const, key: 'valid1', value: 'value1' },
        { type: 'get' as const, key: 'nonexistent' },
        { type: 'set' as const, key: 'valid2', value: 'value2' }
      ];

      const results = await redisClient.executeBatch(operations);

      expect(results.success).toBe(true);
      expect(results.results.has('valid1')).toBe(true);
      expect(results.results.has('valid2')).toBe(true);
      expect(results.errors.size).toBeLessThanOrEqual(1);
    });

    it('should batch operations within time window', async () => {
      // Start multiple operations that should be batched
      const promises = [
        redisClient.set('auto-batch-1', 'value1'),
        redisClient.set('auto-batch-2', 'value2'),
        redisClient.get('auto-batch-1'),
        redisClient.set('auto-batch-3', 'value3')
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(4);
      expect(results[2]).toBe('value1'); // Get should return the set value
    });
  });

  describe('Memory Management', () => {
    it('should prevent memory leaks in connection pool', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and destroy many connections
      for (let i = 0; i < 100; i++) {
        await redisClient.set(`memory-test-${i}`, `value-${i}`);
        await redisClient.get(`memory-test-${i}`);

        if (i % 10 === 0) {
          // Force garbage collection if available
          if (global.gc) global.gc();
        }
      }

      // Clean up
      await redisClient.cleanupIdleConnections();
      if (global.gc) global.gc();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryGrowth = (finalMemory - initialMemory) / initialMemory;

      // Should not have significant memory growth
      expect(memoryGrowth).toBeLessThan(0.1); // Less than 10% growth
    });

    it('should track response time metrics accurately', async () => {
      // Perform operations with artificial delays
      const operations = Array(50).fill(0).map(async (_, i) => {
        const delay = Math.random() * 10;
        await new Promise(resolve => setTimeout(resolve, delay));
        return redisClient.set(`timing-test-${i}`, `value-${i}`);
      });

      await Promise.all(operations);

      const stats = await redisClient.getConnectionStats();
      expect(stats.avgResponseTime).toBeGreaterThan(0);
      expect(stats.totalQueries).toBe(50);
    });

    it('should handle connection cleanup on destroy', async () => {
      const client = OptimizedRedisClient.getInstance({
        ...testConfig,
        url: 'redis://localhost:6380' // Different port for isolation
      });

      await client.set('cleanup-test', 'value');
      const statsBefore = await client.getConnectionStats();
      expect(statsBefore.totalConnections).toBeGreaterThan(0);

      await client.destroy();

      // Verify connections are cleaned up
      const statsAfter = await client.getConnectionStats();
      expect(statsAfter.totalConnections).toBe(0);
    });
  });

  describe('Performance Requirements', () => {
    it('should meet V3 response time targets (<100ms)', async () => {
      // Warm up
      for (let i = 0; i < 10; i++) {
        await redisClient.set(`warmup-${i}`, `value-${i}`);
      }

      const iterations = 100;
      const latencies: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await redisClient.get(`warmup-${i % 10}`);
        latencies.push(performance.now() - start);
      }

      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;
      const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(0.95 * latencies.length)];

      expect(avgLatency).toBeLessThan(100); // V3 target
      expect(p95Latency).toBeLessThan(200); // P95 should be reasonable
    });

    it('should handle high concurrency efficiently', async () => {
      const concurrentOps = 100;
      const opsPerConnection = 50;

      const promises = Array(concurrentOps).fill(0).map(async (_, i) => {
        const results = [];
        for (let j = 0; j < opsPerConnection; j++) {
          results.push(await redisClient.set(`concurrent-${i}-${j}`, `value-${i}-${j}`));
        }
        return results;
      });

      const startTime = performance.now();
      await Promise.all(promises);
      const duration = performance.now() - startTime;

      const totalOps = concurrentOps * opsPerConnection;
      const opsPerSecond = totalOps / (duration / 1000);

      expect(opsPerSecond).toBeGreaterThan(1000); // Should handle 1000+ ops/sec

      const stats = await redisClient.getConnectionStats();
      expect(stats.errorCount).toBe(0); // No errors under load
    });
  });

  describe('Error Handling', () => {
    it('should handle Redis server restart gracefully', async () => {
      // Simulate server restart by forcing connection errors
      const mockError = new Error('Connection lost');
      mockError.code = 'ECONNRESET';

      jest.spyOn(redisClient as any, 'executeCommand')
        .mockRejectedValueOnce(mockError);

      // Should gracefully handle the error and retry
      const result = await redisClient.get('restart-test');
      expect(result).toBeDefined(); // Should not throw
    });

    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Operation timed out');
      timeoutError.code = 'ETIMEDOUT';

      jest.spyOn(redisClient as any, 'executeCommand')
        .mockRejectedValueOnce(timeoutError);

      const result = await redisClient.get('timeout-test');
      expect(result).toBeNull(); // Should return null on timeout
    });

    it('should handle malformed responses', async () => {
      // Mock malformed response
      jest.spyOn(redisClient as any, 'executeCommand')
        .mockResolvedValueOnce(undefined);

      const result = await redisClient.get('malformed-test');
      expect(result).toBeNull(); // Should handle gracefully
    });
  });
});