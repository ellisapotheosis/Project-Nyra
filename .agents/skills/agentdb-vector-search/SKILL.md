---
name: "ruvector Vector Search"
description: "Implement semantic vector search with ruvector for intelligent document retrieval, similarity matching, and context-aware querying. Use when building RAG systems, semantic search engines, or intelligent knowledge bases."
---

# ruvector Vector Search

## What This Skill Does

Implements vector-based semantic search using ruvector's high-performance vector database with **150x-12,500x faster** operations than traditional solutions. Features HNSW indexing, quantization, and sub-millisecond search (<100µs).

## Prerequisites

- Node.js 18+
- ruvector v1.0.7+ (via archon-os or standalone)
- OpenAI API key (for embeddings) or custom embedding model

## Quick Start with CLI

### Initialize Vector Database

```bash
# Initialize with default dimensions (1536 for OpenAI ada-002)
npx ruvector@latest init ./vectors.db

# Custom dimensions for different embedding models
npx ruvector@latest init ./vectors.db --dimension 768  # sentence-transformers
npx ruvector@latest init ./vectors.db --dimension 384  # all-MiniLM-L6-v2

# Use preset configurations
npx ruvector@latest init ./vectors.db --preset small   # <10K vectors
npx ruvector@latest init ./vectors.db --preset medium  # 10K-100K vectors
npx ruvector@latest init ./vectors.db --preset large   # >100K vectors

# In-memory database for testing
npx ruvector@latest init ./vectors.db --in-memory
```

### Query Vector Database

```bash
# Basic similarity search
npx ruvector@latest query ./vectors.db "[0.1,0.2,0.3,...]"

# Top-k results
npx ruvector@latest query ./vectors.db "[0.1,0.2,0.3]" -k 10

# With similarity threshold (cosine similarity)
npx ruvector@latest query ./vectors.db "0.1 0.2 0.3" -t 0.75 -m cosine

# Different distance metrics
npx ruvector@latest query ./vectors.db "[...]" -m euclidean  # L2 distance
npx ruvector@latest query ./vectors.db "[...]" -m dot        # Dot product

# JSON output for automation
npx ruvector@latest query ./vectors.db "[...]" -f json -k 5

# Verbose output with distances
npx ruvector@latest query ./vectors.db "[...]" -v
```

### Import/Export Vectors

```bash
# Export vectors to JSON
npx ruvector@latest export ./vectors.db ./backup.json

# Import vectors from JSON
npx ruvector@latest import ./backup.json

# Get database statistics
npx ruvector@latest stats ./vectors.db
```

## Quick Start with API

```typescript
import { createruvectorAdapter, computeEmbedding } from 'archon-os/reasoningbank';

// Initialize with vector search optimizations
const adapter = await createruvectorAdapter({
  dbPath: '.ruvector/vectors.db',
  enableLearning: false,       // Vector search only
  enableReasoning: true,       // Enable semantic matching
  quantizationType: 'binary',  // 32x memory reduction
  cacheSize: 1000,             // Fast retrieval
});

// Store document with embedding
const text = "The quantum computer achieved 100 qubits";
const embedding = await computeEmbedding(text);

await adapter.insertPattern({
  id: '',
  type: 'document',
  domain: 'technology',
  pattern_data: JSON.stringify({
    embedding,
    text,
    metadata: { category: "quantum", date: "2025-01-15" }
  }),
  confidence: 1.0,
  usage_count: 0,
  success_count: 0,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Semantic search with MMR (Maximal Marginal Relevance)
const queryEmbedding = await computeEmbedding("quantum computing advances");
const results = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'technology',
  k: 10,
  useMMR: true,              // Diverse results
  synthesizeContext: true,    // Rich context
});
```

## Core Features

### 1. Vector Storage
```typescript
// Store with automatic embedding
await db.storeWithEmbedding({
  content: "Your document text",
  metadata: { source: "docs", page: 42 }
});
```

### 2. Similarity Search
```typescript
// Find similar documents
const similar = await db.findSimilar("quantum computing", {
  limit: 5,
  minScore: 0.75
});
```

### 3. Hybrid Search (Vector + Metadata)
```typescript
// Combine vector similarity with metadata filtering
const results = await db.hybridSearch({
  query: "machine learning models",
  filters: {
    category: "research",
    date: { $gte: "2024-01-01" }
  },
  limit: 20
});
```

## Advanced Usage

### RAG (Retrieval Augmented Generation)
```typescript
// Build RAG pipeline
async function ragQuery(question: string) {
  // 1. Get relevant context
  const context = await db.searchSimilar(
    await embed(question),
    { limit: 5, threshold: 0.7 }
  );

  // 2. Generate answer with context
  const prompt = `Context: ${context.map(c => c.text).join('\n')}
Question: ${question}`;

  return await llm.generate(prompt);
}
```

### Batch Operations
```typescript
// Efficient batch storage
await db.batchStore(documents.map(doc => ({
  text: doc.content,
  embedding: doc.vector,
  metadata: doc.meta
})));
```

## MCP Server Integration

```bash
# Start ruvector MCP server for Codex
npx ruvector@latest mcp

# Add to Codex (one-time setup)
Codex mcp add ruvector npx ruvector@latest mcp

# Now use MCP tools in Codex:
# - ruvector_query: Semantic vector search
# - ruvector_store: Store documents with embeddings
# - ruvector_stats: Database statistics
```

## Performance Benchmarks

```bash
# Run comprehensive benchmarks
npx ruvector@latest benchmark

# Results:
# ✅ Pattern Search: 150x faster (100µs vs 15ms)
# ✅ Batch Insert: 500x faster (2ms vs 1s for 100 vectors)
# ✅ Large-scale Query: 12,500x faster (8ms vs 100s at 1M vectors)
# ✅ Memory Efficiency: 4-32x reduction with quantization
```

## Quantization Options

ruvector provides multiple quantization strategies for memory efficiency:

### Binary Quantization (32x reduction)
```typescript
const adapter = await createruvectorAdapter({
  quantizationType: 'binary',  // 768-dim → 96 bytes
});
```

### Scalar Quantization (4x reduction)
```typescript
const adapter = await createruvectorAdapter({
  quantizationType: 'scalar',  // 768-dim → 768 bytes
});
```

### Product Quantization (8-16x reduction)
```typescript
const adapter = await createruvectorAdapter({
  quantizationType: 'product',  // 768-dim → 48-96 bytes
});
```

## Distance Metrics

```bash
# Cosine similarity (default, best for most use cases)
npx ruvector@latest query ./db.sqlite "[...]" -m cosine

# Euclidean distance (L2 norm)
npx ruvector@latest query ./db.sqlite "[...]" -m euclidean

# Dot product (for normalized vectors)
npx ruvector@latest query ./db.sqlite "[...]" -m dot
```

## Advanced Features

### HNSW Indexing
- **O(log n) search complexity**
- **Sub-millisecond retrieval** (<100µs)
- **Automatic index building**

### Caching
- **1000 pattern in-memory cache**
- **<1ms pattern retrieval**
- **Automatic cache invalidation**

### MMR (Maximal Marginal Relevance)
- **Diverse result sets**
- **Avoid redundancy**
- **Balance relevance and diversity**

## Performance Tips

1. **Enable HNSW indexing**: Automatic with ruvector, 10-100x faster
2. **Use quantization**: Binary (32x), Scalar (4x), Product (8-16x) memory reduction
3. **Batch operations**: 500x faster for bulk inserts
4. **Match dimensions**: 1536 (OpenAI), 768 (sentence-transformers), 384 (MiniLM)
5. **Similarity threshold**: Start at 0.7 for quality, adjust based on use case
6. **Enable caching**: 1000 pattern cache for frequent queries

## Troubleshooting

### Issue: Slow search performance
```bash
# Check if HNSW indexing is enabled (automatic)
npx ruvector@latest stats ./vectors.db

# Expected: <100µs search time
```

### Issue: High memory usage
```bash
# Enable binary quantization (32x reduction)
# Use in adapter: quantizationType: 'binary'
```

### Issue: Poor relevance
```bash
# Adjust similarity threshold
npx ruvector@latest query ./db.sqlite "[...]" -t 0.8  # Higher threshold

# Or use MMR for diverse results
# Use in adapter: useMMR: true
```

### Issue: Wrong dimensions
```bash
# Check embedding model dimensions:
# - OpenAI ada-002: 1536
# - sentence-transformers: 768
# - all-MiniLM-L6-v2: 384

npx ruvector@latest init ./db.sqlite --dimension 768
```

## Database Statistics

```bash
# Get comprehensive stats
npx ruvector@latest stats ./vectors.db

# Shows:
# - Total patterns/vectors
# - Database size
# - Average confidence
# - Domains distribution
# - Index status
```

## Performance Characteristics

- **Vector Search**: <100µs (HNSW indexing)
- **Pattern Retrieval**: <1ms (with cache)
- **Batch Insert**: 2ms for 100 vectors
- **Memory Efficiency**: 4-32x reduction with quantization
- **Scalability**: Handles 1M+ vectors efficiently
- **Latency**: Sub-millisecond for most operations

## Learn More

- GitHub: https://github.com/ruvnet/archon-os/tree/main/packages/ruvector
- Documentation: node_modules/archon-os/docs/ruvector_INTEGRATION.md
- MCP Integration: `npx ruvector@latest mcp` for Codex
- Website: https://ruvector.ruv.io
- CLI Help: `npx ruvector@latest --help`
- Command Help: `npx ruvector@latest help <command>`
