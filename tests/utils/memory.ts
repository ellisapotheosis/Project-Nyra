/**
 * Test Memory System Utilities
 *
 * Mock implementations for:
 * - RuVector (vector search)
 * - Letta (conversational memory)
 * - letta (knowledge graphs)
 * - Mem0 (user preferences)
 * - OpenMemory (collaborative memory)
 */

import { vi } from "vitest";

export interface TestMemorySystem {
  store: (key: string, value: any) => Promise<void>;
  retrieve: (key: string) => Promise<any>;
  search: (query: string, k?: number) => Promise<any[]>;
  clear: () => Promise<void>;
  addNode?: (node: any) => Promise<void>;
  addEdge?: (edge: any) => Promise<void>;
  query?: (query: string) => Promise<any[]>;
}

export const createMockRuVector = (): TestMemorySystem => {
  const storage = new Map<string, any>();
  const vectors = new Map<string, number[]>();

  return {
    store: vi.fn().mockImplementation(async (key: string, value: any) => {
      storage.set(key, value);
      // Mock vector embedding
      vectors.set(
        key,
        Array(768)
          .fill(0)
          .map(() => Math.random())
      );
    }),
    retrieve: vi.fn().mockImplementation(async (key: string) => {
      return storage.get(key);
    }),
    search: vi.fn().mockImplementation(async (query: string, k: number = 5) => {
      // Mock vector search - return all entries with mock scores
      const results = Array.from(storage.entries())
        .slice(0, k)
        .map(([key, value]) => ({
          key,
          value,
          score: Math.random(),
        }));
      return results.sort((a, b) => b.score - a.score);
    }),
    clear: vi.fn().mockImplementation(async () => {
      storage.clear();
      vectors.clear();
    }),
  };
};

export const createMockLetta = (): TestMemorySystem => {
  const agentMemories = new Map<string, any[]>();
  const graphNodes = new Map<string, any>();
  const graphEdges: any[] = [];

  return {
    store: vi.fn().mockImplementation(async (agentId: string, memory: any) => {
      if (!agentMemories.has(agentId)) {
        agentMemories.set(agentId, []);
      }
      agentMemories.get(agentId)!.push({
        timestamp: Date.now(),
        ...memory,
      });
    }),
    retrieve: vi.fn().mockImplementation(async (agentId: string) => {
      return agentMemories.get(agentId) || [];
    }),
    search: vi.fn().mockImplementation(async (query: string, k: number = 5) => {
      // Mock semantic search across all memories
      const allMemories: any[] = [];
      agentMemories.forEach((memories, agentId) => {
        memories.forEach((memory) => {
          allMemories.push({ agentId, ...memory });
        });
      });
      return allMemories.slice(0, k);
    }),
    clear: vi.fn().mockImplementation(async () => {
      agentMemories.clear();
      graphNodes.clear();
      graphEdges.splice(0, graphEdges.length);
    }),
    addNode: vi.fn().mockImplementation(async (node: any) => {
      graphNodes.set(node.id, node);
    }),
    addEdge: vi.fn().mockImplementation(async (edge: any) => {
      graphEdges.push(edge);
    }),
    query: vi.fn().mockImplementation(async () => {
      return Array.from(graphNodes.values()).slice(0, 10);
    }),
  };
};

export const createMockletta = () => {
  const nodes = new Map<string, any>();
  const edges: any[] = [];

  return {
    addNode: vi.fn().mockImplementation(async (node: any) => {
      nodes.set(node.id, node);
    }),
    addEdge: vi.fn().mockImplementation(async (edge: any) => {
      edges.push(edge);
    }),
    query: vi.fn().mockImplementation(async (cypher: string) => {
      // Mock Cypher query results
      return Array.from(nodes.values()).slice(0, 10);
    }),
    getEvolution: vi
      .fn()
      .mockImplementation(async (entityId: string, timeRange: any) => {
        // Mock temporal evolution
        return {
          entityId,
          changes: [],
          timeline: [],
        };
      }),
    clear: vi.fn().mockImplementation(async () => {
      nodes.clear();
      edges.splice(0, edges.length);
    }),
  };
};

export const createMockMem0 = (): TestMemorySystem => {
  const profiles = new Map<string, any>();

  return {
    store: vi
      .fn()
      .mockImplementation(async (userId: string, preferences: any) => {
        profiles.set(userId, { ...profiles.get(userId), ...preferences });
      }),
    retrieve: vi.fn().mockImplementation(async (userId: string) => {
      return profiles.get(userId) || {};
    }),
    search: vi.fn().mockImplementation(async (query: string, k: number = 5) => {
      return Array.from(profiles.entries())
        .slice(0, k)
        .map(([userId, profile]) => ({
          userId,
          profile,
        }));
    }),
    clear: vi.fn().mockImplementation(async () => {
      profiles.clear();
    }),
  };
};

export const setupTestMemory = async () => {
  return {
    ruvector: createMockRuVector(),
    letta: createMockLetta(),
    mem0: createMockMem0(),
  };
};

export const teardownTestMemory = async (memory: any) => {
  await memory.ruvector.clear();
  await memory.letta.clear();
  await memory.mem0.clear();
};
