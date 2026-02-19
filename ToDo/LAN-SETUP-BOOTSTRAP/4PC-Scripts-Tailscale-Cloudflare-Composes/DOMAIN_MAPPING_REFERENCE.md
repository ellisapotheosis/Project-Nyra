# Project Nyra - Complete Domain Mapping Reference
**Last Updated:** 2026-02-06
**Purpose:** Complete list of all domains, ports, and access control

---

## 🌐 Complete Domain Map

### Public Services (No Authentication)

| Domain | Service | Port | Local URL | Access | Status |
|--------|---------|------|-----------|--------|--------|
| ratehunter.net | Landing Page | 3001 | http://localhost:3001 | Public | ✅ |
| nyra.ratehunter.net | Broker Portal | 3002 | http://localhost:3002 | Own Auth | ✅ |

---

### Team Services (Cloudflare Access Required)

| Domain | Service | Port | Local URL | Access | Priority |
|--------|---------|------|-----------|--------|----------|
| admin.ratehunter.net | Archon OS | 4000 | http://localhost:4000 | Team | High |
| crm.ratehunter.net | TwentyCRM | 3020 | http://localhost:3020 | Team | High |
| flow.ratehunter.net | Claude Flow | 3003 | http://localhost:3003 | Team | High |
| chat.ratehunter.net | Dify UI | 3001 | http://localhost:3001 | Team | High |
| grafana.ratehunter.net | Grafana | 3000 | http://localhost:3000 | Team | High |
| n8n.ratehunter.net | n8n | 5678 | http://localhost:5678 | Team | High |
| flows.ratehunter.net | Activepieces | 5000 | http://localhost:5000 | Team | High |
| nexus.ratehunter.net | Nexus Router | 6000 | http://localhost:6000 | Team | High |
| orchestrator.ratehunter.net | Orchestrator | 8000 | http://localhost:8000 | Team | High |
| app.ratehunter.net | Nyra App | 3002 | http://localhost:3002 | Team | High |
| hooks.ratehunter.net | Webhook Manager | 8050 | http://localhost:8050 | Team | High |

---

### Admin-Only Services (Restricted Cloudflare Access)

| Domain | Service | Port | Local URL | Access | Priority |
|--------|---------|------|-----------|--------|----------|
| secrets.ratehunter.net | Infisical | 8090 | http://localhost:8090 | Admin | High |
| agentdb.ratehunter.net | AgentDB | 5050 | http://localhost:5050 | Admin | High |
| auth.ratehunter.net | Auth Admin | 8080 | http://localhost:8080 | Admin | High |
| graph.ratehunter.net | Graphiti/FalkorDB | 7474 | http://localhost:7474 | Admin | High |
| vector.ratehunter.net | RuVector | 6333 | http://localhost:6333 | Admin | High |

---

### Medium Priority Services (Cloudflare Access)

| Domain | Service | Port | Local URL | Access | Notes |
|--------|---------|------|-----------|--------|-------|
| api.ratehunter.net | API Gateway | 6000 | http://localhost:6000 | Team | Docs/Admin |
| metrics.ratehunter.net | Prometheus | 9090 | http://localhost:9090 | Team | Metrics |
| logs.ratehunter.net | Loki/Grafana | 3100 | http://localhost:3100 | Team | Log viewer |
| files.ratehunter.net | File Browser | 9000 | http://localhost:9000 | Team | Storage |
| hooks.ratehunter.net | Webhook Manager | 8050 | http://localhost:8050 | Team | Campaign webhooks |

---

### Internal Only (Tailscale - NOT on Tunnel)

| Tailscale IP | Service | Port | Local URL | Access | Notes |
|--------------|---------|------|-----------|--------|-------|
| 100.64.0.1 | Orchestrator | 8000-8090 | http://100.64.0.1:8000 | Internal | All orchestrator services |
| 100.64.0.10 | vLLM (5090) | 8000 | http://100.64.0.10:8000 | Internal | GPU inference |
| 100.64.0.11 | Ollama (3060) | 11434 | http://100.64.0.11:11434 | Internal | GPU inference |
| 100.64.0.12 | Ollama (3090) | 11434 | http://100.64.0.12:11434 | Internal | GPU inference |

**Why not expose GPU workers via tunnel?**
- Security risk - GPU APIs should never be public
- No need for pretty URLs (accessed programmatically)
- Tailscale provides secure access

---

### Low Priority / Future (Not Yet Configured)

| Domain | Service | Port | Access | Notes |
|--------|---------|------|--------|-------|
| db.ratehunter.net | PostgreSQL Admin | 5432 | Admin | Use pgAdmin or TablePlus instead |
| mail.ratehunter.net | Email Service | 25/587 | Team | Not implemented yet |
| git.ratehunter.net | Git Server | 3000 | Team | Use GitHub/GitLab instead |
| audit.ratehunter.net | Audit Logs | TBD | Admin | Future feature |

---

## 📊 Port Conflict Resolution

### Conflicts Found & Resolved:

| Port | Original Service | Conflict With | Resolution |
|------|-----------------|---------------|------------|
| 8080 | Cloudflared Metrics | Auth Service | Metrics → 9999 ✅ |
| 3100 | Claude Flow Dashboard | Loki Logs | Dashboard → 3003 ✅ |
| 3001 | Landing Page | Dify Chat | Different services, same port OK (context-dependent) |

### Port Assignments (No Conflicts):

```
3000 → Grafana
3001 → Landing Page / Dify (context-dependent)
3002 → Broker Portal
3003 → Claude Flow Dashboard
3004 → Event Server (WebSocket)
3005 → Event Server (HTTP)
3020 → CRM
3100 → Loki Logs (if implemented)
4000 → Admin Dashboard
5000 → Activepieces
5050 → AgentDB Admin
5432 → PostgreSQL (not tunneled)
5678 → n8n
6000 → Nexus Router
6333 → RuVector
7474 → FalkorDB
8000 → Orchestrator Service
8010 → Lead API
8020 → Quote API
8030 → Rate Comparison
8040 → Document API
8050 → Campaign Engine / Webhook Manager
8080 → Auth Service
8090 → Security Service / Infisical
9000 → File Storage
9090 → Prometheus
9999 → Cloudflared Metrics
```

---

## 🔐 Cloudflare Access Policy Template

### Policy 1: Public (No Auth)
```yaml
Application: Public Services
Domains:
  - ratehunter.net
  - nyra.ratehunter.net
Policy: Bypass (no authentication)
```

### Policy 2: Team Access
```yaml
Application: Team Services
Domains:
  - admin.ratehunter.net
  - crm.ratehunter.net
  - flow.ratehunter.net
  - chat.ratehunter.net
  - grafana.ratehunter.net
  - n8n.ratehunter.net
  - flows.ratehunter.net
  - nexus.ratehunter.net
  - orchestrator.ratehunter.net
  - api.ratehunter.net
  - metrics.ratehunter.net
  - logs.ratehunter.net
  - files.ratehunter.net
  - hooks.ratehunter.net

Policy:
  Action: Allow
  Include:
    - Email domain: @ratehunter.net
    OR
    - Emails: ellis@ratehunter.net, [team emails]

Session Duration: 24 hours
```

### Policy 3: Admin Only
```yaml
Application: Admin Services
Domains:
  - secrets.ratehunter.net
  - agentdb.ratehunter.net
  - auth.ratehunter.net
  - graph.ratehunter.net
  - vector.ratehunter.net

Policy:
  Action: Allow
  Include:
    - Emails: ellis@ratehunter.net

Session Duration: 12 hours
```

---

## 🚀 Quick Setup Commands

### 1. Update Tunnel Config

Copy the new config:
```powershell
Copy-Item "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential-with-all-domains.yml" `
  -Destination "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" `
  -Force
```

### 2. Create All DNS Records

```powershell
# Run the automated script
powershell -ExecutionPolicy Bypass -File "C:\Users\edane\OneDrive\LANShare\setup-all-domains.ps1"
```

Or manually:
```powershell
cloudflared tunnel route dns orchestrator-essential admin.ratehunter.net
cloudflared tunnel route dns orchestrator-essential crm.ratehunter.net
cloudflared tunnel route dns orchestrator-essential flow.ratehunter.net
# ... (see setup-all-domains.ps1 for complete list)
```

### 3. Restart Tunnel

```powershell
taskkill /F /IM cloudflared.exe
cloudflared tunnel --config "C:\Users\edane\OneDrive\LANShare\cloudflared-configs\orchestrator-essential.yml" run
```

### 4. Set Up Cloudflare Access

1. Go to: https://one.dash.cloudflare.com/
2. Navigate to: **Access** → **Applications**
3. Create 3 applications (Public, Team, Admin)
4. Add domains to each application
5. Configure authentication (Google OAuth recommended)
6. Test access control

---

## 🧪 Testing Matrix

### Test Public Access (No Auth):

```bash
# Should work without login
curl https://ratehunter.net
curl https://nyra.ratehunter.net
```

### Test Team Access (Requires Auth):

```bash
# Should redirect to Cloudflare Access login
curl https://crm.ratehunter.net
curl https://admin.ratehunter.net
curl https://grafana.ratehunter.net
```

### Test Admin Access (Restricted):

```bash
# Should require admin email
curl https://secrets.ratehunter.net
curl https://agentdb.ratehunter.net
```

### Test Internal Access (Tailscale Only):

```bash
# Should only work when connected to Tailscale
curl http://100.64.0.10:8000/v1/models      # vLLM
curl http://100.64.0.11:11434/api/tags      # Ollama
```

---

## 📝 DNS Record Status

After running `setup-all-domains.ps1`, verify DNS propagation:

```powershell
# Check DNS resolution
nslookup admin.ratehunter.net
nslookup crm.ratehunter.net
nslookup flow.ratehunter.net

# Check HTTPS
curl -I https://admin.ratehunter.net
curl -I https://crm.ratehunter.net
```

Expected output:
```
HTTP/2 302
location: https://ratehunter.cloudflareaccess.com/...
```

This means Cloudflare Access is working (redirecting to login).

---

## 🎯 Service Availability Matrix

| Service | Public URL | Internal URL | Tailscale URL | Auth Level |
|---------|-----------|--------------|---------------|------------|
| Landing | ✅ ratehunter.net | ✅ localhost:3001 | ✅ 100.64.0.1:3001 | None |
| Broker Portal | ✅ nyra.ratehunter.net | ✅ localhost:3002 | ✅ 100.64.0.1:3002 | Own |
| Admin | ✅ admin.ratehunter.net | ✅ localhost:4000 | ✅ 100.64.0.1:4000 | Team |
| CRM | ✅ crm.ratehunter.net | ✅ localhost:3020 | ✅ 100.64.0.1:3020 | Team |
| Flow | ✅ flow.ratehunter.net | ✅ localhost:3003 | ✅ 100.64.0.1:3003 | Team |
| Chat | ✅ chat.ratehunter.net | ✅ localhost:3001 | ✅ 100.64.0.1:3001 | Team |
| Secrets | ✅ secrets.ratehunter.net | ✅ localhost:8090 | ✅ 100.64.0.1:8090 | Admin |
| Grafana | ✅ grafana.ratehunter.net | ✅ localhost:3000 | ✅ 100.64.0.1:3000 | Team |
| n8n | ✅ n8n.ratehunter.net | ✅ localhost:5678 | ✅ 100.64.0.1:5678 | Team |
| Nexus | ✅ nexus.ratehunter.net | ✅ localhost:6000 | ✅ 100.64.0.1:6000 | Team |
| Orchestrator | ✅ orchestrator.ratehunter.net | ✅ localhost:8000 | ✅ 100.64.0.1:8000 | Team |
| vLLM | ❌ No public | ❌ Not local | ✅ 100.64.0.10:8000 | Internal |
| Ollama 3060 | ❌ No public | ❌ Not local | ✅ 100.64.0.11:11434 | Internal |
| Ollama 3090 | ❌ No public | ❌ Not local | ✅ 100.64.0.12:11434 | Internal |

---

## 🔗 Quick Links

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **Cloudflare Access:** https://one.dash.cloudflare.com/
- **Tailscale Admin:** https://login.tailscale.com/admin/machines
- **Tunnel Metrics:** http://localhost:9999/metrics

---

## 📚 Related Documentation

- **CLOUDFLARE_ACCESS_SETUP.md** - Complete setup guide
- **INFRASTRUCTURE_REFERENCE.md** - Port and service reference
- **INFRA_CONSOLIDATION_GUIDE.md** - Docker compose and infra guide
- **setup-all-domains.ps1** - Automated DNS setup script
- **orchestrator-essential-with-all-domains.yml** - Complete tunnel config

---

**Last Updated:** 2026-02-06
**Total Domains:** 25+
**Public Domains:** 2
**Team Domains:** 14
**Admin Domains:** 5
**Internal Only:** 4+ (Tailscale)
