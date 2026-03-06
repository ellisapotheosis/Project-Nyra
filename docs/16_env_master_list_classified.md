# 16 Environment Master List (Classified)

## Classification model

- **Required runtime**: compose interpolation or service startup critical.
- **Optional runtime**: feature flags or profile-only values.
- **Secret**: credentials/tokens/keys; never commit real values.
- **Derived**: values computed from deployment context.

## Core stack examples

| Variable | Class | Scope | Notes |
|---|---|---|---|
| `POSTGRES_PORT` | required runtime | infra stack | publish mapping for postgres |
| `REDIS_PORT` | required runtime | infra stack | publish mapping for redis |
| `MONGO_PORT` | required runtime | infra stack | publish mapping for mongo |
| `LITELLM_PORT` | optional runtime | orchestrator | gateway exposure point |
| `NEXUS_ROUTER_PORT` | optional runtime | orchestrator | router API port |
| `NYRA_DOMAIN_ROOT` | required runtime | edge docs/config | cloudflared hostnames |
| `CF_TUNNEL_NAME` | required runtime | cloudflared | tunnel identifier |

## Gitea bootstrap examples

| Variable | Class | Notes |
|---|---|---|
| `GITEA_PORT` | optional runtime | defaults to 3100 |
| `GITEA_SSH_PORT` | optional runtime | defaults to 2222 |
| `INFISICAL_PROJECT_ID` | secret-adjacent | reference only, not a credential itself |
| `INFISICAL_PATH` | optional runtime | secret namespace path |

## Infisical bootstrap examples

| Variable | Class | Notes |
|---|---|---|
| `INFISICAL_POSTGRES_PASSWORD` | secret | must be non-placeholder in runtime |
| `INFISICAL_ENCRYPTION_KEY` | secret | 32-hex runtime requirement |
| `INFISICAL_AUTH_SECRET` | secret | base64 secret |
| `INFISICAL_SITE_URL` | required runtime | UI/API origin |

## Secret safety controls

- `.env.gitea` and `.env.infisical` remain ignored.
- `.secrets/` remains ignored.
- templates (`*.template`) are committed for bootstrap onboarding.
