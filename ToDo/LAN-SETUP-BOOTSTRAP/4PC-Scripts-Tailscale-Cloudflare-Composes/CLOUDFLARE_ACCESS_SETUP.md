# Cloudflare Access Setup Guide
**Purpose:** Use custom domains for internal services without making them public
**Method:** Cloudflare Zero Trust Access Policies

---

## 🎯 What This Achieves

You get pretty URLs for all services:
- ✅ `crm.ratehunter.net` → TwentyCRM (auth required)
- ✅ `admin.ratehunter.net` → Archon OS (auth required)
- ✅ `grafana.ratehunter.net` → Grafana (auth required)
- ✅ `secrets.ratehunter.net` → Infisical (auth required)

But they're NOT public - visitors must authenticate first.

---

## 📋 Service Categorization

### Public (No Auth Required)
```
ratehunter.net              → Landing page
nyra.ratehunter.net         → Broker portal (has own auth)
```

### Team-Only (Require Cloudflare Access)
```
admin.ratehunter.net        → Archon OS
crm.ratehunter.net          → Twenty CRM
nexus.ratehunter.net        → API Gateway (admin view)
orchestrator.ratehunter.net → Orchestrator dashboard
flow.ratehunter.net         → Claude Flow
secrets.ratehunter.net      → Infisical
graph.ratehunter.net        → Graphiti/FalkorDB
vector.ratehunter.net       → RuVector
agentdb.ratehunter.net      → AgentDB
grafana.ratehunter.net      → Monitoring
chat.ratehunter.net         → Dify UI
```

### Internal-Only (Tailscale Access)
```
worker-5090.ratehunter.net  → RTX 5090 worker
worker-3060.ratehunter.net  → RTX 3060 worker
worker-3090.ratehunter.net  → RTX 3090 worker
api.ratehunter.net          → Internal APIs
metrics.ratehunter.net      → Prometheus
db.ratehunter.net           → PostgreSQL admin
```

---

## 🚀 Step 1: Add Services to Tunnel Config

Update `orchestrator-essential.yml`:

```yaml
tunnel: 64fe03f2-9859-44ca-b0ab-e499d8464104
credentials-file: C:\Users\edane\.cloudflared\64fe03f2-9859-44ca-b0ab-e499d8464104.json

ingress:
  # ========================================
  # PUBLIC SERVICES (No auth)
  # ========================================

  - hostname: ratehunter.net
    service: http://localhost:3001
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Broker portal (has its own auth system)
  - hostname: nyra.ratehunter.net
    service: http://localhost:3002
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # ========================================
  # TEAM-ONLY SERVICES (Cloudflare Access)
  # ========================================

  # Admin Dashboard
  - hostname: admin.ratehunter.net
    service: http://localhost:4000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # CRM
  - hostname: crm.ratehunter.net
    service: http://localhost:3020
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Claude Flow Dashboard
  - hostname: flow.ratehunter.net
    service: http://localhost:3003
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Dify Chat UI
  - hostname: chat.ratehunter.net
    service: http://localhost:3001
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Infisical Secrets Manager
  - hostname: secrets.ratehunter.net
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Graphiti/FalkorDB
  - hostname: graph.ratehunter.net
    service: http://localhost:6379
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # RuVector
  - hostname: vector.ratehunter.net
    service: http://localhost:6333
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # AgentDB
  - hostname: agentdb.ratehunter.net
    service: http://localhost:5432
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Grafana Monitoring
  - hostname: grafana.ratehunter.net
    service: http://localhost:3000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Workflow Automation
  - hostname: n8n.ratehunter.net
    service: http://localhost:5678
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  - hostname: flows.ratehunter.net
    service: http://localhost:5000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # API Gateway (admin view)
  - hostname: nexus.ratehunter.net
    service: http://localhost:6000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Orchestrator Dashboard
  - hostname: orchestrator.ratehunter.net
    service: http://localhost:8000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # ========================================
  # MEDIUM PRIORITY
  # ========================================

  # API Docs/Admin
  - hostname: api.ratehunter.net
    service: http://localhost:6000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Metrics (Prometheus)
  - hostname: metrics.ratehunter.net
    service: http://localhost:9090
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # Auth Service Admin
  - hostname: auth.ratehunter.net
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  # ========================================
  # CATCH-ALL
  # ========================================
  - service: http_status:404

metrics: 0.0.0.0:9999

originRequest:
  connectTimeout: 30s
  tlsTimeout: 10s
  tcpKeepAlive: 30s
  keepAliveConnections: 100
  keepAliveTimeout: 90s
  noTLSVerify: true

retries: 3
grace-period: 30s
no-autoupdate: true
protocol: auto
```

---

## 🔧 Step 2: Create DNS Records

For each hostname, create a CNAME or use cloudflared CLI:

```powershell
# Automate DNS creation
cloudflared tunnel route dns orchestrator-essential admin.ratehunter.net
cloudflared tunnel route dns orchestrator-essential crm.ratehunter.net
cloudflared tunnel route dns orchestrator-essential flow.ratehunter.net
cloudflared tunnel route dns orchestrator-essential chat.ratehunter.net
cloudflared tunnel route dns orchestrator-essential secrets.ratehunter.net
cloudflared tunnel route dns orchestrator-essential graph.ratehunter.net
cloudflared tunnel route dns orchestrator-essential vector.ratehunter.net
cloudflared tunnel route dns orchestrator-essential agentdb.ratehunter.net
cloudflared tunnel route dns orchestrator-essential grafana.ratehunter.net
cloudflared tunnel route dns orchestrator-essential nexus.ratehunter.net
cloudflared tunnel route dns orchestrator-essential orchestrator.ratehunter.net
cloudflared tunnel route dns orchestrator-essential api.ratehunter.net
cloudflared tunnel route dns orchestrator-essential metrics.ratehunter.net
cloudflared tunnel route dns orchestrator-essential auth.ratehunter.net
```

---

## 🔐 Step 3: Set Up Cloudflare Access Policies

### A. Enable Cloudflare Access (Zero Trust)

1. Go to: https://one.dash.cloudflare.com/
2. Select your account → **Access** → **Applications**
3. Click **Add an application** → **Self-hosted**

### B. Create Access Application

#### For Team-Only Services (Most Services)

**Application Settings:**
```
Name: Project Nyra - Team Services
Session Duration: 24 hours
Application Domain:
  - admin.ratehunter.net
  - crm.ratehunter.net
  - flow.ratehunter.net
  - chat.ratehunter.net
  - secrets.ratehunter.net
  - graph.ratehunter.net
  - vector.ratehunter.net
  - agentdb.ratehunter.net
  - grafana.ratehunter.net
  - nexus.ratehunter.net
  - orchestrator.ratehunter.net
  - n8n.ratehunter.net
  - flows.ratehunter.net
  - api.ratehunter.net
  - metrics.ratehunter.net
  - auth.ratehunter.net
```

**Access Policies:**

**Policy 1: Allow Team Members**
```
Policy Name: Team Access
Action: Allow
Include:
  - Emails: ellis@ratehunter.net, team@ratehunter.net
  OR
  - Email domain: @ratehunter.net
```

**Policy 2: Block All Others**
```
Policy Name: Deny Others
Action: Block
Include:
  - Everyone
```

#### For Admin-Only Services (Secrets, DB, etc.)

**Application Settings:**
```
Name: Project Nyra - Admin Only
Session Duration: 12 hours
Application Domain:
  - secrets.ratehunter.net
  - agentdb.ratehunter.net
```

**Access Policy:**
```
Policy Name: Admin Only
Action: Allow
Include:
  - Emails: ellis@ratehunter.net
```

---

## 🌐 Step 4: Configure Identity Provider

**Option A: One-Time PIN (Simplest)**
```
Settings → Authentication → Login Methods
✅ Enable: One-time PIN
Emails allowed: ellis@ratehunter.net, team@ratehunter.net
```

**Option B: Google OAuth (Recommended)**
```
Settings → Authentication → Login Methods
✅ Enable: Google
Add emails: ellis@ratehunter.net
```

**Option C: GitHub OAuth**
```
Settings → Authentication → Login Methods
✅ Enable: GitHub
Add usernames or org
```

---

## 🔍 Step 5: Test Access Control

### Test Protected Service:
1. Visit: https://crm.ratehunter.net
2. Should redirect to Cloudflare Access login
3. Enter email → Receive PIN or OAuth
4. After login → Access granted

### Test Public Service:
1. Visit: https://ratehunter.net
2. Should load immediately (no auth)

---

## 📊 Complete Service Mapping

| Domain | Service | Port | Auth Level | Status |
|--------|---------|------|------------|--------|
| ratehunter.net | Landing | 3001 | Public | ✅ |
| nyra.ratehunter.net | Broker Portal | 3002 | Own Auth | ✅ |
| admin.ratehunter.net | Archon OS | 4000 | Team | 🔐 |
| crm.ratehunter.net | Twenty CRM | 3020 | Team | 🔐 |
| flow.ratehunter.net | Claude Flow | 3003 | Team | 🔐 |
| chat.ratehunter.net | Dify | 3001 | Team | 🔐 |
| secrets.ratehunter.net | Infisical | 8080 | Admin | 🔐🔐 |
| graph.ratehunter.net | Graphiti | 6379 | Team | 🔐 |
| vector.ratehunter.net | RuVector | 6333 | Team | 🔐 |
| agentdb.ratehunter.net | AgentDB | 5432 | Admin | 🔐🔐 |
| grafana.ratehunter.net | Grafana | 3000 | Team | 🔐 |
| nexus.ratehunter.net | Nexus Router | 6000 | Team | 🔐 |
| orchestrator.ratehunter.net | Orchestrator | 8000 | Team | 🔐 |
| n8n.ratehunter.net | n8n | 5678 | Team | 🔐 |
| flows.ratehunter.net | Activepieces | 5000 | Team | 🔐 |
| api.ratehunter.net | API Gateway | 6000 | Team | 🔐 |
| metrics.ratehunter.net | Prometheus | 9090 | Team | 🔐 |
| auth.ratehunter.net | Auth Admin | 8080 | Admin | 🔐🔐 |

**Legend:**
- ✅ Public
- 🔐 Team Access Required
- 🔐🔐 Admin Access Required

---

## 🚫 Services NOT on Tunnel (Tailscale Only)

These should NOT be exposed via Cloudflare (security risk):

```
❌ worker-5090.ratehunter.net  → Use 100.64.0.10 instead
❌ worker-3060.ratehunter.net  → Use 100.64.0.11 instead
❌ worker-3090.ratehunter.net  → Use 100.64.0.12 instead
❌ db.ratehunter.net           → Use localhost:5432 or Tailscale IP
❌ logs.ratehunter.net         → Internal only
```

**Why not expose workers?**
- GPU APIs should never be public (security risk)
- Use Tailscale IPs for internal access: `http://100.64.0.10:8000`
- Workers don't need pretty URLs (used programmatically)

---

## 🔒 Alternative: Tailscale MagicDNS (Internal Only)

If you want domains that ONLY work on Tailscale network:

### Enable Tailscale MagicDNS:
1. Go to: https://login.tailscale.com/admin/dns
2. Enable **MagicDNS**
3. Add nameserver: `100.100.100.100`

### Add DNS Records:
```
orchestrator.nyra.ts.net   → 100.64.0.1
worker-5090.nyra.ts.net    → 100.64.0.10
worker-3060.nyra.ts.net    → 100.64.0.11
worker-3090.nyra.ts.net    → 100.64.0.12
```

**Benefits:**
- ✅ Only works on Tailscale network
- ✅ No public exposure risk
- ✅ No Cloudflare Access needed

**Drawbacks:**
- ❌ Must be connected to Tailscale
- ❌ No HTTPS (unless you set up certs)
- ❌ Not ratehunter.net domain (uses .ts.net)

---

## 🎯 Recommended Setup

### Tier 1: Public (Cloudflare Tunnel, No Auth)
```
ratehunter.net              → Landing page
```

### Tier 2: Team Access (Cloudflare Access)
```
admin.ratehunter.net        → Archon OS
crm.ratehunter.net          → Twenty CRM
flow.ratehunter.net         → Claude Flow
chat.ratehunter.net         → Dify
grafana.ratehunter.net      → Monitoring
nexus.ratehunter.net        → API Gateway
orchestrator.ratehunter.net → Orchestrator
n8n.ratehunter.net          → n8n
flows.ratehunter.net        → Activepieces
api.ratehunter.net          → API Docs
metrics.ratehunter.net      → Prometheus
```

### Tier 3: Admin Only (Cloudflare Access - Restricted)
```
secrets.ratehunter.net      → Infisical
agentdb.ratehunter.net      → AgentDB Admin
auth.ratehunter.net         → Auth Admin
```

### Tier 4: Internal Only (Tailscale - No Tunnel)
```
100.64.0.1                  → Orchestrator services
100.64.0.10                 → RTX 5090 vLLM
100.64.0.11                 → RTX 3060 Ollama
100.64.0.12                 → RTX 3090 Ollama
```

---

## 💰 Cost Considerations

### Cloudflare Access Pricing:
- **Free:** Up to 50 users
- **$3/user/month:** 50+ users
- **Tunnel:** FREE (unlimited)

**Recommendation:** Use Free tier for your team (under 50 users)

---

## 🧪 Testing Checklist

### Before Going Live:
- [ ] Add all hostnames to tunnel config
- [ ] Create DNS records (cloudflared tunnel route dns)
- [ ] Restart tunnel
- [ ] Test public service (ratehunter.net) - no auth
- [ ] Create Cloudflare Access application
- [ ] Add your email to policy
- [ ] Test protected service (crm.ratehunter.net) - should require login
- [ ] Verify authentication works
- [ ] Add team members to allowed emails
- [ ] Test from different browser/incognito

---

## 🚨 Security Best Practices

### DO:
- ✅ Use Cloudflare Access for team services
- ✅ Keep GPU workers on Tailscale only
- ✅ Use strong identity providers (Google/GitHub OAuth)
- ✅ Set short session durations (12-24 hours)
- ✅ Review access logs regularly
- ✅ Use separate policies for admin services

### DON'T:
- ❌ Expose databases directly via tunnel
- ❌ Expose GPU APIs publicly
- ❌ Use same policy for all services
- ❌ Allow "Everyone" in policies
- ❌ Disable Cloudflare Access after setup

---

## 📚 Quick Commands

### Add New Hostname:
```powershell
# 1. Add to orchestrator-essential.yml ingress
# 2. Create DNS record
cloudflared tunnel route dns orchestrator-essential newservice.ratehunter.net

# 3. Restart tunnel
taskkill /F /IM cloudflared.exe
cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run

# 4. Add to Cloudflare Access policy
# (via web UI)
```

### Test Hostname:
```powershell
# Test DNS resolution
nslookup crm.ratehunter.net

# Test HTTPS
curl https://crm.ratehunter.net
```

---

**Last Updated:** 2026-02-06
**Status:** Ready to implement
**Estimated Setup Time:** 30 minutes

This setup gives you beautiful URLs with full access control and zero public exposure for sensitive services.
