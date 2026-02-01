/**
 * Test Database Utilities
 *
 * TDD London School approach for database testing:
 * - Use in-memory SQLite for speed
 * - Mock database interactions for unit tests
 * - Real database for integration tests only
 */

import { vi } from 'vitest';

export interface TestDatabase {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  clear: () => Promise<void>;
  seed: (data: any) => Promise<void>;
}

export const createMockDatabase = (): TestDatabase => {
  const data = new Map<string, any[]>();

  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockImplementation(async () => {
      data.clear();
    }),
    seed: vi.fn().mockImplementation(async (seedData: any) => {
      Object.entries(seedData).forEach(([table, records]) => {
        data.set(table, records as any[]);
      });
    })
  };
};

export const setupTestDatabase = async (): Promise<TestDatabase> => {
  const db = createMockDatabase();
  await db.connect();
  return db;
};

export const teardownTestDatabase = async (db: TestDatabase): Promise<void> => {
  await db.clear();
  await db.disconnect();
};

// Query builders for testing
export const createMockQuery = <T = any>(results: T[] = []) => {
  return vi.fn().mockResolvedValue(results);
};

export const createMockTransaction = () => {
  return {
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([])
  };
};
