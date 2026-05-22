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

# [project-nyra] recent context, 2026-05-22 7:42am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (16,047t read) | 177,634t work | 91% savings

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

### May 20, 2026

373 6:56p 🔴 Missing Activity Icon Import in Broker Leads Page
374 " 🔴 Fixed Test Environment and NODE_ENV Assignment in production-fail-closed Tests
375 " 🔵 Jest Setup Configuration Conflict: jest.setup.js Assumes jsdom Environment
376 6:57p 🔵 TypeScript ORIGINAL_ENV Redeclaration Error Resolved Partially
377 " 🔴 Refactored Tests to Mock Next.js Server APIs Instead of Changing Environment
378 " 🔵 Test Mock Incomplete: Response Web API Not Mocked for serviceUnavailable Function
380 6:58p 🔴 Fixed Response polyfill in production API mutation test setup
379 " 🔴 TypeScript Compilation Passing: All Type Errors Resolved
381 " ✅ Conditional Response Global Mock Added to Test Setup
383 " 🔵 CRM API architecture uses write-plan pattern with PostgreSQL audit ledger
382 " 🔄 Refactored Response Mock Setup in Test beforeEach
384 " 🟣 Production Safety Test Suite Now Passing: All Fail-Closed Behavior Verified
385 " 🟣 Audit ledger now supports querying entity history
386 6:59p ✅ Summary of Repository Changes: Production Safety Hardening Complete
387 " ✅ Jest Setup Conditional Window Mock and Audit Provider Query Support Added
388 " 🟣 CRM API REST endpoints for lead details, conversation timeline, pipeline, and quote approvals
389 " 🔵 Audit Ledger Query Integration Already Active in CRM API Server Routes
390 " 🟣 Added test coverage for PostgresAuditLedgerSink.listForEntity method
391 " ✅ Production Hardening Changes Staged on Feature Branch
392 " 🔵 TypeScript compilation errors in CRM API server endpoints
393 " 🟣 All Test Suites Passing: 6 of 6 Tests Success Across Production Safety and Supabase Configuration
394 7:00p 🔴 Fixed TypeScript compilation errors in CRM API endpoints
396 " 🔵 TypeScript compilation and type checking now pass after fixes
395 " 🟣 TypeScript Compilation Complete: Zero Errors on All Modified Code
397 " 🔵 Pre-existing Type Safety Issues Exposed in CRM API Server Routes
398 " ✅ Project plan updated to reflect completed audit ledger and workspace integration phases
399 " 🔵 Examined quote, campaign, and compliance service architecture
400 7:01p 🔵 Quote, campaign, and compliance services implement integrated lead marketing workflow
401 " 🟣 Added QuoteService with approval workflow and persistent quote history
402 " 🟣 Added QuoteService tests verifying versioning and approval workflow
404 " 🔵 Quote service tests and build pass with new QuoteService implementation
405 7:02p ✅ Phase 4 milestone completed: quote history and approval state storage
406 " 🔵 Complete Feature Integration Underway: Audit Ledger and Quote Service Persistence Being Implemented
407 " 🔵 Campaign domain implements state machine with step scheduling and approval requirements
409 " 🟣 Added campaign enrollment persistence and state management to CampaignService
408 " 🟣 Complete Audit System Integration Verified: CRM API Build Successful
411 " 🟣 Complete System Verification Successful: All Tests and Builds Passing Across All Services
410 " 🟣 Added campaign enrollment persistence tests verifying state and scheduling
412 " 🔵 Campaign service tests pass with new enrollment persistence implementation
414 " 🟣 Campaign Service Persistence Layer Implemented with State Tracking
413 " ✅ Phase 4 second milestone completed: campaign enrollment persistence and scheduling
415 " 🔵 Session work in progress on final-product-fail-closed-hardening branch
416 7:03p 🔵 Campaign Service Tests Passing but Build Configuration Issue Detected
417 " 🔵 Session accumulated ~860 lines of changes across CRM API, quote/campaign services, and webapp hardening
418 " 🔵 Webapp campaign management infrastructure spans API routes, services, and broker UI
419 " 🔵 Campaign API routes implement fail-closed pattern with mock fallback and contract enforcement
420 " 🟣 Campaign POST route hardened with fail-closed behavior and contract normalization
421 7:04p 🟣 Campaign detail routes hardened with fail-closed behavior and contract normalization on updates
422 " 🔄 Extracted campaign contract normalization to shared library module

### May 22, 2026

424 7:41a 🔵 Project Nyra Repository Status and GitHub Configuration

Access 178k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
