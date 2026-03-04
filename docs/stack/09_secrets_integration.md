# 09 - Secrets Integration (Infisical + Bitwarden)

## Policy
- Commit only templates (`.env.example`, `.env.stack.example`).
- Keep real env files local (`.env.stack`, `.env.orchestrator.local`) and ignored.

## Infisical flow (recommended)
1. Store all required production keys in Infisical project scoped by environment.
2. Inject secrets at deploy/run time using `infisical run -- docker compose ...`.
3. Rotate keys centrally without changing git-tracked files.

Example:
```bash
infisical run --env=prod --path=/nyra/orchestrator -- \
  docker compose -f infra/docker-compose.yml --profile core --profile gateway up -d
```

## Bitwarden operator flow (fallback)
1. Store operator-only secrets in Bitwarden vault.
2. Export session token (`BW_SESSION`) per terminal session.
3. Use wrapper script to template `.env.stack` at runtime (not committed).

## Required templates provided
- `.env.example` (existing broad template)
- `.env.stack.example` (new minimal orchestrator compose template)
