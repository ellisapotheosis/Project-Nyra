# Project Nyra Bootstrap Package

**🚀 Complete 4-PC Mortgage Automation Platform Deployment**

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** 2025-01-18

---

## ⭐ START HERE

**New to Project Nyra?** Read this first: **[BOOTSTRAP-MASTER-GUIDE.md](BOOTSTRAP-MASTER-GUIDE.md)**

This guide contains everything you need to deploy Project Nyra on all 4 PCs, from pre-flight checks to post-deployment configuration.

---

## 📁 What's in This Package?

### 🎯 Essential Guides (Read in Order)

1. **BOOTSTRAP-MASTER-GUIDE.md** ⭐ **START HERE**
   - Complete step-by-step deployment guide
   - Prerequisites and pre-flight checks
   - Orchestrator + GPU worker setup
   - Troubleshooting
   - 15-20 minute read

2. **BOOTSTRAP-INTEGRATION-SUMMARY.md** 📋
   - What's been integrated into the repo
   - Definitive answers to all architecture questions
   - Service inventory
   - Success metrics
   - 10 minute read

### 🏗️ Architecture Deep Dives

3. **ARCHITECTURE-ORCHESTRATOR.md** 🔧
   - Windows 11 + Docker + WSL2 architecture
   - Complete service breakdown
   - Why Docker on Windows (not WSL)
   - Claude-Code vs Claude-Flow decisions
   - 20-30 minute read

4. **MCP-ARCHITECTURE.md** 🔗
   - Hybrid MCP strategy explained
   - Nexus Router configuration
   - Claude-Flow + Nexus relationship
   - Infisical CLI + MCP dual deployment
   - Complete claude_desktop_config.json
   - 15-20 minute read

5. **CLOUDFLARE-TUNNEL-INTEGRATION.md** 🌐
   - 4-PC tunnel deployment
   - Docker container configuration
   - Public hostname mapping
   - Koyeb.com integration options
   - 10-15 minute read

### 🛠️ Configuration Files

6. **.env.template** (in repo root)
   - All 30+ environment variables
   - Infisical Project ID: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
   - Required vs optional fields marked
   - Security best practices

7. **health-dashboard.html** (in repo root)
   - Real-time service monitoring
   - 13 service health checks
   - Auto-refresh capability
   - Open in browser: `start ../health-dashboard.html`

### 📜 Deployment Scripts

8. **scripts/00-PRE-FLIGHT-CHECK.ps1**
   - Validates prerequisites
   - Checks Docker, WSL2, NVIDIA drivers
   - Port availability scan
   - Disk space verification
   - Run before installation

9. **scripts/ROLLBACK.ps1**
   - Disaster recovery
   - Lists available backups
   - Safe rollback with confirmation
   - Service restart + health checks

10. **scripts/03-GUI-INSTALLER.ps1** 🎨
    - Windows Forms GUI installer
    - Select PC role (Orchestrator/Worker)
    - Automated deployment
    - Progress tracking
    - **Main installation tool**

---

## 🎯 Quick Start (5 Minutes to First Deploy)

```powershell
# 1. Navigate to bootstrap
cd C:\Dev\Projects\Repos\Project-Nyra\bootstrap

# 2. Run pre-flight check
.\scripts\00-PRE-FLIGHT-CHECK.ps1 -Verbose

# 3. Configure secrets
cd ..
Copy-Item .env.template .env
notepad .env  # Fill in API keys

# 4. Launch GUI installer
cd bootstrap
.\scripts\03-GUI-INSTALLER.ps1

# 5. Select role and follow wizard
# - Orchestrator → Full stack
# - Worker → GPU compute
```

---

## 🏗️ Your 4-PC Setup

| PC | Role | Hardware | Services |
|----|------|----------|----------|
| **UH680** | Orchestrator | Ryzen 7 6800H, 16GB | All services (20+ containers) |
| **Desktop** | Worker-3090 | RTX 3090Ti | LLM inference |
| **M15R7** | Worker-3060 | RTX 3060 | LLM inference |
| **Area-51** | Worker-5090 | RTX 5090 | LLM inference |

**Network:** All connected via LAN + Cloudflare Tunnel for external access

---

## 📊 What Gets Deployed?

### Orchestrator PC Services

```
Infrastructure:     PostgreSQL, Redis
Routing:           Nexus Router, Cloudflared, Tailscale
Applications:      TwentyCRM, Dify, n8n, RateHunter, Nyra Admin, Gitea
Orchestration:     Claude-Flow, Infisical MCP
Observability:     Prometheus, Grafana, Loki

Total: 20+ Docker containers
```

### GPU Worker Services

```
LLM Inference:     Ollama, vLLM
Monitoring:        Prometheus Node Exporter
Networking:        Cloudflared (optional, for HA)

Total: 3-4 Docker containers per worker
```

---

## 🌐 Public Access

After deployment, these URLs will be live:

| URL | Service | Access |
|-----|---------|--------|
| https://ratehunter.net | Public landing page | Public |
| https://nyra.ratehunter.net | Admin webapp | Private (team only) |
| https://crm.ratehunter.net | TwentyCRM | Private |
| https://chat.ratehunter.net | Dify AI chat | Private |
| https://monitor.ratehunter.net | Grafana | Private (admins) |
| https://workflow.ratehunter.net | n8n | Private (admins) |

---

## 🎓 Architecture Decisions (TL;DR)

| Question | Answer | Why |
|----------|--------|-----|
| Docker on Windows or WSL? | **Windows** | Stability + WSL2 integration |
| MCP architecture? | **Hybrid** (local + Nexus) | Filesystem access + performance |
| Claude-Flow placement? | **Docker container** | Isolation + orchestration needs |
| Claude-Code placement? | **WSL2 native** | Better dev experience |
| Cloudflared? | **Containerized** | Direct Docker network access |
| Tailscale? | **Containerized** | Consistency |
| Gitea? | **Containerized** | Backup simplicity |
| Infisical? | **CLI + MCP both** | Compose injection + runtime |

**Full explanation:** See `ARCHITECTURE-ORCHESTRATOR.md` and `MCP-ARCHITECTURE.md`

---

## 🔐 Secrets Management

**Infisical Project ID:** `8374cea9-e5e8-4050-bda4-b91f25ab30ef`

### Two-Tier Strategy

1. **Infisical CLI** (local) - Docker Compose startup
   ```powershell
   infisical run -- docker compose up -d
   ```

2. **Infisical MCP** (containerized) - Runtime secret fetching
   ```typescript
   // Claude fetches secrets dynamically
   const apiKey = await infisical.getSecret('/nyra/prod/ANTHROPIC_API_KEY');
   ```

---

## ✅ Success Criteria

Your bootstrap is complete when:

1. ✅ Health dashboard shows all services green
2. ✅ https://ratehunter.net loads
3. ✅ Claude Desktop connects to all MCPs
4. ✅ GPU workers appear in Grafana
5. ✅ Test quote generates successfully
6. ✅ No errors in Docker logs

---

## 🆘 Troubleshooting

### Common Issues

**Pre-flight check fails:**
```powershell
# Check specific issue in output
# Install missing components (Docker, WSL2, etc.)
# Re-run check
```

**Services won't start:**
```powershell
# Check Docker is running
docker ps

# View service logs
docker logs twentycrm --tail 50

# Restart all services
docker compose down && docker compose up -d
```

**Cloudflare Tunnel not connecting:**
```powershell
# Check tunnel logs
docker logs cloudflared --tail 50

# Verify token in .env or Infisical
```

**MCP servers not working:**
```powershell
# Restart Claude Desktop completely
# Check config:
notepad C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
```

**Full troubleshooting guide:** See `BOOTSTRAP-MASTER-GUIDE.md` § Troubleshooting

---

## 📚 Documentation Structure

```
bootstrap/
├─ BOOTSTRAP-MASTER-GUIDE.md        ⭐ START HERE
├─ BOOTSTRAP-INTEGRATION-SUMMARY.md  📋 What's integrated
├─ ARCHITECTURE-ORCHESTRATOR.md      🔧 Architecture deep dive
├─ MCP-ARCHITECTURE.md               🔗 MCP configuration
├─ CLOUDFLARE-TUNNEL-INTEGRATION.md  🌐 Public access setup
│
├─ scripts/
│  ├─ 00-PRE-FLIGHT-CHECK.ps1        ✅ Prerequisites
│  ├─ ROLLBACK.ps1                   🔄 Disaster recovery
│  └─ 03-GUI-INSTALLER.ps1           🎨 Main installer
│
└─ README.md                         👈 You are here
```

---

## 🚀 Next Steps

### Immediate (After Reading This)

1. Read **BOOTSTRAP-MASTER-GUIDE.md** (15 minutes)
2. Run `00-PRE-FLIGHT-CHECK.ps1` on orchestrator PC
3. Configure `.env` file with API keys
4. Run `03-GUI-INSTALLER.ps1` to deploy

### Short Term (Week 1)

1. Deploy orchestrator PC (2-3 hours)
2. Deploy GPU workers (1-2 hours each)
3. Configure TwentyCRM
4. Import n8n workflows
5. Test first campaign

### Long Term (Month 1)

1. Train team on Nyra Admin
2. Go live with ratehunter.net
3. Monitor campaign performance
4. Optimize LLM costs
5. Scale as needed

---

## 🎉 What You Get

**After completing this bootstrap:**

- ✅ Complete mortgage automation platform
- ✅ 30+ Docker services running
- ✅ Public access via Cloudflare Tunnel
- ✅ AI-powered workflows (Claude-Flow)
- ✅ Compliance-first architecture (TCPA, GLBA, CFPB)
- ✅ Production-grade monitoring (Prometheus, Grafana)
- ✅ GPU-accelerated LLM inference
- ✅ Secrets management (Infisical)
- ✅ Version control (Gitea)
- ✅ Complete documentation

**You're ready to run a modern, AI-powered mortgage brokerage. 🚀**

---

## 📞 Support

**Issues during bootstrap?**
1. Check **BOOTSTRAP-MASTER-GUIDE.md** § Troubleshooting
2. Review health dashboard: `start ../health-dashboard.html`
3. Check Docker logs: `docker compose logs --follow`
4. Use rollback if needed: `.\scripts\ROLLBACK.ps1`

**Questions about architecture?**
- **MCP questions:** See `MCP-ARCHITECTURE.md`
- **Docker/WSL questions:** See `ARCHITECTURE-ORCHESTRATOR.md`
- **Networking questions:** See `CLOUDFLARE-TUNNEL-INTEGRATION.md`

---

**Ready to begin? Start with [BOOTSTRAP-MASTER-GUIDE.md](BOOTSTRAP-MASTER-GUIDE.md)** ⭐

---

**Project Nyra** - AI-Powered Mortgage Automation Platform  
**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Date:** 2025-01-18
