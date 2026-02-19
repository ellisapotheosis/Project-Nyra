---
description: /lead-ingest — Build WF_LEAD_INGEST (n8n) Intent Implement a lead-ingestion workflow that normalizes, dedupes, writes to TwentyCRM, & logs to nyra_ai.
---

/lead-ingest — Build WF_LEAD_INGEST (n8n)
Intent
Implement a lead-ingestion workflow that normalizes, dedupes, writes to TwentyCRM, & logs to nyra_ai.
Steps
Define input adapters:
email parsed payload
webhook/API payload
leadmailbox payload
Create a normalization function (map fields to canonical schema).
Compute idempotency key (email/phone + source + timestamp bucket).
Dedupe check:
search Twenty by email/phone
if exists, update; else create
Persist message trace in nyra_ai (MessageEvent).
Emit event "LeadCreatedOrUpdated" to trigger campaign assign.
Add structured error handling + retry-safe behavior.
Output
n8n workflow JSON export OR node-by-node build sheet
sample payloads
env vars required
Success criteria
Posting same lead twice does not create duplicates
Writes visible in TwentyCRM