# NYRA All-In-One Bootstrap Kit

**Complete 4-PC Cluster Setup** - From zero to fully operational mortgage automation platform in 2-4 hours.

Version: 1.0
Last Updated: 2026-01-13
Maintainer: Project Nyra Team

---

## 📦 What's Included

This bootstrap kit contains **everything** needed to deploy the complete Project Nyra 4-PC distributed mortgage automation platform:

### ✅ Interactive Bootstrap GUI
- **Electron/React wizard** with 9-step setup process
- Hardware auto-detection (CPU, GPU, memory)
- PC role recommendation (orchestrator vs workers)
- One-click Docker, Tailscale, and service deployment
- Real-time health validation
- Configuration persistence and resume capability

### ✅ Automation Scripts (PowerShell + Bash)
- **bootstrap-orchestrator** - PC1 Mac Mini setup (8 services)
- **bootstrap-worker** - PC2/3/4 GPU worker setup (role-based profiles)
- **health-check-all** - Comprehensive 22-service validation
- **backup-daily** - Automated backup with compression + 7-day retention
- **configure-static-ip** - Network configuration automation

### ✅ Infrastructure as Code
- **Docker Compose orchestrator** - PC1 coordination services
- **Docker Compose worker** - PC2/3/4 with profile-based deployment
- Multi-host networking (10.0.0.1-4)
- GPU support (NVIDIA Container Toolkit)
- Health checks for all 22 services

### ✅ Comprehensive Documentation
- **COMPLETE-SETUP-GUIDE.md** - 7-phase deployment (2-4 hours)
- **MASTER-TROUBLESHOOTING.md** - 100+ solutions for common issues
- **CLAUDE-FLOW-VERSION-COMPARISON.md** - Migration guide (V2→V3→CLI)
- **TOP-15-CLAUDE-FLOW-WORKFLOWS.md** - Essential workflows catalog

### ✅ Configuration Templates
- **master-.env.example** - 221 environment variables
- **.mcp.json** - MCP server configuration
- **settings.json** - Claude Flow orchestration settings

---

## 🚀 Quick Start (15 Minutes)

### Prerequisites
- **4 PCs**: 1 orchestrator + 3 GPU workers (see Hardware Requirements)
- **Windows 10/11** or **Linux/macOS** on all machines
- **Internet connection** for Docker image downloads
- **Static LAN network** (10.0.0.0/24 subnet)

### Step 1: Clone Repository (All PCs)
```bash
# Windows (PowerShell)
cd C:\Dev\Projects\Repos
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra

# Linux/Mac (Bash)
cd /opt
sudo git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

### Step 2: Launch Bootstrap GUI (Recommended)
```bash
# Windows
cd bootstrap-gui
npm install
npm run dev

# Linux/Mac
cd bootstrap-gui
npm install && npm run dev
```

**OR** use automation scripts directly:

### Step 3A: PC1 - Orchestrator Setup
```powershell
# Windows
.\scripts\bootstrap-orchestrator.ps1

# Linux/Mac
sudo ./scripts/bootstrap-orchestrator.sh
```

### Step 3B: PC2/3/4 - Worker Setup
```powershell
# PC2 (RTX 3060)
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-2

# PC3 (RTX 5090)
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-3

# PC4 (RTX 3090 Ti)
.\scripts\bootstrap-worker.ps1 -WorkerRole worker-4

# Linux/Mac
sudo ./scripts/bootstrap-worker.sh worker-2  # PC2
sudo ./scripts/bootstrap-worker.sh worker-3  # PC3
sudo ./scripts/bootstrap-worker.sh worker-4  # PC4
```

### Step 4: Verify Deployment
```bash
# Run comprehensive health check
.\scripts\health-check-all.ps1  # Windows
sudo ./scripts/health-check-all.sh  # Linux/Mac

# Expected: 22/22 services healthy (100%)
```

### Step 5: Access Services
- **Nexus Router**: http://10.0.0.1:6000
- **TwentyCRM**: http://10.0.0.2:3000
- **n8n Workflows**: http://10.0.0.2:5678
- **Dify Chat**: http://10.0.0.2:3002
- **Grafana Monitoring**: http://10.0.0.4:3005

---

## 📁 Repository Structure

```
Project-Nyra/
├── NYRA-AIO-Bootstrap/          ← YOU ARE HERE
│   ├── README.md                ← Master bootstrap guide
│   └── QUICK-START.md           ← 15-minute deployment
│
├── bootstrap-gui/               ← Interactive Electron/React wizard
│   ├── src/
│   │   ├── main/                ← Electron main process (IPC handlers)
│   │   └── renderer/            ← React UI (9-step wizard)
│   ├── package.json
│   └── README.md
│
├── scripts/                     ← Automation scripts (PS1 + Bash)
│   ├── bootstrap-orchestrator.ps1/.sh
│   ├── bootstrap-worker.ps1/.sh
│   ├── health-check-all.ps1/.sh
│   ├── backup-daily.ps1/.sh
│   └── configure-static-ip.ps1/.sh
│
├── infra/                       ← Infrastructure as Code
│   ├── docker-compose.orchestrator.yml  ← PC1 services
│   ├── docker-compose.worker.yml        ← PC2/3/4 with profiles
│   ├── monitoring/              ← Prometheus, Grafana, Loki configs
│   └── CLAUDE.md
│
├── docs/                        ← Comprehensive documentation
│   ├── COMPLETE-SETUP-GUIDE.md  ← 7-phase deployment (2-4 hours)
│   ├── MASTER-TROUBLESHOOTING.md ← 100+ solutions
│   ├── CLAUDE-FLOW-VERSION-COMPARISON.md
│   └── workflows/
│       └── TOP-15-CLAUDE-FLOW-WORKFLOWS.md
│
├── apps/                        ← Frontend applications
│   ├── ratehunter/              ← Public mortgage rate site (Next.js)
│   └── nyra-admin/              ← Internal operations dashboard
│
├── services/                    ← Backend microservices
│   ├── quote-engine/            ← Mortgage rate calculations (FastAPI)
│   ├── campaign-engine/         ← Drip campaign automation
│   ├── nyra-orchestrator/       ← Compliance + workflow coordination
│   └── mem0-rest/               ← Universal memory REST API
│
├── master-.env.example          ← 221 environment variables
├── .mcp.json                    ← MCP server configuration
├── CLAUDE.md                    ← Master orchestration config
└── README.md                    ← Project overview
```

---

## 💻 Hardware Requirements

### PC1 - Orchestrator (Mac Mini or similar)
- **Role**: Coordination, planning, memory management
- **CPU**: 8+ cores (Apple M1/M2 or Intel i7/i9)
- **RAM**: 16GB minimum, 32GB recommended
- **GPU**: Not required
- **Network**: Static IP 10.0.0.1, 1Gbps Ethernet
- **Storage**: 256GB SSD minimum

**Services Deployed** (8):
- Nexus Router (LLM gateway)
- Letta (conversation memory)
- Mem0 (universal memory)
- Claude Flow (orchestrator)
- AgentDB (vector database)
- RuVector (memory optimization)
- Redis (caching)
- Qdrant (vector search)

### PC2 - Worker 2 (Alienware M15R7 or similar)
- **Role**: CRM, workflows, chat UI
- **CPU**: 8+ cores
- **RAM**: 32GB minimum
- **GPU**: RTX 3060 12GB (or better)
- **Network**: Static IP 10.0.0.2, 1Gbps Ethernet
- **Storage**: 512GB SSD minimum

**Services Deployed** (5):
- TwentyCRM (CRM system)
- n8n (workflow automation)
- Dify (chat UI)
- Redis (worker cache)
- PostgreSQL instances (3 databases)

### PC3 - Worker 3 (Alienware Area-51 or similar)
- **Role**: LLM inference, knowledge graphs
- **CPU**: 12+ cores
- **RAM**: 64GB minimum
- **GPU**: RTX 5090 32GB (or RTX 4090/3090)
- **Network**: Static IP 10.0.0.3, 1Gbps Ethernet
- **Storage**: 1TB SSD minimum (models require space)

**Services Deployed** (3):
- Ollama (local LLM inference)
- Neo4j (graph database)
- FalkorDB (knowledge graph)

### PC4 - Worker 4 (Desktop PC or similar)
- **Role**: Observability, monitoring, logging
- **CPU**: 8+ cores
- **RAM**: 32GB minimum
- **GPU**: RTX 3090 Ti 24GB (or better)
- **Network**: Static IP 10.0.0.4, 1Gbps Ethernet
- **Storage**: 512GB SSD minimum

**Services Deployed** (4):
- Prometheus (metrics)
- Grafana (dashboards)
- Loki (log aggregation)
- Alertmanager (alerting)

---

## 🔧 Software Requirements

### All PCs
- **OS**: Windows 10/11 (21H2+), Ubuntu 22.04+, macOS 12+
- **Docker**: 24.0+ with Docker Compose V2
- **Git**: 2.40+
- **Node.js**: 20+ (for Bootstrap GUI)
- **Volta** (optional): Package manager for Node.js

### GPU Workers (PC2/3/4)
- **NVIDIA Drivers**: 535+ (for CUDA 12.2)
- **NVIDIA Container Toolkit**: Latest
- **CUDA Toolkit**: 12.2+ (optional, for development)

### Network Requirements
- **Static IPs**: 10.0.0.1-4 on 10.0.0.0/24 subnet
- **Gateway**: 10.0.0.1 (PC1)
- **DNS**: 1.1.1.1, 8.8.8.8 (Cloudflare, Google)
- **Bandwidth**: 1Gbps Ethernet recommended
- **Tailscale** (optional): For secure remote access

---

## 📚 Detailed Guides

### Complete Setup Guide (2-4 Hours)
**File**: `docs/COMPLETE-SETUP-GUIDE.md`

Comprehensive 7-phase deployment guide:
1. **Phase 1**: System Preparation (30 min)
2. **Phase 2**: Network Configuration (20 min)
3. **Phase 3**: Repository Setup (15 min)
4. **Phase 4**: Service Deployment (45 min)
5. **Phase 5**: GPU Worker Configuration (30 min)
6. **Phase 6**: Service Configuration (30 min)
7. **Phase 7**: Validation & Testing (20 min)

### Troubleshooting Guide
**File**: `docs/MASTER-TROUBLESHOOTING.md`

100+ solutions covering:
- Docker issues (daemon, ports, containers)
- Network issues (connectivity, static IP, Tailscale)
- API & authentication (rate limits, secrets)
- Database issues (connections, migrations)
- GPU issues (detection, VRAM, inference)
- Monitoring issues (Prometheus, Grafana, Loki)
- Service-specific issues (Nexus, TwentyCRM, n8n, Dify, Ollama)
- Emergency procedures (reset, backup, restore)

### Claude Flow Workflows
**File**: `docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md`

15 essential workflows with commands and metrics:
- SPARC Complete Development Cycle (5.6x faster)
- Hive-Mind Swarm Initialization (31 max agents)
- Parallel Document Analysis
- Smart Agent Auto-Spawning
- Self-Healing Workflow Automation
- Multi-Repository Synchronization
- And 9 more...

### Version Comparison
**File**: `docs/CLAUDE-FLOW-VERSION-COMPARISON.md`

Migration guide comparing 3 versions:
- @alpha (V2) - Legacy, deprecated
- @alphav3 (V3) - Active, stable
- @claude-flow/cli - Recommended (5.6x faster)

Includes performance benchmarks, feature matrices, and migration paths.

---

## 🎯 Deployment Workflows

### Workflow 1: GUI-Driven Setup (Easiest)
**Best for**: First-time users, visual learners

1. Launch Bootstrap GUI on each PC
2. Follow 9-step wizard (auto-detection, one-click deployment)
3. GUI handles all automation scripts
4. Visual progress tracking and health validation

**Time**: 30-45 minutes per PC

### Workflow 2: Script-Driven Setup (Fastest)
**Best for**: Advanced users, automation enthusiasts

1. Run `configure-static-ip.ps1` on each PC
2. Run `bootstrap-orchestrator.ps1` on PC1
3. Run `bootstrap-worker.ps1` on PC2/3/4 with role flags
4. Run `health-check-all.ps1` to verify

**Time**: 15-20 minutes per PC (with fast internet)

### Workflow 3: Manual Setup (Most Control)
**Best for**: DevOps engineers, custom configurations

1. Follow `docs/COMPLETE-SETUP-GUIDE.md` step-by-step
2. Customize configurations per section
3. Deploy services individually with Docker Compose
4. Validate each phase before proceeding

**Time**: 2-4 hours total

---

## 🔐 Security Checklist

### Pre-Deployment
- [ ] Change default passwords in `.env` file
- [ ] Generate strong API keys for all services
- [ ] Configure Infisical secrets management
- [ ] Review firewall rules (allow 10.0.0.0/24, block external)
- [ ] Enable Tailscale for secure remote access

### Post-Deployment
- [ ] Rotate all default credentials immediately
- [ ] Enable HTTPS/TLS for external-facing services
- [ ] Configure backup automation (daily backups)
- [ ] Set up monitoring alerts (Alertmanager)
- [ ] Review audit logs (Docker, service logs)
- [ ] Test disaster recovery procedure

### Ongoing Maintenance
- [ ] Weekly security updates (Docker images, packages)
- [ ] Monthly backup integrity tests
- [ ] Quarterly disaster recovery drills
- [ ] Review access logs and anomalies
- [ ] Keep documentation updated

---

## 🆘 Getting Help

### Troubleshooting Steps
1. **Check logs**: `docker compose logs [service-name]`
2. **Run health check**: `.\scripts\health-check-all.ps1`
3. **Consult troubleshooting guide**: `docs/MASTER-TROUBLESHOOTING.md`
4. **Restart services**: `docker compose restart [service-name]`
5. **Review configuration**: Check `.env` and Docker Compose files

### Common Issues
- **Port conflicts**: Change ports in Docker Compose
- **GPU not detected**: Install NVIDIA drivers + Container Toolkit
- **Services unhealthy**: Check environment variables and secrets
- **Network unreachable**: Verify static IPs and gateway

### Support Resources
- **GitHub Issues**: https://github.com/yourusername/Project-Nyra/issues
- **Documentation**: `docs/` directory
- **Discord Community**: [Link TBD]
- **Email Support**: support@ratehunter.net

---

## 📊 Success Criteria

### Deployment is Complete When:
- ✅ All 22 services report HEALTHY status
- ✅ Health check score: 100% (22/22 services)
- ✅ All 4 PCs reachable on LAN (10.0.0.1-4)
- ✅ Grafana dashboards showing metrics
- ✅ TwentyCRM accessible and responding
- ✅ Ollama models loaded (llama3.1, mistral, codellama)
- ✅ n8n workflows importable
- ✅ Nexus Router routing to all 3 LLM providers

### Verification Commands
```bash
# Health check (should show 22/22 healthy)
.\scripts\health-check-all.ps1

# Test LLM routing
curl http://10.0.0.1:6000/health

# Test Ollama inference
curl http://10.0.0.3:11434/api/tags

# Test CRM
curl http://10.0.0.2:3000/health

# Test monitoring
curl http://10.0.0.4:9090/-/healthy
```

---

## 🚀 Next Steps After Deployment

### Phase 1: Configure Services
1. **TwentyCRM**: Create users, import contacts
2. **n8n**: Import mortgage drip campaign workflows
3. **Grafana**: Configure dashboards and alerts
4. **Dify**: Set up borrower chat flows

### Phase 2: Deploy Frontend Applications
1. **RateHunter** (port 3100): Public mortgage rate site
2. **Nyra Admin** (port 3101): Internal operations dashboard

### Phase 3: Integrate External APIs
1. **freerateupdate.com**: Real-time mortgage rates
2. **lendingtree.com**: Lead acquisition webhooks
3. **Twilio**: SMS, voice, email campaigns
4. **SendGrid**: Email delivery

### Phase 4: Test End-to-End Workflows
1. Lead submission → TwentyCRM ingestion
2. Quote generation → Rate calculation
3. Campaign automation → Drip sequences
4. Borrower chat → Dify conversation
5. Compliance validation → Disclosure generation

---

## 📈 Performance Expectations

### Bootstrap Time
- **GUI-driven**: 30-45 minutes per PC
- **Script-driven**: 15-20 minutes per PC
- **Manual**: 2-4 hours total

### Service Startup Time
- **Orchestrator services**: 30-60 seconds
- **Worker services**: 60-120 seconds
- **Ollama model loading**: 5-10 minutes (first run)

### Response Times (after warmup)
- **Quote generation**: < 2 seconds (p95)
- **Health check**: < 5 seconds (all 22 services)
- **Nexus routing**: < 100ms
- **AgentDB search**: < 1ms (HNSW indexing)

### Resource Usage
- **PC1**: 8GB RAM, 20GB disk
- **PC2**: 16GB RAM, 50GB disk
- **PC3**: 32GB RAM, 100GB disk (models)
- **PC4**: 12GB RAM, 30GB disk

---

## 🔄 Maintenance Schedule

### Daily
- Automated backups (via `backup-daily.ps1`)
- Health checks (automated via cron/task scheduler)
- Log rotation (Docker handles automatically)

### Weekly
- Review Grafana dashboards for anomalies
- Check disk space usage
- Update Docker images: `docker compose pull && docker compose up -d`

### Monthly
- Test backup restoration procedure
- Review and rotate API keys
- Update system packages and drivers
- Performance optimization review

### Quarterly
- Disaster recovery drill
- Security audit
- Documentation review and updates
- Capacity planning assessment

---

## 📝 Changelog

### Version 1.0 (2026-01-13)
- ✅ Initial release
- ✅ Bootstrap GUI (Electron/React, 9-step wizard)
- ✅ 10 automation scripts (5 PS1 + 5 Bash)
- ✅ Docker Compose files (orchestrator + worker with profiles)
- ✅ Complete setup guide (7 phases, 2-4 hours)
- ✅ Master troubleshooting (100+ solutions)
- ✅ Claude Flow version comparison (V2 vs V3 vs CLI)
- ✅ Top 15 workflows catalog
- ✅ 221 environment variables template

---

## 📄 License

Project Nyra is proprietary software.
© 2026 RateHunter.net - All Rights Reserved

For licensing inquiries: licensing@ratehunter.net

---

## 🙏 Credits

**Project Lead**: Project Nyra Team
**Documentation**: Claude Code (Anthropic)
**Architecture**: Dual-orchestrator pattern (Claude Flow + Archon OS)
**Contributors**: [List TBD]

---

**Ready to get started?** → [QUICK-START.md](./QUICK-START.md)

**Need help?** → [MASTER-TROUBLESHOOTING.md](../docs/MASTER-TROUBLESHOOTING.md)

**Want to learn workflows?** → [TOP-15-CLAUDE-FLOW-WORKFLOWS.md](../docs/workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md)
