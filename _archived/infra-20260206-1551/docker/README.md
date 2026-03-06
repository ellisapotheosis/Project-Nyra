# Project Nyra - Docker Infrastructure

Complete Docker orchestration for Project Nyra's AI-powered mortgage platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Deployment Options](#deployment-options)
- [Service Management](#service-management)
- [Monitoring & Observability](#monitoring--observability)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## Overview

Project Nyra uses a microservices architecture orchestrated with Docker Compose. The infrastructure is organized into three main stacks:

### Stack Options

| Stack | Description | Use Case | File |
|-------|-------------|----------|------|
| **Development** | Hot reload, debug ports, dev tools | Local development | `docker-compose.dev.yml` |
| **Full** | Complete feature set, all services | Testing, demos | `docker-compose.full.yml` |
| **Production** | Security hardened, optimized | Production deployments | `docker-compose.prod.yml` |

### Service Layers

1. **Database Layer**
   - PostgreSQL (primary data store)
   - Redis (caching, sessions, queues)
   - FalkorDB (knowledge graphs)
   - Qdrant (vector database)

2. **Orchestration Layer**
   - Claude Flow (multi-agent workflows)
   - Archon OS (agent operating system)
   - Nexus Router (intelligent LLM routing)

3. **AI Services Layer**
   - Letta (agent memory management)
   - Open-WebUI (primary interface)
   - LobeChat (alternative interface)

4. **Workflow Automation**
   - n8n (workflow automation)

5. **Observability Layer**
   - Prometheus (metrics)
   - Grafana (dashboards)
   - Loki (log aggregation)
   - Promtail (log shipping)
   - Alertmanager (alerts)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interfaces                         │
│  Open-WebUI (3210)  │  LobeChat (3211)  │  Grafana (3000)      │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                      Orchestration Layer                        │
│  Claude Flow (9000) │ Archon OS (9001) │ Nexus Router (8000)   │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                        AI Services Layer                        │
│          Letta (8283)  │  n8n (5678)                            │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                        Database Layer                           │
│  PostgreSQL │ Redis │ FalkorDB │ Qdrant                         │
│    (5432)     (6379)   (6380)    (6333)                         │
└─────────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────┐
│                     Observability Layer                         │
│  Prometheus (9090) │ Loki (3100) │ Alertmanager (9093)         │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Docker Engine 24.0+
- Docker Compose 2.20+
- 8GB+ RAM available
- 50GB+ disk space
- (Optional) Infisical CLI for secret management

### 1. Install Prerequisites

```bash
# Check Docker version
docker --version
docker compose version

# Install Infisical (optional, required for production)
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

### 2. Configure Environment

```bash
cd infra/docker

# Copy example environment file
cp .env.example .env

# Edit with your values
nano .env
```

**Required Environment Variables:**

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-xxx
OPENROUTER_API_KEY=sk-or-xxx

# GitHub Integration
GITHUB_TOKEN=ghp_xxx
GITHUB_OWNER=your-username
GITHUB_REPO=Project-Nyra

# Security
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
SESSION_SECRET=<random-secret>
```

### 3. Start Services

```bash
# Make scripts executable
chmod +x *.sh

# Start development stack
./start-full-stack.sh dev

# OR start full stack
./start-full-stack.sh full

# OR start production stack (requires Infisical)
USE_INFISICAL=true ./start-full-stack.sh prod
```

### 4. Verify Deployment

```bash
# Check health
./health-check.sh

# View logs
./logs-all.sh -f

# Access services
# Open-WebUI: http://localhost:3210
# Grafana: http://localhost:3000
# Claude Flow: http://localhost:9000
```

## Deployment Options

### Development Stack

Optimized for local development with hot reload and debugging.

```bash
./start-full-stack.sh dev
```

**Features:**
- Hot reload for code changes
- Debug ports exposed (9229, 9230, 9231)
- Verbose logging (DEBUG level)
- Development tools included:
  - pgAdmin (PostgreSQL GUI) - http://localhost:5050
  - Redis Commander - http://localhost:8081
  - Portainer - https://localhost:9443
  - Mailhog (Email testing) - http://localhost:8025
- Relaxed security settings
- No resource limits

**Development Workflow:**

```bash
# Edit code in orchestration/claude-flow/
# Changes auto-reload via nodemon

# Attach debugger to port 9229 (Claude Flow)
# VS Code launch.json:
{
  "type": "node",
  "request": "attach",
  "name": "Attach to Claude Flow",
  "port": 9229,
  "address": "localhost",
  "restart": true
}
```

### Full Stack

Complete feature set for testing and demonstrations.

```bash
./start-full-stack.sh full
```

**Features:**
- All services enabled
- Production-like configuration
- Resource limits applied
- Comprehensive observability
- Suitable for integration testing

### Production Stack

Security-hardened, optimized for production deployment.

```bash
# Requires Infisical
infisical login
USE_INFISICAL=true ./start-full-stack.sh prod
```

**Features:**
- Strict resource limits
- Services bound to 127.0.0.1 only
- Security hardening (`no-new-privileges`)
- Optimized logging (compressed, rotated)
- Automatic restart policies
- Health checks with longer timeouts
- Production-grade observability
- Secret management via Infisical

**Production Checklist:**

- [ ] Configure Infisical with production secrets
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable automatic backups
- [ ] Set up monitoring alerts
- [ ] Configure log retention policies
- [ ] Review and harden security settings
- [ ] Set up disaster recovery plan

## Service Management

### Starting Services

```bash
# Start specific environment
./start-full-stack.sh [dev|full|prod]

# With Infisical
USE_INFISICAL=true ./start-full-stack.sh prod

# Start specific services only
docker compose -f docker-compose.dev.yml up -d postgres redis
```

### Stopping Services

```bash
# Graceful stop (preserves data)
./stop-all.sh

# Stop with backup first
./stop-all.sh --backup

# Stop and remove containers
./stop-all.sh --clean

# Stop and remove everything (WARNING: DATA LOSS)
./stop-all.sh --prune
```

### Viewing Logs

```bash
# View all logs
./logs-all.sh

# Follow logs (real-time)
./logs-all.sh -f

# Specific service
./logs-all.sh postgres -f

# Last hour of logs
./logs-all.sh --since 1h

# Filter by pattern
./logs-all.sh --grep ERROR

# Save to file
./logs-all.sh --save /tmp/nyra-logs.txt
```

### Health Checks

```bash
# Quick health check
./health-check.sh

# Detailed information
./health-check.sh --detailed

# Continuous monitoring
./health-check.sh --watch

# JSON output
./health-check.sh --json

# Alert mode (exits 1 if unhealthy)
./health-check.sh --alert
```

### Restarting Services

```bash
# Restart all services
docker compose -f docker-compose.dev.yml restart

# Restart specific service
docker compose -f docker-compose.dev.yml restart postgres

# Force recreate
docker compose -f docker-compose.dev.yml up -d --force-recreate postgres
```

### Scaling Services

```bash
# Scale a service (if stateless)
docker compose -f docker-compose.dev.yml up -d --scale nexus-router=3

# Check running instances
docker compose -f docker-compose.dev.yml ps
```

## Monitoring & Observability

### Grafana Dashboards

Access Grafana at http://localhost:3000

**Default Credentials:**
- Username: `admin`
- Password: `admin` (dev) or from `GRAFANA_ADMIN_PASSWORD` (prod)

**Pre-configured Dashboards:**
1. **System Overview** - CPU, memory, disk, network
2. **Docker Metrics** - Container stats via cAdvisor
3. **Application Metrics** - Service-specific metrics
4. **Database Performance** - PostgreSQL, Redis, Qdrant
5. **Log Analytics** - Loki-based log analysis

### Prometheus Metrics

Access Prometheus at http://localhost:9090

**Key Metrics:**
- `container_cpu_usage_seconds_total` - Container CPU usage
- `container_memory_usage_bytes` - Container memory usage
- `http_requests_total` - HTTP request count
- `http_request_duration_seconds` - Request latency
- `database_connections` - Active DB connections

### Log Aggregation

Logs are centralized in Loki and viewable through Grafana.

**Log Sources:**
- Container stdout/stderr
- Application logs (mounted `/app/logs`)
- System logs (via Promtail)

**Query Examples:**

```logql
# Errors from all services
{container_name=~"nyra-.*"} |= "ERROR"

# Claude Flow logs
{container_name="nyra-claude-flow-dev"}

# Last 5 minutes of errors
{container_name=~"nyra-.*"} |= "ERROR" [5m]
```

### Alerting

Alertmanager is configured at http://localhost:9093

**Default Alerts:**
- Service down for > 5 minutes
- High CPU usage (> 80% for 10 minutes)
- High memory usage (> 90% for 5 minutes)
- Disk space low (< 10% free)
- Database connection errors

**Configure Notifications:**

Edit `observability/alertmanager.yml`:

```yaml
receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
```

## Security

### Secret Management

**Development:**
- Use `.env` file (never commit to git)
- Rotate secrets regularly

**Production:**
- Use Infisical for secret management
- Enable secret rotation
- Audit secret access

### Network Security

**Development:**
- All ports exposed on `0.0.0.0`
- Use `nyra-network` for service isolation

**Production:**
- Services bound to `127.0.0.1` only
- Use reverse proxy (nginx) for external access
- Enable SSL/TLS
- Configure firewall rules

### Container Security

All production containers have:
- `no-new-privileges:true` security option
- Read-only root filesystem (where applicable)
- Non-root user execution
- Resource limits enforced
- Regular image updates

### Database Security

**PostgreSQL:**
- Strong passwords (20+ characters)
- Network isolation
- Regular backups
- SSL connections (production)

**Redis:**
- Password protection
- Command renaming
- Persistence disabled (dev) / enabled (prod)

## Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check Docker daemon
docker info

# Check port conflicts
netstat -tulpn | grep LISTEN

# Check logs
./logs-all.sh

# Remove stale containers
./stop-all.sh --clean
docker system prune -a
```

#### Database Connection Errors

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec nyra-postgres-dev psql -U nyra_user -d nyra_db -c "SELECT 1;"

# Check logs
./logs-all.sh postgres

# Verify credentials in .env
cat .env | grep POSTGRES
```

#### Out of Memory

```bash
# Check memory usage
docker stats

# Increase Docker memory limit (Docker Desktop Settings)
# Or adjust resource limits in compose files

# Restart with more memory
./stop-all.sh
./start-full-stack.sh dev
```

#### Disk Space Issues

```bash
# Check disk usage
df -h

# Clean up Docker
docker system df
docker system prune -a --volumes  # WARNING: Removes data

# Remove old logs
find ./logs -type f -mtime +30 -delete
```

#### Network Issues

```bash
# Recreate network
docker network rm nyra-network
docker network create nyra-network

# Check network connectivity
docker exec nyra-claude-flow-dev ping postgres -c 3

# Inspect network
docker network inspect nyra-network
```

### Debug Mode

Enable debug logging:

```bash
# Edit compose file
environment:
  DEBUG: "*"
  LOG_LEVEL: debug
  NODE_OPTIONS: "--inspect=0.0.0.0:9229"

# Restart service
docker compose -f docker-compose.dev.yml up -d --force-recreate claude-flow
```

### Getting Help

1. Check logs: `./logs-all.sh <service> -f`
2. Verify health: `./health-check.sh --detailed`
3. Check documentation: `docs/`
4. Review issues: GitHub Issues
5. Join Discord: [Project Nyra Discord]

## Advanced Configuration

### Custom Compose Files

Create project-specific overrides:

```yaml
# docker-compose.override.yml
version: '3.8'

services:
  claude-flow:
    environment:
      CUSTOM_VAR: "custom_value"
    ports:
      - "9999:9000"
```

Apply with:

```bash
docker compose -f docker-compose.dev.yml -f docker-compose.override.yml up -d
```

### Resource Tuning

Adjust limits in compose files:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 8G
    reservations:
      cpus: '2.0'
      memory: 4G
```

### Backup and Restore

**Automated Backup:**

```bash
# Create cron job
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/infra/docker/backup.sh

# Backup script
#!/bin/bash
cd /path/to/infra/docker
./stop-all.sh --backup
tar -czf backup-$(date +%Y%m%d).tar.gz backups/
aws s3 cp backup-$(date +%Y%m%d).tar.gz s3://nyra-backups/
```

**Restore:**

```bash
# Stop services
./stop-all.sh

# Restore volumes
docker run --rm -v postgres_prod_data:/data -v $(pwd)/backups:/backup \
  alpine sh -c "cd /data && tar xzf /backup/postgres_backup.tar.gz"

# Start services
./start-full-stack.sh prod
```

### Performance Optimization

**Database:**
```ini
# PostgreSQL tuning
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
work_mem = 64MB
```

**Redis:**
```bash
# Redis tuning
maxmemory 8gb
maxmemory-policy allkeys-lru
save ""  # Disable RDB in dev
appendonly yes  # Enable AOF in prod
```

### Multi-Environment Setup

Use environment-specific files:

```bash
# Load dev environment
export $(cat .env.dev | xargs)
./start-full-stack.sh dev

# Load staging environment
export $(cat .env.staging | xargs)
./start-full-stack.sh full

# Load production environment
infisical run --env=prod -- ./start-full-stack.sh prod
```

## Service URLs

### Development Stack

| Service | URL | Credentials |
|---------|-----|-------------|
| Open-WebUI | http://localhost:3210 | Create account |
| Claude Flow | http://localhost:9000 | N/A |
| Nexus Router | http://localhost:8000 | N/A |
| Letta | http://localhost:8283 | Password in env |
| n8n | http://localhost:5678 | nyra / changeme |
| Grafana | http://localhost:3000 | admin / admin |
| Prometheus | http://localhost:9090 | N/A |
| pgAdmin | http://localhost:5050 | admin@nyra.dev / admin |
| Redis Commander | http://localhost:8081 | N/A |
| Portainer | https://localhost:9443 | Create account |
| Mailhog | http://localhost:8025 | N/A |

### Production Stack

| Service | URL | Credentials |
|---------|-----|-------------|
| Open-WebUI | http://localhost:3210 | From Infisical |
| Grafana | http://localhost:3000 | From Infisical |

All other services bound to 127.0.0.1 only.

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](../../LICENSE) for details.

## Support

- Documentation: `docs/`
- Issues: GitHub Issues
- Discord: [Project Nyra Discord]
- Email: support@projectnyra.dev
