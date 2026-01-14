# Project Nyra Containerization Guide

**Production-Grade Docker Deployment for 4-PC Cluster**

This guide provides comprehensive containerization strategies, Docker Compose optimization, multi-host networking, and production best practices for deploying Project Nyra's 22-service distributed mortgage automation platform.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Docker Compose Strategy](#docker-compose-strategy)
3. [Multi-Host Networking](#multi-host-networking)
4. [Container Optimization](#container-optimization)
5. [GPU Container Configuration](#gpu-container-configuration)
6. [Health Checks & Monitoring](#health-checks--monitoring)
7. [Secrets Management](#secrets-management)
8. [Backup & Disaster Recovery](#backup--disaster-recovery)
9. [Performance Tuning](#performance-tuning)
10. [Production Deployment Checklist](#production-deployment-checklist)

---

## 🏗️ Architecture Overview

### Service Distribution Across 4 PCs

```
┌─────────────────────────────────────────────────────────────────┐
│  PC1: Orchestrator Mini (Mac Mini M2, 16GB RAM, No GPU)        │
│  IP: 10.0.0.1                                                   │
│  Role: Coordination & LLM Gateway                               │
├─────────────────────────────────────────────────────────────────┤
│  Services (8):                                                   │
│  • nexus-router (6000)      - Multi-provider LLM gateway        │
│  • letta (8283)             - Conversation memory               │
│  • mem0 (4321)              - Universal memory layer            │
│  • claude-flow (3010)       - Multi-agent orchestration         │
│  • agentdb (8080)           - Vector database (HNSW)            │
│  • ruvector (8081)          - Neural substrate                  │
│  • redis (6379)             - Cache & message queue             │
│  • qdrant (6333)            - Vector search engine              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PC2: Worker 2 (Alienware M15R7, RTX 3060 12GB, 32GB RAM)      │
│  IP: 10.0.0.2                                                   │
│  Role: CRM & Workflow Automation                                │
├─────────────────────────────────────────────────────────────────┤
│  Services (5):                                                   │
│  • twentycrm (3000)         - Lead & loan management            │
│  • postgres-twenty (5432)   - TwentyCRM database                │
│  • n8n (5678)               - Campaign automation               │
│  • dify (3001)              - Borrower chat interface           │
│  • postgres-dify (5433)     - Dify database                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PC3: Worker 3 (Alienware Area-51, RTX 5090 32GB, 64GB RAM)    │
│  IP: 10.0.0.3                                                   │
│  Role: LLM Inference & Graph Databases                          │
├─────────────────────────────────────────────────────────────────┤
│  Services (3):                                                   │
│  • ollama (11434)           - Local LLM inference               │
│  • neo4j (7474)             - Graph database                    │
│  • falkordb (6380)          - Knowledge graph                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PC4: Worker 4 (Desktop PC, RTX 3090 Ti 24GB, 32GB RAM)        │
│  IP: 10.0.0.4                                                   │
│  Role: Observability & Monitoring                               │
├─────────────────────────────────────────────────────────────────┤
│  Services (4):                                                   │
│  • prometheus (9090)        - Metrics collection                │
│  • grafana (3005)           - Visualization dashboards          │
│  • loki (3100)              - Log aggregation                   │
│  • alertmanager (9093)      - Alert routing                     │
└─────────────────────────────────────────────────────────────────┘
```

### Network Architecture

**Physical Network**:
- All 4 PCs connected via 1Gbps Ethernet switch
- Static IP assignment (10.0.0.1-4)
- Gateway: 10.0.0.1 (PC1 acts as gateway if needed)
- DNS: 8.8.8.8, 1.1.1.1 (Google + Cloudflare)

**Docker Network**:
- Network Name: `nyra-net`
- Subnet: `172.20.0.0/16`
- Driver: `bridge` (single host) or `overlay` (swarm mode)
- Inter-container communication: Enabled

**Tailscale VPN Mesh** (Optional):
- Provides secure WAN access
- Each PC gets `100.64.0.x` address
- Zero-trust authentication
- Encrypted peer-to-peer tunnels

---

## 🐳 Docker Compose Strategy

### Strategy 1: Single-File Profiles (Recommended)

**Pros**:
- Single source of truth for all services
- Easy to understand service relationships
- Simpler version control
- Profile-based deployment prevents conflicts

**Cons**:
- Large file (can be mitigated with YAML anchors)
- Must specify profile on every command

**Implementation**:
```yaml
# docker-compose.yml (unified, all 4 PCs)
version: '3.9'

services:
  # ========================================
  # PC1 Orchestrator Services (no profile)
  # ========================================
  nexus-router:
    image: ghcr.io/ruv-inc/nexus-router:latest
    container_name: nexus-router
    restart: unless-stopped
    ports:
      - "6000:6000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      - DEFAULT_PROVIDER=anthropic
      - FALLBACK_PROVIDERS=openrouter,google
    networks:
      - nyra-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # ========================================
  # PC2 Worker-2 Services (profile: worker-2)
  # ========================================
  twentycrm:
    image: twentycrm/twenty:latest
    container_name: twentycrm
    restart: unless-stopped
    profiles: [worker-2]
    ports:
      - "3000:3000"
    environment:
      - PG_HOST=postgres-twenty
      - PG_DATABASE=twentycrm
      - PG_USERNAME=${TWENTY_DB_USER}
      - PG_PASSWORD=${TWENTY_DB_PASSWORD}
    depends_on:
      postgres-twenty:
        condition: service_healthy
    networks:
      - nyra-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ========================================
  # PC3 Worker-3 Services (profile: worker-3)
  # ========================================
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    profiles: [worker-3]
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - nyra-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:11434"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ========================================
  # PC4 Worker-4 Services (profile: worker-4)
  # ========================================
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    profiles: [worker-4]
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
    networks:
      - nyra-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  nyra-net:
    name: nyra-net
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  ollama-data:
  prometheus-data:
  # ... other volumes
```

**Deployment Commands**:
```bash
# PC1 - Orchestrator (no profile = default services)
docker compose up -d

# PC2 - Worker 2
docker compose --profile worker-2 up -d

# PC3 - Worker 3
docker compose --profile worker-3 up -d

# PC4 - Worker 4
docker compose --profile worker-4 up -d
```

### Strategy 2: Multiple Files (Alternative)

**Pros**:
- Cleaner separation per PC
- Smaller files, easier to read
- Can use different files on different PCs

**Cons**:
- More files to maintain
- Service relationships less obvious
- Version control more complex

**Implementation**:
```bash
# File structure
infra/
├── docker-compose.orchestrator.yml   # PC1 services
├── docker-compose.worker-2.yml       # PC2 services
├── docker-compose.worker-3.yml       # PC3 services
├── docker-compose.worker-4.yml       # PC4 services
└── docker-compose.shared.yml         # Shared config (networks, volumes)
```

**Deployment Commands**:
```bash
# PC1 - Orchestrator
docker compose -f docker-compose.shared.yml -f docker-compose.orchestrator.yml up -d

# PC2 - Worker 2
docker compose -f docker-compose.shared.yml -f docker-compose.worker-2.yml up -d

# PC3 - Worker 3
docker compose -f docker-compose.shared.yml -f docker-compose.worker-3.yml up -d

# PC4 - Worker 4
docker compose -f docker-compose.shared.yml -f docker-compose.worker-4.yml up -d
```

### YAML Anchors & Extensions (DRY Principle)

**Use YAML Anchors to Reduce Duplication**:
```yaml
version: '3.9'

# Define reusable configurations
x-common-restart: &common-restart
  restart: unless-stopped

x-common-logging: &common-logging
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"

x-common-healthcheck: &common-healthcheck
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s

x-postgres-common: &postgres-common
  image: postgres:15-alpine
  restart: unless-stopped
  logging: *common-logging
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U ${PG_USER}"]
    <<: *common-healthcheck

services:
  postgres-twenty:
    <<: *postgres-common
    container_name: postgres-twenty
    environment:
      - POSTGRES_USER=${TWENTY_DB_USER}
      - POSTGRES_PASSWORD=${TWENTY_DB_PASSWORD}
      - POSTGRES_DB=twentycrm
    volumes:
      - postgres-twenty-data:/var/lib/postgresql/data

  postgres-n8n:
    <<: *postgres-common
    container_name: postgres-n8n
    environment:
      - POSTGRES_USER=${N8N_DB_USER}
      - POSTGRES_PASSWORD=${N8N_DB_PASSWORD}
      - POSTGRES_DB=n8n
    volumes:
      - postgres-n8n-data:/var/lib/postgresql/data
```

---

## 🌐 Multi-Host Networking

### Option 1: Docker Overlay Networks (Swarm Mode)

**Best for**: Automatic service discovery, load balancing, encryption

**Setup**:
```bash
# Initialize Docker Swarm on PC1 (manager)
docker swarm init --advertise-addr 10.0.0.1

# Join workers (PC2, PC3, PC4)
docker swarm join --token <SWARM_TOKEN> 10.0.0.1:2377

# Create overlay network
docker network create --driver overlay --attachable nyra-overlay-net

# Deploy stack
docker stack deploy -c docker-compose.yml nyra
```

**Pros**:
- Automatic service discovery (use service name as hostname)
- Built-in load balancing
- Encrypted overlay network
- Health-aware routing

**Cons**:
- More complex setup
- Swarm mode required
- Slightly higher latency (overlay encapsulation)

### Option 2: Static IPs + Host Networking

**Best for**: Maximum performance, simple setup

**Setup**:
```yaml
# docker-compose.yml (on each PC)
services:
  nexus-router:
    image: ghcr.io/ruv-inc/nexus-router:latest
    network_mode: host  # Use host network directly
    environment:
      - BIND_ADDRESS=10.0.0.1
      - PORT=6000
```

**Connect Services Across Hosts**:
```yaml
# On PC2, connect to Nexus on PC1
services:
  twentycrm:
    environment:
      - NEXUS_URL=http://10.0.0.1:6000
      - CLAUDE_FLOW_URL=http://10.0.0.1:3010
      - AGENTDB_URL=http://10.0.0.1:8080
```

**Pros**:
- Maximum performance (no NAT, no bridge)
- Simple configuration
- Direct host network access

**Cons**:
- Port conflicts possible
- No automatic service discovery
- Manual IP management

### Option 3: Tailscale Mesh Network

**Best for**: Secure WAN access, zero-trust networking

**Setup**:
```bash
# Install Tailscale on each PC
curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate with Tailscale account
tailscale up --authkey=${TAILSCALE_AUTH_KEY}

# Get Tailscale IP (100.64.0.x)
tailscale ip -4
```

**Docker Compose with Tailscale**:
```yaml
services:
  nexus-router:
    environment:
      # Advertise on both LAN and Tailscale IPs
      - ADVERTISE_ADDRESSES=10.0.0.1,100.64.0.1
```

**Pros**:
- Secure remote access
- Works across different networks/locations
- Zero-trust authentication
- Encrypted by default

**Cons**:
- Additional latency (encryption overhead)
- Requires Tailscale account
- Monthly cost for > 3 users ($5/user/month)

---

## ⚡ Container Optimization

### 1. Multi-Stage Builds (Reduce Image Size)

**Example: Node.js Application**:
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./
USER node
CMD ["node", "dist/main.js"]
```

**Benefits**:
- **Before**: 1.2 GB (includes build tools, dev dependencies)
- **After**: 180 MB (production dependencies only)
- **Reduction**: 85% smaller

### 2. Layer Caching Optimization

**Bad (Invalidates Cache Frequently)**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .                    # ❌ Copies everything, invalidates often
RUN npm install             # ❌ Reinstalls deps on every code change
CMD ["npm", "start"]
```

**Good (Leverages Cache)**:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./       # ✅ Copy deps manifest first
RUN npm ci --only=production  # ✅ Cached until deps change
COPY . .                    # ✅ Copy code last
CMD ["npm", "start"]
```

### 3. Alpine-Based Images

**Size Comparison**:
| Base Image | Size | Use Case |
|------------|------|----------|
| `node:20` | 1.1 GB | Development |
| `node:20-slim` | 250 MB | Production (if native deps needed) |
| `node:20-alpine` | 180 MB | Production (recommended) |

**Example**:
```dockerfile
FROM node:20-alpine  # ✅ 180 MB vs 1.1 GB
FROM python:3.11-alpine  # ✅ 50 MB vs 900 MB
FROM nginx:alpine  # ✅ 40 MB vs 150 MB
```

### 4. Resource Limits

**Prevent Resource Hogging**:
```yaml
services:
  twentycrm:
    deploy:
      resources:
        limits:
          cpus: '2.0'        # Max 2 CPU cores
          memory: 4G         # Max 4GB RAM
        reservations:
          cpus: '1.0'        # Guaranteed 1 core
          memory: 2G         # Guaranteed 2GB
```

**Benefits**:
- Prevents one service from monopolizing resources
- Ensures fair resource distribution
- Triggers OOMKilled on memory leaks (better than freezing)

### 5. Read-Only Root Filesystem

**Security Hardening**:
```yaml
services:
  nexus-router:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**Benefits**:
- Prevents malware from modifying container filesystem
- Immutable infrastructure
- Forces proper volume management

---

## 🎮 GPU Container Configuration

### NVIDIA Container Toolkit Setup

**Install NVIDIA Drivers (PC2, PC3, PC4)**:
```bash
# Ubuntu/Debian
sudo apt install nvidia-driver-535 nvidia-utils-535

# Verify installation
nvidia-smi
```

**Install NVIDIA Container Toolkit**:
```bash
# Add NVIDIA Docker repository
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

# Install toolkit
sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Restart Docker
sudo systemctl restart docker
```

**Test GPU Access**:
```bash
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

### Ollama GPU Configuration

**Docker Compose**:
```yaml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all            # Use all GPUs
              capabilities: [gpu]   # Enable GPU compute
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
      # Ollama-specific settings
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_MODELS=/root/.ollama/models
      - OLLAMA_MAX_LOADED_MODELS=2  # PC3 can handle 2 models in VRAM
      - OLLAMA_NUM_PARALLEL=4       # Parallel requests
```

**Pull Models Post-Deployment**:
```bash
# SSH into PC3
ssh user@10.0.0.3

# Pull models
docker exec ollama ollama pull llama3.1:latest
docker exec ollama ollama pull mistral:latest
docker exec ollama ollama pull codellama:latest

# Verify
docker exec ollama ollama list
```

### Multi-GPU Selection

**Select Specific GPU**:
```yaml
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']  # Use GPU 0 only
              capabilities: [gpu]
```

**Split Workload Across GPUs**:
```yaml
services:
  ollama-inference:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['0']  # RTX 5090 for inference
              capabilities: [gpu]

  ollama-embedding:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              device_ids: ['1']  # RTX 3060 for embeddings
              capabilities: [gpu]
```

---

## 🏥 Health Checks & Monitoring

### Health Check Best Practices

**1. Startup Time**:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s          # Check every 30 seconds
  timeout: 10s           # Fail if no response in 10s
  retries: 3             # Retry 3 times before marking unhealthy
  start_period: 60s      # Grace period for slow startup
```

**2. Deep Health Checks**:
```yaml
healthcheck:
  test: |
    curl -f http://localhost:3000/health || exit 1
    curl -f http://localhost:3000/api/ready || exit 1
```

**3. Database Dependency**:
```yaml
services:
  postgres-twenty:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${TWENTY_DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  twentycrm:
    depends_on:
      postgres-twenty:
        condition: service_healthy  # ✅ Wait for DB to be healthy
```

### Prometheus Metrics Scraping

**Service Instrumentation**:
```yaml
services:
  quote-engine:
    environment:
      - PROMETHEUS_ENABLED=true
      - PROMETHEUS_PORT=9100
    labels:
      - "prometheus.scrape=true"
      - "prometheus.port=9100"
      - "prometheus.path=/metrics"
```

**Prometheus Configuration**:
```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # Scrape PC1 services
  - job_name: 'orchestrator'
    static_configs:
      - targets:
        - '10.0.0.1:6000'  # nexus-router
        - '10.0.0.1:8283'  # letta
        - '10.0.0.1:4321'  # mem0
        - '10.0.0.1:3010'  # claude-flow
        - '10.0.0.1:8080'  # agentdb

  # Scrape PC2 services
  - job_name: 'worker-2'
    static_configs:
      - targets:
        - '10.0.0.2:3000'  # twentycrm
        - '10.0.0.2:5678'  # n8n
        - '10.0.0.2:3001'  # dify

  # Scrape PC3 services
  - job_name: 'worker-3'
    static_configs:
      - targets:
        - '10.0.0.3:11434'  # ollama
        - '10.0.0.3:7474'   # neo4j

  # Docker container metrics
  - job_name: 'docker'
    static_configs:
      - targets:
        - '10.0.0.1:9323'  # Docker daemon metrics (if enabled)
        - '10.0.0.2:9323'
        - '10.0.0.3:9323'
        - '10.0.0.4:9323'
```

### Grafana Dashboards

**Auto-Provisioned Dashboards**:
```yaml
# monitoring/grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'Project Nyra'
    orgId: 1
    folder: 'Nyra'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    options:
      path: /etc/grafana/dashboards
```

**Dashboard JSON** (example snippet):
```json
{
  "dashboard": {
    "title": "Project Nyra - System Overview",
    "panels": [
      {
        "title": "Service Health Status",
        "targets": [
          {
            "expr": "up{job=~\"orchestrator|worker-.*\"}",
            "legendFormat": "{{ instance }}"
          }
        ]
      },
      {
        "title": "Quote Generation Latency (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(quote_generation_duration_seconds_bucket[5m]))",
            "legendFormat": "p95"
          }
        ]
      },
      {
        "title": "LLM Token Usage",
        "targets": [
          {
            "expr": "sum(rate(llm_tokens_total[5m])) by (provider)",
            "legendFormat": "{{ provider }}"
          }
        ]
      }
    ]
  }
}
```

---

## 🔐 Secrets Management

### Option 1: Environment Files (.env)

**Security**: Low (files stored on disk, not encrypted)
**Best for**: Development, non-sensitive config

```bash
# .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
TWENTY_DB_PASSWORD=secure_password_here
N8N_DB_PASSWORD=another_secure_password
```

**Docker Compose**:
```yaml
services:
  nexus-router:
    env_file:
      - .env
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
```

### Option 2: Docker Secrets (Swarm Mode)

**Security**: High (encrypted at rest and in transit)
**Best for**: Production

```bash
# Create secrets
echo "sk-ant-xxxxx" | docker secret create anthropic_api_key -
echo "secure_password" | docker secret create twenty_db_password -

# Deploy with secrets
docker stack deploy -c docker-compose.yml nyra
```

**Docker Compose**:
```yaml
version: '3.9'

services:
  nexus-router:
    image: ghcr.io/ruv-inc/nexus-router:latest
    secrets:
      - anthropic_api_key
      - openrouter_api_key
    environment:
      - ANTHROPIC_API_KEY_FILE=/run/secrets/anthropic_api_key
      - OPENROUTER_API_KEY_FILE=/run/secrets/openrouter_api_key

secrets:
  anthropic_api_key:
    external: true
  openrouter_api_key:
    external: true
```

### Option 3: Infisical Integration

**Security**: Highest (centralized secret management, audit logging, rotation)
**Best for**: Production, compliance requirements

**Setup**:
```bash
# Install Infisical CLI
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install infisical

# Login
infisical login

# Pull secrets to .env
infisical export --env=production > .env
```

**Docker Compose with Infisical**:
```yaml
services:
  infisical-sync:
    image: infisical/cli:latest
    container_name: infisical-sync
    restart: unless-stopped
    command: >
      infisical run --env=production --
      /bin/sh -c "while true; do sleep 3600; done"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - INFISICAL_TOKEN=${INFISICAL_TOKEN}
```

---

## 💾 Backup & Disaster Recovery

### Backup Strategy

**What to Backup**:
1. **Databases**:
   - PostgreSQL (TwentyCRM, n8n, Dify)
   - Redis snapshots
   - AgentDB vector data
   - Neo4j graph data

2. **Configuration**:
   - `.env` files
   - `docker-compose.yml` files
   - Monitoring configurations

3. **Persistent Volumes**:
   - Ollama models (`ollama-data`)
   - n8n workflows (`n8n-data`)
   - Grafana dashboards (`grafana-data`)

### Automated Backup Script

```bash
#!/bin/bash
# backup-all.sh - Automated backup for all 4 PCs

set -e

BACKUP_ROOT="/mnt/backup/nyra"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

echo "Starting Project Nyra backup: $TIMESTAMP"

# ====================================
# PostgreSQL Databases
# ====================================
echo "Backing up PostgreSQL databases..."
docker exec postgres-twentycrm pg_dump -U twentycrm twentycrm > "$BACKUP_DIR/twentycrm.sql"
docker exec postgres-n8n pg_dump -U n8n n8n > "$BACKUP_DIR/n8n.sql"
docker exec postgres-dify pg_dump -U dify dify > "$BACKUP_DIR/dify.sql"

# ====================================
# Redis Snapshot
# ====================================
echo "Backing up Redis..."
docker exec redis redis-cli SAVE
docker cp redis:/data/dump.rdb "$BACKUP_DIR/redis-dump.rdb"

# ====================================
# AgentDB Vector Data
# ====================================
echo "Backing up AgentDB..."
docker exec agentdb tar czf /tmp/agentdb-backup.tar.gz /data
docker cp agentdb:/tmp/agentdb-backup.tar.gz "$BACKUP_DIR/agentdb.tar.gz"

# ====================================
# Neo4j Graph Data
# ====================================
echo "Backing up Neo4j..."
docker exec neo4j neo4j-admin dump --database=neo4j --to=/tmp/neo4j-backup.dump
docker cp neo4j:/tmp/neo4j-backup.dump "$BACKUP_DIR/neo4j.dump"

# ====================================
# Docker Volumes
# ====================================
echo "Backing up Docker volumes..."
docker run --rm -v ollama-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/ollama-data.tar.gz /data
docker run --rm -v n8n-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/n8n-data.tar.gz /data
docker run --rm -v grafana-data:/data -v "$BACKUP_DIR":/backup alpine tar czf /backup/grafana-data.tar.gz /data

# ====================================
# Configuration Files
# ====================================
echo "Backing up configuration files..."
cp .env "$BACKUP_DIR/env-backup"
cp docker-compose.yml "$BACKUP_DIR/docker-compose-backup.yml"
cp -r monitoring/ "$BACKUP_DIR/monitoring/"

# ====================================
# Compress and Cleanup
# ====================================
echo "Compressing backup..."
cd "$BACKUP_ROOT"
tar czf "nyra-backup-$TIMESTAMP.tar.gz" "$TIMESTAMP"
rm -rf "$TIMESTAMP"

# ====================================
# Retention Policy (7 days)
# ====================================
echo "Cleaning up old backups (7-day retention)..."
find "$BACKUP_ROOT" -name "nyra-backup-*.tar.gz" -mtime +7 -delete

echo "Backup complete: $BACKUP_ROOT/nyra-backup-$TIMESTAMP.tar.gz"
```

### Disaster Recovery Procedure

**Scenario: Complete System Failure**

**Step 1: Restore Hardware & OS**
- Reinstall OS on all 4 PCs
- Configure static IPs (10.0.0.1-4)
- Install Docker & NVIDIA Container Toolkit

**Step 2: Restore Configuration**
```bash
# Extract latest backup
cd /opt/Project-Nyra
tar xzf /mnt/backup/nyra/nyra-backup-20240113_020000.tar.gz
cp 20240113_020000/env-backup .env
cp 20240113_020000/docker-compose-backup.yml docker-compose.yml
```

**Step 3: Restore Docker Volumes**
```bash
# Restore Ollama models
docker volume create ollama-data
docker run --rm -v ollama-data:/data -v $(pwd)/20240113_020000:/backup alpine \
  tar xzf /backup/ollama-data.tar.gz -C /data --strip 1

# Restore n8n workflows
docker volume create n8n-data
docker run --rm -v n8n-data:/data -v $(pwd)/20240113_020000:/backup alpine \
  tar xzf /backup/n8n-data.tar.gz -C /data --strip 1

# Restore Grafana dashboards
docker volume create grafana-data
docker run --rm -v grafana-data:/data -v $(pwd)/20240113_020000:/backup alpine \
  tar xzf /backup/grafana-data.tar.gz -C /data --strip 1
```

**Step 4: Start Services**
```bash
# PC1 - Orchestrator
docker compose up -d

# PC2 - Worker 2
docker compose --profile worker-2 up -d

# PC3 - Worker 3
docker compose --profile worker-3 up -d

# PC4 - Worker 4
docker compose --profile worker-4 up -d
```

**Step 5: Restore Databases**
```bash
# Restore PostgreSQL
cat 20240113_020000/twentycrm.sql | docker exec -i postgres-twentycrm psql -U twentycrm twentycrm
cat 20240113_020000/n8n.sql | docker exec -i postgres-n8n psql -U n8n n8n
cat 20240113_020000/dify.sql | docker exec -i postgres-dify psql -U dify dify

# Restore Redis
docker cp 20240113_020000/redis-dump.rdb redis:/data/dump.rdb
docker restart redis

# Restore Neo4j
docker cp 20240113_020000/neo4j.dump neo4j:/tmp/neo4j-backup.dump
docker exec neo4j neo4j-admin load --database=neo4j --from=/tmp/neo4j-backup.dump --force
docker restart neo4j
```

**Step 6: Validate Restoration**
```bash
# Run health check script
./scripts/health-check-all.sh

# Expected: 22/22 services healthy
```

**Recovery Time Objective (RTO)**: 2-4 hours
**Recovery Point Objective (RPO)**: 24 hours (daily backups)

---

## ⚡ Performance Tuning

### 1. Docker Daemon Configuration

**Edit `/etc/docker/daemon.json`**:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 10,
  "live-restore": true,
  "userland-proxy": false
}
```

**Restart Docker**:
```bash
sudo systemctl restart docker
```

### 2. Resource Allocation

**Recommended Allocation Per PC**:

**PC1 (16GB RAM)**:
| Service | CPU | RAM | Notes |
|---------|-----|-----|-------|
| nexus-router | 1.0 | 1G | LLM gateway |
| letta | 1.0 | 2G | Memory-intensive |
| mem0 | 0.5 | 1G | REST API |
| claude-flow | 1.5 | 3G | Orchestration |
| agentdb | 1.0 | 2G | Vector DB |
| ruvector | 0.5 | 1G | Neural substrate |
| redis | 0.5 | 512M | Cache |
| qdrant | 1.0 | 2G | Vector search |
| **Total** | **7.0** | **12.5G** | **78% utilization** |

**PC2 (32GB RAM, RTX 3060 12GB)**:
| Service | CPU | RAM | GPU | Notes |
|---------|-----|-----|-----|-------|
| twentycrm | 2.0 | 4G | - | CRM |
| postgres-twenty | 1.0 | 2G | - | Database |
| n8n | 1.5 | 3G | - | Workflows |
| dify | 2.0 | 6G | 4GB | Chat UI + LLM |
| postgres-dify | 1.0 | 2G | - | Database |
| **Total** | **7.5** | **17G** | **4GB** | **53% RAM, 33% GPU** |

**PC3 (64GB RAM, RTX 5090 32GB)**:
| Service | CPU | RAM | GPU | Notes |
|---------|-----|-----|-----|-------|
| ollama | 8.0 | 16G | 20GB | 2 models loaded |
| neo4j | 4.0 | 12G | - | Graph DB |
| falkordb | 2.0 | 4G | - | Knowledge graph |
| **Total** | **14.0** | **32G** | **20GB** | **50% RAM, 62% GPU** |

**PC4 (32GB RAM, RTX 3090 Ti 24GB)**:
| Service | CPU | RAM | Notes |
|---------|-----|-----|-------|
| prometheus | 2.0 | 4G | Metrics |
| grafana | 1.0 | 2G | Dashboards |
| loki | 2.0 | 4G | Logs |
| alertmanager | 0.5 | 1G | Alerts |
| **Total** | **5.5** | **11G** | **34% utilization** |

### 3. Database Tuning

**PostgreSQL Configuration**:
```yaml
services:
  postgres-twenty:
    environment:
      # Performance tuning
      - POSTGRES_SHARED_BUFFERS=1GB
      - POSTGRES_EFFECTIVE_CACHE_SIZE=4GB
      - POSTGRES_MAINTENANCE_WORK_MEM=256MB
      - POSTGRES_CHECKPOINT_COMPLETION_TARGET=0.9
      - POSTGRES_WAL_BUFFERS=16MB
      - POSTGRES_DEFAULT_STATISTICS_TARGET=100
      - POSTGRES_RANDOM_PAGE_COST=1.1
      - POSTGRES_EFFECTIVE_IO_CONCURRENCY=200
      - POSTGRES_WORK_MEM=10MB
      - POSTGRES_MIN_WAL_SIZE=1GB
      - POSTGRES_MAX_WAL_SIZE=4GB
      - POSTGRES_MAX_CONNECTIONS=200
```

### 4. Network Optimization

**Disable IPv6 (If Not Used)**:
```yaml
services:
  nexus-router:
    sysctls:
      - net.ipv6.conf.all.disable_ipv6=1
```

**Increase Network Buffer Sizes**:
```yaml
services:
  nexus-router:
    sysctls:
      - net.core.rmem_max=134217728
      - net.core.wmem_max=134217728
      - net.ipv4.tcp_rmem=4096 87380 134217728
      - net.ipv4.tcp_wmem=4096 65536 134217728
```

---

## ✅ Production Deployment Checklist

### Pre-Deployment

**Infrastructure**:
- [ ] All 4 PCs have static IP addresses (10.0.0.1-4)
- [ ] Docker installed on all PCs
- [ ] NVIDIA Container Toolkit installed on PC2/3/4
- [ ] Network connectivity verified (ping test)
- [ ] Firewall rules configured
- [ ] Tailscale mesh VPN configured (optional)

**Configuration**:
- [ ] `.env` file created with all secrets
- [ ] `docker-compose.yml` files reviewed
- [ ] Monitoring configurations in place
- [ ] Backup scripts tested
- [ ] Health check scripts ready

**Security**:
- [ ] Secrets stored securely (Infisical or Docker Secrets)
- [ ] SSL/TLS certificates obtained (if exposing publicly)
- [ ] Firewall rules limit external access
- [ ] Container images scanned for vulnerabilities
- [ ] Read-only filesystems enabled where possible

### Deployment

**PC1 - Orchestrator**:
- [ ] Environment variables loaded
- [ ] Orchestrator services started: `docker compose up -d`
- [ ] Health check passed for all 8 services
- [ ] Nexus Router accessible on port 6000
- [ ] Claude Flow accessible on port 3010

**PC2 - Worker 2**:
- [ ] Environment variables loaded
- [ ] Worker-2 profile started: `docker compose --profile worker-2 up -d`
- [ ] Health check passed for all 5 services
- [ ] TwentyCRM accessible on port 3000
- [ ] n8n accessible on port 5678

**PC3 - Worker 3**:
- [ ] GPU detected: `nvidia-smi` shows RTX 5090
- [ ] Worker-3 profile started: `docker compose --profile worker-3 up -d`
- [ ] Ollama models pulled (llama3.1, mistral, codellama)
- [ ] Health check passed for all 3 services
- [ ] Ollama accessible on port 11434

**PC4 - Worker 4**:
- [ ] Worker-4 profile started: `docker compose --profile worker-4 up -d`
- [ ] Health check passed for all 4 services
- [ ] Prometheus accessible on port 9090
- [ ] Grafana accessible on port 3005
- [ ] Dashboards loading data

### Post-Deployment

**Validation**:
- [ ] All 22 services healthy (health-check-all.sh)
- [ ] End-to-end workflow tested (lead → quote → campaign)
- [ ] Monitoring dashboards showing metrics
- [ ] Alert rules triggered and routed correctly
- [ ] Backup script executed successfully

**Documentation**:
- [ ] Deployment date and version recorded
- [ ] Runbook updated with any deployment notes
- [ ] Team trained on monitoring and alerting
- [ ] Disaster recovery procedure reviewed

**Monitoring**:
- [ ] Prometheus scraping all targets
- [ ] Grafana dashboards displaying data
- [ ] Alert rules configured and tested
- [ ] Log aggregation working (Loki)
- [ ] Uptime monitoring enabled

---

**Document Version**: 1.0
**Last Updated**: 2026-01-13
**Maintained By**: Project Nyra Team
**Related Docs**:
- [Complete Setup Guide](./COMPLETE-SETUP-GUIDE.md)
- [Best Practices Guide](./BEST-PRACTICES-GUIDE.md)
- [Master Troubleshooting](./MASTER-TROUBLESHOOTING.md)
