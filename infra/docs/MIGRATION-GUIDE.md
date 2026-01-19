# Migration Guide - Docker Infrastructure Consolidation

> Guide for migrating from old scattered Docker Compose files to the consolidated structure

## Overview

Project Nyra consolidated **274 Docker Compose files** scattered across the repository into a unified, modular infrastructure. This guide helps you migrate from the old structure to the new one.

**Consolidation Date**: 2026-01-18
**Estimated Migration Time**: 15-30 minutes
**Downtime Required**: 5-10 minutes

## Pre-Migration Checklist

Before starting migration:

- [ ] **Backup all data** (databases, volumes, configurations)
- [ ] **Document current environment** (.env variables, custom configs)
- [ ] **Test new structure** in a separate environment (recommended)
- [ ] **Schedule maintenance window** (minimal downtime)
- [ ] **Notify team members** of upcoming changes

## Migration Strategy

### Zero-Downtime Migration (Recommended)

Run old and new stacks side-by-side, then switch over.

### Standard Migration

Stop old stack, migrate data, start new stack.

---

## Option 1: Zero-Downtime Migration

Best for production environments.

### Step 1: Prepare New Stack (No Downtime)

```bash
# Navigate to new infrastructure location
cd C:/Dev/Projects/Repos/Project-Nyra/infra

# Initialize new stack (doesn't start services yet)
make init

# Copy environment variables from old location
cp ../old-env-file .env

# Edit .env to adjust any port conflicts (old stack is still running)
# Example: Change POSTGRES_PORT from 5432 to 5433
nano .env
```

### Step 2: Start New Stack on Different Ports (No Downtime)

```bash
# Modify .env to use different ports temporarily
# Example adjustments:
POSTGRES_PORT=5433          # Old: 5432
REDIS_PORT=6380             # Old: 6379
CLAUDE_FLOW_MCP_PORT=3010   # Old: 3000
# etc.

# Start new stack
make up
```

### Step 3: Migrate Data (Minimal Downtime)

```bash
# Backup from old stack
docker exec old-postgres pg_dump -U nyra_user nyra_db > /tmp/old_db_backup.sql
docker exec old-redis redis-cli --rdb /tmp/dump.rdb save

# Restore to new stack
cat /tmp/old_db_backup.sql | docker exec -i nyra-postgres psql -U nyra_user -d nyra_db

# Copy Redis data
docker cp /tmp/dump.rdb nyra-redis:/data/dump.rdb
docker compose restart redis
```

### Step 4: Switch Over (5 minutes downtime)

```bash
# Stop old stack
cd ../old-location
docker compose down

# Update .env in new stack to use standard ports
cd C:/Dev/Projects/Repos/Project-Nyra/infra
nano .env
# Change back:
# POSTGRES_PORT=5432
# REDIS_PORT=6379
# etc.

# Restart new stack with standard ports
make restart
```

### Step 5: Verify & Cleanup

```bash
# Verify all services healthy
make health
make urls

# Test critical functionality
curl http://localhost:3000/health  # Claude Flow
curl http://localhost:6000/health  # Nexus Router

# Once verified, remove old stack
cd ../old-location
docker compose down -v  # Remove volumes (WARNING: data loss)
```

---

## Option 2: Standard Migration (Downtime)

Simpler approach with 10-15 minutes downtime.

### Step 1: Backup Everything

```bash
# Navigate to old location
cd C:/Dev/Projects/Repos/Project-Nyra

# Create backup directory
mkdir -p backups/pre-migration-$(date +%Y%m%d)
cd backups/pre-migration-$(date +%Y%m%d)

# Backup databases
docker exec postgres pg_dump -U nyra_user nyra_db > postgres_backup.sql
docker exec postgres pg_dumpall -U postgres > postgres_all.sql
docker exec redis redis-cli --rdb dump.rdb save
docker cp redis:/data/dump.rdb ./redis_dump.rdb

# Backup volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data.tar.gz /data

docker run --rm -v redis_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/redis_data.tar.gz /data

# Copy .env file
cp ../../.env ./env_backup
```

### Step 2: Stop Old Stack

```bash
cd ../..

# Stop all services (DOWNTIME BEGINS)
docker compose down

# Optional: Remove old containers and networks
docker compose down --remove-orphans
```

### Step 3: Set Up New Infrastructure

```bash
# Navigate to new infra location
cd infra

# Initialize (creates .env, builds images)
make init

# Copy environment variables from backup
cp ../backups/pre-migration-$(date +%Y%m%d)/env_backup .env

# Review and update .env
nano .env
# Ensure all required variables are set:
# - ANTHROPIC_API_KEY
# - OPENROUTER_API_KEY
# - Database passwords
# - Secret keys
```

### Step 4: Restore Data

```bash
# Start core services only
make up-core

# Wait for databases to be healthy
sleep 30
make health

# Restore PostgreSQL
cat ../backups/pre-migration-$(date +%Y%m%d)/postgres_backup.sql | \
  docker compose exec -T postgres psql -U nyra_user -d nyra_db

# Restore Redis
docker cp ../backups/pre-migration-$(date +%Y%m%d)/redis_dump.rdb nyra-redis:/data/dump.rdb
docker compose restart redis

# Verify data
docker compose exec postgres psql -U nyra_user -d nyra_db -c "\dt"
docker compose exec redis redis-cli DBSIZE
```

### Step 5: Start All Services

```bash
# Start remaining services
make up

# Check health
make health
make ps

# View logs for any issues
make logs
```

### Step 6: Verification

```bash
# Test all critical services
make urls

# Test APIs
curl http://localhost:3000/health   # Claude Flow
curl http://localhost:6000/health   # Nexus Router
curl http://localhost:8000/health   # Archon OS
curl http://localhost:8089/health   # Quote API

# Check databases
make db-shell
# Inside psql:
SELECT COUNT(*) FROM your_table;

# Check Redis
make redis-cli
# Inside redis-cli:
DBSIZE
```

---

## Configuration Migration

### Environment Variables Mapping

Old structure scattered variables across multiple files. New structure centralizes in one `.env`.

**Old locations:**
- `/.env` (root)
- `/infra/.env`
- `/infra/docker/.env`
- `/configs/*.env`

**New location:**
- `/infra/.env` (single source of truth)

### Variable Name Changes

Some variable names were standardized:

| Old Name | New Name |
|----------|----------|
| `CLAUDE_API_KEY` | `ANTHROPIC_API_KEY` |
| `CF_PORT` | `CLAUDE_FLOW_MCP_PORT` |
| `ARCHON_PORT` | `ARCHON_API_PORT` |
| `PG_PASSWORD` | `POSTGRES_PASSWORD` |
| `REDIS_PASS` | `REDIS_PASSWORD` |

### Service-Specific Variables

**Claude Flow:**
```bash
# Old
CLAUDE_FLOW_HOST=0.0.0.0
CLAUDE_FLOW_PORT=3000

# New
CLAUDE_FLOW_MCP_HOST=0.0.0.0
CLAUDE_FLOW_MCP_PORT=3000
CLAUDE_FLOW_MODE=mcp
```

**Nexus Router (New Service):**
```bash
# Required for new Nexus Router service
NEXUS_JWT_SECRET=your_jwt_secret
NEXUS_ADMIN_TOKEN=your_admin_token
```

---

## Service Changes

### New Services

The consolidated structure introduces new services:

1. **Nexus Router** (Port 6000)
   - Unified MCP + LLM gateway
   - Replaces direct service-to-service calls
   - Automatic service discovery

2. **Infisical** (Port 8080)
   - Secret management
   - Replaces scattered .env files in production

3. **Langfuse** (Port 3004)
   - LLM observability
   - Tracks AI model usage and costs

### Removed Services

Old services replaced or consolidated:

- **Individual MCP servers as separate containers**: Now managed by Nexus
- **Multiple Redis instances**: Consolidated to single Redis with multiple databases
- **Duplicate monitoring services**: Unified into observability stack

### Renamed Services

| Old Name | New Name | Reason |
|----------|----------|---------|
| `claude_flow_mcp` | `claude-flow` | Naming consistency |
| `archon_os` | `archon` | Simplified naming |
| `postgres_main` | `postgres` | Single primary database |

---

## Docker Compose File Structure Changes

### Old Structure
```
/
├── docker-compose.yml (root)
├── docker-compose.memory.yml
├── docker-compose.voice.yml
├── infra/docker-compose.dev.yml
├── infra/docker-compose.prod.yml
├── infra/docker-compose.full.yml
└── ... 270+ more files
```

### New Structure
```
infra/
├── docker-compose/
│   ├── docker-compose.yml (master)
│   ├── docker-compose.base.yml (databases)
│   ├── docker-compose.ai.yml (AI services)
│   ├── docker-compose.crm.yml
│   ├── docker-compose.workflow.yml
│   ├── docker-compose.observability.yml
│   ├── docker-compose.orchestrator.yml
│   └── docker-compose.business.yml
└── docker/
    └── docker-compose.yml (legacy unified)
```

### How to Start Services

**Old way:**
```bash
docker compose -f docker-compose.yml \
               -f docker-compose.memory.yml \
               -f docker-compose.voice.yml \
               -f infra/docker-compose.dev.yml \
               up -d
```

**New way:**
```bash
cd infra
make up
# or
cd infra/docker-compose
docker compose up -d
```

---

## Network Changes

### Old Networks
Multiple disconnected networks:
- `nyra_default`
- `nyra_backend`
- `nyra_frontend`
- `infra_default`

### New Network
Single unified network:
```yaml
networks:
  nyra-network:
    driver: bridge
    subnet: 172.20.0.0/16
```

**Impact**: All services can now communicate directly using service names.

**Migration**: No action needed. New network is created automatically.

---

## Volume Changes

### Volume Naming Convention

**Old naming:**
```
projectnyra_postgres_data
infra_postgres_data
postgres_data
```

**New naming:**
```
nyra_postgres_data
nyra_redis_data
nyra_letta_data
```

### Migrating Volumes

If you want to keep old volume data:

```bash
# List old volumes
docker volume ls | grep postgres

# Copy data from old volume to new
docker run --rm \
  -v old_postgres_data:/from \
  -v nyra_postgres_data:/to \
  alpine sh -c "cp -av /from/. /to/"
```

Or use database dumps (recommended):

```bash
# Backup from old
docker run --rm -v old_postgres_data:/data alpine tar czf /tmp/backup.tar.gz /data

# Restore to new
docker run --rm -v nyra_postgres_data:/data alpine tar xzf /tmp/backup.tar.gz -C /
```

---

## Rollback Plan

If migration fails, rollback to old structure:

### Step 1: Stop New Stack

```bash
cd infra
make down
```

### Step 2: Restore Old Stack

```bash
cd ..
docker compose -f docker-compose.yml.old up -d
```

### Step 3: Restore Data

```bash
# Restore databases from backups
cat backups/pre-migration-*/postgres_backup.sql | \
  docker exec -i postgres psql -U nyra_user -d nyra_db
```

### Step 4: Verify

```bash
docker compose ps
curl http://localhost:3000/health
```

---

## Post-Migration Tasks

### 1. Update CI/CD Pipelines

Update deployment scripts:

**Old:**
```bash
docker compose -f docker-compose.yml up -d
```

**New:**
```bash
cd infra && make up
```

### 2. Update Documentation

Update any internal documentation referencing:
- Old compose file locations
- Service names
- Port numbers
- Environment variables

### 3. Update Monitoring

Update monitoring dashboards to reflect:
- New service names
- New container names (nyra-* prefix)
- New network (nyra-network)

### 4. Team Training

Ensure team knows:
- New Makefile commands: `make up`, `make logs-<service>`, etc.
- New service locations
- How to use modular compose files
- Nexus Router for service discovery

### 5. Cleanup Old Files

Once confident in new structure:

```bash
# Move old files to archive
mkdir -p _archive/old-docker-structure
mv docker-compose.*.old _archive/old-docker-structure/
mv infra/docker-compose.*.old _archive/old-docker-structure/
```

---

## Verification Checklist

After migration, verify:

- [ ] All services are running: `make ps`
- [ ] All services are healthy: `make health`
- [ ] Databases contain expected data: `make db-shell`
- [ ] APIs respond correctly: Test with curl
- [ ] Web UIs accessible: Check all ports
- [ ] Monitoring dashboards working: Grafana, Prometheus
- [ ] Nexus Router registering services: Check `/api/admin/servers`
- [ ] Logs are being collected: Loki, Grafana
- [ ] Backups are being created: Test `make db-backup`
- [ ] Team can access all services: Share URLs
- [ ] CI/CD pipelines updated and tested

---

## Getting Help

### Migration Issues

If you encounter issues:

1. **Check logs:**
   ```bash
   make logs
   ```

2. **Consult troubleshooting guide:**
   - [Troubleshooting Guide](TROUBLESHOOTING.md)

3. **Rollback if necessary:**
   - Follow rollback plan above

4. **Ask for help:**
   - Create GitHub issue
   - Contact team lead

### Common Migration Issues

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for:
- Service startup failures
- Data migration errors
- Network connectivity issues
- Performance problems

---

## Benefits of New Structure

After migration, you gain:

1. **Simplified Operations**
   - Single command to start all services: `make up`
   - Unified configuration in one `.env` file
   - Clear service organization

2. **Better Service Discovery**
   - Nexus Router automatically discovers services
   - No more manual service registration
   - Dynamic routing based on health checks

3. **Improved Monitoring**
   - Unified observability stack
   - Centralized logging with Loki
   - LLM usage tracking with Langfuse

4. **Enhanced Security**
   - Infisical for secret management
   - Standardized authentication via Nexus
   - Policy-based access control

5. **Easier Development**
   - Modular compose files
   - Service-specific targets: `make up-ai`, `make up-apps`
   - Comprehensive Makefile commands

---

**Last Updated**: 2026-01-18
**Questions?** See [Quick Start Guide](QUICK-START.md) or [Architecture Overview](ARCHITECTURE.md)
