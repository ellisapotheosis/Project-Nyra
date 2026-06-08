# 09 - Secrets Integration (Infisical + Bitwarden)

Updated: 2026-04-30

## Policy
- Commit only templates (`.env.example`, `.env.stack.example`).
- Keep real env files local (`.env.stack`, `.env.orchestrator.local`) and ignored.
- Keep Cloudflare tunnel credential JSON files and API tokens out of git.

## Infisical flow (recommended)
1. Store all required production keys in Infisical project scoped by environment.
2. Inject secrets at deploy/run time using `infisical run -- docker compose ...`.
3. Rotate keys centrally without changing git-tracked files.

Example:
```bash
infisical run --env=prod --path=/nyra/orchestrator -- \
  docker compose -f infra/hosts/orchestrator/docker-compose.yml up -d
```

Oracle example:

```bash
infisical run --env=prod --path=/nyra/oracle -- \
  docker --context oracle compose -f infra/hosts/oracle-vps/docker-compose.yml up -d
```

## Cloudflared secrets

Token-managed tunnel runners use host environment variables:

| Variable | Scope |
|---|---|
| `ORACLE_TUNNEL_TOKEN` | Oracle tunnel container |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | Optional orchestrator tunnel container |
| `CLOUDFLARE_API_TOKEN` | Optional CLI/API setup automation |

Local-managed tunnel YAML in `docs/cloudflared/` requires credentials files such
as `/etc/cloudflared/<TUNNEL_UUID>.json`. These files are secrets and must never
be committed.

## Bitwarden operator flow (fallback)
1. Store operator-only secrets in Bitwarden vault.
2. Export session token (`BW_SESSION`) per terminal session.
3. Use wrapper script to template `.env.stack` at runtime (not committed).

## Required templates provided
- `.env.example` (existing broad template)
- `.env.stack.example` (new minimal orchestrator compose template)
