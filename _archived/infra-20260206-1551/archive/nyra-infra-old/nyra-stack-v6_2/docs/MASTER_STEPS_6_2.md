# NYRA v6.2 — MASTER STEPS

## 0) Prereqs
- Docker + Docker Compose
- PowerShell 7+ (Windows) / Bash (Linux)
- Infisical CLI (https://infisical.com)
- Optional: 7-Zip in PATH
- Optional: Cloudflared token

## 1) Configure env
Copy `env/.env.example` → `env/.env` and fill:
- Domain: `DOMAIN`, `MAIN_SUBDOMAIN`
- Infisical: `INFISICAL_PROJECT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, `INFISICAL_ENV=dev`
- Providers: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENROUTER_API_KEY`, etc.
- Cloudflare: `CLOUDFLARE_TOKEN`
- LAN IPs for each PC

## 2) Seed example secrets to Infisical
Windows:

nyra-infra\nyra-stack-v6_2\scripts\infisical_push.ps1 -Files @(
“nyra-infra\nyra-stack-v6_2\secrets\example.shared.env”,
“nyra-infra\nyra-stack-v6_2\secrets\example.metamcp.env”,
“nyra-infra\nyra-stack-v6_2\secrets\example.nyra-ingestion.env”
) -Paths @(”/shared”,”/metamcp”,”/nyra-ingestion”)

Linux:

FILES=“nyra-infra/nyra-stack-v6_2/secrets/example.shared.env,nyra-infra/nyra-stack-v6_2/secrets/example.metamcp.env,nyra-infra/nyra-stack-v6_2/secrets/example.nyra-ingestion.env” 
PATHS=”/shared,/metamcp,/nyra-ingestion” nyra-infra/nyra-stack-v6_2/scripts/infisical_push.sh

## 3) Start orchestrator
- Local only:
  - Windows: `nyra-infra\nyra-stack-v6_2\scripts\Start-Nyra.ps1`
  - Linux: `nyra-infra/nyra-stack-v6_2/scripts/start-nyra.sh`
- Public (Cloudflared):
  - Windows: `nyra-infra\nyra-stack-v6_2\scripts\Start-Nyra.ps1 -Public`
  - Linux: `nyra-infra/nyra-stack-v6_2/scripts/start-nyra.sh --public`

## 4) Start workers

docker compose -f nyra-infra/nyra-stack-v6_2/worker/docker-compose.yml –profile llm –profile ui up -d

## 5) MetaMCP pre-seed & OWUI registration
Scripts run automatically. If tool registration fails, add via Open WebUI → Tools → OpenAPI.

## 6) Compose with Infisical injection (multi-path)
Windows:

nyra-infra\nyra-stack-v6_2\scripts\compose_inject.ps1 -ComposeFile ..\orchestrator\docker-compose.yml

Linux:

nyra-infra/nyra-stack-v6_2/scripts/compose_inject.sh nyra-infra/nyra-stack-v6_2/orchestrator/docker-compose.yml

Set `INFISICAL_FOLDER_PATHS=/shared,/project-nyra` to inject multiple paths.

## 7) DevContainer & WSL
- Devcontainer: open in VS Code → “Reopen in Container”.
- WSL: run `install-to-wsl.ps1` then `link-wsl-workdir.ps1`.

## 8) Validate

docker compose -f nyra-infra/nyra-stack-v6_2/orchestrator/docker-compose.yml config
docker compose -f nyra-infra/nyra-stack-v6_2/worker/docker-compose.yml config
