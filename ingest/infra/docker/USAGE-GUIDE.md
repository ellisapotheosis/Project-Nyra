# Infra Docker Usage Guide (modular)

## Quick start (authoritative)
```bash
cd infra/orchestrator
cp ../configs/env/.env.orchestrator.example .env
make up
```

## Worker quick starts
```bash
cd infra/worker-rtx5090 && cp ../configs/env/.env.worker-rtx5090.example .env && docker compose --env-file .env up -d --build
cd infra/worker-rtx3090ti && cp ../configs/env/.env.worker-rtx3090ti.example .env && docker compose --env-file .env up -d --build
cd infra/worker-rtx3060 && cp ../configs/env/.env.worker-rtx3060.example .env && docker compose --env-file .env up -d
```

## `infra/docker/` wrappers
These files mirror the orchestrator modular stack and point into `infra/orchestrator/compose/*`.
Use them if you prefer an `infra/docker/*` command surface.

## Profiles
- `openclaw` — ClawHub/OpenClaw wrappers + adapter
- `claude-flow-dev` — maximal Claude Flow module containers
- `admin` — pgAdmin + Infisical
- `gitea` — Gitea
- `composio` — Composio MCP
- `compat` — MetaMCP legacy alias
