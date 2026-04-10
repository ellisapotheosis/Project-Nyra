# Project Nyra - Documentation Index

## Core Configuration

### Main Configuration (READ FIRST)
**File**: `/CLAUDE.md` (18KB)
- Claude Flow V3 project configuration
- Core swarm orchestration rules
- TDD protocol and patterns
- Agent routing and topology selection
- Auto-learning protocol
- All 16 critical instruction reminders
- Memory system integration
- Microservices architecture
- Local LLM infrastructure
- CLI commands quick reference

**When to use**:
- Setting up development environment
- Understanding swarm orchestration
- Learning TDD workflows
- Implementing features

---

## Domain-Specific Documentation

### Mortgage Domain Reference
**File**: `/docs/MORTGAGE_DOMAIN.md` (7.2KB)
- Compliance-first development requirements (TILA/RESPA/TRID)
- Domain-specific agents (5 agent types)
- Memory system usage for mortgage operations
- Mortgage workflow examples (3 complete workflows)
- Performance targets (business, technical, compliance metrics)
- Development priorities (Phase 1-4 roadmap)
- Mortgage security rules and data encryption
- Related documentation links

**When to use**:
- Working on mortgage-specific features
- Understanding compliance requirements
- Reviewing mortgage workflows
- Checking performance targets

---

## Support & Reference Documentation

### Quick Start Guide
**File**: `/docs/QUICK_START_CLAUDE_V3.md` (9.0KB)
- Quick reference card for common operations
- Critical rules summary
- TDD workflow template
- Memory operations quick reference
- Swarm topology selection guide
- CLI commands cheat sheet
- Agent routing table
- Mortgage-specific rules
- GPU worker access
- Common tasks with examples

**When to use**:
- Quick lookup during development
- Finding command syntax
- Common task templates
- Troubleshooting reference

---

## Refactoring Documentation

### Refactoring Summary
**File**: `/docs/CLAUDE_REFACTORING_SUMMARY.md` (6.9KB)
- Overview of what was refactored
- Changes made to main CLAUDE.md
- New MORTGAGE_DOMAIN.md creation
- Critical content preserved
- Benefits of refactoring
- File organization
- Backward compatibility notes
- Recommendations for use
- Optional next steps

**When to use**:
- Understanding recent changes
- Migrating workflows
- Updating team documentation
- Planning future refactoring

### Refactoring Validation Report
**File**: `/docs/REFACTORING_VALIDATION.md` (15KB)
- Detailed validation report
- Executive summary with statistics
- Critical content verification (16 rules)
- Cross-reference integrity check
- Functional verification table
- Test coverage results
- Backward compatibility confirmation
- Sign-off and recommendations

**When to use**:
- Verifying refactoring completeness
- Auditing critical rules
- Ensuring consistency
- Quality assurance

---

## Infrastructure & Deployment

### Infrastructure Documentation
**File**: `/infra/CLAUDE.md` (Referenced in main CLAUDE.md)
- Docker Compose patterns
- Kubernetes deployment patterns
- Service templates

### Archived Reports & Setup Guides
**Directory**: `/docs/cleanup/reports/`
- Previous setup guides (archived)
- Historical deployment reports

**Directory**: `/docs/performance/`
- Performance optimization analysis
- Comprehensive benchmarks

---

## External Documentation

### Whitepaper & Architecture
- **Whitepaper**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- **SPARC Workflows**: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`
- **Compliance Guide**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/COMPLIANCE_GUARDRAILS.md`
- **Stack Decisions**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/STACK_DECISIONS.md`

### Full Feature Reference
- **Claude Flow V3 Capabilities**: `.archon-os/CAPABILITIES.md`
  - All 60+ agent types
  - All 26 CLI commands with 140+ subcommands
  - All 27 hooks + 12 background workers
  - RuVector intelligence system details
  - Hive-Mind consensus mechanisms

---

## Quick Navigation

### By Role

**Project Lead/Architect**
1. Read: `/CLAUDE.md` (full configuration)
2. Review: `/docs/REFACTORING_VALIDATION.md` (quality assurance)
3. Reference: `/docs/MORTGAGE_DOMAIN.md` (domain knowledge)

**Feature Developer**
1. Start: `/docs/QUICK_START_CLAUDE_V3.md` (quick reference)
2. Work: `/CLAUDE.md` (core rules)
3. Reference: `/docs/MORTGAGE_DOMAIN.md` (if mortgage feature)

**Mortgage Domain Developer**
1. Start: `/docs/QUICK_START_CLAUDE_V3.md` (quick reference)
2. Learn: `/CLAUDE.md` (core rules)
3. Work: `/docs/MORTGAGE_DOMAIN.md` (domain reference)

**Infrastructure/DevOps**
1. Start: `/CLAUDE.md` (configuration)
2. Reference: `/infra/CLAUDE.md` (infrastructure patterns)
3. Check: `.archon-os/CAPABILITIES.md` (full CLI reference)

**New Team Member**
1. Start: `/docs/QUICK_START_CLAUDE_V3.md` (overview)
2. Read: `/CLAUDE.md` (comprehensive)
3. Bookmark: `/docs/MORTGAGE_DOMAIN.md` (for reference)
4. Save: `/docs/QUICK_START_CLAUDE_V3.md` (for lookup)

---

### By Task

**Setting up development environment**
- `/CLAUDE.md` → Quick Setup section
- `/docs/QUICK_START_CLAUDE_V3.md` → CLI Commands section

**Writing a new feature (TDD)**
- `/CLAUDE.md` → TDD Protocol section
- `/docs/QUICK_START_CLAUDE_V3.md` → TDD Workflow section

**Working on mortgage feature**
- `/CLAUDE.md` → Mortgage Domain Rules section
- `/docs/MORTGAGE_DOMAIN.md` → Full reference

**Debugging memory issues**
- `/CLAUDE.md` → Memory System Integration section
- `/docs/QUICK_START_CLAUDE_V3.md` → Memory Operations section

**Deploying to production**
- `/CLAUDE.md` → Local LLM Infrastructure section
- `/infra/CLAUDE.md` → Deployment patterns

**Understanding swarm orchestration**
- `/CLAUDE.md` → Critical Swarm Execution Rules section
- `/docs/QUICK_START_CLAUDE_V3.md` → Swarm Execution Rules section

**Checking compliance**
- `/docs/MORTGAGE_DOMAIN.md` → Compliance-First Development section
- `/CLAUDE.md` → Mortgage Domain Rules section

**Performance optimization**
- `/CLAUDE.md` → Local LLM Infrastructure section
- `/docs/performance/` → Performance reports

---

## File Statistics

| File | Size | Type | Created |
|------|------|------|---------|
| `/CLAUDE.md` | 18KB | Configuration | Refactored 2026-01-26 |
| `/docs/MORTGAGE_DOMAIN.md` | 7.2KB | Domain Reference | 2026-01-26 |
| `/docs/QUICK_START_CLAUDE_V3.md` | 9.0KB | Quick Reference | 2026-01-26 |
| `/docs/CLAUDE_REFACTORING_SUMMARY.md` | 6.9KB | Summary | 2026-01-26 |
| `/docs/REFACTORING_VALIDATION.md` | 15KB | Validation | 2026-01-26 |
| `/docs/INDEX.md` | This file | Navigation | 2026-01-26 |
| `.archon-os/CAPABILITIES.md` | 50+KB | Full Reference | Generated |

**Total Core Documentation**: ~56KB (main + supporting docs)

---

## Key Statistics

### Content Organization

- **Main Configuration**: 1 file (18KB)
- **Domain-Specific**: 1 file (7.2KB)
- **Quick References**: 1 file (9.0KB)
- **Refactoring Documentation**: 2 files (22KB)
- **Total New/Updated**: 5 files in `/docs/`

### Rule Coverage

- **Core Principles**: 5 rules
- **TDD Principles**: 3 rules
- **Mortgage Domain Rules**: 5 rules
- **Microservices Rules**: 3 rules
- **Total Documented**: 16 critical rules

### Documentation Quality

- **No duplicate rules**: ✓
- **Backward compatible**: ✓
- **Cross-references maintained**: ✓
- **Reduction goal achieved**: 62.8%

---

## How to Update This Index

When adding new documentation:
1. Create file in appropriate directory
2. Add entry to relevant section above
3. Update file statistics table
4. Add to "By Role" or "By Task" navigation if applicable
5. Update related links in main CLAUDE.md

When removing documentation:
1. Note in `/docs/cleanup/` directory
2. Update this index
3. Update any cross-references
4. Note in git commit message

---

## Last Updated

- **Date**: 2026-01-26
- **By**: Claude Code Refactoring Session
- **Status**: Production Ready
- **Validation**: All critical rules verified

---

**Start with `/CLAUDE.md` for comprehensive configuration, then use this index to navigate to specific reference materials.**
