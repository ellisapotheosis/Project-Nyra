# Docker Migration Guide

**Version**: 1.0.0
**Date**: January 18, 2026
**From**: Scattered Docker configs
**To**: Consolidated infra/docker structure

## Overview

This guide helps you migrate from the old scattered Docker configuration to the new consolidated structure in `infra/docker/`. Follow this step-by-step guide to ensure a smooth transition with zero downtime.

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [What Changed](#what-changed)
3. [Migration Path Selection](#migration-path-selection)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Validation and Testing](#validation-and-testing)
6. [Rollback Procedure](#rollback-procedure)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Migration Checklist

Before starting migration, ensure you have:

### Required

- [ ] **Git access** - Repository cloned and up to date
- [ ] **Docker installed** - Version 24.0+ with Compose V2
- [ ] **Backup strategy** - Read and understand backup procedures
- [ ] **Downtime window** - 15-30 minutes for orchestrator
- [ ] **Admin access** - Credentials for all services

### Recommended

- [ ] **Test environment** - Separate environment for testing
- [ ] **Documentation review** - Read CONSOLIDATION-COMPLETE.md
- [ ] **Team notification** - Inform team of migration window
- [ ] **Monitoring setup** - Grafana/Prometheus available
- [ ] **Rollback plan** - Team knows rollback procedures

### Verification Commands

```bash
# Check Docker version
docker --version
# Should be: Docker version 24.0.0 or higher

# Check Docker Compose version
docker compose version
# Should be: Docker Compose version v2.20.0 or higher

# Check git status
git status
# Should be: On branch main, clean working tree

# Check disk space (need at least 50GB free)
df -h
```

---

## What Changed

### File Structure Changes

#### Before: Scattered Configuration

```
Project-Nyra/
├── orchestration/
│   ├── claude-flow/
│   │   └── docker-compose.yml              # Claude Flow config
│   ├── archon-os/
│   │   └── docker-compose.yml              # Archon OS config
│   └── serena/
│       └── docker-compose.yml              # Serena config
├── services/
│   ├── memory/
│   │   └── deployment/
│   │       ├── docker-compose.memory.yml   # Memory config
│   │       └── docker-compose.model.yml    # Model config
│   ├── nexus-router/
│   │   └── docker-compose.yml              # Nexus config
│   └── litellm-proxy/
│       └── docker-compose.yml              # LiteLLM config
├── infra/
│   ├── docker-compose.dev.yml              # Dev infrastructure
│   ├── docker-compose.nexus-mcp.yml        # MCP config
│   └── docker-compose.orchestrator.yml     # Orchestrator config
└── configs/
    ├── docker-compose.orchestrator.yml     # PC1 config
    ├── docker-compose.worker1.yml          # PC2 config
    ├── docker-compose.worker2.yml          # PC3 config
    └── docker-compose.worker3.yml          # PC4 config
```

**Issues:**
- 202 compose files scattered across repository
- Duplicate service definitions
- No clear dependencies
- Manual service discovery
- Inconsistent naming
- No unified management

#### After: Consolidated Structure

```
Project-Nyra/
├── infra/docker/                           # ⭐ CANONICAL LOCATION
│   ├── docker-compose.yml                  # Base infrastructure
│   ├── docker-compose.orchestration.yml    # All orchestration
│   ├── docker-compose.services.yml         # All microservices
│   ├── docker-compose.monitoring.yml       # Monitoring stack
│   ├── docker-compose.dev.yml              # Dev overrides
│   ├── docker-compose.prod.yml             # Prod overrides
│   ├── docker-compose.full.yml             # Complete stack
│   └── [10 more modular compose files]
└── configs/                                # PC-specific only
    ├── docker-compose.orchestrator.yml     # PC1 (unchanged)
    ├── docker-compose.worker1.yml          # PC2 (unchanged)
    ├── docker-compose.worker2.yml          # PC3 (unchanged)
    └── docker-compose.worker3.yml          # PC4 (unchanged)
```

**Benefits:**
- Single canonical location: `infra/docker/`
- Modular compose files by function
- Clear service dependencies
- Automatic service discovery via Docker DNS
- Consistent naming conventions
- Unified management scripts

### Service Name Changes

**Container naming convention:**

| Environment | Old Name | New Name |
|-------------|----------|----------|
| Development | `nyra-postgres` | `nyra-postgres-dev` |
| Production | `nyra-postgres` | `nyra-postgres-prod` |
| Development | `nyra-claude-flow` | `nyra-claude-flow-dev` |
| Production | `nyra-claude-flow` | `nyra-claude-flow-prod` |

**Benefit:** Clear environment separation, no name conflicts

### Network Changes

**Before:**
```yaml
networks:
  nyra-network:
    driver: bridge
  orchestration-network:
    driver: bridge
  services-network:
    driver: bridge
```

**After:**
```yaml
networks:
  nyra-network:                   # Single unified network
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

**Benefit:** Simplified networking, automatic service discovery

### Port Assignment Changes

**Standardized port assignments:**

| Service | Old Port(s) | New Port | MCP Port |
|---------|-------------|----------|----------|
| PostgreSQL | 5432 (varied) | 5432 | - |
| Redis | 6379 (varied) | 6379 | - |
| Claude Flow | 8080, 9000 | 9000 | - |
| Archon OS | 9001 | 9001 | 9002 |
| Nexus Router | 7000, 8000 | 8000 | 4001 |
| Letta | 8283 | 8283 | 8284 |

**Benefit:** Consistent port assignments, no conflicts

### Environment Variable Changes

**Consolidated into single `.env.example`:**

**Before:**
- 50+ scattered .env files
- Duplicate variable definitions
- No clear source of truth

**After:**
- Single master `.env.example` (306 lines)
- Clear variable categories
- Infisical integration for production
- 4 PC-specific overrides in `configs/`

**New variables:**
```bash
# New Nexus Router variables
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true

# New worker configuration
WORKER_5090_URL=http://localhost:8001
WORKER_3090_URL=http://localhost:8002
WORKER_3060_URL=http://localhost:8003
```

---

## Migration Path Selection

Choose the migration path that fits your situation:

### Path A: Green-Field Migration (Recommended)

**Best for:**
- New deployments
- Test environments
- Non-critical systems

**Characteristics:**
- Fresh start with new structure
- No data migration needed
- Fastest migration (< 15 minutes)
- Low risk

**Downtime:** Minimal (5-10 minutes)

**Proceed to:** [Path A: Green-Field Migration](#path-a-green-field-migration)

---

### Path B: In-Place Migration with Data Preservation

**Best for:**
- Production systems
- Existing deployments with data
- Critical services requiring data retention

**Characteristics:**
- Migrates existing data
- Preserves database contents
- Maintains service continuity
- Medium complexity

**Downtime:** Moderate (15-30 minutes)

**Proceed to:** [Path B: In-Place Migration](#path-b-in-place-migration)

---

### Path C: Blue-Green Migration (Zero Downtime)

**Best for:**
- Production systems requiring zero downtime
- High-availability requirements
- Multi-PC deployments

**Characteristics:**
- No downtime
- Run both old and new in parallel
- Gradual traffic cutover
- Higher complexity

**Downtime:** None (0 minutes)

**Proceed to:** [Path C: Blue-Green Migration](#path-c-blue-green-migration)

---

## Step-by-Step Migration

### Path A: Green-Field Migration

#### Step 1: Backup Current State

```bash
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra

# Create backup directory
mkdir -p _backup/migration-$(date +%Y%m%d-%H%M%S)

# Backup current .env
cp .env _backup/migration-$(date +%Y%m%d-%H%M%S)/.env.old

# Export Docker volumes (if you want to save data)
docker run --rm -v postgres_data:/data -v $(pwd)/_backup/migration-$(date +%Y%m%d-%H%M%S):/backup \
  alpine tar czf /backup/postgres_data.tar.gz -C /data .

# Save git commit hash
git rev-parse HEAD > _backup/migration-$(date +%Y%m%d-%H%M%S)/git-commit.txt
```

#### Step 2: Stop Old Services

```bash
# Stop all running services
docker compose down

# Optional: Remove volumes for fresh start (⚠️ DATA LOSS)
docker compose down -v

# Verify all stopped
docker ps --filter "name=nyra-*"
# Should show: (no containers)
```

#### Step 3: Pull Latest Changes

```bash
# Ensure on main branch
git checkout main

# Pull latest consolidated structure
git pull origin main

# Verify new structure exists
ls -la infra/docker/
# Should show: docker-compose.yml, docker-compose.orchestration.yml, etc.
```

#### Step 4: Configure Environment

```bash
# Copy new environment template
cp infra/docker/.env.example .env

# Edit with your values
nano .env

# Required variables to set:
# - ANTHROPIC_API_KEY
# - OPENROUTER_API_KEY
# - POSTGRES_PASSWORD
# - REDIS_PASSWORD
# - SESSION_SECRET
# - All WORKER_* URLs (if using GPU workers)
```

#### Step 5: Start New Services

```bash
# Start base infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# Wait for health checks
sleep 30

# Verify base services
docker compose -f infra/docker/docker-compose.yml ps

# Start orchestration layer
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d

# Verify orchestration services
docker compose ps
```

#### Step 6: Verify Migration

```bash
# Run health check script
cd infra/docker
./health-check.sh

# Check service health
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"

# Test Nexus Router
curl http://localhost:8000/health

# Test PostgreSQL
docker exec nyra-postgres-dev psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Check logs
docker compose logs --tail=50
```

**Migration Complete!** ✅

---

### Path B: In-Place Migration

#### Step 1: Backup Everything

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Create timestamped backup directory
BACKUP_DIR="_backup/migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup .env
cp .env $BACKUP_DIR/.env.old

# Backup all Docker volumes
for volume in $(docker volume ls -q | grep nyra); do
  echo "Backing up volume: $volume"
  docker run --rm -v $volume:/data -v $(pwd)/$BACKUP_DIR:/backup \
    alpine tar czf /backup/${volume}.tar.gz -C /data .
done

# Save container list
docker ps --filter "name=nyra-*" --format "table {{.Names}}\t{{.Image}}" > $BACKUP_DIR/containers.txt

# Save git commit
git rev-parse HEAD > $BACKUP_DIR/git-commit.txt

# Save current compose files
find . -name "docker-compose*.yml" -exec cp {} $BACKUP_DIR/ \;

echo "Backup complete: $BACKUP_DIR"
```

#### Step 2: Database Dump (Critical Data Only)

```bash
# Dump PostgreSQL databases
docker exec nyra-postgres pg_dumpall -U postgres > $BACKUP_DIR/postgres_dump.sql

# Verify dump size
ls -lh $BACKUP_DIR/postgres_dump.sql

# Dump Redis (if needed)
docker exec nyra-redis redis-cli --rdb /data/dump.rdb
docker cp nyra-redis:/data/dump.rdb $BACKUP_DIR/redis_dump.rdb
```

#### Step 3: Stop Services Gracefully

```bash
# Stop services one by one (graceful)
docker compose stop claude-flow archon-os nexus-router

# Wait 30 seconds for graceful shutdown
sleep 30

# Stop remaining services
docker compose stop

# Verify all stopped
docker ps --filter "name=nyra-*"
```

#### Step 4: Rename Old Volumes (Preserve Data)

```bash
# Rename volumes to preserve data
docker volume create postgres_data_backup
docker run --rm -v postgres_data:/source -v postgres_data_backup:/dest \
  alpine sh -c "cp -av /source/. /dest/"

# Repeat for other critical volumes
docker volume create redis_data_backup
docker run --rm -v redis_data:/source -v redis_data_backup:/dest \
  alpine sh -c "cp -av /source/. /dest/"
```

#### Step 5: Pull New Structure

```bash
git checkout main
git pull origin main

# Verify new structure
ls -la infra/docker/
```

#### Step 6: Migrate Environment Variables

```bash
# Copy new template
cp infra/docker/.env.example .env

# Merge old values
# Compare and manually copy important values:
diff $BACKUP_DIR/.env.old .env

# Critical variables to preserve:
# - API keys (ANTHROPIC_API_KEY, OPENROUTER_API_KEY)
# - Database passwords (POSTGRES_PASSWORD, REDIS_PASSWORD)
# - Service secrets (SESSION_SECRET, JWT_SECRET)
# - Worker URLs (WORKER_*_URL)

# Edit .env with merged values
nano .env
```

#### Step 7: Create New Volumes from Backup

```bash
# Create new volumes
docker volume create postgres_prod_data
docker volume create redis_prod_data

# Restore data from backup volumes
docker run --rm -v postgres_data_backup:/source -v postgres_prod_data:/dest \
  alpine sh -c "cp -av /source/. /dest/"

docker run --rm -v redis_data_backup:/source -v redis_prod_data:/dest \
  alpine sh -c "cp -av /source/. /dest/"
```

#### Step 8: Start New Services with Production Config

```bash
# Start with production config
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  -f infra/docker/docker-compose.prod.yml \
  up -d

# Watch logs
docker compose logs -f
```

#### Step 9: Verify Data Integrity

```bash
# Check PostgreSQL data
docker exec nyra-postgres-prod psql -U nyra_user -d nyra_db -c "\dt"
docker exec nyra-postgres-prod psql -U nyra_user -d nyra_db -c "SELECT COUNT(*) FROM your_table;"

# Check Redis data
docker exec nyra-redis-prod redis-cli DBSIZE

# Run health check
cd infra/docker
./health-check.sh
```

#### Step 10: Cleanup Old Resources

```bash
# Only after verifying everything works!

# Remove old volumes (DANGER: DATA LOSS)
# docker volume rm postgres_data redis_data

# Keep backups for 30 days
# rm -rf _backup/migration-*  # Only after 30 days!
```

**Migration Complete!** ✅

---

### Path C: Blue-Green Migration

#### Overview

Run old and new deployments in parallel, then switch traffic with zero downtime.

#### Step 1: Setup New "Green" Environment

```bash
cd C:\Dev\Projects\Repos\Project-Nyra

# Pull latest changes to separate directory
git clone . ../Project-Nyra-Green
cd ../Project-Nyra-Green
git checkout main
git pull origin main

# Configure new environment with different ports
cp infra/docker/.env.example .env

# Edit .env with DIFFERENT ports:
nano .env
# POSTGRES_PORT=5433 (not 5432)
# REDIS_PORT=6380 (not 6379)
# CLAUDE_FLOW_PORT=9010 (not 9000)
# NEXUS_ROUTER_PORT=8010 (not 8000)
```

#### Step 2: Start Green Environment

```bash
# Start new services on different ports
docker compose -f infra/docker/docker-compose.yml \
  -f infra/docker/docker-compose.orchestration.yml \
  up -d

# Verify running
docker compose ps
```

#### Step 3: Migrate Data

```bash
# Dump from blue (old) PostgreSQL
docker exec nyra-postgres pg_dumpall -U postgres > /tmp/db_migration.sql

# Import to green (new) PostgreSQL
cat /tmp/db_migration.sql | docker exec -i nyra-postgres-prod psql -U postgres

# Verify data
docker exec nyra-postgres-prod psql -U nyra_user -d nyra_db -c "SELECT COUNT(*) FROM your_table;"
```

#### Step 4: Warm Up Green Environment

```bash
# Send test traffic to green
curl http://localhost:8010/health

# Run integration tests against green
./run-integration-tests.sh http://localhost:8010

# Monitor green logs
docker compose logs -f
```

#### Step 5: Switch Traffic (Load Balancer)

```nginx
# Update nginx config
upstream backend {
  # Old blue
  server localhost:8000 weight=10;

  # New green
  server localhost:8010 weight=0;
}

# Reload nginx
nginx -s reload

# Gradually shift traffic (10% increments)
# weight=9/1, then 8/2, then 7/3, etc.
```

#### Step 6: Monitor Cutover

```bash
# Monitor both environments
watch -n 1 'docker stats'

# Check error rates in Grafana
# http://localhost:3000

# Monitor logs
tail -f /var/log/nginx/access.log | grep "status=[45]"
```

#### Step 7: Complete Cutover

```bash
# After confirming green is stable (24 hours):
# Update nginx to 100% green
upstream backend {
  server localhost:8010 weight=1;
}

# Reload nginx
nginx -s reload

# Stop blue environment
cd ../Project-Nyra
docker compose down
```

**Migration Complete!** ✅

---

## Validation and Testing

### Post-Migration Checklist

After completing migration, verify all systems:

#### Service Health

```bash
# Overall health check
cd infra/docker
./health-check.sh

# Should show:
# ✅ PostgreSQL: healthy
# ✅ Redis: healthy
# ✅ Claude Flow: healthy
# ✅ Nexus Router: healthy
# ✅ Letta: healthy
```

#### Database Connectivity

```bash
# Test PostgreSQL
docker exec nyra-postgres-prod psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Test Redis
docker exec nyra-redis-prod redis-cli ping

# Test FalkorDB
docker exec nyra-falkordb-prod redis-cli -a $FALKORDB_PASSWORD ping

# Test Qdrant
curl http://localhost:6333/health
```

#### Service Endpoints

```bash
# Nexus Router
curl http://localhost:8000/health
curl http://localhost:8000/v1/models

# Nexus Router MCP
curl http://localhost:4001/mcp/health

# Claude Flow
curl http://localhost:9000/health

# Grafana
curl http://localhost:3000/api/health

# Prometheus
curl http://localhost:9090/-/healthy
```

#### Integration Tests

```bash
# Run full integration test suite
cd tests/integration
./run-all-tests.sh

# Expected output:
# ✅ Database connectivity: PASS
# ✅ Service discovery: PASS
# ✅ LLM routing: PASS
# ✅ MCP proxy: PASS
# ✅ End-to-end workflow: PASS
```

#### Performance Baseline

```bash
# Measure baseline latency
./scripts/benchmark-latency.sh

# Expected results:
# PostgreSQL query: <10ms
# Redis get/set: <2ms
# Nexus Router (local): <200ms
# Nexus Router (cached): <10ms
```

---

## Rollback Procedure

If migration fails, follow these steps to rollback:

### Quick Rollback (Use Backup)

```bash
# Stop new services
docker compose -f infra/docker/docker-compose.full.yml down

# Restore backup volumes
BACKUP_DIR="_backup/migration-20260118-143022"  # Your backup directory

for volume in $(ls $BACKUP_DIR/*.tar.gz | xargs -n1 basename | sed 's/.tar.gz//'); do
  echo "Restoring volume: $volume"
  docker volume create $volume
  docker run --rm -v $volume:/data -v $(pwd)/$BACKUP_DIR:/backup \
    alpine tar xzf /backup/${volume}.tar.gz -C /data
done

# Restore .env
cp $BACKUP_DIR/.env.old .env

# Checkout old git commit
GIT_COMMIT=$(cat $BACKUP_DIR/git-commit.txt)
git checkout $GIT_COMMIT

# Start old services
# (Use your old docker compose commands from backup)
```

### Git Rollback

```bash
# Find commit before migration
git log --oneline | head -20

# Checkout previous commit
git checkout <commit-hash-before-migration>

# Create rollback branch
git checkout -b rollback-migration-$(date +%Y%m%d)

# Restore old .env
cp _backup/migration-*/..env.old .env

# Start old services
# (Use your old docker compose commands)
```

### Volume Rollback

```bash
# If you kept backup volumes:
docker volume ls | grep backup

# Restore from backup
docker run --rm -v postgres_data_backup:/source -v postgres_data:/dest \
  alpine sh -c "rm -rf /dest/* && cp -av /source/. /dest/"

# Restart services
docker compose up -d
```

---

## Troubleshooting

### Issue: Services Won't Start

```bash
# Check ports
netstat -ano | findstr :8000

# Check logs
docker compose logs nexus-router

# Verify .env
cat .env | grep NEXUS_ROUTER_PORT

# Check volumes
docker volume ls | grep nyra

# Restart Docker daemon
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop (Windows)
```

### Issue: Database Connection Errors

```bash
# Check PostgreSQL status
docker compose ps postgresql

# Test connection
docker exec nyra-postgres-prod psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Check logs
docker compose logs postgresql

# Verify credentials
docker compose exec postgresql env | grep POSTGRES

# Reset database (⚠️ DATA LOSS)
docker compose down -v
docker compose up -d postgresql
```

### Issue: Data Missing After Migration

```bash
# Check volume
docker volume inspect postgres_prod_data

# Restore from backup
BACKUP_DIR="_backup/migration-20260118-143022"
docker run --rm -v postgres_prod_data:/data -v $(pwd)/$BACKUP_DIR:/backup \
  alpine tar xzf /backup/postgres_prod_data.tar.gz -C /data

# Restart service
docker compose restart postgresql
```

### Issue: Port Conflicts

```bash
# Find process using port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Linux

# Kill process (if safe)
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Linux

# Or change port in .env
nano .env
# NEXUS_ROUTER_PORT=8001

# Restart
docker compose up -d
```

---

## Post-Migration Tasks

After successful migration:

### 1. Update Documentation

- [ ] Update internal wikis with new structure
- [ ] Update runbooks with new commands
- [ ] Update disaster recovery procedures
- [ ] Document any custom changes made

### 2. Team Training

- [ ] Brief team on new structure
- [ ] Share new docker-compose commands
- [ ] Demonstrate health-check scripts
- [ ] Review rollback procedures

### 3. Monitoring Setup

- [ ] Verify Grafana dashboards
- [ ] Configure alerts in Prometheus
- [ ] Set up log aggregation
- [ ] Test alert notifications

### 4. Cleanup

- [ ] Remove old backup volumes (after 30 days)
- [ ] Archive old compose files
- [ ] Update CI/CD pipelines
- [ ] Clean up old documentation

---

## Getting Help

If you encounter issues during migration:

1. **Check logs**: `docker compose logs <service>`
2. **Review documentation**: `docs/operations/`
3. **Run health check**: `./health-check.sh`
4. **Consult rollback procedure**: Above
5. **Contact team**: GitHub Issues or team chat

---

**Version**: 1.0.0
**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
**Estimated Migration Time**: 15-45 minutes depending on path
