# Architecture Decision — ClawTeam Top Control
Date: 2026-09-19

## Removed from the active stack
Paperclip, GasTown, PicoClaw, worker-rtx3060, and Grafbase Nexus / Nexus Router are removed.
Do not reintroduce them through Compose files, Make targets, health checks, agent registries, failover logic, or deployment documentation.

## Control hierarchy
ClawTeam + Mission Control is the highest-level active agent operator/control zone for the local fleet.

ClawTeam / Mission Control
  -> worker agents
  -> OpenClaw Gateway
       -> OpenClaw agents
       -> MCP tools and service calls
  -> LiteLLM Skill Proxy
       -> skill/tool execution routing
  -> LiteLLM Model Router
       -> local vLLM models and external providers
  -> Nerve UI / conversational surfaces
  -> development coding agents

## Durable state
ClawTeam is the top-level command and supervision layer, but it is not the only durable state authority.
Letta remains the durable agent-state, memory, and long-lived context service on Oracle VPS.
Therefore: ClawTeam = command/supervision; Letta = durable state; OpenClaw = execution; LiteLLM = model/skill routing; Oracle = durable infrastructure.

## RTX 5090 placement
The RTX 5090 is the primary development and local-agent host because it has 64 GB system RAM and 24 GB VRAM.
Run ClawTeam, Mission Control, OpenClaw Gateway, OpenClaw, Nerve UI, local vLLM, LiteLLM Model Router, LiteLLM Skill Proxy, and supporting agent services there as capacity permits.

## RTX 3090 Ti
The RTX 3090 Ti remains the secondary GPU worker for local inference, overflow/fallback compute, OpenClaw workloads, and voice/model workloads where useful.
Do not duplicate the entire heavyweight ClawTeam control stack there unless operational testing demonstrates a need.

## RAM policy
ClawTeam workers can consume substantial RAM. If a worker can consume roughly 4 GB, worker concurrency must be explicitly budgeted on the 64 GB 5090.
The 16 GB orchestrator must not be treated as capable of hosting the same stack.
Keep the orchestrator lightweight: remote administration, terminal/session management, status/health, Git operations, and lightweight control clients.

## Three explicit LiteLLM responsibilities
1. LiteLLM Model Router: model aliases, local vLLM routing, external providers, fallbacks, and model policy.
2. LiteLLM Skill Proxy: controlled API boundary for skill/tool execution.
3. MCP Router: tool discovery and MCP policy boundary. Grafbase/Nexus is removed and must not return as a runtime dependency.
These responsibilities may share infrastructure when appropriate, but their contracts must remain explicit.

## Webapp relationship
The Project Nyra webapp can be edge-hosted while backend/authentication remains on Oracle VPS.
Cloudflare -> Project Nyra Webapp -> Supabase API/Auth, Twenty CRM, Project Nyra service APIs, and Letta on Oracle.
GPU services remain private and should be reached through authenticated service boundaries.

## Failure model
The architecture should tolerate an individual GPU worker, orchestrator, ClawTeam worker, OpenClaw agent, or Nerve UI instance going offline.
Loss of Oracle durable state is not an ordinary worker failure.

## Implementation order
1. Remove active references to Paperclip, GasTown, PicoClaw, RTX3060, and Grafbase/Nexus.
2. Make ClawTeam/Mission Control the documented top-level local agent control zone.
3. Keep OpenClaw Gateway and OpenClaw below ClawTeam.
4. Keep LiteLLM Model Router and LiteLLM Skill Proxy responsibilities explicit.
5. Keep Letta durable on Oracle.
6. Put heavy local control services on RTX5090.
7. Keep the orchestrator lightweight.
8. Add worker-memory/concurrency budgets.
9. Make host startup use Infisical runtime injection.
10. Verify each active Cloudflare app deployment independently.