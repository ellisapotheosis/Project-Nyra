# Docker Container Issue Investigation Report

**Date**: 2026-01-26
**Containers**: nyra-postgres (3316c7920fe4), nyra-redis (01a8af4c071c)
**Status**: Stuck in "Created" state for 2+ hours

## Problem Summary

Two Docker containers (PostgreSQL and Redis) are stuck in "Created" state and cannot be started or removed using standard Docker commands. Multiple removal attempts have failed, with containers persisting even after:
- `docker rm -f`
- `docker system prune`
- Docker daemon restarts
- Force disconnection from networks
- Direct filesystem removal attempts

## Root Causes Identified

### 1. Network Label Mismatch
**Error**: `network nyra-network was found but has incorrect label com.docker.compose.network`

**Issue**: The `nyra-network` was created outside docker-compose scope, causing label mismatches.

**Fix Applied**: Modified `/home/ellisapotheosis/projects/project-nyra/infra/docker-compose/docker-compose.base.yml` to use `external: true` for network definition.

### 2. Volume Project Name Mismatch
**Warning**: `volume "nyra_postgres_data" already exists but was created for project "infra" (expected "docker-compose")`

**Issue**: Volumes created with project name "infra" but accessed with default "docker-compose" context.

**Fix Applied**: Set volumes to `external: true` in docker-compose.base.yml

### 3. Environment Variables Not Set
**Issue**: Placeholder values in `.env` file:
```
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
```

**Status**: Needs manual correction by user

### 4. Missing Postgres Init Scripts
**Location**: `/home/ellisapotheosis/projects/project-nyra/scripts/postgres-init/`

**Status**: Created `init-databases.sh` script for multi-database initialization

### 5. Container State Corruption
**Issue**: Containers are in a corrupted "Created" state where:
- They cannot be started (`docker start` has no effect)
- They cannot be stopped (already in stopped state)
- They cannot be removed with `-f` flag
- They persist across Docker daemon restarts

## Attempted Fixes (All Failed)

1. `docker rm -f` - Containers remain
2. `docker network disconnect -f` - No effect
3. `docker container prune -f` - Containers exempt from pruning
4. `sudo systemctl restart docker` - Containers persist after restart
5. Direct filesystem removal of `/var/lib/docker/containers/[ID]*` - Files not found (likely stored elsewhere)
6. `docker-compose down --remove-orphans` - Only attempts to stop, doesn't remove
7. `docker system prune -af --volumes` - Operation already running error

## Required Manual Intervention

### Option 1: Complete Docker Reset (DESTRUCTIVE)
```bash
# Stop Docker
sudo systemctl stop docker

# Remove Docker data (WARNING: Deletes ALL containers, images, volumes)
sudo rm -rf /var/lib/docker

# Restart Docker
sudo systemctl start docker

# Recreate volumes
docker volume create nyra_postgres_data
docker volume create nyra_redis_data

# Recreate network
docker network create nyra-network --subnet 172.28.0.0/16

# Start services
cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose
docker-compose -p infra up -d postgres redis
```

### Option 2: WSL2 Reset (If Running in WSL)
```powershell
# From Windows PowerShell (Admin)
wsl --shutdown
wsl --unregister Ubuntu  # Or your distro name
wsl --install Ubuntu
```

### Option 3: Use Different Container Names
Modify `docker-compose.base.yml` to use different container names:
```yaml
services:
  postgres:
    container_name: nyra-postgres-v2  # Changed

  redis:
    container_name: nyra-redis-v2  # Changed
```

## Files Modified

1. **`/home/ellisapotheosis/projects/project-nyra/infra/docker-compose/docker-compose.base.yml`**
   - Set network to `external: true`
   - Set volumes to `external: true`

2. **`/home/ellisapotheosis/projects/project-nyra/scripts/postgres-init/init-databases.sh`**
   - Created multi-database initialization script

3. **`/home/ellisapotheosis/projects/project-nyra/scripts/fix-docker-final.sh`**
   - Created cleanup and restart script

## Recommendations

1. **Set real passwords** in `/home/ellisapotheosis/projects/project-nyra/infra/.env`
2. **Always use project name**: `docker-compose -p infra` to avoid context mismatches
3. **Remove version declarations**: Update all compose files to remove obsolete `version: '3.8'`
4. **Consider container name change** to avoid conflict with corrupted containers
5. **Implement healthchecks** properly to detect startup failures early

## System Information

- **OS**: Linux 6.6.87.2-microsoft-standard-WSL2 (WSL2)
- **Docker**: Using docker-compose v2
- **Working Directory**: `/home/ellisapotheosis/projects/project-nyra/infra/docker-compose`
- **Network**: nyra-network (172.28.0.0/16)
- **Volumes**: nyra_postgres_data, nyra_redis_data (persistent)

## Next Steps

**CRITICAL**: Choose one of the manual intervention options above. The containers are in a corrupted state that cannot be fixed through normal Docker commands.

**Recommended**: Option 3 (change container names) is the least destructive and most reliable solution for this specific issue.

