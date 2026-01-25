/**
 * Optimized Redis Client with Connection Pooling and Memory Leak Prevention
 * Addresses critical performance issues in the original RedisClient
 */

import Redis, { Cluster } from 'ioredis';
import { EventEmitter } from 'events';
import { createLogger } from '../utils/logger';
import { performance } from 'perf_hooks';

const logger = createLogger('optimized-redis-client');

export interface RedisConfig {
  url: string;
  cacheKeyPrefix: string;
  cacheTtl: number;
  maxPoolSize: number;
  minPoolSize: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  enableClustering: boolean;
  clusterNodes?: string[];
}

export interface PooledConnection {
  client: Redis;
  id: string;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  totalQueries: number;
}

export interface ConnectionStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  totalQueries: number;
  avgResponseTime: number;
  errorCount: number;
  poolUtilization: number;
}

export interface BatchOperation {
  type: 'get' | 'set' | 'del' | 'incr';
  key: string;
  value?: any;
  ttl?: number;
}

export interface BatchResult {
  success: boolean;
  results: Map<string, any>;
  errors: Map<string, Error>;
  executionTime: number;
}

export class OptimizedRedisClient extends EventEmitter {
  private static instance: OptimizedRedisClient;
  private connectionPool: Map<string, PooledConnection> = new Map();
  private availableConnections: string[] = [];
  private waitingQueue: Array<{
    resolve: (connection: PooledConnection) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];

  private config: RedisConfig;
  private isDestroyed = false;

  // OPTIMIZATION: Performance metrics
  private stats: ConnectionStats = {
    totalConnections: 0,
    activeConnections: 0,
    idleConnections: 0,
    totalQueries: 0,
    avgResponseTime: 0,
    errorCount: 0,
    poolUtilization: 0
  };

  // OPTIMIZATION: Response time tracking
  private responseTimeBuffer: number[] = [];
  private readonly maxResponseSamples = 1000;

  // OPTIMIZATION: Batch operation queues
  private batchQueue: Map<string, BatchOperation[]> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchWindowMs = 10; // 10ms batching window

  // OPTIMIZATION: Circuit breaker pattern
  private circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    threshold: 5,
    timeoutMs: 60000 // 1 minute
  };

  // OPTIMIZATION: Memory usage monitoring
  private memoryMonitor: NodeJS.Timeout | null = null;

  private constructor(config: RedisConfig) {
    super();
    this.config = config;
    this.initializePool();
    this.startMonitoring();
  }

  public static getInstance(config?: RedisConfig): OptimizedRedisClient {
    if (!OptimizedRedisClient.instance && config) {
      OptimizedRedisClient.instance = new OptimizedRedisClient(config);
    }
    return OptimizedRedisClient.instance;
  }

  /**
   * OPTIMIZED: Initialize connection pool with proper lifecycle management
   */
  private async initializePool(): Promise<void> {
    try {
      // Create minimum pool size connections
      const createPromises = Array(this.config.minPoolSize)
        .fill(0)
        .map(() => this.createConnection());

      await Promise.all(createPromises);
      logger.info(`Redis pool initialized with ${this.config.minPoolSize} connections`);
    } catch (error) {
      logger.error('Failed to initialize Redis pool:', error);
      this.handleCircuitBreaker();
    }
  }

  /**
   * OPTIMIZED: Create connection with proper error handling and monitoring
   */
  private async createConnection(): Promise<PooledConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const client = new Redis(this.config.url, {
      retryStrategy: (times: number) => {
        if (times > 3) {
          logger.error(`Redis connection ${connectionId} failed after 3 attempts`);
          return null;
        }
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      enableOfflineQueue: false,
      // OPTIMIZATION: Connection-specific settings
      keepAlive: 30000, // 30 seconds
      family: 4, // IPv4
      connectTimeout: 10000, // 10 seconds
      commandTimeout: 5000, // 5 seconds
    });

    const connection: PooledConnection = {
      client,
      id: connectionId,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: false,
      totalQueries: 0
    };

    // OPTIMIZATION: Connection event handling
    client.on('connect', () => {
      logger.debug(`Redis connection ${connectionId} established`);
    });

    client.on('ready', () => {
      this.availableConnections.push(connectionId);
      this.stats.idleConnections++;
      logger.debug(`Redis connection ${connectionId} ready`);
    });

    client.on('error', (error) => {
      logger.error(`Redis connection ${connectionId} error:`, error);
      this.handleConnectionError(connectionId, error);
    });

    client.on('close', () => {
      logger.warn(`Redis connection ${connectionId} closed`);
      this.removeConnection(connectionId);
    });

    // OPTIMIZATION: Connect with timeout
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Connection timeout for ${connectionId}`)), 10000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    this.connectionPool.set(connectionId, connection);
    this.stats.totalConnections++;

    return connection;
  }

  /**
   * OPTIMIZED: Acquire connection from pool with queuing
   */
  private async acquireConnection(): Promise<PooledConnection> {
    if (this.isDestroyed) {
      throw new Error('Redis client is destroyed');
    }

    if (this.circuitBreaker.isOpen) {
      if (Date.now() - this.circuitBreaker.lastFailureTime > this.circuitBreaker.timeoutMs) {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    // Try to get available connection
    const availableId = this.availableConnections.pop();
    if (availableId) {
      const connection = this.connectionPool.get(availableId);
      if (connection && !connection.isActive) {
        connection.isActive = true;
        connection.lastUsed = Date.now();
        this.stats.activeConnections++;
        this.stats.idleConnections--;
        return connection;
      }
    }

    // Create new connection if pool not at max
    if (this.connectionPool.size < this.config.maxPoolSize) {
      try {
        return await this.createConnection();
      } catch (error) {
        logger.error('Failed to create new connection:', error);
      }
    }

    // Wait for available connection
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve);
        if (index >= 0) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new Error('Connection acquire timeout'));
      }, this.config.acquireTimeoutMs);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  /**
   * OPTIMIZED: Release connection back to pool
   */
  private releaseConnection(connection: PooledConnection): void {
    if (!connection || this.isDestroyed) return;

    connection.isActive = false;
    connection.lastUsed = Date.now();
    this.stats.activeConnections--;
    this.stats.idleConnections++;

    // Check waiting queue
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift();
      if (waiter) {
        clearTimeout(waiter.timeout);
        connection.isActive = true;
        this.stats.activeConnections++;
        this.stats.idleConnections--;
        waiter.resolve(connection);
        return;
      }
    }

    // Return to available pool
    this.availableConnections.push(connection.id);
  }

  /**
   * OPTIMIZED: Batch get operations for better performance
   */
  async batchGet(keys: string[]): Promise<Map<string, string | null>> {
    if (keys.length === 0) return new Map();

    const connection = await this.acquireConnection();
    const startTime = performance.now();

    try {
      // OPTIMIZATION: Use pipeline for batch operations
      const pipeline = connection.client.pipeline();
      const fullKeys = keys.map(key => `${this.config.cacheKeyPrefix}${key}`);

      fullKeys.forEach(key => pipeline.get(key));
      const results = await pipeline.exec();

      const resultMap = new Map<string, string | null>();

      if (results) {
        results.forEach((result, index) => {
          const [error, value] = result;
          if (!error) {
            resultMap.set(keys[index], value as string);
          } else {
            resultMap.set(keys[index], null);
            logger.warn(`Batch get error for key ${keys[index]}:`, error);
          }
        });
      }

      this.recordMetrics(connection, performance.now() - startTime, true);
      return resultMap;

    } catch (error) {
      this.recordMetrics(connection, performance.now() - startTime, false);
      logger.error('Batch get failed:', error);
      throw error;
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * OPTIMIZED: Batch set operations with TTL support
   */
  async batchSet(entries: Map<string, { value: string; ttl?: number }>): Promise<void> {
    if (entries.size === 0) return;

    const connection = await this.acquireConnection();
    const startTime = performance.now();

    try {
      const pipeline = connection.client.pipeline();

      for (const [key, { value, ttl }] of entries) {
        const fullKey = `${this.config.cacheKeyPrefix}${key}`;
        const ttlSeconds = ttl || this.config.cacheTtl;
        pipeline.setex(fullKey, ttlSeconds, value);
      }

      await pipeline.exec();
      this.recordMetrics(connection, performance.now() - startTime, true);

    } catch (error) {
      this.recordMetrics(connection, performance.now() - startTime, false);
      logger.error('Batch set failed:', error);
      throw error;
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * OPTIMIZED: Single operations with connection pooling
   */
  async get(key: string): Promise<string | null> {
    const connection = await this.acquireConnection();
    const startTime = performance.now();

    try {
      const fullKey = `${this.config.cacheKeyPrefix}${key}`;
      const result = await connection.client.get(fullKey);

      this.recordMetrics(connection, performance.now() - startTime, true);
      return result;

    } catch (error) {
      this.recordMetrics(connection, performance.now() - startTime, false);
      logger.warn(`Redis get failed for key ${key}:`, error);
      return null;
    } finally {
      this.releaseConnection(connection);
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const connection = await this.acquireConnection();
    const startTime = performance.now();

    try {
      const fullKey = `${this.config.cacheKeyPrefix}${key}`;
      const ttlSeconds = ttl || this.config.cacheTtl;
      await connection.client.setex(fullKey, ttlSeconds, value);

      this.recordMetrics(connection, performance.now() - startTime, true);

    } catch (error) {
      this.recordMetrics(connection, performance.now() - startTime, false);
      logger.warn(`Redis set failed for key ${key}:`, error);
    } finally {
      this.releaseConnection(connection);
    }
  }

  async del(key: string): Promise<void> {
    const connection = await this.acquireConnection();
    const startTime = performance.now();

    try {
      const fullKey = `${this.config.cacheKeyPrefix}${key}`;
      await connection.client.del(fullKey);

      this.recordMetrics(connection, performance.now() - startTime, true);

    } catch (error) {
      this.recordMetrics(connection, performance.now() - startTime, false);
      logger.warn(`Redis del failed for key ${key}:`, error);
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * OPTIMIZED: Auto-batching operations
   */
  async autoBatchOperation(operation: BatchOperation): Promise<any> {
    return new Promise((resolve, reject) => {
      const batchKey = operation.type;

      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }

      this.batchQueue.get(batchKey)!.push({
        ...operation,
        resolve,
        reject
      } as any);

      // Start batch timer if not running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.executeBatches();
        }, this.batchWindowMs);
      }
    });
  }

  /**
   * OPTIMIZED: Execute batched operations
   */
  private async executeBatches(): Promise<void> {
    this.batchTimer = null;

    for (const [operationType, operations] of this.batchQueue) {
      try {
        switch (operationType) {
          case 'get':
            await this.executeBatchGet(operations as any[]);
            break;
          case 'set':
            await this.executeBatchSet(operations as any[]);
            break;
          case 'del':
            await this.executeBatchDel(operations as any[]);
            break;
        }
      } catch (error) {
        logger.error(`Batch execution failed for ${operationType}:`, error);
      }
    }

    this.batchQueue.clear();
  }

  private async executeBatchGet(operations: any[]): Promise<void> {
    const keys = operations.map(op => op.key);
    try {
      const results = await this.batchGet(keys);
      operations.forEach(op => {
        const result = results.get(op.key);
        op.resolve(result);
      });
    } catch (error) {
      operations.forEach(op => op.reject(error));
    }
  }

  private async executeBatchSet(operations: any[]): Promise<void> {
    const entries = new Map();
    operations.forEach(op => {
      entries.set(op.key, { value: op.value, ttl: op.ttl });
    });

    try {
      await this.batchSet(entries);
      operations.forEach(op => op.resolve());
    } catch (error) {
      operations.forEach(op => op.reject(error));
    }
  }

  private async executeBatchDel(operations: any[]): Promise<void> {
    const connection = await this.acquireConnection();

    try {
      const pipeline = connection.client.pipeline();
      operations.forEach(op => {
        const fullKey = `${this.config.cacheKeyPrefix}${op.key}`;
        pipeline.del(fullKey);
      });

      await pipeline.exec();
      operations.forEach(op => op.resolve());
    } catch (error) {
      operations.forEach(op => op.reject(error));
    } finally {
      this.releaseConnection(connection);
    }
  }

  /**
   * OPTIMIZED: Metrics recording and monitoring
   */
  private recordMetrics(connection: PooledConnection, responseTime: number, success: boolean): void {
    connection.totalQueries++;
    this.stats.totalQueries++;

    if (success) {
      // Update response time tracking
      this.responseTimeBuffer.push(responseTime);
      if (this.responseTimeBuffer.length > this.maxResponseSamples) {
        this.responseTimeBuffer.shift();
      }

      // Update average response time
      const sum = this.responseTimeBuffer.reduce((a, b) => a + b, 0);
      this.stats.avgResponseTime = sum / this.responseTimeBuffer.length;

      // Reset circuit breaker on success
      if (this.circuitBreaker.failureCount > 0) {
        this.circuitBreaker.failureCount = Math.max(0, this.circuitBreaker.failureCount - 1);
      }
    } else {
      this.stats.errorCount++;
      this.handleCircuitBreaker();
    }

    // Update pool utilization
    this.stats.poolUtilization = this.stats.activeConnections / this.config.maxPoolSize;
  }

  /**
   * OPTIMIZED: Circuit breaker pattern implementation
   */
  private handleCircuitBreaker(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.circuitBreaker.threshold) {
      this.circuitBreaker.isOpen = true;
      logger.warn('Redis circuit breaker opened due to failures');
      this.emit('circuitBreakerOpen');
    }
  }

  /**
   * OPTIMIZED: Connection error handling
   */
  private handleConnectionError(connectionId: string, error: Error): void {
    const connection = this.connectionPool.get(connectionId);
    if (connection) {
      connection.isActive = false;
      this.removeConnection(connectionId);
    }

    this.handleCircuitBreaker();
    this.emit('connectionError', connectionId, error);
  }

  /**
   * OPTIMIZED: Remove connection from pool
   */
  private removeConnection(connectionId: string): void {
    const connection = this.connectionPool.get(connectionId);
    if (connection) {
      this.connectionPool.delete(connectionId);
      this.stats.totalConnections--;

      if (connection.isActive) {
        this.stats.activeConnections--;
      } else {
        this.stats.idleConnections--;
      }

      // Remove from available connections
      const index = this.availableConnections.indexOf(connectionId);
      if (index >= 0) {
        this.availableConnections.splice(index, 1);
      }
    }
  }

  /**
   * OPTIMIZED: Pool health monitoring
   */
  private startMonitoring(): void {
    // Health check interval
    const healthInterval = setInterval(async () => {
      if (this.isDestroyed) return;

      await this.performHealthCheck();
      this.cleanupIdleConnections();
    }, 30000); // 30 seconds

    // Memory monitoring
    this.memoryMonitor = setInterval(() => {
      if (this.isDestroyed) return;
      this.monitorMemoryUsage();
    }, 60000); // 1 minute

    // Cleanup on exit
    process.once('exit', () => {
      clearInterval(healthInterval);
      if (this.memoryMonitor) clearInterval(this.memoryMonitor);
    });
  }

  private async performHealthCheck(): Promise<void> {
    const unhealthyConnections: string[] = [];

    for (const [id, connection] of this.connectionPool) {
      if (!connection.isActive) {
        try {
          await connection.client.ping();
        } catch (error) {
          logger.warn(`Connection ${id} failed health check:`, error);
          unhealthyConnections.push(id);
        }
      }
    }

    // Remove unhealthy connections
    for (const id of unhealthyConnections) {
      this.removeConnection(id);
    }

    // Maintain minimum pool size
    const currentSize = this.connectionPool.size;
    if (currentSize < this.config.minPoolSize) {
      const needed = this.config.minPoolSize - currentSize;
      for (let i = 0; i < needed; i++) {
        try {
          await this.createConnection();
        } catch (error) {
          logger.error('Failed to create replacement connection:', error);
          break;
        }
      }
    }
  }

  private cleanupIdleConnections(): void {
    const now = Date.now();
    const idleTimeout = this.config.idleTimeoutMs;
    const connectionsToRemove: string[] = [];

    for (const [id, connection] of this.connectionPool) {
      if (!connection.isActive && (now - connection.lastUsed) > idleTimeout) {
        if (this.connectionPool.size > this.config.minPoolSize) {
          connectionsToRemove.push(id);
        }
      }
    }

    for (const id of connectionsToRemove) {
      const connection = this.connectionPool.get(id);
      if (connection) {
        connection.client.quit();
        this.removeConnection(id);
      }
    }
  }

  private monitorMemoryUsage(): void {
    const memUsage = process.memoryUsage();
    const poolSize = this.connectionPool.size;

    logger.debug('Redis client memory stats:', {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      poolSize: poolSize,
      activeConnections: this.stats.activeConnections,
      totalQueries: this.stats.totalQueries,
      avgResponseTime: `${this.stats.avgResponseTime.toFixed(2)} ms`
    });

    this.emit('memoryStats', {
      memUsage,
      poolSize,
      stats: this.stats
    });
  }

  /**
   * Get current connection statistics
   */
  getConnectionStats(): ConnectionStats {
    return { ...this.stats };
  }

  /**
   * Get detailed pool information
   */
  getPoolInfo(): { connections: PooledConnection[], stats: ConnectionStats } {
    return {
      connections: Array.from(this.connectionPool.values()),
      stats: this.getConnectionStats()
    };
  }

  /**
   * OPTIMIZED: Graceful shutdown with proper cleanup
   */
  async destroy(): Promise<void> {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    logger.info('Shutting down Redis client...');

    // Clear batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    // Clear memory monitor
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
      this.memoryMonitor = null;
    }

    // Reject all waiting connections
    for (const waiter of this.waitingQueue) {
      clearTimeout(waiter.timeout);
      waiter.reject(new Error('Redis client is shutting down'));
    }
    this.waitingQueue.length = 0;

    // Close all connections gracefully
    const closePromises = Array.from(this.connectionPool.values()).map(async (connection) => {
      try {
        await connection.client.quit();
      } catch (error) {
        logger.warn(`Error closing connection ${connection.id}:`, error);
      }
    });

    await Promise.allSettled(closePromises);

    // Clear all data structures
    this.connectionPool.clear();
    this.availableConnections.length = 0;
    this.batchQueue.clear();
    this.responseTimeBuffer.length = 0;

    this.removeAllListeners();
    logger.info('Redis client shutdown complete');
  }
}