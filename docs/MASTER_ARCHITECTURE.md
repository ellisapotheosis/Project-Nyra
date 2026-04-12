# MASTER_ARCHITECTURE.md

Authoritative architecture reference for Project Nyra.

This document exists to give future agents and humans one top-to-bottom picture of the current target system.

## 1. System overview

Project Nyra is an AI-powered mortgage lead automation platform with a strict separation between:

- **control plane** → orchestrator-hosted routing, workflows, memory policy, observability, admin surfaces
- **compute plane** → GPU workers serving private local models

Nyra’s product objective is to automate lead intake, follow-up, quote generation, and broker assistance without making the workflow engine or the assistant the system of record.

## 2. Core design principles

### 2.1 CRM is the system of record
Twenty CRM owns core business records.

### 2.2 n8n is replaceable
Use n8n for execution glue, not for the business brain.

### 2.3 Assistant is bounded
OpenClaw is the assistant surface. All critical mutations happen through Nyra services.

### 2.4 Compliance first
STOP, reply pauses, unsubscribe, quiet hours, and audit logging are platform features.

## 3. Node roles

### orchestrator
- always-on control plane
- public ingress via Cloudflared
- internal services and dashboards
- routing, observability, CRM, memory substrate

### worker-rtx5090
- primary vLLM node
- mobile admin battlestation if needed

### worker-rtx3090ti
- secondary vLLM node
- heavy offline/reasoning jobs

### worker-rtx3060
- Ollama utility node
- summarization, extraction, small models, ingestion helpers

## 4. Control plane services

These should live on the orchestrator:

- Nexus Router
- LiteLLM
- Langfuse
- Prometheus
- Loki
- Grafana
- Portainer Server
- n8n
- Twenty CRM
- Archon OS
- OpenClaw Gateway
- OpenClaw Studio
- Open WebUI
- Mem0
- FalkorDB
- Postgres
- Redis
- Cloudflared

## 5. Networking model

### Private
- Tailscale mesh
- MagicDNS hostnames preferred
- worker services remain private

### Public
- Cloudflare Tunnel only from orchestrator
- admin surfaces behind Cloudflare Access

## 6. Memory model

Use:
- Archon OS as workflow/context/project memory manager
- Mem0 for selected assistant/runtime memory
- FalkorDB as graph backend where graph memory is needed

Do not reintroduce:
- RuVector
- Graphiti
- Letta / letta
- openmemory / openmemory MCP

## 7. Model serving and routing

### Local model serving
- vLLM on 5090 and 3090 Ti
- Ollama on 3060

### Cloud model use
- Claude Code remains the primary coding engine
- Codex CLI can consume ChatGPT / Codex subscription usage in parallel
- Gemini CLI can consume Google subscription / free quota in parallel

### Routing approach
- one frontend session should route one request to one backend at a time
- parallel subagents are preferred over trying to make one conversation span all GPUs directly

## 8. App surfaces

### apps/admin
Internal operator/admin UI.

### apps/webapp
Broker/customer web application.

### apps/landing
Marketing and lead capture.

### OpenClaw
Broker/customer assistant surface.

### OpenClaw Studio
Assistant dashboard.

### Open WebUI
Internal-only LLM workbench.

## 9. Repo placement guidance

- `apps/*` → frontends
- `services/*` → business services
- `packages/*` → shared libs
- `workflows/n8n/*` → workflow JSON
- `deploy/*` → infra per node
- `ops/*` → scripts, tmux, profiles
- `docs/*` → architecture and execution plans

## 10. Non-goals

- no Docker Swarm for now
- no Kubernetes for now
- no public worker inference
- no assistant-direct database mutations
- no resurrecting deprecated memory stack pieces
