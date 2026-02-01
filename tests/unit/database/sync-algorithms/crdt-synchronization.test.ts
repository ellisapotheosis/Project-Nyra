/**
 * Unit Tests for CRDT Synchronization
 * Tests conflict-free replicated data types and distributed consensus
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CRDTSynchronization } from '../../../../src/database/sync-algorithms/crdt-synchronization';
import { CRDTOperation, ConflictResolutionStrategy, VectorClock } from '../../../../src/database/sync-algorithms/crdt-synchronization';

describe('CRDTSynchronization', () => {
  let crdt1: CRDTSynchronization;
  let crdt2: CRDTSynchronization;
  let crdt3: CRDTSynchronization;

  const node1Id = 'node-1';
  const node2Id = 'node-2';
  const node3Id = 'node-3';

  beforeEach(() => {
    crdt1 = new CRDTSynchronization(node1Id);
    crdt2 = new CRDTSynchronization(node2Id);
    crdt3 = new CRDTSynchronization(node3Id);
  });

  afterEach(async () => {
    await crdt1?.destroy();
    await crdt2?.destroy();
    await crdt3?.destroy();
  });

  describe('Basic CRDT Operations', () => {
    it('should apply operations locally', async () => {
      const operation: CRDTOperation = {
        id: 'op-1',
        type: 'insert',
        key: 'borrower-123',
        value: { name: 'John Doe', creditScore: 750 },
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(operation);

      const value = await crdt1.getValue('borrower-123');
      expect(value).toEqual({ name: 'John Doe', creditScore: 750 });
    });

    it('should handle concurrent operations without conflicts', async () => {
      // Node 1 inserts borrower data
      const op1: CRDTOperation = {
        id: 'op-1',
        type: 'insert',
        key: 'borrower-456',
        value: { name: 'Jane Smith', income: 75000 },
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Node 2 inserts different data for same borrower (concurrent)
      const op2: CRDTOperation = {
        id: 'op-2',
        type: 'update',
        key: 'borrower-456',
        value: { creditScore: 720, loanAmount: 350000 },
        timestamp: Date.now() + 1,
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: ['op-1'], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(op1);
      await crdt2.applyOperation(op2);

      // Synchronize nodes
      await crdt1.syncWithNode(node2Id);
      await crdt2.syncWithNode(node1Id);

      // Both nodes should have merged data
      const value1 = await crdt1.getValue('borrower-456');
      const value2 = await crdt2.getValue('borrower-456');

      expect(value1).toEqual(value2);
      expect(value1).toMatchObject({
        name: 'Jane Smith',
        income: 75000,
        creditScore: 720,
        loanAmount: 350000
      });
    });

    it('should respect causality constraints', async () => {
      // Operation that must happen first
      const parentOp: CRDTOperation = {
        id: 'parent-op',
        type: 'insert',
        key: 'loan-application',
        value: { status: 'submitted', borrowerId: 'borrower-789' },
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Operation that depends on the parent
      const dependentOp: CRDTOperation = {
        id: 'dependent-op',
        type: 'update',
        key: 'loan-application',
        value: { status: 'approved', approvalDate: new Date() },
        timestamp: Date.now() + 100,
        nodeId: node2Id,
        vectorClock: { [node1Id]: 1, [node2Id]: 1 },
        causality: { happensBefore: ['parent-op'], concurrent: [], dependencies: ['loan-application'] },
        priority: 1
      };

      // Apply dependent operation first (should be queued)
      await crdt2.applyOperation(dependentOp);

      // Value should not be updated yet
      let value = await crdt2.getValue('loan-application');
      expect(value).toBeNull();

      // Apply parent operation
      await crdt2.applyOperation(parentOp);

      // Now both operations should be applied in correct order
      value = await crdt2.getValue('loan-application');
      expect(value.status).toBe('approved');
      expect(value.borrowerId).toBe('borrower-789');
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts using last-write-wins strategy', async () => {
      const strategy: ConflictResolutionStrategy = {
        strategy: 'last_write_wins',
        confidence: 1.0
      };

      await crdt1.setConflictResolutionStrategy('default', strategy);
      await crdt2.setConflictResolutionStrategy('default', strategy);

      const earlierOp: CRDTOperation = {
        id: 'earlier-op',
        type: 'update',
        key: 'credit-score',
        value: 720,
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const laterOp: CRDTOperation = {
        id: 'later-op',
        type: 'update',
        key: 'credit-score',
        value: 750,
        timestamp: Date.now() + 1000, // Later timestamp
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: ['earlier-op'], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(earlierOp);
      await crdt2.applyOperation(laterOp);

      // Sync nodes
      await crdt1.syncWithNode(node2Id);
      await crdt2.syncWithNode(node1Id);

      // Later operation should win
      const value1 = await crdt1.getValue('credit-score');
      const value2 = await crdt2.getValue('credit-score');

      expect(value1).toBe(750);
      expect(value2).toBe(750);
    });

    it('should resolve conflicts using vector clocks', async () => {
      const strategy: ConflictResolutionStrategy = {
        strategy: 'vector_clock',
        confidence: 0.9
      };

      await crdt1.setConflictResolutionStrategy('vector-clock', strategy);

      // Create operations with different vector clocks
      const op1: CRDTOperation = {
        id: 'op-1',
        type: 'update',
        key: 'loan-status',
        value: 'processing',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 2, [node2Id]: 1 }, // More recent
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const op2: CRDTOperation = {
        id: 'op-2',
        type: 'update',
        key: 'loan-status',
        value: 'submitted',
        timestamp: Date.now() + 500,
        nodeId: node2Id,
        vectorClock: { [node1Id]: 1, [node2Id]: 1 }, // Less recent despite later timestamp
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(op2);
      await crdt1.applyOperation(op1);

      // Vector clock should determine winner
      const value = await crdt1.getValue('loan-status');
      expect(value).toBe('processing');
    });

    it('should handle semantic merge conflicts', async () => {
      const strategy: ConflictResolutionStrategy = {
        strategy: 'semantic_merge',
        mergeFunction: (local: any, remote: any) => ({
          ...local,
          ...remote,
          mergedAt: new Date().toISOString(),
          sources: [local.source, remote.source]
        }),
        confidence: 0.8
      };

      await crdt1.setConflictResolutionStrategy('semantic', strategy);

      const localOp: CRDTOperation = {
        id: 'local-op',
        type: 'update',
        key: 'borrower-profile',
        value: { name: 'John Doe', source: 'application' },
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const remoteOp: CRDTOperation = {
        id: 'remote-op',
        type: 'update',
        key: 'borrower-profile',
        value: { creditScore: 750, source: 'credit-bureau' },
        timestamp: Date.now() + 100,
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: ['local-op'], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(localOp);
      await crdt1.applyOperation(remoteOp);

      const mergedValue = await crdt1.getValue('borrower-profile');
      expect(mergedValue.name).toBe('John Doe');
      expect(mergedValue.creditScore).toBe(750);
      expect(mergedValue.mergedAt).toBeDefined();
      expect(mergedValue.sources).toEqual(['application', 'credit-bureau']);
    });
  });

  describe('Distributed Synchronization', () => {
    it('should synchronize across multiple nodes', async () => {
      // Each node creates different data
      await crdt1.applyOperation({
        id: 'node1-op',
        type: 'insert',
        key: 'data-from-node1',
        value: 'value1',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      await crdt2.applyOperation({
        id: 'node2-op',
        type: 'insert',
        key: 'data-from-node2',
        value: 'value2',
        timestamp: Date.now(),
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      await crdt3.applyOperation({
        id: 'node3-op',
        type: 'insert',
        key: 'data-from-node3',
        value: 'value3',
        timestamp: Date.now(),
        nodeId: node3Id,
        vectorClock: { [node3Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      // Synchronize all nodes
      await crdt1.syncWithNode(node2Id);
      await crdt1.syncWithNode(node3Id);
      await crdt2.syncWithNode(node1Id);
      await crdt2.syncWithNode(node3Id);
      await crdt3.syncWithNode(node1Id);
      await crdt3.syncWithNode(node2Id);

      // All nodes should have all data
      const nodes = [crdt1, crdt2, crdt3];
      for (const node of nodes) {
        expect(await node.getValue('data-from-node1')).toBe('value1');
        expect(await node.getValue('data-from-node2')).toBe('value2');
        expect(await node.getValue('data-from-node3')).toBe('value3');
      }
    });

    it('should handle network partitions gracefully', async () => {
      // Create initial synchronized state
      await crdt1.applyOperation({
        id: 'initial-op',
        type: 'insert',
        key: 'shared-data',
        value: 'initial-value',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      await crdt1.syncWithNode(node2Id);

      // Simulate network partition
      crdt1.simulateNetworkPartition([node2Id]);
      crdt2.simulateNetworkPartition([node1Id]);

      // Make conflicting updates during partition
      await crdt1.applyOperation({
        id: 'partition-op-1',
        type: 'update',
        key: 'shared-data',
        value: 'node1-update',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 2 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      await crdt2.applyOperation({
        id: 'partition-op-2',
        type: 'update',
        key: 'shared-data',
        value: 'node2-update',
        timestamp: Date.now() + 100,
        nodeId: node2Id,
        vectorClock: { [node2Id]: 2 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      // Heal partition
      crdt1.healNetworkPartition();
      crdt2.healNetworkPartition();

      // Synchronize after healing
      await crdt1.syncWithNode(node2Id);
      await crdt2.syncWithNode(node1Id);

      // Conflict should be resolved consistently
      const value1 = await crdt1.getValue('shared-data');
      const value2 = await crdt2.getValue('shared-data');
      expect(value1).toBe(value2);
    });

    it('should use Merkle trees for efficient synchronization', async () => {
      // Add many operations to create tree structure
      const operations = [];
      for (let i = 0; i < 100; i++) {
        const op: CRDTOperation = {
          id: `op-${i}`,
          type: 'insert',
          key: `key-${i}`,
          value: `value-${i}`,
          timestamp: Date.now() + i,
          nodeId: node1Id,
          vectorClock: { [node1Id]: i + 1 },
          causality: { happensBefore: [], concurrent: [], dependencies: [] },
          priority: 1
        };
        operations.push(op);
        await crdt1.applyOperation(op);
      }

      // Sync only subset to node2
      for (let i = 0; i < 50; i++) {
        await crdt2.applyOperation(operations[i]);
      }

      // Merkle tree sync should identify missing operations efficiently
      const syncStartTime = performance.now();
      await crdt1.syncWithNode(node2Id);
      const syncTime = performance.now() - syncStartTime;

      // Should be efficient (complete in reasonable time)
      expect(syncTime).toBeLessThan(1000); // 1 second

      // Verify all operations are synchronized
      for (let i = 0; i < 100; i++) {
        expect(await crdt2.getValue(`key-${i}`)).toBe(`value-${i}`);
      }
    });
  });

  describe('Byzantine Fault Tolerance', () => {
    it('should detect and handle byzantine failures', async () => {
      // Configure byzantine fault tolerance
      await crdt1.enableByzantineTolerance(3, 1); // 3 nodes, tolerate 1 failure

      // Node 2 acts byzantinely (sends conflicting information)
      const byzantineOp1: CRDTOperation = {
        id: 'byzantine-op',
        type: 'update',
        key: 'critical-data',
        value: 'malicious-value-1',
        timestamp: Date.now(),
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const byzantineOp2: CRDTOperation = {
        id: 'byzantine-op', // Same ID but different value
        type: 'update',
        key: 'critical-data',
        value: 'malicious-value-2',
        timestamp: Date.now(),
        nodeId: node2Id,
        vectorClock: { [node2Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Send different operations to different nodes
      await crdt1.receiveOperation(byzantineOp1);
      await crdt3.receiveOperation(byzantineOp2);

      // Legitimate operation from node1
      const legitimateOp: CRDTOperation = {
        id: 'legitimate-op',
        type: 'update',
        key: 'critical-data',
        value: 'correct-value',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(legitimateOp);
      await crdt3.applyOperation(legitimateOp);

      // Byzantine node should be detected and isolated
      const byzantineNodes = await crdt1.getByzantineNodes();
      expect(byzantineNodes).toContain(node2Id);

      // Consensus should converge on legitimate value
      const value1 = await crdt1.getValue('critical-data');
      const value3 = await crdt3.getValue('critical-data');
      expect(value1).toBe('correct-value');
      expect(value3).toBe('correct-value');
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle high operation throughput', async () => {
      const operationCount = 1000;
      const startTime = performance.now();

      // Apply many operations
      const operations = [];
      for (let i = 0; i < operationCount; i++) {
        operations.push(crdt1.applyOperation({
          id: `perf-op-${i}`,
          type: 'insert',
          key: `perf-key-${i}`,
          value: `perf-value-${i}`,
          timestamp: Date.now() + i,
          nodeId: node1Id,
          vectorClock: { [node1Id]: i + 1 },
          causality: { happensBefore: [], concurrent: [], dependencies: [] },
          priority: 1
        }));
      }

      await Promise.all(operations);
      const endTime = performance.now();

      const throughput = operationCount / ((endTime - startTime) / 1000);
      expect(throughput).toBeGreaterThan(100); // 100 ops/second minimum
    });

    it('should scale with number of nodes', async () => {
      const nodeCount = 10;
      const nodes: CRDTSynchronization[] = [];

      // Create multiple nodes
      for (let i = 0; i < nodeCount; i++) {
        nodes.push(new CRDTSynchronization(`node-${i}`));
      }

      try {
        // Each node creates unique data
        for (let i = 0; i < nodeCount; i++) {
          await nodes[i].applyOperation({
            id: `scale-op-${i}`,
            type: 'insert',
            key: `scale-key-${i}`,
            value: `scale-value-${i}`,
            timestamp: Date.now() + i,
            nodeId: `node-${i}`,
            vectorClock: { [`node-${i}`]: 1 },
            causality: { happensBefore: [], concurrent: [], dependencies: [] },
            priority: 1
          });
        }

        // Synchronize all nodes (mesh topology)
        const syncStartTime = performance.now();

        for (let i = 0; i < nodeCount; i++) {
          for (let j = 0; j < nodeCount; j++) {
            if (i !== j) {
              await nodes[i].syncWithNode(`node-${j}`);
            }
          }
        }

        const syncTime = performance.now() - syncStartTime;

        // Should complete in reasonable time despite O(n²) communications
        expect(syncTime).toBeLessThan(5000); // 5 seconds

        // All nodes should have all data
        for (let i = 0; i < nodeCount; i++) {
          for (let j = 0; j < nodeCount; j++) {
            const value = await nodes[i].getValue(`scale-key-${j}`);
            expect(value).toBe(`scale-value-${j}`);
          }
        }

      } finally {
        // Cleanup
        for (const node of nodes) {
          await node.destroy();
        }
      }
    });

    it('should optimize memory usage for large datasets', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Create large dataset
      for (let i = 0; i < 10000; i++) {
        await crdt1.applyOperation({
          id: `memory-op-${i}`,
          type: 'insert',
          key: `memory-key-${i}`,
          value: 'x'.repeat(1000), // 1KB per value
          timestamp: Date.now() + i,
          nodeId: node1Id,
          vectorClock: { [node1Id]: i + 1 },
          causality: { happensBefore: [], concurrent: [], dependencies: [] },
          priority: 1
        });
      }

      // Force garbage collection
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not use excessive memory (allow reasonable overhead)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle malformed operations gracefully', async () => {
      const malformedOp = {
        id: 'malformed',
        type: 'invalid-type',
        key: null,
        value: undefined,
        timestamp: 'invalid',
        nodeId: node1Id,
        vectorClock: null,
        causality: undefined,
        priority: 'high'
      } as any;

      // Should not crash
      await expect(crdt1.applyOperation(malformedOp)).rejects.toThrow();

      // Should continue to work normally
      await expect(crdt1.applyOperation({
        id: 'valid-op',
        type: 'insert',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      })).resolves.toBeUndefined();
    });

    it('should recover from data corruption', async () => {
      // Apply valid operations
      await crdt1.applyOperation({
        id: 'before-corruption',
        type: 'insert',
        key: 'stable-data',
        value: 'stable-value',
        timestamp: Date.now(),
        nodeId: node1Id,
        vectorClock: { [node1Id]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      });

      // Simulate data corruption
      await crdt1.simulateCorruption('partial');

      // Should detect corruption and initiate recovery
      const recoveryResult = await crdt1.recover();
      expect(recoveryResult.success).toBe(true);

      // Should preserve uncorrupted data
      const value = await crdt1.getValue('stable-data');
      expect(value).toBe('stable-value');
    });
  });
});