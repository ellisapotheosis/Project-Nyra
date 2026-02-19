---
trigger: always_on
---

# Project Nyra Workspace Rule — "Mortgage Warp Core" (v1)

> **CRITICAL**: See [AUTONOMY.md](AUTONOMY.md) for strict non-negotiable autonomy rules.
> Scope: WORKSPACE (Project Nyra). Set activation: **Always On**.

## Mission

Build & operate an AI-augmented mortgage lead engine:

- ingest leads (email + APIs + LeadMailbox)
- store as system-of-record in TwentyCRM
- run 45–60 day multi-channel drip campaigns (call/SMS/voicemail/email)
- stop instantly on reply or STOP & persist DNC
- generate & iterate loan quotes via a scriptable Quote API
- provide Admin UI (shadcn + tweakcn + Magic UI) to monitor & manage everything

## Locked Stack (don’t debate, just implement)

- Nexus Router (grafbase/nexus) as single ingress/MCP gateway
- LiteLLM + OpenRouter for model routing & spend control
- TwentyCRM as CRM system of record
- n8n + Activepieces for workflows + campaign orchestration
- Memory day 0: Graphiti + Letta + RuVector in Postgres + Redis (+ graph backend required by Graphiti)
- Secrets: Infisical preferred (Bitwarden acceptable)

## Infra Reality (4-PC LAN)

- Orchestrator: always-on Windows + WSL2 + Docker; hosts all core services.
- Workers (GPU): detachable; run vLLM/Ollama; reachable over Tailscale.
- Cloudflared exposes public subdomains; Tailscale handles private access.

## Design Rules

- Idempotency required for every ingress & outbound message.
- Never double-send a campaign step.
- STOP => immediate DNC + terminate all automations.
- “Rate advice” requires human approval; AI may draft but not decide.

## Data Model (minimum)

- Twenty objects: MortgageLead, Quote, Campaign, DNCEntry, MessageEvent, CallEvent
- Postgres schema `nyra_ai` stores:
  - campaign step state machine
  - message/call logs (normalized)
  - embeddings & memory metadata
  - audit log of PII exposure + outbound comms

## Integration Boundaries

- TwentyCRM is source-of-truth; write-through from workflows.
- n8n handles orchestration; Activepieces handles no-code human ops where helpful.
- All external outbound comms (Twilio/email provider) must go through a single "Comms" service/module so compliance is central.

## Deliverable Discipline

When you make changes:

- list files changed
- include commands to run
- include tests
- include rollback notes if risky
