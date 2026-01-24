# Claude Code Configuration - LiteLLM Proxy Service

## Service Overview

**LiteLLM Proxy** is the multi-provider LLM gateway that abstracts provider-specific APIs into a unified OpenAI-compatible interface. It handles routing, failover, cost tracking, and load balancing across multiple AI providers.

**Role**: Unified AI provider gateway
**Port**: 8000
**Architecture**: Provider abstraction layer
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Multi-Provider Routing**
   - Anthropic Claude (primary)
   - OpenAI GPT-4, GPT-3.5
   - Google Gemini
   - Azure OpenAI
   - Local models (Ollama, vLLM)
   - Provider selection based on cost/latency/availability

2. **Provider Failover**
   - Automatic failover to backup providers
   - Retry logic with exponential backoff
   - Circuit breaking for failed providers
   - Fallback to local models if external providers fail

3. **Cost Tracking & Optimization**
   - Real-time cost calculation per request
   - Provider cost comparison
   - Token counting and billing
   - Cost optimization recommendations

4. **Load Balancing**
   - Distribute requests across providers
   - Rate limit management
   - Quota enforcement per provider
   - Traffic shaping

5. **Request Processing**
   - Streaming and non-streaming responses
   - Function calling support
   - Vision/image processing
   - Context window management

## Configuration

### Environment Variables

```bash
# Core Service
LITELLM_PORT=8000
LITELLM_HOST=0.0.0.0
LITELLM_ENV=production

# Provider APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
AZURE_API_KEY=...
AZURE_API_BASE=https://...

# Primary Provider Selection
LITELLM_PRIMARY_PROVIDER=anthropic
LITELLM_FALLBACK_PROVIDERS=openai,google,azure

# Cost Configuration
LITELLM_TRACK_COSTS=true
LITELLM_COST_BUDGET_MONTH=10000
LITELLM_ALERT_ON_BUDGET_EXCEED=true

# Rate Limiting
LITELLM_RATE_LIMIT_PER_MINUTE=6000
LITELLM_RATE_LIMIT_PER_USER=1000
LITELLM_RATE_LIMIT_PER_API_KEY=500

# Timeouts
LITELLM_REQUEST_TIMEOUT=30
LITELLM_MAX_RETRIES=2
LITELLM_RETRY_DELAY=1

# Cache Configuration
LITELLM_ENABLE_CACHE=true
LITELLM_CACHE_TYPE=redis
REDIS_URL=redis://redis:6379

# Logging & Monitoring
LITELLM_LOG_LEVEL=info
LITELLM_LOG_FORMAT=json
LITELLM_ENABLE_DEBUG=false

# Database (for cost tracking)
DATABASE_URL=postgresql://user:pass@postgres:5432/litellm
```

### Provider Configuration

```yaml
providers:
  anthropic:
    enabled: true
    priority: 1
    models:
      - claude-opus-4.5
      - claude-sonnet-4.5
      - claude-haiku-4.5
    rate_limit: 50000  # RPM
    concurrent_limit: 1000
    fallback_to: openai

  openai:
    enabled: true
    priority: 2
    models:
      - gpt-4-turbo
      - gpt-4
      - gpt-3.5-turbo
    rate_limit: 10000
    concurrent_limit: 500
    fallback_to: google

  google:
    enabled: true
    priority: 3
    models:
      - gemini-pro
      - gemini-1.5-pro
    rate_limit: 5000
    concurrent_limit: 200

  azure:
    enabled: true
    priority: 4
    models:
      - gpt-4-deployment
      - gpt-35-turbo-deployment
    rate_limit: 3000
    concurrent_limit: 100

  local:
    enabled: false
    priority: 5
    models:
      - mistral-7b
      - llama-2-70b
    url: http://ollama:11434
    fallback_only: true
```

## API Endpoints

### Chat Completions (OpenAI Compatible)

```bash
POST /v1/chat/completions

# Request
{
  "model": "gpt-4",  # Auto-routes to appropriate provider
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1000
}

# Response
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help?"
    }
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### Embeddings

```bash
POST /v1/embeddings

# Request
{
  "model": "text-embedding-3-large",
  "input": "Hello world"
}

# Response
{
  "object": "list",
  "data": [{
    "object": "embedding",
    "index": 0,
    "embedding": [0.123, -0.456, ...]
  }],
  "model": "text-embedding-3-large",
  "usage": {
    "prompt_tokens": 2,
    "total_tokens": 2
  }
}
```

### Model List

```bash
GET /v1/models

# Response
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "owned_by": "openai",
      "provider": "openai",
      "available": true,
      "cost_per_token": 0.00003
    },
    {
      "id": "claude-opus-4.5",
      "object": "model",
      "owned_by": "anthropic",
      "provider": "anthropic",
      "available": true,
      "cost_per_token": 0.000015
    }
  ]
}
```

### Cost & Billing

```bash
# Get cost summary
GET /admin/costs?period=month
GET /admin/costs?start_date=2026-01-01&end_date=2026-01-31

# Response
{
  "period": "2026-01",
  "total_cost": 2345.67,
  "by_provider": {
    "anthropic": 1200.00,
    "openai": 900.00,
    "google": 245.67
  },
  "by_model": {
    "claude-opus-4.5": 800.00,
    "gpt-4": 700.00
  },
  "daily_breakdown": [...]
}

# Set budget alert
POST /admin/budget/alert
{
  "budget": 5000,
  "alert_threshold": 0.8,
  "email": "alerts@example.com"
}
```

### Health & Status

```bash
GET /health
GET /status
GET /provider-status      # Status of each provider
GET /metrics              # Prometheus metrics
```

## Architecture

### Request Processing Pipeline

```
Incoming Request
    ↓
[Auth Check] - Validate API key
    ↓
[Model Mapping] - Map to provider model
    ↓
[Rate Limit] - Check quotas
    ↓
[Cost Estimate] - Calculate estimated cost
    ↓
[Provider Selection]
    ├→ Primary Provider (Anthropic)
    ├→ Fallback 1 (OpenAI)
    ├→ Fallback 2 (Google)
    └→ Local Model (as last resort)
    ↓
[Provider API Call]
    ↓
[Response Processing]
    ├→ Cost Calculation
    ├→ Cache Storage
    └→ Metrics Recording
    ↓
[Format Response] - OpenAI format
    ↓
Client Response
```

### Provider Failover Logic

```javascript
async function sendRequest(model, messages, options) {
  for (const provider of priorityOrder) {
    try {
      // Check if provider available
      if (!provider.isAvailable()) continue;

      // Check rate limits
      if (provider.isRateLimited()) continue;

      // Check circuit breaker
      if (provider.circuitBreakerOpen()) continue;

      // Attempt request
      const response = await provider.request({
        model: mapModel(model, provider),
        messages,
        ...options
      });

      // Record success
      provider.recordSuccess();
      return response;

    } catch (error) {
      // Record failure
      provider.recordFailure(error);

      // Continue to next provider
      if (provider !== providers.last) continue;

      // All providers failed
      throw new ServiceUnavailableError();
    }
  }
}
```

## Cost Management

### Real-Time Cost Tracking

```typescript
interface CostRecord {
  timestamp: Date;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  userId: string;
  requestId: string;
}

// Pricing configuration
const pricing = {
  'claude-opus-4.5': {
    input: 0.000015,  // per token
    output: 0.000075
  },
  'gpt-4-turbo': {
    input: 0.00001,
    output: 0.00003
  },
  'gemini-pro': {
    input: 0.000005,
    output: 0.0000015
  }
};
```

### Cost Optimization Strategies

```bash
# Automatic provider selection based on cost
# For equivalent models, prefer cheaper provider

# Token counting (before calling provider)
POST /admin/token-count
{
  "model": "gpt-4",
  "messages": [...]
}

# Cost comparison across providers
POST /admin/cost-compare
{
  "model": "gpt-4",
  "input_tokens": 1000,
  "output_tokens": 500
}
# Returns cheapest equivalent provider
```

## Deployment

### Docker Compose

```yaml
litellm-proxy:
  image: project-nyra/litellm-proxy:latest
  ports:
    - "8000:8000"
  environment:
    - LITELLM_PORT=8000
    - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - REDIS_URL=redis://redis:6379
    - DATABASE_URL=postgresql://user:pass@postgres:5432/litellm
  depends_on:
    - redis
    - postgres
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - nyra-network
```

### Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: litellm-config
data:
  providers.yaml: |
    providers:
      anthropic:
        enabled: true
        priority: 1

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: litellm-proxy
spec:
  replicas: 3
  selector:
    matchLabels:
      app: litellm-proxy
  template:
    metadata:
      labels:
        app: litellm-proxy
    spec:
      containers:
        - name: litellm-proxy
          image: project-nyra/litellm-proxy:latest
          ports:
            - containerPort: 8000
          env:
            - name: LITELLM_PORT
              value: "8000"
            - name: ANTHROPIC_API_KEY
              valueFrom:
                secretKeyRef:
                  name: provider-secrets
                  key: anthropic-api-key
          resources:
            requests:
              cpu: 500m
              memory: 512Mi
            limits:
              cpu: 2000m
              memory: 2Gi
```

## Monitoring

### Key Metrics

```
litellm_requests_total                  # Total requests by provider/model
litellm_request_latency_seconds         # Request latency histogram
litellm_token_count_total               # Token usage by provider/model
litellm_cost_total_dollars              # Total costs by provider
litellm_provider_availability           # Provider availability %
litellm_cache_hits_total                # Cache hit rate
litellm_circuit_breaker_state           # Circuit breaker status per provider
litellm_rate_limit_remaining            # Remaining quota per provider
```

### Health Checks

```bash
# Individual provider health
GET /provider-status/anthropic
GET /provider-status/openai
GET /provider-status/google

# Global status
GET /status
```

## Performance Targets

| Metric | Target |
|--------|--------|
| P50 Latency | <200ms |
| P99 Latency | <2s |
| Cache Hit Rate | >40% |
| Provider Availability | >99.9% |
| Error Rate | <0.1% |
| Cost Accuracy | >99.9% |

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Configure providers
cp .env.example .env
# Edit .env with your API keys

# Start with hot reload
npm run dev

# Run tests
npm run test

# Load testing
npm run test:load
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests (requires live API keys)
npm run test:integration

# Provider failover tests
npm run test:failover

# Cost calculation tests
npm run test:cost
```

## Integration Points

### With Nexus Router
- Receives requests from unified gateway
- Returns OpenAI-compatible responses
- Reports health status

### With RuVector Search
- Embedding requests routed to RuVector
- Result caching in RuVector embeddings DB

### With Graphiti Knowledge
- Context enrichment from knowledge graph
- Entity-aware response generation

## Security

### API Key Management

```bash
# Rotate provider API keys
POST /admin/providers/{provider}/rotate-key

# Test provider connectivity
POST /admin/providers/{provider}/test

# Enable/disable provider
POST /admin/providers/{provider}/enable
DELETE /admin/providers/{provider}/disable
```

### Request Validation

- Input sanitization
- Payload size limits: 100MB max
- Timeout: 30s per request
- Rate limiting per user/API key

### Sensitive Data

- API keys stored securely in environment
- Cost data encrypted at rest
- Usage logs sanitized
- No message content logging

## Related Services

- **Nexus Router** - Request routing gateway
- **RuVector Search** - Vector embeddings and search
- **Graphiti Knowledge** - Knowledge graph context
- **Redis** - Response caching
- **PostgreSQL** - Cost tracking database

## Resources

- Documentation: `./docs/`
- Configuration: `./config/providers.yaml`
- Quickstart: `./QUICKSTART.md`
- Implementation: `./IMPLEMENTATION-SUMMARY.md`
- Docker: `./docker-compose.yml`

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-01-22
**Version**: 1.0.0
