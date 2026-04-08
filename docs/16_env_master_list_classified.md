# 16 Environment Master List (Classified)

## Active bootstrap env files

- `.env.stack`
- `.env.gitea`
- `.env.infisical`
- `infra/env/.env.orchestrator`
- `infra/env/.env.oracle`
- `infra/env/.env.worker-rtx3060`
- `infra/env/.env.worker-rtx3090ti`
- `infra/env/.env.worker-rtx5090`

## Secret classes

- Authentication material: `*_TOKEN`, `*_SECRET`, `*_PASSWORD`, `*_API_KEY`.
- Encryption material: `INFISICAL_ENCRYPTION_KEY`, `INFISICAL_AUTH_SECRET`.
- Infrastructure credentials: DB credentials and registry auth tokens.

## Environment-dependent classes

- Host routing: `*_URL`, `*_DOMAIN`, `*_HOST`, `*_ROOT_URL`.
- Port exposure: `*_PORT`.
- Runtime profile selectors: `*_ENV`, `*_ENVIRONMENT`, role profile variables.

## Repository guardrails

- `.env.gitea`, `.env.infisical`, and `.secrets/` are gitignored.
- Templates (`.env.*.template`) remain committed for bootstrap reproducibility.
- Generated docs never embed live secret values.

## Known bootstrap variables (excerpt)

| Variable | Class | Source stack |
|---|---|---|
| `GITEA_PORT` | env-dependent | `docker-compose.gitea.yml` |
| `GITEA_SSH_PORT` | env-dependent | `docker-compose.gitea.yml` |
| `INFISICAL_PORT` | env-dependent | `docker-compose.infisical.yml` |
| `INFISICAL_POSTGRES_PASSWORD` | secret | `docker-compose.infisical.yml` |
| `INFISICAL_ENCRYPTION_KEY` | secret | `docker-compose.infisical.yml` |
| `INFISICAL_AUTH_SECRET` | secret | `docker-compose.infisical.yml` |
| `INFISICAL_TOKEN` | secret | `docker-compose.gitea.yml`, `docker-compose.archon.yml` |
| `INFISICAL_PROJECT_ID` | env-dependent | `docker-compose.gitea.yml`, workflows |
| `STACK_ENV_FILE` | env-dependent | `Makefile` |
