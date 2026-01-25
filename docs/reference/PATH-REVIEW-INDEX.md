# PATH-REVIEW-INDEX

**Generated:** January 25, 2026 05:34 UTC  
**Purpose:** Master catalog of all paths, configurations, scripts, and environment variables in Project Nyra  
**Status:** Living document - updated during consolidation

---

## 📋 Table of Contents

1. [Repository Structure](#repository-structure)
2. [Docker Infrastructure](#docker-infrastructure)
3. [Bootstrap Scripts](#bootstrap-scripts)
4. [Configuration Files](#configuration-files)
5. [Environment Variables](#environment-variables)
6. [MCP Servers](#mcp-servers)
7. [Services & Applications](#services--applications)
8. [Documentation](#documentation)
9. [Review Status Log](#review-status-log)

---

## 📁 Repository Structure

### Root Level Files
- `README.md` - [✅ REVIEWED] Main project README
- `TASK-LISTS.md` - [✅ REVIEWED] User vs AI task separation
- `PATH-REVIEW-INDEX.md` - [🔄 CURRENT] This file
- `package.json` - [⏳ NEEDS REVIEW] Root package dependencies
- `.gitignore` - [⏳ NEEDS REVIEW] Git ignore patterns
- `.dockerignore` - [⏳ NEEDS REVIEW] Docker ignore patterns

### Primary Directories (Canonical Structure Post-Consolidation)
```
C:\Dev\Projects\Repos\Project-Nyra\
├── apps/                           [✅ REVIEWED] Frontend applications
├── services/                       [✅ REVIEWED] Backend microservices
├── infra/                          [🔄 CONSOLIDATING] Infrastructure (Docker, configs, scripts)
│   ├── docker/                     [🔄 CONSOLIDATING] Docker configurations
│   ├── configs/                    [🔄 CONSOLIDATING] All configuration files
│   ├── scripts/                    [🔄 CONSOLIDATING] Deployment & utility scripts
│   ├── pc-orchestrator/            [✅ CREATED] Orchestrator PC stack
│   └── workers/                    [✅ CREATED] Worker PC stacks
├── bootstrap/                      [🔄 CONSOLIDATING] Bootstrap scripts & installers
├── docs/                           [⏳ NEEDS REVIEW] Documentation
├── configs/                        [🔄 MOVING TO infra/configs/]
├── orchestration/                  [🔄 MOVING TO infra/docker/services/]
└── vendor/                         [📝 TO CREATE] Third-party source code
```

---

## 🐳 Docker Infrastructure

### Current Docker File Locations (Before Consolidation)

#### Root Level (TO BE REMOVED)
- `/docker-compose.yml` - [🚫 DUPLICATE] Root compose (consolidating)

#### Infra Directory
**`/infra/docker-compose/`** [🔄 CONSOLIDATING]
- `docker-compose.mcp-servers.yml` - [⏳ REVIEW] MCP servers
- `docker-compose.memory.yml` - [⏳ REVIEW] Memory systems
- `.env.example` - [⏳ REVIEW] Environment template

**`/infra/docker/`** [🔄 CONSOLIDATING]
- `base/docker-compose.core.yml` - [⏳ REVIEW] Core services
- `base/docker-compose.mcp.yml` - [⏳ REVIEW] MCP base
- `apps/docker-compose.apps.yml` - [⏳ REVIEW] Application services
- `services/*/Dockerfile` - [⏳ REVIEW] Service-specific images

**`/infra/pc-orchestrator/`** [✅ CANONICAL]
- `docker-compose.yml` - [✅ CREATED] Master orchestrator stack

**`/infra/workers/`** [✅ CANONICAL]
- `worker-rtx5090/docker-compose.yml` - [✅ CREATED]
- `worker-rtx3090ti/docker-compose.yml` - [✅ CREATED]
- `worker-rtx3060/docker-compose.yml` - [✅ CREATED]

#### Bootstrap Directory
**`/bootstrap/orchestrator-mini/docker/`** [⏳ NEEDS REVIEW]
- `docker-compose.yml` - [🚫 DUPLICATE?]

**`/bootstrap/worker-rtx*/docker/ollama/`** [⏳ NEEDS REVIEW]
- `docker-compose.yml` (each worker) - [🚫 DUPLICATE?]

#### Orchestration (TO BE RELOCATED)
**`/orchestration/claude-flow/`** [🔄 MOVING]
- `Dockerfile` - [⏳ REVIEW] Claude Flow container
- Destination: `/infra/docker/services/claude-flow/`

**`/orchestration/serena/serena/`** [🔄 MOVING]
- `compose.yaml` - [⏳ REVIEW] Serena MCP server
- Destination: `/infra/docker/services/serena/`

### Canonical Docker Structure (Target)
```
/infra/docker/
├── base/
│   ├── Dockerfile.base           # Base image for all services
│   └── docker-compose.core.yml   # Core infrastructure (PostgreSQL, Redis, Neo4j)
├── services/                     # One folder per service
│   ├── claude-flow/
│   │   ├── Dockerfile
│   │   └── config/
│   ├── serena/
│   │   ├── Dockerfile
│   │   └── config/
│   ├── archon/
│   │   ├── Dockerfile
│   │   └── config/
│   ├── nexus-router/
│   │   ├── Dockerfile
│   │   └── nexus.toml
│   └── [other MCP servers...]
└── configs/
    └── shared/                   # Shared configs across services
```

---

## 🔧 Bootstrap Scripts

### Current Locations (Scattered)

**Root Level** [🚫 TO CLEAN]
- `bootstrap.ps1` - [⏳ REVIEW] Root bootstrap script
- `setup.ps1` - [⏳ REVIEW] Setup script
- Various `.ps1` files - [⏳ REVIEW] Scattered scripts

**`/bootstrap/`** [🔄 CONSOLIDATING]
- `orchestrator-mini/` - [⏳ REVIEW] Orchestrator setup
- `worker-rtx5090/` - [⏳ REVIEW] Worker setup
- `worker-rtx3090ti/` - [⏳ REVIEW] Worker setup
- `worker-rtx3060/` - [⏳ REVIEW] Worker setup
- `mcp-servers/` - [⏳ REVIEW] MCP server configs
- `configs/` - [⏳ REVIEW] Bootstrap configs

**`/scripts/`** [🔄 CONSOLIDATING]
- Various utility scripts - [⏳ REVIEW]

### Canonical Bootstrap Structure (Target)
```
/bootstrap/
├── gui-installer/                # React GUI (single entrypoint)
│   ├── src/
│   └── package.json
├── orchestrator/
│   ├── bootstrap-orchestrator.ps1
│   ├── install-docker.ps1
│   ├── setup-networking.ps1
│   └── deploy-services.ps1
├── workers/
│   ├── bootstrap-worker.ps1      # Accepts --worker-id parameter
│   ├── install-nvidia.ps1
│   ├── setup-ollama.ps1
│   └── register-with-orchestrator.ps1
└── common/
    ├── utils.ps1                 # Shared functions
    └── config-loader.ps1
```

---

## ⚙️ Configuration Files

### Nexus Router Configurations

**Current Locations:** [🔄 CONSOLIDATING]
- `/configs/nexus/nexus.toml` - [⏳ REVIEW] Most comprehensive (250 lines)
- `/infra/configs/nexus/nexus.toml` - [⏳ REVIEW] Minimal (12 lines)
- `/infra/nexus/nexus.toml` - [⏳ REVIEW] Basic (46 lines)
- `/infra/nexus/nexus.yaml` - [⏳ REVIEW] YAML version
- Archives in `/ToDo/` and `/_archive/` - [🚫 IGNORE]

**Canonical Location:** [✅ TARGET]
- `/infra/configs/nexus/nexus.toml` - Master configuration
- `/infra/configs/nexus/nexus.example.toml` - Template with placeholders

### Claude Flow Configurations

**Current Location:**
- `/orchestration/claude-flow/` - [🔄 MOVING]
  - `.claude/settings.json`
  - `.mcp.json`
  - `claude-flow.cmd`

**Target Location:**
- `/infra/docker/services/claude-flow/config/`

### Other Configurations
- Environment variables: [🔄 CONSOLIDATING] See Environment Variables section
- MCP server configs: [🔄 CONSOLIDATING] See MCP Servers section

---

## 🌍 Environment Variables

### Current .env Files

**`/infra/.env`** [⏳ NEEDS AUDIT]
- Actual secrets (NOT committed)
- Should reference Infisical for all sensitive values

**`/infra/.env.example`** [🔄 TO UPDATE]
- Template with placeholders
- Needs consolidation from all sources

**`/infra/docker-compose/.env.example`** [🚫 DUPLICATE]
- Merge into master .env.example

### Required Environment Variables by Category

#### Infrastructure
```bash
# Docker & Networking
DOCKER_HOST=unix:///var/run/docker.sock
COMPOSE_PROJECT_NAME=project-nyra

# Tailscale
TAILSCALE_AUTH_KEY=tskey-auth-...          # [⚠️ NEEDS INFISICAL]

# Cloudflare
CLOUDFLARE_API_TOKEN=...                   # [⚠️ NEEDS INFISICAL]
CF_ACCOUNT_ID=...                          # [⚠️ NEEDS INFISICAL]
CF_ACCESS_APP_ID=...                       # [⚠️ NEEDS INFISICAL]
CF_ACCESS_CLIENT_ID=...                    # [⚠️ NEEDS INFISICAL]
CF_ACCESS_CLIENT_SECRET=...                # [⚠️ NEEDS INFISICAL]
```

#### LLM Providers
```bash
# Anthropic
ANTHROPIC_API_KEY=sk-ant-...               # [✅ IN INFISICAL]

# OpenAI
OPENAI_API_KEY=sk-...                      # [⚠️ VERIFY INFISICAL]

# OpenRouter
OPENROUTER_API_KEY=sk-...                  # [⚠️ NEEDS INFISICAL]

# Google
GOOGLE_API_KEY=...                         # [⚠️ NEEDS INFISICAL]
GOOGLE_GEMINI_API_KEY=...                  # [⚠️ NEEDS INFISICAL]

# GPU Workers
WORKER_5090_URL=http://100.64.0.11:11434   # [📝 CONFIGURE]
WORKER_3090_URL=http://100.64.0.12:11434   # [📝 CONFIGURE]
WORKER_3060_URL=http://100.64.0.13:11434   # [📝 CONFIGURE]
```

#### Databases
```bash
# PostgreSQL
POSTGRES_HOST=localhost                     # [✅ SET]
POSTGRES_PORT=5432                          # [✅ SET]
POSTGRES_USER=postgres                      # [✅ SET]
POSTGRES_PASSWORD=...                       # [⚠️ VERIFY INFISICAL]
POSTGRES_DB=nyra_production                 # [✅ SET]

# Redis
REDIS_HOST=localhost                        # [✅ SET]
REDIS_PORT=6379                             # [✅ SET]
REDIS_PASSWORD=...                          # [⚠️ NEEDS INFISICAL]

# Neo4j
NEO4J_URI=bolt://localhost:7687             # [✅ SET]
NEO4J_USER=neo4j                            # [✅ SET]
NEO4J_PASSWORD=...                          # [⚠️ NEEDS INFISICAL]

# Qdrant
QDRANT_URL=http://localhost:6333            # [✅ SET]
QDRANT_API_KEY=...                          # [⚠️ NEEDS INFISICAL]
```

#### Communication Services
```bash
# Twilio
TWILIO_ACCOUNT_SID=AC...                    # [⚠️ NEEDS INFISICAL]
TWILIO_AUTH_TOKEN=...                       # [⚠️ NEEDS INFISICAL]
TWILIO_PHONE_NUMBER=+1...                   # [⚠️ NEEDS INFISICAL]

# SendGrid
SENDGRID_API_KEY=SG...                      # [⚠️ NEEDS INFISICAL]
SENDGRID_FROM_EMAIL=noreply@ratehunter.net  # [⚠️ NEEDS INFISICAL]
```

#### MCP Servers
```bash
# Infisical
INFISICAL_URL=http://localhost:8080         # [✅ SET]
INFISICAL_TOKEN=...                         # [⚠️ NEEDS INFISICAL]

# Nexus Router
NEXUS_ROUTER_PORT=6000                      # [✅ SET]
NEXUS_JWT_SECRET=...                        # [⚠️ NEEDS INFISICAL]

# Letta
LETTA_URL=http://localhost:8283             # [✅ SET]

# Mem0
MEM0_URL=http://localhost:4321              # [✅ SET]

# AgentDB
AGENTDB_URL=http://localhost:8080           # [✅ SET]

# RuVector
RUVECTOR_URL=http://localhost:8888          # [✅ SET]
```

#### GitHub & CI/CD
```bash
# GitHub
GITHUB_TOKEN=ghp_...                        # [⚠️ NEEDS INFISICAL]
GITHUB_OAUTH_CLIENT_ID=...                  # [⚠️ NEEDS INFISICAL]
GITHUB_OAUTH_CLIENT_SECRET=...              # [⚠️ NEEDS INFISICAL]

# Codecov
CODECOV_TOKEN=...                           # [⚠️ NEEDS INFISICAL]

# Sentry
SENTRY_API_TOKEN=...                        # [⚠️ NEEDS INFISICAL]
SENTRY_DSN=...                              # [⚠️ NEEDS INFISICAL]
```

### Infisical Integration Status

**Legend:**
- [✅ IN INFISICAL] - Already added
- [⚠️ NEEDS INFISICAL] - Must add to Infisical
- [⚠️ VERIFY INFISICAL] - Added but value needs verification
- [📝 CONFIGURE] - Needs configuration (not a secret)
- [✅ SET] - Non-secret, already configured

**Actions Required:**
1. Review all [⚠️ NEEDS INFISICAL] items and add to Infisical vault
2. Verify all [⚠️ VERIFY INFISICAL] items have correct values
3. Update `/infra/.env.example` with complete list and Infisical references

---

## 🔌 MCP Servers

### Registered MCP Servers (Nexus Router)

#### Memory Systems
| Server | Port | Container | Nexus Config | Status |
|--------|------|-----------|--------------|--------|
| Letta | 8283 | ✅ | ✅ | [⏳ VERIFY] |
| Mem0 | 4321 | ✅ | ✅ | [⏳ VERIFY] |
| OpenMemory | 8081 | ✅ | ✅ | [⏳ VERIFY] |
| Qdrant | 6333 | ✅ | ❌ | [🔄 ADD TO NEXUS] |
| Graphiti | 6379 | ✅ | ❌ | [🔄 ADD TO NEXUS] |
| AgentDB | 8080 | ✅ | ✅ | [⏳ VERIFY] |
| RuVector | 8888 | ✅ | ✅ | [⏳ VERIFY] |

#### Orchestration
| Server | Port | Container | Nexus Config | Status |
|--------|------|-----------|--------------|--------|
| Claude Flow | 3010 | ✅ | ✅ | [⏳ VERIFY] |
| Archon | 9001 | ⏳ | ❌ | [🔄 TO CONFIGURE] |
| Serena | 8086 | ✅ | ❌ | [🔄 ADD TO NEXUS] |

#### Integration & Tools
| Server | Port | Container | Nexus Config | Status |
|--------|------|-----------|--------------|--------|
| Infisical | 8080 | ✅ | ✅ | [⏳ VERIFY] |
| Bitwarden | TBD | ⏳ | ❌ | [🔄 TO SETUP] |
| GitHub MCP | TBD | ⏳ | ❌ | [🔄 TO SETUP] |
| Filesystem MCP | N/A | N/A | ✅ | [⏳ VERIFY] |
| Docker MCP | TBD | ⏳ | ❌ | [🔄 TO SETUP] |
| Gemini MCP | 8085 | ⏳ | ❌ | [🔄 TO SETUP] |

#### Proxy & Routing
| Server | Port | Container | Nexus Config | Status |
|--------|------|-----------|--------------|--------|
| Nexus Router | 6000 | ✅ | N/A (self) | [✅ CANONICAL] |
| ~LiteLLM~ | 4000 | ❌ | ❌ | [🚫 NOT USING] |

### MCP Server Docker Locations

**Current:** Scattered across multiple locations
**Target:** `/infra/docker/services/<mcp-server-name>/`

```
/infra/docker/services/
├── letta/
│   ├── Dockerfile
│   └── docker-compose.yml
├── mem0/
│   ├── Dockerfile
│   └── docker-compose.yml
├── openmemory/
│   ├── Dockerfile
│   └── docker-compose.yml
├── agentdb/
│   ├── Dockerfile
│   └── docker-compose.yml
├── ruvector/
│   ├── Dockerfile
│   └── docker-compose.yml
├── claude-flow/
│   ├── Dockerfile
│   └── config/
├── archon/
│   ├── Dockerfile
│   └── config/
├── serena/
│   ├── Dockerfile
│   └── config/
├── infisical/
│   ├── Dockerfile
│   └── config/
└── nexus-router/
    ├── Dockerfile
    └── nexus.toml
```

---

## 🚀 Services & Applications

### Frontend Applications (`/apps/web/`)
- `ratehunter/` - [✅ REVIEWED] Landing page
- `webapp/` - [✅ REVIEWED] Admin dashboard
- `mortgage-assistant/` - [⏳ NEEDS REVIEW] AI assistant UI

### Backend Services (`/services/`)
- `quote-engine/` - [⏳ NEEDS REVIEW] Quote generation API
- `campaign-engine/` - [⏳ NEEDS REVIEW] Drip campaign orchestration
- `auth-service/` - [⏳ NEEDS REVIEW] Authentication
- Additional services TBD

---

## 📚 Documentation

### Documentation Structure
```
/docs/
├── architecture/                 [⏳ NEEDS REVIEW]
│   ├── 4PC-DISTRIBUTED-ARCHITECTURE.md
│   ├── nexus-router-integration-design.md
│   └── [many more...]
├── deployment/                   [⏳ NEEDS REVIEW]
├── setup/                        [⏳ NEEDS REVIEW]
├── api/                          [⏳ NEEDS REVIEW]
├── ai-context/                   [✅ REVIEWED]
│   ├── THE-TRUTH.md
│   └── [context files...]
└── WHITEPAPER.md                 [✅ REVIEWED]
```

### Key Documentation Files
- `docs/WHITEPAPER.md` - [✅ REVIEWED] Comprehensive project whitepaper
- `docs/ai-context/THE-TRUTH.md` - [✅ REVIEWED] Canonical architecture
- `docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md` - [✅ REVIEWED] 4-PC setup
- `docs/architecture/nexus-router-integration-design.md` - [⏳ REVIEWING] Nexus details

---

## 📊 Review Status Log

### Consolidation Progress

**Phase 1: Analysis** [✅ COMPLETE]
- ✅ Identified all Docker files (50+ locations)
- ✅ Identified all nexus.toml files (9 locations)
- ✅ Identified bootstrap scripts (scattered)
- ✅ Identified MCP server configs
- ✅ Mapped orchestration folders

**Phase 2: Planning** [🔄 IN PROGRESS]
- ✅ Created PATH-REVIEW-INDEX.md
- ✅ Defined canonical structure
- 🔄 Generating consolidated configurations
- ⏳ Creating migration plan

**Phase 3: Execution** [⏳ PENDING]
- ⏳ Consolidate Nexus Router config
- ⏳ Move Docker files to canonical locations
- ⏳ Relocate orchestration folders
- ⏳ Update all path references
- ⏳ Clean up duplicates
- ⏳ Update bootstrap scripts

**Phase 4: Validation** [⏳ PENDING]
- ⏳ Test Docker compose files
- ⏳ Verify all MCP servers registered
- ⏳ Test bootstrap scripts
- ⏳ Validate environment variables
- ⏳ Run health checks

**Phase 5: Commit** [⏳ PENDING]
- ⏳ Git commit all changes
- ⏳ Push to remote
- ⏳ Update documentation

---

## ✅ Checklist

### Critical Path Items
- [ ] Consolidate Nexus Router configuration (1 canonical source)
- [ ] Move all Dockerfiles to `/infra/docker/services/`
- [ ] Relocate `/orchestration/` folders
- [ ] Update bootstrap scripts with new paths
- [ ] Create master `.env.example`
- [ ] Document missing Infisical secrets
- [ ] Verify all MCP servers in Nexus config
- [ ] Test orchestrator compose stack
- [ ] Test worker compose stacks
- [ ] Create React GUI installer

### Nice-to-Have Items
- [ ] Consolidate duplicate documentation
- [ ] Clean up archive folders
- [ ] Optimize Docker images
- [ ] Add health check endpoints
- [ ] Create backup scripts
- [ ] Setup monitoring dashboards

---

## 🔄 Change Log

### 2026-01-25 05:34 UTC - Initial Creation
- Created PATH-REVIEW-INDEX.md
- Cataloged all Docker files
- Cataloged all Nexus configs
- Identified orchestration relocations
- Mapped environment variables
- Listed all MCP servers

### [To be updated as consolidation proceeds...]

---

**Next Update:** After Phase 2 completion (Consolidation execution)  
**Maintained By:** AI Agent (Warp Claude)  
**Review Frequency:** Updated with each major change
