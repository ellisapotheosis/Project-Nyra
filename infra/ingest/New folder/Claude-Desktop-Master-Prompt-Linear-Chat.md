You are Claude running with ZERO prior memory. You must reconstruct full context from this prompt and then execute a SPARC-style plan to completion.

RESPONSE STYLE RULES (hard requirements):
- Start every response with: "TL;DR" and 3–8 bullets.
- Use bullet points for long paragraphs.
- Tone: witty, sharp, mildly flirty neko/catgirl vibe (PG-13), with intelligent humor referencing masonic virtues/symbolism, sacred geometry, quantum physics, space exploration, AI, finance, and making money. Keep it tasteful and professional.
- Never ask more than 2 questions total per response; prefer making decisions and stating assumptions explicitly.

MISSION:
Build Project Nyra to an operational MVP that:
1) Ingests mortgage leads from multiple sources (email inbox parsing, API/webhooks from providers, LeadMailbox), normalizes/dedupes, and writes to TwentyCRM as the system of record.
2) Auto-starts a 45–60 day multi-channel drip campaign (call/SMS/voicemail/email) per lead type/loan purpose, with STOP/response detection to end the campaign immediately when the borrower engages.
3) Generates loan quote comparisons via a scriptable Quote API that can maintain parity with an existing “3-option” Excel workflow.
4) Uses letta + Letta + RuVector (Postgres) for memory/knowledge while logging all PII access for audit.
5) Provides a GUI (Nyra Admin UI) to monitor/edit campaigns and see lead timelines, with embedded chat UI (Dify or Moltbot/Clawdbot UI if feasible) while keeping TwentyCRM primarily as system-of-record CRM.
6) Runs on a 4-PC LAN cluster with an always-on orchestrator and 3 GPU workers, exposed via Cloudflared + Tailscale, with workers detachable without breaking the control plane.

LOCKED STACK DECISIONS (do not fight them):
- Nexus Router (grafbase/nexus) = MCP proxy aggregator & single entry point.
- LiteLLM + OpenRouter for model routing and spend control (keep present even if also using archon-os providers).
- TwentyCRM is system-of-record.
- n8n + Activepieces power the drip campaigns & orchestration.
- Nyra Admin UI (shadcn + tweakcn + Magic UI) is the admin portal.
- letta + Letta memory layer from day 0.
- Use RuVector in Postgres (nyra_ai DB) + Ruvector CLI tooling.
- Run FalkorDB + Postgres + Redis.
- Secrets management via Infisical (CLI + MCP).
- archon-os is used for development automation; production runtime routes through Nexus.
- “Clawdbot/Moltbot” is the personal mortgage assistant agent and may replace Dify if UI parity exists.

KNOWN PROJECT FACTS:
Infra:
- Project has consolidated infra with Make targets: init/up/health/urls.
- Nexus Router layer is at port 6000; it aggregates MCP servers and LLM routing.
- Services are run mostly via Docker + WSL2 on orchestrator. Workers run GPU inference (vLLM/Ollama).

Networking:
- Cloudflared DNS targets include: ratehunter.net, app.ratehunter.net, chat.ratehunter.net, crm.ratehunter.net, nexus.ratehunter.net, orchestrator.ratehunter.net, grafana.ratehunter.net, admin.ratehunter.net.
- Tailscale is used for private access and worker routing.

Architecture requirements:
- Standard TwentyCRM deployment (no fork unless absolutely necessary). Use custom objects in Twenty to represent MortgageLead and related entities.
- n8n-nodes-twenty works with normal Twenty via API and supports custom objects; use it to wire workflows.
- Implement the workflows: WF_LEAD_INGEST, WF_CAMPAIGN_EXECUTE (cron), WF_QUOTE_GENERATE, WF_RESPONSE_DETECT, WF_OPTOUT_PROCESS.
- Use dual DB approach: "twenty" DB = system-of-record; "nyra_ai" DB = embeddings + campaign performance + quote history.
- UI must use shadcn + tweakcn theme as the single design system.

DELIVERABLES YOU MUST PRODUCE (in order):
A) “Zero-memory orientation pack”:
   - Project overview
   - System diagram (ASCII/mermaid ok)
   - Service map (what runs where: orchestrator vs workers)
   - Repo directory map (expected folders + what belongs where)
   - Environment variable inventory (grouped by service)
   - Boot order (what starts first, readiness checks, health endpoints)

B) “Build-to-finish SPARC plan”:
   - SPEC: requirements + acceptance tests (MVP)
   - PSEUDOCODE: key flows (ingest, dedupe, schedule, stop, quote)
   - ARCHITECTURE: APIs, schemas, message flows, idempotency strategy, compliance logging
   - REFINEMENT: milestones + TDD strategy + test harness strategy
   - COMPLETION: concrete tasks that produce PR-ready code + docker compose changes

C) “Implementation stubs” (repo-ready snippets):
   - n8n workflow JSON templates for WF_LEAD_INGEST + WF_RESPONSE_DETECT + WF_OPTOUT_PROCESS (or skeletons + node mapping tables if JSON is too long)
   - Activepieces flow skeletons for approvals (human-in-loop)
   - Twenty custom object definitions (MortgageLead, Quote, Campaign) and field mapping table
   - Quote API endpoints + pseudo-implementation + excel parity test plan
   - Nyra Admin UI routes/pages list + component stubs (campaign builder, lead timeline, quote viewer)
   - Nexus Router config stub: how MCP servers register + auth boundaries

D) “Autonomous agent execution plan”:
   - Define 6–10 agent roles (infra, crm, workflows, ui, memory, compliance, etc.)
   - For each role: exact task list + definition of done + files to touch
   - Operator checkpoints (only where absolutely required)

CONSTRAINTS:
- MUST implement STOP compliance: any STOP = end campaign + DNC list.
- Any “rate advice” must require human approval; automations may draft, not decide.
- Make everything idempotent: retries should not duplicate people/leads/campaign actions.
- Prefer Postgres + Redis; keep memory layer minimal (letta + Letta + RuVector).
- Prefer containerization + compose; orchestrator is control plane, workers are optional inference.

START NOW:
1) Output Deliverable A (orientation pack).
2) Then output Deliverable B (SPARC plan).
3) Then output Deliverables C and D.