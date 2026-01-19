# Docker Infrastructure - Visual Structure Diagram

**Date**: 2026-01-18
**Version**: 1.0

---

## 📊 Canonical Structure Overview

```
Project-Nyra/
└── infra/
    ├── docker/                                 🐳 Docker Hub
    │   ├── build/                              🏗️ Build Artifacts (Dockerfiles)
    │   │   ├── orchestration/                  🎯 Orchestrators (5 services)
    │   │   │   ├── claude-flow/
    │   │   │   │   ├── Dockerfile
    │   │   │   │   └── Dockerfile.mcp
    │   │   │   ├── archon-os/
    │   │   │   │   └── Dockerfile
    │   │   │   ├── serena/
    │   │   │   │   └── Dockerfile
    │   │   │   ├── ruv-swarm/
    │   │   │   │   └── Dockerfile
    │   │   │   └── nexus-router/
    │   │   │       └── Dockerfile
    │   │   ├── mcp-servers/                    🔌 MCP Servers (10 servers)
    │   │   │   ├── bitwarden/
    │   │   │   ├── docker-mcp/
    │   │   │   ├── dockerhub-mcp/
    │   │   │   ├── dify/
    │   │   │   ├── git-mcp/
    │   │   │   ├── infisical-mcp/
    │   │   │   │   ├── Dockerfile.mcp
    │   │   │   │   └── Dockerfile.sync
    │   │   │   ├── sequential-thinking-mcp/
    │   │   │   ├── twentycrm/
    │   │   │   ├── vscode/
    │   │   │   └── exa/
    │   │   ├── services/                       ⚙️ Business Services (optional)
    │   │   │   └── (Kept in services/ for build context)
    │   │   ├── apps/                           📱 Frontend Apps (optional)
    │   │   │   └── (Kept in apps/ for build context)
    │   │   ├── tools/                          🛠️ Dev Tools (3 categories)
    │   │   │   ├── archon/
    │   │   │   │   ├── Dockerfile.agents
    │   │   │   │   ├── Dockerfile.mcp
    │   │   │   │   ├── Dockerfile.server
    │   │   │   │   ├── Dockerfile.ui
    │   │   │   │   └── Dockerfile.docs
    │   │   │   ├── devcontainer/
    │   │   │   │   └── Dockerfile
    │   │   │   └── ci/
    │   │   │       └── Dockerfile
    │   │   ├── infrastructure/                 🗄️ Infrastructure (if custom)
    │   │   │   ├── postgres/
    │   │   │   ├── redis/
    │   │   │   ├── qdrant/
    │   │   │   └── falkordb/
    │   │   └── monitoring/                     📊 Monitoring (if custom)
    │   │       ├── prometheus/
    │   │       ├── grafana/
    │   │       ├── loki/
    │   │       └── tempo/
    │   ├── compose/                            📦 Deployment Configurations
    │   │   ├── base/                           🏛️ Base Layer (3 files)
    │   │   │   ├── docker-compose.core.yml         # Databases, caches
    │   │   │   ├── docker-compose.networks.yml     # Network definitions
    │   │   │   └── docker-compose.volumes.yml      # Volume definitions
    │   │   ├── orchestration/                  🎯 Orchestration Layer (5 files)
    │   │   │   ├── docker-compose.orchestration.yml    # All orchestrators
    │   │   │   ├── docker-compose.claude-flow.yml      # Claude Flow only
    │   │   │   ├── docker-compose.archon-os.yml        # Archon OS only
    │   │   │   ├── docker-compose.nexus-router.yml     # Nexus Router only
    │   │   │   └── docker-compose.dual-orchestrator.yml # Dual setup
    │   │   ├── mcp/                            🔌 MCP Layer (3 files)
    │   │   │   ├── docker-compose.mcp.yml              # All MCP servers
    │   │   │   ├── docker-compose.mcp-core.yml         # Core MCP only
    │   │   │   └── docker-compose.mcp-dev.yml          # MCP development
    │   │   ├── services/                       ⚙️ Services Layer (3 files)
    │   │   │   ├── docker-compose.services.yml         # All microservices
    │   │   │   ├── docker-compose.apis.yml             # API gateways
    │   │   │   └── docker-compose.memory.yml           # Memory services
    │   │   ├── apps/                           📱 Apps Layer (1 file)
    │   │   │   └── docker-compose.apps.yml             # Frontend apps
    │   │   ├── workers/                        🖥️ Workers Layer (3 files)
    │   │   │   ├── docker-compose.worker-rtx3060.yml
    │   │   │   ├── docker-compose.worker-rtx5090.yml
    │   │   │   └── docker-compose.worker-rtx3090ti.yml
    │   │   ├── ui/                             🖼️ UI Layer (1 file)
    │   │   │   └── docker-compose.ui.yml               # Open-WebUI, LobeChat
    │   │   ├── monitoring/                     📊 Monitoring Layer (2 files)
    │   │   │   ├── docker-compose.monitoring.yml       # Prometheus, Grafana
    │   │   │   └── docker-compose.observability.yml    # Loki, Tempo, Jaeger
    │   │   ├── addons/                         🧩 Addons Layer (4 files)
    │   │   │   ├── docker-compose.graphiti.yml
    │   │   │   ├── docker-compose.gitea.yml
    │   │   │   ├── docker-compose.voice.yml
    │   │   │   └── docker-compose.addons.yml
    │   │   ├── stacks/                         📚 Pre-configured Stacks (4 files)
    │   │   │   ├── docker-compose.full.yml             # Complete stack
    │   │   │   ├── docker-compose.minimal.yml          # Minimal dev
    │   │   │   ├── docker-compose.orchestrator.yml     # Orchestrator PC
    │   │   │   └── docker-compose.production.yml       # Production
    │   │   └── environments/                   🌍 Environment Overrides (3 files)
    │   │       ├── docker-compose.dev.yml              # Development
    │   │       ├── docker-compose.prod.yml             # Production
    │   │       └── docker-compose.local.yml            # Local dev
    │   ├── configs/                            ⚙️ Container Configurations
    │   │   ├── nginx/
    │   │   │   ├── nginx.conf
    │   │   │   └── sites-enabled/
    │   │   ├── postgres/
    │   │   │   ├── init.sql
    │   │   │   └── migrations/
    │   │   ├── redis/
    │   │   │   └── redis.conf
    │   │   ├── prometheus/
    │   │   │   ├── prometheus.yml
    │   │   │   └── alerts/
    │   │   ├── grafana/
    │   │   │   ├── dashboards/
    │   │   │   └── provisioning/
    │   │   ├── loki/
    │   │   │   └── loki-config.yml
    │   │   └── jaeger/
    │   │       └── jaeger-config.yml
    │   ├── scripts/                            📜 Utility Scripts
    │   │   ├── build/
    │   │   │   ├── build-all.sh
    │   │   │   ├── build-orchestrators.sh
    │   │   │   └── build-services.sh
    │   │   ├── deploy/
    │   │   │   ├── deploy-stack.sh
    │   │   │   ├── deploy-orchestrator.sh
    │   │   │   └── deploy-worker.sh
    │   │   ├── maintenance/
    │   │   │   ├── clean-images.sh
    │   │   │   ├── clean-volumes.sh
    │   │   │   └── prune-system.sh
    │   │   ├── health/
    │   │   │   ├── health-check.sh
    │   │   │   └── service-status.sh
    │   │   └── backup/
    │   │       ├── backup-volumes.sh
    │   │       └── restore-volumes.sh
    │   ├── .env.example                        🔐 Environment Template
    │   ├── .dockerignore                       🚫 Ignore Patterns
    │   ├── docker-compose.yml                  🎯 Main Entry Point
    │   └── README.md                           📖 Documentation
    └── nexus-router/                           🔀 Nexus Router Configs
        ├── config.yml
        └── routes/
```

---

## 🏗️ Architectural Layers

### Layer 1: Base Infrastructure
```
┌─────────────────────────────────────────────┐
│         BASE INFRASTRUCTURE                  │
│  PostgreSQL │ Redis │ FalkorDB │ Qdrant    │
│  Port 5432  │ 6379  │ 6380     │ 6333      │
└─────────────────────────────────────────────┘
```

### Layer 2: Orchestration
```
┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATION LAYER                            │
│  Claude Flow │ Archon OS │ Nexus Router │ Serena │ RuvSwarm│
│  Port varies │  varies   │   varies     │ varies │  varies │
└─────────────────────────────────────────────────────────────┘
```

### Layer 3: MCP Servers
```
┌──────────────────────────────────────────────────────────────────┐
│                    MCP SERVERS LAYER                              │
│  Bitwarden │ Docker │ Git │ Infisical │ Sequential │ ... (10)    │
└──────────────────────────────────────────────────────────────────┘
```

### Layer 4: Business Services
```
┌──────────────────────────────────────────────────────────────────┐
│                 BUSINESS SERVICES LAYER                           │
│  Campaign │ Quote │ LiteLLM │ Mem0 │ WebSocket │ ... (14)        │
└──────────────────────────────────────────────────────────────────┘
```

### Layer 5: Applications
```
┌──────────────────────────────────────────────┐
│           APPLICATION LAYER                   │
│  Mortgage Services │ Nyra Admin │ RateHunter │
└──────────────────────────────────────────────┘
```

### Layer 6: Monitoring
```
┌────────────────────────────────────────────────────┐
│              MONITORING LAYER                       │
│  Prometheus │ Grafana │ Loki │ Tempo │ Jaeger     │
└────────────────────────────────────────────────────┘
```

---

## 🔄 Composition Patterns

### Pattern 1: Orchestrator PC (PC1)
```bash
docker compose \
  -f infra/docker/compose/base/docker-compose.core.yml \
  -f infra/docker/compose/orchestration/docker-compose.orchestration.yml \
  -f infra/docker/compose/mcp/docker-compose.mcp.yml \
  -f infra/docker/compose/monitoring/docker-compose.monitoring.yml \
  -f infra/docker/compose/environments/docker-compose.prod.yml \
  up -d
```
**Result**: Base + Orchestrators + MCP + Monitoring + Prod Config

### Pattern 2: Worker PC (PC2/PC3/PC4)
```bash
docker compose \
  -f infra/docker/compose/workers/docker-compose.worker-rtx3060.yml \
  up -d
```
**Result**: GPU Worker with Ollama/vLLM

### Pattern 3: Full Development Stack
```bash
docker compose \
  -f infra/docker/compose/stacks/docker-compose.full.yml \
  -f infra/docker/compose/environments/docker-compose.dev.yml \
  up -d
```
**Result**: All services + Development overrides

### Pattern 4: Minimal Dev Stack
```bash
docker compose \
  -f infra/docker/compose/stacks/docker-compose.minimal.yml \
  up -d
```
**Result**: Core services only for fast local development

---

## 📊 File Distribution

### By Category
```
Dockerfiles:       40+ files
  ├── Orchestration:    5 services
  ├── MCP Servers:     10 servers
  ├── Tools:            3 categories
  ├── Services:        10 services (in services/)
  └── Apps:             3 apps (in apps/)

Compose Files:     30+ files
  ├── Base:             3 files
  ├── Orchestration:    5 files
  ├── MCP:              3 files
  ├── Services:         3 files
  ├── Apps:             1 file
  ├── Workers:          3 files
  ├── UI:               1 file
  ├── Monitoring:       2 files
  ├── Addons:           4 files
  ├── Stacks:           4 files
  └── Environments:     3 files

Configs:           20+ files
Scripts:           13 scripts
```

### By Purpose
```
BUILD (Dockerfiles):    What to build
COMPOSE (yml files):    How to deploy
CONFIGS (conf files):   How to configure
SCRIPTS (sh files):     How to operate
```

---

## 🎯 Navigation Guide

### Finding a Dockerfile
```
Q: Where is the Claude Flow Dockerfile?
A: infra/docker/build/orchestration/claude-flow/Dockerfile

Q: Where is the Bitwarden MCP Dockerfile?
A: infra/docker/build/mcp-servers/bitwarden/Dockerfile

Q: Where is the campaign-engine Dockerfile?
A: services/campaign-engine/Dockerfile (kept for build context)
```

### Finding a Compose File
```
Q: How do I start the orchestrators?
A: infra/docker/compose/orchestration/docker-compose.orchestration.yml

Q: How do I start a worker node?
A: infra/docker/compose/workers/docker-compose.worker-rtx3060.yml

Q: How do I start the full stack?
A: infra/docker/compose/stacks/docker-compose.full.yml
```

### Finding a Config
```
Q: Where is the Nginx config?
A: infra/docker/configs/nginx/nginx.conf

Q: Where are Prometheus alerts?
A: infra/docker/configs/prometheus/alerts/
```

### Finding a Script
```
Q: How do I build all images?
A: infra/docker/scripts/build/build-all.sh

Q: How do I deploy the orchestrator?
A: infra/docker/scripts/deploy/deploy-orchestrator.sh

Q: How do I check health?
A: infra/docker/scripts/health/health-check.sh
```

---

## 🔀 Data Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Nginx (Reverse Proxy)          │
└──────┬──────────────────────────────┘
       │
       ├─────────────┬─────────────┬──────────────┐
       ▼             ▼             ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Claude   │  │ Archon   │  │ Nexus    │  │  Apps    │
│ Flow     │  │ OS       │  │ Router   │  │          │
└─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
      │             │              │             │
      └─────────────┴──────────────┴─────────────┘
                     │
                     ▼
      ┌──────────────────────────────────────┐
      │          MCP Servers                  │
      │  (Bitwarden, Git, Docker, etc.)      │
      └───────────────┬──────────────────────┘
                      │
                      ▼
      ┌──────────────────────────────────────┐
      │      Business Services                │
      │  (Campaign, Quote, Memory, etc.)     │
      └───────────────┬──────────────────────┘
                      │
                      ▼
      ┌──────────────────────────────────────┐
      │        Data Layer                     │
      │  PostgreSQL │ Redis │ Qdrant         │
      └──────────────────────────────────────┘
```

---

## 🌐 Network Topology

```
┌────────────────────────────────────────────────────────────┐
│                    nyra-network                             │
│                    (172.28.0.0/16)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Orchestrators│  │ MCP Servers  │  │   Services   │    │
│  │              │  │              │  │              │    │
│  │ claude-flow  │  │ bitwarden    │  │ campaign     │    │
│  │ archon-os    │  │ git-mcp      │  │ quote        │    │
│  │ nexus-router │  │ docker-mcp   │  │ litellm      │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Databases   │  │ Caches       │  │ Monitoring   │    │
│  │              │  │              │  │              │    │
│  │ postgres     │  │ redis        │  │ prometheus   │    │
│  │ falkordb     │  │              │  │ grafana      │    │
│  │ qdrant       │  │              │  │ loki         │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                  observability                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Loki         │  │ Tempo        │  │ Jaeger       │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    databases                                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ postgres     │  │ letta-pg     │  │ twenty-pg    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability

### Horizontal Scaling
```
Orchestrator PC (PC1)
├── Claude Flow (1 instance)
├── Archon OS (1 instance)
└── Nexus Router (1 instance)

Worker PC2 (RTX 3060)
├── Ollama (GPU)
└── vLLM (GPU)

Worker PC3 (RTX 5090)
├── Ollama (GPU)
└── vLLM (GPU)

Worker PC4 (RTX 3090 Ti)
├── Ollama (GPU)
└── vLLM (GPU)
```

### Service Replication
```yaml
services:
  campaign-engine:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
```

---

## 🔐 Security Boundaries

```
┌─────────────────────────────────────────────────────────┐
│                External Network (Internet)               │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx (Reverse Proxy + SSL)                 │
│              Cloudflare Tunnel                           │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Application Network (nyra-network)              │
│          ├── Orchestrators (internal only)               │
│          ├── MCP Servers (internal only)                 │
│          ├── Services (internal + selected exposed)      │
│          └── Apps (exposed via Nginx)                    │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│          Database Network (databases)                    │
│          ├── PostgreSQL (internal only)                  │
│          ├── Redis (internal only)                       │
│          ├── FalkorDB (internal only)                    │
│          └── Qdrant (internal only)                      │
└─────────────────────────────────────────────────────────┘
```

---

**Document Version**: 1.0
**Last Updated**: 2026-01-18
**Related Documents**:
- Canonical Structure: `.research/docker-canonical-structure.md`
- Migration Plan: `.research/docker-migration-plan.md`
- ADR: `.research/ADR-docker-canonical-structure.md`
