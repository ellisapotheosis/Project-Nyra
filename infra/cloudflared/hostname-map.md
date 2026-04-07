# Project Nyra Cloudflared hostname map (`ratehunter.net`)

## Pages
- `ratehunter.net` → Cloudflare Pages landing site (not tunnelled)

## Public tunnel hostnames (no Access policy by default)
| Hostname | Primary target | Plane |
|---|---|---|
| `nyra.ratehunter.net` | `moltbot-web:3030` | orchestrator |
| `api.ratehunter.net` | `nexus-router:7000` (orchestrator) / `quote-api:7070` (oracle failover option) | orchestrator/oracle |
| `hooks.ratehunter.net` | `n8n:5678` | orchestrator |

## Access-gated hostnames
| Hostname | Target service | Plane |
|---|---|---|
| `gitea.ratehunter.net` | `host.docker.internal:3100` | orchestrator |
| `twenty.ratehunter.net` | `twenty:3000` | oracle |
| `activepieces.ratehunter.net` | `activepieces:80` | orchestrator+oracle |
| `n8n.ratehunter.net` | `n8n:5678` | orchestrator+oracle |
| `grafana.ratehunter.net` | `grafana:3000` | orchestrator |
| `archon.ratehunter.net` | `archon-os:9001` | orchestrator |
| `bot.ratehunter.net` | `moltbot-web:3030` (orchestrator) / `moltbot:18789` (oracle) | orchestrator+oracle |

## Explicitly not tunnelled
- Nexus MCP (`:8080`) and internal LiteLLM admin routes
- Infisical, Postgres, Redis, Mongo, FalkorDB, Neo4j, vector stores
- Worker inference endpoints (`worker-*-vllm`, `worker-3060-ollama`)
- Raw MCP backends and non-HTTP sockets

## DNS record model
Each hostname above is a proxied CNAME pointing at the appropriate tunnel route (for example, `<ORCHESTRATOR_TUNNEL_UUID>.cfargotunnel.com` or `<ORACLE_TUNNEL_UUID>.cfargotunnel.com`).
