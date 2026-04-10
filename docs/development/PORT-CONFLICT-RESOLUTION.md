# Port Conflict Resolution - FalkorDB

## Issue
Redis and FalkorDB were both configured to use host port 6379, causing a port conflict.

## Resolution Date
2026-01-18

## Changes Made

### 1. Docker Compose Files Updated
- **bootstrap\configs\docker\docker-compose.memory.yml**
  - Changed FalkorDB port mapping from `6379:6379` to `6380:6379` (line 11)
  - Updated letta FALKORDB_PORT from `6379` to `6380` (line 33)

- **infra\docker-compose\docker-compose.databases.yml**
  - Updated port mapping default from `${FALKORDB_PORT:-6379}:6379` to `${FALKORDB_PORT:-6380}:6379` (line 40)

### 2. Configuration Files Updated
- **configs\templates\claude-settings-ultimate.json**
  - Updated all `redis://localhost:6379` references to `redis://localhost:6380` for FalkorDB/letta connections

- **configs\claude-configs\.env**
  - Updated `FALKORDB_URL` from `redis://localhost:6379` to `redis://localhost:6380` (line 98)

- **.claude\settings-ultimate-enhanced.json**
  - Updated `FALKORDB_URL` from `redis://localhost:6379` to `redis://localhost:6380` (line 791)

### 3. Environment Variables
- **.env** already had `FALKORDB_PORT='6380'` configured correctly

## Port Assignments

| Service | Host Port | Container Port | Notes |
|---------|-----------|----------------|-------|
| Redis | 6379 | 6379 | Standard Redis port |
| FalkorDB | 6380 | 6379 | Moved to 6380 to avoid conflict |

## Internal vs External Connections

- **External connections** (from host machine): Use `localhost:6380`
- **Internal Docker connections** (between containers): Use `falkordb:6379` (unchanged)

## Files NOT Changed
The following files reference `falkordb:6379` which is correct for internal Docker networking:
- `infra\stacks\nyra-mortgage\docker-compose.yml`
- `infra\stacks\nyra-mortgage\docker-compose.letta.yml`
- `infra\docker-compose\docker-compose.orchestrator.yml`
- `infra\docker\apps\docker-compose.apps.yml`
- Various batch-config.json files

## Testing
After this change, both Redis and FalkorDB can run simultaneously:
- Redis on port 6379
- FalkorDB on port 6380

## Rollback
If needed, revert to commit before this change and FalkorDB will attempt to use port 6379 again.
