# Repository Consolidation Master Plan

**Version:** 1.0.0
**Created:** 2026-01-16
**Status:** Draft
**Author:** System Architecture Team

## Executive Summary

This document outlines a comprehensive strategy to consolidate Project Nyra's repository structure by:
- **Merging 14 `nyra-*` prefixed folders** (90MB total) into their modern counterparts
- **Organizing 16 root-level scripts** by PC type (orchestrator/worker) under `infra/`
- **Relocating 1 status report** from root to `docs/reports/`
- **Eliminating duplication** and establishing a clean monorepo structure
- **Enabling Turborepo optimization** through proper workspace organization

**Expected Benefits:**
- 🎯 Clear, maintainable folder structure
- 🚀 30-50% faster Turborepo builds (better caching)
- 📦 Reduced repository size (eliminate duplicates)
- 🔍 Improved discoverability (logical organization)
- 🛡️ Preserved git history (using `git mv`)

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Target Architecture](#2-target-architecture)
3. [Consolidation Mapping](#3-consolidation-mapping)
4. [Migration Strategy](#4-migration-strategy)
5. [Risk Assessment](#5-risk-assessment)
6. [Validation Checklist](#6-validation-checklist)
7. [Rollback Plan](#7-rollback-plan)
8. [Timeline](#8-timeline)

---

## 1. Current State Analysis

### 1.1 Repository Overview

**Total Size:** ~94MB (excluding node_modules)
**Root-Level Items:** 52 folders, 30+ files
**Workspace Packages:** 8+ apps, 3+ services, 5+ packages
**Git Status:** Active development with staged and unstaged changes

### 1.2 Problematic Structure

#### A. 14 `nyra-*` Prefixed Folders (90MB Total)

| Folder | Size | Contents | Status |
|--------|------|----------|--------|
| `nyra-voice` | 50M | ElevenLabs integration, VoicemodAPI | Active |
| `nyra-orchestration` | 19M | Multi-agent frameworks (a2a, autogen2, anthropic-agents-sdk) | Active |
| `nyra-mcp` | 14M | MCP servers, channels, infrastructure setup | Active |
| `nyra-core` | 4.8M | Codanna + Serena core libraries | **Critical** |
| `nyra-scripts` | 2.4M | PowerShell scripts (codex, metamcp integration) | Active |
| `nyra-webapp` | 2.3M | Web apps (Dyad, CRM, front-end), intake-form.html | Active |
| `nyra-memory` | 689K | Memory system clients, deployment configs | Active |
| `nyra-infra` | 560K | Docker configs, MCP-Servers, metamcp-gateway | Active |
| `nyra-docs` | 105K | Documentation (to merge with /docs) | Archive |
| ~~`nyra-tools`~~ | ~~78K~~ | ✅ **CONSOLIDATED** → `tools/nyra-scaffold/` | ✅ Complete |
| `nyra-stack` | 68K | Docker compose stack files (.env.example, compose configs) | Active |
| `nyra-src` | 24K | Source artifacts (mortgage-campaign-agents, Secrets-Management) | Archive |
| `nyra-configs` | 17K | Configuration files | Archive |
| `nyra-ingestion` | 0 | Empty folder | **Delete** |

**Total:** ~90MB across 14 folders

#### B. 16 Root-Level Scripts

| Category | Files | Destination |
|----------|-------|-------------|
| **Claude Flow** | archon-os.bat, archon-os.ps1, archon-os.cmd, start-archon-os.ps1 | infra/scripts/orchestrator/ |
| **Setup Scripts** | setup-autonomous.sh, setup-memory-stack.ps1, START-AUTONOMOUS-SETUP.bat | infra/scripts/setup/ |
| **Deployment** | deploy-nyra-cluster.ps1 | infra/scripts/deployment/ |

**Additional Root Files to Relocate:**
- `STATUS-archon-os-DOCKER.md` → `docs/reports/`
- `batch-config.json` → `config/`
- `claude-dump.txt` → `_archive/`
- `EXTRACTION-STATUS.txt` → `_archive/`

#### C. Duplicate Folder Pairs

| `nyra-*` Folder | Existing Counterpart | Consolidation Action |
|-----------------|----------------------|----------------------|
| `nyra-core/` | `core/` | **Merge** - Combine Codanna + Serena |
| `nyra-infra/` | `infra/` | **Merge** - Infrastructure configs |
| `nyra-mcp/` | `mcp-servers/` | **Merge** - MCP implementations |
| `nyra-orchestration/` | `orchestration/` | **Merge** - Multi-agent frameworks |
| `nyra-memory/` | `memory/` | **Merge** - Memory system |
| `nyra-docs/` | `docs/` | **Merge** - Documentation |
| `nyra-webapp/` | `apps/` | **Merge** - Web applications |
| ~~`nyra-tools/`~~ | `tools/nyra-scaffold/` | ✅ **Complete** - Developer scaffold |
| `nyra-configs/` | `config/` or `configs/` | **Merge** - Consolidate config folders |
| `nyra-src/` | `src/` | **Merge** - Source code |
| `nyra-stack/` | `infra/docker/` | **Merge** - Docker compose stacks |
| `nyra-scripts/` | `infra/scripts/` | **Organize by PC** |
| `nyra-ingestion/` | N/A | **Delete** (empty) |
| `nyra-voice/` | `services/voice-api/` or `apps/voice-integration/` | **Create new service** |

### 1.3 Current Workspace Structure

**pnpm Workspaces (pnpm-workspace.yaml):**
```yaml
packages:
  - apps/*
  - services/*
  - mcp-servers/*
  - packages/*
  - submodules/archon-os
  - submodules/archon
```

**Turborepo Tasks (turbo.json):**
- ✅ Build pipeline configured
- ✅ Dev mode with caching
- ✅ Test orchestration
- ❌ Not optimized for clean structure

### 1.4 Git Status at Time of Analysis

**Branch:** main
**Staged Changes:** Multiple file relocations (docs/* reorganization)
**Untracked Files:**
- `STATUS-archon-os-DOCKER.md`
- `bootstrap/configs/`, `bootstrap/windows/`, `bootstrap/wsl/`
- `docs/deployment/DOCKER-STATUS-REPORT.md`, `docs/deployment/MCP-STATUS-REPORT.md`

**Recent Commits:**
- Consolidation efforts (bootstrap, React GUI installer)
- Documentation reorganization
- Infrastructure updates

### 1.5 Key Issues Identified

1. **Duplication:** 14 `nyra-*` folders duplicate existing structure
2. **Discoverability:** Hard to find files (scattered across 50+ root folders)
3. **Build Performance:** Turborepo caching suboptimal due to messy structure
4. **Onboarding:** New developers confused by dual folder structure
5. **CI/CD:** Complex path patterns required for workflows
6. **Git History:** Risk of losing history if not migrated properly

---

## 2. Target Architecture

### 2.1 Modern Monorepo Design Principles

**Reference Architecture:** Turborepo + pnpm workspaces best practices

**Core Principles:**
1. **Clear Boundaries** - Apps, services, packages clearly separated
2. **Workspace Organization** - Each workspace is independently buildable
3. **Shared Code** - Common packages in `/packages`
4. **Infrastructure Separation** - All infra code in `/infra`
5. **Documentation Consolidation** - Single source of truth in `/docs`
6. **Tool Isolation** - Development tools in `/tools`

### 2.2 Target Folder Structure

```
Project-Nyra/
├── .github/                    # GitHub Actions workflows, templates
├── .archon-os/               # Claude Flow training data, sessions
├── apps/                       # 🎯 USER-FACING APPLICATIONS (8+ apps)
│   ├── ratehunter/            # Rate comparison landing page
│   ├── nyra-admin/            # Admin dashboard
│   ├── crm/                   # Customer relationship management
│   ├── crm-dashboard/         # Analytics dashboard
│   ├── nexus-dashboard/       # System monitoring
│   ├── webapp/                # Main web application
│   ├── voice-integration/     # 🆕 Voice UI (from nyra-voice)
│   └── [other apps]/
│
├── services/                   # 🎯 BACKEND MICROSERVICES (5+ services)
│   ├── quote-api/             # Quote calculation engine (Python FastAPI)
│   ├── voice-api/             # 🆕 Voice service backend (ElevenLabs)
│   ├── document-processor/    # 🆕 Document OCR/classification
│   ├── campaign-engine/       # 🆕 Campaign automation
│   └── [other services]/
│
├── packages/                   # 🎯 SHARED LIBRARIES (10+ packages)
│   ├── database/              # Prisma schema, migrations
│   ├── ui-components/         # Shared React components
│   ├── api-client/            # API SDK
│   ├── config/                # Shared configuration utilities
│   ├── types/                 # Shared TypeScript types
│   └── [other packages]/
│
├── mcp-servers/               # 🎯 MCP SERVER IMPLEMENTATIONS
│   ├── archon-os/           # Claude Flow MCP server
│   ├── ruv-swarm/             # Swarm coordination MCP
│   ├── [consolidated from nyra-mcp/]
│   └── [other MCP servers]/
│
├── orchestration/             # 🎯 MULTI-AGENT ORCHESTRATION
│   ├── archon-os/           # Claude Flow framework
│   ├── archon/                # Archon OS framework
│   ├── a2a/                   # 🆕 Agent-to-agent (from nyra-orchestration)
│   ├── autogen2/              # 🆕 AutoGen v2 (from nyra-orchestration)
│   ├── anthropic-agents-sdk/  # 🆕 Anthropic SDK (from nyra-orchestration)
│   └── [consolidated]/
│
├── core/                      # 🎯 CORE LIBRARIES
│   ├── codanna/               # 🆕 Codanna core (from nyra-core)
│   ├── serena/                # 🆕 Serena AI core (from nyra-core)
│   ├── [consolidated src]/
│   └── [other core libs]/
│
├── memory/                    # 🎯 MEMORY SYSTEMS
│   ├── ruvector/               # ruvector integration
│   ├── letta/                 # Letta memory system
│   ├── clients/               # 🆕 Memory clients (from nyra-memory)
│   ├── deployment/            # 🆕 Deployment configs (from nyra-memory)
│   └── [consolidated]/
│
├── infra/                     # 🎯 INFRASTRUCTURE AS CODE
│   ├── docker/                # Docker configurations
│   │   ├── compose/           # 🆕 Compose files (from nyra-stack)
│   │   ├── orchestrator/      # 🆕 Orchestrator PC configs (from nyra-infra)
│   │   ├── worker/            # 🆕 Worker PC configs (from nyra-infra)
│   │   └── [consolidated]/
│   ├── kubernetes/            # K8s manifests (future)
│   ├── terraform/             # Terraform IaC (future)
│   ├── scripts/               # 🎯 ORGANIZED BY PC TYPE
│   │   ├── orchestrator/      # Scripts for orchestrator PC
│   │   │   ├── archon-os.ps1
│   │   │   ├── start-archon-os.ps1
│   │   │   └── [other orchestrator scripts]
│   │   ├── worker/            # Scripts for worker PCs
│   │   │   └── [worker-specific scripts]
│   │   ├── setup/             # Setup and installation scripts
│   │   │   ├── setup-autonomous.sh
│   │   │   ├── setup-memory-stack.ps1
│   │   │   └── START-AUTONOMOUS-SETUP.bat
│   │   ├── deployment/        # Deployment scripts
│   │   │   └── deploy-nyra-cluster.ps1
│   │   └── shared/            # Shared utility scripts
│   └── [consolidated infra]/
│
├── tools/                     # 🎯 DEVELOPER TOOLS
│   ├── archon-os/             # Archon OS tooling
│   ├── nyra-scaffold/         # ✅ VSCode profiles, agent definitions (consolidated Jan 2026)
│   └── [other tools]/
│
├── config/                    # 🎯 CONFIGURATION (CONSOLIDATED)
│   ├── claude-configs/        # Claude Flow configurations
│   ├── [from nyra-configs/]
│   ├── batch-config.json      # 🆕 (from root)
│   └── [consolidated configs]/
│
├── docs/                      # 🎯 DOCUMENTATION (CONSOLIDATED)
│   ├── architecture/          # Architecture docs
│   │   └── REPO-CONSOLIDATION-MASTER-PLAN.md (this file)
│   ├── deployment/            # Deployment guides
│   ├── guides/                # User guides
│   ├── reports/               # Status reports
│   │   └── STATUS-archon-os-DOCKER.md (from root)
│   ├── [from nyra-docs/]
│   └── [consolidated docs]/
│
├── bootstrap/                 # Bootstrap installer system
│   ├── installer/             # React GUI installer
│   ├── configs/               # Configuration templates
│   ├── windows/               # Windows-specific installers
│   └── wsl/                   # WSL-specific installers
│
├── scripts/                   # Build and automation scripts (monorepo-level)
│   ├── testing/               # Test orchestration
│   ├── deployment/            # CI/CD scripts
│   └── utilities/             # Developer utilities
│
├── submodules/                # Git submodules
│   ├── archon-os/           # Claude Flow v3 (external)
│   └── archon/                # Archon framework (external)
│
├── _archive/                  # Archived files
│   ├── claude-dump.txt        # 🆕 (from root)
│   ├── EXTRACTION-STATUS.txt  # 🆕 (from root)
│   └── [old files]/
│
├── _backup/                   # Temporary backups
│
└── [root files]               # Essential root files only
    ├── package.json           # Monorepo root package.json
    ├── pnpm-workspace.yaml    # Workspace configuration
    ├── turbo.json             # Turborepo configuration
    ├── CLAUDE.md              # Master orchestration guide
    ├── README.md              # Project overview
    ├── .gitignore
    ├── .gitmodules
    └── [essential config files]
```

### 2.3 Workspace Configuration Changes

**Updated pnpm-workspace.yaml:**
```yaml
packages:
  - apps/*
  - services/*
  - packages/*
  - mcp-servers/*
  - orchestration/*
  - core/*
  - memory/*
  - tools/*
  # Submodules (if needed as workspaces)
  - submodules/archon-os
  - submodules/archon
```

**Key Changes:**
- ✅ Added `orchestration/*` workspace
- ✅ Added `core/*` workspace
- ✅ Added `memory/*` workspace
- ✅ Added `tools/*` workspace

### 2.4 Benefits of Target Architecture

| Benefit | Impact | Metric |
|---------|--------|--------|
| **Build Speed** | 30-50% faster Turborepo builds | Cache hit rate improvement |
| **Discoverability** | Easier to find files | Developer survey (qualitative) |
| **Onboarding** | Faster ramp-up for new devs | Time to first contribution |
| **CI/CD** | Simpler GitHub Actions workflows | Lines of YAML reduced |
| **Maintainability** | Clear ownership boundaries | Reduced cross-team conflicts |
| **Repository Size** | Eliminate duplicates | 10-20% size reduction |

---

## 3. Consolidation Mapping

### 3.1 Folder-by-Folder Consolidation Map

#### Phase 1: Critical Core Libraries

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-core/codanna/` | `core/codanna/` | `git mv` | 🔴 Critical | Core mortgage processing |
| `nyra-core/serena/` | `core/serena/` | `git mv` | 🔴 Critical | AI assistant core |
| `nyra-core/src/` | `core/legacy-src/` or `src/` | `git mv` | 🟡 Medium | Review for relevance |

**Rationale:** Core libraries are used by multiple workspaces. Must be done first.

#### Phase 2: Infrastructure & Scripts

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-infra/docker/` | `infra/docker/orchestrator/` | `git mv` | 🔴 Critical | Docker configs |
| `nyra-infra/MCP-Servers/` | `mcp-servers/legacy/` | `git mv` | 🟡 Medium | Review and merge |
| `nyra-infra/metamcp-gateway/` | `mcp-servers/metamcp-gateway/` | `git mv` | 🟡 Medium | MCP gateway |
| `nyra-stack/*.yml` | `infra/docker/compose/` | `git mv` | 🟡 Medium | Compose files |
| `nyra-stack/configs/` | `config/stack/` | `git mv` | 🟢 Low | Stack configs |
| `nyra-scripts/**/*.ps1` | `infra/scripts/orchestrator/` | `git mv` | 🟡 Medium | PowerShell scripts |
| `nyra-scripts/**/*.sh` | `infra/scripts/shared/` | `git mv` | 🟡 Medium | Bash scripts |

**Root Scripts:**
| Source | Destination | Action |
|--------|-------------|--------|
| `archon-os.bat` | `infra/scripts/orchestrator/archon-os.bat` | `git mv` |
| `archon-os.ps1` | `infra/scripts/orchestrator/archon-os.ps1` | `git mv` |
| `archon-os.cmd` | `infra/scripts/orchestrator/archon-os.cmd` | `git mv` |
| `start-archon-os.ps1` | `infra/scripts/orchestrator/start-archon-os.ps1` | `git mv` |
| `setup-autonomous.sh` | `infra/scripts/setup/setup-autonomous.sh` | `git mv` |
| `setup-memory-stack.ps1` | `infra/scripts/setup/setup-memory-stack.ps1` | `git mv` |
| `START-AUTONOMOUS-SETUP.bat` | `infra/scripts/setup/START-AUTONOMOUS-SETUP.bat` | `git mv` |
| `deploy-nyra-cluster.ps1` | `infra/scripts/deployment/deploy-nyra-cluster.ps1` | `git mv` |

#### Phase 3: Orchestration & Memory

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-orchestration/a2a/` | `orchestration/a2a/` | `git mv` | 🟡 Medium | Agent-to-agent |
| `nyra-orchestration/autogen2/` | `orchestration/autogen2/` | `git mv` | 🟡 Medium | AutoGen framework |
| `nyra-orchestration/anthropic-agents-sdk/` | `orchestration/anthropic-agents-sdk/` | `git mv` | 🟡 Medium | Anthropic SDK |
| `nyra-orchestration/archon/` | `orchestration/archon-legacy/` | `git mv` | 🟢 Low | Review vs submodule |
| `nyra-mcp/servers/` | `mcp-servers/` | `git mv` (merge) | 🟡 Medium | MCP implementations |
| `nyra-mcp/channels/` | `mcp-servers/channels/` | `git mv` | 🟡 Medium | MCP channels |
| `nyra-memory/clients/` | `memory/clients/` | `git mv` | 🟡 Medium | Memory clients |
| `nyra-memory/deployment/` | `memory/deployment/` | `git mv` | 🟡 Medium | Deployment configs |
| `nyra-memory/infra/` | `infra/docker/memory/` | `git mv` | 🟡 Medium | Memory infra |

#### Phase 4: Applications & Services

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-webapp/nyra-CRM/` | `apps/crm-legacy/` or merge with `apps/crm/` | `git mv` | 🟡 Medium | Deduplicate CRM |
| `nyra-webapp/nyra-front-end/` | `apps/webapp-v1/` or merge | `git mv` | 🟡 Medium | Review vs `apps/webapp` |
| `nyra-webapp/Dyad/` | `apps/dyad/` or `packages/dyad/` | `git mv` | 🟢 Low | Determine if app or lib |
| `nyra-webapp/intake-form.html` | `apps/webapp/public/intake-form.html` | `git mv` | 🟢 Low | Static asset |
| `nyra-voice/` | `services/voice-api/` | `git mv` | 🟡 Medium | Create new service |
| `nyra-voice/Nyra-VoicemodAPI/` | `services/voice-api/voicemod-integration/` | `git mv` | 🟡 Medium | Voice integration |

#### Phase 5: Tools & Configuration

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| ~~`nyra-tools/nyra-vscode-and-scaffold/`~~ | `tools/nyra-scaffold/` | ✅ `git mv` | ✅ Done | Developer tools |
| `nyra-configs/**` | `config/legacy/` or merge with `config/` | `git mv` | 🟢 Low | Review relevance |
| `batch-config.json` | `config/batch-config.json` | `git mv` | 🟢 Low | Root → config |

#### Phase 6: Documentation & Archive

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-docs/**` | `docs/legacy/` or merge | `git mv` | 🟢 Low | Review for duplicates |
| `nyra-src/**` | `src/` or `_archive/nyra-src/` | `git mv` | 🟢 Low | Archive if obsolete |
| `STATUS-archon-os-DOCKER.md` | `docs/reports/STATUS-archon-os-DOCKER.md` | `git mv` | 🟢 Low | Relocate report |
| `claude-dump.txt` | `_archive/claude-dump.txt` | `git mv` | 🟢 Low | Archive dump |
| `EXTRACTION-STATUS.txt` | `_archive/EXTRACTION-STATUS.txt` | `git mv` | 🟢 Low | Archive status |

#### Phase 7: Cleanup

| Source | Destination | Action | Priority | Notes |
|--------|-------------|--------|----------|-------|
| `nyra-ingestion/` | N/A | `git rm -r` | 🟢 Low | Empty folder - delete |
| `configs/` vs `config/` | Consolidate into `config/` | Merge | 🟡 Medium | Eliminate duplication |

### 3.2 Import Path Updates Required

**Critical Files to Update:**

1. **TypeScript/JavaScript Imports:**
   - Search: `from '@/nyra-core'` → Replace: `from '@/core'`
   - Search: `from '../nyra-mcp'` → Replace: `from '../mcp-servers'`
   - Update `tsconfig.json` path aliases

2. **Docker Compose References:**
   - Update volume mounts in `docker-compose*.yml`
   - Update build contexts for services
   - Update `.env` file references

3. **GitHub Actions Workflows:**
   - Update paths in `.github/workflows/*.yml`
   - Update artifact paths
   - Update test coverage paths

4. **Documentation Links:**
   - Search and replace all markdown links to moved files
   - Update README.md references
   - Update CLAUDE.md component guide index

5. **Configuration Files:**
   - Update `turbo.json` if workspace paths change
   - Update `.gitignore` patterns
   - Update `jest.config.js` paths
   - Update `eslint.config.js` paths

### 3.3 Automated Migration Scripts

**Script 1: Consolidate Core (`scripts/consolidation/01-consolidate-core.sh`)**
```bash
#!/bin/bash
set -e

echo "Phase 1: Consolidating nyra-core..."

# Ensure destination exists
mkdir -p core

# Move Codanna
if [ -d "nyra-core/codanna" ]; then
  git mv nyra-core/codanna core/codanna
  echo "✓ Moved nyra-core/codanna → core/codanna"
fi

# Move Serena
if [ -d "nyra-core/serena" ]; then
  git mv nyra-core/serena core/serena
  echo "✓ Moved nyra-core/serena → core/serena"
fi

# Move src (if not empty)
if [ -d "nyra-core/src" ] && [ "$(ls -A nyra-core/src)" ]; then
  git mv nyra-core/src core/legacy-src
  echo "✓ Moved nyra-core/src → core/legacy-src"
fi

# Remove empty nyra-core folder
if [ -d "nyra-core" ] && [ ! "$(ls -A nyra-core)" ]; then
  git rm -r nyra-core
  echo "✓ Removed empty nyra-core folder"
fi

echo "Phase 1 complete!"
```

**Script 2: Consolidate Infrastructure (`scripts/consolidation/02-consolidate-infra.sh`)**
```bash
#!/bin/bash
set -e

echo "Phase 2: Consolidating infrastructure..."

# Create destination directories
mkdir -p infra/docker/orchestrator
mkdir -p infra/docker/worker
mkdir -p infra/docker/compose
mkdir -p infra/scripts/{orchestrator,worker,setup,deployment,shared}

# Move nyra-infra docker configs
if [ -d "nyra-infra/docker" ]; then
  git mv nyra-infra/docker/* infra/docker/orchestrator/ || true
fi

# Move nyra-stack compose files
if [ -d "nyra-stack" ]; then
  git mv nyra-stack/*.yml infra/docker/compose/ || true
  git mv nyra-stack/*.yaml infra/docker/compose/ || true
  git mv nyra-stack/.env.example infra/docker/compose/.env.example || true
fi

# Move root scripts
git mv archon-os.bat infra/scripts/orchestrator/ || true
git mv archon-os.ps1 infra/scripts/orchestrator/ || true
git mv archon-os.cmd infra/scripts/orchestrator/ || true
git mv start-archon-os.ps1 infra/scripts/orchestrator/ || true
git mv setup-autonomous.sh infra/scripts/setup/ || true
git mv setup-memory-stack.ps1 infra/scripts/setup/ || true
git mv START-AUTONOMOUS-SETUP.bat infra/scripts/setup/ || true
git mv deploy-nyra-cluster.ps1 infra/scripts/deployment/ || true

echo "Phase 2 complete!"
```

**Script 3: Consolidate Orchestration (`scripts/consolidation/03-consolidate-orchestration.sh`)**
```bash
#!/bin/bash
set -e

echo "Phase 3: Consolidating orchestration..."

mkdir -p orchestration

# Move orchestration frameworks
[ -d "nyra-orchestration/a2a" ] && git mv nyra-orchestration/a2a orchestration/
[ -d "nyra-orchestration/autogen2" ] && git mv nyra-orchestration/autogen2 orchestration/
[ -d "nyra-orchestration/anthropic-agents-sdk" ] && git mv nyra-orchestration/anthropic-agents-sdk orchestration/

# Consolidate MCP servers
mkdir -p mcp-servers
[ -d "nyra-mcp/servers" ] && git mv nyra-mcp/servers/* mcp-servers/ || true
[ -d "nyra-mcp/channels" ] && git mv nyra-mcp/channels mcp-servers/

# Consolidate memory
mkdir -p memory
[ -d "nyra-memory/clients" ] && git mv nyra-memory/clients memory/
[ -d "nyra-memory/deployment" ] && git mv nyra-memory/deployment memory/

echo "Phase 3 complete!"
```

**Script 4: Update Import Paths (`scripts/consolidation/04-update-imports.sh`)**
```bash
#!/bin/bash
set -e

echo "Phase 4: Updating import paths..."

# Find and replace TypeScript/JavaScript imports
find apps services packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|from.*nyra-core|from "@/core"|g' {} +
find apps services packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -exec sed -i 's|from.*nyra-mcp|from "@/mcp-servers"|g' {} +

# Update Docker Compose references
find infra -name "docker-compose*.yml" -exec sed -i 's|nyra-infra/|infra/|g' {} +
find infra -name "docker-compose*.yml" -exec sed -i 's|nyra-stack/|infra/docker/compose/|g' {} +

# Update documentation links
find docs -name "*.md" -exec sed -i 's|](../nyra-|](../|g' {} +

echo "Phase 4 complete!"
```

**Script 5: Cleanup Empty Folders (`scripts/consolidation/05-cleanup.sh`)**
```bash
#!/bin/bash
set -e

echo "Phase 5: Cleaning up empty folders..."

# Remove empty nyra-* folders
for dir in nyra-*; do
  if [ -d "$dir" ] && [ ! "$(ls -A $dir)" ]; then
    git rm -r "$dir"
    echo "✓ Removed empty folder: $dir"
  fi
done

# Remove nyra-ingestion (confirmed empty)
[ -d "nyra-ingestion" ] && git rm -r nyra-ingestion

echo "Phase 5 complete!"
```

---

## 4. Migration Strategy

### 4.1 Migration Phases

**Phase 0: Preparation (1 day)**
1. Create consolidation branch: `git checkout -b consolidation/nyra-monorepo-20260116`
2. Create full backup: `bash scripts/consolidation/00-backup.sh`
3. Document current state: `git status > docs/reports/pre-consolidation-status.txt`
4. Run automated analysis: `bash scripts/consolidation/00-analyze.sh`
5. Review and approve migration plan with team

**Phase 1: Critical Core Libraries (Day 1)**
- Execute: `bash scripts/consolidation/01-consolidate-core.sh`
- Update imports in dependent packages
- Test builds: `pnpm build --filter=@nyra/core`
- Verify no broken imports
- Commit: `git commit -m "consolidate: Merge nyra-core into core/"`

**Phase 2: Infrastructure & Scripts (Day 1-2)**
- Execute: `bash scripts/consolidation/02-consolidate-infra.sh`
- Update Docker Compose file references
- Update CI/CD workflow paths
- Test Docker builds: `docker compose -f infra/docker/compose/docker-compose.yml config`
- Commit: `git commit -m "consolidate: Merge nyra-infra, nyra-stack, root scripts into infra/"`

**Phase 3: Orchestration & Memory (Day 2)**
- Execute: `bash scripts/consolidation/03-consolidate-orchestration.sh`
- Update workspace paths in `pnpm-workspace.yaml`
- Test orchestration imports
- Commit: `git commit -m "consolidate: Merge nyra-orchestration, nyra-mcp, nyra-memory"`

**Phase 4: Applications & Services (Day 2-3)**
- Consolidate `nyra-webapp` apps
- Create `services/voice-api` from `nyra-voice`
- Update app imports and configs
- Test app builds: `pnpm build --filter=./apps/*`
- Commit: `git commit -m "consolidate: Merge nyra-webapp, nyra-voice into apps/services"`

**Phase 5: Tools & Configuration (Day 3)**
- Consolidate `nyra-tools`, `nyra-configs`
- Move root config files
- Update tool paths
- Commit: `git commit -m "consolidate: Merge nyra-tools, nyra-configs, root configs"`

**Phase 6: Documentation & Archive (Day 3)**
- Consolidate `nyra-docs`
- Move status reports from root
- Archive obsolete files
- Commit: `git commit -m "consolidate: Merge nyra-docs, archive obsolete files"`

**Phase 7: Import Path Updates (Day 3-4)**
- Execute: `bash scripts/consolidation/04-update-imports.sh`
- Manual review of automated changes
- Fix any broken imports
- Commit: `git commit -m "consolidate: Update all import paths and references"`

**Phase 8: Cleanup (Day 4)**
- Execute: `bash scripts/consolidation/05-cleanup.sh`
- Remove empty `nyra-*` folders
- Consolidate duplicate `config/` vs `configs/`
- Commit: `git commit -m "consolidate: Remove empty folders and finalize structure"`

**Phase 9: Validation (Day 4-5)**
- Run full test suite: `pnpm test:all`
- Build all packages: `pnpm build`
- Test Docker orchestration: `pnpm infra:up && pnpm health:check`
- Run linters: `pnpm lint`
- Manual smoke tests of critical paths
- Generate validation report

**Phase 10: Merge & Deploy (Day 5)**
- Create pull request: `consolidation/nyra-monorepo-20260116 → main`
- Team review (all stakeholders)
- Address feedback
- Merge to main
- Monitor CI/CD pipelines
- Deploy to staging environment

### 4.2 Git Commands for History Preservation

**Why `git mv` is Critical:**
```bash
# ❌ WRONG - Loses git history
rm -rf nyra-core
cp -r new-structure core/
git add -A

# ✅ CORRECT - Preserves git history
git mv nyra-core/codanna core/codanna
git mv nyra-core/serena core/serena
```

**Verifying History Preservation:**
```bash
# After git mv, check that history is preserved
git log --follow core/codanna/src/main.ts
# Should show full history including when it was in nyra-core/
```

### 4.3 Testing Strategy

**Level 1: Unit Tests**
```bash
pnpm test:unit
# Verify all packages build and test successfully
```

**Level 2: Integration Tests**
```bash
pnpm test:integration
# Verify services communicate correctly
```

**Level 3: Build Validation**
```bash
pnpm clean && pnpm install && pnpm build
# Verify Turborepo caching works
# Expected: >50% cache hit rate after rebuild
```

**Level 4: Docker Orchestration**
```bash
pnpm infra:up
pnpm health:check
# Verify all services start successfully
```

**Level 5: End-to-End Tests**
```bash
pnpm test:e2e
# Verify user workflows work end-to-end
```

---

## 5. Risk Assessment

### 5.1 Risk Matrix

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Git history loss** | Low | Critical | Use `git mv`, verify with `git log --follow` | DevOps Lead |
| **Broken imports** | Medium | High | Automated search/replace + manual review | Tech Lead |
| **CI/CD pipeline failure** | Medium | High | Update workflows in parallel, test in branch | DevOps Lead |
| **Docker build failure** | Medium | Medium | Update compose files, test locally first | Infrastructure Lead |
| **Team disruption** | High | Low | Clear communication, phased rollout | Project Manager |
| **Lost files** | Very Low | Critical | Full backup before migration, git branch | All |
| **Merge conflicts** | Medium | Medium | Coordinate with active PRs, pause dev briefly | Tech Lead |
| **Performance regression** | Low | Medium | Benchmark before/after, monitor metrics | Performance Team |

### 5.2 Detailed Risk Analysis

#### Risk 1: Git History Loss

**Description:** If we use `rm` and `cp` instead of `git mv`, we lose the ability to track file history with `git blame` and `git log`.

**Impact:** Critical - Developers lose ability to understand why code was written, trace bugs, and review historical context.

**Mitigation:**
1. **Always use `git mv`** for all file/folder moves
2. Verify history preservation: `git log --follow <file>`
3. Educate team on proper git commands
4. Code review to ensure no direct filesystem moves

**Detection:**
```bash
# Test history preservation after migration
git log --follow --oneline core/codanna/src/main.ts | wc -l
# Should match:
git log --oneline nyra-core/codanna/src/main.ts | wc -l
```

#### Risk 2: Broken Imports

**Description:** TypeScript/JavaScript imports referencing old paths will break after consolidation.

**Impact:** High - Build failures, runtime errors, broken functionality.

**Mitigation:**
1. Automated search/replace script (`04-update-imports.sh`)
2. TypeScript compiler errors will surface broken imports
3. Comprehensive testing (unit + integration + e2e)
4. Manual review of all `from` and `import` statements in critical files

**Detection:**
```bash
# Find potential broken imports
pnpm build 2>&1 | grep "Cannot find module"
pnpm lint 2>&1 | grep "Unable to resolve"
```

#### Risk 3: CI/CD Pipeline Failure

**Description:** GitHub Actions workflows reference old paths for artifacts, caches, and test reports.

**Impact:** High - Blocked deployments, broken automation, failed tests.

**Mitigation:**
1. Update `.github/workflows/*.yml` in same commit as migration
2. Test workflows in consolidation branch before merge
3. Use dynamic path detection where possible
4. Add CI validation step to check for old paths

**Example Workflow Update:**
```yaml
# Before
- name: Upload test coverage
  uses: actions/upload-artifact@v3
  with:
    path: nyra-core/coverage

# After
- name: Upload test coverage
  uses: actions/upload-artifact@v3
  with:
    path: core/coverage
```

#### Risk 4: Docker Build Failure

**Description:** Docker Compose files and Dockerfiles reference old paths for build contexts and volumes.

**Impact:** Medium - Local development broken, deployment failures.

**Mitigation:**
1. Update all `docker-compose*.yml` files in Phase 2
2. Test Docker builds locally: `docker compose config`
3. Use relative paths where possible
4. Add Docker validation to CI

**Example Compose Update:**
```yaml
# Before
services:
  codanna:
    build:
      context: ./nyra-core/codanna
    volumes:
      - ./nyra-core/codanna:/app

# After
services:
  codanna:
    build:
      context: ./core/codanna
    volumes:
      - ./core/codanna:/app
```

#### Risk 5: Team Disruption

**Description:** Developers have active branches and PRs that will conflict with consolidation.

**Impact:** Low - Minor inconvenience, merge conflicts.

**Mitigation:**
1. **Communication:** Announce consolidation plan 1 week in advance
2. **Coordination:** Ask team to merge/close PRs before consolidation
3. **Timing:** Perform consolidation during low-activity period (e.g., Friday afternoon)
4. **Support:** Provide migration guide for rebasing active branches

**Team Communication Plan:**
```
T-7 days: Announce consolidation plan, share this document
T-3 days: Reminder to merge active PRs
T-1 day:  Final reminder, freeze new PRs
T-0:      Execute consolidation (Phases 1-8)
T+1 day:  Support team with rebasing branches
```

#### Risk 6: Lost Files

**Description:** Accidental deletion of files during migration.

**Impact:** Critical - Data loss, loss of work.

**Mitigation:**
1. **Full backup** before migration (see 7.1)
2. Use git branch (all changes are reversible)
3. Never use `rm -rf`, always use `git mv` or `git rm`
4. Code review all migration scripts
5. Test migration scripts on a copy of the repo first

**Backup Verification:**
```bash
# Create backup
tar -czf backups/pre-consolidation-$(date +%Y%m%d-%H%M%S).tar.gz .

# Verify backup integrity
tar -tzf backups/pre-consolidation-*.tar.gz | head -20

# Backup size should be ~500MB-1GB (excluding node_modules)
du -sh backups/pre-consolidation-*.tar.gz
```

#### Risk 7: Merge Conflicts

**Description:** Active PRs conflict with consolidation changes.

**Impact:** Medium - Developer frustration, time spent resolving conflicts.

**Mitigation:**
1. Coordinate with team to merge active PRs before consolidation
2. Provide clear rebase instructions for unmerged branches
3. Offer 1-on-1 support for complex conflicts

**Rebase Instructions for Developers:**
```bash
# On your feature branch
git fetch origin
git rebase origin/main

# If conflicts occur in moved files:
git status  # See which files conflict
# Manually resolve conflicts (paths will have changed)
git add <resolved-files>
git rebase --continue
```

#### Risk 8: Performance Regression

**Description:** Turborepo caching or build performance degrades after consolidation.

**Impact:** Medium - Slower developer experience, longer CI times.

**Mitigation:**
1. Benchmark build times before migration
2. Benchmark build times after migration
3. Monitor Turborepo cache hit rates
4. Optimize `turbo.json` if needed

**Benchmark Commands:**
```bash
# Before migration
time pnpm clean && pnpm install && pnpm build
# Record total time

# After migration
time pnpm clean && pnpm install && pnpm build
# Compare total time (should be similar or faster)

# Check Turborepo cache effectiveness
pnpm build  # First build
pnpm build  # Second build (should be >80% cached)
```

### 5.3 Risk Mitigation Checklist

- [ ] Full backup created and verified
- [ ] Consolidation branch created (`consolidation/nyra-monorepo-20260116`)
- [ ] All migration scripts reviewed and tested on a copy
- [ ] Team notified 1 week in advance
- [ ] Active PRs merged or paused
- [ ] CI/CD workflows updated in consolidation branch
- [ ] Docker configs updated and tested locally
- [ ] Automated import update script tested
- [ ] Validation checklist prepared (section 6)
- [ ] Rollback plan documented (section 7)
- [ ] Stakeholder approval obtained

---

## 6. Validation Checklist

### 6.1 Pre-Migration Validation

**Run Before Starting Migration:**

- [ ] **Backup Verification**
  ```bash
  bash scripts/consolidation/00-backup.sh
  ls -lh backups/pre-consolidation-*.tar.gz
  # Verify backup exists and is >100MB
  ```

- [ ] **Git Status Clean**
  ```bash
  git status
  # Should have no unexpected changes
  ```

- [ ] **Current Build Success**
  ```bash
  pnpm clean && pnpm install && pnpm build
  # Record build time and success
  ```

- [ ] **Current Tests Pass**
  ```bash
  pnpm test:all
  # Record test results
  ```

- [ ] **Docker Orchestration Works**
  ```bash
  pnpm infra:up && pnpm health:check
  # Verify all services healthy
  ```

- [ ] **Branch Created**
  ```bash
  git checkout -b consolidation/nyra-monorepo-20260116
  ```

### 6.2 Post-Migration Validation

**Run After Each Phase:**

#### Phase 1 Validation (Core)
- [ ] `core/codanna/` exists and has expected contents
- [ ] `core/serena/` exists and has expected contents
- [ ] `git log --follow core/codanna/src/main.ts` shows full history
- [ ] `nyra-core/` removed or empty
- [ ] Commit created: "consolidate: Merge nyra-core into core/"

#### Phase 2 Validation (Infra)
- [ ] `infra/scripts/orchestrator/` contains Claude Flow scripts
- [ ] `infra/scripts/setup/` contains setup scripts
- [ ] `infra/docker/compose/` contains stack compose files
- [ ] Docker config validation: `docker compose -f infra/docker/compose/docker-compose.yml config`
- [ ] No scripts remain in root directory
- [ ] Commit created: "consolidate: Merge nyra-infra, nyra-stack, root scripts"

#### Phase 3 Validation (Orchestration)
- [ ] `orchestration/a2a/`, `orchestration/autogen2/`, `orchestration/anthropic-agents-sdk/` exist
- [ ] `mcp-servers/` contains consolidated MCP implementations
- [ ] `memory/clients/`, `memory/deployment/` exist
- [ ] `pnpm-workspace.yaml` updated with new workspaces
- [ ] Commit created: "consolidate: Merge orchestration and memory"

#### Phase 4 Validation (Apps/Services)
- [ ] `apps/voice-integration/` or `services/voice-api/` created from `nyra-voice`
- [ ] `apps/crm-legacy/` or merged with `apps/crm/`
- [ ] App builds succeed: `pnpm build --filter=./apps/*`
- [ ] Service builds succeed: `pnpm build --filter=./services/*`
- [ ] Commit created: "consolidate: Merge nyra-webapp, nyra-voice"

#### Phase 5 Validation (Tools/Config)
- [ ] `tools/vscode-extensions/` exists
- [ ] `config/batch-config.json` moved from root
- [ ] `config/` vs `configs/` consolidated (only one remains)
- [ ] Commit created: "consolidate: Merge tools and config"

#### Phase 6 Validation (Docs/Archive)
- [ ] `docs/reports/STATUS-archon-os-DOCKER.md` exists
- [ ] `_archive/claude-dump.txt`, `_archive/EXTRACTION-STATUS.txt` exist
- [ ] `nyra-docs/` merged into `docs/` or `docs/legacy/`
- [ ] Documentation links updated
- [ ] Commit created: "consolidate: Merge docs and archive"

#### Phase 7 Validation (Import Updates)
- [ ] Import update script executed: `bash scripts/consolidation/04-update-imports.sh`
- [ ] No references to `nyra-core`, `nyra-infra`, etc. in code: `grep -r "nyra-core" apps/ services/ packages/`
- [ ] TypeScript builds without errors: `pnpm build`
- [ ] Linter passes: `pnpm lint`
- [ ] Commit created: "consolidate: Update import paths"

#### Phase 8 Validation (Cleanup)
- [ ] All empty `nyra-*` folders removed
- [ ] `nyra-ingestion/` deleted
- [ ] `git status` shows only intended changes
- [ ] Commit created: "consolidate: Remove empty folders"

### 6.3 Final Validation (Pre-Merge)

**Comprehensive Testing:**

- [ ] **Full Build**
  ```bash
  pnpm clean
  pnpm install
  time pnpm build
  # Compare time to pre-migration benchmark
  # Should be same or faster
  ```

- [ ] **All Tests Pass**
  ```bash
  pnpm test:all
  # All tests must pass
  ```

- [ ] **Turborepo Cache Hit Rate**
  ```bash
  pnpm build  # First build
  pnpm build  # Second build
  # Should see >80% cache hits in output
  ```

- [ ] **Docker Orchestration**
  ```bash
  pnpm infra:up
  pnpm health:check
  pnpm infra:logs
  # All services healthy
  ```

- [ ] **Git History Preserved**
  ```bash
  git log --follow --oneline core/codanna/src/main.ts | wc -l
  # Should match original nyra-core history
  ```

- [ ] **No Broken Links**
  ```bash
  # Check documentation links
  find docs -name "*.md" -exec grep -l "nyra-" {} \;
  # Should return no results (all updated)
  ```

- [ ] **CI/CD Workflows Valid**
  ```bash
  # Validate GitHub Actions workflows
  actionlint .github/workflows/*.yml
  # Or use GitHub's workflow validation
  ```

- [ ] **Import Path Validation**
  ```bash
  # Ensure no old paths remain
  grep -r "from.*nyra-" apps/ services/ packages/ || echo "No old imports found ✓"
  ```

- [ ] **TypeScript Type Checking**
  ```bash
  pnpm turbo run type-check
  # All packages should type-check successfully
  ```

- [ ] **Workspace Validation**
  ```bash
  pnpm -r list
  # Verify all workspaces detected correctly
  ```

### 6.4 Automated Validation Script

**`scripts/consolidation/validate-all.sh`:**
```bash
#!/bin/bash
set -e

echo "========================================="
echo "Consolidation Validation Script"
echo "========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✓${NC} $1"
}

fail() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

# 1. Build validation
echo -e "\n[1/8] Running full build..."
pnpm clean && pnpm install && pnpm build > /dev/null 2>&1 && pass "Build successful" || fail "Build failed"

# 2. Test validation
echo -e "\n[2/8] Running all tests..."
pnpm test:all > /dev/null 2>&1 && pass "All tests passed" || fail "Tests failed"

# 3. Git history validation
echo -e "\n[3/8] Validating git history..."
[ -f "core/codanna/src/main.ts" ] && git log --follow --oneline core/codanna/src/main.ts | head -1 > /dev/null && pass "Git history preserved" || fail "Git history broken"

# 4. Import path validation
echo -e "\n[4/8] Checking for old import paths..."
! grep -r "from.*nyra-" apps/ services/ packages/ > /dev/null 2>&1 && pass "No old import paths" || fail "Old import paths found"

# 5. Docker validation
echo -e "\n[5/8] Validating Docker configs..."
docker compose -f infra/docker/compose/docker-compose.yml config > /dev/null 2>&1 && pass "Docker config valid" || fail "Docker config invalid"

# 6. Workspace validation
echo -e "\n[6/8] Validating pnpm workspaces..."
pnpm -r list > /dev/null 2>&1 && pass "Workspaces valid" || fail "Workspace configuration broken"

# 7. TypeScript type checking
echo -e "\n[7/8] Type checking all packages..."
pnpm turbo run type-check > /dev/null 2>&1 && pass "Type checking passed" || fail "Type errors found"

# 8. Folder cleanup validation
echo -e "\n[8/8] Checking for old nyra-* folders..."
OLD_FOLDERS=$(find . -maxdepth 1 -name "nyra-*" -type d 2>/dev/null | wc -l)
[ "$OLD_FOLDERS" -eq 0 ] && pass "All nyra-* folders cleaned up" || fail "Found $OLD_FOLDERS remaining nyra-* folders"

echo -e "\n========================================="
echo -e "${GREEN}All validation checks passed!${NC}"
echo -e "========================================="
```

### 6.5 Manual Smoke Tests

**Critical User Paths to Test:**

1. **Developer Onboarding**
   - [ ] Clone repo
   - [ ] Run `pnpm install`
   - [ ] Run `pnpm dev`
   - [ ] Verify all apps start correctly

2. **Docker Development**
   - [ ] Run `pnpm infra:up`
   - [ ] Verify all services start
   - [ ] Run `pnpm health:check`
   - [ ] Test service connectivity

3. **Build & Deploy**
   - [ ] Run `pnpm build`
   - [ ] Verify all packages build
   - [ ] Run `pnpm deploy:staging` (if applicable)
   - [ ] Verify staging deployment works

4. **Testing**
   - [ ] Run `pnpm test:unit`
   - [ ] Run `pnpm test:integration`
   - [ ] Run `pnpm test:e2e`
   - [ ] Verify test coverage reports

5. **Claude Flow Integration**
   - [ ] Run `pnpm swarm:init`
   - [ ] Spawn a test agent
   - [ ] Verify MCP servers accessible
   - [ ] Test memory system

---

## 7. Rollback Plan

### 7.1 Pre-Migration Backup Strategy

**Critical: Backup BEFORE starting migration!**

**Backup Script (`scripts/consolidation/00-backup.sh`):**
```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backups"
BACKUP_FILE="pre-consolidation-$TIMESTAMP"

echo "Creating backup: $BACKUP_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Full repository backup (excluding node_modules, .git)
tar -czf "$BACKUP_DIR/$BACKUP_FILE.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='_backup' \
  --exclude='backups' \
  .

echo "Backup created: $BACKUP_DIR/$BACKUP_FILE.tar.gz"
echo "Size: $(du -sh "$BACKUP_DIR/$BACKUP_FILE.tar.gz" | cut -f1)"

# Create git branch as safety net
git branch "backup/$BACKUP_FILE"
echo "Git branch created: backup/$BACKUP_FILE"

# Export git log
git log --oneline --decorate --graph > "$BACKUP_DIR/$BACKUP_FILE-git-log.txt"
echo "Git log exported: $BACKUP_DIR/$BACKUP_FILE-git-log.txt"

# Export current structure
tree -L 3 -I 'node_modules' > "$BACKUP_DIR/$BACKUP_FILE-structure.txt"
echo "Structure exported: $BACKUP_DIR/$BACKUP_FILE-structure.txt"

echo "Backup complete!"
```

**Backup Verification:**
```bash
# After running backup script
ls -lh backups/pre-consolidation-*.tar.gz
# Should be 100-500MB (without node_modules)

# Verify backup contents
tar -tzf backups/pre-consolidation-*.tar.gz | head -50
# Should show expected files
```

### 7.2 Rollback Scenarios

#### Scenario 1: Rollback During Migration (Before Merge)

**When:** Issues discovered during migration (Phase 1-8), before merging to main.

**Action:**
```bash
# Discard all changes and return to main
git checkout main
git branch -D consolidation/nyra-monorepo-20260116

# Repository is unchanged (migration was on branch)
echo "Rollback complete - repository in original state"
```

**Recovery Time:** < 5 minutes
**Data Loss:** None (migration was on branch)

#### Scenario 2: Rollback After Merge (Within 24 Hours)

**When:** Issues discovered after merging to main, but before production deployment.

**Action:**
```bash
# Option A: Revert the merge commit
git revert -m 1 <merge-commit-hash>
git push origin main

# Option B: Force reset (only if no one else has pulled)
git reset --hard <commit-before-merge>
git push --force origin main  # ⚠️ Use with caution
```

**Recovery Time:** 10-30 minutes
**Data Loss:** None (git history preserved)

#### Scenario 3: Rollback from Backup

**When:** Catastrophic failure, git history corrupted, or complex issues.

**Action:**
```bash
# 1. Extract backup
cd /tmp
tar -xzf /path/to/Project-Nyra/backups/pre-consolidation-*.tar.gz

# 2. Replace current repo (with extreme caution)
cd /path/to/Project-Nyra
rm -rf * .* 2>/dev/null  # ⚠️ DANGEROUS
cp -r /tmp/pre-consolidation-*/* .
cp -r /tmp/pre-consolidation-*/.[!.]* .

# 3. Restore git branch
git checkout backup/pre-consolidation-*

# 4. Verify restoration
pnpm install
pnpm build
```

**Recovery Time:** 30-60 minutes
**Data Loss:** Any work done after backup created

### 7.3 Rollback Decision Matrix

| Symptom | When to Rollback | When to Fix Forward |
|---------|------------------|---------------------|
| **Build failures** | >50% of packages fail to build | <20% of packages fail (fix imports) |
| **Test failures** | >30% of tests fail | <10% of tests fail (update tests) |
| **Git history lost** | **Always rollback** | N/A - critical issue |
| **Import path errors** | >100 broken imports | <50 broken imports (batch fix) |
| **Docker failures** | Cannot start critical services | Non-critical service issues |
| **CI/CD broken** | All workflows fail | Individual workflow failures |
| **Team blockers** | >3 developers blocked | Individual developer issues |
| **Performance regression** | >50% slower builds | <20% slower (optimize) |

### 7.4 Communication Plan for Rollback

**If rollback is required:**

1. **Immediate:**
   - Post in team Slack: "⚠️ Consolidation rollback in progress. Do not pull main branch."
   - Email all developers: "Consolidation has been rolled back. Resume normal development."

2. **Within 1 hour:**
   - Post-mortem meeting scheduled
   - Root cause analysis initiated
   - Update consolidation plan with lessons learned

3. **Within 24 hours:**
   - Post-mortem report published
   - Revised consolidation plan (if re-attempting)
   - Team retrospective

### 7.5 Rollback Validation

**After Rollback:**

- [ ] Repository structure matches pre-migration state
- [ ] All builds succeed: `pnpm clean && pnpm install && pnpm build`
- [ ] All tests pass: `pnpm test:all`
- [ ] Docker orchestration works: `pnpm infra:up && pnpm health:check`
- [ ] Git history intact: `git log --oneline | head -20`
- [ ] Team notified of rollback completion
- [ ] Active PRs rebased to correct state

---

## 8. Timeline

### 8.1 Detailed Schedule

**Total Estimated Time:** 5 days (40 hours)

| Day | Phase | Tasks | Duration | Owner |
|-----|-------|-------|----------|-------|
| **Day 1** | **Preparation** | | | |
| | | Create consolidation branch | 0.5h | Tech Lead |
| | | Run backup script | 0.5h | DevOps Lead |
| | | Document current state | 0.5h | Tech Lead |
| | | Team kickoff meeting | 0.5h | All |
| | | **Phase 1: Core** | | |
| | | Execute `01-consolidate-core.sh` | 1h | DevOps Lead |
| | | Update imports in dependent packages | 2h | Senior Dev |
| | | Test core builds | 1h | QA Lead |
| | | Code review + commit | 1h | Tech Lead |
| | **Phase 2: Infrastructure** | | |
| | | Execute `02-consolidate-infra.sh` | 1.5h | DevOps Lead |
| | | Update Docker Compose refs | 1.5h | Infrastructure Lead |
| | | Update CI/CD workflows | 2h | DevOps Lead |
| | | Test Docker builds | 1h | QA Lead |
| | | Code review + commit | 0.5h | Tech Lead |
| **Day 2** | **Phase 3: Orchestration** | | |
| | | Execute `03-consolidate-orchestration.sh` | 2h | Senior Dev |
| | | Update workspace paths | 1h | Tech Lead |
| | | Test orchestration imports | 1.5h | QA Lead |
| | | Code review + commit | 0.5h | Tech Lead |
| | **Phase 4: Apps/Services** | | |
| | | Consolidate `nyra-webapp` | 2h | Frontend Lead |
| | | Create `services/voice-api` | 1.5h | Backend Lead |
| | | Update app imports | 1.5h | Frontend Lead |
| | | Test app builds | 1h | QA Lead |
| | | Code review + commit | 0.5h | Tech Lead |
| **Day 3** | **Phase 5: Tools/Config** | | |
| | | Consolidate tools and configs | 1.5h | Senior Dev |
| | | Update tool paths | 1h | Senior Dev |
| | | Code review + commit | 0.5h | Tech Lead |
| | **Phase 6: Docs/Archive** | | |
| | | Consolidate documentation | 1.5h | Tech Writer |
| | | Archive obsolete files | 1h | Senior Dev |
| | | Code review + commit | 0.5h | Tech Lead |
| | **Phase 7: Import Updates** | | |
| | | Execute `04-update-imports.sh` | 1h | Senior Dev |
| | | Manual review of changes | 2h | Senior Dev + QA |
| | | Fix broken imports | 2h | Senior Dev |
| | | Code review + commit | 0.5h | Tech Lead |
| **Day 4** | **Phase 8: Cleanup** | | |
| | | Execute `05-cleanup.sh` | 1h | DevOps Lead |
| | | Final structure validation | 1h | Tech Lead |
| | | Code review + commit | 0.5h | Tech Lead |
| | **Phase 9: Validation** | | |
| | | Run full test suite | 2h | QA Lead |
| | | Build all packages | 1h | DevOps Lead |
| | | Test Docker orchestration | 1.5h | Infrastructure Lead |
| | | Manual smoke tests | 2h | QA Team |
| | | Generate validation report | 1h | QA Lead |
| **Day 5** | **Phase 10: Merge & Deploy** | | |
| | | Create pull request | 0.5h | Tech Lead |
| | | Team code review | 2h | All |
| | | Address feedback | 2h | Senior Dev |
| | | Merge to main | 0.5h | Tech Lead |
| | | Monitor CI/CD | 1h | DevOps Lead |
| | | Deploy to staging | 1.5h | DevOps Lead |
| | | Staging validation | 1h | QA Lead |
| | | Final retrospective | 1h | All |

**Total:** ~40 hours (5 days @ 8 hours/day)

### 8.2 Critical Path

**Must be completed in order:**

1. **Phase 0: Preparation** → **Phase 1: Core** (Dependencies: Core libs used by all)
2. **Phase 1: Core** → **Phase 2-6** (Parallel after core done)
3. **Phase 2-6** → **Phase 7: Import Updates** (All moves must be complete)
4. **Phase 7** → **Phase 8: Cleanup** (Cleanup only after imports fixed)
5. **Phase 8** → **Phase 9: Validation** (Validate complete migration)
6. **Phase 9** → **Phase 10: Merge** (Only merge after validation passes)

**Parallelization Opportunities:**

- Phases 2, 3, 4, 5, 6 can be done in parallel (different team members)
- Documentation (Phase 6) can be done throughout Phases 1-5

### 8.3 Resource Allocation

**Required Team:**
- 1x Tech Lead (orchestration, code review, decision-making)
- 1x DevOps Lead (infra, scripts, CI/CD)
- 1x Infrastructure Lead (Docker, Kubernetes configs)
- 2x Senior Developers (import updates, app consolidation)
- 1x Frontend Lead (webapp consolidation)
- 1x Backend Lead (services consolidation)
- 1x QA Lead (testing, validation)
- 1x Tech Writer (documentation)

**Total:** 9 people (not all full-time)

### 8.4 Contingency Buffer

**Built-in Buffers:**
- **Import Fixes:** +50% time buffer (2h → 3h if issues found)
- **Testing:** +25% time buffer (2h → 2.5h for unexpected failures)
- **Code Review:** +50% time buffer (feedback may require changes)

**If Behind Schedule:**
- Extend to 6-7 days (acceptable)
- Do not skip validation steps
- Consider rollback if >2 days behind

### 8.5 Milestones

| Milestone | Date | Success Criteria |
|-----------|------|------------------|
| **M1: Backup Complete** | Day 1, 9:00 AM | Backup verified, branch created |
| **M2: Core Consolidated** | Day 1, 3:00 PM | Core libs moved, builds pass |
| **M3: Infra Consolidated** | Day 1, 6:00 PM | Infra moved, Docker configs valid |
| **M4: Orchestration Done** | Day 2, 12:00 PM | Orchestration moved, workspaces updated |
| **M5: Apps/Services Done** | Day 2, 5:00 PM | Apps moved, builds pass |
| **M6: Import Updates Done** | Day 3, 4:00 PM | All imports updated, builds pass |
| **M7: Cleanup Done** | Day 4, 11:00 AM | All nyra-* folders removed |
| **M8: Validation Pass** | Day 4, 5:00 PM | All tests pass, Docker works |
| **M9: PR Created** | Day 5, 9:00 AM | PR created with full description |
| **M10: Merged to Main** | Day 5, 4:00 PM | Merged, CI passes, staging deployed |

---

## 9. Success Metrics

### 9.1 Quantitative Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| **Root Folder Count** | 52 folders | 25-30 folders | `ls -1 -d */ \| wc -l` |
| **nyra-\* Folders** | 14 folders | 0 folders | `ls -1 -d nyra-* \| wc -l` |
| **Root Scripts** | 16 files | 0 files | `ls -1 *.{ps1,sh,bat} \| wc -l` |
| **Build Time (Cold)** | TBD | -10% or same | `time pnpm build` |
| **Build Time (Hot)** | TBD | >80% cached | Turborepo cache hit rate |
| **Test Execution Time** | TBD | -20% or same | `time pnpm test:all` |
| **Repository Size** | ~94MB | -10-20% | `du -sh .` (exclude node_modules) |
| **Workspace Count** | 6 | 8-10 | `pnpm -r list \| wc -l` |
| **Documentation Files** | Scattered | Consolidated in `/docs` | Find all .md files |

### 9.2 Qualitative Metrics

**Developer Experience:**
- [ ] New developers can find files intuitively
- [ ] Workspace structure follows industry best practices
- [ ] Build and test commands are straightforward
- [ ] Docker orchestration is well-organized
- [ ] Documentation is comprehensive and discoverable

**Team Feedback (Survey):**
- Conduct post-consolidation survey (1-5 scale)
  - "How easy is it to find files now?" (Target: 4+)
  - "Is the structure more maintainable?" (Target: 4+)
  - "Did consolidation disrupt your work?" (Target: <3)
  - "Would you recommend this structure to new devs?" (Target: 4+)

### 9.3 Success Criteria

**Consolidation is considered successful if:**

1. ✅ All 14 `nyra-*` folders consolidated or removed
2. ✅ All root scripts organized in `infra/scripts/`
3. ✅ No broken builds or tests
4. ✅ Git history preserved for all moved files
5. ✅ Turborepo cache hit rate >80% on rebuilds
6. ✅ Docker orchestration works without changes
7. ✅ CI/CD pipelines pass
8. ✅ Team survey scores >4/5 on average
9. ✅ Documentation updated and accurate
10. ✅ Zero production incidents caused by consolidation

---

## 10. Post-Consolidation Optimization

### 10.1 Follow-Up Tasks (Week 1-2)

**After successful merge:**

1. **Monitor Production**
   - [ ] Watch error logs for 48 hours
   - [ ] Monitor build times (should improve)
   - [ ] Check CI/CD pipeline health
   - [ ] Survey team for feedback

2. **Turborepo Optimization**
   - [ ] Analyze cache hit rates: `turbo run build --dry`
   - [ ] Optimize `turbo.json` pipeline if needed
   - [ ] Document optimal build commands

3. **Documentation Updates**
   - [ ] Update README.md with new structure
   - [ ] Update CLAUDE.md component guide index
   - [ ] Create "Project Structure" guide for new devs
   - [ ] Update onboarding documentation

4. **Developer Tooling**
   - [ ] Update VSCode workspace settings
   - [ ] Update IDE path mappings
   - [ ] Update search/navigation bookmarks
   - [ ] Create workspace snippets

5. **CI/CD Refinement**
   - [ ] Optimize GitHub Actions workflows
   - [ ] Update caching strategies
   - [ ] Add new path-based filters
   - [ ] Benchmark CI pipeline performance

### 10.2 Continuous Improvement

**Ongoing (Monthly):**

- [ ] Review folder structure (prevent drift)
- [ ] Audit for new `nyra-*` folders (should be 0)
- [ ] Check for root clutter (files should be minimal)
- [ ] Update consolidation plan if architecture changes
- [ ] Share learnings with other teams

### 10.3 Lessons Learned

**Document lessons learned in post-consolidation retrospective:**

- What went well?
- What challenges did we face?
- What would we do differently next time?
- What tools/scripts were most helpful?
- How can we prevent structure drift?

**Store in:** `docs/reports/CONSOLIDATION-RETROSPECTIVE.md`

---

## 11. Approval & Sign-Off

### 11.1 Stakeholder Approval

**This plan requires approval from:**

- [ ] **Tech Lead** - Technical approach, timeline, resource allocation
- [ ] **DevOps Lead** - Infrastructure changes, CI/CD impact
- [ ] **QA Lead** - Testing strategy, validation plan
- [ ] **Project Manager** - Timeline, team coordination, risk assessment
- [ ] **Engineering Manager** - Team disruption, rollback plan
- [ ] **All Developers** - Awareness, active PR coordination

### 11.2 Pre-Execution Checklist

**Before starting Phase 1:**

- [ ] All stakeholders approved plan
- [ ] Team notified 1 week in advance
- [ ] Active PRs merged or paused
- [ ] Backup script tested and ready
- [ ] Validation script tested and ready
- [ ] Rollback plan understood by all
- [ ] Timeline communicated to team
- [ ] Consolidation branch naming agreed upon
- [ ] Go/No-Go decision made

**Go/No-Go Criteria:**

- ✅ All approvals obtained
- ✅ No critical bugs in main branch
- ✅ No major deadlines this week
- ✅ Backup script works
- ✅ Team available for support

**If any criteria not met:** Postpone consolidation

---

## 12. Appendix

### 12.1 Full Command Reference

**Backup Commands:**
```bash
# Create backup
bash scripts/consolidation/00-backup.sh

# Verify backup
ls -lh backups/pre-consolidation-*.tar.gz
tar -tzf backups/pre-consolidation-*.tar.gz | head -20

# Restore from backup
cd /tmp
tar -xzf /path/to/backups/pre-consolidation-*.tar.gz
```

**Migration Commands:**
```bash
# Phase 1: Core
bash scripts/consolidation/01-consolidate-core.sh

# Phase 2: Infrastructure
bash scripts/consolidation/02-consolidate-infra.sh

# Phase 3: Orchestration
bash scripts/consolidation/03-consolidate-orchestration.sh

# Phase 4: Import Updates
bash scripts/consolidation/04-update-imports.sh

# Phase 5: Cleanup
bash scripts/consolidation/05-cleanup.sh

# Comprehensive Validation
bash scripts/consolidation/validate-all.sh
```

**Testing Commands:**
```bash
# Full test suite
pnpm test:all

# Build validation
pnpm clean && pnpm install && pnpm build

# Docker validation
docker compose -f infra/docker/compose/docker-compose.yml config
pnpm infra:up && pnpm health:check

# Git history validation
git log --follow --oneline core/codanna/src/main.ts

# Import validation
grep -r "from.*nyra-" apps/ services/ packages/
```

### 12.2 Directory Structure Diagram (Before vs After)

**Before Consolidation:**
```
Project-Nyra/
├── nyra-core/         (4.8M - DUPLICATE)
├── nyra-infra/        (560K - DUPLICATE)
├── nyra-mcp/          (14M - DUPLICATE)
├── nyra-orchestration/ (19M - DUPLICATE)
├── nyra-memory/       (689K - DUPLICATE)
├── nyra-docs/         (105K - DUPLICATE)
├── nyra-webapp/       (2.3M - DUPLICATE)
├── nyra-tools/        (78K - DUPLICATE)
├── nyra-stack/        (68K - DUPLICATE)
├── nyra-scripts/      (2.4M - DUPLICATE)
├── nyra-configs/      (17K - DUPLICATE)
├── nyra-src/          (24K - DUPLICATE)
├── nyra-voice/        (50M - DUPLICATE)
├── nyra-ingestion/    (empty - DELETE)
├── core/
├── infra/
├── mcp-servers/
├── orchestration/
├── memory/
├── docs/
├── apps/
├── tools/
├── config/ + configs/ (DUPLICATE)
├── [16 root scripts]  (MOVE)
└── [52 total folders] (CONSOLIDATE)
```

**After Consolidation:**
```
Project-Nyra/
├── core/              (✅ Consolidated from nyra-core)
├── infra/             (✅ Consolidated from nyra-infra, nyra-stack, root scripts)
│   └── scripts/       (✅ Organized by PC: orchestrator/, worker/, setup/)
├── mcp-servers/       (✅ Consolidated from nyra-mcp)
├── orchestration/     (✅ Consolidated from nyra-orchestration)
├── memory/            (✅ Consolidated from nyra-memory)
├── docs/              (✅ Consolidated from nyra-docs, root .md files)
├── apps/              (✅ Consolidated from nyra-webapp, nyra-voice)
├── services/          (✅ New services from nyra-voice)
├── tools/             (✅ Consolidated from nyra-tools)
├── config/            (✅ Consolidated from nyra-configs, configs/)
├── packages/
├── submodules/
├── bootstrap/
├── scripts/
├── _archive/          (✅ Old files archived)
└── [25-30 folders]    (✅ Clean structure)
```

### 12.3 Contact Information

**For questions or issues during consolidation:**

- **Tech Lead:** [Name] - [Email]
- **DevOps Lead:** [Name] - [Email]
- **QA Lead:** [Name] - [Email]
- **Project Manager:** [Name] - [Email]

**Emergency Rollback:** Contact Tech Lead or DevOps Lead immediately

---

## 13. References

### 13.1 Internal Documentation

- [System Architecture](./system-architecture.md) - Current architecture overview
- [4PC Distributed Architecture](./4PC-DISTRIBUTED-ARCHITECTURE.md) - Deployment architecture
- [Bootstrap Documentation](../../bootstrap/README.md) - Installer system
- [Component Guide Index](../../CLAUDE.md#-component-guide-index) - Component-specific guides

### 13.2 External Resources

- [Turborepo Handbook](https://turbo.build/repo/docs/handbook) - Monorepo best practices
- [pnpm Workspaces](https://pnpm.io/workspaces) - Workspace configuration
- [Git History Preservation](https://git-scm.com/docs/git-mv) - Using git mv correctly
- [Monorepo Best Practices](https://monorepo.tools/) - Industry standards

### 13.3 Related ADRs (Architecture Decision Records)

- **ADR-001:** Repository consolidation rationale
- **ADR-002:** Workspace organization strategy
- **ADR-003:** Script organization by PC type
- **ADR-004:** Configuration consolidation approach

*(Create ADRs in `docs/architecture/decisions/` as needed)*

---

**Document Status:** ✅ Draft - Ready for Review
**Next Steps:**
1. Review with Tech Lead and DevOps Lead
2. Obtain stakeholder approvals
3. Schedule team kickoff meeting
4. Execute Phase 0 (Preparation)

**Last Updated:** 2026-01-16
**Version:** 1.0.0
