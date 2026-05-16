# Project Nyra Setup Runbook

This runbook is the repo-local entrypoint for the foundation prompt package. It keeps runtime ownership under `infra/hosts/<host-name>/` and uses Infisical-backed environment mirroring instead of committing secrets.

## Prerequisites

- Docker Engine or Docker Desktop with Compose v2.
- Tailscale connected to `trex-fiordland.ts.net` MagicDNS.
- Infisical CLI authenticated for the Project Nyra project.
- Cloudflared installed on the orchestrator when public ingress is being validated.
- Node.js 20+ and pnpm for workspace validation.

## Host Ownership

| Host | Compose root | Make target |
| --- | --- | --- |
| Orchestrator | `infra/hosts/orchestrator/docker-compose.yml` | `make deploy-orch` |
| Oracle VPS | `infra/hosts/oracle-vps/docker-compose.yml` | `make deploy-oracle` |
| RTX 5090 worker | `infra/hosts/worker-rtx5090/docker-compose.yml` | `make deploy-5090` |
| RTX 3090 Ti worker | `infra/hosts/worker-rtx3090ti/docker-compose.yml` | `make deploy-3090` |
| RTX 3060 worker | `infra/hosts/worker-rtx3060/docker-compose.yml` | `make deploy-3060` |

## Setup Order

1. `make verify-paths`
2. `make pull-secrets`
3. `make deploy-orch`
4. `make deploy-oracle`
5. `make deploy-5090`
6. `make deploy-3090`
7. `make deploy-3060`
8. `make health`

## Health Checks

`make health` runs `scripts/deployment/health-check.sh`, which reads `config/health-check/health-check-config.json` by default and emits a JSON report after probing Tailscale, Docker contexts, core HTTP services, worker inference endpoints, and Cloudflare tunnel status.

Use a custom config with:

```bash
NYRA_HEALTH_CONFIG=/path/to/health-check-config.json make health
```

## Submodule Blocker

The prompt package references `external/openclaw-n8n-stack`, but the current `.gitmodules` file only declares `external/claw-code` and `external/llxprt-jefe`. Do not invent an upstream URL. If that stack is still required, add a verified upstream URL to `.gitmodules` before running `git submodule update --init --recursive`.

## Rollback

- Stop orchestrator stack: `make down`
- Stop all workers: `make down-all-workers`
- Stop Oracle app stack: `docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.yml down`
- Re-run `make verify-paths` before restarting any host stack.
