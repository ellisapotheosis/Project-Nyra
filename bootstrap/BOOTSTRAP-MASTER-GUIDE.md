# 🚀 Project Nyra - Bootstrap Master Guide

**Start Here:** This is your single entry point for bootstrapping all 4 PCs in your Project Nyra mortgage automation platform.

**Version:** 1.0.0  
**Last Updated:** 2025-01-18  
**Prerequisites:** Windows 11, Internet connection, Admin rights

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Your 4-PC Setup](#your-4-pc-setup)
3. [Bootstrap Order](#bootstrap-order)
4. [Quick Start (TL;DR)](#quick-start-tldr)
5. [Detailed Step-by-Step](#detailed-step-by-step)
6. [Architecture Decisions](#architecture-decisions)
7. [Troubleshooting](#troubleshooting)
8. [What's Deployed](#whats-deployed)

---

## Overview

Project Nyra is a **4-PC LAN cluster** running a complete mortgage broker automation platform with AI-powered workflows, Quote Engine, Campaign Engine, and CRM integration.

### What This Bootstrap Process Does

- ✅ Installs Docker Desktop + WSL2 on all PCs
- ✅ Deploys 30+ services via Docker Compose
- ✅ Configures Cloudflare Tunnel for public access
- ✅ Sets up MCP servers for Claude AI integration
- ✅ Configures Infisical for secrets management
- ✅ Installs GPU drivers (workers only)
- ✅ Deploys observability stack (Prometheus, Grafana, Loki)
- ✅ Configures Tailscale VPN for admin access
- ✅ Sets up Gitea for internal git hosting

**Total time:** 2-4 hours per PC

---

## Your 4-PC Setup

| PC | Role | Hardware | Services Hosted |
|----|------|----------|-----------------|
| **UH680 Mini PC** | Orchestrator | Ryzen 7 6800H, 16GB RAM | All services (TwentyCRM, Dify, n8n, Grafana, Nexus Router, etc.) |
| **Desktop PC** | GPU Worker 1 | RTX 3090Ti | LLM inference (Quote Engine) |
| **M15R7 Laptop** | GPU Worker 2 | RTX 3060 | LLM inference (Campaign Engine) |
| **Area-51 Laptop** | GPU Worker 3 | RTX 5090 | LLM inference (Dify processing) |

**Network:** All connected via LAN + Cloudflare Tunnel for external access

---

## Bootstrap Order

### 🎯 Recommended Sequence

```
Day 1: Orchestrator PC (3-4 hours)
   ↓
Day 2: Worker-3060 (1-2 hours) [Test on least critical PC first]
   ↓
Day 3: Worker-3090 (1-2 hours)
   ↓
Day 4: Worker-5090 (1-2 hours)
```

**Why this order?**
- Orchestrator hosts all services - must be first
- Test on weakest GPU worker first to validate process
- Deploy to most powerful GPU last (production-critical)

---

## Quick Start (TL;DR)

For experienced users who want minimal hand-holding:

```powershell
# 1. Navigate to bootstrap scripts
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts

# 2. Run pre-flight check
.\00-PRE-FLIGHT-CHECK.ps1 -Verbose

# 3. Configure secrets
cd ..
Copy-Item .env.template .env
notepad .env  # Fill in API keys

# 4. Launch GUI installer
.\scripts\03-GUI-INSTALLER.ps1

# 5. Select PC role and follow wizard
# Orchestrator → Full stack
# Worker → GPU compute stack

# 6. Verify deployment
cd ..
start health-dashboard.html
```

---

## Detailed Step-by-Step

### Phase 1: Pre-Flight Checks (15 minutes)

**All PCs must pass these checks before proceeding.**

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts
.\00-PRE-FLIGHT-CHECK.ps1 -Verbose
```

**What it checks:**
- ✅ Docker Desktop installed (v24.0+)
- ✅ WSL2 enabled and configured
- ✅ NVIDIA drivers (GPU workers only, 525.60+)
- ✅ NVIDIA Container Toolkit (GPU workers)
- ✅ Infisical CLI installed
- ✅ Ports available (6000, 3000, 3001, 3005, 5678, etc.)
- ✅ Disk space (100GB+ recommended)
- ✅ Internet connectivity

**If checks fail:**
- Docker: Download from https://docs.docker.com/desktop/install/windows-install/
- WSL2: Run `wsl --install` in PowerShell (Admin)
- NVIDIA drivers: Download from https://www.nvidia.com/download/index.aspx
- Infisical: Run `winget install infisical`

**Skip GPU checks on Orchestrator:**
```powershell
.\00-PRE-FLIGHT-CHECK.ps1 -SkipGPUCheck -Verbose
```

---

### Phase 2: Secret Configuration (10 minutes)

**Do this BEFORE running the GUI installer.**

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra

# Copy template
Copy-Item .env.template .env

# Edit with your API keys
notepad .env
```

**Required secrets** (mark as `<REQUIRED>` in template):

```env
# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...
GOOGLE_GEMINI_API_KEY=...

# Database Passwords
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...

# Application Secrets
TWENTYCRM_SECRET_KEY=...
DIFY_SECRET_KEY=...
N8N_ENCRYPTION_KEY=...

# Infisical
INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=...
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=...

# Cloudflare Tunnel
CLOUDFLARE_TUNNEL_TOKEN=...

# Observability
GRAFANA_ADMIN_PASSWORD=...
```

**Generate strong passwords:**
```powershell
# Use built-in Windows crypto
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

**Optional but recommended:** Store in Infisical instead of `.env`:

```powershell
# Login to Infisical
infisical login

# Create secrets
infisical secrets set ANTHROPIC_API_KEY "sk-ant-..." --env production --path /nyra/shared
infisical secrets set POSTGRES_PASSWORD "..." --env production --path /nyra/orchestrator
# ... repeat for all secrets
```

---

### Phase 3: GUI Installer (Orchestrator - 2-3 hours)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap
.\03-GUI-INSTALLER.ps1
```

**GUI Flow:**

1. **Welcome Screen**
   - Shows Project Nyra logo
   - Lists what will be installed
   - Click "Next"

2. **PC Role Selection**
   - Select: **Orchestrator**
   - Shows services that will be deployed
   - Click "Next"

3. **Component Selection** (pre-selected for orchestrator):
   - ✅ Docker Desktop + WSL2
   - ✅ Infisical CLI
   - ✅ Tailscale
   - ✅ Complete Docker Stack (30+ services)
   - ✅ Claude Desktop MCP Configuration
   - ✅ Cloudflare Tunnel
   - ✅ Prometheus + Grafana + Loki
   - ✅ Gitea
   - ✅ Claude-Code (WSL2)
   - Click "Next"

4. **Configuration Review**
   - Shows .env file path
   - Validates all required secrets present
   - Shows deployment plan
   - Click "Install"

5. **Installation Progress** (25-45 minutes)
   - Installs Docker Desktop (if not present)
   - Configures WSL2 Ubuntu
   - Pulls all Docker images (this takes time!)
   - Starts services
   - Configures MCP servers
   - Sets up Cloudflare Tunnel
   - Initializes Gitea
   - Progress bar + detailed logs

6. **Verification** (5 minutes)
   - Runs health checks on all services
   - Tests Cloudflare Tunnel connectivity
   - Tests MCP connections
   - Shows service URLs
   - Click "Finish"

7. **Post-Install Actions**
   - Opens health dashboard in browser
   - Shows next steps
   - Displays service URLs:
     - https://ratehunter.net (public landing)
     - https://nyra.ratehunter.net (admin)
     - https://crm.ratehunter.net (TwentyCRM)
     - https://monitor.ratehunter.net (Grafana)
     - http://localhost:3200 (Gitea)

---

### Phase 4: Verify Orchestrator Deployment (10 minutes)

```powershell
# Check all services are running
docker ps

# Expected: 20+ containers running

# Test health dashboard
start C:\Dev\Projects\Repos\Project-Nyra\health-dashboard.html

# Should show all services as "Healthy" (green)

# Test Cloudflare Tunnel
curl https://ratehunter.net/health

# Expected: {"status":"ok"}

# Test internal services
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:3000/health  # TwentyCRM
curl http://localhost:3005/api/health  # Grafana

# Test MCP connections (restart Claude Desktop first)
# Open Claude Desktop
# Type: "List my filesystem MCP capabilities"
# Should see file operations available
```

---

### Phase 5: GPU Workers (1-2 hours each)

**Repeat for each GPU worker:**

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap
.\03-GUI-INSTALLER.ps1
```

**GUI Flow:**

1. **PC Role Selection**
   - Worker-5090 (Area-51 laptop)
   - Worker-3090 (Desktop PC)
   - Worker-3060 (M15R7 laptop)

2. **Component Selection** (pre-selected for workers):
   - ✅ Docker Desktop + WSL2
   - ✅ NVIDIA Container Toolkit
   - ✅ LLM Inference Stack (Ollama/vLLM)
   - ✅ Cloudflared (optional, for tunnel HA)
   - ✅ Minimal monitoring (Prometheus node exporter)
   - ❌ Full service stack (orchestrator only)

3. **GPU Detection**
   - Automatically detects GPU model
   - Validates NVIDIA drivers
   - Installs NVIDIA Container Toolkit
   - Configures Docker for GPU access

4. **LAN Connectivity Test**
   - Tests connection to orchestrator: `http://192.168.1.100:6000`
   - Validates Docker network access
   - Shows if orchestrator is reachable

5. **Installation** (15-30 minutes)
   - Installs Docker Desktop
   - Configures NVIDIA Toolkit
   - Pulls LLM inference images
   - Starts containers
   - Registers with orchestrator

6. **Verification**
   - Tests GPU access: `docker run --gpus all nvidia/cuda:12.0-base nvidia-smi`
   - Tests LLM inference: `curl http://localhost:11434/api/tags`
   - Tests orchestrator connectivity

---

## Architecture Decisions

### Why These Choices?

See detailed justifications in:
- **MCP Architecture:** `bootstrap/MCP-ARCHITECTURE.md`
- **Orchestrator Setup:** `bootstrap/ARCHITECTURE-ORCHESTRATOR.md`
- **Cloudflare Tunnels:** `bootstrap/CLOUDFLARE-TUNNEL-INTEGRATION.md`

**TL;DR:**

| Decision | Why |
|----------|-----|
| Docker on Windows, not WSL | Stability + WSL2 integration + GUI |
| WSL2 for dev tools | Full Docker access + better performance |
| Hybrid MCP architecture | Local MCPs for filesystem, Nexus for containers |
| Claude-Flow containerized | Workflow orchestration needs isolation |
| Claude-Code in WSL2 | Better terminal dev experience |
| Cloudflared containerized | Direct Docker network access |
| Tailscale containerized | Consistency with stack |
| Gitea containerized | Easier backup/restore |
| Infisical CLI + MCP | Compose injection + runtime secrets |

---

## Troubleshooting

### Pre-Flight Check Fails

```powershell
# Docker not found
winget install Docker.DockerDesktop

# WSL2 not enabled
wsl --install
# Restart computer

# NVIDIA drivers missing
# Download from: https://www.nvidia.com/download/index.aspx

# Ports in use
netstat -ano | findstr ":6000"
Stop-Process -Id <PID> -Force
```

### GUI Installer Crashes

```powershell
# Check PowerShell version (need 5.1+)
$PSVersionTable.PSVersion

# Run as Administrator
# Right-click PowerShell → Run as Administrator

# Check execution policy
Get-ExecutionPolicy
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# View detailed logs
Get-Content C:\Dev\Projects\Repos\Project-Nyra\bootstrap\logs\installer.log -Tail 50
```

### Services Won't Start

```powershell
# Check Docker is running
docker ps

# If Docker isn't running
# Open Docker Desktop from Start Menu

# Check specific service logs
docker logs twentycrm --tail 50
docker logs nexus-router --tail 50

# Restart all services
cd C:\Dev\Projects\Repos\Project-Nyra
docker compose down
docker compose up -d

# Check service health
docker compose ps
```

### Cloudflare Tunnel Not Connecting

```powershell
# Check tunnel logs
docker logs cloudflared --tail 50

# Verify tunnel token
# Should be in .env or Infisical

# Test tunnel connectivity
curl http://localhost:2000/ready

# Check Cloudflare Dashboard
# https://one.dash.cloudflare.com/ → Networks → Tunnels
# Should show "Healthy" status
```

### MCP Servers Not Working

```powershell
# Restart Claude Desktop completely
# Task Manager → End "Claude" process
# Start Claude Desktop again

# Check MCP config
notepad C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json

# Test individual MCPs
npx @modelcontextprotocol/server-filesystem C:\Dev
# Should connect without errors

# Check Nexus Router logs
docker logs nexus-router --tail 50
```

### GPU Not Detected (Workers)

```powershell
# Check NVIDIA drivers
nvidia-smi

# Should show GPU information
# If not, reinstall drivers

# Test NVIDIA Container Toolkit
docker run --rm --gpus all nvidia/cuda:12.0-base nvidia-smi

# Should show GPU in container

# Check Docker GPU configuration
docker info | findstr "Runtimes"
# Should include "nvidia"
```

---

## What's Deployed

### Orchestrator PC Services

| Service | Port | Public URL | Purpose |
|---------|------|------------|---------|
| Nexus Router | 6000 | - | LLM gateway + MCP aggregator |
| TwentyCRM | 3000 | https://crm.ratehunter.net | System of record CRM |
| Dify | 3001 | https://chat.ratehunter.net | AI chat interface |
| Grafana | 3005 | https://monitor.ratehunter.net | Monitoring dashboard |
| n8n | 5678 | https://workflow.ratehunter.net | Workflow automation |
| RateHunter | 3100 | https://ratehunter.net | Public landing page |
| Nyra Admin | 3101 | https://nyra.ratehunter.net | Admin webapp |
| Gitea | 3200 | http://localhost:3200 | Internal git hosting |
| Prometheus | 9090 | - | Metrics collection |
| Loki | 3100 | - | Log aggregation |
| PostgreSQL | 5432 | - | Database |
| Redis | 6379 | - | Cache |
| Claude-Flow | - | Via MCP | Workflow orchestration |
| Infisical MCP | - | Via MCP | Secrets API |
| Cloudflared | 2000 | - | Tunnel (metrics) |
| Tailscale | - | - | Admin VPN |

### GPU Worker Services

| Service | Port | Purpose |
|---------|------|---------|
| Ollama | 11434 | LLM inference |
| vLLM | 8000 | High-perf LLM serving |
| Prometheus Node Exporter | 9100 | GPU metrics |
| Cloudflared (optional) | 2000 | Tunnel HA replica |

---

## Next Steps After Bootstrap

### 1. Configure TwentyCRM

```
https://crm.ratehunter.net
Default: admin / (check .env for password)
```

- Import mortgage lead schema
- Configure pipeline stages
- Set up custom fields

### 2. Configure n8n Workflows

```
https://workflow.ratehunter.net
Default: admin / (check .env for password)
```

- Import campaign templates from `bootstrap/workflows/`
- Configure Twilio integration
- Set up lead automation flows

### 3. Configure Grafana Dashboards

```
https://monitor.ratehunter.net
Default: admin / (check .env for password)
```

- Import dashboards from `bootstrap/grafana-dashboards/`
- Set up alerts for service downtime
- Configure Prometheus data source

### 4. Test Quote Engine

```powershell
# From orchestrator PC
curl -X POST http://localhost:8001/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "loanAmount": 500000,
    "creditScore": 750,
    "propertyValue": 600000,
    "loanTerm": 30
  }'
```

### 5. Deploy First Campaign

```powershell
# Use n8n workflow "Mortgage Campaign - New Leads"
# Configure:
# - Lead source (RateHunter form)
# - Campaign cadence (Day 1, 3, 7, 14, 30)
# - Compliance settings (TCPA consent required)
# - Twilio phone number
```

---

## Support & Resources

### Documentation

- **Architecture:** `bootstrap/ARCHITECTURE-ORCHESTRATOR.md`
- **MCP Setup:** `bootstrap/MCP-ARCHITECTURE.md`
- **Cloudflare Tunnels:** `bootstrap/CLOUDFLARE-TUNNEL-INTEGRATION.md`
- **Whitepaper:** `WHITEPAPER.md` (root)

### Scripts

- **Pre-Flight:** `bootstrap/scripts/00-PRE-FLIGHT-CHECK.ps1`
- **Rollback:** `bootstrap/scripts/ROLLBACK.ps1`
- **GUI Installer:** `bootstrap/scripts/03-GUI-INSTALLER.ps1`

### Health Monitoring

- **Dashboard:** `health-dashboard.html` (root)
- **Grafana:** https://monitor.ratehunter.net
- **Prometheus:** http://localhost:9090

### Logs

```powershell
# View all service logs
docker compose logs --follow

# Specific service
docker logs twentycrm --follow

# Installer logs
Get-Content C:\Dev\Projects\Repos\Project-Nyra\bootstrap\logs\installer.log
```

---

## Success Criteria

✅ **Bootstrap is complete when:**

1. All services show "Healthy" in health dashboard
2. Public URLs resolve (https://ratehunter.net, etc.)
3. Claude Desktop connects to all MCPs
4. GPU workers show in Grafana (if workers deployed)
5. Quote Engine returns test quotes
6. n8n workflows can be triggered
7. No errors in Docker logs

**You now have a fully operational Project Nyra mortgage automation platform! 🎉**

---

**Need help?** Check the troubleshooting section or review the detailed architecture docs.

**Ready to customize?** See `docs/CUSTOMIZATION-GUIDE.md` for advanced configuration options.
