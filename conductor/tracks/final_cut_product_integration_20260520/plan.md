# Final-Cut Product Integration Plan

## Phase 1: Live CRM Write Path

- [x] Execute `CrmWritePlan` through `crm-api`.
- [x] Persist audit ledger entries for lead writes and campaign enrollment decisions.
- [x] Add tests around create/update/dedupe behavior without requiring live Twenty credentials.
- [ ] Keep mock-safe UI fallback for local development, but fail closed for production writes.

## Phase 2: Audit Ledger

- [x] Add durable audit provider abstraction.
- [x] Back audit writes with Postgres when `DATABASE_URL` is configured.
- [ ] Expose read/query path for lead workspace timeline.

## Phase 3: Live Workspace

- [ ] Connect lead detail page to CRM-backed workspace fields.
- [ ] Surface compliance, campaign, quote, and audit status from service APIs.
- [ ] Add route-level tests for mock and service-backed behavior.

## Phase 4: Quote And Campaign Deepening

- [ ] Store quote history and approval state.
- [ ] Persist campaign enrollment state and next-touch scheduling.
- [ ] Wire campaign builder outputs to campaign-domain contracts.

## Phase 5: Release Hardening

- [ ] Run screenshots and route smoke.
- [ ] Complete Infisical env coverage.
- [ ] Validate Cloudflare Access and MCP runbooks.
- [ ] Archive prototypes only after migration/rejection report.
