# Archon OS Configuration - LiteLLM Proxy Service

## Service Overview

**LiteLLM Proxy** is the multi-provider LLM gateway that abstracts provider-specific APIs into a unified OpenAI-compatible interface. It handles routing, failover, cost tracking, and load balancing across multiple AI providers.

**Role**: Unified AI provider gateway
**Port**: 4000
**Architecture**: Provider abstraction layer
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Multi-Provider Routing**
   - Anthropic Claude (primary)
   - OpenAI GPT-4, GPT-3.5
   - Google Gemini
   - Local models (Ollama, vLLM)
   - Provider selection based on cost/latency/availability

2. **Provider Failover**
   - Automatic failover to backup providers
   - Retry logic with exponential backoff
   - Fallback to local models if external providers fail

3. **Cost Tracking & Optimization**
   - Real-time cost calculation per request
   - Token counting and billing

4. **Request Processing**
   - Streaming and non-streaming responses
   - Function calling support

## Configuration

### Environment Variables

```bash
# Core Service
LITELLM_PORT=4000
LITELLM_HOST=0.0.0.0

# Provider APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Cache Configuration
REDIS_URL=redis://redis:6379
```

## API Endpoints

### Chat Completions (OpenAI Compatible)
`POST /v1/chat/completions`

### Embeddings
`POST /v1/embeddings`

### Health & Status
`GET /health`
`GET /status`

## Architecture

Client Request → [Nexus Router] → [LiteLLM Proxy] → [AI Provider] → Response

## Integration Points

### With Nexus Router
- Receives requests from unified gateway
- Returns OpenAI-compatible responses

### With RuVector Search
- Embedding requests routed to RuVector

## Related Services

- **Nexus Router** - Request routing gateway
- **RuVector Search** - Vector embeddings and search
- **Redis** - Response caching
- **PostgreSQL** - Cost tracking database

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-04-08
