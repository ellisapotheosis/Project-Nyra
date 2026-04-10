# Quick Redis Setup for Nexus Router

## 🚀 5-Minute Setup

This guide shows you how to connect Nexus Router to your existing Redis container (shared with Archon OS).

## Prerequisites

- Docker and Docker Compose installed
- Redis container running (`nyra-redis`)
- `REDIS_PASSWORD` set in your environment

## Setup Steps

### Step 1: Set Redis Password

Ensure `REDIS_PASSWORD` is set in your `.env` file.

### Step 2: Update Nexus Router Environment

Update your docker-compose where `nexus-router` is defined:

```yaml
services:
  nexus-router:
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
    networks:
      - nyra
    depends_on:
      redis:
        condition: service_healthy
```

### Step 3: Verify Connection

Check the logs for successful Redis connection:

```bash
docker logs nyra-nexus-router -f
# Look for: ✅ "Redis connected - caching enabled"
```

## Verify Data Isolation

Make sure Nexus Router and Archon OS use different databases:

```bash
# Connect to Redis
docker exec -it nyra-redis redis-cli -a ${REDIS_PASSWORD}

# Check Nexus Router keys (DB 0)
SELECT 0
KEYS nexus:*

# Check Archon OS keys (DB 1)
SELECT 1
KEYS *
```

## Database Allocation

| Service | Database | Keys Pattern |
|---------|----------|--------------|
| Nexus Router | DB 0 | `nexus:*` |
| Archon OS | DB 1 | `*` |
| Available | DB 2-15 | Future services |

## Support

If you encounter issues:
1. Check logs: `docker logs nyra-nexus-router -f`
2. Review `REDIS-SETUP.md` for detailed troubleshooting
