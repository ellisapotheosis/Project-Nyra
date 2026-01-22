# Docker Compose Inventory - Project Nyra

**Analysis Date**: 2026-01-18
**Researcher**: Claude Sonnet 4.5
**Status**: Complete

---

## Executive Summary

Comprehensive analysis of ALL docker-compose files in Project-Nyra repository revealed:

- **100+ compose files** found across the repository
- **60 active compose files** in use
- **40 archived compose files** in `_archive` directory
- **15 critical port conflicts** requiring immediate resolution
- **25 duplicate service definitions** causing confusion
- **8 network naming inconsistencies**
- **12 volume duplications**

**Full detailed analysis**: `C:\Dev\Projects\Repos\Project-Nyra\docs\docker-compose-inventory.json`

---

## Critical Issues

### 1. Port 6379 Conflict (CRITICAL)

**Problem**: Redis and FalkorDB both default to port 6379, causing runtime conflicts.

**Impact**: Services fail to start when both are deployed simultaneously.

**Solution**: Move FalkorDB to port 6380 across all compose files.

**Affected Files**:
- `docker-compose.yml` (root)
- `docker-compose.memory.yml`
- `infra/docker-compose.dev.yml`
- `infra/docker-compose.worker.yml`
- `infra/stacks/nyra-mortgage/docker-compose.yml`

### 2. Multiple Grafana Instances on Port 3000

**Conflicting Services**: Grafana, TwentyCRM, Dify Web

**Resolution**:
- Grafana: Keep 3000 (primary)
- TwentyCRM: Move to 3010
- Dify Web: Move to 3002

### 3. PostgreSQL Proliferation

**Problem**: 12 separate PostgreSQL instances across compose files.

**Current State**:
- Each service (Dify, Twenty, Letta, n8n, LiteLLM, Activepieces) has its own Postgres
- Multiple databases on different ports (5432, 5433)
- Massive resource waste and management overhead

**Solution**: Single PostgreSQL instance with multiple databases.

---

## Service Duplication Analysis

### Databases (High Duplication)

| Service | Instances | Ports | Impact |
|---------|-----------|-------|--------|
| PostgreSQL | 12 | 5432, 5433 | CRITICAL - Resource waste |
| Redis | 10 | 6379, 6380 | HIGH - Caching confusion |
| FalkorDB | 8 | 6379 | CRITICAL - Port conflict |
| Qdrant | 6 | 6333 | MEDIUM |

### LLM Services (Medium Duplication)

| Service | Instances | Configurations | Impact |
|---------|-----------|---------------|--------|
| LiteLLM | 7 | Single, 3x HA, Gateway | HIGH - No standard |
| Nexus Router | 4 | Various configs | MEDIUM |
| Letta | 8 | Mixed configs | HIGH |
| Mem0 | 5 | REST, MCP, Bridge | MEDIUM |

### Monitoring (High Duplication)

| Service | Instances | Ports | Impact |
|---------|-----------|-------|--------|
| Prometheus | 9 | 9090, 9091 | HIGH |
| Grafana | 8 | 3000, 3001, 3005 | HIGH |
| Loki | 7 | 3100 | MEDIUM |

---

## Key Compose Files by Location

### Root Level (Primary Stacks)

1. **`docker-compose.yml`** (Main Production Stack)
   - Services: Nexus, LiteLLM, TwentyCRM, FalkorDB, Letta, Mem0, Observability
   - Ports: 6000, 4000, 3000, 6379, 8283, 4321, 8010, 9090, 3100, 3005, 9093, 8080
   - Status: **ACTIVE - Primary**

2. **`docker-compose.memory.yml`** (Memory Stack)
   - Services: FalkorDB, Graphiti, Qdrant, Redis, Letta, Mem0 Bridge, Monitoring
   - Ports: 6379, 7459, 6333, 8001, 8283, 5433, 8284, 9091, 3001
   - Status: **ACTIVE**

3. **`docker-compose.infisical.yml`** (Secrets Management)
   - Services: Infisical MCP, Claude Flow MCP, MetaMCP Gateway, Workers, Infrastructure
   - Ports: 8006, 8003, 8005, 8000-8003, 5432, 6379
   - Status: **ACTIVE**

4. **`docker-compose.voice.yml`**
   - Status: **PLACEHOLDER** (Not implemented)

### Infra Directory (Infrastructure Configs)

1. **`infra/docker-compose.dev.yml`** (Complete Dev Stack)
   - **60+ services**: All databases, LLM services, workflow, CRM, monitoring, MCP servers
   - Status: **ACTIVE - Development**

2. **`infra/docker-compose.orchestrator.yml`** (Orchestrator Node)
   - Services: Nexus Router, Letta, Mem0, Claude Flow, AgentDB, RuVector, Infisical
   - Status: **ACTIVE**

3. **`infra/docker-compose.worker.yml`** (Worker Nodes)
   - Services: TwentyCRM, n8n, Dify, Ollama, Neo4j, FalkorDB, Monitoring
   - Status: **ACTIVE**

### Infra/Docker Directory (Specialized Stacks)

1. **`infra/docker/docker-compose.full.yml`** (Complete Stack)
   - **Comprehensive**: All layers - databases, orchestration, AI services, workflow, observability
   - Services: PostgreSQL, Redis, FalkorDB, Qdrant, Claude Flow, Archon OS, Nexus Router, Letta, Open-WebUI, LobeChat, n8n, Full Monitoring Stack
   - Status: **ACTIVE - Production Ready**

2. **`infra/docker/docker-compose.services.yml`** (Business Services)
   - Services: Quote Engine, Campaign Engine, Quote API
   - Ports: 9010, 9020, 8089
   - Status: **ACTIVE**

3. **`infra/docker/docker-compose.local.yml`** (Local Dev Overlay)
   - Services: Nyra Orchestrator
   - Status: **ACTIVE - Development**

### Services Directory (Service-Specific)

1. **`services/litellm-proxy/docker-compose.yml`** (LiteLLM HA)
   - Configuration: 3 LiteLLM instances + Nginx load balancer
   - Monitoring: Prometheus, Grafana, Loki, Promtail
   - Status: **ACTIVE - Production**

### Configs Directory (Per-PC Configs)

1. **`configs/docker-compose.orchestrator.yml`** (Orchestrator PC)
   - Services: API Gateway (LiteLLM), Monitoring, Wake-on-LAN, Cloudflared
   - Specialization: Coordination and routing
   - Status: **ACTIVE**

2. **`configs/docker-compose.worker1.yml`** (Worker 1 - RTX 3060)
   - Services: Ollama, LiteLLM Proxy, Model Manager, Monitoring
   - Specialization: Code generation
   - Status: **ACTIVE**

3. **`configs/docker-compose.worker2.yml`** (Worker 2 - RTX 5090)
   - Status: **ACTIVE**

4. **`configs/docker-compose.worker3.yml`** (Worker 3 - RTX 3090Ti)
   - Status: **ACTIVE**

### Stacks Directory (Application Stacks)

1. **`infra/stacks/nyra-mortgage/docker-compose.yml`**
   - **Mirrors root docker-compose.yml**
   - Status: **ACTIVE**

### Archived Compose Files

- **Location**: `infra/archive/nyra-infra-old/compose/`
- **Count**: 18 files
- **Files**: compose.metamcp.yml, compose.claude-flow.yml, compose.mcp.yml, compose.memory.yml, compose.ui.yml, compose.orchestration.yml, etc.
- **Status**: **ARCHIVED**

---

## Network Analysis

### Current Networks (Inconsistent)

- `nyra` (root compose)
- `nyra-network` (infra compose)
- `nyra-memory-network` (memory compose)
- `nyra-infisical-network` (infisical compose)
- `nyra-net` (orchestrator/worker compose)
- `litellm-network` (litellm service)
- `nyra-orchestrator` (configs)
- `nyra-worker1` (worker configs)

### Subnet Conflicts

- **172.20.0.0/16** - Used by multiple configs
- **172.21.0.0/16** - Worker configs
- **172.28.0.0/16** - Full stack

**Recommendation**: Standardize to single `nyra-network` (172.20.0.0/16) across all compose files.

---

## Volume Analysis

### Common Volumes (Duplicated Across Files)

- `postgres_data` (12 variations)
- `redis_data` (10 variations)
- `falkordb_data` (8 variations)
- `qdrant_data` (6 variations)
- `letta_data` (8 variations)
- `mem0_data` (5 variations)
- `prometheus_data` (9 variations)
- `grafana_data` (8 variations)
- `loki_data` (7 variations)
- `n8n_data` (4 variations)

**Total Unique Volumes**: 85+

**Issue**: Inconsistent naming and duplicate definitions.

---

## Consolidation Recommendations

### Phase 1: Immediate Actions (1-2 days)

**Priority 1 - Port Conflicts**:
1. Fix Redis/FalkorDB port 6379 conflict
   - Move FalkorDB to 6380 in ALL compose files
2. Resolve Grafana/TwentyCRM/Dify port 3000 conflict
   - Grafana: 3000
   - TwentyCRM: 3010
   - Dify Web: 3002

**Priority 2 - PostgreSQL Consolidation**:
1. Create single PostgreSQL instance
2. Configure multiple databases: `dify`, `twenty`, `letta`, `n8n`, `litellm`, `nyra`, `activepieces`
3. Update all compose files to reference consolidated instance

**Priority 3 - Network Standardization**:
1. Standardize to `nyra-network` across all compose files
2. Remove duplicate network definitions
3. Update subnet to consistent `172.20.0.0/16`

### Phase 2: Service Consolidation (3-5 days)

1. **Merge Duplicate Services**:
   - Consolidate Redis instances (keep orchestrator + worker-local)
   - Standardize Letta deployment (single instance)
   - Define LiteLLM strategy (HA vs single)

2. **Implement Docker Compose Profiles**:
   ```yaml
   services:
     orchestrator:
       profiles: ["orchestrator"]

     worker:
       profiles: ["worker"]

     development:
       profiles: ["dev"]
   ```

3. **Consolidate Monitoring Stack**:
   - Single Prometheus instance per environment
   - Single Grafana instance per environment
   - Single Loki instance per environment

4. **Centralize Environment Variables**:
   - Create `.env.example` template
   - Document all required variables
   - Implement Infisical for secrets

### Phase 3: Optimization (2-3 days)

1. **Implement Proper HA for LiteLLM**:
   - Use services/litellm-proxy/docker-compose.yml as template
   - 3 instances + Nginx load balancer
   - Shared PostgreSQL and Redis

2. **Optimize Volume Usage**:
   - Standardize volume naming: `nyra_{service}_data`
   - Remove unused volumes
   - Document persistence requirements

3. **Add Comprehensive Health Checks**:
   - All services need health checks
   - Proper startup dependencies
   - Graceful shutdown handling

4. **Document Final Architecture**:
   - Architecture diagrams
   - Deployment procedures
   - Troubleshooting guide

### Phase 4: Cleanup (1-2 days)

1. **Archive Unused Files**:
   - Move old compose files to `_archive/docker-compose-historical-[date]`
   - Keep only active compose files
   - Document archival decisions

2. **Remove Redundant Configurations**:
   - Delete duplicate service definitions
   - Clean up obsolete environment variables
   - Remove unused volumes and networks

3. **Final Testing**:
   - Test orchestrator mode
   - Test worker mode
   - Test development mode
   - Test production deployment

4. **Create Deployment Documentation**:
   - README for each compose file
   - Quick start guides
   - Environment setup instructions

---

## Proposed Final Structure

```
Project-Nyra/
├── docker-compose.yml                 # Primary production stack
├── docker-compose.override.yml        # Local development overrides
├── docker-compose.prod.yml            # Production overrides
├── docker-compose.worker.yml          # Worker-specific services
├── docker-compose.test.yml            # Testing environment
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.full.yml    # Complete stack reference
│   │   ├── docker-compose.services.yml # Business services
│   │   └── docker-compose.monitoring.yml # Monitoring overlay
│   │
│   └── archive/                        # Archived compose files
│
├── services/                           # Service-specific compose files
│   ├── litellm-proxy/
│   │   └── docker-compose.yml         # LiteLLM HA setup
│   └── ...
│
└── configs/                            # Per-PC configurations
    ├── orchestrator/
    │   └── docker-compose.yml
    └── workers/
        ├── worker1.yml
        ├── worker2.yml
        └── worker3.yml
```

---

## Usage Examples

### Development

```bash
# Start complete development stack
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d

# With specific services
docker compose -f docker-compose.yml up nexus litellm letta mem0 -d
```

### Production

```bash
# Start production stack
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With worker profile
docker compose --profile worker up -d
```

### Orchestrator Mode

```bash
cd configs/orchestrator
docker compose up -d
```

### Worker Mode

```bash
cd configs/workers
docker compose -f worker1.yml up -d
```

---

## Key Findings Summary

| Category | Finding | Impact | Priority |
|----------|---------|--------|----------|
| Port Conflicts | 6379 Redis/FalkorDB | CRITICAL | P0 |
| Port Conflicts | 3000 Multiple services | HIGH | P1 |
| Service Duplication | PostgreSQL 12x | HIGH | P1 |
| Service Duplication | Redis 10x | MEDIUM | P2 |
| Service Duplication | Monitoring 9x | HIGH | P1 |
| Network Inconsistency | 8 different networks | MEDIUM | P2 |
| Volume Duplication | 85+ unique volumes | LOW | P3 |

---

## Next Steps

1. **Review this inventory** with the team
2. **Prioritize** which consolidation phases to tackle first
3. **Create backup** of current working configurations
4. **Begin Phase 1** immediate actions (port conflicts)
5. **Test incrementally** after each change
6. **Document** all changes and decisions

---

## Memory Storage

Analysis stored in Claude Flow memory:
- **Key**: `docker-compose-inventory-summary`
- **Namespace**: `consolidation`
- **Full JSON**: `docs/docker-compose-inventory.json`

Recommendations stored in:
- **Key**: `docker-consolidation-recommendations`
- **Namespace**: `consolidation`

---

**Analysis Complete**: 2026-01-18
**Total Analysis Time**: Comprehensive scan of 100+ compose files
**Confidence Level**: High (all files read and analyzed)
