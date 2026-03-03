# 03 - Environment Required (production baseline)

## CF / Edge
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`
- `CLOUDFLARE_ACCOUNT_ID` (for DNS automation scripts)
- `CF_TUNNEL_ID_ORCHESTRATOR`

## Database
- `POSTGRES_PASSWORD`
- `MONGO_ROOT_PASSWORD`
- `RUVECTOR_POSTGRES_PASSWORD`

## Cache / state
- `REDIS_PASSWORD`

## Auth / platform secrets
- `N8N_ENCRYPTION_KEY`
- `ACTIVEPIECES_JWT_SECRET`
- `ACTIVEPIECES_ENCRYPTION_KEY`
- `TWENTY_ENCRYPTION_SECRET`
- `TWENTY_JWT_SECRET`
- `TWENTY_PASSWORD_SALT`
- `GRAFANA_ADMIN_PASSWORD`
- `NEXUS_ADMIN_TOKEN` (recommended)

## LLM / model providers
- `LITELLM_MASTER_KEY`
- Optional but expected in prod routing: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `OPENROUTER_API_KEY`

## Worker fleet
- `WORKER_3060_OLLAMA_PORT` (optional override)
- `WORKER_3090TI_VLLM_PORT` (optional override)
- `WORKER_5090_VLLM_PORT` (optional override)

## Secrets management policy
- Keep local `.env.stack` out of git.
- Source secrets from Infisical first (`INFISICAL_TOKEN`, `INFISICAL_PROJECT_ID`) and optionally Bitwarden MCP (`BITWARDEN_CLIENT_ID`, `BITWARDEN_CLIENT_SECRET`, `BW_SESSION`) for local operators.
