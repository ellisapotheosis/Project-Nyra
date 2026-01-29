# Architecture: Nyra (Mortgage Ops + Agentic Memory)

## Primary goals
1. **Borrower-facing automation** that is *logistical only* (status updates, doc requests, scheduling, handoffs).
2. **Internal agentic ops** (lead triage, campaign selection, quote assembly, compliance checks).
3. **CRM truth-source** = TwentyCRM; everything else reads from or syncs to it.
4. **Memory** must handle complex relationships, multi-step context, and auditability.

## Core stack (this repo)
- **TwentyCRM** (Postgres-backed) — operational truth: leads, people, pipeline stages.
- **Nexus Router (grafbase/nexus)** — *single entry-point* for MCP tool aggregation + fuzzy tool selection + routing.
- **LiteLLM + OpenRouter** — provider-agnostic model routing + cost controls + fallback models.
- **Letta** — stateful “manager” agent for long-running tasks / plans.
- **Mem0 + OpenMemory MCP** — universal episodic memory (preferences, conversation summaries, “vibe” facts).
- **Graph memory (Graphiti + FalkorDB)** — relational/temporal knowledge graph for multi-hop reasoning (optional overlay in `docker-compose.graphiti.yml`).
- **Observability** — Prometheus + Loki + Grafana + Alertmanager.

## Why Dify + n8n (and where they fit)
- **Dify**: production chat UX + app-level policies + tools/KB (your borrower-facing UI / internal copilots).
- **n8n**: deterministic workflow engine for SMS/email/voicemail/campaign scheduling + integrations (Twilio/SendGrid/Calendly/etc).
- Your **Nyra Orchestrator** service becomes the “policy gate” between AI and actions:
  - validates consent + channel rules
  - blocks loan-specific advice
  - writes audit logs
  - routes to n8n for execution

## UI strategy
You’ll run 3 UIs:
1) **Twenty** — CRM ops + pipeline truth.
2) **Nyra Admin (custom)** — campaign builder, lead control, quote desk, audit center (shadcn + magicUI).
3) **Chat UI**:
   - Dify embedded inside Nyra Admin (internal) and RateHunter (borrower)
   - Open-WebUI optional for internal debugging / multi-model playground.

## “No junk” rule
- We are **not** using MetaMCP/McProxy or ArchGW/Plano right now.
- Leave space for voice (Kokoro-TTS) but keep it behind a feature flag + separate compose overlay.

## Data flow (high level)
1. Lead arrives → normalized → Twenty “Person + MortgageLead” record.
2. Nyra Orchestrator:
   - stores episodic memory in Mem0
   - stores relational facts/links in Graph memory (Graphiti)
   - selects campaign (rules + LLM)
3. Campaign Engine schedules steps via n8n.
4. Borrower replies:
   - Dify handles chat UI, calls Orchestrator tool endpoints.
   - Orchestrator enforces guardrails; escalates to human when needed.
