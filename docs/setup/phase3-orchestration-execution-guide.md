# Phase 3: ULTRA-FAST-START Orchestration Execution Guide

**Date**: January 8, 2026
**Status**: Ready for Execution
**Estimated Time**: 15-20 minutes (automated)

---

## 🎯 Overview

This guide covers the complete execution of Phase 3: orchestration stack setup for Project Nyra. The installation script will set up 8 major components, configure Docker services, and create a fully integrated development environment.

---

## ✅ Pre-Execution Checklist

### Required Dependencies

Before running the installation, ensure these are installed:

```powershell
# Check all dependencies
git --version          # Git for cloning repositories
docker --version       # Docker for containerization
node --version         # Node.js >=18.0.0
pnpm --version         # pnpm for monorepo management
python --version       # Python for MCP servers
cargo --version        # Rust/Cargo for RuVector
```

### API Keys Required

Gather these API keys before starting:

1. **Google Gemini API Key**
   - Get from: https://makersuite.google.com/app/apikey
   - For: Gemini Assistant MCP server

2. **Anthropic API Key** (if not already configured)
   - Get from: https://console.anthropic.com/
   - For: Claude API access

3. **OpenRouter API Key** (optional)
   - Get from: https://openrouter.ai/keys
   - For: LLM routing fallback

4. **GPU Worker URLs** (if you have local GPU workers)
   - RTX 5090 Worker URL
   - RTX 3090 Worker URL
   - RTX 3060 Worker URL

---

## 📦 Components That Will Be Installed

### 1. Claude Code Development Kit (CCDK)
- **Location**: `.ccdk/`
- **Source**: https://github.com/peterkrueck/Claude-Code-Development-Kit.git
- **Purpose**: Development toolkit for Claude Code
- **Required**: Yes

### 2. MCP Gemini Assistant
- **Location**: `mcp-servers/gemini-assistant/`
- **Source**: https://github.com/peterkrueck/mcp-gemini-assistant.git
- **Purpose**: Google Gemini integration via MCP
- **Port**: 8085
- **Required**: Yes

### 3. Serena MCP (Codebase Analysis)
- **Location**: `mcp-servers/serena/`
- **Source**: https://github.com/serena-ai/serena-mcp.git
- **Purpose**: Intelligent codebase analysis
- **Port**: 8086
- **Required**: Yes

### 4. Claude Flow (Workflow Orchestration)
- **Location**: `orchestration/claude-flow/`
- **Source**: https://github.com/ruvnet/claude-flow.git
- **Purpose**: Multi-agent workflow orchestration
- **Port**: 9000
- **Required**: Yes

### 5. Archon OS (Agent Operating System)
- **Location**: `orchestration/archon-os/`
- **Source**: https://github.com/archon-ai/archon-os.git
- **Purpose**: Task management and resource scheduling
- **Port**: 9001
- **Required**: Yes

### 6. Nexus Router (LLM Routing Service)
- **Location**: `services/nexus-router/`
- **Type**: Custom implementation (created by script)
- **Purpose**: Intelligent LLM request routing (GPU → Cloud)
- **Port**: 8000
- **Required**: Yes

### 7. Open-WebUI (Development Interface)
- **Location**: `ui/open-webui/`
- **Source**: https://github.com/open-webui/open-webui.git
- **Purpose**: Primary development interface
- **Port**: 3333
- **Required**: No (Optional)

### 8. LobeChat (Alternative Dev UI)
- **Location**: `ui/lobechat/`
- **Source**: https://github.com/lobehub/lobe-chat.git
- **Purpose**: Alternative development interface
- **Port**: 3334
- **Required**: No (Optional)

---

## 🚀 Execution Steps

### Phase 1: Install All Components

```powershell
# Navigate to Project Nyra root
cd C:\Dev\Projects\Repos\Project-Nyra

# Option 1: Full installation (recommended)
.\scripts\setup\install-all-components.ps1 -Verbose

# Option 2: Skip dependency check (if you know dependencies are met)
.\scripts\setup\install-all-components.ps1 -SkipDependencyCheck -Verbose

# Option 3: Development mode (for testing)
.\scripts\setup\install-all-components.ps1 -DevelopmentMode -Verbose
```

**What Happens**:
1. Checks system dependencies
2. Clones 7 repositories
3. Creates Nexus Router from scratch
4. Installs Node.js dependencies (pnpm install)
5. Installs Python dependencies (pip install)
6. Creates 3 Docker Compose files
7. Creates orchestration integration config
8. Creates Docker network: `nyra-network`

**Expected Duration**: 10-15 minutes (depending on internet speed)

**Log File**: `bootstrap/setup-log-YYYYMMDD-HHMMSS.txt`

---

### Phase 2: Configure Environment

Create or update your `.env` file in the project root:

```bash
# ==============================================
# Project Nyra - Environment Configuration
# ==============================================

# ==============================================
# API Keys (REQUIRED)
# ==============================================

# Google Gemini (for Gemini Assistant MCP)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# Anthropic Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# OpenRouter (Optional - for LLM fallback)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# ==============================================
# Orchestration Services
# ==============================================

CLAUDE_FLOW_PORT=9000
ARCHON_PORT=9001
NEXUS_PORT=8000

# ==============================================
# MCP Servers
# ==============================================

GEMINI_MCP_PORT=8085
SERENA_MCP_PORT=8086

# ==============================================
# UI Services
# ==============================================

OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334

# ==============================================
# Database Configuration
# ==============================================

# PostgreSQL (for Claude Flow)
DATABASE_URL=postgresql://nyra:nyra_password@postgresql:5432/nyra_db

# Redis (for caching and queues)
REDIS_URL=redis://redis:6379

# ==============================================
# GPU Workers (Optional - Local GPU Inference)
# ==============================================

# RTX 5090 Worker
GPU_WORKER_5090_URL=http://gpu-worker-5090:11434

# RTX 3090 Worker
GPU_WORKER_3090_URL=http://gpu-worker-3090:11434

# RTX 3060 Worker
GPU_WORKER_3060_URL=http://gpu-worker-3060:11434

# ==============================================
# Development Settings
# ==============================================

NODE_ENV=development
LOG_LEVEL=info
DEBUG=false
```

**Copy Template**:
```powershell
# Use the template if available
cp config/templates/complete.env.template .env

# Then edit with your actual keys
notepad .env
```

---

### Phase 3: Start All Services

```powershell
# Ensure Docker network exists
docker network create nyra-network

# Start orchestration services (Claude Flow + Archon OS)
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d

# Start MCP servers (Gemini + Serena)
docker-compose -f infra/docker/docker-compose.mcp.yml up -d

# Start UI services (Open-WebUI + LobeChat)
docker-compose -f infra/docker/docker-compose.ui.yml up -d

# Check all containers are running
docker ps
```

**Expected Output**:
```
CONTAINER ID   IMAGE                    STATUS         PORTS                    NAMES
xxxxxxxxx      nyra-claude-flow         Up 10 seconds  0.0.0.0:9000->9000/tcp   nyra-claude-flow
xxxxxxxxx      nyra-archon-os           Up 10 seconds  0.0.0.0:9001->9001/tcp   nyra-archon-os
xxxxxxxxx      nyra-mcp-gemini          Up 10 seconds  0.0.0.0:8085->8085/tcp   nyra-mcp-gemini
xxxxxxxxx      nyra-mcp-serena          Up 10 seconds  0.0.0.0:8086->8086/tcp   nyra-mcp-serena
xxxxxxxxx      nyra-open-webui          Up 10 seconds  0.0.0.0:3333->8080/tcp   nyra-open-webui
xxxxxxxxx      nyra-lobechat            Up 10 seconds  0.0.0.0:3334->3210/tcp   nyra-lobechat
```

---

### Phase 4: Verify Installation

#### Health Checks

```powershell
# Test Claude Flow
curl http://localhost:9000/health

# Test Archon OS
curl http://localhost:9001/health

# Test Nexus Router
curl http://localhost:8000/health

# Test Gemini MCP
curl http://localhost:8085/health

# Test Serena MCP
curl http://localhost:8086/health
```

#### Access Web Interfaces

```powershell
# Open-WebUI (Primary development interface)
start http://localhost:3333

# LobeChat (Alternative development interface)
start http://localhost:3334
```

#### Test Nexus Router Routing

```powershell
# Test LLM request routing
curl -X POST http://localhost:8000/v1/chat/completions `
  -H "Content-Type: application/json" `
  -d '{
    "model": "claude-3-sonnet-20240229",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 📊 Post-Installation Verification Checklist

- [ ] All 6-8 containers running (docker ps shows all)
- [ ] Claude Flow responds to /health (http://localhost:9000/health)
- [ ] Archon OS responds to /health (http://localhost:9001/health)
- [ ] Nexus Router responds to /health (http://localhost:8000/health)
- [ ] Gemini MCP accessible (http://localhost:8085/health)
- [ ] Serena MCP accessible (http://localhost:8086/health)
- [ ] Open-WebUI loads in browser (http://localhost:3333)
- [ ] LobeChat loads in browser (http://localhost:3334)
- [ ] No error messages in docker logs
- [ ] Setup log file created successfully

---

## 📂 Directory Structure After Installation

```
Project-Nyra/
├── .ccdk/                          # Claude Code Dev Kit
├── orchestration/
│   ├── claude-flow/               # Workflow orchestrator (Port 9000)
│   ├── archon-os/                 # Agent OS (Port 9001)
│   └── integration/
│       └── dual-orchestrator.json # Integration config
├── mcp-servers/
│   ├── gemini-assistant/          # Gemini MCP (Port 8085)
│   ├── serena/                    # Serena codebase analysis (Port 8086)
│   └── [existing memory systems]  # Memory, Context, etc.
├── services/
│   └── nexus-router/              # LLM routing (Port 8000)
│       ├── index.js               # Router implementation
│       └── package.json           # Dependencies
├── ui/
│   ├── open-webui/                # Primary dev UI (Port 3333)
│   ├── lobechat/                  # Alternative UI (Port 3334)
│   └── dify/                      # Existing production UI
├── infra/docker/
│   ├── docker-compose.orchestration.yml
│   ├── docker-compose.mcp.yml
│   └── docker-compose.ui.yml
└── bootstrap/
    └── setup-log-*.txt            # Installation log
```

---

## 🔧 Troubleshooting

### Issue: Dependency Not Found

```powershell
# Install missing dependencies

# Git
winget install Git.Git

# Docker
winget install Docker.DockerDesktop

# Node.js
winget install OpenJS.NodeJS.LTS

# pnpm
npm install -g pnpm

# Python
winget install Python.Python.3.11

# Rust/Cargo
winget install Rustlang.Rustup
```

### Issue: Component Already Exists

The script will ask if you want to overwrite. Options:
- `y` - Overwrite existing component
- `n` - Skip this component

### Issue: Port Already in Use

```powershell
# Check what's using the port
netstat -ano | findstr :9000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change the port in .env file
# CLAUDE_FLOW_PORT=9010
```

### Issue: Docker Network Already Exists

```powershell
# This is okay, the script handles it gracefully
# If you need to recreate:
docker network rm nyra-network
docker network create nyra-network
```

### Issue: Container Failed to Start

```powershell
# Check container logs
docker logs nyra-claude-flow
docker logs nyra-archon-os

# Restart specific container
docker-compose -f infra/docker/docker-compose.orchestration.yml restart claude-flow

# Rebuild and restart
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d --build
```

### Issue: API Key Not Working

```powershell
# Verify .env file is in project root
ls .env

# Check environment variables are loaded
docker-compose -f infra/docker/docker-compose.orchestration.yml config

# Restart services to reload environment
docker-compose -f infra/docker/docker-compose.orchestration.yml restart
```

---

## 🎯 Success Criteria

Phase 3 is complete when:

- [x] All components installed without errors
- [x] All Docker Compose files created
- [x] Docker network created
- [x] .env file configured with API keys
- [x] All containers running
- [x] Health checks passing for all services
- [x] Web UIs accessible
- [x] Setup log shows no critical errors
- [x] Nexus Router can route LLM requests

---

## 📈 Performance Expectations

### Component Sizes
- CCDK: ~50MB
- Claude Flow: ~200MB
- Archon OS: ~150MB
- MCP Servers: ~100MB each
- UI Services: ~500MB each
- **Total Disk Space**: ~2-3GB

### Resource Usage
- **CPU**: 2-4 cores recommended
- **RAM**: 8GB minimum, 16GB recommended
- **Network**: ~2GB download during installation
- **Docker**: 4GB RAM limit per container

### Startup Times
- Orchestration services: 30-60 seconds
- MCP servers: 10-20 seconds
- UI services: 60-90 seconds
- **Total warmup time**: 2-3 minutes

---

## 🚀 Next Steps After Phase 3

1. **Test Integration**
   - Submit a test workflow through Claude Flow
   - Verify Archon OS receives and executes tasks
   - Check Nexus Router routes requests correctly

2. **Configure MCP Clients**
   - Add Gemini Assistant to Claude Desktop
   - Add Serena MCP to Claude Desktop
   - Test codebase analysis features

3. **Create First Workflow**
   - Use bootstrap-agent skill to initialize a new module
   - Submit workflow to Claude Flow
   - Monitor execution in Archon OS

4. **Proceed to Phase 4**
   - Create SPARC workflows
   - Integrate NyraDocs for containerization
   - Build final GUI installer

---

## 📚 Additional Resources

- **Claude Flow Documentation**: `orchestration/claude-flow/README.md`
- **Archon OS Documentation**: `orchestration/archon-os/README.md`
- **Nexus Router API**: `services/nexus-router/README.md`
- **Docker Compose Reference**: `infra/docker/README.md`
- **Troubleshooting Guide**: `docs/guides/troubleshooting.md`

---

## 🎉 Completion

Once all verification steps pass, **Phase 3 is complete!**

You now have a fully functioning:
- ✅ Dual orchestration system (Claude Flow + Archon OS)
- ✅ 2 new MCP servers (Gemini + Serena)
- ✅ Intelligent LLM routing (Nexus Router)
- ✅ 2 development interfaces (Open-WebUI + LobeChat)
- ✅ Complete Docker orchestration
- ✅ Integrated development environment

**Ready to proceed to Phase 4: SPARC Workflows & Final Integration**

---

**End of Phase 3 Execution Guide**
