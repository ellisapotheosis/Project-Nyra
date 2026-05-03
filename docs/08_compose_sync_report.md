# 08 Compose Sync Report

Updated: 2026-04-27

## Objective

Validate that root numbered docs, Makefile targets, and host-scoped compose files agree on active stack placement.

## Current Makefile compose paths

| Variable | Path |
|---|---|
| `ORCHESTRATOR_COMPOSE` | `infra/hosts/orchestrator/docker-compose.yml` |
| `ORCHESTRATOR_BITNET_COMPOSE` | `infra/hosts/orchestrator/docker-compose.bitnet.yml` |
| `CF_ORCH_COMPOSE` | `infra/hosts/orchestrator/docker-compose.cloudflared.yml` |
| `ORACLE_COMPOSE` | `infra/hosts/oracle-vps/docker-compose.yml` |
| `ORACLE_GITEA_COMPOSE` | `infra/hosts/oracle-vps/docker-compose.gitea.yml` |
| `ORACLE_APPS_COMPOSE` | `infra/hosts/oracle-vps/docker-compose.apps.yml` |
| `WORKER_3060_COMPOSE` | `infra/hosts/worker-rtx3060/docker-compose.yml` |
| `WORKER_3090TI_COMPOSE` | `infra/hosts/worker-rtx3090ti/docker-compose.yml` |
| `WORKER_5090_COMPOSE` | `infra/hosts/worker-rtx5090/docker-compose.yml` |
| `VOICE_*` | `infra/hosts/*/docker-compose.voice.yml` |
| `DIST_VOICE_*` | `infra/hosts/*/docker-compose.distributed-voice.yml` |
| `HERMES_*` | worker `docker-compose.hermes.yml` files |
| `NERVE_*` | worker `docker-compose.nerve.yml` files |

## Findings

- `Makefile` now treats `infra/hosts/orchestrator/docker-compose.yml` as the default local compose file.
- `make verify-paths` validates the host-scoped compose files used by the main targets.
- Oracle CI/CD uses a dedicated compose at `infra/hosts/oracle-vps/docker-compose.gitea.yml`.
- Oracle app-profile services use `infra/hosts/oracle-vps/docker-compose.apps.yml` as an overlay.
- Worker stacks are controlled through Docker contexts: `worker-rtx3060`, `worker-rtx3090ti`, and `worker-rtx5090`.
- BitNet CPU fallback has first-class targets: `bitnet-sync`, `bitnet-up`, `bitnet-health`, `bitnet-smoke`, and `bitnet-deploy`.

## Drift corrections made in this doc set

1. Replaced old `infra/docker-compose.yml` references with `infra/hosts/orchestrator/docker-compose.yml`.
2. Replaced old `infra/oracle/*` references with `infra/hosts/oracle-vps/*`.
3. Replaced old `infra/workers/*` references with `infra/hosts/worker-*/*`.
4. Rebuilt root port guidance around current host-scoped compose files.
5. Added a missing root `02_ports_registry.md` snapshot.

## Validation commands

```bash
make verify-paths
docker compose -f infra/hosts/orchestrator/docker-compose.yml config
docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.yml config
docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.gitea.yml --env-file .env.gitea config
```

## Remaining caveats

- Full runtime validation requires the Docker contexts and hosts to be reachable.
- Some compose files still contain components that conflict with the current architecture rules; those are stack cleanup items, not doc truth.
- Dashboard-managed Cloudflare tunnel routes must be compared manually against `infra/hosts/oracle-vps/cloudflared-config.yml`.
