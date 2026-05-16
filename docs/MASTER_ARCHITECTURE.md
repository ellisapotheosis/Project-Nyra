# MASTER_ARCHITECTURE.md

Authoritative architecture reference for Project Nyra.

## 1. System Overview

Project Nyra is an AI-powered mortgage lead automation platform with a strict separation between:

- **Control Plane**: Orchestrator-hosted routing, workflows, memory policy, observability, and admin surfaces.
- **Compute Plane**: GPU workers serving private local models.

## 2. Core Design Principles

- **CRM is the System of Record**: Twenty CRM owns core business records.
- **n8n is Replaceable**: Use n8n for execution glue, not for the business brain.
- **Assistant is Bounded**: OpenClaw is the assistant surface. All critical mutations happen through Nyra services.
- **Compliance First**: STOP, reply pauses, unsubscribe, quiet hours, and audit logging are platform features.

## 3. Node Roles

### Orchestrator

- Always-on control plane (MinisForum).
- Public ingress via Cloudflared.
- Routing, observability, CRM integration boundary, memory aggregation.

### Oracle-VPS

- Durable cloud services (ARM64 Ubuntu).
- Twenty CRM, Gitea, Activepieces, n8n, Gitea.
- Database services (Postgres, Redis, Qdrant, FalkorDB).

### Workers (GPU)

- **worker-rtx5090**: Primary vLLM node.
- **worker-rtx3090ti**: Secondary vLLM node.
- **worker-rtx3060**: Ollama utility node (summarization, extraction, small models).

## 4. Control Plane Services

These live on the **Orchestrator**:

- Nexus Router
- LiteLLM
- Langfuse
- Prometheus / Loki / Grafana
- Portainer Server
- OpenClaw Gateway + Studio
- Cloudflared

These live on the **Oracle-VPS**:

- Twenty CRM
- n8n / Activepieces
- Gitea
- Postgres / Redis / Qdrant / FalkorDB
- Letta / Mem0

## 5. Networking Model

- **Private**: Tailscale mesh with MagicDNS hostnames.
- **Public**: Cloudflare Tunnel from Orchestrator and Oracle-VPS. Admin surfaces behind Cloudflare Access.

## 6. Memory Model

- **Mem0**: Primary assistant/runtime memory.
- **OpenMemory MCP**: Shared MCP memory tools.
- **Letta**: Long-term agent memory integration.
- **Nexus Router**: Singular aggregation endpoint for memory and tools.

## 7. App Surfaces

- **apps/projectnyra**: Canonical broker/customer web application (Control Surface).
- **apps/ratehunter**: Marketing and lead capture.
- **OpenClaw**: Broker/customer assistant surface.

## 8. Repo Placement Guidance

- `apps/*` → Frontends
- `services/*` → Business services
- `packages/*` → Shared libs
- `workflows/n8n/*` → Workflow JSON
- `infra/hosts/<host-name>/*` → Infra per host; the only valid Docker Compose source location.
- `ops/*` → Scripts, tmux, profiles.
- `docs/*` → Architecture and execution plans.

## 9. Non-goals

- No Docker Swarm or Kubernetes for now.
- No public worker inference endpoints.
- No assistant-direct database mutations.
