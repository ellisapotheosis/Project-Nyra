# Linux Orchestrator Deployment Guide

**Target**: Linux Orchestrator PC (Area51)
**Prerequisites**: Secrets already set in Infisical from Windows PC ✅
**Deployment Time**: ~15 minutes

---

## 🎯 Overview

This guide deploys the full Project Nyra infrastructure on your Linux orchestrator PC. Since you already set the 7 critical secrets from your Windows PC, they're stored in Infisical cloud and ready to use!

### What Gets Deployed

- **PostgreSQL** - Main database (port 5432)
- **Redis** - Cache and message broker (port 6379)
- **FalkorDB** - Graph database (port 6380)
- **Qdrant** - Vector database (port 6333)
- **Letta** - Memory system (with PostgreSQL backend)
- **Claude Flow** - Orchestration layer (port 9000)
- **Archon OS** - Agent system (port 9001)
- **Nexus Router** - Intelligent routing + MCP proxy (port 8000)
- **MCP Servers** - Infisical MCP, Bitwarden MCP, etc.

---

## ✅ Prerequisites Checklist

- [ ] Linux orchestrator PC accessible (SSH or direct)
- [ ] Docker and Docker Compose installed
- [ ] Infisical CLI installed (`npm install -g @infisical/cli`)
- [ ] Infisical logged in (`infisical login`)
- [ ] Git configured with access to Project-Nyra repo
- [ ] Tailscale configured (for GPU worker networking)
- [ ] Ports 5432, 6379, 6380, 6333, 8000, 9000, 9001 available

---

## 📦 Step 1: Clone Repository (If Needed)

```bash
# If not already cloned
cd ~
git clone <your-repo-url> Project-Nyra
cd Project-Nyra

# Or pull latest changes
cd ~/Project-Nyra
git pull origin main
```

---

## 🔐 Step 2: Verify Secrets in Infisical

Your secrets were already set from Windows PC. Let's verify they're accessible:

```bash
# Login to Infisical (if not already logged in)
infisical login

# Verify PostgreSQL password exists
infisical secrets get POSTGRES_PASSWORD \
  --env=dev \
  --path=/shared \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef

# Verify Anthropic API key exists
infisical secrets get ANTHROPIC_API_KEY \
  --env=dev \
  --path=/shared \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef

# See all secrets
infisical secrets get \
  --env=dev \
  --path=/shared \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef
```

**Expected**: You should see your 7 secrets + configuration values (total ~80 variables)

---

## 🐳 Step 3: Install Docker & Docker Compose

### Ubuntu/Debian

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Other Linux Distributions

See: https://docs.docker.com/engine/install/

---

## 🚀 Step 4: Deploy Infrastructure

### Option A: Start All Services (Recommended)

```bash
cd infra/docker

# Create start script if it doesn't exist
cat > start-all.sh << 'EOF'
#!/bin/bash
# Start all Project Nyra services with Infisical secrets

set -e

ENVIRONMENT=${1:-dev}
PROJECT_ID="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
PATH_PREFIX="/shared"

echo "========================================="
echo "Project Nyra - Starting Infrastructure"
echo "========================================="
echo ""
echo "Environment: $ENVIRONMENT"
echo "Project ID: $PROJECT_ID"
echo ""

# Check Infisical CLI
if ! command -v infisical &> /dev/null; then
    echo "ERROR: Infisical CLI not found!"
    echo "Install: npm install -g @infisical/cli"
    exit 1
fi

# Start orchestration stack with Infisical secrets
echo "Starting orchestration services..."
infisical run --env=$ENVIRONMENT --path=$PATH_PREFIX --projectId=$PROJECT_ID -- \
  docker compose -f docker-compose.orchestration.yml up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check health
echo ""
echo "Health Checks:"
echo "  Nexus Router: $(curl -s http://localhost:8000/health | jq -r '.status' 2>/dev/null || echo 'Not ready yet')"
echo "  Claude Flow:  $(curl -s http://localhost:9000/health | jq -r '.status' 2>/dev/null || echo 'Not ready yet')"
echo "  Archon OS:    $(curl -s http://localhost:9001/health | jq -r '.status' 2>/dev/null || echo 'Not ready yet')"
echo ""
echo "PostgreSQL:   docker exec postgresql pg_isready"
echo "Redis:        docker exec redis redis-cli ping"
echo "FalkorDB:     docker exec falkordb redis-cli -p 6379 ping"
echo ""
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Services running:"
echo "  Nexus Router: http://localhost:8000"
echo "  Claude Flow:  http://localhost:9000"
echo "  Archon OS:    http://localhost:9001"
echo ""
echo "View logs: docker compose -f docker-compose.orchestration.yml logs -f"
echo "Stop services: docker compose -f docker-compose.orchestration.yml down"
EOF

chmod +x start-all.sh

# Run the deployment
./start-all.sh dev
```

### Option B: Manual Docker Compose

```bash
cd infra/docker

# Start with Infisical secrets injection
infisical run \
  --env=dev \
  --path=/shared \
  --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
  -- docker compose -f docker-compose.orchestration.yml up -d
```

---

## ✅ Step 5: Verify Deployment

### Check Container Status

```bash
# View all running containers
docker ps

# Expected containers:
# - postgresql
# - redis
# - falkordb
# - qdrant
# - letta
# - claude-flow
# - archon-os
# - nexus-router
# - infisical-mcp
# - bitwarden-mcp
```

### Health Checks

```bash
# Nexus Router
curl http://localhost:8000/health
curl http://localhost:8000/

# Claude Flow
curl http://localhost:9000/health

# Archon OS
curl http://localhost:9001/health

# PostgreSQL
docker exec postgresql pg_isready

# Redis
docker exec redis redis-cli ping

# FalkorDB
docker exec falkordb redis-cli -p 6379 ping

# Qdrant
curl http://localhost:6333/health
```

### View Logs

```bash
# All services
docker compose -f docker-compose.orchestration.yml logs -f

# Specific service
docker compose -f docker-compose.orchestration.yml logs -f nexus-router
docker compose -f docker-compose.orchestration.yml logs -f claude-flow
docker compose -f docker-compose.orchestration.yml logs -f postgresql
```

---

## 🧪 Step 6: Test Fuzzy Tool Search

```bash
# List MCP servers
curl http://localhost:8000/mcp/servers | jq

# Get all tools
curl http://localhost:8000/mcp/tools | jq

# Fuzzy search for database tools
curl "http://localhost:8000/mcp/tools/search?q=database&limit=5" | jq

# Fuzzy search for file operations
curl "http://localhost:8000/mcp/tools/search?q=file%20read&limit=10" | jq

# Search for git operations
curl "http://localhost:8000/mcp/tools/search?q=git%20commit&limit=5" | jq
```

---

## 🔧 Step 7: Configure GPU Workers

### Update Tailscale Hostnames

If your Tailscale hostnames differ from defaults, update Infisical:

```bash
# Check current worker URLs
infisical secrets get WORKER_5090_URL --env=dev --path=/shared
infisical secrets get WORKER_3090_URL --env=dev --path=/shared
infisical secrets get WORKER_3060_URL --env=dev --path=/shared

# Update if needed (example for your actual Tailscale hostnames)
infisical secrets set \
  WORKER_5090_URL=http://your-5090-hostname.tail-xxxxx.ts.net:11434 \
  WORKER_3090_URL=http://your-3090-hostname.tail-xxxxx.ts.net:11434 \
  WORKER_3060_URL=http://your-3060-hostname.tail-xxxxx.ts.net:11434 \
  --env=dev --path=/shared --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef

# Restart services to pick up new config
docker compose -f docker-compose.orchestration.yml restart
```

### Test Worker Connectivity

```bash
# From orchestrator, test connectivity to each worker
curl http://worker-5090.tail-net.ts.net:11434/api/version
curl http://worker-3090.tail-net.ts.net:11434/api/version
curl http://worker-3060.tail-net.ts.net:11434/api/version

# Or use actual hostnames from Tailscale
tailscale status  # See all devices
```

---

## 📊 System Monitoring

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Individual container logs
docker logs nexus-router --tail 100 -f
docker logs claude-flow --tail 100 -f
docker logs postgresql --tail 100 -f
```

### Database Connections

```bash
# PostgreSQL
docker exec -it postgresql psql -U nyra -d nyra_production

# Check databases
\l

# Check Letta database
\c letta
\dt

# Exit
\q

# Redis
docker exec -it redis redis-cli
PING
INFO stats
EXIT

# FalkorDB (graph database)
docker exec -it falkordb redis-cli -p 6379
PING
GRAPH.LIST
EXIT
```

---

## 🛑 Managing Services

### Stop Services

```bash
cd infra/docker

# Stop all services
docker compose -f docker-compose.orchestration.yml down

# Stop and remove volumes (CAREFUL - deletes data!)
docker compose -f docker-compose.orchestration.yml down -v
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.orchestration.yml restart

# Restart specific service
docker compose -f docker-compose.orchestration.yml restart nexus-router
```

### Update and Redeploy

```bash
# Pull latest code
git pull origin main

# Rebuild images
docker compose -f docker-compose.orchestration.yml build

# Recreate containers
docker compose -f docker-compose.orchestration.yml up -d --force-recreate
```

---

## 🆘 Troubleshooting

### "No secrets found"

```bash
# Make sure you're logged in
infisical login

# Verify project ID and path
infisical secrets get --env=dev --path=/shared --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef
```

### "Port already in use"

```bash
# Find process using port
sudo lsof -i :8000
sudo lsof -i :5432

# Kill process if needed
sudo kill -9 <PID>

# Or change ports in docker-compose.yml
```

### "Container keeps restarting"

```bash
# Check logs for errors
docker logs <container-name>

# Common issues:
# - Database connection failed (check POSTGRES_PASSWORD)
# - Redis connection failed (check REDIS_PASSWORD)
# - Missing environment variables (check Infisical)
```

### "Cannot connect to PostgreSQL"

```bash
# Check if PostgreSQL is running
docker ps | grep postgresql

# Check PostgreSQL logs
docker logs postgresql

# Test connection
docker exec postgresql pg_isready

# Verify credentials
infisical secrets get POSTGRES_PASSWORD --env=dev --path=/shared
```

### "Infisical CLI errors"

```bash
# Update CLI
npm install -g @infisical/cli@latest

# Re-login
infisical logout
infisical login

# Verify access
infisical whoami
```

---

## 🔒 Security Recommendations

### Production Deployment

When deploying to production:

1. **Change All Passwords**
   ```bash
   # Set new strong passwords in Infisical
   infisical secrets set \
     POSTGRES_PASSWORD=<new-strong-password-32-chars> \
     REDIS_PASSWORD=<new-strong-password-32-chars> \
     --env=prod --path=/shared --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef
   ```

2. **Enable Firewall**
   ```bash
   # Allow only necessary ports
   sudo ufw enable
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 8000/tcp  # Nexus Router (if exposing publicly)
   # DO NOT expose database ports to public!
   ```

3. **Enable SSL/TLS**
   - Use Cloudflare Tunnel or nginx reverse proxy
   - Configure SSL certificates
   - Force HTTPS

4. **Regular Backups**
   ```bash
   # PostgreSQL backup
   docker exec postgresql pg_dump -U nyra nyra_production > backup.sql

   # Redis backup (RDB snapshots)
   docker exec redis redis-cli BGSAVE
   ```

5. **Monitoring & Alerts**
   - Set up Grafana/Prometheus
   - Configure Sentry for error tracking
   - Enable log aggregation

---

## 📈 Performance Tuning

### PostgreSQL

```bash
# Increase shared_buffers for large datasets
# Edit postgresql.conf in docker volume
# shared_buffers = 2GB
# effective_cache_size = 6GB
```

### Redis

```bash
# Already configured in docker-compose:
# - maxmemory: 4GB
# - eviction-policy: allkeys-lru
```

### Container Resource Limits

Edit `docker-compose.orchestration.yml` to adjust CPU/memory limits:

```yaml
services:
  postgresql:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

---

## ✅ Deployment Complete!

### What You Have Now

- ✅ Full infrastructure running on Linux orchestrator
- ✅ PostgreSQL, Redis, FalkorDB, Qdrant databases
- ✅ Claude Flow orchestration layer
- ✅ Archon OS agent system
- ✅ Nexus Router with fuzzy tool search
- ✅ MCP proxy aggregator
- ✅ GPU workers connected via Tailscale

### Next Steps

1. **Test end-to-end workflows**
   ```bash
   # Test Nexus Router fuzzy search
   curl "http://localhost:8000/mcp/tools/search?q=database"

   # Test Claude Flow
   curl http://localhost:9000/health
   ```

2. **Deploy application services**
   ```bash
   # Deploy mortgage assistant, admin panel, etc.
   cd infra/docker
   docker compose -f docker-compose.apps.yml up -d
   ```

3. **Configure monitoring**
   ```bash
   # Start monitoring stack
   docker compose -f docker-compose.monitoring.yml up -d
   ```

4. **Set up CI/CD**
   - Configure GitHub Actions
   - Set up automated deployments
   - Enable staging environment

---

## 📚 Additional Resources

- **Quick Start**: `docs/deployment/QUICK-START.md`
- **Secrets Reference**: `docs/deployment/INFISICAL-SECRETS-REFERENCE.md`
- **Windows Development**: `docs/deployment/LOCAL-DEV-WINDOWS.md`
- **Architecture**: `docs/architecture/system-architecture.md`
- **Troubleshooting**: `docs/deployment/DEPLOYMENT-STATUS.md`

---

**Status**: ✅ Deployment Guide Complete
**Support**: Check logs, review documentation, or check GitHub issues

**Your infrastructure is ready to build amazing things! 🚀**
