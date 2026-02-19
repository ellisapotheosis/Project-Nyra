# Project Nyra - Quick Start Guide

## What You've Done So Far

✅ Created 4 Cloudflared tunnels
✅ Created config files
✅ Fixed network connectivity (DHCP)

## What You Need To Do Now

### Step 1: Set Up DNS Routes (2 minutes)

Open PowerShell and run:

```powershell
C:\Users\edane\cloudflared-configs\setup-essential-dns.ps1
```

This configures 17 subdomains in Cloudflare DNS (11 for orchestrator + 6 for GPU workers).

**What it does:**
- Creates CNAME records pointing subdomains to your tunnels
- Completely safe to run - just creates DNS entries
- Can run multiple times without issues

---

### Step 2: Test the Tunnel Config (1 minute)

```powershell
cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-essential.yml run
```

**What you should see:**
```
2026-01-29 ... INF Starting tunnel tunnelID=64fe03f2-9859-44ca-b0ab-e499d8464104
2026-01-29 ... INF Connection registered connIndex=0
2026-01-29 ... INF Connection registered connIndex=1
2026-01-29 ... INF Connection registered connIndex=2
2026-01-29 ... INF Connection registered connIndex=3
```

**If you see errors:**
- Check credentials file exists: `dir C:\Users\edane\.cloudflared\64fe03f2-9859-44ca-b0ab-e499d8464104.json`
- Validate config: `cloudflared tunnel --config C:\Users\edane\cloudflared-configs\orchestrator-essential.yml ingress validate`

**If it works:**
- Press `Ctrl+C` to stop (we'll install as service next)

---

### Step 3: Install Tunnel as Windows Service

```powershell
# Install as service (must run as Administrator)
cloudflared service install C:\Users\edane\cloudflared-configs\orchestrator-essential.yml

# Start the service
cloudflared service start

# Check status
cloudflared service status
```

**What it does:**
- Runs tunnel automatically on boot
- Keeps tunnel running in background
- Auto-restarts if it crashes

---

### Step 4: Verify Subdomains Work (5 minutes)

Wait 1-5 minutes for DNS to propagate, then test:

```powershell
# Test DNS resolution
nslookup app.ratehunter.net
nslookup admin.ratehunter.net
nslookup nexus.ratehunter.net

# Test tunnel connectivity
curl https://app.ratehunter.net
```

**Expected result:**
- If service is running on that port: You'll see content or an error from the app
- If nothing is running on that port: `502 Bad Gateway` (this is NORMAL - you haven't deployed services yet!)

**502 Bad Gateway is GOOD at this stage** - it means:
✅ Cloudflare DNS is working
✅ Tunnel is working
✅ Cloudflared is routing traffic to localhost
❌ No service is running on that port yet

---

### Step 5: Start Deploying Services

Now you need to actually run the services on the ports.

**Priority 1 - Core Infrastructure:**
```bash
# From WSL
cd ~/projects/project-nyra/services/nexus-router
npm install
npm start  # Port 6000

# New terminal
cd ~/projects/project-nyra/services/nyra-orchestrator
npm install
npm start  # Port 8000
```

**Priority 2 - Frontend Apps:**
```bash
# Landing page
cd ~/projects/project-nyra/apps/landing/ratehunter-landing
npm install
npm run dev -- -p 3001

# Main webapp
cd ~/projects/project-nyra/apps/web/webapp
npm install
npm run dev -- -p 3002
```

**Priority 3 - AI Chat:**
```bash
# Dify (requires Docker)
cd ~/projects/project-nyra/services/dify
docker-compose up -d
```

**Test after each service starts:**
```powershell
# After Nexus starts (port 6000)
curl https://nexus.ratehunter.net/health

# After Landing starts (port 3001)
curl https://ratehunter.net
# Or open in browser: https://ratehunter.net

# After Webapp starts (port 3002)
curl https://app.ratehunter.net
# Or open in browser: https://app.ratehunter.net
```

---

## Common Issues

### "502 Bad Gateway" when accessing subdomain

**Cause:** Service not running on that port

**Fix:** Start the service
```bash
# Check what's running
netstat -ano | findstr "3001"

# Start the service
cd ~/projects/project-nyra/apps/landing/ratehunter-landing
npm run dev -- -p 3001
```

---

### "DNS address could not be found"

**Cause:** DNS not set up or not propagated

**Fix:**
```powershell
# Re-run DNS setup
C:\Users\edane\cloudflared-configs\setup-essential-dns.ps1

# Wait 5 minutes, then check
nslookup app.ratehunter.net
```

---

### "Tunnel not running"

**Fix:**
```powershell
# Check service status
cloudflared service status

# If stopped, start it
cloudflared service start

# If not installed, install it
cloudflared service install C:\Users\edane\cloudflared-configs\orchestrator-essential.yml
cloudflared service start
```

---

### Port conflict (port already in use)

**Fix:**
```powershell
# Find what's using the port
netstat -ano | findstr "3000"

# Kill it
taskkill /PID <process_id> /F

# Or change your service to use a different port
```

---

## What's Next?

After you have the tunnel running and services deploying, see:

📄 **PORT-MAPPING.md** - Which ports each service should use
📄 **project-nyra-implementation-plan.md** - Full deployment plan
📄 **SUBDOMAIN-DECISION-GUIDE.md** - Understanding what needs subdomains

---

## Summary of Files Created

All files are in: `C:\Users\edane\cloudflared-configs\`

**Essential scripts:**
- ✅ `setup-essential-dns.ps1` - Creates DNS routes (run this first)
- ✅ `orchestrator-essential.yml` - Tunnel config (use this for service)

**Reference docs:**
- 📄 `QUICK-START.md` - This file
- 📄 `PORT-MAPPING.md` - Port assignments
- 📄 `SUBDOMAIN-DECISION-GUIDE.md` - Why these 11 subdomains

**Complete versions (for later):**
- `setup-all-dns-routes.ps1` - All 37 subdomains
- `orchestrator-complete-config.yml` - All services
- `COMPLETE-SUBDOMAIN-PLAN.md` - Full architecture

---

## Your Essential 11 Subdomains

**Public (3):**
1. ratehunter.net → Landing page
2. app.ratehunter.net → Main webapp
3. chat.ratehunter.net → Dify AI chat

**Team Tools (5):**
4. admin.ratehunter.net → Admin panel (Archon OS)
5. crm.ratehunter.net → CRM
6. n8n.ratehunter.net → n8n workflows
7. flows.ratehunter.net → Activepieces workflows
8. grafana.ratehunter.net → Monitoring

**Backend (3):**
9. nexus.ratehunter.net → API gateway
10. orchestrator.ratehunter.net → Job orchestrator
11. ws.ratehunter.net → WebSockets

All other services run on localhost (no subdomain) and are accessed:
- Via Nexus Router (for APIs)
- Via Tailscale (for cross-machine communication)
- Via localhost (for same-machine communication)

---

**Ready to start? Run this command:**
```powershell
C:\Users\edane\cloudflared-configs\setup-essential-dns.ps1
```
