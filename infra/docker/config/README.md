# Configuration Files

This directory contains configuration files for Project Nyra Docker services.

## Files

### nexus-router.yaml

**Central MCP Proxy Aggregator & LLM Routing Hub** for Project Nyra.

**Purpose**: Unified endpoint for LLM routing (local GPU workers + cloud fallback) and MCP server aggregation.

**Ports**:
- 6000 (HTTP API)
- 8000 (gRPC)

**Key Features**:
- **Local-First LLM Routing**: 80%+ traffic to GPU workers (RTX 5090, 3090 Ti, 3060)
- **MCP Aggregation**: Single endpoint for 12+ MCP servers (claude-flow, letta, graphiti, ruvector, mem0, etc.)
- **Load Balancing**: Least-connection strategy with circuit breaker
- **Rate Limiting**: 5000 req/min global, per-provider limits
- **Health Monitoring**: Redis-backed health checks with 30s intervals
- **Audit Logging**: PostgreSQL audit trail for compliance
- **Metrics**: Prometheus endpoint at `/metrics`
- **Caching**: Redis caching for responses, embeddings, and MCP results

**LLM Routing Priority**:
1. **Priority 1**: Local GPU Workers (worker-5090, worker-3090, worker-3060)
2. **Priority 2**: OpenRouter DeepSeek-R1 (cloud fallback)
3. **Priority 3**: Anthropic Claude Sonnet 4 (critical compliance tasks)
4. **Priority 4**: Google Gemini 2.0 Flash (experimental)

**MCP Servers Aggregated**:
- claude-flow:3010 (orchestration, agents, swarm)
- letta:8283 (memory, conversation, stateful)
- graphiti:9100 (graph, knowledge, temporal)
- ruvector:8888 (vector, search, hnsw)
- mem0:8081 (memory, personalization, profiles)
- qdrant:6333 (vector, database, similarity)
- serena:8086 (orchestration, workflow)
- gemini-assistant:8085 (assistant, google, ai)
- openmemory:8080 (memory, collaborative, shared)
- agentdb:5433 (database, vector, agents)
- agent-booster:3010 (optimization, performance, cache)
- epic-sdk:3011 (sdk, extended, capabilities)

**Access Control Policies**:
- `borrower_minimal_tools`: Restricted for borrower-facing apps
- `internal_ops_full_tools`: Full access for internal operations
- `compliance_critical`: Compliance-focused with detailed audit trail

**Configuration**: See detailed documentation in [Nexus Router Configuration Guide](#nexus-router-configuration-guide) below.

### open-webui.json

Configuration for Open-WebUI development chat interface.

**Purpose**: Development and testing interface for LLM routing, agent debugging, and RAG validation.

**Port**: 3333 (http://localhost:3333)

**Key Features**:
- OpenAI-compatible API endpoint connected to Nexus Router
- Access to all 3 GPU workers (RTX 5090, 3090, 3060) via Ollama
- Cloud fallback to Anthropic Claude and OpenRouter DeepSeek
- RAG integration with AgentDB for document search
- Function calling for mortgage tools (quote calculator, compliance validator, document processor)
- Authentication enabled (default role: user)
- Prometheus metrics at /metrics

**Model Selection**:
1. **Primary**: DeepSeek-R1 236B (Worker-5090) - Complex reasoning and compliance
2. **General**: Qwen 2.5 72B, Llama 3.1 70B (Worker-5090, Worker-3090)
3. **Code**: CodeLlama 34B (Worker-3060)
4. **Fallback**: Claude Sonnet 4.5 (Anthropic), DeepSeek-R1 (OpenRouter)

**Routing Strategy**: Local-first with 80%+ GPU worker preference, cloud fallback for overflow

**NOT for Borrower-Facing Chat**: Borrowers use Dify on port 3000. Open-WebUI is for internal development only.

## Usage

### Starting Open-WebUI

```bash
# From infra/docker directory
docker-compose -f apps/docker-compose.apps.yml up -d openwebui

# Check logs
docker-compose -f apps/docker-compose.apps.yml logs -f openwebui

# Check health
curl http://localhost:3333/health
```

### Accessing the Interface

Open browser: http://localhost:3333

**Default Login**: Create account on first visit (authentication enabled)

### Testing LLM Routing

1. **Test Local Models** (GPU workers):
   - Select "DeepSeek-R1 236B" for complex mortgage compliance questions
   - Select "Llama 3.1 70B" for general queries
   - Select "CodeLlama 34B" for code generation

2. **Test RAG**:
   - Ask questions about mortgage documents
   - System will search AgentDB vector store
   - Returns relevant chunks with citation

3. **Test Function Calling**:
   - "Calculate mortgage quote for $350,000 at 7% APR"
   - System will call mortgage_quote_calculator tool
   - Returns structured quote data

4. **Test Cloud Fallback**:
   - If local workers are busy, requests route to Anthropic or OpenRouter
   - Monitor cost in metrics dashboard

### Monitoring

**Metrics**: http://localhost:3333/metrics (Prometheus format)

**Key Metrics to Monitor**:
- Request latency by model
- Local vs cloud routing ratio (target: 80%+ local)
- Function call success rate
- RAG retrieval accuracy
- Token usage per provider

### Configuration Updates

Edit `open-webui.json` and restart the service:

```bash
docker-compose -f apps/docker-compose.apps.yml restart openwebui
```

## Troubleshooting

### Open-WebUI won't start

**Check nexus-router is running**:
```bash
docker ps | grep nexus-router
```

If not running, start it:
```bash
docker-compose up -d nexus-router
```

### Models not showing up

**Check Nexus Router configuration**:
```bash
curl http://localhost:6000/v1/models
```

Should return list of available models from GPU workers.

### RAG not working

**Check AgentDB is running**:
```bash
docker ps | grep agentdb
```

**Test vector search**:
```bash
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"query": "mortgage compliance", "k": 5}'
```

### Function calling errors

**Check service endpoints**:
```bash
# Quote API
curl http://localhost:8001/health

# Compliance service
curl http://localhost:8002/health

# Document processor
curl http://localhost:8003/health
```

## Security Notes

- **WEBUI_SECRET_KEY**: Change in production (currently in .env)
- **API Keys**: Stored in .env, loaded from Infisical in production
- **Authentication**: Enabled by default, require login
- **Rate Limiting**: 60 requests/minute, 1000 requests/hour per user
- **HTTPS**: Use reverse proxy (nginx) in production

## Development Workflow

1. **Morning Setup**: Start Open-WebUI, check all workers online
2. **Test New Features**: Use Open-WebUI to test agent workflows
3. **Debug Issues**: Review function call logs, RAG retrieval scores
4. **Monitor Costs**: Check Prometheus metrics for cloud API usage
5. **Evening Shutdown**: Optional, containers auto-restart on reboot

## Integration with Other Services

### Nexus Router
- Routes requests to optimal LLM provider
- Handles load balancing across GPU workers
- Provides cost tracking and failover

### AgentDB
- Vector search for RAG
- HNSW indexing for 150x faster retrieval
- Stores mortgage document embeddings

### Quote API
- Mortgage calculation service
- Multi-lender comparison
- Compliance validation integration

### Dify (Borrower Chat)
- Separate service on port 3000
- Production borrower-facing interface
- Uses same Nexus Router backend
- Open-WebUI is for INTERNAL DEV ONLY

---

## Nexus Router Configuration Guide

### Overview

Nexus Router (`nexus-router.yaml`) is the **central nervous system** of Project Nyra's AI infrastructure. It provides:

- **Intelligent LLM Routing**: Routes requests to the optimal provider based on load, availability, and cost
- **MCP Aggregation**: Single API endpoint for all Model Context Protocol servers
- **Load Balancing**: Distributes traffic across GPU workers using least-connection strategy
- **Circuit Breaker**: Automatic failover when providers become unhealthy
- **Cost Optimization**: 80%+ local inference, 20% cloud fallback (targeting $55/day vs $500/day all-cloud)

### Architecture Diagram

```
Applications (Dify, Open-WebUI, Twenty, n8n)
    │
    └─→ Nexus Router (port 6000 HTTP, 8000 gRPC)
         │
         ├─→ LLM Routing (Priority-based)
         │   ├─ P1: worker-5090 (RTX 5090) - deepseek-r1:236b, qwen2.5:72b
         │   ├─ P1: worker-3090 (RTX 3090) - llama3.1:70b, mistral-large:123b
         │   ├─ P1: worker-3060 (RTX 3060) - codellama:34b, qwen2:32b, gemma2:27b
         │   ├─ P2: OpenRouter (cloud fallback)
         │   ├─ P3: Anthropic (critical compliance)
         │   └─ P4: Google Gemini (experimental)
         │
         ├─→ MCP Server Aggregation
         │   ├─ claude-flow:3010
         │   ├─ letta:8283
         │   ├─ graphiti:9100
         │   ├─ ruvector:8888
         │   ├─ mem0:8081
         │   ├─ qdrant:6333
         │   └─ ... (12+ servers total)
         │
         └─→ Observability
             ├─ Health: Redis state storage
             ├─ Audit: PostgreSQL logging
             └─ Metrics: Prometheus /metrics endpoint
```

### Quick Start

```bash
# Start Nexus Router (from infra/docker directory)
docker-compose -f base/docker-compose.core.yml up -d nexus-router

# Check health
curl http://localhost:6000/health

# View metrics
curl http://localhost:6000/metrics

# Test LLM routing (OpenAI-compatible)
curl -X POST http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
  -d '{
    "model": "deepseek-r1:236b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Test MCP tool call
curl -X POST http://localhost:6000/mcp/graphiti/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${NEXUS_ADMIN_TOKEN}" \
  -d '{
    "query": "MATCH (l:Loan) RETURN l LIMIT 10"
  }'
```

### Environment Variables Required

Add to `.env` file in `infra/` directory:

```bash
# Authentication
NEXUS_JWT_SECRET=your_jwt_secret_here
NEXUS_ADMIN_TOKEN=your_admin_token_here

# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GOOGLE_API_KEY=AIza...
OPENAI_API_KEY=sk-...
LITELLM_MASTER_KEY=sk-...

# Database & Cache
POSTGRES_USER=nyra
POSTGRES_PASSWORD=your_postgres_password
REDIS_PASSWORD=your_redis_password

# Optional
LOG_LEVEL=info
DEBUG=false
```

### Load Balancing Example

```
Request arrives: "Generate mortgage quote"

Step 1: Check model availability
  - deepseek-r1:236b available on worker-5090
  - qwen2.5:72b available on worker-5090

Step 2: Check health status
  - worker-5090: healthy, 2 active connections
  - worker-3090: healthy, 3 active connections
  - worker-3060: healthy, 1 active connection

Step 3: Select provider (least connections)
  - deepseek-r1:236b only on worker-5090
  → Route to worker-5090

Step 4: Apply rate limit
  - worker-5090 limit: 180/min
  - Current: 134/min
  → Allow request

Step 5: Execute with circuit breaker
  - Timeout: 120s
  - Retry: 3 attempts with exponential backoff
  - Cache: Check Redis for duplicate request

Step 6: Log & audit
  - Store in PostgreSQL audit_logs table
  - Update Prometheus metrics
  - Cache response (TTL: 1 hour)
```

### Rate Limits

| Provider | Limit | Window | Concurrent |
|----------|-------|--------|------------|
| worker-5090 | 180/min | 60s | 3 |
| worker-3090 | 120/min | 60s | 2 |
| worker-3060 | 120/min | 60s | 2 |
| openrouter | 300/min | 60s | 5 |
| anthropic | 100/min | 60s | 3 |
| google | 200/min | 60s | 2 |
| **Global** | **5000/min** | **60s** | **-** |

### Monitoring & Metrics

**Health Check Endpoint**: `GET http://localhost:6000/health`

Response:
```json
{
  "status": "healthy",
  "checks": {
    "llm_providers": {
      "worker-5090": "healthy",
      "worker-3090": "healthy",
      "worker-3060": "healthy",
      "openrouter": "healthy",
      "anthropic": "healthy"
    },
    "mcp_servers": {
      "claude-flow": "healthy",
      "letta": "healthy",
      "graphiti": "healthy"
    }
  }
}
```

**Prometheus Metrics**: `GET http://localhost:6000/metrics`

Key metrics:
- `nexus_router_llm_requests_total{provider, model, status}` - Request counts
- `nexus_router_llm_request_duration{provider}` - Latency histogram
- `nexus_router_active_connections{type}` - Active connections gauge
- `nexus_router_rate_limit_remaining{provider}` - Rate limit headroom
- `nexus_router_circuit_breaker_state{provider}` - Circuit breaker status

### Access Control Policies

**1. Borrower-Facing Applications** (Dify, Public Site)

```yaml
policy: borrower_minimal_tools
- Allow: graphiti.*, mem0.*, letta.*, openmemory.*
- Deny: filesystem.*, github.*, dockerhub.*
- Providers: worker-3060, worker-3090, openrouter
- Audit: Basic logging
```

**2. Internal Operations** (Nyra Admin, n8n)

```yaml
policy: internal_ops_full_tools
- Allow: * (all tools)
- Providers: * (all providers)
- Audit: Standard logging
```

**3. Compliance Critical** (Disclosure Generation, Regulatory Validation)

```yaml
policy: compliance_critical
- Allow: graphiti.*, letta.*, mem0.*
- Providers: anthropic, worker-5090
- Audit: Detailed logging with full request/response capture
```

### Cost Tracking

**Target**: 80% local inference, 20% cloud

**View current usage**:
```bash
curl -s http://localhost:6000/metrics | grep llm_requests_total | \
  awk '/worker/ {local+=$NF} /openrouter|anthropic|google/ {cloud+=$NF} \
       END {total=local+cloud; print "Local: " local " (" int(local/total*100) "%)"; \
            print "Cloud: " cloud " (" int(cloud/total*100) "%)"}'
```

**Example cost calculation** (10,000 requests/day):
- 8,000 local (worker-5090, worker-3090, worker-3060): **$0**
- 1,500 OpenRouter DeepSeek-R1: **~$5/day**
- 500 Anthropic Claude Sonnet 4: **~$50/day**
- **Total: ~$55/day** vs **$500/day** all-cloud (**89% savings**)

### Troubleshooting

**Issue**: Provider marked unhealthy

```bash
# Check GPU worker
curl http://worker-5090.tail-net.ts.net:11434/api/tags

# Check Nexus Router logs
docker logs nyra-nexus-router -f | grep "worker-5090"

# Manual health check
curl http://localhost:6000/health | jq '.checks.llm_providers'
```

**Issue**: Rate limit exceeded

```bash
# Check current limits
curl http://localhost:6000/metrics | grep rate_limit_remaining

# View rate limit config
docker exec nyra-nexus-router cat /app/config/nexus-router.yaml | grep -A 10 "rate_limit:"
```

**Issue**: MCP server unreachable

```bash
# Test MCP server directly
docker exec nyra-claude-flow curl http://localhost:3010/health

# Check Nexus Router connectivity
docker exec nyra-nexus-router ping -c 3 claude-flow

# View MCP routing logs
docker logs nyra-nexus-router | grep "mcp/"
```

### Performance Optimization

**1. Redis Caching**

- LLM responses: 1 hour TTL
- MCP results: 5 minutes TTL
- Embeddings: 24 hours TTL

**2. Connection Pooling**

- Redis pool: 20 connections
- PostgreSQL audit: Batched writes (100 records/10s)

**3. Resource Limits**

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
    reservations:
      cpus: '1.0'
      memory: 1G
```

### Grafana Dashboard

Sample queries for monitoring:

```promql
# Request rate by provider
rate(nexus_router_llm_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(nexus_router_llm_request_duration_bucket[5m]))

# Local vs cloud ratio
sum(rate(nexus_router_llm_requests_total{provider=~"worker-.*"}[5m])) /
sum(rate(nexus_router_llm_requests_total[5m]))

# Circuit breaker triggers
rate(nexus_router_circuit_breaker_opens_total[5m])

# Rate limit near capacity
nexus_router_rate_limit_remaining / nexus_router_rate_limit_total < 0.1
```

### Security Best Practices

1. **API Keys**: Store in Infisical, rotate monthly
2. **JWT Secret**: Strong random string, never commit to git
3. **TLS/SSL**: Enable for production with Let's Encrypt
4. **Network Isolation**: Keep on private `nyra-core` and `nyra-mcp` networks
5. **Audit Logs**: Review PostgreSQL audit_logs weekly for anomalies
6. **Rate Limiting**: Adjust per-provider limits based on usage patterns

### Backup & Recovery

**Configuration Backup**:
```bash
cp infra/docker/config/nexus-router.yaml \
   backups/nexus-router-$(date +%Y%m%d).yaml
```

**Redis State Backup**:
```bash
docker exec nyra-redis redis-cli -a ${REDIS_PASSWORD} SAVE
docker cp nyra-redis:/data/dump.rdb \
  backups/redis-nexus-$(date +%Y%m%d).rdb
```

**PostgreSQL Audit Logs**:
```bash
docker exec nyra-postgres pg_dump -U nyra -t audit_logs > \
  backups/audit-logs-$(date +%Y%m%d).sql
```

---

## Further Reading

- **Open-WebUI Docs**: https://docs.openwebui.com
- **Nexus Router Official**: https://nexusrouter.com/docs
- **AgentDB Integration**: ../../services/agentdb/README.md
- **Project Nyra Architecture**: ../../ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md
- **MCP Protocol**: https://spec.modelcontextprotocol.io
