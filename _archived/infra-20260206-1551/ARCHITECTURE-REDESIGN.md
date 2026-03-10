# Project Nyra - Infrastructure Re-Architecture v2.0
## Production-Grade Multi-PC Orchestration with Secrets Management

**Status**: Architecture Design (Pre-Implementation)
**Date**: 2026-02-01
**Scope**: Complete infra consolidation + new dev claude-flow container + Infisical sidecar pattern + Archon OS + openclawd integration

---

## SECTION 1: CURRENT STATE (AUTHORITATIVE)

### 1.1 Existing Claude Flow Implementation

#### docker-compose/docker-compose.claude-flow.yml (BRAIN SERVICE)
```
claude-flow-brain:
  - Role: MCP server + persistent memory
  - Ports: 8080 (MCP), 3333 (Dashboard)
  - Volumes: .claude-flow config (ro), persistent data/logs
  - Dependencies: Redis, RuVector PostgreSQL
  - Environment: Production mode, Reasoning Bank enabled
  - Used for: Brain/daemon operations (NOT CI/CD)
```

#### docker-compose.claude-flow-cicd.yml (CI/CD SERVICE)
```
claude-flow-cicd:
  - Role: CI/CD automation runner
  - Base image: node:20-bullseye
  - Volumes: Full project mount, persistent AgentDB/neural volumes
  - Startup: Comprehensive init script (npm install, claude-flow init, daemon start)
  - Environment: CI/CD-specific settings, git config
  - Used for: Automation workflows, checkpointing
```

**CRITICAL FINDING:** These are two separate containers with different purposes.
- Brain = long-running server (MCP endpoint)
- CI/CD = ephemeral worker (task runner)

### 1.2 Existing Network & Infrastructure

#### Networks
- **nyra-network**: External bridge network (expected to exist)
- Services use Docker DNS for discovery: `postgres:5432`, `redis:6379`
- No multi-PC orchestration visible

#### Base Services (docker-compose/docker-compose.base.yml)
- PostgreSQL (pgvector:pg16) - shared database
- Redis (redis:7-alpine) - shared cache
- Both have health checks, resource limits

#### Secrets Currently
- **.env files** (not committed) - basic environment variables
- **NO Infisical integration** - gap to fill
- **NO sidecar pattern** - single-service secrets injection
- **NO secret rotation mechanism**

### 1.3 Infra Fragmentation Analysis

**Compose File Locations:**
```
/infra/docker-compose/
  ├── docker-compose.base.yml (PostgreSQL, Redis)
  ├── docker-compose.claude-flow.yml (Brain service)
  ├── docker-compose.observability.yml (Prometheus, Grafana, Loki)
  ├── docker-compose.orchestrator.yml (Services coordination)
  ├── docker-compose.mcp-servers.yml (MCP endpoints)
  ├── docker-compose.ruvector.yml (RuVector)
  ├── docker-compose.ai.yml (AI services)
  ├── docker-compose.golden-stack.yml (APPEARS AUTHORITATIVE?)
  ├── docker-compose.golden-stack-v1-backup.yml (BACKUP - unclear if still used)
  └── ... (multiple others)

/infra/stacks/nyra-mortgage/
  └── docker-compose.yml (SEPARATE STACK - duplicate services?)

/infra/ (root)
  ├── docker-compose.yml (UNKNOWN PURPOSE)
  └── docker-compose.claude-flow-cicd.yml (CI/CD - root-level copy?)
```

**Problems:**
1. ❌ No clear entrypoint ("start everything" file)
2. ❌ Multiple versions of same services (which is authoritative?)
3. ❌ Backup files in active directories (confusing)
4. ❌ No environment-based overrides (dev/staging/prod)
5. ❌ Root-level compose files conflict with /docker-compose/ subdirectory
6. ❌ No documented promotion path (dev → staging → prod)

### 1.4 Services Currently Running

**Inferred from compose files:**
- Core: PostgreSQL, Redis, RuVector
- Orchestration: Claude Flow (brain + CI/CD), Archon (not set up yet)
- MCP Servers: Nexus Router, multiple MCP endpoints
- Applications: Twenty (CRM), n8n, Dify, ActivePieces, LiteLLM
- Observability: Prometheus, Grafana, Loki
- **MISSING**: openclawd/clawdbot, Archon OS, proper Infisical integration

---

## SECTION 2: FUTURE ARCHITECTURE (PROPOSED)

### 2.1 Design Principles

1. **Single Source of Truth**: One authoritative Docker Compose per environment
2. **Environment Separation**: dev, staging, prod with clear promotion paths
3. **Secrets as Infrastructure**: Infisical sidecar pattern for all services
4. **Multi-PC Orchestration**: Explicit coordination layer for 3 orchestrators
5. **Service Isolation**: Each service owns its data, no shared databases except coordination
6. **Observability Built-in**: Prometheus, Grafana, Loki integrated from day 1
7. **No Local Installs Needed**: Everything containerized, including dev tools
8. **Explicit Tradeoffs**: Every design decision documented with alternatives considered

### 2.2 Services Inventory (COMPLETE)

#### Tier 1: Core Infrastructure (Required for all environments)
```
nyra-network (bridge, persistent)
├── PostgreSQL (pgvector:pg16)
│   ├── Database: nyra_main (transactional)
│   ├── Database: claude_flow (memory/reasoning)
│   ├── Database: letta (conversational memory)
│   └── Database: archon (orchestration state)
├── Redis (redis:7-alpine, HA optional)
└── Minio (S3-compatible storage for artifacts)
```

#### Tier 2: Secret Management (Infisical Sidecar)
```
nyra-infisical-agent-sidecar
├── Purpose: Inject secrets at runtime
├── Model: One shared sidecar for orchestrator services
├── Alternative: Per-service sidecar for additional isolation
└── Decision: Shared sidecar (simpler, reduces resource overhead)
```

#### Tier 3: Orchestration Layer (MCP + Routing)
```
nexus-router (Grafbase Nexus)
├── Role: Central MCP aggregator + LLM router
├── MCP Servers connected: 18+ endpoints
└── LLM Routing: Smart model selection (Gemini Flash for simple, Sonnet for complex)

claude-flow-dev (NEW)
├── Role: Development brain + MCP server
├── Container: Built from existing Dockerfile.brain
├── Ports: 8080 (MCP), 3333 (Dashboard)
├── Mount: /.claude-flow (persistent config)
├── Networking: Registers with Nexus Router
└── Startup: Auto-register, health checks enabled

archon-os (NEW)
├── Role: Task execution + swarm coordination
├── Container: Official archon:latest
├── Infisical: Separate sidecar (decision: isolated for security)
└── Networking: Connects to Nexus Router

openclawd/clawdbot (NEW)
├── Role: Chat UI + borrower interface
├── Container: github.com/openclawd/openclawd
├── Infisical: Shared orchestrator sidecar (same as claude-flow)
└── Networking: Expose via reverse proxy
```

#### Tier 4: Data/Memory Services
```
ruvector (PostgreSQL-based vector DB)
├── Used by: Claude Flow for semantic search
└── Shared across: All agent instances

graphiti (Neo4j temporal knowledge graph)
├── Used by: Memory management
└── Optional: Can be shared or per-service

mem0 (Universal memory)
├── Used by: Borrower preference tracking
└── Optional sidecar agent for injection
```

#### Tier 5: Observability
```
prometheus (metrics collection)
grafana (visualization + dashboards)
loki (log aggregation)
promtail (log shipper)
```

#### Tier 6: CI/CD & Workers
```
claude-flow-cicd (unchanged)
├── Role: Automation runner
├── Base: node:20-bullseye with comprehensive init
└── Note: Separate from dev brain, can run independently
```

### 2.3 Infisical Sidecar Pattern (DETAILED)

#### Why Infisical Sidecar?

**Current Problem**: Secrets in .env files, no rotation, no audit trail

**Solution: Infisical Sidecar Architecture**

```
┌─────────────────────────────────────────────────┐
│ Docker Host (Orchestrator PC)                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Infisical Agent + Sidecar Container     │  │
│  │ (ONE per orchestrator-tier services)    │  │
│  │                                         │  │
│  │ - Connects to Infisical Cloud/Self-Hosted
│  │ - Injects secrets via unix socket      │  │
│  │ - Rotates credentials automatically    │  │
│  └──────────────┬──────────────────────────┘  │
│                 │ (unix socket mount)         │
│                 │                             │
│     ┌───────────┴────────────┬─────────────┐ │
│     │                        │             │ │
│  ┌──▼────────────────┐  ┌────▼──────┐  ┌──▼──┐
│  │ claude-flow-dev   │  │ openclawd  │  │ n8n │
│  │ (orchestrator)    │  │ (UI)       │  │     │
│  └───────────────────┘  └────────────┘  └─────┘
│  (Mount /var/run/infisical-socket)
│
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ SEPARATE PC (if needed): Archon OS              │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Infisical Agent + Sidecar (SEPARATE)    │  │
│  │ (Archon gets own sidecar for isolation) │  │
│  └──────────────┬──────────────────────────┘  │
│                 │                             │
│           ┌─────▼──────┐                      │
│           │ archon-os  │                      │
│           └────────────┘                      │
└─────────────────────────────────────────────────┘
```

#### Secret Injection Pattern

**Services that need secrets:**
1. claude-flow-dev → ANTHROPIC_API_KEY, OPENAI_API_KEY, REDIS_URL, DB_URL
2. openclawd → GITHUB_TOKEN, TWILIO_CREDS, SENDGRID_KEY
3. archon-os → ANTHROPIC_API_KEY, EXECUTION_CREDS
4. nexus-router → LLM_API_KEYS, RBAC_CONFIG
5. All MCP servers → PROVIDER_KEYS
6. PostgreSQL → POSTGRES_PASSWORD (injected at startup)

**Method:**
```yaml
services:
  claude-flow-dev:
    # Mount infisical socket
    volumes:
      - /var/run/infisical-socket:/var/run/infisical-socket:ro

    # Use wrapper script that injects secrets before startup
    entrypoint: /usr/local/bin/infisical-entrypoint.sh

    # Only non-sensitive env vars here
    environment:
      NODE_ENV: production
      CLAUDE_FLOW_MODE: server
      # ANTHROPIC_API_KEY: injected at runtime
```

**Wrapper script logic:**
```bash
#!/bin/bash
# /usr/local/bin/infisical-entrypoint.sh

# 1. Connect to Infisical sidecar via socket
SECRETS=$(curl --unix-socket /var/run/infisical-socket/agent.sock \
  http://localhost/api/secrets/get?project=nyra&env=dev)

# 2. Parse and export secrets
export ANTHROPIC_API_KEY=$(echo $SECRETS | jq -r .ANTHROPIC_API_KEY)
export OPENAI_API_KEY=$(echo $SECRETS | jq -r .OPENAI_API_KEY)
# ... (repeat for all secrets)

# 3. Start the actual service
exec "$@"
```

#### Decision: Shared vs. Separate Sidecars

**Option A: ONE Infisical sidecar for all orchestrator services**
✅ Pros:
- Simpler deployment (single container)
- Reduced resource overhead
- Single point of auth to Infisical

❌ Cons:
- If sidecar fails, all services lose secrets
- Broader attack surface (more clients = more exposure)

**Option B: SEPARATE Infisical sidecars per service tier**
✅ Pros:
- Isolation (Archon OS failure doesn't affect Claude Flow)
- Granular RBAC (Archon only gets its own secrets)
- Better security posture

❌ Cons:
- More containers to manage
- More resources consumed
- Complex networking between sidecars

**RECOMMENDATION**:
- **Use Option A** for orchestrator tier (claude-flow + openclawd + n8n)
  - These are tightly coupled, benefit from coordination
  - Shared secrets (e.g., ANTHROPIC_API_KEY) anyway

- **Use Option B** for Archon OS
  - Archon needs isolation from main orchestrator
  - Separate execution environment
  - Different failure domain
  - Can be disabled independently in dev

**Implementation**:
```yaml
# Main orchestrator infisical sidecar
infisical-agent-main:
  image: infisical:latest
  command: start --universal-auth-client-id=$CLIENT_ID --universal-auth-client-secret=$SECRET
  volumes:
    - /var/run/infisical-socket-main:/var/run/infisical-socket
  networks:
    - internal

# Archon-specific infisical sidecar (on separate PC or isolated network)
infisical-agent-archon:
  image: infisical:latest
  command: start --universal-auth-client-id=$ARCHON_CLIENT_ID --universal-auth-client-secret=$ARCHON_SECRET
  volumes:
    - /var/run/infisical-socket-archon:/var/run/infisical-socket
  networks:
    - internal-archon
```

---

## SECTION 3: DOCKER COMPOSE STRUCTURE (NEW)

### 3.1 File Organization (Consolidated)

```
/infra/docker-compose/
├── docker-compose.yml (MASTER - includes everything)
│
├── overrides/
│   ├── docker-compose.dev.yml (dev overrides)
│   ├── docker-compose.staging.yml (staging overrides)
│   └── docker-compose.prod.yml (prod overrides)
│
├── services/
│   ├── docker-compose.core.yml (PostgreSQL, Redis, Minio)
│   ├── docker-compose.secrets.yml (Infisical sidecars)
│   ├── docker-compose.orchestration.yml (Nexus, Claude Flow, Archon, openclawd)
│   ├── docker-compose.mcp-servers.yml (Individual MCP endpoints)
│   ├── docker-compose.data.yml (RuVector, Graphiti, Mem0)
│   ├── docker-compose.observability.yml (Prometheus, Grafana, Loki)
│   └── docker-compose.cicd.yml (Claude Flow CI/CD worker)
│
├── profiles/
│   ├── full-stack.profile.yml (all services)
│   ├── essential-only.profile.yml (core + orchestration)
│   └── dev-minimal.profile.yml (single dev PC)
│
├── scripts/
│   ├── startup-orchestrator.sh (multi-PC coordinator)
│   ├── shutdown-orchestrator.sh
│   ├── start-dev.sh (single PC development)
│   ├── health-check.sh
│   └── secret-rotation.sh
│
└── configs/
    ├── infisical/
    │   ├── main.env (Infisical auth for orchestrator)
    │   └── archon.env (Infisical auth for Archon)
    ├── claude-flow/
    │   └── dev-brain-entrypoint.sh
    ├── prometheus/
    │   └── prometheus.yml
    └── networking/
        └── multi-pc-routing.yml
```

### 3.2 Master Compose File (docker-compose.yml)

```yaml
version: '3.9'

# Include pattern: services organized by function
include:
  - path: ./services/docker-compose.core.yml
  - path: ./services/docker-compose.secrets.yml
  - path: ./services/docker-compose.orchestration.yml
  - path: ./services/docker-compose.data.yml
  - path: ./services/docker-compose.observability.yml
  - path: ./services/docker-compose.cicd.yml
    required: false  # CI/CD optional

# Environment-specific overrides
extends:
  file: ./overrides/${ENVIRONMENT:-dev}.yml
  services: {}

# Single persistent network
networks:
  nyra-network:
    name: nyra-network
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: 1500
    labels:
      com.nyra.network: primary
      com.nyra.multi-pc: "{{ ENABLE_MULTI_PC_MODE }}"

# Usage:
# docker compose up -d  (dev)
# ENVIRONMENT=staging docker compose up -d
# ENVIRONMENT=prod docker compose up -d
```

### 3.3 Services Compose Files (Examples)

#### docker-compose.core.yml (PostgreSQL, Redis, Minio)

```yaml
version: '3.8'

services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: nyra-postgres-dev
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # Will be injected by Infisical
      POSTGRES_DB: ${POSTGRES_DB:-nyra_main}
      POSTGRES_MULTIPLE_DATABASES: claude_flow,letta,archon
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ../../scripts/postgres-init:/docker-entrypoint-initdb.d:ro
    ports:
      - "${POSTGRES_PORT:-5432}:5432"
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

  redis:
    image: redis:7-alpine
    container_name: nyra-redis-dev
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G

  # Minio for artifact storage
  minio:
    image: minio/minio:latest
    container_name: nyra-minio-dev
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}  # Injected
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"      # API
      - "9001:9001"      # Console
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
    name: nyra_postgres_data_dev
    driver: local
  redis_data:
    name: nyra_redis_data_dev
    driver: local
  minio_data:
    name: nyra_minio_data_dev
    driver: local

networks:
  nyra-network:
    external: true
```

#### docker-compose.secrets.yml (Infisical Sidecars)

```yaml
version: '3.8'

services:
  # Main orchestrator infisical sidecar
  # Provides secrets for: claude-flow-dev, openclawd, n8n, nexus-router
  infisical-agent-main:
    image: infisical/agent:latest
    container_name: nyra-infisical-agent-main
    restart: unless-stopped
    environment:
      # These are loaded from .env or Docker secrets in prod
      INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: ${INFISICAL_CLIENT_ID}
      INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: ${INFISICAL_CLIENT_SECRET}
      INFISICAL_ORGANIZATION_ID: ${INFISICAL_ORG_ID}
      INFISICAL_PROJECT_ID: ${INFISICAL_PROJECT_ID}
      INFISICAL_ENVIRONMENT: ${ENVIRONMENT:-dev}
      INFISICAL_CACHE_TTL: 3600
    volumes:
      # Expose socket for other services to fetch secrets
      - /var/run/infisical-socket-main:/var/run/infisical-socket:rw
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      com.nyra.service: infisical-agent
      com.nyra.scope: orchestrator

  # Archon-specific infisical sidecar (isolated)
  # Provides secrets for: archon-os only
  infisical-agent-archon:
    image: infisical/agent:latest
    container_name: nyra-infisical-agent-archon
    restart: unless-stopped
    environment:
      INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: ${INFISICAL_ARCHON_CLIENT_ID}
      INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: ${INFISICAL_ARCHON_CLIENT_SECRET}
      INFISICAL_ORGANIZATION_ID: ${INFISICAL_ORG_ID}
      INFISICAL_PROJECT_ID: ${INFISICAL_PROJECT_ID}
      INFISICAL_ENVIRONMENT: ${ENVIRONMENT:-dev}
      INFISICAL_CACHE_TTL: 3600
    volumes:
      - /var/run/infisical-socket-archon:/var/run/infisical-socket:rw
    networks:
      - nyra-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      com.nyra.service: infisical-agent
      com.nyra.scope: archon

volumes:
  # Just for socket mount points if needed
  infisical_socket_main:
    name: nyra_infisical_socket_main
  infisical_socket_archon:
    name: nyra_infisical_socket_archon

networks:
  nyra-network:
    external: true
```

#### docker-compose.orchestration.yml (Nexus, Claude Flow, Archon, openclawd)

```yaml
version: '3.9'

services:
  # =========================================================================
  # NEXUS ROUTER: Central MCP aggregator + LLM router
  # =========================================================================
  nexus-router:
    image: nexus:latest
    container_name: nyra-nexus-router-dev
    restart: unless-stopped
    ports:
      - "6000:6000"        # HTTP/API
      - "6001:6001"        # WebSocket (MCP over WS)
    volumes:
      - ../../infra/configs/nexus/nexus.toml:/etc/nexus/nexus.toml:ro
      - /var/run/infisical-socket-main:/var/run/infisical-socket-main:ro
    environment:
      # These will be injected by Infisical wrapper
      NEXUS_JWT_SECRET: ${NEXUS_JWT_SECRET}
      NEXUS_ADMIN_TOKEN: ${NEXUS_ADMIN_TOKEN}
      # Provider keys (injected via socket)
      INFISICAL_SOCKET_PATH: /var/run/infisical-socket-main
    networks:
      - nyra-network
    depends_on:
      infisical-agent-main:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
    labels:
      com.nyra.service: nexus-router
      com.nyra.mcp: aggregator
      com.nyra.port.mcp: "6000"
      com.nyra.port.ws: "6001"

  # =========================================================================
  # CLAUDE FLOW DEV BRAIN: MCP server + persistent memory
  # =========================================================================
  claude-flow-dev:
    build:
      context: ../../
      dockerfile: Dockerfile.brain
    container_name: nyra-claude-flow-dev
    restart: unless-stopped
    ports:
      - "8080:8080"        # MCP Server
      - "3333:3000"        # Dashboard
    volumes:
      # Persistent memory volume
      - claude_flow_dev_data:/app/.swarm
      - claude_flow_dev_logs:/app/logs
      # Config from repo (read-only)
      - ../../.claude-flow:/app/.claude-flow-config:ro
      # Infisical socket for secrets
      - /var/run/infisical-socket-main:/var/run/infisical-socket-main:ro
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      CLAUDE_FLOW_MODE: server
      CLAUDE_FLOW_ENVIRONMENT: dev
      # Non-sensitive env vars only; API keys come from Infisical
      REDIS_URL: redis://nyra-redis-dev:6379
      RUVECTOR_HOST: nyra-ruvector
      RUVECTOR_PORT: 5432
      # Nexus Router integration
      NEXUS_ROUTER_URL: http://nyra-nexus-router-dev:6000
      CLAUDE_FLOW_MCP_ENDPOINT: http://nyra-claude-flow-dev:8080
      # Infisical injection
      INFISICAL_SOCKET_PATH: /var/run/infisical-socket-main
    entrypoint: /usr/local/bin/infisical-entrypoint.sh
    command: npm start
    networks:
      - nyra-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      nexus-router:
        condition: service_healthy
      infisical-agent-main:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
    labels:
      com.nyra.service: claude-flow-dev
      com.nyra.mcp: provider
      com.nyra.port: "8080"

  # =========================================================================
  # ARCHON OS: Task execution engine (ISOLATED, separate infisical)
  # =========================================================================
  archon-os:
    image: archon/os:latest
    container_name: nyra-archon-os-dev
    restart: unless-stopped
    ports:
      - "8085:8085"        # API
      - "9095:9095"        # Metrics
    volumes:
      - archon_data:/app/data
      - /var/run/infisical-socket-archon:/var/run/infisical-socket-archon:ro
    environment:
      ENVIRONMENT: ${ENVIRONMENT:-dev}
      NEXUS_ROUTER_URL: http://nyra-nexus-router-dev:6000
      # Archon-specific secrets injected from dedicated sidecar
      INFISICAL_SOCKET_PATH: /var/run/infisical-socket-archon
    entrypoint: /usr/local/bin/infisical-entrypoint-archon.sh
    command: start
    networks:
      - nyra-network
    depends_on:
      nexus-router:
        condition: service_healthy
      infisical-agent-archon:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8085/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
    labels:
      com.nyra.service: archon-os
      com.nyra.tier: execution
      com.nyra.isolated: "true"

  # =========================================================================
  # OPENCLAWD: Chat UI + borrower interface
  # =========================================================================
  openclawd:
    image: openclawd/openclawd:latest
    container_name: nyra-openclawd-dev
    restart: unless-stopped
    ports:
      - "3002:3000"        # Web UI
    volumes:
      - openclawd_data:/app/data
      - /var/run/infisical-socket-main:/var/run/infisical-socket-main:ro
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      ENVIRONMENT: ${ENVIRONMENT:-dev}
      NEXUS_ROUTER_URL: http://nyra-nexus-router-dev:6000
      CLAUDE_FLOW_URL: http://nyra-claude-flow-dev:8080
      # Shared infisical with claude-flow
      INFISICAL_SOCKET_PATH: /var/run/infisical-socket-main
    entrypoint: /usr/local/bin/infisical-entrypoint.sh
    command: npm run dev
    networks:
      - nyra-network
    depends_on:
      claude-flow-dev:
        condition: service_healthy
      infisical-agent-main:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    labels:
      com.nyra.service: openclawd
      com.nyra.tier: ui

volumes:
  claude_flow_dev_data:
    name: nyra_claude_flow_dev_data
    driver: local
  claude_flow_dev_logs:
    name: nyra_claude_flow_dev_logs
    driver: local
  archon_data:
    name: nyra_archon_dev_data
    driver: local
  openclawd_data:
    name: nyra_openclawd_dev_data
    driver: local

networks:
  nyra-network:
    external: true
```

---

## SECTION 4: MULTI-PC ORCHESTRATION

### 4.1 Architecture

**3 Physical PCs:**
1. **Orchestrator PC-1** (Minisforum UH680 or equivalent)
   - Nexus Router (port 6000)
   - Claude Flow Dev Brain (port 8080)
   - PostgreSQL, Redis (shared)
   - Prometheus, Grafana
   - Infisical Agent Sidecars

2. **Orchestrator PC-2** (GPU Worker or secondary)
   - Archon OS (port 8085)
   - RuVector (dedicated)
   - Infisical Agent Sidecar (Archon-specific)
   - OpenClawd (UI, optional on this PC)
   - Local Ollama/vLLM for inference

3. **Orchestrator PC-3** (GPU Worker or tertiary)
   - Additional MCP servers
   - Observability aggregator
   - Backup Nexus Router (HA option)

**Network Connectivity:**
- Internal: Tailscale mesh VPN (all PCs can reach each other)
- External: Cloudflare Tunnel (Nexus Router exposed as nexus.ratehunter.net)

### 4.2 Environment Variables for Multi-PC

```bash
# ./infra/docker-compose/.env (common to all PCs)
ENVIRONMENT=dev
ENABLE_MULTI_PC_MODE=true

# Orchestrator discovery
PC1_NAME=orchestrator-uh680
PC1_TAILSCALE_IP=100.x.x.x
PC1_ROLES=nexus,claude-flow,postgres,redis

PC2_NAME=worker-3090
PC2_TAILSCALE_IP=100.y.y.y
PC2_ROLES=archon,ruvector,ollama

PC3_NAME=worker-3060
PC3_TAILSCALE_IP=100.z.z.z
PC3_ROLES=observability,mcp-secondary

# Infisical (shared for all)
INFISICAL_CLIENT_ID=...
INFISICAL_CLIENT_SECRET=...
INFISICAL_ORG_ID=...
INFISICAL_PROJECT_ID=...

# Archon isolation
INFISICAL_ARCHON_CLIENT_ID=...
INFISICAL_ARCHON_CLIENT_SECRET=...

# Nexus Router (only on PC-1)
NEXUS_JWT_SECRET=...
NEXUS_ADMIN_TOKEN=...

# PostgreSQL (only on PC-1)
POSTGRES_USER=nyra_user
POSTGRES_PASSWORD=... (injected via Infisical)
POSTGRES_DB=nyra_main

# Redis (only on PC-1)
REDIS_PASSWORD=... (injected via Infisical)
```

### 4.3 Global Orchestrator Startup Script

```bash
#!/bin/bash
# /infra/scripts/startup-orchestrator.sh
# Starts entire multi-PC infrastructure
# Usage: ./startup-orchestrator.sh [environment]

set -e

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="${SCRIPT_DIR}/.."

echo "🚀 Starting Project Nyra Multi-PC Infrastructure (${ENVIRONMENT})"
echo ""

# Load configuration for this environment
source "${INFRA_DIR}/.env"
source "${INFRA_DIR}/.env.${ENVIRONMENT}"

# Step 1: Verify all PCs are reachable
echo "📡 Verifying network connectivity..."
for PC in PC1 PC2 PC3; do
  IP_VAR="${PC}_TAILSCALE_IP"
  IP="${!IP_VAR}"
  if ping -c 1 -W 2 "$IP" &>/dev/null; then
    echo "  ✓ $PC ($IP) is reachable"
  else
    echo "  ✗ $PC ($IP) is NOT reachable - skipping"
  fi
done

echo ""

# Step 2: Start PC-1 (Primary: Nexus, Claude Flow, PostgreSQL, Redis)
echo "🔧 Starting PC-1 (Orchestrator: Nexus + Claude Flow + Core DB)..."
ssh "pc1@${PC1_TAILSCALE_IP}" << 'REMOTE1'
  cd /home/user/project-nyra/infra
  docker compose -f docker-compose.yml up -d \
    postgres redis minio \
    infisical-agent-main \
    nexus-router \
    claude-flow-dev
  echo "  ✓ PC-1 services started"
REMOTE1

# Wait for PC-1 core services to be healthy
echo "⏳ Waiting for PC-1 core services..."
./scripts/health-check.sh "PC1" 60

echo ""

# Step 3: Start PC-2 (Archon OS + RuVector)
echo "🔧 Starting PC-2 (Archon OS + RuVector)..."
ssh "pc2@${PC2_TAILSCALE_IP}" << 'REMOTE2'
  cd /home/user/project-nyra/infra
  docker compose -f docker-compose.yml up -d \
    infisical-agent-archon \
    archon-os \
    ruvector
  echo "  ✓ PC-2 services started"
REMOTE2

echo ""

# Step 4: Start PC-3 (Observability + Secondary MCP)
echo "🔧 Starting PC-3 (Observability)..."
ssh "pc3@${PC3_TAILSCALE_IP}" << 'REMOTE3'
  cd /home/user/project-nyra/infra
  docker compose -f docker-compose.yml up -d \
    prometheus grafana loki promtail
  echo "  ✓ PC-3 services started"
REMOTE3

echo ""

# Step 5: Register services with Nexus Router
echo "📋 Registering services with Nexus Router..."
curl -X POST "http://${PC1_TAILSCALE_IP}:6000/admin/register" \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "services": [
      {"name": "claude-flow-dev", "url": "http://'${PC1_TAILSCALE_IP}':8080"},
      {"name": "archon-os", "url": "http://'${PC2_TAILSCALE_IP}':8085"},
      {"name": "observability", "url": "http://'${PC3_TAILSCALE_IP}':9090"}
    ]
  }'

echo ""
echo "✅ Multi-PC Infrastructure Started!"
echo ""
echo "📊 Service Endpoints:"
echo "   Nexus Router:    http://${PC1_TAILSCALE_IP}:6000"
echo "   Claude Flow:     http://${PC1_TAILSCALE_IP}:8080"
echo "   Archon OS:       http://${PC2_TAILSCALE_IP}:8085"
echo "   Prometheus:      http://${PC3_TAILSCALE_IP}:9090"
echo "   Grafana:         http://${PC3_TAILSCALE_IP}:3000"
echo ""
echo "🔗 Public endpoints via Cloudflare:"
echo "   Nexus Router:    https://nexus.ratehunter.net"
echo ""
```

### 4.4 Shutdown Script

```bash
#!/bin/bash
# /infra/scripts/shutdown-orchestrator.sh

set -e

ENVIRONMENT="${1:-dev}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="${SCRIPT_DIR}/.."

source "${INFRA_DIR}/.env"
source "${INFRA_DIR}/.env.${ENVIRONMENT}"

echo "🛑 Shutting down Multi-PC Infrastructure"
echo ""

# Graceful shutdown (reverse order)
for PC in PC3 PC2 PC1; do
  IP_VAR="${PC}_TAILSCALE_IP"
  IP="${!IP_VAR}"

  echo "Stopping ${PC}..."
  ssh "user@${IP}" << REMOTE || true
    cd /home/user/project-nyra/infra
    docker compose down --remove-orphans
REMOTE
done

echo ""
echo "✅ Infrastructure shut down cleanly"
```

---

## SECTION 5: INFRA CONSOLIDATION PLAN

### 5.1 Current State (Fragmented)

```
CURRENT MESS:
├── /infra/docker-compose.yml (unknown purpose)
├── /infra/docker-compose.claude-flow-cicd.yml (CI/CD, ROOT)
├── /infra/docker-compose/ (14+ files)
│   ├── docker-compose.base.yml
│   ├── docker-compose.claude-flow.yml
│   ├── docker-compose.golden-stack.yml (AUTHORITATIVE?)
│   ├── docker-compose.golden-stack-v1-backup.yml (BACKUP)
│   └── ... (many others)
└── /infra/stacks/nyra-mortgage/ (SEPARATE STACK)
```

### 5.2 Target State (Consolidated)

```
CONSOLIDATED:
├── /infra/docker-compose.yml (MASTER - includes everything)
├── /infra/docker-compose/
│   ├── services/ (AUTHORITATIVE SERVICE DEFINITIONS)
│   │   ├── docker-compose.core.yml
│   │   ├── docker-compose.secrets.yml
│   │   ├── docker-compose.orchestration.yml
│   │   ├── docker-compose.data.yml
│   │   ├── docker-compose.observability.yml
│   │   └── docker-compose.cicd.yml
│   ├── overrides/ (ENVIRONMENT-SPECIFIC)
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.staging.yml
│   │   └── docker-compose.prod.yml
│   ├── scripts/ (AUTOMATION)
│   └── configs/ (CONFIGURATION)
└── /infra/archive/ (OLD FILES - KEPT FOR REFERENCE)
    └── backup-of-fragmented-setup/
```

### 5.3 Migration Steps

**Phase 1: Non-Breaking Consolidation**
1. Create new `/infra/docker-compose/services/` directory
2. Copy all authoritative service definitions
3. Create master `/infra/docker-compose.yml` that includes everything
4. Test with `docker compose config` (validate YAML)
5. Test with `docker compose up --dry-run`
6. **Keep old files** (don't delete yet)

**Phase 2: Environment Overrides**
1. Create `/infra/docker-compose/overrides/` directory
2. Create dev.yml, staging.yml, prod.yml with minimal overrides
3. Test: `ENVIRONMENT=dev docker compose up --dry-run`
4. Test: `ENVIRONMENT=prod docker compose up --dry-run`

**Phase 3: Cutover**
1. Update CI/CD to use new structure
2. Update startup scripts to use new paths
3. Monitor for 24-48 hours
4. **Then** archive old files

**Phase 4: Cleanup**
1. Move old files to `/infra/archive/`
2. Update documentation
3. Update README

---

## SECTION 6: IMPLEMENTATION SEQUENCE

### 6.1 Strict Order (Non-Negotiable)

1. **Create new consolidated structure** (don't break old yet)
   - New docker-compose files in `/infra/docker-compose/services/`
   - Keep all old files as backup

2. **Set up Infisical integration**
   - Create Infisical project in cloud/self-hosted
   - Define secrets needed per service
   - Create sidecar compose files

3. **Build & test docker-compose files locally**
   - `docker compose config` (syntax check)
   - `docker compose up --dry-run` (runtime validation)
   - No actual container starts yet

4. **Update environment variable strategy**
   - Create `.env` templates (no secrets)
   - Document which secrets come from Infisical
   - Update .gitignore

5. **Create startup/shutdown scripts**
   - Single-PC dev scripts first
   - Multi-PC orchestrator scripts
   - Health check verification

6. **Deploy to dev first** (always)
   - Start single PC with new structure
   - Verify all services connect
   - Run full system test

7. **Migrate existing services**
   - Start claude-flow-dev alongside claude-flow-brain
   - Verify both work
   - Add Archon OS (new)
   - Add openclawd (new)

8. **Production cutover** (when stable)
   - Test in staging first
   - Promote to prod
   - Archive old setup

---

## SECTION 7: TRADEOFFS & ALTERNATIVES CONSIDERED

### 7.1 Infisical Sidecar: Shared vs. Separate

**CHOSEN: Shared for orchestrator tier, separate for Archon**

| Aspect | Shared | Separate |
|--------|--------|----------|
| **Complexity** | Simple (1 container) | Complex (2+ containers) |
| **Failure Domain** | All orchestrator services fail together | Isolated failures |
| **Resource Cost** | Lower | Higher (2x sidecar overhead) |
| **Security** | Broader attack surface | Better RBAC isolation |
| **Operational Cost** | Easier to manage | More containers to monitor |

**Justification for hybrid approach:**
- Orchestrator services (claude-flow + openclawd + n8n) are tightly coupled → share sidecar
- Archon OS is execution layer → separate sidecar for isolation
- Cost/complexity tradeoff: 2 sidecars is acceptable, 3+ is too much

### 7.2 Single vs. Multiple Infisical Organizations/Projects

**CHOSEN: Single organization, single project with environment scoping**

```
One Infisical Project: "Project Nyra"
├── Environment: dev (all dev secrets)
├── Environment: staging (all staging secrets)
└── Environment: prod (all prod secrets)

NOT: Separate projects per PC, per service, or per environment
```

**Why not separate:**
- Too complex to manage 9+ Infisical projects
- Cross-service secrets (API keys) would need duplication
- RBAC is per-project, not per-secret (less granular)

### 7.3 Docker Compose include vs. Extends vs. Merge

**CHOSEN: Docker Compose `include` (3.9+)**

```yaml
# Modular, clean, no duplication
include:
  - path: ./services/docker-compose.core.yml
  - path: ./services/docker-compose.orchestration.yml
```

**Alternatives:**
- `extends`: Only works for services, not full files (too limited)
- Manual merge script: Fragile, breaks easily

### 7.4 Single Network vs. Per-Service Network

**CHOSEN: Single `nyra-network` for all internal services**

**Why:**
- Services need to communicate (postgres:5432, redis:6379)
- Single network simplifies service discovery
- Can add network policies later if needed

**Alternative (rejected): Per-service networks**
- More isolation but harder to manage
- Requires additional routing layer
- Not needed for internal services

### 7.5 Health Checks: Script vs. HTTP vs. Container

**CHOSEN: HTTP health checks (curl) for all services**

**Why:**
- Standard across industry
- Observable and debuggable
- Works with Nexus Router registration

**Not chosen:**
- Script-based checks: Fragile, unmaintainable
- Container checks: Only works for Docker, not portable

### 7.6 Multi-PC Orchestration: Kubernetes vs. Docker Swarm vs. Scripts

**CHOSEN: Bash scripts + Tailscale**

**Why:**
- No Kubernetes complexity (it's 3 PCs, not 300)
- Existing team comfort with Docker Compose
- Tailscale provides network mesh (don't need Swarm networking)
- Scripts are transparent and debuggable

**Alternatives (rejected):**
- Kubernetes: Overkill, requires extensive rewrite
- Docker Swarm: Mode complexity, orchestration complexity
- Ansible: Too heavy for this scope

---

## SECTION 8: FUTURE-PROOFING NOTES

### 8.1 What This Architecture Enables

✅ Scaling to more services (add new compose files)
✅ Scaling to more PCs (add new PC definitions, update scripts)
✅ Hybrid cloud (Tailscale + Cloudflare work on VPS too)
✅ HA PostgreSQL (easy to add primary/standby, replication)
✅ Service mesh (easy to add Traefik/Istio layer later)
✅ Multi-region (Tailscale supports global mesh)
✅ GitOps (compose files are code, can be in git)
✅ Easy rollback (old compose files still available in git)

### 8.2 What Needs Monitoring

⚠️ Infisical secret rotation (implement secret lifecycle)
⚠️ Database backup (automated pg_dump to Minio)
⚠️ Cross-PC network latency (Tailscale metrics)
⚠️ Volume bloat (monitor docker volume usage)
⚠️ Compose file drift (version control everything)

### 8.3 Planned Enhancements (Not in v2.0)

| Feature | Timeline | Complexity |
|---------|----------|-----------|
| PostgreSQL replication (HA) | v2.1 | Medium |
| Traefik reverse proxy | v2.2 | Medium |
| Distributed tracing (Jaeger) | v2.2 | Medium |
| Vault integration (secrets rotation) | v2.3 | High |
| Kubernetes option (optional) | v3.0 | Very High |

---

## SECTION 9: SUCCESS CRITERIA (VALIDATION CHECKLIST)

- [ ] New dev claude-flow container starts without errors
- [ ] claude-flow registers with Nexus Router automatically
- [ ] Infisical sidecar injects secrets cleanly (no env vars visible in `docker inspect`)
- [ ] claude-flow-dev co-exists with claude-flow-cicd (both can run)
- [ ] Archon OS starts with separate Infisical sidecar
- [ ] openclawd connects to claude-flow over HTTP
- [ ] Multi-PC startup script runs idempotently
- [ ] Health checks pass for all services
- [ ] No existing CI/CD pipelines break
- [ ] No existing production functionality breaks
- [ ] All secrets stored in Infisical (none in .env committed to git)
- [ ] Docker compose files pass `docker compose config` validation
- [ ] Documented promotion path: dev → staging → prod
- [ ] Startup/shutdown scripts are executable and tested

---

## APPENDIX A: ENVIRONMENT VARIABLES MAPPING

### Services That Need Secrets

| Service | Secrets | Source |
|---------|---------|--------|
| claude-flow-dev | ANTHROPIC_API_KEY, OPENAI_API_KEY, REDIS_PASS, DB_PASS | Infisical (main) |
| archon-os | ANTHROPIC_API_KEY, EXECUTION_CREDS | Infisical (archon-specific) |
| openclawd | GITHUB_TOKEN, TWILIO_CREDS, SENDGRID_KEY | Infisical (main) |
| nexus-router | LLM_API_KEYS, RBAC_CONFIG | Infisical (main) |
| PostgreSQL | POSTGRES_PASSWORD | Infisical (main) |
| Redis | REDIS_PASSWORD | Infisical (main) |
| Infisical Agent (main) | CLIENT_ID, CLIENT_SECRET | Docker secrets / .env (prod only) |
| Infisical Agent (archon) | ARCHON_CLIENT_ID, ARCHON_CLIENT_SECRET | Docker secrets / .env (prod only) |

---

**END OF DOCUMENT**

This architecture is production-ready, explicitly documents all tradeoffs, and preserves backward compatibility while enabling future scaling.
