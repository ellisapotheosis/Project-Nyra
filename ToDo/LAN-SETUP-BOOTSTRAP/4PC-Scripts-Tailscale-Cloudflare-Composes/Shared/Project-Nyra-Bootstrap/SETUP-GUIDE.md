# Project Nyra Bootstrap - Complete Setup Guide

> **🚀 Start-to-Finish Guide**: Everything you need to set up the Project Nyra distributed AI mortgage platform on your 4-PC cluster.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (10 Minutes)](#quick-start-10-minutes)
4. [Detailed Setup](#detailed-setup)
5. [PC-Specific Configuration](#pc-specific-configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Setup Does

This bootstrap system will deploy the complete Project Nyra stack across your 4-PC cluster:

- **Orchestrator Mini PC** (Windows 11 + WSL): Central coordination, MCP servers, n8n workflows
- **Worker PC1-3** (GPU): Distributed AI compute, model inference, claude-flow agents

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Orchestrator Mini PC (Windows 11 + WSL)                    │
├─────────────────────────────────────────────────────────────┤
│ Docker Containers:                                          │
│  ├─ Claude Flow MCP (port 3000)                            │
│  ├─ Archon OS (port 8000)                                  │
│  ├─ PostgreSQL (port 5432)                                 │
│  ├─ Redis (port 6379)                                      │
│  ├─ Gitea (port 3001)                                      │
│  ├─ n8n (port 5678)                                        │
│  ├─ Infisical (port 8080)                                  │
│  ├─ Graphiti MCP (port 8001)                              │
│  ├─ Mem0 MCP (port 8002)                                   │
│  └─ MongoDB (port 27017)                                   │
│                                                             │
│ CLI Shims (transparent Docker execution):                  │
│  ├─ claude-flow → nyra-claude-flow container              │
│  ├─ archon → nyra-archon container                        │
│  └─ infisical → nyra-infisical container                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┐
│ Worker PC1   │ Worker PC2   │ Worker PC3   │
│ (GPU)        │ (GPU)        │ (GPU)        │
└──────────────┴──────────────┴──────────────┘
```

---

## Prerequisites

### Required Software

#### Windows 11 (All PCs)
- [ ] Windows 11 Pro (for WSL2 support)
- [ ] Docker Desktop for Windows
- [ ] WSL2 installed
- [ ] Git for Windows
- [ ] PowerShell 7+

#### WSL (Orchestrator Only)
- [ ] Ubuntu 22.04 LTS (or similar)
- [ ] Docker CLI (connects to Windows Docker Desktop)

### Required Accounts
- [ ] Anthropic API key (https://console.anthropic.com/)
- [ ] OpenAI API key (optional)
- [ ] Infisical account (https://infisical.com/)

### Hardware Requirements

**Orchestrator Mini PC:**
- CPU: 4+ cores
- RAM: 16GB minimum, 32GB recommended
- Storage: 256GB SSD minimum
- Network: Gigabit Ethernet

**Worker PCs (1-3):**
- GPU: NVIDIA RTX 3060+ (6GB+ VRAM)
- CPU: 4+ cores
- RAM: 16GB minimum
- Storage: 256GB SSD minimum
- Network: Gigabit Ethernet

---

## Quick Start (10 Minutes)

### Step 1: Clone Repository (All PCs)

```bash
# Windows PowerShell
cd C:\Dev\Projects\Repos
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra
```

### Step 2: Setup Infisical

1. Create Infisical account at https://infisical.com/
2. Create project: `project-nyra`
3. Create environments: `development`, `production`
4. Add secrets (see [Required Secrets](#required-secrets))
5. Get project ID and access token

### Step 3: Configure Environment Variables

```bash
# Windows (PowerShell)
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap\docker

# Copy template
cp .env.example .env

# Edit with your values
notepad .env
```

**Required in `.env`:**
```env
# Infisical
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_TOKEN=your-token

# API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Database Passwords (generate with: openssl rand -base64 32)
POSTGRES_PASSWORD=<secure-password>
REDIS_PASSWORD=<secure-password>
MONGO_ROOT_PASSWORD=<secure-password>

# Infisical Secrets (generate with: openssl rand -hex 32)
INFISICAL_ENCRYPTION_KEY=<random-hex>
INFISICAL_JWT_SECRET=<random-hex>

# n8n
N8N_BASIC_AUTH_PASSWORD=<secure-password>
```

### Step 4: Start Docker Stack

```bash
# From bootstrap/docker/
make dev
```

Or manually:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Step 5: Install Shims

```bash
# Windows PowerShell
cd bootstrap\scripts\shims
powershell -ExecutionPolicy Bypass -File install-shims.ps1 -All

# Restart terminal
```

### Step 6: Verify Installation

```bash
# Check containers
docker ps

# Test shims
claude-flow --version
archon --version

# Run health checks
cd bootstrap\docker
make health
```

**🎉 Done! All services should be running.**

---

## Detailed Setup

### A. Docker Stack Setup

#### 1. Initialize Production Environment

```bash
cd bootstrap/docker

# Auto-generate secure passwords
make init-prod

# This creates .env with random passwords
```

#### 2. Review Configuration

```bash
# Edit .env
notepad .env

# Validate configuration
make validate
```

#### 3. Build Images

```bash
# Build all images
make build

# Or build specific images
docker-compose build claude-flow
docker-compose build archon
```

#### 4. Start Services

```bash
# Development mode (with debugging)
make dev

# Production mode (optimized)
make prod

# Check status
make ps
make health
```

### B. Shim Setup

#### Windows Shims

```powershell
cd bootstrap\scripts\shims

# Install all shims to PATH
.\install-shims.ps1 -All

# Or install individually
.\install-shims.ps1 -ClaudeFlow
.\install-shims.ps1 -Archon
.\install-shims.ps1 -Infisical

# Test installation
.\install-shims.ps1 -TestShims
```

#### WSL/Linux Shims

```bash
cd /mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims

# Install all shims
./install-shims.sh --all

# Add to PATH
echo 'export PATH="/mnt/c/Dev/Projects/Repos/Project-Nyra/bootstrap/scripts/shims:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Test installation
./install-shims.sh --test
```

### C. Infisical Secret Management

#### Setup Infisical

1. **Create Project**
   ```bash
   # Login to Infisical
   infisical login

   # Create project
   infisical project create --name project-nyra
   ```

2. **Add Secrets**
   ```bash
   # Add to development environment
   infisical secrets set ANTHROPIC_API_KEY sk-ant-... --env development
   infisical secrets set OPENAI_API_KEY sk-... --env development

   # Add to production environment
   infisical secrets set ANTHROPIC_API_KEY sk-ant-... --env production
   ```

3. **Test Access**
   ```bash
   # List secrets
   infisical secrets list --env development

   # Get specific secret
   infisical secrets get ANTHROPIC_API_KEY --env development
   ```

### D. React GUI Installer

#### Start Installer

```bash
cd bootstrap/installer

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open browser to http://localhost:5173
```

#### Using the Installer

1. **Select PC Configuration**
   - Orchestrator (main coordination PC)
   - Worker1, Worker2, Worker3 (GPU PCs)

2. **Choose Components**
   - Core Services (PostgreSQL, Redis, MongoDB)
   - Claude Flow MCP
   - Archon OS
   - MCP Servers (Graphiti, Mem0, Infisical)
   - DevOps Tools (Gitea, n8n)

3. **Configure Settings**
   - Edit API keys
   - Set ports
   - Configure storage paths

4. **Generate Shims**
   - Windows (.cmd files)
   - WSL (.sh files)
   - Custom paths

5. **Deploy**
   - One-click deployment
   - Real-time logs
   - Health checks

---

## PC-Specific Configuration

### Orchestrator Mini PC

**Location:** `bootstrap/configs/orchestrator/`

```bash
cd bootstrap/configs/orchestrator

# Copy environment template
cp .env.template .env.orchestrator

# Edit configuration
nano .env.orchestrator
```

**Configuration:**
```env
PC_ROLE=orchestrator
PC_NAME=orchestrator-mini
PC_IP=192.168.1.100

# Services to run
ENABLE_CLAUDE_FLOW=true
ENABLE_ARCHON=true
ENABLE_POSTGRES=true
ENABLE_REDIS=true
ENABLE_MONGO=true
ENABLE_GITEA=true
ENABLE_N8N=true
ENABLE_INFISICAL=true
ENABLE_MCP_SERVERS=true

# GPU Settings
ENABLE_GPU=false
```

**Start:**
```bash
cd bootstrap/docker
docker-compose -f docker-compose.yml -f ../configs/orchestrator/docker-compose.override.yml up -d
```

### Worker PC1 (GPU)

**Location:** `bootstrap/configs/worker1/`

```bash
cd bootstrap/configs/worker1

# Copy template
cp .env.template .env.worker1

# Edit configuration
nano .env.worker1
```

**Configuration:**
```env
PC_ROLE=worker
PC_NAME=worker1
PC_IP=192.168.1.101

# Services (minimal for GPU work)
ENABLE_CLAUDE_FLOW=true  # For agent execution
ENABLE_ARCHON=true       # For AI workloads
ENABLE_POSTGRES=false    # Use orchestrator DB
ENABLE_REDIS=true        # Local caching
ENABLE_MONGO=false
ENABLE_GITEA=false
ENABLE_N8N=false
ENABLE_INFISICAL=false
ENABLE_MCP_SERVERS=false

# GPU Settings
ENABLE_GPU=true
GPU_DEVICE_IDS=0
NVIDIA_VISIBLE_DEVICES=all
```

**Start:**
```bash
cd bootstrap/docker
docker-compose -f docker-compose.yml -f ../configs/worker1/docker-compose.override.yml up -d
```

### Worker PC2 & PC3

Same as Worker PC1, but use `bootstrap/configs/worker2/` and `worker3/` directories.

Update IP addresses:
- Worker2: `192.168.1.102`
- Worker3: `192.168.1.103`

---

## Verification

### 1. Check Docker Containers

```bash
cd bootstrap/docker

# List running containers
make ps

# Expected output: 10 containers running
```

### 2. Health Checks

```bash
# Run comprehensive health checks
make health

# Expected: All services "healthy"
```

### 3. Test Services

```bash
# Claude Flow
claude-flow doctor

# Archon OS
archon --version

# PostgreSQL
docker exec nyra-postgres psql -U nyra -c "SELECT version();"

# Redis
docker exec nyra-redis redis-cli PING

# n8n
curl http://localhost:5678/healthz
```

### 4. Test Shims

```bash
# Claude Flow commands through shim
claude-flow swarm init --topology hierarchical
claude-flow agent spawn -t coder --name test-coder
claude-flow swarm status

# Archon commands through shim
archon agent list
```

### 5. Access Web UIs

- Claude Flow: http://localhost:3000
- Archon OS: http://localhost:8000
- Gitea: http://localhost:3001
- n8n: http://localhost:5678
- Infisical: http://localhost:8080
- Adminer (DB): http://localhost:8082
- Redis Commander: http://localhost:8081

---

## Troubleshooting

### Docker Issues

#### Docker not running
```bash
# Windows: Start Docker Desktop
# Check status
docker info
```

#### Port conflicts
```bash
# Find what's using the port
netstat -ano | findstr :3000

# Change port in .env
CLAUDE_FLOW_MCP_PORT=3100
```

#### Out of memory
```bash
# Check usage
make stats

# Clean up
make clean

# Increase Docker memory: Docker Desktop → Settings → Resources
```

### Container Issues

#### Container won't start
```bash
# Check logs
make logs-claude-flow
make logs-archon

# Check configuration
make validate

# Restart container
make restart-claude-flow
```

#### Container keeps restarting
```bash
# View last 100 lines of logs
docker logs --tail 100 nyra-claude-flow

# Check environment variables
docker exec nyra-claude-flow env | grep CLAUDE
```

### Shim Issues

#### Shim not found
```bash
# Windows: Check PATH
echo %PATH%

# Should include: C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims

# Add to PATH manually:
setx PATH "%PATH%;C:\Dev\Projects\Repos\Project-Nyra\bootstrap\scripts\shims"
```

#### Shim fails with Docker error
```bash
# Check Docker is running
docker ps

# Check container exists
docker ps -a | grep nyra

# Start container if stopped
docker start nyra-claude-flow
```

### Database Issues

#### PostgreSQL connection failed
```bash
# Check container running
docker ps | grep postgres

# Check logs
make logs-postgres

# Test connection
make db-shell
```

#### Redis connection failed
```bash
# Check container
docker ps | grep redis

# Test connection
make redis-cli
# Should show: redis> prompt
```

### Network Issues

#### Can't access web UIs
```bash
# Check ports are exposed
docker ps --format "{{.Names}}: {{.Ports}}"

# Check firewall (Windows)
netsh advfirewall firewall show rule name=all | findstr 3000
```

#### Worker can't reach orchestrator
```bash
# Ping test
ping 192.168.1.100

# Check Docker networks
docker network ls
docker network inspect nyra-network
```

---

## Required Secrets

Add these to Infisical:

### Development Environment

```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Database URLs (auto-generated)
DATABASE_URL=postgresql://nyra:PASSWORD@postgres:5432/nyra
REDIS_URL=redis://:PASSWORD@redis:6379/0
MONGO_URL=mongodb://root:PASSWORD@mongo:27017

# Application Secrets
JWT_SECRET=<random-hex>
SESSION_SECRET=<random-hex>
ENCRYPTION_KEY=<random-hex>

# External Services
GITHUB_TOKEN=ghp_...
OPENAI_ORG_ID=org-...
```

### Production Environment

Same as development, but:
- Use strong, unique passwords
- Use production API keys
- Use production database URLs
- Enable SSL/TLS

---

## Next Steps

After successful setup:

1. **Configure n8n Workflows**
   - Import mortgage lead workflows
   - Configure Dialpad integration
   - Set up document automation

2. **Setup Gitea**
   - Create repositories
   - Configure CI/CD pipelines
   - Add team members

3. **Deploy Applications**
   ```bash
   cd apps/ratehunter
   pnpm install
   pnpm build
   ```

4. **Test Distributed AI**
   ```bash
   claude-flow swarm init --topology hierarchical-mesh
   claude-flow agent spawn -t ml-developer --name gpu-agent1
   ```

5. **Monitor System**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3002
   - Logs: `make logs`

---

## Support

- **Documentation**: `bootstrap/docs/`
- **Issues**: GitHub Issues
- **Logs**: `bootstrap/docker/logs/`
- **Health Checks**: `make health`

---

**Setup Guide Version**: 1.0.0
**Last Updated**: 2026-01-15
**Status**: Production Ready ✅
