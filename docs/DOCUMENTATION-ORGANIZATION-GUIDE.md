# Documentation & Environment Organization Guide
**Project Nyra - Documentation Structure for AI Agents & Manual Setup**

---

## 📚 DOCUMENTATION ORGANIZATION

### Overview
Project Nyra maintains **51 documentation directories** organized by audience (AI vs Human) and purpose (guidance vs reference vs workflow).

---

## 🤖 **FOR AI AGENTS / CLAUDE** (Automated Context)

### `docs/ai-context/` - **PRIMARY AI GUIDANCE**
**Purpose:** High-level context and rules for AI agents working on Project Nyra

| File | Purpose | Use When |
|------|---------|----------|
| **THE-TRUTH.md** (27KB) | Complete project blueprint & vision | AI needs full context rebuild |
| **MCP-ASSISTANT-RULES.md** | MCP server development guidelines | Building/modifying MCP servers |
| **project-structure.md** | Repository layout and organization | Navigating codebase |
| **docs-overview.md** | Guide to documentation system | Finding specific docs |
| **handoff.md** | Context transfer between AI sessions | Resuming work |
| **deployment-infrastructure.md** | Infrastructure overview | Deployment tasks |
| **system-integration.md** | How components connect | Integration work |

**When to Use:** At start of every AI session for context-setting

---

### `docs/prompts/` - **AI WORKFLOW PROMPTS**
**Purpose:** Pre-written prompts for specific tasks

Contains specialized prompts for:
- SPARC methodology execution
- Multi-agent coordination
- Code generation workflows
- Testing automation
- Deployment procedures

**When to Use:** Invoke specific workflows (e.g., "/sparc tdd feature-name")

---

### `docs/sparc/` - **SPARC METHODOLOGY SPECS**
**Purpose:** Specification → Pseudocode → Architecture → Refinement → Completion

AI agents follow these specs for:
- Systematic development
- TDD workflows
- Multi-step feature implementation
- Code quality enforcement

---

### `docs/architecture/` - **SYSTEM DESIGN CONTEXT**
**Purpose:** 100+ architecture documents for AI understanding

Key files:
- **4PC-DISTRIBUTED-ARCHITECTURE.md** - Hardware layout
- **ARCHITECTURE-OVERVIEW.md** - High-level system design
- **LOCKED-DECISIONS.md** - Finalized tech choices (DO NOT CHANGE)
- **APPS-FOLDER-ARCHITECTURE.md** - Frontend structure
- **CONTAINERIZATION-ARCHITECTURE.md** - Docker/K8s setup

**When to Use:** Before making architectural changes

---

### `docs/development/` - **AI CODING STANDARDS**
**Purpose:** How AI should write code for this project

| File | Purpose |
|------|---------|
| **CLAUDE-MD-V3-TEMPLATE-GUIDE.md** | How to create CLAUDE.md files |
| **CLAUDE-MD-V2-VS-V3-ANALYSIS.md** | Migration guide for CLAUDE.md |

---

### `docs/workflows/` - **AUTOMATION SEQUENCES**
**Purpose:** Multi-step AI workflows for complex tasks

Pre-defined sequences for:
- Feature implementation (design → code → test → deploy)
- Bug fixes (reproduce → diagnose → patch → verify)
- Refactoring (analyze → plan → execute → validate)

---

## 👤 **FOR YOU (MANUAL STEPS)** (Cannot Be Automated)

### `docs/manual-tasks/` - **CRITICAL: YOUR ACTION ITEMS**
**Purpose:** Step-by-step checklists for tasks only you can do

| File | What You Need To Do | Priority |
|------|---------------------|----------|
| **PRODUCTION-READINESS-CHECKLIST.md** (114KB) | **THE MASTER LIST** - Everything to go live | ⚠️ **CRITICAL** |

This file contains:
- ✅ **Infrastructure Setup** (2-3 weeks)
  - Purchase ratehunter.net domain ($12-50/year)
  - Configure Cloudflare account ($20/month Pro)
  - Set up Cloudflare Pages deployment
  - Configure Cloudflare Tunnels for 4-PC cluster
  - Set up SSL certificates

- ✅ **Hardware Configuration** (3-5 days)
  - Configure Tailscale mesh network
  - Set up Wake-on-LAN for GPU workers
  - Configure static IPs for 4 PCs
  - Test inter-PC communication

- ✅ **External Service Setup** (1-2 weeks)
  - Create Supabase project (database)
  - Set up TwentyCRM account
  - Configure n8n workflows cloud
  - Register Flow Nexus account
  - Set up Infisical secrets management

- ✅ **Security & Compliance** (1-2 weeks)
  - Generate API keys (22+ services)
  - Set up 2FA for all accounts
  - Configure Bitwarden vault
  - Implement TILA/RESPA compliance checks

- ✅ **Testing & Validation** (1 week)
  - End-to-end lead-to-quote workflow test
  - Load testing (100 concurrent users)
  - Security penetration testing
  - Compliance validation

- ✅ **Go-Live Preparation** (3-5 days)
  - DNS cutover
  - Monitoring setup (Grafana/Prometheus)
  - Backup procedures
  - Disaster recovery plan

**Estimated Total Time:** **6-8 weeks** (full-time equivalent)

---

### `docs/user-setup-guidance/` - **YOUR SETUP INSTRUCTIONS**
**Purpose:** Post-consolidation configuration steps

| File | What It Covers |
|------|----------------|
| **POST-CONSOLIDATION-GUIDE.md** (53KB) | Complete setup after repo consolidation |
| **QUICK-REFERENCE.md** (5.7KB) | Common commands & troubleshooting |
| **README.md** | Overview of setup process |

---

### `docs/next-steps/` - **FUTURE ROADMAP**
**Purpose:** Features and improvements not yet implemented

AI reads this to understand:
- What's planned but not built
- What NOT to implement yet (waiting on dependencies)
- Future architecture changes

---

### `docs/setup-guides/` - **SERVICE-SPECIFIC SETUP**
**Purpose:** Individual service configuration instructions

You'll need to manually configure:
- Supabase (database schema, RLS policies)
- TwentyCRM (custom fields, workflows)
- Cloudflare (DNS, tunnels, Pages)
- GPU workers (Ollama models, CUDA setup)

---

## 📁 **REFERENCE DOCUMENTATION** (Both AI & You)

### Shared Documentation:

| Directory | Purpose | Primary Audience |
|-----------|---------|------------------|
| `docs/api/` | API contracts & examples | Both (AI generates, you test) |
| `docs/deployment/` | Deployment procedures | Both (AI automates, you verify) |
| `docs/compliance/` | Mortgage regulations | Both (AI enforces, you audit) |
| `docs/troubleshooting/` | Common issues & fixes | Both (AI suggests, you execute) |
| `docs/security/` | Security guidelines | Both (AI implements, you review) |
| `docs/performance/` | Optimization strategies | Both (AI measures, you tune) |

---

## 🔐 ENVIRONMENT VARIABLE ORGANIZATION

### **Root Directory .env Files**

| File | Purpose | When To Use |
|------|---------|-------------|
| **.env.master** (22KB) | **📖 DOCUMENTATION ONLY** - All possible variables with comments | Reference guide |
| **.env.optimal** (See below) | **⭐ RECOMMENDED** - Production-ready optimal config | **Use this one** |
| **.env.example** (15KB) | Template for new services | Copying to new projects |
| **.env.template** (8KB) | Minimal required variables | Quick setup |
| **.env** (19KB) | **🚫 ACTIVE - DO NOT EDIT** - Your current config | Runtime only |
| **.env.development** | Development-specific overrides | Local dev mode |
| **.env.production** | Production-specific overrides | Deployment |
| **.env.ci** | CI/CD pipeline variables | GitHub Actions |

---

### **Per-PC Environment Files**

#### Root Directory (Quick Access):
```bash
.env.orchestrator       # Area51 (orchestrator mini PC)
.env.worker-5090        # PC3 - RTX 5090 (primary GPU)
.env.worker-3090ti      # PC4 - RTX 3090 Ti (secondary GPU)
.env.worker-3060        # PC2 - RTX 3060 (coding tasks)
```

#### Organized in `configs/env/` (Recommended):
```bash
configs/env/.env.master.template      # 📖 63KB - COMPLETE DOCUMENTATION
configs/env/.env.optimal              # ⭐ 12KB - RECOMMENDED STARTING POINT
configs/env/.env.orchestrator-mini    # Area51 configuration
configs/env/.env.worker-rtx5090       # PC3 configuration
configs/env/.env.worker-rtx3090ti     # PC4 configuration
configs/env/.env.worker-rtx3060       # PC2 configuration
configs/env/.env.vault                # Secrets template (use with Infisical)
```

---

### **Which .env File Should You Use?**

#### **🎯 RECOMMENDED: `configs/env/.env.optimal`**

**Why this one?**
- ✅ Production-ready, security-hardened
- ✅ Performance-optimized for 4-PC cluster
- ✅ Based on current infrastructure analysis
- ✅ 12KB (manageable size)
- ✅ Generated 2026-01-18 (up-to-date)

**What it includes:**
```bash
# Core project settings
PROJECT_NAME=project-nyra
NODE_ENV=production
ENVIRONMENT=production

# GPU Workers (4-PC architecture)
GPU_WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
GPU_WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
GPU_WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434

# AI/LLM API Keys
ANTHROPIC_API_KEY=your-anthropic-key-here
GOOGLE_API_KEY=your-google-key-here
OPENROUTER_API_KEY=your-openrouter-key-here

# Nexus Router (LLM gateway)
NEXUS_ROUTER_ENABLED=true
NEXUS_ROUTER_PORT=7000
MODEL_ROUTING_STRATEGY=cost-optimized

# Memory Systems (5 total)
RUVECTOR_ENABLED=true
LETTA_ENABLED=true
GRAPHITI_ENABLED=true
MEM0_ENABLED=true
AGENTDB_ENABLED=true

# And 200+ more optimized variables...
```

---

### **📖 REFERENCE: `configs/env/.env.master.template`**

**Why you need this:**
- ✅ **Complete documentation** of all 300+ possible variables
- ✅ Detailed comments explaining each variable
- ✅ Grouped by system (memory, AI, infra, integrations)
- ✅ Security best practices noted
- ✅ 63KB comprehensive reference

**Don't use this directly** - it's a documentation reference. Copy specific sections to `.env.optimal` as needed.

---

### **Per-PC Specific Variables**

Each PC in your 4-PC cluster needs custom configuration:

#### **Area51 (Orchestrator Mini PC):**
```bash
# Use: configs/env/.env.orchestrator-mini
CLAUDE_FLOW_MODE=orchestrator
HOST_ROLE=orchestrator
GPU_ENABLED=false
OLLAMA_HOST=http://localhost:11434  # Routes to workers
SERVICES_TO_RUN=nexus,archon,twentycrm,n8n,dify
```

#### **PC2 - RTX 3060 (Code Tasks):**
```bash
# Use: configs/env/.env.worker-rtx3060
CLAUDE_FLOW_MODE=worker
HOST_ROLE=gpu-worker
GPU_TYPE=RTX_3060
GPU_VRAM=12GB
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=codellama:34b-q8,qwen2.5:32b-q8,gemma2:27b
WORKER_PRIORITY=3
WORKER_MAX_CONCURRENT=2
```

#### **PC3 - RTX 5090 (Large Models - PRIMARY):**
```bash
# Use: configs/env/.env.worker-rtx5090
CLAUDE_FLOW_MODE=worker
HOST_ROLE=gpu-worker-primary
GPU_TYPE=RTX_5090
GPU_VRAM=32GB
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=deepseek-r1:236b-q4,qwen2.5:72b-q8
WORKER_PRIORITY=1
WORKER_MAX_CONCURRENT=3
```

#### **PC4 - RTX 3090 Ti (Analysis - SECONDARY):**
```bash
# Use: configs/env/.env.worker-rtx3090ti
CLAUDE_FLOW_MODE=worker
HOST_ROLE=gpu-worker-secondary
GPU_TYPE=RTX_3090_TI
GPU_VRAM=24GB
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=llama3.1:70b-q4,mistral-large:123b-q4
WORKER_PRIORITY=2
WORKER_MAX_CONCURRENT=2
```

---

## 🚨 **CRITICAL: MISSING VALUES YOU MUST SET**

### **From MCP Validation Report (9 Missing Variables):**

#### **Critical (Required for core functionality):**
```bash
# Supabase (Database)
SUPABASE_ACCESS_TOKEN=your-token-here
# Get from: https://supabase.com/dashboard → Project Settings → API

# Infisical (Secrets Management)
INFISICAL_TOKEN=your-service-token-here
# Get from: https://app.infisical.com → Project Settings → Service Tokens
```

#### **Medium Priority (Cloud features):**
```bash
# Flow Nexus (Advanced MCP orchestration)
FLOW_NEXUS_API_URL=https://flow-nexus.ruv.io
FLOW_NEXUS_API_KEY=your-api-key
FLOW_NEXUS_USER_ID=your-user-id
# Register at: https://flow-nexus.ruv.io
# Or run: npx flow-nexus@latest register

# Epic SDK
EPIC_SDK_API_KEY=your-epic-key
```

#### **Low Priority (Optional):**
```bash
NYRA_REPO_ROOT=C:/Dev/Projects/Repos/Project-Nyra
CONTEXT7_API_KEY=your-context7-key
VERTEX_AI_PROJECT=your-gcp-project-id
DOCKER_HOST=unix:///var/run/docker.sock  # Default works fine
```

---

### **From Earlier Reports (7 Database Passwords):**

You mentioned 7 missing database passwords. These need to be set manually:

```bash
# PostgreSQL (Supabase)
DATABASE_URL=postgresql://user:PASSWORD@host:5432/db
POSTGRES_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32

# Redis (Caching)
REDIS_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32

# TwentyCRM Database
TWENTYCRM_DATABASE_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32

# Archon OS Database
ARCHON_DATABASE_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32

# Additional databases (if using)
LETTA_DATABASE_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32
GRAPHITI_DATABASE_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32
MEM0_DATABASE_PASSWORD=GENERATE_WITH_openssl_rand_-hex_32
```

**Generate secure passwords:**
```bash
# On Windows (PowerShell):
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# On Linux/Mac/WSL:
openssl rand -hex 32

# Or use Bitwarden password generator (recommended)
```

---

## 📋 **SETUP WORKFLOW: AI + YOU**

### **Phase 1: Environment Setup (YOU - Manual)**
1. ✅ Copy `configs/env/.env.optimal` to root as `.env`
2. ✅ Edit `.env` and replace all `your-*-here` placeholders
3. ✅ Generate 7+ database passwords (see above)
4. ✅ Set critical API keys (Anthropic, Google, OpenRouter)
5. ✅ Configure per-PC .env files (orchestrator + 3 workers)
6. ✅ Store secrets in Bitwarden or Infisical

**Estimated Time:** 2-4 hours

---

### **Phase 2: External Services (YOU - Manual)**
Follow `docs/manual-tasks/PRODUCTION-READINESS-CHECKLIST.md`:

1. ✅ Purchase ratehunter.net ($12-50)
2. ✅ Set up Cloudflare account ($20/month)
3. ✅ Create Supabase project (free tier OK for testing)
4. ✅ Register TwentyCRM account
5. ✅ Set up Tailscale mesh network (free for personal use)
6. ✅ Configure Cloudflare Tunnels

**Estimated Time:** 1-2 weeks (including waiting for DNS propagation, approvals, etc.)

---

### **Phase 3: Infrastructure Deployment (AI CAN HELP)**
You can ask Claude:
- "Deploy Docker services using docker-compose files"
- "Configure Supabase database schema"
- "Set up TwentyCRM custom fields"
- "Install Ollama models on GPU workers"
- "Test inter-PC communication"

**Estimated Time:** 3-5 days (with AI assistance)

---

### **Phase 4: Testing & Validation (AI CAN HELP)**
You can ask Claude:
- "Run end-to-end lead workflow test"
- "Verify all MCP servers are responding"
- "Check GPU worker load balancing"
- "Test failover from local to cloud LLMs"

**Estimated Time:** 1 week

---

## 🎯 **QUICK START CHECKLIST**

### **Right Now (15 minutes):**
- [ ] Copy `configs/env/.env.optimal` to `.env`
- [ ] Set `ANTHROPIC_API_KEY` (if you have one)
- [ ] Set `GOOGLE_API_KEY` (if you have one)
- [ ] Test: `npx @claude-flow/cli@3.0.0-alpha.104 doctor`

### **Today (2-4 hours):**
- [ ] Generate 7 database passwords
- [ ] Set all API keys in `.env`
- [ ] Create Supabase project (if not done)
- [ ] Set `SUPABASE_ACCESS_TOKEN`
- [ ] Read `docs/manual-tasks/PRODUCTION-READINESS-CHECKLIST.md`

### **This Week:**
- [ ] Purchase ratehunter.net domain
- [ ] Set up Cloudflare account
- [ ] Configure Tailscale mesh
- [ ] Deploy basic services (Docker Compose)

### **This Month:**
- [ ] Complete production readiness checklist
- [ ] Go live with RateHunter platform

---

## 📞 **WHEN TO ASK CLAUDE FOR HELP**

### **AI Can Do (Just Ask):**
- ✅ Generate Docker configs
- ✅ Write database migration scripts
- ✅ Create API integration code
- ✅ Set up monitoring dashboards
- ✅ Write tests and validation scripts
- ✅ Deploy services via Docker Compose
- ✅ Configure service mesh routing
- ✅ Optimize performance settings

### **You Must Do (AI Cannot):**
- ❌ Purchase domains/services
- ❌ Create external service accounts
- ❌ Generate actual API keys (AI can generate placeholders)
- ❌ Set passwords/secrets (security risk)
- ❌ Approve credit card charges
- ❌ Click "Accept Terms of Service"
- ❌ Verify email addresses
- ❌ Set up 2FA (requires your phone/authenticator)

---

## 📚 **KEY DOCUMENTATION FILES TO READ**

### **Must Read (You):**
1. **docs/manual-tasks/PRODUCTION-READINESS-CHECKLIST.md** - THE MASTER TODO LIST
2. **configs/env/.env.optimal** - Your starting .env file
3. **docs/user-setup-guidance/POST-CONSOLIDATION-GUIDE.md** - Setup walkthrough
4. **docs/ai-context/THE-TRUTH.md** - Project vision & architecture

### **Must Read (AI):**
1. **docs/ai-context/THE-TRUTH.md** - Complete context
2. **docs/ai-context/MCP-ASSISTANT-RULES.md** - Development guidelines
3. **docs/architecture/ARCHITECTURE-OVERVIEW.md** - System design
4. **CLAUDE.md** (root) - Project-wide Claude Code configuration

---

## 🚀 **NEXT STEPS**

**Immediate (Now):**
```bash
# 1. Copy optimal .env
cp configs/env/.env.optimal .env

# 2. Edit with your API keys
nano .env  # or your preferred editor

# 3. Test configuration
npx @claude-flow/cli@3.0.0-alpha.104 doctor
```

**Short-term (This Week):**
- Read: `docs/manual-tasks/PRODUCTION-READINESS-CHECKLIST.md`
- Execute: Infrastructure Setup section (domain, Cloudflare)
- Ask Claude: "Help me deploy Docker services"

**Long-term (This Month):**
- Complete production readiness checklist
- Go live with RateHunter platform
- Scale to production traffic

---

**Generated:** 2026-01-21
**Maintained by:** Claude Code + You
**Questions?** Ask Claude: "Help me with [specific setup task]"
