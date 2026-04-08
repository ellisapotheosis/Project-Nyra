# Project Nyra Manual Action Guide (Bootstrap)

This path is now canonical for manual setup follow-up after running:

- `scripts/setup/setup-automated-env-vars.sh`
- `scripts/setup/setup-automated-env-vars.ps1`

## Required manual tasks

1. Create provider accounts (Anthropic, Google, Infisical, Tailscale, Cloudflare).
2. Add API keys and secrets to your generated `.env.*` files.
3. Store production secrets in Infisical before any shared deployment.
4. Validate compose stacks with `docker compose config` before first `up -d`.

## Canonical bootstrap import paths

- Incoming files: `infra/bootstrap/incoming/`
- File map: `infra/bootstrap/file-map.csv`
- Applied snapshots: `infra/bootstrap/applied/`

Use `make bootstrap-import` (dry-run) and `make bootstrap-import-apply` (apply).
