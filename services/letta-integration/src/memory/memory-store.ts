import { Memory, MemoryType } from "../types";

export class MemoryStore {
  private readonly memories = new Map<string, Memory>();

  async saveMemory(memory: Memory): Promise<void> {
    this.memories.set(memory.id, memory);
  }

  async getMemory(memoryId: string): Promise<Memory | null> {
    return this.memories.get(memoryId) ?? null;
  }

  async getAllMemories(agentId: string): Promise<Memory[]> {
    return Array.from(this.memories.values()).filter(
      (memory) => memory.agentId === agentId
    );
  }

  async getMemoriesByType(
    agentId: string,
    type: MemoryType,
    limit = 100
  ): Promise<Memory[]> {
    return (await this.getAllMemories(agentId))
      .filter((memory) => memory.type === type)
      .slice(0, limit);
  }

  async searchByTags(
    agentId: string,
    tags: string[],
    limit = 50
  ): Promise<Memory[]> {
    return (await this.getAllMemories(agentId))
      .filter((memory) => tags.every((tag) => memory.tags.includes(tag)))
      .slice(0, limit);
  }
}
