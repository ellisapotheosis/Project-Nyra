# RuVector Environment Variables - Complete Reference (2026-01-18)

## OVERVIEW
RuVector is an ultra-fast distributed vector search system using Rust-based performance optimizations and WebAssembly. It supports 150x-12,500x faster vector search than traditional systems through HNSW indexing, distributed consensus, and advanced synchronization.

## CORE CONFIGURATION

### Enablement & Mode
- **RUVECTOR_ENABLED**: true/false - Enable/disable RuVector service (Default: true)
- **RUVECTOR_MODE**: standalone|distributed|cluster - Operating mode (Default: distributed, Optimal: distributed)

### Node Configuration
- **RUVECTOR_NODE_ID**: ${HOSTNAME:-orchestrator} - Unique node identifier
- **RUVECTOR_NODE_NAME**: ${HOSTNAME:-orchestrator} - Friendly node name
- **RUVECTOR_NODE_ROLE**: coordinator|worker|hybrid - Node role (Default: coordinator on PC1)

### Network Binding
- **RUVECTOR_HOST**: 0.0.0.0 - Binding address (Default: 0.0.0.0)
- **RUVECTOR_PORT**: 7890 - gRPC service port (Default: 7890)
- **RUVECTOR_GRPC_PORT**: 7891 - Internal gRPC streaming port (Default: 7891)
- **RUVECTOR_ADMIN_PORT**: 7892 - Administrative interface port (Default: 7892)

## CONSENSUS & CLUSTERING

### Consensus Protocol
- **RUVECTOR_CONSENSUS_PROTOCOL**: raft|gossip|none - Protocol (Default: raft, Optimal: raft)
  - raft: Strong consistency, leader election (RECOMMENDED for production)
  - gossip: Eventual consistency, peer-to-peer
  - none: Single node mode

### Peer Discovery & Quorum
- **RUVECTOR_CONSENSUS_PEERS**: host1:port,host2:port,... - Peer addresses (Format: hostname:7890)
  - Example: worker-5090.tail-net.ts.net:7890,worker-3090.tail-net.ts.net:7890,worker-3060.tail-net.ts.net:7890

- **RUVECTOR_CONSENSUS_QUORUM**: 2 or 3 - Minimum consensus nodes (Default: 2, Optimal: 2)
  - For 3 nodes: quorum=2 (tolerates 1 failure)
  - For 4 nodes: quorum=3 (tolerates 1 failure)

### Raft Consensus Tuning
- **RUVECTOR_RAFT_ELECTION_TIMEOUT_MS**: 1500 - Leader election timeout (Default: 1500, Range: 1000-5000)
- **RUVECTOR_RAFT_HEARTBEAT_INTERVAL_MS**: 500 - Leader heartbeat interval (Default: 500)
- **RUVECTOR_RAFT_SNAPSHOT_INTERVAL**: 1000 - Log entries between snapshots (Default: 1000)
- **RUVECTOR_RAFT_LOG_COMPACTION_THRESHOLD**: 10000 - Compaction trigger (Default: 10000)

### Gossip Protocol Tuning (Alternative)
- **RUVECTOR_GOSSIP_INTERVAL_MS**: 1000 - Gossip interval (Default: 1000)
- **RUVECTOR_GOSSIP_FANOUT**: 3 - Gossip recipients per round (Default: 3, Range: 2-5)
- **RUVECTOR_GOSSIP_SUSPICION_TIMEOUT_MS**: 5000 - Node suspicion timeout (Default: 5000)

### Cluster Discovery
- **RUVECTOR_DISCOVERY_ENABLED**: true - Enable discovery (Default: true)
- **RUVECTOR_DISCOVERY_METHOD**: static|dns|consul|etcd - Discovery method (Default: static, Optimal: static)
- **RUVECTOR_DISCOVERY_INTERVAL_MS**: 30000 - Rediscovery interval (Default: 30000)

### Health Checking
- **RUVECTOR_HEALTH_CHECK_INTERVAL_MS**: 10000 - Check interval (Default: 10000)
- **RUVECTOR_HEALTH_CHECK_TIMEOUT_MS**: 5000 - Check timeout (Default: 5000)
- **RUVECTOR_HEALTH_CHECK_RETRIES**: 3 - Retries before marking unhealthy (Default: 3)

## VECTOR INDEX CONFIGURATION

### Vector Dimensions
- **RUVECTOR_VECTOR_DIM**: 1536 (RECOMMENDED) - Vector embedding dimensions
  - 1536: OpenAI text-embedding-3-small, text-embedding-ada-002 (RECOMMENDED)
  - 768: sentence-transformers/all-MiniLM-L6-v2
  - 384: sentence-transformers/all-MiniLM-L12-v2
  - Default: 1536 (Optimal: 1536 matches Project Nyra OpenAI model)

### Index Type
- **RUVECTOR_INDEX_TYPE**: hnsw|flat|ivfflat|pq - Index algorithm
  - hnsw: Hierarchical Navigable Small World (RECOMMENDED - 150x faster)
  - flat: Brute force (O(n) complexity)
  - ivfflat: Inverted file + flat compression
  - pq: Product Quantization (memory efficient)
  - Default: hnsw (Optimal: hnsw for production)

### Distance Metric
- **RUVECTOR_DISTANCE_METRIC**: cosine|euclidean|dot_product|manhattan - Distance metric
  - cosine: Best for normalized embeddings (RECOMMENDED)
  - euclidean: Good for non-normalized
  - dot_product: Fast, requires normalized
  - manhattan: Taxicab distance
  - Default: cosine (Optimal: cosine)

## HNSW INDEX PARAMETERS (Core Performance Settings)

### M Parameter (Graph Connectivity)
- **RUVECTOR_HNSW_M**: 16 (RECOMMENDED) - Bi-directional links per node
  - Range: 8-64
  - 8: Low memory, ~0.90 recall
  - 16: Balanced (RECOMMENDED)
  - 32: High recall ~0.98, more memory
  - 64: Maximum recall, highest memory
  - Default: 16 (Optimal: 16 - balances performance/memory)

### efConstruction Parameter (Build Quality)
- **RUVECTOR_HNSW_EF_CONSTRUCTION**: 200 (RECOMMENDED) - Candidate list during indexing
  - Range: 100-500
  - 100: Fast indexing, lower quality
  - 200: Balanced (RECOMMENDED)
  - 400: Slow indexing, high quality
  - 500: Very slow, maximum quality
  - Default: 200 (Optimal: 200 - fast build with good quality)

### efSearch Parameter (Query Quality)
- **RUVECTOR_HNSW_EF_SEARCH**: 100 (RECOMMENDED) - Candidate list during search
  - Range: 50-500
  - 50: Fast search ~0.90 recall
  - 100: Balanced (RECOMMENDED)
  - 200: Slower search ~0.98 recall
  - 500: Very slow, maximum recall
  - Default: 100 (Optimal: 100 - speed/accuracy balance)

### Max Layers & Level Multiplier
- **RUVECTOR_HNSW_MAX_LAYERS**: 5 - Maximum graph layers (Default: 5)
- **RUVECTOR_HNSW_LEVEL_MULTIPLIER**: 0.5 - Level generation multiplier (Default: 0.5, Range: 0.1-1.0)

## QUANTIZATION (MEMORY OPTIMIZATION)

### Quantization Control
- **RUVECTOR_QUANTIZATION_ENABLED**: false (by default) - Enable quantization
  - Default: false
  - Impact: 4-8x memory reduction when enabled
  - Optimal: false for initial setup

- **RUVECTOR_QUANTIZATION_TYPE**: scalar|product|binary - Quantization type
  - scalar: Scalar quantization (8-bit)
  - product: Product Quantization (PQ)
  - binary: Binary quantization (extreme compression)
  - Default: scalar

- **RUVECTOR_QUANTIZATION_BITS**: 8 - Bits per value (4 or 8)
  - 4-bit: 2x smaller, lower recall
  - 8-bit: 4x smaller, better recall (RECOMMENDED)
  - Default: 8

### Product Quantization (PQ) Parameters
- **RUVECTOR_PQ_SUBVECTORS**: 16 - PQ subvectors (Default: 16, Range: 8-32)
- **RUVECTOR_PQ_BITS_PER_SUBVECTOR**: 8 - Bits per PQ subvector (Default: 8)

### Quantization Quality
- **RUVECTOR_QUANTIZATION_RESCORE**: true - Rescore with full precision (Default: true)
- **RUVECTOR_QUANTIZATION_RESCORE_TOP_K**: 100 - Results to rescore (Default: 100)

## PERFORMANCE TUNING

### Batch Sizes
- **RUVECTOR_BATCH_SIZE**: 1000 - Default batch size (Default: 1000, Optimal: 1000)
- **RUVECTOR_INDEX_BATCH_SIZE**: 5000 - Indexing batch size (Default: 5000)
- **RUVECTOR_SEARCH_BATCH_SIZE**: 100 - Search batch size (Default: 100)

### Connection Pooling
- **RUVECTOR_MAX_CONNECTIONS**: 100 - Maximum client connections (Default: 100, Optimal: 100)
- **RUVECTOR_MIN_CONNECTIONS**: 10 - Minimum connections (Default: 10)
- **RUVECTOR_CONNECTION_TIMEOUT_MS**: 30000 - Connection timeout (Default: 30000)
- **RUVECTOR_CONNECTION_IDLE_TIMEOUT_MS**: 60000 - Idle timeout (Default: 60000)

### Thread Configuration
- **RUVECTOR_WORKER_THREADS**: 0 (auto-detect) - Worker thread pool (Default: 0 = auto)
- **RUVECTOR_INDEXING_THREADS**: 4 - Indexing threads (Default: 4)
- **RUVECTOR_SEARCH_THREADS**: 8 - Search threads (Default: 8, 2x indexing)

### Memory Management
- **RUVECTOR_CACHE_SIZE_MB**: 2048 - In-memory cache (Default: 2048/2GB)
  - Optimal: 2GB on orchestrator, 4GB+ on GPU workers
- **RUVECTOR_MMAP_ENABLED**: true - Memory-mapped I/O (Default: true, Optimal: true)
- **RUVECTOR_MMAP_PREFAULT**: false - Prefault pages (Default: false)
- **RUVECTOR_HUGE_PAGES_ENABLED**: false - Use huge pages (Default: false)

### Search Optimization
- **RUVECTOR_SEARCH_TIMEOUT_MS**: 5000 - Search timeout (Default: 5000)
- **RUVECTOR_PARALLEL_SEARCH**: true - Parallel search (Default: true)
- **RUVECTOR_SEARCH_CACHE_ENABLED**: true - Search caching (Default: true)
- **RUVECTOR_SEARCH_CACHE_SIZE**: 10000 - Cache size queries (Default: 10000)
- **RUVECTOR_SEARCH_CACHE_TTL_SEC**: 300 - Cache TTL (Default: 300/5 min)

### Index Optimization
- **RUVECTOR_AUTO_OPTIMIZE**: true - Auto optimization (Default: true)
- **RUVECTOR_OPTIMIZE_INTERVAL_SEC**: 3600 - Optimization interval (Default: 3600/1 hour)
- **RUVECTOR_OPTIMIZE_THRESHOLD**: 0.1 - Fragmentation threshold (Default: 0.1/10%)

## PERSISTENCE & BACKUP

### Data Directories
- **RUVECTOR_DATA_DIR**: /data/ruvector - Root data directory (Default: /data/ruvector)
- **RUVECTOR_INDEX_DIR**: /data/ruvector/indices - Index directory (Default: /data/ruvector/indices)
- **RUVECTOR_WAL_DIR**: /data/ruvector/wal - WAL directory (Default: /data/ruvector/wal)
- **RUVECTOR_SNAPSHOT_DIR**: /data/ruvector/snapshots - Snapshot directory (Default: /data/ruvector/snapshots)

### Write-Ahead Log (WAL)
- **RUVECTOR_WAL_ENABLED**: true - Enable WAL (Default: true, Optimal: true for production)
- **RUVECTOR_WAL_SYNC_MODE**: fsync|fdatasync|none - WAL sync mode
  - fsync: Full sync (safest, slowest)
  - fdatasync: Data sync only (balanced)
  - none: Async (fastest, less safe)
  - Default: fsync (Optimal: fsync)

- **RUVECTOR_WAL_SEGMENT_SIZE_MB**: 64 - WAL segment size (Default: 64)
- **RUVECTOR_WAL_MAX_SEGMENTS**: 100 - Max WAL segments (Default: 100)

### Snapshots
- **RUVECTOR_SNAPSHOT_ENABLED**: true - Enable snapshots (Default: true)
- **RUVECTOR_SNAPSHOT_INTERVAL_SEC**: 3600 - Snapshot interval (Default: 3600/1 hour, Optimal: 3600)
- **RUVECTOR_SNAPSHOT_RETENTION**: 5 - Retain N snapshots (Default: 5)
- **RUVECTOR_SNAPSHOT_COMPRESSION**: zstd|gzip|none|lz4 - Compression
  - zstd: Fast, good compression (RECOMMENDED)
  - gzip: Maximum compression, slower
  - lz4: Fast compression
  - none: No compression
  - Default: zstd (Optimal: zstd)

### Backup Configuration
- **RUVECTOR_BACKUP_ENABLED**: true - Enable backups (Default: true)
- **RUVECTOR_BACKUP_INTERVAL_SEC**: 86400 - Backup interval (Default: 86400/daily, Optimal: 86400)
- **RUVECTOR_BACKUP_RETENTION_DAYS**: 30 - Retention period (Default: 30)
- **RUVECTOR_BACKUP_DESTINATION**: /backups/ruvector - Backup directory (Default: /backups/ruvector)
- **RUVECTOR_BACKUP_COMPRESSION**: zstd|gzip|none|lz4 - Backup compression (Default: zstd)
- **RUVECTOR_BACKUP_REMOTE_ENABLED**: false - Enable cloud backup (Default: false)
- **RUVECTOR_BACKUP_REMOTE_S3_BUCKET**: (empty) - S3 bucket for backups
- **RUVECTOR_BACKUP_REMOTE_S3_PREFIX**: ruvector-backups/ - S3 prefix (Default: ruvector-backups/)

### Crash Recovery
- **RUVECTOR_AUTO_RECOVERY**: true - Auto recovery (Default: true)
- **RUVECTOR_RECOVERY_PARALLELISM**: 4 - Recovery threads (Default: 4)

## SYNCHRONIZATION

### Cross-Node Sync
- **RUVECTOR_SYNC_ENABLED**: true - Enable sync (Default: true)
- **RUVECTOR_SYNC_PROTOCOL**: raft|quic|tcp|websocket - Sync protocol
  - quic: Low latency, efficient (RECOMMENDED)
  - raft: Raft-based replication
  - tcp: Traditional reliable
  - websocket: Browser-compatible
  - Default: quic (Optimal: quic)

- **RUVECTOR_SYNC_INTERVAL_MS**: 1000 - Sync interval (Default: 1000/1 sec, Optimal: 1000)
- **RUVECTOR_SYNC_BATCH_SIZE**: 1000 - Sync batch size (Default: 1000)
- **RUVECTOR_SYNC_COMPRESSION**: true - Compress sync data (Default: true)
- **RUVECTOR_SYNC_COMPRESSION_ALGORITHM**: zstd - Compression (Default: zstd)

### Delta Synchronization
- **RUVECTOR_SYNC_DELTA_ENABLED**: true - Enable delta sync (Default: true)
- **RUVECTOR_SYNC_DELTA_WINDOW_SEC**: 300 - Delta window (Default: 300/5 min)

### Conflict Resolution
- **RUVECTOR_SYNC_CONFLICT_RESOLUTION**: last_write_wins|vector_clock|custom
  - last_write_wins: Simple, deterministic (RECOMMENDED)
  - vector_clock: Causality-aware
  - custom: Custom handler
  - Default: last_write_wins (Optimal: last_write_wins)

## NETWORKING & SECURITY

### TLS/SSL
- **RUVECTOR_TLS_ENABLED**: false - Enable TLS (Default: false, Production: should be true)
- **RUVECTOR_TLS_CERT_FILE**: /certs/ruvector.crt - TLS certificate path
- **RUVECTOR_TLS_KEY_FILE**: /certs/ruvector.key - Private key path
- **RUVECTOR_TLS_CA_FILE**: /certs/ca.crt - CA certificate path
- **RUVECTOR_TLS_VERIFY_CLIENT**: false - Verify client certs (Default: false)

### Authentication
- **RUVECTOR_AUTH_ENABLED**: false - Enable authentication (Default: false)
- **RUVECTOR_AUTH_TYPE**: token|jwt|mtls - Auth method (Default: token)
- **RUVECTOR_AUTH_TOKEN**: (env var) - Authentication token
- **RUVECTOR_JWT_SECRET**: (env var) - JWT signing secret
- **RUVECTOR_JWT_ISSUER**: ruvector - JWT issuer claim (Default: ruvector)
- **RUVECTOR_JWT_AUDIENCE**: nyra - JWT audience claim (Default: nyra)

### Rate Limiting
- **RUVECTOR_RATE_LIMIT_ENABLED**: true - Enable rate limiting (Default: true)
- **RUVECTOR_RATE_LIMIT_REQUESTS_PER_SEC**: 1000 - Rate limit (Default: 1000 req/sec)
- **RUVECTOR_RATE_LIMIT_BURST**: 2000 - Burst allowance (Default: 2000)

### CORS
- **RUVECTOR_CORS_ENABLED**: true - Enable CORS (Default: true)
- **RUVECTOR_CORS_ALLOWED_ORIGINS**: * - Allowed origins (Default: *, restrict in production)
- **RUVECTOR_CORS_ALLOWED_METHODS**: GET,POST,PUT,DELETE - Allowed methods
- **RUVECTOR_CORS_ALLOWED_HEADERS**: Content-Type,Authorization - Allowed headers

## MONITORING & OBSERVABILITY

### Metrics
- **RUVECTOR_METRICS_ENABLED**: true - Enable metrics (Default: true)
- **RUVECTOR_METRICS_PORT**: 9090 - Prometheus port (Default: 9090)
- **RUVECTOR_METRICS_FORMAT**: prometheus|json|influx - Format
  - prometheus: Prometheus format (RECOMMENDED)
  - json: JSON format
  - influx: InfluxDB format
  - Default: prometheus (Optimal: prometheus)

- **RUVECTOR_METRICS_INTERVAL_SEC**: 15 - Collection interval (Default: 15 sec)

### Logging
- **RUVECTOR_LOG_LEVEL**: trace|debug|info|warn|error - Log level (Default: info, Optimal: info)
- **RUVECTOR_LOG_FORMAT**: json|text|pretty - Log format
  - json: JSON (RECOMMENDED for parsing)
  - text: Text format
  - pretty: Pretty-printed
  - Default: json (Optimal: json)

- **RUVECTOR_LOG_FILE**: /var/log/ruvector/ruvector.log - Log file path
- **RUVECTOR_LOG_MAX_SIZE_MB**: 100 - Max file size (Default: 100)
- **RUVECTOR_LOG_MAX_BACKUPS**: 10 - Backup logs (Default: 10)
- **RUVECTOR_LOG_MAX_AGE_DAYS**: 30 - Retention (Default: 30)
- **RUVECTOR_LOG_COMPRESS**: true - Compress old logs (Default: true)

### Tracing (OpenTelemetry)
- **RUVECTOR_TRACING_ENABLED**: false - Enable tracing (Default: false)
- **RUVECTOR_TRACING_ENDPOINT**: http://jaeger:14268/api/traces - Jaeger endpoint
- **RUVECTOR_TRACING_SERVICE_NAME**: ruvector - Service name (Default: ruvector)
- **RUVECTOR_TRACING_SAMPLE_RATE**: 0.1 - Sampling rate (Default: 0.1/10%)

### Health Checks
- **RUVECTOR_HEALTH_CHECK_ENABLED**: true - Enable checks (Default: true)
- **RUVECTOR_HEALTH_CHECK_PATH**: /health - General health endpoint
- **RUVECTOR_LIVENESS_CHECK_PATH**: /live - Liveness probe endpoint
- **RUVECTOR_READINESS_CHECK_PATH**: /ready - Readiness probe endpoint

### Profiling
- **RUVECTOR_PROFILING_ENABLED**: false - Enable profiling (Default: false)
- **RUVECTOR_PROFILING_PORT**: 6060 - Profiling port (Default: 6060)
- **RUVECTOR_PROFILING_CPU**: false - CPU profiling (Default: false)
- **RUVECTOR_PROFILING_MEMORY**: false - Memory profiling (Default: false)

## INTEGRATION

### Redis Integration
- **RUVECTOR_REDIS_ENABLED**: true - Enable Redis (Default: true)
- **RUVECTOR_REDIS_URL**: redis://localhost:6379 - Redis URL (Default: redis://localhost:6379)
- **RUVECTOR_REDIS_PASSWORD**: (empty) - Redis password
- **RUVECTOR_REDIS_DB**: 0 - Redis database index (Default: 0)
- **RUVECTOR_REDIS_POOL_SIZE**: 10 - Connection pool (Default: 10)

### PostgreSQL Integration
- **RUVECTOR_POSTGRES_ENABLED**: false - Enable PostgreSQL (Default: false)
- **RUVECTOR_POSTGRES_URL**: postgresql://ruvector:ruvector@localhost:5432/ruvector - URL
- **RUVECTOR_POSTGRES_POOL_SIZE**: 20 - Connection pool (Default: 20)

### Embedding Service Integration
- **RUVECTOR_EMBEDDING_SERVICE_ENABLED**: false - Enable embeddings (Default: false)
- **RUVECTOR_EMBEDDING_SERVICE_URL**: http://localhost:8001 - Service URL
- **RUVECTOR_EMBEDDING_SERVICE_API_KEY**: (optional) - API key
- **RUVECTOR_EMBEDDING_MODEL**: text-embedding-3-small - Model (Default: text-embedding-3-small)
- **RUVECTOR_EMBEDDING_DIMENSIONS**: 1536 - Dimensions (Default: 1536)

## ADVANCED FEATURES

### Multi-Tenancy
- **RUVECTOR_MULTI_TENANT_ENABLED**: false - Enable multi-tenant (Default: false)
- **RUVECTOR_TENANT_ISOLATION**: namespace|index|cluster - Isolation strategy

### Filtering
- **RUVECTOR_FILTERING_ENABLED**: true - Enable filtering (Default: true)
- **RUVECTOR_FILTERING_INDEX_ENABLED**: true - Index filters (Default: true)

### Hybrid Search
- **RUVECTOR_HYBRID_SEARCH_ENABLED**: false - Enable hybrid (Default: false)
- **RUVECTOR_HYBRID_SEARCH_WEIGHTS**: 0.7,0.3 - Vector,keyword weights

### Semantic Caching
- **RUVECTOR_SEMANTIC_CACHE_ENABLED**: true - Enable caching (Default: true)
- **RUVECTOR_SEMANTIC_CACHE_SIMILARITY_THRESHOLD**: 0.95 - Threshold (Default: 0.95/95%)
- **RUVECTOR_SEMANTIC_CACHE_TTL_SEC**: 3600 - Cache TTL (Default: 3600/1 hour)

### SIMD Acceleration
- **RUVECTOR_ANN_ACCELERATION**: auto|avx2|avx512|neon|none - SIMD strategy
  - auto: Auto-detect (RECOMMENDED)
  - avx2: AVX2 instructions
  - avx512: AVX-512 instructions
  - neon: ARM NEON
  - none: No acceleration
  - Default: auto (Optimal: auto)

### WASM Support
- **RUVECTOR_WASM_ENABLED**: false - Enable WASM (Default: false)
- **RUVECTOR_WASM_BUILD_TARGET**: wasm32-unknown-unknown - Build target

## EXPERIMENTAL FEATURES

### GPU Acceleration
- **RUVECTOR_GPU_ENABLED**: false - Enable GPU (Default: false)
- **RUVECTOR_GPU_DEVICE**: 0 - GPU device index (Default: 0)
- **RUVECTOR_GPU_MEMORY_FRACTION**: 0.5 - GPU memory (Default: 0.5/50%)

### Neural Reranking
- **RUVECTOR_RERANKING_ENABLED**: false - Enable reranking (Default: false)
- **RUVECTOR_RERANKING_MODEL**: cross-encoder/ms-marco-MiniLM-L-6-v2 - Model
- **RUVECTOR_RERANKING_TOP_K**: 100 - Top-K for reranking (Default: 100)

### Incremental Indexing
- **RUVECTOR_INCREMENTAL_INDEXING**: true - Enable incremental (Default: true)
- **RUVECTOR_INCREMENTAL_INDEX_BUFFER_SIZE**: 10000 - Buffer size (Default: 10000)

### Dynamic Sharding
- **RUVECTOR_DYNAMIC_SHARDING**: false - Enable sharding (Default: false)
- **RUVECTOR_SHARD_COUNT**: 1 - Shard count (Default: 1)
- **RUVECTOR_SHARD_REPLICATION_FACTOR**: 2 - Replication factor (Default: 2)

## RESOURCE LIMITS

### Memory Constraints
- **RUVECTOR_MAX_MEMORY_GB**: 16 - Max memory (Default: 16)
- **RUVECTOR_MAX_INDEX_SIZE_GB**: 100 - Max index size (Default: 100)
- **RUVECTOR_MAX_VECTORS_PER_INDEX**: 10000000 - Max vectors (Default: 10M)

### Request Limits
- **RUVECTOR_MAX_BATCH_SIZE**: 10000 - Max batch (Default: 10000)
- **RUVECTOR_MAX_CONCURRENT_REQUESTS**: 1000 - Max concurrent (Default: 1000)
- **RUVECTOR_MAX_REQUEST_SIZE_MB**: 100 - Max size (Default: 100)

### Query Limits
- **RUVECTOR_MAX_QUERY_VECTORS**: 100 - Max per query (Default: 100)
- **RUVECTOR_MAX_RESULTS_PER_QUERY**: 1000 - Max results (Default: 1000)
- **RUVECTOR_QUERY_TIMEOUT_SEC**: 30 - Query timeout (Default: 30 sec)

## DEVELOPMENT & DEBUGGING

- **RUVECTOR_DEV_MODE**: false - Development mode (Default: false)
- **RUVECTOR_DEBUG_ENDPOINTS_ENABLED**: false - Debug endpoints (Default: false)
- **RUVECTOR_EXPERIMENTAL_FEATURES**: false - Experimental (Default: false)
- **RUVECTOR_PANIC_ON_ERROR**: false - Panic on error (Default: false)

## DOCKER SPECIFIC

### Resource Limits
- **RUVECTOR_DOCKER_CPU_LIMIT**: 2.0 - CPU limit (Default: 2.0 cores)
- **RUVECTOR_DOCKER_CPU_RESERVATION**: 1.0 - CPU reservation (Default: 1.0)
- **RUVECTOR_DOCKER_MEMORY_LIMIT**: 4G - Memory limit (Default: 4G)
- **RUVECTOR_DOCKER_MEMORY_RESERVATION**: 2G - Memory reservation (Default: 2G)

### Volumes
- **RUVECTOR_DOCKER_DATA_VOLUME**: ruvector_data - Data volume
- **RUVECTOR_DOCKER_LOGS_VOLUME**: ruvector_logs - Logs volume

### Networking
- **RUVECTOR_DOCKER_NETWORK**: nyra-network - Docker network (Default: nyra-network)
- **RUVECTOR_DOCKER_NETWORK_MODE**: bridge - Network mode (Default: bridge)

## OPTIMAL VALUES FOR 4-PC SETUP (PROJECT NYRA)

### PC1: Orchestrator-Mini (Ryzen 7 3700X, 16GB RAM)
```
RUVECTOR_MODE=distributed
RUVECTOR_NODE_ROLE=coordinator
RUVECTOR_CONSENSUS_QUORUM=2
RUVECTOR_HNSW_M=16
RUVECTOR_HNSW_EF_CONSTRUCTION=200
RUVECTOR_HNSW_EF_SEARCH=100
RUVECTOR_CACHE_SIZE_MB=2048
RUVECTOR_MAX_MEMORY_GB=4
RUVECTOR_DOCKER_CPU_LIMIT=2.0
RUVECTOR_DOCKER_MEMORY_LIMIT=4G
```

### PC2-4: GPU Workers (3060/3090Ti/5090)
```
RUVECTOR_NODE_ROLE=worker
RUVECTOR_CACHE_SIZE_MB=4096
RUVECTOR_MAX_MEMORY_GB=12-16 (depending on GPU VRAM)
RUVECTOR_DOCKER_CPU_LIMIT=4.0
RUVECTOR_DOCKER_MEMORY_LIMIT=8G-16G
RUVECTOR_SEARCH_THREADS=8-16 (matches GPU core count)
```

## PERFORMANCE EXPECTATIONS

- Search Latency: <100ms for millions of vectors (HNSW)
- Indexing Throughput: 10,000+ vectors/sec
- Memory: ~1KB per vector (1536-dim, unquantized)
- Network: QUIC protocol for sub-100ms inter-node sync
- Speedup vs Linear Search: 150x-12,500x depending on vector count

## SOURCE FILES

- Primary config: `/configs/env/ruvector.env` (447 lines, complete reference)
- Master config: `/.env.master` (lines 43-82)
- Master template: `/.env.master.template` (lines 200-356)
- Orchestrator config: `/.env.orchestrator-mini` (lines 68-103)
- Optimal config: `/.env.optimal` (lines 101-113)
- Docker compose: Various `docker-compose*.yml` files reference RUVECTOR_*

## TOTAL VARIABLES: 130+

This comprehensive reference documents all RuVector environment variables with descriptions, default values, optimal values, ranges, and use cases for the Project Nyra 4-PC distributed architecture.
