# Implementation Plan: Finish Line Acceleration

## Phase 1: Foundations (Error & Notifications)

- [x] Task: Implement global `ApiError` class and Next.js Error Boundaries
- [x] Task: Set up a global Toast Notification system (using Shadcn)

## Phase 2: Security & Types (The Backend Sweep)

- [x] Task: Add Zod validation to `lead-ingestion` and `quote-api` boundaries
- [x] Task: Audit and sanitize all `console.log` and logger outputs for PII
- [x] Task: Replace `any` types in `apps/projectnyra/src/lib/api/`

## Phase 3: UI/UX Deepening

- [x] Task: Refactor `LeadProfilePage` into modular components
- [x] Task: Add Skeleton Loaders to all dashboard views
- [x] Task: Apply mobile-responsive polish to the Command Deck

## Phase 4: Final Hardening & Validation

- [x] Task: Implement Rate Limiting middleware for internal API routes
- [ ] Task: Write and execute the full Playwright E2E "Happy Path" smoke test
- [ ] Task: Conductor - User Manual Verification 'Acceleration Sprint'

## 2026-05-22 Agent Review

Completed items above were verified against current source:

- `apps/projectnyra/src/lib/api/base.ts` exports `ApiError`.
- `apps/projectnyra/src/components/error-boundary.tsx` is wired from
  `apps/projectnyra/src/app/layout.tsx`.
- `apps/projectnyra/src/components/ui/toast.tsx`,
  `apps/projectnyra/src/components/ui/toaster.tsx`, and
  `apps/projectnyra/src/hooks/use-toast.ts` provide the toast surface.
- `apps/projectnyra/src/lib/api/**` no longer contains `any`.
- `services/lead-ingestion` now validates raw lead payloads with Zod before
  normalization, dedupe, CRM writes, or audit event creation.
- `services/quote-api` now rejects percent-style whole-number interest rates
  at the Pydantic boundary and uses the standard deterministic LTV formula
  `loan_amount / property_value`.
- `apps/projectnyra/src/app/api/internal/openclaw/**` is protected by an
  in-process per-client rate limiter with rate-limit response headers.
- `apps/ratehunter/src/app/api/leads/ingest/route.ts` now redacts common lead
  PII and secret tokens from proxy error logs.
- `apps/projectnyra/src/components/ui/page-skeleton.tsx` and route-local
  `loading.tsx` files cover the main broker/admin dashboard views.
- `apps/projectnyra/src/app/page.tsx` has tighter mobile spacing, responsive
  command buttons, and horizontally safe system-blocker table behavior.
- PII redaction helpers now protect RateHunter lead ingest, internal OpenClaw
  proxy error responses, quote-engine logs, and campaign-engine provider logs.
- `LeadProfilePage` now delegates sidebar compliance/intelligence controls and
  activity/pricing/composer surfaces into route-independent lead profile section
  components.

Remaining unchecked items require browser/live environment validation. Do not
mark the Playwright happy path or user-manual verification complete until the
owner-gated release-candidate setup in `docs/user-todo/` is complete.
An opt-in Playwright happy-path entry point now exists at
`tests/e2e/happy-path.test.ts`; it is skipped unless `NYRA_E2E_HAPPY_PATH=1`
is set so normal local and CI checks do not claim live readiness prematurely.

PII log sanitization is now complete for the current active surfaces reviewed in
this track. The final pass added logger-level redaction for CRM API, Letta
integration, Nexus Router, WebSocket Hub, WebSocket client debug output,
TwentyCRM MCP server logs/responses, and PocketTTS exception paths. Keep future
provider adapters on the same rule: log operation metadata, IDs, and states, not
borrower PII, raw authorization headers, provider tokens, or full upstream error
payloads.
