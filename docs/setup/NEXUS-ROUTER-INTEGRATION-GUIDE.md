# Nexus Router Integration Guide

**Version**: 1.0.0
**Date**: January 18, 2026
**Service Port**: 8000
**MCP Port**: 4001

## Overview

Nexus Router is the intelligent LLM request routing gateway for Project Nyra. It optimizes costs by routing requests to local GPU workers first, with automatic fallback to cloud APIs when needed. It also acts as an MCP aggregation gateway, providing a single endpoint for all MCP servers.

## Table of Contents

1. [Architecture](#architecture)
2. [Key Features](#key-features)
3. [Integration Patterns](#integration-patterns)
4. [MCP Proxy Integration](#mcp-proxy-integration)
5. [Service Configuration](#service-configuration)
6. [Monitoring and Health Checks](#monitoring-and-health-checks)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Client Applications                   │
│   Open-WebUI │ LobeChat │ Dify │ Custom Apps │ MCP Clients │
└────────────────────┬─────────────────────────────────────────┘
                     │
                     ▼
     ┌───────────────────────────────────────────────┐
     │         Nexus Router (Port 8000, 4001)        │
     │  ┌──────────────────────────────────────┐     │
     │  │  HTTP API (Port 8000)                │     │
     │  │  - /v1/chat/completions              │     │
     │  │  - /v1/models                        │     │
     │  │  - /health                           │     │
     │  └──────────────┬───────────────────────┘     │
     │  ┌──────────────────────────────────────┐     │
     │  │  MCP Proxy (Port 4001)               │     │
     │  │  - /mcp/health                       │     │
     │  │  - /mcp/servers                      │     │
     │  │  - /mcp/*                            │     │
     │  └──────────────┬───────────────────────┘     │
     │  ┌──────────────────────────────────────┐     │
     │  │  Request Router                      │     │
     │  │  - Cost Optimization                 │     │
     │  │  - Load Balancing                    │     │
     │  │  - Health Checking                   │     │
     │  │  - Response Caching                  │     │
     │  └──────────────┬───────────────────────┘     │
     └─────────────────┼───────────────────────────── ┘
                       │
            ┌──────────┴───────────┐
            │                      │
            ▼                      ▼
┌───────────────────────┐  ┌──────────────────────┐
│   Local GPU Workers   │  │    Cloud APIs        │
│                       │  │                      │
│  ┌─────────────────┐  │  │  ┌────────────────┐ │
│  │ Worker 1: 5090  │  │  │  │ Anthropic     │ │
│  │ llama-3.1-405b  │  │  │  │ Claude Sonnet │ │
│  │ qwen-2.5-72b    │  │  │  │               │ │
│  │ deepseek-v3     │  │  │  └────────────────┘ │
│  └─────────────────┘  │  │                      │
│  ┌─────────────────┐  │  │  ┌────────────────┐ │
│  │ Worker 2: 3090  │  │  │  │ OpenRouter    │ │
│  │ llama-3.1-70b   │  │  │  │ Multi-model   │ │
│  │ qwen-2.5-32b    │  │  │  │               │ │
│  │ mixtral-8x22b   │  │  │  └────────────────┘ │
│  └─────────────────┘  │  │                      │
│  ┌─────────────────┐  │  │  ┌────────────────┐ │
│  │ Worker 3: 3060  │  │  │  │ Google        │ │
│  │ llama-3.1-8b    │  │  │  │ Gemini        │ │
│  │ qwen-2.5-7b     │  │  │  │               │ │
│  │ deepseek-coder  │  │  │  └────────────────┘ │
│  └─────────────────┘  │  │                      │
└───────────────────────┘  └──────────────────────┘

            ▲
            │
     ┌──────┴──────────────────────────────────────┐
     │  MCP Server Aggregation (via Port 4001)     │
     │  ┌──────────────────────────────────────┐   │
     │  │ - Gemini MCP (8085)                  │   │
     │  │ - Serena MCP (8086)                  │   │
     │  │ - Mem0 (8080)                        │   │
     │  │ - Claude Flow MCP                    │   │
     │  │ - Ruv-Swarm MCP                      │   │
     │  │ - Bitwarden MCP                      │   │
     │  │ - Sequential Thinking MCP            │   │
     │  └──────────────────────────────────────┘   │
     └─────────────────────────────────────────────┘
```

---

## Key Features

### 1. Cost Optimization

**90% cost savings** by routing to local GPU workers first:

```javascript
// Automatic routing logic
if (localWorkerAvailable && modelSupported) {
  route = "local-gpu-worker";  // ~$0.001 per 1K tokens
} else {
  route = "cloud-api";         // ~$0.003-$0.015 per 1K tokens
}
```

**Metrics tracking:**
- `localRequests`: Count of local GPU requests
- `cloudRequests`: Count of cloud API requests
- `localPercentage`: % of requests served locally
- `costSavings`: Estimated savings in USD

### 2. Intelligent Fallback

Automatic failover to cloud APIs when:
- Local workers are at capacity
- Requested model not available locally
- Worker health check fails
- Response timeout exceeded

### 3. Request Caching

Redis-based caching for identical requests:

```javascript
// Cache configuration
cache: {
  ttl: 3600,              // 1 hour
  key: hash(prompt + model + parameters),
  provider: "redis"
}
```

**Benefits:**
- Sub-10ms response time for cache hits
- Reduced GPU load
- Lower costs
- Improved latency

### 4. Load Balancing

Distributes load across available GPU workers:

```javascript
// Load balancing strategy
workers: [
  { id: "worker-1", load: 0.4, healthy: true },  // 40% capacity
  { id: "worker-2", load: 0.8, healthy: true },  // 80% capacity
  { id: "worker-3", load: 0.2, healthy: true }   // 20% capacity - SELECTED
]
```

### 5. Health Monitoring

Continuous worker health checks:

```javascript
healthCheck: {
  interval: 30000,        // 30 seconds
  timeout: 5000,          // 5 seconds
  retries: 3,
  endpoint: "/health"
}
```

---

## Integration Patterns

### Pattern 1: OpenAI-Compatible Integration

Nexus Router provides an OpenAI-compatible API endpoint:

```yaml
services:
  my-app:
    environment:
      # Point to Nexus Router instead of OpenAI
      OPENAI_API_BASE_URL: http://nexus-router:8000/v1
      OPENAI_API_KEY: ${ANTHROPIC_API_KEY}  # Used for cloud fallback
```

**Example API call:**

```bash
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

**Response:**

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1705531234,
  "model": "llama-3.1-70b",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I assist you today?"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  },
  "x-nexus-router": {
    "route": "local-worker-2",
    "cached": false,
    "latency_ms": 156
  }
}
```

---

### Pattern 2: Letta Memory Integration

Letta uses Nexus Router for all LLM requests:

```yaml
services:
  letta:
    environment:
      # Letta LLM endpoint
      LETTA_LLM_ENDPOINT: http://nexus-router:8000/v1
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}

  nexus-router:
    environment:
      # Nexus Router configuration
      MODEL_ROUTING_STRATEGY: cost-optimized
      MODEL_ROUTING_PREFER_LOCAL: "true"
      MODEL_ROUTING_FALLBACK_CLOUD: "true"
```

**Benefits:**
- Letta memory operations use local GPUs (90% savings)
- Automatic fallback to cloud for reliability
- Transparent to Letta - no code changes needed

---

### Pattern 3: Open-WebUI Integration

Open-WebUI connects to Nexus Router for all chat completions:

```yaml
services:
  open-webui:
    environment:
      # Use Nexus Router as backend
      OPENAI_API_BASE_URL: http://nexus-router:8000/v1
      OPENAI_API_KEY: ${ANTHROPIC_API_KEY}

      # Optional: Enable RAG
      ENABLE_RAG: "true"

  nexus-router:
    depends_on:
      - redis
```

**User Experience:**
- Select any model from `/v1/models` endpoint
- Nexus Router automatically routes to best available worker
- Transparent cost optimization
- Same chat experience, lower costs

---

### Pattern 4: Custom Application Integration

Integrate any application with Nexus Router:

```javascript
// Node.js example
const OpenAI = require('openai');

const client = new OpenAI({
  baseURL: 'http://nexus-router:8000/v1',
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function chat(message) {
  const response = await client.chat.completions.create({
    model: 'llama-3.1-70b',
    messages: [{ role: 'user', content: message }]
  });

  console.log('Response:', response.choices[0].message.content);
  console.log('Route:', response['x-nexus-router'].route);
  console.log('Latency:', response['x-nexus-router'].latency_ms + 'ms');
}

chat('What is the capital of France?');
```

```python
# Python example
from openai import OpenAI

client = OpenAI(
    base_url="http://nexus-router:8000/v1",
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)

def chat(message: str):
    response = client.chat.completions.create(
        model="llama-3.1-70b",
        messages=[{"role": "user", "content": message}]
    )

    print(f"Response: {response.choices[0].message.content}")
    print(f"Route: {response.x_nexus_router['route']}")
    print(f"Latency: {response.x_nexus_router['latency_ms']}ms")

chat("What is the capital of France?")
```

---

## MCP Proxy Integration

Nexus Router acts as an MCP aggregation gateway on port 4001.

### Available MCP Endpoints

```bash
# Health check
GET http://localhost:4001/mcp/health

# List registered MCP servers
GET http://localhost:4001/mcp/servers

# Forward to specific MCP server
POST http://localhost:4001/mcp/gemini/*
POST http://localhost:4001/mcp/serena/*
POST http://localhost:4001/mcp/mem0/*
POST http://localhost:4001/mcp/archon-os/*
```

### MCP Server Registry

Nexus Router aggregates these MCP servers:

| MCP Server | Port | Purpose | Proxy Path |
|------------|------|---------|------------|
| Gemini MCP | 8085 | Google Gemini integration | /mcp/gemini/* |
| Serena MCP | 8086 | Serena orchestration | /mcp/serena/* |
| Mem0 | 8080 | Memory management | /mcp/mem0/* |
| Claude Flow MCP | - | Claude Flow tools | /mcp/archon-os/* |
| Ruv-Swarm MCP | - | Swarm coordination | /mcp/ruv-swarm/* |
| Bitwarden MCP | - | Secrets management | /mcp/bitwarden/* |
| Sequential Thinking | - | Reasoning chains | /mcp/sequential-thinking/* |

### MCP Client Configuration

Configure MCP clients to use Nexus Router gateway:

```typescript
// MCP client configuration
const mcpClient = new MCPClient({
  endpoint: 'http://nexus-router:4001/mcp',
  // All MCP servers accessible through single endpoint
});

// Example: Call Gemini MCP
const geminiResponse = await mcpClient.call('gemini/generate', {
  prompt: 'Hello, world!'
});

// Example: Call Mem0 MCP
const memoryResponse = await mcpClient.call('mem0/search', {
  query: 'user preferences'
});
```

### MCP Health Monitoring

Check MCP gateway health:

```bash
# Overall MCP health
curl http://localhost:4001/mcp/health

# Response:
{
  "status": "healthy",
  "servers": {
    "gemini": "healthy",
    "serena": "healthy",
    "mem0": "healthy",
    "archon-os": "healthy",
    "ruv-swarm": "degraded",
    "bitwarden": "healthy",
    "sequential-thinking": "healthy"
  },
  "totalServers": 7,
  "healthyServers": 6
}
```

---

## Service Configuration

### Environment Variables

Configure Nexus Router in `docker-compose.orchestration.yml`:

```yaml
services:
  nexus-router:
    image: node:20-alpine
    container_name: nyra-nexus-router
    environment:
      # Server configuration
      NODE_ENV: ${NODE_ENV:-production}
      PORT: ${NEXUS_ROUTER_PORT:-8000}
      MCP_PORT: ${NEXUS_ROUTER_MCP_PORT:-4001}

      # Redis for caching
      REDIS_URL: ${REDIS_URL:-redis://:redis_secure_pass@redis:6379}

      # Local GPU Workers
      WORKER_5090_URL: ${WORKER_5090_URL:-http://localhost:8001}
      WORKER_5090_MODELS: ${WORKER_5090_MODELS:-llama-3.1-405b,qwen-2.5-72b,deepseek-v3}

      WORKER_3090_URL: ${WORKER_3090_URL:-http://localhost:8002}
      WORKER_3090_MODELS: ${WORKER_3090_MODELS:-llama-3.1-70b,qwen-2.5-32b,mixtral-8x22b}

      WORKER_3060_URL: ${WORKER_3060_URL:-http://localhost:8003}
      WORKER_3060_MODELS: ${WORKER_3060_MODELS:-llama-3.1-8b,qwen-2.5-7b,deepseek-coder-6.7b}

      # Cloud API Fallbacks
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
      ANTHROPIC_MODEL: ${ANTHROPIC_MODEL:-claude-sonnet-4-20250514}

      OPENROUTER_API_KEY: ${OPENROUTER_API_KEY}
      OPENROUTER_BASE_URL: ${OPENROUTER_BASE_URL:-https://openrouter.ai/api/v1}

      # Routing Strategy
      MODEL_ROUTING_STRATEGY: ${MODEL_ROUTING_STRATEGY:-cost-optimized}
      MODEL_ROUTING_PREFER_LOCAL: ${MODEL_ROUTING_PREFER_LOCAL:-true}
      MODEL_ROUTING_FALLBACK_CLOUD: ${MODEL_ROUTING_FALLBACK_CLOUD:-true}
      MODEL_ROUTING_COST_THRESHOLD: ${MODEL_ROUTING_COST_THRESHOLD:-0.10}

    ports:
      - "${NEXUS_ROUTER_PORT:-8000}:${NEXUS_ROUTER_PORT:-8000}"
      - "${NEXUS_ROUTER_MCP_PORT:-4001}:${NEXUS_ROUTER_MCP_PORT:-4001}"

    networks:
      - nyra-network

    depends_on:
      - redis

    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Routing Strategies

#### Cost-Optimized (Default)

Prioritizes local GPU workers to minimize costs:

```yaml
MODEL_ROUTING_STRATEGY: cost-optimized
MODEL_ROUTING_PREFER_LOCAL: true
MODEL_ROUTING_FALLBACK_CLOUD: true
MODEL_ROUTING_COST_THRESHOLD: 0.10  # Max cost per 1K tokens
```

**Routing Logic:**
1. Check if model available on local GPU workers
2. Route to healthy local worker with capacity
3. Fallback to cloud if no local workers available
4. Cache response for future identical requests

**Use Cases:**
- Production deployments
- High-volume requests
- Cost-sensitive applications

---

#### Latency-Optimized

Prioritizes speed over cost:

```yaml
MODEL_ROUTING_STRATEGY: latency-optimized
MODEL_ROUTING_PREFER_LOCAL: false
MODEL_ROUTING_FALLBACK_CLOUD: true
```

**Routing Logic:**
1. Route to fastest available worker (cloud or local)
2. Prefer cloud for guaranteed low latency
3. Use local workers as backup

**Use Cases:**
- Real-time chat applications
- Interactive demos
- User-facing interfaces

---

#### Quality-Optimized

Prioritizes model quality and capabilities:

```yaml
MODEL_ROUTING_STRATEGY: quality-optimized
MODEL_ROUTING_PREFER_LOCAL: false
```

**Routing Logic:**
1. Route to best model for task type
2. Prefer larger models on more powerful GPUs
3. Use cloud premium models when needed (Claude Opus, GPT-4)

**Use Cases:**
- Complex reasoning tasks
- Code generation
- Research and analysis

---

### Worker Configuration

Configure GPU workers in `.env`:

```bash
# Worker 1: RTX 5090 (48GB VRAM)
WORKER_5090_URL=http://192.168.1.101:8001
WORKER_5090_MODELS=llama-3.1-405b,qwen-2.5-72b,deepseek-v3
WORKER_5090_MAX_CONCURRENT=4
WORKER_5090_TIMEOUT=180

# Worker 2: RTX 3090 (24GB VRAM)
WORKER_3090_URL=http://192.168.1.102:8002
WORKER_3090_MODELS=llama-3.1-70b,qwen-2.5-32b,mixtral-8x22b
WORKER_3090_MAX_CONCURRENT=6
WORKER_3090_TIMEOUT=120

# Worker 3: RTX 3060 (12GB VRAM)
WORKER_3060_URL=http://192.168.1.103:8003
WORKER_3060_MODELS=llama-3.1-8b,qwen-2.5-7b,deepseek-coder-6.7b
WORKER_3060_MAX_CONCURRENT=8
WORKER_3060_TIMEOUT=90
```

---

## Monitoring and Health Checks

### Health Endpoint

```bash
GET http://localhost:8000/health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 86400,
  "components": {
    "redis": {
      "status": "healthy",
      "latency_ms": 2
    },
    "workers": {
      "healthy": 2,
      "total": 3,
      "details": [
        {
          "id": "worker-5090",
          "url": "http://192.168.1.101:8001",
          "healthy": true,
          "responseTime": 45,
          "load": 0.4,
          "lastCheck": "2026-01-18T12:34:56.789Z"
        },
        {
          "id": "worker-3090",
          "url": "http://192.168.1.102:8002",
          "healthy": true,
          "responseTime": 52,
          "load": 0.6,
          "lastCheck": "2026-01-18T12:34:56.789Z"
        },
        {
          "id": "worker-3060",
          "url": "http://192.168.1.103:8003",
          "healthy": false,
          "error": "Connection timeout",
          "lastCheck": "2026-01-18T12:34:56.789Z"
        }
      ]
    }
  },
  "metrics": {
    "totalRequests": 15432,
    "localRequests": 13889,
    "cloudRequests": 1543,
    "cacheHits": 2341,
    "localPercentage": "90.02",
    "averageLatency": 125,
    "costSavings": "$142.37"
  }
}
```

### Metrics Dashboard

Access detailed metrics:

```bash
# Grafana dashboard
http://localhost:3000/d/nexus-router

# Prometheus metrics
http://localhost:9090/graph?g0.expr=nexus_router_requests_total
```

**Key Metrics:**
- `nexus_router_requests_total` - Total requests
- `nexus_router_local_requests` - Local GPU requests
- `nexus_router_cloud_requests` - Cloud API requests
- `nexus_router_cache_hits` - Cache hit rate
- `nexus_router_latency_seconds` - Response latency
- `nexus_router_worker_health` - Worker health status

### Alerting

Configure alerts in `infra/docker/observability/prometheus-alerts.yml`:

```yaml
groups:
  - name: nexus_router
    interval: 30s
    rules:
      - alert: NexusRouterDown
        expr: up{job="nexus-router"} == 0
        for: 2m
        annotations:
          summary: "Nexus Router is down"

      - alert: HighCloudUsage
        expr: nexus_router_cloud_percentage > 50
        for: 10m
        annotations:
          summary: "High cloud API usage (>50%)"

      - alert: WorkerUnhealthy
        expr: nexus_router_worker_health < 0.5
        for: 5m
        annotations:
          summary: "Less than 50% workers healthy"
```

---

## Troubleshooting

### Issue: Nexus Router Won't Start

**Symptoms:**
- Container exits immediately
- Port already in use

**Solutions:**

```bash
# Check port conflicts
netstat -ano | findstr :8000    # Windows
lsof -i :8000                   # Linux

# Check logs
docker compose logs nexus-router

# Verify Redis connection
docker compose exec nexus-router ping redis

# Restart
docker compose restart nexus-router
```

### Issue: All Requests Go to Cloud

**Symptoms:**
- `localPercentage` near 0%
- High costs

**Solutions:**

```bash
# Check worker health
curl http://localhost:8000/health | jq '.components.workers'

# Verify worker URLs
docker compose exec nexus-router env | grep WORKER_

# Test worker connectivity
curl http://192.168.1.101:8001/health

# Check routing strategy
docker compose exec nexus-router env | grep MODEL_ROUTING

# Restart with correct config
docker compose restart nexus-router
```

### Issue: MCP Proxy Not Working

**Symptoms:**
- MCP clients can't connect
- 502 Bad Gateway

**Solutions:**

```bash
# Check MCP port
docker compose ps nexus-router | grep 4001

# Test MCP health
curl http://localhost:4001/mcp/health

# List MCP servers
curl http://localhost:4001/mcp/servers

# Check logs
docker compose logs nexus-router | grep MCP

# Restart
docker compose restart nexus-router
```

### Issue: High Latency

**Symptoms:**
- Slow responses (>2s)
- Timeouts

**Solutions:**

```bash
# Check worker load
curl http://localhost:8000/health | jq '.components.workers.details[].load'

# Check Redis latency
docker compose exec nexus-router redis-cli --latency

# Monitor real-time
docker stats nexus-router

# Reduce cache TTL (if stale)
# Edit .env:
CACHE_TTL=300  # 5 minutes instead of 1 hour

# Restart
docker compose restart nexus-router
```

### Issue: Cache Not Working

**Symptoms:**
- `cacheHits` near 0
- Repeated requests not faster

**Solutions:**

```bash
# Check Redis connection
docker compose exec nexus-router redis-cli ping

# Check Redis memory
docker compose exec redis redis-cli info memory

# Verify cache config
docker compose exec nexus-router env | grep CACHE

# Clear cache (if corrupt)
docker compose exec redis redis-cli FLUSHDB

# Restart
docker compose restart nexus-router redis
```

---

## Best Practices

### 1. Configuration

- Use environment variables for all configuration
- Set appropriate worker URLs for your network
- Configure routing strategy based on use case
- Enable caching for production deployments
- Set reasonable timeouts for workers

### 2. Monitoring

- Monitor `localPercentage` - target 80%+
- Watch worker health status
- Set up alerts for degraded performance
- Track cost savings metrics
- Monitor cache hit rate

### 3. Performance

- Use Redis for caching
- Configure appropriate worker timeouts
- Set max concurrent requests per worker
- Use cost-optimized strategy for production
- Enable compression for large responses

### 4. Security

- Use Infisical for API key management
- Bind to 127.0.0.1 in production
- Enable rate limiting
- Use TLS for external communication
- Rotate API keys regularly

---

## Additional Resources

- Nexus Router README: `services/nexus-router/README.md`
- OpenAPI Specification: `services/nexus-router/docs/openapi.yaml`
- Example Integrations: `services/nexus-router/examples/`
- Performance Benchmarks: `services/nexus-router/docs/BENCHMARKS.md`

---

**Version**: 1.0.0
**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
**Port**: 8000 (HTTP), 4001 (MCP)
**Status**: Production Ready
