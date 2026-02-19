# Project Nyra - Comprehensive Environment Variables Reference

> **Complete Configuration Guide**: This document contains ALL possible environment variables across all services in the Project Nyra infrastructure. Use this as a reference for customization and advanced configuration.

**Related Files**:
- `.env.example` - Minimal essential variables for quick setup
- `docker-compose.yml` - Service definitions using these variables
- `Makefile` - Infrastructure management commands

**Last Updated**: 2026-01-15

---

## 📚 Table of Contents

1. [Core Databases](#core-databases)
2. [Secret Management (Infisical)](#secret-management-infisical)
3. [AI API Keys](#ai-api-keys)
4. [Claude Flow & Archon](#claude-flow--archon)
5. [MCP Services](#mcp-services)
6. [API Gateway (Nexus & LiteLLM)](#api-gateway-nexus--litellm)
7. [Applications](#applications)
8. [Development Tools](#development-tools)
9. [Monitoring Stack](#monitoring-stack)
10. [Admin & Storage](#admin--storage)
11. [Advanced Performance Tuning](#advanced-performance-tuning)
12. [Networking & Security](#networking--security)

---

## Core Databases

### PostgreSQL (Main Database)

#### Required Variables
```bash
POSTGRES_DB=nyra                          # Database name
POSTGRES_USER=nyra                        # Database user
POSTGRES_PASSWORD=CHANGE_ME               # REQUIRED: Strong password
POSTGRES_PORT=5432                        # Port (default: 5432)
```

#### Optional Performance Variables
```bash
# Connection Pool
POSTGRES_MAX_CONNECTIONS=200              # Max connections (default: 100)
POSTGRES_SHARED_BUFFERS=2GB               # Shared memory (default: 128MB)
POSTGRES_EFFECTIVE_CACHE_SIZE=8GB         # OS cache hint (default: 4GB)
POSTGRES_MAINTENANCE_WORK_MEM=512MB       # Maintenance operations (default: 64MB)
POSTGRES_CHECKPOINT_COMPLETION_TARGET=0.9 # Checkpoint spread (default: 0.5)
POSTGRES_WAL_BUFFERS=16MB                 # WAL buffers (default: -1 auto)
POSTGRES_DEFAULT_STATISTICS_TARGET=100    # Query planner stats (default: 100)
POSTGRES_RANDOM_PAGE_COST=1.1             # SSD cost (default: 4.0 for HDD)
POSTGRES_EFFECTIVE_IO_CONCURRENCY=200     # I/O threads (default: 1)
POSTGRES_WORK_MEM=4MB                     # Sort/hash memory per operation (default: 4MB)
POSTGRES_MIN_WAL_SIZE=1GB                 # Min WAL size (default: 80MB)
POSTGRES_MAX_WAL_SIZE=4GB                 # Max WAL size (default: 1GB)
POSTGRES_MAX_WORKER_PROCESSES=8           # Background workers (default: 8)
POSTGRES_MAX_PARALLEL_WORKERS_PER_GATHER=4 # Parallel query workers (default: 2)
POSTGRES_MAX_PARALLEL_WORKERS=8           # Total parallel workers (default: 8)
POSTGRES_MAX_PARALLEL_MAINTENANCE_WORKERS=4 # Maintenance workers (default: 2)
```

#### Optional Logging Variables
```bash
POSTGRES_LOG_MIN_DURATION_STATEMENT=1000  # Log slow queries (ms, default: -1 disabled)
POSTGRES_LOG_CONNECTIONS=on               # Log connections (default: off)
POSTGRES_LOG_DISCONNECTIONS=on            # Log disconnections (default: off)
POSTGRES_LOG_DURATION=off                 # Log statement duration (default: off)
POSTGRES_LOG_STATEMENT=none               # Log statements (none/ddl/mod/all, default: none)
POSTGRES_LOG_LINE_PREFIX='%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ' # Log format
```

#### Optional Backup Variables
```bash
POSTGRES_BACKUP_DIR=/backups              # Backup directory
POSTGRES_BACKUP_SCHEDULE=0 2 * * *        # Cron schedule (2 AM daily)
POSTGRES_BACKUP_RETENTION_DAYS=30         # Keep backups for N days
POSTGRES_BACKUP_COMPRESSION=gzip          # Compression method (gzip/zstd/none)
```

### Redis (Cache & Queue)

#### Required Variables
```bash
REDIS_PASSWORD=CHANGE_ME                  # REQUIRED: Strong password
REDIS_PORT=6379                           # Port (default: 6379)
REDIS_MAX_MEMORY=2gb                      # Max memory (default: 2gb)
```

#### Optional Performance Variables
```bash
REDIS_MAXMEMORY_POLICY=allkeys-lru        # Eviction policy (default: noeviction)
# Policies: volatile-lru, allkeys-lru, volatile-lfu, allkeys-lfu, volatile-random,
#           allkeys-random, volatile-ttl, noeviction
REDIS_MAXMEMORY_SAMPLES=5                 # LRU/LFU samples (default: 5)
REDIS_TIMEOUT=300                         # Client timeout seconds (default: 0 disabled)
REDIS_TCP_KEEPALIVE=300                   # TCP keepalive seconds (default: 300)
REDIS_TCP_BACKLOG=511                     # TCP backlog (default: 511)
REDIS_DATABASES=16                        # Number of databases (default: 16)
REDIS_SAVE="900 1 300 10 60 10000"       # RDB snapshot rules (default shown)
REDIS_STOP_WRITES_ON_BGSAVE_ERROR=yes     # Stop on save error (default: yes)
REDIS_RDBCOMPRESSION=yes                  # Compress RDB files (default: yes)
REDIS_RDBCHECKSUM=yes                     # Checksum RDB files (default: yes)
REDIS_DBFILENAME=dump.rdb                 # RDB filename (default: dump.rdb)
```

#### Optional AOF Persistence
```bash
REDIS_APPENDONLY=yes                      # Enable AOF (default: no)
REDIS_APPENDFILENAME=appendonly.aof       # AOF filename (default: appendonly.aof)
REDIS_APPENDFSYNC=everysec                # AOF sync (always/everysec/no, default: everysec)
REDIS_NO_APPENDFSYNC_ON_REWRITE=no        # Disable fsync during rewrite (default: no)
REDIS_AUTO_AOF_REWRITE_PERCENTAGE=100     # Auto rewrite trigger % (default: 100)
REDIS_AUTO_AOF_REWRITE_MIN_SIZE=64mb      # Min size for rewrite (default: 64mb)
```

#### Optional Cluster Variables
```bash
REDIS_CLUSTER_ENABLED=no                  # Enable cluster mode (default: no)
REDIS_CLUSTER_CONFIG_FILE=nodes.conf      # Cluster config file (default: nodes-6379.conf)
REDIS_CLUSTER_NODE_TIMEOUT=15000          # Node timeout ms (default: 15000)
REDIS_CLUSTER_REPLICA_VALIDITY_FACTOR=10  # Replica validity (default: 10)
```

### MongoDB (Infisical Backend)

#### Required Variables
```bash
MONGO_ROOT_USER=admin                     # Root username
MONGO_ROOT_PASSWORD=CHANGE_ME             # REQUIRED: Strong password
MONGO_PORT=27017                          # Port (default: 27017)
```

#### Optional Performance Variables
```bash
MONGO_CACHE_SIZE_GB=1                     # WiredTiger cache (default: 50% of RAM)
MONGO_MAX_CONNECTIONS=65536               # Max connections (default: 65536)
MONGO_JOURNAL_COMMIT_INTERVAL=100         # Journal commit ms (default: 100)
MONGO_OPLOG_SIZE_MB=1024                  # Oplog size MB (default: 5% of free disk)
MONGO_ENABLE_MAJORITY_READ_CONCERN=true   # Enable read concern (default: true)
```

#### Optional Replication Variables
```bash
MONGO_REPLSET_NAME=rs0                    # Replica set name
MONGO_REPLSET_KEY=CHANGE_ME_KEY           # Replica set key
MONGO_REPLSET_OPLOG_SIZE_MB=1024          # Oplog size for replication
```

---

## Secret Management (Infisical)

### Infisical Server

#### Required Variables
```bash
INFISICAL_ENCRYPTION_KEY=CHANGE_ME_32_CHAR_HEX # REQUIRED: 32-char hex string
INFISICAL_JWT_SECRET=CHANGE_ME            # REQUIRED: Strong password
INFISICAL_SITE_URL=http://localhost:8080  # Server URL
INFISICAL_PORT=8080                       # Port (default: 8080)
```

#### Optional Configuration
```bash
# Project Configuration
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef # Project UUID
INFISICAL_ENV=development                 # Environment (development/staging/production)

# Email SMTP (for invitations)
INFISICAL_SMTP_HOST=smtp.gmail.com        # SMTP server
INFISICAL_SMTP_PORT=587                   # SMTP port
INFISICAL_SMTP_SECURE=false               # Use TLS (default: false)
INFISICAL_SMTP_USERNAME=                  # SMTP username
INFISICAL_SMTP_PASSWORD=                  # SMTP password
INFISICAL_SMTP_FROM_ADDRESS=noreply@yourdomain.com # From email
INFISICAL_SMTP_FROM_NAME=Infisical        # From name

# Authentication
INFISICAL_AUTH_SECRET=CHANGE_ME           # Auth token secret
INFISICAL_REFRESH_TOKEN_LIFETIME=90       # Refresh token days (default: 90)
INFISICAL_ACCESS_TOKEN_LIFETIME=60        # Access token minutes (default: 60)
INFISICAL_INVITE_LINK_LIFETIME=7          # Invite link days (default: 7)

# Rate Limiting
INFISICAL_RATE_LIMIT_READ_LIMIT=600       # Read requests per min (default: 600)
INFISICAL_RATE_LIMIT_WRITE_LIMIT=200      # Write requests per min (default: 200)
INFISICAL_RATE_LIMIT_SECRET_LIMIT=100     # Secret requests per min (default: 100)
INFISICAL_RATE_LIMIT_AUTH_LIMIT=60        # Auth requests per min (default: 60)

# Telemetry
INFISICAL_TELEMETRY_ENABLED=false         # Send usage data (default: true)

# Logging
INFISICAL_LOG_LEVEL=info                  # Log level (debug/info/warn/error, default: info)
```

### Infisical Agents (Machine Identities)

#### Required Variables
```bash
# Claude Flow Agent
INFISICAL_CLIENT_ID_CLAUDE_FLOW=YOUR_CLIENT_ID     # Machine identity client ID
INFISICAL_CLIENT_SECRET_CLAUDE_FLOW=YOUR_SECRET    # Machine identity secret

# Archon Agent
INFISICAL_CLIENT_ID_ARCHON=YOUR_CLIENT_ID          # Machine identity client ID
INFISICAL_CLIENT_SECRET_ARCHON=YOUR_SECRET         # Machine identity secret
```

---

## AI API Keys

### Anthropic (Claude)

```bash
ANTHROPIC_API_KEY=sk-ant-YOUR_API_KEY     # REQUIRED for Claude models
ANTHROPIC_API_VERSION=2023-06-01          # API version (default: latest)
ANTHROPIC_MAX_TOKENS=4096                 # Max tokens per request (default: 4096)
ANTHROPIC_TEMPERATURE=0.7                 # Temperature 0-1 (default: 0.7)
ANTHROPIC_TOP_P=0.9                       # Top-p sampling (default: 0.9)
ANTHROPIC_TIMEOUT=60000                   # Request timeout ms (default: 60000)
```

### OpenAI

```bash
OPENAI_API_KEY=sk-YOUR_API_KEY            # REQUIRED for GPT models
OPENAI_ORG_ID=                            # Organization ID (optional)
OPENAI_API_VERSION=v1                     # API version (default: v1)
OPENAI_MAX_TOKENS=4096                    # Max tokens (default: 4096)
OPENAI_TEMPERATURE=0.7                    # Temperature 0-2 (default: 0.7)
OPENAI_TOP_P=1.0                          # Top-p sampling (default: 1.0)
OPENAI_FREQUENCY_PENALTY=0.0              # Frequency penalty 0-2 (default: 0.0)
OPENAI_PRESENCE_PENALTY=0.0               # Presence penalty 0-2 (default: 0.0)
OPENAI_TIMEOUT=60000                      # Request timeout ms (default: 60000)
```

### OpenRouter

```bash
OPENROUTER_API_KEY=sk-or-YOUR_API_KEY     # OpenRouter API key
OPENROUTER_SITE_URL=https://yoursite.com  # Your site URL (for rankings)
OPENROUTER_APP_NAME=Project Nyra          # App name (for rankings)
OPENROUTER_HTTP_REFERER=                  # HTTP referer header
OPENROUTER_TIMEOUT=60000                  # Request timeout ms (default: 60000)
```

### Google Gemini

```bash
GOOGLE_GEMINI_API_KEY=YOUR_API_KEY        # Gemini API key
GOOGLE_GEMINI_PROJECT_ID=                 # GCP project ID (optional)
GOOGLE_GEMINI_MODEL=gemini-pro            # Model name (default: gemini-pro)
GOOGLE_GEMINI_TEMPERATURE=0.7             # Temperature 0-1 (default: 0.7)
GOOGLE_GEMINI_TOP_P=0.9                   # Top-p sampling (default: 0.9)
GOOGLE_GEMINI_TOP_K=40                    # Top-k sampling (default: 40)
GOOGLE_GEMINI_MAX_OUTPUT_TOKENS=2048      # Max output tokens (default: 2048)
```

---

## Claude Flow & Archon

### Claude Flow (Node.js)

#### Required Variables
```bash
NODE_ENV=production                       # Environment (development/production)
NODE_VERSION=20                           # Node.js version
VOLTA_VERSION=1.1.1                       # Volta version manager
CLAUDE_FLOW_MCP_PORT=3000                 # MCP server port
```

#### Optional Configuration
```bash
# Logging
CLAUDE_FLOW_LOG_LEVEL=info                # Log level (debug/info/warn/error, default: info)
CLAUDE_FLOW_LOG_FORMAT=json               # Log format (json/text, default: json)
CLAUDE_FLOW_LOG_FILE=/app/logs/claude-flow.log # Log file path

# Metrics
CLAUDE_FLOW_METRICS_PORT=9090             # Prometheus metrics port
CLAUDE_FLOW_METRICS_ENABLED=true          # Enable metrics (default: true)
CLAUDE_FLOW_METRICS_PATH=/metrics         # Metrics endpoint path

# Agent Configuration
CLAUDE_FLOW_MAX_AGENTS=10                 # Max concurrent agents (default: 10)
CLAUDE_FLOW_AGENT_TIMEOUT=300000          # Agent timeout ms (default: 300000)
CLAUDE_FLOW_AGENT_MEMORY_LIMIT=2048       # Agent memory MB (default: 2048)

# Swarm Coordination
CLAUDE_FLOW_SWARM_TOPOLOGY=hierarchical   # Topology (hierarchical/mesh/ring/star)
CLAUDE_FLOW_SWARM_CONSENSUS=raft          # Consensus (raft/byzantine/gossip/crdt)
CLAUDE_FLOW_SWARM_MAX_SIZE=8              # Max swarm size (default: 8)

# Memory System
CLAUDE_FLOW_MEMORY_BACKEND=hybrid         # Backend (memory/sqlite/postgres/hybrid)
CLAUDE_FLOW_MEMORY_PATH=./data/memory     # Memory storage path
CLAUDE_FLOW_MEMORY_CACHE_SIZE=1000        # Cache size (default: 1000)
CLAUDE_FLOW_MEMORY_HNSW_ENABLED=true      # Enable HNSW indexing (default: true)
CLAUDE_FLOW_MEMORY_VECTOR_DIM=1536        # Vector dimensions (default: 1536)

# Performance
CLAUDE_FLOW_FLASH_ATTENTION=true          # Enable flash attention (default: true)
CLAUDE_FLOW_WASM_ENABLED=true             # Enable WASM (default: true)
CLAUDE_FLOW_QUANTIZATION=int8             # Quantization (int8/int4/none, default: int8)

# Security
CLAUDE_FLOW_JWT_SECRET=CHANGE_ME          # JWT secret for auth
CLAUDE_FLOW_JWT_EXPIRY=24h                # JWT expiry (default: 24h)
CLAUDE_FLOW_CORS_ORIGIN=*                 # CORS allowed origins (default: *)
CLAUDE_FLOW_RATE_LIMIT=100                # Rate limit per min (default: 100)

# Health Checks
CLAUDE_FLOW_HEALTH_CHECK_INTERVAL=30      # Health check interval seconds (default: 30)
CLAUDE_FLOW_HEALTH_CHECK_TIMEOUT=10       # Health check timeout seconds (default: 10)
```

### Archon OS (Python/FastAPI)

#### Required Variables
```bash
PYTHON_ENV=production                     # Environment (development/production)
PYTHON_VERSION=3.11                       # Python version
ARCHON_API_PORT=8000                      # API port
```

#### Optional Configuration
```bash
# Server Configuration
ARCHON_API_HOST=0.0.0.0                   # Bind address (default: 0.0.0.0)
ARCHON_API_WORKERS=4                      # Uvicorn workers (default: 4)
ARCHON_API_RELOAD=false                   # Auto-reload on changes (default: false)
ARCHON_API_TIMEOUT=60                     # Request timeout seconds (default: 60)

# Logging
ARCHON_LOG_LEVEL=INFO                     # Log level (DEBUG/INFO/WARNING/ERROR/CRITICAL)
ARCHON_LOG_FORMAT=json                    # Log format (json/text, default: json)
ARCHON_LOG_FILE=/app/logs/archon.log      # Log file path

# Metrics
ARCHON_METRICS_PORT=9091                  # Prometheus metrics port
ARCHON_METRICS_ENABLED=true               # Enable metrics (default: true)

# AI Framework
ARCHON_MAX_CONCURRENT_TASKS=10            # Max concurrent tasks (default: 10)
ARCHON_TASK_TIMEOUT=300                   # Task timeout seconds (default: 300)
ARCHON_TASK_RETRY_COUNT=3                 # Task retry count (default: 3)
ARCHON_TASK_RETRY_DELAY=5                 # Retry delay seconds (default: 5)

# Database
ARCHON_DB_URL=postgresql://user:pass@postgres:5432/archon # Database URL
ARCHON_DB_POOL_SIZE=10                    # Connection pool size (default: 10)
ARCHON_DB_POOL_TIMEOUT=30                 # Pool timeout seconds (default: 30)
ARCHON_DB_ECHO=false                      # Echo SQL queries (default: false)

# Cache
ARCHON_CACHE_BACKEND=redis                # Cache backend (redis/memory, default: redis)
ARCHON_CACHE_TTL=3600                     # Default TTL seconds (default: 3600)
ARCHON_CACHE_PREFIX=archon:               # Cache key prefix

# Security
ARCHON_SECRET_KEY=CHANGE_ME               # Secret key for signing
ARCHON_CORS_ORIGINS=*                     # CORS allowed origins (default: *)
ARCHON_RATE_LIMIT=100                     # Rate limit per min (default: 100)
```

---

## MCP Services

### Graphiti MCP

```bash
GRAPHITI_PORT=8001                        # API port (default: 8001)
GRAPHITI_LOG_LEVEL=info                   # Log level (default: info)
GRAPHITI_NEO4J_URI=bolt://neo4j:7687      # Neo4j connection URI
GRAPHITI_NEO4J_USER=neo4j                 # Neo4j username
GRAPHITI_NEO4J_PASSWORD=${NEO4J_PASSWORD} # Neo4j password
GRAPHITI_EMBEDDING_MODEL=text-embedding-3-small # OpenAI embedding model
GRAPHITI_LLM_MODEL=gpt-4                  # LLM model for reasoning
GRAPHITI_MAX_CONTEXT_DEPTH=3              # Graph traversal depth (default: 3)
GRAPHITI_CACHE_TTL=3600                   # Cache TTL seconds (default: 3600)
```

### Mem0 MCP

```bash
MEM0_PORT=8002                            # API port (default: 8002)
MEM0_API_KEY=                             # Mem0 cloud API key (optional)
MEM0_DEFAULT_USER_ID=                     # Default user ID (optional)
MEM0_BASE_URL=https://api.mem0.ai         # Base URL (default: cloud, can use local)
MEM0_EMBEDDING_MODEL=text-embedding-3-small # Embedding model
MEM0_VECTOR_STORE=qdrant                  # Vector store (qdrant/chroma/weaviate)
MEM0_VECTOR_HOST=qdrant                   # Vector store host
MEM0_VECTOR_PORT=6333                     # Vector store port
MEM0_MEMORY_RETENTION_DAYS=90             # Memory retention (default: 90)
MEM0_LOG_LEVEL=info                       # Log level (default: info)
```

### Letta (MemGPT)

```bash
LETTA_PORT=8283                           # API port (default: 8283)
LETTA_API_KEY=REPLACE_ME_CHANGE_ME        # API authentication key
LETTA_POSTGRES_PASSWORD=CHANGE_ME         # Postgres password for Letta DB
LETTA_POSTGRES_PORT=5433                  # Postgres port (default: 5433)
LETTA_POSTGRES_DB=letta                   # Database name
LETTA_POSTGRES_USER=letta                 # Database user
LETTA_EMBEDDING_MODEL=text-embedding-3-small # Embedding model
LETTA_LLM_MODEL=gpt-4                     # LLM model
LETTA_MEMORY_LIMIT=32000                  # Memory context limit tokens (default: 32000)
LETTA_LOG_LEVEL=info                      # Log level (default: info)
```

---

## API Gateway (Nexus & LiteLLM)

### Nexus Router

```bash
NEXUS_PORT=6000                           # API port (default: 6000)
NEXUS_JWT_SECRET=CHANGE_ME                # REQUIRED: JWT secret
NEXUS_ADMIN_TOKEN=CHANGE_ME               # REQUIRED: Admin token
NEXUS_LOG_LEVEL=info                      # Log level (default: info)

# Rate Limiting
NEXUS_RATE_LIMIT_ENABLED=true             # Enable rate limiting (default: true)
NEXUS_RATE_LIMIT_WINDOW=60000             # Rate limit window ms (default: 60000)
NEXUS_RATE_LIMIT_MAX_REQUESTS=100         # Max requests per window (default: 100)

# Cache
NEXUS_CACHE_ENABLED=true                  # Enable response caching (default: true)
NEXUS_CACHE_TTL=300                       # Cache TTL seconds (default: 300)
NEXUS_CACHE_MAX_SIZE=1000                 # Cache max entries (default: 1000)

# Load Balancing
NEXUS_LB_STRATEGY=round-robin             # Strategy (round-robin/weighted/least-connections)
NEXUS_LB_HEALTH_CHECK_INTERVAL=30         # Health check interval seconds (default: 30)

# Timeouts
NEXUS_REQUEST_TIMEOUT=60000               # Request timeout ms (default: 60000)
NEXUS_CONNECT_TIMEOUT=5000                # Connect timeout ms (default: 5000)
```

### LiteLLM Proxy

```bash
LITELLM_PORT=4000                         # API port (default: 4000)
LITELLM_MASTER_KEY=                       # Master API key (optional)
LITELLM_DATABASE_URL=sqlite:////data/litellm.sqlite # Database URL
LITELLM_LOG_LEVEL=INFO                    # Log level (default: INFO)

# Model Configuration
LITELLM_DROP_PARAMS=true                  # Drop unsupported params (default: true)
LITELLM_SET_VERBOSE=false                 # Verbose logging (default: false)
LITELLM_NUM_WORKERS=4                     # Uvicorn workers (default: 4)

# Rate Limiting
LITELLM_MAX_PARALLEL_REQUESTS=1000        # Max parallel requests (default: 1000)
LITELLM_MAX_REQUESTS_PER_MINUTE=600       # Max requests per minute (default: 600)

# Fallback & Retry
LITELLM_FALLBACK_MODELS=                  # Fallback models (comma-separated)
LITELLM_RETRY_POLICY=exponential_backoff  # Retry policy (default: exponential_backoff)
LITELLM_NUM_RETRIES=3                     # Number of retries (default: 3)
LITELLM_RETRY_DELAY=1                     # Initial retry delay seconds (default: 1)

# Cost Tracking
LITELLM_COST_TRACKING=true                # Enable cost tracking (default: true)
LITELLM_COST_CURRENCY=USD                 # Currency (default: USD)

# Cache
LITELLM_CACHE_TYPE=redis                  # Cache type (redis/in-memory/none)
LITELLM_CACHE_TTL=3600                    # Cache TTL seconds (default: 3600)
```

---

## Applications

### Dify

#### Required Variables
```bash
DIFY_SECRET_KEY=CHANGE_ME                 # REQUIRED: Secret key
DIFY_ENCRYPTION_KEY=                      # Encryption key (auto-generated if empty)
DIFY_SANDBOX_API_KEY=CHANGE_ME            # REQUIRED: Sandbox API key
DIFY_POSTGRES_PASSWORD=CHANGE_ME          # REQUIRED: Database password
DIFY_POSTGRES_PORT=5434                   # Postgres port (default: 5434)
```

#### Optional Configuration
```bash
# Server
DIFY_WEB_PORT=3002                        # Web UI port (default: 3002)
DIFY_API_PORT=5001                        # API port (default: 5001)
DIFY_SANDBOX_PORT=8194                    # Sandbox port (default: 8194)

# Database
DIFY_POSTGRES_DB=dify                     # Database name
DIFY_POSTGRES_USER=dify                   # Database user
DIFY_DB_POOL_SIZE=30                      # Connection pool size (default: 30)
DIFY_DB_POOL_RECYCLE=3600                 # Pool recycle seconds (default: 3600)

# Redis
DIFY_REDIS_USE_SSL=false                  # Use SSL for Redis (default: false)
DIFY_REDIS_DB=0                           # Redis database number (default: 0)

# Storage
DIFY_STORAGE_TYPE=local                   # Storage (local/s3/azure/aliyun, default: local)
DIFY_STORAGE_PATH=/app/storage            # Local storage path
DIFY_S3_BUCKET=                           # S3 bucket name
DIFY_S3_ACCESS_KEY=                       # S3 access key
DIFY_S3_SECRET_KEY=                       # S3 secret key
DIFY_S3_REGION=us-east-1                  # S3 region

# File Upload
DIFY_UPLOAD_FILE_SIZE_LIMIT=15            # Max file size MB (default: 15)
DIFY_UPLOAD_FILE_BATCH_LIMIT=5            # Max files per batch (default: 5)

# Workspace
DIFY_WORKSPACE_MAX_APPS=10                # Max apps per workspace (default: 10)
DIFY_WORKSPACE_MAX_MEMBERS=10             # Max members per workspace (default: 10)

# Model Configuration
DIFY_DEFAULT_MODEL_PROVIDER=openai        # Default provider (openai/anthropic/etc)
DIFY_MODEL_LOAD_BALANCING_ENABLED=false   # Load balancing (default: false)

# Indexing
DIFY_INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH=1000 # Max segment tokens
DIFY_INDEXING_CACHE_ENABLED=true          # Enable indexing cache (default: true)

# Code Execution
DIFY_CODE_EXECUTION_ENDPOINT=http://dify-sandbox:8194 # Sandbox endpoint
DIFY_CODE_EXECUTION_API_KEY=${DIFY_SANDBOX_API_KEY}
DIFY_CODE_MAX_STRING_LENGTH=80000         # Max string length in code
DIFY_CODE_MAX_STRING_ARRAY_LENGTH=30      # Max array length
DIFY_CODE_MAX_OBJECT_ARRAY_LENGTH=30      # Max object array length
DIFY_CODE_MAX_NUMBER_ARRAY_LENGTH=1000    # Max number array length
```

### Twenty CRM

#### Required Variables
```bash
TWENTY_PORT=3020                          # Application port
TWENTY_POSTGRES_PASSWORD=CHANGE_ME        # REQUIRED: Database password
TWENTY_POSTGRES_PORT=5435                 # Postgres port (default: 5435)
TWENTY_ACCESS_TOKEN_SECRET=CHANGE_ME      # REQUIRED: Access token secret
TWENTY_LOGIN_TOKEN_SECRET=CHANGE_ME       # REQUIRED: Login token secret
TWENTY_REFRESH_TOKEN_SECRET=CHANGE_ME     # REQUIRED: Refresh token secret
```

#### Optional Configuration
```bash
# Database
TWENTY_POSTGRES_DB=twenty                 # Database name
TWENTY_POSTGRES_USER=twenty               # Database user

# Authentication
TWENTY_ACCESS_TOKEN_EXPIRES_IN=30m        # Access token expiry (default: 30m)
TWENTY_REFRESH_TOKEN_EXPIRES_IN=90d       # Refresh token expiry (default: 90d)
TWENTY_LOGIN_TOKEN_EXPIRES_IN=15m         # Login token expiry (default: 15m)

# Frontend
TWENTY_FRONT_BASE_URL=http://localhost:3020 # Frontend URL
TWENTY_FRONT_AUTH_CALLBACK_URL=http://localhost:3020/verify

# Storage
TWENTY_STORAGE_TYPE=local                 # Storage (local/s3, default: local)
TWENTY_STORAGE_S3_BUCKET=                 # S3 bucket name
TWENTY_STORAGE_S3_REGION=us-east-1        # S3 region
TWENTY_STORAGE_LOCAL_PATH=/app/storage    # Local storage path

# Email
TWENTY_EMAIL_FROM_ADDRESS=noreply@twenty.com # From email
TWENTY_EMAIL_FROM_NAME=Twenty CRM         # From name
TWENTY_EMAIL_SYSTEM_ADDRESS=system@twenty.com # System email

# Features
TWENTY_SIGN_IN_PREFILLED=false            # Prefill sign-in (default: false)
TWENTY_TELEMETRY_ENABLED=false            # Send telemetry (default: true)
TWENTY_BILLING_ENABLED=false              # Enable billing (default: false)
```

### Quote API (Mortgage)

```bash
QUOTE_API_PORT=8089                       # API port (default: 8089)
QUOTE_API_LOG_LEVEL=INFO                  # Log level (default: INFO)
QUOTE_API_WORKERS=4                       # Uvicorn workers (default: 4)

# Rate API Configuration
QUOTE_RATE_API_URL=https://api.rateprovider.com # Rate provider API
QUOTE_RATE_API_KEY=                       # Rate provider API key
QUOTE_RATE_CACHE_TTL=300                  # Rate cache TTL seconds (default: 300)

# Calculation Settings
QUOTE_MAX_LOAN_AMOUNT=5000000             # Max loan amount (default: 5000000)
QUOTE_MIN_LOAN_AMOUNT=50000               # Min loan amount (default: 50000)
QUOTE_MAX_LTV=97                          # Max loan-to-value % (default: 97)
QUOTE_MIN_CREDIT_SCORE=580                # Min credit score (default: 580)

# Database
QUOTE_DB_URL=postgresql://user:pass@postgres:5432/quotes # Database URL
```

### Campaign Engine

```bash
CAMPAIGN_ENGINE_PORT=8020                 # API port (default: 8020)
CAMPAIGN_ENGINE_LOG_LEVEL=INFO            # Log level (default: INFO)

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=YOUR_TWILIO_ACCOUNT_SID # Twilio account SID
TWILIO_AUTH_TOKEN=YOUR_TWILIO_AUTH_TOKEN   # Twilio auth token
TWILIO_PHONE_NUMBER=+1234567890           # Twilio phone number
TWILIO_VERIFY_SERVICE_SID=                # Verify service SID (optional)

# SendGrid (Email)
SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY    # SendGrid API key
SENDGRID_FROM_EMAIL=noreply@ratehunter.net # From email
SENDGRID_FROM_NAME=RateHunter             # From name

# Campaign Settings
CAMPAIGN_MAX_DAILY_CONTACTS=1000          # Max contacts per day (default: 1000)
CAMPAIGN_RETRY_FAILED_AFTER_HOURS=24      # Retry failed after hours (default: 24)
CAMPAIGN_MAX_RETRIES=3                    # Max retry attempts (default: 3)

# Drip Campaign
CAMPAIGN_DRIP_SCHEDULE=0,3,7,14,30        # Days between touches (default: 0,3,7,14,30)
CAMPAIGN_DRIP_MAX_TOUCHES=10              # Max touches per lead (default: 10)
```

---

## Development Tools

### Gitea

```bash
GITEA_HTTP_PORT=3001                      # HTTP port (default: 3001)
GITEA_SSH_PORT=2222                       # SSH port (default: 2222)
GITEA_RUNNER_TOKEN=YOUR_GITEA_RUNNER_TOKEN # Runner registration token

# Database (uses main PostgreSQL)
GITEA_DB_TYPE=postgres                    # Database type
GITEA_DB_HOST=postgres:5432               # Database host
GITEA_DB_NAME=gitea                       # Database name
GITEA_DB_USER=gitea                       # Database user
GITEA_DB_PASSWD=${POSTGRES_PASSWORD}      # Database password

# Server
GITEA_ROOT_URL=http://localhost:3001      # Root URL
GITEA_DOMAIN=localhost                    # Domain
GITEA_SSH_DOMAIN=localhost                # SSH domain
GITEA_OFFLINE_MODE=false                  # Offline mode (default: false)

# Security
GITEA_SECRET_KEY=CHANGE_ME                # Secret key
GITEA_INTERNAL_TOKEN=CHANGE_ME            # Internal token
GITEA_OAUTH2_JWT_SECRET=CHANGE_ME         # OAuth2 JWT secret
GITEA_LFS_JWT_SECRET=CHANGE_ME            # LFS JWT secret

# Features
GITEA_DISABLE_REGISTRATION=false          # Disable registration (default: false)
GITEA_REQUIRE_SIGNIN_VIEW=false           # Require sign-in to view (default: false)
GITEA_ENABLE_OPENID_SIGNIN=true           # Enable OpenID (default: true)
GITEA_ENABLE_OPENID_SIGNUP=true           # Enable OpenID signup (default: true)
GITEA_DEFAULT_ALLOW_CREATE_ORGANIZATION=true # Allow org creation (default: true)

# Mailer
GITEA_MAILER_ENABLED=false                # Enable mailer (default: false)
GITEA_MAILER_FROM=noreply@gitea.local     # From email
GITEA_MAILER_HOST=                        # SMTP host
GITEA_MAILER_USER=                        # SMTP username
GITEA_MAILER_PASSWD=                      # SMTP password
```

### n8n (Workflow Automation)

```bash
N8N_PORT=5678                             # Web UI port (default: 5678)
N8N_BASIC_AUTH_USER=admin                 # Basic auth username
N8N_BASIC_AUTH_PASSWORD=REPLACE_ME_CHANGE_ME # REQUIRED: Basic auth password
N8N_ENCRYPTION_KEY=REPLACE_ME_CHANGE_ME   # REQUIRED: Encryption key

# Database (PostgreSQL recommended for production)
N8N_DB_TYPE=postgresdb                    # Database type (postgresdb/sqlite)
N8N_DB_POSTGRESDB_DATABASE=n8n            # Database name
N8N_DB_POSTGRESDB_HOST=postgres           # Database host
N8N_DB_POSTGRESDB_PORT=5432               # Database port
N8N_DB_POSTGRESDB_USER=n8n                # Database user
N8N_DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD} # Database password

# Server
N8N_HOST=0.0.0.0                          # Bind address (default: 0.0.0.0)
N8N_PROTOCOL=http                         # Protocol (http/https)
N8N_EDITOR_BASE_URL=http://localhost:5678 # Editor URL

# Execution
N8N_EXECUTIONS_MODE=regular               # Execution mode (regular/queue)
N8N_EXECUTIONS_TIMEOUT=3600               # Execution timeout seconds (default: 3600)
N8N_EXECUTIONS_TIMEOUT_MAX=7200           # Max timeout seconds (default: 7200)
N8N_EXECUTIONS_DATA_SAVE_ON_ERROR=all     # Save on error (all/none)
N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS=all   # Save on success (all/none)
N8N_EXECUTIONS_DATA_SAVE_ON_PROGRESS=false # Save progress (default: false)
N8N_EXECUTIONS_DATA_MAX_AGE=336           # Data retention hours (default: 336 = 14 days)
N8N_EXECUTIONS_DATA_PRUNE=true            # Auto-prune old data (default: true)

# Workflows
N8N_WORKFLOWS_DEFAULT_NAME=My workflow    # Default workflow name
N8N_DEFAULT_BINARY_DATA_MODE=filesystem   # Binary data (filesystem/s3)

# Security
N8N_SECURITY_AUDIT_LOGS_ENABLED=false     # Enable audit logs (default: false)
N8N_JWT_AUTH_ENABLED=true                 # Enable JWT auth (default: true)
N8N_JWT_SECRET=CHANGE_ME                  # JWT secret

# External Storage
N8N_EXTERNAL_STORAGE_S3_BUCKET=           # S3 bucket name
N8N_EXTERNAL_STORAGE_S3_ACCESS_KEY=       # S3 access key
N8N_EXTERNAL_STORAGE_S3_SECRET_KEY=       # S3 secret key
N8N_EXTERNAL_STORAGE_S3_REGION=us-east-1  # S3 region
```

### Activepieces

```bash
ACTIVEPIECES_PORT=8082                    # Web UI port (default: 8082)
ACTIVEPIECES_API_KEY=REPLACE_ME_CHANGE_ME # REQUIRED: API key
ACTIVEPIECES_ENCRYPTION_KEY=REPLACE_ME_CHANGE_ME # REQUIRED: 32-char encryption key
ACTIVEPIECES_JWT_SECRET=REPLACE_ME_CHANGE_ME # REQUIRED: JWT secret

# Database (PostgreSQL)
ACTIVEPIECES_DB_TYPE=POSTGRES             # Database type
ACTIVEPIECES_POSTGRES_DATABASE=activepieces # Database name
ACTIVEPIECES_POSTGRES_HOST=postgres       # Database host
ACTIVEPIECES_POSTGRES_PORT=5432           # Database port
ACTIVEPIECES_POSTGRES_USERNAME=activepieces # Database user
ACTIVEPIECES_POSTGRES_PASSWORD=${POSTGRES_PASSWORD} # Database password

# Server
ACTIVEPIECES_FRONTEND_URL=http://localhost:8082 # Frontend URL
ACTIVEPIECES_BACKEND_URL=http://localhost:8082 # Backend URL
ACTIVEPIECES_WEBHOOK_TIMEOUT_SECONDS=30   # Webhook timeout (default: 30)

# Execution
ACTIVEPIECES_EXECUTION_MODE=SANDBOXED     # Execution mode (SANDBOXED/UNSANDBOXED)
ACTIVEPIECES_SANDBOX_RUN_TIME_SECONDS=600 # Sandbox timeout (default: 600)
ACTIVEPIECES_MAX_FILE_SIZE_MB=10          # Max file size MB (default: 10)

# Features
ACTIVEPIECES_TELEMETRY_ENABLED=false      # Send telemetry (default: true)
ACTIVEPIECES_SIGN_UP_ENABLED=true         # Enable sign-up (default: true)
ACTIVEPIECES_TEMPLATES_SOURCE_URL=        # Custom templates URL

# Queue (Redis)
ACTIVEPIECES_REDIS_HOST=redis             # Redis host
ACTIVEPIECES_REDIS_PORT=6379              # Redis port
ACTIVEPIECES_REDIS_PASSWORD=${REDIS_PASSWORD} # Redis password
ACTIVEPIECES_REDIS_DB=1                   # Redis database (default: 1)

# Storage
ACTIVEPIECES_STORAGE_TYPE=LOCAL           # Storage (LOCAL/S3)
ACTIVEPIECES_S3_BUCKET=                   # S3 bucket
ACTIVEPIECES_S3_ACCESS_KEY_ID=            # S3 access key
ACTIVEPIECES_S3_SECRET_ACCESS_KEY=        # S3 secret key
ACTIVEPIECES_S3_REGION=us-east-1          # S3 region
```

---

## Monitoring Stack

### Prometheus

```bash
PROMETHEUS_PORT=9090                      # Web UI port (default: 9090)

# Storage
PROMETHEUS_RETENTION_TIME=15d             # Data retention (default: 15d)
PROMETHEUS_RETENTION_SIZE=50GB            # Max storage size (default: 0 unlimited)
PROMETHEUS_STORAGE_TSDB_PATH=/prometheus  # TSDB path

# Scraping
PROMETHEUS_SCRAPE_INTERVAL=15s            # Scrape interval (default: 15s)
PROMETHEUS_SCRAPE_TIMEOUT=10s             # Scrape timeout (default: 10s)
PROMETHEUS_EVALUATION_INTERVAL=15s        # Rule evaluation interval (default: 15s)

# Performance
PROMETHEUS_QUERY_MAX_CONCURRENCY=20       # Max concurrent queries (default: 20)
PROMETHEUS_QUERY_TIMEOUT=2m               # Query timeout (default: 2m)
PROMETHEUS_QUERY_MAX_SAMPLES=50000000     # Max samples per query (default: 50000000)

# Remote Write (optional)
PROMETHEUS_REMOTE_WRITE_URL=              # Remote write endpoint
PROMETHEUS_REMOTE_WRITE_USERNAME=         # Remote write username
PROMETHEUS_REMOTE_WRITE_PASSWORD=         # Remote write password

# Alert Manager
PROMETHEUS_ALERTMANAGER_URL=http://alertmanager:9093 # Alert manager URL
```

### Grafana

```bash
GRAFANA_PORT=3003                         # Web UI port (default: 3003)
GRAFANA_ADMIN_USER=admin                  # Admin username (default: admin)
GRAFANA_ADMIN_PASSWORD=CHANGE_ME          # REQUIRED: Admin password

# Server
GRAFANA_ROOT_URL=http://localhost:3003    # Root URL
GRAFANA_SERVE_FROM_SUB_PATH=false         # Serve from subpath (default: false)
GRAFANA_DOMAIN=localhost                  # Domain

# Database (PostgreSQL recommended for production)
GRAFANA_DATABASE_TYPE=postgres            # Database type (sqlite3/postgres/mysql)
GRAFANA_DATABASE_HOST=postgres:5432       # Database host
GRAFANA_DATABASE_NAME=grafana             # Database name
GRAFANA_DATABASE_USER=grafana             # Database user
GRAFANA_DATABASE_PASSWORD=${POSTGRES_PASSWORD} # Database password

# Security
GRAFANA_SECRET_KEY=CHANGE_ME              # Secret key for signing
GRAFANA_ADMIN_ENABLE_TOKEN_AUTH=true      # Enable token auth (default: false)
GRAFANA_DISABLE_GRAVATAR=false            # Disable Gravatar (default: false)
GRAFANA_ALLOW_SIGN_UP=false               # Allow sign-up (default: false)
GRAFANA_ALLOW_ORG_CREATE=false            # Allow org creation (default: false)
GRAFANA_AUTO_ASSIGN_ORG=true              # Auto-assign to org (default: true)
GRAFANA_AUTO_ASSIGN_ORG_ROLE=Viewer       # Auto-assigned role (Viewer/Editor/Admin)

# Anonymous Access
GRAFANA_AUTH_ANONYMOUS_ENABLED=false      # Enable anonymous (default: false)
GRAFANA_AUTH_ANONYMOUS_ORG_NAME=Main Org. # Anonymous org name
GRAFANA_AUTH_ANONYMOUS_ORG_ROLE=Viewer    # Anonymous role

# Session
GRAFANA_SESSION_PROVIDER=redis            # Session provider (memory/file/redis)
GRAFANA_SESSION_PROVIDER_CONFIG=addr=redis:6379,db=2,password=${REDIS_PASSWORD}

# Plugins
GRAFANA_INSTALL_PLUGINS=                  # Plugins to install (comma-separated)
GRAFANA_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS= # Allow unsigned plugins

# SMTP (Email Alerts)
GRAFANA_SMTP_ENABLED=false                # Enable SMTP (default: false)
GRAFANA_SMTP_HOST=smtp.gmail.com:587      # SMTP host
GRAFANA_SMTP_USER=                        # SMTP username
GRAFANA_SMTP_PASSWORD=                    # SMTP password
GRAFANA_SMTP_FROM_ADDRESS=admin@grafana.local # From email
GRAFANA_SMTP_FROM_NAME=Grafana            # From name

# Unified Alerting
GRAFANA_UNIFIED_ALERTING_ENABLED=true     # Enable unified alerting (default: true)
GRAFANA_UNIFIED_ALERTING_EXECUTE_ALERTS=true # Execute alerts (default: true)
```

### Loki (Log Aggregation)

```bash
LOKI_PORT=3100                            # HTTP port (default: 3100)

# Storage
LOKI_STORAGE_TYPE=filesystem              # Storage (filesystem/s3/gcs)
LOKI_STORAGE_FILESYSTEM_PATH=/loki        # Filesystem path
LOKI_RETENTION_PERIOD=744h                # Retention period (default: 744h = 31 days)

# Limits
LOKI_INGESTION_RATE_MB=4                  # Ingestion rate MB/s (default: 4)
LOKI_INGESTION_BURST_SIZE_MB=6            # Burst size MB (default: 6)
LOKI_MAX_QUERY_LOOKBACK=720h              # Max query lookback (default: 720h = 30 days)
LOKI_MAX_QUERY_LENGTH=721h                # Max query duration (default: 721h)
LOKI_MAX_ENTRIES_LIMIT_PER_QUERY=5000     # Max entries per query (default: 5000)

# Compactor
LOKI_COMPACTOR_WORKING_DIRECTORY=/loki/compactor # Compactor dir
LOKI_COMPACTOR_RETENTION_ENABLED=true     # Enable retention (default: false)
LOKI_COMPACTOR_RETENTION_DELETE_DELAY=2h  # Delete delay (default: 2h)

# Performance
LOKI_CHUNK_IDLE_PERIOD=30m                # Chunk idle period (default: 30m)
LOKI_MAX_CHUNK_AGE=1h                     # Max chunk age (default: 1h)
LOKI_CHUNK_RETAIN_PERIOD=30s              # Chunk retain period (default: 30s)
```

### Alert Manager

```bash
ALERTMANAGER_PORT=9093                    # Web UI port (default: 9093)

# Storage
ALERTMANAGER_STORAGE_PATH=/alertmanager   # Storage path

# Cluster (for HA)
ALERTMANAGER_CLUSTER_LISTEN_ADDRESS=0.0.0.0:9094 # Cluster listen address
ALERTMANAGER_CLUSTER_PEERS=                # Cluster peers (comma-separated)

# SMTP (Email Alerts)
ALERTMANAGER_SMTP_SMARTHOST=smtp.gmail.com:587 # SMTP server
ALERTMANAGER_SMTP_FROM=alerts@yourdomain.com # From email
ALERTMANAGER_SMTP_AUTH_USERNAME=           # SMTP username
ALERTMANAGER_SMTP_AUTH_PASSWORD=           # SMTP password
ALERTMANAGER_SMTP_REQUIRE_TLS=true         # Require TLS (default: true)

# Slack (optional)
ALERTMANAGER_SLACK_API_URL=                # Slack webhook URL
ALERTMANAGER_SLACK_CHANNEL=#alerts         # Slack channel
ALERTMANAGER_SLACK_USERNAME=AlertManager   # Bot username
ALERTMANAGER_SLACK_ICON_EMOJI=:loudspeaker: # Bot emoji

# PagerDuty (optional)
ALERTMANAGER_PAGERDUTY_SERVICE_KEY=        # PagerDuty service key
ALERTMANAGER_PAGERDUTY_URL=https://events.pagerduty.com/v2/enqueue # PagerDuty URL
```

### Langfuse (LLM Observability)

```bash
LANGFUSE_PORT=3004                        # Web UI port (default: 3004)
LANGFUSE_NEXTAUTH_SECRET=CHANGE_ME        # REQUIRED: NextAuth secret
LANGFUSE_SALT=CHANGE_ME                   # REQUIRED: Salt for encryption

# Database (PostgreSQL)
LANGFUSE_DATABASE_URL=postgresql://user:pass@postgres:5432/langfuse # Database URL

# Authentication
LANGFUSE_NEXTAUTH_URL=http://localhost:3004 # NextAuth URL
LANGFUSE_AUTH_DISABLE_SIGNUP=false        # Disable sign-up (default: false)
LANGFUSE_AUTH_DISABLE_USERNAME_PASSWORD=false # Disable username/password (default: false)

# Storage (S3 for large traces)
LANGFUSE_S3_ENABLED=false                 # Enable S3 storage (default: false)
LANGFUSE_S3_ENDPOINT=                     # S3 endpoint (for MinIO compatibility)
LANGFUSE_S3_ACCESS_KEY_ID=                # S3 access key
LANGFUSE_S3_SECRET_ACCESS_KEY=            # S3 secret key
LANGFUSE_S3_BUCKET_NAME=langfuse          # S3 bucket name
LANGFUSE_S3_REGION=us-east-1              # S3 region

# Features
LANGFUSE_TELEMETRY_ENABLED=false          # Send telemetry (default: true)
LANGFUSE_ENABLE_EXPERIMENTAL_FEATURES=false # Enable experimental (default: false)

# Rate Limiting
LANGFUSE_RATE_LIMIT_ENABLED=true          # Enable rate limiting (default: true)
LANGFUSE_RATE_LIMIT_POINTS=1000           # Points per window (default: 1000)
LANGFUSE_RATE_LIMIT_DURATION=60           # Window duration seconds (default: 60)
```

### cAdvisor (Container Monitoring)

```bash
CADVISOR_PORT=8081                        # Web UI port (default: 8081)

# Storage
CADVISOR_STORAGE_DURATION=2m0s            # Storage duration (default: 2m0s)
CADVISOR_HOUSEKEEPING_INTERVAL=10s        # Housekeeping interval (default: 10s)

# Metrics
CADVISOR_MAX_PROCS=0                      # Max processes to track (default: 0 unlimited)
CADVISOR_ENABLE_METRICS=diskIO,network,cpu,memory # Enabled metrics
CADVISOR_DISABLE_METRICS=disk,tcp,udp,sched # Disabled metrics

# Docker
CADVISOR_DOCKER_ONLY=false                # Monitor Docker only (default: false)
CADVISOR_DOCKER_TLS=false                 # Use Docker TLS (default: false)
```

---

## Admin & Storage

### pgAdmin (PostgreSQL Management)

```bash
PGADMIN_PORT=5050                         # Web UI port (default: 5050)
PGADMIN_DEFAULT_EMAIL=admin@admin.com     # Default admin email
PGADMIN_DEFAULT_PASSWORD=CHANGE_ME        # REQUIRED: Admin password

# Server Mode
PGADMIN_SERVER_MODE=False                 # Server mode (True/False, default: True)
PGADMIN_MASTER_PASSWORD_REQUIRED=False    # Require master password (default: True)

# Configuration
PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION=True # Enhanced cookies (default: True)
PGADMIN_CONFIG_CONSOLE_LOG_LEVEL=10       # Log level (10=DEBUG, 20=INFO, default: 20)
PGADMIN_CONFIG_MAX_LOGIN_ATTEMPTS=3       # Max login attempts (default: 3)

# Session
PGADMIN_SESSION_EXPIRATION=60             # Session expiry minutes (default: 60)
PGADMIN_SESSION_COOKIE_NAME=pga4_session  # Session cookie name

# Database
PGADMIN_CONFIG_SQLITE_PATH=/var/lib/pgadmin/pgadmin4.db # SQLite path
```

### MinIO (S3-Compatible Storage)

```bash
MINIO_API_PORT=9000                       # API port (default: 9000)
MINIO_CONSOLE_PORT=9001                   # Console UI port (default: 9001)
MINIO_ROOT_USER=admin                     # Root username (default: minioadmin)
MINIO_ROOT_PASSWORD=CHANGE_ME             # REQUIRED: Root password

# Storage
MINIO_STORAGE_CLASS_STANDARD=EC:2         # Standard storage class
MINIO_STORAGE_CLASS_RRS=EC:2              # Reduced redundancy storage

# Domain (for virtual-host-style requests)
MINIO_DOMAIN=                             # Domain name (optional)
MINIO_SERVER_URL=http://localhost:9000    # Server URL

# Console
MINIO_BROWSER=on                          # Enable browser (on/off, default: on)
MINIO_BROWSER_REDIRECT_URL=               # Browser redirect URL

# Compression
MINIO_COMPRESS_ENABLE=on                  # Enable compression (on/off, default: off)
MINIO_COMPRESS_EXTENSIONS=.txt,.csv,.json # Compression file extensions
MINIO_COMPRESS_MIME_TYPES=text/*,application/json # Compression MIME types

# Healing
MINIO_HEAL_ENABLED=on                     # Enable healing (on/off, default: on)
MINIO_HEAL_MAX_SLEEP=1s                   # Max heal sleep (default: 1s)
MINIO_HEAL_MAX_IO=100                     # Max heal I/O (default: 100)

# Logging
MINIO_LOG_QUERY_ENABLE=on                 # Log queries (on/off, default: off)

# Notifications (Webhooks)
MINIO_NOTIFY_WEBHOOK_ENABLE=off           # Enable webhook (on/off, default: off)
MINIO_NOTIFY_WEBHOOK_ENDPOINT=            # Webhook URL
MINIO_NOTIFY_WEBHOOK_AUTH_TOKEN=          # Webhook auth token
MINIO_NOTIFY_WEBHOOK_QUEUE_DIR=/tmp       # Webhook queue dir
MINIO_NOTIFY_WEBHOOK_QUEUE_LIMIT=100000   # Webhook queue limit

# KMS (Key Management)
MINIO_KMS_KES_ENDPOINT=                   # KES endpoint
MINIO_KMS_KES_KEY_NAME=                   # KES key name
MINIO_KMS_KES_CERT_FILE=                  # KES cert file
MINIO_KMS_KES_KEY_FILE=                   # KES key file
MINIO_KMS_KES_CA_PATH=                    # KES CA path
```

---

## Advanced Performance Tuning

### Neo4j (Graph Database)

```bash
NEO4J_PASSWORD=CHANGE_ME                  # REQUIRED: Neo4j password
NEO4J_HTTP_PORT=7474                      # HTTP port (default: 7474)
NEO4J_BOLT_PORT=7687                      # Bolt port (default: 7687)

# Memory (critical for performance)
NEO4J_HEAP_INITIAL_SIZE=1G                # Initial heap (default: 512M)
NEO4J_HEAP_MAX_SIZE=4G                    # Max heap (default: 1G)
NEO4J_PAGECACHE_SIZE=2G                   # Page cache (default: 512M)

# Transaction
NEO4J_TRANSACTION_TIMEOUT=180s            # Transaction timeout (default: 0 unlimited)
NEO4J_TRANSACTION_CONCURRENT_MAXIMUM=1000 # Max concurrent transactions (default: 1000)

# Query
NEO4J_CYPHER_PARSER_VERSION=default       # Parser version (default/3.5/4.4/5)
NEO4J_CYPHER_RUNTIME=slotted              # Runtime (slotted/interpreted/pipelined)
NEO4J_QUERY_CACHE_SIZE=1000               # Query cache size (default: 1000)

# Bolt
NEO4J_BOLT_THREAD_POOL_MIN_SIZE=5         # Min bolt threads (default: 5)
NEO4J_BOLT_THREAD_POOL_MAX_SIZE=400       # Max bolt threads (default: 400)

# Logging
NEO4J_LOG_LEVEL=INFO                      # Log level (DEBUG/INFO/WARN/ERROR)
NEO4J_QUERY_LOG_ENABLED=false             # Log queries (default: false)
NEO4J_QUERY_LOG_THRESHOLD=0               # Log slow queries ms (default: 0 all)

# Plugins
NEO4J_PLUGINS=["apoc", "graph-data-science"] # Plugins to install
NEO4J_APOC_EXPORT_FILE_ENABLED=true       # Enable APOC export (default: false)
NEO4J_APOC_IMPORT_FILE_ENABLED=true       # Enable APOC import (default: false)
```

### FalkorDB (Graph Database)

```bash
FALKORDB_PASSWORD=CHANGE_ME_OPTIONAL      # Password (optional)
FALKORDB_PORT=6380                        # Port (default: 6380)

# Memory
FALKORDB_MAXMEMORY=2gb                    # Max memory (default: 2gb)
FALKORDB_MAXMEMORY_POLICY=allkeys-lru     # Eviction policy (default: allkeys-lru)

# Cache
FALKORDB_CACHE_SIZE=25                    # Cache size % of max memory (default: 25)
FALKORDB_MAX_QUEUED_QUERIES=25            # Max queued queries (default: 25)

# Query
FALKORDB_QUERY_TIMEOUT=0                  # Query timeout ms (default: 0 unlimited)
FALKORDB_RESULT_SET_SIZE=10000            # Max result set size (default: 10000)
```

---

## Networking & Security

### General Network Settings

```bash
TIMEZONE=America/New_York                 # Timezone for all containers
DOCKER_SUBNET=172.20.0.0/16               # Docker network subnet
```

### Docker Network Configuration

```bash
# Network Names
DOCKER_NETWORK_MAIN=nyra-network          # Main application network
DOCKER_NETWORK_DATABASES=nyra-databases   # Database isolation network
DOCKER_NETWORK_MONITORING=nyra-monitoring # Monitoring network
DOCKER_NETWORK_OBSERVABILITY=nyra-observability # Observability network

# Network Driver
DOCKER_NETWORK_DRIVER=bridge              # Network driver (bridge/overlay/macvlan)

# Network Options
DOCKER_NETWORK_MTU=1500                   # MTU size (default: 1500)
DOCKER_NETWORK_ENABLE_IPV6=false          # Enable IPv6 (default: false)
```

### Security Settings

```bash
# Container Security
DOCKER_SECURITY_OPT=no-new-privileges     # Security options
DOCKER_READ_ONLY_ROOTFS=false             # Read-only root filesystem (default: false)
DOCKER_TMPFS=/tmp:rw,noexec,nosuid,size=2g # Tmpfs mounts

# User Namespace Remapping
DOCKER_USERNS_MODE=                       # User namespace mode (host/private)

# AppArmor/SELinux
DOCKER_SECURITY_APPARMOR=docker-default   # AppArmor profile
DOCKER_SECURITY_SELINUX=                  # SELinux label

# Secrets Management
DOCKER_SECRETS_PATH=/run/secrets          # Docker secrets path
```

### SSL/TLS Configuration

```bash
# Certificate Paths (for HTTPS)
SSL_CERT_PATH=/certs/cert.pem             # SSL certificate path
SSL_KEY_PATH=/certs/key.pem               # SSL key path
SSL_CA_PATH=/certs/ca.pem                 # CA certificate path

# Let's Encrypt
LETSENCRYPT_ENABLED=false                 # Enable Let's Encrypt (default: false)
LETSENCRYPT_EMAIL=admin@yourdomain.com    # Let's Encrypt email
LETSENCRYPT_STAGING=true                  # Use staging (default: true)
```

---

## Frontend Embeds & Public URLs

```bash
# API Gateway
NEXT_PUBLIC_NEXUS_URL=http://localhost:4000 # Nexus API gateway URL

# Dify Widget
NEXT_PUBLIC_DIFY_WIDGET_URL=http://localhost/embed.min.js # Dify embed script
NEXT_PUBLIC_DIFY_APP_ID=Paste_Your_App_UUID_Here # Dify app UUID
```

---

## Optional MCP Integrations

### GitHub MCP

```bash
GITHUB_TOKEN=                             # GitHub personal access token
GITHUB_API_URL=https://api.github.com     # GitHub API URL (default: public)
GITHUB_ENTERPRISE_URL=                    # GitHub Enterprise URL (if applicable)
```

### Docker Hub MCP

```bash
DOCKERHUB_USERNAME=                       # Docker Hub username
DOCKERHUB_TOKEN=                          # Docker Hub access token
```

---

## Quick Reference: Service Categories

### Essential Services (Always Required)
- PostgreSQL, Redis, MongoDB
- Infisical (if using secret management)
- Claude Flow or Archon (depending on your stack)

### Recommended for Production
- Prometheus + Grafana (monitoring)
- Loki (log aggregation)
- pgAdmin (database management)
- MinIO (object storage)

### Optional Enhancement Services
- Langfuse (LLM observability)
- cAdvisor (container metrics)
- Alert Manager (alerting)
- Neo4j/FalkorDB (graph capabilities)
- Gitea (local git server)
- n8n/Activepieces (workflow automation)

### Application-Specific
- Dify (if building conversational AI)
- Twenty CRM (if using CRM features)
- Quote API + Campaign Engine (for mortgage workflows)

---

## Resource Allocation Guidelines

### Minimum Production Specs (Per Service)

| Service | CPU | Memory | Storage |
|---------|-----|--------|---------|
| PostgreSQL | 2 cores | 4GB | 50GB |
| Redis | 1 core | 2GB | 10GB |
| MongoDB | 1 core | 2GB | 20GB |
| Claude Flow | 4 cores | 8GB | 10GB |
| Archon | 2 cores | 4GB | 10GB |
| Neo4j | 2 cores | 4GB | 20GB |
| Prometheus | 1 core | 2GB | 100GB |
| Grafana | 0.5 core | 1GB | 5GB |

### 4-PC Distributed Setup

```bash
# Orchestrator (Mini PC)
ORCHESTRATOR_ROLE=coordinator             # Role: coordinator
ORCHESTRATOR_CPU=8                        # CPU cores
ORCHESTRATOR_MEMORY=32GB                  # RAM

# Worker 1 (GPU PC)
WORKER1_ROLE=compute                      # Role: compute
WORKER1_GPU=NVIDIA RTX 4090               # GPU model
WORKER1_CPU=16                            # CPU cores
WORKER1_MEMORY=64GB                       # RAM

# Worker 2 (GPU PC)
WORKER2_ROLE=compute                      # Role: compute
WORKER2_GPU=NVIDIA RTX 4090               # GPU model
WORKER2_CPU=16                            # CPU cores
WORKER2_MEMORY=64GB                       # RAM

# Worker 3 (GPU PC)
WORKER3_ROLE=compute                      # Role: compute
WORKER3_GPU=NVIDIA RTX 4090               # GPU model
WORKER3_CPU=16                            # CPU cores
WORKER3_MEMORY=64GB                       # RAM
```

---

## Usage Examples

### Development Environment
```bash
# Minimal .env for development
NODE_ENV=development
POSTGRES_PASSWORD=dev_password_123
REDIS_PASSWORD=dev_password_123
MONGO_ROOT_PASSWORD=dev_password_123
ANTHROPIC_API_KEY=sk-ant-your-key
```

### Staging Environment
```bash
# .env for staging (includes monitoring)
NODE_ENV=staging
# ... (copy from .env.example and set CHANGE_ME values)
PROMETHEUS_RETENTION_TIME=30d
GRAFANA_AUTH_ANONYMOUS_ENABLED=true
LOKI_RETENTION_PERIOD=720h
```

### Production Environment
```bash
# .env for production (all security hardened)
NODE_ENV=production
# ... (use strong passwords for all CHANGE_ME values)
POSTGRES_MAX_CONNECTIONS=500
REDIS_MAXMEMORY=8gb
NEO4J_HEAP_MAX_SIZE=8G
CLAUDE_FLOW_MAX_AGENTS=20
# Enable all monitoring
PROMETHEUS_ENABLED=true
GRAFANA_ENABLED=true
LOKI_ENABLED=true
LANGFUSE_ENABLED=true
```

---

## Links & Documentation

- **Infisical**: https://infisical.com/docs
- **Claude Flow**: https://github.com/ruvnet/claude-flow
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/docs/
- **MongoDB**: https://www.mongodb.com/docs/
- **Neo4j**: https://neo4j.com/docs/
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/
- **Loki**: https://grafana.com/docs/loki/latest/
- **MinIO**: https://min.io/docs/
- **Dify**: https://docs.dify.ai/
- **n8n**: https://docs.n8n.io/
- **Langfuse**: https://langfuse.com/docs

---

**Last Updated**: 2026-01-15
**Maintainer**: Project Nyra DevOps Team
**Related**: `.env.example` (minimal setup), `docker-compose.yml` (service definitions)
