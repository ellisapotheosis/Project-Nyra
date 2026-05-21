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

# [project-nyra] recent context, 2026-05-20 6:54pm PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (22,535t read) | 1,235,774t work | 98% savings

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

272 12:13a 🔵 Comprehensive filesystem search confirms 5090dlsprompts path inaccessible
274 " 🟣 CRM write plan fully integrated into Express server with REST API endpoints
275 " 🟣 Contract types for lead, audit, and write plan exported from crm-types shared package
276 " 🔵 File path resolution exhausted; no 5090dlsprompts or nyra-prompt-pack found on disk
277 12:14a 🟣 Complete CRM API Express server with endpoints, auth, quote proxy, and audit integration
278 " 🟣 PostgreSQL audit ledger sink with lazy schema creation and JSONB details storage
279 " 🟣 Extended CRM type contracts for campaigns, communications, and multi-option quotes
280 12:15a 🔴 Unit tests pass but TypeScript build fails due to composite project references and rootDir mismatch
281 " 🔵 TypeScript monorepo configuration pattern: rootDir must be project root with explicit include paths
282 " 🟣 AuditLogger from integration-adapters provides abstraction with console fallback and error handling
283 " 🟣 TwentyCRMClient provides GraphQL-based lead, quote, campaign, and communication operations
284 " 🔴 Fixed server.ts TypeScript errors: removed unused imports, fixed control flow, added composite references
285 12:16a 🔴 Fixed services/crm-api tsconfig to use project-root rootDir and explicit package includes
286 " 🟣 CRM write plan tests passing: 2 unit tests for lead creation and dedupe scenarios
287 " 🟣 CRM API build succeeded: TypeScript compilation passes with fixed configuration
288 " 🟣 Session summary: CRM write plan implementation complete with tests passing and build successful
289 12:17a 🟣 Lead-ingestion service integration with CRM write plan persistence boundary
290 " 🔵 Dependency resolution complete: pnpm-lock.yaml updated with crm-types workspace link and vitest
291 " ✅ Removed TypeScript devDependency from crm-types package.json
292 " 🟣 Final verification: CRM API and lead-ingestion tests all passing; build successful
315 12:27a 🟣 PR #441 merged: Conductor execution tracking for imported prompt packs
316 12:28a 🔵 Infrastructure Security Audit Completed for Project-Nyra
317 12:29a ⚖️ 5090 DLS prompt review established constraints and execution priority
318 " ✅ Infrastructure Security Hardening: Removed Insecure Default Passwords
319 12:30a ✅ Commit eb20580ce: 5090 prompt review merged with test validation and code formatting
321 " 🔵 Infrastructure security audit: port exposure and insecure defaults identified on oracle-vps
326 12:31a ✅ Infrastructure security hardening: environment variables made required via bash expansion syntax
323 " 🟣 PR #442 merged: 148 files added; prompt packs imported into conductor/prompts with execution tracking
329 12:33a 🔵 Docker-compose files have shared network dependencies; typecheck validation passing
332 " 🔵 Oracle-VPS shared network nyra_net defined in main docker-compose.yml; individual service compose files reference it
334 12:34a ✅ Docker-compose validation confirms hardening approach: required env vars enforce secret injection
337 " ✅ Commit 46a6f2203: Infrastructure security hardening merged with tests passing
339 12:35a 🟣 Comprehensive infrastructure security hardening across all hosts: env var requirements + resource limits
341 " 🔵 Worker infrastructure uses modular compose architecture: worker-network defined per-host, template references it
352 " ✅ Infrastructure security hardening: removed insecure secret defaults
353 " ✅ Prompt surface consolidation and canonicalization
354 " ✅ Next.js app refactoring: auth context and root page consolidation
355 " ✅ Prisma 7 migration: PostgreSQL adapter and generated client reorganization
356 " ✅ Authentication models: TypeScript type safety hardening
357 " ✅ Rate limiter middleware: TypeScript type safety and proper handler signatures
358 " 🔵 App build issues: Next.js 15.5.15 webpack module resolution with pages directory
359 " 🔵 Prompt pack execution validation: test suite now passing at scale
360 12:39a 🟣 Infrastructure Security Hardening: Fail-Closed Secret Enforcement
361 6:50p 🔵 Comprehensive environment variable audit across Project Nyra monorepo
362 6:51p 🔵 Configuration file inventory across monorepo infrastructure
363 " 🔵 Complete environment variable audit identifying 456+ secret and configuration references
364 6:52p 🔵 Complete .env.example inventory and secret requirements across all services and infrastructure hosts
365 " 🔵 Project Nyra API routes and service integration patterns with environment variable dependencies
366 " 🔵 Complete deduplicated environment variable manifest: 210 unique secrets/config parameters identified
367 6:53p ✅ Added production safety helpers to Project Nyra API configuration layer

Access 1236k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
