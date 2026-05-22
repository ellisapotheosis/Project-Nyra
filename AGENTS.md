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

# [project-nyra] recent context, 2026-05-22 3:25pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,077t read) | 834,698t work | 98% savings

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

489 10:52a ✅ Handoff Documentation and Conductor Status Updated
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
519 12:56p 🔵 Project Nyra Repository State and Blocker Landscape Assessment
520 " 🔵 Project Nyra Service Architecture and API Capability Audit
521 12:57p 🔵 Webapp UI Implementation: Lead Profile and Command Deck with Compliance Controls
522 " 🟣 PII Redaction Utility for Logs and Error Messages
523 " ✅ Integrated PII Redaction into OpenClaw Chat Proxy Route
524 " ✅ Added Test Coverage for PII Redaction Functions
525 " 🟣 PII Redaction Module for Quote Engine Service
526 12:58p ✅ Hardened Quote Engine Input Validation and Privacy Logging
527 " ✅ Test Coverage for Quote Engine Privacy and Validation
528 " 🟣 PII Redaction Module for Campaign Engine Service
529 " ✅ Integrated Privacy Redaction into Campaign Engine Messaging
530 1:11p 🔐 Sensitive data redaction implemented across logging layers
532 1:24p ✅ PR #456 merged: Close release gate gaps
533 " 🔵 Finish Line Acceleration implementation plan review complete
534 1:25p 🔵 LeadProfilePage already refactored into modular component architecture
535 " 🟣 Created new modular sub-components for LeadProfilePage refactoring
536 1:28p 🔄 Refactored LeadProfilePage to use modular sub-components
537 " 🟣 Lead Profile Page Refactored into Modular Components
538 " 🟣 E2E Happy-Path Test Added with Environment Variable Gating
539 " ✅ PR #457 Merged to Production (Phase 3 Complete)
541 3:24p 🔵 Infisical Secret Scanning Initiated

Access 835k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
