# 09 LiteLLM and Nexus Router

Updated: 2026-04-27

## Active services

| Host | Service | Compose | Port(s) |
|---|---|---|---:|
| `orchestrator` | `litellm` | `infra/hosts/orchestrator/docker-compose.yml` | `4000` |
| `orchestrator` | `nexus_onehop` | `infra/hosts/orchestrator/docker-compose.nexus-one-hop.yml` | `6000`, `6011` |
| `oracle-vps` | `nexus` | `infra/hosts/oracle-vps/docker-compose.yml` | `6000 -> 3000` |
| `worker-rtx3060` | `litellm` | `infra/hosts/worker-rtx3060/docker-compose.yml` | `4000` |
| `worker-rtx3090ti` | `litellm` | `infra/hosts/worker-rtx3090ti/docker-compose.yml` | `4000` |
| `worker-rtx5090` | `litellm` | `infra/hosts/worker-rtx5090/docker-compose.yml` | `4000` |

## Current topology

- Orchestrator LiteLLM is the local control-plane model gateway.
- Worker LiteLLM services sit beside local Ollama/vLLM backends and should be reached over private mesh/Tailscale.
- Oracle Nexus is present as an always-on MCP/LLM entrypoint on host port `6000`.
- Optional orchestrator `nexus_onehop` is a separate one-hop gateway and should be started only when needed because it also binds `6000`.

## Health targets

| Service | Probe |
|---|---|
| Orchestrator LiteLLM | `http://127.0.0.1:4000/health` |
| Oracle Nexus | `http://oracle:6000/health` or host-local equivalent |
| Worker LiteLLM | `http://<worker>:4000/health` |
| vLLM workers | `http://<worker>:8000/v1/models` |

## Exposure policy

- LiteLLM and Nexus endpoints are not public by default.
- If exposed, place them behind Cloudflared and Cloudflare Access.
- Worker inference endpoints remain private/Tailscale-only.
- Do not tunnel Redis, model cache stores, or direct vLLM/Ollama ports to the public internet.

## Related files

```text
infra/hosts/orchestrator/docker-compose.yml
infra/hosts/orchestrator/docker-compose.nexus-one-hop.yml
infra/hosts/oracle-vps/docker-compose.yml
infra/hosts/oracle-vps/nexus.toml
infra/hosts/worker-rtx3060/docker-compose.yml
infra/hosts/worker-rtx3090ti/docker-compose.yml
infra/hosts/worker-rtx5090/docker-compose.yml
```

## Command snippets

```bash
docker compose -f infra/hosts/orchestrator/docker-compose.yml ps litellm
docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.yml ps nexus
docker --context worker-rtx5090 compose -f infra/hosts/worker-rtx5090/docker-compose.yml ps vllm litellm
```
