# Claude Code Configuration - RuVector Search Service

## Service Overview

**RuVector Search** is a high-performance vector search engine providing 150x-12,500x faster semantic similarity matching through HNSW (Hierarchical Navigable Small World) indexing. It powers semantic search, embedding similarity, and pattern matching across the Project Nyra ecosystem.

**Role**: High-performance vector search engine
**Port**: 6379 (Redis compatible), 9200 (HTTP API)
**Architecture**: HNSW-based distributed index
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Vector Indexing**
   - Index embeddings from multiple sources
   - HNSW algorithm for efficient similarity search
   - Support for 1M+ vectors with sub-millisecond latency
   - Batch indexing and real-time updates

2. **Semantic Search**
   - Similarity-based retrieval
   - Distance metric support: cosine, L2, dot product
   - Approximate nearest neighbor (ANN) search
   - Top-k and range queries

3. **Hybrid Search**
   - Combine semantic + keyword/BM25 search
   - Cross-modal search (text + images)
   - Ranking and re-ranking
   - Result fusion strategies

4. **Pattern Recognition**
   - Detect similar code patterns
   - Find similar documents/articles
   - Identify anomalies via distance metrics
   - Trajectory-based pattern matching

5. **Performance Optimization**
   - Quantization for memory efficiency
   - Caching frequently accessed vectors
   - Load balancing across replicas
   - Adaptive indexing based on query patterns

## Configuration

### Environment Variables

```bash
# Core Service
RUVECTOR_PORT=9200
RUVECTOR_REDIS_PORT=6379
RUVECTOR_HOST=0.0.0.0
RUVECTOR_ENV=production

# HNSW Index Configuration
RUVECTOR_HNSW_M=16                    # Max neighbors per node
RUVECTOR_HNSW_EF=200                  # Expansion factor for search
RUVECTOR_HNSW_EF_CONSTRUCTION=400     # Expansion factor for indexing
RUVECTOR_HNSW_MAX_VECTORS=1000000     # Max vectors to index

# Embedding Dimensions
RUVECTOR_EMBEDDING_DIM=1536           # Default embedding dimension
RUVECTOR_SUPPORT_DIMENSIONS=384,512,768,1024,1536,2048

# Quantization (for memory efficiency)
RUVECTOR_ENABLE_QUANTIZATION=true
RUVECTOR_QUANTIZATION_BITS=8          # 8-bit or 16-bit

# Distance Metrics
RUVECTOR_DEFAULT_METRIC=cosine
RUVECTOR_SUPPORT_METRICS=cosine,l2,dot,manhattan

# Caching
RUVECTOR_ENABLE_CACHE=true
RUVECTOR_CACHE_TYPE=redis
RUVECTOR_CACHE_TTL=3600
REDIS_URL=redis://redis:6379

# Persistence
RUVECTOR_PERSISTENCE_ENABLED=true
RUVECTOR_CHECKPOINT_INTERVAL=3600
RUVECTOR_BACKUP_PATH=/data/ruvector/backups

# Performance Tuning
RUVECTOR_NUM_THREADS=16
RUVECTOR_BATCH_SIZE=1000
RUVECTOR_PREFETCH_SIZE=100

# Monitoring
RUVECTOR_LOG_LEVEL=info
RUVECTOR_METRICS_ENABLED=true
RUVECTOR_SLOW_QUERY_THRESHOLD=1000    # ms
```

### Index Configuration

```yaml
indices:
  embeddings:
    type: hnsw
    dimension: 1536
    metric: cosine
    m: 16
    ef_construction: 400
    ef: 200
    quantization: int8
    capacity: 100000

  patterns:
    type: hnsw
    dimension: 768
    metric: cosine
    m: 8
    ef_construction: 200
    ef: 100
    capacity: 50000

  documents:
    type: hnsw
    dimension: 1024
    metric: l2
    m: 16
    ef_construction: 400
    ef: 200
    capacity: 500000

  knowledge_graph:
    type: hnsw
    dimension: 512
    metric: dot
    m: 12
    ef_construction: 300
    ef: 150
    capacity: 200000
```

## API Endpoints

### Vector Operations

```bash
# Index vector
POST /v1/vectors/index
{
  "index": "embeddings",
  "id": "vec-123",
  "vector": [0.1, 0.2, ..., 0.9],
  "metadata": {
    "type": "embedding",
    "source": "claude-opus-4.5",
    "timestamp": "2026-01-22T12:00:00Z"
  }
}

# Search similar vectors
POST /v1/search/semantic
{
  "index": "embeddings",
  "query": [0.1, 0.2, ..., 0.9],
  "k": 10,
  "metric": "cosine",
  "filters": {
    "type": "embedding"
  }
}

# Response
{
  "results": [
    {
      "id": "vec-456",
      "distance": 0.05,
      "score": 0.95,
      "metadata": {
        "type": "embedding",
        "source": "claude-opus-4.5"
      }
    }
  ],
  "query_time_ms": 2
}
```

### Hybrid Search

```bash
# Hybrid search (semantic + keyword)
POST /v1/search/hybrid
{
  "index": "documents",
  "query": "authentication patterns",
  "embedding": [0.1, 0.2, ..., 0.9],
  "k": 20,
  "semantic_weight": 0.7,
  "keyword_weight": 0.3
}

# Re-rank results
POST /v1/search/rerank
{
  "index": "documents",
  "query": "authentication patterns",
  "candidates": [
    {"id": "doc-1", "score": 0.8},
    {"id": "doc-2", "score": 0.7}
  ],
  "reranker_model": "bge-reranker-base"
}
```

### Batch Operations

```bash
# Batch index vectors
POST /v1/vectors/batch
{
  "index": "embeddings",
  "vectors": [
    {
      "id": "vec-1",
      "vector": [...],
      "metadata": {}
    }
  ]
}

# Batch search
POST /v1/search/batch
{
  "index": "embeddings",
  "queries": [
    {
      "query": [...],
      "k": 5
    }
  ]
}
```

### Index Management

```bash
# Create index
POST /v1/indices/create
{
  "name": "custom-embeddings",
  "dimension": 1024,
  "metric": "cosine",
  "hnsw_m": 16
}

# List indices
GET /v1/indices

# Index stats
GET /v1/indices/{name}/stats
# Returns: vector count, memory usage, search latency

# Delete vector
DELETE /v1/vectors/{id}

# Clear index
DELETE /v1/indices/{name}
```

### Health & Monitoring

```bash
GET /health              # Service health
GET /status              # Detailed status
GET /metrics             # Prometheus metrics
GET /performance         # Performance stats
```

## Architecture

### Request Processing Pipeline

```
Incoming Search Request
    ↓
[Parse Query] - Extract embedding/metadata
    ↓
[Validate] - Check index exists, dimensions match
    ↓
[Quantize] - Convert to quantized format if enabled
    ↓
[HNSW Search] - Hierarchical nearest neighbor search
    ├→ Level 0 (neighbors list)
    ├→ Level 1-L (hierarchical levels)
    └→ Refinement (verify top-k)
    ↓
[Distance Calculation] - Compute distances for results
    ↓
[Filtering] - Apply metadata filters
    ↓
[Reranking] - Optional ML-based reranking
    ↓
[Caching] - Store results in cache
    ↓
[Format Response] - Return with metadata
    ↓
Client Response
```

### HNSW Algorithm Details

```
Index Structure:
  Level L (top level)
    ├→ Few nodes (entry points)
    │
  Level L-1
    ├→ More nodes
    │
  Level 0 (bottom)
    └→ All nodes, full connectivity

Search Process:
  1. Start from Level L entry point
  2. Search neighbors using greedy algorithm
  3. Move to lower levels
  4. At Level 0, expand search with ef parameter
  5. Return top-k nearest neighbors
```

### Performance Characteristics

```
Configuration: M=16, ef=200
Vector Count  | Index Size | Search Time | QPS
100K          | 200 MB     | 0.5 ms      | 2000+
1M            | 2 GB       | 1.0 ms      | 1000+
10M           | 20 GB      | 2.5 ms      | 400+

With Quantization (8-bit):
100K          | 50 MB      | 0.3 ms      | 3000+
1M            | 500 MB     | 0.8 ms      | 1200+
10M           | 5 GB       | 2.0 ms      | 500+
```

## Deployment

### Docker Compose

```yaml
ruvector-search:
  image: project-nyra/ruvector-search:latest
  ports:
    - "9200:9200"      # HTTP API
    - "6379:6379"      # Redis compatibility
  environment:
    - RUVECTOR_PORT=9200
    - RUVECTOR_REDIS_PORT=6379
    - RUVECTOR_HNSW_M=16
    - RUVECTOR_HNSW_EF=200
    - RUVECTOR_ENABLE_QUANTIZATION=true
  volumes:
    - ruvector-data:/data/ruvector
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9200/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - nyra-network

volumes:
  ruvector-data:
```

### Kubernetes with StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: ruvector-search
spec:
  serviceName: ruvector-search
  replicas: 3
  selector:
    matchLabels:
      app: ruvector-search
  template:
    metadata:
      labels:
        app: ruvector-search
    spec:
      containers:
        - name: ruvector
          image: project-nyra/ruvector-search:latest
          ports:
            - containerPort: 9200
              name: http
            - containerPort: 6379
              name: redis
          env:
            - name: RUVECTOR_PORT
              value: "9200"
            - name: RUVECTOR_HNSW_M
              value: "16"
          resources:
            requests:
              cpu: 2000m
              memory: 4Gi
            limits:
              cpu: 4000m
              memory: 8Gi
          volumeMounts:
            - name: data
              mountPath: /data/ruvector
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 50Gi
```

## Monitoring

### Key Metrics

```
ruvector_vectors_indexed_total          # Total vectors indexed
ruvector_search_latency_seconds         # Search latency histogram
ruvector_search_requests_total          # Total search requests
ruvector_index_memory_bytes             # Memory used by index
ruvector_cache_hit_ratio                # Cache hit rate %
ruvector_qps_current                    # Queries per second
ruvector_distance_calculations_total    # Distance computations
```

### Health Checks

```bash
# Index status
GET /v1/indices/{name}/health

# Memory usage
GET /v1/status/memory

# Query performance
GET /v1/status/performance
```

## Performance Tuning

### Parameter Optimization

```
For fast search (1-2ms latency):
  M = 12-16
  ef = 100-200
  ef_construction = 200-400

For maximum recall (higher latency):
  M = 24-32
  ef = 500-1000
  ef_construction = 1000+

For memory efficiency:
  Enable 8-bit quantization
  M = 8-12
  ef = 50-100
```

### Batch Indexing Strategy

```bash
# For large datasets, use batch mode
POST /v1/vectors/batch?batch_size=10000

# Avoids individual indexing overhead
# Automatically creates checkpoints
# Much faster for 100K+ vectors
```

## Integration Points

### With LiteLLM Proxy
- Embeddings requests routed to RuVector
- Caches computed embeddings
- Result reranking support

### With letta Knowledge Graph
- Entity embeddings stored in RuVector
- Semantic relationship search
- Context enrichment queries

### With Nexus Router
- Receives semantic search requests
- Returns ranked results
- Metrics reported to gateway

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start service
npm run dev

# Run tests
npm run test

# Benchmark performance
npm run benchmark
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance

# Load testing
npm run test:load -- --qps 1000
```

## Performance Targets

| Metric | Target |
|--------|--------|
| P50 Latency | <1ms |
| P99 Latency | <5ms |
| QPS | 1000+ |
| Memory (per 100K vectors) | ~200MB |
| Recall@10 | >95% |
| Index Build Time | <100ms per 1K vectors |

## Security

### Access Control

```bash
# API key authentication
Authorization: Bearer {api-key}

# Rate limiting per API key
RUVECTOR_RATE_LIMIT_PER_KEY=100000
```

### Data Protection

- Vectors stored unencrypted in memory (performance)
- Encryption at rest for backups
- Isolation between indices/namespaces
- Audit logging for all operations

## Related Services

- **LiteLLM Proxy** - Embedding source
- **letta Knowledge** - Entity embeddings
- **Nexus Router** - Request routing
- **Redis** - Caching layer

## Resources

- Documentation: `./docs/`
- Configuration: `./config/`
- Examples: `./examples/`
- Tests: `./tests/`

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-01-22
**HNSW Algorithm**: Based on "Efficient and robust approximate nearest neighbor search"
