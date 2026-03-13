# Nyra Infra Bootstrap (fresh /infra rebuild)

This package drops a **complete `/infra`** folder into your Project Nyra repo, plus scripts to stand up:

- Postgres + Redis (Nyra core)
- LiteLLM proxy (OpenRouter-friendly)
- Nexus Router (MCP gateway)
- Nyra MCP server (safe HTTP tools)
- TwentyCRM (official docker-compose stack)
- n8n (queue mode + worker)
- Activepieces
- Grafana + Prometheus + Loki (basic observability)
- Optional Cloudflared tunnel container (edge)

## Apply to your repo

1) Unzip this package anywhere.
2) Copy the included `infra/` folder into your repo root (or replace your wiped `/infra`).

### Windows (PowerShell)
From your repo root:
```powershell
powershell -ExecutionPolicy Bypass -File .\infra\scripts\bootstrap.ps1
```

### WSL2 / Linux
From your repo root:
```bash
bash ./infra/scripts/bootstrap.sh
```

## Security note

The OpenClaw/ClawHub ecosystem has had **active supply-chain attacks** via malicious skills and unsafe SKILL.md instructions.
This bootstrap defaults to **no auto-install** of random skills. See `infra/docs/openclaw-security.md`.
