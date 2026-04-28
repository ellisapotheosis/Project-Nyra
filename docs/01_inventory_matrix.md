# 01 Inventory Matrix

Updated: 2026-04-27

## Canonical deployment domains

| Domain | Canonical path(s) | Primary command path | Notes |
|---|---|---|---|
| Orchestrator control plane | `infra/hosts/orchestrator/docker-compose.yml` | `make up`, `make down`, `make ps` | Local Redis, LiteLLM, Portainer, Cloudflared runner, optional app gateway |
| Orchestrator BitNet | `infra/hosts/orchestrator/docker-compose.bitnet.yml` | `make bitnet-deploy`, `make bitnet-health`, `make bitnet-smoke` | CPU fallback model service on host port `8087` |
| Orchestrator tunnel | `infra/hosts/orchestrator/docker-compose.cloudflared.yml` | `make cf-orch-up`, `make cf-orch-down` | Standalone tunnel runner so edge can restart independently |
| Oracle always-on stack | `infra/hosts/oracle-vps/docker-compose.yml` | `make up-oracle`, `make oracle-apps-up`, `make cluster-status` | Business apps, memory, observability, Gitea, and edge services |
| Oracle CI/CD | `infra/hosts/oracle-vps/docker-compose.gitea.yml` | `make cicd-up`, `make cicd-health`, `make gitea-up` | Gitea, Gitea runner, and GitHub mirror sync |
| Oracle app overlay | `infra/hosts/oracle-vps/docker-compose.apps.yml` | `make oracle-apps-up` | App-profile webapp overlay |
| Worker RTX 3060 | `infra/hosts/worker-rtx3060/docker-compose.yml` | `make up-worker-3060`, `make up-workers` | Ollama/lightweight local inference and metrics |
| Worker RTX 3090 Ti | `infra/hosts/worker-rtx3090ti/docker-compose.yml` | `make up-worker-3090ti`, `make up-workers` | Secondary vLLM, LiteLLM, Redis, metrics |
| Worker RTX 5090 | `infra/hosts/worker-rtx5090/docker-compose.yml` | `make up-worker-5090`, `make up-workers` | Primary vLLM, LiteLLM, Redis, metrics |
| Voice overlays | `infra/hosts/*/docker-compose.voice.yml`, `docker-compose.distributed-voice.yml` | `make voice-*`, `make voice-distributed` | Optional voice/STT/TTS services; keep private unless Access-gated |
| Assistant overlays | worker `docker-compose.hermes.yml`, `docker-compose.nerve.yml`, Oracle `docker-compose.clawteam.yml` | `make hermes-*`, `make nerve-*`, `make oracle-clawteam` | Optional assistant/runtime surfaces |

## Inventory findings

- Runtime compose files are now host-scoped under `infra/hosts/*`; older root or `infra/oracle` paths are non-canonical.
- `Makefile` defaults `COMPOSE_FILE` to `infra/hosts/orchestrator/docker-compose.yml`.
- Oracle is the durable always-on node for Gitea CI/CD, business apps, stateful services, observability, and Cloudflared ingress.
- GPU workers own model-serving surfaces; worker inference ports should be private mesh/Tailscale endpoints.
- Gitea CI/CD has a dedicated Oracle compose and health script: `infra/hosts/oracle-vps/scripts/gitea-ci-health.sh`.
- BitNet CPU fallback has a dedicated orchestrator compose and Makefile deployment path.

## Active host files reviewed

```text
infra/hosts/oracle-vps/docker-compose.yml
infra/hosts/oracle-vps/docker-compose.gitea.yml
infra/hosts/oracle-vps/docker-compose.apps.yml
infra/hosts/oracle-vps/docker-compose.clawteam.yml
infra/hosts/orchestrator/docker-compose.yml
infra/hosts/orchestrator/docker-compose.bitnet.yml
infra/hosts/orchestrator/docker-compose.cloudflared.yml
infra/hosts/orchestrator/docker-compose.nexus-one-hop.yml
infra/hosts/orchestrator/docker-compose.voice.yml
infra/hosts/worker-rtx3060/docker-compose.yml
infra/hosts/worker-rtx3090ti/docker-compose.yml
infra/hosts/worker-rtx5090/docker-compose.yml
```

## Risk notes

1. `infra/hosts/oracle-vps/docker-compose.yml` still includes components that conflict with current architecture rules; remove those before production promotion.
2. Port `4000` appears on orchestrator and worker LiteLLM services. That is acceptable across separate hosts but must not collide on a single Docker context.
3. Port `6000` appears on Oracle Nexus and optional orchestrator one-hop Nexus. Keep the one-hop compose optional to avoid local conflicts.
4. Raw worker inference ports must stay private; Cloudflared should target only approved HTTP UIs/APIs.

## Verification commands

```bash
make verify-paths
rg -n "^[A-Z0-9_]+_COMPOSE|docker compose -f|docker --context" Makefile
find infra/hosts -maxdepth 2 -name 'docker-compose*.yml' | sort
```

## Interpretation

- If a compose file is not under `infra/hosts/*` or wired through `Makefile`, it is not authoritative for root numbered docs.
- Host folders are the ownership boundary for runtime placement, ports, and service exposure.
