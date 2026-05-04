# Nexus Router Integration - Architecture & Routing Guide

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: 2026-01-18

## Overview

Project Nyra uses TWO complementary routing systems:

1. **Grafbase Nexus** (port 6000) - MCP server aggregation and basic LLM routing
2. **Custom Nexus Router** (port 8000) - Intelligent cost-optimized routing with local GPU support

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  Open-WebUI  │  │   LobeChat   │  │ Custom Apps  │           │
│  │  (port 8080) │  │ (port 3334)  │  │              │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
└─────────┼──────────────────┼──────────────────┼──────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌──────────────────────┐            ┌──────────────────────┐
│   Grafbase Nexus     │            │   Nexus Router       │
│   (port 6000)        │            │   (port 8000)        │
│                      │            │                      │
│ • MCP Aggregation    │            │ • Cost Optimization  │
│ • Basic LLM Routing  │            │ • Local GPU Priority │
│ • Policy Control     │            │ • Cloud Fallback     │
│                      │            │ • Response Caching   │
└──────────┬───────────┘            └──────────┬───────────┘
           │                                   │
           ├───────────────────────────────────┤
           │                                   │
           ▼                                   ▼
┌──────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ LiteLLM  │  │  Letta   │  │  Mem0    │  │  Redis  │ │
│  │ (4000)   │  │  (8283)  │  │  (4321)  │  │  (6379) │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                GPU Workers (Optional)                     │
│  ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ │
│  │ RTX 5090       │ │ RTX 3090       │ │ RTX 3060     │ │
│  │ 48GB VRAM      │ │ 24GB VRAM      │ │ 12GB VRAM    │ │
│  │ Port 8001      │ │ Port 8002      │ │ Port 8003    │ │
│  │ • Llama 405B   │ │ • Llama 70B    │ │ • Coder 6.7B │ │
│  │ • DeepSeek V3  │ │ • Qwen 32B     │ │ • Qwen 7B    │ │
│  │ • Reasoning    │ │ • Analysis     │ │ • Coding     │ │
│  └────────────────┘ └────────────────┘ └──────────────┘ │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│              Cloud Providers (Fallback)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  Anthropic   │  │  OpenRouter  │  │    Gemini    │   │
│  │ Claude 4.5   │  │  DeepSeek R1 │  │  Gemini 2.0  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└──────────────────────────────────────────────────────────┘
```

## Service Endpoints

### External Services
| Service | Port | Purpose | OpenAPI Compatible |
|---------|------|---------|-------------------|
| Grafbase Nexus | 6000 | MCP aggregation, basic routing | ✅ Yes |
| Nexus Router | 8000 | Intelligent cost-optimized routing | ✅ Yes |
| Open-WebUI | 8080 | Chat interface | N/A |
| LobeChat | 3334 | Alternative chat UI | N/A |

### Internal Services
| Service | Port | Purpose |
|---------|------|---------|
| Redis | 6379 | Shared cache |
| RedisInsight | 8001 | Redis UI |
| LiteLLM | 4000 | Model proxy |
| Letta | 8283 | Agent state |
| Mem0 | 4321 | Memory store |

### GPU Workers (Optional, PC-specific)
| Worker | Port | GPU | VRAM | Models | Primary Use |
|--------|------|-----|------|--------|-------------|
| Worker 1 | 8001 | RTX 5090 | 48GB | Llama 405B, DeepSeek V3 | Reasoning |
| Worker 2 | 8002 | RTX 3090 | 24GB | Llama 70B, Qwen 32B | Analysis |
| Worker 3 | 8003 | RTX 3060 | 12GB | Coder 6.7B, Qwen 7B | Coding |

## Routing Strategies

### Grafbase Nexus (Port 6000)
**Strategy**: Policy-based routing with MCP server aggregation

```toml
[routing]
strategy = "cost_based"
cost_threshold = 0.001

[mcp]
enabled = true
proxy_mode = true
aggregation = true
```

**Use Cases**:
- MCP server aggregation (Letta, Mem0, letta)
- Policy-controlled tool access
- Basic LLM provider selection
- Centralized authentication

### Nexus Router (Port 8000)
**Strategy**: Intelligent cost-optimized routing

**Default Flow**:
1. Check request cache (Redis) → Return if hit (~5-10ms)
2. Evaluate model requirements (context length, capabilities)
3. Check local GPU worker availability
4. Route to healthy local worker with capacity
5. Fallback to cloud if no local workers available
6. Cache successful responses

**Routing Strategies**:
```typescript
// Cost-Optimized (Default)
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true

// Latency-Optimized
MODEL_ROUTING_STRATEGY=latency-optimized
MODEL_ROUTING_PREFER_LOCAL=false

// Quality-Optimized
MODEL_ROUTING_STRATEGY=quality-optimized
MODEL_ROUTING_COST_THRESHOLD=1.00
```

## Network Configuration

### Docker Network
```yaml
networks:
  nyra:
    name: nyra-network
    driver: bridge
```

All services connect via the `nyra-network` bridge network.

### Service Discovery
Services communicate using Docker DNS:
- `redis:6379` - Shared Redis cache
- `litellm:4000` - LiteLLM proxy
- `nexus:6000` - Grafbase Nexus
- `nexus-router:8000` - Custom Nexus Router
- `gpu-worker-1:8001` - RTX 5090 worker
- `gpu-worker-2:8002` - RTX 3090 worker
- `gpu-worker-3:8003` - RTX 3060 worker

### Port Allocation
```
6000  - Grafbase Nexus
6379  - Redis
8000  - Nexus Router
8001  - RedisInsight / GPU Worker 1
8002  - GPU Worker 2
8003  - GPU Worker 3
8080  - Open-WebUI
4000  - LiteLLM
4001  - Nexus Router MCP Proxy
4321  - Mem0
8283  - Letta
```

## Environment Variables

### Nexus Router Configuration
```bash
# Server
NEXUS_ROUTER_PORT=8000
NEXUS_ROUTER_MCP_PORT=4001
NODE_ENV=production
LOG_LEVEL=info

# Redis (shared cache)
REDIS_URL=redis://:changeme@redis:6379/0

# Routing Strategy
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true
MODEL_ROUTING_COST_THRESHOLD=0.10

# GPU Workers
WORKER_5090_URL=http://gpu-worker-1:8001
WORKER_3090_URL=http://gpu-worker-2:8002
WORKER_3060_URL=http://gpu-worker-3:8003

# Cloud Providers
ANTHROPIC_API_KEY=sk-ant-xxxxx
OPENROUTER_API_KEY=sk-or-xxxxx
```

### Redis Configuration
```bash
REDIS_PASSWORD=changeme
```

## Deployment Scenarios

### Scenario 1: Orchestrator Only (No GPU)
```bash
# Start base services
docker compose -f docker-compose.yml up -d

# Start nexus-router (cloud-only mode)
docker compose -f docker-compose.nexus-router.yml up -d nexus-router redis
```

### Scenario 2: Orchestrator + Single GPU Worker
```bash
# On GPU PC, start worker with profile
docker compose -f docker-compose.nexus-router.yml --profile gpu-5090 up -d

# On orchestrator, start router pointing to worker
docker compose -f docker-compose.nexus-router.yml up -d nexus-router redis
```

### Scenario 3: Full Multi-GPU Setup
```bash
# On each GPU PC, start respective worker
# PC 1 (RTX 5090):
docker compose -f docker-compose.nexus-router.yml --profile gpu-5090 up -d

# PC 2 (RTX 3090):
docker compose -f docker-compose.nexus-router.yml --profile gpu-3090 up -d

# PC 3 (RTX 3060):
docker compose -f docker-compose.nexus-router.yml --profile gpu-3060 up -d

# On orchestrator:
docker compose -f docker-compose.nexus-router.yml up -d nexus-router redis
```

## Performance Metrics

### Latency Targets
| Routing Path | Target Latency | Cache Hit |
|-------------|----------------|-----------|
| Cache Hit | 5-10ms | ✅ |
| Local GPU (Available) | 50-200ms | ❌ |
| Cloud Fallback | 500-2000ms | ❌ |

### Cost Savings
| Scenario | Local % | Cloud % | Cost Savings |
|----------|---------|---------|--------------|
| Full GPU Setup | 90% | 10% | ~90% |
| Single GPU | 60% | 40% | ~60% |
| Cloud Only | 0% | 100% | 0% |

## Monitoring & Health Checks

### Nexus Router Health
```bash
# Full health status
curl http://localhost:8000/health

# Liveness check
curl http://localhost:8000/health/live

# Readiness check
curl http://localhost:8000/health/ready
```

### Sample Health Response
```json
{
  "status": "healthy",
  "timestamp": "2026-01-18T12:34:56.789Z",
  "uptime": 86400,
  "components": {
    "redis": {
      "status": "healthy",
      "latency": 2
    },
    "workers": {
      "healthy": 2,
      "total": 3,
      "details": [
        {
          "id": "gpu-worker-1",
          "healthy": true,
          "responseTime": 45,
          "lastCheck": "2026-01-18T12:34:50.000Z"
        }
      ]
    }
  },
  "metrics": {
    "totalRequests": 1543,
    "localRequests": 1389,
    "cloudRequests": 154,
    "localPercentage": "90.02",
    "cacheHits": 523,
    "cacheHitRate": "33.9"
  }
}
```

## Security

### Rate Limiting
- 100 requests/minute per IP
- Configurable per service
- Redis-backed distributed rate limiting

### CORS Configuration
```javascript
CORS_ALLOWED_ORIGINS=http://localhost:3333,http://localhost:3334,http://localhost:8080
```

### Authentication
- API key authentication via headers
- JWT support for MCP proxy
- Secrets via Infisical

### Network Security
- Internal services not exposed to host
- TLS termination at gateway
- Docker network isolation

## Troubleshooting

### Issue: No Local Workers Available
**Symptoms**: All requests going to cloud, high costs

**Solutions**:
1. Check worker health: `curl http://localhost:8000/health`
2. Verify worker URLs are reachable from router
3. Check GPU worker logs: `docker logs gpu-worker-1`
4. Verify Redis connectivity
5. Check `MODEL_ROUTING_PREFER_LOCAL=true`

### Issue: High Redis Memory Usage
**Symptoms**: Redis using >2GB RAM, cache evictions

**Solutions**:
1. Check Redis memory: `redis-cli INFO memory`
2. Adjust maxmemory in redis.conf
3. Clear cache: `redis-cli FLUSHDB`
4. Review cache TTL settings
5. Monitor with RedisInsight: http://localhost:8001

### Issue: Slow Cloud Responses
**Symptoms**: 2-5s latencies for cloud requests

**Solutions**:
1. Check API key validity
2. Verify network connectivity
3. Review rate limits on cloud provider
4. Consider enabling request queuing
5. Use faster cloud models (Gemini Flash)

## Migration Path

### From Existing Setup
1. Deploy nexus-router alongside existing Grafbase Nexus
2. Update client applications one at a time
3. Monitor metrics to compare performance
4. Gradually migrate all traffic
5. Keep Grafbase Nexus for MCP aggregation

### Rollback Plan
1. Update client apps to use Grafbase Nexus (port 6000)
2. Stop nexus-router: `docker compose -f docker-compose.nexus-router.yml down`
3. Existing services continue uninterrupted

## References

- [Nexus Router README](../../services/nexus-router/README.md)
- [Nexus Router Dockerfile](../../services/nexus-router/Dockerfile)
- [Redis Configuration](../../configs/redis/redis.conf)
- [GitHub Actions CI/CD](../../.github/workflows/nexus-router-ci.yml)

## Support

For issues or questions:
- GitHub Issues: [Project Nyra Issues](https://github.com/your-org/project-nyra/issues)
- Documentation: `/services/nexus-router/docs`
- Health Check: `curl http://localhost:8000/health`
