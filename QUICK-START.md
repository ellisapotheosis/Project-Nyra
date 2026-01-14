# Project Nyra - Quick Start Guide

**Updated**: 2026-01-12
**Following**: BOOTSTRAP-WORKFLOW.md Week 1-2

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose installed
- pnpm installed (`npm install -g pnpm`)
- Git configured
- Infisical CLI installed (optional, for secrets management)

### Step 1: Environment Configuration

The `.env` file is already configured! Just verify these key settings:

```bash
# Check your API keys are set
grep "ANTHROPIC_API_KEY" .env
grep "OPENROUTER_API_KEY" .env

# If blank, add your keys:
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-v1-...
```

### Step 2: Start All Services

```bash
# Start entire stack (databases, memory systems, workflow tools, CRM)
pnpm run docker:up

# Or manually:
docker-compose -f infra/docker-compose.dev.yml up -d

# Watch logs:
docker-compose -f infra/docker-compose.dev.yml logs -f
```

This starts **20+ services**:
- **Databases**: PostgreSQL, Redis, Qdrant, FalkorDB
- **LLM Infrastructure**: LiteLLM, Nexus Router
- **Workflow Automation**: n8n, Activepieces, Dify
- **CRM**: TwentyCRM
- **Memory Systems**: Letta, Graphiti MCP, Mem0 MCP
- **Monitoring**: Prometheus, Loki, Grafana

### Step 3: Verify Services Are Running

```bash
# Check all containers are healthy
docker-compose -f infra/docker-compose.dev.yml ps

# Expected output: All services showing "Up" status
```

### Step 4: Access Service UIs

Once all services are running, open these URLs:

| Service | URL | Credentials |
|---------|-----|-------------|
| **n8n** (Workflows) | http://localhost:5678 | admin / admin |
| **Dify** (AI Chat) | http://localhost:3001 | Set up on first visit |
| **Activepieces** (Automation) | http://localhost:3002 | Set up on first visit |
| **TwentyCRM** | http://localhost:3010 | Set up on first visit |
| **Grafana** (Monitoring) | http://localhost:3000 | admin / admin |
| **Prometheus** | http://localhost:9090 | No auth |
| **Letta** (Memory) | http://localhost:8283 | API access |
| **LiteLLM** (Proxy) | http://localhost:4000 | API access |
| **Nexus Router** | http://localhost:7000 | API access |

---

## 📋 Current Development Phase

### ✅ Phase 1 - Week 1: Repository Setup (COMPLETE)
- [x] Monorepo initialized with pnpm workspaces
- [x] Core dependencies installed
- [x] Workspace structure organized (apps/, services/, packages/)
- [x] Infisical configured for secrets management
- [x] Environment variables configured (.env)

### ✅ Phase 1 - Week 2: Core Services Deployment (COMPLETE)
- [x] Docker Compose with all core services created
- [x] PostgreSQL with multiple databases (dify, twenty, letta, n8n, litellm)
- [x] Redis for caching
- [x] Qdrant for vector storage
- [x] FalkorDB for knowledge graphs
- [x] LiteLLM for LLM proxy
- [x] Nexus Router for intelligent routing
- [x] n8n for workflow automation
- [x] Activepieces for message delivery
- [x] Dify for AI chat interface
- [x] TwentyCRM for lead management
- [x] Letta for memory management
- [x] Graphiti & Mem0 MCP servers
- [x] Prometheus + Grafana + Loki for monitoring

### 🔄 Phase 1 - Week 3: Nexus Router + Memory Setup (NEXT)
- [ ] Install @grafbase/nexus npm package
- [ ] Configure Nexus MCP servers (Letta, TwentyCRM)
- [ ] Setup Graphiti with FalkorDB backend
- [ ] Test memory persistence
- [ ] Configure intelligent request routing

### 📅 Phase 1 - Week 4: Quote API + First Workflow
- [ ] Validate existing Quote Engine (FastAPI)
- [ ] Integrate Rocket Mortgage API
- [ ] Create first n8n workflow: webhook → CRM → chat
- [ ] Test end-to-end lead capture flow

---

## 🎯 Working in Parallel

### Track A: Your Consolidation Workflow (Separate Terminal)

You can run the consolidation workflows in parallel:

```powershell
# In a separate PowerShell terminal:
cd "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\.archived\CDesktop-files\CD-Bootstrap\mnt\user-data\outputs\consolidation-kit"

# Step 1: Analysis (read-only, safe)
.\01-ANALYZE.ps1 -Verbose

# Review the report
notepad analysis-report.md

# Step 2: Consolidation (creates backups first)
.\02-CONSOLIDATE.ps1 -Backup -Verbose
```

See `PARALLEL-WORKFLOW-SPLIT.md` for complete details.

### Track B: Main Development (Claude Orchestrates)

I'm following the BOOTSTRAP-WORKFLOW.md plan:
- ✅ Week 1-2: Repository & Services (DONE)
- 🔄 Week 3-4: Nexus + Memory + First Workflow (IN PROGRESS)
- 📅 Week 5-12: Mortgage Features (PLANNED)

---

## 🔧 Common Commands

### Docker Management

```bash
# Start all services
pnpm run docker:up

# Stop all services (keeps data)
pnpm run docker:down

# Stop and remove all data (DESTRUCTIVE)
docker-compose -f infra/docker-compose.dev.yml down -v

# Restart a specific service
docker-compose -f infra/docker-compose.dev.yml restart n8n

# View logs for a specific service
docker-compose -f infra/docker-compose.dev.yml logs -f dify-api

# Check service health
docker-compose -f infra/docker-compose.dev.yml ps
```

### Development

```bash
# Install all workspace dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

### Database Management

```bash
# Open Prisma Studio
pnpm run db:studio

# Generate Prisma client
pnpm run db:generate

# Run database migrations
pnpm run db:migrate
```

---

## 🆘 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose -f infra/docker-compose.dev.yml logs [service-name]

# Common issues:
# 1. Port already in use
#    Solution: Stop conflicting service or change port in .env
#
# 2. Out of disk space
#    Solution: docker system prune -a --volumes
#
# 3. Memory limit reached
#    Solution: Increase Docker Desktop memory limit
```

### Services Are Slow

```bash
# Check container resource usage
docker stats

# If PostgreSQL is slow:
docker-compose -f infra/docker-compose.dev.yml restart postgres

# If Redis is slow:
docker-compose -f infra/docker-compose.dev.yml restart redis
```

### Need to Reset Everything

```bash
# Nuclear option: Remove everything and start fresh
docker-compose -f infra/docker-compose.dev.yml down -v
docker system prune -a --volumes -f
pnpm run docker:up
```

---

## 📚 Next Steps

1. **Verify All Services Running**
   ```bash
   docker-compose -f infra/docker-compose.dev.yml ps
   # All services should show "Up (healthy)"
   ```

2. **Access Service UIs**
   - Open http://localhost:5678 (n8n)
   - Open http://localhost:3010 (TwentyCRM)
   - Open http://localhost:3001 (Dify)
   - Set up accounts on first visit

3. **Week 3: Configure Nexus Router**
   - Install @grafbase/nexus
   - Configure MCP servers
   - Test intelligent routing

4. **Week 4: Create First Workflow**
   - Design webhook → CRM → chat flow in n8n
   - Test with sample lead data
   - Verify TwentyCRM receives contacts

---

## 🎓 Understanding the Stack

### Single Machine MVP First
Following BOOTSTRAP-WORKFLOW.md guidance:
- ✅ Build MVP on single machine (orchestrator PC)
- ✅ Validate with real workflows
- ❌ NOT building 4-PC distributed yet (that's Phase 3, Week 13+)

### The #1 Rule
**Build features that make you money FIRST.**

Until you have:
- Leads flowing in
- Drip campaigns sending
- Quotes generating
- Deals closing

Everything else is technical debt.

---

## 📖 Additional Documentation

- `PARALLEL-WORKFLOW-SPLIT.md` - Parallel workflow split guide
- `BOOTSTRAP-WORKFLOW.md` - Full 12-week development plan
- `MASTER-EXECUTION-PLAN.md` - Original project roadmap
- `.env` - Environment variables (already configured)
- `infra/docker-compose.dev.yml` - Service definitions

Ready to build! 🚀
