# Project Nyra - Infrastructure Consolidation Guide
**Created:** 2026-02-06
**Purpose:** Complete reference for consolidating infra folder with correct ports, hosts, and tunnels

---

## 🎯 Quick Reference Tables

### Network Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INTERNET (Public)                         │
│                            ↓                                  │
│                   Cloudflare CDN/WAF                          │
│                            ↓                                  │
│              Cloudflare Tunnel (orchestrator)                 │
│                            ↓                                  │
│         Orchestrator PC (100.64.0.1 - Windows)               │
│                            ↓                                  │
│              Tailscale Private Network                        │
│                            ↓                                  │
│  ┌─────────────┬─────────────────┬─────────────────┐         │
│  │   RTX 5090  │    RTX 3060     │    RTX 3090Ti   │         │
│  │ 100.64.0.10 │  100.64.0.11    │  100.64.0.12    │         │
│  │   (Ubuntu)  │                 │                 │         │
│  └─────────────┴─────────────────┴─────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Complete Port Allocation Table

### Orchestrator Services (100.64.0.1)

| Port | Service | Type | Public URL | Docker/npm | Notes |
|------|---------|------|------------|-----------|-------|
| **3000** | Grafana | Monitoring | grafana.ratehunter.net | Docker | Default: admin/admin |
| **3001** | Landing Page | Website | ratehunter.net | npm | Public marketing site |
| **3002** | Broker Portal | WebApp | nyra.ratehunter.net | npm | Auth required |
| **3003** | Claude Flow Dashboard | Tool | flow.ratehunter.net | Docker | Internal team only |
| **3004** | Event Server (WS) | WebSocket | - | Docker | For dashboard only |
| **3005** | Event Server (HTTP) | API | - | Docker | CLI event submission |
| **3020** | CRM | Tool | crm.ratehunter.net | Docker/npm | TwentyCRM |
| **4000** | Admin Dashboard | Tool | admin.ratehunter.net | npm | Archon OS |
| **5000** | Activepieces | Automation | flows.ratehunter.net | Docker | Workflow builder |
| **5678** | n8n | Automation | n8n.ratehunter.net | Docker | Workflow builder |
| **6000** | Nexus Router | Gateway | - | npm | Internal API gateway |
| **8000** | Orchestrator | Service | - | npm | Main orchestrator |
| **8010** | Lead API | Service | - | npm | Lead management |
| **8020** | Quote API | Service | - | npm | Quote generation |
| **8030** | Rate Comparison API | Service | - | npm | Rate comparison |
| **8040** | Document API | Service | - | npm | Document processing |
| **8050** | Campaign Engine | Service | - | npm | Marketing campaigns |
| **8080** | Auth Service | Service | - | npm | Authentication |
| **8090** | Security Service | Service | - | npm | Security layer |
| **9090** | Prometheus | Monitoring | - | Docker | Metrics collection |
| **9999** | Cloudflared Metrics | Tunnel | - | Tunnel | Tunnel health |

### Worker Services

| Port | Service | Machine | Tailscale IP | GPU | Access |
|------|---------|---------|--------------|-----|--------|
| **8000** | vLLM | RTX 5090 | 100.64.0.10 | RTX 5090 (32GB) | Tailscale only |
| **11434** | Ollama | RTX 3060 | 100.64.0.11 | RTX 3060 (6GB) | Tailscale only |
| **11434** | Ollama | RTX 3090Ti | 100.64.0.12 | RTX 3090Ti (24GB) | Tailscale only |

---

## 🌐 Cloudflare Tunnel Configuration

### Tunnel Details

```yaml
Tunnel ID: 64fe03f2-9859-44ca-b0ab-e499d8464104
Tunnel Name: orchestrator-essential
Config File: C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml
Credentials: C:\Users\edane\.cloudflared\64fe03f2-9859-44ca-b0ab-e499d8464104.json
Running On: Orchestrator PC (100.64.0.1 - Windows)
Status: ✅ Running (metrics on port 9999)
```

### DNS Routes (Already Configured)

| Public Hostname | Internal Service | Port |
|-----------------|------------------|------|
| ratehunter.net | Landing Page | 3001 |
| nyra.ratehunter.net | Broker Portal | 3002 |
| admin.ratehunter.net | Admin Dashboard | 4000 |
| flow.ratehunter.net | Claude Flow Dashboard | 3003 |
| crm.ratehunter.net | CRM | 3020 |
| n8n.ratehunter.net | n8n | 5678 |
| flows.ratehunter.net | Activepieces | 5000 |
| grafana.ratehunter.net | Grafana | 3000 |

### Ingress Rules (orchestrator-essential.yml)

```yaml
ingress:
  - hostname: ratehunter.net
    service: http://localhost:3001
  - hostname: nyra.ratehunter.net
    service: http://localhost:3002
  - hostname: admin.ratehunter.net
    service: http://localhost:4000
  - hostname: flow.ratehunter.net
    service: http://localhost:3003     # ✅ FIXED
  - hostname: crm.ratehunter.net
    service: http://localhost:3020
  - hostname: n8n.ratehunter.net
    service: http://localhost:5678
  - hostname: flows.ratehunter.net
    service: http://localhost:5000
  - hostname: grafana.ratehunter.net
    service: http://localhost:3000
  - service: http_status:404

metrics: 0.0.0.0:9999                  # ✅ FIXED (was 8080)
```

---

## 🐳 Docker Compose Structure

### Recommended File Structure

```
infra/
├── docker-compose.yml                    # Master compose (imports all)
├── docker-compose.databases.yml          # PostgreSQL, Redis
├── docker-compose.monitoring.yml         # Grafana, Prometheus
├── docker-compose.automation.yml         # n8n, Activepieces
├── docker-compose.claude-flow.yml        # Event server + Dashboard
├── docker-compose.gpu-5090.yml           # vLLM (RTX 5090)
├── docker-compose.gpu-3060.yml           # Ollama (RTX 3060)
├── docker-compose.gpu-3090.yml           # Ollama (RTX 3090Ti)
└── .env                                  # Environment variables
```

### Master docker-compose.yml

```yaml
version: '3.8'

# Include all service compose files
include:
  - docker-compose.databases.yml
  - docker-compose.monitoring.yml
  - docker-compose.automation.yml
  - docker-compose.claude-flow.yml
  # GPU workers included separately on each machine

networks:
  nyra-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres-data:
  redis-data:
  grafana-data:
  n8n-data:
  activepieces-data:
```

---

## 🔌 Service Connection Map

### How Services Connect to Each Other

```
PUBLIC USERS
    ↓ (HTTPS via Cloudflare)
CLOUDFLARE TUNNEL (orchestrator)
    ↓ (HTTP to localhost)
NEXUS ROUTER (6000) ← API Gateway
    ↓
┌───┴────────────────────────────────┐
│                                    │
│  AUTH SERVICE (8080)               │  ORCHESTRATOR (8000)
│  SECURITY SERVICE (8090)           │       ↓
│                                    │   ┌───┴────────────┐
└────────────────────────────────────┘   │                │
                                         │  LEAD API      │
                                         │  QUOTE API     │
                                         │  RATE API      │
                                         │  DOC API       │
                                         │  CAMPAIGN API  │
                                         └────────────────┘
                                              ↓
                                         GPU WORKERS (via Tailscale)
                                              ↓
                                    ┌─────────┴─────────┐
                                    │                   │
                                vLLM (5090)        OLLAMA (3060/3090)
                              100.64.0.10:8000    100.64.0.11:11434
                                                  100.64.0.12:11434
```

### Service Dependencies

| Service | Depends On | Connection |
|---------|-----------|------------|
| Landing Page (3001) | Auth Service | http://localhost:8080 |
| Broker Portal (3002) | Auth Service, Orchestrator | http://localhost:8080, :8000 |
| Admin Dashboard (4000) | Auth Service, All APIs | http://localhost:8080, :8000-8050 |
| Nexus Router (6000) | All internal services | http://localhost:8000-8090 |
| Orchestrator (8000) | GPU Workers | http://100.64.0.10:8000, :11434 |
| Lead API (8010) | Database, Orchestrator | localhost:5432, :8000 |
| Quote API (8020) | Rate API, Lead API | localhost:8030, :8010 |
| Claude Flow Dashboard | Event Server | ws://localhost:3004 |

---

## 🔧 Docker Compose Examples

### Grafana (docker-compose.monitoring.yml)

```yaml
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - nyra-network

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    networks:
      - nyra-network

volumes:
  grafana-data:
  prometheus-data:

networks:
  nyra-network:
    external: true
```

### Automation Tools (docker-compose.automation.yml)

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - WEBHOOK_URL=${N8N_WEBHOOK_URL}
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - nyra-network

  activepieces:
    image: activepieces/activepieces:latest
    container_name: activepieces
    restart: unless-stopped
    ports:
      - "5000:3000"
    environment:
      - AP_ENGINE_EXECUTABLE_PATH=dist/packages/engine/main.js
      - AP_POSTGRES_DATABASE=${POSTGRES_DB}
      - AP_POSTGRES_HOST=${POSTGRES_HOST}
      - AP_POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - AP_POSTGRES_PORT=${POSTGRES_PORT}
      - AP_POSTGRES_USERNAME=${POSTGRES_USER}
    volumes:
      - activepieces-data:/root/.activepieces
    networks:
      - nyra-network
    depends_on:
      - postgres

volumes:
  n8n-data:
  activepieces-data:

networks:
  nyra-network:
    external: true
```

### Claude Flow Dashboard (docker-compose.claude-flow.yml)

```yaml
version: '3.8'

services:
  claude-flow-event-server:
    build:
      context: ../services/claude-flow-event-server
      dockerfile: Dockerfile
    container_name: claude-flow-event-server
    restart: unless-stopped
    ports:
      - "3004:3004"  # WebSocket
      - "3005:3005"  # HTTP
    environment:
      - EVENT_SERVER_WS_PORT=3004
      - EVENT_SERVER_HTTP_PORT=3005
      - EVENT_SERVER_MAX_CONNECTIONS=${EVENT_SERVER_MAX_CONNECTIONS:-100}
      - EVENT_SERVER_REPLAY_BUFFER=${EVENT_SERVER_REPLAY_BUFFER:-1000}
      - EVENT_SERVER_HEARTBEAT=${EVENT_SERVER_HEARTBEAT:-30000}
    networks:
      - nyra-network

  claude-flow-dashboard:
    build:
      context: ../apps/claude-flow-dashboard
      dockerfile: Dockerfile
    container_name: claude-flow-dashboard
    restart: unless-stopped
    ports:
      - "3003:3003"
    environment:
      - VITE_EVENT_SERVER_URL=${VITE_EVENT_SERVER_URL:-ws://localhost:3004}
      - VITE_EVENT_SERVER_HTTP_URL=${VITE_EVENT_SERVER_HTTP_URL:-http://localhost:3005}
      - VITE_CLAUDE_FLOW_URL=${VITE_CLAUDE_FLOW_URL:-http://localhost:8080}
      - VITE_ENABLE_AGENT_MONITOR=true
      - VITE_ENABLE_TASK_TIMELINE=true
      - VITE_ENABLE_MEMORY_OPS=true
      - VITE_ENABLE_TOPOLOGY=true
      - VITE_ENABLE_METRICS=true
    networks:
      - nyra-network
    depends_on:
      - claude-flow-event-server

networks:
  nyra-network:
    external: true
```

### vLLM on RTX 5090 (docker-compose.gpu-5090.yml)

```yaml
version: '3.8'

services:
  vllm-5090:
    image: vllm/vllm-openai:latest
    container_name: vllm-5090
    restart: unless-stopped
    runtime: nvidia
    ports:
      - "8000:8000"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - HF_TOKEN=${HF_TOKEN}
      - VLLM_HOST=0.0.0.0
      - VLLM_PORT=8000
    volumes:
      - vllm-cache:/root/.cache/huggingface
    command: >
      --model ${VLLM_MODEL:-meta-llama/Llama-3.1-70B-Instruct}
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

volumes:
  vllm-cache:
```

### Ollama on RTX 3060 (docker-compose.gpu-3060.yml)

```yaml
version: '3.8'

services:
  ollama-3060:
    image: ollama/ollama:latest
    container_name: ollama-3060
    restart: unless-stopped
    runtime: nvidia
    ports:
      - "11434:11434"
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - OLLAMA_HOST=0.0.0.0
      - OLLAMA_MODELS=/root/.ollama/models
      - OLLAMA_NUM_GPU=1
    volumes:
      - ollama-3060-data:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

volumes:
  ollama-3060-data:
```

---

## 🔐 Environment Variable Mapping

### Where Each Service Gets Its Config

| Service | Reads From | Key Variables |
|---------|-----------|---------------|
| Landing Page (3001) | .env | AUTH_SERVICE_URL, PUBLIC_BROKER_PORTAL_URL |
| Broker Portal (3002) | .env | AUTH_SERVICE_URL, ORCHESTRATOR_URL |
| Admin Dashboard (4000) | .env | AUTH_SERVICE_URL, All API URLs |
| Nexus Router (6000) | .env | All internal service URLs |
| Orchestrator (8000) | .env | VLLM_5090_URL, OLLAMA_3060_URL, OLLAMA_3090_URL |
| Auth Service (8080) | .env | POSTGRES_URL, JWT_SECRET |
| GPU Workers | .env | HF_TOKEN, NVIDIA_VISIBLE_DEVICES |
| Grafana | .env | GRAFANA_ADMIN_PASSWORD |
| n8n | .env | N8N_WEBHOOK_URL |

---

## ✅ Consolidation Checklist

### Step 1: Verify Current State
- [ ] Check which services are currently running
- [ ] Identify port conflicts
- [ ] List all existing docker-compose files
- [ ] Backup current infra folder

### Step 2: Create New Structure
- [ ] Create new infra/ directory
- [ ] Copy .env from .env.orchestrator (or use Infisical)
- [ ] Create docker-compose.yml (master)
- [ ] Create docker-compose.databases.yml
- [ ] Create docker-compose.monitoring.yml
- [ ] Create docker-compose.automation.yml
- [ ] Create docker-compose.claude-flow.yml

### Step 3: Network Configuration
- [ ] Create nyra-network bridge
- [ ] Verify Tailscale IPs are set (100.64.0.1, .10, .11, .12)
- [ ] Test connectivity between machines

### Step 4: Deploy Services
- [ ] Start databases first: `docker compose up -d postgres redis`
- [ ] Start monitoring: `docker compose up -d grafana prometheus`
- [ ] Start automation: `docker compose up -d n8n activepieces`
- [ ] Start Claude Flow: `docker compose up -d claude-flow-event-server claude-flow-dashboard`

### Step 5: Verify Connectivity
- [ ] Test internal service URLs (curl localhost:8000, etc.)
- [ ] Test public URLs (https://ratehunter.net, etc.)
- [ ] Test GPU worker endpoints via Tailscale
- [ ] Check all containers: `docker ps`

### Step 6: GPU Workers
- [ ] Deploy vLLM on RTX 5090: `docker compose -f docker-compose.gpu-5090.yml up -d`
- [ ] Deploy Ollama on RTX 3060: `docker compose -f docker-compose.gpu-3060.yml up -d`
- [ ] Pull models on each worker
- [ ] Test inference from orchestrator

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T DO THIS:

1. **Don't expose GPU workers publicly**
   - Workers should ONLY be accessible via Tailscale
   - No Cloudflare tunnels on worker machines

2. **Don't use the same port on the same machine**
   - Port 8080 = Auth Service (NOT metrics)
   - Port 8000 on orchestrator = Orchestrator service
   - Port 8000 on RTX 5090 = vLLM (different machine, OK)

3. **Don't hardcode localhost in .env**
   - Use Tailscale IPs for cross-machine communication
   - Example: ORCHESTRATOR_URL=http://100.64.0.1:8000 (not localhost)

4. **Don't forget network isolation**
   - All containers should use nyra-network
   - External: false for shared networks

5. **Don't mix HTTPS/HTTP incorrectly**
   - Public URLs (via tunnel): https://ratehunter.net
   - Internal URLs (Tailscale): http://100.64.0.1:8000
   - Localhost: http://localhost:3000

### ✅ DO THIS:

1. **Use Infisical for secrets**
   - Import .env.master-infisical
   - Use `infisical run -- docker compose up`

2. **Use Tailscale IPs for cross-machine**
   - Workers talk to orchestrator: http://100.64.0.1:8000
   - Orchestrator talks to workers: http://100.64.0.10:8000

3. **Follow port allocation table**
   - Reference INFRASTRUCTURE_REFERENCE.md
   - Every service has a designated port

4. **Test incrementally**
   - Start databases first
   - Then monitoring
   - Then automation
   - Finally apps

---

## 📞 Quick Commands

### Docker Management

```bash
# Start all services
docker compose up -d

# Start specific service
docker compose up -d grafana

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart n8n

# Check status
docker ps

# Clean up
docker compose down -v  # WARNING: Deletes volumes!
```

### Network Testing

```bash
# Test Tailscale connectivity
tailscale ping 100.64.0.10

# Test service endpoint
curl http://localhost:8000/health

# Test GPU worker
curl http://100.64.0.10:8000/v1/models

# Test public URL
curl https://ratehunter.net
```

### Debugging

```bash
# Check port usage
sudo lsof -i :8080

# Check container logs
docker logs -f grafana

# Enter container shell
docker exec -it grafana /bin/bash

# Check network
docker network inspect nyra-network

# Check GPU access
docker run --gpus all nvidia/cuda:12.0-base nvidia-smi
```

---

## 📄 Files Created for You

All files are in: `C:\Users\edane\OneDrive\LANShare\`

1. **.env.orchestrator** - Orchestrator PC config
2. **.env.worker-rtx5090** - RTX 5090 Ubuntu server config
3. **.env.worker-rtx3060** - RTX 3060 worker config
4. **.env.worker-rtx3090** - RTX 3090Ti worker config
5. **.env.master-infisical** - Master file for Infisical import
6. **INFRASTRUCTURE_REFERENCE.md** - Complete port/service reference
7. **SESSION_HANDOFF.md** - Session context + WSL handoff prompt
8. **INFRA_CONSOLIDATION_GUIDE.md** - This file

---

**Last Updated:** 2026-02-06
**Status:** ✅ Ready for Consolidation
**Tunnel Status:** ✅ Running on port 9999 (no conflicts)
**Tailscale:** ✅ Static IPs configured

Good luck with the consolidation! Reference this file whenever you're unsure about ports, connections, or configuration.
