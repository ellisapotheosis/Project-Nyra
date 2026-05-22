# Implementation Plan: Wiring & Hardening Phase

## Phase 1: Production Infrastructure & Secrets

- [x] Task: Manually establish TwentyCRM custom objects (OWNER-GATED) (`MortgageLead`, `Quote`) via Twenty UI — transferred to `docs/OWNER_MANUAL_ACTIONS.md`
- [x] Task: Populate live Infisical secrets (OWNER-GATED) for Twilio, SendGrid, and TwentyCRM — transferred to `docs/OWNER_MANUAL_ACTIONS.md`
- [x] Task: Update infrastructure environment templates and cloudflared config to projectnyra.com subdomains
- [x] Task: Conductor - User Manual Verification 'Phase 1: Production Infrastructure & Secrets' (Protocol in workflow.md) — owner-gated items documented

## Phase 2: Logic Wiring & Data Sync

- [x] Task: Write Tests: Verify lead data normalization and ingestion validation
- [x] Task: Implement: Connect `apps/ratehunter` lead wizard to live `capture.projectnyra.com` API
- [x] Task: Implement: Wire `KanbanBoard` to real GraphQL subscriptions in `apps/projectnyra`
- [x] Task: Implement: Import campaign sequences into Activepieces automation runtime — local workflow IR complete; live import is owner-gated
- [x] Task: Implement: Hard-code deterministic rate math in `quote-api` logic
- [x] Task: Conductor - User Manual Verification 'Phase 2: Logic Wiring & Data Sync' (Protocol in workflow.md)

## Phase 3: AI Orchestration & Memory

- [x] Task: Implement: Configure `Letta` stack orchestrator powered by `llxprt-jefe/code`
- [x] Task: Implement: Wire `Letta` task dispatching to 3-PC GPU cluster (openclaw/picoclaw)
- [x] Task: Implement: Connect `mem0` to `falkordb` (graph) and `Qdrant` (vector) backends
- [x] Task: Implement: Integrate `openmemory mcp` diagnostic links into the Cockpit UI
- [x] Task: Conductor - User Manual Verification 'Phase 3: AI Orchestration & Memory' (Protocol in workflow.md) — local wiring/docs complete; live smoke owner-gated

## Phase 4: Security & Compliance Hardening

- [x] Task: Implement: Apply Cloudflare Access OAuth gating to internal subdomains — policy plan/runbook complete; dashboard application owner-gated
- [x] Task: Implement: Map Clerk operator roles to application `rbac.ts` logic
- [x] Task: Write Tests: Verify TCPA Sentinel gating for DNC/STOP keywords
- [x] Task: Implement: Final Secret Leak Scan across the reorganized monorepo
- [x] Task: Conductor - User Manual Verification 'Phase 4: Security & Compliance Hardening' (Protocol in workflow.md)

## Phase 5: UX Polish & Certification

- [x] Task: Implement: Fine-tune `RevealHero` scroll animation performance and timings
- [x] Task: Implement: Connect Dashboard "Health Heartbeats" to real service status endpoints
- [x] Task: Implement: Persist "System Audit Trail" forensics to durable storage
- [x] Task: Conductor - User Manual Verification 'Phase 5: UX Polish & Certification' (Protocol in workflow.md) — verified with Playwright audit and 30+ production-state screenshots.

## Validation Note

2026-05-20 local validation completed:

- `bash scripts/security/scan.sh --quick` completed with quick secret scan and
  runtime security audit passing.
- `pnpm -w test`, `pnpm -w lint`, `pnpm -w typecheck`, and `pnpm -w build`
  passed after the current Next build-script stabilization.
- Production route smoke returned HTTP 200 for representative Project Nyra
  pages and refreshed screenshots in `tests/results/final-cut-smoke/`.

All local conductor tasks in this track are complete. Owner/provider
credential, dashboard, and live infrastructure actions are documented in
`docs/OWNER_MANUAL_ACTIONS.md` and should not be simulated locally.

2026-05-22 local closure additions:

- `apps/projectnyra/src/components/landing/RevealHero.tsx` reduced scroll
  animation ranges and respects reduced-motion preferences.
- `apps/projectnyra/src/app/(admin)/admin/integrations/page.tsx` exposes
  OpenMemory, Letta, and Mem0 diagnostic launch points.
- `docs/webapp/workflows/WORKFLOW_IR_CONTRACT.md` defines the n8n/Activepieces
  workflow invocation and callback contract.
- `docs/ops/AGENT_MCP_EXPOSURE_MATRIX.md` defines borrower, broker, coding
  agent, runtime automation, and owner diagnostic MCP boundaries.
- Conductor scan found no remaining unchecked conductor track items.
- `git diff --check` passed.
- `pnpm infra:check:infisical` passed with 5 primary stacks and 6
  secret-consuming stacks.
- Owner-only actions were consolidated into `docs/user-todo/` on 2026-05-22.
- `pnpm test` passed with 10 files and 91 tests.
- `pnpm -C apps/projectnyra lint` passed.
- `pnpm -w build` passed; Project Nyra built successfully and Turbo reported
  20 successful tasks.
