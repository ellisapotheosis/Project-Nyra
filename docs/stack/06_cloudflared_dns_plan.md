# 06 - Cloudflared Tunnels + DNS Plan

## Tunnel topology
- Orchestrator tunnel container exists in `infra/docker-compose.yml` (`cloudflared` service).
- Dedicated cloudflared compose also exists at `infra/compose/docker-compose.cloudflared.yml` using config file ingress rules.
- Worker cloudflared configs exist at:
  - `infra/workers/worker-5090/cloudflared-config.yml`
  - `infra/workers/worker-3090/cloudflared-config.yml`
  - `infra/workers/worker-3060/cloudflared-config.yml`

## Recommended DNS/subdomain map
| Hostname | Target (internal) | Exposure |
|---|---|---|
| `api.nyra.dev` | `litellm:4000` | public via cloudflared |
| `mcp.nyra.dev` | `nexus-router:7000` | public via cloudflared |
| `n8n.nyra.dev` | `n8n:5678` | public via cloudflared + auth |
| `grafana.nyra.dev` | `grafana:3000` | private-preferred; public only with Zero Trust |
| `chat.nyra.dev` | `moltbot-web:3030` | public |
| `openwebui.nyra.dev` | `openwebui:8080` | private-preferred |
| `worker5090.nyra.dev` | `worker-5090-vllm:8000` | private/tailscale only |
| `worker3090.nyra.dev` | `worker-3090-vllm:8000` | private/tailscale only |
| `worker3060.nyra.dev` | `worker-3060-ollama:11434` | private/tailscale only |

## Implementation defaults
- Keep a single public orchestrator tunnel token (`CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`).
- Keep worker inference endpoints off public DNS; route through Tailscale from orchestrator.
- Use Cloudflare Access policies for n8n/grafana/admin routes.
