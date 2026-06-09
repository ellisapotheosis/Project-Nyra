# soft-pull-credit

Consent-gated service boundary for mortgage soft-pull credit requests.

## Current slice

- Requires a borrower consent event ID before any provider request.
- Supports provider abstraction for Certified Credit, Equifax, mock, or another approved mortgage credit provider.
- Stores only request status plus credit summary needed for quote readiness.
- Redacts SSN and raw borrower identity from logs, audit metadata, and stored records.
- Emits audit events and quote-input events carrying only approved FICO/tier summary.
- Exposes REST-compatible handlers for:
  - `POST /soft-pull/request`
  - `GET /soft-pull/:id/status`
  - `GET /soft-pull/:id/summary`

The default provider and store are in-memory test doubles. Production wiring must inject a vendor-backed provider, durable store, and CRM/event-ledger publisher.

## Validation

```bash
pnpm -C services/soft-pull-credit test
pnpm -C services/soft-pull-credit typecheck
pnpm -C services/soft-pull-credit build
```
