# Master Env/Secrets List (Deduplicated)

This file is intended for Infisical host/app profiles. Variables are deduplicated globally.

## Global deduplicated variable index

| Variable                                        | Sensitive? | Seen In | Env-specific values?              |
| ----------------------------------------------- | ---------- | ------: | --------------------------------- |
| `ACTIVEPIECES_API_KEY`                          | Yes        |       3 | not specified                     |
| `ACTIVEPIECES_API_URL`                          | No         |       1 | dev                               |
| `ACTIVEPIECES_BASE_URL`                         | No         |       1 | dev                               |
| `ACTIVEPIECES_ENCRYPTION_KEY`                   | Yes        |       3 | multiple defaults (not specified) |
| `ACTIVEPIECES_HOST`                             | No         |       1 | not specified                     |
| `ACTIVEPIECES_JWT_SECRET`                       | Yes        |       3 | multiple defaults (not specified) |
| `ACTIVEPIECES_PORT`                             | No         |       2 | multiple defaults (not specified) |
| `ACTIVEPIECES_URL`                              | No         |       1 | not specified                     |
| `ACTIVEPIECES_WEBHOOK_SECRET`                   | Yes        |       1 | not specified                     |
| `ADAPTER_COMMAND_JSON`                          | No         |       1 | not specified                     |
| `ADAPTER_DRIVER`                                | No         |       3 | multiple defaults (not specified) |
| `ADAPTER_OPENAI_API_KEY`                        | Yes        |       2 | multiple defaults (not specified) |
| `ADAPTER_OPENAI_BASE_URL`                       | No         |       2 | multiple defaults (not specified) |
| `ADAPTER_OPENAI_MODEL`                          | No         |       2 | not specified                     |
| `ADAPTER_PROMPT_MODE`                           | No         |       1 | not specified                     |
| `ADAPTER_STATE_DIR`                             | No         |       3 | multiple defaults (dev)           |
| `ADAPTER_TIMEOUT_MS`                            | No         |       3 | not specified                     |
| `ADAPTER_WORKDIR`                               | No         |       1 | not specified                     |
| `ADGUARD_DASHBOARD_BIND_IP`                     | No         |       1 | not specified                     |
| `AGENT_BROWSER_ENGINE`                          | No         |       4 | not specified                     |
| `AGENT_DESCRIPTION`                             | No         |       3 | multiple defaults (prod)          |
| `AGENT_NAME`                                    | No         |       3 | multiple defaults (dev, prod)     |
| `AGENT_PUBLIC_URL`                              | No         |       3 | multiple defaults (not specified) |
| `AGENT_VAULT_ADDR`                              | No         |       7 | multiple defaults (not specified) |
| `AGENT_VAULT_ADMIN_EMAIL`                       | No         |       4 | not specified                     |
| `AGENT_VAULT_ADMIN_PASSWORD`                    | Yes        |       4 | not specified                     |
| `AGENT_VAULT_ADMIN_USER`                        | No         |       1 | not specified                     |
| `AGENT_VAULT_GATEWAY_PORT`                      | No         |       1 | not specified                     |
| `AGENT_VAULT_INFISICAL_URL`                     | No         |       4 | not specified                     |
| `AGENT_VAULT_LOGS_MAX_AGE_HOURS`                | No         |       1 | not specified                     |
| `AGENT_VAULT_LOGS_MAX_ROWS_PER_VAULT`           | No         |       1 | not specified                     |
| `AGENT_VAULT_LOG_LEVEL`                         | No         |       2 | not specified                     |
| `AGENT_VAULT_MASTER_PASSWORD`                   | Yes        |       7 | multiple defaults (not specified) |
| `AGENT_VAULT_SMTP_FROM`                         | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_FROM_NAME`                    | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_HOST`                         | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_PASSWORD`                     | Yes        |       1 | not specified                     |
| `AGENT_VAULT_SMTP_PORT`                         | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_TLS_MODE`                     | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_TLS_SKIP_VERIFY`              | No         |       1 | not specified                     |
| `AGENT_VAULT_SMTP_USERNAME`                     | No         |       1 | not specified                     |
| `AGENT_VAULT_TOKEN`                             | Yes        |       1 | not specified                     |
| `AGENT_VAULT_TRUSTED_PROXIES`                   | No         |       5 | not specified                     |
| `AGENT_VAULT_UA_CLIENT_ID`                      | No         |       1 | not specified                     |
| `AGENT_VAULT_UA_CLIENT_SECRET`                  | Yes        |       1 | not specified                     |
| `AGENT_VAULT_VAULT`                             | No         |       1 | not specified                     |
| `ALERTMANAGER_HOST`                             | No         |       1 | not specified                     |
| `ALERTMANAGER_PAGERDUTY_KEY`                    | Yes        |       5 | not specified                     |
| `ALERTMANAGER_PORT`                             | No         |       6 | not specified                     |
| `ALERTMANAGER_SLACK_WEBHOOK_URL`                | Yes        |       5 | not specified                     |
| `ALERTMANAGER_WEBHOOK_SECRET`                   | Yes        |       4 | not specified                     |
| `ALERT_CHECK_INTERVAL_MINUTES`                  | No         |       1 | not specified                     |
| `ALERT_EMAIL`                                   | No         |       2 | not specified                     |
| `ALERT_EMAIL_ENABLED`                           | No         |       1 | not specified                     |
| `ALERT_EMAIL_TO`                                | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_GPU_TEMP`                      | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_INFERENCE_TIME`                | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_VRAM_USAGE`                    | No         |       1 | not specified                     |
| `ALERT_WEBHOOK_URL`                             | Yes        |       1 | not specified                     |
| `ALLOWED_FILE_TYPES`                            | No         |       2 | multiple defaults (not specified) |
| `ALLOWED_ORIGINS`                               | No         |       1 | dev                               |
| `ANTHROPIC_API_KEY`                             | Yes        |      11 | multiple defaults (not specified) |
| `ANTHROPIC_MAX_TOKENS`                          | Yes        |       1 | not specified                     |
| `ANTHROPIC_MODEL`                               | No         |       1 | not specified                     |
| `API_KEY`                                       | Yes        |       1 | not specified                     |
| `API_KEY_EXPIRY`                                | Yes        |       1 | not specified                     |
| `API_KEY_HEADER`                                | Yes        |       1 | not specified                     |
| `API_KEY_SECRET`                                | Yes        |       1 | not specified                     |
| `API_RATE_LIMITING_REQUEST_COUNT`               | No         |       1 | not specified                     |
| `API_RATE_LIMITING_TTL`                         | No         |       1 | not specified                     |
| `API_RATE_LIMIT_MAX_REQUESTS`                   | No         |       1 | not specified                     |
| `API_RATE_LIMIT_WINDOW_MS`                      | No         |       1 | not specified                     |
| `API_VERSION`                                   | No         |       4 | not specified                     |
| `APPRISE_URLS`                                  | No         |       1 | not specified                     |
| `APP_SECRET`                                    | Yes        |       1 | not specified                     |
| `AP_DB_TYPE`                                    | No         |       1 | not specified                     |
| `AP_ENCRYPTION_KEY`                             | Yes        |       3 | multiple defaults (dev)           |
| `AP_EXECUTION_MODE`                             | No         |       1 | not specified                     |
| `AP_FRONTEND_URL`                               | No         |       2 | multiple defaults (not specified) |
| `AP_JWT_SECRET`                                 | Yes        |       3 | multiple defaults (dev)           |
| `AP_POSTGRES_DATABASE`                          | No         |       1 | not specified                     |
| `AP_POSTGRES_HOST`                              | No         |       1 | not specified                     |
| `AP_POSTGRES_PASSWORD`                          | Yes        |       2 | multiple defaults (not specified) |
| `AP_POSTGRES_PORT`                              | No         |       1 | not specified                     |
| `AP_POSTGRES_USERNAME`                          | No         |       2 | not specified                     |
| `AP_REDIS_HOST`                                 | No         |       1 | not specified                     |
| `AP_REDIS_PASSWORD`                             | Yes        |       1 | not specified                     |
| `AP_REDIS_PORT`                                 | No         |       1 | not specified                     |
| `AP_TELEMETRY_ENABLED`                          | No         |       1 | not specified                     |
| `ARCHON_HOST`                                   | No         |       1 | not specified                     |
| `ARCHON_MODE`                                   | No         |       2 | not specified                     |
| `ARCHON_OS_PORT`                                | No         |       1 | not specified                     |
| `ARCHON_PORT`                                   | No         |       1 | not specified                     |
| `ARCHON_SERVER_URL`                             | No         |       3 | not specified                     |
| `ARCHON_STATUS_URL`                             | No         |       1 | not specified                     |
| `ARCHON_URL`                                    | No         |       1 | not specified                     |
| `ASSET_CDN_URL`                                 | No         |       1 | not specified                     |
| `ASSIGNMENT_ENABLED`                            | No         |       1 | not specified                     |
| `ASSIGNMENT_STRATEGY`                           | No         |       1 | not specified                     |
| `ASSISTANT_GATEWAY_URL`                         | No         |       1 | not specified                     |
| `AWS_ACCESS_KEY_ID`                             | Yes        |       1 | not specified                     |
| `AWS_REGION`                                    | No         |       1 | not specified                     |
| `AWS_SECRET_ACCESS_KEY`                         | Yes        |       1 | not specified                     |
| `BACKUP_DIR`                                    | No         |       1 | not specified                     |
| `BACKUP_ENABLED`                                | No         |       1 | not specified                     |
| `BACKUP_RETENTION_DAYS`                         | No         |       1 | not specified                     |
| `BACKUP_SCHEDULE`                               | No         |       1 | not specified                     |
| `BATCH_SIZE`                                    | No         |       1 | not specified                     |
| `BCRYPT_ROUNDS`                                 | No         |       1 | not specified                     |
| `BITNET_CPUS`                                   | No         |       1 | not specified                     |
| `BITNET_MODEL_DIR`                              | No         |       1 | not specified                     |
| `BITNET_MODEL_FILE`                             | No         |       1 | not specified                     |
| `BOOT_OPENCLAW`                                 | No         |       1 | not specified                     |
| `BOOT_OPENCLAW_UI_PROXY`                        | No         |       1 | not specified                     |
| `BOOT_OPENCLAW_VOICE`                           | No         |       1 | not specified                     |
| `BROWSERLESS_CONCURRENT`                        | No         |       1 | not specified                     |
| `BROWSERLESS_HOST_PORT`                         | No         |       1 | not specified                     |
| `BROWSERLESS_KEEP_ALIVE`                        | No         |       1 | not specified                     |
| `BROWSERLESS_PREBOOT_CHROME`                    | No         |       1 | not specified                     |
| `BROWSERLESS_QUEUED`                            | No         |       1 | not specified                     |
| `BROWSERLESS_TIMEOUT_MS`                        | No         |       1 | not specified                     |
| `BROWSERLESS_TOKEN`                             | Yes        |       7 | multiple defaults (not specified) |
| `CACHE_MAX_SIZE`                                | No         |       1 | not specified                     |
| `CACHE_TTL`                                     | No         |       1 | not specified                     |
| `CACHE_TTL_CALCULATOR`                          | No         |       1 | not specified                     |
| `CACHE_TTL_RATES`                               | No         |       1 | not specified                     |
| `CACHE_TTL_SECONDS`                             | No         |       1 | not specified                     |
| `CADVISOR_PORT`                                 | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_HOST`                          | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_PORT`                          | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_URL`                           | No         |       3 | multiple defaults (dev)           |
| `CAMPAIGN_MAX_RETRIES`                          | No         |       1 | not specified                     |
| `CAMPAIGN_RETRY_DELAY_MINUTES`                  | No         |       1 | not specified                     |
| `CAMPAIGN_TIMEZONE`                             | No         |       1 | not specified                     |
| `CF_GATEWAY_ACCESS_CLIENT_ID`                   | No         |       4 | multiple defaults (not specified) |
| `CF_GATEWAY_ACCESS_CLIENT_SECRET`               | Yes        |       4 | multiple defaults (not specified) |
| `CF_PORTAL_LITELLM_SERVICE_TOKEN`               | Yes        |       1 | not specified                     |
| `CF_TUNNEL_TOKEN`                               | Yes        |       2 | not specified                     |
| `CHECK_INTERVAL`                                | No         |       1 | not specified                     |
| `CLAUDE_API_KEY`                                | Yes        |       1 | not specified                     |
| `CLAUDE_FLOW_CONFIG_PATH`                       | No         |       1 | not specified                     |
| `CLAUDE_FLOW_HOST`                              | No         |       1 | not specified                     |
| `CLAUDE_FLOW_MODE`                              | No         |       1 | not specified                     |
| `CLAUDE_FLOW_PORT`                              | No         |       1 | not specified                     |
| `CLAWDBOT_GATEWAY_PORT`                         | No         |       2 | not specified                     |
| `CLAWDBOT_GATEWAY_TOKEN`                        | Yes        |       3 | multiple defaults (not specified) |
| `CLAWTEAM_HOST`                                 | No         |       1 | not specified                     |
| `CLEARBIT_API_KEY`                              | Yes        |       1 | not specified                     |
| `CLERK_SECRET_KEY`                              | Yes        |       1 | not specified                     |
| `CLOUDFLARED_HOSTNAME`                          | No         |       1 | not specified                     |
| `CLOUDFLARED_LITELLM_HOSTNAME`                  | No         |       1 | not specified                     |
| `CLOUDFLARED_TOKEN`                             | Yes        |       3 | multiple defaults (dev, prod)     |
| `CLOUDFLARED_TUNNEL_NAME`                       | No         |       1 | not specified                     |
| `CLOUDFLARED_TUNNEL_TOKEN`                      | Yes        |       3 | multiple defaults (not specified) |
| `CLOUDFLARE_API_TOKEN`                          | Yes        |       2 | not specified                     |
| `CLOUDFLARE_TUNNEL_TOKEN`                       | Yes        |       3 | not specified                     |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`          | Yes        |       2 | multiple defaults (not specified) |
| `CLOUDFLARE_ZONE_ID`                            | No         |       1 | not specified                     |
| `CODEX_API_KEY`                                 | Yes        |       1 | not specified                     |
| `CODEX_RELAY_PUBLIC_URL`                        | No         |       1 | not specified                     |
| `COLLECTION_ID`                                 | No         |       1 | not specified                     |
| `COMPOSE_PROFILES`                              | No         |       3 | multiple defaults (not specified) |
| `COMPOSE_PROJECT_NAME`                          | No         |      20 | multiple defaults (not specified) |
| `COMPOSIO_API_KEY`                              | Yes        |       6 | multiple defaults (not specified) |
| `COMPOSIO_DEFAULT_USER_ID`                      | No         |       1 | not specified                     |
| `COMPOSIO_MCP_SERVER_ID`                        | No         |       1 | not specified                     |
| `COMPOSIO_MCP_URL`                              | No         |       1 | dev                               |
| `CONFIG_DIR`                                    | No         |       1 | not specified                     |
| `CONFLICT_STRATEGY`                             | No         |       2 | not specified                     |
| `CONNECTION_TIMEOUT`                            | No         |       1 | not specified                     |
| `CONSENT_REQUIRED`                              | No         |       1 | not specified                     |
| `COPILOT_GITHUB_TOKEN`                          | Yes        |       2 | not specified                     |
| `CORS_ALLOWED_ORIGINS`                          | No         |       4 | multiple defaults (dev)           |
| `CORS_ORIGIN`                                   | No         |       2 | multiple defaults (dev)           |
| `CRM_API_KEY`                                   | Yes        |       4 | multiple defaults (not specified) |
| `CRM_API_URL`                                   | No         |       2 | multiple defaults (dev)           |
| `CRM_URL`                                       | No         |       1 | not specified                     |
| `CRON_SCHEDULE`                                 | No         |       1 | not specified                     |
| `CUDA_VISIBLE_DEVICES`                          | No         |       2 | not specified                     |
| `DATABASE_ENCRYPTION_KEY`                       | Yes        |       1 | not specified                     |
| `DATABASE_URL`                                  | No         |       5 | multiple defaults (dev)           |
| `DATA_DIR`                                      | No         |       1 | not specified                     |
| `DB_HOST`                                       | No         |       3 | dev                               |
| `DB_NAME`                                       | No         |       3 | multiple defaults (not specified) |
| `DB_PASSWORD`                                   | Yes        |       4 | multiple defaults (not specified) |
| `DB_POOL_MAX`                                   | No         |       1 | not specified                     |
| `DB_POOL_MIN`                                   | No         |       1 | not specified                     |
| `DB_PORT`                                       | No         |       3 | not specified                     |
| `DB_USER`                                       | No         |       3 | not specified                     |
| `DEBUG_MODE`                                    | No         |       3 | not specified                     |
| `DEFAULT_THEME`                                 | No         |       1 | not specified                     |
| `DISCORD_ALLOWED_USERS`                         | No         |       1 | not specified                     |
| `DISCORD_ALLOW_ALL_USERS`                       | No         |       1 | not specified                     |
| `DISCORD_BOT_TOKEN`                             | Yes        |       5 | not specified                     |
| `DISCORD_REPLY_TO_MODE`                         | No         |       3 | not specified                     |
| `DNC_CHECK_ENABLED`                             | No         |       1 | not specified                     |
| `DOCKER_CPU_LIMIT`                              | No         |       1 | not specified                     |
| `DOCKER_MEMORY_LIMIT`                           | No         |       1 | not specified                     |
| `DOCKER_REGISTRY`                               | No         |       1 | not specified                     |
| `DOCKER_REGISTRY_PASS`                          | Yes        |       1 | not specified                     |
| `DOCKER_REGISTRY_USER`                          | No         |       1 | not specified                     |
| `DOCUSIGN_ACCOUNT_ID`                           | No         |       1 | not specified                     |
| `DOCUSIGN_BASE_PATH`                            | No         |       1 | not specified                     |
| `DOCUSIGN_INTEGRATION_KEY`                      | Yes        |       1 | not specified                     |
| `DOCUSIGN_PRIVATE_KEY_PATH`                     | Yes        |       1 | not specified                     |
| `DOCUSIGN_USER_ID`                              | No         |       1 | not specified                     |
| `DOMAIN_NAME`                                   | No         |       1 | not specified                     |
| `ELASTICSEARCH_INDEX`                           | No         |       1 | not specified                     |
| `ELASTICSEARCH_NODE`                            | No         |       1 | dev                               |
| `ELEVENLABS_API_KEY`                            | Yes        |       3 | not specified                     |
| `EMAIL_DRIVER`                                  | No         |       1 | not specified                     |
| `EMAIL_FROM`                                    | No         |       3 | multiple defaults (not specified) |
| `EMAIL_FROM_ADDRESS`                            | No         |       1 | not specified                     |
| `EMAIL_HOST`                                    | No         |       1 | not specified                     |
| `EMAIL_PASSWORD`                                | Yes        |       1 | not specified                     |
| `EMAIL_PORT`                                    | No         |       1 | not specified                     |
| `EMAIL_SECURE`                                  | No         |       1 | not specified                     |
| `EMAIL_SYSTEM_ADDRESS`                          | No         |       1 | not specified                     |
| `EMAIL_USER`                                    | No         |       1 | not specified                     |
| `EMBEDDINGS_CPUS`                               | No         |       1 | not specified                     |
| `EMBEDDING_MODEL`                               | No         |       1 | not specified                     |
| `ENABLE_AUDIT_LOGGING`                          | No         |       1 | not specified                     |
| `ENABLE_CACHING`                                | No         |       1 | not specified                     |
| `ENABLE_COMPLIANCE_CHECKS`                      | No         |       1 | not specified                     |
| `ENABLE_COST_TRACKING`                          | No         |       1 | not specified                     |
| `ENABLE_CRM`                                    | No         |       2 | multiple defaults (not specified) |
| `ENABLE_GPU_WORKERS`                            | No         |       2 | not specified                     |
| `ENABLE_GUARDRAILS`                             | No         |       1 | not specified                     |
| `ENABLE_MONITORING`                             | No         |       3 | not specified                     |
| `ENABLE_RATE_LIMITING`                          | No         |       1 | not specified                     |
| `ENABLE_WORKFLOWS`                              | No         |       2 | not specified                     |
| `ENABLE_YAML_CONFIG_EDITING`                    | No         |       1 | not specified                     |
| `ENCRYPTION_KEY`                                | Yes        |       4 | not specified                     |
| `ENRICHMENT_ENABLED`                            | No         |       1 | not specified                     |
| `ENRICHMENT_PROVIDER`                           | No         |       1 | not specified                     |
| `EXA_API_KEY`                                   | Yes        |       3 | not specified                     |
| `FALKORDB_CACHE_SIZE_MB`                        | No         |       1 | not specified                     |
| `FALKORDB_HOST`                                 | No         |       2 | multiple defaults (not specified) |
| `FALKORDB_PASSWORD`                             | Yes        |       2 | not specified                     |
| `FALKORDB_PORT`                                 | No         |       2 | multiple defaults (not specified) |
| `FALKORDB_QUERY_MEM_CAPACITY`                   | No         |       1 | not specified                     |
| `FALKORDB_THREADS`                              | No         |       1 | not specified                     |
| `FALKORDB_TIMEOUT_DEFAULT_MS`                   | No         |       1 | not specified                     |
| `FALKORDB_TIMEOUT_MAX_MS`                       | No         |       1 | not specified                     |
| `FALKORDB_URL`                                  | No         |       1 | dev                               |
| `FAL_KEY`                                       | Yes        |       3 | not specified                     |
| `FIRECRAWL_API_KEY`                             | Yes        |       6 | multiple defaults (not specified) |
| `FIREWALL_TAILSCALE_ENABLED`                    | No         |       1 | not specified                     |
| `FORGEJO_DB_PASSWORD`                           | Yes        |       1 | not specified                     |
| `FORGEJO_DOMAIN`                                | No         |       1 | not specified                     |
| `FORGEJO_HTTP_PORT`                             | No         |       1 | not specified                     |
| `FORGEJO_INTERNAL_TOKEN`                        | Yes        |       5 | not specified                     |
| `FORGEJO_JWT_SECRET`                            | Yes        |       5 | not specified                     |
| `FORGEJO_SECRET_KEY`                            | Yes        |       5 | not specified                     |
| `FRONTEND_URL`                                  | No         |       1 | dev                               |
| `GEMINI_API_KEY`                                | Yes        |       3 | multiple defaults (not specified) |
| `GEMINI_BASE_URL`                               | No         |       1 | not specified                     |
| `GEMINI_MAX_TOKENS`                             | Yes        |       1 | not specified                     |
| `GEMINI_MODEL`                                  | No         |       1 | not specified                     |
| `GF_SECURITY_ADMIN_PASSWORD`                    | Yes        |       1 | not specified                     |
| `GF_SECURITY_ADMIN_USER`                        | No         |       1 | not specified                     |
| `GITEA_ACTIONS_ENABLED`                         | No         |       1 | not specified                     |
| `GITEA_ADMIN_EMAIL`                             | No         |       1 | not specified                     |
| `GITEA_ADMIN_PASSWORD`                          | Yes        |       1 | not specified                     |
| `GITEA_ADMIN_USER`                              | No         |       1 | not specified                     |
| `GITEA_DB_HOST`                                 | No         |       1 | not specified                     |
| `GITEA_DB_NAME`                                 | No         |       7 | multiple defaults (not specified) |
| `GITEA_DB_PASS`                                 | Yes        |       5 | not specified                     |
| `GITEA_DB_PASSWORD`                             | Yes        |       2 | not specified                     |
| `GITEA_DB_PORT`                                 | No         |       1 | not specified                     |
| `GITEA_DB_TYPE`                                 | No         |       1 | not specified                     |
| `GITEA_DB_USER`                                 | No         |       7 | multiple defaults (not specified) |
| `GITEA_DOMAIN`                                  | No         |       2 | multiple defaults (dev)           |
| `GITEA_HOST`                                    | No         |       1 | not specified                     |
| `GITEA_HTTP_PORT`                               | No         |       1 | not specified                     |
| `GITEA_INTERNAL_TOKEN`                          | Yes        |       2 | multiple defaults (not specified) |
| `GITEA_JWT_SECRET`                              | Yes        |       3 | multiple defaults (not specified) |
| `GITEA_PORT`                                    | No         |       1 | not specified                     |
| `GITEA_REPO`                                    | No         |       1 | not specified                     |
| `GITEA_ROOT_URL`                                | No         |       2 | multiple defaults (dev)           |
| `GITEA_RUNNER_NAME`                             | No         |       1 | not specified                     |
| `GITEA_RUNNER_REGISTRATION_TOKEN`               | Yes        |       1 | not specified                     |
| `GITEA_RUNNER_TOKEN`                            | Yes        |       1 | not specified                     |
| `GITEA_SECRET_KEY`                              | Yes        |       4 | multiple defaults (not specified) |
| `GITEA_SSH_DOMAIN`                              | No         |       1 | not specified                     |
| `GITEA_SSH_PORT`                                | No         |       2 | not specified                     |
| `GITEA_TOKEN`                                   | Yes        |       6 | not specified                     |
| `GITHUB_MIRROR_INTERVAL_SECONDS`                | No         |       1 | not specified                     |
| `GITHUB_REPO`                                   | No         |       1 | not specified                     |
| `GITHUB_TOKEN`                                  | Yes        |       5 | multiple defaults (not specified) |
| `GITHUB_USERNAME`                               | No         |       1 | not specified                     |
| `GOOGLE_API_KEY`                                | Yes        |       5 | multiple defaults (not specified) |
| `GOOGLE_CALLBACK_URL`                           | No         |       1 | dev                               |
| `GOOGLE_CLIENT_ID`                              | No         |       1 | not specified                     |
| `GOOGLE_CLIENT_SECRET`                          | Yes        |       1 | not specified                     |
| `GOOGLE_WORKSPACE_CLIENT_ID`                    | No         |       1 | not specified                     |
| `GOOGLE_WORKSPACE_CLIENT_SECRET`                | Yes        |       1 | not specified                     |
| `GPU_MODEL`                                     | No         |       3 | multiple defaults (not specified) |
| `GPU_TYPE`                                      | No         |       1 | not specified                     |
| `GPU_VRAM`                                      | No         |       3 | multiple defaults (not specified) |
| `GPU_WORKER_ID`                                 | No         |       1 | not specified                     |
| `GRAFANA_ADMIN_PASSWORD`                        | Yes        |       6 | multiple defaults (not specified) |
| `GRAFANA_ADMIN_USER`                            | No         |       3 | not specified                     |
| `GRAFANA_CLICKHOUSE_DATABASE`                   | No         |       3 | not specified                     |
| `GRAFANA_CLICKHOUSE_PASSWORD`                   | Yes        |       4 | not specified                     |
| `GRAFANA_CLICKHOUSE_USER`                       | No         |       4 | not specified                     |
| `GRAFANA_CPU_LIMIT`                             | No         |       1 | not specified                     |
| `GRAFANA_HOST`                                  | No         |       1 | not specified                     |
| `GRAFANA_MEMORY_LIMIT`                          | No         |       2 | multiple defaults (not specified) |
| `GRAFANA_PASSWORD`                              | Yes        |       5 | not specified                     |
| `GRAFANA_PORT`                                  | No         |       7 | multiple defaults (not specified) |
| `GRAFANA_ROOT_URL`                              | No         |       5 | not specified                     |
| `GRAFANA_SECURITY_ADMIN_USER`                   | No         |       4 | not specified                     |
| `GRAFANA_URL`                                   | No         |       3 | multiple defaults (not specified) |
| `GROQ_API_KEY`                                  | Yes        |       1 | not specified                     |
| `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION`     | No         |       1 | not specified                     |
| `HAMCP_ENABLE_FILESYSTEM_TOOLS`                 | No         |       1 | not specified                     |
| `HASS_LONG_LIVED_TOKEN`                         | Yes        |       1 | not specified                     |
| `HASS_URL`                                      | No         |       5 | multiple defaults (not specified) |
| `HA_MCP_BACKUP_HINT`                            | No         |       1 | not specified                     |
| `HA_MCP_IMAGE`                                  | No         |       1 | not specified                     |
| `HA_STACK_ROOT`                                 | No         |       1 | not specified                     |
| `HEALTH_CHECK_INTERVAL`                         | No         |       1 | not specified                     |
| `HEALTH_CHECK_INTERVAL_MINUTES`                 | No         |       2 | not specified                     |
| `HEALTH_CHECK_PORT`                             | No         |       1 | not specified                     |
| `HEALTH_CHECK_RETRIES`                          | No         |       1 | not specified                     |
| `HEALTH_CHECK_TIMEOUT`                          | No         |       1 | not specified                     |
| `HERMES_A2A_URL`                                | No         |       1 | not specified                     |
| `HERMES_API_SERVER_KEY`                         | Yes        |       4 | not specified                     |
| `HERMES_LANGFUSE_BASE_URL`                      | No         |       4 | not specified                     |
| `HERMES_LANGFUSE_PUBLIC_KEY`                    | Yes        |       4 | not specified                     |
| `HERMES_LANGFUSE_SECRET_KEY`                    | Yes        |       3 | not specified                     |
| `HF_API_KEY`                                    | Yes        |       5 | not specified                     |
| `HF_TOKEN`                                      | Yes        |       5 | not specified                     |
| `HOMEASSISTANT_IP`                              | No         |       1 | not specified                     |
| `HOMEASSISTANT_TOKEN`                           | Yes        |       1 | not specified                     |
| `HOMEASSISTANT_URL`                             | No         |       2 | multiple defaults (not specified) |
| `HOMEPAGE_PORT`                                 | No         |       1 | not specified                     |
| `HOST`                                          | No         |       3 | not specified                     |
| `HOT_RELOAD_ENABLED`                            | No         |       2 | multiple defaults (not specified) |
| `HUGGINGFACE_API_KEY`                           | Yes        |       5 | not specified                     |
| `HUGGING_FACE_HUB_TOKEN`                        | Yes        |       5 | not specified                     |
| `IMAGE_TOOLS_DEBUG`                             | No         |       4 | not specified                     |
| `INFISICAL_AUDIT_RETENTION`                     | No         |       5 | not specified                     |
| `INFISICAL_AUTH_SECRET`                         | Yes        |       6 | multiple defaults (not specified) |
| `INFISICAL_BACKEND_URL`                         | No         |       1 | not specified                     |
| `INFISICAL_CLIENT_ID`                           | No         |       2 | not specified                     |
| `INFISICAL_CLIENT_SECRET`                       | Yes        |       2 | not specified                     |
| `INFISICAL_DB_NAME`                             | No         |       5 | not specified                     |
| `INFISICAL_DB_PASSWORD`                         | Yes        |       4 | multiple defaults (not specified) |
| `INFISICAL_DB_USER`                             | No         |       3 | not specified                     |
| `INFISICAL_ENCRYPTION_KEY`                      | Yes        |       4 | multiple defaults (not specified) |
| `INFISICAL_ENV`                                 | No         |      19 | multiple defaults (dev, prod)     |
| `INFISICAL_ENVIRONMENT`                         | No         |       1 | dev                               |
| `INFISICAL_EXPORT_INTERVAL_SECONDS`             | No         |       1 | not specified                     |
| `INFISICAL_GATEWAY_CLIENT_ID`                   | No         |       5 | not specified                     |
| `INFISICAL_GATEWAY_CLIENT_SECRET`               | Yes        |       5 | not specified                     |
| `INFISICAL_KMS_ENABLED`                         | No         |       4 | not specified                     |
| `INFISICAL_LICENSE_KEY`                         | Yes        |       1 | not specified                     |
| `INFISICAL_LOCAL_ADMIN_EMAIL`                   | No         |       4 | not specified                     |
| `INFISICAL_LOCAL_ADMIN_PASSWORD`                | Yes        |       4 | not specified                     |
| `INFISICAL_MCP_TOKEN`                           | Yes        |       1 | not specified                     |
| `INFISICAL_ORGANIZATION_ID`                     | No         |       4 | not specified                     |
| `INFISICAL_ORGANIZATION_ID_LOCAL`               | No         |       4 | not specified                     |
| `INFISICAL_ORGANIZATION_SLUG`                   | No         |       4 | not specified                     |
| `INFISICAL_PAM_ENABLED`                         | No         |       4 | not specified                     |
| `INFISICAL_PATH`                                | No         |      11 | multiple defaults (not specified) |
| `INFISICAL_PKI_KEY_ALGO`                        | Yes        |       5 | not specified                     |
| `INFISICAL_PORT`                                | No         |       1 | not specified                     |
| `INFISICAL_POSTGRES_DB`                         | No         |       5 | not specified                     |
| `INFISICAL_POSTGRES_PASSWORD`                   | Yes        |       5 | multiple defaults (not specified) |
| `INFISICAL_POSTGRES_USER`                       | No         |       5 | not specified                     |
| `INFISICAL_PROJECT_ID`                          | No         |      20 | multiple defaults (dev)           |
| `INFISICAL_PROJECT_ID_LOCAL`                    | No         |       4 | not specified                     |
| `INFISICAL_RECOMMENDED_NEXT`                    | No         |       4 | dev                               |
| `INFISICAL_REDIS_PASSWORD`                      | Yes        |       5 | multiple defaults (not specified) |
| `INFISICAL_SCAN_GIT_APP_ID`                     | No         |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_APP_SLUG`                   | No         |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_PRIVATE_KEY`                | Yes        |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`             | Yes        |       5 | not specified                     |
| `INFISICAL_SECRET_PATH_PREFIX`                  | Yes        |       1 | dev                               |
| `INFISICAL_SITE_URL`                            | No         |       6 | multiple defaults (not specified) |
| `INFISICAL_SSH_CA_TTL`                          | No         |       4 | not specified                     |
| `INFISICAL_TOKEN`                               | Yes        |       4 | not specified                     |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`            | Yes        |       3 | multiple defaults (not specified) |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`        | Yes        |       3 | not specified                     |
| `INFISICAL_URL`                                 | No         |       3 | not specified                     |
| `INFI_CLIENT_ID`                                | No         |       1 | not specified                     |
| `INFI_CLIENT_SECRET`                            | Yes        |       1 | not specified                     |
| `INFI_PROJECT_ID`                               | No         |       1 | not specified                     |
| `INITIAL_PASSWORD`                              | Yes        |       1 | not specified                     |
| `JWT_EXPIRES_IN`                                | No         |       3 | not specified                     |
| `JWT_EXPIRY`                                    | No         |       2 | multiple defaults (not specified) |
| `JWT_REFRESH_EXPIRES_IN`                        | No         |       2 | not specified                     |
| `JWT_REFRESH_EXPIRY`                            | No         |       1 | not specified                     |
| `JWT_REFRESH_SECRET`                            | Yes        |       1 | not specified                     |
| `JWT_SECRET`                                    | Yes        |       9 | multiple defaults (prod)          |
| `LANDING_URL`                                   | No         |       1 | not specified                     |
| `LETTA_AGENTS_API_KEY`                          | Yes        |       1 | not specified                     |
| `LETTA_DB_NAME`                                 | No         |       3 | multiple defaults (not specified) |
| `LETTA_DB_PASSWORD`                             | Yes        |       4 | multiple defaults (not specified) |
| `LETTA_DB_USER`                                 | No         |       4 | not specified                     |
| `LETTA_DEFAULT_EMBEDDING_CONFIG`                | No         |       1 | not specified                     |
| `LETTA_DEFAULT_LLM_CONFIG`                      | No         |       1 | not specified                     |
| `LETTA_HOST`                                    | No         |       1 | not specified                     |
| `LETTA_HOST_PORT`                               | No         |       1 | not specified                     |
| `LETTA_IMAGE`                                   | No         |       1 | not specified                     |
| `LETTA_PG_URI`                                  | No         |       1 | not specified                     |
| `LETTA_PORT`                                    | No         |       1 | not specified                     |
| `LETTA_SERVER_PASSWORD`                         | Yes        |       3 | multiple defaults (not specified) |
| `LETTA_URL`                                     | No         |       1 | not specified                     |
| `LINKWARDEN_INTERNAL_URL`                       | No         |       1 | not specified                     |
| `LINKWARDEN_PORT`                               | No         |       1 | not specified                     |
| `LINKWARDEN_TOKEN`                              | Yes        |       1 | not specified                     |
| `LINKWARDEN_URL`                                | No         |       1 | not specified                     |
| `LITELLM_API_BASE`                              | No         |      11 | multiple defaults (not specified) |
| `LITELLM_API_KEY`                               | Yes        |       7 | not specified                     |
| `LITELLM_API_URL`                               | No         |       2 | multiple defaults (not specified) |
| `LITELLM_BASE_URL`                              | No         |      10 | multiple defaults (dev)           |
| `LITELLM_BIND_IP`                               | No         |       2 | not specified                     |
| `LITELLM_DATABASE_URL`                          | No         |       7 | not specified                     |
| `LITELLM_DB_NAME`                               | No         |       1 | not specified                     |
| `LITELLM_DB_PASSWORD`                           | Yes        |       1 | not specified                     |
| `LITELLM_DB_USER`                               | No         |       1 | not specified                     |
| `LITELLM_HERMES_KEY`                            | Yes        |       1 | not specified                     |
| `LITELLM_HOST`                                  | No         |       4 | not specified                     |
| `LITELLM_IMAGE`                                 | No         |       1 | not specified                     |
| `LITELLM_INTERNAL_BASE_URL`                     | No         |       5 | not specified                     |
| `LITELLM_LOG`                                   | No         |       1 | not specified                     |
| `LITELLM_LOG_LEVEL`                             | No         |       2 | multiple defaults (not specified) |
| `LITELLM_MASTER_KEY`                            | Yes        |      25 | multiple defaults (not specified) |
| `LITELLM_MODE`                                  | No         |       1 | dev                               |
| `LITELLM_PORT`                                  | No         |      13 | multiple defaults (not specified) |
| `LITELLM_POSTGRES_IMAGE`                        | No         |       1 | not specified                     |
| `LLXPRT_BRIDGE_API_KEY`                         | Yes        |       5 | not specified                     |
| `LOCAL_INFISICAL_URL`                           | No         |       4 | not specified                     |
| `LOG_DIR`                                       | No         |       1 | not specified                     |
| `LOG_FILE`                                      | No         |       5 | multiple defaults (not specified) |
| `LOG_FILE_PATH`                                 | No         |       1 | not specified                     |
| `LOG_FORMAT`                                    | No         |       2 | not specified                     |
| `LOG_LEVEL`                                     | No         |      20 | multiple defaults (not specified) |
| `LOKI_HOST`                                     | No         |       1 | not specified                     |
| `LOKI_PORT`                                     | No         |       7 | not specified                     |
| `LOKI_RETENTION_PERIOD`                         | No         |       4 | not specified                     |
| `LOKI_URL`                                      | No         |       6 | multiple defaults (not specified) |
| `MACHINE_HOSTNAME`                              | No         |       1 | not specified                     |
| `MACHINE_IP_ETHERNET`                           | No         |       1 | not specified                     |
| `MACHINE_IP_TAILSCALE`                          | No         |       1 | not specified                     |
| `MACHINE_NAME`                                  | No         |       4 | multiple defaults (not specified) |
| `MACHINE_ROLE`                                  | No         |       4 | multiple defaults (not specified) |
| `MAGIC_UI_ENABLED`                              | No         |       1 | not specified                     |
| `MAX_CONCURRENT_SCRAPERS`                       | No         |       1 | not specified                     |
| `MAX_CONNECTIONS`                               | No         |       1 | not specified                     |
| `MAX_CONNECTIONS_PER_USER`                      | No         |       1 | not specified                     |
| `MAX_FILE_SIZE`                                 | No         |       2 | multiple defaults (not specified) |
| `MAX_RETRY_ATTEMPTS`                            | No         |       2 | not specified                     |
| `MCP_GATEWAY_TOKEN`                             | Yes        |       1 | not specified                     |
| `MEILI_MASTER_KEY`                              | Yes        |       1 | not specified                     |
| `MEM0_API_KEY`                                  | Yes        |       6 | multiple defaults (dev)           |
| `MEM0_API_URL`                                  | No         |       6 | multiple defaults (dev)           |
| `MEM0_BASE_URL`                                 | No         |       4 | not specified                     |
| `MEM0_CROSS_APP_SYNC`                           | No         |       5 | not specified                     |
| `MEM0_DEFAULT_USER_ID`                          | No         |       5 | not specified                     |
| `MEM0_ENABLED`                                  | No         |       5 | not specified                     |
| `MEM0_HOST`                                     | No         |       1 | not specified                     |
| `MEM0_HOST_PORT`                                | No         |       6 | not specified                     |
| `MEM0_IMAGE`                                    | No         |       6 | dev                               |
| `MEM0_ORGANIZATION_ID`                          | No         |       5 | not specified                     |
| `MEM0_ORGANIZATION_NAME`                        | No         |       5 | not specified                     |
| `MEM0_PORT`                                     | No         |       1 | not specified                     |
| `MEM0_URL`                                      | No         |       1 | not specified                     |
| `MEM0_USER_PERSONALIZATION`                     | No         |       5 | not specified                     |
| `MEMORY_BASE_URL`                               | No         |       1 | not specified                     |
| `MEMPALACE_PORT`                                | No         |       1 | not specified                     |
| `MEMPALACE_URL`                                 | No         |       2 | multiple defaults (dev)           |
| `MEMPAL_DIR`                                    | No         |       1 | not specified                     |
| `METRICS_PORT`                                  | No         |       1 | not specified                     |
| `MFA_ISSUER`                                    | No         |       1 | not specified                     |
| `MICROSOFT_CALLBACK_URL`                        | No         |       1 | dev                               |
| `MICROSOFT_CLIENT_ID`                           | No         |       1 | not specified                     |
| `MICROSOFT_CLIENT_SECRET`                       | Yes        |       1 | not specified                     |
| `MISTRAL_API_KEY`                               | Yes        |       4 | not specified                     |
| `MOA_TOOLS_DEBUG`                               | No         |       4 | not specified                     |
| `MODEL_MANAGER_PORT`                            | No         |       1 | not specified                     |
| `MODEL_ROUTING_COST_THRESHOLD`                  | No         |       5 | not specified                     |
| `MODEL_ROUTING_FALLBACK_CLOUD`                  | No         |       5 | not specified                     |
| `MODEL_ROUTING_PREFER_LOCAL`                    | No         |       5 | not specified                     |
| `MODEL_ROUTING_STRATEGY`                        | No         |       5 | not specified                     |
| `MOLTBOT_WEB_PORT`                              | No         |       1 | not specified                     |
| `MONGODB_URI`                                   | No         |       1 | dev                               |
| `MONGO_PORT`                                    | No         |       1 | not specified                     |
| `MONGO_ROOT_PASSWORD`                           | Yes        |       3 | multiple defaults (not specified) |
| `MONGO_ROOT_USER`                               | No         |       1 | not specified                     |
| `N8N_API_KEY`                                   | Yes        |       2 | not specified                     |
| `N8N_BASE_URL`                                  | No         |       1 | dev                               |
| `N8N_BASIC_AUTH_ACTIVE`                         | Yes        |       3 | not specified                     |
| `N8N_BASIC_AUTH_PASSWORD`                       | Yes        |       3 | multiple defaults (not specified) |
| `N8N_BASIC_AUTH_USER`                           | Yes        |       3 | not specified                     |
| `N8N_DB`                                        | No         |       1 | not specified                     |
| `N8N_DB_PASSWORD`                               | Yes        |       1 | not specified                     |
| `N8N_EDITOR_BASE_URL`                           | No         |       1 | dev                               |
| `N8N_ENCRYPTION_KEY`                            | Yes        |       7 | multiple defaults (not specified) |
| `N8N_HOST`                                      | No         |       4 | multiple defaults (dev)           |
| `N8N_PORT`                                      | No         |       4 | not specified                     |
| `N8N_PROTOCOL`                                  | No         |       3 | multiple defaults (not specified) |
| `N8N_SKIP_WEBHOOK_DNS_CHECK`                    | Yes        |       2 | not specified                     |
| `N8N_URL`                                       | No         |       1 | not specified                     |
| `N8N_WEBHOOK_URL`                               | Yes        |       2 | multiple defaults (dev)           |
| `NATS_BIND_IP`                                  | No         |       1 | not specified                     |
| `NATS_IMAGE`                                    | No         |       1 | not specified                     |
| `NATS_MONITOR_PORT`                             | No         |       1 | not specified                     |
| `NATS_PASSWORD`                                 | Yes        |       1 | not specified                     |
| `NATS_PORT`                                     | No         |       1 | not specified                     |
| `NATS_USER`                                     | No         |       1 | not specified                     |
| `NEXTAUTH_SECRET`                               | Yes        |       1 | not specified                     |
| `NEXTAUTH_URL`                                  | Yes        |       1 | dev                               |
| `NEXT_PUBLIC_ACTIVEPIECES_URL`                  | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_API_BASE_URL`                      | No         |       2 | multiple defaults (dev)           |
| `NEXT_PUBLIC_API_KEY`                           | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_APP_NAME`                          | No         |       1 | not specified                     |
| `NEXT_PUBLIC_APP_URL`                           | No         |       2 | multiple defaults (dev)           |
| `NEXT_PUBLIC_ARCHON_UI_URL`                     | No         |       1 | not specified                     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`             | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_DEBUG`                             | No         |       1 | not specified                     |
| `NEXT_PUBLIC_DIFY_APP_ID`                       | No         |       2 | dev                               |
| `NEXT_PUBLIC_DIFY_WIDGET_URL`                   | No         |       2 | dev                               |
| `NEXT_PUBLIC_DOCS_BASE_URL`                     | No         |       1 | not specified                     |
| `NEXT_PUBLIC_GRAFANA_URL`                       | No         |       1 | not specified                     |
| `NEXT_PUBLIC_MEM0_PROXY_URL`                    | No         |       1 | not specified                     |
| `NEXT_PUBLIC_N8N_URL`                           | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_NEXUS_UI_URL`                      | No         |       1 | not specified                     |
| `NEXT_PUBLIC_NEXUS_URL`                         | No         |       4 | multiple defaults (dev)           |
| `NEXT_PUBLIC_OPENCLAW_URL`                      | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_OPENMEMORY_URL`                    | No         |       1 | not specified                     |
| `NEXT_PUBLIC_PORTAINER_URL`                     | No         |       1 | not specified                     |
| `NEXT_PUBLIC_QUOTE_API_URL`                     | No         |       1 | not specified                     |
| `NEXT_PUBLIC_SITE_NAME`                         | No         |       2 | not specified                     |
| `NEXT_PUBLIC_SITE_URL`                          | No         |       3 | multiple defaults (dev)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                 | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_SUPABASE_URL`                      | No         |       1 | not specified                     |
| `NEXT_PUBLIC_SUPPORT_EMAIL`                     | No         |       1 | not specified                     |
| `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL`           | No         |       1 | not specified                     |
| `NEXT_PUBLIC_TWENTY_URL`                        | No         |       3 | multiple defaults (dev)           |
| `NEXT_PUBLIC_WEBAPP_URL`                        | No         |       1 | not specified                     |
| `NEXT_PUBLIC_WEBHOOK_URL`                       | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_WS_URL`                            | No         |       1 | dev                               |
| `NEXUS_ADMIN_TOKEN`                             | Yes        |       7 | multiple defaults (not specified) |
| `NEXUS_ADMIN_URL`                               | No         |       1 | not specified                     |
| `NEXUS_AGENT_TOKEN`                             | Yes        |       4 | not specified                     |
| `NEXUS_API_KEY`                                 | Yes        |       7 | multiple defaults (not specified) |
| `NEXUS_API_URL`                                 | No         |       1 | not specified                     |
| `NEXUS_BASE_URL`                                | No         |       5 | multiple defaults (not specified) |
| `NEXUS_CIRCUIT_BREAKER_ENABLED`                 | No         |       4 | not specified                     |
| `NEXUS_CIRCUIT_BREAKER_THRESHOLD`               | No         |       4 | not specified                     |
| `NEXUS_CIRCUIT_BREAKER_TIMEOUT`                 | No         |       4 | not specified                     |
| `NEXUS_CONFIG`                                  | No         |       4 | not specified                     |
| `NEXUS_CONFIG_APPLY_ENABLED`                    | No         |       1 | not specified                     |
| `NEXUS_CONTEXT_AGGREGATION`                     | No         |       4 | not specified                     |
| `NEXUS_CPU_LIMIT`                               | No         |       1 | not specified                     |
| `NEXUS_DEPLOY_TARGET`                           | No         |       1 | not specified                     |
| `NEXUS_FALLBACK_RETRIES`                        | No         |       4 | not specified                     |
| `NEXUS_HEALTH_CHECK_ENABLED`                    | No         |       4 | not specified                     |
| `NEXUS_HEALTH_CHECK_INTERVAL`                   | No         |       4 | not specified                     |
| `NEXUS_HEALTH_CHECK_TIMEOUT`                    | No         |       3 | not specified                     |
| `NEXUS_HOST`                                    | No         |       3 | not specified                     |
| `NEXUS_INTERNAL_BASE_URL`                       | No         |       3 | not specified                     |
| `NEXUS_INTERNAL_BEARER_TOKEN`                   | Yes        |       1 | not specified                     |
| `NEXUS_JWT_SECRET`                              | Yes        |       4 | not specified                     |
| `NEXUS_LITELLM_MASTER_KEY`                      | Yes        |       5 | not specified                     |
| `NEXUS_LOAD_BALANCING`                          | No         |       3 | not specified                     |
| `NEXUS_MAX_CONCURRENT_REQUESTS`                 | No         |       3 | not specified                     |
| `NEXUS_MCP_PORT`                                | No         |       1 | not specified                     |
| `NEXUS_MCP_URL`                                 | No         |       5 | multiple defaults (not specified) |
| `NEXUS_MEMORY_LIMIT`                            | No         |       2 | multiple defaults (not specified) |
| `NEXUS_METRICS_PORT`                            | No         |       1 | not specified                     |
| `NEXUS_MODEL_ROUTING_ENABLED`                   | No         |       3 | not specified                     |
| `NEXUS_MONITORING_ENABLED`                      | No         |       1 | not specified                     |
| `NEXUS_REDIS_URL`                               | No         |       4 | not specified                     |
| `NEXUS_ROUTER_API_KEY`                          | Yes        |       5 | not specified                     |
| `NEXUS_ROUTER_COST_AWARE`                       | No         |       4 | not specified                     |
| `NEXUS_ROUTER_FALLBACK_ENABLED`                 | No         |       4 | not specified                     |
| `NEXUS_ROUTER_HOST`                             | No         |       5 | multiple defaults (dev)           |
| `NEXUS_ROUTER_LATENCY_THRESHOLD`                | No         |       4 | not specified                     |
| `NEXUS_ROUTER_MCP_PORT`                         | No         |       1 | not specified                     |
| `NEXUS_ROUTER_PORT`                             | No         |       3 | multiple defaults (not specified) |
| `NEXUS_ROUTER_STRATEGY`                         | No         |       4 | not specified                     |
| `NEXUS_ROUTER_URL`                              | No         |      14 | multiple defaults (dev)           |
| `NEXUS_STATUS_URL`                              | No         |       1 | not specified                     |
| `NEXUS_UI_SETTINGS_PATH`                        | No         |       1 | not specified                     |
| `NEXUS_URL`                                     | No         |       1 | not specified                     |
| `NODE_ENV`                                      | No         |      25 | multiple defaults (dev, prod)     |
| `NODE_VERSION`                                  | No         |       1 | not specified                     |
| `NOTION_TOKEN`                                  | Yes        |       4 | not specified                     |
| `NVIDIA_VISIBLE_DEVICES`                        | No         |       6 | multiple defaults (not specified) |
| `NYRA_CHAT_INTERNAL_API_BASE_URL`               | No         |       1 | not specified                     |
| `NYRA_CHAT_INTERNAL_PROXY_TOKEN`                | Yes        |       3 | not specified                     |
| `NYRA_DOCKER_NETWORK`                           | No         |       1 | not specified                     |
| `NYRA_ENABLE_MOCKS`                             | No         |       1 | not specified                     |
| `NYRA_ENV`                                      | No         |       1 | dev                               |
| `NYRA_ENVIRONMENT`                              | No         |       2 | multiple defaults (dev, prod)     |
| `NYRA_HTTP_ALLOWLIST`                           | No         |       1 | not specified                     |
| `NYRA_KYUTAI_DECODE_IMAGE`                      | No         |       1 | dev                               |
| `NYRA_KYUTAI_STT_IMAGE`                         | No         |       1 | dev                               |
| `NYRA_KYUTAI_TTS_IMAGE`                         | No         |       1 | dev                               |
| `NYRA_KYUTAI_VAD_IMAGE`                         | No         |       1 | dev                               |
| `NYRA_MCP_PORT`                                 | No         |       1 | not specified                     |
| `NYRA_NETWORK`                                  | No         |       1 | not specified                     |
| `NYRA_NETWORK_NAME`                             | No         |       2 | not specified                     |
| `NYRA_NODE_ID`                                  | No         |       2 | multiple defaults (not specified) |
| `NYRA_NODE_TYPE`                                | No         |       2 | not specified                     |
| `NYRA_VOICE_COORDINATOR_IMAGE`                  | No         |       1 | dev                               |
| `NYRA_VOICE_EDGE_IMAGE`                         | No         |       1 | dev                               |
| `NYRA_VOICE_EGRESS_IMAGE`                       | No         |       1 | dev                               |
| `NYRA_VOICE_LLM_BRIDGE_IMAGE`                   | No         |       1 | dev                               |
| `NYRA_WEBHOOK_SECRET`                           | Yes        |       2 | not specified                     |
| `OCR_CONFIDENCE_THRESHOLD`                      | No         |       1 | not specified                     |
| `OCR_ENABLED`                                   | No         |       1 | not specified                     |
| `OCR_LANGUAGE`                                  | No         |       1 | not specified                     |
| `OLLAMA_ENABLED`                                | No         |       1 | not specified                     |
| `OLLAMA_HOST`                                   | No         |       5 | not specified                     |
| `OLLAMA_KEEP_ALIVE`                             | No         |       1 | not specified                     |
| `OLLAMA_MAX_LOADED_MODELS`                      | No         |       1 | not specified                     |
| `OLLAMA_MAX_VRAM`                               | No         |       1 | not specified                     |
| `OLLAMA_MODEL`                                  | No         |       1 | not specified                     |
| `OLLAMA_MODELS`                                 | No         |       1 | not specified                     |
| `OLLAMA_NUM_PARALLEL`                           | No         |       1 | not specified                     |
| `OLLAMA_PORT`                                   | No         |       8 | not specified                     |
| `OMNIROUTE_API_KEY`                             | Yes        |      10 | multiple defaults (dev)           |
| `OMNIROUTE_API_KEY_SECRET`                      | Yes        |       6 | not specified                     |
| `OMNIROUTE_BASE_URL`                            | No         |       4 | multiple defaults (not specified) |
| `OMNIROUTE_CLAUDE_LITELLM_MODEL`                | No         |       1 | not specified                     |
| `OMNIROUTE_CODEX_LITELLM_MODEL`                 | No         |       1 | not specified                     |
| `OMNIROUTE_FREE_LITELLM_MODEL`                  | No         |       1 | not specified                     |
| `OMNIROUTE_IMAGE`                               | No         |       1 | not specified                     |
| `OMNIROUTE_INITIAL_PASSWORD`                    | Yes        |       6 | not specified                     |
| `OMNIROUTE_JWT_SECRET`                          | Yes        |       6 | not specified                     |
| `OMNIROUTE_PORT`                                | No         |       1 | not specified                     |
| `OPENAI_API_KEY`                                | Yes        |      11 | multiple defaults (not specified) |
| `OPENAI_BASE_URL`                               | No         |       6 | multiple defaults (not specified) |
| `OPENAI_MAX_TOKENS`                             | Yes        |       1 | not specified                     |
| `OPENAI_MODEL`                                  | No         |       1 | not specified                     |
| `OPENAI_ORG_ID`                                 | No         |       1 | not specified                     |
| `OPENCLAW_API_KEY`                              | Yes        |       1 | not specified                     |
| `OPENCLAW_CHAT_PATH`                            | No         |       3 | not specified                     |
| `OPENCLAW_COMPOSE_VALIDATE`                     | No         |       1 | not specified                     |
| `OPENCLAW_CONFIG_PATH`                          | No         |       1 | not specified                     |
| `OPENCLAW_DATA_DIR`                             | No         |       1 | not specified                     |
| `OPENCLAW_DEFAULT_MODEL`                        | No         |       3 | multiple defaults (dev)           |
| `OPENCLAW_DOCKER_APT_PACKAGES`                  | No         |       2 | multiple defaults (not specified) |
| `OPENCLAW_ENABLE_OPEN_WEBUI_CHANNELS_PLUGIN`    | No         |       3 | not specified                     |
| `OPENCLAW_FORCE_BUILD`                          | No         |       1 | not specified                     |
| `OPENCLAW_GATEWAY_PORT`                         | No         |       1 | not specified                     |
| `OPENCLAW_GATEWAY_TOKEN`                        | Yes        |       8 | not specified                     |
| `OPENCLAW_HEALTH_TIMEOUT_S`                     | No         |       1 | not specified                     |
| `OPENCLAW_HOME_VOLUME`                          | No         |       1 | not specified                     |
| `OPENCLAW_HTTP_ALLOWLIST`                       | No         |       1 | not specified                     |
| `OPENCLAW_INSTALL_BROWSER`                      | No         |       2 | multiple defaults (not specified) |
| `OPENCLAW_MVP_IMAGE`                            | No         |       1 | dev                               |
| `OPENCLAW_OPENAI_BASE_URL`                      | No         |       1 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_BASE_URL`         | No         |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_CHANNEL_IDS_JSON` | No         |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_EMAIL`            | No         |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_ENABLED`          | No         |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_PASSWORD`         | Yes        |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_REF`              | No         |       3 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_REPO`             | No         |       4 | not specified                     |
| `OPENCLAW_OPEN_WEBUI_CHANNELS_REQUIRE_MENTION`  | No         |       4 | not specified                     |
| `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST`              | No         |       1 | not specified                     |
| `OPENCLAW_PORT`                                 | No         |       1 | not specified                     |
| `OPENCLAW_PORTS`                                | No         |       1 | not specified                     |
| `OPENCLAW_PROVIDER`                             | No         |       1 | not specified                     |
| `OPENCLAW_PUBLIC_BASE_URL`                      | No         |       5 | multiple defaults (dev)           |
| `OPENCLAW_SANDBOX_ENABLED`                      | No         |       2 | not specified                     |
| `OPENCLAW_SECRET_REF_MODE`                      | Yes        |       1 | not specified                     |
| `OPENCLAW_SESSION_PATH`                         | No         |       1 | not specified                     |
| `OPENCLAW_TOOLS_ALLOW`                          | No         |       1 | not specified                     |
| `OPENCLAW_TOOLS_DENY`                           | No         |       1 | not specified                     |
| `OPENCLAW_TOOL_POLICY`                          | No         |       2 | not specified                     |
| `OPENCLAW_UI_PREFIX`                            | No         |       1 | not specified                     |
| `OPENCLAW_UI_PROXY_PORT`                        | No         |       1 | not specified                     |
| `OPENCLAW_WEBHOOK_INGRESS_PATH`                 | Yes        |       1 | not specified                     |
| `OPENCLAW_WORKSPACE_VOLUME`                     | No         |       1 | not specified                     |
| `OPENHARNESS_A2A_URL`                           | No         |       1 | not specified                     |
| `OPENLIT_ALLOWED_CORS_ORIGINS`                  | No         |       6 | not specified                     |
| `OPENLIT_CLICKHOUSE_HTTP_PORT`                  | No         |       6 | not specified                     |
| `OPENLIT_CLICKHOUSE_NATIVE_PORT`                | No         |       6 | not specified                     |
| `OPENLIT_DB_NAME`                               | No         |       6 | not specified                     |
| `OPENLIT_DB_PASSWORD`                           | Yes        |       6 | not specified                     |
| `OPENLIT_DB_USER`                               | No         |       6 | not specified                     |
| `OPENLIT_GITHUB_CLIENT_ID`                      | No         |       1 | not specified                     |
| `OPENLIT_GITHUB_CLIENT_SECRET`                  | Yes        |       1 | not specified                     |
| `OPENLIT_GOOGLE_CLIENT_ID`                      | No         |       1 | not specified                     |
| `OPENLIT_GOOGLE_CLIENT_SECRET`                  | Yes        |       1 | not specified                     |
| `OPENLIT_HOST_PORT`                             | No         |       6 | not specified                     |
| `OPENLIT_NEXTAUTH_SECRET`                       | Yes        |       6 | not specified                     |
| `OPENLIT_NEXTAUTH_URL`                          | Yes        |       6 | not specified                     |
| `OPENLIT_OPAMP_ENVIRONMENT`                     | No         |       5 | dev                               |
| `OPENLIT_OPAMP_LOG_LEVEL`                       | No         |       5 | not specified                     |
| `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`        | No         |       5 | not specified                     |
| `OPENLIT_OPAMP_TLS_MAX_VERSION`                 | No         |       5 | not specified                     |
| `OPENLIT_OPAMP_TLS_MIN_VERSION`                 | No         |       5 | not specified                     |
| `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT`         | Yes        |       5 | not specified                     |
| `OPENLIT_OTLP_GRPC_PORT`                        | No         |       6 | not specified                     |
| `OPENLIT_OTLP_HTTP_PORT`                        | No         |       6 | not specified                     |
| `OPENLIT_TELEMETRY_ENABLED`                     | No         |       6 | not specified                     |
| `OPENLIT_VAULT_ENCRYPTION_KEY`                  | Yes        |       6 | not specified                     |
| `OPENROUTER_API_KEY`                            | Yes        |      17 | multiple defaults (not specified) |
| `OPENROUTER_BASE_URL`                           | No         |       7 | not specified                     |
| `OPENROUTER_FALLBACK_MODEL`                     | No         |       1 | not specified                     |
| `OPENROUTER_FREE_LITELLM_MODEL`                 | No         |       1 | not specified                     |
| `OPENROUTER_MGMT_API_KEY`                       | Yes        |       5 | not specified                     |
| `OPENROUTER_PROVISIONING`                       | No         |       5 | not specified                     |
| `OPENWEBUI_PORT`                                | No         |       1 | not specified                     |
| `OPENWEBUI_SECRET_KEY`                          | Yes        |       1 | not specified                     |
| `OPEN_WEBUI_URL`                                | No         |       1 | not specified                     |
| `OPT_TAG`                                       | No         |       1 | not specified                     |
| `OPT_TAG_CUSTOM`                                | No         |       1 | not specified                     |
| `OPT_TAG_GITHUB`                                | No         |       1 | not specified                     |
| `OPT_TAG_GITHUBSTARS`                           | No         |       1 | not specified                     |
| `OPT_TAG_LANGUAGE`                              | No         |       1 | not specified                     |
| `OPT_TAG_USERNAME`                              | No         |       1 | not specified                     |
| `ORACLE_MAIN_NETWORK`                           | No         |       7 | multiple defaults (not specified) |
| `ORACLE_TAILSCALE_AUTHKEY`                      | Yes        |       1 | not specified                     |
| `ORACLE_TAILSCALE_IP`                           | No         |       3 | not specified                     |
| `ORACLE_TUNNEL_ID`                              | No         |       1 | not specified                     |
| `ORACLE_TUNNEL_TOKEN`                           | Yes        |       3 | not specified                     |
| `ORCHESTRATOR_DNS_BIND_IP`                      | No         |       1 | not specified                     |
| `ORCHESTRATOR_PORTAINER_EDGE_ID`                | No         |       1 | not specified                     |
| `ORCHESTRATOR_TAILSCALE_AUTHKEY`                | Yes        |       1 | not specified                     |
| `ORCHESTRATOR_TAILSCALE_IP`                     | No         |       5 | multiple defaults (not specified) |
| `ORCHESTRATOR_TUNNEL_ID`                        | No         |       1 | not specified                     |
| `ORCHESTRATOR_TUNNEL_TOKEN`                     | Yes        |       1 | not specified                     |
| `ORCHESTRATOR_URL`                              | No         |       5 | multiple defaults (dev)           |
| `OR_API_KEY`                                    | Yes        |       5 | not specified                     |
| `PAGERDUTY_INTEGRATION_KEY`                     | Yes        |       1 | not specified                     |
| `PAPERCLIP_API_KEY`                             | Yes        |       5 | not specified                     |
| `PAPERCLIP_AUTH_DISABLE_SIGN_UP`                | Yes        |       1 | not specified                     |
| `PAPERCLIP_DB_NAME`                             | No         |       2 | multiple defaults (not specified) |
| `PAPERCLIP_DB_PASSWORD`                         | Yes        |       1 | not specified                     |
| `PAPERCLIP_DB_USER`                             | No         |       1 | not specified                     |
| `PAPERCLIP_HOST_PORT`                           | No         |       1 | not specified                     |
| `PAPERCLIP_IMAGE`                               | No         |       1 | not specified                     |
| `PAPERCLIP_PUBLIC_URL`                          | No         |       1 | not specified                     |
| `PAPERCLIP_SESSION_SECRET`                      | Yes        |       1 | not specified                     |
| `PASSWORD_RESET_EXPIRY`                         | Yes        |       1 | not specified                     |
| `PERF_MONITOR_PORT`                             | No         |       1 | not specified                     |
| `PG_DATABASE_URL`                               | No         |       1 | not specified                     |
| `PKI_ENABLED`                                   | No         |       1 | not specified                     |
| `PORT`                                          | No         |      21 | multiple defaults (dev)           |
| `PORTAINER_ADMIN_PASSWORD`                      | Yes        |       1 | not specified                     |
| `PORTAINER_ADMIN_USERNAME`                      | No         |       2 | multiple defaults (not specified) |
| `PORTAINER_AGENT_PORT`                          | No         |       1 | not specified                     |
| `PORTAINER_AGENT_SECRET`                        | Yes        |       1 | not specified                     |
| `PORTAINER_AGENT_TAGS`                          | No         |       1 | not specified                     |
| `PORTAINER_API_TOKEN`                           | Yes        |       1 | not specified                     |
| `PORTAINER_EDGE_ID`                             | No         |      12 | multiple defaults (dev)           |
| `PORTAINER_EDGE_INSECURE_POLL`                  | No         |       5 | not specified                     |
| `PORTAINER_EDGE_KEY`                            | Yes        |      13 | multiple defaults (dev)           |
| `PORTAINER_HTTP_PORT`                           | No         |       1 | not specified                     |
| `PORTAINER_ORCHESTRATOR_URL`                    | No         |       1 | not specified                     |
| `PORTAINER_PORT`                                | No         |       1 | not specified                     |
| `PORTAINER_PUBLIC_URL`                          | No         |       1 | not specified                     |
| `PORTAINER_SYMLINK`                             | No         |       4 | multiple defaults (dev)           |
| `PORTAINER_URL`                                 | No         |       2 | multiple defaults (not specified) |
| `POSTGRES_CPU_LIMIT`                            | No         |       1 | not specified                     |
| `POSTGRES_DB`                                   | No         |      10 | multiple defaults (not specified) |
| `POSTGRES_HOST`                                 | No         |       2 | multiple defaults (dev)           |
| `POSTGRES_MAX_CONNECTIONS`                      | No         |       1 | not specified                     |
| `POSTGRES_MEMORY_LIMIT`                         | No         |       2 | multiple defaults (not specified) |
| `POSTGRES_PASSWORD`                             | Yes        |      11 | multiple defaults (not specified) |
| `POSTGRES_POOL_SIZE`                            | No         |       1 | not specified                     |
| `POSTGRES_PORT`                                 | No         |       4 | not specified                     |
| `POSTGRES_URL`                                  | No         |       4 | multiple defaults (dev)           |
| `POSTGRES_USER`                                 | No         |       9 | multiple defaults (not specified) |
| `POSTGRES_WORKER_RTX3060_PASSWORD`              | Yes        |       1 | not specified                     |
| `POSTGRES_WORKER_RTX3090TI_PASSWORD`            | Yes        |       1 | not specified                     |
| `POSTGRES_WORKER_RTX5090_PASSWORD`              | Yes        |       1 | not specified                     |
| `PRIMARY_MODELS`                                | No         |       1 | not specified                     |
| `PRODUCTION_API_KEY`                            | Yes        |       1 | not specified                     |
| `PROFILING_ENABLED`                             | No         |       2 | not specified                     |
| `PROJECTNYRA_DOMAIN`                            | No         |       5 | not specified                     |
| `PROMETHEUS_BASIC_AUTH_PASSWORD`                | Yes        |       1 | not specified                     |
| `PROMETHEUS_HOST`                               | No         |       1 | not specified                     |
| `PROMETHEUS_PORT`                               | No         |       7 | not specified                     |
| `PROMETHEUS_PUSH_GATEWAY`                       | No         |       1 | not specified                     |
| `PROMETHEUS_RETENTION_TIME`                     | No         |       5 | not specified                     |
| `PROMETHEUS_SCRAPE_INTERVAL`                    | No         |       2 | not specified                     |
| `PROMETHEUS_URL`                                | No         |       1 | not specified                     |
| `QDRANT_API_KEY`                                | Yes        |       7 | not specified                     |
| `QDRANT_MAX_SEARCH_THREADS`                     | No         |       1 | not specified                     |
| `QDRANT_URL`                                    | No         |       1 | not specified                     |
| `QUERY_TIMEOUT`                                 | No         |       1 | not specified                     |
| `QUOTE_API_PORT`                                | No         |       2 | not specified                     |
| `QUOTE_API_SECRET`                              | Yes        |       4 | multiple defaults (not specified) |
| `QUOTE_API_URL`                                 | No         |       1 | not specified                     |
| `QUOTE_ENGINE_HOST`                             | No         |       2 | not specified                     |
| `QUOTE_ENGINE_PORT`                             | No         |       2 | not specified                     |
| `QUOTE_ENGINE_URL`                              | No         |       2 | multiple defaults (dev)           |
| `RATE_CACHE_KEY_PREFIX`                         | Yes        |       1 | not specified                     |
| `RATE_LIMIT_DURATION`                           | No         |       1 | not specified                     |
| `RATE_LIMIT_MAX_REQUESTS`                       | No         |       5 | not specified                     |
| `RATE_LIMIT_POINTS`                             | No         |       1 | not specified                     |
| `RATE_LIMIT_REQUESTS`                           | No         |       1 | not specified                     |
| `RATE_LIMIT_WINDOW`                             | No         |       1 | not specified                     |
| `RATE_LIMIT_WINDOW_MS`                          | No         |       5 | multiple defaults (not specified) |
| `REDIS_AUTH_TOKEN`                              | Yes        |       3 | not specified                     |
| `REDIS_CPU_LIMIT`                               | No         |       1 | not specified                     |
| `REDIS_DB`                                      | No         |       8 | not specified                     |
| `REDIS_ENABLED`                                 | No         |       1 | not specified                     |
| `REDIS_EVICTION_POLICY`                         | No         |       2 | not specified                     |
| `REDIS_HOST`                                    | No         |       9 | multiple defaults (dev)           |
| `REDIS_MAX_MEMORY`                              | No         |       2 | not specified                     |
| `REDIS_MEMORY_LIMIT`                            | No         |       2 | multiple defaults (not specified) |
| `REDIS_PASSWORD`                                | Yes        |      13 | multiple defaults (dev)           |
| `REDIS_PORT`                                    | No         |       7 | not specified                     |
| `REDIS_URL`                                     | No         |       5 | multiple defaults (dev)           |
| `RESEND_API_KEY`                                | Yes        |       1 | not specified                     |
| `RETRY_DELAY_MS`                                | No         |       2 | not specified                     |
| `ROUTE_ALL_AI_THROUGH_NEXUS`                    | No         |       2 | not specified                     |
| `RTX3060_LAN_IP`                                | No         |       1 | not specified                     |
| `RTX3090TI_LAN_IP`                              | No         |       1 | not specified                     |
| `RTX5090_LAN_IP`                                | No         |       1 | not specified                     |
| `RUVECTOR_HOST`                                 | No         |       1 | not specified                     |
| `RUVECTOR_PGADMIN_PORT`                         | No         |       1 | not specified                     |
| `RUVECTOR_PORT`                                 | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_DB`                          | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_PASSWORD`                    | Yes        |       2 | multiple defaults (not specified) |
| `RUVECTOR_POSTGRES_PORT`                        | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_USER`                        | No         |       1 | not specified                     |
| `S3_BUCKET`                                     | No         |       1 | not specified                     |
| `S3_ENDPOINT`                                   | No         |       1 | not specified                     |
| `SCORING_ENABLED`                               | No         |       1 | not specified                     |
| `SCORING_MAX_SCORE`                             | No         |       1 | not specified                     |
| `SCORING_MIN_SCORE`                             | No         |       1 | not specified                     |
| `SCRAPER_INTERVAL_MINUTES`                      | No         |       1 | not specified                     |
| `SCRAPER_TIMEOUT_MS`                            | No         |       1 | not specified                     |
| `SEARXNG_BASE_URL`                              | No         |       1 | not specified                     |
| `SEARXNG_HOST_PORT`                             | No         |       1 | not specified                     |
| `SEARXNG_SECRET`                                | Yes        |       6 | not specified                     |
| `SEARXNG_UWSGI_THREADS`                         | No         |       1 | not specified                     |
| `SEARXNG_UWSGI_WORKERS`                         | No         |       1 | not specified                     |
| `SECRET_SCANNING_ENABLED`                       | Yes        |       3 | not specified                     |
| `SECURITY_SERVICE_PORT`                         | No         |       1 | not specified                     |
| `SENDGRID_API_KEY`                              | Yes        |       2 | not specified                     |
| `SENTRY_ENVIRONMENT`                            | No         |       2 | dev                               |
| `SERVER_URL`                                    | No         |       1 | not specified                     |
| `SERVICES`                                      | No         |       1 | not specified                     |
| `SERVICE_HF_TOKEN`                              | Yes        |       5 | not specified                     |
| `SESSION_TIMEOUT`                               | No         |       1 | not specified                     |
| `SHADCN_REGISTRY_URL`                           | No         |       1 | not specified                     |
| `SHARED_SCHEMA_VERSION`                         | No         |       1 | not specified                     |
| `SIGN_IN_PREFILLED`                             | No         |       1 | not specified                     |
| `SLACK_WEBHOOK_URL`                             | Yes        |       1 | not specified                     |
| `SMTP_FROM`                                     | No         |       1 | not specified                     |
| `SMTP_FROM_NAME`                                | No         |       1 | not specified                     |
| `SMTP_HOST`                                     | No         |       4 | not specified                     |
| `SMTP_PASSWORD`                                 | Yes        |       4 | multiple defaults (not specified) |
| `SMTP_PORT`                                     | No         |       4 | not specified                     |
| `SMTP_SECURE`                                   | No         |       2 | not specified                     |
| `SMTP_USER`                                     | No         |       4 | multiple defaults (not specified) |
| `SMTP_USERNAME`                                 | No         |       1 | not specified                     |
| `SPECIALIZATION`                                | No         |       1 | not specified                     |
| `SSH_CA_ENABLED`                                | No         |       1 | not specified                     |
| `SSL_ENABLED`                                   | No         |       1 | not specified                     |
| `STOP_ENFORCEMENT_ENABLED`                      | No         |       1 | not specified                     |
| `STORAGE_TYPE`                                  | No         |       1 | dev                               |
| `STT_PRECISION`                                 | No         |       1 | not specified                     |
| `SUPABASE_ANON_KEY`                             | Yes        |       2 | dev                               |
| `SUPABASE_DB_PASSWORD`                          | Yes        |       1 | dev                               |
| `SUPABASE_JWT_SECRET`                           | Yes        |       2 | not specified                     |
| `SUPABASE_SERVICE_KEY`                          | Yes        |       1 | not specified                     |
| `SUPABASE_SERVICE_ROLE_KEY`                     | Yes        |       2 | not specified                     |
| `SUPABASE_URL`                                  | No         |       1 | not specified                     |
| `SYNC_BATCH_SIZE`                               | No         |       2 | not specified                     |
| `SYNC_INTERVAL_MINUTES`                         | No         |       2 | not specified                     |
| `TAILSCALE_AUTHKEY`                             | Yes        |      11 | multiple defaults (dev)           |
| `TAILSCALE_CLIENT_ID`                           | No         |       1 | not specified                     |
| `TAILSCALE_CLIENT_SECRET`                       | Yes        |       1 | not specified                     |
| `TAILSCALE_ENABLED`                             | No         |       2 | multiple defaults (not specified) |
| `TAILSCALE_EXIT_NODE_ENABLED`                   | No         |       1 | not specified                     |
| `TAILSCALE_HOSTNAME`                            | No         |       1 | not specified                     |
| `TAILSCALE_IP`                                  | No         |       4 | multiple defaults (not specified) |
| `TAILSCALE_KEY`                                 | Yes        |       3 | multiple defaults (dev)           |
| `TAILSCALE_MAGIC_DNS_ENABLED`                   | No         |       1 | not specified                     |
| `TAILSCALE_MESH_NETWORK`                        | No         |       1 | not specified                     |
| `TAILSCALE_NETWORK_PREFIX`                      | No         |       1 | not specified                     |
| `TAILSCALE_SUBNET_ROUTES`                       | No         |       1 | not specified                     |
| `TAILSCALE_TAILNET`                             | No         |       2 | not specified                     |
| `TAVILY_API_KEY`                                | Yes        |       2 | multiple defaults (dev)           |
| `TELEGRAM_BOT_API_KEY`                          | Yes        |       1 | not specified                     |
| `TELEGRAM_BOT_TOKEN`                            | Yes        |       3 | not specified                     |
| `TELEMETRY_ENABLED`                             | No         |       2 | not specified                     |
| `TENANT_ENGINEERING_KEY`                        | Yes        |       1 | not specified                     |
| `TENANT_PRODUCTION_KEY`                         | Yes        |       1 | prod                              |
| `TENANT_RESEARCH_KEY`                           | Yes        |       1 | not specified                     |
| `TERMINAL_LIFETIME_SECONDS`                     | No         |       1 | not specified                     |
| `TERMINAL_MODAL_IMAGE`                          | No         |       1 | not specified                     |
| `TERMINAL_SSH_HOST`                             | No         |       1 | not specified                     |
| `TERMINAL_SSH_KEY`                              | Yes        |       1 | not specified                     |
| `TERMINAL_SSH_PORT`                             | No         |       1 | not specified                     |
| `TERMINAL_SSH_USER`                             | No         |       1 | not specified                     |
| `TERMINAL_TIMEOUT`                              | No         |       1 | not specified                     |
| `TEST_DATABASE_URL`                             | No         |       1 | not specified                     |
| `THUMBNAIL_QUALITY`                             | No         |       1 | not specified                     |
| `THUMBNAIL_SIZE`                                | No         |       1 | not specified                     |
| `TTS_PRECISION`                                 | No         |       1 | not specified                     |
| `TWEAKCN_PRESET`                                | No         |       1 | not specified                     |
| `TWENTYCRM_API_KEY`                             | Yes        |       5 | multiple defaults (not specified) |
| `TWENTYCRM_API_URL`                             | No         |       2 | not specified                     |
| `TWENTYCRM_MCP_PORT`                            | No         |       2 | not specified                     |
| `TWENTYCRM_PORT`                                | No         |       1 | not specified                     |
| `TWENTYCRM_WEBHOOK_SECRET`                      | Yes        |       2 | not specified                     |
| `TWENTY_ACCESS_TOKEN`                           | Yes        |       2 | not specified                     |
| `TWENTY_ACCESS_TOKEN_SECRET`                    | Yes        |       4 | not specified                     |
| `TWENTY_API_KEY`                                | Yes        |       4 | not specified                     |
| `TWENTY_API_URL`                                | No         |       1 | dev                               |
| `TWENTY_APP_SECRET`                             | Yes        |       5 | multiple defaults (not specified) |
| `TWENTY_CRM_API_KEY`                            | Yes        |       8 | multiple defaults (dev)           |
| `TWENTY_CRM_API_URL`                            | No         |       1 | not specified                     |
| `TWENTY_CRM_ENABLED`                            | No         |       2 | not specified                     |
| `TWENTY_CRM_SYNC_ENABLED`                       | No         |       1 | not specified                     |
| `TWENTY_CRM_SYNC_INTERVAL`                      | No         |       1 | not specified                     |
| `TWENTY_CRM_URL`                                | No         |       6 | multiple defaults (dev)           |
| `TWENTY_CRM_WORKSPACE_ID`                       | No         |       2 | multiple defaults (not specified) |
| `TWENTY_DATABASE_URL`                           | No         |       1 | not specified                     |
| `TWENTY_DB_NAME`                                | No         |       2 | not specified                     |
| `TWENTY_DB_PASSWORD`                            | Yes        |       6 | not specified                     |
| `TWENTY_DB_USER`                                | No         |       2 | not specified                     |
| `TWENTY_ENCRYPTION_SECRET`                      | Yes        |       7 | multiple defaults (not specified) |
| `TWENTY_FILE_TOKEN_SECRET`                      | Yes        |       4 | not specified                     |
| `TWENTY_FRONTEND_URL`                           | No         |       4 | multiple defaults (not specified) |
| `TWENTY_FRONT_BASE_URL`                         | No         |       3 | multiple defaults (dev)           |
| `TWENTY_HOST`                                   | No         |       1 | not specified                     |
| `TWENTY_JWT_SECRET`                             | Yes        |       4 | multiple defaults (not specified) |
| `TWENTY_LOGIN_TOKEN_SECRET`                     | Yes        |       2 | not specified                     |
| `TWENTY_PASSWORD_SALT`                          | Yes        |       3 | multiple defaults (not specified) |
| `TWENTY_PG_DATABASE_URL`                        | No         |       2 | not specified                     |
| `TWENTY_PORT`                                   | No         |       1 | not specified                     |
| `TWENTY_POSTGRES_DB`                            | No         |       1 | not specified                     |
| `TWENTY_POSTGRES_PASSWORD`                      | Yes        |       1 | not specified                     |
| `TWENTY_POSTGRES_USER`                          | No         |       1 | not specified                     |
| `TWENTY_REDIS_PASSWORD`                         | Yes        |       3 | not specified                     |
| `TWENTY_REDIS_URL`                              | No         |       2 | not specified                     |
| `TWENTY_REFRESH_TOKEN_SECRET`                   | Yes        |       2 | not specified                     |
| `TWENTY_SERVER_URL`                             | No         |       4 | multiple defaults (dev)           |
| `TWENTY_WEBHOOK_SECRET`                         | Yes        |       1 | not specified                     |
| `TWILIO_ACCOUNT_SID`                            | No         |       8 | multiple defaults (not specified) |
| `TWILIO_AUTH_TOKEN`                             | Yes        |       8 | multiple defaults (not specified) |
| `TWILIO_FROM_NUMBER`                            | No         |       1 | not specified                     |
| `TWILIO_PHONE_NUMBER`                           | No         |       1 | not specified                     |
| `TZ`                                            | No         |       1 | not specified                     |
| `UNMUTE_ASSISTANT_GATEWAY_URL`                  | No         |       1 | not specified                     |
| `UNMUTE_CACHE_VOLUME`                           | No         |       1 | not specified                     |
| `UNMUTE_HOST_PORT`                              | No         |       2 | multiple defaults (not specified) |
| `UNMUTE_IMAGE`                                  | No         |       2 | not specified                     |
| `UNMUTE_LLM_BASE_URL`                           | No         |       1 | not specified                     |
| `UNMUTE_MODEL_PROVIDER`                         | No         |       1 | not specified                     |
| `UNMUTE_MODEL_VOLUME`                           | No         |       1 | not specified                     |
| `UNMUTE_OPENAI_API_KEY`                         | Yes        |       1 | not specified                     |
| `UNMUTE_PUBLIC_BASE_URL`                        | No         |       2 | dev                               |
| `UPLOAD_DIR`                                    | No         |       1 | not specified                     |
| `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX3090TI`  | No         |       1 | not specified                     |
| `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX5090`    | No         |       1 | not specified                     |
| `VLLM_HOST`                                     | No         |       4 | not specified                     |
| `VLLM_MODEL`                                    | No         |       6 | multiple defaults (not specified) |
| `VLLM_MODEL_WORKER_RTX3090TI`                   | No         |       1 | not specified                     |
| `VLLM_MODEL_WORKER_RTX5090`                     | No         |       1 | not specified                     |
| `VLLM_PORT`                                     | No         |      11 | multiple defaults (not specified) |
| `VLLM_URL`                                      | No         |       2 | dev                               |
| `VOICE_PTP_INTERFACE`                           | No         |       1 | not specified                     |
| `VOICE_RTP_PORT_RANGE`                          | No         |       1 | not specified                     |
| `VPS_LITELLM_MASTER_KEY`                        | Yes        |       1 | not specified                     |
| `VRAM_GB`                                       | No         |       1 | not specified                     |
| `WEBAPP_URL`                                    | No         |       1 | not specified                     |
| `WEBHOOK_RETRY_ATTEMPTS`                        | Yes        |       1 | not specified                     |
| `WEBHOOK_RETRY_DELAY`                           | Yes        |       1 | not specified                     |
| `WEBHOOK_TIMEOUT`                               | Yes        |       1 | not specified                     |
| `WEBHOOK_URL`                                   | Yes        |       3 | multiple defaults (dev)           |
| `WHATSAPP_ALLOW_ALL_USERS`                      | No         |       1 | not specified                     |
| `WHATSAPP_DM_POLICY`                            | No         |       1 | not specified                     |
| `WHATSAPP_ENABLED`                              | No         |       1 | not specified                     |
| `WHATSAPP_HOME_CHANNEL`                         | No         |       1 | not specified                     |
| `WHATSAPP_HOME_CHANNEL_NAME`                    | No         |       1 | not specified                     |
| `WHATSAPP_MODE`                                 | No         |       1 | not specified                     |
| `WHATSAPP_PHONE_NUMBER`                         | No         |       1 | not specified                     |
| `WORKER_3060_API_KEY`                           | Yes        |       1 | not specified                     |
| `WORKER_3060_CHAT_LITELLM_MODEL`                | No         |       1 | not specified                     |
| `WORKER_3060_EMBED_LITELLM_MODEL`               | No         |       1 | not specified                     |
| `WORKER_3060_MODELS`                            | No         |       2 | multiple defaults (not specified) |
| `WORKER_3060_OLLAMA_BASE_URL`                   | No         |       1 | not specified                     |
| `WORKER_3060_OLLAMA_PORT`                       | No         |       1 | not specified                     |
| `WORKER_3060_PORTAINER_AGENT_BIND_ADDR`         | No         |       1 | not specified                     |
| `WORKER_3060_PORTAINER_EDGE_ID`                 | No         |       1 | not specified                     |
| `WORKER_3060_PORTAINER_EDGE_KEY`                | Yes        |       1 | dev                               |
| `WORKER_3060_PORTAINER_ENDPOINT_ID`             | No         |       1 | not specified                     |
| `WORKER_3060_PORTAINER_HOST_IP`                 | No         |       1 | not specified                     |
| `WORKER_3060_URL`                               | No         |       2 | multiple defaults (not specified) |
| `WORKER_3090TI_MODEL`                           | No         |       1 | not specified                     |
| `WORKER_3090TI_VLLM_PORT`                       | No         |       1 | not specified                     |
| `WORKER_3090_API_KEY`                           | Yes        |       1 | not specified                     |
| `WORKER_3090_LITELLM_MODEL`                     | No         |       1 | not specified                     |
| `WORKER_3090_MODELS`                            | No         |       2 | not specified                     |
| `WORKER_3090_URL`                               | No         |       2 | multiple defaults (not specified) |
| `WORKER_3090_VLLM_BASE_URL`                     | No         |       1 | not specified                     |
| `WORKER_5090_API_KEY`                           | Yes        |       1 | not specified                     |
| `WORKER_5090_LITELLM_MODEL`                     | No         |       1 | not specified                     |
| `WORKER_5090_MODEL`                             | No         |       1 | not specified                     |
| `WORKER_5090_MODELS`                            | No         |       2 | not specified                     |
| `WORKER_5090_TAILSCALE_AUTHKEY`                 | Yes        |       1 | not specified                     |
| `WORKER_5090_URL`                               | No         |       2 | multiple defaults (not specified) |
| `WORKER_5090_VLLM_BASE_URL`                     | No         |       1 | not specified                     |
| `WORKER_5090_VLLM_PORT`                         | No         |       1 | not specified                     |
| `WORKER_GRAFANA_PORT`                           | No         |       1 | not specified                     |
| `WORKER_ID`                                     | No         |       1 | not specified                     |
| `WORKER_LOCAL_API_KEY`                          | Yes        |       1 | not specified                     |
| `WORKER_ROLE`                                   | No         |       1 | not specified                     |
| `WORKER_RTX3060_API_KEY`                        | Yes        |       1 | not specified                     |
| `WORKER_RTX3060_EMBEDDING_MODEL`                | No         |       5 | not specified                     |
| `WORKER_RTX3060_LITELLM_API_KEY`                | Yes        |       1 | not specified                     |
| `WORKER_RTX3060_LITELLM_BASE_URL`               | No         |       5 | not specified                     |
| `WORKER_RTX3060_LITELLM_MASTER_KEY`             | Yes        |       1 | not specified                     |
| `WORKER_RTX3060_LITELLM_MODEL`                  | No         |       5 | not specified                     |
| `WORKER_RTX3090TI_API_KEY`                      | Yes        |       5 | not specified                     |
| `WORKER_RTX3090TI_LITELLM_API_KEY`              | Yes        |       1 | not specified                     |
| `WORKER_RTX3090TI_LITELLM_BASE_URL`             | No         |       5 | not specified                     |
| `WORKER_RTX3090TI_LITELLM_MODEL`                | No         |       5 | not specified                     |
| `WORKER_RTX3090TI_MAC_ADDRESS`                  | No         |       1 | not specified                     |
| `WORKER_RTX5090PORTAINER_EDGE_KEY`              | Yes        |       1 | not specified                     |
| `WORKER_RTX5090_API_KEY`                        | Yes        |       5 | not specified                     |
| `WORKER_RTX5090_LITELLM_API_KEY`                | Yes        |       2 | not specified                     |
| `WORKER_RTX5090_LITELLM_BASE_URL`               | No         |       5 | not specified                     |
| `WORKER_RTX5090_LITELLM_MODEL`                  | No         |       5 | not specified                     |
| `WORKER_RTX5090_MAC_ADDRESS`                    | No         |       1 | not specified                     |
| `WORKER_RTX5090_PORTAINER_AGENT_BIND_ADDR`      | No         |       2 | not specified                     |
| `WORKER_RTX5090_PORTAINER_AGENT_TAGS`           | No         |       2 | not specified                     |
| `WORKER_RTX5090_PORTAINER_EDGE_ID`              | No         |       2 | not specified                     |
| `WORKER_RTX5090_PORTAINER_EDGE_INSECURE_POLL`   | No         |       2 | not specified                     |
| `WORKER_RTX5090_PORTAINER_EDGE_KEY`             | Yes        |       1 | dev                               |
| `WORKER_RTX5090_PORTAINER_ENDPOINT_ID`          | No         |       1 | not specified                     |
| `XAI_API_KEY`                                   | Yes        |       1 | not specified                     |

## Host-specific secret/env lists

### orchestrator

- `ACTIVEPIECES_API_KEY` (secret)
- `ACTIVEPIECES_API_URL`
- `ACTIVEPIECES_BASE_URL`
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_HOST`
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `ACTIVEPIECES_URL`
- `ACTIVEPIECES_WEBHOOK_SECRET` (secret)
- `ADAPTER_COMMAND_JSON`
- `ADAPTER_DRIVER`
- `ADAPTER_OPENAI_API_KEY` (secret)
- `ADAPTER_OPENAI_BASE_URL`
- `ADAPTER_OPENAI_MODEL`
- `ADAPTER_PROMPT_MODE`
- `ADAPTER_STATE_DIR`
- `ADAPTER_TIMEOUT_MS`
- `ADAPTER_WORKDIR`
- `ADGUARD_DASHBOARD_BIND_IP`
- `AGENT_BROWSER_ENGINE`
- `AGENT_DESCRIPTION`
- `AGENT_NAME`
- `AGENT_PUBLIC_URL`
- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_ADMIN_USER`
- `AGENT_VAULT_GATEWAY_PORT`
- `AGENT_VAULT_INFISICAL_URL`
- `AGENT_VAULT_LOGS_MAX_AGE_HOURS`
- `AGENT_VAULT_LOGS_MAX_ROWS_PER_VAULT`
- `AGENT_VAULT_LOG_LEVEL`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_SMTP_FROM`
- `AGENT_VAULT_SMTP_FROM_NAME`
- `AGENT_VAULT_SMTP_HOST`
- `AGENT_VAULT_SMTP_PASSWORD` (secret)
- `AGENT_VAULT_SMTP_PORT`
- `AGENT_VAULT_SMTP_TLS_MODE`
- `AGENT_VAULT_SMTP_TLS_SKIP_VERIFY`
- `AGENT_VAULT_SMTP_USERNAME`
- `AGENT_VAULT_TOKEN` (secret)
- `AGENT_VAULT_TRUSTED_PROXIES`
- `AGENT_VAULT_UA_CLIENT_ID`
- `AGENT_VAULT_UA_CLIENT_SECRET` (secret)
- `AGENT_VAULT_VAULT`
- `ALERTMANAGER_HOST`
- `ALERTMANAGER_PAGERDUTY_KEY` (secret)
- `ALERTMANAGER_PORT`
- `ALERTMANAGER_SLACK_WEBHOOK_URL` (secret)
- `ALERTMANAGER_WEBHOOK_SECRET` (secret)
- `ALERT_CHECK_INTERVAL_MINUTES`
- `ALERT_EMAIL`
- `ALERT_EMAIL_ENABLED`
- `ALERT_EMAIL_TO`
- `ALERT_THRESHOLD_GPU_TEMP`
- `ALERT_THRESHOLD_INFERENCE_TIME`
- `ALERT_THRESHOLD_VRAM_USAGE`
- `ALERT_WEBHOOK_URL` (secret)
- `ALLOWED_FILE_TYPES`
- `ALLOWED_ORIGINS`
- `ANTHROPIC_API_KEY` (secret)
- `ANTHROPIC_MAX_TOKENS` (secret)
- `ANTHROPIC_MODEL`
- `API_KEY` (secret)
- `API_KEY_EXPIRY` (secret)
- `API_KEY_HEADER` (secret)
- `API_KEY_SECRET` (secret)
- `API_RATE_LIMITING_REQUEST_COUNT`
- `API_RATE_LIMITING_TTL`
- `API_RATE_LIMIT_MAX_REQUESTS`
- `API_RATE_LIMIT_WINDOW_MS`
- `API_VERSION`
- `APPRISE_URLS`
- `APP_SECRET` (secret)
- `AP_DB_TYPE`
- `AP_ENCRYPTION_KEY` (secret)
- `AP_EXECUTION_MODE`
- `AP_FRONTEND_URL`
- `AP_JWT_SECRET` (secret)
- `AP_POSTGRES_DATABASE`
- `AP_POSTGRES_HOST`
- `AP_POSTGRES_PASSWORD` (secret)
- `AP_POSTGRES_PORT`
- `AP_POSTGRES_USERNAME`
- `AP_REDIS_HOST`
- `AP_REDIS_PASSWORD` (secret)
- `AP_REDIS_PORT`
- `AP_TELEMETRY_ENABLED`
- `ARCHON_HOST`
- `ARCHON_MODE`
- `ARCHON_OS_PORT`
- `ARCHON_PORT`
- `ARCHON_SERVER_URL`
- `ARCHON_STATUS_URL`
- `ARCHON_URL`
- `ASSET_CDN_URL`
- `ASSIGNMENT_ENABLED`
- `ASSIGNMENT_STRATEGY`
- `ASSISTANT_GATEWAY_URL`
- `AWS_ACCESS_KEY_ID` (secret)
- `AWS_REGION`
- `AWS_SECRET_ACCESS_KEY` (secret)
- `BACKUP_DIR`
- `BACKUP_ENABLED`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_SCHEDULE`
- `BATCH_SIZE`
- `BCRYPT_ROUNDS`
- `BITNET_CPUS`
- `BITNET_MODEL_DIR`
- `BITNET_MODEL_FILE`
- `BOOT_OPENCLAW`
- `BOOT_OPENCLAW_UI_PROXY`
- `BOOT_OPENCLAW_VOICE`
- `BROWSERLESS_CONCURRENT`
- `BROWSERLESS_HOST_PORT`
- `BROWSERLESS_KEEP_ALIVE`
- `BROWSERLESS_PREBOOT_CHROME`
- `BROWSERLESS_QUEUED`
- `BROWSERLESS_TIMEOUT_MS`
- `BROWSERLESS_TOKEN` (secret)
- `CACHE_MAX_SIZE`
- `CACHE_TTL`
- `CACHE_TTL_CALCULATOR`
- `CACHE_TTL_RATES`
- `CACHE_TTL_SECONDS`
- `CADVISOR_PORT`
- `CAMPAIGN_ENGINE_HOST`
- `CAMPAIGN_ENGINE_PORT`
- `CAMPAIGN_ENGINE_URL`
- `CAMPAIGN_MAX_RETRIES`
- `CAMPAIGN_RETRY_DELAY_MINUTES`
- `CAMPAIGN_TIMEZONE`
- `CF_GATEWAY_ACCESS_CLIENT_ID`
- `CF_GATEWAY_ACCESS_CLIENT_SECRET` (secret)
- `CF_PORTAL_LITELLM_SERVICE_TOKEN` (secret)
- `CF_TUNNEL_TOKEN` (secret)
- `CHECK_INTERVAL`
- `CLAUDE_API_KEY` (secret)
- `CLAUDE_FLOW_CONFIG_PATH`
- `CLAUDE_FLOW_HOST`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_PORT`
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
- `CLAWTEAM_HOST`
- `CLEARBIT_API_KEY` (secret)
- `CLERK_SECRET_KEY` (secret)
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_LITELLM_HOSTNAME`
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_NAME`
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_API_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_ZONE_ID`
- `CODEX_API_KEY` (secret)
- `CODEX_RELAY_PUBLIC_URL`
- `COLLECTION_ID`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `COMPOSIO_DEFAULT_USER_ID`
- `COMPOSIO_MCP_SERVER_ID`
- `COMPOSIO_MCP_URL`
- `CONFIG_DIR`
- `CONFLICT_STRATEGY`
- `CONNECTION_TIMEOUT`
- `CONSENT_REQUIRED`
- `COPILOT_GITHUB_TOKEN` (secret)
- `CORS_ALLOWED_ORIGINS`
- `CORS_ORIGIN`
- `CRM_API_KEY` (secret)
- `CRM_API_URL`
- `CRM_URL`
- `CRON_SCHEDULE`
- `CUDA_VISIBLE_DEVICES`
- `DATABASE_ENCRYPTION_KEY` (secret)
- `DATABASE_URL`
- `DATA_DIR`
- `DB_HOST`
- `DB_NAME`
- `DB_PASSWORD` (secret)
- `DB_POOL_MAX`
- `DB_POOL_MIN`
- `DB_PORT`
- `DB_USER`
- `DEBUG_MODE`
- `DEFAULT_THEME`
- `DISCORD_ALLOWED_USERS`
- `DISCORD_ALLOW_ALL_USERS`
- `DISCORD_BOT_TOKEN` (secret)
- `DISCORD_REPLY_TO_MODE`
- `DNC_CHECK_ENABLED`
- `DOCKER_CPU_LIMIT`
- `DOCKER_MEMORY_LIMIT`
- `DOCKER_REGISTRY`
- `DOCKER_REGISTRY_PASS` (secret)
- `DOCKER_REGISTRY_USER`
- `DOCUSIGN_ACCOUNT_ID`
- `DOCUSIGN_BASE_PATH`
- `DOCUSIGN_INTEGRATION_KEY` (secret)
- `DOCUSIGN_PRIVATE_KEY_PATH` (secret)
- `DOCUSIGN_USER_ID`
- `DOMAIN_NAME`
- `ELASTICSEARCH_INDEX`
- `ELASTICSEARCH_NODE`
- `ELEVENLABS_API_KEY` (secret)
- `EMAIL_DRIVER`
- `EMAIL_FROM`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_HOST`
- `EMAIL_PASSWORD` (secret)
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_SYSTEM_ADDRESS`
- `EMAIL_USER`
- `EMBEDDINGS_CPUS`
- `ENABLE_AUDIT_LOGGING`
- `ENABLE_CACHING`
- `ENABLE_COMPLIANCE_CHECKS`
- `ENABLE_COST_TRACKING`
- `ENABLE_CRM`
- `ENABLE_GPU_WORKERS`
- `ENABLE_GUARDRAILS`
- `ENABLE_MONITORING`
- `ENABLE_RATE_LIMITING`
- `ENABLE_WORKFLOWS`
- `ENABLE_YAML_CONFIG_EDITING`
- `ENCRYPTION_KEY` (secret)
- `ENRICHMENT_ENABLED`
- `ENRICHMENT_PROVIDER`
- `EXA_API_KEY` (secret)
- `FALKORDB_CACHE_SIZE_MB`
- `FALKORDB_HOST`
- `FALKORDB_PASSWORD` (secret)
- `FALKORDB_PORT`
- `FALKORDB_QUERY_MEM_CAPACITY`
- `FALKORDB_THREADS`
- `FALKORDB_TIMEOUT_DEFAULT_MS`
- `FALKORDB_TIMEOUT_MAX_MS`
- `FALKORDB_URL`
- `FAL_KEY` (secret)
- `FIRECRAWL_API_KEY` (secret)
- `FIREWALL_TAILSCALE_ENABLED`
- `FORGEJO_DB_PASSWORD` (secret)
- `FORGEJO_DOMAIN`
- `FORGEJO_HTTP_PORT`
- `FORGEJO_INTERNAL_TOKEN` (secret)
- `FORGEJO_JWT_SECRET` (secret)
- `FORGEJO_SECRET_KEY` (secret)
- `FRONTEND_URL`
- `GEMINI_API_KEY` (secret)
- `GEMINI_BASE_URL`
- `GEMINI_MAX_TOKENS` (secret)
- `GEMINI_MODEL`
- `GF_SECURITY_ADMIN_PASSWORD` (secret)
- `GF_SECURITY_ADMIN_USER`
- `GITEA_ACTIONS_ENABLED`
- `GITEA_ADMIN_EMAIL`
- `GITEA_ADMIN_PASSWORD` (secret)
- `GITEA_ADMIN_USER`
- `GITEA_DB_HOST`
- `GITEA_DB_NAME`
- `GITEA_DB_PASS` (secret)
- `GITEA_DB_PASSWORD` (secret)
- `GITEA_DB_PORT`
- `GITEA_DB_TYPE`
- `GITEA_DB_USER`
- `GITEA_DOMAIN`
- `GITEA_HOST`
- `GITEA_HTTP_PORT`
- `GITEA_INTERNAL_TOKEN` (secret)
- `GITEA_JWT_SECRET` (secret)
- `GITEA_PORT`
- `GITEA_REPO`
- `GITEA_ROOT_URL`
- `GITEA_RUNNER_NAME`
- `GITEA_RUNNER_REGISTRATION_TOKEN` (secret)
- `GITEA_RUNNER_TOKEN` (secret)
- `GITEA_SECRET_KEY` (secret)
- `GITEA_SSH_DOMAIN`
- `GITEA_SSH_PORT`
- `GITEA_TOKEN` (secret)
- `GITHUB_MIRROR_INTERVAL_SECONDS`
- `GITHUB_REPO`
- `GITHUB_TOKEN` (secret)
- `GITHUB_USERNAME`
- `GOOGLE_API_KEY` (secret)
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (secret)
- `GOOGLE_WORKSPACE_CLIENT_ID`
- `GOOGLE_WORKSPACE_CLIENT_SECRET` (secret)
- `GPU_MODEL`
- `GPU_TYPE`
- `GPU_VRAM`
- `GPU_WORKER_ID`
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_CLICKHOUSE_DATABASE`
- `GRAFANA_CLICKHOUSE_PASSWORD` (secret)
- `GRAFANA_CLICKHOUSE_USER`
- `GRAFANA_CPU_LIMIT`
- `GRAFANA_HOST`
- `GRAFANA_MEMORY_LIMIT`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `GRAFANA_SECURITY_ADMIN_USER`
- `GRAFANA_URL`
- `GROQ_API_KEY` (secret)
- `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION`
- `HAMCP_ENABLE_FILESYSTEM_TOOLS`
- `HASS_URL`
- `HEALTH_CHECK_INTERVAL`
- `HEALTH_CHECK_INTERVAL_MINUTES`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `HERMES_A2A_URL`
- `HERMES_API_SERVER_KEY` (secret)
- `HERMES_LANGFUSE_BASE_URL`
- `HERMES_LANGFUSE_PUBLIC_KEY` (secret)
- `HERMES_LANGFUSE_SECRET_KEY` (secret)
- `HF_API_KEY` (secret)
- `HF_TOKEN` (secret)
- `HOMEPAGE_PORT`
- `HOST`
- `HOT_RELOAD_ENABLED`
- `HUGGINGFACE_API_KEY` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `IMAGE_TOOLS_DEBUG`
- `INFISICAL_AUDIT_RETENTION`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_BACKEND_URL`
- `INFISICAL_CLIENT_ID`
- `INFISICAL_CLIENT_SECRET` (secret)
- `INFISICAL_DB_NAME`
- `INFISICAL_DB_PASSWORD` (secret)
- `INFISICAL_DB_USER`
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `INFISICAL_ENV`
- `INFISICAL_ENVIRONMENT`
- `INFISICAL_EXPORT_INTERVAL_SECONDS`
- `INFISICAL_GATEWAY_CLIENT_ID`
- `INFISICAL_GATEWAY_CLIENT_SECRET` (secret)
- `INFISICAL_KMS_ENABLED`
- `INFISICAL_LICENSE_KEY` (secret)
- `INFISICAL_LOCAL_ADMIN_EMAIL`
- `INFISICAL_LOCAL_ADMIN_PASSWORD` (secret)
- `INFISICAL_MCP_TOKEN` (secret)
- `INFISICAL_ORGANIZATION_ID`
- `INFISICAL_ORGANIZATION_ID_LOCAL`
- `INFISICAL_ORGANIZATION_SLUG`
- `INFISICAL_PAM_ENABLED`
- `INFISICAL_PATH`
- `INFISICAL_PKI_KEY_ALGO` (secret)
- `INFISICAL_PORT`
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_PROJECT_ID_LOCAL`
- `INFISICAL_RECOMMENDED_NEXT`
- `INFISICAL_REDIS_PASSWORD` (secret)
- `INFISICAL_SCAN_GIT_APP_ID`
- `INFISICAL_SCAN_GIT_APP_SLUG`
- `INFISICAL_SCAN_GIT_PRIVATE_KEY` (secret)
- `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` (secret)
- `INFISICAL_SECRET_PATH_PREFIX` (secret)
- `INFISICAL_SITE_URL`
- `INFISICAL_SSH_CA_TTL`
- `INFISICAL_TOKEN` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` (secret)
- `INFISICAL_URL`
- `INFI_CLIENT_ID`
- `INFI_CLIENT_SECRET` (secret)
- `INFI_PROJECT_ID`
- `INITIAL_PASSWORD` (secret)
- `JWT_EXPIRES_IN`
- `JWT_EXPIRY`
- `JWT_REFRESH_EXPIRES_IN`
- `JWT_REFRESH_EXPIRY`
- `JWT_REFRESH_SECRET` (secret)
- `JWT_SECRET` (secret)
- `LANDING_URL`
- `LETTA_AGENTS_API_KEY` (secret)
- `LETTA_DB_NAME`
- `LETTA_DB_PASSWORD` (secret)
- `LETTA_DB_USER`
- `LETTA_DEFAULT_EMBEDDING_CONFIG`
- `LETTA_DEFAULT_LLM_CONFIG`
- `LETTA_HOST`
- `LETTA_HOST_PORT`
- `LETTA_IMAGE`
- `LETTA_PG_URI`
- `LETTA_PORT`
- `LETTA_SERVER_PASSWORD` (secret)
- `LETTA_URL`
- `LINKWARDEN_INTERNAL_URL`
- `LINKWARDEN_PORT`
- `LINKWARDEN_TOKEN` (secret)
- `LINKWARDEN_URL`
- `LITELLM_API_BASE`
- `LITELLM_API_KEY` (secret)
- `LITELLM_API_URL`
- `LITELLM_BASE_URL`
- `LITELLM_BIND_IP`
- `LITELLM_DATABASE_URL`
- `LITELLM_DB_NAME`
- `LITELLM_DB_PASSWORD` (secret)
- `LITELLM_DB_USER`
- `LITELLM_HERMES_KEY` (secret)
- `LITELLM_HOST`
- `LITELLM_IMAGE`
- `LITELLM_INTERNAL_BASE_URL`
- `LITELLM_LOG`
- `LITELLM_LOG_LEVEL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_MODE`
- `LITELLM_PORT`
- `LITELLM_POSTGRES_IMAGE`
- `LLXPRT_BRIDGE_API_KEY` (secret)
- `LOCAL_INFISICAL_URL`
- `LOG_DIR`
- `LOG_FILE`
- `LOG_FILE_PATH`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOKI_HOST`
- `LOKI_PORT`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `MACHINE_HOSTNAME`
- `MACHINE_IP_ETHERNET`
- `MACHINE_IP_TAILSCALE`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MAGIC_UI_ENABLED`
- `MAX_CONCURRENT_SCRAPERS`
- `MAX_CONNECTIONS`
- `MAX_CONNECTIONS_PER_USER`
- `MAX_FILE_SIZE`
- `MAX_RETRY_ATTEMPTS`
- `MCP_GATEWAY_TOKEN` (secret)
- `MEILI_MASTER_KEY` (secret)
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_BASE_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ENABLED`
- `MEM0_HOST`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_PORT`
- `MEM0_URL`
- `MEM0_USER_PERSONALIZATION`
- `MEMORY_BASE_URL`
- `MEMPALACE_PORT`
- `MEMPALACE_URL`
- `MEMPAL_DIR`
- `METRICS_PORT`
- `MFA_ISSUER`
- `MICROSOFT_CALLBACK_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET` (secret)
- `MISTRAL_API_KEY` (secret)
- `MOA_TOOLS_DEBUG`
- `MODEL_MANAGER_PORT`
- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`
- `MOLTBOT_WEB_PORT`
- `MONGODB_URI`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
- `N8N_API_KEY` (secret)
- `N8N_BASE_URL`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_DB`
- `N8N_DB_PASSWORD` (secret)
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK` (secret)
- `N8N_URL`
- `N8N_WEBHOOK_URL` (secret)
- `NATS_BIND_IP`
- `NATS_IMAGE`
- `NATS_MONITOR_PORT`
- `NATS_PASSWORD` (secret)
- `NATS_PORT`
- `NATS_USER`
- `NEXTAUTH_SECRET` (secret)
- `NEXTAUTH_URL` (secret)
- `NEXT_PUBLIC_ACTIVEPIECES_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_KEY` (secret)
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ARCHON_UI_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (secret)
- `NEXT_PUBLIC_DEBUG`
- `NEXT_PUBLIC_DIFY_APP_ID`
- `NEXT_PUBLIC_DIFY_WIDGET_URL`
- `NEXT_PUBLIC_DOCS_BASE_URL`
- `NEXT_PUBLIC_GRAFANA_URL`
- `NEXT_PUBLIC_MEM0_PROXY_URL`
- `NEXT_PUBLIC_N8N_URL`
- `NEXT_PUBLIC_NEXUS_UI_URL`
- `NEXT_PUBLIC_NEXUS_URL`
- `NEXT_PUBLIC_OPENCLAW_URL`
- `NEXT_PUBLIC_OPENMEMORY_URL`
- `NEXT_PUBLIC_PORTAINER_URL`
- `NEXT_PUBLIC_QUOTE_API_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (secret)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL`
- `NEXT_PUBLIC_TWENTY_URL`
- `NEXT_PUBLIC_WEBAPP_URL`
- `NEXT_PUBLIC_WEBHOOK_URL` (secret)
- `NEXT_PUBLIC_WS_URL`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_ADMIN_URL`
- `NEXUS_AGENT_TOKEN` (secret)
- `NEXUS_API_KEY` (secret)
- `NEXUS_API_URL`
- `NEXUS_BASE_URL`
- `NEXUS_CIRCUIT_BREAKER_ENABLED`
- `NEXUS_CIRCUIT_BREAKER_THRESHOLD`
- `NEXUS_CIRCUIT_BREAKER_TIMEOUT`
- `NEXUS_CONFIG`
- `NEXUS_CONFIG_APPLY_ENABLED`
- `NEXUS_CONTEXT_AGGREGATION`
- `NEXUS_CPU_LIMIT`
- `NEXUS_DEPLOY_TARGET`
- `NEXUS_FALLBACK_RETRIES`
- `NEXUS_HEALTH_CHECK_ENABLED`
- `NEXUS_HEALTH_CHECK_INTERVAL`
- `NEXUS_HEALTH_CHECK_TIMEOUT`
- `NEXUS_HOST`
- `NEXUS_INTERNAL_BASE_URL`
- `NEXUS_INTERNAL_BEARER_TOKEN` (secret)
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_LITELLM_MASTER_KEY` (secret)
- `NEXUS_LOAD_BALANCING`
- `NEXUS_MAX_CONCURRENT_REQUESTS`
- `NEXUS_MCP_PORT`
- `NEXUS_MCP_URL`
- `NEXUS_MEMORY_LIMIT`
- `NEXUS_METRICS_PORT`
- `NEXUS_MODEL_ROUTING_ENABLED`
- `NEXUS_MONITORING_ENABLED`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_COST_AWARE`
- `NEXUS_ROUTER_FALLBACK_ENABLED`
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_LATENCY_THRESHOLD`
- `NEXUS_ROUTER_MCP_PORT`
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_STRATEGY`
- `NEXUS_ROUTER_URL`
- `NEXUS_STATUS_URL`
- `NEXUS_UI_SETTINGS_PATH`
- `NEXUS_URL`
- `NODE_ENV`
- `NODE_VERSION`
- `NOTION_TOKEN` (secret)
- `NVIDIA_VISIBLE_DEVICES`
- `NYRA_CHAT_INTERNAL_API_BASE_URL`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `NYRA_DOCKER_NETWORK`
- `NYRA_ENABLE_MOCKS`
- `NYRA_ENV`
- `NYRA_ENVIRONMENT`
- `NYRA_HTTP_ALLOWLIST`
- `NYRA_KYUTAI_DECODE_IMAGE`
- `NYRA_KYUTAI_STT_IMAGE`
- `NYRA_KYUTAI_TTS_IMAGE`
- `NYRA_KYUTAI_VAD_IMAGE`
- `NYRA_MCP_PORT`
- `NYRA_NETWORK`
- `NYRA_NETWORK_NAME`
- `NYRA_NODE_ID`
- `NYRA_NODE_TYPE`
- `NYRA_VOICE_COORDINATOR_IMAGE`
- `NYRA_VOICE_EDGE_IMAGE`
- `NYRA_VOICE_EGRESS_IMAGE`
- `NYRA_VOICE_LLM_BRIDGE_IMAGE`
- `NYRA_WEBHOOK_SECRET` (secret)
- `OCR_CONFIDENCE_THRESHOLD`
- `OCR_ENABLED`
- `OCR_LANGUAGE`
- `OLLAMA_ENABLED`
- `OLLAMA_HOST`
- `OLLAMA_PORT`
- `OMNIROUTE_API_KEY` (secret)
- `OMNIROUTE_API_KEY_SECRET` (secret)
- `OMNIROUTE_BASE_URL`
- `OMNIROUTE_CLAUDE_LITELLM_MODEL`
- `OMNIROUTE_CODEX_LITELLM_MODEL`
- `OMNIROUTE_FREE_LITELLM_MODEL`
- `OMNIROUTE_IMAGE`
- `OMNIROUTE_INITIAL_PASSWORD` (secret)
- `OMNIROUTE_JWT_SECRET` (secret)
- `OMNIROUTE_PORT`
- `OPENAI_API_KEY` (secret)
- `OPENAI_BASE_URL`
- `OPENAI_MAX_TOKENS` (secret)
- `OPENAI_MODEL`
- `OPENAI_ORG_ID`
- `OPENCLAW_API_KEY` (secret)
- `OPENCLAW_CHAT_PATH`
- `OPENCLAW_COMPOSE_VALIDATE`
- `OPENCLAW_CONFIG_PATH`
- `OPENCLAW_DATA_DIR`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENCLAW_DOCKER_APT_PACKAGES`
- `OPENCLAW_ENABLE_OPEN_WEBUI_CHANNELS_PLUGIN`
- `OPENCLAW_FORCE_BUILD`
- `OPENCLAW_GATEWAY_PORT`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_HEALTH_TIMEOUT_S`
- `OPENCLAW_HOME_VOLUME`
- `OPENCLAW_HTTP_ALLOWLIST`
- `OPENCLAW_INSTALL_BROWSER`
- `OPENCLAW_MVP_IMAGE`
- `OPENCLAW_OPENAI_BASE_URL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_BASE_URL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_CHANNEL_IDS_JSON`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_EMAIL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_ENABLED`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_PASSWORD` (secret)
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REF`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REPO`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REQUIRE_MENTION`
- `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST`
- `OPENCLAW_PORT`
- `OPENCLAW_PORTS`
- `OPENCLAW_PROVIDER`
- `OPENCLAW_PUBLIC_BASE_URL`
- `OPENCLAW_SANDBOX_ENABLED`
- `OPENCLAW_SECRET_REF_MODE` (secret)
- `OPENCLAW_SESSION_PATH`
- `OPENCLAW_TOOLS_ALLOW`
- `OPENCLAW_TOOLS_DENY`
- `OPENCLAW_TOOL_POLICY`
- `OPENCLAW_UI_PREFIX`
- `OPENCLAW_UI_PROXY_PORT`
- `OPENCLAW_WEBHOOK_INGRESS_PATH` (secret)
- `OPENCLAW_WORKSPACE_VOLUME`
- `OPENHARNESS_A2A_URL`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `OPENLIT_CLICKHOUSE_HTTP_PORT`
- `OPENLIT_CLICKHOUSE_NATIVE_PORT`
- `OPENLIT_DB_NAME`
- `OPENLIT_DB_PASSWORD` (secret)
- `OPENLIT_DB_USER`
- `OPENLIT_GITHUB_CLIENT_ID`
- `OPENLIT_GITHUB_CLIENT_SECRET` (secret)
- `OPENLIT_GOOGLE_CLIENT_ID`
- `OPENLIT_GOOGLE_CLIENT_SECRET` (secret)
- `OPENLIT_HOST_PORT`
- `OPENLIT_NEXTAUTH_SECRET` (secret)
- `OPENLIT_NEXTAUTH_URL` (secret)
- `OPENLIT_OPAMP_ENVIRONMENT`
- `OPENLIT_OPAMP_LOG_LEVEL`
- `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`
- `OPENLIT_OPAMP_TLS_MAX_VERSION`
- `OPENLIT_OPAMP_TLS_MIN_VERSION`
- `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT` (secret)
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_FALLBACK_MODEL`
- `OPENROUTER_FREE_LITELLM_MODEL`
- `OPENROUTER_MGMT_API_KEY` (secret)
- `OPENROUTER_PROVISIONING`
- `OPENWEBUI_PORT`
- `OPENWEBUI_SECRET_KEY` (secret)
- `OPEN_WEBUI_URL`
- `OPT_TAG`
- `OPT_TAG_CUSTOM`
- `OPT_TAG_GITHUB`
- `OPT_TAG_GITHUBSTARS`
- `OPT_TAG_LANGUAGE`
- `OPT_TAG_USERNAME`
- `ORACLE_MAIN_NETWORK`
- `ORCHESTRATOR_DNS_BIND_IP`
- `ORCHESTRATOR_PORTAINER_EDGE_ID`
- `ORCHESTRATOR_TAILSCALE_AUTHKEY` (secret)
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_TUNNEL_ID`
- `ORCHESTRATOR_TUNNEL_TOKEN` (secret)
- `ORCHESTRATOR_URL`
- `OR_API_KEY` (secret)
- `PAGERDUTY_INTEGRATION_KEY` (secret)
- `PAPERCLIP_API_KEY` (secret)
- `PAPERCLIP_AUTH_DISABLE_SIGN_UP` (secret)
- `PAPERCLIP_DB_NAME`
- `PAPERCLIP_DB_PASSWORD` (secret)
- `PAPERCLIP_DB_USER`
- `PAPERCLIP_HOST_PORT`
- `PAPERCLIP_IMAGE`
- `PAPERCLIP_PUBLIC_URL`
- `PAPERCLIP_SESSION_SECRET` (secret)
- `PASSWORD_RESET_EXPIRY` (secret)
- `PERF_MONITOR_PORT`
- `PG_DATABASE_URL`
- `PKI_ENABLED`
- `PORT`
- `PORTAINER_ADMIN_PASSWORD` (secret)
- `PORTAINER_ADMIN_USERNAME`
- `PORTAINER_AGENT_PORT`
- `PORTAINER_AGENT_SECRET` (secret)
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_API_TOKEN` (secret)
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_INSECURE_POLL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_HTTP_PORT`
- `PORTAINER_ORCHESTRATOR_URL`
- `PORTAINER_PORT`
- `PORTAINER_PUBLIC_URL`
- `PORTAINER_SYMLINK`
- `PORTAINER_URL`
- `POSTGRES_CPU_LIMIT`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_MAX_CONNECTIONS`
- `POSTGRES_MEMORY_LIMIT`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_POOL_SIZE`
- `POSTGRES_PORT`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `POSTGRES_WORKER_RTX3060_PASSWORD` (secret)
- `POSTGRES_WORKER_RTX3090TI_PASSWORD` (secret)
- `POSTGRES_WORKER_RTX5090_PASSWORD` (secret)
- `PRIMARY_MODELS`
- `PRODUCTION_API_KEY` (secret)
- `PROFILING_ENABLED`
- `PROJECTNYRA_DOMAIN`
- `PROMETHEUS_BASIC_AUTH_PASSWORD` (secret)
- `PROMETHEUS_HOST`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `PROMETHEUS_RETENTION_TIME`
- `PROMETHEUS_SCRAPE_INTERVAL`
- `PROMETHEUS_URL`
- `QDRANT_API_KEY` (secret)
- `QDRANT_MAX_SEARCH_THREADS`
- `QDRANT_URL`
- `QUERY_TIMEOUT`
- `QUOTE_API_PORT`
- `QUOTE_API_SECRET` (secret)
- `QUOTE_API_URL`
- `QUOTE_ENGINE_HOST`
- `QUOTE_ENGINE_PORT`
- `QUOTE_ENGINE_URL`
- `RATE_CACHE_KEY_PREFIX` (secret)
- `RATE_LIMIT_DURATION`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_POINTS`
- `RATE_LIMIT_REQUESTS`
- `RATE_LIMIT_WINDOW`
- `RATE_LIMIT_WINDOW_MS`
- `REDIS_AUTH_TOKEN` (secret)
- `REDIS_CPU_LIMIT`
- `REDIS_DB`
- `REDIS_ENABLED`
- `REDIS_EVICTION_POLICY`
- `REDIS_HOST`
- `REDIS_MAX_MEMORY`
- `REDIS_MEMORY_LIMIT`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REDIS_URL`
- `RESEND_API_KEY` (secret)
- `RETRY_DELAY_MS`
- `ROUTE_ALL_AI_THROUGH_NEXUS`
- `RTX3060_LAN_IP`
- `RTX3090TI_LAN_IP`
- `RTX5090_LAN_IP`
- `RUVECTOR_HOST`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `S3_BUCKET`
- `S3_ENDPOINT`
- `SCORING_ENABLED`
- `SCORING_MAX_SCORE`
- `SCORING_MIN_SCORE`
- `SCRAPER_INTERVAL_MINUTES`
- `SCRAPER_TIMEOUT_MS`
- `SEARXNG_BASE_URL`
- `SEARXNG_HOST_PORT`
- `SEARXNG_SECRET` (secret)
- `SEARXNG_UWSGI_THREADS`
- `SEARXNG_UWSGI_WORKERS`
- `SECRET_SCANNING_ENABLED` (secret)
- `SECURITY_SERVICE_PORT`
- `SENDGRID_API_KEY` (secret)
- `SENTRY_ENVIRONMENT`
- `SERVER_URL`
- `SERVICES`
- `SERVICE_HF_TOKEN` (secret)
- `SESSION_TIMEOUT`
- `SHADCN_REGISTRY_URL`
- `SHARED_SCHEMA_VERSION`
- `SIGN_IN_PREFILLED`
- `SLACK_WEBHOOK_URL` (secret)
- `SMTP_FROM`
- `SMTP_FROM_NAME`
- `SMTP_HOST`
- `SMTP_PASSWORD` (secret)
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_USERNAME`
- `SPECIALIZATION`
- `SSH_CA_ENABLED`
- `SSL_ENABLED`
- `STOP_ENFORCEMENT_ENABLED`
- `STORAGE_TYPE`
- `STT_PRECISION`
- `SUPABASE_ANON_KEY` (secret)
- `SUPABASE_DB_PASSWORD` (secret)
- `SUPABASE_JWT_SECRET` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `SUPABASE_URL`
- `SYNC_BATCH_SIZE`
- `SYNC_INTERVAL_MINUTES`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_CLIENT_ID`
- `TAILSCALE_CLIENT_SECRET` (secret)
- `TAILSCALE_ENABLED`
- `TAILSCALE_EXIT_NODE_ENABLED`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TAILSCALE_MAGIC_DNS_ENABLED`
- `TAILSCALE_MESH_NETWORK`
- `TAILSCALE_NETWORK_PREFIX`
- `TAILSCALE_SUBNET_ROUTES`
- `TAILSCALE_TAILNET`
- `TAVILY_API_KEY` (secret)
- `TELEGRAM_BOT_API_KEY` (secret)
- `TELEGRAM_BOT_TOKEN` (secret)
- `TELEMETRY_ENABLED`
- `TENANT_ENGINEERING_KEY` (secret)
- `TENANT_PRODUCTION_KEY` (secret)
- `TENANT_RESEARCH_KEY` (secret)
- `TERMINAL_LIFETIME_SECONDS`
- `TERMINAL_MODAL_IMAGE`
- `TERMINAL_SSH_HOST`
- `TERMINAL_SSH_KEY` (secret)
- `TERMINAL_SSH_PORT`
- `TERMINAL_SSH_USER`
- `TERMINAL_TIMEOUT`
- `TEST_DATABASE_URL`
- `THUMBNAIL_QUALITY`
- `THUMBNAIL_SIZE`
- `TTS_PRECISION`
- `TWEAKCN_PRESET`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_API_URL`
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTYCRM_WEBHOOK_SECRET` (secret)
- `TWENTY_ACCESS_TOKEN` (secret)
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_API_KEY` (secret)
- `TWENTY_API_URL`
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_API_URL`
- `TWENTY_CRM_ENABLED`
- `TWENTY_CRM_SYNC_ENABLED`
- `TWENTY_CRM_SYNC_INTERVAL`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_WORKSPACE_ID`
- `TWENTY_DATABASE_URL`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_USER`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_FRONT_BASE_URL`
- `TWENTY_HOST`
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_LOGIN_TOKEN_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_PORT`
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_USER`
- `TWENTY_REDIS_PASSWORD` (secret)
- `TWENTY_REDIS_URL`
- `TWENTY_REFRESH_TOKEN_SECRET` (secret)
- `TWENTY_SERVER_URL`
- `TWENTY_WEBHOOK_SECRET` (secret)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `TWILIO_FROM_NUMBER`
- `TWILIO_PHONE_NUMBER`
- `TZ`
- `UNMUTE_ASSISTANT_GATEWAY_URL`
- `UNMUTE_CACHE_VOLUME`
- `UNMUTE_HOST_PORT`
- `UNMUTE_IMAGE`
- `UNMUTE_LLM_BASE_URL`
- `UNMUTE_MODEL_PROVIDER`
- `UNMUTE_MODEL_VOLUME`
- `UNMUTE_OPENAI_API_KEY` (secret)
- `UNMUTE_PUBLIC_BASE_URL`
- `UPLOAD_DIR`
- `VLLM_PORT`
- `VOICE_PTP_INTERFACE`
- `VOICE_RTP_PORT_RANGE`
- `VPS_LITELLM_MASTER_KEY` (secret)
- `VRAM_GB`
- `WEBAPP_URL`
- `WEBHOOK_RETRY_ATTEMPTS` (secret)
- `WEBHOOK_RETRY_DELAY` (secret)
- `WEBHOOK_TIMEOUT` (secret)
- `WEBHOOK_URL` (secret)
- `WHATSAPP_ALLOW_ALL_USERS`
- `WHATSAPP_DM_POLICY`
- `WHATSAPP_ENABLED`
- `WHATSAPP_HOME_CHANNEL`
- `WHATSAPP_HOME_CHANNEL_NAME`
- `WHATSAPP_MODE`
- `WHATSAPP_PHONE_NUMBER`
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_CHAT_LITELLM_MODEL`
- `WORKER_3060_EMBED_LITELLM_MODEL`
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_BASE_URL`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_3060_PORTAINER_EDGE_ID`
- `WORKER_3060_PORTAINER_EDGE_KEY` (secret)
- `WORKER_3060_PORTAINER_ENDPOINT_ID`
- `WORKER_3060_PORTAINER_HOST_IP`
- `WORKER_3060_URL`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_LITELLM_MODEL`
- `WORKER_3090_MODELS`
- `WORKER_3090_URL`
- `WORKER_3090_VLLM_BASE_URL`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_LITELLM_MODEL`
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_TAILSCALE_AUTHKEY` (secret)
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_BASE_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_GRAFANA_PORT`
- `WORKER_ID`
- `WORKER_LOCAL_API_KEY` (secret)
- `WORKER_ROLE`
- `WORKER_RTX3060_API_KEY` (secret)
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_API_KEY` (secret)
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MASTER_KEY` (secret)
- `WORKER_RTX3060_LITELLM_MODEL`
- `WORKER_RTX3090TI_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_BASE_URL`
- `WORKER_RTX3090TI_LITELLM_MODEL`
- `WORKER_RTX5090PORTAINER_EDGE_KEY` (secret)
- `WORKER_RTX5090_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_BASE_URL`
- `WORKER_RTX5090_LITELLM_MODEL`
- `WORKER_RTX5090_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_RTX5090_PORTAINER_AGENT_TAGS`
- `WORKER_RTX5090_PORTAINER_EDGE_ID`
- `WORKER_RTX5090_PORTAINER_EDGE_INSECURE_POLL`
- `WORKER_RTX5090_PORTAINER_EDGE_KEY` (secret)
- `WORKER_RTX5090_PORTAINER_ENDPOINT_ID`
- `XAI_API_KEY` (secret)

### homeassistant

- `ACTIVEPIECES_URL`
- `ALERTMANAGER_PAGERDUTY_KEY` (secret)
- `ALERTMANAGER_SLACK_WEBHOOK_URL` (secret)
- `APPRISE_URLS`
- `ARCHON_STATUS_URL`
- `ARCHON_URL`
- `BROWSERLESS_TOKEN` (secret)
- `COLLECTION_ID`
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `CRM_URL`
- `CRON_SCHEDULE`
- `FIRECRAWL_API_KEY` (secret)
- `FORGEJO_INTERNAL_TOKEN` (secret)
- `FORGEJO_JWT_SECRET` (secret)
- `FORGEJO_SECRET_KEY` (secret)
- `GITEA_DB_NAME`
- `GITEA_DB_PASS` (secret)
- `GITEA_DB_USER`
- `GITEA_TOKEN` (secret)
- `GITHUB_TOKEN` (secret)
- `GITHUB_USERNAME`
- `GRAFANA_URL`
- `HASS_LONG_LIVED_TOKEN` (secret)
- `HASS_URL`
- `HA_MCP_BACKUP_HINT`
- `HA_MCP_IMAGE`
- `HA_STACK_ROOT`
- `HF_API_KEY` (secret)
- `HF_TOKEN` (secret)
- `HOMEASSISTANT_IP`
- `HOMEASSISTANT_TOKEN` (secret)
- `HOMEASSISTANT_URL`
- `HOMEPAGE_PORT`
- `HUGGINGFACE_API_KEY` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `INFISICAL_ENV`
- `INFISICAL_PROJECT_ID`
- `LANDING_URL`
- `LETTA_URL`
- `LINKWARDEN_INTERNAL_URL`
- `LINKWARDEN_PORT`
- `LINKWARDEN_TOKEN` (secret)
- `LINKWARDEN_URL`
- `LITELLM_API_BASE`
- `LITELLM_API_KEY` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_INTERNAL_BASE_URL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LLXPRT_BRIDGE_API_KEY` (secret)
- `LOKI_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MEILI_MASTER_KEY` (secret)
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ENABLED`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_URL`
- `MEM0_USER_PERSONALIZATION`
- `N8N_URL`
- `NEXTAUTH_SECRET` (secret)
- `NEXTAUTH_URL` (secret)
- `NEXUS_ADMIN_URL`
- `NEXUS_LITELLM_MASTER_KEY` (secret)
- `NEXUS_STATUS_URL`
- `NEXUS_URL`
- `OLLAMA_PORT`
- `OMNIROUTE_API_KEY` (secret)
- `OMNIROUTE_API_KEY_SECRET` (secret)
- `OMNIROUTE_INITIAL_PASSWORD` (secret)
- `OMNIROUTE_JWT_SECRET` (secret)
- `OPENAI_BASE_URL`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `OPENLIT_CLICKHOUSE_HTTP_PORT`
- `OPENLIT_CLICKHOUSE_NATIVE_PORT`
- `OPENLIT_DB_NAME`
- `OPENLIT_DB_PASSWORD` (secret)
- `OPENLIT_DB_USER`
- `OPENLIT_HOST_PORT`
- `OPENLIT_NEXTAUTH_SECRET` (secret)
- `OPENLIT_NEXTAUTH_URL` (secret)
- `OPENLIT_OPAMP_ENVIRONMENT`
- `OPENLIT_OPAMP_LOG_LEVEL`
- `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`
- `OPENLIT_OPAMP_TLS_MAX_VERSION`
- `OPENLIT_OPAMP_TLS_MIN_VERSION`
- `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT` (secret)
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MGMT_API_KEY` (secret)
- `OPENROUTER_PROVISIONING`
- `OPEN_WEBUI_URL`
- `OPT_TAG`
- `OPT_TAG_CUSTOM`
- `OPT_TAG_GITHUB`
- `OPT_TAG_GITHUBSTARS`
- `OPT_TAG_LANGUAGE`
- `OPT_TAG_USERNAME`
- `ORACLE_MAIN_NETWORK`
- `OR_API_KEY` (secret)
- `PAPERCLIP_API_KEY` (secret)
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_ORCHESTRATOR_URL`
- `PORTAINER_URL`
- `POSTGRES_DB`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_USER`
- `PROJECTNYRA_DOMAIN`
- `PROMETHEUS_RETENTION_TIME`
- `PROMETHEUS_URL`
- `QDRANT_API_KEY` (secret)
- `QDRANT_URL`
- `SEARXNG_SECRET` (secret)
- `SERVICE_HF_TOKEN` (secret)
- `TAILSCALE_IP`
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_URL`
- `TWENTY_DB_PASSWORD` (secret)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `VLLM_PORT`
- `WEBAPP_URL`
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MODEL`
- `WORKER_RTX3090TI_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_BASE_URL`
- `WORKER_RTX3090TI_LITELLM_MODEL`
- `WORKER_RTX5090_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_BASE_URL`
- `WORKER_RTX5090_LITELLM_MODEL`

### oracle-vps

- `AGENT_BROWSER_ENGINE`
- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_INFISICAL_URL`
- `AGENT_VAULT_LOG_LEVEL`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_TRUSTED_PROXIES`
- `AGENT_VAULT_UA_CLIENT_ID`
- `AGENT_VAULT_UA_CLIENT_SECRET` (secret)
- `ALERTMANAGER_PAGERDUTY_KEY` (secret)
- `ALERTMANAGER_PORT`
- `ALERTMANAGER_SLACK_WEBHOOK_URL` (secret)
- `ALERTMANAGER_WEBHOOK_SECRET` (secret)
- `ANTHROPIC_API_KEY` (secret)
- `AP_DB_TYPE`
- `AP_ENCRYPTION_KEY` (secret)
- `AP_EXECUTION_MODE`
- `AP_FRONTEND_URL`
- `AP_JWT_SECRET` (secret)
- `AP_POSTGRES_DATABASE`
- `AP_POSTGRES_HOST`
- `AP_POSTGRES_PASSWORD` (secret)
- `AP_POSTGRES_PORT`
- `AP_POSTGRES_USERNAME`
- `AP_REDIS_HOST`
- `AP_REDIS_PASSWORD` (secret)
- `AP_REDIS_PORT`
- `AP_TELEMETRY_ENABLED`
- `BROWSERLESS_CONCURRENT`
- `BROWSERLESS_HOST_PORT`
- `BROWSERLESS_KEEP_ALIVE`
- `BROWSERLESS_PREBOOT_CHROME`
- `BROWSERLESS_QUEUED`
- `BROWSERLESS_TIMEOUT_MS`
- `BROWSERLESS_TOKEN` (secret)
- `CAMPAIGN_ENGINE_URL`
- `CF_GATEWAY_ACCESS_CLIENT_ID`
- `CF_GATEWAY_ACCESS_CLIENT_SECRET` (secret)
- `CF_PORTAL_LITELLM_SERVICE_TOKEN` (secret)
- `CF_TUNNEL_TOKEN` (secret)
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
- `CLERK_SECRET_KEY` (secret)
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_API_TOKEN` (secret)
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `COPILOT_GITHUB_TOKEN` (secret)
- `CRM_API_KEY` (secret)
- `DB_PASSWORD` (secret)
- `DISCORD_ALLOWED_USERS`
- `DISCORD_ALLOW_ALL_USERS`
- `DISCORD_BOT_TOKEN` (secret)
- `DISCORD_REPLY_TO_MODE`
- `ENABLE_YAML_CONFIG_EDITING`
- `FALKORDB_HOST`
- `FALKORDB_PORT`
- `FIRECRAWL_API_KEY` (secret)
- `FORGEJO_DB_PASSWORD` (secret)
- `FORGEJO_DOMAIN`
- `FORGEJO_HTTP_PORT`
- `FORGEJO_INTERNAL_TOKEN` (secret)
- `FORGEJO_JWT_SECRET` (secret)
- `FORGEJO_SECRET_KEY` (secret)
- `GEMINI_API_KEY` (secret)
- `GITEA_DB_NAME`
- `GITEA_DB_PASS` (secret)
- `GITEA_DB_PASSWORD` (secret)
- `GITEA_DB_USER`
- `GITEA_DOMAIN`
- `GITEA_HTTP_PORT`
- `GITEA_INTERNAL_TOKEN` (secret)
- `GITEA_JWT_SECRET` (secret)
- `GITEA_REPO`
- `GITEA_ROOT_URL`
- `GITEA_RUNNER_NAME`
- `GITEA_RUNNER_TOKEN` (secret)
- `GITEA_SECRET_KEY` (secret)
- `GITEA_SSH_DOMAIN`
- `GITEA_SSH_PORT`
- `GITEA_TOKEN` (secret)
- `GITHUB_MIRROR_INTERVAL_SECONDS`
- `GITHUB_REPO`
- `GITHUB_TOKEN` (secret)
- `GOOGLE_API_KEY` (secret)
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_CLICKHOUSE_DATABASE`
- `GRAFANA_CLICKHOUSE_PASSWORD` (secret)
- `GRAFANA_CLICKHOUSE_USER`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `GRAFANA_SECURITY_ADMIN_USER`
- `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION`
- `HAMCP_ENABLE_FILESYSTEM_TOOLS`
- `HASS_URL`
- `HA_MCP_BACKUP_HINT`
- `HA_MCP_IMAGE`
- `HERMES_API_SERVER_KEY` (secret)
- `HERMES_LANGFUSE_BASE_URL`
- `HERMES_LANGFUSE_PUBLIC_KEY` (secret)
- `HF_API_KEY` (secret)
- `HF_TOKEN` (secret)
- `HOMEASSISTANT_TOKEN` (secret)
- `HOMEASSISTANT_URL`
- `HUGGINGFACE_API_KEY` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `IMAGE_TOOLS_DEBUG`
- `INFISICAL_AUDIT_RETENTION`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_DB_NAME`
- `INFISICAL_DB_PASSWORD` (secret)
- `INFISICAL_DB_USER`
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `INFISICAL_ENV`
- `INFISICAL_GATEWAY_CLIENT_ID`
- `INFISICAL_GATEWAY_CLIENT_SECRET` (secret)
- `INFISICAL_KMS_ENABLED`
- `INFISICAL_LOCAL_ADMIN_EMAIL`
- `INFISICAL_LOCAL_ADMIN_PASSWORD` (secret)
- `INFISICAL_ORGANIZATION_ID`
- `INFISICAL_ORGANIZATION_ID_LOCAL`
- `INFISICAL_ORGANIZATION_SLUG`
- `INFISICAL_PAM_ENABLED`
- `INFISICAL_PATH`
- `INFISICAL_PKI_KEY_ALGO` (secret)
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_PROJECT_ID_LOCAL`
- `INFISICAL_RECOMMENDED_NEXT`
- `INFISICAL_REDIS_PASSWORD` (secret)
- `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` (secret)
- `INFISICAL_SITE_URL`
- `INFISICAL_SSH_CA_TTL`
- `INFISICAL_TOKEN` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` (secret)
- `INFISICAL_URL`
- `LETTA_DB_NAME`
- `LETTA_DB_PASSWORD` (secret)
- `LETTA_DB_USER`
- `LETTA_SERVER_PASSWORD` (secret)
- `LITELLM_API_BASE`
- `LITELLM_API_KEY` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_HOST`
- `LITELLM_INTERNAL_BASE_URL`
- `LITELLM_LOG_LEVEL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LLXPRT_BRIDGE_API_KEY` (secret)
- `LOCAL_INFISICAL_URL`
- `LOG_LEVEL`
- `LOKI_PORT`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `MCP_GATEWAY_TOKEN` (secret)
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_BASE_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ENABLED`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_USER_PERSONALIZATION`
- `MEMPALACE_PORT`
- `MEMPAL_DIR`
- `MISTRAL_API_KEY` (secret)
- `MOA_TOOLS_DEBUG`
- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_DB`
- `N8N_DB_PASSWORD` (secret)
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK` (secret)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (secret)
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_AGENT_TOKEN` (secret)
- `NEXUS_API_KEY` (secret)
- `NEXUS_BASE_URL`
- `NEXUS_CIRCUIT_BREAKER_ENABLED`
- `NEXUS_CIRCUIT_BREAKER_THRESHOLD`
- `NEXUS_CIRCUIT_BREAKER_TIMEOUT`
- `NEXUS_CONFIG`
- `NEXUS_CONTEXT_AGGREGATION`
- `NEXUS_FALLBACK_RETRIES`
- `NEXUS_HEALTH_CHECK_ENABLED`
- `NEXUS_HEALTH_CHECK_INTERVAL`
- `NEXUS_HEALTH_CHECK_TIMEOUT`
- `NEXUS_HOST`
- `NEXUS_INTERNAL_BASE_URL`
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_LITELLM_MASTER_KEY` (secret)
- `NEXUS_LOAD_BALANCING`
- `NEXUS_MAX_CONCURRENT_REQUESTS`
- `NEXUS_MCP_URL`
- `NEXUS_MODEL_ROUTING_ENABLED`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_COST_AWARE`
- `NEXUS_ROUTER_FALLBACK_ENABLED`
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_LATENCY_THRESHOLD`
- `NEXUS_ROUTER_STRATEGY`
- `NEXUS_ROUTER_URL`
- `NODE_ENV`
- `NOTION_TOKEN` (secret)
- `NYRA_WEBHOOK_SECRET` (secret)
- `OLLAMA_PORT`
- `OMNIROUTE_API_KEY` (secret)
- `OMNIROUTE_API_KEY_SECRET` (secret)
- `OMNIROUTE_BASE_URL`
- `OMNIROUTE_INITIAL_PASSWORD` (secret)
- `OMNIROUTE_JWT_SECRET` (secret)
- `OPENAI_API_KEY` (secret)
- `OPENAI_BASE_URL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REPO`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REQUIRE_MENTION`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `OPENLIT_CLICKHOUSE_HTTP_PORT`
- `OPENLIT_CLICKHOUSE_NATIVE_PORT`
- `OPENLIT_DB_NAME`
- `OPENLIT_DB_PASSWORD` (secret)
- `OPENLIT_DB_USER`
- `OPENLIT_GITHUB_CLIENT_ID`
- `OPENLIT_GITHUB_CLIENT_SECRET` (secret)
- `OPENLIT_GOOGLE_CLIENT_ID`
- `OPENLIT_GOOGLE_CLIENT_SECRET` (secret)
- `OPENLIT_HOST_PORT`
- `OPENLIT_NEXTAUTH_SECRET` (secret)
- `OPENLIT_NEXTAUTH_URL` (secret)
- `OPENLIT_OPAMP_ENVIRONMENT`
- `OPENLIT_OPAMP_LOG_LEVEL`
- `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`
- `OPENLIT_OPAMP_TLS_MAX_VERSION`
- `OPENLIT_OPAMP_TLS_MIN_VERSION`
- `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT` (secret)
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MGMT_API_KEY` (secret)
- `OPENROUTER_PROVISIONING`
- `OPENWEBUI_SECRET_KEY` (secret)
- `ORACLE_MAIN_NETWORK`
- `ORACLE_TAILSCALE_AUTHKEY` (secret)
- `ORACLE_TAILSCALE_IP`
- `ORACLE_TUNNEL_ID`
- `ORACLE_TUNNEL_TOKEN` (secret)
- `ORCHESTRATOR_URL`
- `OR_API_KEY` (secret)
- `PAPERCLIP_API_KEY` (secret)
- `PAPERCLIP_AUTH_DISABLE_SIGN_UP` (secret)
- `PAPERCLIP_DB_NAME`
- `PAPERCLIP_DB_PASSWORD` (secret)
- `PAPERCLIP_DB_USER`
- `PAPERCLIP_HOST_PORT`
- `PAPERCLIP_IMAGE`
- `PAPERCLIP_PUBLIC_URL`
- `PAPERCLIP_SESSION_SECRET` (secret)
- `PORTAINER_ADMIN_USERNAME`
- `PORTAINER_AGENT_SECRET` (secret)
- `PORTAINER_API_TOKEN` (secret)
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_SYMLINK`
- `PORTAINER_URL`
- `POSTGRES_DB`
- `POSTGRES_MAX_CONNECTIONS`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_POOL_SIZE`
- `POSTGRES_USER`
- `PROJECTNYRA_DOMAIN`
- `PROMETHEUS_PORT`
- `PROMETHEUS_RETENTION_TIME`
- `QDRANT_API_KEY` (secret)
- `QUOTE_API_PORT`
- `QUOTE_API_SECRET` (secret)
- `SEARXNG_BASE_URL`
- `SEARXNG_HOST_PORT`
- `SEARXNG_SECRET` (secret)
- `SEARXNG_UWSGI_THREADS`
- `SEARXNG_UWSGI_WORKERS`
- `SERVICE_HF_TOKEN` (secret)
- `SMTP_USER`
- `SUPABASE_ANON_KEY` (secret)
- `SUPABASE_DB_PASSWORD` (secret)
- `SUPABASE_JWT_SECRET` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `SUPABASE_URL`
- `TAILSCALE_CLIENT_ID`
- `TAILSCALE_CLIENT_SECRET` (secret)
- `TAILSCALE_EXIT_NODE_ENABLED`
- `TAILSCALE_KEY` (secret)
- `TAILSCALE_MAGIC_DNS_ENABLED`
- `TAILSCALE_MESH_NETWORK`
- `TAILSCALE_NETWORK_PREFIX`
- `TAILSCALE_SUBNET_ROUTES`
- `TAILSCALE_TAILNET`
- `TAVILY_API_KEY` (secret)
- `TWENTY_ACCESS_TOKEN` (secret)
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_API_KEY` (secret)
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_URL`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_FRONT_BASE_URL`
- `TWENTY_LOGIN_TOKEN_SECRET` (secret)
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_REDIS_PASSWORD` (secret)
- `TWENTY_REDIS_URL`
- `TWENTY_REFRESH_TOKEN_SECRET` (secret)
- `TWENTY_SERVER_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `VLLM_PORT`
- `VPS_LITELLM_MASTER_KEY` (secret)
- `WEBHOOK_URL` (secret)
- `WHATSAPP_ALLOW_ALL_USERS`
- `WHATSAPP_DM_POLICY`
- `WHATSAPP_ENABLED`
- `WHATSAPP_HOME_CHANNEL`
- `WHATSAPP_HOME_CHANNEL_NAME`
- `WHATSAPP_MODE`
- `WORKER_3060_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_3060_PORTAINER_EDGE_ID`
- `WORKER_3060_PORTAINER_EDGE_KEY` (secret)
- `WORKER_3060_PORTAINER_ENDPOINT_ID`
- `WORKER_3060_PORTAINER_HOST_IP`
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MODEL`
- `WORKER_RTX3090TI_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_BASE_URL`
- `WORKER_RTX3090TI_LITELLM_MODEL`
- `WORKER_RTX5090_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_BASE_URL`
- `WORKER_RTX5090_LITELLM_MODEL`

### worker-rtx3060

- `ARCHON_SERVER_URL`
- `BITNET_MODEL_DIR`
- `BITNET_MODEL_FILE`
- `CLAWTEAM_HOST`
- `COMPOSE_PROJECT_NAME`
- `EMBEDDINGS_CPUS`
- `EMBEDDING_MODEL`
- `GF_SECURITY_ADMIN_PASSWORD` (secret)
- `GF_SECURITY_ADMIN_USER`
- `GPU_MODEL`
- `GPU_VRAM`
- `INFISICAL_ENV`
- `INFISICAL_EXPORT_INTERVAL_SECONDS`
- `INFISICAL_PATH`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_TOKEN` (secret)
- `LETTA_DEFAULT_EMBEDDING_CONFIG`
- `LITELLM_API_BASE`
- `LITELLM_API_URL`
- `LITELLM_MASTER_KEY` (secret)
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `NEXUS_ROUTER_URL`
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_ENABLED`
- `OLLAMA_HOST`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MODEL`
- `OLLAMA_MODELS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `POSTGRES_URL`
- `POSTGRES_WORKER_RTX3060_PASSWORD` (secret)
- `RTX3060_LAN_IP`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_IP`
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_CHAT_LITELLM_MODEL`
- `WORKER_3060_EMBED_LITELLM_MODEL`
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_BASE_URL`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_3060_PORTAINER_EDGE_ID`
- `WORKER_3060_PORTAINER_EDGE_KEY` (secret)
- `WORKER_3060_PORTAINER_ENDPOINT_ID`
- `WORKER_3060_PORTAINER_HOST_IP`
- `WORKER_3060_URL`
- `WORKER_RTX3060_API_KEY` (secret)
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_API_KEY` (secret)
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MASTER_KEY` (secret)
- `WORKER_RTX3060_LITELLM_MODEL`

### worker-rtx3090ti

- `ADAPTER_DRIVER`
- `ADAPTER_OPENAI_API_KEY` (secret)
- `ADAPTER_OPENAI_BASE_URL`
- `ADAPTER_OPENAI_MODEL`
- `ADAPTER_STATE_DIR`
- `ADAPTER_TIMEOUT_MS`
- `AGENT_BROWSER_ENGINE`
- `AGENT_DESCRIPTION`
- `AGENT_NAME`
- `AGENT_PUBLIC_URL`
- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_INFISICAL_URL`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_TRUSTED_PROXIES`
- `ALERTMANAGER_PAGERDUTY_KEY` (secret)
- `ALERTMANAGER_PORT`
- `ALERTMANAGER_SLACK_WEBHOOK_URL` (secret)
- `ALERTMANAGER_WEBHOOK_SECRET` (secret)
- `ARCHON_SERVER_URL`
- `BROWSERLESS_TOKEN` (secret)
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `COPILOT_GITHUB_TOKEN` (secret)
- `DISCORD_BOT_TOKEN` (secret)
- `DISCORD_REPLY_TO_MODE`
- `ELEVENLABS_API_KEY` (secret)
- `ENCRYPTION_KEY` (secret)
- `EXA_API_KEY` (secret)
- `FAL_KEY` (secret)
- `FIRECRAWL_API_KEY` (secret)
- `FORGEJO_INTERNAL_TOKEN` (secret)
- `FORGEJO_JWT_SECRET` (secret)
- `FORGEJO_SECRET_KEY` (secret)
- `GITEA_DB_NAME`
- `GITEA_DB_PASS` (secret)
- `GITEA_DB_USER`
- `GITEA_TOKEN` (secret)
- `GPU_MODEL`
- `GPU_VRAM`
- `GRAFANA_CLICKHOUSE_DATABASE`
- `GRAFANA_CLICKHOUSE_PASSWORD` (secret)
- `GRAFANA_CLICKHOUSE_USER`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `GRAFANA_SECURITY_ADMIN_USER`
- `HASS_URL`
- `HERMES_API_SERVER_KEY` (secret)
- `HERMES_LANGFUSE_BASE_URL`
- `HERMES_LANGFUSE_PUBLIC_KEY` (secret)
- `HERMES_LANGFUSE_SECRET_KEY` (secret)
- `HF_API_KEY` (secret)
- `HF_TOKEN` (secret)
- `HOST`
- `HUGGINGFACE_API_KEY` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `IMAGE_TOOLS_DEBUG`
- `INFISICAL_AUDIT_RETENTION`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_DB_NAME`
- `INFISICAL_DB_PASSWORD` (secret)
- `INFISICAL_ENV`
- `INFISICAL_GATEWAY_CLIENT_ID`
- `INFISICAL_GATEWAY_CLIENT_SECRET` (secret)
- `INFISICAL_KMS_ENABLED`
- `INFISICAL_LOCAL_ADMIN_EMAIL`
- `INFISICAL_LOCAL_ADMIN_PASSWORD` (secret)
- `INFISICAL_ORGANIZATION_ID`
- `INFISICAL_ORGANIZATION_ID_LOCAL`
- `INFISICAL_ORGANIZATION_SLUG`
- `INFISICAL_PAM_ENABLED`
- `INFISICAL_PATH`
- `INFISICAL_PKI_KEY_ALGO` (secret)
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_PROJECT_ID_LOCAL`
- `INFISICAL_RECOMMENDED_NEXT`
- `INFISICAL_REDIS_PASSWORD` (secret)
- `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` (secret)
- `INFISICAL_SITE_URL`
- `INFISICAL_TOKEN` (secret)
- `LETTA_DB_NAME`
- `LETTA_DB_PASSWORD` (secret)
- `LETTA_DB_USER`
- `LITELLM_API_BASE`
- `LITELLM_API_KEY` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_INTERNAL_BASE_URL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LLXPRT_BRIDGE_API_KEY` (secret)
- `LOCAL_INFISICAL_URL`
- `LOG_LEVEL`
- `LOKI_PORT`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_BASE_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ENABLED`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_USER_PERSONALIZATION`
- `MISTRAL_API_KEY` (secret)
- `MOA_TOOLS_DEBUG`
- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_AGENT_TOKEN` (secret)
- `NEXUS_API_KEY` (secret)
- `NEXUS_BASE_URL`
- `NEXUS_CIRCUIT_BREAKER_ENABLED`
- `NEXUS_CIRCUIT_BREAKER_THRESHOLD`
- `NEXUS_CIRCUIT_BREAKER_TIMEOUT`
- `NEXUS_CONFIG`
- `NEXUS_CONTEXT_AGGREGATION`
- `NEXUS_FALLBACK_RETRIES`
- `NEXUS_HEALTH_CHECK_ENABLED`
- `NEXUS_HEALTH_CHECK_INTERVAL`
- `NEXUS_HEALTH_CHECK_TIMEOUT`
- `NEXUS_HOST`
- `NEXUS_LITELLM_MASTER_KEY` (secret)
- `NEXUS_LOAD_BALANCING`
- `NEXUS_MAX_CONCURRENT_REQUESTS`
- `NEXUS_MCP_URL`
- `NEXUS_MODEL_ROUTING_ENABLED`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_COST_AWARE`
- `NEXUS_ROUTER_FALLBACK_ENABLED`
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_LATENCY_THRESHOLD`
- `NEXUS_ROUTER_STRATEGY`
- `NEXUS_ROUTER_URL`
- `NOTION_TOKEN` (secret)
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_PORT`
- `OMNIROUTE_API_KEY` (secret)
- `OMNIROUTE_API_KEY_SECRET` (secret)
- `OMNIROUTE_INITIAL_PASSWORD` (secret)
- `OMNIROUTE_JWT_SECRET` (secret)
- `OPENAI_BASE_URL`
- `OPENCLAW_ENABLE_OPEN_WEBUI_CHANNELS_PLUGIN`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_OPEN_WEBUI_CHANNELS_BASE_URL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_CHANNEL_IDS_JSON`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_EMAIL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_ENABLED`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_PASSWORD` (secret)
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REF`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REPO`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REQUIRE_MENTION`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `OPENLIT_CLICKHOUSE_HTTP_PORT`
- `OPENLIT_CLICKHOUSE_NATIVE_PORT`
- `OPENLIT_DB_NAME`
- `OPENLIT_DB_PASSWORD` (secret)
- `OPENLIT_DB_USER`
- `OPENLIT_HOST_PORT`
- `OPENLIT_NEXTAUTH_SECRET` (secret)
- `OPENLIT_NEXTAUTH_URL` (secret)
- `OPENLIT_OPAMP_ENVIRONMENT`
- `OPENLIT_OPAMP_LOG_LEVEL`
- `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`
- `OPENLIT_OPAMP_TLS_MAX_VERSION`
- `OPENLIT_OPAMP_TLS_MIN_VERSION`
- `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT` (secret)
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MGMT_API_KEY` (secret)
- `OPENROUTER_PROVISIONING`
- `ORACLE_MAIN_NETWORK`
- `ORACLE_TAILSCALE_AUTHKEY` (secret)
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `OR_API_KEY` (secret)
- `PAPERCLIP_API_KEY` (secret)
- `PORT`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_INSECURE_POLL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_SYMLINK`
- `POSTGRES_URL`
- `POSTGRES_WORKER_RTX3090TI_PASSWORD` (secret)
- `PROJECTNYRA_DOMAIN`
- `PROMETHEUS_PORT`
- `PROMETHEUS_RETENTION_TIME`
- `PROMETHEUS_SCRAPE_INTERVAL`
- `QDRANT_API_KEY` (secret)
- `REDIS_AUTH_TOKEN` (secret)
- `REDIS_DB`
- `REDIS_EVICTION_POLICY`
- `REDIS_HOST`
- `REDIS_MAX_MEMORY`
- `REDIS_PASSWORD` (secret)
- `ROUTE_ALL_AI_THROUGH_NEXUS`
- `RTX3090TI_LAN_IP`
- `SEARXNG_SECRET` (secret)
- `SECRET_SCANNING_ENABLED` (secret)
- `SENTRY_ENVIRONMENT`
- `SERVICE_HF_TOKEN` (secret)
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_IP`
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_API_KEY` (secret)
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_ENABLED`
- `TWENTY_CRM_URL`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_USER`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_REDIS_PASSWORD` (secret)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX3090TI`
- `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX5090`
- `VLLM_HOST`
- `VLLM_MODEL`
- `VLLM_MODEL_WORKER_RTX3090TI`
- `VLLM_MODEL_WORKER_RTX5090`
- `VLLM_PORT`
- `VLLM_URL`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_LITELLM_MODEL`
- `WORKER_3090_MODELS`
- `WORKER_3090_URL`
- `WORKER_3090_VLLM_BASE_URL`
- `WORKER_5090_VLLM_BASE_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MODEL`
- `WORKER_RTX3090TI_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_BASE_URL`
- `WORKER_RTX3090TI_LITELLM_MODEL`
- `WORKER_RTX3090TI_MAC_ADDRESS`
- `WORKER_RTX5090PORTAINER_EDGE_KEY` (secret)
- `WORKER_RTX5090_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_BASE_URL`
- `WORKER_RTX5090_LITELLM_MODEL`
- `WORKER_RTX5090_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_RTX5090_PORTAINER_AGENT_TAGS`
- `WORKER_RTX5090_PORTAINER_EDGE_ID`
- `WORKER_RTX5090_PORTAINER_EDGE_INSECURE_POLL`

### worker-rtx5090

- `ADAPTER_COMMAND_JSON`
- `ADAPTER_DRIVER`
- `ADAPTER_PROMPT_MODE`
- `ADAPTER_STATE_DIR`
- `ADAPTER_TIMEOUT_MS`
- `ADAPTER_WORKDIR`
- `AGENT_BROWSER_ENGINE`
- `AGENT_DESCRIPTION`
- `AGENT_NAME`
- `AGENT_PUBLIC_URL`
- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_INFISICAL_URL`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_TRUSTED_PROXIES`
- `ALERTMANAGER_PAGERDUTY_KEY` (secret)
- `ALERTMANAGER_PORT`
- `ALERTMANAGER_SLACK_WEBHOOK_URL` (secret)
- `ALERTMANAGER_WEBHOOK_SECRET` (secret)
- `ALERT_THRESHOLD_GPU_TEMP`
- `ALERT_THRESHOLD_INFERENCE_TIME`
- `ALERT_THRESHOLD_VRAM_USAGE`
- `ARCHON_SERVER_URL`
- `BROWSERLESS_TOKEN` (secret)
- `CHECK_INTERVAL`
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_LITELLM_HOSTNAME`
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_NAME`
- `CODEX_RELAY_PUBLIC_URL`
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `CUDA_VISIBLE_DEVICES`
- `DOCKER_CPU_LIMIT`
- `DOCKER_MEMORY_LIMIT`
- `ELEVENLABS_API_KEY` (secret)
- `ENCRYPTION_KEY` (secret)
- `EXA_API_KEY` (secret)
- `FAL_KEY` (secret)
- `FIRECRAWL_API_KEY` (secret)
- `FIREWALL_TAILSCALE_ENABLED`
- `FORGEJO_INTERNAL_TOKEN` (secret)
- `FORGEJO_JWT_SECRET` (secret)
- `FORGEJO_SECRET_KEY` (secret)
- `GITEA_DB_NAME`
- `GITEA_DB_PASS` (secret)
- `GITEA_DB_USER`
- `GITEA_TOKEN` (secret)
- `GPU_MODEL`
- `GPU_TYPE`
- `GPU_VRAM`
- `GPU_WORKER_ID`
- `GRAFANA_CLICKHOUSE_PASSWORD` (secret)
- `GRAFANA_CLICKHOUSE_USER`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `GRAFANA_SECURITY_ADMIN_USER`
- `GRAFANA_URL`
- `HASS_URL`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `HERMES_API_SERVER_KEY` (secret)
- `HERMES_LANGFUSE_BASE_URL`
- `HERMES_LANGFUSE_PUBLIC_KEY` (secret)
- `HERMES_LANGFUSE_SECRET_KEY` (secret)
- `HF_API_KEY` (secret)
- `HF_TOKEN` (secret)
- `HOST`
- `HUGGINGFACE_API_KEY` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `IMAGE_TOOLS_DEBUG`
- `INFISICAL_AUDIT_RETENTION`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_DB_NAME`
- `INFISICAL_DB_PASSWORD` (secret)
- `INFISICAL_DB_USER`
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `INFISICAL_ENV`
- `INFISICAL_GATEWAY_CLIENT_ID`
- `INFISICAL_GATEWAY_CLIENT_SECRET` (secret)
- `INFISICAL_KMS_ENABLED`
- `INFISICAL_LOCAL_ADMIN_EMAIL`
- `INFISICAL_LOCAL_ADMIN_PASSWORD` (secret)
- `INFISICAL_ORGANIZATION_ID`
- `INFISICAL_ORGANIZATION_ID_LOCAL`
- `INFISICAL_ORGANIZATION_SLUG`
- `INFISICAL_PAM_ENABLED`
- `INFISICAL_PATH`
- `INFISICAL_PKI_KEY_ALGO` (secret)
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_PROJECT_ID_LOCAL`
- `INFISICAL_RECOMMENDED_NEXT`
- `INFISICAL_REDIS_PASSWORD` (secret)
- `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` (secret)
- `INFISICAL_SITE_URL`
- `INFISICAL_SSH_CA_TTL`
- `INFISICAL_TOKEN` (secret)
- `LETTA_DB_PASSWORD` (secret)
- `LETTA_DB_USER`
- `LITELLM_API_BASE`
- `LITELLM_API_KEY` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_INTERNAL_BASE_URL`
- `LITELLM_LOG`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LLXPRT_BRIDGE_API_KEY` (secret)
- `LOCAL_INFISICAL_URL`
- `LOG_FILE`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOKI_PORT`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `MACHINE_HOSTNAME`
- `MACHINE_IP_ETHERNET`
- `MACHINE_IP_TAILSCALE`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_BASE_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ENABLED`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_USER_PERSONALIZATION`
- `MISTRAL_API_KEY` (secret)
- `MOA_TOOLS_DEBUG`
- `MODEL_MANAGER_PORT`
- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_AGENT_TOKEN` (secret)
- `NEXUS_API_KEY` (secret)
- `NEXUS_BASE_URL`
- `NEXUS_CIRCUIT_BREAKER_ENABLED`
- `NEXUS_CIRCUIT_BREAKER_THRESHOLD`
- `NEXUS_CIRCUIT_BREAKER_TIMEOUT`
- `NEXUS_CONFIG`
- `NEXUS_CONTEXT_AGGREGATION`
- `NEXUS_FALLBACK_RETRIES`
- `NEXUS_HEALTH_CHECK_ENABLED`
- `NEXUS_HEALTH_CHECK_INTERVAL`
- `NEXUS_INTERNAL_BASE_URL`
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_LITELLM_MASTER_KEY` (secret)
- `NEXUS_LOAD_BALANCING`
- `NEXUS_MAX_CONCURRENT_REQUESTS`
- `NEXUS_MCP_URL`
- `NEXUS_MODEL_ROUTING_ENABLED`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_COST_AWARE`
- `NEXUS_ROUTER_FALLBACK_ENABLED`
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_LATENCY_THRESHOLD`
- `NEXUS_ROUTER_STRATEGY`
- `NEXUS_ROUTER_URL`
- `NOTION_TOKEN` (secret)
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_HOST`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MODELS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_PORT`
- `OMNIROUTE_API_KEY` (secret)
- `OMNIROUTE_API_KEY_SECRET` (secret)
- `OMNIROUTE_INITIAL_PASSWORD` (secret)
- `OMNIROUTE_JWT_SECRET` (secret)
- `OPENAI_BASE_URL`
- `OPENCLAW_ENABLE_OPEN_WEBUI_CHANNELS_PLUGIN`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_OPEN_WEBUI_CHANNELS_BASE_URL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_CHANNEL_IDS_JSON`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_EMAIL`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_ENABLED`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_PASSWORD` (secret)
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REF`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REPO`
- `OPENCLAW_OPEN_WEBUI_CHANNELS_REQUIRE_MENTION`
- `OPENLIT_ALLOWED_CORS_ORIGINS`
- `OPENLIT_CLICKHOUSE_HTTP_PORT`
- `OPENLIT_CLICKHOUSE_NATIVE_PORT`
- `OPENLIT_DB_NAME`
- `OPENLIT_DB_PASSWORD` (secret)
- `OPENLIT_DB_USER`
- `OPENLIT_HOST_PORT`
- `OPENLIT_NEXTAUTH_SECRET` (secret)
- `OPENLIT_NEXTAUTH_URL` (secret)
- `OPENLIT_OPAMP_ENVIRONMENT`
- `OPENLIT_OPAMP_LOG_LEVEL`
- `OPENLIT_OPAMP_TLS_INSECURE_SKIP_VERIFY`
- `OPENLIT_OPAMP_TLS_MAX_VERSION`
- `OPENLIT_OPAMP_TLS_MIN_VERSION`
- `OPENLIT_OPAMP_TLS_REQUIRE_CLIENT_CERT` (secret)
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_MGMT_API_KEY` (secret)
- `OPENROUTER_PROVISIONING`
- `ORACLE_MAIN_NETWORK`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `OR_API_KEY` (secret)
- `PAPERCLIP_API_KEY` (secret)
- `PERF_MONITOR_PORT`
- `PORT`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_INSECURE_POLL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_SYMLINK`
- `POSTGRES_URL`
- `POSTGRES_WORKER_RTX5090_PASSWORD` (secret)
- `PRIMARY_MODELS`
- `PROJECTNYRA_DOMAIN`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `PROMETHEUS_RETENTION_TIME`
- `QDRANT_API_KEY` (secret)
- `REDIS_AUTH_TOKEN` (secret)
- `REDIS_DB`
- `REDIS_EVICTION_POLICY`
- `REDIS_HOST`
- `REDIS_MAX_MEMORY`
- `REDIS_PASSWORD` (secret)
- `ROUTE_ALL_AI_THROUGH_NEXUS`
- `RTX5090_LAN_IP`
- `SEARXNG_SECRET` (secret)
- `SECRET_SCANNING_ENABLED` (secret)
- `SENTRY_ENVIRONMENT`
- `SERVICES`
- `SERVICE_HF_TOKEN` (secret)
- `SPECIALIZATION`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_ENABLED`
- `TWENTY_CRM_URL`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_USER`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_FRONT_BASE_URL`
- `TWENTY_JWT_SECRET` (secret)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX3090TI`
- `VLLM_GPU_MEMORY_UTILIZATION_WORKER_RTX5090`
- `VLLM_HOST`
- `VLLM_MODEL`
- `VLLM_MODEL_WORKER_RTX3090TI`
- `VLLM_MODEL_WORKER_RTX5090`
- `VLLM_PORT`
- `VLLM_URL`
- `VRAM_GB`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_VLLM_BASE_URL`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_LITELLM_MODEL`
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_TAILSCALE_AUTHKEY` (secret)
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_BASE_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_ID`
- `WORKER_ROLE`
- `WORKER_RTX3060_EMBEDDING_MODEL`
- `WORKER_RTX3060_LITELLM_BASE_URL`
- `WORKER_RTX3060_LITELLM_MODEL`
- `WORKER_RTX3090TI_API_KEY` (secret)
- `WORKER_RTX3090TI_LITELLM_BASE_URL`
- `WORKER_RTX3090TI_LITELLM_MODEL`
- `WORKER_RTX5090PORTAINER_EDGE_KEY` (secret)
- `WORKER_RTX5090_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_API_KEY` (secret)
- `WORKER_RTX5090_LITELLM_BASE_URL`
- `WORKER_RTX5090_LITELLM_MODEL`
- `WORKER_RTX5090_MAC_ADDRESS`
- `WORKER_RTX5090_PORTAINER_AGENT_BIND_ADDR`
- `WORKER_RTX5090_PORTAINER_AGENT_TAGS`
- `WORKER_RTX5090_PORTAINER_EDGE_ID`
- `WORKER_RTX5090_PORTAINER_EDGE_INSECURE_POLL`
- `WORKER_RTX5090_PORTAINER_EDGE_KEY` (secret)
- `WORKER_RTX5090_PORTAINER_ENDPOINT_ID`
- `XAI_API_KEY` (secret)

## App-specific secret/env lists (`apps/*`)

### apps/guidance

- `ALERT_EMAIL`
- `APP_SECRET` (secret)
- `ASSET_CDN_URL`
- `CONFLICT_STRATEGY`
- `CRM_API_KEY` (secret)
- `CRM_API_URL`
- `DEFAULT_THEME`
- `HEALTH_CHECK_INTERVAL_MINUTES`
- `LITELLM_BASE_URL`
- `LITELLM_MASTER_KEY` (secret)
- `LOG_LEVEL`
- `MAGIC_UI_ENABLED`
- `MAX_RETRY_ATTEMPTS`
- `NEXT_PUBLIC_ACTIVEPIECES_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_ARCHON_UI_URL`
- `NEXT_PUBLIC_DOCS_BASE_URL`
- `NEXT_PUBLIC_GRAFANA_URL`
- `NEXT_PUBLIC_MEM0_PROXY_URL`
- `NEXT_PUBLIC_N8N_URL`
- `NEXT_PUBLIC_NEXUS_URL`
- `NEXT_PUBLIC_OPENCLAW_URL`
- `NEXT_PUBLIC_PORTAINER_URL`
- `NEXT_PUBLIC_QUOTE_API_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL`
- `NEXT_PUBLIC_WEBAPP_URL`
- `NEXT_PUBLIC_WEBHOOK_URL` (secret)
- `NEXUS_BASE_URL`
- `NEXUS_CONFIG_APPLY_ENABLED`
- `NEXUS_DEPLOY_TARGET`
- `NEXUS_UI_SETTINGS_PATH`
- `NODE_ENV`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `OPENCLAW_CHAT_PATH`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_PUBLIC_BASE_URL`
- `PG_DATABASE_URL`
- `PORT`
- `REDIS_URL`
- `RETRY_DELAY_MS`
- `SERVER_URL`
- `SHADCN_REGISTRY_URL`
- `SHARED_SCHEMA_VERSION`
- `STORAGE_TYPE`
- `SYNC_BATCH_SIZE`
- `SYNC_INTERVAL_MINUTES`
- `TWEAKCN_PRESET`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_API_URL`
- `TWENTYCRM_WEBHOOK_SECRET` (secret)

### apps/projectnyra

- `CAMPAIGN_ENGINE_URL`
- `CRM_API_KEY` (secret)
- `CRM_API_URL`
- `NEXT_PUBLIC_ACTIVEPIECES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_N8N_URL`
- `NEXT_PUBLIC_NEXUS_UI_URL`
- `NEXT_PUBLIC_OPENCLAW_URL`
- `NEXT_PUBLIC_OPENMEMORY_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (secret)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_TWENTY_URL`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `NYRA_ENABLE_MOCKS`
- `OPENCLAW_CHAT_PATH`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_PUBLIC_BASE_URL`
- `QUOTE_API_SECRET` (secret)
- `QUOTE_API_URL`
- `SUPABASE_JWT_SECRET` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)

### apps/ratehunter

- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NODE_ENV`
- `NODE_VERSION`
