# Project Nyra

> AI-Powered Mortgage Automation Platform with Multi-Agent Orchestration

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10+-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

### Get Running in 5 Commands (Recommended)

```bash
cd ~/projects/project-nyra
docker network create nyra-network
cp infra/docker-compose/.env.example infra/docker-compose/.env
docker compose -f infra/docker-compose.yml up -d
docker compose -f infra/docker-compose.yml ps
```

**📖 Complete Guide**: See **[STARTUP-GUIDE.md](./STARTUP-GUIDE.md)** for detailed setup, troubleshooting, and advanced usage.

### Option 2: GUI Bootstrap Installer (Windows)

```powershell
# Run the interactive installer
cd bootstrap
pnpm install
pnpm start

# Follow the GUI to select:
# - PC configuration (orchestrator, worker, or standalone)
# - Components to install (Docker, WSL, Claude Flow, etc.)
# - Configuration templates to deploy
```

**Bootstrap Guide**: [bootstrap/README.md](bootstrap/README.md)

### Option 3: Development Mode

```bash
# Install dependencies
pnpm install

# Start development environment
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

## What is Project Nyra?

Project Nyra is an intelligent mortgage automation platform that combines:

- **Multi-Agent AI Orchestration** - Claude Flow, Ruv-Swarm, and Flow-Nexus working together
- **Microservices Architecture** - 14 specialized backend services
- **Modern Frontend Apps** - 5 user-facing applications
- **Real-Time Processing** - WebSocket connections and event-driven workflows
- **Smart Routing** - Intelligent LLM request routing (GPU → Cloud fallback)

### Key Features

- **Automated Mortgage Processing** - AI-powered document analysis and workflow automation
- **Rate Comparison Engine** - Real-time mortgage rate tracking and alerts
- **Lead Management** - Intelligent lead capture and CRM integration
- **Document Management** - OCR, classification, and automated processing
- **AI Assistant** - Conversational AI for loan officers and clients
- **Multi-Agent Swarms** - Distributed task execution with up to 100 concurrent agents

## Project Status

**Current Phase:** Phase 3 - Dual Orchestration Integration (Claude Flow + Archon OS)

**Last Updated:** January 21, 2026

**Active Development:**
- Multi-agent swarm coordination
- Memory system integration
- Microservices deployment
- Docker orchestration

## Architecture

### Deployment Architecture

**Current Setup:** 4-PC Windows Distributed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Windows Orchestrator PC (Mini PC)                          │
│  ├── Docker Desktop + WSL2                                  │
│  ├── Orchestration Services (Claude Flow, Archon OS)       │
│  ├── Message Queue (RabbitMQ)                              │
│  ├── Coordination Layer                                     │
│  └── Magic Packet Wake-on-LAN for workers                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ├── Cloudflared Tunnels
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
┌───▼────┐           ┌────▼───┐           ┌────▼───┐
│Worker 1│           │Worker 2│           │Worker 3│
│GPU PC  │           │GPU PC  │           │GPU PC  │
│RTX 4090│           │RTX 4090│           │RTX 4090│
└────────┘           └────────┘           └────────┘
```

**Key Features:**
- Windows orchestrator with WSL2 for Linux containers
- Distributed GPU compute across 3 worker PCs
- Cloudflared tunnels for secure communication
- Wake-on-LAN for power-efficient worker management
- Centralized configuration via bootstrap system

### Monorepo Structure

```
Project-Nyra/
├── bootstrap/               # Installation and setup system
│   ├── installer/           # React GUI installer
│   ├── scripts/             # PowerShell installation scripts
│   ├── configs/             # Configuration templates
│   └── docs/                # Bootstrap documentation
│
├── apps/                    # Frontend applications (5 apps)
│   ├── mortgage-assistant/  # Loan officer dashboard
│   ├── nexus-dashboard/     # Admin & monitoring
│   ├── nyra-admin/          # System administration
│   ├── ratehunter/          # Rate comparison tool
│   └── ratehunter-landing/  # Marketing site
│
├── services/                # Backend microservices (14 services)
│   ├── auth-service/        # Authentication & authorization
│   ├── campaign-engine/     # Marketing automation
│   ├── doc-management-api/  # Document processing
│   ├── graphiti-knowledge/  # Knowledge graph management
│   ├── lead-capture-api/    # Lead management
│   ├── letta-integration/   # Agent memory system
│   ├── mortgage-assistant-api/  # Mortgage operations API
│   ├── n8n-workflows/       # Workflow automation
│   ├── nexus-router/        # LLM request routing
│   ├── rate-comparison-engine/  # Rate tracking
│   ├── ratehunter-api/      # Rate comparison API
│   ├── ruvector-search/     # Vector search engine
│   ├── twentycrm-integration/  # CRM integration
│   ├── twilio-integration/  # SMS/Voice communications
│   └── websocket-hub/       # Real-time connections
│
├── packages/                # Shared packages
│   ├── database/            # Prisma schemas & migrations
│   ├── config/              # Shared configurations
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Shared utilities
│
├── orchestration/           # Multi-agent orchestration
│   ├── archon-os/           # Agent operating system
│   └── claude-flow/         # Workflow orchestration
│
├── infra/                   # Infrastructure as code
│   ├── docker/              # Docker Compose files
│   ├── kubernetes/          # K8s manifests
│   └── terraform/           # Cloud infrastructure
│
└── docs/                    # Documentation
    ├── api/                 # API documentation
    ├── architecture/        # Architecture diagrams
    ├── deployment/          # Deployment guides
    └── guides/              # How-to guides
```

## 📚 Documentation

### 🆕 Repository Consolidation (January 2026)

**Project Nyra has undergone comprehensive repository consolidation on January 18, 2026!**

Executed by a **15-agent swarm** using hierarchical coordination:
- ✅ **Repository Structure** - Clear domain boundaries and organization
- ✅ **apps/ingestion/** - NEW systematic content processing workspace
- ✅ **SPARC Workflow** - Automated 5-phase ingestion pipeline
- ✅ **Unified Bootstrap** - Single GUI installer replacing 3+ duplicate folders
- ✅ **202 Docker Compose files** - Organized by function
- ✅ **~700 MB** - Historical materials safely archived with rollback instructions

**Essential Consolidation Docs:**
- 🔥 **[Repository Consolidation 2026-01-18](docs/REPOSITORY-CONSOLIDATION-2026-01-18.md)** - Complete consolidation documentation with before/after, migration guide, SPARC workflow
- 🔥 **[apps/ingestion/](apps/ingestion/README.md)** - NEW systematic content processing workspace
- 🔥 **[SPARC Workflows](.claude-flow/workflows/README.md)** - Automated multi-agent workflow templates
- 🔥 **[Consolidation Complete](docs/operations/CONSOLIDATION-COMPLETE.md)** - Infrastructure consolidation summary
- 🔥 **[Environment Variables Guide](docs/operations/ENV-VARIABLE-GUIDE.md)** - Complete variable reference
- 🔥 **[Docker Usage Guide](infra/docker/USAGE-GUIDE.md)** - Docker deployment patterns

### Getting Started
- **[Bootstrap Installation](bootstrap/README.md)** - GUI installer and setup guide
- **[Project Whitepaper](docs/WHITEPAPER.md)** - Complete system architecture and business case
- **[SPARC Specifications](docs/SPARC-SPECIFICATIONS.md)** - Development methodology and workflow
- [Quick Start Guide](docs/deployment/QUICK-START.md) - Get up and running in 10 minutes
- [Local Development (Windows)](docs/deployment/LOCAL-DEV-WINDOWS.md) - Windows development setup
- [Linux Deployment](docs/deployment/LINUX-ORCHESTRATOR-DEPLOY.md) - Linux production deployment
- [Environment Setup](docs/guides/environment-setup.md) - Configure your environment
- **[Configuration Templates](bootstrap/configs/README.md)** - Pre-built configuration files

### Architecture
- **[Architecture Overview](docs/architecture/ARCHITECTURE-OVERVIEW.md)** - Complete system design (Level 1 & 2 diagrams)
- [System Architecture](docs/architecture/system-architecture.md) - Detailed architectural specifications
- **[4-PC Distributed Architecture](docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md)** - Multi-PC deployment with GPU workers
- [Dual Orchestrator Design](docs/architecture/DUAL-ORCHESTRATOR-ARCHITECTURE.md)** - Claude Flow + Archon OS integration
- [Memory Systems](docs/architecture/memory-systems.md) - Agent memory architecture (Letta, Mem0, Graphiti, Qdrant)
- [API Contracts](docs/architecture/api-contracts.md) - Service interfaces
- **[Architecture Decisions](docs/architecture/ARCHITECTURE-DECISIONS.md)** - ADRs and technology choices

### Development
- [Apps Overview](apps/README.md) - Frontend applications guide
- [Services Overview](services/README.md) - Backend services guide
- [Deployment Guide](docs/deployment/README.md) - Deployment instructions
- [API Documentation](docs/api/rest-api.md) - REST API reference

### Operations
- **[Consolidation Complete](docs/operations/CONSOLIDATION-COMPLETE.md)** - Infrastructure consolidation summary
- **[Environment Variables Guide](docs/operations/ENV-VARIABLE-GUIDE.md)** - Complete environment configuration
- **[Docker Usage Guide](infra/docker/USAGE-GUIDE.md)** - Docker deployment patterns
- [Deployment Status](docs/deployment/DEPLOYMENT-STATUS.md) - Current deployment state
- **[Infisical Secrets](docs/deployment/INFISICAL-SECRETS-REFERENCE.md)** - Secrets management with Infisical
- [MCP Server Setup](docs/deployment/MCP-SERVER-SETUP.md) - Model Context Protocol setup

## Technology Stack

### Core Technologies
- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.7+
- **Package Manager:** pnpm 10+
- **Build System:** Turborepo 2.4+
- **Containerization:** Docker + Docker Compose

### Backend
- **Framework:** Express.js / Fastify
- **Database:** PostgreSQL 16 + Prisma ORM
- **Cache:** Redis 7
- **Message Queue:** RabbitMQ / Redis Pub/Sub
- **Vector DB:** Qdrant
- **Graph DB:** FalkorDB

### Frontend
- **Framework:** React 18 / Next.js 14
- **State:** Redux / Zustand
- **Styling:** Tailwind CSS
- **UI Components:** Custom + Shadcn/ui

### AI & Orchestration
- **Agent Framework:** Claude Flow (Alpha)
- **Swarm Intelligence:** Ruv-Swarm (Latest)
- **Cloud Orchestration:** Flow-Nexus (Latest)
- **MCP Protocol:** Model Context Protocol
- **Memory System:** Letta + AgentDB

### DevOps & Infrastructure
- **OS:** Windows 11 (Orchestrator) + WSL2 (Ubuntu 24.04)
- **Containerization:** Docker Desktop with WSL2 backend
- **CI/CD:** GitHub Actions
- **Orchestration:** Kubernetes / Docker Compose
- **Monitoring:** Prometheus + Grafana
- **Logging:** Loki + ELK Stack
- **Secrets:** Infisical (self-hosted secrets management)
- **Tunneling:** Cloudflared (secure worker communication)

## Development Commands

### Monorepo Management

```bash
# Install all dependencies
pnpm install

# Run all apps and services in dev mode
pnpm dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint all workspaces
pnpm lint

# Clean all build artifacts
pnpm clean
```

### Database Operations

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Prisma Studio
pnpm db:studio
```

### Docker Operations

```bash
# Start development stack
pnpm docker:up

# Stop development stack
pnpm docker:down

# Check MCP health
pnpm mcp:health-check
```

### Workspace-Specific Commands

```bash
# Install dependency to specific workspace
pnpm --filter @nyra/auth-service add express

# Run dev for specific app
pnpm --filter mortgage-assistant dev

# Build specific service
pnpm --filter @nyra/lead-capture-api build

# Test specific package
pnpm --filter @nyra/utils test
```

### GitHub PR Maintenance

```bash
# Review open pull requests (requires GITHUB_TOKEN)
scripts/github/review-and-merge-prs.sh --repo ellisapotheosis/Project-Nyra

# Merge all currently eligible PRs (squash) after review
scripts/github/review-and-merge-prs.sh --repo ellisapotheosis/Project-Nyra --merge

# See what would merge without applying changes
scripts/github/review-and-merge-prs.sh --repo ellisapotheosis/Project-Nyra --merge --dry-run
```

## Infrastructure

### Bootstrap System

Project Nyra includes a comprehensive bootstrap system for setting up the 4-PC distributed architecture:

**Components:**
- **GUI Installer** - React-based interactive installer (port 5173)
- **PowerShell Scripts** - Automated component installation
- **Configuration Templates** - Pre-configured settings for:
  - Claude Code / Claude Desktop
  - Claude Flow V3
  - Docker Desktop
  - WSL2 (.wslconfig)
  - Infisical (secrets management)
  - Gitea (self-hosted Git)

**Installation Workflow:**
```powershell
# 1. Run GUI installer
cd bootstrap
pnpm install && pnpm start

# 2. Select PC type (orchestrator/worker/standalone)

# 3. Choose components to install:
#    - Docker Desktop
#    - WSL2 + Ubuntu
#    - Claude Flow
#    - Development tools
#    - Configuration templates

# 4. Installer handles:
#    - Component detection
#    - Dependency validation
#    - Configuration deployment
#    - Service initialization
```

**Configuration Templates:**
See [bootstrap/configs/README.md](bootstrap/configs/README.md) for details on all available templates.

### Orchestration Stack

**Services Running:**
- PostgreSQL (Port: 5432) - Primary database
- Redis (Port: 6379) - Cache layer
- FalkorDB (Port: 6380) - Graph database
- Qdrant (Port: 6333) - Vector database
- Claude Flow - Multi-agent orchestration
- Archon OS - Agent operating system
- Nexus Router - LLM routing
- Letta (Ports: 8283, 8284) - Agent memory

**Start Orchestration Stack:**
```bash
cd infra/docker
docker compose -f docker-compose.orchestration.yml up -d
```

**Archon Full Stack (Dedicated Compose + Nexus Router + Infisical):**
```bash
# Validate compose
make archon-config

# Start dedicated Archon profile stack
make archon-up

# Start with Infisical secret injection (/shared path)
make archon-up-infisical
# equivalent direct command:
# infisical run --env=prod --path="/shared" -- docker compose -f docker-compose.archon.yml --profile archon up -d
```

### Port Allocation

See [Services README](services/README.md) for complete port allocation table.

### Windows/WSL Hybrid Architecture

**Orchestrator PC Configuration:**
- **Host OS:** Windows 11 Pro
- **Container Runtime:** Docker Desktop with WSL2 backend
- **WSL Distribution:** Ubuntu 24.04 LTS
- **Memory Allocation:** 8GB (configurable in `.wslconfig`)
- **CPU Cores:** 4 (configurable in `.wslconfig`)

**Key Benefits:**
- Native Windows tooling (PowerShell, VS Code, etc.)
- Linux container compatibility via WSL2
- GPU passthrough to worker PCs via network
- Efficient resource management

## Multi-Agent System

### Agent Types

**Core Development Agents:**
- `coder` - Implementation and code generation
- `reviewer` - Code review and quality assurance
- `tester` - Test creation and execution
- `planner` - Task planning and breakdown
- `researcher` - Information gathering and analysis

**Specialized Agents:**
- `system-architect` - Architecture design
- `backend-dev` - Backend development
- `frontend-specialist` - Frontend development
- `cicd-engineer` - DevOps and CI/CD
- `ml-developer` - Machine learning

### Swarm Configuration

```yaml
Topology: mesh | hierarchical | ring | star
Max Agents: 100
Auto-Scaling: enabled
Strategy: balanced | specialized | adaptive
```

### Using the Agent System

```bash
# Initialize a swarm
npx claude-flow swarm:init --topology=mesh

# Spawn an agent
npx claude-flow agent:spawn --type=coder

# Orchestrate a task
npx claude-flow task:orchestrate --task="Implement user authentication"

# Check swarm status
npx claude-flow swarm:status
```

## Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint + Prettier
- **Testing:** Jest + Testing Library
- **Commits:** Conventional Commits format
- **Documentation:** Update docs with code changes

## Troubleshooting

### Common Issues

**Bootstrap installer won't start:**
```powershell
# Ensure Node.js 20+ and pnpm 10+ are installed
node --version  # Should be 20+
pnpm --version  # Should be 10+

# Install dependencies
cd bootstrap
pnpm install

# Start installer
pnpm start
```

**Configuration templates not copying:**
```powershell
# Run PowerShell as Administrator
# Navigate to bootstrap/scripts
cd bootstrap/scripts

# Run specific component installer
.\install-claude-code.ps1
```

**pnpm install fails:**
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

**Docker services won't start:**
```bash
# Check logs
docker compose -f infra/docker/docker-compose.orchestration.yml logs

# Restart services
docker compose -f infra/docker/docker-compose.orchestration.yml restart

# Full reset
docker compose -f infra/docker/docker-compose.orchestration.yml down -v
docker compose -f infra/docker/docker-compose.orchestration.yml up -d
```

**Database connection errors:**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# Check connection string in .env
echo $DATABASE_URL

# Run migrations
pnpm db:migrate
```

**MCP server not responding:**
```bash
# Check MCP health
pnpm mcp:health-check

# View MCP logs
docker logs nyra-claude-flow
```

## Support

- **Documentation:** [docs/](docs/)
- **Bootstrap Guide:** [bootstrap/README.md](bootstrap/README.md)
- **Configuration Help:** [bootstrap/configs/README.md](bootstrap/configs/README.md)
- **Component Guides:** See [CLAUDE.md](CLAUDE.md#-component-guide-index) for tech-stack-specific docs
- **Issues:** [GitHub Issues](https://github.com/your-org/project-nyra/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/project-nyra/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Claude AI** by Anthropic - AI capabilities
- **Flow-Nexus** - Cloud orchestration platform
- **Ruv-Swarm** - Multi-agent coordination
- **Open Source Community** - Amazing tools and libraries

---

**Built with ❤️ by the Project Nyra Team**

**Last Updated:** January 21, 2026

## How to Run the Consolidated Stack

### Oracle VM (production plane)
- `make up-oracle`
- `make health-oracle`
- `make logs-oracle`
- `make down-oracle`

### Orchestrator PC (control plane)
- `make up-orchestrator`
- `make health-orchestrator`
- `make logs-orchestrator`
- `make down-orchestrator`

### GPU Workers (inference plane, tailnet only)
- `make up-workers`
- `make health-workers`
- `make down-workers`

### Cloudflared baseline hostnames
- `ratehunter.net` (landing via Cloudflare Pages)
- `app.ratehunter.net`
- `admin.ratehunter.net`
- `api.ratehunter.net`
- `hooks.ratehunter.net`
- `nexus.ratehunter.net`
- `litellm.ratehunter.net`

## Operator Checklist

1. Provision Oracle VM and attach persistent volumes for Postgres/Redis.
2. Configure Cloudflare Access applications for all non-landing hostnames.
3. Put runtime secrets in `.env` (never commit secrets).
4. Bring up Oracle, then Orchestrator, then Workers.
5. Run `make audit-ports` and `make audit-env` after any infra change.

## HOW TO RUN THE STACK

### Oracle stack (single VM)
```bash
make up-oracle
make health-oracle
```

### Orchestrator stack (home control plane)
```bash
make up-orchestrator
make health-orchestrator
```

### Worker nodes (3 GPU PCs)
```bash
make up-workers
make health-workers
```

### TwentyCRM (temporarily in-repo)
```bash
make up-twenty
make health-twenty
```

### Cloudflared baseline hostnames
- `ratehunter.net` (landing)
- `app.ratehunter.net` (webapp)
- `admin.ratehunter.net` (admin, Access-protected)
- `api.ratehunter.net` (quote-api)
- `hooks.ratehunter.net` (webhooks)

## Operator Checklist

1. **Cloudflare Access apps**
   - Create Access policies for `admin.ratehunter.net` and Twenty endpoints.
   - Confirm only intended public hostnames are exposed.
2. **Oracle provisioning**
   - Create Oracle VM, attach persistent volume, install Docker/Compose.
   - Place `infra/oracle/.env.example` values into real `.env`.
3. **Secrets setup**
   - Load secrets into Infisical.
   - Sync runtime env into oracle/orchestrator/workers stacks.

## TwentyCRM Future Extraction Handoff
- Keep upstream under `apps/twenty` as isolated boundary.
- Keep Nyra adapters in `packages/clients/twenty` + service integrations.
- Use `docs/apps/TWENTY_EXTRACTION_PLAN.md` when splitting into sibling repo.
