# Gitea Actions Bootstrap Package (Orchestrator)

This folder is the canonical bootstrap package for self-hosted Gitea CI/CD in Project Nyra.

## Canonical locations

- Gitea workflow files (repo): `.gitea/workflows/`
- Runner config (orchestrator compose mount): `infra/configs/gitea/runner-config.yaml`
- Runner bootstrap script (compose entrypoint): `scripts/gitea/bootstrap-act-runner.sh`
- Orchestrator one-shot bootstrap: `scripts/gitea/bootstrap-orchestrator-gitea.sh`

## What this package configures

- Gitea server with Actions enabled
- Postgres-backed Gitea persistence
- `act_runner` self-hosted runner container
- Runner auto-registration using token file: `/run/nyra-secrets/gitea_runner_token`
- Native Gitea pipelines in `.gitea/workflows/ci-cd.yml`

## Required prerequisites

- Docker + Docker Compose on orchestrator host
- Existing `nyra-net` Docker network (script can create it)
- `.env.gitea` file (auto-created from `.env.gitea.template` if missing)
- Secret file in Docker volume `nyra-secrets`:
  - `gitea_runner_token`

## Bootstrap commands (orchestrator)

From repo root on orchestrator:

```bash
chmod +x scripts/gitea/bootstrap-orchestrator-gitea.sh
ENABLE_ACTIONS=true ENABLE_INFISICAL_AGENT=true ./scripts/gitea/bootstrap-orchestrator-gitea.sh
```

Or via Make target:

```bash
make gitea-bootstrap-orchestrator
```

## Service compose integration

The following compose files are integrated with this package:

- `docker-compose.gitea.yml`
- `docker-compose.gitea.bootstrap.yml`

Both mount:

- `./infra/configs/gitea/runner-config.yaml:/config.template.yaml:ro`
- `./scripts/gitea/bootstrap-act-runner.sh:/usr/local/bin/bootstrap-act-runner.sh:ro`

And start runner with entrypoint:

```yaml
entrypoint: ["/bin/sh", "/usr/local/bin/bootstrap-act-runner.sh"]
```

## Health checks

```bash
docker compose -f docker-compose.gitea.bootstrap.yml --env-file .env.gitea ps
curl -fsS http://localhost:3100/api/healthz
```

## Notes on workflow portability

- `.github/workflows/*` remains GitHub-specific CI/CD.
- `.gitea/workflows/*` is the native location Gitea Actions uses.
- This package reuses the same root build/test commands (`pnpm build`, `pnpm test`) for parity.
