# EXECUTION_PLAN_APPS.md

Software engineering playbook for Project Nyra.

## Scope

- CRM integration
- Lead ingestion
- Campaign runtime
- Compliance logic
- Communication logging
- Quote engine
- Admin UI
- Landing page
- Broker/customer webapp
- OpenClaw assistant integration

## Phase 1 — CRM data layer

- **Goals**: Stabilize Twenty CRM, model mortgage objects, build shared CRM client.
- **Core Objects**: LOAN, CAMPAIGN_ENROLLMENT, COMMUNICATION_LOG, QUOTE.
- **Contact Extensions**: Consent fields, lead source, lead score.

## Phase 2 — Lead Ingestion

- **Service**: `services/crm-api` (or specialized ingestion service).
- **Functions**: Accept raw payloads, normalize, dedupe against Twenty CRM, write records.

## Phase 3 — Campaign Engine

- **Service**: `services/campaign-engine`.
- **Functions**: Definitions, scheduled steps, pause/resume, reply-based pausing, STOP-based cancellation.

## Phase 4 — Compliance

- **Logic**: STOP/unsubscribe handling, quiet hours, suppression audit logs.
- **Invariants**: STOP/unsubscribe must halt outreach immediately.

## Phase 5 — Communication Service

- **Functions**: Outbound send requests, provider callbacks, inbound replies, timeline sync.

## Phase 6 — Quote Engine

- **Service**: `services/quote-api` (Python/FastAPI).
- **Functions**: 3-option quote generation, payment calculations, cost breakdowns.

## Phase 7 — App Surfaces

- **apps/projectnyra**: The central broker command center.
- **apps/ratehunter**: Marketing and lead capture.
