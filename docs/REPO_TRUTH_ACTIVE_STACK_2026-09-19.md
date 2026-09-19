# Project Nyra — Repository Truth: Active Stack

Effective 2026-09-19. This document supersedes older planning documents when they conflict with this active-stack declaration.

## Removed — do not reintroduce

- Paperclip
- GasTown
- PicoClaw
- worker-rtx3060
- Grafbase Nexus / Nexus Router

Legacy references may remain in historical/archive documents until cleanup. A reference in an old document is not evidence that the component is active.

## Active agent/runtime stack

### Primary development host: worker-rtx5090

- ClawTeam
- Mission Control
- OpenClaw Gateway
- OpenClaw
- Nerve UI
- LiteLLM Model Router
- LiteLLM Skill Proxy
- local vLLM model serving
- supporting development agent services

The host has 64 GB RAM and 24 GB VRAM and is therefore the preferred heavy local development/control host.

### Secondary GPU host: worker-rtx3090ti

- local model inference
- selected OpenClaw workloads
- overflow/fallback compute
- selected voice/model workloads

Do not duplicate the entire heavy ClawTeam control surface there unless required by a tested availability design.

### Orchestrator

The orchestrator has been reduced to 16 GB RAM and should remain lightweight. Use it for administration, terminals/session tooling, Git, health/status, and lightweight control clients rather than the heavy ClawTeam/OpenClaw/Nerve stack.

### Oracle VPS

Oracle remains the durable/stateful host for Project Nyra backend infrastructure, including local Supabase backend/auth, Twenty CRM, durable Letta state, service APIs, workflows, ingress, and observability.

## Control hierarchy

ClawTeam + Mission Control is the top-level active local agent control zone.

OpenClaw Gateway and OpenClaw sit below ClawTeam as execution infrastructure.

LiteLLM Model Router and LiteLLM Skill Proxy are explicit routing/service boundaries.

Letta remains the durable state/memory boundary on Oracle. ClawTeam is therefore the top-level command/supervision zone, while Letta remains the durable state authority.

## Resource rule

ClawTeam worker count must be budgeted against the 64 GB RAM host. If a worker consumes approximately 4 GB, concurrency must account for OpenClaw, Nerve, vLLM, LiteLLM, Mission Control, Docker overhead, and the host operating system before enabling additional workers.

The 16 GB orchestrator must not be used as an equivalent ClawTeam host.

## LiteLLM naming rule

Do not use the generic phrase "LiteLLM" when a document is describing a specific responsibility. Prefer:

- LiteLLM Model Router
- LiteLLM Skill Proxy
- MCP Router / MCP aggregation boundary

Grafbase Nexus / Nexus Router is retired and is not the MCP implementation target.

## Cloudflare boundary

Public app deployment is separate from Oracle backend infrastructure. Cloudflare-hosted frontends may call authenticated Oracle-hosted Supabase/service APIs. Do not move durable backend state to Cloudflare merely because a frontend is edge deployed.

## Required cleanup

Searches on the repository still find historical active-sounding references to Paperclip, GasTown, Nexus, RTX3060, and the old RateHunter path `apps/ratehunter/landing`. These need a deliberate cleanup pass across Makefiles, Compose files, deployment workflows, Cloudflare documentation, security inventories, and guidance documents.

Until that cleanup is complete, this document is the authoritative current-stack declaration.
