# Project Nyra - Claude Flow V3 Deployment Guide

Complete deployment guide for the 4-PC distributed LLM cluster with Docker containers.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [PC-Specific Setup](#pc-specific-setup)
3. [Tailscale Network Setup](#tailscale-network-setup)
4. [Cloudflare Tunnel Setup](#cloudflare-tunnel-setup)
5. [Database Initialization](#database-initialization)
6. [Docker Deployment](#docker-deployment)
7. [Verification & Testing](#verification--testing)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### All PCs

- Windows 11 (latest updates)
- Docker Desktop with WSL2 backend
- Git for Windows
- NVIDIA Driver 560+ (for GPU workers)
- NVIDIA Container Toolkit (for GPU workers)
- Tailscale account
- Cloudflare account with domain (ratehunter.net)

### Software Versions

```bash
# Check versions
docker --version          # 24.0.0+
docker-compose --version  # 2.20.0+
nvidia-smi               # 560.0+ (GPU workers only)
```

---

## 🖥️ PC-Specific Setup

### ORCHESTRATOR MINI PC

**Role**: Central coordinator, API gateway, databases

#### 1. Install Base Software

```powershell
# Install Scoop (package manager)
irm get.scoop.sh | iex

# Install tools
scoop install git docker docker-compose

# Install Tailscale
winget install Tailscale.Tailscale
```

#### 2. Configure Docker

```powershell
# Enable WSL2
wsl --install
wsl --set-default-version 2

# Configure Docker Desktop
# Settings -> General -> Use WSL 2 based engine: ✓
# Settings -> Resources -> WSL Integration: Enable for default distro
```

#### 3. Setup Project Directory

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator

# Copy environment template
cp .env.template .env

# Edit .env with your actual values
notepad .env
```

**Required .env Values**:
```env
# API Keys
ANTHROPIC_API_KEY=sk-ant-your-actual-key
OPENAI_API_KEY=sk-your-actual-key
GOOGLE_API_KEY=your-actual-key
OPENROUTER_API_KEY=sk-or-your-actual-key

# Passwords (generate strong passwords)
POSTGRES_PASSWORD=<generate-strong-password>
REDIS_PASSWORD=<generate-strong-password>
GRAFANA_ADMIN_PASSWORD=<generate-strong-password>

# Tokens (generate with openssl)
NEXUS_ADMIN_TOKEN=$(openssl rand -hex 32)
NEXUS_JWT_SECRET=$(openssl rand -hex 32)
ORCHESTRATOR_API_KEY=$(openssl rand -hex 32)
QDRANT_API_KEY=$(openssl rand -hex 32)
```

#### 4. Initialize Database Script Permissions

```bash
# In WSL terminal
cd /mnt/c/Dev/Projects/Repos/Project-Nyra/infra/docker/claude-flow/orchestrator
chmod +x init-multiple-databases.sh
```

---

### WORKER-5090 (RTX 5090 48GB)

**Role**: Tier 1 - Complex reasoning, compliance, legal analysis

#### 1. Install NVIDIA Components

```powershell
# Download and install NVIDIA Driver 560+
# https://www.nvidia.com/download/index.aspx

# Install CUDA Toolkit 12.4+
winget install NVIDIA.CUDAToolkit

# Verify installation
nvidia-smi
```

#### 2. Install NVIDIA Container Toolkit

```bash
# In WSL
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/libnvidia-container/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit

# Configure Docker
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# Test GPU access
docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi
```

#### 3. Setup Worker Directory

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-5090

# Copy environment template
cp .env.template .env

# Edit .env
notepad .env
```

**Key .env Values**:
```env
WORKER_ID=worker-5090
WORKER_TIER=1
GPU_TYPE=RTX_5090
GPU_VRAM_GB=48

# Models
OLLAMA_PRIMARY_MODEL=deepseek-r1:236b-q4
OLLAMA_FALLBACK_MODEL=qwen2.5:72b

# Orchestrator connection (get from orchestrator .env)
ORCHESTRATOR_API_KEY=<from-orchestrator-env>
```

---

### WORKER-3090 (RTX 3090 Ti 24GB)

**Role**: Tier 2 - Quote generation, document processing

#### Setup (Same as WORKER-5090)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-3090
cp .env.template .env
notepad .env
```

**Key .env Values**:
```env
WORKER_ID=worker-3090
WORKER_TIER=2
GPU_TYPE=RTX_3090_Ti
GPU_VRAM_GB=24

OLLAMA_PRIMARY_MODEL=llama3.1:70b-q4
OLLAMA_FALLBACK_MODEL=mistral-large:123b-q3
```

---

### WORKER-3060 (RTX 3060 12GB)

**Role**: Tier 3 - Code generation, embeddings, fast queries

#### Setup (Same as WORKER-5090)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-3060
cp .env.template .env
notepad .env
```

**Key .env Values**:
```env
WORKER_ID=worker-3060
WORKER_TIER=3
GPU_TYPE=RTX_3060
GPU_VRAM_GB=12

OLLAMA_PRIMARY_MODEL=codellama:34b-q4
OLLAMA_SECONDARY_MODEL=qwen2.5:32b-q4
OLLAMA_TERTIARY_MODEL=gemma2:27b-q4
EMBEDDINGS_MODEL=nomic-embed-text:latest
```

---

## 🌐 Tailscale Network Setup

Tailscale creates a secure mesh VPN connecting all 4 PCs.

### 1. Install Tailscale (All PCs)

```powershell
winget install Tailscale.Tailscale
```

### 2. Configure Tailscale

```powershell
# Start Tailscale
tailscale up

# Login via browser when prompted

# Set machine name (on each PC)
# Orchestrator:
tailscale set --hostname orchestrator-mini

# Worker-5090:
tailscale set --hostname worker-5090

# Worker-3090:
tailscale set --hostname worker-3090

# Worker-3060:
tailscale set --hostname worker-3060
```

### 3. Enable MagicDNS

In Tailscale Admin Console (https://login.tailscale.com/admin):
- Go to DNS settings
- Enable MagicDNS
- Verify all machines appear with `.tail-net.ts.net` suffix

### 4. Test Connectivity

```powershell
# From orchestrator, ping workers
ping worker-5090.tail-net.ts.net
ping worker-3090.tail-net.ts.net
ping worker-3060.tail-net.ts.net

# Test Ollama endpoint (after deployment)
curl http://worker-5090.tail-net.ts.net:11434/api/tags
```

---

## ☁️ Cloudflare Tunnel Setup

Cloudflare Tunnel exposes services to the internet securely.

### 1. Install Cloudflared (Orchestrator Only)

```powershell
# Download from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
winget install Cloudflare.cloudflared
```

### 2. Authenticate

```powershell
cloudflared tunnel login
# Browser opens - select ratehunter.net domain
```

### 3. Create Tunnel

```powershell
# Create tunnel
cloudflared tunnel create nyra-mortgage-platform

# Note the Tunnel ID from output
# Example: Created tunnel nyra-mortgage-platform with id xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. Configure Tunnel

Create `C:\Users\<YourUser>\.cloudflared\config.yml`:

```yaml
tunnel: nyra-mortgage-platform
credentials-file: C:\Users\<YourUser>\.cloudflared\xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  # Public landing page
  - hostname: ratehunter.net
    service: http://localhost:3000

  # Mortgage assistant app
  - hostname: app.ratehunter.net
    service: http://localhost:8000

  # CRM Dashboard
  - hostname: crm.ratehunter.net
    service: http://localhost:3001

  # API Gateway (Nexus Router)
  - hostname: api.ratehunter.net
    service: http://localhost:6000

  # Grafana Monitoring
  - hostname: metrics.ratehunter.net
    service: http://localhost:3005

  # Catch-all
  - service: http_status:404
```

### 5. Create DNS Records

```powershell
# Create DNS records for each subdomain
cloudflared tunnel route dns nyra-mortgage-platform ratehunter.net
cloudflared tunnel route dns nyra-mortgage-platform app.ratehunter.net
cloudflared tunnel route dns nyra-mortgage-platform crm.ratehunter.net
cloudflared tunnel route dns nyra-mortgage-platform api.ratehunter.net
cloudflared tunnel route dns nyra-mortgage-platform metrics.ratehunter.net
```

### 6. Run Tunnel as Service

```powershell
# Install as Windows service
cloudflared service install

# Start service
net start cloudflared
```

---

## 🗄️ Database Initialization

### 1. Start PostgreSQL First (Orchestrator)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator

# Start only postgres
docker-compose up -d postgres

# Wait for initialization
docker-compose logs -f postgres
# Look for "database system is ready to accept connections"
```

### 2. Verify Databases Created

```powershell
# Connect to PostgreSQL
docker exec -it nyra-postgres psql -U nyra_admin -d postgres

# List databases
\l

# Should see:
# - nyra_orchestrator
# - letta
# - graphiti
# - mem0
# - twentycrm
# - n8n
# - dify

# Check pgvector extension
\c letta
\dx
# Should see: vector, pg_trgm, btree_gin, btree_gist, uuid-ossp

\q
```

---

## 🚀 Docker Deployment

### Deployment Order

1. **Orchestrator** (databases and core services)
2. **Workers** (GPU inference servers)
3. **Verification** (health checks)

### 1. Deploy Orchestrator

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\orchestrator

# Pull images
docker-compose pull

# Start all services
docker-compose up -d

# Monitor logs
docker-compose logs -f

# Wait for all services healthy
docker-compose ps
```

**Expected Services**:
- ✅ nexus-router (port 6000)
- ✅ claude-flow (port 6100)
- ✅ postgres (port 5432)
- ✅ redis (port 6379)
- ✅ qdrant (port 6333)
- ✅ prometheus (port 9090)
- ✅ grafana (port 3005)
- ✅ loki (port 3100)

### 2. Deploy Worker-5090

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-5090

# Pull Ollama image
docker-compose pull

# Start services
docker-compose up -d

# Monitor model download (takes 30-60 mins for large models)
docker-compose logs -f model-manager

# Check GPU usage
nvidia-smi
```

### 3. Deploy Worker-3090

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-3090

docker-compose pull
docker-compose up -d
docker-compose logs -f model-manager
```

### 4. Deploy Worker-3060

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\docker\claude-flow\worker-3060

docker-compose pull
docker-compose up -d
docker-compose logs -f model-manager
```

---

## ✅ Verification & Testing

### 1. Check All Services

```powershell
# Orchestrator
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:6100/health  # Claude Flow
curl http://localhost:9090/-/healthy  # Prometheus
curl http://localhost:3005/api/health  # Grafana

# Workers (via Tailscale)
curl http://worker-5090.tail-net.ts.net:11434/api/tags
curl http://worker-3090.tail-net.ts.net:11434/api/tags
curl http://worker-3060.tail-net.ts.net:11434/api/tags
```

### 2. Test LLM Inference

```bash
# Test local worker (5090)
curl -X POST http://worker-5090.tail-net.ts.net:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1:236b-q4",
    "prompt": "Calculate DTI for borrower with $8000 income and $3000 debt",
    "stream": false
  }'

# Test via Nexus Router
curl -X POST http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1-236b",
    "messages": [{"role": "user", "content": "What is 2+2?"}]
  }'
```

### 3. Test Claude Flow V3

```powershell
# Initialize memory
curl -X POST http://localhost:6100/api/memory/init

# Check swarm status
curl http://localhost:6100/api/swarm/status

# Test agent spawn
curl -X POST http://localhost:6100/api/agent/spawn \
  -H "Content-Type: application/json" \
  -d '{
    "type": "coder",
    "task": "Write a hello world function"
  }'
```

### 4. Access Dashboards

- **Grafana**: http://localhost:3005 (admin / <GRAFANA_PASSWORD>)
- **Prometheus**: http://localhost:9090
- **Nexus Admin**: http://localhost:6001

### 5. Test Public Endpoints

```bash
# Landing page
curl https://ratehunter.net

# API Gateway
curl https://api.ratehunter.net/health

# Metrics dashboard
https://metrics.ratehunter.net (login with Grafana creds)
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. GPU Not Detected in Docker

**Symptoms**: `docker run --gpus all` fails

**Fix**:
```bash
# Reinstall NVIDIA Container Toolkit
sudo apt-get remove --purge nvidia-container-toolkit
sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker
```

#### 2. Ollama Model Download Fails

**Symptoms**: Model manager exits with error

**Fix**:
```bash
# Check disk space
df -h

# Manually pull model
docker exec -it worker-5090-ollama ollama pull deepseek-r1:236b-q4

# Check logs
docker logs worker-5090-model-manager
```

#### 3. Nexus Router Can't Reach Workers

**Symptoms**: Requests timeout to workers

**Fix**:
```powershell
# Check Tailscale status
tailscale status

# Test connectivity
ping worker-5090.tail-net.ts.net

# Check firewall (allow port 11434)
netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
```

#### 4. PostgreSQL Init Script Not Running

**Symptoms**: Databases not created

**Fix**:
```bash
# Check script permissions
ls -l /docker-entrypoint-initdb.d/

# Manual execution
docker exec -it nyra-postgres bash
cd /docker-entrypoint-initdb.d
chmod +x init-multiple-databases.sh
./init-multiple-databases.sh
```

#### 5. Cloudflare Tunnel Not Working

**Symptoms**: Domain not accessible

**Fix**:
```powershell
# Check tunnel status
cloudflared tunnel info nyra-mortgage-platform

# Check service
Get-Service cloudflared

# Restart service
Restart-Service cloudflared

# Check logs
cloudflared tunnel run --loglevel debug
```

### Performance Tuning

#### GPU Memory Optimization

Edit worker `.env`:
```env
# Reduce GPU layers if OOM
OLLAMA_PRIMARY_GPU_LAYERS=60  # From 80

# Enable memory fragmentation reduction
PYTORCH_CUDA_ALLOC_CONF=max_split_size_mb:256
```

#### Increase Docker Resources

Docker Desktop -> Settings -> Resources:
- CPU: 8+ cores
- Memory: 16GB+
- Swap: 4GB+

### Logs & Debugging

```powershell
# View all orchestrator logs
docker-compose -f orchestrator/docker-compose.yml logs -f

# View specific service
docker logs -f nyra-nexus-router

# View worker logs
docker logs -f worker-5090-ollama

# Check GPU usage
nvidia-smi -l 1  # Updates every second

# Check disk space
docker system df
```

---

## 📊 Monitoring

### Grafana Dashboards

1. **GPU Metrics**:
   - Import dashboard ID: 12239 (NVIDIA DCGM Exporter)
   - Data source: Prometheus

2. **Docker Metrics**:
   - Import dashboard ID: 193 (Docker Monitoring)
   - Data source: Prometheus

3. **PostgreSQL**:
   - Import dashboard ID: 9628
   - Data source: Prometheus

### Prometheus Queries

```promql
# GPU utilization by worker
nvidia_gpu_utilization{job=~"worker-.*-gpu"}

# Ollama request rate
rate(ollama_requests_total[5m])

# Memory usage
container_memory_usage_bytes{name=~"nyra-.*"}

# Response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

---

## 🎉 Next Steps

1. **Deploy TwentyCRM** (see separate guide)
2. **Configure n8n workflows** for drip campaigns
3. **Setup Dify** chat interface
4. **Deploy landing page** to Cloudflare Pages
5. **Configure monitoring alerts** in Grafana
6. **Test end-to-end** mortgage workflow

---

## 📚 Additional Resources

- [Claude Flow V3 Documentation](https://github.com/ruvnet/claude-flow)
- [Nexus Router Docs](https://nexusrouter.com/docs)
- [Ollama Documentation](https://ollama.com/docs)
- [Tailscale Documentation](https://tailscale.com/kb/)
- [Cloudflare Tunnel Guide](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

---

**Deployment Guide Version**: 1.0
**Last Updated**: 2026-01-22
**Status**: Production Ready
