# Lead Ingestion Contract

`services/lead-ingestion` owns raw lead intake, normalization, validation, and handoff to the CRM boundary.

## Responsibilities

- Accept public/partner lead payloads.
- Normalize names, email casing, phone digits, and source attribution.
- Validate payloads with `@nyra/domain-models` lead contracts.
- Persist cleaned leads through the CRM integration boundary.
- Emit ingestion audit metadata for downstream CRM timeline and campaign eligibility.

## API

### `POST /api/leads`

Canonical app-facing lead creation endpoint.

### `POST /api/leads/ingest`

Canonical ingestion endpoint for external forms and workflow glue.

### `POST /webhook/ingest`

Legacy webhook-compatible alias. Workflow tools may call this, but the service still owns normalization and validation.

### `GET /api/leads/:id`

Read-through endpoint for a cleaned lead record by CRM id.

## Boundary Rules

- Twenty CRM remains the system of record.
- CRM writes must go through the CRM boundary, not direct frontend/database access.
- n8n and Activepieces may deliver payloads but do not own normalization, validation, or eligibility decisions.
- Campaign enrollment is decided only as an ingestion recommendation here; `services/campaign-engine` owns runtime state transitions.

## Dedupe and Enrollment Output

Every successful ingestion returns audit metadata:

- `dedupeKeys`: stable `email:*`, `phone:*`, or `phone-property:*` keys used to link repeat submissions.
- `existingLeadId`: present when the in-process dedupe index matched an earlier cleaned lead.
- `campaignEligibility`: `ENROLL`, `PENDING`, or `SUPPRESSED`.
- `recommendedCampaignId`: present only when channel consent allows enrollment.
- `suppressionReason`: present when enrollment is blocked, currently `do_not_contact`.

The in-process dedupe index exists for deterministic tests and local workflow behavior. Production cross-process dedupe must be enforced by `services/crm-api` through Twenty CRM email/phone search and custom object matching.
