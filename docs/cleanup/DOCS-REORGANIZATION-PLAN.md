# Documentation Reorganization Plan - Project Nyra

## Executive Summary
Current state: 578 markdown files across 100+ subdirectories with heavy duplication, poor organization, and mixed content types. This plan consolidates into 8 focused directories with clear separation of concerns.

## Current Assessment

### Critical Issues
1. **Duplicates Identified:**
   - 5+ architecture documents covering similar ground
   - 8+ setup/deployment guides with overlapping content
   - Multiple archon-os configuration docs
   - Scattered infrastructure documentation
   - Redundant troubleshooting guides

2. **Organizational Gaps:**
   - No AI vs Manual task separation
   - Prompts mixed with documentation (docs/prompts/)
   - Bootstrap scripts and docs scattered
   - SPARC methodology incomplete structure
   - Configuration references in multiple locations
   - API documentation minimal

3. **Outdated Content:**
   - _deprecated folder partially populated
   - V2 vs V3 migration docs still present
   - Old containerization approaches
   - Obsolete workflow patterns

## Target Folder Structure

```
/docs
├── /ai-automatable/          # Tasks Claude/AI can execute autonomously
├── /manual-tasks/            # Step-by-step human action guides
├── /architecture/            # Consolidated architecture documentation
├── /api/                     # API references and examples
├── /deployment/              # Deployment guides and runbooks
├── /configuration/           # Configuration references
├── /sparc/                   # SPARC methodology documentation
├── /cleanup/                 # Consolidation reports and logs
└── /references/              # External examples and templates (unchanged)
```

## Detailed Migration Plan

### 1. /ai-automatable/ (NEW)
**Purpose:** Documentation for tasks that Claude Code/AI can fully automate

**Content to Migrate:**
- docs/prompts/archon-os/ → ai-automatable/prompts/
- docs/bootstrap/archon-os/ → ai-automatable/bootstrap/
- docs/workflows/examples/ → ai-automatable/workflows/
- Root automation guides:
  * archon-os-QUICK-START.md → ai-automatable/quick-start.md
  * archon-os-OPTIMIZATION-QUICK-REF.md → ai-automatable/optimization-reference.md
  * archon-os-V3-OPTIMIZATIONS.md → ai-automatable/v3-optimizations.md

**New Structure:**
```
ai-automatable/
├── prompts/              # AI agent prompts
├── bootstrap/            # Auto-bootstrap scripts and docs
├── workflows/            # Automated workflow definitions
├── quick-start.md        # AI-driven quick start
├── optimization-reference.md
└── v3-optimizations.md
```

### 2. /manual-tasks/ (NEW)
**Purpose:** Step-by-step guides requiring human intervention

**Content to Migrate:**
- docs/guides/ → manual-tasks/setup/
- docs/user-setup-guidance/ → manual-tasks/user-setup/
- docs/troubleshooting/ → manual-tasks/troubleshooting/
- Root setup guides:
  * SETUP-GUIDE.md → manual-tasks/setup/primary-setup-guide.md
  * QUICK-START.md → manual-tasks/setup/quick-start.md
  * WINDOWS_QUICK_START.md → manual-tasks/setup/windows-quick-start.md
  * COMPLETE-SETUP-GUIDE.md → manual-tasks/setup/complete-setup.md

**New Structure:**
```
manual-tasks/
├── setup/                # Setup and installation
├── user-setup/           # User-specific configurations
├── troubleshooting/      # Problem resolution
├── runbooks/             # Operational procedures
└── maintenance/          # Maintenance tasks
```

### 3. /architecture/ (CONSOLIDATE)
**Purpose:** Unified architecture documentation

**Content to Consolidate:**
- ARCHITECTURE.md (simple, keep as index)
- architecture/distributed-memory-architecture.md → architecture/distributed-memory.md
- mcp-ecosystem-architecture.md → architecture/mcp-ecosystem.md
- distributed-ai-infrastructure.md → architecture/distributed-ai.md
- DOCKER_WSL_MIGRATION_ARCHITECTURE.md → architecture/docker-wsl-migration.md
- architecture/WARP.md → architecture/warp-integration.md
- architecture/WEBSOCKET-IMPLEMENTATION.md → architecture/websockets.md
- architecture/PARALLEL-WORKFLOW-SPLIT.md → architecture/parallel-workflows.md

**Duplicates to Merge:**
- DEPLOYMENT_SUMMARY.md + deployment-guide.md → architecture/deployment-architecture.md
- MIGRATION_ARCHITECTURE_SUMMARY.md → architecture/migration-patterns.md

**New Structure:**
```
architecture/
├── README.md             # Architecture overview (from ARCHITECTURE.md)
├── adr/                  # Architecture Decision Records
├── diagrams/             # Architecture diagrams
├── distributed-memory.md
├── mcp-ecosystem.md
├── distributed-ai.md
├── deployment-architecture.md
├── migration-patterns.md
├── warp-integration.md
├── websockets.md
└── parallel-workflows.md
```

### 4. /api/ (ENHANCE)
**Purpose:** API documentation and examples

**Current State:** Minimal - only examples/
**Content to Add:**
- API-REFERENCE.md → api/reference.md
- MCP_TOOL_REGISTRY.md → api/mcp-tools.md
- docs/api/examples/ (keep as-is)

**New Structure:**
```
api/
├── reference.md          # Complete API reference
├── mcp-tools.md          # MCP tool registry
├── examples/
│   ├── mcp/
│   ├── rest-api/
│   └── websocket/
└── schemas/              # OpenAPI/JSON schemas (NEW)
```

### 5. /deployment/ (CONSOLIDATE)
**Purpose:** Deployment guides and procedures

**Content to Consolidate:**
- DEPLOYMENT_SUMMARY.md → deployment/summary.md
- deployment-guide.md → deployment/primary-guide.md
- PRODUCTION-DEPLOYMENT-GUIDE.md → deployment/production.md
- deployment/4PC-DEPLOYMENT-GUIDE.md (keep)
- deployment/archon-os-PRODUCTION-CONTAINERIZATION.md (keep)
- deployment/LOBECHAT-DEPLOYMENT.md (keep)
- deployment/letta-MCP-DEPLOYMENT-PLAN.md (keep)
- deployment/MEM0-MCP-DEPLOYMENT-PLAN.md (keep)
- deployment/OPEN-WEBUI-DEPLOYMENT-PLAN.md (keep)
- CONTAINERIZATION-GUIDE.md → deployment/containerization.md
- MIGRATION_GUIDE.md → deployment/migration.md

**Duplicates to Archive:**
- INFISICAL_DEPLOYMENT_GUIDE.md (merge into deployment/security.md)

**New Structure:**
```
deployment/
├── README.md             # Deployment overview
├── summary.md            # High-level summary
├── primary-guide.md      # Main deployment guide
├── production.md         # Production deployment
├── containerization.md   # Docker/container guides
├── migration.md          # Migration procedures
├── security.md           # Security deployment
├── 4pc-distributed.md    # 4-PC setup
├── archon-os-prod.md   # archon-os production
└── services/             # Individual service deployments
    ├── lobechat.md
    ├── letta-mcp.md
    ├── mem0-mcp.md
    └── open-webui.md
```

### 6. /configuration/ (NEW)
**Purpose:** Configuration references and examples

**Content to Migrate:**
- CONFIGURATION.md → configuration/overview.md
- ENVIRONMENT_VARIABLES.md → configuration/environment-variables.md
- claude-configs/ → configuration/claude/
- configs/ → configuration/examples/
- BEST-PRACTICES-GUIDE.md → configuration/best-practices.md
- archon-os-VERSION-COMPARISON.md → configuration/version-comparison.md

**New Structure:**
```
configuration/
├── overview.md           # Configuration overview
├── environment-variables.md
├── best-practices.md
├── version-comparison.md
├── claude/               # Claude-specific configs
├── examples/             # Example configurations
└── backup/               # Config backups (from configs/backup)
```

### 7. /sparc/ (ENHANCE)
**Purpose:** SPARC methodology documentation

**Current State:** Partially populated
**Content to Add:**
- Keep existing structure
- Add missing methodology docs

**Structure (Enhanced):**
```
sparc/
├── README.md             # SPARC methodology overview
├── specifications/       # Phase 1: Specification docs
├── pseudocode/           # Phase 2: Pseudocode examples
├── architecture/         # Phase 3: Architecture designs
├── refinement/           # Phase 4: Refinement processes
├── completion/           # Phase 5: Completion checklists
├── templates/            # SPARC templates
└── examples/             # Complete SPARC workflows (NEW)
```

### 8. /cleanup/ (NEW)
**Purpose:** Consolidation reports and logs

**Content to Migrate:**
- CONSOLIDATION-COMPLETE-REPORT-2026-01-19.md
- CONSOLIDATION-LOG.md
- CONSOLIDATION-MASTER-PLAN-2026-01-18.md
- CONSOLIDATION-PRIORITIES.md
- CONSOLIDATION-RISK-MATRIX.md
- CONSOLIDATION-RISKS-MITIGATION.md
- CLEANUP-COMPLETE.md
- All consolidation and cleanup logs

**New Structure:**
```
cleanup/
├── reports/              # Consolidation reports
├── logs/                 # Operation logs
├── risk-assessments/     # Risk analysis docs
└── archive-index.md      # Index of archived content
```

### 9. Folders to Keep As-Is
- /references/            # External examples and templates
  - archon-os-examples/
  - archon-os-wiki/
  - templates-library/

### 10. Content to Archive
**Move to /docs/_deprecated/:**

**Outdated Guides:**
- COMPREHENSIVE-BOOTSTRAP-EXTRACTION-PLAN.md
- CAMPAIGN_MIGRATION.md
- CICD_ANALYSIS_REPORT.md
- COMPARISONS.md (outdated comparisons)

**Superseded Documentation:**
- CONTEXT-tier2-component.md
- CONTEXT-tier3-feature.md
- DIFY_ACTIVEPIECES_N8N.md (if no longer relevant)
- LOAN-LIFECYCLE.md (business docs - consider moving to separate repo)
- MORTGAGE-BROKERAGE-PROCESSES.md (business docs)

**Old Analysis:**
- CONTAINERIZATION-RESEARCH-REPORT.md
- INFRASTRUCTURE-ANALYSIS.md
- PROJECT-VISION-ANALYSIS.md
- QUOTE_FORMULA_PORTING_REPORT.md

**Historical Status:**
- HIVE-MIND-STATUS.md
- INFRASTRUCTURE-HEALTH-SUMMARY.md
- INTEGRATION_STATUS_AND_NEXT_STEPS.md

### 11. Root-Level Cleanup
**Keep at /docs root:**
- README.md (main index)
- CLAUDE.md (project instructions)
- ARCHITECTURE.md (high-level pointer to architecture/)

**Move from root:**
- All other .md files to appropriate subdirectories

## Duplicate Resolution Strategy

### Architecture Duplicates
**Primary:** architecture/README.md (from ARCHITECTURE.md)
**Consolidate into it:**
- Simple routing info (All LLM + MCP traffic routes through Nexus)
- Links to detailed docs in architecture/

### Setup Guide Duplicates
**Primary:** manual-tasks/setup/primary-setup-guide.md
**Merge from:**
- SETUP-GUIDE.md
- COMPLETE-SETUP-GUIDE.md
- guides/SETUP-INDEX.md
**Keep separate:**
- quick-start.md (5-minute version)
- windows-quick-start.md (Windows-specific)

### Deployment Duplicates
**Primary:** deployment/primary-guide.md
**Merge from:**
- deployment-guide.md
- DEPLOYMENT_SUMMARY.md (as overview section)

### archon-os Duplicates
**Primary:** ai-automatable/quick-start.md
**Merge from:**
- archon-os-QUICK-START.md
- archon-os-SETUP.md
- archon-os-PLUGINS-SETUP.md
**Archive:**
- archon-os-VERSION-COMPARISON.md → configuration/version-comparison.md

## Migration Execution Plan

### Phase 1: Create New Structure (Day 1)
1. Create all new directories
2. Create README.md files for each section
3. Set up navigation structure

### Phase 2: Migrate AI-Automatable (Day 2)
1. Move prompts to ai-automatable/prompts/
2. Move bootstrap to ai-automatable/bootstrap/
3. Move workflows to ai-automatable/workflows/
4. Consolidate root-level automation docs

### Phase 3: Migrate Manual Tasks (Day 3)
1. Move guides/ to manual-tasks/setup/
2. Move troubleshooting/
3. Move user-setup-guidance/
4. Consolidate root-level setup docs

### Phase 4: Consolidate Architecture (Day 4)
1. Create architecture/README.md
2. Migrate and rename architecture docs
3. Merge duplicate architecture files
4. Update cross-references

### Phase 5: Enhance API & Configuration (Day 5)
1. Move API docs
2. Move configuration docs
3. Create schemas/ directory
4. Organize claude-configs/

### Phase 6: Consolidate Deployment (Day 6)
1. Merge deployment guides
2. Organize service-specific docs
3. Update deployment procedures

### Phase 7: Archive Outdated Content (Day 7)
1. Move deprecated docs to _deprecated/
2. Create archive index
3. Document what was archived and why

### Phase 8: Cleanup & Verification (Day 8)
1. Update all cross-references
2. Update root README.md
3. Create navigation guide
4. Verify no broken links
5. Document the reorganization

## Success Metrics

1. **Reduction:** 578 files → ~300 active files (48% reduction)
2. **Duplication:** 0 duplicate guides after consolidation
3. **Findability:** Clear categorization (AI vs Manual vs Reference)
4. **Maintainability:** Single source of truth for each topic
5. **Navigation:** <3 clicks to any document

## Rollback Plan

1. All migrations done via git
2. Keep _root_md_archive/ as backup
3. Each phase is a separate commit
4. Can revert by phase if issues found

## Post-Reorganization Maintenance

1. **Update CLAUDE.md** to reference new structure
2. **Create docs/NAVIGATION.md** with quick-find guide
3. **Add docs/CONTRIBUTING.md** for future doc contributions
4. **Set up automated link checker** (GitHub Action)
5. **Monthly review** of new docs for proper placement

---
**Generated:** 2026-01-21
**Status:** Ready for execution
**Estimated Effort:** 8 days (1 hour per day for careful migration)
