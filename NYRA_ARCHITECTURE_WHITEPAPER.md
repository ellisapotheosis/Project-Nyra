# Project Nyra Architecture Whitepaper

## Executive Summary

Project Nyra is an intelligent mortgage automation platform that ingests mortgage leads, normalizes and deduplicates them, writes system‑of‑record data into Twenty CRM, runs compliant multichannel campaigns and provides a broker‑facing assistant【35†L5-L10】. The architecture separates control and compute planes: the control plane orchestrates workflows and system state, while the compute plane hosts GPU workers that serve private models【37†L4-L8】【35†L15-L23】.

## Design Principles

* **CRM is the system of record** – All core business records reside in Twenty CRM【37†L9-L14】.
* **Replaceable workflow engine** – Workflow glue (n8n/Activepieces) is replaceable; business logic lives in Nyra services【37†L9-L14】.
* **Bounded assistant** – The OpenClaw assistant surface coordinates actions but cannot mutate the CRM or database directly【47†L27-L35】.
* **Compliance first** – STOP/unsubscribe, reply pauses, quiet hours and audit logging are first‑class features【37†L9-L14】.

## Node Roles

* **Orchestrator** – Always‑on control plane with Cloudflare ingress; responsible for routing, observability, CRM boundary and memory aggregation【37†L16-L23】.
* **Oracle‑VPS** – Durable cloud node hosting services such as Twenty CRM, n8n/Activepieces, Gitea, Postgres/Redis/Qdrant/FalkorDB, Letta and Mem0【38†L8-L15】.
* **Workers** – GPU nodes: worker‑rtx5090 (primary vLLM), worker‑rtx3090ti (secondary vLLM) and worker‑rtx3060 (Ollama utility)【37†L30-L35】.

## Control Plane Services

Core services include Prometheus/Loki/Grafana for observability, Portainer for container management, the OpenClaw gateway and studio, and Cloudflared【38†L3-L7】. On Oracle‑VPS, Twenty CRM, n8n/Activepieces, Gitea, database services, Letta and Mem0 run as durable services【38†L8-L15】.

## Networking and Security

Private traffic flows through a Tailscale mesh with MagicDNS, while public ingress is provided via Cloudflare Tunnels on the orchestrator and Oracle‑VPS【38†L16-L20】. Administrative surfaces are protected with Cloudflare Access, and worker inference endpoints are never publicly exposed.

## Memory Model

Memory systems include Mem0 for assistant runtime memory, OpenMemory MCP tools for shared memory, Letta for long‑term agent memory and the Nexus Router which aggregates memory and tools for the control plane【38†L21-L27】.

## Application Surfaces

* **Project Nyra webapp (`apps/projectnyra`)** – Central broker/customer command center providing secure conversational guidance, lead progression, quote requests, compliance‑aware communications and CRM‑first persistence【47†L5-L24】.
* **RateHunter (`apps/ratehunter`)** – Marketing and lead capture portal focusing on multi‑channel lead capture, real‑time quotes and conversion optimization【40†L10-L24】.
* **OpenClaw** – Assistant interface for brokers and customers.

## Repository Layout

* `apps/*` – Frontend applications such as the webapp and landing pages【35†L29-L40】.
* `services/*` – Business services including CRM API, campaign engine, communication service and quote API【35†L29-L40】.
* `packages/*` – Shared libraries and utilities.
* `infra/*` – Infrastructure as code (compose files per node)【46†L9-L27】.

## Implementation Roadmap

Following the execution plan:

1. **CRM data layer** – Stabilize Twenty CRM, define core objects (loan, campaign enrollment, communication log, quote) and build a shared CRM client【44†L20-L24】.
2. **Lead ingestion** – Build `services/crm-api` to accept raw payloads, normalize and dedupe leads before writing to Twenty CRM【44†L26-L30】.
3. **Campaign engine** – Implement `services/campaign-engine` to manage campaign definitions, schedules, pause/resume logic and reply‑based pausing【44†L31-L34】.
4. **Compliance layer** – Enforce STOP/unsubscribe, quiet hours and suppression audit logs【44†L36-L39】.
5. **Communication service** – Provide outbound send requests, provider callbacks, inbound reply handling and timeline synchronization【44†L41-L44】.
6. **Quote engine** – Implement `services/quote-api` to generate deterministic mortgage quotes with multiple options and cost breakdowns【44†L45-L48】.
7. **App surfaces** – Develop the webapp (`apps/projectnyra`) and RateHunter landing (`apps/ratehunter`)【44†L50-L53】.