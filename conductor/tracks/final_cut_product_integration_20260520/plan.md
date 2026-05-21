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

- [ ] Run screenshots and route smoke.
- [x] Complete Infisical env coverage checklist for the current repo surface.
- [ ] Validate Cloudflare Access and MCP runbooks.
- [ ] Archive prototypes only after migration/rejection report.

## Current Autonomous Execution Queue

1. Connect lead detail workspace to live CRM/service fields, preserving local mock fallback only outside production.
2. Expose audit ledger read/query path for the lead workspace timeline.
3. Persist quote history and approval state through deterministic quote-service boundaries.
4. Persist campaign enrollment state, send eligibility, and next-touch scheduling in campaign-service.
5. Validate Cloudflare Access, MCP startup, and Oracle VPS smoke after owner/provider secrets are loaded in Infisical.
6. Archive or mark prototypes only after a migration/rejection report for each app.

## Infisical Coverage Note

The local operator checklist with generated test secrets was written outside the repo at:

`/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`

Tracked conductor files must not contain generated secret values. Keep only variable names, paths, and execution guidance in repo history.
