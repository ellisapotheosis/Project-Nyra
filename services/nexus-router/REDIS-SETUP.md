# Nexus Router - Redis Integration Setup

## Overview

This document explains how to connect Nexus Router to the shared Redis instance used by Claude Flow.

## Redis Configuration

### Dual Orchestrator Redis (Shared Instance)

**Container Details**:
- Container Name: `redis-orchestrator`
- Image: `redis:7-alpine`
- Port: `6379`
- Network: `orchestrator-network`
- Password: Set via `${REDIS_PASSWORD}` environment variable

**Database Allocation** (to prevent conflicts):
- **DB 0**: Nexus Router (default)
- **DB 1**: Claude Flow (configured)
- **DB 2-15**: Available for other services

## Configuration Options

### Option 1: Docker Network Connection (Recommended)

**Best for**: Production, when both services run in Docker

**Steps**:
1. Ensure Nexus Router is on the `orchestrator-network`
2. Update environment variable in Nexus Router:
   ```bash
   REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
   ```

**Explanation**:
- `redis://` - Protocol
- `:${REDIS_PASSWORD}@` - Authentication (colon prefix for password-only auth)
- `redis` - Container hostname on `orchestrator-network`
- `6379` - Redis port
- `/0` - Database number (0 = Nexus Router, 1 = Claude Flow)

### Option 2: Host Network Connection

**Best for**: Development, when Nexus Router runs outside Docker

**Steps**:
1. Ensure Redis port is exposed: `6379:6379`
2. Update environment variable in Nexus Router:
   ```bash
   REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379/0
   ```

### Option 3: Bridge Network Connection

**Best for**: Cross-network communication within Docker

**Steps**:
1. Use `host.docker.internal` (Docker Desktop) or container IP
2. Update environment variable:
   ```bash
   REDIS_URL=redis://:${REDIS_PASSWORD}@host.docker.internal:6379/0
   ```

## Environment Variable Configuration

### For Docker Compose

Add to `services/nexus-router` in docker-compose.yml:

```yaml
nexus-router:
  environment:
    - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
  networks:
    - orchestrator-network  # Important: Join Claude Flow's network
```

### For .env File

Update `services/nexus-router/.env.local`:

```bash
# Redis Configuration (Shared with Claude Flow)
REDIS_URL=redis://:your-redis-password@redis:6379/0
# Or for host connection:
# REDIS_URL=redis://:your-redis-password@localhost:6379/0
```

### For Production

Use environment-specific configuration:

```bash
# Production (.env.production)
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

# Staging (.env.staging)
REDIS_URL=redis://:${REDIS_STAGING_PASSWORD}@redis-staging:6379/0

# Development (.env.local)
REDIS_URL=redis://localhost:6379/0  # No password for local dev
```

## Verification Steps

### 1. Test Redis Connection

```bash
# From within Nexus Router container or host
redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD}
```

### 2. Check Database Isolation

```bash
# Connect to Redis
redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD}

# List keys in DB 0 (Nexus Router)
SELECT 0
KEYS *

# List keys in DB 1 (Claude Flow)
SELECT 1
KEYS *
```

### 3. Monitor Nexus Router Logs

```bash
# Docker logs
docker logs nyra-nexus-router -f

# Look for:
# ✓ "Redis connected - caching enabled"
# ✗ "Redis unavailable - running without caching"
```

### 4. Check Redis Memory Usage

```bash
# Connect to Redis
redis-cli -h redis -p 6379 -a ${REDIS_PASSWORD}

# Check info
INFO memory
INFO stats

# Check keys by namespace
KEYS nexus:*
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

### Cache TTLs

- Default: 3600 seconds (1 hour)
- Request cache: Configurable per request
- Worker status: 300 seconds (5 minutes)
- Rate limits: 60-300 seconds

### Memory Considerations

Current Redis configuration:
- Max memory: 256MB (set in docker-compose)
- Eviction policy: `allkeys-lru` (Least Recently Used)
- Persistence: AOF (Append Only File) enabled

**Estimated Usage**:
- Claude Flow (DB 1): ~100-150MB (sessions, memory, patterns)
- Nexus Router (DB 0): ~50-80MB (cache, metrics, rate limits)
- **Total**: ~150-230MB (within 256MB limit)

**Recommendation**: Monitor memory usage. If approaching limit:
1. Increase max memory to 512MB
2. Reduce cache TTLs
3. Enable Redis key eviction notifications

## Troubleshooting

### Issue: Connection Refused

**Symptoms**: `Redis connection failed after 3 attempts`

**Solutions**:
1. Check if Redis container is running: `docker ps | grep redis`
2. Verify network connectivity: `docker network inspect orchestrator-network`
3. Check password matches: `echo $REDIS_PASSWORD`
4. Ensure correct hostname: `redis` vs `redis-orchestrator` vs `localhost`

### Issue: Authentication Failed

**Symptoms**: `NOAUTH Authentication required`

**Solutions**:
1. Verify password in environment: `docker exec redis-orchestrator env | grep REDIS`
2. Check password format in URL: `redis://:password@host:port/db`
3. Try connecting manually: `redis-cli -h redis -a $REDIS_PASSWORD`

### Issue: Wrong Database

**Symptoms**: Keys appear in Claude Flow's data or vice versa

**Solutions**:
1. Check database number in URL: `/0` for Nexus Router, `/1` for Claude Flow
2. Verify with: `redis-cli SELECT 0` then `KEYS *`
3. Clear wrong database: `FLUSHDB` (⚠️ careful!)

### Issue: Memory Limit Exceeded

**Symptoms**: `OOM command not allowed when used memory > 'maxmemory'`

**Solutions**:
1. Check current usage: `redis-cli INFO memory`
2. Increase max memory in docker-compose: `--maxmemory 512mb`
3. Reduce cache TTLs in Nexus Router config
4. Clear old keys: `redis-cli --scan --pattern 'nexus:*' | xargs redis-cli DEL`

### Issue: Graceful Degradation

**Symptoms**: Nexus Router running but logs show "running without caching"

**This is expected behavior** - Nexus Router is designed to work without Redis:
- No errors thrown
- Falls back to in-memory caching
- Metrics still collected (in-memory)
- Rate limiting still works (in-memory)
- Performance impact: Minimal for low-medium traffic

**When to fix**:
- High traffic (>1000 req/min) - cache misses cause performance issues
- Multiple Nexus Router instances - need shared cache
- Persistent metrics required - need cross-restart storage

## Network Configuration Examples

### Single Network (Recommended)

```yaml
# infra/dual-orchestrator/claude-flow/docker-compose.yml
services:
  nexus-router:
    networks:
      - orchestrator-network
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

  claude-flow:
    networks:
      - orchestrator-network
    environment:
      - REDIS_HOST=redis
      - REDIS_DB=1

  redis:
    networks:
      - orchestrator-network
```

### Multiple Networks (Advanced)

```yaml
# If services are on different networks
services:
  nexus-router:
    networks:
      - nyra-network
      - orchestrator-network  # Join Claude Flow's network
    environment:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0

networks:
  nyra-network:
    external: true
  orchestrator-network:
    external: true
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Redis Memory Usage**
   ```bash
   redis-cli INFO memory | grep used_memory_human
   ```

2. **Connection Count**
   ```bash
   redis-cli INFO clients | grep connected_clients
   ```

3. **Cache Hit Rate**
   ```bash
   # Nexus Router exposes this via /api/metrics
   curl http://localhost:8000/api/metrics | jq '.cacheHitRate'
   ```

4. **Eviction Count**
   ```bash
   redis-cli INFO stats | grep evicted_keys
   ```

### Prometheus Integration

Nexus Router exposes Redis metrics at `/api/metrics`:

```yaml
# Add to prometheus.yml
scrape_configs:
  - job_name: 'nexus-router'
    static_configs:
      - targets: ['nexus-router:8000']
    metrics_path: '/api/metrics'
```

## Security Best Practices

1. **Strong Password**: Use 32+ character random password
   ```bash
   # Generate strong password
   openssl rand -base64 32
   ```

2. **Network Isolation**: Keep Redis on private network
   ```yaml
   redis:
     networks:
       - orchestrator-network  # Internal only
     # Don't expose ports publicly:
     # ports:
     #   - "6379:6379"  # ❌ Remove this in production
   ```

3. **TLS/SSL**: Enable Redis SSL in production
   ```yaml
   redis:
     command: >
       redis-server
       --requirepass ${REDIS_PASSWORD}
       --tls-port 6380
       --tls-cert-file /certs/redis.crt
       --tls-key-file /certs/redis.key
   ```

4. **Read-Only Replicas**: For high-read workloads
   ```yaml
   redis-replica:
     image: redis:7-alpine
     command: redis-server --replicaof redis 6379
   ```

## Migration from Standalone Redis

If you previously had a separate Redis instance for Nexus Router:

### 1. Backup Existing Data

```bash
# Before migration
redis-cli -h old-redis SAVE
docker cp old-redis:/data/dump.rdb ./nexus-router-backup.rdb
```

### 2. Migrate to Shared Redis

```bash
# Load into new Redis (DB 0)
cat nexus-router-backup.rdb | docker exec -i redis-orchestrator redis-cli --pipe
```

### 3. Update Configuration

Update `REDIS_URL` in all environments, restart services.

### 4. Verify Migration

```bash
# Check key count
redis-cli -h redis SELECT 0
redis-cli -h redis DBSIZE
```

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [ioredis Client](https://github.com/luin/ioredis)
- [Redis Best Practices](https://redis.io/docs/management/optimization/)
- [Redis Persistence](https://redis.io/docs/management/persistence/)

## Support

For issues specific to Nexus Router Redis integration:
1. Check logs: `docker logs nyra-nexus-router`
2. Review this document
3. Open an issue in the Project Nyra repository
