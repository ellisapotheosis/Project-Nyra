# Quick Start Guide - Project Nyra Infrastructure

> Get your complete development environment running in 5 minutes

## Prerequisites

- **Docker Desktop** 20.10+ (with Docker Compose V2)
- **8GB RAM minimum** (16GB+ recommended)
- **50GB free disk space**
- **Windows 10/11**, macOS, or Linux

## 5-Minute Setup

### Step 1: Clone Repository (30 seconds)

```bash
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra/infra
```

### Step 2: Initialize Environment (1 minute)

```bash
make init
```

This will:
- Check Docker prerequisites
- Create `.env` file from template
- Build Docker images (cached after first time)
- Start core services (PostgreSQL, Redis, MongoDB)

### Step 3: Configure API Keys (2 minutes)

Edit `.env` and add your API keys:

```bash
nano .env  # or code .env, vim .env, etc.
```

**Required minimum configuration:**

```bash
# AI/LLM API Keys
ANTHROPIC_API_KEY=sk-ant-api03-...           # Get from: https://console.anthropic.com
OPENROUTER_API_KEY=sk-or-v1-...              # Get from: https://openrouter.ai/keys

# Database Passwords (use strong passwords!)
POSTGRES_PASSWORD=change_me_secure_password
REDIS_PASSWORD=change_me_redis_password
MONGO_ROOT_PASSWORD=change_me_mongo_password

# Secret Management
INFISICAL_ENCRYPTION_KEY=generate_32_char_key_here
INFISICAL_JWT_SECRET=generate_jwt_secret_here

# Service Secrets
DIFY_SECRET_KEY=generate_dify_secret
TWENTY_ACCESS_TOKEN_SECRET=generate_twenty_secret
N8N_BASIC_AUTH_PASSWORD=your_n8n_password
```

**Quick password generation:**

```bash
# Generate secure random passwords
openssl rand -base64 32    # For passwords
openssl rand -hex 16       # For encryption keys
```

### Step 4: Start All Services (1 minute)

```bash
make up
```

This starts **40+ services** in the correct dependency order:
- Core databases (PostgreSQL, Redis, MongoDB, Neo4j)
- AI orchestration (Claude Flow, Archon, Nexus Router)
- Memory systems (Letta, Mem0, Graphiti)
- Business services (Quote API, Campaign Engine, TwentyCRM)
- Development tools (Gitea, n8n, Activepieces)
- Monitoring (Prometheus, Grafana, Loki)

### Step 5: Verify Everything Works (1 minute)

```bash
# Check service health
make health

# View service URLs
make urls
```

## Access Your Services

Once running, access these web interfaces:

### AI & Orchestration
- **Claude Flow**: http://localhost:3000
- **Archon OS**: http://localhost:8000
- **Nexus Router**: http://localhost:6000
- **Letta (Memory)**: http://localhost:8283

### Business Applications
- **TwentyCRM**: http://localhost:3000
- **Dify**: http://localhost:3002
- **Quote API**: http://localhost:8089/docs (Swagger UI)

### Development Tools
- **Gitea**: http://localhost:3001
- **n8n**: http://localhost:5678
- **Activepieces**: http://localhost:8082

### Monitoring & Admin
- **Grafana**: http://localhost:3003 (admin/[your GRAFANA_ADMIN_PASSWORD])
- **Prometheus**: http://localhost:9090
- **pgAdmin**: http://localhost:5050
- **Infisical**: http://localhost:8080
- **MinIO Console**: http://localhost:9001

## Next Steps

### 1. Test the API

Test the Quote API:

```bash
curl http://localhost:8089/health

# Example quote calculation
curl -X POST http://localhost:8089/api/v1/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "loan_amount": 300000,
    "interest_rate": 6.5,
    "loan_term_years": 30
  }'
```

### 2. Explore Claude Flow

```bash
# View Claude Flow logs
make logs-claude-flow

# Access Claude Flow shell
make shell-claude-flow
```

### 3. Check Database

```bash
# PostgreSQL shell
make db-shell

# Redis CLI
make redis-cli

# Neo4j browser
open http://localhost:7474
```

### 4. View Logs

```bash
# All services
make logs

# Specific service
make logs-postgres
make logs-nexus
make logs-ai          # All AI services
```

## Common Tasks

### Start/Stop Services

```bash
# Start all
make up

# Start specific groups
make up-core          # Databases only
make up-ai            # AI services
make up-apps          # Business apps
make up-monitoring    # Observability

# Stop all
make down

# Restart
make restart
```

### Development Workflow

```bash
# Start dev environment with URLs
make dev

# View logs filtered by service group
make logs-ai
make logs-core

# Execute commands in containers
docker compose exec postgres psql -U nyra_user -d nyra_db
docker compose exec redis redis-cli
docker compose exec claude-flow sh
```

### Backup Data

```bash
# Backup main database
make db-backup

# Backup all databases
make db-backup-all
```

### Update Services

```bash
# Pull latest images and rebuild
make update

# Rebuild from scratch
make build-nocache
make restart
```

## Selective Service Start

Don't need everything? Start only what you need:

### Minimal (Core Only)
```bash
docker compose up -d postgres redis
```

### AI Development Stack
```bash
docker compose up -d postgres redis nexus litellm claude-flow letta mem0
```

### Full Stack without Monitoring
```bash
docker compose up -d postgres redis mongo \
  claude-flow archon nexus litellm \
  letta mem0 graphiti-mcp \
  twenty-crm dify-api dify-web \
  quote-api campaign-engine
```

### Monitoring Only
```bash
make up-monitoring
```

## Troubleshooting

### Services Won't Start

**Check logs:**
```bash
make logs-<service-name>
```

**Common issues:**
- **Port conflicts**: Service port already in use
  - Solution: Check `netstat -an | grep <port>`, kill conflicting process
- **Missing API keys**: Services fail health checks
  - Solution: Verify `.env` has all required keys
- **Low memory**: Docker out of memory
  - Solution: Increase Docker Desktop memory (Settings → Resources)

### Database Connection Errors

**Verify databases are healthy:**
```bash
make health
docker compose ps postgres redis mongo
```

**Test connections:**
```bash
# PostgreSQL
docker compose exec postgres pg_isready -U nyra_user

# Redis
docker compose exec redis redis-cli ping

# MongoDB
docker compose exec mongo mongosh --eval "db.adminCommand('ping')"
```

### Nexus Router Not Registering Services

**Check Docker labels:**
```bash
docker inspect <service-name> | grep nyra.service
```

**View Nexus logs:**
```bash
make logs-nexus
```

**Check service health endpoints:**
```bash
curl http://localhost:<service-port>/health
```

### Performance Issues

**Check resource usage:**
```bash
make stats
docker stats
```

**Reduce running services:**
```bash
# Stop non-essential services
docker compose stop n8n activepieces gitea langfuse cadvisor
```

**Increase Docker resources:**
- Docker Desktop → Settings → Resources
- Increase CPUs to 4+
- Increase Memory to 8GB+

## Environment-Specific Configurations

### Development
```bash
ENV=dev make up
```
Uses `docker-compose.dev.yml` overrides

### Production
```bash
ENV=prod make up
```
Uses `docker-compose.prod.yml` overrides with:
- Resource limits enforced
- Health checks more aggressive
- Restart policies stricter
- Logging configured for aggregation

## Advanced Usage

### Custom Compose Files

```bash
# Use specific compose files
docker compose -f docker-compose.base.yml \
               -f docker-compose.ai.yml \
               -f docker-compose.custom.yml \
               up -d
```

### Scale Services

```bash
# Run multiple instances
docker compose up -d --scale quote-api=3
```

### Execute One-Off Commands

```bash
# Run database migration
docker compose run --rm django python manage.py migrate

# Execute script
docker compose run --rm claude-flow node scripts/init-db.js
```

## Getting Help

### View All Commands
```bash
make help
```

### Check Infrastructure Info
```bash
make info          # Service counts, architecture
make urls          # All service URLs
make quick-health  # Quick health check
```

### Access Service Shells
```bash
make shell-claude-flow
make shell-archon
make shell-dify
make shell-twenty
```

### Database Shells
```bash
make db-shell          # PostgreSQL
make redis-cli         # Redis
make mongo-shell       # MongoDB
make neo4j-shell       # Neo4j
```

## What's Next?

- **[Architecture Overview](ARCHITECTURE.md)** - Understand the system design
- **[Modular Compose](../docker-compose/README.md)** - Learn about service organization
- **[Nexus Router Integration](NEXUS-ROUTER-INTEGRATION.md)** - Service discovery details
- **[Troubleshooting Guide](TROUBLESHOOTING.md)** - Comprehensive problem solving
- **[Environment Variables](../ENV-VARIABLES-REFERENCE.md)** - Complete configuration reference

## Quick Reference Card

```bash
# Start
make up              # All services
make dev             # Dev environment with URLs

# Stop
make down            # Stop all
make stop-<service>  # Stop specific

# Monitor
make ps              # List containers
make health          # Health checks
make stats           # Resource usage
make logs            # View logs
make logs-<service>  # Service logs

# Database
make db-backup       # Backup PostgreSQL
make db-shell        # PostgreSQL shell
make redis-cli       # Redis CLI

# Maintenance
make update          # Update images
make clean           # Remove stopped containers
make restart         # Restart all

# Help
make help            # Show all commands
make info            # Infrastructure info
make urls            # Service URLs
```

---

**Need help?** Check the [Troubleshooting Guide](TROUBLESHOOTING.md) or open an issue on GitHub.

**Last Updated**: 2026-01-18
