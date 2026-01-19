# Project Nyra - Consolidated Docker Compose

## 📋 Overview

This directory contains the consolidated and canonical docker-compose configuration for Project Nyra, replacing multiple scattered compose files throughout the repository.

**Consolidation Date:** 2026-01-18

## 🏗️ Architecture

The docker-compose configuration is organized into modular, composable files:

```
infra/docker-compose/
├── docker-compose.yml                 # Master file (includes all below)
├── docker-compose.base.yml            # Core: PostgreSQL, Redis
├── docker-compose.databases.yml       # FalkorDB, Qdrant
├── docker-compose.ai.yml              # Nexus, LiteLLM, Letta, Mem0, Open-WebUI
├── docker-compose.crm.yml             # TwentyCRM
├── docker-compose.workflow.yml        # n8n, Dify, Activepieces
├── docker-compose.observability.yml   # Prometheus, Grafana, Loki, Alertmanager
├── docker-compose.orchestrator.yml    # Nyra Orchestrator (main app)
├── docker-compose.business.yml        # Quote Engine, Campaign Engine, Quote API
└── README.md                          # This file
```

## 🚀 Quick Start

### Full Development Environment

```bash
cd infra/docker-compose
docker compose up -d
```

This starts all services in the correct dependency order.

### Selective Service Start

Start only what you need:

```bash
# Core databases only
docker compose up -d postgres redis

# AI stack
docker compose up -d nexus litellm letta mem0

# Full stack with orchestrator (includes all dependencies)
docker compose up -d nyra_orchestrator

# Observability stack
docker compose -f docker-compose.observability.yml up -d
```

## 📦 Service Groups

### Core Services (base)
- **postgres** - PostgreSQL 16 with pgvector (port 5432)
- **redis** - Redis 7 (port 6380)

### Databases
- **falkordb** - Graph database (port 6379)
- **qdrant** - Vector database (port 6333)

### AI Services
- **nexus** - Unified LLM gateway (port 6000)
- **litellm** - LLM proxy (port 4000)
- **letta** - Agent memory management (port 8283)
- **mem0** - Universal memory layer (port 4321)
- **openmemory_mcp** - Mem0 MCP server (port 8081)
- **openwebui** - Chat interface (port 8080)

### CRM
- **twentycrm** - Open source CRM (port 3000)

### Workflow Automation
- **n8n** - Workflow automation (port 5678)
- **dify-api** - Dify API (port 5001)
- **dify-web** - Dify web UI (port 3001)
- **activepieces** - Low-code automation (port 3002)

### Observability
- **prometheus** - Metrics (port 9090)
- **grafana** - Dashboards (port 3005)
- **loki** - Log aggregation (port 3100)
- **promtail** - Log shipper
- **alertmanager** - Alerts (port 9093)
- **node-exporter** - System metrics (port 9100)
- **cadvisor** - Container metrics (port 8080)

### Orchestration
- **nyra_orchestrator** - Main business logic (port 8010)

### Business Services
- **quote-engine** - Quote generation (port 9010)
- **campaign-engine** - Campaign management (port 9020)
- **quote-api** - Quote HTTP API (port 8089)

## 🔧 Configuration

### Environment Variables

1. Copy the example environment file:
   ```bash
   cp ../../.env.example .env
   ```

2. Edit `.env` with your configuration:
   ```bash
   # Required
   ANTHROPIC_API_KEY=sk-ant-...
   OPENROUTER_API_KEY=sk-or-...

   # Database passwords
   POSTGRES_PASSWORD=your_secure_password
   REDIS_PASSWORD=your_redis_password

   # Service ports (optional, defaults provided)
   POSTGRES_PORT=5432
   NEXUS_PORT=6000
   LITELLM_PORT=4000
   # ... etc
   ```

### Custom Configuration Files

Configuration files are referenced from `../../configs/`:

- `configs/nexus/nexus.toml` - Nexus router config
- `configs/litellm/config.yaml` - LiteLLM config
- `configs/observability/prometheus.yml` - Prometheus config
- `configs/observability/grafana-datasources.yml` - Grafana datasources
- etc.

## 📊 Service Dependencies

Services are configured with proper `depends_on` and `healthcheck` directives to ensure correct startup order:

```
postgres, redis (base)
  ↓
falkordb, qdrant (databases)
  ↓
litellm → nexus (AI gateway)
  ↓
letta, mem0 (AI services)
  ↓
nyra_orchestrator (orchestration)
```

## 🛠️ Common Operations

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nyra_orchestrator

# Multiple services
docker compose logs -f postgres redis nexus
```

### Check Status

```bash
docker compose ps
```

### Stop Services

```bash
# Stop all
docker compose down

# Stop specific services
docker compose stop nyra_orchestrator

# Stop and remove volumes (WARNING: deletes data)
docker compose down -v
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart nexus
```

### Update Services

```bash
# Pull latest images
docker compose pull

# Rebuild custom images
docker compose build

# Restart with new images
docker compose up -d --force-recreate
```

## 📈 Resource Limits

Each service has defined resource limits:

- **postgres**: 4GB RAM, 2 CPUs
- **redis**: 2GB RAM, 1 CPU
- **litellm**: 2GB RAM, 1 CPU
- **letta**: 2GB RAM, 1 CPU
- **nyra_orchestrator**: 4GB RAM, 2 CPUs
- etc.

Adjust in individual compose files if needed.

## 🔒 Security Notes

1. **Change default passwords** in `.env` before production use
2. **Review exposed ports** - only expose what's needed on your network
3. **Use secrets management** - Consider using Docker secrets or Infisical
4. **Network isolation** - All services use `nyra-network` bridge network
5. **Volume permissions** - Ensure proper permissions on mounted volumes

## 🧪 Testing

### Health Checks

All services have health checks configured. View status:

```bash
docker compose ps
```

Healthy services show `(healthy)` status.

### Manual Health Checks

```bash
# Postgres
docker exec nyra-postgres pg_isready -U nyra_user

# Redis
docker exec nyra-redis redis-cli ping

# Nexus
curl http://localhost:6000/health

# Letta
curl http://localhost:8283/health

# Orchestrator
curl http://localhost:8010/health
```

## 📁 Data Persistence

All service data is persisted in named volumes:

```
nyra_postgres_data
nyra_redis_data
nyra_falkordb_data
nyra_qdrant_data
nyra_litellm_data
nyra_letta_data
nyra_mem0_data
nyra_grafana_data
nyra_prometheus_data
# ... etc
```

### Backup Volumes

```bash
# List volumes
docker volume ls | grep nyra_

# Backup a volume (example for postgres)
docker run --rm \
  -v nyra_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz /data

# Restore a volume
docker run --rm \
  -v nyra_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /
```

## 🔄 Migration from Old Compose Files

Old compose files have been renamed with `.old` extension:

```
docker-compose.yml → docker-compose.yml.old
infra/docker-compose.dev.yml → infra/docker-compose.dev.yml.old
# etc.
```

To migrate:

1. Review your current `.env` configuration
2. Copy relevant environment variables to new `.env`
3. Stop old stack: `docker compose -f docker-compose.yml.old down`
4. Start new stack: `cd infra/docker-compose && docker compose up -d`
5. Verify services: `docker compose ps`

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nyra Architecture Documentation](../../docs/architecture/)
- [Service Configuration Guide](../../docs/configuration/)
- [Troubleshooting Guide](../../docs/troubleshooting/)

## 🆘 Troubleshooting

### Services Won't Start

1. Check logs: `docker compose logs -f <service_name>`
2. Verify dependencies are healthy: `docker compose ps`
3. Check environment variables: `cat .env`
4. Verify ports aren't in use: `netstat -an | grep <port>`

### Database Connection Issues

1. Verify postgres is healthy: `docker compose ps postgres`
2. Check connection string in service logs
3. Test connection: `docker exec nyra-postgres psql -U nyra_user -d nyra_db -c "SELECT 1"`

### Memory/Performance Issues

1. Check resource usage: `docker stats`
2. Review resource limits in compose files
3. Consider reducing number of running services
4. Increase Docker Desktop memory allocation

## 📝 Support

For issues or questions:

1. Check the [Troubleshooting Guide](../../docs/troubleshooting/)
2. Review service logs: `docker compose logs -f`
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated:** 2026-01-18
**Version:** 1.0.0 (Consolidated)
