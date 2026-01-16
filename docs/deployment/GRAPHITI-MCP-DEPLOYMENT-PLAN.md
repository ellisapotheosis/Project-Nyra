# Graphiti MCP Deployment Plan

**Generated**: 2026-01-13
**Status**: Planning Phase
**Agent**: agent-graphiti-planner
**Priority**: NORMAL

---

## 🎯 Executive Summary

Deployment plan for Graphiti MCP (Model Context Protocol) integration with Project Nyra infrastructure. Graphiti provides temporal knowledge graph capabilities for maintaining entity relationships and context over time.

### Critical Findings

- ✅ Custom Graphiti service already exists at `services/graphiti-knowledge/`
- ✅ Docker Compose overlay exists at `infra/docker/docker-compose.graphiti.yml`
- ✅ Nexus Router already configured for Graphiti MCP
- ⚠️ **Port mismatch** across configurations (3000 vs 8000 vs 9100)
- ⚠️ **Image mismatch** between custom service and pre-built images
- ❌ **No Dockerfile** for custom service
- ❌ **No documentation** or .env.example files

---

## 📊 Current State Analysis

### 1. Custom Graphiti Service

**Location**: `services/graphiti-knowledge/`

**Technology Stack**:
- Node.js/Express HTTP server
- FalkorDB as graph database backend
- NLP libraries: compromise, natural, node-nlp
- Temporal tracking capabilities
- Redis caching support
- Cytoscape and D3.js for visualization

**API Endpoints**:
```javascript
GET  /health                    // Health check
POST /api/extract               // Entity extraction from text
POST /api/graph/build           // Build knowledge graph
GET  /api/temporal/range        // Query temporal range
GET  /api/temporal/snapshot     // Get point-in-time snapshot
      /api/query/*              // Graph query routes
      /api/visualize/*          // Visualization routes
```

**Default Port**: 3000

**Environment Variables** (from source code):
- `PORT` - Server port (default: 3000)
- `FALKOR_HOST` - FalkorDB host (default: localhost)
- `FALKOR_PORT` - FalkorDB port (default: 6379)
- `NODE_ENV` - Environment (development/production)

### 2. Docker Compose Overlay

**Location**: `infra/docker/docker-compose.graphiti.yml`

**Configuration**:
```yaml
services:
  graphiti_mcp:
    image: zepai/knowledge-graph-mcp:standalone
    restart: unless-stopped
    environment:
      - FALKORDB_URI=redis://falkordb:6379
      - FALKORDB_PASSWORD=
      - FALKORDB_DATABASE=default_db
      - GRAPHITI_GROUP_ID=${GRAPHITI_GROUP_ID:-nyra}
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - OPENAI_BASE_URL=http://nexus:6000/llm/openai/v1
      - SEMAPHORE_LIMIT=5
    ports:
      - "8000:8000"
    depends_on:
      - falkordb
      - nexus
```

**Image**: `zepai/knowledge-graph-mcp:standalone`
**Port**: 8000

### 3. Main Docker Compose (Commented)

**Location**: `infra/docker-compose.dev.yml` (lines 303-312)

**Commented Configuration**:
```yaml
# Graphiti MCP - Will be configured in Week 3
# graphiti-mcp:
#   image: getzep/graphiti-mcp:latest
#   container_name: nyra-graphiti-mcp
#   environment:
#     - GRAPHITI_TEMPORAL_TRACKING=${GRAPHITI_TEMPORAL_TRACKING:-true}
#     - GRAPHITI_RELATIONSHIP_INFERENCE=${GRAPHITI_RELATIONSHIP_INFERENCE:-true}
```

**Image**: `getzep/graphiti-mcp:latest` (different from overlay!)

### 4. Nexus Router Configuration

**Location**: `infra/nexus/nexus.yaml` (lines 26-27, 42)

**MCP Server Entry**:
```yaml
mcp:
  servers:
    - name: graphiti
      url: http://graphiti_mcp:9100  # Expected port 9100!

policies:
  default:
    mcp_servers:
      - graphiti.*
```

**Expected Port**: 9100 (different from both overlay and commented config!)

---

## 🚨 Issues to Resolve

### Issue 1: Port Mismatch (CRITICAL)

Three different port configurations:
- Custom service: **3000**
- Docker overlay: **8000**
- Nexus expects: **9100**

**Decision Required**: Standardize on a single port.

**Recommendation**: Use port **9100** to match Nexus configuration.

### Issue 2: Image vs Custom Service (HIGH)

Two deployment options:
1. **Pre-built images**:
   - `zepai/knowledge-graph-mcp:standalone`
   - `getzep/graphiti-mcp:latest`
2. **Custom service**:
   - `services/graphiti-knowledge/`

**Decision Required**: Choose between pre-built MCP images or custom service.

**Recommendation**:
- **Phase 1 (Week 3)**: Use `zepai/knowledge-graph-mcp:standalone` for quick deployment
- **Phase 2 (Week 4+)**: Migrate to custom service with enhanced features

**Rationale**:
- Pre-built image provides faster deployment and MCP compatibility
- Custom service offers more control and NLP capabilities
- Can run both simultaneously on different ports initially

### Issue 3: Missing Dockerfile (MEDIUM)

Custom service has no Dockerfile for containerization.

**Required**: Create Dockerfile for `services/graphiti-knowledge/`

### Issue 4: No Documentation (LOW)

Missing:
- README.md
- .env.example
- API documentation
- Setup guide

---

## 📋 Deployment Strategy

### Phase 1: Quick Deployment (Week 3)

Deploy pre-built MCP image for immediate integration.

**Steps**:
1. Uncomment Graphiti section in `docker-compose.dev.yml`
2. Update port to 9100 to match Nexus configuration
3. Merge with overlay configuration from `docker-compose.graphiti.yml`
4. Configure environment variables
5. Start service and verify MCP connectivity
6. Test via Nexus Router integration

**Timeline**: 2-3 hours

### Phase 2: Custom Service Deployment (Week 4+)

Containerize and deploy custom Graphiti service.

**Steps**:
1. Create Dockerfile for `services/graphiti-knowledge/`
2. Create .env.example with configuration template
3. Build and test Docker image
4. Add to docker-compose with different port (3000)
5. Create comprehensive README documentation
6. Run both services in parallel for feature comparison
7. Migrate to custom service after validation

**Timeline**: 1-2 days

---

## 🐳 Recommended Docker Compose Configuration

### Option A: Pre-Built MCP Image (Phase 1)

```yaml
services:
  graphiti-mcp:
    image: zepai/knowledge-graph-mcp:standalone
    container_name: nyra-graphiti-mcp
    restart: unless-stopped
    environment:
      # FalkorDB Connection
      - FALKORDB_URI=redis://falkordb:6379
      - FALKORDB_PASSWORD=${FALKORDB_PASSWORD:-}
      - FALKORDB_DATABASE=default_db

      # Graphiti Configuration
      - GRAPHITI_GROUP_ID=${GRAPHITI_GROUP_ID:-nyra}
      - GRAPHITI_TEMPORAL_TRACKING=${GRAPHITI_TEMPORAL_TRACKING:-true}
      - GRAPHITI_RELATIONSHIP_INFERENCE=${GRAPHITI_RELATIONSHIP_INFERENCE:-true}

      # LLM Provider (via Nexus Router)
      - OPENAI_API_KEY=${OPENAI_API_KEY:-dummy-key}
      - OPENAI_BASE_URL=http://nexus-router:8000/v1

      # Performance
      - SEMAPHORE_LIMIT=${GRAPHITI_SEMAPHORE_LIMIT:-5}
      - MAX_CONCURRENT_REQUESTS=${GRAPHITI_MAX_CONCURRENT:-10}

      # Logging
      - LOG_LEVEL=${GRAPHITI_LOG_LEVEL:-info}
      - DEBUG=${GRAPHITI_DEBUG:-false}

    ports:
      - "9100:9100"  # Match Nexus expectations

    volumes:
      - graphiti-mcp-data:/app/data
      - graphiti-mcp-cache:/app/cache

    networks:
      - nyra-network

    depends_on:
      falkordb:
        condition: service_healthy
      nexus-router:
        condition: service_started

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9100/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  graphiti-mcp-data:
    driver: local
  graphiti-mcp-cache:
    driver: local
```

### Option B: Custom Service (Phase 2)

```yaml
services:
  graphiti-knowledge:
    build:
      context: ../services/graphiti-knowledge
      dockerfile: Dockerfile
    image: nyra/graphiti-knowledge:latest
    container_name: nyra-graphiti-knowledge
    restart: unless-stopped
    environment:
      # Server Configuration
      - PORT=3000
      - NODE_ENV=${NODE_ENV:-production}

      # FalkorDB Connection
      - FALKOR_HOST=falkordb
      - FALKOR_PORT=6379
      - FALKORDB_PASSWORD=${FALKORDB_PASSWORD:-}
      - FALKORDB_DATABASE=${GRAPHITI_DATABASE:-default_db}

      # Redis Cache
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD:-}

      # NLP Configuration
      - NLP_LANGUAGE=${GRAPHITI_NLP_LANGUAGE:-en}
      - ENTITY_EXTRACTION_ENABLED=${GRAPHITI_ENTITY_EXTRACTION:-true}
      - TEMPORAL_TRACKING_ENABLED=${GRAPHITI_TEMPORAL_TRACKING:-true}

      # LLM Integration (optional for enhanced NLP)
      - OPENAI_API_KEY=${OPENAI_API_KEY:-}
      - OPENAI_BASE_URL=http://nexus-router:8000/v1

      # Logging
      - LOG_LEVEL=${GRAPHITI_LOG_LEVEL:-info}
      - LOG_FORMAT=${GRAPHITI_LOG_FORMAT:-json}

    ports:
      - "3000:3000"  # Different port from MCP service

    volumes:
      - graphiti-knowledge-data:/app/data
      - graphiti-knowledge-logs:/app/logs

    networks:
      - nyra-network

    depends_on:
      falkordb:
        condition: service_healthy
      redis:
        condition: service_healthy

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  graphiti-knowledge-data:
    driver: local
  graphiti-knowledge-logs:
    driver: local
```

---

## 📝 Dockerfile for Custom Service

Create `services/graphiti-knowledge/Dockerfile`:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src

# Create data directories
RUN mkdir -p /app/data /app/logs \
    && chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start service
CMD ["node", "src/index.js"]
```

---

## 📋 Environment Configuration

Create `services/graphiti-knowledge/.env.example`:

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# FalkorDB Connection
FALKOR_HOST=falkordb
FALKOR_PORT=6379
FALKORDB_PASSWORD=
FALKORDB_DATABASE=default_db

# Redis Cache
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# NLP Configuration
NLP_LANGUAGE=en
ENTITY_EXTRACTION_ENABLED=true
TEMPORAL_TRACKING_ENABLED=true

# LLM Integration (optional)
OPENAI_API_KEY=
OPENAI_BASE_URL=http://nexus-router:8000/v1

# Performance
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30000

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
DEBUG=false
```

Add to `infra/.env`:

```bash
# Graphiti MCP Configuration
GRAPHITI_GROUP_ID=nyra
GRAPHITI_TEMPORAL_TRACKING=true
GRAPHITI_RELATIONSHIP_INFERENCE=true
GRAPHITI_SEMAPHORE_LIMIT=5
GRAPHITI_MAX_CONCURRENT=10
GRAPHITI_LOG_LEVEL=info
GRAPHITI_DEBUG=false
GRAPHITI_DATABASE=default_db

# NLP Configuration
GRAPHITI_NLP_LANGUAGE=en
GRAPHITI_ENTITY_EXTRACTION=true
```

---

## 🔄 Integration Points

### 1. FalkorDB Backend

Graphiti stores knowledge graphs in FalkorDB (Redis graph module).

**Connection**:
- Host: `falkordb` (Docker service name)
- Port: 6379
- Protocol: Redis wire protocol

**Graph Structure**:
```cypher
// Example entities and relationships
(Entity:Person {name: "John", created_at: timestamp})
(Entity:Organization {name: "Acme Corp", founded: date})
(Entity)-[:WORKS_FOR {since: date, role: string}]->(Organization)
(Entity)-[:KNOWS {since: date, context: string}]->(Entity)
```

### 2. Nexus Router Integration

Nexus Router acts as MCP proxy for Graphiti.

**Flow**:
1. Client (Dify, n8n, Open-WebUI) → Nexus Router
2. Nexus Router → Graphiti MCP (port 9100)
3. Graphiti MCP → FalkorDB
4. Response flows back through Nexus

**MCP Operations**:
- `graphiti.add_entity` - Add entity to knowledge graph
- `graphiti.add_relationship` - Add relationship between entities
- `graphiti.query_graph` - Query knowledge graph
- `graphiti.temporal_query` - Query with time constraints
- `graphiti.get_context` - Get contextual information

### 3. LLM Enhancement

Graphiti can use LLMs for enhanced entity extraction and relationship inference.

**Routing**:
- Graphiti → Nexus Router (`http://nexus-router:8000/v1`)
- Nexus Router → Local GPU workers (preferred) or cloud fallback
- OpenAI-compatible API format

**Use Cases**:
- Entity extraction from unstructured text
- Relationship inference from context
- Semantic similarity for graph queries
- Temporal reasoning for time-based queries

### 4. Redis Caching

Optional Redis caching for query results.

**Benefits**:
- Faster response times for repeated queries
- Reduced FalkorDB load
- TTL-based cache expiration
- Pattern-based cache invalidation

---

## 🔒 Security Considerations

### 1. Authentication

**Current**: No authentication on Graphiti MCP endpoint

**Recommendation**:
- Add API key authentication
- Use Nexus Router for authentication/authorization
- Restrict network access to nyra-network only

### 2. Data Privacy

**Concerns**:
- Knowledge graphs may contain sensitive entity information
- Temporal tracking reveals behavioral patterns
- Relationships expose organizational structure

**Mitigation**:
- Encrypt data at rest (FalkorDB encryption)
- Use TLS for all communication
- Implement RBAC for graph queries
- Add data masking for sensitive entities

### 3. Resource Limits

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 4G
    reservations:
      cpus: '0.5'
      memory: 1G
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics

Add to `infra/monitoring/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'graphiti-mcp'
    static_configs:
      - targets: ['graphiti-mcp:9100']
    metrics_path: '/metrics'

  - job_name: 'graphiti-knowledge'
    static_configs:
      - targets: ['graphiti-knowledge:3000']
    metrics_path: '/metrics'
```

### Grafana Dashboard

**Key Metrics**:
- Request rate and latency
- Entity extraction performance
- Graph query performance
- FalkorDB connection pool status
- Memory usage
- Error rates

### Loki Logging

```yaml
loki:
  clients:
    - url: http://loki:3100/loki/api/v1/push
      tenant_id: nyra
```

**Log Structure**:
```json
{
  "timestamp": "2026-01-13T10:30:00Z",
  "level": "info",
  "service": "graphiti-mcp",
  "operation": "entity_extraction",
  "duration_ms": 125,
  "entities_extracted": 15
}
```

---

## ✅ Testing Strategy

### Unit Tests

**Location**: `services/graphiti-knowledge/tests/`

**Coverage**:
- Entity extraction accuracy
- Graph construction logic
- Temporal tracking correctness
- API endpoint responses

**Command**: `npm test`

### Integration Tests

**Test Scenarios**:
1. FalkorDB connectivity
2. Redis caching behavior
3. Nexus Router integration
4. MCP protocol compliance
5. End-to-end knowledge graph workflow

### Load Testing

**Tool**: Apache JMeter or k6

**Scenarios**:
- 100 concurrent entity extractions
- 1000 graph queries per second
- Temporal queries with large date ranges
- Relationship inference under load

**Success Criteria**:
- P95 latency < 500ms
- 0% error rate
- CPU < 80% utilization
- Memory < 3GB usage

---

## 🚀 Deployment Steps

### Phase 1: Pre-Built MCP (Week 3)

```bash
# 1. Update docker-compose.dev.yml
# Uncomment Graphiti section and update port to 9100

# 2. Add environment variables to infra/.env
cat >> infra/.env << 'EOF'
# Graphiti MCP
GRAPHITI_GROUP_ID=nyra
GRAPHITI_TEMPORAL_TRACKING=true
GRAPHITI_RELATIONSHIP_INFERENCE=true
EOF

# 3. Start Graphiti MCP
cd infra
docker-compose up -d graphiti-mcp

# 4. Verify health
curl http://localhost:9100/health

# 5. Test MCP connectivity via Nexus
curl -X POST http://localhost:8000/mcp/graphiti/add_entity \
  -H "Content-Type: application/json" \
  -d '{"entity": {"type": "person", "name": "John Doe"}}'

# 6. Check logs
docker logs nyra-graphiti-mcp
```

### Phase 2: Custom Service (Week 4+)

```bash
# 1. Create Dockerfile
cat > services/graphiti-knowledge/Dockerfile << 'EOF'
# (Dockerfile content from above)
EOF

# 2. Create .env.example
cat > services/graphiti-knowledge/.env.example << 'EOF'
# (Environment template from above)
EOF

# 3. Build image
cd services/graphiti-knowledge
docker build -t nyra/graphiti-knowledge:latest .

# 4. Add to docker-compose.dev.yml
# (Configuration from Option B above)

# 5. Start custom service
cd ../../infra
docker-compose up -d graphiti-knowledge

# 6. Verify health
curl http://localhost:3000/health

# 7. Test entity extraction
curl -X POST http://localhost:3000/api/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "John Doe works at Acme Corp as CTO since 2020"}'
```

---

## 🔧 Troubleshooting

### Issue: Port Already in Use

**Symptom**:
```
Error starting userland proxy: listen tcp4 0.0.0.0:9100: bind: address already in use
```

**Solution**:
```bash
# Find process using port
netstat -ano | findstr :9100

# Kill process (Windows)
taskkill /PID <pid> /F

# Or change port in docker-compose.yml
```

### Issue: FalkorDB Connection Failed

**Symptom**:
```
Error: Redis connection to falkordb:6379 failed - getaddrinfo ENOTFOUND falkordb
```

**Solution**:
```bash
# Verify FalkorDB is running
docker ps | grep falkordb

# Check network connectivity
docker exec nyra-graphiti-mcp ping falkordb

# Verify nyra-network exists
docker network inspect nyra-network
```

### Issue: MCP Protocol Mismatch

**Symptom**:
```
MCP error: Unsupported protocol version
```

**Solution**:
```bash
# Update to latest MCP image
docker pull zepai/knowledge-graph-mcp:standalone

# Or use specific version
docker pull zepai/knowledge-graph-mcp:v1.2.0
```

### Issue: High Memory Usage

**Symptom**: Container consuming > 4GB memory

**Solution**:
```yaml
# Add resource limits
deploy:
  resources:
    limits:
      memory: 4G
```

---

## 📈 Success Criteria

### Phase 1 (Pre-Built MCP)

- ✅ Graphiti MCP service running on port 9100
- ✅ Health check responding successfully
- ✅ FalkorDB connectivity established
- ✅ Nexus Router integration working
- ✅ Basic MCP operations functional (add_entity, query_graph)
- ✅ No errors in service logs
- ✅ Metrics available in Prometheus

### Phase 2 (Custom Service)

- ✅ Custom service containerized and running on port 3000
- ✅ All API endpoints responding
- ✅ Entity extraction accuracy > 85%
- ✅ Graph query latency < 200ms (P95)
- ✅ Temporal tracking operational
- ✅ Visualization endpoints functional
- ✅ Documentation complete
- ✅ Integration tests passing

---

## 🔗 Related Documents

- `infra/docker/docker-compose.graphiti.yml` - Overlay configuration
- `infra/docker-compose.dev.yml` - Main compose file
- `infra/nexus/nexus.yaml` - Nexus MCP configuration
- `services/graphiti-knowledge/` - Custom service source
- `NEXUS-ROUTER-DEPLOYMENT-PLAN.md` - Nexus Router integration
- `INFRASTRUCTURE-SECURITY-AUDIT.md` - Security considerations

---

## 📋 Next Steps

1. **Immediate (Week 3)**:
   - [ ] Update docker-compose.dev.yml with Graphiti MCP configuration
   - [ ] Standardize port to 9100
   - [ ] Add environment variables to .env
   - [ ] Deploy and test pre-built MCP image
   - [ ] Verify Nexus Router integration
   - [ ] Add Prometheus monitoring

2. **Short-term (Week 4)**:
   - [ ] Create Dockerfile for custom service
   - [ ] Create .env.example and documentation
   - [ ] Build and test custom service image
   - [ ] Run both services in parallel
   - [ ] Compare features and performance
   - [ ] Create migration plan

3. **Long-term (Month 2)**:
   - [ ] Migrate to custom service
   - [ ] Remove pre-built MCP if redundant
   - [ ] Implement authentication
   - [ ] Add advanced NLP features
   - [ ] Create Grafana dashboards
   - [ ] Implement backup strategy

---

**Last Updated**: 2026-01-13
**Next Review**: Week 3 deployment completion
**Reviewed By**: agent-graphiti-planner
**Status**: READY FOR IMPLEMENTATION
