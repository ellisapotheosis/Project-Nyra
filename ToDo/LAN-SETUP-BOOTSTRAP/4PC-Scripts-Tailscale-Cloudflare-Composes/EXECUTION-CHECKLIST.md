# Project Nyra - Execution Checklist

## Phase 1: Cloudflared Tunnel Setup (30 minutes)

**Goal:** Get the tunnel running and DNS routes configured

### ✅ Step 1: Run DNS Setup Script
```powershell
# From PowerShell (as Administrator)
C:\Users\edane\cloudflared-configs\setup-essential-dns.ps1
```

**What to expect:**
```
========================================
  Project Nyra - Essential DNS Setup
========================================

[1/4] Setting up public websites...
  ✓ Public websites configured

[2/4] Setting up team tools...
  ✓ Team tools configured

[3/4] Setting up backend services...
  ✓ Backend services configured

[4/4] Setting up GPU workers...
  ✓ GPU workers configured

========================================
  DNS Setup Complete!
========================================
Subdomains configured: 17 total
  • 11 orchestrator services
  • 6 GPU worker endpoints

Verify with:
  cloudflared tunnel route dns list

Next step: Start the orchestrator tunnel
  cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-essential.yml run
```

**If errors occur:** Check `QUICK-START.md` troubleshooting section

### ✅ Step 2: Verify DNS Routes

```powershell
# List configured routes
cloudflared tunnel route dns list

# Should show all 17 routes pointing to the tunnel
# Example output:
# ratehunter.net              -> 64fe03f2-9859-44ca-b0ab-e499d8464104.cfargotunnel.com
# app.ratehunter.net          -> 64fe03f2-9859-44ca-b0ab-e499d8464104.cfargotunnel.com
# chat.ratehunter.net         -> 64fe03f2-9859-44ca-b0ab-e499d8464104.cfargotunnel.com
# ... (14 more)
```

### ✅ Step 3: Test Tunnel Manually

```powershell
# Start tunnel manually (for testing)
cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-essential.yml run

# Output should show:
# 2026-01-29 ... INF Starting tunnel tunnelID=64fe03f2-9859-44ca-b0ab-e499d8464104
# 2026-01-29 ... INF Connection registered connIndex=0
# 2026-01-29 ... INF Connection registered connIndex=1
# 2026-01-29 ... INF Connection registered connIndex=2
# 2026-01-29 ... INF Connection registered connIndex=3

# Press Ctrl+C when done testing
```

### ✅ Step 4: Install Tunnel as Service (Windows auto-start)

```powershell
# Install as service
cloudflared service install C:\Users\edane\cloudflared-configs\orchestrator-essential.yml

# Start the service
cloudflared service start

# Verify it's running
cloudflared service status
# Should show: running
```

**Result:** Tunnel now starts automatically when you boot your PC

---

## Phase 2: Test Cloudflare Routes (15 minutes)

**Goal:** Confirm DNS and tunnel are working (services don't need to be running yet)

### ✅ Step 1: Wait for DNS Propagation

DNS takes 1-5 minutes to propagate. While waiting, proceed to Phase 3.

### ✅ Step 2: Test DNS Resolution

```powershell
# Test that domain resolves
nslookup app.ratehunter.net
nslookup nexus.ratehunter.net
nslookup admin.ratehunter.net

# Should show: cloudflare.com nameserver (if using Cloudflare)
```

### ✅ Step 3: Test Tunnel Connectivity

```powershell
# This will return 502 Bad Gateway if no service is running (NORMAL at this stage)
curl https://app.ratehunter.net
curl https://nexus.ratehunter.net

# Expected output:
# <html><body><h1>502 Bad Gateway</h1></body></html>

# 502 = GOOD (tunnel working, no service on that port yet)
# Network error = BAD (tunnel not running or DNS not resolved)
```

---

## Phase 3: Tailscale Setup (20 minutes)

**Goal:** Connect all machines (orchestrator + GPU workers)

### ✅ Step 1: Install Tailscale on Orchestrator

1. Download: https://tailscale.com/download
2. Run installer (Windows)
3. Click "Connect" button in system tray
4. Authorize at https://login.tailscale.com/admin

### ✅ Step 2: Check Orchestrator's Tailscale IP

```powershell
tailscale ip -4

# Output: 100.126.61.37 (example - yours will be different)
# **Write this down!**
```

### ✅ Step 3: Install Tailscale on Each GPU Worker

**For each worker PC (RTX 5090, RTX 3090 Ti, M15R7):**

1. Download Tailscale
2. Run installer
3. Click "Connect"
4. Authorize at https://login.tailscale.com/admin
5. Record the IP: `tailscale ip -4`

**Example IPs to record:**
```
Orchestrator:     100.126.61.37
Worker RTX 5090:  100.126.92.44
Worker RTX 3090:  100.126.50.22
Worker M15R7:     100.126.71.15
```

### ✅ Step 4: Test Connectivity

```powershell
# On orchestrator, test ping to a worker
ping 100.126.92.44

# Should respond with ping times
# Reply from 100.126.92.44: bytes=32 time=5ms TTL=64
```

### ✅ Step 5: View All Connected Machines

```powershell
tailscale status

# Should show something like:
# 100.126.61.37    orchestrator-mini    edane@
# 100.126.92.44    worker-rtx5090       edane@
# 100.126.50.22    worker-rtx3090ti     edane@
# 100.126.71.15    worker-m15r7         edane@
```

**Result:** All machines can communicate via Tailscale IPs

---

## Phase 4: Deploy Core Services (Start in this order)

**Goal:** Get services running on the correct ports

### ✅ Service 1: Nexus Router (API Gateway) - Port 6000

```bash
# WSL terminal
cd ~/projects/project-nyra/services/nexus-router
npm install
npm start

# Should output: Server running on port 6000
# Test with: curl https://nexus.ratehunter.net/health
```

### ✅ Service 2: Orchestrator - Port 8000

```bash
# New WSL terminal
cd ~/projects/project-nyra/services/nyra-orchestrator
npm install
npm start

# Should output: Server running on port 8000
# Test with: curl https://orchestrator.ratehunter.net/health
```

### ✅ Service 3: Landing Page - Port 3001

```bash
# New WSL terminal
cd ~/projects/project-nyra/apps/landing/ratehunter-landing
npm install
npm run dev -- -p 3001

# Should output: ▲ Local:   http://localhost:3001
# Test with: https://ratehunter.net
```

### ✅ Service 4: Main Webapp - Port 3002

```bash
# New WSL terminal
cd ~/projects/project-nyra/apps/web/webapp
npm install
npm run dev -- -p 3002

# Should output: ▲ Local:   http://localhost:3002
# Test with: https://app.ratehunter.net
```

**At this point, you should be able to access:**
- https://ratehunter.net (landing page)
- https://app.ratehunter.net (main app)
- https://nexus.ratehunter.net (API gateway)

---

## Phase 5: Deploy Docker Services (Optional - if using)

**These are nice to have but not blocking**

### If Using Dify (AI Chat)

```bash
cd ~/projects/project-nyra/services/dify
docker-compose up -d

# Should expose http://localhost:3333
# Access at: https://chat.ratehunter.net
```

### If Using Twenty CRM

```bash
cd ~/projects/project-nyra/services/twentycrm-integration
docker-compose up -d

# Should expose http://localhost:3020
# Access at: https://crm.ratehunter.net
```

### If Using n8n (Workflows)

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n

# Access at: https://n8n.ratehunter.net
```

### If Using Grafana (Monitoring)

```bash
docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana

# Access at: https://grafana.ratehunter.net
```

---

## Phase 6: Configure Worker Connectivity

**Goal:** Let orchestrator communicate with GPU workers via Tailscale

### ✅ Step 1: Update Orchestrator Config

**File: `~/projects/project-nyra/services/nyra-orchestrator/.env.local`**

```env
# Worker IPs (from your Tailscale status)
WORKER_RTX5090_IP=100.126.92.44
WORKER_RTX3090TI_IP=100.126.50.22
WORKER_M15R7_IP=100.126.71.15

# Orchestrator's own Tailscale IP (for workers to report back)
ORCHESTRATOR_TAILSCALE_IP=100.126.61.37
```

### ✅ Step 2: Test Orchestrator → Worker Communication

```bash
# On orchestrator, test reaching a worker service
curl http://100.126.92.44:8000/health

# Should NOT return 502 (that means service is running)
# Should return JSON health response or "Connection refused" (service not running)
```

### ✅ Step 3: Start Worker Services

**On each GPU worker machine:**

```bash
# Worker RTX 5090
cd ~/projects/project-nyra/services/worker-agent
npm install
npm start  # Should run on port 8000

# Similar for other workers
```

### ✅ Step 4: Test Job Dispatch

```bash
# From orchestrator, send a test job to worker
curl -X POST http://100.126.92.44:8000/api/job \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "data": {}}'

# Should return job ID or acknowledgment
```

---

## Verification Checklist

### DNS & Tunnel ✅
- [ ] `cloudflared service status` shows "running"
- [ ] `cloudflared tunnel route dns list` shows 17 routes
- [ ] `nslookup app.ratehunter.net` resolves
- [ ] `curl https://app.ratehunter.net` returns 502 (tunnel working)

### Services Running ✅
- [ ] Nexus Router running on port 6000
- [ ] Orchestrator running on port 8000
- [ ] Landing page running on port 3001
- [ ] Webapp running on port 3002

### Cloudflare Access ✅
- [ ] https://ratehunter.net loads landing page
- [ ] https://app.ratehunter.net loads webapp
- [ ] https://nexus.ratehunter.net returns API response

### Tailscale ✅
- [ ] All machines showing in `tailscale status`
- [ ] `ping 100.126.92.44` (or worker IP) succeeds
- [ ] Orchestrator can reach worker: `curl http://100.126.92.44:8000/health`

### Optional Services ✅
- [ ] Dify running (if deployed)
- [ ] CRM running (if deployed)
- [ ] n8n running (if deployed)
- [ ] Grafana running (if deployed)

---

## Troubleshooting Quick Reference

**"502 Bad Gateway" on subdomain**
- Service not running on that port
- Check: `netstat -ano | findstr "6000"`
- Fix: Start the service

**"Connection refused" on subdomain**
- Tunnel not running
- Check: `cloudflared service status`
- Fix: `cloudflared service start`

**DNS won't resolve**
- Wait 1-5 minutes for propagation
- Check: `nslookup app.ratehunter.net`
- Fix: Re-run `setup-essential-dns.ps1`

**Tailscale "host unreachable"**
- Machine not connected to Tailscale
- Check: `tailscale status`
- Fix: `tailscale up` on that machine

**Worker can't reach orchestrator**
- Orchestrator service not running
- Wrong IP in config
- Check: `curl http://100.126.61.37:8000/health`
- Fix: Update .env.local with correct IP

---

## Files & Documentation

📍 **Location:** `C:\Users\edane\cloudflared-configs\`

- ✅ **QUICK-START.md** - High-level overview
- ✅ **EXECUTION-CHECKLIST.md** - This file (detailed steps)
- ✅ **PORT-MAPPING.md** - Which ports each service uses
- ✅ **TAILSCALE-SETUP.md** - Tailscale configuration guide
- ✅ **orchestrator-essential.yml** - Cloudflared tunnel config (already set up)
- ✅ **setup-essential-dns.ps1** - DNS setup script (ready to run)

---

## Time Estimates (for planning)

| Phase | Time | Notes |
|-------|------|-------|
| Phase 1: Cloudflared | 5 min | Run script once, tunnel auto-starts |
| Phase 2: Test DNS | 10 min | Wait for DNS, run a few commands |
| Phase 3: Tailscale | 20 min | Install on 4 machines, record IPs |
| Phase 4: Core Services | 15-30 min | npm install + npm start for 4 services |
| Phase 5: Docker Services | 10-30 min | If using Dify, CRM, etc. (optional) |
| Phase 6: Worker Config | 10 min | Update .env, test connectivity |
| **TOTAL** | **60-90 min** | From zero to fully operational |

---

## Next Steps After This Setup

Once you have everything running:

1. **Configure API paths** in Nexus Router (lead-capture, quote-api, etc.)
2. **Set up monitoring** - Grafana dashboards for system health
3. **Configure workflows** - n8n/Activepieces for automation
4. **Test end-to-end** - Customer → App → Nexus → Services

See `project-nyra-implementation-plan.md` for full roadmap.

---

## Getting Help

**Cloudflare issues:**
- Check: https://dash.cloudflare.com/
- Docs: https://developers.cloudflare.com/cloudflare-one/

**Tailscale issues:**
- Check: https://login.tailscale.com/admin
- Docs: https://tailscale.com/docs/

**Project Nyra issues:**
- See troubleshooting sections in QUICK-START.md and PORT-MAPPING.md
