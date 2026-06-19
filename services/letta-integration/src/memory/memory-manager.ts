import { v4 as uuidv4 } from "uuid";
import { LettaClient } from "../client/letta-client";
import { Memory, MemoryType } from "../types";
import { Logger } from "../utils/logger";
import { MemoryStore } from "./memory-store";

export class MemoryManager {
  private readonly logger = new Logger("MemoryManager");

  constructor(
    private readonly store: MemoryStore,
    private readonly agentId: string,
    private readonly client?: LettaClient
  ) {}

  async addMemory(
    content: string,
    type: MemoryType,
    metadata: Record<string, unknown> = {},
    importance = 0.5
  ): Promise<Memory> {
    const memory: Memory = {
      id: uuidv4(),
      agentId: this.agentId,
      type,
      content,
      metadata,
      timestamp: new Date(),
      importance,
      tags: [],
      references: [],
    };

    await this.store.saveMemory(memory);

    if (this.client) {
      try {
        await this.client.createMemory({
          agentId: memory.agentId,
          type: memory.type,
          content: memory.content,
          metadata: memory.metadata,
          embedding: memory.embedding,
          importance: memory.importance,
          tags: memory.tags,
          references: memory.references,
        });
      } catch (error) {
        this.logger.warn("Failed to persist memory remotely", { error });
      }
    }

    return memory;
  }

  async getMemoriesByType(type: MemoryType, limit = 100): Promise<Memory[]> {
    return this.store.getMemoriesByType(this.agentId, type, limit);
  }
}
