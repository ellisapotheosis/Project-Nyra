# lead-ingestion

Canonical service for inbound lead normalization, validation, dedupe, and CRM handoff.

## Current slice

This package owns the first in-process lead ingestion contract:

- normalizes landing-page, API, referral, and vendor-feed payloads into `@nyra/domain-models` `Lead`
- creates a deterministic dedupe key from normalized email first, then phone
- upserts through a CRM adapter-shaped boundary instead of touching CRM storage directly
- returns campaign eligibility with explicit compliance block reasons
- emits domain events for `lead.created`, `lead.updated`, `campaign.eligible`, and `campaign.ineligible`
- returns audit events for CRM mutation and campaign compliance outcomes

The default CRM/store implementations are in-memory test doubles. Production wiring should inject a Twenty-backed `ITwentyClient` and durable dedupe store.

## Validation

```bash
pnpm -C services/lead-ingestion test
pnpm -C services/lead-ingestion typecheck
pnpm -C services/lead-ingestion build
```
