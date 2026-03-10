# NYRA “God-tier” Gitea Bootstrap (Windows + Docker Desktop)

This package brings up **Gitea + Postgres** on your **orchestrator**, with optional:
- **AI PR reviewer** (OpenAI-compatible → OpenRouter or LiteLLM)
- **Gitea Actions runner** (act_runner) with a sane Docker network config
- **Cloudflared tunnel** profile (if you already have a tunnel token)

It is designed to be **idempotent**: re-running the setup won’t destroy your data volumes.

---

## Env vars you must replace (BEFORE enabling optional profiles)

You only need these if you enable the corresponding feature:

### AI reviewer
- `OPENROUTER_API_KEY`  
  Get it from your OpenRouter dashboard. (The reviewer talks OpenAI-compatible `/chat/completions`.)

### Public tunnel
- `CLOUDFLARED_TUNNEL_TOKEN`  
  From Cloudflare Zero Trust → Tunnels → your tunnel → “Token”.

Everything else is generated automatically on first run:
- `GITEA_DB_PASS`, `GITEA_ADMIN_PASS`, `WEBHOOK_SECRET`, `WEBHOOK_AUTH_TOKEN`
- `GITEA_TOKEN` (PAT) is created automatically via Gitea’s Token API (BasicAuth+password).
- `GITEA_RUNNER_TOKEN` can be generated automatically via CLI when you use `-EnableActions`.

---

## Quickstart (orchestrator)

1) Extract to:
`C:\Dev\nyra-gitea-bootstrap`

2) Run:
```powershell
Set-Location C:\Dev\nyra-gitea-bootstrap
PowerShell -ExecutionPolicy Bypass -File .\Setup-NYRA-Gitea.ps1 -MachineRole orchestrator
```

3) Open:
- http://localhost:3100

Admin creds are in `.env.gitea` and `gitea-setup-summary-orchestrator.md`.

---

## Optional: enable AI reviewer

1) Put your OpenRouter key into `.env.gitea`:
`OPENROUTER_API_KEY=...`

2) Start AI reviewer:
```powershell
PowerShell -ExecutionPolicy Bypass -File .\Setup-NYRA-Gitea.ps1 -MachineRole orchestrator -EnableAIReviewer
```

3) For each repo you want reviewed:
```powershell
.\scripts\Create-Webhook.ps1 -Owner <owner> -Repo <repo>
```

Webhook verification uses:
- `Authorization: Bearer <WEBHOOK_AUTH_TOKEN>` (supported by Gitea hooks) 
- `X-Gitea-Signature` HMAC SHA256 of body (supported by Gitea webhooks)

---

## Optional: enable Actions runner

```powershell
PowerShell -ExecutionPolicy Bypass -File .\Setup-NYRA-Gitea.ps1 -MachineRole orchestrator -EnableActions
```

Then **per repo**: Repo → Settings → Actions → Enable.

---

## Important notes (so you don’t get ambushed)

### “Do env vars start with a dash?”
- In `docker-compose.yml`, `- KEY=value` is YAML list syntax.
- In `.env` files, it is always `KEY=value` with **no dash**.

### Cron spacing
Cron is **five fields**: `minute hour day month weekday`  
So “2 AM daily” is:
`0 2 * * *`  
A leading dash belongs to YAML list syntax — it’s **not** part of cron.

### Security
- Registration is disabled by default.
- Public instances get scanned. Do not expose without auth + updated version.

---

## Directory tree

```text
nyra-gitea-bootstrap/
  Setup-NYRA-Gitea.ps1
  docker-compose.yml
  .env.gitea.template
  gitea/
    app.ini
    app.ini.template
  runner/
    config.yaml
    config.yaml.template
  ai-reviewer/
    Dockerfile
    requirements.txt
    main.py
    README.md
  scripts/
    Up.ps1
    Down.ps1
    Status.ps1
    Logs.ps1
    Create-Webhook.ps1
```
