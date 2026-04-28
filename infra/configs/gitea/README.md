# Gitea Actions Bootstrap Package (Oracle)

This folder is the canonical bootstrap package for self-hosted Gitea CI/CD in Project Nyra.
Oracle VPS is the always-on standard CI host. GPU/large jobs belong on worker hosts.

## Canonical locations

- Gitea workflow files (repo): `.gitea/workflows/`
- Runner config (Oracle compose mount): `infra/configs/gitea/runner-config.oracle.yaml`
- Large runner config (heavy builds): `infra/configs/gitea/runner-config-large.yaml`

## What this package configures

- Gitea server with Actions enabled
- Postgres-backed Gitea persistence
- `act_runner` self-hosted runner container
- Runner auto-registration using `GITEA_RUNNER_TOKEN` from `/home/ubuntu/project-nyra/.env.gitea`
- Native Gitea pipelines in `.gitea/workflows/ci-cd.yml`
- Internal image publish on tags in `.gitea/workflows/publish-images.yml`

## Required prerequisites

- Docker + Docker Compose on Oracle VPS
- `/home/ubuntu/project-nyra/.env.gitea`
- Gitea runner token generated from the local Gitea container

## Bootstrap commands (Oracle)

From `/home/ubuntu/project-nyra` on Oracle:

```bash
docker compose \
  -f infra/hosts/oracle-vps/docker-compose.gitea.yml \
  --env-file .env.gitea \
  up -d
```

## Service compose integration

The active compose file is `infra/hosts/oracle-vps/docker-compose.gitea.yml`.

## Health checks

```bash
infra/hosts/oracle-vps/scripts/gitea-ci-health.sh
```

## Notes on workflow portability

- `.github/workflows/*` remains GitHub-specific CI/CD.
- `.gitea/workflows/*` is the native location Gitea Actions uses.
- This package reuses the same root build/test commands (`pnpm build`, `pnpm test`) for parity.

## Gitea secrets required for workflows

- `NPM_TOKEN`
- `NYRA_DEPLOY_ENABLED` (`true` to enable CD deploy step)
- `GITEA_REGISTRY`
- `GITEA_REGISTRY_USER`
- `GITEA_REGISTRY_TOKEN`
