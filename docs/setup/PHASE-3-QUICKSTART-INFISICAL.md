# 🚀 Phase 3 Quick Start Guide with Infisical Integration

**Version**: 2.0.0
**Date**: January 9, 2026
**Status**: Production Ready
**Estimated Time**: 15-20 minutes

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start (3 Commands)](#quick-start-3-commands)
4. [Detailed Setup](#detailed-setup)
5. [Architecture](#architecture)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

---

## 🎯 Overview

This guide walks you through setting up the complete Phase 3 orchestration stack for Project Nyra with **Infisical secret management**. Instead of managing `.env` files manually, all secrets are stored securely in Infisical and injected automatically.

### What You Get

**8 Services** running in Docker:
- 🗄️ **PostgreSQL** - Primary database
- 🔴 **Redis** - Caching & queues
- 📊 **FalkorDB** - Temporal knowledge graphs
- 🔍 **Qdrant** - Vector database
- 🤖 **Claude Flow** - Workflow orchestration (Port 9000)
- 🏗️ **Archon OS** - Task management (Port 9001)
- 🔀 **Nexus Router** - LLM routing (Port 8000)
- 🧠 **Letta** - Agent memory (Port 8283)
- 🔌 **Gemini MCP** - Google Gemini integration (Port 8085)
- 🔍 **Serena MCP** - Codebase analysis (Port 8086)
- 💾 **Mem0** - User personalization (Port 8080)
- 🎨 **Open-WebUI** - Development interface (Port 3333)
- 💬 **LobeChat** - Alternative UI (Port 3334)

---

## ✅ Prerequisites

### Required Software

```powershell
# Check all dependencies
git --version          # Git >= 2.30
docker --version       # Docker >= 20.10
node --version         # Node.js >= 18.0
pnpm --version         # pnpm >= 8.0
infisical --version    # Infisical CLI
```

### Install Infisical CLI

```powershell
# Option 1: Using Scoop (Recommended for Windows)
scoop install infisical

# Option 2: Using NPM
npm install -g @infisical/cli

# Verify installation
infisical --version
```

### Required Accounts

1. **Infisical Account** (Free)
   - Sign up at: https://app.infisical.com
   - Create project: "Project-Nyra"
   - Note your Project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`

2. **API Keys** (Store in Infisical)
   - Anthropic Claude API: https://console.anthropic.com/
   - Google Gemini API: https://makersuite.google.com/app/apikey
   - (Optional) OpenRouter API: https://openrouter.ai/keys

---

## 🚀 Quick Start (3 Commands)

For experienced users who want to get running fast:

```powershell
# Step 1: Navigate to Project Nyra
cd C:\Dev\Projects\Repos\Project-Nyra

# Step 2: Set up Infisical (interactive)
.\infra\infisical\setup-infisical.ps1

# Step 3: Start everything
cd infra\docker
.\start-all.ps1
```

That's it! All services will start with secrets automatically injected from Infisical.

**Access your services**:
- Open-WebUI: http://localhost:3333
- Claude Flow: http://localhost:9000
- Archon OS: http://localhost:9001

---

## 📖 Detailed Setup

### Step 1: Set Up Infisical

#### 1.1: Install Infisical CLI

```powershell
scoop install infisical
infisical --version
```

#### 1.2: Login to Infisical

```powershell
infisical login
```

This opens your browser for authentication.

#### 1.3: Create Machine Identity

1. Go to: https://app.infisical.com/org/your-org/settings/identities
2. Click **"Create Identity"**
3. Name: `Project-Nyra-Orchestration`
4. Auth Method: **Universal Auth**
5. Grant access to project: `Project-Nyra` (ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`)
6. Copy the **Client ID** and **Client Secret**

#### 1.4: Run Setup Script

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical
.\setup-infisical.ps1
```

This interactive script will:
- ✓ Check Infisical CLI installation
- ✓ Login (if needed)
- ✓ Save Machine Identity credentials
- ✓ Test the connection

---

### Step 2: Upload Secrets to Infisical

#### Option A: Upload from Template (Quick)

```powershell
# Edit the template with your actual values
notepad .\env\dev.shared.env

# Upload to Infisical
infisical secrets set --env=dev --path=/shared --file=env/dev.shared.env
```

#### Option B: Upload Individual Secrets (Precise)

```powershell
# Core API keys
infisical secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here --env=dev --path=/shared
infisical secrets set GOOGLE_GEMINI_API_KEY=your-gemini-key-here --env=dev --path=/shared
infisical secrets set OPENROUTER_API_KEY=your-openrouter-key-here --env=dev --path=/shared

# Database credentials
infisical secrets set POSTGRES_PASSWORD=your-secure-password --env=dev --path=/shared
infisical secrets set REDIS_PASSWORD=your-redis-password --env=dev --path=/shared
infisical secrets set FALKORDB_PASSWORD=your-falkordb-password --env=dev --path=/shared

# Security
infisical secrets set SESSION_SECRET=your-session-secret-32-chars --env=dev --path=/shared
infisical secrets set ENCRYPTION_KEY=your-encryption-key-32-chars --env=dev --path=/shared

# GitHub (optional)
infisical secrets set GITHUB_TOKEN=ghp_your-token-here --env=dev --path=/shared
infisical secrets set GITHUB_OWNER=your-username --env=dev --path=/shared
```

#### Verify Secrets

```powershell
# List all secrets in the /shared path
infisical secrets list --env=dev --path=/shared
```

---

### Step 3: Start the Orchestration Stack

#### Option A: Start Everything at Once

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker
.\start-all.ps1
```

This starts all 13 services in the correct order with proper dependency management.

#### Option B: Start Services Individually

```powershell
# Start orchestration (databases + Claude Flow + Archon)
.\start-orchestration.ps1

# Start MCP servers
.\start-mcp.ps1

# Start UI services
.\start-ui.ps1
```

#### Monitor Startup

```powershell
# Check status of all services
.\start-all.ps1 -Status

# View logs
docker compose -f docker-compose.orchestration.yml logs -f

# View specific service logs
docker logs nyra-claude-flow -f
```

---

### Step 4: Verify Installation

#### 4.1: Health Checks

```powershell
# Check database
docker exec nyra-postgres pg_isready -U nyra

# Check Redis
docker exec nyra-redis redis-cli -a $REDIS_PASSWORD ping

# Check Claude Flow
curl http://localhost:9000/health

# Check Archon OS
curl http://localhost:9001/health
```

#### 4.2: Access Services

Open your browser and visit:

- **Open-WebUI**: http://localhost:3333
- **Claude Flow**: http://localhost:9000
- **Archon OS**: http://localhost:9001
- **Letta**: http://localhost:8283

---

## 🏗️ Architecture

### Infisical Secret Flow

```
┌─────────────────┐
│ Infisical Cloud │ (Encrypted Secrets Storage)
│  Project Nyra   │
└────────┬────────┘
         │ API (Machine Identity Auth)
         ▼
┌─────────────────┐
│ Infisical CLI   │ (Secret Injection at Runtime)
│ infisical run   │
└────────┬────────┘
         │ Environment Variables (${VAR})
         ▼
┌─────────────────┐
│ Docker Compose  │ (Services with Injected Secrets)
│  13 Containers  │
└─────────────────┘
```

### Service Dependencies

```
PostgreSQL, Redis, FalkorDB, Qdrant (Layer 1: Data)
        ↓
Claude Flow, Archon OS, Nexus Router, Letta (Layer 2: Orchestration)
        ↓
Gemini MCP, Serena MCP, Mem0 (Layer 3: MCP Servers)
        ↓
Open-WebUI, LobeChat (Layer 4: User Interface)
```

### File Structure

```
Project-Nyra/
├── infra/
│   ├── docker/
│   │   ├── docker-compose.orchestration.yml  # Core services
│   │   ├── docker-compose.mcp.yml            # MCP servers
│   │   ├── docker-compose.ui.yml             # UI services
│   │   ├── start-all.ps1                     # Master start script
│   │   ├── start-orchestration.ps1           # Start orchestration
│   │   ├── start-mcp.ps1                     # Start MCP servers
│   │   └── start-ui.ps1                      # Start UI
│   └── infisical/
│       ├── agent-config.yaml                 # Infisical Agent config
│       ├── setup-infisical.ps1               # Setup helper
│       ├── imports.json                      # Bulk import mapping
│       ├── templates/                        # .env templates
│       │   ├── master.env.tmpl
│       │   ├── orchestration.env.tmpl
│       │   ├── mcp.env.tmpl
│       │   └── ui.env.tmpl
│       ├── env/                              # Local env files
│       │   └── dev.shared.env
│       └── secrets/                          # Machine Identity creds
│           ├── infisical-client-id
│           └── infisical-client-secret
```

---

## 🔧 Troubleshooting

### Issue 1: Infisical CLI Not Found

**Error**: `The term 'infisical' is not recognized...`

**Solution**:
```powershell
# Install via Scoop
scoop install infisical

# Verify
infisical --version

# Restart PowerShell after installation
```

### Issue 2: Authentication Failed

**Error**: `Failed to authenticate with Infisical`

**Solution**:
```powershell
# Re-login
infisical login

# Verify Machine Identity credentials
cat infra\infisical\secrets\infisical-client-id
cat infra\infisical\secrets\infisical-client-secret

# Test connection
infisical secrets list --env=dev --path=/shared
```

### Issue 3: Secrets Not Found

**Error**: `Secret "ANTHROPIC_API_KEY" not found`

**Solution**:
```powershell
# Check what secrets exist
infisical secrets list --env=dev --path=/shared

# Upload missing secrets
infisical secrets set ANTHROPIC_API_KEY=your-key --env=dev --path=/shared

# Verify
infisical secrets get ANTHROPIC_API_KEY --env=dev --path=/shared
```

### Issue 4: Docker Services Won't Start

**Error**: Container exits immediately or health checks fail

**Solution**:
```powershell
# Check Docker is running
docker info

# Check service logs
docker logs nyra-postgres
docker logs nyra-claude-flow

# Verify environment variables are injected
docker inspect nyra-claude-flow | Select-String "ANTHROPIC_API_KEY"

# Restart with verbose logging
.\start-orchestration.ps1 -Verbose
```

### Issue 5: Port Already in Use

**Error**: `Bind for 0.0.0.0:9000 failed: port is already allocated`

**Solution**:
```powershell
# Find process using the port
netstat -ano | findstr :9000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change the port in Infisical
infisical secrets set CLAUDE_FLOW_PORT=9001 --env=dev --path=/shared
```

---

## 🚀 Advanced Usage

### Running Infisical Agent (Auto-Sync)

For development, you can run Infisical Agent to auto-refresh secrets every 60 seconds:

```powershell
cd infra\infisical
infisical agent --config agent-config.yaml
```

This creates `.env.rendered` files that Docker Compose can use without `infisical run`:

```powershell
# Use rendered env file
docker compose --env-file ../../.env.orchestration.rendered -f docker-compose.orchestration.yml up -d
```

### Multiple Environments

```powershell
# Start with staging environment
.\start-all.ps1 -Environment staging

# Start with production environment
.\start-all.ps1 -Environment prod

# Each environment has separate secrets in Infisical:
# - /shared (dev)
# - /shared (staging)
# - /shared (prod)
```

### Selective Service Startup

```powershell
# Only databases and Claude Flow
infisical run --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/shared" -- docker compose -f docker-compose.orchestration.yml up postgresql redis claude-flow

# Only specific services
docker compose -f docker-compose.orchestration.yml up -d postgresql redis
```

### Bulk Secret Management

```powershell
# Export all secrets to JSON
infisical secrets export --env=dev --path=/shared --format=json > secrets-backup.json

# Import from another source
infisical secrets import --env=dev --path=/shared --file=secrets-import.json

# Copy dev to staging
infisical secrets export --env=dev --path=/shared --format=dotenv > temp.env
infisical secrets set --env=staging --path=/shared --file=temp.env
```

### Secret Rotation

```powershell
# Update a secret
infisical secrets set POSTGRES_PASSWORD=new-secure-password --env=dev --path=/shared

# Restart affected services
docker compose -f docker-compose.orchestration.yml restart postgresql
```

---

## 📚 Additional Resources

- **Infisical Documentation**: https://infisical.com/docs
- **Claude Flow GitHub**: https://github.com/ruvnet/claude-flow
- **Docker Compose Reference**: https://docs.docker.com/compose/
- **Phase 3 Full Guide**: `./phase3-orchestration-execution-guide.md`
- **Composable Templates**: `../../.claude/skills/bootstrap-agent/COMPOSABLE-TEMPLATES.md`

---

## 🎉 Summary

You now have a **production-ready orchestration stack** with:

✅ Secure secret management via Infisical
✅ 13 services running in Docker
✅ Multi-agent workflow orchestration
✅ Development interfaces ready to use
✅ All secrets encrypted and centrally managed
✅ Easy deployment across environments

### Quick Commands Reference

```powershell
# Start everything
.\start-all.ps1

# Check status
.\start-all.ps1 -Status

# View logs
docker compose -f docker-compose.orchestration.yml logs -f

# Stop everything
.\start-all.ps1 -Down

# Update secrets
infisical secrets set KEY=value --env=dev --path=/shared

# Restart service
docker compose -f docker-compose.orchestration.yml restart claude-flow
```

---

**🚀 Happy Orchestrating!**

*For support, issues, or contributions, visit: https://github.com/ruvnet/claude-flow*
