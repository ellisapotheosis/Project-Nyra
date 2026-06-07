# Infisical Master Secret Inventory

Key-name-only routing workbook for Project Nyra secrets. Secret values are not included.

Generated from repo evidence in `infra`, `apps`, `services`, and `config`, then compared against Infisical Cloud (`app.infisical.com`) with the Infisical CLI. This is the trimmed master list: only secret-like variables, auth credentials, encryption keys, provider tokens, Infisical runtime variables, and runtime config that should be centralized through Infisical remain.

## Operator Summary

- Use `app.infisical.com` as the source of truth before rebuilding the local self-hosted Infisical container.
- Keep cloud/operator credentials in `/security/infisical` and self-hosted/local credentials in `/security/infisical/local`.
- The current Cloud comparison is by key name only because the CLI export used by the audit does not return secret paths.
- Keys marked missing from Cloud need routing/value decisions before a complete local import can be trusted.
- Values that are URLs, ports, feature flags, or public-ish runtime config are still included when they are part of the runtime `.env` contract and should be centrally managed with the corresponding service secrets.
- Local self-hosted Infisical reset is currently paused. Do not wipe or recreate more local Infisical state until explicitly re-approved.

## Infisical Self-Hosting Notes

- `INFISICAL_ENCRYPTION_KEY` should be generated with `openssl rand -hex 16`. That is 16 bytes encoded as 32 visible hex characters. Do not shorten it to 16 visible characters.
- Rotating `INFISICAL_ENCRYPTION_KEY` against an existing populated self-hosted database can make existing encrypted rows unreadable. Wiping/recreating the local self-hosted volumes first is the safe migration moment.
- `INFISICAL_LICENSE_KEY` is optional unless you have purchased/received an Infisical license.
- `INFISICAL_GATEWAY_CLIENT_ID` and `INFISICAL_GATEWAY_CLIENT_SECRET` are not random local strings. Create an Infisical Machine Identity, enable Universal Auth, copy the Client ID, create a Client Secret, then store those values in Cloud Infisical.
- Git secret scanning keys (`INFISICAL_SCAN_GIT_APP_ID`, `INFISICAL_SCAN_GIT_PRIVATE_KEY`, `INFISICAL_SCAN_GIT_APP_SLUG`) should come from the configured GitHub App/Radar integration, not from local random generation. `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` can be generated first, then pasted into the GitHub App webhook settings.

## Local vs Cloud Infisical Credentials

Use these groups to avoid mixing the cloud source of truth with the local self-hosted instance.

| Group                             | Keys                                                                                                                                                                                                                                                                                                          | Source                                                                                                 | Use                                                                                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloud operator access             | `INFISICAL_TOKEN`, `INFISICAL_TOKEN_CLOUD`, `INFISICAL_PROJECT_ID`, `INFISICAL_PROJECT_ID_CLOUD`, `INFISICAL_URL`                                                                                                                                                                                             | Existing local operator shell / `app.infisical.com` project settings                                   | Lets CLI jobs read and write the Cloud project. This is for syncing and bootstrapping, not for the local Infisical server process itself.                                                                     |
| Local self-host server bootstrap  | `INFISICAL_DB_USER`, `INFISICAL_DB_NAME`, `INFISICAL_DB_PASSWORD`, `INFISICAL_REDIS_PASSWORD`, `INFISICAL_ENCRYPTION_KEY`, `INFISICAL_AUTH_SECRET`, `INFISICAL_SITE_URL`, `PKI_ENABLED`, `INFISICAL_PKI_KEY_ALGO`, `SSH_CA_ENABLED`, `INFISICAL_SSH_CA_TTL`, `INFISICAL_AUDIT_RETENTION`, `TELEMETRY_ENABLED` | Generated or fixed values stored in Cloud under `/security/infisical/local`                            | Feeds the Docker Compose env file for the local self-hosted Infisical backend, Postgres, and Redis.                                                                                                           |
| Local self-host email             | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_FROM_NAME`                                                                                                                                                                                                                     | SMTP provider such as SendGrid, Postmark, SES, or Gmail app password                                   | Enables local Infisical invites, alerts, password resets, and email MFA. Core secret storage works without it.                                                                                                |
| Local self-host PAM gateway       | `INFISICAL_GATEWAY_CLIENT_ID`, `INFISICAL_GATEWAY_CLIENT_SECRET`                                                                                                                                                                                                                                              | Create inside the same Infisical instance that the gateway connects to, after the backend is running   | Authenticates `infisical/gateway` to the local backend. These are aliases that Docker maps to `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` and `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` inside the gateway container. |
| Cloud or local runtime agent auth | `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`, `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`, `INFISICAL_TOKEN_LOCAL`, `INFISICAL_PROJECT_ID_LOCAL`                                                                                                                                                                         | Machine Identity in Cloud or in local self-hosted Infisical, depending on which API the workload calls | Used by Infisical CLI, agents, sidecars, sync jobs, and workloads. A Cloud identity authenticates to Cloud; a local identity authenticates to local.                                                          |
| Local self-host Git scanning      | `INFISICAL_SCAN_GIT_APP_ID`, `INFISICAL_SCAN_GIT_PRIVATE_KEY`, `INFISICAL_SCAN_GIT_APP_SLUG`, `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`                                                                                                                                                                             | GitHub App/Radar configuration                                                                         | Enables Infisical secret scanning against repositories. Do not generate App ID, slug, or private key as random strings; the webhook secret may be generated before app creation.                              |
| License                           | `INFISICAL_LICENSE_KEY`                                                                                                                                                                                                                                                                                       | Infisical sales/account portal, only if purchased                                                      | Optional for open-source/self-host basics; required only for licensed features.                                                                                                                               |

Current unresolved `/security/infisical/local` values in Cloud `dev`, `stag`, and `prod`: `INFISICAL_GATEWAY_CLIENT_ID`, `INFISICAL_SCAN_GIT_APP_ID`, `INFISICAL_SCAN_GIT_PRIVATE_KEY`, `INFISICAL_SCAN_GIT_APP_SLUG`, and `INFISICAL_LICENSE_KEY`.

SMTP for local self-hosted Infisical is temporarily sourced from `/clients/sendgrid`: `SENDGRID_API_KEY` maps to `SMTP_PASSWORD`, `SMTP_FROM` is `infisical@ratehunter.net`, and `SMTP_FROM_NAME` is sourced from `SENDGRID_FROM_NAME`. `SMTP_HOST`, `SMTP_PORT`, and `SMTP_USERNAME` use SendGrid SMTP defaults. These SMTP values are intentionally identical across Cloud `dev`, `stag`, and `prod`.

## Routing Rules Used

- Provider credentials route under `/providers/*`.
- Host-local infrastructure routes under `/machines/*`.
- App/runtime web credentials route under `/apps/*` where there is a clear app owner.
- Database and memory-store credentials route under `/databases/*` or `/clients/*`.
- Generic names such as `API_KEY`, `JWT_SECRET`, and `DB_PASSWORD` need human routing confirmation because multiple services may define similarly named keys.

## Comparison Status

- Cloud comparison: enabled; 758 key names exported
- Local comparison: not run; set INFISICAL_TOKEN_LOCAL and INFISICAL_PROJECT_ID_LOCAL
- Required secret/config-like keys found in repo: 196

## Missing Keys

| Key                                    | Recommended path         | Missing from cloud | Missing from local | Evidence files                                                                                                                       |
| -------------------------------------- | ------------------------ | ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `ACTIVEPIECES_ENCRYPTION_KEY`          | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                             |
| `ACTIVEPIECES_JWT_SECRET`              | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                             |
| `ANTHROPIC_MAX_TOKENS`                 | `/providers/llm`         | yes                | n/a                | `services/nexus-router/.env.example`                                                                                                 |
| `API_KEY`                              | `/machines/oracle-vps`   | yes                | n/a                | `services/ratehunter-api/.env.example`                                                                                               |
| `API_KEY_EXPIRY`                       | `/machines/oracle-vps`   | yes                | n/a                | `services/auth-service/.env.example`                                                                                                 |
| `API_KEY_HEADER`                       | `/machines/oracle-vps`   | yes                | n/a                | `services/lead-capture-api/.env.example`                                                                                             |
| `API_SECRET_KEY`                       | `/machines/oracle-vps`   | yes                | n/a                | `apps/.env.example`                                                                                                                  |
| `AP_REDIS_PASSWORD`                    | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.yml`          |
| `AUTH_PHRASE`                          | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/scripts/03_destroy.sh`                                                                                       |
| `AWS_SECRET_ACCESS_KEY`                | `/machines/oracle-vps`   | yes                | n/a                | `services/doc-management-api/.env.example`                                                                                           |
| `CERTIFIED_CREDIT_CLIENT_SECRET`       | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                     |
| `CERTIFIED_CREDIT_WEBHOOK_SECRET`      | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                     |
| `CF_TUNNEL_TOKEN`                      | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.template`                                                                                               |
| `CLAWDBOT_GATEWAY_TOKEN`               | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                               |
| `CLEARBIT_API_KEY`                     | `/machines/oracle-vps`   | yes                | n/a                | `services/lead-capture-api/.env.example`                                                                                             |
| `CLERK_SECRET_KEY`                     | `/apps/projectnyra`      | yes                | n/a                | `infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.apps.yml`    |
| `CLICKHOUSE_PASSWORD`                  | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                          |
| `CLOUDFLARED_TOKEN`                    | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                               |
| `CLOUDFLARED_TUNNEL_TOKEN`             | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                               |
| `CLOUDFLARE_COMPATIBILITY_DATE`        | `/providers/cloudflare`  | yes                | n/a                | `config/agents/llxprt-env.example`                                                                                                   |
| `CLOUDFLARE_TUNNEL_TOKEN`              | `/providers/cloudflare`  | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | `/providers/cloudflare`  | yes                | n/a                | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`                                                             |
| `DISCORD_BOT_TOKEN`                    | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/nyra.env.example`<br>`infra/env/openclaw.env.example`                                                                     |
| `DOCUSIGN_PRIVATE_KEY_PATH`            | `/machines/oracle-vps`   | yes                | n/a                | `services/doc-management-api/.env.example`                                                                                           |
| `EMAIL_PASSWORD`                       | `/machines/oracle-vps`   | yes                | n/a                | `services/ratehunter-api/.env.example`                                                                                               |
| `EQUIFAX_CLIENT_SECRET`                | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                     |
| `EQUIFAX_WEBHOOK_SECRET`               | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                     |
| `GEMINI_API_KEY`                       | `/providers/llm`         | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                               |
| `GEMINI_MAX_TOKENS`                    | `/providers/llm`         | yes                | n/a                | `services/nexus-router/.env.example`                                                                                                 |
| `GITEA_ADMIN_PASSWORD`                 | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `GITEA_RUNNER_REGISTRATION_TOKEN`      | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `GOOGLE_API_KEY`                       | `/providers/llm`         | yes                | n/a                | `config/agents/llxprt-env.example`<br>`infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`                       |
| `GOOGLE_CLIENT_SECRET`                 | `/providers/llm`         | yes                | n/a                | `services/auth-service/.env.example`                                                                                                 |
| `GRAFANA_PASSWORD`                     | `/machines/orchestrator` | yes                | n/a                | `services/litellm-proxy/.env.example`                                                                                                |
| `GROQ_API_KEY`                         | `/providers/llm`         | yes                | n/a                | `config/agents/llxprt-env.example`<br>`infra/env/openclaw-unmute.env.example`<br>`infra/env/openclaw.voice.env.example`              |
| `HASS_LONG_LIVED_TOKEN`                | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/.env.homeassistant-green.example`                                                                                         |
| `INFISICAL_CLIENT_ID`                  | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `INFISICAL_CLIENT_SECRET`              | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `INFISICAL_ENVIRONMENT`                | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.template`                                                                                               |
| `INFISICAL_EXPORT_INTERVAL_SECONDS`    | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/_templates/docker-compose.infisical-runtime.yml`                                                                        |
| `INFISICAL_GATEWAY_CLIENT_ID`          | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_GATEWAY_CLIENT_SECRET`      | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_LICENSE_KEY`                | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_MCP_PORT`                   | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/host-service-plan.yaml`                                                                                                 |
| `INFISICAL_POLL_INTERVAL`              | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`<br>`infra/hosts/oracle-vps/.env.example` |
| `INFISICAL_PORT`                       | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.infisical.template`<br>`infra/hosts/host-service-plan.yaml`                                             |
| `INFISICAL_SCAN_GIT_APP_ID`            | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_SCAN_GIT_APP_SLUG`          | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_SCAN_GIT_PRIVATE_KEY`       | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`    | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                            |
| `INFI_CLIENT_SECRET`                   | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/openclaw.env.example`                                                                                                     |
| `KIMI_API_KEY`                         | `/machines/oracle-vps`   | yes                | n/a                | `config/agents/llxprt-env.example`                                                                                                   |
| `LLXPRT_JEFE_API_KEY`                  | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                          |
| `MEMRADER_API_KEY`                     | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.memory-extra.yml`                                                                             |
| `MICROSOFT_CLIENT_SECRET`              | `/machines/oracle-vps`   | yes                | n/a                | `services/auth-service/.env.example`                                                                                                 |
| `MOS_EMBEDDER_API_KEY`                 | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.memory-extra.yml`                                                                             |
| `NEXT_PUBLIC_NYRA_DEMO_AUTH`           | `/apps/projectnyra`      | yes                | n/a                | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                               |
| `NEXUS_MASTER_KEY`                     | `/machines/orchestrator` | yes                | n/a                | `config/agents/llxprt-env.example`                                                                                                   |
| `NYRA_CHAT_INTERNAL_PROXY_TOKEN`       | `/machines/oracle-vps`   | yes                | n/a                | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                               |
| `NYRA_FORCE_SECRETS`                   | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`                                          |
| `NYRA_STATUS_BRIDGE_TOKEN`             | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/docker-compose.status-bridge.yml`                                                                          |
| `NYRA_WEBHOOK_SECRET`                  | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/.env.twenty.example`                                                                                         |
| `NYRA_WORKER_API_KEY`                  | `/machines/oracle-vps`   | yes                | n/a                | `config/agents/llxprt-env.example`                                                                                                   |
| `OPENAI_MAX_TOKENS`                    | `/providers/llm`         | yes                | n/a                | `services/nexus-router/.env.example`                                                                                                 |
| `OPENCLAW_SECRET_REF_MODE`             | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/nyra.env.example`                                                                                                         |
| `OPENLIT_GITHUB_CLIENT_SECRET`         | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                 |
| `OPENLIT_GOOGLE_CLIENT_SECRET`         | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                 |
| `OPENLIT_NEXTAUTH_URL`                 | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                 |
| `OPEN_WEBUI_BOT_PASSWORD`              | `/machines/oracle-vps`   | yes                | n/a                | `services/openclaw/entrypoint.sh`                                                                                                    |
| `PAPERCLIP_API_KEY`                    | `/machines/oracle-vps`   | yes                | n/a                | `apps/.env.example`<br>`apps/twentycrm/package.json`<br>`infra/hosts/oracle-vps/.env.example`                                        |
| `PAPERCLIP_AUTH_DISABLE_SIGN_UP`       | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                        |
| `PASSWORD_RESET_EXPIRY`                | `/machines/oracle-vps`   | yes                | n/a                | `services/auth-service/.env.example`                                                                                                 |
| `POSTGRES_PASSWORD_URLENCODED`         | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                          |
| `PRIVATE_KEY_PATH`                     | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/scripts/00_prereq_check.sh`                                                                                  |
| `RUVECTOR_POSTGRES_PASSWORD`           | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                             |
| `SMTP_PASSWORD`                        | `/machines/oracle-vps`   | yes                | n/a                | `apps/.env.example`<br>`infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`     |
| `SUPABASE_AUTH_EXTERNAL_URL`           | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                          |
| `SUPABASE_DB_URL_PASSWORD`             | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                          |
| `SUPABASE_JWT_SECRET`                  | `/machines/oracle-vps`   | yes                | n/a                | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                               |
| `SUPERSET_ADMIN_PASSWORD`              | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.superset.yml`                                                                                 |
| `SUPERSET_SECRET_KEY`                  | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/oracle-vps/docker-compose.superset.yml`                                                                                 |
| `TAILSCALE_ENABLED`                    | `/base`                  | yes                | n/a                | `infra/env/environments/.env.orchestrator.template`<br>`infra/env/environments/.env.template`                                        |
| `TAILSCALE_HOSTNAME`                   | `/base`                  | yes                | n/a                | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                               |
| `TAILSCALE_IP`                         | `/base`                  | yes                | n/a                | `infra/env/.env.homeassistant-green.example`<br>`infra/env/.env.worker-rtx3060.example`<br>`infra/env/.env.worker-rtx3090ti.example` |
| `TAILSCALE_KEY`                        | `/base`                  | yes                | n/a                | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                               |
| `TELEGRAM_BOT_TOKEN`                   | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/nyra.env.example`<br>`infra/env/openclaw.env.example`                                                                     |
| `TUNNEL_TOKEN`                         | `/machines/oracle-vps`   | yes                | n/a                | `infra/hosts/orchestrator/docker-compose.cloudflared.yml`                                                                            |
| `TWENTYCRM_WEBHOOK_SECRET`             | `/machines/oracle-vps`   | yes                | n/a                | `services/twentycrm-integration/.env.example`                                                                                        |
| `TWENTY_POSTGRES_PASSWORD`             | `/machines/oracle-vps`   | yes                | n/a                | `infra/env/.env.template`                                                                                                            |
| `WORKER_3060_API_KEY`                  | `/machines/worker-*`     | yes                | n/a                | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml`                                                 |
| `WORKER_3090_API_KEY`                  | `/machines/worker-*`     | yes                | n/a                | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml`                                                 |
| `WORKER_5090_API_KEY`                  | `/machines/worker-*`     | yes                | n/a                | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml`                                                 |

## Required Keys By Recommended Path

### `/apps/projectnyra`

| Key                          | Evidence files                                                                                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `CLERK_SECRET_KEY`           | `infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.apps.yml` |
| `NEXT_PUBLIC_NYRA_DEMO_AUTH` | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                            |

### `/base`

| Key                  | Evidence files                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `TAILSCALE_AUTHKEY`  | `infra/env/environments/.env.template`<br>`infra/hosts/worker-rtx3060/.env.example`<br>`infra/hosts/worker-rtx3090ti/.env.example`   |
| `TAILSCALE_ENABLED`  | `infra/env/environments/.env.orchestrator.template`<br>`infra/env/environments/.env.template`                                        |
| `TAILSCALE_HOSTNAME` | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                               |
| `TAILSCALE_IP`       | `infra/env/.env.homeassistant-green.example`<br>`infra/env/.env.worker-rtx3060.example`<br>`infra/env/.env.worker-rtx3090ti.example` |
| `TAILSCALE_KEY`      | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                               |

### `/clients/composio`

| Key                | Evidence files                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `COMPOSIO_API_KEY` | `infra/env/composio.env.example`<br>`infra/env/environments/voice-mesh.example.env`<br>`infra/hosts/oracle-vps/docker-compose.paperclip.yml` |

### `/clients/letta`

| Key                     | Evidence files                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `LETTA_DB_PASSWORD`     | `infra/env/environments/memory.example.env`<br>`infra/hosts/oracle-vps/docker-compose.memory.yml`                                              |
| `LETTA_SERVER_PASSWORD` | `infra/env/environments/memory.example.env`<br>`infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/docker-compose.letta-mcp.yml` |

### `/clients/mem0`

| Key            | Evidence files                                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `MEM0_API_KEY` | `infra/env/openclaw-unmute.env.example`<br>`infra/env/openclaw.env.example`<br>`infra/hosts/worker-rtx3090ti/docker-compose.assistant.yml` |

### `/databases/falkordb`

| Key                 | Evidence files                         |
| ------------------- | -------------------------------------- |
| `FALKORDB_PASSWORD` | `infra/env/environments/.env.template` |

### `/databases/qdrant-local`

| Key              | Evidence files                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| `QDRANT_API_KEY` | `infra/env/environments/memory.example.env`<br>`infra/hosts/oracle-vps/docker-compose.memory.yml` |

### `/machines/oracle-vps`

| Key                                      | Evidence files                                                                                                                                                                                              |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ACTIVEPIECES_API_KEY`                   | `infra/env/openclaw.env.example`<br>`infra/hosts/oracle-vps/docker-compose.activepieces-mcp.yml`<br>`infra/hosts/oracle-vps/docker-compose.restoration.yml`                                                 |
| `ACTIVEPIECES_ENCRYPTION_KEY`            | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `ACTIVEPIECES_JWT_SECRET`                | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `AGENT_VAULT_MASTER_PASSWORD`            | `infra/hosts/oracle-vps/.env.agent-vault.template`                                                                                                                                                          |
| `API_KEY`                                | `services/ratehunter-api/.env.example`                                                                                                                                                                      |
| `API_KEY_EXPIRY`                         | `services/auth-service/.env.example`                                                                                                                                                                        |
| `API_KEY_HEADER`                         | `services/lead-capture-api/.env.example`                                                                                                                                                                    |
| `API_SECRET_KEY`                         | `apps/.env.example`                                                                                                                                                                                         |
| `AP_ENCRYPTION_KEY`                      | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`<br>`infra/hosts/oracle-vps/config.yml`                                                                               |
| `AP_JWT_SECRET`                          | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`<br>`infra/hosts/oracle-vps/config.yml`                                                                               |
| `AP_POSTGRES_PASSWORD`                   | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`<br>`infra/hosts/oracle-vps/config.yml`                                                                               |
| `AP_REDIS_PASSWORD`                      | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                 |
| `AUTH_PHRASE`                            | `infra/hosts/oracle-vps/scripts/03_destroy.sh`                                                                                                                                                              |
| `AWS_SECRET_ACCESS_KEY`                  | `services/doc-management-api/.env.example`                                                                                                                                                                  |
| `BETTER_AUTH_SECRET`                     | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `BROWSERLESS_TOKEN`                      | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                                                     |
| `CERTIFIED_CREDIT_CLIENT_SECRET`         | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                                                                                            |
| `CERTIFIED_CREDIT_WEBHOOK_SECRET`        | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                                                                                            |
| `CF_TUNNEL_TOKEN`                        | `infra/hosts/oracle-vps/.env.template`                                                                                                                                                                      |
| `CLAWDBOT_GATEWAY_TOKEN`                 | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                                                                                                      |
| `CLEARBIT_API_KEY`                       | `services/lead-capture-api/.env.example`                                                                                                                                                                    |
| `CLICKHOUSE_PASSWORD`                    | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `CLOUDFLARED_TOKEN`                      | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                                                                                                      |
| `CLOUDFLARED_TUNNEL_TOKEN`               | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                                                                                                      |
| `CRM_API_KEY`                            | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`infra/hosts/oracle-vps/config.yml`                                                                                                               |
| `DB_PASSWORD`                            | `services/doc-management-api/.env.example`<br>`services/lead-capture-api/.env.example`<br>`services/rate-comparison-engine/.env.example`                                                                    |
| `DISCORD_BOT_TOKEN`                      | `infra/env/nyra.env.example`<br>`infra/env/openclaw.env.example`                                                                                                                                            |
| `DOCUSIGN_PRIVATE_KEY_PATH`              | `services/doc-management-api/.env.example`                                                                                                                                                                  |
| `EMAIL_PASSWORD`                         | `services/ratehunter-api/.env.example`                                                                                                                                                                      |
| `ENCRYPTION_KEY`                         | `services/security-service/.env.example`                                                                                                                                                                    |
| `EQUIFAX_CLIENT_SECRET`                  | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                                                                                            |
| `EQUIFAX_WEBHOOK_SECRET`                 | `infra/hosts/orchestrator/.env.nyra_staging.example`<br>`services/soft-pull-credit/.env.example`                                                                                                            |
| `EVENT_INGEST_API_KEY`                   | `services/websocket-hub/.env.example`                                                                                                                                                                       |
| `FIRECRAWL_API_KEY`                      | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `GITEA_ADMIN_PASSWORD`                   | `infra/env/environments/.env.template`                                                                                                                                                                      |
| `GITEA_DB_PASSWORD`                      | `infra/env/environments/.env.template`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                        |
| `GITEA_INTERNAL_TOKEN`                   | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                                                                  |
| `GITEA_JWT_SECRET`                       | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                        |
| `GITEA_RUNNER_REGISTRATION_TOKEN`        | `infra/env/environments/.env.template`                                                                                                                                                                      |
| `GITEA_RUNNER_TOKEN`                     | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                           |
| `GITEA_SECRET_KEY`                       | `infra/env/environments/.env.template`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.template`                                                                                   |
| `GITEA_TOKEN`                            | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                           |
| `GITHUB_TOKEN`                           | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.gitea.yml`                                                                           |
| `HASS_LONG_LIVED_TOKEN`                  | `infra/env/.env.homeassistant-green.example`                                                                                                                                                                |
| `HF_TOKEN`                               | `infra/hosts/worker-rtx3090ti/docker-compose.yml`<br>`infra/hosts/worker-rtx5090/docker-compose.yml`                                                                                                        |
| `HOMEASSISTANT_TOKEN`                    | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `INFISICAL_API_URL`                      | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`                                                                                                                 |
| `INFISICAL_AUDIT_RETENTION`              | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_AUTH_SECRET`                  | `infra/env/environments/.env.infisical.template`<br>`infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                               |
| `INFISICAL_CLIENT_ID`                    | `infra/env/environments/.env.template`                                                                                                                                                                      |
| `INFISICAL_CLIENT_SECRET`                | `infra/env/environments/.env.template`                                                                                                                                                                      |
| `INFISICAL_DB_NAME`                      | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_DB_PASSWORD`                  | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_DB_USER`                      | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_ENCRYPTION_KEY`               | `infra/env/environments/.env.infisical.template`<br>`infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                               |
| `INFISICAL_ENV`                          | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`<br>`infra/hosts/_templates/docker-compose.infisical-runtime.yml`                                                |
| `INFISICAL_ENVIRONMENT`                  | `infra/env/environments/.env.template`                                                                                                                                                                      |
| `INFISICAL_EXPORT_INTERVAL_SECONDS`      | `infra/hosts/_templates/docker-compose.infisical-runtime.yml`                                                                                                                                               |
| `INFISICAL_GATEWAY_CLIENT_ID`            | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_GATEWAY_CLIENT_SECRET`        | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_LICENSE_KEY`                  | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_MCP_PORT`                     | `infra/hosts/host-service-plan.yaml`                                                                                                                                                                        |
| `INFISICAL_PATH`                         | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`<br>`infra/hosts/oracle-vps/.env.example`                                                                        |
| `INFISICAL_PKI_KEY_ALGO`                 | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_POLL_INTERVAL`                | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`<br>`infra/hosts/oracle-vps/.env.example`                                                                        |
| `INFISICAL_PORT`                         | `infra/env/environments/.env.infisical.template`<br>`infra/hosts/host-service-plan.yaml`                                                                                                                    |
| `INFISICAL_POSTGRES_DB`                  | `infra/env/environments/.env.infisical.template`                                                                                                                                                            |
| `INFISICAL_POSTGRES_PASSWORD`            | `infra/env/environments/.env.infisical.template`                                                                                                                                                            |
| `INFISICAL_POSTGRES_USER`                | `infra/env/environments/.env.infisical.template`                                                                                                                                                            |
| `INFISICAL_PROJECT_ID`                   | `config/agents/llxprt-env.example`<br>`infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`                                                                           |
| `INFISICAL_REDIS_PASSWORD`               | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_SCAN_GIT_APP_ID`              | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_SCAN_GIT_APP_SLUG`            | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_SCAN_GIT_PRIVATE_KEY`         | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`      | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_SITE_URL`                     | `infra/env/environments/.env.infisical.template`<br>`infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                               |
| `INFISICAL_SSH_CA_TTL`                   | `infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                                                   |
| `INFISICAL_TOKEN`                        | `infra/hosts/_templates/docker-compose.infisical-runtime.yml`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/config.yml`                                                               |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`     | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `INFI_CLIENT_SECRET`                     | `infra/env/openclaw.env.example`                                                                                                                                                                            |
| `JWT_REFRESH_SECRET`                     | `services/auth-service/.env.example`                                                                                                                                                                        |
| `JWT_SECRET`                             | `infra/env/environments/.env.template`<br>`infra/hosts/oracle-vps/docker-compose.yml`<br>`services/auth-service/.env.example`                                                                               |
| `KIMI_API_KEY`                           | `config/agents/llxprt-env.example`                                                                                                                                                                          |
| `LEAD_INGESTION_API_KEY`                 | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                                                                                                      |
| `LITELLM_API_KEY`                        | `infra/env/environments/.env.template`<br>`infra/env/environments/voice-mesh.example.env`                                                                                                                   |
| `LITELLM_MASTER_KEY`                     | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`infra/env/.env.template`                                                                                                                         |
| `LLXPRT_BRIDGE_API_KEY`                  | `config/agents/llxprt-env.example`<br>`infra/hosts/oracle-vps/docker-compose.restoration.yml`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                |
| `LLXPRT_JEFE_API_KEY`                    | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `MEMRADER_API_KEY`                       | `infra/hosts/oracle-vps/docker-compose.memory-extra.yml`                                                                                                                                                    |
| `MICROSOFT_CLIENT_SECRET`                | `services/auth-service/.env.example`                                                                                                                                                                        |
| `MONGO_ROOT_PASSWORD`                    | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `MOS_EMBEDDER_API_KEY`                   | `infra/hosts/oracle-vps/docker-compose.memory-extra.yml`                                                                                                                                                    |
| `N8N_API_KEY`                            | `infra/env/openclaw.env.example`<br>`services/campaign-engine/.env.example`                                                                                                                                 |
| `N8N_BASIC_AUTH_ACTIVE`                  | `infra/env/.env.template`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                                                                         |
| `N8N_BASIC_AUTH_PASSWORD`                | `infra/env/.env.template`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                                                                         |
| `N8N_BASIC_AUTH_USER`                    | `infra/env/.env.template`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                                                                         |
| `N8N_ENCRYPTION_KEY`                     | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/environments/.env.template`                                                                                          |
| `NYRA_CHAT_INTERNAL_PROXY_TOKEN`         | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                                                                                                      |
| `NYRA_FORCE_SECRETS`                     | `infra/env/environments/.env.gitea.example`<br>`infra/env/environments/.env.gitea.template`                                                                                                                 |
| `NYRA_STATUS_BRIDGE_TOKEN`               | `infra/hosts/orchestrator/docker-compose.status-bridge.yml`                                                                                                                                                 |
| `NYRA_WEBHOOK_SECRET`                    | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `NYRA_WORKER_API_KEY`                    | `config/agents/llxprt-env.example`                                                                                                                                                                          |
| `OPENCLAW_BORROWER_API_KEY`              | `apps/.env.example`                                                                                                                                                                                         |
| `OPENCLAW_GATEWAY_TOKEN`                 | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`apps/projectnyra/src/app/api/internal/openclaw/chat/route.ts`                                                                                    |
| `OPENCLAW_SECRET_REF_MODE`               | `infra/env/nyra.env.example`                                                                                                                                                                                |
| `OPENLIT_DB_PASSWORD`                    | `apps/.env.example`<br>`apps/twentycrm/package.json`<br>`infra/hosts/oracle-vps/.env.example`                                                                                                               |
| `OPENLIT_GITHUB_CLIENT_SECRET`           | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `OPENLIT_GOOGLE_CLIENT_SECRET`           | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `OPENLIT_NEXTAUTH_SECRET`                | `apps/.env.example`<br>`apps/twentycrm/package.json`<br>`infra/hosts/oracle-vps/.env.example`                                                                                                               |
| `OPENLIT_NEXTAUTH_URL`                   | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `OPENLIT_VAULT_ENCRYPTION_KEY`           | `apps/.env.example`<br>`apps/twentycrm/package.json`<br>`infra/hosts/oracle-vps/.env.example`                                                                                                               |
| `OPENWEBUI_SECRET_KEY`                   | `infra/hosts/oracle-vps/.env.oracle.template`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                         |
| `OPEN_WEBUI_BOT_PASSWORD`                | `services/openclaw/entrypoint.sh`                                                                                                                                                                           |
| `ORACLE_TUNNEL_TOKEN`                    | `infra/hosts/oracle-vps/.env.template`<br>`infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                |
| `ORCHESTRATOR_TUNNEL_TOKEN`              | `infra/hosts/orchestrator/.env.example`<br>`infra/hosts/orchestrator/docker-compose.cloudflared.yml`                                                                                                        |
| `PAPERCLIP_AGENT_JWT_SECRET`             | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                        |
| `PAPERCLIP_API_KEY`                      | `apps/.env.example`<br>`apps/twentycrm/package.json`<br>`infra/hosts/oracle-vps/.env.example`                                                                                                               |
| `PAPERCLIP_AUTH_DISABLE_SIGN_UP`         | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                                                                                               |
| `PAPERCLIP_DB_PASSWORD`                  | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                                                      |
| `PAPERCLIP_SESSION_SECRET`               | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                                                                                               |
| `PASSWORD_RESET_EXPIRY`                  | `services/auth-service/.env.example`                                                                                                                                                                        |
| `PORTAINER_ADMIN_PASSWORD`               | `infra/hosts/oracle-vps/config.yml`<br>`infra/hosts/orchestrator/portainer-mesh/.env.portainer.orchestrator.example`<br>`infra/hosts/orchestrator/portainer-mesh/docker-compose.portainer.orchestrator.yml` |
| `POSTGRES_PASSWORD`                      | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/environments/.env.template`                                                                                          |
| `POSTGRES_PASSWORD_URLENCODED`           | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `PRIVATE_KEY_PATH`                       | `infra/hosts/oracle-vps/scripts/00_prereq_check.sh`                                                                                                                                                         |
| `QUOTE_API_SECRET`                       | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`apps/projectnyra/src/app/api/quotes/generate/route.ts`                                                                                           |
| `REDIS_PASSWORD`                         | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/environments/.env.template`                                                                                          |
| `RUVECTOR_POSTGRES_PASSWORD`             | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `SEARXNG_SECRET`                         | `infra/env/environments/oracle-agent-utils.example.env`<br>`infra/hosts/oracle-vps/docker-compose.oracle.yml`                                                                                               |
| `SMTP_PASSWORD`                          | `apps/.env.example`<br>`infra/hosts/oracle-vps/.env.infisical.template`<br>`infra/hosts/oracle-vps/docker-compose.infisical.yml`                                                                            |
| `SUPABASE_AUTH_EXTERNAL_URL`             | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `SUPABASE_DB_PASSWORD`                   | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `SUPABASE_DB_URL_PASSWORD`               | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `SUPABASE_JWT_SECRET`                    | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                                                                                                      |
| `SUPERSET_ADMIN_PASSWORD`                | `infra/hosts/oracle-vps/docker-compose.superset.yml`                                                                                                                                                        |
| `SUPERSET_SECRET_KEY`                    | `infra/hosts/oracle-vps/docker-compose.superset.yml`                                                                                                                                                        |
| `TAVILY_API_KEY`                         | `infra/hosts/oracle-vps/docker-compose.yml`                                                                                                                                                                 |
| `TELEGRAM_BOT_TOKEN`                     | `infra/env/nyra.env.example`<br>`infra/env/openclaw.env.example`                                                                                                                                            |
| `TUNNEL_TOKEN`                           | `infra/hosts/orchestrator/docker-compose.cloudflared.yml`                                                                                                                                                   |
| `TWENTYCRM_API_KEY`                      | `infra/env/.env.template`<br>`infra/env/nyra.env.example`<br>`infra/hosts/oracle-vps/config.yml`                                                                                                            |
| `TWENTYCRM_WEBHOOK_SECRET`               | `services/twentycrm-integration/.env.example`                                                                                                                                                               |
| `TWENTY_ACCESS_TOKEN`                    | `apps/.env.example`<br>`apps/projectnyra/.env.example`                                                                                                                                                      |
| `TWENTY_ACCESS_TOKEN_SECRET`             | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `TWENTY_API_KEY`                         | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`infra/env/openclaw.env.example`                                                                                                                  |
| `TWENTY_APP_SECRET`                      | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`infra/hosts/oracle-vps/.env.example`                                                                                                             |
| `TWENTY_CRM_API_KEY`                     | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`apps/projectnyra/lib/crm-data.ts`                                                                                                                |
| `TWENTY_DB_PASSWORD`                     | `apps/.env.example`<br>`apps/projectnyra/.env.example`<br>`infra/env/environments/.env.twenty.example`                                                                                                      |
| `TWENTY_ENCRYPTION_SECRET`               | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `TWENTY_FILE_TOKEN_SECRET`               | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `TWENTY_JWT_SECRET`                      | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `TWENTY_LOGIN_TOKEN_SECRET`              | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `TWENTY_PASSWORD_SALT`                   | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`                                                                                                    |
| `TWENTY_POSTGRES_PASSWORD`               | `infra/env/.env.template`                                                                                                                                                                                   |
| `TWENTY_REDIS_PASSWORD`                  | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `TWENTY_REFRESH_TOKEN_SECRET`            | `infra/env/environments/.env.twenty.example`                                                                                                                                                                |
| `UNMUTE_OPENAI_API_KEY`                  | `infra/env/openclaw-unmute.env.example`<br>`infra/env/openclaw.voice.env.example`<br>`infra/hosts/worker-rtx3060/.env.example`                                                                              |

### `/machines/orchestrator`

| Key                      | Evidence files                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `GRAFANA_ADMIN_PASSWORD` | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`<br>`infra/env/environments/.env.template`         |
| `GRAFANA_PASSWORD`       | `services/litellm-proxy/.env.example`                                                                                      |
| `NEXUS_ADMIN_TOKEN`      | `infra/env/environments/.env.stack.example`<br>`infra/env/nyra.env.example`<br>`infra/hosts/worker-rtx3090ti/.env.example` |
| `NEXUS_JWT_SECRET`       | `infra/hosts/worker-rtx5090/.env.worker-5090.template`                                                                     |
| `NEXUS_MASTER_KEY`       | `config/agents/llxprt-env.example`                                                                                         |
| `NEXUS_ROUTER_API_KEY`   | `services/websocket-hub/.env.example`                                                                                      |

### `/machines/worker-*`

| Key                   | Evidence files                                                                       |
| --------------------- | ------------------------------------------------------------------------------------ |
| `WORKER_3060_API_KEY` | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml` |
| `WORKER_3090_API_KEY` | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml` |
| `WORKER_5090_API_KEY` | `services/litellm-proxy/.env.example`<br>`services/litellm-proxy/config/config.yaml` |

### `/providers/cloudflare`

| Key                                    | Evidence files                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CLOUDFLARE_ACCOUNT_ID`                | `apps/.env.example`                                                                                          |
| `CLOUDFLARE_API_TOKEN`                 | `apps/.env.example`<br>`infra/env/environments/.env.template`<br>`infra/hosts/oracle-vps/docker-compose.yml` |
| `CLOUDFLARE_COMPATIBILITY_DATE`        | `config/agents/llxprt-env.example`                                                                           |
| `CLOUDFLARE_TUNNEL_TOKEN`              | `infra/env/environments/.env.template`                                                                       |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | `infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`                                     |
| `CLOUDFLARE_ZONE_ID`                   | `infra/env/environments/.env.template`                                                                       |

### `/providers/llm`

| Key                    | Evidence files                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY`    | `config/agents/llxprt-env.example`<br>`infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`          |
| `ANTHROPIC_MAX_TOKENS` | `services/nexus-router/.env.example`                                                                                    |
| `GEMINI_API_KEY`       | `infra/hosts/oracle-vps/.env.example`<br>`infra/hosts/oracle-vps/.env.oracle.template`                                  |
| `GEMINI_MAX_TOKENS`    | `services/nexus-router/.env.example`                                                                                    |
| `GOOGLE_API_KEY`       | `config/agents/llxprt-env.example`<br>`infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`          |
| `GOOGLE_CLIENT_SECRET` | `services/auth-service/.env.example`                                                                                    |
| `GROQ_API_KEY`         | `config/agents/llxprt-env.example`<br>`infra/env/openclaw-unmute.env.example`<br>`infra/env/openclaw.voice.env.example` |
| `OPENAI_API_KEY`       | `config/agents/llxprt-env.example`<br>`infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`          |
| `OPENAI_MAX_TOKENS`    | `services/nexus-router/.env.example`                                                                                    |
| `OPENROUTER_API_KEY`   | `config/agents/llxprt-env.example`<br>`infra/env/.env.template`<br>`infra/env/environments/.env.stack.example`          |

### `/providers/sendgrid`

| Key                | Evidence files                         |
| ------------------ | -------------------------------------- |
| `SENDGRID_API_KEY` | `services/campaign-engine/app/main.py` |

### `/providers/twilio`

| Key                 | Evidence files                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `TWILIO_AUTH_TOKEN` | `services/campaign-engine/app/main.py`<br>`services/mortgage-assistant-api/.env.example` |

## Operator Notes

- Add values in Infisical using the recommended path unless a more specific owner path already exists.
- Keep `/shared` link-only; do not write runtime secrets there directly.
- For self-hosted/cloud parity, run `make infisical-cloud-status` first, then `make infisical-cloud-dry-run` before any sync.
