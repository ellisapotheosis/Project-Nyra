<!--
Copyright (c) 2026 Project‑Nyra

This document is part of the Project‑Nyra documentation suite and is released
under the MIT License. It is intended to serve as the canonical
reference for the lead ingestion and campaign automation strategy used by
Project‑Nyra. It may be copied or adapted as long as attribution is preserved.
-->

# Project Nyra – Lead Ingestion & Campaign Automation Whitepaper

## 1. Executive Summary

This whitepaper describes how Project Nyra will ingest mortgage leads
from multiple sources and orchestrate fully automated yet compliant
follow‑up campaigns.  The goal is to provide prospective borrowers
with timely rate quotes and personalized outreach while reducing
manual effort and ensuring that all data is captured in TwentyCRM —
Nyra’s system of record.  The solution combines custom
objects in TwentyCRM, dynamic automation with n8n and Activepieces,
semantic memory via RuVector, and AI‑powered quote generation to
create a cohesive pipeline from first contact to funded loan.

## 2. Lead Sources and Ingestion

### 2.1 Sources

Nyra must support multiple inbound channels:

* **Email parsing** – leads arrive by email from marketplaces such as
  LendingTree, FreeRateUpdate and LeadMailbox.  n8n will monitor a
  dedicated IMAP/SMTP inbox, parse the message body and attachments,
  and extract lead details (name, contact info, loan type, amount,
  credit score, property state, etc.).
* **Direct API** – when lead providers offer an API, Nyra will poll
  or receive webhooks.  Data is mapped to the canonical schema and
  processed identically to email leads.
* **LeadMailbox API** – LeadMailbox aggregates leads from multiple
  sources; Nyra will integrate their API if available.  Otherwise,
  the same email parser applies because all LeadMailbox messages
  arrive in the inbox.
* **RateHunter Forms** – leads submitted directly on
  ratehunter.net (or future landing pages) will post to a
  secure webhook that triggers the same normalization and
  deduplication routines.

### 2.2 Normalization and Deduplication

All ingestion workflows converge into a **canonical lead schema**.  The
`MortgageLead` custom object (defined in TwentyCRM) stores fields
such as `source`, `loanType`, `requestedAmount`, `creditScore`,
`propertyState` and `stage`.  The ingestion pipeline performs
these steps:

1. **Normalize** source‑specific payloads into the canonical schema.
2. **Deduplicate** by comparing email/phone against existing contacts
   in TwentyCRM and by computing an embedding of the lead text
   (via RuVector) and querying for similar vectors.  If the
   similarity exceeds a threshold, the lead is merged with the
   existing `Person` and `MortgageLead` records; otherwise new
   records are created.
3. **Store lead chunks** into the `nyra.lead_chunks` table in
   the `nyra_ai` database.  Each chunk includes source metadata,
   the extracted text and a 384‑dimensional embedding.  An HNSW index
   enables efficient similarity search.  (RuVector uses approximate
   nearest neighbour search for embeddings【10†L150-L156】.)
4. **Emit an ingestion event** to the campaign engine for further
   processing.

### 2.3 TwentyCRM Integration

Nyra deploys the official TwentyCRM Docker stack and uses native
custom objects rather than forking the codebase【236300779288244†L186-L198】.
`MortgageLead`, `Quote` and `LoanApplication` objects capture
all relevant data.  The n8n dynamic nodes for Twenty
(`n8n-nodes-twenty-dynamic`) allow schema discovery,
bulk operations and support for complex field types; they are
preferred over the legacy nodes【236300779288244†L186-L198】.

## 3. Campaign Engine

### 3.1 Assignment Rules

After ingestion, a rules engine selects the appropriate drip sequence
based on the `loanType`, `requestedAmount` and `source`.  Campaigns
are stored as JSON definitions in TwentyCRM or a dedicated table and
consist of steps across multiple channels.  Example campaign types
include:

| Campaign Type      | Channels (Order)                    | Timing                 |
|--------------------|-------------------------------------|------------------------|
| Speed to Lead      | SMS → Email → Call                  | Immediately; +5m; +1h |
| Purchase Nurture   | Email → SMS                         | Day 1, 3, 7, 14, 30    |
| Refinance Nurture  | SMS → Voicemail → Email             | Day 1, 7, 14, 30       |
| Re‑engagement      | Email → Voicemail                   | After 30 days dormant  |
| Quote Follow‑up    | SMS → Email                         | 1h, 24h, 72h post quote|

All messages include an opt‑out mechanism to comply with FCC one‑to‑one
consent rules and CAN‑SPAM requirements.  A consent ledger is
maintained in TwentyCRM with an audit trail【236300779288244†L492-L517】.

### 3.2 Execution Platform

Nyra uses **n8n** for long‑running orchestration and timers
and **Activepieces** for executing side‑effects (sending SMS,
emails, voicemail drops)【616485533931907†L28-L45】.  Dify is reserved
for borrower‑facing chat experiences【616485533931907†L21-L24】.  The
recommended pattern is to route all model and tool calls through the
**Nexus Router**; Dify calls Nexus for language model inference and
tool invocation, while deterministic workflows call Activepieces or
n8n via MCP【789312922744488†L11-L19】.

Each campaign step is implemented as an n8n workflow triggered by
a timer or an event (e.g., “lead responded”).  The workflow uses
Activepieces MCP connectors for Twilio, SendGrid or other
communication services.  A human‑in‑the‑loop approval can be
inserted when required (e.g., pre‑recorded voicemail content).

### 3.3 Exit Conditions

The drip campaign terminates when:

* The lead responds via any channel.  n8n listens for incoming SMS or
  email replies and updates the `stage` to `contacted` in TwentyCRM.
* The lead unsubscribes by sending “STOP”.  The consent ledger is
  updated and no further messages are sent.
* A maximum number of attempts is reached (e.g. 60 days).

## 4. Quote Generation

### 4.1 Quote API

A standalone **Quote API** service (NestJS) receives loan scenarios
and produces multiple pricing options.  It queries external
pricing adapters (e.g. Rocket Mortgage, LenderPrice) or uses
uploaded rate sheets.  The API returns an array of `Quote` objects
containing loan amount, interest rate, APR, estimated monthly payment
and loan program.  Each quote is persisted in TwentyCRM and linked
to the corresponding `MortgageLead`.

### 4.2 Excel Integration

Nyra maintains an Excel spreadsheet for comparing at least three rate
and pricing options.  A converter script (run via n8n or a custom
service) reads the spreadsheet, parses the scenarios and generates the
corresponding JSON definitions.  This script can be invoked by the
campaign engine when a quote needs to be sent.  In the long term,
these calculations will be replicated in the Quote API with proper
audits and validations.

### 4.3 AI Assistance

AI agents (via Claude‑Flow) provide guidance on which quote best
suits a borrower based on their credit score, loan purpose, and
market conditions.  Agents can also summarize pros and cons of each
option and draft personalized explanations.  These suggestions are
logged in the `ai_audit_log` and presented to the loan officer for
review.

## 5. User Interfaces

### 5.1 Nyra Admin & TwentyCRM

The Nyra Admin webapp (Next.js + shadcn + MagicUI) serves as the
control plane for campaigns, quotes and AI monitoring.  It integrates
with TwentyCRM via GraphQL and displays custom objects, campaign
definitions and analytics.  Operators can create campaigns using a
visual builder and preview messages before activation.  The
TwentyCRM interface itself can embed certain components (e.g., a
“Run Quote” button) via custom pages.

### 5.2 Borrower Chat

Dify remains the recommended borrower chat interface: it is embedded
into Nyra’s public webapp and uses the Nexus Router for model and tool
calls【616485533931907†L21-L24】.  When a lead engages with the chat,
the system can query TwentyCRM to personalize the conversation and
update the `stage` accordingly.  Admin chat or internal debugging
should use Open‑WebUI and not Dify【236300779288244†L186-L198】.

### 5.3 Landing Page

Nyra’s landing page will be built in the `ratehunter` app using the
same shadcn/MagicUI theme.  It will contain a lead capture form
posting to the ingestion webhook, informational sections about
brokerage services, and links to legal disclosures.  The existing
bare‑bones page can be exported from the old host and integrated here.

## 6. Integration with Tweakcn / shadcn

Nyra uses a unified design system across TwentyCRM extensions,
Nyra Admin and the public webapp.  The OKLCH purple palette and
component styles extracted from Tweakcn serve as the foundation
for all UIs【236300779288244†L299-L326】.  Tailwind CSS variables in
`globals.css` define colors, border radii and fonts, and MagicUI
provides higher‑level animated components.  When adding
components via `shadcn-ui`, override defaults to use these variables.
This ensures the CRM plug‑ins, admin dashboard, Dify chat widget and
landing pages all share a cohesive look.

## 7. Security and Compliance

Nyra operates in a regulated industry.  Key controls include:

* **Consent ledger** – store opt‑in/out status for each contact.
* **Audit logs** – record all AI suggestions, quote generations and
  outbound communications with timestamps and user IDs.
* **Rate limiting and auth** – configure the Nexus Router to apply
  API keys, per‑user quotas and IP allow‑lists.
* **Encryption at rest and in transit** – enforce TLS for all
  services (Cloudflare Tunnels) and enable AES‑256 for stored
  secrets and tokens.
* **Data retention policies** – comply with GDPR/CCPA for
  deletion/retention and provide export functionality.

## 8. Roadmap Summary

The lead ingestion and campaign automation initiative will roll out in
stages.  Phases align with the overarching Project Nyra timeline
documented elsewhere:

1. **Foundation** – Deploy TwentyCRM and RuVector‑Postgres; configure
   n8n and Activepieces; set up lead ingestion flows; create custom
   objects.
2. **Lead Pipeline** – Implement normalization, deduplication,
   embedding and campaign assignment; integrate with RuVector and
   store lead chunks.
3. **AI & Quoting** – Build the Quote API and Excel converter;
   integrate AI agents for guidance; design personalized message
   templates.
4. **Borrower Experience** – Embed Dify chat; design the
   ratehunter landing page; test multi‑channel campaigns; refine
   nurture sequences based on results.

## 9. Conclusion

By unifying disparate lead sources into a single pipeline and
automating campaign execution, Project Nyra will dramatically
increase borrower engagement and operational efficiency.  The
architecture described here leverages existing open‑source systems
TwentyCRM, n8n, Activepieces, Dify and RuVector, while leaving room
for future enhancements such as voice interactions and advanced
analytics.  A consistent design language powered by shadcn/MagicUI
ensures that both internal tools and customer‑facing experiences feel
cohesive and professional.