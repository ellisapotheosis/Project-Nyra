# ToDo Add To Infisical

This is the current canonical checklist of variables referenced by the host compose files under `infra/hosts/`.

Use this as the source of truth for:
- secrets that should exist in Infisical
- non-secret runtime env that still must be injected before `docker compose`
- variables that currently generate warnings when missing

Notes:
- `PORTAINER_EDGE_ID` and `PORTAINER_EDGE_KEY` are currently missing and produce warnings.
- `AP_FRONTEND_URL` is currently missing and produces warnings for Oracle `activepieces`.
- `version:` was removed from `infra/hosts/oracle-vps/docker-compose.apps.yml`; that warning should stop.
- Variables with safe defaults are listed for completeness, but they do not all need Infisical entries.

## Immediate Missing / High Priority

These should be present now because they are either warning today or are core runtime secrets.

### Oracle VPS

- `ORACLE_TUNNEL_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `PORTAINER_ADMIN_PASSWORD`
- `AP_ENCRYPTION_KEY`
- `AP_JWT_SECRET`
- `AP_POSTGRES_PASSWORD`
- `GRAFANA_ADMIN_PASSWORD`
- `N8N_BASIC_AUTH_PASSWORD`
- `N8N_ENCRYPTION_KEY`
- `N8N_HOST`
- `WEBHOOK_URL`
- `TWENTY_APP_SECRET`
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_FRONTEND_URL`
- `TWENTY_SERVER_URL`
- `QUOTE_API_SECRET`
- `OPENWEBUI_SECRET_KEY`
- `LITELLM_MASTER_KEY`
- `OPENROUTER_API_KEY`

### Orchestrator

- `ORCHESTRATOR_TUNNEL_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `PORTAINER_ADMIN_PASSWORD`
- `LITELLM_MASTER_KEY`

### Shared / Worker Auth

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`

## Oracle VPS

### Secrets

- `ANTHROPIC_API_KEY`
- `AP_ENCRYPTION_KEY`
- `AP_JWT_SECRET`
- `AP_POSTGRES_PASSWORD`
- `CLERK_SECRET_KEY`
- `CRM_API_KEY`
- `GITEA_RUNNER_TOKEN`
- `GITEA_TOKEN`
- `GITHUB_TOKEN`
- `GOOGLE_API_KEY`
- `GRAFANA_ADMIN_PASSWORD`
- `INFISICAL_TOKEN`
- `LITELLM_MASTER_KEY`
- `N8N_BASIC_AUTH_PASSWORD`
- `N8N_ENCRYPTION_KEY`
- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- `OPENWEBUI_SECRET_KEY`
- `ORACLE_TUNNEL_TOKEN`
- `PORTAINER_ADMIN_PASSWORD`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `POSTGRES_PASSWORD`
- `QUOTE_API_SECRET`
- `TWENTY_APP_SECRET`
- `TWENTYCRM_API_KEY`

### Runtime Config Worth Injecting

- `AP_DB_TYPE`
- `AP_EXECUTION_MODE`
- `AP_FRONTEND_URL` only if you do not want the compose default `https://active.ratehunter.net`
- `AP_POSTGRES_DATABASE`
- `AP_POSTGRES_HOST`
- `AP_POSTGRES_PORT`
- `AP_POSTGRES_USERNAME`
- `AP_REDIS_HOST`
- `AP_REDIS_PASSWORD`
- `AP_REDIS_PORT`
- `AP_TELEMETRY_ENABLED`
- `ARCHON_DB_NAME`
- `GITEA_DB_NAME`
- `GITEA_DB_USER`
- `GITEA_DOMAIN`
- `GITEA_GID`
- `GITEA_HTTP_PORT`
- `GITEA_MCP_PORT`
- `GITEA_ROOT_URL`
- `GITEA_RUNNER_LABELS`
- `GITEA_RUNNER_NAME`
- `GITEA_SSH_DOMAIN`
- `GITEA_SSH_PORT`
- `GITEA_UID`
- `GITHUB_MIRROR_INTERVAL_SECONDS`
- `GITHUB_REPO`
- `GRAFANA_ADMIN_USER`
- `GRAFANA_ROOT_URL`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `LITELLM_API_BASE`
- `LITELLM_BASE_URL`
- `MEMPALACE_URL`
- `MIRROR_INTERVAL_SECONDS`
- `N8N_BASIC_AUTH_ACTIVE`
- `N8N_DB`
- `N8N_EXTRA_PACKAGES`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK`
- `N8N_TWENTY_NODES_GIT`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `OFFICE_PHONE`
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_EDGE_INSECURE_POLL`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `QUOTE_API_PORT`
- `REDIS_PASSWORD`
- `SMTP_FROM_EMAIL`
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_WORKSPACE_ID`
- `TWENTY_REDIS_URL`
- `TWILIO_PHONE_NUMBER`

## Orchestrator

### Secrets

- `ANTHROPIC_API_KEY`
- `DATABASE_URL`
- `INFISICAL_TOKEN`
- `LITELLM_MASTER_KEY`
- `OPENAI_API_KEY`
- `ORCHESTRATOR_TUNNEL_TOKEN`
- `PORTAINER_ADMIN_PASSWORD`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `POSTGRES_PASSWORD`

### Runtime Config Worth Injecting

- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `MEM0_API_URL`
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_EDGE_INSECURE_POLL`
- `QUOTE_ENGINE_URL`

## Worker RTX 3060

### Secrets

- `INFISICAL_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `UNMUTE_OPENAI_API_KEY`

### Runtime Config Worth Injecting

- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `LITELLM_PORT`
- `LOKI_URL`
- `PORTAINER_ADMIN_PASSWORD`
- `PORTAINER_EDGE_INSECURE_POLL`

## Worker RTX 3090 Ti

### Secrets

- `INFISICAL_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `UNMUTE_OPENAI_API_KEY`

### Runtime Config Worth Injecting

- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `LITELLM_PORT`
- `LMCACHE_PORT`
- `LOKI_URL`
- `PORTAINER_ADMIN_PASSWORD`
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_EDGE_INSECURE_POLL`
- `REDIS_PORT`
- `VLLM_MODEL`
- `VLLM_PORT`

## Worker RTX 5090

### Secrets

- `INFISICAL_TOKEN`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `UNMUTE_OPENAI_API_KEY`

### Runtime Config Worth Injecting

- `HERMES_DEFAULT_MODEL`
- `HERMES_UI_PORT`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `LITELLM_PORT`
- `LMCACHE_PORT`
- `LOKI_URL`
- `OPENCLAW_BACKEND_URL`
- `PORTAINER_ADMIN_PASSWORD`
- `PORTAINER_EDGE_INSECURE_POLL`
- `REDIS_PORT`
- `VLLM_MODEL`
- `VLLM_PORT`

## Variables That Are Referenced In Multiple Places

These are the cluster-wide keys most likely to break startup if missing:

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`
- `LITELLM_MASTER_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY`
- `PORTAINER_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`

## Recommended Infisical Paths

Based on the current host composes:

- Orchestrator host path: `/machines/orchestrator`
- Oracle host path: `/machines/oracle`
- Oracle shared MCP path: `/shared`
- Worker 3060 path: `/workers/worker-rtx3060`
- Worker 3090 Ti path: `/workers/worker-rtx3090ti`
- Worker 5090 path: `/workers/worker-rtx5090`

## Current Known Warning Sources

- `PORTAINER_EDGE_ID` missing
- `PORTAINER_EDGE_KEY` missing
- `AP_FRONTEND_URL` missing previously; compose now defaults it to `https://active.ratehunter.net`

## Follow-up

After adding or correcting values in Infisical, validate with:

```bash
docker compose -f infra/hosts/orchestrator/docker-compose.yml config >/dev/null
docker compose -f infra/hosts/oracle-vps/docker-compose.yml -f infra/hosts/oracle-vps/docker-compose.apps.yml config >/dev/null
docker compose -f infra/hosts/worker-rtx3060/docker-compose.yml config >/dev/null
docker compose -f infra/hosts/worker-rtx3090ti/docker-compose.yml config >/dev/null
docker compose -f infra/hosts/worker-rtx5090/docker-compose.yml config >/dev/null
```
