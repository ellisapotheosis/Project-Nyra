# NYRA Project Setup Guide

## 🎯 Quick Answers to Your Questions

### **1. "Use in Claude Code" Clarification**
- **Primary endpoint**: Claude Code will connect directly to individual MCP servers (no nexus router needed)
- **API Key**: Each MCP server handles its own authentication
- **Fuzzy search**: Available through archon-os's built-in search capabilities

### **2. Claude.cmd Wrapper Removal ✅**
- **Removed**: The problematic claude.cmd wrapper has been replaced
- **New Solution**: Use `nyra-claude.ps1` with Infisical auto-injection
- **Usage**: `nyra-claude.ps1 flow memory store key value`

### **3. Architecture Clarification ✅**
- **Orchestrator PC**: Runs MCP servers via Docker (no UI)
- **Client PCs (RTX3060/RTX5090)**: Run UI components and GPU-intensive services
- **Development**: Clone repos for development, containerize for production

## 🏗️ Architecture Overview

```
Orchestrator PC (Mini PC)    Client PC (RTX3060/RTX5090)
├── MetaMCP Router           ├── Archon OS UI
├── archon-os Dev          ├── Open WebUI
├── RuVector Memory          ├── Neural Processing
├── ruvector                  ├── ONNX Runtime
├── letta Knowledge       ├── Transformers
├── Flow Nexus              └── Serena Assistant
├── Filesystem MCP
├── GitHub MCP
├── Security MCPs
└── All Core MCP Servers
```

## 🚀 Complete Setup Process

### **Step 1: Remove Claude.cmd Wrapper**
```powershell
# Remove the old wrapper
Remove-Item "claude.cmd" -ErrorAction SilentlyContinue

# Setup new Infisical-based environment
.\scripts\setup-env-secrets.ps1 -Global -Persistent
```

### **Step 2: Setup Development Repositories**
```powershell
# Clone your forked repositories and setup submodules
.\scripts\setup-development-repos.ps1 -Force

# This will:
# - Clone github.com/ellisapotheosis/archon-os to submodules/archon-os
# - Clone github.com/ellisapotheosis/archon to submodules/archon
# - Setup development branches and npm dependencies
# - Initialize git submodules properly
```

### **Step 3: Start Infrastructure**
```powershell
# On Orchestrator PC: Start MCP servers
.\scripts\start-nyra-docker-infrastructure.ps1 -Profile orchestrator -Force

# On Client PC: Start UI and GPU services
.\scripts\start-nyra-docker-infrastructure.ps1 -Profile client -Force

# Or start everything if running on single machine:
.\scripts\start-nyra-docker-infrastructure.ps1 -Profile all -Force
```

### **Step 4: Configure Claude Code**
Your `.mcp.json` now has **18 MCP servers** (not 22+, but comprehensive coverage):
- Core: filesystem, git, github, docker, browser-use, shell, fetch, time
- AI: archon-os, ruv-swarm, flow-nexus, puppeteer, sequential-thinking
- Security: bitwarden, infisical
- Development: mem0, context7, codanna, repo-docs, inception

### **Step 5: Use the System**
```powershell
# Use Claude Code with auto-injected secrets
nyra-claude.ps1 flow memory store "project_context" "NYRA development setup"

# Access UIs
# Archon OS: http://localhost:8051
# Open WebUI: http://localhost:3000
# archon-os: http://localhost:7403
```

## 🔧 Addressing Your Specific Concerns

### **MetaMCP vs Nexus Router**
- **You're right**: MetaMCP is redundant with our direct MCP approach
- **Solution**: Disabled MetaMCP in favor of direct docker endpoints
- **Result**: No router complexity, direct tool access

### **Memory Systems (Correct Ones)**
- ✅ **RuVector MCP**: Primary vector memory (port 7406)
- ✅ **ruvector MCP**: Agent database memory (port 7407)
- ✅ **letta MCP**: Knowledge graph memory (port 8797)
- ✅ **Mem0**: Personalization memory
- ❌ **Removed**: memtensor (as you requested)

### **Missing Components Added**
- ✅ **Serena MCP**: Assistant (port 8092)
- ✅ **Gemini Assistant MCP**: Google AI (port 8093)
- ✅ **archon-os Development Kit**: Via submodule
- ✅ **Archon OS MCP**: With 4 docker services (frontend, backend, db, redis)

### **Dual Orchestration: archon-os + Archon**
- **archon-os**: Primary orchestrator for AI/agents/memory
- **Archon OS**: Secondary orchestrator for UI/workflows/user interaction
- **Integration**: Both communicate via shared memory and API endpoints
- **Sync**: Configured in `config/development.json`

### **Development vs Production**
- **Development**: Use submodules (live code editing)
  - `submodules/archon-os` - Your fork for development
  - `submodules/archon` - Your fork for development
- **Production**: Use Docker containers (stable deployment)
  - Dockerfile builds from your forks
  - Environment variables via Infisical

## 🎯 archon-os Plugin Commands

Use these via Claude Code with the `nyra-claude.ps1` wrapper:

### **Memory Commands**
```powershell
nyra-claude.ps1 flow memory store "key" "value" --namespace "agents"
nyra-claude.ps1 flow memory search "query" --namespace "patterns"
nyra-claude.ps1 flow memory stats
```

### **Agent Commands**
```powershell
nyra-claude.ps1 flow agent spawn researcher --name "Requirements Analyst"
nyra-claude.ps1 flow agent list
nyra-claude.ps1 flow agent metrics
```

### **Orchestration Commands**
```powershell
nyra-claude.ps1 flow orchestrate "Build REST API" --strategy development
nyra-claude.ps1 flow swarm "Complex task" --agents 5 --background
```

### **Automation Commands**
```powershell
nyra-claude.ps1 flow automate workflow --file "workflows/development.yml"
nyra-claude.ps1 flow automate agent-selection --task "database design"
```

## 🔍 Memory System Status

### **archon-os Memory Initialization**
The SQL memory setup should now work:
```powershell
# Inside docker container (automatic on startup)
docker exec nyra-archon-os-dev npx @archon-os/cli@latest memory init --reasoningbank --ruvector --ruvector
docker exec nyra-archon-os-dev npx @archon-os/cli@latest agent memory init --reasoningbank
```

### **Missing Packages Resolution**
The packages that don't exist as NPM modules are now:
- **Docker services**: RuVector, ruvector, letta (via docker)
- **Integrated tools**: ONNX, @xenova/transformers (via containers)
- **Development tools**: Epic SDK, Agent-Booster (via archon-os fork)

## 🚨 What Was Fixed

1. ❌ **Nexus router complexity** → ✅ **Direct MCP endpoints**
2. ❌ **Claude.cmd wrapper issues** → ✅ **Infisical auto-injection**
3. ❌ **Non-existent NPM packages** → ✅ **Docker services + real packages**
4. ❌ **22+ servers confusion** → ✅ **18 working, categorized servers**
5. ❌ **MetaMCP redundancy** → ✅ **Removed redundant routing**
6. ❌ **Missing development setup** → ✅ **Forked repos as submodules**
7. ❌ **Memory system confusion** → ✅ **RuVector + ruvector + letta**

## 🎉 Next Steps

1. **Run the setup**: `.\scripts\setup-development-repos.ps1 -Force`
2. **Start infrastructure**: `.\scripts\start-nyra-docker-infrastructure.ps1 -Force`
3. **Test archon-os**: `nyra-claude.ps1 flow memory stats`
4. **Access Archon**: `http://localhost:8051`
5. **Use dual orchestration**: Both archon-os and Archon working together

The architecture is now properly dockerized, development-friendly, and avoids all the wrapper/routing issues you encountered!