# ENV_CANONICAL

## Oracle (`infra/hosts/oracle-vps/.env.example`)

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `TWENTY_SERVER_URL`, `TWENTY_SECRET`
- `ACTIVEPIECES_API_KEY`
- `OPENCLAW_API_KEY`

## Orchestrator (`infra/hosts/orchestrator/.env.example`)

- `NEXUS_PORT`, `LITELLM_PORT`
- `INFISICAL_TOKEN`

## Workers (`infra/hosts/worker-*/*.env.example`)

- `OLLAMA_HOST` (3060)
- `VLLM_MODEL`, `VLLM_PORT` (3090ti/5090)
- `TAILSCALE_AUTHKEY`

## Exposure Policy

- Public: landing/webapp/admin hostnames behind Cloudflared.
- Access-protected: Twenty/admin and ops dashboards.
- Internal-only: Postgres, Redis, FalkorDB, memory stores.
