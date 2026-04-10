# Project-Nyra Docker Structure - Visual Diagram

## Canonical Directory Structure

```
Project-Nyra/
│
├── docker/                                    # Docker Hub (ALL Docker files here)
│   │
│   ├── build/                                 # Dockerfile Repository
│   │   ├── base/                              # Foundation Images (DRY)
│   │   │   ├── node-base.Dockerfile           # Node.js 20 + pnpm
│   │   │   ├── python-base.Dockerfile         # Python + uv
│   │   │   ├── ubuntu-dev.Dockerfile          # Dev container base
│   │   │   └── alpine-minimal.Dockerfile      # Minimal production
│   │   │
│   │   ├── services/                          # Microservice Images
│   │   │   ├── mem0-rest.Dockerfile           # Memory service
│   │   │   ├── nyra-orchestrator.Dockerfile   # Main orchestrator
│   │   │   ├── nexus-router.Dockerfile        # LLM router
│   │   │   ├── litellm-proxy.Dockerfile       # Model proxy
│   │   │   ├── quote-api.Dockerfile           # Quote API
│   │   │   ├── quote-engine.Dockerfile        # Quote engine
│   │   │   ├── campaign-engine.Dockerfile     # Campaign engine
│   │   │   └── websocket-hub.Dockerfile       # WebSocket hub
│   │   │
│   │   ├── apps/                              # Application Images
│   │   │   ├── nyra-admin.Dockerfile          # Admin dashboard
│   │   │   ├── ratehunter.Dockerfile          # Rate hunter app
│   │   │   ├── mortgage-services.Dockerfile   # Mortgage services
│   │   │   └── webapp.Dockerfile              # Main web app
│   │   │
│   │   ├── orchestration/                     # Orchestration Systems
│   │   │   ├── archon-os.Dockerfile         # Claude Flow
│   │   │   ├── archon-os.Dockerfile           # Archon OS
│   │   │   └── serena.Dockerfile              # Serena orchestrator
│   │   │
│   │   ├── mcp/                               # MCP Server Images
│   │   │   ├── bitwarden-mcp.Dockerfile       # Secrets MCP
│   │   │   ├── git-mcp.Dockerfile             # Git operations
│   │   │   ├── docker-mcp.Dockerfile          # Docker control
│   │   │   ├── infisical-mcp.Dockerfile       # Infisical integration
│   │   │   ├── sequential-thinking-mcp.Dockerfile
│   │   │   └── dockerhub-mcp.Dockerfile       # Docker Hub integration
│   │   │
│   │   ├── tools/                             # Development Tools
│   │   │   ├── archon-ui.Dockerfile           # Archon UI
│   │   │   ├── archon-agents.Dockerfile       # Archon agents
│   │   │   ├── ruv-swarm.Dockerfile           # Ruv swarm
│   │   │   └── exa-mcp.Dockerfile             # Exa search
│   │   │
│   │   ├── ci/                                # CI/CD Images
│   │   │   └── ci-builder.Dockerfile          # Build environment
│   │   │
│   │   └── .dockerignore                      # Root ignore file
│   │
│   ├── compose/                               # Docker Compose Hub
│   │   │
│   │   ├── base/                              # Core Infrastructure
│   │   │   ├── databases.yml                  # PostgreSQL, Redis, FalkorDB, Qdrant
│   │   │   ├── observability.yml              # Prometheus, Grafana, Loki
│   │   │   ├── networking.yml                 # Networks, Nginx
│   │   │   └── volumes.yml                    # Persistent volumes
│   │   │
│   │   ├── environments/                      # Environment Overrides
│   │   │   ├── local.yml                      # Local dev (hot reload)
│   │   │   ├── dev.yml                        # Development
│   │   │   ├── staging.yml                    # Staging
│   │   │   ├── production.yml                 # Production (hardened)
│   │   │   └── test.yml                       # Testing
│   │   │
│   │   ├── stacks/                            # Feature Stacks
│   │   │   ├── ai-stack.yml                   # Letta, Open-WebUI, LobeChat
│   │   │   ├── automation.yml                 # n8n, workflow engines
│   │   │   ├── crm.yml                        # TwentyCRM
│   │   │   ├── memory.yml                     # Mem0, FalkorDB
│   │   │   ├── orchestration.yml              # Claude Flow, Archon OS
│   │   │   ├── mcp-servers.yml                # MCP server stack
│   │   │   ├── mortgage-domain.yml            # Mortgage services
│   │   │   └── voice.yml                      # Voice services
│   │   │
│   │   ├── profiles/                          # Selective Startup
│   │   │   ├── minimal.yml                    # Core only (DB + network)
│   │   │   ├── full.yml                       # Everything
│   │   │   ├── developer.yml                  # Dev-focused
│   │   │   └── production-ready.yml           # Production config
│   │   │
│   │   ├── docker-compose.yml                 # Main Orchestrator
│   │   ├── docker-compose.override.yml        # Local overrides (gitignored)
│   │   └── README.md                          # Usage documentation
│   │
│   ├── configs/                               # Container Configurations
│   │   ├── nginx/                             # Reverse Proxy
│   │   │   ├── nginx.conf
│   │   │   ├── sites-enabled/
│   │   │   └── ssl/
│   │   │
│   │   ├── observability/                     # Monitoring Stack
│   │   │   ├── prometheus/
│   │   │   │   ├── prometheus.yml
│   │   │   │   └── alerts.yml
│   │   │   ├── grafana/
│   │   │   │   ├── datasources.yml
│   │   │   │   └── dashboards/
│   │   │   ├── loki/
│   │   │   │   └── loki.yml
│   │   │   └── alertmanager/
│   │   │       └── alertmanager.yml
│   │   │
│   │   ├── databases/                         # Database Configs
│   │   │   ├── postgres/
│   │   │   │   └── init.sql
│   │   │   └── redis/
│   │   │       └── redis.conf
│   │   │
│   │   └── services/                          # Service Configs
│   │       ├── nexus/
│   │       │   └── nexus.toml
│   │       ├── litellm/
│   │       │   └── config.yaml
│   │       └── archon-os/
│   │           └── archon-os.config.json
│   │
│   ├── scripts/                               # Automation Scripts
│   │   ├── build/                             # Build Automation
│   │   │   ├── build-all.sh
│   │   │   ├── build-service.sh
│   │   │   ├── tag-release.sh
│   │   │   ├── push-registry.sh
│   │   │   └── scan-security.sh
│   │   │
│   │   ├── deploy/                            # Deployment Scripts
│   │   │   ├── deploy-local.sh
│   │   │   ├── deploy-staging.sh
│   │   │   ├── deploy-production.sh
│   │   │   └── rollback.sh
│   │   │
│   │   ├── maintenance/                       # Operational Scripts
│   │   │   ├── backup-volumes.sh
│   │   │   ├── restore-volumes.sh
│   │   │   ├── cleanup-images.sh
│   │   │   ├── cleanup-volumes.sh
│   │   │   └── health-check.sh
│   │   │
│   │   └── dev/                               # Developer Tools
│   │       ├── logs.sh
│   │       ├── shell.sh
│   │       └── reset-env.sh
│   │
│   └── .env.example                           # Environment Template
│
├── services/                                  # Service Source Code (no Dockerfiles)
├── apps/                                      # Application Source Code
├── tools/                                     # Tool Source Code
└── docs/
    └── architecture/
        └── docker/                            # Docker Documentation
            ├── ARCHITECTURE.md
            ├── RUNBOOK.md
            ├── TROUBLESHOOTING.md
            └── MIGRATION-GUIDE.md
```

---

## Docker Compose Composition Pattern

```yaml
# docker/compose/docker-compose.yml (Main Entry Point)
version: '3.8'

include:
  # Base Infrastructure (Always Loaded)
  - path: ./base/databases.yml          # PostgreSQL, Redis, FalkorDB, Qdrant
  - path: ./base/observability.yml      # Prometheus, Grafana, Loki
  - path: ./base/networking.yml         # Networks, reverse proxy

  # Feature Stacks (Profile-Based)
  - path: ./stacks/orchestration.yml    # Claude Flow, Archon OS
  - path: ./stacks/ai-stack.yml         # AI services
  - path: ./stacks/memory.yml           # Memory services
  - path: ./stacks/crm.yml              # CRM stack
  - path: ./stacks/mcp-servers.yml      # MCP servers
  - path: ./stacks/automation.yml       # n8n, workflows
  - path: ./stacks/mortgage-domain.yml  # Domain services
  - path: ./stacks/voice.yml            # Voice services

  # Environment Override (Dynamic)
  - path: ./environments/${ENVIRONMENT:-local}.yml

networks:
  nyra-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

**Usage Examples**:
```bash
# Minimal (databases + networking only)
docker compose up -d

# Development environment with dev tools
docker compose --profile dev up -d

# Full AI platform
docker compose --profile ai up -d

# Everything
docker compose --profile full up -d

# Production
ENVIRONMENT=production docker compose --profile production up -d
```

---

## Service Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         TIER 1: CORE INFRASTRUCTURE              │
│                         (Always Running)                         │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  FalkorDB  │  Qdrant  │  Nginx  │     │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 2: PLATFORM SERVICES                     │
│                    (Production Critical)                         │
├─────────────────────────────────────────────────────────────────┤
│  Mem0  │  OpenMemory MCP  │  Claude Flow  │  Archon OS  │  CRM │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                      TIER 3: AI SERVICES                         │
│                      (Feature Enablement)                        │
├─────────────────────────────────────────────────────────────────┤
│  Letta  │  LiteLLM  │  Nexus Router  │  Open-WebUI  │  LobeChat│
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                    TIER 4: DOMAIN SERVICES                       │
│                    (Business Logic)                              │
├─────────────────────────────────────────────────────────────────┤
│  Nyra Orchestrator  │  Quote API  │  Campaign Engine  │  More  │
└─────────────────────────────────────────────────────────────────┘
                                  ▲
                                  │
┌─────────────────────────────────────────────────────────────────┐
│                   TIER 5: DEVELOPMENT TOOLS                      │
│                   (Dev/Test Only)                                │
├─────────────────────────────────────────────────────────────────┤
│  n8n  │  Dify  │  MCP Servers  │  Archon UI  │  Development    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Network Topology

```
                        ┌──────────────────┐
                        │   Nginx Proxy    │  (Optional)
                        │   Port 80/443    │
                        └────────┬─────────┘
                                 │
                        ┌────────┴─────────┐
                        │  nyra-network    │  Bridge Network
                        │  172.28.0.0/16   │  DNS: service names
                        └────────┬─────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
   ┌────▼────┐            ┌─────▼─────┐          ┌──────▼──────┐
   │ Services│            │   Apps    │          │    Tools    │
   │         │            │           │          │             │
   │ mem0    │            │ nyra-     │          │ archon-ui   │
   │ letta   │            │ admin     │          │ ruv-swarm   │
   │ nexus   │            │ ratehunter│          │ MCP servers │
   └─────────┘            └───────────┘          └─────────────┘
        │                        │                        │
        └────────────────────────┼────────────────────────┘
                                 │
                        ┌────────▼─────────┐
                        │   Databases      │
                        │                  │
                        │ PostgreSQL       │
                        │ Redis            │
                        │ FalkorDB         │
                        │ Qdrant           │
                        └──────────────────┘
```

**Service Discovery**: Via DNS (service names resolve automatically)
**Internal Communication**: http://{service-name}:{port}
**External Access**: Only exposed via port mappings

---

## Multi-Stage Build Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                        STAGE 1: Dependencies                     │
│                        FROM node-base AS deps                    │
├─────────────────────────────────────────────────────────────────┤
│  • COPY package.json pnpm-lock.yaml                             │
│  • RUN pnpm install --frozen-lockfile --prod                    │
│  • Result: /app/node_modules (production only)                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STAGE 2: Build                            │
│                        FROM node-base AS build                   │
├─────────────────────────────────────────────────────────────────┤
│  • COPY package.json pnpm-lock.yaml                             │
│  • RUN pnpm install --frozen-lockfile (all deps)                │
│  • COPY source code                                              │
│  • RUN pnpm build                                                │
│  • Result: /app/dist (compiled code)                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        STAGE 3: Production                       │
│                        FROM node:20-alpine AS production         │
├─────────────────────────────────────────────────────────────────┤
│  • COPY --from=deps /app/node_modules                           │
│  • COPY --from=build /app/dist                                  │
│  • COPY package.json                                             │
│  • USER node (non-root)                                          │
│  • CMD ["node", "dist/index.js"]                                │
│  • Result: Minimal production image (~50MB vs ~500MB)           │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits**:
- 90% size reduction (500MB → 50MB)
- No build tools in production image
- Better security (minimal attack surface)
- Faster deployments and startup

---

## Profile-Based Startup

```
┌─────────────────────────────────────────────────────────────────┐
│                          Profile: minimal                        │
│                          docker compose up -d                    │
├─────────────────────────────────────────────────────────────────┤
│  ✓ PostgreSQL          ✓ Redis           ✓ FalkorDB            │
│  ✓ Networks            ✓ Volumes                                │
│  ✗ AI Services         ✗ Dev Tools       ✗ Monitoring          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          Profile: dev                            │
│                  docker compose --profile dev up -d              │
├─────────────────────────────────────────────────────────────────┤
│  ✓ minimal +           ✓ Open-WebUI      ✓ n8n                 │
│  ✓ Hot Reload          ✓ Dev Containers                         │
│  ✗ Production Hardening ✗ Full Monitoring                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          Profile: ai                             │
│                  docker compose --profile ai up -d               │
├─────────────────────────────────────────────────────────────────┤
│  ✓ minimal +           ✓ Letta           ✓ Mem0                │
│  ✓ Claude Flow         ✓ Archon OS       ✓ LiteLLM             │
│  ✓ Nexus Router        ✓ Open-WebUI      ✓ LobeChat            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                          Profile: full                           │
│                  docker compose --profile full up -d             │
├─────────────────────────────────────────────────────────────────┤
│  ✓ ai +                ✓ TwentyCRM        ✓ All MCP Servers    │
│  ✓ n8n                 ✓ Dify            ✓ Full Monitoring     │
│  ✓ Alertmanager        ✓ All Services                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        Profile: production                       │
│       ENVIRONMENT=production docker compose                      │
│                   --profile production up -d                     │
├─────────────────────────────────────────────────────────────────┤
│  ✓ Core Services       ✓ Resource Limits  ✓ Health Checks      │
│  ✓ Full Monitoring     ✓ Alerting         ✓ Security Hardening │
│  ✗ Dev Tools           ✗ Hot Reload       ✗ Debug Ports        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Migration Timeline

```
Week 1: Foundation
├── Create docker/ structure
├── Migrate base Dockerfiles
├── Create main docker-compose.yml
└── Update CI/CD pipelines
    │
    ▼
Week 2-3: Service Migration
├── Migrate service Dockerfiles (priority order)
├── Multi-stage builds optimization
├── Test each service
└── Update build contexts
    │
    ▼
Week 3-4: Compose Consolidation
├── Create base compose files
├── Extract stacks
├── Environment overrides
├── Implement profiles
└── Migrate configurations
    │
    ▼
Week 4: Cleanup & Optimization
├── Delete old locations
├── Optimize image sizes
├── Security scanning
├── Performance tuning
└── Create operational scripts
    │
    ▼
Week 5: Documentation & Training
├── Architecture docs
├── Runbooks
├── Troubleshooting guides
└── Team training

Total: 5 weeks, 2-3 engineers full-time
```

---

## Key Design Principles

**1. Single Source of Truth**
```
✗ BEFORE: 70+ Dockerfiles scattered across repo
✓ AFTER:  All in docker/build/ with clear naming
```

**2. DRY (Don't Repeat Yourself)**
```
✗ BEFORE: Duplicate base image definitions
✓ AFTER:  Base images in docker/build/base/, reused everywhere
```

**3. Separation of Concerns**
```
docker/build/    → Image definitions
docker/compose/  → Orchestration
docker/configs/  → Configuration
docker/scripts/  → Automation
```

**4. Environment Parity**
```
Same images → Different configs → Dev/Staging/Prod
```

**5. Security by Default**
```
• Non-root users
• Multi-stage builds (minimal images)
• No secrets in images
• Regular security scanning
```

---

## Success Criteria Checklist

**Technical Metrics**:
- [ ] Zero duplicate Dockerfiles (70+ → 40-50 unique)
- [ ] Image size reduction by 30-50%
- [ ] Build time reduction by 20-40%
- [ ] Compose files: 100+ → 15-20 modular files
- [ ] 100% health check coverage
- [ ] Security scan: No HIGH/CRITICAL vulnerabilities

**Operational Metrics**:
- [ ] 99%+ deployment success rate
- [ ] < 5 minutes mean time to deploy (MTTD)
- [ ] < 15 minutes mean time to recovery (MTTR)
- [ ] < 30 minutes new developer onboarding

**Business Metrics**:
- [ ] 20% increase in deployment frequency
- [ ] 50% reduction in Docker maintenance
- [ ] 10-20% infrastructure cost reduction

---

**Document Version**: 1.0
**Date**: 2026-01-18
**Companion to**: docker-canonical-design.md
