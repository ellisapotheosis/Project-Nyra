# Docker Containers Not Starting - Fix Required

## Problem

Docker containers `nyra-postgres` and `nyra-redis` are stuck in "Created" state and will not start.

## Root Cause

The `/home/ellisapotheosis/projects/project-nyra/infra/.env` file contains placeholder values that prevent containers from initializing:

```bash
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
```

## Required Fix

### Step 1: Set Real Passwords

Edit `/home/ellisapotheosis/projects/project-nyra/infra/.env` and replace placeholder values with actual passwords:

```bash
# Generate strong passwords (examples, use your own):
POSTGRES_PASSWORD=YourSecurePostgresPassword123!
REDIS_PASSWORD=YourSecureRedisPassword456!
```

### Step 2: Clean Up Stuck Containers

```bash
cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose

# Remove all stuck containers
docker rm -f nyra-postgres nyra-postgres-v2 nyra-redis nyra-redis-v2

# Verify removal
docker ps -a | grep nyra
```

### Step 3: Start Services

```bash
# Start with correct project name
docker-compose -p infra up -d postgres redis

# Wait for startup
sleep 10

# Verify services are running
docker ps | grep nyra

# Check logs
docker logs nyra-postgres-v2 --tail 30
docker logs nyra-redis-v2 --tail 30
```

## Files Modified (Already Done)

1. `/home/ellisapotheosis/projects/project-nyra/infra/docker-compose/docker-compose.base.yml`
   - Changed container names to `nyra-postgres-v2` and `nyra-redis-v2`
   - Set network to `external: true`
   - Set volumes to `external: true`

2. `/home/ellisapotheosis/projects/project-nyra/scripts/postgres-init/init-databases.sh`
   - Created multi-database initialization script

## Additional Recommendations

1. **Never commit `.env` file** - It should be in `.gitignore`
2. **Use strong passwords** - At least 16 characters with mixed case, numbers, and symbols
3. **Consider using Infisical** for secrets management (already configured in the project)
4. **Document the passwords** in a secure password manager

## Verification

After applying the fix, you should see:

```
CONTAINER ID   IMAGE                     STATUS          PORTS
xxxxxxxxx      pgvector/pgvector:pg16    Up 30 seconds   0.0.0.0:5432->5432/tcp
yyyyyyyyy      redis:7-alpine            Up 30 seconds   0.0.0.0:6380->6379/tcp
```

## If Still Having Issues

Check logs for specific error messages:
```bash
docker logs nyra-postgres-v2
docker logs nyra-redis-v2
```

Common issues:
- Volume permission errors
- Port conflicts (5432, 6379 already in use)
- Network connectivity issues
- Resource constraints (memory/CPU)

