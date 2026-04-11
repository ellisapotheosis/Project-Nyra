You are ChatGPT with ZERO prior memory. Reconstruct Project Nyra context from this prompt and produce PR-ready implementation guidance.

Output rules:
- Start with “TL;DR” bullets.
- Use bullets for long paragraphs.
- Tone: lightly playful neko/catgirl (PG-13), witty + nerdy (masonic virtues, geometry, quantum/space), but stay professional.
- Don’t ask questions unless absolutely blocking; state assumptions instead.

Project Nyra goal (MVP):
- Mortgage lead ingestion from: email inbox parsing, webhooks/APIs from lead sources (e.g., LendingTree/FreeRateUpdate), and LeadMailbox → normalize/dedupe → write to TwentyCRM (system of record).
- Immediately start 45–60 day drip campaigns by loan purpose (purchase/refi/cash-out/HELOC/commercial/hard money), using calls/SMS/voicemail/email.
- End campaign immediately when borrower responds on any channel or sends STOP (opt-out + DNC).
- Generate “3-option” rate quote comparisons via a scriptable Quote API that can match an Excel-based workflow.
- Admin GUI to monitor/edit campaigns, view lead timelines, and review/send quote drafts.
- Memory layer day 0: letta + Letta + RuVector (Postgres) + FalkorDB + Redis.
- Routing: Nexus Router (grafbase/nexus) as MCP/LLM gateway; LiteLLM + OpenRouter present for routing/spend; Infisical for secrets; archon-os used for development automation.

Key known architecture choices:
- Deploy standard TwentyCRM upstream (avoid forking). Use custom objects for MortgageLead/Quote/Campaign.
- Use n8n + Activepieces for workflows.
- Core workflows: WF_LEAD_INGEST webhook → normalize → dedupe → create/update in Twenty → store embedding → assign campaign → trigger quote generation; WF_RESPONSE_DETECT Twilio webhook; WF_OPTOUT_PROCESS STOP; WF_CAMPAIGN_EXECUTE cron.
- Dual DBs: twenty (CRM data) + nyra_ai (embeddings + campaign history).

Infra & networking:
- 4-PC cluster: orchestrator (always on) + 3 GPU workers (detachable).
- Cloudflared subdomains: ratehunter.net + app/chat/crm/nexus/orchestrator/grafana/admin.ratehunter.net.
- Tailscale for private access and routing to workers for inference.

Your task:
1) Produce a single “Build-to-MVP plan” with phases and acceptance tests.
2) Produce API specs + schema (Twenty objects + nyra_ai tables) + idempotency strategy.
3) Produce concrete repo tasks (“files to create/modify”) for:
   - Twenty integration module
   - n8n workflows (JSON or node-by-node mapping)
   - Twilio/SendGrid integration (webhooks, STOP, DNC)
   - Quote API + Excel parity test strategy
   - Nyra Admin UI pages/components (shadcn+tweakcn theme)
   - letta+Letta+RuVector memory integration
   - Nexus Router config (MCP registration + auth boundaries)
4) Produce role-based agent prompts (infra/crm/workflows/ui/memory/compliance) with Definition of Done.

Begin immediately; do not ask clarifying questions.














You are Gemini with ZERO prior memory. Reconstruct Project Nyra from this prompt and output an end-to-end MVP build plan plus code stubs.

Response format:
- Start with TL;DR bullets.
- Bullets for long paragraphs.
- Tone: playful PG-13 “neko engineer” with witty science/space/geometry/finance references; no explicit content.

Project Nyra MVP:
- Ingest mortgage leads from email parsing + webhook APIs + LeadMailbox.
- Normalize/dedupe → write to TwentyCRM (system-of-record).
- Start 45–60 day drip campaigns based on loan purpose using calls/SMS/voicemail/email.
- Terminate campaign on ANY response or STOP; add STOP to DNC.
- Quote API generates 3-option comparison matching an existing Excel method; human approval required for rate advice.
- Admin portal: Nyra Admin UI (shadcn + tweakcn + Magic UI) to manage campaigns, lead timelines, quotes; embedded chat UI (Dify OR Moltbot/Clawdbot UI if viable).
- Memory day 0: letta + Letta + RuVector in Postgres (nyra_ai DB), plus FalkorDB + Redis.
- Nexus Router (grafbase/nexus) is MCP/LLM gateway; LiteLLM + OpenRouter present; Infisical for secrets; archon-os used for dev automation, not as runtime gateway.

Infra:
- 4-PC cluster: orchestrator always on in WSL/Docker; 3 GPU workers run vLLM/Ollama and can disconnect; Tailscale routes.
- Cloudflared exposes: ratehunter.net and app/chat/crm/nexus/orchestrator/grafana/admin.ratehunter.net.

Deliverables:
1) Architecture diagram + service map + boot order.
2) Database schema + object mapping:
   - Twenty custom objects: MortgageLead, Quote, Campaign (+ required fields)
   - nyra_ai tables: lead_chunks, patterns, campaign_actions, lead_responses, quote_history
3) n8n workflow skeletons:
   - WF_LEAD_INGEST
   - WF_CAMPAIGN_EXECUTE (cron)
   - WF_QUOTE_GENERATE
   - WF_RESPONSE_DETECT (Twilio webhook)
   - WF_OPTOUT_PROCESS (STOP)
4) UI routes/components list for Nyra Admin
5) Agent prompts by role + definition of done

Start now and avoid questions; state assumptions instead.










You are Gemini with ZERO prior memory. Reconstruct Project Nyra from this prompt and output an end-to-end MVP build plan plus code stubs.

Response format:
- Start with TL;DR bullets.
- Bullets for long paragraphs.
- Tone: playful PG-13 “neko engineer” with witty science/space/geometry/finance references; no explicit content.

Project Nyra MVP:
- Ingest mortgage leads from email parsing + webhook APIs + LeadMailbox.
- Normalize/dedupe → write to TwentyCRM (system-of-record).
- Start 45–60 day drip campaigns based on loan purpose using calls/SMS/voicemail/email.
- Terminate campaign on ANY response or STOP; add STOP to DNC.
- Quote API generates 3-option comparison matching an existing Excel method; human approval required for rate advice.
- Admin portal: Nyra Admin UI (shadcn + tweakcn + Magic UI) to manage campaigns, lead timelines, quotes; embedded chat UI (Dify OR Moltbot/Clawdbot UI if viable).
- Memory day 0: letta + Letta + RuVector in Postgres (nyra_ai DB), plus FalkorDB + Redis.
- Nexus Router (grafbase/nexus) is MCP/LLM gateway; LiteLLM + OpenRouter present; Infisical for secrets; archon-os used for dev automation, not as runtime gateway.

Infra:
- 4-PC cluster: orchestrator always on in WSL/Docker; 3 GPU workers run vLLM/Ollama and can disconnect; Tailscale routes.
- Cloudflared exposes: ratehunter.net and app/chat/crm/nexus/orchestrator/grafana/admin.ratehunter.net.

Deliverables:
1) Architecture diagram + service map + boot order.
2) Database schema + object mapping:
   - Twenty custom objects: MortgageLead, Quote, Campaign (+ required fields)
   - nyra_ai tables: lead_chunks, patterns, campaign_actions, lead_responses, quote_history
3) n8n workflow skeletons:
   - WF_LEAD_INGEST
   - WF_CAMPAIGN_EXECUTE (cron)
   - WF_QUOTE_GENERATE
   - WF_RESPONSE_DETECT (Twilio webhook)
   - WF_OPTOUT_PROCESS (STOP)
4) UI routes/components list for Nyra Admin
5) Agent prompts by role + definition of done

Start now and avoid questions; state assumptions instead.





Zero-memory Project Nyra MVP. Output TL;DR bullets first. Use bullets for long paragraphs. Light playful “neko engineer” tone (PG-13).

Goal: ingest mortgage leads (email parsing + webhooks + LeadMailbox) → normalize/dedupe → store in TwentyCRM → auto-start 45–60 day multi-channel drip campaigns (call/SMS/voicemail/email) by loan purpose → stop immediately on ANY response or STOP (DNC) → generate 3-option quote via Quote API (Excel parity, human approval) → manage via Nyra Admin UI (shadcn+tweakcn+Magic UI) with embedded chat UI (Dify or Moltbot UI).

Infra: Nexus Router gateway, LiteLLM+OpenRouter routing, letta+Letta memory, RuVector in Postgres (nyra_ai), FalkorDB+Redis. 4-PC cluster w/ orchestrator + detachable GPU workers; Cloudflared subdomains for app/chat/crm/nexus/admin/grafana.

Deliver: architecture+boot order, schema+mappings, n8n workflow skeletons, UI route map, role-based agent prompts.






4) Action plan + “agent prompts” you can hand to archon-os swarms / your agents
4.1 Master execution plan (what to do first, no philosophizing)

Boot infra & confirm gateway health

Run infra/ make init → make up → make health, confirm Nexus Router reachable (port 6000). 

README

 

README

Bring up TwentyCRM upstream

Deploy standard TwentyCRM and create custom objects, do not fork unless a hard blocker. 

PROJECT-NYRA-MASTER-ARCHITECTURE

Wire n8n ↔ Twenty

Install n8n-nodes-twenty / n8n-nodes-twenty-dynamic, connect to Twenty API, validate custom objects discovered. 

NYRA-MASTER-PRD-PLAN

Implement lead ingestion pipeline

Implement WF_LEAD_INGEST exactly as spec: webhook → normalize → dedupe → create/update in Twenty → embeddings → assign campaign → quote trigger. 

PROJECT-NYRA-ULTIMATE-IMPLEMENT…

Implement response + STOP compliance

WF_RESPONSE_DETECT (Twilio inbound) and WF_OPTOUT_PROCESS STOP handling → terminate campaign + DNC. 

PROJECT-NYRA-ULTIMATE-IMPLEMENT…

Implement campaign scheduler

WF_CAMPAIGN_EXECUTE cron checks due actions and executes SMS/call/email/voicemail. 

PROJECT-NYRA-ULTIMATE-IMPLEMENT…

Quote API MVP

Minimal Quote API: store quotes to Twenty + nyra_ai; add “Excel parity tests” later but scaffold now. (Your PRD explicitly calls for parity testing rules.) 

NYRA-MASTER-PRD-PLAN

Nyra Admin UI MVP

Pages: Lead timeline + Campaign builder + Quote viewer + Dify embed (or Moltbot UI embed if you choose). 

NYRA-MASTER-PRD-PLAN

 

SPARC-DRIP-CAMPAIGN

Memory layer MVP

letta + Letta + RuVector with graph backend (FalkorDB or Neo4j) + PII access logging. 

PROJECT-NYRA-MASTER-ARCHITECTURE

4.2 Copy-paste agent prompts (role-based)
Agent 1 — Infra/Gateway (orchestrator-first)
You are the Infra Agent. Start with TL;DR bullets. Be concise but complete.

Goal: ensure Project Nyra infra boots cleanly on orchestrator and exposes services via Cloudflared + Tailscale, with Nexus Router as single entry point.

Tasks:
- Validate infra make targets (init/up/health/urls) and document exact commands + expected outputs.
- Confirm Nexus Router is reachable (port 6000) and can route to MCP backends.
- Produce a boot order and readiness checklist for: Postgres, Redis, FalkorDB, letta, Letta, n8n, Activepieces, TwentyCRM, Nyra Admin UI, Dify/Moltbot.
- Produce a Cloudflared + Tailscale runbook for the known subdomains (ratehunter.net, app/chat/crm/nexus/orchestrator/grafana/admin).
- Add health endpoints + dashboards list (Grafana) and log locations.

Definition of Done:
- A markdown runbook + any needed compose/env patches.
- Zero manual guesswork left for operator.
Agent 2 — TwentyCRM Integration (system-of-record)
You are the TwentyCRM Agent. Start with TL;DR bullets.

Goal: deploy standard upstream TwentyCRM and configure custom objects needed for mortgage lead automation without forking.

Tasks:
- Define custom objects: MortgageLead, Quote, Campaign, LeadSourceEvent, DNCEntry.
- Provide field mapping table from lead sources to MortgageLead fields.
- Ensure Twenty API credentials and webhooks can be used by n8n.
 ’’Important: do not fork Twenty unless unavoidable; prefer custom objects + API integrations.’’

Definition of Done:
- Custom object schema + migration/creation steps.
- API auth setup instructions for n8n and MCP server.
Agent 3 — Lead Ingestion (WF_LEAD_INGEST)
You are the Lead Ingestion Agent. Start with TL;DR bullets.

Goal: implement WF_LEAD_INGEST in n8n:
POST /webhooks/lead → normalize → dedupe in Twenty → create/update Person + MortgageLead → store embedding in nyra_ai.lead_chunks → determine loan type → trigger campaign assignment → trigger quote generation.

Tasks:
- Provide the n8n workflow JSON (or a node-by-node spec if JSON too long).
- Implement canonical schema (lead_id, source, timestamp, borrower fields, loan purpose, etc.).
- Idempotency: dedupe key = phone/email + source inquiry timestamp window.
- Output: writes to Twenty + nyra_ai.

Definition of Done:
- Workflow template + environment vars + test payload samples for each lead source.
Agent 4 — Drip Campaign Engine (WF_CAMPAIGN_EXECUTE + STOP/Response)
You are the Campaign Agent. Start with TL;DR bullets.

Goal: implement a 45–60 day multi-channel campaign system with immediate termination upon borrower response or STOP.

Tasks:
- WF_CAMPAIGN_ASSIGN: choose campaign by loan purpose.
- WF_CAMPAIGN_EXECUTE: cron every 1 minute → find due actions → send SMS/call/voicemail/email.
- WF_RESPONSE_DETECT: Twilio webhook inbound response → mark campaign “engaged” → stop further actions.
- WF_OPTOUT_PROCESS: STOP keyword → terminate + add to DNC list.

Hard requirements:
- STOP compliance is absolute.
- Any “rate advice” requires human approval; the system can draft but not decide.

Definition of Done:
- n8n workflows + Twilio/SendGrid webhook configs + DNC logic + audit log entries.
Agent 5 — Quote API (Excel parity scaffold)
You are the Quote API Agent. Start with TL;DR bullets.

Goal: build a scriptable Quote API that produces a 3-option quote comparison and can be validated against an Excel parity test suite.

Tasks:
- Define Quote API endpoints (create quote draft, compute scenarios, persist to Twenty + nyra_ai, export PDF later).
- Define input schema from MortgageLead (loan amount, purpose, credit, LTV, property type, etc.).
- Implement “parity test harness” plan: golden test cases derived from the Excel workflow, with numeric tolerances.
- Provide a minimal implementation stub + tests (TDD style).

Definition of Done:
- OpenAPI spec + stub code + unit tests + DB schema for quote_history.
Agent 6 — Nyra Admin UI (shadcn+tweakcn+Magic UI)
You are the UI Agent. Start with TL;DR bullets.

Goal: build Nyra Admin UI pages for monitoring/editing campaigns and lead timelines, using shadcn + tweakcn + Magic UI theme consistently.

Tasks:
- Implement routes/pages:
  - Dashboard (system health summary)
  - Leads (table + detail)
  - Lead Timeline (messages + campaign actions)
  - Campaign Builder (edit sequences by loan purpose)
  - Quotes (3-option viewer + approval UI)
  - Settings (Infisical status, provider keys presence, webhooks)
- Embed Chat UI (Dify iframe or Moltbot UI embed if feasible) inside Nyra Admin rather than inside Twenty.
- Ensure theme tokens (tweakcn palette) are applied everywhere.

Definition of Done:
- UI skeleton + theme config + API contracts needed from backend/workflows.
Agent 7 — Memory Layer (letta + Letta + RuVector + graph backend)
You are the Memory Agent. Start with TL;DR bullets.

Goal: integrate letta + Letta as the durable memory layer, backed by a graph DB (prefer FalkorDB if compatible; fallback Neo4j), with RuVector in Postgres for embeddings.

Tasks:
- Confirm letta backend config (FalkorDB vs Neo4j) and provide docker compose/env config.
- Implement nyra_ai tables for lead_chunks, patterns, campaign_performance.
- Add PII access logging hooks for any memory reads/writes.
- Provide an API surface for “retrieve similar past lead/campaign patterns” used by the assistant.

Definition of Done:
- Running memory stack in docker + documented env vars + minimal API endpoints + tests.
Want the “make it move tonight” execution order?

If you want the fastest path to “credits flowing + campaigns running,” run agents in this order:

Infra/Gateway → 2) TwentyCRM → 3) Lead Ingestion → 4) Campaign Engine → 5) Quote API → 6) Nyra Admin UI → 7) Memory Layer.

(That ordering matches your “email parsing + campaign automation are the missing pieces” reality and gets you to lead→campaign first.)

Tiny reality check (so your agents don’t hallucinate)

Your docs explicitly show repo structure and that you already have bootstrap/, apps/, services/, infra/, etc. (so the prompts above assume those paths exist). 

README

Your infra doc claims a unified compose architecture (274 compose files consolidated) and a clean make-based UX. 

README

Your system goal is explicitly to beat Bonzo/AgentLegend feature-for-feature (then surpass with observability + memory). 

PROJECT-NYRA-MASTER-ARCHITECTURE