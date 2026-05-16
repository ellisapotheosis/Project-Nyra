# CRM And Twenty Integration Spec

## Intent

Twenty CRM remains the system of record. Nyra's webapp should provide a broker-safe CRM mirror and integration controls without trying to rebuild the full Twenty UI.

## Source Material

- `services/crm-api/SPEC.md`: CRM API boundary and Twenty GraphQL wrapper intent.
- `apps/twenty-crm/**`: Docker, integration, MCP, scripts, docs, and env references.
- `apps/mortgage-crm/src/infrastructure/external/twenty-crm.service.ts`: prototype Twenty integration concept.
- `apps/nyra-webapp/app/crm/page.tsx`: current shallow CRM mirror.
- `screenshots/twenty-shell/index.png`: placeholder only; do not copy visually.

## Canonical CRM Objects

Contact:

- Person identity, email, phone, address, consent flags, DNC state.

Lead:

- Source, campaign eligibility, lead score, loan purpose, loan amount, status, broker assignment.

Loan/Application:

- Borrower scenario, property, product type, documentation stage, milestone, disclosures.

Campaign Enrollment:

- Campaign ID, current step, status, pause reason, next touch, last touch, retry state.

Communication Log:

- Channel, provider, direction, content summary, provider status, timestamps, CRM link.

Quote:

- Scenario options, assumptions, source, expiration, approval state, artifact links.

Compliance Event:

- STOP, unsubscribe, consent update, DNC, quiet-hour block, reply pause, disclosure event.

Broker Task:

- Manual follow-up, owner, due date, associated lead/quote/application.

## CRM API Boundary

Preferred path:

- Frontend calls webapp API/service adapters.
- Business services call `services/crm-api`.
- `crm-api` wraps Twenty and returns stable Nyra-facing contracts.

Allowed exceptions:

- `/crm/settings` may expose diagnostic details about raw Twenty object/field mappings.
- Dedicated Twenty MCP or integration services may call Twenty directly.

Never:

- Browser UI directly mutates Twenty.
- Assistant directly mutates Twenty.
- n8n becomes the owner of CRM data.

## `/crm` Page Requirements

UI blocks:

- CRM status hero: connected/offline/degraded, last successful sync, queue depth, failures.
- Object map: Contact, Lead, Loan/Application, Campaign Enrollment, Communication Log, Quote, Compliance Event, Broker Task.
- Recent writes: created/updated records, source service, result, timestamp.
- Recent failures: object, operation, reason, retry status.
- Data freshness: cached versus canonical labels.
- Twenty deep link: access-gated external link.
- Manual action card: missing secrets, webhook setup, field mapping, owner dashboard tasks.

Actions:

- Run read-only health check.
- Run dry-run sync.
- Retry failed sync where backend supports it.
- Open field mapping settings.

## `/crm/settings` Page Requirements

UI blocks:

- Credentials health.
- Required secrets list.
- Webhook endpoint status.
- Field mapping table.
- Object mapping table.
- Sync policy: direction, conflict handling, retry count.
- Dry-run tester.
- Owner action checklist.

Required warnings:

- Show when using local mock/demo data.
- Show when the Gitea/dev repo target is unavailable.
- Show when Twenty is linked but not writable.

## CRM Sync UX

Every CRM-backed page should show:

- CRM object ID or “not synced.”
- Last sync timestamp.
- Sync state: synced, pending, failed, stale, read-only.
- Failure reason where known.
- Retry availability.

On CRM offline:

- Keep cached read-only views visible.
- Disable CRM-write actions.
- Keep assistant CRM mutation actions disabled.
- Show “open Twenty” only if access-gated URL is configured.

## Integration Error States

Credential missing:

- Show which secret/config is missing without revealing secret values.
- Link to owner manual action docs.

Field mapping missing:

- Show affected object and field.
- Disable writes for affected workflow.

Webhook unreachable:

- Show expected callback URL.
- Show last delivery attempt if available.

Conflict:

- Show Twenty as canonical.
- Show local cached value separately.
- Require explicit broker/operator review before overwriting.

## Twenty UI Strategy

- Do not copy `apps/twenty` into webapp.
- Do not visually merge the bare Twenty shell.
- Add access-gated “Open Twenty CRM” links from `/crm`, lead cockpit, and integration hub.
- Build broker-safe CRM summaries in webapp; leave advanced admin/data model operations in Twenty.
