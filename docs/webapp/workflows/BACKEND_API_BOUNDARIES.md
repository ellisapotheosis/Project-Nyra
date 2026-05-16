# Backend API Boundaries for Webapp

The frontend agent should call only these service boundaries for business behavior.

## CRM Records

Call `services/crm-api`.

- Leads, contacts, borrowers, co-borrowers
- Tasks and notes
- CRM timeline projections
- Quote mirrors
- Campaign enrollment mirrors
- Communication log mirrors

Do not call Twenty directly from the webapp.

## Lead Intake

Call `services/lead-ingestion` for raw lead capture payloads.

- Create/ingest lead: `POST /api/leads`
- External ingestion alias: `POST /api/leads/ingest`
- Read cleaned lead: `GET /api/leads/:id`

Do not normalize landing-page or partner payloads in the frontend. The service owns source defaults, phone/email cleanup, validation, CRM handoff, and initial ingestion audit metadata.

## Quotes

Call `services/quote-api`.

- Generate canonical quote: `POST /api/quotes/generate`
- Read quote: `GET /api/quotes/:id`
- Lead quote history: `GET /api/leads/:leadId/quotes`
- Approve quote: `POST /api/quotes/:id/approve`

Do not put official quote math in React components, server actions, or assistant prompts.

## Campaigns

Call `services/campaign-engine`.

- Campaign CRUD and publish
- Compliance simulation
- Enrollment create, pause, resume, stop

Do not let n8n or Activepieces become the frontend contract.

## Borrower Communication

Call `services/communication-service`.

- Inbox
- SMS/email/call/voicemail send requests
- Provider callback projections
- Timeline communication events

Every send response must carry or reference a `ComplianceDecision`.

## Compliance

Call `services/compliance-service`.

- Preflight send checks
- Consent state
- Suppression state
- STOP/unsubscribe/quiet-hours decisions

UI controls should disable unsafe sends based on service decisions, but the UI decision is advisory only. The service gate is authoritative.

## Assistant Actions

Call `services/assistant-service`, backed by `services/nyra-orchestrator` and `services/nexus-router`.

- Agent runs
- Proposed actions
- Approval/reject/execute

Risky mutations must remain proposed actions until approved and audited.

## Mock Policy

Webapp API routes may return local mock data only when `NYRA_ENABLE_MOCKS=true`. Production and service-integration runs should fail closed with a `503` if a required service URL is missing or unreachable.

## Integration Health

Use `/admin/integrations` as the read-only broker/operator service-status surface. It may show URL reachability and credential presence, but must not render secrets or expose raw worker inference endpoints.
