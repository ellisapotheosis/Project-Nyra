# Master Env/Secrets List (Deduplicated)

This file is intended for Infisical host/app profiles. Variables are deduplicated globally.

## Global deduplicated variable index

| Variable                                    | Sensitive? | Seen In | Env-specific values?              |
| ------------------------------------------- | ---------- | ------: | --------------------------------- |
| `ACTIVEPIECES_API_KEY`                      | Yes        |       3 | not specified                     |
| `ACTIVEPIECES_API_URL`                      | No         |       1 | dev                               |
| `ACTIVEPIECES_BASE_URL`                     | No         |       1 | dev                               |
| `ACTIVEPIECES_ENCRYPTION_KEY`               | Yes        |       3 | multiple defaults (not specified) |
| `ACTIVEPIECES_HOST`                         | No         |       1 | not specified                     |
| `ACTIVEPIECES_JWT_SECRET`                   | Yes        |       3 | multiple defaults (not specified) |
| `ACTIVEPIECES_PORT`                         | No         |       2 | multiple defaults (not specified) |
| `ACTIVEPIECES_WEBHOOK_SECRET`               | Yes        |       1 | not specified                     |
| `AGENT_VAULT_ADDR`                          | No         |       2 | multiple defaults (not specified) |
| `AGENT_VAULT_ADMIN_EMAIL`                   | No         |       1 | not specified                     |
| `AGENT_VAULT_ADMIN_PASSWORD`                | Yes        |       1 | not specified                     |
| `AGENT_VAULT_IDENTITY_ID`                   | No         |       1 | not specified                     |
| `AGENT_VAULT_MASTER_PASSWORD`               | Yes        |       2 | multiple defaults (not specified) |
| `AGENT_VAULT_ORG_ID`                        | No         |       1 | not specified                     |
| `AGENT_VAULT_TRUSTED_PROXIES`               | No         |       2 | not specified                     |
| `AGENT_VAULT_UA_CLIENT_ID`                  | No         |       1 | not specified                     |
| `AGENT_VAULT_UA_CLIENT_SECRET`              | Yes        |       1 | not specified                     |
| `ALERTMANAGER_HOST`                         | No         |       1 | not specified                     |
| `ALERTMANAGER_PORT`                         | No         |       2 | not specified                     |
| `ALERT_CHECK_INTERVAL_MINUTES`              | No         |       1 | not specified                     |
| `ALERT_EMAIL`                               | No         |       2 | not specified                     |
| `ALERT_EMAIL_ENABLED`                       | No         |       1 | not specified                     |
| `ALERT_EMAIL_TO`                            | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_GPU_TEMP`                  | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_INFERENCE_TIME`            | No         |       1 | not specified                     |
| `ALERT_THRESHOLD_VRAM_USAGE`                | No         |       1 | not specified                     |
| `ALERT_WEBHOOK_URL`                         | Yes        |       1 | not specified                     |
| `ALLOWED_FILE_TYPES`                        | No         |       2 | multiple defaults (not specified) |
| `ALLOWED_ORIGINS`                           | No         |       1 | dev                               |
| `ANTHROPIC_API_KEY`                         | Yes        |       9 | multiple defaults (not specified) |
| `ANTHROPIC_MAX_TOKENS`                      | Yes        |       1 | not specified                     |
| `ANTHROPIC_MODEL`                           | No         |       1 | not specified                     |
| `API_KEY`                                   | Yes        |       1 | not specified                     |
| `API_KEY_EXPIRY`                            | Yes        |       1 | not specified                     |
| `API_KEY_HEADER`                            | Yes        |       1 | not specified                     |
| `API_RATE_LIMITING_REQUEST_COUNT`           | No         |       1 | not specified                     |
| `API_RATE_LIMITING_TTL`                     | No         |       1 | not specified                     |
| `API_RATE_LIMIT_MAX_REQUESTS`               | No         |       1 | not specified                     |
| `API_RATE_LIMIT_WINDOW_MS`                  | No         |       1 | not specified                     |
| `API_VERSION`                               | No         |       4 | not specified                     |
| `APP_SECRET`                                | Yes        |       1 | not specified                     |
| `AP_DB_TYPE`                                | No         |       1 | not specified                     |
| `AP_ENCRYPTION_KEY`                         | Yes        |       2 | multiple defaults (not specified) |
| `AP_EXECUTION_MODE`                         | No         |       1 | not specified                     |
| `AP_FRONTEND_URL`                           | No         |       2 | multiple defaults (not specified) |
| `AP_JWT_SECRET`                             | Yes        |       2 | multiple defaults (not specified) |
| `AP_POSTGRES_DATABASE`                      | No         |       1 | not specified                     |
| `AP_POSTGRES_HOST`                          | No         |       1 | not specified                     |
| `AP_POSTGRES_PASSWORD`                      | Yes        |       2 | multiple defaults (not specified) |
| `AP_POSTGRES_PORT`                          | No         |       1 | not specified                     |
| `AP_POSTGRES_USERNAME`                      | No         |       2 | not specified                     |
| `AP_REDIS_HOST`                             | No         |       1 | not specified                     |
| `AP_REDIS_PASSWORD`                         | Yes        |       1 | not specified                     |
| `AP_REDIS_PORT`                             | No         |       1 | not specified                     |
| `AP_TELEMETRY_ENABLED`                      | No         |       1 | not specified                     |
| `ARCHON_HOST`                               | No         |       1 | not specified                     |
| `ARCHON_MODE`                               | No         |       2 | not specified                     |
| `ARCHON_OS_PORT`                            | No         |       1 | not specified                     |
| `ARCHON_PORT`                               | No         |       1 | not specified                     |
| `ARCHON_SERVER_URL`                         | No         |       3 | not specified                     |
| `ARCHON_STATUS_URL`                         | No         |       1 | not specified                     |
| `ASSET_CDN_URL`                             | No         |       1 | not specified                     |
| `ASSIGNMENT_ENABLED`                        | No         |       1 | not specified                     |
| `ASSIGNMENT_STRATEGY`                       | No         |       1 | not specified                     |
| `ASSISTANT_GATEWAY_URL`                     | No         |       1 | not specified                     |
| `AWS_ACCESS_KEY_ID`                         | Yes        |       1 | not specified                     |
| `AWS_REGION`                                | No         |       1 | not specified                     |
| `AWS_SECRET_ACCESS_KEY`                     | Yes        |       1 | not specified                     |
| `BACKUP_DIR`                                | No         |       1 | not specified                     |
| `BACKUP_ENABLED`                            | No         |       1 | not specified                     |
| `BACKUP_RETENTION_DAYS`                     | No         |       1 | not specified                     |
| `BACKUP_SCHEDULE`                           | No         |       1 | not specified                     |
| `BATCH_SIZE`                                | No         |       1 | not specified                     |
| `BCRYPT_ROUNDS`                             | No         |       1 | not specified                     |
| `BOOT_OPENCLAW`                             | No         |       1 | not specified                     |
| `BOOT_OPENCLAW_UI_PROXY`                    | No         |       1 | not specified                     |
| `BOOT_OPENCLAW_VOICE`                       | No         |       1 | not specified                     |
| `BROWSERLESS_CONCURRENT`                    | No         |       1 | not specified                     |
| `BROWSERLESS_HOST_PORT`                     | No         |       1 | not specified                     |
| `BROWSERLESS_KEEP_ALIVE`                    | No         |       1 | not specified                     |
| `BROWSERLESS_PREBOOT_CHROME`                | No         |       1 | not specified                     |
| `BROWSERLESS_QUEUED`                        | No         |       1 | not specified                     |
| `BROWSERLESS_TIMEOUT_MS`                    | No         |       1 | not specified                     |
| `BROWSERLESS_TOKEN`                         | Yes        |       2 | not specified                     |
| `CACHE_MAX_SIZE`                            | No         |       1 | not specified                     |
| `CACHE_TTL`                                 | No         |       1 | not specified                     |
| `CACHE_TTL_CALCULATOR`                      | No         |       1 | not specified                     |
| `CACHE_TTL_RATES`                           | No         |       1 | not specified                     |
| `CACHE_TTL_SECONDS`                         | No         |       1 | not specified                     |
| `CADVISOR_PORT`                             | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_HOST`                      | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_PORT`                      | No         |       1 | not specified                     |
| `CAMPAIGN_ENGINE_URL`                       | No         |       2 | multiple defaults (dev)           |
| `CAMPAIGN_MAX_RETRIES`                      | No         |       1 | not specified                     |
| `CAMPAIGN_RETRY_DELAY_MINUTES`              | No         |       1 | not specified                     |
| `CAMPAIGN_TIMEZONE`                         | No         |       1 | not specified                     |
| `CF_TUNNEL_TOKEN`                           | Yes        |       1 | not specified                     |
| `CHECK_INTERVAL`                            | No         |       1 | not specified                     |
| `CLAUDE_FLOW_CONFIG_PATH`                   | No         |       1 | not specified                     |
| `CLAUDE_FLOW_HOST`                          | No         |       1 | not specified                     |
| `CLAUDE_FLOW_MODE`                          | No         |       1 | not specified                     |
| `CLAUDE_FLOW_PORT`                          | No         |       1 | not specified                     |
| `CLAWDBOT_GATEWAY_PORT`                     | No         |       2 | not specified                     |
| `CLAWDBOT_GATEWAY_TOKEN`                    | Yes        |       2 | multiple defaults (not specified) |
| `CLEARBIT_API_KEY`                          | Yes        |       1 | not specified                     |
| `CLERK_SECRET_KEY`                          | Yes        |       1 | not specified                     |
| `CLOUDFLARED_HOSTNAME`                      | No         |       1 | not specified                     |
| `CLOUDFLARED_LITELLM_HOSTNAME`              | No         |       1 | not specified                     |
| `CLOUDFLARED_TOKEN`                         | Yes        |       1 | not specified                     |
| `CLOUDFLARED_TUNNEL_NAME`                   | No         |       1 | not specified                     |
| `CLOUDFLARED_TUNNEL_TOKEN`                  | Yes        |       2 | not specified                     |
| `CLOUDFLARE_API_TOKEN`                      | Yes        |       1 | not specified                     |
| `CLOUDFLARE_TUNNEL_TOKEN`                   | Yes        |       2 | not specified                     |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`      | Yes        |       2 | multiple defaults (not specified) |
| `CLOUDFLARE_ZONE_ID`                        | No         |       1 | not specified                     |
| `COMPOSE_PROFILES`                          | No         |       3 | multiple defaults (not specified) |
| `COMPOSE_PROJECT_NAME`                      | No         |       3 | multiple defaults (not specified) |
| `COMPOSIO_API_KEY`                          | Yes        |       2 | multiple defaults (not specified) |
| `COMPOSIO_DEFAULT_USER_ID`                  | No         |       2 | not specified                     |
| `COMPOSIO_EXECUTION_POLICY`                 | No         |       1 | not specified                     |
| `COMPOSIO_MCP_SERVER_ID`                    | No         |       2 | multiple defaults (not specified) |
| `COMPOSIO_MCP_SERVER_NAME`                  | No         |       1 | not specified                     |
| `COMPOSIO_MCP_TRANSPORT`                    | No         |       1 | not specified                     |
| `COMPOSIO_MCP_URL`                          | No         |       2 | dev                               |
| `COMPOSIO_TOOLKITS_ALLOW`                   | No         |       1 | not specified                     |
| `CONFIG_DIR`                                | No         |       1 | not specified                     |
| `CONFLICT_STRATEGY`                         | No         |       2 | not specified                     |
| `CONNECTION_TIMEOUT`                        | No         |       1 | not specified                     |
| `CONSENT_REQUIRED`                          | No         |       1 | not specified                     |
| `CORS_ALLOWED_ORIGINS`                      | No         |       4 | multiple defaults (dev)           |
| `CORS_ORIGIN`                               | No         |       2 | multiple defaults (dev)           |
| `CRM_API_KEY`                               | Yes        |       3 | multiple defaults (not specified) |
| `CRM_API_URL`                               | No         |       2 | multiple defaults (dev)           |
| `CUDA_VISIBLE_DEVICES`                      | No         |       2 | not specified                     |
| `DATABASE_URL`                              | No         |       5 | multiple defaults (dev)           |
| `DATA_DIR`                                  | No         |       1 | not specified                     |
| `DB_HOST`                                   | No         |       3 | dev                               |
| `DB_NAME`                                   | No         |       3 | multiple defaults (not specified) |
| `DB_PASSWORD`                               | Yes        |       3 | multiple defaults (not specified) |
| `DB_POOL_MAX`                               | No         |       1 | not specified                     |
| `DB_POOL_MIN`                               | No         |       1 | not specified                     |
| `DB_PORT`                                   | No         |       3 | not specified                     |
| `DB_USER`                                   | No         |       3 | not specified                     |
| `DEBUG_MODE`                                | No         |       3 | not specified                     |
| `DEFAULT_THEME`                             | No         |       1 | not specified                     |
| `DISCORD_BOT_TOKEN`                         | Yes        |       2 | not specified                     |
| `DNC_CHECK_ENABLED`                         | No         |       1 | not specified                     |
| `DOCKER_CPU_LIMIT`                          | No         |       1 | not specified                     |
| `DOCKER_MEMORY_LIMIT`                       | No         |       1 | not specified                     |
| `DOCKER_REGISTRY`                           | No         |       1 | not specified                     |
| `DOCKER_REGISTRY_PASS`                      | Yes        |       1 | not specified                     |
| `DOCKER_REGISTRY_USER`                      | No         |       1 | not specified                     |
| `DOCUSIGN_ACCOUNT_ID`                       | No         |       1 | not specified                     |
| `DOCUSIGN_BASE_PATH`                        | No         |       1 | not specified                     |
| `DOCUSIGN_INTEGRATION_KEY`                  | Yes        |       1 | not specified                     |
| `DOCUSIGN_PRIVATE_KEY_PATH`                 | Yes        |       1 | not specified                     |
| `DOCUSIGN_USER_ID`                          | No         |       1 | not specified                     |
| `DOMAIN_NAME`                               | No         |       1 | not specified                     |
| `ELASTICSEARCH_INDEX`                       | No         |       1 | not specified                     |
| `ELASTICSEARCH_NODE`                        | No         |       1 | dev                               |
| `EMAIL_DRIVER`                              | No         |       1 | not specified                     |
| `EMAIL_FROM`                                | No         |       3 | multiple defaults (not specified) |
| `EMAIL_FROM_ADDRESS`                        | No         |       1 | not specified                     |
| `EMAIL_HOST`                                | No         |       1 | not specified                     |
| `EMAIL_PASSWORD`                            | Yes        |       1 | not specified                     |
| `EMAIL_PORT`                                | No         |       1 | not specified                     |
| `EMAIL_SECURE`                              | No         |       1 | not specified                     |
| `EMAIL_SYSTEM_ADDRESS`                      | No         |       1 | not specified                     |
| `EMAIL_USER`                                | No         |       1 | not specified                     |
| `ENABLE_AUDIT_LOGGING`                      | No         |       1 | not specified                     |
| `ENABLE_CACHING`                            | No         |       1 | not specified                     |
| `ENABLE_COMPLIANCE_CHECKS`                  | No         |       1 | not specified                     |
| `ENABLE_COST_TRACKING`                      | No         |       1 | not specified                     |
| `ENABLE_CRM`                                | No         |       2 | multiple defaults (not specified) |
| `ENABLE_GPU_WORKERS`                        | No         |       2 | not specified                     |
| `ENABLE_GUARDRAILS`                         | No         |       1 | not specified                     |
| `ENABLE_MONITORING`                         | No         |       3 | not specified                     |
| `ENABLE_RATE_LIMITING`                      | No         |       1 | not specified                     |
| `ENABLE_WORKFLOWS`                          | No         |       2 | not specified                     |
| `ENABLE_YAML_CONFIG_EDITING`                | No         |       1 | not specified                     |
| `ENCRYPTION_KEY`                            | Yes        |       1 | not specified                     |
| `ENRICHMENT_ENABLED`                        | No         |       1 | not specified                     |
| `ENRICHMENT_PROVIDER`                       | No         |       1 | not specified                     |
| `FALKORDB_CACHE_SIZE_MB`                    | No         |       1 | not specified                     |
| `FALKORDB_HOST`                             | No         |       2 | multiple defaults (not specified) |
| `FALKORDB_PASSWORD`                         | Yes        |       1 | not specified                     |
| `FALKORDB_PORT`                             | No         |       2 | multiple defaults (not specified) |
| `FALKORDB_QUERY_MEM_CAPACITY`               | No         |       1 | not specified                     |
| `FALKORDB_THREADS`                          | No         |       1 | not specified                     |
| `FALKORDB_TIMEOUT_DEFAULT_MS`               | No         |       1 | not specified                     |
| `FALKORDB_TIMEOUT_MAX_MS`                   | No         |       1 | not specified                     |
| `FALKORDB_URL`                              | No         |       1 | dev                               |
| `FRONTEND_URL`                              | No         |       1 | dev                               |
| `GEMINI_API_KEY`                            | Yes        |       2 | multiple defaults (not specified) |
| `GEMINI_BASE_URL`                           | No         |       1 | not specified                     |
| `GEMINI_MAX_TOKENS`                         | Yes        |       1 | not specified                     |
| `GEMINI_MODEL`                              | No         |       1 | not specified                     |
| `GITEA_ACTIONS_ENABLED`                     | No         |       1 | not specified                     |
| `GITEA_ADMIN_EMAIL`                         | No         |       1 | not specified                     |
| `GITEA_ADMIN_PASSWORD`                      | Yes        |       1 | not specified                     |
| `GITEA_ADMIN_USER`                          | No         |       1 | not specified                     |
| `GITEA_DB_HOST`                             | No         |       1 | not specified                     |
| `GITEA_DB_NAME`                             | No         |       2 | not specified                     |
| `GITEA_DB_PASSWORD`                         | Yes        |       2 | not specified                     |
| `GITEA_DB_PORT`                             | No         |       1 | not specified                     |
| `GITEA_DB_TYPE`                             | No         |       1 | not specified                     |
| `GITEA_DB_USER`                             | No         |       2 | not specified                     |
| `GITEA_DOMAIN`                              | No         |       2 | multiple defaults (dev)           |
| `GITEA_HOST`                                | No         |       1 | not specified                     |
| `GITEA_HTTP_PORT`                           | No         |       1 | not specified                     |
| `GITEA_INTERNAL_TOKEN`                      | Yes        |       1 | not specified                     |
| `GITEA_JWT_SECRET`                          | Yes        |       2 | not specified                     |
| `GITEA_PORT`                                | No         |       3 | not specified                     |
| `GITEA_REPO`                                | No         |       1 | not specified                     |
| `GITEA_ROOT_URL`                            | No         |       4 | multiple defaults (dev)           |
| `GITEA_RUNNER_NAME`                         | No         |       1 | not specified                     |
| `GITEA_RUNNER_REGISTRATION_TOKEN`           | Yes        |       1 | not specified                     |
| `GITEA_RUNNER_TOKEN`                        | Yes        |       1 | not specified                     |
| `GITEA_SECRET_KEY`                          | Yes        |       3 | not specified                     |
| `GITEA_SSH_DOMAIN`                          | No         |       3 | multiple defaults (dev)           |
| `GITEA_SSH_PORT`                            | No         |       4 | not specified                     |
| `GITEA_TOKEN`                               | Yes        |       1 | not specified                     |
| `GITHUB_MIRROR_INTERVAL_SECONDS`            | No         |       1 | not specified                     |
| `GITHUB_REPO`                               | No         |       1 | not specified                     |
| `GITHUB_TOKEN`                              | Yes        |       1 | not specified                     |
| `GOOGLE_API_KEY`                            | Yes        |       4 | multiple defaults (not specified) |
| `GOOGLE_CALLBACK_URL`                       | No         |       1 | dev                               |
| `GOOGLE_CLIENT_ID`                          | No         |       1 | not specified                     |
| `GOOGLE_CLIENT_SECRET`                      | Yes        |       1 | not specified                     |
| `GOOGLE_WORKSPACE_CLIENT_ID`                | No         |       1 | not specified                     |
| `GOOGLE_WORKSPACE_CLIENT_SECRET`            | Yes        |       1 | not specified                     |
| `GPU_MODEL`                                 | No         |       3 | multiple defaults (not specified) |
| `GPU_TYPE`                                  | No         |       1 | not specified                     |
| `GPU_VRAM`                                  | No         |       3 | multiple defaults (not specified) |
| `GPU_WORKER_ID`                             | No         |       1 | not specified                     |
| `GRAFANA_ADMIN_PASSWORD`                    | Yes        |       5 | multiple defaults (not specified) |
| `GRAFANA_ADMIN_USER`                        | No         |       2 | not specified                     |
| `GRAFANA_CPU_LIMIT`                         | No         |       1 | not specified                     |
| `GRAFANA_HOST`                              | No         |       1 | not specified                     |
| `GRAFANA_MEMORY_LIMIT`                      | No         |       2 | multiple defaults (not specified) |
| `GRAFANA_PASSWORD`                          | Yes        |       1 | not specified                     |
| `GRAFANA_PORT`                              | No         |       3 | multiple defaults (not specified) |
| `GRAFANA_ROOT_URL`                          | No         |       1 | not specified                     |
| `GRAFANA_URL`                               | No         |       2 | multiple defaults (not specified) |
| `GROQ_API_KEY`                              | Yes        |       2 | not specified                     |
| `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION` | No         |       1 | not specified                     |
| `HAMCP_ENABLE_FILESYSTEM_TOOLS`             | No         |       1 | not specified                     |
| `HASS_LONG_LIVED_TOKEN`                     | Yes        |       1 | not specified                     |
| `HASS_URL`                                  | No         |       1 | not specified                     |
| `HA_MCP_BACKUP_HINT`                        | No         |       1 | not specified                     |
| `HA_MCP_IMAGE`                              | No         |       1 | not specified                     |
| `HEALTH_CHECK_INTERVAL`                     | No         |       1 | not specified                     |
| `HEALTH_CHECK_INTERVAL_MINUTES`             | No         |       2 | not specified                     |
| `HEALTH_CHECK_PORT`                         | No         |       1 | not specified                     |
| `HEALTH_CHECK_RETRIES`                      | No         |       1 | not specified                     |
| `HEALTH_CHECK_TIMEOUT`                      | No         |       1 | not specified                     |
| `HOMEASSISTANT_TOKEN`                       | Yes        |       1 | not specified                     |
| `HOMEASSISTANT_URL`                         | No         |       1 | not specified                     |
| `HOT_RELOAD_ENABLED`                        | No         |       2 | multiple defaults (not specified) |
| `INFISICAL_API_URL`                         | No         |       2 | not specified                     |
| `INFISICAL_AUDIT_RETENTION`                 | No         |       1 | not specified                     |
| `INFISICAL_AUTH_SECRET`                     | Yes        |       3 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_ID`                       | No         |       2 | not specified                     |
| `INFISICAL_CLIENT_SECRET`                   | Yes        |       2 | not specified                     |
| `INFISICAL_DB_NAME`                         | No         |       1 | not specified                     |
| `INFISICAL_DB_PASSWORD`                     | Yes        |       1 | not specified                     |
| `INFISICAL_DB_USER`                         | No         |       1 | not specified                     |
| `INFISICAL_ENCRYPTION_KEY`                  | Yes        |       3 | multiple defaults (not specified) |
| `INFISICAL_ENV`                             | No         |       4 | multiple defaults (dev, prod)     |
| `INFISICAL_ENVIRONMENT`                     | No         |       1 | dev                               |
| `INFISICAL_GATEWAY_CLIENT_ID`               | No         |       1 | not specified                     |
| `INFISICAL_GATEWAY_CLIENT_SECRET`           | Yes        |       1 | not specified                     |
| `INFISICAL_LICENSE_KEY`                     | Yes        |       1 | not specified                     |
| `INFISICAL_PATH`                            | No         |       3 | multiple defaults (not specified) |
| `INFISICAL_PKI_KEY_ALGO`                    | Yes        |       1 | not specified                     |
| `INFISICAL_POLL_INTERVAL`                   | No         |       2 | not specified                     |
| `INFISICAL_PORT`                            | No         |       1 | not specified                     |
| `INFISICAL_POSTGRES_DB`                     | No         |       1 | not specified                     |
| `INFISICAL_POSTGRES_PASSWORD`               | Yes        |       1 | not specified                     |
| `INFISICAL_POSTGRES_USER`                   | No         |       1 | not specified                     |
| `INFISICAL_PROJECT_ID`                      | No         |       5 | multiple defaults (not specified) |
| `INFISICAL_REDIS_PASSWORD`                  | Yes        |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_APP_ID`                 | No         |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_APP_SLUG`               | No         |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_PRIVATE_KEY`            | Yes        |       1 | not specified                     |
| `INFISICAL_SCAN_GIT_WEBHOOK_SECRET`         | Yes        |       1 | not specified                     |
| `INFISICAL_SITE_URL`                        | No         |       2 | multiple defaults (not specified) |
| `INFISICAL_SSH_CA_TTL`                      | No         |       1 | not specified                     |
| `INFI_CLIENT_ID`                            | No         |       1 | not specified                     |
| `INFI_CLIENT_SECRET`                        | Yes        |       1 | not specified                     |
| `INFI_PROJECT_ID`                           | No         |       1 | not specified                     |
| `JWT_EXPIRES_IN`                            | No         |       3 | not specified                     |
| `JWT_EXPIRY`                                | No         |       2 | multiple defaults (not specified) |
| `JWT_REFRESH_EXPIRES_IN`                    | No         |       2 | not specified                     |
| `JWT_REFRESH_EXPIRY`                        | No         |       1 | not specified                     |
| `JWT_REFRESH_SECRET`                        | Yes        |       1 | not specified                     |
| `JWT_SECRET`                                | Yes        |       8 | multiple defaults (prod)          |
| `LETTA_DB_NAME`                             | No         |       1 | not specified                     |
| `LETTA_DB_PASSWORD`                         | Yes        |       1 | not specified                     |
| `LETTA_DB_USER`                             | No         |       1 | not specified                     |
| `LETTA_DEFAULT_EMBEDDING_CONFIG`            | No         |       1 | not specified                     |
| `LETTA_DEFAULT_LLM_CONFIG`                  | No         |       1 | not specified                     |
| `LETTA_HOST`                                | No         |       1 | not specified                     |
| `LETTA_HOST_PORT`                           | No         |       1 | not specified                     |
| `LETTA_IMAGE`                               | No         |       1 | not specified                     |
| `LETTA_PG_URI`                              | No         |       1 | not specified                     |
| `LETTA_PORT`                                | No         |       1 | not specified                     |
| `LETTA_SERVER_PASSWORD`                     | Yes        |       2 | not specified                     |
| `LITELLM_API_KEY`                           | Yes        |       2 | not specified                     |
| `LITELLM_BASE_URL`                          | No         |       4 | multiple defaults (dev)           |
| `LITELLM_DATABASE_URL`                      | No         |       1 | not specified                     |
| `LITELLM_HOST`                              | No         |       1 | not specified                     |
| `LITELLM_LOG`                               | No         |       1 | not specified                     |
| `LITELLM_MASTER_KEY`                        | Yes        |       9 | multiple defaults (not specified) |
| `LITELLM_MODE`                              | No         |       1 | dev                               |
| `LITELLM_PORT`                              | No         |       3 | not specified                     |
| `LOG_DIR`                                   | No         |       1 | not specified                     |
| `LOG_FILE`                                  | No         |       5 | multiple defaults (not specified) |
| `LOG_FILE_PATH`                             | No         |       1 | not specified                     |
| `LOG_FORMAT`                                | No         |       2 | not specified                     |
| `LOG_LEVEL`                                 | No         |      16 | multiple defaults (not specified) |
| `LOKI_HOST`                                 | No         |       1 | not specified                     |
| `LOKI_PORT`                                 | No         |       3 | not specified                     |
| `LOKI_URL`                                  | No         |       1 | not specified                     |
| `MACHINE_HOSTNAME`                          | No         |       1 | not specified                     |
| `MACHINE_IP_ETHERNET`                       | No         |       1 | not specified                     |
| `MACHINE_IP_TAILSCALE`                      | No         |       1 | not specified                     |
| `MACHINE_NAME`                              | No         |       4 | multiple defaults (not specified) |
| `MACHINE_ROLE`                              | No         |       4 | multiple defaults (not specified) |
| `MAGIC_UI_ENABLED`                          | No         |       1 | not specified                     |
| `MAX_CONCURRENT_SCRAPERS`                   | No         |       1 | not specified                     |
| `MAX_CONNECTIONS`                           | No         |       1 | not specified                     |
| `MAX_CONNECTIONS_PER_USER`                  | No         |       1 | not specified                     |
| `MAX_FILE_SIZE`                             | No         |       2 | multiple defaults (not specified) |
| `MAX_RETRY_ATTEMPTS`                        | No         |       2 | not specified                     |
| `MEM0_API_KEY`                              | Yes        |       2 | not specified                     |
| `MEM0_HOST`                                 | No         |       1 | not specified                     |
| `MEM0_HOST_PORT`                            | No         |       1 | not specified                     |
| `MEM0_IMAGE`                                | No         |       1 | dev                               |
| `MEM0_PORT`                                 | No         |       1 | not specified                     |
| `MEMORY_BASE_URL`                           | No         |       1 | not specified                     |
| `MEMPALACE_PORT`                            | No         |       1 | not specified                     |
| `MEMPALACE_URL`                             | No         |       2 | multiple defaults (dev)           |
| `MEMPAL_DIR`                                | No         |       1 | not specified                     |
| `METRICS_PORT`                              | No         |       1 | not specified                     |
| `MFA_ISSUER`                                | No         |       1 | not specified                     |
| `MICROSOFT_CALLBACK_URL`                    | No         |       1 | dev                               |
| `MICROSOFT_CLIENT_ID`                       | No         |       1 | not specified                     |
| `MICROSOFT_CLIENT_SECRET`                   | Yes        |       1 | not specified                     |
| `MODEL_MANAGER_PORT`                        | No         |       1 | not specified                     |
| `MODEL_ROUTING_COST_THRESHOLD`              | No         |       1 | not specified                     |
| `MODEL_ROUTING_FALLBACK_CLOUD`              | No         |       1 | not specified                     |
| `MODEL_ROUTING_PREFER_LOCAL`                | No         |       1 | not specified                     |
| `MODEL_ROUTING_STRATEGY`                    | No         |       1 | not specified                     |
| `MOLTBOT_WEB_PORT`                          | No         |       1 | not specified                     |
| `MONGODB_URI`                               | No         |       1 | dev                               |
| `MONGO_PORT`                                | No         |       1 | not specified                     |
| `MONGO_ROOT_PASSWORD`                       | Yes        |       3 | multiple defaults (not specified) |
| `MONGO_ROOT_USER`                           | No         |       1 | not specified                     |
| `N8N_API_KEY`                               | Yes        |       2 | not specified                     |
| `N8N_BASE_URL`                              | No         |       1 | dev                               |
| `N8N_BASIC_AUTH_ACTIVE`                     | Yes        |       3 | not specified                     |
| `N8N_BASIC_AUTH_PASSWORD`                   | Yes        |       3 | multiple defaults (not specified) |
| `N8N_BASIC_AUTH_USER`                       | Yes        |       3 | not specified                     |
| `N8N_DB`                                    | No         |       1 | not specified                     |
| `N8N_EDITOR_BASE_URL`                       | No         |       1 | dev                               |
| `N8N_ENCRYPTION_KEY`                        | Yes        |       6 | multiple defaults (not specified) |
| `N8N_HOST`                                  | No         |       4 | multiple defaults (dev)           |
| `N8N_PORT`                                  | No         |       4 | not specified                     |
| `N8N_PROTOCOL`                              | No         |       3 | multiple defaults (not specified) |
| `N8N_SKIP_WEBHOOK_DNS_CHECK`                | Yes        |       2 | not specified                     |
| `N8N_WEBHOOK_URL`                           | Yes        |       2 | multiple defaults (dev)           |
| `NEXT_PUBLIC_ACTIVEPIECES_URL`              | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_API_BASE_URL`                  | No         |       2 | multiple defaults (dev)           |
| `NEXT_PUBLIC_API_KEY`                       | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_APP_NAME`                      | No         |       1 | not specified                     |
| `NEXT_PUBLIC_APP_URL`                       | No         |       2 | multiple defaults (dev)           |
| `NEXT_PUBLIC_ARCHON_UI_URL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`         | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_DEBUG`                         | No         |       1 | not specified                     |
| `NEXT_PUBLIC_DIFY_APP_ID`                   | No         |       2 | dev                               |
| `NEXT_PUBLIC_DIFY_WIDGET_URL`               | No         |       2 | dev                               |
| `NEXT_PUBLIC_DOCS_BASE_URL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_GRAFANA_URL`                   | No         |       1 | not specified                     |
| `NEXT_PUBLIC_MEM0_PROXY_URL`                | No         |       1 | not specified                     |
| `NEXT_PUBLIC_N8N_URL`                       | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_NEXUS_UI_URL`                  | No         |       1 | not specified                     |
| `NEXT_PUBLIC_NEXUS_URL`                     | No         |       4 | multiple defaults (dev)           |
| `NEXT_PUBLIC_OPENCLAW_URL`                  | No         |       2 | multiple defaults (not specified) |
| `NEXT_PUBLIC_OPENMEMORY_URL`                | No         |       1 | not specified                     |
| `NEXT_PUBLIC_PAPERCLIP_URL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_PORTAINER_URL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_QUOTE_API_URL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_SITE_NAME`                     | No         |       2 | not specified                     |
| `NEXT_PUBLIC_SITE_URL`                      | No         |       3 | multiple defaults (dev)           |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_SUPABASE_URL`                  | No         |       1 | not specified                     |
| `NEXT_PUBLIC_SUPPORT_EMAIL`                 | No         |       1 | not specified                     |
| `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL`       | No         |       1 | not specified                     |
| `NEXT_PUBLIC_TWENTY_URL`                    | No         |       3 | multiple defaults (dev)           |
| `NEXT_PUBLIC_WEBAPP_URL`                    | No         |       1 | not specified                     |
| `NEXT_PUBLIC_WEBHOOK_URL`                   | Yes        |       1 | not specified                     |
| `NEXT_PUBLIC_WS_URL`                        | No         |       1 | dev                               |
| `NEXUS_ADMIN_TOKEN`                         | Yes        |       3 | multiple defaults (not specified) |
| `NEXUS_API_KEY`                             | Yes        |       1 | not specified                     |
| `NEXUS_BASE_URL`                            | No         |       1 | not specified                     |
| `NEXUS_CONFIG_APPLY_ENABLED`                | No         |       1 | not specified                     |
| `NEXUS_CPU_LIMIT`                           | No         |       1 | not specified                     |
| `NEXUS_DEPLOY_TARGET`                       | No         |       1 | not specified                     |
| `NEXUS_JWT_SECRET`                          | Yes        |       1 | not specified                     |
| `NEXUS_MCP_PORT`                            | No         |       1 | not specified                     |
| `NEXUS_MCP_URL`                             | No         |       1 | not specified                     |
| `NEXUS_MEMORY_LIMIT`                        | No         |       2 | multiple defaults (not specified) |
| `NEXUS_METRICS_PORT`                        | No         |       1 | not specified                     |
| `NEXUS_MONITORING_ENABLED`                  | No         |       1 | not specified                     |
| `NEXUS_ROUTER_API_KEY`                      | Yes        |       1 | not specified                     |
| `NEXUS_ROUTER_HOST`                         | No         |       1 | not specified                     |
| `NEXUS_ROUTER_MCP_PORT`                     | No         |       1 | not specified                     |
| `NEXUS_ROUTER_PORT`                         | No         |       3 | multiple defaults (not specified) |
| `NEXUS_ROUTER_URL`                          | No         |       6 | multiple defaults (dev)           |
| `NEXUS_STATUS_URL`                          | No         |       1 | not specified                     |
| `NEXUS_UI_SETTINGS_PATH`                    | No         |       1 | not specified                     |
| `NODE_ENV`                                  | No         |      24 | multiple defaults (dev, prod)     |
| `NODE_VERSION`                              | No         |       1 | not specified                     |
| `NVIDIA_VISIBLE_DEVICES`                    | No         |       6 | multiple defaults (not specified) |
| `NYRA_CHAT_INTERNAL_API_BASE_URL`           | No         |       1 | not specified                     |
| `NYRA_CHAT_INTERNAL_PROXY_TOKEN`            | Yes        |       3 | not specified                     |
| `NYRA_ENABLE_MOCKS`                         | No         |       1 | not specified                     |
| `NYRA_ENV`                                  | No         |       1 | dev                               |
| `NYRA_ENVIRONMENT`                          | No         |       2 | multiple defaults (dev, prod)     |
| `NYRA_FORCE_SECRETS`                        | Yes        |       2 | not specified                     |
| `NYRA_HTTP_ALLOWLIST`                       | No         |       1 | not specified                     |
| `NYRA_KYUTAI_DECODE_IMAGE`                  | No         |       1 | dev                               |
| `NYRA_KYUTAI_STT_IMAGE`                     | No         |       1 | dev                               |
| `NYRA_KYUTAI_TTS_IMAGE`                     | No         |       1 | dev                               |
| `NYRA_KYUTAI_VAD_IMAGE`                     | No         |       1 | dev                               |
| `NYRA_MACHINE`                              | No         |       2 | not specified                     |
| `NYRA_MCP_PORT`                             | No         |       1 | not specified                     |
| `NYRA_NETWORK`                              | No         |       3 | not specified                     |
| `NYRA_NETWORK_NAME`                         | No         |       2 | not specified                     |
| `NYRA_NODE_ID`                              | No         |       2 | multiple defaults (not specified) |
| `NYRA_NODE_TYPE`                            | No         |       2 | not specified                     |
| `NYRA_VOICE_COORDINATOR_IMAGE`              | No         |       1 | dev                               |
| `NYRA_VOICE_EDGE_IMAGE`                     | No         |       1 | dev                               |
| `NYRA_VOICE_EGRESS_IMAGE`                   | No         |       1 | dev                               |
| `NYRA_VOICE_LLM_BRIDGE_IMAGE`               | No         |       1 | dev                               |
| `NYRA_WEBHOOK_SECRET`                       | Yes        |       1 | not specified                     |
| `OCR_CONFIDENCE_THRESHOLD`                  | No         |       1 | not specified                     |
| `OCR_ENABLED`                               | No         |       1 | not specified                     |
| `OCR_LANGUAGE`                              | No         |       1 | not specified                     |
| `OLLAMA_ENABLED`                            | No         |       1 | not specified                     |
| `OLLAMA_HOST`                               | No         |       4 | not specified                     |
| `OLLAMA_KEEP_ALIVE`                         | No         |       1 | not specified                     |
| `OLLAMA_MAX_LOADED_MODELS`                  | No         |       1 | not specified                     |
| `OLLAMA_MAX_VRAM`                           | No         |       1 | not specified                     |
| `OLLAMA_MODELS`                             | No         |       1 | not specified                     |
| `OLLAMA_NUM_PARALLEL`                       | No         |       1 | not specified                     |
| `OLLAMA_PORT`                               | No         |       3 | not specified                     |
| `OPENAI_API_KEY`                            | Yes        |      10 | multiple defaults (not specified) |
| `OPENAI_BASE_URL`                           | No         |       3 | multiple defaults (not specified) |
| `OPENAI_MAX_TOKENS`                         | Yes        |       1 | not specified                     |
| `OPENAI_MODEL`                              | No         |       1 | not specified                     |
| `OPENAI_ORG_ID`                             | No         |       1 | not specified                     |
| `OPENCLAW_CHAT_PATH`                        | No         |       3 | not specified                     |
| `OPENCLAW_COMPOSE_VALIDATE`                 | No         |       1 | not specified                     |
| `OPENCLAW_CONFIG_PATH`                      | No         |       1 | not specified                     |
| `OPENCLAW_DATA_DIR`                         | No         |       1 | not specified                     |
| `OPENCLAW_DEFAULT_MODEL`                    | No         |       3 | multiple defaults (dev)           |
| `OPENCLAW_DOCKER_APT_PACKAGES`              | No         |       2 | multiple defaults (not specified) |
| `OPENCLAW_FORCE_BUILD`                      | No         |       1 | not specified                     |
| `OPENCLAW_GATEWAY_PORT`                     | No         |       1 | not specified                     |
| `OPENCLAW_GATEWAY_TOKEN`                    | Yes        |       6 | not specified                     |
| `OPENCLAW_HEALTH_TIMEOUT_S`                 | No         |       1 | not specified                     |
| `OPENCLAW_HOME_VOLUME`                      | No         |       1 | not specified                     |
| `OPENCLAW_HTTP_ALLOWLIST`                   | No         |       1 | not specified                     |
| `OPENCLAW_INSTALL_BROWSER`                  | No         |       2 | multiple defaults (not specified) |
| `OPENCLAW_MVP_IMAGE`                        | No         |       2 | dev                               |
| `OPENCLAW_MVP_PORT`                         | No         |       1 | not specified                     |
| `OPENCLAW_OPENAI_BASE_URL`                  | No         |       1 | not specified                     |
| `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST`          | No         |       1 | not specified                     |
| `OPENCLAW_PORT`                             | No         |       1 | not specified                     |
| `OPENCLAW_PORTS`                            | No         |       1 | not specified                     |
| `OPENCLAW_PROVIDER`                         | No         |       1 | not specified                     |
| `OPENCLAW_PUBLIC_BASE_URL`                  | No         |       5 | multiple defaults (dev)           |
| `OPENCLAW_SANDBOX_ENABLED`                  | No         |       2 | not specified                     |
| `OPENCLAW_SECRET_REF_MODE`                  | Yes        |       1 | not specified                     |
| `OPENCLAW_SESSION_PATH`                     | No         |       1 | not specified                     |
| `OPENCLAW_TOOLS_ALLOW`                      | No         |       1 | not specified                     |
| `OPENCLAW_TOOLS_DENY`                       | No         |       1 | not specified                     |
| `OPENCLAW_TOOL_POLICY`                      | No         |       2 | not specified                     |
| `OPENCLAW_UI_PREFIX`                        | No         |       1 | not specified                     |
| `OPENCLAW_UI_PROXY_PORT`                    | No         |       1 | not specified                     |
| `OPENCLAW_WEBHOOK_INGRESS_PATH`             | Yes        |       1 | not specified                     |
| `OPENCLAW_WORKSPACE_VOLUME`                 | No         |       1 | not specified                     |
| `OPENLIT_ALLOWED_CORS_ORIGINS`              | No         |       1 | not specified                     |
| `OPENLIT_CLICKHOUSE_HTTP_PORT`              | No         |       1 | not specified                     |
| `OPENLIT_CLICKHOUSE_NATIVE_PORT`            | No         |       1 | not specified                     |
| `OPENLIT_DB_NAME`                           | No         |       1 | not specified                     |
| `OPENLIT_DB_PASSWORD`                       | Yes        |       1 | not specified                     |
| `OPENLIT_DB_USER`                           | No         |       1 | not specified                     |
| `OPENLIT_GITHUB_CLIENT_ID`                  | No         |       1 | not specified                     |
| `OPENLIT_GITHUB_CLIENT_SECRET`              | Yes        |       1 | not specified                     |
| `OPENLIT_GOOGLE_CLIENT_ID`                  | No         |       1 | not specified                     |
| `OPENLIT_GOOGLE_CLIENT_SECRET`              | Yes        |       1 | not specified                     |
| `OPENLIT_HOST_PORT`                         | No         |       1 | not specified                     |
| `OPENLIT_NEXTAUTH_SECRET`                   | Yes        |       1 | not specified                     |
| `OPENLIT_NEXTAUTH_URL`                      | Yes        |       1 | not specified                     |
| `OPENLIT_OTLP_GRPC_PORT`                    | No         |       1 | not specified                     |
| `OPENLIT_OTLP_HTTP_PORT`                    | No         |       1 | not specified                     |
| `OPENLIT_TELEMETRY_ENABLED`                 | No         |       1 | not specified                     |
| `OPENLIT_VAULT_ENCRYPTION_KEY`              | Yes        |       1 | not specified                     |
| `OPENROUTER_API_KEY`                        | Yes        |       7 | multiple defaults (not specified) |
| `OPENROUTER_BASE_URL`                       | No         |       2 | not specified                     |
| `OPENROUTER_FALLBACK_MODEL`                 | No         |       1 | not specified                     |
| `OPENWEBUI_PORT`                            | No         |       1 | not specified                     |
| `OPENWEBUI_SECRET_KEY`                      | Yes        |       1 | not specified                     |
| `ORACLE_TAILSCALE_IP`                       | No         |       1 | not specified                     |
| `ORACLE_TUNNEL_TOKEN`                       | Yes        |       1 | not specified                     |
| `ORCHESTRATOR_TAILSCALE_IP`                 | No         |       3 | not specified                     |
| `ORCHESTRATOR_URL`                          | No         |       2 | multiple defaults (dev)           |
| `PAGERDUTY_INTEGRATION_KEY`                 | Yes        |       1 | not specified                     |
| `PAPERCLIP_AUTH_DISABLE_SIGN_UP`            | Yes        |       1 | not specified                     |
| `PAPERCLIP_DB_NAME`                         | No         |       1 | not specified                     |
| `PAPERCLIP_DB_PASSWORD`                     | Yes        |       1 | not specified                     |
| `PAPERCLIP_DB_USER`                         | No         |       1 | not specified                     |
| `PAPERCLIP_HOST_PORT`                       | No         |       1 | not specified                     |
| `PAPERCLIP_IMAGE`                           | No         |       1 | not specified                     |
| `PAPERCLIP_PUBLIC_URL`                      | No         |       1 | not specified                     |
| `PAPERCLIP_SESSION_SECRET`                  | Yes        |       1 | not specified                     |
| `PASSWORD_RESET_EXPIRY`                     | Yes        |       1 | not specified                     |
| `PERF_MONITOR_PORT`                         | No         |       1 | not specified                     |
| `PG_DATABASE_URL`                           | No         |       1 | not specified                     |
| `PKI_ENABLED`                               | No         |       1 | not specified                     |
| `PORT`                                      | No         |      18 | multiple defaults (dev)           |
| `PORTAINER_ADMIN_PASSWORD`                  | Yes        |       1 | not specified                     |
| `PORTAINER_ADMIN_USERNAME`                  | No         |       1 | not specified                     |
| `PORTAINER_AGENT_PORT`                      | No         |       1 | not specified                     |
| `PORTAINER_AGENT_TAGS`                      | No         |       1 | not specified                     |
| `PORTAINER_EDGE_ID`                         | No         |       4 | multiple defaults (not specified) |
| `PORTAINER_EDGE_INSECURE_POLL`              | No         |       2 | not specified                     |
| `PORTAINER_EDGE_KEY`                        | Yes        |       5 | not specified                     |
| `PORTAINER_HTTP_PORT`                       | No         |       1 | not specified                     |
| `PORTAINER_ORCHESTRATOR_URL`                | No         |       1 | not specified                     |
| `PORTAINER_PORT`                            | No         |       1 | not specified                     |
| `PORTAINER_PUBLIC_URL`                      | No         |       1 | not specified                     |
| `POSTGRES_CPU_LIMIT`                        | No         |       1 | not specified                     |
| `POSTGRES_DB`                               | No         |       7 | multiple defaults (not specified) |
| `POSTGRES_HOST`                             | No         |       2 | multiple defaults (dev)           |
| `POSTGRES_MEMORY_LIMIT`                     | No         |       2 | multiple defaults (not specified) |
| `POSTGRES_PASSWORD`                         | Yes        |       8 | multiple defaults (not specified) |
| `POSTGRES_PORT`                             | No         |       4 | not specified                     |
| `POSTGRES_URL`                              | No         |       4 | multiple defaults (dev)           |
| `POSTGRES_USER`                             | No         |       7 | multiple defaults (not specified) |
| `PRIMARY_MODELS`                            | No         |       1 | not specified                     |
| `PROFILING_ENABLED`                         | No         |       2 | not specified                     |
| `PROMETHEUS_HOST`                           | No         |       1 | not specified                     |
| `PROMETHEUS_PORT`                           | No         |       3 | not specified                     |
| `PROMETHEUS_PUSH_GATEWAY`                   | No         |       1 | not specified                     |
| `QDRANT_API_KEY`                            | Yes        |       1 | not specified                     |
| `QDRANT_MAX_SEARCH_THREADS`                 | No         |       1 | not specified                     |
| `QUERY_TIMEOUT`                             | No         |       1 | not specified                     |
| `QUOTE_API_PORT`                            | No         |       2 | not specified                     |
| `QUOTE_API_SECRET`                          | Yes        |       3 | multiple defaults (not specified) |
| `QUOTE_API_URL`                             | No         |       1 | not specified                     |
| `QUOTE_ENGINE_HOST`                         | No         |       2 | not specified                     |
| `QUOTE_ENGINE_PORT`                         | No         |       2 | not specified                     |
| `QUOTE_ENGINE_URL`                          | No         |       2 | multiple defaults (dev)           |
| `RATE_CACHE_KEY_PREFIX`                     | Yes        |       1 | not specified                     |
| `RATE_LIMIT_DURATION`                       | No         |       1 | not specified                     |
| `RATE_LIMIT_MAX_REQUESTS`                   | No         |       5 | not specified                     |
| `RATE_LIMIT_POINTS`                         | No         |       1 | not specified                     |
| `RATE_LIMIT_REQUESTS`                       | No         |       1 | not specified                     |
| `RATE_LIMIT_WINDOW`                         | No         |       1 | not specified                     |
| `RATE_LIMIT_WINDOW_MS`                      | No         |       5 | multiple defaults (not specified) |
| `REDIS_CPU_LIMIT`                           | No         |       1 | not specified                     |
| `REDIS_DB`                                  | No         |       5 | not specified                     |
| `REDIS_ENABLED`                             | No         |       1 | not specified                     |
| `REDIS_HOST`                                | No         |       7 | multiple defaults (dev)           |
| `REDIS_MEMORY_LIMIT`                        | No         |       2 | multiple defaults (not specified) |
| `REDIS_PASSWORD`                            | Yes        |       9 | multiple defaults (not specified) |
| `REDIS_PORT`                                | No         |       7 | not specified                     |
| `REDIS_URL`                                 | No         |       5 | multiple defaults (dev)           |
| `RETRY_DELAY_MS`                            | No         |       2 | not specified                     |
| `REVIEW_LABEL`                              | No         |       2 | not specified                     |
| `REVIEW_MAX_CHARS`                          | No         |       2 | not specified                     |
| `REVIEW_MODEL`                              | No         |       2 | not specified                     |
| `REVIEW_POST_AS_REVIEW`                     | No         |       2 | not specified                     |
| `RTX3090TI_LAN_IP`                          | No         |       1 | not specified                     |
| `RTX5090_LAN_IP`                            | No         |       1 | not specified                     |
| `RUVECTOR_HOST`                             | No         |       1 | not specified                     |
| `RUVECTOR_PGADMIN_PORT`                     | No         |       1 | not specified                     |
| `RUVECTOR_PORT`                             | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_DB`                      | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_PASSWORD`                | Yes        |       2 | multiple defaults (not specified) |
| `RUVECTOR_POSTGRES_PORT`                    | No         |       1 | not specified                     |
| `RUVECTOR_POSTGRES_USER`                    | No         |       1 | not specified                     |
| `S3_BUCKET`                                 | No         |       1 | not specified                     |
| `S3_ENDPOINT`                               | No         |       1 | not specified                     |
| `SCORING_ENABLED`                           | No         |       1 | not specified                     |
| `SCORING_MAX_SCORE`                         | No         |       1 | not specified                     |
| `SCORING_MIN_SCORE`                         | No         |       1 | not specified                     |
| `SCRAPER_INTERVAL_MINUTES`                  | No         |       1 | not specified                     |
| `SCRAPER_TIMEOUT_MS`                        | No         |       1 | not specified                     |
| `SEARXNG_BASE_URL`                          | No         |       1 | not specified                     |
| `SEARXNG_HOST_PORT`                         | No         |       1 | not specified                     |
| `SEARXNG_SECRET`                            | Yes        |       1 | not specified                     |
| `SEARXNG_UWSGI_THREADS`                     | No         |       1 | not specified                     |
| `SEARXNG_UWSGI_WORKERS`                     | No         |       1 | not specified                     |
| `SECRET_SCANNING_ENABLED`                   | Yes        |       1 | not specified                     |
| `SECURITY_SERVICE_PORT`                     | No         |       1 | not specified                     |
| `SENDGRID_API_KEY`                          | Yes        |       1 | not specified                     |
| `SERVER_URL`                                | No         |       1 | not specified                     |
| `SERVICES`                                  | No         |       1 | not specified                     |
| `SESSION_TIMEOUT`                           | No         |       1 | not specified                     |
| `SHADCN_REGISTRY_URL`                       | No         |       1 | not specified                     |
| `SHARED_SCHEMA_VERSION`                     | No         |       1 | not specified                     |
| `SIGN_IN_PREFILLED`                         | No         |       1 | not specified                     |
| `SLACK_WEBHOOK_URL`                         | Yes        |       1 | not specified                     |
| `SMTP_FROM`                                 | No         |       1 | not specified                     |
| `SMTP_FROM_NAME`                            | No         |       1 | not specified                     |
| `SMTP_HOST`                                 | No         |       4 | not specified                     |
| `SMTP_PASSWORD`                             | Yes        |       4 | multiple defaults (not specified) |
| `SMTP_PORT`                                 | No         |       4 | not specified                     |
| `SMTP_SECURE`                               | No         |       2 | not specified                     |
| `SMTP_USER`                                 | No         |       3 | multiple defaults (not specified) |
| `SMTP_USERNAME`                             | No         |       1 | not specified                     |
| `SPECIALIZATION`                            | No         |       1 | not specified                     |
| `SSH_CA_ENABLED`                            | No         |       1 | not specified                     |
| `SSL_ENABLED`                               | No         |       1 | not specified                     |
| `STOP_ENFORCEMENT_ENABLED`                  | No         |       1 | not specified                     |
| `STORAGE_TYPE`                              | No         |       1 | dev                               |
| `STT_PRECISION`                             | No         |       1 | not specified                     |
| `SUPABASE_ANON_KEY`                         | Yes        |       1 | not specified                     |
| `SUPABASE_JWT_SECRET`                       | Yes        |       1 | not specified                     |
| `SUPABASE_SERVICE_KEY`                      | Yes        |       1 | not specified                     |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Yes        |       1 | not specified                     |
| `SUPABASE_URL`                              | No         |       1 | not specified                     |
| `SYNC_BATCH_SIZE`                           | No         |       2 | not specified                     |
| `SYNC_INTERVAL_MINUTES`                     | No         |       2 | not specified                     |
| `TAILSCALE_AUTHKEY`                         | Yes        |       4 | not specified                     |
| `TAILSCALE_ENABLED`                         | No         |       2 | multiple defaults (not specified) |
| `TAILSCALE_HOSTNAME`                        | No         |       1 | not specified                     |
| `TAILSCALE_IP`                              | No         |       4 | multiple defaults (not specified) |
| `TAILSCALE_KEY`                             | Yes        |       1 | not specified                     |
| `TAILSCALE_TAILNET`                         | No         |       1 | not specified                     |
| `TELEGRAM_BOT_TOKEN`                        | Yes        |       2 | not specified                     |
| `TELEMETRY_ENABLED`                         | No         |       1 | not specified                     |
| `TENANT_ENGINEERING_KEY`                    | Yes        |       1 | not specified                     |
| `TENANT_PRODUCTION_KEY`                     | Yes        |       1 | prod                              |
| `TENANT_RESEARCH_KEY`                       | Yes        |       1 | not specified                     |
| `TEST_DATABASE_URL`                         | No         |       1 | not specified                     |
| `THUMBNAIL_QUALITY`                         | No         |       1 | not specified                     |
| `THUMBNAIL_SIZE`                            | No         |       1 | not specified                     |
| `TTS_PRECISION`                             | No         |       1 | not specified                     |
| `TWEAKCN_PRESET`                            | No         |       1 | not specified                     |
| `TWENTYCRM_API_KEY`                         | Yes        |       4 | multiple defaults (not specified) |
| `TWENTYCRM_API_URL`                         | No         |       2 | not specified                     |
| `TWENTYCRM_MCP_PORT`                        | No         |       2 | not specified                     |
| `TWENTYCRM_PORT`                            | No         |       1 | not specified                     |
| `TWENTYCRM_WEBHOOK_SECRET`                  | Yes        |       2 | not specified                     |
| `TWENTY_ACCESS_TOKEN_SECRET`                | Yes        |       1 | not specified                     |
| `TWENTY_API_KEY`                            | Yes        |       2 | not specified                     |
| `TWENTY_API_URL`                            | No         |       1 | dev                               |
| `TWENTY_APP_SECRET`                         | Yes        |       2 | multiple defaults (not specified) |
| `TWENTY_CRM_API_KEY`                        | Yes        |       3 | multiple defaults (not specified) |
| `TWENTY_CRM_API_URL`                        | No         |       1 | not specified                     |
| `TWENTY_CRM_SYNC_ENABLED`                   | No         |       1 | not specified                     |
| `TWENTY_CRM_SYNC_INTERVAL`                  | No         |       1 | not specified                     |
| `TWENTY_CRM_URL`                            | No         |       1 | not specified                     |
| `TWENTY_CRM_WORKSPACE_ID`                   | No         |       2 | multiple defaults (not specified) |
| `TWENTY_DATABASE_URL`                       | No         |       1 | not specified                     |
| `TWENTY_DB_PASSWORD`                        | Yes        |       1 | not specified                     |
| `TWENTY_ENCRYPTION_SECRET`                  | Yes        |       3 | multiple defaults (not specified) |
| `TWENTY_FILE_TOKEN_SECRET`                  | Yes        |       1 | not specified                     |
| `TWENTY_FRONTEND_URL`                       | No         |       2 | multiple defaults (not specified) |
| `TWENTY_FRONT_BASE_URL`                     | No         |       1 | dev                               |
| `TWENTY_HOST`                               | No         |       1 | not specified                     |
| `TWENTY_JWT_SECRET`                         | Yes        |       3 | multiple defaults (not specified) |
| `TWENTY_LOGIN_TOKEN_SECRET`                 | Yes        |       1 | not specified                     |
| `TWENTY_PASSWORD_SALT`                      | Yes        |       3 | multiple defaults (not specified) |
| `TWENTY_PG_DATABASE_URL`                    | No         |       2 | not specified                     |
| `TWENTY_PORT`                               | No         |       1 | not specified                     |
| `TWENTY_POSTGRES_DB`                        | No         |       1 | not specified                     |
| `TWENTY_POSTGRES_PASSWORD`                  | Yes        |       1 | not specified                     |
| `TWENTY_POSTGRES_USER`                      | No         |       1 | not specified                     |
| `TWENTY_REDIS_PASSWORD`                     | Yes        |       1 | not specified                     |
| `TWENTY_REDIS_URL`                          | No         |       2 | not specified                     |
| `TWENTY_REFRESH_TOKEN_SECRET`               | Yes        |       1 | not specified                     |
| `TWENTY_SERVER_URL`                         | No         |       3 | multiple defaults (dev)           |
| `TWENTY_WEBHOOK_SECRET`                     | Yes        |       1 | not specified                     |
| `TWILIO_ACCOUNT_SID`                        | No         |       2 | not specified                     |
| `TWILIO_AUTH_TOKEN`                         | Yes        |       2 | not specified                     |
| `TWILIO_FROM_NUMBER`                        | No         |       1 | not specified                     |
| `TWILIO_PHONE_NUMBER`                       | No         |       1 | not specified                     |
| `TZ`                                        | No         |       2 | not specified                     |
| `UNMUTE_ASSISTANT_GATEWAY_URL`              | No         |       1 | not specified                     |
| `UNMUTE_CACHE_VOLUME`                       | No         |       1 | not specified                     |
| `UNMUTE_HOST_PORT`                          | No         |       3 | multiple defaults (not specified) |
| `UNMUTE_IMAGE`                              | No         |       3 | not specified                     |
| `UNMUTE_LLM_BASE_URL`                       | No         |       1 | not specified                     |
| `UNMUTE_MODEL_PROVIDER`                     | No         |       2 | not specified                     |
| `UNMUTE_MODEL_VOLUME`                       | No         |       1 | not specified                     |
| `UNMUTE_OPENAI_API_KEY`                     | Yes        |       2 | not specified                     |
| `UNMUTE_PUBLIC_BASE_URL`                    | No         |       2 | dev                               |
| `UPLOAD_DIR`                                | No         |       1 | not specified                     |
| `VLLM_HOST`                                 | No         |       2 | not specified                     |
| `VLLM_MODEL`                                | No         |       4 | multiple defaults (not specified) |
| `VLLM_PORT`                                 | No         |       4 | multiple defaults (not specified) |
| `VOICE_PTP_INTERFACE`                       | No         |       1 | not specified                     |
| `VOICE_RTP_PORT_RANGE`                      | No         |       1 | not specified                     |
| `VRAM_GB`                                   | No         |       1 | not specified                     |
| `WEBHOOK_RETRY_ATTEMPTS`                    | Yes        |       1 | not specified                     |
| `WEBHOOK_RETRY_DELAY`                       | Yes        |       1 | not specified                     |
| `WEBHOOK_TIMEOUT`                           | Yes        |       1 | not specified                     |
| `WEBHOOK_URL`                               | Yes        |       3 | multiple defaults (dev)           |
| `WHATSAPP_PHONE_NUMBER`                     | No         |       1 | not specified                     |
| `WORKER_3060_API_KEY`                       | Yes        |       1 | not specified                     |
| `WORKER_3060_MODELS`                        | No         |       2 | multiple defaults (not specified) |
| `WORKER_3060_OLLAMA_PORT`                   | No         |       1 | not specified                     |
| `WORKER_3060_URL`                           | No         |       2 | multiple defaults (not specified) |
| `WORKER_3090TI_MODEL`                       | No         |       1 | not specified                     |
| `WORKER_3090TI_VLLM_PORT`                   | No         |       1 | not specified                     |
| `WORKER_3090_API_KEY`                       | Yes        |       1 | not specified                     |
| `WORKER_3090_MODELS`                        | No         |       2 | not specified                     |
| `WORKER_3090_URL`                           | No         |       2 | multiple defaults (not specified) |
| `WORKER_5090_API_KEY`                       | Yes        |       1 | not specified                     |
| `WORKER_5090_MODEL`                         | No         |       1 | not specified                     |
| `WORKER_5090_MODELS`                        | No         |       2 | not specified                     |
| `WORKER_5090_URL`                           | No         |       2 | multiple defaults (not specified) |
| `WORKER_5090_VLLM_PORT`                     | No         |       1 | not specified                     |
| `WORKER_ID`                                 | No         |       1 | not specified                     |
| `WORKER_ROLE`                               | No         |       1 | not specified                     |

## Host-specific secret/env lists

### orchestrator

- `ACTIVEPIECES_API_KEY` (secret)
- `ACTIVEPIECES_API_URL`
- `ACTIVEPIECES_BASE_URL`
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_HOST`
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `ACTIVEPIECES_WEBHOOK_SECRET` (secret)
- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_IDENTITY_ID`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_ORG_ID`
- `AGENT_VAULT_TRUSTED_PROXIES`
- `AGENT_VAULT_UA_CLIENT_ID`
- `AGENT_VAULT_UA_CLIENT_SECRET` (secret)
- `ALERTMANAGER_HOST`
- `ALERTMANAGER_PORT`
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
- `API_RATE_LIMITING_REQUEST_COUNT`
- `API_RATE_LIMITING_TTL`
- `API_RATE_LIMIT_MAX_REQUESTS`
- `API_RATE_LIMIT_WINDOW_MS`
- `API_VERSION`
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
- `CF_TUNNEL_TOKEN` (secret)
- `CHECK_INTERVAL`
- `CLAUDE_FLOW_CONFIG_PATH`
- `CLAUDE_FLOW_HOST`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_PORT`
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
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
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `COMPOSIO_DEFAULT_USER_ID`
- `COMPOSIO_EXECUTION_POLICY`
- `COMPOSIO_MCP_SERVER_ID`
- `COMPOSIO_MCP_SERVER_NAME`
- `COMPOSIO_MCP_TRANSPORT`
- `COMPOSIO_MCP_URL`
- `COMPOSIO_TOOLKITS_ALLOW`
- `CONFIG_DIR`
- `CONFLICT_STRATEGY`
- `CONNECTION_TIMEOUT`
- `CONSENT_REQUIRED`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ORIGIN`
- `CRM_API_KEY` (secret)
- `CRM_API_URL`
- `CUDA_VISIBLE_DEVICES`
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
- `DISCORD_BOT_TOKEN` (secret)
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
- `EMAIL_DRIVER`
- `EMAIL_FROM`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_HOST`
- `EMAIL_PASSWORD` (secret)
- `EMAIL_PORT`
- `EMAIL_SECURE`
- `EMAIL_SYSTEM_ADDRESS`
- `EMAIL_USER`
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
- `FALKORDB_CACHE_SIZE_MB`
- `FALKORDB_HOST`
- `FALKORDB_PASSWORD` (secret)
- `FALKORDB_PORT`
- `FALKORDB_QUERY_MEM_CAPACITY`
- `FALKORDB_THREADS`
- `FALKORDB_TIMEOUT_DEFAULT_MS`
- `FALKORDB_TIMEOUT_MAX_MS`
- `FALKORDB_URL`
- `FRONTEND_URL`
- `GEMINI_API_KEY` (secret)
- `GEMINI_BASE_URL`
- `GEMINI_MAX_TOKENS` (secret)
- `GEMINI_MODEL`
- `GITEA_ACTIONS_ENABLED`
- `GITEA_ADMIN_EMAIL`
- `GITEA_ADMIN_PASSWORD` (secret)
- `GITEA_ADMIN_USER`
- `GITEA_DB_HOST`
- `GITEA_DB_NAME`
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
- `GRAFANA_CPU_LIMIT`
- `GRAFANA_HOST`
- `GRAFANA_MEMORY_LIMIT`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `GRAFANA_URL`
- `GROQ_API_KEY` (secret)
- `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION`
- `HAMCP_ENABLE_FILESYSTEM_TOOLS`
- `HEALTH_CHECK_INTERVAL`
- `HEALTH_CHECK_INTERVAL_MINUTES`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `HOT_RELOAD_ENABLED`
- `INFISICAL_API_URL`
- `INFISICAL_AUDIT_RETENTION`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_CLIENT_ID`
- `INFISICAL_CLIENT_SECRET` (secret)
- `INFISICAL_DB_NAME`
- `INFISICAL_DB_PASSWORD` (secret)
- `INFISICAL_DB_USER`
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `INFISICAL_ENV`
- `INFISICAL_ENVIRONMENT`
- `INFISICAL_GATEWAY_CLIENT_ID`
- `INFISICAL_GATEWAY_CLIENT_SECRET` (secret)
- `INFISICAL_LICENSE_KEY` (secret)
- `INFISICAL_PATH`
- `INFISICAL_PKI_KEY_ALGO` (secret)
- `INFISICAL_POLL_INTERVAL`
- `INFISICAL_PORT`
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_REDIS_PASSWORD` (secret)
- `INFISICAL_SCAN_GIT_APP_ID`
- `INFISICAL_SCAN_GIT_APP_SLUG`
- `INFISICAL_SCAN_GIT_PRIVATE_KEY` (secret)
- `INFISICAL_SCAN_GIT_WEBHOOK_SECRET` (secret)
- `INFISICAL_SITE_URL`
- `INFISICAL_SSH_CA_TTL`
- `INFI_CLIENT_ID`
- `INFI_CLIENT_SECRET` (secret)
- `INFI_PROJECT_ID`
- `JWT_EXPIRES_IN`
- `JWT_EXPIRY`
- `JWT_REFRESH_EXPIRES_IN`
- `JWT_REFRESH_EXPIRY`
- `JWT_REFRESH_SECRET` (secret)
- `JWT_SECRET` (secret)
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
- `LITELLM_API_KEY` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_HOST`
- `LITELLM_LOG`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_MODE`
- `LITELLM_PORT`
- `LOG_DIR`
- `LOG_FILE`
- `LOG_FILE_PATH`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOKI_HOST`
- `LOKI_PORT`
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
- `MEM0_API_KEY` (secret)
- `MEM0_HOST`
- `MEM0_HOST_PORT`
- `MEM0_IMAGE`
- `MEM0_PORT`
- `MEMORY_BASE_URL`
- `MEMPALACE_PORT`
- `MEMPALACE_URL`
- `MEMPAL_DIR`
- `METRICS_PORT`
- `MFA_ISSUER`
- `MICROSOFT_CALLBACK_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET` (secret)
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
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK` (secret)
- `N8N_WEBHOOK_URL` (secret)
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
- `NEXT_PUBLIC_PAPERCLIP_URL`
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
- `NEXUS_API_KEY` (secret)
- `NEXUS_BASE_URL`
- `NEXUS_CONFIG_APPLY_ENABLED`
- `NEXUS_CPU_LIMIT`
- `NEXUS_DEPLOY_TARGET`
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_MCP_PORT`
- `NEXUS_MCP_URL`
- `NEXUS_MEMORY_LIMIT`
- `NEXUS_METRICS_PORT`
- `NEXUS_MONITORING_ENABLED`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_MCP_PORT`
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_URL`
- `NEXUS_STATUS_URL`
- `NEXUS_UI_SETTINGS_PATH`
- `NODE_ENV`
- `NODE_VERSION`
- `NVIDIA_VISIBLE_DEVICES`
- `NYRA_CHAT_INTERNAL_API_BASE_URL`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `NYRA_ENABLE_MOCKS`
- `NYRA_ENV`
- `NYRA_ENVIRONMENT`
- `NYRA_FORCE_SECRETS` (secret)
- `NYRA_HTTP_ALLOWLIST`
- `NYRA_KYUTAI_DECODE_IMAGE`
- `NYRA_KYUTAI_STT_IMAGE`
- `NYRA_KYUTAI_TTS_IMAGE`
- `NYRA_KYUTAI_VAD_IMAGE`
- `NYRA_MACHINE`
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
- `OPENAI_API_KEY` (secret)
- `OPENAI_BASE_URL`
- `OPENAI_MAX_TOKENS` (secret)
- `OPENAI_MODEL`
- `OPENAI_ORG_ID`
- `OPENCLAW_CHAT_PATH`
- `OPENCLAW_COMPOSE_VALIDATE`
- `OPENCLAW_CONFIG_PATH`
- `OPENCLAW_DATA_DIR`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENCLAW_DOCKER_APT_PACKAGES`
- `OPENCLAW_FORCE_BUILD`
- `OPENCLAW_GATEWAY_PORT`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_HEALTH_TIMEOUT_S`
- `OPENCLAW_HOME_VOLUME`
- `OPENCLAW_HTTP_ALLOWLIST`
- `OPENCLAW_INSTALL_BROWSER`
- `OPENCLAW_MVP_IMAGE`
- `OPENCLAW_MVP_PORT`
- `OPENCLAW_OPENAI_BASE_URL`
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
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_FALLBACK_MODEL`
- `OPENWEBUI_PORT`
- `OPENWEBUI_SECRET_KEY` (secret)
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `PAGERDUTY_INTEGRATION_KEY` (secret)
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
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_INSECURE_POLL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_HTTP_PORT`
- `PORTAINER_ORCHESTRATOR_URL`
- `PORTAINER_PORT`
- `PORTAINER_PUBLIC_URL`
- `POSTGRES_CPU_LIMIT`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_MEMORY_LIMIT`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_PORT`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `PRIMARY_MODELS`
- `PROFILING_ENABLED`
- `PROMETHEUS_HOST`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `QDRANT_API_KEY` (secret)
- `QDRANT_MAX_SEARCH_THREADS`
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
- `REDIS_CPU_LIMIT`
- `REDIS_DB`
- `REDIS_ENABLED`
- `REDIS_HOST`
- `REDIS_MEMORY_LIMIT`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REDIS_URL`
- `RETRY_DELAY_MS`
- `REVIEW_LABEL`
- `REVIEW_MAX_CHARS`
- `REVIEW_MODEL`
- `REVIEW_POST_AS_REVIEW`
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
- `SERVER_URL`
- `SERVICES`
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
- `SUPABASE_JWT_SECRET` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `SUPABASE_URL`
- `SYNC_BATCH_SIZE`
- `SYNC_INTERVAL_MINUTES`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_ENABLED`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TAILSCALE_TAILNET`
- `TELEGRAM_BOT_TOKEN` (secret)
- `TELEMETRY_ENABLED`
- `TENANT_ENGINEERING_KEY` (secret)
- `TENANT_PRODUCTION_KEY` (secret)
- `TENANT_RESEARCH_KEY` (secret)
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
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_API_KEY` (secret)
- `TWENTY_API_URL`
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_API_URL`
- `TWENTY_CRM_SYNC_ENABLED`
- `TWENTY_CRM_SYNC_INTERVAL`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_WORKSPACE_ID`
- `TWENTY_DATABASE_URL`
- `TWENTY_DB_PASSWORD` (secret)
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
- `VOICE_PTP_INTERFACE`
- `VOICE_RTP_PORT_RANGE`
- `VRAM_GB`
- `WEBHOOK_RETRY_ATTEMPTS` (secret)
- `WEBHOOK_RETRY_DELAY` (secret)
- `WEBHOOK_TIMEOUT` (secret)
- `WEBHOOK_URL` (secret)
- `WHATSAPP_PHONE_NUMBER`
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_URL`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_MODELS`
- `WORKER_3090_URL`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_ID`
- `WORKER_ROLE`

### homeassistant

- `ARCHON_STATUS_URL`
- `GRAFANA_URL`
- `HASS_LONG_LIVED_TOKEN` (secret)
- `HASS_URL`
- `HA_MCP_BACKUP_HINT`
- `HA_MCP_IMAGE`
- `HOMEASSISTANT_TOKEN` (secret)
- `HOMEASSISTANT_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `NEXUS_STATUS_URL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_ORCHESTRATOR_URL`
- `TAILSCALE_IP`

### oracle-vps

- `AGENT_VAULT_ADDR`
- `AGENT_VAULT_ADMIN_EMAIL`
- `AGENT_VAULT_ADMIN_PASSWORD` (secret)
- `AGENT_VAULT_IDENTITY_ID`
- `AGENT_VAULT_MASTER_PASSWORD` (secret)
- `AGENT_VAULT_ORG_ID`
- `AGENT_VAULT_TRUSTED_PROXIES`
- `AGENT_VAULT_UA_CLIENT_ID`
- `AGENT_VAULT_UA_CLIENT_SECRET` (secret)
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
- `CF_TUNNEL_TOKEN` (secret)
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
- `CLERK_SECRET_KEY` (secret)
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `COMPOSE_PROJECT_NAME`
- `ENABLE_YAML_CONFIG_EDITING`
- `FALKORDB_HOST`
- `FALKORDB_PORT`
- `GEMINI_API_KEY` (secret)
- `GITEA_DB_NAME`
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
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_ROOT_URL`
- `HAMCP_ENABLE_CUSTOM_COMPONENT_INTEGRATION`
- `HAMCP_ENABLE_FILESYSTEM_TOOLS`
- `HA_MCP_BACKUP_HINT`
- `HA_MCP_IMAGE`
- `HOMEASSISTANT_TOKEN` (secret)
- `HOMEASSISTANT_URL`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `LETTA_SERVER_PASSWORD` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_MASTER_KEY` (secret)
- `LOG_LEVEL`
- `MEMPALACE_PORT`
- `MEMPAL_DIR`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_DB`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK` (secret)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (secret)
- `OPENAI_API_KEY` (secret)
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
- `OPENLIT_OTLP_GRPC_PORT`
- `OPENLIT_OTLP_HTTP_PORT`
- `OPENLIT_TELEMETRY_ENABLED`
- `OPENLIT_VAULT_ENCRYPTION_KEY` (secret)
- `OPENWEBUI_SECRET_KEY` (secret)
- `ORACLE_TAILSCALE_IP`
- `ORACLE_TUNNEL_TOKEN` (secret)
- `PAPERCLIP_AUTH_DISABLE_SIGN_UP` (secret)
- `PAPERCLIP_DB_NAME`
- `PAPERCLIP_DB_PASSWORD` (secret)
- `PAPERCLIP_DB_USER`
- `PAPERCLIP_HOST_PORT`
- `PAPERCLIP_IMAGE`
- `PAPERCLIP_PUBLIC_URL`
- `PAPERCLIP_SESSION_SECRET` (secret)
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY` (secret)
- `POSTGRES_DB`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_USER`
- `QUOTE_API_PORT`
- `QUOTE_API_SECRET` (secret)
- `SEARXNG_BASE_URL`
- `SEARXNG_HOST_PORT`
- `SEARXNG_SECRET` (secret)
- `SEARXNG_UWSGI_THREADS`
- `SEARXNG_UWSGI_WORKERS`
- `SUPABASE_ANON_KEY` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_URL`
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_REDIS_URL`
- `TWENTY_SERVER_URL`
- `WEBHOOK_URL` (secret)

- `ARCHON_SERVER_URL`
- `GPU_MODEL`
- `GPU_VRAM`
- `LETTA_DEFAULT_EMBEDDING_CONFIG`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `NEXUS_ROUTER_URL`
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_ENABLED`
- `OLLAMA_HOST`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MODELS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `POSTGRES_URL`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_IP`
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_URL`

### worker-rtx3090ti

- `ARCHON_SERVER_URL`
- `GPU_MODEL`
- `GPU_VRAM`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `NEXUS_ROUTER_URL`
- `NVIDIA_VISIBLE_DEVICES`
- `ORCHESTRATOR_TAILSCALE_IP`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_KEY` (secret)
- `POSTGRES_URL`
- `RTX3090TI_LAN_IP`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_IP`
- `VLLM_HOST`
- `VLLM_MODEL`
- `VLLM_PORT`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_MODELS`
- `WORKER_3090_URL`
- `WORKER_5090_VLLM_PORT`

### worker-rtx5090

- `ALERT_THRESHOLD_GPU_TEMP`
- `ALERT_THRESHOLD_INFERENCE_TIME`
- `ALERT_THRESHOLD_VRAM_USAGE`
- `ARCHON_SERVER_URL`
- `CHECK_INTERVAL`
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_LITELLM_HOSTNAME`
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_NAME`
- `CUDA_VISIBLE_DEVICES`
- `DOCKER_CPU_LIMIT`
- `DOCKER_MEMORY_LIMIT`
- `GPU_MODEL`
- `GPU_TYPE`
- `GPU_VRAM`
- `GPU_WORKER_ID`
- `GRAFANA_URL`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_PROJECT_ID`
- `LITELLM_DATABASE_URL`
- `LITELLM_LOG`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LOG_FILE`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOKI_URL`
- `MACHINE_HOSTNAME`
- `MACHINE_IP_ETHERNET`
- `MACHINE_IP_TAILSCALE`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MODEL_MANAGER_PORT`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_ROUTER_URL`
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_HOST`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MODELS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `PERF_MONITOR_PORT`
- `POSTGRES_URL`
- `PRIMARY_MODELS`
- `PROMETHEUS_PUSH_GATEWAY`
- `RTX5090_LAN_IP`
- `SERVICES`
- `SPECIALIZATION`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `VLLM_HOST`
- `VLLM_MODEL`
- `VLLM_PORT`
- `VRAM_GB`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_ID`
- `WORKER_ROLE`

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
- `NEXT_PUBLIC_PAPERCLIP_URL`
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
