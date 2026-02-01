/**
 * Cross-System Cascading Failure Integration Tests
 * Tests how failures propagate and recover across cache, memory, and monitoring systems
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentCacheManager } from '../../src/database/caching/intelligent-cache-manager';
import { OptimizedRedisClient } from '../../src/database/caching/optimized-redis-client';
import { DistributedKnowledgeGraph } from '../../src/memory/knowledge-graph/distributed-knowledge-graph';
import { AdaptiveLearningEngine } from '../../src/memory/learning-systems/adaptive-learning-engine';
import { PerformanceMonitor } from '../../src/monitoring/performance-monitor';

describe('Cross-System Cascading Failure Integration Tests', () => {
  let cacheManager: IntelligentCacheManager;
  let redisClient: OptimizedRedisClient;
  let knowledgeGraph: DistributedKnowledgeGraph;
  let learningEngine: AdaptiveLearningEngine;
  let performanceMonitor: PerformanceMonitor;
  let mockEmbeddingModel: any;

  beforeEach(async () => {
    // Initialize all systems
    mockEmbeddingModel = {
      embed: jest.fn().mockResolvedValue(Array(384).fill(0.1))
    };

    cacheManager = new IntelligentCacheManager('integration-node');
    redisClient = OptimizedRedisClient.getInstance({
      url: 'redis://localhost:6379',
      cacheKeyPrefix: 'cascade:',
      cacheTtl: 3600,
      maxPoolSize: 5,
      minPoolSize: 2,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000,
      enableClustering: false
    });
    knowledgeGraph = new DistributedKnowledgeGraph('integration-node', mockEmbeddingModel);
    learningEngine = new AdaptiveLearningEngine(knowledgeGraph);
    performanceMonitor = new PerformanceMonitor('integration-node');

    // Wire systems together for cascade testing
    await setupCascadeIntegration();
  });

  afterEach(async () => {
    // Cleanup all systems
    await Promise.allSettled([
      cacheManager?.destroy(),
      redisClient?.destroy(),
      knowledgeGraph?.cleanup(),
      learningEngine?.destroy(),
      performanceMonitor?.destroy()
    ]);
  });

  async function setupCascadeIntegration() {
    // Connect performance monitor to all systems
    await performanceMonitor.addSystemMonitoring('cache', cacheManager);
    await performanceMonitor.addSystemMonitoring('redis', redisClient);
    await performanceMonitor.addSystemMonitoring('knowledge-graph', knowledgeGraph);
    await performanceMonitor.addSystemMonitoring('learning-engine', learningEngine);

    // Set up failure propagation listeners
    cacheManager.on('systemFailure', (error) => {
      performanceMonitor.recordSystemFailure('cache', error);
    });

    redisClient.on('connectionLost', (error) => {
      performanceMonitor.recordSystemFailure('redis', error);
      cacheManager.handleRedisFailure(error);
    });

    knowledgeGraph.on('nodeFailure', (error) => {
      performanceMonitor.recordSystemFailure('knowledge-graph', error);
      learningEngine.handleKnowledgeGraphFailure(error);
    });
  }

  describe('Memory Pressure Cascade - CRITICAL SCENARIO', () => {
    it('should handle memory pressure cascade across all systems', async () => {
      // Phase 1: Generate memory pressure in cache system
      const largeCacheData = [];
      for (let i = 0; i < 1000; i++) {
        largeCacheData.push({
          key: `large-key-${i}`,
          value: 'x'.repeat(10000) // 10KB per entry
        });
      }

      // Fill cache to memory limit
      const cacheId = 'memory-pressure-test';
      for (const data of largeCacheData) {
        await cacheManager.put(cacheId, data.key, data.value);
      }

      // Phase 2: Add knowledge graph data (more memory pressure)
      const knowledgeData = [];
      for (let i = 0; i < 500; i++) {
        knowledgeData.push(await knowledgeGraph.addNode({
          content: `knowledge-${i}`,
          data: 'y'.repeat(5000) // 5KB per node
        }, 'entity'));
      }

      // Phase 3: Trigger learning engine training (peak memory usage)
      const trainingData = Array(1000).fill({
        input: Array(100).fill(Math.random()),
        output: Array(10).fill(Math.random()),
        weight: 1.0,
        timestamp: new Date(),
        context: { scenario: 'memory-pressure' }
      });

      // This should trigger cascade as systems compete for memory
      const cascadePromise = learningEngine.trainModel('memory-test-model', trainingData);

      // Monitor cascade effects
      const cascadeMonitoring = performanceMonitor.monitorCascadingEffects({
        triggerSystem: 'learning-engine',
        monitoringSystems: ['cache', 'redis', 'knowledge-graph'],
        thresholds: {
          memoryUsage: 0.9,
          responseTime: 5000,
          errorRate: 0.1
        }
      });

      const [trainingResult, cascadeResult] = await Promise.allSettled([
        cascadePromise,
        cascadeMonitoring
      ]);

      // Analyze cascade effects
      const systemHealth = await performanceMonitor.getSystemHealthDuringCascade();

      expect(systemHealth.affectedSystems).toContain('cache');
      expect(systemHealth.memoryPressureDetected).toBe(true);

      // Systems should implement graceful degradation
      expect(systemHealth.gracefulDegradations).toHaveLength.toBeGreaterThan(0);

      // Recovery mechanisms should activate
      const recoveryActions = await performanceMonitor.getCascadeRecoveryActions();
      expect(recoveryActions.automaticEvictions).toBeGreaterThan(0);
      expect(recoveryActions.systemAdaptations).toBeGreaterThan(0);
    });

    it('should prioritize critical operations during memory cascade', async () => {
      // Create memory pressure
      await simulateSystemMemoryPressure(0.95); // 95% memory usage

      // Perform mixed priority operations simultaneously
      const criticalOps = [
        cacheManager.put('critical-cache', 'emergency-key', 'critical-data', { priority: 10 }),
        knowledgeGraph.addNode({ content: 'critical-knowledge' }, 'entity'),
        learningEngine.emergencyAdaptation('critical-scenario')
      ];

      const normalOps = [
        cacheManager.put('normal-cache', 'normal-key', 'normal-data', { priority: 5 }),
        knowledgeGraph.addNode({ content: 'normal-knowledge' }, 'entity'),
        learningEngine.backgroundLearning('normal-scenario')
      ];

      const lowPriorityOps = [
        cacheManager.put('low-cache', 'cache-key', 'cache-data', { priority: 1 }),
        knowledgeGraph.addNode({ content: 'cache-knowledge' }, 'entity')
      ];

      // Start all operations
      const allOps = [...criticalOps, ...normalOps, ...lowPriorityOps];
      const results = await Promise.allSettled(allOps);

      // Analyze operation success rates by priority
      const criticalResults = results.slice(0, 3);
      const normalResults = results.slice(3, 6);
      const lowPriorityResults = results.slice(6, 8);

      const criticalSuccessRate = criticalResults.filter(r => r.status === 'fulfilled').length / criticalResults.length;
      const normalSuccessRate = normalResults.filter(r => r.status === 'fulfilled').length / normalResults.length;
      const lowPrioritySuccessRate = lowPriorityResults.filter(r => r.status === 'fulfilled').length / lowPriorityResults.length;

      // Critical operations should have highest success rate
      expect(criticalSuccessRate).toBeGreaterThanOrEqual(normalSuccessRate);
      expect(normalSuccessRate).toBeGreaterThanOrEqual(lowPrioritySuccessRate);

      // At least some critical operations should succeed
      expect(criticalSuccessRate).toBeGreaterThan(0.5);
    });
  });

  describe('Network Partition Cascade - CRITICAL SCENARIO', () => {
    it('should handle network partition affecting all distributed systems', async () => {
      const nodes = ['node-1', 'node-2', 'node-3', 'node-4'];
      const partition1 = ['node-1', 'node-2'];
      const partition2 = ['node-3', 'node-4'];

      // Setup data across all systems before partition
      await cacheManager.enableDistributedCaching(nodes);
      await knowledgeGraph.setupDistributedNodes(nodes);
      await learningEngine.enableDistributedLearning(nodes);

      // Create cross-system dependencies
      await setupCrossDependencies();

      // Simulate network partition
      await simulateNetworkPartition(partition1, partition2);

      // Test system behavior during partition
      const partitionBehavior = await Promise.allSettled([
        testCacheSystemDuringPartition(partition1, partition2),
        testKnowledgeGraphDuringPartition(partition1, partition2),
        testLearningEngineDuringPartition(partition1, partition2)
      ]);

      // Each system should maintain functionality in its partition
      expect(partitionBehavior[0].status).toBe('fulfilled'); // Cache system
      expect(partitionBehavior[1].status).toBe('fulfilled'); // Knowledge graph
      expect(partitionBehavior[2].status).toBe('fulfilled'); // Learning engine

      // Systems should detect partition
      const partitionStatus = await performanceMonitor.getNetworkPartitionStatus();
      expect(partitionStatus.isPartitioned).toBe(true);
      expect(partitionStatus.partitions).toHaveLength(2);

      // Test partition recovery
      await healNetworkPartition();

      // Monitor recovery cascade
      const recoveryResult = await performanceMonitor.monitorPartitionRecovery({
        expectedSyncOperations: ['cache-sync', 'knowledge-sync', 'learning-sync'],
        recoveryTimeout: 30000
      });

      expect(recoveryResult.allSystemsSynchronized).toBe(true);
      expect(recoveryResult.dataConsistencyRestored).toBe(true);
      expect(recoveryResult.conflictsResolved).toBeGreaterThanOrEqual(0);
    });

    async function setupCrossDependencies() {
      // Cache depends on knowledge graph for intelligent eviction
      await cacheManager.enableKnowledgeGraphEviction(knowledgeGraph);

      // Learning engine depends on cache for training data
      await learningEngine.setCacheDataSource('cache', cacheManager);

      // Knowledge graph uses cache for embedding storage
      await knowledgeGraph.setEmbeddingCache(cacheManager);
    }

    async function testCacheSystemDuringPartition(partition1: string[], partition2: string[]) {
      // Test cache operations in both partitions
      const partition1Ops = partition1.map(node =>
        cacheManager.put(`partition1-cache`, `${node}-key`, `${node}-value`)
      );

      const partition2Ops = partition2.map(node =>
        cacheManager.put(`partition2-cache`, `${node}-key`, `${node}-value`)
      );

      await Promise.all([...partition1Ops, ...partition2Ops]);

      // Verify partition isolation
      const partition1Data = await cacheManager.getPartitionData(partition1);
      const partition2Data = await cacheManager.getPartitionData(partition2);

      expect(partition1Data.keys).not.toEqual(partition2Data.keys);
    }

    async function testKnowledgeGraphDuringPartition(partition1: string[], partition2: string[]) {
      // Add nodes in each partition
      const partition1Nodes = await Promise.all(
        partition1.map(nodeId => knowledgeGraph.addNodeInPartition(
          { content: `partition1-${nodeId}` },
          'entity',
          partition1
        ))
      );

      const partition2Nodes = await Promise.all(
        partition2.map(nodeId => knowledgeGraph.addNodeInPartition(
          { content: `partition2-${nodeId}` },
          'entity',
          partition2
        ))
      );

      expect(partition1Nodes).toHaveLength(2);
      expect(partition2Nodes).toHaveLength(2);
    }

    async function testLearningEngineDuringPartition(partition1: string[], partition2: string[]) {
      // Train models in each partition
      const partition1Training = learningEngine.trainInPartition('model-p1', [], partition1);
      const partition2Training = learningEngine.trainInPartition('model-p2', [], partition2);

      await Promise.all([partition1Training, partition2Training]);

      // Verify models are partition-specific
      const p1Model = await learningEngine.getPartitionModel('model-p1', partition1);
      const p2Model = await learningEngine.getPartitionModel('model-p2', partition2);

      expect(p1Model.partitionId).toBe(partition1.join(','));
      expect(p2Model.partitionId).toBe(partition2.join(','));
    }
  });

  describe('Performance Degradation Chain - HIGH PRIORITY SCENARIO', () => {
    it('should handle performance degradation cascade', async () => {
      // Phase 1: Create initial performance degradation in Redis
      await redisClient.simulatePerformanceDegradation({
        latencyMultiplier: 5, // 5x slower
        throughputReduction: 0.7, // 70% reduction
        errorRate: 0.1 // 10% error rate
      });

      // Phase 2: This should cause cache system to degrade
      const cachePerformanceBefore = await cacheManager.getPerformanceMetrics();

      // Perform cache operations that depend on Redis
      const cacheOps = [];
      for (let i = 0; i < 100; i++) {
        cacheOps.push(cacheManager.get('perf-test', `key-${i}`));
      }

      await Promise.allSettled(cacheOps);

      const cachePerformanceAfter = await cacheManager.getPerformanceMetrics();

      // Cache performance should degrade
      expect(cachePerformanceAfter.avgResponseTime).toBeGreaterThan(
        cachePerformanceBefore.avgResponseTime * 2
      );

      // Phase 3: Cache degradation should affect knowledge graph
      // (if knowledge graph uses cache for embeddings)
      const kgPerformanceBefore = await knowledgeGraph.getPerformanceMetrics();

      const kgOps = [];
      for (let i = 0; i < 50; i++) {
        kgOps.push(knowledgeGraph.addNode({ content: `perf-test-${i}` }, 'entity'));
      }

      await Promise.allSettled(kgOps);

      const kgPerformanceAfter = await knowledgeGraph.getPerformanceMetrics();

      // Knowledge graph should also be affected
      expect(kgPerformanceAfter.avgEmbeddingTime).toBeGreaterThan(
        kgPerformanceBefore.avgEmbeddingTime
      );

      // Phase 4: Monitor cascade detection and recovery
      const cascadeAnalysis = await performanceMonitor.analyzeCascadingDegradation({
        rootCause: 'redis-performance',
        affectedSystems: ['cache', 'knowledge-graph'],
        analysisWindow: 60000 // 1 minute
      });

      expect(cascadeAnalysis.cascadeDetected).toBe(true);
      expect(cascadeAnalysis.rootCauseConfirmed).toBe(true);
      expect(cascadeAnalysis.impactedOperations).toBeGreaterThan(0);

      // Recovery should be triggered automatically
      const recoveryActions = await performanceMonitor.triggerCascadeRecovery();

      expect(recoveryActions.includes('redis-circuit-breaker')).toBe(true);
      expect(recoveryActions.includes('cache-fallback-mode')).toBe(true);
      expect(recoveryActions.includes('kg-reduced-precision')).toBe(true);
    });

    it('should implement circuit breakers to prevent cascade amplification', async () => {
      // Configure circuit breakers
      await cacheManager.setCircuitBreaker('redis-operations', {
        failureThreshold: 5,
        timeout: 30000,
        monitoringPeriod: 10000
      });

      await knowledgeGraph.setCircuitBreaker('cache-operations', {
        failureThreshold: 3,
        timeout: 20000,
        monitoringPeriod: 5000
      });

      // Simulate Redis failures
      const redisFailures = [];
      for (let i = 0; i < 10; i++) {
        redisFailures.push(
          redisClient.get(`failing-key-${i}`).catch(err => err)
        );
      }

      await Promise.all(redisFailures);

      // Circuit breakers should activate
      const circuitStates = await performanceMonitor.getCircuitBreakerStates();

      expect(circuitStates['cache-redis-operations'].isOpen).toBe(true);

      // Further operations should fail fast
      const startTime = Date.now();

      try {
        await cacheManager.get('circuit-test', 'test-key');
      } catch (error) {
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(100); // Should fail fast
        expect(error.message).toMatch(/circuit.*breaker/i);
      }

      // Knowledge graph should also activate circuit breaker for cache operations
      expect(circuitStates['kg-cache-operations'].isOpen).toBe(true);

      // Systems should fall back to alternative strategies
      const fallbackStrategies = await performanceMonitor.getActiveFallbackStrategies();

      expect(fallbackStrategies).toContain('cache-local-only');
      expect(fallbackStrategies).toContain('kg-direct-embedding');
    });
  });

  // Helper functions
  async function simulateSystemMemoryPressure(percentage: number) {
    await performanceMonitor.simulateSystemMemoryUsage(percentage);
    await cacheManager.handleMemoryPressure(percentage);
    await knowledgeGraph.handleMemoryPressure(percentage);
    await learningEngine.handleMemoryPressure(percentage);
  }

  async function simulateNetworkPartition(partition1: string[], partition2: string[]) {
    await performanceMonitor.simulateNetworkPartition(partition1, partition2);
    await cacheManager.simulateNetworkPartition(partition1, partition2);
    await knowledgeGraph.simulateNetworkPartition(partition1, partition2);
    await learningEngine.simulateNetworkPartition(partition1, partition2);
  }

  async function healNetworkPartition() {
    await performanceMonitor.healNetworkPartition();
    await cacheManager.healNetworkPartition();
    await knowledgeGraph.healNetworkPartition();
    await learningEngine.healNetworkPartition();
  }
});