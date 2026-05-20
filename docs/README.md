# Project Nyra Documentation

**Last Updated**: 2026-05-20
**Status**: Active architecture and operations documentation

## 📋 What's in This Folder (Root)

This root directory contains the active Project Nyra architecture references, execution plans, runbooks, owner-only action lists, and selected completion reports. Historical or superseded material should stay under `docs/archive/` or another clearly named archive/research folder.

## 📂 Directory Structure

| Directory                  | Purpose                                    | Key Files                                           |
| -------------------------- | ------------------------------------------ | --------------------------------------------------- |
| **architecture/**          | System architecture, ADRs, diagrams        | ARCHITECTURE.md, distributed-memory-architecture.md |
| **adr/**                   | Architecture decision records              | Decision records                                    |
| **apps/**                  | App surface documentation                  | APPS-FOLDER-ARCHITECTURE.md                         |
| **deployment/**            | Deployment guides and infrastructure notes | Deployment checklists                               |
| **manual-tasks/**          | Human-required procedures                  | Manual setup guides                                 |
| **operations/** / **ops/** | Operational runbooks                       | Local dev and secrets runbooks                      |
| **infra/**                 | Infrastructure reports and routing notes   | Cloudflare, CSP, and service registry reports       |
| **research/**              | Research and historical investigations     | Integration and deprecated-stack research           |
| **archive/**               | Archived/obsolete files                    | Historical documentation                            |

## 🚀 Quick Navigation

**Getting Started**: Start with [`BOOTSTRAP_RUNBOOK.md`](BOOTSTRAP_RUNBOOK.md) and [`ops/LOCAL_DEV_RUNBOOK.md`](ops/LOCAL_DEV_RUNBOOK.md)

**Architecture**: See [`MASTER_ARCHITECTURE.md`](MASTER_ARCHITECTURE.md)

**Apps Plan**: See [`EXECUTION_PLAN_APPS.md`](EXECUTION_PLAN_APPS.md)

**Infrastructure Plan**: See [`EXECUTION_PLAN_INFRA.md`](EXECUTION_PLAN_INFRA.md)

**Owner Actions**: See [`OWNER_MANUAL_ACTIONS.md`](OWNER_MANUAL_ACTIONS.md)

**Prompt Pack Execution**: See [`PROMPT_PACK_EXECUTION.md`](PROMPT_PACK_EXECUTION.md)

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

| Document                                             | Purpose                                     |
| ---------------------------------------------------- | ------------------------------------------- |
| [MASTER_ARCHITECTURE.md](MASTER_ARCHITECTURE.md)     | Authoritative target architecture           |
| [EXECUTION_PLAN_APPS.md](EXECUTION_PLAN_APPS.md)     | Product/app/service implementation playbook |
| [EXECUTION_PLAN_INFRA.md](EXECUTION_PLAN_INFRA.md)   | Infrastructure and runtime playbook         |
| [OWNER_MANUAL_ACTIONS.md](OWNER_MANUAL_ACTIONS.md)   | Owner-only dashboard/MFA/credential tasks   |
| [PROMPT_PACK_EXECUTION.md](PROMPT_PACK_EXECUTION.md) | Imported prompt-pack execution mapping      |
