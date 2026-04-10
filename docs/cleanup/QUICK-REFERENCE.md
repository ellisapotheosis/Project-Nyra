# Docs Reorganization Quick Reference

## Current State
📊 **578 files** → 🎯 **~300 files** (48% reduction)

## Top 5 Problems
1. 🔄 **67 duplicate files** (architecture, setup, deployment guides)
2. 🗂️ **No AI/Manual separation** (can't find automation docs)
3. 📁 **100+ subdirectories** (too deep, confusing)
4. 📜 **120+ outdated files** (V2 docs, old analysis)
5. 🔍 **Poor navigation** (similar content in 5+ places)

## New 8-Folder Structure

| Folder | Purpose | Examples |
|--------|---------|----------|
| **ai-automatable** | AI can run these | Prompts, bootstraps, workflows |
| **manual-tasks** | Human step-by-step | Setup guides, troubleshooting |
| **architecture** | Tech design docs | System architecture, ADRs |
| **api** | API references | MCP tools, REST APIs, schemas |
| **deployment** | Deploy procedures | Production, containerization |
| **configuration** | Config references | Environment vars, best practices |
| **sparc** | SPARC methodology | 5-phase development process |
| **cleanup** | Consolidation logs | This folder + reports |

## File Location Finder

### Looking for Setup Instructions?
**Before:** Scattered across 8+ files
**After:**
- AI: `ai-automatable/quick-start.md`
- Human: `manual-tasks/setup/primary-setup-guide.md`
- Windows: `manual-tasks/setup/windows-quick-start.md`

### Looking for Architecture?
**Before:** 5 different files
**After:** `architecture/README.md` (overview) + detailed docs in `architecture/`

### Looking for Deployment?
**Before:** 5 different guides
**After:** `deployment/primary-guide.md` (comprehensive)

### Looking for archon-os Setup?
**Before:** 3+ scattered docs
**After:** `ai-automatable/quick-start.md`

### Looking for API Docs?
**Before:** Minimal, scattered
**After:** `api/reference.md` + `api/mcp-tools.md`

### Looking for Troubleshooting?
**Before:** Scattered
**After:** `manual-tasks/troubleshooting/`

## Top 10 Files to Merge

| Current Files | → | New Single File |
|---------------|---|-----------------|
| 5 architecture docs | → | `architecture/README.md` |
| 3 quick-start guides | → | `manual-tasks/setup/quick-start.md` |
| 3 setup guides | → | `manual-tasks/setup/primary-setup-guide.md` |
| 3 deployment guides | → | `deployment/primary-guide.md` |
| 3 archon-os docs | → | `ai-automatable/quick-start.md` |
| 4 infrastructure status | → | Archive in `_deprecated/` |
| 6 consolidation reports | → | `cleanup/reports/` |
| 3 config docs | → | `configuration/overview.md` |
| 2 troubleshooting | → | `manual-tasks/troubleshooting/` |
| 4 environment docs | → | `configuration/environment-variables.md` |

## Execution Options

### 🚀 Option 1: Full Migration (RECOMMENDED)
- **Time:** 8 hours (1 hour/day × 8 days)
- **Result:** Clean, organized, single source of truth
- **Risk:** Low (git-tracked, reversible)
- **Best for:** Long-term maintainability

### ⚡ Option 2: Quick Wins
- **Time:** 3 hours
- **Result:** Top duplicates resolved
- **Risk:** Very low
- **Best for:** Fast results, partial solution

### 📈 Option 3: Incremental
- **Time:** 4 weeks (1 category/week)
- **Result:** Gradual improvement
- **Risk:** Low
- **Best for:** Minimize disruption

## Migration Phases

```
Phase 1 → Create structure (1h)
Phase 2 → AI-automatable (1h)
Phase 3 → Manual tasks (1h)
Phase 4 → Architecture (1h)
Phase 5 → API + Config (1h)
Phase 6 → Deployment (1h)
Phase 7 → Archive old (1h)
Phase 8 → Cleanup + verify (1h)
```

## What Gets Archived?

**Moving to `_deprecated/`:**
- V2 migration docs (superseded)
- Old analysis reports (2+ months old)
- Historical status docs (not current)
- Obsolete comparisons
- Deprecated workflow patterns

**Total:** ~150 files archived

## Safety Measures

✅ **Safe Operations:**
- Moving files (git tracks)
- Creating new READMEs
- Adding navigation
- Archiving old content

⚠️ **Review First:**
- Merging duplicate content
- Updating cross-references
- Modifying CLAUDE.md

🚫 **Be Careful:**
- Deleting config backups
- Removing business docs
- Changing core architecture

## Success Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total files | 578 | ~300 | 48% reduction |
| Duplicates | 67 | 0 | 100% eliminated |
| Categories | Unclear | 8 clear | Organized |
| Max depth | 8+ levels | 3 levels | Simplified |
| Navigation | >5 clicks | <3 clicks | Faster |

## Key Documents to Review

1. **Full Plan:** `DOCS-REORGANIZATION-PLAN.md` (detailed migration)
2. **Summary:** `REORGANIZATION-SUMMARY.md` (findings + actions)
3. **This Guide:** `QUICK-REFERENCE.md` (you are here)

## Memory Location

```bash
# Retrieve plan from memory
npx @archon-os/cli@latest memory search --query "docs reorganization" --namespace "docs-reorganization"

# Or retrieve specific key
npx @archon-os/cli@latest memory retrieve --key "folder-structure-plan" --namespace "docs-reorganization"
```

## First Steps

### To Start Full Migration:
```bash
# 1. Review the plan
cat docs/cleanup/DOCS-REORGANIZATION-PLAN.md

# 2. Create a branch
git checkout -b docs/reorganization-2026-01

# 3. Execute Phase 1 (structure only)
# Create directories: ai-automatable, manual-tasks, etc.
```

### To Start Quick Wins:
```bash
# 1. Focus on architecture first
# Merge 5 architecture files into 1

# 2. Then setup guides
# Merge 3 setup guides into 1
```

## Questions?

- **Full details:** See `DOCS-REORGANIZATION-PLAN.md`
- **Summary:** See `REORGANIZATION-SUMMARY.md`
- **Quick lookup:** This file (QUICK-REFERENCE.md)

---
**Last Updated:** 2026-01-21
**Status:** Ready for execution
**Next Step:** Review full plan, then choose execution option
