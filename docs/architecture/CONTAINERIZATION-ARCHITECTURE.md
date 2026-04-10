# Project Nyra - Complete Containerization Architecture

**Version**: 2.0.0
**Date**: 2026-01-18
**Status**: Production Ready
**Architect**: System Architecture Designer

---

## Executive Summary

This document defines the complete containerization architecture for Project Nyra, a distributed 4-PC AI mortgage automation platform. The architecture employs a modular, multi-network Docker Compose strategy with clear separation of concerns across infrastructure layers.

### Key Design Principles

1. **Modular Composition**: Service layers separated by function (core, MCP, apps, orchestrator, workers)
2. **Network Isolation**: Multiple Docker networks for security and traffic segmentation
3. **Distributed Deployment**: 4-PC cluster with orchestrator-worker topology
4. **Service Discovery**: DNS-based discovery within Docker networks
5. **High Availability**: Health checks, restart policies, and graceful degradation
6. **Scalability**: GPU worker pool with automatic load balancing

---

## 1. Architecture Overview

### 1.1 Distributed Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PROJECT NYRA CLUSTER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐       ┌──────────────────────────────────┐   │
│  │  PC1: UH680      │       │  PC2-4: Worker Nodes            │   │
│  │  (Orchestrator)  │◄─────►│  RTX 3060 / 5090 / 3090Ti       │   │
│  │                  │       │                                  │   │
│  │  • Coordination  │       │  • GPU Inference                │   │
│  │  • MCP Servers   │       │  • Model Hosting                │   │
│  │  • Databases     │       │  • Local LLM                    │   │
│  │  • Monitoring    │       │  • Performance Monitor          │   │
│  └──────────────────┘       └──────────────────────────────────┘   │
│         172.20.0.0/16              172.21-23.0.0/16                │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DOCKER NETWORK TOPOLOGY                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  nyra-core (172.20.0.0/16)          [Infrastructure Layer]         │
│    ├─ postgres (5432)                                              │
│    ├─ redis (6379)                                                 │
│    ├─ qdrant (6333)                                                │
│    ├─ falkordb (6380)                                              │
│    └─ neo4j (7474, 7687)                                           │
│                                                                     │
│  nyra-mcp (172.21.0.0/16)           [MCP Server Layer]            │
│    ├─ nexus-router (6000)                                          │
│    ├─ litellm (4000)                                               │
│    ├─ letta (8283)                                                 │
│    ├─ mem0 (4321)                                                  │
│    ├─ archon-os (3010)                                           │
│    ├─ ruvector (8080)                                               │
│    ├─ ruvector (8888)                                              │
│    └─ infisical (8082)                                             │
│                                                                     │
│  nyra-apps (172.22.0.0/16)          [Application Layer]           │
│    ├─ twenty (3000)                                                │
│    ├─ n8n (5678)                                                   │
│    ├─ dify-web (3002)                                              │
│    ├─ openwebui (8080)                                             │
│    └─ nyra-orchestrator (8010)                                     │
│                                                                     │
│  nyra-orchestrator (172.23.0.0/16)  [Coordination Layer]          │
│    ├─ archgw-router (8080)                                         │
│    ├─ prometheus (9090)                                            │
│    ├─ grafana (3005)                                               │
│    ├─ loki (3100)                                                  │
│    ├─ alertmanager (9093)                                          │
│    └─ cloudflared (tunnel)                                         │
│                                                                     │
│  nyra-worker-rtx3060 (172.24.0.0/16) [Worker 1]                   │
│  nyra-worker-rtx5090 (172.25.0.0/16) [Worker 2]                   │
│  nyra-worker-rtx3090ti (172.26.0.0/16) [Worker 3]                 │
│    ├─ ollama (11434)                                               │
│    ├─ litellm-proxy (4001)                                         │
│    ├─ model-manager (8081)                                         │
│    ├─ perf-monitor (9001)                                          │
│    └─ redis-worker (6380)                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Service Dependencies & Communication Patterns

### 2.1 Dependency Graph

```mermaid
graph TD
    %% Infrastructure Layer
    POSTGRES[PostgreSQL<br/>pgvector]
    REDIS[Redis<br/>Cache]
    QDRANT[Qdrant<br/>Vectors]
    FALKOR[FalkorDB<br/>Graphs]
    NEO4J[Neo4j<br/>Knowledge]

    %% MCP Layer
    NEXUS[Nexus Router<br/>6000]
    LITELLM[LiteLLM<br/>4000]
    LETTA[Letta<br/>8283]
    MEM0[Mem0<br/>4321]
    CLAUDE[Claude Flow<br/>3010]
    AGENT[ruvector<br/>8080]
    RUV[RuVector<br/>8888]

    %% Application Layer
    TWENTY[TwentyCRM<br/>3000]
    N8N[n8n<br/>5678]
    DIFY[Dify<br/>3002]
    OPENWEBUI[OpenWebUI<br/>8080]
    ORCH[Nyra Orchestrator<br/>8010]

    %% Monitoring
    PROM[Prometheus<br/>9090]
    GRAF[Grafana<br/>3005]
    LOKI[Loki<br/>3100]

    %% Workers
    OLLAMA[Ollama<br/>11434]
    WORKER[LiteLLM Proxy<br/>4001]

    %% Dependencies
    NEXUS -->|API Calls| LITELLM
    NEXUS -->|External| ANTHROPIC[Anthropic API]
    NEXUS -->|External| OPENROUTER[OpenRouter]
    NEXUS -->|External| GEMINI[Google Gemini]

    LITELLM -->|Models| OLLAMA
    LITELLM -->|Fallback| ANTHROPIC

    LETTA -->|Database| POSTGRES
    LETTA -->|LLM| NEXUS

    MEM0 -->|Cache| REDIS
    MEM0 -->|LLM| NEXUS

    CLAUDE -->|Database| POSTGRES
    CLAUDE -->|Cache| REDIS
    CLAUDE -->|Vector| AGENT
    CLAUDE -->|Optimize| RUV

    TWENTY -->|Database| POSTGRES
    N8N -->|Database| POSTGRES
    DIFY -->|Database| POSTGRES
    DIFY -->|Cache| REDIS

    ORCH -->|CRM| TWENTY
    ORCH -->|LLM| NEXUS
    ORCH -->|Memory| MEM0
    ORCH -->|Memory| LETTA
    ORCH -->|Graph| FALKOR

    PROM -->|Scrape| NEXUS
    PROM -->|Scrape| WORKER
    GRAF -->|Query| PROM
    GRAF -->|Logs| LOKI

    style NEXUS fill:#f96,stroke:#333,stroke-width:4px
    style POSTGRES fill:#69f,stroke:#333,stroke-width:2px
    style REDIS fill:#f66,stroke:#333,stroke-width:2px
```

### 2.2 Communication Matrix

| Source Service | Target Service | Protocol | Port | Purpose |
|----------------|----------------|----------|------|---------|
| All Apps | Nexus Router | HTTP | 6000 | LLM API Gateway |
| Nexus | Anthropic | HTTPS | 443 | Claude API |
| Nexus | OpenRouter | HTTPS | 443 | Multi-model routing |
| Nexus | Google | HTTPS | 443 | Gemini API |
| Nexus | LiteLLM | HTTP | 4000 | Model proxy |
| LiteLLM | Ollama (Workers) | HTTP | 11434 | Local inference |
| Letta | Nexus | HTTP | 6000 | LLM requests |
| Letta | PostgreSQL | TCP | 5432 | Conversation storage |
| Mem0 | Nexus | HTTP | 6000 | Embeddings |
| Mem0 | Redis | TCP | 6379 | Cache |
| Claude Flow | ruvector | HTTP | 8080 | Vector storage |
| Claude Flow | RuVector | HTTP | 8888 | Optimization |
| Claude Flow | PostgreSQL | TCP | 5432 | State persistence |
| Claude Flow | Redis | TCP | 6379 | Task queue |
| TwentyCRM | PostgreSQL | TCP | 5432 | CRM data |
| n8n | PostgreSQL | TCP | 5432 | Workflow state |
| Dify | PostgreSQL | TCP | 5432 | Chat history |
| Dify | Redis | TCP | 6379 | Session cache |
| Nyra Orchestrator | TwentyCRM | HTTP | 3000 | Lead management |
| Nyra Orchestrator | Nexus | HTTP | 6000 | LLM coordination |
| Nyra Orchestrator | Mem0 | HTTP | 4321 | Memory operations |
| Nyra Orchestrator | Letta | HTTP | 8283 | Conversation context |
| Nyra Orchestrator | FalkorDB | Redis | 6380 | Knowledge graphs |
| Prometheus | All Services | HTTP | Various | Metrics scraping |
| Grafana | Prometheus | HTTP | 9090 | Dashboard data |
| Grafana | Loki | HTTP | 3100 | Log aggregation |
| Worker Nodes | Nexus | HTTP | 6000 | Model registration |
| Worker Nodes | Prometheus | HTTP | 9090 | Metrics push |

---

## 3. Container Orchestration Strategy

### 3.1 Docker Compose File Structure

```
infra/docker/
├── docker-compose.yml              # Master composition (includes all)
│
├── base/
│   ├── docker-compose.core.yml     # Infrastructure (postgres, redis, qdrant)
│   └── docker-compose.mcp.yml      # MCP servers (nexus, letta, mem0, etc.)
│
├── apps/
│   └── docker-compose.apps.yml     # Applications (twenty, n8n, dify)
│
├── orchestrator/
│   └── docker-compose.orchestrator.yml  # Coordination (prometheus, grafana)
│
└── workers/
    ├── docker-compose.worker-rtx3060.yml   # Worker 1
    ├── docker-compose.worker-rtx5090.yml   # Worker 2
    └── docker-compose.worker-rtx3090ti.yml # Worker 3
```

### 3.2 Deployment Modes

#### Mode 1: Full Stack (Orchestrator + All Workers)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
docker-compose up -d
```

#### Mode 2: Orchestrator Only (PC1)
```bash
docker-compose -f base/docker-compose.core.yml \
               -f base/docker-compose.mcp.yml \
               -f apps/docker-compose.apps.yml \
               -f orchestrator/docker-compose.orchestrator.yml \
               up -d
```

#### Mode 3: Worker Only (PC2)
```bash
docker-compose -f workers/docker-compose.worker-rtx3060.yml up -d
```

#### Mode 4: Selective Services (Development)
```bash
# Core infrastructure only
docker-compose -f base/docker-compose.core.yml up -d

# Add MCP layer
docker-compose -f base/docker-compose.mcp.yml up -d

# Add applications
docker-compose -f apps/docker-compose.apps.yml up -d
```

---

## 4. Volume Management & Persistent Storage

### 4.1 Volume Allocation

| Volume Name | Service | Size (Estimate) | Backup Priority | Purpose |
|-------------|---------|-----------------|-----------------|---------|
| postgres-data | PostgreSQL | 50GB | CRITICAL | All app databases |
| letta-pg-data | Letta Postgres | 20GB | HIGH | Conversation memory |
| twenty-pg-data | TwentyCRM Postgres | 30GB | CRITICAL | CRM lead data |
| n8n-pg-data | n8n Postgres | 10GB | HIGH | Workflow definitions |
| dify-pg-data | Dify Postgres | 15GB | MEDIUM | Chat history |
| redis-data | Redis | 5GB | MEDIUM | Cache (ephemeral) |
| qdrant-data | Qdrant | 20GB | HIGH | Vector embeddings |
| falkordb-data | FalkorDB | 10GB | HIGH | Knowledge graphs |
| neo4j-data | Neo4j | 30GB | HIGH | Advanced graphs |
| nexus-data | Nexus Router | 1GB | LOW | Router state |
| letta-data | Letta | 5GB | HIGH | Memory state |
| mem0-data | Mem0 | 10GB | HIGH | Universal memory |
| archon-os-data | Claude Flow | 5GB | MEDIUM | Agent state |
| ruvector-data | ruvector | 15GB | HIGH | Vector storage |
| ruvector-data | RuVector | 2GB | LOW | Optimization cache |
| infisical-data | Infisical | 1GB | CRITICAL | Secrets vault |
| infisical-mongo-data | Infisical MongoDB | 5GB | CRITICAL | Secrets metadata |
| n8n-data | n8n | 5GB | HIGH | Workflow storage |
| dify-data | Dify | 10GB | MEDIUM | File uploads |
| openwebui-data | OpenWebUI | 5GB | LOW | User preferences |
| prometheus-data | Prometheus | 100GB | MEDIUM | Metrics (30d retention) |
| grafana-data | Grafana | 5GB | MEDIUM | Dashboard configs |
| loki-data | Loki | 50GB | MEDIUM | Logs (30d retention) |
| alertmanager-data | Alertmanager | 1GB | LOW | Alert state |
| ollama-models-rtx3060 | Ollama (Worker 1) | 50GB | LOW | Model cache |
| ollama-models-rtx5090 | Ollama (Worker 2) | 50GB | LOW | Model cache |
| ollama-models-rtx3090ti | Ollama (Worker 3) | 50GB | LOW | Model cache |

**Total Storage Requirements:**
- **Orchestrator (PC1)**: ~400GB (databases + monitoring)
- **Worker (PC2-4)**: ~60GB each (models + cache)
- **Total Cluster**: ~580GB

### 4.2 Backup Strategy

```yaml
# Backup Configuration
backup_schedule:
  critical:  # PostgreSQL, Infisical
    frequency: hourly
    retention: 7 days
    method: pg_dump, volume snapshot

  high:  # Qdrant, ruvector, Memory systems
    frequency: daily
    retention: 30 days
    method: volume snapshot

  medium:  # Monitoring, logs, cache
    frequency: weekly
    retention: 14 days
    method: volume snapshot

  low:  # Ephemeral, model cache
    frequency: none
    retention: 0 days
    method: none
```

### 4.3 Volume Mount Strategy

```yaml
# Pattern 1: Named Volumes (Recommended for production)
volumes:
  postgres-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /mnt/data/postgres

# Pattern 2: Bind Mounts (Development only)
volumes:
  - ./data/postgres:/var/lib/postgresql/data

# Pattern 3: Readonly Config Mounts
volumes:
  - ./configs/nexus/nexus.toml:/app/config/nexus.toml:ro

# Pattern 4: Shared Docker Socket (Claude Flow)
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

---

## 5. Environment Variables & Configuration

### 5.1 Environment File Hierarchy

```
Project-Nyra/
├── .env                          # Global defaults
├── .env.orchestrator             # PC1 specific
├── .env.worker-3060              # PC2 specific
├── .env.worker-5090              # PC3 specific
├── .env.worker-3090ti            # PC4 specific
│
└── infra/
    ├── .env                      # Infra overrides
    └── docker/
        ├── .env                  # Docker overrides
        ├── base/.env             # Core layer
        ├── apps/.env             # App layer
        ├── orchestrator/.env     # Orchestrator layer
        └── workers/
            ├── .env.rtx3060
            ├── .env.rtx5090
            └── .env.rtx3090ti
```

### 5.2 Critical Environment Variables

#### Global Configuration
```bash
# Project identification
COMPOSE_PROJECT_NAME=nyra
NYRA_ENVIRONMENT=production
NYRA_PC_ROLE=orchestrator|worker

# Infisical secrets management
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=<secret>
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=<secret>

# Docker configuration
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
```

#### LLM API Keys (Orchestrator)
```bash
ANTHROPIC_API_KEY=<secret>
OPENROUTER_API_KEY=<secret>
GOOGLE_GEMINI_API_KEY=<secret>
OPENAI_API_KEY=<secret>
```

#### Database Credentials (Orchestrator)
```bash
# PostgreSQL
POSTGRES_PASSWORD=<secret>
POSTGRES_USER=nyra
POSTGRES_DB=nyra
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=<secret>
REDIS_PORT=6379
REDIS_MAXMEMORY=2gb

# Neo4j
NEO4J_PASSWORD=<secret>
NEO4J_AUTH=neo4j/${NEO4J_PASSWORD}
```

#### Service-Specific (Orchestrator)
```bash
# Nexus Router
NEXUS_PORT=6000
NEXUS_LOG_LEVEL=info

# Letta
LETTA_PG_PASSWORD=<secret>
LETTA_SERVER_PASSWORD=<secret>
LETTA_POSTGRES_URI=postgresql://letta:${LETTA_PG_PASSWORD}@postgres:5432/letta

# Mem0
MEM0_PORT=4321

# TwentyCRM
TWENTY_SERVER_URL=http://localhost:3000
TWENTY_PG_PASSWORD=<secret>
TWENTY_ENCRYPTION_SECRET=<secret>
TWENTY_JWT_SECRET=<secret>
TWENTY_PASSWORD_SALT=<secret>

# n8n
N8N_USER=admin
N8N_PASSWORD=<secret>
N8N_PG_PASSWORD=<secret>

# Dify
DIFY_SECRET_KEY=<secret>
DIFY_PG_PASSWORD=<secret>

# Grafana
GRAFANA_ADMIN_PASSWORD=<secret>

# Infisical
INFISICAL_ENCRYPTION_KEY=<secret>
INFISICAL_JWT_SECRET=<secret>
```

#### Worker Configuration (All Workers)
```bash
# Worker identification
WORKER_ID=worker-rtx3060|worker-rtx5090|worker-rtx3090ti
GPU_TYPE=rtx_3060|rtx_5090|rtx_3090ti
VRAM_GB=6|24|24

# Ollama
NVIDIA_VISIBLE_DEVICES=0
OLLAMA_HOST=0.0.0.0
OLLAMA_KEEP_ALIVE=5m
OLLAMA_MAX_LOADED_MODELS=2

# LiteLLM Proxy
LITELLM_MASTER_KEY=<secret>
OLLAMA_API_BASE=http://ollama:11434

# Orchestrator connection
ORCHESTRATOR_URL=http://<orchestrator-ip>:8080
PROMETHEUS_PUSH_GATEWAY=http://<orchestrator-ip>:9091
```

#### Network Configuration
```bash
# LAN IP for inter-PC communication
LAN_IP=192.168.1.100  # PC1 Orchestrator
LAN_IP=192.168.1.101  # PC2 Worker RTX3060
LAN_IP=192.168.1.102  # PC3 Worker RTX5090
LAN_IP=192.168.1.103  # PC4 Worker RTX3090Ti

# Worker URLs (used by orchestrator)
WORKER_3060_URL=http://192.168.1.101:4001
WORKER_3060_MODELS=codellama,mistral,deepseek-coder

WORKER_5090_URL=http://192.168.1.102:4001
WORKER_5090_MODELS=llama3:70b,qwen2.5:72b,mixtral

WORKER_3090TI_URL=http://192.168.1.103:4001
WORKER_3090TI_MODELS=codellama,phi3,gemma2
```

### 5.3 Secrets Management with Infisical

```bash
# Infisical path structure
/nyra/orchestrator/production
/nyra/orchestrator/staging
/nyra/orchestrator/development

/nyra/worker-3060/production
/nyra/worker-5090/production
/nyra/worker-3090ti/production

/nyra/shared/production  # Shared secrets (API keys)
/nyra/shared/staging
/nyra/shared/development

# Inject secrets at runtime
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/nyra/orchestrator" \
  -- docker-compose up -d
```

---

## 6. Service Discovery & DNS Resolution

### 6.1 Internal DNS

All services are accessible via Docker's internal DNS:

```yaml
# Format: <service-name>.<network-name>
# Within same network: <service-name>

# Examples:
nexus-router              # From any service on nyra-mcp network
postgres                  # From any service on nyra-core network
twenty                    # From any service on nyra-apps network

# Cross-network access (requires network attachment)
nexus-router              # Accessible from nyra-core, nyra-mcp, nyra-apps
postgres                  # Accessible from nyra-core (all services attach here)
```

### 6.2 External Access Patterns

#### Pattern 1: Direct Port Binding (Development)
```yaml
ports:
  - "6000:6000"  # Nexus accessible at localhost:6000
```

#### Pattern 2: Cloudflare Tunnel (Production)
```yaml
# cloudflared routes internal services to public domains
cloudflared:
  environment:
    - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
  command:
    - tunnel
    - --config
    - /etc/cloudflared/config.yaml
    - run
    - nyra-orchestrator-tunnel

# Mappings:
https://nyra.ratehunter.net      → http://dify:3002
https://crm.ratehunter.net       → http://twenty:3000
https://n8n.ratehunter.net       → http://n8n:5678
https://grafana.ratehunter.net   → http://grafana:3005
https://ratehunter.net           → http://ratehunter:3000
```

#### Pattern 3: Worker Direct IP (LAN Only)
```yaml
# Workers accessible via LAN IP:PORT
http://192.168.1.101:4001  # Worker RTX3060 LiteLLM
http://192.168.1.102:4001  # Worker RTX5090 LiteLLM
http://192.168.1.103:4001  # Worker RTX3090Ti LiteLLM
```

---

## 7. Health Checks & Monitoring

### 7.1 Health Check Configuration

All services implement standardized health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:<port>/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 7.2 Health Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Nexus Router | `GET http://nexus:6000/health` | `{"status":"healthy"}` |
| PostgreSQL | `CMD pg_isready -U nyra` | Exit code 0 |
| Redis | `CMD redis-cli ping` | "PONG" |
| Qdrant | `GET http://qdrant:6333/health` | `{"status":"ok"}` |
| Letta | `GET http://letta:8283/health` | `{"status":"ok"}` |
| Mem0 | `GET http://mem0:4321/health` | `{"status":"ok"}` |
| Claude Flow | `GET http://archon-os:3010/health` | `{"status":"healthy"}` |
| TwentyCRM | `GET http://twenty:3000/health` | `{"status":"ok"}` |
| n8n | `GET http://n8n:5678/healthz` | `{"status":"ok"}` |
| Dify API | `GET http://dify-api:5001/health` | `{"status":"ok"}` |
| Prometheus | `GET http://prometheus:9090/-/healthy` | 200 OK |
| Grafana | `GET http://grafana:3000/api/health` | `{"database":"ok"}` |
| Loki | `GET http://loki:3100/ready` | 200 OK |
| Ollama | `GET http://ollama:11434/api/tags` | `{"models":[...]}` |
| LiteLLM Proxy | `GET http://litellm:4000/health` | `{"status":"healthy"}` |

### 7.3 Prometheus Scrape Configuration

```yaml
# configs/observability/prometheus.yml
scrape_configs:
  - job_name: 'nexus-router'
    static_configs:
      - targets: ['nexus-router:6000']
    metrics_path: '/metrics'
    scrape_interval: 15s

  - job_name: 'archon-os'
    static_configs:
      - targets: ['archon-os:3010']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'workers'
    static_configs:
      - targets:
        - '192.168.1.101:9001'  # Worker RTX3060
        - '192.168.1.102:9001'  # Worker RTX5090
        - '192.168.1.103:9001'  # Worker RTX3090Ti
    metrics_path: '/metrics'
    scrape_interval: 10s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    scrape_interval: 30s
```

### 7.4 Grafana Dashboard Configuration

```yaml
# configs/observability/grafana/datasources.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    editable: false

  - name: Redis
    type: redis-datasource
    access: proxy
    url: redis://redis:6379
    jsonData:
      client: standalone
      password: ${REDIS_PASSWORD}
```

---

## 8. Port Allocation Standard

### 8.1 Orchestrator Ports (PC1)

| Port | Service | Protocol | Purpose | External Access |
|------|---------|----------|---------|-----------------|
| 5432 | PostgreSQL | TCP | Primary database | No |
| 5433 | TwentyCRM Postgres | TCP | CRM database | No |
| 5434 | Dify Postgres | TCP | Chat database | No |
| 5435 | n8n Postgres | TCP | Workflow database | No |
| 5436 | Letta Postgres | TCP | Memory database | No |
| 6000 | Nexus Router | HTTP | LLM gateway | Via Tunnel |
| 6333 | Qdrant | HTTP | Vector database | No |
| 6334 | Qdrant gRPC | gRPC | Vector sync | No |
| 6379 | Redis | TCP | Cache | No |
| 6380 | FalkorDB | TCP | Graph database | No |
| 7474 | Neo4j Browser | HTTP | Graph UI | Via Tunnel |
| 7687 | Neo4j Bolt | Bolt | Graph queries | No |
| 3000 | TwentyCRM | HTTP | CRM interface | Via Tunnel |
| 3001 | Dify API | HTTP | Chat API (internal) | No |
| 3002 | Dify Web | HTTP | Chat interface | Via Tunnel |
| 3005 | Grafana | HTTP | Monitoring UI | Via Tunnel |
| 3010 | Claude Flow | HTTP | Orchestrator | Via MCP |
| 3100 | Loki | HTTP | Log aggregation | No |
| 4000 | LiteLLM | HTTP | Model proxy | No |
| 4321 | Mem0 | HTTP | Universal memory | No |
| 5678 | n8n | HTTP | Workflows | Via Tunnel |
| 8010 | Nyra Orchestrator | HTTP | Coordination | No |
| 8050 | nginx-mcp | HTTP | MCP proxy | No |
| 8080 | ruvector | HTTP | Vector storage | No |
| 8081 | OpenMemory MCP | HTTP | Memory MCP | No |
| 8082 | Infisical | HTTP | Secrets vault | Via Tunnel |
| 8080 | OpenWebUI | HTTP | LLM chat UI | Via Tunnel |
| 8283 | Letta | HTTP | Memory server | No |
| 8284 | Letta Admin | HTTP | Memory admin | Via Tunnel |
| 8888 | RuVector | HTTP | Optimization | No |
| 9090 | Prometheus | HTTP | Metrics | Via Tunnel |
| 9093 | Alertmanager | HTTP | Alerts | Via Tunnel |

### 8.2 Worker Ports (PC2-4 - Same on each)

| Port | Service | Protocol | Purpose | External Access |
|------|---------|----------|---------|-----------------|
| 4001 | LiteLLM Proxy | HTTP | Local LLM proxy | LAN Only |
| 6380 | Redis Worker | TCP | Local cache | No |
| 8081 | Model Manager | HTTP | Model lifecycle | LAN Only |
| 9001 | Performance Monitor | HTTP | GPU metrics | LAN Only |
| 8091 | Health Check | HTTP | Worker health | LAN Only |
| 11434 | Ollama | HTTP | LLM inference | LAN Only |

**Note**: Workers are accessed via LAN IP:PORT from orchestrator:
- `http://192.168.1.101:4001` (RTX 3060)
- `http://192.168.1.102:4001` (RTX 5090)
- `http://192.168.1.103:4001` (RTX 3090Ti)

### 8.3 Port Conflict Resolution

**Identified Conflicts:**
1. ✅ **RESOLVED**: Grafana (3001 → 3005)
2. ✅ **RESOLVED**: Loki vs RateHunter (3100 - no actual conflict, different scope)
3. ✅ **RESOLVED**: FalkorDB vs Redis (6379 → 6380 for FalkorDB)

**Pre-flight Check Script**:
```powershell
# C:\Dev\Projects\Repos\Project-Nyra\scripts\check-ports.ps1
$ports = @(5432,6000,6333,6379,3000,3005,3010,4000,4321,5678,8283,9090)
foreach ($port in $ports) {
    $inUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($inUse) {
        Write-Host "❌ Port $port IN USE" -ForegroundColor Red
    } else {
        Write-Host "✅ Port $port available" -ForegroundColor Green
    }
}
```

---

## 9. Security Architecture

### 9.1 Network Isolation

```yaml
# Principle: Least Privilege Network Access
# Each service only attached to networks it needs

networks:
  # Core infrastructure - database layer
  nyra-core:
    internal: false  # Needs external for backups

  # MCP servers - LLM orchestration
  nyra-mcp:
    internal: false  # Needs external for API calls

  # Applications - user-facing
  nyra-apps:
    internal: true  # No direct external access

  # Orchestrator - monitoring
  nyra-orchestrator:
    internal: false  # Needs external for alerting

  # Workers - GPU inference
  nyra-worker-*:
    internal: true  # LAN only, no internet
```

### 9.2 Secrets Management Strategy

```yaml
# Tier 1: Infisical (Production)
# - All production secrets stored in Infisical
# - Injected at container runtime
# - Automatic rotation supported
# - Audit trail enabled

# Tier 2: Docker Secrets (Swarm mode)
# - For Kubernetes/Swarm deployments
# - Encrypted at rest
# - Only decrypted in-memory

# Tier 3: Environment Variables (Development)
# - .env files for local development
# - Never committed to git
# - Template (.env.template) for reference
```

### 9.3 Access Control Matrix

| Service | Public | LAN | Private |
|---------|--------|-----|---------|
| Nexus Router | ✅ Via Tunnel | ✅ | N/A |
| TwentyCRM | ✅ Via Tunnel | ✅ | N/A |
| Dify | ✅ Via Tunnel | ✅ | N/A |
| n8n | ✅ Via Tunnel (Auth) | ✅ | N/A |
| Grafana | ✅ Via Tunnel (Auth) | ✅ | N/A |
| PostgreSQL | ❌ | ❌ | ✅ Container Only |
| Redis | ❌ | ❌ | ✅ Container Only |
| Letta | ❌ | ✅ (API Key) | ✅ |
| Mem0 | ❌ | ✅ | ✅ |
| Claude Flow | ❌ | ✅ (MCP) | ✅ |
| ruvector | ❌ | ❌ | ✅ Container Only |
| Workers | ❌ | ✅ LAN IP | ❌ |

### 9.4 TLS/SSL Configuration

```yaml
# Pattern 1: Cloudflare Tunnel (Automatic TLS)
cloudflared:
  # Handles TLS termination at Cloudflare edge
  # Internal traffic remains HTTP (trusted LAN)

# Pattern 2: Self-Signed Certificates (Development)
services:
  nginx:
    volumes:
      - ./certs/self-signed.crt:/etc/nginx/ssl/cert.crt:ro
      - ./certs/self-signed.key:/etc/nginx/ssl/cert.key:ro

# Pattern 3: Let's Encrypt (Future)
services:
  traefik:
    command:
      - --certificatesresolvers.letsencrypt.acme.email=ops@example.com
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
```

---

## 10. Disaster Recovery & High Availability

### 10.1 Restart Policies

```yaml
# Critical services (must always be running)
restart: unless-stopped
# Examples: postgres, redis, nexus, litellm

# Worker services (can tolerate downtime)
restart: on-failure
# Examples: ollama, model-manager

# One-time jobs (should not restart)
restart: "no"
# Examples: database migrations, setup scripts
```

### 10.2 Resource Limits

```yaml
# Orchestrator Services
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G

  redis:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  nexus-router:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

# Worker Services (GPU)
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '8.0'
          memory: 16G
        reservations:
          cpus: '4.0'
          memory: 8G
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

### 10.3 Backup Procedures

```bash
# Automated Backup Script
# C:\Dev\Projects\Repos\Project-Nyra\scripts\backup-all.ps1

# PostgreSQL backup (all databases)
docker exec nyra-postgres pg_dumpall -U nyra > backup_$(Get-Date -Format yyyy-MM-dd).sql

# Qdrant backup (vector data)
docker exec nyra-qdrant curl -X POST http://localhost:6333/snapshots -H "api-key: ${QDRANT_API_KEY}"

# Redis backup (RDB snapshot)
docker exec nyra-redis redis-cli BGSAVE

# Volume snapshots (Windows)
wsl --export nyra-postgres postgres_backup_$(Get-Date -Format yyyy-MM-dd).tar

# Infisical backup (secrets)
infisical export --projectId="${INFISICAL_PROJECT_ID}" --env="production" > secrets_backup_$(Get-Date -Format yyyy-MM-dd).json
```

### 10.4 Failover Strategy

```yaml
# Strategy 1: Worker Failover
# - Nexus Router tracks worker health
# - Automatic routing to healthy workers
# - Dead worker removed from pool
# - Auto-rejoin when health restored

# Strategy 2: Database Failover (Future)
# - PostgreSQL streaming replication
# - Automatic failover with Patroni
# - Read replicas for load distribution

# Strategy 3: Redis Sentinel (Future)
# - Master-slave replication
# - Automatic failover
# - Client-side discovery
```

---

## 11. Performance Optimization

### 11.1 Container Build Optimization

```dockerfile
# Multi-stage build pattern
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
```

### 11.2 Caching Strategy

```yaml
# Layer 1: Browser Cache (Cloudflare)
# - Static assets: 1 year
# - API responses: 5 minutes

# Layer 2: Redis Cache (Application)
# - User sessions: 24 hours
# - API responses: 1 hour
# - Model embeddings: 7 days

# Layer 3: Docker Layer Cache (Build)
# - Base images: cached indefinitely
# - Dependencies: cached until package.json changes
# - Source code: no cache
```

### 11.3 Database Optimization

```yaml
# PostgreSQL configuration
environment:
  - POSTGRES_SHARED_BUFFERS=2GB
  - POSTGRES_EFFECTIVE_CACHE_SIZE=6GB
  - POSTGRES_MAINTENANCE_WORK_MEM=512MB
  - POSTGRES_CHECKPOINT_COMPLETION_TARGET=0.9
  - POSTGRES_WAL_BUFFERS=16MB
  - POSTGRES_DEFAULT_STATISTICS_TARGET=100
  - POSTGRES_RANDOM_PAGE_COST=1.1
  - POSTGRES_EFFECTIVE_IO_CONCURRENCY=200
  - POSTGRES_WORK_MEM=10MB
  - POSTGRES_MIN_WAL_SIZE=1GB
  - POSTGRES_MAX_WAL_SIZE=4GB

# Connection pooling
environment:
  - POSTGRES_MAX_CONNECTIONS=200
```

### 11.4 Network Optimization

```yaml
# Enable HTTP/2 for all services
services:
  nginx:
    environment:
      - HTTP2_ENABLED=true

# Compression for API responses
services:
  nexus-router:
    environment:
      - COMPRESSION_ENABLED=true
      - COMPRESSION_THRESHOLD=1024

# Connection keep-alive
services:
  litellm:
    environment:
      - KEEP_ALIVE_TIMEOUT=65
```

---

## 12. Operational Procedures

### 12.1 Deployment Checklist

```yaml
pre_deployment:
  - [ ] Review .env files for correct values
  - [ ] Run port conflict check: scripts/check-ports.ps1
  - [ ] Verify disk space: >100GB free on orchestrator
  - [ ] Test Infisical connection: infisical secrets list
  - [ ] Validate docker-compose: docker-compose config
  - [ ] Pull latest images: docker-compose pull
  - [ ] Create backup: scripts/backup-all.ps1

deployment:
  - [ ] Deploy in order: core → mcp → apps → orchestrator → workers
  - [ ] Wait for health checks between layers
  - [ ] Verify service connectivity: scripts/test-connectivity.ps1
  - [ ] Check logs for errors: docker-compose logs --tail=100

post_deployment:
  - [ ] Run smoke tests: scripts/smoke-test.ps1
  - [ ] Verify Cloudflare tunnels: cloudflared tunnel list
  - [ ] Check Grafana dashboards for anomalies
  - [ ] Update deployment documentation
  - [ ] Notify team in Slack/Discord
```

### 12.2 Troubleshooting Guide

```yaml
issue: "Service not starting"
checks:
  - docker logs <container-name>
  - docker inspect <container-name>
  - Check port conflicts: netstat -ano | findstr :<port>
  - Verify environment variables: docker-compose config
  - Check disk space: df -h
  - Verify network connectivity: docker network inspect nyra-core

issue: "Cannot connect to service"
checks:
  - Verify service is running: docker ps | grep <service>
  - Check health status: docker inspect <container-name> | jq '.[].State.Health'
  - Test connectivity: docker exec <container> curl http://<target>:port/health
  - Verify DNS resolution: docker exec <container> nslookup <target>
  - Check firewall rules: Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Nyra*"}

issue: "High memory usage"
checks:
  - docker stats
  - Review resource limits in docker-compose.yml
  - Check for memory leaks in application logs
  - Restart service: docker-compose restart <service>
  - Consider increasing limits or scaling horizontally

issue: "Slow database queries"
checks:
  - docker exec nyra-postgres psql -U nyra -c "SELECT * FROM pg_stat_activity;"
  - Check slow query log
  - Run EXPLAIN ANALYZE on problematic queries
  - Consider adding indexes
  - Review connection pool settings
```

### 12.3 Scaling Procedures

```yaml
# Horizontal Scaling (Add Worker)
1. Provision new PC with GPU
2. Copy worker docker-compose.yml
3. Update .env with new WORKER_ID and LAN_IP
4. docker-compose up -d
5. Verify worker registration in Nexus Router
6. Update Prometheus scrape config
7. Monitor worker metrics in Grafana

# Vertical Scaling (Increase Resources)
1. Update resource limits in docker-compose.yml
2. docker-compose up -d --force-recreate <service>
3. Monitor service performance
4. Adjust limits based on actual usage

# Database Scaling (Add Read Replica)
1. Deploy postgres-replica service
2. Configure streaming replication
3. Update application to use read replica for queries
4. Monitor replication lag
```

---

## 13. Future Enhancements

### 13.1 Kubernetes Migration Path

```yaml
phase_1: "Docker Compose → Docker Swarm"
  - Convert to Swarm mode for multi-host orchestration
  - Implement secrets management with Docker Secrets
  - Add overlay networks for cross-host communication
  - Deploy load balancers for high availability

phase_2: "Docker Swarm → Kubernetes"
  - Convert docker-compose.yml to Helm charts
  - Migrate volumes to PersistentVolumeClaims
  - Implement ConfigMaps and Secrets
  - Deploy Ingress for external access
  - Add HorizontalPodAutoscaler for auto-scaling

phase_3: "Kubernetes → Cloud Native"
  - Migrate to managed Kubernetes (EKS/GKE/AKS)
  - Implement service mesh (Istio/Linkerd)
  - Add advanced monitoring (Datadog/New Relic)
  - Implement GitOps with ArgoCD
  - Add progressive delivery with Flagger
```

### 13.2 Advanced Features

```yaml
features:
  - Service mesh for advanced traffic management
  - Circuit breakers for fault tolerance
  - Rate limiting per service
  - Distributed tracing with Jaeger
  - Chaos engineering with Chaos Mesh
  - Cost optimization with Kubecost
  - Multi-region deployment for DR
  - Blue-green deployments
  - Canary releases
  - A/B testing infrastructure
```

---

## 14. Appendix

### 14.1 Quick Reference Commands

```bash
# Start full stack
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
docker-compose up -d

# Start specific layer
docker-compose -f base/docker-compose.core.yml up -d
docker-compose -f base/docker-compose.mcp.yml up -d
docker-compose -f apps/docker-compose.apps.yml up -d

# View logs
docker-compose logs -f nexus-router
docker-compose logs --tail=100 --since=1h

# Check service health
docker ps --filter "name=nyra"
docker inspect nyra-nexus | jq '.[].State.Health'

# Restart service
docker-compose restart nexus-router

# Stop all services
docker-compose down

# Stop and remove volumes (DESTRUCTIVE)
docker-compose down -v

# Update services
docker-compose pull
docker-compose up -d --force-recreate

# Check resource usage
docker stats

# Clean up
docker system prune -af
docker volume prune -f
```

### 14.2 Useful Scripts

```powershell
# scripts/health-check.ps1
$services = @("nexus","postgres","redis","twenty","n8n")
foreach ($svc in $services) {
    $health = docker inspect nyra-$svc --format='{{.State.Health.Status}}'
    Write-Host "$svc: $health"
}

# scripts/backup-volumes.ps1
$volumes = docker volume ls --filter "name=nyra" --format "{{.Name}}"
foreach ($vol in $volumes) {
    docker run --rm -v ${vol}:/data -v ${PWD}:/backup alpine tar czf /backup/${vol}_$(Get-Date -Format yyyy-MM-dd).tar.gz -C /data .
}

# scripts/test-connectivity.ps1
docker exec nyra-archon-os curl -f http://nexus-router:6000/health
docker exec nyra-orch curl -f http://twenty:3000/health
docker exec nyra-n8n curl -f http://mem0:4321/health
```

### 14.3 Architecture Decision Records (ADRs)

- **ADR-001**: Why Docker Compose over Kubernetes initially?
  - Lower complexity for 4-PC deployment
  - Faster iteration during development
  - Easier troubleshooting
  - Migration path to K8s preserved

- **ADR-002**: Why multiple networks instead of single network?
  - Security isolation (least privilege)
  - Traffic segmentation for monitoring
  - Prevents accidental cross-service access
  - Aligns with microservices best practices

- **ADR-003**: Why named volumes over bind mounts?
  - Better performance (no file sync overhead)
  - Platform-independent (Windows/Linux)
  - Managed by Docker (automatic cleanup)
  - Supports volume drivers (future NFS/Ceph)

- **ADR-004**: Why Infisical for secrets management?
  - Open-source and self-hosted
  - Git-like version control for secrets
  - Automatic rotation support
  - Audit trail for compliance
  - CLI integration for CI/CD

---

## 15. Document Metadata

**Version**: 2.0.0
**Last Updated**: 2026-01-18
**Maintained By**: System Architecture Designer
**Review Cycle**: Quarterly
**Next Review**: 2026-04-18

**Change Log**:
- 2026-01-18: Initial comprehensive architecture document
- Future updates will be tracked here

**Related Documents**:
- `PORT-ALLOCATION-STANDARD.md` - Port assignments
- `4PC-DISTRIBUTED-ARCHITECTURE.md` - Physical deployment
- `NEXUS-ARCHITECTURE-DIAGRAMS.md` - Network diagrams
- `.env.template` - Environment variable reference
- `docker-compose.yml` - Main orchestration file

---

**END OF DOCUMENT**
