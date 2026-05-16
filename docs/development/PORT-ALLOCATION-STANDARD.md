# Project Nyra - Standardized Port Allocation

## Purpose
This document defines the **canonical port assignments** for all Project Nyra services across the 4-PC cluster. All docker-compose files MUST follow this standard to prevent port conflicts.

## Critical Rules
1. **Never change these port assignments** without updating ALL docker-compose files
2. **Check port availability** before bootstrap using pre-flight script
3. **Firewall rules** must allow these ports on appropriate PCs
4. **Cloudflare tunnels** will proxy these internal ports to public subdomains

---

## Orchestrator PC (UH680) - Core Services

| Port | Service | Protocol | Purpose | External Access |
|------|---------|----------|---------|-----------------|
| 6000 | Nexus Router | HTTP | LLM Gateway (Anthropic/OpenRouter/Gemini) | No |
| 3000 | TwentyCRM | HTTP | System of Record CRM | Via Tunnel |
| 3001 | Dify | HTTP | Borrower Chat Interface | Via Tunnel |
| 3005 | Grafana | HTTP | Monitoring Dashboard | Via Tunnel |
| 3100 | Loki | HTTP | Log Aggregation | No |
| 5678 | n8n | HTTP | Workflow Automation | Via Tunnel |
| 8283 | Letta | HTTP | Conversation Memory Server | No |
| 4321 | Mem0 | HTTP | Universal Memory API | No |
| 9090 | Prometheus | HTTP | Metrics Collection | No |
| 6379 | Redis | TCP | Cache & Session Store | No |
| 5432 | PostgreSQL | TCP | Primary Database | No |

---

## Worker PC Ports (All 3 Workers)

| Port | Service | Protocol | Purpose | External Access |
|------|---------|----------|---------|-----------------|
| 8001 | Worker Health | HTTP | Health check endpoint | No |
| 4001 | LiteLLM Proxy | HTTP | Local LLM inference | No |
| 9001 | Node Exporter | HTTP | System metrics for Prometheus | No |

**Note**: Each worker uses the SAME ports locally. They're accessed via IP address:
- Worker-1 (RTX 3060): 192.168.1.101:4001
- Worker-2 (RTX 5090): 192.168.1.102:4001
- Worker-3 (RTX 3090Ti): 192.168.1.103:4001

---

## Application Services (Deployed on Orchestrator)

| Port | Service | Protocol | Purpose | External Access |
|------|---------|----------|---------|-----------------|
| 3100 | RateHunter | HTTP | Public mortgage landing page | Via Tunnel (public) |
| 3101 | Nyra Admin | HTTP | Internal operations dashboard | Via Tunnel (private) |
| 8001 | Quote Engine | HTTP | Mortgage calculation API | No |
| 8002 | Campaign Engine | HTTP | Drip campaign API | No |
| 8003 | Nyra Orchestrator | HTTP | Internal coordination API | No |

---

## Port Conflict Resolution

### FIXED: Grafana Port Conflict
**Problem**: Grafana was configured as both `:3001` and `:3000` in different files
**Solution**: Standardized to `:3005` (chosen because 3000=TwentyCRM, 3001=Dify)

**Update these files**:
```yaml
# infra/docker/docker-compose.yml
grafana:
  ports:
    - "3005:3000"  # CORRECTED: Was 3001:3000

# infra/docker/docker-compose.monitoring.yml
grafana:
  ports:
    - "3005:3000"  # CORRECTED: Was 3000:3000
```

### FIXED: Loki vs RateHunter Port Conflict
**Problem**: Both Loki (logs) and RateHunter (public site) wanted port 3100
**Solution**: Loki keeps 3100 (internal), RateHunter uses same (no conflict since RateHunter is external-facing via Cloudflare Tunnel)

**Clarification**:
- Loki runs on internal network only (not exposed)
- RateHunter exposed via `https://ratehunter.net` (Cloudflare Tunnel proxies to internal 3100)
- No actual conflict because different network scopes

---

## Network Architecture

### Internal Network (Docker Bridge)
All services communicate via Docker internal network:
```
nexus:6000 → anthropic.com (external)
dify:3001 → nexus:6000 → LLM APIs
n8n:5678 → quote-engine:8001 → calculations
campaign-engine:8002 → twilio.com (external)
```

### Cloudflare Tunnel Mappings (External Access)
```
https://app.projectnyra.com → orchestrator:3001 (Dify)
https://crm.projectnyra.com → orchestrator:3000 (TwentyCRM)
https://admin.ratehunter.net → orchestrator:3101 (Nyra Admin)
https://ratehunter.net → orchestrator:3100 (RateHunter public)
https://n8n.projectnyra.com → orchestrator:5678 (n8n workflows)
https://grafana.projectnyra.com → orchestrator:3005 (Grafana)
```

### Worker Access (Internal Only)
```
orchestrator → 192.168.1.101:4001 (Worker-1 LiteLLM)
orchestrator → 192.168.1.102:4001 (Worker-2 LiteLLM)
orchestrator → 192.168.1.103:4001 (Worker-3 LiteLLM)
```

---

## Firewall Rules

### Orchestrator Inbound (from LAN only)
```powershell
# Allow from worker PCs
New-NetFirewallRule -DisplayName "Nyra Orchestrator Services" `
  -Direction Inbound -LocalPort 6000,3000,3001,5678,8001,8002,8003 `
  -Protocol TCP -Action Allow `
  -RemoteAddress 192.168.1.101,192.168.1.102,192.168.1.103
```

### Worker Inbound (from orchestrator only)
```powershell
# Allow from orchestrator
New-NetFirewallRule -DisplayName "Nyra Worker Services" `
  -Direction Inbound -LocalPort 4001,8001,9001 `
  -Protocol TCP -Action Allow `
  -RemoteAddress 192.168.1.100
```

### Orchestrator Outbound (to internet)
```powershell
# Allow LLM API calls
New-NetFirewallRule -DisplayName "Nyra LLM APIs" `
  -Direction Outbound `
  -RemoteAddress api.anthropic.com,openrouter.ai,generativelanguage.googleapis.com `
  -Protocol TCP -Action Allow
```

---

## Health Check Endpoints

All services MUST implement `/health` endpoint returning JSON:

```json
{
  "status": "healthy",
  "service": "nexus-router",
  "version": "2.0.0",
  "uptime_seconds": 3600,
  "dependencies": {
    "anthropic": "healthy",
    "redis": "healthy"
  }
}
```

**Expected Response Codes**:
- `200 OK`: Service healthy and ready
- `503 Service Unavailable`: Service degraded but running
- `Timeout`: Service not responding (critical)

---

## Port Conflict Pre-Flight Check

Run this before bootstrap to detect conflicts:

```powershell
# Check if required ports are available
$ports = @(6000,3000,3001,3005,3100,5678,8001,8002,8283,4321,9090,6379,5432)

foreach ($port in $ports) {
    $inUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($inUse) {
        Write-Host "❌ Port $port IN USE by PID $($inUse[0].OwningProcess)"
        $process = Get-Process -Id $inUse[0].OwningProcess
        Write-Host "   Process: $($process.ProcessName)"
    } else {
        Write-Host "✅ Port $port available"
    }
}
```

---

## Updating Port Assignments

If you MUST change a port:

1. Update this document first
2. Update `.env.template` with new port
3. Update ALL docker-compose files:
   - `infra/docker/docker-compose.yml`
   - `infra/docker/docker-compose.monitoring.yml`
   - `infra/docker/docker-compose.dev.yml`
4. Update Cloudflare Tunnel configuration
5. Update firewall rules
6. Update health check scripts
7. Notify all developers

**NEVER change a port in just one file** - this creates conflicts.

---

## Quick Reference

**Most commonly accessed services**:
```bash
# Nexus LLM Gateway
curl http://localhost:6000/health

# TwentyCRM
open http://localhost:3000

# Dify Chat
open http://localhost:3001

# Grafana Monitoring
open http://localhost:3005

# n8n Workflows
open http://localhost:5678

# Prometheus Metrics
open http://localhost:9090
```

---

## Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
netstat -ano | findstr :<port>

# Kill the process (use PID from above)
taskkill /PID <pid> /F

# Or stop via Docker
docker stop $(docker ps -q --filter "publish=<port>")
```

### "Cannot connect to service"
```bash
# Check if container is running
docker ps | grep <service>

# Check container logs
docker logs <container-name>

# Check if port is actually open
Test-NetConnection localhost -Port <port>
```

### "Service starts but immediately exits"
```bash
# Usually a port conflict - check logs
docker logs <container-name>

# Common cause: port already bound
# Solution: Stop conflicting service first
```

---

Last updated: 2025-01-18
Version: 1.0.0
