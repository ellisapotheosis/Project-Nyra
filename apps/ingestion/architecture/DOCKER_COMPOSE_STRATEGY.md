# Project-Nyra Docker Compose Orchestration Strategy

## Overview

This document outlines the Docker Compose strategy for deploying Project-Nyra's distributed infrastructure across 4 PCs. Each node runs its own Docker Compose stack, with services coordinated via Tailscale mesh networking.

## Architecture Philosophy

### Design Principles

1. **Single-Responsibility Per Stack**: Each PC has a focused compose file for its specific role
2. **Network-First Design**: Services communicate via Tailscale overlay, not Docker Swarm
3. **Declarative Configuration**: All settings in compose files and environment variables
4. **GPU Isolation**: One GPU service per container (no GPU sharing)
5. **Health-First**: Every service has health checks and restart policies
6. **Secrets Management**: Use Docker secrets or environment files (never hardcode)

### Why Not Docker Swarm?

**Rationale for Standalone Compose**:
- **Simplicity**: No Swarm manager overhead, easier debugging
- **GPU Support**: Better NVIDIA GPU passthrough in standalone mode
- **Network Flexibility**: Tailscale provides better mesh networking than Swarm overlay
- **Laptop Disconnection**: Swarm expects always-on nodes, conflicts with laptop use case
- **Resource Control**: Explicit resource limits per PC

**Future Migration Path**:
- If scaling beyond 10 nodes → Consider Kubernetes (k3s)
- If need rolling updates → Add orchestration layer (Archon handles this)

## Docker Compose Strategy Matrix

```mermaid
graph TB
    subgraph "Deployment Strategy"
        A[orchestrator-mini<br/>Always-On<br/>Compose: Core Services]
        B[worker-rtx3090ti<br/>Always-On<br/>Compose: Primary GPU]
        C[worker-rtx3060<br/>Disconnectable<br/>Compose: Secondary GPU]
        D[worker-rtx5090<br/>Disconnectable<br/>Compose: High-Perf GPU]
    end

    subgraph "Orchestration Layer"
        E[Archon Coordinator<br/>Service Discovery<br/>Health Monitoring]
    end

    subgraph "Shared State"
        F[Redis<br/>Service Registry]
        G[PostgreSQL<br/>Configuration DB]
        H[MinIO<br/>Model Storage]
    end

    A --> E
    B --> E
    C --> E
    D --> E

    E --> F
    E --> G
    E --> H

    style A fill:#e1f5ff,stroke:#0066cc,stroke-width:3px
    style B fill:#e1ffe1,stroke:#00cc66,stroke-width:3px
    style C fill:#fff4e1,stroke:#ff9900,stroke-width:2px
    style D fill:#ffe1f5,stroke:#cc0099,stroke-width:2px
```

## Network Architecture

### Docker Networks

**Per-Node Networks**:
- Each PC creates bridge networks for local container communication
- No Docker overlay networks (Tailscale handles inter-node routing)
- Services bind to `0.0.0.0` to accept Tailscale traffic

**Network Naming Convention**:
```
orchestrator-mini:
  - nyra-core-net      (Nexus, Archon, MCP, monitoring)
  - nyra-data-net      (PostgreSQL, Redis, MinIO)

worker-rtx3060:
  - nyra-gpu-net       (Ollama, Open-WebUI)

worker-rtx5090:
  - nyra-gpu-net       (Ollama, vLLM, LobeChat)

worker-rtx3090ti:
  - nyra-gpu-net       (Ollama, vLLM, training)
```

### Service Discovery

**Tailscale MagicDNS**:
- Services reference each other via Tailscale hostnames
- Example: `postgresql://nyra-orchestrator.tail-scale.ts.net:5432`

**Redis Service Registry**:
```
# Workers register on startup
HSET nyra:worker:rtx3090ti hostname "nyra-worker-primary.tail-scale.ts.net"
HSET nyra:worker:rtx3090ti ollama_port 11434
HSET nyra:worker:rtx3090ti vllm_port 8000
HSET nyra:worker:rtx3090ti status "online"
```

## Volume Management

### Volume Strategy

**Local Volumes** (Docker-managed):
- Pros: Automatic cleanup, Docker lifecycle management
- Cons: Tied to specific host
- Use for: Logs, caches, temporary data

**Bind Mounts** (Host directories):
- Pros: Easy access for debugging, survives container removal
- Cons: Permission issues, manual cleanup
- Use for: Model storage, persistent databases, configuration

### Volume Naming Convention

```
# Docker volumes (managed)
nyra-postgres-data       # PostgreSQL data directory
nyra-redis-data          # Redis RDB/AOF files
nyra-minio-data          # MinIO object storage
nyra-prometheus-data     # Prometheus time-series DB

# Bind mounts (host paths)
/opt/nyra/models         # Shared model storage
/opt/nyra/config         # Configuration files
/opt/nyra/logs           # Centralized logs
/var/nyra/backups        # Database backups
```

### Volume Backup Strategy

**PostgreSQL**:
```bash
# Automated backup via pg_dump
docker exec nyra-postgres pg_dump -U postgres nyra | gzip > /var/nyra/backups/postgres-$(date +%Y%m%d).sql.gz
```

**Redis**:
```bash
# Copy RDB snapshot
docker exec nyra-redis redis-cli --rdb /data/dump.rdb SAVE
docker cp nyra-redis:/data/dump.rdb /var/nyra/backups/redis-$(date +%Y%m%d).rdb
```

**MinIO**:
```bash
# Use MinIO client for bucket sync
mc mirror minio/nyra-models /var/nyra/backups/minio/
```

## Environment Management

### Environment File Structure

```
/opt/nyra/
├── .env.orchestrator        # orchestrator-mini secrets
├── .env.worker-common       # Common worker settings
├── .env.worker-rtx3060      # RTX3060-specific settings
├── .env.worker-rtx5090      # RTX5090-specific settings
├── .env.worker-rtx3090ti    # RTX3090ti-specific settings
└── secrets/
    ├── postgres-password
    ├── redis-password
    ├── minio-root-password
    └── jwt-secret
```

### Environment Variables

**orchestrator-mini** (`.env.orchestrator`):
```bash
# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD_FILE=/run/secrets/postgres-password
POSTGRES_DB=nyra

# Redis
REDIS_PASSWORD_FILE=/run/secrets/redis-password

# MinIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD_FILE=/run/secrets/minio-root-password

# Nexus Router
NEXUS_JWT_SECRET_FILE=/run/secrets/jwt-secret
NEXUS_REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379

# Archon Coordinator
ARCHON_REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379
ARCHON_POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/nyra

# Tailscale
TAILSCALE_HOSTNAME=nyra-orchestrator
TAILSCALE_AUTH_KEY=tskey-auth-XXXXXXXXXXXX
```

**Worker Common** (`.env.worker-common`):
```bash
# Shared settings for all workers
ORCHESTRATOR_REDIS_URL=redis://:${REDIS_PASSWORD}@nyra-orchestrator.tail-scale.ts.net:6379
ORCHESTRATOR_POSTGRES_URL=postgresql://postgres:${POSTGRES_PASSWORD}@nyra-orchestrator.tail-scale.ts.net:5432/nyra
MINIO_ENDPOINT=nyra-orchestrator.tail-scale.ts.net:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY_FILE=/run/secrets/minio-root-password

# Ollama settings
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=/models
OLLAMA_KEEP_ALIVE=5m
OLLAMA_NUM_PARALLEL=4

# GPU settings
NVIDIA_VISIBLE_DEVICES=all
NVIDIA_DRIVER_CAPABILITIES=compute,utility
```

**worker-rtx3090ti** (`.env.worker-rtx3090ti`):
```bash
# Specific to RTX 3090 Ti
WORKER_NAME=worker-rtx3090ti
WORKER_GPU_MODEL=RTX3090Ti
WORKER_GPU_VRAM_MB=24576
WORKER_PRIORITY=1
WORKER_ALWAYS_ON=true

TAILSCALE_HOSTNAME=nyra-worker-primary
TAILSCALE_AUTH_KEY=tskey-auth-XXXXXXXXXXXX
```

## Service Deployment Patterns

### Pattern 1: Stateless Services (Auto-Scaling)

**Characteristics**:
- No persistent data
- Horizontal scaling possible
- Restarts are cheap

**Example**: Nexus Router
```yaml
services:
  nexus-router:
    image: nyra/nexus-router:latest
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

### Pattern 2: Stateful Services (Careful Restarts)

**Characteristics**:
- Persistent data (volumes required)
- Restart = potential data loss
- Backups essential

**Example**: PostgreSQL
```yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - nyra-postgres-data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
    secrets:
      - postgres-password
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 8G
```

### Pattern 3: GPU Services (Resource Exclusivity)

**Characteristics**:
- Requires NVIDIA runtime
- One GPU per container (no sharing)
- VRAM limits enforced

**Example**: Ollama
```yaml
services:
  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    runtime: nvidia
    environment:
      NVIDIA_VISIBLE_DEVICES: 0
      OLLAMA_HOST: 0.0.0.0:11434
    volumes:
      - /opt/nyra/models:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

## Deployment Workflow

### Initial Setup (One-Time)

**1. Prepare Directories**:
```bash
# Run on each node
sudo mkdir -p /opt/nyra/{models,config,logs}
sudo mkdir -p /var/nyra/backups
sudo chown -R $(whoami):$(whoami) /opt/nyra /var/nyra
```

**2. Create Secrets**:
```bash
# Generate random secrets
openssl rand -base64 32 > /opt/nyra/secrets/postgres-password
openssl rand -base64 32 > /opt/nyra/secrets/redis-password
openssl rand -base64 64 > /opt/nyra/secrets/jwt-secret
openssl rand -base64 32 > /opt/nyra/secrets/minio-root-password

# Secure permissions
chmod 600 /opt/nyra/secrets/*
```

**3. Install Tailscale**:
```bash
# Install on all nodes
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --advertise-tags=tag:nyra-node
```

**4. Deploy orchestrator-mini** (First):
```bash
cd /opt/nyra/orchestrator-mini
docker compose up -d

# Wait for services to be healthy
docker compose ps
docker compose logs -f
```

**5. Deploy Workers**:
```bash
# RTX 3090 Ti (primary worker)
cd /opt/nyra/worker-rtx3090ti
docker compose up -d

# RTX 3060 (when laptop available)
cd /opt/nyra/worker-rtx3060
docker compose up -d

# RTX 5090 (when laptop available)
cd /opt/nyra/worker-rtx5090
docker compose up -d
```

### Daily Operations

**Start All Services**:
```bash
# orchestrator-mini
cd /opt/nyra/orchestrator-mini && docker compose up -d

# Primary worker
cd /opt/nyra/worker-rtx3090ti && docker compose up -d
```

**Stop Disconnectable Worker** (Laptop):
```bash
# Graceful shutdown (allows Archon to detect and redistribute tasks)
cd /opt/nyra/worker-rtx3060
docker compose down

# Laptop can now be disconnected
```

**Check Service Health**:
```bash
# All services on current node
docker compose ps

# Specific service logs
docker compose logs -f archon-coordinator

# Health check all nodes (from orchestrator-mini)
curl http://nyra-orchestrator.tail-scale.ts.net:8080/health
curl http://nyra-worker-primary.tail-scale.ts.net:11434
```

### Update/Rollback

**Update Single Service**:
```bash
# Pull new image
docker compose pull nexus-router

# Recreate container (keeps volumes)
docker compose up -d nexus-router

# Verify health
docker compose ps nexus-router
docker compose logs -f nexus-router
```

**Rollback**:
```bash
# Edit docker-compose.yml to previous image tag
# nexus-router:
#   image: nyra/nexus-router:v1.2.0  # was v1.3.0

# Recreate with old image
docker compose up -d nexus-router
```

**Zero-Downtime Updates** (for redundant services):
```bash
# Update workers one at a time
# 1. Update RTX3060 (Archon redistributes traffic to others)
cd /opt/nyra/worker-rtx3060
docker compose pull && docker compose up -d

# Wait for health check to pass
sleep 30

# 2. Update RTX5090
cd /opt/nyra/worker-rtx5090
docker compose pull && docker compose up -d

# 3. Update primary worker (last)
cd /opt/nyra/worker-rtx3090ti
docker compose pull && docker compose up -d
```

## Monitoring & Observability

### Logging Strategy

**Centralized Logging** (Optional: Loki + Promtail):
```yaml
# Add to each compose file
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/log:/var/log:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - ./promtail-config.yaml:/etc/promtail/config.yaml
    command: -config.file=/etc/promtail/config.yaml
```

**Local Logging** (Default):
```bash
# View logs with timestamps
docker compose logs -f --timestamps

# Follow specific service
docker compose logs -f ollama

# Search logs
docker compose logs | grep ERROR

# Export logs to file
docker compose logs > /var/nyra/logs/compose-$(date +%Y%m%d).log
```

### Metrics Exposure

**Prometheus Scraping**:
```yaml
# Each service exposes /metrics endpoint
services:
  nexus-router:
    ports:
      - "8080:8080"  # Main API
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]

# Prometheus scrapes via Tailscale
scrape_configs:
  - job_name: 'nexus-router'
    static_configs:
      - targets: ['nyra-orchestrator.tail-scale.ts.net:8080']
```

## Security Hardening

### Container Security

**1. Non-Root Users**:
```yaml
services:
  nexus-router:
    user: "1000:1000"  # Run as non-root
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE  # Only if binding to port <1024
```

**2. Read-Only Filesystems**:
```yaml
services:
  nexus-router:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

**3. Network Isolation**:
```yaml
networks:
  nyra-core-net:
    driver: bridge
    internal: false  # Allow external Tailscale access
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Secrets Management

**Docker Secrets** (Recommended):
```yaml
secrets:
  postgres-password:
    file: /opt/nyra/secrets/postgres-password
  redis-password:
    file: /opt/nyra/secrets/redis-password

services:
  postgres:
    secrets:
      - postgres-password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres-password
```

**Environment Files** (Alternative):
```yaml
services:
  nexus-router:
    env_file:
      - .env.orchestrator
      - .env.secrets  # gitignored
```

## Disaster Recovery

### Backup Automation

**Automated Backup Script** (`/usr/local/bin/nyra-backup.sh`):
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/nyra/backups"
DATE=$(date +%Y%m%d-%H%M%S)

# PostgreSQL
docker exec nyra-postgres pg_dump -U postgres nyra | \
  gzip > "$BACKUP_DIR/postgres-$DATE.sql.gz"

# Redis
docker exec nyra-redis redis-cli --rdb /tmp/dump.rdb SAVE
docker cp nyra-redis:/tmp/dump.rdb "$BACKUP_DIR/redis-$DATE.rdb"

# MinIO (models)
docker exec nyra-minio mc mirror /data/nyra-models "$BACKUP_DIR/minio-$DATE/"

# Compose files and configs
tar czf "$BACKUP_DIR/config-$DATE.tar.gz" /opt/nyra/

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Cron Schedule** (Daily 3 AM):
```bash
0 3 * * * /usr/local/bin/nyra-backup.sh >> /var/log/nyra-backup.log 2>&1
```

### Restore Procedure

**1. Restore PostgreSQL**:
```bash
gunzip < /var/nyra/backups/postgres-20250115.sql.gz | \
  docker exec -i nyra-postgres psql -U postgres nyra
```

**2. Restore Redis**:
```bash
docker cp /var/nyra/backups/redis-20250115.rdb nyra-redis:/data/dump.rdb
docker restart nyra-redis
```

**3. Restore MinIO**:
```bash
docker exec nyra-minio mc mirror /backups/minio-20250115/ /data/nyra-models/
```

## Troubleshooting

### Common Issues

**Issue 1: Container Won't Start**
```bash
# Check logs
docker compose logs <service-name>

# Check resource constraints
docker stats

# Check disk space
df -h /var/lib/docker

# Recreate container
docker compose up -d --force-recreate <service-name>
```

**Issue 2: GPU Not Detected**
```bash
# Verify NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Check NVIDIA Container Toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Verify in compose
docker compose exec ollama nvidia-smi
```

**Issue 3: Network Connectivity**
```bash
# Test Tailscale connectivity
tailscale status
tailscale ping nyra-orchestrator

# Test service reachability
docker compose exec nexus-router curl http://nyra-orchestrator.tail-scale.ts.net:5432

# Check DNS resolution
docker compose exec nexus-router nslookup nyra-orchestrator.tail-scale.ts.net
```

**Issue 4: Service Unhealthy**
```bash
# Check health check definition
docker inspect nyra-postgres | jq '.[0].State.Health'

# Manually run health check
docker compose exec postgres pg_isready -U postgres

# Restart unhealthy service
docker compose restart postgres
```

## Performance Optimization

### Resource Tuning

**PostgreSQL**:
```yaml
services:
  postgres:
    command: >
      postgres
        -c shared_buffers=2GB
        -c effective_cache_size=6GB
        -c maintenance_work_mem=512MB
        -c checkpoint_completion_target=0.9
        -c wal_buffers=16MB
        -c default_statistics_target=100
        -c random_page_cost=1.1
        -c effective_io_concurrency=200
```

**Redis**:
```yaml
services:
  redis:
    command: >
      redis-server
        --maxmemory 16gb
        --maxmemory-policy allkeys-lru
        --save 900 1
        --save 300 10
        --save 60 10000
        --appendonly yes
```

**Ollama** (VRAM optimization):
```yaml
services:
  ollama:
    environment:
      OLLAMA_NUM_PARALLEL: 4           # Max concurrent requests
      OLLAMA_MAX_LOADED_MODELS: 2      # Max models in VRAM
      OLLAMA_KEEP_ALIVE: 5m            # Keep model loaded for 5 min
```

## Conclusion

This Docker Compose strategy provides:
- **Simplicity**: Standalone compose (no Swarm complexity)
- **Flexibility**: Per-node configuration for heterogeneous hardware
- **Reliability**: Health checks, restart policies, automatic failover
- **Maintainability**: Clear file structure, environment management
- **Security**: Secrets management, network isolation, non-root users
- **Scalability**: Easy addition of new worker nodes

The architecture leverages Tailscale for networking and Archon for orchestration, allowing Docker Compose to focus on local container management while maintaining a distributed system architecture.
