/**
 * Memory Search and Retrieval Engine
 * Advanced semantic search with multiple ranking strategies
 */

import { SearchQuery, SearchResult, Memory, TimeRange } from "../types";
import { Logger } from "../utils/logger";
import { LettaClient } from "../client/letta-client";
import { MemoryStore } from "../memory/memory-store";

export class SearchEngine {
  private logger: Logger;
  private client: LettaClient;
  private store: MemoryStore;

  constructor(client: LettaClient, store: MemoryStore) {
    this.logger = new Logger("SearchEngine");
    this.client = client;
    this.store = store;
  }

  async search(query: SearchQuery): Promise<SearchResult[]> {
    try {
      this.logger.info("Searching memories:", { query: query.query });

      // Generate query embedding for semantic search
      const queryEmbedding = await this.client.generateEmbedding(query.query);

      // Get candidate memories
      const candidates = await this.getCandidates(query);

      // Rank candidates
      const ranked = this.rankMemories(candidates, queryEmbedding, query);

      // Apply threshold filter
      const filtered = ranked.filter(
        (r) => r.score >= (query.threshold || 0.5)
      );

      // Apply limit
      const results = filtered.slice(0, query.limit || 10);

      this.logger.info("Search completed:", {
        results: results.length,
        total: candidates.length,
      });
      return results;
    } catch (error) {
      this.logger.error("Search failed:", error);
      throw error;
    }
  }

  async semanticSearch(
    query: string,
    agentId: string,
    limit = 10
  ): Promise<SearchResult[]> {
    return this.search({
      query,
      agentId,
      limit,
      threshold: 0.6,
    });
  }

  async searchByTags(
    agentId: string,
    tags: string[],
    limit = 50
  ): Promise<SearchResult[]> {
    try {
      const memories = await this.store.searchByTags(agentId, tags, limit);

      return memories.map((memory) => ({
        memory,
        score: 1.0,
        relevance: 1.0,
      }));
    } catch (error) {
      this.logger.error("Tag search failed:", error);
      throw error;
    }
  }

  async searchByTimeRange(
    agentId: string,
    timeRange: TimeRange,
    limit = 50
  ): Promise<SearchResult[]> {
    try {
      const allMemories = await this.store.getAllMemories(agentId);

      const filtered = allMemories.filter(
        (memory: Memory) =>
          memory.timestamp >= timeRange.start &&
          memory.timestamp <= timeRange.end
      );

      return filtered.slice(0, limit).map((memory) => ({
        memory,
        score: 1.0,
        relevance: 1.0,
      }));
    } catch (error) {
      this.logger.error("Time range search failed:", error);
      throw error;
    }
  }

  async hybridSearch(query: SearchQuery): Promise<SearchResult[]> {
    try {
      // Combine semantic search with keyword and tag matching
      const semanticResults = await this.search(query);

      const keywords = query.query.toLowerCase().split(/\s+/);
      const keywordResults = await this.keywordSearch(
        query.agentId!,
        keywords,
        query.limit
      );

      const tagResults = query.tags
        ? await this.searchByTags(query.agentId!, query.tags, query.limit)
        : [];

      // Merge and re-rank results
      const merged = this.mergeResults([
        semanticResults,
        keywordResults,
        tagResults,
      ]);

      return merged.slice(0, query.limit || 10);
    } catch (error) {
      this.logger.error("Hybrid search failed:", error);
      throw error;
    }
  }

  async findSimilar(memory: Memory, limit = 10): Promise<SearchResult[]> {
    try {
      if (!memory.embedding) {
        throw new Error("Memory has no embedding");
      }

      const allMemories = await this.store.getAllMemories(memory.agentId);

      const scored = allMemories
        .filter(
          (candidate: Memory) =>
            candidate.id !== memory.id && candidate.embedding
        )
        .map((candidate: Memory) => ({
          memory: candidate,
          score: this.cosineSimilarity(memory.embedding!, candidate.embedding!),
          relevance: this.cosineSimilarity(
            memory.embedding!,
            candidate.embedding!
          ),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scored;
    } catch (error) {
      this.logger.error("Similar search failed:", error);
      throw error;
    }
  }

  private async getCandidates(query: SearchQuery): Promise<Memory[]> {
    if (query.type && query.type.length > 0) {
      // Get memories of specific types
      const memories: Memory[] = [];
      for (const type of query.type) {
        const typeMemories = await this.store.getMemoriesByType(
          query.agentId!,
          type,
          1000
        );
        memories.push(...typeMemories);
      }
      return memories;
    }

    // Get all memories
    return this.store.getAllMemories(query.agentId!);
  }

  private rankMemories(
    memories: Memory[],
    queryEmbedding: number[],
    query: SearchQuery
  ): SearchResult[] {
    const results: SearchResult[] = [];

    for (const memory of memories) {
      if (!memory.embedding) continue;

      // Calculate semantic similarity
      const semanticScore = this.cosineSimilarity(
        queryEmbedding,
        memory.embedding
      );

      // Calculate keyword score
      const keywordScore = this.calculateKeywordScore(
        query.query,
        memory.content
      );

      // Calculate recency score
      const recencyScore = this.calculateRecencyScore(memory.timestamp);

      // Calculate importance score
      const importanceScore = memory.importance;

      // Weighted combination
      const score =
        semanticScore * 0.4 +
        keywordScore * 0.3 +
        recencyScore * 0.15 +
        importanceScore * 0.15;

      results.push({
        memory,
        score,
        relevance: semanticScore,
        highlights: this.generateHighlights(query.query, memory.content),
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] ** 2;
      normB += b[i] ** 2;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private calculateKeywordScore(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentWords = content.toLowerCase().split(/\s+/);

    let matches = 0;
    for (const word of queryWords) {
      if (contentWords.includes(word)) {
        matches++;
      }
    }

    return matches / queryWords.length;
  }

  private calculateRecencyScore(timestamp: Date): number {
    const now = Date.now();
    const age = now - timestamp.getTime();
    const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year

    return Math.max(0, 1 - age / maxAge);
  }

  private generateHighlights(query: string, content: string): string[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/);
    const highlights: string[] = [];

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();

      for (const word of queryWords) {
        if (lowerSentence.includes(word)) {
          highlights.push(sentence.trim());
          break;
        }
      }
    }

    return highlights.slice(0, 3);
  }

  private async keywordSearch(
    agentId: string,
    keywords: string[],
    limit?: number
  ): Promise<SearchResult[]> {
    const allMemories = await this.store.getAllMemories(agentId);

    const scored = allMemories
      .map((memory: Memory) => ({
        memory,
        score: this.calculateKeywordScore(keywords.join(" "), memory.content),
        relevance: this.calculateKeywordScore(
          keywords.join(" "),
          memory.content
        ),
      }))
      .filter((result: SearchResult) => result.score > 0)
      .sort((a: SearchResult, b: SearchResult) => b.score - a.score);

    return limit ? scored.slice(0, limit) : scored;
  }

  private mergeResults(resultSets: SearchResult[][]): SearchResult[] {
    const merged = new Map<string, SearchResult>();

    for (const results of resultSets) {
      for (const result of results) {
        const existing = merged.get(result.memory.id);

        if (existing) {
          // Combine scores
          existing.score = (existing.score + result.score) / 2;
          existing.relevance = Math.max(existing.relevance, result.relevance);
        } else {
          merged.set(result.memory.id, result);
        }
      }
    }

    return Array.from(merged.values()).sort((a, b) => b.score - a.score);
  }
}
