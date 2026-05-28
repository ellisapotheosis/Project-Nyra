# CRM API — Lead & Loan State Management

Last updated: 2026-05-24

## Overview

The CRM API is the integration layer between Project Nyra's application services and TwentyCRM,
the system of record (SOR) for all lead and loan state. Supabase holds derived app state — UI
flags, session context, consent records, and workflow cursors — but TwentyCRM is the authority
for entity identity, ownership, and history.

All mutations through this service create an audit event before the operation is confirmed.
Partial failures (CRM write succeeded, Supabase sync failed) are queued for retry rather
than rolled back.

Service path: `services/crm-api`
Env var: `TWENTY_API_URL`

---

## Core Entities

### Lead

Represents an inbound prospect before a loan opportunity is opened.

```json
{
  "id": "lead_01HXYZ",
  "external_crm_id": "twenty_person_abc123",
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "source": "website_form | referral | import | manual",
  "status": "new | contacted | qualified | converted | dead",
  "consent_status": "unknown | granted | revoked",
  "dnc": false,
  "created_at": "2026-05-24T00:00:00Z",
  "updated_at": "2026-05-24T00:00:00Z"
}
```

### Borrower

A Lead that has been qualified and attached to at least one LoanOpportunity.

```json
{
  "id": "borrower_01HABC",
  "lead_id": "lead_01HXYZ",
  "external_crm_id": "twenty_person_abc123",
  "credit_score_range": "620-639 | 640-659 | 660-679 | 680-719 | 720-759 | 760+",
  "annual_income_usd": 95000,
  "employment_type": "w2 | self_employed | retired | other",
  "self_employed_years": null,
  "co_borrower_id": "borrower_01HDEF | null"
}
```

### RealtorPartner

```json
{
  "id": "realtor_01HGHI",
  "external_crm_id": "twenty_company_xyz789",
  "name": "Alice Realty Group",
  "contact_name": "Alice Monroe",
  "contact_email": "alice@alicerealty.example",
  "contact_phone": "+15559876543",
  "referral_agreement_on_file": true,
  "active": true
}
```

### LoanOpportunity

```json
{
  "id": "opp_01HJKL",
  "borrower_id": "borrower_01HABC",
  "realtor_partner_id": "realtor_01HGHI | null",
  "external_crm_id": "twenty_opportunity_mno456",
  "stage": "prospect | pre_approval | active | conditional | clear_to_close | closed_won | closed_lost",
  "loan_purpose": "purchase | refinance | cash_out_refi | heloc",
  "target_close_date": "2026-07-15",
  "assigned_broker_id": "broker_01H000",
  "created_at": "2026-05-24T00:00:00Z"
}
```

### MortgageScenario

```json
{
  "id": "scenario_01HPQR",
  "opportunity_id": "opp_01HJKL",
  "property_address": "123 Main St, Austin TX 78701",
  "property_type": "single_family | condo | multi_family | manufactured",
  "property_value_usd": 450000,
  "loan_amount_usd": 360000,
  "ltv_pct": 80.0,
  "loan_term_years": 30,
  "loan_type": "conventional | fha | va | usda | jumbo",
  "occupancy": "primary | secondary | investment",
  "state": "TX"
}
```

---

## API Endpoints

Base URL: `$TWENTY_API_URL` (injected at runtime — never hardcoded)

### Leads

#### GET /crm/leads/:id

Returns a merged view of TwentyCRM person record plus Supabase app-state fields.

Response:

```json
{
  "data": { "...Lead entity..." },
  "supabase_state": { "last_campaign": "...", "workflow_cursor": "..." },
  "source": "twenty_crm"
}
```

#### POST /crm/leads

Creates a person record in TwentyCRM, then writes derived state to Supabase.
Emits `LeadIngested` audit event.

Request:

```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+15551234567",
  "source": "website_form",
  "consent_status": "unknown"
}
```

Response 201:

```json
{ "data": { "...Lead..." }, "audit_event_id": "evt_01HSTU" }
```

#### PATCH /crm/leads/:id

Partial update. Emits `LeadUpdated` audit event.
Cannot be used to clear `dnc: true` — use the dedicated DNC/STOP endpoint.

#### POST /crm/leads/:id/consent

Grant or revoke consent. Emits `ConsentGranted` or `ConsentRevoked`.

Request:

```json
{
  "consent_status": "granted | revoked",
  "channel": "sms | email | all",
  "source": "reply | form | broker"
}
```

#### POST /crm/leads/:id/stop

Stops all campaigns and marks lead DNC if `permanent: true`.
Emits `StopRequested` and optionally `DncAdded`.
Writes memory entry via memory service.
This endpoint is synchronous and never queued.

Request:

```json
{
  "permanent": false,
  "reason": "borrower_request | wrong_number | dnc_list",
  "source": "reply | manual"
}
```

### Opportunities

#### POST /crm/opportunities

Creates LoanOpportunity linked to a Borrower. Emits `LeadUpdated` with stage transition.

Request:

```json
{
  "borrower_id": "borrower_01HABC",
  "loan_purpose": "purchase",
  "assigned_broker_id": "broker_01H000",
  "realtor_partner_id": null
}
```

#### PATCH /crm/opportunities/:id/stage

Updates pipeline stage. Stage regressions are allowed but logged with reason.

Request:

```json
{ "stage": "pre_approval", "reason": "docs_received" }
```

### Scenarios

#### POST /crm/opportunities/:id/scenarios

Attaches a MortgageScenario to an opportunity. Used by Quote Engine before requesting rates.

---

## Sync Strategy

TwentyCRM is the system of record. Supabase mirrors derived app state only.

| Data type        | Authoritative source     | Sync direction        |
| ---------------- | ------------------------ | --------------------- |
| Person identity  | TwentyCRM                | CRM to Supabase       |
| Loan stage       | TwentyCRM                | CRM to Supabase       |
| Consent status   | Supabase (written first) | Supabase to CRM async |
| Campaign cursors | Supabase                 | Supabase-only         |
| Audit events     | Supabase                 | Supabase-only         |
| Memory entries   | Supabase                 | Supabase-only         |

Sync is event-driven via internal event bus. Supabase `crm_sync_queue` table holds
pending writes with retry metadata.

Conflict resolution: TwentyCRM wins on identity fields (name, phone, email).
Supabase wins on workflow state fields (consent, campaign cursor, STOP status).

---

## Error Handling

### Degraded Mode

If `TWENTY_API_URL` is unreachable, the CRM API enters degraded mode:

- Reads served from Supabase cache; staleness flagged in response header `X-Data-Source: cache`
- Writes queued in `crm_sync_queue` with `status: pending`
- All degraded operations emit `AuditEventCreated` with `degraded: true`
- Broker UI displays a banner: "CRM sync delayed — data may be up to N minutes stale"

### Retry Policy

| Attempt | Delay                           |
| ------- | ------------------------------- |
| 1       | immediate                       |
| 2       | 5 seconds                       |
| 3       | 30 seconds                      |
| 4       | 5 minutes                       |
| 5+      | exponential backoff, max 1 hour |

After 5 failures the item moves to `crm_sync_dead_letter` and a Slack alert fires.

### STOP/DNC is never queued

Stop and DNC writes are synchronous and fail fast. If TwentyCRM is unreachable during
a STOP request, the local Supabase state is written immediately, all outbound is blocked,
and the CRM write retries at priority-1. The outbound block is NOT lifted until the CRM
write confirms. This ensures no communication gap between local block and CRM sync.

### Audit on every mutation

The following operations always produce an audit event before returning a response:
POST /crm/leads, PATCH /crm/leads/:id, POST /crm/leads/:id/consent,
POST /crm/leads/:id/stop, POST /crm/opportunities, PATCH /crm/opportunities/:id/stage.
A mutation that cannot write its audit event must fail with 500 and must not apply
the underlying change.
