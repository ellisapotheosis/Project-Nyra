# RuVector Environment Variables Research Summary

**Date**: 2026-01-18
**Research Type**: Comprehensive RuVector Configuration Analysis
**Namespace**: containerization
**Key**: ruvector-env

## RESEARCH OBJECTIVE
Research all RuVector environment variables from the Project Nyra codebase and create a comprehensive reference with descriptions, optimal values, and configuration guidance.

## RESEARCH SCOPE COMPLETED
1. ✅ Search .env files mentioning RuVector
2. ✅ Find .env.master and other environment templates
3. ✅ Locate ruvector service configuration
4. ✅ Find all RUVECTOR_* environment variable references
5. ✅ Document HNSW configuration variables
6. ✅ Find embedding provider configurations
7. ✅ Locate consensus and distributed mode settings
8. ✅ Find backup and storage path configurations

## SOURCES IDENTIFIED

### Primary Configuration Files
1. **/.env.master** (570 lines)
   - Lines 43-82: RuVector core configuration
   - Contains production-ready settings
   - 21 environment variables documented

2. **/configs/env/ruvector.env** (447 lines)
   - Dedicated RuVector configuration file
   - Most comprehensive reference
   - 130+ variables across 24 categories
   - Complete clustering, persistence, and tuning parameters

3. **/.env.master.template** (1107 lines)
   - Lines 200-356: RuVector memory systems section
   - 450+ total environment variables
   - Includes comprehensive descriptions and value ranges
   - Covers all RuVector subsystems

4. **/.env.orchestrator-mini** (217 lines)
   - Lines 68-103: PC1 orchestrator-specific config
   - Optimized for 16GB RAM Ryzen 7 3700X
   - Resource-constrained environment
   - 36 RuVector variables for orchestrator role

5. **/.env.optimal** (362 lines)
   - Lines 101-113: Production-optimized values
   - Performance-tuned for 4-PC setup
   - Recommended starting point
   - 13 key RuVector variables

## RUVECTOR ENVIRONMENT VARIABLES IDENTIFIED

### Total Count: 130+ variables across 24 categories

### Key Variables by Category

#### Core Configuration (4)
- RUVECTOR_ENABLED: true/false
- RUVECTOR_MODE: distributed|standalone|cluster
- RUVECTOR_NODE_ID: hostname-based
- RUVECTOR_NODE_ROLE: coordinator|worker|hybrid

#### Consensus & Clustering (13)
- RUVECTOR_CONSENSUS_PROTOCOL: raft (RECOMMENDED)
- RUVECTOR_CONSENSUS_PEERS: 3 GPU workers via Tailscale
- RUVECTOR_CONSENSUS_QUORUM: 2 (tolerates 1 failure)
- RUVECTOR_RAFT_ELECTION_TIMEOUT_MS: 1500
- RUVECTOR_RAFT_HEARTBEAT_INTERVAL_MS: 500
- And 8 more consensus/discovery variables

#### HNSW Index (150x-12,500x Faster Search) (4)
- RUVECTOR_INDEX_TYPE: hnsw (RECOMMENDED)
- RUVECTOR_HNSW_M: 16 (balanced performance/memory)
- RUVECTOR_HNSW_EF_CONSTRUCTION: 200 (build quality)
- RUVECTOR_HNSW_EF_SEARCH: 100 (query quality)

#### Vector Configuration (3)
- RUVECTOR_VECTOR_DIM: 1536 (OpenAI text-embedding-3-small)
- RUVECTOR_DISTANCE_METRIC: cosine (RECOMMENDED)
- RUVECTOR_INDEX_TYPE: hnsw

#### Performance Tuning (16)
- Batch sizes: 1000 (general), 5000 (indexing), 100 (search)
- Connection pooling: max 100, min 10
- Thread configuration: auto-detect workers, 4 indexing, 8 search
- Cache: 2048 MB orchestrator, 4096+ MB workers
- Search caching: 10,000 queries, 300 sec TTL

#### Persistence & Backup (17)
- WAL: Enabled, fsync mode
- Snapshots: Every 3600 seconds, zstd compression
- Backups: Daily (86400 sec), 30-day retention
- Auto-recovery: Enabled with 4 parallel threads

#### Synchronization (9)
- Protocol: quic (low latency, RECOMMENDED)
- Interval: 1000ms
- Compression: zstd algorithm
- Delta sync: Enabled
- Conflict resolution: last_write_wins

#### Security (16)
- TLS: Disabled (should enable for production)
- Auth: Disabled (should enable for production)
- CORS: Enabled with "*" (restrict in production)
- Rate limiting: 1000 req/sec, 2000 burst
- JWT configuration: issuer=ruvector, audience=nyra

#### Monitoring (19)
- Metrics: Prometheus format, port 9090
- Logging: JSON format, INFO level
- Tracing: OpenTelemetry (disabled)
- Health checks: 3 endpoints enabled

## KEY FINDINGS

### 1. Architecture
- **Consensus**: Raft with 3-node distributed setup
- **Topology**: Hierarchical coordinator (PC1) + worker nodes (PC2-4)
- **Failover**: <2 seconds with automatic leader election
- **Replication**: Quorum=2 for 3-node fault tolerance

### 2. HNSW Performance (150x-12,500x Faster)
- M=16: Optimal link count per node
- efConstruction=200: Fast indexing with good quality
- efSearch=100: Balanced search speed/accuracy
- Cosine distance: Appropriate for OpenAI embeddings

### 3. Memory & Storage
- Vector size: ~1KB per vector (1536-dim)
- Index size: 100GB max per node
- Vector limit: 10M+ per index
- Mmap enabled for efficiency

### 4. Data Protection
- WAL fsync: Guaranteed durability
- Hourly snapshots: Fast recovery
- Daily backups: Long-term data safety
- Auto-recovery: Resilient to crashes

### 5. Network Synchronization
- QUIC protocol: Sub-100ms latency
- Delta sync: Bandwidth efficient
- Compression: zstd for all data
- Conflict resolution: Deterministic

## OPTIMAL VALUES FOR 4-PC PROJECT NYRA SETUP

### PC1 Orchestrator (Ryzen 7 3700X, 16GB)
```
RUVECTOR_MODE=distributed
RUVECTOR_NODE_ROLE=coordinator
RUVECTOR_CACHE_SIZE_MB=2048
RUVECTOR_MAX_MEMORY_GB=4
RUVECTOR_DOCKER_MEMORY_LIMIT=4G
RUVECTOR_DOCKER_CPU_LIMIT=2.0
```

### PC2-4 GPU Workers (3060/3090Ti/5090)
```
RUVECTOR_NODE_ROLE=worker
RUVECTOR_CACHE_SIZE_MB=4096
RUVECTOR_MAX_MEMORY_GB=12-16
RUVECTOR_DOCKER_MEMORY_LIMIT=8G-16G
RUVECTOR_SEARCH_THREADS=8-16
```

## PERFORMANCE EXPECTATIONS

- Search Latency: <100ms for millions of vectors
- Indexing Throughput: 10,000+ vectors/second
- Memory Per Vector: ~1KB (unquantized)
- Sync Latency: <100ms (QUIC)
- Speedup vs Linear: 150x-12,500x

## DELIVERABLES CREATED

1. **RUVECTOR-ENV-VARIABLES-REFERENCE.md** (4,500+ lines)
   - 130+ variables documented
   - All 24 categories covered
   - Default and optimal values
   - Usage guidance for each variable

2. **RUVECTOR-RESEARCH-SUMMARY.md** (This file)
   - Executive summary
   - Key findings
   - Optimal configuration
   - Performance characteristics

## INTEGRATION WITH PROJECT NYRA

RuVector works with:
- Letta (agent OS-like memory)
- Graphiti + FalkorDB (knowledge graphs)
- Mem0 + OpenMemory (user personalization)
- Qdrant (alternative vector DB)
- Redis (caching/coordination)
- Tailscale (mesh VPN)
- Prometheus (monitoring)

## STATUS

✅ Research Complete
✅ All sources identified and analyzed
✅ 130+ variables documented
✅ Optimal values determined
✅ Files created and ready for use

Next steps: Review, validate, and implement in production deployment.
