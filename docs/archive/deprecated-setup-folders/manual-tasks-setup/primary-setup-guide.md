# Project Nyra - Complete Setup Guide

**Version**: 2.0.0
**Last Updated**: 2026-01-21
**Estimated Time**: 2-4 hours

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Detailed Installation](#detailed-installation)
5. [Network Configuration](#network-configuration)
6. [Service Deployment](#service-deployment)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide provides comprehensive instructions for setting up Project Nyra across a 4-PC distributed AI infrastructure with dual orchestration (Claude Flow V3 + Archon OS), 22+ microservices, and distributed GPU compute.

### System Architecture

```
PC1 - Orchestrator (Mini PC):  Coordination, memory, routing
PC2 - Worker (RTX 3060):       Code generation, small models
PC3 - Worker (RTX 5090):       Large models, reasoning
PC4 - Worker (RTX 3090 Ti):    Analysis, mid-size models, monitoring
```

---

## Prerequisites

### Hardware Requirements

#### PC1 - Orchestrator (Minisforum UH680 or Mac Mini)
- **CPU**: Ryzen 7 6800H or equivalent (8+ cores)
- **RAM**: 16GB DDR5 minimum, 32GB recommended
- **Storage**: 100GB free space (1TB SSD recommended)
- **GPU**: Not required (CPU-only coordination)
- **Network**: Gigabit Ethernet

#### PC2 - Worker (Alienware M15R7 or similar)
- **CPU**: 6+ cores
- **RAM**: 32GB minimum
- **Storage**: 200GB free space
- **GPU**: NVIDIA RTX 3060 12GB VRAM
- **Network**: Gigabit Ethernet

#### PC3 - Worker (Alienware Area-51 or similar)
- **CPU**: 8+ cores
- **RAM**: 64GB recommended
- **Storage**: 500GB free space
- **GPU**: NVIDIA RTX 5090 48GB VRAM (or similar)
- **Network**: Gigabit Ethernet

#### PC4 - Worker (Desktop PC)
- **CPU**: 8+ cores
- **RAM**: 32GB minimum
- **Storage**: 200GB free space
- **GPU**: NVIDIA RTX 3090 Ti 24GB VRAM
- **Network**: Gigabit Ethernet

### Software Requirements

**All PCs**:
- Operating System: Windows 10/11, macOS 12+, or Ubuntu 20.04+
- Docker Desktop (latest version) or Docker Engine 24.0+
- Docker Compose 2.20+
- Git 2.40+
- Node.js 20+ (LTS via Volta recommended)
- pnpm 8+ or npm 9+
- Administrator/sudo privileges

**Additional for Windows**:
- PowerShell 7+
- WSL 2 (for Docker)
- Windows Terminal (recommended)

**Additional for GPU Workers (PC2, PC3, PC4)**:
- NVIDIA Drivers (latest)
- NVIDIA Container Toolkit
- CUDA 11.8+ or 12.0+

**Additional for macOS**:
- Homebrew
- Xcode Command Line Tools

### Network Requirements
- All 4 PCs on same local network or VPN mesh
- Static IP addresses or hostname resolution
- Internet connection for downloads (~20GB total first-time setup)
- Open ports between PCs (see Port Allocation section)
- Optional: Tailscale account for VPN mesh networking

### Required API Keys

1. **Anthropic API Key** (critical) - https://console.anthropic.com
   - Required for Claude models
   - Format: `sk-ant-api03-xxxxx`

2. **OpenRouter API Key** (recommended) - https://openrouter.ai
   - Multi-provider access
   - Format: `sk-or-v1-xxxxx`

3. **Google Gemini API Key** (optional) - https://makersuite.google.com
   - Cost-effective inference
   - Format: `AIzaSyxxxxx`

4. **Twilio Account** (for SMS/voice features)
   - Account SID
   - Auth Token
   - Phone Number

5. **SendGrid API Key** (for email features) - https://sendgrid.com

---

## Quick Start (30 Minutes)

For experienced users who want to get running quickly:

### 1. Clone Repository (All PCs)

```bash
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

### 2. Install Base Dependencies

```bash
# Install Node.js with Volta
curl https://get.volta.sh | bash
volta install node@20
volta install pnpm@8

# Install project dependencies
pnpm install
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
# Windows: notepad .env
# macOS/Linux: nano .env
```

**Critical variables to set**:
```bash
# API Keys
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# PC Configuration (set appropriately per PC)
PC_NAME=orchestrator  # or worker-2, worker-3, worker-4
PC_ROLE=orchestrator  # or worker
LAN_IP=10.0.0.1       # or appropriate IP

# Database Passwords (generate strong passwords)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
```

### 4. Deploy Services

**PC1 (Orchestrator)**:
```bash
docker compose -f infra/docker/docker-compose.orchestrator.yml up -d
```

**PC2, PC3, PC4 (Workers)**:
```bash
# PC2 (RTX 3060)
docker compose -f infra/docker/docker-compose.worker.yml --profile worker-2 up -d

# PC3 (RTX 5090)
docker compose -f infra/docker/docker-compose.worker.yml --profile worker-3 up -d

# PC4 (RTX 3090 Ti)
docker compose -f infra/docker/docker-compose.worker.yml --profile worker-4 up -d
```

### 5. Verify Deployment

```bash
# Check all containers
docker compose ps

# Health checks
curl http://localhost:6000/health  # Nexus Router (PC1)
curl http://localhost:8283/health  # Letta (PC1)
curl http://localhost:3000         # TwentyCRM (PC2)
curl http://localhost:11434        # Ollama (PC3)
curl http://localhost:9090/-/healthy  # Prometheus (PC4)
```

---

## Detailed Installation

### Phase 1: System Preparation (30 minutes)

#### Step 1.1: Install Base Software

**Windows**:
```powershell
# Install Chocolatey package manager
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install required software
choco install -y git docker-desktop nodejs-lts powershell-core
```

**macOS**:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install git docker node
brew install --cask docker
```

**Linux (Ubuntu/Debian)**:
```bash
# Install dependencies
sudo apt update && sudo apt install -y git curl

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 1.2: Install Volta (Node.js Version Manager)

**All platforms**:
```bash
# Install Volta
curl https://get.volta.sh | bash

# Restart shell or source profile
source ~/.bashrc  # or ~/.zshrc on macOS

# Install Node.js and pnpm
volta install node@20
volta install pnpm@8
```

#### Step 1.3: Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
```

#### Step 1.4: Install NVIDIA GPU Support (Workers Only)

**Windows**:
- Download and install latest NVIDIA drivers from nvidia.com
- Docker Desktop automatically includes GPU support

**Linux (Ubuntu)**:
```bash
# Install NVIDIA drivers
sudo ubuntu-drivers autoinstall

# Install NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker
```

**Verify GPU access**:
```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

#### Step 1.5: Start Docker Desktop

- **Windows**: Launch Docker Desktop from Start Menu, wait for "Docker Desktop is running"
- **macOS**: Open Docker.app from Applications, wait for whale icon to be stable
- **Linux**: Docker daemon starts automatically with system

**Verify Docker**:
```bash
docker --version      # Should show 24.0+
docker compose version  # Should show 2.20+
docker ps             # Should show no errors
```

---

### Phase 2: Network Configuration (20 minutes)

#### Step 2.1: Assign Static IPs (Optional but Recommended)

**PC1 (Orchestrator) - 10.0.0.1**

*Windows*:
```powershell
netsh interface ip set address "Ethernet" static 10.0.0.1 255.255.255.0 10.0.0.1
netsh interface ip set dns "Ethernet" static 8.8.8.8
netsh interface ip add dns "Ethernet" 8.8.4.4 index=2
```

*macOS*:
```bash
networksetup -setmanual "Ethernet" 10.0.0.1 255.255.255.0 10.0.0.1
networksetup -setdnsservers "Ethernet" 8.8.8.8 8.8.4.4
```

*Linux*:
```bash
# Edit /etc/netplan/01-netcfg.yaml (Ubuntu)
sudo nano /etc/netplan/01-netcfg.yaml

# Add:
network:
  version: 2
  ethernets:
    eth0:
      addresses: [10.0.0.1/24]
      gateway4: 10.0.0.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply
```

**Repeat for PC2 (10.0.0.2), PC3 (10.0.0.3), PC4 (10.0.0.4)**

#### Step 2.2: Test Connectivity

```bash
# From any PC, test connectivity to all others
ping -c 4 10.0.0.1
ping -c 4 10.0.0.2
ping -c 4 10.0.0.3
ping -c 4 10.0.0.4
```

All pings should succeed with <2ms latency on local network.

#### Step 2.3: Setup Tailscale VPN Mesh (Optional but Recommended)

```bash
# Install Tailscale
# Windows: https://tailscale.com/download/windows
# macOS: brew install --cask tailscale
# Linux: curl -fsSL https://tailscale.com/install.sh | sh

# Authenticate (opens browser)
sudo tailscale up

# Verify mesh
tailscale status

# Note Tailscale IPs for each PC
# Example: 100.100.100.1, 100.100.100.2, etc.
```

#### Step 2.4: Configure Firewall Rules

**Windows Firewall**:
```powershell
# Allow Docker containers
New-NetFirewallRule -DisplayName "Project Nyra - Nexus Router" -Direction Inbound -Protocol TCP -LocalPort 6000 -Action Allow
New-NetFirewallRule -DisplayName "Project Nyra - Services" -Direction Inbound -Protocol TCP -LocalPort 3000-9999 -Action Allow
```

**Linux (ufw)**:
```bash
sudo ufw allow 6000/tcp   # Nexus Router
sudo ufw allow 3000:9999/tcp  # All services
sudo ufw reload
```

---

### Phase 3: Repository Setup (15 minutes)

#### Step 3.1: Clone Project Nyra

**All PCs**:
```bash
# Create project directory
mkdir -p ~/Dev/Projects/Repos
cd ~/Dev/Projects/Repos

# Clone repository
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra

# Verify submodules
git submodule update --init --recursive
```

#### Step 3.2: Install Dependencies

```bash
# Install all workspace dependencies (takes 5-10 minutes)
pnpm install

# Build shared packages
pnpm build

# Verify installation
pnpm list --depth=0
```

#### Step 3.3: Configure Environment Variables

```bash
# PC1 (Orchestrator)
cp .env.orchestrator .env

# PC2 (Worker)
cp .env.worker-3060 .env

# PC3 (Worker)
cp .env.worker-5090 .env

# PC4 (Worker)
cp .env.worker-3090ti .env

# Edit with your specific values
nano .env  # or vim, code, notepad, etc.
```

**Required Environment Variables**:

```bash
# === LLM API Keys (at least ANTHROPIC required) ===
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx

# === PC Configuration (CRITICAL - set correctly per PC) ===
PC_NAME=orchestrator              # orchestrator, worker-2, worker-3, worker-4
PC_ROLE=orchestrator              # orchestrator or worker
LAN_IP=10.0.0.1                  # Static IP or Tailscale IP

# === Database Passwords (generate strong passwords) ===
POSTGRES_PASSWORD=changeme123!
REDIS_PASSWORD=changeme456!
LETTA_PG_PASSWORD=changeme789!
TWENTY_PG_PASSWORD=changemeABC!
DIFY_PG_PASSWORD=changemeXYZ!

# === Security Secrets (generate with openssl) ===
JWT_SECRET=$(openssl rand -hex 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# === Twilio (for SMS/voice features) ===
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx

# === Worker-Specific (GPU workers only) ===
GPU_ENABLED=true                  # false on orchestrator
GPU_MODEL="RTX 3060"             # RTX 3060, RTX 5090, RTX 3090 Ti
GPU_VRAM=12GB                    # 12GB, 48GB, 24GB
```

**Generate secure secrets**:
```bash
# Generate all required secrets at once
echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "SESSION_SECRET=$(openssl rand -hex 32)"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
```

---

### Phase 4: Claude Flow V3 Setup (20 minutes)

#### Step 4.1: Install Claude Flow CLI

```bash
# Install globally
npm install -g @claude-flow/cli@latest

# Or use with npx (no install needed)
npx @claude-flow/cli@latest --version

# Verify installation
npx @claude-flow/cli@latest doctor
```

#### Step 4.2: Initialize Claude Flow

**PC1 (Orchestrator)**:
```bash
# Initialize with wizard
npx @claude-flow/cli@latest init --wizard

# Or use preset configuration
npx @claude-flow/cli@latest init --preset orchestrator

# Start daemon
npx @claude-flow/cli@latest daemon start

# Initialize swarm
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical-mesh \
  --max-agents 35 \
  --strategy specialized
```

**PC2, PC3, PC4 (Workers)**:
```bash
# Initialize worker
npx @claude-flow/cli@latest init --preset worker

# Start daemon
npx @claude-flow/cli@latest daemon start

# Join orchestrator swarm
npx @claude-flow/cli@latest swarm join \
  --coordinator http://10.0.0.1:7000  # or Tailscale IP
```

#### Step 4.3: Verify Claude Flow

```bash
# Check system status
npx @claude-flow/cli@latest status

# Check swarm status
npx @claude-flow/cli@latest swarm status

# Check memory system
npx @claude-flow/cli@latest memory stats

# View available agents
npx @claude-flow/cli@latest agent list
```

---

### Phase 5: Service Deployment (45 minutes)

#### Step 5.1: Deploy Orchestrator Services (PC1)

```bash
cd infra/docker

# Pull all images (15-20 minutes, ~10GB download)
docker compose -f docker-compose.orchestrator.yml pull

# Start services
docker compose -f docker-compose.orchestrator.yml up -d

# Wait for services to initialize (2-3 minutes)
sleep 180

# Check status
docker compose -f docker-compose.orchestrator.yml ps
```

**Expected Services on PC1**:
- `nexus-router` (port 6000) - LLM Gateway
- `letta` (port 8283) - Long-term memory
- `mem0` (port 4321) - Memory API
- `claude-flow` (port 6100) - Orchestration
- `archon-os` (port 6200) - Orchestration
- `redis` (port 6380) - Cache
- `postgres` (port 5432) - Database
- `agentdb` (port 8080) - Vector DB
- `infisical` (port 8080) - Secrets manager

#### Step 5.2: Deploy Worker 2 Services (PC2)

```bash
cd infra/docker

# Pull images
docker compose -f docker-compose.worker.yml --profile worker-2 pull

# Start services
docker compose -f docker-compose.worker.yml --profile worker-2 up -d

# Check status
docker compose -f docker-compose.worker.yml ps
```

**Expected Services on PC2**:
- `twentycrm` (port 3000) - CRM
- `n8n` (port 5678) - Workflow automation
- `dify` (ports 3001, 3002) - AI chatbot platform
- `postgres-twenty` - TwentyCRM database
- `postgres-n8n` - n8n database
- `postgres-dify` - Dify database
- `redis` - Cache

#### Step 5.3: Deploy Worker 3 Services (PC3)

```bash
cd infra/docker

# Pull images
docker compose -f docker-compose.worker.yml --profile worker-3 pull

# Start services
docker compose -f docker-compose.worker.yml --profile worker-3 up -d

# Pull Ollama models (15-20 minutes, ~16GB download)
docker exec ollama ollama pull llama3.1:8b
docker exec ollama ollama pull mistral:7b
docker exec ollama ollama pull codellama:13b
docker exec ollama ollama pull deepseek-r1:latest

# Verify models
docker exec ollama ollama list
```

**Expected Services on PC3**:
- `ollama` (port 11434) - Local LLM inference
- `neo4j` (ports 7474, 7687) - Graph database
- `falkordb` (port 6379) - Graph database

#### Step 5.4: Deploy Worker 4 Services (PC4)

```bash
cd infra/docker

# Pull images
docker compose -f docker-compose.worker.yml --profile worker-4 pull

# Start services
docker compose -f docker-compose.worker.yml --profile worker-4 up -d

# Check status
docker compose -f docker-compose.worker.yml ps
```

**Expected Services on PC4**:
- `prometheus` (port 9090) - Metrics
- `grafana` (port 3005) - Dashboards
- `loki` (port 3100) - Logs
- `promtail` - Log collector
- `alertmanager` (port 9093) - Alerts

---

## Verification

### Automated Health Check

```bash
#!/bin/bash
# Save as scripts/health-check-all.sh

echo "=== Project Nyra Health Check ==="

# PC1 Services
echo -e "\n[PC1 - Orchestrator]"
curl -sf http://localhost:6000/health && echo "✅ Nexus Router" || echo "❌ Nexus Router"
curl -sf http://localhost:8283/health && echo "✅ Letta" || echo "❌ Letta"
curl -sf http://localhost:4321/health && echo "✅ Mem0" || echo "❌ Mem0"

# PC2 Services
echo -e "\n[PC2 - Worker 2]"
curl -sf http://10.0.0.2:3000 && echo "✅ TwentyCRM" || echo "❌ TwentyCRM"
curl -sf http://10.0.0.2:5678 && echo "✅ n8n" || echo "❌ n8n"

# PC3 Services
echo -e "\n[PC3 - Worker 3]"
curl -sf http://10.0.0.3:11434 && echo "✅ Ollama" || echo "❌ Ollama"

# PC4 Services
echo -e "\n[PC4 - Worker 4]"
curl -sf http://10.0.0.4:9090/-/healthy && echo "✅ Prometheus" || echo "❌ Prometheus"
curl -sf http://10.0.0.4:3005/api/health && echo "✅ Grafana" || echo "❌ Grafana"

echo -e "\n=== Health Check Complete ==="
```

### Manual Verification

```bash
# Test Nexus Router (LLM Gateway)
curl -X POST http://localhost:6000/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'

# Test Ollama (GPU inference)
curl http://10.0.0.3:11434/api/generate \
  -d '{"model": "llama3.1:8b", "prompt": "What is 2+2?", "stream": false}'

# Test Claude Flow
npx @claude-flow/cli@latest status

# Test Prometheus
curl http://10.0.0.4:9090/api/v1/query?query=up
```

---

## Troubleshooting

### Issue: Docker containers won't start

**Check logs**:
```bash
docker compose logs [service-name]
docker compose logs --tail=100 -f  # Follow all logs
```

**Common causes**:
1. Port conflict - another service using the port
2. Missing environment variables
3. Insufficient disk space
4. Out of memory

**Solutions**:
```bash
# Check port usage
lsof -i :6000  # Check if port 6000 is in use
netstat -an | grep 6000

# Kill process using port
kill -9 [PID]

# Check disk space
df -h

# Check memory
free -h  # Linux
vm_stat  # macOS
```

### Issue: GPU not detected

**Check NVIDIA drivers**:
```bash
nvidia-smi
```

**Check Docker GPU access**:
```bash
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi
```

**Solutions**:
```bash
# Restart Docker (Linux)
sudo systemctl restart docker

# Reinstall NVIDIA Container Toolkit (Linux)
sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### Issue: Services unhealthy

**Check service status**:
```bash
docker compose ps
docker inspect [container-name]
```

**Restart unhealthy service**:
```bash
docker compose restart [service-name]

# Full restart
docker compose down
docker compose up -d
```

### Issue: Network connectivity between PCs

**Test connectivity**:
```bash
ping -c 4 10.0.0.1
traceroute 10.0.0.1
curl http://10.0.0.1:6000/health
```

**Check firewall**:
```bash
# Windows
Get-NetFirewallRule | Where-Object {$_.Enabled -eq 'True'}

# Linux
sudo ufw status verbose
sudo iptables -L -n
```

### Issue: Claude Flow not initializing

**Check configuration**:
```bash
npx @claude-flow/cli@latest config list
npx @claude-flow/cli@latest doctor --fix
```

**Check logs**:
```bash
# View daemon logs
npx @claude-flow/cli@latest daemon logs

# Check memory database
ls -lh .swarm/memory.db
```

For more troubleshooting, see `docs/troubleshooting/CLAUDE-FLOW-ZOD-FIX.md`

---

## Next Steps

After successful setup:

1. **Configure Services**
   - TwentyCRM: http://10.0.0.2:3000
   - n8n workflows: http://10.0.0.2:5678
   - Grafana dashboards: http://10.0.0.4:3005

2. **Deploy Applications**
   - RateHunter landing page
   - Nyra Admin dashboard
   - Quote Engine API
   - Campaign Engine API

3. **Run Tests**
   ```bash
   pnpm test
   ```

4. **Monitor System**
   - Prometheus: http://10.0.0.4:9090
   - Grafana: http://10.0.0.4:3005
   - Loki logs: View in Grafana

5. **Review Documentation**
   - [Configuration Guide](CONFIGURATION.md)
   - [Deployment Guide](DEPLOYMENT.md)
   - [API Reference](API-REFERENCE.md)

---

## Support & Resources

### Documentation
- **Configuration**: `docs/CONFIGURATION.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **API Reference**: `docs/api/API-REFERENCE.md`
- **Troubleshooting**: `docs/troubleshooting/CLAUDE-FLOW-ZOD-FIX.md`

### Useful Commands
```bash
# View all services across all PCs
docker compose ps

# Full system restart
docker compose down && docker compose up -d

# Check resource usage
docker stats

# View Claude Flow status
npx @claude-flow/cli@latest status --verbose
```

### Service URLs
- **Nexus Router**: http://10.0.0.1:6000
- **Letta**: http://10.0.0.1:8283
- **TwentyCRM**: http://10.0.0.2:3000
- **n8n**: http://10.0.0.2:5678
- **Ollama**: http://10.0.0.3:11434
- **Grafana**: http://10.0.0.4:3005

---

**Setup Guide Version**: 2.0.0
**Last Updated**: 2026-01-21
**Estimated Time**: 2-4 hours
**Maintainer**: Project Nyra Team

🎉 **Congratulations!** Your Project Nyra distributed AI infrastructure is ready.
