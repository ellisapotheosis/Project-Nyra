# Project Nyra - Parallel Workflow Split

**Created**: 2026-01-12
**Purpose**: Split consolidation workflows (user-run) from main development orchestration (Claude-run)

## 🔄 Two Parallel Tracks

### Track A: Consolidation Workflows (YOU RUN IN SEPARATE PWSH)
**Location**: `bootstrap/.archived/CDesktop-files/CD-Bootstrap/mnt/user-data/outputs/consolidation-kit/`
**Goal**: Organize and consolidate all bootstrap materials from multiple locations

### Track B: Main Development (I ORCHESTRATE)
**Location**: Root project directory + services + apps
**Goal**: Implement Project Nyra features following BOOTSTRAP-WORKFLOW.md

---

## 📋 Track A: Your Consolidation Workflow

### What You'll Run (Separate PowerShell Terminal)

```powershell
# Navigate to consolidation kit
cd "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\.archived\CDesktop-files\CD-Bootstrap\mnt\user-data\outputs\consolidation-kit"

# Step 1: Analysis (SAFE - Read-only)
.\01-ANALYZE.ps1 -Verbose

# Review the report
notepad analysis-report.md

# Step 2: Consolidation (Creates backups first)
.\02-CONSOLIDATE.ps1 -Backup -Verbose

# Step 3: GUI Installer (Optional - for 4-PC setup later)
# .\03-GUI-INSTALLER.ps1
```

### What This Does

**01-ANALYZE.ps1**:
- Scans all bootstrap material locations
- Identifies duplicate files
- Detects conflicts (same file, different content)
- Creates detailed report
- **Makes ZERO changes** to files

**02-CONSOLIDATE.ps1**:
- Creates timestamped backups
- Merges files from three sources:
  1. Your repo bootstrap (highest priority - never overwritten)
  2. All-in-one kit (`C:\Users\edane\Downloads\nyra-bootstrap-allinone-kit`)
  3. New Claude files (`C:\Users\edane\Downloads\newclaudefiles`)
- Organizes into structured directories (configs/, scripts/, templates/, docker/, etc.)
- Resolves conflicts intelligently

**03-GUI-INSTALLER.ps1**:
- 4-PC GUI installer (for Phase 3 - Week 13+)
- Use when ready to deploy to distributed 4-PC architecture
- Deferred until after single-machine MVP proves valuable

### Timeline for Track A

- **Step 1 (Analysis)**: 15-30 minutes
- **Step 2 (Consolidation)**: 30 minutes
- **Step 3 (GUI Installer)**: Deferred to Phase 3

### Safety Features

- Analysis is completely read-only
- Consolidation creates automatic backups
- Your existing repo files NEVER overwritten (highest priority)
- Confirmation prompts before major changes
- Can cancel at any time
- Undo instructions generated

---

## 🚀 Track B: My Main Development Orchestration

### What I'll Orchestrate (Following BOOTSTRAP-WORKFLOW.md)

I'll follow the Week 1-12 MVP approach, NOT the 4-PC distributed approach (that comes in Phase 3).

### Phase 1: Foundation (Weeks 1-4)

#### Week 1: Repository Setup
- [x] Initialize monorepo (DONE)
- [x] Install core dependencies (DONE)
- [x] Setup workspace structure (DONE)
- [ ] Initialize Infisical for secrets management
- [ ] Verify all workspace packages resolve correctly

#### Week 2: Core Services Deployment
- [ ] Create `docker-compose.dev.yml` with:
  - PostgreSQL (shared by Dify, TwentyCRM, Letta, n8n)
  - Redis (for Dify, n8n, Activepieces)
  - Neo4j (for Graphiti)
  - Qdrant (vector database)
  - Dify (AI chat interface)
  - n8n (workflow automation)
  - TwentyCRM
- [ ] Start all services: `docker-compose -f docker-compose.dev.yml up -d`
- [ ] Verify health endpoints

#### Week 3: Nexus Router + Memory Setup
- [ ] Install Nexus Router (@grafbase/nexus)
- [ ] Configure Nexus with MCP servers:
  - Letta memory MCP server
  - TwentyCRM MCP server
- [ ] Setup Graphiti with Neo4j backend
- [ ] Install and configure Letta server (port 8283)
- [ ] Test memory persistence

#### Week 4: Quote API + First Workflow
- [ ] Create FastAPI Quote Engine (already exists - validate)
- [ ] Integrate with Rocket Mortgage API (real data)
- [ ] Create first n8n workflow:
  - Webhook trigger (from freerateupdate.com)
  - TwentyCRM Create Contact
  - Dify Chat (send welcome message)
  - n8n Set (tag lead as "new")
- [ ] Test end-to-end: webhook → CRM → chat

### Phase 2: Mortgage Features (Weeks 5-12)

#### Week 5-6: Lead Drip Campaigns
- [ ] Install Activepieces (Docker)
- [ ] Create 5-day campaign YAML (already exists - validate)
- [ ] Create n8n workflow for campaign orchestration (already exists - validate)
- [ ] Create 3 Activepieces workflows (SMS, Email, Voicemail) (already exists - validate)
- [ ] Test campaign with test lead

#### Week 7-8: Chatbot + Dify Integration
- [ ] Create "Mortgage Assistant" agent in Dify
- [ ] Configure tools:
  - Quote Calculator (calls FastAPI)
  - Document Upload (saves to TwentyCRM)
  - Schedule Call (updates n8n calendar)
- [ ] Embed DifyChatWidget in webapp
- [ ] Test chatbot conversations

#### Week 9-10: Quote Engine Integration
- [ ] Integrate Rocket Mortgage API (real quotes)
- [ ] Add LenderPrice API integration
- [ ] Add 2-3 more lender APIs
- [ ] Update FastAPI to return real data
- [ ] Test quote generation with real parameters

#### Week 11-12: TwentyCRM Customization
- [ ] Add mortgage-specific fields:
  - loan_amount
  - pre_approval_status
  - loan_officer_id
  - property_value
  - credit_score
- [ ] Create webhook handlers:
  - Lead status change → Trigger drip campaign
  - Document uploaded → Notify loan officer
- [ ] Customize TwentyCRM UI for mortgage workflow

### Phase 3: Advanced Features (Weeks 13-20) - DEFERRED

This phase includes:
- Memory system integration (Letta + Graphiti)
- Claude Flow orchestration (multi-agent coordination)
- Landing page (ratehunter.net)
- Production deployment
- **4-PC distributed setup** (use GUI installer from Track A)

**Why deferred**: Build MVP on single machine first, validate with real workflows, THEN scale horizontally.

---

## 🎯 Critical Rules

### DO NOT (From BOOTSTRAP-WORKFLOW.md):
- ❌ Fork claude-flow or archon-mcp (use npm packages)
- ❌ Build 4-PC distributed system in Phase 1
- ❌ Try to integrate every memory system
- ❌ Create custom orchestration before validating core features

### DO:
- ✅ Use locked stack (Nexus + Dify + n8n + Activepieces + TwentyCRM)
- ✅ Build MVP on single machine first
- ✅ Validate with real mortgage workflows
- ✅ Scale horizontally only after proven

### The #1 Rule:
**Build features that make you money FIRST.**

Everything else is technical debt until you have:
- ✅ Leads flowing in
- ✅ Drip campaigns sending
- ✅ Quotes generating
- ✅ Deals closing

---

## 📊 Progress Tracking

### Track A Progress (Your Consolidation)
- [ ] 01-ANALYZE.ps1 completed
- [ ] analysis-report.md reviewed
- [ ] 02-CONSOLIDATE.ps1 completed
- [ ] Backups verified
- [ ] Consolidated structure reviewed

### Track B Progress (My Development)
- [ ] Phase 1 - Week 1 (Repository Setup)
- [ ] Phase 1 - Week 2 (Core Services Deployment)
- [ ] Phase 1 - Week 3 (Nexus Router + Memory)
- [ ] Phase 1 - Week 4 (Quote API + First Workflow)
- [ ] Phase 2 - Week 5-6 (Lead Drip Campaigns)
- [ ] Phase 2 - Week 7-8 (Chatbot + Dify)
- [ ] Phase 2 - Week 9-10 (Quote Engine Integration)
- [ ] Phase 2 - Week 11-12 (TwentyCRM Customization)

---

## 🔄 How We Work in Parallel

### Your Terminal (Track A)
```powershell
# Terminal 1: Consolidation
cd bootstrap/.archived/CDesktop-files/CD-Bootstrap/mnt/user-data/outputs/consolidation-kit
.\01-ANALYZE.ps1 -Verbose
# Review report...
.\02-CONSOLIDATE.ps1 -Backup -Verbose
```

### My Orchestration (Track B)
```bash
# I work on main development
cd C:\Dev\Projects\Repos\Project-Nyra

# Week 2: Deploy core services
docker-compose -f docker-compose.dev.yml up -d

# Week 3: Configure Nexus Router
pnpm --filter @nyra/routing build

# Week 4: Create first n8n workflow
# (Open n8n at localhost:5678 and configure)
```

### Communication Points
- You run consolidation steps at your pace
- I proceed with development following BOOTSTRAP-WORKFLOW.md
- When you finish consolidation, the organized bootstrap materials will be ready for Phase 3 (4-PC deployment)
- No conflicts - completely separate tracks

---

## ✅ Success Criteria

### Track A Success (Your Consolidation)
- [x] All bootstrap materials analyzed
- [x] Conflicts identified and resolved
- [x] Files organized into structured directories
- [x] Backups created and verified
- [x] Ready for 4-PC deployment (Phase 3)

### Track B Success (My Development)
**Phase 1 Complete When:**
- [ ] All services running in Docker
- [ ] Can create lead in TwentyCRM
- [ ] Can get quote from FastAPI
- [ ] Dify chatbot responds

**Phase 2 Complete When:**
- [ ] Lead drip campaign sends 3+ touchpoints
- [ ] Chatbot can schedule calls
- [ ] Quote engine returns real data from 2+ providers
- [ ] TwentyCRM shows pipeline movement

---

## 🚦 Ready to Start?

### Your Next Step (Track A):
```powershell
cd "C:\Dev\Projects\Repos\Project-Nyra\bootstrap\.archived\CDesktop-files\CD-Bootstrap\mnt\user-data\outputs\consolidation-kit"
.\01-ANALYZE.ps1 -Verbose
```

### My Next Step (Track B):
- [ ] Start with Phase 1 - Week 1: Verify repository setup and dependencies
- [ ] Initialize Infisical for secrets management
- [ ] Create initial todo list for Week 1-2 tasks

---

**Let's build this!** 🚀
