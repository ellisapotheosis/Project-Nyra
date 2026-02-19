# Project Nyra - Cloudflare Tunnel Bootstrap Integration
## Docker Container Deployment for 4-PC Cluster

**Version:** 1.0.0  
**Integration Point:** `03-GUI-INSTALLER.ps1`  
**Target:** All 4 PCs (Orchestrator + 3 GPU Workers)

---

## Deployment Strategy for Your 4-PC Setup

Based on your infrastructure (Orchestrator mini PC + 3 GPU workers), here's the recommended Cloudflare Tunnel deployment:

### Architecture Overview

```
Internet
    ↓
Cloudflare Edge (ratehunter.net, nyra.ratehunter.net)
    ↓
Cloudflared Tunnel (Token: shared across all 4 PCs)
    ↓
┌─────────────────────────────────────────────┐
│  Orchestrator PC (UH680)                    │
│  ├─ TwentyCRM:3000                          │
│  ├─ Dify:3001                               │
│  ├─ Grafana:3005                            │
│  ├─ n8n:5678                                │
│  ├─ RateHunter:3100 (public landing)       │
│  └─ Nyra Admin:3101 (private webapp)       │
└─────────────────────────────────────────────┘
    ↑
    ├─ GPU Worker 1 (RTX 5090) - Dify LLM processing
    ├─ GPU Worker 2 (RTX 3090Ti) - Quote Engine LLM
    └─ GPU Worker 3 (RTX 3060) - Campaign Engine LLM
```

### Cloudflare Tunnel Configuration

**Create ONE tunnel with FOUR replicas:**

1. **Create Tunnel** in Cloudflare Zero Trust Dashboard
   - Name: `nyra-mortgage-platform`
   - Generate tunnel token
   - Store in Infisical: `/nyra/shared/CLOUDFLARE_TUNNEL_TOKEN`

2. **Configure Public Hostnames** (in dashboard):

| Public Hostname | Service Target | Access Policy |
|----------------|----------------|---------------|
| ratehunter.net | http://ratehunter:3100 | Public (mortgage leads) |
| nyra.ratehunter.net | http://nyra-admin:3101 | Private (team only) |
| crm.ratehunter.net | http://twentycrm:3000 | Private (team only) |
| chat.ratehunter.net | http://dify:3001 | Private (team only) |
| monitor.ratehunter.net | http://grafana:3005 | Private (admins only) |
| workflow.ratehunter.net | http://n8n:5678 | Private (admins only) |

3. **Deploy cloudflared on ALL 4 PCs** (same configuration):

```yaml
# Add to docker-compose.yml on EVERY PC
services:
  cloudflared:
    image: cloudflare/cloudflared:2025.1.0
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:2000/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      # Orchestrator only
      - twentycrm
      - dify
      - grafana
      - n8n
      - ratehunter
      - nyra-admin
```

**Result:** 4 cloudflared replicas providing automatic failover. If Orchestrator PC goes down, traffic fails over to workers (though services won't be available unless you replicate them).

---

## Service Routing Logic

### Orchestrator PC (Hosts All Services)

The orchestrator runs all user-facing services. Cloudflared on this PC routes directly via Docker network:

```
Cloudflared → http://twentycrm:3000 (same network, no ports exposed)
```

### GPU Worker PCs (Compute Only)

Workers run LLM processing but can also run cloudflared replicas for tunnel redundancy:

```yaml
# GPU workers run minimal stack
services:
  cloudflared:
    # Same config as orchestrator
    # Provides tunnel redundancy
    # Services route to orchestrator via LAN IP
```

**Important:** If services are ONLY on orchestrator, configure cloudflared on workers to route to orchestrator IP:

```yaml
# Worker cloudflared routes to orchestrator
services:
  cloudflared:
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
      - TUNNEL_ORIGIN_CERT=/etc/cloudflared/cert.pem
    extra_hosts:
      - "twentycrm:192.168.1.100"  # Orchestrator LAN IP
      - "dify:192.168.1.100"
      - "grafana:192.168.1.100"
```

**Simpler Approach (Recommended for Start):** Only run cloudflared on orchestrator. GPU workers focus purely on compute. Add worker replicas later if you need tunnel HA.

---

## Docker Compose Integration

### Orchestrator PC - Complete Stack

```yaml
version: '3.8'

networks:
  mortgage-network:
    name: mortgage-platform
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  twentycrm-data:
  dify-data:
  n8n-data:
  grafana-data:
  prometheus-data:
  loki-data:
  gitea-data:

services:
  # ============================================================================
  # INFRASTRUCTURE
  # ============================================================================
  
  postgres:
    image: postgres:16-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 2gb
    volumes:
      - redis-data:/data
    networks:
      - mortgage-network

  # ============================================================================
  # NETWORK LAYER - CLOUDFLARE TUNNEL
  # ============================================================================

  cloudflared:
    image: cloudflare/cloudflared:2025.1.0
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - mortgage-network
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:2000/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

  # ============================================================================
  # TAILSCALE VPN (Optional - for admin remote access)
  # ============================================================================

  tailscale:
    image: tailscale/tailscale:latest
    container_name: tailscale
    restart: unless-stopped
    environment:
      - TS_AUTHKEY=${TAILSCALE_AUTH_KEY}
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_USERSPACE=true
    volumes:
      - tailscale-state:/var/lib/tailscale
    networks:
      - mortgage-network
    cap_add:
      - NET_ADMIN

  # ============================================================================
  # APPLICATION LAYER
  # ============================================================================

  twentycrm:
    image: twentycrm/twenty:latest
    container_name: twentycrm
    restart: unless-stopped
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_PASSWORD=${TWENTYCRM_DB_PASSWORD}
      - SECRET_KEY=${TWENTYCRM_SECRET_KEY}
    volumes:
      - twentycrm-data:/app/data
    networks:
      - mortgage-network
    depends_on:
      - postgres
      - redis

  dify:
    image: langgenius/dify-api:latest
    container_name: dify
    restart: unless-stopped
    environment:
      - SECRET_KEY=${DIFY_SECRET_KEY}
      - DB_PASSWORD=${DIFY_DB_PASSWORD}
      - REDIS_HOST=redis
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    networks:
      - mortgage-network
    depends_on:
      - postgres
      - redis

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - mortgage-network
    depends_on:
      - postgres

  ratehunter:
    image: ghcr.io/apotheosis/ratehunter:latest
    container_name: ratehunter
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://ratehunter:${RATEHUNTER_DB_PASSWORD}@postgres:5432/ratehunter
      - NEXT_PUBLIC_SITE_URL=https://ratehunter.net
    networks:
      - mortgage-network
    depends_on:
      - postgres

  nyra-admin:
    image: ghcr.io/apotheosis/nyra-admin:latest
    container_name: nyra-admin
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://nyra:${NYRA_DB_PASSWORD}@postgres:5432/nyra
      - NEXT_PUBLIC_API_URL=https://nyra.ratehunter.net
    networks:
      - mortgage-network
    depends_on:
      - postgres

  gitea:
    image: gitea/gitea:1.21
    container_name: gitea
    restart: unless-stopped
    environment:
      - GITEA__database__DB_TYPE=postgres
      - GITEA__database__HOST=postgres:5432
      - GITEA__database__PASSWD=${GITEA_DB_PASSWORD}
    volumes:
      - gitea-data:/data
    ports:
      - "3200:3000"
      - "3222:22"
    networks:
      - mortgage-network
    depends_on:
      - postgres

  # ============================================================================
  # OBSERVABILITY
  # ============================================================================

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=90d'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - mortgage-network

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_SERVER_ROOT_URL=https://monitor.ratehunter.net
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3005:3000"
    networks:
      - mortgage-network
    depends_on:
      - prometheus

  loki:
    image: grafana/loki:latest
    container_name: loki
    restart: unless-stopped
    volumes:
      - loki-data:/loki
    ports:
      - "3100:3100"
    networks:
      - mortgage-network
```

### Prometheus Scrape Config for Cloudflared Metrics

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'cloudflared'
    static_configs:
      - targets: ['cloudflared:2000']
    metrics_path: '/metrics'
```

---

## Koyeb.com Integration Strategy

Since you have free Koyeb VPS, here's how to use it:

### Option A: Public Landing Page (Recommended)

Host **ratehunter.net** (public mortgage lead landing page) on Koyeb:

```
User → ratehunter.net (Koyeb VPS) → Form submission → Webhook to your LAN
                                   ↓
                         Cloudflare Workers (CORS proxy)
                                   ↓
                         Your n8n webhook (via Cloudflare Tunnel)
```

**Benefits:**
- Offload public traffic from your home internet
- Static Next.js site on Koyeb (free tier)
- Your LAN only receives webhook payloads (small data)

### Option B: Backend API Gateway

Host a lightweight API gateway on Koyeb that forwards authenticated requests to your private services:

```
Mobile App → api.ratehunter.net (Koyeb) → JWT validation
                                         ↓
                                    Cloudflare Tunnel
                                         ↓
                                    Your Services
```

### Option C: Don't Use Koyeb (Simplest)

Host everything behind Cloudflare Tunnel. Koyeb stays as backup option.

---

## GUI Installer Integration Checklist

### Orchestrator PC Bootstrap Steps

When user selects "Orchestrator" in `03-GUI-INSTALLER.ps1`:

1. **Install Base Dependencies**
   - Docker Desktop for Windows
   - WSL2 Ubuntu 22.04
   - Tailscale (Windows native)
   - Infisical CLI (Windows + WSL2)

2. **Configure Cloudflare Tunnel**
   - Prompt: "Enter Cloudflare Tunnel Token" (or fetch from Infisical)
   - Store in Infisical: `/nyra/orchestrator/CLOUDFLARE_TUNNEL_TOKEN`
   - Inject into `.env` file

3. **Deploy Docker Stack**
   - Copy `docker-compose.orchestrator.yml` to PC
   - Run: `infisical run -- docker compose up -d`
   - Wait for all healthchecks to pass

4. **Verify Tunnel Connectivity**
   - Test: `curl https://ratehunter.net/health`
   - Test: `curl https://monitor.ratehunter.net/api/health`

5. **Configure Cloudflare DNS**
   - Auto-configure A records (if API token provided)
   - Or display manual DNS instructions

### GPU Worker PC Bootstrap Steps

When user selects "Worker" in GUI:

1. **Install Base Dependencies**
   - Docker Desktop for Windows
   - NVIDIA Container Toolkit
   - Infisical CLI

2. **Deploy Minimal Stack**
   - Cloudflared (optional, for tunnel redundancy)
   - LLM inference containers (Ollama, vLLM, etc.)

3. **Configure LAN Connectivity**
   - Test connectivity to orchestrator: `curl http://192.168.1.100:3000`

---

## PowerShell Script: Deploy Cloudflare Tunnel

```powershell
# bootstrap\scripts\Deploy-CloudflareTunnel.ps1

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('Orchestrator', 'Worker-5090', 'Worker-3090', 'Worker-3060')]
    [string]$PCRole,
    
    [Parameter(Mandatory=$false)]
    [string]$TunnelToken,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseInfisical
)

function Deploy-CloudflareTunnel {
    Write-Host "🚀 Deploying Cloudflare Tunnel for $PCRole..." -ForegroundColor Cyan
    
    # Get tunnel token
    if ($UseInfisical) {
        Write-Host "📦 Fetching tunnel token from Infisical..." -ForegroundColor Yellow
        $TunnelToken = infisical secrets get CLOUDFLARE_TUNNEL_TOKEN --path /nyra/shared --silent
    }
    
    if ([string]::IsNullOrEmpty($TunnelToken)) {
        Write-Host "❌ Tunnel token not provided!" -ForegroundColor Red
        exit 1
    }
    
    # Create cloudflared config
    $composeFile = "$PSScriptRoot\..\docker-compose.yml"
    
    # Check if cloudflared already exists
    if (docker ps -a --format '{{.Names}}' | Select-String -Pattern "^cloudflared$") {
        Write-Host "⚠️  cloudflared container already exists. Removing..." -ForegroundColor Yellow
        docker rm -f cloudflared
    }
    
    # Start cloudflared
    Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Cyan
    
    docker run -d `
        --name cloudflared `
        --restart unless-stopped `
        --network mortgage-network `
        -e TUNNEL_TOKEN=$TunnelToken `
        cloudflare/cloudflared:2025.1.0 `
        tunnel --metrics 0.0.0.0:2000 --no-autoupdate run
    
    # Wait for tunnel to connect
    Write-Host "⏳ Waiting for tunnel to connect..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verify tunnel health
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:2000/ready" -Method Get -TimeoutSec 5
        Write-Host "✅ Cloudflare Tunnel is healthy!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Tunnel health check failed!" -ForegroundColor Red
        docker logs cloudflared --tail 50
        exit 1
    }
    
    Write-Host "`n🎉 Cloudflare Tunnel deployed successfully!" -ForegroundColor Green
    Write-Host "📊 Metrics available at: http://localhost:2000/metrics" -ForegroundColor Cyan
}

Deploy-CloudflareTunnel
```

---

## Troubleshooting

### Tunnel Not Connecting

```powershell
# Check cloudflared logs
docker logs cloudflared --tail 50

# Common issues:
# - Invalid tunnel token
# - Firewall blocking outbound HTTPS
# - Docker network not created
```

### Services Not Accessible via Domain

```powershell
# Verify cloudflared is running
docker ps | Select-String cloudflared

# Test from inside container
docker exec cloudflared wget -O- http://twentycrm:3000/health

# Check Cloudflare Tunnel dashboard for connection status
```

### Port Conflicts

```powershell
# Check what's using port 2000 (cloudflared metrics)
netstat -ano | findstr ":2000"

# Kill conflicting process
Stop-Process -Id <PID> -Force
```

---

## Summary

**For your 4-PC setup:**

1. **Cloudflared**: Containerized on orchestrator (required), optionally on workers (for HA)
2. **Tailscale**: Windows native service (VPN for admin access)
3. **Service Hosting**: All user-facing services on orchestrator
4. **GPU Workers**: LLM compute only, minimal Docker stack
5. **Koyeb**: Optional for public landing page or API gateway
6. **Domains**: 
   - `ratehunter.net` → Public landing (lead generation)
   - `nyra.ratehunter.net` → Private admin webapp
   - `*.ratehunter.net` → Internal services (CRM, monitoring, etc.)

This configuration gives you:
- ✅ Public access from anywhere via Cloudflare Tunnel
- ✅ Automatic HTTPS with Cloudflare SSL
- ✅ No port forwarding or firewall configuration
- ✅ HA through 4 tunnel replicas (if deployed on all PCs)
- ✅ Prometheus metrics for monitoring
- ✅ VPN fallback via Tailscale for emergencies
