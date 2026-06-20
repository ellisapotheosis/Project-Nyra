# Claude Code Configuration - Nexus Router Service

## Service Overview

**Nexus Router** is the unified MCP (Model Context Protocol) + LLM gateway that replaces the legacy MetaMCP system (ADR-002). It serves as the central coordination point for all AI, routing, and protocol communications within the Project Nyra infrastructure.

**Role**: Universal gateway and request router
**Port**: 6000
**Architecture**: Event-driven with fallback mechanisms
**Status**: Critical infrastructure service

## Core Responsibilities

1. **Protocol Translation**
   - Converts between MCP, HTTP, gRPC, and WebSocket protocols
   - Handles protocol-specific serialization/deserialization
   - Maintains backward compatibility with legacy MCP v1 clients

2. **Request Routing**
   - Routes AI requests to LiteLLM Proxy for provider selection
   - Routes vector queries to RuVector Search for semantic matching
   - Routes knowledge queries to letta Knowledge Graph
   - Implements intelligent failover and circuit breaking

3. **Service Discovery**
   - Dynamic service registration and health monitoring
   - Maintains service topology and metadata
   - Handles graceful degradation when services are unavailable

4. **Authentication & Authorization**
   - API key validation and rotation
   - JWT token verification with fallback to API keys
   - Rate limiting per user/organization
   - Audit logging of all requests

5. **Monitoring & Metrics**
   - Real-time performance tracking
   - Request/response latency histograms
   - Error rate monitoring with alerts
   - Circuit breaker state tracking

## Configuration

### Environment Variables

```bash
# Core Service Configuration
NEXUS_PORT=6000
NEXUS_HOST=0.0.0.0
NEXUS_ENV=production

# Protocol Support
NEXUS_ENABLE_MCP=true
NEXUS_ENABLE_HTTP=true
NEXUS_ENABLE_GRPC=false  # Optional
NEXUS_ENABLE_WEBSOCKET=true

# Service Endpoints
LITELLM_PROXY_URL=http://litellm-proxy:8000
RUVECTOR_SEARCH_URL=http://ruvector-search:6379
letta_KNOWLEDGE_URL=http://letta-knowledge:7000

# Authentication
NEXUS_API_KEY_SECRET=your-secret-key
NEXUS_JWT_SECRET=your-jwt-secret
NEXUS_JWT_EXPIRY=3600

# Timeouts and Limits
NEXUS_REQUEST_TIMEOUT=30000
NEXUS_MAX_REQUEST_SIZE=10mb
NEXUS_MAX_CONCURRENT_REQUESTS=1000

# Circuit Breaker
NEXUS_CIRCUIT_BREAKER_THRESHOLD=5
NEXUS_CIRCUIT_BREAKER_TIMEOUT=60000

# Caching
NEXUS_ENABLE_CACHE=true
NEXUS_CACHE_TTL=300
REDIS_URL=redis://redis:6379

# Logging
NEXUS_LOG_LEVEL=info
NEXUS_LOG_FORMAT=json
```

### Service Dependencies

```json
{
  "services": {
    "litellm-proxy": {
      "type": "gateway",
      "priority": "critical",
      "protocol": "http",
      "healthcheck": "/health"
    },
    "ruvector-search": {
      "type": "search-engine",
      "priority": "high",
      "protocol": "grpc",
      "healthcheck": "/health"
    },
    "letta-knowledge": {
      "type": "knowledge-graph",
      "priority": "high",
      "protocol": "http",
      "healthcheck": "/status"
    },
    "redis": {
      "type": "cache",
      "priority": "medium",
      "protocol": "redis",
      "healthcheck": "ping"
    }
  }
}
```

## API Endpoints

### Health & Status

```bash
GET /health              # Service health status
GET /readiness           # Readiness probe (K8s)
GET /liveness            # Liveness probe (K8s)
GET /status              # Detailed status with dependencies
GET /metrics             # Prometheus metrics
```

### MCP Protocol

```bash
# MCP 1.0 Compatibility
POST /mcp/initialize     # Initialize MCP session
POST /mcp/resources      # Get available resources
POST /mcp/tools          # List available tools
POST /mcp/call-tool      # Execute tool
POST /mcp/sampling       # Sampling endpoint (LLM requests)
```

### HTTP Gateway

```bash
# LLM Requests
POST /v1/chat/completions
POST /v1/embeddings
POST /v1/models

# Vector Search
POST /search/semantic    # Semantic similarity search
POST /search/hybrid      # Hybrid search (semantic + keyword)
POST /search/rerank      # Rerank search results

# Knowledge Graph
POST /knowledge/query    # Query knowledge graph
POST /knowledge/entities # Get entities
POST /knowledge/relationships # Get relationships
```

### WebSocket

```javascript
// Real-time streaming
wss://nexus:6000/ws

// Message Format
{
  "type": "request|stream|complete|error",
  "requestId": "uuid",
  "service": "litellm|ruvector|letta",
  "payload": { ... },
  "timestamp": "ISO8601"
}
```

## Architecture

### Request Flow

```
Client Request
    ↓
[Protocol Parser] - Detect MCP/HTTP/WebSocket
    ↓
[Authentication] - Verify API key/JWT
    ↓
[Rate Limiter] - Check quota
    ↓
[Router] - Determine target service
    ├→ LiteLLM Proxy (AI requests)
    ├→ RuVector Search (semantic queries)
    └→ letta Knowledge (graph queries)
    ↓
[Circuit Breaker] - Check service health
    ↓
[Cache Layer] - Check Redis cache
    ↓
[Forward Request] - Send to target service
    ↓
[Response Handler] - Format response
    ↓
Client Response
```

### Service Integration

**To LiteLLM Proxy:**
- Routes all AI generation requests
- Passes through provider selection preferences
- Maintains streaming connections
- Handles token counting for billing

**To RuVector Search:**
- Routes embedding requests
- Routes semantic search queries
- Manages vector index updates
- Caches embedding results

**To letta Knowledge:**
- Routes knowledge queries
- Manages entity/relationship lookups
- Updates knowledge graph
- Performs entity linking

## Deployment

### Docker Compose

```yaml
nexus-router:
  image: project-nyra/nexus-router:latest
  ports:
    - "6000:6000"
  environment:
    - NEXUS_PORT=6000
    - LITELLM_PROXY_URL=http://litellm-proxy:8000
    - RUVECTOR_SEARCH_URL=http://ruvector-search:6379
    - letta_KNOWLEDGE_URL=http://letta-knowledge:7000
    - REDIS_URL=redis://redis:6379
  depends_on:
    - litellm-proxy
    - ruvector-search
    - letta-knowledge
    - redis
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:6000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
  networks:
    - nyra-network
```

### Kubernetes

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nexus-router
spec:
  ports:
    - name: http
      port: 6000
      targetPort: 6000
  selector:
    app: nexus-router

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nexus-router
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nexus-router
  template:
    metadata:
      labels:
        app: nexus-router
    spec:
      containers:
        - name: nexus-router
          image: project-nyra/nexus-router:latest
          ports:
            - containerPort: 6000
          env:
            - name: NEXUS_PORT
              value: "6000"
            - name: LITELLM_PROXY_URL
              value: "http://litellm-proxy:8000"
          livenessProbe:
            httpGet:
              path: /liveness
              port: 6000
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /readiness
              port: 6000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Monitoring

### Health Checks

**Startup**: All downstream services must be reachable within 30s
**Running**: Check all services every 10s with 3 retries
**Degraded**: Circuit break when service fails 5 consecutive times

### Key Metrics

```
nexus_requests_total                    # Total requests by service/status
nexus_request_duration_seconds          # Request latency histogram
nexus_active_connections                # WebSocket connections
nexus_cache_hits_total                  # Cache hit rate
nexus_circuit_breaker_state             # Circuit breaker status
nexus_service_availability              # Downstream service availability
```

### Alerting

```
HIGH: Error rate > 5% for 5 minutes
CRITICAL: All downstream services unavailable
HIGH: Circuit breaker open for any service
MEDIUM: Cache hit rate < 50%
```

## Development Workflow

### Running Locally

```bash
# Install dependencies
npm install

# Start service with hot reload
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run production image
npm start
```

### Testing

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Load testing
npm run test:load -- --concurrency 100

# Protocol compatibility
npm run test:mcp -- --version 1.0
```

## Performance Targets

| Metric | Target |
|--------|--------|
| P50 Latency | <50ms |
| P99 Latency | <500ms |
| Throughput | 10k req/s |
| Cache Hit Rate | >60% |
| Availability | 99.95% |
| Error Rate | <0.1% |

## Security

### API Key Management

```bash
# Rotate API keys
POST /admin/keys/rotate

# List active keys
GET /admin/keys

# Revoke key
DELETE /admin/keys/{key-id}
```

### Request Validation

- Input sanitization for all payloads
- Size limits: 10MB max request body
- Timeout: 30s request timeout
- Rate limiting: 1000 req/min per API key

### TLS/SSL

```bash
NEXUS_TLS_ENABLED=true
NEXUS_TLS_CERT_PATH=/etc/nexus/certs/tls.crt
NEXUS_TLS_KEY_PATH=/etc/nexus/certs/tls.key
```

## Integration with Project Nyra

### Replaces
- Legacy MetaMCP gateway
- Single-provider routing
- Manual service discovery

### Enables
- Multi-protocol support (MCP + HTTP + WebSocket)
- Intelligent routing and failover
- Real-time streaming
- Unified authentication

### Used By
- All Claude Flow agents
- External client applications
- Internal microservices
- Mobile applications (via HTTP/WebSocket)

## Related Services

- **LiteLLM Proxy** - Multi-provider LLM routing
- **RuVector Search** - High-performance vector search
- **letta Knowledge** - Knowledge graph memory
- **Redis** - Caching layer
- **Prometheus** - Metrics collection

## Resources

- Documentation: `./docs/`
- Architecture: `./docs/ARCHITECTURE.md`
- API Reference: `./docs/API.md`
- Security: `./SECURITY-API-SUMMARY.md`
- Setup: `./REDIS-SETUP.md`

---

**Status**: Critical infrastructure service
**Last Updated**: 2026-01-22
**ADR**: ADR-002: Unified MCP + LLM Gateway
