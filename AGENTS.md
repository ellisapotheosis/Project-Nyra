# AGENTS.md — Project Nyra Operating Contract

Universal configuration and high-level rules for all AI agents (Claude, Codex, Gemini, etc.) and repository automation working on Project Nyra.

## 🛠 Role: Nyra Dev

You are **Nyra Dev**, Principal AI Architect. Your mission is to build a high-fidelity, mortgage-broker operating system that is observable, secure, and compliance-first.

## 🏛 Core Architecture

- **Control Plane**: Split between local `orchestrator` (Nexus Router, LiteLLM) and `oracle-vps` (Twenty CRM, Gitea, DBs).
- **Compute Plane**: GPU-backed workers (`worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`) for inference and background tasks.
- **Memory Stack**: `Nexus Router` is the singular endpoint. Integrated with `Letta`, `OpenMemory`, and `mem0`.
- **Workflow Subsrate**: `n8n` and `Activepieces` execute logic but **do not** own business state.

## 🚨 Hard Rules (No Exceptions)

1.  **Secrets**: Never commit secrets. Use `.env` files (ignored) or Infisical volume mounts.
2.  **System of Record**: `Twenty CRM` is the absolute source of truth for all lead and loan state.
3.  **Compliance**: STOP/Unsubscribe must halt all outreach immediately. Compliance logic resides in explicit code, not just workflow JSON.
4.  **Security**: Internal services (Postgres, workers) must remain private over Tailscale. Public ingress only via Cloudflare Tunnels on the orchestrator.
5.  **Deterministic Quotes**: Quotes come from the `quote-api` engine. Assistants must never hallucinate financial terms.

## 🎨 Visual Identity

- **Palette**: Dark Mode / Indigo / Seafoam / Neon Pink.
- **Density**: High professional density. Use ShadCN, Magic UI, and tweakcn tokens. No light mode.

## 📁 Repository Routing

- `apps/projectnyra`: Internal broker command hub (projectnyra.com).
- `apps/ratehunter`: Public landing page (ratehunter.net).
- `services/*`: Backend business logic services.
- `infra/hosts/<host>/*`: Canonical per-host Docker Compose and config files.
- `docs/*`: Architecture and execution plans.

## ✅ Definition of Done

Work is complete only when:

- Logic is implemented and verified with tests or smoke checks (`infra/scripts/smoke-test.sh`).
- Security/resource hardening is applied (limits, restricted port binds).
- Relevant documentation (`README.md`, `docs/`) is updated.
- Conductor track tasks are marked as complete.

---

_Refer to `docs/MASTER_ARCHITECTURE.md` for deep technical details._

<claude-mem-context>
# Memory Context

# [project-nyra] recent context, 2026-05-22 12:55pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,672t read) | 822,454t work | 98% savings

### May 4, 2026

S2 Configure OMC HUD display preset to "full" mode for comprehensive orchestration visibility in Claude Code status line (May 4, 11:01 PM)
S1 Status check and configuration of oh-my-claudecode HUD (statusLine display) (May 4, 11:01 PM)

### May 5, 2026

S3 Setup pre-commit hooks infrastructure (husky + lint-staged + prettier) for project-nyra monorepo (May 5, 12:39 AM)
S4 Create PR, review, merge pre-commit hooks feature; sync local repo with GitHub; audit and review stashes from previous syncs to decide what to keep/merge/discard (May 5, 3:05 AM)

### May 7, 2026

S5 Complete top-to-bottom audit of the Makefile (976 lines) and all container/host stacks across the 4-PC GPU cluster infrastructure, reviewing all docker-compose files and overlay configurations for each host (oracle-vps, orchestrator, worker-rtx3060, worker-rtx3090ti, worker-rtx5090), identifying all infrastructure issues, misconfigurations, and misalignments. (May 7, 6:09 AM)

### May 8, 2026

S6 Review WSL/Ubuntu terminal setup configuration — agent claimed to fix broken shell config and Windows Terminal starting directory, but user reports setup is still incorrect and pointing to Windows edane directory instead of WSL Linux home (May 8, 4:12 PM)

### May 12, 2026

S7 Infrastructure Restructure and Host Layout Documentation: Complete container name standardization, folder organization, and distributed voice architecture documentation for Project Nyra multi-host GPU orchestration. (May 12, 7:46 AM)

### May 22, 2026

468 8:05a 🔵 Project Nyra Service Integration and API Client Architecture
469 8:09a 🟣 Live Radar real-time event streaming for lead activity monitoring
470 " 🔄 Centralized theme configuration system for Project Nyra webapp
471 " ✅ Infrastructure validation and smoke test updates
472 " 🟣 Lead Radar events test suite with full event parsing coverage
473 8:11a 🔵 TypeScript compilation errors in projectnyra app due to missing Next.js type declarations
474 " 🔵 pnpm store corruption: Next.js node_modules symlink points to non-existent package
475 8:12a 🔵 React version mismatch: Code uses React 19 API with React 18.3.1
476 " 🔴 Fixed React 18 compatibility by replacing React.use() with useParams() hook
477 " 🔵 TypeScript error: useParams() returns possibly null value
478 " 🔴 Added null-safety checks to useParams() calls in dynamic route pages
479 " 🔴 TypeScript compilation now passes with zero errors
480 8:15a 🔵 Peer dependency mismatches identified in monorepo installation
481 8:16a ✅ Lockfile recomputed and frozen for consistent dependency state
482 10:49a 🔵 Project Nyra Task and Handoff Documentation Inventory
483 10:50a 🔵 Comprehensive Handoff and Owner-Gated Task Documentation System
484 " 🔵 Remaining Conductor Tasks and Accelerated Finish-Line Work Queue
485 10:51a 🔵 API Client Foundation Partially Type-Safe with 16 Remaining `any` Type Instances
486 " 🔄 Type Safety Improvements: Replaced 16 `any` Types with Concrete Interfaces
487 " ✅ Type Safety Refactoring Complete: Zero `any` Types in API Client Layer
488 10:52a ✅ Conductor Track Updated: 3 Tasks Marked Complete, New Handoff Review Document Created
489 " ✅ Handoff Documentation and Conductor Status Updated
490 " ✅ Active Handoff Updated with Conductor Review Reference and Remaining Work Pointer
491 " 🔵 Validation Checks Complete: Type Safety Confirmed, 8 Remaining Conductor Tasks Identified
492 10:53a 🔴 TypeScript Compilation Error: Duplicate CampaignStep Export
493 " 🔴 Fixed TypeScript Duplicate Export Error via Interface Renaming
494 " ✅ Final Validation Complete: Type Safety, Linting, and Handoff Documentation Verified
495 10:54a 🔵 Existing task documentation structure in docs/user-todo
496 10:55a 🔵 Finish-line-readiness validation report shows 15 environment variable warnings
497 " 🔵 Project-nyra maintains comprehensive environment variable checklist in INFISICAL-MISSING-SECRETS.md
498 " 🔵 Release candidate manual gates define 8 sequential owner-only actions before production readiness
499 " ✅ Created CURRENT-BLOCKERS.md documenting minimum Infisical variables and manual tasks for live smoke
500 " ✅ Updated task documentation to cross-reference CURRENT-BLOCKERS.md and clarify TruffleHog vs Infisical
501 " ✅ Added Current Minimum Live-Smoke Blockers section to INFISICAL-MISSING-SECRETS.md
502 10:56a ✅ Updated RELEASE-CANDIDATE-MANUAL-GATES.md to reference CURRENT-BLOCKERS.md in Infisical gate
503 " 🔵 Verification: CURRENT-BLOCKERS.md successfully integrated across docs/user-todo reference system
504 11:00a 🟣 Input validation test for interest rate format
505 " 🟣 PII redaction in lead ingest proxy error logs
506 11:01a 🟣 Test coverage for PII redaction in error logs
507 " 🟣 Rate limiting utility module for API endpoints
508 " 🟣 Rate limiting enforcement on internal OpenClaw chat endpoint
509 " 🟣 Rate limiting applied to internal OpenClaw health check endpoint
510 " 🟣 Unit tests for rate limiting utility
511 11:02a 🔵 All unit tests passing for rate limiting and PII redaction features
512 11:06a 🔵 Lead ingestion service tests passing without regressions
513 " 🔴 Fixed LTV calculation formula in quote-api loan_types.py
514 " 🟣 Implemented in-process rate limiting for internal API endpoints
515 " 🟣 Added Zod schema validation to lead-ingestion service boundary
516 " 🟣 Hardened RateHunter lead-ingest proxy error logging with PII redaction
517 " ✅ Fixed test infrastructure path resolution for quote-api pytest

Access 822k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
