# Final Cloudflare Setup - Project Nyra
**Status:** Ready for Deployment
**Architecture:** 1 Orchestrator Tunnel Only (Workers = Internal Only)
**Date:** 2026-02-08

---

## ✅ Clean, Simple Architecture

```
INTERNET (Public)
    ↓
Cloudflare CDN + WAF
    ↓
1 TUNNEL: orchestrator-essential (ID: 64fe03f2-9859-44ca-b0ab-e499d8464104)
    ↓
Orchestrator PC (100.64.0.1) - Windows
    ├─ 37 Public Domains (ratehunter.net, app.ratehunter.net, etc.)
    └─ Cloudflare Access (Authentication layer)
         ↓
    Tailscale Private Network
         ↓
    GPU Workers (Internal Only - NO Tunnels)
         ├─ RTX 5090: 100.64.0.10 (vLLM)
         ├─ RTX 3060: 100.64.0.11 (Ollama)
         └─ RTX 3090Ti: 100.64.0.12 (Ollama)
```

---

## 📊 Cloudflare Apps - What to Keep/Delete

### Keep (Self-Hosted):
| App Name | Domain | Purpose | Keep? |
|----------|--------|---------|-------|
| project-nyra | nyra.ratehunter.net | Broker Portal | ✅ KEEP |
| TwentyCRM | crm.ratehunter.net | CRM | ✅ KEEP |
| Automation Webapp | flow.ratehunter.net | Claude Flow | ✅ KEEP |

### Delete (Not Needed):
| App Name | Type | Reason |
|----------|------|--------|
| nyra-worker | Cloudflare Workers | Not needed - you have orchestrator |
| SSO App (DASH SSO) | Testing | Delete (or keep if doing more testing) |
| Github (SAAS) | Testing | Delete (or keep if doing more testing) |
| Any worker tunnel apps | Worker PC tunnels | DELETE - use Tailscale instead |

---

## 🎯 Clean Up Actions (Do These Now)

### Step 1: Delete Worker Tunnels from Cloudflare

**In Cloudflare Dashboard:**
1. Go to: https://dash.cloudflare.com/
2. Click: Networks → Tunnels
3. Find and DELETE:
   - `worker-m15r7` (RTX 3060 - 3280936b-7bbd-40ed-a6fc-02c42d6a11f0)
   - `worker-rtx5090` (RTX 5090 - efbf6950-9c82-49d0-aaf6-9c0421e1b424)
   - `worker-rtx3090ti` (RTX 3090Ti - 97279b58-b066-434c-a447-3e8fc7e0abb5)

**Keep:**
- ✅ `orchestrator-essential` (64fe03f2-9859-44ca-b0ab-e499d8464104)

### Step 2: Delete Unnecessary Access Apps

**In Cloudflare Zero Trust:**
1. Go to: https://one.dash.cloudflare.com/
2. Click: Access → Applications
3. DELETE:
   - `nyra-worker` (Cloudflare Workers app)
   - `DASH SSO` (testing)
   - `SAAS` (Github testing)

**Keep Self-Hosted Apps:**
- ✅ `project-nyra` (nyra.ratehunter.net)
- ✅ `TwentyCRM` (crm.ratehunter.net)
- ✅ `Automation Webapp` (flow.ratehunter.net)

### Step 3: Create Additional Access Apps

You need to create apps for the OTHER 34 domains that don't have Access apps yet.

**Follow:** CLOUDFLARE_ACCESS_QUICK_SETUP.md

Create apps for:
- admin.ratehunter.net (Admin Dashboard)
- orchestrator.ratehunter.net (Orchestrator)
- nexus.ratehunter.net (API Gateway)
- grafana.ratehunter.net (Monitoring)
- secrets.ratehunter.net (Infisical)
- graph.ratehunter.net (Graph DB)
- vector.ratehunter.net (Vector DB)
- agentdb.ratehunter.net (AgentDB)
- chat.ratehunter.net (Dify)
- n8n.ratehunter.net (n8n)
- flows.ratehunter.net (Activepieces)
- api.ratehunter.net (API Gateway)
- auth.ratehunter.net (Auth Admin)
- metrics.ratehunter.net (Prometheus)
- logs.ratehunter.net (Loki/Grafana)
- files.ratehunter.net (File Storage)
- + 21 others (leads, quotes, rates, docs, campaigns, memory, letta, llm, etc.)

**Or batch import them later when you need them.**

---

## 🚀 Final Configuration

### Tunnel Details:
```yaml
Tunnel ID: 64fe03f2-9859-44ca-b0ab-e499d8464104
Name: orchestrator-essential
Running On: Windows PC (Docker)
Config: C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml
Status: ✅ ACTIVE
```

### All DNS Routes (37 total):
Already configured via: `setup-all-dns-routes.ps1`

Verify with:
```bash
cloudflared tunnel route dns list
```

### Access Control:
- Public (no auth): ratehunter.net, nyra.ratehunter.net
- Team (Access required): 25+ domains
- Admin (Restricted): 3-5 domains

---

## 📋 Why This Setup is Best for You

### ✅ Benefits:
1. **Simple** - 1 tunnel instead of 4
2. **Secure** - GPU workers are internal only
3. **Cost-effective** - No Cloudflare Workers charges
4. **Performant** - Tailscale handles internal communication (low latency)
5. **Scalable** - Easy to add more workers without tunnel complexity
6. **Maintainable** - Single control plane (orchestrator)

### ❌ Why Not Cloudflare Workers:
1. You already have an orchestrator handling logic
2. Workers would be redundant
3. Higher latency for GPU operations (workers in US, your GPUs local)
4. Adds cost ($0.50/million requests)
5. Overkill for your architecture

### ❌ Why Not Expose Workers:
1. GPU APIs should be private (security risk)
2. Unnecessary - orchestrator is the gateway
3. Adds complexity with Access policies
4. No performance benefit
5. Increases attack surface

---

## 🔐 Recommended Access Policy Structure

### Policy 1: Public (No Auth)
```
Domains: ratehunter.net, nyra.ratehunter.net
Action: Allow (bypass)
Reason: Marketing site + Broker portal (has own auth)
```

### Policy 2: Team Access
```
Domains: Most services (admin, crm, flow, orchestrator, nexus, grafana, etc.)
Action: Allow
Include: Email domain @ratehunter.net
Session: 24 hours
Auth: Google OAuth
```

### Policy 3: Admin Only
```
Domains: secrets.ratehunter.net, agentdb.ratehunter.net, auth.ratehunter.net
Action: Allow
Include: ellis@ratehunter.net (only you)
Session: 12 hours
Auth: Google OAuth
```

---

## 🌐 DNS Routes Summary

### Public Websites (2):
- ratehunter.net (Landing)
- nyra.ratehunter.net (Broker Portal)

### Core Services (5):
- admin.ratehunter.net (Archon OS)
- orchestrator.ratehunter.net (Orchestrator)
- nexus.ratehunter.net (API Gateway)
- crm.ratehunter.net (TwentyCRM)
- chat.ratehunter.net (Dify)

### Workflows (2):
- n8n.ratehunter.net (n8n)
- flows.ratehunter.net (Activepieces)

### Monitoring (3):
- grafana.ratehunter.net (Grafana)
- metrics.ratehunter.net (Prometheus)
- logs.ratehunter.net (Loki)

### Secrets & Data (5):
- secrets.ratehunter.net (Infisical)
- graph.ratehunter.net (FalkorDB)
- vector.ratehunter.net (RuVector)
- agentdb.ratehunter.net (AgentDB)
- auth.ratehunter.net (Auth Admin)

### Business Logic (5):
- leads.ratehunter.net (Lead API)
- quotes.ratehunter.net (Quote API)
- rates.ratehunter.net (Rate API)
- docs.ratehunter.net (Document API)
- campaigns.ratehunter.net (Campaign Engine)

### AI/Memory (4):
- memory.ratehunter.net (Memory)
- letta.ratehunter.net (Letta)
- llm.ratehunter.net (LLM Proxy)
- assistant.ratehunter.net (Assistant)

### Utilities (6+):
- api.ratehunter.net (API Docs)
- ws.ratehunter.net (WebSocket)
- files.ratehunter.net (File Storage)
- hooks.ratehunter.net (Webhooks)
- app.ratehunter.net (App Server)
- composio.ratehunter.net (Composio)
- portal.ratehunter.net (Portal)

**Total: 37 domains all routing through 1 tunnel**

---

## ✅ Next Steps (Simple Checklist)

### RIGHT NOW:
- [ ] Delete 3 worker tunnels from Cloudflare
- [ ] Delete `nyra-worker` app
- [ ] Delete testing apps (DASH SSO, Github) - optional
- [ ] Verify orchestrator tunnel is still online

### THEN:
- [ ] Create Access apps for remaining 34 domains
- [ ] Configure 3 access policies (Public, Team, Admin)
- [ ] Test authentication on protected domains
- [ ] Switch to WSL for worker deployment

### INFRASTRUCTURE:
- [ ] Workers use Tailscale IPs only (100.64.0.10, .11, .12)
- [ ] No tunnels needed for workers
- [ ] Orchestrator is single gateway

---

## 🎯 Final Architecture Summary

```
BEFORE (Complex, Unnecessary):
├─ Orchestrator Tunnel (1)
├─ Worker RTX 5090 Tunnel (1)
├─ Worker RTX 3060 Tunnel (1)
├─ Worker RTX 3090Ti Tunnel (1)
└─ Cloudflare Workers app (1)
= 5 tunnels + serverless (overcomplicated)

AFTER (Clean, Simple):
├─ Orchestrator Tunnel (1)
├─ Workers: Tailscale only (100.64.0.x)
└─ Access: 3 policies (Public, Team, Admin)
= 1 tunnel + internal communication (perfect)
```

---

## 📞 Support Commands

### Check Tunnel Status:
```bash
cloudflared tunnel info orchestrator-essential
```

### List DNS Routes:
```bash
cloudflared tunnel route dns list
```

### Test Public URL:
```bash
curl https://ratehunter.net
curl https://admin.ratehunter.net  # Should redirect to login
```

### Verify Docker:
```bash
docker ps | grep cloudflared
docker logs cloudflared-tunnel
```

---

**This is your final, clean setup.**
**1 Tunnel. 37 Domains. Workers internal-only. Perfect for your use case.**

Delete the extra tunnels/apps and you're done! 🎉
