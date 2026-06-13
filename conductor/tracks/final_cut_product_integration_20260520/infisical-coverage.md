# Infisical Coverage Map

## Purpose

Track the Project Nyra secret paths that must exist before production smoke. This file intentionally lists secret names only. Generated temporary values are kept outside the repo at `/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`.

## Required Paths

| Path                              | Purpose                                                                                       | Required before smoke                |
| --------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------ |
| `/machines/oracle-vps`            | Oracle VPS host stack, Twenty, Activepieces, n8n, OpenLIT, Gitea, Paperclip, Supabase surface | Yes                                  |
| `/machines/orchestrator`          | Nexus Router, LiteLLM, Cloudflare tunnel, Grafana, status bridge                              | Yes                                  |
| `/machines/worker-rtx5090`        | Primary private GPU worker and bridge keys                                                    | Before worker smoke                  |
| `/machines/worker-rtx3090ti`      | Secondary private GPU worker and bridge keys                                                  | Before worker smoke                  |
| `/machines/worker-rtx3060`        | Utility/Ollama worker and bridge keys                                                         | Before worker smoke                  |
| `/apps/projectnyra`               | Internal app service URLs, Supabase public config, server-side service tokens                 | Yes                                  |
| `/apps/ratehunter`                | Public landing contact and borrower chat proxy only                                           | Before RateHunter contact/chat smoke |
| `/services/crm-api`               | Twenty CRM write boundary and audit ledger                                                    | Yes                                  |
| `/services/lead-ingestion`        | Lead normalization and CRM write-plan submitter                                               | Yes                                  |
| `/services/campaign-engine`       | Campaign state machine, scheduler, n8n/Activepieces dispatch                                  | Yes                                  |
| `/services/quote-service`         | Deterministic quote API and quote history                                                     | Yes                                  |
| `/services/communication-service` | Twilio/SendGrid callbacks and logging                                                         | Before outbound comms smoke          |
| `/services/auth-service`          | JWT/OAuth auth service if retained alongside Supabase                                         | Before auth-service smoke            |
| `/providers/twilio`               | Twilio account, auth, phone, API credentials                                                  | Before SMS/voice                     |
| `/providers/sendgrid`             | SendGrid API and verified sender/domain                                                       | Before email                         |
| `/providers/cloudflare`           | Cloudflare account/zone/tunnel/API token                                                      | Before ingress smoke                 |
| `/providers/github`               | GitHub token only where mirror/automation still requires it                                   | Optional                             |
| `/providers/llm`                  | OpenAI, Anthropic, Gemini, OpenRouter keys                                                    | Before cloud routing smoke           |

## Core Secret Names

- `CRM_API_KEY`
- `LEAD_INGESTION_API_KEY`
- `QUOTE_API_SECRET`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN`
- `OPENCLAW_GATEWAY_TOKEN`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_API_KEY`
- `DATABASE_URL`
- `POSTGRES_PASSWORD`
- `TWENTY_APP_SECRET`
- `AP_ENCRYPTION_KEY`
- `AP_JWT_SECRET`
- `N8N_API_KEY`
- `N8N_ENCRYPTION_KEY`
- `N8N_BASIC_AUTH_PASSWORD`
- `ACTIVEPIECES_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `SENDGRID_API_KEY`
- `OPENLIT_NEXTAUTH_SECRET`
- `OPENLIT_VAULT_ENCRYPTION_KEY`
- `OPENLIT_DB_PASSWORD`
- `PAPERCLIP_API_KEY`
- `PAPERCLIP_AGENT_JWT_SECRET`
- `BETTER_AUTH_SECRET`
- `GITEA_SECRET_KEY`
- `GITEA_INTERNAL_TOKEN`
- `GITEA_JWT_SECRET`
- `GITEA_DB_PASSWORD`
- `GITEA_RUNNER_TOKEN`
- `GITHUB_TOKEN`
- `CLOUDFLARED_TUNNEL_TOKEN`
- `ORCHESTRATOR_TUNNEL_TOKEN`
- `NEXUS_ROUTER_API_KEY`
- `EVENT_INGEST_API_KEY`
- `NYRA_STATUS_BRIDGE_TOKEN`
- `LITELLM_MASTER_KEY`
- `LITELLM_API_KEY`
- `LLXPRT_BRIDGE_API_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `OPENROUTER_API_KEY`

## Validation

Run after Infisical import:

```bash
INFISICAL_ENV=prod scripts/infisical/agent-infra-secrets.sh audit
bash scripts/infra/audit-runtime-security.sh
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config
docker compose -f infra/hosts/orchestrator/docker-compose.yml config
pnpm -C apps/projectnyra test -- production-fail-closed.test.ts
```
