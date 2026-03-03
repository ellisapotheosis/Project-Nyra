# 11 - Public vs Private Exposure

## Recommended exposure policy

### Public via Cloudflared (internet-facing)
- `mcp.nyra.dev` -> `nexus-router:7000` (primary API ingress)
- `api.nyra.dev` -> `litellm:4000` (optional; can remain private if Nexus is sole ingress)
- `n8n.nyra.dev` -> `n8n:5678` (needed for external webhooks)
- `chat.nyra.dev` -> `moltbot-web:3030` (end-user chat surface)
- `landing.ratehunter.net` -> Cloudflare Pages project from `apps/landing/ratehunter-landing`

### Private (Tailscale / internal only)
- Datastores: postgres, redis, mongo, ruvector-postgres
- Worker inference lanes: 3060/3090/5090 vLLM/Ollama
- Observability backends: prometheus/loki
- Admin UIs: openwebui, twentycrm, grafana (unless Cloudflare Access policy is strict)

## Rationale
- Keep blast radius small: only gateway/webhook/chat surfaces public.
- Worker GPU endpoints should not be direct internet targets.
- Data plane remains internal; control plane proxied through Cloudflare Access.

## Subdomain map (recommended)
| Subdomain | Service | Exposure class |
|---|---|---|
| `landing.ratehunter.net` | landing page | public (Pages) |
| `mcp.nyra.dev` | nexus-router | public |
| `api.nyra.dev` | litellm (optional) | public or private |
| `n8n.nyra.dev` | n8n | public (auth+access) |
| `chat.nyra.dev` | moltbot-web/openclaw UI | public |
| `grafana.nyra.dev` | grafana | private-preferred |
| `crm.nyra.dev` | twentycrm | private-preferred |

## GPU routing (Agent C)
- Orchestrator route order (default):
  1. `worker-5090` for long-context / larger models
  2. `worker-3090ti` for medium throughput
  3. `worker-3060` for embeddings/small models
- Nexus should call worker endpoints over Tailscale hostnames/IPs only.

## Openclaw + Kyutai Unmute coexistence (Agent D)
- Quick default: run Openclaw (`moltbot-web`) on orchestrator; run Kyurei components as separate compose project with explicit GPU device reservations per host.
- If co-locating temporarily on one host, pin containers with CUDA visibility and memory-friendly models to avoid VRAM contention.
- Preferred split (to reduce delay/risk):
  - `worker-5090 (24GB)`: primary generation model
  - `worker-3090ti (24GB)`: secondary generation / fallback
  - `worker-3060 (6GB)`: embeddings, rerank, lightweight inference
  - `oracle/orchestrator (iGPU)`: routing, UI, orchestration only (no heavy inference)
