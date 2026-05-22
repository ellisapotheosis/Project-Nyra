# Infisical Missing Secrets

This is the tracked, secret-safe checklist for Project Nyra Infisical coverage.
It lists paths and variable names only.

Generated temporary values are intentionally not committed. The private local
generated-value import aid remains outside the repo at:

`/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`

Use generated values only for local or isolated test smoke, then replace them
with real provider values before production.

## Project Defaults

- Infisical project id: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
- Default environment: `prod`
- Compose sidecar bootstrap variable: `INFISICAL_TOKEN`
- Host secret volume target: `/run/nyra-secrets`

## Machine Paths

### `/machines/oracle-vps`

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`
- `REDIS_URL`
- `TWENTY_SERVER_URL`
- `TWENTY_FRONTEND_URL`
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_REDIS_URL`
- `TWENTY_APP_SECRET`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_API_KEY`
- `ACTIVEPIECES_BASE_URL`
- `ACTIVEPIECES_API_KEY`
- `AP_ENCRYPTION_KEY`
- `AP_JWT_SECRET`
- `AP_POSTGRES_PASSWORD`
- `N8N_BASE_URL`
- `N8N_HOST`
- `N8N_WEBHOOK_URL`
- `N8N_API_KEY`
- `N8N_ENCRYPTION_KEY`
- `N8N_BASIC_AUTH_USER`
- `N8N_BASIC_AUTH_PASSWORD`
- `OPENLIT_NEXTAUTH_URL`
- `OPENLIT_NEXTAUTH_SECRET`
- `OPENLIT_VAULT_ENCRYPTION_KEY`
- `OPENLIT_DB_PASSWORD`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `PAPERCLIP_API_KEY`
- `PAPERCLIP_DB_PASSWORD`
- `PAPERCLIP_AGENT_JWT_SECRET`
- `GITEA_SECRET_KEY`
- `GITEA_INTERNAL_TOKEN`
- `GITEA_JWT_SECRET`
- `GITEA_DB_PASSWORD`
- `GITEA_RUNNER_TOKEN`
- `CLOUDFLARED_TUNNEL_TOKEN`
- `ORCHESTRATOR_TUNNEL_TOKEN`
- `NEXUS_ROUTER_API_KEY`
- `EVENT_INGEST_API_KEY`
- `NYRA_STATUS_BRIDGE_TOKEN`

### `/machines/orchestrator`

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `ORCHESTRATOR_TUNNEL_TOKEN`
- `CLOUDFLARED_TUNNEL_TOKEN`
- `NEXUS_ROUTER_API_KEY`
- `NEXUS_ROUTER_URL`
- `NEXUS_URL`
- `LITELLM_MASTER_KEY`
- `LITELLM_API_KEY`
- `OPENCLAW_GATEWAY_TOKEN`
- `OPENCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`
- `GRAFANA_ADMIN_PASSWORD`
- `NYRA_STATUS_BRIDGE_TOKEN`
- `LLXPRT_BRIDGE_API_KEY`

### `/machines/worker-rtx5090`, `/machines/worker-rtx3090ti`, `/machines/worker-rtx3060`

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `NEXUS_ROUTER_API_KEY`
- `LLXPRT_BRIDGE_API_KEY`
- `OPENAI_API_KEY`

## App Paths

### `/apps/projectnyra`

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_JWT_SECRET`
- `CRM_API_URL`
- `CRM_API_KEY`
- `LEAD_INGESTION_API_URL`
- `LEAD_INGESTION_API_KEY`
- `CAMPAIGN_ENGINE_URL`
- `QUOTE_API_URL`
- `QUOTE_API_SECRET`
- `QUOTE_ENGINE_URL`
- `ACTIVEPIECES_BASE_URL`
- `N8N_BASE_URL`
- `NEXUS_ROUTER_URL`
- `OPENCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_GATEWAY_TOKEN`
- `NYRA_ENABLE_MOCKS`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN`
- `CORS_ALLOWED_ORIGINS`

### `/apps/ratehunter`

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `CONTACT_EMAIL`
- `EMAIL_FROM`
- `SENDGRID_FROM_EMAIL`
- `OPENCLAW_BORROWER_API_URL`
- `OPENCLAW_BORROWER_API_KEY`
- `OPENCLAW_CHAT_PATH`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN`

## Service Paths

### `/services/crm-api`

- `CRM_API_KEY`
- `TWENTY_CRM_URL`
- `TWENTYCRM_URL`
- `TWENTY_CRM_API_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

### `/services/lead-ingestion`

- `LEAD_INGESTION_API_KEY`
- `CRM_API_URL`
- `CRM_API_KEY`
- `DATABASE_URL`
- `WEBHOOK_BASE_URL`
- `EVENT_INGEST_API_KEY`

### `/services/campaign-service`

- `CAMPAIGN_ENGINE_URL`
- `DATABASE_URL`
- `ACTIVEPIECES_BASE_URL`
- `ACTIVEPIECES_API_KEY`
- `N8N_BASE_URL`
- `N8N_API_KEY`
- `SENDGRID_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `EVENT_INGEST_API_KEY`

### `/services/compliance-service`

- `DATABASE_URL`
- `REDIS_URL`
- `CRM_API_URL`
- `CRM_API_KEY`
- `EVENT_INGEST_API_KEY`

### `/services/communication-service`

- `DATABASE_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `WEBHOOK_BASE_URL`

### `/services/quote-service`

- `QUOTE_API_SECRET`
- `DATABASE_URL`
- `CRM_API_URL`
- `CRM_API_KEY`
- `EVENT_INGEST_API_KEY`

### `/services/assistant-service`

- `NEXUS_ROUTER_URL`
- `NEXUS_ROUTER_API_KEY`
- `OPENCLAW_GATEWAY_TOKEN`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `OPENROUTER_API_KEY`

### `/services/webhook-service`

- `WEBHOOK_URL`
- `WEBHOOK_BASE_URL`
- `EVENT_INGEST_API_KEY`
- `CRM_API_URL`
- `CRM_API_KEY`
- `TWILIO_AUTH_TOKEN`
- `SENDGRID_API_KEY`

## Provider Paths

### `/providers/twilio`

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`

### `/providers/sendgrid`

- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `EMAIL_FROM`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`

### `/providers/cloudflare`

- `CLOUDFLARED_TUNNEL_TOKEN`
- `ORCHESTRATOR_TUNNEL_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ZONE_ID_PROJECTNYRA`
- `CLOUDFLARE_ZONE_ID_RATEHUNTER`

### `/providers/github`

- `GITHUB_TOKEN`
- `GITEA_TOKEN`
- `GITEA_RUNNER_TOKEN`

### `/providers/llm`

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`

## Owner Import Order

1. Add provider-real values first: Cloudflare, Supabase, Twenty, Twilio,
   SendGrid, GitHub/Gitea, model providers.
2. Add generated app/service shared secrets next.
3. Add host sidecar bootstrap values last, especially `INFISICAL_TOKEN`.
4. Restart secret-consuming compose stacks after import.
5. Run the validation commands below and record evidence without raw values.

## Validation

```bash
INFISICAL_ENV=prod scripts/infisical/agent-infra-secrets.sh audit
pnpm infra:check:infisical
bash scripts/infra/audit-runtime-security.sh
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config
docker compose -f infra/hosts/orchestrator/docker-compose.yml config
pnpm -C apps/projectnyra test -- production-fail-closed.test.ts
```
