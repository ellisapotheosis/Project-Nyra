# Claude Flow V3 + Project Nyra - Full Features Containerization Guide

**Version:** 3.0.0
**Last Updated:** 2026-01-18
**Status:** Production-Ready
**Architecture:** Multi-Machine Distributed System

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Container Architecture](#container-architecture)
3. [Network Topology](#network-topology)
4. [Container Specifications](#container-specifications)
5. [Docker Compose Orchestration](#docker-compose-orchestration)
6. [Environment Configuration](#environment-configuration)
7. [Volume Management](#volume-management)
8. [Port Allocation Standard](#port-allocation-standard)
9. [Build Instructions](#build-instructions)
10. [Deployment Strategies](#deployment-strategies)
11. [Health Checks & Monitoring](#health-checks--monitoring)
12. [Security Configuration](#security-configuration)
13. [Backup & Recovery](#backup--recovery)
14. [Troubleshooting](#troubleshooting)

---

## System Overview

### Architecture Components

Project Nyra is a distributed AI-powered mortgage operations system with the following layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  Open-WebUI │ LobeChat │ Nexus Dashboard │ Landing Pages    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATION LAYER                      │
│  Claude Flow │ Archon OS │ Ruv-Swarm │ Nexus Router         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      MEMORY LAYER                            │
│  RuVector │ Letta │ Graphiti │ FalkorDB │ Mem0 │ Qdrant     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE LAYER                      │
│  PostgreSQL │ Redis │ LiteLLM │ n8n │ TwentyCRM            │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY LAYER                      │
│  Prometheus │ Grafana │ Loki │ Jaeger │ Alertmanager        │
└─────────────────────────────────────────────────────────────┘
```

### Machine Distribution

**4-Machine Topology:**

1. **Orchestrator (Area51)** - Main coordination, databases, web services
2. **Worker 5090** - Large model inference (48GB VRAM), vector indexing
3. **Worker 3090Ti** - Medium model inference (24GB VRAM), vector indexing
4. **Worker 3060** - Small model inference (12GB VRAM), specialized tasks

---

## Container Architecture

### Total Container Count: 35+ Containers

#### Core Infrastructure (8 containers)
1. PostgreSQL (multi-database)
2. Redis (caching + sessions)
3. FalkorDB (knowledge graphs)
4. Qdrant (vector search)
5. MinIO/S3 (object storage)
6. Infisical (secrets management)
7. Tailscale (mesh VPN)
8. Cloudflared (tunnel proxy)

#### AI Orchestration (5 containers)
9. Claude Flow
10. Archon OS
11. Ruv-Swarm
12. Nexus Router
13. LiteLLM Proxy

#### Memory Systems (6 containers)
14. RuVector (orchestrator node)
15. RuVector Worker 1 (GPU 5090)
16. RuVector Worker 2 (GPU 3090Ti)
17. RuVector Worker 3 (GPU 3060)
18. Letta
19. Mem0 + OpenMemory MCP

#### AI Services (3 containers)
20. Open-WebUI
21. LobeChat
22. Dify

#### Business Applications (4 containers)
23. TwentyCRM
24. Nexus Dashboard
25. Landing Page
26. Mortgage Services API

#### Workflow & Integration (3 containers)
27. n8n
28. Activepieces
29. WebSocket Hub

#### Observability (7 containers)
30. Prometheus
31. Grafana
32. Loki
33. Promtail
34. Alertmanager
35. Node Exporter
36. cAdvisor

---

## Network Topology

### Network Design

```yaml
networks:
  # Public-facing network
  nyra-public:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
          gateway: 172.20.0.1

  # Internal services network
  nyra-internal:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/16
          gateway: 172.21.0.1

  # Database network (isolated)
  nyra-database:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.22.0.0/16
          gateway: 172.22.0.1

  # Monitoring network
  nyra-monitoring:
    driver: bridge
    ipam:
      config:
        - subnet: 172.23.0.0/16
          gateway: 172.23.0.1

  # Tailscale mesh network (connects all machines)
  tailscale:
    external: true
```

### Network Segmentation Strategy

- **Public Network** - Web UIs, APIs, external access
- **Internal Network** - Service-to-service communication
- **Database Network** - Database access only, no external
- **Monitoring Network** - Metrics and logging only
- **Tailscale Network** - Cross-machine coordination

---

## Container Specifications

### 1. PostgreSQL - Multi-Database Instance

**Purpose:** Primary relational database for all services

**Dockerfile:**
```dockerfile
FROM postgres:16-alpine

# Install extensions
RUN apk add --no-cache \
    postgresql-contrib \
    postgresql-plpython3

# Copy initialization scripts
COPY scripts/postgres-init/ /docker-entrypoint-initdb.d/

# Custom postgresql.conf optimizations
COPY configs/postgresql/postgresql.conf /etc/postgresql/postgresql.conf

EXPOSE 5432
```

**Environment Variables:**
- `POSTGRES_USER=nyra_user`
- `POSTGRES_PASSWORD=${POSTGRES_PASSWORD}`
- `POSTGRES_DB=nyra_db`
- `POSTGRES_MULTIPLE_DATABASES=letta,twenty,dify,n8n,activepieces`
- `PGDATA=/var/lib/postgresql/data/pgdata`

**Volumes:**
- `postgres_data:/var/lib/postgresql/data`
- `postgres_backups:/backups`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
    reservations:
      cpus: '2.0'
      memory: 4G
```

---

### 2. Redis - High-Performance Cache

**Purpose:** Caching, session storage, message queues

**Dockerfile:**
```dockerfile
FROM redis:7-alpine

# Copy Redis configuration
COPY configs/redis/redis.conf /usr/local/etc/redis/redis.conf

# Enable persistence
RUN mkdir -p /data

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

EXPOSE 6379
```

**Environment Variables:**
- `REDIS_PASSWORD=${REDIS_PASSWORD}`
- `REDIS_MAX_MEMORY=4gb`
- `REDIS_EVICTION_POLICY=allkeys-lru`

**Volumes:**
- `redis_data:/data`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

### 3. RuVector - Distributed Vector Search (Orchestrator Node)

**Purpose:** Primary vector index coordination

**Dockerfile:**
```dockerfile
FROM rust:1.75-alpine AS builder

WORKDIR /build

# Install dependencies
RUN apk add --no-cache \
    musl-dev \
    openssl-dev \
    pkgconfig \
    protobuf-dev

# Copy source
COPY Cargo.toml Cargo.lock ./
COPY src ./src

# Build release binary
RUN cargo build --release --features distributed,wasm

FROM alpine:3.19

RUN apk add --no-cache \
    libgcc \
    openssl \
    ca-certificates

COPY --from=builder /build/target/release/ruvector /usr/local/bin/ruvector

# Create data directories
RUN mkdir -p /data/ruvector/indices /data/ruvector/wal /data/ruvector/snapshots

EXPOSE 7890 7891 7892

CMD ["ruvector", "start", "--config", "/etc/ruvector/config.toml"]
```

**Environment Variables:**
See `configs/env/ruvector.env` for complete list (280+ variables)

Key variables:
- `RUVECTOR_MODE=distributed`
- `RUVECTOR_NODE_ROLE=coordinator`
- `RUVECTOR_CONSENSUS_PEERS=worker-5090:7890,worker-3090:7890,worker-3060:7890`
- `RUVECTOR_VECTOR_DIM=1536`
- `RUVECTOR_INDEX_TYPE=hnsw`

**Volumes:**
- `ruvector_data:/data/ruvector`
- `ruvector_logs:/var/log/ruvector`

**Networks:**
- `nyra-internal`
- `tailscale`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 16G
    reservations:
      cpus: '2.0'
      memory: 8G
```

---

### 4. RuVector Worker Nodes (3 instances)

**Purpose:** Distributed vector indices on GPU machines

**Same Dockerfile as orchestrator node**

**Configuration Differences:**

**Worker 5090:**
- `RUVECTOR_NODE_ROLE=worker`
- `RUVECTOR_NODE_ID=worker-5090`
- `RUVECTOR_PORT=7890`
- Resources: 8 CPUs, 32G RAM

**Worker 3090Ti:**
- `RUVECTOR_NODE_ROLE=worker`
- `RUVECTOR_NODE_ID=worker-3090`
- `RUVECTOR_PORT=7890`
- Resources: 4 CPUs, 16G RAM

**Worker 3060:**
- `RUVECTOR_NODE_ROLE=worker`
- `RUVECTOR_NODE_ID=worker-3060`
- `RUVECTOR_PORT=7890`
- Resources: 2 CPUs, 8G RAM

---

### 5. Claude Flow - Multi-Agent Orchestration

**Purpose:** SPARC methodology, agent coordination, workflow management

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build TypeScript
RUN pnpm build

# Create data directories
RUN mkdir -p /app/data /app/logs

EXPOSE 9000

CMD ["pnpm", "start"]
```

**Environment Variables:**
- `NODE_ENV=production`
- `PORT=9000`
- `DATABASE_URL=postgresql://nyra_user:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db`
- `REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379`
- `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- `CLAUDE_FLOW_MODE=dual-orchestrator`
- `CLAUDE_FLOW_HOOKS_ENABLED=true`
- `CLAUDE_FLOW_NEURAL_OPTIMIZATION=true`
- `RUVECTOR_URL=http://ruvector:7890`
- `LETTA_URL=http://letta:8283`

**Volumes:**
- `claude_flow_data:/app/data`
- `claude_flow_logs:/app/logs`
- `/var/run/docker.sock:/var/run/docker.sock` (for Docker-in-Docker)

**Networks:**
- `nyra-internal`
- `nyra-public`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
    reservations:
      cpus: '2.0'
      memory: 2G
```

---

### 6. Archon OS - Advanced Agent Operating System

**Purpose:** Hierarchical task orchestration, complex workflows

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN mkdir -p /app/data /app/logs

EXPOSE 9001 9002

CMD ["pnpm", "start"]
```

**Environment Variables:**
- `PORT=9001`
- `ARCHON_MCP_PORT=9002`
- `DATABASE_URL=postgresql://nyra_user:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db`
- `REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379`
- `ARCHON_TOPOLOGY=hierarchical`
- `ARCHON_MAX_DEPTH=5`
- `ARCHON_PARALLEL_BRANCHES=10`

**Volumes:**
- `archon_data:/app/data`
- `archon_logs:/app/logs`

**Networks:**
- `nyra-internal`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

### 7. Nexus Router - Intelligent LLM Routing

**Purpose:** Route LLM requests to local GPU workers or cloud APIs

**Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8000 4001

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["npm", "start"]
```

**Environment Variables:**
- `PORT=8000`
- `MCP_PORT=4001`
- `REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379`
- `WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434`
- `WORKER_5090_MODELS=deepseek-r1:236b,qwen2.5:72b`
- `WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434`
- `WORKER_3090_MODELS=llama3.1:70b,mistral-large:123b`
- `WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434`
- `WORKER_3060_MODELS=codellama:34b,qwen2.5:32b`
- `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- `OPENROUTER_API_KEY=${OPENROUTER_API_KEY}`
- `MODEL_ROUTING_STRATEGY=cost-optimized`
- `MODEL_ROUTING_PREFER_LOCAL=true`

**Volumes:**
- `nexus_router_data:/app/data`
- `nexus_router_logs:/app/logs`

**Networks:**
- `nyra-public`
- `nyra-internal`
- `tailscale`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

### 8. Letta - Agent Memory Management

**Purpose:** OS-like memory for AI agents (core + archival memory)

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Letta
RUN pip install --no-cache-dir letta

# Create directories
RUN mkdir -p /root/.letta /data

EXPOSE 8283 8284

CMD ["letta", "server", "--host", "0.0.0.0", "--port", "8283"]
```

**Environment Variables:**
- `LETTA_SERVER_PASSWORD=${LETTA_SERVER_PASSWORD}`
- `LETTA_POSTGRES_URI=postgresql://nyra_user:${POSTGRES_PASSWORD}@postgresql:5432/letta`
- `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- `LETTA_LLM_ENDPOINT=http://nexus-router:8000/v1`
- `LETTA_CORE_MEMORY_SIZE=4000`
- `LETTA_ARCHIVAL_MEMORY_ENABLED=true`

**Volumes:**
- `letta_data:/root/.letta`
- `letta_storage:/data`

**Networks:**
- `nyra-internal`
- `nyra-database`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

### 9. FalkorDB - Temporal Knowledge Graphs

**Purpose:** Graph database for temporal knowledge representation

**Dockerfile:**
```dockerfile
FROM falkordb/falkordb:latest

# Copy custom configuration
COPY configs/falkordb/falkordb.conf /etc/falkordb.conf

EXPOSE 6379

CMD ["redis-server", "/etc/falkordb.conf"]
```

**Environment Variables:**
- `REDIS_PASSWORD=${FALKORDB_PASSWORD}`
- `FALKORDB_MAX_MEMORY=4gb`
- `FALKORDB_PERSISTENCE=aof`
- `FALKORDB_AOF_SYNC=everysec`

**Volumes:**
- `falkordb_data:/data`

**Networks:**
- `nyra-internal`
- `nyra-database`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

### 10. Qdrant - Vector Database

**Purpose:** High-performance vector search for embeddings

**Dockerfile:**
```dockerfile
FROM qdrant/qdrant:latest

EXPOSE 6333 6334

CMD ["./qdrant"]
```

**Environment Variables:**
- `QDRANT__SERVICE__API_KEY=${QDRANT_API_KEY}`
- `QDRANT__SERVICE__GRPC_PORT=6334`
- `QDRANT__STORAGE__STORAGE_PATH=/qdrant/storage`

**Volumes:**
- `qdrant_data:/qdrant/storage`

**Networks:**
- `nyra-internal`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
    reservations:
      cpus: '2.0'
      memory: 4G
```

---

### 11. LiteLLM Proxy - Unified LLM API

**Purpose:** Unified interface for multiple LLM providers

**Dockerfile:**
```dockerfile
FROM ghcr.io/berriai/litellm:main-stable

COPY configs/litellm/config.yaml /app/config.yaml

EXPOSE 4000

CMD ["--config", "/app/config.yaml", "--port", "4000"]
```

**Environment Variables:**
- `LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}`
- `DATABASE_URL=postgresql://nyra_user:${POSTGRES_PASSWORD}@postgresql:5432/litellm`
- `OPENROUTER_API_KEY=${OPENROUTER_API_KEY}`
- `ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}`
- `OPENAI_API_KEY=${OPENAI_API_KEY}`

**Volumes:**
- `litellm_data:/app/data`

**Networks:**
- `nyra-public`
- `nyra-internal`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

### 12. Open-WebUI - Development Interface

**Purpose:** Primary web interface for LLM interaction

**Dockerfile:**
```dockerfile
FROM ghcr.io/open-webui/open-webui:main

EXPOSE 8080

CMD ["bash", "start.sh"]
```

**Environment Variables:**
- `DATABASE_URL=postgresql://nyra_user:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db`
- `OPENAI_API_BASE_URL=http://nexus-router:8000/v1`
- `OPENAI_API_KEY=${ANTHROPIC_API_KEY}`
- `WEBUI_SECRET_KEY=${SESSION_SECRET}`
- `ENABLE_SIGNUP=false`
- `ENABLE_RAG=true`

**Volumes:**
- `open_webui_data:/app/backend/data`

**Networks:**
- `nyra-public`
- `nyra-internal`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

### 13. TwentyCRM - Open Source CRM

**Purpose:** Customer relationship management for mortgage leads

**Dockerfile:**
```dockerfile
FROM twentycrm/twenty:latest

EXPOSE 3000

CMD ["yarn", "start:prod"]
```

**Environment Variables:**
- `SERVER_URL=${TWENTY_SERVER_URL}`
- `ENCRYPTION_SECRET=${TWENTY_ENCRYPTION_SECRET}`
- `JWT_SECRET=${TWENTY_JWT_SECRET}`
- `PGHOST=postgresql`
- `PGPORT=5432`
- `PGUSER=nyra_user`
- `PGPASSWORD=${POSTGRES_PASSWORD}`
- `PGDATABASE=twenty`

**Volumes:**
- `twenty_storage:/app/storage`

**Networks:**
- `nyra-public`
- `nyra-database`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

### 14. n8n - Workflow Automation

**Purpose:** Drip campaigns, lead nurturing automation

**Dockerfile:**
```dockerfile
FROM n8nio/n8n:latest

EXPOSE 5678

CMD ["n8n"]
```

**Environment Variables:**
- `N8N_HOST=localhost`
- `N8N_PORT=5678`
- `N8N_PROTOCOL=http`
- `DB_TYPE=postgresdb`
- `DB_POSTGRESDB_HOST=postgresql`
- `DB_POSTGRESDB_PORT=5432`
- `DB_POSTGRESDB_DATABASE=n8n`
- `DB_POSTGRESDB_USER=nyra_user`
- `DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}`

**Volumes:**
- `n8n_data:/home/node/.n8n`

**Networks:**
- `nyra-public`
- `nyra-database`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

---

### 15. Prometheus - Metrics Collection

**Purpose:** Time-series metrics database

**Dockerfile:**
```dockerfile
FROM prom/prometheus:latest

COPY configs/observability/prometheus.yml /etc/prometheus/prometheus.yml
COPY configs/observability/alerts.yml /etc/prometheus/alerts.yml

EXPOSE 9090

CMD ["--config.file=/etc/prometheus/prometheus.yml", \
     "--storage.tsdb.path=/prometheus", \
     "--storage.tsdb.retention.time=30d"]
```

**Environment Variables:**
- `PROMETHEUS_RETENTION_DAYS=30`

**Volumes:**
- `prometheus_data:/prometheus`

**Networks:**
- `nyra-monitoring`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '1.0'
      memory: 2G
```

---

### 16. Grafana - Visualization Dashboard

**Purpose:** Metrics visualization and dashboards

**Dockerfile:**
```dockerfile
FROM grafana/grafana:latest

COPY configs/observability/grafana-datasources.yml /etc/grafana/provisioning/datasources/
COPY configs/observability/dashboards /etc/grafana/provisioning/dashboards/

EXPOSE 3000

CMD ["grafana-server"]
```

**Environment Variables:**
- `GF_SECURITY_ADMIN_USER=admin`
- `GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}`
- `GF_USERS_ALLOW_SIGN_UP=false`

**Volumes:**
- `grafana_data:/var/lib/grafana`

**Networks:**
- `nyra-public`
- `nyra-monitoring`

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

---

## Docker Compose Orchestration

### Master Orchestration File

**File:** `docker-compose.production.yml`

```yaml
# ============================================================================
# Project Nyra - Production Orchestration
# Claude Flow V3 + Full Features Stack
# ============================================================================

version: '3.8'

# ============================================================================
# NETWORKS
# ============================================================================
networks:
  nyra-public:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

  nyra-internal:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.21.0.0/16

  nyra-database:
    driver: bridge
    internal: true
    ipam:
      config:
        - subnet: 172.22.0.0/16

  nyra-monitoring:
    driver: bridge
    ipam:
      config:
        - subnet: 172.23.0.0/16

# ============================================================================
# VOLUMES
# ============================================================================
volumes:
  # Databases
  postgres_data:
  redis_data:
  falkordb_data:
  qdrant_data:

  # Memory Systems
  ruvector_data:
  letta_data:
  mem0_data:

  # Orchestration
  claude_flow_data:
  archon_data:
  nexus_router_data:

  # Applications
  twenty_storage:
  n8n_data:
  open_webui_data:

  # Monitoring
  prometheus_data:
  grafana_data:
  loki_data:

# ============================================================================
# SERVICES
# ============================================================================
services:

  # --------------------------------------------------------------------------
  # DATABASE LAYER
  # --------------------------------------------------------------------------

  postgresql:
    image: postgres:16-alpine
    container_name: nyra-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-nyra_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-nyra_db}
      POSTGRES_MULTIPLE_DATABASES: letta,twenty,dify,n8n,litellm
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/postgres-init:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    networks:
      - nyra-database
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-nyra_user}"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G

  redis:
    image: redis:7-alpine
    container_name: nyra-redis
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --maxmemory 4gb
      --maxmemory-policy allkeys-lru
      --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - nyra-internal
      - nyra-database
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  falkordb:
    image: falkordb/falkordb:latest
    container_name: nyra-falkordb
    restart: unless-stopped
    command: >
      redis-server
      --requirepass ${FALKORDB_PASSWORD}
      --appendonly yes
      --maxmemory 4gb
    volumes:
      - falkordb_data:/data
    ports:
      - "6380:6379"
    networks:
      - nyra-internal
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${FALKORDB_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  qdrant:
    image: qdrant/qdrant:latest
    container_name: nyra-qdrant
    restart: unless-stopped
    environment:
      QDRANT__SERVICE__API_KEY: ${QDRANT_API_KEY}
    volumes:
      - qdrant_data:/qdrant/storage
    ports:
      - "6333:6333"
      - "6334:6334"
    networks:
      - nyra-internal
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6333/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G

  # --------------------------------------------------------------------------
  # MEMORY LAYER
  # --------------------------------------------------------------------------

  ruvector:
    build:
      context: ./services/ruvector
      dockerfile: Dockerfile
    container_name: nyra-ruvector
    restart: unless-stopped
    env_file:
      - configs/env/ruvector.env
    environment:
      RUVECTOR_NODE_ROLE: coordinator
      RUVECTOR_MODE: distributed
    volumes:
      - ruvector_data:/data/ruvector
    ports:
      - "7890:7890"
      - "7891:7891"
      - "7892:7892"
    networks:
      - nyra-internal
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:7892/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 16G
        reservations:
          cpus: '2.0'
          memory: 8G

  letta:
    image: ghcr.io/letta-ai/letta:latest
    container_name: nyra-letta
    restart: unless-stopped
    environment:
      LETTA_SERVER_PASSWORD: ${LETTA_SERVER_PASSWORD}
      LETTA_POSTGRES_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/letta
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      LETTA_LLM_ENDPOINT: http://nexus-router:8000/v1
    volumes:
      - letta_data:/root/.letta
    ports:
      - "8283:8283"
      - "8284:8284"
    networks:
      - nyra-internal
      - nyra-database
    depends_on:
      postgresql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8283/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  # --------------------------------------------------------------------------
  # ORCHESTRATION LAYER
  # --------------------------------------------------------------------------

  nexus-router:
    build:
      context: ./services/nexus-router
      dockerfile: Dockerfile
    container_name: nyra-nexus-router
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 8000
      MCP_PORT: 4001
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      WORKER_5090_URL: ${WORKER_5090_URL}
      WORKER_3090_URL: ${WORKER_3090_URL}
      WORKER_3060_URL: ${WORKER_3060_URL}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      MODEL_ROUTING_STRATEGY: cost-optimized
      MODEL_ROUTING_PREFER_LOCAL: "true"
    volumes:
      - nexus_router_data:/app/data
    ports:
      - "8000:8000"
      - "4001:4001"
    networks:
      - nyra-public
      - nyra-internal
    depends_on:
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  claude-flow:
    build:
      context: ./orchestration/claude-flow
      dockerfile: Dockerfile
    container_name: nyra-claude-flow
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 9000
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      CLAUDE_FLOW_MODE: dual-orchestrator
      CLAUDE_FLOW_HOOKS_ENABLED: "true"
      RUVECTOR_URL: http://ruvector:7890
      LETTA_URL: http://letta:8283
    volumes:
      - claude_flow_data:/app/data
      - /var/run/docker.sock:/var/run/docker.sock
    ports:
      - "9000:9000"
    networks:
      - nyra-public
      - nyra-internal
    depends_on:
      postgresql:
        condition: service_healthy
      redis:
        condition: service_healthy
      nexus-router:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 4G
        reservations:
          cpus: '2.0'
          memory: 2G

  archon-os:
    build:
      context: ./services/archon-os
      dockerfile: Dockerfile
    container_name: nyra-archon-os
    restart: unless-stopped
    environment:
      PORT: 9001
      ARCHON_MCP_PORT: 9002
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      ARCHON_TOPOLOGY: hierarchical
    volumes:
      - archon_data:/app/data
    ports:
      - "9001:9001"
      - "9002:9002"
    networks:
      - nyra-internal
    depends_on:
      postgresql:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # --------------------------------------------------------------------------
  # APPLICATION LAYER
  # --------------------------------------------------------------------------

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: nyra-open-webui
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgresql:5432/nyra_db
      OPENAI_API_BASE_URL: http://nexus-router:8000/v1
      OPENAI_API_KEY: ${ANTHROPIC_API_KEY}
      WEBUI_SECRET_KEY: ${SESSION_SECRET}
      ENABLE_SIGNUP: "false"
      ENABLE_RAG: "true"
    volumes:
      - open_webui_data:/app/backend/data
    ports:
      - "3210:8080"
    networks:
      - nyra-public
      - nyra-internal
    depends_on:
      postgresql:
        condition: service_healthy
      nexus-router:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  twenty:
    image: twentycrm/twenty:latest
    container_name: nyra-twenty
    restart: unless-stopped
    environment:
      SERVER_URL: ${TWENTY_SERVER_URL}
      ENCRYPTION_SECRET: ${TWENTY_ENCRYPTION_SECRET}
      JWT_SECRET: ${TWENTY_JWT_SECRET}
      PGHOST: postgresql
      PGPORT: 5432
      PGUSER: ${POSTGRES_USER}
      PGPASSWORD: ${POSTGRES_PASSWORD}
      PGDATABASE: twenty
    volumes:
      - twenty_storage:/app/storage
    ports:
      - "3001:3000"
    networks:
      - nyra-public
      - nyra-database
    depends_on:
      postgresql:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  n8n:
    image: n8nio/n8n:latest
    container_name: nyra-n8n
    restart: unless-stopped
    environment:
      N8N_HOST: localhost
      N8N_PORT: 5678
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgresql
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - n8n_data:/home/node/.n8n
    ports:
      - "5678:5678"
    networks:
      - nyra-public
      - nyra-database
    depends_on:
      postgresql:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # --------------------------------------------------------------------------
  # MONITORING LAYER
  # --------------------------------------------------------------------------

  prometheus:
    image: prom/prometheus:latest
    container_name: nyra-prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    volumes:
      - ./configs/observability/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - nyra-monitoring
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
        reservations:
          cpus: '1.0'
          memory: 2G

  grafana:
    image: grafana/grafana:latest
    container_name: nyra-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_USERS_ALLOW_SIGN_UP: "false"
    volumes:
      - ./configs/observability/grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml:ro
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    networks:
      - nyra-public
      - nyra-monitoring
    depends_on:
      - prometheus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Environment Configuration

### Unified Environment Strategy

**Primary Environment File:** `.env.production`

```bash
# ============================================================================
# PROJECT NYRA - PRODUCTION ENVIRONMENT
# ============================================================================

# ----------------------------------------------------------------------------
# CORE CONFIGURATION
# ----------------------------------------------------------------------------
PROJECT_NAME=project-nyra
PROJECT_ENV=production
NODE_ENV=production
LOG_LEVEL=info

# ----------------------------------------------------------------------------
# DATABASE
# ----------------------------------------------------------------------------
POSTGRES_USER=nyra_user
POSTGRES_PASSWORD=<GENERATE_STRONG_PASSWORD>
POSTGRES_DB=nyra_db

# ----------------------------------------------------------------------------
# CACHING
# ----------------------------------------------------------------------------
REDIS_PASSWORD=<GENERATE_STRONG_PASSWORD>
REDIS_MAX_MEMORY=4gb

# ----------------------------------------------------------------------------
# GRAPH DATABASE
# ----------------------------------------------------------------------------
FALKORDB_PASSWORD=<GENERATE_STRONG_PASSWORD>

# ----------------------------------------------------------------------------
# VECTOR DATABASE
# ----------------------------------------------------------------------------
QDRANT_API_KEY=<GENERATE_API_KEY>

# ----------------------------------------------------------------------------
# AI PROVIDERS
# ----------------------------------------------------------------------------
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>
OPENROUTER_API_KEY=<YOUR_OPENROUTER_KEY>
OPENAI_API_KEY=<YOUR_OPENAI_KEY>
GOOGLE_GEMINI_API_KEY=<YOUR_GEMINI_KEY>

# ----------------------------------------------------------------------------
# GPU WORKERS (Tailscale)
# ----------------------------------------------------------------------------
WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434

# ----------------------------------------------------------------------------
# LETTA
# ----------------------------------------------------------------------------
LETTA_SERVER_PASSWORD=<GENERATE_STRONG_PASSWORD>

# ----------------------------------------------------------------------------
# TWENTYCRM
# ----------------------------------------------------------------------------
TWENTY_SERVER_URL=http://localhost:3001
TWENTY_ENCRYPTION_SECRET=<GENERATE_SECRET>
TWENTY_JWT_SECRET=<GENERATE_JWT_SECRET>
TWENTY_PASSWORD_SALT=<GENERATE_SALT>

# ----------------------------------------------------------------------------
# SESSION & SECURITY
# ----------------------------------------------------------------------------
SESSION_SECRET=<GENERATE_SESSION_SECRET>
ENCRYPTION_KEY=<GENERATE_ENCRYPTION_KEY>

# ----------------------------------------------------------------------------
# MONITORING
# ----------------------------------------------------------------------------
GRAFANA_ADMIN_PASSWORD=<GENERATE_ADMIN_PASSWORD>

# ----------------------------------------------------------------------------
# SECRETS MANAGEMENT
# ----------------------------------------------------------------------------
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_CLIENT_ID=<YOUR_CLIENT_ID>
INFISICAL_CLIENT_SECRET=<YOUR_CLIENT_SECRET>
INFISICAL_ENVIRONMENT=production

# ----------------------------------------------------------------------------
# NETWORKING
# ----------------------------------------------------------------------------
TAILSCALE_AUTH_KEY=<YOUR_TAILSCALE_AUTH_KEY>
CLOUDFLARE_TUNNEL_TOKEN=<YOUR_CLOUDFLARE_TOKEN>

# ============================================================================
# END OF CONFIGURATION
# ============================================================================
```

### Environment Loading Strategy

**Option 1: Direct .env file**
```bash
docker compose --env-file .env.production up -d
```

**Option 2: Infisical (Recommended)**
```bash
infisical run \
  --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="production" \
  --path="/shared" \
  -- docker compose -f docker-compose.production.yml up -d
```

---

## Volume Management

### Volume Strategy

**Named Volumes (Production):**
- Managed by Docker
- Automatic backups via scripts
- Easy migration

**Bind Mounts (Development):**
- Direct filesystem access
- Hot reloading
- Debugging

### Volume Backup Script

**File:** `scripts/backup-volumes.sh`

```bash
#!/bin/bash
# ============================================================================
# Project Nyra - Volume Backup Script
# ============================================================================

BACKUP_DIR="/backups/docker-volumes/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

# List of volumes to backup
VOLUMES=(
  "postgres_data"
  "redis_data"
  "ruvector_data"
  "letta_data"
  "claude_flow_data"
  "grafana_data"
  "prometheus_data"
)

for VOLUME in "${VOLUMES[@]}"; do
  echo "Backing up $VOLUME..."
  docker run --rm \
    -v "${VOLUME}:/source:ro" \
    -v "${BACKUP_DIR}:/backup" \
    alpine \
    tar czf "/backup/${VOLUME}.tar.gz" -C /source .
  echo "✓ $VOLUME backed up"
done

echo "✓ All volumes backed up to $BACKUP_DIR"
```

---

## Port Allocation Standard

### Port Allocation Map

| Service | Port(s) | Purpose |
|---------|---------|---------|
| **Databases** |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & sessions |
| FalkorDB | 6380 | Graph database |
| Qdrant | 6333, 6334 | Vector search (HTTP, gRPC) |
| **Memory Systems** |
| RuVector | 7890, 7891, 7892 | Vector search (API, gRPC, Admin) |
| Letta | 8283, 8284 | Agent memory (API, MCP) |
| Mem0 | 8081 | User personalization |
| **Orchestration** |
| Nexus Router | 8000, 4001 | LLM routing (API, MCP) |
| Claude Flow | 9000 | Multi-agent orchestration |
| Archon OS | 9001, 9002 | Task orchestration (API, MCP) |
| LiteLLM | 4000 | Unified LLM API |
| **Applications** |
| Open-WebUI | 3210 | Web interface |
| TwentyCRM | 3001 | CRM system |
| n8n | 5678 | Workflow automation |
| Nexus Dashboard | 3020 | Admin dashboard |
| **Monitoring** |
| Prometheus | 9090 | Metrics collection |
| Grafana | 3000 | Dashboards |
| Loki | 3100 | Log aggregation |
| Alertmanager | 9093 | Alert routing |
| Node Exporter | 9100 | System metrics |
| cAdvisor | 8080 | Container metrics |

---

## Build Instructions

### Build All Containers

```bash
# Build all custom containers
docker compose -f docker-compose.production.yml build

# Build specific service
docker compose build nexus-router

# Build with no cache
docker compose build --no-cache

# Build and start
docker compose up -d --build
```

### Multi-Architecture Builds

```bash
# Setup buildx for multi-arch
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag nyra/nexus-router:latest \
  --push \
  ./services/nexus-router
```

---

## Deployment Strategies

### Strategy 1: Single Machine Deployment

**Use Case:** Development, testing, small-scale

```bash
# Deploy everything on one machine
docker compose -f docker-compose.production.yml up -d

# Monitor logs
docker compose logs -f

# Scale specific service
docker compose up -d --scale claude-flow=3
```

### Strategy 2: Multi-Machine Deployment (Recommended)

**Use Case:** Production, high availability

**Orchestrator Machine:**
```bash
# Deploy core infrastructure
docker compose \
  -f docker-compose.orchestrator.yml \
  up -d
```

**Worker Machines:**
```bash
# Deploy RuVector worker + Ollama
docker compose \
  -f docker-compose.worker.yml \
  up -d
```

### Strategy 3: Kubernetes Deployment

**Convert to Kubernetes:**
```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose
chmod +x kompose
sudo mv kompose /usr/local/bin/

# Convert docker-compose to k8s manifests
kompose convert -f docker-compose.production.yml -o k8s/

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Strategy 4: Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy \
  -c docker-compose.production.yml \
  nyra

# List services
docker stack services nyra

# Scale service
docker service scale nyra_claude-flow=3
```

---

## Health Checks & Monitoring

### Health Check Configuration

All services include health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:PORT/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

### Monitoring Stack Components

**Prometheus Scrape Config:**
```yaml
# configs/observability/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'ruvector'
    static_configs:
      - targets: ['ruvector:9090']

  - job_name: 'nexus-router'
    static_configs:
      - targets: ['nexus-router:9091']

  - job_name: 'claude-flow'
    static_configs:
      - targets: ['claude-flow:9092']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

### Grafana Dashboards

Pre-configured dashboards:
- RuVector Performance
- Claude Flow Agent Metrics
- Nexus Router Latency
- Database Performance
- System Resources

---

## Security Configuration

### Security Best Practices

1. **Secrets Management**
   - Use Infisical for production secrets
   - Never commit .env files with real secrets
   - Rotate secrets regularly

2. **Network Isolation**
   - Database network is internal-only
   - Services communicate via internal network
   - Only web interfaces on public network

3. **TLS/SSL**
   ```bash
   # Generate self-signed certificates
   openssl req -x509 -nodes \
     -days 365 \
     -newkey rsa:2048 \
     -keyout certs/nyra.key \
     -out certs/nyra.crt
   ```

4. **Container Security**
   - Run as non-root user
   - Read-only root filesystem where possible
   - Resource limits enforced
   - Security scanning with Trivy

### Security Scanning

```bash
# Scan all images
for image in $(docker images --format "{{.Repository}}:{{.Tag}}" | grep nyra); do
  trivy image "$image"
done
```

---

## Backup & Recovery

### Automated Backup Strategy

**Daily Backups:**
```bash
# Cron job: /etc/cron.daily/nyra-backup
#!/bin/bash
cd /opt/project-nyra
./scripts/backup-volumes.sh
./scripts/backup-database.sh
./scripts/sync-to-s3.sh
```

**Database Backup Script:**
```bash
#!/bin/bash
# scripts/backup-database.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/databases"

# PostgreSQL backup
docker exec nyra-postgres pg_dumpall -U nyra_user | \
  gzip > "${BACKUP_DIR}/postgres_${TIMESTAMP}.sql.gz"

# Redis backup
docker exec nyra-redis redis-cli --rdb /data/dump.rdb
docker cp nyra-redis:/data/dump.rdb "${BACKUP_DIR}/redis_${TIMESTAMP}.rdb"

# Retention (keep 30 days)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +30 -delete
```

### Disaster Recovery

**Full System Restore:**
```bash
# 1. Stop all containers
docker compose down

# 2. Restore volumes
./scripts/restore-volumes.sh /backups/docker-volumes/2026-01-18

# 3. Restore databases
./scripts/restore-database.sh /backups/databases/postgres_20260118.sql.gz

# 4. Start services
docker compose up -d

# 5. Verify health
./scripts/health-check.sh
```

---

## Troubleshooting

### Common Issues

**Issue: Container won't start**
```bash
# Check logs
docker compose logs <service-name>

# Check resource usage
docker stats

# Check disk space
df -h
```

**Issue: Database connection failed**
```bash
# Verify PostgreSQL is running
docker exec nyra-postgres pg_isready -U nyra_user

# Check network connectivity
docker exec nyra-claude-flow ping postgresql

# View PostgreSQL logs
docker compose logs postgresql
```

**Issue: RuVector nodes not connecting**
```bash
# Check Tailscale connectivity
docker exec nyra-ruvector ping worker-5090.tail-net.ts.net

# Verify Raft consensus
docker exec nyra-ruvector curl http://localhost:7892/cluster/status

# Check RuVector logs
docker compose logs ruvector
```

**Issue: High memory usage**
```bash
# Identify memory hog
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}"

# Adjust resource limits
# Edit docker-compose.production.yml and update deploy.resources

# Restart specific service
docker compose restart <service-name>
```

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=debug
export RUVECTOR_LOG_LEVEL=debug
export CLAUDE_FLOW_DEBUG=true

# Rebuild and restart
docker compose up -d --build
```

---

## Quick Start Commands

```bash
# Initial setup
git clone <repo>
cd Project-Nyra
cp .env.example .env.production
# Edit .env.production with your secrets

# Build and start
docker compose -f docker-compose.production.yml up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f

# Stop all
docker compose down

# Full cleanup (⚠️ deletes volumes)
docker compose down -v
```

---

## Performance Tuning

### PostgreSQL Tuning

```sql
-- configs/postgresql/postgresql.conf
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 52MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

### Redis Tuning

```conf
# configs/redis/redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec
```

### RuVector Tuning

See `configs/env/ruvector.env` for 280+ tuning parameters.

---

## Support & Documentation

- **Project Repository:** https://github.com/your-org/Project-Nyra
- **Claude Flow Docs:** https://github.com/ruvnet/claude-flow
- **RuVector Docs:** (Internal documentation)
- **Issues:** https://github.com/your-org/Project-Nyra/issues

---

## License

Project Nyra is proprietary software. All rights reserved.

---

## Changelog

**Version 3.0.0 (2026-01-18)**
- Complete containerization of all services
- RuVector distributed deployment
- Multi-machine orchestration
- Comprehensive monitoring stack
- Production-ready security configuration

---

**END OF CONTAINERIZATION GUIDE**
