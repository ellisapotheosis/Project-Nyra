# Project Nyra - Infrastructure

> Queen Coordinator: 15-Agent Swarm Orchestration System
> Consolidated Docker infrastructure for the distributed AI mortgage platform
> Claude Flow V3 Alpha with AgentDB, RuVector, and Multi-GPU Workers

## Queen Coordinator Status

**Swarm Configuration**: 15 agents, hierarchical-mesh topology
**All components validated**:
- Nexus Router (port 6000) - LLM Gateway
- Claude Flow @alpha (port 3010) - Multi-agent orchestration
- AgentDB (port 8080) - HNSW vector database
- RuVector (port 8888) - Memory optimization (SONA/MoE/Flash Attention)
- Open-WebUI (port 3333) - Development chat interface
- Worker setup scripts with Infisical integration

## Overview

Project Nyra's infrastructure consolidates **274 Docker Compose files** into a unified, modular architecture supporting **40+ services** across core databases, AI orchestration, business applications, and observability layers.

**Architecture**: 4-PC Distributed Cluster
**Orchestrator**: Area51 (192.168.1.10)
**GPU Workers**: 3 dedicated workers (RTX 5090, RTX 3090 Ti, RTX 3060)
**Consolidation Date**: 2026-01-18

## Quick Start

### PowerShell (Recommended for Windows)

```powershell
# Navigate to infrastructure scripts
cd C:\Dev\Projects\Repos\Project-Nyra\infra\scripts

# Start all services (includes Infisical secrets)
.\start-all.ps1

# Or skip Infisical (use .env files)
.\start-all.ps1 -SkipInfisical

# Check status
.\start-all.ps1 -Status

# Open dashboards
.\start-all.ps1 -Dashboard

# Stop all services
.\start-all.ps1 -Down

# Include GPU workers
.\start-all.ps1 -Workers
```

### Makefile (Linux/macOS)

```bash
# Initialize environment (first time only)
make init

# Edit .env with your API keys and passwords
nano .env

# Start all services
make up

# Check service health
make health

# View service URLs
make urls
```

**That's it!** Your complete development environment is running.

## Worker PC Setup (3 GPU Workers)

### Worker RTX 5090 (PC2) - High-Performance Inference

```powershell
# On the RTX 5090 worker machine
cd C:\Dev\Projects\Repos\Project-Nyra\infra\scripts\workers

.\setup-worker-5090.ps1 -Install      # First-time setup
.\setup-worker-5090.ps1 -SyncSecrets  # Sync from Infisical
.\setup-worker-5090.ps1 -Start        # Start services
.\setup-worker-5090.ps1 -PullModels   # Download DeepSeek-R1 236B (~220GB)
.\setup-worker-5090.ps1 -Status       # Check health
```

**Ports**: Ollama (11435), vLLM (8000), Neo4j (7474), FalkorDB (6380), Metrics (9002)
**Models**: DeepSeek-R1 236B, Qwen 72B

### Worker RTX 3090 Ti (PC4) - Monitoring Stack

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\scripts\workers

.\setup-worker-3090ti.ps1 -Install
.\setup-worker-3090ti.ps1 -SyncSecrets
.\setup-worker-3090ti.ps1 -Start
.\setup-worker-3090ti.ps1 -Status
```

**Ports**: Prometheus (9091), Grafana (3006), Loki (3101), Alertmanager (9094)
**Retention**: Metrics 90 days, Logs 30 days

### Worker RTX 3060 (PC3) - Code Generation

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\scripts\workers

.\setup-worker-3060.ps1 -Install
.\setup-worker-3060.ps1 -SyncSecrets
.\setup-worker-3060.ps1 -Start
.\setup-worker-3060.ps1 -PullModels   # Download CodeLlama, Qwen 32B (~70GB)
.\setup-worker-3060.ps1 -Status
```

**Ports**: Ollama (11434), LiteLLM (4001), Redis (6380), Metrics (9001)
**Models**: CodeLlama 34B, Qwen 2.5 32B, nomic-embed-text

## Documentation

### Essential Guides

- **[Quick Start Guide](docs/QUICK-START.md)** - Get running in 5 minutes
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and service layers
- **[Modular Compose Files](docker-compose/README.md)** - How to use modular compose structure
- **[Nexus Router Integration](docs/NEXUS-ROUTER-INTEGRATION.md)** - Service discovery and routing
- **[Troubleshooting Guide](docs/TROUBLESHOOTING.md)** - Common issues and solutions
- **[Migration Guide](docs/MIGRATION-GUIDE.md)** - Migrating from old structure

### Architecture References

- **[Docker Canonical Design](../docs/architecture/docker-canonical-design.md)** - Design principles and structure
- **[Nexus Router Architecture](../docs/architecture/nexus-router-integration-design.md)** - Gateway and service mesh
- **[Environment Variables](ENV-VARIABLES-REFERENCE.md)** - Complete variable reference

### Operational Guides

- **[Makefile Commands](docs/MAKEFILE-REFERENCE.md)** - All available make commands
- **[Scripts Reference](SCRIPTS-QUICK-REFERENCE.md)** - Utility scripts documentation
- **[Service Management](docs/SERVICE-MANAGEMENT.md)** - Start, stop, scale services

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  Claude Code, Web UI, API Clients, External Integrations    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXUS ROUTER LAYER                         │
│  Port 6000 - Unified MCP + LLM Gateway                      │
│  - MCP Server Aggregation (22+ servers)                     │
│  - LLM Model Routing (Claude, Gemini, OpenRouter)           │
│  - Authentication & Authorization                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬──────────────────┐
       │               │               │                  │
       ▼               ▼               ▼                  ▼
┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│   CORE      │ │     AI      │ │  BUSINESS    │ │ MONITORING   │
│ PostgreSQL  │ │ Claude Flow │ │  Quote API   │ │ Prometheus   │
│   Redis     │ │   Archon    │ │ Campaign Eng │ │   Grafana    │
│   MongoDB   │ │   Letta     │ │  TwentyCRM   │ │     Loki     │
│   Neo4j     │ │    Mem0     │ │    Dify      │ │  Langfuse    │
└─────────────┘ └─────────────┘ └──────────────┘ └──────────────┘
```

## Service Groups

### Core Infrastructure (Always Running)
- **PostgreSQL 16** - Primary database with pgvector
- **Redis 7** - Cache and message broker
- **MongoDB 7** - Document store (Infisical backend)
- **Neo4j 5** - Graph database
- **FalkorDB** - Redis-based graph database
- **Qdrant** - Vector database

### AI/MCP Orchestration Layer
- **Claude Flow** - Multi-agent orchestration (port 3000)
- **Archon OS** - AI operating system framework (port 8000)
- **Nexus Router** - Unified MCP/LLM gateway (port 6000)
- **LiteLLM** - LLM proxy and load balancer (port 4000)
- **Graphiti MCP** - Knowledge graph memory (port 8001)
- **Mem0** - Universal memory layer (port 4321)
- **Letta** - Agent memory management (port 8283)

### Business Applications
- **Quote API** - Mortgage quote calculation (port 8089)
- **Campaign Engine** - Drip campaign service (port 8020)
- **TwentyCRM** - Customer relationship management (port 3000)
- **Dify** - LLM application builder (port 3001/3002)

### Development Tools
- **Gitea** - Self-hosted Git service (port 3001)
- **n8n** - Workflow automation (port 5678)
- **Activepieces** - Low-code automation (port 8082)

### Monitoring & Observability
- **Prometheus** - Metrics collection (port 9090)
- **Grafana** - Visualization dashboards (port 3003)
- **Loki** - Log aggregation (port 3100)
- **AlertManager** - Alert routing (port 9093)
- **Langfuse** - LLM observability (port 3004)
- **cAdvisor** - Container metrics (port 8081)

### Storage & Admin
- **MinIO** - S3-compatible object storage (port 9000)
- **pgAdmin** - PostgreSQL admin UI (port 5050)
- **Infisical** - Secret management (port 8080)

## Common Operations

### Service Management

```bash
# Start specific service groups
make up-core         # Databases only
make up-ai           # AI/MCP services
make up-apps         # Business applications
make up-monitoring   # Observability stack

# View logs
make logs            # All services
make logs-ai         # AI services only
make logs-postgres   # Specific service

# Check health
make health          # Service health status
make ps              # List running containers
make stats           # Resource usage

# Database operations
make db-backup       # Backup main database
make db-shell        # Open PostgreSQL shell
make redis-cli       # Open Redis CLI
```

### Development Workflow

```bash
# Start dev environment
make dev

# View all service URLs
make urls

# Execute shell in service
make shell-claude-flow
make shell-archon

# Restart specific service
make restart-nexus
```

### Production Deployment

```bash
# Initialize with secure passwords
make init-prod

# Start production environment
make prod

# Run security scan
make security

# Backup all databases
make db-backup-all
```

## Environment Configuration

### Required Environment Variables

```bash
# API Keys (Required)
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GOOGLE_GEMINI_API_KEY=...

# Database Passwords (Required)
POSTGRES_PASSWORD=secure_password_here
REDIS_PASSWORD=secure_redis_password
MONGO_ROOT_PASSWORD=secure_mongo_password

# Secret Management (Required)
INFISICAL_ENCRYPTION_KEY=32_char_encryption_key
INFISICAL_JWT_SECRET=jwt_secret_here

# Service Secrets (Required)
DIFY_SECRET_KEY=dify_secret
TWENTY_ACCESS_TOKEN_SECRET=twenty_secret
N8N_BASIC_AUTH_PASSWORD=n8n_password
```

Copy `.env.example` to `.env` and fill in your values.

See **[ENV-VARIABLES-REFERENCE.md](ENV-VARIABLES-REFERENCE.md)** for complete documentation.

## Modular Compose Structure

The infrastructure uses a modular, composable approach:

```
infra/docker-compose/
├── docker-compose.yml                 # Master file (includes all)
├── docker-compose.base.yml            # Core databases
├── docker-compose.databases.yml       # Vector/graph databases
├── docker-compose.ai.yml              # AI/MCP services
├── docker-compose.crm.yml             # CRM systems
├── docker-compose.workflow.yml        # Automation tools
├── docker-compose.observability.yml   # Monitoring stack
├── docker-compose.orchestrator.yml    # Main orchestrator
└── docker-compose.business.yml        # Business logic services
```

Start individual stacks:

```bash
cd docker-compose

# Just databases
docker compose -f docker-compose.base.yml up -d

# AI stack with dependencies
docker compose -f docker-compose.base.yml \
               -f docker-compose.ai.yml up -d

# Everything
docker compose up -d
```

## Nexus Router Integration

All services register automatically with **Nexus Router** (port 6000) using Docker labels:

```yaml
labels:
  - "nyra.service.name=twentycrm"
  - "nyra.service.type=mcp-server"
  - "nyra.mcp.enabled=true"
  - "nyra.mcp.transport=http"
  - "nyra.mcp.port=3000"
  - "nyra.mcp.keywords=crm,contacts,leads"
  - "nyra.mcp.priority=1"
  - "nyra.policy=borrower_minimal_tools"
```

Services are automatically discovered, health-checked, and routed through the Nexus gateway.

See **[NEXUS-ROUTER-INTEGRATION.md](docs/NEXUS-ROUTER-INTEGRATION.md)** for details.

## Networking

All services communicate on a shared bridge network:

```yaml
networks:
  nyra-network:
    driver: bridge
    subnet: 172.20.0.0/16
```

- **Internal communication**: Use service names (e.g., `http://postgres:5432`)
- **External access**: Exposed ports (e.g., `http://localhost:3000`)
- **Service discovery**: Automatic via Docker DNS

## Data Persistence

All data persists in named Docker volumes:

```bash
# List volumes
docker volume ls | grep nyra

# Backup volume
docker run --rm -v nyra_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore volume
docker run --rm -v nyra_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

Use `make db-backup` for database-specific backups.

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Services won't start | Check `docker compose logs <service>`, verify `.env` variables |
| Port conflicts | Check `netstat -an \| grep <port>`, adjust ports in `.env` |
| Database connection errors | Ensure core services healthy: `make health` |
| Nexus registration fails | Check Docker labels, verify service health endpoint |

See **[TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** for comprehensive guide.

## Migration from Old Structure

If you're migrating from the old scattered docker-compose files:

1. **Stop old stack**: `docker compose -f docker-compose.yml.old down`
2. **Backup volumes**: `make db-backup-all`
3. **Copy environment**: Transfer `.env` variables to new structure
4. **Start new stack**: `cd infra && make up`
5. **Verify services**: `make health`

See **[MIGRATION-GUIDE.md](docs/MIGRATION-GUIDE.md)** for detailed steps.

## Performance & Resource Limits

Each service has defined resource limits:

- **PostgreSQL**: 4 CPUs, 4GB RAM
- **Claude Flow**: 4 CPUs, 8GB RAM
- **Archon**: 4 CPUs, 8GB RAM
- **Redis**: 2 CPUs, 2GB RAM

Adjust in compose files if needed. Monitor with:

```bash
make stats    # Real-time resource usage
docker stats  # Live container stats
```

## Security

### Best Practices

- **Change all default passwords** in `.env` before production
- **Use Infisical** for secret management in production
- **Scan images regularly**: `make security`
- **Review exposed ports**: Only expose necessary services
- **Use Docker secrets**: For sensitive production data

### Security Scanning

```bash
# Scan all images
make security

# Run security audit
make security-audit

# Check for exposed secrets
make secrets-check
```

## Support & Resources

### Documentation
- **Architecture**: See `docs/architecture/`
- **Configuration**: See `.env.example` and `ENV-VARIABLES-REFERENCE.md`
- **Scripts**: See `SCRIPTS-QUICK-REFERENCE.md`

### Getting Help
- **Logs**: `make logs-<service>`
- **Health checks**: `make health`
- **Service shells**: `make shell-<service>`
- **Database access**: `make db-shell`, `make redis-cli`

### Useful Commands

```bash
make help           # Show all commands
make info           # Infrastructure information
make urls           # All service URLs
make quick-health   # Quick health check
```

## Project Structure

```
infra/
├── docker-compose/           # Modular compose files
│   ├── docker-compose.yml
│   ├── docker-compose.*.yml
│   └── README.md
├── docker/                   # Consolidated docker configs
│   ├── docker-compose.yml    # Legacy unified compose
│   └── ...
├── configs/                  # Service configurations
│   ├── nexus/
│   ├── litellm/
│   ├── observability/
│   └── ...
├── docs/                     # Documentation
│   ├── QUICK-START.md
│   ├── ARCHITECTURE.md
│   ├── NEXUS-ROUTER-INTEGRATION.md
│   └── TROUBLESHOOTING.md
├── scripts/                  # Utility scripts
│   ├── health-check.sh
│   └── ...
├── Makefile                  # Infrastructure automation
├── README.md                 # This file
└── ENV-VARIABLES-REFERENCE.md
```

## Contributing

When adding new services:

1. Add to appropriate modular compose file
2. Include Docker labels for Nexus registration
3. Define health checks
4. Set resource limits
5. Update documentation

See **[Docker Canonical Design](../docs/architecture/docker-canonical-design.md)** for design principles.

## License

[Your License Here]

## Changelog

### 2026-01-18 - Infrastructure Consolidation
- Consolidated 274 docker-compose files into modular structure
- Implemented Nexus Router service mesh
- Added comprehensive documentation
- Created Makefile with 50+ commands
- Standardized environment variable management

---

## Complete Port Mapping Reference

### Orchestrator (PC1)

| Port | Service | Purpose |
|------|---------|---------|
| **3010** | Claude Flow V3 | Multi-agent swarm orchestration |
| **6000** | Nexus Router | LLM gateway, model routing |
| **8080** | AgentDB | HNSW vector database |
| **8888** | RuVector | Memory optimization (SONA/MoE) |
| **3333** | Open-WebUI | Development chat (NOT borrower) |
| **8082** | Infisical | Secrets management |
| **8283** | Letta | Stateful agent memory |
| **4321** | Mem0 | Universal memory layer |
| **4000** | LiteLLM | Model proxy |
| **5432** | PostgreSQL | Primary database |
| **6379** | Redis | Cache/sessions |
| **6333** | Qdrant | Vector embeddings |
| **6380** | FalkorDB | Graph database |
| **7474/7687** | Neo4j | Knowledge graph |
| **3000** | TwentyCRM | CRM system |
| **5678** | n8n | Workflow automation |
| **3001/3002** | Dify | Borrower chat |
| **9090** | Prometheus | Metrics |
| **3005** | Grafana | Dashboards |
| **3100** | Loki | Logs |

### Worker RTX 5090 (PC2)

| Port | Service | Purpose |
|------|---------|---------|
| **8000** | vLLM | High-performance inference |
| **11435** | Ollama | DeepSeek-R1, Qwen 72B |
| **7474** | Neo4j | Graph database |
| **6380** | FalkorDB | Knowledge graph |
| **9002** | Metrics | GPU monitoring |
| **8092** | Health | Health check |

### Worker RTX 3060 (PC3)

| Port | Service | Purpose |
|------|---------|---------|
| **11434** | Ollama | CodeLlama, Qwen 32B |
| **4001** | LiteLLM | Local model proxy |
| **6380** | Redis | Local cache |
| **9001** | Metrics | GPU monitoring |
| **8091** | Health | Health check |

### Worker RTX 3090 Ti (PC4)

| Port | Service | Purpose |
|------|---------|---------|
| **9091** | Prometheus | Long-term metrics |
| **3006** | Grafana | Visualization |
| **3101** | Loki | Log aggregation |
| **9094** | Alertmanager | Alerts |
| **9100** | Node Exporter | System metrics |
| **8083** | cAdvisor | Container metrics |
| **8093** | Health | Health check |

---

**Last Updated**: 2026-01-22
**Version**: 2.0.0 (Queen Coordinator Update)
**Maintainer**: Project Nyra Team

**Key Documentation:**
- [Architecture Overview](../docs/architecture/ARCHITECTURE-OVERVIEW.md) - Complete system architecture
- [4-PC Distributed Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - Multi-PC deployment guide
- [Project Whitepaper](../docs/WHITEPAPER.md) - Business case and ROI analysis
- [Infisical Secrets Management](../docs/deployment/INFISICAL-SECRETS-REFERENCE.md) - Secrets configuration
- **Master Startup Script**: `infra/scripts/start-all.ps1`
- **Worker Setup Scripts**: `infra/scripts/workers/setup-worker-*.ps1`
