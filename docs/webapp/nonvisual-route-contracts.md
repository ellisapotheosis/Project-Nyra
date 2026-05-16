# Nonvisual Route Contracts

This document defines behavior for web routes without specifying visual design.

## Cockpit BFF Rules

- Browser routes call `apps/cockpit/src/app/api/internal/*`.
- BFF routes call Nyra services and Nexus.
- BFF routes redact upstream payloads before returning to browsers.
- BFF routes must not expose provider keys, raw worker URLs, raw MCP internals, database URLs, or unredacted webhook bodies.

## Route Groups

| Route group | Data source | Mutation owner | Required states |
| --- | --- | --- | --- |
| Dashboard | CRM API, campaign service, quote service | None | loading, partial, degraded, failed |
| Leads | CRM API, lead ingestion | CRM API | empty, deduped, created, failed |
| Campaigns | Campaign service | Campaign service | draft, active, paused, stopped, failed |
| Quotes | Quote service, CRM API | Quote service | estimate, approval pending, approved, expired |
| Communications | Communication service | Communication service | drafted, blocked, approval pending, sent, failed |
| Compliance | Compliance service | Compliance service | clear, blocked, suppressed, quiet-hours |
| Assistant | Nexus/OpenClaw through BFF | Owning service after approval | proposed, denied, queued, executed |
| Fleet status | Health API/runbook data | None | configured, reachable, degraded, unreachable |

## Acceptance Criteria

- Every route has an explicit loading and degraded state.
- External side effects require service and approval gates.
- Raw upstream payloads are stripped or redacted.
- Mock data is clearly local/dev only.
