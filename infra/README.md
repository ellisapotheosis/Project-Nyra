# Project Nyra - Infrastructure

> Consolidated Docker infrastructure for the distributed AI mortgage platform

## Overview

Project Nyra's infrastructure consolidates **274 Docker Compose files** into a unified, modular architecture supporting **40+ services** across core databases, AI orchestration, business applications, and observability layers.

**Architecture**: 4-PC Distributed Cluster
**Orchestrator**: Area51 (192.168.1.10)
**GPU Workers**: 3 dedicated workers (RTX 5090, RTX 3090 Ti, RTX 3060)
**Consolidation Date**: 2026-01-18

## Quick Start

```bash
# Clone repository and navigate to infra
cd infra

# Initialize environment (first time only)
make init

# Edit .env with your API keys and passwords
nano .env  # or your preferred editor

# Start all services
make up

# Check service health
make health

# View service URLs
make urls
```

**That's it!** Your complete development environment is running.

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

**Last Updated**: 2026-01-21
**Version**: 1.0.1 (Documentation Update)
**Maintainer**: Project Nyra Team

**Key Documentation:**
- [Architecture Overview](../docs/architecture/ARCHITECTURE-OVERVIEW.md) - Complete system architecture
- [4-PC Distributed Architecture](../docs/architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - Multi-PC deployment guide
- [Project Whitepaper](../docs/WHITEPAPER.md) - Business case and ROI analysis
- [Infisical Secrets Management](../docs/deployment/INFISICAL-SECRETS-REFERENCE.md) - Secrets configuration
