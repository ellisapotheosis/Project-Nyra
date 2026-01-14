# Project Nyra - Orchestration Setup Guide

## Status: Ready to Execute

**Prerequisites Met**:
- ✓ Bootstrap extraction complete (52+ major extractions)
- ✓ install-all-components.ps1 extracted to scripts/setup/
- ✓ ULTRA-FAST-START.md extracted to docs/guides/

## Quick Start (3 Minutes Setup, Go to Dinner Method)

### Option 1: Fully Automated (Copy & Paste to Claude Code)

```
I need you to set up the complete Project Nyra orchestration stack. Execute these steps sequentially:

PHASE 1: Install All Components
- Navigate to C:\Dev\Projects\Repos\Project-Nyra
- Run: .\scripts\setup\install-all-components.ps1 -Verbose
- This installs: CCDK, Gemini Assistant, Serena MCP, Nexus Router, Claude Flow, Archon OS, Open-WebUI, LobeChat

PHASE 2: Configure Environment
- Add to .env file:
  GOOGLE_GEMINI_API_KEY=[get from https://makersuite.google.com/app/apikey]
  CLAUDE_FLOW_PORT=9000
  ARCHON_PORT=9001
  NEXUS_PORT=8000
  OPEN_WEBUI_PORT=3333
  LOBECHAT_PORT=3334

PHASE 3: Start All Services
- Run: docker network create nyra-network
- Run: docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
- Run: docker-compose -f infra/docker/docker-compose.mcp.yml up -d
- Run: docker-compose -f infra/docker/docker-compose.ui.yml up -d

PHASE 4: Verify Everything Works
- Test Claude Flow: curl http://localhost:9000/health
- Test Archon OS: curl http://localhost:9001/health
- Test Nexus Router: curl http://localhost:8000/health
- Test Open-WebUI: open http://localhost:3333
- Test LobeChat: open http://localhost:3334

Execute all phases now. Report progress. Don't wait for approval between phases.
```

### Option 2: Manual Execution (5-10 minutes)

```powershell
# Navigate to project
cd C:\Dev\Projects\Repos\Project-Nyra

# Run installation (requires 10-20 minutes)
.\scripts\setup\install-all-components.ps1 -Verbose

# Follow prompts, then proceed to configuration
```

## What Gets Installed

### Components (Cloned from Git)

1. **Claude Code Development Kit (CCDK)**
   - Repo: https://github.com/peterkrueck/Claude-Code-Development-Kit.git
   - Path: `.ccdk/`
   - Purpose: Dev toolkit for Claude Code integration

2. **MCP Gemini Assistant**
   - Repo: https://github.com/peterkrueck/mcp-gemini-assistant.git
   - Path: `mcp-servers/gemini-assistant/`
   - Purpose: Gemini AI consultation integration

3. **Serena MCP**
   - Repo: https://github.com/serena-ai/serena-mcp.git
   - Path: `mcp-servers/serena/`
   - Purpose: Advanced codebase analysis

4. **Claude Flow**
   - Repo: https://github.com/ruvnet/claude-flow.git
   - Path: `orchestration/claude-flow/`
   - Purpose: Multi-agent workflow orchestration

5. **Archon OS**
   - Repo: https://github.com/archon-ai/archon-os.git
   - Path: `orchestration/archon-os/`
   - Purpose: Agent operating system and task management

6. **Open-WebUI**
   - Repo: https://github.com/open-webui/open-webui.git
   - Path: `ui/open-webui/`
   - Purpose: Main development interface

7. **LobeChat**
   - Repo: https://github.com/lobehub/lobe-chat.git
   - Path: `ui/lobechat/`
   - Purpose: Alternative development UI

8. **Nexus Router** (Custom Service)
   - Path: `services/nexus-router/`
   - Purpose: LLM routing (GPU workers → OpenRouter → Anthropic)

### Dependencies Required

The script checks for:
- **git**: Repository cloning
- **docker**: Container orchestration
- **node**: JavaScript runtime
- **pnpm**: Monorepo package management
- **python**: MCP server runtime
- **cargo**: Rust/RuVector components

### Installation Process

For each component, the script:
1. Creates installation directory
2. Clones git repository
3. Installs Node.js dependencies (`pnpm install`)
4. Installs Python dependencies (`pip install -r requirements.txt`)
5. Logs all actions to `bootstrap/setup-log-YYYY-MM-DD-HHmmss.txt`

### Nexus Router Creation

The script creates a custom Express.js service:
- Package.json with dependencies (express, axios, redis, dotenv)
- Basic routing implementation
- Health check endpoint
- LLM routing logic

## Post-Installation Configuration

### 1. Environment Variables (.env)

Add to project root `.env` file:

```bash
# Orchestration Ports
CLAUDE_FLOW_PORT=9000
ARCHON_PORT=9001
NEXUS_PORT=8000

# UI Ports
OPEN_WEBUI_PORT=3333
LOBECHAT_PORT=3334
DIFY_PORT=3000

# API Keys
GOOGLE_GEMINI_API_KEY=<get from https://makersuite.google.com/app/apikey>
ANTHROPIC_API_KEY=<your key>
OPENAI_API_KEY=<your key>

# LLM Routing
NEXUS_DEFAULT_PROVIDER=anthropic
NEXUS_FALLBACK_PROVIDER=openrouter

# GPU Workers (4-PC Setup)
WORKER_5090_URL=http://192.168.1.11:11434  # RTX 5090 48GB
WORKER_3090_URL=http://192.168.1.12:11434  # RTX 3090 Ti 24GB
WORKER_3060_URL=http://192.168.1.13:11434  # RTX 3060 12GB
```

### 2. Docker Network Setup

```bash
# Create shared network for all services
docker network create nyra-network
```

### 3. Service Startup

#### Orchestration Layer
```bash
docker-compose -f infra/docker/docker-compose.orchestration.yml up -d
```

**Services Started**:
- Claude Flow (port 9000)
- Archon OS (port 9001)

#### MCP Servers
```bash
docker-compose -f infra/docker/docker-compose.mcp.yml up -d
```

**Services Started**:
- Gemini Assistant (port 8085)
- Serena (port 8086)
- RuVector (port 6333)
- Letta (port 8283)
- Graphiti (port 8000)
- Mem0 (port 8001)
- OpenMemory (port 8002)

#### UI Services
```bash
docker-compose -f infra/docker/docker-compose.ui.yml up -d
```

**Services Started**:
- Open-WebUI (port 3333)
- LobeChat (port 3334)
- Dify (port 3000)

## Verification Checklist

### Health Checks

```powershell
# Check orchestration
curl http://localhost:9000/health    # Claude Flow
curl http://localhost:9001/health    # Archon OS
curl http://localhost:8000/health    # Nexus Router

# Check MCP servers
curl http://localhost:8085/health    # Gemini Assistant
curl http://localhost:8086/health    # Serena

# Open UIs
start http://localhost:3333          # Open-WebUI
start http://localhost:3334          # LobeChat
start http://localhost:3000          # Dify
```

### Docker Container Status

```bash
docker ps
```

Expected containers:
- `claude-flow`
- `archon-os`
- `nexus-router`
- `gemini-assistant`
- `serena`
- `open-webui`
- `lobechat`
- `ruvector`
- `letta`
- `graphiti`

### Installation Log

Check for errors:
```powershell
notepad C:\Dev\Projects\Repos\Project-Nyra\bootstrap\setup-log-*.txt
```

## Troubleshooting

### Missing Dependencies

If dependency check fails:
```powershell
# Install using Chocolatey (Windows)
choco install git nodejs python rust docker-desktop

# Install pnpm globally
npm install -g pnpm

# Restart PowerShell after installation
```

### Git Clone Failures

- Check internet connection
- Verify repository URLs are accessible
- Check GitHub authentication if private repos

### Docker Issues

```powershell
# Verify Docker is running
docker info

# Restart Docker Desktop
# Check Docker daemon logs in Docker Desktop
```

### Port Conflicts

If ports are already in use, modify `.env` file with different ports.

### Installation Hangs

- Check firewall settings
- Verify antivirus isn't blocking
- Check available disk space (needs ~5GB)

## Next Steps After Installation

1. ✓ Installation Complete
2. **Configure MCP in Claude Desktop**
   - Add claude-flow, gemini-assistant, serena to .mcp.json
3. **Test Orchestration**
   - Run simple workflow through Claude Flow
   - Test agent spawning with Archon OS
4. **Batch CLAUDE.md Generation**
   - Create custom CLAUDE.md for every directory
5. **SPARC Workflows**
   - Set up development workflows for all apps

## Estimated Timeline

- **Installation**: 10-20 minutes (depending on internet speed)
- **Configuration**: 5 minutes
- **Service Startup**: 2-3 minutes
- **Verification**: 2 minutes

**Total**: ~20-30 minutes from start to fully operational

## Support

- Log file location: `bootstrap/setup-log-*.txt`
- Extraction reports: `docs/reports/bootstrap-extraction-*.log`
- Troubleshooting: See installation log for specific errors
