# Nexus Router - Redis Integration Setup

## Overview

This document explains how to connect Nexus Router to the shared Redis instance used by Archon OS.

## Redis Configuration

### Redis (Shared Instance)

**Container Details**:
- Container Name: `nyra-redis`
- Image: `redis:7-alpine`
- Port: `6379`
- Password: Set via `${REDIS_PASSWORD}` environment variable

**Database Allocation**:
- **DB 0**: Nexus Router (default)
- **DB 1**: Archon OS (configured)
- **DB 2-15**: Available for other services

## Configuration Options

### Option 1: Docker Network Connection (Recommended)

Update environment variable in Nexus Router:
```bash
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
```

## Environment Variable Configuration

Add to `nexus-router` in your compose file:

```yaml
nexus-router:
  environment:
    - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
  networks:
    - nyra
```

## Verification Steps

### 1. Test Redis Connection

```bash
redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD}
```

### 2. Check Database Isolation

```bash
# Connect to Redis
redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD}

# List keys in DB 0 (Nexus Router)
SELECT 0
KEYS *

# List keys in DB 1 (Archon OS)
SELECT 1
KEYS *
```

## Nexus Router Redis Usage

### Cache Key Patterns

All Nexus Router keys are prefixed with `nexus:`:

```
nexus:request:{hash}          - Cached request/response pairs
nexus:metrics:{metric_name}   - Metric counters
nexus:worker:{id}:status      - Worker status tracking
nexus:providers:{id}          - Provider configurations
nexus:models:{id}             - Model catalog cache
nexus:routing:rules           - Routing rules
nexus:rate-limits:{key}       - Rate limit counters
```

### Memory Considerations

- Archon OS (DB 1): Sessions, memory, patterns
- Nexus Router (DB 0): Cache, metrics, rate limits

## Troubleshooting

Check logs: `docker logs nyra-nexus-router -f`
Verify password matches: `echo $REDIS_PASSWORD`
Ensure correct hostname: `redis` vs `localhost`
