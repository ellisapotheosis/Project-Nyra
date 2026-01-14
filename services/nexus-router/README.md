# Nexus Router - Intelligent LLM Request Routing

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Port**: 8000
**MCP Port**: 4001

## Overview

Nexus Router is an intelligent LLM request routing service that optimizes costs by prioritizing local GPU workers and falling back to cloud APIs when needed. It acts as a unified gateway for all AI inference requests.

## Key Features

- **Cost Optimization**: Routes to local GPU workers first (90% cost savings)
- **Intelligent Fallback**: Automatic cloud failover for high availability
- **Request Caching**: Redis-based response caching for identical requests
- **Load Balancing**: Distributes load across available GPU workers
- **Health Monitoring**: Continuous worker health checks
- **OpenAI Compatible**: Drop-in replacement for OpenAI API
- **MCP Proxy**: Acts as aggregation gateway for all MCP servers

## Architecture

```
┌─────────────────┐
│   Client Apps   │
│ (Open-WebUI,    │
│  LobeChat, etc) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│     Nexus Router (8000)     │
│  ┌──────────────────────┐   │
│  │  Request Handler     │   │
│  │  - Caching          │   │
│  │  - Rate Limiting    │   │
│  │  - Load Balancing   │   │
│  └──────────┬───────────┘   │
└─────────────┼───────────────┘
              │
       ┌──────┴──────┐
       │             │
       ▼             ▼
┌──────────────┐ ┌──────────────┐
│ Local Workers│ │ Cloud APIs   │
│ - 5090 (48GB)│ │ - Anthropic  │
│ - 3090 (24GB)│ │ - OpenRouter │
│ - 3060 (12GB)│ │ - Gemini     │
└──────────────┘ └──────────────┘
```

## GPU Workers

### Worker 1: RTX 5090 (48GB VRAM)
- **Primary Use**: Reasoning tasks
- **Models**: llama-3.1-405b, qwen-2.5-72b, deepseek-v3
- **Max Concurrent**: 4 requests
- **Timeout**: 180 seconds

### Worker 2: RTX 3090 (24GB VRAM)
- **Primary Use**: Analysis tasks
- **Models**: llama-3.1-70b, qwen-2.5-32b, mixtral-8x22b
- **Max Concurrent**: 6 requests
- **Timeout**: 120 seconds

### Worker 3: RTX 3060 (12GB VRAM)
- **Primary Use**: Coding tasks
- **Models**: llama-3.1-8b, qwen-2.5-7b, deepseek-coder-6.7b
- **Max Concurrent**: 8 requests
- **Timeout**: 90 seconds

## Quick Start

### 1. Install Dependencies
```bash
cd services/nexus-router
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start with Infisical
```bash
# From project root
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" --path="/shared" -- \
  pnpm --filter nexus-router dev
```

### 4. Verify Health
```bash
curl http://localhost:8000/health
```

## API Endpoints

### Chat Completions
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "llama-3.1-70b",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

### List Models
```bash
GET /v1/models
```

### Health Check
```bash
GET /health        # Full health status
GET /health/ready  # Readiness check
GET /health/live   # Liveness check
```

## Routing Strategy

### Cost-Optimized (Default)
1. Check local GPU workers for model availability
2. Route to healthy local worker with capacity
3. Fallback to cloud if no local workers available
4. Cache response for future identical requests

### Latency-Optimized
1. Route to fastest available worker
2. Prefer cloud for guaranteed low latency
3. Use local workers as backup

### Quality-Optimized
1. Route to best model for task type
2. Prefer larger models on more powerful GPUs
3. Use cloud premium models when needed

## Configuration

### Environment Variables

See `.env.example` for all configuration options.

Key variables:
- `NEXUS_ROUTER_PORT` - HTTP server port (default: 8000)
- `MODEL_ROUTING_STRATEGY` - Routing strategy (cost-optimized, latency-optimized, quality-optimized)
- `MODEL_ROUTING_PREFER_LOCAL` - Prefer local workers (default: true)
- `MODEL_ROUTING_FALLBACK_CLOUD` - Enable cloud fallback (default: true)
- `REDIS_URL` - Redis connection string
- `WORKER_*_URL` - GPU worker endpoints

## Monitoring

### Metrics

Access metrics at `/health`:

```json
{
  "metrics": {
    "totalRequests": 1543,
    "localRequests": 1389,
    "cloudRequests": 154,
    "localPercentage": "90.02"
  }
}
```

### Worker Health

```json
{
  "components": {
    "workers": {
      "healthy": 2,
      "total": 3,
      "details": [
        {
          "id": "a3f7c2d1",
          "healthy": true,
          "responseTime": 45,
          "lastCheck": "2026-01-09T12:34:56.789Z"
        }
      ]
    }
  }
}
```

## Development

```bash
# Development mode with hot reload
pnpm dev

# Build
pnpm build

# Start production
pnpm start

# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Docker Deployment

```bash
# Build image
docker build -t nexus-router:latest .

# Run with Infisical
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" \
  --env="dev" --path="/shared" -- \
  docker run -p 8000:8000 nexus-router:latest
```

## MCP Proxy Mode

Nexus Router can act as an aggregation gateway for MCP servers:

```typescript
// MCP clients connect to Nexus Router
const mcpClient = new MCPClient({
  endpoint: 'http://localhost:4001/mcp',
  // All MCP servers are accessible through this single endpoint
});

// Nexus Router routes to:
// - Gemini MCP (8085)
// - Serena MCP (8086)
// - Mem0 (8080)
// - Claude Flow MCP
// - Ruv-Swarm MCP
```

## Troubleshooting

### No Local Workers Available
- Check worker health: `curl http://localhost:8000/health`
- Verify worker URLs are reachable
- Check Redis connection
- Review logs: `pnpm dev` or `docker logs nexus-router`

### High Cloud Usage
- Verify local workers are healthy
- Check `MODEL_ROUTING_PREFER_LOCAL=true`
- Review routing strategy configuration
- Monitor worker load and capacity

### Cache Issues
- Verify Redis connection: `redis-cli ping`
- Check Redis memory: `redis-cli info memory`
- Clear cache: `redis-cli FLUSHDB`

## Performance

- **Local Routing**: ~50-200ms latency
- **Cloud Routing**: ~500-2000ms latency
- **Cache Hit**: ~5-10ms latency
- **Throughput**: 100+ req/s per worker
- **Cost Savings**: 90%+ with local workers

## Security

- Rate limiting: 100 req/min per IP
- CORS configuration
- Helmet security headers
- Input validation with Zod
- No API keys in logs
- Secrets via Infisical

## License

MIT

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Health Check: `curl http://localhost:8000/health`
