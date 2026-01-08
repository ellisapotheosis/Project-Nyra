# Infisical Agent + Bulk Import Kit (Windows 11 / PowerShell)

This kit does two things:
1) Helps you set up **Infisical Agent** (so it renders secrets into a `.env` file on a schedule)
2) Lets you **bulk upload** secrets from many `.env` files into Infisical, each into its own folder path.

## Prereqs
- Infisical CLI installed (you already have it via Scoop)
- A Machine Identity configured with **Universal Auth** (Client ID + Client Secret) in your Infisical project.

Docs:
- Infisical Agent config + `--config` usage: https://infisical.com/docs/integrations/platforms/infisical-agent
- CLI `secrets set --file` + `--path` + `--env`: https://infisical.com/docs/cli/commands/secrets
- Secret Imports (recommended for base -> machine overrides): https://infisical.com/docs/documentation/platform/secret-reference

---

# Part A — Folder/Path Strategy (recommended)

Use **Infisical Environments** for dev/staging/prod, instead of prefixing keys with STAGING_/PROD_.

Folders:
- `/base/network`                      -> shared network constants (CIDR, etc)
- `/clients/cloudflare`                -> cloudflare tokens/keys
- `/apps/nyra/common`                  -> non-secret config (log level, ports) if you want it centralized
- `/apps/nyra/secrets`                 -> secrets used by Nyra services
- `/machines/orchestrator-mini`        -> orchestrator-specific overrides
- `/machines/worker-rtx3060`           -> worker-specific overrides

**Best practice:** Use **Secret Imports** in Infisical UI:
- Import `/base/network` into each machine folder
- Then in each machine folder, add only overrides (e.g. ORCHESTRATOR_IP)
So the agent can fetch *one* path per machine.

---

# Part B — Infisical Agent (Windows)

## 1) Create credentials files
Create files:
- `./secrets/infisical-client-id`
- `./secrets/infisical-client-secret`

You can do it quickly:
```powershell
New-Item -ItemType Directory -Force .\secrets | Out-Null
Set-Content -Path .\secrets\infisical-client-id -Value "<PASTE_CLIENT_ID_HERE>"
Set-Content -Path .\secrets\infisical-client-secret -Value "<PASTE_CLIENT_SECRET_HERE>"
```

## 2) Fill in your Project ID + environment slug
Edit `templates\nyra.env.tmpl` and replace:
- `__PROJECT_ID__` with your Infisical project id
- `__ENV__` with `dev` (or `staging`, `prod`)
- `__PATH__` with the folder you want rendered (example: `/machines/orchestrator-mini`)

## 3) Run the agent
```powershell
infisical agent --config .\agent-config.yaml
```

It will render a `.env` file at `./.env.infisical` every minute by default.

> Tip: In Docker Compose, you can point services to `env_file: .env.infisical` or run:
> `infisical run -- docker compose -f docker-compose.dev.yml up`

---

# Part C — Bulk upload secrets into paths

## 1) Login once (or use machine identity token)
For scripting, set `INFISICAL_TOKEN`:
```powershell
$env:INFISICAL_TOKEN = infisical login --method=universal-auth --client-id "<ID>" --client-secret "<SECRET>" --silent --plain
```

(You can also rely on `infisical init` + normal login; token is best for automation.)

## 2) Put your values into the env files under ./env
Examples included:
- env\base.network.env
- env\apps.nyra.dev.env
- env\machines.orchestrator-mini.env
- env\machines.worker-rtx3060.env

## 3) Run the importer
```powershell
PowerShell -NoProfile -ExecutionPolicy Bypass -File .\scripts\bulk-import.ps1 -Env dev
```

You can also run for staging/prod:
```powershell
.\scripts\bulk-import.ps1 -Env staging
.\scripts\bulk-import.ps1 -Env prod
```

The mapping lives in `imports.json`. Edit paths/files as you like.

---

# Notes on what belongs where

## Network vars (your list)
- Put `INTERNAL_NETWORK` in `/base/network`
- Put machine IPs in each machine folder:
  - `/machines/orchestrator-mini` -> ORCHESTRATOR_IP
  - `/machines/worker-rtx3060`    -> WORKER_IP (preferred) or WORKER1_IP

## Docker dev settings + ports
These are not "secrets" (mostly).
Put them under `/apps/nyra/common` (or keep them in repo `.env`).
If you store them in Infisical, keep them as **shared** secrets.

## Staging/prod keys
Prefer: same key names, different environments.
Instead of `STAGING_API_KEY`, use `API_KEY` in `staging` env.
