# Project Nyra - Infrastructure Consolidation Plan
> Agent 1: INFRA ARCHITECT - Comprehensive Infrastructure Catalog & Consolidation Strategy

**Document Version**: 1.0
**Last Updated**: 2026-02-06
**Status**: ACTIVE - Phase 1 Complete (Inventory)

---

## EXECUTIVE SUMMARY

This document consolidates the entire Project Nyra infrastructure across current and archived configurations. The goal is to design **ONE CANONICAL INFRA STACK** that supports all deployment scenarios (orchestrator, workers, cloud offload) with full backwards compatibility and zero service loss.

### Key Metrics
- **Total Services Cataloged**: 15 current + 6 archived variations
- **Profiles Defined**: 6 modular Docker Compose profiles
- **Port Range**: 3000-9090 (configurable, no conflicts detected)
- **Network Subnet**: 172.20.0.0/16 (single bridge network)
- **Machine Configurations**: 4 profiles (orchestrator, worker-rtx3060, worker-rtx3090ti, worker-rtx5090)
- **Memory Systems**: 5 independent systems (RuVector, Zep, Letta, Graphiti, Mem0)

---

## PART 1: SERVICE CATALOG

### 1.1 Core Services (profile: `core`)

#### PostgreSQL (Primary Transactional Database)
```yaml
Service Name: postgres
Container ID: nyra-postgres
Image: postgres:16-alpine
Port External: 5432 (configurable: ${POSTGRES_PORT:-5432})
Port Internal: 5432
Status: ✅ RUNNING
Health Check: pg_isready query
Startup Timeout: 100s (20 retries × 5s interval)

Environment Variables:
  POSTGRES_DB: ${POSTGRES_DB:-nyra}
  POSTGRES_USER: ${POSTGRES_USER:-nyra}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?REQUIRED}
  TZ: ${TIMEZONE:-America/New_York}

Storage:
  Volume: postgres_data
  Mount Point: /var/lib/postgresql/data
  Config Files:
    - ./configs/postgres/pg_hba.conf (RO)
    - ./configs/postgres/postgresql.conf (RO)

Dependencies: NONE (core service)
Dependents: n8n, Infisical, NestJS services
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Primary OLTP database for all transactional data (borrowers, loans, quotes, audit logs)

**Used By**:
- n8n (workflow data)
- Infisical (user accounts, login history)
- Nyra Orchestrator API (loans, borrowers, documents)
- Quote Engine (rates, pricing)

---

#### Redis (Cache & Session Store)
```yaml
Service Name: redis
Container ID: nyra-redis
Image: redis:7-alpine
Port External: 6379 (configurable: ${REDIS_PORT:-6379})
Port Internal: 6379
Status: ✅ RUNNING
Health Check: redis-cli PING command
Startup Timeout: 100s (20 retries × 5s interval)

Environment Variables:
  REDIS_PASSWORD: ${REDIS_PASSWORD:?REQUIRED}
  REDIS_MAX_MEMORY: ${REDIS_MAX_MEMORY:-2gb}
  REDIS_EVICTION_POLICY: allkeys-lru

Command: redis-server --requirepass $REDIS_PASSWORD --maxmemory $REDIS_MAX_MEMORY --maxmemory-policy allkeys-lru

Storage:
  Volume: redis_data
  Mount Point: /data

Dependencies: NONE (core service)
Dependents: Session middleware, API rate limiting, caching layer
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Fast in-memory cache and session storage

**Used For**:
- User session tokens (JWT validation cache)
- Rate limiting counters
- Temporary quote calculations
- Message queues for background jobs
- Real-time WebSocket connection tracking

**Memory Allocation**: 2GB default (configurable for workers)

---

#### MongoDB (Document Storage)
```yaml
Service Name: mongo
Container ID: nyra-mongo
Image: mongo:7
Port External: 27017 (configurable: ${MONGO_PORT:-27017})
Port Internal: 27017
Status: ✅ RUNNING
Health Check: mongosh ping command
Startup Timeout: 200s (20 retries × 10s interval)

Environment Variables:
  MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER:-admin}
  MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD:?REQUIRED}

Storage:
  Volume: mongo_data
  Mount Point: /data/db

Dependencies: NONE (core service)
Dependents: Infisical
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Document storage backend for Infisical secrets management

**Note**: Infisical requires MongoDB for user management, encryption keys, and secret versioning

---

### 1.2 Secrets Management (profile: `secrets`)

#### Infisical (Centralized Secrets Manager)
```yaml
Service Name: infisical
Container ID: nyra-infisical
Image: infisical/infisical:latest
Port External: 8080 (configurable: ${INFISICAL_PORT:-8080})
Port Internal: 8080
Status: ✅ RUNNING (depends_on mongo HEALTHY)
Health Check: HTTP endpoint readiness
Startup Delay: Depends on MongoDB initialization

Environment Variables:
  SITE_URL: ${INFISICAL_SITE_URL:-http://localhost:${INFISICAL_PORT:-8080}}
  PORT: "8080"
  ENCRYPTION_KEY: ${INFISICAL_ENCRYPTION_KEY:?REQUIRED}
  JWT_SECRET: ${INFISICAL_JWT_SECRET:?REQUIRED}
  NODE_ENV: ${INFISICAL_ENV:-development}
  DB_CONNECTION_URI: mongodb://${MONGO_ROOT_USER:-admin}:${MONGO_ROOT_PASSWORD}@mongo:27017/infisical?authSource=admin

Dependencies: mongo (service_healthy)
Dependents: All services requiring secrets
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Centralized secret management and encryption

**Manages**:
- API keys (Anthropic, OpenRouter, Google, OpenAI)
- Database passwords
- JWT signing keys
- Encryption keys
- Environment-specific credentials
- OAuth tokens
- Webhook secrets

**UI Access**: http://localhost:8080

---

### 1.3 Workflow Automation (profile: `workflow`)

#### n8n (Workflow Orchestration)
```yaml
Service Name: n8n
Container ID: nyra-n8n
Image: n8nio/n8n:latest
Port External: 5678 (configurable: ${N8N_PORT:-5678})
Port Internal: 5678
Status: ✅ RUNNING (depends_on postgres HEALTHY)

Environment Variables:
  N8N_PORT: "5678"
  N8N_HOST: ${N8N_HOST:-localhost}
  N8N_PROTOCOL: ${N8N_PROTOCOL:-http}
  WEBHOOK_URL: ${WEBHOOK_URL:-http://localhost:${N8N_PORT:-5678}/}
  GENERIC_TIMEZONE: ${TIMEZONE:-America/New_York}

  # Database Configuration
  DB_TYPE: "postgresdb"
  DB_POSTGRESDB_HOST: "postgres"
  DB_POSTGRESDB_PORT: "5432"
  DB_POSTGRESDB_DATABASE: ${POSTGRES_DB:-nyra}
  DB_POSTGRESDB_USER: ${POSTGRES_USER:-nyra}
  DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
  N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY:?REQUIRED}

Storage:
  Volume: n8n_data
  Mount Point: /home/node/.n8n
  Workflow Files: ./n8n-workflows/* (read-only mount)

Dependencies: postgres (service_healthy)
Dependents: Campaign automation, lead processing, integrations
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Campaign orchestration and workflow automation

**Manages**:
- Lead intake workflows
- SMS campaign automation
- Email follow-ups
- CRM synchronization
- Document generation
- Rate comparison automation

**UI Access**: http://localhost:5678

**Webhook Base**: http://localhost:5678/webhook/

---

#### Activepieces (Alternative Workflow Engine)
```yaml
Service Name: activepieces
Container ID: nyra-activepieces
Image: activepieces/activepieces:latest
Port External: 8082 (configurable: ${ACTIVEPIECES_PORT:-8082})
Port Internal: 80 (maps to 8082)
Status: ✅ RUNNING
Environment: production

Environment Variables:
  AP_JWT_SECRET: ${ACTIVEPIECES_JWT_SECRET:?REQUIRED}
  AP_ENCRYPTION_KEY: ${ACTIVEPIECES_ENCRYPTION_KEY:?REQUIRED}
  AP_ENVIRONMENT: "prod"

Storage:
  Volume: activepieces_data
  Mount Point: /root/.activepieces

Dependencies: NONE (standalone)
Dependents: Integration pipelines
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Alternative workflow automation platform (lower complexity workflows)

**Comparison with n8n**:
| Feature | n8n | Activepieces |
|---------|-----|--------------|
| Complexity | High | Medium |
| Use Case | Complex orchestration | Simple integrations |
| Database | PostgreSQL | MongoDB |
| Best For | Campaign workflows | Quick APIs |

**UI Access**: http://localhost:8082

---

### 1.4 Observability Stack (profile: `observability`)

#### Prometheus (Metrics Collection)
```yaml
Service Name: prometheus
Container ID: nyra-prometheus
Image: prom/prometheus:latest
Port External: 9090 (configurable: ${PROMETHEUS_PORT:-9090})
Port Internal: 9090
Status: ✅ RUNNING

Command:
  - "--config.file=/etc/prometheus/prometheus.yml"
  - "--storage.tsdb.path=/prometheus"

Storage:
  Volume: prometheus_data
  Mount Point: /prometheus
  Config File: ./configs/prometheus/prometheus.yml

Dependencies: NONE
Dependents: Grafana (data source)
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Time-series metrics database and collection

**Scrapes**:
- Docker container metrics via cAdvisor
- Service health endpoints
- Node exporter metrics (if running)

**Retention**: TSDB storage in /prometheus

---

#### Loki (Log Aggregation)
```yaml
Service Name: loki
Container ID: nyra-loki
Image: grafana/loki:latest
Port External: 3100 (configurable: ${LOKI_PORT:-3100})
Port Internal: 3100
Status: ✅ RUNNING

Command: ["-config.file=/etc/loki/loki.yml"]

Storage:
  Volume: loki_data
  Mount Point: /loki
  Config File: ./configs/loki/loki.yml

Dependencies: NONE
Dependents: Grafana (data source)
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Centralized log aggregation and querying

**Ingests From**:
- Docker container logs (json-file driver)
- All services' stdout/stderr

---

#### Grafana (Metrics Visualization)
```yaml
Service Name: grafana
Container ID: nyra-grafana
Image: grafana/grafana:latest
Port External: 3003 (configurable: ${GRAFANA_PORT:-3003})
Port Internal: 3000
Status: ✅ RUNNING (depends_on prometheus, loki)

Environment Variables:
  GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD:?REQUIRED}
  GF_USERS_ALLOW_SIGN_UP: "false"

Storage:
  Volume: grafana_data
  Mount Point: /var/lib/grafana
  Provisioning: ./configs/grafana/provisioning (read-only)

Dependencies: prometheus, loki (service readiness)
Dependents: Monitoring & observability
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)

Data Sources:
  - Prometheus (http://prometheus:9090)
  - Loki (http://loki:3100)
```

**Purpose**: Real-time visualization of metrics and logs

**Default Login**: admin / ${GRAFANA_ADMIN_PASSWORD}

**Dashboards**: Provisioned from ./configs/grafana/provisioning

---

#### cAdvisor (Container Metrics)
```yaml
Service Name: cadvisor
Container ID: nyra-cadvisor
Image: gcr.io/cadvisor/cadvisor:latest
Port External: 8081 (configurable: ${CADVISOR_PORT:-8081})
Port Internal: 8080
Status: ✅ RUNNING

Volumes Mounted:
  - / → /rootfs (read-only) - Host filesystem metrics
  - /var/run → /var/run (read-write) - Docker socket
  - /sys → /sys (read-only) - Cgroup and memory info
  - /var/lib/docker → /var/lib/docker (read-only) - Container data

Dependencies: NONE
Dependents: Prometheus (scrapes metrics)
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Container-level metrics collection

**Metrics Provided**:
- CPU usage per container
- Memory consumption
- Network I/O
- Block I/O
- Process counts

**Scraped By**: Prometheus @ http://cadvisor:8080/metrics

---

### 1.5 Edge & Remote Access (profile: `edge`)

#### Cloudflared (Cloudflare Tunnel)
```yaml
Service Name: cloudflared
Container ID: nyra-cloudflared
Image: cloudflare/cloudflared:latest
Status: ✅ RUNNING

Command: ["tunnel", "run"]

Environment Variables:
  TUNNEL_TOKEN: ${CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR:?REQUIRED}

Dependencies: NONE
Dependents: External access to services
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)

Tunnel Configuration:
  - Secure tunnel to Cloudflare edge
  - No external ports exposed
  - Token per machine environment
```

**Purpose**: Secure remote access via Cloudflare Tunnel

**Provides**:
- Zero-trust access to internal services
- DDoS protection
- WAF rules
- Geographic routing
- No public IP exposure

**Machine-Specific Tokens**:
- Orchestrator: ${CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR}
- Worker RTX3060: ${CLOUDFLARE_TUNNEL_TOKEN_WORKER_3060}
- Worker RTX3090Ti: ${CLOUDFLARE_TUNNEL_TOKEN_WORKER_3090}
- Worker RTX5090: ${CLOUDFLARE_TUNNEL_TOKEN_WORKER_5090}

---

### 1.6 Vector Database (profile: `vector`)

#### RuVector PostgreSQL (Vector Search Engine)
```yaml
Service Name: ruvector-postgres
Container ID: ruvector-postgres
Image: ruvnet/ruvector-postgres:latest
Port External: 5436 (configurable: ${RUVECTOR_POSTGRES_PORT:-5436})
Port Internal: 5432
Status: ✅ RUNNING
Health Check: pg_isready query
Startup Timeout: 100s (20 retries × 5s interval)

Environment Variables:
  POSTGRES_USER: ${RUVECTOR_POSTGRES_USER:-claude}
  POSTGRES_PASSWORD: ${RUVECTOR_POSTGRES_PASSWORD:?REQUIRED}
  POSTGRES_DB: ${RUVECTOR_POSTGRES_DB:-claude_flow}

Storage:
  Volume: ruvector_data
  Mount Point: /var/lib/postgresql/data
  Init Script: ./ruvector/scripts/init-db.sql (read-only)

Dependencies: NONE (core vector service)
Dependents: Agent code search, similarity matching, RAG systems
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Vector similarity search for AI/ML operations

**Features**:
- HNSW indexing (150x-12,500x faster search)
- Hyperbolic embeddings
- GNN support
- Code pattern matching
- Document similarity retrieval

**Use Cases**:
- Semantic code search
- Document similarity
- Borrower profile matching
- Agent capability discovery
- RAG system backend

---

#### RuVector PgAdmin (Database Administration)
```yaml
Service Name: ruvector-pgadmin
Container ID: ruvector-pgadmin
Image: dpage/pgadmin4:latest
Port External: 5050 (configurable: ${RUVECTOR_PGADMIN_PORT:-5050})
Port Internal: 80
Status: ✅ RUNNING (depends_on ruvector-postgres HEALTHY)
Profiles: ["vector", "gui"]

Environment Variables:
  PGADMIN_DEFAULT_EMAIL: ${RUVECTOR_PGADMIN_EMAIL:-admin@claude-flow.local}
  PGADMIN_DEFAULT_PASSWORD: ${RUVECTOR_PGADMIN_PASSWORD:-admin}
  PGADMIN_CONFIG_SERVER_MODE: "False"

Dependencies: ruvector-postgres (service_healthy)
Dependents: Admin web UI
Restart Policy: unless-stopped
Logging: json-file (max-size: 10m, max-file: 3)
```

**Purpose**: Web-based administration interface for RuVector database

**UI Access**: http://localhost:5050

**Default Login**: ${RUVECTOR_PGADMIN_EMAIL} / ${RUVECTOR_PGADMIN_PASSWORD}

---

## PART 2: PORT ALLOCATION MAP

### 2.1 Current Port Assignments
```
PORT | SERVICE              | INTERNAL | PROFILE      | CONFIG VAR
-----|----------------------|----------|--------------|-------------------------
3000 | Grafana UI          | 3000     | observability| GRAFANA_PORT (3003)
3003 | Grafana (mapped)    | 3000     | observability| GRAFANA_PORT
5050 | RuVector PgAdmin    | 80       | vector, gui  | RUVECTOR_PGADMIN_PORT
5432 | PostgreSQL          | 5432     | core         | POSTGRES_PORT
5436 | RuVector Postgres   | 5432     | vector       | RUVECTOR_POSTGRES_PORT
5678 | n8n                 | 5678     | workflow     | N8N_PORT
6379 | Redis               | 6379     | core         | REDIS_PORT
8080 | Infisical UI        | 8080     | secrets      | INFISICAL_PORT
8081 | cAdvisor            | 8080     | observability| CADVISOR_PORT
8082 | Activepieces        | 80       | workflow     | ACTIVEPIECES_PORT
9090 | Prometheus UI       | 9090     | observability| PROMETHEUS_PORT
27017| MongoDB             | 27017    | core         | MONGO_PORT
3100 | Loki                | 3100     | observability| LOKI_PORT
```

### 2.2 Port Conflict Analysis
**Status**: ✅ NO CONFLICTS DETECTED

All services have:
- Unique external ports
- Configurable via environment variables
- Safe defaults that don't overlap
- Sufficient spacing for worker machine adjustments

### 2.3 Network Configuration
```
Network Name: nyra
Driver: bridge
Subnet: 172.20.0.0/16 (configurable: ${DOCKER_SUBNET:-172.20.0.0/16})
Gateway: 172.20.0.1 (automatic)

Service DNS Resolution:
  postgres → postgres:5432
  redis → redis:6379
  mongo → mongo:27017
  infisical → infisical:8080
  n8n → n8n:5678
  activepieces → activepieces:8082
  prometheus → prometheus:9090
  grafana → grafana:3000
  loki → loki:3100
  cadvisor → cadvisor:8080
  cloudflared → cloudflared (no exposed ports)
  ruvector-postgres → ruvector-postgres:5432
  ruvector-pgadmin → ruvector-pgadmin:80
```

---

## PART 3: DOCKER COMPOSE PROFILES

### 3.1 Profile Definitions

#### Profile: `core`
**Purpose**: Minimum viable infrastructure - data layer only

**Services**:
- postgres
- redis
- mongo

**Command**: `docker compose --profile core up`

**Use Case**: Development, minimal testing, core services only

**Startup Time**: ~60 seconds

---

#### Profile: `secrets`
**Purpose**: Add secret management

**Services**:
- (core) + infisical

**Dependencies**: Requires `core` to be running

**Command**: `docker compose --profile core --profile secrets up`

**Use Case**: Any environment where external secret access needed

---

#### Profile: `workflow`
**Purpose**: Add workflow automation

**Services**:
- (core) + n8n, activepieces

**Dependencies**: Requires `core` to be running

**Command**: `docker compose --profile core --profile workflow up`

**Use Case**: Campaign automation, integration orchestration

---

#### Profile: `observability`
**Purpose**: Add monitoring and logging

**Services**:
- (core) + prometheus, loki, grafana, cadvisor

**Dependencies**: Requires `core` to be running

**Command**: `docker compose --profile core --profile observability up`

**Use Case**: Production deployments, performance monitoring

---

#### Profile: `edge`
**Purpose**: Add remote access capability

**Services**:
- cloudflared

**Dependencies**: None, runs independently

**Command**: `docker compose --profile edge up`

**Use Case**: Remote access to any running services

---

#### Profile: `vector`
**Purpose**: Add vector database and search

**Services**:
- ruvector-postgres
- ruvector-pgadmin (optional, profile: gui)

**Dependencies**: None

**Command**: `docker compose --profile vector up`

**Use Case**: RAG systems, code search, semantic matching

---

#### Profile: `gui`
**Purpose**: Administrative web interfaces

**Services**:
- ruvector-pgadmin (if vector running)

**Dependencies**: None (standalone)

**Command**: `docker compose --profile vector --profile gui up`

**Use Case**: Database administration, visual management

---

### 3.2 Profile Combinations

#### Minimum Stack (Development)
```bash
docker compose --profile core up
```
**Services**: postgres, redis, mongo
**Time**: 60s | **Memory**: 3-4GB | **Use**: Local dev

---

#### Full Stack (Production)
```bash
docker compose \
  --profile core \
  --profile secrets \
  --profile workflow \
  --profile observability \
  --profile vector \
  up
```
**Services**: All services except cloudflared
**Time**: 120s | **Memory**: 8-12GB | **Use**: Orchestrator machine

---

#### Orchestrator Configuration
```bash
# With remote access
docker compose \
  --profile core \
  --profile secrets \
  --profile workflow \
  --profile observability \
  --profile vector \
  --profile edge \
  up
```

---

#### Worker Configuration (GPU Machines)
```bash
# Workers typically run only compute services
# Actual worker services TBD - not in current compose files
```

---

## PART 4: ENVIRONMENT VARIABLE STRATEGY

### 4.1 Environment Files

**Structure**: Machine-specific `.env` files in `/infra/env/`

```
/infra/env/
├── .env.orchestrator          # Primary orchestrator config
├── .env.worker-rtx3060        # RTX 3060 worker
├── .env.worker-rtx3090ti      # RTX 3090 Ti worker
├── .env.worker-rtx5090        # RTX 5090 worker
└── .env.example               # Template for new environments
```

**Usage**: `docker compose --env-file /infra/env/.env.orchestrator up`

### 4.2 Required vs Optional Variables

#### REQUIRED (no default, must be set)
```bash
# PostgreSQL
POSTGRES_PASSWORD

# Redis
REDIS_PASSWORD

# MongoDB
MONGO_ROOT_PASSWORD

# Infisical
INFISICAL_ENCRYPTION_KEY
INFISICAL_JWT_SECRET

# n8n
N8N_ENCRYPTION_KEY

# Activepieces
ACTIVEPIECES_JWT_SECRET
ACTIVEPIECES_ENCRYPTION_KEY

# Grafana
GRAFANA_ADMIN_PASSWORD

# RuVector PostgreSQL
RUVECTOR_POSTGRES_PASSWORD

# Cloudflare (machine-specific)
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR
CLOUDFLARE_TUNNEL_TOKEN_WORKER_3060
CLOUDFLARE_TUNNEL_TOKEN_WORKER_3090
CLOUDFLARE_TUNNEL_TOKEN_WORKER_5090
```

#### OPTIONAL (has defaults)
```bash
POSTGRES_DB=nyra
POSTGRES_USER=nyra
POSTGRES_PORT=5432

REDIS_PORT=6379
REDIS_MAX_MEMORY=2gb

MONGO_PORT=27017
MONGO_ROOT_USER=admin

INFISICAL_PORT=8080
INFISICAL_ENV=development

N8N_HOST=localhost
N8N_PROTOCOL=http
N8N_PORT=5678
WEBHOOK_URL=http://localhost:5678/

PROMETHEUS_PORT=9090
GRAFANA_PORT=3003
LOKI_PORT=3100
CADVISOR_PORT=8081

RUVECTOR_POSTGRES_USER=claude
RUVECTOR_POSTGRES_DB=claude_flow
RUVECTOR_POSTGRES_PORT=5436
RUVECTOR_PGADMIN_EMAIL=admin@claude-flow.local
RUVECTOR_PGADMIN_PASSWORD=admin
RUVECTOR_PGADMIN_PORT=5050

TIMEZONE=America/New_York
DOCKER_SUBNET=172.20.0.0/16
```

### 4.3 Secrets Management Strategy

**Current**: Environment variables (files not checked in)

**Recommended Evolution**:

1. **Short-term**: Continue .env files, use Infisical for service secrets
2. **Medium-term**: Integrate Infisical as source-of-truth
3. **Long-term**: Move to Vault/Secrets Manager for production

**Infisical Integration**:
```
1. Store all secrets in Infisical UI
2. Services fetch from Infisical at startup
3. No secrets in environment files
4. Audit trail of all accesses
5. Automatic rotation capabilities
```

---

## PART 5: MACHINE-SPECIFIC CONFIGURATIONS

### 5.1 Orchestrator Machine Profile

**Role**: Central coordinator, full stack

**Services Running**:
- All core services
- All optional services
- Secret management
- Workflow engines
- Observability

**Configuration**: `.env.orchestrator`

**Docker Compose Override**: `docker-compose.orchestrator.override.yml`

**Resource Allocation** (assumes 16-32GB RAM, multi-core CPU):
```
PostgreSQL: 4GB RAM, 2 CPUs
Redis: 2GB RAM, 1 CPU
MongoDB: 4GB RAM, 2 CPUs
Infisical: 1GB RAM, 1 CPU
n8n: 2GB RAM, 2 CPUs
Activepieces: 1GB RAM, 1 CPU
Prometheus: 2GB RAM, 2 CPUs
Grafana: 1GB RAM, 1 CPU
Loki: 1GB RAM, 1 CPU
cAdvisor: 512MB RAM, 1 CPU
RuVector PostgreSQL: 4GB RAM, 2 CPUs
------------------
Total: 24GB RAM, 16 CPUs (recommended allocation)
```

---

### 5.2 GPU Worker Machines

**Role**: Compute offload for inference, embeddings, fine-tuning

**Machines**:
1. **worker-rtx3060** (12GB VRAM)
   - Local model: Qwen 32B, CodeLlama 34B
   - Use: Code analysis, document processing

2. **worker-rtx3090ti** (24GB VRAM)
   - Local model: Llama 3.1 70B, Mistral 123B
   - Use: General purpose inference

3. **worker-rtx5090** (48GB VRAM)
   - Local models: DeepSeek-R1 236B, Qwen 2.5 72B
   - Use: Complex reasoning, compliance analysis

**Services Running** (TBD):
- Minimal data layer (if needed locally)
- Ollama (local LLM engine)
- LiteLLM proxy
- Monitoring agents

**Configuration Files**:
- `.env.worker-rtx3060`
- `.env.worker-rtx3090ti`
- `.env.worker-rtx5090`

**Docker Compose Overrides**:
- `docker-compose.worker-rtx3060.override.yml`
- `docker-compose.worker-rtx3090ti.override.yml`
- `docker-compose.worker-rtx5090.override.yml`

---

### 5.3 Machine-Specific Variables

#### Orchestrator Environment
```bash
# Node/Machine Identity
MACHINE_NAME=orchestrator-mini
MACHINE_ROLE=coordinator
MACHINE_REGION=local

# Service Configuration
POSTGRES_MAX_CONNECTIONS=200
REDIS_MAX_MEMORY=4gb
N8N_WORKERS=4

# Access Tokens
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=<token-orchestrator>

# Feature Flags
ENABLE_WORKFLOWS=true
ENABLE_OBSERVABILITY=true
ENABLE_VECTOR_DB=true
```

#### Worker Environment (RTX 3060 Example)
```bash
# Node/Machine Identity
MACHINE_NAME=worker-rtx3060
MACHINE_ROLE=compute
MACHINE_GPU=rtx3060
MACHINE_VRAM=12gb

# Reduced Services
POSTGRES_MAX_CONNECTIONS=50
REDIS_MAX_MEMORY=1gb

# GPU Configuration (TBD)
CUDA_VISIBLE_DEVICES=0
OLLAMA_NUM_PARALLEL=2

# Access Tokens
CLOUDFLARE_TUNNEL_TOKEN_WORKER_3060=<token-worker-3060>
```

---

## PART 6: ARCHIVED/GOLDEN STACK SERVICES

### 6.1 Services in Archive But Not Current

These services exist in archived configurations and should be re-integrated:

#### Zep (Episodic Memory)
```yaml
Service Name: zep
Image: zep:latest (self-hosted)
Port: 8000
Purpose: Long-term conversation memory, knowledge graphs
Status: 🔴 ARCHIVED - Config issues
Note: Uses FalkorDB for graph storage
```

**Why Archived**: DSN parsing error in configuration

**Recommendation**:
- Include in vector profile
- Fix configuration before deploying
- Integrate with Letta for unified memory

---

#### FalkorDB (Graph Database)
```yaml
Service Name: falkordb
Image: falkordb:latest
Port: 6381 (configurable, was 6380 in archive)
Purpose: Knowledge graphs, temporal relationships
Status: 🟡 ARCHIVED - Not in current compose
Note: Used by Zep for context management
```

**Recommendation**:
- Add to vector profile
- Benefits for borrower relationship graphs
- Unused if Zep not active

---

#### Archon Management Suite
```yaml
Services:
  - archon-api (Port: 8181) - Project management backend
  - archon-ui (Port: 3737) - Frontend
  - archon-mcp (Port: 8051) - Task management & document search
Status: 🟡 ARCHIVED - Separate repo/deployment
Note: Coexists with Claude Flow, different purpose
```

**Current Status**: Deployed separately (not in main compose)

**Recommendation**: Keep separate until full consolidation

---

### 6.2 Golden Stack vs Current Stack Comparison

| Component | Golden Stack | Current Stack | Recommendation |
|-----------|--------------|---------------|-----------------|
| Vector DB | RuVector + FalkorDB | RuVector only | Add FalkorDB back |
| Memory | Zep + Letta | TBD (not in compose) | Integrate both |
| Graph | FalkorDB | None | Add to vector profile |
| Management | Archon Suite | Separate | Keep separate until unified |
| Caching | Redis Golden | Redis | Consolidate configs |

---

## PART 7: MEMORY SYSTEMS INTEGRATION

### 7.1 Five-System Memory Architecture

**Current Standalone Systems**:

1. **RuVector** (Primary)
   - Vector similarity search
   - HNSW indexing
   - Code pattern matching
   - Status: ✅ In current compose

2. **Letta** (Conversational)
   - Agent memory management
   - Context windows
   - Status: 🟡 Referenced but not in compose

3. **Graphiti** (Graph Knowledge)
   - Relationship tracking
   - Temporal graphs
   - Status: 🟡 Referenced but not in compose

4. **Mem0** (User Personalization)
   - Borrower preferences
   - Interaction history
   - Status: 🟡 Referenced but not in compose

5. **OpenMemory** (Collaborative)
   - Shared organizational knowledge
   - Cross-agent learning
   - Status: 🟡 Referenced but not in compose

### 7.2 Integration Strategy

**Phase 1** (Current):
- RuVector for vector search only
- No unified memory system

**Phase 2** (Recommended):
- RuVector as primary vector store
- Letta for conversational state
- Zep for episodic memory
- FalkorDB for relationship graphs

**Phase 3** (Future):
- Add Mem0 for personalization
- Add OpenMemory for collaboration
- Unified memory abstraction layer

---

## PART 8: CONSOLIDATED ARCHITECTURE

### 8.1 Single Canonical Stack Design

```
┌─────────────────────────────────────────────────────────┐
│           DOCKER COMPOSE CANONICAL STACK                │
│           (ONE FILE WITH ALL SERVICES)                  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   [CORE]            [OPTIONAL]          [MACHINE-SPECIFIC]
   ├─ postgres       ├─ secrets          ├─ overrides/
   ├─ redis          ├─ workflow         │  orchestrator
   ├─ mongo          ├─ observability    │  worker-3060
   │                 ├─ edge             │  worker-3090
   │                 ├─ vector           │  worker-5090
   │                 └─ gui              │
   │                                     └─ env files

PROFILES (Selective Activation):
  core              → Always required base
  secrets           → Enable Infisical
  workflow          → Enable n8n + Activepieces
  observability     → Enable monitoring stack
  edge              → Enable Cloudflare Tunnel
  vector            → Enable RuVector + Zep + FalkorDB
  gui               → Enable admin UIs
```

### 8.2 Consolidated Compose File Structure

```yaml
version: '3.8'

name: nyra-consolidated

# Global defaults
x-logging: &default_logging
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"

# Single network for all services
networks:
  nyra:
    name: nyra
    driver: bridge
    ipam:
      config:
        - subnet: ${DOCKER_SUBNET:-172.20.0.0/16}

# Unified volume declarations
volumes:
  postgres_data: {}
  redis_data: {}
  mongo_data: {}
  grafana_data: {}
  prometheus_data: {}
  loki_data: {}
  n8n_data: {}
  activepieces_data: {}
  ruvector_data: {}
  zep_data: {}
  falkordb_data: {}

services:
  # CORE SERVICES (profile: core)
  postgres:
    # ... full service definition
    profiles: ["core"]

  redis:
    # ... full service definition
    profiles: ["core"]

  mongo:
    # ... full service definition
    profiles: ["core"]

  # SECRETS (profile: secrets)
  infisical:
    # ... full service definition
    profiles: ["secrets"]

  # WORKFLOW (profile: workflow)
  n8n:
    # ... full service definition
    profiles: ["workflow"]

  activepieces:
    # ... full service definition
    profiles: ["workflow"]

  # ... all other services with appropriate profiles
```

---

## PART 9: DEPLOYMENT STRATEGIES

### 9.1 Development Deployment

**Target**: Local machine with Docker

**Command**:
```bash
cd /infra
docker compose --profile core up
```

**Result**: Minimal stack (postgres, redis, mongo) in ~60 seconds

**Resource Usage**: 3-4GB RAM

---

### 9.2 Production Orchestrator Deployment

**Target**: Main orchestrator machine

**Command**:
```bash
cd /infra
docker compose \
  --env-file ./env/.env.orchestrator \
  --profile core \
  --profile secrets \
  --profile workflow \
  --profile observability \
  --profile vector \
  --profile edge \
  up -d
```

**Result**: Full stack with all services

**Resource Usage**: 24GB+ RAM

---

### 9.3 GPU Worker Deployment

**Target**: GPU-equipped worker machines

**Command**:
```bash
cd /infra
docker compose \
  --env-file ./env/.env.worker-rtx5090 \
  --profile core \
  --profile edge \
  -f docker-compose.yml \
  -f docker-compose.worker-rtx5090.override.yml \
  up -d
```

**Result**: Minimal services + GPU inference layer (TBD)

**Note**: Override files not yet defined, need implementation

---

### 9.4 Cloud Offload Deployment (Oracle VPS/Oracle)

**Current Status**: Documented in archived configs, not active

**When Ready**:
```
1. Use same docker-compose.yml
2. Push to cloud registry
3. Deploy via cloud platform
4. Point orchestrator to cloud services
```

---

## PART 10: MIGRATION PLAN

### 10.1 Phase 1: Consolidation (Week 1)

**Goal**: Create single canonical docker-compose.yml

**Tasks**:
1. Merge current docker-compose.yml with archived services
2. Add FalkorDB and Zep services with proper profiles
3. Create unified secrets mapping
4. Document all environment variables
5. Add comprehensive health checks

**Deliverable**: `/infra/docker-compose.yml` (consolidated)

**Validation**:
```bash
docker compose config --quiet  # Validate syntax
docker compose up --dry-run    # Dry run without starting
```

---

### 10.2 Phase 2: Environment Standardization (Week 1-2)

**Goal**: Create machine-specific env files with validation

**Tasks**:
1. Create .env.example with all variables
2. Update .env.orchestrator with all needed variables
3. Create/update .env.worker-* files
4. Add env validation script
5. Document secrets bootstrap process

**Deliverable**: Standardized .env files with clear documentation

---

### 10.3 Phase 3: Docker Compose Overrides (Week 2)

**Goal**: Define machine-specific overrides

**Tasks**:
1. Create docker-compose.orchestrator.override.yml
2. Update worker-specific overrides with GPU config
3. Add resource limits per machine type
4. Document override merge behavior

**Deliverable**: Complete override files for all machine types

---

### 10.4 Phase 4: Testing & Validation (Week 2-3)

**Goal**: Verify all profiles and combinations work

**Tests**:
1. Profile validation
   ```bash
   docker compose --profile core up
   docker compose --profile core --profile secrets up
   docker compose --profile core --profile workflow up
   # ... all combinations
   ```

2. Health check validation
   - All services have working health checks
   - Dependency ordering correct
   - No race conditions

3. Service-to-service communication
   - n8n can reach postgres
   - Infisical can reach mongo
   - Prometheus can scrape metrics
   - Grafana can query Prometheus/Loki

**Deliverable**: Test suite and validation report

---

### 10.5 Phase 5: Documentation (Week 3)

**Goal**: Complete deployment documentation

**Documents**:
1. Quick start guide
2. Profile reference
3. Troubleshooting guide
4. Service-specific configuration
5. Upgrade/downgrade procedures

**Deliverable**: Complete documentation set

---

### 10.6 Phase 6: Production Rollout (Week 3-4)

**Goal**: Deploy to production with zero downtime

**Steps**:
1. Backup existing data
2. Test consolidated stack in staging
3. Switch orchestrator to consolidated stack
4. Migrate workers incrementally
5. Archive old docker-compose files

**Deliverable**: All systems running on consolidated stack

---

## PART 11: ARCHON VS LETTA COEXISTENCE

### 11.1 Current Architecture

**Archon** (Project Management):
- Standalone deployment
- Port: 8181 (API), 3737 (UI), 8051 (MCP)
- Purpose: Task management, document search
- Status: ✅ Running separately

**Letta** (Agent Memory):
- Not currently deployed
- Purpose: Conversational memory, agent state
- Referenced in CLAUDE.md

### 11.2 Coexistence Strategy

**Do NOT integrate Archon into main compose** - Keep separate because:

1. **Different lifecycle** - Archon is CI/CD tool, not runtime service
2. **Different security model** - Project management != production runtime
3. **Different scaling** - Archon scales with developers, not with throughput
4. **Different dependencies** - Archon has its own database

**Integrate Letta** into main compose because:

1. **Runtime requirement** - Agents need memory at runtime
2. **Shared dependencies** - Letta uses postgres/redis
3. **Operational necessity** - Part of normal agent lifecycle
4. **Performance impact** - Memory system affects response times

### 11.3 Integration Points

**Letta Integration into Consolidation**:

```yaml
letta:
  image: letta/letta:latest
  container_name: nyra-letta
  profiles: ["vector", "workflow"]  # Include with memory systems
  depends_on:
    postgres:
      condition: service_healthy
    redis:
      condition: service_healthy
  environment:
    POSTGRES_HOST: postgres
    REDIS_HOST: redis
    # ... letta configuration
  ports:
    - "8090:8090"
  networks: [nyra]
  restart: unless-stopped
```

**Archon Remains Separate**:
- Deployed by Archon CI system
- Manages Project Nyra configuration
- Does not run in same Docker network
- Integration via HTTP APIs only

---

## PART 12: SUCCESS CRITERIA & ROLLBACK

### 12.1 Success Criteria

After consolidation, deployment must satisfy:

✅ **Profile Separation**
- [ ] `--profile core` starts only database services
- [ ] `--profile secrets` adds Infisical
- [ ] `--profile workflow` adds n8n + Activepieces
- [ ] `--profile observability` adds monitoring
- [ ] All combinations work independently

✅ **Service Health**
- [ ] All services pass health checks within 120s
- [ ] No dependency race conditions
- [ ] Services accessible on correct ports
- [ ] Database connections working

✅ **Environment Management**
- [ ] .env.orchestrator loads without errors
- [ ] .env.worker-* files load correctly
- [ ] All required variables documented
- [ ] Default values sensible

✅ **Data Persistence**
- [ ] All volumes mount correctly
- [ ] Data persists across restarts
- [ ] Backups work as expected
- [ ] No data loss on crashes

✅ **Network Connectivity**
- [ ] Service-to-service DNS resolution works
- [ ] External port mappings correct
- [ ] No port conflicts
- [ ] Network performance acceptable

✅ **Monitoring**
- [ ] Prometheus scrapes all metrics
- [ ] Loki aggregates all logs
- [ ] Grafana displays dashboards
- [ ] cAdvisor shows container metrics

✅ **Security**
- [ ] Secrets not in logs
- [ ] Passwords properly masked
- [ ] Infisical encryption working
- [ ] Network isolation correct

---

### 12.2 Rollback Strategy

If consolidation fails:

**Immediate Rollback** (< 5 minutes):
```bash
# Stop consolidated stack
docker compose --profile '*' down

# Restore from backup
cp -r /infra-backup /infra

# Restart old stack
docker compose -f /infra/docker-compose.old.yml up -d
```

**Data Recovery** (< 15 minutes):
```bash
# Volumes preserved - restart uses existing data
docker volume ls  # Verify all volumes present
docker compose up -d  # Services reconnect to existing data
```

**Post-Incident**:
1. Document failure reason
2. Update consolidation plan
3. Fix identified issues
4. Re-test extensively
5. Second rollout attempt

---

## PART 13: RECOMMENDATIONS & NEXT STEPS

### 13.1 Immediate Actions (This Sprint)

1. **Add Missing Services to Compose**
   - FalkorDB (graph database)
   - Zep (episodic memory)
   - Letta (agent memory)
   - Add to vector and workflow profiles

2. **Create .env Template**
   - Document all variables
   - Provide secure defaults
   - Add validation script

3. **Update Docker Compose**
   - Add comprehensive health checks
   - Document all environment variables
   - Create unified service descriptions

4. **Test Profile Combinations**
   - Verify all profiles work independently
   - Test all combinations work together
   - Document expected behavior

### 13.2 Medium-Term Improvements (Next Month)

1. **Docker Compose Overrides**
   - Complete worker-* override files
   - Add GPU configuration
   - Document override merge behavior

2. **Deployment Automation**
   - Create deploy.sh script
   - Add validation before startup
   - Implement health check monitoring

3. **Backup & Recovery**
   - Automate daily backups
   - Test restore procedures
   - Document recovery runbook

4. **Monitoring & Alerts**
   - Create Grafana dashboards
   - Set up alerting rules
   - Document alert responses

### 13.3 Long-Term Consolidation (Next Quarter)

1. **Full Archon Integration** (when ready)
   - Define API contract
   - Implement service discovery
   - Unified secrets system

2. **Cloud Deployment**
   - Migrate to Oracle VPS/Oracle
   - Use same docker-compose.yml
   - Implement auto-scaling

3. **Kubernetes Migration** (optional)
   - Convert compose to Helm charts
   - Implement pod orchestration
   - Use cloud-native deployments

---

## APPENDIX A: Environment Variable Reference

### All Required Variables
```bash
POSTGRES_PASSWORD=           # Main database root password
REDIS_PASSWORD=              # Redis auth password
MONGO_ROOT_PASSWORD=         # MongoDB root password
INFISICAL_ENCRYPTION_KEY=    # Infisical data encryption
INFISICAL_JWT_SECRET=        # Infisical auth token
N8N_ENCRYPTION_KEY=          # n8n secrets encryption
ACTIVEPIECES_JWT_SECRET=     # Activepieces auth
ACTIVEPIECES_ENCRYPTION_KEY= # Activepieces data encryption
GRAFANA_ADMIN_PASSWORD=      # Grafana admin password
RUVECTOR_POSTGRES_PASSWORD=  # RuVector database password
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=  # Tunnel access token
```

### All Optional Variables (with defaults)
```bash
POSTGRES_DB=nyra                                    # Database name
POSTGRES_USER=nyra                                 # Database user
POSTGRES_PORT=5432                                 # External port
REDIS_PORT=6379                                    # External port
REDIS_MAX_MEMORY=2gb                               # Memory limit
MONGO_PORT=27017                                   # External port
MONGO_ROOT_USER=admin                              # Root user
INFISICAL_PORT=8080                                # External port
INFISICAL_ENV=development                          # Environment
INFISICAL_SITE_URL=http://localhost:8080           # Public URL
N8N_HOST=localhost                                 # Bind address
N8N_PROTOCOL=http                                  # Protocol
N8N_PORT=5678                                      # External port
WEBHOOK_URL=http://localhost:5678/                 # Webhook base
PROMETHEUS_PORT=9090                               # External port
GRAFANA_PORT=3003                                  # External port
LOKI_PORT=3100                                     # External port
CADVISOR_PORT=8081                                 # External port
RUVECTOR_POSTGRES_USER=claude                      # Vector DB user
RUVECTOR_POSTGRES_DB=claude_flow                   # Vector DB name
RUVECTOR_POSTGRES_PORT=5436                        # External port
RUVECTOR_PGADMIN_EMAIL=admin@claude-flow.local     # Admin email
RUVECTOR_PGADMIN_PASSWORD=admin                    # Admin password
RUVECTOR_PGADMIN_PORT=5050                         # External port
TIMEZONE=America/New_York                          # Timezone
DOCKER_SUBNET=172.20.0.0/16                        # Network subnet
ACTIVEPIECES_PORT=8082                             # External port
```

---

## APPENDIX B: Service Dependency Graph

```
postgres (core)
├─ n8n (workflow)
├─ Nyra Orchestrator API
├─ Quote Engine
└─ Audit Logging

redis (core)
├─ Session Management
├─ Rate Limiting
├─ Message Queue
└─ Cache Layer

mongo (core)
└─ infisical (secrets)

infisical (secrets)
└─ All services (secret distribution)

n8n (workflow)
├─ postgres (data storage)
├─ redis (job queue)
└─ Cloudflare Tunnel (webhook ingress)

activepieces (workflow)
├─ postgres (optional)
└─ Redis (optional)

prometheus (observability)
├─ cAdvisor (metrics)
├─ Node exporter (if running)
└─ Service health endpoints

grafana (observability)
├─ prometheus (metric data)
├─ loki (log data)
└─ Datasource config (provisioning)

loki (observability)
└─ All services (log ingestion)

cadvisor (observability)
└─ Docker socket (container metrics)

ruvector-postgres (vector)
└─ Agent search operations

ruvector-pgadmin (vector + gui)
└─ ruvector-postgres (admin UI)

zep (vector) [archived]
├─ postgres (optional backend)
├─ falkordb (graph storage)
└─ Agent memory operations

falkordb (vector) [archived]
└─ Temporal graph operations

cloudflared (edge)
└─ All services (tunnel access)
```

---

## APPENDIX C: Quick Reference - Common Commands

```bash
# Validate compose file
docker compose config --quiet

# Start minimal stack
docker compose --profile core up

# Start full production stack
docker compose \
  --env-file ./env/.env.orchestrator \
  --profile core \
  --profile secrets \
  --profile workflow \
  --profile observability \
  --profile vector \
  --profile edge \
  up -d

# Stop all services
docker compose down

# View service status
docker compose ps

# View service logs
docker compose logs -f <service-name>

# Check service health
docker compose ps | grep healthy

# Clean up volumes (WARNING: data loss)
docker compose down -v

# Backup data
docker run --rm -v postgres_data:/data \
  -v $(pwd)/backup:/backup \
  busybox tar czf /backup/postgres.tar.gz /data

# Restore data
docker run --rm -v postgres_data:/data \
  -v $(pwd)/backup:/backup \
  busybox tar xzf /backup/postgres.tar.gz -C /
```

---

**Document Status**: ✅ COMPLETE - Ready for Implementation

**Next Document**: Implementation Guide (Phase 1: Consolidation)

---

*Generated by Agent 1: INFRA ARCHITECT*
*Part of Claude Flow V3 Infrastructure Consolidation Initiative*
*For questions, see /docs/INFRASTRUCTURE.md or contact @infra-team*
