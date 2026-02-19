# Project Nyra - Complete Setup Guide

## 🎯 Quick Start

This guide will help you set up and access all services in the Project Nyra stack.

---

## 📋 Prerequisites

- Docker & Docker Compose installed
- Tailscale configured with static IPs
- `.env` file configured (see `BOOTSTRAP-ENV-GUIDE.md`)
- All 4 PCs on the same Tailscale network

---

## 🚀 Starting Services

### Option 1: Start Everything
```bash
make infra-up
```

This starts:
- All Docker services
- MCP servers
- Nexus Router
- Archon OS
- Claude Flow
- LiteLLM
- Gitea

### Option 2: Start Individual Stacks

```bash
# Archon OS (Knowledge Hub)
make archon-up

# Claude Flow (AI Orchestration)
make claude-flow-up

# LiteLLM (LLM Proxy)
make litellm-up

# Nexus Router (Intelligent Gateway)
make nexus-start

# Gitea (Git Server)
make gitea-up
```

---

## 🌐 Service Access URLs

### Orchestrator (100.64.0.1)

| Service | URL | Purpose |
|---------|-----|---------|
| **Archon UI** | http://100.64.0.1:3737 | Knowledge hub web interface |
| **Archon API** | http://100.64.0.1:4000 | REST API for tasks/docs |
| **Archon MCP** | http://100.64.0.1:8051 | MCP server endpoint |
| **Claude Flow Dashboard** | http://100.64.0.1:3003 | AI orchestration UI |
| **Claude Flow Event Server** | http://100.64.0.1:3004 | Event stream endpoint |
| **Gitea** | http://100.64.0.1:3001 | Git server web UI |
| **Nexus Router** | http://100.64.0.1:6000 | LLM gateway |
| **LiteLLM** | http://100.64.0.1:4000 | LLM proxy UI |
| **Grafana** | http://100.64.0.1:3000 | Metrics dashboard |
| **Prometheus** | http://100.64.0.1:9090 | Metrics collection |

### Workers

| Worker | Service | URL |
|--------|---------|-----|
| **RTX3060** | Ollama | http://100.64.0.11:11434 |
| **RTX3090Ti** | VLLM | http://100.64.0.12:8000 |
| **RTX5090** | VLLM | http://100.64.0.10:8000 |

---

## 🧠 Archon OS Setup

### 1. Start Archon Stack
```bash
make archon-up
```

### 2. Verify Services Running
```bash
docker ps | grep archon
```

You should see:
- `nyra-archon-api` (port 4000)
- `nyra-archon-ui` (port 3737)
- `nyra-archon-mcp` (port 8051)
- `nyra-ruvector-postgres` (port 5433)

### 3. Access Archon UI
Open browser: **http://100.64.0.1:3737**

### 4. First-Time Setup
1. Create admin account
2. Configure Supabase connection (if using)
3. Import initial knowledge base

### 5. Test MCP Server
```bash
curl http://100.64.0.1:8051/health
```

---

## 🤖 Claude Flow Setup

### 1. Start Claude Flow
```bash
make claude-flow-up
```

### 2. Verify Services
```bash
docker ps | grep claude-flow
```

You should see:
- `claude-flow` (port 3003)
- `claude-flow-event-server` (port 3004)
- `claude-flow-dashboard` (port 3005)

### 3. Access Dashboard
Open browser: **http://100.64.0.1:3003**

### 4. Configure Agents
1. Navigate to Settings
2. Add API keys for LLM providers
3. Configure agent pools
4. Enable memory backends

---

## 📦 Gitea Setup

### 1. Start Gitea
```bash
make gitea-up
```

### 2. Access Gitea
Open browser: **http://100.64.0.1:3001**

### 3. Initial Configuration

#### First-Time Setup Wizard:
1. **Database Settings**:
   - Database Type: `PostgreSQL`
   - Host: `gitea-db:5432`
   - Username: `gitea`
   - Password: (from `.env` - `GITEA_DB_PASSWORD`)
   - Database Name: `gitea`

2. **General Settings**:
   - Site Title: `Project Nyra Git`
   - Repository Root Path: `/data/git/repositories`
   - Git LFS Root Path: `/data/git/lfs`
   - Run As Username: `git`

3. **Server Settings**:
   - SSH Server Domain: `100.64.0.1`
   - SSH Port: `2222`
   - HTTP Port: `3000`
   - Gitea Base URL: `http://100.64.0.1:3001/`

4. **Admin Account**:
   - Username: `admin` (or from `.env` - `GITEA_ADMIN_USER`)
   - Password: (from `.env` - `GITEA_ADMIN_PASSWORD`)
   - Email: `admin@localhost`

5. Click **Install Gitea**

### 4. Post-Installation

#### Create Your First Repository:
```bash
# On orchestrator
cd ~/projects/project-nyra
git remote add gitea http://100.64.0.1:3001/admin/project-nyra.git
git push gitea main
```

#### SSH Access:
```bash
# Add SSH key to Gitea (Settings > SSH/GPG Keys)
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub  # Copy this

# Test SSH
ssh -p 2222 git@100.64.0.1
```

#### Configure Git Hooks (Optional):
1. Navigate to repo settings
2. Add webhooks for CI/CD
3. Configure branch protection

---

## 🌐 Nexus Router Setup

### 1. Start Nexus
```bash
make nexus-start
```

### 2. Verify Configuration
```bash
curl http://100.64.0.1:6000/health
```

### 3. Test Worker Connectivity
```bash
# Test Ollama (RTX3060)
curl http://100.64.0.11:11434/api/tags

# Test VLLM (RTX3090Ti)
curl http://100.64.0.12:8000/v1/models

# Test VLLM (RTX5090)
curl http://100.64.0.10:8000/v1/models
```

### 4. Test Routing
```bash
# Route through Nexus to local worker
curl -X POST http://100.64.0.1:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5:7b",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 🔧 LiteLLM Setup

### 1. Start LiteLLM
```bash
make litellm-up
```

### 2. Access UI
Open browser: **http://100.64.0.1:4000**

### 3. Configure Models
LiteLLM auto-loads configuration from `infra/configs/litellm/config.yaml`

### 4. Test Proxy
```bash
curl -X POST http://100.64.0.1:4000/chat/completions \
  -H "Authorization: Bearer ${LITELLM_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

---

## 🔐 Cloudflare Tunnel Setup

### 1. Create Tunnel
```bash
# On orchestrator
cloudflared tunnel create nyra-orchestrator
```

### 2. Configure Routes
Edit `infra/configs/cloudflared/config.yml`:
```yaml
tunnel: <tunnel-id>
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: archon.ratehunter.net
    service: http://localhost:3737
  - hostname: gitea.ratehunter.net
    service: http://localhost:3001
  - hostname: nexus.ratehunter.net
    service: http://localhost:6000
  - service: http_status:404
```

### 3. Start Tunnel
```bash
make cloudflared-up
```

### 4. Configure DNS
In Cloudflare dashboard, add CNAME records:
- `archon.ratehunter.net` → `<tunnel-id>.cfargotunnel.com`
- `gitea.ratehunter.net` → `<tunnel-id>.cfargotunnel.com`
- `nexus.ratehunter.net` → `<tunnel-id>.cfargotunnel.com`

---

## 🧪 Testing & Verification

### Health Checks
```bash
# Check all services
make infra-status

# Individual health checks
curl http://100.64.0.1:3737/health  # Archon UI
curl http://100.64.0.1:4000/api/health  # Archon API
curl http://100.64.0.1:3001/api/healthz  # Gitea
curl http://100.64.0.1:6000/health  # Nexus
curl http://100.64.0.1:4000/health  # LiteLLM
```

### View Logs
```bash
# All services
make docker-logs

# Specific service
docker logs -f nyra-archon-api
docker logs -f nyra-nexus-router
docker logs -f orchestrator-gitea
```

---

## 🛠️ Troubleshooting

### Archon Not Starting
```bash
# Check database
docker logs nyra-ruvector-postgres

# Check API logs
docker logs nyra-archon-api

# Verify environment
docker exec nyra-archon-api env | grep SUPABASE
```

### Gitea Database Connection Failed
```bash
# Check Gitea DB
docker logs orchestrator-gitea-db

# Verify credentials
docker exec orchestrator-gitea-db psql -U gitea -d gitea -c "SELECT 1;"
```

### Workers Not Reachable
```bash
# Test Tailscale connectivity
ping 100.64.0.11  # RTX3060
ping 100.64.0.12  # RTX3090Ti
ping 100.64.0.10  # RTX5090

# Check worker services
curl http://100.64.0.11:11434/api/tags
```

### Nexus Router Not Routing
```bash
# Check configuration
docker exec nyra-nexus-router cat /etc/nexus.toml

# View router logs
docker logs -f nyra-nexus-router

# Test direct worker access
curl http://100.64.0.11:11434/api/tags
```

---

## 📊 Monitoring

### Grafana Dashboards
1. Access: http://100.64.0.1:3000
2. Login: admin / (from `.env`)
3. Import dashboards:
   - GPU Metrics
   - Service Health
   - Request Latency
   - Cost Tracking

### Prometheus Metrics
- Access: http://100.64.0.1:9090
- Query examples:
  - `up{job="nexus-router"}`
  - `gpu_utilization{worker="rtx5090"}`
  - `http_requests_total{service="archon"}`

---

## 🔄 Maintenance

### Backup
```bash
# Backup all volumes
make backup-all

# Backup specific service
docker run --rm -v nyra_archon_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/archon-$(date +%Y%m%d).tar.gz /data
```

### Updates
```bash
# Pull latest images
docker-compose pull

# Restart services
make infra-restart
```

### Cleanup
```bash
# Stop all services
make infra-down

# Remove unused volumes
docker volume prune

# Clean build cache
make clean
```

---

## 📚 Additional Resources

- [Archon OS Documentation](./docs/guides/archon/ARCHON_OS.md)
- [Claude Flow Guide](./docs/guides/claude-flow/)
- [Nexus Router API](./docs/api/nexus-router.md)
- [Port Mapping Reference](./PORT-MAPPING-REFERENCE.md)
- [Environment Setup](./BOOTSTRAP-ENV-GUIDE.md)

---

**Need Help?** Check the troubleshooting section or review service logs with `make docker-logs`.
