# Project Nyra

> AI-Powered Mortgage Automation Platform with Multi-Agent Orchestration

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10+-orange)](https://pnpm.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Quick Start

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

**Last Updated:** January 9, 2026

**Active Development:**
- Multi-agent swarm coordination
- Memory system integration
- Microservices deployment
- Docker orchestration

## Architecture

```
Project-Nyra/
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

## Documentation

### Getting Started
- [Quick Start Guide](docs/deployment/QUICK-START.md) - Get up and running in 10 minutes
- [Local Development (Windows)](docs/deployment/LOCAL-DEV-WINDOWS.md) - Windows development setup
- [Linux Deployment](docs/deployment/LINUX-ORCHESTRATOR-DEPLOY.md) - Linux production deployment
- [Environment Setup](docs/guides/environment-setup.md) - Configure your environment

### Architecture
- [System Architecture](docs/architecture/system-architecture.md) - Complete architectural overview
- [Dual Orchestrator Design](docs/architecture/DUAL-ORCHESTRATOR-ARCHITECTURE.md) - Claude Flow + Archon OS integration
- [Memory Systems](docs/architecture/memory-systems.md) - Agent memory architecture
- [API Contracts](docs/architecture/api-contracts.md) - Service interfaces

### Development
- [Apps Overview](apps/README.md) - Frontend applications guide
- [Services Overview](services/README.md) - Backend services guide
- [Deployment Guide](docs/deployment/README.md) - Deployment instructions
- [API Documentation](docs/api/rest-api.md) - REST API reference

### Operations
- [Deployment Status](docs/deployment/DEPLOYMENT-STATUS.md) - Current deployment state
- [Secrets Management](docs/deployment/INFISICAL-SECRETS-REFERENCE.md) - Secrets configuration
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

### DevOps
- **CI/CD:** GitHub Actions
- **Orchestration:** Kubernetes
- **Monitoring:** Prometheus + Grafana
- **Logging:** Loki + ELK Stack
- **Secrets:** Infisical

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

## Infrastructure

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

### Port Allocation

See [Services README](services/README.md) for complete port allocation table.

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

**Last Updated:** January 10, 2026
