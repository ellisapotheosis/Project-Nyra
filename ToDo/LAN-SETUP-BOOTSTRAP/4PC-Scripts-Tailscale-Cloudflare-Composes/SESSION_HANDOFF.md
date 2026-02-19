# Project Nyra - Session Handoff Document
**Date:** 2026-02-06
**Status:** In Progress - Deployment Phase
**Location:** Transitioning from Windows to WSL/Ubuntu environment

---

## 🎯 Current Objective

Complete the orchestrator deployment on Ubuntu server and finalize Cloudflare tunnel + Tailscale network configuration.

---

## ✅ Completed Tasks

### 1. Fixed DEPLOY.sh Line Ending Issues
- **Problem:** CRLF (Windows) line endings caused script failure on Ubuntu
- **Solution:** Ran `dos2unix ./DEPLOY.sh` on Ubuntu server
- **Status:** ✅ DEPLOY.sh is now executable and running

### 2. ✅ Fixed Port 8080 Conflict
- **Problem:** Both cloudflared metrics AND auth-service trying to use port 8080
- **Solution:** Changed metrics to port 9999 in `orchestrator-essential.yml`
- **Status:** ✅ FIXED - Ready to restart tunnel

### 3. ✅ Fixed Claude Flow Dashboard Port
- **Problem:** `flow.ratehunter.net` pointing to wrong port (3100 instead of 3003)
- **Solution:** Updated tunnel config to point to correct port 3003
- **Status:** ✅ FIXED - Dashboard will be accessible after tunnel restart

### 4. ✅ Configured Tailscale Static IPs
- **Orchestrator:** 100.64.0.1 ✅
- **RTX 5090 (Ubuntu):** 100.64.0.10 ✅
- **RTX 3060:** 100.64.0.11 ✅
- **Status:** ✅ All set in Tailscale admin console

### 5. ✅ Updated .env.template with Static IPs
- **Location:** `C:\Users\edane\OneDrive\LANShare\cf-tailscale-network-scripts-setup\.env.template`
- **Status:** ✅ Template ready for copying to each machine

---

## 🚧 Next Actions Required

### ✅ DONE: Port Conflicts Fixed
All port conflicts resolved in `orchestrator-essential.yml`:
- Metrics moved from 8080 → 9999
- Claude Flow Dashboard corrected from 3100 → 3003

### Priority 1: Restart Cloudflared Tunnel (Windows - Main PC)

**After switching back to Windows**, restart the tunnel:
```powershell
# Stop tunnel (if running)
taskkill /F /IM cloudflared.exe

# Restart with fixed config
cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run

# OR install as service (recommended)
cloudflared service install
Start-Service cloudflared
```

### Priority 2: Create .env Files on Each Machine

Copy `.env.template` to `.env` on each machine and fill in API keys:
```bash
# On Ubuntu (RTX 5090)
cd ~/projects/project-nyra
cp ~/../../mnt/c/Users/edane/OneDrive/LANShare/cf-tailscale-network-scripts-setup/.env.template .env
# Then edit .env and add your API keys

# On other workers
# Similar process - copy template and customize
```

---

## 🔧 Tailscale Configuration Needed

### ✅ Static IPs CONFIGURED (2026-02-06)

| Machine | Hostname | Role | Static IP | Status |
|---------|----------|------|-----------|--------|
| Main Windows PC | orchestrator | Orchestrator | `100.64.0.1` | ✅ Online |
| Ubuntu Server | worker-rtx5090 | Worker - RTX 5090 | `100.64.0.10` | ⚠️ Offline (being configured) |
| Worker PC | worker-rtx3060 | Worker - RTX 3060 | `100.64.0.11` | ✅ Online |
| (Future) | worker-rtx3090 | Worker - RTX 3090Ti | `100.64.0.12` | Not yet configured |

**Action Required:** Update .env files on each machine with these IPs.

---

## 📁 File Locations Reference

### Windows (Main PC - Orchestrator)
```
C:\Users\edane\OneDrive\LANShare\
├── cloudflared-configs\
│   ├── orchestrator-essential.yml          ← Active tunnel config (NEEDS FIXES)
│   ├── orchestrator-essential-MinisApotheosis.yml  ← Fixed version (reference)
│   └── [other tunnel configs]
├── cf-tailscale-network-scripts-setup\
│   ├── CLAUDE_FLOW_DASHBOARD_README.md     ← Port reference (3003, 3004, 3005)
│   ├── NYRA-NETWORK-SETUP-GUIDE.md         ← Network setup guide
│   ├── .env.template                        ← Environment variables template
│   └── docker-compose.*.yml                 ← GPU worker compose files
└── C:\Users\edane\.cloudflared\
    ├── 64fe03f2-9859-44ca-b0ab-e499d8464104.json  ← Tunnel credentials
    └── cert.pem                             ← Cloudflare certificate
```

### Ubuntu Server (Worker - RTX 5090)
```
~/projects/project-nyra/
├── DEPLOY.sh                                ← Service deployment script (RUNNING)
├── services/                                ← 14 microservices
├── apps/                                    ← Frontend applications
└── infra/                                   ← Infrastructure configs (BEING REBUILT)
```

---

## 🌐 Tunnel Architecture Decision

### ❓ Do You Need a Tunnel on Each PC?

**Short Answer:** NO - Only the orchestrator needs a public Cloudflare tunnel.

**Why:**
- **Orchestrator (Main Windows PC):** Needs tunnel for public-facing services (websites, APIs)
- **Worker PCs (RTX 5090, RTX 3060):** Use Tailscale only for private communication

**Exception:** If you want to expose Ollama/vLLM APIs publicly (not recommended for security), add tunnels to workers.

### Network Flow Diagram

```
Internet Users
    ↓
Cloudflare CDN (ratehunter.net, nyra.ratehunter.net, etc.)
    ↓
Cloudflare Tunnel (orchestrator-essential)
    ↓
Main Windows PC (Orchestrator)
    ↓ (via Tailscale private network)
RTX 5090 Worker (100.64.0.10) + RTX 3060 Worker (100.64.0.11)
```

---

## 🐳 Docker Container Summary

### Current Services (from DEPLOY.sh)

| Port | Service | Status | Notes |
|------|---------|--------|-------|
| 3000 | Grafana | Should be Docker | Monitoring dashboard |
| 3001 | Landing Page | npm | Public website |
| 3002 | Webapp (Broker Portal) | npm | Nyra broker interface |
| 3003 | Claude Flow Dashboard | Docker | Dev/ops monitoring |
| 3004 | Event Server (WS) | Docker | WebSocket server |
| 3005 | Event Server (HTTP) | Docker | CLI event endpoint |
| 3020 | CRM | Docker/npm | TBD |
| 4000 | Archon OS (Admin) | npm | Admin dashboard |
| 5000 | Activepieces | Docker/npm | Workflow automation |
| 5678 | n8n | Docker/npm | Workflow automation |
| 6000 | Nexus Router | npm | API Gateway |
| 8000 | Orchestrator Service | npm | Main orchestrator |
| 8010-8050 | Microservices | npm | Lead, Quote, Rate, Doc, Campaign APIs |
| 8080 | Auth Service | npm | Authentication (CONFLICTS with metrics!) |
| 8090 | Security Service | npm | Security layer |
| 9999 | Cloudflared Metrics | Tunnel | Tunnel health monitoring |

### Recommended Docker Deployments

**Orchestrator PC:**
```bash
# Grafana (if not already running)
docker run -d --name grafana -p 3000:3000 grafana/grafana

# n8n (if preferred over npm)
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n

# Claude Flow Dashboard + Event Server
cd ~/projects/project-nyra
docker compose -f infra/docker-compose/docker-compose.event-server.yml up -d
docker compose -f infra/docker-compose/docker-compose.claude-flow-dashboard.yml up -d
```

**Worker PC - RTX 5090:**
```bash
# vLLM for heavy inference
docker compose -f docker-compose.gpu-5090.yml up -d
```

**Worker PC - RTX 3060:**
```bash
# Ollama for lightweight models
docker compose -f docker-compose.gpu-3060.yml up -d
```

---

## 🔍 What We Were Working On (Full Context)

### Session 1: Initial Network Setup
- Discussed Tailscale mesh network architecture
- Planned Cloudflare tunnel for public services
- Reviewed GPU worker allocation (5090 = vLLM, 3060 = Ollama)

### Session 2: Deployment Issues
- Fixed DEPLOY.sh CRLF line endings
- Discovered port 8080 conflict (metrics vs auth-service)
- Identified Claude Flow Dashboard port mismatch (3100 vs 3003)

### Session 3: Configuration Review (Current)
- Reviewed all cloudflared configs
- Reviewed network setup docs
- Clarified tunnel architecture (1 tunnel on orchestrator, not on workers)
- Prepared handoff to WSL agent for continued deployment

---

## 📋 Next Steps for WSL Agent

### Immediate Actions (Ubuntu Server)

1. **Check DEPLOY.sh Status**
   ```bash
   # Are services starting successfully?
   ps aux | grep node

   # Check for any errors
   tail -f /var/log/syslog | grep -i error
   ```

2. **Verify Port Availability**
   ```bash
   # Check what's using port 8080
   sudo lsof -i :8080

   # Should show auth-service only
   ```

3. **Test Service Endpoints**
   ```bash
   # Test each service
   curl http://localhost:3001  # Landing
   curl http://localhost:3002  # Webapp
   curl http://localhost:8000  # Orchestrator
   curl http://localhost:8080  # Auth
   ```

4. **Monitor Service Logs**
   ```bash
   # If using pm2
   pm2 logs

   # Or check individual logs
   # (location depends on how DEPLOY.sh starts services)
   ```

### Configuration Updates (Windows - Coordinate with User)

User needs to update on Windows side:
1. Fix orchestrator-essential.yml (metrics port + flow dashboard port)
2. Restart cloudflared tunnel
3. Set Tailscale static IPs via web console

### Infrastructure Rebuild

User mentioned agent will "completely redo infra folder":
- **CRITICAL:** Ensure new infra configs match port assignments in INFRASTRUCTURE_REFERENCE.md
- Verify docker-compose files use correct ports
- Update .env files with Tailscale IPs once set

---

## 🚨 Critical Warnings

1. **Port 8080 Conflict:** Must be resolved before tunnel will work
2. **Flow Dashboard Port:** Will 404 until tunnel points to 3003
3. **Infra Rebuild:** Ensure port consistency across all configs
4. **Tailscale IPs:** Update .env after setting static IPs
5. **CRLF Line Endings:** Any new scripts must use LF (Unix) line endings

---

## 📞 Questions for User

1. Are all services starting successfully on Ubuntu after DEPLOY.sh?
2. Have you updated the tunnel config yet (metrics + flow dashboard ports)?
3. Do you want the WSL agent to handle tunnel config updates, or will you do it on Windows?
4. What specific parts of the infra folder need rebuilding?

---

## 🔗 Important Links

- Tailscale Admin: https://login.tailscale.com/admin/machines
- Cloudflare Dashboard: https://dash.cloudflare.com/
- Tunnel ID: `64fe03f2-9859-44ca-b0ab-e499d8464104`
- Domain: ratehunter.net

---

**Created by:** Claude Sonnet 4.5
**For:** Ellis - Project Nyra Deployment
**Next Environment:** WSL/Ubuntu on RTX 5090 Worker

---

## 📋 WSL AGENT HANDOFF PROMPT

Copy this prompt to start a new Claude Code session in WSL:

```
I'm continuing Project Nyra orchestrator deployment. Previous session completed tunnel config fixes on Windows.

COMPLETED FROM WINDOWS:
✅ Fixed orchestrator-essential.yml port conflicts (metrics: 9999, flow: 3003)
✅ Set Tailscale static IPs (100.64.0.1, 100.64.0.10, 100.64.0.11)
✅ Updated .env.template with static IPs
✅ Ran dos2unix on DEPLOY.sh
✅ Started DEPLOY.sh (status unknown)

CONFIGURATION:
- Tailscale IPs: Orchestrator=100.64.0.1, RTX5090=100.64.0.10, RTX3060=100.64.0.11
- Tunnel ID: 64fe03f2-9859-44ca-b0ab-e499d8464104
- Project location: ~/projects/project-nyra
- Reference docs: /mnt/c/Users/edane/OneDrive/LANShare/INFRASTRUCTURE_REFERENCE.md

IMMEDIATE ACTIONS NEEDED:
1. Check DEPLOY.sh status - are all services running?
2. Verify services are accessible on their ports (3001, 3002, 4000, 8000, 8080, etc.)
3. Check for any port conflicts or errors
4. Copy .env.template to .env and verify Tailscale IPs are correct
5. Review infra folder rebuild requirements

KEY FILES TO READ:
- /mnt/c/Users/edane/OneDrive/LANShare/SESSION_HANDOFF.md (full context)
- /mnt/c/Users/edane/OneDrive/LANShare/INFRASTRUCTURE_REFERENCE.md (port/config reference)
- ~/projects/project-nyra/DEPLOY.sh (deployment script)

CRITICAL RULES:
- All port assignments must match INFRASTRUCTURE_REFERENCE.md
- Only orchestrator needs Cloudflare tunnel (not workers)
- Workers communicate via Tailscale private network only
- Auth service uses port 8080 (not metrics)
- Claude Flow Dashboard uses port 3003 (not 3100)

Please check the deployment status and help complete the orchestrator setup.
```
