# Mem0 Core - Structured Memory Platform Service

## 🎯 SERVICE CONTEXT

**Purpose**: Core Mem0 memory platform providing structured, retrievable memories with LLM integration, embedding management, and semantic querying for building persistent AI applications with external memory systems.

**Port**: 3160
**Language**: TypeScript + Express.js + Mem0 SDK
**Dependencies**: mem0-js, ruvector, vector-store, express, redis, @types/node
**Template**: CLAUDE-MD-TypeScript.md (mesh topology for memory distribution)

## 🚨 CRITICAL DEVELOPMENT RULES

### Mem0 Core Service Development Pattern
**MANDATORY**: All Mem0 core operations, memory management, and storage handlers MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Core Mem0 functionality
  - Write("src/mem0/client.ts", mem0ClientWrapper)
  - Write("src/mem0/memory-store.ts", memoryStorageLayer)
  - Write("src/mem0/embedding-service.ts", embeddingPipeline)
  - Write("src/mem0/retrieval-engine.ts", semanticRetrieval)

  // API endpoints
  - Write("src/routes/memory.routes.ts", memoryEndpoints)
  - Write("src/routes/retrieval.routes.ts", retrievalEndpoints)
  - Write("src/routes/user-profiles.routes.ts", userProfileRoutes)

  // Integration and storage
  - Write("src/integrations/ruvector.integration.ts", vectorIndexing)
  - Write("src/storage/memory-db.ts", persistenceLayer)
  - Write("src/storage/cache.ts", redisCache)

  // Core utilities
  - Write("src/utils/memory-validator.ts", validationLogic)
  - Write("src/utils/compression.ts", memoryCompression)

  // Tests
  - Write("tests/mem0-core.test.ts", coreTests)
  - Bash("pnpm test")
```

### Mem0 Memory Structure Rules
**CRITICAL**: Every memory operation MUST respect Mem0's structured format:

- **Memory Items**: Discrete, single-thought memories with metadata
- **Embedding Vectors**: Semantic embeddings for all memories
- **Metadata**: User ID, creation time, relevance score, tags
- **Versioning**: Track memory modifications and history
- **TTL**: Time-to-live for memories with automatic cleanup
- **Access Control**: Per-user memory isolation
- **Compression**: Automatic consolidation of related memories
- **Search Index**: Full-text + semantic hybrid search

## 📊 MEM0 CORE MEMORY ARCHITECTURE

### Memory Structure
```
Memory Object:
{
  id: "mem_12345",
  user_id: "user_abc",
  content: "User prefers morning calls before 10am",
  embedding: [0.123, 0.456, ..., 0.789],
  metadata: {
    category: "preferences",
    source: "conversation",
    confidence: 0.95,
    tags: ["communication", "schedule"]
  },
  version: 1,
  created_at: "2024-01-22T10:00:00Z",
  updated_at: "2024-01-22T10:00:00Z",
  ttl: 7776000,  // 90 days
  access_level: "user",
  hash: "sha256:abc123"
}
```

### Memory Operations Pipeline
```
Create/Update/Delete Memory
    ↓
Validate Schema
    ↓
Generate Embedding (semantic vector)
    ↓
Store in Primary DB
    ↓
Index in Vector Store (ruvector)
    ↓
Update Full-Text Index
    ↓
Invalidate Cache
    ↓
Return Memory with ID
```

### Search Pipeline
```
Search Query (text or embedding)
    ↓
If text query: Generate embedding
    ↓
Vector search in HNSW index (ruvector)
    ↓
Hybrid search: Combine vector + full-text results
    ↓
Rerank results by relevance
    ↓
Apply user permissions filter
    ↓
Return ranked memories
```

## 🐝 MEM0 CORE SWARM

### Agent Configuration
```yaml
topology: mesh  # Distributed memory processing
maxAgents: 7
strategy: parallel
language: typescript
framework: express + mem0-sdk

agents:
  memory_store_architect:
    role: Memory Storage Design
    focus: [schema-design, versioning, ttl-management]
    responsibilities:
      - Design memory data structures
      - Implement schema validation
      - Handle version control
      - Manage TTL and cleanup

  embedding_specialist:
    role: Embedding Generation & Management
    focus: [embedding-generation, vector-optimization, model-selection]
    responsibilities:
      - Generate embeddings for memories
      - Optimize embedding dimensions
      - Cache popular embeddings
      - Support multiple embedding models

  vector_indexing_engineer:
    role: Vector Index Optimization
    focus: [hnsw-indexing, ruvector-integration, index-maintenance]
    responsibilities:
      - Build and maintain HNSW indexes
      - Optimize search performance
      - Implement index rebuilding
      - Monitor index quality

  retrieval_specialist:
    role: Semantic Retrieval Engine
    focus: [semantic-search, hybrid-search, ranking]
    responsibilities:
      - Implement vector search queries
      - Combine with full-text search
      - Implement ranking algorithms
      - Handle search optimization

  storage_engineer:
    role: Persistent Storage
    focus: [database-operations, cache-management, persistence]
    responsibilities:
      - Manage database operations
      - Implement caching layer
      - Handle data serialization
      - Ensure data durability

  compression_optimizer:
    role: Memory Compression & Consolidation
    focus: [compression-algorithms, deduplication, consolidation]
    responsibilities:
      - Compress related memories
      - Detect and remove duplicates
      - Consolidate similar memories
      - Optimize storage efficiency

  test_engineer:
    role: Memory Testing & Validation
    focus: [jest, memory-correctness, search-accuracy]
    responsibilities:
      - Test memory operations
      - Validate search results
      - Performance testing
      - Integration testing
```

## 🔧 TYPESCRIPT + MEM0 PATTERNS

### Mem0 Core Service
```typescript
import { v4 as uuidv4 } from 'uuid';
import { ruvector } from 'ruvector';
import { Logger } from '../utils/logger';

export interface Memory {
  id: string;
  user_id: string;
  content: string;
  embedding?: number[];
  metadata: {
    category?: string;
    source?: string;
    confidence?: number;
    tags?: string[];
  };
  version: number;
  created_at: Date;
  updated_at: Date;
  ttl?: number;
  access_level: 'user' | 'public' | 'private';
  hash?: string;
}

export class Mem0CoreService {
  private vectorDB: ruvector;
  private logger: Logger;
  private memoryCache: Map<string, Memory> = new Map();

  constructor(
    vectorDBPath: string,
    private embeddingService: EmbeddingService
  ) {
    this.vectorDB = new ruvector({
      path: vectorDBPath,
      indexType: 'hnsw'
    });
    this.logger = new Logger('Mem0CoreService');
  }

  /**
   * Create a new memory item
   */
  async createMemory(
    userId: string,
    content: string,
    metadata?: Partial<Memory['metadata']>,
    ttl?: number
  ): Promise<Memory> {
    try {
      // Generate embedding for semantic search
      const embedding = await this.embeddingService.embed(content);

      // Create memory object
      const memory: Memory = {
        id: uuidv4(),
        user_id: userId,
        content,
        embedding,
        metadata: {
          category: metadata?.category || 'general',
          source: metadata?.source || 'api',
          confidence: metadata?.confidence || 1.0,
          tags: metadata?.tags || []
        },
        version: 1,
        created_at: new Date(),
        updated_at: new Date(),
        ttl: ttl || 7776000, // 90 days default
        access_level: 'user',
        hash: this.generateHash(content)
      };

      // Store in vector database
      await this.vectorDB.add({
        id: memory.id,
        text: content,
        embedding: embedding,
        metadata: {
          user_id: userId,
          version: 1,
          created_at: memory.created_at.toISOString(),
          ...memory.metadata
        }
      });

      // Cache memory
      this.memoryCache.set(memory.id, memory);

      this.logger.info(`Memory created: ${memory.id} for user ${userId}`);
      return memory;

    } catch (error) {
      this.logger.error('Failed to create memory', error);
      throw new Error('Memory creation failed');
    }
  }

  /**
   * Update existing memory
   */
  async updateMemory(
    memoryId: string,
    userId: string,
    updates: {
      content?: string;
      metadata?: Partial<Memory['metadata']>;
    }
  ): Promise<Memory> {
    try {
      // Get existing memory
      const existingMemory = await this.getMemory(memoryId, userId);

      if (!existingMemory) {
        throw new Error('Memory not found');
      }

      // Generate new embedding if content changed
      let embedding = existingMemory.embedding;
      if (updates.content) {
        embedding = await this.embeddingService.embed(updates.content);
      }

      // Update memory
      const updatedMemory: Memory = {
        ...existingMemory,
        content: updates.content || existingMemory.content,
        embedding,
        metadata: {
          ...existingMemory.metadata,
          ...updates.metadata
        },
        version: existingMemory.version + 1,
        updated_at: new Date()
      };

      // Update in vector database
      await this.vectorDB.update(memoryId, {
        text: updatedMemory.content,
        embedding: embedding,
        metadata: {
          user_id: userId,
          version: updatedMemory.version,
          updated_at: updatedMemory.updated_at.toISOString(),
          ...updatedMemory.metadata
        }
      });

      // Update cache
      this.memoryCache.set(memoryId, updatedMemory);

      this.logger.info(`Memory updated: ${memoryId} v${updatedMemory.version}`);
      return updatedMemory;

    } catch (error) {
      this.logger.error('Failed to update memory', error);
      throw error;
    }
  }

  /**
   * Retrieve memory by ID
   */
  async getMemory(memoryId: string, userId: string): Promise<Memory | null> {
    try {
      // Check cache first
      if (this.memoryCache.has(memoryId)) {
        const cached = this.memoryCache.get(memoryId)!;
        if (cached.user_id === userId) {
          return cached;
        }
      }

      // Fetch from vector database
      const result = await this.vectorDB.get(memoryId);

      if (!result || result.metadata.user_id !== userId) {
        return null;
      }

      const memory: Memory = {
        id: result.id,
        user_id: result.metadata.user_id,
        content: result.text,
        embedding: result.embedding,
        metadata: {
          category: result.metadata.category,
          source: result.metadata.source,
          confidence: result.metadata.confidence,
          tags: result.metadata.tags
        },
        version: result.metadata.version,
        created_at: new Date(result.metadata.created_at),
        updated_at: new Date(result.metadata.updated_at),
        ttl: result.metadata.ttl,
        access_level: 'user'
      };

      // Update cache
      this.memoryCache.set(memoryId, memory);

      return memory;

    } catch (error) {
      this.logger.error('Failed to retrieve memory', error);
      return null;
    }
  }

  /**
   * Delete memory by ID
   */
  async deleteMemory(memoryId: string, userId: string): Promise<boolean> {
    try {
      // Verify ownership
      const memory = await this.getMemory(memoryId, userId);

      if (!memory) {
        return false;
      }

      // Delete from vector database
      await this.vectorDB.delete(memoryId);

      // Remove from cache
      this.memoryCache.delete(memoryId);

      this.logger.info(`Memory deleted: ${memoryId}`);
      return true;

    } catch (error) {
      this.logger.error('Failed to delete memory', error);
      throw error;
    }
  }

  /**
   * Search memories using semantic search with HNSW indexing
   */
  async searchMemories(
    userId: string,
    query: string,
    options: {
      topK?: number;
      minConfidence?: number;
      tags?: string[];
      category?: string;
    } = {}
  ): Promise<Memory[]> {
    try {
      const topK = options.topK || 10;

      // Generate query embedding
      const queryEmbedding = await this.embeddingService.embed(query);

      // Search in HNSW index (ruvector) - O(log N) complexity
      const results = await this.vectorDB.search({
        embedding: queryEmbedding,
        limit: topK * 2, // Get more to filter
        filter: {
          user_id: userId,
          ...(options.category && { category: options.category }),
          ...(options.tags && { tags: options.tags })
        }
      });

      // Rank and filter results
      const memories: Memory[] = results
        .filter(r => !options.minConfidence || r.metadata.confidence >= options.minConfidence)
        .map(r => ({
          id: r.id,
          user_id: r.metadata.user_id,
          content: r.text,
          embedding: r.embedding,
          metadata: r.metadata,
          version: r.metadata.version,
          created_at: new Date(r.metadata.created_at),
          updated_at: new Date(r.metadata.updated_at),
          ttl: r.metadata.ttl,
          access_level: 'user',
          hash: r.metadata.hash
        }))
        .slice(0, topK);

      this.logger.debug(`Search found ${memories.length} memories for user ${userId}`);
      return memories;

    } catch (error) {
      this.logger.error('Memory search failed', error);
      throw error;
    }
  }

  /**
   * List all memories for a user
   */
  async listMemories(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'created' | 'updated' | 'relevance';
    } = {}
  ): Promise<Memory[]> {
    try {
      const limit = options.limit || 50;
      const offset = options.offset || 0;

      // Query memories from database
      const results = await this.vectorDB.query(
        `SELECT * FROM memories
         WHERE user_id = $1
         ORDER BY ${this.getSortField(options.sortBy)} DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return results.map(r => this.mapToMemory(r));

    } catch (error) {
      this.logger.error('Failed to list memories', error);
      throw error;
    }
  }

  /**
   * Get memories by category or tags
   */
  async getMemoriesByCategory(
    userId: string,
    category: string
  ): Promise<Memory[]> {
    try {
      const results = await this.vectorDB.query(
        `SELECT * FROM memories
         WHERE user_id = $1 AND metadata->>'category' = $2
         ORDER BY created_at DESC`,
        [userId, category]
      );

      return results.map(r => this.mapToMemory(r));

    } catch (error) {
      this.logger.error('Failed to get memories by category', error);
      throw error;
    }
  }

  /**
   * Compress related memories
   */
  async compressMemories(userId: string): Promise<void> {
    try {
      // Get all memories for user
      const memories = await this.listMemories(userId, { limit: 1000 });

      if (memories.length < 5) {
        return;
      }

      // Group similar memories by clustering
      const clusters = this.clusterMemoriesByEmbedding(memories);

      // Compress each cluster
      for (const cluster of clusters) {
        if (cluster.length > 1) {
          await this.consolidateCluster(userId, cluster);
        }
      }

      this.logger.info(`Compressed ${clusters.length} memory clusters for user ${userId}`);

    } catch (error) {
      this.logger.error('Memory compression failed', error);
      throw error;
    }
  }

  private generateHash(content: string): string {
    const crypto = require('crypto');
    return 'sha256:' + crypto
      .createHash('sha256')
      .update(content)
      .digest('hex');
  }

  private getSortField(sortBy?: string): string {
    switch (sortBy) {
      case 'updated':
        return 'updated_at';
      case 'relevance':
        return 'metadata->>\'confidence\'';
      case 'created':
      default:
        return 'created_at';
    }
  }

  private clusterMemoriesByEmbedding(memories: Memory[]): Memory[][] {
    // Simple clustering by embedding similarity
    const clusters: Memory[][] = [];
    const used = new Set<string>();

    for (const memory of memories) {
      if (used.has(memory.id)) continue;

      const cluster = [memory];
      used.add(memory.id);

      // Find similar memories
      for (const other of memories) {
        if (used.has(other.id)) continue;

        if (memory.embedding && other.embedding) {
          const similarity = this.cosineSimilarity(memory.embedding, other.embedding);
          if (similarity > 0.8) {
            cluster.push(other);
            used.add(other.id);
          }
        }
      }

      if (cluster.length > 1) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitude = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0)) *
                      Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / magnitude;
  }

  private async consolidateCluster(userId: string, cluster: Memory[]): Promise<void> {
    // Combine cluster memories into consolidated memory
    this.logger.debug(`Consolidating cluster of ${cluster.length} memories`);
  }

  private mapToMemory(row: any): Memory {
    return {
      id: row.id,
      user_id: row.user_id,
      content: row.content,
      embedding: row.embedding,
      metadata: row.metadata,
      version: row.version,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      ttl: row.ttl,
      access_level: row.access_level,
      hash: row.hash
    };
  }
}

// Embedding service interface
export interface EmbeddingService {
  embed(text: string): Promise<number[]>;
}
```

### REST API Endpoints
```typescript
import express, { Request, Response } from 'express';
import { Mem0CoreService } from '../services/mem0-core.service';

const router = express.Router();

/**
 * POST /api/memories
 * Create a new memory
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, content, metadata, ttl } = req.body;

    const memory = await mem0Service.createMemory(
      userId,
      content,
      metadata,
      ttl
    );

    res.status(201).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

/**
 * PUT /api/memories/:memoryId
 * Update a memory
 */
router.put('/:memoryId', async (req: Request, res: Response) => {
  try {
    const { memoryId } = req.params;
    const { userId, content, metadata } = req.body;

    const updated = await mem0Service.updateMemory(
      memoryId,
      userId,
      { content, metadata }
    );

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

/**
 * GET /api/memories/:memoryId
 * Get a specific memory
 */
router.get('/:memoryId', async (req: Request, res: Response) => {
  try {
    const { memoryId } = req.params;
    const { userId } = req.query;

    const memory = await mem0Service.getMemory(
      memoryId,
      userId as string
    );

    if (!memory) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.status(200).json(memory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve memory' });
  }
});

/**
 * DELETE /api/memories/:memoryId
 * Delete a memory
 */
router.delete('/:memoryId', async (req: Request, res: Response) => {
  try {
    const { memoryId } = req.params;
    const { userId } = req.query;

    const deleted = await mem0Service.deleteMemory(
      memoryId,
      userId as string
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

/**
 * POST /api/memories/search
 * Search memories semantically
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const { userId, query, topK, minConfidence, tags, category } = req.body;

    const results = await mem0Service.searchMemories(
      userId,
      query,
      { topK, minConfidence, tags, category }
    );

    res.status(200).json({
      query,
      results,
      count: results.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/memories
 * List user's memories
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { userId, limit, offset, sortBy } = req.query;

    const memories = await mem0Service.listMemories(
      userId as string,
      {
        limit: parseInt(limit as string) || 50,
        offset: parseInt(offset as string) || 0,
        sortBy: sortBy as 'created' | 'updated' | 'relevance'
      }
    );

    res.status(200).json({
      count: memories.length,
      memories
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list memories' });
  }
});

export default router;
```

## 📈 PERFORMANCE TARGETS

### Mem0 Core Performance
- Memory creation: < 100ms p95
- Memory retrieval: < 50ms p95
- Semantic search: < 100ms p95 (HNSW indexed)
- Memory update: < 150ms p95
- Batch import: < 10ms per memory
- Vector embedding: < 200ms per item

### Memory Efficiency
- Memory compression ratio: 50-70%
- Index overhead: +15-25%
- Cache hit ratio: >80%
- Storage per memory: <1KB average

## 🧪 TESTING REQUIREMENTS

```typescript
describe('Mem0 Core Service', () => {
  it('should create memory with embedding', async () => {
    const memory = await service.createMemory(
      'user123',
      'Prefers morning calls',
      { category: 'preferences' }
    );

    expect(memory.id).toBeDefined();
    expect(memory.embedding).toBeDefined();
    expect(memory.metadata.category).toBe('preferences');
  });

  it('should search memories semantically', async () => {
    const results = await service.searchMemories(
      'user123',
      'contact preferences',
      { topK: 5 }
    );

    expect(results.length).toBeLessThanOrEqual(5);
    expect(results[0].embedding).toBeDefined();
  });
});
```

---

**Mem0 Core is the structured memory foundation for the 5-memory system, providing reliable storage, semantic search, and memory management.**
