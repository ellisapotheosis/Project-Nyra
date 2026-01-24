# Project Nyra Documentation

**Last Updated**: 2026-01-22
**Status**: Reorganized and production-ready

## 📋 What's in This Folder (Root)

This root directory contains **ONLY**:
- ✅ **Completion Reports** - Status reports from major initiatives
- ✅ **Step-by-Step Guides** - Manual procedures for you to follow
- ✅ **To-Do Lists** - Task checklists and action items
- ✅ **This README** - Navigation guide

All other documentation is organized in subdirectories below.

## 📂 Directory Structure

| Directory | Purpose | Key Files |
|---|---|---|
| **architecture/** | System architecture, ADRs, diagrams | ARCHITECTURE-OVERVIEW.md, ARCHITECTURE-DECISIONS.md (23 ADRs) |
| **api/** | API documentation, OpenAPI specs | API-REFERENCE.md |
| **deployment/** | Deployment guides, infrastructure | SETUP-GUIDE.md, DEPLOYMENT.md |
| **manual-tasks/** | Human-required procedures | YOUR-MANUAL-SETUP-GUIDE.md, PRODUCTION-READINESS-CHECKLIST.md |
| **ai-automatable/** | Claude-automatable tasks | AI-AUTOMATION-GUIDE.md |
| **development/** | Development guides, templates | CLAUDE-MD-V3-TEMPLATE-GUIDE.md |
| **configuration/** | Configuration references | CONFIGURATION.md |
| **sparc/** | SPARC methodology specs | SPARC-SPECIFICATIONS.md |
| **cleanup/** | Reorganization reports | Completion reports, migration logs |
| **archive/** | Archived/obsolete files | Historical documentation |

## 🚀 Quick Navigation

**Getting Started**: Start with [`manual-tasks/YOUR-MANUAL-SETUP-GUIDE.md`](manual-tasks/YOUR-MANUAL-SETUP-GUIDE.md)

**Architecture**: See [`architecture/ARCHITECTURE-OVERVIEW.md`](architecture/ARCHITECTURE-OVERVIEW.md)

**API Reference**: See [`api/API-REFERENCE.md`](api/API-REFERENCE.md)

**Deployment**: See [`deployment/SETUP-GUIDE.md`](deployment/SETUP-GUIDE.md)

**AI Automation**: See [`ai-automatable/AI-AUTOMATION-GUIDE.md`](ai-automatable/AI-AUTOMATION-GUIDE.md)

## 🔍 Finding Documentation

1. **Browse by category** using directories above
2. **Check directory README files** - each subdirectory has a README with file inventory
3. **Search by keyword** using your IDE or `grep -r "keyword" docs/`

## 📝 Adding New Documentation

When creating new docs, follow these rules (enforced by `docs/CLAUDE.md`):

- **Completion reports** → Save to docs root
- **Step-by-step guides for manual execution** → Save to docs root or `manual-tasks/`
- **Architecture docs** → `architecture/`
- **API docs** → `api/`
- **Deployment guides** → `deployment/`
- **Everything else** → Appropriate subdirectory

See `CLAUDE.md` for complete rules.

## 🎯 Key Documents

| Document | Purpose |
|---|---|
| [WHITEPAPER.md](WHITEPAPER.md) | Complete technical whitepaper (2,900+ lines) |
| [YOUR-MANUAL-SETUP-GUIDE.md](manual-tasks/YOUR-MANUAL-SETUP-GUIDE.md) | Hardware/network setup guide |
| [PRODUCTION-READINESS-CHECKLIST.md](manual-tasks/PRODUCTION-READINESS-CHECKLIST.md) | Production deployment checklist |
| [AI-AUTOMATION-GUIDE.md](ai-automatable/AI-AUTOMATION-GUIDE.md) | What Claude can automate |