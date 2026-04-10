# Archon OS Configuration - Nexus Router Service

## Service Overview

**Nexus Router** is the unified MCP (Model Context Protocol) + LLM gateway. It serves as the central coordination point for all AI, routing, and protocol communications within the Project Nyra infrastructure.

**Role**: Universal gateway and request router
**Port**: 7000
**Architecture**: Event-driven with fallback mechanisms
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Protocol Translation**
   - Converts between MCP, HTTP, and WebSocket protocols
   - Handles protocol-specific serialization/deserialization

2. **Request Routing**
   - Routes AI requests to LiteLLM Proxy for provider selection
   - Routes vector queries to RuVector Search for semantic matching
   - Implements intelligent failover and circuit breaking

3. **Service Discovery**
   - Dynamic service registration and health monitoring
   - Maintains service topology and metadata

4. **Authentication & Authorization**
   - API key validation and rotation
   - Rate limiting per user/organization

5. **Monitoring & Metrics**
   - Real-time performance tracking
   - Request/response latency histograms

## Configuration

### Environment Variables

```bash
# Core Service Configuration
NEXUS_PORT=7000
NEXUS_HOST=0.0.0.0
NEXUS_ENV=production

# Service Endpoints
LITELLM_BASE_URL=http://litellm:4000
RUVECTOR_SEARCH_URL=http://ruvector-search:3700

# Caching
REDIS_URL=redis://redis:6379
```

## API Endpoints

### Health & Status
`GET /health` - Service health status
`GET /metrics` - Prometheus metrics

### MCP Protocol
`POST /mcp/initialize` - Initialize MCP session
`POST /mcp/tools` - List available tools
`POST /mcp/call-tool` - Execute tool

### HTTP Gateway
`POST /v1/chat/completions` - LLM Requests
`POST /v1/embeddings` - Vector Embeddings

## Architecture

### Request Flow
Client Request → [Protocol Parser] → [Authentication] → [Router] → Target Service (LiteLLM/RuVector) → [Response Handler] → Client Response

## Integration with Project Nyra

### Replaces
- Legacy MetaMCP gateway
- Single-provider routing

### Enables
- Multi-protocol support (MCP + HTTP + WebSocket)
- Intelligent routing and failover
- Unified authentication

### Used By
- All Archon OS agents
- External client applications
- Internal microservices

## Related Services

- **LiteLLM** - Multi-provider LLM routing
- **RuVector Search** - High-performance vector search
- **Redis** - Caching layer
- **Prometheus** - Metrics collection

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-04-08
