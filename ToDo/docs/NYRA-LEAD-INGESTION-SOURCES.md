# Nyra Lead Ingestion Sources (Full Coverage)

## Must-support sources

### 1) Email leads (highest priority)
- LendingTree lead emails
- FreeRateUpdate lead emails
- LeadMailbox forwards
- Direct broker referrals / partners

### 2) API leads (where vendors permit)
- Vendor REST APIs or webhook subscriptions
- LeadMailbox APIs (if available)

### 3) Web forms
- ratehunter.net landing page forms
- SMS opt-ins / call tracking events

### 4) CRM-originating
- Manual entry in Twenty
- Imported CSVs
- Actions triggered by Dify/Composio

## Canonical pipeline
Ingest -> store raw (immutable) -> parse/normalize -> dedupe/merge -> trigger campaigns -> sync to CRM

## Minimal tables
- `lead_events` (immutable raw payloads + provenance)
- `leads` (best-known profile)
- `lead_docs` (attachments + storage refs)
- `nyra_ai.nyra.lead_chunks` (AI text chunks + embeddings)

## Storage and provenance rules
- Store original payload verbatim in `lead_events.raw_payload` (JSONB)
- Store raw email RFC822 in object storage (MinIO / Cloudflare R2 / Google Drive)
- Store extracted attachments similarly, by content hash

## Dedup + merge logic
- Deterministic keys: vendor lead-id, email, phone
- Fuzzy keys: name + zip + address (if present)
- Merge policy:
  - higher trust sources override lower trust fields
  - preserve field-level provenance (source + timestamp)

## Workflow automation touchpoints (n8n / Activepieces)
- Email trigger -> call `lead-ingestion` HTTP endpoint
- Vendor webhook trigger -> call `lead-ingestion`
- Lead normalization -> write to Postgres (`lead_events`, `leads`)
- Drip campaign decision -> write `campaign_enrollments` and schedule messages
- CRM sync -> push into Twenty (contact + activity)

## Security
- Vendor API keys and email OAuth tokens in Infisical
- Ingestion service supports replay mode to test with saved raw emails/payloads
