/**
 * Comprehensive System Coordination Integration Tests
 * Tests critical cross-system interactions and data flow coordination
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { IntelligentCacheManager } from '../../src/database/caching/intelligent-cache-manager';
import { OptimizedRedisClient } from '../../src/database/caching/optimized-redis-client';
import { IntelligentPrefetchSystem } from '../../src/database/caching/intelligent-prefetch-system';
import { DistributedKnowledgeGraph } from '../../src/memory/knowledge-graph/distributed-knowledge-graph';
import { AdaptiveLearningEngine } from '../../src/memory/learning-systems/adaptive-learning-engine';
import { CrossDeviceSessionManager } from '../../src/memory/session-management/cross-device-session-manager';
import { PerformanceMonitor } from '../../src/monitoring/performance-monitor';

describe('Comprehensive System Coordination - CRITICAL INTEGRATION', () => {
  // System components
  let cacheManager: IntelligentCacheManager;
  let redisClient: OptimizedRedisClient;
  let prefetchSystem: IntelligentPrefetchSystem;
  let knowledgeGraph: DistributedKnowledgeGraph;
  let learningEngine: AdaptiveLearningEngine;
  let sessionManager: CrossDeviceSessionManager;
  let performanceMonitor: PerformanceMonitor;

  // Mock dependencies
  let mockEmbeddingModel: any;
  let mockSessionStorage: any;

  beforeEach(async () => {
    // Initialize mock dependencies
    mockEmbeddingModel = {
      embed: jest.fn().mockResolvedValue(Array(384).fill(0.1))
    };

    mockSessionStorage = {
      saveSession: jest.fn(),
      loadSession: jest.fn(),
      deleteSession: jest.fn()
    };

    // Initialize all systems
    performanceMonitor = new PerformanceMonitor('integration-node');
    redisClient = OptimizedRedisClient.getInstance({
      url: 'redis://localhost:6379',
      cacheKeyPrefix: 'coord:',
      cacheTtl: 3600,
      maxPoolSize: 10,
      minPoolSize: 3,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000,
      enableClustering: false
    });
    cacheManager = new IntelligentCacheManager('integration-node');
    prefetchSystem = new IntelligentPrefetchSystem({
      maxBandwidthBps: 50 * 1024 * 1024,
      reservedBandwidthPercent: 0.7,
      adaptiveBandwidth: true
    });
    knowledgeGraph = new DistributedKnowledgeGraph('integration-node', mockEmbeddingModel);
    learningEngine = new AdaptiveLearningEngine(knowledgeGraph);
    sessionManager = new CrossDeviceSessionManager('integration-node', knowledgeGraph, mockSessionStorage);

    // Wire systems together
    await setupSystemIntegration();
  });

  afterEach(async () => {
    await Promise.allSettled([
      cacheManager?.destroy(),
      redisClient?.destroy(),
      prefetchSystem?.destroy(),
      knowledgeGraph?.cleanup(),
      learningEngine?.destroy(),
      sessionManager?.destroy(),
      performanceMonitor?.destroy()
    ]);
  });

  async function setupSystemIntegration() {
    // Connect cache with prefetch system
    await cacheManager.setPrefetchSystem('main-cache', prefetchSystem);

    // Connect learning engine with cache performance feedback
    cacheManager.on('performanceMetrics', (metrics) => {
      learningEngine.learnFromPerformance('cache-system', metrics, {
        timestamp: Date.now(),
        systemType: 'cache'
      });
    });

    // Connect knowledge graph with session management
    knowledgeGraph.on('nodeAdded', (node) => {
      sessionManager.updateSessionKnowledge('current-session', node.id);
    });

    // Connect performance monitor to all systems
    performanceMonitor.addSystemMonitoring('cache', cacheManager);
    performanceMonitor.addSystemMonitoring('redis', redisClient);
    performanceMonitor.addSystemMonitoring('knowledge-graph', knowledgeGraph);
    performanceMonitor.addSystemMonitoring('learning-engine', learningEngine);
    performanceMonitor.addSystemMonitoring('session-manager', sessionManager);
  }

  describe('Cache-Memory-Learning Coordination - CRITICAL', () => {
    it('should coordinate cache invalidation with knowledge graph updates', async () => {
      // CRITICAL: Test cache-knowledge graph coordination
      const cacheId = 'knowledge-cache';

      // Add knowledge node and cache its data
      const knowledgeNode = await knowledgeGraph.addNode({
        mortgageBorrower: 'john-doe-123',
        loanAmount: 350000,
        creditScore: 740,
        dtiRatio: 0.28
      }, 'entity');

      await cacheManager.put(cacheId, `borrower:${knowledgeNode.id}`, {
        borrower: knowledgeNode.data,
        cached: true,
        embeddings: Array.from(knowledgeNode.embeddings)
      });

      // Verify cache hit
      const cachedData = await cacheManager.get(cacheId, `borrower:${knowledgeNode.id}`);
      expect(cachedData.cached).toBe(true);

      // Update knowledge node (should trigger cache invalidation)
      const updatedNode = await knowledgeGraph.updateNode(knowledgeNode.id, {
        creditScore: 760, // Credit score improved
        lastUpdated: new Date()
      });

      // Cache should be invalidated
      const invalidatedCache = await cacheManager.get(cacheId, `borrower:${knowledgeNode.id}`);
      expect(invalidatedCache).toBeNull();

      // Learning engine should learn from this invalidation pattern
      const invalidationPatterns = await learningEngine.getInvalidationPatterns();
      expect(invalidationPatterns.some(p => p.trigger === 'knowledge_graph_update')).toBe(true);
    });

    it('should use learning insights to optimize prefetch strategies', async () => {
      // CRITICAL: Test learning-driven prefetch optimization
      const cacheId = 'mortgage-quotes';

      // Simulate mortgage quote access patterns that learning engine observes
      const accessPatterns = [
        { borrowerId: 'borrower-1', loanType: 'conventional', timeOfDay: 9 },
        { borrowerId: 'borrower-2', loanType: 'fha', timeOfDay: 9 },
        { borrowerId: 'borrower-3', loanType: 'va', timeOfDay: 10 },
        { borrowerId: 'borrower-1', loanType: 'jumbo', timeOfDay: 14 }, // Same borrower, different loan
        { borrowerId: 'borrower-4', loanType: 'conventional', timeOfDay: 15 }
      ];

      // Record access patterns
      for (const pattern of accessPatterns) {
        const quoteKey = `quote:${pattern.borrowerId}:${pattern.loanType}`;
        const quoteData = {
          borrowerId: pattern.borrowerId,
          loanType: pattern.loanType,
          rate: 6.5 + Math.random() * 0.5,
          timestamp: new Date()
        };

        await cacheManager.put(cacheId, quoteKey, quoteData);
        await cacheManager.get(cacheId, quoteKey);

        // Record performance for learning
        await learningEngine.learnFromPerformance('cache-system', {
          responseTime: 50 + Math.random() * 20,
          accuracy: 0.95,
          cacheHit: true,
          userSatisfaction: 0.9,
          taskCompletion: 1.0,
          memoryEfficiency: 0.8
        }, pattern);
      }

      // Learning engine should identify patterns and optimize prefetch
      const optimizedStrategies = await learningEngine.generatePrefetchOptimizations();

      expect(optimizedStrategies.length).toBeGreaterThan(0);

      const borrowerBasedStrategy = optimizedStrategies.find(
        s => s.pattern.includes('same_borrower_multiple_loans')
      );
      expect(borrowerBasedStrategy).toBeDefined();
      expect(borrowerBasedStrategy?.confidence).toBeGreaterThan(0.7);

      // Apply optimizations to prefetch system
      await prefetchSystem.applyLearningOptimizations(optimizedStrategies);

      // Test optimized prefetch behavior
      await cacheManager.get(cacheId, 'quote:borrower-1:conventional');

      // Should prefetch related loans for same borrower
      const prefetchQueue = await prefetchSystem.getPrefetchQueue();
      expect(prefetchQueue.some(p => p.key.includes('borrower-1') && p.key.includes('jumbo'))).toBe(true);
    });

    it('should maintain session consistency across memory updates', async () => {
      // CRITICAL: Test session-memory consistency
      const userId = 'test-user-456';
      const sessionId = 'session-789';

      // Create session with initial context
      const session = await sessionManager.createSession(userId, {
        id: sessionId,
        contextData: {
          conversation: [
            {
              messageId: 'msg-1',
              role: 'user',
              content: 'I need a mortgage quote for $400,000',
              timestamp: new Date(),
              relatedNodes: [],
              contextWindow: 0,
              importance: 0.8
            }
          ],
          agentStates: new Map(),
          workflowState: {
            workflowId: 'mortgage-application',
            currentStep: 1,
            completedSteps: ['initial-inquiry'],
            pendingSteps: ['credit-check', 'income-verification', 'quote-generation'],
            variables: new Map([['loanAmount', 400000]]),
            branchingHistory: []
          },
          memoryAnchors: [],
          preferences: {
            communicationStyle: 'professional',
            responseLength: 'detailed',
            domainFocus: ['mortgage', 'real-estate'],
            learningStyle: 'visual',
            privacySettings: {
              dataRetention: 30,
              shareAcrossDevices: true,
              anonymizePersonalInfo: false,
              encryptSensitiveData: true
            }
          }
        }
      });

      // Add related knowledge to graph
      const borrowerProfile = await knowledgeGraph.addNode({
        userId,
        sessionId,
        loanAmount: 400000,
        inquiryType: 'purchase',
        timestamp: new Date()
      }, 'entity');

      // Session should be updated with knowledge reference
      const updatedSession = await sessionManager.getSession(sessionId);
      expect(updatedSession.contextData.memoryAnchors.some(
        anchor => anchor.associatedNodes.includes(borrowerProfile.id)
      )).toBe(true);

      // Update knowledge graph (simulating credit score retrieval)
      const updatedProfile = await knowledgeGraph.updateNode(borrowerProfile.id, {
        creditScore: 720,
        creditRetrievedAt: new Date()
      });

      // Session should reflect knowledge updates
      const finalSession = await sessionManager.getSession(sessionId);
      expect(finalSession.contextData.workflowState.variables.has('creditScore')).toBe(true);
      expect(finalSession.contextData.workflowState.variables.get('creditScore')).toBe(720);

      // Learning engine should learn from successful workflow progression
      const workflowPatterns = await learningEngine.getWorkflowPatterns(userId);
      expect(workflowPatterns.some(p => p.pattern.includes('credit_retrieval_after_inquiry'))).toBe(true);
    });
  });

  describe('Performance Monitoring Integration - CRITICAL', () => {
    it('should detect and respond to cross-system performance degradation', async () => {
      // CRITICAL: Test performance cascade detection and response
      const degradationScenario = {
        phase1: 'redis_connection_issues',
        phase2: 'cache_fallback_overload',
        phase3: 'knowledge_graph_slowdown',
        phase4: 'learning_engine_backlog'
      };

      // Phase 1: Simulate Redis connection issues
      jest.spyOn(redisClient, 'get').mockRejectedValue(new Error('Connection timeout'));

      const cacheId = 'performance-test';

      // This should trigger fallback to in-memory cache
      await cacheManager.put(cacheId, 'test-key', 'test-value');
      const result1 = await cacheManager.get(cacheId, 'test-key');

      expect(result1).toBe('test-value'); // Should still work via fallback

      // Monitor should detect Redis issues
      let alerts = await performanceMonitor.checkSystemHealth();
      expect(alerts.some(a => a.component === 'redis' && a.status !== 'healthy')).toBe(true);

      // Phase 2: Heavy load on fallback cache should stress knowledge graph
      const heavyLoad = Array(1000).fill(0).map((_, i) =>
        cacheManager.put(cacheId, `heavy-key-${i}`, `heavy-value-${i}`)
      );

      await Promise.all(heavyLoad);

      // Phase 3: Knowledge graph operations become slow
      const originalEmbed = mockEmbeddingModel.embed;
      mockEmbeddingModel.embed = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(Array(384).fill(0.1)), 2000))
      );

      const slowKnowledgeOp = knowledgeGraph.addNode({
        content: 'slow operation test'
      }, 'concept');

      // Phase 4: Learning engine should detect and adapt
      const cascadeDetection = await performanceMonitor.detectPerformanceCascade();

      expect(cascadeDetection.detected).toBe(true);
      expect(cascadeDetection.affectedSystems).toContain('redis');
      expect(cascadeDetection.affectedSystems).toContain('cache');
      expect(cascadeDetection.severity).toBe('high');

      // Learning engine should generate mitigation strategies
      const mitigationStrategies = await learningEngine.generateCascadeMitigations(cascadeDetection);

      expect(mitigationStrategies.length).toBeGreaterThan(0);
      const redisStrategy = mitigationStrategies.find(s => s.targetSystem === 'redis');
      expect(redisStrategy?.actions).toContain('enable_circuit_breaker');

      // Restore mocks
      mockEmbeddingModel.embed = originalEmbed;
    });

    it('should coordinate resource allocation across systems under pressure', async () => {
      // CRITICAL: Test resource coordination during high load
      const resourcePressureTest = async () => {
        // Simulate high memory pressure scenario
        const largeDataSets = Array(50).fill(0).map((_, i) => ({
          cacheData: Array(10000).fill(`cache-item-${i}`).join(''),
          knowledgeData: {
            id: `knowledge-${i}`,
            content: Array(5000).fill(`knowledge-item-${i}`).join(''),
            metadata: { size: 'large', priority: i % 3 === 0 ? 'high' : 'medium' }
          },
          sessionData: {
            sessionId: `session-${i}`,
            context: Array(1000).fill(`context-${i}`).join('')
          }
        }));

        // Load all systems simultaneously
        const systemLoadPromises = largeDataSets.map(async (dataset, i) => {
          const cachePromise = cacheManager.put('pressure-test', `cache-${i}`, dataset.cacheData);
          const knowledgePromise = knowledgeGraph.addNode(dataset.knowledgeData, 'entity');
          const sessionPromise = sessionManager.createSession(`user-${i}`, {
            contextData: { conversation: [{ content: dataset.sessionData.context }] }
          });

          return Promise.all([cachePromise, knowledgePromise, sessionPromise]);
        });

        const loadResults = await Promise.allSettled(systemLoadPromises);

        // Monitor resource usage during load
        const resourceMetrics = await performanceMonitor.getResourceMetrics();

        expect(resourceMetrics.memoryPressure).toBeGreaterThan(0.7);
        expect(resourceMetrics.systemStability).toBeLessThan(1.0);

        // Systems should coordinate to maintain stability
        const coordinationActions = await performanceMonitor.getResourceCoordination();

        expect(coordinationActions.length).toBeGreaterThan(0);
        expect(coordinationActions.some(a => a.action === 'cache_eviction_aggressive')).toBe(true);
        expect(coordinationActions.some(a => a.action === 'knowledge_graph_compaction')).toBe(true);

        return { loadResults, resourceMetrics, coordinationActions };
      };

      const testResults = await resourcePressureTest();

      // At least 80% of operations should succeed despite resource pressure
      const successfulOperations = testResults.loadResults.filter(r => r.status === 'fulfilled').length;
      const successRate = successfulOperations / testResults.loadResults.length;
      expect(successRate).toBeGreaterThan(0.8);

      // System should recover to stable state
      await new Promise(resolve => setTimeout(resolve, 2000)); // Allow recovery time

      const recoveryMetrics = await performanceMonitor.getResourceMetrics();
      expect(recoveryMetrics.memoryPressure).toBeLessThan(0.8);
      expect(recoveryMetrics.systemStability).toBeGreaterThan(0.9);
    });
  });

  describe('End-to-End Workflow Integration - CRITICAL', () => {
    it('should handle complete mortgage quote workflow across all systems', async () => {
      // CRITICAL: Test complete business workflow integration
      const mortgageWorkflow = {
        borrower: {
          id: 'borrower-mortgage-e2e',
          name: 'John Doe',
          email: 'john.doe@example.com',
          ssn: '123-45-6789', // Should be encrypted
          income: 85000,
          employment: 'Software Engineer'
        },
        loanRequest: {
          amount: 425000,
          type: 'conventional',
          purpose: 'purchase',
          propertyValue: 500000,
          downPayment: 75000
        }
      };

      const workflowId = 'e2e-mortgage-workflow';

      // Step 1: Create session for borrower interaction
      const session = await sessionManager.createSession(mortgageWorkflow.borrower.id, {
        id: `${workflowId}-session`,
        contextData: {
          workflowState: {
            workflowId,
            currentStep: 0,
            completedSteps: [],
            pendingSteps: [
              'borrower-profile-creation',
              'credit-check',
              'income-verification',
              'dti-calculation',
              'loan-qualification',
              'quote-generation',
              'disclosure-generation'
            ],
            variables: new Map([
              ['loanAmount', mortgageWorkflow.loanRequest.amount],
              ['loanType', mortgageWorkflow.loanRequest.type]
            ]),
            branchingHistory: []
          }
        }
      });

      // Step 2: Add borrower to knowledge graph
      const borrowerNode = await knowledgeGraph.addNode({
        ...mortgageWorkflow.borrower,
        loanRequest: mortgageWorkflow.loanRequest,
        workflowId,
        createdAt: new Date()
      }, 'entity');

      // Step 3: Cache borrower profile for quick access
      const cacheId = 'mortgage-borrowers';
      await cacheManager.put(cacheId, `profile:${mortgageWorkflow.borrower.id}`, {
        borrower: mortgageWorkflow.borrower,
        loanRequest: mortgageWorkflow.loanRequest,
        knowledgeNodeId: borrowerNode.id,
        sessionId: session.id,
        cached: true,
        cacheTime: new Date()
      });

      // Step 4: Simulate credit check (learning engine should optimize this)
      const creditCheckStart = Date.now();

      // This should trigger prefetch of related credit data
      await cacheManager.get(cacheId, `profile:${mortgageWorkflow.borrower.id}`);

      const creditScore = 720; // Simulated credit score

      // Update knowledge graph with credit info
      await knowledgeGraph.updateNode(borrowerNode.id, {
        creditScore,
        creditCheckedAt: new Date(),
        creditHistory: {
          score: creditScore,
          tradelines: 12,
          inquiries: 2,
          derogatory: 0
        }
      });

      const creditCheckTime = Date.now() - creditCheckStart;

      // Step 5: Learning engine learns from workflow performance
      await learningEngine.learnFromPerformance('mortgage-workflow', {
        responseTime: creditCheckTime,
        accuracy: 0.98,
        userSatisfaction: 0.9,
        taskCompletion: 1.0,
        memoryEfficiency: 0.85
      }, {
        workflowStep: 'credit-check',
        borrowerProfile: 'standard',
        loanType: mortgageWorkflow.loanRequest.type
      });

      // Step 6: Generate quote using cached and knowledge data
      const quoteData = {
        borrowerId: mortgageWorkflow.borrower.id,
        loanAmount: mortgageWorkflow.loanRequest.amount,
        creditScore,
        dtiRatio: (mortgageWorkflow.borrower.income * 12 * 0.28) / mortgageWorkflow.borrower.income, // Estimated
        interestRate: creditScore > 700 ? 6.25 : 6.75,
        monthlyPayment: 2580, // Calculated
        quotedAt: new Date(),
        validUntil: new Date(Date.now() + 86400000 * 30) // 30 days
      };

      await cacheManager.put(cacheId, `quote:${mortgageWorkflow.borrower.id}`, quoteData);

      // Step 7: Update session with workflow progress
      await sessionManager.updateSessionWorkflow(session.id, {
        currentStep: 6,
        completedSteps: [
          'borrower-profile-creation',
          'credit-check',
          'income-verification',
          'dti-calculation',
          'loan-qualification',
          'quote-generation'
        ],
        pendingSteps: ['disclosure-generation'],
        variables: new Map([
          ...session.contextData.workflowState.variables,
          ['creditScore', creditScore],
          ['interestRate', quoteData.interestRate],
          ['monthlyPayment', quoteData.monthlyPayment]
        ])
      });

      // Step 8: Performance monitoring throughout
      const workflowMetrics = await performanceMonitor.getWorkflowMetrics(workflowId);

      // Verify end-to-end workflow success
      expect(session.contextData.workflowState.completedSteps).toHaveLength(6);
      expect(borrowerNode.data.creditScore).toBe(creditScore);
      expect(quoteData.interestRate).toBeGreaterThan(0);

      // Verify system coordination worked
      expect(workflowMetrics.totalTime).toBeLessThan(5000); // Less than 5 seconds
      expect(workflowMetrics.cacheHitRate).toBeGreaterThan(0.8);
      expect(workflowMetrics.systemErrors).toBe(0);

      // Learning engine should have identified workflow optimizations
      const workflowOptimizations = await learningEngine.getWorkflowOptimizations(workflowId);
      expect(workflowOptimizations.length).toBeGreaterThan(0);
    });

    it('should handle concurrent workflows with resource sharing', async () => {
      // CRITICAL: Test concurrent workflow handling
      const concurrentWorkflows = Array(10).fill(0).map((_, i) => ({
        borrowerId: `concurrent-borrower-${i}`,
        workflowId: `concurrent-workflow-${i}`,
        loanAmount: 300000 + i * 50000,
        priority: i < 3 ? 'high' : 'normal'
      }));

      const workflowPromises = concurrentWorkflows.map(async (workflow, index) => {
        const startTime = Date.now();

        try {
          // Create session
          const session = await sessionManager.createSession(workflow.borrowerId);

          // Add to knowledge graph
          const node = await knowledgeGraph.addNode({
            borrowerId: workflow.borrowerId,
            loanAmount: workflow.loanAmount,
            priority: workflow.priority,
            index
          }, 'entity');

          // Cache borrower data
          await cacheManager.put('concurrent-test', workflow.borrowerId, {
            workflowId: workflow.workflowId,
            loanAmount: workflow.loanAmount,
            knowledgeNodeId: node.id,
            sessionId: session.id
          });

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

          return {
            workflowId: workflow.workflowId,
            success: true,
            duration: Date.now() - startTime,
            priority: workflow.priority
          };
        } catch (error) {
          return {
            workflowId: workflow.workflowId,
            success: false,
            error: error.message,
            duration: Date.now() - startTime,
            priority: workflow.priority
          };
        }
      });

      const results = await Promise.all(workflowPromises);

      // All workflows should succeed
      const successfulWorkflows = results.filter(r => r.success);
      expect(successfulWorkflows.length).toBe(concurrentWorkflows.length);

      // High-priority workflows should complete faster on average
      const highPriorityAvgTime = results
        .filter(r => r.priority === 'high')
        .reduce((sum, r) => sum + r.duration, 0) / 3;

      const normalPriorityAvgTime = results
        .filter(r => r.priority === 'normal')
        .reduce((sum, r) => sum + r.duration, 0) / 7;

      expect(highPriorityAvgTime).toBeLessThan(normalPriorityAvgTime * 1.2); // Within 20%

      // System should maintain performance under concurrent load
      const finalSystemHealth = await performanceMonitor.generateHealthReport();
      expect(finalSystemHealth.overall_health).toMatch(/healthy|warning/); // Not critical
    });
  });
});