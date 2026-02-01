# Project Nyra Docker Infrastructure - Startup Sequence & Architecture Analysis

**System Architecture Designer Analysis**
**Date**: 2026-01-26
**Status**: Ready for Orchestrated Startup

---

## Executive Summary

Project Nyra uses a **modular microservices architecture** with 11 Docker Compose files managing 20+ services. The infrastructure is organized in a **mesh network topology** with clear dependency chains. This analysis provides the optimal startup sequence prioritizing Nexus Router connectivity for claude-flow MCP integration.

---

## Architecture Overview

### Service Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    MESH NETWORK (172.28.0.0/16)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 0: FOUNDATION LAYER                                  │ │
│  │ - PostgreSQL (pgvector:pg16)        Port: 5432           │ │
│  │ - Redis (cache/sessions)            Port: 6380           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 1: SPECIALIZED DATABASES                             │ │
│  │ - FalkorDB (graph)                  Port: 6380           │ │
│  │ - Qdrant (vector search)            Port: 6333           │ │
│  │ - Neo4j (knowledge graphs)          Port: 7474/7687      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 2: AI INFRASTRUCTURE (CRITICAL PATH)                 │ │
│  │ ┌─────────────────────────────────────────────────────┐   │ │
│  │ │ LiteLLM (LLM proxy)              Port: 4000         │   │ │
│  │ │   ↓                                                  │   │ │
│  │ │ Nexus Router (gateway) ⭐         Port: 6000        │   │ │
│  │ │   ├─ OpenRouter API                                 │   │ │
│  │ │   ├─ Anthropic Claude                               │   │ │
│  │ │   └─ Local Ollama (GPU workers)                     │   │ │
│  │ └─────────────────────────────────────────────────────┘   │ │
│  │                                                            │ │
│  │ - Letta (agent memory)              Port: 8283           │ │
│  │ - Mem0 (universal memory)           Port: 4321           │ │
│  │ - OpenMemory MCP                    Port: 8081           │ │
│  │ - Open-WebUI (chat interface)       Port: 8080           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 3: MCP SERVERS                                       │ │
│  │ - Graphiti MCP (Neo4j graph)        Port: 7459           │ │
│  │ - Qdrant MCP (vector search)        Port: 8066           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 4: BUSINESS SERVICES                                 │ │
│  │ - Nyra Orchestrator (main logic)    Port: 8010           │ │
│  │ - Quote Engine (FastAPI)            Port: 8001           │ │
│  │ - Campaign Engine                   Port: 8002           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 5: APPLICATIONS & WORKFLOWS                          │ │
│  │ - TwentyCRM (system of record)      Port: 3000           │ │
│  │ - n8n (workflow automation)         Port: 5678           │ │
│  │ - Dify (AI workflow builder)        Port: 8000           │ │
│  │ - Activepieces (automation)         Port: 80             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          ↓                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ TIER 6: OBSERVABILITY (OPTIONAL)                          │ │
│  │ - Prometheus (metrics)              Port: 9090           │ │
│  │ - Grafana (dashboards)              Port: 3005           │ │
│  │ - Loki (log aggregation)            Port: 3100           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 RECOMMENDED STARTUP SEQUENCE

### Phase 1: Foundation Layer (MANDATORY)
**Purpose**: Establish core data infrastructure

```bash
# Start base services: PostgreSQL + Redis
docker compose -f infra/docker-compose/docker-compose.base.yml up -d

# Verify health
docker compose -f infra/docker-compose/docker-compose.base.yml ps
docker logs nyra-postgres
docker logs nyra-redis
```

**Expected Outcome**:
- ✅ PostgreSQL healthy on port 5432
- ✅ Redis healthy on port 6380
- ✅ Multi-database initialization (letta, twenty, dify, n8n, litellm, activepieces)
- ⏱️ Startup time: ~30 seconds

---

### Phase 2: Specialized Databases (RECOMMENDED)
**Purpose**: Enable graph and vector storage capabilities

```bash
# Start specialized databases: FalkorDB, Qdrant, Neo4j
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml up -d

# Verify health
docker logs nyra-falkordb
docker logs nyra-qdrant
docker logs nyra-neo4j
```

**Expected Outcome**:
- ✅ FalkorDB (graph) healthy on port 6380
- ✅ Qdrant (vector) healthy on port 6333
- ✅ Neo4j healthy on ports 7474 (HTTP) + 7687 (Bolt)
- ⏱️ Startup time: ~40 seconds (Neo4j requires warm-up)

---

### Phase 3: AI Infrastructure (CRITICAL FOR NEXUS) ⭐
**Purpose**: Enable LLM routing and MCP connectivity

```bash
# Start AI services: LiteLLM → Nexus → Letta, Mem0, Open-WebUI
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml up -d

# Verify Nexus Router health (CRITICAL)
curl http://localhost:6000/health
docker logs nyra-nexus

# Verify LiteLLM
curl http://localhost:4000/health
docker logs nyra-litellm

# Verify memory systems
curl http://localhost:8283/health  # Letta
curl http://localhost:4321/health  # Mem0
```

**Expected Outcome**:
- ✅ **Nexus Router healthy on port 6000** (MCP gateway)
- ✅ LiteLLM healthy on port 4000 (LLM proxy)
- ✅ Letta healthy on port 8283 (agent memory)
- ✅ Mem0 healthy on port 4321 (universal memory)
- ✅ OpenMemory MCP healthy on port 8081
- ✅ Open-WebUI healthy on port 8080
- ⏱️ Startup time: ~60 seconds (Nexus needs config validation)

**⚠️ Configuration Requirements**:
- **MISSING**: `/home/ellisapotheosis/projects/project-nyra/configs/nexus/nexus.toml`
- **Available**: `/home/ellisapotheosis/projects/project-nyra/infra/nexus/nexus.toml`
- **Action Required**: Copy nexus.toml to configs/nexus/ or update volume mount

---

### Phase 4: MCP Servers (CRITICAL FOR CLAUDE-FLOW)
**Purpose**: Enable Model Context Protocol servers for claude-flow integration

```bash
# Start MCP servers: Graphiti MCP, Qdrant MCP
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               -f infra/docker-compose/docker-compose.mcp-servers.yml up -d

# Verify MCP servers
curl http://localhost:7459/health  # Graphiti MCP (Neo4j)
curl http://localhost:8066/health  # Qdrant MCP (vector search)
docker logs nyra-graphiti-mcp
docker logs nyra-qdrant-mcp
```

**Expected Outcome**:
- ✅ Graphiti MCP healthy on port 7459 (SSE transport)
- ✅ Qdrant MCP healthy on port 8066 (HTTP transport)
- ✅ MCP servers registered with labels for auto-discovery
- ⏱️ Startup time: ~20 seconds

---

### Phase 5: Business Services (OPTIONAL - For Full Stack)
**Purpose**: Enable mortgage business logic

```bash
# Start orchestrator and business services
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               -f infra/docker-compose/docker-compose.orchestrator.yml \
               -f infra/docker-compose/docker-compose.business.yml up -d

# Verify orchestrator
curl http://localhost:8010/health  # Nyra Orchestrator
docker logs nyra-orchestrator
```

**Expected Outcome**:
- ✅ Nyra Orchestrator healthy on port 8010
- ✅ Quote Engine healthy (if defined in business.yml)
- ✅ Campaign Engine healthy (if defined)
- ⏱️ Startup time: ~30 seconds

---

### Phase 6: Applications & Workflows (OPTIONAL)
**Purpose**: Enable CRM and workflow automation

```bash
# Start applications: TwentyCRM, n8n, Dify, Activepieces
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               -f infra/docker-compose/docker-compose.crm.yml \
               -f infra/docker-compose/docker-compose.workflow.yml up -d

# Verify applications
curl http://localhost:3000  # TwentyCRM
curl http://localhost:5678  # n8n
curl http://localhost:8000  # Dify
```

**Expected Outcome**:
- ✅ TwentyCRM healthy on port 3000
- ✅ n8n healthy on port 5678
- ✅ Dify healthy on port 8000
- ✅ Activepieces healthy on port 80
- ⏱️ Startup time: ~90 seconds (TwentyCRM requires initialization)

---

### Phase 7: Observability (OPTIONAL)
**Purpose**: Enable monitoring and logging

```bash
# Start observability stack: Prometheus, Grafana, Loki
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.observability.yml up -d

# Access dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3005  # Grafana
```

**Expected Outcome**:
- ✅ Prometheus healthy on port 9090
- ✅ Grafana healthy on port 3005
- ✅ Loki healthy on port 3100
- ⏱️ Startup time: ~40 seconds

---

## 🚀 QUICK START COMMANDS

### Minimal Stack (Nexus + MCP for claude-flow)
**Best for**: claude-flow MCP server development

```bash
cd /home/ellisapotheosis/projects/project-nyra

# Start minimal stack (Phases 1-4)
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               -f infra/docker-compose/docker-compose.mcp-servers.yml \
               up -d

# Total startup time: ~2.5 minutes
# Services: 11 containers (postgres, redis, falkordb, qdrant, neo4j, litellm, nexus, letta, mem0, graphiti-mcp, qdrant-mcp)
```

### Full Stack (All Services)
**Best for**: Complete Nyra development environment

```bash
cd /home/ellisapotheosis/projects/project-nyra

# Start everything using master compose file
docker compose -f infra/docker-compose/docker-compose.yml up -d

# Total startup time: ~5 minutes
# Services: 20+ containers (all tiers)
```

### Development Stack (No Observability)
**Best for**: Daily development work

```bash
cd /home/ellisapotheosis/projects/project-nyra

# Start all except observability
docker compose -f infra/docker-compose/docker-compose.base.yml \
               -f infra/docker-compose/docker-compose.databases.yml \
               -f infra/docker-compose/docker-compose.ai.yml \
               -f infra/docker-compose/docker-compose.mcp-servers.yml \
               -f infra/docker-compose/docker-compose.orchestrator.yml \
               -f infra/docker-compose/docker-compose.business.yml \
               -f infra/docker-compose/docker-compose.crm.yml \
               -f infra/docker-compose/docker-compose.workflow.yml \
               up -d

# Total startup time: ~4 minutes
# Services: 18+ containers (all except Prometheus/Grafana/Loki)
```

---

## 🔧 PRE-FLIGHT CHECKLIST

### 1. Environment Variables
**Critical configurations must be set in `.env` file**:

```bash
# Database credentials
POSTGRES_USER=nyra_user
POSTGRES_PASSWORD=<STRONG_PASSWORD>
POSTGRES_DB=nyra_db
REDIS_PASSWORD=<STRONG_PASSWORD>

# Database names
LETTA_DB=letta
TWENTY_DB=twenty
DIFY_DB=dify
N8N_DB=n8n
LITELLM_DB=litellm
ACTIVEPIECES_DB=activepieces

# Specialized databases
FALKORDB_PASSWORD=<STRONG_PASSWORD>
QDRANT_API_KEY=<STRONG_KEY>
NEO4J_PASSWORD=<STRONG_PASSWORD>

# LLM API Keys (CRITICAL FOR NEXUS)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# LiteLLM
LITELLM_MASTER_KEY=sk-litellm-master-key

# Letta
LETTA_API_KEY=letta_secure_key
LETTA_SERVER_PASSWORD=letta_secure_pass

# Session secrets
SESSION_SECRET=<RANDOM_BASE64>

# Ports (optional, defaults shown)
POSTGRES_PORT=5432
REDIS_PORT=6380
NEXUS_PORT=6000
LITELLM_PORT=4000
LETTA_PORT=8283
MEM0_PORT=4321
```

**Generate strong passwords**:
```bash
# Generate random passwords
openssl rand -base64 32  # For passwords
openssl rand -hex 32     # For API keys
```

### 2. Nexus Configuration (CRITICAL)
**Issue Identified**: Nexus expects config at `/configs/nexus/nexus.toml` but file is at `/infra/nexus/nexus.toml`

**Fix Option A** (Recommended): Update volume mount in docker-compose.ai.yml
```yaml
nexus:
  volumes:
    - ../../infra/nexus/nexus.toml:/etc/nexus.toml:ro  # Changed from configs/nexus
```

**Fix Option B**: Copy config file
```bash
mkdir -p /home/ellisapotheosis/projects/project-nyra/configs/nexus
cp /home/ellisapotheosis/projects/project-nyra/infra/nexus/nexus.toml \
   /home/ellisapotheosis/projects/project-nyra/configs/nexus/nexus.toml
```

### 3. Network Prerequisites
```bash
# Create network (if not auto-created)
docker network create nyra-network --subnet 172.28.0.0/16

# Verify network
docker network inspect nyra-network
```

### 4. Volume Cleanup (If Restarting)
```bash
# WARNING: This deletes all data!
docker compose -f infra/docker-compose/docker-compose.yml down -v

# Remove named volumes
docker volume rm nyra_postgres_data nyra_redis_data nyra_falkordb_data nyra_qdrant_data nyra_neo4j_data
```

---

## 🐛 TROUBLESHOOTING GUIDE

### Issue: Nexus Router Fails to Start

**Symptoms**:
```
Error: Failed to load config from /etc/nexus.toml
```

**Solution**:
1. Check if config file exists in container:
```bash
docker exec nyra-nexus ls -la /etc/nexus.toml
```

2. If missing, fix volume mount (see Pre-flight Checklist #2)

3. Verify API keys in .env:
```bash
grep -E "(ANTHROPIC|OPENROUTER|GOOGLE)_API_KEY" .env
```

### Issue: PostgreSQL Not Ready

**Symptoms**:
```
could not translate host name "postgres" to address
```

**Solution**:
```bash
# Check PostgreSQL status
docker logs nyra-postgres

# Restart with verbose logging
docker compose -f infra/docker-compose/docker-compose.base.yml restart postgres

# Manually test connection
docker exec nyra-postgres pg_isready -U nyra_user
```

### Issue: Services Cannot Communicate

**Symptoms**:
```
dial tcp: lookup redis on 127.0.0.11:53: no such host
```

**Solution**:
```bash
# Verify all services on same network
docker network inspect nyra-network | grep -A 5 "Containers"

# Restart services with network
docker compose -f infra/docker-compose/docker-compose.base.yml down
docker compose -f infra/docker-compose/docker-compose.base.yml up -d
```

### Issue: Letta/Mem0 Cannot Connect to Nexus

**Symptoms**:
```
Failed to connect to http://nexus:6000/v1
```

**Solution**:
```bash
# Verify Nexus health first
curl http://localhost:6000/health

# Check DNS resolution inside container
docker exec nyra-letta ping nexus

# Restart dependent services
docker compose -f infra/docker-compose/docker-compose.ai.yml restart letta mem0
```

### Issue: Out of Memory

**Symptoms**:
```
OOMKilled
```

**Solution**:
1. Check resource limits:
```bash
docker stats

# Show only high memory consumers
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}" | sort -k2 -h
```

2. Adjust limits in compose files:
```yaml
deploy:
  resources:
    limits:
      memory: 2G  # Reduce if needed
```

3. Increase Docker Desktop memory allocation (Settings > Resources)

---

## 📊 DEPENDENCY MATRIX

| Service | Dependencies | Startup Priority | Critical for Nexus? |
|---------|--------------|------------------|---------------------|
| **postgres** | None | 1 | ✅ Yes (LiteLLM DB) |
| **redis** | None | 1 | ✅ Yes (Mem0 cache) |
| **falkordb** | None | 2 | ⚠️ Optional (graph) |
| **qdrant** | None | 2 | ✅ Yes (Mem0 vectors) |
| **neo4j** | None | 2 | ✅ Yes (Graphiti MCP) |
| **litellm** | postgres | 3 | ✅ Yes (LLM proxy) |
| **nexus** | litellm | 3 | ✅ YES (GATEWAY) |
| **letta** | postgres, nexus | 3 | ⚠️ Optional (memory) |
| **mem0** | redis, qdrant, nexus | 3 | ⚠️ Optional (memory) |
| **openmemory_mcp** | mem0 | 3 | ⚠️ Optional (MCP) |
| **openwebui** | postgres, nexus | 3 | ❌ No (UI only) |
| **graphiti-mcp** | neo4j | 4 | ✅ Yes (Graph MCP) |
| **qdrant-mcp** | qdrant | 4 | ✅ Yes (Vector MCP) |
| **nyra_orchestrator** | All AI services | 5 | ❌ No (business logic) |
| **twentycrm** | postgres | 6 | ❌ No (CRM) |
| **n8n** | postgres | 6 | ❌ No (workflow) |
| **dify** | postgres, redis | 6 | ❌ No (workflow) |
| **prometheus** | None | 7 | ❌ No (monitoring) |
| **grafana** | prometheus | 7 | ❌ No (monitoring) |

---

## 🎯 ARCHITECTURE DECISIONS (ADRs)

### ADR-001: Modular Compose Files
**Decision**: Split docker-compose into 11 modular files
**Rationale**: Enables selective service startup, reduces resource usage, improves maintainability
**Trade-offs**: More complex command-line syntax vs. better control

### ADR-002: Mesh Network Topology
**Decision**: Single bridge network (172.28.0.0/16) for all services
**Rationale**: Simplifies service discovery, enables direct communication, reduces latency
**Trade-offs**: Less network isolation vs. better performance

### ADR-003: Multi-Database PostgreSQL
**Decision**: Single PostgreSQL instance with multiple databases
**Rationale**: Reduces resource overhead, simplifies backup/restore, maintains logical separation
**Trade-offs**: Single point of failure vs. operational simplicity

### ADR-004: Nexus as Central Gateway
**Decision**: Route all LLM requests through Nexus Router
**Rationale**: Unified API interface, load balancing, cost optimization (local-first routing)
**Trade-offs**: Additional hop latency (<50ms) vs. centralized control

### ADR-005: Health Check Dependencies
**Decision**: Use `depends_on` with `condition: service_healthy`
**Rationale**: Prevents cascading failures, ensures services start in correct order
**Trade-offs**: Slower startup vs. reliability

---

## 🔐 SECURITY CONSIDERATIONS

### Secrets Management
1. **DO NOT commit `.env` files** to git
2. Use strong random passwords (32+ characters)
3. Rotate credentials every 90 days
4. Consider using Infisical for production secrets

### Network Security
1. **Firewall rules**: Only expose necessary ports to host
2. **Internal communication**: Use service names, not localhost
3. **TLS/SSL**: Enable for production (not included in dev setup)

### Database Security
1. **PostgreSQL**: Enforce strong passwords, restrict network access
2. **Redis**: Require password, disable dangerous commands in prod
3. **Neo4j**: Change default credentials immediately

---

## 🚦 HEALTH CHECK ENDPOINTS

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| Nexus Router | http://localhost:6000/health | 200 OK |
| LiteLLM | http://localhost:4000/health | 200 OK |
| Letta | http://localhost:8283/health | 200 OK |
| Mem0 | http://localhost:4321/health | 200 OK |
| Graphiti MCP | http://localhost:7459/health | 200 OK |
| Qdrant MCP | http://localhost:8066/health | 200 OK |
| Nyra Orchestrator | http://localhost:8010/health | 200 OK |
| TwentyCRM | http://localhost:3000 | HTML response |
| n8n | http://localhost:5678 | HTML response |
| Dify | http://localhost:8000 | HTML response |
| Open-WebUI | http://localhost:8080/health | 200 OK |
| Prometheus | http://localhost:9090/-/healthy | 200 OK |
| Grafana | http://localhost:3005/api/health | 200 OK |

---

## 📈 PERFORMANCE TARGETS

### Startup Times (from cold start)
- **Phase 1 (Foundation)**: 30 seconds
- **Phase 2 (Databases)**: +40 seconds = 70 seconds
- **Phase 3 (AI)**: +60 seconds = 130 seconds
- **Phase 4 (MCP)**: +20 seconds = 150 seconds
- **Phase 5 (Business)**: +30 seconds = 180 seconds
- **Phase 6 (Apps)**: +90 seconds = 270 seconds
- **Phase 7 (Observability)**: +40 seconds = 310 seconds

**Full Stack Total**: ~5 minutes

### Resource Requirements

| Configuration | CPU Cores | RAM | Storage |
|---------------|-----------|-----|---------|
| Minimal (Phases 1-4) | 8 cores | 16 GB | 50 GB |
| Development (Phases 1-6) | 12 cores | 24 GB | 100 GB |
| Full Stack (All Phases) | 16 cores | 32 GB | 150 GB |

---

## 🔄 RECOMMENDED NEXT STEPS

### Immediate (Before First Startup)
1. ✅ **Fix Nexus config path** (Pre-flight #2)
2. ✅ **Create `.env` file** with all required variables
3. ✅ **Verify API keys** are valid (test with curl)
4. ✅ **Ensure sufficient resources** (Docker Desktop settings)

### Phase 1 Validation (After Minimal Stack)
1. ✅ Test Nexus health: `curl http://localhost:6000/health`
2. ✅ Test LiteLLM: `curl http://localhost:4000/v1/models`
3. ✅ Test Graphiti MCP: `curl http://localhost:7459/health`
4. ✅ Test Qdrant MCP: `curl http://localhost:8066/health`
5. ✅ Configure claude-flow MCP client to use Nexus

### Phase 2 Integration (After Full Stack)
1. ✅ Import test data into TwentyCRM
2. ✅ Configure n8n workflows
3. ✅ Set up Grafana dashboards
4. ✅ Run end-to-end mortgage workflow test

---

## 📚 REFERENCES

- **Docker Compose Docs**: https://docs.docker.com/compose/
- **Nexus Router**: https://github.com/grafbase/nexus
- **LiteLLM**: https://docs.litellm.ai/
- **Letta**: https://docs.letta.com/
- **Graphiti MCP**: https://help.getzep.com/graphiti/
- **Project Nyra Architecture**: `/home/ellisapotheosis/projects/project-nyra/ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-01-26
**Maintainer**: System Architecture Designer (Claude)
**Status**: Ready for Implementation
