# Letta Integration - Agent Memory & Reasoning Service

## 🎯 SERVICE CONTEXT

**Purpose**: TypeScript service providing persistent agent memory, long-term context management, and conversational reasoning using the Letta (formerly MemGPT) memory architecture integrated with ruvector vector search.

**Port**: 3150
**Language**: TypeScript + Express.js + Letta SDK
**Dependencies**: letta-js, @anthropic-sdk, ruvector, axios, redis, @types/node
**Template**: CLAUDE-MD-TypeScript.md (hierarchical topology for context management)

## 🚨 CRITICAL DEVELOPMENT RULES

### Memory Service Development Pattern
**MANDATORY**: All Letta endpoints, memory handlers, and context managers MUST be developed in parallel:

```typescript
// ✅ CORRECT: Batch development in ONE message
[Single Message]:
  // Letta client and core
  - Write("src/clients/letta-client.ts", lettaClientWrapper)
  - Write("src/memory/memory-manager.ts", memoryManagement)
  - Write("src/memory/context-window.ts", contextHandling)
  - Write("src/memory/message-history.ts", conversationHistory)

  // API endpoints
  - Write("src/routes/memory.routes.ts", memoryEndpoints)
  - Write("src/routes/context.routes.ts", contextEndpoints)
  - Write("src/routes/conversation.routes.ts", conversationRoutes)

  // Vector search integration
  - Write("src/integrations/ruvector.integration.ts", vectorSearch)
  - Write("src/search/semantic-search.ts", semanticQueryEngine)

  // Middleware and utilities
  - Write("src/middleware/memory.middleware.ts", memoryMiddleware)
  - Write("src/utils/embedding.utils.ts", embeddingFunctions)

  // Tests
  - Write("tests/letta-memory.test.ts", memoryTests)
  - Bash("pnpm test")
```

### Memory Architecture Rules
**CRITICAL**: Every memory operation MUST follow Letta's hybrid memory model:

- **Core Memory**: Fixed agent identity, goals, and constraints (system context)
- **Archival Memory**: Long-term knowledge base with semantic search (HNSW indexed)
- **Recall Memory**: Short-term conversation buffer for immediate context
- **EDH (External Decision History)**: Decisions and outcomes for reasoning
- **Vector Embeddings**: All memories stored with semantic embeddings for 150x+ faster search
- **Session Persistence**: Memory persists across conversations
- **Memory Consolidation**: Automatic compression of old memories
- **Context Limits**: 16K+ token context window with intelligent compression

## 📊 LETTA AGENT MEMORY ARCHITECTURE

### Multi-Tier Memory Model
```
┌─────────────────────────────────────────────────────────────────┐
│                    LETTA AGENT MEMORY SYSTEM                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ CORE MEMORY (Fixed)                                               │
│ ├─ Agent Identity: Name, role, personality                       │
│ ├─ System Prompt: Instructions and constraints                   │
│ ├─ Goals: Primary objectives and success criteria                │
│ └─ Knowledge Base Pointer: Link to archival store                │
│                                                                   │
│ ARCHIVAL MEMORY (Long-term, Searchable)                          │
│ ├─ Documents: Embedded with vector embeddings                    │
│ ├─ Facts: Semantic entities extracted from conversations         │
│ ├─ Rules: Business rules and constraints                         │
│ ├─ Interactions: Previous conversation summaries                 │
│ └─ ruvector Indexes: HNSW vector search (150x faster)             │
│                                                                   │
│ RECALL MEMORY (Short-term, Working Context)                      │
│ ├─ Message Buffer: Recent conversation history (sliding window)  │
│ ├─ Last-Used: Most relevant memories for current task            │
│ └─ Attention: Focus tokens for important context                 │
│                                                                   │
│ EDH - EXTERNAL DECISION HISTORY                                  │
│ ├─ Decisions: Actions taken with reasoning                       │
│ ├─ Outcomes: Results and consequences                            │
│ ├─ Feedback: User corrections and preferences                    │
│ └─ Patterns: Learned optimal approaches                          │
│                                                                   │
│ CONTEXT MANAGEMENT (Dynamic)                                     │
│ ├─ Token Counter: Track context usage                            │
│ ├─ Compression: Summarize old memories when approaching limit    │
│ ├─ Eviction: Remove low-relevance items                          │
│ └─ Prioritization: Keep high-value memories                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Memory Search Pipeline
```
Query Input
    ↓
Vector Embedding (same model as archival memories)
    ↓
HNSW Index Search (ruvector) - O(log N) complexity
    ↓
Semantic Relevance Scoring (cosine similarity)
    ↓
Reranking (LLM-based context relevance)
    ↓
Context Assembly (with surrounding tokens)
    ↓
Compression if Needed (abstractive summarization)
    ↓
Memory Response (top-K results with confidence scores)
```

## 🐝 LETTA INTEGRATION SWARM

### Agent Configuration
```yaml
topology: hierarchical  # Coordinator for memory consistency
maxAgents: 6
strategy: specialized
language: typescript
framework: express + letta-sdk

agents:
  memory_architect:
    role: Memory System Design
    focus: [letta-integration, archival-structure, recall-management]
    responsibilities:
      - Design memory tier architecture
      - Configure archival storage
      - Implement recall buffers
      - Setup vector embeddings

  context_manager:
    role: Context & Session Management
    focus: [session-persistence, context-windows, token-management]
    responsibilities:
      - Manage conversation sessions
      - Handle context window limits
      - Implement memory compression
      - Track token usage

  vector_search_engineer:
    role: Semantic Search & Indexing
    focus: [ruvector-integration, hnsw-indexing, embedding-generation]
    responsibilities:
      - Implement HNSW indexing
      - Create embedding pipeline
      - Optimize search queries
      - Handle semantic reranking

  decision_historian:
    role: EDH & Decision Tracking
    focus: [decision-logging, outcome-tracking, pattern-learning]
    responsibilities:
      - Record decisions and reasoning
      - Track outcomes and feedback
      - Extract learned patterns
      - Build decision index

  memory_consolidator:
    role: Memory Optimization & Compression
    focus: [consolidation, compression, memory-eviction]
    responsibilities:
      - Consolidate related memories
      - Summarize old conversations
      - Implement memory eviction policies
      - Optimize storage efficiency

  integration_specialist:
    role: Letta API Integration
    focus: [letta-sdk, api-wrappers, error-handling]
    responsibilities:
      - Wrap Letta SDK calls
      - Handle authentication
      - Implement retry logic
      - Error recovery

  test_engineer:
    role: Memory Testing & Validation
    focus: [jest, memory-persistence, search-accuracy]
    responsibilities:
      - Test memory operations
      - Validate search results
      - Memory stress testing
      - Integration testing
```

## 🔧 TYPESCRIPT + LETTA PATTERNS

### Letta Client Wrapper
```typescript
import { LettaClient } from 'letta-js';
import { ruvector } from 'ruvector';
import { Logger } from '../utils/logger';

interface MemoryConfig {
  maxTokens: number;
  archivalStorageSize: number;
  recallBufferSize: number;
  embeddingModel: string;
}

interface Memory {
  id: string;
  type: 'core' | 'archival' | 'recall' | 'edh';
  content: string;
  embedding?: number[];
  timestamp: Date;
  relevanceScore?: number;
}

export class LettaMemoryService {
  private lettaClient: LettaClient;
  private vectorDB: ruvector;
  private logger: Logger;
  private config: MemoryConfig;

  constructor(
    lettaToken: string,
    vectorDBPath: string,
    config: MemoryConfig
  ) {
    this.lettaClient = new LettaClient({ token: lettaToken });
    this.vectorDB = new ruvector({ path: vectorDBPath });
    this.config = config;
    this.logger = new Logger('LettaMemoryService');
  }

  /**
   * Initialize a new agent with memory configuration
   */
  async createAgent(agentConfig: {
    name: string;
    systemPrompt: string;
    goals: string[];
    knowledge?: string[];
  }): Promise<string> {
    try {
      const agent = await this.lettaClient.createAgent({
        agent_name: agentConfig.name,
        system_prompt: agentConfig.systemPrompt,
        tools: this.getDefaultTools(),
        memory_config: {
          max_tokens: this.config.maxTokens,
          archival: {
            enabled: true,
            storage_size: this.config.archivalStorageSize
          },
          recall: {
            buffer_size: this.config.recallBufferSize
          }
        }
      });

      // Store knowledge in archival memory
      if (agentConfig.knowledge) {
        for (const doc of agentConfig.knowledge) {
          await this.addArchivalMemory(agent.agent_id, doc);
        }
      }

      this.logger.info(`Agent created: ${agent.agent_id}`);
      return agent.agent_id;

    } catch (error) {
      this.logger.error('Failed to create agent', error);
      throw error;
    }
  }

  /**
   * Add memory to archival store with semantic embeddings
   */
  async addArchivalMemory(
    agentId: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    try {
      // Generate embedding for semantic search
      const embedding = await this.generateEmbedding(content);

      // Store in Letta
      const memory = await this.lettaClient.addMemory({
        agent_id: agentId,
        type: 'archival',
        content: content,
        metadata: metadata
      });

      // Index in ruvector for faster search
      await this.vectorDB.add({
        id: memory.memory_id,
        text: content,
        embedding: embedding,
        metadata: {
          agent_id: agentId,
          type: 'archival',
          created_at: new Date().toISOString(),
          ...metadata
        }
      });

      this.logger.info(`Memory added: ${memory.memory_id}`);
      return memory.memory_id;

    } catch (error) {
      this.logger.error('Failed to add archival memory', error);
      throw error;
    }
  }

  /**
   * Search archival memory using semantic search with HNSW indexing
   */
  async searchMemory(
    agentId: string,
    query: string,
    topK: number = 5
  ): Promise<Memory[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Search in ruvector (HNSW - 150x+ faster)
      const results = await this.vectorDB.search({
        embedding: queryEmbedding,
        limit: topK,
        filter: { agent_id: agentId, type: 'archival' }
      });

      // Format results with relevance scores
      const memories: Memory[] = results.map(result => ({
        id: result.id,
        type: 'archival',
        content: result.text,
        embedding: result.embedding,
        timestamp: new Date(result.metadata.created_at),
        relevanceScore: result.score
      }));

      this.logger.debug(`Search found ${memories.length} relevant memories`);
      return memories;

    } catch (error) {
      this.logger.error('Memory search failed', error);
      throw error;
    }
  }

  /**
   * Get current context window for agent
   */
  async getContext(
    agentId: string,
    includeArchival: boolean = true
  ): Promise<{
    coreMemory: string;
    recallMemory: string[];
    archivalSummary: string;
    tokenUsage: { used: number; limit: number };
  }> {
    try {
      const agentState = await this.lettaClient.getAgentState(agentId);

      let archivalSummary = '';
      if (includeArchival) {
        const topMemories = await this.searchMemory(
          agentId,
          agentState.last_message_text,
          3
        );
        archivalSummary = topMemories
          .map(m => m.content)
          .join('\n---\n');
      }

      return {
        coreMemory: agentState.core_memory,
        recallMemory: agentState.recall_memory,
        archivalSummary,
        tokenUsage: {
          used: agentState.token_usage,
          limit: this.config.maxTokens
        }
      };

    } catch (error) {
      this.logger.error('Failed to get context', error);
      throw error;
    }
  }

  /**
   * Store decision with outcome tracking (EDH)
   */
  async recordDecision(
    agentId: string,
    decision: {
      action: string;
      reasoning: string;
      timestamp?: Date;
    },
    outcome?: {
      result: string;
      feedback?: string;
      success: boolean;
    }
  ): Promise<void> {
    try {
      const decision_record = {
        decision: decision.action,
        reasoning: decision.reasoning,
        timestamp: decision.timestamp || new Date(),
        outcome: outcome || { result: 'pending', success: null }
      };

      // Store as EDH memory
      await this.addArchivalMemory(
        agentId,
        JSON.stringify(decision_record),
        { type: 'decision_history' }
      );

      this.logger.info(`Decision recorded for agent ${agentId}`);

    } catch (error) {
      this.logger.error('Failed to record decision', error);
      throw error;
    }
  }

  /**
   * Compress old memories when approaching token limit
   */
  async compressMemories(agentId: string): Promise<void> {
    try {
      const context = await this.getContext(agentId);
      const usageRatio = context.tokenUsage.used / context.tokenUsage.limit;

      if (usageRatio > 0.8) {
        this.logger.info(`Compressing memories for ${agentId} (${(usageRatio * 100).toFixed(1)}% usage)`);

        // Get oldest memories
        const oldMemories = await this.vectorDB.query(
          `SELECT * FROM memories WHERE agent_id = $1 ORDER BY created_at ASC LIMIT 10`,
          [agentId]
        );

        // Summarize and replace with compressed version
        for (const memory of oldMemories) {
          // This would use an LLM to summarize
          await this.summarizeAndCompress(agentId, memory);
        }
      }

    } catch (error) {
      this.logger.error('Memory compression failed', error);
      throw error;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // Implementation depends on embedding provider
    // Using Anthropic Claude embeddings or similar
    const response = await fetch('https://api.anthropic.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.embeddingModel,
        input: text
      })
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async summarizeAndCompress(agentId: string, memory: Memory): Promise<void> {
    // Implementation would use LLM to create concise summary
    // Replace original memory with compressed version
    this.logger.debug(`Compressing memory ${memory.id}`);
  }

  private getDefaultTools() {
    return [
      {
        type: 'core_memory_append',
        description: 'Append to core memory'
      },
      {
        type: 'archival_memory_search',
        description: 'Search archival memory'
      },
      {
        type: 'archival_memory_insert',
        description: 'Insert into archival memory'
      },
      {
        type: 'recall_memory_search',
        description: 'Search recall memory'
      }
    ];
  }
}
```

### REST API Endpoints for Memory Operations
```typescript
import express, { Request, Response } from 'express';
import { LettaMemoryService } from '../services/letta-memory.service';

const router = express.Router();
const memoryService = new LettaMemoryService(
  process.env.LETTA_API_TOKEN!,
  process.env.VECTOR_DB_PATH!,
  {
    maxTokens: 16000,
    archivalStorageSize: 1000000,
    recallBufferSize: 4000,
    embeddingModel: 'claude-embedding'
  }
);

/**
 * POST /api/memory/agents
 * Create a new agent with memory
 */
router.post('/agents', async (req: Request, res: Response) => {
  try {
    const { name, systemPrompt, goals, knowledge } = req.body;

    const agentId = await memoryService.createAgent({
      name,
      systemPrompt,
      goals,
      knowledge
    });

    res.status(201).json({ agentId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * POST /api/memory/agents/:agentId/memories
 * Add memory to agent
 */
router.post('/agents/:agentId/memories', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { content, metadata, type } = req.body;

    if (type === 'archival') {
      const memoryId = await memoryService.addArchivalMemory(
        agentId,
        content,
        metadata
      );
      res.status(201).json({ memoryId });
    } else {
      res.status(400).json({ error: 'Invalid memory type' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add memory' });
  }
});

/**
 * POST /api/memory/agents/:agentId/search
 * Search agent's memory using semantic search
 */
router.post('/agents/:agentId/search', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { query, topK = 5 } = req.body;

    const results = await memoryService.searchMemory(agentId, query, topK);

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
 * GET /api/memory/agents/:agentId/context
 * Get current context for agent
 */
router.get('/agents/:agentId/context', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const context = await memoryService.getContext(agentId);

    res.status(200).json(context);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get context' });
  }
});

/**
 * POST /api/memory/agents/:agentId/decisions
 * Record a decision with outcome tracking
 */
router.post('/agents/:agentId/decisions', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const { decision, outcome } = req.body;

    await memoryService.recordDecision(agentId, decision, outcome);

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

export default router;
```

## 📊 MEMORY SERVICE ARCHITECTURE

### Letta Integration Flow
```
Agent Query
    ↓
Extract Intent + Context
    ↓
Search Relevant Memories (HNSW)
    ↓
Assemble Context Window
    ↓
Call LLM with Full Context
    ↓
Process Response + Update Memory
    ↓
Store Decision in EDH
    ↓
Return Result + Update Recall
```

## 🔒 SECURITY & COMPLIANCE

### Memory Security
- All memories encrypted at rest (AES-256)
- Secure token management for Letta API
- Access control per agent
- Audit logging for memory operations
- GDPR-compliant data retention policies

## 📈 PERFORMANCE TARGETS

### Memory Performance
- Memory search: < 50ms p95 (HNSW indexed)
- Context assembly: < 100ms p95
- Memory compression: < 5 minutes for full cycle
- Vector embedding generation: < 200ms per item
- Agent creation: < 1 second
- Session persistence: < 10ms read/write

### Vector Search Optimization (ruvector + HNSW)
- Search complexity: O(log N) vs O(N) linear
- Performance improvement: 150x-12,500x faster
- Memory overhead: +10-20% for index
- Build time: <100ms for 1M embeddings

## 🧪 TESTING REQUIREMENTS

```typescript
import request from 'supertest';
import app from '../app';

describe('Letta Memory Service', () => {
  describe('POST /api/memory/agents', () => {
    it('should create new agent with memory', async () => {
      const response = await request(app)
        .post('/api/memory/agents')
        .send({
          name: 'MortgageAssistant',
          systemPrompt: 'You are a mortgage specialist...',
          goals: ['Assist with quotes', 'Answer questions'],
          knowledge: ['Mortgage rates and terms...']
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('agentId');
    });
  });

  describe('POST /api/memory/agents/:agentId/search', () => {
    it('should search memories semantically', async () => {
      const response = await request(app)
        .post(`/api/memory/agents/${agentId}/search`)
        .send({ query: 'mortgage interest rates', topK: 5 });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeLessThanOrEqual(5);
    });
  });
});
```

---

**This service provides persistent, searchable agent memory enabling long-term context management and continuous learning across conversations.**
