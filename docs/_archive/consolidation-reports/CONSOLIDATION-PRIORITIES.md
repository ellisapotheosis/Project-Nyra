# Project Nyra - Consolidation Priorities

**Analysis Date:** 2026-01-18
**Analyst:** Research Agent
**Status:** Ready for Implementation

## Executive Summary

Repository contains **73+ root-level items** requiring consolidation. Total effort estimated at **12-16 hours** across 4 difficulty tiers.

### Quick Stats
- **Documentation Files (Root):** 16 markdown files
- **Scripts (Root):** 12 shell/PowerShell files
- **Docker Configs:** 9 docker-compose.yml variants
- **Environment Files:** 16 .env files
- **JSON Configs:** 18 configuration files
- **Root Directories:** 47 directories (many should move)

---

## 🎯 TIER 1: EASY (2-3 hours)
**Low risk, no dependency updates required, simple moves**

### 1.1 Documentation Consolidation
**Target:** Move 13 markdown files to `docs/` subdirectories
**Effort:** 30 minutes
**Risk:** None - documentation references rarely hard-coded

**Files to Move:**
```bash
# Project Guides → docs/guides/
ARCHON-COMPLETE-SETUP-GUIDE.md              → docs/guides/archon-setup.md
ARCHON-OS-SETUP-GUIDE.md                    → docs/guides/archon-os-setup.md
ARCHON-NEXUS-INTEGRATION-COMPLETE.md        → docs/guides/archon-nexus-integration.md
QUICK-START-WORKFLOW.md                     → docs/guides/quick-start-workflow.md
START-HERE.md                               → docs/guides/start-here.md
STARTUP.md                                  → docs/guides/startup.md

# Implementation Summaries → docs/summaries/
BOOTSTRAP-FIXES-DEPLOYED.md                 → docs/summaries/bootstrap-fixes-deployed.md
BOOTSTRAP-FIXES-SUMMARY.md                  → docs/summaries/bootstrap-fixes-summary.md
CLAUDE-FLOW-SETUP-COMPLETE.md              → docs/summaries/claude-flow-setup.md
CLAUDE-FLOW-FULL-FEATURES-CONTAINERIZATION.md → docs/summaries/containerization-features.md
CONTAINERIZATION-SUMMARY.md                 → docs/summaries/containerization.md
DEPLOYMENT-COMPLETE-SUMMARY.md              → docs/summaries/deployment.md
RUVECTOR-IMPLEMENTATION-COMPLETE.md         → docs/summaries/ruvector-implementation.md

# Troubleshooting → docs/troubleshooting/
DOCKER-TROUBLESHOOTING.md                   → docs/troubleshooting/docker.md
```

**Keep in Root:**
- `README.md` - Primary project README
- `CLAUDE.md` - Claude Code configuration

**Actions:**
1. Create subdirectories: `docs/guides/`, `docs/summaries/`, `docs/troubleshooting/`
2. Move files with `git mv` to preserve history
3. Update any references in root README.md

---

### 1.2 Duplicate Config Files Cleanup
**Target:** Consolidate duplicate/backup configs
**Effort:** 20 minutes
**Risk:** None - these are backups/examples

**Files to Move/Archive:**
```bash
# Move to _archive/config-backups-2026-01-18/
claude-flow.config.json.backup
claude-flow.config.minimal.json             # Keep as reference in docs/examples/
.mcp.json.backup-20260116-035516
batch-config.json                            # Archive if unused
validation-output.txt                        # Archive
validation-results.json                      # Archive
```

**Actions:**
1. Create `_archive/config-backups-2026-01-18/`
2. Move backup files
3. Create `docs/examples/configs/` for reference configs

---

### 1.3 Empty/Minimal Directories
**Target:** Remove or consolidate empty/minimal directories
**Effort:** 15 minutes
**Risk:** None

**Directories to Review:**
```bash
./nul                    # Remove (appears to be accidental file)
./devcontainer           # Merge with .devcontainer if duplicate
./gitea                  # Review and potentially archive if unused
./.gemini                # Review usage - archive if historical
./.roo                   # Review usage - potentially archive
./.serena                # Review usage - potentially archive
```

**Actions:**
1. Verify directories are unused
2. Archive or remove as appropriate
3. Document decision in consolidation log

---

## ⚙️ TIER 2: MODERATE (4-5 hours)
**Requires updating some references, moderate complexity**

### 2.1 Script Consolidation
**Target:** Move 12 root scripts to `scripts/` with proper organization
**Effort:** 1.5 hours
**Risk:** Low - need to update CI/CD and documentation references

**Files to Move:**
```bash
# Operational Scripts → scripts/operations/
bootup.ps1                    → scripts/operations/bootup.ps1
bootup.sh                     → scripts/operations/bootup.sh
shutdown.ps1                  → scripts/operations/shutdown.ps1
shutdown.sh                   → scripts/operations/shutdown.sh
start-with-redis.ps1          → scripts/operations/start-with-redis.ps1
start-with-redis.sh           → scripts/operations/start-with-redis.sh

# Maintenance Scripts → scripts/maintenance/
doctor.ps1                    → scripts/maintenance/doctor.ps1
doctor.sh                     → scripts/maintenance/doctor.sh
maintenance.ps1               → scripts/maintenance/maintenance.ps1
maintenance.sh                → scripts/maintenance/maintenance.sh
check-health.ps1              → scripts/maintenance/check-health.ps1
verify-ready.ps1              → scripts/maintenance/verify-ready.ps1
```

**Dependencies to Update:**
- `.github/workflows/*.yml` - Update script paths
- `package.json` - Update script references
- Documentation referencing these scripts
- Any Docker configurations running these scripts

**Actions:**
1. Create `scripts/operations/` and `scripts/maintenance/`
2. Move files with `git mv`
3. Update all references (grep for script names)
4. Test critical scripts still work
5. Update README.md with new paths

---

### 2.2 Docker Configuration Consolidation
**Target:** Move 9 docker-compose files to `infra/docker/`
**Effort:** 1 hour
**Risk:** Moderate - need to update documentation and CI/CD

**Files to Move:**
```bash
# Create structure: infra/docker/compose/
docker-compose.yml                          → infra/docker/compose/docker-compose.yml
docker-compose.bitwarden-mcp.yml           → infra/docker/compose/bitwarden-mcp.yml
docker-compose.cloudflare.yml              → infra/docker/compose/cloudflare.yml
docker-compose.dockerhub-mcp.yml           → infra/docker/compose/dockerhub-mcp.yml
docker-compose.docker-mcp.yml              → infra/docker/compose/docker-mcp.yml
docker-compose.infisical.yml               → infra/docker/compose/infisical.yml
docker-compose.memory.yml                  → infra/docker/compose/memory.yml
docker-compose.sequential-thinking-mcp.yml → infra/docker/compose/sequential-thinking-mcp.yml
docker-compose.voice.yml                   → infra/docker/compose/voice.yml

# Move Dockerfiles
Dockerfile                                  → infra/docker/Dockerfile
Dockerfile.optimized                        → infra/docker/Dockerfile.optimized
```

**Dependencies to Update:**
- `docker-compose` commands in scripts
- CI/CD workflows
- Documentation (especially DOCKER-TROUBLESHOOTING.md)
- `.dockerignore` references

**Additional Work:**
- Create `infra/docker/compose/README.md` explaining each compose file
- Add convenience script: `scripts/docker/compose.sh` to handle compose file selection

**Actions:**
1. Create `infra/docker/compose/` directory
2. Move files with `git mv`
3. Create wrapper script for docker-compose commands
4. Update all script references
5. Update documentation
6. Test docker-compose still works

---

### 2.3 Environment File Organization
**Target:** Move 16 .env files to `infra/env/` or `configs/env/`
**Effort:** 1.5 hours
**Risk:** Moderate - need careful reference updates, security implications

**Files to Move:**
```bash
# Active Environment Files → infra/env/
.env                            # KEEP IN ROOT (active config)
.env.development               → infra/env/development.env
.env.production                → infra/env/production.env

# Claude Flow Configs → configs/env/claude-flow/
.env.claude-flow               → configs/env/claude-flow/default.env
.env.dev.claude-flow           → configs/env/claude-flow/dev.env
.env.prod.claude-flow          → configs/env/claude-flow/prod.env

# Worker Configs → configs/env/workers/
.env.worker-3060               → configs/env/workers/3060.env
.env.worker-3090ti             → configs/env/workers/3090ti.env
.env.worker-5090               → configs/env/workers/5090.env
.env.orchestrator              → configs/env/workers/orchestrator.env

# Templates/Examples → docs/examples/env/
.env.example                   → docs/examples/env/example.env
.env.master                    → docs/examples/env/master.env
.env.template                  → docs/examples/env/template.env
.env.cloudflare.example        → docs/examples/env/cloudflare.env
.env.orchestration.template    → docs/examples/env/orchestration-template.env

# CI Environment → ci/env/
.env.ci                        → ci/env/ci.env
```

**SECURITY CONSIDERATIONS:**
- Verify `.gitignore` covers new locations
- Update `.env` loading logic in applications
- Check for hardcoded `.env` paths in code
- Consider using `dotenv-vault` or similar for production

**Dependencies to Update:**
- Application environment loading code
- Docker configurations
- Scripts that source .env files
- CI/CD workflows
- Documentation

**Actions:**
1. Create directory structure
2. Update `.gitignore` for new paths
3. Move files with `git mv`
4. Update all code references to .env files
5. Test environment loading works
6. Update documentation

---

### 2.4 Test File Organization
**Target:** Consolidate test artifacts
**Effort:** 30 minutes
**Risk:** Low

**Files to Move:**
```bash
# Test Scripts → tests/scripts/
test-sqlite-import.js          → tests/scripts/sqlite-import.test.js
test-sqlite-simple.js          → tests/scripts/sqlite-simple.test.js
```

**Actions:**
1. Move test files to `tests/scripts/`
2. Update any test runners
3. Verify tests still run

---

## 🔧 TIER 3: COMPLEX (4-6 hours)
**Deep integrations, many dependencies, requires careful planning**

### 3.1 Configuration File Reorganization
**Target:** Organize JSON/YAML configs by purpose
**Effort:** 2 hours
**Risk:** High - config files are referenced by many tools

**Files to Organize:**

**KEEP IN ROOT (Tool Expectations):**
```bash
package.json                   # MUST stay in root (npm/pnpm)
package-lock.json              # MUST stay in root (npm)
pnpm-lock.yaml                 # MUST stay in root (pnpm)
pnpm-workspace.yaml            # MUST stay in root (pnpm)
tsconfig.json                  # MUST stay in root (TypeScript)
tsconfig.base.json             # MUST stay in root (TypeScript)
turbo.json                     # MUST stay in root (Turborepo)
jest.config.js                 # Can stay (Jest auto-detects)
playwright.config.ts           # Can stay (Playwright auto-detects)
.eslintrc.json                 # Can stay (ESLint auto-detects)
.prettierrc.json               # Can stay (Prettier auto-detects)
```

**Move to configs/ with Tool Configuration:**
```bash
# configs/ci/
.audit-ci.json                 → configs/ci/audit-ci.json
.releaserc.json                → configs/ci/releaserc.json
.syncpackrc.json               → configs/ci/syncpackrc.json
.turborc                       → configs/ci/turborc
codecov.yml                    → configs/ci/codecov.yml

# configs/development/
.editorconfig                  → configs/development/editorconfig
.yamllint.yml                  → configs/development/yamllint.yml
devcontainer.json              → configs/development/devcontainer.json

# configs/mcp/
.mcp.json                      → configs/mcp/default.json
mcp.json                       → configs/mcp/mcp.json (or merge with default)
.mcp.json.development          → configs/mcp/development.json
.mcp.json.production           → configs/mcp/production.json

# configs/integrations/
.infisical.json                → configs/integrations/infisical.json
.jjconfig                      → configs/integrations/jjconfig
```

**Tool Updates Required:**
- ESLint: Add `--config configs/ci/audit-ci.json` or update package.json scripts
- Semantic Release: Update `.releaserc.json` path in CI
- Syncpack: Update config path in package.json
- Codecov: Update path in CI workflows
- MCP: Update application MCP loading logic

**Actions:**
1. Create config subdirectories
2. Move files one category at a time
3. Update tool configurations
4. Update CI/CD workflows
5. Test each tool still works
6. Document configuration locations

---

### 3.2 Directory Structure Optimization
**Target:** Consolidate similar-purpose directories
**Effort:** 2 hours
**Risk:** High - many cross-references

**Consolidation Opportunities:**

**Merge/Organize Hidden Directories:**
```bash
# Consolidate agent coordination
./.claude              → Keep (active Claude config)
./.claude-flow         → Keep (active Claude Flow)
./.claude-flow@alpha   → Archive or merge with .claude-flow
./.claude-plugin       → Archive if unused, or document purpose

# Consolidate version control hooks
./.githooks            → Keep
./.gitea               → Archive if not using Gitea
./.husky               → Keep (Git hooks)

# Consolidate AI tool configs
./.gemini              → Document purpose or archive
./.hive-mind           → Keep (active hive-mind config)
./.swarm               → Keep (active swarm state)

# Consolidate other hidden directories
./.codanna             → Archive if unused
./.manypkg             → Keep (monorepo tool)
./.research            → Keep (active research data)
./.turbo               → Keep (Turborepo cache)
./.venv                → Keep (Python virtual env)
```

**Visible Directory Consolidation:**
```bash
# Consolidate similar purposes
coordination/          → memory/coordination/ (merge)
memory/                → Keep as primary memory location

# Application assets
assets/                → apps/shared/assets/ OR Keep in root

# Bootstrap/Setup
bootstrap/             → infra/bootstrap/ OR scripts/bootstrap/
devcontainer/          → .devcontainer/ (merge duplicates)

# Data directories
data/                  → Keep (application data)
prompts/               → data/prompts/ OR configs/prompts/

# Workflow directories
workflows/             → .github/workflows/ (if GitHub Actions)
                      OR infra/workflows/ (if other orchestration)
```

**Dependencies to Update:**
- Import paths in code
- Script references
- Configuration paths
- Documentation

**Actions:**
1. Analyze dependencies for each directory
2. Create consolidation plan for each group
3. Execute moves incrementally
4. Update references after each move
5. Test functionality after each move
6. Document new structure

---

### 3.3 Test and CI Infrastructure
**Target:** Consolidate test configs
**Effort:** 1 hour
**Risk:** Moderate

**Files to Organize:**
```bash
# Test Configurations → tests/config/
jest.config.js                 → tests/config/jest.config.js
jest.config.integration.js     → tests/config/jest.integration.config.js
jest.config.unit.js            → tests/config/jest.unit.config.js
jest.setup.js                  → tests/config/jest.setup.js
playwright.config.ts           → tests/config/playwright.config.ts

# Backup configs
jest.config.js.backup          → _archive/test-config-backups/
jest.setup.js.backup           → _archive/test-config-backups/
```

**Dependencies to Update:**
- Update `package.json` test scripts with `--config` flag
- Update CI workflows
- Update Jest/Playwright config inheritance

**Actions:**
1. Create `tests/config/`
2. Move test configs
3. Update package.json scripts
4. Update CI workflows
5. Test all test types still run

---

## 🚨 TIER 4: INGESTION - DEFER
**Too complex for immediate consolidation, requires pipeline redesign**

### 4.1 Ingestion App Analysis
**Status:** Recently moved back from archive to `apps/ingestion`
**Effort:** 8-12 hours (separate project)
**Risk:** Very High - complex pipeline dependencies

**Current State:**
- Location: `apps/ingestion/`
- Status: Active (moved back from `_archive/ingestion-historical-2026-01-18/`)
- Complexity: Data ingestion pipeline with many external dependencies

**Recommendation:** **DEFER** - Leave in `apps/ingestion/` for now

**Reasons to Defer:**
1. Complex data pipeline dependencies
2. May have external service integrations
3. Recently restored from archive (indicates ongoing work)
4. Requires dedicated architecture review
5. Could break production data flows

**Future Work:**
- Create `docs/architecture/ingestion-pipeline.md`
- Document all ingestion dependencies
- Create ingestion refactoring plan as separate project
- Consider microservice extraction

---

## 📊 Apps Folder - ALREADY WELL ORGANIZED

### Status: ✅ NO CONSOLIDATION NEEDED

The `apps/` folder is well-structured with 15 applications:
- mortgage-assistant (Port 3000)
- ratehunter-landing (Port 3001)
- nexus-dashboard (Port 3002)
- nyra-admin (Port 3003)
- ratehunter (Port 3009)
- crm, crm-dashboard, data, docs, landing
- shadcn-tweakcn, webapp
- ingestion (recently restored)
- assets (shared assets)

**Recommendation:** Keep current structure, add comprehensive README documenting ports and purposes.

---

## 📋 Implementation Roadmap

### Week 1: Easy Wins (Tier 1)
**Day 1-2: Documentation & Cleanup**
- [ ] Move documentation files to docs/ subdirectories
- [ ] Archive duplicate/backup configs
- [ ] Remove/consolidate empty directories
- **Estimated Time:** 2-3 hours

### Week 2: Moderate Complexity (Tier 2)
**Day 1: Scripts & Docker**
- [ ] Consolidate scripts to scripts/ subdirectories
- [ ] Move Docker configs to infra/docker/
- [ ] Test Docker compose still works
- **Estimated Time:** 2.5 hours

**Day 2: Environment & Tests**
- [ ] Organize .env files
- [ ] Update environment loading
- [ ] Move test files
- **Estimated Time:** 2 hours

### Week 3: Complex Changes (Tier 3)
**Day 1: Configuration Files**
- [ ] Reorganize JSON/YAML configs
- [ ] Update tool configurations
- [ ] Test all tools work
- **Estimated Time:** 2-3 hours

**Day 2: Directory Structure**
- [ ] Consolidate hidden directories
- [ ] Merge similar-purpose directories
- [ ] Update all references
- **Estimated Time:** 2-3 hours

### Post-Consolidation
- [ ] Update all documentation with new paths
- [ ] Create MIGRATION-GUIDE.md for team reference
- [ ] Run full test suite
- [ ] Update CI/CD pipelines
- [ ] Create PR with consolidation changes

---

## 🎯 Success Metrics

### Before Consolidation
- Root-level files: 73+ items
- Documentation: Scattered across root
- Scripts: Mixed in root folder
- Configs: 18 JSON files in root
- Risk: High (hard to navigate, easy to modify wrong file)

### After Consolidation (Target)
- Root-level files: <25 essential items
- Documentation: Organized in docs/ with categories
- Scripts: Organized by purpose in scripts/
- Configs: Organized by tool/purpose in configs/
- Risk: Low (clear structure, obvious locations)

### Quality Gates
- ✅ All tests pass
- ✅ CI/CD pipelines successful
- ✅ Docker compose works
- ✅ Scripts execute correctly
- ✅ Documentation accurate
- ✅ No broken references

---

## 🚀 Quick Start Commands

### Prerequisites
```bash
# Create memory backup before starting
npx @claude-flow/cli@latest memory store --key "pre-consolidation-backup" --value "$(date)" --namespace consolidation

# Create git branch for consolidation work
git checkout -b consolidation/tier-1-easy-wins
```

### Execute Tier 1 (Safe to start immediately)
```bash
# 1. Documentation consolidation
mkdir -p docs/guides docs/summaries docs/troubleshooting
git mv ARCHON-COMPLETE-SETUP-GUIDE.md docs/guides/archon-setup.md
git mv QUICK-START-WORKFLOW.md docs/guides/quick-start-workflow.md
# ... (continue with all doc moves)

# 2. Archive backups
mkdir -p _archive/config-backups-2026-01-18
git mv claude-flow.config.json.backup _archive/config-backups-2026-01-18/
git mv .mcp.json.backup-20260116-035516 _archive/config-backups-2026-01-18/

# 3. Commit Tier 1
git commit -m "consolidation(tier-1): Move documentation and archive backups

- Move 13 documentation files to docs/ subdirectories
- Archive backup configuration files
- Remove empty/duplicate directories

Tier 1 complete: 2-3 hours, low risk"
```

---

## 📝 Notes & Considerations

### Git History Preservation
- Use `git mv` for all moves to preserve file history
- Create descriptive commit messages for each tier
- Consider separate PRs for each tier for easier review

### Rollback Strategy
- Tag repository before starting: `git tag pre-consolidation-2026-01-18`
- Keep backup branch: `git branch backup/pre-consolidation`
- Test thoroughly before merging to main

### Team Communication
- Share this document with team before starting
- Schedule consolidation work during low-activity periods
- Notify team of path changes
- Update team IDE configurations

### Tools That May Break
- ESLint config paths
- Prettier config paths
- Jest config paths
- Docker compose references
- CI/CD workflow paths
- Custom scripts with hardcoded paths

### Post-Consolidation Tasks
- [ ] Update .gitignore for new directory structure
- [ ] Update README.md with new paths
- [ ] Create ARCHITECTURE.md documenting structure
- [ ] Update CLAUDE.md with new paths
- [ ] Update team documentation/wiki
- [ ] Announce changes to team

---

## 🤝 Dependencies & Risks

### Critical Dependencies
1. **CI/CD Pipelines** - Must update all workflow files
2. **Docker Compose** - Update all compose file references
3. **NPM Scripts** - Update package.json script paths
4. **Environment Loading** - Update .env loading logic
5. **Test Runners** - Update config paths

### Risk Mitigation
1. **Incremental Changes** - One tier at a time
2. **Automated Testing** - Run full test suite after each tier
3. **Peer Review** - Have another developer review changes
4. **Rollback Plan** - Keep tagged backup for quick revert
5. **Documentation** - Update docs immediately after changes

### Potential Issues
- **Broken Imports** - Search for hardcoded paths in code
- **CI/CD Failures** - Test locally with act (GitHub Actions)
- **Docker Build Failures** - Test docker build after moves
- **Environment Loading Failures** - Test all apps start
- **Script Execution Failures** - Test critical scripts

---

## 📚 Reference Commands

### Find All References to a File
```bash
# Find in code
grep -r "filename.ext" --exclude-dir=node_modules --exclude-dir=.git

# Find in git history
git log --all --full-history -- path/to/file

# Find in documentation
rg "filename" -g "*.md"
```

### Test After Moves
```bash
# Run full test suite
pnpm test

# Test Docker builds
docker-compose build

# Test scripts
./scripts/operations/bootup.sh
./scripts/maintenance/doctor.sh

# Test CI locally (with act)
act -j test

# Start applications
pnpm dev
```

### Verify No Broken References
```bash
# Check for broken symlinks
find . -type l ! -exec test -e {} \; -print

# Check for broken imports (example for .env)
rg "\.env(?!\.)" --type ts --type js

# Check for hardcoded paths
rg "C:\\Dev\\Projects" --type ts --type js
```

---

**Document Status:** Ready for Implementation
**Next Action:** Create consolidation branch and begin Tier 1
**Owner:** Development Team
**Timeline:** 3 weeks (1 week per tier)
