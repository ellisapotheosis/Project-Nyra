# Project Nyra Architecture Whitepaper

## Executive Summary

Project Nyra is an intelligent mortgage automation platform that ingests mortgage leads, normalizes and deduplicates them, writes system‑of‑record data into Twenty CRM, runs compliant multichannel campaigns and provides a broker‑facing assistant. The architecture separates control and compute planes: the control plane orchestrates workflows and system state, while the compute plane hosts GPU workers that serve private models.

## Design Principles

- **CRM is the system of record** – All core business records reside in Twenty CRM.
- **Replaceable workflow engine** – Workflow glue (n8n/Activepieces) is replaceable; business logic lives in Nyra services.
- **Bounded assistant** – The OpenClaw assistant surface coordinates actions but cannot mutate the CRM or database directly.
- **Compliance first** – STOP/unsubscribe, reply pauses, quiet hours and audit logging are first‑class features.

## Node Roles

- **Orchestrator** – Always‑on control plane with Cloudflare ingress; responsible for routing, observability, CRM boundary and memory aggregation.
- **Oracle‑VPS** – Durable cloud node hosting services such as Twenty CRM, Activepieces, Gitea, Postgres/Redis/Qdrant/FalkorDB, Letta and Mem0.
- **Workers** – GPU nodes: worker‑rtx5090 (primary vLLM), worker‑rtx3090ti (secondary vLLM) and worker‑rtx3060 (Ollama utility).

## Control Plane Services

Core services on the orchestrator include Prometheus/Loki/Grafana for observability, Portainer for container management, n8n, the OpenClaw gateway and studio, and Cloudflared. On Oracle‑VPS, Twenty CRM, Activepieces, Gitea, database services, Letta and Mem0 run as durable services.

## Networking and Security

Private traffic flows through a Tailscale mesh with MagicDNS, while public ingress is provided via Cloudflare Tunnels on the orchestrator only. Administrative surfaces are protected with Cloudflare Access, and worker inference endpoints are never publicly exposed.

## Memory Model

Memory systems include Mem0 for assistant runtime memory, OpenMemory MCP tools for shared memory, Letta for long‑term agent memory and the Nexus Router which aggregates memory and tools for the control plane.

## Application Surfaces

- **Project Nyra webapp (`apps/projectnyra`)** – Central broker/customer command center providing secure conversational guidance, lead progression, quote requests, compliance‑aware communications and CRM‑first persistence.
- **RateHunter (`apps/ratehunter`)** – Marketing and lead capture portal focusing on multi‑channel lead capture, real‑time quotes and conversion optimization.
- **OpenClaw** – Assistant interface for brokers and customers.

## Repository Layout

- `apps/*` – Frontend applications such as the webapp and landing pages.
- `services/*` – Business services including CRM API, campaign engine, communication service and quote API.
- `packages/*` – Shared libraries and utilities.
- `workflows/n8n/*` – Workflow definitions.
- `infra/hosts/<host>/*` – Per-host Docker Compose and deployment files (the only valid compose location).
- `ops/*` – Scripts and operational helpers.
- `docs/*` – Architecture, execution plans and manual steps.

## Implementation Roadmap

Following the execution plan:

1. **CRM data layer** – Stabilize Twenty CRM, define core objects (loan, campaign enrollment, communication log, quote) and build a shared CRM client.
2. **Lead ingestion** – Build `services/lead-ingestion` to accept raw payloads, normalize and dedupe leads before writing to Twenty CRM.
3. **Campaign engine** – Implement `services/campaign-service` to manage campaign definitions, schedules, pause/resume logic and reply‑based pausing.
4. **Compliance layer** – Enforce STOP/unsubscribe, quiet hours and suppression audit logs.
5. **Communication service** – Provide outbound send requests, provider callbacks, inbound reply handling and timeline synchronization.
6. **Quote engine** – Implement `services/quote-service` to generate deterministic mortgage quotes with multiple options and cost breakdowns.
7. **App surfaces** – Develop the webapp (`apps/projectnyra`) and RateHunter landing (`apps/ratehunter`).

## Non‑Goals

- No container orchestration platforms (Kubernetes, Swarm) for now.
- No public exposure of worker inference endpoints.
- No direct database or CRM mutations by the assistant; all changes route through services.
