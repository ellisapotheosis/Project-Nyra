# Quick Redis Setup for Nexus Router

## 🚀 5-Minute Setup

This guide shows you how to connect Nexus Router to your existing Redis container (shared with Claude Flow).

## Prerequisites

- Docker and Docker Compose installed
- Claude Flow Redis container running (`redis-orchestrator`)
- `REDIS_PASSWORD` set in your environment

## Setup Steps

### Step 1: Set Redis Password (if not already set)

```bash
# Generate a strong password (copy the output)
openssl rand -base64 32

# Add to your .env file in project root
echo "REDIS_PASSWORD=your-generated-password-here" >> .env
```

### Step 2: Update Nexus Router Environment

**Option A: For Docker Deployment** (Recommended)

Update your docker-compose.yml where `nexus-router` is defined:

```yaml
services:
  nexus-router:
    image: project-nyra/nexus-router:latest
    container_name: nyra-nexus-router
    ports:
      - "6000:6000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}
      # Add these Redis configuration lines:
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379/0
    networks:
      - nyra-network
      - orchestrator-network  # IMPORTANT: Join Claude Flow's network
    depends_on:
      redis:
        condition: service_healthy
```

**Option B: For Local Development**

Update `services/nexus-router/.env.local`:

```bash
# Replace the REDIS_URL line with:
REDIS_URL=redis://:your-redis-password-here@localhost:6379/0
```

### Step 3: Verify Network Configuration

Ensure both services can communicate:

```bash
# Check if nexus-router is on the orchestrator-network
docker network inspect orchestrator-network

# You should see:
# - redis-orchestrator
# - claude-flow (or similar)
# - nexus-router (after Step 4)
```

### Step 4: Restart Nexus Router

```bash
# If using docker-compose
docker-compose restart nexus-router

# Or rebuild and start
docker-compose up -d --build nexus-router
```

### Step 5: Verify Connection

Check the logs for successful Redis connection:

```bash
# View logs
docker logs nyra-nexus-router -f

# Look for this line:
# ✅ "Redis connected - caching enabled"

# If you see this instead:
# ⚠️ "Redis unavailable - running without caching"
# Then follow the troubleshooting steps below
```

## Quick Test

Test Redis connectivity from Nexus Router:

```bash
# Enter the container
docker exec -it nyra-nexus-router sh

# Try to connect to Redis (inside container)
nc -zv redis 6379

# Should output:
# redis (172.20.0.x:6379) open

# If nc is not available, try curl to Nexus Router health endpoint
curl http://localhost:6000/health
```

## Verify Data Isolation

Make sure Nexus Router and Claude Flow use different databases:

```bash
# Connect to Redis
docker exec -it redis-orchestrator redis-cli -a ${REDIS_PASSWORD}

# Check Nexus Router keys (DB 0)
SELECT 0
KEYS nexus:*

# Check Claude Flow keys (DB 1)
SELECT 1
KEYS *

# They should be separate!
```

## Troubleshooting

### ❌ "Connection Refused"

**Problem**: Nexus Router can't reach Redis

**Solutions**:
1. Check if Redis is running: `docker ps | grep redis`
2. Ensure both containers are on `orchestrator-network`
3. Verify hostname is `redis` (not `redis-orchestrator` or `localhost`)

**Quick Fix**:
```bash
# Add nexus-router to the network
docker network connect orchestrator-network nyra-nexus-router
docker restart nyra-nexus-router
```

### ❌ "NOAUTH Authentication required"

**Problem**: Password is missing or incorrect

**Solutions**:
1. Check password format in URL: `redis://:password@host:6379/0` (note the colon before password)
2. Verify password: `docker exec redis-orchestrator env | grep REDIS_PASSWORD`
3. Ensure password in URL matches Redis password

**Quick Fix**:
```bash
# Test password manually
docker exec redis-orchestrator redis-cli -a ${REDIS_PASSWORD} ping
# Should return: PONG

# Update .env with correct password
export REDIS_PASSWORD="your-correct-password"
docker-compose up -d nexus-router
```

### ❌ "timeout after 5s"

**Problem**: Network or DNS issue

**Solutions**:
1. Check container can resolve `redis`: `docker exec nyra-nexus-router nslookup redis`
2. Verify Redis is healthy: `docker ps | grep redis-orchestrator`
3. Check if Redis is accepting connections: `docker logs redis-orchestrator`

**Quick Fix**:
```bash
# Use IP instead of hostname (temporary workaround)
REDIS_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' redis-orchestrator)
echo "REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_IP}:6379/0"
# Copy this URL to your .env file
```

### ⚠️ "running without caching" (Graceful Degradation)

**Problem**: Redis connection failed, but Nexus Router is still running

**This is expected behavior** - Nexus Router works without Redis:
- All features still work
- Uses in-memory cache instead
- Performance is fine for low-medium traffic

**When to fix**:
- High traffic (>1000 req/min)
- Multiple Nexus Router instances
- Need persistent metrics across restarts

## Configuration Reference

### Database Allocation

| Service | Database | Keys Pattern |
|---------|----------|--------------|
| Nexus Router | DB 0 | `nexus:*` |
| Claude Flow | DB 1 | `*` |
| Available | DB 2-15 | Future services |

### Connection String Format

```
redis://[username]:password@hostname:port/database
```

**Examples**:
```bash
# Docker internal (recommended)
redis://:mypassword@redis:6379/0

# Localhost (development)
redis://:mypassword@localhost:6379/0

# With username (advanced)
redis://myuser:mypassword@redis:6379/0

# No password (local dev only)
redis://localhost:6379/0
```

### Environment Variables

| Variable | Docker Value | Local Dev Value |
|----------|--------------|-----------------|
| `REDIS_URL` | `redis://:${REDIS_PASSWORD}@redis:6379/0` | `redis://localhost:6379` |
| `REDIS_PASSWORD` | Strong random password | (empty) |

## Health Check Endpoints

Check if Nexus Router is connected to Redis:

```bash
# Health endpoint
curl http://localhost:8000/health | jq

# Should include:
{
  "status": "healthy",
  "redis": "connected",  # or "unavailable"
  "timestamp": "2026-01-18T..."
}

# Metrics endpoint (shows cache stats)
curl http://localhost:8000/api/metrics | jq '.cacheHitRate'
```

## Performance Impact

**With Redis** (Recommended):
- ✅ Shared cache across multiple Nexus Router instances
- ✅ Persistent metrics across restarts
- ✅ Distributed rate limiting
- ✅ Request deduplication
- ✅ <1ms cache lookups

**Without Redis** (Fallback):
- ✅ Still works perfectly
- ⚠️ In-memory cache only (lost on restart)
- ⚠️ Rate limits per-instance only
- ⚠️ Metrics reset on restart
- ⚠️ No request deduplication across instances

## Next Steps

After successful setup:

1. **Monitor Redis usage**:
   ```bash
   docker exec redis-orchestrator redis-cli -a ${REDIS_PASSWORD} INFO memory
   ```

2. **Set up alerts** (optional):
   - Add Prometheus scraping for Nexus Router metrics
   - Configure Grafana dashboards
   - Set up alerts for Redis connection failures

3. **Optimize cache TTLs** (optional):
   - Adjust `cacheTtl` in config based on your traffic patterns
   - Monitor cache hit rates
   - Fine-tune based on memory usage

4. **Read full documentation**:
   - See `REDIS-SETUP.md` for advanced configuration
   - Security best practices
   - Monitoring and troubleshooting

## Success Checklist

- [ ] Redis password set in environment
- [ ] Nexus Router environment updated with Redis URL
- [ ] Both containers on `orchestrator-network`
- [ ] Nexus Router restarted
- [ ] Logs show "Redis connected - caching enabled"
- [ ] Health endpoint shows `"redis": "connected"`
- [ ] Keys appear in DB 0: `KEYS nexus:*` returns results
- [ ] No keys leaked to DB 1: `SELECT 1; KEYS nexus:*` returns empty

## Support

If you encounter issues:
1. Check logs: `docker logs nyra-nexus-router -f`
2. Check Redis logs: `docker logs redis-orchestrator -f`
3. Review `REDIS-SETUP.md` for detailed troubleshooting
4. Open an issue in the Project Nyra repository
