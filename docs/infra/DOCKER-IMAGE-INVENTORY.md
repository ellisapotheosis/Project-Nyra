# Docker Image Inventory - Project Nyra

**Document Version**: 1.0.0
**Last Updated**: 2026-01-13
**Total Images**: 84 (62 external + 22 custom builds)
**Status**: ✅ Complete Production Inventory

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Image Categories](#image-categories)
3. [External Images (62)](#external-images)
4. [Custom Built Images (22)](#custom-built-images)
5. [Version Management Strategy](#version-management-strategy)
6. [Security & Vulnerability Management](#security--vulnerability-management)
7. [Image Size Analysis](#image-size-analysis)
8. [Update & Maintenance Schedule](#update--maintenance-schedule)
9. [CI/CD Integration](#cicd-integration)
10. [Disaster Recovery](#disaster-recovery)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## Executive Summary

### Overview

Project Nyra's Docker infrastructure consists of **84 total images** across 20+ compose files, organized into 9 functional categories:

- **Databases**: 7 images (PostgreSQL, Redis, Vector DBs)
- **LLM Infrastructure**: 4 images (LiteLLM, Letta, UI interfaces)
- **Orchestration**: 10 images (n8n, Dify, Activepieces, TwentyCRM)
- **Monitoring & Observability**: 16 images (Prometheus, Grafana, Loki, Tempo, Exporters)
- **MCP Servers**: 9 images (Custom + Official MCP servers)
- **Development Tools**: 6 images (Portainer, PgAdmin, Redis Commander, MailHog)
- **Infrastructure Services**: 7 images (Nginx, MinIO, Consul, Jaeger)
- **GPU Compute**: 1 image (DCGM Exporter)
- **Custom Services**: 22 images (Quote Engine, Campaign Engine, Custom MCPs, etc.)

### Quick Statistics

```
Total Storage (Estimated):    45-60 GB
Largest Category:             Monitoring (16 images, ~12 GB)
Most Critical:                PostgreSQL, Redis, LiteLLM (Core infrastructure)
Update Frequency:             Weekly (dev), Monthly (prod)
Vulnerability Scanning:       Enabled via GitHub Actions
Registry:                     Docker Hub, GitHub Container Registry, Custom (nyra/*)
```

### Health Status

| Category | Images | Status | Last Check |
|----------|--------|--------|------------|
| Databases | 7 | ✅ Healthy | 2026-01-13 |
| LLM | 4 | ✅ Healthy | 2026-01-13 |
| Orchestration | 10 | ✅ Healthy | 2026-01-13 |
| Monitoring | 16 | ✅ Healthy | 2026-01-13 |
| MCP Servers | 9 | ⚠️ Custom builds need CI/CD | 2026-01-13 |
| Dev Tools | 6 | ✅ Healthy | 2026-01-13 |
| Infrastructure | 7 | ✅ Healthy | 2026-01-13 |
| GPU | 1 | ✅ Healthy | 2026-01-13 |
| Custom | 22 | ⚠️ Need Dockerfiles + CI/CD | 2026-01-13 |

---

## Image Categories

### Category Breakdown

```mermaid
pie title Docker Image Distribution
    "Monitoring" : 16
    "Custom Services" : 22
    "Orchestration" : 10
    "MCP Servers" : 9
    "Databases" : 7
    "Infrastructure" : 7
    "Dev Tools" : 6
    "LLM" : 4
    "GPU" : 1
```

### Dependency Graph

```mermaid
graph TD
    A[PostgreSQL] --> B[Dify]
    A --> C[TwentyCRM]
    A --> D[n8n]
    A --> E[Letta]
    A --> F[LiteLLM]
    A --> G[Open-WebUI]
    A --> H[LobeChat]

    R[Redis] --> B
    R --> D
    R --> I[Activepieces]

    Q[Qdrant] --> B
    N[Neo4j] --> J[letta]

    F --> G
    F --> H

    P[Prometheus] --> K[Grafana]
    L[Loki] --> K
    T[Tempo] --> K
```

---

## External Images

### 1. Databases (7 images)

#### PostgreSQL Images

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `pgvector/pgvector` | pg16 | ~350 MB | Primary database with vector extension | Monthly |
| `postgres` | 16-alpine | ~240 MB | Lightweight PostgreSQL | Monthly |
| `postgres` | 15-alpine | ~235 MB | Legacy compatibility | Quarterly |
| `postgres` | 15 | ~380 MB | Standard PostgreSQL | Quarterly |
| `ankane/pgvector` | latest | ~350 MB | Alternative vector DB | As needed |

**Configuration Example**:
```yaml
postgres:
  image: pgvector/pgvector:pg16
  environment:
    POSTGRES_MULTIPLE_DATABASES: dify,twenty,letta,n8n,litellm,nyra,activepieces
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./postgres-init:/docker-entrypoint-initdb.d:ro
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres"]
    interval: 10s
```

**Used By**: Dify, TwentyCRM, Letta, n8n, LiteLLM, Open-WebUI, LobeChat, Activepieces

#### Redis Images

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `redis` | 7-alpine | ~30 MB | Primary caching layer | Monthly |
| `redis` | alpine | ~30 MB | Generic Redis | Monthly |

**Configuration Example**:
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
  volumes:
    - redis-data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
```

**Used By**: Dify, n8n, Activepieces, various caching needs

#### Vector Databases

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `qdrant/qdrant` | latest | ~450 MB | Vector embeddings storage | Bi-weekly |
| `neo4j` | 5-community | ~700 MB | Graph database (letta) | Quarterly |
| `falkordb/falkordb` | latest | ~120 MB | Redis-compatible graph DB | Monthly |

**Configuration Example**:
```yaml
qdrant:
  image: qdrant/qdrant:latest
  volumes:
    - qdrant-data:/qdrant/storage
  environment:
    - QDRANT_ALLOW_RECOVERY_MODE=true
  healthcheck:
    test: ["CMD-SHELL", "timeout 1 bash -c '</dev/tcp/localhost/6333' || exit 1"]
```

**Used By**:
- Qdrant → Dify (RAG embeddings)
- Neo4j → letta (knowledge graphs)
- FalkorDB → Lightweight graph operations

---

### 2. LLM Infrastructure (4 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `ghcr.io/berriai/litellm` | main-latest | ~800 MB | Unified LLM proxy | Weekly |
| `ghcr.io/berriai/litellm` | latest | ~800 MB | Stable LLM proxy | Monthly |
| `ghcr.io/open-webui/open-webui` | main | ~1.2 GB | Development UI | Weekly |
| `lobehub/lobe-chat` | latest | ~600 MB | Alternative UI | Bi-weekly |
| `letta/letta` | latest | ~900 MB | Memory-enabled LLM agent | Bi-weekly |

**LiteLLM Configuration**:
```yaml
litellm:
  image: ghcr.io/berriai/litellm:main-latest
  environment:
    - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - DATABASE_URL=${DATABASE_URL}
  ports:
    - "4000:4000"
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
```

**Integration Points**:
- LiteLLM → Nexus Router → GPU Workers (PC2/PC3/PC4)
- Open-WebUI → LiteLLM (via `OPENAI_API_BASE_URL`)
- LobeChat → LiteLLM (via `OPENAI_PROXY_URL`)
- Letta → LiteLLM (via API proxy)

---

### 3. Orchestration & Workflow (10 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `n8nio/n8n` | latest | ~850 MB | Workflow automation | Bi-weekly |
| `langgenius/dify-api` | latest | ~1.5 GB | Dify backend API | Weekly |
| `langgenius/dify-web` | latest | ~600 MB | Dify frontend | Weekly |
| `langgenius/dify-sandbox` | latest | ~400 MB | Code execution sandbox | Weekly |
| `activepieces/activepieces` | latest | ~700 MB | Alternative automation | Monthly |
| `twentycrm/twenty` | latest | ~1.2 GB | CRM platform | Bi-weekly |
| `gitea/gitea` | latest | ~350 MB | Git hosting | Monthly |
| `gitea/act_runner` | latest | ~180 MB | GitHub Actions runner | Monthly |
| `zepai/knowledge-graph-mcp` | standalone | ~600 MB | Knowledge graph | Quarterly |
| `grafbase/nexus` | latest | ~450 MB | API gateway | Monthly |

**n8n Configuration**:
```yaml
n8n:
  image: n8nio/n8n:latest
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=${N8N_USER}
    - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    - DB_TYPE=postgresdb
    - DB_POSTGRESDB_DATABASE=n8n
    - DB_POSTGRESDB_HOST=postgres
    - DB_POSTGRESDB_PORT=5432
    - DB_POSTGRESDB_USER=${POSTGRES_USER}
    - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
  volumes:
    - n8n_data:/home/node/.n8n
  ports:
    - "5678:5678"
  depends_on:
    - postgres
```

**Dify Stack Configuration**:
```yaml
dify-api:
  image: langgenius/dify-api:latest
  environment:
    - DB_USERNAME=${POSTGRES_USER}
    - DB_PASSWORD=${POSTGRES_PASSWORD}
    - DB_HOST=postgres
    - DB_DATABASE=dify
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - VECTOR_STORE=qdrant
    - QDRANT_URL=http://qdrant:6333
  depends_on:
    - postgres
    - redis
    - qdrant

dify-web:
  image: langgenius/dify-web:latest
  environment:
    - CONSOLE_API_URL=http://dify-api:5001
    - APP_API_URL=http://dify-api:5001
  depends_on:
    - dify-api

dify-sandbox:
  image: langgenius/dify-sandbox:latest
  environment:
    - GIN_MODE=release
```

---

### 4. Monitoring & Observability (16 images)

#### Metrics Collection (6 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `prom/prometheus` | v2.48.0 | ~250 MB | Metrics database | Quarterly |
| `prom/prometheus` | latest | ~250 MB | Latest metrics DB | Monthly |
| `prom/node-exporter` | v1.7.0 | ~25 MB | Host metrics | Quarterly |
| `prom/node-exporter` | latest | ~25 MB | Latest host metrics | Monthly |
| `prom/pushgateway` | v1.6.2 | ~20 MB | Batch job metrics | Quarterly |
| `gcr.io/cadvisor/cadvisor` | v0.47.2 | ~80 MB | Container metrics | Quarterly |
| `gcr.io/cadvisor/cadvisor` | latest | ~80 MB | Latest container metrics | Monthly |

**Prometheus Configuration**:
```yaml
prometheus:
  image: prom/prometheus:v2.48.0
  command:
    - '--config.file=/etc/prometheus/prometheus.yml'
    - '--storage.tsdb.path=/prometheus'
    - '--storage.tsdb.retention.time=30d'
    - '--storage.tsdb.retention.size=50GB'
    - '--web.enable-lifecycle'
    - '--web.enable-admin-api'
  ports:
    - "9090:9090"
  volumes:
    - ../monitoring/prometheus/prometheus-enhanced.yml:/etc/prometheus/prometheus.yml:ro
    - ../monitoring/prometheus/alerts:/etc/prometheus/alerts:ro
    - prometheus_data:/prometheus
```

#### Service Exporters (4 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `prometheuscommunity/postgres-exporter` | v0.15.0 | ~30 MB | PostgreSQL metrics | Quarterly |
| `oliver006/redis_exporter` | v1.55.0 | ~25 MB | Redis metrics | Quarterly |
| `prom/blackbox-exporter` | v0.24.0 | ~30 MB | HTTP/TCP probes | Quarterly |
| `nvcr.io/nvidia/k8s/dcgm-exporter` | 3.1.8 | ~600 MB | GPU metrics | Quarterly |

**Exporter Configurations**:
```yaml
postgres-exporter:
  image: prometheuscommunity/postgres-exporter:v0.15.0
  environment:
    DATA_SOURCE_NAME: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/nyra?sslmode=disable"
  ports:
    - "9187:9187"

redis-exporter:
  image: oliver006/redis_exporter:v1.55.0
  environment:
    REDIS_ADDR: "redis://redis:6379"
  ports:
    - "9121:9121"

dcgm-exporter:
  image: nvcr.io/nvidia/k8s/dcgm-exporter:3.1.8-3.1.5-ubuntu22.04
  runtime: nvidia
  environment:
    - DCGM_EXPORTER_LISTEN=:9400
  ports:
    - "9400:9400"
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

#### Logging & Tracing (6 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `grafana/loki` | 2.9.3 | ~80 MB | Log aggregation | Quarterly |
| `grafana/loki` | latest | ~80 MB | Latest log aggregation | Monthly |
| `grafana/promtail` | 2.9.3 | ~60 MB | Log shipper | Quarterly |
| `grafana/promtail` | latest | ~60 MB | Latest log shipper | Monthly |
| `grafana/tempo` | 2.3.1 | ~90 MB | Distributed tracing | Quarterly |
| `jaegertracing/jaeger-query` | 1.52.0 | ~70 MB | Trace UI | Quarterly |

**Loki Stack Configuration**:
```yaml
loki:
  image: grafana/loki:2.9.3
  command: -config.file=/etc/loki/loki.yml
  ports:
    - "3100:3100"
  volumes:
    - ../monitoring/loki/loki.yml:/etc/loki/loki.yml:ro
    - loki_data:/loki

promtail:
  image: grafana/promtail:2.9.3
  command: -config.file=/etc/promtail/promtail.yml
  volumes:
    - ../monitoring/promtail.yml:/etc/promtail/promtail.yml:ro
    - /var/log:/var/log:ro
    - /var/lib/docker/containers:/var/lib/docker/containers:ro

tempo:
  image: grafana/tempo:2.3.1
  command: -config.file=/etc/tempo/tempo.yml
  ports:
    - "3200:3200"
    - "4317:4317"
    - "4318:4318"
  volumes:
    - ../monitoring/tempo/tempo.yml:/etc/tempo/tempo.yml:ro
    - tempo_data:/var/tempo
```

#### Visualization & Alerting (2 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `grafana/grafana` | 10.2.3 | ~400 MB | Dashboards & viz | Quarterly |
| `grafana/grafana` | latest | ~400 MB | Latest dashboards | Monthly |
| `prom/alertmanager` | v0.26.0 | ~60 MB | Alert routing | Quarterly |
| `prom/alertmanager` | latest | ~60 MB | Latest alerting | Monthly |

**Grafana Configuration**:
```yaml
grafana:
  image: grafana/grafana:10.2.3
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
    - GF_USERS_ALLOW_SIGN_UP=false
    - GF_SERVER_ROOT_URL=http://localhost:3000
    - GF_INSTALL_PLUGINS=grafana-piechart-panel
  ports:
    - "3000:3000"
  volumes:
    - grafana_data:/var/lib/grafana
    - ../monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    - ../monitoring/grafana/dashboards:/var/lib/grafana/dashboards:ro
  depends_on:
    - prometheus
    - loki
    - tempo
```

---

### 5. MCP Servers (9 images)

| Image | Version | Size | Purpose | Status |
|-------|---------|------|---------|--------|
| `zepai/knowledge-graph-mcp` | standalone | ~600 MB | Knowledge graphs | ✅ Production |
| Custom MCP Gemini | - | ~300 MB | Gemini assistant | ⚠️ Needs CI/CD |
| Custom MCP Claude Flow | - | ~400 MB | Claude Flow server | ⚠️ Needs CI/CD |
| Custom MCP RuV Swarm | - | ~350 MB | Swarm coordination | ⚠️ Needs CI/CD |
| Custom MCP letta | - | ~500 MB | Graph database | ⚠️ Needs CI/CD |
| Custom MCP Filesystem | - | ~150 MB | File operations | ⚠️ Needs CI/CD |
| Custom MCP GitHub | - | ~200 MB | GitHub integration | ⚠️ Needs CI/CD |
| Custom MCP Mem0 | - | ~350 MB | Memory service | ⚠️ Needs CI/CD |
| Custom MCP Nexus | - | ~300 MB | Router integration | ⚠️ Needs CI/CD |

**MCP Configuration Example**:
```yaml
mcp-archon-os:
  build:
    context: ../../bootstrap/mcp-servers/archon-os
    dockerfile: Dockerfile
  container_name: nyra-mcp-archon-os
  environment:
    - CLAUDE_FLOW_MEMORY=true
    - CLAUDE_FLOW_DISTRIBUTED=true
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - NODE_ENV=production
  volumes:
    - mcp-archon-os-data:/app/data
    - ../../.archon-os:/app/.archon-os:ro
  healthcheck:
    test: ["CMD", "npx", "@rUv/archon-os@alpha", "health"]
    interval: 30s
```

**⚠️ Action Required**: All custom MCP servers need:
1. Dockerfiles created (see [Custom Built Images](#custom-built-images))
2. CI/CD pipelines for automated builds
3. Version tagging strategy
4. Registry upload (ghcr.io or Docker Hub)

---

### 6. Development Tools (6 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `portainer/portainer-ce` | latest | ~280 MB | Docker UI management | Monthly |
| `dpage/pgadmin4` | latest | ~450 MB | PostgreSQL admin | Monthly |
| `rediscommander/redis-commander` | latest | ~120 MB | Redis UI | Quarterly |
| `mailhog/mailhog` | latest | ~40 MB | Email testing | Quarterly |
| `node` | 20-alpine | ~180 MB | Node.js runtime | Monthly |
| `nginx` | alpine | ~40 MB | Reverse proxy | Monthly |

**Portainer Configuration**:
```yaml
portainer:
  image: portainer/portainer-ce:latest
  container_name: nyra-portainer
  restart: unless-stopped
  ports:
    - "9000:9000"
    - "9443:9443"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - portainer_data:/data
  security_opt:
    - no-new-privileges:true
```

**PgAdmin Configuration**:
```yaml
pgadmin:
  image: dpage/pgadmin4:latest
  container_name: nyra-pgadmin
  environment:
    PGADMIN_DEFAULT_EMAIL: ${PGADMIN_EMAIL:-admin@nyra.local}
    PGADMIN_DEFAULT_PASSWORD: ${PGADMIN_PASSWORD}
    PGADMIN_CONFIG_SERVER_MODE: "False"
  ports:
    - "5050:80"
  volumes:
    - pgadmin_data:/var/lib/pgadmin
  depends_on:
    - postgres
```

---

### 7. Infrastructure Services (7 images)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `nginx` | alpine | ~40 MB | Reverse proxy | Monthly |
| `minio/minio` | latest | ~250 MB | S3-compatible storage | Bi-weekly |
| `consul` | 1.17.0 | ~150 MB | Service discovery | Quarterly |
| `grafbase/nexus` | latest | ~450 MB | API gateway | Monthly |
| `gitea/gitea` | latest | ~350 MB | Git repository | Monthly |
| `gitea/act_runner` | latest | ~180 MB | CI/CD runner | Monthly |
| Custom Nexus Router | - | ~400 MB | LLM routing | ⚠️ Needs CI/CD |

**MinIO Configuration**:
```yaml
minio:
  image: minio/minio:latest
  container_name: nyra-minio
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
  ports:
    - "9000:9000"
    - "9001:9001"
  volumes:
    - minio_data:/data
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
    interval: 30s
```

**Nginx Reverse Proxy Configuration**:
```yaml
nginx:
  image: nginx:alpine
  container_name: nyra-nginx
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/certs:/etc/nginx/certs:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
  depends_on:
    - dify-web
    - open-webui
    - lobechat
    - n8n
```

---

### 8. GPU Compute (1 image)

| Image | Version | Size | Purpose | Update Frequency |
|-------|---------|------|---------|------------------|
| `nvcr.io/nvidia/k8s/dcgm-exporter` | 3.1.8-3.1.5-ubuntu22.04 | ~600 MB | GPU metrics | Quarterly |

**DCGM Exporter Configuration**:
```yaml
dcgm-exporter:
  image: nvcr.io/nvidia/k8s/dcgm-exporter:3.1.8-3.1.5-ubuntu22.04
  container_name: nyra-dcgm-exporter
  runtime: nvidia
  environment:
    - DCGM_EXPORTER_LISTEN=:9400
  ports:
    - "9400:9400"
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
  networks:
    - monitoring
```

**Grafana Dashboard**: GPU metrics visualized via pre-built NVIDIA DCGM dashboard (#12239)

**Key Metrics**:
- GPU Utilization (%)
- GPU Memory Usage (MB)
- GPU Temperature (°C)
- GPU Power Draw (W)
- SM Clock (MHz)
- Memory Clock (MHz)

---

## Custom Built Images

### Overview

**Total Custom Images**: 22
**Status**: ⚠️ **Action Required** - Need Dockerfiles + CI/CD pipelines

### Categories

#### 1. Core Services (3 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| `nyra/nexus-router` | `services/nexus-router` | ~400 MB | ⚠️ Dockerfile needed |
| `nyra/archon-os` | `infra/dual-orchestrator/archon-os` | ~500 MB | ⚠️ Dockerfile needed |
| `nyra/archon-os` | `infra/dual-orchestrator/archon-os` | ~450 MB | ⚠️ Dockerfile needed |

**Nexus Router Dockerfile** (recommended):
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
```

#### 2. Business Logic Services (3 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| `nyra/quote-engine` | `services/quote-engine` | ~300 MB | ⚠️ Dockerfile needed |
| `nyra/campaign-engine` | `services/campaign-engine` | ~350 MB | ⚠️ Dockerfile needed |
| `nyra/quote-api` | `services/quote-api` | ~280 MB | ⚠️ Dockerfile needed |

**Quote Engine Dockerfile** (Python service):
```dockerfile
FROM python:3.11-slim AS builder

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production image
FROM python:3.11-slim

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /root/.local /root/.local

# Copy application code
COPY . .

# Update PATH
ENV PATH=/root/.local/bin:$PATH

# Expose port
EXPOSE 9010

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:9010/health')"

CMD ["python", "main.py"]
```

#### 3. MCP Servers (9 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| MCP Gemini | `bootstrap/mcp-gemini-assistant` | ~300 MB | ⚠️ Dockerfile needed |
| MCP Claude Flow | `bootstrap/mcp-servers/archon-os` | ~400 MB | ⚠️ Dockerfile needed |
| MCP RuV Swarm | `bootstrap/mcp-servers/ruv-swarm` | ~350 MB | ⚠️ Dockerfile needed |
| MCP letta | `bootstrap/mcp-servers/letta` | ~500 MB | ⚠️ Dockerfile needed |
| MCP Filesystem | `bootstrap/mcp-servers/filesystem` | ~150 MB | ⚠️ Dockerfile needed |
| MCP GitHub | `bootstrap/mcp-servers/github` | ~200 MB | ⚠️ Dockerfile needed |
| MCP Mem0 | `services/mem0-mcp` | ~350 MB | ✅ Dockerfile exists |
| MCP Nexus | `bootstrap/mcp-servers/nexus` | ~300 MB | ⚠️ Dockerfile needed |
| MCP Docker | `bootstrap/mcp-servers/docker` | ~250 MB | ⚠️ Dockerfile needed |

**Generic MCP Server Dockerfile** (Node.js):
```dockerfile
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
COPY --from=builder /app/package*.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server.js"]
```

#### 4. Orchestrator Services (2 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| Archon OS Coordinator | `infra/dual-orchestrator/archon-os` | ~500 MB | ⚠️ Dockerfile needed |
| Claude Flow Orchestrator | `infra/dual-orchestrator/archon-os` | ~450 MB | ⚠️ Dockerfile needed |

#### 5. Frontend Services (2 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| RateHunter Frontend | `apps/ratehunter` | ~600 MB | ⚠️ Dockerfile needed |
| Admin Dashboard | `apps/admin-dashboard` | ~550 MB | ⚠️ Dockerfile needed |

**Next.js Dockerfile** (RateHunter):
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build Next.js app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3333

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

#### 6. Testing & Development (3 images)

| Service | Build Context | Estimated Size | Status |
|---------|---------------|----------------|--------|
| Integration Test Runner | `tests/integration` | ~400 MB | ⚠️ Dockerfile needed |
| E2E Test Runner | `tests/e2e` | ~800 MB | ⚠️ Dockerfile needed |
| Development Environment | `infra/dev-environment` | ~1.2 GB | ⚠️ Dockerfile needed |

---

## Version Management Strategy

### Semantic Versioning

All custom images follow semantic versioning (SemVer):

```
MAJOR.MINOR.PATCH
  │     │     └─ Bug fixes, patches
  │     └─ New features (backward compatible)
  └─ Breaking changes
```

**Example Tags**:
- `nyra/nexus-router:1.0.0` - Stable release
- `nyra/nexus-router:1.0.0-rc.1` - Release candidate
- `nyra/nexus-router:1.0.0-beta.1` - Beta version
- `nyra/nexus-router:latest` - Latest stable
- `nyra/nexus-router:main` - Latest from main branch (dev)

### Tag Management

| Tag | Purpose | Update Frequency | Use Case |
|-----|---------|------------------|----------|
| `latest` | Latest stable release | On stable release | Production |
| `main` | Latest development build | On main branch commit | Development |
| `vX.Y.Z` | Specific version | Never (immutable) | Rollback, pinning |
| `vX.Y` | Minor version | On patch release | Auto-updates |
| `vX` | Major version | On minor release | Major version lock |
| `dev` | Development branch | On dev commit | Feature testing |
| `sha-abc123` | Git commit SHA | On commit | Debugging |

### External Image Versioning

**Pinning Strategy**:
```yaml
# ✅ Good: Pin to specific version
postgres: pgvector/pgvector:pg16

# ⚠️ Acceptable: Pin to minor version
redis: redis:7-alpine

# ❌ Avoid: Latest tag in production
grafana: grafana/grafana:latest  # Only for dev
```

**Version Update Process**:
1. **Development**: Test with `latest` tag
2. **Staging**: Pin to specific version (e.g., `v2.48.0`)
3. **Production**: Use same pinned version from staging
4. **Rollback**: Keep previous version tag in compose files as comments

**Example**:
```yaml
prometheus:
  image: prom/prometheus:v2.48.0  # Current production
  # image: prom/prometheus:v2.47.0  # Previous version (rollback ready)
```

---

## Security & Vulnerability Management

### Image Scanning

**Tools Used**:
- **Trivy**: Comprehensive vulnerability scanner
- **Snyk**: Dependency vulnerability detection
- **Docker Scout**: Image analysis and recommendations
- **GitHub Dependabot**: Automated dependency updates

**Scanning Process**:
```powershell
# Scan all running containers
docker ps --format "{{.Image}}" | Sort-Object -Unique | ForEach-Object {
    Write-Host "`n🔍 Scanning $_" -ForegroundColor Cyan
    trivy image $_ --severity HIGH,CRITICAL
}

# Scan specific image
trivy image pgvector/pgvector:pg16 --severity HIGH,CRITICAL

# Generate JSON report
trivy image --format json --output report.json nyra/nexus-router:latest
```

**CI/CD Integration**:
```yaml
# .github/workflows/image-scan.yml
name: Docker Image Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'nyra/nexus-router:latest'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Vulnerability Response

**Severity Levels**:

| Severity | Response Time | Action |
|----------|---------------|--------|
| **Critical** | < 24 hours | Immediate patch, rollback if needed |
| **High** | < 7 days | Scheduled update, test in staging |
| **Medium** | < 30 days | Include in next release cycle |
| **Low** | < 90 days | Address during major version bump |

**Patching Process**:
1. **Identify**: Trivy/Snyk alerts critical vulnerability
2. **Assess**: Check if vulnerability affects Project Nyra
3. **Plan**: Determine fix (update image, apply patch, mitigate)
4. **Test**: Deploy to staging environment
5. **Deploy**: Roll out to production with monitoring
6. **Verify**: Rescan to confirm vulnerability fixed

### Base Image Strategy

**Prefer Alpine Linux**:
```dockerfile
# ✅ Smaller attack surface, fewer vulnerabilities
FROM node:20-alpine
FROM python:3.11-slim
FROM postgres:16-alpine

# ❌ Larger images, more dependencies
FROM node:20
FROM python:3.11
FROM postgres:16
```

**Benefits**:
- **Size**: 50-70% smaller images
- **Security**: Fewer packages = fewer vulnerabilities
- **Performance**: Faster pulls and startup times

---

## Image Size Analysis

### Size Distribution

```
Total Storage Required: 45-60 GB

Category Breakdown:
├── Databases (7 images)           ~2.5 GB
├── LLM Infrastructure (4 images)  ~3.5 GB
├── Orchestration (10 images)      ~8.0 GB
├── Monitoring (16 images)         ~12.0 GB
├── MCP Servers (9 images)         ~3.0 GB
├── Dev Tools (6 images)           ~1.8 GB
├── Infrastructure (7 images)      ~2.2 GB
├── GPU (1 image)                  ~0.6 GB
└── Custom Services (22 images)    ~8.0-12.0 GB
```

### Size Optimization Techniques

#### 1. Multi-Stage Builds

**Before** (single stage):
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["node", "dist/index.js"]
# Size: ~1.2 GB
```

**After** (multi-stage):
```dockerfile
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
CMD ["node", "dist/index.js"]
# Size: ~250 MB (80% reduction)
```

#### 2. Layer Caching

**Optimize layer order**:
```dockerfile
# ✅ Good: Dependencies cached separately
COPY package*.json ./
RUN npm install
COPY . .

# ❌ Bad: Dependencies reinstalled on every code change
COPY . .
RUN npm install
```

#### 3. .dockerignore

Create `.dockerignore` to exclude unnecessary files:
```
node_modules/
.git/
.gitignore
*.md
*.log
.env*
dist/
coverage/
.vscode/
.idea/
*.test.ts
*.spec.ts
```

**Impact**: 30-50% faster builds, smaller context

#### 4. Cleanup in Same Layer

```dockerfile
# ✅ Good: Cleanup in same RUN command
RUN apt-get update && \
    apt-get install -y curl && \
    curl -O https://example.com/file && \
    apt-get remove -y curl && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# ❌ Bad: Separate layers preserve deleted files
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get remove -y curl  # Previous layers still contain curl
```

### Image Size Report

**Generate size report**:
```powershell
# PowerShell script: Get-ImageSizes.ps1
$images = docker images --format "{{.Repository}}:{{.Tag}}" | Where-Object { $_ -match "nyra" }

$report = $images | ForEach-Object {
    $size = docker images $_ --format "{{.Size}}"
    [PSCustomObject]@{
        Image = $_
        Size = $size
    }
} | Sort-Object Size -Descending

$report | Format-Table -AutoSize
$report | Export-Csv -Path "image-sizes-$(Get-Date -Format 'yyyyMMdd').csv" -NoTypeInformation
```

---

## Update & Maintenance Schedule

### Update Frequency Matrix

| Component | Dev | Staging | Production | Rationale |
|-----------|-----|---------|------------|-----------|
| **Databases** | Weekly | Bi-weekly | Monthly | Stability critical |
| **LLM Stack** | Daily | Weekly | Bi-weekly | Rapid feature development |
| **Monitoring** | Weekly | Monthly | Quarterly | Mature, stable tools |
| **MCP Servers** | On commit | Daily | Weekly | Active development |
| **Orchestration** | Bi-weekly | Monthly | Quarterly | Complex dependencies |
| **Dev Tools** | As needed | - | - | Non-production only |
| **Custom Services** | On commit | Daily | Weekly | Project-specific code |

### Automated Update Process

**GitHub Actions Workflow**:
```yaml
# .github/workflows/update-images.yml
name: Update Docker Images

on:
  schedule:
    - cron: '0 3 * * 1'  # Weekly on Monday at 3 AM
  workflow_dispatch:

jobs:
  update-dev:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Pull latest images (dev environment)
        run: |
          docker compose -f infra/docker/docker-compose.dev.yml pull

      - name: Run vulnerability scan
        run: |
          trivy image --severity HIGH,CRITICAL $(docker images --format "{{.Repository}}:{{.Tag}}")

      - name: Update compose files with new digests
        run: |
          # Script to update image references with @sha256 digests
          ./scripts/update-image-digests.sh

      - name: Create PR with updates
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: "chore: Update Docker images (automated)"
          title: "🐳 Update Docker images - $(date +'%Y-%m-%d')"
          body: |
            Automated Docker image updates:
            - Pulled latest versions
            - Scanned for vulnerabilities
            - Updated compose files with new digests

            **Testing Required**:
            - [ ] Deploy to dev environment
            - [ ] Run integration tests
            - [ ] Verify all services healthy
          branch: automated/update-docker-images
```

### Manual Update Process

**Step-by-Step**:

```powershell
# 1. Check current versions
docker compose -f infra/docker/docker-compose.dev.yml config --images

# 2. Pull latest images
docker compose -f infra/docker/docker-compose.dev.yml pull

# 3. View changes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | Sort-Object

# 4. Backup current state
docker compose -f infra/docker/docker-compose.dev.yml config > docker-compose-backup-$(Get-Date -Format 'yyyyMMdd').yml

# 5. Stop services
docker compose -f infra/docker/docker-compose.dev.yml down

# 6. Start with new images
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 7. Monitor health
docker compose -f infra/docker/docker-compose.dev.yml ps
docker compose -f infra/docker/docker-compose.dev.yml logs -f

# 8. Run smoke tests
./scripts/smoke-test.sh

# 9. If issues, rollback
docker compose -f docker-compose-backup-$(Get-Date -Format 'yyyyMMdd').yml up -d
```

### Rollback Procedure

**Quick Rollback**:
```powershell
# Method 1: Revert to previous image version
docker compose -f infra/docker/docker-compose.dev.yml down
# Edit compose file to use previous version
docker compose -f infra/docker/docker-compose.dev.yml up -d

# Method 2: Use tagged backup
docker compose -f docker-compose-backup-20260113.yml up -d

# Method 3: Git revert
git revert HEAD
docker compose -f infra/docker/docker-compose.dev.yml up -d
```

---

## CI/CD Integration

### Build Pipeline

**GitHub Actions workflow for custom images**:

```yaml
# .github/workflows/build-images.yml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main
      - develop
    paths:
      - 'services/**'
      - 'infra/**'
      - 'apps/**'
      - '.github/workflows/build-images.yml'
  pull_request:
    branches:
      - main
      - develop

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: project-nyra

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.filter.outputs.changes }}
    steps:
      - uses: actions/checkout@v4

      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            nexus-router:
              - 'services/nexus-router/**'
            quote-engine:
              - 'services/quote-engine/**'
            campaign-engine:
              - 'services/campaign-engine/**'
            mcp-archon-os:
              - 'bootstrap/mcp-servers/archon-os/**'
            # Add all other services...

  build-and-push:
    needs: detect-changes
    runs-on: ubuntu-latest
    if: ${{ needs.detect-changes.outputs.services != '[]' }}
    strategy:
      matrix:
        service: ${{ fromJSON(needs.detect-changes.outputs.services) }}

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./${{ matrix.service }}
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/${{ matrix.service }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-${{ matrix.service }}.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-${{ matrix.service }}.sarif'
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Environment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - dev
          - staging
          - production
      service:
        description: 'Service to deploy (or "all")'
        required: true
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}

      - name: Deploy via SSH
        run: |
          ssh ${{ secrets.DEPLOY_USER }}@${{ secrets.DEPLOY_HOST }} << 'ENDSSH'
            cd /opt/project-nyra
            git pull origin main

            if [ "${{ inputs.service }}" == "all" ]; then
              docker compose -f infra/docker/docker-compose.${{ inputs.environment }}.yml pull
              docker compose -f infra/docker/docker-compose.${{ inputs.environment }}.yml up -d
            else
              docker compose -f infra/docker/docker-compose.${{ inputs.environment }}.yml pull ${{ inputs.service }}
              docker compose -f infra/docker/docker-compose.${{ inputs.environment }}.yml up -d ${{ inputs.service }}
            fi

            # Health check
            sleep 10
            docker compose -f infra/docker/docker-compose.${{ inputs.environment }}.yml ps
          ENDSSH

      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to ${{ inputs.environment }}:
            Service: ${{ inputs.service }}
            Status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

---

## Disaster Recovery

### Backup Strategy

#### 1. Image Registry Backup

**Primary Registry**: GitHub Container Registry (ghcr.io)
**Backup Registry**: Docker Hub (docker.io/projectnyra)

**Mirror Script**:
```powershell
# scripts/mirror-images.ps1
$images = @(
    "nyra/nexus-router:latest",
    "nyra/quote-engine:latest",
    "nyra/campaign-engine:latest"
    # Add all critical images
)

foreach ($image in $images) {
    Write-Host "🔄 Mirroring $image" -ForegroundColor Cyan

    # Pull from primary
    docker pull "ghcr.io/$image"

    # Tag for backup registry
    docker tag "ghcr.io/$image" "docker.io/projectnyra/$image"

    # Push to backup
    docker push "docker.io/projectnyra/$image"

    Write-Host "✅ Mirrored $image" -ForegroundColor Green
}
```

**Automated Mirroring**:
```yaml
# .github/workflows/mirror-images.yml
name: Mirror Images to Backup Registry

on:
  workflow_dispatch:
  schedule:
    - cron: '0 4 * * 0'  # Weekly on Sunday at 4 AM

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Log in to primary registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Log in to backup registry
        uses: docker/login-action@v3
        with:
          registry: docker.io
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Mirror images
        run: |
          ./scripts/mirror-images.sh
```

#### 2. Compose File Versioning

**Git-based Versioning**:
```bash
# All compose files are version-controlled in Git
git log --oneline -- infra/docker/docker-compose*.yml

# Tag stable releases
git tag -a docker-stack-v1.0.0 -m "Stable Docker stack release"
git push origin docker-stack-v1.0.0
```

#### 3. Volume Backups

**Critical Volume Backup**:
```powershell
# Backup PostgreSQL data
docker run --rm \
  -v nyra-postgres-data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar czf /backup/postgres-data-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz /data

# Backup Grafana dashboards
docker run --rm \
  -v nyra-grafana-data:/data \
  -v ${PWD}/backups:/backup \
  alpine tar czf /backup/grafana-data-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz /data

# Backup all volumes
docker volume ls -q | Where-Object { $_ -match "nyra" } | ForEach-Object {
    docker run --rm \
      -v "${_}:/data" \
      -v "${PWD}/backups:/backup" \
      alpine tar czf "/backup/$_-$(Get-Date -Format 'yyyyMMdd-HHmmss').tar.gz" /data
}
```

### Recovery Procedures

#### Scenario 1: Single Image Failure

**Symptom**: One service fails to start or crashes repeatedly

**Recovery**:
```powershell
# 1. Check service status
docker compose -f infra/docker/docker-compose.dev.yml ps

# 2. View logs
docker compose -f infra/docker/docker-compose.dev.yml logs <service-name>

# 3. Attempt restart
docker compose -f infra/docker/docker-compose.dev.yml restart <service-name>

# 4. If fails, rollback to previous image version
# Edit docker-compose.yml to use previous tag
docker compose -f infra/docker/docker-compose.dev.yml up -d <service-name>

# 5. If still fails, pull from backup registry
docker pull docker.io/projectnyra/<service-name>:latest
docker tag docker.io/projectnyra/<service-name>:latest ghcr.io/nyra/<service-name>:latest
docker compose -f infra/docker/docker-compose.dev.yml up -d <service-name>
```

#### Scenario 2: Registry Outage

**Symptom**: Cannot pull images from primary registry (ghcr.io)

**Recovery**:
```powershell
# 1. Update compose files to use backup registry
# Find and replace: ghcr.io/nyra → docker.io/projectnyra
(Get-Content infra/docker/docker-compose.dev.yml) -replace 'ghcr.io/nyra', 'docker.io/projectnyra' | Set-Content infra/docker/docker-compose.dev.yml

# 2. Pull from backup registry
docker compose -f infra/docker/docker-compose.dev.yml pull

# 3. Start services
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 4. Once primary registry recovers, revert changes
git checkout infra/docker/docker-compose.dev.yml
```

#### Scenario 3: Complete Stack Failure

**Symptom**: All services down, system needs full recovery

**Recovery**:
```powershell
# 1. Stop all containers
docker compose -f infra/docker/docker-compose.dev.yml down

# 2. Restore volumes from backup (if needed)
foreach ($backup in Get-ChildItem -Path backups/*.tar.gz) {
    $volumeName = $backup.Name -replace '-\d{8}-\d{6}\.tar\.gz$', ''
    Write-Host "Restoring $volumeName from $($backup.Name)"

    docker run --rm \
      -v "${volumeName}:/data" \
      -v "${PWD}/backups:/backup" \
      alpine sh -c "rm -rf /data/* && tar xzf /backup/$($backup.Name) -C /"
}

# 3. Pull all images
docker compose -f infra/docker/docker-compose.dev.yml pull

# 4. Start services
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 5. Monitor health
docker compose -f infra/docker/docker-compose.dev.yml ps
docker compose -f infra/docker/docker-compose.dev.yml logs -f

# 6. Verify critical services
curl http://localhost:5432  # PostgreSQL
curl http://localhost:6379  # Redis
curl http://localhost:3333  # Open-WebUI
```

#### Scenario 4: Data Corruption

**Symptom**: Service starts but data is corrupted or inconsistent

**Recovery**:
```powershell
# PostgreSQL recovery example
# 1. Stop dependent services
docker compose -f infra/docker/docker-compose.dev.yml stop dify-api n8n twenty

# 2. Stop PostgreSQL
docker compose -f infra/docker/docker-compose.dev.yml stop postgres

# 3. Restore volume from last known good backup
$latestBackup = Get-ChildItem -Path backups/nyra-postgres-data-*.tar.gz | Sort-Object LastWriteTime -Descending | Select-Object -First 1

docker run --rm \
  -v nyra-postgres-data:/data \
  -v ${PWD}/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/$($latestBackup.Name) -C /"

# 4. Start PostgreSQL
docker compose -f infra/docker/docker-compose.dev.yml up -d postgres

# 5. Wait for healthy status
Start-Sleep -Seconds 30

# 6. Verify database integrity
docker exec nyra-postgres psql -U postgres -c "SELECT datname FROM pg_database;"

# 7. Start dependent services
docker compose -f infra/docker/docker-compose.dev.yml up -d dify-api n8n twenty
```

---

## Troubleshooting Guide

### Common Issues

#### Issue 1: Image Pull Failures

**Symptoms**:
- `Error response from daemon: manifest for image not found`
- `Pull rate limit exceeded`

**Diagnosis**:
```powershell
# Check Docker Hub rate limits
curl -s "https://auth.docker.io/token?service=registry.docker.io&scope=repository:ratelimitpreview/test:pull" | ConvertFrom-Json | Select-Object -ExpandProperty token | ForEach-Object {
    $headers = @{ Authorization = "Bearer $_" }
    curl -s -H @headers "https://registry-1.docker.io/v2/ratelimitpreview/test/manifests/latest" -I
}

# Check if image exists
docker manifest inspect ghcr.io/nyra/nexus-router:latest
```

**Solutions**:
```powershell
# Solution 1: Authenticate to registry
docker login ghcr.io -u USERNAME -p TOKEN

# Solution 2: Use backup registry
docker pull docker.io/projectnyra/nexus-router:latest
docker tag docker.io/projectnyra/nexus-router:latest ghcr.io/nyra/nexus-router:latest

# Solution 3: Use cached images
docker images | Select-String "nexus-router"
# Update compose file to use cached tag
```

#### Issue 2: Out of Disk Space

**Symptoms**:
- `no space left on device`
- Build failures
- Cannot pull images

**Diagnosis**:
```powershell
# Check disk usage
docker system df

# Detailed breakdown
docker system df -v

# Check image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Sort-Object

# Check container sizes
docker ps -s
```

**Solutions**:
```powershell
# Solution 1: Remove unused images
docker image prune -a --filter "until=720h"  # Remove images older than 30 days

# Solution 2: Remove unused volumes
docker volume prune -f

# Solution 3: Remove build cache
docker builder prune -a -f

# Solution 4: Complete cleanup (CAUTION!)
docker system prune -a --volumes -f

# Solution 5: Increase Docker disk allocation (Docker Desktop)
# Settings → Resources → Disk image size
```

#### Issue 3: Build Failures

**Symptoms**:
- Build hangs at specific step
- Context size too large
- Dependencies fail to install

**Diagnosis**:
```powershell
# Check build context size
docker compose -f docker-compose.yml build --no-cache --progress=plain <service>

# View .dockerignore
Get-Content .dockerignore
```

**Solutions**:
```powershell
# Solution 1: Optimize .dockerignore
@"
node_modules/
.git/
*.log
.env*
dist/
coverage/
"@ | Out-File -FilePath .dockerignore -Encoding utf8

# Solution 2: Use BuildKit
$env:DOCKER_BUILDKIT=1
docker compose -f docker-compose.yml build

# Solution 3: Increase build memory
docker compose -f docker-compose.yml build --memory=8g

# Solution 4: Clear build cache
docker builder prune -a -f
```

#### Issue 4: Health Check Failures

**Symptoms**:
- Container shows as "unhealthy"
- Service restarts repeatedly

**Diagnosis**:
```powershell
# Check health status
docker inspect nyra-postgres --format='{{.State.Health.Status}}'

# View health check logs
docker inspect nyra-postgres --format='{{range .State.Health.Log}}{{.Output}}{{end}}'

# View container logs
docker logs nyra-postgres --tail 100
```

**Solutions**:
```powershell
# Solution 1: Increase health check timeout
# In docker-compose.yml:
healthcheck:
  interval: 30s
  timeout: 10s  # Increase from 5s
  retries: 5    # Increase from 3
  start_period: 60s  # Add startup grace period

# Solution 2: Fix health check command
# PostgreSQL example
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-postgres}"]

# Solution 3: Disable health check temporarily (debugging only)
# In docker-compose.yml:
# healthcheck:
#   disable: true
```

#### Issue 5: Network Connectivity Issues

**Symptoms**:
- Services cannot reach each other
- DNS resolution fails

**Diagnosis**:
```powershell
# Check network configuration
docker network inspect nyra-network

# Test connectivity between containers
docker exec nyra-postgres ping -c 3 nyra-redis
docker exec nyra-open-webui curl -v http://nexus-router:8000/health

# Check DNS resolution
docker exec nyra-open-webui nslookup postgres
```

**Solutions**:
```powershell
# Solution 1: Recreate network
docker compose -f docker-compose.yml down
docker network rm nyra-network
docker network create nyra-network --subnet=172.28.0.0/16
docker compose -f docker-compose.yml up -d

# Solution 2: Use explicit IPs (not recommended)
# In docker-compose.yml:
services:
  postgres:
    networks:
      nyra-network:
        ipv4_address: 172.28.0.10

# Solution 3: Check firewall rules
netsh advfirewall show allprofiles

# Solution 4: Verify Docker network driver
docker info | Select-String "Network:"
```

#### Issue 6: Image Tag Conflicts

**Symptoms**:
- Wrong image version running
- Changes not reflected in container

**Diagnosis**:
```powershell
# Check running container image
docker inspect nyra-nexus-router --format='{{.Config.Image}}'

# Check image digest
docker inspect ghcr.io/nyra/nexus-router:latest --format='{{.RepoDigests}}'

# Compare with remote registry
docker manifest inspect ghcr.io/nyra/nexus-router:latest
```

**Solutions**:
```powershell
# Solution 1: Force pull latest
docker compose -f docker-compose.yml pull nexus-router
docker compose -f docker-compose.yml up -d nexus-router

# Solution 2: Use digest instead of tag
# In docker-compose.yml:
image: ghcr.io/nyra/nexus-router@sha256:abc123...

# Solution 3: Clear local cache
docker rmi ghcr.io/nyra/nexus-router:latest -f
docker compose -f docker-compose.yml pull nexus-router

# Solution 4: Rebuild custom image
docker compose -f docker-compose.yml build --no-cache nexus-router
```

---

## Appendix

### A. Complete Image List

#### External Images (62)

1. `activepieces/activepieces:latest`
2. `ankane/pgvector:latest`
3. `consul:1.17.0`
4. `dpage/pgadmin4:latest`
5. `falkordb/falkordb:latest`
6. `gcr.io/cadvisor/cadvisor:latest`
7. `gcr.io/cadvisor/cadvisor:v0.47.2`
8. `ghcr.io/berriai/litellm:latest`
9. `ghcr.io/berriai/litellm:main-latest`
10. `ghcr.io/open-webui/open-webui:main`
11. `gitea/act_runner:latest`
12. `gitea/gitea:latest`
13. `grafana/grafana:10.2.3`
14. `grafana/grafana:latest`
15. `grafana/loki:2.9.3`
16. `grafana/loki:latest`
17. `grafana/promtail:2.9.3`
18. `grafana/promtail:latest`
19. `grafana/tempo:2.3.1`
20. `grafbase/nexus:latest`
21. `jaegertracing/jaeger-query:1.52.0`
22. `langgenius/dify-api:latest`
23. `langgenius/dify-sandbox:latest`
24. `langgenius/dify-web:latest`
25. `letta/letta:latest`
26. `lobehub/lobe-chat:latest`
27. `mailhog/mailhog:latest`
28. `minio/minio:latest`
29. `n8nio/n8n:latest`
30. `neo4j:5-community`
31. `nginx:alpine`
32. `node:20-alpine`
33. `nvcr.io/nvidia/k8s/dcgm-exporter:3.1.8-3.1.5-ubuntu22.04`
34. `oliver006/redis_exporter:v1.55.0`
35. `pgvector/pgvector:pg16`
36. `portainer/portainer-ce:latest`
37. `postgres:15`
38. `postgres:15-alpine`
39. `postgres:16-alpine`
40. `prom/alertmanager:latest`
41. `prom/alertmanager:v0.26.0`
42. `prom/blackbox-exporter:v0.24.0`
43. `prom/node-exporter:latest`
44. `prom/node-exporter:v1.7.0`
45. `prom/prometheus:latest`
46. `prom/prometheus:v2.48.0`
47. `prom/pushgateway:v1.6.2`
48. `prometheuscommunity/postgres-exporter:v0.15.0`
49. `qdrant/qdrant:latest`
50. `redis:7-alpine`
51. `redis:alpine`
52. `rediscommander/redis-commander:latest`
53. `twentycrm/twenty:latest`
54. `zepai/knowledge-graph-mcp:standalone`

#### Custom Built Images (22)

1. Nexus Router (`nyra/nexus-router`)
2. Archon OS (`nyra/archon-os`)
3. Claude Flow Orchestrator (`nyra/archon-os`)
4. Quote Engine (`nyra/quote-engine`)
5. Campaign Engine (`nyra/campaign-engine`)
6. Quote API (`nyra/quote-api`)
7. MCP Gemini Assistant
8. MCP Claude Flow
9. MCP RuV Swarm
10. MCP letta
11. MCP Filesystem
12. MCP GitHub
13. MCP Mem0
14. MCP Nexus
15. MCP Docker
16. Archon OS Coordinator
17. Claude Flow Orchestrator
18. RateHunter Frontend
19. Admin Dashboard
20. Integration Test Runner
21. E2E Test Runner
22. Development Environment

### B. Useful Commands Reference

```powershell
# IMAGE MANAGEMENT
docker images                                      # List all images
docker pull <image>                               # Pull image
docker rmi <image>                                # Remove image
docker image prune -a                             # Remove unused images
docker history <image>                            # Show image layers
docker inspect <image>                            # Detailed image info

# BUILD COMMANDS
docker build -t <image> .                         # Build image
docker build --no-cache -t <image> .              # Build without cache
docker buildx build --platform linux/amd64 .      # Multi-platform build
docker compose build                              # Build all services
docker compose build --no-cache <service>         # Build specific service

# REGISTRY OPERATIONS
docker login ghcr.io                              # Login to registry
docker push ghcr.io/nyra/image:tag               # Push image
docker pull ghcr.io/nyra/image:tag               # Pull image
docker tag local:tag registry:tag                 # Tag for registry

# SCANNING & SECURITY
trivy image <image>                               # Scan image
docker scout cves <image>                         # Scout scan
snyk container test <image>                       # Snyk scan

# CLEANUP
docker system df                                  # Check disk usage
docker system prune -a                            # Remove everything unused
docker builder prune                              # Remove build cache
docker volume prune                               # Remove unused volumes

# COMPOSE OPERATIONS
docker compose pull                               # Pull all images
docker compose up -d                              # Start services
docker compose down                               # Stop services
docker compose ps                                 # List services
docker compose logs -f <service>                  # Follow logs
docker compose restart <service>                  # Restart service
```

### C. Environment Variables Reference

**Critical Environment Variables** for custom images:

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | `sk-ant-***` | Anthropic API key |
| `OPENROUTER_API_KEY` | Yes | `sk-or-***` | OpenRouter API key |
| `POSTGRES_USER` | Yes | `nyra` | PostgreSQL username |
| `POSTGRES_PASSWORD` | Yes | `secure_pass` | PostgreSQL password |
| `POSTGRES_DB` | Yes | `nyra_db` | PostgreSQL database |
| `DATABASE_URL` | Yes | `postgresql://...` | Full database connection string |
| `REDIS_PASSWORD` | Yes | `redis_pass` | Redis password |
| `NEXUS_ROUTER_PORT` | No | `8000` | Nexus Router port |
| `OPEN_WEBUI_PORT` | No | `3333` | Open-WebUI port |
| `GRAFANA_ADMIN_PASSWORD` | Yes | `admin_pass` | Grafana password |

### D. Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| PostgreSQL | pg_isready | `accepting connections` |
| Redis | `redis-cli ping` | `PONG` |
| Nexus Router | `GET /health` | `{"status": "ok"}` |
| Open-WebUI | `GET /health` | `200 OK` |
| Prometheus | `GET /-/healthy` | `200 OK` |
| Grafana | `GET /api/health` | `{"status": "ok"}` |
| n8n | `GET /healthz` | `200 OK` |
| Dify API | `GET /health` | `200 OK` |

### E. Support & Resources

**Official Documentation**:
- Docker: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose/
- Docker Hub: https://hub.docker.com
- GitHub Container Registry: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

**Project Nyra Resources**:
- Main Documentation: `docs/README.md`
- Infrastructure Guide: `infra/README.md`
- Open-WebUI Deployment: `OPEN-WEBUI-DEPLOYMENT-PLAN.md`
- LobeChat Deployment: `LOBECHAT-DEPLOYMENT.md`
- Mem0 MCP Deployment: `MEM0-MCP-DEPLOYMENT-PLAN.md`

**Troubleshooting**:
- Docker logs: `docker logs <container>`
- System logs: `docker system events`
- Compose logs: `docker compose logs -f`
- Health checks: `docker inspect --format='{{.State.Health}}' <container>`

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-13 | Initial comprehensive Docker image inventory created |

---

**Document Status**: ✅ Complete and Ready for Use
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Infrastructure Team
**Related Documents**: OPEN-WEBUI-DEPLOYMENT-PLAN.md, LOBECHAT-DEPLOYMENT.md, MEM0-MCP-DEPLOYMENT-PLAN.md, 4PC-DEPLOYMENT-GUIDE.md
