# Project Nyra - Distributed PC Setup Scripts

**Generated**: 2026-01-15
**Status**: Ready for Deployment

## Overview

Complete automated setup scripts for Project Nyra's 4-PC distributed architecture. Each PC node has both Windows PowerShell and WSL Bash setup scripts that handle full environment configuration, including Docker, Claude Flow, and Infisical integration.

## Architecture

### PC Nodes

| Node | GPU | VRAM | Role | Worker ID | Path |
|------|-----|------|------|-----------|------|
| **Orchestrator Mini** | N/A | N/A | MCP Servers, Coordination, Memory | N/A | `orchestrator-mini/setup/` |
| **Worker RTX 3060** | RTX 3060 | 12GB | AI Inference Worker | worker-1 | `worker-rtx3060/setup/` |
| **Worker RTX 5090** | RTX 5090 | 32GB | High-Performance AI Inference | worker-2 | `worker-rtx5090/setup/` |
| **Worker RTX 3090 Ti** | RTX 3090 Ti | 24GB | High-End AI Inference | worker-3 | `worker-rtx3090ti/setup/` |

---

## Setup Scripts Overview

### Each PC Node Includes:

1. **setup-windows.ps1** - Windows PowerShell setup script
   - WSL2 installation and configuration
   - Docker Desktop installation
   - Node.js, Git, and essential tools
   - Claude Flow CLI installation
   - Infisical CLI installation
   - Project directory structure creation
   - Environment configuration

2. **setup-wsl.sh** - WSL/Ubuntu Bash setup script
   - System package updates
   - Docker Engine installation (WSL)
   - NVIDIA Container Toolkit (workers only)
   - Claude Flow CLI installation
   - Infisical configuration
   - Python 3.11 installation
   - GPU monitoring tools (workers only)
   - Docker Compose files
   - Health check and monitoring scripts

---

## Prerequisites

### All Nodes

- Windows 10/11 (version 2004 or higher)
- Administrator access
- Internet connection
- Infisical project and service tokens

### Worker Nodes (Additional)

- NVIDIA GPU (RTX 3060, 5090, or 3090 Ti)
- Latest NVIDIA drivers installed
- Minimum 16GB system RAM
- SSD with at least 100GB free space

---

## Installation Guide

### Step 1: Prepare Infisical Credentials

Before starting, obtain from Infisical:
- `INFISICAL_PROJECT_ID` - Your project ID
- `INFISICAL_TOKEN` - Service token for the environment
- `ORCHESTRATOR_URL` - URL of orchestrator node (for workers)

### Step 2: Run Windows Setup (All Nodes)

**For Orchestrator:**
```powershell
# Open PowerShell as Administrator
cd C:\Dev\Projects\Repos\Project-Nyra\assets\new-uploads-ingestion-input\bootstrap\orchestrator-mini\setup

.\setup-windows.ps1 -InfisicalToken "st.xxx..." -InfisicalProjectId "proj-xxx..."
```

**For Worker Nodes:**
```powershell
# Open PowerShell as Administrator
cd C:\Dev\Projects\Repos\Project-Nyra\assets\new-uploads-ingestion-input\bootstrap\worker-rtx3060\setup

.\setup-windows.ps1 -InfisicalToken "st.xxx..." -InfisicalProjectId "proj-xxx..." -OrchestratorUrl "https://orchestrator.nyra.local"
```

Replace `worker-rtx3060` with `worker-rtx5090` or `worker-rtx3090ti` as appropriate.

**If WSL/Docker Already Installed:**
```powershell
.\setup-windows.ps1 -SkipWSL -SkipDocker -InfisicalToken "..." -InfisicalProjectId "..."
```

### Step 3: Restart Computer

After Windows setup completes:
1. Restart your computer (required for WSL2)
2. Start Docker Desktop after restart
3. Enable WSL2 integration in Docker Desktop settings

### Step 4: Run WSL Setup (All Nodes)

**For Orchestrator:**
```powershell
# From Windows PowerShell
wsl -d Ubuntu -- bash /mnt/c/nyra-orchestrator/setup-wsl.sh
```

**For Worker Nodes:**
```powershell
# For RTX 3060
wsl -d Ubuntu -- bash /mnt/c/nyra-worker-rtx3060/setup-wsl.sh

# For RTX 5090
wsl -d Ubuntu -- bash /mnt/c/nyra-worker-rtx5090/setup-wsl.sh

# For RTX 3090 Ti
wsl -d Ubuntu -- bash /mnt/c/nyra-worker-rtx3090ti/setup-wsl.sh
```

**With Infisical Environment Variables:**
```bash
# Inside WSL
export INFISICAL_TOKEN="st.xxx..."
export INFISICAL_PROJECT_ID="proj-xxx..."
bash ~/nyra-orchestrator/setup-wsl.sh
```

### Step 5: Verify Installation

**For Orchestrator:**
```bash
# Inside WSL
~/nyra-orchestrator/scripts/health-check.sh
```

**For Workers:**
```bash
# Inside WSL
~/nyra-worker-rtx3060/scripts/health-check.sh
# or
~/nyra-worker-rtx5090/scripts/health-check.sh
# or
~/nyra-worker-rtx3090ti/scripts/health-check.sh
```

---

## What Gets Installed

### Orchestrator Mini PC

**Windows Components:**
- WSL2 with Ubuntu
- Docker Desktop
- Node.js LTS
- Git
- Claude Flow CLI
- Infisical CLI
- Chocolatey package manager

**WSL Components:**
- Docker CLI (connects to Docker Desktop)
- Node.js via nvm
- Claude Flow CLI
- Infisical CLI
- Python 3.11
- PostgreSQL client
- Redis client
- Monitoring tools (htop, iotop, nethogs)

**Services (Docker Compose):**
- PostgreSQL with pgvector
- Redis
- Qdrant (Vector DB)
- Prometheus
- Grafana

**Project Structure:**
```
C:\nyra-orchestrator\
├── config/          # Configuration files
├── data/            # Data storage
├── logs/            # Log files
├── scripts/         # Utility scripts
│   ├── start-orchestrator.ps1
│   └── health-check.sh
├── secrets/         # Secrets (from Infisical)
├── .env             # Environment variables
└── docker-compose.orchestrator.yml
```

### Worker Nodes (All GPU Types)

**Windows Components:**
- WSL2 with Ubuntu
- Docker Desktop
- Node.js LTS
- Git
- Claude Flow CLI
- Infisical CLI
- Chocolatey package manager
- NVIDIA drivers (if not already installed)

**WSL Components:**
- Docker Engine
- NVIDIA Container Toolkit
- Node.js via nvm
- Claude Flow CLI
- Infisical CLI
- Python 3.11
- GPU monitoring tools (nvtop, htop)

**Services (Docker Compose):**
- Ollama (Local LLM inference)
- vLLM (Fast inference server)
- DCGM Exporter (GPU metrics for Prometheus)

**Project Structure:**
```
C:\nyra-worker-rtx3060\  (or rtx5090, rtx3090ti)
├── config/          # Configuration files
├── data/            # Data storage
├── logs/            # Log files
├── scripts/         # Utility scripts
│   ├── start-worker.ps1
│   ├── monitor-gpu.ps1
│   ├── health-check.sh
│   └── gpu-dashboard.sh
├── secrets/         # Secrets (from Infisical)
├── models/          # LLM models
├── .env             # Environment variables
└── docker-compose.worker.yml
```

---

## Usage

### Starting Services

**Orchestrator (Windows PowerShell):**
```powershell
C:\nyra-orchestrator\scripts\start-orchestrator.ps1
C:\nyra-orchestrator\scripts\start-orchestrator.ps1 -Logs  # With logs
```

**Worker (Windows PowerShell):**
```powershell
C:\nyra-worker-rtx3060\scripts\start-worker.ps1
C:\nyra-worker-rtx3060\scripts\start-worker.ps1 -Logs  # With logs
```

**Using Infisical (WSL):**
```bash
# Orchestrator
cd ~/nyra-orchestrator
infisical run --env=production --path=/nyra/orchestrator -- docker compose -f docker-compose.orchestrator.yml up -d

# Worker
cd ~/nyra-worker-rtx3060
infisical run --env=production --path=/nyra/worker-1 -- docker compose -f docker-compose.worker.yml up -d
```

**Using Aliases (WSL):**
```bash
# After sourcing .bashrc
nyra-start   # Start services
nyra-stop    # Stop services
nyra-status  # Show status
nyra-logs    # View logs
```

### Monitoring

**GPU Monitoring (Workers Only):**
```powershell
# Windows PowerShell
C:\nyra-worker-rtx3060\scripts\monitor-gpu.ps1
```

```bash
# WSL
~/nyra-worker-rtx3060/scripts/gpu-dashboard.sh
# or
gpumon        # Watch nvidia-smi
gpustat       # Show GPU stats
```

**Health Checks:**
```bash
# WSL
~/nyra-orchestrator/scripts/health-check.sh
~/nyra-worker-rtx3060/scripts/health-check.sh
```

**Docker Status:**
```bash
# WSL
docker compose ps
docker stats --no-stream
```

---

## Infisical Integration

### Secrets Structure

Each PC node expects secrets in Infisical at these paths:

```
/nyra/orchestrator    # Orchestrator secrets
/nyra/worker-1        # RTX 3060 worker
/nyra/worker-2        # RTX 5090 worker
/nyra/worker-3        # RTX 3090 Ti worker
```

### Required Secrets

**Orchestrator:**
- `POSTGRES_PASSWORD`
- `POSTGRES_USER` (optional, default: nyra)
- `POSTGRES_DB` (optional, default: nyra_db)
- `GRAFANA_PASSWORD` (optional, default: admin)
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `CHROMA_TOKEN`

**Workers:**
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- Any model-specific API keys

### Infisical Agent Sidecar

The setup scripts configure Infisical to run as a sidecar container that:
- Fetches secrets from Infisical Cloud
- Injects secrets into other containers
- Automatically refreshes secrets
- Provides local secrets cache

---

## Troubleshooting

### WSL Installation Issues

**Problem:** WSL installation fails
```powershell
# Check Windows version
winver
# Must be Windows 10 version 2004+ or Windows 11

# Enable required features manually
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart and retry
```

### Docker Issues

**Problem:** Docker daemon not accessible in WSL
```bash
# Check Docker Desktop is running (Windows)
# Enable WSL2 integration in Docker Desktop settings:
# Settings -> Resources -> WSL Integration -> Enable for Ubuntu
```

**Problem:** "Cannot connect to Docker daemon"
```bash
# Add user to docker group (requires logout/login)
sudo usermod -aG docker $USER
# Then logout and login to WSL
exit
wsl
```

### GPU Issues (Workers Only)

**Problem:** GPU not accessible in containers
```bash
# Verify nvidia-smi works on Windows host
# Then check in WSL:
nvidia-smi

# Test Docker GPU access:
docker run --rm --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi

# If fails, reinstall NVIDIA Container Toolkit:
sudo apt-get remove --purge nvidia-container-toolkit
sudo apt-get install nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

**Problem:** "nvidia-smi: command not found" in WSL
```bash
# This is normal - nvidia-smi runs on Windows host
# WSL accesses GPU through Docker with --gpus flag
# Use: docker run --gpus all ...
```

### Infisical Issues

**Problem:** "Authentication failed"
```bash
# Re-authenticate
infisical login

# Or set environment variables
export INFISICAL_TOKEN="st.xxx..."
export INFISICAL_PROJECT_ID="proj-xxx..."

# Test connection
infisical secrets
```

**Problem:** Secrets not loading in containers
```bash
# Check Infisical service is running
docker compose ps

# Check Infisical logs
docker compose logs infisical-mcp

# Verify secrets path
infisical secrets --path=/nyra/orchestrator
```

### Claude Flow Issues

**Problem:** "Claude Flow CLI not found"
```bash
# Ensure nvm is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Reinstall Claude Flow
npm install -g @claude-flow/cli@latest

# Or use npx
npx @claude-flow/cli@latest doctor
```

---

## Network Configuration

### Distributed Setup

For multi-PC distributed deployment:

1. **Ensure all PCs are on the same network**
2. **Configure firewall rules to allow:**
   - Orchestrator: Ports 8000-8010, 5432, 6379, 6333, 9090, 3000
   - Workers: Ports 8000-8001, 9001, 11434

3. **Update orchestrator URL in worker .env files:**
   ```bash
   # Workers
   ORCHESTRATOR_URL=http://<orchestrator-ip>:8000
   ```

4. **Configure Docker networks:**
   ```bash
   # Use overlay network for multi-host
   # Or set up VPN/Cloudflare Tunnel for secure communication
   ```

### Security Recommendations

1. **Use Cloudflare Tunnel for external access**
2. **Enable TLS for all inter-node communication**
3. **Rotate Infisical tokens regularly**
4. **Use firewall to restrict access to orchestrator**
5. **Monitor access logs via Grafana/Loki**

---

## Post-Setup Verification Checklist

### Orchestrator Node

- [ ] WSL2 installed and Ubuntu accessible
- [ ] Docker Desktop running with WSL2 integration
- [ ] Claude Flow CLI accessible (`npx @claude-flow/cli@latest --version`)
- [ ] Infisical authenticated (`infisical secrets`)
- [ ] All services running (`docker compose ps`)
- [ ] PostgreSQL accessible (`psql -U nyra -d nyra_db`)
- [ ] Redis accessible (`redis-cli ping`)
- [ ] Grafana accessible (http://localhost:3000)
- [ ] Prometheus accessible (http://localhost:9090)

### Worker Nodes

- [ ] WSL2 installed and Ubuntu accessible
- [ ] Docker Desktop running with WSL2 integration
- [ ] NVIDIA drivers installed (Windows: `nvidia-smi`)
- [ ] GPU accessible in WSL (`nvidia-smi` or test container)
- [ ] NVIDIA Container Toolkit working (`docker run --gpus all nvidia/cuda:12.3.0-base-ubuntu22.04 nvidia-smi`)
- [ ] Claude Flow CLI accessible
- [ ] Infisical authenticated
- [ ] Ollama service running (`docker compose ps`)
- [ ] vLLM service running (`docker compose ps`)
- [ ] GPU metrics exposed (`curl http://localhost:9001/metrics`)
- [ ] Can pull and run models (`docker exec nyra-ollama ollama pull llama2`)

---

## Maintenance

### Updating Components

**Update Docker images:**
```bash
docker compose pull
docker compose up -d
```

**Update Claude Flow CLI:**
```bash
npm update -g @claude-flow/cli
```

**Update Infisical CLI:**
```bash
# WSL
sudo apt-get update
sudo apt-get upgrade infisical
```

**Update system packages:**
```bash
sudo apt-get update
sudo apt-get upgrade
```

### Backup Strategy

**Important directories to backup:**
- `C:\nyra-*/data/` - Data volumes
- `C:\nyra-*/config/` - Configuration files
- `C:\nyra-*/.env` - Environment variables (excluding secrets)
- Docker volumes: `docker volume ls | grep nyra`

**Backup Docker volumes:**
```bash
# Backup
docker run --rm -v nyra_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz /data

# Restore
docker run --rm -v nyra_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres-backup.tar.gz -C /
```

---

## Support & Resources

- **Claude Flow Documentation**: https://github.com/ruvnet/claude-flow
- **Infisical Documentation**: https://infisical.com/docs
- **Docker Documentation**: https://docs.docker.com
- **NVIDIA Container Toolkit**: https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/

---

## File Locations

### Scripts Created

```
bootstrap/
├── orchestrator-mini/setup/
│   ├── setup-windows.ps1    # Windows setup for orchestrator
│   └── setup-wsl.sh          # WSL setup for orchestrator
├── worker-rtx3060/setup/
│   ├── setup-windows.ps1    # Windows setup for RTX 3060
│   └── setup-wsl.sh          # WSL setup for RTX 3060
├── worker-rtx5090/setup/
│   ├── setup-windows.ps1    # Windows setup for RTX 5090
│   └── setup-wsl.sh          # WSL setup for RTX 5090
├── worker-rtx3090ti/setup/
│   ├── setup-windows.ps1    # Windows setup for RTX 3090 Ti
│   └── setup-wsl.sh          # WSL setup for RTX 3090 Ti
└── README-SETUP-SCRIPTS.md  # This file
```

---

**Last Updated**: 2026-01-15
**Version**: 1.0.0
**Status**: Production Ready
