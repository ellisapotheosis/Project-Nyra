# CLAUDE.MD — The Akashic Records of Project Nyra

> **WARNING:** Temple of High‑Frequency Finance.  
> **IDENTITY:** Neko‑Cyber‑Architect (PG‑13). Sacred geometry brain, space nerd heart, CFO instincts.  
> **MISSION:** Build Project Nyra end‑to‑end: lead ingestion → TwentyCRM → campaigns → quotes → memory → admin UI → production.

---

## TL;DR
- **Nyra = AI mortgage origination OS** (lead → drip → quote → conversion).
- **One Oracle VM (Always Free A1 Flex)** runs always‑on state/apps; **orchestrator** runs gateway/dev; **GPU workers** run inference.
- **System of record:** TwentyCRM.
- **Workflows:** n8n + Activepieces.
- **Assistant runtime:** OpenClaw/Moltbot (containerized), with Mem0 plugin for persistent memory.
- **Memory:** Graphiti (graph) + RuVector (vector) + Postgres; Letta optional dev-time “subconscious coworker.”
- **Security:** STOP compliance absolute; Cloudflare Access for auth; no public DB ports.

---

## 1) Architecture

### Zone A — Oracle Cloud (Always‑On)
Oracle Always Free A1 Flex includes 3,000 OCPU‑hrs/month and 18,000 GB‑hrs/month (≈ 4 OCPU + 24 GB if run 24/7). Also 200 GB total boot+block volume in home region. (Oracle Always Free docs.)

Services (Oracle):
- Postgres (dbs: twenty, nyra_ai, n8n, activepieces)
- Redis (+ optional FalkorDB module)
- Graphiti + graph backend (FalkorDB or Neo4j)
- RuVector (vector memory service)
- TwentyCRM
- n8n + Activepieces
- Quote API
- Webapp/Admin UI
- Moltbot/OpenClaw gateway (18789/18790)

### Zone B — Orchestrator (Control plane + Dev)
- Nexus Router (MCP aggregator) + mcproxy
- LiteLLM/OpenRouter routing
- Infisical/Vaultwarden
- Archon OS UI (admin shell)
- Claude-flow dashboard/dev tools
- Optional Gitea (move to Oracle if RAM tight)

### Zone C — GPU workers (Compute)
- vLLM (TCP 8000, OpenAI-compatible)
- Ollama (TCP 11434)
- batch jobs + runners

---

## 2) Golden rules
- Idempotency: upsert leads, don’t duplicate.
- STOP compliance: STOP => end campaign + DNC.
- Rate advice requires human approval.
- Datastores are private (Tailscale/Cloudflared Access only).
- Prefer Cloudflared tunnels with Access auth for public endpoints.

---

## 3) Core workflows
- WF_LEAD_INGEST: email/API/LeadMailbox -> normalize -> dedupe -> upsert Twenty -> embed RuVector -> assign campaign -> request quote draft
- WF_CAMPAIGN_EXECUTE: cron/scheduler sends call/SMS/VM/email steps for 45–60 days until engaged
- WF_RESPONSE_DETECT: inbound reply ends campaign
- WF_OPTOUT_PROCESS: STOP => DNC + terminate

---

## 4) OpenClaw/Moltbot
- Docker image: moltbot/moltbot:latest
- Gateway ports: 18789 (HTTP/WebSocket) and 18790 (control plane)
- Persistent volumes: /home/node/.clawdbot and /home/node/clawd

Mem0 plugin:
- install: `openclaw plugins install @mem0/openclaw-mem0`
- configure with MEM0_API_KEY (cloud) or OSS mode (self-host)

Security: do NOT expose the Moltbot dashboard publicly without Cloudflare Access.

---

## 5) Runbooks (minimum)
Oracle:
- docker compose up with graph backend profile
- cloudflared tunnels for app/admin/crm/n8n/bot
Orchestrator:
- nexus + litellm + archon + dev tools
Workers:
- expose vLLM/Ollama over Tailscale only
