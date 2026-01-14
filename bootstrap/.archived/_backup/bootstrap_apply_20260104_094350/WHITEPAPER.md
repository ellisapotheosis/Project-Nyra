# Project Nyra — Architecture & Implementation Whitepaper (v1)

**Date:** 2025-12-31  
**Stack decisions locked in this doc:** Nexus Router (grafbase/nexus) + LiteLLM + OpenRouter, Dify + Activepieces + n8n, TwentyCRM as system-of-record CRM, standalone Nyra Admin UI (shadcn + Magic UI), Graphiti + Letta memory layer from day 0, and a scriptable Quote API.

> **Not legal advice.** This document includes compliance considerations and risk controls; run everything past qualified counsel before production use.

---

## 0) Executive summary

Project Nyra is an AI-augmented mortgage operations platform with:
- **Borrower-facing logistics automation** (status updates, doc requests, scheduling, message relay) with strict topic boundaries.
- **Agent-facing orchestration** for internal workflows (lead triage, campaign selection, quote preparation, CRM hygiene).
- **A “memory cube”**: Graphiti temporal knowledge graph + Letta memory manager, mirrored against TwentyCRM and enriched by conversation events.
- **Campaign & Quote control plane** in a standalone Nyra Admin webapp (shadcn + Magic UI), separate from TwentyCRM’s UI.

The primary engineering goal is **high reliability + compliance-first automation**:
- deterministic workflows are executed by **n8n** (timers, drip campaigns, retries) + **Activepieces** (connectors + approvals)
- conversational intelligence and application UX live in **Dify**
- all tools & models are routed through **Nexus Router**, with **LiteLLM** handling provider routing and telemetry.

---

## 1) Goals & non-goals

### Goals
1. **Beat Bonzo/AgentLegend** feature-for-feature, then add:
   - multi-system memory, graph intelligence, and workflow observability
   - quote automation with audit trails
   - campaign editing and preview with compliance guardrails
2. **Borrower communications** constrained to logistics and doc collection.
3. **Single source of truth**: TwentyCRM.
4. **Production-grade governance**: routing, auth, rate limits, audit logs.

### Non-goals (for v1)
- Replacing TwentyCRM entirely (we extend it).
- Fully automated underwriting/loan pricing decisions (human approval required).
- Voice (Kokoro TTS) ships later — **explicitly reserved** in the design.

---

## 2) High-level system diagram

```mermaid
flowchart LR
  subgraph UX[User Experiences]
    RH[RateHunter Landing]
    NA[Nyra Admin (shadcn + Magic UI)]
    DF[Dify Embedded Chat UI]
  end

  subgraph Orchestration
    NX[Nexus Router]
    LL[LiteLLM]
    AP[Activepieces]
    N8[n8n]
  end

  subgraph Systems[Systems of Record + Memory]
    T20[TwentyCRM (Postgres)]
    GRA[Graphiti + FalkorDB/Neo4j]
    LET[Letta (Memory Manager)]
    OBJ[(S3/MinIO for docs)]
    OBS[Prometheus/Loki/Grafana]
  end

  RH -->|lead submit| N8
  NA --> DF
  DF --> NX
  NA -->|ops actions| AP
  N8 --> AP
  AP --> T20
  N8 --> T20
  T20 --> GRA
  DF --> LET
  LET --> GRA
  NX --> LL
  LL -->|OpenRouter| LLMs[(Claude/GPT/etc)]
  NX -->|MCP Tools| AP
  NX -->|MCP Tools| GH[GitHub MCP]
  NX -->|MCP Tools| FS[Filesystem MCP]
  NX -->|MCP Tools| DH[Docker Hub MCP]
  Orchestration --> OBS
  Systems --> OBS
```

---

## 3) Why this stack (and what each piece owns)

### Nexus Router (grafbase/nexus)
Nexus is the **unified routing + governance plane** for:
- **MCP tool aggregation** (one endpoint for many tools)
- **LLM provider routing**
- **centralized auth + rate limits + observability**

### LiteLLM + OpenRouter
- LiteLLM: model routing, spend analytics, provider fallback.
- OpenRouter: multi-model access across providers.

### Dify (embedded in Nyra Admin + borrower portals)
Dify owns:
- The **chat UI** and “AI app runtime”
- **Knowledge** for grounded answers (but we prefer Graphiti for relationships)
- Exposing Dify apps as MCP if needed later.

### Activepieces
Activepieces owns:
- “hands” — app integrations, approvals, connector catalog.
- MCP tool surfaces that agents can call.

### n8n
n8n owns:
- Long-running orchestration: **drip campaigns, schedules, retries, timers**
- Integration glue: webhooks from lead sources, syncing events.

### TwentyCRM
TwentyCRM is **system-of-record**:
- leads, people, pipeline stages, activity.
- You build a custom UI that operates *on top of* Twenty via API.

### Graphiti + Letta
- Graphiti: temporally-aware knowledge graph memory for agents.
- Letta: memory manager deciding what becomes durable memory.

---

## 4) Compliance & legal risk controls (high-level)

### 4.1 TCPA / robocall & text compliance
Maintain an auditable consent ledger, and manage opt-outs across all channels. FCC “one-to-one consent” changes (effective Jan 27, 2025) should be assumed relevant to lead-gen-style outreach.

### 4.2 CAN-SPAM
Email must include opt-out mechanisms and honor opt-out quickly.

### 4.3 GLBA Safeguards / privacy
If you handle consumer financial information, implement a written security program, access controls, encryption, incident response, vendor due diligence.

### 4.4 CFPB and chatbot risk
The CFPB has publicly stated it is monitoring chatbots in consumer finance and expects institutions to meet obligations and avoid harming consumers.

**Nyra control strategy**
- Borrower bot is “logistics-only”, with a classifier gate.
- Anything about rates, approvals, underwriting decisions → **human escalation**.
- Every outbound message: “You can opt out” + channel-specific compliance.
- Full audit trail: *who said what, why, and what tool was used*.

---

## 5) Core workflows (v1)

### 5.1 Lead intake
Sources:
- RateHunter form
- LendingTree / FreeRateUpdate feeds
- LeadMailbox (if integrable)
Flow:
1. Ingest → n8n webhook
2. Normalize lead → create Person + MortgageLead in Twenty
3. Pick campaign (rules engine) → schedule steps via n8n
4. Queue quote job → Quote API

### 5.2 Campaign execution
- Campaign authoring in Nyra Admin
- Campaign runner in n8n
- Channel delivery via Activepieces connectors (SMS/email/voicemail provider)
- Consent / opt-out enforced centrally.

### 5.3 Quote generation
- Quote API consumes scenario + borrower facts
- Pricing adapters (Rocket/LenderPrice/etc.) — initial phase may be manual import
- Output: multi-option quote JSON + (later) PDF; writeback to Twenty + Graphiti

### 5.4 Borrower conversation (logistics-only)
Dify app “Borrower Concierge” reads pipeline stage + missing docs, offers scheduling, logs events.

### 5.5 Internal operator assistant
Dify app “Nyra Ops” can draft messages, build campaigns, prepare quotes; approval required for outbound sends.

---

## 6) MCP toolchain (recommended minimum)

Route all tools through Nexus:
- GitHub MCP Server
- Filesystem MCP (dev only)
- Docker Hub MCP
- Docker MCP Gateway / Toolkit (optional dev convenience)
- Serena MCP (semantic code retrieval/editing)
- Archon MCP (project knowledge/tasks) — internal only

---

## 7) Repo layout & bootstrapping

This package includes a proposed structure:
- `bootstrap/` — scripts to clone forks, configure env, run dev/prod, set up Gitea and CI
- `vendor/` — cloned forks (claude-flow, archon)
- `prod/vendor-images/` — Dockerfiles to build pinned production images from those forks
- `infra/` — docker-compose stacks, monitoring, secrets patterns
- `apps/` — nyra-admin + ratehunter
- `services/` — quote-api + campaign-engine

---

## References (URLs)
- Nexus Router docs: https://nexusrouter.com/docs
- Grafbase Nexus repo: https://github.com/grafbase/nexus
- Dify MCP docs: https://docs.dify.ai/en/use-dify/publish/publish-mcp and https://docs.dify.ai/en/use-dify/build/mcp
- Activepieces MCP overview: https://www.activepieces.com/blog/model-context-protocol-mcp
- Docker Hub MCP Server: https://docs.docker.com/ai/mcp-catalog-and-toolkit/hub-mcp/
- Docker MCP Gateway: https://docs.docker.com/ai/mcp-catalog-and-toolkit/mcp-gateway/
- GitHub MCP: https://github.com/github/github-mcp-server and https://docs.github.com/en/copilot/how-tos/provide-context/use-mcp/use-the-github-mcp-server
- Graphiti: https://github.com/getzep/graphiti and docs: https://help.getzep.com/graphiti/getting-started/mcp-server
- Letta memory mgmt: https://docs.letta.com/advanced/memory-management/
- CAN-SPAM guide (FTC): https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- GLBA overview (FTC): https://www.ftc.gov/business-guidance/privacy-security/gramm-leach-bliley-act
- CFPB chatbot post: https://www.consumerfinance.gov/about-us/blog/cfpb-has-entered-the-chat/
