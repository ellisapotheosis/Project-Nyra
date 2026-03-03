/**
 * Memory Service - Agent memory management
 *
 * Provides ReasoningBank and AgentDB functionality
 */

import type { Logger } from 'pino';
import type { Config } from '../config/index.js';

export interface MemoryEntry {
  id: string;
  namespace: string;
  key: string;
  value: unknown;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryClient {
  store: (namespace: string, key: string, value: unknown, metadata?: Record<string, unknown>) => Promise<void>;
  retrieve: (namespace: string, key: string) => Promise<MemoryEntry | null>;
  search: (namespace: string, query: string, limit?: number) => Promise<MemoryEntry[]>;
  delete: (namespace: string, key: string) => Promise<boolean>;
  list: (namespace: string, limit?: number) => Promise<MemoryEntry[]>;
}

// In-memory storage for development
const memoryStore = new Map<string, MemoryEntry>();

export async function initializeMemory(config: Config, logger: Logger): Promise<MemoryClient | null> {
  if (!config.enableAgentDB && !config.enableReasoningBank) {
    logger.warn('Memory features disabled');
    return null;
  }

  logger.info('Initializing in-memory store');

  const client: MemoryClient = {
    async store(namespace, key, value, metadata = {}) {
      const id = `${namespace}:${key}`;
      const entry: MemoryEntry = {
        id,
        namespace,
        key,
        value,
        metadata,
        createdAt: memoryStore.get(id)?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      memoryStore.set(id, entry);
      logger.debug({ id }, 'Memory stored');
    },

    async retrieve(namespace, key) {
      const id = `${namespace}:${key}`;
      return memoryStore.get(id) || null;
    },

    async search(namespace, query, limit = 10) {
      const results: MemoryEntry[] = [];
      const queryLower = query.toLowerCase();

      for (const entry of memoryStore.values()) {
        if (entry.namespace !== namespace) continue;

        const valueStr = JSON.stringify(entry.value).toLowerCase();
        if (valueStr.includes(queryLower) || entry.key.toLowerCase().includes(queryLower)) {
          results.push(entry);
          if (results.length >= limit) break;
        }
      }

      return results;
    },

    async delete(namespace, key) {
      const id = `${namespace}:${key}`;
      return memoryStore.delete(id);
    },

    async list(namespace, limit = 100) {
      const results: MemoryEntry[] = [];
      
      for (const entry of memoryStore.values()) {
        if (entry.namespace !== namespace) continue;
        results.push(entry);
        if (results.length >= limit) break;
      }

      return results;
    },
  };

  return client;
}
