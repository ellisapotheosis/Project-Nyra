# Containerization Dependencies Research Report
## Claude-Flow Full Feature Deployment

**Research Date:** 2026-01-18
**Researcher:** Research Agent (Claude Code)
**Scope:** Complete containerization dependency analysis for Project Nyra

---

## Executive Summary

This comprehensive research identifies **25 containerized services**, **59 Dockerfile references**, and **17 docker-compose configuration files** required for full claude-flow deployment across the Project Nyra infrastructure.

### Key Findings

| Metric | Value |
|--------|-------|
| Total Containers | 25+ |
| Dockerfiles Found | 59 |
| Docker Compose Files | 17 |
| MCP Servers | 6 |
| Databases | 4 |
| Deployment Topologies | 5 |
| Observability Services | 7 |

---

## 1. Database Layer Containers

### PostgreSQL 16-alpine
- **Purpose:** Primary data store for Claude Flow, Archon OS, Letta, and orchestration
- **Ports:** 5432 (main), 5433 (alternative)
- **Databases:** nyra_db, letta_db, twenty_db, dify_db, n8n_db, mcp_production
- **Resource Limits:** 2.0 CPUs / 4GB memory
- **Initialization:** Scripts in `./scripts/postgres-init/` execute on first start
- **Features:** Multi-database support, automatic initialization

### Redis 7-alpine
- **Purpose:** Session storage, caching, queues, multi-service isolation
- **Ports:** 6379 (default), 6380 (FalkorDB), 6381 (additional instances)
- **Features:** RDB persistence, AOF (Append-Only File), maxmemory policies
- **Resource Limits:** 1.0 CPUs / 2GB memory

### FalkorDB (Redis-Compatible)
- **Type:** Temporal knowledge graph database
- **Port:** 6380
- **Purpose:** Relationship mapping and graph queries
- **Resource Limits:** 2.0 CPUs / 4GB memory
- **Features:** Graph algorithms, temporal indexing

### Qdrant
- **Type:** Vector database
- **Ports:** 6333 (REST API), 6334 (GRPC)
- **Purpose:** Embeddings storage and semantic search
- **Resource Limits:** 2.0 CPUs / 4GB memory
- **Performance:** HNSW indexing provides 150x-12,500x faster search
- **Integration:** Critical for vector search and similarity matching

---

## 2. Orchestration Layer

### Claude Flow
- **Base Image:** node:20-alpine
- **Port:** 9000 (configurable)
- **Command:** `npm install -g pnpm && pnpm install && pnpm start`
- **Key Dependency:** @claude-flow/cli@3.0.0-alpha.104
- **Volumes:** Data directory, Docker socket for container management
- **Resource Limits:** 2.0 CPUs / 2GB memory
- **Health Check:** HTTP endpoint at `/health`

### Archon OS (Agent Operating System)
- **Base Image:** node:20-alpine
- **Ports:** 9001 (main), 9002 (MCP)
- **Purpose:** Agent task management and coordination
- **Configuration:**
  - Topology: hierarchical
  - Max depth: 5
  - Parallel branches: 10
- **Resource Limits:** 2.0 CPUs / 2GB memory

### Nexus Router
- **Base Image:** node:20-alpine (multi-stage build)
- **Ports:** 8000 (API), 4001 (MCP)
- **Purpose:** Intelligent LLM request routing with local GPU support
- **Features:**
  - Cost-optimized routing strategy
  - Local GPU worker support (RTX 5090, 3090, 3060)
  - Cloud API fallback (Anthropic, OpenRouter)
- **Build Type:** Multi-stage (builder → production)
- **Resource Limits:** 1.0 CPU / 1GB memory

---

## 3. MCP Servers (Critical for Full Deployment)

### RuV Swarm MCP
- **Base Image:** node:20-alpine
- **Port:** 8092
- **Command:** `npx @rUv/ruv-swarm@latest mcp start`
- **Purpose:** Distributed swarm coordination and agent management
- **Volumes:** `/app/data/{swarms,agents,tasks,metrics}`
- **Health Check:** RuV Swarm CLI health endpoint

### Claude Flow MCP
- **Base Image:** node:20-alpine
- **Purpose:** Multi-agent workflow orchestration via MCP interface
- **Volumes:** Memory data, session data, .claude-flow config
- **Resource Limits:** 2.0 CPUs / 2GB memory

### Exa Search MCP
- **Base Image:** node:20-alpine
- **Port:** 8007
- **Command:** `npx @modelcontextprotocol/server-exa start --port 8007`
- **Purpose:** AI-powered search and research capability
- **Dependencies:** Redis for caching
- **Resource Limits:** 1.0 CPU / 1GB memory

### Archon MCP
- **Port:** 8051
- **Purpose:** Knowledge base cache and agent memory management
- **Dependencies:** PostgreSQL, Redis
- **Features:** Knowledge base indexing, fast retrieval

### Mem0 MCP
- **Base Image:** python:3.11-slim
- **Port:** 8081
- **Purpose:** Memory management service via MCP

### Gemini MCP
- **Base Image:** python
- **Purpose:** Google Gemini API integration
- **Requires:** GOOGLE_GEMINI_API_KEY environment variable

---

## 4. AI Services

### Letta
- **Base Image:** letta/letta:latest
- **Ports:** 8283, 8284
- **Purpose:** OS-like agent memory management system
- **Database:** letta_db (PostgreSQL)
- **Dependencies:** PostgreSQL, Nexus Router
- **Resource Limits:** 1.0 CPU / 2GB memory

### Open-WebUI
- **Base Image:** ghcr.io/open-webui/open-webui:main
- **Port:** 3210
- **Purpose:** Primary development and admin interface
- **Features:**
  - RAG (Retrieval Augmented Generation)
  - Admin dashboard
  - User management
- **Database:** nyra_db (PostgreSQL)
- **Resource Limits:** 2.0 CPUs / 2GB memory

### LobeChat
- **Base Image:** lobehub/lobe-chat:latest
- **Port:** 3211
- **Purpose:** Alternative conversational interface
- **Features:**
  - Authentication support
  - Conversation history
  - Multi-session management
- **Resource Limits:** 1.0 CPU / 1GB memory

---

## 5. Workflow Automation

### n8n
- **Base Image:** n8nio/n8n:latest
- **Port:** 5678
- **Database:** n8n_db (PostgreSQL)
- **Purpose:** Visual workflow automation and integration platform
- **Resource Limits:** 1.0 CPU / 2GB memory

### Dify
- **Database:** dify_db (PostgreSQL)
- **Purpose:** Low-code AI platform with model management
- **Features:** Model platform, workflow orchestration

---

## 6. LLM Proxy Service

### LiteLLM
- **Base Image:** python:3.11-slim
- **Port:** 4000
- **Package:** litellm[proxy]==1.54.0
- **Purpose:** Unified LLM model access with cost optimization
- **Configuration:** config.yaml-based provider setup
- **Command:** `litellm --config /app/config/config.yaml --port 4000 --num_workers 4`
- **Workers:** 4 (configurable)

---

## 7. Vector & Embedding Services

### RuVector Search Service
- **Location:** `services/ruvector-search`
- **Type:** Node.js-based service
- **Key Dependency:** @xenova/transformers@2.9.0 (Transformers.js)
  - WASM-based ML inference
  - ONNX model support
  - No GPU required for inference

**Complete Dependencies:**
```
@qdrant/js-client-rest@1.9.0    - Qdrant client
openai@4.20.1                    - OpenAI embeddings API
cohere-ai@7.7.0                 - Cohere embeddings API
bull@4.12.0                      - Job queue for async tasks
redis@4.6.11                     - Caching layer
```

**Features:**
- Distributed vector search
- Hybrid search (semantic + keyword)
- Semantic similarity matching
- HNSW indexing (150x-12,500x faster)

---

## 8. Observability & Monitoring Stack

### Prometheus
- **Base Image:** prom/prometheus:latest
- **Port:** 9090
- **Purpose:** Metrics collection and time-series database
- **Resource Limits:** 1.0 CPU / 2GB memory

### Grafana
- **Base Image:** grafana/grafana:latest
- **Port:** 3000
- **Purpose:** Dashboard visualization and alerting
- **Plugins:** grafana-piechart-panel, grafana-clock-panel
- **Resource Limits:** 1.0 CPU / 1GB memory

### Loki
- **Base Image:** grafana/loki:latest
- **Port:** 3100
- **Purpose:** Log aggregation and storage
- **Resource Limits:** 1.0 CPU / 2GB memory

### Promtail
- **Base Image:** grafana/promtail:latest
- **Purpose:** Log shipping to Loki
- **Resource Limits:** 0.5 CPU / 512MB memory

### Node Exporter
- **Base Image:** prom/node-exporter:latest
- **Port:** 9100
- **Purpose:** System metrics (CPU, memory, disk, network)
- **Resource Limits:** 0.25 CPU / 128MB memory

### cAdvisor
- **Base Image:** gcr.io/cadvisor/cadvisor:latest
- **Port:** 8080
- **Purpose:** Container resource metrics
- **Resource Limits:** 0.5 CPU / 256MB memory

### Alertmanager
- **Base Image:** prom/alertmanager:latest
- **Port:** 9093
- **Purpose:** Alert routing and notifications
- **Resource Limits:** 0.5 CPU / 512MB memory

---

## 9. Custom Services

### Quote Engine
- **Build Context:** `../services/quote-engine`
- **Port:** 9010
- **Purpose:** Mortgage quote processing engine

### Campaign Engine
- **Build Context:** `../services/campaign-engine`
- **Port:** 9020
- **Purpose:** Campaign orchestration and management

### Quote API
- **Build Context:** `../services/quote-api`
- **Port:** 8089
- **Purpose:** REST API for quote requests

### WebSocket Hub
- **Dockerfile:** `../services/websocket-hub/Dockerfile`
- **Purpose:** Real-time bidirectional communication

### Mem0 REST API
- **Base Image:** python:3.11-slim
- **Port:** 8003
- **Purpose:** Memory service REST interface
- **Storage:** ChromaDB with semantic embeddings

---

## 10. Core Dependencies

### Root package.json
```json
{
  "@claude-flow/cli": "3.0.0-alpha.104",
  "agentic-jujutsu": "2.3.6"
}
```

### Development Framework
- **turbo:** 2.7.5 (monorepo build system)
- **pnpm:** 10.27.0 (fast package manager)
- **typescript:** 5.7.0
- **node:** >=20.0.0 (required)

### Testing Tools
- **jest:** 30.2.0
- **playwright:** 1.40.0 (E2E testing)
- **ts-jest:** 29.4.6

---

## 11. Services Not Yet Containerized (Action Items)

### Agent Booster
- **Status:** Not containerized
- **Purpose:** Tier-1 handler for simple code transforms (var→const, add-types, etc)
- **Recommendation:** Create container or keep as CLI tool
- **Priority:** Medium

### SONA (Self-Optimizing Neural Architecture)
- **Status:** Embedded in Claude Flow/Archon (not standalone)
- **Features:** <0.05ms adaptation, MoE (Mixture of Experts) routing
- **Current Integration:** Within orchestration layer

### agentic-flow MCP
- **Status:** Referenced but not containerized
- **Purpose:** Advanced agentic-flow integration
- **Action Required:** Create dedicated MCP container
- **Priority:** High

### AgentDB
- **Status:** No dedicated container (referenced in documentation)
- **Purpose:** Advanced vector database with 150x-12,500x search improvements
- **Features:** HNSW indexing, hybrid memory backend
- **Action Required:** Create AgentDB container service
- **Priority:** High

### Epic SDK
- **Status:** Not found in current containers
- **Purpose:** Requires investigation
- **Action Required:** Research requirements and create container if needed
- **Priority:** Low

---

## 12. Networking Architecture

### Networks Defined
- **nyra-network** (172.28.0.0/16): Main network
- **nyra-mcp-network** (172.28.0.0/16): MCP servers
- **nyra-core**: Core database services
- **observability**: Monitoring stack
- **databases**: Database layer

### Communication Pattern
- Service-to-service communication via DNS names
- External access: Selective port exposure only
- Network isolation per domain

---

## 13. Volume Management Strategy

### Database Volumes
- `postgres_data`: PostgreSQL persistent storage
- `redis_data`: Redis RDB and AOF files
- `falkordb_data`: FalkorDB graph data
- `qdrant_data`: Qdrant vector indexes

### Application Volumes
- `claude_flow_data`: State and memory
- `archon_data`: Task state and logs
- `letta_data`: Agent memories
- `nexus_router_data`: Cache and routing state

### Observability Volumes
- `prometheus_data`: Time-series metrics
- `grafana_data`: Dashboard configurations
- `loki_data`: Log storage

---

## 14. Resource Allocation Strategy

### Resource Limits by Category
| Category | CPUs | Memory | Notes |
|----------|------|--------|-------|
| Orchestrators | 2.0 | 2GB | Core services |
| Services | 1.0 | 1GB | Standard services |
| Utilities | 0.25-0.5 | 128MB-512MB | Monitoring, exporters |
| Databases | 1.0-2.0 | 2GB-4GB | Data layer |

### Reservation Strategy
- Reserve 50-75% of limits for guaranteed availability
- Allows container burst usage up to limit
- Prevents resource starvation

---

## 15. Docker Compose Files Inventory

### Main Orchestration Files
1. **docker-compose.full.yml** - Complete full stack deployment
2. **docker-compose.orchestration.yml** - Core orchestration only
3. **docker-compose.yml** - Base configuration with legacy support
4. **docker-compose.services.yml** - Internal Nyra services overlay
5. **docker-compose.mcp.yml** - MCP server stack

### Environment-Specific
- **docker-compose.dev.yml** - Development setup with hot reload
- **docker-compose.prod.yml** - Production hardened configuration
- **docker-compose.dev-minimal.yml** - Minimal local development

### Specialized Configurations
- **docker-compose.monitoring.yml** - Observability stack
- **docker-compose.observability.yml** - Alternative observability
- **docker-compose.local.yml** - Local development
- **docker-compose.mcp-dev.yml** - MCP development
- **docker-compose.dual-orchestrator.yml** - Dual orchestration mode
- **docker-compose.addons.yml** - Optional add-ons
- **docker-compose.graphiti.yml** - Graph visualization
- **docker-compose.ui.yml** - UI services
- **docker-compose.voice.yml** - Voice services

### Worker-Specific (GPU Nodes)
- **docker-compose.worker.yml** - Generic worker template
- **docker-compose.worker-rtx3060.yml** - RTX 3060 GPU node
- **docker-compose.worker-rtx3090ti.yml** - RTX 3090Ti GPU node
- **docker-compose.worker-rtx5090.yml** - RTX 5090 GPU node

---

## 16. Deployment Topologies

### Full Stack (docker-compose.full.yml)
- All services in single environment
- Use case: Development, testing, small deployments
- Includes: Databases, orchestration, services, observability

### Orchestrator Only (docker-compose.orchestration.yml)
- Core orchestration + databases
- Use case: Main orchestrator node (PC1)
- Includes: Claude Flow, Archon, Nexus Router, databases

### Worker Node (docker-compose.worker-*.yml)
- GPU worker with local services
- Use case: Distributed GPU inference (PC2-4)
- Variants: RTX-3060, RTX-3090Ti, RTX-5090

### Development (docker-compose.dev-minimal.yml)
- Minimal local setup
- Use case: Local development
- Includes: Essentials only

### Production (docker-compose.prod.yml)
- Hardened configuration
- Use case: Production deployment
- Includes: Monitoring, security controls, resilience

---

## 17. Security Practices

### Non-Root Execution
- All containers run as dedicated, non-root users
- Users: nodejs, mcp, nyra, backup, etc.
- Proper file ownership and permissions

### Health Checks
- Every service includes health check
- HTTP endpoints, CLI commands, or database probes
- Automatic restart on failure

### Resource Limits
- CPU and memory limits enforced per container
- Prevents resource exhaustion
- Enables fair resource sharing

### Network Isolation
- Services isolated per network namespace
- Only necessary ports exposed
- Internal service-to-service via DNS

### Secret Management
- Infisical integration for credential management
- Environment variable configuration
- No hardcoded secrets in containers

### Image Optimization
- Multi-stage builds to minimize attack surface
- Alpine base images where possible
- Regular security updates

---

## 18. Initialization & Bootstrap

### PostgreSQL Initialization
- **Script Location:** `./scripts/postgres-init/`
- **Databases Created:**
  - nyra_db (default application database)
  - letta_db (Letta agent memory)
  - twenty_db (CRM database)
  - dify_db (AI platform database)
  - n8n_db (Workflow database)
  - mcp_production (MCP services database)
- **Timing:** Executes automatically on first container start via entrypoint

### Environment Configuration
- **.env File:** Root directory for secrets and configuration
- **Secret Management:** Infisical CLI integration available
- **Environment Overlays:** Separate compose files per environment

---

## 19. Key Findings & Recommendations

### Successfully Containerized
- Core databases (PostgreSQL, Redis, FalkorDB, Qdrant)
- Orchestration services (Claude Flow, Archon, Nexus Router)
- 6 MCP servers (RuV Swarm, Claude Flow, Exa, Archon, Mem0, Gemini)
- AI services (Letta, Open-WebUI, LobeChat)
- Workflow automation (n8n, Dify)
- LLM proxy (LiteLLM)
- Observability stack (Prometheus, Grafana, Loki, etc.)

### Requires Action (High Priority)
1. **agentic-flow MCP Container** - Critical for full integration
2. **AgentDB Container** - Essential for advanced memory features
3. **Transformers.js/ONNX Runtime** - Explicit containerization for performance
4. **Agent Booster Service** - Tier-1 optimization handler

### Documentation Gaps
- SONA integration details
- Agent Booster operational mode
- Epic SDK requirements
- Distributed deployment guidelines

---

## 20. File Locations Summary

### Research Output Files
- **Detailed JSON:** `.claude-flow/containerization-findings.json`
- **This Report:** `docs/CONTAINERIZATION-RESEARCH-REPORT.md`

### Key Configuration Files
- **Main Compose (Full Stack):** `infra/docker/docker-compose.full.yml`
- **Orchestration:** `infra/docker/docker-compose.orchestration.yml`
- **MCP Servers:** `infra/docker/docker-compose.mcp.yml`
- **Services:** `infra/docker/docker-compose.services.yml`

### Dockerfiles (Selected Key Files)
- **Nexus Router:** `services/nexus-router/Dockerfile`
- **RuV Swarm:** `infra/ruv-swarm/Dockerfile`
- **LiteLLM:** `services/litellm-proxy/Dockerfile`
- **Mem0 REST:** `services/mem0-rest-api/Dockerfile`

---

## Conclusion

This research provides comprehensive documentation of all containerization dependencies for claude-flow full feature deployment. The infrastructure includes 25+ containerized services across databases, orchestration, AI services, workflow automation, and observability.

**Critical next steps:**
1. Containerize missing agentic-flow and AgentDB services (High Priority)
2. Document SONA and Agent Booster integration (Medium Priority)
3. Create distributed deployment guidelines (Medium Priority)
4. Implement container performance monitoring (Low Priority)

All findings have been stored in structured JSON format at `.claude-flow/containerization-findings.json` for integration with Claude Flow memory systems.

---

**Report Generated:** 2026-01-18
**Status:** Research Complete
**Output Format:** Markdown + JSON
