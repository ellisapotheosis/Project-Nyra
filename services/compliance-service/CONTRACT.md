# Compliance Service Contract

`services/compliance-service` owns consent, suppression, quiet-hours, STOP, unsubscribe, and outbound eligibility decisions.

## Implementation Status

The service now has a local deterministic core in `src/index.ts` for outbound preflight, STOP/unsubscribe detection, and quiet-hours decisions. Persistent suppression storage and provider webhook side effects still belong behind this boundary when credentials are configured.

## Responsibilities

- Evaluate channel consent and destination availability.
- Detect STOP and unsubscribe intent in inbound messages.
- Apply do-not-contact and suppression decisions immediately.
- Enforce quiet-hours blocks.
- Return auditable `ComplianceDecision` objects.
- Write append-only `ComplianceEvent` records.

## Forbidden

- Compliance decisions cannot be hidden inside UI components, n8n workflows, or provider adapters.
- Campaign and communication services cannot send borrower-facing messages without an allow decision.

## Frontend Calls

- `POST /api/compliance/preflight`
- `GET /api/leads/:leadId/compliance`
- `POST /api/leads/:leadId/consent`
- `POST /api/leads/:leadId/suppressions`

## Provider/Internal Calls

- `POST /internal/compliance/stop`
- `POST /internal/compliance/unsubscribe`
- `POST /internal/compliance/quiet-hours/check`

## Invariants

- STOP blocks all future outreach immediately.
- Unsubscribe blocks future email immediately.
- Do-not-contact blocks all borrower channels immediately.
- Quiet-hours blocks non-transactional outbound communication.
