# Nexus Router Integration Architecture
## Docker Services Integration Design for Project Nyra

**Version**: 1.0.0
**Date**: 2026-01-18
**Status**: Design Specification
**Author**: System Architecture Designer

---

## Executive Summary

This document specifies the integration architecture for connecting consolidated Docker services to the Nexus Router, which serves as the unified MCP (Model Context Protocol) + LLM Gateway for Project Nyra. The design ensures seamless service discovery, intelligent routing, and centralized configuration management across the distributed infrastructure.

### Key Design Principles

1. **Single Entry Point**: Nexus Router (Port 6000) as the unified gateway
2. **Service Mesh Architecture**: All services communicate through Nexus
3. **Zero-Configuration Registration**: Auto-discovery via Docker labels and health checks
4. **Intelligent Routing**: Priority-based, health-aware, cost-optimized routing
5. **Fault Tolerance**: Circuit breakers, failover chains, retry logic
6. **Security-First**: JWT authentication, mTLS, policy-based access control

---

## 1. System Architecture Overview

### 1.1 Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  Claude Code, Web UI, API Clients, External Integrations    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  NEXUS ROUTER LAYER                          │
│  Port 6000 - Unified MCP + LLM Gateway                      │
│  - MCP Server Aggregation (22+ servers)                     │
│  - LLM Model Routing (Claude, Gemini, OpenRouter)           │
│  - Fuzzy Tool Search (Levenshtein + Keyword Aliases)        │
│  - Authentication & Authorization (JWT + Policies)          │
│  - Rate Limiting, Caching, Circuit Breakers                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ORCHESTRATOR│ │   WORKER    │ │  STORAGE    │
│   SERVICES  │ │  SERVICES   │ │  SERVICES   │
└─────────────┘ └─────────────┘ └─────────────┘
│               │               │
│ - Nexus Router│ - TwentyCRM   │ - Neo4j      │
│ - Claude Flow │ - n8n         │ - Qdrant     │
│ - Letta       │ - Dify        │ - Redis      │
│ - Mem0        │ - Ollama      │ - PostgreSQL │
│ - ruvector     │ - Activepieces│ - MongoDB    │
│ - RuVector    │ - Composio    │              │
│ - Infisical   │               │              │
└───────────────┘ └─────────────┘ └────────────┘
```

### 1.2 Network Topology

**Network**: `nyra-network` (Docker bridge network)
**Subnet**: `172.20.0.0/16` (expandable to 65,534 hosts)
**DNS**: Docker internal DNS (service name resolution)
**Isolation**: Container-to-container communication only (no direct external access)

---

## 2. Service Registration Mechanism

### 2.1 Auto-Discovery via Docker Labels

All services MUST include standardized Docker labels for automatic registration:

```yaml
services:
  example-service:
    image: example/service:latest
    labels:
      # REQUIRED LABELS
      - "nyra.service.name=example-service"
      - "nyra.service.type=mcp-server"  # Options: mcp-server, storage, utility
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"       # Options: http, sse, stdio
      - "nyra.mcp.port=8080"

      # OPTIONAL LABELS
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=crm,contacts,leads,deals"
      - "nyra.mcp.priority=1"           # 1=high, 2=medium, 3=low
      - "nyra.mcp.fuzzy_match=true"
      - "nyra.policy=borrower_minimal_tools"  # Access control policy

      # METADATA
      - "nyra.description=CRM operations for leads and contacts"
      - "nyra.version=1.0.0"
      - "nyra.maintainer=nyra-team"
```

### 2.2 Registration Flow

```
1. Container Start
   └─→ Docker Event: Container Created
       └─→ Nexus Service Discovery Agent
           ├─→ Parse Docker Labels
           ├─→ Extract MCP Configuration
           ├─→ Perform Health Check
           └─→ Register with Nexus Router
               ├─→ Add to MCP Server Pool
               ├─→ Update Fuzzy Search Index
               └─→ Apply Access Policies

2. Health Monitoring
   └─→ Periodic Health Checks (30s interval)
       ├─→ HTTP GET to health_endpoint
       ├─→ Check Response Time < 5s
       └─→ Update Service Status
           ├─→ healthy → keep in pool
           ├─→ unhealthy → remove from pool (circuit breaker)
           └─→ recovered → re-add to pool

3. Container Stop
   └─→ Docker Event: Container Stopped
       └─→ Deregister from Nexus Router
           ├─→ Remove from MCP Server Pool
           └─→ Update Fuzzy Search Index
```

### 2.3 Service Discovery Sidecar Pattern

For services that need dynamic configuration updates:

```yaml
services:
  service-discovery:
    image: ghcr.io/ruv-inc/nexus-discovery:latest
    container_name: nexus-discovery
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    environment:
      - NEXUS_ROUTER_URL=http://nexus-router:6000
      - NEXUS_ADMIN_TOKEN=${NEXUS_ADMIN_TOKEN}
      - DISCOVERY_INTERVAL=30s
      - HEALTH_CHECK_TIMEOUT=5s
    networks:
      - nyra-network
    depends_on:
      - nexus-router
```

---

## 3. Routing Configuration

### 3.1 MCP Server Routing Rules

Nexus Router applies the following routing logic:

```yaml
routing:
  strategy: priority_weighted  # Priority + health + latency

  # Rule 1: Priority-based routing
  priority_routing:
    high_priority: ["letta", "qdrant", "twentycrm", "archon-os"]
    medium_priority: ["context7", "exa", "serena", "gemini"]
    low_priority: ["composio", "sequential-thinking", "inception"]

  # Rule 2: Health-aware routing
  health_checks:
    enabled: true
    interval: 30s
    timeout: 5s
    retries: 3
    circuit_breaker:
      enabled: true
      failure_threshold: 5
      recovery_time: 60s

  # Rule 3: Fuzzy tool matching
  fuzzy_matching:
    enabled: true
    threshold: 0.7  # 70% similarity required
    algorithm: levenshtein
    keyword_expansion: true

  # Rule 4: Load balancing
  load_balancing:
    enabled: true
    algorithm: least_connections
    sticky_sessions: false
```

### 3.2 LLM Model Routing Strategy

Cost-optimized routing with intelligent fallback:

```yaml
llm_routing:
  strategy: cost_optimized

  # Routing rules based on task complexity
  rules:
    - name: cheap_tasks_to_gemini
      condition:
        token_count: "< 1000"
        complexity: low
        keywords: ["classify", "score", "update", "status", "extract"]
      route_to: gemini-flash  # $0.075/$0.30 per million tokens

    - name: complex_to_claude_opus
      condition:
        complexity: high
        keywords: ["plan", "architect", "design", "strategize"]
        tool_use: required
      route_to: claude-opus  # $15/$75 per million tokens

    - name: balanced_to_claude_sonnet
      condition:
        complexity: medium
        keywords: ["code", "implement", "review", "refactor"]
      route_to: claude-sonnet  # $3/$15 per million tokens

  # Fallback chain
  fallback_chain:
    - gemini-flash
    - claude-sonnet
    - claude-opus
    - openrouter  # Last resort
```

---

## 4. Port Allocation Strategy

### 4.1 Port Range Assignment

Standardized port ranges for different service types:

| Port Range | Service Type | Examples |
|------------|-------------|----------|
| `6000-6099` | Gateway Services | Nexus Router (6000), API Gateway (6001) |
| `7000-7099` | Core Infrastructure | Redis (7000), Neo4j (7001) |
| `7400-7499` | MCP Servers (Filesystem/Git) | Filesystem (7400), Git (7401), GitHub (7402) |
| `8000-8099` | MCP Servers (Knowledge/Memory) | ruvector (8000), letta (8001), Qdrant (8002) |
| `8080-8199` | MCP Servers (Integration/Tools) | TwentyCRM (8080), Dify (8081), VSCode (8082) |
| `9000-9099` | Monitoring & Observability | Prometheus (9000), Grafana (9001), Loki (9002) |
| `10000-10999` | Worker Services | Ollama (10000), Activepieces (10001), n8n (10002) |
| `11000-11999` | Database Services | PostgreSQL (11000), MongoDB (11001) |

### 4.2 Current Port Assignments (from existing configs)

**Orchestrator Services** (`docker-compose.orchestrator.yml`):
- Nexus Router: `6000`
- Letta: `8283`
- Mem0: `4321`
- Qdrant: `6333`, `6334`
- Claude Flow: `3010`
- ruvector: `8080`
- RuVector: `8888`
- Infisical: `8080` (conflict - needs reassignment to `8090`)
- Redis: `6380`

**Worker Services** (`docker-compose.worker.yml`):
- TwentyCRM: `3000`
- n8n: `5678`
- Dify API: `3001`
- Dify Web: `3002`
- Ollama: `11434`
- Neo4j: `7474` (HTTP), `7687` (Bolt)
- Prometheus: `9090`
- Grafana: `3005`
- Loki: `3100`
- Alertmanager: `9093`

**MCP Servers** (`docker-compose.nexus-mcp.yml`):
- letta: `7459`
- Qdrant MCP: `8066`
- Context7: `7460`
- Exa: `7461`
- Supabase: `7462`
- VSCode: `8081`
- TwentyCRM MCP: `8082`
- Dify MCP: `8083`
- Serena: `8084`
- Gemini: `8085`
- Composio: `8086`

### 4.3 Recommended Port Realignment

To avoid conflicts and follow standardized ranges:

```yaml
# PROPOSED PORT REALIGNMENT
orchestrator_services:
  nexus_router: 6000      # Gateway - no change
  claude_flow: 6010       # Gateway extension
  redis: 7000            # Core infra (from 6380)

mcp_servers:
  filesystem: 7400       # Already assigned
  github: 7402           # Already assigned
  ruvector: 8000          # Core (from 8080)
  letta: 8001         # Core (from 7459)
  qdrant: 8002           # Core (from 8066)
  ruvector: 8003         # Core (from 8888)

  twentycrm: 8080        # Integration (from 8082)
  dify: 8081             # Integration (from 8083)
  vscode: 8082           # Integration (from 8081)
  serena: 8083           # Integration (from 8084)
  gemini: 8084           # Integration (from 8085)
  composio: 8085         # Integration (from 8086)

monitoring:
  prometheus: 9000       # Monitoring (from 9090)
  grafana: 9001          # Monitoring (from 3005)
  loki: 9002             # Monitoring (from 3100)
  alertmanager: 9003     # Monitoring (from 9093)

worker_services:
  ollama: 10000          # Worker (from 11434)
  n8n: 10001             # Worker (from 5678)
  activepieces: 10002    # Worker

storage:
  postgres: 11000        # Database
  mongodb: 11001         # Database
  neo4j_http: 11002      # Database (from 7474)
  neo4j_bolt: 11003      # Database (from 7687)
```

---

## 5. Service Wiring Specifications

### 5.1 Orchestrator Stack Integration

**File**: `infra/docker-compose.orchestrator.yml`

```yaml
version: '3.9'

networks:
  nyra-network:
    driver: bridge
    name: nyra-network
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1

volumes:
  nexus-cache:
  ruvector-data:
  ruvector-data:
  redis-data:
  letta-data:
  mem0-data:

services:
  # ============================================================================
  # NEXUS ROUTER - Central Gateway
  # ============================================================================
  nexus-router:
    image: grafbase/nexus:latest
    container_name: nyra-nexus-router
    hostname: nexus-router
    restart: unless-stopped

    ports:
      - "6000:6000"

    environment:
      # Authentication
      - NEXUS_JWT_SECRET=${NEXUS_JWT_SECRET:-change-me-jwt-secret}
      - NEXUS_ADMIN_TOKEN=${NEXUS_ADMIN_TOKEN:-change-me-admin-token}

      # LLM Provider Keys
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}

      # Service Discovery
      - NEXUS_DISCOVERY_ENABLED=true
      - NEXUS_DISCOVERY_DOCKER_SOCKET=/var/run/docker.sock

      # Caching
      - REDIS_URL=redis://redis:6379

      # Logging
      - LOG_LEVEL=${LOG_LEVEL:-info}
      - LOG_FORMAT=json

    volumes:
      - ./nexus/nexus-complete.yaml:/etc/nexus/nexus.yaml:ro
      - nexus-cache:/var/lib/nexus
      - /var/run/docker.sock:/var/run/docker.sock:ro  # For service discovery

    networks:
      nyra-network:
        ipv4_address: 172.20.0.10

    labels:
      - "nyra.service.name=nexus-router"
      - "nyra.service.type=gateway"
      - "nyra.tier=orchestrator"
      - "nyra.critical=true"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 30s

    depends_on:
      redis:
        condition: service_healthy
      neo4j:
        condition: service_healthy
      qdrant:
        condition: service_healthy

  # ============================================================================
  # REDIS - Caching & Message Broker
  # ============================================================================
  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    hostname: redis
    restart: unless-stopped

    ports:
      - "7000:6379"

    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD:-nyra-redis-pass}
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
      --save 900 1
      --save 300 10
      --save 60 10000

    volumes:
      - redis-data:/data

    networks:
      nyra-network:
        ipv4_address: 172.20.0.20

    labels:
      - "nyra.service.name=redis"
      - "nyra.service.type=storage"
      - "nyra.tier=orchestrator"

    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  # ============================================================================
  # CLAUDE FLOW - AI Orchestration
  # ============================================================================
  archon-os:
    image: ghcr.io/ruvnet/archon-os:3.0.0-alpha.104
    container_name: nyra-archon-os
    hostname: archon-os
    restart: unless-stopped

    ports:
      - "6010:3010"

    environment:
      # Authentication
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}

      # Nexus Integration
      - NEXUS_ROUTER_URL=http://nexus-router:6000
      - NEXUS_API_KEY=${NEXUS_ADMIN_TOKEN}

      # Swarm Configuration
      - CLAUDE_FLOW_MODE=orchestrator
      - SWARM_MAX_AGENTS=31
      - SWARM_TOPOLOGY=hierarchical
      - CONSENSUS_ALGORITHM=raft

      # Memory Integration
      - ruvector_URL=http://ruvector:8000
      - RUVECTOR_URL=http://ruvector:8003
      - REASONINGBANK_ENABLED=true

      # Logging
      - LOG_LEVEL=${LOG_LEVEL:-info}

    volumes:
      - ./archon-os/config:/app/config:ro
      - ruvector-data:/app/data

    networks:
      nyra-network:
        ipv4_address: 172.20.0.30

    labels:
      - "nyra.service.name=archon-os"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"
      - "nyra.mcp.port=3010"
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=ai,orchestration,swarm,coordination"
      - "nyra.mcp.priority=1"
      - "nyra.policy=internal_ops_full_tools"
      - "nyra.tier=orchestrator"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
      interval: 20s
      timeout: 5s
      retries: 3

    depends_on:
      nexus-router:
        condition: service_healthy
      ruvector:
        condition: service_healthy

  # ============================================================================
  # ruvector - HNSW Vector Database
  # ============================================================================
  ruvector:
    image: ghcr.io/ruvnet/ruvector:latest
    container_name: nyra-ruvector
    hostname: ruvector
    restart: unless-stopped

    ports:
      - "8000:8080"

    environment:
      # HNSW Configuration
      - ruvector_HNSW_M=16
      - ruvector_HNSW_EF_CONSTRUCTION=200
      - ruvector_HNSW_EF_SEARCH=100

      # Quantization
      - ruvector_QUANTIZATION=scalar  # Options: none, scalar, product

      # Cache
      - ruvector_CACHE_SIZE=256
      - ruvector_CACHE_TTL=3600

      # Logging
      - LOG_LEVEL=${LOG_LEVEL:-info}

    volumes:
      - ruvector-data:/app/data

    networks:
      nyra-network:
        ipv4_address: 172.20.0.40

    labels:
      - "nyra.service.name=ruvector"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"
      - "nyra.mcp.port=8080"
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=vector,database,memory,search,embeddings"
      - "nyra.mcp.priority=1"
      - "nyra.policy=orchestrator_tools"
      - "nyra.tier=orchestrator"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 20s
      timeout: 5s
      retries: 3

  # ============================================================================
  # RUVECTOR - Intelligence Layer
  # ============================================================================
  ruvector:
    image: ghcr.io/ruvnet/ruvector:latest
    container_name: nyra-ruvector
    hostname: ruvector
    restart: unless-stopped

    ports:
      - "8003:8888"

    environment:
      # SONA Configuration
      - RUVECTOR_SONA_ENABLED=true
      - RUVECTOR_SONA_LEARNING_RATE=0.001
      - RUVECTOR_SONA_ADAPTATION_THRESHOLD=0.05

      # MoE Configuration
      - RUVECTOR_MOE_ENABLED=true
      - RUVECTOR_MOE_NUM_EXPERTS=8
      - RUVECTOR_MOE_TOP_K=2

      # Flash Attention
      - RUVECTOR_FLASH_ATTENTION=true
      - RUVECTOR_FLASH_ATTENTION_WINDOW=2048

      # EWC++ (Prevent forgetting)
      - RUVECTOR_EWC_ENABLED=true
      - RUVECTOR_EWC_LAMBDA=1000

      # Logging
      - LOG_LEVEL=${LOG_LEVEL:-info}

    volumes:
      - ruvector-data:/app/data

    networks:
      nyra-network:
        ipv4_address: 172.20.0.50

    labels:
      - "nyra.service.name=ruvector"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"
      - "nyra.mcp.port=8888"
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=intelligence,learning,adaptation,neural"
      - "nyra.mcp.priority=1"
      - "nyra.policy=orchestrator_tools"
      - "nyra.tier=orchestrator"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/health"]
      interval: 20s
      timeout: 5s
      retries: 3
```

### 5.2 Worker Stack Integration

**File**: `infra/docker-compose.worker.yml`

```yaml
version: '3.9'

networks:
  nyra-network:
    external: true
    name: nyra-network

volumes:
  twentycrm-data:
  n8n-data:
  dify-data:
  ollama-data:

services:
  # ============================================================================
  # TWENTYCRM - CRM System
  # ============================================================================
  twentycrm:
    image: twentycrm/twenty:latest
    container_name: nyra-twentycrm
    hostname: twentycrm
    restart: unless-stopped

    ports:
      - "8080:3000"

    environment:
      # Database
      - DATABASE_URL=postgresql://twentycrm:${TWENTYCRM_PG_PASSWORD}@postgres-twentycrm:5432/twentycrm

      # Redis
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

      # Authentication
      - JWT_SECRET=${TWENTYCRM_JWT_SECRET}

      # Application
      - APP_URL=http://172.20.0.1:8080
      - STORAGE_TYPE=local
      - STORAGE_LOCAL_PATH=/app/data

    volumes:
      - twentycrm-data:/app/data

    networks:
      nyra-network:
        ipv4_address: 172.20.1.10

    labels:
      - "nyra.service.name=twentycrm"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"
      - "nyra.mcp.port=3000"
      - "nyra.mcp.base_path=/api/mcp"
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=crm,contacts,leads,deals,borrower,customer"
      - "nyra.mcp.priority=1"
      - "nyra.mcp.fuzzy_match=true"
      - "nyra.policy=borrower_minimal_tools"
      - "nyra.tier=worker"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

    depends_on:
      postgres-twentycrm:
        condition: service_healthy

  # ============================================================================
  # N8N - Workflow Automation
  # ============================================================================
  n8n:
    image: n8nio/n8n:latest
    container_name: nyra-n8n
    hostname: n8n
    restart: unless-stopped

    ports:
      - "10001:5678"

    environment:
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres-n8n
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=${N8N_PG_PASSWORD}

      # Authentication
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}

      # Application
      - WEBHOOK_URL=http://172.20.0.1:10001
      - GENERIC_TIMEZONE=America/New_York

    volumes:
      - n8n-data:/home/node/.n8n

    networks:
      nyra-network:
        ipv4_address: 172.20.1.20

    labels:
      - "nyra.service.name=n8n"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"
      - "nyra.mcp.port=5678"
      - "nyra.mcp.base_path=/webhook/mcp"
      - "nyra.mcp.health_endpoint=/healthz"
      - "nyra.mcp.keywords=workflow,automation,orchestration,integration"
      - "nyra.mcp.priority=1"
      - "nyra.policy=internal_ops_full_tools"
      - "nyra.tier=worker"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

    depends_on:
      postgres-n8n:
        condition: service_healthy

  # ============================================================================
  # OLLAMA - Local LLM Inference
  # ============================================================================
  ollama:
    image: ollama/ollama:latest
    container_name: nyra-ollama
    hostname: ollama
    restart: unless-stopped

    ports:
      - "10000:11434"

    environment:
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_NUM_PARALLEL=4
      - OLLAMA_MAX_LOADED_MODELS=3

    volumes:
      - ollama-data:/root/.ollama

    networks:
      nyra-network:
        ipv4_address: 172.20.1.30

    labels:
      - "nyra.service.name=ollama"
      - "nyra.service.type=llm-provider"
      - "nyra.llm.enabled=true"
      - "nyra.llm.type=local"
      - "nyra.llm.models=llama3,mistral,codellama"
      - "nyra.tier=worker"

    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434/api/tags"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 5.3 MCP Server Wiring Template

For adding new MCP servers:

```yaml
  new-mcp-service:
    image: your-org/mcp-service:latest
    container_name: nyra-new-mcp
    hostname: new-mcp
    restart: unless-stopped

    ports:
      - "80XX:8080"  # Use next available port in 8000-8199 range

    environment:
      # Service-specific configuration
      - SERVICE_CONFIG=value

      # Nexus integration (optional - if service needs to call other services)
      - NEXUS_ROUTER_URL=http://nexus-router:6000
      - NEXUS_API_KEY=${NEXUS_ADMIN_TOKEN}

    networks:
      nyra-network:
        ipv4_address: 172.20.X.Y  # Assign next available IP

    labels:
      # REQUIRED LABELS
      - "nyra.service.name=new-mcp"
      - "nyra.service.type=mcp-server"
      - "nyra.mcp.enabled=true"
      - "nyra.mcp.transport=http"  # or sse, stdio
      - "nyra.mcp.port=8080"

      # OPTIONAL LABELS
      - "nyra.mcp.base_path=/api"  # If API is not at root
      - "nyra.mcp.health_endpoint=/health"
      - "nyra.mcp.keywords=keyword1,keyword2,keyword3"
      - "nyra.mcp.priority=1"  # 1=high, 2=medium, 3=low
      - "nyra.mcp.fuzzy_match=true"
      - "nyra.policy=internal_ops_full_tools"  # Access policy
      - "nyra.tier=worker"

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

    depends_on:
      - nexus-router
```

---

## 6. Environment Configuration

### 6.1 Centralized Environment Variables

**File**: `.env.nexus`

```bash
# =============================================================================
# NEXUS ROUTER CONFIGURATION
# =============================================================================

# Authentication
NEXUS_JWT_SECRET=your-secure-jwt-secret-change-me-64-chars-minimum-required
NEXUS_ADMIN_TOKEN=your-secure-admin-token-change-me-64-chars-minimum-required

# LLM Provider API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...
GOOGLE_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-proj-...
OPENROUTER_API_KEY=sk-or-v1-...

# Vertex AI (optional)
VERTEX_AI_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# =============================================================================
# SERVICE CONFIGURATION
# =============================================================================

# Redis
REDIS_PASSWORD=nyra-redis-secure-password-change-me

# PostgreSQL (shared credentials template)
POSTGRES_PASSWORD=nyra-postgres-secure-password-change-me

# TwentyCRM
TWENTYCRM_PG_PASSWORD=twentycrm-db-password-change-me
TWENTYCRM_JWT_SECRET=twentycrm-jwt-secret-change-me

# n8n
N8N_PG_PASSWORD=n8n-db-password-change-me
N8N_USER=admin
N8N_PASSWORD=n8n-admin-password-change-me

# Dify
DIFY_PG_PASSWORD=dify-db-password-change-me
DIFY_SECRET_KEY=dify-secret-key-change-me
DIFY_API_KEY=sk-dify-...

# Letta
LETTA_PG_PASSWORD=letta-db-password-change-me

# Neo4j
NEO4J_PASSWORD=neo4j-password-change-me

# Qdrant
QDRANT_API_KEY=qdrant-api-key-change-me

# Infisical
INFISICAL_ENCRYPTION_KEY=infisical-encryption-key-32-chars
INFISICAL_JWT_SECRET=infisical-jwt-secret-change-me

# Context7
CONTEXT7_API_KEY=context7-api-key-if-needed

# Exa
EXA_API_KEY=exa-api-key-if-needed

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Composio
COMPOSIO_API_KEY=composio-api-key-change-me
COMPOSIO_WORKSPACE=nyra

# Activepieces
ACTIVEPIECES_API_KEY=activepieces-api-key-change-me

# Serena
SERENA_API_KEY=serena-api-key-if-needed

# Gemini (if different from GOOGLE_API_KEY)
GOOGLE_GEMINI_API_KEY=${GOOGLE_API_KEY}

# GitHub
GITHUB_TOKEN=ghp_...

# =============================================================================
# NETWORK CONFIGURATION
# =============================================================================

# LAN IP for external access
LAN_IP=192.168.1.100

# Timezone
NYRA_TIMEZONE=America/New_York

# Repository root (for git MCP)
NYRA_REPO_ROOT=/workspace/Project-Nyra

# =============================================================================
# OBSERVABILITY
# =============================================================================

# Log Level
LOG_LEVEL=info  # Options: debug, info, warn, error

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=grafana-admin-password-change-me

# =============================================================================
# DOCKER HOST (for MCP docker server)
# =============================================================================

DOCKER_HOST=unix:///var/run/docker.sock
```

### 6.2 Loading Environment Variables

**Orchestrator Stack**:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra
docker compose -f docker-compose.orchestrator.yml --env-file .env.nexus up -d
```

**Worker Stack**:
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra
docker compose -f docker-compose.worker.yml --env-file .env.nexus --profile worker-2 up -d
```

---

## 7. Health Check & Service Discovery

### 7.1 Health Check Standards

All services MUST implement a health endpoint:

**GET** `/health`

Response format:
```json
{
  "status": "healthy",  // Options: healthy, degraded, unhealthy
  "timestamp": "2026-01-18T10:30:00Z",
  "service": "twentycrm",
  "version": "1.0.0",
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "external_api": "degraded"
  },
  "metrics": {
    "uptime_seconds": 3600,
    "requests_per_minute": 45,
    "error_rate": 0.001
  }
}
```

### 7.2 Service Discovery Flow

```mermaid
sequenceDiagram
    participant Docker
    participant Discovery
    participant Nexus
    participant Service

    Docker->>Discovery: Container Started Event
    Discovery->>Service: HTTP GET /health
    Service-->>Discovery: 200 OK {status: healthy}
    Discovery->>Nexus: POST /api/admin/register
    Note over Nexus: Parse labels<br/>Extract MCP config<br/>Add to server pool
    Nexus-->>Discovery: 201 Created {server_id: abc123}

    loop Every 30 seconds
        Nexus->>Service: HTTP GET /health
        Service-->>Nexus: 200 OK
    end

    alt Service becomes unhealthy
        Nexus->>Service: HTTP GET /health
        Service-->>Nexus: 503 Service Unavailable
        Note over Nexus: Remove from pool<br/>Activate circuit breaker
    end

    Docker->>Discovery: Container Stopped Event
    Discovery->>Nexus: DELETE /api/admin/deregister/{server_id}
    Nexus-->>Discovery: 204 No Content
```

---

## 8. Security Architecture

### 8.1 Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Network Isolation                                  │
│ - Docker bridge network (172.20.0.0/16)                     │
│ - No direct external access to services                     │
│ - All traffic through Nexus Router (6000)                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 2: Authentication & Authorization                     │
│ - JWT tokens (HS256 algorithm)                              │
│ - Admin tokens for service-to-service                       │
│ - Policy-based access control (borrower/internal/dev)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 3: Transport Security                                 │
│ - mTLS for service-to-service (future)                      │
│ - API key rotation (90-day lifecycle)                       │
│ - Rate limiting (per-client, per-endpoint)                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ Layer 4: Data Protection                                    │
│ - Secrets managed by Infisical                              │
│ - Encrypted volumes (LUKS)                                  │
│ - PII redaction in logs                                     │
└─────────────────────────────────────────────────────────────┘
```

### 8.2 Access Control Policies

Defined in `nexus-complete.yaml`:

```yaml
policies:
  # Policy 1: Borrower-facing (minimal permissions)
  - name: borrower_minimal_tools
    description: "Restricted access for borrower-facing applications"
    allow_tools:
      - letta.*              # Knowledge graph access
      - twentycrm.search_*      # CRM search only
      - twentycrm.create_task   # Task creation only
      - activepieces.send_message  # Message sending
      - dify.*                  # Chat interface
    deny_tools:
      - filesystem.*            # No file access
      - github.*                # No git operations
      - docker.*                # No container control
      - vscode.*                # No code editing
      - supabase.drop_*         # No destructive DB ops
      - twentycrm.delete_*      # No record deletion

  # Policy 2: Internal operations (full access)
  - name: internal_ops_full_tools
    description: "Full access for internal systems and administrators"
    allow_tools:
      - "*"
    deny_tools: []

  # Policy 3: AI Orchestrators (controlled access)
  - name: orchestrator_tools
    description: "Access for Claude Flow and AI orchestrators"
    allow_tools:
      - letta.*
      - qdrant.*
      - context7.*
      - exa.*
      - serena.*
      - vscode.*
      - github.*
      - n8n.*
      - composio.*
    deny_tools:
      - docker.delete_*         # No container deletion
      - filesystem.delete       # No file deletion
      - twentycrm.delete_*      # No CRM record deletion
      - supabase.drop_*         # No DB schema changes

  # Policy 4: Development/Testing
  - name: development_tools
    description: "Access for development and testing environments"
    allow_tools:
      - vscode.*
      - github.*
      - filesystem.*
      - context7.*
      - exa.get_code_context
    deny_tools:
      - twentycrm.delete_*      # No production data deletion
      - supabase.drop_*         # No production schema changes
      - docker.delete_*         # No container deletion
```

### 8.3 Rate Limiting Configuration

```yaml
rate_limiting:
  enabled: true

  rules:
    # Default rate limit
    - name: default
      requests_per_minute: 60
      burst: 10
      scope: client

    # Expensive LLM models
    - name: expensive_llm
      models: ["claude-opus"]
      requests_per_minute: 10
      burst: 2
      scope: client
      cost_threshold: 100  # Max $100/hour per client

    # Cheap LLM models
    - name: cheap_llm
      models: ["gemini-flash"]
      requests_per_minute: 120
      burst: 20
      scope: client

    # MCP tool operations
    - name: mcp_tools
      requests_per_minute: 100
      burst: 15
      scope: client

    # Database operations
    - name: database_writes
      tools: ["supabase.insert", "supabase.update", "twentycrm.create_*"]
      requests_per_minute: 30
      burst: 5
      scope: client
```

---

## 9. Monitoring & Observability

### 9.1 Metrics Collection

Nexus Router exposes Prometheus metrics on port `9091`:

**Available Metrics**:
```
# Request metrics
nexus_http_requests_total{method, path, status}
nexus_http_request_duration_seconds{method, path}
nexus_http_requests_in_flight

# MCP server metrics
nexus_mcp_server_up{server_name}
nexus_mcp_tool_calls_total{server_name, tool_name, status}
nexus_mcp_tool_call_duration_seconds{server_name, tool_name}

# LLM routing metrics
nexus_llm_requests_total{provider, model, status}
nexus_llm_request_duration_seconds{provider, model}
nexus_llm_tokens_total{provider, model, type}  # type=input|output
nexus_llm_cost_total{provider, model}

# Health check metrics
nexus_health_check_total{server_name, status}
nexus_health_check_duration_seconds{server_name}

# Circuit breaker metrics
nexus_circuit_breaker_state{server_name, state}  # state=closed|open|half_open
nexus_circuit_breaker_failures_total{server_name}
```

### 9.2 Logging Standards

All services MUST log in JSON format:

```json
{
  "timestamp": "2026-01-18T10:30:00.123Z",
  "level": "info",
  "service": "nexus-router",
  "trace_id": "abc123def456",
  "span_id": "span789",
  "message": "MCP tool call successful",
  "context": {
    "server_name": "twentycrm",
    "tool_name": "twentycrm.create_contact",
    "duration_ms": 145,
    "status": "success"
  }
}
```

### 9.3 Grafana Dashboard

**Dashboard**: `Nexus Router - System Overview`

**Panels**:
1. **Request Rate** - Requests/sec by endpoint
2. **Error Rate** - 4xx/5xx errors over time
3. **Latency (p50, p95, p99)** - Response time distribution
4. **LLM Cost Tracking** - Cost per provider/model
5. **MCP Server Health** - Uptime and health status
6. **Circuit Breaker Status** - Open/closed state
7. **Top Tools by Usage** - Most called MCP tools
8. **Token Usage** - Input/output tokens by model

---

## 10. Deployment Procedures

### 10.1 Initial Deployment

```bash
# Step 1: Create network
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  nyra-network

# Step 2: Generate secrets
cd C:\Dev\Projects\Repos\Project-Nyra\infra
./scripts/generate-secrets.sh > .env.nexus

# Step 3: Deploy orchestrator stack
docker compose -f docker-compose.orchestrator.yml --env-file .env.nexus up -d

# Step 4: Wait for nexus router to be healthy
docker compose -f docker-compose.orchestrator.yml ps nexus-router
# Wait until status shows "healthy"

# Step 5: Deploy MCP servers
docker compose -f docker-compose.nexus-mcp.yml --env-file .env.nexus up -d

# Step 6: Deploy worker stacks (by profile)
docker compose -f docker-compose.worker.yml --env-file .env.nexus --profile worker-2 up -d
docker compose -f docker-compose.worker.yml --env-file .env.nexus --profile worker-3 up -d
docker compose -f docker-compose.worker.yml --env-file .env.nexus --profile worker-4 up -d

# Step 7: Verify all services registered
curl http://localhost:6000/api/admin/servers \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" | jq '.servers[] | {name, status, url}'
```

### 10.2 Rolling Updates

```bash
# Update a single service
docker compose -f docker-compose.orchestrator.yml up -d --no-deps --build ruvector

# Update all services in a stack
docker compose -f docker-compose.orchestrator.yml pull
docker compose -f docker-compose.orchestrator.yml up -d --remove-orphans
```

### 10.3 Health Verification

```bash
# Check all service health
docker compose -f docker-compose.orchestrator.yml ps

# Check Nexus Router status
curl http://localhost:6000/health | jq

# Check registered MCP servers
curl http://localhost:6000/api/admin/servers \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" | jq

# Test MCP tool call
curl http://localhost:6000/api/tools/letta.search_graph \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

---

## 11. Troubleshooting Guide

### 11.1 Common Issues

| Issue | Symptoms | Resolution |
|-------|----------|------------|
| Service not registered | Service running but not in `/api/admin/servers` | Check Docker labels, verify health endpoint, check service discovery logs |
| Circuit breaker open | `503 Service Unavailable` from Nexus | Check target service health, wait for recovery time (60s), manually reset circuit breaker |
| High latency | Slow response times | Check Prometheus metrics, identify slow MCP server, scale horizontally or optimize |
| Authentication failures | `401 Unauthorized` | Verify JWT secret matches, check token expiration, validate API key |
| Port conflicts | Container fails to start | Check port allocation, reassign to available port, update `.env.nexus` |

### 11.2 Diagnostic Commands

```bash
# View Nexus Router logs
docker logs nyra-nexus-router --tail 100 -f

# Check service health directly
docker exec nyra-nexus-router curl -f http://localhost:6000/health

# Inspect service labels
docker inspect nyra-twentycrm --format '{{json .Config.Labels}}' | jq

# Check network connectivity
docker exec nyra-archon-os ping -c 3 nexus-router

# View all registered services
curl http://localhost:6000/api/admin/servers \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" | jq

# Reset circuit breaker
curl -X POST http://localhost:6000/api/admin/circuit-breaker/reset \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
  -d '{"server_name": "twentycrm"}'
```

---

## 12. Future Enhancements

### 12.1 Planned Features (Q1 2026)

1. **mTLS for Service-to-Service Communication**
   - Certificate generation and rotation
   - Mutual authentication between services
   - Zero-trust network model

2. **Dynamic Service Discovery**
   - Consul integration for multi-host deployments
   - Auto-scaling based on load metrics
   - Blue-green deployment support

3. **Advanced Load Balancing**
   - Weighted round-robin
   - Geo-proximity routing
   - Cost-optimized routing (cheapest available)

4. **GraphQL Gateway**
   - Unified GraphQL schema across all MCP servers
   - Real-time subscriptions via WebSocket
   - Schema stitching and federation

### 12.2 Experimental Features

1. **AI-Powered Routing**
   - Use RuVector to learn optimal routing patterns
   - Predictive scaling based on historical patterns
   - Anomaly detection in request patterns

2. **Multi-Region Support**
   - Active-active deployment across regions
   - Latency-based routing
   - Global load balancing

---

## 13. Appendix

### 13.1 Complete Port Reference

See **Section 4.3** for recommended port realignment.

### 13.2 Environment Variable Reference

See **Section 6.1** for complete `.env.nexus` template.

### 13.3 Docker Label Schema

See **Section 2.1** for required and optional Docker labels.

### 13.4 Architecture Decision Records (ADRs)

- **ADR-001**: Nexus Router as Unified Gateway
  *Rationale*: Single entry point simplifies client integration, reduces latency, enables centralized policy enforcement.

- **ADR-002**: Docker Label-Based Service Discovery
  *Rationale*: Declarative configuration, no external service registry required, works with existing Docker infrastructure.

- **ADR-003**: Priority-Weighted Routing Strategy
  *Rationale*: Balances performance (priority), reliability (health checks), and cost (LLM routing).

- **ADR-004**: Standardized Port Range Allocation
  *Rationale*: Prevents conflicts, simplifies firewall rules, improves maintainability.

- **ADR-005**: JWT + Policy-Based Access Control
  *Rationale*: Industry-standard authentication, flexible authorization, supports multi-tenancy.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-18 | System Architecture Designer | Initial design specification |

---

**END OF DOCUMENT**
