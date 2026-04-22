# EXECUTION_PLAN_APPS.md

Software engineering playbook for Project Nyra.

## Scope

This document covers:

- CRM integration
- lead ingestion
- campaign runtime
- compliance logic
- communication logging
- quote engine
- admin UI
- landing page
- broker/customer webapp
- OpenClaw assistant integration

## Product rules

- Twenty CRM is the system of record.
- n8n is internal glue, not the business brain.
- OpenClaw is the assistant surface, not the CRM.
- Compliance logic is explicit code, with tests.

## Target repo layout

```text
apps/
  admin/
  webapp/
  landing/

services/
  api-gateway/
  crm-api/
  lead-ingestion/
  campaign-service/
  compliance-service/
  communication-service/
  quote-service/
  assistant-service/
  webhook-service/

packages/
  crm-types/
  compliance-domain/
  campaign-domain/
  quote-domain/
  shared/
  ui/

workflows/
  n8n/
```

## Phase 1 — CRM data layer

### Goals
- Deploy and stabilize Twenty CRM
- Model mortgage-specific objects
- Build shared CRM client package and service wrapper

### Core objects
- `LOAN`
- `CAMPAIGN_ENROLLMENT`
- `COMMUNICATION_LOG`
- `QUOTE`

### Contact extensions
- consent_email
- consent_sms
- consent_voice
- consent_timestamp
- lead_source
- lead_score
- do_not_contact

### Required package
- `packages/crm-client`
- `services/crm-api`

## Phase 2 — Lead ingestion

Build `services/lead-ingestion` to:

- accept raw lead payloads
- normalize and validate fields
- dedupe against Twenty CRM
- write cleaned records
- assign campaign eligibility
- log ingestion audit events

Expected routes:
- `POST /api/leads`
- `POST /api/leads/ingest`
- `GET /api/leads/:id`

## Phase 3 — Campaign engine

Build `services/campaign-service` to own:

- campaign definitions
- scheduled steps
- pause/resume
- reply-based pausing
- STOP-based cancellation
- quiet hours
- per-channel eligibility
- enrollment state

n8n may execute steps, but campaign logic belongs here.

## Phase 4 — Compliance

Build `services/compliance-service` to own:

- STOP/unsubscribe handling
- do-not-contact enforcement
- channel consent
- quiet hours
- suppression audit logs
- contact-level compliance state

Required invariants:
- STOP must halt all future outreach immediately
- unsubscribe must be honored immediately
- reply must pause automation and notify broker

## Phase 5 — Communication service

Build `services/communication-service` to own:

- outbound send requests
- provider callbacks
- inbound replies
- message/call logging
- CRM timeline sync

Channels:
- email
- sms
- voice / voicemail

## Phase 6 — Quote engine

Build `services/quote-service` to own:

- 3-option quote generation
- payment calculations
- cost breakdowns
- quote PDFs
- quote history and expiration

Important:
- quotes come from the quote service only
- assistant must never fabricate quote terms

## Phase 7 — App surfaces

### apps/admin
Build the operator/admin portal with:
- dashboard
- lead list/detail
- campaign management
- quote management
- communications timeline
- compliance controls
- assistant tooling panel
- provider/settings pages

### apps/webapp
Build the broker/customer-facing application with:
- intake
- status
- quote views
- document collection
- assistant/chat experience via OpenClaw

### apps/landing
Build the marketing and lead-capture landing experience.

## UI standards

Use everywhere:
- Next.js App Router
- TypeScript
- Tailwind
- shadcn/ui
- Magic UI
- shared tweakcn palette/tokens

## Acceptance criteria

Applications are considered ready when:

- lead ingestion writes correct CRM records
- campaign engine schedules and stops correctly
- STOP/reply/unsubscribe rules work immediately
- quote engine outputs deterministic 3-option scenarios
- admin UI exposes operational controls
- webapp integrates the OpenClaw chat surface
- all domain logic has tests
