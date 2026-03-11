SPARC One‑Shot Workflow: Bootstrapping Project Nyra



This document condenses the entirety of Project Nyra’s architectural decisions, whitepaper goals and implementation guidelines into a single SPARC‑formatted workflow. It is designed to be run in one shot by an intelligent agent or seasoned developer sitting at the orchestrator PC. Following this plan will spin up all required services, write the necessary code, deploy the CRM extension, hook up the AI pipeline and ready the system for production. Where possible, the document references details from the bundled whitepapers (e.g. the Nyra master architecture and lead ingestion whitepaper) and the included blueprint files.



1 Specification

1.1 Objective



Build a self‑hosted, AI‑augmented mortgage CRM on a four‑PC LAN. The system must:



Ingest leads from multiple sources (email, APIs, LeadMailbox, RateHunter forms) into a unified MortgageLead object within TwentyCRM.



Normalize and deduplicate leads using both deterministic checks (email/phone) and semantic vector similarity via RuVector embeddings.



Store unstructured lead text with embeddings in the nyra\_ai database for future retrieval and pattern mining.



Assign each lead to a pre‑defined drip campaign based on loan type and source. Campaigns may run 45–60 days and use SMS, email, voicemail and calls.



Execute campaigns using n8n for orchestration and Activepieces for side effects; Dify handles borrower chat UI.



Generate multi‑option quotes via a Quote API and optionally integrate an Excel comparison tool. AI agents should suggest the best option and draft explanatory messages.



Terminate campaigns when a lead responds, unsubscribes (STOP), or after a maximum number of attempts.



Provide operators with a unified admin interface (Nyra Admin UI) to monitor leads, configure campaigns and view quotes.



Maintain compliance: record consent opt‑ins/outs, audit logs, encryption of secrets, and rate limits on all outbound messaging.



Use the Nyra architectural stack: TwentyCRM (self‑hosted), RuVector‑Postgres, n8n, Activepieces, Nexus Router, LiteLLM/OpenRouter, Dify, Graphiti/Letta memory layer and Claude‑Flow agents.



1.2 Context \& Assumptions



Hardware – Orchestrator mini PC running Ubuntu (or WSL2), plus three GPU workers (RTX 5090/3090 Ti/3060). All joined via Tailscale; public ingress via Cloudflare tunnels.



Paths – Use /opt/repos/project-nyra as the root for the repository. The orchestrator script uses environment variables NYRA\_REPO\_ROOT and NYRA\_LOG\_DIR for flexibility. Windows machines clone to C:\\Dev\\Projects\\Repos\\Project-Nyra.



Repository – The starting point is the project‑nyra‑updated bundle, which contains the base code, third‑party blueprints and new documentation (whitepaper, architecture, SPARC files). The repository includes scripts for installing RuVector, starting services and generating quotes.



Network – Mesh VPN via Tailscale; Cloudflare Tunnel for external access to the CRM and admin UI. Nexus Router acts as the only ingress for model calls and MCP tool calls.



Secrets \& API keys – Use Infisical or .env files to store Twilio, SendGrid, Anthropic, OpenAI, pricing adapter and CRM API keys. Ensure keys are loaded into n8n and Activepieces connectors.



1.3 Success Criteria



Orchestrator PC boots all core services (Postgres/RuVector, Redis, n8n, Activepieces, Nexus Router, LiteLLM/OpenRouter, Dify, Claude‑Flow, Quote API) without errors.



A new lead arriving via email or API is parsed, normalized, deduplicated and recorded as a MortgageLead and Person in TwentyCRM. The unstructured text is stored in nyra\_ai.lead\_chunks with an embedding. A campaign is assigned and begins sending messages.



Sending flows (SMS, email, voicemail) deliver messages on schedule, adhere to opt‑out requirements, and stop when a response is detected.



Quotes can be generated on demand via the Quote API or via campaign triggers. The results are persisted and sent to the borrower.



Operators can access a UI to view leads, campaigns and quotes. Borrowers can interact with a Dify chat widget embedded in the landing page; internal agents can use Open‑WebUI for debugging.



All compliance logs and consent records are stored in TwentyCRM; rate limits and encryption are enforced on external calls.



2 Pseudocode \& High‑Level Logic



This pseudocode outlines the key workflows the agent must implement. It abstracts away language‐specific details; actual implementation will use Node/NestJS for backend services and TypeScript/React for the UI.



2.1 Environment Bootstrap

\# On orchestrator PC (Ubuntu or WSL2)

function bootstrap\_orchestrator():

&nbsp;   # Update system packages, install Docker, Docker Compose, and Node with Volta

&nbsp;   ensure\_docker\_installed()

&nbsp;   install\_volta\_and\_node()

&nbsp;   # Clone the repository

&nbsp;   if not exists(NYRA\_REPO\_ROOT):

&nbsp;       git\_clone('https://github.com/ellisapotheosis/Project-Nyra', NYRA\_REPO\_ROOT)

&nbsp;   # Unpack third‑party blueprints and docs

&nbsp;   unzip\_bundle('project-nyra-updated.zip', NYRA\_REPO\_ROOT)

&nbsp;   # Initialize RuVector and Postgres

&nbsp;   run\_script(NYRA\_REPO\_ROOT + '/third\_party/ruvector/scripts/init-ruvector.sh')

&nbsp;   # Pull n8n community nodes and MCP server forks

&nbsp;   pnpm\_install('@twentyhq/n8n-nodes-twenty-dynamic')

&nbsp;   git\_clone('https://github.com/jezweb/twenty-mcp', NYRA\_REPO\_ROOT + '/ops/mcp/twenty-mcp')

&nbsp;   # Build extended MCP server with Nyra tools

&nbsp;   implement\_mcp\_extensions()

&nbsp;   # Start Docker services

&nbsp;   run\_shell(NYRA\_REPO\_ROOT + '/scripts/orchestrator/auto-start-docker.sh')

&nbsp;   # Configure Cloudflare tunnel and Tailscale (requires user input)

&nbsp;   setup\_cloudflared\_and\_tailscale()



2.2 Lead Ingestion

trigger on\_email\_received(msg):

&nbsp;   lead\_data = parse\_email(msg)

&nbsp;   ingest\_lead(lead\_data)



trigger on\_webhook\_received(payload):

&nbsp;   lead\_data = parse\_payload(payload)

&nbsp;   ingest\_lead(lead\_data)



function ingest\_lead(data):

&nbsp;   canonical = normalize\_schema(data)

&nbsp;   existing\_person = TwentyCRM.findPersonByEmailOrPhone(canonical.email, canonical.phone)

&nbsp;   embedding = Embedder.computeEmbedding(canonical.raw\_text)

&nbsp;   potential\_duplicates = RuVector.searchSimilar(embedding, threshold=0.85)

&nbsp;   if existing\_person or potential\_duplicates:

&nbsp;       person = existing\_person or potential\_duplicates\[0].person

&nbsp;       lead = TwentyCRM.findMortgageLead(person.id)

&nbsp;       lead.update(canonical)

&nbsp;   else:

&nbsp;       person = TwentyCRM.createPerson(canonical)

&nbsp;       lead = TwentyCRM.createMortgageLead(person.id, canonical)

&nbsp;   store\_lead\_chunk(source=canonical.source, source\_id=canonical.sourceId, lead\_id=lead.id, text=canonical.raw\_text, embedding=embedding)

&nbsp;   emit\_event('lead.ingested', { lead\_id: lead.id, loan\_type: canonical.loanType, source: canonical.source })



2.3 Campaign Assignment \& Execution

on\_event('lead.ingested', event):

&nbsp;   campaign\_rule = select\_campaign(event.loan\_type, event.source)

&nbsp;   schedule\_campaign(event.lead\_id, campaign\_rule)



function schedule\_campaign(lead\_id, rule):

&nbsp;   for step in rule.steps:

&nbsp;       n8n.schedule\_job(step.offset, send\_message, { lead\_id, step })



function send\_message(lead\_id, step):

&nbsp;   if TwentyCRM.getMortgageLead(lead\_id).stage != 'new':

&nbsp;       return  # campaign cancelled

&nbsp;   msg = render\_template(step.template, { lead: TwentyCRM.getMortgageLead(lead\_id) })

&nbsp;   if step.channel == 'sms':

&nbsp;       Activepieces.twilio\_send\_sms(to=lead.phone, body=msg)

&nbsp;   elif step.channel == 'email':

&nbsp;       Activepieces.sendgrid\_send\_email(to=lead.email, subject=step.subject, body=msg)

&nbsp;   elif step.channel == 'voicemail':

&nbsp;       Activepieces.slybroadcast\_drop\_voicemail(to=lead.phone, recording\_id=step.recording)

&nbsp;   elif step.channel == 'call':

&nbsp;       Activepieces.call\_phone(to=lead.phone, recording\_id=step.recording)

&nbsp;   log\_outbound\_message(lead\_id, step.channel, msg)



trigger on\_reply(event):

&nbsp;   lead\_id = match\_conversation(event.from)

&nbsp;   if event.body.lower().strip() in \['stop', 'unsubscribe']:

&nbsp;       record\_opt\_out(lead\_id, event.channel)

&nbsp;       cancel\_all\_jobs(lead\_id)

&nbsp;   else:

&nbsp;       update\_stage(lead\_id, 'contacted')

&nbsp;       notify\_loan\_officer(lead\_id)

&nbsp;       cancel\_all\_jobs(lead\_id)



2.4 Quote Generation \& AI Assistance

function generate\_quote(lead\_id):

&nbsp;   lead = TwentyCRM.getMortgageLead(lead\_id)

&nbsp;   scenarios = build\_scenarios\_from(lead)

&nbsp;   quotes = QuoteAPI.getQuotes(scenarios)

&nbsp;   TwentyCRM.saveQuotes(lead\_id, quotes)

&nbsp;   email\_content = render\_template('quote\_email', { lead, quotes })

&nbsp;   Activepieces.sendgrid\_send\_email(to=lead.email, subject='Your rate options', body=email\_content)

&nbsp;   log\_quote\_sent(lead\_id, quotes)



function ai\_suggest\_best\_option(lead\_id):

&nbsp;   lead = TwentyCRM.getMortgageLead(lead\_id)

&nbsp;   quotes = TwentyCRM.getQuotes(lead\_id)

&nbsp;   memory\_patterns = RuVector.searchSimilar(Embedder.computeEmbedding(lead.summary), topK=3)

&nbsp;   prompt = compose\_prompt(lead, quotes, memory\_patterns)

&nbsp;   suggestion = ClaudeFlow.ask(prompt)

&nbsp;   TwentyCRM.logAISuggestion(lead\_id, suggestion)

&nbsp;   return suggestion



3 Architecture Design

3.1 Cluster Layout

┌─────────────────────────────────┐

│           Orchestrator         │

│ MinisForum UH680 (Ryzen 7)     │

│                                 │

│  - Postgres + RuVector (twenty \& nyra\_ai DBs)    │

│  - Redis (queues \& state)                        │

│  - n8n (orchestration)                           │

│  - Activepieces (side‑effects)                   │

│  - Nexus Router (MCP \& LLM routing)              │

│  - LiteLLM / OpenRouter proxy                    │

│  - Dify (borrower chat)                          │

│  - Claude‑Flow (agent swarms)                    │

│  - Quote API \& embedding service                 │

└─────────────────────────────────┘

&nbsp;     │ (Tailscale VPN + Docker networks)

&nbsp;     ▼

┌─────────────┐  ┌──────────────┐  ┌──────────────┐

│ GPU Worker1 │  │ GPU Worker2  │  │ GPU Worker3  │

│ RTX 5090    │  │ RTX 3090Ti   │  │ RTX 3060     │

│ vLLM / heavy│  │ embeddings   │  │ fallback     │

└─────────────┘  └──────────────┘  └──────────────┘



3.2 Service Interactions



Lead ingestion – n8n triggers (email/webhook) parse data → call embedding service → write to nyra.lead\_chunks → call TwentyCRM via MCP (dynamic nodes) → send event to campaign engine.



Campaign engine – n8n schedules messages → Activepieces connectors send communications via Twilio, SendGrid, Slybroadcast → logs stored in TwentyCRM.



Quote API – Exposes POST /quotes which accepts borrower scenarios; queries pricing adapters; writes Quote objects to TwentyCRM; returns JSON for UI consumption.



AI service – Claude‑Flow agents call the memory via RuVector to fetch patterns; use LiteLLM/OpenRouter to access LLMs (Claude, GPT, Gemini); produce suggestions.



Nyra Admin UI – React/Next.js app using Shadcn UI and MagicUI. Talks to TwentyCRM via GraphQL; calls Quote API; displays campaigns and quotes; embeds Dify chat.



Landing page – Next.js public site with Tweakcn theme. Posts new leads to the ingestion webhook; offers borrower chat widget; links to disclosures.



3.3 Data Stores



Postgres → twenty – core CRM tables; custom objects for MortgageLead, Quote and LoanApplication.



Postgres → nyra\_ai – lead\_chunks (id, source\_type, source\_id, lead\_id, chunk\_text, embedding, meta, created\_at) with HNSW index; patterns (future). Graphiti/Letta may introduce additional tables (temporal graph) later.



Redis – queueing (BullMQ for n8n jobs) and caching for token counts or rate limiting.



File storage – Pre‑recorded voicemails and audio; static templates. Store in data/uploads or cloud storage if needed.



4 Refinement Plan



The refinement stage breaks the implementation into manageable milestones. Adjust timelines as needed.



Environment \& DB Setup (Day 1–2)



Install Docker, Compose, Node via Volta; set up Tailscale; configure Cloudflare Tunnel.



Clone Project Nyra repo; unpack third‑party blueprints; run init-ruvector.sh to install the RuVector extension and create twenty/nyra\_ai databases.



Configure environment variables (.env files) for Postgres, Redis, Twilio, SendGrid, LLM providers.



Build and start base services via scripts/orchestrator/auto-start-docker.sh.



MCP \& CRM Preparation (Day 3–4)



Install n8n-nodes-twenty-dynamic via the n8n UI or npm; configure connections to TwentyCRM.



Fork jezweb/twenty-mcp, add custom tools (e.g. twenty\_create\_mortgage\_lead, nyra\_get\_similar\_patterns, nyra\_generate\_quote), compile and register with Nexus Router.



Define custom objects and fields in TwentyCRM: MortgageLead, Quote, LoanApplication; create relationships.



Write an initial n8n ingestion workflow: IMAP trigger → function node to normalize → call embedding service → call MCP to create records → publish lead.ingested event.



Campaign Logic \& Activepieces Integration (Day 5–8)



Design campaign JSON definitions for Speed‑to‑Lead, Purchase Nurture, Refinance Nurture, Re‑engagement and Quote Follow‑up (see whitepaper). Store them in TwentyCRM or a config file.



Build the campaign scheduler in n8n: subscribe to lead.ingested events, look up rules table, schedule send\_message jobs via BullMQ.



Configure Activepieces connectors for Twilio (SMS/calls/voicemail), SendGrid (email) and Slybroadcast (voicemail drops). Set up approval steps if needed.



Implement response handlers: Twilio webhook triggers update lead stage; cancel remaining jobs; record opt‑outs.



Quote API \& Excel Processor (Day 9–12)



Scaffold a NestJS service services/quote-api. Implement POST /quotes route to accept a scenario and call pricing adapters or parse the Excel comparison sheet.



Write the Excel parser (Python or Node) that reads the existing rate comparison spreadsheet and produces JSON quote options.



Persist quotes in TwentyCRM; link them to MortgageLead; return them to the caller.



Add a function in n8n to trigger quote generation at specified points (e.g. after contact or by manual trigger). Also expose a button in the UI.



AI Services \& Memory Integration (Day 13–15)



Stand up Claude‑Flow using the included configuration; ensure it can call the MCP and memory.



Implement an embedding service using fastembed (Python or TS) that accepts text and returns 384‑dimensional vectors; ensure concurrency for high throughput.



Write a MemoryManager module in the AI service (Node) that can read/write embeddings to RuVector and query for similar patterns.



Add AI assistance functions: suggest next best actions for deals, summarise interactions, and explain quotes. Log suggestions into the ai\_audit\_log table.



UI Integration (Day 16–18)



Extend the Nyra Admin UI (Next.js) to display leads, campaign statuses, quotes and AI suggestions. Use Shadcn UI and MagicUI components; apply Tweakcn colour palette and Tailwind variables.



Embed a Dify chat widget on the public RateHunter landing page; ensure the widget calls the Nexus Router for all model/tool requests. Add forms for lead capture that post to the ingestion webhook.



For operators, integrate Open‑WebUI (admin portal) behind Cloudflare Access for debugging and agent management.



Compliance \& Hardening (Day 19–21)



Implement consent ledger storage in TwentyCRM; ensure all outbound messages contain opt‑out instructions.



Configure Nexus Router with API keys, rate limits and telemetry to monitor usage.



Add TLS termination via Cloudflare; verify encryption at rest for Postgres and secure secret injection via Infisical or env.



Conduct penetration testing on the endpoints; close open ports; restrict firewall rules.



Testing \& Launch (Day 22–24)



Write unit tests for ingestion functions, deduplication and quote generation; write integration tests for n8n workflows and Activepieces connectors.



Run end‑to‑end tests: ingest sample leads and confirm campaign execution, quoting and UI updates.



Train staff on using the admin UI; gather feedback; iterate on prompts and templates.



Ship to production by running auto-start-docker.sh on orchestrator at boot; use WOL to wake GPU workers when AI inference is needed.



5 Completion \& Delivery



Upon completion of the refinement steps, the system should be fully operational and ready for production. Final tasks include:



Documentation – Update README, runbook and threat model to reflect final configuration. Provide API reference for the Quote API and MCP extensions. Document new environment variables and file locations.



Release Artifacts – Build Docker images (docker build . -t nyra/<service>), publish version tags and update Docker Compose files. Provide the complete source code on GitHub along with migration scripts.



Monitoring \& Support – Deploy Grafana and Prometheus or use the existing cluster monitoring stack. Set up alerts for failed workflows, slow queries, high message failure rates or compliance issues.



Ongoing Improvements – Plan for phase 2 enhancements (Graphiti/Letta temporal memory, advanced lead scoring models, voice capabilities). Continue refining campaign content and AI prompts based on conversion data.



Following this one‑shot SPARC workflow will prepare the orchestrator machine, instantiate every service, implement the core features and deliver a running mortgage CRM with AI assistance, ready to serve borrowers and brokers alike.



This file covers:



Specification: goals and success criteria for ingesting leads, deduplicating, running multi‑channel drip campaigns, generating quotes, and ensuring compliance.



Pseudocode: high‑level logic for environment bootstrap, lead ingestion, campaign scheduling, response handling, quote generation and AI assistance.



Architecture: diagrams and descriptions of the orchestrator and GPU workers, core services (n8n, Activepieces, Nexus, Dify, Claude‑Flow, RuVector‑Postgres, Quote API), data stores and network topology.



Refinement Plan: a stepwise implementation timeline (days 1–24) detailing environment set‑up, MCP/CRM configuration, campaign logic, Quote API, AI services, UI integration, compliance hardening, testing and launch.



Completion \& Delivery: documentation, release artifacts, monitoring, and future improvements.



Unzip the latest project‑nyra‑updated bundle into /opt/repos/project‑nyra, follow the workflow, and you’ll have everything running end‑to‑end. If you need any help executing the steps, feel free to ask!

