# Project Nyra - Root Files Inventory & Analysis
**Generated**: 2026-01-25
**Purpose**: Comprehensive analysis of repo root files with move/keep recommendations

---

## 📊 Summary Statistics
- **Total Files in Root**: 118 files
- **Should Stay in Root**: 24 files (20%)
- **Should Move**: 71 files (60%)
- **Should Delete**: 23 files (20%)

---

## ✅ Files That BELONG in Root (Keep - 24 files)

### Core Configuration Files (11)
| File | Purpose | Keep |
|------|---------|------|
| `package.json` | Node package manifest | ✅ |
| `pnpm-lock.yaml` | pnpm lockfile | ✅ |
| `pnpm-workspace.yaml` | Monorepo workspace config | ✅ |
| `turbo.json` | Turborepo configuration | ✅ |
| `tsconfig.json` | TypeScript root config | ✅ |
| `tsconfig.base.json` | TypeScript base config | ✅ |
| `.gitignore` | Git exclusions | ✅ |
| `.gitattributes` | Git attributes | ✅ |
| `.dockerignore` | Docker build exclusions | ✅ |
| `.npmrc` | npm configuration | ✅ |
| `.editorconfig` | Editor settings | ✅ |

### Testing Configuration (3)
| File | Purpose | Keep |
|------|---------|------|
| `jest.config.js` | Jest root config (multi-project) | ✅ |
| `jest.config.unit.js` | Jest unit test config | ✅ |
| `jest.config.integration.js` | Jest integration test config | ✅ |

### E2E Testing (1)
| File | Purpose | Keep |
|------|---------|------|
| `playwright.config.ts` | Playwright E2E config | ✅ |

### Documentation (4)
| File | Purpose | Keep |
|------|---------|------|
| `README.md` | Main project documentation | ✅ |
| `CLAUDE.md` | Claude AI assistant context | ✅ |
| `START-HERE.md` | Onboarding guide | ✅ |
| `WARP.md` | Warp AI integration rules | ✅ |

### CI/CD (2)
| File | Purpose | Keep |
|------|---------|------|
| `.audit-ci.json` | Security audit config | ✅ |
| `codecov.yml` | Code coverage config | ✅ |

### Linting/Formatting (3)
| File | Purpose | Keep |
|------|---------|------|
| `.eslintrc.json` | ESLint configuration | ✅ |
| `.prettierrc.json` | Prettier configuration | ✅ |
| `.yamllint.yml` | YAML linting config | ✅ |

---

## 🚚 Files That Should MOVE (71 files)

### Move to `docs/reports/` (15 files)
These are status reports and completion summaries:
- `ARCHON-COMPLETE-SETUP-GUIDE.md` → `docs/reports/archon/ARCHON-COMPLETE-SETUP-GUIDE.md`
- `ARCHON-LAUNCH-STATUS.md` → `docs/reports/archon/ARCHON-LAUNCH-STATUS.md`
- `ARCHON-NEXUS-INTEGRATION-COMPLETE.md` → `docs/reports/archon/ARCHON-NEXUS-INTEGRATION-COMPLETE.md`
- `ARCHON-OS-SETUP-GUIDE.md` → `docs/guides/archon/ARCHON-OS-SETUP-GUIDE.md`
- `BOOTSTRAP-FIXES-DEPLOYED.md` → `docs/reports/bootstrap/BOOTSTRAP-FIXES-DEPLOYED.md`
- `BOOTSTRAP-FIXES-SUMMARY.md` → `docs/reports/bootstrap/BOOTSTRAP-FIXES-SUMMARY.md`
- `CLAUDE-FLOW-FULL-FEATURES-CONTAINERIZATION.md` → `docs/reports/claude-flow/CLAUDE-FLOW-FULL-FEATURES-CONTAINERIZATION.md`
- `CLAUDE-FLOW-SETUP-COMPLETE.md` → `docs/reports/claude-flow/CLAUDE-FLOW-SETUP-COMPLETE.md`
- `CONSOLIDATION-COMPLETE.md` → `docs/reports/consolidation/CONSOLIDATION-COMPLETE.md`
- `CONSOLIDATION-STATUS.md` → `docs/reports/consolidation/CONSOLIDATION-STATUS.md`
- `CONTAINERIZATION-SUMMARY.md` → `docs/reports/docker/CONTAINERIZATION-SUMMARY.md`
- `DEPLOYMENT-COMPLETE-SUMMARY.md` → `docs/reports/deployment/DEPLOYMENT-COMPLETE-SUMMARY.md`
- `DOCKER-TROUBLESHOOTING.md` → `docs/troubleshooting/docker/DOCKER-TROUBLESHOOTING.md`
- `INFRA_VALIDATION_REPORT.md` → `docs/reports/infrastructure/INFRA_VALIDATION_REPORT.md`
- `QUICK-START-WORKFLOW.md` → `docs/guides/QUICK-START-WORKFLOW.md`

### Move to `docs/guides/` (2 files)
- `PATH-REVIEW-INDEX.md` → `docs/reference/PATH-REVIEW-INDEX.md`
- `TASK-LISTS.md` → `docs/reference/TASK-LISTS.md`

### Move to `docs/reference/` (2 files)
- `RUVECTOR-ENV-RESEARCH-COMPLETE.txt` → `docs/research/ruvector/RUVECTOR-ENV-RESEARCH-COMPLETE.md`
- `RUVECTOR-IMPLEMENTATION-COMPLETE.md` → `docs/reports/ruvector/RUVECTOR-IMPLEMENTATION-COMPLETE.md`

### Move to `docs/status/` (2 files)
- `STARTUP.md` → `docs/guides/operations/STARTUP.md`
- `VALIDATION_CHECKLIST.md` → `docs/validation/VALIDATION_CHECKLIST.md`

### Move to `infra/configs/` (35 .env files)
All `.env.*` files should be consolidated:
- `.env` → Keep (active environment)
- `.env.ci` → `infra/configs/environments/.env.ci`
- `.env.claude-flow` → `infra/configs/claude-flow/.env.claude-flow`
- `.env.cloudflare.example` → `infra/configs/cloudflare/.env.cloudflare.example`
- `.env.dev.claude-flow` → `infra/configs/claude-flow/.env.dev`
- `.env.development` → `infra/configs/environments/.env.development`
- `.env.development.optimal` → `infra/configs/environments/.env.development.optimal`
- `.env.example` → Keep (template for developers)
- `.env.example.master` → DELETE (duplicate)
- `.env.master` → `infra/configs/environments/.env.master`
- `.env.orchestration.template` → `infra/configs/orchestrator/.env.template`
- `.env.orchestrator` → `infra/configs/orchestrator/.env.orchestrator`
- `.env.prod.claude-flow` → `infra/configs/claude-flow/.env.prod`
- `.env.production` → `infra/configs/environments/.env.production`
- `.env.production.optimal` → `infra/configs/environments/.env.production.optimal`
- `.env.template` → DELETE (duplicate of .env.example)
- `.env.worker-3060` → `infra/configs/workers/.env.worker-3060`
- `.env.worker-3090ti` → `infra/configs/workers/.env.worker-3090ti`
- `.env.worker-5090` → `infra/configs/workers/.env.worker-5090`
- `master-.env.example` → DELETE (duplicate)
- `ruvector.env` → `infra/configs/ruvector/.env.ruvector`

### Move to `infra/configs/mcp/` (3 files)
- `.mcp.json` → Keep (active MCP config)
- `.mcp.json.development` → `infra/configs/mcp/.mcp.json.development`
- `.mcp.json.production` → `infra/configs/mcp/.mcp.json.production`
- `mcp.json` → DELETE (duplicate of .mcp.json)

### Move to `infra/configs/` (12 config files)
- `.infisical.json` → `infra/configs/infisical/.infisical.json`
- `.jjconfig` → `infra/configs/jujutsu/.jjconfig`
- `.releaserc.json` → `infra/configs/release/.releaserc.json`
- `.roomodes` → `infra/configs/roo/.roomodes`
- `.syncpackrc.json` → `infra/configs/syncpack/.syncpackrc.json`
- `.turborc` → DELETE (turbo.json is sufficient)
- `agent-config.yaml` → `infra/configs/agents/agent-config.yaml`
- `batch-config.json` → `infra/configs/batch/batch-config.json`
- `claude-flow.config.json` → `infra/configs/claude-flow/claude-flow.config.json`
- `claude-flow.config.minimal.json` → `infra/configs/claude-flow/claude-flow.config.minimal.json`
- `devcontainer.json` → `.devcontainer/devcontainer.json`
- `nextjs.yml` → `.github/workflows/nextjs.yml` (if CI) OR `infra/configs/nextjs/nextjs.yml`

### Move to `scripts/` (5 operational scripts)
- `bootup.ps1` → `scripts/operations/bootup.ps1`
- `bootup.sh` → `scripts/operations/bootup.sh`
- `check-health.ps1` → `scripts/health/check-health.ps1`
- `doctor.ps1` → `scripts/health/doctor.ps1`
- `doctor.sh` → `scripts/health/doctor.sh`
- `maintenance.ps1` → `scripts/maintenance/maintenance.ps1`
- `maintenance.sh` → `scripts/maintenance/maintenance.sh`
- `shutdown.ps1` → `scripts/operations/shutdown.ps1`
- `shutdown.sh` → `scripts/operations/shutdown.sh`
- `start-with-redis.ps1` → `scripts/services/start-with-redis.ps1`
- `start-with-redis.sh` → `scripts/services/start-with-redis.sh`
- `verify-ready.ps1` → `scripts/validation/verify-ready.ps1`

### Move to `tests/manual/` (2 test scripts)
- `test-sqlite-import.js` → `tests/manual/sqlite/test-sqlite-import.js`
- `test-sqlite-simple.js` → `tests/manual/sqlite/test-sqlite-simple.js`

### Move to `docs/python-requirements/` (1 file)
- `requirements.txt` → `docs/python-requirements/requirements.txt` OR `tools/python/requirements.txt`

---

## 🗑️ Files That Should DELETE (23 files)

### Backup Files (8)
- `.consolidation-2026-01-19.txt`
- `.consolidation-status.json`
- `.docker-consolidation-phase1.json`
- `.validation-metadata.json`
- `claude-flow.config.json.backup`
- `claude-flow.config.json.backup.20260121-043718`
- `CLAUDE.md.backup-20260122-102535`
- `jest.config.js.backup`
- `jest.setup.js.backup`

### Duplicate/Obsolete Config Files (5)
- `bun.lock` (switching to pnpm)
- `package-lock.json` (using pnpm-lock.yaml)
- `.env.example.master` (duplicate of .env.example)
- `.env.template` (duplicate of .env.example)
- `master-.env.example` (duplicate of .env.example)
- `.turborc` (turbo.json is sufficient)
- `mcp.json` (duplicate of .mcp.json)

### Validation Output Files (3)
- `validation-results.json` → `docs/reports/validation/validation-results.json` (then delete after archiving)
- `VALIDATION_COMPLETE.txt` → `docs/reports/validation/VALIDATION_COMPLETE.md`
- `VALIDATION_SUMMARY.txt` → `docs/reports/validation/VALIDATION_SUMMARY.md`

### Temporary/Debugging Files (7)
- `claude-dump.txt` (205KB debug output)
- `nul` (0 bytes - Windows artifact)

---

## 🎯 Answers to Your Questions

### 1. **What is Jest?**
Jest is a JavaScript testing framework. The `jest.config.js` files in your root are **legitimate and should stay** because:
- They configure testing for your monorepo
- `jest.config.js` is the root multi-project config
- `jest.config.unit.js` and `jest.config.integration.js` are sub-configs
- This is standard practice for monorepos

**Verdict**: ✅ KEEP in root

### 2. **What is Playwright?**
Playwright is an end-to-end testing framework for web apps. `playwright.config.ts` **should stay in root** because:
- It configures E2E tests across multiple browsers
- Playwright expects this file at repo root
- It references `tests/e2e/` directory

**Verdict**: ✅ KEEP in root

### 3. **What are test-sqlite-*.js files?**
These are manual test scripts for verifying SQLite functionality. They **should be moved** to:
```
tests/manual/sqlite/
├── test-sqlite-import.js
└── test-sqlite-simple.js
```

**Verdict**: 🚚 MOVE to `tests/manual/sqlite/`

### 4. **What files typically belong in repo root?**
**Standard files for monorepos:**
- `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`
- `turbo.json` (Turborepo)
- `tsconfig.json`, `tsconfig.base.json`
- `.gitignore`, `.gitattributes`, `.dockerignore`
- `.npmrc`, `.editorconfig`
- `README.md`, `LICENSE`, `CONTRIBUTING.md`
- `jest.config.js`, `playwright.config.ts` (test configs)
- `.eslintrc.json`, `.prettierrc.json` (linting)
- `.env.example` (template only)
- `CLAUDE.md` (AI assistant context)

**Should NOT be in root:**
- Status reports (move to `docs/reports/`)
- Multiple `.env.*` files (move to `infra/configs/`)
- Operational scripts (move to `scripts/`)
- Backup files (delete)

---

## 📋 Recommended Actions

### Immediate (Do Now)
1. **Delete backup files** (8 files with `.backup`, `.bak`, etc.)
2. **Delete duplicate config files** (5 files)
3. **Delete obsolete files** (`bun.lock`, `package-lock.json`, `nul`)
4. **Move validation outputs to docs/** (3 files)

### Short-term (This Session)
5. **Move status reports to docs/reports/** (15 files)
6. **Move .env files to infra/configs/** (18 files)
7. **Move operational scripts to scripts/** (12 files)
8. **Move test scripts to tests/manual/** (2 files)

### Completion Criteria
- **Repo root has 24 files** (down from 118)
- **All status reports in docs/reports/** organized by component
- **All env files in infra/configs/** organized by purpose
- **All operational scripts in scripts/** organized by function
- **Zero backup files** in repo

---

## 🔍 Current Completion Status
Based on external context (FINAL-CONSOLIDATION-REPORT-2026-01-16):
- Documentation: ✅ 46 categories, 13,575+ files organized
- Bootstrap: ✅ 130 scripts consolidated
- Scripts: ✅ 93+ scripts centralized
- MCP Integration: ✅ 6 servers configured
- **Root cleanup: ⚠️ NOT YET STARTED** (still 118 files)

**Next Step**: Execute the moves and deletes outlined above.

---

## 📊 Docs Folder Consolidation Analysis

### Redundant Folders Identified (12 pairs/groups)

#### 1. **archive vs _archive**
- `docs/archive/` - Main archive location
- `docs/_archive/` - Duplicate archive location
- **Action**: Merge `_archive/` into `archive/`, delete `_archive/`

#### 2. **configs vs configuration**
- `docs/configs/` - Configuration examples
- `docs/configuration/` - Configuration guides
- **Action**: Merge into `docs/configuration/`, delete `configs/`

#### 3. **infra vs infrastructure**
- `docs/infra/` - Infrastructure docs
- `docs/infrastructure/` - Infrastructure guides
- **Action**: Merge into `docs/infrastructure/`, delete `infra/`

#### 4. **integrations vs integration**
- `docs/integrations/` - Multiple integrations
- `docs/integration/` - Integration guides
- **Action**: Merge into `docs/integration/`, delete `integrations/`

#### 5. **developer vs development**
- `docs/developer/` - Developer guides
- `docs/development/` - Development processes
- **Action**: Merge into `docs/development/`, delete `developer/`

#### 6. **deployment (single)**
- Appears valid as standalone
- **Action**: Keep as-is

#### 7. **setup (single)**
- Appears valid as standalone
- **Action**: Keep as-is

#### 8. **ai-context vs claude-configs vs claude-flow**
- `docs/ai-context/` - AI assistant context
- `docs/claude-configs/` - Claude configuration files
- `docs/claude-flow/` - Claude Flow specific docs
- **Action**: Consolidate into `docs/ai/` with subdirs:
  - `docs/ai/context/`
  - `docs/ai/claude-configs/`
  - `docs/ai/claude-flow/`

#### 9. **decisions vs adr**
- `docs/decisions/` - Decision records
- `docs/adr/` - Architecture Decision Records
- **Action**: Merge into `docs/adr/` (standard ADR convention), delete `decisions/`

#### 10. **implementation vs implementation-ideas**
- `docs/implementation/` - Implementation guides
- `docs/implementation-ideas/` - Future ideas
- **Action**: Merge `implementation-ideas/` into `docs/implementation/ideas/`

#### 11. **references vs research**
- `docs/references/` - Reference materials
- `docs/research/` - Research notes
- **Action**: Keep separate (serve different purposes)

#### 12. **services vs orchestration**
- `docs/services/` - Service documentation
- `docs/orchestration/` - Orchestration guides
- **Action**: Keep separate (orchestration coordinates services)

### Final Docs Structure (45 folders → 38 folders)

**Proposed consolidated structure:**
```
docs/
├── _archive/           # Obsolete files (recoverable)
├── adr/                # Architecture Decision Records (merged decisions/)
├── ai/                 # AI assistant docs (merged ai-context, claude-configs, claude-flow)
│   ├── context/
│   ├── claude-configs/
│   └── claude-flow/
├── ai-automatable/     # AI automation candidates
├── api/                # API documentation
├── architecture/       # System architecture
├── archive/            # Main archive (merged _archive/)
├── bootstrap/          # Bootstrap guides
├── cleanup/            # Cleanup procedures
├── compliance/         # Compliance documentation
├── configuration/      # All configuration docs (merged configs/)
├── database/           # Database documentation
├── deployment/         # Deployment guides
├── development/        # Development processes (merged developer/)
├── diagrams/           # Architecture diagrams
├── environment/        # Environment setup
├── implementation/     # Implementation guides (merged implementation-ideas/)
│   └── ideas/          # Future ideas
├── ingestion/          # Data ingestion
├── integration/        # Integration guides (merged integrations/)
├── infrastructure/     # Infrastructure docs (merged infra/)
├── manual-tasks/       # Manual task checklists
├── network/            # Network configuration
├── next-steps/         # Roadmap items
├── open-issues/        # Known issues
├── operations/         # Operations runbooks
├── orchestration/      # Orchestration guides
├── performance/        # Performance optimization
├── prompts/            # AI prompts
├── references/         # Reference materials
├── reports/            # Status reports
├── research/           # Research notes
├── reviews/            # Code/system reviews
├── runbooks/           # Operational runbooks
├── ruvector/           # Ruvector-specific docs
├── security/           # Security documentation
├── services/           # Service documentation
├── setup/              # Setup guides
├── sparc/              # SPARC methodology
├── specs/              # Technical specifications
├── status/             # Current status
├── templates/          # Document templates
├── tools/              # Tool documentation
├── troubleshooting/    # Troubleshooting guides
├── user/               # User documentation
└── workflows/          # Workflow automation
```

**Changes:**
- **Merged**: 7 folder pairs (14 folders → 7 folders)
- **Saved**: 7 folders of redundancy
- **Result**: 45 folders → 38 folders (15% reduction)
- **Benefit**: Clearer organization, easier navigation

---

## ✅ Completion Percentage

Based on PATH-REVIEW-INDEX.md status:
- **Documentation**: ✅ 95% (needs docs folder consolidation)
- **Bootstrap**: ✅ 90% (needs final GUI testing)
- **Scripts**: ✅ 90% (needs MCP consolidation)
- **Root Cleanup**: ⚠️ 0% (NOT STARTED)
- **Package.json**: ⚠️ 50% (bun removal pending)
- **.gitignore**: ✅ 85% (good, minor additions needed)
- **.dockerignore**: ✅ 80% (good, minor additions needed)

**Overall Consolidation**: **~70%** complete

**Remaining Work**:
1. Root file cleanup (this document's recommendations)
2. Docs folder consolidation (merge 7 pairs)
3. Remove bun, finalize pnpm/volta setup
4. MCP server consolidation
5. Bootstrap GUI fixes

---

**Next Step**: Execute file moves and deletions outlined above.
