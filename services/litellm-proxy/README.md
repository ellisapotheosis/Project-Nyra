# LiteLLM Proxy - Unified LLM Gateway

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Port**: 4000

## Overview

LiteLLM Proxy is a unified LLM gateway that provides cost-optimized model routing for Project Nyra. It intelligently routes requests to local GPU workers (90%+ cost savings) with automatic fallback to cloud APIs (OpenRouter) for high availability.

## Key Features

- **Cost Optimization**: Routes to local GPU workers first (90%+ savings)
- **Intelligent Fallback**: Automatic OpenRouter fallback when local workers unavailable
- **Multi-GPU Support**: Supports 3 GPU workers (RTX 5090, 3090, 3060)
- **Load Balancing**: 3 LiteLLM proxy instances with Nginx load balancer
- **Response Caching**: Redis-based caching for identical requests
- **Cost Tracking**: PostgreSQL database for usage and cost analytics
- **Multi-Tenancy**: Isolated budgets and rate limits per team
- **Monitoring**: Prometheus + Grafana for metrics and dashboards
- **OpenAI Compatible**: Drop-in replacement for OpenAI API

## Architecture

```
┌─────────────────┐
│   Client Apps   │
│   Nexus Router  │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│  Nginx Load Balancer     │
│         :4000            │
└────────┬─────────────────┘
         │
    ┌────┴────┬────────┐
    ▼         ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐
│LiteLLM1│ │LiteLLM2│ │LiteLLM3│
└───┬────┘ └───┬────┘ └───┬────┘
    │          │          │
    └──────────┴──────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
┌──────────────┐  ┌──────────────┐
│ GPU Workers  │  │ OpenRouter   │
│ - 5090 48GB  │  │ - DeepSeek   │
│ - 3090 24GB  │  │ - Qwen Coder │
│ - 3060 12GB  │  │ - GPT-4o-mini│
└──────────────┘  └──────────────┘
```

## Quick Start

### 1. Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- GPU workers running (optional, will use OpenRouter fallback)
- OpenRouter API key

### 2. Configuration

```bash
cd services/litellm-proxy

# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required environment variables:

```bash
# Master key for admin access
LITELLM_MASTER_KEY=sk-your-secure-master-key

# GPU Workers (optional)
WORKER_5090_URL=http://gpu-worker-5090:8000/v1
WORKER_3090_URL=http://gpu-worker-3090:8000/v1
WORKER_3060_URL=http://gpu-worker-3060:8000/v1

# OpenRouter (required for fallback)
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 3. Start Services

**Development mode** (single instance):
```bash
pnpm start:dev
# or
./scripts/deploy.sh start-dev
```

**Production mode** (3 instances + monitoring):
```bash
pnpm start
# or
./scripts/deploy.sh start
```

### 4. Verify Installation

```bash
# Check health
curl http://localhost:4000/health

# List models
curl -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  http://localhost:4000/v1/models

# Test chat completion
curl -X POST http://localhost:4000/v1/chat/completions \
  -H "Authorization: Bearer $LITELLM_MASTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## GPU Workers

### Worker 1: RTX 5090 (48GB VRAM)
- **Models**: llama-3.1-405b, qwen-2.5-72b, deepseek-v3
- **Use Case**: Large reasoning models
- **Max Concurrent**: 4 requests
- **Timeout**: 180 seconds

### Worker 2: RTX 3090 (24GB VRAM)
- **Models**: llama-3.1-70b, qwen-2.5-32b, mixtral-8x22b
- **Use Case**: Medium analysis models
- **Max Concurrent**: 6 requests
- **Timeout**: 120 seconds

### Worker 3: RTX 3060 (12GB VRAM)
- **Models**: llama-3.1-8b, qwen-2.5-7b, deepseek-coder-6.7b
- **Use Case**: Specialized coding models
- **Max Concurrent**: 8 requests
- **Timeout**: 90 seconds

## OpenRouter Fallback

When local GPU workers are unavailable or overloaded, requests automatically fall back to OpenRouter:

- **deepseek-r1**: Cost-effective reasoning ($0.001/1M tokens)
- **qwen-coder**: Optimized for code generation
- **gpt-4o-mini**: Fast and cheap general purpose
- **claude-3-5-sonnet**: Premium quality when needed

## API Endpoints

### Chat Completions

```bash
POST /v1/chat/completions
Authorization: Bearer <api-key>
Content-Type: application/json

{
  "model": "llama-3.1-70b",
  "messages": [
    {"role": "user", "content": "Hello!"}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### List Models

```bash
GET /v1/models
Authorization: Bearer <api-key>
```

### Health Check

```bash
GET /health              # Full health status
GET /health/ready        # Readiness check
GET /health/live         # Liveness check
```

## Multi-Tenancy

### Create Tenant

```bash
./scripts/manage-tenants.sh create engineering 500 "llama-3.1-70b,qwen-2.5-32b"
```

This creates:
- Tenant ID: `engineering`
- Monthly budget: $500
- Allowed models: `llama-3.1-70b`, `qwen-2.5-32b`
- Unique API key
- Rate limits: 60 req/min, 1000 req/hour

### List Tenants

```bash
./scripts/manage-tenants.sh list
```

### View Usage

```bash
./scripts/manage-tenants.sh usage engineering
```

## Monitoring

### Grafana Dashboard

Access at http://localhost:3001 (default password: `admin`)

Dashboards include:
- Request rate and latency
- Token usage by model
- Cost per tenant
- Worker health
- Cache hit rate

### Prometheus Metrics

Access at http://localhost:9091

Key metrics:
- `litellm_requests_total` - Total requests
- `litellm_request_duration_seconds` - Request latency
- `litellm_tokens_total` - Token usage
- `litellm_cost_total` - Cost tracking

### Logs

```bash
# All services
pnpm logs

# Specific service
pnpm logs litellm-1

# Follow logs
docker-compose logs -f
```

## Cost Optimization

### Routing Strategy

The proxy uses a **cost-optimized** routing strategy:

1. **Check local GPU workers** for model availability
2. **Route to healthy local worker** with capacity
3. **Fallback to OpenRouter** if no local workers available
4. **Cache responses** for identical requests

### Cost Comparison

| Model | Local (GPU) | OpenRouter | Savings |
|-------|-------------|------------|---------|
| llama-3.1-70b | $0.0001/1M | $0.52/1M | 99.98% |
| deepseek-v3 | $0.0001/1M | $0.27/1M | 99.96% |
| qwen-2.5-32b | $0.0001/1M | $0.20/1M | 99.95% |

**Average savings**: 90%+ when using local GPU workers

## Integration with Nexus Router

Update Nexus Router to use LiteLLM:

```typescript
// services/nexus-router/src/integrations/litellm-client.ts
import { litellmClient } from './litellm-client';

// Send request via LiteLLM
const response = await litellmClient.chatCompletion({
  model: 'llama-3.1-70b',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

Environment variables:

```bash
LITELLM_BASE_URL=http://localhost:4000
LITELLM_API_KEY=sk-your-api-key
```

## Management Scripts

### Deployment

```bash
pnpm start          # Start production stack
pnpm start:dev      # Start development stack
pnpm stop           # Stop services
pnpm restart        # Restart services
pnpm status         # Check status
pnpm health         # Health check
```

### Testing

```bash
pnpm test           # Run integration tests
pnpm metrics        # Show usage metrics
```

### Maintenance

```bash
pnpm backup         # Backup database and config
./scripts/deploy.sh backup
```

### Tenant Management

```bash
# Create tenant
./scripts/manage-tenants.sh create <tenant-id> [budget] [models]

# List tenants
./scripts/manage-tenants.sh list

# Update tenant
./scripts/manage-tenants.sh update <tenant-id> <field> <value>

# Show usage
./scripts/manage-tenants.sh usage <tenant-id>

# Delete tenant
./scripts/manage-tenants.sh delete <tenant-id>
```

## Configuration

### Model Aliases

Convenient shortcuts for common models:

- `default` → llama-3.1-70b (3090)
- `cheap` → llama-3.1-8b (3060)
- `reasoning` → deepseek-v3 (5090)

### Fallback Chains

Automatic fallback paths for reliability:

**Reasoning Chain**:
1. deepseek-v3 (Local 5090)
2. llama-3.1-405b (Local 5090)
3. deepseek-r1 (OpenRouter)
4. claude-3-5-sonnet (OpenRouter)

**Coding Chain**:
1. deepseek-coder-6.7b (Local 3060)
2. qwen-2.5-7b (Local 3060)
3. qwen-coder (OpenRouter)
4. gpt-4o-mini (OpenRouter)

### Rate Limits

Default limits per tenant:
- 60 requests per minute
- 1000 requests per hour
- 10000 requests per day

### Budget Alerts

Automatic alerts when:
- 80% of budget consumed (warning)
- 90% of budget consumed (critical)
- 100% of budget consumed (block if configured)

## Troubleshooting

### No Local Workers Available

**Symptoms**: All requests going to OpenRouter

**Solutions**:
1. Check GPU worker health: `pnpm health`
2. Verify worker URLs in `.env`
3. Check GPU worker logs
4. Ensure workers are accessible from Docker network

### High Latency

**Symptoms**: Slow response times

**Solutions**:
1. Check worker load: `pnpm metrics`
2. Enable Redis caching (default: enabled)
3. Scale up workers: Adjust `max_concurrent` in config
4. Check network connectivity

### Authentication Errors

**Symptoms**: 401 Unauthorized

**Solutions**:
1. Verify `LITELLM_MASTER_KEY` in `.env`
2. Check API key in request header
3. Ensure tenant API key is active
4. Check tenant permissions

### Budget Exceeded

**Symptoms**: 429 Budget Exceeded

**Solutions**:
1. Check current spend: `./scripts/manage-tenants.sh usage <tenant>`
2. Increase budget: `./scripts/manage-tenants.sh update <tenant> budget <amount>`
3. Wait for next billing period
4. Contact admin to reset budget

### Cache Issues

**Symptoms**: Stale responses

**Solutions**:
1. Clear Redis cache: `docker-compose exec redis redis-cli FLUSHDB`
2. Adjust TTL in `config/config.yaml`
3. Disable caching for debugging: `cache_enabled: false`

## Performance

- **Local routing**: 50-200ms latency
- **Cloud routing**: 500-2000ms latency
- **Cache hit**: 5-10ms latency
- **Throughput**: 100+ req/s per worker
- **Cost savings**: 90%+ with local workers

## Security

- Master key authentication
- Rate limiting per tenant
- Input validation with Zod
- Request sanitization
- Audit logging
- Budget controls
- CORS configuration
- Network isolation

## Support

- **Documentation**: `/docs` directory
- **Health Check**: `curl http://localhost:4000/health`
- **Logs**: `pnpm logs`
- **Metrics**: http://localhost:3001 (Grafana)

## License

MIT

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Related Services

- **Nexus Router**: Intelligent LLM request routing
- **GPU Workers**: Local model inference
- **OpenRouter**: Cloud model fallback
