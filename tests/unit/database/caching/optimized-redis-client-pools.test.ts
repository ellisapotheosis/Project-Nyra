/**
 * Critical Missing Tests: OptimizedRedisClient Connection Pooling
 * Tests the untested connection management and circuit breaker logic
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { OptimizedRedisClient } from '../../../../src/database/caching/optimized-redis-client';
import Redis from 'ioredis';

// Mock Redis
jest.mock('ioredis');
const MockRedis = Redis as jest.MockedClass<typeof Redis>;

describe('OptimizedRedisClient - Connection Pooling (CRITICAL GAPS)', () => {
  let redisClient: OptimizedRedisClient;
  let mockRedisInstance: jest.Mocked<Redis>;

  const testConfig = {
    url: 'redis://localhost:6379',
    cacheKeyPrefix: 'test:',
    cacheTtl: 3600,
    maxPoolSize: 5,
    minPoolSize: 2,
    acquireTimeoutMs: 5000,
    idleTimeoutMs: 30000,
    enableClustering: false
  };

  beforeEach(() => {
    mockRedisInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      pipeline: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      status: 'ready'
    } as any;

    MockRedis.mockImplementation(() => mockRedisInstance);
    redisClient = OptimizedRedisClient.getInstance(testConfig);
  });

  afterEach(async () => {
    await redisClient?.destroy();
    jest.clearAllMocks();
  });

  describe('Connection Pool Management - UNTESTED', () => {
    it('should create minimum pool connections on initialization', async () => {
      // CRITICAL: Test pool initialization
      await redisClient.initializePool();

      const poolStats = await redisClient.getConnectionStats();
      expect(poolStats.totalConnections).toBe(testConfig.minPoolSize);
      expect(poolStats.idleConnections).toBe(testConfig.minPoolSize);
      expect(poolStats.activeConnections).toBe(0);
    });

    it('should acquire and release connections from pool', async () => {
      // CRITICAL: Test connection acquisition/release
      await redisClient.initializePool();

      const connection1 = await redisClient.acquireConnection();
      expect(connection1).toBeDefined();
      expect(connection1.isActive).toBe(true);

      const poolStats1 = await redisClient.getConnectionStats();
      expect(poolStats1.activeConnections).toBe(1);
      expect(poolStats1.idleConnections).toBe(1);

      await redisClient.releaseConnection(connection1.id);

      const poolStats2 = await redisClient.getConnectionStats();
      expect(poolStats2.activeConnections).toBe(0);
      expect(poolStats2.idleConnections).toBe(2);
    });

    it('should expand pool when no connections available', async () => {
      // CRITICAL: Test pool expansion logic
      await redisClient.initializePool();

      // Acquire all connections
      const connections = [];
      for (let i = 0; i < testConfig.minPoolSize; i++) {
        connections.push(await redisClient.acquireConnection());
      }

      // Request one more - should create new connection
      const extraConnection = await redisClient.acquireConnection();
      expect(extraConnection).toBeDefined();

      const poolStats = await redisClient.getConnectionStats();
      expect(poolStats.totalConnections).toBe(testConfig.minPoolSize + 1);
      expect(poolStats.activeConnections).toBe(testConfig.minPoolSize + 1);
    });

    it('should respect maximum pool size', async () => {
      // CRITICAL: Test pool size limits
      await redisClient.initializePool();

      const connections = [];

      // Try to acquire more than max pool size
      for (let i = 0; i < testConfig.maxPoolSize + 2; i++) {
        try {
          const conn = await redisClient.acquireConnection();
          connections.push(conn);
        } catch (error) {
          // Should throw error when exceeding max pool size
          expect(error.message).toContain('pool size');
        }
      }

      const poolStats = await redisClient.getConnectionStats();
      expect(poolStats.totalConnections).toBeLessThanOrEqual(testConfig.maxPoolSize);
    });

    it('should handle connection timeout scenarios', async () => {
      // CRITICAL: Test acquisition timeout
      await redisClient.initializePool();

      // Acquire all connections and don't release
      const connections = [];
      for (let i = 0; i < testConfig.maxPoolSize; i++) {
        connections.push(await redisClient.acquireConnection());
      }

      // Next acquisition should timeout
      const start = Date.now();

      try {
        await redisClient.acquireConnection();
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThanOrEqual(testConfig.acquireTimeoutMs - 100);
        expect(error.message).toContain('timeout');
      }
    });
  });

  describe('Circuit Breaker Pattern - UNTESTED', () => {
    it('should open circuit breaker after consecutive failures', async () => {
      // CRITICAL: Test circuit breaker opening
      mockRedisInstance.get.mockRejectedValue(new Error('Connection failed'));

      // Simulate multiple failures
      for (let i = 0; i < 5; i++) {
        try {
          await redisClient.get('test-key');
        } catch {
          // Expected to fail
        }
      }

      // Circuit should be open now
      const circuitState = await redisClient.getCircuitBreakerState();
      expect(circuitState.isOpen).toBe(true);
      expect(circuitState.failureCount).toBe(5);
    });

    it('should reject requests when circuit is open', async () => {
      // Force circuit open
      await redisClient.forceCircuitOpen();

      try {
        await redisClient.get('test-key');
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error.message).toContain('Circuit breaker is open');
      }
    });

    it('should transition to half-open state after timeout', async () => {
      // CRITICAL: Test circuit breaker recovery
      await redisClient.forceCircuitOpen();

      // Wait for timeout period
      jest.advanceTimersByTime(61000); // 1 minute + buffer

      const circuitState = await redisClient.getCircuitBreakerState();
      expect(circuitState.isOpen).toBe(false);

      // Should allow one test request
      mockRedisInstance.get.mockResolvedValue('success');
      const result = await redisClient.get('test-key');
      expect(result).toBe('success');
    });
  });

  describe('Batch Operations - UNTESTED', () => {
    it('should execute batch operations efficiently', async () => {
      // CRITICAL: Test batch processing
      const batchOperations = [
        { type: 'set' as const, key: 'batch-1', value: 'value-1' },
        { type: 'set' as const, key: 'batch-2', value: 'value-2' },
        { type: 'get' as const, key: 'batch-1' },
        { type: 'del' as const, key: 'batch-2' }
      ];

      const mockPipeline = {
        set: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        del: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 'OK'],
          [null, 'OK'],
          [null, 'value-1'],
          [null, 1]
        ])
      };

      mockRedisInstance.pipeline.mockReturnValue(mockPipeline as any);

      // MISSING: Test executeBatchOperations() method
      const results = await redisClient.executeBatchOperations(batchOperations);

      expect(results.success).toBe(true);
      expect(results.results.size).toBe(4);
      expect(results.errors.size).toBe(0);
      expect(mockPipeline.exec).toHaveBeenCalledTimes(1);
    });

    it('should handle batch operation partial failures', async () => {
      // CRITICAL: Test batch error handling
      const batchOperations = [
        { type: 'set' as const, key: 'success-key', value: 'value' },
        { type: 'get' as const, key: 'nonexistent-key' },
        { type: 'set' as const, key: 'fail-key', value: 'value' }
      ];

      const mockPipeline = {
        set: jest.fn().mockReturnThis(),
        get: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([
          [null, 'OK'],
          [null, null], // Key doesn't exist
          [new Error('Set failed'), null]
        ])
      };

      mockRedisInstance.pipeline.mockReturnValue(mockPipeline as any);

      const results = await redisClient.executeBatchOperations(batchOperations);

      expect(results.success).toBe(false);
      expect(results.results.size).toBe(2); // Success and null result
      expect(results.errors.size).toBe(1); // One error
    });
  });

  describe('Health Monitoring - UNTESTED', () => {
    it('should perform connection health checks', async () => {
      // CRITICAL: Test health check implementation
      mockRedisInstance.ping = jest.fn().mockResolvedValue('PONG');

      // MISSING: Test performHealthCheck() method
      const healthResult = await redisClient.performHealthCheck();

      expect(healthResult.healthy).toBe(true);
      expect(healthResult.latency).toBeGreaterThan(0);
      expect(healthResult.connectionCount).toBe(2); // Min pool size
    });

    it('should detect unhealthy connections', async () => {
      // CRITICAL: Test unhealthy connection detection
      mockRedisInstance.ping = jest.fn().mockRejectedValue(new Error('Connection lost'));

      const healthResult = await redisClient.performHealthCheck();

      expect(healthResult.healthy).toBe(false);
      expect(healthResult.errors).toContain('Connection lost');
    });

    it('should track performance metrics', async () => {
      // CRITICAL: Test metrics collection
      mockRedisInstance.get.mockResolvedValue('test-value');

      const start = Date.now();
      await redisClient.get('metrics-test');
      const responseTime = Date.now() - start;

      const stats = await redisClient.getConnectionStats();
      expect(stats.avgResponseTime).toBeCloseTo(responseTime, -1);
      expect(stats.totalQueries).toBe(1);
      expect(stats.errorCount).toBe(0);
    });
  });

  describe('Memory Management - MISSING COVERAGE', () => {
    it('should clean up idle connections', async () => {
      // CRITICAL: Test idle connection cleanup
      jest.useFakeTimers();

      await redisClient.initializePool();

      // Fast forward past idle timeout
      jest.advanceTimersByTime(testConfig.idleTimeoutMs + 1000);

      const poolStats = await redisClient.getConnectionStats();
      expect(poolStats.totalConnections).toBe(testConfig.minPoolSize);

      jest.useRealTimers();
    });

    it('should prevent memory leaks from connection objects', async () => {
      // CRITICAL: Test memory leak prevention
      const initialMemory = process.memoryUsage().heapUsed;

      // Create and destroy many connections
      for (let i = 0; i < 100; i++) {
        const conn = await redisClient.acquireConnection();
        await redisClient.releaseConnection(conn.id);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be minimal (less than 1MB)
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    });
  });
});