# Master Required Environment Variables (Deduplicated)

Deduplicated list of all env vars discovered in `.env*` files across requested paths.

| Variable                                   | Seen In Paths | Environment Notes                                                                                                       | Secret?  |
| ------------------------------------------ | ------------: | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| `ACCESS_TOKEN_SECRET`                      |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ACTIVEPIECES_API_KEY`                     |            12 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ACTIVEPIECES_BASE_URL`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_DB`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_DB_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_ENABLED`                     |             5 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_ENCRYPTION_KEY`              |            15 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ACTIVEPIECES_HOST`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_JWT_SECRET`                  |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ACTIVEPIECES_PORT`                        |            20 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `ACTIVEPIECES_POSTGRES_DATABASE`           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_POSTGRES_DB`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_POSTGRES_HOST`               |             4 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_POSTGRES_PASSWORD`           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ACTIVEPIECES_POSTGRES_PORT`               |             4 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_POSTGRES_USER`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_PUBLIC_BASE_URL`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_REDIS_DB`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_REDIS_HOST`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_REDIS_PORT`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ACTIVEPIECES_SECRET_KEY`                  |             2 | single consistent value pattern                                                                                         | yes      |
| `ACTIVEPIECES_URL`                         |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ACTIVEPIECES_WEBHOOK_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ADMINER_PORT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ADMIN_API_KEY`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ADMIN_DASHBOARD_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ADMIN_EMAIL`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ADMIN_PASSWORD`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_API_KEY`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_AUTO_MIGRATE`                     |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_BACKUP_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_CACHE_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_CACHE_SIZE`                       |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_COMPRESSION`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_DATA_DIR`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_DB`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTDB_DISTANCE_METRIC`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_EMBEDDING_MODEL`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_ENABLED`                          |            15 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_FALLBACK_LEGACY`                  |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_HNSW_EF`                          |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_HNSW_EF_CONSTRUCTION`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_HNSW_EF_SEARCH`                   |             5 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_HNSW_M`                           |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_HOST`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_LEARNING`                         |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_LEARNING_ALGORITHM`               |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_PASSWORD`                         |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTDB_PATH`                             |            16 | uses different values/placeholders by file/environment                                                                  | yes      |
| `AGENTDB_PORT`                             |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `AGENTDB_QUANTIZATION`                     |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_QUIC_PEERS`                       |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `AGENTDB_QUIC_PORT`                        |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_QUIC_SYNC`                        |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_READ_ONLY`                        |             6 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_REASONING`                        |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTDB_SNAPSHOT_INTERVAL`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_SYNC_FROM`                        |             6 | single consistent value pattern                                                                                         | yes      |
| `AGENTDB_URL`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_USER`                             |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTDB_VECTOR_DIMENSIONS`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_VECTOR_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTDB_VERSION`                          |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTDB_WAL_ENABLED`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_API_KEY`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_AUTH`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_BOOTSTRAP`                   |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTIC_FLOW_CACHE_TTL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_JWT_SECRET`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_LOG_LEVEL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_MAX_AGENTS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_MCP_PORT`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_MEMORY_ENABLED`              |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENTIC_FLOW_PORT`                        |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `AGENTIC_FLOW_PROMETHEUS_PORT`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_PROVIDER`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTIC_FLOW_TELEMETRY`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_TOPOLOGY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_TRAINING`                    |             6 | single consistent value pattern                                                                                         | no/maybe |
| `AGENTIC_FLOW_VERSION`                     |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENTS_CUSTOM_PATHS`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `AGENTS_DIR`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENT_BOOSTER_ENABLED`                    |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENT_BOOSTER_VERSION`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `AGENT_CHECKPOINT_INTERVAL`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENT_MAX_RETRIES`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENT_REGISTRATION_URL`                   |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `AGENT_STORAGE_PATH`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGENT_TIMEOUT`                            |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AGENT_WORK_ORDERS_PORT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AGGRESSIVE_MEMORY_CLEANUP`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AIDEFENCE_BLOCK_SUSPICIOUS`               |             4 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `AIDEFENCE_ENABLED`                        |            16 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `AIDEFENCE_MONITOR_INPUTS`                 |             4 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `AIDEFENCE_MONITOR_OUTPUTS`                |             4 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `AI_REVIEW_MODEL`                          |             1 | env tags: dev; single consistent value pattern                                                                          | yes      |
| `ALERTMANAGER_HOST`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERTMANAGER_PORT`                        |             8 | single consistent value pattern                                                                                         | no/maybe |
| `ALERTMANAGER_URL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_CHECK_INTERVAL_MINUTES`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_CPU_USAGE`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_EMAIL`                              |             4 | env tags: general, production; uses different values/placeholders by file/environment                                   | no/maybe |
| `ALERT_EMAIL_ENABLED`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_EMAIL_TO`                           |             1 | single consistent value pattern                                                                                         | yes      |
| `ALERT_ERROR_RATE`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_GPU_POWER_THRESHOLD_W`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_GPU_TEMP_THRESHOLD_C`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_MANAGER_ENABLED`                    |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `ALERT_MEMORY_USAGE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_QUEUE_DEPTH_THRESHOLD`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_RESPONSE_TIME`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_RESPONSE_TIME_THRESHOLD_MS`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_SLACK_CHANNEL`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `ALERT_THRESHOLD_GPU_TEMP`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_THRESHOLD_INFERENCE_TIME`           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_THRESHOLD_VRAM_USAGE`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALERT_WEBHOOK_URL`                        |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ALLOWED_FILE_TYPES`                       |             6 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `ALLOWED_ORIGINS`                          |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ALLOW_ORCHESTRATOR_IP`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ALLOW_PC1_IP`                             |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ALLOW_PC2_IP`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALLOW_PC3_IP`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ALLOW_PC4_IP`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ANON_KEY`                                 |             1 | single consistent value pattern                                                                                         | yes      |
| `ANTHROPIC_API_KEY`                        |            83 | env tags: ci, dev, development, general, prod; uses different values/placeholders by file/environment                   | yes      |
| `ANTHROPIC_BASE_URL`                       |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ANTHROPIC_DEFAULT_SONNET_MODEL`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ANTHROPIC_MAX_TOKENS`                     |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ANTHROPIC_MODEL`                          |            16 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | yes      |
| `ANTHROPIC_TEMPERATURE`                    |             7 | single consistent value pattern                                                                                         | no/maybe |
| `API_ACCESS_TOKEN`                         |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `API_BASE_URL`                             |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `API_KEY`                                  |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `API_KEY_EXPIRY`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_KEY_HEADER`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_KEY_PC2`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_KEY_PC3`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_KEY_PC4`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_KEY_REQUIRED`                         |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `API_KEY_ROTATION_DAYS`                    |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `API_KEY_ROTATION_ENABLED`                 |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `API_PORT`                                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_PREFIX`                               |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `API_RATE_LIMIT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_RATE_LIMITING_REQUEST_COUNT`          |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `API_RATE_LIMITING_TTL`                    |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `API_RATE_LIMIT_MAX_REQUESTS`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_RATE_LIMIT_WINDOW_MS`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_SECRET`                               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `API_SECRET_KEY`                           |             1 | single consistent value pattern                                                                                         | yes      |
| `API_URL`                                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `API_VERSION`                              |             5 | single consistent value pattern                                                                                         | no/maybe |
| `APM_ENABLED`                              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `APP_HOST`                                 |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `APP_NAME`                                 |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `APP_PORT`                                 |             5 | env tags: development, general, production; single consistent value pattern                                             | no/maybe |
| `APP_PROTOCOL`                             |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `APP_URL`                                  |             8 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `APP_VERSION`                              |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `AP_API_KEY`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AP_ENCRYPTION_KEY`                        |             7 | uses different values/placeholders by file/environment                                                                  | yes      |
| `AP_FRONTEND_URL`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AP_JWT_SECRET`                            |             7 | uses different values/placeholders by file/environment                                                                  | yes      |
| `AP_POSTGRES_PASSWORD`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AP_VERSION`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHGW_DISABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_AGENTS_ENABLED`                    |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_AGENTS_PORT`                       |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_API_KEY`                           |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_API_PORT`                          |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_API_WORKERS`                       |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_BACKOFF_MULTIPLIER`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_BASE_URL`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_CHECKPOINT_INTERVAL`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_DB_NAME`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_DB_PASSWORD`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `ARCHON_DB_USER`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_DEBUG`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_DEV_PATH`                          |             2 | env tags: development; single consistent value pattern                                                                  | yes      |
| `ARCHON_DOCS_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_ENABLED`                           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_ENABLE_DEV_MODE`                   |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ARCHON_ENABLE_WORK_ORDERS`                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_ENV`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_HOST`                              |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_JWT_SECRET`                        |             1 | single consistent value pattern                                                                                         | yes      |
| `ARCHON_LOG_LEVEL`                         |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_MAX_DEPTH`                         |             6 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `ARCHON_MAX_TASKS`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `ARCHON_MCP_BIND`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_MCP_PORT`                          |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ARCHON_MCP_URL`                           |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_METRICS_PORT`                      |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ARCHON_METRICS_URL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_MODE`                              |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_OS_PORT`                           |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `ARCHON_OS_URL`                            |             6 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `ARCHON_PARALLEL_BRANCHES`                 |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `ARCHON_PORT`                              |            12 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `ARCHON_PROD`                              |             1 | single consistent value pattern                                                                                         | yes      |
| `ARCHON_REDIS_URL`                         |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_RETRY_ATTEMPTS`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_SERVER_PORT`                       |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_STATE_PERSISTENCE`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_TASK_TIMEOUT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_TOPOLOGY`                          |             6 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `ARCHON_UI_BASE_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_UI_PORT`                           |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `ARCHON_URL`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ARCHON_USE_NPM`                           |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `AREA51_HOST`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AREA51_LAN_IP`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ASSIGNMENT_ENABLED`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ASSIGNMENT_STRATEGY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AUDIT_LOGGING_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AUDIT_LOG_DESTINATION`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `AUDIT_LOG_ENABLED`                        |             5 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `AUDIT_LOG_ENCRYPT`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `AUDIT_LOG_LEVEL`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `AUDIT_LOG_RETENTION_DAYS`                 |             4 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `AUTH_SECRET`                              |             1 | single consistent value pattern                                                                                         | yes      |
| `AUTH_SERVICE_URL`                         |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `AUTOAPPROVE`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AUTO_MIGRATE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AUTO_RECOVERY_ENABLED`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `AUTO_SEED_DATA`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AWS_ACCESS_KEY_ID`                        |            10 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `AWS_REGION`                               |            10 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `AWS_S3_BUCKET`                            |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `AWS_S3_ENDPOINT`                          |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `AWS_S3_URL_EXPIRY`                        |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `AWS_SECRET_ACCESS_KEY`                    |            10 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `AZURE_API_BASE`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AZURE_API_KEY`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `AZURE_API_VERSION`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BACKUP_DIR`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BACKUP_ENABLED`                           |             7 | single consistent value pattern                                                                                         | no/maybe |
| `BACKUP_INTERVAL_HOURS`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `BACKUP_MODELS`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `BACKUP_PATH`                              |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `BACKUP_RETENTION`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BACKUP_RETENTION_DAYS`                    |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BACKUP_S3_BUCKET`                         |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BACKUP_SCHEDULE`                          |             9 | uses different values/placeholders by file/environment                                                                  | yes      |
| `BASH_DEFAULT_TIMEOUT_MS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BASH_MAX_OUTPUT_LENGTH`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BASH_MAX_TIMEOUT_MS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BATCH_SIZE`                               |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BATCH_TIMEOUT_MS`                         |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BATCH_WAIT_TIMEOUT_MS`                    |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `BCRYPT_ROUNDS`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BCRYPT_SALT_ROUNDS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BETTER_AUTH_SECRET`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_ADMIN_TOKEN`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_CLIENT_ID`                      |             2 | single consistent value pattern                                                                                         | yes      |
| `BITWARDEN_CLIENT_SECRET`                  |             2 | single consistent value pattern                                                                                         | yes      |
| `BITWARDEN_CLI_PATH`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_MCP_BIND`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_MCP_HOST`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_MCP_PORT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_MCP_URL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BITWARDEN_PASSWORD`                       |             2 | single consistent value pattern                                                                                         | yes      |
| `BODY_TIMEOUT`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `BOOT_OPENCLAW`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BOOT_OPENCLAW_UI_PROXY`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BOOT_OPENCLAW_VOICE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BUILD_DATE`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BUILD_ID`                                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `BWS_ACCESS_TOKEN`                         |             5 | env tags: general, test; uses different values/placeholders by file/environment                                         | no/maybe |
| `BW_CLIENTID`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BW_CLIENTSECRET`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BW_SERVER`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `BW_SESSION`                               |             2 | single consistent value pattern                                                                                         | yes      |
| `CACHE_ENABLED`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_EVICTION_POLICY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_MAX_SIZE`                           |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_PATH`                               |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CACHE_SIZE`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_SIZE_GB`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_SIZE_PERCENT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL`                                |            20 | env tags: ci, dev, development, general, prod; uses different values/placeholders by file/environment                   | no/maybe |
| `CACHE_TTL_AUTH`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `CACHE_TTL_CALCULATOR`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL_CONTENT`                        |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `CACHE_TTL_DEFAULT`                        |             6 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `CACHE_TTL_QUOTES`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL_RATES`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL_SECONDS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL_STATIC_DATA`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CACHE_TTL_USER`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `CACHE_TTL_USER_SESSIONS`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CADDY_HTTP_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CADVISOR_PORT`                            |            14 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CALENDAR_DRIVER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CAMPAIGN_ENGINE_HOST`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CAMPAIGN_ENGINE_PORT`                     |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CAMPAIGN_ENGINE_URL`                      |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CAMPAIGN_MAX_RETRIES`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CAMPAIGN_RETRY_DELAY_MINUTES`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CAMPAIGN_TIMEZONE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CAPTCHA_DRIVER`                           |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `CDN_INVALIDATION_KEY`                     |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CDN_URL`                                  |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CF_ACCESS_CLIENT_ID`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CF_ACCESS_CLIENT_SECRET`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CF_ACCOUNT_ID`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CF_API_TOKEN`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CF_PAGES_PROJECT`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CF_TUNNEL_ID_ORCHESTRATOR`                |             2 | single consistent value pattern                                                                                         | yes      |
| `CF_TUNNEL_NAME`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CF_TUNNEL_TOKEN`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CF_ZONE_ID`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CHECKPOINT_AUTO_COMMIT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CHECKPOINT_BRANCH_STRATEGY`               |             1 | single consistent value pattern                                                                                         | yes      |
| `CHECKPOINT_ENABLED`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CHECKPOINT_INCLUDE_METRICS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CHECKPOINT_INTERVAL`                      |             8 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CHECKPOINT_INTERVAL_STEPS`                |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CHECKPOINT_MAX_CHECKPOINTS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CHECKPOINT_MESSAGE_PREFIX`                |             1 | single consistent value pattern                                                                                         | yes      |
| `CHECKPOINT_RETENTION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CHECK_INTERVAL`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CI`                                       |             5 | env tags: ci, general; uses different values/placeholders by file/environment                                           | no/maybe |
| `CIPHER_SUITES`                            |             2 | env tags: production; single consistent value pattern                                                                   | yes      |
| `CI_PROVIDER`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAM_AV_HOST`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CLAM_AV_PORT`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CLAUDE_API_KEY`                           |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLAUDE_AUTO_APPROVE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_ALWAYS_THINKING_ENABLED`      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE`       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_ENABLE_TELEMETRY`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_GIT_BASH_PATH`                |             1 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_CODE_INTERACTION_MODE`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_OAUTH_TOKEN`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CODE_SUBAGENT_MODEL`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_CONFIG_PATH`                       |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLAUDE_DEV_KIT_MCP_URL`                   |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `CLAUDE_ESCALATE_MODEL`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_AGENT_POOL`                   |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_ALPHA`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_API_KEY`                      |             2 | env tags: development, general; uses different values/placeholders by file/environment                                  | yes      |
| `CLAUDE_FLOW_AUTO_COMMIT`                  |            20 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_AUTO_LEARNING`                |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_AUTO_PUSH`                    |            17 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_AUTO_SCALING`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_AUTO_UPDATE`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_BASE_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_CACHE_ENABLED`                |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_CACHE_SIZE`                   |            19 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_CHECKPOINTS_ENABLED`          |            13 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_CHECKPOINT_ENABLED`           |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_CHECKPOINT_INTERVAL`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_CICD_MODE`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_CMD`                          |             1 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_FLOW_CODEX_VERSION`                |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_CONCURRENT_TASKS`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_CONFIG`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_FLOW_CONFIG_DIR`                   |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_CONFIG_PATH`                  |             1 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_FLOW_COORDINATION_ENABLED`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_DAEMON_ENABLED`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_DASHBOARD_PORT`               |             4 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `CLAUDE_FLOW_DATA_DIR`                     |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_DEBUG`                        |            20 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_DEV_PATH`                     |             2 | env tags: development; single consistent value pattern                                                                  | yes      |
| `CLAUDE_FLOW_DISTRIBUTED`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLED`                      |             9 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_AGENT_DB`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_CHECKPOINTS`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_DEV_MODE`              |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `CLAUDE_FLOW_ENABLE_FORKING`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_HOOKS`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_MCP`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_MEMORY`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_METRICS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_NEURAL`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_PAUSE_RESUME`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_REASONING_BANK`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_RUVECTOR`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_SWARM`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENABLE_TRACING`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_ENVIRONMENT`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_FORCE_UPDATE`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_GITHUB_INTEGRATION`           |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_HOOKS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_HOOKS_ENABLED`                |            15 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CLAUDE_FLOW_HOST`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_HOT_RELOAD`                   |             2 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_LOG_FILE`                     |             2 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_FLOW_LOG_LEVEL`                    |            21 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_MASTER_URL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MAX_AGENTS`                   |            21 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_MAX_AGENTS_SCALING`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MAX_CONCURRENT_TASKS`         |            18 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_MCP_HOST`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MCP_MODE`                     |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MCP_PORT`                     |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MCP_URL`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MCP_VERSION`                  |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_MEMORY`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MEMORY_DIR`                   |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MEMORY_ENABLED`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MEMORY_LIMIT`                 |            19 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_MEMORY_PERSIST`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MEMORY_PERSISTENCE`           |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MEMORY_SIZE`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MEMORY_VERSION`               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_METRICS_PORT`                 |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_MIN_AGENTS`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_MODE`                         |            32 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_NEURAL_OPTIMIZATION`          |            14 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CLAUDE_FLOW_NEURAL_VERSION`               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_ORCHESTRATOR`                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_PARALLEL_PROCESSING`          |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_PERFORMANCE_MODE`             |            13 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CLAUDE_FLOW_PORT`                         |            13 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `CLAUDE_FLOW_PROFILE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_REDIS_URL`                    |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLAUDE_FLOW_REMOTE_EXECUTION`             |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_SCALE_DOWN_THRESHOLD`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_SCALE_UP_THRESHOLD`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_SECURITY_AUDIT`               |            10 | env tags: ci, general, prod; uses different values/placeholders by file/environment                                     | no/maybe |
| `CLAUDE_FLOW_SEMANTIC_SEARCH`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_SWARM_TOPOLOGY`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_TELEMETRY_ENABLED`            |            20 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_TIMEOUT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_TOPOLOGY`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLAUDE_FLOW_TRUTH_THRESHOLD`              |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLAUDE_FLOW_URL`                          |             8 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `CLAUDE_FLOW_USE_NPM`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CLAUDE_FLOW_VERBOSE`                      |             7 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_FLOW_VERIFY_MODE`                  |             8 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `CLAUDE_FLOW_VERSION`                      |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `CLAUDE_FLOW_WATCH_MODE`                   |             2 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CLAUDE_FLOW_WORKER_THREADS`               |            19 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `CLAUDE_METRICS_PATH`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `CLAUDE_MODEL`                             |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLAWDBOT_GATEWAY_TOKEN`                   |             1 | single consistent value pattern                                                                                         | yes      |
| `CLEANUP_CHECKPOINTS_DAYS`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLEANUP_OLD_MODELS_DAYS`                  |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLEARBIT_API_KEY`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLEAR_CACHE_INTERVAL`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLERK_PUBLISHABLE_KEY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLERK_SECRET_KEY`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLERK_WEBHOOK_SECRET`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARED_HOSTNAME`                     |             2 | single consistent value pattern                                                                                         | yes      |
| `CLOUDFLARED_LITELLM_HOSTNAME`             |             2 | single consistent value pattern                                                                                         | yes      |
| `CLOUDFLARED_TOKEN`                        |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARED_TUNNEL_ID`                    |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLOUDFLARED_TUNNEL_NAME`                  |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLOUDFLARED_TUNNEL_TOKEN`                 |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARED_TUNNEL_URL`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_ACCOUNT_ID`                    |            10 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `CLOUDFLARE_API`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_API_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_API_TOKEN`                     |             8 | env tags: dev, general, production; uses different values/placeholders by file/environment                              | yes      |
| `CLOUDFLARE_EMAIL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_ENABLED`                       |             4 | env tags: general, production; single consistent value pattern                                                          | no/maybe |
| `CLOUDFLARE_GLOBAL_API`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_ORIGIN_CA_KEY`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TOKEN`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_ENABLED`                |             5 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `CLOUDFLARE_TUNNEL_ID`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_ID_ORCHESTRATOR`        |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3060`      |             2 | single consistent value pattern                                                                                         | yes      |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3090TI`    |             2 | single consistent value pattern                                                                                         | yes      |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX5090`      |             2 | single consistent value pattern                                                                                         | yes      |
| `CLOUDFLARE_TUNNEL_LOGLEVEL`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_METRICS`                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_NAME`                   |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR`      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060`    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI`  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090`    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CLOUDFLARE_TUNNEL_TOKEN`                  |             9 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`     |            14 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060`   |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI` |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090`   |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CLOUDFLARE_ZONE_ID`                       |            12 | env tags: dev, general, production; uses different values/placeholders by file/environment                              | yes      |
| `CLUSTER_NUM_WORKERS`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `CODANNA_API_KEY`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CODANNA_DISABLED`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CODELLAMA_13B_PARAMS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CODELLAMA_34B_PARAMS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CODELLAMA_70B_PARAMS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `COHERE_API_KEY`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `COMPILATION_TIMEOUT`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `COMPLETION_MODEL`                         |            15 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | yes      |
| `COMPOSE_DOCKER_CLI_BUILD`                 |            13 | single consistent value pattern                                                                                         | no/maybe |
| `COMPOSE_FILE`                             |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `COMPOSE_HTTP_TIMEOUT`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `COMPOSE_PROFILES`                         |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `COMPOSE_PROJECT_NAME`                     |            20 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `COMPOSIO_API_KEY`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONFIG_DIR`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONFLICT_STRATEGY`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `CONNECTION_POOL_SIZE`                     |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CONNECTION_TIMEOUT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONSENT_REQUIRED`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONSOLE_API_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONSOLE_WEB_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONSUL_CLIENT_ADDR`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CONSUL_ENABLED`                           |             4 | single consistent value pattern                                                                                         | no/maybe |
| `CONSUL_HTTP_ADDR`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONSUL_SERVER_ADDR`                       |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CONTAINER_MEMORY_LIMIT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONTEXT7_API_KEY`                         |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `CONTEXT_OVERLAP`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONTEXT_SERVICE_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CONTEXT_WINDOW`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CONTINUOUS_INTEGRATION`                   |             5 | env tags: ci, general; uses different values/placeholders by file/environment                                           | no/maybe |
| `COORDINATOR_TYPE`                         |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `CORS_ALLOWED_ORIGINS`                     |            11 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | no/maybe |
| `CORS_ALLOW_CREDENTIALS`                   |             4 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `CORS_ALLOW_HEADERS`                       |             4 | env tags: development, production; single consistent value pattern                                                      | yes      |
| `CORS_CREDENTIALS`                         |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `CORS_ENABLED`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CORS_METHODS`                             |             4 | env tags: development, production; single consistent value pattern                                                      | yes      |
| `CORS_ORIGIN`                              |            18 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `CORS_ORIGINS`                             |             2 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `COVERAGE_ENABLED`                         |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `COVERAGE_REPORT_PATH`                     |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `CPU_LIMIT`                                |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CPU_THRESHOLD_PERCENT`                    |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CREATE_GH_RELEASE`                        |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `CRM_DASHBOARD_PORT`                       |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CRM_DASHBOARD_URL`                        |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `CSP_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `CUDA_DEVICE_ORDER`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `CUDA_PATH`                                |             2 | single consistent value pattern                                                                                         | yes      |
| `CUDA_VERSION`                             |             4 | single consistent value pattern                                                                                         | no/maybe |
| `CUDA_VISIBLE_DEVICES`                     |            12 | single consistent value pattern                                                                                         | no/maybe |
| `CUSTOM_NODES_PATH`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DAEMON_ENABLED`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_HOST`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_MAX_OVERFLOW`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_NAME`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_PASSWORD`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_POOL_MAX`                        |             3 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `DATABASE_POOL_MIN`                        |             3 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `DATABASE_POOL_SIZE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_PORT`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_SCHEMA`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DATABASE_SSL`                             |             3 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `DATABASE_URL`                             |            31 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `DATABASE_USER`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATADOG_API_KEY`                          |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DATADOG_ENABLED`                          |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DATADOG_SITE`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DATA_DELETION_RETENTION_DAYS`             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DATA_DIR`                                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DATA_ENCRYPTION_AT_REST`                  |             3 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `DATA_ENCRYPTION_IN_TRANSIT`               |             3 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `DATA_RETENTION_APPLICATIONS`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATA_RETENTION_CONVERSATIONS`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DATA_RETENTION_DAYS`                      |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DATA_RETENTION_SYSTEM_LOGS`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DB_BACKUP_ENABLED`                        |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DB_BACKUP_RETENTION_DAYS`                 |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DB_BACKUP_S3_BUCKET`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DB_BACKUP_SCHEDULE`                       |             2 | env tags: production; single consistent value pattern                                                                   | yes      |
| `DB_CONNECTION_POOL_SIZE`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DB_CONNECTION_TIMEOUT`                    |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_HOST`                                  |             7 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_IDLE_TIMEOUT`                          |             6 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_MAX_CONNECTIONS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DB_MIN_CONNECTIONS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DB_NAME`                                  |             7 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_PASSWORD`                              |             9 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `DB_POOL_IDLE_TIMEOUT`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DB_POOL_MAX`                              |             7 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_POOL_MIN`                              |             7 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `DB_PORT`                                  |             7 | env tags: development, general, production; single consistent value pattern                                             | no/maybe |
| `DB_QUERY_LOG`                             |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DB_QUERY_SLOW_THRESHOLD`                  |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DB_REPLICA_ENABLED`                       |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DB_REPLICA_HOST`                          |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DB_SSL`                                   |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DB_STATEMENT_TIMEOUT`                     |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DB_TYPE`                                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DB_USER`                                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DB_USERNAME`                              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DDOS_PROTECTION_ENABLED`                  |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DEBUG`                                    |            30 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `DEBUG_EXPRESS`                            |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `DEBUG_MODE`                               |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `DEEPSEEK_API_KEY`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEEPSEEK_CODER_6B7_PARAMS`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_COMPLIANCE_EMAIL`                 |             1 | single consistent value pattern                                                                                         | yes      |
| `DEFAULT_LOAN_OFFICER_EMAIL`               |             1 | single consistent value pattern                                                                                         | yes      |
| `DEFAULT_MODEL`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_PAGE_SIZE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_PROVIDER`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_QUOTE_EXPIRY_DAYS`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_TEMPERATURE`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DEFAULT_TIMEOUT_S`                        |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `DEFAULT_USER_ROLE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEPLOYMENT_ENVIRONMENT`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DEPLOYMENT_MIN_READY_SECONDS`             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DEPLOYMENT_STRATEGY`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DEPLOYMENT_TARGET`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DEREGISTRATION_CRITICAL_SERVICE_AFTER`    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DESKTOP_COMMANDER_CMD`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `DEVELOPMENT_MODE`                         |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `DEV_MODE`                                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DEV_PORT`                                 |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `DIFY_API_KEY`                             |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_API_PORT`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_API_URL`                             |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_BASE_URL`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_CONSOLE_URL`                         |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_DATABASE_URL`                        |             1 | single consistent value pattern                                                                                         | yes      |
| `DIFY_DB`                                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_DB_NAME`                             |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `DIFY_DB_PASSWORD`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_DB_URL`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_DB_USERNAME`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_ENABLED`                             |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_ENCRYPTION_KEY`                      |             9 | uses different values/placeholders by file/environment                                                                  | yes      |
| `DIFY_HOST`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_JWT_SECRET`                          |             1 | single consistent value pattern                                                                                         | yes      |
| `DIFY_LOG_LEVEL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_PORT`                                |             5 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `DIFY_POSTGRES_DB`                         |             9 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_POSTGRES_HOST`                       |             4 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_POSTGRES_PASSWORD`                   |            14 | uses different values/placeholders by file/environment                                                                  | yes      |
| `DIFY_POSTGRES_PORT`                       |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_POSTGRES_USER`                       |             9 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_REDIS_DB`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_REDIS_HOST`                          |             4 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_REDIS_PASSWORD`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_REDIS_PORT`                          |             4 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_REDIS_URL`                           |             1 | single consistent value pattern                                                                                         | yes      |
| `DIFY_SANDBOX_API_KEY`                     |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `DIFY_SANDBOX_PORT`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_SECRET_KEY`                          |            18 | uses different values/placeholders by file/environment                                                                  | yes      |
| `DIFY_URL`                                 |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `DIFY_WEB_BIND`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DIFY_WEB_PORT`                            |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DIFY_WEB_URL`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DISABLE_NON_ESSENTIAL_MODEL_CALLS`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DISABLE_PROMPT_CACHING_HAIKU`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DISABLE_TELEMETRY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DISCORD_BOT_TOKEN`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DISCORD_WEBHOOK_URL`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DISCOVERY_INTERVAL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DISK_THRESHOLD_PERCENT`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DISTRIBUTED_FINETUNING_ENABLED`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DISTRIBUTED_INFERENCE_ENABLED`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DISTRIBUTE_TO_PC2_WEIGHT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DISTRIBUTE_TO_PC3_WEIGHT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DNC_CHECK_ENABLED`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKERHUB_NAMESPACE`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKERHUB_TOKEN`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DOCKERHUB_USERNAME`                       |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DOCKER_BUILDKIT`                          |            13 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_COMPOSE_PROJECT_NAME`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_CPU_LIMIT`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_HOST`                              |             2 | single consistent value pattern                                                                                         | yes      |
| `DOCKER_IMAGE`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `DOCKER_MCP_HOST`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_MCP_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_MEMORY_LIMIT`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_NETWORK`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DOCKER_REGISTRY`                          |             3 | env tags: general, production; uses different values/placeholders by file/environment                                   | yes      |
| `DOCKER_REGISTRY_PASS`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `DOCKER_REGISTRY_USER`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `DOCKER_SOCKET`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_SUBNET`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_SUBNET_ORCHESTRATOR`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_SUBNET_RTX3060`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_SUBNET_RTX3090`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKER_SUBNET_RTX5090`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCKHERHUB_TOKEN`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCUMENT_API_URL`                         |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DOCUMENT_PROCESSOR_PORT`                  |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `DOCUMENT_PROCESSOR_URL`                   |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `DOCUSIGN_ACCOUNT_ID`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCUSIGN_BASE_PATH`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCUSIGN_INTEGRATION_KEY`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOCUSIGN_PRIVATE_KEY_PATH`                |             1 | single consistent value pattern                                                                                         | yes      |
| `DOCUSIGN_USER_ID`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `DOMAIN`                                   |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `DOMAIN_API`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOMAIN_APP`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOMAIN_CRM`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DOMAIN_NAME`                              |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `DOMAIN_PRIMARY`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `DYNAMIC_BATCHING_ENABLED`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ELASTICSEARCH_INDEX`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ELASTICSEARCH_NODE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EMAIL_DRIVER`                             |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `EMAIL_FROM`                               |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `EMAIL_FROM_ADDRESS`                       |             5 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `EMAIL_FROM_NAME`                          |             1 | single consistent value pattern                                                                                         | yes      |
| `EMAIL_HOST`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_NOTIFICATIONS`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EMAIL_PASS`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EMAIL_PASSWORD`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EMAIL_PORT`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_PROVIDER`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `EMAIL_SECURE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EMAIL_SMTP_HOST`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_SMTP_PASS`                          |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_SMTP_PORT`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_SMTP_USER`                          |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMAIL_SYSTEM_ADDRESS`                     |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `EMAIL_TO`                                 |             1 | single consistent value pattern                                                                                         | yes      |
| `EMAIL_USER`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMBEDDING_BATCH_SIZE`                     |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `EMBEDDING_CACHE_DIR`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EMBEDDING_DEVICE`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `EMBEDDING_DIMENSIONS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EMBEDDING_INTERNAL_URL`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EMBEDDING_MAX_SEQUENCE_LENGTH`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EMBEDDING_MODEL`                          |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `EMBEDDING_PORT`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_ADAPTIVE_TOPOLOGY`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_AGENT_WORK_ORDERS`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_ALERTS`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_AST_ANALYSIS`                      |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_AUDIT_LOGGING`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_AUTH`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_AUTO_FAILOVER`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_AUTO_SCALING`                      |             5 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_BRANCHING`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_CACHING`                           |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_CLAUDE_FLOW_SYNC`                  |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_CLOUDFLARED`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_CLUSTERING`                        |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `ENABLE_CODE_GENERATION`                   |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_COMPLIANCE_CHECKS`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_CONVERSATION_CONTEXT`              |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_COST_TRACKING`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_CRM`                               |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_CROSS_ORCHESTRATOR_AGENTS`         |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_CSRF_PROTECTION`                   |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `ENABLE_DEPENDENCY_GRAPH`                  |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_DETAILED_LOGGING`                  |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `ENABLE_DEV_TOOLS`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_DISTRIBUTED_TRAINING`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_DUAL_ORCHESTRATOR`                 |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_DYNAMIC_ADJUSTMENT`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_DYNAMIC_BATCHING`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_EMAIL_VERIFICATION`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_FLASH_ATTENTION_2`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GPU`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GPU_METRICS`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GPU_POWER_MONITORING`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GPU_THERMAL_MONITORING`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GPU_WORKERS`                       |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_GRADIENT_ACCUMULATION`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GUARDRAILS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_GZIP`                              |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `ENABLE_HEALTH_CHECKS`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_HEALTH_MONITOR`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_HELMET`                            |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `ENABLE_HOT_RELOAD`                        |             3 | env tags: dev, development; single consistent value pattern                                                             | no/maybe |
| `ENABLE_HSTS`                              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `ENABLE_IMAGE_ANALYSIS`                    |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_INFERENCE_PROFILING`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_JIT_COMPILATION`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_JOB_QUEUE`                         |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `ENABLE_KV_CACHE`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_LEARNING`                          |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_LOAD_BALANCING`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_LOCAL_LB`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_LOGGING`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_LOG_SHIPPING`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_MEMORY_OPTIMIZATION`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_MEMORY_PERSISTENCE`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_METRICS`                           |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_MODEL_BENCHMARKING`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_MONITORING`                        |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_MULTIMODAL`                        |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_MULTI_GPU_SYNC`                    |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_MULTI_TENANT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_NEURAL_AGENTS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_NEURAL_COORDINATION`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_NSYS_PROFILING`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_PATTERN_RECOGNITION`               |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_PC2_FALLBACK`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_PC3_FALLBACK`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_PERFORMANCE_MONITORING`            |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `ENABLE_PERSISTENT_MEMORY`                 |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_PII_DETECTION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_PREFETCHING`                       |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_PROFILING`                         |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_QUANTIZATION`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_RATE_LIMITING`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_REQUEST_ID`                        |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_REQUEST_PRIORITY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_REVISIONS`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_SECURITY_SCAN`                     |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_SELF_HEALING`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_SIGNUP`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_SOURCE_MAPS`                       |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `ENABLE_SPECULATIVE_DECODING`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_SWAGGER`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_SWARM_COORDINATION`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_TAILSCALE`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_TASK_QUEUE`                        |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_TELEMETRY`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_TLS`                               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_TRACING`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_USER_PREFERENCES`                  |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENABLE_VIRUS_SCAN`                        |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `ENABLE_WORKFLOWS`                         |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ENABLE_WORKFLOW_CACHING`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENABLE_WORKFLOW_TEMPLATES`                |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ENCRYPTION_ALGORITHM`                     |             9 | env tags: dev, general, prod; single consistent value pattern                                                           | no/maybe |
| `ENCRYPTION_IV_LENGTH`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ENCRYPTION_KEY`                           |            25 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | yes      |
| `ENCRYPTION_KEY_PATH`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `ENRICHMENT_ENABLED`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENRICHMENT_PROVIDER`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENV`                                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ENVIRONMENT`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EPIC_SDK_SPEC`                            |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `EQUIFAX_API_KEY`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_HEARTBEAT`                   |             5 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_HOST`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_HTTP_PORT`                   |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `EVENT_SERVER_MAX_CONNECTIONS`             |             5 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_PORT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_REPLAY_BUFFER`               |             5 | single consistent value pattern                                                                                         | no/maybe |
| `EVENT_SERVER_WS_PORT`                     |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `EWC_CONSOLIDATION_INTERVAL`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EWC_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EWC_LAMBDA`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EXA_API_KEY`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `EXPERIAN_API_KEY`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EXPERIMENTAL_FLASH_ATTENTION`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EXPERIMENTAL_QUANTIZATION`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EXPERIMENTAL_TENSOR_PARALLEL`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `EXPORT_METRICS`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FAIL2BAN_ENABLED`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FAILOVER_RETRY_INTERVAL`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FAILOVER_TIMEOUT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_AOF_ENABLED`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_AOF_FSYNC`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_AOF_SYNC`                        |             9 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `FALKORDB_BIND`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_DB_INDEX`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_ENABLED`                         |             4 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_EVICTION_POLICY`                 |             4 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_GRAPH`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_GRAPH_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_GRAPH_NAME`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_HOST`                            |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FALKORDB_MAX_MEMORY`                      |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `FALKORDB_PASSWORD`                        |            18 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `FALKORDB_PERSISTENCE`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FALKORDB_PERSISTENCE_DIR`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_PERSIST_DATA`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_PORT`                            |            12 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FALKORDB_REPLICATION`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FALKORDB_REPLICA_URLS`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_SNAPSHOT_ENABLED`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_SNAPSHOT_INTERVAL`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FALKORDB_URL`                             |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FALLBACK_MODELS`                          |             1 | single consistent value pattern                                                                                         | yes      |
| `FALLBACK_PROVIDERS`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `FANNIE_MAE_API_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_ADMIN_PORTAL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_ADVANCED_ANALYTICS`               |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `FEATURE_AI_CHATBOT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_ANALYTICS_DASHBOARD`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_AUTOMATED_UNDERWRITING`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_AUTO_LEARNING`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_A_B_TESTING`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_BETA_API`                         |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `FEATURE_DEBUG_ENDPOINTS`                  |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `FEATURE_DEBUG_TOOLS`                      |             2 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `FEATURE_DOCUMENT_OCR`                     |             5 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_DRIP_CAMPAIGNS`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_EXPERIMENTAL`                     |             2 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `FEATURE_EXPERIMENTAL_UI`                  |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `FEATURE_LOCAL_GPU`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_MEMORY_SYSTEMS`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_MOCK_DATA`                        |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `FEATURE_MOCK_SERVICES`                    |             2 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `FEATURE_MULTI_LANGUAGE`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_MULTI_LENDER_QUOTES`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_NEURAL_OPTIMIZATION`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_PREDICTIVE_ANALYTICS`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_SWARM_ORCHESTRATION`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_VOICE_AUTOMATION`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FEATURE_VOICE_CALLS`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FILE_TOKEN_SECRET`                        |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `FINETUNING_API_KEY`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `FINETUNING_BATCH_SIZE`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_DATASET_PATH`                  |             1 | single consistent value pattern                                                                                         | yes      |
| `FINETUNING_ENABLED`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_EPOCHS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_HOST`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_LEARNING_RATE`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_LOG_FREQUENCY`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_MAX_DATASET_SIZE_GB`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_MAX_STEPS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_OUTPUT_PATH`                   |             1 | single consistent value pattern                                                                                         | yes      |
| `FINETUNING_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_SAVE_FREQUENCY`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINETUNING_WARMUP_STEPS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FINE_GH_PAT`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FIRECRAWL_API_KEY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FIREWALL_ENABLED`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `FLASH_ATTENTION_BACKEND`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FLASH_ATTENTION_BLOCK_SIZE`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLASH_ATTENTION_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLASH_ATTENTION_TARGET_SPEEDUP`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOWISE_ENABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOW_NEXUS_API_KEY`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FLOW_NEXUS_CMD`                           |             1 | single consistent value pattern                                                                                         | yes      |
| `FLOW_NEXUS_DISABLED`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOW_NEXUS_ENABLED`                       |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FLOW_NEXUS_MCP_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOW_NEXUS_MODE`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOW_NEXUS_TOKEN`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FLOW_NEXUS_URL`                           |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FLOW_NEXUS_USER_ID`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `FORCE_HTTPS`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FP8_QUANTIZATION`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FREDDIE_MAC_API_KEY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FREERATEUPDATER_WEBHOOK_SECRET`           |             2 | single consistent value pattern                                                                                         | yes      |
| `FREERATEUPDATE_API_KEY`                   |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `FREERATEUPDATE_EMAIL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FREERATEUPDATE_WEBHOOK_URL`               |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `FREE_RATE_UPDATE_API_KEY`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FREE_RATE_UPDATE_ENABLED`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FREE_RATE_UPDATE_WEBHOOK_URL`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `FRONTEND_URL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `FRONT_BASE_URL`                           |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GDPR_ENABLED`                             |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `GEMINI_API_KEY`                           |             8 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `GEMINI_ASSISTANT_PORT`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GEMINI_ASSISTANT_URL`                     |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GEMINI_MCP_PORT`                          |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `GEMINI_MCP_URL`                           |             3 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `GEMINI_MODEL`                             |             5 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `GEMINI_VISION_MODEL`                      |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `GENERIC_TIMEZONE`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_DYNAMIC_TOOLSETS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_MCP_API_KEY`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_PAT`                                   |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GH_PERSONAL_ACCESS_TOKEN`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_PERSONAL_ACCESS_TOKEN_ALL`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_REPOSITORY_OWNER`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GH_TOKEN`                                 |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GH_TOOLSETS`                              |             1 | single consistent value pattern                                                                                         | yes      |
| `GITEA_ACTIONS_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_ADMIN_EMAIL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_ADMIN_PASSWORD`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `GITEA_ADMIN_USER`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DB_HOST`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DB_NAME`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DB_PASSWORD`                        |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GITEA_DB_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DB_TYPE`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DB_USER`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DISABLE_REGISTRATION`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_DOMAIN`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITEA_HOST`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_HTTP_PORT`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_MAILER_ENABLED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_MAILER_FROM`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_OWNER`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_PORT`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_REPO`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_REQUIRE_SIGNIN`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_ROOT_URL`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITEA_RUNNER_LABELS`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `GITEA_RUNNER_NAME`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_RUNNER_REGISTRATION_TOKEN`          |             1 | single consistent value pattern                                                                                         | yes      |
| `GITEA_RUNNER_TOKEN`                       |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GITEA_SECRET_KEY`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `GITEA_SMTP_HOST`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_SMTP_PASSWORD`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_SMTP_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_SMTP_USER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_SSH_DOMAIN`                         |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GITEA_SSH_PORT`                           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_TOKEN`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITEA_URL`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITHUB_ACTIONS`                           |             3 | env tags: ci, general; uses different values/placeholders by file/environment                                           | no/maybe |
| `GITHUB_AUTO_ISSUE_ON_ERROR`               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_BRANCH`                            |             6 | env tags: development, general, production; single consistent value pattern                                             | no/maybe |
| `GITHUB_CALLBACK_URL`                      |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `GITHUB_CHECKPOINT_BRANCH`                 |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_CLIENT_ID`                         |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | yes      |
| `GITHUB_CLIENT_SECRET`                     |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `GITHUB_INTEGRATION_ENABLED`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GITHUB_MEMORY_BACKUP_GISTS`               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_OWNER`                             |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GITHUB_PAT_TOKEN`                         |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_PR_ON_MAJOR_IMPROVEMENT`           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_REPO`                              |            13 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | no/maybe |
| `GITHUB_REPOSITORY`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GITHUB_SYNC_LEARNINGS`                    |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GITHUB_TOKEN`                             |            29 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `GITHUB_WEBHOOK_SECRET`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GIT_AUTHOR_EMAIL`                         |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GIT_AUTHOR_NAME`                          |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GIT_COMMIT`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GIT_COMMITTER_EMAIL`                      |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GIT_COMMITTER_NAME`                       |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GIT_MCP_HOST`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GIT_MCP_PORT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GOHIGHLEVEL_ACCOUNT_ID`                   |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GOHIGHLEVEL_API_KEY`                      |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GOHIGHLEVEL_API_URL`                      |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GOOGLE_API_KEY`                           |            45 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | yes      |
| `GOOGLE_APPLICATION_CREDENTIALS`           |             1 | single consistent value pattern                                                                                         | yes      |
| `GOOGLE_CALLBACK_URL`                      |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `GOOGLE_CLIENT_ID`                         |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `GOOGLE_CLIENT_SECRET`                     |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `GOOGLE_CLOUD_LOCATION`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GOOGLE_CLOUD_PROJECT`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GOOGLE_GEMINI_API_KEY`                    |            16 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `GOOGLE_GEMINI_MODEL`                      |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPT_MODEL`                                |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_3060_TAILSCALE_IP`                    |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_3090_TAILSCALE_IP`                    |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_5090_TAILSCALE_IP`                    |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_ALLOW_GROWTH`                         |             8 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_CLOCK_SPEED_LIMIT`                    |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_COMPUTE_CAPABILITY`                   |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_COMPUTE_MODE`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `GPU_CUDA_DEVICE`                          |             6 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_ENABLED`                              |             6 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_EXPORTER_PORT`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_MAX_BATCH_SIZE`                       |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_MAX_CONCURRENT`                       |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_MEMORY_CLOCK`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_MEMORY_FRACTION`                      |            12 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_MEMORY_UTIL`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_MODEL`                                |            19 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GPU_POWER_LIMIT`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_PRIORITY`                             |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_THERMAL_THRESHOLD_C`                  |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_TYPE`                                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_VRAM`                                 |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_VRAM_GB`                              |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_VRAM_MB`                              |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GPU_WORKER_1_URL`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_2_URL`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3060_ENABLED`                  |             7 | env tags: ci, general; uses different values/placeholders by file/environment                                           | yes      |
| `GPU_WORKER_3060_GPU`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `GPU_WORKER_3060_MAX_CONCURRENT`           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3060_MODEL`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GPU_WORKER_3060_MODELS`                   |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GPU_WORKER_3060_PRIORITY`                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3060_SPECIALIZATION`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3060_URL`                      |            10 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | yes      |
| `GPU_WORKER_3060_VRAM`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3090_ENABLED`                  |             7 | env tags: ci, general; uses different values/placeholders by file/environment                                           | yes      |
| `GPU_WORKER_3090_GPU`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `GPU_WORKER_3090_MAX_CONCURRENT`           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3090_MODEL`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GPU_WORKER_3090_MODELS`                   |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GPU_WORKER_3090_PRIORITY`                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3090_SPECIALIZATION`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3090_URL`                      |            10 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | yes      |
| `GPU_WORKER_3090_VRAM`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_3_URL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_5090_ENABLED`                  |             7 | env tags: ci, general; uses different values/placeholders by file/environment                                           | yes      |
| `GPU_WORKER_5090_GPU`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `GPU_WORKER_5090_MAX_CONCURRENT`           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_5090_MODEL`                    |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `GPU_WORKER_5090_MODELS`                   |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GPU_WORKER_5090_PRIORITY`                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_5090_SPECIALIZATION`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_5090_URL`                      |            10 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | yes      |
| `GPU_WORKER_5090_VRAM`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_DEFAULT_MODEL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GPU_WORKER_ID`                            |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRACEFUL_TIMEOUT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRADIENT_ACCUMULATION_STEPS`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRADIENT_CHECKPOINTING`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAFANA_ADMIN_PASSWORD`                   |            39 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | yes      |
| `GRAFANA_ADMIN_USER`                       |            20 | single consistent value pattern                                                                                         | no/maybe |
| `GRAFANA_API_KEY`                          |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GRAFANA_BIND`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAFANA_CPU_LIMIT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAFANA_ENABLED`                          |            13 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `GRAFANA_HOST`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAFANA_MEMORY_LIMIT`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRAFANA_PASSWORD`                         |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GRAFANA_PORT`                             |            34 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | no/maybe |
| `GRAFANA_PROVISIONING_PATH`                |             1 | single consistent value pattern                                                                                         | yes      |
| `GRAFANA_ROOT_URL`                         |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRAFANA_URL`                              |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GRAFANA_USER`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_API_KEY`                         |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `GRAPHITI_AUTO_EXTRACTION`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_AUTO_INDEX`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_AUTO_SNAPSHOT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_BACKEND`                         |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRAPHITI_BACKUP_DIR`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_BACKUP_ENABLED`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_BATCH_SIZE`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_COMPRESSION_ALGORITHM`           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_COMPRESSION_ENABLED`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_EMBEDDING_DIMENSIONS`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_EMBEDDING_MODEL`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_EMBEDDING_PROVIDER`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_ENABLED`                         |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRAPHITI_EXTRACTION_BATCH_SIZE`           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_EXTRACTION_MODEL`                |             2 | single consistent value pattern                                                                                         | yes      |
| `GRAPHITI_FALKORDB_HOST`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_FALKORDB_PASSWORD`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_FALKORDB_PORT`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_FALKORDB_URL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_GRAPH_NAME`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_GROUP_ID`                        |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_HOST`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_INDEX_PROPERTIES`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_MAX_NODES`                       |             3 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_MAX_RELATIONSHIPS`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_NEO4J_PASSWORD`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_NEO4J_URI`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_NEO4J_USER`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_PASSWORD`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_PORT`                            |             5 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GRAPHITI_QUERY_TIMEOUT`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_RELATIONSHIP_INFERENCE`          |             5 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_SNAPSHOT_ENABLED`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_SNAPSHOT_INTERVAL`               |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `GRAPHITI_SNAPSHOT_RETENTION_DAYS`         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_TEMPORAL_TRACKING`               |             7 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_URI`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHITI_URL`                             |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `GRAPHITI_USER`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `GRAPHQL_INTROSPECTION`                    |             3 | env tags: development, general; single consistent value pattern                                                         | no/maybe |
| `GRAPHQL_PLAYGROUND`                       |             3 | env tags: development, general; single consistent value pattern                                                         | no/maybe |
| `GROQ_API_KEY`                             |             3 | single consistent value pattern                                                                                         | no/maybe |
| `GZIP_LEVEL`                               |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `HEALTH_CHECK_ENABLED`                     |             4 | env tags: general, production; single consistent value pattern                                                          | no/maybe |
| `HEALTH_CHECK_INTERVAL`                    |            10 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `HEALTH_CHECK_INTERVAL_MINUTES`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HEALTH_CHECK_PATH`                        |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `HEALTH_CHECK_PORT`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HEALTH_CHECK_RETRIES`                     |             6 | single consistent value pattern                                                                                         | no/maybe |
| `HEALTH_CHECK_START_PERIOD`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HEALTH_CHECK_TIMEOUT`                     |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HEALTH_MONITOR_PORT`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HEAP_SIZE_MB`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HEARTBEAT_INTERVAL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HELMET_ENABLED`                           |             9 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `HF_TOKEN`                                 |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HIVEMIND_DISABLED`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HIVE_MIND_ENABLED`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HIVE_MIND_ENABLE_CONSENSUS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HIVE_MIND_QUEEN_TYPE`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HMAC_SECRET`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HMDA_LAR_SUBMISSION_ENABLED`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HMDA_REPORTING_ENABLED`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HMDA_REPORTING_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HNSW_EF`                                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `HNSW_EF_CONSTRUCTION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HNSW_ENABLED`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `HNSW_M`                                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `HNSW_SPACE`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HOOKS_CUSTOM_PATHS`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `HOOKS_ENABLED`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HOST`                                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HOSTNAME`                                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HOT_RELOAD`                               |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HOT_RELOAD_ENABLED`                       |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `HSTS_INCLUDE_SUBDOMAINS`                  |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `HSTS_MAX_AGE`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `HTTP_LOG_ENABLED`                         |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `HTTP_LOG_LEVEL`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `HUB_PAT_TOKEN`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HUB_USERNAME`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HUGGINGFACE_TOKEN`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `HUGGING_FACE_HUB_TOKEN`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `IDENTITY_PROVIDER_CERTIFICATE`            |             1 | single consistent value pattern                                                                                         | yes      |
| `IDENTITY_PROVIDER_LOGIN_URL`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `IDENTITY_PROVIDER_SHA1_FINGERPRINT`       |             1 | single consistent value pattern                                                                                         | yes      |
| `INFISICAL_ACCESS_TOKEN`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_API_URL`                        |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_AUDIT_LOGGING`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_AUTH_SECRET`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_CACHE_DIR`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_CACHE_TTL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_CLEAR_ON_EXIT`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_CLIENT_ID`                      |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `INFISICAL_CLIENT_ID_ARCHON`               |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_CLIENT_ID_CLAUDE_FLOW`          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_CLIENT_SECRET`                  |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `INFISICAL_CLIENT_SECRET_ARCHON`           |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_CLIENT_SECRET_CLAUDE_FLOW`      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_DISABLE_UPDATE_CHECK`           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_ENABLED`                        |             8 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `INFISICAL_ENCRYPTION_KEY`                 |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_ENV`                            |            13 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_ENVIRONMENT`                    |            22 | env tags: dev, development, general, prod, production; uses different values/placeholders by file/environment           | yes      |
| `INFISICAL_ENV_DEV_ID`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_ENV_PROD_ID`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_ENV_STAGING_ID`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_FOLDER_PATH`                    |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_FOLDER_PATHS`                   |             1 | single consistent value pattern                                                                                         | yes      |
| `INFISICAL_HOST_URL`                       |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_JWT_SECRET`                     |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_LOG_LEVEL`                      |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_MACHINE_ID`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_MACHINE_IDENTITY_PATH`          |             1 | single consistent value pattern                                                                                         | yes      |
| `INFISICAL_MCP_BIND`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_MCP_URL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_ORGANIZATION_ID`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_PATH`                           |            16 | env tags: general, prod; uses different values/placeholders by file/environment                                         | yes      |
| `INFISICAL_POLL_INTERVAL`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_PORT`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_POSTGRES_DB`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_POSTGRES_PASSWORD`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_POSTGRES_USER`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_PROJECT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_PROJECT_ID`                     |            36 | env tags: dev, general, prod; uses different values/placeholders by file/environment                                    | yes      |
| `INFISICAL_SITE_URL`                       |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `INFISICAL_SYNC_INTERVAL`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFISICAL_TOKEN`                          |            21 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID`       |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET`   |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `INFISICAL_WORKSPACE_ID`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFI_CLIENT_ID`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFI_CLIENT_SECRET`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INFI_PROJECT_ID`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INTEGRATION_PROTOCOL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INTEGRATION_TIMEOUT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `INTERNAL_API_KEY`                         |             2 | single consistent value pattern                                                                                         | yes      |
| `INTERNAL_NETWORK`                         |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `IP_WHITELIST`                             |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `IP_WHITELIST_ENABLED`                     |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `IS_MULTIWORKSPACE_ENABLED`                |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `JAEGER_AGENT_HOST`                        |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `JAEGER_AGENT_PORT`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `JAEGER_ENABLED`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `JAEGER_QUERY_PORT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `JEST_MAX_WORKERS`                         |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `JEST_TIMEOUT`                             |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `JOB_QUEUE_PRIORITY`                       |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `JOB_QUEUE_TYPE`                           |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `JWT_COOKIE_EXPIRE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `JWT_EXPIRATION`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `JWT_EXPIRE`                               |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `JWT_EXPIRES_IN`                           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `JWT_EXPIRY`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `JWT_REFRESH_EXPIRE`                       |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `JWT_REFRESH_EXPIRES_IN`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `JWT_REFRESH_EXPIRY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `JWT_REFRESH_SECRET`                       |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `JWT_SECRET`                               |            41 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `KEEPALIVE_TIMEOUT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `KEEP_ALIVE_TIMEOUT`                       |             5 | env tags: general, production; uses different values/placeholders by file/environment                                   | no/maybe |
| `KEEP_LOCAL_WEIGHT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `KEY_VAULTS_SECRET`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `KUBE_NAMESPACE`                           |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `KUBE_REPLICAS`                            |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `KYUTAI_LLM_API_KEY`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `KYUTAI_LLM_MODEL`                         |             2 | single consistent value pattern                                                                                         | yes      |
| `KYUTAI_LLM_URL`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LANG`                                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LANGFUSE_NEXTAUTH_SECRET`                 |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LANGFUSE_PORT`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LANGFUSE_SALT`                            |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LAN_IP`                                   |            14 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LB_HEALTH_CHECK_INTERVAL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LB_REQUEST_QUEUE_SIZE`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LB_REQUEST_TIMEOUT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LB_STRATEGY`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LC_ALL`                                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEADMAILBOX_API_KEY`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LEADMAILBOX_API_URL`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LEADMAILBOX_PASSWORD`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEADMAILBOX_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEADMAILBOX_USERNAME`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_API_URL`                             |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LEAD_CAPTURE_URL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_ASSETS_WEIGHT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_CREDIT_WEIGHT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_DEBT_WEIGHT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_EMPLOYMENT_WEIGHT`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_INCOME_WEIGHT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_THRESHOLD_A`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_THRESHOLD_B`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LEAD_SCORE_THRESHOLD_C`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDERPRICE_API_KEY`                      |             5 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `LENDERPRICE_API_URL`                      |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `LENDERPRICE_BASE_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDERPRICE_COMPANY_ID`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDERPRICE_PASSWORD`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LENDERPRICE_USERNAME`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LENDER_PRICE_API_KEY`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDER_PRICE_BASE_URL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDER_PRICE_ENABLED`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDER_PRICE_QUOTE_TIMEOUT`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGPAD_API_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGPAD_COMPANY_ID`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGPAD_PASSWORD`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGPAD_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGPAD_USERNAME`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGTREE_API_KEY`                      |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LENDINGTREE_PARTNER_ID`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LENDINGTREE_WEBHOOK_SECRET`               |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LENDINGTREE_WEBHOOK_URL`                  |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `LENDING_TREE_API_KEY`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDING_TREE_ENABLED`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LENDING_TREE_WEBHOOK_URL`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_AGENT_DEFAULT_EMBEDDING`            |             2 | single consistent value pattern                                                                                         | yes      |
| `LETTA_AGENT_DEFAULT_MODEL`                |             2 | single consistent value pattern                                                                                         | yes      |
| `LETTA_AGENT_PERSISTENCE`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_AGENT_POOLING`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_API_BIND`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_API_KEY`                            |            15 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LETTA_API_URL`                            |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `LETTA_ARCHIVAL_MEMORY`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_ARCHIVAL_MEMORY_ENABLED`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_ARCHIVAL_MEMORY_SIZE`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_AUTO_SAVE`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_AUTO_SAVE_INTERVAL`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_BACKUP_DIR`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_BACKUP_ENABLED`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_BACKUP_INTERVAL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_BASE_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_CONTEXT_WINDOW`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_CORE_MEMORY_LIMIT`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_CORE_MEMORY_SIZE`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_DB`                                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_DB_NAME`                            |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `LETTA_DB_PASSWORD`                        |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LETTA_DB_URL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_EMBEDDING_MODEL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_EMBEDDING_PROVIDER`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_ENABLED`                            |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LETTA_ENABLE_AUTH`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_HOST`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_LLM_MODEL`                          |             2 | single consistent value pattern                                                                                         | yes      |
| `LETTA_LLM_PROVIDER`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_LOG_LEVEL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_MAX_AGENTS`                         |             4 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_MCP_ENABLED`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_MCP_PORT`                           |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LETTA_MEMORY_MANAGER`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_PG_URI`                             |             1 | single consistent value pattern                                                                                         | yes      |
| `LETTA_PORT`                               |             9 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LETTA_POSTGRES_DB`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_POSTGRES_HOST`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_POSTGRES_PASSWORD`                  |             7 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LETTA_POSTGRES_PORT`                      |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LETTA_POSTGRES_URI`                       |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LETTA_POSTGRES_USER`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_RECALL_MEMORY_LIMIT`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_SAVE_INTERVAL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_SERVER_PASS`                        |             1 | single consistent value pattern                                                                                         | yes      |
| `LETTA_SERVER_PASSWORD`                    |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LETTA_SERVER_URL`                         |             5 | single consistent value pattern                                                                                         | no/maybe |
| `LETTA_URL`                                |             5 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `LITELLM_API_KEY`                          |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LITELLM_API_KEYS`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_CACHE_TTL`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_CACHING_ENABLED`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_DATABASE_URL`                     |             9 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LITELLM_DB`                               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_FALLBACK_MODELS`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_HOST`                             |             4 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_LISTEN_PORT`                      |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `LITELLM_LOG`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_LOG_LEVEL`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_MASTER_KEY`                       |            30 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LITELLM_MAX_TOKENS`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_MODE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_MODEL_FALLBACK_ORDER`             |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LITELLM_PORT`                             |            27 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `LITELLM_PROXY_REDIS_URL`                  |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LITELLM_PROXY_URL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LITELLM_SALT_KEY`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `LITELLM_UPSTREAM`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LLAMA3_1_70B_PARAMS`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LLAMA3_1_8B_PARAMS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LMCACHE_BACKEND`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LMCACHE_ENABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LMCACHE_MAX_SIZE`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LMCACHE_REDIS_URL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LMCACHE_TTL`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOAD_BALANCE_MODELS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOBECHAT_ACCESS_CODE`                     |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `LOBECHAT_PORT`                            |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LOBECHAT_URL`                             |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LOCAL_ARCHON`                             |             2 | env tags: development; single consistent value pattern                                                                  | yes      |
| `LOCAL_CLAUDE_FLOW`                        |             2 | env tags: development; single consistent value pattern                                                                  | yes      |
| `LOCAL_LB_ENABLED`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LB_HOST`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LB_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LLM_ENABLED`                        |            17 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `LOCAL_LLM_FALLBACK_TO_CLOUD`              |             4 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LLM_MAX_RETRIES`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LLM_MODELS`                         |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LOCAL_LLM_PRIORITY`                       |             8 | env tags: dev, general, prod; single consistent value pattern                                                           | no/maybe |
| `LOCAL_LLM_TIMEOUT`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LOCAL_LLM_URL`                            |             8 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `LOGFIRE_TOKEN`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `LOGGING_LEVEL`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOGIN_TOKEN_SECRET`                       |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `LOGS_PATH`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_AGGREGATION_API_KEY`                  |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `LOG_AGGREGATION_ENABLED`                  |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `LOG_AGGREGATION_URL`                      |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `LOG_CACHE_HITS`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_DIR`                                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_FILE`                                 |             9 | uses different values/placeholders by file/environment                                                                  | yes      |
| `LOG_FILE_PATH`                            |            13 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `LOG_FORMAT`                               |            21 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `LOG_INFERENCE_TIME`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_LEVEL`                                |            90 | env tags: ci, dev, development, general, prod, production, test; uses different values/placeholders by file/environment | yes      |
| `LOG_MAX_FILES`                            |            11 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `LOG_MAX_SIZE`                             |            11 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `LOG_PATH`                                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_REQUEST_DETAILS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOG_RETENTION_DAYS`                       |             5 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `LOG_TO_FILE`                              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `LOKI_ENABLED`                             |             6 | env tags: ci, general, prod; uses different values/placeholders by file/environment                                     | no/maybe |
| `LOKI_HOST`                                |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LOKI_INGESTION_RATE_MB`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LOKI_PORT`                                |            25 | env tags: dev, general, prod; single consistent value pattern                                                           | no/maybe |
| `LOKI_RETENTION_DAYS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LOKI_RETENTION_PERIOD`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LOKI_URL`                                 |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `LONG_CONTEXT_WINDOW`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_ALPHA`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_DROPOUT`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_ENABLED`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_R`                                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_RANK`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `LORA_TARGET_MODULES`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `M15R7_HOST`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `M15R7_LAN_IP`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_CPU`                              |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MACHINE_CPU_CORES`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_CPU_THREADS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_GPU_NAME`                         |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MACHINE_GPU_TYPE`                         |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_GPU_VRAM_GB`                      |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_HAS_GPU`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_HOSTNAME`                         |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_IP_ETHERNET`                      |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_IP_TAILSCALE`                     |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_IP_WAN`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `MACHINE_IP_WIFI`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_MAC_ETHERNET`                     |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_MAC_WIFI`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_MODEL`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `MACHINE_NAME`                             |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_OS`                               |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MACHINE_PURPOSE`                          |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MACHINE_RAM_GB`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_ROLE`                             |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_SPECIALIZATION`                   |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MACHINE_STORAGE`                          |             1 | single consistent value pattern                                                                                         | yes      |
| `MACHINE_TAILSCALE_DOMAIN`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_TAILSCALE_FQDN`                   |             2 | single consistent value pattern                                                                                         | yes      |
| `MACHINE_TYPE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MACHINE_USERNAME`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAC_ETHERNET`                             |            12 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAC_WIFI`                                 |            12 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAILGUN_API_KEY`                          |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `MAILGUN_DOMAIN`                           |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `MAILGUN_FROM`                             |             2 | env tags: development; single consistent value pattern                                                                  | yes      |
| `MAIN_SUBDOMAIN`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MANAGER_PORT`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_AGENTS`                               |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_AGENTS_PER_WORKFLOW`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_BATCH_SIZE`                           |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_BRANCHES`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_AGENTS`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_CONNECTIONS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_EMBEDDINGS`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_FINETUNES`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_INFERENCES`                |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_CONCURRENT_JOBS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_REQUESTS`                  |            15 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_CONCURRENT_SCRAPERS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONCURRENT_TASKS`                     |             2 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `MAX_CONNECTIONS`                          |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_CONNECTIONS_PER_USER`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_CONTEXT_LENGTH`                       |             4 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `MAX_CPU_CORES`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_DB_CONNECTIONS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_DTI_RATIO`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_FILE_SIZE`                            |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_LOAN_AMOUNT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_LTV_RATIO`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_MEMORY`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_MEMORY_GB`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_MEMORY_MB`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_MODEL_LEN`                            |             4 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_PAGE_SIZE`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_REQUESTS`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_REQUESTS_JITTER`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_RETRY_ATTEMPTS`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_SYSTEM_RAM_PERCENT`                   |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_THOUGHTS`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_TOKENS`                               |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MAX_UPLOAD_SIZE`                          |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `MAX_VRAM_USAGE_PERCENT`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MAX_WORKERS`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_BITWARDEN_PORT`                       |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_BRAVE_SEARCH_PORT`                    |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_DB_NAME`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_DB_PASSWORD`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_DB_USER`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_DIFY_PORT`                            |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_ENABLED`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_ENABLE_LOCAL_PACKAGES`                |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `MCP_FILESYSTEM_PORT`                      |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_GATEWAY_URL`                          |             3 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `MCP_GITHUB_PORT`                          |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_GITLAB_PORT`                          |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_GOOGLE_MAPS_PORT`                     |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_HOST`                                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_HOT_RELOAD`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `MCP_LOG_LEVEL`                            |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `MCP_NEXUS_HOST`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_NEXUS_LOG_LEVEL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_NEXUS_MAX_CONNECTIONS`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_NEXUS_PORT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_NEXUS_TIMEOUT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_PORT`                                 |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MCP_POSTGRES_PORT`                        |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_PROTOCOL_VERSION`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_PROXY_MODE`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_PROXY_TYPE`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_REDIS_PASSWORD`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_SENTRY_PORT`                          |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_SERVER_HOST`                          |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MCP_SERVER_NAME`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_SERVER_PORT`                          |             6 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `MCP_SERVER_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_SERVER_VERSION`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_SLACK_PORT`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_TRANSPORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MCP_TWENTYCRM_PORT`                       |             2 | single consistent value pattern                                                                                         | yes      |
| `MCP_VSCODE_PORT`                          |             2 | single consistent value pattern                                                                                         | yes      |
| `MEM0_API_KEY`                             |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `MEM0_API_URL`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_AUTO_CLEANUP`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_BACKUP_DIR`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_BACKUP_ENABLED`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_BASE_URL`                            |             4 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_CROSS_APP_SYNC`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_DATA_RETENTION_DAYS`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_DEFAULT_USER_ID`                     |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MEM0_EMBEDDING_MODEL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_EMBEDDING_PROVIDER`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_ENABLED`                             |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MEM0_ENCRYPTION`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_ENCRYPTION_KEY`                      |             2 | single consistent value pattern                                                                                         | yes      |
| `MEM0_GDPR_COMPLIANT`                      |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MEM0_HOST`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_LLM_MODEL`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `MEM0_LLM_PROVIDER`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_ORGANIZATION_ID`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_ORGANIZATION_NAME`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_PII_PROTECTION`                      |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MEM0_PII_REDACTION`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_PORT`                                |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `MEM0_POSTGRES_DB`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_POSTGRES_HOST`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_POSTGRES_PASSWORD`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_POSTGRES_PORT`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_POSTGRES_USER`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_PROFILE_SCHEMA`                      |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MEM0_REDIS_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_REST_URL`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_RETENTION_DAYS`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_SERVER_URL`                          |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MEM0_SYNC_INTERVAL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_TRACK_DECISIONS`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_TRACK_INTERACTIONS`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_TRACK_PREFERENCES`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_URL`                                 |             3 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `MEM0_USER_PERSONALIZATION`                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_VECTOR_STORE`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEM0_VECTOR_STORE_URL`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_AUTO_PERSIST`                      |             9 | env tags: ci, dev, general; uses different values/placeholders by file/environment                                      | no/maybe |
| `MEMORY_BACKEND`                           |            18 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `MEMORY_BACKUP_TO_GITHUB`                  |             7 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `MEMORY_CACHE_ONLY`                        |             6 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_CACHE_TYPE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_COMPRESSION`                       |            11 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `MEMORY_CONSOLIDATION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_ENABLE_HNSW`                       |             9 | env tags: ci, general, prod; uses different values/placeholders by file/environment                                     | no/maybe |
| `MEMORY_ENCRYPTION`                        |             2 | env tags: prod; single consistent value pattern                                                                         | no/maybe |
| `MEMORY_HNSW_EF_CONSTRUCTION`              |             4 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_HNSW_M`                            |             4 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_LIMIT`                             |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MEMORY_NAMESPACES`                        |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MEMORY_PRIMARY_STORE`                     |             7 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `MEMORY_RETENTION_DAYS`                    |             6 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `MEMORY_SECONDARY_STORE`                   |             6 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `MEMORY_SERVICE_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_SERVICE_HOST`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_SERVICE_PORT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_SERVICE_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MEMORY_SYNC_INTERVAL`                     |            18 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `MEMORY_THRESHOLD_PERCENT`                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MESSAGE_QUEUE_TYPE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METAMCP_PORT`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `METAMCP_SSE_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METAMCP_WS_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METRICS_ENABLED`                          |             7 | env tags: development, general; single consistent value pattern                                                         | no/maybe |
| `METRICS_ENDPOINT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METRICS_EXPORT_INTERVAL`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METRICS_EXPORT_PORT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `METRICS_PORT`                             |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `METRICS_RETENTION_DAYS`                   |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MFA_ISSUER`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MICROSOFT_CALLBACK_URL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MICROSOFT_CLIENT_ID`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `MICROSOFT_CLIENT_SECRET`                  |             1 | single consistent value pattern                                                                                         | yes      |
| `MINIO_API_PORT`                           |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MINIO_CONSOLE_PORT`                       |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MINIO_ROOT_PASSWORD`                      |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `MINIO_ROOT_USER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MIN_BATCH_SIZE`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MIN_CREDIT_SCORE`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MIN_DISK_SPACE_GB`                        |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MIN_FREE_RAM_GB`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MIN_FREE_VRAM_GB`                         |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MIN_LOAN_AMOUNT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MIN_TLS_VERSION`                          |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `MISTRAL_7B_PARAMS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MISTRAL_API_KEY`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MIXED_PRECISION`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MIXTRAL_8X22B_PARAMS`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MIXTRAL_8X7B_PARAMS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MOCK_AWS`                                 |             5 | env tags: ci, dev, general; single consistent value pattern                                                             | no/maybe |
| `MOCK_SENDGRID`                            |             5 | env tags: ci, dev, general; single consistent value pattern                                                             | no/maybe |
| `MOCK_SERVICES`                            |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `MOCK_STRIPE`                              |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `MOCK_TWILIO`                              |             5 | env tags: ci, dev, general; single consistent value pattern                                                             | no/maybe |
| `MODE`                                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MODEL_AFFINITY_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MODEL_CACHE_DIR`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MODEL_CACHE_SIZE_GB`                      |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MODEL_DTYPE`                              |             4 | single consistent value pattern                                                                                         | no/maybe |
| `MODEL_MANAGER_PORT`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `MODEL_NAME`                               |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MODEL_ROUTING_COST_THRESHOLD`             |             6 | single consistent value pattern                                                                                         | no/maybe |
| `MODEL_ROUTING_FALLBACK_CLOUD`             |            18 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MODEL_ROUTING_PREFER_LOCAL`               |            18 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `MODEL_ROUTING_STRATEGY`                   |            14 | env tags: dev, general, prod; single consistent value pattern                                                           | no/maybe |
| `MOE_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MOE_EXPERT_COUNT`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `MOE_LOAD_BALANCING`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MOE_SPECIALIZATION`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MOE_TOP_K`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MOLTBOT_WEB_PORT`                         |             9 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MONGODB_DATABASE`                         |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `MONGODB_HOST`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONGODB_INITDB_ROOT_PASSWORD`             |             1 | single consistent value pattern                                                                                         | yes      |
| `MONGODB_INITDB_ROOT_USERNAME`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONGODB_PASSWORD`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `MONGODB_PORT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONGODB_URI`                              |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `MONGODB_URI_TEST`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONGODB_URL`                              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `MONGODB_USERNAME`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONGO_PORT`                               |             9 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MONGO_ROOT_PASSWORD`                      |            14 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `MONGO_ROOT_USER`                          |             9 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `MONITORING_ALERT_CPU`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONITORING_ALERT_DISK`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONITORING_ALERT_MEMORY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MONITORING_ENABLED`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `MORTGAGE_ADMIN_EMAIL`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `N8N_API_KEY`                              |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `N8N_BACKUP_PATH`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_BASE_URL`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `N8N_BASIC_AUTH_ACTIVE`                    |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `N8N_BASIC_AUTH_PASSWORD`                  |            28 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `N8N_BASIC_AUTH_USER`                      |            26 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `N8N_BINARY_DATA_TTL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_COMMUNITY_PACKAGES_ENABLED`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DATABASE_URL`                         |             1 | single consistent value pattern                                                                                         | yes      |
| `N8N_DATA_PATH`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB`                                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_HOST`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_NAME`                              |             7 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `N8N_DB_PASSWORD`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_PORT`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_TYPE`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_URL`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DB_USER`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DEFAULT_BINARY_DATA_MODE`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_DISABLE_UI`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EDITOR_BASE_URL`                      |             8 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `N8N_ENABLED`                              |             5 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_ENCRYPTION_KEY`                       |            28 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `N8N_EXECUTIONS_DATA_MAX_AGE`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTIONS_DATA_PRUNE`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTIONS_DATA_SAVE_ON_ERROR`        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS`      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTIONS_TIMEOUT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTIONS_TIMEOUT_MAX`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXECUTION_MODE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_EXTRA_PACKAGES`                       |             1 | single consistent value pattern                                                                                         | yes      |
| `N8N_HOST`                                 |            21 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `N8N_LOG_FILE`                             |             1 | single consistent value pattern                                                                                         | yes      |
| `N8N_LOG_LEVEL`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_LOG_OUTPUT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_METRICS`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_METRICS_PREFIX`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_PASSWORD`                             |             2 | single consistent value pattern                                                                                         | yes      |
| `N8N_PORT`                                 |            24 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `N8N_POSTGRES_DB`                          |             4 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_POSTGRES_HOST`                        |             4 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_POSTGRES_PASSWORD`                    |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `N8N_POSTGRES_PORT`                        |             4 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_POSTGRES_USER`                        |             4 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_PROTOCOL`                             |            16 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `N8N_PUBLIC_BASE_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_TOKEN`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_URL`                                  |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `N8N_VERSION`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `N8N_WEBHOOK_URL`                          |            13 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `N8N_WEB_BIND`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NAMESPACE_CLAUDE_FLOW`                    |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NAMESPACE_DESKTOP_COMMANDER`              |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NAMESPACE_FLOW_NEXUS`                     |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NAMESPACE_RUV_SWARM`                      |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NCCL_DEBUG`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NCCL_TIMEOUT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_AUTH`                               |             1 | single consistent value pattern                                                                                         | yes      |
| `NEO4J_AUTH_PASSWORD`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_AUTH_USER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_BOLT_PORT`                          |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_DATABASE`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEO4J_ENABLED`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_HOST`                               |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NEO4J_HTTPS_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_HTTP_PORT`                          |             6 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `NEO4J_INITIAL_HEAP_SIZE`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_MAX_HEAP_SIZE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEO4J_PASSWORD`                           |            13 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `NEO4J_PORT`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `NEO4J_URI`                                |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEO4J_URL`                                |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `NEO4J_USER`                               |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NEO4J_USERNAME`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NETWORK_DRIVER`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NETWORK_NAME`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_BATCH_SIZE`                        |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEURAL_DATA_PATH`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_ERROR_PREVENTION_THRESHOLD`        |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_FLASH_ATTENTION`                   |            13 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `NEURAL_LEARNING_RATE`                     |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_MODEL_OPTIMIZATION`                |             4 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_OPTIMIZATION_ENABLED`              |            14 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `NEURAL_PATTERNS_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_PERFORMANCE_AUTO_TUNE`             |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEURAL_QUANTIZATION`                      |            12 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `NEURAL_UPDATE_FREQUENCY`                  |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_API_BASE_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_API_KEY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_API_URL`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_BASE_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_DEBUG`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_DIFY_APP_ID`                  |             4 | env tags: general, local; uses different values/placeholders by file/environment                                        | no/maybe |
| `NEXT_PUBLIC_DIFY_WIDGET_URL`              |             4 | env tags: general, local; uses different values/placeholders by file/environment                                        | no/maybe |
| `NEXT_PUBLIC_ENABLE_CALCULATOR`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_ENABLE_CHAT`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_GA_TRACKING_ID`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_GTM_ID`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_NEXUS_URL`                    |             5 | env tags: general, local; uses different values/placeholders by file/environment                                        | no/maybe |
| `NEXT_PUBLIC_SITE_NAME`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_SITE_URL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_PUBLIC_TWENTY_URL`                   |             2 | env tags: general, local; single consistent value pattern                                                               | no/maybe |
| `NEXT_PUBLIC_WS_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXT_TELEMETRY_DISABLED`                  |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_ADMIN_TOKEN`                        |            13 | uses different values/placeholders by file/environment                                                                  | yes      |
| `NEXUS_API_URL`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_BASE_URL`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_CIRCUIT_BREAKER_ENABLED`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_CIRCUIT_BREAKER_THRESHOLD`          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_CIRCUIT_BREAKER_TIMEOUT`            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_CPU_LIMIT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_ENABLE_TELEMETRY`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_FALLBACK_ENABLED`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_FALLBACK_RETRIES`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_HEALTH_CHECK_ENABLED`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_HEALTH_CHECK_INTERVAL`              |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEXUS_HEALTH_CHECK_TIMEOUT`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_JWT_SECRET`                         |            11 | uses different values/placeholders by file/environment                                                                  | yes      |
| `NEXUS_LOAD_BALANCING`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_LOG`                                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_LOG_LEVEL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_MCP_PORT`                           |            11 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NEXUS_MCP_URL`                            |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEXUS_MEMORY_LIMIT`                       |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEXUS_METRICS_PORT`                       |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `NEXUS_METRICS_URL`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_MONITORING_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_PORT`                               |            13 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `NEXUS_REDIS_URL`                          |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `NEXUS_ROUTER_API_KEY`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEXUS_ROUTER_BIND`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_ROUTER_ENABLED`                     |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NEXUS_ROUTER_HOST`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_ROUTER_MCP_BIND`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NEXUS_ROUTER_MCP_PORT`                    |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `NEXUS_ROUTER_PORT`                        |            24 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NEXUS_ROUTER_URL`                         |            29 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `NEXUS_URL`                                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NGINX_MEMORY_LIMIT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NGINX_PORT`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NGINX_SSL_PORT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NMLS_VALIDATION_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NODE_ENV`                                 |            97 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `NODE_EXPORTER_PORT`                       |             5 | single consistent value pattern                                                                                         | no/maybe |
| `NODE_OPTIONS`                             |             7 | env tags: general, prod; uses different values/placeholders by file/environment                                         | yes      |
| `NODE_VERSION`                             |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NOTIFICATION_EMAIL_ENABLED`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NOTIFICATION_PUSH_ENABLED`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NOTIFICATION_SMS_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NOTIFICATION_WEBHOOK_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NOTION_API_KEY`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NOTION_TOKEN`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NVIDIA_DCGM_EXPORTER_PORT`                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NVIDIA_DRIVER_CAPABILITIES`               |            12 | uses different values/placeholders by file/environment                                                                  | yes      |
| `NVIDIA_EXPORTER_HOST`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NVIDIA_EXPORTER_INTERVAL`                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NVIDIA_EXPORTER_PORT`                     |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NVIDIA_GPU_MONITORING`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `NVIDIA_SMI_INTERVAL`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NVIDIA_VISIBLE_DEVICES`                   |            16 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_ADMIN_DOMAIN`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_ADMIN_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_ALLOWED_CHANNELS`                    |             8 | single consistent value pattern                                                                                         | yes      |
| `NYRA_API_KEY`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_CAMPAIGN_AUTOMATION_ENABLED`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_CAMPAIGN_ENGINE_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_CHAT_INTERNAL_API_BASE_URL`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_COMPLIANCE_TRACKING_ENABLED`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_DOMAIN_ROOT`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_ENVIRONMENT`                         |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_ESCALATION_EMAIL`                    |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `NYRA_FORCE_SECRETS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_HTTP_ALLOWLIST`                      |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_INTEGRATION_ENABLED`                 |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `NYRA_LEAD_SCORING_ENABLED`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_MACHINE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_MCP_PORT`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_NETWORK`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_NETWORK_NAME`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_NEXUS_ROUTER_URL`                    |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NYRA_NODE_ID`                             |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_NODE_TYPE`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_ORCHESTRATOR_HOST`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_ORCHESTRATOR_PORT`                   |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_ORCHESTRATOR_TUNNEL_ID_CHANGE_TEMP`  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_PC_ID`                               |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `NYRA_PC_ROLE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_POLICY_MODE`                         |             8 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_POSTGRES_PASSWORD`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_POSTGRES_PORT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_PUBLIC_BASE_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_QUOTE_ENGINE_URL`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_QUOTE_INTEGRATION_ENABLED`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_REDIS_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `NYRA_STACK_NAME`                          |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `NYRA_WEBHOOK_SECRET`                      |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `OAUTH_CLIENT_ID`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OAUTH_CLIENT_SECRET`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OAUTH_ENABLED`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OAUTH_PROVIDER`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OCR_CONFIDENCE_THRESHOLD`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OCR_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OCR_LANGUAGE`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3060_HOST`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3060_NUM_GPU`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3060_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3060_URL`                          |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_3090_HOST`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3090_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_3090_URL`                          |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_API`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_API_BASE_URL`                      |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `OLLAMA_BASE_URL`                          |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_BATCH_SIZE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_BIND`                              |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_CONTEXT_SIZE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_DATA_DIR`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_DEBUG`                             |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_EMBEDDING_MODEL`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_ENABLED`                           |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `OLLAMA_FLASH_ATTENTION`                   |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_GPU_LAYERS`                        |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_GPU_MEMORY_FRACTION`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_HOST`                              |            19 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_INFERENCE_TIMEOUT`                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_INTERNAL_URL`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_KEEP_ALIVE`                        |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_KV_CACHE_TYPE`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_LOAD_TIMEOUT`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_MAX_LOADED_MODELS`                 |            11 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_MAX_QUEUE`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MAX_VRAM`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MCP_HOST`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MCP_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MODEL`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MODELS`                            |            15 | uses different values/placeholders by file/environment                                                                  | yes      |
| `OLLAMA_MODELS_DIR`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_MODELS_PATH`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_NUM_CTX`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_NUM_GPU`                           |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_NUM_GPU_LAYERS`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_NUM_PARALLEL`                      |            10 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_NUM_THREAD`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_OPTIMIZATION_LEVEL`                |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OLLAMA_ORIGINS`                           |             3 | single consistent value pattern                                                                                         | yes      |
| `OLLAMA_PORT`                              |            13 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_PROXY_TIMEOUT`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_ROPE_FREQ_BASE`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_ROPE_FREQ_SCALE`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OLLAMA_URL`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_API_URL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_BATCH_SIZE`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_INTERNAL_URL`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_MODEL_PATH`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_QUANTIZATION`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_DEVICE`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_ENABLED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_INTER_OP_THREADS`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_INTRA_OP_THREADS`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_LOG_LEVEL`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ONNX_RUNTIME_PROVIDER`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENAI_API_BASE`                          |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `OPENAI_API_KEY`                           |            56 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `OPENAI_BASE_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENAI_EMBEDDING_DIMENSIONS`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENAI_EMBEDDING_MODEL`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OPENAI_MODEL`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENAI_ORG_ID`                            |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `OPENCLAW_COMPOSE_VALIDATE`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_CONFIG_PATH`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_DATA_DIR`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_DOCKER_APT_PACKAGES`             |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `OPENCLAW_FORCE_BUILD`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_GATEWAY_PORT`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_GATEWAY_TOKEN`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_HEALTH_TIMEOUT_S`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_HOME_VOLUME`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_HTTP_ALLOWLIST`                  |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_INSTALL_BROWSER`                 |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPENCLAW_MVP_IMAGE`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_MVP_PORT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_OPENAI_BASE_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST`         |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_PORTS`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_PROVIDER`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_PUBLIC_BASE_URL`                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPENCLAW_SANDBOX_ENABLED`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_SECRET_REF_MODE`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_SESSION_PATH`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_TOOLS_ALLOW`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_TOOLS_DENY`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_TOOL_POLICY`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_UI_PREFIX`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_UI_PROXY_PORT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENCLAW_WEBHOOK_INGRESS_PATH`            |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENCLAW_WORKSPACE_VOLUME`                |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENMEMORY_API_KEY`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPENMEMORY_API_URL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_BACKUP_DESTINATION`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_BACKUP_DIR`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_BACKUP_ENABLED`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_CLOUD_BACKUP`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_CROSS_APP_SHARING`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_DB_URL`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_ENABLED`                       |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPENMEMORY_ENCRYPTION`                    |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_ENCRYPTION_KEY`                |             2 | single consistent value pattern                                                                                         | yes      |
| `OPENMEMORY_MAX_MEMORIES_PER_USER`         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_MAX_USERS`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_MCP_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_MCP_PORT`                      |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `OPENMEMORY_MCP_SERVER`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_PERSISTENCE`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_PERSISTENCE_DIR`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_PORT`                          |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `OPENMEMORY_POSTGRES_DB`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_POSTGRES_HOST`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_POSTGRES_PASSWORD`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_POSTGRES_PORT`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_POSTGRES_USER`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_SERVER_URL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_SHARED_MEMORY`                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_SYNC_INTERVAL`                 |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPENMEMORY_URL`                           |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `OPENMEMORY_USER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENMEMORY_VECTOR_STORE`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENROUTER_API_KEY`                       |            70 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | yes      |
| `OPENROUTER_BASE_URL`                      |            10 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `OPENROUTER_FALLBACK_MODEL`                |             6 | single consistent value pattern                                                                                         | no/maybe |
| `OPENROUTER_MAX_TOKENS`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPENROUTER_MODEL`                         |             7 | single consistent value pattern                                                                                         | no/maybe |
| `OPENROUTER_SITE_NAME`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `OPENROUTER_SITE_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENWEBUI_DATA`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPENWEBUI_PORT`                           |            13 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `OPEN_WEBUI_ENABLED`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPEN_WEBUI_PORT`                          |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `OPEN_WEBUI_URL`                           |             2 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `OPTIMAL_BLUE_API_KEY`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPTIMAL_BLUE_API_URL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `OPTIMAL_BLUE_BASE_URL`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OPTIMAL_BLUE_CLIENT_ID`                   |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `OPTIMAL_BLUE_ENVIRONMENT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ORACLE_INSTANCE_IP`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ORACLE_REGION`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ORCHESTRATION_MODE`                       |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ORCHESTRATOR_API_KEY`                     |             3 | single consistent value pattern                                                                                         | yes      |
| `ORCHESTRATOR_HOST`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ORCHESTRATOR_IP`                          |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `ORCHESTRATOR_MODE`                        |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ORCHESTRATOR_PORT`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ORCHESTRATOR_PROMETHEUS_URL`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ORCHESTRATOR_TAILSCALE_IP`                |             5 | single consistent value pattern                                                                                         | no/maybe |
| `ORCHESTRATOR_URL`                         |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ORCH_HOST`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ORCH_LAN_IP`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OTEL_EXPORT_TYPE`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OTEL_TELEMETRY_COLLECTION_ENABLED`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OWUI_PASSWORD`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `OWUI_USERNAME`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `PAGERDUTY_API_KEY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PAGERDUTY_INTEGRATION_KEY`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PAGERDUTY_SERVICE_KEY`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `PARALLEL_PROCESSING`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PASSWORD_RESET_EXPIRY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PASSWORD_RESET_TIMEOUT`                   |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `PASSWORD_RESET_TOKEN_EXPIRE`              |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `PATTERN_DISTILLATION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC2_INFERENCE_FALLBACK`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC2_LITELLM_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC2_LOAD_THRESHOLD`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC2_OLLAMA_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC2_ORCHESTRATOR_IP`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC3_LOAD_THRESHOLD`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC3_MEMORY_SERVICE_PORT`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC3_OLLAMA_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC3_ORCHESTRATOR_IP`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC3_VLLM_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC4_INFERENCE_FALLBACK`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC4_OLLAMA_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC4_ORCHESTRATOR_IP`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC4_VLLM_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PC_NAME`                                  |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PC_ROLE`                                  |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PERF_MONITOR_PORT`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PERF_TARGET_COMMAND_EXECUTION`            |             5 | single consistent value pattern                                                                                         | no/maybe |
| `PERF_TARGET_MCP_RESPONSE`                 |             4 | single consistent value pattern                                                                                         | no/maybe |
| `PERF_TARGET_MEMORY_OPERATIONS`            |             5 | single consistent value pattern                                                                                         | no/maybe |
| `PERF_TARGET_NEURAL_PREDICTIONS`           |             5 | single consistent value pattern                                                                                         | no/maybe |
| `PERPLEXITY_API_KEY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PGADMIN_EMAIL`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `PGADMIN_PASSWORD`                         |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `PGADMIN_PORT`                             |             3 | single consistent value pattern                                                                                         | no/maybe |
| `PG_DATABASE_HOST`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PG_DATABASE_NAME`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PG_DATABASE_URL`                          |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `PG_DATABASE_USER`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PII_ENCRYPTION_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PII_MASKING_ENABLED`                      |             3 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `PORT`                                     |            31 | env tags: dev, development, general, local; uses different values/placeholders by file/environment                      | no/maybe |
| `PORT_ACTIVEPIECES`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PORT_DIFY`                                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PORT_LETTA`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PORT_LITELLM`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PORT_N8N`                                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PORT_RANGE_END`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PORT_RANGE_START`                         |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PORT_TWENTYCRM`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_BIND`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_CPU_LIMIT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_DB`                              |            45 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `POSTGRES_HOST`                            |            24 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `POSTGRES_INITDB_ARGS`                     |             1 | single consistent value pattern                                                                                         | yes      |
| `POSTGRES_MAX_CONNECTIONS`                 |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `POSTGRES_MEMORY_LIMIT`                    |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `POSTGRES_PASSWORD`                        |            53 | env tags: dev, general, local; uses different values/placeholders by file/environment                                   | yes      |
| `POSTGRES_POOL_SIZE`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_PORT`                            |            41 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `POSTGRES_SHARED_BUFFERS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_SUPER_PASSWORD`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `POSTGRES_URL`                             |             9 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | yes      |
| `POSTGRES_USER`                            |            49 | env tags: dev, general, local; uses different values/placeholders by file/environment                                   | yes      |
| `PREFETCH_THRESHOLD`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PREFLIGHT_CONTINUE`                       |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `PRIMARY_IP`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PRIMARY_MODEL`                            |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PRIMARY_MODELS`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `PRIMARY_MODEL_SIZE`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PRIMARY_MODEL_VRAM`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PRIMARY_NETWORK_INTERFACE`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PRIMARY_ORCHESTRATOR`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PRIORITY_QUEUE_DEPTH`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROD`                                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROD_PORT`                                |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `PROFILE_PORT`                             |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PROFILING_ENABLED`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PROJECT_ENV`                              |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `PROJECT_NAME`                             |             8 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `PROJECT_REGION`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PROJECT_VERSION`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_BIND`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_ENABLED`                       |            24 | env tags: ci, dev, general, prod, production; uses different values/placeholders by file/environment                    | no/maybe |
| `PROMETHEUS_HOST`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_NODE_EXPORTER_PORT`            |             4 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_PORT`                          |            48 | env tags: dev, general, prod, production; uses different values/placeholders by file/environment                        | no/maybe |
| `PROMETHEUS_PUSHGATEWAY`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_PUSH_GATEWAY`                  |            10 | uses different values/placeholders by file/environment                                                                  | yes      |
| `PROMETHEUS_REMOTE_WRITE_URL`              |             3 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_RETENTION`                     |             8 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `PROMETHEUS_RETENTION_DAYS`                |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PROMETHEUS_RETENTION_TIME`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_SCRAPE_INTERVAL`               |             4 | single consistent value pattern                                                                                         | no/maybe |
| `PROMETHEUS_URL`                           |             5 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `PROMTAIL_PORT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PROVIDER`                                 |            14 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `PROXY_PORT`                               |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `PUBLIC_ADMIN_URL`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_BROKER_PORTAL_URL`                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_CRM_URL`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_FLOWS_URL`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_FLOW_DASHBOARD_URL`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_GRAFANA_URL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_IP`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_LANDING_URL`                       |             5 | single consistent value pattern                                                                                         | no/maybe |
| `PUBLIC_N8N_URL`                           |             3 | single consistent value pattern                                                                                         | no/maybe |
| `PYTHON_ENV`                               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `PYTHON_VERSION`                           |             3 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_API_KEY`                           |            15 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `QDRANT_BIND`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_COLLECTION`                        |             5 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `QDRANT_COLLECTION_NAME`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_DISTANCE`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_DISTANCE_METRIC`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_ENABLED`                           |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `QDRANT_GRPC_PORT`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_GRPC_URL`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_HOST`                              |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `QDRANT_INDEXING_THRESHOLD`                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_LOCAL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_LOCALHOST_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_ON_DISK_PAYLOAD`                   |             3 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_OPTIMIZATION_ENABLED`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_OPTIMIZE_INTERVAL`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_PAYLOAD_INDEXING`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_PERSISTENCE_DIR`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_PORT`                              |            13 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `QDRANT_SNAPSHOT_DIR`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_SNAPSHOT_ENABLED`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QDRANT_URL`                               |            10 | env tags: dev, development, general; uses different values/placeholders by file/environment                             | no/maybe |
| `QDRANT_VECTOR_SIZE`                       |             6 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `QUANTIZATION_FORMAT`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `QUERY_CACHE_ENABLED`                      |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `QUERY_CACHE_TTL`                          |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUERY_TIMEOUT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUEUE_ATTEMPTS`                           |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUEUE_BACKOFF_DELAY`                      |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUEUE_BULL_REDIS_HOST`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUEUE_BULL_REDIS_PASSWORD`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUEUE_BULL_REDIS_PORT`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUEUE_CONCURRENCY`                        |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUEUE_DEFAULT_JOB_OPTIONS`                |             1 | single consistent value pattern                                                                                         | yes      |
| `QUEUE_PROCESSING_DELAY`                   |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUEUE_REDIS_URL`                          |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `QUEUE_SIZE`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUEUE_STRATEGY`                           |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `QUEUE_TIMEOUT`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUIC_SYNC_PORT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_PORT`                           |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `QUOTE_API_POSTGRES_DB`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_POSTGRES_HOST`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_POSTGRES_PORT`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_REDIS_DB`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_REDIS_HOST`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_REDIS_PORT`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_API_URL`                            |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `QUOTE_ENGINE_HOST`                        |             4 | single consistent value pattern                                                                                         | no/maybe |
| `QUOTE_ENGINE_PORT`                        |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `QUOTE_ENGINE_URL`                         |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `QWEN2_5_32B_PARAMS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `QWEN2_5_72B_PARAMS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RABBITMQ_EXCHANGE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RABBITMQ_MANAGEMENT_PORT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RABBITMQ_PASSWORD`                        |             1 | single consistent value pattern                                                                                         | yes      |
| `RABBITMQ_QUEUE`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RABBITMQ_URL`                             |             1 | single consistent value pattern                                                                                         | yes      |
| `RABBITMQ_USER`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RAG_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RAG_SIMILARITY_THRESHOLD`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RAG_TOP_K`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RAM_RESERVED_FOR_OS_GB`                   |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RATEHUNTER_DOMAIN`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATEHUNTER_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_CACHE_KEY_PREFIX`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_CHANGE_THRESHOLD`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_CHECK_INTERVAL_MINUTES`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_COMPARISON_API_URL`                  |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RATE_LIMIT`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_LIMITING_ENABLED`                    |            14 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `RATE_LIMIT_DURATION`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_LIMIT_ENABLED`                       |            10 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `RATE_LIMIT_MAX`                           |            12 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `RATE_LIMIT_MAX_REQUESTS`                  |            16 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | no/maybe |
| `RATE_LIMIT_POINTS`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_LIMIT_REQUESTS`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RATE_LIMIT_REQUESTS_PER_MINUTE`           |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RATE_LIMIT_SKIP_SUCCESSFUL`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_LIMIT_WINDOW`                        |            20 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `RATE_LIMIT_WINDOW_MINUTES`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_LIMIT_WINDOW_MS`                     |            10 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `RATE_LOCK_DURATION_DAYS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RATE_PROVIDER_API_KEY`                    |             2 | single consistent value pattern                                                                                         | yes      |
| `RATE_PROVIDER_API_URL`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `REASONINGBANK_DB_PATH`                    |             7 | uses different values/placeholders by file/environment                                                                  | yes      |
| `REASONINGBANK_ENABLED`                    |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `REASONINGBANK_K`                          |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `REASONINGBANK_MIN_CONFIDENCE`             |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RECOVERY_CHECK_INTERVAL`                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_BIND`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_CACHE_TTL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_CPU_LIMIT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_DB`                                 |            16 | env tags: dev, development, general, production; single consistent value pattern                                        | no/maybe |
| `REDIS_ENABLED`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_EVICTION_POLICY`                    |            11 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `REDIS_HOST`                               |            30 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | no/maybe |
| `REDIS_INTERNAL_URL`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_MAXMEMORY`                          |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `REDIS_MAXMEMORY_POLICY`                   |             4 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_MAX_CONNECTIONS`                    |             5 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `REDIS_MAX_MEMORY`                         |            15 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `REDIS_MEMORY_LIMIT`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `REDIS_MIN_CONNECTIONS`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REDIS_PASSWORD`                           |            59 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `REDIS_PORT`                               |            49 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | yes      |
| `REDIS_TLS`                                |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `REDIS_TTL`                                |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `REDIS_URL`                                |            38 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `REFRESH_TOKEN_DURATION`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REFRESH_TOKEN_SECRET`                     |             2 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `REGION`                                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REGISTER_WITH_GATEWAY`                    |             3 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `RELOAD`                                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REPLICATE_API_KEY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REQUEST_ID_HEADER`                        |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `REQUEST_TIMEOUT`                          |            19 | env tags: ci, general, prod, production; uses different values/placeholders by file/environment                         | no/maybe |
| `RESEND_API_KEY`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RESEND_ENABLED`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RESEND_FROM_EMAIL`                        |             2 | single consistent value pattern                                                                                         | yes      |
| `RESPA_TIMELINE_DAYS`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RETENTION_POLICY_DAYS`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `RETRY_DELAY_MS`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `REVIEW_LABEL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REVIEW_MAX_CHARS`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `REVIEW_MODEL`                             |             1 | single consistent value pattern                                                                                         | yes      |
| `REVIEW_POST_AS_REVIEW`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ROCKET_MORTGAGE_API_KEY`                  |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `ROCKET_MORTGAGE_API_URL`                  |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `ROCKET_MORTGAGE_BASE_URL`                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `ROCKET_MORTGAGE_CLIENT_ID`                |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ROCKET_MORTGAGE_CLIENT_SECRET`            |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `ROCKET_MORTGAGE_ENABLED`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ROCKET_MORTGAGE_ENVIRONMENT`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ROCKET_MORTGAGE_PARTNER_ID`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `ROO_DISABLED`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ROUND_ROBIN_MODELS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ROUTE_ALL_AI_THROUGH_NEXUS`               |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `ROUTE_REQUESTS_THROUGH_NEXUS`             |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `RTX3090TI_HOST`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RTX3090TI_LAN_IP`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUFLO_BOOTSTRAP`                          |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `RUFLO_START_SYSTEM`                       |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `RUFLO_TOPOLOGY`                           |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `RUFLO_VERSION`                            |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `RUVECTOR_API_KEY`                         |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `RUVECTOR_AUTH_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_AUTH_KEY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_AUTO_DISTILL_ENABLED`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_DIR`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_ENABLED`                  |             5 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_INTERVAL`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_INTERVAL_SECONDS`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_PATH`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BACKUP_RETENTION`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BATCH_SIZE`                      |             5 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_BIND`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CACHE_SIZE_MB`                   |             5 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_COHERE_API_KEY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_COMPRESSION`                     |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_COMPRESSION_LEVEL`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CONSENSUS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CONSENSUS_ENABLED`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CONSENSUS_PEERS`                 |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `RUVECTOR_CONSENSUS_PROTOCOL`              |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CONSENSUS_QUORUM`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_COORDINATOR`                     |             6 | single consistent value pattern                                                                                         | yes      |
| `RUVECTOR_CORS_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_CORS_ORIGINS`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `RUVECTOR_DATA_DIR`                        |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_DEBUG`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_DEFAULT_LIMIT`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_DEV_MODE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_DISTANCE_METRIC`                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_DISTILLATION_INTERVAL`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EF_CONSTRUCTION`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EF_SEARCH`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EMBEDDING_MODEL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EMBEDDING_PROVIDER`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_ENABLED`                         |            18 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_ENCRYPTION_ENABLED`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_ENCRYPTION_KEY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EWC_ENABLED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EWC_GAMMA`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_EWC_LAMBDA`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_FLASH_ATTENTION_BLOCK_SIZE`      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_FLASH_ATTENTION_ENABLED`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_GNN_LAYERS`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_GRPC_PORT`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HEALTH_CHECK_ENABLED`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HEALTH_CHECK_INTERVAL`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HNSW_EF_CONSTRUCTION`            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HNSW_M`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HOST`                            |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_HTTP_PORT`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_HYBRID_ALPHA`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_HYBRID_SEARCH_ENABLED`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_INDEX_EF_CONSTRUCTION`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_INDEX_EF_SEARCH`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_INDEX_M`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_INDEX_METRIC`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_INDEX_TYPE`                      |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_JAEGER_ENDPOINT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_KEEPALIVE_TIMEOUT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_LEADER`                          |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_LOCAL_MODEL_PATH`                |             1 | single consistent value pattern                                                                                         | yes      |
| `RUVECTOR_LOG_DIR`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_LOG_FORMAT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_LOG_LEVEL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_M`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MAX_CONNECTIONS`                 |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MAX_LIMIT`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MAX_MEMORY_GB`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MAX_REQUEST_SIZE_MB`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_METRICS_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_METRICS_PORT`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MIN_SIMILARITY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_MODE`                            |            18 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_NODE_ID`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_OPENAI_API_KEY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_PATTERN_NAMESPACE`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_PEER_ID`                         |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUVECTOR_PERSISTENCE_DIR`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_PGADMIN_PORT`                    |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `RUVECTOR_PORT`                            |            20 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `RUVECTOR_POSTGRES_DB`                     |            10 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `RUVECTOR_POSTGRES_PASSWORD`               |            14 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `RUVECTOR_POSTGRES_PORT`                   |             8 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `RUVECTOR_POSTGRES_USER`                   |            10 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `RUVECTOR_PROFILING_ENABLED`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_API_KEY`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_COLLECTION`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_GRPC_PORT`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_HOST`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QDRANT_PORT`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUANTIZATION`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUANTIZATION_BITS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUANTIZATION_ENABLED`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUANTIZATION_TYPE`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUERY_CACHE_ENABLED`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_QUERY_CACHE_TTL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_RAFT_ELECTION_TIMEOUT`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_RAFT_HEARTBEAT_INTERVAL`         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_RAFT_SNAPSHOT_INTERVAL`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_RANDOM_SEED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REASONINGBANK_ENABLED`           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_DB`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_ENABLED`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_HOST`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_PASSWORD`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_PORT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REDIS_PREFIX`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_REQUEST_TIMEOUT`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SNAPSHOT_DIR`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `RUVECTOR_SNAPSHOT_ENABLED`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SNAPSHOT_INTERVAL`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SONA_ADAPTATION_INTERVAL`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SONA_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SONA_LEARNING_RATE`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_SONA_OPTIMIZATION_TARGET`        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_STORAGE_PATH`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_THREAD_POOL_SIZE`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_TLS_CERT_PATH`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_TLS_ENABLED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_TLS_KEY_PATH`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_TRACING_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_TRAJECTORY_NAMESPACE`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_URL`                             |             6 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `RUVECTOR_VECTOR_DIM`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_VECTOR_DIMENSIONS`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_VERSION`                         |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `RUVECTOR_WAL_BUFFER_SIZE`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_WAL_ENABLED`                     |             4 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_WAL_SYNC_INTERVAL`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUVECTOR_WORKER_THREADS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_FAST_NETWORKING`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_CMD`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `RUV_SWARM_DAA_ENABLED`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_DISTRIBUTED`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_ENABLED`                        |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUV_SWARM_ENABLE_SIMD`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_LOG_LEVEL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_MAX_AGENTS`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUV_SWARM_MCP_PORT`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_MEMORY_MODE`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_MODE`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_NEURAL_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_NEURAL_OPTIMIZATION`            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `RUV_SWARM_TOPOLOGY`                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `RUV_SWARM_WASM_ENABLED`                   |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `S3_ACCESS_KEY`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `S3_ACCESS_KEY_ID`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `S3_BUCKET`                                |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `S3_BUCKET_NAME`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `S3_ENABLED`                               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `S3_ENDPOINT`                              |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `S3_REGION`                                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `S3_SECRET_ACCESS_KEY`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `S3_SECRET_KEY`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `S3_USE_SSL`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SCORING_ENABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SCORING_MAX_SCORE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SCORING_MIN_SCORE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SCRAPER_INTERVAL_MINUTES`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SCRAPER_TIMEOUT_MS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SECONDARY_MODEL`                          |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SECONDARY_MODEL_SIZE`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SECONDARY_MODEL_VRAM`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SECONDARY_ORCHESTRATOR`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SECRETS_PATH`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SECRET_KEY`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SECURITY_SERVICE_PORT`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SECURITY_SERVICE_URL`                     |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SEED_SAMPLE_DATA`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SEMANTIC_RELEASE_ENABLED`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SENDGRID_API_KEY`                         |            21 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `SENDGRID_ENABLED`                         |             4 | single consistent value pattern                                                                                         | no/maybe |
| `SENDGRID_FROM`                            |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | yes      |
| `SENDGRID_FROM_EMAIL`                      |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SENDGRID_FROM_NAME`                       |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SENDGRID_REPLY_TO`                        |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `SENDGRID_WEBHOOK_URL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SENTRY_DEBUG`                             |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `SENTRY_DSN`                               |            12 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `SENTRY_ENABLED`                           |            12 | env tags: ci, dev, general, prod; uses different values/placeholders by file/environment                                | no/maybe |
| `SENTRY_ENVIRONMENT`                       |            11 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `SENTRY_SAMPLE_RATE`                       |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `SENTRY_TRACES_SAMPLE_RATE`                |             7 | env tags: general, prod, production; uses different values/placeholders by file/environment                             | no/maybe |
| `SENTRY_TRACE_SAMPLE_RATE`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SERENA_API_KEY`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SERENA_DISABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SERENA_MCP_PORT`                          |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `SERENA_MCP_URL`                           |             3 | env tags: development, general; uses different values/placeholders by file/environment                                  | no/maybe |
| `SERENA_PORT`                              |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `SERENA_REPO_PATH`                         |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SERENA_URL`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `SERVER_URL`                               |             3 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `SERVICES`                                 |             2 | single consistent value pattern                                                                                         | yes      |
| `SERVICE_DISCOVERY_ENABLED`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SERVICE_KEY`                              |             1 | single consistent value pattern                                                                                         | yes      |
| `SERVICE_NAME`                             |             4 | env tags: development; uses different values/placeholders by file/environment                                           | no/maybe |
| `SERVICE_REGISTRY_URL`                     |             4 | single consistent value pattern                                                                                         | no/maybe |
| `SESSION_DURATION`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SESSION_HTTP_ONLY`                        |             4 | env tags: development, production; single consistent value pattern                                                      | no/maybe |
| `SESSION_MAX_AGE`                          |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `SESSION_SAME_SITE`                        |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `SESSION_SECRET`                           |            26 | env tags: ci, dev, development, general, prod, production; uses different values/placeholders by file/environment       | yes      |
| `SESSION_SECURE`                           |             8 | env tags: development, general, prod, production; uses different values/placeholders by file/environment                | no/maybe |
| `SESSION_SERVICE_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SESSION_TIMEOUT`                          |             7 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `SIGN_IN_PREFILLED`                        |             4 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `SIMPLE_GH_TOKEN`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SITE_URL`                                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLACK_ENABLED`                            |             2 | env tags: production; single consistent value pattern                                                                   | no/maybe |
| `SLACK_WEBHOOK_APPLICATION`                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLACK_WEBHOOK_CRITICAL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLACK_WEBHOOK_DATABASE`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLACK_WEBHOOK_INFRASTRUCTURE`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLACK_WEBHOOK_URL`                        |            10 | env tags: general, production; uses different values/placeholders by file/environment                                   | no/maybe |
| `SLACK_WEBHOOK_WARNINGS`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SLIDING_WINDOW_SIZE`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_ADMIN_EMAIL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_AUTH_PASSWORD`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_AUTH_USERNAME`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_FROM`                                |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SMTP_FROM_EMAIL`                          |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SMTP_FROM_NAME`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `SMTP_HOST`                                |            17 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SMTP_PASS`                                |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SMTP_PASSWORD`                            |            10 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SMTP_PORT`                                |            17 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SMTP_SECURE`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_SMARTHOST`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SMTP_USER`                                |            17 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SONA_ADAPTATION_TIME`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SONA_ENABLED`                             |             3 | single consistent value pattern                                                                                         | no/maybe |
| `SONA_LEARNING_RATE`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SONA_MODE`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SOURCE_MAPS`                              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SPARC2_DISABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SPARC_DISABLED`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SPECIALIZATION`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `SPECULATIVE_TOKENS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SSL_CERT_PATH`                            |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SSL_ENABLED`                              |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SSL_KEY_PATH`                             |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SSL_VERIFY_PEER`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `STATE_COMPLIANCE_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `STATIC_CACHE_MAX_AGE`                     |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `STATIC_IP`                                |             1 | single consistent value pattern                                                                                         | no/maybe |
| `STOP_ENFORCEMENT_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `STORAGE_LOCAL_PATH`                       |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `STORAGE_TYPE`                             |             7 | env tags: dev, development, general, production; uses different values/placeholders by file/environment                 | no/maybe |
| `STRIPE_PUBLIC_KEY`                        |             4 | env tags: development, production; uses different values/placeholders by file/environment                               | no/maybe |
| `STRIPE_SECRET_KEY`                        |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `STRIPE_WEBHOOK_SECRET`                    |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `SUBDOMAIN_ADMIN`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SUBDOMAIN_API`                            |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SUBDOMAIN_NYRA`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_ACCESS_TOKEN`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_ANON_KEY`                        |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SUPABASE_CLIENT_SERVICE_KEY`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_JWT_SECRET`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_PROJECT_ID`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_REFRESH_TOKEN`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SUPABASE_SERVICE_KEY`                     |            10 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SUPABASE_SERVICE_ROLE_KEY`                |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SUPABASE_URL`                             |            12 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SUPPORT_CHAT_ENABLED`                     |             3 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `SWAGGER_ENABLED`                          |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `SWAGGER_PATH`                             |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `SWAP_ENABLED`                             |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SWAP_SIZE_GB`                             |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SWARM_AUTO_SCALE`                         |             5 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_COORDINATION_MODE`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_COORDINATION_PROTOCOL`              |             6 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_COORDINATOR_URL`                    |             6 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_MAX_AGENTS`                         |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SWARM_MAX_CONCURRENT_TASKS`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_MEMORY_SHARED`                      |             5 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_NEURAL_SYNC`                        |             5 | single consistent value pattern                                                                                         | no/maybe |
| `SWARM_ROLE`                               |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SWARM_STRATEGY`                           |             1 | single consistent value pattern                                                                                         | yes      |
| `SWARM_TOPOLOGY`                           |            10 | uses different values/placeholders by file/environment                                                                  | yes      |
| `SWARM_WORKERS`                            |             1 | single consistent value pattern                                                                                         | yes      |
| `SWARM_WORKER_ID`                          |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `SWARM_WORKER_PORT`                        |             6 | single consistent value pattern                                                                                         | no/maybe |
| `SYNC_BATCH_SIZE`                          |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SYNC_INTERVAL`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `SYNC_INTERVAL_MINUTES`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `SYSTEM_MONITORING`                        |             3 | single consistent value pattern                                                                                         | no/maybe |
| `TAILSCALE_ADVERTISE_ROUTES`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `TAILSCALE_AUTHKEY`                        |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TAILSCALE_AUTH_KEY`                       |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TAILSCALE_DOMAIN`                         |             3 | single consistent value pattern                                                                                         | no/maybe |
| `TAILSCALE_ENABLED`                        |            13 | env tags: general, prod; uses different values/placeholders by file/environment                                         | no/maybe |
| `TAILSCALE_FQDN`                           |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TAILSCALE_HOSTNAME`                       |            20 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TAILSCALE_IP`                             |            22 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TAILSCALE_KEY`                            |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TAILSCALE_TAGS`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `TASK_QUEUE_PATH`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TASK_TIMEOUT`                             |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `TASK_TIMEOUT_MS`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TAVILY_API_KEY`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TELEGRAM_BOT_TOKEN`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TELEMETRY_ENABLED`                        |             4 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `TEMPLATES_PATH`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENANT_ENGINEERING_KEY`                   |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TENANT_OPERATIONS_KEY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENANT_PRODUCTION_KEY`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENANT_RESEARCH_KEY`                      |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TENSORBOARD_ENABLED`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENSORBOARD_PORT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENSORRT_LLM_ENABLED`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TENSORRT_LLM_PORT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TERTIARY_MODEL`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TEST_CONTAINER_NAME`                      |             2 | env tags: test; single consistent value pattern                                                                         | no/maybe |
| `TEST_DATABASE_URL`                        |             3 | env tags: development, general; uses different values/placeholders by file/environment                                  | yes      |
| `TEST_ENVIRONMENT`                         |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `TEST_MCP_PORT`                            |             2 | env tags: test; single consistent value pattern                                                                         | no/maybe |
| `TEST_MODE`                                |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `TEST_PROJECT_ID`                          |             2 | env tags: test; single consistent value pattern                                                                         | yes      |
| `TEST_REDIS_URL`                           |             2 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `TEST_REPORT_PATH`                         |             3 | env tags: ci, general; single consistent value pattern                                                                  | no/maybe |
| `TEST_SECRET_ID`                           |             2 | env tags: test; single consistent value pattern                                                                         | yes      |
| `TEST_TIMEOUT`                             |             5 | env tags: ci, general, test; single consistent value pattern                                                            | no/maybe |
| `THROTTLE_LIMIT`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `THROTTLE_TTL`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `THUMBNAIL_QUALITY`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `THUMBNAIL_SIZE`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TILA_DISCLOSURE_DAYS`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TIMEOUT_MS`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TIMEZONE`                                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `TLS_CERT_PATH`                            |             7 | env tags: general, production; uses different values/placeholders by file/environment                                   | yes      |
| `TLS_ENABLED`                              |             4 | env tags: general, production; uses different values/placeholders by file/environment                                   | no/maybe |
| `TLS_KEY_PATH`                             |             7 | env tags: general, production; uses different values/placeholders by file/environment                                   | yes      |
| `TORCH_BACKENDS_CUDNN_ENABLED`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TORCH_DISTRIBUTED_DEBUG`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRACING_ENABLED`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRACK_INFERENCE_TIME`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TRACK_MODEL_LOADING_TIME`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TRACK_QUEUE_DEPTH`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TRAJECTORY_TRACKING`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRANSUNION_API_KEY`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TRID_API_KEY`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRID_CLOSING_DISCLOSURE_DAYS`             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRID_DISCLOSURE_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRID_ENABLED`                             |             3 | env tags: general, prod; single consistent value pattern                                                                | no/maybe |
| `TRID_LOAN_ESTIMATE_DAYS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TRUSTED_PROXIES`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TURBO_TELEMETRY_DISABLED`                 |             5 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_API_KEY`                        |            13 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `TWENTYCRM_API_URL`                        |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_DATABASE_URL`                   |             1 | single consistent value pattern                                                                                         | yes      |
| `TWENTYCRM_DB_URL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_ENABLED`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_HOST`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_JWT_SECRET`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_LOG_LEVEL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_MCP_PORT`                       |            10 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `TWENTYCRM_PORT`                           |            10 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `TWENTYCRM_REDIS_URL`                      |             1 | single consistent value pattern                                                                                         | yes      |
| `TWENTYCRM_URL`                            |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTYCRM_WEBHOOK_SECRET`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTYCRM_WORKSPACE_ID`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_ACCESS_TOKEN_SECRET`               |            11 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_API_KEY`                           |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_API_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_APP_SECRET`                        |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_BASE_URL`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_API_KEY`                       |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_CRM_API_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_BIND`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_DATABASE_URL`                  |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_ENABLED`                       |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_JWT_SECRET`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_PORT`                          |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_CRM_POSTGRES_DB`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_POSTGRES_HOST`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_POSTGRES_PASSWORD`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_POSTGRES_PORT`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_POSTGRES_USER`                 |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_SECRET_KEY`                    |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_CRM_SYNC_ENABLED`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_SYNC_INTERVAL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_CRM_URL`                           |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_CRM_WORKSPACE_ID`                  |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_DATABASE_URL`                      |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_DB`                                |             3 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_DB_HOST`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_DB_NAME`                           |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `TWENTY_DB_PASSWORD`                       |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_DB_PORT`                           |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_DB_USER`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_ENABLED`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_ENCRYPTION_SECRET`                 |            17 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `TWENTY_FILE_TOKEN_SECRET`                 |             8 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_FRONTEND_URL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_FRONT_BASE_URL`                    |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_HOST`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_JWT_SECRET`                        |            17 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `TWENTY_LOGIN_TOKEN_SECRET`                |            11 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_PASSWORD_SALT`                     |            17 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `TWENTY_PG_DATABASE_URL`                   |             1 | single consistent value pattern                                                                                         | yes      |
| `TWENTY_PG_PASSWORD`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_PORT`                              |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_POSTGRES_DB`                       |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `TWENTY_POSTGRES_PASSWORD`                 |            12 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `TWENTY_POSTGRES_PORT`                     |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_POSTGRES_USER`                     |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `TWENTY_PUBLIC_BASE_URL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_REDIS_HOST`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_REDIS_PASSWORD`                    |             3 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_REDIS_PORT`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_REFRESH_TOKEN_SECRET`              |            11 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWENTY_SERVER_URL`                        |            13 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWENTY_TAG`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_URL`                               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `TWENTY_WEBHOOK_SECRET`                    |             1 | single consistent value pattern                                                                                         | yes      |
| `TWENTY_WORKSPACE_ID`                      |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `TWILIO_ACCOUNT_SID`                       |            27 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `TWILIO_AUTH_TOKEN`                        |            27 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `TWILIO_ENABLED`                           |             4 | single consistent value pattern                                                                                         | no/maybe |
| `TWILIO_FROM_NUMBER`                       |             5 | single consistent value pattern                                                                                         | no/maybe |
| `TWILIO_MESSAGING_SERVICE_SID`             |             5 | uses different values/placeholders by file/environment                                                                  | yes      |
| `TWILIO_PHONE_NUMBER`                      |            19 | env tags: development, general, production; uses different values/placeholders by file/environment                      | yes      |
| `TWILIO_SMS_WEBHOOK_URL`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWILIO_VERIFY_SID`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TWILIO_VOICE_WEBHOOK_URL`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `TZ`                                       |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `UFW_ENABLED`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `UNHEALTHY_THRESHOLD`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `UNMUTE_HOST_PORT`                         |             2 | single consistent value pattern                                                                                         | no/maybe |
| `UNMUTE_IMAGE`                             |             2 | single consistent value pattern                                                                                         | yes      |
| `UNMUTE_MODEL_PROVIDER`                    |             2 | single consistent value pattern                                                                                         | no/maybe |
| `UNMUTE_OPENAI_API_KEY`                    |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `UNMUTE_PUBLIC_BASE_URL`                   |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `UPLOAD_DIR`                               |             5 | env tags: development, general, production; uses different values/placeholders by file/environment                      | no/maybe |
| `UPLOAD_PATH`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `USE_GEMINI`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `USE_NEXUS_ROUTER`                         |             4 | uses different values/placeholders by file/environment                                                                  | yes      |
| `USE_ONNX`                                 |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `USE_OPENROUTER`                           |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VECTOR_COLLECTION`                        |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `VECTOR_DB_COLLECTION`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VECTOR_DB_HOST`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VECTOR_DB_PORT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VERBOSE`                                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VERBOSE_GPU_LOGGING`                      |             3 | single consistent value pattern                                                                                         | no/maybe |
| `VERBOSE_LOGGING`                          |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VERBOSE_VLLM_LOGGING`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VERDICT_JUDGMENT`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VERSION`                                  |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VITE_ALLOWED_HOSTS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_API_BASE`                            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_CLAUDE_FLOW_URL`                     |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VITE_ENABLE_AGENT_MONITOR`                |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_ENABLE_MEMORY_OPS`                   |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_ENABLE_METRICS`                      |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_ENABLE_TASK_TIMELINE`                |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_ENABLE_TOPOLOGY`                     |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_EVENT_SERVER_HTTP_URL`               |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VITE_EVENT_SERVER_URL`                    |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VITE_MAX_BUFFER_SIZE`                     |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VITE_SHOW_DEVTOOLS`                       |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `VITE_WEBSOCKET_RECONNECT_INTERVAL`        |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_5090_URL`                            |             5 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VLLM_BIND`                                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_DISABLE_LOG_REQUESTS`                |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_DISABLE_LOG_STATS`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_ENABLED`                             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_ENABLE_CHUNKED_PREFILL`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_ENABLE_LOGPROBS`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_ENABLE_PREFIX_CACHING`               |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_ENFORCE_EAGER_EXECUTION`             |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_GPU_MEMORY`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_GPU_MEMORY_UTILIZATION`              |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VLLM_HOST`                                |             4 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_KV_CACHE_DTYPE`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_LOGPROBS_SOFT_CAP`                   |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_MAX_MODEL_LEN`                       |             7 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VLLM_MAX_NUM_BATCHED_TOKENS`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_MODEL`                               |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `VLLM_MODELS`                              |             2 | uses different values/placeholders by file/environment                                                                  | yes      |
| `VLLM_PIPELINE_PARALLEL_SIZE`              |             2 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_PORT`                                |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VLLM_REQUEST_TIMEOUT`                     |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VLLM_TENSOR_PARALLEL`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `VLLM_TENSOR_PARALLEL_SIZE`                |             6 | single consistent value pattern                                                                                         | no/maybe |
| `VOLTA_VERSION`                            |             3 | single consistent value pattern                                                                                         | no/maybe |
| `VRAM_GB`                                  |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `VRAM_RESERVED_FOR_SYSTEM_GB`              |             2 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WAN_IP`                                   |            12 | single consistent value pattern                                                                                         | no/maybe |
| `WEBAPP_PORT`                              |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WEBAPP_URL`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WEBHOOK_ALLOWED_ORIGINS`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_BASE_URL`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_MEMORY_LIMIT`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_PORT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_RETRY_ATTEMPTS`                   |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_RETRY_DELAY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECRET_CLERK`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECRET_FREERATEUPDATE`            |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECRET_LENDINGTREE`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECRET_SENDGRID`                  |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECRET_TWILIO`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_SECURITY_ENABLED`                 |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_TIMEOUT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_TUNNEL_URL`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBHOOK_URL`                              |             8 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `WEBUI_AUTH`                               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WEBUI_SECRET_KEY`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WHATSAPP_PHONE_NUMBER`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER1_IP`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WORKER1_LLM_API_KEY`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER1_LLM_BASE_URL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER2_IP`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WORKER2_LLM_API_KEY`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER2_LLM_BASE_URL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER3_IP`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WORKER3_LLM_API_KEY`                      |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER3_LLM_BASE_URL`                     |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_1_IP`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_2_IP`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3060_API_KEY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3060_MAX_CONCURRENT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3060_MODELS`                       |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `WORKER_3060_OLLAMA_PORT`                  |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `WORKER_3060_PRIMARY_USE`                  |             3 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WORKER_3060_PRIORITY`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3060_SPECIALIZATION`               |             3 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3060_URL`                          |             9 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `WORKER_3090TI_MODEL`                      |             7 | env tags: dev, general; single consistent value pattern                                                                 | yes      |
| `WORKER_3090TI_VLLM_PORT`                  |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `WORKER_3090_API_KEY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3090_MAX_CONCURRENT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3090_MODELS`                       |             7 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `WORKER_3090_PRIMARY_USE`                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3090_PRIORITY`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3090_SPECIALIZATION`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_3090_URL`                          |             7 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `WORKER_3_IP`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_API_KEY`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_MAX_CONCURRENT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_MODEL`                        |             7 | env tags: dev, general; single consistent value pattern                                                                 | yes      |
| `WORKER_5090_MODELS`                       |             7 | env tags: dev, general; uses different values/placeholders by file/environment                                          | yes      |
| `WORKER_5090_PRIMARY_USE`                  |             3 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_PRIORITY`                     |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_SPECIALIZATION`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_5090_URL`                          |             7 | env tags: dev, general; uses different values/placeholders by file/environment                                          | no/maybe |
| `WORKER_5090_VLLM_PORT`                    |             7 | env tags: dev, general; single consistent value pattern                                                                 | no/maybe |
| `WORKER_API_KEY`                           |             2 | single consistent value pattern                                                                                         | yes      |
| `WORKER_API_PORT`                          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_CAPABILITIES`                      |             6 | uses different values/placeholders by file/environment                                                                  | yes      |
| `WORKER_CONCURRENCY`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_CONNECTIONS`                       |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_GPU`                               |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WORKER_ID`                                |             7 | uses different values/placeholders by file/environment                                                                  | yes      |
| `WORKER_IP`                                |             1 | env tags: dev; single consistent value pattern                                                                          | no/maybe |
| `WORKER_METRICS_PORT`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_NAME`                              |             9 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WORKER_PROCESSES`                         |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_ROLE`                              |             4 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WORKER_RTX3060_DEV_UI_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3060_GPU_MONITOR_PORT`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3060_JUPYTER_PORT`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3060_MLFLOW_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3060_VSCODE_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3090_DEV_UI_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3090_GPU_MONITOR_PORT`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3090_JUPYTER_PORT`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3090_MLFLOW_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX3090_VSCODE_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX5090_DEV_UI_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX5090_GPU_MONITOR_PORT`          |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX5090_JUPYTER_PORT`              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX5090_MLFLOW_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_RTX5090_VSCODE_PORT`               |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_SPECIALIZATION`                    |             8 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WORKER_THREADS`                           |             6 | uses different values/placeholders by file/environment                                                                  | no/maybe |
| `WORKER_TIMEOUT`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKER_TYPE`                              |             4 | single consistent value pattern                                                                                         | no/maybe |
| `WORKFLOW_ENGINE_ENABLED`                  |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `WORKFLOW_PERSISTENCE`                     |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `WORKFLOW_STORAGE_PATH`                    |             1 | single consistent value pattern                                                                                         | no/maybe |
| `WORKSPACE_PATH`                           |             2 | single consistent value pattern                                                                                         | no/maybe |
| `WORKSPACE_ROOT`                           |             1 | env tags: development; single consistent value pattern                                                                  | no/maybe |
| `XENOVA_API_URL`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `XENOVA_BATCH_SIZE`                        |             1 | single consistent value pattern                                                                                         | no/maybe |
| `XENOVA_MODEL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ZEP_API_KEY`                              |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ZEP_EMBEDDING_MODEL`                      |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ZEP_GRAPH_NAME`                           |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ZEP_MCP_PORT`                             |             1 | single consistent value pattern                                                                                         | no/maybe |
| `ZOHO_MCP_URL`                             |             1 | single consistent value pattern                                                                                         | no/maybe |

## File coverage by scope

### repo-root (18 files)

- `.env.claude-flow`
- `.env.dev.claude-flow`
- `.env.example`
- `.env.example1`
- `.env.gitea.template`
- `.env.infisical.template`
- `.env.master-infisical`
- `.env.oracle`
- `.env.orchestrator`
- `.env.orchestrator.template`
- `.env.prod.claude-flow`
- `.env.stack.example`
- `.env.template`
- `.env.twenty.example`
- `.env.worker-rtx3060`
- `.env.worker-rtx3060.template`
- `.env.worker-rtx3090`
- `.env.worker-rtx5090`

### infra (29 files)

- `infra/.env.example`
- `infra/.env.example.todo`
- `infra/compose/.env.example`
- `infra/configs/claude-flow-cicd/.env.cicd.example`
- `infra/dev-stack/.env.example`
- `infra/env/.env.dev-laptop`
- `infra/env/.env.oracle`
- `infra/env/.env.orchestrator`
- `infra/env/.env.template`
- `infra/env/.env.worker-rtx3060`
- `infra/env/.env.worker-rtx3090ti`
- `infra/env/.env.worker-rtx5090`
- `infra/env/nyra.env.example`
- `infra/env/openclaw-unmute.env.example`
- `infra/env/openclaw.env.example`
- `infra/env/openclaw.ui.env.example`
- `infra/env/openclaw.voice.env.example`
- `infra/oracle/.env.example`
- `infra/orchestrator/.env.example`
- `infra/rtx-3060.env`
- `infra/rtx-3090ti.env`
- `infra/rtx-5090.env`
- `infra/stacks/nyra-mortgage/.env.example`
- `infra/workers/worker-3060/.env.example`
- `infra/workers/worker-3090/.env.example`
- `infra/workers/worker-rtx3060/.env.example`
- `infra/workers/worker-rtx3090ti/.env.example`
- `infra/workers/worker-rtx5090/.env.example`
- `infra/workers/worker-rtx5090/worker-5090/.env.worker-5090.template`

### docs (138 files)

- `docs/ai-automatable/bootstrap/MASTER-.env`
- `docs/archive/repo-history/archive-root/20260306/apps-claude-flow-dashboard/.env.example`
- `docs/archive/repo-history/archive-root/20260306/apps-nexus-dashboard/.env.example`
- `docs/archive/repo-history/archive-root/20260306/apps-web-legacy/nyra-admin/.env.example`
- `docs/archive/repo-history/archive-root/20260306/apps-web-legacy/nyra-admin/.env.local.example`
- `docs/archive/repo-history/archive-root/20260306/apps-web-legacy/ratehunter/.env.example`
- `docs/archive/repo-history/archive-root/20260307/infra/nyra-complete/workers/rtx-3060.env`
- `docs/archive/repo-history/archive-root/20260307/infra/nyra-complete/workers/rtx-3090ti.env`
- `docs/archive/repo-history/archive-root/20260307/infra/nyra-complete/workers/rtx-5090.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/apps-consolidate-input/infra/.env.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/apps-consolidate-input/nyra-stack/.env.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/docs/PROJECT-NYRA-ULTIMATE.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/docs/complete.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/PROJECT-NYRA-ULTIMATE.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/claude-example.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/dev.env.template`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/env-templates/.env.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/env-templates/.env.local.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/env/master.example.env`
- `docs/archive/repo-history/archived-root/20260306/ToDo/infra/nexus-one-hop/.env.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/master_nyra_package_maximalist/infra/orchestrator/secrets/infisical.env.example`
- `docs/archive/repo-history/archived-root/20260306/ToDo/nyra-infra-bootstrap/infra/env/nyra.env.example`
- `docs/archive/repo-history/archived-root/20260306/assets/new-uploads-ingestion-input/docker/orchestrator/.env.example`
- `docs/archive/repo-history/archived-root/20260306/assets/new-uploads-ingestion-input/docker/worker/.env.example`
- `docs/archive/repo-history/archived-root/20260306/assets/new-uploads-ingestion-input/docker/wsl/.env.example`
- `docs/archive/repo-history/archived-root/20260306/assets/new-uploads-ingestion-input/project-nyra/apps/ratehunter-api/.env.example`
- `docs/archive/repo-history/archived-root/20260306/assets/new-uploads-ingestion-input/project-nyra/apps/ratehunter-web/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/legacy-infra-2026-01-19/dual-orchestrator/archon-os/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/legacy-infra-2026-01-19/orchestrator-mini/configs/.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/legacy-infra-2026-01-19/services/monitoring/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/compose/.env.casistack.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/compose/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/compose/env/metamcp.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/config/dify.env`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/legacy-infra/config/metamcp.env`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/archive/nyra-infra-old/nyra-stack-v6_2/env/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/bitwarden-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/bitwarden-mcp/test/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/claude-flow-cicd/.env.cicd.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/cloudflare/.env.cloudflare.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.ci`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.development`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.development.optimal`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.master`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.production`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/environments/.env.production.optimal`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/orchestrator/.env.orchestrator`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/orchestrator/.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/ruvector/.env.ruvector`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/workers/.env.worker-3060`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/workers/.env.worker-3090ti`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/configs/workers/.env.worker-5090`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker-compose/.env.backup-20260126-185820`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker-compose/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker-compose/.env.golden-stack`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/.env.mcp.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/.env.rendered`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/archon-integration.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/build/.env.claude-flow.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/services/.env.embeddings.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/services/agentic-flow/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/docker/services/ruvector/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/dockerhub-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/environments/pc1-orchestrator.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/environments/pc2-rtx3060.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/environments/pc3-rtx5090.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/environments/pc4-rtx3090.env.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/git-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/env/dev.shared.env`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/templates/master.env.tmpl`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/templates/mcp.env.tmpl`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/templates/orchestration.env.tmpl`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/infisical/templates/ui.env.tmpl`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/machines/.env.machine`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/machines/.env.shared.template`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/sequential-thinking-mcp/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/shared-tools/archon/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/stacks/nyra-mortgage/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/worker-machines/worker-3060/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/worker-machines/worker-3090/.env.example`
- `docs/archive/repo-history/archived-root/infra-20260206-1551/worker-machines/worker-5090/.env.worker-5090.template`
- `docs/configuration/env-backups/infra/.env.example`
- `docs/configuration/env-backups/infra/bitwarden-mcp/.env.example`
- `docs/configuration/env-backups/infra/bitwarden-mcp/test/.env.example`
- `docs/configuration/env-backups/infra/docker-compose/.env.example`
- `docs/configuration/env-backups/infra/docker-mcp/.env.example`
- `docs/configuration/env-backups/infra/docker/.env.mcp.template`
- `docs/configuration/env-backups/infra/dockerhub-mcp/.env.example`
- `docs/configuration/env-backups/infra/git-mcp/.env.example`
- `docs/configuration/env-backups/infra/infisical-mcp/.env.example`
- `docs/configuration/env-backups/infra/machines/.env.machine`
- `docs/configuration/env-backups/infra/machines/.env.shared.template`
- `docs/configuration/env-backups/infra/sequential-thinking-mcp/.env.example`
- `docs/configuration/env-backups/infra/stacks/nyra-mortgage/.env.example`
- `docs/configuration/env-backups/root/.env.ci`
- `docs/configuration/env-backups/root/.env.claude-flow`
- `docs/configuration/env-backups/root/.env.cloudflare.example`
- `docs/configuration/env-backups/root/.env.dev.claude-flow`
- `docs/configuration/env-backups/root/.env.development`
- `docs/configuration/env-backups/root/.env.development.optimal`
- `docs/configuration/env-backups/root/.env.example`
- `docs/configuration/env-backups/root/.env.example.master`
- `docs/configuration/env-backups/root/.env.master`
- `docs/configuration/env-backups/root/.env.orchestration.template`
- `docs/configuration/env-backups/root/.env.orchestrator`
- `docs/configuration/env-backups/root/.env.prod.claude-flow`
- `docs/configuration/env-backups/root/.env.production`
- `docs/configuration/env-backups/root/.env.production.optimal`
- `docs/configuration/env-backups/root/.env.template`
- `docs/configuration/env-backups/root/.env.worker-3060`
- `docs/configuration/env-backups/root/.env.worker-3090ti`
- `docs/configuration/env-backups/root/.env.worker-5090`
- `docs/configuration/infisical-secrets-management/envtree/dev/adapters/openai-via-openrouter.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/clients/cloudflare.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/databases/postgres.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/github-actions/index.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/machines/orchestrator-mini.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/machines/worker-rtx3060.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/router/litellm-proxy-server.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/shared/shared-base.env`
- `docs/configuration/infisical-secrets-management/envtree/dev/shared/shared-network.env`
- `docs/configuration/infisical-secrets-management/machines/orchestrator-mini.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx3060.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx3090ti.env`
- `docs/configuration/infisical-secrets-management/machines/worker-rtx5090.env`
- `docs/configuration/infisical-secrets-management/migration/.infisical-auth.env`
- `docs/references/claude-flow-examples/05-swarm-apps/rest-api-advanced/.env.example`
- `docs/references/claude-flow-examples/05-swarm-apps/rest-api/.env.example`
- `docs/references/claude-flow-examples/blog-api/.env.example`
- `docs/references/claude-flow-examples/litellm/.env.example`
- `docs/references/claude-flow-examples/rest-api-simple/.env.example`
- `docs/references/claude-flow-examples/user-api/.env.example`

### apps (12 files)

- `apps/apps-claude-flow-dashboard/.env.example`
- `apps/ingestion/files/nyra-stack/.env.example`
- `apps/ingestion/ratehunter-export/ingest-consolidated-old-nyra/ratehunter-api/.env.example`
- `apps/ingestion/ratehunter-export/ingest-consolidated-old-nyra/ratehunter-web/.env.example`
- `apps/landing/app/.env.example`
- `apps/landing/ratehunter-landing/.env.example`
- `apps/shared/n8n-shared/examples/n8n-environment.env`
- `apps/twenty-crm/.env.twenty`
- `apps/twenty-crm/config/twenty-dev.env`
- `apps/twenty-crm/config/twenty.env`
- `apps/twenty-crm/examples/environment-config.env`
- `apps/twenty-crm/integrations/.env.example`

### services (22 files)

- `services/activepieces-flows/.env.example`
- `services/archon-os/.env.development`
- `services/archon-os/.env.example`
- `services/auth-service/.env.example`
- `services/campaign-engine/.env.example`
- `services/claude-flow-event-server/.env.example`
- `services/claude-flow/.env.example`
- `services/doc-management-api/.env.example`
- `services/gemini-mcp/.env.development`
- `services/lead-capture-api/.env.example`
- `services/litellm-proxy/.env.example`
- `services/mem0/.env.development`
- `services/memory/.env.example`
- `services/mortgage-assistant-api/.env.example`
- `services/nexus-router/.env.example`
- `services/quote-engine/.env.example`
- `services/rate-comparison-engine/.env.example`
- `services/ratehunter-api/.env.example`
- `services/security-service/.env.example`
- `services/serena-mcp/.env.development`
- `services/twentycrm-integration/.env.example`
- `services/websocket-hub/.env.example`
