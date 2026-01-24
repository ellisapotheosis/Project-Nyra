<!--
Copyright (c) 2026 Project‑Nyra

This SPARC document applies the Specification–Pseudocode–Architecture–
Refinement–Completion methodology to the lead ingestion and campaign
automation project.  It provides a self‑contained blueprint for AI
agents or human developers to deliver the pipeline defined in the
whitepaper and architecture documents.
-->

# SPARC Workflow: Lead Ingestion & Campaign Automation

## 1. Specification

### 1.1 Objectives

* **Ingest leads** from email, APIs and forms into a unified
  `MortgageLead` object in TwentyCRM.
* **Normalize and deduplicate** leads, using both deterministic
  checks (email/phone) and semantic similarity via RuVector
  embeddings.
* **Store unstructured text** in the `nyra.lead_chunks` table with
  embeddings to enable future retrieval and pattern analysis.
* **Assign a drip campaign** based on the loan purpose and source.
* **Execute multi‑channel campaigns** via SMS, email, voicemail and
  calls for 45–60 days or until the lead responds.
* **Generate personalized quotes** using an external Quote API and
  optionally AI suggestions.
* **End campaigns** when the lead responds, unsubscribes or hits
  maximum attempts.
* **Ensure compliance** with consent rules and maintain audit logs.

### 1.2 Success Criteria

1. New leads are created in TwentyCRM without duplication.
2. Campaigns fire on schedule with the correct sequence and messages.
3. Responses stop further messaging and update the `stage` to
   `contacted`.
4. Quote options are generated and sent for qualified leads.
5. All key events (ingestion, assignment, messages, responses,
   quotes) are logged for auditing.

## 2. Pseudocode & High‑Level Logic

### 2.1 Ingest Lead Workflow (n8n)

```
trigger LeadEmailReceived:
  email = parse_email(msg)
  lead_data = map_fields(email)
  call ingestLead(lead_data)

trigger LeadWebhookReceived:
  data = parse_json(webhook)
  lead_data = map_fields(data)
  call ingestLead(lead_data)

function ingestLead(lead_data):
  # Step 1: normalize schema
  canonical = normalize(lead_data)
  # Step 2: deduplicate by contact info
  existing_person = Twenty.findPersonByEmailOrPhone(canonical.email, canonical.phone)
  # Step 3: compute embedding
  embedding = Embedder.computeEmbedding(canonical.raw_text)
  duplicates = RuVector.searchSimilar(embedding, threshold=0.85)
  if existing_person or duplicates:
     person = existing_person or duplicates[0].person
     lead = Twenty.findMortgageLead(person)
     updateLead(lead, canonical)
  else:
     person = Twenty.createPerson(canonical)
     lead = Twenty.createMortgageLead(person.id, canonical)
  # Step 4: persist unstructured text
  storeLeadChunk(source=canonical.source, source_id=canonical.id,
                 lead_id=lead.id, text=canonical.raw_text,
                 embedding=embedding)
  # Step 5: emit event
  publish('lead.ingested', { lead_id: lead.id, loan_type: canonical.loanType, source: canonical.source })
```

### 2.2 Campaign Assignment & Execution (n8n + Activepieces)

```
onEvent 'lead.ingested':
  rule = selectCampaign(event.loan_type, event.source)
  scheduleCampaign(event.lead_id, rule)

function scheduleCampaign(lead_id, rule):
  for step in rule.steps:
    schedule(step.time_offset, sendMessage, { lead_id, step })

function sendMessage(lead_id, step):
  # Check if lead already responded or unsubscribed
  if Twenty.getLeadStage(lead_id) != 'new':
    return
  # Compose message via template engine
  msg = TemplateEngine.render(step.template, { lead: Twenty.getLead(lead_id) })
  if step.channel == 'sms':
    Activepieces.sendSms(to=lead.phone, text=msg)
  elif step.channel == 'email':
    Activepieces.sendEmail(to=lead.email, subject=step.subject, body=msg)
  elif step.channel == 'voicemail':
    Activepieces.dropVoicemail(to=lead.phone, recording_id=step.recording)
  elif step.channel == 'call':
    Activepieces.callPhone(to=lead.phone, recording_id=step.recording)
  logMessage(lead_id, step, msg)
```

### 2.3 Response Handling

```
trigger IncomingSms:
  lead_id = matchConversation(event.from)
  if isStopMessage(event.body):
    recordUnsubscribe(lead_id)
    cancelScheduledMessages(lead_id)
  else:
    updateStage(lead_id, 'contacted')
    notifyLoanOfficer(lead_id)
    cancelScheduledMessages(lead_id)

trigger IncomingEmail:
  lead_id = matchConversation(event.from)
  updateStage(lead_id, 'contacted')
  notifyLoanOfficer(lead_id)
  cancelScheduledMessages(lead_id)
```

### 2.4 Quote Generation

```
function generateQuote(lead_id):
  lead = Twenty.getLead(lead_id)
  scenarios = buildScenarios(lead)
  options = QuoteAPI.getQuotes(scenarios)
  Twenty.createQuotes(lead_id, options)
  emailBody = TemplateEngine.render('quote_email', { lead, options })
  Activepieces.sendEmail(to=lead.email, subject='Your rate options', body=emailBody)
  logQuoteSent(lead_id, options)
```

## 3. Architecture Design (SPARC)

### 3.1 Modules & Interfaces

* **n8n Ingestion** – orchestrates parsing, normalization, deduplication
  and dispatch of lead.ingested events.  Interfaces with IMAP, HTTP
  webhooks, TwentyCRM API and the embedding service.
* **Embedding Service** – REST API that returns a 384‑dimensional
  vector for input text.  Could be implemented in Python using
  fastembed or other open‑source models.  It writes the vector into
  the `nyra.lead_chunks` table.
* **RuVector Memory (nyra_ai DB)** – stores embeddings and supports
  similarity search via HNSW index.  Exposed to n8n via a simple
  SQL query or a wrapper API.
* **Campaign Engine (n8n + Activepieces)** – executes campaigns based
  on JSON definitions.  n8n handles timing and logic; Activepieces
  sends communications through its connectors (Twilio, SendGrid,
  voicemail providers).  The engine subscribes to lead.ingested
  events and uses a rules table to select campaigns.
* **Quote API** – NestJS service providing `POST /quotes` endpoint.
  Accepts borrower scenario, returns an array of quotes and writes
  them to TwentyCRM.  Interfaces with pricing adapters and the
  spreadsheet parser.
* **TwentyCRM** – system of record.  Exposes GraphQL/REST endpoints
  and custom objects.  Receives lead creation, updates and quote
  records.  Stores consent ledger and audit logs.
* **Nyra Admin UI** – Next.js application using shadcn + MagicUI.
  Provides user interface for campaign authoring, lead monitoring,
  and quote management.

### 3.2 Data Models

Refer to the **MortgageLead**, **Quote** and **LoanApplication**
models defined in the whitepaper and architecture documents.  The
`nyra.lead_chunks` table stores unstructured lead text and embeddings;
the `nyra.patterns` table (future work) stores patterns from
successful campaigns and quotes.

### 3.3 Message Schemas

* **lead.ingested** – `{ lead_id: UUID, loan_type: Enum, source: Enum }`
* **quote.generated** – `{ lead_id: UUID, quotes: Array<Quote> }`
* **unsubscribe** – `{ lead_id: UUID, channel: Enum }`

## 4. Refinement Plan

### 4.1 Milestone Breakdown

1. **Setup & Ingestion** (Week 1)
   - Deploy TwentyCRM, RuVector‑Postgres and n8n on the orchestrator.
   - Configure IMAP and webhook triggers in n8n.
   - Implement normalization functions and the canonical schema.
   - Develop the embedding service and integration with RuVector.

2. **Deduplication & Rules Engine** (Week 2)
   - Implement RuVector similarity search in n8n workflows.
   - Build deduplication logic combining contact lookup and vector
     matching.
   - Create a rule table for campaign assignment based on loan type and
     source.

3. **Campaign Execution** (Week 3–4)
   - Define JSON campaign templates for speed‑to‑lead, nurture, etc.
   - Configure n8n timers and Activepieces connectors for SMS, email
     and voicemail.
   - Implement response handling triggers to end campaigns.

4. **Quote API & Excel Integration** (Week 4–5)
   - Build the Quote API microservice with pricing adapter stubs.
   - Write a script to convert the existing Excel comparison sheet
     into API responses.
   - Integrate quote generation into the campaign engine and UI.

5. **User Interface & Test Harness** (Week 6)
   - Extend Nyra Admin UI to display leads, campaigns and quotes.
   - Provide forms to create/edit campaign definitions.
   - Build dashboards for monitoring campaign performance and lead
     status.

6. **Compliance & Hardening** (Week 7)
   - Implement consent ledger storage and opt‑out handling.
   - Add audit logging across all services.
   - Conduct penetration testing and security audits.

### 4.2 Test Strategy

* **Unit tests** – for normalization functions, embedding service,
  rules selection and template rendering.
* **Integration tests** – simulate ingestion of leads via email and
  webhook; verify record creation and campaign assignment; mock
  connectors.
* **End‑to‑end tests** – run a full campaign for a sample lead and
  confirm messages are sent, responses stop messaging and quotes are
  generated.

## 5. Completion & Delivery

The completion phase involves actually writing the code for the
workflows, services and UI described above.  It includes creating
repository folders (`services/embedding-service`, `services/quote-api`),
implementing NestJS modules, n8n/Activepieces configurations and
React components.  All code should follow the conventions used by
Project Nyra (TypeScript, typed data, test‑driven development).  The
final deliverable should be a runnable Docker Compose setup with
sample campaigns and unit tests passing.  Documentation in the
repository should reflect the whitepaper and architecture to aid
future contributors.