# Project Nyra System Overview

## Topology (Canonical)

Project Nyra is a split-topology platform with three runtime planes:

1. **Oracle VM (cloud)**
   - Persistent and core business services (PostgreSQL, TwentyCRM, workflow engines, quote APIs).
2. **Orchestrator (home control plane)**
   - Routing and control services (LiteLLM/Nexus Router and operator tooling).
3. **GPU Workers (LAN/Tailscale)**
   - Inference-only nodes:
     - RTX 3060
     - RTX 3090 Ti
     - RTX 5090

This repository preserves that split and treats worker nodes as stateless inference endpoints.

## Traffic Model

- **Public ingress**: Cloudflared tunnel endpoints intended for borrower-facing and externally reachable apps.
- **Access-protected ingress**: Cloudflare Access for operator/admin services.
- **Internal-only**: Databases, caches, vector stores, and worker runtimes on private networks/Tailscale.

## Runtime Responsibilities

### Oracle

- Core persistence and business logic services.
- CRM/workflow and quote-serving APIs.
- No dependency on worker-local state.

### Orchestrator

- Request routing and model dispatch orchestration.
- Coordination across internal services and worker inference endpoints.
- Operational dashboards and management services.

### Workers

- Model serving only (vLLM/Ollama-compatible endpoints).
- No databases or stateful business services.
- Exposed only to orchestrator/internal mesh.

## Canonical Repository Areas

- `apps/`: borrower/operator web surfaces.
- `services/`: domain services and adapters.
- `packages/`: shared UI, schemas, clients.
- `infra/`: per-host Oracle, orchestrator, worker, Cloudflared, and Tailscale deployment assets.
- `workflows/`: Activepieces (primary) and n8n (optional/internal-only).
- `archive/`: time-stamped preservation of legacy/duplicate assets.

## Consolidation Baseline (April 8, 2026)

- Canonical infra compose files exist under `infra/hosts/oracle-vps`, `infra/hosts/orchestrator`, and `infra/hosts/worker-*`.
- Canonical env and port references live under `docs/infra`.
- Legacy/alternate stack variants remain in-tree for traceability and are candidates for staged archival, not deletion.
