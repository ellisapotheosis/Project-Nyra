# Open-WebUI Development Chat Interface - Setup Complete

## Overview

Open-WebUI has been configured as the development chat interface for Project Nyra. This provides a convenient interface for testing LLM routing, debugging agent interactions, and validating RAG functionality.

## Key Information

- **Port**: 3333 (http://localhost:3333)
- **Purpose**: Development and testing (NOT borrower-facing)
- **Borrower Interface**: Dify on port 3000
- **Container**: nyra-openwebui
- **Image**: ghcr.io/open-webui/open-webui:main

## Configuration Files

### 1. Docker Compose Service
**Location**: `infra/docker/apps/docker-compose.apps.yml`

```yaml
openwebui:
  image: ghcr.io/open-webui/open-webui:main
  container_name: nyra-openwebui
  ports:
    - "3333:8080"
  environment:
    - OPENAI_API_BASE_URL=http://nexus-router:6000/v1
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - WEBUI_AUTH=true
    - DEFAULT_MODELS=deepseek-r1:236b,qwen2.5:72b,llama3.1:70b
  volumes:
    - openwebui-data:/app/backend/data
    - ./config/open-webui.json:/app/backend/data/config.json:ro
  depends_on:
    nexus-router:
      condition: service_healthy
```

### 2. Configuration File
**Location**: `infra/docker/config/open-webui.json`

Comprehensive configuration including:
- 8 available models (6 local GPU workers + 2 cloud fallback)
- RAG settings with AgentDB integration
- Function calling for mortgage tools
- Authentication and authorization
- UI customization
- Monitoring and metrics

### 3. Environment Variables
**Location**: `infra/docker/.env`

Added:
```bash
# Open-WebUI Configuration
WEBUI_SECRET_KEY=webui_9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a
```

## Quick Start

### Start Open-WebUI

```bash
# From infra/docker/apps directory
docker-compose up -d openwebui

# Or from root directory
docker-compose -f infra/docker/apps/docker-compose.apps.yml up -d openwebui
```

### Automated Test

```bash
# Run test script
cd infra/docker/apps
./test-openwebui.sh
```

The test script will:
1. Verify Docker Compose is installed
2. Check Nexus Router is running
3. Start Open-WebUI
4. Wait for health check to pass
5. Test health endpoint
6. Test Nexus Router connection
7. Verify configuration file is mounted
8. Display access information

### Manual Testing

```bash
# Check if running
docker ps | grep openwebui

# View logs
docker-compose -f infra/docker/apps/docker-compose.apps.yml logs -f openwebui

# Check health
curl http://localhost:3333/health

# Test Nexus Router connection (from inside container)
docker exec nyra-openwebui curl http://nexus-router:6000/v1/models
```

## Access and Usage

### Web Interface

Open browser: http://localhost:3333

**First Time Setup**:
1. Click "Sign Up" (authentication is enabled)
2. Create admin account
3. Select model from dropdown (default: DeepSeek-R1 236B)
4. Start chatting

### Model Selection

Available models (in order of preference):

1. **DeepSeek-R1 236B** (Worker-5090) - Complex reasoning, compliance
2. **Qwen 2.5 72B** (Worker-5090) - High quality general purpose
3. **Llama 3.1 70B** (Worker-3090) - Fast general purpose
4. **Mistral Large 123B** (Worker-3090) - Multi-lingual, code
5. **CodeLlama 34B** (Worker-3060) - Code generation
6. **Qwen 2.5 32B** (Worker-3060) - Lightweight
7. **Claude Sonnet 4.5** (Cloud) - High-stakes compliance
8. **DeepSeek-R1** (Cloud) - Overflow routing

### Testing RAG

```
Example prompt:
"What are the TILA disclosure requirements for conventional mortgages?"

Open-WebUI will:
1. Generate embeddings with sentence-transformers
2. Search AgentDB vector store (HNSW-indexed)
3. Retrieve top 5 relevant chunks
4. Rerank results
5. Generate response with citations
```

### Testing Function Calling

```
Example prompts:

1. "Calculate mortgage quote for $350,000 at 7% APR"
   → Calls mortgage_quote_calculator tool

2. "Check if borrower qualifies: income $8000/month, debts $3000/month"
   → Calls loan_qualification_checker tool

3. "Validate TILA compliance for this quote: [quote details]"
   → Calls compliance_validator tool
```

## Architecture

```
User Browser
    ↓
Open-WebUI (Port 3333)
    ↓
Nexus Router (Port 6000)
    ↓
┌─────────────────────────────────┐
│  GPU Workers (Local LLMs)       │
│  - Worker-5090: DeepSeek-R1 236B│
│  - Worker-3090: Llama 3.1 70B   │
│  - Worker-3060: CodeLlama 34B   │
└─────────────────────────────────┘
    ↓ (overflow)
┌─────────────────────────────────┐
│  Cloud Providers                │
│  - Anthropic: Claude Sonnet 4.5 │
│  - OpenRouter: DeepSeek-R1      │
└─────────────────────────────────┘

RAG Pipeline:
Open-WebUI → AgentDB (Vector Search) → HNSW Index → Relevant Chunks

Function Calling:
Open-WebUI → Quote API, Compliance Service, Document Processor
```

## Monitoring

### Metrics Endpoint

http://localhost:3333/metrics (Prometheus format)

Key metrics:
- Request latency by model
- Local vs cloud routing ratio
- Function call success rate
- RAG retrieval accuracy
- Token usage per provider

### Prometheus Integration

Add to Prometheus scrape config:
```yaml
scrape_configs:
  - job_name: 'openwebui'
    static_configs:
      - targets: ['openwebui:8080']
```

## Troubleshooting

### Open-WebUI won't start

**Check Nexus Router**:
```bash
docker ps | grep nexus-router
docker-compose -f infra/docker/base/docker-compose.mcp.yml logs nexus-router
```

If not running:
```bash
docker-compose -f infra/docker/base/docker-compose.mcp.yml up -d nexus-router
```

### Port 3333 already in use

```bash
# Check what's using port 3333
netstat -ano | findstr :3333

# Or change port in docker-compose.apps.yml
ports:
  - "3334:8080"  # Changed from 3333
```

### Models not appearing

**Check Nexus Router models endpoint**:
```bash
curl http://localhost:6000/v1/models
```

Should return JSON with all available models. If empty:
1. Check GPU workers are accessible via Tailscale
2. Verify WORKER_*_URL environment variables in .env
3. Check Nexus Router logs for connection errors

### RAG not working

**Check AgentDB is running**:
```bash
docker ps | grep agentdb
```

**Test vector search directly**:
```bash
curl -X POST http://localhost:8080/search \
  -H "Content-Type: application/json" \
  -d '{"query": "mortgage compliance", "k": 5}'
```

### Authentication issues

**Reset admin password**:
```bash
docker exec -it nyra-openwebui /bin/bash
# Inside container:
# Use Open-WebUI admin tools to reset password
```

## Security Notes

- **WEBUI_SECRET_KEY**: Change in production (currently in .env)
- **Authentication**: Enabled by default
- **API Keys**: Stored in .env, use Infisical in production
- **Rate Limiting**: 60 requests/minute per user
- **HTTPS**: Use nginx reverse proxy in production

## Development Workflow

1. **Morning**: Start Open-WebUI, verify GPU workers online
2. **Testing**: Use Open-WebUI to test new agent workflows
3. **Debugging**: Review function call logs, RAG retrieval scores
4. **Monitoring**: Check Prometheus metrics for cloud API usage
5. **Evening**: Containers auto-restart on reboot (optional shutdown)

## Cost Optimization

**Target**: 80%+ local GPU usage, <20% cloud fallback

**Monitor**:
- Local requests: FREE (electricity only)
- DeepSeek-R1 (OpenRouter): $0.55/1M tokens
- Claude Sonnet 4.5 (Anthropic): $3.00/1M tokens

**Optimization**:
1. Use DeepSeek-R1 236B (local) for most queries
2. Reserve Claude Sonnet 4.5 for compliance-critical tasks
3. Set fallback threshold: 5 seconds (sufficient for local models)
4. Monitor metrics endpoint for cost tracking

## Related Documentation

- **Configuration Reference**: `../config/README.md`
- **Docker Infrastructure**: `../CLAUDE.md`
- **Nexus Router**: `../base/docker-compose.mcp.yml`
- **Project Architecture**: `../../ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f openwebui`
2. Review config: `docker exec nyra-openwebui cat /app/backend/data/config.json`
3. Test dependencies: `./test-openwebui.sh`
4. Consult README: `../config/README.md`

---

**Status**: ✅ Setup Complete
**Date**: 2026-01-22
**Version**: Open-WebUI latest (main branch)
**Environment**: Development (NOT production)
