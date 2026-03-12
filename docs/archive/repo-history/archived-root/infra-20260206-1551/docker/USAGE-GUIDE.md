# Project Nyra - Docker Infrastructure Usage Guide

**Last Updated**: January 18, 2026
**Version**: 5.0.0
**Docker Compose Files**: 17 modular compositions

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Modular Docker Structure](#modular-docker-structure)
4. [PC-Specific Deployment](#pc-specific-deployment)
5. [Development vs Production](#development-vs-production)
6. [Common Operations](#common-operations)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)

---

## Overview

Project Nyra uses a **modular Docker Compose architecture** with 17 specialized compose files that can be combined for different deployment scenarios.

### Design Principles

- **Modularity**: Services grouped by function
- **Composability**: Mix and match as needed
- **PC-Aware**: Profiles for orchestrator and workers
- **Environment-Aware**: Development and production modes
- **Infisical-Ready**: Integrated secrets management

### Architecture

```
infra/docker/
├── docker-compose.yml                    # Base infrastructure
├── docker-compose.orchestration.yml      # Claude Flow + Archon OS
├── docker-compose.services.yml           # 14 microservices
├── docker-compose.addons.yml             # Optional services
├── docker-compose.monitoring.yml         # Prometheus + Grafana
├── docker-compose.observability.yml      # Loki + Tempo
├── docker-compose.ui.yml                 # User interfaces
├── docker-compose.dev.yml                # Development overrides
├── docker-compose.prod.yml               # Production overrides
├── docker-compose.mcp-dev.yml            # MCP development
├── docker-compose.graphiti.yml           # Graph memory
├── docker-compose.gitea.yml              # Self-hosted Git
├── docker-compose.voice.yml              # Twilio integration
├── docker-compose.dual-orchestrator.yml  # Dual orchestrator
├── docker-compose.full.yml               # Complete stack
├── docker-compose.local.yml              # Local development
└── docker-compose.mcp.yml                # MCP production
```

---

## Quick Start

### 1. Choose Your Deployment Mode

#### Orchestrator (PC1)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Option A: Minimal orchestrator
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d

# Option B: Full orchestrator stack
docker compose -f infra/docker/docker-compose.full.yml up -d

# Option C: With monitoring
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.monitoring.yml \
  up -d
```

#### Worker (PC2/PC3/PC4)
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Start worker services
docker compose -f configs/docker-compose.worker1.yml up -d

# Or use profile
docker compose --profile worker-1 up -d
```

### 2. Verify Deployment

```bash
# Check all running services
docker compose ps

# Check health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# View logs
docker compose logs -f --tail=50
```

### 3. Access Services

| Service | URL | Port |
|---------|-----|------|
| Grafana | http://localhost:3000 | 3000 |
| Prometheus | http://localhost:9090 | 9090 |
| Nexus Router | http://localhost:7000 | 7000 |
| N8N | http://localhost:5678 | 5678 |
| Dify | http://localhost:3001 | 3001 |
| TwentyCRM | http://localhost:3010 | 3010 |
| Letta | http://localhost:8283 | 8283 |
| PostgreSQL | localhost:5432 | 5432 |
| Redis | localhost:6380 | 6380 |
| FalkorDB | localhost:6379 | 6379 |
| Qdrant | http://localhost:6333 | 6333 |

---

## Modular Docker Structure

### Base Infrastructure (`docker-compose.yml`)

**Services:**
- PostgreSQL 15 (pgvector extension)
- Redis 7
- FalkorDB (graph database)
- Qdrant (vector database)

**Purpose**: Core data storage layer

**Usage:**
```bash
# Start base infrastructure only
docker compose -f infra/docker/docker-compose.yml up -d

# This is the foundation - always start this first
```

**Volumes:**
- `postgres_data` - PostgreSQL data persistence
- `redis_data` - Redis persistence (if enabled)
- `falkordb_data` - Graph database data
- `qdrant_data` - Vector embeddings

---

### Orchestration Layer (`docker-compose.orchestration.yml`)

**Services:**
- Claude Flow daemon
- Archon OS
- Nexus Router (MCP gateway)
- Letta memory server
- 12 MCP servers

**Purpose**: Multi-agent orchestration and memory

**Usage:**
```bash
# Start orchestration (requires base infrastructure)
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d
```

**Dependencies:**
- Requires PostgreSQL (for Letta)
- Requires Redis (for coordination)
- Requires Qdrant (for vector memory)

---

### Microservices (`docker-compose.services.yml`)

**Services** (14 total):
1. `auth-service` - Authentication & authorization
2. `campaign-engine` - Drip campaign orchestration
3. `doc-management-api` - Document processing
4. `graphiti-knowledge` - Knowledge graph
5. `lead-capture-api` - Lead management
6. `letta-integration` - Memory system integration
7. `mortgage-assistant-api` - Mortgage operations
8. `n8n-workflows` - Workflow automation
9. `nexus-router` - LLM routing
10. `rate-comparison-engine` - Rate tracking
11. `ratehunter-api` - Rate comparison API
12. `ruvector-search` - Vector search
13. `twentycrm-integration` - CRM integration
14. `twilio-integration` - SMS/Voice
15. `websocket-hub` - Real-time connections

**Purpose**: Business logic and API layer

**Usage:**
```bash
# Start all microservices
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.services.yml \
  up -d

# Start specific service
docker compose -f infra/docker/docker-compose.services.yml \
  up -d auth-service lead-capture-api
```

---

### Monitoring Stack (`docker-compose.monitoring.yml`)

**Services:**
- Prometheus - Metrics collection
- Grafana - Visualization
- Node Exporter - System metrics
- cAdvisor - Container metrics

**Purpose**: System monitoring and alerting

**Usage:**
```bash
# Add monitoring to any deployment
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.monitoring.yml \
  up -d
```

**Grafana Dashboards:**
- System Overview
- Container Metrics
- Database Performance
- MCP Server Health
- GPU Utilization (workers)

---

### Observability Stack (`docker-compose.observability.yml`)

**Services:**
- Loki - Log aggregation
- Promtail - Log shipper
- Tempo - Distributed tracing

**Purpose**: Advanced logging and tracing

**Usage:**
```bash
# Add observability
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.observability.yml \
  up -d
```

---

### User Interfaces (`docker-compose.ui.yml`)

**Services:**
- Open-WebUI - Chat interface
- LobeChat - Alternative chat UI
- Dify - AI application builder
- Activepieces - Workflow builder
- TwentyCRM - CRM interface

**Purpose**: User-facing applications

**Usage:**
```bash
# Can run on any PC
docker compose -f infra/docker/docker-compose.ui.yml up -d
```

**Note**: UI services can run on orchestrator or any worker PC

---

### Development Mode (`docker-compose.dev.yml`)

**Overrides:**
- Hot reload enabled
- Debug ports exposed
- Verbose logging
- Development databases
- Mock external services

**Purpose**: Local development

**Usage:**
```bash
# Override production config with dev settings
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d
```

---

### Production Mode (`docker-compose.prod.yml`)

**Overrides:**
- Resource limits enforced
- Health checks enabled
- Restart policies set
- Production logging
- Secrets from Infisical

**Purpose**: Production deployment

**Usage:**
```bash
# Production deployment
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.prod.yml \
  up -d
```

---

### Complete Stack (`docker-compose.full.yml`)

**Includes:**
- Base infrastructure
- Orchestration
- All microservices
- Monitoring
- Observability
- UI services

**Purpose**: All-in-one deployment

**Usage:**
```bash
# Everything at once (orchestrator only)
docker compose -f infra/docker/docker-compose.full.yml up -d
```

**Warning**: Resource intensive - requires 16GB+ RAM

---

## PC-Specific Deployment

### PC1 - Orchestrator (Mini PC)

**Location**: `configs/docker-compose.orchestrator.yml`

**Deployment:**
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Set PC ID
export NYRA_PC_ID=orchestrator

# Start orchestrator
docker compose -f configs/docker-compose.orchestrator.yml up -d

# Or use profile
docker compose --profile orchestrator up -d

# Verify
docker compose ps
```

**Services Running:**
- All base infrastructure
- All orchestration services
- Monitoring stack
- MCP servers
- (Optional) UI services

**Resource Requirements:**
- RAM: 8-16 GB
- CPU: 4-8 cores
- Disk: 100 GB
- GPU: Not required

---

### PC2 - Worker 1 (RTX 4090)

**Location**: `configs/docker-compose.worker1.yml`

**Deployment:**
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Set environment
export NYRA_PC_ID=worker-1
export NYRA_GPU_TYPE=rtx_4090

# Start worker
docker compose -f configs/docker-compose.worker1.yml up -d

# Or use profile
docker compose --profile worker-1 up -d

# Verify GPU access
docker exec nyra-worker-1 nvidia-smi
```

**Services Running:**
- Ollama (GPU inference)
- vLLM (GPU inference)
- Worker agent daemon
- Cloudflared tunnel

**Resource Requirements:**
- RAM: 16-32 GB
- CPU: 8-16 cores
- Disk: 50 GB
- GPU: RTX 4090 (24GB VRAM)

---

### PC3 - Worker 2 (RTX 4090)

**Location**: `configs/docker-compose.worker2.yml`

**Deployment:**
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Set environment
export NYRA_PC_ID=worker-2
export NYRA_GPU_TYPE=rtx_4090

# Start worker
docker compose -f configs/docker-compose.worker2.yml up -d

# Verify
docker compose ps
docker exec nyra-worker-2 nvidia-smi
```

---

### PC4 - Worker 3 (RTX 4090)

**Location**: `configs/docker-compose.worker3.yml`

**Deployment:**
```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Set environment
export NYRA_PC_ID=worker-3
export NYRA_GPU_TYPE=rtx_4090

# Start worker
docker compose -f configs/docker-compose.worker3.yml up -d

# Verify
docker compose ps
docker exec nyra-worker-3 nvidia-smi
```

---

## Development vs Production

### Development Mode

**Characteristics:**
- Hot reload enabled
- Debug logging
- Local .env files
- Mock services
- Exposed debug ports
- No resource limits

**Setup:**
```bash
# Copy dev template
cp .env.example .env

# Fill in development credentials
# Use local/mock API keys

# Start in dev mode
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d

# Watch logs
docker compose logs -f
```

**Best Practices:**
- Use separate database for dev
- Don't use production API keys
- Enable verbose logging
- Use local volumes for hot reload
- Disable health checks for faster restart

---

### Production Mode

**Characteristics:**
- Infisical secrets
- Resource limits
- Health checks
- Restart policies
- Production logging
- Security hardening

**Setup:**
```bash
# Set up Infisical (see ENV-VARIABLE-GUIDE.md)
infisical login
infisical secrets upload --env production --path /nyra/orchestrator

# Start in prod mode
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.prod.yml \
  up -d

# Monitor health
docker compose ps --format "table {{.Name}}\t{{.Health}}"
```

**Best Practices:**
- Always use Infisical for secrets
- Set resource limits on all services
- Enable health checks
- Use restart: unless-stopped
- Monitor with Prometheus + Grafana
- Set up log rotation
- Enable auto-backup for databases

---

## Common Operations

### Starting Services

```bash
# Start specific services
docker compose up -d postgres redis

# Start with build
docker compose up -d --build

# Start in foreground (see logs)
docker compose up

# Start with specific profile
docker compose --profile orchestrator up -d

# Start multiple compose files
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop specific service
docker compose stop postgres

# Stop and remove volumes (⚠️ DATA LOSS)
docker compose down -v

# Stop but keep containers
docker compose stop
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100

# Since timestamp
docker compose logs --since 2024-01-18T10:00:00

# Save to file
docker compose logs > logs.txt
```

### Scaling Services

```bash
# Scale specific service
docker compose up -d --scale worker=3

# Check scaled services
docker compose ps
```

### Updating Services

```bash
# Pull latest images
docker compose pull

# Recreate containers with new images
docker compose up -d --force-recreate

# Update specific service
docker compose up -d --no-deps --build postgres
```

### Health Checks

```bash
# Check health status
docker compose ps --format "table {{.Name}}\t{{.Health}}"

# Detailed health
docker inspect --format='{{.State.Health.Status}}' nyra-postgres

# Health check logs
docker inspect --format='{{json .State.Health}}' nyra-postgres | jq
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Container resource limits
docker compose config | grep -A 5 "resources:"

# Disk usage
docker system df

# Detailed disk usage
docker system df -v
```

### Backup and Restore

```bash
# Backup PostgreSQL
docker exec nyra-postgres pg_dumpall -U postgres > backup.sql

# Restore PostgreSQL
cat backup.sql | docker exec -i nyra-postgres psql -U postgres

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

### Network Inspection

```bash
# List networks
docker network ls

# Inspect network
docker network inspect nyra-network

# Check container IPs
docker compose ps --format "table {{.Name}}\t{{.Networks}}\t{{.Ports}}"

# Test connectivity
docker exec nyra-postgres ping nyra-redis
```

---

## Troubleshooting

### Issue 1: Services Won't Start

**Symptoms:**
- Container exits immediately
- Error: "port already in use"
- "Cannot start service"

**Solutions:**
```bash
# Check what's using the port
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # Linux

# Check Docker logs
docker compose logs <service-name>

# Check resource availability
docker system df
df -h  # Disk space

# Remove conflicting containers
docker compose down
docker container prune -f

# Restart Docker daemon (if needed)
sudo systemctl restart docker  # Linux
# Restart Docker Desktop         # Windows
```

---

### Issue 2: Database Connection Errors

**Symptoms:**
- "Connection refused"
- "Password authentication failed"
- Microservices can't connect to PostgreSQL

**Solutions:**
```bash
# 1. Verify PostgreSQL is running
docker compose ps postgres

# 2. Check PostgreSQL logs
docker compose logs postgres

# 3. Verify environment variables
docker compose exec postgres env | grep POSTGRES

# 4. Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1;"

# 5. Check network connectivity
docker compose exec <service> ping nyra-postgres

# 6. Verify database was created
docker compose exec postgres psql -U postgres -l

# 7. Reset database (⚠️ DATA LOSS)
docker compose down -v
docker compose up -d postgres
```

---

### Issue 3: Out of Memory

**Symptoms:**
- Services crash randomly
- "Out of memory" errors
- System becomes unresponsive

**Solutions:**
```bash
# 1. Check current memory usage
docker stats --no-stream

# 2. Set memory limits in compose file
services:
  postgres:
    deploy:
      resources:
        limits:
          memory: 2G

# 3. Increase Docker memory (Docker Desktop)
# Settings → Resources → Memory → Increase to 8GB+

# 4. Stop unnecessary services
docker compose stop dify activepieces

# 5. Use lighter alternatives
# Instead of full stack, use minimal:
docker compose -f docker-compose.yml \
  -f docker-compose.orchestration.yml \
  up -d
```

---

### Issue 4: GPU Not Accessible

**Symptoms:**
- "CUDA not found"
- "No GPU available"
- nvidia-smi fails in container

**Solutions:**
```bash
# 1. Verify GPU on host
nvidia-smi

# 2. Check NVIDIA Container Toolkit
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# 3. Verify runtime in compose
services:
  ollama:
    runtime: nvidia
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]

# 4. Restart Docker with GPU support
sudo systemctl restart docker

# 5. Check Docker daemon config
cat /etc/docker/daemon.json
# Should have:
{
  "runtimes": {
    "nvidia": {
      "path": "/usr/bin/nvidia-container-runtime",
      "runtimeArgs": []
    }
  }
}
```

---

### Issue 5: Slow Performance

**Symptoms:**
- Services slow to respond
- High CPU/memory usage
- Disk I/O bottleneck

**Solutions:**
```bash
# 1. Identify bottleneck
docker stats

# 2. Check disk I/O
iostat -x 1

# 3. Optimize PostgreSQL
# Add to postgres service:
environment:
  - POSTGRES_SHARED_BUFFERS=2GB
  - POSTGRES_WORK_MEM=64MB
  - POSTGRES_MAINTENANCE_WORK_MEM=512MB

# 4. Use volume optimization
# Change from bind mount to named volume
volumes:
  - postgres_data:/var/lib/postgresql/data  # ✅ Faster
  # - ./data:/var/lib/postgresql/data       # ❌ Slower

# 5. Limit log verbosity
environment:
  - LOG_LEVEL=INFO  # Instead of DEBUG

# 6. Use production mode (includes optimizations)
docker compose -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d
```

---

## Performance Optimization

### 1. Volume Performance

**Best Practices:**
```yaml
# ✅ Use named volumes (fastest)
volumes:
  postgres_data:/var/lib/postgresql/data

# ⚠️ Use bind mounts only for development
volumes:
  ./src:/app/src:cached  # cached mode for better performance

# ❌ Avoid bind mounts for databases
volumes:
  ./postgres-data:/var/lib/postgresql/data  # Slow on Windows
```

### 2. Network Performance

**Best Practices:**
```yaml
# ✅ Use custom networks with subnets
networks:
  nyra-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

# ✅ Use service names (DNS) instead of IPs
DATABASE_URL: postgres://postgres@nyra-postgres:5432/nyra

# ✅ Use host network for maximum performance (Linux only)
network_mode: host
```

### 3. Build Performance

**Best Practices:**
```bash
# Use BuildKit
export DOCKER_BUILDKIT=1

# Use layer caching
docker compose build --build-arg BUILDKIT_INLINE_CACHE=1

# Multi-stage builds
FROM node:20 AS builder
# Build stage
FROM node:20-alpine AS runtime
COPY --from=builder /app/dist /app/dist
```

### 4. Resource Allocation

**Best Practices:**
```yaml
services:
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    environment:
      # Optimize for allocated memory
      - POSTGRES_SHARED_BUFFERS=1GB     # 25% of RAM
      - POSTGRES_EFFECTIVE_CACHE_SIZE=3GB  # 75% of RAM
```

### 5. Health Check Optimization

**Best Practices:**
```yaml
healthcheck:
  test: ["CMD", "pg_isready", "-U", "postgres"]
  interval: 10s      # Check every 10s
  timeout: 5s        # Fail after 5s
  retries: 5         # Try 5 times before unhealthy
  start_period: 60s  # Wait 60s before first check
```

---

## Quick Reference Commands

### Essential Commands

```bash
# Start orchestrator
docker compose -f infra/docker/docker-compose.full.yml up -d

# Start worker
docker compose -f configs/docker-compose.worker1.yml up -d

# Stop all
docker compose down

# View logs
docker compose logs -f

# Check health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Restart service
docker compose restart <service-name>

# Rebuild service
docker compose up -d --no-deps --build <service-name>

# Clean up
docker compose down -v
docker system prune -a
```

### Monitoring Commands

```bash
# Resource usage
docker stats --no-stream

# Container inspect
docker inspect <container-name>

# Network inspect
docker network inspect nyra-network

# Volume inspect
docker volume inspect postgres_data

# System info
docker info
docker version
```

---

## Additional Resources

- **Environment Variables**: See `docs/operations/ENV-VARIABLE-GUIDE.md`
- **Consolidation Details**: See `docs/operations/CONSOLIDATION-COMPLETE.md`
- **4-PC Architecture**: See `docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`
- **Security**: See `docs/security/INFRASTRUCTURE-SECURITY-AUDIT.md`

---

**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
**Docker Version**: 24.0+
**Docker Compose Version**: 2.20+
