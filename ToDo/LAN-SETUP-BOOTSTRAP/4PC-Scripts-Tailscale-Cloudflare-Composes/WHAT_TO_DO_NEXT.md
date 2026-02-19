# What To Do Next - Complete Action Plan
**Status:** 95% Complete - Only Web UI work left
**Time Required:** 15-30 minutes
**Next Owner:** You (web UI), then WSL agent

---

## ✅ Already Completed

### Windows Side (All Done):
- ✅ Tunnel running in Docker (metrics: 9999)
- ✅ DNS records created (PowerShell script ran)
- ✅ All domains added to tunnel config
- ✅ hooks.ratehunter.net added
- ✅ app.ratehunter.net added
- ✅ Tailscale static IPs configured (100.64.0.x)
- ✅ All reference docs created

### Ubuntu/Workers:
- ✅ Tailscale IPs assigned (100.64.0.10, .11, .12)
- ✅ DEPLOY.sh running (services online)
- ✅ .env files created for each machine

---

## 🎯 WHAT YOU NEED TO DO NOW

### ONLY 1 THING: Create Cloudflare Access Apps (15 minutes)

**Go to:** https://one.dash.cloudflare.com/

**Click:** Access → Applications → Add Application

**Follow:** CLOUDFLARE_ACCESS_QUICK_SETUP.md (in LANShare folder)

**Create these 13 apps** (one at a time, takes ~1 min each):

1. secrets.ratehunter.net (Admin only)
2. grafana.ratehunter.net (Team)
3. flow.ratehunter.net (Team)
4. orchestrator.ratehunter.net (Team)
5. nexus.ratehunter.net (Team)
6. n8n.ratehunter.net (Team)
7. flows.ratehunter.net (Team)
8. hooks.ratehunter.net (Team)
9. chat.ratehunter.net (Team)
10. api.ratehunter.net (Team)
11. metrics.ratehunter.net (Team)
12. logs.ratehunter.net (Team)
13. files.ratehunter.net (Team)

**Each app takes 2 minutes:**
- Click "Add Application"
- Fill in domain name
- Add policy (Team: @ratehunter.net, Admin: just you)
- Save

**That's literally it.**

---

## 📊 Current State

### Tunnel:
```
Status: ✅ RUNNING
Domains: 25+
DNS Records: Created ✅
Access Control: Needs manual setup (15 min)
```

### Services:
```
Orchestrator (100.64.0.1):
  - Landing: http://localhost:3001
  - Webapp: http://localhost:3002
  - Admin: http://localhost:4000
  - All others: running

RTX 5090 (100.64.0.10):
  - vLLM: http://100.64.0.10:8000
  - Services: running

RTX 3060 (100.64.0.11):
  - Ollama: http://100.64.0.11:11434
  - Ready for deployment

RTX 3090 (100.64.0.12):
  - Ollama: http://100.64.0.12:11434
  - Ready for deployment
```

### Access Control:
```
Status: ⚠️ NOT CONFIGURED
What's needed: Cloudflare Access apps (web UI only)
Time: 15 minutes
```

---

## 🚀 Verify Everything is Working

**Before doing Cloudflare Access setup, test:**

```powershell
# Test tunnel is running
curl https://ratehunter.net
# Should show landing page

# Test public URL
curl https://nyra.ratehunter.net
# Should show broker portal

# Test DNS records
nslookup admin.ratehunter.net
# Should resolve to Cloudflare

# Test metrics
curl http://localhost:9999/metrics
# Should show Prometheus metrics
```

**If all above work, you're good!**

---

## 📋 Then Tell WSL Agent

After you finish the Cloudflare Access setup, switch to WSL and give the agent this prompt:

```
Continuing Project Nyra orchestrator deployment.

COMPLETED FROM WINDOWS:
✅ Tunnel running (Docker - metrics port 9999)
✅ All DNS records created (25+ domains)
✅ hooks.ratehunter.net added
✅ app.ratehunter.net added
✅ Cloudflare Access apps created (13 services)
✅ Tailscale static IPs configured

NEXT ACTIONS:
1. Check DEPLOY.sh status - are services running?
2. Verify Ubuntu (RTX 5090) has .env configured
3. Deploy RTX 3060 and RTX 3090 workers with Ollama
4. Test end-to-end connectivity
5. Consolidate infra folder as per INFRA_CONSOLIDATION_GUIDE.md

KEY FILES:
- INFRA_CONSOLIDATION_GUIDE.md (complete reference)
- INFRASTRUCTURE_REFERENCE.md (port mapping)
- WORKER_PC_SETUP.md (how to set up workers)
- DOCKER_CLOUDFLARED_SETUP.md (docker verification)
```

---

## 🔍 Quick Reference: Where Everything Is

### Files on Windows:
```
C:\Users\edane\OneDrive\LANShare\

SETUP GUIDES:
├─ CLOUDFLARE_ACCESS_QUICK_SETUP.md    ← Do this next (15 min)
├─ DOCKER_CLOUDFLARED_SETUP.md         ← Verify your Docker is correct
├─ WORKER_PC_SETUP.md                  ← For RTX workers
├─ INFRA_CONSOLIDATION_GUIDE.md        ← Reference for Ubuntu work
├─ INFRASTRUCTURE_REFERENCE.md         ← Port/service mapping

CONFIGURATION FILES:
├─ cloudflared-configs\
│  ├─ orchestrator-essential.yml       ← Active config (has all domains)
│  └─ orchestrator-essential-with-all-domains.yml
├─ .env.orchestrator                   ← Your PC config
├─ .env.worker-rtx5090                 ← Ubuntu config
├─ .env.worker-rtx3060                 ← RTX 3060 config
├─ .env.worker-rtx3090                 ← RTX 3090 config
├─ .env.master-infisical               ← For Infisical import

SCRIPTS:
└─ setup-all-domains.ps1               ← Already ran (created DNS)
```

### Services Running:
```
Orchestrator PC (Windows):
  - Docker: cloudflared-tunnel ✅
  - Services: 14 npm services (via DEPLOY.sh)

RTX 5090 (Ubuntu):
  - DEPLOY.sh: Running ✅
  - Services: All microservices
  - GPU: vLLM (port 8000)

RTX 3060:
  - Ollama: Ready to deploy
  - GPU: 6GB VRAM

RTX 3090:
  - Ollama: Ready to deploy
  - GPU: 24GB VRAM
```

---

## ❓ Answers to Your Questions

### Q: What do I do on other PCs?
**A:**
- RTX 5090: Already running DEPLOY.sh ✅
- RTX 3060: Copy .env file + docker compose up for Ollama
- RTX 3090: Copy .env file + docker compose up for Ollama
- **NO tunnels needed** (use Tailscale IPs instead)

### Q: Do I run tunnel connect on workers?
**A: NO.** Workers don't need `tunnel connect` or any tunnel.
- Orchestrator has 1 tunnel (Cloudflare)
- Workers use Tailscale IPs only (100.64.0.10, .11, .12)

### Q: Should I use web UI for orchestrator and CLI for workers?
**A:**
- Orchestrator: Docker (what you have) ✅
- Workers: No tunnels needed (just Tailscale + services)
- Web UI: Only for Cloudflare Access (not tunnel setup)

### Q: Is Docker cloudflared setup correct?
**A:** Check DOCKER_CLOUDFLARED_SETUP.md - run the verification checklist

---

## 📈 Your Architecture (Complete)

```
                    INTERNET
                       ↓
                 Cloudflare CDN
                       ↓
        Cloudflare Tunnel (Orchestrator Only)
                       ↓
    Orchestrator PC (Windows, 100.64.0.1)
    ├─ Docker: cloudflared-tunnel ✅
    ├─ Services: 14 npm services ✅
    ├─ Tunnel Config: All 25+ domains ✅
    └─ DNS Routes: Created ✅
                       ↓
              Tailscale Private Network
                       ↓
    ┌──────────────┬──────────────┬──────────────┐
    │              │              │              │
RTX 5090 (100.64.0.10)    RTX 3060 (100.64.0.11)    RTX 3090 (100.64.0.12)
├─ vLLM: 8000             ├─ Ollama: 11434          ├─ Ollama: 11434
├─ Services: 8010-8050    └─ Models: 3B, 7B         └─ Models: 34B, 70B
└─ Tailscale ✅                │ Tailscale ✅            │ Tailscale ✅
                               └─ Deploying              └─ Deploying
```

---

## ✅ Final Checklist

- [ ] Test tunnel: `curl https://ratehunter.net` ✅
- [ ] Verify Docker: `docker ps | grep cloudflared` ✅
- [ ] Check Tailscale: `tailscale status` (4 machines connected) ✅
- [ ] Create Cloudflare Access apps (13 of them) ⏳ DO THIS NEXT
- [ ] Test with login: Visit crm.ratehunter.net (should ask for auth)

---

## 🎓 Key Points to Remember

1. **One tunnel = orchestrator only**
   - Workers don't need tunnels
   - Workers use Tailscale IPs

2. **One app per domain in Cloudflare Access**
   - Each domain gets its own app
   - Different apps = different policies

3. **Ports don't conflict**
   - 8080 = Auth Service (NOT metrics)
   - 9999 = Cloudflared Metrics
   - 3003 = Claude Flow Dashboard (NOT 3100)

4. **Tailscale IPs are stable**
   - 100.64.0.1 = Orchestrator
   - 100.64.0.10 = RTX 5090
   - 100.64.0.11 = RTX 3060
   - 100.64.0.12 = RTX 3090

---

## 🎯 Next 30 Minutes

1. **Read:** CLOUDFLARE_ACCESS_QUICK_SETUP.md (5 min read)
2. **Do:** Create 13 Cloudflare Access apps (15 min work)
3. **Test:** Visit a protected domain - should ask for login (5 min)
4. **Switch:** Go to WSL, hand off to agent with prompt above

**Total: 30 minutes, then you're done!**

---

**You're 95% done. Just the web UI work left.** 🎉
