# Project Nyra - Infrastructure Reference Guide
**Last Updated:** 2026-02-06
**Purpose:** Canonical source of truth for all ports, IPs, services, and configurations

---

## 🌐 Network Architecture

### Tailscale Private Network (Recommended Static IPs)

| Machine | Hostname | Tailscale IP | Role | GPU | VRAM | OS |
|---------|----------|--------------|------|-----|------|----|
| Main PC | orchestrator-mini / MinisApotheosis | `100.64.0.1` | Orchestrator | N/A | N/A | Windows 11 |
| Server | ellisapotheosis | `100.64.0.10` | Worker + Services | RTX 5090 | 32GB | Ubuntu |
| Laptop | (TBD) | `100.64.0.11` | Worker | RTX 3060 | 6GB | Windows/Linux |
| Desktop | (TBD) | `100.64.0.12` | Worker | RTX 3090Ti | 24GB | Windows/Linux |

**Current Actual IPs (before static assignment):**
- RTX 5090: `100.102.204.112`
- RTX 3060: `100.126.61.37`

### Cloudflare Tunnel Configuration

**Tunnel ID:** `64fe03f2-9859-44ca-b0ab-e499d8464104`
**Tunnel Name:** `orchestrator-essential`
**Running On:** Main PC (Orchestrator - Windows)
**Config File:** `C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml`

---

## 🚪 Port Allocation Table

### Public Services (Exposed via Cloudflare Tunnel)

| Port | Service | Hostname | Description | Auth Required | Audience |
|------|---------|----------|-------------|---------------|----------|
| 3001 | Landing Page | ratehunter.net | Marketing website | No | Public |
| 3002 | Broker Portal | nyra.ratehunter.net | Broker application | Yes | Brokers |
| 3003 | Claude Flow Dashboard | flow.ratehunter.net | Operations monitoring | Yes | Internal Team |
| 3020 | CRM | crm.ratehunter.net | Sales CRM | Yes | Sales Team |
| 4000 | Admin Dashboard | admin.ratehunter.net | Archon OS | Yes | Admin Team |
| 5000 | Activepieces | flows.ratehunter.net | Workflow automation | Yes | Internal Team |
| 5678 | n8n | n8n.ratehunter.net | Workflow automation | Yes | Internal Team |
| 3000 | Grafana | grafana.ratehunter.net | Monitoring dashboards | Yes | DevOps Team |

### Internal Services (Not publicly exposed - Tailscale only)

| Port | Service | Description | Type | Location |
|------|---------|-------------|------|----------|
| 6000 | Nexus Router | API Gateway / Router | npm | Orchestrator |
| 8000 | Orchestrator Service | Main orchestrator logic | npm | Orchestrator |
| 8010 | Lead API | Lead management service | npm | Orchestrator |
| 8020 | Quote API | Quote generation service | npm | Orchestrator |
| 8030 | Rate Comparison API | Rate comparison engine | npm | Orchestrator |
| 8040 | Document API | Document processing | npm | Orchestrator |
| 8050 | Campaign Engine | Marketing campaigns | npm | Orchestrator |
| 8080 | Auth Service | Authentication service | npm | Orchestrator |
| 8090 | Security Service | Security layer | npm | Orchestrator |

### Support Services

| Port | Service | Description | Type | Location |
|------|---------|-------------|------|----------|
| 3004 | Event Server (WS) | WebSocket server | Docker | Orchestrator |
| 3005 | Event Server (HTTP) | Event submission API | Docker | Orchestrator |
| 9999 | Cloudflared Metrics | Tunnel health metrics | Tunnel | Orchestrator |

### GPU Worker Services

| Port | Service | Description | GPU | Location | Access Via |
|------|---------|-------------|-----|----------|------------|
| 8000 | vLLM | Large model inference | RTX 5090 | Worker | Tailscale |
| 11434 | Ollama (3060) | Small model inference | RTX 3060 | Worker | Tailscale |
| 11434 | Ollama (3090) | Medium model inference | RTX 3090Ti | Worker | Tailscale |

**Note:** Multiple Ollama instances use same port but on different machines (different Tailscale IPs).

---

## 🔧 Service Configuration Reference

### Environment Variables

**File Location:** `~/projects/project-nyra/.env` (Ubuntu) or `.env.template` (Windows)

```bash
# === TAILSCALE IPs ===
ORCHESTRATOR_TAILSCALE_IP=100.64.0.1
GPU_5090_TAILSCALE_IP=100.64.0.10
GPU_3060_TAILSCALE_IP=100.64.0.11
GPU_3090_TAILSCALE_IP=100.64.0.12

# === CLOUDFLARE ===
CLOUDFLARE_ACCOUNT_ID=your-account-id
CF_TUNNEL_ID_ORCHESTRATOR=64fe03f2-9859-44ca-b0ab-e499d8464104

# === API KEYS ===
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENAI_API_KEY=sk-xxxxx
GOOGLE_API_KEY=AIzaSyxxxxx
HF_TOKEN=hf_xxxxx

# === DATABASE ===
POSTGRES_USER=nyra
POSTGRES_PASSWORD=your-secure-password-here
POSTGRES_DB=nyra
TWENTY_API_KEY=

# === COMMUNICATION ===
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=ellis@ratehunter.net

# === LEAD SOURCES ===
LEADMAILBOX_API_KEY=
LEADMAILBOX_API_URL=https://api.leadmailbox.com/v1
LENDINGTREE_WEBHOOK_SECRET=
FREERATEUPDATER_WEBHOOK_SECRET=

# === INTERNAL SERVICE URLS (using Tailscale IPs) ===
NEXUS_ROUTER_URL=http://100.64.0.1:6000
N8N_WEBHOOK_URL=https://n8n.ratehunter.net/webhook
ORCHESTRATOR_URL=http://100.64.0.1:8000

# === GPU WORKER ENDPOINTS ===
OLLAMA_3060_URL=http://100.64.0.11:11434
OLLAMA_3090_URL=http://100.64.0.12:11434
VLLM_5090_URL=http://100.64.0.10:8000

# === CLAUDE FLOW DASHBOARD ===
VITE_EVENT_SERVER_URL=ws://localhost:3004
VITE_EVENT_SERVER_HTTP_URL=http://localhost:3005
VITE_CLAUDE_FLOW_URL=http://localhost:8080
EVENT_SERVER_WS_PORT=3004
EVENT_SERVER_MAX_CONNECTIONS=100
```

---

## 🐳 Docker Compose Reference

### Claude Flow Dashboard + Event Server

**Location:** `~/projects/project-nyra/infra/docker-compose/`

**Files:**
- `docker-compose.event-server.yml` - WebSocket server
- `docker-compose.claude-flow-dashboard.yml` - React dashboard

**Ports:**
- 3003: Dashboard UI (HTTP)
- 3004: Event Server (WebSocket)
- 3005: Event Server (HTTP API)

**Start:**
```bash
docker compose -f docker-compose.event-server.yml up -d
docker compose -f docker-compose.claude-flow-dashboard.yml up -d
```

### Grafana

**Image:** `grafana/grafana:latest`
**Port:** 3000
**Default Credentials:** admin/admin

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  -v grafana-data:/var/lib/grafana \
  --network nyra-network \
  grafana/grafana
```

### n8n

**Image:** `n8nio/n8n:latest`
**Port:** 5678

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  --network nyra-network \
  n8nio/n8n
```

### Activepieces

**Image:** `activepieces/activepieces:latest`
**Port:** 5000

```bash
docker run -d \
  --name activepieces \
  -p 5000:3000 \
  -v activepieces-data:/data \
  --network nyra-network \
  activepieces/activepieces
```

### vLLM (RTX 5090 - 32GB VRAM)

**Location:** Run on RTX 5090 worker machine
**File:** `docker-compose.gpu-5090.yml`
**Port:** 8000

```yaml
version: '3.8'

services:
  vllm-5090:
    image: vllm/vllm-openai:latest
    container_name: vllm-5090
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - HF_TOKEN=${HF_TOKEN}
    volumes:
      - vllm_5090_cache:/root/.cache/huggingface
    ports:
      - "8000:8000"
    command: >
      --model meta-llama/Llama-3.1-70B-Instruct
      --tensor-parallel-size 1
      --max-model-len 8192
      --gpu-memory-utilization 0.90
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  vllm_5090_cache:
```

**Start:**
```bash
docker compose -f docker-compose.gpu-5090.yml up -d
```

### Ollama (RTX 3060 - 6GB VRAM)

**Location:** Run on RTX 3060 worker machine
**File:** `docker-compose.gpu-3060.yml`
**Port:** 11434

```yaml
version: '3.8'

services:
  ollama-3060:
    image: ollama/ollama:latest
    container_name: ollama-3060
    runtime: nvidia
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_MODELS=/root/.ollama/models
      - OLLAMA_NUM_GPU=1
    volumes:
      - ollama_3060_data:/root/.ollama
    ports:
      - "11434:11434"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    restart: unless-stopped

volumes:
  ollama_3060_data:
```

**Recommended Models (6GB VRAM):**
```bash
docker exec ollama-3060 ollama pull llama3.2:3b
docker exec ollama-3060 ollama pull phi3:mini
docker exec ollama-3060 ollama pull nomic-embed-text
docker exec ollama-3060 ollama pull qwen2.5:7b-q4
```

### Ollama (RTX 3090Ti - 24GB VRAM)

**Port:** 11434 (same as 3060, but different machine)

**Recommended Models (24GB VRAM):**
```bash
docker exec ollama-3090 ollama pull llama3.1:70b-q4
docker exec ollama-3090 ollama pull codellama:34b
docker exec ollama-3090 ollama pull mixtral:8x7b
docker exec ollama-3090 ollama pull deepseek-coder:33b
```

---

## 🔒 Security Configuration

### Cloudflare Tunnel Security

**Features:**
- Automatic TLS encryption
- DDoS protection via Cloudflare
- No open ports on firewall
- Authentication via Cloudflare Access (optional)

**Origin Request Settings:**
```yaml
originRequest:
  connectTimeout: 30s
  tlsTimeout: 10s
  tcpKeepAlive: 30s
  keepAliveConnections: 100
  keepAliveTimeout: 90s
  noTLSVerify: true  # For local services without certs
```

### Tailscale Security

**Features:**
- End-to-end encrypted mesh VPN
- Zero-trust network access
- Device authentication via OAuth
- Optional subnet routing

**Enable SSH via Tailscale:**
```bash
tailscale up --ssh
```

### Service Authentication

**Public Services (requires auth):**
- Broker Portal (nyra.ratehunter.net) - Custom auth via Auth Service (port 8080)
- Admin Dashboard (admin.ratehunter.net) - Custom auth
- CRM (crm.ratehunter.net) - Custom auth
- n8n (n8n.ratehunter.net) - Built-in auth
- Activepieces (flows.ratehunter.net) - Built-in auth
- Grafana (grafana.ratehunter.net) - Built-in auth
- Claude Flow Dashboard (flow.ratehunter.net) - No auth (internal team only)

**No Auth Required:**
- Landing Page (ratehunter.net) - Public marketing site

---

## 🚀 Deployment Commands

### Orchestrator PC (Windows - Main)

**Start Cloudflared Tunnel:**
```powershell
cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run
```

**Or install as Windows Service:**
```powershell
# Run as Administrator
cloudflared service install
Start-Service cloudflared
Get-Service cloudflared
```

**Start Docker Services:**
```powershell
# Navigate to project
cd C:\Users\edane\OneDrive\LANShare\cf-tailscale-network-scripts-setup

# Start Grafana
docker run -d --name grafana -p 3000:3000 grafana/grafana

# Start n8n
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Start Activepieces
docker run -d --name activepieces -p 5000:3000 activepieces/activepieces
```

### Ubuntu Server (Worker - RTX 5090)

**Deploy All Services:**
```bash
cd ~/projects/project-nyra
./DEPLOY.sh
```

**Start Claude Flow Dashboard:**
```bash
cd ~/projects/project-nyra
docker compose -f infra/docker-compose/docker-compose.event-server.yml up -d
docker compose -f infra/docker-compose/docker-compose.claude-flow-dashboard.yml up -d
```

**Start vLLM (GPU 5090):**
```bash
cd ~/projects/project-nyra
docker compose -f docker-compose.gpu-5090.yml up -d
```

**Check Service Status:**
```bash
# Check running processes
ps aux | grep node

# Check Docker containers
docker ps

# Check ports
sudo lsof -i -P -n | grep LISTEN
```

### Worker PC - RTX 3060

**Start Ollama:**
```bash
docker compose -f docker-compose.gpu-3060.yml up -d
```

**Pull Models:**
```bash
docker exec ollama-3060 ollama pull llama3.2:3b
docker exec ollama-3060 ollama pull phi3:mini
```

### Worker PC - RTX 3090Ti

**Start Ollama:**
```bash
docker compose -f docker-compose.gpu-3090.yml up -d
```

**Pull Models:**
```bash
docker exec ollama-3090 ollama pull llama3.1:70b-q4
docker exec ollama-3090 ollama pull codellama:34b
```

---

## 🧪 Testing & Verification

### Test Internal Services (from Orchestrator)

```bash
# Test each service endpoint
curl http://localhost:3001  # Landing
curl http://localhost:3002  # Broker Portal
curl http://localhost:4000  # Admin Dashboard
curl http://localhost:6000  # Nexus Router
curl http://localhost:8000  # Orchestrator
curl http://localhost:8080  # Auth Service
```

### Test Public Services (via Cloudflare Tunnel)

```bash
# Test public endpoints
curl https://ratehunter.net
curl https://nyra.ratehunter.net
curl https://admin.ratehunter.net
curl https://n8n.ratehunter.net
curl https://grafana.ratehunter.net
```

### Test GPU Worker Connectivity (via Tailscale)

```bash
# From orchestrator, test GPU workers
curl http://100.64.0.10:8000/v1/models        # vLLM on 5090
curl http://100.64.0.11:11434/api/tags        # Ollama on 3060
curl http://100.64.0.12:11434/api/tags        # Ollama on 3090Ti
```

### Test Tailscale Connectivity

```bash
# Ping each device
tailscale ping 100.64.0.1   # Orchestrator
tailscale ping 100.64.0.10  # RTX 5090
tailscale ping 100.64.0.11  # RTX 3060
tailscale ping 100.64.0.12  # RTX 3090Ti
```

---

## 🔧 Troubleshooting Guide

### Port Conflicts

**Check what's using a port:**
```bash
# Linux
sudo lsof -i :8080

# Windows
netstat -ano | findstr :8080
```

**Kill process on port:**
```bash
# Linux
sudo kill -9 $(lsof -t -i:8080)

# Windows
taskkill /PID <PID> /F
```

### Cloudflared Tunnel Issues

**Check tunnel status:**
```bash
cloudflared tunnel info orchestrator-essential
```

**Validate config:**
```bash
cloudflared tunnel ingress validate
```

**Run with debug logs:**
```bash
cloudflared tunnel --loglevel debug run orchestrator-essential
```

### Docker GPU Not Detected

**Test GPU access:**
```bash
docker run --gpus all nvidia/cuda:12.0-base nvidia-smi
```

**If fails:**
```bash
# Reinstall NVIDIA Container Toolkit
# Ubuntu
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# Windows
winget install Nvidia.ContainerToolkit
```

### Tailscale Connectivity Issues

**Check status:**
```bash
tailscale status
```

**Restart Tailscale:**
```bash
# Linux
sudo systemctl restart tailscaled

# Windows
Restart-Service Tailscale
```

**Re-authenticate:**
```bash
tailscale up --reset
```

---

## 📊 Monitoring & Observability

### Grafana Dashboards

**Access:** https://grafana.ratehunter.net
**Default Login:** admin/admin

**Recommended Dashboards:**
- Node Exporter (server metrics)
- Docker container metrics
- NVIDIA GPU metrics
- Application logs (via Loki)

### Cloudflared Metrics

**Endpoint:** http://localhost:9999/metrics
**Format:** Prometheus

**Key Metrics:**
- `cloudflared_tunnel_total_requests`
- `cloudflared_tunnel_request_errors`
- `cloudflared_tunnel_response_time`

### Claude Flow Dashboard

**Access:** https://flow.ratehunter.net
**Local:** http://localhost:3003

**Features:**
- Agent lifecycle monitoring
- Task execution timeline
- Memory operations tracking
- System topology visualization
- Performance metrics

---

## 📝 Important Notes for Infrastructure Rebuild

When rebuilding the `infra/` folder, ensure:

1. **Port Consistency:** All services use ports defined in this document
2. **Tailscale IPs:** Use `100.64.0.x` subnet with static assignments
3. **Environment Variables:** Match `.env.template` structure
4. **Docker Networks:** All containers use `nyra-network` bridge
5. **GPU Workers:** Docker compose files match GPU capabilities (VRAM limits)
6. **Cloudflare Tunnel:** Only orchestrator needs public tunnel
7. **Security:** Internal services not exposed publicly (Tailscale only)

---

## 🔗 Quick Links

- **Tailscale Admin:** https://login.tailscale.com/admin/machines
- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Cloudflare Zero Trust:** https://one.dash.cloudflare.com/
- **Domain:** ratehunter.net
- **Tunnel ID:** 64fe03f2-9859-44ca-b0ab-e499d8464104

---

**Document Version:** 1.0
**Created By:** Claude Sonnet 4.5
**Last Updated:** 2026-02-06
**Status:** Active Reference Document

This document should be updated whenever ports, IPs, or services change.
