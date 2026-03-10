# SPARC One‑Shot Workflow: Bootstrapping Project Nyra

This document condenses the entirety of Project Nyra’s architectural decisions, whitepaper goals and implementation guidelines into a single SPARC‑formatted workflow.  It is designed to be run in **one shot** by an intelligent agent or seasoned developer sitting at the orchestrator PC.  Following this plan will spin up all required services, write the necessary code, deploy the CRM extension, hook up the AI pipeline and ready the system for production.  Where possible, the document references details from the bundled whitepapers (e.g. the Nyra master architecture and lead ingestion whitepaper) and the included blueprint files.

## 1 Specification

### 1.1 Objective

Build a self‑hosted, AI‑augmented mortgage CRM on a four‑PC LAN.  The system must:

* Ingest leads from multiple sources (email, APIs, LeadMailbox, RateHunter forms) into a unified **MortgageLead** object within TwentyCRM.
* Normalize and deduplicate leads using both deterministic checks (email/phone) and semantic vector similarity via RuVector embeddings【236300779288244†L186-L198】.
* Store unstructured lead text with embeddings in the `nyra_ai` database for future retrieval and pattern mining.
* Assign each lead to a pre‑defined drip campaign based on loan type and source.  Campaigns may run 45–60 days and use SMS, email, voicemail and calls.
* Execute campaigns using n8n for orchestration and Activepieces for side effects; Dify handles borrower chat UI【789312922744488†L11-L19】.
* Generate multi‑option quotes via a Quote API and optionally integrate an Excel comparison tool.  AI agents should suggest the best option and draft explanatory messages.
* Terminate campaigns when a lead responds, unsubscribes (STOP), or after a maximum number of attempts.
* Provide operators with a unified admin interface (Nyra Admin UI) to monitor leads, configure campaigns and view quotes.
* Maintain compliance: record consent opt‑ins/outs, audit logs, encryption of secrets, and rate limits on all outbound messaging【236300779288244†L492-L517】.
* Use the Nyra architectural stack: TwentyCRM (self‑hosted), RuVector‑Postgres, n8n, Activepieces, Nexus Router, LiteLLM/OpenRouter, Dify, Graphiti/Letta memory layer and Claude‑Flow agents【236300779288244†L186-L198】.

### 1.2 Context & Assumptions

* **Hardware** – Orchestrator mini PC running Ubuntu (or WSL2), plus three GPU workers (RTX 5090/3090 Ti/3060).  All joined via Tailscale; public ingress via Cloudflare tunnels【236300779288244†L458-L517】.
* **Paths** – Use `/opt/repos/project-nyra` as the root for the repository.  The orchestrator script uses environment variables `NYRA_REPO_ROOT` and `NYRA_LOG_DIR` for flexibility.  Windows machines clone to `C:\Dev\Projects\Repos\Project-Nyra`.
* **Repository** – The starting point is the **project‑nyra‑updated** bundle, which contains the base code, third‑party blueprints and new documentation (whitepaper, architecture, SPARC files).  The repository includes scripts for installing RuVector, starting services and generating quotes.
* **Network** – Mesh VPN via Tailscale; Cloudflare Tunnel for external access to the CRM and admin UI.  Nexus Router acts as the only ingress for model calls and MCP tool calls【789312922744488†L11-L19】.
* **Secrets & API keys** – Use Infisical or .env files to store Twilio, SendGrid, Anthropic, OpenAI, pricing adapter and CRM API keys.  Ensure keys are loaded into n8n and Activepieces connectors.

### 1.3 Success Criteria

1. Orchestrator PC boots all core services (Postgres/RuVector, Redis, n8n, Activepieces, Nexus Router, LiteLLM/OpenRouter, Dify, Claude‑Flow, Quote API) without errors.
2. A new lead arriving via email or API is parsed, normalized, deduplicated and recorded as a `MortgageLead` and `Person` in TwentyCRM.  The unstructured text is stored in `nyra_ai.lead_chunks` with an embedding.  A campaign is assigned and begins sending messages.
3. Sending flows (SMS, email, voicemail) deliver messages on schedule, adhere to opt‑out requirements, and stop when a response is detected.
4. Quotes can be generated on demand via the Quote API or via campaign triggers.  The results are persisted and sent to the borrower.
5. Operators can access a UI to view leads, campaigns and quotes.  Borrowers can interact with a Dify chat widget embedded in the landing page; internal agents can use Open‑WebUI for debugging.
6. All compliance logs and consent records are stored in TwentyCRM; rate limits and encryption are enforced on external calls.

## 2 Pseudocode & High‑Level Logic

This pseudocode outlines the key workflows the agent must implement.  It abstracts away language‐specific details; actual implementation will use Node/NestJS for backend services and TypeScript/React for the UI.

### 2.1 Environment Bootstrap

```plaintext
# On orchestrator PC (Ubuntu or WSL2)
function bootstrap_orchestrator():
    # Update system packages, install Docker, Docker Compose, and Node with Volta
    ensure_docker_installed()
    install_volta_and_node()
    # Clone the repository
    if not exists(NYRA_REPO_ROOT):
        git_clone('https://github.com/ellisapotheosis/Project-Nyra', NYRA_REPO_ROOT)
    # Unpack third‑party blueprints and docs
    unzip_bundle('project-nyra-updated.zip', NYRA_REPO_ROOT)
    # Initialize RuVector and Postgres
    run_script(NYRA_REPO_ROOT + '/third_party/ruvector/scripts/init-ruvector.sh')
    # Pull n8n community nodes and MCP server forks
    pnpm_install('@twentyhq/n8n-nodes-twenty-dynamic')
    git_clone('https://github.com/jezweb/twenty-mcp', NYRA_REPO_ROOT + '/ops/mcp/twenty-mcp')
    # Build extended MCP server with Nyra tools
    implement_mcp_extensions()
    # Start Docker services
    run_shell(NYRA_REPO_ROOT + '/scripts/orchestrator/auto-start-docker.sh')
    # Configure Cloudflare tunnel and Tailscale (requires user input)
    setup_cloudflared_and_tailscale()
```

### 2.2 Lead Ingestion

```plaintext
trigger on_email_received(msg):
    lead_data = parse_email(msg)
    ingest_lead(lead_data)

trigger on_webhook_received(payload):
    lead_data = parse_payload(payload)
    ingest_lead(lead_data)

function ingest_lead(data):
    canonical = normalize_schema(data)
    existing_person = TwentyCRM.findPersonByEmailOrPhone(canonical.email, canonical.phone)
    embedding = Embedder.computeEmbedding(canonical.raw_text)
    potential_duplicates = RuVector.searchSimilar(embedding, threshold=0.85)
    if existing_person or potential_duplicates:
        person = existing_person or potential_duplicates[0].person
        lead = TwentyCRM.findMortgageLead(person.id)
        lead.update(canonical)
    else:
        person = TwentyCRM.createPerson(canonical)
        lead = TwentyCRM.createMortgageLead(person.id, canonical)
    store_lead_chunk(source=canonical.source, source_id=canonical.sourceId, lead_id=lead.id, text=canonical.raw_text, embedding=embedding)
    emit_event('lead.ingested', { lead_id: lead.id, loan_type: canonical.loanType, source: canonical.source })
```

### 2.3 Campaign Assignment & Execution

```plaintext
on_event('lead.ingested', event):
    campaign_rule = select_campaign(event.loan_type, event.source)
    schedule_campaign(event.lead_id, campaign_rule)

function schedule_campaign(lead_id, rule):
    for step in rule.steps:
        n8n.schedule_job(step.offset, send_message, { lead_id, step })

function send_message(lead_id, step):
    if TwentyCRM.getMortgageLead(lead_id).stage != 'new':
        return  # campaign cancelled
    msg = render_template(step.template, { lead: TwentyCRM.getMortgageLead(lead_id) })
    if step.channel == 'sms':
        Activepieces.twilio_send_sms(to=lead.phone, body=msg)
    elif step.channel == 'email':
        Activepieces.sendgrid_send_email(to=lead.email, subject=step.subject, body=msg)
    elif step.channel == 'voicemail':
        Activepieces.slybroadcast_drop_voicemail(to=lead.phone, recording_id=step.recording)
    elif step.channel == 'call':
        Activepieces.call_phone(to=lead.phone, recording_id=step.recording)
    log_outbound_message(lead_id, step.channel, msg)

trigger on_reply(event):
    lead_id = match_conversation(event.from)
    if event.body.lower().strip() in ['stop', 'unsubscribe']:
        record_opt_out(lead_id, event.channel)
        cancel_all_jobs(lead_id)
    else:
        update_stage(lead_id, 'contacted')
        notify_loan_officer(lead_id)
        cancel_all_jobs(lead_id)
```

### 2.4 Quote Generation & AI Assistance

```plaintext
function generate_quote(lead_id):
    lead = TwentyCRM.getMortgageLead(lead_id)
    scenarios = build_scenarios_from(lead)
    quotes = QuoteAPI.getQuotes(scenarios)
    TwentyCRM.saveQuotes(lead_id, quotes)
    email_content = render_template('quote_email', { lead, quotes })
    Activepieces.sendgrid_send_email(to=lead.email, subject='Your rate options', body=email_content)
    log_quote_sent(lead_id, quotes)

function ai_suggest_best_option(lead_id):
    lead = TwentyCRM.getMortgageLead(lead_id)
    quotes = TwentyCRM.getQuotes(lead_id)
    memory_patterns = RuVector.searchSimilar(Embedder.computeEmbedding(lead.summary), topK=3)
    prompt = compose_prompt(lead, quotes, memory_patterns)
    suggestion = ClaudeFlow.ask(prompt)
    TwentyCRM.logAISuggestion(lead_id, suggestion)
    return suggestion
```

## 3 Architecture Design

### 3.1 Cluster Layout

```
┌─────────────────────────────────┐
│           Orchestrator         │
│ MinisForum UH680 (Ryzen 7)     │
│                                 │
│  - Postgres + RuVector (twenty & nyra_ai DBs)    │
│  - Redis (queues & state)                        │
│  - n8n (orchestration)                           │
│  - Activepieces (side‑effects)                   │
│  - Nexus Router (MCP & LLM routing)              │
│  - LiteLLM / OpenRouter proxy                    │
│  - Dify (borrower chat)                          │
│  - Claude‑Flow (agent swarms)                    │
│  - Quote API & embedding service                 │
└─────────────────────────────────┘
      │ (Tailscale VPN + Docker networks)
      ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│ GPU Worker1 │  │ GPU Worker2  │  │ GPU Worker3  │
│ RTX 5090    │  │ RTX 3090Ti   │  │ RTX 3060     │
│ vLLM / heavy│  │ embeddings   │  │ fallback     │
└─────────────┘  └──────────────┘  └──────────────┘
```

### 3.2 Service Interactions

1. **Lead ingestion** – n8n triggers (email/webhook) parse data → call embedding service → write to `nyra.lead_chunks` → call TwentyCRM via MCP (dynamic nodes) → send event to campaign engine.
2. **Campaign engine** – n8n schedules messages → Activepieces connectors send communications via Twilio, SendGrid, Slybroadcast → logs stored in TwentyCRM.
3. **Quote API** – Exposes `POST /quotes` which accepts borrower scenarios; queries pricing adapters; writes `Quote` objects to TwentyCRM; returns JSON for UI consumption.
4. **AI service** – Claude‑Flow agents call the memory via RuVector to fetch patterns; use LiteLLM/OpenRouter to access LLMs (Claude, GPT, Gemini); produce suggestions.
5. **Nyra Admin UI** – React/Next.js app using Shadcn UI and MagicUI.  Talks to TwentyCRM via GraphQL; calls Quote API; displays campaigns and quotes; embeds Dify chat.
6. **Landing page** – Next.js public site with Tweakcn theme.  Posts new leads to the ingestion webhook; offers borrower chat widget; links to disclosures.

### 3.3 Data Stores

* **Postgres → `twenty`** – core CRM tables; custom objects for MortgageLead, Quote and LoanApplication.
* **Postgres → `nyra_ai`** – `lead_chunks` (id, source_type, source_id, lead_id, chunk_text, embedding, meta, created_at) with HNSW index; `patterns` (future).  Graphiti/Letta may introduce additional tables (temporal graph) later.
* **Redis** – queueing (BullMQ for n8n jobs) and caching for token counts or rate limiting.
* **File storage** – Pre‑recorded voicemails and audio; static templates.  Store in `data/uploads` or cloud storage if needed.

## 4 Refinement Plan

The refinement stage breaks the implementation into manageable milestones.  Adjust timelines as needed.

1. **Environment & DB Setup (Day 1–2)**
    * Install Docker, Compose, Node via Volta; set up Tailscale; configure Cloudflare Tunnel.
    * Clone Project Nyra repo; unpack third‑party blueprints; run `init-ruvector.sh` to install the RuVector extension and create `twenty`/`nyra_ai` databases.
    * Configure environment variables (.env files) for Postgres, Redis, Twilio, SendGrid, LLM providers.
    * Build and start base services via `scripts/orchestrator/auto-start-docker.sh`.

2. **MCP & CRM Preparation (Day 3–4)**
    * Install `n8n-nodes-twenty-dynamic` via the n8n UI or npm; configure connections to TwentyCRM.
    * Fork `jezweb/twenty-mcp`, add custom tools (e.g. `twenty_create_mortgage_lead`, `nyra_get_similar_patterns`, `nyra_generate_quote`), compile and register with Nexus Router.
    * Define custom objects and fields in TwentyCRM: MortgageLead, Quote, LoanApplication; create relationships.
    * Write an initial n8n ingestion workflow: IMAP trigger → function node to normalize → call embedding service → call MCP to create records → publish `lead.ingested` event.

3. **Campaign Logic & Activepieces Integration (Day 5–8)**
    * Design campaign JSON definitions for Speed‑to‑Lead, Purchase Nurture, Refinance Nurture, Re‑engagement and Quote Follow‑up (see whitepaper).  Store them in TwentyCRM or a config file.
    * Build the campaign scheduler in n8n: subscribe to `lead.ingested` events, look up rules table, schedule `send_message` jobs via BullMQ.
    * Configure Activepieces connectors for Twilio (SMS/calls/voicemail), SendGrid (email) and Slybroadcast (voicemail drops).  Set up approval steps if needed.
    * Implement response handlers: Twilio webhook triggers update lead stage; cancel remaining jobs; record opt‑outs.

4. **Quote API & Excel Processor (Day 9–12)**
    * Scaffold a NestJS service `services/quote-api`.  Implement `POST /quotes` route to accept a scenario and call pricing adapters or parse the Excel comparison sheet.
    * Write the Excel parser (Python or Node) that reads the existing rate comparison spreadsheet and produces JSON quote options.
    * Persist quotes in TwentyCRM; link them to MortgageLead; return them to the caller.
    * Add a function in n8n to trigger quote generation at specified points (e.g. after contact or by manual trigger).  Also expose a button in the UI.

5. **AI Services & Memory Integration (Day 13–15)**
    * Stand up Claude‑Flow using the included configuration; ensure it can call the MCP and memory.
    * Implement an embedding service using `fastembed` (Python or TS) that accepts text and returns 384‑dimensional vectors; ensure concurrency for high throughput.
    * Write a MemoryManager module in the AI service (Node) that can read/write embeddings to RuVector and query for similar patterns.
    * Add AI assistance functions: suggest next best actions for deals, summarise interactions, and explain quotes.  Log suggestions into the `ai_audit_log` table.

6. **UI Integration (Day 16–18)**
    * Extend the Nyra Admin UI (Next.js) to display leads, campaign statuses, quotes and AI suggestions.  Use Shadcn UI and MagicUI components; apply Tweakcn colour palette and Tailwind variables.
    * Embed a Dify chat widget on the public RateHunter landing page; ensure the widget calls the Nexus Router for all model/tool requests.  Add forms for lead capture that post to the ingestion webhook.
    * For operators, integrate Open‑WebUI (admin portal) behind Cloudflare Access for debugging and agent management.

7. **Compliance & Hardening (Day 19–21)**
    * Implement consent ledger storage in TwentyCRM; ensure all outbound messages contain opt‑out instructions.
    * Configure Nexus Router with API keys, rate limits and telemetry to monitor usage.
    * Add TLS termination via Cloudflare; verify encryption at rest for Postgres and secure secret injection via Infisical or env.
    * Conduct penetration testing on the endpoints; close open ports; restrict firewall rules.

8. **Testing & Launch (Day 22–24)**
    * Write unit tests for ingestion functions, deduplication and quote generation; write integration tests for n8n workflows and Activepieces connectors.
    * Run end‑to‑end tests: ingest sample leads and confirm campaign execution, quoting and UI updates.
    * Train staff on using the admin UI; gather feedback; iterate on prompts and templates.
    * Ship to production by running `auto-start-docker.sh` on orchestrator at boot; use WOL to wake GPU workers when AI inference is needed.

## 5 Completion & Delivery

Upon completion of the refinement steps, the system should be fully operational and ready for production.  Final tasks include:

1. **Documentation** – Update README, runbook and threat model to reflect final configuration.  Provide API reference for the Quote API and MCP extensions.  Document new environment variables and file locations.
2. **Release Artifacts** – Build Docker images (`docker build . -t nyra/<service>`), publish version tags and update Docker Compose files.  Provide the complete source code on GitHub along with migration scripts.
3. **Monitoring & Support** – Deploy Grafana and Prometheus or use the existing cluster monitoring stack.  Set up alerts for failed workflows, slow queries, high message failure rates or compliance issues.
4. **Ongoing Improvements** – Plan for phase 2 enhancements (Graphiti/Letta temporal memory, advanced lead scoring models, voice capabilities).  Continue refining campaign content and AI prompts based on conversion data.

Following this one‑shot SPARC workflow will prepare the orchestrator machine, instantiate every service, implement the core features and deliver a running mortgage CRM with AI assistance, ready to serve borrowers and brokers alike.