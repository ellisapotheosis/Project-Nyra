# 🚀 Project Nyra - Master Bootstrap Guide

> **AI-Powered Mortgage Automation Platform**
> Complete guide to bootstrap all components from zero to production

**Status**: ✅ Complete CI/CD Pipeline | 🎯 Production-Ready Infrastructure
**Architecture**: Dual-orchestrator (Claude Flow + Archon) | Multi-agent mesh topology
**Deployment**: Oracle Always Free ARM64 (4 vCPU) + Local GPU cluster

---

## 🎯 Quick Start Decision Tree

**Choose your path:**

```
┌─ 🏃 Fast Track (30 minutes)
│  ├─ Gitea + CI/CD only
│  └─ Jump to: Section 2 (Gitea Bootstrap)
│
├─ 🏗️ Full Infrastructure (2-4 hours)
│  ├─ Complete local + cloud setup
│  └─ Jump to: Section 1 (Prerequisites)
│
└─ 🧪 Development Focus (1 hour)
   ├─ Local dev stack only
   └─ Jump to: Section 5 (Development Stack)
```

---

## 📋 Section 1: Prerequisites & Environment Setup

### 1.1 System Requirements

**Minimum Requirements:**
- Ubuntu 20.04+ / Debian 11+ / macOS 12+ / Windows 11 (WSL2)
- 16GB RAM (32GB recommended for full stack)
- 100GB free disk space
- Docker + Docker Compose v2

**Optional GPU Requirements (Local LLM):**
- NVIDIA RTX 3060+ (12GB VRAM minimum)
- RTX 4090/5090 (48GB VRAM for DeepSeek-R1 236B)

### 1.2 Essential Dependencies

```bash
# 🔧 Core dependencies (all platforms)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo apt update && sudo apt install -y make git jq htop

# 🌐 Node.js 20+ (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20 && nvm use 20 && nvm alias default 20

# 🐍 Python 3.11+ (via pyenv)
curl https://pyenv.run | bash
pyenv install 3.11 && pyenv global 3.11

# ⚡ Bun (ultra-fast package manager)
curl -fsSL https://bun.sh/install | bash

# 🔐 Infisical (secrets management)
curl -1sLf https://artifacts-cli.infisical.com/setup.deb.sh | sudo bash
sudo apt-get update && sudo apt-get install -y infisical
```

### 1.3 Environment Configuration

**🗂️ Location**: `/` (project root)
**📝 Files**: `.env.template` (200+ variables), `.env.gitea`, `.env.oracle`

```bash
# Copy and customize base environment
cp .env.template .env
cp .env.template .env.local

# Generate secure secrets (all environments)
./infra/bootstrap/scripts/generate-secrets.sh
```

---

## 📋 Section 2: Gitea Bootstrap (Self-Hosted Git + CI/CD)

### 2.1 Quick Start (15 minutes)

**🗂️ Location**: `/infra/bootstrap/`
**📝 Guide**: `README.md` (400+ lines), `GITEA-SETUP-GUIDE.md`
**🔧 Scripts**: `ultimate-bootstrap.sh`

```bash
# 🚀 One-command Gitea setup
cd /home/ellisapotheosis/repos/project-nyra/infra/bootstrap
sudo ./ultimate-bootstrap.sh

# ✅ Verify installation
curl -f http://gitea.local:3100/api/healthz
docker ps | grep gitea  # Should show 3 containers

# 🔐 Initial admin setup
# Navigate to: http://gitea.local:3100
# Username: admin | Password: generated in script output
```

### 2.2 CI/CD Pipeline Setup (15 minutes)

**🗂️ Location**: `/.gitea/workflows/`
**📝 Workflows**: `test.yml`, `build.yml`, `deploy-staging.yml`, `deploy-production.yml`

```bash
# 1. Enable Gitea Actions (web interface)
# Admin Panel → Actions → Enable Actions ✓

# 2. Configure secrets (50+ required)
# Repository → Settings → Secrets
# Use: ./infra/bootstrap/scripts/generate-secrets.sh output

# 3. Test pipeline (push triggers full automation)
echo "# CI/CD test" >> README.md
git add . && git commit -m "feat: test CI/CD pipeline"
git push origin main
# → Auto-test → Auto-build → Auto-deploy staging ✨
```

**Pipeline Capabilities:**
- ✅ **Multi-architecture builds** (ARM64 + AMD64)
- ✅ **Auto-deploy staging** on main push
- ✅ **Manual production deploy** with backup/rollback
- ✅ **Security scanning** with Trivy
- ✅ **Health checks** and validation

---

## 📋 Section 3: Oracle Cloud Infrastructure

### 3.1 Oracle Always Free Setup

**🎯 Benefit**: **4 vCPU + 24GB RAM FREE** (vs 1 vCPU paid AMD64)
**🗂️ Location**: `/infra/oracle/`, `/environments/oracle-vps/`
**📝 Guide**: `/infra/bootstrap/README.md` (sections 4-6)

```bash
# 1. Oracle Cloud account + ARM64 instance
# Instance: VM.Standard.A1.Flex (4 OCPU, 24GB RAM)
# OS: Ubuntu 22.04 ARM64

# 2. Configure instance
scp .env.oracle ubuntu@oracle-ip:~/
ssh ubuntu@oracle-ip

# On Oracle instance:
curl -fsSL https://raw.githubusercontent.com/your-repo/infra/bootstrap/oracle-setup.sh | bash

# 3. Deploy with ARM64 containers
docker-compose -f docker-compose.oracle.yml up -d
```

**🌐 Networking:**
- **Cloudflare Tunnel**: Zero-config SSL + CDN
- **Oracle Security Lists**: Ports 80, 443, 22 only
- **DDoS Protection**: Cloudflare + Oracle native

---

## 📋 Section 4: Local LLM Infrastructure (GPU Workers)

### 4.1 Multi-GPU Cluster Setup

**🗂️ Location**: `/infra/images/`, `/services/nexus-router/`
**🎯 Models**: DeepSeek-R1 236B, Qwen 2.5 72B, CodeLlama 34B

```bash
# 1. NVIDIA drivers + CUDA (Ubuntu)
sudo apt update && sudo apt install -y nvidia-driver-535 nvidia-cuda-toolkit
sudo reboot

# 2. NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
    sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
    sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo nvidia-ctk runtime configure --runtime=docker
sudo systemctl restart docker

# 3. Deploy LLM stack
make llm-cluster-up  # Starts Ollama + LiteLLM + Nexus Router
```

**🧠 Model Distribution:**
```bash
# RTX 5090 (48GB) - Complex reasoning
docker exec ollama ollama pull deepseek-r1:236b

# RTX 3090 (24GB) - General purpose
docker exec ollama ollama pull qwen2.5:72b

# RTX 3060 (12GB) - Code + embeddings
docker exec ollama ollama pull codellama:34b
```

---

## 📋 Section 5: Development Stack Components

### 5.1 Core Services Architecture

| Service | Location | Port | Purpose |
|---------|----------|------|---------|
| **Nexus Router** | `/services/nexus-router/` | 6000 | LLM gateway + routing |
| **TwentyCRM** | `/apps/twenty-crm/` | 3021 | Lead management |
| **n8n Workflows** | `/services/n8n/` | 5678 | Campaign automation |
| **PostgreSQL** | `docker-compose.yml` | 5432 | Primary database |
| **Redis** | `docker-compose.yml` | 6379 | Caching + sessions |
| **Grafana** | `/infra/monitoring/` | 3005 | Observability |

### 5.2 Quick Development Setup

```bash
# 🚀 Start core services (5 minutes)
make dev-up  # Docker Compose with hot-reload

# 🧪 Start individual components
make twenty-up    # TwentyCRM + PostgreSQL
make n8n-up       # Workflow automation
make monitor-up   # Grafana + Prometheus

# 🔍 Health check all services
make health-check
# ✅ All services → http://localhost:3000/health

# 🛠️ Development tools
make pgadmin-up      # Database admin (5050)
make redis-ui-up     # Redis browser (8081)
make mailhog-up      # Email testing (8025)
```

---

## 📋 Section 6: Claude Flow Dashboard & Multi-Agent System

### 6.1 Claude Flow Dashboard Setup

**🗂️ Location**: `/apps/archon-os-dashboard/`
**📋 Features**: Operations monitoring, agent coordination, workflow visualization
**🆚 Version**: v3.0.0-alpha.1 (recovered from archive)

```bash
# Install dependencies
cd /apps/archon-os-dashboard/
npm install  # React 18 + TypeScript + Zustand

# Configure environment
cp .env.example .env.local
# Add: NEXT_PUBLIC_API_URL=http://localhost:6000

# Start development server
npm run dev  # → http://localhost:3010

# Production build
npm run build && npm run start  # → http://localhost:3010
```

**Dashboard Components:**
- **Agent Grid**: Real-time agent status and metrics
- **Workflow Canvas**: Visual pipeline builder
- **Memory Analytics**: Scoped assistant memory and workflow insights
- **Performance Metrics**: Latency, cost, success rates
- **Model Router**: LLM selection and routing logic

### 6.2 Multi-Agent Orchestration

**🧠 Architecture**: Mesh topology (peer-to-peer) vs Hierarchical (controlled)
**🔧 Memory**: Archon context + selected assistant memory + Mem0

```bash
# Memory system setup
npx @archon-os/cli@latest memory init --force --backend hybrid

# Start background agents
npx @archon-os/cli@latest daemon start

# System health check
npx @archon-os/cli@latest doctor --fix
```

---

## 📋 Section 7: TwentyCRM Integration

### 7.1 TwentyCRM Setup

**🗂️ Location**: `/apps/twenty-crm/`
**📋 Features**: Lead pipeline, contact management, mortgage workflow

```bash
# Full TwentyCRM setup (10 minutes)
cd /apps/twenty-crm/
npm install && npm run setup  # Automated setup script

# Database setup with mortgage schema
make twenty-db-init  # Creates tables + seed data

# Start development server
npm run dev  # → http://localhost:3021

# MCP Server integration
make twenty-mcp-up   # → http://localhost:3022/mcp
```

**Integration Points:**
- **Nexus Router**: LLM-powered lead scoring
- **n8n Workflows**: Automated follow-ups
- **PostgreSQL**: Shared borrower data
- **Claude Flow**: Multi-agent mortgage processing

---

## 📋 Section 8: Memory System Integration

### 8.1 Cross-PC Memory Persistence

**🗂️ Location**: `/.claude/memory/`
**📋 Files**: `memory.db`, `MEMORY.md`

```bash
# Memory is now stored in repo for cross-PC sync
ls .claude/memory/
# memory.db - main storage
# MEMORY.md - context file (auto-loaded)

# Environment variables set:
export MEMORY_BACKEND=hybrid
export MEMORY_PRIMARY_STORE=letta
export MEMORY_SECONDARY_STORE=mem0
```

**Memory Backend Configuration:**
- **Primary**: Letta (`.letta/` directory, in repo)
- **Secondary**: mem0 (cloud sync for cross-PC)
- **Hybrid**: Both systems active for redundancy

---

## 📋 Section 9: Advanced Components & Integrations

### 9.1 OpenClaw/MoltBot Integration

**🗂️ Location**: `/services/openclaw/`, `/archive/moltbot/`
**🎯 Purpose**: Autonomous operations, mem0 memory integration

```bash
# OpenClaw setup (Python + FastAPI)
cd /services/openclaw/
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# mem0 memory integration
export MEM0_API_KEY=m0-...  # From mem0.ai
python -m openclaw.memory.setup  # Initialize memory backend

# Start OpenClaw service
python -m openclaw.main  # → http://localhost:8001
```

### 9.2 Agentic-Jujutsu Version Control (Evaluation)

**🗂️ Location**: `/tools/agentic-jujutsu/` (if beneficial)
**🎯 Features**: Quantum-resistant VCS, AI-native branching

**Evaluation Results**: ⚠️ **Optional/Advanced**
- **Pros**: Advanced conflict resolution, AI commit analysis, quantum-safe cryptography
- **Cons**: Early stage, complex integration, Git workflow disruption
- **Recommendation**: Skip for initial deployment, revisit in Phase 2

### 9.3 Archon OS Integration

**🗂️ Location**: `/infra/images/archon/`, `/tools/archon/`
**🎯 Purpose**: Task execution layer, Claude Flow coordination
**📋 Status**: Ready for immediate deployment

```bash
# Archon deployment (containerized)
cd /infra/images/archon/
docker-compose -f docker-compose.archon.yml up -d

# Integration with Claude Flow
export ARCHON_API_URL=http://localhost:7001
export CLAUDE_FLOW_ARCHON_BRIDGE=enabled

# Health check
curl http://localhost:7001/health
```

---

## 📋 Section 10: Shared Libraries & Consolidation

### 10.1 n8n Shared Library

**🗂️ Location**: `/apps/shared/n8n-shared/`
**📋 Contents**: 40+ workflows, configurations, examples consolidated from scattered locations

```bash
# n8n workflows organized by category:
ls /apps/shared/n8n-shared/
# workflows/mortgage/   - Mortgage-specific flows
# workflows/general/    - Reusable patterns
# configs/             - Environment configurations
# examples/            - Template workflows
# docs/               - Integration documentation
```

### 10.2 Component Bootstrap Paths

**Individual Component Setup:**

| Component | Bootstrap Script | Location | Time |
|-----------|------------------|----------|------|
| **Gitea** | `ultimate-bootstrap.sh` | `/infra/bootstrap/` | 15 min |
| **TwentyCRM** | `npm run setup` | `/apps/twenty-crm/` | 10 min |
| **Claude Flow** | `npm run dev` | `/apps/archon-os-dashboard/` | 5 min |
| **OpenClaw** | `python -m openclaw.main` | `/services/openclaw/` | 5 min |
| **n8n** | `make n8n-up` | Root directory | 5 min |
| **Nexus Router** | `make nexus-up` | Root directory | 5 min |
| **Oracle VPS** | `docker-compose -f oracle.yml up` | `/environments/oracle-vps/` | 20 min |

---

## 📋 Section 11: Phase 2 Implementation

### 11.1 Infrastructure Catchup (Automatic)

**🗂️ Location**: `/infra/REPO-CATCHUP.md`
**📋 Status**: 87+ improvements identified across 4 phases

**Automatic Implementation:**
- Environment standardization (✅ Complete)
- Bootstrap script consolidation (✅ Complete)
- Docker Compose standardization (✅ Complete)
- CI/CD automation (✅ Complete)

**Requires User Decision:**
- Agentic-Jujutsu integration (Optional)
- Service mesh configuration (Istio vs Linkerd)
- Advanced security features (zero-trust networking)

### 11.2 Multi-Architecture CI/CD

**🎯 Benefit**: Oracle ARM64 = 4x compute power (FREE vs paid AMD64)
**📝 Implementation**: Complete automated pipeline

**Supported Architectures:**
- **AMD64**: Traditional x86_64 (Intel/AMD)
- **ARM64**: Apple Silicon, Oracle Always Free, AWS Graviton

**Build Strategy**: Docker Buildx with QEMU emulation
- Transparent to developers
- Automatic multi-platform image creation
- Registry supports both architectures

---

## 📋 Section 12: Production Deployment

### 12.1 Oracle VPS Production

**🌐 Domain**: `prod.nyra.internal` (Cloudflare managed)
**🗂️ Location**: `/environments/production/`

```bash
# 1. Secure production secrets
infisical run --env=production -- ./deploy/production.sh

# 2. Deploy with zero-downtime
git push origin main  # Triggers staging deployment
# Manual production trigger in Gitea Actions

# 3. Health validation
curl https://prod.nyra.internal/health
curl https://api.nyra.internal/v1/health

# 4. Rollback (if needed)
make production-rollback BACKUP_ID=20260310-120000
```

### 12.2 Multi-Environment Management

```bash
# Environment switching
export ENVIRONMENT=staging|production|oracle-vps
make deploy ENV=$ENVIRONMENT

# Configuration validation
make validate-env ENV=production  # Checks secrets, connectivity

# Backup management
make backup-create ENV=production  # Pre-deployment backup
make backup-restore BACKUP_ID=... ENV=production  # Emergency restore
```

---

## 📋 Section 13: Troubleshooting & Maintenance

### 13.1 Common Issues

| Issue | Solution | Location |
|-------|----------|----------|
| **Gitea containers not starting** | `docker-compose restart` | `/infra/bootstrap/` |
| **Oracle ARM builds failing** | Check QEMU emulation | `.gitea/workflows/build.yml` |
| **TwentyCRM database errors** | `make twenty-db-reset` | `/apps/twenty-crm/` |
| **Memory persistence issues** | Verify mount points | `.claude/memory/` |
| **Claude Flow dashboard 404** | Check build status | `/apps/archon-os-dashboard/` |

### 13.2 Health Checks

```bash
# Full system health
make health-check-all

# Individual component health
curl http://localhost:6000/health  # Nexus Router
curl http://localhost:3021/health  # TwentyCRM
curl http://localhost:5678/health  # n8n
curl http://localhost:3010/health  # Claude Flow Dashboard

# Database connectivity
psql $POSTGRES_URL -c "SELECT 1;"  # PostgreSQL
redis-cli -u $REDIS_URL ping       # Redis
```

---

## 🎯 Quick Reference Commands

### Essential Make Targets

```bash
# Core services
make dev-up          # Start development stack
make prod-up         # Start production stack
make health-check    # Verify all services

# Individual components
make gitea-up        # Self-hosted Git + CI/CD
make twenty-up       # TwentyCRM + PostgreSQL
make llm-cluster-up  # Local LLM inference
make monitor-up      # Grafana + Prometheus

# Development tools
make pgadmin-up      # Database management
make redis-ui-up     # Redis browser
make mailhog-up      # Email testing

# Maintenance
make backup-create   # Backup databases
make logs-follow     # Follow all logs
make clean-all       # Remove all containers
```

---

## 🎉 Success Metrics

**After successful bootstrap, you should have:**

✅ **Gitea CI/CD**: Push-to-deploy automation with multi-arch builds
✅ **Oracle ARM64**: 4 vCPU production infrastructure (FREE)
✅ **Claude Flow Dashboard**: v3.0.0-alpha.1 operational
✅ **TwentyCRM**: Complete lead management and mortgage pipeline
✅ **Multi-Agent System**: Claude Flow + Archon orchestration
✅ **Memory Persistence**: Cross-PC sync via `.claude/memory/`
✅ **n8n Shared Library**: 40+ workflows consolidated
✅ **Security**: Secrets automation + compliance validation
✅ **Development**: Hot-reload, debugging tools, test automation

**Performance Targets:**
- **AI Inference**: <2s response time (local LLM)
- **API Latency**: <100ms for database queries
- **Deployment**: <5 minutes zero-downtime production deploy
- **Cost**: 90% reduction via local inference + Oracle Always Free

---

## 🔗 Additional Resources

**Bootstrap Documentation:**
- [Bootstrap Guide](/infra/bootstrap/README.md) - Comprehensive 400+ line setup
- [Gitea Setup](/infra/bootstrap/GITEA-SETUP-GUIDE.md) - Step-by-step CI/CD
- [Phase 2 Summary](/infra/bootstrap/PHASE2-COMPLETION-SUMMARY.md) - CI/CD completion
- [Repository Catchup](/infra/REPO-CATCHUP.md) - 87+ improvements roadmap

**Architecture Documentation:**
- [Whitepaper](/ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md)
- [SPARC Workflows](/ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md)
- [Compliance Guide](/ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/COMPLIANCE_GUARDRAILS.md)

**Component Guides:**
- [Claude Flow Integration](/.claude/CAPABILITIES.md)
- [TwentyCRM Configuration](/apps/twenty-crm/README.md) (when created)
- [n8n Shared Library](/apps/shared/n8n-shared/README.md) (when created)

---

**🎯 Ready to build the future of mortgage automation!**

**Recommended Next Steps:**
1. **Start with Gitea** (Section 2) for immediate CI/CD automation
2. **Add Oracle VPS** (Section 3) for free production infrastructure
3. **Deploy Claude Flow Dashboard** (Section 6) for operations visibility
4. **Integrate TwentyCRM** (Section 7) for lead management
5. **Scale with GPU cluster** (Section 4) for local LLM inference

**Need help?** Check troubleshooting section or review component-specific documentation.
