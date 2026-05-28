# Final-Cut Product Integration Plan

## Phase 1: Live CRM Write Path

- [x] Execute `CrmWritePlan` through `crm-api`.
- [x] Persist audit ledger entries for lead writes and campaign enrollment decisions.
- [x] Add tests around create/update/dedupe behavior without requiring live Twenty credentials.
- [x] Keep mock-safe UI fallback for local development, but fail closed for production writes.

## Phase 2: Audit Ledger

- [x] Add durable audit provider abstraction.
- [x] Back audit writes with Postgres when `DATABASE_URL` is configured.
- [x] Expose read/query path for lead workspace timeline.

## Phase 3: Live Workspace

- [x] Connect lead detail page to CRM-backed workspace fields.
- [x] Surface compliance, campaign, quote, and audit status from service APIs.
- [x] Add route-level tests for production fail-closed and local mock behavior.

## Phase 4: Quote And Campaign Deepening

- [x] Store quote history and approval state.
- [x] Persist campaign enrollment state and next-touch scheduling.
- [x] Wire campaign builder outputs to campaign-domain contracts.

## Phase 5: Release Hardening

- [x] Run screenshots and route smoke.
- [x] Complete Infisical env coverage checklist for the current repo surface.
- [x] Validate Cloudflare Access and MCP runbooks.
- [x] Archive prototypes only after migration/rejection report.

Validation note, 2026-05-20:

- Production build smoke passed for `apps/projectnyra` after setting the app
  build script to clear `CODEX_CI` for Next.js.
- Route smoke returned HTTP 200 for `/`, `/leads`, `/assistant`, `/quotes`,
  `/campaigns/builder`, `/tools/openclaw`, and `/admin/integrations`.
- Screenshots were captured under `tests/results/final-cut-smoke/`.
- Static runbook check confirmed Cloudflare Access and MCP owner steps are
  present in `docs/OWNER_MANUAL_ACTIONS.md`,
  `docs/infra/CLOUDFLARE-ACCESS-POLICY-PLAN.md`,
  `docs/deployment/INFISICAL-MCP-SETUP.md`, and
  `docs/deployment/DOCKER-MCP-SETUP.md`.
  Live Cloudflare/Infisical/MCP checks remain owner-gated.
- Prototype/source-material locations were reviewed and dispositioned in
  `prototype-migration-rejection-report.md`; no additional archive move was
  made because the remaining folders are reference/source snapshots rather than
  active runtime surfaces.

## Closed Autonomous Execution Queue

Closed locally on 2026-05-22. Live Cloudflare Access, MCP startup, Oracle VPS
smoke, and provider import checks remain owner-gated after Infisical secrets are
loaded.

Validation evidence:

- Conductor scan found no remaining unchecked conductor track items.
- `git diff --check` passed.
- `pnpm infra:check:infisical` passed with 5 primary stacks and 6
  secret-consuming stacks.
- Owner-only actions were consolidated into `docs/user-todo/` on 2026-05-22.
- `pnpm test` passed with 11 files and 93 tests.
- `pnpm -C apps/projectnyra lint` passed.
- `pnpm -C apps/projectnyra typecheck` passed.
- `pnpm -C apps/ratehunter lint` passed.
- `pnpm audit --audit-level=moderate` passed with no known vulnerabilities.
- `bash scripts/security/scan.sh --quick` passed; TruffleHog was unavailable,
  quick pattern secret scan passed, runtime security audit passed, and outdated
  dependencies were reported for review.
- `pnpm -w build` passed; Project Nyra built successfully and Turbo reported
  20 successful tasks.
- `pnpm -C apps/projectnyra build` passed with 30 App Router routes and the
  legacy `/500` page generated.
- `pnpm -C apps/ratehunter build` passed with the landing page, lead ingest
  proxy, and borrower chat proxy generated.
- Oracle memory-stack smoke passed on 2026-05-26 with Letta, Letta Postgres,
  Letta MCP, mem0, Qdrant, FalkorDB, OpenMemory MCP, MemPalace MCP, MemOS API,
  and MemOS MCP all reachable or container-healthy via
  `infra/scripts/smoke-memory-stack.sh`.
- mem0 functional add/search smoke passed after moving the RTX3060 768-dimensional
  embedding lane to the `mem0-nyra-768` Qdrant collection.

## Infisical Coverage Note

The local operator checklist with generated test secrets was written outside the repo at:

`/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`

Tracked conductor files must not contain generated secret values. Keep only variable names, paths, and execution guidance in repo history.

The tracked owner-facing missing-secret checklist now lives at
`docs/user-todo/INFISICAL-MISSING-SECRETS.md`.
