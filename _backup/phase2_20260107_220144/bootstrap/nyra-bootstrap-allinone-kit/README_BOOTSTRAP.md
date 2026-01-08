# Nyra All-in-One Bootstrap Kit

Drop this `.zip` into `project-nyra/bootstrap/` and unzip.

## Quick start (Windows)
From repo root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass -Force
./bootstrap/00_apply.ps1
./bootstrap/verify_kit.ps1

Copy-Item infra/.env.example infra/.env -Force
# edit infra/.env and fill required vars

docker compose -f infra/docker-compose.dev.yml up -d --build
```

Then:

```powershell
cd apps/nyra-admin
copy .env.example .env.local
pnpm install
pnpm dev -- --port 3002
```

## Claude Code
Use `bootstrap/CLAUDE_CODE_MASTER_PROMPT.md` as your “all inclusive prompt”.

## What it installs
- Canonical stack decisions under `docs/decisions/`
- Compose stack (Dify + n8n + Activepieces + TwentyCRM + Nexus + LiteLLM + memory)
- Prompts for claude-flow swarms under `prompts/claude-flow/`
- Tools for Excel formula extraction under `tools/`
