# Docker Quick Reference

**Version**: 1.0.0
**Date**: January 18, 2026
**Canonical Location**: `infra/docker/`

## Quick Start Commands

### Orchestrator PC (PC1)

```bash
# Minimal stack
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d

# With monitoring
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.monitoring.yml \
  up -d

# Full stack (all services)
docker compose -f infra/docker/docker-compose.full.yml up -d

# Development mode
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d

# Production mode (with Infisical)
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="prod" --path="/shared" -- \
  docker compose -f infra/docker/docker-compose.yml \
    -f infra/docker/docker-compose.orchestration.yml \
    -f infra/docker/docker-compose.prod.yml \
    up -d
```

### Worker PCs (PC2/PC3/PC4)

```bash
# Worker 1 (PC2 - RTX 4090)
docker compose -f configs/docker-compose.worker1.yml up -d

# Worker 2 (PC3 - RTX 4090)
docker compose -f configs/docker-compose.worker2.yml up -d

# Worker 3 (PC4 - RTX 4090)
docker compose -f configs/docker-compose.worker3.yml up -d
```

---

## Common Commands

### Lifecycle Management

```bash
# Start services
docker compose up -d

# Stop services (graceful)
docker compose stop

# Stop and remove containers
docker compose down

# Stop and remove volumes (⚠️ DATA LOSS)
docker compose down -v

# Restart service
docker compose restart <service-name>

# Restart all
docker compose restart

# Force recreate
docker compose up -d --force-recreate <service-name>
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
docker compose logs --since 2026-01-18T10:00:00

# Save to file
docker compose logs > logs.txt
```

### Health & Status

```bash
# Service status
docker compose ps

# Health check format
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Resource usage
docker stats

# Disk usage
docker system df

# Detailed disk usage
docker system df -v
```

### Service Management

```bash
# Scale service
docker compose up -d --scale worker=3

# Update service
docker compose up -d --no-deps --build <service-name>

# Pull latest images
docker compose pull

# Build images
docker compose build

# Exec into container
docker compose exec <service-name> sh
```

---

## Port Reference

| Service | HTTP Port | MCP Port | Purpose |
|---------|-----------|----------|---------|
| PostgreSQL | 5432 | - | Primary database |
| Redis | 6379 | - | Cache & sessions |
| FalkorDB | 6380 | - | Graph database |
| Qdrant | 6333 | 6334 | Vector database |
| Claude Flow | 9000 | - | Orchestration |
| Archon OS | 9001 | 9002 | Agent OS |
| **Nexus Router** | **8000** | **4001** | **LLM routing & MCP** |
| Letta | 8283 | 8284 | Agent memory |
| Open-WebUI | 3210 | - | Chat interface |
| LobeChat | 3211 | - | Alt interface |
| Dify | 3001 | - | AI app builder |
| TwentyCRM | 3010 | - | CRM interface |
| n8n | 5678 | - | Workflow automation |
| Grafana | 3000 | - | Monitoring |
| Prometheus | 9090 | - | Metrics |
| Loki | 3100 | - | Logs |

---

## Compose File Reference

| File | Purpose | Use Case |
|------|---------|----------|
| `docker-compose.yml` | Base infrastructure | Always required first |
| `docker-compose.orchestration.yml` | Orchestration services | Orchestrator PC |
| `docker-compose.services.yml` | 14 microservices | Optional add-ons |
| `docker-compose.monitoring.yml` | Prometheus + Grafana | Production monitoring |
| `docker-compose.observability.yml` | Loki + Tempo | Advanced logging |
| `docker-compose.ui.yml` | User interfaces | Chat UIs |
| `docker-compose.dev.yml` | Development overrides | Local development |
| `docker-compose.prod.yml` | Production overrides | Production deployment |
| `docker-compose.full.yml` | Complete stack | All-in-one |
| `docker-compose.mcp.yml` | MCP servers (prod) | MCP integration |
| `docker-compose.mcp-dev.yml` | MCP servers (dev) | MCP development |

---

## Service Connection Strings

### PostgreSQL

```bash
# Connection string
postgresql://nyra_user:password@postgresql:5432/nyra_db

# Environment variable
DATABASE_URL=postgresql://nyra_user:password@postgresql:5432/nyra_db

# Test connection
docker exec nyra-postgres-dev psql -U nyra_user -d nyra_db -c "SELECT 1;"
```

### Redis

```bash
# Connection string
redis://:password@redis:6379

# Environment variable
REDIS_URL=redis://:password@redis:6379

# Test connection
docker exec nyra-redis-dev redis-cli ping
```

### Nexus Router (LLM Routing)

```bash
# OpenAI-compatible endpoint
OPENAI_API_BASE_URL=http://nexus-router:8000/v1

# MCP gateway
MCP_GATEWAY_URL=http://nexus-router:4001/mcp

# Health check
curl http://localhost:8000/health
curl http://localhost:4001/mcp/health
```

### Qdrant

```bash
# Connection URL
QDRANT_URL=http://qdrant:6333

# Test connection
curl http://localhost:6333/health
```

---

## Health Checks

### Quick Health Check

```bash
cd infra/docker
./health-check.sh
```

### Manual Health Checks

```bash
# PostgreSQL
docker exec nyra-postgres-dev pg_isready -U nyra_user

# Redis
docker exec nyra-redis-dev redis-cli ping

# FalkorDB
docker exec nyra-falkordb-dev redis-cli -a password ping

# Qdrant
curl http://localhost:6333/health

# Nexus Router
curl http://localhost:8000/health

# Nexus Router MCP
curl http://localhost:4001/mcp/health

# Claude Flow
curl http://localhost:9000/health

# Grafana
curl http://localhost:3000/api/health

# Prometheus
curl http://localhost:9090/-/healthy
```

---

## Backup & Restore

### Backup

```bash
# Backup PostgreSQL
docker exec nyra-postgres-dev pg_dumpall -U postgres > backup.sql

# Backup volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup_$(date +%Y%m%d).tar.gz -C /data .

# Backup .env
cp .env .env.backup_$(date +%Y%m%d)
```

### Restore

```bash
# Restore PostgreSQL
cat backup.sql | docker exec -i nyra-postgres-dev psql -U postgres

# Restore volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup_20260118.tar.gz -C /data

# Restore .env
cp .env.backup_20260118 .env
```

---

## Environment Variables

### Critical Variables

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENROUTER_API_KEY=sk-or-xxx

# Database
POSTGRES_USER=nyra_user
POSTGRES_PASSWORD=<strong-password>
POSTGRES_DB=nyra_db

# Redis
REDIS_PASSWORD=<strong-password>

# Security
SESSION_SECRET=<random-secret>

# GPU Workers
WORKER_5090_URL=http://192.168.1.101:8001
WORKER_3090_URL=http://192.168.1.102:8002
WORKER_3060_URL=http://192.168.1.103:8003

# Nexus Router
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true
```

### Environment File Locations

```bash
# Main environment
.env                                    # Root (gitignored)
.env.example                            # Root template
infra/docker/.env.example               # Docker template

# PC-specific
configs/.env.orchestrator               # PC1
configs/.env.worker1                    # PC2
configs/.env.worker2                    # PC3
configs/.env.worker3                    # PC4
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check port conflicts
netstat -ano | findstr :8000    # Windows
lsof -i :8000                   # Linux

# Check logs
docker compose logs <service-name>

# Check resources
docker system df
df -h

# Clean up
docker compose down
docker system prune -f
docker volume prune -f

# Restart Docker
sudo systemctl restart docker   # Linux
# Restart Docker Desktop         # Windows
```

### Database Issues

```bash
# Check status
docker compose ps postgresql

# View logs
docker compose logs postgresql

# Test connection
docker exec nyra-postgres-dev psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Reset database (⚠️ DATA LOSS)
docker compose down -v
docker compose up -d postgresql
```

### Network Issues

```bash
# List networks
docker network ls

# Inspect network
docker network inspect nyra-network

# Test connectivity
docker exec nyra-archon-os-dev ping postgres

# Recreate network
docker network rm nyra-network
docker network create nyra-network

# Restart services
docker compose up -d
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check disk I/O
iostat -x 1

# Check memory
free -h

# Optimize PostgreSQL
# Edit docker-compose.yml:
environment:
  - POSTGRES_SHARED_BUFFERS=2GB
  - POSTGRES_WORK_MEM=64MB

# Restart
docker compose restart postgresql
```

---

## Monitoring URLs

```bash
# Grafana
http://localhost:3000
# Username: admin
# Password: admin (dev) or from Infisical (prod)

# Prometheus
http://localhost:9090

# Loki (via Grafana)
http://localhost:3000/explore

# cAdvisor
http://localhost:8080

# Nexus Router Health
http://localhost:8000/health

# Nexus Router MCP Health
http://localhost:4001/mcp/health
```

---

## Useful Scripts

### Location: `infra/docker/`

```bash
# Start full stack
./start-full-stack.sh [dev|full|prod]

# Stop all services
./stop-all.sh [--backup|--clean|--prune]

# View logs
./logs-all.sh [-f|--tail=N|--grep=PATTERN]

# Health check
./health-check.sh [--detailed|--watch|--json]
```

### Usage Examples

```bash
# Start development stack
cd infra/docker
./start-full-stack.sh dev

# Stop with backup
./stop-all.sh --backup

# Follow logs with filter
./logs-all.sh -f --grep ERROR

# Watch health status
./health-check.sh --watch
```

---

## Docker Cleanup

### Safe Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes (⚠️ Check first)
docker volume ls
docker volume prune -f

# Remove unused networks
docker network prune -f

# Full cleanup (⚠️ DANGER)
docker system prune -a --volumes -f
```

### Selective Cleanup

```bash
# Remove specific service volumes
docker volume rm postgres_dev_data redis_dev_data

# Remove old images
docker images --filter "dangling=true" -q | xargs docker rmi

# Clean build cache
docker builder prune -a -f
```

---

## Development Workflow

### Local Development

```bash
# 1. Start dev stack
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.dev.yml \
  up -d

# 2. Watch logs
docker compose logs -f

# 3. Make code changes (hot reload enabled)

# 4. Test changes
curl http://localhost:8000/health

# 5. Debug (attach to port 9229)
# VS Code: F5 with "Attach to Node" configuration

# 6. Stop when done
docker compose down
```

### Testing Changes

```bash
# Rebuild specific service
docker compose up -d --no-deps --build nexus-router

# Run tests
docker compose exec nexus-router npm test

# Integration tests
./run-integration-tests.sh

# Benchmark
./scripts/benchmark.sh
```

---

## Production Deployment

### Initial Deployment

```bash
# 1. Configure Infisical
infisical login
infisical secrets upload --env prod --path /nyra/orchestrator

# 2. Start production stack
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="prod" --path="/shared" -- \
  docker compose -f infra/docker/docker-compose.yml \
    -f infra/docker/docker-compose.orchestration.yml \
    -f infra/docker/docker-compose.monitoring.yml \
    -f infra/docker/docker-compose.prod.yml \
    up -d

# 3. Verify health
./health-check.sh --detailed

# 4. Monitor
http://localhost:3000  # Grafana
```

### Rolling Updates

```bash
# 1. Pull latest images
docker compose pull

# 2. Update services one by one
docker compose up -d --no-deps nexus-router
sleep 30
docker compose up -d --no-deps archon-os
sleep 30

# 3. Verify health after each
./health-check.sh
```

---

## Emergency Procedures

### Emergency Stop

```bash
# Graceful stop
docker compose stop

# Force stop
docker compose kill

# Nuclear option
docker stop $(docker ps -aq --filter "name=nyra-*")
```

### Emergency Rollback

```bash
# Stop current version
docker compose down

# Checkout previous version
git checkout HEAD~1

# Start previous version
docker compose up -d

# Verify
./health-check.sh
```

### Emergency Debug

```bash
# Get shell in container
docker compose exec <service-name> sh

# Check processes
docker compose top

# Check environment
docker compose exec <service-name> env

# Check networks
docker network inspect nyra-network

# Check volumes
docker volume inspect postgres_data
```

---

## Cheat Sheet Summary

```bash
# Start orchestrator
docker compose -f infra/docker/docker-compose.full.yml up -d

# Start worker
docker compose -f configs/docker-compose.worker1.yml up -d

# Health check
./health-check.sh

# View logs
docker compose logs -f

# Restart service
docker compose restart nexus-router

# Stop all
docker compose down

# Backup
docker exec nyra-postgres-dev pg_dumpall -U postgres > backup.sql

# Restore
cat backup.sql | docker exec -i nyra-postgres-dev psql -U postgres
```

---

## Documentation Links

- **Main README**: `infra/docker/README.md`
- **Usage Guide**: `infra/docker/USAGE-GUIDE.md`
- **Consolidation Guide**: `docs/operations/DOCKER-CONSOLIDATION-GUIDE.md`
- **Migration Guide**: `docs/guides/DOCKER-MIGRATION-GUIDE.md`
- **Nexus Router Integration**: `docs/guides/NEXUS-ROUTER-INTEGRATION-GUIDE.md`
- **Environment Variables**: `docs/operations/ENV-VARIABLE-GUIDE.md`
- **4-PC Architecture**: `docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md`

---

**Version**: 1.0.0
**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
**Quick Access**: Keep this file bookmarked for rapid reference
