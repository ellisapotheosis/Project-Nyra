# 11 - Public vs Private Exposure

Updated: 2026-04-30

## Recommended exposure policy

### Public via Cloudflared (internet-facing)

- `ratehunter.net` and `www.ratehunter.net` -> Cloudflare Pages marketing site.
- `app.projectnyra.com` -> WebApp.
- `crm.projectnyra.com` -> Twenty CRM.
- `n8n.projectnyra.com` -> n8n.
- `activepieces.projectnyra.com` -> Activepieces.
- `nexus.projectnyra.com` -> Nexus UI.
- `nexus-router.projectnyra.com` -> Nexus Router API/MCP endpoint.
- Additional Access-gated routes are listed in `docs/cloudflared/hostname-matrix.md`.

### Private (Tailscale / internal only)

- Datastores: postgres, redis, mongo, the approved vector memory backend-postgres
- Worker inference lanes: 3060/3090/5090 vLLM/Ollama
- Datastore and vector backends: FalkorDB, Qdrant, Postgres, Redis
- Raw voice/media transport ports
- Admin UIs and MCP bridges unless Cloudflare Access policy is strict

## Rationale

- Keep blast radius small: only gateway/webhook/chat surfaces public.
- Worker GPU endpoints should not be direct internet targets.
- Data plane remains internal; control plane proxied through Cloudflare Access.

## Subdomain map (recommended)

| Subdomain                      | Service                       | Exposure class       |
| ------------------------------ | ----------------------------- | -------------------- |
| `ratehunter.net`               | landing page                  | public Pages         |
| `app.projectnyra.com`          | webapp                        | Access-gated         |
| `crm.projectnyra.com`          | Twenty CRM                    | Access-gated         |
| `n8n.projectnyra.com`          | n8n                           | Access-gated         |
| `activepieces.projectnyra.com` | Activepieces                  | Access-gated         |
| `nexus.projectnyra.com`        | Nexus UI                      | Access-gated         |
| `nexus-router.projectnyra.com` | Nexus Router API/MCP endpoint | Access service token |
| `grafana.projectnyra.com`      | Grafana                       | Access-gated         |

## GPU routing (Agent C)

- Orchestrator route order (default):
  1. `worker-5090` for long-context / larger models
  2. `worker-3090ti` for medium throughput
  3. `worker-3060` for embeddings/small models
- Nexus should call worker endpoints over Tailscale hostnames/IPs only.

## Openclaw + Kyutai Unmute coexistence (Agent D)

- Quick default: run Openclaw (`moltbot-web`) on orchestrator; run Kyutai components as separate compose project with explicit GPU device reservations per host.
- If co-locating temporarily on one host, pin containers with CUDA visibility and memory-friendly models to avoid VRAM contention.
- Preferred split (to reduce delay/risk):
  - `worker-5090 (24GB)`: primary generation model
  - `worker-3090ti (24GB)`: secondary generation / fallback
  - `worker-3060 (6GB)`: embeddings, rerank, lightweight inference
  - `oracle/orchestrator (iGPU)`: routing, UI, orchestration only (no heavy inference)
