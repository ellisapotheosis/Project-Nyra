# Target Directory Structure - Option A Reorganization

**Goal:** Reduce from 592 files to ~300 files with clear organization

## Proposed Directory Structure

```
docs/
├── README.md                          # Main docs index
├── CLAUDE.md                          # Claude Code configuration (keep in root)
│
├── guides/                            # User guides (consolidated)
│   ├── README.md
│   ├── QUICK-START.md                 # Single consolidated quick start
│   ├── SETUP-GUIDE.md                 # Main setup guide
│   ├── TESTING-QUICKSTART.md
│   └── WINDOWS_QUICK_START.md
│
├── architecture/                      # Architecture docs
│   ├── README.md
│   ├── adr/                          # Architecture Decision Records
│   ├── diagrams/                     # Architecture diagrams
│   ├── REPOSITORY-ARCHITECTURE.md
│   ├── DISTRIBUTED-MEMORY.md
│   └── INFRASTRUCTURE.md
│
├── deployment/                        # Deployment guides
│   ├── README.md
│   ├── PRODUCTION-GUIDE.md
│   ├── DOCKER-GUIDE.md
│   ├── INFISICAL-SETUP.md
│   └── services/                     # Per-service deployment
│       ├── nexus-router.md
│       ├── lobechat.md
│       └── sequential-thinking-mcp.md
│
├── development/                       # Development docs
│   ├── README.md
│   ├── PATTERNS.md
│   ├── TURBOREPO-SETUP.md
│   ├── LANGUAGE-TEMPLATES.md
│   └── archon-os-BUILD.md
│
├── operations/                        # Operations guides
│   ├── README.md
│   ├── ROLLBACK-PROCEDURES.md
│   ├── DISASTER-RECOVERY.md
│   ├── DOCKER-OPERATIONS.md
│   └── CLEANUP-CHECKLIST.md
│
├── api/                              # API documentation
│   ├── README.md
│   └── examples/
│       ├── mcp/
│       ├── rest-api/
│       └── websocket/
│
├── security/                         # Security docs
│   ├── README.md
│   ├── SECURITY-AUDIT.md
│   └── BEST-PRACTICES.md
│
├── references/                       # External references
│   ├── README.md
│   ├── archon-os-wiki/            # Keep as-is (reference material)
│   └── archon-os-examples/        # Keep as-is (reference examples)
│
├── ai-context/                       # AI assistant context files
│   ├── README.md
│   ├── project-structure.md
│   ├── docs-overview.md
│   └── MCP-ASSISTANT-RULES.md
│
├── workflows/                        # Workflow documentation
│   ├── README.md
│   └── SPARC-IMPLEMENTATION.md
│
├── bootstrap/                        # Bootstrap documentation
│   ├── README.md
│   ├── complete-package-guide.md
│   └── consolidation-kit-readme.md
│
├── claude-configs/                   # Claude config files per app/service
│   ├── README.md
│   └── [service]-CLAUDE.md
│
├── _archive/                         # Historical/obsolete docs
│   ├── README.md
│   ├── reports-2026-01/             # January 2026 consolidation reports
│   ├── deprecated-infra/
│   ├── deprecated-integrations/
│   └── old-guides/
│
└── cleanup/                          # This reorganization effort
    ├── README.md
    ├── DOCS-REORGANIZATION-PLAN.md
    ├── DUPLICATE-ANALYSIS-DETAILED.md
    ├── TARGET-DIRECTORY-STRUCTURE.md (this file)
    └── MIGRATION-MAPPING.md
```

## Key Principles

### 1. Clear Categorization
- **guides/** - User-facing "how to" documentation
- **architecture/** - System design and decisions
- **deployment/** - Production deployment instructions
- **development/** - Developer workflows and patterns
- **operations/** - Day-to-day operations (monitoring, rollback, DR)

### 2. README Files
- **Current:** 166 README.md files
- **Target:** ~20-25 README files
- **Keep:** One README.md per major directory (11 main + subdirs)
- **Remove:** Redundant and empty READMEs in reference materials

### 3. File Consolidation
- Merge duplicate guides (QUICK-START × 3 → 1)
- Combine similar deployment docs
- Consolidate dated reports into archive

### 4. Archive Strategy
- Move completed reports to `_archive/reports-2026-01/`
- Keep for historical reference
- Don't delete (might be needed later)

## Migration Categories

### Category A: Keep in Place (Well-organized)
- `references/archon-os-wiki/` - External reference, keep as-is
- `references/archon-os-examples/` - External examples, keep as-is
- `api/examples/` - Properly organized

### Category B: Consolidate (Duplicates)
- Multiple QUICK-START.md → Single in guides/
- Multiple SETUP-GUIDE.md → Single in guides/
- Multiple deployment guides → Organized in deployment/

### Category C: Archive (Obsolete/Historical)
- Dated reports (2026-01-*)
- Consolidation summaries (work complete)
- Old audit reports
- Deprecated integration docs

### Category D: Reorganize (Wrong location)
- Root-level docs → Move to appropriate subdirectories
- Scattered setup guides → Consolidate in guides/
- Infrastructure docs → Move to architecture/ or operations/

## Expected Results

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total Files | 592 | ~300 | 49% |
| README Files | 166 | ~25 | 85% |
| Root Files | ~40 | ~2 | 95% |
| Duplicate Sets | 10+ | 0 | 100% |
| Total Size | 13MB | ~7MB | 46% |

## Validation Criteria

✅ Each major directory has exactly one README.md
✅ No duplicate filenames across docs/
✅ All dated reports archived
✅ All cross-references updated
✅ File count ≤ 300
✅ Clear categorization (no "misc" or "other")

## Next Steps

1. Create detailed migration mapping (file-by-file)
2. Execute migrations in batches
3. Update all internal links
4. Create directory README files
5. Validate and generate reports
