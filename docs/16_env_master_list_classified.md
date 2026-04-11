# 16 Environment Master List (Classified)

## Active env files discovered
- `.env.gitea` (runtime only; gitignored)
- `.env.infisical` (runtime only; gitignored)
- `.env.gitea.template`
- `.env.infisical.template`
- `.env.stack.example`
- `infra/env/.env.orchestrator` (referenced by scripts)
- `infra/env/.env.oracle` (referenced by scripts)
- `infra/env/.env.worker-rtx3060` (referenced by scripts)
- `infra/env/.env.worker-rtx3090ti` (referenced by scripts)
- `infra/env/.env.worker-rtx5090` (referenced by scripts)

## Secret class variables (examples)
- `INFISICAL_TOKEN`
- `INFISICAL_POSTGRES_PASSWORD`
- `INFISICAL_ENCRYPTION_KEY`
- `INFISICAL_AUTH_SECRET`
- `GITEA_RUNNER_REGISTRATION_TOKEN_FILE`
- `OPENAI_API_KEY_FILE`

## Config/runtime class variables (examples)
- `NYRA_NETWORK`
- `NYRA_MACHINE`
- `GITEA_PORT`
- `GITEA_SSH_PORT`
- `INFISICAL_PORT`
- `INFISICAL_SITE_URL`
- `INFISICAL_API_URL`
- `INFISICAL_PROJECT_ID`

## Policy checks
- `.env.gitea`, `.env.infisical`, and `.secrets/` are gitignored.
- Templates remain committed for reproducibility.
- No secrets embedded in docs or Cloudflared config.
