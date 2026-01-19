# Docker Infrastructure Consolidation Guide

**Version**: 1.0.0
**Date**: January 18, 2026
**Status**: Production Ready

## Overview

This guide documents the consolidated Docker infrastructure for Project Nyra, covering the new canonical structure, usage patterns, and migration from the old scattered configuration.

## Table of Contents

1. [Canonical Directory Structure](#canonical-directory-structure)
2. [Compose File Organization](#compose-file-organization)
3. [Usage Patterns](#usage-patterns)
4. [Service Connection Patterns](#service-connection-patterns)
5. [Migration from Old Structure](#migration-from-old-structure)
6. [Troubleshooting](#troubleshooting)

---

## Canonical Directory Structure

All Docker configurations are now consolidated in **`infra/docker/`** as the canonical location.

```
infra/docker/
├── docker-compose.yml                    # Base infrastructure (PostgreSQL, Redis, FalkorDB, Qdrant)
├── docker-compose.orchestration.yml      # Orchestration layer (Claude Flow, Archon OS, Nexus Router)
├── docker-compose.services.yml           # 14 microservices
├── docker-compose.addons.yml             # Optional services (n8n, Dify, etc.)
├── docker-compose.monitoring.yml         # Prometheus + Grafana + exporters
├── docker-compose.observability.yml      # Loki + Promtail + Tempo
├── docker-compose.ui.yml                 # User interfaces (Open-WebUI, LobeChat, etc.)
├── docker-compose.mcp.yml                # MCP servers (production)
├── docker-compose.mcp-dev.yml            # MCP servers (development)
├── docker-compose.dev.yml                # Development overrides
├── docker-compose.prod.yml               # Production overrides
├── docker-compose.full.yml               # Complete stack (all-in-one)
├── docker-compose.graphiti.yml           # Graph memory service
├── docker-compose.gitea.yml              # Self-hosted Git
├── docker-compose.voice.yml              # Twilio voice integration
├── docker-compose.dual-orchestrator.yml  # Dual orchestrator mode
├── docker-compose.local.yml              # Local development
├── .env                                  # Environment variables (gitignored)
├── .env.example                          # Environment template
├── README.md                             # Main documentation
├── USAGE-GUIDE.md                        # Usage guide
├── start-full-stack.sh                   # Startup script
├── stop-all.sh                           # Shutdown script
├── health-check.sh                       # Health check script
├── logs-all.sh                           # Log viewing script
├── scripts/                              # Helper scripts
│   ├── postgres-init/                    # PostgreSQL initialization
│   └── dev-sql/                          # Development SQL scripts
├── observability/                        # Observability configs
│   ├── prometheus.yml
│   ├── grafana-datasources.yml
│   ├── loki-config.yml
│   └── promtail-config.yml
├── nginx/                                # Nginx configurations
└── workers/                              # Worker-specific configs
```

### PC-Specific Configurations

Located in **`configs/`** at the project root:

```
configs/
├── docker-compose.orchestrator.yml       # PC1 (Mini PC)
├── docker-compose.worker1.yml            # PC2 (RTX 4090)
├── docker-compose.worker2.yml            # PC3 (RTX 4090)
└── docker-compose.worker3.yml            # PC4 (RTX 4090)
```

---

## Compose File Organization

### Base Infrastructure (`docker-compose.yml`)

**Services:**
- PostgreSQL 16 with pgvector extension
- Redis 7 (caching and sessions)
- FalkorDB (temporal knowledge graphs)
- Qdrant (vector database)

**Usage:**
```bash
# Start base infrastructure only
docker compose -f infra/docker/docker-compose.yml up -d
```

**When to use:**
- Foundation for all other services
- Required by orchestration and microservices
- Always start this first

---

### Orchestration Layer (`docker-compose.orchestration.yml`)

**Services:**
- Claude Flow daemon (multi-agent workflows)
- Archon OS (agent operating system)
- Nexus Router (intelligent LLM routing with MCP gateway)
- Letta (agent memory management)
- 12 MCP servers (integrated)

**Usage:**
```bash
# Start orchestration (requires base infrastructure)
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d
```

**When to use:**
- Orchestrator PC (PC1)
- Requires PostgreSQL, Redis, and Qdrant
- Core AI orchestration capabilities

---

### Microservices (`docker-compose.services.yml`)

**Services:** (14 total)
1. auth-service - Authentication & authorization
2. campaign-engine - Drip campaign orchestration
3. doc-management-api - Document processing
4. graphiti-knowledge - Knowledge graph
5. lead-capture-api - Lead management
6. letta-integration - Memory system integration
7. mortgage-assistant-api - Mortgage operations
8. n8n-workflows - Workflow automation
9. nexus-router - LLM routing
10. rate-comparison-engine - Rate tracking
11. ratehunter-api - Rate comparison API
12. ruvector-search - Vector search
13. twentycrm-integration - CRM integration
14. twilio-integration - SMS/Voice
15. websocket-hub - Real-time connections

**Usage:**
```bash
# Start all microservices
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.services.yml \
  up -d

# Start specific services
docker compose -f infra/docker/docker-compose.services.yml \
  up -d auth-service lead-capture-api
```

**When to use:**
- Business logic and API layer
- Can be deployed selectively
- Requires base infrastructure

---

### Monitoring Stack (`docker-compose.monitoring.yml`)

**Services:**
- Prometheus - Metrics collection
- Grafana - Visualization and dashboards
- Node Exporter - System metrics
- cAdvisor - Container metrics
- Alertmanager - Alert routing

**Usage:**
```bash
# Add monitoring to any deployment
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.monitoring.yml \
  up -d
```

**Grafana Dashboards:**
- System Overview
- Container Metrics
- Database Performance
- MCP Server Health
- GPU Utilization (workers)

**When to use:**
- Production deployments
- Performance tuning
- Health monitoring
- Alert management

---

### Development Mode (`docker-compose.dev.yml`)

**Overrides:**
- Hot reload enabled for code changes
- Debug ports exposed (9229, 9230, 9231)
- Verbose logging (DEBUG level)
- Development databases (non-persistent)
- Mock external services
- Development tools included:
  - pgAdmin (PostgreSQL GUI)
  - Redis Commander
  - Portainer (Docker management)
  - Mailhog (Email testing)

**Usage:**
```bash
# Override with development settings
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d
```

**When to use:**
- Local development
- Testing and debugging
- Hot code reloading
- No resource limits

---

### Production Mode (`docker-compose.prod.yml`)

**Overrides:**
- Resource limits enforced
- Health checks enabled with longer timeouts
- Restart policies (unless-stopped)
- Production logging (compressed, rotated)
- Secrets via Infisical
- Security hardening (no-new-privileges)
- Services bound to 127.0.0.1

**Usage:**
```bash
# Production deployment (requires Infisical)
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="prod" --path="/shared" -- \
  docker compose -f infra/docker/docker-compose.yml \
    -f infra/docker/docker-compose.orchestration.yml \
    -f infra/docker/docker-compose.prod.yml \
    up -d
```

**When to use:**
- Production deployments
- Requires Infisical setup
- Strict security and resource management
- High availability requirements

---

### Complete Stack (`docker-compose.full.yml`)

**Includes:**
- Base infrastructure
- Orchestration layer
- All microservices
- Monitoring stack
- Observability stack
- UI services
- Add-ons (n8n, Dify)

**Usage:**
```bash
# Everything at once (orchestrator only)
docker compose -f infra/docker/docker-compose.full.yml up -d
```

**Resource Requirements:**
- RAM: 16GB+ recommended
- CPU: 8+ cores
- Disk: 100GB+
- GPU: Not required (orchestrator)

**When to use:**
- Demo environments
- Integration testing
- Orchestrator PC (PC1)
- Single-machine deployments

**Warning:** Resource intensive, not suitable for worker PCs

---

## Usage Patterns

### Pattern 1: Minimal Orchestrator

**Use Case:** Lightweight orchestration without extras

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d
```

**Services Running:**
- PostgreSQL, Redis, FalkorDB, Qdrant
- Claude Flow, Archon OS, Nexus Router, Letta

---

### Pattern 2: Orchestrator with Monitoring

**Use Case:** Production orchestrator with observability

```bash
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.monitoring.yml \
  -f infra/docker/docker-compose.observability.yml \
  up -d
```

**Access:**
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

---

### Pattern 3: GPU Worker

**Use Case:** RTX 4090 worker with inference capabilities

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# PC2 (Worker 1)
docker compose -f configs/docker-compose.worker1.yml up -d

# PC3 (Worker 2)
docker compose -f configs/docker-compose.worker2.yml up -d

# PC4 (Worker 3)
docker compose -f configs/docker-compose.worker3.yml up -d
```

**Services Running:**
- Ollama (GPU inference)
- vLLM (GPU inference)
- Worker agent daemon
- Cloudflared tunnel

---

### Pattern 4: Development Stack

**Use Case:** Local development with hot reload

```bash
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d
```

**Features:**
- Hot code reloading
- Debug ports exposed
- Development tools (pgAdmin, Portainer)
- Verbose logging

---

### Pattern 5: Production Stack

**Use Case:** Production deployment with secrets management

```bash
# Login to Infisical first
infisical login

# Start production stack
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="prod" --path="/shared" -- \
  docker compose -f infra/docker/docker-compose.yml \
    -f infra/docker/docker-compose.orchestration.yml \
    -f infra/docker/docker-compose.monitoring.yml \
    -f infra/docker/docker-compose.prod.yml \
    up -d
```

**Features:**
- Secrets from Infisical
- Resource limits
- Health checks
- Production logging
- Security hardening

---

## Service Connection Patterns

### Internal Service Discovery

Services communicate using Docker DNS:

```yaml
# PostgreSQL connection from any service
DATABASE_URL: postgresql://user:pass@postgresql:5432/nyra_db

# Redis connection
REDIS_URL: redis://:password@redis:6379

# Nexus Router (LLM routing)
NEXUS_ROUTER_URL: http://nexus-router:8000

# Letta (memory management)
LETTA_URL: http://letta:8283
```

### Nexus Router Integration

All AI inference requests go through Nexus Router:

```yaml
services:
  my-service:
    environment:
      # OpenAI-compatible endpoint
      OPENAI_API_BASE_URL: http://nexus-router:8000/v1
      OPENAI_API_KEY: ${ANTHROPIC_API_KEY}

      # Letta uses Nexus Router
      LETTA_LLM_ENDPOINT: http://nexus-router:8000/v1
```

**Benefits:**
- 90% cost savings with local GPU workers
- Automatic failover to cloud APIs
- Request caching
- Load balancing across workers

### MCP Server Connections

MCP clients connect through Nexus Router MCP proxy:

```yaml
services:
  claude-flow:
    environment:
      # Connect to Nexus Router MCP gateway
      MCP_GATEWAY_URL: http://nexus-router:4001/mcp

      # Nexus Router aggregates all MCP servers:
      # - Gemini MCP (8085)
      # - Serena MCP (8086)
      # - Mem0 (8080)
      # - Claude Flow MCP
      # - Ruv-Swarm MCP
```

### Database Initialization

PostgreSQL automatically creates multiple databases for different services:

```yaml
services:
  postgresql:
    environment:
      POSTGRES_MULTIPLE_DATABASES: letta_db,twenty_db,dify_db,n8n_db
```

Services connect to their specific database:

```yaml
services:
  letta:
    environment:
      LETTA_POSTGRES_URI: postgresql://nyra_user:password@postgresql:5432/letta_db

  n8n:
    environment:
      DB_POSTGRESDB_DATABASE: n8n_db
```

---

## Migration from Old Structure

### What Changed

**Before Consolidation:**
- 202 Docker Compose files scattered across the repository
- Multiple .env files with duplicates
- Unclear service dependencies
- No clear deployment patterns
- Manual service discovery

**After Consolidation:**
- 17 modular compose files in `infra/docker/`
- 4 PC-specific configs in `configs/`
- Single master .env.example
- Clear layered architecture
- Automatic service discovery

### Breaking Changes

#### 1. File Locations

**Old:**
```bash
# Scattered everywhere
orchestration/claude-flow/docker-compose.yml
services/memory/deployment/docker-compose.yml
configs/docker-compose.orchestrator.yml
```

**New:**
```bash
# Centralized
infra/docker/docker-compose.orchestration.yml
infra/docker/docker-compose.services.yml
configs/docker-compose.orchestrator.yml  # PC-specific only
```

#### 2. Service Names

**Old container names:**
```
nyra-claude-flow
nyra-postgres
various-inconsistent-names
```

**New container names:**
```
nyra-claude-flow-prod      # Production
nyra-claude-flow-dev       # Development
nyra-postgres-prod         # Production
nyra-postgres-dev          # Development
```

#### 3. Network Configuration

**Old:**
Multiple networks with varying configurations

**New:**
Single unified network:
```yaml
networks:
  nyra-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

#### 4. Port Assignments

Standardized port assignments:

| Service | Port | MCP Port | Purpose |
|---------|------|----------|---------|
| PostgreSQL | 5432 | - | Database |
| Redis | 6379 | - | Cache |
| FalkorDB | 6380 | - | Graph DB |
| Qdrant | 6333 | 6334 (gRPC) | Vector DB |
| Claude Flow | 9000 | - | Orchestration |
| Archon OS | 9001 | 9002 | Agent OS |
| Nexus Router | 8000 | 4001 | LLM Routing |
| Letta | 8283 | 8284 | Memory |
| Grafana | 3000 | - | Monitoring |
| Prometheus | 9090 | - | Metrics |
| Open-WebUI | 3210 | - | Chat UI |

### Migration Steps

#### Step 1: Backup Current Configuration

```bash
# Stop existing services
docker compose down

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz /data

# Backup .env
cp .env .env.backup_$(date +%Y%m%d)
```

#### Step 2: Update Environment Variables

```bash
# Copy new template
cp infra/docker/.env.example .env

# Migrate old variables (compare and merge)
diff .env.backup_20260118 .env

# Update with your values
nano .env
```

Key changes:
- `POSTGRES_PASSWORD` → Same name, verify value
- `REDIS_PASSWORD` → Same name, verify value
- `CLAUDE_FLOW_PORT` → Default now 9000
- `NEXUS_ROUTER_PORT` → Default now 8000
- Add new: `MODEL_ROUTING_STRATEGY`

#### Step 3: Update Docker Compose Commands

**Old:**
```bash
docker compose -f orchestration/claude-flow/docker-compose.yml up -d
docker compose -f services/memory/deployment/docker-compose.memory.yml up -d
```

**New:**
```bash
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d
```

#### Step 4: Verify Service Connections

```bash
# Check all services are running
docker compose ps

# Check health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Verify database connections
docker exec nyra-postgres-dev psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Verify Nexus Router
curl http://localhost:8000/health

# Check logs
docker compose logs -f --tail=50
```

#### Step 5: Update Application Configurations

Update any hardcoded URLs in your applications:

**Old:**
```yaml
OPENAI_API_BASE_URL: http://localhost:11434/v1  # Old Ollama direct
```

**New:**
```yaml
OPENAI_API_BASE_URL: http://nexus-router:8000/v1  # Through Nexus Router
```

### Rollback Procedure

If migration fails:

```bash
# Stop new services
docker compose -f infra/docker/docker-compose.full.yml down

# Restore old configuration
git checkout HEAD~1 -- .

# Restore volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup_20260118.tar.gz -C /data

# Restore .env
cp .env.backup_20260118 .env

# Start old services
# (use your old docker compose commands)
```

---

## Troubleshooting

### Issue: Services Won't Start

**Symptoms:**
- Container exits immediately
- "port already in use" error

**Solutions:**
```bash
# Check port conflicts
netstat -ano | findstr :5432    # Windows
lsof -i :5432                   # Linux

# Stop conflicting services
docker compose down

# Clean up old containers
docker container prune -f

# Restart Docker daemon if needed
```

### Issue: Database Connection Errors

**Symptoms:**
- "Connection refused"
- "Password authentication failed"

**Solutions:**
```bash
# Verify PostgreSQL is running
docker compose ps postgresql

# Check PostgreSQL logs
docker compose logs postgresql

# Test connection
docker compose exec postgresql psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Verify environment variables
docker compose exec postgresql env | grep POSTGRES

# Reset database (⚠️ DATA LOSS)
docker compose down -v
docker compose up -d postgresql
```

### Issue: Nexus Router Not Routing

**Symptoms:**
- Requests timing out
- "No workers available"
- High cloud API usage

**Solutions:**
```bash
# Check Nexus Router health
curl http://localhost:8000/health

# Check worker connectivity
curl http://localhost:8000/health | jq '.components.workers'

# Verify worker URLs in .env
grep WORKER_ .env

# Check Nexus Router logs
docker compose logs nexus-router

# Restart Nexus Router
docker compose restart nexus-router
```

### Issue: MCP Servers Not Accessible

**Symptoms:**
- MCP clients can't connect
- "Gateway timeout"

**Solutions:**
```bash
# Check MCP gateway health
curl http://localhost:4001/mcp/health

# List registered MCP servers
curl http://localhost:4001/mcp/servers

# Check Nexus Router MCP port
docker compose ps nexus-router

# Verify MCP configuration
docker compose exec nexus-router env | grep MCP

# Restart MCP services
docker compose restart nexus-router
```

### Issue: Out of Memory

**Symptoms:**
- Services crash randomly
- System becomes unresponsive

**Solutions:**
```bash
# Check memory usage
docker stats --no-stream

# Stop unnecessary services
docker compose stop dify activepieces lobechat

# Increase Docker memory limit (Docker Desktop)
# Settings → Resources → Memory → 16GB+

# Use lighter stack
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d
```

### Issue: GPU Not Accessible (Workers)

**Symptoms:**
- "CUDA not found"
- nvidia-smi fails in container

**Solutions:**
```bash
# Verify GPU on host
nvidia-smi

# Check NVIDIA Container Toolkit
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Verify runtime in compose
cat configs/docker-compose.worker1.yml | grep runtime

# Restart Docker with GPU support
sudo systemctl restart docker

# Check daemon config
cat /etc/docker/daemon.json
```

### Issue: Slow Performance

**Symptoms:**
- Services slow to respond
- High CPU/memory usage

**Solutions:**
```bash
# Identify bottleneck
docker stats

# Optimize PostgreSQL (add to compose)
environment:
  - POSTGRES_SHARED_BUFFERS=2GB
  - POSTGRES_WORK_MEM=64MB

# Use named volumes (faster than bind mounts)
volumes:
  - postgres_data:/var/lib/postgresql/data

# Reduce log verbosity
environment:
  - LOG_LEVEL=INFO  # Instead of DEBUG

# Use production mode
docker compose -f infra/docker/docker-compose.prod.yml up -d
```

---

## Additional Resources

### Documentation
- Main README: `infra/docker/README.md`
- Usage Guide: `infra/docker/USAGE-GUIDE.md`
- Environment Variables: `docs/operations/ENV-VARIABLE-GUIDE.md`
- Consolidation Report: `docs/operations/CONSOLIDATION-COMPLETE.md`

### Scripts
- Health Check: `infra/docker/health-check.sh`
- View Logs: `infra/docker/logs-all.sh`
- Start Stack: `infra/docker/start-full-stack.sh`
- Stop Stack: `infra/docker/stop-all.sh`

### Architecture
- 4-PC Architecture: `docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`
- Service Architecture: `docs/architecture/`

---

**Version**: 1.0.0
**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
