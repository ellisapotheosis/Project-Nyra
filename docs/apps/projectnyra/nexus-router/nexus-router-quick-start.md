# Nexus Router - Quick Start Guide

**Version**: 1.0.0
**Last Updated**: 2026-01-18

## Prerequisites

- Docker 24.0+
- Docker Compose 2.0+
- Redis (included in compose)
- Optional: NVIDIA GPU with Docker GPU support

## Quick Setup

### 1. Environment Configuration

Create `.env` file in project root:

```bash
# Copy example
cp .env.example .env

# Required variables
REDIS_PASSWORD=your-secure-password-here
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx

# Optional (if using Infisical)
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_TOKEN=your-token
```

### 2. Start Base Services

```bash
# Start core services (Grafbase Nexus, LiteLLM, etc.)
docker compose up -d

# Verify services are running
docker compose ps
```

### 3. Start Nexus Router

#### Option A: Cloud-Only Mode (No GPU)

```bash
# Start nexus-router with Redis
docker compose -f docker-compose.nexus-router.yml up -d nexus-router redis

# Check health
curl http://localhost:8000/health
```

#### Option B: With Local GPU Workers

```bash
# On GPU PC 1 (RTX 5090)
docker compose -f docker-compose.nexus-router.yml --profile gpu-5090 up -d

# On GPU PC 2 (RTX 3090)
docker compose -f docker-compose.nexus-router.yml --profile gpu-3090 up -d

# On GPU PC 3 (RTX 3060)
docker compose -f docker-compose.nexus-router.yml --profile gpu-3060 up -d

# On orchestrator PC
docker compose -f docker-compose.nexus-router.yml up -d nexus-router redis
```

#### Option C: All-in-One (All GPU workers on one machine)

```bash
# Start all workers and router
docker compose -f docker-compose.nexus-router.yml --profile all-gpus up -d

# Check all services
docker compose -f docker-compose.nexus-router.yml ps
```

### 4. Verify Installation

```bash
# Health check
curl http://localhost:8000/health

# List available models
curl http://localhost:8000/v1/models

# Test chat completion
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

Expected output:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1705586400,
  "model": "llama-3.1-70b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ]
}
```

## Configuration

### Routing Strategies

Edit environment variables in `docker-compose.nexus-router.yml`:

```yaml
# Cost-Optimized (Default) - 90% local, 10% cloud
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true

# Latency-Optimized - Fastest response
MODEL_ROUTING_STRATEGY=latency-optimized
MODEL_ROUTING_PREFER_LOCAL=false

# Quality-Optimized - Best models
MODEL_ROUTING_STRATEGY=quality-optimized
MODEL_ROUTING_COST_THRESHOLD=1.00
```

### Redis Configuration

Redis is shared across multiple services:

- Nexus Router (cache)
- Claude Flow (memory)
- Rate limiting
- Session storage

Configuration: `configs/redis/redis.conf`

```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
requirepass your-password-here
```

### Worker Configuration

GPU workers are optional and run on separate PCs:

```yaml
# Worker URLs (update with actual hostnames/IPs)
WORKER_5090_URL=http://gpu-worker-1:8001  # RTX 5090
WORKER_3090_URL=http://gpu-worker-2:8002  # RTX 3090
WORKER_3060_URL=http://gpu-worker-3:8003  # RTX 3060
```

For remote workers over network:

```yaml
WORKER_5090_URL=http://192.168.1.100:8001
WORKER_3090_URL=http://192.168.1.101:8002
WORKER_3060_URL=http://192.168.1.102:8003
```

## Client Integration

### Open-WebUI

Update Open-WebUI to use Nexus Router:

```yaml
# In docker-compose.yml
openwebui:
  environment:
    # Change from Grafbase Nexus
    # - OPENAI_API_BASE_URL=http://nexus:6000/llm/openai/v1
    # To Nexus Router
    - OPENAI_API_BASE_URL=http://nexus-router:8000/v1
    - OPENAI_API_KEY=dummy
```

### LobeChat

```yaml
lobechat:
  environment:
    - OPENAI_API_BASE_URL=http://nexus-router:8000/v1
    - OPENAI_API_KEY=dummy
```

### Custom Applications

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:8000/v1",
  apiKey: "dummy", // Not required for local setup
});

const completion = await client.chat.completions.create({
  model: "llama-3.1-70b",
  messages: [{ role: "user", content: "Hello!" }],
});
```

## Monitoring

### Health Endpoints

```bash
# Full health status
curl http://localhost:8000/health

# Liveness probe
curl http://localhost:8000/health/live

# Readiness probe
curl http://localhost:8000/health/ready
```

### Metrics

```bash
# View routing metrics
curl http://localhost:8000/health | jq '.metrics'

# Expected output:
{
  "totalRequests": 1543,
  "localRequests": 1389,
  "cloudRequests": 154,
  "localPercentage": "90.02",
  "cacheHits": 523,
  "cacheHitRate": "33.9"
}
```

### RedisInsight

Redis UI available at: http://localhost:8001

- View cache entries
- Monitor memory usage
- Analyze slow queries
- Real-time metrics

### Logs

```bash
# Nexus Router logs
docker logs -f nyra-nexus-router

# GPU Worker logs
docker logs -f nyra-gpu-worker-5090

# Redis logs
docker logs -f nyra-redis-shared
```

## Troubleshooting

### Service Won't Start

```bash
# Check container status
docker compose -f docker-compose.nexus-router.yml ps

# View logs
docker compose -f docker-compose.nexus-router.yml logs nexus-router

# Restart service
docker compose -f docker-compose.nexus-router.yml restart nexus-router
```

### Redis Connection Error

```bash
# Test Redis connectivity
docker exec -it nyra-redis-shared redis-cli -a your-password ping

# Should return: PONG

# If auth error, check REDIS_PASSWORD in .env
```

### GPU Worker Not Detected

```bash
# Check worker health from router
docker exec -it nyra-nexus-router curl http://gpu-worker-1:8001/health

# If connection refused, verify:
# 1. Worker is running: docker ps | grep gpu-worker
# 2. Network connectivity: docker network inspect nyra-network
# 3. Worker URL is correct in environment variables
```

### High Latency

```bash
# Check if using local workers
curl http://localhost:8000/health | jq '.metrics.localPercentage'

# Should be >70% for good local usage

# If low (<30%), check:
# 1. Workers are healthy
# 2. MODEL_ROUTING_PREFER_LOCAL=true
# 3. Redis is responding quickly
```

## Performance Tuning

### Increase Cache TTL

Edit `services/nexus-router/src/config.ts`:

```typescript
export const cacheConfig = {
  ttl: 3600, // 1 hour (increase for better cache hit rate)
  maxSize: 1000, // Max cached responses
};
```

### Adjust Worker Timeouts

```yaml
environment:
  # Increase for larger models
  - WORKER_5090_TIMEOUT=300 # 5 minutes
  - WORKER_3090_TIMEOUT=180 # 3 minutes
  - WORKER_3060_TIMEOUT=120 # 2 minutes
```

### Redis Memory Optimization

```conf
# In configs/redis/redis.conf
maxmemory 4gb  # Increase if needed
maxmemory-policy allkeys-lru  # LRU eviction
```

## Maintenance

### Update Nexus Router

```bash
# Pull latest code
git pull origin main

# Rebuild image
docker compose -f docker-compose.nexus-router.yml build nexus-router

# Restart with new image
docker compose -f docker-compose.nexus-router.yml up -d nexus-router
```

### Clear Cache

```bash
# Connect to Redis
docker exec -it nyra-redis-shared redis-cli -a your-password

# Clear all cache
FLUSHDB

# Or clear specific pattern
KEYS "nexus-router:*" | xargs DEL
```

### Backup Redis Data

```bash
# Create backup
docker exec nyra-redis-shared redis-cli -a your-password BGSAVE

# Copy backup file
docker cp nyra-redis-shared:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb
```

## Production Checklist

- [ ] Set strong REDIS_PASSWORD in .env
- [ ] Configure API keys (ANTHROPIC_API_KEY, OPENROUTER_API_KEY)
- [ ] Set LOG_LEVEL=info (not debug)
- [ ] Enable monitoring (Prometheus/Grafana)
- [ ] Configure rate limiting
- [ ] Set up log aggregation
- [ ] Enable TLS for external access
- [ ] Configure backup strategy
- [ ] Test failover scenarios
- [ ] Document runbook procedures

## Next Steps

1. Read the [Architecture Guide](../architecture/nexus-router-integration.md)
2. Review [Security Configuration](../security/nexus-router-security.md)
3. Set up [Monitoring Dashboard](../monitoring/nexus-router-dashboard.md)
4. Configure [Cloudflare Tunnel](../../configs/cloudflare/README.md)

## Support

- Documentation: `/docs`
- GitHub Issues: [Create Issue](https://github.com/your-org/project-nyra/issues)
- Health Check: `curl http://localhost:8000/health`
