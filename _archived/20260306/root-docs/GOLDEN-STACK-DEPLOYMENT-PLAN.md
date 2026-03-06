# Golden Stack Deployment Plan

## Architecture Overview

**The Golden Stack** replaces the fragmented memory architecture (Letta, Mem0, Qdrant, OpenMemory) with a unified, high-performance "Brain" for Project Nyra:

```
┌─────────────────────────────────────────────────────────────┐
│                   CLAUDE FLOW V3 (Orchestrator)             │
│                      Local Source Mount                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
┌────────────┐  ┌──────────┐  ┌──────────┐
│  Archon    │  │   Zep    │  │ RuVector │
│   MCP      │  │   MCP    │  │   SQL    │
│  :8051     │  │  :8000   │  │  :5433   │
└────────────┘  └──────────┘  └──────────┘
     │              │              │
     ▼              ▼              ▼
┌────────────┐  ┌──────────┐  ┌──────────┐
│  Supabase  │  │ FalkorDB │  │PostgreSQL│
│   Stack    │  │  Graph   │  │ + Vector │
│  (Local)   │  │  :6381   │  │  Search  │
└────────────┘  └──────────┘  └──────────┘
```

---

## Component Roles

### 1. RuVector PostgreSQL (Internal Pattern Memory)
- **Port**: 5433
- **Image**: `ruvnet/ruvector-postgres:latest`
- **Purpose**: High-performance vector database for code patterns, embeddings
- **Features**:
  - 77+ SQL functions for vector operations
  - HNSW/IVFFlat indexing with SIMD acceleration
  - Hyperbolic embeddings (Poincaré ball)
  - GNN support, agent routing
  - Performance: ~61µs latency, 16,400 QPS
- **Database**: `claude_flow`
- **Used By**: Claude Flow (native integration)

### 2. Archon (Management Layer)
- **UI Port**: 3737
- **API Port**: 8181
- **MCP Port**: 8051
- **Images**: `archonos/archon-server`, `archonos/archon-ui`, `archonos/archon-mcp`
- **Purpose**: Project management, task tracking, document search
- **Features**:
  - Task board and sprint planning
  - Document storage and search
  - Requirements tracking
  - Project coordination
- **Backend**: Local Supabase stack
- **Database**: `archon_db` (on Supabase Postgres)

### 3. Zep + FalkorDB (Episodic Memory)
- **Zep MCP Port**: 8000
- **FalkorDB Port**: 6381
- **Images**: `zepai/zep`, `falkordb/falkordb:latest`
- **Purpose**: Long-term conversation history, user facts, relationships
- **Features**:
  - Temporal knowledge graphs
  - Conversation memory management
  - Fact extraction and storage
  - Relationship tracking
- **Database**: FalkorDB (Redis-compatible graph DB)

### 4. Redis (Fast Cache)
- **Port**: 6380
- **Image**: `redis:7-alpine`
- **Purpose**: Session management, fast caching, coordination
- **Used By**: All services for caching

### 5. Local Supabase Stack (Archon Backend)
Components:
- **PostgreSQL** (5433): Main database
- **Kong** (8001): API Gateway
- **GoTrue** (9999): Authentication
- **Realtime** (4000): WebSocket subscriptions
- **Storage** (5001): File storage
- **PostgREST** (3001): REST API

---

## Separation of Concerns

| Component | Role | Data Type | Query |
|-----------|------|-----------|-------|
| **RuVector** | Code patterns, embeddings | Vectors, code | "Find similar patterns" |
| **Archon** | Tasks, docs, requirements | Structured | "Show me sprint tasks" |
| **Zep** | Conversations, facts, history | Temporal graph | "What did user say about X?" |
| **Redis** | Cache, sessions | Key-value | "Get session data" |

**Claude Flow Routing**:
- **Code questions** → RuVector (internal SQL)
- **Project management** → Archon MCP
- **Conversation context** → Zep MCP
- **Quick lookups** → Redis

---

## Deployment Steps

### Step 1: Prepare Environment
```bash
cd /home/ellisapotheosis/projects/project-nyra/infra/docker-compose

# Generate secure passwords
POSTGRES_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 48)
REDIS_PASSWORD=$(openssl rand -base64 24)
FALKORDB_PASSWORD=$(openssl rand -base64 24)
ARCHON_API_KEY=$(openssl rand -hex 32)

# Store in Infisical (optional)
infisical secrets set RUVECTOR_POSTGRES_PASSWORD "$POSTGRES_PASSWORD" --path /shared
infisical secrets set ARCHON_JWT_SECRET "$JWT_SECRET" --path /shared
# ... etc
```

### Step 2: Deploy Golden Stack
```bash
# Deploy with Infisical injection
infisical run -- docker compose \
  -f docker-compose.golden-stack-v2.yml \
  up -d

# Or with .env file
docker compose \
  -f docker-compose.golden-stack-v2.yml \
  --env-file .env.golden-stack-populated \
  up -d
```

### Step 3: Initialize Databases
```bash
# RuVector extension is auto-created via init-db.sql
docker exec nyra-ruvector-postgres psql -U claude -d claude_flow -c "SELECT ruvector_version();"

# Archon database is auto-initialized
docker logs archon-server | grep "Database initialized"

# Verify all healthy
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Step 4: Configure Claude Flow
Update `.mcp.json`:
```json
{
  "mcpServers": {
    "archon": {
      "command": "curl",
      "args": ["http://localhost:8051"],
      "autoStart": true
    },
    "zep": {
      "command": "curl",
      "args": ["http://localhost:8000"],
      "autoStart": true
    }
  }
}
```

Update `.claude-flow/config.yaml`:
```yaml
memory:
  backend: ruvector
  connectionString: postgresql://claude:password@localhost:5433/claude_flow

mcp:
  servers:
    - name: archon
      url: http://localhost:8051
      role: project-management
    - name: zep
      url: http://localhost:8000
      role: episodic-memory
```

### Step 5: Verify Integration
```bash
# Test RuVector
npx @claude-flow/cli@latest ruvector test-connection

# Test Archon MCP
curl http://localhost:8051/health

# Test Zep MCP
curl http://localhost:8000/health

# Test full stack
npx @claude-flow/cli@latest doctor
```

---

## Service Ports Reference

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| RuVector PostgreSQL | 5433 | PostgreSQL | Claude Flow memory |
| Archon UI | 3737 | HTTP | Web interface |
| Archon API | 8181 | HTTP | Backend API |
| Archon MCP | 8051 | HTTP/MCP | MCP server |
| Zep MCP | 8000 | HTTP/MCP | Memory MCP |
| FalkorDB | 6381 | Redis | Graph database |
| Redis | 6380 | Redis | Cache |
| Supabase Postgres | 5433 | PostgreSQL | Archon DB |
| Supabase Kong | 8001 | HTTP | API Gateway |
| Supabase Auth | 9999 | HTTP | Authentication |
| Supabase Realtime | 4000 | WebSocket | Real-time subs |
| Supabase Storage | 5001 | HTTP | File storage |
| Supabase REST | 3001 | HTTP | PostgREST API |

---

## Resource Requirements

| Service | CPU | Memory | Disk |
|---------|-----|--------|------|
| RuVector PostgreSQL | 2.0 | 4GB | 20GB |
| Archon Stack | 2.0 | 4GB | 10GB |
| Zep + FalkorDB | 2.0 | 4GB | 10GB |
| Supabase Stack | 4.0 | 8GB | 20GB |
| Redis | 1.0 | 2GB | 2GB |
| **Total** | **11.0** | **22GB** | **62GB** |

**Orchestrator PC** (recommended):
- CPU: 12 cores (have this ✓)
- RAM: 32GB minimum (have 13.4GB - may need to reduce service limits)
- Disk: 100GB available

---

## Migration Notes

### Old Stack Removal
Services to remove:
- `letta` (replaced by Zep)
- `mem0` (replaced by Zep + RuVector)
- `qdrant` (replaced by RuVector)
- `openmemory-mcp` (replaced by Zep MCP)
- `graphiti-mcp` (replaced by Zep MCP)
- `neo4j` (replaced by FalkorDB)

### Data Migration
1. **Memory Export**:
   ```bash
   npx @claude-flow/cli@latest memory export --format json > memory-backup.json
   ```

2. **Import to RuVector**:
   ```bash
   npx @claude-flow/cli@latest ruvector import --input memory-backup.json
   ```

3. **Archon Setup**:
   - Fresh start (no migration needed)
   - Import tasks via UI if needed

4. **Zep Setup**:
   - Fresh start with conversation history
   - Will build knowledge graph from new interactions

---

## Health Check Commands

```bash
# All services status
docker compose -f docker-compose.golden-stack-v2.yml ps

# Individual service logs
docker logs nyra-ruvector-postgres
docker logs archon-server
docker logs nyra-zep-mcp

# Health endpoints
curl http://localhost:5433/health  # RuVector (won't work - use pg_isready)
curl http://localhost:8181/health  # Archon API
curl http://localhost:8051/health  # Archon MCP
curl http://localhost:8000/health  # Zep MCP
curl http://localhost:3737         # Archon UI

# Database connections
docker exec nyra-ruvector-postgres pg_isready -U claude
docker exec archon-postgres pg_isready -U postgres
docker exec nyra-falkordb redis-cli ping
```

---

## Troubleshooting

### Issue: Services won't start
```bash
# Check logs
docker compose -f docker-compose.golden-stack-v2.yml logs

# Check resource usage
docker stats

# Verify network
docker network ls | grep nyra
docker network inspect nyra-network
```

### Issue: MCP connection fails
```bash
# Test MCP endpoints
curl -v http://localhost:8051/health
curl -v http://localhost:8000/health

# Check claude-flow config
npx @claude-flow/cli@latest config get

# Restart claude-flow daemon
npx @claude-flow/cli@latest daemon restart
```

### Issue: Database connection errors
```bash
# Check PostgreSQL logs
docker logs nyra-ruvector-postgres
docker logs archon-postgres

# Test connections
docker exec nyra-ruvector-postgres psql -U claude -d claude_flow -c "SELECT 1;"
docker exec archon-postgres psql -U postgres -d archon_db -c "SELECT 1;"
```

---

## Next Steps

1. **Deploy Golden Stack** (current task)
2. **Initialize all databases**
3. **Configure Claude Flow MCP connections**
4. **Test end-to-end integration**
5. **Import existing memory to RuVector**
6. **Set up worker PC coordination** (Ollama/vLLM routing via Nexus)
7. **Production hardening** (secrets, backups, monitoring)

---

**Status**: Ready for deployment
**Last Updated**: 2026-01-28 03:00 PST
