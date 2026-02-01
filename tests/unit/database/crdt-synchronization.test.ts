/**
 * Unit Tests for CRDT Synchronization
 * Tests conflict-free replicated data types, vector clocks, and distributed consensus
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CRDTSynchronization, CRDTOperation, VectorClock, ConflictResolution } from '../../../src/database/sync-algorithms/crdt-synchronization';

describe('CRDTSynchronization', () => {
  let crdt1: CRDTSynchronization;
  let crdt2: CRDTSynchronization;
  let crdt3: CRDTSynchronization;

  const nodeId1 = 'node-1';
  const nodeId2 = 'node-2';
  const nodeId3 = 'node-3';

  beforeEach(() => {
    crdt1 = new CRDTSynchronization(nodeId1);
    crdt2 = new CRDTSynchronization(nodeId2);
    crdt3 = new CRDTSynchronization(nodeId3);
  });

  afterEach(async () => {
    await crdt1.destroy();
    await crdt2.destroy();
    await crdt3.destroy();
  });

  describe('Vector Clock Management', () => {
    it('should initialize vector clocks correctly', () => {
      const clock1 = crdt1.getVectorClock();
      const clock2 = crdt2.getVectorClock();

      expect(clock1[nodeId1]).toBe(0);
      expect(clock1[nodeId2]).toBeUndefined();
      expect(clock2[nodeId2]).toBe(0);
      expect(clock2[nodeId1]).toBeUndefined();
    });

    it('should increment vector clock on operations', async () => {
      const operation: CRDTOperation = {
        id: 'op-1',
        type: 'insert',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: {
          happensBefore: [],
          concurrent: [],
          dependencies: []
        },
        priority: 1
      };

      const initialClock = crdt1.getVectorClock()[nodeId1];
      await crdt1.applyOperation(operation);
      const newClock = crdt1.getVectorClock()[nodeId1];

      expect(newClock).toBe(initialClock + 1);
    });

    it('should merge vector clocks correctly', () => {
      const clock1: VectorClock = { 'node-1': 5, 'node-2': 3, 'node-3': 7 };
      const clock2: VectorClock = { 'node-1': 4, 'node-2': 6, 'node-3': 7 };

      const merged = crdt1.mergeVectorClocks(clock1, clock2);

      expect(merged['node-1']).toBe(5); // max(5, 4)
      expect(merged['node-2']).toBe(6); // max(3, 6)
      expect(merged['node-3']).toBe(7); // max(7, 7)
    });

    it('should detect concurrent operations', () => {
      const clock1: VectorClock = { 'node-1': 5, 'node-2': 3 };
      const clock2: VectorClock = { 'node-1': 4, 'node-2': 4 };

      const relation = crdt1.compareVectorClocks(clock1, clock2);
      expect(relation).toBe('concurrent');
    });

    it('should detect happens-before relationships', () => {
      const clock1: VectorClock = { 'node-1': 3, 'node-2': 2 };
      const clock2: VectorClock = { 'node-1': 5, 'node-2': 4 };

      const relation = crdt1.compareVectorClocks(clock1, clock2);
      expect(relation).toBe('before');

      const reverseRelation = crdt1.compareVectorClocks(clock2, clock1);
      expect(reverseRelation).toBe('after');
    });
  });

  describe('CRDT Operations', () => {
    it('should apply insert operations correctly', async () => {
      const operation: CRDTOperation = {
        id: 'insert-op-1',
        type: 'insert',
        key: 'user-123',
        value: { name: 'John Doe', email: 'john@example.com' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: {
          happensBefore: [],
          concurrent: [],
          dependencies: []
        },
        priority: 1
      };

      await crdt1.applyOperation(operation);

      const value = crdt1.getValue('user-123');
      expect(value).toEqual({ name: 'John Doe', email: 'john@example.com' });
    });

    it('should apply update operations correctly', async () => {
      // First insert
      const insertOp: CRDTOperation = {
        id: 'insert-op',
        type: 'insert',
        key: 'document-1',
        value: { title: 'Original Title', content: 'Original content' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(insertOp);

      // Then update
      const updateOp: CRDTOperation = {
        id: 'update-op',
        type: 'update',
        key: 'document-1',
        value: { title: 'Updated Title', content: 'Updated content' },
        timestamp: Date.now() + 1000,
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: ['insert-op'], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(updateOp);

      const value = crdt1.getValue('document-1');
      expect(value.title).toBe('Updated Title');
      expect(value.content).toBe('Updated content');
    });

    it('should apply delete operations correctly', async () => {
      // Insert then delete
      const insertOp: CRDTOperation = {
        id: 'insert-op',
        type: 'insert',
        key: 'temp-key',
        value: 'temporary value',
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(insertOp);
      expect(crdt1.getValue('temp-key')).toBe('temporary value');

      const deleteOp: CRDTOperation = {
        id: 'delete-op',
        type: 'delete',
        key: 'temp-key',
        timestamp: Date.now() + 1000,
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: ['insert-op'], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(deleteOp);
      expect(crdt1.getValue('temp-key')).toBeNull();
    });

    it('should handle merge operations for complex data', async () => {
      const mergeOp: CRDTOperation = {
        id: 'merge-op',
        type: 'merge',
        key: 'user-profile',
        value: {
          personalInfo: { name: 'Alice', age: 30 },
          preferences: { theme: 'dark', language: 'en' },
          settings: { notifications: true }
        },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(mergeOp);

      // Apply partial merge from another node
      const partialMerge: CRDTOperation = {
        id: 'partial-merge-op',
        type: 'merge',
        key: 'user-profile',
        value: {
          personalInfo: { age: 31 }, // Age updated
          preferences: { notifications: false }, // New preference
          newSection: { data: 'new data' } // New section
        },
        timestamp: Date.now() + 1000,
        nodeId: nodeId2,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(partialMerge);

      const result = crdt1.getValue('user-profile');
      expect(result.personalInfo.name).toBe('Alice'); // Preserved
      expect(result.personalInfo.age).toBe(31); // Updated
      expect(result.preferences.theme).toBe('dark'); // Preserved
      expect(result.preferences.language).toBe('en'); // Preserved
      expect(result.preferences.notifications).toBe(false); // New
      expect(result.newSection.data).toBe('new data'); // Added
    });
  });

  describe('Conflict Detection and Resolution', () => {
    it('should detect conflicts between concurrent operations', async () => {
      const conflictingOp1: CRDTOperation = {
        id: 'conflict-op-1',
        type: 'update',
        key: 'shared-document',
        value: { title: 'Title from Node 1', version: 1 },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const conflictingOp2: CRDTOperation = {
        id: 'conflict-op-2',
        type: 'update',
        key: 'shared-document',
        value: { title: 'Title from Node 2', version: 1 },
        timestamp: Date.now() + 100, // Slightly later
        nodeId: nodeId2,
        vectorClock: { [nodeId2]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const conflicts1 = await crdt1.detectConflicts(conflictingOp1);
      expect(conflicts1).toHaveLength(0); // No conflicts initially

      await crdt1.applyOperation(conflictingOp1);

      const conflicts2 = await crdt1.detectConflicts(conflictingOp2);
      expect(conflicts2.length).toBeGreaterThan(0); // Should detect conflict
    });

    it('should resolve conflicts using last-write-wins strategy', async () => {
      crdt1.setConflictResolutionStrategy('shared-document', {
        strategy: 'last_write_wins',
        confidence: 0.9
      });

      const op1: CRDTOperation = {
        id: 'op1',
        type: 'update',
        key: 'shared-document',
        value: { content: 'First update' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const op2: CRDTOperation = {
        id: 'op2',
        type: 'update',
        key: 'shared-document',
        value: { content: 'Second update' },
        timestamp: Date.now() + 1000, // Later timestamp
        nodeId: nodeId2,
        vectorClock: { [nodeId2]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(op1);
      await crdt1.applyOperation(op2);

      const value = crdt1.getValue('shared-document');
      expect(value.content).toBe('Second update'); // Last write wins
    });

    it('should resolve conflicts using semantic merge strategy', async () => {
      crdt1.setConflictResolutionStrategy('user-data', {
        strategy: 'semantic_merge',
        mergeFunction: (local: any, remote: any) => ({
          ...local,
          ...remote,
          mergedAt: Date.now(),
          sources: [local.nodeId, remote.nodeId].filter(id => id)
        }),
        confidence: 0.8
      });

      const localOp: CRDTOperation = {
        id: 'local-op',
        type: 'update',
        key: 'user-data',
        value: { name: 'Alice', age: 30, nodeId: nodeId1 },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const remoteOp: CRDTOperation = {
        id: 'remote-op',
        type: 'update',
        key: 'user-data',
        value: { email: 'alice@example.com', city: 'New York', nodeId: nodeId2 },
        timestamp: Date.now() + 100,
        nodeId: nodeId2,
        vectorClock: { [nodeId2]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(localOp);
      await crdt1.applyOperation(remoteOp);

      const merged = crdt1.getValue('user-data');
      expect(merged.name).toBe('Alice');
      expect(merged.age).toBe(30);
      expect(merged.email).toBe('alice@example.com');
      expect(merged.city).toBe('New York');
      expect(merged.mergedAt).toBeDefined();
      expect(merged.sources).toContain(nodeId1);
      expect(merged.sources).toContain(nodeId2);
    });

    it('should resolve conflicts using priority-based strategy', async () => {
      const highPriorityOp: CRDTOperation = {
        id: 'high-priority-op',
        type: 'update',
        key: 'critical-data',
        value: { status: 'critical', priority: 'high' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 10 // High priority
      };

      const lowPriorityOp: CRDTOperation = {
        id: 'low-priority-op',
        type: 'update',
        key: 'critical-data',
        value: { status: 'normal', priority: 'low' },
        timestamp: Date.now() + 1000, // Later but lower priority
        nodeId: nodeId2,
        vectorClock: { [nodeId2]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1 // Low priority
      };

      crdt1.setConflictResolutionStrategy('critical-data', {
        strategy: 'last_write_wins',
        priorityFunction: (op1, op2) => op1.priority > op2.priority ? op1 : op2,
        confidence: 0.95
      });

      await crdt1.applyOperation(lowPriorityOp);
      await crdt1.applyOperation(highPriorityOp);

      const value = crdt1.getValue('critical-data');
      expect(value.status).toBe('critical'); // High priority wins despite being earlier
    });
  });

  describe('Causality and Dependencies', () => {
    it('should respect causality constraints', async () => {
      const op1: CRDTOperation = {
        id: 'causality-op-1',
        type: 'insert',
        key: 'parent-doc',
        value: { title: 'Parent Document' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 1 },
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const op2: CRDTOperation = {
        id: 'causality-op-2',
        type: 'insert',
        key: 'child-doc',
        value: { title: 'Child Document', parentId: 'parent-doc' },
        timestamp: Date.now() + 100,
        nodeId: nodeId1,
        vectorClock: { [nodeId1]: 2 },
        causality: {
          happensBefore: ['causality-op-1'], // Must happen after parent creation
          concurrent: [],
          dependencies: ['parent-doc']
        },
        priority: 1
      };

      // Apply child operation first (out of order)
      await crdt1.applyOperation(op2);

      // Child should be queued, not applied immediately
      expect(crdt1.getValue('child-doc')).toBeNull();
      expect(crdt1.getPendingOperations()).toContain(op2);

      // Apply parent operation
      await crdt1.applyOperation(op1);

      // Now child should be applied
      await new Promise(resolve => setTimeout(resolve, 50)); // Allow for async processing

      expect(crdt1.getValue('parent-doc')).toBeDefined();
      expect(crdt1.getValue('child-doc')).toBeDefined();
      expect(crdt1.getValue('child-doc').parentId).toBe('parent-doc');
    });

    it('should handle complex dependency chains', async () => {
      const ops: CRDTOperation[] = [
        {
          id: 'chain-op-3',
          type: 'insert',
          key: 'step-3',
          value: { step: 3, prev: 'step-2' },
          timestamp: Date.now(),
          nodeId: nodeId1,
          vectorClock: { [nodeId1]: 3 },
          causality: { happensBefore: ['chain-op-2'], concurrent: [], dependencies: ['step-2'] },
          priority: 1
        },
        {
          id: 'chain-op-1',
          type: 'insert',
          key: 'step-1',
          value: { step: 1 },
          timestamp: Date.now(),
          nodeId: nodeId1,
          vectorClock: { [nodeId1]: 1 },
          causality: { happensBefore: [], concurrent: [], dependencies: [] },
          priority: 1
        },
        {
          id: 'chain-op-2',
          type: 'insert',
          key: 'step-2',
          value: { step: 2, prev: 'step-1' },
          timestamp: Date.now(),
          nodeId: nodeId1,
          vectorClock: { [nodeId1]: 2 },
          causality: { happensBefore: ['chain-op-1'], concurrent: [], dependencies: ['step-1'] },
          priority: 1
        }
      ];

      // Apply operations out of order
      for (const op of ops) {
        await crdt1.applyOperation(op);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // All operations should be applied in correct order
      expect(crdt1.getValue('step-1')).toBeDefined();
      expect(crdt1.getValue('step-2')).toBeDefined();
      expect(crdt1.getValue('step-3')).toBeDefined();

      expect(crdt1.getValue('step-2').prev).toBe('step-1');
      expect(crdt1.getValue('step-3').prev).toBe('step-2');
    });
  });

  describe('Multi-Node Synchronization', () => {
    it('should sync operations between multiple nodes', async () => {
      // Connect nodes
      crdt1.addPeer(nodeId2);
      crdt2.addPeer(nodeId1);

      const operation: CRDTOperation = {
        id: 'sync-op-1',
        type: 'insert',
        key: 'shared-key',
        value: { data: 'shared data' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Apply operation on node1
      await crdt1.applyOperation(operation);

      // Wait for sync
      await new Promise(resolve => setTimeout(resolve, 100));

      // Node2 should have the data
      expect(crdt2.getValue('shared-key')).toEqual({ data: 'shared data' });

      // Vector clocks should be updated
      const clock2 = crdt2.getVectorClock();
      expect(clock2[nodeId1]).toBeGreaterThan(0);
    });

    it('should handle network partitions gracefully', async () => {
      // Set up initial connection
      crdt1.addPeer(nodeId2);
      crdt2.addPeer(nodeId1);

      // Both nodes apply different operations
      const op1: CRDTOperation = {
        id: 'partition-op-1',
        type: 'update',
        key: 'partitioned-data',
        value: { node: 'node1', data: 'data from node 1' },
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      const op2: CRDTOperation = {
        id: 'partition-op-2',
        type: 'update',
        key: 'partitioned-data',
        value: { node: 'node2', data: 'data from node 2' },
        timestamp: Date.now() + 100,
        nodeId: nodeId2,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Simulate network partition
      crdt1.removePeer(nodeId2);
      crdt2.removePeer(nodeId1);

      await crdt1.applyOperation(op1);
      await crdt2.applyOperation(op2);

      // Nodes have different values
      expect(crdt1.getValue('partitioned-data').node).toBe('node1');
      expect(crdt2.getValue('partitioned-data').node).toBe('node2');

      // Restore connection
      crdt1.addPeer(nodeId2);
      crdt2.addPeer(nodeId1);

      // Force sync
      await crdt1.syncWithPeer(nodeId2);
      await new Promise(resolve => setTimeout(resolve, 200));

      // Values should converge (last write wins by default)
      const value1 = crdt1.getValue('partitioned-data');
      const value2 = crdt2.getValue('partitioned-data');

      expect(value1).toEqual(value2);
      expect(value1.node).toBe('node2'); // Later timestamp
    });

    it('should maintain consistency across 3+ nodes', async () => {
      // Connect all nodes
      crdt1.addPeer(nodeId2);
      crdt1.addPeer(nodeId3);
      crdt2.addPeer(nodeId1);
      crdt2.addPeer(nodeId3);
      crdt3.addPeer(nodeId1);
      crdt3.addPeer(nodeId2);

      // Each node applies different operations
      const operations = [
        {
          node: crdt1,
          op: {
            id: 'multi-op-1',
            type: 'insert' as const,
            key: 'shared-counter',
            value: { count: 1, updatedBy: nodeId1 },
            timestamp: Date.now(),
            nodeId: nodeId1,
            vectorClock: {},
            causality: { happensBefore: [], concurrent: [], dependencies: [] },
            priority: 1
          }
        },
        {
          node: crdt2,
          op: {
            id: 'multi-op-2',
            type: 'update' as const,
            key: 'shared-counter',
            value: { count: 2, updatedBy: nodeId2 },
            timestamp: Date.now() + 100,
            nodeId: nodeId2,
            vectorClock: {},
            causality: { happensBefore: [], concurrent: [], dependencies: [] },
            priority: 1
          }
        },
        {
          node: crdt3,
          op: {
            id: 'multi-op-3',
            type: 'update' as const,
            key: 'shared-counter',
            value: { count: 3, updatedBy: nodeId3 },
            timestamp: Date.now() + 200,
            nodeId: nodeId3,
            vectorClock: {},
            causality: { happensBefore: [], concurrent: [], dependencies: [] },
            priority: 1
          }
        }
      ];

      // Apply operations
      for (const { node, op } of operations) {
        await node.applyOperation(op);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for full sync
      await new Promise(resolve => setTimeout(resolve, 500));

      // All nodes should have consistent state
      const value1 = crdt1.getValue('shared-counter');
      const value2 = crdt2.getValue('shared-counter');
      const value3 = crdt3.getValue('shared-counter');

      expect(value1).toEqual(value2);
      expect(value2).toEqual(value3);
      expect(value1.count).toBe(3); // Last update
      expect(value1.updatedBy).toBe(nodeId3);
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle operation validation failures', async () => {
      const invalidOp: CRDTOperation = {
        id: '', // Invalid: empty ID
        type: 'insert',
        key: '',  // Invalid: empty key
        value: null, // Invalid: null value
        timestamp: -1, // Invalid: negative timestamp
        nodeId: '', // Invalid: empty nodeId
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: -1 // Invalid: negative priority
      };

      await expect(crdt1.applyOperation(invalidOp))
        .rejects.toThrow();

      // State should remain unchanged
      expect(crdt1.getValue('')).toBeNull();
    });

    it('should recover from checksum validation failures', async () => {
      const validOp: CRDTOperation = {
        id: 'valid-op',
        type: 'insert',
        key: 'test-key',
        value: 'test-value',
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      await crdt1.applyOperation(validOp);

      // Simulate state corruption
      crdt1.corruptState('test-key');

      // Should detect corruption and attempt recovery
      const recovered = await crdt1.recoverCorruptedState('test-key');
      expect(recovered).toBe(true);
    });

    it('should handle peer communication failures', async () => {
      crdt1.addPeer(nodeId2);

      const operation: CRDTOperation = {
        id: 'comm-failure-op',
        type: 'insert',
        key: 'test-comm',
        value: 'test data',
        timestamp: Date.now(),
        nodeId: nodeId1,
        vectorClock: {},
        causality: { happensBefore: [], concurrent: [], dependencies: [] },
        priority: 1
      };

      // Simulate network failure
      crdt1.simulateNetworkFailure(nodeId2);

      // Operation should still be applied locally
      await expect(crdt1.applyOperation(operation)).resolves.not.toThrow();

      expect(crdt1.getValue('test-comm')).toBe('test data');

      // Should queue for later sync
      expect(crdt1.getPendingSync(nodeId2).length).toBeGreaterThan(0);

      // Restore network
      crdt1.restoreNetwork(nodeId2);

      // Should eventually sync
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(crdt1.getPendingSync(nodeId2).length).toBe(0);
    });
  });
});