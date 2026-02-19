<!--
Copyright (c) 2026 Project‑Nyra

This document is part of the Project‑Nyra documentation suite and is released
under the MIT License.  It provides a technical architecture overview
for the lead ingestion and campaign automation initiative described in
the associated whitepaper.  It assumes familiarity with the core
Project‑Nyra architecture (see `02_ARCHITECTURE_TOP_TO_BOTTOM.md`).
-->

# Lead Ingestion & Campaign Automation – Architecture Overview

## 1. Overview

The lead ingestion system sits between external lead sources and
TwentyCRM, ensuring that every potential borrower is captured,
normalized, deduplicated, enriched and assigned to an appropriate
campaign.  It integrates with the existing Project Nyra stack—
TwentyCRM, RuVector, n8n, Activepieces, Nexus Router, and Dify—as
depicted in Figure 1 below.

### Figure 1: High‑Level Component Diagram (ASCII)

```
                           +------------------------+
                           |  Lead Sources          |
                           | (email, API, forms)    |
                           +-----------+------------+
                                       |
                                       v
                               +-------+-------+
                               |  n8n Ingestion |
                               |  Workflows     |
                               +-------+-------+
                                       |
                        +--------------+--------------+
                        |                             |
                        v                             v
         +---------------------------+   +---------------------------+
         | Normalization &           |   | RuVector Embedding &      |
         | Deduplication             |   | Lead Chunk Storage        |
         +--------------+------------+   +--------------+------------+
                        |                             |
                        v                             v
        +----------------------------+   +-----------------------------+
        | TwentyCRM (custom objects) |   | nyra_ai DB (lead_chunks)    |
        +----------------------------+   +-----------------------------+
                        |
                        v
             +-----------------------+
             |  Campaign Engine      |
             | (n8n + Activepieces)  |
             +-----------+-----------+
                         |
                         v
               +--------------------+
               |  Communications    |
               | (SMS, email, calls)|
               +--------------------+
```

## 2. Component Details

### 2.1 Lead Ingestion Workflows (n8n)

n8n acts as the entry point for all lead data.  Each lead source
corresponds to a separate trigger node—IMAP for email,
HTTP/webhook nodes for APIs and forms, scheduled polling for
providers without webhooks.  After a lead is received, the workflow
invokes custom functions to map fields into the canonical schema and
queries TwentyCRM via the dynamic nodes to check for existing
contacts.  If no match is found, a new `Person` and `MortgageLead`
are created.  In parallel, the workflow calls a small microservice to
compute a RuVector embedding for the raw lead text and writes it into
the `nyra.lead_chunks` table.

### 2.2 RuVector Embedding Service

Although RuVector’s HNSW index is implemented in Postgres, computing
embeddings is done via an external service that wraps the fastembed
model.  The service exposes an HTTP endpoint that accepts a text
payload and returns a 384‑dimensional vector.  n8n calls this
endpoint and stores the result alongside the normalized lead data.

### 2.3 Deduplication

Deduplication happens at two layers:

1. **CRM lookup** – query TwentyCRM for existing contacts matching the
   lead’s email or phone number.  This is done using the dynamic
   nodes’ search functions.
2. **Vector similarity** – search the RuVector HNSW index for leads
   with similar embeddings.  If a vector similarity above a
   configurable threshold is found, the lead is considered a potential
   duplicate even if contact information differs (e.g., duplicate
   contact with a typo).  The workflow can then merge or flag for
   review.

### 2.4 TwentyCRM Custom Objects

`MortgageLead`, `Quote` and `LoanApplication` objects are added to
TwentyCRM via its custom object UI.  Relationships between these
objects and standard CRM entities (`Person`, `Company`, `Opportunity`)
are defined to maintain referential integrity.  The n8n dynamic
nodes automatically detect these objects and generate appropriate
fields and operations, eliminating the need to update code when
schema changes occur【236300779288244†L186-L198】.

### 2.5 Campaign Engine

Campaigns are defined as JSON structures stored in TwentyCRM or a
dedicated table.  The engine comprises:

* **n8n** – orchestrates timers, conditional logic and rules.
* **Activepieces** – executes side‑effects via connectors (Twilio,
  SendGrid, voicemail providers).  It also handles human approvals.
* **Nexus Router** – acts as the unified gateway for all tool calls.
  Dify uses Nexus as its model and tool endpoint; n8n and
  Activepieces use the MCP proxy to call external systems【789312922744488†L11-L19】.

### 2.6 Quote API

The Quote API is a microservice (NestJS) deployed alongside TwentyCRM
in the orchestrator cluster.  It receives loan scenarios via REST
calls from campaigns or the Nyra Admin UI, queries pricing
adapters, computes APR and monthly payment, and stores the resulting
`Quote` records in TwentyCRM.  It also logs each request and
response in the `ai_audit_log` table for compliance.

## 3. Communication Channels

Nyra leverages multiple channels to maximize engagement:

* **SMS** – sent via Twilio or similar, with automated reply
  monitoring for opt‑outs or interest.
* **Email** – templated HTML or plain‑text messages delivered via
  SendGrid; stored in TwentyCRM as `Message` activities.
* **Voicemail Drop** – pre‑recorded audio sent via a service like
  Slybroadcast; ensures compliance with TCPA.
* **Phone Calls** – optional; n8n can trigger a call dialer and
  deliver a pre‑recorded message.

Each channel is executed via Activepieces connectors and
coordinated by n8n according to the campaign schedule.  Channel
selection and ordering are configured per campaign type.

## 4. Data Flow Example

The following sequence illustrates how the architecture operates for a
new LendingTree lead:

1. **Email received** – n8n IMAP trigger captures the message.
2. **Parsing & normalization** – custom functions extract the lead
   details and map them to the canonical schema.
3. **CRM lookup** – dynamic node searches TwentyCRM for matching
   contacts; none found.
4. **Record creation** – `Person` and `MortgageLead` objects are
   created in TwentyCRM.
5. **Embedding** – the lead text is sent to the embedding service and
   persisted in `nyra.lead_chunks`.  A similarity search returns no
   duplicates.
6. **Campaign assignment** – rules engine assigns the
   “Speed to Lead” campaign.
7. **Message delivery** – n8n triggers an SMS via Activepieces; five
   minutes later sends an email; one hour later schedules a call.
8. **Lead response** – the borrower replies “Thanks!” via SMS.  A
   webhook updates the `stage` to `contacted` and cancels further
   campaign steps.
9. **Quote generation** – the loan officer clicks “Generate Quote”
   in Nyra Admin; the Quote API produces three options and sends
   them via email and text.

## 5. Deployment Considerations

* **Containerization** – All services run in Docker Compose on the
  orchestrator machine.  GPU workers remain optional for heavy
  inference (Claude‑Flow, embeddings) as described in the master
  architecture【236300779288244†L458-L517】.
* **Secrets Management** – API keys (Twilio, SendGrid, pricing
  adapters, etc.) are stored in Infisical and injected into the
  appropriate containers.
* **Network & Security** – Cloudflare Tunnels provide public
  ingress; Tailscale connects cluster nodes.  Nexus Router enforces
  rate limits and auth on all tool calls.
* **Monitoring** – Use Grafana/Prometheus to track campaign
  execution, lead conversion rates and error rates.  Implement
  alarms for failed workflows or message delivery issues.

## 6. Conclusion

The architecture described here ensures that lead ingestion and
campaign execution are reliable, scalable and maintainable.  It
leverages open‑source components, keeps TwentyCRM as the single
system of record, and uses AI capabilities (RuVector, Claude‑Flow)
to enhance deduplication, quote generation and personalization.