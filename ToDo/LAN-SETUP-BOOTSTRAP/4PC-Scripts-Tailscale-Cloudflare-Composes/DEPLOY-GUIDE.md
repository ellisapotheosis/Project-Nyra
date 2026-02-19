# Project Nyra - Deployment Guide

## Status: Ready to Deploy ✅

✅ DNS routes configured (8 subdomains)
✅ Cloudflared tunnel ready
✅ Deployment script created
✅ Tailscale configured (3 workers)

---

## Step 1: Start the Cloudflared Tunnel (Windows)

**Open PowerShell and run:**

```powershell
cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run
```

**Keep this window open** - the tunnel must stay running. You should see:

```
2026-02-01T... INF Starting tunnel tunnelID=64fe03f2-9859-44ca-b0ab-e499d8464104
2026-02-01T... INF Registered tunnel connection connIndex=0
2026-02-01T... INF Registered tunnel connection connIndex=1
2026-02-01T... INF Registered tunnel connection connIndex=2
2026-02-01T... INF Registered tunnel connection connIndex=3
```

---

## Step 2: Deploy All Services (Ubuntu WSL)

**Open Ubuntu WSL and run:**

```bash
cd ~/projects/project-nyra
chmod +x DEPLOY.sh
./DEPLOY.sh
```

This will automatically:
- Start 5 core services (landing, webapp, archon-os, nexus-router, orchestrator)
- Start 7 backend APIs (lead, quote, rate, document, campaign, auth, security)
- Start 2 workflow services (n8n, activepieces)
- Total: 14 services running

**Expected output:**

```
🚀 Project Nyra - Deployment Script
================================
📦 Starting: landing (port 3001)...
  ✅ Started in tmux session: nyra-landing
📦 Starting: webapp (port 3002)...
  ✅ Started in tmux session: nyra-webapp
[... more services ...]

✅ Deployment Complete!
```

---

## Step 3: Verify Services Are Running

**Check tmux sessions:**

```bash
tmux list-sessions

# Should show:
# nyra-landing: 1 windows (created Sat Feb  1 19:20)
# nyra-webapp: 1 windows (created Sat Feb  1 19:20)
# nyra-archon-os: 1 windows (created Sat Feb  1 19:20)
# ... etc
```

**Test a service:**

```bash
curl http://localhost:3001  # Landing page
curl http://localhost:3002  # Webapp
curl http://localhost:6000  # Nexus Router
```

---

## Step 4: Access via Subdomains (Windows)

Wait 1-2 minutes for DNS propagation, then open in browser:

### Public (No Auth)
- https://ratehunter.net → Landing page (port 3001)

### Public (Auth Required - Add Later)
- https://nyra.ratehunter.net → Broker portal (port 3002)
- https://admin.ratehunter.net → Admin dashboard (port 4000)

### Internal Team Tools
- https://crm.ratehunter.net → CRM (if running)
- https://n8n.ratehunter.net → n8n workflows (port 5678)
- https://flows.ratehunter.net → Activepieces (port 5000)
- https://grafana.ratehunter.net → Monitoring (if running)

---

## Managing Services

### View logs for a service:

```bash
tmux attach -t nyra-landing
# Press Ctrl+B then D to detach (don't kill it!)
```

### Stop a service:

```bash
tmux kill-session -t nyra-landing
```

### Stop all services:

```bash
tmux kill-server
```

### Restart a service:

```bash
# Stop
tmux kill-session -t nyra-landing

# Start manually
cd ~/projects/project-nyra/apps/landing/ratehunter-landing
npm run dev -- -p 3001
```

---

## Tailscale Configuration

Your workers can now reach the orchestrator:

```bash
# From RTX 5090 worker (100.102.204.112)
curl http://100.87.235.78:8000/health  # Reach orchestrator

# From orchestrator to send jobs
curl http://100.102.204.112:8000/api/job  # Send job to RTX 5090
```

Make sure these environment variables are set in the orchestrator:

```env
ORCHESTRATOR_IP=100.87.235.78
WORKER_RTX5090_IP=100.102.204.112
WORKER_RTX3060_IP=100.126.61.37
```

---

## Services Deployed

### Core Services (5)
| Service | Port | Subdomain | Purpose |
|---------|------|-----------|---------|
| Landing | 3001 | ratehunter.net | Public landing page |
| Webapp | 3002 | nyra.ratehunter.net | Broker portal |
| Archon OS | 4000 | admin.ratehunter.net | Admin dashboard |
| Nexus Router | 6000 | (internal) | API gateway |
| Orchestrator | 8000 | (Tailscale only) | Job coordinator |

### Backend APIs (7)
| Service | Port | Via |
|---------|------|-----|
| Lead Capture | 8010 | nexus.ratehunter.net/api/leads |
| Quote API | 8020 | nexus.ratehunter.net/api/quotes |
| Rate Comparison | 8030 | nexus.ratehunter.net/api/rates |
| Document API | 8040 | nexus.ratehunter.net/api/documents |
| Campaign Engine | 8050 | nexus.ratehunter.net/api/campaigns |
| Auth Service | 8080 | nexus.ratehunter.net/auth |
| Security Service | 8090 | (internal) |

### Workflow Services (2)
| Service | Port | Subdomain |
|---------|------|-----------|
| n8n | 5678 | n8n.ratehunter.net |
| Activepieces | 5000 | flows.ratehunter.net |

---

## Troubleshooting

### "Port already in use"
```bash
# Find what's using the port
lsof -i :3001

# Kill it
kill -9 <PID>
```

### "npm: command not found"
```bash
# Make sure you're using the right Node version
nvm use 18
# or
nvm use 20
```

### "ENOTFOUND ratehunter.net"
- DNS hasn't propagated yet (wait 1-5 minutes)
- Tunnel isn't running (check Step 1)
- Check: `nslookup ratehunter.net`

### "502 Bad Gateway"
- Service isn't running on that port
- Check: `tmux list-sessions`
- Check logs: `tmux attach -t nyra-SERVICE_NAME`

### Service crashes on startup
Check the tmux log:
```bash
tmux attach -t nyra-landing  # View the error
# Ctrl+B then D to exit
```

---

## Next Steps

1. ✅ Start tunnel (Step 1)
2. ✅ Deploy services (Step 2)
3. ✅ Verify they're running (Step 3)
4. ✅ Test subdomains (Step 4)
5. ⏳ **Add authentication** (when ready)
   - Use magic links (simplest)
   - Or username/password
6. ⏳ **Configure Nexus Router** API paths
   - Map /api/leads → port 8010
   - Map /api/quotes → port 8020
   - etc.

---

## Quick Commands Reference

```bash
# Deploy all services
~/projects/project-nyra/./DEPLOY.sh

# View all running services
tmux list-sessions

# View logs for a service
tmux attach -t nyra-SERVICE_NAME

# Stop a service
tmux kill-session -t nyra-SERVICE_NAME

# Stop all services
tmux kill-server

# Test API
curl http://localhost:6000/health
curl http://localhost:8000/health
```

---

**You're all set! Run Step 1 & 2 and you'll have everything up and running.** 🚀
