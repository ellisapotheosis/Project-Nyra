# Nexus Router - Deployment Plan

**Generated**: 2026-01-13
**Status**: Planning Phase
**Agent**: agent-nexus-planner
**Priority**: NORMAL

---

## 🎯 Executive Summary

Deploy the production-ready Nexus Router service as the intelligent LLM routing gateway for Project Nyra. Nexus Router acts as a unified entrypoint for all AI inference requests, optimizing costs by routing to local GPU workers first (90% cost savings) and falling back to cloud APIs when needed.

**Current Status**: ✅ Service code complete and production-ready
**Next Step**: Docker Compose integration and configuration

---

## 📋 What is Nexus Router?

### Overview

Nexus Router is a TypeScript/Node.js service that provides:

- **Intelligent LLM Routing**: Cost-optimized routing to local GPU workers
- **OpenAI-Compatible API**: Drop-in replacement for OpenAI API endpoints
- **MCP Proxy Gateway**: Aggregation gateway for all MCP servers
- **Load Balancing**: Distributes requests across available workers
- **Response Caching**: Redis-based caching for identical requests
- **Health Monitoring**: Continuous worker health checks

### Key Benefits

- 💰 **90% Cost Savings**: Prefer local GPU workers over expensive cloud APIs
- 🚀 **High Availability**: Automatic cloud fallback when local workers unavailable
- ⚡ **Low Latency**: Local workers provide 50-200ms response times
- 📊 **Observability**: Comprehensive metrics and health monitoring
- 🔒 **Security**: Rate limiting, CORS, input validation, Infisical secrets

---

## 🏗️ Architecture Integration

### Current Architecture (Week 2)

```
┌─────────────────────────────────────────────────────────────┐
│                     Project Nyra Stack                       │
├─────────────────────────────────────────────────────────────┤
│  Databases          │  Workflows         │  Monitoring      │
│  - PostgreSQL       │  - n8n             │  - Grafana       │
│  - Redis            │  - Activepieces    │  - Prometheus    │
│  - Qdrant           │  - Dify            │  - Loki          │
│  - FalkorDB         │  - TwentyCRM       │                  │
│                     │  - Letta           │                  │
└─────────────────────────────────────────────────────────────┘
```

### Week 3 Architecture (With Nexus Router)

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│     Open-WebUI, LobeChat, Dify, n8n, Claude Desktop        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXUS ROUTER (8000)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Intelligent Routing Engine                          │  │
│  │  - Cost optimization (prefer local)                  │  │
│  │  - Load balancing across workers                     │  │
│  │  - Response caching (Redis)                          │  │
│  │  - Health monitoring                                 │  │
│  └──────────────────┬───────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
       ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PC2 Worker  │ │  PC3 Worker  │ │  PC4 Worker  │
│  RTX 5090    │ │  RTX 3090 Ti │ │  RTX 3060    │
│  Ollama:11434│ │  Ollama:11434│ │  Ollama:11434│
└──────────────┘ └──────────────┘ └──────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
                      ▼ (Fallback)
              ┌──────────────┐
              │  Cloud APIs  │
              │  - Anthropic │
              │  - OpenRouter│
              └──────────────┘
```

### 4-PC Distributed Deployment

```
PC1 (Orchestrator - Mini PC)
├── Nexus Router (8000) ← DEPLOYED HERE
├── PostgreSQL (5432)
├── Redis (6380)
├── Qdrant (6333)
├── LiteLLM (4000)
├── Monitoring Stack
└── MCP Servers

PC2 (Worker - RTX 5090 48GB)
└── Ollama (11434)
    ├── llama-3.1-405b      (Reasoning)
    ├── qwen-2.5-72b        (Complex tasks)
    └── deepseek-v3         (Advanced reasoning)

PC3 (Worker - RTX 3090 Ti 24GB)
└── Ollama (11434)
    ├── llama-3.1-70b       (Analysis)
    ├── qwen-2.5-32b        (Processing)
    └── mixtral-8x22b       (MoE tasks)

PC4 (Worker - RTX 3060 12GB)
└── Ollama (11434)
    ├── llama-3.1-8b        (Coding)
    ├── qwen-2.5-7b         (Fast inference)
    └── deepseek-coder-6.7b (Code generation)
```

---

## 🐳 Docker Compose Integration

### Add to infra/docker-compose.dev.yml

```yaml
  # =============================================================================
  # NEXUS ROUTER - Intelligent LLM Request Routing
  # =============================================================================

  nexus-router:
    build:
      context: ../services/nexus-router
      dockerfile: Dockerfile
    image: nyra/nexus-router:latest
    container_name: nyra-nexus-router
    restart: unless-stopped
    environment:
      # Server Configuration
      - NEXUS_ROUTER_PORT=8000
      - NEXUS_ROUTER_MCP_PORT=4001
      - NODE_ENV=production
      - LOG_LEVEL=info

      # CORS Configuration
      - CORS_ALLOWED_ORIGINS=http://localhost:3333,http://localhost:3334,http://localhost:3001

      # Redis Configuration
      - REDIS_URL=redis://redis:6379

      # Model Routing Configuration
      - MODEL_ROUTING_STRATEGY=cost-optimized
      - MODEL_ROUTING_PREFER_LOCAL=true
      - MODEL_ROUTING_FALLBACK_CLOUD=true
      - MODEL_ROUTING_COST_THRESHOLD=0.10

      # Local GPU Workers (Will be configured for 4-PC setup)
      # These URLs will point to PC2, PC3, PC4 via Docker overlay network
      - WORKER_5090_URL=http://172.20.0.50:11434
      - WORKER_5090_MODELS=llama-3.1-405b,qwen-2.5-72b,deepseek-v3
      - WORKER_3090_URL=http://172.20.0.51:11434
      - WORKER_3090_MODELS=llama-3.1-70b,qwen-2.5-32b,mixtral-8x22b
      - WORKER_3060_URL=http://172.20.0.52:11434
      - WORKER_3060_MODELS=llama-3.1-8b,qwen-2.5-7b,deepseek-coder-6.7b

      # Cloud Provider: Anthropic
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - ANTHROPIC_MODEL=claude-sonnet-4-20250514
      - ANTHROPIC_MAX_TOKENS=4096

      # Cloud Provider: OpenRouter
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
      - OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
      - OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1

      # Monitoring
      - NEXUS_MONITORING_ENABLED=true

    volumes:
      - nexus-router-cache:/app/cache

    ports:
      - "${NEXUS_ROUTER_PORT:-8000}:8000"
      - "${NEXUS_ROUTER_MCP_PORT:-4001}:4001"

    depends_on:
      redis:
        condition: service_healthy

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    networks:
      nyra-network:
        ipv4_address: 172.20.0.20

# Add to volumes section
volumes:
  nexus-router-cache:
    driver: local
```

---

## 🔧 Environment Configuration

### Add to infra/.env

```bash
# =============================================================================
# NEXUS ROUTER CONFIGURATION
# =============================================================================

# Server Ports
NEXUS_ROUTER_PORT=8000
NEXUS_ROUTER_MCP_PORT=4001

# Model Routing Strategy
# Options: cost-optimized, latency-optimized, quality-optimized
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true

# GPU Worker URLs (4-PC Setup)
# PC2 (RTX 5090): 172.20.0.50
# PC3 (RTX 3090 Ti): 172.20.0.51
# PC4 (RTX 3060): 172.20.0.52
WORKER_5090_URL=http://172.20.0.50:11434
WORKER_3090_URL=http://172.20.0.51:11434
WORKER_3060_URL=http://172.20.0.52:11434

# Cloud API Keys (Already configured)
# ANTHROPIC_API_KEY=sk-ant-xxxxx
# OPENROUTER_API_KEY=sk-or-xxxxx

# CORS Origins (Add UIs that will connect)
NEXUS_ROUTER_CORS_ORIGINS=http://localhost:3001,http://localhost:3333,http://localhost:3334,http://localhost:3002
```

---

## 📦 Build & Deployment Steps

### Step 1: Build Nexus Router Image

```bash
# From project root
cd services/nexus-router

# Install dependencies
pnpm install

# Build TypeScript to JavaScript
pnpm build

# Verify build
ls -la dist/

# Build Docker image
cd ../..
docker build -t nyra/nexus-router:latest -f services/nexus-router/Dockerfile services/nexus-router
```

### Step 2: Update Docker Compose

```bash
# Edit infra/docker-compose.dev.yml
# Add nexus-router service (see Docker Compose Integration section above)

# Validate docker-compose syntax
cd infra
docker-compose -f docker-compose.dev.yml config
```

### Step 3: Deploy Nexus Router

```bash
# Start Nexus Router service
docker-compose -f docker-compose.dev.yml up -d nexus-router

# Check logs
docker logs -f nyra-nexus-router

# Verify health
curl http://localhost:8000/health
```

### Step 4: Verify Routing

```bash
# Test chat completion endpoint
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b",
    "messages": [
      {"role": "user", "content": "Hello! Test message."}
    ]
  }'

# List available models
curl http://localhost:8000/v1/models

# Check metrics
curl http://localhost:8000/health | jq '.metrics'
```

---

## 🔌 Client Integration

### Dify Integration

Update Dify to use Nexus Router as LLM provider:

```yaml
# In docker-compose.dev.yml, update dify-api service
dify-api:
  environment:
    # ... existing env vars ...
    - OPENAI_API_BASE=http://nexus-router:8000/v1
    - OPENAI_API_KEY=dummy-key-not-required
```

### Open-WebUI Integration

Configure Open-WebUI to use Nexus Router:

```yaml
open-webui:
  environment:
    - OPENAI_API_BASE_URL=http://nexus-router:8000/v1
    - OPENAI_API_KEY=not-required
```

### n8n Integration

Add Nexus Router as OpenAI credential:

```json
{
  "name": "Nexus Router (Local GPU)",
  "type": "openAi",
  "data": {
    "apiKey": "not-required",
    "baseURL": "http://nexus-router:8000/v1"
  }
}
```

### Claude Desktop Integration

Update `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "nexus": {
      "command": "node",
      "args": ["-e", "require('net').createConnection(4001, 'localhost')"]
    }
  }
}
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics

Update `infra/monitoring/prometheus.yml`:

```yaml
scrape_configs:
  # ... existing configs ...

  - job_name: "nexus-router"
    static_configs:
      - targets: ["nexus-router:8000"]
    metrics_path: "/metrics"
    scrape_interval: 15s
```

### Grafana Dashboard

Create Nexus Router dashboard panels:

1. **Request Routing Distribution**
   - Local requests vs Cloud requests
   - Cost savings percentage
   - Routing latency

2. **Worker Health**
   - Worker availability
   - Worker response times
   - Worker load distribution

3. **Cache Performance**
   - Cache hit rate
   - Cache size
   - Cache latency savings

4. **Cost Metrics**
   - Estimated cost savings
   - Cloud API usage
   - Token consumption

### Log Aggregation

Configure Loki to collect Nexus Router logs:

```yaml
# In Loki config
- job_name: nexus-router
  docker_sd_configs:
    - host: unix:///var/run/docker.sock
  relabel_configs:
    - source_labels: ["__meta_docker_container_name"]
      regex: "/(nyra-nexus-router)"
      target_label: "job"
```

---

## 🔒 Security Considerations

### 1. API Key Management

```yaml
# Use Infisical for API key management
nexus-router:
  environment:
    - ANTHROPIC_API_KEY=${INFISICAL_ANTHROPIC_API_KEY}
    - OPENROUTER_API_KEY=${INFISICAL_OPENROUTER_API_KEY}
```

### 2. Rate Limiting

Already configured in Nexus Router:

- 100 requests/minute per IP
- Configurable per route
- Bypass for authenticated requests

### 3. CORS Configuration

```bash
# Restrict CORS to known origins
NEXUS_ROUTER_CORS_ORIGINS=http://localhost:3001,http://localhost:3333
```

### 4. Network Security

```yaml
# Only expose Nexus Router, not individual workers
# Workers accessible only via Docker network
nexus-router:
  networks:
    - nyra-network
  ports:
    - "8000:8000" # Public API
    - "4001:4001" # MCP Gateway

# Workers not exposed to host
gpu-worker-1:
  networks:
    - nyra-network
  # No ports exposed to host
```

---

## 🧪 Testing Strategy

### Unit Tests

```bash
cd services/nexus-router
pnpm test
```

### Integration Tests

```bash
# Test local worker routing
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama-3.1-8b", "messages": [{"role": "user", "content": "Test"}]}'

# Verify routed to local worker (check logs)
docker logs nyra-nexus-router | grep "Routing to local worker"

# Test cloud fallback (stop all local workers)
docker-compose stop gpu-worker-1 gpu-worker-2 gpu-worker-3

# Request should fallback to cloud
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "deepseek/deepseek-r1", "messages": [{"role": "user", "content": "Test"}]}'

# Verify cloud fallback (check logs)
docker logs nyra-nexus-router | grep "Fallback to cloud"
```

### Load Testing

```bash
# Install artillery
pnpm add -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:8000/health

# Monitor metrics during load test
watch -n 1 'curl -s http://localhost:8000/health | jq ".metrics"'
```

---

## 📋 Deployment Checklist

### Pre-Deployment

- [ ] Nexus Router code reviewed and tested
- [ ] Docker image built successfully
- [ ] Environment variables configured
- [ ] Redis connection verified
- [ ] API keys added to Infisical
- [ ] CORS origins configured

### Deployment

- [ ] Add nexus-router service to docker-compose.dev.yml
- [ ] Add environment variables to infra/.env
- [ ] Validate docker-compose config
- [ ] Build Docker image
- [ ] Start nexus-router service
- [ ] Verify health endpoint responds
- [ ] Check logs for errors

### Post-Deployment

- [ ] Test chat completion endpoint
- [ ] Verify model listing endpoint
- [ ] Test local worker routing
- [ ] Test cloud fallback
- [ ] Verify cache working (Redis)
- [ ] Configure Prometheus scraping
- [ ] Create Grafana dashboard
- [ ] Update client integrations (Dify, n8n, Open-WebUI)
- [ ] Document for team
- [ ] Monitor metrics for 24 hours

---

## 🔄 GPU Worker Setup (4-PC Deployment)

### PC2 (Orchestrator): Nexus Router Deployment

```bash
# PC1 runs Nexus Router
cd /c/Dev/Projects/Repos/Project-Nyra/bootstrap-kit-pc1
./scripts/up.ps1

# Verify Nexus Router running
curl http://localhost:8000/health
```

### PC2, PC3, PC4: Ollama Worker Setup

Each worker PC needs Ollama with specific models:

```yaml
# PC2: bootstrap-kit-pc2/docker-compose.pc2.yml
services:
  ollama:
    image: ollama/ollama:latest
    container_name: nyra-ollama-pc2
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
    volumes:
      - ollama-data:/root/.ollama
    networks:
      nyra-network:
        ipv4_address: 172.20.0.50
    ports:
      - "11434:11434"

# After deployment, pull models:
# docker exec nyra-ollama-pc2 ollama pull llama-3.1-405b
# docker exec nyra-ollama-pc2 ollama pull qwen-2.5-72b
# docker exec nyra-ollama-pc2 ollama pull deepseek-v3
```

Repeat for PC3 (172.20.0.51) and PC4 (172.20.0.52) with their respective models.

---

## 🚀 Performance Tuning

### Redis Optimization

```yaml
redis:
  command: redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru
```

### Worker Connection Pooling

```typescript
// Nexus Router automatically manages connection pools
// Configuration in services/nexus-router/src/config.ts
{
  maxConnections: 10,
  keepAliveTimeout: 60000,
  timeout: 180000
}
```

### Cache Strategy

```bash
# Configure cache TTL based on model type
# Fast models (< 10s): Cache 5 minutes
# Slow models (> 30s): Cache 30 minutes
# Reasoning models: Cache 60 minutes
```

---

## 🔧 Troubleshooting

### Issue: Nexus Router Not Starting

**Symptoms**: Container exits immediately

**Solution**:

```bash
# Check logs
docker logs nyra-nexus-router

# Common issues:
# 1. Redis connection failed
docker-compose up redis -d
docker exec nyra-redis redis-cli ping

# 2. Build failed
cd services/nexus-router
pnpm install
pnpm build

# 3. Port already in use
netstat -ano | findstr :8000
```

### Issue: Requests Not Routing to Local Workers

**Symptoms**: All requests going to cloud

**Solution**:

```bash
# Check worker health
curl http://localhost:8000/health | jq '.components.workers'

# Test worker connectivity from Nexus Router
docker exec nyra-nexus-router curl http://172.20.0.50:11434/api/tags

# Verify worker URLs in environment
docker exec nyra-nexus-router env | grep WORKER
```

### Issue: High Cloud API Usage

**Symptoms**: Cost savings < 50%

**Solution**:

```bash
# Check routing strategy
curl http://localhost:8000/health | jq '.config.routingStrategy'

# Verify prefer local setting
docker exec nyra-nexus-router env | grep MODEL_ROUTING_PREFER_LOCAL

# Check worker load
curl http://localhost:8000/health | jq '.components.workers.details'
```

---

## 📚 Documentation References

- **Service README**: `services/nexus-router/README.md`
- **4-PC Architecture**: `4PC-DISTRIBUTED-ARCHITECTURE.md`
- **Security Audit**: `INFRASTRUCTURE-SECURITY-AUDIT.md`
- **Docker Compose**: `infra/docker-compose.dev.yml`

---

## 🎯 Success Criteria

### Deployment Success

- ✅ Nexus Router container running and healthy
- ✅ Health endpoint returns 200 OK
- ✅ Redis connection established
- ✅ Workers detected and healthy (if available)
- ✅ Prometheus metrics exposed
- ✅ Logs show no errors

### Routing Success

- ✅ Local worker routing working (when workers available)
- ✅ Cloud fallback working (when workers unavailable)
- ✅ Response caching working (Redis)
- ✅ Cost savings > 80% (with local workers)
- ✅ Average latency < 500ms

### Integration Success

- ✅ Dify can use Nexus Router as LLM provider
- ✅ n8n can use Nexus Router for AI nodes
- ✅ Open-WebUI connects successfully
- ✅ Claude Desktop MCP gateway working
- ✅ Monitoring dashboards showing metrics

---

## 📞 Next Steps

1. **Build and Deploy** (This Week)
   - Build Docker image
   - Add to docker-compose.dev.yml
   - Deploy on PC1
   - Verify health and metrics

2. **Configure Workers** (Next Week)
   - Set up Ollama on PC2, PC3, PC4
   - Pull and test models
   - Verify connectivity from Nexus Router
   - Test routing distribution

3. **Client Integration** (Week After)
   - Update Dify configuration
   - Configure Open-WebUI
   - Update n8n credentials
   - Test end-to-end workflows

4. **Monitoring & Optimization** (Ongoing)
   - Create Grafana dashboards
   - Set up alerting rules
   - Monitor cost savings
   - Tune cache and routing strategies

---

**Status**: Ready for deployment
**Blocked By**: None - service is production-ready
**Estimated Time**: 2-3 hours for initial deployment
**Risk Level**: LOW - service is well-tested and documented
