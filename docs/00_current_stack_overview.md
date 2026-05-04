# 00 Current Stack Overview

Updated: 2026-04-30

## Source of truth

Active runtime ownership is now under `infra/hosts/<host-name>/`.

| Host | Canonical compose | Role |
|---|---|---|
| `orchestrator` | `infra/hosts/orchestrator/docker-compose.yml` | Local control plane, LiteLLM, Nexus, Portainer, optional OpenClaw gateway |
| `oracle-vps` | `infra/hosts/oracle-vps/docker-compose.yml` | Always-on app, data, observability, memory, Gitea, CI/CD, and edge tunnel host |
| `worker-rtx3060` | `infra/hosts/worker-rtx3060/docker-compose.yml` | Ollama/lightweight inference and worker metrics |
| `worker-rtx3090ti` | `infra/hosts/worker-rtx3090ti/docker-compose.yml` | Secondary vLLM worker and local LiteLLM |
| `worker-rtx5090` | `infra/hosts/worker-rtx5090/docker-compose.yml` | Primary vLLM worker and local LiteLLM |

## Control plane

The orchestrator starts from `make up` and defaults to `infra/hosts/orchestrator/docker-compose.yml`.

Core services:

| Service | Port(s) | Notes |
|---|---:|---|
| `redis` | `6379` | Local cache for control-plane services |
| `litellm` | `4000` | Local model gateway |
| `openclaw-gateway` | `8001` | Profile-gated app service |
| `cloudflared` | none | Optional tunnel runner; public DNS plan is consolidated in `docs/cloudflared/` |
| `portainer` | `9000`, `9443` | Local Portainer server |
| `portainer-edge-agent-local` | none | Local edge agent |
| `portainer-edge-agent` | none | Edge agent profile |

Optional orchestrator add-ons:

| Compose | Service | Port(s) |
|---|---|---:|
| `docker-compose.bitnet.yml` | `bitnet` | `8087 -> 8080` |
| `docker-compose.nexus-one-hop.yml` | `nexus_onehop` | `6000`, `6011` |
| `docker-compose.voice.yml` | `pocket-tts` | `8080` |
| `docker-compose.cloudflared.yml` | `cloudflared` | none |

## Always-on Oracle host

Oracle VPS is the always-on host for business apps, Gitea CI/CD, persistent services, observability, and edge tunnel execution.

Primary services in `infra/hosts/oracle-vps/docker-compose.yml`:

| Service | Port(s) | Notes |
|---|---:|---|
| `twenty` | `3000` | CRM app; canonical public hostname `crm.ratehunter.net` |
| `twenty-mcp` | `8400` | CRM MCP/API bridge |
| `activepieces` | `8080 -> 80` | Internal automation UI/runtime |
| `n8n` | `5678` | Internal workflow automation |
| `quote-api` | `7070` | Quote service API |
| `grafana` | `3003 -> 3000` | Observability UI |
| `prometheus` | `9090` | Metrics |
| `loki` | `3100` | Logs |
| `cadvisor` | `8081 -> 8080` | Container metrics |
| `openwebui` | `8088 -> 8080` | Internal model workbench |
| `mem0-rest` | `5000` | Runtime memory REST API |
| `letta` | `8283` | Memory manager UI/API |
| `mem-os` | `8085` | MemoryTensor/memOS service |
| `openmemory-mcp` | `8765` | OpenMemory MCP HTTP/SSE bridge |
| `falkordb` | `6381 -> 6379` | Graph memory store |
| `qdrant` | internal | Vector store |
| `infisical-mcp` | `8766` | Secrets MCP bridge |
| `mempalace-mcp` | `8002 -> 8000` | Memory bridge |
| `paperclip` | `3111 -> 3100` | Document/OCR UI |
| `paperclip-mcp` | `8767` | Paperclip MCP |
| `nexus` | `6000 -> 3000` | Oracle Nexus instance |
| `gitea` | `3001 -> 3000`, `2222` | Git hosting and Actions UI/SSH |
| `gitea-runner` | none | Gitea Actions runner |
| `github-mirror-sync` | none | GitHub mirror sync loop |
| `gitea-mcp` | `3101` | Gitea MCP bridge |
| `crm-api` | `4001` | Twenty integration boundary |
| `campaign_engine` | `8020` | Profile-gated app service |
| `webapp` | `3001` | App overlay; canonical public hostname `nyra.ratehunter.net` |
| `clawteam` | `8090 -> 8080` | Optional HKUDS/ClawTeam assistant surface |
| `syncthing` | profile-gated | Optional sync service |

## Worker plane

| Host | Primary services | Port(s) |
|---|---|---:|
| `worker-rtx3060` | `ollama`, `litellm`, exporters | `11434`, `4000`, `9100`, `9835` |
| `worker-rtx3090ti` | `vllm`, `litellm`, `redis`, exporters | `8000`, `4000`, `6379`, `9100`, `9835` |
| `worker-rtx5090` | `vllm`, `litellm`, `redis`, exporters | `8000`, `4000`, `6379`, `9100`, `9835` |

Optional worker overlays:

| Overlay | Hosts | Port(s) |
|---|---|---:|
| `docker-compose.voice.yml` | all workers | `8098 -> 8080` |
| `docker-compose.distributed-voice.yml` | 3060/3090Ti/5090 | `8081 -> 8080` |
| `docker-compose.hermes.yml` | 3090Ti/5090 | `8642`, `9119` bound to localhost |
| `docker-compose.nerve.yml` | 3090Ti/5090 | `8001`, `18789` |

## Makefile entrypoints

| Target | Purpose |
|---|---|
| `make verify-paths` | Validate all Makefile compose paths exist |
| `make up` / `make down` | Local orchestrator stack |
| `make up-workers` | Start all GPU workers via Docker contexts |
| `make up-oracle` | Start Oracle stack plus app profile |
| `make cicd-up` / `make cicd-health` | Manage Oracle Gitea CI/CD stack |
| `make bitnet-deploy` | Sync, start, health-check, and smoke-test BitNet on orchestrator |
| `make cf-orch-up` | Start standalone orchestrator tunnel runner |

## Policy notes

- Public ingress should stay Cloudflared-only.
- Use `docs/cloudflared/` as the current hostname, Cloudflare Access, and tunnel-config package for `ratehunter.net`.
- Datastores remain private and must not receive public DNS hostnames.
- Worker inference ports are for private mesh/Tailscale access, not public exposure.
- Some compose files still contain components that conflict with the current architecture rules; treat those as cleanup targets before production promotion.
