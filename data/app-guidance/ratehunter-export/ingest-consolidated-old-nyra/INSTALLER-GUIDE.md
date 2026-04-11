# Project Nyra GUI Installer Guide

**Version**: 4.0.0
**Last Updated**: January 15, 2026
**Purpose**: Comprehensive guide for using the Project Nyra Bootstrap GUI Installer

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Getting Started](#-getting-started)
3. [Installation Phases](#-installation-phases)
4. [Advanced Features](#-advanced-features)
5. [Configuration Management](#-configuration-management)
6. [Troubleshooting](#-troubleshooting)
7. [FAQ](#-faq)

---

## 🎯 Overview

The Project Nyra GUI Installer is a React-based wizard that automates the complete setup of your 4-PC distributed AI cluster. It handles everything from hardware detection to service deployment, eliminating manual configuration errors.

### Key Features

- **🖥️ PC Role Detection**: Automatic hardware analysis and role suggestion
- **🌐 Network Configuration**: Static IP and Tailscale VPN setup
- **🐳 Docker Management**: Installation, configuration, and validation
- **📦 Component Selection**: Modular installation of services
- **🔧 MCP Server Setup**: Configure AI orchestration tools
- **⚙️ Configuration Editing**: In-app .env file editing
- **🚀 Service Deployment**: One-click Docker Compose deployment
- **✅ Health Validation**: Comprehensive service health checks
- **💾 State Persistence**: Resume interrupted installations
- **🔄 Rollback Support**: Restore previous configurations

### Technology Stack

```yaml
Frontend: React 18 + TypeScript
Bundler: Vite
State Management: Zustand
Styling: Tailwind CSS
Runtime: Node.js 20+
```

---

## 🚀 Getting Started

### Prerequisites

**System Requirements**:
- Windows 11 Pro (build 22000+) or macOS 12+
- 10GB free disk space
- Internet connection
- Administrator privileges

**Software Dependencies**:
```powershell
# Verify Node.js
node --version  # Required: v20.x.x

# Verify npm
npm --version   # Required: 9.x.x or higher

# Verify Git
git --version   # Required: 2.40+
```

### Installation

```powershell
# Clone repository
git clone https://github.com/your-org/Project-Nyra.git
cd Project-Nyra/bootstrap/installer

# Install dependencies
npm install

# Start GUI installer
npm run dev
```

The installer will launch in your default browser at `http://localhost:5173`.

---

## 🎬 Installation Phases

### Phase 1: PC Selection

**Purpose**: Identify your PC role (orchestrator or worker) based on hardware.

#### Automatic Detection

The installer analyzes:
- **CPU**: Model, cores, threads
- **RAM**: Total capacity
- **GPU**: Presence, model, VRAM
- **Storage**: Available disk space
- **Network**: Adapter name, current IP

#### Hardware Detection Example

```
Detected Hardware:
├── CPU: Intel Core i7-11800H (8 cores, 16 threads)
├── RAM: 32GB DDR4
├── Storage: 1TB NVMe SSD (750GB free)
├── GPU: None (Integrated graphics only)
└── Network: Ethernet (Gigabit)

Suggested Role: Orchestrator (PC1)
Reason: No discrete GPU detected, sufficient RAM for coordination services
```

#### Role Selection

| Role | Hardware Profile | Services |
|------|-----------------|----------|
| **PC1 - Orchestrator** | CPU focus, 32GB+ RAM, no GPU | Databases, MCP servers, monitoring |
| **PC2 - Worker (RTX 4090)** | High-end GPU, 64GB+ RAM | AI inference, reasoning |
| **PC3 - Worker (RTX 4090)** | High-end GPU, 64GB+ RAM | Code analysis, testing |
| **PC4 - Worker (RTX 3060)** | Mid-range GPU, 32GB RAM | Code generation, editing |

#### Manual Override

If automatic detection is incorrect:
1. Click **Manual Selection**
2. Choose your PC role from dropdown
3. Click **Confirm**

**When to override**:
- Multiple GPUs installed
- Shared multi-purpose machine
- Testing different configurations
- Custom deployment scenarios

---

### Phase 2: Environment Selection

**Purpose**: Configure environment-specific settings.

#### Available Environments

**Development**:
```yaml
Use Case: Local testing and development
Features:
  - Debug logging enabled
  - Hot-reload enabled
  - Development ports exposed
  - Mock external services
  - Relaxed security
```

**Staging**:
```yaml
Use Case: Pre-production testing
Features:
  - Production-like setup
  - External service integration
  - Performance monitoring
  - Stricter security
  - Realistic data volumes
```

**Production**:
```yaml
Use Case: Live deployment
Features:
  - Optimized performance
  - Full security hardening
  - Encrypted secrets (Infisical)
  - Automated backups
  - High availability
```

#### Environment-Specific Configuration

```bash
# Development .env
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
MOCK_EXTERNAL_APIS=true

# Production .env
NODE_ENV=production
LOG_LEVEL=info
ENABLE_HOT_RELOAD=false
MOCK_EXTERNAL_APIS=false
USE_INFISICAL=true
ENABLE_BACKUPS=true
```

---

### Phase 3: Component Selection

**Purpose**: Choose which services to install on this PC.

#### Required Components

**Claude Code** (auto-selected):
- AI pair programming tool
- MCP server integration
- Required on all PCs

**Docker Desktop** (auto-selected):
- Container runtime
- Required for all services
- Includes Docker Compose

#### Optional Components

**Claude Desktop**:
```yaml
Description: Desktop AI assistant
Use Case: Manual AI interactions
Installs:
  - Claude Desktop app
  - MCP server configuration
Recommended For: All PCs
```

**Claude Flow**:
```yaml
Description: Multi-agent orchestration framework
Use Case: Swarm coordination, task distribution
Installs:
  - @claude-flow/cli
  - Claude Flow daemon
  - Memory systems
Recommended For: PC1 (Orchestrator)
```

**WSL Setup** (PC1 only):
```yaml
Description: Windows Subsystem for Linux
Use Case: Run Linux containers, bash scripts
Installs:
  - WSL 2
  - Ubuntu 22.04
  - Docker integration
Recommended For: PC1 (Orchestrator)
```

**Infisical**:
```yaml
Description: Secrets management platform
Use Case: Centralized credential storage
Installs:
  - Infisical CLI
  - Vault integration
Recommended For: Production environments
```

**Gitea** (PC1 only, optional):
```yaml
Description: Self-hosted Git server
Use Case: Private Git hosting
Installs:
  - Gitea server
  - PostgreSQL database
Recommended For: Air-gapped environments
```

**NVIDIA Container Toolkit** (GPU workers only):
```yaml
Description: GPU support for Docker
Use Case: Run GPU-accelerated AI models
Installs:
  - NVIDIA drivers
  - CUDA toolkit
  - Container runtime
Required For: PC2, PC3, PC4
```

#### Component Dependencies

```mermaid
graph TD
    A[Claude Code] --> B[Docker Desktop]
    C[Claude Flow] --> B
    C --> D[Claude Code]
    E[WSL Setup] --> B
    F[Gitea] --> B
    F --> G[PostgreSQL]
    H[NVIDIA Toolkit] --> B
```

---

### Phase 4: MCP Server Configuration

**Purpose**: Configure Model Context Protocol servers for AI orchestration.

#### Available MCP Servers

**Claude Flow MCP**:
```yaml
Description: Claude Flow orchestration
Features:
  - Swarm initialization
  - Agent spawning
  - Task coordination
  - Memory management
Configuration:
  - No API key required
  - Auto-detected from installation
```

**RUV Swarm MCP**:
```yaml
Description: Advanced swarm coordination
Features:
  - Hierarchical topologies
  - Consensus algorithms
  - Load balancing
Configuration:
  - No API key required
```

**AgentDB**:
```yaml
Description: Vector memory database
Features:
  - 150x faster search (HNSW)
  - Persistent memory
  - Multi-agent coordination
Configuration:
  - No API key required
  - Auto-configured with PostgreSQL
```

**RuVector**:
```yaml
Description: Neural pattern learning
Features:
  - SONA (Self-Optimizing Neural Architecture)
  - MoE (Mixture of Experts)
  - Flash Attention
Configuration:
  - No API key required
```

**Letta**:
```yaml
Description: Advanced memory server
Features:
  - Long-term memory
  - Multi-agent memory
  - Memory search
Configuration:
  - Requires PostgreSQL backend
  - Auto-configured
```

**Graphiti**:
```yaml
Description: Graph-based memory
Features:
  - Knowledge graphs
  - Relationship tracking
  - Context management
Configuration:
  - No API key required
```

**Mem0**:
```yaml
Description: Memory augmentation
Features:
  - Memory distillation
  - Pattern recognition
  - Cross-agent memory
Configuration:
  - No API key required
```

**Filesystem**:
```yaml
Description: File system operations
Features:
  - Read/write files
  - Directory management
  - Search operations
Configuration:
  - Workspace path: Auto-detected
```

**GitHub**:
```yaml
Description: GitHub integration
Features:
  - Repository management
  - PR operations
  - Issue tracking
Configuration:
  - Requires GitHub personal access token
  - Scopes: repo, workflow, read:org
```

#### API Key Configuration

```yaml
Required API Keys:
  Anthropic:
    - Key format: sk-ant-api03-...
    - Get from: https://console.anthropic.com/
    - Scopes: All

  OpenAI (optional):
    - Key format: sk-...
    - Get from: https://platform.openai.com/
    - Scopes: API access

  GitHub (optional):
    - Key format: ghp_...
    - Get from: https://github.com/settings/tokens
    - Scopes: repo, workflow, read:org
```

#### MCP Configuration Preview

The installer generates `.mcp.json`:

```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "npx",
      "args": ["-y", "@claude-flow/cli@latest"],
      "env": {
        "CLAUDE_FLOW_CONFIG": "./claude-flow.config.json"
      }
    },
    "ruv-swarm": {
      "command": "npx",
      "args": ["-y", "ruv-swarm", "mcp", "start"]
    },
    "agentdb": {
      "command": "node",
      "args": ["C:\\Users\\user\\.claude\\mcp-servers\\agentdb\\index.js"],
      "env": {
        "POSTGRES_URL": "postgresql://user:pass@localhost:5432/nyra"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..."
      }
    }
  }
}
```

---

### Phase 5: Docker Setup

**Purpose**: Install and configure Docker Desktop.

#### Docker Installation

**Automatic Installation**:
```powershell
# Installer runs:
winget install Docker.DockerDesktop

# Waits for installation
# Starts Docker Desktop
# Verifies Docker Engine
```

**Manual Installation** (if automatic fails):
1. Download Docker Desktop from https://www.docker.com/products/docker-desktop
2. Run installer
3. Restart computer
4. Return to GUI installer
5. Click **Verify Docker**

#### Docker Configuration

**Resource Allocation**:

```yaml
PC1 (Orchestrator):
  Memory: 16GB (leave 16GB for host)
  CPUs: 6 (leave 2 for host)
  Disk: 500GB
  Swap: 2GB

PC2/3/4 (Workers):
  Memory: 48GB (leave 16GB for host)
  CPUs: 14 (leave 2 for host)
  Disk: 1TB
  Swap: 4GB
```

**Daemon Configuration**:

The installer configures `daemon.json`:

```json
{
  "builder": {
    "gc": {
      "enabled": true,
      "defaultKeepStorage": "20GB"
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
```

**GPU Configuration** (Workers only):

```json
{
  "runtimes": {
    "nvidia": {
      "path": "nvidia-container-runtime",
      "runtimeArgs": []
    }
  },
  "default-runtime": "nvidia"
}
```

#### Docker Verification

```powershell
# Checks performed:
docker --version           # Version 24.0+
docker compose version     # Version 2.20+
docker info               # Daemon running
docker run hello-world    # Can pull and run images
docker network ls         # Networking functional
```

---

### Phase 6: Configuration Editor

**Purpose**: Edit environment variables and service settings.

#### Environment File Editing

**PC1 (.env.pc1)**:
```bash
# PC Configuration
PC_ID=pc1
PC_ROLE=orchestrator
PC_IP=10.0.0.1
PC_HOSTNAME=pc1-orchestrator

# Database Credentials
POSTGRES_USER=nyra_admin
POSTGRES_PASSWORD=<auto-generated-32-char>
POSTGRES_DB=nyra
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=<auto-generated-32-char>
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Qdrant
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=<auto-generated-32-char>

# FalkorDB
FALKORDB_HOST=localhost
FALKORDB_PORT=6380

# Letta
LETTA_HOST=localhost
LETTA_PORT=8000
LETTA_BACKEND=postgres

# LiteLLM
LITELLM_HOST=localhost
LITELLM_PORT=4000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_PASSWORD=<auto-generated-32-char>
LOKI_PORT=3100

# Tailscale
TAILSCALE_AUTH_KEY=tskey-...

# Claude Flow
CLAUDE_FLOW_CONFIG=./claude-flow.config.json
CLAUDE_FLOW_LOG_LEVEL=info
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

**PC2/3/4 (.env.pc2, etc.)**:
```bash
# PC Configuration
PC_NUMBER=2
PC_ROLE=worker
PC_IP=10.0.0.2
PC_GPU=rtx4090
PC_HOSTNAME=pc2-worker-4090

# Ollama
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_ORIGINS=*
OLLAMA_NUM_PARALLEL=4
OLLAMA_MAX_LOADED_MODELS=3

# GPU Configuration
CUDA_VISIBLE_DEVICES=0
NVIDIA_VISIBLE_DEVICES=all

# Monitoring
NODE_EXPORTER_PORT=9100
```

#### In-App Editing

**Features**:
- Syntax highlighting
- Auto-completion
- Validation
- Password generation
- Import/export

**Validation**:
```yaml
Rules:
  - Required fields must be filled
  - Passwords: Min 16 characters
  - API keys: Valid format
  - Ports: 1024-65535
  - IPs: Valid IPv4 format
```

#### Configuration Templates

**Quick Fill**:
- Development Template
- Staging Template
- Production Template

**Custom Templates**:
- Save current configuration
- Load from file
- Share across PCs

---

### Phase 7: Shim Generation

**Purpose**: Create MCP server wrapper scripts for easy launching.

#### What are Shims?

Shims are wrapper scripts that:
- Set up environment variables
- Handle path resolution
- Provide error handling
- Enable logging
- Simplify MCP server launching

#### Generated Shims

**Windows PowerShell Shim**:
```powershell
# claude-flow-mcp.ps1
param(
    [switch]$Debug,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$env:CLAUDE_FLOW_CONFIG = Join-Path $PSScriptRoot "claude-flow.config.json"

if ($Debug) {
    $env:CLAUDE_FLOW_LOG_LEVEL = "debug"
}

if ($Verbose) {
    Write-Host "Starting Claude Flow MCP Server..."
    Write-Host "Config: $env:CLAUDE_FLOW_CONFIG"
}

try {
    & npx -y @claude-flow/cli@latest
} catch {
    Write-Error "Failed to start Claude Flow MCP: $_"
    exit 1
}
```

**WSL Bash Shim**:
```bash
#!/usr/bin/env bash
# claude-flow-mcp.sh

set -euo pipefail

export CLAUDE_FLOW_CONFIG="$(dirname "$0")/claude-flow.config.json"

if [[ "${DEBUG:-}" == "1" ]]; then
    export CLAUDE_FLOW_LOG_LEVEL="debug"
fi

if [[ "${VERBOSE:-}" == "1" ]]; then
    echo "Starting Claude Flow MCP Server..."
    echo "Config: $CLAUDE_FLOW_CONFIG"
fi

npx -y @claude-flow/cli@latest
```

#### Shim Installation

Shims are installed to:
- **Windows**: `%USERPROFILE%\.claude\mcp-servers\`
- **WSL**: `~/.claude/mcp-servers/`

Desktop shortcuts created:
- Start Menu: `Project Nyra → [MCP Server Name]`
- Desktop: `[MCP Server Name].lnk`

---

### Phase 8: Deployment

**Purpose**: Deploy Docker Compose services.

#### Deployment Process

```mermaid
sequenceDiagram
    participant Installer
    participant Docker
    participant Services

    Installer->>Docker: docker compose pull
    Docker-->>Installer: Images downloaded

    Installer->>Docker: docker compose up -d
    Docker->>Services: Start containers
    Services-->>Docker: Running
    Docker-->>Installer: Deployment complete

    Installer->>Services: Health checks
    Services-->>Installer: All healthy
```

#### Real-Time Progress

```
Deployment Progress:

[████████████████████] 100%  Pulling postgres:15
[████████████████████] 100%  Pulling redis:7-alpine
[████████████████████] 100%  Pulling qdrant/qdrant:latest
[███████████████-----]  75%  Pulling falkordb/falkordb:latest
[█████---------------]  25%  Pulling letta/letta-server:latest
[--------------------]   0%  Pulling litellm/litellm:main-latest

Status: Downloading images... (4/12 complete)
ETA: 5 minutes
```

#### Deployment Logs

```
[2026-01-15 10:00:00] INFO: Starting deployment for PC1 (orchestrator)
[2026-01-15 10:00:05] INFO: Pulling image: postgres:15
[2026-01-15 10:01:30] SUCCESS: Pulled postgres:15 (342MB)
[2026-01-15 10:01:35] INFO: Starting container: nyra-postgres
[2026-01-15 10:01:40] SUCCESS: Container nyra-postgres is running
[2026-01-15 10:01:40] INFO: Waiting for health check...
[2026-01-15 10:01:50] SUCCESS: PostgreSQL is healthy
...
[2026-01-15 10:15:00] SUCCESS: All services deployed and healthy
```

#### Error Handling

**Automatic Retry**:
- Failed pulls: Retry 3 times
- Container crashes: Restart automatically
- Health check failures: Wait 60s and retry

**Manual Intervention**:
- Disk space issues: Free space and retry
- Port conflicts: Change ports in .env
- Network issues: Check internet connection

---

### Phase 9: Health Check

**Purpose**: Validate all services are running and accessible.

#### Health Check Categories

**Service Availability**:
```yaml
Checks:
  - Container is running
  - Process is active
  - Ports are listening
  - Responds to ping
```

**API Endpoints**:
```yaml
Checks:
  - HTTP 200 response
  - API authentication works
  - Database queries succeed
  - Vector searches return results
```

**Resource Usage**:
```yaml
Checks:
  - CPU < 80%
  - Memory < 90%
  - Disk space > 10GB
  - Network latency < 10ms
```

**Integration Tests**:
```yaml
Checks:
  - PostgreSQL to Letta connection
  - Redis caching works
  - Qdrant vector insert/search
  - Prometheus scraping metrics
  - Grafana loading dashboards
```

#### Health Check Results

```
Health Check Results:

✅ PostgreSQL (5432)
   Status: Healthy
   Response Time: 2ms
   Connections: 5/100
   Database Size: 50MB

✅ Redis (6379)
   Status: Healthy
   Response Time: 1ms
   Memory: 50MB / 2GB
   Keys: 1,234

✅ Qdrant (6333)
   Status: Healthy
   Response Time: 15ms
   Collections: 3
   Vectors: 10,000

✅ FalkorDB (6380)
   Status: Healthy
   Response Time: 3ms
   Nodes: 100
   Edges: 250

✅ Letta (8000)
   Status: Healthy
   Response Time: 50ms
   Backend: Connected

✅ LiteLLM (4000)
   Status: Healthy
   Response Time: 100ms
   Models: 5 loaded

✅ Prometheus (9090)
   Status: Healthy
   Response Time: 20ms
   Targets: 12/12 up

✅ Grafana (3000)
   Status: Healthy
   Response Time: 30ms
   Dashboards: 8

✅ Loki (3100)
   Status: Healthy
   Response Time: 25ms
   Log entries: 5,000

Overall Status: ✅ All systems operational
```

#### Failed Health Checks

```
⚠️ PostgreSQL (5432)
   Status: Unhealthy
   Error: Connection refused
   Troubleshooting:
     1. Check container logs: docker compose logs postgres
     2. Verify port 5432 is not in use
     3. Restart container: docker compose restart postgres

   [View Logs] [Restart Service] [Skip]
```

---

### Phase 10: Complete

**Purpose**: Summary and next steps.

#### Completion Summary

```
🎉 Installation Complete!

PC1 (Orchestrator) has been successfully configured.

Installed Services:
├── PostgreSQL (pgvector)     ✅
├── Redis                      ✅
├── Qdrant                     ✅
├── FalkorDB                   ✅
├── Letta                      ✅
├── LiteLLM                    ✅
├── Prometheus                 ✅
├── Grafana                    ✅
└── Loki                       ✅

Service URLs:
├── Grafana:    http://localhost:3000
├── Prometheus: http://localhost:9090
├── Qdrant:     http://localhost:6333
├── Letta:      http://localhost:8000
└── LiteLLM:    http://localhost:4000

Credentials:
├── Grafana: admin / <your-password>
├── PostgreSQL: nyra_admin / <your-password>
└── Redis: <your-password>

Next Steps:
1. Set up worker PCs (PC2, PC3, PC4)
2. Configure Claude Code with MCP servers
3. Initialize Claude Flow swarm
4. Deploy your first AI workload

Useful Commands:
├── View logs:    docker compose logs -f
├── Restart:      docker compose restart
├── Stop all:     docker compose down
├── Start all:    docker compose up -d
└── Health check: docker compose ps

Configuration saved to:
C:\Dev\Projects\Repos\Project-Nyra\bootstrap\.nyra-config.json

[View Logs] [Open Grafana] [Setup Another PC] [Exit]
```

---

## 🔧 Advanced Features

### Configuration Backup and Restore

**Backup Configuration**:
```powershell
# Automatic backup during installation
# Location: %APPDATA%\nyra-bootstrap-gui\backups\

# Manual backup
cp .env.pc1 .env.pc1.backup
cp .mcp.json .mcp.json.backup
```

**Restore Configuration**:
```powershell
# From GUI: Tools → Restore Configuration
# Select backup date
# Click Restore

# Manual restore
cp .env.pc1.backup .env.pc1
cp .mcp.json.backup .mcp.json
docker compose down
docker compose up -d
```

### Multi-PC Synchronization

**Export Configuration**:
1. Complete PC1 setup
2. Click **Export Configuration**
3. Select items to export:
   - ✅ MCP server list
   - ✅ API keys
   - ✅ Network settings
   - ☐ Database credentials (unique per PC)
4. Save to `nyra-config-export.json`
5. Copy to USB drive or network share

**Import Configuration** (on PC2/3/4):
1. Start installer
2. Click **Import Configuration**
3. Select `nyra-config-export.json`
4. Review imported settings
5. Continue with PC-specific configuration

### Custom Component Installation

**Add Custom Service**:
1. Create `docker-compose.custom.yml`:
   ```yaml
   version: '3.8'
   services:
     my-service:
       image: my-org/my-service:latest
       ports:
         - "8080:8080"
       networks:
         - nyra-network
   ```

2. In installer, select **Add Custom Service**
3. Upload `docker-compose.custom.yml`
4. Service is merged into deployment

### Log Management

**View Logs**:
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100

# Export logs
docker compose logs > logs.txt
```

**Log Rotation**:
```json
// daemon.json
{
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

---

## 🐛 Troubleshooting

### Installer Issues

**Issue**: Installer won't start

```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Start with verbose logging
npm run dev -- --verbose
```

**Issue**: Installation hangs

```
Possible causes:
1. Docker is not running
2. Network connectivity issues
3. Firewall blocking downloads
4. Insufficient disk space

Solutions:
- Check Docker Desktop is running
- Disable VPN temporarily
- Allow Docker in Windows Firewall
- Free up disk space (10GB+)
```

**Issue**: Configuration not saving

```powershell
# Check permissions
icacls "%APPDATA%\nyra-bootstrap-gui"

# Grant full control
icacls "%APPDATA%\nyra-bootstrap-gui" /grant %USERNAME%:F /t

# Retry installation
```

### Deployment Issues

**Issue**: Service won't start

```powershell
# Check container status
docker ps -a

# View logs
docker compose logs <service-name>

# Common fixes:
docker compose restart <service-name>  # Restart
docker compose down <service-name>     # Stop
docker compose up -d <service-name>    # Start
```

**Issue**: Port already in use

```powershell
# Find process using port
netstat -ano | findstr :5432

# Kill process (replace PID)
taskkill /PID 1234 /F

# Or change port in .env
POSTGRES_PORT=5433
```

**Issue**: Out of memory

```
Symptoms:
- Containers keep restarting
- OOM (Out of Memory) in logs
- System freezes

Solutions:
1. Increase Docker memory
   Docker Desktop → Settings → Resources → Memory: 20GB
2. Reduce service limits in docker-compose.yml
3. Close other applications
4. Upgrade RAM
```

---

## ❓ FAQ

**Q: Can I run multiple environments on one PC?**

A: Yes, but not recommended. Each environment needs separate ports and resources. Better to use separate PCs or VMs.

**Q: How do I update services?**

A: Run the installer again or use:
```powershell
docker compose pull
docker compose up -d
```

**Q: Can I use this without Tailscale?**

A: Yes, but you'll need to manually configure networking and firewall rules. Tailscale is strongly recommended.

**Q: What if I don't have a GPU?**

A: PC1 (orchestrator) doesn't need a GPU. Workers can run without GPU using CPU-only models (slower).

**Q: How do I add more worker PCs?**

A: Run the installer on each new PC, select "Worker" role, and configure with unique PC number.

**Q: Can I change configuration after installation?**

A: Yes:
1. Edit .env files manually
2. Run `docker compose down`
3. Run `docker compose up -d`

Or use the configuration editor in the installer.

**Q: How do I uninstall?**

A:
```powershell
# Stop and remove containers
docker compose down -v

# Remove images
docker system prune -a

# Uninstall Docker Desktop
winget uninstall Docker.DockerDesktop

# Remove configuration
Remove-Item -Recurse -Force "$env:APPDATA\nyra-bootstrap-gui"
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude"
```

**Q: Does this work on macOS or Linux?**

A: Partially. The installer runs on macOS, but some features (WSL, Windows-specific scripts) won't work. Full Linux support is planned.

---

## 📚 Additional Resources

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture
- **[SETUP-ORCHESTRATOR.md](SETUP-ORCHESTRATOR.md)** - PC1 detailed setup
- **[SETUP-WORKER-RTX4090.md](SETUP-WORKER-RTX4090.md)** - Worker PC setup
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Comprehensive troubleshooting
- **[Project Nyra Documentation](https://github.com/your-org/Project-Nyra/wiki)** - Full wiki

---

**Happy Installing!** 🚀

For support, open an issue on GitHub or contact the Project Nyra team.
