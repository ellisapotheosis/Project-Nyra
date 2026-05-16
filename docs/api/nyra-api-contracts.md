# Nyra API Contracts

This is the canonical API behavior contract for Project Nyra service and BFF implementation.

## Namespace Ownership

| Namespace | Owner | Notes |
| --- | --- | --- |
| `/api/leads` | `services/lead-ingestion` and `services/crm-api` | Normalize, dedupe, create/read lead records. |
| `/api/campaigns` | `services/campaign-engine` | Campaign definitions, enrollment, pause/resume/cancel. |
| `/api/communications` | `services/communication-service` | Draft/send requests, inbound replies, provider callbacks. |
| `/api/quotes` and `/api/v1/quote` | `services/quote-api` | Quote generation, matrices, history, expiration. |
| `/api/webhooks/*` | `services/webhooks` or provider-specific service route | Signature verification and idempotent dispatch. |
| `/api/internal/*` | `apps/cockpit` BFF | Browser-safe proxy only; no business brain. |

## Request Envelope

Write requests must include or derive:

- `actorId`
- `actorRole`
- `sourceSurface`
- `correlationId`
- `idempotencyKey`
- `requestedAt`

Provider webhook requests derive actor/source from the verified provider identity.

## Response Envelope

```json
{
  "ok": true,
  "data": {},
  "correlationId": "req_...",
  "warnings": []
}
```

Errors use:

```json
{
  "ok": false,
  "error": {
    "code": "COMPLIANCE_BLOCKED",
    "message": "Human-readable safe summary",
    "details": {}
  },
  "correlationId": "req_..."
}
```

## Idempotency

All mutation endpoints must accept or derive an idempotency key. Webhooks derive keys from provider event IDs plus provider account and event timestamp. Duplicate keys return the prior result or a safe no-op.

## Mock Policy

Mocks are allowed in local development and tests. Production routes must fail closed when required provider credentials, CRM configuration, quote service URLs, or compliance gates are missing.
