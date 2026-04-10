# Docker Canonical Design - Project Nyra

**Version**: 1.0.0
**Date**: 2026-01-19
**Status**: Approved
**Author**: System Architecture Team

## Executive Summary

This document defines the canonical Docker structure for Project Nyra, consolidating 274+ Docker files into a unified, maintainable architecture supporting 40+ services across a 4-PC distributed cluster.

**Key Achievements**:
- Unified network topology with intelligent routing
- Modular compose structure for selective deployment
- Standardized Dockerfile organization by service category
- Clear migration path from legacy structure
- Service mesh integration via Nexus Router

---

## Table of Contents

1. [Canonical Directory Structure](#canonical-directory-structure)
2. [Network Architecture](#network-architecture)
3. [Service Routing Rules](#service-routing-rules)
4. [Dockerfile Organization](#dockerfile-organization)
5. [Compose File Architecture](#compose-file-architecture)
6. [Migration Strategy](#migration-strategy)
7. [Best Practices](#best-practices)
8. [Appendices](#appendices)

---

## Canonical Directory Structure

### Target Structure (Final State)

```
/infra/
  ├── docker/                          # Consolidated Docker infrastructure
  │   ├── build/                       # All Dockerfiles (organized by category)
  │   │   ├── apps/                    # Application Dockerfiles
  │   │   │   ├── mortgage-services/Dockerfile
  │   │   │   ├── nyra-admin/Dockerfile
  │   │   │   ├── ratehunter/Dockerfile
  │   │   │   └── webui/Dockerfile
  │   │   ├── services/                # Business logic service Dockerfiles
  │   │   │   ├── campaign-engine/Dockerfile
  │   │   │   ├── quote-api/Dockerfile
  │   │   │   ├── quote-engine/Dockerfile
  │   │   │   ├── websocket-hub/Dockerfile
  │   │   │   └── nyra-orchestrator/Dockerfile
  │   │   ├── mcp-servers/             # MCP server Dockerfiles
  │   │   │   ├── bitwarden/Dockerfile
  │   │   │   ├── dify/Dockerfile
  │   │   │   ├── docker-mcp/Dockerfile
  │   │   │   ├── dockerhub-mcp/Dockerfile
  │   │   │   ├── exa/Dockerfile
  │   │   │   ├── git-mcp/Dockerfile
  │   │   │   ├── infisical-mcp/Dockerfile
  │   │   │   ├── sequential-thinking-mcp/Dockerfile
  │   │   │   ├── twentycrm/Dockerfile
  │   │   │   └── vscode/Dockerfile
  │   │   ├── orchestration/           # AI orchestration Dockerfiles
  │   │   │   ├── archon/              # Archon OS variants
  │   │   │   │   ├── Dockerfile.agents
  │   │   │   │   ├── Dockerfile.archon-os
  │   │   │   │   ├── Dockerfile.mcp
  │   │   │   │   └── Dockerfile.server
  │   │   │   ├── archon-os/Dockerfile
  │   │   │   ├── ruv-swarm/Dockerfile
  │   │   │   └── serena/Dockerfile
  │   │   ├── base/                    # Base and utility Dockerfiles
  │   │   │   ├── ci/Dockerfile        # CI/CD base image
  │   │   │   ├── devcontainer/Dockerfile
  │   │   │   ├── Dockerfile.dev       # Development base
  │   │   │   └── Dockerfile.orchestrator
  │   │   ├── infisical/               # Secret management
  │   │   │   ├── Dockerfile.mcp
  │   │   │   └── Dockerfile.sync
  │   │   └── archive/                 # Deprecated Dockerfiles (timestamped)
  │   │       └── YYYY-MM-DD/
  │   ├── docker-compose/              # Modular compose files
  │   │   ├── docker-compose.yml       # Master file (includes all)
  │   │   ├── docker-compose.base.yml  # PostgreSQL, Redis
  │   │   ├── docker-compose.databases.yml  # FalkorDB, Qdrant, Neo4j
  │   │   ├── docker-compose.ai.yml    # Nexus, LiteLLM, Letta, Mem0
  │   │   ├── docker-compose.crm.yml   # TwentyCRM
  │   │   ├── docker-compose.workflow.yml  # n8n, Dify, Activepieces
  │   │   ├── docker-compose.observability.yml  # Monitoring stack
  │   │   ├── docker-compose.orchestrator.yml  # Nyra Orchestrator
  │   │   ├── docker-compose.business.yml  # Quote/Campaign engines
  │   │   ├── docker-compose.mcp-servers.yml  # MCP services
  │   │   ├── .env.example             # Template environment variables
  │   │   └── README.md                # Compose usage guide
  │   ├── init-scripts/                # Container initialization scripts
  │   │   ├── postgres/
  │   │   │   └── 01-init-databases.sql
  │   │   └── redis/
  │   ├── monitoring/                  # Monitoring configurations
  │   │   ├── prometheus.yml
  │   │   └── loki.yml
  │   ├── tests/                       # Docker stack tests
  │   │   ├── docker-compose.test.yml
  │   │   ├── health-check-tests.sh
  │   │   ├── integration-tests.sh
  │   │   └── security-tests.sh
  │   ├── docs/                        # Docker-specific documentation
  │   │   ├── QUICK-REFERENCE.md
  │   │   └── DOCKERFILE-REFERENCE.md
  │   ├── Makefile                     # Docker operations automation
  │   ├── .env                         # Environment variables (gitignored)
  │   └── .dockerignore                # Global dockerignore
  │
  ├── docker-compose/                  # Symlink to docker/docker-compose/
  ├── configs/                         # Service configurations
  │   ├── nexus/nexus.toml
  │   ├── litellm/config.yaml
  │   ├── prometheus/prometheus.yml
  │   ├── grafana/provisioning/
  │   ├── loki/loki-config.yaml
  │   ├── alertmanager/alertmanager.yml
  │   └── pgadmin/servers.json
  │
  └── scripts/                         # Infrastructure scripts
      ├── deploy-archon.ps1
      ├── health-check.sh
      └── validate-nexus-router.sh
```

### Key Design Principles

1. **Categorization by Function**: Dockerfiles organized by service category (apps, services, mcp-servers, orchestration)
2. **Separation of Concerns**: Build files separate from runtime configs separate from documentation
3. **Modular Compose**: Single-responsibility compose files that can be composed
4. **Minimal Root Clutter**: All Docker artifacts under `/infra/docker/`
5. **Archive Strategy**: Time-stamped archive folders for deprecated files

---

## Network Architecture

### Network Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
│   Claude Code, Web Browsers, API Clients, External Integrations     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ HTTPS/WSS
                                 │
                     ┌───────────▼───────────┐
                     │   NEXUS ROUTER        │
                     │   Port: 6000          │
                     │   Network: nyra-network│
                     │   Gateway & Service   │
                     │   Mesh Controller     │
                     └───────────┬───────────┘
                                 │
                                 │ Service Discovery
                                 │ Load Balancing
                                 │ Authentication
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        │                        │                        │
   ┌────▼────┐            ┌─────▼──────┐          ┌─────▼──────┐
   │ LiteLLM │            │   Letta    │          │    Mem0    │
   │ Port:   │            │ Port: 8283 │          │ Port: 4321 │
   │  4000   │            │            │          │            │
   └────┬────┘            └─────┬──────┘          └─────┬──────┘
        │                       │                        │
        │                       │                        │
        │         ┌─────────────┴────────────────────────┘
        │         │
        │         │
   ┌────▼─────────▼──────────────────────────────────────────┐
   │                   nyra-network                           │
   │                Bridge (172.28.0.0/16)                    │
   │                                                           │
   │  ┌──────────┐  ┌──────────┐  ┌────────────┐            │
   │  │PostgreSQL│  │  Redis   │  │  Qdrant    │            │
   │  │Port: 5432│  │Port: 6379│  │Port: 6333  │            │
   │  └──────────┘  └──────────┘  └────────────┘            │
   │                                                           │
   │  ┌──────────────┐  ┌────────────────┐  ┌──────────┐    │
   │  │ Quote Engine │  │Campaign Engine │  │TwentyCRM │    │
   │  │ Port: 8089   │  │  Port: 8020    │  │Port: 3000│    │
   │  └──────────────┘  └────────────────┘  └──────────┘    │
   │                                                           │
   │  ┌──────────────┐  ┌────────────────┐  ┌──────────┐    │
   │  │ Prometheus   │  │    Grafana     │  │   Loki   │    │
   │  │ Port: 9090   │  │  Port: 3003    │  │Port: 3100│    │
   │  └──────────────┘  └────────────────┘  └──────────┘    │
   └───────────────────────────────────────────────────────────┘
```

### Network Configuration

**Network Name**: `nyra-network`
**Driver**: bridge
**Subnet**: 172.28.0.0/16
**Gateway**: 172.28.0.1 (automatic)

**Network Definition** (in `docker-compose.base.yml`):
```yaml
networks:
  nyra-network:
    name: nyra-network
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Network Segments (Logical)

While all services are on the same physical bridge network, services are logically segmented by function:

1. **Core Infrastructure** (172.28.1.0/24)
   - PostgreSQL, Redis, MongoDB
   - Always-on, high-priority

2. **AI/MCP Layer** (172.28.2.0/24)
   - Nexus Router, LiteLLM, Letta, Mem0
   - Claude Flow, Archon, MCP servers

3. **Business Applications** (172.28.3.0/24)
   - Quote Engine, Campaign Engine
   - TwentyCRM, n8n, Dify

4. **Observability** (172.28.4.0/24)
   - Prometheus, Grafana, Loki
   - AlertManager, Langfuse

---

## Service Routing Rules

### Nexus Router Integration

**Nexus Router** serves as the unified gateway for:
- MCP server aggregation (22+ servers)
- LLM model routing (Claude, Gemini, OpenRouter)
- Authentication and authorization
- Service discovery and health checking
- Load balancing and failover

**Nexus Configuration**: `C:\Dev\Projects\Repos\Project-Nyra\configs\nexus\nexus.toml`

### Service Routing Matrix

| Service Type | Route Through Nexus? | Port (Internal) | Port (External) | Rationale |
|--------------|----------------------|-----------------|-----------------|-----------|
| **AI/LLM Services** | | | | |
| LiteLLM | Yes (proxied) | 4000 | 4000 | Unified LLM gateway |
| Letta | Yes (proxied) | 8283 | 8283 | Uses Nexus for LLM calls |
| Mem0 | Yes (proxied) | 4321 | 4321 | Uses Nexus for embeddings |
| Open-WebUI | Yes (proxied) | 8080 | 8080 | Chat interface via Nexus |
| Claude Flow | Yes (MCP) | 3000 | 3000 | MCP server orchestration |
| Archon OS | Yes (MCP) | 8000 | 8000 | AI OS framework |
| **MCP Servers** | | | | |
| All MCP servers | Yes (aggregated) | Various | Various | Nexus aggregates MCP tools |
| letta MCP | Yes (aggregated) | 8001 | 8001 | Knowledge graph memory |
| TwentyCRM MCP | Yes (aggregated) | 3000 | 3000 | CRM integration |
| **Databases** | | | | |
| PostgreSQL | Direct | 5432 | 5432 | Direct connections (performance) |
| Redis | Direct | 6379 | 6380 | Direct connections (performance) |
| Qdrant | Direct | 6333 | 6333 | Vector DB direct access |
| FalkorDB | Direct | 6379 | 6381 | Graph DB direct access |
| Neo4j | Direct | 7687/7474 | 7687/7474 | Graph DB direct access |
| **Business Apps** | | | | |
| Quote Engine | Hybrid | 8089 | 8089 | Direct for API, Nexus for AI |
| Campaign Engine | Hybrid | 8020 | 8020 | Direct for API, Nexus for AI |
| TwentyCRM | Direct | 3000 | 3000 | Standalone CRM (UI) |
| **Workflow Tools** | | | | |
| n8n | Hybrid | 5678 | 5678 | Direct UI, AI via Nexus |
| Dify | Hybrid | 3001 | 3001/3002 | Direct UI, LLM via Nexus |
| Activepieces | Hybrid | 8082 | 8082 | Direct UI, AI via Nexus |
| **Monitoring** | | | | |
| Prometheus | Direct | 9090 | 9090 | Metrics collection |
| Grafana | Direct | 3003 | 3003 | Visualization dashboard |
| Loki | Direct | 3100 | 3100 | Log aggregation |
| Langfuse | Direct | 3004 | 3004 | LLM observability |

**Legend**:
- **Yes**: All traffic routed through Nexus Router
- **Direct**: Direct connections, no Nexus routing
- **Hybrid**: UI/API direct, AI/LLM calls via Nexus

### Nexus Service Discovery

Services auto-register with Nexus via Docker labels:

```yaml
labels:
  - "nyra.service.name=service-name"
  - "nyra.service.type=mcp-server"
  - "nyra.mcp.enabled=true"
  - "nyra.mcp.transport=http"
  - "nyra.mcp.port=8000"
  - "nyra.mcp.keywords=keyword1,keyword2"
  - "nyra.mcp.priority=1"
  - "nyra.policy=borrower_minimal_tools"
```

**Required Labels**:
- `nyra.service.name`: Unique service identifier
- `nyra.service.type`: Service category (mcp-server, ai-service, database, etc.)
- `nyra.mcp.enabled`: Enable MCP integration (true/false)

**Optional Labels**:
- `nyra.mcp.transport`: http, stdio, websocket
- `nyra.mcp.port`: Internal service port
- `nyra.mcp.keywords`: Comma-separated search keywords
- `nyra.mcp.priority`: Routing priority (0-10, higher = more priority)
- `nyra.policy`: Authorization policy name

---

## Migration Strategy

### Risk Classification

#### Low-Risk Moves (Week 1)

**Characteristics**: No service downtime, easy rollback, minimal dependencies

**Items**:
1. Archive old root-level Docker files (already complete)
2. Consolidate scattered Dockerfiles to archive
3. Documentation updates

**Commands**:
```bash
# Already archived
ls _archive/deprecated-docker-files-2026-01-19/
# No additional moves needed (low-risk complete)
```

#### Medium-Risk Moves (Week 2)

**Characteristics**: Minor service interruption possible, requires rebuild, moderate dependencies

**Items**:
1. Standardize Dockerfile naming
2. Consolidate duplicate service Dockerfiles
3. Update CI/CD pipelines

**Commands**:
```bash
# Update compose file references
find /infra/docker-compose -name "*.yml" -exec sed -i 's|dockerfile: .*|dockerfile: infra/docker/build/...|g' {} \;

# Rebuild affected services
docker compose -f docker-compose.ai.yml build --no-cache
```

**Rollback Plan**: Keep old Dockerfiles in archive, revert compose file changes

#### High-Risk Moves (Week 3)

**Characteristics**: Service downtime required, complex dependencies, production impact

**Pre-Migration Checklist**:
```bash
# 1. Backup all databases
docker exec nyra-postgres pg_dumpall -U ${POSTGRES_USER} > backup_$(date +%Y%m%d).sql

# 2. Export volumes
docker run --rm -v nyra_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_volume_$(date +%Y%m%d).tar.gz /data

# 3. Document current state
docker compose ps > pre_migration_services.txt
docker network ls > pre_migration_networks.txt
docker volume ls > pre_migration_volumes.txt
```

**Migration Commands**:
```bash
# 1. Stop all services
docker compose -f /infra/docker-compose/docker-compose.yml down

# 2. Rebuild all images with new structure
docker compose -f /infra/docker-compose/docker-compose.yml build --no-cache

# 3. Start services in order
docker compose -f /infra/docker-compose/docker-compose.base.yml up -d
docker compose -f /infra/docker-compose/docker-compose.ai.yml up -d
docker compose -f /infra/docker-compose/docker-compose.yml up -d

# 4. Verify health
docker compose ps
docker compose logs --tail=50
```

### Migration Timeline

| Week | Risk Level | Activities | Downtime |
|------|------------|------------|----------|
| Week 1 | Low | Archive old files, update docs | 0 minutes |
| Week 2 | Medium | Standardize naming, rebuild images | 5-10 minutes |
| Week 3 | High | Production migration, full restart | 15-30 minutes |

---

## Best Practices

### 1. Dockerfile Best Practices

#### Security
- Run as non-root user
- Scan for vulnerabilities
- Use minimal base images
- Do not include secrets in images

#### Performance
- Multi-stage builds (reduce final image size)
- Layer caching (place frequently changing code last)
- Combine RUN commands (reduce layers)

#### Maintainability
- Pin base image versions (node:20.11-alpine not node:latest)
- Document each stage (clear comments)
- Use .dockerignore (faster builds, smaller context)
- Health checks (every service)

### 2. Compose File Best Practices

#### Organization
- One concern per file (base, ai, monitoring, etc.)
- Include file hierarchy (master includes modules)
- Consistent naming (nyra- prefix for containers, nyra_ for volumes)

#### Configuration
- Environment variables (no hardcoded values)
- Named volumes (easier management)
- Health checks (proper dependencies)
- Resource limits (prevent resource exhaustion)
- Restart policies (unless-stopped for production)

#### Networking
- Single network (simplifies service discovery)
- Service names for internal communication (http://postgres:5432)
- Explicit port mappings (document exposed ports)

---

## Appendices

### Appendix A: Complete Service List

| Service | Category | Port | Routes via Nexus? |
|---------|----------|------|-------------------|
| PostgreSQL | Database | 5432 | No |
| Redis | Database | 6379 | No |
| Nexus Router | Gateway | 6000 | N/A (is gateway) |
| LiteLLM | AI | 4000 | Yes |
| Letta | AI | 8283 | Yes |
| Mem0 | AI | 4321 | Yes |
| Claude Flow | Orchestration | 3000 | Yes (MCP) |
| Archon OS | Orchestration | 8000 | Yes (MCP) |
| Quote Engine | Business | 8089 | Hybrid |
| Campaign Engine | Business | 8020 | Hybrid |
| TwentyCRM | CRM | 3000 | Direct (UI), MCP |
| Prometheus | Monitoring | 9090 | No |
| Grafana | Monitoring | 3003 | No |

### Appendix B: Port Map

| Port | Service | Protocol | Exposed to Host? |
|------|---------|----------|------------------|
| 5432 | PostgreSQL | TCP | Yes |
| 6379 | Redis | TCP | Yes (6380) |
| 6000 | Nexus Router | HTTP | Yes |
| 4000 | LiteLLM | HTTP | Yes |
| 8283 | Letta | HTTP | Yes |
| 4321 | Mem0 | HTTP | Yes |
| 3000 | Claude Flow | HTTP | Yes |
| 8000 | Archon OS | HTTP | Yes |
| 9090 | Prometheus | HTTP | Yes |
| 3003 | Grafana | HTTP | Yes |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-19 | System Architecture Team | Initial canonical design |

---

**Review Schedule**: Quarterly
**Next Review**: 2026-04-19
**Maintained By**: Infrastructure Team
**Questions?**: See `/infra/docs/TROUBLESHOOTING.md`
