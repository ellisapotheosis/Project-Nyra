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

# [project-nyra] recent context, 2026-05-22 8:09am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (20,795t read) | 344,493t work | 94% savings

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

417 7:03p 🔵 Session accumulated ~860 lines of changes across CRM API, quote/campaign services, and webapp hardening
418 " 🔵 Webapp campaign management infrastructure spans API routes, services, and broker UI
419 " 🔵 Campaign API routes implement fail-closed pattern with mock fallback and contract enforcement
420 " 🟣 Campaign POST route hardened with fail-closed behavior and contract normalization
421 7:04p 🟣 Campaign detail routes hardened with fail-closed behavior and contract normalization on updates
422 " 🔄 Extracted campaign contract normalization to shared library module

### May 22, 2026

424 7:41a 🔵 Project Nyra Repository Status and GitHub Configuration
425 7:42a 🔵 Production Validation Work Completed: Build Fix, Route Smoke, and Security Scan
426 " 🔵 TypeScript Type Checking Passed on Project Nyra App
427 " 🔵 Test Suite Passed: All 91 Tests Across 10 Files
428 7:43a ✅ Prototype Migration Disposition Documented and Final-Cut Branch Created
429 " ✅ Commit Created: Final-Cut Validation Artifacts on Feature Branch
430 " 🚨 GitHub Dependabot: 762 Vulnerabilities Detected on Default Branch
431 " ✅ Pull Request #449 Created for Final-Cut Validation Artifacts
432 7:44a 🔵 PR #449 Status: CI Failures and Pending Vercel Deployments
433 " ✅ PR #449 Merged to Main: Final-Cut Validation Artifacts Integrated
434 " 🔵 No Additional Open Pull Requests: Task Requirements Complete
435 " 🔵 Repository Fully Synced: Local Main Aligned with GitHub Remote
436 7:45a 🔵 Post-Merge Generated Files: Admin Integrations and Landing Hero Components Modified
437 7:46a 🔵 Post-Merge Component Updates: Memory Stack Integration UI and Accessibility Improvements
438 7:47a 🔵 Post-Merge Component Changes Validated: TypeScript Type Safety Confirmed
439 " 🔵 Comprehensive Test Suite Passed on Post-Merge Components
440 " ✅ Follow-Up Commit Created: Memory Integrations and Hero Component Polish
441 " 🔵 Feature Branch Pushed; New Documentation Changes Detected; Dependabot Vulnerability Increase
442 " ✅ Architecture Documentation Published: Workflow Contracts and MCP Exposure Policy
443 7:48a ✅ Second Feature Commit: Workflow IR and MCP Exposure Policy Documentation
444 " ✅ Follow-Up Feature PR #450 Created: Memory Integrations and Workflow Policy
445 " 🔵 PR #450 Status: Open and Ready for Review/Merge
447 7:54a 🔵 Cloudflare API authentication inconsistency and missing tunnel IDs
448 7:55a 🟣 Owner-facing action guide package created in docs/USER-TODO
449 " 🔵 Infisical token expired; credentials unreachable during Cloudflare zone query
451 7:56a 🔵 Cloudflare API token has insufficient DNS permissions; 23+ CNAME records not configured
450 " 🟣 Spaceship and Cloudflare owner setup guide created in docs/user-todo
452 7:57a 🔵 Cloudflare API authentication root cause: Bearer token lacks DNS/tunnel permissions; email+API key works
453 " ✅ Cloudflare DNS configuration deployment initiated with corrected tunnel IDs
454 " 🟣 Cloudflare DNS records successfully deployed for Project Nyra infrastructure
455 " 🔴 Cloudflare Access app deployment blocked: projectnyra.com zone not recognized by Access API
456 " 🔵 projectnyra.com zone activation blocked: nameserver delegation incomplete at registrar
457 " 🔵 Cloudflare tunnel ingress configurations validated and ready for traffic routing
458 7:58a 🔵 DNS resolution fails for projectnyra.com subdomains; public DNS still points to old nameservers
459 " 🔵 Cloudflare tunnel ingress rules validated and configured with correct service endpoints
460 " ✅ Cloudflare infrastructure deployment summary: tunnels and DNS complete, Access apps blocked by zone status
461 7:59a ✅ Documentation updated: Cloudflare validation report and owner action items
462 8:03a 🔵 Git Repository State Assessment
463 8:04a ✅ Git Stashes Cleared
464 " 🔵 Infrastructure Work Progress Documentation Updated
465 " ✅ Owner-Facing Documentation Consolidated
466 8:05a 🔵 WebSocket Real-Time Architecture and Product Event System
467 " 🔵 Project Nyra Monorepo Structure: 2 Apps, 29 Services, 13 Packages
468 " 🔵 Project Nyra Service Integration and API Client Architecture

Access 344k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
