# Project Nyra - 4-PC Distributed Architecture

**Generated**: 2026-01-13
**Status**: Design Phase
**Agent**: agent-4pc-architect

---

## 🎯 Overview

Distributed deployment architecture for Project Nyra across 4 PCs:
- **PC1 (Orchestrator)**: Mini PC - MCP servers, coordination, memory systems
- **PC2 (Worker)**: RTX 5090 48GB - Primary AI inference and reasoning
- **PC3 (Worker)**: RTX 3090 Ti 24GB - Secondary AI tasks and analysis
- **PC4 (Worker)**: RTX 3060 12GB - Coding and lightweight tasks

---

## 📐 Architecture Design

### Network Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
│                         nyra-network                         │
│                     (Bridge + Overlay)                       │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │   PC1   │    │   PC2   │    │   PC3   │    │   PC4   │
    │Orchestr.│    │ Worker  │    │ Worker  │    │ Worker  │
    │  Mini   │    │ 5090    │    │ 3090Ti  │    │  3060   │
    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Service Distribution

#### PC1 (Orchestrator) - MCP & Coordination Layer
```yaml
services:
  - postgres (pgvector)
  - redis
  - qdrant (vector DB)
  - falkordb (graph DB)
  - litellm (LLM proxy)
  - letta (memory server)
  - grafana (monitoring UI)
  - prometheus (metrics)
  - loki (logs)
  - claude-flow daemon
  - nexus-router (MCP entrypoint)

mcp_servers:
  - claude-flow
  - ruv-swarm
  - agentdb
  - ruvector
  - letta
  - graphiti
  - mem0
  - filesystem
  - github

networks:
  - nyra-network (bridge + overlay)
```

#### PC2 (Worker - RTX 5090) - Reasoning & Complex Tasks
```yaml
services:
  - ollama (local LLM inference)
  - vllm (fast inference)
  - text-generation-webui

gpu_allocation:
  - role: reasoning
  - vram: 48GB
  - tasks: complex reasoning, multi-step planning, large context

workload_priority:
  1. Strategic planning
  2. Architecture design
  3. Code review with context
  4. Research synthesis
```

#### PC3 (Worker - RTX 3090 Ti) - Analysis & Processing
```yaml
services:
  - ollama (local LLM inference)
  - vllm (fast inference)

gpu_allocation:
  - role: analysis
  - vram: 24GB
  - tasks: code analysis, testing, data processing

workload_priority:
  1. Code analysis
  2. Testing coordination
  3. Data transformation
  4. Security scanning
```

#### PC4 (Worker - RTX 3060) - Coding & Implementation
```yaml
services:
  - ollama (local LLM inference)
  - vllm (fast inference)

gpu_allocation:
  - role: coding
  - vram: 12GB
  - tasks: code generation, editing, refactoring

workload_priority:
  1. Code generation
  2. Bug fixes
  3. Refactoring
  4. Documentation
```

---

## 🗂️ Directory Structure

```
Project-Nyra/
├── bootstrap-kit-pc1/          # Orchestrator setup
│   ├── docker-compose.yml      # PC1 services
│   ├── .env                    # PC1 environment
│   ├── scripts/
│   │   ├── up.ps1             # Start PC1 services
│   │   ├── down.ps1           # Stop PC1 services
│   │   ├── inspect.ps1        # Inspect PC1 status
│   │   └── doctor.ps1         # Health check PC1
│   └── config/
│       ├── mcp/               # MCP server configs
│       ├── nexus/             # Nexus router config
│       └── monitoring/        # Monitoring configs
│
├── bootstrap-kit-pc2/          # Worker 1 (RTX 5090)
│   ├── docker-compose.yml
│   ├── .env
│   ├── scripts/
│   │   ├── up.ps1
│   │   ├── down.ps1
│   │   ├── inspect.ps1
│   │   └── doctor.ps1
│   └── config/
│       └── ollama/
│
├── bootstrap-kit-pc3/          # Worker 2 (RTX 3090 Ti)
│   ├── docker-compose.yml
│   ├── .env
│   ├── scripts/
│   │   ├── up.ps1
│   │   ├── down.ps1
│   │   ├── inspect.ps1
│   │   └── doctor.ps1
│   └── config/
│       └── ollama/
│
└── bootstrap-kit-pc4/          # Worker 3 (RTX 3060)
    ├── docker-compose.yml
    ├── .env
    ├── scripts/
    │   ├── up.ps1
    │   ├── down.ps1
    │   ├── inspect.ps1
    │   └── doctor.ps1
    └── config/
        └── ollama/
```

---

## 🔧 Docker Compose Profiles

### PC1 - docker-compose.yml
```yaml
version: '3.8'

networks:
  nyra-network:
    driver: overlay
    attachable: true
    ipam:
      config:
        - subnet: 172.20.0.0/16

services:
  postgres:
    # ... (existing postgres config)
    networks:
      nyra-network:
        ipv4_address: 172.20.0.10

  redis:
    # ... (existing redis config)
    networks:
      nyra-network:
        ipv4_address: 172.20.0.11

  # ... (other PC1 services)
```

### PC2/PC3/PC4 - docker-compose.yml
```yaml
version: '3.8'

networks:
  nyra-network:
    external: true
    name: nyra-network

services:
  ollama:
    image: ollama/ollama:latest
    container_name: nyra-ollama-pc${PC_NUMBER}
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_ORIGINS=*
    volumes:
      - ollama-data:/root/.ollama
    ports:
      - "${OLLAMA_PORT}:11434"
    networks:
      - nyra-network
```

---

## 🚀 Management Scripts

### up.ps1
```powershell
# Start services for this PC
param(
    [switch]$Build,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ComposeFile = Join-Path $ScriptDir "..\docker-compose.yml"

Write-Host "🚀 Starting Project Nyra services..." -ForegroundColor Green

if ($Build) {
    docker-compose -f $ComposeFile build
}

docker-compose -f $ComposeFile up -d

if ($Verbose) {
    docker-compose -f $ComposeFile ps
    docker-compose -f $ComposeFile logs --tail=50
}

Write-Host "✅ Services started successfully" -ForegroundColor Green
```

### down.ps1
```powershell
# Stop services for this PC
param(
    [switch]$Volumes
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ComposeFile = Join-Path $ScriptDir "..\docker-compose.yml"

Write-Host "🛑 Stopping Project Nyra services..." -ForegroundColor Yellow

if ($Volumes) {
    docker-compose -f $ComposeFile down -v
} else {
    docker-compose -f $ComposeFile down
}

Write-Host "✅ Services stopped successfully" -ForegroundColor Green
```

### inspect.ps1
```powershell
# Inspect service status
$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ComposeFile = Join-Path $ScriptDir "..\docker-compose.yml"

Write-Host "🔍 Project Nyra Service Status" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

docker-compose -f $ComposeFile ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n📊 Resource Usage:" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### doctor.ps1
```powershell
# Health check all services
$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot
$ComposeFile = Join-Path $ScriptDir "..\docker-compose.yml"

Write-Host "🏥 Project Nyra Health Check" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta

$services = docker-compose -f $ComposeFile ps --services

foreach ($service in $services) {
    $status = docker inspect --format='{{.State.Status}}' "nyra-$service" 2>$null
    $health = docker inspect --format='{{.State.Health.Status}}' "nyra-$service" 2>$null

    $icon = if ($status -eq "running") { "✅" } else { "❌" }
    $healthIcon = switch ($health) {
        "healthy" { "💚" }
        "unhealthy" { "❤️" }
        default { "⚪" }
    }

    Write-Host "$icon $service ($status) $healthIcon" -ForegroundColor $(if ($status -eq "running") { "Green" } else { "Red" })
}

Write-Host "`n🌐 Network Connectivity:" -ForegroundColor Magenta
docker network inspect nyra-network --format='{{range .Containers}}{{.Name}}: {{.IPv4Address}}{{println}}{{end}}'
```

---

## 🔒 Security Considerations

### Network Security
- Use overlay network with encryption
- Implement TLS for inter-PC communication
- Firewall rules: only necessary ports exposed
- VPN for remote access (CloudFlare Tunnel recommended)

### Secrets Management
- Use Infisical for centralized secrets
- Environment-specific .env files (not committed)
- Rotate credentials regularly
- Secure key storage using Bitwarden MCP

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All PCs have Docker + Docker Compose installed
- [ ] Network connectivity between all PCs verified
- [ ] GPU drivers installed (NVIDIA Container Toolkit)
- [ ] Storage volumes created on each PC
- [ ] Environment files configured (.env for each PC)
- [ ] Infisical secrets synced

### Initial Deployment
- [ ] PC1: Start orchestrator services (`./scripts/up.ps1`)
- [ ] Verify PC1 health (`./scripts/doctor.ps1`)
- [ ] PC2: Join swarm and start worker services
- [ ] PC3: Join swarm and start worker services
- [ ] PC4: Join swarm and start worker services
- [ ] Verify cross-PC network connectivity
- [ ] Test MCP server routing through Nexus
- [ ] Verify GPU allocation and utilization

### Post-Deployment
- [ ] Configure monitoring dashboards (Grafana)
- [ ] Set up alerting rules (Prometheus)
- [ ] Test failover scenarios
- [ ] Document IP addresses and ports
- [ ] Create backup strategy
- [ ] Schedule regular health checks

---

## 🔄 Coordination Strategy

### Task Distribution
```
User Request
     ↓
  PC1: Nexus Router (MCP Entrypoint)
     ↓
  PC1: Claude-Flow Orchestrator
     ↓
  Task Analysis & Classification
     ├── Reasoning Task → PC2 (RTX 5090)
     ├── Analysis Task → PC3 (RTX 3090 Ti)
     └── Coding Task → PC4 (RTX 3060)
     ↓
  Results Aggregation (PC1)
     ↓
  Response to User
```

### Load Balancing
- CPU-intensive: Distribute based on current load
- GPU-intensive: Route based on VRAM requirements
- Memory-intensive: Route to PC with available RAM
- Failover: If PC unavailable, route to next best option

---

## 🚀 UI Deployment Flexibility

### UI Services (Can run on any PC)
- Open-WebUI
- LobeChat
- Dify Web
- Activepieces UI
- n8n UI
- Grafana

### Deployment Strategy
```yaml
# Add to any PC's docker-compose.yml
ui_services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: nyra-open-webui
    environment:
      - OLLAMA_BASE_URL=http://172.20.0.50:11434  # PC2
      - WEBUI_AUTH=true
    ports:
      - "3003:8080"
    networks:
      - nyra-network
```

### Access Pattern
- Any PC can run UI services
- UIs connect to backend services on PC1 via overlay network
- Use reverse proxy (Traefik/Caddy) for unified access
- Example: `https://nyra.ratehunter.net` routes to any PC's UI

---

## 📊 Monitoring Strategy

### Metrics Collection (PC1)
- Prometheus scrapes all PCs
- Grafana dashboards show cross-PC metrics
- Loki aggregates logs from all PCs
- Alerts for: GPU utilization, memory usage, service health

### Dashboard Panels
- GPU utilization per PC
- Task distribution heatmap
- Response time per PC
- Network throughput between PCs
- Service health matrix

---

## 🔮 Future Enhancements

1. **Dynamic Scaling**: Auto-scale services based on demand
2. **Kubernetes Migration**: Move to K8s for production orchestration
3. **Edge Computing**: Add edge devices for local inference
4. **Multi-Region**: Extend to cloud for hybrid deployment
5. **Advanced Routing**: ML-based task routing optimization

---

**Next Steps**:
1. Create bootstrap-kit folders with scripts
2. Generate PC-specific docker-compose.yml files
3. Test network connectivity between PCs
4. Deploy orchestrator (PC1) first
5. Progressively add workers (PC2, PC3, PC4)
6. Validate GPU allocation and task distribution

