# Agentic-Flow Alpha - Docker Integration

**Status**: Production Ready
**Version**: 2.0.0-alpha
**Integration**: ADR-001 Deep Integration

---

## 📋 Overview

This directory contains the Docker containerization for **agentic-flow@alpha**, the core orchestration primitives that claude-flow extends. This integration eliminates 10,000+ duplicate lines by building claude-flow as a specialized extension rather than a parallel implementation.

### What is Agentic-Flow?

Agentic-flow provides the foundational primitives for agent orchestration:
- **Agent lifecycle management** (spawn, coordinate, terminate)
- **Memory systems** (AgentDB with HNSW indexing)
- **ReasoningBank intelligence** (4-step learning pipeline)
- **Swarm coordination** (mesh, hierarchical, adaptive topologies)
- **MCP server** (Model Context Protocol integration)

### What is Claude-Flow?

Claude-flow extends agentic-flow with:
- **Claude-specific optimizations** (Anthropic API integration)
- **SPARC methodology** (Specification → Pseudocode → Architecture → Refinement → Completion)
- **GitHub integration** (PR management, code review)
- **Hooks system** (27 hooks + 12 background workers)
- **V3 enhancements** (Neural optimization, consensus mechanisms)

---

## 🏗️ Architecture

### Integration Pattern (ADR-001)

```
┌─────────────────────────────────────────────────────┐
│ Claude-Flow (Orchestrator)                          │
│ ├── SPARC workflows                                 │
│ ├── GitHub integration                              │
│ ├── Hooks system (27 hooks)                        │
│ └── V3 enhancements                                 │
└──────────────────┬──────────────────────────────────┘
                   │ extends
                   ↓
┌─────────────────────────────────────────────────────┐
│ Agentic-Flow (Core Primitives) ← THIS SERVICE      │
│ ├── Agent lifecycle                                 │
│ ├── Memory (AgentDB)                                │
│ ├── ReasoningBank                                   │
│ ├── Swarm coordination                              │
│ └── MCP server                                      │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ↓              ↓              ↓
┌─────────┐  ┌──────────┐  ┌──────────┐
│PostgreSQL│  │  Redis   │  │  Qdrant  │
│ (state)  │  │ (cache)  │  │ (vectors)│
└─────────┘  └──────────┘  └──────────┘
```

### Service Communication

```
┌──────────────┐         ┌──────────────┐
│ Claude-Flow  │ ──API──→│ Agentic-Flow │
│ (Port 3001)  │         │ (Port 8080)  │
└──────────────┘         └──────┬───────┘
                                 │
                   ┌─────────────┼─────────────┐
                   ↓             ↓             ↓
           ┌──────────┐  ┌──────────┐  ┌──────────┐
           │  AgentDB │  │   MCP    │  │  Nexus   │
           │  Memory  │  │  Server  │  │  Router  │
           │(SQLite)  │  │(Port 8081)│ │(Port 7000)│
           └──────────┘  └──────────┘  └──────────┘
```

---

## 🚀 Quick Start

### Prerequisites

1. **Docker & Docker Compose** installed
2. **Infisical CLI** (optional, for secret management)
3. **PostgreSQL, Redis, Qdrant** running (via docker-compose.orchestration.yml)

### 1. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Build & Start

```bash
# Build the image
docker compose -f docker-compose.agentic-flow.yml build

# Start the service
docker compose -f docker-compose.agentic-flow.yml up -d

# View logs
docker compose -f docker-compose.agentic-flow.yml logs -f agentic-flow
```

### 3. With Infisical (Recommended)

```bash
# Start with Infisical secret injection
infisical run --projectId="pbcskpxyqtysbxjvecfo" \
  --env="dev" --path="/shared" -- \
  docker compose -f docker-compose.agentic-flow.yml up -d
```

### 4. Verify Health

```bash
# Check service health
curl http://localhost:8080/health

# Expected response:
# {
#   "status": "healthy",
#   "version": "2.0.0-alpha",
#   "services": {
#     "agentdb": "connected",
#     "redis": "connected",
#     "postgres": "connected",
#     "qdrant": "connected"
#   },
#   "uptime": 12345
# }
```

---

## 📊 AgentDB Integration

### Initialization

AgentDB is automatically initialized on first start. Data is persisted in:

```
volumes/
└── nyra_agentic_flow_agentdb/
    └── agentic.db          # SQLite database with HNSW index
```

### Manual Initialization

```bash
# Access container
docker exec -it nyra-agentic-flow sh

# Initialize AgentDB
npx agentdb@latest init /app/data/agentdb/agentic.db \
  --dimension 1536 \
  --preset large

# Verify
npx agentdb@latest stats /app/data/agentdb/agentic.db
```

### Performance Configuration

Edit `.env` to tune AgentDB:

```bash
# Memory reduction (4x-32x)
AGENTDB_QUANTIZATION=binary    # binary|scalar|product|none

# Cache size (patterns to cache)
AGENTDB_CACHE_SIZE=2000

# HNSW indexing
AGENTDB_HNSW_M=16             # Connections per layer
AGENTDB_HNSW_EF=100           # Search quality
```

**Performance Targets**:
- Pattern search: <100µs (150x faster)
- Large-scale query (1M vectors): <10ms (12,500x faster)
- Memory reduction: 4x-32x with quantization

---

## 🔄 MCP Server Integration

### MCP Endpoints

The agentic-flow MCP server exposes these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/agent/spawn` | POST | Spawn new agent |
| `/mcp/agent/status` | GET | Get agent status |
| `/mcp/agent/terminate` | POST | Terminate agent |
| `/mcp/swarm/init` | POST | Initialize swarm |
| `/mcp/swarm/status` | GET | Get swarm status |
| `/mcp/memory/store` | POST | Store in AgentDB |
| `/mcp/memory/search` | POST | Search AgentDB |
| `/mcp/memory/retrieve` | GET | Retrieve from memory |

### Example: Spawn Agent via MCP

```bash
curl -X POST http://localhost:8081/mcp/agent/spawn \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ${AGENTIC_FLOW_API_KEY}" \
  -d '{
    "type": "coder",
    "config": {
      "model": "claude-sonnet-4-5",
      "maxTokens": 4096
    }
  }'
```

### Claude Desktop Integration

Add to Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "agentic-flow": {
      "command": "docker",
      "args": [
        "exec",
        "-i",
        "nyra-agentic-flow",
        "node",
        "dist/mcp-server.js"
      ]
    }
  }
}
```

---

## 🧠 ReasoningBank Pipeline

### 4-Step Intelligence Pipeline

1. **RETRIEVE** - Search AgentDB for similar patterns (HNSW, <100µs)
2. **JUDGE** - Evaluate trajectory and assign verdict
3. **DISTILL** - Extract learnings via LoRA adaptation
4. **CONSOLIDATE** - Prevent forgetting via EWC++

### Automatic Trajectory Tracking

ReasoningBank automatically tracks all agent operations via hooks:

```typescript
// Hooks automatically record:
// - Tool usage (Write, Edit, Task, etc.)
// - Outcomes (success/failure)
// - Metrics (latency, token usage)
// - Context (task, domain, agent type)

// No manual intervention required!
```

### Manual Pattern Storage

```bash
# Store successful pattern
curl -X POST http://localhost:8081/mcp/memory/store \
  -H "Content-Type: application/json" \
  -d '{
    "task": "Optimize database query",
    "approach": "Add indexes + caching",
    "outcome": "success",
    "metrics": {
      "latency_before": 2500,
      "latency_after": 150
    }
  }'
```

---

## 🌐 Claude-Flow Integration

### API Integration

Claude-flow communicates with agentic-flow via REST API:

```typescript
// In claude-flow code
import { AgenticFlowClient } from '@nyra/agentic-flow-client';

const client = new AgenticFlowClient({
  baseUrl: process.env.AGENTIC_FLOW_URL || 'http://agentic-flow:8080',
  apiKey: process.env.AGENTIC_FLOW_API_KEY,
});

// Spawn agent
const agent = await client.spawnAgent({
  type: 'coder',
  config: { model: 'claude-sonnet-4-5' }
});

// Search memory
const memories = await client.searchMemory({
  query: 'database optimization',
  k: 5
});
```

### Shared Agent Configs

Agent configurations are shared via volume mount:

```yaml
volumes:
  # Claude-flow agent configs → Agentic-flow
  - ../../.claude-flow/agents:/app/data/agent-configs:ro
```

This ensures both services use the same agent definitions.

---

## 📈 Monitoring

### Health Endpoints

```bash
# Service health
curl http://localhost:8080/health

# Detailed metrics
curl http://localhost:8080/metrics

# AgentDB statistics
curl http://localhost:8080/agentdb/stats
```

### Prometheus Metrics

Metrics are exposed on port 9091:

```bash
# Scrape endpoint
curl http://localhost:9091/metrics
```

**Available metrics**:
- `agentic_flow_agents_spawned_total`
- `agentic_flow_agent_duration_seconds`
- `agentdb_search_latency_seconds`
- `agentdb_cache_hit_rate`
- `reasoningbank_patterns_stored_total`
- `mcp_requests_total`

### Prometheus Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'agentic-flow'
    static_configs:
      - targets: ['agentic-flow:9091']
    scrape_interval: 30s
```

### Grafana Dashboard

Import dashboard from `monitoring/grafana-agentic-flow.json`

---

## 🔒 Security

### Authentication

API requests require authentication:

```bash
# Set API key
export AGENTIC_FLOW_API_KEY="your-secure-key-here"

# Include in requests
curl -H "X-API-Key: ${AGENTIC_FLOW_API_KEY}" \
  http://localhost:8080/health
```

### Infisical Secret Management

Secrets are injected via Infisical:

```bash
# Set secrets in Infisical dashboard
# - Path: /shared
# - Environment: dev|staging|prod

# Secrets:
# AGENTIC_FLOW_API_KEY
# AGENTIC_FLOW_JWT_SECRET
# ANTHROPIC_API_KEY
# OPENAI_API_KEY
# OPENROUTER_API_KEY
```

### Network Isolation

Service runs in `nyra-network` with restricted access:

```yaml
networks:
  nyra-network:
    external: true  # Only accessible within stack
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run tests
docker exec nyra-agentic-flow pnpm test

# With coverage
docker exec nyra-agentic-flow pnpm test:coverage
```

### Integration Tests

```bash
# Test MCP endpoints
./tests/test-mcp-integration.sh

# Test AgentDB operations
./tests/test-agentdb-integration.sh

# Test claude-flow integration
./tests/test-claude-flow-integration.sh
```

---

## 🐛 Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.agentic-flow.yml logs agentic-flow

# Common issues:
# 1. PostgreSQL not ready → Wait for health check
# 2. Redis connection failed → Check REDIS_PASSWORD
# 3. Port already in use → Change AGENTIC_FLOW_PORT
```

### AgentDB Initialization Failed

```bash
# Manually initialize
docker exec -it nyra-agentic-flow sh
npx agentdb@latest init /app/data/agentdb/agentic.db --dimension 1536

# Check permissions
ls -la /app/data/agentdb/
# Should be owned by 'node' user
```

### High Memory Usage

```bash
# Enable aggressive quantization
# Edit .env:
AGENTDB_QUANTIZATION=binary

# Reduce cache size
AGENTDB_CACHE_SIZE=1000

# Restart service
docker compose -f docker-compose.agentic-flow.yml restart agentic-flow
```

---

## 📚 Additional Resources

### Documentation
- **ADR-001**: [Deep Integration Pattern](../../../docs/architecture/adr/ADR-001-bootstrap-monorepo-integration.md)
- **AgentDB Guide**: [Integration Guide](../../../docs/integration/AGENTDB-INTEGRATION-GUIDE.md)
- **Agentic-Flow Docs**: https://github.com/ruvnet/agentic-flow

### Related Services
- **Claude-Flow**: `../../orchestrator/docker-compose.orchestrator.yml`
- **Nexus Router**: `../../services/nexus-router/`
- **PostgreSQL**: `../../base/docker-compose.core.yml`

---

## 📝 Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-22 | 2.0.0-alpha | Initial Docker integration |

---

**Maintained by**: Project Nyra Infrastructure Team
**Support**: See `TROUBLESHOOTING.md`
**License**: MIT
