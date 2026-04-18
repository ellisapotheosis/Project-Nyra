# Master Env/Secrets List (Deduplicated)

This file is intended for Infisical host/app profiles. Variables are deduplicated globally.

## Global deduplicated variable index

| Variable | Sensitive? | Seen In | Env-specific values? |
|---|---|---:|---|
| `ACCESS_TOKEN_SECRET` | Yes | 2 | multiple defaults (dev, prod) |
| `ACTIVEPIECES_API_KEY` | Yes | 12 | multiple defaults (not specified) |
| `ACTIVEPIECES_BASE_URL` | No | 1 | dev |
| `ACTIVEPIECES_DB` | No | 3 | not specified |
| `ACTIVEPIECES_DB_URL` | No | 1 | dev |
| `ACTIVEPIECES_ENABLED` | No | 5 | not specified |
| `ACTIVEPIECES_ENCRYPTION_KEY` | Yes | 14 | multiple defaults (dev) |
| `ACTIVEPIECES_HOST` | No | 1 | not specified |
| `ACTIVEPIECES_JWT_SECRET` | Yes | 11 | multiple defaults (dev) |
| `ACTIVEPIECES_PORT` | No | 19 | multiple defaults (dev) |
| `ACTIVEPIECES_POSTGRES_DATABASE` | No | 2 | not specified |
| `ACTIVEPIECES_POSTGRES_DB` | No | 2 | not specified |
| `ACTIVEPIECES_POSTGRES_HOST` | No | 4 | dev |
| `ACTIVEPIECES_POSTGRES_PASSWORD` | Yes | 4 | multiple defaults (not specified) |
| `ACTIVEPIECES_POSTGRES_PORT` | No | 4 | not specified |
| `ACTIVEPIECES_POSTGRES_USER` | No | 2 | not specified |
| `ACTIVEPIECES_PUBLIC_BASE_URL` | No | 1 | not specified |
| `ACTIVEPIECES_REDIS_DB` | No | 2 | not specified |
| `ACTIVEPIECES_REDIS_HOST` | No | 2 | dev |
| `ACTIVEPIECES_REDIS_PORT` | No | 2 | not specified |
| `ACTIVEPIECES_SECRET_KEY` | Yes | 2 | not specified |
| `ACTIVEPIECES_URL` | No | 5 | multiple defaults (dev) |
| `ACTIVEPIECES_WEBHOOK_URL` | Yes | 1 | not specified |
| `ADMINER_PORT` | No | 1 | not specified |
| `ADMIN_API_KEY` | Yes | 1 | not specified |
| `ADMIN_DASHBOARD_URL` | No | 1 | not specified |
| `ADMIN_EMAIL` | No | 2 | not specified |
| `ADMIN_PASSWORD` | Yes | 2 | not specified |
| `AGENTDB_AUTO_MIGRATE` | No | 2 | not specified |
| `AGENTDB_CACHE_ENABLED` | No | 1 | not specified |
| `AGENTDB_CACHE_SIZE` | No | 3 | not specified |
| `AGENTDB_ENABLED` | No | 6 | not specified |
| `AGENTDB_FALLBACK_LEGACY` | No | 2 | not specified |
| `AGENTDB_HNSW_EF` | No | 3 | multiple defaults (not specified) |
| `AGENTDB_HNSW_EF_SEARCH` | No | 1 | not specified |
| `AGENTDB_HNSW_M` | No | 3 | not specified |
| `AGENTDB_LEARNING` | No | 2 | not specified |
| `AGENTDB_LEARNING_ALGORITHM` | No | 2 | not specified |
| `AGENTDB_PATH` | No | 7 | multiple defaults (not specified) |
| `AGENTDB_PORT` | No | 1 | not specified |
| `AGENTDB_QUANTIZATION` | No | 3 | multiple defaults (not specified) |
| `AGENTDB_QUIC_PEERS` | No | 2 | not specified |
| `AGENTDB_QUIC_PORT` | No | 2 | not specified |
| `AGENTDB_QUIC_SYNC` | No | 3 | multiple defaults (not specified) |
| `AGENTDB_READ_ONLY` | No | 3 | not specified |
| `AGENTDB_REASONING` | No | 2 | not specified |
| `AGENTDB_SYNC_FROM` | No | 3 | not specified |
| `AGENTDB_URL` | No | 1 | not specified |
| `AGENTDB_VECTOR_ENABLED` | No | 1 | not specified |
| `AGENTIC_FLOW_API_KEY` | Yes | 1 | not specified |
| `AGENTIC_FLOW_AUTH` | Yes | 1 | not specified |
| `AGENTIC_FLOW_CACHE_TTL` | No | 1 | not specified |
| `AGENTIC_FLOW_JWT_SECRET` | Yes | 1 | not specified |
| `AGENTIC_FLOW_LOG_LEVEL` | No | 1 | not specified |
| `AGENTIC_FLOW_MAX_AGENTS` | No | 2 | not specified |
| `AGENTIC_FLOW_MCP_PORT` | No | 1 | not specified |
| `AGENTIC_FLOW_MEMORY_ENABLED` | No | 4 | not specified |
| `AGENTIC_FLOW_PORT` | No | 1 | not specified |
| `AGENTIC_FLOW_PROMETHEUS_PORT` | No | 1 | not specified |
| `AGENTIC_FLOW_TELEMETRY` | No | 1 | not specified |
| `AGENTIC_FLOW_TOPOLOGY` | No | 2 | not specified |
| `AGENTIC_FLOW_TRAINING` | No | 4 | not specified |
| `AGENTS_CUSTOM_PATHS` | No | 1 | not specified |
| `AGENTS_DIR` | No | 1 | not specified |
| `AGENT_BOOSTER_ENABLED` | No | 3 | not specified |
| `AGENT_CHECKPOINT_INTERVAL` | No | 1 | not specified |
| `AGENT_MAX_RETRIES` | No | 1 | not specified |
| `AGENT_STORAGE_PATH` | No | 1 | not specified |
| `AGENT_TIMEOUT` | No | 2 | multiple defaults (not specified) |
| `AGENT_WORK_ORDERS_PORT` | No | 1 | not specified |
| `AGGRESSIVE_MEMORY_CLEANUP` | No | 1 | not specified |
| `AIDEFENCE_BLOCK_SUSPICIOUS` | No | 2 | prod |
| `AIDEFENCE_ENABLED` | No | 13 | multiple defaults (dev, prod) |
| `AIDEFENCE_MONITOR_INPUTS` | No | 2 | prod |
| `AIDEFENCE_MONITOR_OUTPUTS` | No | 2 | prod |
| `AI_REVIEW_MODEL` | No | 1 | dev |
| `ALERTMANAGER_HOST` | No | 1 | not specified |
| `ALERTMANAGER_PORT` | No | 8 | not specified |
| `ALERTMANAGER_URL` | No | 1 | not specified |
| `ALERT_CHECK_INTERVAL_MINUTES` | No | 1 | not specified |
| `ALERT_CPU_USAGE` | No | 1 | not specified |
| `ALERT_EMAIL` | No | 4 | multiple defaults (prod) |
| `ALERT_EMAIL_ENABLED` | No | 2 | not specified |
| `ALERT_EMAIL_TO` | No | 1 | not specified |
| `ALERT_ERROR_RATE` | No | 1 | not specified |
| `ALERT_GPU_POWER_THRESHOLD_W` | No | 1 | not specified |
| `ALERT_GPU_TEMP_THRESHOLD_C` | No | 1 | not specified |
| `ALERT_MANAGER_ENABLED` | No | 2 | prod |
| `ALERT_MEMORY_USAGE` | No | 1 | not specified |
| `ALERT_QUEUE_DEPTH_THRESHOLD` | No | 1 | not specified |
| `ALERT_RESPONSE_TIME` | No | 1 | not specified |
| `ALERT_RESPONSE_TIME_THRESHOLD_MS` | No | 1 | not specified |
| `ALERT_SLACK_CHANNEL` | No | 2 | prod |
| `ALERT_THRESHOLD_GPU_TEMP` | No | 2 | not specified |
| `ALERT_THRESHOLD_INFERENCE_TIME` | No | 2 | not specified |
| `ALERT_THRESHOLD_VRAM_USAGE` | No | 2 | not specified |
| `ALERT_WEBHOOK_URL` | Yes | 2 | not specified |
| `ALLOWED_FILE_TYPES` | No | 6 | multiple defaults (dev, prod) |
| `ALLOWED_ORIGINS` | No | 5 | multiple defaults (dev) |
| `ALLOW_ORCHESTRATOR_IP` | No | 3 | not specified |
| `ALLOW_PC1_IP` | No | 3 | not specified |
| `ALLOW_PC2_IP` | No | 2 | not specified |
| `ALLOW_PC3_IP` | No | 2 | not specified |
| `ALLOW_PC4_IP` | No | 2 | not specified |
| `ANON_KEY` | Yes | 1 | not specified |
| `ANTHROPIC_API_KEY` | Yes | 78 | multiple defaults (dev, prod) |
| `ANTHROPIC_BASE_URL` | No | 6 | not specified |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | No | 1 | not specified |
| `ANTHROPIC_MAX_TOKENS` | Yes | 11 | multiple defaults (not specified) |
| `ANTHROPIC_MODEL` | No | 13 | multiple defaults (dev) |
| `ANTHROPIC_TEMPERATURE` | No | 5 | not specified |
| `API_ACCESS_TOKEN` | Yes | 2 | not specified |
| `API_BASE_URL` | No | 4 | multiple defaults (dev, prod) |
| `API_KEY` | Yes | 2 | multiple defaults (not specified) |
| `API_KEY_EXPIRY` | Yes | 1 | not specified |
| `API_KEY_HEADER` | Yes | 1 | not specified |
| `API_KEY_PC2` | Yes | 1 | not specified |
| `API_KEY_PC3` | Yes | 1 | not specified |
| `API_KEY_PC4` | Yes | 1 | not specified |
| `API_KEY_ROTATION_DAYS` | Yes | 2 | prod |
| `API_KEY_ROTATION_ENABLED` | Yes | 2 | prod |
| `API_PORT` | No | 1 | not specified |
| `API_PREFIX` | No | 1 | not specified |
| `API_RATE_LIMITING_REQUEST_COUNT` | No | 4 | multiple defaults (dev) |
| `API_RATE_LIMITING_TTL` | No | 4 | multiple defaults (dev) |
| `API_RATE_LIMIT_MAX_REQUESTS` | No | 1 | not specified |
| `API_RATE_LIMIT_WINDOW_MS` | No | 1 | not specified |
| `API_SECRET` | Yes | 3 | not specified |
| `API_SECRET_KEY` | Yes | 1 | not specified |
| `API_VERSION` | No | 5 | not specified |
| `APM_ENABLED` | No | 4 | multiple defaults (dev, prod) |
| `APPRISE_URLS` | No | 2 | not specified |
| `APP_HOST` | No | 4 | multiple defaults (dev, prod) |
| `APP_NAME` | No | 5 | multiple defaults (dev, prod) |
| `APP_PORT` | No | 5 | dev, prod |
| `APP_PROTOCOL` | No | 4 | multiple defaults (dev, prod) |
| `APP_SECRET` | Yes | 1 | not specified |
| `APP_URL` | No | 8 | multiple defaults (dev, prod) |
| `APP_VERSION` | No | 4 | dev, prod |
| `AP_API_KEY` | Yes | 1 | not specified |
| `AP_DB_TYPE` | No | 1 | not specified |
| `AP_ENCRYPTION_KEY` | Yes | 8 | multiple defaults (not specified) |
| `AP_EXECUTION_MODE` | No | 1 | not specified |
| `AP_FRONTEND_URL` | No | 6 | multiple defaults (dev) |
| `AP_JWT_SECRET` | Yes | 8 | multiple defaults (not specified) |
| `AP_POSTGRES_DATABASE` | No | 1 | not specified |
| `AP_POSTGRES_HOST` | No | 1 | not specified |
| `AP_POSTGRES_PASSWORD` | Yes | 3 | multiple defaults (not specified) |
| `AP_POSTGRES_PORT` | No | 1 | not specified |
| `AP_POSTGRES_USERNAME` | No | 2 | not specified |
| `AP_REDIS_HOST` | No | 1 | not specified |
| `AP_REDIS_PASSWORD` | Yes | 1 | not specified |
| `AP_REDIS_PORT` | No | 1 | not specified |
| `AP_TELEMETRY_ENABLED` | No | 1 | not specified |
| `AP_VERSION` | No | 1 | not specified |
| `ARCHGW_DISABLED` | No | 1 | not specified |
| `ARCHON_AGENTS_ENABLED` | No | 4 | not specified |
| `ARCHON_AGENTS_PORT` | No | 5 | not specified |
| `ARCHON_API_KEY` | Yes | 2 | multiple defaults (not specified) |
| `ARCHON_API_PORT` | No | 5 | multiple defaults (not specified) |
| `ARCHON_API_WORKERS` | No | 3 | not specified |
| `ARCHON_BACKOFF_MULTIPLIER` | No | 1 | not specified |
| `ARCHON_BASE_URL` | No | 3 | multiple defaults (not specified) |
| `ARCHON_CHECKPOINT_INTERVAL` | No | 1 | not specified |
| `ARCHON_DB_NAME` | No | 1 | not specified |
| `ARCHON_DB_PASSWORD` | Yes | 1 | not specified |
| `ARCHON_DB_USER` | No | 1 | not specified |
| `ARCHON_DEBUG` | No | 1 | not specified |
| `ARCHON_DEV_PATH` | No | 2 | dev |
| `ARCHON_DOCS_PORT` | No | 1 | not specified |
| `ARCHON_ENABLED` | No | 5 | not specified |
| `ARCHON_ENABLE_DEV_MODE` | No | 2 | dev |
| `ARCHON_ENABLE_WORK_ORDERS` | No | 3 | not specified |
| `ARCHON_ENV` | No | 2 | multiple defaults (prod) |
| `ARCHON_HOST` | No | 2 | multiple defaults (dev) |
| `ARCHON_JWT_SECRET` | Yes | 1 | not specified |
| `ARCHON_LOG_LEVEL` | No | 4 | multiple defaults (not specified) |
| `ARCHON_MAX_DEPTH` | No | 6 | dev |
| `ARCHON_MAX_TASKS` | No | 1 | not specified |
| `ARCHON_MCP_BIND` | No | 1 | not specified |
| `ARCHON_MCP_PORT` | No | 9 | multiple defaults (dev) |
| `ARCHON_MCP_URL` | No | 3 | multiple defaults (not specified) |
| `ARCHON_METRICS_PORT` | No | 4 | multiple defaults (not specified) |
| `ARCHON_METRICS_URL` | No | 2 | not specified |
| `ARCHON_MODE` | No | 3 | multiple defaults (not specified) |
| `ARCHON_OS_PORT` | No | 11 | multiple defaults (dev) |
| `ARCHON_OS_URL` | No | 5 | multiple defaults (dev) |
| `ARCHON_PARALLEL_BRANCHES` | No | 6 | multiple defaults (dev) |
| `ARCHON_PORT` | No | 12 | multiple defaults (dev, prod) |
| `ARCHON_PROD` | No | 1 | not specified |
| `ARCHON_REDIS_URL` | No | 3 | multiple defaults (not specified) |
| `ARCHON_RETRY_ATTEMPTS` | No | 1 | not specified |
| `ARCHON_SERVER_PORT` | No | 5 | not specified |
| `ARCHON_SERVER_URL` | No | 3 | not specified |
| `ARCHON_STATE_PERSISTENCE` | No | 1 | not specified |
| `ARCHON_STATUS_URL` | No | 1 | not specified |
| `ARCHON_TASK_TIMEOUT` | No | 1 | not specified |
| `ARCHON_TOPOLOGY` | No | 6 | dev |
| `ARCHON_UI_BASE_URL` | No | 1 | not specified |
| `ARCHON_UI_PORT` | No | 6 | not specified |
| `ARCHON_URL` | No | 3 | multiple defaults (not specified) |
| `ARCHON_USE_NPM` | No | 2 | prod |
| `AREA51_HOST` | No | 1 | not specified |
| `AREA51_LAN_IP` | No | 1 | not specified |
| `ASSET_CDN_URL` | No | 1 | not specified |
| `ASSIGNMENT_ENABLED` | No | 1 | not specified |
| `ASSIGNMENT_STRATEGY` | No | 1 | not specified |
| `AUDIT_LOGGING_ENABLED` | No | 1 | not specified |
| `AUDIT_LOG_DESTINATION` | No | 2 | not specified |
| `AUDIT_LOG_ENABLED` | No | 4 | prod |
| `AUDIT_LOG_ENCRYPT` | No | 2 | not specified |
| `AUDIT_LOG_LEVEL` | No | 2 | not specified |
| `AUDIT_LOG_RETENTION_DAYS` | No | 3 | prod |
| `AUTH_SECRET` | Yes | 1 | not specified |
| `AUTH_SERVICE_URL` | Yes | 5 | multiple defaults (dev) |
| `AUTOAPPROVE` | No | 1 | not specified |
| `AUTO_MIGRATE` | No | 1 | not specified |
| `AUTO_RECOVERY_ENABLED` | No | 3 | not specified |
| `AUTO_SEED_DATA` | No | 1 | not specified |
| `AWS_ACCESS_KEY_ID` | Yes | 9 | multiple defaults (dev, prod) |
| `AWS_REGION` | No | 9 | multiple defaults (dev, prod) |
| `AWS_S3_BUCKET` | No | 4 | multiple defaults (dev, prod) |
| `AWS_S3_ENDPOINT` | No | 4 | multiple defaults (dev, prod) |
| `AWS_S3_URL_EXPIRY` | No | 4 | dev, prod |
| `AWS_SECRET_ACCESS_KEY` | Yes | 9 | multiple defaults (dev, prod) |
| `BACKUP_DIR` | No | 2 | multiple defaults (not specified) |
| `BACKUP_ENABLED` | No | 7 | not specified |
| `BACKUP_INTERVAL_HOURS` | No | 3 | not specified |
| `BACKUP_MODELS` | No | 3 | not specified |
| `BACKUP_PATH` | No | 6 | multiple defaults (not specified) |
| `BACKUP_RETENTION` | No | 1 | not specified |
| `BACKUP_RETENTION_DAYS` | No | 13 | multiple defaults (not specified) |
| `BACKUP_S3_BUCKET` | No | 2 | not specified |
| `BACKUP_SCHEDULE` | No | 9 | multiple defaults (not specified) |
| `BASH_DEFAULT_TIMEOUT_MS` | No | 1 | not specified |
| `BASH_MAX_OUTPUT_LENGTH` | No | 1 | not specified |
| `BASH_MAX_TIMEOUT_MS` | No | 1 | not specified |
| `BATCH_SIZE` | No | 6 | multiple defaults (not specified) |
| `BATCH_TIMEOUT_MS` | No | 5 | multiple defaults (not specified) |
| `BATCH_WAIT_TIMEOUT_MS` | No | 2 | multiple defaults (not specified) |
| `BCRYPT_ROUNDS` | No | 1 | not specified |
| `BETTER_AUTH_SECRET` | Yes | 1 | not specified |
| `BITWARDEN_ADMIN_TOKEN` | Yes | 1 | not specified |
| `BITWARDEN_CLIENT_ID` | No | 2 | not specified |
| `BITWARDEN_CLIENT_SECRET` | Yes | 2 | not specified |
| `BITWARDEN_CLI_PATH` | No | 1 | not specified |
| `BITWARDEN_MCP_BIND` | No | 1 | not specified |
| `BITWARDEN_MCP_HOST` | No | 1 | not specified |
| `BITWARDEN_MCP_PORT` | No | 1 | not specified |
| `BITWARDEN_MCP_URL` | No | 1 | not specified |
| `BITWARDEN_PASSWORD` | Yes | 2 | not specified |
| `BODY_TIMEOUT` | No | 2 | prod |
| `BOOT_OPENCLAW` | No | 1 | not specified |
| `BOOT_OPENCLAW_UI_PROXY` | No | 1 | not specified |
| `BOOT_OPENCLAW_VOICE` | No | 1 | not specified |
| `BUILD_DATE` | No | 1 | not specified |
| `BUILD_ID` | No | 1 | dev |
| `BWS_ACCESS_TOKEN` | Yes | 5 | not specified |
| `BW_CLIENTID` | No | 1 | not specified |
| `BW_CLIENTSECRET` | Yes | 1 | not specified |
| `BW_SERVER` | No | 1 | not specified |
| `BW_SESSION` | No | 2 | not specified |
| `CACHE_ENABLED` | No | 3 | not specified |
| `CACHE_EVICTION_POLICY` | No | 1 | not specified |
| `CACHE_MAX_SIZE` | No | 3 | not specified |
| `CACHE_PATH` | No | 3 | multiple defaults (not specified) |
| `CACHE_SIZE` | No | 1 | not specified |
| `CACHE_SIZE_GB` | No | 1 | not specified |
| `CACHE_SIZE_PERCENT` | No | 1 | not specified |
| `CACHE_TTL` | No | 19 | multiple defaults (dev, prod) |
| `CACHE_TTL_AUTH` | Yes | 4 | multiple defaults (dev, prod) |
| `CACHE_TTL_CALCULATOR` | No | 1 | not specified |
| `CACHE_TTL_CONTENT` | No | 4 | multiple defaults (dev, prod) |
| `CACHE_TTL_DEFAULT` | No | 6 | multiple defaults (dev, prod) |
| `CACHE_TTL_QUOTES` | No | 2 | not specified |
| `CACHE_TTL_RATES` | No | 1 | not specified |
| `CACHE_TTL_SECONDS` | No | 1 | not specified |
| `CACHE_TTL_STATIC_DATA` | No | 2 | not specified |
| `CACHE_TTL_USER` | No | 4 | multiple defaults (dev, prod) |
| `CACHE_TTL_USER_SESSIONS` | No | 2 | not specified |
| `CADDY_HTTP_PORT` | No | 1 | not specified |
| `CADVISOR_PORT` | No | 14 | multiple defaults (dev) |
| `CALENDAR_DRIVER` | No | 1 | not specified |
| `CAMPAIGN_ENGINE_HOST` | No | 3 | not specified |
| `CAMPAIGN_ENGINE_PORT` | No | 11 | multiple defaults (dev) |
| `CAMPAIGN_ENGINE_URL` | No | 8 | multiple defaults (dev) |
| `CAMPAIGN_MAX_RETRIES` | No | 1 | not specified |
| `CAMPAIGN_RETRY_DELAY_MINUTES` | No | 1 | not specified |
| `CAMPAIGN_TIMEZONE` | No | 1 | not specified |
| `CAPTCHA_DRIVER` | No | 3 | dev |
| `CDN_INVALIDATION_KEY` | Yes | 2 | prod |
| `CDN_URL` | No | 2 | prod |
| `CF_ACCESS_CLIENT_ID` | No | 1 | not specified |
| `CF_ACCESS_CLIENT_SECRET` | Yes | 1 | not specified |
| `CF_ACCOUNT_ID` | No | 2 | not specified |
| `CF_API_TOKEN` | Yes | 2 | not specified |
| `CF_PAGES_PROJECT` | No | 2 | not specified |
| `CF_TUNNEL_ID_ORCHESTRATOR` | No | 2 | not specified |
| `CF_TUNNEL_NAME` | No | 2 | not specified |
| `CF_TUNNEL_TOKEN` | Yes | 2 | not specified |
| `CF_ZONE_ID` | No | 2 | not specified |
| `CHECKPOINT_AUTO_COMMIT` | No | 1 | not specified |
| `CHECKPOINT_BRANCH_STRATEGY` | No | 1 | not specified |
| `CHECKPOINT_ENABLED` | No | 3 | multiple defaults (not specified) |
| `CHECKPOINT_INCLUDE_METRICS` | No | 1 | not specified |
| `CHECKPOINT_INTERVAL` | No | 6 | multiple defaults (dev, prod) |
| `CHECKPOINT_INTERVAL_STEPS` | No | 2 | multiple defaults (not specified) |
| `CHECKPOINT_MAX_CHECKPOINTS` | No | 1 | not specified |
| `CHECKPOINT_MESSAGE_PREFIX` | No | 1 | not specified |
| `CHECKPOINT_RETENTION` | No | 1 | not specified |
| `CHECK_INTERVAL` | No | 2 | not specified |
| `CI` | No | 4 | multiple defaults (not specified) |
| `CIPHER_SUITES` | No | 2 | prod |
| `CI_PROVIDER` | No | 1 | not specified |
| `CLAM_AV_HOST` | No | 2 | prod |
| `CLAM_AV_PORT` | No | 2 | prod |
| `CLAUDE_API_KEY` | Yes | 2 | multiple defaults (not specified) |
| `CLAUDE_AUTO_APPROVE` | No | 1 | not specified |
| `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR` | No | 1 | not specified |
| `CLAUDE_CODE_ALWAYS_THINKING_ENABLED` | No | 1 | not specified |
| `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` | No | 1 | not specified |
| `CLAUDE_CODE_DISABLE_TERMINAL_TITLE` | No | 1 | not specified |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | No | 1 | not specified |
| `CLAUDE_CODE_GIT_BASH_PATH` | No | 1 | not specified |
| `CLAUDE_CODE_INTERACTION_MODE` | No | 1 | not specified |
| `CLAUDE_CODE_MAX_OUTPUT_TOKENS` | Yes | 1 | not specified |
| `CLAUDE_CODE_OAUTH_TOKEN` | Yes | 2 | not specified |
| `CLAUDE_CODE_SUBAGENT_MODEL` | No | 1 | not specified |
| `CLAUDE_CONFIG_PATH` | No | 2 | multiple defaults (not specified) |
| `CLAUDE_ESCALATE_MODEL` | No | 1 | not specified |
| `CLAUDE_FLOW_AGENT_POOL` | No | 7 | not specified |
| `CLAUDE_FLOW_ALPHA` | No | 1 | not specified |
| `CLAUDE_FLOW_API_KEY` | Yes | 1 | not specified |
| `CLAUDE_FLOW_AUTO_COMMIT` | No | 17 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_AUTO_LEARNING` | No | 10 | not specified |
| `CLAUDE_FLOW_AUTO_PUSH` | No | 14 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_AUTO_SCALING` | No | 1 | not specified |
| `CLAUDE_FLOW_AUTO_UPDATE` | No | 1 | not specified |
| `CLAUDE_FLOW_BASE_URL` | No | 1 | not specified |
| `CLAUDE_FLOW_CACHE_ENABLED` | No | 7 | not specified |
| `CLAUDE_FLOW_CACHE_SIZE` | No | 15 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_CHECKPOINTS_ENABLED` | No | 10 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_CHECKPOINT_ENABLED` | No | 7 | not specified |
| `CLAUDE_FLOW_CHECKPOINT_INTERVAL` | No | 1 | not specified |
| `CLAUDE_FLOW_CICD_MODE` | No | 1 | not specified |
| `CLAUDE_FLOW_CMD` | No | 1 | not specified |
| `CLAUDE_FLOW_CONCURRENT_TASKS` | No | 1 | not specified |
| `CLAUDE_FLOW_CONFIG` | No | 1 | not specified |
| `CLAUDE_FLOW_CONFIG_DIR` | No | 4 | multiple defaults (not specified) |
| `CLAUDE_FLOW_CONFIG_PATH` | No | 1 | not specified |
| `CLAUDE_FLOW_COORDINATION_ENABLED` | No | 1 | not specified |
| `CLAUDE_FLOW_DAEMON_ENABLED` | No | 1 | not specified |
| `CLAUDE_FLOW_DASHBOARD_PORT` | No | 1 | not specified |
| `CLAUDE_FLOW_DATA_DIR` | No | 5 | multiple defaults (not specified) |
| `CLAUDE_FLOW_DEBUG` | No | 17 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_DEV_PATH` | No | 2 | multiple defaults (dev) |
| `CLAUDE_FLOW_DISTRIBUTED` | No | 2 | not specified |
| `CLAUDE_FLOW_ENABLED` | No | 8 | not specified |
| `CLAUDE_FLOW_ENABLE_CHECKPOINTS` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_DEV_MODE` | No | 2 | dev |
| `CLAUDE_FLOW_ENABLE_FORKING` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_HOOKS` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_MCP` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_MEMORY` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_METRICS` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_NEURAL` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_PAUSE_RESUME` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_SWARM` | No | 1 | not specified |
| `CLAUDE_FLOW_ENABLE_TRACING` | No | 1 | not specified |
| `CLAUDE_FLOW_ENVIRONMENT` | No | 1 | not specified |
| `CLAUDE_FLOW_FORCE_UPDATE` | No | 1 | not specified |
| `CLAUDE_FLOW_GITHUB_INTEGRATION` | No | 10 | not specified |
| `CLAUDE_FLOW_HOOKS` | No | 1 | not specified |
| `CLAUDE_FLOW_HOOKS_ENABLED` | No | 14 | dev |
| `CLAUDE_FLOW_HOST` | No | 1 | not specified |
| `CLAUDE_FLOW_HOT_RELOAD` | No | 1 | dev |
| `CLAUDE_FLOW_LOG_FILE` | No | 1 | not specified |
| `CLAUDE_FLOW_LOG_LEVEL` | No | 17 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_MASTER_URL` | No | 1 | not specified |
| `CLAUDE_FLOW_MAX_AGENTS` | No | 17 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_MAX_AGENTS_SCALING` | No | 1 | not specified |
| `CLAUDE_FLOW_MAX_CONCURRENT_TASKS` | No | 14 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_MCP_HOST` | No | 1 | not specified |
| `CLAUDE_FLOW_MCP_MODE` | No | 5 | not specified |
| `CLAUDE_FLOW_MCP_PORT` | No | 4 | multiple defaults (not specified) |
| `CLAUDE_FLOW_MCP_URL` | No | 3 | multiple defaults (not specified) |
| `CLAUDE_FLOW_MEMORY` | No | 2 | not specified |
| `CLAUDE_FLOW_MEMORY_DIR` | No | 4 | multiple defaults (not specified) |
| `CLAUDE_FLOW_MEMORY_ENABLED` | No | 2 | not specified |
| `CLAUDE_FLOW_MEMORY_LIMIT` | No | 15 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_MEMORY_PERSIST` | No | 1 | not specified |
| `CLAUDE_FLOW_MEMORY_PERSISTENCE` | No | 10 | not specified |
| `CLAUDE_FLOW_MEMORY_SIZE` | No | 1 | not specified |
| `CLAUDE_FLOW_METRICS_PORT` | No | 3 | not specified |
| `CLAUDE_FLOW_MIN_AGENTS` | No | 1 | not specified |
| `CLAUDE_FLOW_MODE` | No | 29 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_NEURAL_OPTIMIZATION` | No | 13 | dev |
| `CLAUDE_FLOW_ORCHESTRATOR` | No | 3 | not specified |
| `CLAUDE_FLOW_PARALLEL_PROCESSING` | No | 9 | not specified |
| `CLAUDE_FLOW_PERFORMANCE_MODE` | No | 12 | dev |
| `CLAUDE_FLOW_PORT` | No | 12 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_PROFILE` | No | 1 | dev |
| `CLAUDE_FLOW_REDIS_URL` | No | 3 | multiple defaults (dev) |
| `CLAUDE_FLOW_REMOTE_EXECUTION` | No | 10 | not specified |
| `CLAUDE_FLOW_SCALE_DOWN_THRESHOLD` | No | 1 | not specified |
| `CLAUDE_FLOW_SCALE_UP_THRESHOLD` | No | 1 | not specified |
| `CLAUDE_FLOW_SECURITY_AUDIT` | No | 8 | prod |
| `CLAUDE_FLOW_SEMANTIC_SEARCH` | No | 1 | not specified |
| `CLAUDE_FLOW_SWARM_TOPOLOGY` | No | 2 | not specified |
| `CLAUDE_FLOW_TELEMETRY_ENABLED` | No | 17 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_TIMEOUT` | No | 1 | not specified |
| `CLAUDE_FLOW_TOPOLOGY` | No | 1 | not specified |
| `CLAUDE_FLOW_TRUTH_THRESHOLD` | No | 5 | not specified |
| `CLAUDE_FLOW_URL` | No | 6 | multiple defaults (dev) |
| `CLAUDE_FLOW_USE_NPM` | No | 2 | prod |
| `CLAUDE_FLOW_VERBOSE` | No | 5 | multiple defaults (dev, prod) |
| `CLAUDE_FLOW_VERIFY_MODE` | No | 6 | prod |
| `CLAUDE_FLOW_VERSION` | No | 9 | not specified |
| `CLAUDE_FLOW_WATCH_MODE` | No | 1 | dev |
| `CLAUDE_FLOW_WORKER_THREADS` | No | 15 | multiple defaults (dev, prod) |
| `CLAUDE_METRICS_PATH` | No | 1 | not specified |
| `CLAUDE_MODEL` | No | 3 | multiple defaults (not specified) |
| `CLAWDBOT_GATEWAY_PORT` | No | 2 | not specified |
| `CLAWDBOT_GATEWAY_TOKEN` | Yes | 2 | multiple defaults (not specified) |
| `CLEANUP_CHECKPOINTS_DAYS` | No | 2 | not specified |
| `CLEANUP_OLD_MODELS_DAYS` | No | 3 | multiple defaults (not specified) |
| `CLEARBIT_API_KEY` | Yes | 1 | not specified |
| `CLEAR_CACHE_INTERVAL` | No | 2 | multiple defaults (not specified) |
| `CLERK_PUBLISHABLE_KEY` | Yes | 2 | not specified |
| `CLERK_SECRET_KEY` | Yes | 3 | not specified |
| `CLERK_WEBHOOK_SECRET` | Yes | 1 | not specified |
| `CLOUDFLARED_HOSTNAME` | No | 2 | not specified |
| `CLOUDFLARED_LITELLM_HOSTNAME` | No | 2 | not specified |
| `CLOUDFLARED_TOKEN` | Yes | 4 | multiple defaults (not specified) |
| `CLOUDFLARED_TUNNEL_ID` | No | 4 | not specified |
| `CLOUDFLARED_TUNNEL_NAME` | No | 8 | multiple defaults (not specified) |
| `CLOUDFLARED_TUNNEL_TOKEN` | Yes | 10 | multiple defaults (not specified) |
| `CLOUDFLARED_TUNNEL_URL` | No | 2 | not specified |
| `CLOUDFLARE_ACCOUNT_ID` | No | 10 | multiple defaults (not specified) |
| `CLOUDFLARE_API` | No | 1 | not specified |
| `CLOUDFLARE_API_KEY` | Yes | 1 | not specified |
| `CLOUDFLARE_API_TOKEN` | Yes | 8 | multiple defaults (prod) |
| `CLOUDFLARE_COMPATIBILITY_DATE` | No | 1 | not specified |
| `CLOUDFLARE_EMAIL` | No | 1 | not specified |
| `CLOUDFLARE_ENABLED` | No | 4 | prod |
| `CLOUDFLARE_GLOBAL_API` | No | 1 | not specified |
| `CLOUDFLARE_ORIGIN_CA_KEY` | Yes | 1 | not specified |
| `CLOUDFLARE_TOKEN` | Yes | 1 | not specified |
| `CLOUDFLARE_TUNNEL_ENABLED` | No | 4 | prod |
| `CLOUDFLARE_TUNNEL_ID` | No | 1 | not specified |
| `CLOUDFLARE_TUNNEL_ID_ORCHESTRATOR` | No | 3 | multiple defaults (not specified) |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3060` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3090TI` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_ID_WORKER_RTX5090` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_LOGLEVEL` | No | 3 | not specified |
| `CLOUDFLARE_TUNNEL_METRICS` | No | 3 | not specified |
| `CLOUDFLARE_TUNNEL_NAME` | No | 4 | multiple defaults (not specified) |
| `CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR` | No | 3 | not specified |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090` | No | 2 | not specified |
| `CLOUDFLARE_TUNNEL_TOKEN` | Yes | 9 | multiple defaults (not specified) |
| `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` | Yes | 14 | multiple defaults (dev) |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060` | Yes | 4 | multiple defaults (not specified) |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI` | Yes | 4 | multiple defaults (not specified) |
| `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090` | Yes | 4 | multiple defaults (not specified) |
| `CLOUDFLARE_ZONE_ID` | No | 12 | multiple defaults (prod) |
| `CLUSTER_NUM_WORKERS` | No | 2 | prod |
| `CODANNA_API_KEY` | Yes | 1 | not specified |
| `CODANNA_DISABLED` | No | 1 | not specified |
| `CODELLAMA_13B_PARAMS` | No | 1 | not specified |
| `CODELLAMA_34B_PARAMS` | No | 1 | not specified |
| `CODELLAMA_70B_PARAMS` | No | 1 | not specified |
| `COHERE_API_KEY` | Yes | 1 | not specified |
| `COLLECTION_ID` | No | 2 | not specified |
| `COMPILATION_TIMEOUT` | No | 2 | not specified |
| `COMPLETION_MODEL` | No | 13 | multiple defaults (dev, prod) |
| `COMPOSE_DOCKER_CLI_BUILD` | No | 13 | not specified |
| `COMPOSE_FILE` | No | 4 | multiple defaults (not specified) |
| `COMPOSE_HTTP_TIMEOUT` | No | 2 | not specified |
| `COMPOSE_PROFILES` | No | 11 | multiple defaults (dev) |
| `COMPOSE_PROJECT_NAME` | No | 20 | multiple defaults (dev) |
| `COMPOSIO_API_KEY` | Yes | 1 | not specified |
| `CONFIG_DIR` | No | 1 | not specified |
| `CONFLICT_STRATEGY` | No | 2 | not specified |
| `CONNECTION_POOL_SIZE` | No | 8 | multiple defaults (not specified) |
| `CONNECTION_TIMEOUT` | No | 1 | not specified |
| `CONSENT_REQUIRED` | No | 1 | not specified |
| `CONSOLE_API_URL` | No | 1 | dev |
| `CONSOLE_WEB_URL` | No | 1 | dev |
| `CONSUL_CLIENT_ADDR` | No | 3 | multiple defaults (not specified) |
| `CONSUL_ENABLED` | No | 4 | not specified |
| `CONSUL_HTTP_ADDR` | No | 1 | not specified |
| `CONSUL_SERVER_ADDR` | No | 3 | not specified |
| `CONTAINER_MEMORY_LIMIT` | No | 1 | not specified |
| `CONTEXT7_API_KEY` | Yes | 3 | not specified |
| `CONTEXT_OVERLAP` | No | 1 | not specified |
| `CONTEXT_SERVICE_URL` | No | 1 | dev |
| `CONTEXT_WINDOW` | No | 2 | multiple defaults (not specified) |
| `CONTINUOUS_INTEGRATION` | No | 4 | multiple defaults (not specified) |
| `CORS_ALLOWED_ORIGINS` | No | 11 | multiple defaults (dev, prod) |
| `CORS_ALLOW_CREDENTIALS` | Yes | 3 | prod |
| `CORS_ALLOW_HEADERS` | No | 4 | dev, prod |
| `CORS_CREDENTIALS` | Yes | 4 | dev, prod |
| `CORS_ENABLED` | No | 1 | not specified |
| `CORS_METHODS` | No | 4 | dev, prod |
| `CORS_ORIGIN` | No | 15 | multiple defaults (dev, prod) |
| `COVERAGE_ENABLED` | No | 3 | not specified |
| `COVERAGE_REPORT_PATH` | No | 3 | not specified |
| `CPU_LIMIT` | No | 3 | multiple defaults (not specified) |
| `CPU_THRESHOLD_PERCENT` | No | 3 | multiple defaults (not specified) |
| `CREATE_GH_RELEASE` | No | 5 | not specified |
| `CRM_API_KEY` | Yes | 1 | not specified |
| `CRM_DASHBOARD_PORT` | No | 1 | dev |
| `CRM_DASHBOARD_URL` | No | 1 | dev |
| `CRM_URL` | No | 2 | not specified |
| `CRON_SCHEDULE` | No | 2 | not specified |
| `CSP_ENABLED` | No | 1 | not specified |
| `CUDA_DEVICE_ORDER` | No | 3 | not specified |
| `CUDA_PATH` | No | 2 | not specified |
| `CUDA_VERSION` | No | 4 | not specified |
| `CUDA_VISIBLE_DEVICES` | No | 12 | not specified |
| `CUSTOM_NODES_PATH` | No | 1 | not specified |
| `DAEMON_ENABLED` | No | 1 | not specified |
| `DATABASE_HOST` | No | 1 | dev |
| `DATABASE_MAX_OVERFLOW` | No | 1 | not specified |
| `DATABASE_NAME` | No | 1 | dev |
| `DATABASE_PASSWORD` | Yes | 1 | not specified |
| `DATABASE_POOL_MAX` | No | 2 | multiple defaults (prod) |
| `DATABASE_POOL_MIN` | No | 2 | multiple defaults (prod) |
| `DATABASE_POOL_SIZE` | No | 1 | not specified |
| `DATABASE_PORT` | No | 1 | not specified |
| `DATABASE_SCHEMA` | No | 1 | not specified |
| `DATABASE_SSL` | No | 2 | multiple defaults (prod) |
| `DATABASE_URL` | No | 28 | multiple defaults (dev, prod) |
| `DATABASE_USER` | No | 1 | not specified |
| `DATADOG_API_KEY` | Yes | 2 | prod |
| `DATADOG_ENABLED` | No | 2 | prod |
| `DATADOG_SITE` | No | 2 | prod |
| `DATA_DELETION_RETENTION_DAYS` | No | 2 | prod |
| `DATA_DIR` | No | 1 | not specified |
| `DATA_ENCRYPTION_AT_REST` | No | 2 | prod |
| `DATA_ENCRYPTION_IN_TRANSIT` | No | 2 | prod |
| `DATA_RETENTION_APPLICATIONS` | No | 2 | not specified |
| `DATA_RETENTION_CONVERSATIONS` | No | 2 | not specified |
| `DATA_RETENTION_DAYS` | No | 4 | multiple defaults (dev, prod) |
| `DATA_RETENTION_SYSTEM_LOGS` | No | 2 | not specified |
| `DB_BACKUP_ENABLED` | No | 2 | prod |
| `DB_BACKUP_RETENTION_DAYS` | No | 2 | prod |
| `DB_BACKUP_S3_BUCKET` | No | 2 | prod |
| `DB_BACKUP_SCHEDULE` | No | 2 | prod |
| `DB_CONNECTION_POOL_SIZE` | No | 1 | not specified |
| `DB_CONNECTION_TIMEOUT` | No | 5 | multiple defaults (dev, prod) |
| `DB_HOST` | No | 7 | multiple defaults (dev, prod) |
| `DB_IDLE_TIMEOUT` | No | 6 | multiple defaults (dev, prod) |
| `DB_MAX_CONNECTIONS` | No | 1 | not specified |
| `DB_MIN_CONNECTIONS` | No | 1 | not specified |
| `DB_NAME` | No | 7 | multiple defaults (dev, prod) |
| `DB_PASSWORD` | Yes | 8 | multiple defaults (dev, prod) |
| `DB_POOL_IDLE_TIMEOUT` | No | 2 | not specified |
| `DB_POOL_MAX` | No | 7 | multiple defaults (dev, prod) |
| `DB_POOL_MIN` | No | 7 | multiple defaults (dev, prod) |
| `DB_PORT` | No | 7 | dev, prod |
| `DB_QUERY_LOG` | No | 4 | multiple defaults (dev, prod) |
| `DB_QUERY_SLOW_THRESHOLD` | No | 4 | multiple defaults (dev, prod) |
| `DB_REPLICA_ENABLED` | No | 2 | prod |
| `DB_REPLICA_HOST` | No | 2 | prod |
| `DB_SSL` | No | 4 | multiple defaults (dev, prod) |
| `DB_STATEMENT_TIMEOUT` | No | 4 | multiple defaults (dev, prod) |
| `DB_TYPE` | No | 1 | not specified |
| `DB_USER` | No | 3 | not specified |
| `DB_USERNAME` | No | 4 | multiple defaults (dev, prod) |
| `DDOS_PROTECTION_ENABLED` | No | 2 | prod |
| `DEBUG` | No | 26 | multiple defaults (dev, prod) |
| `DEBUG_EXPRESS` | No | 2 | dev |
| `DEBUG_MODE` | No | 11 | multiple defaults (dev) |
| `DEEPSEEK_API_KEY` | Yes | 2 | not specified |
| `DEEPSEEK_CODER_6B7_PARAMS` | No | 1 | not specified |
| `DEFAULT_COMPLIANCE_EMAIL` | No | 1 | not specified |
| `DEFAULT_LOAN_OFFICER_EMAIL` | No | 1 | not specified |
| `DEFAULT_MODEL` | No | 2 | not specified |
| `DEFAULT_PROVIDER` | No | 1 | not specified |
| `DEFAULT_QUOTE_EXPIRY_DAYS` | No | 1 | not specified |
| `DEFAULT_TEMPERATURE` | No | 2 | not specified |
| `DEFAULT_THEME` | No | 1 | not specified |
| `DEFAULT_TIMEOUT_S` | No | 2 | multiple defaults (dev) |
| `DEFAULT_USER_ROLE` | No | 1 | not specified |
| `DEPLOYMENT_ENVIRONMENT` | No | 1 | not specified |
| `DEPLOYMENT_MIN_READY_SECONDS` | No | 2 | prod |
| `DEPLOYMENT_STRATEGY` | No | 2 | prod |
| `DEPLOYMENT_TARGET` | No | 1 | not specified |
| `DEREGISTRATION_CRITICAL_SERVICE_AFTER` | No | 1 | not specified |
| `DESKTOP_COMMANDER_CMD` | No | 1 | not specified |
| `DEVELOPMENT_MODE` | No | 4 | multiple defaults (dev, prod) |
| `DEV_MODE` | No | 1 | not specified |
| `DEV_PORT` | No | 2 | dev |
| `DIFY_API_KEY` | Yes | 9 | multiple defaults (not specified) |
| `DIFY_API_PORT` | No | 3 | not specified |
| `DIFY_API_URL` | No | 5 | multiple defaults (dev) |
| `DIFY_BASE_URL` | No | 1 | not specified |
| `DIFY_CONSOLE_URL` | No | 3 | multiple defaults (dev) |
| `DIFY_DATABASE_URL` | No | 1 | not specified |
| `DIFY_DB` | No | 3 | not specified |
| `DIFY_DB_NAME` | No | 6 | multiple defaults (dev) |
| `DIFY_DB_PASSWORD` | Yes | 1 | not specified |
| `DIFY_DB_URL` | No | 1 | dev |
| `DIFY_DB_USERNAME` | No | 1 | not specified |
| `DIFY_ENABLED` | No | 7 | not specified |
| `DIFY_ENCRYPTION_KEY` | Yes | 9 | multiple defaults (not specified) |
| `DIFY_HOST` | No | 1 | not specified |
| `DIFY_JWT_SECRET` | Yes | 1 | not specified |
| `DIFY_LOG_LEVEL` | No | 1 | not specified |
| `DIFY_PORT` | No | 5 | multiple defaults (dev) |
| `DIFY_POSTGRES_DB` | No | 8 | not specified |
| `DIFY_POSTGRES_HOST` | No | 4 | dev |
| `DIFY_POSTGRES_PASSWORD` | Yes | 13 | multiple defaults (not specified) |
| `DIFY_POSTGRES_PORT` | No | 7 | multiple defaults (not specified) |
| `DIFY_POSTGRES_USER` | No | 8 | not specified |
| `DIFY_REDIS_DB` | No | 2 | not specified |
| `DIFY_REDIS_HOST` | No | 4 | dev |
| `DIFY_REDIS_PASSWORD` | Yes | 2 | not specified |
| `DIFY_REDIS_PORT` | No | 4 | not specified |
| `DIFY_REDIS_URL` | No | 1 | not specified |
| `DIFY_SANDBOX_API_KEY` | Yes | 3 | multiple defaults (not specified) |
| `DIFY_SANDBOX_PORT` | No | 3 | not specified |
| `DIFY_SECRET_KEY` | Yes | 17 | multiple defaults (not specified) |
| `DIFY_URL` | No | 11 | multiple defaults (dev) |
| `DIFY_WEB_BIND` | No | 1 | not specified |
| `DIFY_WEB_PORT` | No | 6 | multiple defaults (not specified) |
| `DIFY_WEB_URL` | No | 2 | dev |
| `DISABLE_NON_ESSENTIAL_MODEL_CALLS` | No | 1 | not specified |
| `DISABLE_PROMPT_CACHING_HAIKU` | No | 1 | not specified |
| `DISABLE_TELEMETRY` | No | 1 | not specified |
| `DISCORD_BOT_TOKEN` | Yes | 2 | not specified |
| `DISCORD_WEBHOOK_URL` | Yes | 2 | not specified |
| `DISCOVERY_INTERVAL` | No | 2 | not specified |
| `DISK_THRESHOLD_PERCENT` | No | 3 | not specified |
| `DISTRIBUTED_FINETUNING_ENABLED` | No | 1 | not specified |
| `DISTRIBUTED_INFERENCE_ENABLED` | No | 2 | not specified |
| `DISTRIBUTE_TO_PC2_WEIGHT` | No | 1 | not specified |
| `DISTRIBUTE_TO_PC3_WEIGHT` | No | 1 | not specified |
| `DNC_CHECK_ENABLED` | No | 1 | not specified |
| `DOCKERHUB_NAMESPACE` | No | 2 | not specified |
| `DOCKERHUB_TOKEN` | Yes | 4 | not specified |
| `DOCKERHUB_USERNAME` | No | 5 | multiple defaults (not specified) |
| `DOCKER_BUILDKIT` | No | 13 | not specified |
| `DOCKER_COMPOSE_PROJECT_NAME` | No | 2 | not specified |
| `DOCKER_CPU_LIMIT` | No | 2 | not specified |
| `DOCKER_HOST` | No | 2 | not specified |
| `DOCKER_IMAGE` | No | 2 | prod |
| `DOCKER_MCP_HOST` | No | 1 | not specified |
| `DOCKER_MCP_PORT` | No | 1 | not specified |
| `DOCKER_MEMORY_LIMIT` | No | 2 | not specified |
| `DOCKER_NETWORK` | No | 2 | multiple defaults (not specified) |
| `DOCKER_REGISTRY` | No | 3 | prod |
| `DOCKER_REGISTRY_PASS` | Yes | 1 | not specified |
| `DOCKER_REGISTRY_USER` | No | 1 | not specified |
| `DOCKER_SOCKET` | No | 1 | not specified |
| `DOCKER_SUBNET` | No | 3 | not specified |
| `DOCKER_SUBNET_ORCHESTRATOR` | No | 1 | not specified |
| `DOCKER_SUBNET_RTX3060` | No | 1 | not specified |
| `DOCKER_SUBNET_RTX3090` | No | 1 | not specified |
| `DOCKER_SUBNET_RTX5090` | No | 1 | not specified |
| `DOCKHERHUB_TOKEN` | Yes | 1 | not specified |
| `DOCUMENT_API_URL` | No | 3 | multiple defaults (dev) |
| `DOCUMENT_PROCESSOR_PORT` | No | 1 | dev |
| `DOCUMENT_PROCESSOR_URL` | No | 1 | dev |
| `DOCUSIGN_ACCOUNT_ID` | No | 1 | not specified |
| `DOCUSIGN_BASE_PATH` | No | 1 | not specified |
| `DOCUSIGN_INTEGRATION_KEY` | Yes | 1 | not specified |
| `DOCUSIGN_PRIVATE_KEY_PATH` | Yes | 1 | not specified |
| `DOCUSIGN_USER_ID` | No | 1 | not specified |
| `DOMAIN` | No | 4 | multiple defaults (dev) |
| `DOMAIN_API` | No | 2 | not specified |
| `DOMAIN_APP` | No | 2 | not specified |
| `DOMAIN_CRM` | No | 2 | not specified |
| `DOMAIN_NAME` | No | 2 | not specified |
| `DOMAIN_PRIMARY` | No | 2 | not specified |
| `DYNAMIC_BATCHING_ENABLED` | No | 2 | not specified |
| `ELASTICSEARCH_INDEX` | No | 1 | not specified |
| `ELASTICSEARCH_NODE` | No | 1 | dev |
| `EMAIL_DRIVER` | No | 4 | multiple defaults (dev) |
| `EMAIL_FROM` | No | 3 | multiple defaults (not specified) |
| `EMAIL_FROM_ADDRESS` | No | 5 | multiple defaults (dev) |
| `EMAIL_FROM_NAME` | No | 1 | not specified |
| `EMAIL_HOST` | No | 1 | not specified |
| `EMAIL_NOTIFICATIONS` | No | 1 | not specified |
| `EMAIL_PASSWORD` | Yes | 1 | not specified |
| `EMAIL_PORT` | No | 1 | not specified |
| `EMAIL_PROVIDER` | No | 4 | multiple defaults (dev, prod) |
| `EMAIL_SECURE` | No | 1 | not specified |
| `EMAIL_SMTP_HOST` | No | 3 | not specified |
| `EMAIL_SMTP_PASS` | Yes | 3 | not specified |
| `EMAIL_SMTP_PORT` | No | 3 | not specified |
| `EMAIL_SMTP_USER` | No | 3 | not specified |
| `EMAIL_SYSTEM_ADDRESS` | No | 4 | multiple defaults (dev) |
| `EMAIL_USER` | No | 1 | not specified |
| `EMBEDDING_BATCH_SIZE` | No | 4 | multiple defaults (not specified) |
| `EMBEDDING_CACHE_DIR` | No | 2 | not specified |
| `EMBEDDING_DEVICE` | No | 3 | not specified |
| `EMBEDDING_DIMENSIONS` | No | 1 | not specified |
| `EMBEDDING_INTERNAL_URL` | No | 2 | not specified |
| `EMBEDDING_MAX_SEQUENCE_LENGTH` | No | 2 | not specified |
| `EMBEDDING_MODEL` | No | 4 | multiple defaults (not specified) |
| `EMBEDDING_PORT` | No | 2 | not specified |
| `ENABLE_ADAPTIVE_TOPOLOGY` | No | 1 | not specified |
| `ENABLE_AGENT_WORK_ORDERS` | No | 2 | not specified |
| `ENABLE_ALERTS` | No | 1 | not specified |
| `ENABLE_AST_ANALYSIS` | No | 1 | dev |
| `ENABLE_AUDIT_LOGGING` | No | 1 | not specified |
| `ENABLE_AUTH` | Yes | 1 | not specified |
| `ENABLE_AUTO_FAILOVER` | No | 1 | not specified |
| `ENABLE_AUTO_SCALING` | No | 4 | not specified |
| `ENABLE_BRANCHING` | No | 2 | not specified |
| `ENABLE_CACHING` | No | 3 | not specified |
| `ENABLE_CLOUDFLARED` | No | 2 | not specified |
| `ENABLE_CLUSTERING` | No | 2 | prod |
| `ENABLE_CODE_GENERATION` | No | 1 | dev |
| `ENABLE_COMPLIANCE_CHECKS` | No | 1 | not specified |
| `ENABLE_COST_TRACKING` | No | 1 | not specified |
| `ENABLE_CRM` | No | 4 | multiple defaults (not specified) |
| `ENABLE_CSRF_PROTECTION` | No | 4 | multiple defaults (dev, prod) |
| `ENABLE_DEPENDENCY_GRAPH` | No | 1 | dev |
| `ENABLE_DETAILED_LOGGING` | No | 1 | dev |
| `ENABLE_DEV_TOOLS` | No | 1 | not specified |
| `ENABLE_DISTRIBUTED_TRAINING` | No | 1 | not specified |
| `ENABLE_DUAL_ORCHESTRATOR` | No | 1 | dev |
| `ENABLE_DYNAMIC_ADJUSTMENT` | No | 2 | not specified |
| `ENABLE_DYNAMIC_BATCHING` | No | 1 | not specified |
| `ENABLE_FLASH_ATTENTION_2` | No | 2 | not specified |
| `ENABLE_GPU` | No | 2 | not specified |
| `ENABLE_GPU_METRICS` | No | 2 | not specified |
| `ENABLE_GPU_POWER_MONITORING` | No | 2 | not specified |
| `ENABLE_GPU_THERMAL_MONITORING` | No | 2 | not specified |
| `ENABLE_GPU_WORKERS` | No | 4 | multiple defaults (not specified) |
| `ENABLE_GRADIENT_ACCUMULATION` | No | 1 | not specified |
| `ENABLE_GUARDRAILS` | No | 1 | not specified |
| `ENABLE_GZIP` | No | 2 | prod |
| `ENABLE_HEALTH_CHECKS` | No | 2 | not specified |
| `ENABLE_HEALTH_MONITOR` | No | 2 | not specified |
| `ENABLE_HELMET` | No | 4 | dev, prod |
| `ENABLE_HOT_RELOAD` | No | 3 | dev |
| `ENABLE_HSTS` | No | 4 | multiple defaults (dev, prod) |
| `ENABLE_IMAGE_ANALYSIS` | No | 1 | dev |
| `ENABLE_INFERENCE_PROFILING` | No | 1 | not specified |
| `ENABLE_JIT_COMPILATION` | No | 2 | not specified |
| `ENABLE_JOB_QUEUE` | No | 4 | dev, prod |
| `ENABLE_KV_CACHE` | No | 1 | not specified |
| `ENABLE_LOAD_BALANCING` | No | 2 | not specified |
| `ENABLE_LOCAL_LB` | No | 1 | not specified |
| `ENABLE_LOGGING` | No | 1 | not specified |
| `ENABLE_LOG_SHIPPING` | No | 2 | not specified |
| `ENABLE_MEMORY_OPTIMIZATION` | No | 2 | not specified |
| `ENABLE_MEMORY_PERSISTENCE` | No | 1 | not specified |
| `ENABLE_METRICS` | No | 7 | not specified |
| `ENABLE_MONITORING` | No | 7 | multiple defaults (not specified) |
| `ENABLE_MULTIMODAL` | No | 1 | dev |
| `ENABLE_MULTI_GPU_SYNC` | No | 2 | multiple defaults (not specified) |
| `ENABLE_NEURAL_AGENTS` | No | 1 | not specified |
| `ENABLE_NEURAL_COORDINATION` | No | 1 | not specified |
| `ENABLE_NSYS_PROFILING` | No | 1 | not specified |
| `ENABLE_PC2_FALLBACK` | No | 1 | not specified |
| `ENABLE_PC3_FALLBACK` | No | 1 | not specified |
| `ENABLE_PERFORMANCE_MONITORING` | No | 1 | dev |
| `ENABLE_PREFETCHING` | No | 3 | not specified |
| `ENABLE_PROFILING` | No | 5 | multiple defaults (not specified) |
| `ENABLE_QUANTIZATION` | No | 3 | not specified |
| `ENABLE_RATE_LIMITING` | No | 1 | not specified |
| `ENABLE_REQUEST_ID` | No | 2 | dev |
| `ENABLE_REQUEST_PRIORITY` | No | 1 | not specified |
| `ENABLE_REVISIONS` | No | 2 | not specified |
| `ENABLE_SECURITY_SCAN` | No | 1 | dev |
| `ENABLE_SELF_HEALING` | No | 1 | not specified |
| `ENABLE_SIGNUP` | No | 1 | not specified |
| `ENABLE_SOURCE_MAPS` | No | 4 | multiple defaults (dev, prod) |
| `ENABLE_SPECULATIVE_DECODING` | No | 1 | not specified |
| `ENABLE_SWARM_COORDINATION` | No | 2 | not specified |
| `ENABLE_TAILSCALE` | No | 2 | not specified |
| `ENABLE_TELEMETRY` | No | 1 | not specified |
| `ENABLE_TLS` | No | 3 | not specified |
| `ENABLE_TRACING` | No | 5 | not specified |
| `ENABLE_VIRUS_SCAN` | No | 2 | prod |
| `ENABLE_WORKFLOWS` | No | 4 | multiple defaults (not specified) |
| `ENABLE_WORKFLOW_CACHING` | No | 1 | not specified |
| `ENCRYPTION_ALGORITHM` | No | 6 | dev, prod |
| `ENCRYPTION_IV_LENGTH` | No | 2 | not specified |
| `ENCRYPTION_KEY` | Yes | 22 | multiple defaults (dev, prod) |
| `ENCRYPTION_KEY_PATH` | Yes | 1 | not specified |
| `ENRICHMENT_ENABLED` | No | 1 | not specified |
| `ENRICHMENT_PROVIDER` | No | 1 | not specified |
| `ENV` | No | 1 | dev |
| `ENVIRONMENT` | No | 2 | dev |
| `EQUIFAX_API_KEY` | Yes | 2 | not specified |
| `EVENT_SERVER_HEARTBEAT` | No | 3 | not specified |
| `EVENT_SERVER_HTTP_PORT` | No | 4 | not specified |
| `EVENT_SERVER_MAX_CONNECTIONS` | No | 3 | not specified |
| `EVENT_SERVER_REPLAY_BUFFER` | No | 3 | not specified |
| `EVENT_SERVER_WS_PORT` | No | 4 | not specified |
| `EWC_CONSOLIDATION_INTERVAL` | No | 1 | not specified |
| `EWC_ENABLED` | No | 1 | not specified |
| `EWC_LAMBDA` | No | 1 | not specified |
| `EXA_API_KEY` | Yes | 1 | not specified |
| `EXPERIAN_API_KEY` | Yes | 2 | not specified |
| `EXPERIMENTAL_FLASH_ATTENTION` | No | 2 | not specified |
| `EXPERIMENTAL_QUANTIZATION` | No | 2 | not specified |
| `EXPERIMENTAL_TENSOR_PARALLEL` | No | 2 | not specified |
| `EXPORT_METRICS` | No | 2 | not specified |
| `FAIL2BAN_ENABLED` | No | 1 | not specified |
| `FAILOVER_RETRY_INTERVAL` | No | 1 | not specified |
| `FAILOVER_TIMEOUT` | No | 1 | not specified |
| `FALKORDB_AOF_ENABLED` | No | 3 | not specified |
| `FALKORDB_AOF_FSYNC` | No | 2 | not specified |
| `FALKORDB_AOF_SYNC` | No | 9 | dev |
| `FALKORDB_BIND` | No | 1 | not specified |
| `FALKORDB_DB_INDEX` | No | 1 | not specified |
| `FALKORDB_ENABLED` | No | 4 | not specified |
| `FALKORDB_EVICTION_POLICY` | No | 4 | not specified |
| `FALKORDB_GRAPH` | No | 2 | not specified |
| `FALKORDB_GRAPH_KEY` | Yes | 2 | not specified |
| `FALKORDB_GRAPH_NAME` | No | 3 | not specified |
| `FALKORDB_HOST` | No | 4 | multiple defaults (dev) |
| `FALKORDB_MAX_MEMORY` | No | 12 | multiple defaults (dev) |
| `FALKORDB_PASSWORD` | Yes | 18 | multiple defaults (dev) |
| `FALKORDB_PERSISTENCE` | No | 3 | multiple defaults (not specified) |
| `FALKORDB_PERSISTENCE_DIR` | No | 2 | not specified |
| `FALKORDB_PERSIST_DATA` | No | 2 | not specified |
| `FALKORDB_PORT` | No | 13 | multiple defaults (not specified) |
| `FALKORDB_REPLICATION` | No | 3 | multiple defaults (not specified) |
| `FALKORDB_REPLICA_URLS` | No | 2 | dev |
| `FALKORDB_SNAPSHOT_ENABLED` | No | 2 | not specified |
| `FALKORDB_SNAPSHOT_INTERVAL` | No | 2 | not specified |
| `FALKORDB_URL` | No | 7 | dev |
| `FALLBACK_MODELS` | No | 1 | not specified |
| `FALLBACK_PROVIDERS` | No | 1 | not specified |
| `FANNIE_MAE_API_KEY` | Yes | 1 | not specified |
| `FEATURE_ADMIN_PORTAL` | No | 2 | not specified |
| `FEATURE_ADVANCED_ANALYTICS` | No | 4 | multiple defaults (dev, prod) |
| `FEATURE_AI_CHATBOT` | No | 1 | not specified |
| `FEATURE_ANALYTICS_DASHBOARD` | No | 2 | not specified |
| `FEATURE_AUTOMATED_UNDERWRITING` | No | 1 | not specified |
| `FEATURE_AUTO_LEARNING` | No | 2 | not specified |
| `FEATURE_A_B_TESTING` | No | 2 | not specified |
| `FEATURE_BETA_API` | No | 4 | multiple defaults (dev, prod) |
| `FEATURE_DEBUG_ENDPOINTS` | No | 4 | multiple defaults (dev, prod) |
| `FEATURE_DEBUG_TOOLS` | No | 1 | dev |
| `FEATURE_DOCUMENT_OCR` | No | 5 | not specified |
| `FEATURE_DRIP_CAMPAIGNS` | No | 3 | not specified |
| `FEATURE_EXPERIMENTAL` | No | 1 | dev |
| `FEATURE_EXPERIMENTAL_UI` | No | 4 | multiple defaults (dev, prod) |
| `FEATURE_LOCAL_GPU` | No | 2 | not specified |
| `FEATURE_MEMORY_SYSTEMS` | No | 3 | not specified |
| `FEATURE_MOCK_DATA` | No | 4 | multiple defaults (dev, prod) |
| `FEATURE_MOCK_SERVICES` | No | 1 | dev |
| `FEATURE_MULTI_LANGUAGE` | No | 2 | not specified |
| `FEATURE_MULTI_LENDER_QUOTES` | No | 1 | not specified |
| `FEATURE_NEURAL_OPTIMIZATION` | No | 2 | not specified |
| `FEATURE_PREDICTIVE_ANALYTICS` | No | 2 | not specified |
| `FEATURE_SWARM_ORCHESTRATION` | No | 1 | not specified |
| `FEATURE_VOICE_AUTOMATION` | No | 2 | not specified |
| `FEATURE_VOICE_CALLS` | No | 2 | not specified |
| `FILE_TOKEN_SECRET` | Yes | 2 | multiple defaults (dev, prod) |
| `FINETUNING_API_KEY` | Yes | 1 | not specified |
| `FINETUNING_BATCH_SIZE` | No | 1 | not specified |
| `FINETUNING_DATASET_PATH` | No | 1 | not specified |
| `FINETUNING_ENABLED` | No | 1 | not specified |
| `FINETUNING_EPOCHS` | No | 1 | not specified |
| `FINETUNING_HOST` | No | 1 | not specified |
| `FINETUNING_LEARNING_RATE` | No | 1 | not specified |
| `FINETUNING_LOG_FREQUENCY` | No | 1 | not specified |
| `FINETUNING_MAX_DATASET_SIZE_GB` | No | 1 | not specified |
| `FINETUNING_MAX_STEPS` | No | 1 | not specified |
| `FINETUNING_OUTPUT_PATH` | No | 1 | not specified |
| `FINETUNING_PORT` | No | 1 | not specified |
| `FINETUNING_SAVE_FREQUENCY` | No | 1 | not specified |
| `FINETUNING_WARMUP_STEPS` | No | 1 | not specified |
| `FINE_GH_PAT` | No | 1 | not specified |
| `FIRECRAWL_API_KEY` | Yes | 1 | not specified |
| `FIREWALL_ENABLED` | No | 3 | not specified |
| `FLASH_ATTENTION_BACKEND` | No | 2 | not specified |
| `FLASH_ATTENTION_BLOCK_SIZE` | No | 1 | not specified |
| `FLASH_ATTENTION_ENABLED` | No | 1 | not specified |
| `FLASH_ATTENTION_TARGET_SPEEDUP` | No | 1 | not specified |
| `FLOWISE_ENABLED` | No | 2 | not specified |
| `FLOW_NEXUS_API_KEY` | Yes | 4 | multiple defaults (not specified) |
| `FLOW_NEXUS_CMD` | No | 1 | not specified |
| `FLOW_NEXUS_DISABLED` | No | 1 | not specified |
| `FLOW_NEXUS_ENABLED` | No | 5 | not specified |
| `FLOW_NEXUS_MCP_URL` | No | 1 | not specified |
| `FLOW_NEXUS_MODE` | No | 1 | not specified |
| `FLOW_NEXUS_TOKEN` | Yes | 1 | not specified |
| `FLOW_NEXUS_URL` | No | 4 | not specified |
| `FLOW_NEXUS_USER_ID` | No | 4 | multiple defaults (not specified) |
| `FORCE_HTTPS` | No | 1 | not specified |
| `FP8_QUANTIZATION` | No | 2 | not specified |
| `FREDDIE_MAC_API_KEY` | Yes | 1 | not specified |
| `FREERATEUPDATER_WEBHOOK_SECRET` | Yes | 2 | not specified |
| `FREERATEUPDATE_API_KEY` | Yes | 2 | not specified |
| `FREERATEUPDATE_EMAIL` | No | 1 | not specified |
| `FREERATEUPDATE_WEBHOOK_URL` | Yes | 2 | not specified |
| `FREE_RATE_UPDATE_API_KEY` | Yes | 2 | not specified |
| `FREE_RATE_UPDATE_ENABLED` | No | 2 | not specified |
| `FREE_RATE_UPDATE_WEBHOOK_URL` | Yes | 2 | not specified |
| `FRONTEND_URL` | No | 1 | dev |
| `FRONT_BASE_URL` | No | 3 | multiple defaults (dev) |
| `GDPR_ENABLED` | No | 4 | multiple defaults (dev, prod) |
| `GEMINI_API_KEY` | Yes | 12 | multiple defaults (dev) |
| `GEMINI_ASSISTANT_PORT` | No | 1 | dev |
| `GEMINI_ASSISTANT_URL` | No | 1 | dev |
| `GEMINI_BASE_URL` | No | 1 | not specified |
| `GEMINI_MAX_TOKENS` | Yes | 1 | not specified |
| `GEMINI_MCP_PORT` | No | 3 | multiple defaults (dev) |
| `GEMINI_MCP_URL` | No | 2 | multiple defaults (dev) |
| `GEMINI_MODEL` | No | 6 | multiple defaults (dev) |
| `GEMINI_VISION_MODEL` | No | 1 | dev |
| `GENERIC_TIMEZONE` | No | 1 | not specified |
| `GH_DYNAMIC_TOOLSETS` | No | 1 | not specified |
| `GH_MCP_API_KEY` | Yes | 1 | not specified |
| `GH_PAT` | No | 3 | multiple defaults (not specified) |
| `GH_PERSONAL_ACCESS_TOKEN` | Yes | 1 | not specified |
| `GH_PERSONAL_ACCESS_TOKEN_ALL` | Yes | 1 | not specified |
| `GH_REPOSITORY_OWNER` | No | 1 | not specified |
| `GH_TOKEN` | Yes | 2 | not specified |
| `GH_TOOLSETS` | No | 1 | not specified |
| `GITEA_ACTIONS_ENABLED` | No | 1 | not specified |
| `GITEA_ADMIN_EMAIL` | No | 1 | not specified |
| `GITEA_ADMIN_PASSWORD` | Yes | 1 | not specified |
| `GITEA_ADMIN_USER` | No | 1 | not specified |
| `GITEA_DB_HOST` | No | 1 | not specified |
| `GITEA_DB_NAME` | No | 2 | not specified |
| `GITEA_DB_PASSWORD` | Yes | 2 | not specified |
| `GITEA_DB_PORT` | No | 1 | not specified |
| `GITEA_DB_TYPE` | No | 1 | not specified |
| `GITEA_DB_USER` | No | 2 | not specified |
| `GITEA_DISABLE_REGISTRATION` | No | 1 | not specified |
| `GITEA_DOMAIN` | No | 2 | multiple defaults (dev) |
| `GITEA_HOST` | No | 1 | not specified |
| `GITEA_HTTP_PORT` | No | 3 | not specified |
| `GITEA_MAILER_ENABLED` | No | 1 | not specified |
| `GITEA_MAILER_FROM` | No | 1 | dev |
| `GITEA_MCP_URL` | No | 1 | not specified |
| `GITEA_OWNER` | No | 1 | not specified |
| `GITEA_PORT` | No | 3 | not specified |
| `GITEA_REPO` | No | 1 | not specified |
| `GITEA_REQUIRE_SIGNIN` | No | 1 | not specified |
| `GITEA_ROOT_URL` | No | 3 | multiple defaults (dev) |
| `GITEA_RUNNER_LABELS` | No | 1 | not specified |
| `GITEA_RUNNER_NAME` | No | 1 | not specified |
| `GITEA_RUNNER_REGISTRATION_TOKEN` | Yes | 1 | not specified |
| `GITEA_RUNNER_TOKEN` | Yes | 3 | multiple defaults (not specified) |
| `GITEA_SECRET_KEY` | Yes | 1 | not specified |
| `GITEA_SMTP_HOST` | No | 1 | not specified |
| `GITEA_SMTP_PASSWORD` | Yes | 1 | not specified |
| `GITEA_SMTP_PORT` | No | 1 | not specified |
| `GITEA_SMTP_USER` | No | 1 | not specified |
| `GITEA_SSH_DOMAIN` | No | 3 | multiple defaults (dev) |
| `GITEA_SSH_PORT` | No | 6 | not specified |
| `GITEA_TOKEN` | Yes | 1 | not specified |
| `GITEA_URL` | No | 1 | not specified |
| `GITHUB_ACTIONS` | No | 3 | multiple defaults (not specified) |
| `GITHUB_AUTO_ISSUE_ON_ERROR` | No | 3 | not specified |
| `GITHUB_BRANCH` | No | 5 | dev, prod |
| `GITHUB_CALLBACK_URL` | No | 4 | multiple defaults (dev, prod) |
| `GITHUB_CHECKPOINT_BRANCH` | No | 3 | not specified |
| `GITHUB_CLIENT_ID` | No | 4 | multiple defaults (dev, prod) |
| `GITHUB_CLIENT_SECRET` | Yes | 4 | multiple defaults (dev, prod) |
| `GITHUB_INTEGRATION_ENABLED` | No | 1 | not specified |
| `GITHUB_MEMORY_BACKUP_GISTS` | No | 3 | not specified |
| `GITHUB_OWNER` | No | 8 | multiple defaults (dev) |
| `GITHUB_PAT_TOKEN` | Yes | 5 | multiple defaults (not specified) |
| `GITHUB_PR_ON_MAJOR_IMPROVEMENT` | No | 3 | not specified |
| `GITHUB_REPO` | No | 13 | multiple defaults (dev, prod) |
| `GITHUB_REPOSITORY` | No | 1 | not specified |
| `GITHUB_SYNC_LEARNINGS` | No | 3 | not specified |
| `GITHUB_TOKEN` | Yes | 31 | multiple defaults (dev, prod) |
| `GITHUB_USERNAME` | No | 2 | not specified |
| `GITHUB_WEBHOOK_SECRET` | Yes | 1 | not specified |
| `GIT_AUTHOR_EMAIL` | Yes | 4 | multiple defaults (dev) |
| `GIT_AUTHOR_NAME` | Yes | 4 | multiple defaults (not specified) |
| `GIT_COMMIT` | No | 1 | not specified |
| `GIT_COMMITTER_EMAIL` | No | 3 | multiple defaults (dev) |
| `GIT_COMMITTER_NAME` | No | 3 | multiple defaults (not specified) |
| `GIT_MCP_HOST` | No | 1 | not specified |
| `GIT_MCP_PORT` | No | 1 | not specified |
| `GOHIGHLEVEL_ACCOUNT_ID` | No | 1 | not specified |
| `GOHIGHLEVEL_API_KEY` | Yes | 1 | not specified |
| `GOHIGHLEVEL_API_URL` | No | 1 | dev |
| `GOOGLE_API_KEY` | Yes | 43 | multiple defaults (dev, prod) |
| `GOOGLE_APPLICATION_CREDENTIALS` | Yes | 1 | not specified |
| `GOOGLE_CALLBACK_URL` | No | 5 | multiple defaults (dev, prod) |
| `GOOGLE_CLIENT_ID` | No | 5 | multiple defaults (dev, prod) |
| `GOOGLE_CLIENT_SECRET` | Yes | 5 | multiple defaults (dev, prod) |
| `GOOGLE_CLOUD_LOCATION` | No | 1 | not specified |
| `GOOGLE_CLOUD_PROJECT` | No | 1 | not specified |
| `GOOGLE_GEMINI_API_KEY` | Yes | 15 | multiple defaults (dev) |
| `GOOGLE_GEMINI_MODEL` | No | 3 | not specified |
| `GPT_MODEL` | No | 2 | multiple defaults (not specified) |
| `GPU_3060_TAILSCALE_IP` | No | 5 | not specified |
| `GPU_3090_TAILSCALE_IP` | No | 5 | not specified |
| `GPU_5090_TAILSCALE_IP` | No | 5 | not specified |
| `GPU_ALLOW_GROWTH` | No | 8 | not specified |
| `GPU_CLOCK_SPEED_LIMIT` | No | 3 | multiple defaults (not specified) |
| `GPU_COMPUTE_CAPABILITY` | No | 6 | multiple defaults (not specified) |
| `GPU_COMPUTE_MODE` | No | 1 | not specified |
| `GPU_CUDA_DEVICE` | No | 6 | not specified |
| `GPU_ENABLED` | No | 6 | not specified |
| `GPU_EXPORTER_PORT` | No | 2 | not specified |
| `GPU_MAX_BATCH_SIZE` | No | 6 | multiple defaults (not specified) |
| `GPU_MAX_CONCURRENT` | No | 6 | multiple defaults (not specified) |
| `GPU_MEMORY_CLOCK` | No | 1 | not specified |
| `GPU_MEMORY_FRACTION` | No | 12 | multiple defaults (not specified) |
| `GPU_MEMORY_UTIL` | No | 8 | multiple defaults (not specified) |
| `GPU_MODEL` | No | 22 | multiple defaults (not specified) |
| `GPU_POWER_LIMIT` | No | 3 | multiple defaults (not specified) |
| `GPU_PRIORITY` | No | 6 | multiple defaults (not specified) |
| `GPU_THERMAL_THRESHOLD_C` | No | 2 | multiple defaults (not specified) |
| `GPU_TYPE` | No | 2 | not specified |
| `GPU_VRAM` | No | 14 | multiple defaults (not specified) |
| `GPU_VRAM_GB` | No | 3 | multiple defaults (not specified) |
| `GPU_VRAM_MB` | No | 3 | multiple defaults (not specified) |
| `GPU_WORKER_1_URL` | No | 4 | not specified |
| `GPU_WORKER_2_URL` | No | 4 | not specified |
| `GPU_WORKER_3060_ENABLED` | No | 7 | multiple defaults (not specified) |
| `GPU_WORKER_3060_GPU` | No | 1 | not specified |
| `GPU_WORKER_3060_MAX_CONCURRENT` | No | 5 | not specified |
| `GPU_WORKER_3060_MODEL` | No | 1 | dev |
| `GPU_WORKER_3060_MODELS` | No | 4 | not specified |
| `GPU_WORKER_3060_PRIORITY` | No | 5 | not specified |
| `GPU_WORKER_3060_SPECIALIZATION` | No | 1 | not specified |
| `GPU_WORKER_3060_URL` | No | 9 | multiple defaults (dev, prod) |
| `GPU_WORKER_3060_VRAM` | No | 1 | not specified |
| `GPU_WORKER_3090_ENABLED` | No | 7 | multiple defaults (not specified) |
| `GPU_WORKER_3090_GPU` | No | 1 | not specified |
| `GPU_WORKER_3090_MAX_CONCURRENT` | No | 5 | not specified |
| `GPU_WORKER_3090_MODEL` | No | 1 | dev |
| `GPU_WORKER_3090_MODELS` | No | 4 | not specified |
| `GPU_WORKER_3090_PRIORITY` | No | 5 | not specified |
| `GPU_WORKER_3090_SPECIALIZATION` | No | 1 | not specified |
| `GPU_WORKER_3090_URL` | No | 9 | multiple defaults (dev, prod) |
| `GPU_WORKER_3090_VRAM` | No | 1 | not specified |
| `GPU_WORKER_3_URL` | No | 2 | not specified |
| `GPU_WORKER_5090_ENABLED` | No | 7 | multiple defaults (not specified) |
| `GPU_WORKER_5090_GPU` | No | 1 | not specified |
| `GPU_WORKER_5090_MAX_CONCURRENT` | No | 5 | not specified |
| `GPU_WORKER_5090_MODEL` | No | 1 | dev |
| `GPU_WORKER_5090_MODELS` | No | 4 | multiple defaults (not specified) |
| `GPU_WORKER_5090_PRIORITY` | No | 5 | not specified |
| `GPU_WORKER_5090_SPECIALIZATION` | No | 1 | not specified |
| `GPU_WORKER_5090_URL` | No | 9 | multiple defaults (dev, prod) |
| `GPU_WORKER_5090_VRAM` | No | 1 | not specified |
| `GPU_WORKER_DEFAULT_MODEL` | No | 2 | not specified |
| `GPU_WORKER_ID` | No | 4 | not specified |
| `GRACEFUL_TIMEOUT` | No | 1 | not specified |
| `GRADIENT_ACCUMULATION_STEPS` | No | 1 | not specified |
| `GRADIENT_CHECKPOINTING` | No | 1 | not specified |
| `GRAFANA_ADMIN_PASSWORD` | Yes | 40 | multiple defaults (dev, prod) |
| `GRAFANA_ADMIN_USER` | No | 21 | not specified |
| `GRAFANA_API_KEY` | Yes | 4 | not specified |
| `GRAFANA_BIND` | No | 1 | not specified |
| `GRAFANA_CPU_LIMIT` | No | 1 | not specified |
| `GRAFANA_ENABLED` | No | 11 | multiple defaults (dev, prod) |
| `GRAFANA_HOST` | No | 2 | not specified |
| `GRAFANA_MEMORY_LIMIT` | No | 2 | multiple defaults (not specified) |
| `GRAFANA_PASSWORD` | Yes | 5 | not specified |
| `GRAFANA_PORT` | No | 33 | multiple defaults (dev, prod) |
| `GRAFANA_PROVISIONING_PATH` | No | 1 | not specified |
| `GRAFANA_ROOT_URL` | No | 6 | multiple defaults (dev) |
| `GRAFANA_URL` | No | 15 | multiple defaults (dev) |
| `GRAPHITI_API_KEY` | Yes | 1 | not specified |
| `GRAPHITI_AUTO_EXTRACTION` | No | 1 | not specified |
| `GRAPHITI_AUTO_INDEX` | No | 2 | not specified |
| `GRAPHITI_AUTO_SNAPSHOT` | No | 1 | not specified |
| `GRAPHITI_BACKEND` | No | 5 | not specified |
| `GRAPHITI_BACKUP_DIR` | No | 2 | not specified |
| `GRAPHITI_BACKUP_ENABLED` | No | 2 | not specified |
| `GRAPHITI_BATCH_SIZE` | No | 2 | not specified |
| `GRAPHITI_COMPRESSION_ALGORITHM` | No | 1 | not specified |
| `GRAPHITI_COMPRESSION_ENABLED` | No | 1 | not specified |
| `GRAPHITI_EMBEDDING_DIMENSIONS` | No | 2 | not specified |
| `GRAPHITI_EMBEDDING_MODEL` | No | 2 | not specified |
| `GRAPHITI_EMBEDDING_PROVIDER` | No | 2 | not specified |
| `GRAPHITI_ENABLED` | No | 6 | multiple defaults (not specified) |
| `GRAPHITI_EXTRACTION_BATCH_SIZE` | No | 1 | not specified |
| `GRAPHITI_EXTRACTION_MODEL` | No | 1 | not specified |
| `GRAPHITI_FALKORDB_HOST` | No | 2 | dev |
| `GRAPHITI_FALKORDB_PASSWORD` | Yes | 2 | not specified |
| `GRAPHITI_FALKORDB_PORT` | No | 2 | not specified |
| `GRAPHITI_FALKORDB_URL` | No | 2 | dev |
| `GRAPHITI_GRAPH_NAME` | No | 2 | not specified |
| `GRAPHITI_GROUP_ID` | No | 2 | not specified |
| `GRAPHITI_INDEX_PROPERTIES` | No | 2 | not specified |
| `GRAPHITI_MAX_NODES` | No | 3 | not specified |
| `GRAPHITI_MAX_RELATIONSHIPS` | No | 2 | not specified |
| `GRAPHITI_NEO4J_PASSWORD` | Yes | 2 | not specified |
| `GRAPHITI_NEO4J_URI` | No | 2 | dev |
| `GRAPHITI_NEO4J_USER` | No | 2 | not specified |
| `GRAPHITI_PASSWORD` | Yes | 1 | not specified |
| `GRAPHITI_PORT` | No | 2 | multiple defaults (dev) |
| `GRAPHITI_QUERY_TIMEOUT` | No | 2 | not specified |
| `GRAPHITI_RELATIONSHIP_INFERENCE` | No | 3 | not specified |
| `GRAPHITI_SNAPSHOT_ENABLED` | No | 2 | not specified |
| `GRAPHITI_SNAPSHOT_INTERVAL` | No | 4 | multiple defaults (not specified) |
| `GRAPHITI_SNAPSHOT_RETENTION_DAYS` | No | 1 | not specified |
| `GRAPHITI_TEMPORAL_TRACKING` | No | 4 | not specified |
| `GRAPHITI_URI` | No | 2 | not specified |
| `GRAPHITI_URL` | No | 2 | multiple defaults (dev) |
| `GRAPHITI_USER` | No | 1 | not specified |
| `GRAPHQL_INTROSPECTION` | No | 3 | dev |
| `GRAPHQL_PLAYGROUND` | No | 3 | dev |
| `GROQ_API_KEY` | Yes | 4 | not specified |
| `GZIP_LEVEL` | No | 2 | prod |
| `HASS_LONG_LIVED_TOKEN` | Yes | 1 | not specified |
| `HASS_URL` | No | 1 | not specified |
| `HA_STACK_ROOT` | No | 2 | not specified |
| `HEALTH_CHECK_ENABLED` | No | 4 | prod |
| `HEALTH_CHECK_INTERVAL` | No | 9 | multiple defaults (not specified) |
| `HEALTH_CHECK_INTERVAL_MINUTES` | No | 2 | not specified |
| `HEALTH_CHECK_PATH` | No | 2 | prod |
| `HEALTH_CHECK_PORT` | No | 2 | not specified |
| `HEALTH_CHECK_RETRIES` | No | 6 | not specified |
| `HEALTH_CHECK_START_PERIOD` | No | 2 | not specified |
| `HEALTH_CHECK_TIMEOUT` | No | 10 | multiple defaults (not specified) |
| `HEALTH_MONITOR_PORT` | No | 2 | not specified |
| `HEAP_SIZE_MB` | No | 2 | not specified |
| `HEARTBEAT_INTERVAL` | No | 1 | not specified |
| `HELMET_ENABLED` | No | 7 | multiple defaults (dev, prod) |
| `HF_TOKEN` | Yes | 5 | not specified |
| `HIVEMIND_DISABLED` | No | 1 | not specified |
| `HIVE_MIND_ENABLED` | No | 2 | not specified |
| `HIVE_MIND_ENABLE_CONSENSUS` | No | 2 | not specified |
| `HIVE_MIND_QUEEN_TYPE` | No | 2 | not specified |
| `HMAC_SECRET` | Yes | 1 | not specified |
| `HMDA_LAR_SUBMISSION_ENABLED` | No | 1 | not specified |
| `HMDA_REPORTING_ENABLED` | No | 2 | not specified |
| `HMDA_REPORTING_KEY` | Yes | 1 | not specified |
| `HNSW_EF` | No | 3 | not specified |
| `HNSW_EF_CONSTRUCTION` | No | 1 | not specified |
| `HNSW_ENABLED` | No | 2 | not specified |
| `HNSW_M` | No | 3 | not specified |
| `HNSW_SPACE` | No | 1 | not specified |
| `HOMEASSISTANT_IP` | No | 2 | not specified |
| `HOMEASSISTANT_URL` | No | 2 | not specified |
| `HOMEPAGE_PORT` | No | 2 | not specified |
| `HOOKS_CUSTOM_PATHS` | No | 1 | not specified |
| `HOOKS_ENABLED` | No | 1 | not specified |
| `HOST` | No | 4 | multiple defaults (dev) |
| `HOSTNAME` | No | 3 | multiple defaults (prod) |
| `HOT_RELOAD` | No | 4 | multiple defaults (not specified) |
| `HOT_RELOAD_ENABLED` | No | 2 | multiple defaults (not specified) |
| `HSTS_INCLUDE_SUBDOMAINS` | No | 2 | prod |
| `HSTS_MAX_AGE` | No | 2 | prod |
| `HTTP_LOG_ENABLED` | No | 4 | dev, prod |
| `HTTP_LOG_LEVEL` | No | 4 | multiple defaults (dev, prod) |
| `HUB_PAT_TOKEN` | Yes | 1 | not specified |
| `HUB_USERNAME` | No | 1 | not specified |
| `HUGGINGFACE_TOKEN` | Yes | 1 | not specified |
| `HUGGING_FACE_HUB_TOKEN` | Yes | 2 | not specified |
| `IDENTITY_PROVIDER_CERTIFICATE` | Yes | 1 | not specified |
| `IDENTITY_PROVIDER_LOGIN_URL` | No | 1 | not specified |
| `IDENTITY_PROVIDER_SHA1_FINGERPRINT` | No | 1 | not specified |
| `INFISICAL_ACCESS_TOKEN` | Yes | 1 | not specified |
| `INFISICAL_API_URL` | No | 10 | multiple defaults (not specified) |
| `INFISICAL_AUDIT_LOGGING` | No | 1 | not specified |
| `INFISICAL_AUTH_SECRET` | Yes | 1 | not specified |
| `INFISICAL_CACHE_DIR` | No | 1 | not specified |
| `INFISICAL_CACHE_TTL` | No | 1 | not specified |
| `INFISICAL_CLEAR_ON_EXIT` | No | 1 | not specified |
| `INFISICAL_CLIENT_ID` | No | 12 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_ID_ARCHON` | No | 3 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_ID_CLAUDE_FLOW` | No | 3 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_SECRET` | Yes | 12 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_SECRET_ARCHON` | Yes | 3 | multiple defaults (not specified) |
| `INFISICAL_CLIENT_SECRET_CLAUDE_FLOW` | Yes | 3 | multiple defaults (not specified) |
| `INFISICAL_DISABLE_UPDATE_CHECK` | No | 2 | not specified |
| `INFISICAL_ENABLED` | No | 6 | multiple defaults (dev, prod) |
| `INFISICAL_ENCRYPTION_KEY` | Yes | 5 | multiple defaults (not specified) |
| `INFISICAL_ENV` | No | 14 | multiple defaults (dev, prod) |
| `INFISICAL_ENVIRONMENT` | No | 22 | multiple defaults (dev, prod) |
| `INFISICAL_ENV_DEV_ID` | No | 1 | not specified |
| `INFISICAL_ENV_PROD_ID` | No | 1 | not specified |
| `INFISICAL_ENV_STAGING_ID` | No | 1 | not specified |
| `INFISICAL_FOLDER_PATH` | No | 2 | multiple defaults (not specified) |
| `INFISICAL_FOLDER_PATHS` | No | 1 | not specified |
| `INFISICAL_HOST_URL` | No | 2 | multiple defaults (not specified) |
| `INFISICAL_JWT_SECRET` | Yes | 4 | multiple defaults (not specified) |
| `INFISICAL_LOG_LEVEL` | No | 2 | not specified |
| `INFISICAL_MACHINE_ID` | No | 1 | not specified |
| `INFISICAL_MACHINE_IDENTITY_PATH` | No | 1 | not specified |
| `INFISICAL_MCP_BIND` | No | 1 | not specified |
| `INFISICAL_MCP_URL` | No | 1 | not specified |
| `INFISICAL_ORGANIZATION_ID` | No | 1 | not specified |
| `INFISICAL_PATH` | No | 17 | multiple defaults (prod) |
| `INFISICAL_POLL_INTERVAL` | No | 2 | not specified |
| `INFISICAL_PORT` | No | 4 | multiple defaults (not specified) |
| `INFISICAL_POSTGRES_DB` | No | 1 | not specified |
| `INFISICAL_POSTGRES_PASSWORD` | Yes | 1 | not specified |
| `INFISICAL_POSTGRES_USER` | No | 1 | not specified |
| `INFISICAL_PROJECT` | No | 1 | not specified |
| `INFISICAL_PROJECT_ID` | No | 37 | multiple defaults (dev, prod) |
| `INFISICAL_SITE_URL` | No | 5 | multiple defaults (dev) |
| `INFISICAL_SYNC_INTERVAL` | No | 1 | not specified |
| `INFISICAL_TOKEN` | Yes | 21 | multiple defaults (prod) |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` | Yes | 8 | multiple defaults (not specified) |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` | Yes | 8 | multiple defaults (not specified) |
| `INFISICAL_WORKSPACE_ID` | No | 1 | not specified |
| `INFI_CLIENT_ID` | No | 1 | not specified |
| `INFI_CLIENT_SECRET` | Yes | 1 | not specified |
| `INFI_PROJECT_ID` | No | 1 | not specified |
| `INTEGRATION_PROTOCOL` | No | 1 | not specified |
| `INTEGRATION_TIMEOUT` | No | 1 | not specified |
| `INTERNAL_API_KEY` | Yes | 2 | not specified |
| `INTERNAL_NETWORK` | No | 1 | dev |
| `IP_WHITELIST` | No | 2 | prod |
| `IP_WHITELIST_ENABLED` | No | 4 | dev, prod |
| `IS_MULTIWORKSPACE_ENABLED` | No | 3 | dev |
| `JAEGER_AGENT_HOST` | No | 2 | multiple defaults (not specified) |
| `JAEGER_AGENT_PORT` | No | 3 | not specified |
| `JAEGER_ENABLED` | No | 1 | not specified |
| `JAEGER_QUERY_PORT` | No | 1 | not specified |
| `JEST_MAX_WORKERS` | No | 3 | not specified |
| `JEST_TIMEOUT` | No | 2 | dev |
| `JOB_QUEUE_PRIORITY` | No | 2 | prod |
| `JOB_QUEUE_TYPE` | No | 4 | dev, prod |
| `JWT_EXPIRATION` | No | 2 | multiple defaults (not specified) |
| `JWT_EXPIRE` | No | 4 | multiple defaults (dev, prod) |
| `JWT_EXPIRES_IN` | No | 4 | not specified |
| `JWT_EXPIRY` | No | 2 | multiple defaults (not specified) |
| `JWT_REFRESH_EXPIRE` | No | 4 | multiple defaults (dev, prod) |
| `JWT_REFRESH_EXPIRES_IN` | No | 2 | not specified |
| `JWT_REFRESH_EXPIRY` | No | 1 | not specified |
| `JWT_REFRESH_SECRET` | Yes | 5 | multiple defaults (dev, prod) |
| `JWT_SECRET` | Yes | 35 | multiple defaults (dev, prod) |
| `KEEP_ALIVE_TIMEOUT` | No | 5 | multiple defaults (prod) |
| `KEEP_LOCAL_WEIGHT` | No | 1 | not specified |
| `KEY_VAULTS_SECRET` | Yes | 1 | not specified |
| `KUBE_NAMESPACE` | No | 2 | prod |
| `KUBE_REPLICAS` | No | 2 | prod |
| `KYUTAI_LLM_API_KEY` | Yes | 2 | not specified |
| `KYUTAI_LLM_MODEL` | No | 2 | not specified |
| `KYUTAI_LLM_URL` | No | 2 | not specified |
| `LANDING_URL` | No | 2 | not specified |
| `LANG` | No | 1 | not specified |
| `LANGFUSE_NEXTAUTH_SECRET` | Yes | 3 | multiple defaults (not specified) |
| `LANGFUSE_PORT` | No | 3 | not specified |
| `LANGFUSE_SALT` | No | 3 | multiple defaults (not specified) |
| `LAN_IP` | No | 14 | multiple defaults (not specified) |
| `LB_HEALTH_CHECK_INTERVAL` | No | 1 | not specified |
| `LB_REQUEST_QUEUE_SIZE` | No | 1 | not specified |
| `LB_REQUEST_TIMEOUT` | No | 1 | not specified |
| `LB_STRATEGY` | No | 1 | not specified |
| `LC_ALL` | No | 1 | not specified |
| `LEADMAILBOX_API_KEY` | Yes | 3 | not specified |
| `LEADMAILBOX_API_URL` | No | 2 | not specified |
| `LEADMAILBOX_PASSWORD` | Yes | 1 | not specified |
| `LEADMAILBOX_URL` | No | 1 | not specified |
| `LEADMAILBOX_USERNAME` | No | 1 | not specified |
| `LEAD_API_URL` | No | 3 | multiple defaults (dev) |
| `LEAD_CAPTURE_URL` | No | 1 | not specified |
| `LEAD_SCORE_ASSETS_WEIGHT` | No | 1 | not specified |
| `LEAD_SCORE_CREDIT_WEIGHT` | No | 1 | not specified |
| `LEAD_SCORE_DEBT_WEIGHT` | No | 1 | not specified |
| `LEAD_SCORE_EMPLOYMENT_WEIGHT` | No | 1 | not specified |
| `LEAD_SCORE_INCOME_WEIGHT` | No | 1 | not specified |
| `LEAD_SCORE_THRESHOLD_A` | No | 1 | not specified |
| `LEAD_SCORE_THRESHOLD_B` | No | 1 | not specified |
| `LEAD_SCORE_THRESHOLD_C` | No | 1 | not specified |
| `LENDERPRICE_API_KEY` | Yes | 5 | not specified |
| `LENDERPRICE_API_URL` | No | 3 | not specified |
| `LENDERPRICE_BASE_URL` | No | 1 | not specified |
| `LENDERPRICE_COMPANY_ID` | No | 1 | not specified |
| `LENDERPRICE_PASSWORD` | Yes | 3 | not specified |
| `LENDERPRICE_USERNAME` | No | 3 | not specified |
| `LENDER_PRICE_API_KEY` | Yes | 2 | not specified |
| `LENDER_PRICE_BASE_URL` | No | 2 | not specified |
| `LENDER_PRICE_ENABLED` | No | 2 | not specified |
| `LENDER_PRICE_QUOTE_TIMEOUT` | No | 2 | not specified |
| `LENDINGPAD_API_KEY` | Yes | 1 | not specified |
| `LENDINGPAD_COMPANY_ID` | No | 1 | not specified |
| `LENDINGPAD_PASSWORD` | Yes | 1 | not specified |
| `LENDINGPAD_URL` | No | 1 | not specified |
| `LENDINGPAD_USERNAME` | No | 1 | not specified |
| `LENDINGTREE_API_KEY` | Yes | 2 | not specified |
| `LENDINGTREE_PARTNER_ID` | No | 1 | not specified |
| `LENDINGTREE_WEBHOOK_SECRET` | Yes | 3 | not specified |
| `LENDINGTREE_WEBHOOK_URL` | Yes | 1 | not specified |
| `LENDING_TREE_API_KEY` | Yes | 2 | not specified |
| `LENDING_TREE_ENABLED` | No | 2 | not specified |
| `LENDING_TREE_WEBHOOK_URL` | Yes | 2 | not specified |
| `LETTA_AGENT_DEFAULT_EMBEDDING` | No | 2 | not specified |
| `LETTA_AGENT_DEFAULT_MODEL` | No | 2 | not specified |
| `LETTA_AGENT_PERSISTENCE` | No | 2 | not specified |
| `LETTA_AGENT_POOLING` | No | 3 | not specified |
| `LETTA_API_BIND` | No | 1 | not specified |
| `LETTA_API_KEY` | Yes | 16 | multiple defaults (not specified) |
| `LETTA_API_URL` | No | 10 | dev |
| `LETTA_ARCHIVAL_MEMORY` | No | 3 | not specified |
| `LETTA_ARCHIVAL_MEMORY_ENABLED` | No | 2 | not specified |
| `LETTA_ARCHIVAL_MEMORY_SIZE` | No | 2 | not specified |
| `LETTA_AUTO_SAVE` | No | 3 | not specified |
| `LETTA_AUTO_SAVE_INTERVAL` | No | 2 | not specified |
| `LETTA_BACKUP_DIR` | No | 2 | not specified |
| `LETTA_BACKUP_ENABLED` | No | 2 | not specified |
| `LETTA_BACKUP_INTERVAL` | No | 2 | not specified |
| `LETTA_BASE_URL` | No | 1 | not specified |
| `LETTA_CONTEXT_WINDOW` | No | 3 | not specified |
| `LETTA_CORE_MEMORY_LIMIT` | No | 2 | not specified |
| `LETTA_CORE_MEMORY_SIZE` | No | 2 | not specified |
| `LETTA_DB` | No | 3 | not specified |
| `LETTA_DB_NAME` | No | 6 | multiple defaults (dev) |
| `LETTA_DB_PASSWORD` | Yes | 6 | multiple defaults (dev) |
| `LETTA_DB_URL` | No | 1 | dev |
| `LETTA_EMBEDDING_MODEL` | No | 2 | not specified |
| `LETTA_EMBEDDING_PROVIDER` | No | 2 | not specified |
| `LETTA_ENABLED` | No | 10 | multiple defaults (not specified) |
| `LETTA_ENABLE_AUTH` | Yes | 1 | not specified |
| `LETTA_HOST` | No | 1 | not specified |
| `LETTA_LLM_MODEL` | No | 2 | not specified |
| `LETTA_LLM_PROVIDER` | No | 2 | not specified |
| `LETTA_LOG_LEVEL` | No | 1 | not specified |
| `LETTA_MAX_AGENTS` | No | 4 | not specified |
| `LETTA_MCP_ENABLED` | No | 2 | not specified |
| `LETTA_MCP_PORT` | No | 3 | dev |
| `LETTA_MEMORY_MANAGER` | No | 2 | not specified |
| `LETTA_PG_URI` | No | 1 | not specified |
| `LETTA_PORT` | No | 9 | dev |
| `LETTA_POSTGRES_DB` | No | 2 | not specified |
| `LETTA_POSTGRES_HOST` | No | 2 | dev |
| `LETTA_POSTGRES_PASSWORD` | Yes | 7 | multiple defaults (not specified) |
| `LETTA_POSTGRES_PORT` | No | 5 | multiple defaults (not specified) |
| `LETTA_POSTGRES_URI` | No | 8 | multiple defaults (dev) |
| `LETTA_POSTGRES_USER` | No | 2 | not specified |
| `LETTA_RECALL_MEMORY_LIMIT` | No | 2 | not specified |
| `LETTA_SAVE_INTERVAL` | No | 1 | not specified |
| `LETTA_SERVER_PASS` | Yes | 1 | not specified |
| `LETTA_SERVER_PASSWORD` | Yes | 9 | multiple defaults (dev) |
| `LETTA_SERVER_URL` | No | 5 | dev |
| `LETTA_URL` | No | 6 | multiple defaults (dev) |
| `LINKWARDEN_INTERNAL_URL` | No | 2 | not specified |
| `LINKWARDEN_PORT` | No | 2 | not specified |
| `LINKWARDEN_TOKEN` | Yes | 2 | not specified |
| `LINKWARDEN_URL` | No | 2 | not specified |
| `LITELLM_API_KEY` | Yes | 4 | multiple defaults (not specified) |
| `LITELLM_API_KEYS` | Yes | 1 | not specified |
| `LITELLM_BASE_URL` | No | 1 | not specified |
| `LITELLM_CACHE_TTL` | No | 2 | not specified |
| `LITELLM_CACHING_ENABLED` | No | 2 | not specified |
| `LITELLM_DATABASE_URL` | No | 9 | multiple defaults (dev) |
| `LITELLM_DB` | No | 3 | not specified |
| `LITELLM_FALLBACK_MODELS` | No | 2 | not specified |
| `LITELLM_HOST` | No | 4 | not specified |
| `LITELLM_LISTEN_PORT` | No | 1 | dev |
| `LITELLM_LOG` | No | 2 | not specified |
| `LITELLM_LOG_LEVEL` | No | 3 | not specified |
| `LITELLM_MASTER_KEY` | Yes | 31 | multiple defaults (dev) |
| `LITELLM_MAX_TOKENS` | Yes | 2 | not specified |
| `LITELLM_MODE` | No | 1 | dev |
| `LITELLM_MODEL_FALLBACK_ORDER` | No | 2 | multiple defaults (not specified) |
| `LITELLM_PORT` | No | 27 | multiple defaults (dev) |
| `LITELLM_PROXY_REDIS_URL` | No | 2 | multiple defaults (not specified) |
| `LITELLM_PROXY_URL` | No | 1 | not specified |
| `LITELLM_UPSTREAM` | No | 1 | not specified |
| `LLAMA3_1_70B_PARAMS` | No | 2 | not specified |
| `LLAMA3_1_8B_PARAMS` | No | 1 | not specified |
| `LLXPERT_AUX_API_KEY` | Yes | 1 | not specified |
| `LLXPERT_AUX_BASE_URL` | No | 1 | not specified |
| `LLXPERT_CODER_API_KEY` | Yes | 1 | not specified |
| `LLXPERT_CODER_BASE_URL` | No | 1 | not specified |
| `LLXPERT_JEFE_API_KEY` | Yes | 1 | not specified |
| `LLXPERT_JEFE_BASE_URL` | No | 1 | not specified |
| `LMCACHE_BACKEND` | No | 1 | not specified |
| `LMCACHE_CHUNK_SIZE` | No | 4 | not specified |
| `LMCACHE_ENABLED` | No | 1 | not specified |
| `LMCACHE_MAX_SIZE` | No | 1 | not specified |
| `LMCACHE_REDIS_URL` | No | 1 | dev |
| `LMCACHE_TTL` | No | 1 | not specified |
| `LM_CACHE_PORT` | No | 4 | not specified |
| `LOAD_BALANCE_MODELS` | No | 1 | not specified |
| `LOBECHAT_ACCESS_CODE` | No | 1 | dev |
| `LOBECHAT_PORT` | No | 3 | dev |
| `LOBECHAT_URL` | No | 2 | dev |
| `LOCAL_ARCHON` | No | 2 | dev |
| `LOCAL_CLAUDE_FLOW` | No | 2 | multiple defaults (dev) |
| `LOCAL_LB_ENABLED` | No | 1 | not specified |
| `LOCAL_LB_HOST` | No | 1 | not specified |
| `LOCAL_LB_PORT` | No | 1 | not specified |
| `LOCAL_LLM_ENABLED` | No | 15 | multiple defaults (dev, prod) |
| `LOCAL_LLM_FALLBACK_TO_CLOUD` | No | 4 | not specified |
| `LOCAL_LLM_MAX_RETRIES` | No | 2 | not specified |
| `LOCAL_LLM_MODELS` | No | 6 | multiple defaults (not specified) |
| `LOCAL_LLM_PRIORITY` | No | 6 | dev, prod |
| `LOCAL_LLM_TIMEOUT` | No | 2 | not specified |
| `LOCAL_LLM_URL` | No | 7 | dev |
| `LOGFIRE_TOKEN` | Yes | 1 | not specified |
| `LOGIN_TOKEN_SECRET` | Yes | 2 | multiple defaults (dev, prod) |
| `LOGS_PATH` | No | 1 | not specified |
| `LOG_AGGREGATION_API_KEY` | Yes | 2 | prod |
| `LOG_AGGREGATION_ENABLED` | No | 2 | prod |
| `LOG_AGGREGATION_URL` | No | 2 | prod |
| `LOG_CACHE_HITS` | No | 1 | not specified |
| `LOG_DIR` | No | 1 | not specified |
| `LOG_FILE` | No | 8 | multiple defaults (not specified) |
| `LOG_FILE_PATH` | No | 11 | multiple defaults (dev, prod) |
| `LOG_FORMAT` | No | 19 | multiple defaults (dev, prod) |
| `LOG_INFERENCE_TIME` | No | 1 | not specified |
| `LOG_LEVEL` | No | 86 | multiple defaults (dev, prod) |
| `LOG_MAX_FILES` | No | 10 | multiple defaults (dev, prod) |
| `LOG_MAX_SIZE` | No | 10 | multiple defaults (dev, prod) |
| `LOG_PATH` | No | 2 | not specified |
| `LOG_REQUEST_DETAILS` | No | 1 | not specified |
| `LOG_RETENTION_DAYS` | No | 5 | multiple defaults (prod) |
| `LOG_TO_FILE` | No | 4 | multiple defaults (dev, prod) |
| `LOKI_ENABLED` | No | 5 | multiple defaults (prod) |
| `LOKI_HOST` | No | 3 | multiple defaults (not specified) |
| `LOKI_INGESTION_RATE_MB` | No | 2 | not specified |
| `LOKI_PORT` | No | 24 | dev, prod |
| `LOKI_RETENTION_DAYS` | No | 1 | not specified |
| `LOKI_RETENTION_PERIOD` | No | 2 | not specified |
| `LOKI_URL` | No | 8 | multiple defaults (not specified) |
| `LONG_CONTEXT_WINDOW` | No | 1 | not specified |
| `LORA_ALPHA` | No | 2 | not specified |
| `LORA_DROPOUT` | No | 2 | not specified |
| `LORA_ENABLED` | No | 2 | not specified |
| `LORA_R` | No | 1 | not specified |
| `LORA_RANK` | No | 1 | not specified |
| `LORA_TARGET_MODULES` | No | 1 | not specified |
| `M15R7_HOST` | No | 1 | not specified |
| `M15R7_LAN_IP` | No | 1 | not specified |
| `MACHINE_CPU` | No | 4 | multiple defaults (not specified) |
| `MACHINE_CPU_CORES` | No | 1 | not specified |
| `MACHINE_CPU_THREADS` | No | 1 | not specified |
| `MACHINE_GPU_NAME` | No | 5 | multiple defaults (not specified) |
| `MACHINE_GPU_TYPE` | No | 6 | multiple defaults (not specified) |
| `MACHINE_GPU_VRAM_GB` | No | 6 | multiple defaults (not specified) |
| `MACHINE_HAS_GPU` | No | 4 | multiple defaults (not specified) |
| `MACHINE_HOSTNAME` | No | 9 | multiple defaults (not specified) |
| `MACHINE_IP_ETHERNET` | No | 8 | multiple defaults (not specified) |
| `MACHINE_IP_TAILSCALE` | No | 8 | multiple defaults (not specified) |
| `MACHINE_IP_WAN` | No | 2 | not specified |
| `MACHINE_IP_WIFI` | No | 3 | not specified |
| `MACHINE_MAC_ETHERNET` | No | 6 | multiple defaults (not specified) |
| `MACHINE_MAC_WIFI` | No | 3 | not specified |
| `MACHINE_MODEL` | No | 1 | not specified |
| `MACHINE_NAME` | No | 8 | multiple defaults (not specified) |
| `MACHINE_OS` | No | 4 | multiple defaults (not specified) |
| `MACHINE_PURPOSE` | No | 4 | multiple defaults (dev, prod) |
| `MACHINE_RAM_GB` | No | 4 | multiple defaults (not specified) |
| `MACHINE_ROLE` | No | 14 | multiple defaults (not specified) |
| `MACHINE_SPECIALIZATION` | No | 3 | multiple defaults (not specified) |
| `MACHINE_STORAGE` | No | 1 | not specified |
| `MACHINE_TAILSCALE_DOMAIN` | No | 2 | not specified |
| `MACHINE_TAILSCALE_FQDN` | No | 2 | not specified |
| `MACHINE_TYPE` | No | 1 | not specified |
| `MACHINE_USERNAME` | No | 2 | not specified |
| `MAC_ETHERNET` | No | 12 | multiple defaults (not specified) |
| `MAC_WIFI` | No | 12 | multiple defaults (not specified) |
| `MAGIC_UI_ENABLED` | No | 1 | not specified |
| `MAILGUN_API_KEY` | Yes | 2 | dev |
| `MAILGUN_DOMAIN` | No | 2 | dev |
| `MAILGUN_FROM` | No | 2 | dev |
| `MAIN_SUBDOMAIN` | No | 1 | not specified |
| `MANAGER_PORT` | No | 2 | multiple defaults (not specified) |
| `MAX_AGENTS` | No | 6 | multiple defaults (not specified) |
| `MAX_AGENTS_PER_WORKFLOW` | No | 1 | not specified |
| `MAX_BATCH_SIZE` | No | 6 | multiple defaults (not specified) |
| `MAX_BRANCHES` | No | 2 | not specified |
| `MAX_CONCURRENT_AGENTS` | No | 1 | not specified |
| `MAX_CONCURRENT_CONNECTIONS` | No | 1 | not specified |
| `MAX_CONCURRENT_EMBEDDINGS` | No | 2 | not specified |
| `MAX_CONCURRENT_FINETUNES` | No | 1 | not specified |
| `MAX_CONCURRENT_INFERENCES` | No | 2 | multiple defaults (not specified) |
| `MAX_CONCURRENT_JOBS` | No | 1 | not specified |
| `MAX_CONCURRENT_REQUESTS` | No | 13 | multiple defaults (not specified) |
| `MAX_CONCURRENT_SCRAPERS` | No | 1 | not specified |
| `MAX_CONCURRENT_TASKS` | No | 1 | not specified |
| `MAX_CONNECTIONS` | No | 2 | multiple defaults (not specified) |
| `MAX_CONNECTIONS_PER_USER` | No | 1 | not specified |
| `MAX_CONTEXT_LENGTH` | No | 3 | not specified |
| `MAX_CPU_CORES` | No | 1 | not specified |
| `MAX_DB_CONNECTIONS` | No | 1 | not specified |
| `MAX_DTI_RATIO` | No | 2 | not specified |
| `MAX_FILE_SIZE` | No | 4 | multiple defaults (not specified) |
| `MAX_LOAN_AMOUNT` | No | 1 | not specified |
| `MAX_LTV_RATIO` | No | 1 | not specified |
| `MAX_MEMORY` | No | 1 | not specified |
| `MAX_MEMORY_GB` | No | 1 | not specified |
| `MAX_MEMORY_MB` | No | 2 | not specified |
| `MAX_MODEL_LEN` | No | 8 | multiple defaults (not specified) |
| `MAX_RETRY_ATTEMPTS` | No | 2 | not specified |
| `MAX_SYSTEM_RAM_PERCENT` | No | 3 | multiple defaults (not specified) |
| `MAX_THOUGHTS` | No | 2 | not specified |
| `MAX_TOKENS` | Yes | 2 | multiple defaults (not specified) |
| `MAX_UPLOAD_SIZE` | No | 4 | dev, prod |
| `MAX_VRAM_USAGE_PERCENT` | No | 3 | not specified |
| `MAX_WORKERS` | No | 1 | not specified |
| `MCP_BITWARDEN_PORT` | No | 2 | not specified |
| `MCP_BRAVE_SEARCH_PORT` | No | 2 | not specified |
| `MCP_DB_NAME` | No | 2 | prod |
| `MCP_DB_PASSWORD` | Yes | 2 | not specified |
| `MCP_DB_USER` | No | 2 | prod |
| `MCP_DIFY_PORT` | No | 2 | not specified |
| `MCP_ENABLED` | No | 2 | not specified |
| `MCP_ENABLE_LOCAL_PACKAGES` | No | 4 | multiple defaults (dev, prod) |
| `MCP_FILESYSTEM_PORT` | No | 2 | not specified |
| `MCP_GATEWAY_URL` | No | 2 | dev |
| `MCP_GITHUB_PORT` | No | 2 | not specified |
| `MCP_GITLAB_PORT` | No | 2 | not specified |
| `MCP_GOOGLE_MAPS_PORT` | No | 2 | not specified |
| `MCP_HOST` | No | 2 | not specified |
| `MCP_HOT_RELOAD` | No | 4 | multiple defaults (dev, prod) |
| `MCP_LOG_LEVEL` | No | 4 | multiple defaults (dev, prod) |
| `MCP_NEXUS_HOST` | No | 1 | not specified |
| `MCP_NEXUS_LOG_LEVEL` | No | 1 | not specified |
| `MCP_NEXUS_MAX_CONNECTIONS` | No | 1 | not specified |
| `MCP_NEXUS_PORT` | No | 1 | not specified |
| `MCP_NEXUS_TIMEOUT` | No | 1 | not specified |
| `MCP_PORT` | No | 9 | multiple defaults (not specified) |
| `MCP_POSTGRES_PORT` | No | 2 | not specified |
| `MCP_PROTOCOL_VERSION` | No | 2 | not specified |
| `MCP_PROXY_MODE` | No | 2 | not specified |
| `MCP_PROXY_TYPE` | No | 2 | not specified |
| `MCP_REDIS_PASSWORD` | Yes | 2 | not specified |
| `MCP_SENTRY_PORT` | No | 2 | not specified |
| `MCP_SERVER_HOST` | No | 2 | not specified |
| `MCP_SERVER_NAME` | No | 2 | not specified |
| `MCP_SERVER_PORT` | No | 6 | multiple defaults (dev, prod) |
| `MCP_SERVER_URL` | No | 1 | not specified |
| `MCP_SERVER_VERSION` | No | 2 | not specified |
| `MCP_SLACK_PORT` | No | 2 | not specified |
| `MCP_TRANSPORT` | No | 1 | not specified |
| `MCP_TWENTYCRM_PORT` | No | 2 | not specified |
| `MCP_VSCODE_PORT` | No | 2 | not specified |
| `MEILI_MASTER_KEY` | Yes | 2 | not specified |
| `MEM0_API_KEY` | Yes | 13 | multiple defaults (dev) |
| `MEM0_API_URL` | No | 2 | dev |
| `MEM0_AUTO_CLEANUP` | No | 2 | not specified |
| `MEM0_BACKUP_DIR` | No | 2 | not specified |
| `MEM0_BACKUP_ENABLED` | No | 2 | not specified |
| `MEM0_BASE_URL` | No | 4 | not specified |
| `MEM0_CROSS_APP_SYNC` | No | 3 | not specified |
| `MEM0_DATA_RETENTION_DAYS` | No | 2 | not specified |
| `MEM0_DEFAULT_USER_ID` | No | 4 | multiple defaults (not specified) |
| `MEM0_EMBEDDING_MODEL` | No | 2 | not specified |
| `MEM0_EMBEDDING_PROVIDER` | No | 2 | not specified |
| `MEM0_ENABLED` | No | 9 | multiple defaults (not specified) |
| `MEM0_ENCRYPTION` | No | 3 | not specified |
| `MEM0_ENCRYPTION_KEY` | Yes | 2 | not specified |
| `MEM0_GDPR_COMPLIANT` | No | 3 | dev |
| `MEM0_HOST` | No | 1 | not specified |
| `MEM0_LLM_MODEL` | No | 2 | not specified |
| `MEM0_LLM_PROVIDER` | No | 2 | not specified |
| `MEM0_MCP_URL` | No | 1 | not specified |
| `MEM0_ORGANIZATION_ID` | No | 1 | not specified |
| `MEM0_ORGANIZATION_NAME` | No | 1 | not specified |
| `MEM0_PII_PROTECTION` | No | 3 | dev |
| `MEM0_PII_REDACTION` | No | 2 | not specified |
| `MEM0_PORT` | No | 11 | multiple defaults (dev) |
| `MEM0_POSTGRES_DB` | No | 2 | not specified |
| `MEM0_POSTGRES_HOST` | No | 2 | dev |
| `MEM0_POSTGRES_PASSWORD` | Yes | 2 | not specified |
| `MEM0_POSTGRES_PORT` | No | 2 | not specified |
| `MEM0_POSTGRES_USER` | No | 2 | not specified |
| `MEM0_PROFILE_SCHEMA` | No | 3 | dev |
| `MEM0_REDIS_URL` | No | 1 | not specified |
| `MEM0_REST_URL` | No | 1 | not specified |
| `MEM0_RETENTION_DAYS` | No | 3 | not specified |
| `MEM0_SERVER_URL` | No | 3 | dev |
| `MEM0_SYNC_INTERVAL` | No | 2 | not specified |
| `MEM0_TRACK_DECISIONS` | No | 2 | not specified |
| `MEM0_TRACK_INTERACTIONS` | No | 2 | not specified |
| `MEM0_TRACK_PREFERENCES` | No | 2 | not specified |
| `MEM0_URL` | No | 4 | multiple defaults (dev) |
| `MEM0_USER_PERSONALIZATION` | No | 3 | not specified |
| `MEM0_VECTOR_STORE` | No | 3 | not specified |
| `MEM0_VECTOR_STORE_URL` | No | 3 | dev |
| `MEMORY_AUTO_PERSIST` | No | 6 | multiple defaults (dev) |
| `MEMORY_BACKEND` | No | 14 | multiple defaults (dev, prod) |
| `MEMORY_BACKUP_TO_GITHUB` | No | 4 | multiple defaults (prod) |
| `MEMORY_CACHE_ONLY` | No | 6 | not specified |
| `MEMORY_CACHE_TYPE` | No | 1 | not specified |
| `MEMORY_COMPRESSION` | No | 7 | multiple defaults (dev, prod) |
| `MEMORY_CONSOLIDATION` | No | 1 | not specified |
| `MEMORY_ENABLE_HNSW` | No | 6 | multiple defaults (prod) |
| `MEMORY_ENCRYPTION` | No | 1 | prod |
| `MEMORY_HNSW_EF_CONSTRUCTION` | No | 2 | not specified |
| `MEMORY_HNSW_M` | No | 2 | not specified |
| `MEMORY_LIMIT` | No | 3 | multiple defaults (not specified) |
| `MEMORY_NAMESPACES` | No | 3 | multiple defaults (not specified) |
| `MEMORY_PRIMARY_STORE` | No | 4 | multiple defaults (prod) |
| `MEMORY_RETENTION_DAYS` | No | 3 | not specified |
| `MEMORY_SECONDARY_STORE` | No | 3 | multiple defaults (prod) |
| `MEMORY_SERVICE_ENABLED` | No | 1 | not specified |
| `MEMORY_SERVICE_HOST` | No | 1 | not specified |
| `MEMORY_SERVICE_PORT` | No | 1 | not specified |
| `MEMORY_SERVICE_URL` | No | 1 | dev |
| `MEMORY_SYNC_INTERVAL` | No | 14 | multiple defaults (dev, prod) |
| `MEMORY_THRESHOLD_PERCENT` | No | 3 | multiple defaults (not specified) |
| `MEMPALACE_PORT` | No | 1 | not specified |
| `MEMPALACE_URL` | No | 1 | not specified |
| `MEMPAL_DIR` | No | 1 | not specified |
| `MESSAGE_QUEUE_TYPE` | No | 1 | not specified |
| `METAMCP_PORT` | No | 2 | multiple defaults (not specified) |
| `METAMCP_SSE_URL` | No | 1 | dev |
| `METAMCP_WS_URL` | No | 1 | dev |
| `METRICS_ENABLED` | No | 6 | not specified |
| `METRICS_EXPORT_INTERVAL` | No | 1 | not specified |
| `METRICS_EXPORT_PORT` | No | 1 | not specified |
| `METRICS_PORT` | No | 5 | multiple defaults (not specified) |
| `METRICS_RETENTION_DAYS` | No | 5 | multiple defaults (not specified) |
| `MFA_ISSUER` | No | 1 | not specified |
| `MICROSOFT_CALLBACK_URL` | No | 1 | dev |
| `MICROSOFT_CLIENT_ID` | No | 1 | not specified |
| `MICROSOFT_CLIENT_SECRET` | Yes | 1 | not specified |
| `MINIO_API_PORT` | No | 3 | not specified |
| `MINIO_CONSOLE_PORT` | No | 3 | not specified |
| `MINIO_ROOT_PASSWORD` | Yes | 4 | multiple defaults (not specified) |
| `MINIO_ROOT_USER` | No | 1 | not specified |
| `MIN_BATCH_SIZE` | No | 2 | not specified |
| `MIN_CREDIT_SCORE` | No | 2 | not specified |
| `MIN_DISK_SPACE_GB` | No | 3 | multiple defaults (not specified) |
| `MIN_FREE_RAM_GB` | No | 3 | multiple defaults (not specified) |
| `MIN_FREE_VRAM_GB` | No | 3 | multiple defaults (not specified) |
| `MIN_LOAN_AMOUNT` | No | 1 | not specified |
| `MIN_TLS_VERSION` | No | 2 | prod |
| `MISTRAL_7B_PARAMS` | No | 1 | not specified |
| `MISTRAL_API_KEY` | Yes | 2 | not specified |
| `MIXED_PRECISION` | No | 1 | not specified |
| `MIXTRAL_8X22B_PARAMS` | No | 1 | not specified |
| `MIXTRAL_8X7B_PARAMS` | No | 1 | not specified |
| `MOCK_AWS` | No | 4 | dev |
| `MOCK_SENDGRID` | No | 4 | dev |
| `MOCK_SERVICES` | No | 3 | not specified |
| `MOCK_STRIPE` | No | 3 | not specified |
| `MOCK_TWILIO` | No | 4 | dev |
| `MODE` | No | 1 | prod |
| `MODEL_AFFINITY_ENABLED` | No | 1 | not specified |
| `MODEL_CACHE_DIR` | No | 4 | multiple defaults (not specified) |
| `MODEL_CACHE_SIZE_GB` | No | 2 | multiple defaults (not specified) |
| `MODEL_DTYPE` | No | 4 | not specified |
| `MODEL_MANAGER_PORT` | No | 2 | not specified |
| `MODEL_NAME` | No | 8 | multiple defaults (not specified) |
| `MODEL_ROUTING_COST_THRESHOLD` | No | 6 | not specified |
| `MODEL_ROUTING_FALLBACK_CLOUD` | No | 16 | dev |
| `MODEL_ROUTING_PREFER_LOCAL` | No | 16 | multiple defaults (dev) |
| `MODEL_ROUTING_STRATEGY` | No | 11 | dev, prod |
| `MOE_ENABLED` | No | 1 | not specified |
| `MOE_EXPERT_COUNT` | No | 3 | not specified |
| `MOE_LOAD_BALANCING` | No | 1 | not specified |
| `MOE_SPECIALIZATION` | No | 1 | not specified |
| `MOE_TOP_K` | No | 1 | not specified |
| `MOLTBOT_WEB_PORT` | No | 9 | dev |
| `MONGODB_DATABASE` | No | 4 | multiple defaults (dev, prod) |
| `MONGODB_HOST` | No | 1 | not specified |
| `MONGODB_INITDB_ROOT_PASSWORD` | Yes | 1 | not specified |
| `MONGODB_INITDB_ROOT_USERNAME` | No | 1 | not specified |
| `MONGODB_PASSWORD` | Yes | 1 | not specified |
| `MONGODB_PORT` | No | 1 | not specified |
| `MONGODB_URI` | No | 1 | dev |
| `MONGODB_URL` | No | 4 | multiple defaults (dev, prod) |
| `MONGODB_USERNAME` | No | 1 | not specified |
| `MONGO_PORT` | No | 9 | dev |
| `MONGO_ROOT_PASSWORD` | Yes | 14 | multiple defaults (dev) |
| `MONGO_ROOT_USER` | No | 9 | dev |
| `MONITORING_ALERT_CPU` | No | 1 | not specified |
| `MONITORING_ALERT_DISK` | No | 1 | not specified |
| `MONITORING_ALERT_MEMORY` | No | 1 | not specified |
| `MONITORING_ENABLED` | No | 1 | not specified |
| `MORTGAGE_ADMIN_EMAIL` | No | 1 | not specified |
| `N8N_API_KEY` | Yes | 8 | multiple defaults (not specified) |
| `N8N_BACKUP_PATH` | No | 1 | not specified |
| `N8N_BASE_URL` | No | 2 | multiple defaults (dev) |
| `N8N_BASIC_AUTH_ACTIVE` | Yes | 14 | multiple defaults (dev) |
| `N8N_BASIC_AUTH_PASSWORD` | Yes | 28 | multiple defaults (dev) |
| `N8N_BASIC_AUTH_USER` | Yes | 27 | multiple defaults (dev) |
| `N8N_BINARY_DATA_TTL` | No | 1 | not specified |
| `N8N_COMMUNITY_PACKAGES_ENABLED` | No | 1 | not specified |
| `N8N_DATABASE_URL` | No | 1 | not specified |
| `N8N_DATA_PATH` | No | 1 | not specified |
| `N8N_DB` | No | 4 | not specified |
| `N8N_DB_HOST` | No | 1 | not specified |
| `N8N_DB_NAME` | No | 7 | multiple defaults (dev) |
| `N8N_DB_PASSWORD` | Yes | 1 | not specified |
| `N8N_DB_PORT` | No | 1 | not specified |
| `N8N_DB_TYPE` | No | 1 | not specified |
| `N8N_DB_URL` | No | 1 | dev |
| `N8N_DB_USER` | No | 1 | not specified |
| `N8N_DEFAULT_BINARY_DATA_MODE` | No | 1 | not specified |
| `N8N_DISABLE_UI` | No | 1 | not specified |
| `N8N_EDITOR_BASE_URL` | No | 8 | dev |
| `N8N_ENABLED` | No | 5 | not specified |
| `N8N_ENCRYPTION_KEY` | Yes | 29 | multiple defaults (dev) |
| `N8N_EXECUTIONS_DATA_MAX_AGE` | No | 1 | not specified |
| `N8N_EXECUTIONS_DATA_PRUNE` | No | 1 | not specified |
| `N8N_EXECUTIONS_DATA_SAVE_ON_ERROR` | No | 2 | not specified |
| `N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS` | No | 2 | not specified |
| `N8N_EXECUTIONS_TIMEOUT` | No | 1 | not specified |
| `N8N_EXECUTIONS_TIMEOUT_MAX` | No | 1 | not specified |
| `N8N_EXECUTION_MODE` | No | 1 | not specified |
| `N8N_EXTRA_PACKAGES` | No | 1 | not specified |
| `N8N_HOST` | No | 23 | multiple defaults (dev) |
| `N8N_LOG_FILE` | No | 1 | not specified |
| `N8N_LOG_LEVEL` | No | 2 | not specified |
| `N8N_LOG_OUTPUT` | No | 1 | not specified |
| `N8N_METRICS` | No | 1 | not specified |
| `N8N_METRICS_PREFIX` | No | 1 | not specified |
| `N8N_PASSWORD` | Yes | 2 | not specified |
| `N8N_PORT` | No | 26 | dev |
| `N8N_POSTGRES_DB` | No | 4 | not specified |
| `N8N_POSTGRES_HOST` | No | 4 | dev |
| `N8N_POSTGRES_PASSWORD` | Yes | 5 | multiple defaults (not specified) |
| `N8N_POSTGRES_PORT` | No | 4 | not specified |
| `N8N_POSTGRES_USER` | No | 4 | not specified |
| `N8N_PROTOCOL` | No | 19 | multiple defaults (dev) |
| `N8N_PUBLIC_BASE_URL` | No | 1 | not specified |
| `N8N_SKIP_WEBHOOK_DNS_CHECK` | Yes | 2 | not specified |
| `N8N_TOKEN` | Yes | 1 | not specified |
| `N8N_URL` | No | 10 | multiple defaults (dev) |
| `N8N_VERSION` | No | 1 | not specified |
| `N8N_WEBHOOK_URL` | Yes | 13 | multiple defaults (dev) |
| `N8N_WEB_BIND` | No | 1 | not specified |
| `NAMESPACE_CLAUDE_FLOW` | No | 2 | multiple defaults (dev) |
| `NAMESPACE_DESKTOP_COMMANDER` | No | 2 | multiple defaults (dev) |
| `NAMESPACE_FLOW_NEXUS` | No | 2 | multiple defaults (dev) |
| `NAMESPACE_RUV_SWARM` | No | 2 | multiple defaults (dev) |
| `NCCL_DEBUG` | No | 1 | not specified |
| `NCCL_TIMEOUT` | No | 1 | not specified |
| `NEO4J_AUTH` | Yes | 1 | not specified |
| `NEO4J_AUTH_PASSWORD` | Yes | 1 | not specified |
| `NEO4J_AUTH_USER` | Yes | 1 | not specified |
| `NEO4J_BOLT_PORT` | No | 5 | not specified |
| `NEO4J_DATABASE` | No | 4 | multiple defaults (not specified) |
| `NEO4J_ENABLED` | No | 3 | not specified |
| `NEO4J_HOST` | No | 2 | multiple defaults (dev) |
| `NEO4J_HTTPS_PORT` | No | 1 | not specified |
| `NEO4J_HTTP_PORT` | No | 6 | dev |
| `NEO4J_INITIAL_HEAP_SIZE` | No | 1 | not specified |
| `NEO4J_MAX_HEAP_SIZE` | No | 1 | not specified |
| `NEO4J_PASSWORD` | Yes | 13 | multiple defaults (dev) |
| `NEO4J_PORT` | No | 1 | dev |
| `NEO4J_URI` | No | 6 | dev |
| `NEO4J_URL` | No | 2 | dev |
| `NEO4J_USER` | No | 7 | dev |
| `NEO4J_USERNAME` | No | 1 | not specified |
| `NETWORK_DRIVER` | No | 2 | not specified |
| `NETWORK_NAME` | No | 2 | not specified |
| `NEURAL_BATCH_SIZE` | No | 8 | multiple defaults (not specified) |
| `NEURAL_DATA_PATH` | No | 1 | not specified |
| `NEURAL_ERROR_PREVENTION_THRESHOLD` | No | 3 | not specified |
| `NEURAL_FLASH_ATTENTION` | No | 10 | prod |
| `NEURAL_LEARNING_RATE` | No | 3 | not specified |
| `NEURAL_MODEL_OPTIMIZATION` | No | 2 | not specified |
| `NEURAL_OPTIMIZATION_ENABLED` | No | 11 | prod |
| `NEURAL_PATTERNS_ENABLED` | No | 1 | not specified |
| `NEURAL_PERFORMANCE_AUTO_TUNE` | No | 3 | not specified |
| `NEURAL_QUANTIZATION` | No | 9 | multiple defaults (prod) |
| `NEURAL_UPDATE_FREQUENCY` | No | 3 | not specified |
| `NEXTAUTH_SECRET` | Yes | 2 | not specified |
| `NEXTAUTH_URL` | Yes | 2 | dev |
| `NEXT_PUBLIC_ACTIVEPIECES_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_API_BASE_URL` | No | 2 | multiple defaults (dev) |
| `NEXT_PUBLIC_API_KEY` | Yes | 1 | not specified |
| `NEXT_PUBLIC_API_URL` | No | 1 | dev |
| `NEXT_PUBLIC_APP_NAME` | No | 1 | not specified |
| `NEXT_PUBLIC_ARCHON_UI_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_BASE_URL` | No | 1 | dev |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | 1 | not specified |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_DEBUG` | No | 1 | not specified |
| `NEXT_PUBLIC_DIFY_APP_ID` | No | 4 | multiple defaults (dev) |
| `NEXT_PUBLIC_DIFY_WIDGET_URL` | No | 4 | multiple defaults (dev) |
| `NEXT_PUBLIC_DOCS_BASE_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_ENABLE_CALCULATOR` | No | 1 | not specified |
| `NEXT_PUBLIC_ENABLE_CHAT` | No | 1 | not specified |
| `NEXT_PUBLIC_GA_TRACKING_ID` | No | 1 | not specified |
| `NEXT_PUBLIC_GRAFANA_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_GTM_ID` | No | 1 | not specified |
| `NEXT_PUBLIC_MEM0_PROXY_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_N8N_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_NEXUS_URL` | No | 6 | multiple defaults (dev) |
| `NEXT_PUBLIC_OPENCLAW_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_PORTAINER_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_QUOTE_API_URL` | No | 2 | not specified |
| `NEXT_PUBLIC_SITE_NAME` | No | 2 | not specified |
| `NEXT_PUBLIC_SITE_URL` | No | 4 | multiple defaults (dev) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | No | 1 | not specified |
| `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_TWENTYCRM_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_TWENTY_URL` | No | 2 | dev |
| `NEXT_PUBLIC_WEBAPP_URL` | No | 1 | not specified |
| `NEXT_PUBLIC_WEBHOOK_URL` | Yes | 1 | not specified |
| `NEXT_PUBLIC_WS_URL` | No | 1 | dev |
| `NEXT_TELEMETRY_DISABLED` | No | 3 | not specified |
| `NEXUS_ADMIN_TOKEN` | Yes | 13 | multiple defaults (not specified) |
| `NEXUS_ADMIN_URL` | No | 2 | not specified |
| `NEXUS_API_URL` | No | 2 | not specified |
| `NEXUS_CIRCUIT_BREAKER_ENABLED` | No | 2 | not specified |
| `NEXUS_CIRCUIT_BREAKER_THRESHOLD` | No | 3 | not specified |
| `NEXUS_CIRCUIT_BREAKER_TIMEOUT` | No | 3 | not specified |
| `NEXUS_CPU_LIMIT` | No | 1 | not specified |
| `NEXUS_ENABLE_TELEMETRY` | No | 1 | not specified |
| `NEXUS_FALLBACK_ENABLED` | No | 3 | not specified |
| `NEXUS_FALLBACK_RETRIES` | No | 2 | not specified |
| `NEXUS_HEALTH_CHECK_ENABLED` | No | 2 | not specified |
| `NEXUS_HEALTH_CHECK_INTERVAL` | No | 3 | multiple defaults (not specified) |
| `NEXUS_HEALTH_CHECK_TIMEOUT` | No | 2 | not specified |
| `NEXUS_JWT_SECRET` | Yes | 11 | multiple defaults (not specified) |
| `NEXUS_LOAD_BALANCING` | No | 3 | not specified |
| `NEXUS_LOG` | No | 2 | not specified |
| `NEXUS_LOG_LEVEL` | No | 1 | not specified |
| `NEXUS_MCP_PORT` | No | 11 | multiple defaults (dev) |
| `NEXUS_MCP_URL` | No | 3 | multiple defaults (dev) |
| `NEXUS_MEMORY_LIMIT` | No | 2 | multiple defaults (not specified) |
| `NEXUS_METRICS_PORT` | No | 7 | dev |
| `NEXUS_METRICS_URL` | No | 2 | not specified |
| `NEXUS_MONITORING_ENABLED` | No | 1 | not specified |
| `NEXUS_PORT` | No | 14 | multiple defaults (dev) |
| `NEXUS_REDIS_URL` | No | 3 | multiple defaults (dev) |
| `NEXUS_ROUTER_API_KEY` | Yes | 3 | not specified |
| `NEXUS_ROUTER_BIND` | No | 1 | not specified |
| `NEXUS_ROUTER_ENABLED` | No | 7 | not specified |
| `NEXUS_ROUTER_HOST` | No | 1 | not specified |
| `NEXUS_ROUTER_MCP_BIND` | No | 1 | not specified |
| `NEXUS_ROUTER_MCP_PORT` | No | 7 | dev |
| `NEXUS_ROUTER_PORT` | No | 25 | multiple defaults (dev) |
| `NEXUS_ROUTER_URL` | No | 32 | multiple defaults (dev) |
| `NEXUS_STATUS_URL` | No | 1 | not specified |
| `NEXUS_URL` | No | 4 | multiple defaults (dev) |
| `NGINX_MEMORY_LIMIT` | No | 1 | not specified |
| `NGINX_PORT` | No | 1 | not specified |
| `NGINX_SSL_PORT` | No | 1 | not specified |
| `NMLS_VALIDATION_ENABLED` | No | 1 | not specified |
| `NODE_ENV` | No | 95 | multiple defaults (dev, prod) |
| `NODE_EXPORTER_PORT` | No | 5 | not specified |
| `NODE_IP` | No | 1 | not specified |
| `NODE_LABEL` | No | 1 | not specified |
| `NODE_OPTIONS` | No | 6 | multiple defaults (prod) |
| `NODE_VERSION` | No | 5 | not specified |
| `NOTIFICATION_EMAIL_ENABLED` | No | 1 | not specified |
| `NOTIFICATION_PUSH_ENABLED` | No | 1 | not specified |
| `NOTIFICATION_SMS_ENABLED` | No | 1 | not specified |
| `NOTIFICATION_WEBHOOK_URL` | Yes | 1 | not specified |
| `NOTION_API_KEY` | Yes | 1 | not specified |
| `NOTION_TOKEN` | Yes | 2 | not specified |
| `NVIDIA_DCGM_EXPORTER_PORT` | No | 3 | not specified |
| `NVIDIA_DRIVER_CAPABILITIES` | No | 12 | multiple defaults (not specified) |
| `NVIDIA_EXPORTER_HOST` | No | 3 | not specified |
| `NVIDIA_EXPORTER_INTERVAL` | No | 3 | multiple defaults (not specified) |
| `NVIDIA_EXPORTER_PORT` | No | 5 | multiple defaults (not specified) |
| `NVIDIA_GPU_MONITORING` | No | 3 | not specified |
| `NVIDIA_SMI_INTERVAL` | No | 3 | multiple defaults (not specified) |
| `NVIDIA_VISIBLE_DEVICES` | No | 19 | multiple defaults (not specified) |
| `NYRA_ADMIN_DOMAIN` | No | 1 | not specified |
| `NYRA_ADMIN_PORT` | No | 1 | not specified |
| `NYRA_ALLOWED_CHANNELS` | No | 7 | not specified |
| `NYRA_API_KEY` | Yes | 1 | not specified |
| `NYRA_CAMPAIGN_AUTOMATION_ENABLED` | No | 1 | not specified |
| `NYRA_CAMPAIGN_ENGINE_URL` | No | 1 | not specified |
| `NYRA_CHAT_INTERNAL_API_BASE_URL` | No | 1 | not specified |
| `NYRA_CHAT_INTERNAL_PROXY_TOKEN` | Yes | 1 | not specified |
| `NYRA_COMPLIANCE_TRACKING_ENABLED` | No | 1 | not specified |
| `NYRA_DOMAIN_ROOT` | No | 2 | not specified |
| `NYRA_ENVIRONMENT` | No | 9 | multiple defaults (dev, prod) |
| `NYRA_ESCALATION_EMAIL` | No | 7 | multiple defaults (not specified) |
| `NYRA_FORCE_SECRETS` | Yes | 2 | not specified |
| `NYRA_HTTP_ALLOWLIST` | No | 2 | dev |
| `NYRA_INTEGRATION_ENABLED` | No | 3 | dev |
| `NYRA_LEAD_SCORING_ENABLED` | No | 1 | not specified |
| `NYRA_MACHINE` | No | 2 | not specified |
| `NYRA_MCP_PORT` | No | 2 | not specified |
| `NYRA_NETWORK` | No | 3 | not specified |
| `NYRA_NETWORK_NAME` | No | 2 | not specified |
| `NYRA_NEXUS_ROUTER_URL` | No | 3 | multiple defaults (dev) |
| `NYRA_NODE_ID` | No | 4 | multiple defaults (not specified) |
| `NYRA_NODE_TYPE` | No | 4 | multiple defaults (not specified) |
| `NYRA_ORCHESTRATOR_HOST` | No | 2 | not specified |
| `NYRA_ORCHESTRATOR_PORT` | No | 5 | multiple defaults (not specified) |
| `NYRA_ORCHESTRATOR_TUNNEL_ID_CHANGE_TEMP` | No | 1 | not specified |
| `NYRA_PC_ID` | No | 7 | not specified |
| `NYRA_PC_ROLE` | No | 1 | not specified |
| `NYRA_POLICY_MODE` | No | 7 | not specified |
| `NYRA_POSTGRES_PASSWORD` | Yes | 1 | not specified |
| `NYRA_POSTGRES_PORT` | No | 1 | not specified |
| `NYRA_PUBLIC_BASE_URL` | No | 1 | not specified |
| `NYRA_QUOTE_ENGINE_URL` | No | 1 | not specified |
| `NYRA_QUOTE_INTEGRATION_ENABLED` | No | 1 | not specified |
| `NYRA_REDIS_PORT` | No | 1 | not specified |
| `NYRA_STACK_NAME` | No | 2 | multiple defaults (dev) |
| `NYRA_WEBHOOK_SECRET` | Yes | 4 | multiple defaults (dev, prod) |
| `OAUTH_CLIENT_ID` | Yes | 1 | not specified |
| `OAUTH_CLIENT_SECRET` | Yes | 1 | not specified |
| `OAUTH_ENABLED` | Yes | 1 | not specified |
| `OAUTH_PROVIDER` | Yes | 1 | not specified |
| `OCR_CONFIDENCE_THRESHOLD` | No | 1 | not specified |
| `OCR_ENABLED` | No | 1 | not specified |
| `OCR_LANGUAGE` | No | 1 | not specified |
| `OLLAMA_3060_HOST` | No | 1 | not specified |
| `OLLAMA_3060_NUM_GPU` | No | 1 | not specified |
| `OLLAMA_3060_PORT` | No | 1 | not specified |
| `OLLAMA_3060_URL` | No | 5 | multiple defaults (dev) |
| `OLLAMA_3090_HOST` | No | 1 | not specified |
| `OLLAMA_3090_PORT` | No | 1 | not specified |
| `OLLAMA_3090_URL` | No | 5 | multiple defaults (dev) |
| `OLLAMA_API` | No | 1 | not specified |
| `OLLAMA_API_BASE_URL` | No | 2 | not specified |
| `OLLAMA_BASE_URL` | No | 2 | multiple defaults (not specified) |
| `OLLAMA_BATCH_SIZE` | No | 1 | not specified |
| `OLLAMA_BIND` | No | 3 | not specified |
| `OLLAMA_CONTEXT_SIZE` | No | 1 | not specified |
| `OLLAMA_DATA_DIR` | No | 2 | not specified |
| `OLLAMA_DEBUG` | No | 3 | multiple defaults (not specified) |
| `OLLAMA_EMBEDDING_MODEL` | No | 2 | not specified |
| `OLLAMA_ENABLED` | No | 4 | multiple defaults (not specified) |
| `OLLAMA_FLASH_ATTENTION` | No | 5 | multiple defaults (not specified) |
| `OLLAMA_GPU_LAYERS` | No | 6 | multiple defaults (not specified) |
| `OLLAMA_GPU_MEMORY_FRACTION` | No | 3 | not specified |
| `OLLAMA_HOST` | No | 20 | multiple defaults (not specified) |
| `OLLAMA_INFERENCE_TIMEOUT` | No | 3 | multiple defaults (not specified) |
| `OLLAMA_INTERNAL_URL` | No | 2 | not specified |
| `OLLAMA_KEEP_ALIVE` | No | 12 | multiple defaults (not specified) |
| `OLLAMA_KV_CACHE_TYPE` | No | 1 | not specified |
| `OLLAMA_LOAD_TIMEOUT` | No | 3 | multiple defaults (not specified) |
| `OLLAMA_MAX_LOADED_MODELS` | No | 13 | multiple defaults (not specified) |
| `OLLAMA_MAX_QUEUE` | No | 2 | not specified |
| `OLLAMA_MAX_VRAM` | No | 2 | not specified |
| `OLLAMA_MCP_HOST` | No | 1 | not specified |
| `OLLAMA_MCP_PORT` | No | 1 | not specified |
| `OLLAMA_MODEL` | No | 2 | not specified |
| `OLLAMA_MODELS` | No | 17 | multiple defaults (not specified) |
| `OLLAMA_MODELS_DIR` | No | 3 | not specified |
| `OLLAMA_MODELS_PATH` | No | 2 | not specified |
| `OLLAMA_NUM_CTX` | No | 2 | not specified |
| `OLLAMA_NUM_GPU` | No | 6 | multiple defaults (not specified) |
| `OLLAMA_NUM_GPU_LAYERS` | No | 1 | not specified |
| `OLLAMA_NUM_PARALLEL` | No | 12 | multiple defaults (not specified) |
| `OLLAMA_NUM_THREAD` | No | 1 | not specified |
| `OLLAMA_OPTIMIZATION_LEVEL` | No | 2 | multiple defaults (not specified) |
| `OLLAMA_ORIGINS` | No | 3 | not specified |
| `OLLAMA_PORT` | No | 16 | not specified |
| `OLLAMA_PROXY_TIMEOUT` | No | 1 | not specified |
| `OLLAMA_ROPE_FREQ_BASE` | No | 2 | not specified |
| `OLLAMA_ROPE_FREQ_SCALE` | No | 2 | not specified |
| `OLLAMA_URL` | No | 2 | dev |
| `ONNX_API_URL` | No | 1 | not specified |
| `ONNX_BATCH_SIZE` | No | 1 | not specified |
| `ONNX_INTERNAL_URL` | No | 2 | not specified |
| `ONNX_MODEL_PATH` | No | 2 | not specified |
| `ONNX_QUANTIZATION` | No | 1 | not specified |
| `ONNX_RUNTIME_DEVICE` | No | 2 | not specified |
| `ONNX_RUNTIME_ENABLED` | No | 1 | not specified |
| `ONNX_RUNTIME_INTER_OP_THREADS` | No | 2 | not specified |
| `ONNX_RUNTIME_INTRA_OP_THREADS` | No | 2 | not specified |
| `ONNX_RUNTIME_LOG_LEVEL` | No | 2 | not specified |
| `ONNX_RUNTIME_PROVIDER` | No | 2 | not specified |
| `OPENAI_API_BASE` | No | 1 | dev |
| `OPENAI_API_KEY` | Yes | 56 | multiple defaults (dev) |
| `OPENAI_BASE_URL` | No | 3 | multiple defaults (not specified) |
| `OPENAI_EMBEDDING_DIMENSIONS` | No | 1 | not specified |
| `OPENAI_EMBEDDING_MODEL` | No | 3 | not specified |
| `OPENAI_MAX_TOKENS` | Yes | 1 | not specified |
| `OPENAI_MODEL` | No | 2 | multiple defaults (not specified) |
| `OPENAI_ORG_ID` | No | 4 | not specified |
| `OPENCLAW_CHAT_PATH` | No | 1 | not specified |
| `OPENCLAW_COMPOSE_VALIDATE` | No | 1 | not specified |
| `OPENCLAW_CONFIG_PATH` | No | 1 | not specified |
| `OPENCLAW_DATA_DIR` | No | 1 | not specified |
| `OPENCLAW_DEFAULT_MODEL` | No | 1 | not specified |
| `OPENCLAW_DOCKER_APT_PACKAGES` | No | 2 | multiple defaults (not specified) |
| `OPENCLAW_FORCE_BUILD` | No | 1 | not specified |
| `OPENCLAW_GATEWAY_PORT` | No | 1 | not specified |
| `OPENCLAW_GATEWAY_TOKEN` | Yes | 3 | not specified |
| `OPENCLAW_HEALTH_TIMEOUT_S` | No | 1 | not specified |
| `OPENCLAW_HOME_VOLUME` | No | 1 | not specified |
| `OPENCLAW_HTTP_ALLOWLIST` | No | 1 | not specified |
| `OPENCLAW_INSTALL_BROWSER` | No | 2 | multiple defaults (not specified) |
| `OPENCLAW_MVP_IMAGE` | No | 2 | dev |
| `OPENCLAW_MVP_PORT` | No | 1 | not specified |
| `OPENCLAW_OPENAI_BASE_URL` | No | 1 | not specified |
| `OPENCLAW_OUTBOUND_HTTP_ALLOWLIST` | No | 1 | not specified |
| `OPENCLAW_PORT` | No | 1 | not specified |
| `OPENCLAW_PORTS` | No | 1 | not specified |
| `OPENCLAW_PROVIDER` | No | 1 | not specified |
| `OPENCLAW_PUBLIC_BASE_URL` | No | 4 | multiple defaults (dev) |
| `OPENCLAW_SANDBOX_ENABLED` | No | 2 | not specified |
| `OPENCLAW_SECRET_REF_MODE` | Yes | 1 | not specified |
| `OPENCLAW_SESSION_PATH` | No | 1 | not specified |
| `OPENCLAW_TOOLS_ALLOW` | No | 1 | not specified |
| `OPENCLAW_TOOLS_DENY` | No | 1 | not specified |
| `OPENCLAW_TOOL_POLICY` | No | 2 | not specified |
| `OPENCLAW_UI_PREFIX` | No | 1 | not specified |
| `OPENCLAW_UI_PROXY_PORT` | No | 1 | not specified |
| `OPENCLAW_WEBHOOK_INGRESS_PATH` | Yes | 1 | not specified |
| `OPENCLAW_WORKSPACE_VOLUME` | No | 1 | not specified |
| `OPENMEMORY_API_KEY` | Yes | 3 | not specified |
| `OPENMEMORY_API_URL` | No | 4 | not specified |
| `OPENMEMORY_BACKUP_DESTINATION` | No | 2 | not specified |
| `OPENMEMORY_BACKUP_DIR` | No | 2 | not specified |
| `OPENMEMORY_BACKUP_ENABLED` | No | 2 | not specified |
| `OPENMEMORY_CLOUD_BACKUP` | No | 2 | not specified |
| `OPENMEMORY_CROSS_APP_SHARING` | No | 2 | not specified |
| `OPENMEMORY_DB_URL` | No | 1 | dev |
| `OPENMEMORY_ENABLED` | No | 9 | multiple defaults (not specified) |
| `OPENMEMORY_ENCRYPTION` | No | 3 | not specified |
| `OPENMEMORY_ENCRYPTION_KEY` | Yes | 2 | not specified |
| `OPENMEMORY_MAX_MEMORIES_PER_USER` | No | 2 | not specified |
| `OPENMEMORY_MAX_USERS` | No | 2 | not specified |
| `OPENMEMORY_MCP_ENABLED` | No | 2 | not specified |
| `OPENMEMORY_MCP_PORT` | No | 3 | dev |
| `OPENMEMORY_MCP_SERVER` | No | 2 | not specified |
| `OPENMEMORY_PERSISTENCE` | No | 2 | not specified |
| `OPENMEMORY_PERSISTENCE_DIR` | No | 2 | not specified |
| `OPENMEMORY_PORT` | No | 2 | dev |
| `OPENMEMORY_POSTGRES_DB` | No | 2 | not specified |
| `OPENMEMORY_POSTGRES_HOST` | No | 2 | dev |
| `OPENMEMORY_POSTGRES_PASSWORD` | Yes | 2 | not specified |
| `OPENMEMORY_POSTGRES_PORT` | No | 2 | not specified |
| `OPENMEMORY_POSTGRES_USER` | No | 2 | not specified |
| `OPENMEMORY_SERVER_URL` | No | 2 | dev |
| `OPENMEMORY_SHARED_MEMORY` | No | 3 | not specified |
| `OPENMEMORY_SYNC_INTERVAL` | No | 5 | multiple defaults (not specified) |
| `OPENMEMORY_URL` | No | 1 | dev |
| `OPENMEMORY_VECTOR_STORE` | No | 2 | not specified |
| `OPENROUTER_API_KEY` | Yes | 66 | multiple defaults (dev, prod) |
| `OPENROUTER_BASE_URL` | No | 10 | dev |
| `OPENROUTER_FALLBACK_MODEL` | No | 6 | not specified |
| `OPENROUTER_MAX_TOKENS` | Yes | 2 | not specified |
| `OPENROUTER_MODEL` | No | 5 | not specified |
| `OPENROUTER_SITE_NAME` | No | 1 | not specified |
| `OPENROUTER_SITE_URL` | No | 1 | not specified |
| `OPENWEBUI_DATA` | No | 1 | not specified |
| `OPENWEBUI_OPENAI_API_KEY` | Yes | 1 | not specified |
| `OPENWEBUI_PORT` | No | 13 | multiple defaults (dev) |
| `OPENWEBUI_SECRET_KEY` | Yes | 1 | not specified |
| `OPEN_WEBUI_ENABLED` | No | 2 | not specified |
| `OPEN_WEBUI_PORT` | No | 3 | dev |
| `OPEN_WEBUI_URL` | No | 4 | multiple defaults (dev) |
| `OPTIMAL_BLUE_API_KEY` | Yes | 3 | not specified |
| `OPTIMAL_BLUE_API_URL` | No | 2 | not specified |
| `OPTIMAL_BLUE_BASE_URL` | No | 1 | not specified |
| `OPTIMAL_BLUE_CLIENT_ID` | No | 3 | not specified |
| `OPTIMAL_BLUE_ENVIRONMENT` | No | 1 | prod |
| `OPT_TAG` | No | 2 | not specified |
| `OPT_TAG_CUSTOM` | No | 2 | not specified |
| `OPT_TAG_GITHUB` | No | 2 | not specified |
| `OPT_TAG_GITHUBSTARS` | No | 2 | not specified |
| `OPT_TAG_LANGUAGE` | No | 2 | not specified |
| `OPT_TAG_USERNAME` | No | 2 | not specified |
| `ORACLE_INSTANCE_IP` | No | 1 | not specified |
| `ORACLE_REGION` | No | 1 | not specified |
| `ORCHESTRATION_MODE` | No | 2 | not specified |
| `ORCHESTRATOR_API_KEY` | Yes | 3 | not specified |
| `ORCHESTRATOR_HOST` | No | 3 | not specified |
| `ORCHESTRATOR_IP` | No | 3 | multiple defaults (dev) |
| `ORCHESTRATOR_PORT` | No | 3 | not specified |
| `ORCHESTRATOR_PROMETHEUS_URL` | No | 1 | not specified |
| `ORCHESTRATOR_TAILSCALE_IP` | No | 8 | not specified |
| `ORCHESTRATOR_URL` | No | 13 | multiple defaults (dev) |
| `ORCH_HOST` | No | 1 | not specified |
| `ORCH_LAN_IP` | No | 1 | not specified |
| `OTEL_EXPORT_TYPE` | No | 1 | not specified |
| `OTEL_TELEMETRY_COLLECTION_ENABLED` | No | 1 | not specified |
| `OWUI_PASSWORD` | Yes | 1 | not specified |
| `OWUI_USERNAME` | No | 1 | dev |
| `PAGERDUTY_INTEGRATION_KEY` | Yes | 1 | not specified |
| `PAGERDUTY_SERVICE_KEY` | Yes | 1 | not specified |
| `PARALLEL_PROCESSING` | No | 2 | not specified |
| `PASSWORD_RESET_EXPIRY` | Yes | 1 | not specified |
| `PASSWORD_RESET_TIMEOUT` | Yes | 4 | multiple defaults (dev, prod) |
| `PASSWORD_RESET_TOKEN_EXPIRE` | Yes | 4 | multiple defaults (dev, prod) |
| `PATTERN_DISTILLATION` | No | 1 | not specified |
| `PC2_INFERENCE_FALLBACK` | No | 1 | not specified |
| `PC2_LITELLM_PORT` | No | 1 | not specified |
| `PC2_LOAD_THRESHOLD` | No | 1 | not specified |
| `PC2_OLLAMA_PORT` | No | 1 | not specified |
| `PC2_ORCHESTRATOR_IP` | No | 1 | not specified |
| `PC3_LOAD_THRESHOLD` | No | 1 | not specified |
| `PC3_MEMORY_SERVICE_PORT` | No | 1 | not specified |
| `PC3_OLLAMA_PORT` | No | 1 | not specified |
| `PC3_ORCHESTRATOR_IP` | No | 1 | not specified |
| `PC3_VLLM_PORT` | No | 1 | not specified |
| `PC4_INFERENCE_FALLBACK` | No | 1 | not specified |
| `PC4_OLLAMA_PORT` | No | 1 | not specified |
| `PC4_ORCHESTRATOR_IP` | No | 1 | not specified |
| `PC4_VLLM_PORT` | No | 1 | not specified |
| `PC_NAME` | No | 13 | multiple defaults (not specified) |
| `PC_ROLE` | No | 13 | multiple defaults (not specified) |
| `PERF_MONITOR_PORT` | No | 2 | not specified |
| `PERF_TARGET_COMMAND_EXECUTION` | No | 3 | not specified |
| `PERF_TARGET_MCP_RESPONSE` | No | 2 | not specified |
| `PERF_TARGET_MEMORY_OPERATIONS` | No | 3 | not specified |
| `PERF_TARGET_NEURAL_PREDICTIONS` | No | 3 | not specified |
| `PERPLEXITY_API_KEY` | Yes | 1 | not specified |
| `PGADMIN_PASSWORD` | Yes | 3 | multiple defaults (not specified) |
| `PGADMIN_PORT` | No | 3 | not specified |
| `PG_DATABASE_HOST` | No | 1 | not specified |
| `PG_DATABASE_NAME` | No | 1 | not specified |
| `PG_DATABASE_URL` | No | 5 | dev |
| `PG_DATABASE_USER` | No | 1 | not specified |
| `PII_ENCRYPTION_ENABLED` | No | 1 | not specified |
| `PII_MASKING_ENABLED` | No | 2 | prod |
| `PORT` | No | 29 | multiple defaults (dev) |
| `PORTAINER_ADMIN_PASSWORD` | Yes | 1 | not specified |
| `PORTAINER_ADMIN_USERNAME` | No | 1 | not specified |
| `PORTAINER_AGENT_PORT` | No | 1 | not specified |
| `PORTAINER_AGENT_SECRET` | Yes | 1 | not specified |
| `PORTAINER_AGENT_TAGS` | No | 1 | not specified |
| `PORTAINER_EDGE_ID` | No | 2 | not specified |
| `PORTAINER_EDGE_INSECURE_POLL` | No | 2 | not specified |
| `PORTAINER_EDGE_KEY` | Yes | 3 | not specified |
| `PORTAINER_HTTP_PORT` | No | 1 | not specified |
| `PORTAINER_ORCHESTRATOR_URL` | No | 1 | not specified |
| `PORTAINER_PORT` | No | 1 | not specified |
| `PORTAINER_PUBLIC_URL` | No | 1 | not specified |
| `PORTAINER_URL` | No | 2 | not specified |
| `PORT_ACTIVEPIECES` | No | 2 | not specified |
| `PORT_DIFY` | No | 2 | not specified |
| `PORT_LETTA` | No | 1 | not specified |
| `PORT_LITELLM` | No | 2 | not specified |
| `PORT_N8N` | No | 2 | not specified |
| `PORT_RANGE_END` | No | 2 | multiple defaults (not specified) |
| `PORT_RANGE_START` | No | 2 | multiple defaults (not specified) |
| `PORT_TWENTYCRM` | No | 2 | not specified |
| `POSTGRES_BIND` | No | 1 | not specified |
| `POSTGRES_CPU_LIMIT` | No | 1 | not specified |
| `POSTGRES_DB` | No | 49 | multiple defaults (dev, prod) |
| `POSTGRES_HOST` | No | 23 | multiple defaults (dev) |
| `POSTGRES_INITDB_ARGS` | No | 1 | not specified |
| `POSTGRES_MAX_CONNECTIONS` | No | 3 | multiple defaults (not specified) |
| `POSTGRES_MEMORY_LIMIT` | No | 3 | multiple defaults (not specified) |
| `POSTGRES_PASSWORD` | Yes | 57 | multiple defaults (dev, prod) |
| `POSTGRES_POOL_SIZE` | No | 2 | not specified |
| `POSTGRES_PORT` | No | 40 | multiple defaults (dev) |
| `POSTGRES_SHARED_BUFFERS` | No | 1 | not specified |
| `POSTGRES_SUPER_PASSWORD` | Yes | 1 | not specified |
| `POSTGRES_URL` | No | 10 | multiple defaults (dev) |
| `POSTGRES_USER` | No | 53 | multiple defaults (dev) |
| `PREFETCH_THRESHOLD` | No | 3 | multiple defaults (not specified) |
| `PREFLIGHT_CONTINUE` | No | 2 | dev |
| `PRIMARY_IP` | No | 1 | not specified |
| `PRIMARY_MODEL` | No | 5 | multiple defaults (not specified) |
| `PRIMARY_MODELS` | No | 2 | not specified |
| `PRIMARY_MODEL_SIZE` | No | 2 | not specified |
| `PRIMARY_MODEL_VRAM` | No | 2 | not specified |
| `PRIMARY_NETWORK_INTERFACE` | No | 1 | not specified |
| `PRIMARY_ORCHESTRATOR` | No | 2 | multiple defaults (not specified) |
| `PRIORITY_QUEUE_DEPTH` | No | 1 | not specified |
| `PROD` | No | 1 | not specified |
| `PROD_PORT` | No | 2 | prod |
| `PROFILE_PORT` | No | 3 | multiple defaults (not specified) |
| `PROFILING_ENABLED` | No | 2 | not specified |
| `PROJECT_ENV` | No | 6 | multiple defaults (dev, prod) |
| `PROJECT_NAME` | No | 8 | dev |
| `PROJECT_REGION` | No | 2 | not specified |
| `PROJECT_VERSION` | No | 2 | not specified |
| `PROMETHEUS_BIND` | No | 1 | not specified |
| `PROMETHEUS_ENABLED` | No | 22 | multiple defaults (dev, prod) |
| `PROMETHEUS_HOST` | No | 2 | not specified |
| `PROMETHEUS_NODE_EXPORTER_PORT` | No | 4 | not specified |
| `PROMETHEUS_PORT` | No | 48 | multiple defaults (dev, prod) |
| `PROMETHEUS_PUSHGATEWAY` | No | 1 | not specified |
| `PROMETHEUS_PUSH_GATEWAY` | No | 10 | multiple defaults (not specified) |
| `PROMETHEUS_REMOTE_WRITE_URL` | No | 3 | not specified |
| `PROMETHEUS_RETENTION` | No | 7 | multiple defaults (prod) |
| `PROMETHEUS_RETENTION_DAYS` | No | 4 | multiple defaults (not specified) |
| `PROMETHEUS_RETENTION_TIME` | No | 1 | not specified |
| `PROMETHEUS_SCRAPE_INTERVAL` | No | 4 | not specified |
| `PROMETHEUS_URL` | No | 7 | multiple defaults (dev) |
| `PROMTAIL_PORT` | No | 1 | not specified |
| `PROVIDER` | No | 12 | multiple defaults (dev, prod) |
| `PROXY_PORT` | No | 4 | multiple defaults (not specified) |
| `PUBLIC_ADMIN_URL` | No | 3 | not specified |
| `PUBLIC_BROKER_PORTAL_URL` | No | 5 | not specified |
| `PUBLIC_CRM_URL` | No | 2 | not specified |
| `PUBLIC_FLOWS_URL` | No | 2 | not specified |
| `PUBLIC_FLOW_DASHBOARD_URL` | No | 2 | not specified |
| `PUBLIC_GRAFANA_URL` | No | 2 | not specified |
| `PUBLIC_IP` | No | 1 | not specified |
| `PUBLIC_LANDING_URL` | No | 5 | not specified |
| `PUBLIC_N8N_URL` | No | 3 | not specified |
| `PYTHON_ENV` | No | 3 | prod |
| `PYTHON_VERSION` | No | 3 | not specified |
| `QDRANT_API_KEY` | Yes | 16 | multiple defaults (dev) |
| `QDRANT_BIND` | No | 1 | not specified |
| `QDRANT_COLLECTION` | No | 3 | dev |
| `QDRANT_COLLECTION_NAME` | No | 3 | not specified |
| `QDRANT_DISTANCE` | No | 1 | not specified |
| `QDRANT_DISTANCE_METRIC` | No | 2 | not specified |
| `QDRANT_ENABLED` | No | 10 | multiple defaults (not specified) |
| `QDRANT_GRPC_PORT` | No | 2 | not specified |
| `QDRANT_GRPC_URL` | No | 2 | dev |
| `QDRANT_HOST` | No | 4 | multiple defaults (dev) |
| `QDRANT_INDEXING_THRESHOLD` | No | 3 | not specified |
| `QDRANT_LOCAL` | No | 2 | not specified |
| `QDRANT_LOCALHOST_URL` | No | 1 | dev |
| `QDRANT_ON_DISK_PAYLOAD` | No | 3 | not specified |
| `QDRANT_OPTIMIZATION_ENABLED` | No | 1 | not specified |
| `QDRANT_OPTIMIZE_INTERVAL` | No | 2 | not specified |
| `QDRANT_PAYLOAD_INDEXING` | No | 2 | not specified |
| `QDRANT_PERSISTENCE_DIR` | No | 2 | not specified |
| `QDRANT_PORT` | No | 13 | dev |
| `QDRANT_SNAPSHOT_DIR` | No | 2 | not specified |
| `QDRANT_SNAPSHOT_ENABLED` | No | 2 | not specified |
| `QDRANT_URL` | No | 13 | multiple defaults (dev) |
| `QDRANT_VECTOR_SIZE` | No | 6 | dev |
| `QUANTIZATION_FORMAT` | No | 3 | not specified |
| `QUERY_CACHE_ENABLED` | No | 4 | dev, prod |
| `QUERY_CACHE_TTL` | No | 4 | multiple defaults (dev, prod) |
| `QUERY_TIMEOUT` | No | 1 | not specified |
| `QUEUE_ATTEMPTS` | No | 4 | multiple defaults (dev, prod) |
| `QUEUE_BACKOFF_DELAY` | No | 4 | multiple defaults (dev, prod) |
| `QUEUE_BULL_REDIS_HOST` | No | 1 | not specified |
| `QUEUE_BULL_REDIS_PASSWORD` | Yes | 1 | not specified |
| `QUEUE_BULL_REDIS_PORT` | No | 1 | not specified |
| `QUEUE_CONCURRENCY` | No | 4 | multiple defaults (dev, prod) |
| `QUEUE_DEFAULT_JOB_OPTIONS` | No | 1 | not specified |
| `QUEUE_PROCESSING_DELAY` | No | 4 | multiple defaults (dev, prod) |
| `QUEUE_REDIS_URL` | No | 4 | multiple defaults (dev, prod) |
| `QUEUE_SIZE` | No | 1 | not specified |
| `QUEUE_TIMEOUT` | No | 1 | not specified |
| `QUIC_SYNC_PORT` | No | 2 | not specified |
| `QUOTE_API_PORT` | No | 11 | multiple defaults (dev) |
| `QUOTE_API_POSTGRES_DB` | No | 2 | not specified |
| `QUOTE_API_POSTGRES_HOST` | No | 2 | dev |
| `QUOTE_API_POSTGRES_PORT` | No | 2 | not specified |
| `QUOTE_API_REDIS_DB` | No | 2 | not specified |
| `QUOTE_API_REDIS_HOST` | No | 2 | dev |
| `QUOTE_API_REDIS_PORT` | No | 2 | not specified |
| `QUOTE_API_SECRET` | Yes | 2 | multiple defaults (not specified) |
| `QUOTE_API_URL` | No | 4 | multiple defaults (dev) |
| `QUOTE_ENGINE_HOST` | No | 4 | not specified |
| `QUOTE_ENGINE_PORT` | No | 8 | multiple defaults (not specified) |
| `QUOTE_ENGINE_URL` | No | 5 | multiple defaults (dev) |
| `QWEN2_5_32B_PARAMS` | No | 1 | not specified |
| `QWEN2_5_72B_PARAMS` | No | 1 | not specified |
| `RABBITMQ_EXCHANGE` | No | 1 | not specified |
| `RABBITMQ_MANAGEMENT_PORT` | No | 1 | not specified |
| `RABBITMQ_PASSWORD` | Yes | 1 | not specified |
| `RABBITMQ_QUEUE` | No | 1 | not specified |
| `RABBITMQ_URL` | No | 1 | not specified |
| `RABBITMQ_USER` | No | 1 | not specified |
| `RAG_ENABLED` | No | 1 | not specified |
| `RAG_SIMILARITY_THRESHOLD` | No | 1 | not specified |
| `RAG_TOP_K` | No | 1 | not specified |
| `RAM_RESERVED_FOR_OS_GB` | No | 2 | multiple defaults (not specified) |
| `RATEHUNTER_DOMAIN` | No | 1 | not specified |
| `RATEHUNTER_PORT` | No | 1 | not specified |
| `RATE_CACHE_KEY_PREFIX` | Yes | 1 | not specified |
| `RATE_CHANGE_THRESHOLD` | No | 1 | not specified |
| `RATE_CHECK_INTERVAL_MINUTES` | No | 1 | not specified |
| `RATE_COMPARISON_API_URL` | No | 3 | multiple defaults (dev) |
| `RATE_LIMIT` | No | 2 | not specified |
| `RATE_LIMITING_ENABLED` | No | 12 | multiple defaults (dev, prod) |
| `RATE_LIMIT_DURATION` | No | 1 | not specified |
| `RATE_LIMIT_ENABLED` | No | 10 | multiple defaults (dev, prod) |
| `RATE_LIMIT_MAX` | No | 10 | multiple defaults (prod) |
| `RATE_LIMIT_MAX_REQUESTS` | No | 15 | multiple defaults (dev, prod) |
| `RATE_LIMIT_POINTS` | No | 1 | not specified |
| `RATE_LIMIT_REQUESTS` | No | 3 | multiple defaults (not specified) |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | No | 3 | multiple defaults (not specified) |
| `RATE_LIMIT_SKIP_SUCCESSFUL` | No | 2 | not specified |
| `RATE_LIMIT_WINDOW` | No | 18 | multiple defaults (dev, prod) |
| `RATE_LIMIT_WINDOW_MINUTES` | No | 1 | not specified |
| `RATE_LIMIT_WINDOW_MS` | No | 9 | multiple defaults (dev) |
| `RATE_LOCK_DURATION_DAYS` | No | 1 | not specified |
| `RATE_PROVIDER_API_KEY` | Yes | 1 | dev |
| `RATE_PROVIDER_API_URL` | No | 1 | not specified |
| `REASONINGBANK_DB_PATH` | No | 6 | multiple defaults (not specified) |
| `REASONINGBANK_ENABLED` | No | 7 | not specified |
| `REASONINGBANK_K` | No | 6 | multiple defaults (not specified) |
| `REASONINGBANK_MIN_CONFIDENCE` | No | 6 | not specified |
| `RECOVERY_CHECK_INTERVAL` | No | 3 | not specified |
| `REDIS_BIND` | No | 1 | not specified |
| `REDIS_CACHE_TTL` | No | 1 | not specified |
| `REDIS_CPU_LIMIT` | No | 1 | not specified |
| `REDIS_DB` | No | 15 | dev, prod |
| `REDIS_ENABLED` | No | 1 | not specified |
| `REDIS_EVICTION_POLICY` | No | 11 | dev |
| `REDIS_HOST` | No | 27 | multiple defaults (dev, prod) |
| `REDIS_INTERNAL_URL` | No | 2 | not specified |
| `REDIS_MAXMEMORY` | No | 5 | multiple defaults (not specified) |
| `REDIS_MAXMEMORY_POLICY` | No | 4 | not specified |
| `REDIS_MAX_CONNECTIONS` | No | 4 | multiple defaults (prod) |
| `REDIS_MAX_MEMORY` | No | 15 | multiple defaults (dev) |
| `REDIS_MEMORY_LIMIT` | No | 3 | multiple defaults (not specified) |
| `REDIS_MIN_CONNECTIONS` | No | 1 | not specified |
| `REDIS_PASSWORD` | Yes | 56 | multiple defaults (dev, prod) |
| `REDIS_PORT` | No | 49 | multiple defaults (dev, prod) |
| `REDIS_TLS` | No | 2 | prod |
| `REDIS_TTL` | No | 4 | multiple defaults (dev, prod) |
| `REDIS_URL` | No | 34 | multiple defaults (dev, prod) |
| `REFRESH_TOKEN_DURATION` | Yes | 1 | not specified |
| `REFRESH_TOKEN_SECRET` | Yes | 2 | multiple defaults (dev, prod) |
| `REGION` | No | 1 | not specified |
| `REGISTER_WITH_GATEWAY` | No | 2 | dev |
| `REPLACE_ME_GITEA_OWNER` | No | 1 | not specified |
| `REPLACE_ME_VPS_HOST` | No | 1 | not specified |
| `REPLACE_ME_VPS_USER` | No | 1 | not specified |
| `REPLICATE_API_KEY` | Yes | 2 | not specified |
| `REQUEST_ID_HEADER` | No | 2 | dev |
| `REQUEST_TIMEOUT` | No | 16 | multiple defaults (prod) |
| `RESEND_API_KEY` | Yes | 2 | not specified |
| `RESEND_ENABLED` | No | 2 | not specified |
| `RESEND_FROM_EMAIL` | No | 2 | not specified |
| `RESPA_TIMELINE_DAYS` | No | 2 | not specified |
| `RETENTION_POLICY_DAYS` | No | 1 | not specified |
| `RETRY_DELAY_MS` | No | 2 | not specified |
| `REVIEW_LABEL` | No | 2 | not specified |
| `REVIEW_MAX_CHARS` | No | 2 | not specified |
| `REVIEW_MODEL` | No | 2 | not specified |
| `REVIEW_POST_AS_REVIEW` | No | 2 | not specified |
| `ROCKET_MORTGAGE_API_KEY` | Yes | 6 | multiple defaults (not specified) |
| `ROCKET_MORTGAGE_API_URL` | No | 3 | not specified |
| `ROCKET_MORTGAGE_BASE_URL` | No | 3 | not specified |
| `ROCKET_MORTGAGE_CLIENT_ID` | No | 3 | not specified |
| `ROCKET_MORTGAGE_CLIENT_SECRET` | Yes | 3 | not specified |
| `ROCKET_MORTGAGE_ENABLED` | No | 2 | not specified |
| `ROCKET_MORTGAGE_ENVIRONMENT` | No | 1 | prod |
| `ROCKET_MORTGAGE_PARTNER_ID` | No | 2 | not specified |
| `ROO_DISABLED` | No | 1 | not specified |
| `ROUND_ROBIN_MODELS` | No | 1 | not specified |
| `ROUTE_REQUESTS_THROUGH_NEXUS` | No | 1 | dev |
| `RTX3090TI_HOST` | No | 1 | not specified |
| `RTX3090TI_LAN_IP` | No | 1 | not specified |
| `RUVECTOR_API_KEY` | Yes | 3 | multiple defaults (not specified) |
| `RUVECTOR_AUTH_ENABLED` | Yes | 1 | not specified |
| `RUVECTOR_AUTH_KEY` | Yes | 2 | not specified |
| `RUVECTOR_AUTO_DISTILL_ENABLED` | No | 1 | not specified |
| `RUVECTOR_BACKUP_DIR` | No | 2 | not specified |
| `RUVECTOR_BACKUP_ENABLED` | No | 5 | not specified |
| `RUVECTOR_BACKUP_INTERVAL` | No | 2 | not specified |
| `RUVECTOR_BACKUP_INTERVAL_SECONDS` | No | 1 | not specified |
| `RUVECTOR_BACKUP_PATH` | No | 1 | not specified |
| `RUVECTOR_BACKUP_RETENTION` | No | 1 | not specified |
| `RUVECTOR_BATCH_SIZE` | No | 5 | not specified |
| `RUVECTOR_BIND` | No | 1 | not specified |
| `RUVECTOR_CACHE_SIZE_MB` | No | 5 | not specified |
| `RUVECTOR_COHERE_API_KEY` | Yes | 1 | not specified |
| `RUVECTOR_COMPRESSION` | No | 3 | not specified |
| `RUVECTOR_COMPRESSION_LEVEL` | No | 2 | not specified |
| `RUVECTOR_CONSENSUS` | No | 2 | not specified |
| `RUVECTOR_CONSENSUS_ENABLED` | No | 3 | not specified |
| `RUVECTOR_CONSENSUS_PEERS` | No | 9 | multiple defaults (dev) |
| `RUVECTOR_CONSENSUS_PROTOCOL` | No | 3 | not specified |
| `RUVECTOR_CONSENSUS_QUORUM` | No | 2 | not specified |
| `RUVECTOR_COORDINATOR` | No | 6 | not specified |
| `RUVECTOR_CORS_ENABLED` | No | 1 | not specified |
| `RUVECTOR_CORS_ORIGINS` | No | 1 | not specified |
| `RUVECTOR_DATABASE_URL` | No | 1 | not specified |
| `RUVECTOR_DATA_DIR` | No | 4 | multiple defaults (not specified) |
| `RUVECTOR_DEBUG` | No | 1 | not specified |
| `RUVECTOR_DEFAULT_LIMIT` | No | 1 | not specified |
| `RUVECTOR_DEV_MODE` | No | 1 | not specified |
| `RUVECTOR_DISTANCE_METRIC` | No | 3 | not specified |
| `RUVECTOR_DISTILLATION_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_EF_CONSTRUCTION` | No | 2 | not specified |
| `RUVECTOR_EF_SEARCH` | No | 2 | not specified |
| `RUVECTOR_EMBEDDING_MODEL` | No | 1 | not specified |
| `RUVECTOR_EMBEDDING_PROVIDER` | No | 1 | not specified |
| `RUVECTOR_ENABLED` | No | 20 | multiple defaults (not specified) |
| `RUVECTOR_ENCRYPTION_ENABLED` | No | 1 | not specified |
| `RUVECTOR_ENCRYPTION_KEY` | Yes | 1 | not specified |
| `RUVECTOR_EWC_ENABLED` | No | 1 | not specified |
| `RUVECTOR_EWC_GAMMA` | No | 1 | not specified |
| `RUVECTOR_EWC_LAMBDA` | No | 1 | not specified |
| `RUVECTOR_FLASH_ATTENTION_BLOCK_SIZE` | No | 1 | not specified |
| `RUVECTOR_FLASH_ATTENTION_ENABLED` | No | 1 | not specified |
| `RUVECTOR_GNN_LAYERS` | No | 2 | not specified |
| `RUVECTOR_GRPC_PORT` | No | 2 | not specified |
| `RUVECTOR_HEALTH_CHECK_ENABLED` | No | 1 | not specified |
| `RUVECTOR_HEALTH_CHECK_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_HNSW_EF_CONSTRUCTION` | No | 3 | not specified |
| `RUVECTOR_HNSW_M` | No | 3 | not specified |
| `RUVECTOR_HOST` | No | 5 | multiple defaults (dev) |
| `RUVECTOR_HTTP_PORT` | No | 3 | multiple defaults (not specified) |
| `RUVECTOR_HYBRID_ALPHA` | No | 1 | not specified |
| `RUVECTOR_HYBRID_SEARCH_ENABLED` | No | 1 | not specified |
| `RUVECTOR_INDEX_EF_CONSTRUCTION` | No | 1 | not specified |
| `RUVECTOR_INDEX_EF_SEARCH` | No | 1 | not specified |
| `RUVECTOR_INDEX_M` | No | 1 | not specified |
| `RUVECTOR_INDEX_METRIC` | No | 1 | not specified |
| `RUVECTOR_INDEX_TYPE` | No | 6 | multiple defaults (not specified) |
| `RUVECTOR_JAEGER_ENDPOINT` | No | 1 | not specified |
| `RUVECTOR_KEEPALIVE_TIMEOUT` | No | 1 | not specified |
| `RUVECTOR_LEADER` | No | 3 | not specified |
| `RUVECTOR_LOCAL_MODEL_PATH` | No | 1 | not specified |
| `RUVECTOR_LOG_DIR` | No | 1 | not specified |
| `RUVECTOR_LOG_FORMAT` | No | 1 | not specified |
| `RUVECTOR_LOG_LEVEL` | No | 1 | not specified |
| `RUVECTOR_M` | No | 2 | not specified |
| `RUVECTOR_MAX_CONNECTIONS` | No | 3 | not specified |
| `RUVECTOR_MAX_LIMIT` | No | 1 | not specified |
| `RUVECTOR_MAX_MEMORY_GB` | No | 2 | not specified |
| `RUVECTOR_MAX_REQUEST_SIZE_MB` | No | 1 | not specified |
| `RUVECTOR_METRICS_ENABLED` | No | 1 | not specified |
| `RUVECTOR_METRICS_PORT` | No | 1 | not specified |
| `RUVECTOR_MIN_SIMILARITY` | No | 1 | not specified |
| `RUVECTOR_MODE` | No | 19 | multiple defaults (not specified) |
| `RUVECTOR_NODE_ID` | No | 1 | not specified |
| `RUVECTOR_OPENAI_API_KEY` | Yes | 1 | not specified |
| `RUVECTOR_PATTERN_NAMESPACE` | No | 1 | not specified |
| `RUVECTOR_PEER_ID` | No | 3 | multiple defaults (not specified) |
| `RUVECTOR_PERSISTENCE_DIR` | No | 2 | not specified |
| `RUVECTOR_PGADMIN_PORT` | No | 7 | dev |
| `RUVECTOR_PG_PASSWORD` | Yes | 1 | not specified |
| `RUVECTOR_PORT` | No | 20 | multiple defaults (dev) |
| `RUVECTOR_POSTGRES_DB` | No | 8 | dev |
| `RUVECTOR_POSTGRES_PASSWORD` | Yes | 12 | multiple defaults (dev) |
| `RUVECTOR_POSTGRES_PORT` | No | 7 | dev |
| `RUVECTOR_POSTGRES_USER` | No | 8 | dev |
| `RUVECTOR_PROFILING_ENABLED` | No | 1 | not specified |
| `RUVECTOR_QDRANT_API_KEY` | Yes | 1 | not specified |
| `RUVECTOR_QDRANT_COLLECTION` | No | 1 | not specified |
| `RUVECTOR_QDRANT_ENABLED` | No | 1 | not specified |
| `RUVECTOR_QDRANT_GRPC_PORT` | No | 1 | not specified |
| `RUVECTOR_QDRANT_HOST` | No | 1 | not specified |
| `RUVECTOR_QDRANT_PORT` | No | 1 | not specified |
| `RUVECTOR_QUANTIZATION` | No | 2 | not specified |
| `RUVECTOR_QUANTIZATION_BITS` | No | 1 | not specified |
| `RUVECTOR_QUANTIZATION_ENABLED` | No | 1 | not specified |
| `RUVECTOR_QUANTIZATION_TYPE` | No | 1 | not specified |
| `RUVECTOR_QUERY_CACHE_ENABLED` | No | 1 | not specified |
| `RUVECTOR_QUERY_CACHE_TTL` | No | 1 | not specified |
| `RUVECTOR_RAFT_ELECTION_TIMEOUT` | No | 1 | not specified |
| `RUVECTOR_RAFT_HEARTBEAT_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_RAFT_SNAPSHOT_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_RANDOM_SEED` | No | 1 | not specified |
| `RUVECTOR_REASONINGBANK_ENABLED` | No | 1 | not specified |
| `RUVECTOR_REDIS_DB` | No | 1 | not specified |
| `RUVECTOR_REDIS_ENABLED` | No | 1 | not specified |
| `RUVECTOR_REDIS_HOST` | No | 1 | not specified |
| `RUVECTOR_REDIS_PASSWORD` | Yes | 1 | not specified |
| `RUVECTOR_REDIS_PORT` | No | 1 | not specified |
| `RUVECTOR_REDIS_PREFIX` | No | 1 | not specified |
| `RUVECTOR_REQUEST_TIMEOUT` | No | 1 | not specified |
| `RUVECTOR_SNAPSHOT_DIR` | No | 1 | not specified |
| `RUVECTOR_SNAPSHOT_ENABLED` | No | 2 | not specified |
| `RUVECTOR_SNAPSHOT_INTERVAL` | No | 3 | not specified |
| `RUVECTOR_SONA_ADAPTATION_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_SONA_ENABLED` | No | 1 | not specified |
| `RUVECTOR_SONA_LEARNING_RATE` | No | 1 | not specified |
| `RUVECTOR_SONA_OPTIMIZATION_TARGET` | No | 1 | not specified |
| `RUVECTOR_STORAGE_PATH` | No | 1 | not specified |
| `RUVECTOR_THREAD_POOL_SIZE` | No | 2 | not specified |
| `RUVECTOR_TLS_CERT_PATH` | Yes | 1 | not specified |
| `RUVECTOR_TLS_ENABLED` | No | 1 | not specified |
| `RUVECTOR_TLS_KEY_PATH` | Yes | 1 | not specified |
| `RUVECTOR_TRACING_ENABLED` | No | 1 | not specified |
| `RUVECTOR_TRAJECTORY_NAMESPACE` | No | 1 | not specified |
| `RUVECTOR_URL` | No | 8 | multiple defaults (dev) |
| `RUVECTOR_VECTOR_DIM` | No | 3 | not specified |
| `RUVECTOR_VECTOR_DIMENSIONS` | No | 3 | not specified |
| `RUVECTOR_WAL_BUFFER_SIZE` | No | 2 | not specified |
| `RUVECTOR_WAL_ENABLED` | No | 4 | not specified |
| `RUVECTOR_WAL_SYNC_INTERVAL` | No | 1 | not specified |
| `RUVECTOR_WORKER_THREADS` | No | 1 | not specified |
| `RUV_FAST_NETWORKING` | No | 2 | not specified |
| `RUV_SWARM_CMD` | No | 1 | not specified |
| `RUV_SWARM_DAA_ENABLED` | No | 2 | not specified |
| `RUV_SWARM_DISTRIBUTED` | No | 2 | not specified |
| `RUV_SWARM_ENABLED` | No | 4 | not specified |
| `RUV_SWARM_ENABLE_SIMD` | No | 1 | not specified |
| `RUV_SWARM_LOG_LEVEL` | No | 1 | not specified |
| `RUV_SWARM_MAX_AGENTS` | No | 4 | not specified |
| `RUV_SWARM_MCP_PORT` | No | 2 | not specified |
| `RUV_SWARM_MEMORY_MODE` | No | 2 | not specified |
| `RUV_SWARM_MODE` | No | 2 | not specified |
| `RUV_SWARM_NEURAL_ENABLED` | No | 2 | not specified |
| `RUV_SWARM_NEURAL_OPTIMIZATION` | No | 2 | not specified |
| `RUV_SWARM_TOPOLOGY` | No | 4 | not specified |
| `RUV_SWARM_WASM_ENABLED` | No | 4 | not specified |
| `S3_ACCESS_KEY` | Yes | 2 | not specified |
| `S3_ACCESS_KEY_ID` | Yes | 2 | not specified |
| `S3_BUCKET` | No | 7 | multiple defaults (dev) |
| `S3_BUCKET_NAME` | No | 1 | not specified |
| `S3_ENABLED` | No | 3 | not specified |
| `S3_ENDPOINT` | No | 5 | multiple defaults (dev) |
| `S3_REGION` | No | 3 | not specified |
| `S3_SECRET_ACCESS_KEY` | Yes | 2 | not specified |
| `S3_SECRET_KEY` | Yes | 2 | not specified |
| `S3_USE_SSL` | No | 1 | not specified |
| `SCORING_ENABLED` | No | 1 | not specified |
| `SCORING_MAX_SCORE` | No | 1 | not specified |
| `SCORING_MIN_SCORE` | No | 1 | not specified |
| `SCRAPER_INTERVAL_MINUTES` | No | 1 | not specified |
| `SCRAPER_TIMEOUT_MS` | No | 1 | not specified |
| `SECONDARY_MODEL` | No | 4 | multiple defaults (not specified) |
| `SECONDARY_MODEL_SIZE` | No | 2 | not specified |
| `SECONDARY_MODEL_VRAM` | No | 2 | not specified |
| `SECONDARY_ORCHESTRATOR` | No | 1 | not specified |
| `SECRETS_PATH` | Yes | 2 | not specified |
| `SECRET_KEY` | Yes | 1 | not specified |
| `SECURITY_SERVICE_PORT` | No | 1 | not specified |
| `SECURITY_SERVICE_URL` | No | 4 | multiple defaults (dev) |
| `SEED_SAMPLE_DATA` | No | 1 | not specified |
| `SEMANTIC_RELEASE_ENABLED` | No | 2 | not specified |
| `SENDGRID_API_KEY` | Yes | 21 | multiple defaults (dev, prod) |
| `SENDGRID_ENABLED` | No | 4 | not specified |
| `SENDGRID_FROM` | No | 4 | multiple defaults (dev, prod) |
| `SENDGRID_FROM_EMAIL` | No | 8 | multiple defaults (not specified) |
| `SENDGRID_FROM_NAME` | No | 5 | multiple defaults (not specified) |
| `SENDGRID_REPLY_TO` | No | 2 | prod |
| `SENDGRID_WEBHOOK_URL` | Yes | 1 | not specified |
| `SENTRY_DEBUG` | No | 5 | multiple defaults (dev, prod) |
| `SENTRY_DSN` | Yes | 10 | multiple defaults (prod) |
| `SENTRY_ENABLED` | No | 10 | multiple defaults (dev, prod) |
| `SENTRY_ENVIRONMENT` | No | 10 | multiple defaults (dev, prod) |
| `SENTRY_SAMPLE_RATE` | No | 4 | dev, prod |
| `SENTRY_TRACES_SAMPLE_RATE` | No | 6 | multiple defaults (prod) |
| `SENTRY_TRACE_SAMPLE_RATE` | No | 2 | not specified |
| `SERENA_API_KEY` | Yes | 1 | not specified |
| `SERENA_DISABLED` | No | 1 | not specified |
| `SERENA_MCP_PORT` | No | 3 | multiple defaults (dev) |
| `SERENA_MCP_URL` | No | 3 | multiple defaults (dev) |
| `SERENA_PORT` | No | 1 | dev |
| `SERENA_REPO_PATH` | No | 2 | multiple defaults (not specified) |
| `SERENA_URL` | No | 1 | dev |
| `SERVER_URL` | No | 4 | multiple defaults (dev) |
| `SERVICES` | No | 2 | not specified |
| `SERVICE_DISCOVERY_ENABLED` | No | 1 | not specified |
| `SERVICE_KEY` | Yes | 1 | not specified |
| `SERVICE_NAME` | No | 2 | multiple defaults (dev) |
| `SERVICE_REGISTRY_URL` | No | 4 | not specified |
| `SESSION_DURATION` | No | 1 | not specified |
| `SESSION_HTTP_ONLY` | No | 4 | dev, prod |
| `SESSION_MAX_AGE` | No | 3 | dev |
| `SESSION_SAME_SITE` | No | 4 | multiple defaults (dev, prod) |
| `SESSION_SECRET` | Yes | 21 | multiple defaults (dev, prod) |
| `SESSION_SECURE` | No | 7 | multiple defaults (dev, prod) |
| `SESSION_SERVICE_URL` | No | 1 | dev |
| `SESSION_TIMEOUT` | No | 7 | multiple defaults (dev, prod) |
| `SHADCN_REGISTRY_URL` | No | 1 | not specified |
| `SHARED_SCHEMA_VERSION` | No | 1 | not specified |
| `SIGN_IN_PREFILLED` | No | 4 | multiple defaults (dev) |
| `SIMPLE_GH_TOKEN` | Yes | 1 | not specified |
| `SITE_URL` | No | 1 | dev |
| `SLACK_ENABLED` | No | 2 | prod |
| `SLACK_WEBHOOK_APPLICATION` | Yes | 1 | not specified |
| `SLACK_WEBHOOK_CRITICAL` | Yes | 1 | not specified |
| `SLACK_WEBHOOK_DATABASE` | Yes | 1 | not specified |
| `SLACK_WEBHOOK_INFRASTRUCTURE` | Yes | 1 | not specified |
| `SLACK_WEBHOOK_URL` | Yes | 9 | multiple defaults (prod) |
| `SLACK_WEBHOOK_WARNINGS` | Yes | 1 | not specified |
| `SLIDING_WINDOW_SIZE` | No | 1 | not specified |
| `SMTP_ADMIN_EMAIL` | No | 1 | not specified |
| `SMTP_AUTH_PASSWORD` | Yes | 1 | not specified |
| `SMTP_AUTH_USERNAME` | Yes | 1 | not specified |
| `SMTP_FROM` | No | 3 | multiple defaults (dev) |
| `SMTP_FROM_EMAIL` | No | 3 | not specified |
| `SMTP_FROM_NAME` | No | 2 | not specified |
| `SMTP_HOST` | No | 15 | multiple defaults (not specified) |
| `SMTP_PASS` | Yes | 6 | not specified |
| `SMTP_PASSWORD` | Yes | 9 | multiple defaults (not specified) |
| `SMTP_PORT` | No | 15 | not specified |
| `SMTP_SECURE` | No | 2 | not specified |
| `SMTP_SMARTHOST` | No | 1 | not specified |
| `SMTP_USER` | No | 15 | multiple defaults (not specified) |
| `SONA_ADAPTATION_TIME` | No | 1 | not specified |
| `SONA_ENABLED` | No | 3 | not specified |
| `SONA_LEARNING_RATE` | No | 1 | not specified |
| `SONA_MODE` | No | 1 | not specified |
| `SOURCE_MAPS` | No | 2 | not specified |
| `SPARC2_DISABLED` | No | 1 | not specified |
| `SPARC_DISABLED` | No | 1 | not specified |
| `SPECIALIZATION` | No | 2 | not specified |
| `SPECULATIVE_TOKENS` | Yes | 1 | not specified |
| `SSH_ALIAS` | No | 1 | not specified |
| `SSL_CERT_PATH` | Yes | 2 | multiple defaults (not specified) |
| `SSL_ENABLED` | No | 3 | multiple defaults (not specified) |
| `SSL_KEY_PATH` | Yes | 2 | multiple defaults (not specified) |
| `SSL_VERIFY_PEER` | No | 1 | not specified |
| `STATE_COMPLIANCE_ENABLED` | No | 1 | not specified |
| `STATIC_CACHE_MAX_AGE` | No | 4 | multiple defaults (dev, prod) |
| `STATIC_IP` | No | 1 | not specified |
| `STOP_ENFORCEMENT_ENABLED` | No | 1 | not specified |
| `STORAGE_LOCAL_PATH` | No | 3 | dev |
| `STORAGE_TYPE` | No | 8 | multiple defaults (dev, prod) |
| `STRIPE_PUBLIC_KEY` | Yes | 4 | multiple defaults (dev, prod) |
| `STRIPE_SECRET_KEY` | Yes | 4 | multiple defaults (dev, prod) |
| `STRIPE_WEBHOOK_SECRET` | Yes | 4 | multiple defaults (dev, prod) |
| `SUBDOMAIN_ADMIN` | No | 2 | not specified |
| `SUBDOMAIN_API` | No | 2 | not specified |
| `SUBDOMAIN_NYRA` | No | 2 | not specified |
| `SUPABASE_ACCESS_TOKEN` | Yes | 1 | not specified |
| `SUPABASE_ANON_KEY` | Yes | 7 | multiple defaults (not specified) |
| `SUPABASE_CLIENT_SERVICE_KEY` | Yes | 1 | not specified |
| `SUPABASE_JWT_SECRET` | Yes | 1 | not specified |
| `SUPABASE_PROJECT_ID` | No | 1 | not specified |
| `SUPABASE_REFRESH_TOKEN` | Yes | 1 | not specified |
| `SUPABASE_SERVICE_KEY` | Yes | 10 | multiple defaults (not specified) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | 3 | not specified |
| `SUPABASE_URL` | No | 13 | multiple defaults (not specified) |
| `SUPPORT_CHAT_ENABLED` | No | 3 | dev |
| `SWAGGER_ENABLED` | No | 2 | dev |
| `SWAGGER_PATH` | No | 2 | dev |
| `SWAP_ENABLED` | No | 3 | multiple defaults (not specified) |
| `SWAP_SIZE_GB` | No | 2 | multiple defaults (not specified) |
| `SWARM_AUTO_SCALE` | No | 3 | not specified |
| `SWARM_COORDINATION_MODE` | No | 1 | not specified |
| `SWARM_COORDINATION_PROTOCOL` | No | 4 | not specified |
| `SWARM_COORDINATOR_URL` | No | 6 | not specified |
| `SWARM_MAX_AGENTS` | No | 4 | multiple defaults (not specified) |
| `SWARM_MAX_CONCURRENT_TASKS` | No | 1 | not specified |
| `SWARM_MEMORY_SHARED` | No | 3 | not specified |
| `SWARM_NEURAL_SYNC` | No | 3 | not specified |
| `SWARM_ROLE` | No | 7 | multiple defaults (not specified) |
| `SWARM_STRATEGY` | No | 1 | not specified |
| `SWARM_TOPOLOGY` | No | 9 | multiple defaults (not specified) |
| `SWARM_WORKERS` | No | 1 | not specified |
| `SWARM_WORKER_ID` | No | 6 | multiple defaults (not specified) |
| `SWARM_WORKER_PORT` | No | 6 | not specified |
| `SYNC_BATCH_SIZE` | No | 2 | not specified |
| `SYNC_INTERVAL` | No | 1 | not specified |
| `SYNC_INTERVAL_MINUTES` | No | 2 | not specified |
| `SYSTEM_MONITORING` | No | 3 | not specified |
| `TAILSCALE_ADVERTISE_ROUTES` | No | 3 | not specified |
| `TAILSCALE_AUTHKEY` | Yes | 8 | multiple defaults (not specified) |
| `TAILSCALE_AUTH_KEY` | Yes | 6 | multiple defaults (not specified) |
| `TAILSCALE_DOMAIN` | No | 3 | not specified |
| `TAILSCALE_ENABLED` | No | 12 | multiple defaults (prod) |
| `TAILSCALE_FQDN` | No | 4 | multiple defaults (not specified) |
| `TAILSCALE_HOSTNAME` | No | 20 | multiple defaults (not specified) |
| `TAILSCALE_IP` | No | 26 | multiple defaults (not specified) |
| `TAILSCALE_KEY` | Yes | 6 | multiple defaults (not specified) |
| `TAILSCALE_TAGS` | No | 2 | not specified |
| `TASK_QUEUE_PATH` | No | 1 | not specified |
| `TASK_TIMEOUT_MS` | No | 1 | not specified |
| `TAVILY_API_KEY` | Yes | 2 | not specified |
| `TELEGRAM_BOT_TOKEN` | Yes | 2 | not specified |
| `TELEMETRY_ENABLED` | No | 4 | dev |
| `TEMPLATES_PATH` | No | 1 | not specified |
| `TENANT_ENGINEERING_KEY` | Yes | 1 | not specified |
| `TENANT_PRODUCTION_KEY` | Yes | 1 | prod |
| `TENANT_RESEARCH_KEY` | Yes | 1 | not specified |
| `TENSORBOARD_ENABLED` | No | 1 | not specified |
| `TENSORBOARD_PORT` | No | 1 | not specified |
| `TENSORRT_LLM_ENABLED` | No | 1 | not specified |
| `TENSORRT_LLM_PORT` | No | 1 | not specified |
| `TERTIARY_MODEL` | No | 2 | not specified |
| `TEST_CONTAINER_NAME` | No | 2 | not specified |
| `TEST_DATABASE_URL` | No | 3 | dev |
| `TEST_ENVIRONMENT` | No | 2 | dev |
| `TEST_MCP_PORT` | No | 2 | not specified |
| `TEST_MODE` | No | 3 | not specified |
| `TEST_PROJECT_ID` | No | 2 | not specified |
| `TEST_REDIS_URL` | No | 2 | dev |
| `TEST_REPORT_PATH` | No | 3 | not specified |
| `TEST_SECRET_ID` | Yes | 2 | not specified |
| `TEST_TIMEOUT` | No | 5 | not specified |
| `THROTTLE_LIMIT` | No | 1 | not specified |
| `THROTTLE_TTL` | No | 1 | not specified |
| `THUMBNAIL_QUALITY` | No | 1 | not specified |
| `THUMBNAIL_SIZE` | No | 1 | not specified |
| `TILA_DISCLOSURE_DAYS` | No | 2 | not specified |
| `TIMEOUT_MS` | No | 2 | not specified |
| `TIMEZONE` | No | 5 | not specified |
| `TLS_CERT_PATH` | Yes | 7 | multiple defaults (prod) |
| `TLS_ENABLED` | No | 4 | multiple defaults (prod) |
| `TLS_KEY_PATH` | Yes | 7 | multiple defaults (prod) |
| `TORCH_BACKENDS_CUDNN_ENABLED` | No | 1 | not specified |
| `TORCH_DISTRIBUTED_DEBUG` | No | 1 | not specified |
| `TP_SIZE` | No | 4 | not specified |
| `TRACING_ENABLED` | No | 1 | not specified |
| `TRACK_INFERENCE_TIME` | No | 2 | not specified |
| `TRACK_MODEL_LOADING_TIME` | No | 2 | not specified |
| `TRACK_QUEUE_DEPTH` | No | 2 | not specified |
| `TRAJECTORY_TRACKING` | No | 1 | not specified |
| `TRANSUNION_API_KEY` | Yes | 2 | not specified |
| `TRID_API_KEY` | Yes | 1 | not specified |
| `TRID_CLOSING_DISCLOSURE_DAYS` | No | 1 | not specified |
| `TRID_DISCLOSURE_ENABLED` | No | 1 | not specified |
| `TRID_ENABLED` | No | 2 | prod |
| `TRID_LOAN_ESTIMATE_DAYS` | No | 1 | not specified |
| `TURBO_TELEMETRY_DISABLED` | No | 3 | not specified |
| `TWEAKCN_PRESET` | No | 1 | not specified |
| `TWENTYCRM_API_KEY` | Yes | 13 | multiple defaults (dev) |
| `TWENTYCRM_API_URL` | No | 2 | not specified |
| `TWENTYCRM_DATABASE_URL` | No | 1 | not specified |
| `TWENTYCRM_DB_URL` | No | 1 | dev |
| `TWENTYCRM_ENABLED` | No | 1 | not specified |
| `TWENTYCRM_HOST` | No | 1 | not specified |
| `TWENTYCRM_JWT_SECRET` | Yes | 1 | not specified |
| `TWENTYCRM_LOG_LEVEL` | No | 1 | not specified |
| `TWENTYCRM_MCP_PORT` | No | 10 | dev |
| `TWENTYCRM_PORT` | No | 10 | multiple defaults (dev) |
| `TWENTYCRM_REDIS_URL` | No | 1 | not specified |
| `TWENTYCRM_URL` | No | 3 | multiple defaults (dev) |
| `TWENTYCRM_WEBHOOK_SECRET` | Yes | 2 | not specified |
| `TWENTYCRM_WORKSPACE_ID` | No | 1 | not specified |
| `TWENTY_ACCESS_TOKEN_SECRET` | Yes | 11 | multiple defaults (not specified) |
| `TWENTY_API_KEY` | Yes | 4 | multiple defaults (not specified) |
| `TWENTY_API_URL` | No | 1 | not specified |
| `TWENTY_APP_SECRET` | Yes | 3 | multiple defaults (not specified) |
| `TWENTY_BASE_URL` | No | 1 | not specified |
| `TWENTY_CRM_API_KEY` | Yes | 7 | multiple defaults (not specified) |
| `TWENTY_CRM_API_URL` | No | 1 | not specified |
| `TWENTY_CRM_BIND` | No | 1 | not specified |
| `TWENTY_CRM_DATABASE_URL` | No | 2 | dev |
| `TWENTY_CRM_ENABLED` | No | 2 | not specified |
| `TWENTY_CRM_JWT_SECRET` | Yes | 2 | not specified |
| `TWENTY_CRM_PORT` | No | 3 | multiple defaults (not specified) |
| `TWENTY_CRM_POSTGRES_DB` | No | 2 | not specified |
| `TWENTY_CRM_POSTGRES_HOST` | No | 2 | dev |
| `TWENTY_CRM_POSTGRES_PASSWORD` | Yes | 2 | not specified |
| `TWENTY_CRM_POSTGRES_PORT` | No | 2 | not specified |
| `TWENTY_CRM_POSTGRES_USER` | No | 2 | not specified |
| `TWENTY_CRM_SECRET_KEY` | Yes | 3 | multiple defaults (not specified) |
| `TWENTY_CRM_SYNC_ENABLED` | No | 1 | not specified |
| `TWENTY_CRM_SYNC_INTERVAL` | No | 1 | not specified |
| `TWENTY_CRM_URL` | No | 6 | multiple defaults (dev) |
| `TWENTY_CRM_WORKSPACE_ID` | No | 4 | multiple defaults (not specified) |
| `TWENTY_DATABASE_URL` | No | 3 | dev |
| `TWENTY_DB` | No | 3 | not specified |
| `TWENTY_DB_HOST` | No | 2 | not specified |
| `TWENTY_DB_NAME` | No | 8 | multiple defaults (dev) |
| `TWENTY_DB_PASSWORD` | Yes | 4 | multiple defaults (not specified) |
| `TWENTY_DB_PORT` | No | 2 | multiple defaults (not specified) |
| `TWENTY_DB_USER` | No | 2 | not specified |
| `TWENTY_ENABLED` | No | 2 | not specified |
| `TWENTY_ENCRYPTION_SECRET` | Yes | 16 | multiple defaults (dev) |
| `TWENTY_FILE_TOKEN_SECRET` | Yes | 8 | multiple defaults (not specified) |
| `TWENTY_FRONTEND_URL` | No | 2 | multiple defaults (not specified) |
| `TWENTY_FRONT_BASE_URL` | No | 6 | multiple defaults (dev) |
| `TWENTY_HOST` | No | 1 | not specified |
| `TWENTY_JWT_SECRET` | Yes | 16 | multiple defaults (dev) |
| `TWENTY_LOGIN_TOKEN_SECRET` | Yes | 11 | multiple defaults (not specified) |
| `TWENTY_PASSWORD_SALT` | Yes | 16 | multiple defaults (dev) |
| `TWENTY_PG_DATABASE_URL` | No | 2 | not specified |
| `TWENTY_PG_PASSWORD` | Yes | 1 | not specified |
| `TWENTY_PORT` | No | 9 | multiple defaults (not specified) |
| `TWENTY_POSTGRES_DB` | No | 7 | dev |
| `TWENTY_POSTGRES_PASSWORD` | Yes | 12 | multiple defaults (dev) |
| `TWENTY_POSTGRES_PORT` | No | 3 | multiple defaults (not specified) |
| `TWENTY_POSTGRES_USER` | No | 7 | dev |
| `TWENTY_PUBLIC_BASE_URL` | No | 1 | not specified |
| `TWENTY_REDIS_HOST` | No | 1 | not specified |
| `TWENTY_REDIS_PASSWORD` | Yes | 3 | multiple defaults (not specified) |
| `TWENTY_REDIS_PORT` | No | 1 | not specified |
| `TWENTY_REDIS_URL` | No | 2 | not specified |
| `TWENTY_REFRESH_TOKEN_SECRET` | Yes | 11 | multiple defaults (not specified) |
| `TWENTY_SERVER_URL` | No | 13 | multiple defaults (dev) |
| `TWENTY_TAG` | No | 1 | not specified |
| `TWENTY_URL` | No | 2 | dev |
| `TWENTY_WEBHOOK_SECRET` | Yes | 1 | not specified |
| `TWENTY_WORKSPACE_ID` | No | 3 | multiple defaults (not specified) |
| `TWILIO_ACCOUNT_SID` | No | 26 | multiple defaults (dev, prod) |
| `TWILIO_AUTH_TOKEN` | Yes | 26 | multiple defaults (dev, prod) |
| `TWILIO_ENABLED` | No | 4 | not specified |
| `TWILIO_FROM_NUMBER` | No | 4 | not specified |
| `TWILIO_MESSAGING_SERVICE_SID` | No | 5 | multiple defaults (not specified) |
| `TWILIO_PHONE_NUMBER` | No | 20 | multiple defaults (dev, prod) |
| `TWILIO_SMS_WEBHOOK_URL` | Yes | 1 | not specified |
| `TWILIO_VERIFY_SID` | No | 1 | not specified |
| `TWILIO_VOICE_WEBHOOK_URL` | Yes | 1 | not specified |
| `TZ` | No | 4 | multiple defaults (not specified) |
| `UFW_ENABLED` | No | 1 | not specified |
| `UNHEALTHY_THRESHOLD` | No | 2 | not specified |
| `UNMUTE_HOST_PORT` | No | 2 | not specified |
| `UNMUTE_IMAGE` | No | 2 | not specified |
| `UNMUTE_MODEL_PROVIDER` | No | 2 | not specified |
| `UNMUTE_OPENAI_API_KEY` | Yes | 2 | not specified |
| `UNMUTE_PUBLIC_BASE_URL` | No | 2 | dev |
| `UPLOAD_DIR` | No | 5 | multiple defaults (dev, prod) |
| `USE_GEMINI` | No | 1 | not specified |
| `USE_NEXUS_ROUTER` | No | 4 | not specified |
| `USE_ONNX` | No | 6 | multiple defaults (not specified) |
| `USE_OPENROUTER` | No | 5 | not specified |
| `VECTOR_COLLECTION` | No | 1 | dev |
| `VECTOR_DB_COLLECTION` | No | 1 | not specified |
| `VECTOR_DB_HOST` | No | 1 | not specified |
| `VECTOR_DB_PORT` | No | 1 | not specified |
| `VERBOSE` | No | 1 | not specified |
| `VERBOSE_GPU_LOGGING` | No | 3 | not specified |
| `VERBOSE_LOGGING` | No | 6 | multiple defaults (not specified) |
| `VERBOSE_VLLM_LOGGING` | No | 2 | not specified |
| `VERDICT_JUDGMENT` | No | 1 | not specified |
| `VERSION` | No | 2 | multiple defaults (not specified) |
| `VITE_ALLOWED_HOSTS` | No | 1 | dev |
| `VITE_API_BASE` | No | 1 | not specified |
| `VITE_CLAUDE_FLOW_URL` | No | 4 | multiple defaults (dev) |
| `VITE_ENABLE_AGENT_MONITOR` | No | 3 | not specified |
| `VITE_ENABLE_MEMORY_OPS` | No | 3 | not specified |
| `VITE_ENABLE_METRICS` | No | 3 | not specified |
| `VITE_ENABLE_TASK_TIMELINE` | No | 3 | not specified |
| `VITE_ENABLE_TOPOLOGY` | No | 3 | not specified |
| `VITE_EVENT_SERVER_HTTP_URL` | No | 5 | multiple defaults (dev) |
| `VITE_EVENT_SERVER_URL` | No | 5 | multiple defaults (dev) |
| `VITE_MAX_BUFFER_SIZE` | No | 3 | not specified |
| `VITE_SHOW_DEVTOOLS` | No | 2 | multiple defaults (not specified) |
| `VITE_WEBSOCKET_RECONNECT_INTERVAL` | No | 3 | not specified |
| `VLLM_5090_URL` | No | 5 | multiple defaults (dev) |
| `VLLM_BIND` | No | 2 | not specified |
| `VLLM_DISABLE_LOG_REQUESTS` | No | 2 | not specified |
| `VLLM_DISABLE_LOG_STATS` | No | 2 | not specified |
| `VLLM_ENABLED` | No | 2 | not specified |
| `VLLM_ENABLE_CHUNKED_PREFILL` | No | 2 | not specified |
| `VLLM_ENABLE_LOGPROBS` | No | 2 | not specified |
| `VLLM_ENABLE_PREFIX_CACHING` | No | 2 | not specified |
| `VLLM_ENFORCE_EAGER_EXECUTION` | No | 2 | not specified |
| `VLLM_GPU_MEMORY` | No | 1 | not specified |
| `VLLM_GPU_MEMORY_UTILIZATION` | No | 6 | multiple defaults (not specified) |
| `VLLM_HOST` | No | 6 | not specified |
| `VLLM_KV_CACHE_DTYPE` | No | 2 | not specified |
| `VLLM_LOGPROBS_SOFT_CAP` | No | 2 | not specified |
| `VLLM_MAX_MODEL_LEN` | No | 7 | multiple defaults (not specified) |
| `VLLM_MAX_NUM_BATCHED_TOKENS` | Yes | 2 | not specified |
| `VLLM_MODEL` | No | 9 | multiple defaults (not specified) |
| `VLLM_MODELS` | No | 2 | multiple defaults (not specified) |
| `VLLM_PIPELINE_PARALLEL_SIZE` | No | 2 | not specified |
| `VLLM_PORT` | No | 14 | multiple defaults (not specified) |
| `VLLM_REQUEST_TIMEOUT` | No | 2 | multiple defaults (not specified) |
| `VLLM_TENSOR_PARALLEL` | No | 1 | not specified |
| `VLLM_TENSOR_PARALLEL_SIZE` | No | 6 | not specified |
| `VOLTA_VERSION` | No | 3 | not specified |
| `VRAM_GB` | No | 4 | multiple defaults (not specified) |
| `VRAM_RESERVED_FOR_SYSTEM_GB` | No | 2 | multiple defaults (not specified) |
| `WAN_IP` | No | 12 | not specified |
| `WEBAPP_PORT` | No | 1 | dev |
| `WEBAPP_URL` | No | 3 | multiple defaults (dev) |
| `WEBHOOK_ALLOWED_ORIGINS` | Yes | 1 | not specified |
| `WEBHOOK_BASE_URL` | Yes | 1 | not specified |
| `WEBHOOK_MEMORY_LIMIT` | Yes | 1 | not specified |
| `WEBHOOK_PORT` | Yes | 1 | not specified |
| `WEBHOOK_RETRY_ATTEMPTS` | Yes | 1 | not specified |
| `WEBHOOK_RETRY_DELAY` | Yes | 1 | not specified |
| `WEBHOOK_SECRET_CLERK` | Yes | 1 | not specified |
| `WEBHOOK_SECRET_FREERATEUPDATE` | Yes | 1 | not specified |
| `WEBHOOK_SECRET_LENDINGTREE` | Yes | 1 | not specified |
| `WEBHOOK_SECRET_SENDGRID` | Yes | 1 | not specified |
| `WEBHOOK_SECRET_TWILIO` | Yes | 1 | not specified |
| `WEBHOOK_SECURITY_ENABLED` | Yes | 1 | not specified |
| `WEBHOOK_TIMEOUT` | Yes | 1 | not specified |
| `WEBHOOK_TUNNEL_URL` | Yes | 1 | not specified |
| `WEBHOOK_URL` | Yes | 10 | multiple defaults (dev) |
| `WEBUI_AUTH` | Yes | 1 | not specified |
| `WEBUI_SECRET_KEY` | Yes | 1 | not specified |
| `WHATSAPP_PHONE_NUMBER` | No | 1 | not specified |
| `WORKER1_IP` | No | 1 | dev |
| `WORKER1_LLM_API_KEY` | Yes | 2 | not specified |
| `WORKER1_LLM_BASE_URL` | No | 2 | not specified |
| `WORKER2_IP` | No | 1 | dev |
| `WORKER2_LLM_API_KEY` | Yes | 2 | not specified |
| `WORKER2_LLM_BASE_URL` | No | 2 | not specified |
| `WORKER3_IP` | No | 1 | dev |
| `WORKER3_LLM_API_KEY` | Yes | 2 | not specified |
| `WORKER3_LLM_BASE_URL` | No | 2 | not specified |
| `WORKER_1_HOST` | No | 1 | not specified |
| `WORKER_1_IP` | No | 1 | not specified |
| `WORKER_1_ROLE` | No | 1 | not specified |
| `WORKER_2_HOST` | No | 1 | not specified |
| `WORKER_2_IP` | No | 1 | not specified |
| `WORKER_2_ROLE` | No | 1 | not specified |
| `WORKER_3060_API_KEY` | Yes | 1 | not specified |
| `WORKER_3060_MAX_CONCURRENT` | No | 1 | not specified |
| `WORKER_3060_MODELS` | No | 9 | multiple defaults (dev) |
| `WORKER_3060_OLLAMA_PORT` | No | 7 | dev |
| `WORKER_3060_PRIMARY_USE` | No | 3 | multiple defaults (not specified) |
| `WORKER_3060_PRIORITY` | No | 1 | not specified |
| `WORKER_3060_SPECIALIZATION` | No | 3 | not specified |
| `WORKER_3060_URL` | No | 10 | multiple defaults (dev) |
| `WORKER_3090TI_MODEL` | No | 7 | dev |
| `WORKER_3090TI_VLLM_PORT` | No | 7 | dev |
| `WORKER_3090_API_KEY` | Yes | 1 | not specified |
| `WORKER_3090_MAX_CONCURRENT` | No | 1 | not specified |
| `WORKER_3090_MODELS` | No | 7 | multiple defaults (dev) |
| `WORKER_3090_PRIMARY_USE` | No | 3 | not specified |
| `WORKER_3090_PRIORITY` | No | 1 | not specified |
| `WORKER_3090_SPECIALIZATION` | No | 1 | not specified |
| `WORKER_3090_URL` | No | 8 | multiple defaults (dev) |
| `WORKER_3_HOST` | No | 1 | not specified |
| `WORKER_3_IP` | No | 1 | not specified |
| `WORKER_3_ROLE` | No | 1 | not specified |
| `WORKER_5090_API_KEY` | Yes | 1 | not specified |
| `WORKER_5090_MAX_CONCURRENT` | No | 1 | not specified |
| `WORKER_5090_MODEL` | No | 7 | dev |
| `WORKER_5090_MODELS` | No | 7 | multiple defaults (dev) |
| `WORKER_5090_PRIMARY_USE` | No | 3 | not specified |
| `WORKER_5090_PRIORITY` | No | 1 | not specified |
| `WORKER_5090_SPECIALIZATION` | No | 1 | not specified |
| `WORKER_5090_URL` | No | 8 | multiple defaults (dev) |
| `WORKER_5090_VLLM_PORT` | No | 7 | dev |
| `WORKER_API_KEY` | Yes | 2 | not specified |
| `WORKER_API_PORT` | No | 1 | not specified |
| `WORKER_CAPABILITIES` | No | 6 | multiple defaults (not specified) |
| `WORKER_CONCURRENCY` | No | 1 | not specified |
| `WORKER_CONNECTIONS` | No | 1 | not specified |
| `WORKER_GPU` | No | 1 | dev |
| `WORKER_ID` | No | 7 | multiple defaults (not specified) |
| `WORKER_IP` | No | 1 | dev |
| `WORKER_METRICS_PORT` | No | 1 | not specified |
| `WORKER_NAME` | No | 9 | multiple defaults (not specified) |
| `WORKER_PROCESSES` | No | 1 | not specified |
| `WORKER_ROLE` | No | 4 | multiple defaults (not specified) |
| `WORKER_RTX3060_DEV_UI_PORT` | No | 1 | not specified |
| `WORKER_RTX3060_GPU_MONITOR_PORT` | No | 1 | not specified |
| `WORKER_RTX3060_JUPYTER_PORT` | No | 1 | not specified |
| `WORKER_RTX3060_MLFLOW_PORT` | No | 1 | not specified |
| `WORKER_RTX3060_OPENAI_BASE_URL` | No | 1 | not specified |
| `WORKER_RTX3060_VSCODE_PORT` | No | 1 | not specified |
| `WORKER_RTX3090TI_OPENAI_BASE_URL` | No | 1 | not specified |
| `WORKER_RTX3090_DEV_UI_PORT` | No | 1 | not specified |
| `WORKER_RTX3090_GPU_MONITOR_PORT` | No | 1 | not specified |
| `WORKER_RTX3090_JUPYTER_PORT` | No | 1 | not specified |
| `WORKER_RTX3090_MLFLOW_PORT` | No | 1 | not specified |
| `WORKER_RTX3090_VSCODE_PORT` | No | 1 | not specified |
| `WORKER_RTX5090_DEV_UI_PORT` | No | 1 | not specified |
| `WORKER_RTX5090_GPU_MONITOR_PORT` | No | 1 | not specified |
| `WORKER_RTX5090_JUPYTER_PORT` | No | 1 | not specified |
| `WORKER_RTX5090_MLFLOW_PORT` | No | 1 | not specified |
| `WORKER_RTX5090_OPENAI_BASE_URL` | No | 1 | not specified |
| `WORKER_RTX5090_VSCODE_PORT` | No | 1 | not specified |
| `WORKER_SPECIALIZATION` | No | 8 | multiple defaults (not specified) |
| `WORKER_THREADS` | No | 6 | multiple defaults (not specified) |
| `WORKER_TYPE` | No | 4 | not specified |
| `WORKFLOW_STORAGE_PATH` | No | 1 | not specified |
| `WORKSPACE_PATH` | No | 2 | not specified |
| `WORKSPACE_ROOT` | No | 1 | dev |
| `XENOVA_API_URL` | No | 1 | not specified |
| `XENOVA_BATCH_SIZE` | No | 1 | not specified |
| `XENOVA_MODEL` | No | 1 | not specified |
| `ZEP_API_KEY` | Yes | 1 | not specified |
| `ZEP_EMBEDDING_MODEL` | No | 1 | not specified |
| `ZEP_GRAPH_NAME` | No | 1 | not specified |
| `ZEP_MCP_PORT` | No | 1 | not specified |
| `ZOHO_MCP_URL` | No | 1 | not specified |

## Host-specific secret/env lists

### orchestrator
- `ACCESS_TOKEN_SECRET` (secret)
- `ACTIVEPIECES_API_KEY` (secret)
- `ACTIVEPIECES_BASE_URL`
- `ACTIVEPIECES_DB`
- `ACTIVEPIECES_DB_URL`
- `ACTIVEPIECES_ENABLED`
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_HOST`
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `ACTIVEPIECES_POSTGRES_DATABASE`
- `ACTIVEPIECES_POSTGRES_DB`
- `ACTIVEPIECES_POSTGRES_HOST`
- `ACTIVEPIECES_POSTGRES_PASSWORD` (secret)
- `ACTIVEPIECES_POSTGRES_PORT`
- `ACTIVEPIECES_POSTGRES_USER`
- `ACTIVEPIECES_PUBLIC_BASE_URL`
- `ACTIVEPIECES_REDIS_DB`
- `ACTIVEPIECES_REDIS_HOST`
- `ACTIVEPIECES_REDIS_PORT`
- `ACTIVEPIECES_SECRET_KEY` (secret)
- `ACTIVEPIECES_URL`
- `ACTIVEPIECES_WEBHOOK_URL` (secret)
- `ADMINER_PORT`
- `ADMIN_API_KEY` (secret)
- `ADMIN_DASHBOARD_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (secret)
- `AGENTDB_AUTO_MIGRATE`
- `AGENTDB_CACHE_ENABLED`
- `AGENTDB_CACHE_SIZE`
- `AGENTDB_ENABLED`
- `AGENTDB_FALLBACK_LEGACY`
- `AGENTDB_HNSW_EF`
- `AGENTDB_HNSW_EF_SEARCH`
- `AGENTDB_HNSW_M`
- `AGENTDB_LEARNING`
- `AGENTDB_LEARNING_ALGORITHM`
- `AGENTDB_PATH`
- `AGENTDB_PORT`
- `AGENTDB_QUANTIZATION`
- `AGENTDB_QUIC_PEERS`
- `AGENTDB_QUIC_PORT`
- `AGENTDB_QUIC_SYNC`
- `AGENTDB_READ_ONLY`
- `AGENTDB_REASONING`
- `AGENTDB_SYNC_FROM`
- `AGENTDB_URL`
- `AGENTDB_VECTOR_ENABLED`
- `AGENTIC_FLOW_API_KEY` (secret)
- `AGENTIC_FLOW_AUTH` (secret)
- `AGENTIC_FLOW_CACHE_TTL`
- `AGENTIC_FLOW_JWT_SECRET` (secret)
- `AGENTIC_FLOW_LOG_LEVEL`
- `AGENTIC_FLOW_MAX_AGENTS`
- `AGENTIC_FLOW_MCP_PORT`
- `AGENTIC_FLOW_MEMORY_ENABLED`
- `AGENTIC_FLOW_PORT`
- `AGENTIC_FLOW_PROMETHEUS_PORT`
- `AGENTIC_FLOW_TELEMETRY`
- `AGENTIC_FLOW_TOPOLOGY`
- `AGENTIC_FLOW_TRAINING`
- `AGENTS_CUSTOM_PATHS`
- `AGENTS_DIR`
- `AGENT_BOOSTER_ENABLED`
- `AGENT_CHECKPOINT_INTERVAL`
- `AGENT_MAX_RETRIES`
- `AGENT_STORAGE_PATH`
- `AGENT_TIMEOUT`
- `AGENT_WORK_ORDERS_PORT`
- `AGGRESSIVE_MEMORY_CLEANUP`
- `AIDEFENCE_BLOCK_SUSPICIOUS`
- `AIDEFENCE_ENABLED`
- `AIDEFENCE_MONITOR_INPUTS`
- `AIDEFENCE_MONITOR_OUTPUTS`
- `AI_REVIEW_MODEL`
- `ALERTMANAGER_HOST`
- `ALERTMANAGER_PORT`
- `ALERTMANAGER_URL`
- `ALERT_CHECK_INTERVAL_MINUTES`
- `ALERT_CPU_USAGE`
- `ALERT_EMAIL`
- `ALERT_EMAIL_ENABLED`
- `ALERT_EMAIL_TO`
- `ALERT_ERROR_RATE`
- `ALERT_GPU_POWER_THRESHOLD_W`
- `ALERT_GPU_TEMP_THRESHOLD_C`
- `ALERT_MANAGER_ENABLED`
- `ALERT_MEMORY_USAGE`
- `ALERT_QUEUE_DEPTH_THRESHOLD`
- `ALERT_RESPONSE_TIME`
- `ALERT_RESPONSE_TIME_THRESHOLD_MS`
- `ALERT_SLACK_CHANNEL`
- `ALERT_THRESHOLD_GPU_TEMP`
- `ALERT_THRESHOLD_INFERENCE_TIME`
- `ALERT_THRESHOLD_VRAM_USAGE`
- `ALERT_WEBHOOK_URL` (secret)
- `ALLOWED_FILE_TYPES`
- `ALLOWED_ORIGINS`
- `ALLOW_ORCHESTRATOR_IP`
- `ALLOW_PC1_IP`
- `ALLOW_PC2_IP`
- `ALLOW_PC3_IP`
- `ALLOW_PC4_IP`
- `ANON_KEY` (secret)
- `ANTHROPIC_API_KEY` (secret)
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_MAX_TOKENS` (secret)
- `ANTHROPIC_MODEL`
- `ANTHROPIC_TEMPERATURE`
- `API_ACCESS_TOKEN` (secret)
- `API_BASE_URL`
- `API_KEY` (secret)
- `API_KEY_EXPIRY` (secret)
- `API_KEY_HEADER` (secret)
- `API_KEY_PC2` (secret)
- `API_KEY_PC3` (secret)
- `API_KEY_PC4` (secret)
- `API_KEY_ROTATION_DAYS` (secret)
- `API_KEY_ROTATION_ENABLED` (secret)
- `API_PORT`
- `API_PREFIX`
- `API_RATE_LIMITING_REQUEST_COUNT`
- `API_RATE_LIMITING_TTL`
- `API_RATE_LIMIT_MAX_REQUESTS`
- `API_RATE_LIMIT_WINDOW_MS`
- `API_SECRET` (secret)
- `API_SECRET_KEY` (secret)
- `API_VERSION`
- `APM_ENABLED`
- `APPRISE_URLS`
- `APP_HOST`
- `APP_NAME`
- `APP_PORT`
- `APP_PROTOCOL`
- `APP_SECRET` (secret)
- `APP_URL`
- `APP_VERSION`
- `AP_API_KEY` (secret)
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
- `AP_VERSION`
- `ARCHGW_DISABLED`
- `ARCHON_AGENTS_ENABLED`
- `ARCHON_AGENTS_PORT`
- `ARCHON_API_KEY` (secret)
- `ARCHON_API_PORT`
- `ARCHON_API_WORKERS`
- `ARCHON_BACKOFF_MULTIPLIER`
- `ARCHON_BASE_URL`
- `ARCHON_CHECKPOINT_INTERVAL`
- `ARCHON_DB_NAME`
- `ARCHON_DB_PASSWORD` (secret)
- `ARCHON_DB_USER`
- `ARCHON_DEBUG`
- `ARCHON_DEV_PATH`
- `ARCHON_DOCS_PORT`
- `ARCHON_ENABLED`
- `ARCHON_ENABLE_DEV_MODE`
- `ARCHON_ENABLE_WORK_ORDERS`
- `ARCHON_ENV`
- `ARCHON_HOST`
- `ARCHON_JWT_SECRET` (secret)
- `ARCHON_LOG_LEVEL`
- `ARCHON_MAX_DEPTH`
- `ARCHON_MAX_TASKS`
- `ARCHON_MCP_BIND`
- `ARCHON_MCP_PORT`
- `ARCHON_MCP_URL`
- `ARCHON_METRICS_PORT`
- `ARCHON_METRICS_URL`
- `ARCHON_MODE`
- `ARCHON_OS_PORT`
- `ARCHON_OS_URL`
- `ARCHON_PARALLEL_BRANCHES`
- `ARCHON_PORT`
- `ARCHON_PROD`
- `ARCHON_REDIS_URL`
- `ARCHON_RETRY_ATTEMPTS`
- `ARCHON_SERVER_PORT`
- `ARCHON_SERVER_URL`
- `ARCHON_STATE_PERSISTENCE`
- `ARCHON_STATUS_URL`
- `ARCHON_TASK_TIMEOUT`
- `ARCHON_TOPOLOGY`
- `ARCHON_UI_BASE_URL`
- `ARCHON_UI_PORT`
- `ARCHON_URL`
- `ARCHON_USE_NPM`
- `AREA51_HOST`
- `AREA51_LAN_IP`
- `ASSET_CDN_URL`
- `ASSIGNMENT_ENABLED`
- `ASSIGNMENT_STRATEGY`
- `AUDIT_LOGGING_ENABLED`
- `AUDIT_LOG_DESTINATION`
- `AUDIT_LOG_ENABLED`
- `AUDIT_LOG_ENCRYPT`
- `AUDIT_LOG_LEVEL`
- `AUDIT_LOG_RETENTION_DAYS`
- `AUTH_SECRET` (secret)
- `AUTH_SERVICE_URL` (secret)
- `AUTOAPPROVE`
- `AUTO_MIGRATE`
- `AUTO_RECOVERY_ENABLED`
- `AUTO_SEED_DATA`
- `AWS_ACCESS_KEY_ID` (secret)
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_S3_ENDPOINT`
- `AWS_S3_URL_EXPIRY`
- `AWS_SECRET_ACCESS_KEY` (secret)
- `BACKUP_DIR`
- `BACKUP_ENABLED`
- `BACKUP_INTERVAL_HOURS`
- `BACKUP_MODELS`
- `BACKUP_PATH`
- `BACKUP_RETENTION`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_S3_BUCKET`
- `BACKUP_SCHEDULE`
- `BASH_DEFAULT_TIMEOUT_MS`
- `BASH_MAX_OUTPUT_LENGTH`
- `BASH_MAX_TIMEOUT_MS`
- `BATCH_SIZE`
- `BATCH_TIMEOUT_MS`
- `BATCH_WAIT_TIMEOUT_MS`
- `BCRYPT_ROUNDS`
- `BETTER_AUTH_SECRET` (secret)
- `BITWARDEN_ADMIN_TOKEN` (secret)
- `BITWARDEN_CLIENT_ID`
- `BITWARDEN_CLIENT_SECRET` (secret)
- `BITWARDEN_CLI_PATH`
- `BITWARDEN_MCP_BIND`
- `BITWARDEN_MCP_HOST`
- `BITWARDEN_MCP_PORT`
- `BITWARDEN_MCP_URL`
- `BITWARDEN_PASSWORD` (secret)
- `BODY_TIMEOUT`
- `BOOT_OPENCLAW`
- `BOOT_OPENCLAW_UI_PROXY`
- `BOOT_OPENCLAW_VOICE`
- `BUILD_DATE`
- `BUILD_ID`
- `BWS_ACCESS_TOKEN` (secret)
- `BW_CLIENTID`
- `BW_CLIENTSECRET` (secret)
- `BW_SERVER`
- `BW_SESSION`
- `CACHE_ENABLED`
- `CACHE_EVICTION_POLICY`
- `CACHE_MAX_SIZE`
- `CACHE_PATH`
- `CACHE_SIZE`
- `CACHE_SIZE_GB`
- `CACHE_SIZE_PERCENT`
- `CACHE_TTL`
- `CACHE_TTL_AUTH` (secret)
- `CACHE_TTL_CALCULATOR`
- `CACHE_TTL_CONTENT`
- `CACHE_TTL_DEFAULT`
- `CACHE_TTL_QUOTES`
- `CACHE_TTL_RATES`
- `CACHE_TTL_SECONDS`
- `CACHE_TTL_STATIC_DATA`
- `CACHE_TTL_USER`
- `CACHE_TTL_USER_SESSIONS`
- `CADDY_HTTP_PORT`
- `CADVISOR_PORT`
- `CALENDAR_DRIVER`
- `CAMPAIGN_ENGINE_HOST`
- `CAMPAIGN_ENGINE_PORT`
- `CAMPAIGN_ENGINE_URL`
- `CAMPAIGN_MAX_RETRIES`
- `CAMPAIGN_RETRY_DELAY_MINUTES`
- `CAMPAIGN_TIMEZONE`
- `CAPTCHA_DRIVER`
- `CDN_INVALIDATION_KEY` (secret)
- `CDN_URL`
- `CF_ACCESS_CLIENT_ID`
- `CF_ACCESS_CLIENT_SECRET` (secret)
- `CF_ACCOUNT_ID`
- `CF_API_TOKEN` (secret)
- `CF_PAGES_PROJECT`
- `CF_TUNNEL_ID_ORCHESTRATOR`
- `CF_TUNNEL_NAME`
- `CF_TUNNEL_TOKEN` (secret)
- `CF_ZONE_ID`
- `CHECKPOINT_AUTO_COMMIT`
- `CHECKPOINT_BRANCH_STRATEGY`
- `CHECKPOINT_ENABLED`
- `CHECKPOINT_INCLUDE_METRICS`
- `CHECKPOINT_INTERVAL`
- `CHECKPOINT_INTERVAL_STEPS`
- `CHECKPOINT_MAX_CHECKPOINTS`
- `CHECKPOINT_MESSAGE_PREFIX`
- `CHECKPOINT_RETENTION`
- `CHECK_INTERVAL`
- `CI`
- `CIPHER_SUITES`
- `CI_PROVIDER`
- `CLAM_AV_HOST`
- `CLAM_AV_PORT`
- `CLAUDE_API_KEY` (secret)
- `CLAUDE_AUTO_APPROVE`
- `CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR`
- `CLAUDE_CODE_ALWAYS_THINKING_ENABLED`
- `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`
- `CLAUDE_CODE_DISABLE_TERMINAL_TITLE`
- `CLAUDE_CODE_ENABLE_TELEMETRY`
- `CLAUDE_CODE_GIT_BASH_PATH`
- `CLAUDE_CODE_INTERACTION_MODE`
- `CLAUDE_CODE_MAX_OUTPUT_TOKENS` (secret)
- `CLAUDE_CODE_OAUTH_TOKEN` (secret)
- `CLAUDE_CODE_SUBAGENT_MODEL`
- `CLAUDE_CONFIG_PATH`
- `CLAUDE_ESCALATE_MODEL`
- `CLAUDE_FLOW_AGENT_POOL`
- `CLAUDE_FLOW_ALPHA`
- `CLAUDE_FLOW_API_KEY` (secret)
- `CLAUDE_FLOW_AUTO_COMMIT`
- `CLAUDE_FLOW_AUTO_LEARNING`
- `CLAUDE_FLOW_AUTO_PUSH`
- `CLAUDE_FLOW_AUTO_SCALING`
- `CLAUDE_FLOW_AUTO_UPDATE`
- `CLAUDE_FLOW_BASE_URL`
- `CLAUDE_FLOW_CACHE_ENABLED`
- `CLAUDE_FLOW_CACHE_SIZE`
- `CLAUDE_FLOW_CHECKPOINTS_ENABLED`
- `CLAUDE_FLOW_CHECKPOINT_ENABLED`
- `CLAUDE_FLOW_CHECKPOINT_INTERVAL`
- `CLAUDE_FLOW_CICD_MODE`
- `CLAUDE_FLOW_CMD`
- `CLAUDE_FLOW_CONCURRENT_TASKS`
- `CLAUDE_FLOW_CONFIG`
- `CLAUDE_FLOW_CONFIG_DIR`
- `CLAUDE_FLOW_CONFIG_PATH`
- `CLAUDE_FLOW_COORDINATION_ENABLED`
- `CLAUDE_FLOW_DAEMON_ENABLED`
- `CLAUDE_FLOW_DASHBOARD_PORT`
- `CLAUDE_FLOW_DATA_DIR`
- `CLAUDE_FLOW_DEBUG`
- `CLAUDE_FLOW_DEV_PATH`
- `CLAUDE_FLOW_DISTRIBUTED`
- `CLAUDE_FLOW_ENABLED`
- `CLAUDE_FLOW_ENABLE_CHECKPOINTS`
- `CLAUDE_FLOW_ENABLE_DEV_MODE`
- `CLAUDE_FLOW_ENABLE_FORKING`
- `CLAUDE_FLOW_ENABLE_HOOKS`
- `CLAUDE_FLOW_ENABLE_MCP`
- `CLAUDE_FLOW_ENABLE_MEMORY`
- `CLAUDE_FLOW_ENABLE_METRICS`
- `CLAUDE_FLOW_ENABLE_NEURAL`
- `CLAUDE_FLOW_ENABLE_PAUSE_RESUME`
- `CLAUDE_FLOW_ENABLE_SWARM`
- `CLAUDE_FLOW_ENABLE_TRACING`
- `CLAUDE_FLOW_ENVIRONMENT`
- `CLAUDE_FLOW_FORCE_UPDATE`
- `CLAUDE_FLOW_GITHUB_INTEGRATION`
- `CLAUDE_FLOW_HOOKS`
- `CLAUDE_FLOW_HOOKS_ENABLED`
- `CLAUDE_FLOW_HOST`
- `CLAUDE_FLOW_HOT_RELOAD`
- `CLAUDE_FLOW_LOG_FILE`
- `CLAUDE_FLOW_LOG_LEVEL`
- `CLAUDE_FLOW_MASTER_URL`
- `CLAUDE_FLOW_MAX_AGENTS`
- `CLAUDE_FLOW_MAX_AGENTS_SCALING`
- `CLAUDE_FLOW_MAX_CONCURRENT_TASKS`
- `CLAUDE_FLOW_MCP_HOST`
- `CLAUDE_FLOW_MCP_MODE`
- `CLAUDE_FLOW_MCP_PORT`
- `CLAUDE_FLOW_MCP_URL`
- `CLAUDE_FLOW_MEMORY`
- `CLAUDE_FLOW_MEMORY_DIR`
- `CLAUDE_FLOW_MEMORY_ENABLED`
- `CLAUDE_FLOW_MEMORY_LIMIT`
- `CLAUDE_FLOW_MEMORY_PERSIST`
- `CLAUDE_FLOW_MEMORY_PERSISTENCE`
- `CLAUDE_FLOW_MEMORY_SIZE`
- `CLAUDE_FLOW_METRICS_PORT`
- `CLAUDE_FLOW_MIN_AGENTS`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_NEURAL_OPTIMIZATION`
- `CLAUDE_FLOW_ORCHESTRATOR`
- `CLAUDE_FLOW_PARALLEL_PROCESSING`
- `CLAUDE_FLOW_PERFORMANCE_MODE`
- `CLAUDE_FLOW_PORT`
- `CLAUDE_FLOW_PROFILE`
- `CLAUDE_FLOW_REDIS_URL`
- `CLAUDE_FLOW_REMOTE_EXECUTION`
- `CLAUDE_FLOW_SCALE_DOWN_THRESHOLD`
- `CLAUDE_FLOW_SCALE_UP_THRESHOLD`
- `CLAUDE_FLOW_SECURITY_AUDIT`
- `CLAUDE_FLOW_SEMANTIC_SEARCH`
- `CLAUDE_FLOW_SWARM_TOPOLOGY`
- `CLAUDE_FLOW_TELEMETRY_ENABLED`
- `CLAUDE_FLOW_TIMEOUT`
- `CLAUDE_FLOW_TOPOLOGY`
- `CLAUDE_FLOW_TRUTH_THRESHOLD`
- `CLAUDE_FLOW_URL`
- `CLAUDE_FLOW_USE_NPM`
- `CLAUDE_FLOW_VERBOSE`
- `CLAUDE_FLOW_VERIFY_MODE`
- `CLAUDE_FLOW_VERSION`
- `CLAUDE_FLOW_WATCH_MODE`
- `CLAUDE_FLOW_WORKER_THREADS`
- `CLAUDE_METRICS_PATH`
- `CLAUDE_MODEL`
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
- `CLEANUP_CHECKPOINTS_DAYS`
- `CLEANUP_OLD_MODELS_DAYS`
- `CLEARBIT_API_KEY` (secret)
- `CLEAR_CACHE_INTERVAL`
- `CLERK_PUBLISHABLE_KEY` (secret)
- `CLERK_SECRET_KEY` (secret)
- `CLERK_WEBHOOK_SECRET` (secret)
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_LITELLM_HOSTNAME`
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_ID`
- `CLOUDFLARED_TUNNEL_NAME`
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_URL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API`
- `CLOUDFLARE_API_KEY` (secret)
- `CLOUDFLARE_API_TOKEN` (secret)
- `CLOUDFLARE_COMPATIBILITY_DATE`
- `CLOUDFLARE_EMAIL`
- `CLOUDFLARE_ENABLED`
- `CLOUDFLARE_GLOBAL_API`
- `CLOUDFLARE_ORIGIN_CA_KEY` (secret)
- `CLOUDFLARE_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_ENABLED`
- `CLOUDFLARE_TUNNEL_ID`
- `CLOUDFLARE_TUNNEL_ID_ORCHESTRATOR`
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3060`
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3090TI`
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX5090`
- `CLOUDFLARE_TUNNEL_LOGLEVEL`
- `CLOUDFLARE_TUNNEL_METRICS`
- `CLOUDFLARE_TUNNEL_NAME`
- `CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090`
- `CLOUDFLARE_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090` (secret)
- `CLOUDFLARE_ZONE_ID`
- `CLUSTER_NUM_WORKERS`
- `CODANNA_API_KEY` (secret)
- `CODANNA_DISABLED`
- `CODELLAMA_13B_PARAMS`
- `CODELLAMA_34B_PARAMS`
- `CODELLAMA_70B_PARAMS`
- `COHERE_API_KEY` (secret)
- `COLLECTION_ID`
- `COMPILATION_TIMEOUT`
- `COMPLETION_MODEL`
- `COMPOSE_DOCKER_CLI_BUILD`
- `COMPOSE_FILE`
- `COMPOSE_HTTP_TIMEOUT`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `COMPOSIO_API_KEY` (secret)
- `CONFIG_DIR`
- `CONFLICT_STRATEGY`
- `CONNECTION_POOL_SIZE`
- `CONNECTION_TIMEOUT`
- `CONSENT_REQUIRED`
- `CONSOLE_API_URL`
- `CONSOLE_WEB_URL`
- `CONSUL_CLIENT_ADDR`
- `CONSUL_ENABLED`
- `CONSUL_HTTP_ADDR`
- `CONSUL_SERVER_ADDR`
- `CONTAINER_MEMORY_LIMIT`
- `CONTEXT7_API_KEY` (secret)
- `CONTEXT_OVERLAP`
- `CONTEXT_SERVICE_URL`
- `CONTEXT_WINDOW`
- `CONTINUOUS_INTEGRATION`
- `CORS_ALLOWED_ORIGINS`
- `CORS_ALLOW_CREDENTIALS` (secret)
- `CORS_ALLOW_HEADERS`
- `CORS_CREDENTIALS` (secret)
- `CORS_ENABLED`
- `CORS_METHODS`
- `CORS_ORIGIN`
- `COVERAGE_ENABLED`
- `COVERAGE_REPORT_PATH`
- `CPU_LIMIT`
- `CPU_THRESHOLD_PERCENT`
- `CREATE_GH_RELEASE`
- `CRM_API_KEY` (secret)
- `CRM_DASHBOARD_PORT`
- `CRM_DASHBOARD_URL`
- `CRM_URL`
- `CRON_SCHEDULE`
- `CSP_ENABLED`
- `CUDA_DEVICE_ORDER`
- `CUDA_PATH`
- `CUDA_VERSION`
- `CUDA_VISIBLE_DEVICES`
- `CUSTOM_NODES_PATH`
- `DAEMON_ENABLED`
- `DATABASE_HOST`
- `DATABASE_MAX_OVERFLOW`
- `DATABASE_NAME`
- `DATABASE_PASSWORD` (secret)
- `DATABASE_POOL_MAX`
- `DATABASE_POOL_MIN`
- `DATABASE_POOL_SIZE`
- `DATABASE_PORT`
- `DATABASE_SCHEMA`
- `DATABASE_SSL`
- `DATABASE_URL`
- `DATABASE_USER`
- `DATADOG_API_KEY` (secret)
- `DATADOG_ENABLED`
- `DATADOG_SITE`
- `DATA_DELETION_RETENTION_DAYS`
- `DATA_DIR`
- `DATA_ENCRYPTION_AT_REST`
- `DATA_ENCRYPTION_IN_TRANSIT`
- `DATA_RETENTION_APPLICATIONS`
- `DATA_RETENTION_CONVERSATIONS`
- `DATA_RETENTION_DAYS`
- `DATA_RETENTION_SYSTEM_LOGS`
- `DB_BACKUP_ENABLED`
- `DB_BACKUP_RETENTION_DAYS`
- `DB_BACKUP_S3_BUCKET`
- `DB_BACKUP_SCHEDULE`
- `DB_CONNECTION_POOL_SIZE`
- `DB_CONNECTION_TIMEOUT`
- `DB_HOST`
- `DB_IDLE_TIMEOUT`
- `DB_MAX_CONNECTIONS`
- `DB_MIN_CONNECTIONS`
- `DB_NAME`
- `DB_PASSWORD` (secret)
- `DB_POOL_IDLE_TIMEOUT`
- `DB_POOL_MAX`
- `DB_POOL_MIN`
- `DB_PORT`
- `DB_QUERY_LOG`
- `DB_QUERY_SLOW_THRESHOLD`
- `DB_REPLICA_ENABLED`
- `DB_REPLICA_HOST`
- `DB_SSL`
- `DB_STATEMENT_TIMEOUT`
- `DB_TYPE`
- `DB_USER`
- `DB_USERNAME`
- `DDOS_PROTECTION_ENABLED`
- `DEBUG`
- `DEBUG_EXPRESS`
- `DEBUG_MODE`
- `DEEPSEEK_API_KEY` (secret)
- `DEEPSEEK_CODER_6B7_PARAMS`
- `DEFAULT_COMPLIANCE_EMAIL`
- `DEFAULT_LOAN_OFFICER_EMAIL`
- `DEFAULT_MODEL`
- `DEFAULT_PROVIDER`
- `DEFAULT_QUOTE_EXPIRY_DAYS`
- `DEFAULT_TEMPERATURE`
- `DEFAULT_THEME`
- `DEFAULT_TIMEOUT_S`
- `DEFAULT_USER_ROLE`
- `DEPLOYMENT_ENVIRONMENT`
- `DEPLOYMENT_MIN_READY_SECONDS`
- `DEPLOYMENT_STRATEGY`
- `DEPLOYMENT_TARGET`
- `DEREGISTRATION_CRITICAL_SERVICE_AFTER`
- `DESKTOP_COMMANDER_CMD`
- `DEVELOPMENT_MODE`
- `DEV_MODE`
- `DEV_PORT`
- `DIFY_API_KEY` (secret)
- `DIFY_API_PORT`
- `DIFY_API_URL`
- `DIFY_BASE_URL`
- `DIFY_CONSOLE_URL`
- `DIFY_DATABASE_URL`
- `DIFY_DB`
- `DIFY_DB_NAME`
- `DIFY_DB_PASSWORD` (secret)
- `DIFY_DB_URL`
- `DIFY_DB_USERNAME`
- `DIFY_ENABLED`
- `DIFY_ENCRYPTION_KEY` (secret)
- `DIFY_HOST`
- `DIFY_JWT_SECRET` (secret)
- `DIFY_LOG_LEVEL`
- `DIFY_PORT`
- `DIFY_POSTGRES_DB`
- `DIFY_POSTGRES_HOST`
- `DIFY_POSTGRES_PASSWORD` (secret)
- `DIFY_POSTGRES_PORT`
- `DIFY_POSTGRES_USER`
- `DIFY_REDIS_DB`
- `DIFY_REDIS_HOST`
- `DIFY_REDIS_PASSWORD` (secret)
- `DIFY_REDIS_PORT`
- `DIFY_REDIS_URL`
- `DIFY_SANDBOX_API_KEY` (secret)
- `DIFY_SANDBOX_PORT`
- `DIFY_SECRET_KEY` (secret)
- `DIFY_URL`
- `DIFY_WEB_BIND`
- `DIFY_WEB_PORT`
- `DIFY_WEB_URL`
- `DISABLE_NON_ESSENTIAL_MODEL_CALLS`
- `DISABLE_PROMPT_CACHING_HAIKU`
- `DISABLE_TELEMETRY`
- `DISCORD_BOT_TOKEN` (secret)
- `DISCORD_WEBHOOK_URL` (secret)
- `DISCOVERY_INTERVAL`
- `DISK_THRESHOLD_PERCENT`
- `DISTRIBUTED_FINETUNING_ENABLED`
- `DISTRIBUTED_INFERENCE_ENABLED`
- `DISTRIBUTE_TO_PC2_WEIGHT`
- `DISTRIBUTE_TO_PC3_WEIGHT`
- `DNC_CHECK_ENABLED`
- `DOCKERHUB_NAMESPACE`
- `DOCKERHUB_TOKEN` (secret)
- `DOCKERHUB_USERNAME`
- `DOCKER_BUILDKIT`
- `DOCKER_COMPOSE_PROJECT_NAME`
- `DOCKER_CPU_LIMIT`
- `DOCKER_HOST`
- `DOCKER_IMAGE`
- `DOCKER_MCP_HOST`
- `DOCKER_MCP_PORT`
- `DOCKER_MEMORY_LIMIT`
- `DOCKER_NETWORK`
- `DOCKER_REGISTRY`
- `DOCKER_REGISTRY_PASS` (secret)
- `DOCKER_REGISTRY_USER`
- `DOCKER_SOCKET`
- `DOCKER_SUBNET`
- `DOCKER_SUBNET_ORCHESTRATOR`
- `DOCKER_SUBNET_RTX3060`
- `DOCKER_SUBNET_RTX3090`
- `DOCKER_SUBNET_RTX5090`
- `DOCKHERHUB_TOKEN` (secret)
- `DOCUMENT_API_URL`
- `DOCUMENT_PROCESSOR_PORT`
- `DOCUMENT_PROCESSOR_URL`
- `DOCUSIGN_ACCOUNT_ID`
- `DOCUSIGN_BASE_PATH`
- `DOCUSIGN_INTEGRATION_KEY` (secret)
- `DOCUSIGN_PRIVATE_KEY_PATH` (secret)
- `DOCUSIGN_USER_ID`
- `DOMAIN`
- `DOMAIN_API`
- `DOMAIN_APP`
- `DOMAIN_CRM`
- `DOMAIN_NAME`
- `DOMAIN_PRIMARY`
- `DYNAMIC_BATCHING_ENABLED`
- `ELASTICSEARCH_INDEX`
- `ELASTICSEARCH_NODE`
- `EMAIL_DRIVER`
- `EMAIL_FROM`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`
- `EMAIL_HOST`
- `EMAIL_NOTIFICATIONS`
- `EMAIL_PASSWORD` (secret)
- `EMAIL_PORT`
- `EMAIL_PROVIDER`
- `EMAIL_SECURE`
- `EMAIL_SMTP_HOST`
- `EMAIL_SMTP_PASS` (secret)
- `EMAIL_SMTP_PORT`
- `EMAIL_SMTP_USER`
- `EMAIL_SYSTEM_ADDRESS`
- `EMAIL_USER`
- `EMBEDDING_BATCH_SIZE`
- `EMBEDDING_DIMENSIONS`
- `EMBEDDING_MODEL`
- `ENABLE_ADAPTIVE_TOPOLOGY`
- `ENABLE_AGENT_WORK_ORDERS`
- `ENABLE_ALERTS`
- `ENABLE_AST_ANALYSIS`
- `ENABLE_AUDIT_LOGGING`
- `ENABLE_AUTH` (secret)
- `ENABLE_AUTO_FAILOVER`
- `ENABLE_AUTO_SCALING`
- `ENABLE_BRANCHING`
- `ENABLE_CACHING`
- `ENABLE_CLOUDFLARED`
- `ENABLE_CLUSTERING`
- `ENABLE_CODE_GENERATION`
- `ENABLE_COMPLIANCE_CHECKS`
- `ENABLE_COST_TRACKING`
- `ENABLE_CRM`
- `ENABLE_CSRF_PROTECTION`
- `ENABLE_DEPENDENCY_GRAPH`
- `ENABLE_DETAILED_LOGGING`
- `ENABLE_DEV_TOOLS`
- `ENABLE_DISTRIBUTED_TRAINING`
- `ENABLE_DUAL_ORCHESTRATOR`
- `ENABLE_DYNAMIC_ADJUSTMENT`
- `ENABLE_DYNAMIC_BATCHING`
- `ENABLE_FLASH_ATTENTION_2`
- `ENABLE_GPU`
- `ENABLE_GPU_METRICS`
- `ENABLE_GPU_POWER_MONITORING`
- `ENABLE_GPU_THERMAL_MONITORING`
- `ENABLE_GPU_WORKERS`
- `ENABLE_GRADIENT_ACCUMULATION`
- `ENABLE_GUARDRAILS`
- `ENABLE_GZIP`
- `ENABLE_HEALTH_CHECKS`
- `ENABLE_HEALTH_MONITOR`
- `ENABLE_HELMET`
- `ENABLE_HOT_RELOAD`
- `ENABLE_HSTS`
- `ENABLE_IMAGE_ANALYSIS`
- `ENABLE_INFERENCE_PROFILING`
- `ENABLE_JIT_COMPILATION`
- `ENABLE_JOB_QUEUE`
- `ENABLE_KV_CACHE`
- `ENABLE_LOAD_BALANCING`
- `ENABLE_LOCAL_LB`
- `ENABLE_LOGGING`
- `ENABLE_LOG_SHIPPING`
- `ENABLE_MEMORY_OPTIMIZATION`
- `ENABLE_MEMORY_PERSISTENCE`
- `ENABLE_METRICS`
- `ENABLE_MONITORING`
- `ENABLE_MULTIMODAL`
- `ENABLE_MULTI_GPU_SYNC`
- `ENABLE_NEURAL_AGENTS`
- `ENABLE_NEURAL_COORDINATION`
- `ENABLE_NSYS_PROFILING`
- `ENABLE_PC2_FALLBACK`
- `ENABLE_PC3_FALLBACK`
- `ENABLE_PERFORMANCE_MONITORING`
- `ENABLE_PREFETCHING`
- `ENABLE_PROFILING`
- `ENABLE_QUANTIZATION`
- `ENABLE_RATE_LIMITING`
- `ENABLE_REQUEST_ID`
- `ENABLE_REQUEST_PRIORITY`
- `ENABLE_REVISIONS`
- `ENABLE_SECURITY_SCAN`
- `ENABLE_SELF_HEALING`
- `ENABLE_SIGNUP`
- `ENABLE_SOURCE_MAPS`
- `ENABLE_SPECULATIVE_DECODING`
- `ENABLE_SWARM_COORDINATION`
- `ENABLE_TAILSCALE`
- `ENABLE_TELEMETRY`
- `ENABLE_TLS`
- `ENABLE_TRACING`
- `ENABLE_VIRUS_SCAN`
- `ENABLE_WORKFLOWS`
- `ENABLE_WORKFLOW_CACHING`
- `ENCRYPTION_ALGORITHM`
- `ENCRYPTION_IV_LENGTH`
- `ENCRYPTION_KEY` (secret)
- `ENCRYPTION_KEY_PATH` (secret)
- `ENRICHMENT_ENABLED`
- `ENRICHMENT_PROVIDER`
- `ENV`
- `ENVIRONMENT`
- `EQUIFAX_API_KEY` (secret)
- `EVENT_SERVER_HEARTBEAT`
- `EVENT_SERVER_HTTP_PORT`
- `EVENT_SERVER_MAX_CONNECTIONS`
- `EVENT_SERVER_REPLAY_BUFFER`
- `EVENT_SERVER_WS_PORT`
- `EWC_CONSOLIDATION_INTERVAL`
- `EWC_ENABLED`
- `EWC_LAMBDA`
- `EXA_API_KEY` (secret)
- `EXPERIAN_API_KEY` (secret)
- `EXPERIMENTAL_FLASH_ATTENTION`
- `EXPERIMENTAL_QUANTIZATION`
- `EXPERIMENTAL_TENSOR_PARALLEL`
- `EXPORT_METRICS`
- `FAIL2BAN_ENABLED`
- `FAILOVER_RETRY_INTERVAL`
- `FAILOVER_TIMEOUT`
- `FALKORDB_AOF_ENABLED`
- `FALKORDB_AOF_FSYNC`
- `FALKORDB_AOF_SYNC`
- `FALKORDB_BIND`
- `FALKORDB_DB_INDEX`
- `FALKORDB_ENABLED`
- `FALKORDB_EVICTION_POLICY`
- `FALKORDB_GRAPH`
- `FALKORDB_GRAPH_KEY` (secret)
- `FALKORDB_GRAPH_NAME`
- `FALKORDB_HOST`
- `FALKORDB_MAX_MEMORY`
- `FALKORDB_PASSWORD` (secret)
- `FALKORDB_PERSISTENCE`
- `FALKORDB_PERSISTENCE_DIR`
- `FALKORDB_PERSIST_DATA`
- `FALKORDB_PORT`
- `FALKORDB_REPLICATION`
- `FALKORDB_REPLICA_URLS`
- `FALKORDB_SNAPSHOT_ENABLED`
- `FALKORDB_SNAPSHOT_INTERVAL`
- `FALKORDB_URL`
- `FALLBACK_MODELS`
- `FALLBACK_PROVIDERS`
- `FANNIE_MAE_API_KEY` (secret)
- `FEATURE_ADMIN_PORTAL`
- `FEATURE_ADVANCED_ANALYTICS`
- `FEATURE_AI_CHATBOT`
- `FEATURE_ANALYTICS_DASHBOARD`
- `FEATURE_AUTOMATED_UNDERWRITING`
- `FEATURE_AUTO_LEARNING`
- `FEATURE_A_B_TESTING`
- `FEATURE_BETA_API`
- `FEATURE_DEBUG_ENDPOINTS`
- `FEATURE_DEBUG_TOOLS`
- `FEATURE_DOCUMENT_OCR`
- `FEATURE_DRIP_CAMPAIGNS`
- `FEATURE_EXPERIMENTAL`
- `FEATURE_EXPERIMENTAL_UI`
- `FEATURE_LOCAL_GPU`
- `FEATURE_MEMORY_SYSTEMS`
- `FEATURE_MOCK_DATA`
- `FEATURE_MOCK_SERVICES`
- `FEATURE_MULTI_LANGUAGE`
- `FEATURE_MULTI_LENDER_QUOTES`
- `FEATURE_NEURAL_OPTIMIZATION`
- `FEATURE_PREDICTIVE_ANALYTICS`
- `FEATURE_SWARM_ORCHESTRATION`
- `FEATURE_VOICE_AUTOMATION`
- `FEATURE_VOICE_CALLS`
- `FILE_TOKEN_SECRET` (secret)
- `FINETUNING_API_KEY` (secret)
- `FINETUNING_BATCH_SIZE`
- `FINETUNING_DATASET_PATH`
- `FINETUNING_ENABLED`
- `FINETUNING_EPOCHS`
- `FINETUNING_HOST`
- `FINETUNING_LEARNING_RATE`
- `FINETUNING_LOG_FREQUENCY`
- `FINETUNING_MAX_DATASET_SIZE_GB`
- `FINETUNING_MAX_STEPS`
- `FINETUNING_OUTPUT_PATH`
- `FINETUNING_PORT`
- `FINETUNING_SAVE_FREQUENCY`
- `FINETUNING_WARMUP_STEPS`
- `FINE_GH_PAT`
- `FIRECRAWL_API_KEY` (secret)
- `FIREWALL_ENABLED`
- `FLASH_ATTENTION_BACKEND`
- `FLASH_ATTENTION_BLOCK_SIZE`
- `FLASH_ATTENTION_ENABLED`
- `FLASH_ATTENTION_TARGET_SPEEDUP`
- `FLOWISE_ENABLED`
- `FLOW_NEXUS_API_KEY` (secret)
- `FLOW_NEXUS_CMD`
- `FLOW_NEXUS_DISABLED`
- `FLOW_NEXUS_ENABLED`
- `FLOW_NEXUS_MCP_URL`
- `FLOW_NEXUS_MODE`
- `FLOW_NEXUS_TOKEN` (secret)
- `FLOW_NEXUS_URL`
- `FLOW_NEXUS_USER_ID`
- `FORCE_HTTPS`
- `FP8_QUANTIZATION`
- `FREDDIE_MAC_API_KEY` (secret)
- `FREERATEUPDATER_WEBHOOK_SECRET` (secret)
- `FREERATEUPDATE_API_KEY` (secret)
- `FREERATEUPDATE_EMAIL`
- `FREERATEUPDATE_WEBHOOK_URL` (secret)
- `FREE_RATE_UPDATE_API_KEY` (secret)
- `FREE_RATE_UPDATE_ENABLED`
- `FREE_RATE_UPDATE_WEBHOOK_URL` (secret)
- `FRONTEND_URL`
- `FRONT_BASE_URL`
- `GDPR_ENABLED`
- `GEMINI_API_KEY` (secret)
- `GEMINI_ASSISTANT_PORT`
- `GEMINI_ASSISTANT_URL`
- `GEMINI_BASE_URL`
- `GEMINI_MAX_TOKENS` (secret)
- `GEMINI_MCP_PORT`
- `GEMINI_MCP_URL`
- `GEMINI_MODEL`
- `GEMINI_VISION_MODEL`
- `GENERIC_TIMEZONE`
- `GH_DYNAMIC_TOOLSETS`
- `GH_MCP_API_KEY` (secret)
- `GH_PAT`
- `GH_PERSONAL_ACCESS_TOKEN` (secret)
- `GH_PERSONAL_ACCESS_TOKEN_ALL` (secret)
- `GH_REPOSITORY_OWNER`
- `GH_TOKEN` (secret)
- `GH_TOOLSETS`
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
- `GITEA_DISABLE_REGISTRATION`
- `GITEA_DOMAIN`
- `GITEA_HOST`
- `GITEA_HTTP_PORT`
- `GITEA_MAILER_ENABLED`
- `GITEA_MAILER_FROM`
- `GITEA_MCP_URL`
- `GITEA_OWNER`
- `GITEA_PORT`
- `GITEA_REPO`
- `GITEA_REQUIRE_SIGNIN`
- `GITEA_ROOT_URL`
- `GITEA_RUNNER_LABELS`
- `GITEA_RUNNER_NAME`
- `GITEA_RUNNER_REGISTRATION_TOKEN` (secret)
- `GITEA_RUNNER_TOKEN` (secret)
- `GITEA_SECRET_KEY` (secret)
- `GITEA_SMTP_HOST`
- `GITEA_SMTP_PASSWORD` (secret)
- `GITEA_SMTP_PORT`
- `GITEA_SMTP_USER`
- `GITEA_SSH_DOMAIN`
- `GITEA_SSH_PORT`
- `GITEA_TOKEN` (secret)
- `GITEA_URL`
- `GITHUB_ACTIONS`
- `GITHUB_AUTO_ISSUE_ON_ERROR`
- `GITHUB_BRANCH`
- `GITHUB_CALLBACK_URL`
- `GITHUB_CHECKPOINT_BRANCH`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET` (secret)
- `GITHUB_INTEGRATION_ENABLED`
- `GITHUB_MEMORY_BACKUP_GISTS`
- `GITHUB_OWNER`
- `GITHUB_PAT_TOKEN` (secret)
- `GITHUB_PR_ON_MAJOR_IMPROVEMENT`
- `GITHUB_REPO`
- `GITHUB_REPOSITORY`
- `GITHUB_SYNC_LEARNINGS`
- `GITHUB_TOKEN` (secret)
- `GITHUB_USERNAME`
- `GITHUB_WEBHOOK_SECRET` (secret)
- `GIT_AUTHOR_EMAIL` (secret)
- `GIT_AUTHOR_NAME` (secret)
- `GIT_COMMIT`
- `GIT_COMMITTER_EMAIL`
- `GIT_COMMITTER_NAME`
- `GIT_MCP_HOST`
- `GIT_MCP_PORT`
- `GOHIGHLEVEL_ACCOUNT_ID`
- `GOHIGHLEVEL_API_KEY` (secret)
- `GOHIGHLEVEL_API_URL`
- `GOOGLE_API_KEY` (secret)
- `GOOGLE_APPLICATION_CREDENTIALS` (secret)
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (secret)
- `GOOGLE_CLOUD_LOCATION`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_GEMINI_API_KEY` (secret)
- `GOOGLE_GEMINI_MODEL`
- `GPT_MODEL`
- `GPU_3060_TAILSCALE_IP`
- `GPU_3090_TAILSCALE_IP`
- `GPU_5090_TAILSCALE_IP`
- `GPU_ALLOW_GROWTH`
- `GPU_CLOCK_SPEED_LIMIT`
- `GPU_COMPUTE_CAPABILITY`
- `GPU_COMPUTE_MODE`
- `GPU_CUDA_DEVICE`
- `GPU_ENABLED`
- `GPU_EXPORTER_PORT`
- `GPU_MAX_BATCH_SIZE`
- `GPU_MAX_CONCURRENT`
- `GPU_MEMORY_CLOCK`
- `GPU_MEMORY_FRACTION`
- `GPU_MEMORY_UTIL`
- `GPU_MODEL`
- `GPU_POWER_LIMIT`
- `GPU_PRIORITY`
- `GPU_THERMAL_THRESHOLD_C`
- `GPU_TYPE`
- `GPU_VRAM`
- `GPU_VRAM_GB`
- `GPU_VRAM_MB`
- `GPU_WORKER_1_URL`
- `GPU_WORKER_2_URL`
- `GPU_WORKER_3060_ENABLED`
- `GPU_WORKER_3060_GPU`
- `GPU_WORKER_3060_MAX_CONCURRENT`
- `GPU_WORKER_3060_MODEL`
- `GPU_WORKER_3060_MODELS`
- `GPU_WORKER_3060_PRIORITY`
- `GPU_WORKER_3060_SPECIALIZATION`
- `GPU_WORKER_3060_URL`
- `GPU_WORKER_3060_VRAM`
- `GPU_WORKER_3090_ENABLED`
- `GPU_WORKER_3090_GPU`
- `GPU_WORKER_3090_MAX_CONCURRENT`
- `GPU_WORKER_3090_MODEL`
- `GPU_WORKER_3090_MODELS`
- `GPU_WORKER_3090_PRIORITY`
- `GPU_WORKER_3090_SPECIALIZATION`
- `GPU_WORKER_3090_URL`
- `GPU_WORKER_3090_VRAM`
- `GPU_WORKER_3_URL`
- `GPU_WORKER_5090_ENABLED`
- `GPU_WORKER_5090_GPU`
- `GPU_WORKER_5090_MAX_CONCURRENT`
- `GPU_WORKER_5090_MODEL`
- `GPU_WORKER_5090_MODELS`
- `GPU_WORKER_5090_PRIORITY`
- `GPU_WORKER_5090_SPECIALIZATION`
- `GPU_WORKER_5090_URL`
- `GPU_WORKER_5090_VRAM`
- `GPU_WORKER_DEFAULT_MODEL`
- `GPU_WORKER_ID`
- `GRACEFUL_TIMEOUT`
- `GRADIENT_ACCUMULATION_STEPS`
- `GRADIENT_CHECKPOINTING`
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_API_KEY` (secret)
- `GRAFANA_BIND`
- `GRAFANA_CPU_LIMIT`
- `GRAFANA_ENABLED`
- `GRAFANA_HOST`
- `GRAFANA_MEMORY_LIMIT`
- `GRAFANA_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_PROVISIONING_PATH`
- `GRAFANA_ROOT_URL`
- `GRAFANA_URL`
- `GRAPHITI_API_KEY` (secret)
- `GRAPHITI_AUTO_EXTRACTION`
- `GRAPHITI_AUTO_INDEX`
- `GRAPHITI_AUTO_SNAPSHOT`
- `GRAPHITI_BACKEND`
- `GRAPHITI_BACKUP_DIR`
- `GRAPHITI_BACKUP_ENABLED`
- `GRAPHITI_BATCH_SIZE`
- `GRAPHITI_COMPRESSION_ALGORITHM`
- `GRAPHITI_COMPRESSION_ENABLED`
- `GRAPHITI_EMBEDDING_DIMENSIONS`
- `GRAPHITI_EMBEDDING_MODEL`
- `GRAPHITI_EMBEDDING_PROVIDER`
- `GRAPHITI_ENABLED`
- `GRAPHITI_EXTRACTION_BATCH_SIZE`
- `GRAPHITI_EXTRACTION_MODEL`
- `GRAPHITI_FALKORDB_HOST`
- `GRAPHITI_FALKORDB_PASSWORD` (secret)
- `GRAPHITI_FALKORDB_PORT`
- `GRAPHITI_FALKORDB_URL`
- `GRAPHITI_GRAPH_NAME`
- `GRAPHITI_GROUP_ID`
- `GRAPHITI_INDEX_PROPERTIES`
- `GRAPHITI_MAX_NODES`
- `GRAPHITI_MAX_RELATIONSHIPS`
- `GRAPHITI_NEO4J_PASSWORD` (secret)
- `GRAPHITI_NEO4J_URI`
- `GRAPHITI_NEO4J_USER`
- `GRAPHITI_PASSWORD` (secret)
- `GRAPHITI_PORT`
- `GRAPHITI_QUERY_TIMEOUT`
- `GRAPHITI_RELATIONSHIP_INFERENCE`
- `GRAPHITI_SNAPSHOT_ENABLED`
- `GRAPHITI_SNAPSHOT_INTERVAL`
- `GRAPHITI_SNAPSHOT_RETENTION_DAYS`
- `GRAPHITI_TEMPORAL_TRACKING`
- `GRAPHITI_URI`
- `GRAPHITI_URL`
- `GRAPHITI_USER`
- `GRAPHQL_INTROSPECTION`
- `GRAPHQL_PLAYGROUND`
- `GROQ_API_KEY` (secret)
- `GZIP_LEVEL`
- `HEALTH_CHECK_ENABLED`
- `HEALTH_CHECK_INTERVAL`
- `HEALTH_CHECK_INTERVAL_MINUTES`
- `HEALTH_CHECK_PATH`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_START_PERIOD`
- `HEALTH_CHECK_TIMEOUT`
- `HEALTH_MONITOR_PORT`
- `HEAP_SIZE_MB`
- `HEARTBEAT_INTERVAL`
- `HELMET_ENABLED`
- `HF_TOKEN` (secret)
- `HIVEMIND_DISABLED`
- `HIVE_MIND_ENABLED`
- `HIVE_MIND_ENABLE_CONSENSUS`
- `HIVE_MIND_QUEEN_TYPE`
- `HMAC_SECRET` (secret)
- `HMDA_LAR_SUBMISSION_ENABLED`
- `HMDA_REPORTING_ENABLED`
- `HMDA_REPORTING_KEY` (secret)
- `HNSW_EF`
- `HNSW_EF_CONSTRUCTION`
- `HNSW_ENABLED`
- `HNSW_M`
- `HNSW_SPACE`
- `HOMEPAGE_PORT`
- `HOOKS_CUSTOM_PATHS`
- `HOOKS_ENABLED`
- `HOST`
- `HOSTNAME`
- `HOT_RELOAD`
- `HOT_RELOAD_ENABLED`
- `HSTS_INCLUDE_SUBDOMAINS`
- `HSTS_MAX_AGE`
- `HTTP_LOG_ENABLED`
- `HTTP_LOG_LEVEL`
- `HUB_PAT_TOKEN` (secret)
- `HUB_USERNAME`
- `HUGGINGFACE_TOKEN` (secret)
- `HUGGING_FACE_HUB_TOKEN` (secret)
- `IDENTITY_PROVIDER_CERTIFICATE` (secret)
- `IDENTITY_PROVIDER_LOGIN_URL`
- `IDENTITY_PROVIDER_SHA1_FINGERPRINT`
- `INFISICAL_ACCESS_TOKEN` (secret)
- `INFISICAL_API_URL`
- `INFISICAL_AUDIT_LOGGING`
- `INFISICAL_AUTH_SECRET` (secret)
- `INFISICAL_CACHE_DIR`
- `INFISICAL_CACHE_TTL`
- `INFISICAL_CLEAR_ON_EXIT`
- `INFISICAL_CLIENT_ID`
- `INFISICAL_CLIENT_ID_ARCHON`
- `INFISICAL_CLIENT_ID_CLAUDE_FLOW`
- `INFISICAL_CLIENT_SECRET` (secret)
- `INFISICAL_CLIENT_SECRET_ARCHON` (secret)
- `INFISICAL_CLIENT_SECRET_CLAUDE_FLOW` (secret)
- `INFISICAL_DISABLE_UPDATE_CHECK`
- `INFISICAL_ENABLED`
- `INFISICAL_ENCRYPTION_KEY` (secret)
- `INFISICAL_ENV`
- `INFISICAL_ENVIRONMENT`
- `INFISICAL_ENV_DEV_ID`
- `INFISICAL_ENV_PROD_ID`
- `INFISICAL_ENV_STAGING_ID`
- `INFISICAL_FOLDER_PATH`
- `INFISICAL_FOLDER_PATHS`
- `INFISICAL_HOST_URL`
- `INFISICAL_JWT_SECRET` (secret)
- `INFISICAL_LOG_LEVEL`
- `INFISICAL_MACHINE_ID`
- `INFISICAL_MACHINE_IDENTITY_PATH`
- `INFISICAL_MCP_BIND`
- `INFISICAL_MCP_URL`
- `INFISICAL_ORGANIZATION_ID`
- `INFISICAL_PATH`
- `INFISICAL_POLL_INTERVAL`
- `INFISICAL_PORT`
- `INFISICAL_POSTGRES_DB`
- `INFISICAL_POSTGRES_PASSWORD` (secret)
- `INFISICAL_POSTGRES_USER`
- `INFISICAL_PROJECT`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_SITE_URL`
- `INFISICAL_SYNC_INTERVAL`
- `INFISICAL_TOKEN` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` (secret)
- `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` (secret)
- `INFISICAL_WORKSPACE_ID`
- `INFI_CLIENT_ID`
- `INFI_CLIENT_SECRET` (secret)
- `INFI_PROJECT_ID`
- `INTEGRATION_PROTOCOL`
- `INTEGRATION_TIMEOUT`
- `INTERNAL_API_KEY` (secret)
- `INTERNAL_NETWORK`
- `IP_WHITELIST`
- `IP_WHITELIST_ENABLED`
- `IS_MULTIWORKSPACE_ENABLED`
- `JAEGER_AGENT_HOST`
- `JAEGER_AGENT_PORT`
- `JAEGER_ENABLED`
- `JAEGER_QUERY_PORT`
- `JEST_MAX_WORKERS`
- `JEST_TIMEOUT`
- `JOB_QUEUE_PRIORITY`
- `JOB_QUEUE_TYPE`
- `JWT_EXPIRATION`
- `JWT_EXPIRE`
- `JWT_EXPIRES_IN`
- `JWT_EXPIRY`
- `JWT_REFRESH_EXPIRE`
- `JWT_REFRESH_EXPIRES_IN`
- `JWT_REFRESH_EXPIRY`
- `JWT_REFRESH_SECRET` (secret)
- `JWT_SECRET` (secret)
- `KEEP_ALIVE_TIMEOUT`
- `KEEP_LOCAL_WEIGHT`
- `KEY_VAULTS_SECRET` (secret)
- `KUBE_NAMESPACE`
- `KUBE_REPLICAS`
- `KYUTAI_LLM_API_KEY` (secret)
- `KYUTAI_LLM_MODEL`
- `KYUTAI_LLM_URL`
- `LANDING_URL`
- `LANG`
- `LANGFUSE_NEXTAUTH_SECRET` (secret)
- `LANGFUSE_PORT`
- `LANGFUSE_SALT`
- `LAN_IP`
- `LB_HEALTH_CHECK_INTERVAL`
- `LB_REQUEST_QUEUE_SIZE`
- `LB_REQUEST_TIMEOUT`
- `LB_STRATEGY`
- `LC_ALL`
- `LEADMAILBOX_API_KEY` (secret)
- `LEADMAILBOX_API_URL`
- `LEADMAILBOX_PASSWORD` (secret)
- `LEADMAILBOX_URL`
- `LEADMAILBOX_USERNAME`
- `LEAD_API_URL`
- `LEAD_CAPTURE_URL`
- `LEAD_SCORE_ASSETS_WEIGHT`
- `LEAD_SCORE_CREDIT_WEIGHT`
- `LEAD_SCORE_DEBT_WEIGHT`
- `LEAD_SCORE_EMPLOYMENT_WEIGHT`
- `LEAD_SCORE_INCOME_WEIGHT`
- `LEAD_SCORE_THRESHOLD_A`
- `LEAD_SCORE_THRESHOLD_B`
- `LEAD_SCORE_THRESHOLD_C`
- `LENDERPRICE_API_KEY` (secret)
- `LENDERPRICE_API_URL`
- `LENDERPRICE_BASE_URL`
- `LENDERPRICE_COMPANY_ID`
- `LENDERPRICE_PASSWORD` (secret)
- `LENDERPRICE_USERNAME`
- `LENDER_PRICE_API_KEY` (secret)
- `LENDER_PRICE_BASE_URL`
- `LENDER_PRICE_ENABLED`
- `LENDER_PRICE_QUOTE_TIMEOUT`
- `LENDINGPAD_API_KEY` (secret)
- `LENDINGPAD_COMPANY_ID`
- `LENDINGPAD_PASSWORD` (secret)
- `LENDINGPAD_URL`
- `LENDINGPAD_USERNAME`
- `LENDINGTREE_API_KEY` (secret)
- `LENDINGTREE_PARTNER_ID`
- `LENDINGTREE_WEBHOOK_SECRET` (secret)
- `LENDINGTREE_WEBHOOK_URL` (secret)
- `LENDING_TREE_API_KEY` (secret)
- `LENDING_TREE_ENABLED`
- `LENDING_TREE_WEBHOOK_URL` (secret)
- `LETTA_AGENT_DEFAULT_EMBEDDING`
- `LETTA_AGENT_DEFAULT_MODEL`
- `LETTA_AGENT_PERSISTENCE`
- `LETTA_AGENT_POOLING`
- `LETTA_API_BIND`
- `LETTA_API_KEY` (secret)
- `LETTA_API_URL`
- `LETTA_ARCHIVAL_MEMORY`
- `LETTA_ARCHIVAL_MEMORY_ENABLED`
- `LETTA_ARCHIVAL_MEMORY_SIZE`
- `LETTA_AUTO_SAVE`
- `LETTA_AUTO_SAVE_INTERVAL`
- `LETTA_BACKUP_DIR`
- `LETTA_BACKUP_ENABLED`
- `LETTA_BACKUP_INTERVAL`
- `LETTA_BASE_URL`
- `LETTA_CONTEXT_WINDOW`
- `LETTA_CORE_MEMORY_LIMIT`
- `LETTA_CORE_MEMORY_SIZE`
- `LETTA_DB`
- `LETTA_DB_NAME`
- `LETTA_DB_PASSWORD` (secret)
- `LETTA_DB_URL`
- `LETTA_EMBEDDING_MODEL`
- `LETTA_EMBEDDING_PROVIDER`
- `LETTA_ENABLED`
- `LETTA_ENABLE_AUTH` (secret)
- `LETTA_HOST`
- `LETTA_LLM_MODEL`
- `LETTA_LLM_PROVIDER`
- `LETTA_LOG_LEVEL`
- `LETTA_MAX_AGENTS`
- `LETTA_MCP_ENABLED`
- `LETTA_MCP_PORT`
- `LETTA_MEMORY_MANAGER`
- `LETTA_PG_URI`
- `LETTA_PORT`
- `LETTA_POSTGRES_DB`
- `LETTA_POSTGRES_HOST`
- `LETTA_POSTGRES_PASSWORD` (secret)
- `LETTA_POSTGRES_PORT`
- `LETTA_POSTGRES_URI`
- `LETTA_POSTGRES_USER`
- `LETTA_RECALL_MEMORY_LIMIT`
- `LETTA_SAVE_INTERVAL`
- `LETTA_SERVER_PASS` (secret)
- `LETTA_SERVER_PASSWORD` (secret)
- `LETTA_SERVER_URL`
- `LETTA_URL`
- `LINKWARDEN_INTERNAL_URL`
- `LINKWARDEN_PORT`
- `LINKWARDEN_TOKEN` (secret)
- `LINKWARDEN_URL`
- `LITELLM_API_KEY` (secret)
- `LITELLM_API_KEYS` (secret)
- `LITELLM_BASE_URL`
- `LITELLM_CACHE_TTL`
- `LITELLM_CACHING_ENABLED`
- `LITELLM_DATABASE_URL`
- `LITELLM_DB`
- `LITELLM_FALLBACK_MODELS`
- `LITELLM_HOST`
- `LITELLM_LISTEN_PORT`
- `LITELLM_LOG`
- `LITELLM_LOG_LEVEL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_MAX_TOKENS` (secret)
- `LITELLM_MODE`
- `LITELLM_MODEL_FALLBACK_ORDER`
- `LITELLM_PORT`
- `LITELLM_PROXY_REDIS_URL`
- `LITELLM_PROXY_URL`
- `LITELLM_UPSTREAM`
- `LLAMA3_1_70B_PARAMS`
- `LLAMA3_1_8B_PARAMS`
- `LLXPERT_AUX_API_KEY` (secret)
- `LLXPERT_AUX_BASE_URL`
- `LLXPERT_CODER_API_KEY` (secret)
- `LLXPERT_CODER_BASE_URL`
- `LLXPERT_JEFE_API_KEY` (secret)
- `LLXPERT_JEFE_BASE_URL`
- `LMCACHE_BACKEND`
- `LMCACHE_ENABLED`
- `LMCACHE_MAX_SIZE`
- `LMCACHE_REDIS_URL`
- `LMCACHE_TTL`
- `LM_CACHE_PORT`
- `LOAD_BALANCE_MODELS`
- `LOBECHAT_ACCESS_CODE`
- `LOBECHAT_PORT`
- `LOBECHAT_URL`
- `LOCAL_ARCHON`
- `LOCAL_CLAUDE_FLOW`
- `LOCAL_LB_ENABLED`
- `LOCAL_LB_HOST`
- `LOCAL_LB_PORT`
- `LOCAL_LLM_ENABLED`
- `LOCAL_LLM_FALLBACK_TO_CLOUD`
- `LOCAL_LLM_MAX_RETRIES`
- `LOCAL_LLM_MODELS`
- `LOCAL_LLM_PRIORITY`
- `LOCAL_LLM_TIMEOUT`
- `LOCAL_LLM_URL`
- `LOGFIRE_TOKEN` (secret)
- `LOGIN_TOKEN_SECRET` (secret)
- `LOGS_PATH`
- `LOG_AGGREGATION_API_KEY` (secret)
- `LOG_AGGREGATION_ENABLED`
- `LOG_AGGREGATION_URL`
- `LOG_CACHE_HITS`
- `LOG_DIR`
- `LOG_FILE`
- `LOG_FILE_PATH`
- `LOG_FORMAT`
- `LOG_INFERENCE_TIME`
- `LOG_LEVEL`
- `LOG_MAX_FILES`
- `LOG_MAX_SIZE`
- `LOG_PATH`
- `LOG_REQUEST_DETAILS`
- `LOG_RETENTION_DAYS`
- `LOG_TO_FILE`
- `LOKI_ENABLED`
- `LOKI_HOST`
- `LOKI_INGESTION_RATE_MB`
- `LOKI_PORT`
- `LOKI_RETENTION_DAYS`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `LONG_CONTEXT_WINDOW`
- `LORA_ALPHA`
- `LORA_DROPOUT`
- `LORA_ENABLED`
- `LORA_R`
- `LORA_RANK`
- `LORA_TARGET_MODULES`
- `M15R7_HOST`
- `M15R7_LAN_IP`
- `MACHINE_CPU`
- `MACHINE_CPU_CORES`
- `MACHINE_CPU_THREADS`
- `MACHINE_GPU_NAME`
- `MACHINE_GPU_TYPE`
- `MACHINE_GPU_VRAM_GB`
- `MACHINE_HAS_GPU`
- `MACHINE_HOSTNAME`
- `MACHINE_IP_ETHERNET`
- `MACHINE_IP_TAILSCALE`
- `MACHINE_IP_WAN`
- `MACHINE_IP_WIFI`
- `MACHINE_MAC_ETHERNET`
- `MACHINE_MAC_WIFI`
- `MACHINE_MODEL`
- `MACHINE_NAME`
- `MACHINE_OS`
- `MACHINE_PURPOSE`
- `MACHINE_RAM_GB`
- `MACHINE_ROLE`
- `MACHINE_SPECIALIZATION`
- `MACHINE_STORAGE`
- `MACHINE_TAILSCALE_DOMAIN`
- `MACHINE_TAILSCALE_FQDN`
- `MACHINE_TYPE`
- `MACHINE_USERNAME`
- `MAC_ETHERNET`
- `MAC_WIFI`
- `MAGIC_UI_ENABLED`
- `MAILGUN_API_KEY` (secret)
- `MAILGUN_DOMAIN`
- `MAILGUN_FROM`
- `MAIN_SUBDOMAIN`
- `MANAGER_PORT`
- `MAX_AGENTS`
- `MAX_AGENTS_PER_WORKFLOW`
- `MAX_BATCH_SIZE`
- `MAX_BRANCHES`
- `MAX_CONCURRENT_AGENTS`
- `MAX_CONCURRENT_CONNECTIONS`
- `MAX_CONCURRENT_FINETUNES`
- `MAX_CONCURRENT_INFERENCES`
- `MAX_CONCURRENT_JOBS`
- `MAX_CONCURRENT_REQUESTS`
- `MAX_CONCURRENT_SCRAPERS`
- `MAX_CONCURRENT_TASKS`
- `MAX_CONNECTIONS`
- `MAX_CONNECTIONS_PER_USER`
- `MAX_CONTEXT_LENGTH`
- `MAX_CPU_CORES`
- `MAX_DB_CONNECTIONS`
- `MAX_DTI_RATIO`
- `MAX_FILE_SIZE`
- `MAX_LOAN_AMOUNT`
- `MAX_LTV_RATIO`
- `MAX_MEMORY`
- `MAX_MEMORY_GB`
- `MAX_MEMORY_MB`
- `MAX_MODEL_LEN`
- `MAX_RETRY_ATTEMPTS`
- `MAX_SYSTEM_RAM_PERCENT`
- `MAX_THOUGHTS`
- `MAX_TOKENS` (secret)
- `MAX_UPLOAD_SIZE`
- `MAX_VRAM_USAGE_PERCENT`
- `MAX_WORKERS`
- `MCP_BITWARDEN_PORT`
- `MCP_BRAVE_SEARCH_PORT`
- `MCP_DB_NAME`
- `MCP_DB_PASSWORD` (secret)
- `MCP_DB_USER`
- `MCP_DIFY_PORT`
- `MCP_ENABLED`
- `MCP_ENABLE_LOCAL_PACKAGES`
- `MCP_FILESYSTEM_PORT`
- `MCP_GATEWAY_URL`
- `MCP_GITHUB_PORT`
- `MCP_GITLAB_PORT`
- `MCP_GOOGLE_MAPS_PORT`
- `MCP_HOST`
- `MCP_HOT_RELOAD`
- `MCP_LOG_LEVEL`
- `MCP_NEXUS_HOST`
- `MCP_NEXUS_LOG_LEVEL`
- `MCP_NEXUS_MAX_CONNECTIONS`
- `MCP_NEXUS_PORT`
- `MCP_NEXUS_TIMEOUT`
- `MCP_PORT`
- `MCP_POSTGRES_PORT`
- `MCP_PROTOCOL_VERSION`
- `MCP_PROXY_MODE`
- `MCP_PROXY_TYPE`
- `MCP_REDIS_PASSWORD` (secret)
- `MCP_SENTRY_PORT`
- `MCP_SERVER_HOST`
- `MCP_SERVER_NAME`
- `MCP_SERVER_PORT`
- `MCP_SERVER_URL`
- `MCP_SERVER_VERSION`
- `MCP_SLACK_PORT`
- `MCP_TRANSPORT`
- `MCP_TWENTYCRM_PORT`
- `MCP_VSCODE_PORT`
- `MEILI_MASTER_KEY` (secret)
- `MEM0_API_KEY` (secret)
- `MEM0_API_URL`
- `MEM0_AUTO_CLEANUP`
- `MEM0_BACKUP_DIR`
- `MEM0_BACKUP_ENABLED`
- `MEM0_BASE_URL`
- `MEM0_CROSS_APP_SYNC`
- `MEM0_DATA_RETENTION_DAYS`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_EMBEDDING_MODEL`
- `MEM0_EMBEDDING_PROVIDER`
- `MEM0_ENABLED`
- `MEM0_ENCRYPTION`
- `MEM0_ENCRYPTION_KEY` (secret)
- `MEM0_GDPR_COMPLIANT`
- `MEM0_HOST`
- `MEM0_LLM_MODEL`
- `MEM0_LLM_PROVIDER`
- `MEM0_MCP_URL`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`
- `MEM0_PII_PROTECTION`
- `MEM0_PII_REDACTION`
- `MEM0_PORT`
- `MEM0_POSTGRES_DB`
- `MEM0_POSTGRES_HOST`
- `MEM0_POSTGRES_PASSWORD` (secret)
- `MEM0_POSTGRES_PORT`
- `MEM0_POSTGRES_USER`
- `MEM0_PROFILE_SCHEMA`
- `MEM0_REDIS_URL`
- `MEM0_REST_URL`
- `MEM0_RETENTION_DAYS`
- `MEM0_SERVER_URL`
- `MEM0_SYNC_INTERVAL`
- `MEM0_TRACK_DECISIONS`
- `MEM0_TRACK_INTERACTIONS`
- `MEM0_TRACK_PREFERENCES`
- `MEM0_URL`
- `MEM0_USER_PERSONALIZATION`
- `MEM0_VECTOR_STORE`
- `MEM0_VECTOR_STORE_URL`
- `MEMORY_AUTO_PERSIST`
- `MEMORY_BACKEND`
- `MEMORY_BACKUP_TO_GITHUB`
- `MEMORY_CACHE_ONLY`
- `MEMORY_CACHE_TYPE`
- `MEMORY_COMPRESSION`
- `MEMORY_CONSOLIDATION`
- `MEMORY_ENABLE_HNSW`
- `MEMORY_ENCRYPTION`
- `MEMORY_HNSW_EF_CONSTRUCTION`
- `MEMORY_HNSW_M`
- `MEMORY_LIMIT`
- `MEMORY_NAMESPACES`
- `MEMORY_PRIMARY_STORE`
- `MEMORY_RETENTION_DAYS`
- `MEMORY_SECONDARY_STORE`
- `MEMORY_SERVICE_ENABLED`
- `MEMORY_SERVICE_HOST`
- `MEMORY_SERVICE_PORT`
- `MEMORY_SERVICE_URL`
- `MEMORY_SYNC_INTERVAL`
- `MEMORY_THRESHOLD_PERCENT`
- `MEMPALACE_PORT`
- `MEMPALACE_URL`
- `MEMPAL_DIR`
- `MESSAGE_QUEUE_TYPE`
- `METAMCP_PORT`
- `METAMCP_SSE_URL`
- `METAMCP_WS_URL`
- `METRICS_ENABLED`
- `METRICS_EXPORT_INTERVAL`
- `METRICS_EXPORT_PORT`
- `METRICS_PORT`
- `METRICS_RETENTION_DAYS`
- `MFA_ISSUER`
- `MICROSOFT_CALLBACK_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET` (secret)
- `MINIO_API_PORT`
- `MINIO_CONSOLE_PORT`
- `MINIO_ROOT_PASSWORD` (secret)
- `MINIO_ROOT_USER`
- `MIN_BATCH_SIZE`
- `MIN_CREDIT_SCORE`
- `MIN_DISK_SPACE_GB`
- `MIN_FREE_RAM_GB`
- `MIN_FREE_VRAM_GB`
- `MIN_LOAN_AMOUNT`
- `MIN_TLS_VERSION`
- `MISTRAL_7B_PARAMS`
- `MISTRAL_API_KEY` (secret)
- `MIXED_PRECISION`
- `MIXTRAL_8X22B_PARAMS`
- `MIXTRAL_8X7B_PARAMS`
- `MOCK_AWS`
- `MOCK_SENDGRID`
- `MOCK_SERVICES`
- `MOCK_STRIPE`
- `MOCK_TWILIO`
- `MODE`
- `MODEL_AFFINITY_ENABLED`
- `MODEL_CACHE_DIR`
- `MODEL_CACHE_SIZE_GB`
- `MODEL_DTYPE`
- `MODEL_MANAGER_PORT`
- `MODEL_NAME`
- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`
- `MOE_ENABLED`
- `MOE_EXPERT_COUNT`
- `MOE_LOAD_BALANCING`
- `MOE_SPECIALIZATION`
- `MOE_TOP_K`
- `MOLTBOT_WEB_PORT`
- `MONGODB_DATABASE`
- `MONGODB_HOST`
- `MONGODB_INITDB_ROOT_PASSWORD` (secret)
- `MONGODB_INITDB_ROOT_USERNAME`
- `MONGODB_PASSWORD` (secret)
- `MONGODB_PORT`
- `MONGODB_URI`
- `MONGODB_URL`
- `MONGODB_USERNAME`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
- `MONITORING_ALERT_CPU`
- `MONITORING_ALERT_DISK`
- `MONITORING_ALERT_MEMORY`
- `MONITORING_ENABLED`
- `MORTGAGE_ADMIN_EMAIL`
- `N8N_API_KEY` (secret)
- `N8N_BACKUP_PATH`
- `N8N_BASE_URL`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_BINARY_DATA_TTL`
- `N8N_COMMUNITY_PACKAGES_ENABLED`
- `N8N_DATABASE_URL`
- `N8N_DATA_PATH`
- `N8N_DB`
- `N8N_DB_HOST`
- `N8N_DB_NAME`
- `N8N_DB_PASSWORD` (secret)
- `N8N_DB_PORT`
- `N8N_DB_TYPE`
- `N8N_DB_URL`
- `N8N_DB_USER`
- `N8N_DEFAULT_BINARY_DATA_MODE`
- `N8N_DISABLE_UI`
- `N8N_EDITOR_BASE_URL`
- `N8N_ENABLED`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_EXECUTIONS_DATA_MAX_AGE`
- `N8N_EXECUTIONS_DATA_PRUNE`
- `N8N_EXECUTIONS_DATA_SAVE_ON_ERROR`
- `N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS`
- `N8N_EXECUTIONS_TIMEOUT`
- `N8N_EXECUTIONS_TIMEOUT_MAX`
- `N8N_EXECUTION_MODE`
- `N8N_EXTRA_PACKAGES`
- `N8N_HOST`
- `N8N_LOG_FILE`
- `N8N_LOG_LEVEL`
- `N8N_LOG_OUTPUT`
- `N8N_METRICS`
- `N8N_METRICS_PREFIX`
- `N8N_PASSWORD` (secret)
- `N8N_PORT`
- `N8N_POSTGRES_DB`
- `N8N_POSTGRES_HOST`
- `N8N_POSTGRES_PASSWORD` (secret)
- `N8N_POSTGRES_PORT`
- `N8N_POSTGRES_USER`
- `N8N_PROTOCOL`
- `N8N_PUBLIC_BASE_URL`
- `N8N_SKIP_WEBHOOK_DNS_CHECK` (secret)
- `N8N_TOKEN` (secret)
- `N8N_URL`
- `N8N_VERSION`
- `N8N_WEBHOOK_URL` (secret)
- `N8N_WEB_BIND`
- `NAMESPACE_CLAUDE_FLOW`
- `NAMESPACE_DESKTOP_COMMANDER`
- `NAMESPACE_FLOW_NEXUS`
- `NAMESPACE_RUV_SWARM`
- `NCCL_DEBUG`
- `NCCL_TIMEOUT`
- `NEO4J_AUTH` (secret)
- `NEO4J_AUTH_PASSWORD` (secret)
- `NEO4J_AUTH_USER` (secret)
- `NEO4J_BOLT_PORT`
- `NEO4J_DATABASE`
- `NEO4J_ENABLED`
- `NEO4J_HOST`
- `NEO4J_HTTPS_PORT`
- `NEO4J_HTTP_PORT`
- `NEO4J_INITIAL_HEAP_SIZE`
- `NEO4J_MAX_HEAP_SIZE`
- `NEO4J_PASSWORD` (secret)
- `NEO4J_PORT`
- `NEO4J_URI`
- `NEO4J_URL`
- `NEO4J_USER`
- `NEO4J_USERNAME`
- `NETWORK_DRIVER`
- `NETWORK_NAME`
- `NEURAL_BATCH_SIZE`
- `NEURAL_DATA_PATH`
- `NEURAL_ERROR_PREVENTION_THRESHOLD`
- `NEURAL_FLASH_ATTENTION`
- `NEURAL_LEARNING_RATE`
- `NEURAL_MODEL_OPTIMIZATION`
- `NEURAL_OPTIMIZATION_ENABLED`
- `NEURAL_PATTERNS_ENABLED`
- `NEURAL_PERFORMANCE_AUTO_TUNE`
- `NEURAL_QUANTIZATION`
- `NEURAL_UPDATE_FREQUENCY`
- `NEXTAUTH_SECRET` (secret)
- `NEXTAUTH_URL` (secret)
- `NEXT_PUBLIC_ACTIVEPIECES_URL`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_API_KEY` (secret)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_ARCHON_UI_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (secret)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_DEBUG`
- `NEXT_PUBLIC_DIFY_APP_ID`
- `NEXT_PUBLIC_DIFY_WIDGET_URL`
- `NEXT_PUBLIC_DOCS_BASE_URL`
- `NEXT_PUBLIC_ENABLE_CALCULATOR`
- `NEXT_PUBLIC_ENABLE_CHAT`
- `NEXT_PUBLIC_GA_TRACKING_ID`
- `NEXT_PUBLIC_GRAFANA_URL`
- `NEXT_PUBLIC_GTM_ID`
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
- `NEXT_PUBLIC_TWENTYCRM_URL`
- `NEXT_PUBLIC_TWENTY_URL`
- `NEXT_PUBLIC_WEBAPP_URL`
- `NEXT_PUBLIC_WEBHOOK_URL` (secret)
- `NEXT_PUBLIC_WS_URL`
- `NEXT_TELEMETRY_DISABLED`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_ADMIN_URL`
- `NEXUS_API_URL`
- `NEXUS_CIRCUIT_BREAKER_ENABLED`
- `NEXUS_CIRCUIT_BREAKER_THRESHOLD`
- `NEXUS_CIRCUIT_BREAKER_TIMEOUT`
- `NEXUS_CPU_LIMIT`
- `NEXUS_ENABLE_TELEMETRY`
- `NEXUS_FALLBACK_ENABLED`
- `NEXUS_FALLBACK_RETRIES`
- `NEXUS_HEALTH_CHECK_ENABLED`
- `NEXUS_HEALTH_CHECK_INTERVAL`
- `NEXUS_HEALTH_CHECK_TIMEOUT`
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_LOAD_BALANCING`
- `NEXUS_LOG`
- `NEXUS_LOG_LEVEL`
- `NEXUS_MCP_PORT`
- `NEXUS_MCP_URL`
- `NEXUS_MEMORY_LIMIT`
- `NEXUS_METRICS_PORT`
- `NEXUS_METRICS_URL`
- `NEXUS_MONITORING_ENABLED`
- `NEXUS_PORT`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_BIND`
- `NEXUS_ROUTER_ENABLED`
- `NEXUS_ROUTER_HOST`
- `NEXUS_ROUTER_MCP_BIND`
- `NEXUS_ROUTER_MCP_PORT`
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_URL`
- `NEXUS_STATUS_URL`
- `NEXUS_URL`
- `NGINX_MEMORY_LIMIT`
- `NGINX_PORT`
- `NGINX_SSL_PORT`
- `NMLS_VALIDATION_ENABLED`
- `NODE_ENV`
- `NODE_EXPORTER_PORT`
- `NODE_IP`
- `NODE_LABEL`
- `NODE_OPTIONS`
- `NODE_VERSION`
- `NOTIFICATION_EMAIL_ENABLED`
- `NOTIFICATION_PUSH_ENABLED`
- `NOTIFICATION_SMS_ENABLED`
- `NOTIFICATION_WEBHOOK_URL` (secret)
- `NOTION_API_KEY` (secret)
- `NOTION_TOKEN` (secret)
- `NVIDIA_DCGM_EXPORTER_PORT`
- `NVIDIA_DRIVER_CAPABILITIES`
- `NVIDIA_EXPORTER_HOST`
- `NVIDIA_EXPORTER_INTERVAL`
- `NVIDIA_EXPORTER_PORT`
- `NVIDIA_GPU_MONITORING`
- `NVIDIA_SMI_INTERVAL`
- `NVIDIA_VISIBLE_DEVICES`
- `NYRA_ADMIN_DOMAIN`
- `NYRA_ADMIN_PORT`
- `NYRA_ALLOWED_CHANNELS`
- `NYRA_API_KEY` (secret)
- `NYRA_CAMPAIGN_AUTOMATION_ENABLED`
- `NYRA_CAMPAIGN_ENGINE_URL`
- `NYRA_CHAT_INTERNAL_API_BASE_URL`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `NYRA_COMPLIANCE_TRACKING_ENABLED`
- `NYRA_DOMAIN_ROOT`
- `NYRA_ENVIRONMENT`
- `NYRA_ESCALATION_EMAIL`
- `NYRA_FORCE_SECRETS` (secret)
- `NYRA_HTTP_ALLOWLIST`
- `NYRA_INTEGRATION_ENABLED`
- `NYRA_LEAD_SCORING_ENABLED`
- `NYRA_MACHINE`
- `NYRA_MCP_PORT`
- `NYRA_NETWORK`
- `NYRA_NETWORK_NAME`
- `NYRA_NEXUS_ROUTER_URL`
- `NYRA_NODE_ID`
- `NYRA_NODE_TYPE`
- `NYRA_ORCHESTRATOR_HOST`
- `NYRA_ORCHESTRATOR_PORT`
- `NYRA_ORCHESTRATOR_TUNNEL_ID_CHANGE_TEMP`
- `NYRA_PC_ID`
- `NYRA_PC_ROLE`
- `NYRA_POLICY_MODE`
- `NYRA_POSTGRES_PASSWORD` (secret)
- `NYRA_POSTGRES_PORT`
- `NYRA_PUBLIC_BASE_URL`
- `NYRA_QUOTE_ENGINE_URL`
- `NYRA_QUOTE_INTEGRATION_ENABLED`
- `NYRA_REDIS_PORT`
- `NYRA_STACK_NAME`
- `NYRA_WEBHOOK_SECRET` (secret)
- `OAUTH_CLIENT_ID` (secret)
- `OAUTH_CLIENT_SECRET` (secret)
- `OAUTH_ENABLED` (secret)
- `OAUTH_PROVIDER` (secret)
- `OCR_CONFIDENCE_THRESHOLD`
- `OCR_ENABLED`
- `OCR_LANGUAGE`
- `OLLAMA_3060_HOST`
- `OLLAMA_3060_NUM_GPU`
- `OLLAMA_3060_PORT`
- `OLLAMA_3060_URL`
- `OLLAMA_3090_HOST`
- `OLLAMA_3090_PORT`
- `OLLAMA_3090_URL`
- `OLLAMA_API`
- `OLLAMA_API_BASE_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_BIND`
- `OLLAMA_ENABLED`
- `OLLAMA_FLASH_ATTENTION`
- `OLLAMA_GPU_LAYERS`
- `OLLAMA_HOST`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_KV_CACHE_TYPE`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MCP_HOST`
- `OLLAMA_MCP_PORT`
- `OLLAMA_MODELS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_ORIGINS`
- `OLLAMA_PORT`
- `OLLAMA_PROXY_TIMEOUT`
- `OLLAMA_URL`
- `ONNX_API_URL`
- `ONNX_BATCH_SIZE`
- `ONNX_INTERNAL_URL`
- `ONNX_MODEL_PATH`
- `ONNX_QUANTIZATION`
- `ONNX_RUNTIME_DEVICE`
- `ONNX_RUNTIME_ENABLED`
- `ONNX_RUNTIME_INTER_OP_THREADS`
- `ONNX_RUNTIME_INTRA_OP_THREADS`
- `ONNX_RUNTIME_LOG_LEVEL`
- `ONNX_RUNTIME_PROVIDER`
- `OPENAI_API_BASE`
- `OPENAI_API_KEY` (secret)
- `OPENAI_BASE_URL`
- `OPENAI_EMBEDDING_DIMENSIONS`
- `OPENAI_EMBEDDING_MODEL`
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
- `OPENMEMORY_API_KEY` (secret)
- `OPENMEMORY_API_URL`
- `OPENMEMORY_BACKUP_DESTINATION`
- `OPENMEMORY_BACKUP_DIR`
- `OPENMEMORY_BACKUP_ENABLED`
- `OPENMEMORY_CLOUD_BACKUP`
- `OPENMEMORY_CROSS_APP_SHARING`
- `OPENMEMORY_DB_URL`
- `OPENMEMORY_ENABLED`
- `OPENMEMORY_ENCRYPTION`
- `OPENMEMORY_ENCRYPTION_KEY` (secret)
- `OPENMEMORY_MAX_MEMORIES_PER_USER`
- `OPENMEMORY_MAX_USERS`
- `OPENMEMORY_MCP_ENABLED`
- `OPENMEMORY_MCP_PORT`
- `OPENMEMORY_MCP_SERVER`
- `OPENMEMORY_PERSISTENCE`
- `OPENMEMORY_PERSISTENCE_DIR`
- `OPENMEMORY_PORT`
- `OPENMEMORY_POSTGRES_DB`
- `OPENMEMORY_POSTGRES_HOST`
- `OPENMEMORY_POSTGRES_PASSWORD` (secret)
- `OPENMEMORY_POSTGRES_PORT`
- `OPENMEMORY_POSTGRES_USER`
- `OPENMEMORY_SERVER_URL`
- `OPENMEMORY_SHARED_MEMORY`
- `OPENMEMORY_SYNC_INTERVAL`
- `OPENMEMORY_URL`
- `OPENMEMORY_VECTOR_STORE`
- `OPENROUTER_API_KEY` (secret)
- `OPENROUTER_BASE_URL`
- `OPENROUTER_FALLBACK_MODEL`
- `OPENROUTER_MAX_TOKENS` (secret)
- `OPENROUTER_MODEL`
- `OPENROUTER_SITE_NAME`
- `OPENROUTER_SITE_URL`
- `OPENWEBUI_DATA`
- `OPENWEBUI_OPENAI_API_KEY` (secret)
- `OPENWEBUI_PORT`
- `OPENWEBUI_SECRET_KEY` (secret)
- `OPEN_WEBUI_ENABLED`
- `OPEN_WEBUI_PORT`
- `OPEN_WEBUI_URL`
- `OPTIMAL_BLUE_API_KEY` (secret)
- `OPTIMAL_BLUE_API_URL`
- `OPTIMAL_BLUE_BASE_URL`
- `OPTIMAL_BLUE_CLIENT_ID`
- `OPTIMAL_BLUE_ENVIRONMENT`
- `OPT_TAG`
- `OPT_TAG_CUSTOM`
- `OPT_TAG_GITHUB`
- `OPT_TAG_GITHUBSTARS`
- `OPT_TAG_LANGUAGE`
- `OPT_TAG_USERNAME`
- `ORCHESTRATION_MODE`
- `ORCHESTRATOR_API_KEY` (secret)
- `ORCHESTRATOR_HOST`
- `ORCHESTRATOR_IP`
- `ORCHESTRATOR_PORT`
- `ORCHESTRATOR_PROMETHEUS_URL`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `ORCH_HOST`
- `ORCH_LAN_IP`
- `OTEL_EXPORT_TYPE`
- `OTEL_TELEMETRY_COLLECTION_ENABLED`
- `OWUI_PASSWORD` (secret)
- `OWUI_USERNAME`
- `PAGERDUTY_INTEGRATION_KEY` (secret)
- `PAGERDUTY_SERVICE_KEY` (secret)
- `PARALLEL_PROCESSING`
- `PASSWORD_RESET_EXPIRY` (secret)
- `PASSWORD_RESET_TIMEOUT` (secret)
- `PASSWORD_RESET_TOKEN_EXPIRE` (secret)
- `PATTERN_DISTILLATION`
- `PC2_INFERENCE_FALLBACK`
- `PC2_LITELLM_PORT`
- `PC2_LOAD_THRESHOLD`
- `PC2_OLLAMA_PORT`
- `PC2_ORCHESTRATOR_IP`
- `PC3_LOAD_THRESHOLD`
- `PC3_MEMORY_SERVICE_PORT`
- `PC3_OLLAMA_PORT`
- `PC3_ORCHESTRATOR_IP`
- `PC3_VLLM_PORT`
- `PC4_INFERENCE_FALLBACK`
- `PC4_OLLAMA_PORT`
- `PC4_ORCHESTRATOR_IP`
- `PC4_VLLM_PORT`
- `PC_NAME`
- `PC_ROLE`
- `PERF_MONITOR_PORT`
- `PERF_TARGET_COMMAND_EXECUTION`
- `PERF_TARGET_MCP_RESPONSE`
- `PERF_TARGET_MEMORY_OPERATIONS`
- `PERF_TARGET_NEURAL_PREDICTIONS`
- `PERPLEXITY_API_KEY` (secret)
- `PGADMIN_PASSWORD` (secret)
- `PGADMIN_PORT`
- `PG_DATABASE_HOST`
- `PG_DATABASE_NAME`
- `PG_DATABASE_URL`
- `PG_DATABASE_USER`
- `PII_ENCRYPTION_ENABLED`
- `PII_MASKING_ENABLED`
- `PORT`
- `PORTAINER_ADMIN_PASSWORD` (secret)
- `PORTAINER_ADMIN_USERNAME`
- `PORTAINER_AGENT_PORT`
- `PORTAINER_AGENT_SECRET` (secret)
- `PORTAINER_AGENT_TAGS`
- `PORTAINER_EDGE_ID`
- `PORTAINER_EDGE_INSECURE_POLL`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_HTTP_PORT`
- `PORTAINER_ORCHESTRATOR_URL`
- `PORTAINER_PORT`
- `PORTAINER_PUBLIC_URL`
- `PORTAINER_URL`
- `PORT_ACTIVEPIECES`
- `PORT_DIFY`
- `PORT_LETTA`
- `PORT_LITELLM`
- `PORT_N8N`
- `PORT_RANGE_END`
- `PORT_RANGE_START`
- `PORT_TWENTYCRM`
- `POSTGRES_BIND`
- `POSTGRES_CPU_LIMIT`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_INITDB_ARGS`
- `POSTGRES_MAX_CONNECTIONS`
- `POSTGRES_MEMORY_LIMIT`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_POOL_SIZE`
- `POSTGRES_PORT`
- `POSTGRES_SHARED_BUFFERS`
- `POSTGRES_SUPER_PASSWORD` (secret)
- `POSTGRES_URL`
- `POSTGRES_USER`
- `PREFETCH_THRESHOLD`
- `PREFLIGHT_CONTINUE`
- `PRIMARY_IP`
- `PRIMARY_MODEL`
- `PRIMARY_MODELS`
- `PRIMARY_MODEL_SIZE`
- `PRIMARY_MODEL_VRAM`
- `PRIMARY_NETWORK_INTERFACE`
- `PRIMARY_ORCHESTRATOR`
- `PRIORITY_QUEUE_DEPTH`
- `PROD`
- `PROD_PORT`
- `PROFILE_PORT`
- `PROFILING_ENABLED`
- `PROJECT_ENV`
- `PROJECT_NAME`
- `PROJECT_REGION`
- `PROJECT_VERSION`
- `PROMETHEUS_BIND`
- `PROMETHEUS_ENABLED`
- `PROMETHEUS_HOST`
- `PROMETHEUS_NODE_EXPORTER_PORT`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSHGATEWAY`
- `PROMETHEUS_PUSH_GATEWAY`
- `PROMETHEUS_REMOTE_WRITE_URL`
- `PROMETHEUS_RETENTION`
- `PROMETHEUS_RETENTION_DAYS`
- `PROMETHEUS_RETENTION_TIME`
- `PROMETHEUS_SCRAPE_INTERVAL`
- `PROMETHEUS_URL`
- `PROMTAIL_PORT`
- `PROVIDER`
- `PROXY_PORT`
- `PUBLIC_ADMIN_URL`
- `PUBLIC_BROKER_PORTAL_URL`
- `PUBLIC_CRM_URL`
- `PUBLIC_FLOWS_URL`
- `PUBLIC_FLOW_DASHBOARD_URL`
- `PUBLIC_GRAFANA_URL`
- `PUBLIC_IP`
- `PUBLIC_LANDING_URL`
- `PUBLIC_N8N_URL`
- `PYTHON_ENV`
- `PYTHON_VERSION`
- `QDRANT_API_KEY` (secret)
- `QDRANT_BIND`
- `QDRANT_COLLECTION`
- `QDRANT_COLLECTION_NAME`
- `QDRANT_DISTANCE`
- `QDRANT_DISTANCE_METRIC`
- `QDRANT_ENABLED`
- `QDRANT_GRPC_PORT`
- `QDRANT_GRPC_URL`
- `QDRANT_HOST`
- `QDRANT_INDEXING_THRESHOLD`
- `QDRANT_LOCAL`
- `QDRANT_LOCALHOST_URL`
- `QDRANT_ON_DISK_PAYLOAD`
- `QDRANT_OPTIMIZATION_ENABLED`
- `QDRANT_OPTIMIZE_INTERVAL`
- `QDRANT_PAYLOAD_INDEXING`
- `QDRANT_PERSISTENCE_DIR`
- `QDRANT_PORT`
- `QDRANT_SNAPSHOT_DIR`
- `QDRANT_SNAPSHOT_ENABLED`
- `QDRANT_URL`
- `QDRANT_VECTOR_SIZE`
- `QUANTIZATION_FORMAT`
- `QUERY_CACHE_ENABLED`
- `QUERY_CACHE_TTL`
- `QUERY_TIMEOUT`
- `QUEUE_ATTEMPTS`
- `QUEUE_BACKOFF_DELAY`
- `QUEUE_BULL_REDIS_HOST`
- `QUEUE_BULL_REDIS_PASSWORD` (secret)
- `QUEUE_BULL_REDIS_PORT`
- `QUEUE_CONCURRENCY`
- `QUEUE_DEFAULT_JOB_OPTIONS`
- `QUEUE_PROCESSING_DELAY`
- `QUEUE_REDIS_URL`
- `QUEUE_SIZE`
- `QUEUE_TIMEOUT`
- `QUIC_SYNC_PORT`
- `QUOTE_API_PORT`
- `QUOTE_API_POSTGRES_DB`
- `QUOTE_API_POSTGRES_HOST`
- `QUOTE_API_POSTGRES_PORT`
- `QUOTE_API_REDIS_DB`
- `QUOTE_API_REDIS_HOST`
- `QUOTE_API_REDIS_PORT`
- `QUOTE_API_SECRET` (secret)
- `QUOTE_API_URL`
- `QUOTE_ENGINE_HOST`
- `QUOTE_ENGINE_PORT`
- `QUOTE_ENGINE_URL`
- `QWEN2_5_32B_PARAMS`
- `QWEN2_5_72B_PARAMS`
- `RABBITMQ_EXCHANGE`
- `RABBITMQ_MANAGEMENT_PORT`
- `RABBITMQ_PASSWORD` (secret)
- `RABBITMQ_QUEUE`
- `RABBITMQ_URL`
- `RABBITMQ_USER`
- `RAG_ENABLED`
- `RAG_SIMILARITY_THRESHOLD`
- `RAG_TOP_K`
- `RAM_RESERVED_FOR_OS_GB`
- `RATEHUNTER_DOMAIN`
- `RATEHUNTER_PORT`
- `RATE_CACHE_KEY_PREFIX` (secret)
- `RATE_CHANGE_THRESHOLD`
- `RATE_CHECK_INTERVAL_MINUTES`
- `RATE_COMPARISON_API_URL`
- `RATE_LIMIT`
- `RATE_LIMITING_ENABLED`
- `RATE_LIMIT_DURATION`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_POINTS`
- `RATE_LIMIT_REQUESTS`
- `RATE_LIMIT_REQUESTS_PER_MINUTE`
- `RATE_LIMIT_SKIP_SUCCESSFUL`
- `RATE_LIMIT_WINDOW`
- `RATE_LIMIT_WINDOW_MINUTES`
- `RATE_LIMIT_WINDOW_MS`
- `RATE_LOCK_DURATION_DAYS`
- `RATE_PROVIDER_API_KEY` (secret)
- `RATE_PROVIDER_API_URL`
- `REASONINGBANK_DB_PATH`
- `REASONINGBANK_ENABLED`
- `REASONINGBANK_K`
- `REASONINGBANK_MIN_CONFIDENCE`
- `RECOVERY_CHECK_INTERVAL`
- `REDIS_BIND`
- `REDIS_CACHE_TTL`
- `REDIS_CPU_LIMIT`
- `REDIS_DB`
- `REDIS_ENABLED`
- `REDIS_EVICTION_POLICY`
- `REDIS_HOST`
- `REDIS_INTERNAL_URL`
- `REDIS_MAXMEMORY`
- `REDIS_MAXMEMORY_POLICY`
- `REDIS_MAX_CONNECTIONS`
- `REDIS_MAX_MEMORY`
- `REDIS_MEMORY_LIMIT`
- `REDIS_MIN_CONNECTIONS`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REDIS_TLS`
- `REDIS_TTL`
- `REDIS_URL`
- `REFRESH_TOKEN_DURATION` (secret)
- `REFRESH_TOKEN_SECRET` (secret)
- `REGION`
- `REGISTER_WITH_GATEWAY`
- `REPLACE_ME_GITEA_OWNER`
- `REPLACE_ME_VPS_HOST`
- `REPLACE_ME_VPS_USER`
- `REPLICATE_API_KEY` (secret)
- `REQUEST_ID_HEADER`
- `REQUEST_TIMEOUT`
- `RESEND_API_KEY` (secret)
- `RESEND_ENABLED`
- `RESEND_FROM_EMAIL`
- `RESPA_TIMELINE_DAYS`
- `RETENTION_POLICY_DAYS`
- `RETRY_DELAY_MS`
- `REVIEW_LABEL`
- `REVIEW_MAX_CHARS`
- `REVIEW_MODEL`
- `REVIEW_POST_AS_REVIEW`
- `ROCKET_MORTGAGE_API_KEY` (secret)
- `ROCKET_MORTGAGE_API_URL`
- `ROCKET_MORTGAGE_BASE_URL`
- `ROCKET_MORTGAGE_CLIENT_ID`
- `ROCKET_MORTGAGE_CLIENT_SECRET` (secret)
- `ROCKET_MORTGAGE_ENABLED`
- `ROCKET_MORTGAGE_ENVIRONMENT`
- `ROCKET_MORTGAGE_PARTNER_ID`
- `ROO_DISABLED`
- `ROUND_ROBIN_MODELS`
- `ROUTE_REQUESTS_THROUGH_NEXUS`
- `RTX3090TI_HOST`
- `RTX3090TI_LAN_IP`
- `RUVECTOR_API_KEY` (secret)
- `RUVECTOR_AUTH_ENABLED` (secret)
- `RUVECTOR_AUTH_KEY` (secret)
- `RUVECTOR_AUTO_DISTILL_ENABLED`
- `RUVECTOR_BACKUP_DIR`
- `RUVECTOR_BACKUP_ENABLED`
- `RUVECTOR_BACKUP_INTERVAL`
- `RUVECTOR_BACKUP_INTERVAL_SECONDS`
- `RUVECTOR_BACKUP_PATH`
- `RUVECTOR_BACKUP_RETENTION`
- `RUVECTOR_BATCH_SIZE`
- `RUVECTOR_BIND`
- `RUVECTOR_CACHE_SIZE_MB`
- `RUVECTOR_COHERE_API_KEY` (secret)
- `RUVECTOR_COMPRESSION`
- `RUVECTOR_COMPRESSION_LEVEL`
- `RUVECTOR_CONSENSUS`
- `RUVECTOR_CONSENSUS_ENABLED`
- `RUVECTOR_CONSENSUS_PEERS`
- `RUVECTOR_CONSENSUS_PROTOCOL`
- `RUVECTOR_CONSENSUS_QUORUM`
- `RUVECTOR_COORDINATOR`
- `RUVECTOR_CORS_ENABLED`
- `RUVECTOR_CORS_ORIGINS`
- `RUVECTOR_DATABASE_URL`
- `RUVECTOR_DATA_DIR`
- `RUVECTOR_DEBUG`
- `RUVECTOR_DEFAULT_LIMIT`
- `RUVECTOR_DEV_MODE`
- `RUVECTOR_DISTANCE_METRIC`
- `RUVECTOR_DISTILLATION_INTERVAL`
- `RUVECTOR_EF_CONSTRUCTION`
- `RUVECTOR_EF_SEARCH`
- `RUVECTOR_EMBEDDING_MODEL`
- `RUVECTOR_EMBEDDING_PROVIDER`
- `RUVECTOR_ENABLED`
- `RUVECTOR_ENCRYPTION_ENABLED`
- `RUVECTOR_ENCRYPTION_KEY` (secret)
- `RUVECTOR_EWC_ENABLED`
- `RUVECTOR_EWC_GAMMA`
- `RUVECTOR_EWC_LAMBDA`
- `RUVECTOR_FLASH_ATTENTION_BLOCK_SIZE`
- `RUVECTOR_FLASH_ATTENTION_ENABLED`
- `RUVECTOR_GNN_LAYERS`
- `RUVECTOR_GRPC_PORT`
- `RUVECTOR_HEALTH_CHECK_ENABLED`
- `RUVECTOR_HEALTH_CHECK_INTERVAL`
- `RUVECTOR_HNSW_EF_CONSTRUCTION`
- `RUVECTOR_HNSW_M`
- `RUVECTOR_HOST`
- `RUVECTOR_HTTP_PORT`
- `RUVECTOR_HYBRID_ALPHA`
- `RUVECTOR_HYBRID_SEARCH_ENABLED`
- `RUVECTOR_INDEX_EF_CONSTRUCTION`
- `RUVECTOR_INDEX_EF_SEARCH`
- `RUVECTOR_INDEX_M`
- `RUVECTOR_INDEX_METRIC`
- `RUVECTOR_INDEX_TYPE`
- `RUVECTOR_JAEGER_ENDPOINT`
- `RUVECTOR_KEEPALIVE_TIMEOUT`
- `RUVECTOR_LEADER`
- `RUVECTOR_LOCAL_MODEL_PATH`
- `RUVECTOR_LOG_DIR`
- `RUVECTOR_LOG_FORMAT`
- `RUVECTOR_LOG_LEVEL`
- `RUVECTOR_M`
- `RUVECTOR_MAX_CONNECTIONS`
- `RUVECTOR_MAX_LIMIT`
- `RUVECTOR_MAX_MEMORY_GB`
- `RUVECTOR_MAX_REQUEST_SIZE_MB`
- `RUVECTOR_METRICS_ENABLED`
- `RUVECTOR_METRICS_PORT`
- `RUVECTOR_MIN_SIMILARITY`
- `RUVECTOR_MODE`
- `RUVECTOR_NODE_ID`
- `RUVECTOR_OPENAI_API_KEY` (secret)
- `RUVECTOR_PATTERN_NAMESPACE`
- `RUVECTOR_PEER_ID`
- `RUVECTOR_PERSISTENCE_DIR`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_PG_PASSWORD` (secret)
- `RUVECTOR_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `RUVECTOR_PROFILING_ENABLED`
- `RUVECTOR_QDRANT_API_KEY` (secret)
- `RUVECTOR_QDRANT_COLLECTION`
- `RUVECTOR_QDRANT_ENABLED`
- `RUVECTOR_QDRANT_GRPC_PORT`
- `RUVECTOR_QDRANT_HOST`
- `RUVECTOR_QDRANT_PORT`
- `RUVECTOR_QUANTIZATION`
- `RUVECTOR_QUANTIZATION_BITS`
- `RUVECTOR_QUANTIZATION_ENABLED`
- `RUVECTOR_QUANTIZATION_TYPE`
- `RUVECTOR_QUERY_CACHE_ENABLED`
- `RUVECTOR_QUERY_CACHE_TTL`
- `RUVECTOR_RAFT_ELECTION_TIMEOUT`
- `RUVECTOR_RAFT_HEARTBEAT_INTERVAL`
- `RUVECTOR_RAFT_SNAPSHOT_INTERVAL`
- `RUVECTOR_RANDOM_SEED`
- `RUVECTOR_REASONINGBANK_ENABLED`
- `RUVECTOR_REDIS_DB`
- `RUVECTOR_REDIS_ENABLED`
- `RUVECTOR_REDIS_HOST`
- `RUVECTOR_REDIS_PASSWORD` (secret)
- `RUVECTOR_REDIS_PORT`
- `RUVECTOR_REDIS_PREFIX`
- `RUVECTOR_REQUEST_TIMEOUT`
- `RUVECTOR_SNAPSHOT_DIR`
- `RUVECTOR_SNAPSHOT_ENABLED`
- `RUVECTOR_SNAPSHOT_INTERVAL`
- `RUVECTOR_SONA_ADAPTATION_INTERVAL`
- `RUVECTOR_SONA_ENABLED`
- `RUVECTOR_SONA_LEARNING_RATE`
- `RUVECTOR_SONA_OPTIMIZATION_TARGET`
- `RUVECTOR_STORAGE_PATH`
- `RUVECTOR_THREAD_POOL_SIZE`
- `RUVECTOR_TLS_CERT_PATH` (secret)
- `RUVECTOR_TLS_ENABLED`
- `RUVECTOR_TLS_KEY_PATH` (secret)
- `RUVECTOR_TRACING_ENABLED`
- `RUVECTOR_TRAJECTORY_NAMESPACE`
- `RUVECTOR_URL`
- `RUVECTOR_VECTOR_DIM`
- `RUVECTOR_VECTOR_DIMENSIONS`
- `RUVECTOR_WAL_BUFFER_SIZE`
- `RUVECTOR_WAL_ENABLED`
- `RUVECTOR_WAL_SYNC_INTERVAL`
- `RUVECTOR_WORKER_THREADS`
- `RUV_FAST_NETWORKING`
- `RUV_SWARM_CMD`
- `RUV_SWARM_DAA_ENABLED`
- `RUV_SWARM_DISTRIBUTED`
- `RUV_SWARM_ENABLED`
- `RUV_SWARM_ENABLE_SIMD`
- `RUV_SWARM_LOG_LEVEL`
- `RUV_SWARM_MAX_AGENTS`
- `RUV_SWARM_MCP_PORT`
- `RUV_SWARM_MEMORY_MODE`
- `RUV_SWARM_MODE`
- `RUV_SWARM_NEURAL_ENABLED`
- `RUV_SWARM_NEURAL_OPTIMIZATION`
- `RUV_SWARM_TOPOLOGY`
- `RUV_SWARM_WASM_ENABLED`
- `S3_ACCESS_KEY` (secret)
- `S3_ACCESS_KEY_ID` (secret)
- `S3_BUCKET`
- `S3_BUCKET_NAME`
- `S3_ENABLED`
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_SECRET_ACCESS_KEY` (secret)
- `S3_SECRET_KEY` (secret)
- `S3_USE_SSL`
- `SCORING_ENABLED`
- `SCORING_MAX_SCORE`
- `SCORING_MIN_SCORE`
- `SCRAPER_INTERVAL_MINUTES`
- `SCRAPER_TIMEOUT_MS`
- `SECONDARY_MODEL`
- `SECONDARY_MODEL_SIZE`
- `SECONDARY_MODEL_VRAM`
- `SECONDARY_ORCHESTRATOR`
- `SECRETS_PATH` (secret)
- `SECRET_KEY` (secret)
- `SECURITY_SERVICE_PORT`
- `SECURITY_SERVICE_URL`
- `SEED_SAMPLE_DATA`
- `SEMANTIC_RELEASE_ENABLED`
- `SENDGRID_API_KEY` (secret)
- `SENDGRID_ENABLED`
- `SENDGRID_FROM`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_FROM_NAME`
- `SENDGRID_REPLY_TO`
- `SENDGRID_WEBHOOK_URL` (secret)
- `SENTRY_DEBUG`
- `SENTRY_DSN` (secret)
- `SENTRY_ENABLED`
- `SENTRY_ENVIRONMENT`
- `SENTRY_SAMPLE_RATE`
- `SENTRY_TRACES_SAMPLE_RATE`
- `SENTRY_TRACE_SAMPLE_RATE`
- `SERENA_API_KEY` (secret)
- `SERENA_DISABLED`
- `SERENA_MCP_PORT`
- `SERENA_MCP_URL`
- `SERENA_PORT`
- `SERENA_REPO_PATH`
- `SERENA_URL`
- `SERVER_URL`
- `SERVICES`
- `SERVICE_DISCOVERY_ENABLED`
- `SERVICE_KEY` (secret)
- `SERVICE_NAME`
- `SERVICE_REGISTRY_URL`
- `SESSION_DURATION`
- `SESSION_HTTP_ONLY`
- `SESSION_MAX_AGE`
- `SESSION_SAME_SITE`
- `SESSION_SECRET` (secret)
- `SESSION_SECURE`
- `SESSION_SERVICE_URL`
- `SESSION_TIMEOUT`
- `SHADCN_REGISTRY_URL`
- `SHARED_SCHEMA_VERSION`
- `SIGN_IN_PREFILLED`
- `SIMPLE_GH_TOKEN` (secret)
- `SITE_URL`
- `SLACK_ENABLED`
- `SLACK_WEBHOOK_APPLICATION` (secret)
- `SLACK_WEBHOOK_CRITICAL` (secret)
- `SLACK_WEBHOOK_DATABASE` (secret)
- `SLACK_WEBHOOK_INFRASTRUCTURE` (secret)
- `SLACK_WEBHOOK_URL` (secret)
- `SLACK_WEBHOOK_WARNINGS` (secret)
- `SLIDING_WINDOW_SIZE`
- `SMTP_ADMIN_EMAIL`
- `SMTP_AUTH_PASSWORD` (secret)
- `SMTP_AUTH_USERNAME` (secret)
- `SMTP_FROM`
- `SMTP_FROM_EMAIL`
- `SMTP_FROM_NAME`
- `SMTP_HOST`
- `SMTP_PASS` (secret)
- `SMTP_PASSWORD` (secret)
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_SMARTHOST`
- `SMTP_USER`
- `SONA_ADAPTATION_TIME`
- `SONA_ENABLED`
- `SONA_LEARNING_RATE`
- `SONA_MODE`
- `SOURCE_MAPS`
- `SPARC2_DISABLED`
- `SPARC_DISABLED`
- `SPECIALIZATION`
- `SPECULATIVE_TOKENS` (secret)
- `SSH_ALIAS`
- `SSL_CERT_PATH` (secret)
- `SSL_ENABLED`
- `SSL_KEY_PATH` (secret)
- `SSL_VERIFY_PEER`
- `STATE_COMPLIANCE_ENABLED`
- `STATIC_CACHE_MAX_AGE`
- `STATIC_IP`
- `STOP_ENFORCEMENT_ENABLED`
- `STORAGE_LOCAL_PATH`
- `STORAGE_TYPE`
- `STRIPE_PUBLIC_KEY` (secret)
- `STRIPE_SECRET_KEY` (secret)
- `STRIPE_WEBHOOK_SECRET` (secret)
- `SUBDOMAIN_ADMIN`
- `SUBDOMAIN_API`
- `SUBDOMAIN_NYRA`
- `SUPABASE_ACCESS_TOKEN` (secret)
- `SUPABASE_ANON_KEY` (secret)
- `SUPABASE_CLIENT_SERVICE_KEY` (secret)
- `SUPABASE_JWT_SECRET` (secret)
- `SUPABASE_PROJECT_ID`
- `SUPABASE_REFRESH_TOKEN` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_SERVICE_ROLE_KEY` (secret)
- `SUPABASE_URL`
- `SUPPORT_CHAT_ENABLED`
- `SWAGGER_ENABLED`
- `SWAGGER_PATH`
- `SWAP_ENABLED`
- `SWAP_SIZE_GB`
- `SWARM_AUTO_SCALE`
- `SWARM_COORDINATION_MODE`
- `SWARM_COORDINATION_PROTOCOL`
- `SWARM_COORDINATOR_URL`
- `SWARM_MAX_AGENTS`
- `SWARM_MAX_CONCURRENT_TASKS`
- `SWARM_MEMORY_SHARED`
- `SWARM_NEURAL_SYNC`
- `SWARM_ROLE`
- `SWARM_STRATEGY`
- `SWARM_TOPOLOGY`
- `SWARM_WORKERS`
- `SWARM_WORKER_ID`
- `SWARM_WORKER_PORT`
- `SYNC_BATCH_SIZE`
- `SYNC_INTERVAL`
- `SYNC_INTERVAL_MINUTES`
- `SYSTEM_MONITORING`
- `TAILSCALE_ADVERTISE_ROUTES`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_AUTH_KEY` (secret)
- `TAILSCALE_DOMAIN`
- `TAILSCALE_ENABLED`
- `TAILSCALE_FQDN`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TAILSCALE_TAGS`
- `TASK_QUEUE_PATH`
- `TASK_TIMEOUT_MS`
- `TAVILY_API_KEY` (secret)
- `TELEGRAM_BOT_TOKEN` (secret)
- `TELEMETRY_ENABLED`
- `TEMPLATES_PATH`
- `TENANT_ENGINEERING_KEY` (secret)
- `TENANT_PRODUCTION_KEY` (secret)
- `TENANT_RESEARCH_KEY` (secret)
- `TENSORBOARD_ENABLED`
- `TENSORBOARD_PORT`
- `TENSORRT_LLM_ENABLED`
- `TENSORRT_LLM_PORT`
- `TERTIARY_MODEL`
- `TEST_CONTAINER_NAME`
- `TEST_DATABASE_URL`
- `TEST_ENVIRONMENT`
- `TEST_MCP_PORT`
- `TEST_MODE`
- `TEST_PROJECT_ID`
- `TEST_REDIS_URL`
- `TEST_REPORT_PATH`
- `TEST_SECRET_ID` (secret)
- `TEST_TIMEOUT`
- `THROTTLE_LIMIT`
- `THROTTLE_TTL`
- `THUMBNAIL_QUALITY`
- `THUMBNAIL_SIZE`
- `TILA_DISCLOSURE_DAYS`
- `TIMEOUT_MS`
- `TIMEZONE`
- `TLS_CERT_PATH` (secret)
- `TLS_ENABLED`
- `TLS_KEY_PATH` (secret)
- `TORCH_BACKENDS_CUDNN_ENABLED`
- `TORCH_DISTRIBUTED_DEBUG`
- `TP_SIZE`
- `TRACING_ENABLED`
- `TRACK_INFERENCE_TIME`
- `TRACK_MODEL_LOADING_TIME`
- `TRACK_QUEUE_DEPTH`
- `TRAJECTORY_TRACKING`
- `TRANSUNION_API_KEY` (secret)
- `TRID_API_KEY` (secret)
- `TRID_CLOSING_DISCLOSURE_DAYS`
- `TRID_DISCLOSURE_ENABLED`
- `TRID_ENABLED`
- `TRID_LOAN_ESTIMATE_DAYS`
- `TURBO_TELEMETRY_DISABLED`
- `TWEAKCN_PRESET`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_API_URL`
- `TWENTYCRM_DATABASE_URL`
- `TWENTYCRM_DB_URL`
- `TWENTYCRM_ENABLED`
- `TWENTYCRM_HOST`
- `TWENTYCRM_JWT_SECRET` (secret)
- `TWENTYCRM_LOG_LEVEL`
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTYCRM_REDIS_URL`
- `TWENTYCRM_URL`
- `TWENTYCRM_WEBHOOK_SECRET` (secret)
- `TWENTYCRM_WORKSPACE_ID`
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_API_KEY` (secret)
- `TWENTY_API_URL`
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_BASE_URL`
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_API_URL`
- `TWENTY_CRM_BIND`
- `TWENTY_CRM_DATABASE_URL`
- `TWENTY_CRM_ENABLED`
- `TWENTY_CRM_JWT_SECRET` (secret)
- `TWENTY_CRM_PORT`
- `TWENTY_CRM_POSTGRES_DB`
- `TWENTY_CRM_POSTGRES_HOST`
- `TWENTY_CRM_POSTGRES_PASSWORD` (secret)
- `TWENTY_CRM_POSTGRES_PORT`
- `TWENTY_CRM_POSTGRES_USER`
- `TWENTY_CRM_SECRET_KEY` (secret)
- `TWENTY_CRM_SYNC_ENABLED`
- `TWENTY_CRM_SYNC_INTERVAL`
- `TWENTY_CRM_URL`
- `TWENTY_CRM_WORKSPACE_ID`
- `TWENTY_DATABASE_URL`
- `TWENTY_DB`
- `TWENTY_DB_HOST`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_PORT`
- `TWENTY_DB_USER`
- `TWENTY_ENABLED`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_FRONT_BASE_URL`
- `TWENTY_HOST`
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_LOGIN_TOKEN_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_PG_PASSWORD` (secret)
- `TWENTY_PORT`
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_PORT`
- `TWENTY_POSTGRES_USER`
- `TWENTY_PUBLIC_BASE_URL`
- `TWENTY_REDIS_HOST`
- `TWENTY_REDIS_PASSWORD` (secret)
- `TWENTY_REDIS_PORT`
- `TWENTY_REDIS_URL`
- `TWENTY_REFRESH_TOKEN_SECRET` (secret)
- `TWENTY_SERVER_URL`
- `TWENTY_TAG`
- `TWENTY_URL`
- `TWENTY_WEBHOOK_SECRET` (secret)
- `TWENTY_WORKSPACE_ID`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `TWILIO_ENABLED`
- `TWILIO_FROM_NUMBER`
- `TWILIO_MESSAGING_SERVICE_SID`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_SMS_WEBHOOK_URL` (secret)
- `TWILIO_VERIFY_SID`
- `TWILIO_VOICE_WEBHOOK_URL` (secret)
- `TZ`
- `UFW_ENABLED`
- `UNHEALTHY_THRESHOLD`
- `UNMUTE_HOST_PORT`
- `UNMUTE_IMAGE`
- `UNMUTE_MODEL_PROVIDER`
- `UNMUTE_OPENAI_API_KEY` (secret)
- `UNMUTE_PUBLIC_BASE_URL`
- `UPLOAD_DIR`
- `USE_GEMINI`
- `USE_NEXUS_ROUTER`
- `USE_ONNX`
- `USE_OPENROUTER`
- `VECTOR_COLLECTION`
- `VECTOR_DB_COLLECTION`
- `VECTOR_DB_HOST`
- `VECTOR_DB_PORT`
- `VERBOSE`
- `VERBOSE_GPU_LOGGING`
- `VERBOSE_LOGGING`
- `VERDICT_JUDGMENT`
- `VERSION`
- `VITE_ALLOWED_HOSTS`
- `VITE_API_BASE`
- `VITE_CLAUDE_FLOW_URL`
- `VITE_ENABLE_AGENT_MONITOR`
- `VITE_ENABLE_MEMORY_OPS`
- `VITE_ENABLE_METRICS`
- `VITE_ENABLE_TASK_TIMELINE`
- `VITE_ENABLE_TOPOLOGY`
- `VITE_EVENT_SERVER_HTTP_URL`
- `VITE_EVENT_SERVER_URL`
- `VITE_MAX_BUFFER_SIZE`
- `VITE_SHOW_DEVTOOLS`
- `VITE_WEBSOCKET_RECONNECT_INTERVAL`
- `VLLM_5090_URL`
- `VLLM_BIND`
- `VLLM_ENABLED`
- `VLLM_GPU_MEMORY`
- `VLLM_GPU_MEMORY_UTILIZATION`
- `VLLM_HOST`
- `VLLM_MAX_MODEL_LEN`
- `VLLM_MODEL`
- `VLLM_PORT`
- `VLLM_TENSOR_PARALLEL`
- `VLLM_TENSOR_PARALLEL_SIZE`
- `VOLTA_VERSION`
- `VRAM_GB`
- `VRAM_RESERVED_FOR_SYSTEM_GB`
- `WAN_IP`
- `WEBAPP_PORT`
- `WEBAPP_URL`
- `WEBHOOK_ALLOWED_ORIGINS` (secret)
- `WEBHOOK_BASE_URL` (secret)
- `WEBHOOK_MEMORY_LIMIT` (secret)
- `WEBHOOK_PORT` (secret)
- `WEBHOOK_RETRY_ATTEMPTS` (secret)
- `WEBHOOK_RETRY_DELAY` (secret)
- `WEBHOOK_SECRET_CLERK` (secret)
- `WEBHOOK_SECRET_FREERATEUPDATE` (secret)
- `WEBHOOK_SECRET_LENDINGTREE` (secret)
- `WEBHOOK_SECRET_SENDGRID` (secret)
- `WEBHOOK_SECRET_TWILIO` (secret)
- `WEBHOOK_SECURITY_ENABLED` (secret)
- `WEBHOOK_TIMEOUT` (secret)
- `WEBHOOK_TUNNEL_URL` (secret)
- `WEBHOOK_URL` (secret)
- `WEBUI_AUTH` (secret)
- `WEBUI_SECRET_KEY` (secret)
- `WHATSAPP_PHONE_NUMBER`
- `WORKER1_IP`
- `WORKER1_LLM_API_KEY` (secret)
- `WORKER1_LLM_BASE_URL`
- `WORKER2_IP`
- `WORKER2_LLM_API_KEY` (secret)
- `WORKER2_LLM_BASE_URL`
- `WORKER3_IP`
- `WORKER3_LLM_API_KEY` (secret)
- `WORKER3_LLM_BASE_URL`
- `WORKER_1_HOST`
- `WORKER_1_IP`
- `WORKER_1_ROLE`
- `WORKER_2_HOST`
- `WORKER_2_IP`
- `WORKER_2_ROLE`
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_MAX_CONCURRENT`
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_PRIMARY_USE`
- `WORKER_3060_PRIORITY`
- `WORKER_3060_SPECIALIZATION`
- `WORKER_3060_URL`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_MAX_CONCURRENT`
- `WORKER_3090_MODELS`
- `WORKER_3090_PRIMARY_USE`
- `WORKER_3090_PRIORITY`
- `WORKER_3090_SPECIALIZATION`
- `WORKER_3090_URL`
- `WORKER_3_HOST`
- `WORKER_3_IP`
- `WORKER_3_ROLE`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_MAX_CONCURRENT`
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_PRIMARY_USE`
- `WORKER_5090_PRIORITY`
- `WORKER_5090_SPECIALIZATION`
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_API_KEY` (secret)
- `WORKER_API_PORT`
- `WORKER_CAPABILITIES`
- `WORKER_CONCURRENCY`
- `WORKER_CONNECTIONS`
- `WORKER_GPU`
- `WORKER_ID`
- `WORKER_IP`
- `WORKER_METRICS_PORT`
- `WORKER_NAME`
- `WORKER_PROCESSES`
- `WORKER_ROLE`
- `WORKER_RTX3060_DEV_UI_PORT`
- `WORKER_RTX3060_GPU_MONITOR_PORT`
- `WORKER_RTX3060_JUPYTER_PORT`
- `WORKER_RTX3060_MLFLOW_PORT`
- `WORKER_RTX3060_OPENAI_BASE_URL`
- `WORKER_RTX3060_VSCODE_PORT`
- `WORKER_RTX3090TI_OPENAI_BASE_URL`
- `WORKER_RTX3090_DEV_UI_PORT`
- `WORKER_RTX3090_GPU_MONITOR_PORT`
- `WORKER_RTX3090_JUPYTER_PORT`
- `WORKER_RTX3090_MLFLOW_PORT`
- `WORKER_RTX3090_VSCODE_PORT`
- `WORKER_RTX5090_DEV_UI_PORT`
- `WORKER_RTX5090_GPU_MONITOR_PORT`
- `WORKER_RTX5090_JUPYTER_PORT`
- `WORKER_RTX5090_MLFLOW_PORT`
- `WORKER_RTX5090_OPENAI_BASE_URL`
- `WORKER_RTX5090_VSCODE_PORT`
- `WORKER_SPECIALIZATION`
- `WORKER_THREADS`
- `WORKER_TYPE`
- `WORKFLOW_STORAGE_PATH`
- `WORKSPACE_PATH`
- `WORKSPACE_ROOT`
- `XENOVA_API_URL`
- `XENOVA_BATCH_SIZE`
- `XENOVA_MODEL`
- `ZEP_API_KEY` (secret)
- `ZEP_EMBEDDING_MODEL`
- `ZEP_GRAPH_NAME`
- `ZEP_MCP_PORT`
- `ZOHO_MCP_URL`

### homeassistant
- `ACTIVEPIECES_URL`
- `APPRISE_URLS`
- `ARCHON_STATUS_URL`
- `ARCHON_URL`
- `CAPTCHA_DRIVER`
- `COLLECTION_ID`
- `CRM_URL`
- `CRON_SCHEDULE`
- `DIFY_URL`
- `GITHUB_TOKEN` (secret)
- `GITHUB_USERNAME`
- `GRAFANA_URL`
- `HASS_LONG_LIVED_TOKEN` (secret)
- `HASS_URL`
- `HA_STACK_ROOT`
- `HOMEASSISTANT_IP`
- `HOMEASSISTANT_URL`
- `HOMEPAGE_PORT`
- `LANDING_URL`
- `LETTA_URL`
- `LINKWARDEN_INTERNAL_URL`
- `LINKWARDEN_PORT`
- `LINKWARDEN_TOKEN` (secret)
- `LINKWARDEN_URL`
- `LOKI_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MEILI_MASTER_KEY` (secret)
- `MEM0_URL`
- `N8N_URL`
- `NEXTAUTH_SECRET` (secret)
- `NEXTAUTH_URL` (secret)
- `NEXUS_ADMIN_URL`
- `NEXUS_STATUS_URL`
- `NEXUS_URL`
- `OPEN_WEBUI_URL`
- `OPT_TAG`
- `OPT_TAG_CUSTOM`
- `OPT_TAG_GITHUB`
- `OPT_TAG_GITHUBSTARS`
- `OPT_TAG_LANGUAGE`
- `OPT_TAG_USERNAME`
- `PORTAINER_EDGE_KEY` (secret)
- `PORTAINER_ORCHESTRATOR_URL`
- `PORTAINER_URL`
- `POSTGRES_DB`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_USER`
- `PROMETHEUS_URL`
- `QDRANT_URL`
- `TAILSCALE_IP`
- `WEBAPP_URL`

### oracle-vps
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
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
- `ARCHON_OS_PORT`
- `BACKUP_ENABLED`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_SCHEDULE`
- `CADVISOR_PORT`
- `CLAWDBOT_GATEWAY_PORT`
- `CLAWDBOT_GATEWAY_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_API_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_ENABLED`
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_ZONE_ID`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `CONNECTION_POOL_SIZE`
- `DOMAIN_NAME`
- `ENABLE_CRM`
- `ENABLE_GPU_WORKERS`
- `ENABLE_MONITORING`
- `ENABLE_WORKFLOWS`
- `FAIL2BAN_ENABLED`
- `FALKORDB_HOST`
- `FALKORDB_PORT`
- `GEMINI_API_KEY` (secret)
- `GOOGLE_API_KEY` (secret)
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_PORT`
- `GRAFANA_ROOT_URL`
- `LITELLM_BASE_URL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LOG_LEVEL`
- `LOKI_PORT`
- `MAX_CONNECTIONS`
- `MEMPALACE_PORT`
- `MEMPAL_DIR`
- `METRICS_EXPORT_PORT`
- `MOLTBOT_WEB_PORT`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
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
- `NEXUS_MCP_PORT`
- `NEXUS_METRICS_PORT`
- `NEXUS_ROUTER_PORT`
- `NGINX_MEMORY_LIMIT`
- `NGINX_PORT`
- `NGINX_SSL_PORT`
- `NODE_ENV`
- `NYRA_ENVIRONMENT`
- `NYRA_NODE_ID`
- `NYRA_NODE_TYPE`
- `OPENAI_API_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENWEBUI_PORT`
- `OPENWEBUI_SECRET_KEY` (secret)
- `ORACLE_INSTANCE_IP`
- `ORACLE_REGION`
- `POSTGRES_DB`
- `POSTGRES_MEMORY_LIMIT`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_PORT`
- `POSTGRES_USER`
- `PROMETHEUS_PORT`
- `QUOTE_API_PORT`
- `QUOTE_API_SECRET` (secret)
- `RATE_LIMIT_REQUESTS`
- `RATE_LIMIT_WINDOW_MS`
- `REDIS_MEMORY_LIMIT`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REPLACE_ME_VPS_HOST`
- `REPLACE_ME_VPS_USER`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `SSL_ENABLED`
- `SUPABASE_ANON_KEY` (secret)
- `SUPABASE_SERVICE_KEY` (secret)
- `SUPABASE_URL`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTY_APP_SECRET` (secret)
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_FRONTEND_URL`
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_PG_DATABASE_URL`
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_USER`
- `TWENTY_REDIS_URL`
- `TWENTY_SERVER_URL`
- `UFW_ENABLED`
- `WEBHOOK_MEMORY_LIMIT` (secret)
- `WEBHOOK_PORT` (secret)
- `WEBHOOK_URL` (secret)
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_5090_MODEL`
- `WORKER_5090_VLLM_PORT`

### worker-rtx3060
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `AGENTDB_ENABLED`
- `AGENTDB_PATH`
- `AGENTDB_READ_ONLY`
- `AGENTDB_SYNC_FROM`
- `AGGRESSIVE_MEMORY_CLEANUP`
- `AIDEFENCE_ENABLED`
- `ALLOW_ORCHESTRATOR_IP`
- `ALLOW_PC1_IP`
- `ALLOW_PC3_IP`
- `ALLOW_PC4_IP`
- `ANTHROPIC_API_KEY` (secret)
- `API_KEY_PC2` (secret)
- `API_SECRET` (secret)
- `ARCHON_MODE`
- `ARCHON_OS_PORT`
- `ARCHON_SERVER_URL`
- `AUTH_SERVICE_URL` (secret)
- `AUTO_RECOVERY_ENABLED`
- `BACKUP_INTERVAL_HOURS`
- `BACKUP_MODELS`
- `BACKUP_PATH`
- `BACKUP_RETENTION_DAYS`
- `BATCH_SIZE`
- `BATCH_TIMEOUT_MS`
- `CACHE_ENABLED`
- `CACHE_MAX_SIZE`
- `CACHE_TTL`
- `CADVISOR_PORT`
- `CLAUDE_FLOW_CACHE_SIZE`
- `CLAUDE_FLOW_DEBUG`
- `CLAUDE_FLOW_LOG_LEVEL`
- `CLAUDE_FLOW_MASTER_URL`
- `CLAUDE_FLOW_MAX_AGENTS`
- `CLAUDE_FLOW_MAX_CONCURRENT_TASKS`
- `CLAUDE_FLOW_MEMORY_LIMIT`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_VERSION`
- `CLAUDE_FLOW_WORKER_THREADS`
- `CLEANUP_OLD_MODELS_DAYS`
- `CLOUDFLARED_TUNNEL_ID`
- `CLOUDFLARED_TUNNEL_NAME`
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_URL`
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3060`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3060`
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060` (secret)
- `CODELLAMA_13B_PARAMS`
- `COMPOSE_DOCKER_CLI_BUILD`
- `COMPOSE_HTTP_TIMEOUT`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `CONNECTION_POOL_SIZE`
- `CONSUL_CLIENT_ADDR`
- `CONSUL_ENABLED`
- `CONSUL_SERVER_ADDR`
- `CPU_THRESHOLD_PERCENT`
- `CUDA_DEVICE_ORDER`
- `CUDA_PATH`
- `CUDA_VERSION`
- `CUDA_VISIBLE_DEVICES`
- `DEBUG_MODE`
- `DEEPSEEK_CODER_6B7_PARAMS`
- `DEFAULT_MODEL`
- `DIFY_API_KEY` (secret)
- `DIFY_URL`
- `DISK_THRESHOLD_PERCENT`
- `DOCKER_BUILDKIT`
- `DOCKER_SUBNET_RTX3060`
- `EMBEDDING_BATCH_SIZE`
- `EMBEDDING_CACHE_DIR`
- `EMBEDDING_DEVICE`
- `EMBEDDING_DIMENSIONS`
- `EMBEDDING_INTERNAL_URL`
- `EMBEDDING_MAX_SEQUENCE_LENGTH`
- `EMBEDDING_MODEL`
- `EMBEDDING_PORT`
- `ENABLE_AUTO_SCALING`
- `ENABLE_CACHING`
- `ENABLE_CRM`
- `ENABLE_DYNAMIC_BATCHING`
- `ENABLE_GPU`
- `ENABLE_GPU_WORKERS`
- `ENABLE_HEALTH_CHECKS`
- `ENABLE_LOAD_BALANCING`
- `ENABLE_LOCAL_LB`
- `ENABLE_METRICS`
- `ENABLE_MONITORING`
- `ENABLE_PREFETCHING`
- `ENABLE_PROFILING`
- `ENABLE_QUANTIZATION`
- `ENABLE_TLS`
- `ENABLE_WORKFLOWS`
- `EXPERIMENTAL_FLASH_ATTENTION`
- `EXPERIMENTAL_QUANTIZATION`
- `EXPERIMENTAL_TENSOR_PARALLEL`
- `FIREWALL_ENABLED`
- `GOOGLE_API_KEY` (secret)
- `GPU_3060_TAILSCALE_IP`
- `GPU_3090_TAILSCALE_IP`
- `GPU_5090_TAILSCALE_IP`
- `GPU_ALLOW_GROWTH`
- `GPU_CLOCK_SPEED_LIMIT`
- `GPU_COMPUTE_CAPABILITY`
- `GPU_CUDA_DEVICE`
- `GPU_ENABLED`
- `GPU_EXPORTER_PORT`
- `GPU_MAX_BATCH_SIZE`
- `GPU_MAX_CONCURRENT`
- `GPU_MEMORY_FRACTION`
- `GPU_MODEL`
- `GPU_POWER_LIMIT`
- `GPU_PRIORITY`
- `GPU_VRAM`
- `GPU_VRAM_GB`
- `GPU_WORKER_3060_ENABLED`
- `GPU_WORKER_3060_GPU`
- `GPU_WORKER_3060_MAX_CONCURRENT`
- `GPU_WORKER_3060_MODEL`
- `GPU_WORKER_3060_MODELS`
- `GPU_WORKER_3060_PRIORITY`
- `GPU_WORKER_3060_SPECIALIZATION`
- `GPU_WORKER_3060_URL`
- `GPU_WORKER_3060_VRAM`
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_API_KEY` (secret)
- `GRAFANA_PORT`
- `GRAFANA_URL`
- `GRAPHITI_API_KEY` (secret)
- `GRAPHITI_EMBEDDING_DIMENSIONS`
- `GRAPHITI_EMBEDDING_MODEL`
- `GRAPHITI_EMBEDDING_PROVIDER`
- `GRAPHITI_URL`
- `HEALTH_CHECK_INTERVAL`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `HEALTH_MONITOR_PORT`
- `HF_TOKEN` (secret)
- `INFISICAL_API_URL`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_TOKEN` (secret)
- `INTERNAL_API_KEY` (secret)
- `JAEGER_AGENT_HOST`
- `JAEGER_AGENT_PORT`
- `JAEGER_ENABLED`
- `KEEP_ALIVE_TIMEOUT`
- `LAN_IP`
- `LETTA_AGENT_DEFAULT_EMBEDDING`
- `LETTA_API_KEY` (secret)
- `LETTA_EMBEDDING_MODEL`
- `LETTA_EMBEDDING_PROVIDER`
- `LETTA_URL`
- `LITELLM_CACHE_TTL`
- `LITELLM_CACHING_ENABLED`
- `LITELLM_FALLBACK_MODELS`
- `LITELLM_HOST`
- `LITELLM_LOG_LEVEL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_MAX_TOKENS` (secret)
- `LITELLM_MODEL_FALLBACK_ORDER`
- `LITELLM_PORT`
- `LITELLM_PROXY_REDIS_URL`
- `LLAMA3_1_8B_PARAMS`
- `LOCAL_LLM_ENABLED`
- `LOCAL_LLM_MODELS`
- `LOCAL_LLM_URL`
- `LOG_FILE`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOG_MAX_FILES`
- `LOG_MAX_SIZE`
- `LOKI_ENABLED`
- `LOKI_HOST`
- `LOKI_PORT`
- `LOKI_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MAC_ETHERNET`
- `MAC_WIFI`
- `MAX_BATCH_SIZE`
- `MAX_CONCURRENT_EMBEDDINGS`
- `MAX_CONCURRENT_JOBS`
- `MAX_CONCURRENT_REQUESTS`
- `MAX_SYSTEM_RAM_PERCENT`
- `MAX_VRAM_USAGE_PERCENT`
- `MEM0_EMBEDDING_MODEL`
- `MEM0_EMBEDDING_PROVIDER`
- `MEMORY_BACKEND`
- `MEMORY_CACHE_ONLY`
- `MEMORY_SYNC_INTERVAL`
- `MEMORY_THRESHOLD_PERCENT`
- `METRICS_ENABLED`
- `MIN_BATCH_SIZE`
- `MIN_DISK_SPACE_GB`
- `MIN_FREE_RAM_GB`
- `MIN_FREE_VRAM_GB`
- `MISTRAL_7B_PARAMS`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MOLTBOT_WEB_PORT`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
- `N8N_API_KEY` (secret)
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_URL`
- `NEURAL_BATCH_SIZE`
- `NEURAL_FLASH_ATTENTION`
- `NEURAL_OPTIMIZATION_ENABLED`
- `NEURAL_QUANTIZATION`
- `NEXUS_MCP_PORT`
- `NEXUS_METRICS_PORT`
- `NEXUS_ROUTER_API_KEY` (secret)
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_URL`
- `NODE_ENV`
- `NODE_EXPORTER_PORT`
- `NVIDIA_DRIVER_CAPABILITIES`
- `NVIDIA_EXPORTER_HOST`
- `NVIDIA_EXPORTER_INTERVAL`
- `NVIDIA_EXPORTER_PORT`
- `NVIDIA_GPU_MONITORING`
- `NVIDIA_SMI_INTERVAL`
- `NVIDIA_VISIBLE_DEVICES`
- `NYRA_ENVIRONMENT`
- `NYRA_NODE_ID`
- `NYRA_NODE_TYPE`
- `OLLAMA_3060_HOST`
- `OLLAMA_3060_NUM_GPU`
- `OLLAMA_3060_PORT`
- `OLLAMA_3060_URL`
- `OLLAMA_3090_HOST`
- `OLLAMA_3090_PORT`
- `OLLAMA_3090_URL`
- `OLLAMA_API`
- `OLLAMA_API_BASE_URL`
- `OLLAMA_BASE_URL`
- `OLLAMA_BATCH_SIZE`
- `OLLAMA_BIND`
- `OLLAMA_CONTEXT_SIZE`
- `OLLAMA_DATA_DIR`
- `OLLAMA_DEBUG`
- `OLLAMA_EMBEDDING_MODEL`
- `OLLAMA_ENABLED`
- `OLLAMA_FLASH_ATTENTION`
- `OLLAMA_GPU_LAYERS`
- `OLLAMA_GPU_MEMORY_FRACTION`
- `OLLAMA_HOST`
- `OLLAMA_INFERENCE_TIMEOUT`
- `OLLAMA_INTERNAL_URL`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_KV_CACHE_TYPE`
- `OLLAMA_LOAD_TIMEOUT`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_QUEUE`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MCP_HOST`
- `OLLAMA_MCP_PORT`
- `OLLAMA_MODEL`
- `OLLAMA_MODELS`
- `OLLAMA_MODELS_DIR`
- `OLLAMA_MODELS_PATH`
- `OLLAMA_NUM_CTX`
- `OLLAMA_NUM_GPU`
- `OLLAMA_NUM_GPU_LAYERS`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_NUM_THREAD`
- `OLLAMA_OPTIMIZATION_LEVEL`
- `OLLAMA_ORIGINS`
- `OLLAMA_PORT`
- `OLLAMA_PROXY_TIMEOUT`
- `OLLAMA_ROPE_FREQ_BASE`
- `OLLAMA_ROPE_FREQ_SCALE`
- `OLLAMA_URL`
- `ONNX_API_URL`
- `ONNX_BATCH_SIZE`
- `ONNX_INTERNAL_URL`
- `ONNX_QUANTIZATION`
- `ONNX_RUNTIME_DEVICE`
- `ONNX_RUNTIME_INTER_OP_THREADS`
- `ONNX_RUNTIME_INTRA_OP_THREADS`
- `ONNX_RUNTIME_LOG_LEVEL`
- `ONNX_RUNTIME_PROVIDER`
- `OPENAI_API_KEY` (secret)
- `OPENAI_EMBEDDING_DIMENSIONS`
- `OPENAI_EMBEDDING_MODEL`
- `OPENROUTER_API_KEY` (secret)
- `OPENWEBUI_PORT`
- `ORCHESTRATOR_API_KEY` (secret)
- `ORCHESTRATOR_HOST`
- `ORCHESTRATOR_IP`
- `ORCHESTRATOR_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `PC2_OLLAMA_PORT`
- `PC3_OLLAMA_PORT`
- `PC4_OLLAMA_PORT`
- `PC_NAME`
- `PC_ROLE`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_PORT`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `PREFETCH_THRESHOLD`
- `PRIMARY_MODEL`
- `PROFILE_PORT`
- `PROMETHEUS_ENABLED`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `PROMETHEUS_URL`
- `PUBLIC_BROKER_PORTAL_URL`
- `PUBLIC_LANDING_URL`
- `QUANTIZATION_FORMAT`
- `QUEUE_SIZE`
- `QUEUE_TIMEOUT`
- `RATE_LIMITING_ENABLED`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_REQUESTS_PER_MINUTE`
- `RECOVERY_CHECK_INTERVAL`
- `REDIS_HOST`
- `REDIS_INTERNAL_URL`
- `REDIS_MAXMEMORY`
- `REDIS_MAXMEMORY_POLICY`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REQUEST_TIMEOUT`
- `ROUND_ROBIN_MODELS`
- `RUVECTOR_API_KEY` (secret)
- `RUVECTOR_COORDINATOR`
- `RUVECTOR_EMBEDDING_MODEL`
- `RUVECTOR_EMBEDDING_PROVIDER`
- `RUVECTOR_ENABLED`
- `RUVECTOR_MODE`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `RUVECTOR_URL`
- `SECONDARY_MODEL`
- `SERVICE_REGISTRY_URL`
- `SWAP_ENABLED`
- `SWAP_SIZE_GB`
- `SWARM_COORDINATOR_URL`
- `SWARM_ROLE`
- `SWARM_WORKER_ID`
- `SWARM_WORKER_PORT`
- `SYSTEM_MONITORING`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_AUTH_KEY` (secret)
- `TAILSCALE_ENABLED`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TERTIARY_MODEL`
- `TLS_CERT_PATH` (secret)
- `TLS_ENABLED`
- `TLS_KEY_PATH` (secret)
- `TORCH_BACKENDS_CUDNN_ENABLED`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_URL`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_USER`
- `UNHEALTHY_THRESHOLD`
- `VERBOSE_GPU_LOGGING`
- `VLLM_5090_URL`
- `VRAM_GB`
- `WAN_IP`
- `WEBHOOK_URL` (secret)
- `WORKER_3060_API_KEY` (secret)
- `WORKER_3060_MAX_CONCURRENT`
- `WORKER_3060_MODELS`
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3060_PRIMARY_USE`
- `WORKER_3060_PRIORITY`
- `WORKER_3060_SPECIALIZATION`
- `WORKER_3060_URL`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_5090_MODEL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_API_KEY` (secret)
- `WORKER_API_PORT`
- `WORKER_CAPABILITIES`
- `WORKER_ID`
- `WORKER_METRICS_PORT`
- `WORKER_NAME`
- `WORKER_ROLE`
- `WORKER_RTX3060_DEV_UI_PORT`
- `WORKER_RTX3060_GPU_MONITOR_PORT`
- `WORKER_RTX3060_JUPYTER_PORT`
- `WORKER_RTX3060_MLFLOW_PORT`
- `WORKER_RTX3060_OPENAI_BASE_URL`
- `WORKER_RTX3060_VSCODE_PORT`
- `WORKER_SPECIALIZATION`
- `WORKER_THREADS`
- `WORKER_TYPE`
- `XENOVA_API_URL`
- `XENOVA_BATCH_SIZE`
- `XENOVA_MODEL`
- `ZEP_EMBEDDING_MODEL`

### worker-rtx3090ti
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `AGENTDB_ENABLED`
- `AGENTDB_PATH`
- `AGENTDB_READ_ONLY`
- `AGENTDB_SYNC_FROM`
- `AIDEFENCE_ENABLED`
- `ALERT_EMAIL_ENABLED`
- `ALERT_GPU_POWER_THRESHOLD_W`
- `ALERT_GPU_TEMP_THRESHOLD_C`
- `ALERT_QUEUE_DEPTH_THRESHOLD`
- `ALERT_RESPONSE_TIME_THRESHOLD_MS`
- `ALERT_WEBHOOK_URL` (secret)
- `ALLOW_ORCHESTRATOR_IP`
- `ALLOW_PC1_IP`
- `ALLOW_PC2_IP`
- `ALLOW_PC3_IP`
- `ANTHROPIC_API_KEY` (secret)
- `API_KEY_PC4` (secret)
- `API_SECRET` (secret)
- `ARCHON_OS_PORT`
- `ARCHON_SERVER_URL`
- `AUTH_SERVICE_URL` (secret)
- `AUTO_RECOVERY_ENABLED`
- `BACKUP_INTERVAL_HOURS`
- `BACKUP_MODELS`
- `BACKUP_PATH`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_SCHEDULE`
- `BATCH_SIZE`
- `BATCH_TIMEOUT_MS`
- `BATCH_WAIT_TIMEOUT_MS`
- `CACHE_EVICTION_POLICY`
- `CACHE_SIZE_PERCENT`
- `CADVISOR_PORT`
- `CHECKPOINT_ENABLED`
- `CHECKPOINT_INTERVAL_STEPS`
- `CLAUDE_FLOW_CACHE_SIZE`
- `CLAUDE_FLOW_DEBUG`
- `CLAUDE_FLOW_LOG_LEVEL`
- `CLAUDE_FLOW_MAX_AGENTS`
- `CLAUDE_FLOW_MAX_CONCURRENT_TASKS`
- `CLAUDE_FLOW_MEMORY_LIMIT`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_VERSION`
- `CLAUDE_FLOW_WORKER_THREADS`
- `CLEANUP_CHECKPOINTS_DAYS`
- `CLEANUP_OLD_MODELS_DAYS`
- `CLEAR_CACHE_INTERVAL`
- `CLOUDFLARED_TUNNEL_ID`
- `CLOUDFLARED_TUNNEL_NAME`
- `CLOUDFLARED_TUNNEL_TOKEN` (secret)
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX3090TI`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI`
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI` (secret)
- `CODELLAMA_34B_PARAMS`
- `COMPILATION_TIMEOUT`
- `COMPOSE_DOCKER_CLI_BUILD`
- `COMPOSE_FILE`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `CONNECTION_POOL_SIZE`
- `CONSUL_CLIENT_ADDR`
- `CONSUL_ENABLED`
- `CONSUL_SERVER_ADDR`
- `CPU_LIMIT`
- `CPU_THRESHOLD_PERCENT`
- `CUDA_DEVICE_ORDER`
- `CUDA_VERSION`
- `CUDA_VISIBLE_DEVICES`
- `DEBUG`
- `DEBUG_MODE`
- `DEREGISTRATION_CRITICAL_SERVICE_AFTER`
- `DIFY_API_KEY` (secret)
- `DIFY_URL`
- `DISCOVERY_INTERVAL`
- `DISK_THRESHOLD_PERCENT`
- `DISTRIBUTED_INFERENCE_ENABLED`
- `DISTRIBUTE_TO_PC2_WEIGHT`
- `DISTRIBUTE_TO_PC3_WEIGHT`
- `DOCKER_BUILDKIT`
- `DOCKER_SUBNET_RTX3090`
- `DYNAMIC_BATCHING_ENABLED`
- `ENABLE_ALERTS`
- `ENABLE_AUTO_FAILOVER`
- `ENABLE_CLOUDFLARED`
- `ENABLE_FLASH_ATTENTION_2`
- `ENABLE_GPU_METRICS`
- `ENABLE_GPU_POWER_MONITORING`
- `ENABLE_GPU_THERMAL_MONITORING`
- `ENABLE_HEALTH_MONITOR`
- `ENABLE_INFERENCE_PROFILING`
- `ENABLE_JIT_COMPILATION`
- `ENABLE_KV_CACHE`
- `ENABLE_LOG_SHIPPING`
- `ENABLE_MEMORY_OPTIMIZATION`
- `ENABLE_MULTI_GPU_SYNC`
- `ENABLE_PC2_FALLBACK`
- `ENABLE_PC3_FALLBACK`
- `ENABLE_PREFETCHING`
- `ENABLE_PROFILING`
- `ENABLE_QUANTIZATION`
- `ENABLE_REQUEST_PRIORITY`
- `ENABLE_SPECULATIVE_DECODING`
- `ENABLE_TAILSCALE`
- `ENABLE_TLS`
- `ENABLE_TRACING`
- `EXPORT_METRICS`
- `FAILOVER_RETRY_INTERVAL`
- `FAILOVER_TIMEOUT`
- `FALLBACK_MODELS`
- `FIREWALL_ENABLED`
- `FLASH_ATTENTION_BACKEND`
- `FP8_QUANTIZATION`
- `GOOGLE_API_KEY` (secret)
- `GPU_3060_TAILSCALE_IP`
- `GPU_3090_TAILSCALE_IP`
- `GPU_5090_TAILSCALE_IP`
- `GPU_ALLOW_GROWTH`
- `GPU_CLOCK_SPEED_LIMIT`
- `GPU_COMPUTE_CAPABILITY`
- `GPU_CUDA_DEVICE`
- `GPU_ENABLED`
- `GPU_MAX_BATCH_SIZE`
- `GPU_MAX_CONCURRENT`
- `GPU_MEMORY_FRACTION`
- `GPU_MEMORY_UTIL`
- `GPU_MODEL`
- `GPU_POWER_LIMIT`
- `GPU_PRIORITY`
- `GPU_THERMAL_THRESHOLD_C`
- `GPU_VRAM`
- `GPU_VRAM_GB`
- `GPU_WORKER_3090_ENABLED`
- `GPU_WORKER_3090_GPU`
- `GPU_WORKER_3090_MAX_CONCURRENT`
- `GPU_WORKER_3090_MODEL`
- `GPU_WORKER_3090_MODELS`
- `GPU_WORKER_3090_PRIORITY`
- `GPU_WORKER_3090_SPECIALIZATION`
- `GPU_WORKER_3090_URL`
- `GPU_WORKER_3090_VRAM`
- `GPU_WORKER_ID`
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_ADMIN_USER`
- `GRAFANA_API_KEY` (secret)
- `GRAFANA_PORT`
- `GRAFANA_URL`
- `HEALTH_CHECK_ENABLED`
- `HEALTH_CHECK_INTERVAL`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_START_PERIOD`
- `HEALTH_CHECK_TIMEOUT`
- `HF_TOKEN` (secret)
- `HOSTNAME`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_TOKEN` (secret)
- `KEEP_ALIVE_TIMEOUT`
- `KEEP_LOCAL_WEIGHT`
- `LAN_IP`
- `LB_HEALTH_CHECK_INTERVAL`
- `LB_REQUEST_QUEUE_SIZE`
- `LB_REQUEST_TIMEOUT`
- `LB_STRATEGY`
- `LITELLM_CACHE_TTL`
- `LITELLM_CACHING_ENABLED`
- `LITELLM_FALLBACK_MODELS`
- `LITELLM_HOST`
- `LITELLM_LOG_LEVEL`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_MAX_TOKENS` (secret)
- `LITELLM_MODEL_FALLBACK_ORDER`
- `LITELLM_PORT`
- `LITELLM_PROXY_REDIS_URL`
- `LLAMA3_1_70B_PARAMS`
- `LMCACHE_BACKEND`
- `LMCACHE_CHUNK_SIZE`
- `LMCACHE_ENABLED`
- `LMCACHE_MAX_SIZE`
- `LMCACHE_REDIS_URL`
- `LMCACHE_TTL`
- `LM_CACHE_PORT`
- `LOCAL_LB_ENABLED`
- `LOCAL_LB_HOST`
- `LOCAL_LB_PORT`
- `LOCAL_LLM_ENABLED`
- `LOCAL_LLM_MODELS`
- `LOCAL_LLM_URL`
- `LOG_CACHE_HITS`
- `LOG_INFERENCE_TIME`
- `LOG_LEVEL`
- `LOG_MAX_FILES`
- `LOG_MAX_SIZE`
- `LOG_PATH`
- `LOG_REQUEST_DETAILS`
- `LOKI_INGESTION_RATE_MB`
- `LOKI_PORT`
- `LOKI_RETENTION_PERIOD`
- `LOKI_URL`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MAC_ETHERNET`
- `MAC_WIFI`
- `MAX_BATCH_SIZE`
- `MAX_CONCURRENT_EMBEDDINGS`
- `MAX_CONCURRENT_INFERENCES`
- `MAX_CONCURRENT_REQUESTS`
- `MAX_MODEL_LEN`
- `MAX_SYSTEM_RAM_PERCENT`
- `MAX_VRAM_USAGE_PERCENT`
- `MEMORY_BACKEND`
- `MEMORY_CACHE_ONLY`
- `MEMORY_LIMIT`
- `MEMORY_SYNC_INTERVAL`
- `MEMORY_THRESHOLD_PERCENT`
- `METRICS_ENABLED`
- `METRICS_EXPORT_INTERVAL`
- `METRICS_RETENTION_DAYS`
- `MIN_DISK_SPACE_GB`
- `MIN_FREE_RAM_GB`
- `MIN_FREE_VRAM_GB`
- `MIXTRAL_8X7B_PARAMS`
- `MODEL_AFFINITY_ENABLED`
- `MODEL_CACHE_DIR`
- `MODEL_CACHE_SIZE_GB`
- `MODEL_DTYPE`
- `MODEL_NAME`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MOLTBOT_WEB_PORT`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
- `N8N_API_KEY` (secret)
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_URL`
- `NETWORK_DRIVER`
- `NETWORK_NAME`
- `NEURAL_BATCH_SIZE`
- `NEURAL_FLASH_ATTENTION`
- `NEURAL_OPTIMIZATION_ENABLED`
- `NEURAL_QUANTIZATION`
- `NEXUS_API_URL`
- `NEXUS_MCP_PORT`
- `NEXUS_METRICS_PORT`
- `NEXUS_METRICS_URL`
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_URL`
- `NODE_ENV`
- `NODE_EXPORTER_PORT`
- `NVIDIA_DRIVER_CAPABILITIES`
- `NVIDIA_EXPORTER_HOST`
- `NVIDIA_EXPORTER_INTERVAL`
- `NVIDIA_EXPORTER_PORT`
- `NVIDIA_GPU_MONITORING`
- `NVIDIA_SMI_INTERVAL`
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_3060_URL`
- `OLLAMA_3090_HOST`
- `OLLAMA_3090_PORT`
- `OLLAMA_3090_URL`
- `OLLAMA_DEBUG`
- `OLLAMA_FLASH_ATTENTION`
- `OLLAMA_GPU_LAYERS`
- `OLLAMA_GPU_MEMORY_FRACTION`
- `OLLAMA_HOST`
- `OLLAMA_INFERENCE_TIMEOUT`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_LOAD_TIMEOUT`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MODELS`
- `OLLAMA_MODELS_DIR`
- `OLLAMA_MODELS_PATH`
- `OLLAMA_NUM_CTX`
- `OLLAMA_NUM_GPU`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_OPTIMIZATION_LEVEL`
- `OLLAMA_PORT`
- `OLLAMA_ROPE_FREQ_BASE`
- `OLLAMA_ROPE_FREQ_SCALE`
- `OPENAI_API_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENWEBUI_PORT`
- `ORCHESTRATOR_API_KEY` (secret)
- `ORCHESTRATOR_HOST`
- `ORCHESTRATOR_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `PC2_LOAD_THRESHOLD`
- `PC3_LOAD_THRESHOLD`
- `PC3_VLLM_PORT`
- `PC4_VLLM_PORT`
- `PC_NAME`
- `PC_ROLE`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_PORT`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `PREFETCH_THRESHOLD`
- `PRIMARY_MODEL`
- `PRIMARY_MODEL_SIZE`
- `PRIMARY_MODEL_VRAM`
- `PRIORITY_QUEUE_DEPTH`
- `PROFILE_PORT`
- `PROJECT_ENV`
- `PROJECT_NAME`
- `PROJECT_REGION`
- `PROMETHEUS_ENABLED`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `PROMETHEUS_RETENTION`
- `PROMETHEUS_URL`
- `PUBLIC_BROKER_PORTAL_URL`
- `PUBLIC_LANDING_URL`
- `QUANTIZATION_FORMAT`
- `QWEN2_5_32B_PARAMS`
- `RAM_RESERVED_FOR_OS_GB`
- `RATE_LIMITING_ENABLED`
- `RECOVERY_CHECK_INTERVAL`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REQUEST_TIMEOUT`
- `RTX3090TI_HOST`
- `RTX3090TI_LAN_IP`
- `RUVECTOR_COORDINATOR`
- `RUVECTOR_ENABLED`
- `RUVECTOR_MODE`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `SECONDARY_MODEL`
- `SECONDARY_MODEL_SIZE`
- `SECONDARY_MODEL_VRAM`
- `SERVICE_DISCOVERY_ENABLED`
- `SERVICE_REGISTRY_URL`
- `SPECULATIVE_TOKENS` (secret)
- `SWAP_ENABLED`
- `SWAP_SIZE_GB`
- `SWARM_COORDINATOR_URL`
- `SWARM_ROLE`
- `SWARM_WORKER_ID`
- `SWARM_WORKER_PORT`
- `SYSTEM_MONITORING`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_AUTH_KEY` (secret)
- `TAILSCALE_ENABLED`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TAILSCALE_TAGS`
- `TLS_CERT_PATH` (secret)
- `TLS_KEY_PATH` (secret)
- `TP_SIZE`
- `TRACK_INFERENCE_TIME`
- `TRACK_MODEL_LOADING_TIME`
- `TRACK_QUEUE_DEPTH`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTYCRM_URL`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_USER`
- `UNHEALTHY_THRESHOLD`
- `VERBOSE_GPU_LOGGING`
- `VERBOSE_LOGGING`
- `VERBOSE_VLLM_LOGGING`
- `VLLM_5090_URL`
- `VLLM_BIND`
- `VLLM_DISABLE_LOG_REQUESTS`
- `VLLM_DISABLE_LOG_STATS`
- `VLLM_ENABLED`
- `VLLM_ENABLE_CHUNKED_PREFILL`
- `VLLM_ENABLE_LOGPROBS`
- `VLLM_ENABLE_PREFIX_CACHING`
- `VLLM_ENFORCE_EAGER_EXECUTION`
- `VLLM_GPU_MEMORY`
- `VLLM_GPU_MEMORY_UTILIZATION`
- `VLLM_HOST`
- `VLLM_KV_CACHE_DTYPE`
- `VLLM_LOGPROBS_SOFT_CAP`
- `VLLM_MAX_MODEL_LEN`
- `VLLM_MAX_NUM_BATCHED_TOKENS` (secret)
- `VLLM_MODEL`
- `VLLM_MODELS`
- `VLLM_PIPELINE_PARALLEL_SIZE`
- `VLLM_PORT`
- `VLLM_REQUEST_TIMEOUT`
- `VLLM_TENSOR_PARALLEL`
- `VLLM_TENSOR_PARALLEL_SIZE`
- `VRAM_RESERVED_FOR_SYSTEM_GB`
- `WAN_IP`
- `WEBHOOK_URL` (secret)
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_3090_API_KEY` (secret)
- `WORKER_3090_MAX_CONCURRENT`
- `WORKER_3090_MODELS`
- `WORKER_3090_PRIMARY_USE`
- `WORKER_3090_PRIORITY`
- `WORKER_3090_SPECIALIZATION`
- `WORKER_3090_URL`
- `WORKER_5090_MODEL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_CAPABILITIES`
- `WORKER_ID`
- `WORKER_NAME`
- `WORKER_RTX3090TI_OPENAI_BASE_URL`
- `WORKER_RTX3090_DEV_UI_PORT`
- `WORKER_RTX3090_GPU_MONITOR_PORT`
- `WORKER_RTX3090_JUPYTER_PORT`
- `WORKER_RTX3090_MLFLOW_PORT`
- `WORKER_RTX3090_VSCODE_PORT`
- `WORKER_SPECIALIZATION`
- `WORKER_TYPE`

### worker-rtx5090
- `ACTIVEPIECES_ENCRYPTION_KEY` (secret)
- `ACTIVEPIECES_JWT_SECRET` (secret)
- `ACTIVEPIECES_PORT`
- `AGENTDB_ENABLED`
- `AGENTDB_PATH`
- `AGENTDB_READ_ONLY`
- `AGENTDB_SYNC_FROM`
- `AIDEFENCE_ENABLED`
- `ALERT_THRESHOLD_GPU_TEMP`
- `ALERT_THRESHOLD_INFERENCE_TIME`
- `ALERT_THRESHOLD_VRAM_USAGE`
- `ALLOW_ORCHESTRATOR_IP`
- `ALLOW_PC1_IP`
- `ALLOW_PC2_IP`
- `ALLOW_PC4_IP`
- `ANTHROPIC_API_KEY` (secret)
- `API_KEY_PC3` (secret)
- `API_SECRET` (secret)
- `ARCHON_OS_PORT`
- `ARCHON_SERVER_URL`
- `AUTH_SERVICE_URL` (secret)
- `AUTO_RECOVERY_ENABLED`
- `BACKUP_INTERVAL_HOURS`
- `BACKUP_MODELS`
- `BACKUP_PATH`
- `BACKUP_RETENTION_DAYS`
- `BATCH_TIMEOUT_MS`
- `BATCH_WAIT_TIMEOUT_MS`
- `CADVISOR_PORT`
- `CAMPAIGN_ENGINE_URL`
- `CHECKPOINT_ENABLED`
- `CHECKPOINT_INTERVAL_STEPS`
- `CHECKPOINT_RETENTION`
- `CHECK_INTERVAL`
- `CLAUDE_FLOW_CACHE_SIZE`
- `CLAUDE_FLOW_DEBUG`
- `CLAUDE_FLOW_LOG_LEVEL`
- `CLAUDE_FLOW_MAX_AGENTS`
- `CLAUDE_FLOW_MAX_CONCURRENT_TASKS`
- `CLAUDE_FLOW_MEMORY_LIMIT`
- `CLAUDE_FLOW_MODE`
- `CLAUDE_FLOW_VERSION`
- `CLAUDE_FLOW_WORKER_THREADS`
- `CLEANUP_CHECKPOINTS_DAYS`
- `CLEANUP_OLD_MODELS_DAYS`
- `CLEAR_CACHE_INTERVAL`
- `CLOUDFLARED_HOSTNAME`
- `CLOUDFLARED_LITELLM_HOSTNAME`
- `CLOUDFLARED_TOKEN` (secret)
- `CLOUDFLARED_TUNNEL_NAME`
- `CLOUDFLARE_TUNNEL_ID_WORKER_RTX5090`
- `CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090`
- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR` (secret)
- `CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090` (secret)
- `CODELLAMA_70B_PARAMS`
- `COMPILATION_TIMEOUT`
- `COMPOSE_DOCKER_CLI_BUILD`
- `COMPOSE_PROFILES`
- `COMPOSE_PROJECT_NAME`
- `CONNECTION_POOL_SIZE`
- `CONSUL_CLIENT_ADDR`
- `CONSUL_ENABLED`
- `CONSUL_SERVER_ADDR`
- `CONTEXT_OVERLAP`
- `CPU_THRESHOLD_PERCENT`
- `CUDA_DEVICE_ORDER`
- `CUDA_VISIBLE_DEVICES`
- `DEBUG_MODE`
- `DISK_THRESHOLD_PERCENT`
- `DISTRIBUTED_FINETUNING_ENABLED`
- `DISTRIBUTED_INFERENCE_ENABLED`
- `DOCKER_BUILDKIT`
- `DOCKER_CPU_LIMIT`
- `DOCKER_MEMORY_LIMIT`
- `DOCKER_SUBNET_RTX5090`
- `DOCUMENT_API_URL`
- `DYNAMIC_BATCHING_ENABLED`
- `EMBEDDING_BATCH_SIZE`
- `EMBEDDING_DEVICE`
- `EMBEDDING_MODEL`
- `ENABLE_FLASH_ATTENTION_2`
- `ENABLE_GPU_POWER_MONITORING`
- `ENABLE_GPU_THERMAL_MONITORING`
- `ENABLE_GRADIENT_ACCUMULATION`
- `ENABLE_JIT_COMPILATION`
- `ENABLE_MEMORY_OPTIMIZATION`
- `ENABLE_MULTI_GPU_SYNC`
- `ENABLE_NSYS_PROFILING`
- `ENABLE_PREFETCHING`
- `ENABLE_PROFILING`
- `ENABLE_QUANTIZATION`
- `ENABLE_TLS`
- `EVENT_SERVER_HTTP_PORT`
- `EVENT_SERVER_WS_PORT`
- `FINETUNING_API_KEY` (secret)
- `FINETUNING_BATCH_SIZE`
- `FINETUNING_DATASET_PATH`
- `FINETUNING_ENABLED`
- `FINETUNING_EPOCHS`
- `FINETUNING_HOST`
- `FINETUNING_LEARNING_RATE`
- `FINETUNING_LOG_FREQUENCY`
- `FINETUNING_MAX_DATASET_SIZE_GB`
- `FINETUNING_MAX_STEPS`
- `FINETUNING_OUTPUT_PATH`
- `FINETUNING_PORT`
- `FINETUNING_SAVE_FREQUENCY`
- `FINETUNING_WARMUP_STEPS`
- `FIREWALL_ENABLED`
- `FLASH_ATTENTION_BACKEND`
- `FP8_QUANTIZATION`
- `GOOGLE_API_KEY` (secret)
- `GPU_3060_TAILSCALE_IP`
- `GPU_3090_TAILSCALE_IP`
- `GPU_5090_TAILSCALE_IP`
- `GPU_ALLOW_GROWTH`
- `GPU_CLOCK_SPEED_LIMIT`
- `GPU_COMPUTE_CAPABILITY`
- `GPU_CUDA_DEVICE`
- `GPU_ENABLED`
- `GPU_MAX_BATCH_SIZE`
- `GPU_MAX_CONCURRENT`
- `GPU_MEMORY_CLOCK`
- `GPU_MEMORY_FRACTION`
- `GPU_MEMORY_UTIL`
- `GPU_MODEL`
- `GPU_POWER_LIMIT`
- `GPU_PRIORITY`
- `GPU_THERMAL_THRESHOLD_C`
- `GPU_TYPE`
- `GPU_VRAM`
- `GPU_VRAM_GB`
- `GPU_WORKER_5090_ENABLED`
- `GPU_WORKER_5090_GPU`
- `GPU_WORKER_5090_MAX_CONCURRENT`
- `GPU_WORKER_5090_MODEL`
- `GPU_WORKER_5090_MODELS`
- `GPU_WORKER_5090_PRIORITY`
- `GPU_WORKER_5090_SPECIALIZATION`
- `GPU_WORKER_5090_URL`
- `GPU_WORKER_5090_VRAM`
- `GPU_WORKER_ID`
- `GRADIENT_ACCUMULATION_STEPS`
- `GRADIENT_CHECKPOINTING`
- `GRAFANA_ADMIN_PASSWORD` (secret)
- `GRAFANA_PORT`
- `GRAFANA_URL`
- `HEALTH_CHECK_PORT`
- `HEALTH_CHECK_RETRIES`
- `HEALTH_CHECK_TIMEOUT`
- `HF_TOKEN` (secret)
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `INFISICAL_PROJECT_ID`
- `KEEP_ALIVE_TIMEOUT`
- `LAN_IP`
- `LEAD_API_URL`
- `LITELLM_DATABASE_URL`
- `LITELLM_LOG`
- `LITELLM_MASTER_KEY` (secret)
- `LITELLM_PORT`
- `LLAMA3_1_70B_PARAMS`
- `LMCACHE_BACKEND`
- `LMCACHE_CHUNK_SIZE`
- `LMCACHE_ENABLED`
- `LMCACHE_MAX_SIZE`
- `LMCACHE_REDIS_URL`
- `LMCACHE_TTL`
- `LM_CACHE_PORT`
- `LOAD_BALANCE_MODELS`
- `LOCAL_LLM_ENABLED`
- `LOCAL_LLM_MODELS`
- `LOCAL_LLM_URL`
- `LOG_FILE`
- `LOG_FORMAT`
- `LOG_LEVEL`
- `LOKI_PORT`
- `LOKI_URL`
- `LONG_CONTEXT_WINDOW`
- `LORA_ALPHA`
- `LORA_DROPOUT`
- `LORA_ENABLED`
- `LORA_R`
- `LORA_TARGET_MODULES`
- `MACHINE_HOSTNAME`
- `MACHINE_IP_ETHERNET`
- `MACHINE_IP_TAILSCALE`
- `MACHINE_NAME`
- `MACHINE_ROLE`
- `MAC_ETHERNET`
- `MAC_WIFI`
- `MAX_BATCH_SIZE`
- `MAX_CONCURRENT_EMBEDDINGS`
- `MAX_CONCURRENT_FINETUNES`
- `MAX_CONCURRENT_INFERENCES`
- `MAX_MODEL_LEN`
- `MAX_SYSTEM_RAM_PERCENT`
- `MAX_VRAM_USAGE_PERCENT`
- `MEMORY_BACKEND`
- `MEMORY_CACHE_ONLY`
- `MEMORY_SERVICE_ENABLED`
- `MEMORY_SERVICE_HOST`
- `MEMORY_SERVICE_PORT`
- `MEMORY_SYNC_INTERVAL`
- `MEMORY_THRESHOLD_PERCENT`
- `METRICS_ENABLED`
- `MIN_DISK_SPACE_GB`
- `MIN_FREE_RAM_GB`
- `MIN_FREE_VRAM_GB`
- `MIXED_PRECISION`
- `MIXTRAL_8X22B_PARAMS`
- `MODEL_CACHE_DIR`
- `MODEL_CACHE_SIZE_GB`
- `MODEL_DTYPE`
- `MODEL_MANAGER_PORT`
- `MODEL_NAME`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MOLTBOT_WEB_PORT`
- `MONGO_PORT`
- `MONGO_ROOT_PASSWORD` (secret)
- `MONGO_ROOT_USER`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_HOST`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `NCCL_DEBUG`
- `NCCL_TIMEOUT`
- `NEURAL_BATCH_SIZE`
- `NEURAL_FLASH_ATTENTION`
- `NEURAL_OPTIMIZATION_ENABLED`
- `NEURAL_QUANTIZATION`
- `NEXUS_ADMIN_TOKEN` (secret)
- `NEXUS_JWT_SECRET` (secret)
- `NEXUS_MCP_PORT`
- `NEXUS_METRICS_PORT`
- `NEXUS_ROUTER_PORT`
- `NEXUS_ROUTER_URL`
- `NODE_ENV`
- `NVIDIA_DRIVER_CAPABILITIES`
- `NVIDIA_EXPORTER_HOST`
- `NVIDIA_EXPORTER_INTERVAL`
- `NVIDIA_EXPORTER_PORT`
- `NVIDIA_GPU_MONITORING`
- `NVIDIA_SMI_INTERVAL`
- `NVIDIA_VISIBLE_DEVICES`
- `OLLAMA_3060_URL`
- `OLLAMA_3090_URL`
- `OLLAMA_FLASH_ATTENTION`
- `OLLAMA_GPU_LAYERS`
- `OLLAMA_GPU_MEMORY_FRACTION`
- `OLLAMA_HOST`
- `OLLAMA_INFERENCE_TIMEOUT`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_LOAD_TIMEOUT`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_MAX_VRAM`
- `OLLAMA_MODELS`
- `OLLAMA_MODELS_DIR`
- `OLLAMA_NUM_GPU`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_OPTIMIZATION_LEVEL`
- `OLLAMA_PORT`
- `OLLAMA_ROPE_FREQ_BASE`
- `OLLAMA_ROPE_FREQ_SCALE`
- `OPENAI_API_KEY` (secret)
- `OPENROUTER_API_KEY` (secret)
- `OPENWEBUI_PORT`
- `ORCHESTRATOR_API_KEY` (secret)
- `ORCHESTRATOR_HOST`
- `ORCHESTRATOR_PORT`
- `ORCHESTRATOR_TAILSCALE_IP`
- `ORCHESTRATOR_URL`
- `PC2_INFERENCE_FALLBACK`
- `PC3_VLLM_PORT`
- `PC4_INFERENCE_FALLBACK`
- `PC4_VLLM_PORT`
- `PC_NAME`
- `PC_ROLE`
- `PERF_MONITOR_PORT`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD` (secret)
- `POSTGRES_PORT`
- `POSTGRES_URL`
- `POSTGRES_USER`
- `PREFETCH_THRESHOLD`
- `PRIMARY_MODELS`
- `PROFILE_PORT`
- `PROMETHEUS_ENABLED`
- `PROMETHEUS_PORT`
- `PROMETHEUS_PUSH_GATEWAY`
- `PUBLIC_ADMIN_URL`
- `PUBLIC_BROKER_PORTAL_URL`
- `PUBLIC_LANDING_URL`
- `PUBLIC_N8N_URL`
- `QUANTIZATION_FORMAT`
- `QUOTE_API_URL`
- `QWEN2_5_72B_PARAMS`
- `RAG_ENABLED`
- `RAG_SIMILARITY_THRESHOLD`
- `RAG_TOP_K`
- `RAM_RESERVED_FOR_OS_GB`
- `RATE_COMPARISON_API_URL`
- `RATE_LIMITING_ENABLED`
- `RECOVERY_CHECK_INTERVAL`
- `REDIS_PASSWORD` (secret)
- `REDIS_PORT`
- `REQUEST_TIMEOUT`
- `RUVECTOR_COORDINATOR`
- `RUVECTOR_ENABLED`
- `RUVECTOR_MODE`
- `RUVECTOR_PGADMIN_PORT`
- `RUVECTOR_PORT`
- `RUVECTOR_POSTGRES_DB`
- `RUVECTOR_POSTGRES_PASSWORD` (secret)
- `RUVECTOR_POSTGRES_PORT`
- `RUVECTOR_POSTGRES_USER`
- `SECURITY_SERVICE_URL`
- `SENDGRID_API_KEY` (secret)
- `SENDGRID_FROM_EMAIL`
- `SERVICES`
- `SERVICE_REGISTRY_URL`
- `SLIDING_WINDOW_SIZE`
- `SPECIALIZATION`
- `SWAP_ENABLED`
- `SWARM_COORDINATOR_URL`
- `SWARM_ROLE`
- `SWARM_WORKER_ID`
- `SWARM_WORKER_PORT`
- `SYSTEM_MONITORING`
- `TAILSCALE_AUTHKEY` (secret)
- `TAILSCALE_ENABLED`
- `TAILSCALE_HOSTNAME`
- `TAILSCALE_IP`
- `TAILSCALE_KEY` (secret)
- `TENSORBOARD_ENABLED`
- `TENSORBOARD_PORT`
- `TLS_CERT_PATH` (secret)
- `TLS_KEY_PATH` (secret)
- `TORCH_DISTRIBUTED_DEBUG`
- `TP_SIZE`
- `TRACK_INFERENCE_TIME`
- `TRACK_MODEL_LOADING_TIME`
- `TRACK_QUEUE_DEPTH`
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_MCP_PORT`
- `TWENTYCRM_PORT`
- `TWENTY_ENCRYPTION_SECRET` (secret)
- `TWENTY_JWT_SECRET` (secret)
- `TWENTY_PASSWORD_SALT` (secret)
- `TWENTY_POSTGRES_DB`
- `TWENTY_POSTGRES_PASSWORD` (secret)
- `TWENTY_POSTGRES_USER`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `TWILIO_PHONE_NUMBER`
- `VECTOR_DB_COLLECTION`
- `VECTOR_DB_HOST`
- `VECTOR_DB_PORT`
- `VERBOSE_GPU_LOGGING`
- `VERBOSE_VLLM_LOGGING`
- `VITE_EVENT_SERVER_HTTP_URL`
- `VITE_EVENT_SERVER_URL`
- `VLLM_5090_URL`
- `VLLM_BIND`
- `VLLM_DISABLE_LOG_REQUESTS`
- `VLLM_DISABLE_LOG_STATS`
- `VLLM_ENABLED`
- `VLLM_ENABLE_CHUNKED_PREFILL`
- `VLLM_ENABLE_LOGPROBS`
- `VLLM_ENABLE_PREFIX_CACHING`
- `VLLM_ENFORCE_EAGER_EXECUTION`
- `VLLM_GPU_MEMORY`
- `VLLM_GPU_MEMORY_UTILIZATION`
- `VLLM_HOST`
- `VLLM_KV_CACHE_DTYPE`
- `VLLM_LOGPROBS_SOFT_CAP`
- `VLLM_MAX_MODEL_LEN`
- `VLLM_MAX_NUM_BATCHED_TOKENS` (secret)
- `VLLM_MODEL`
- `VLLM_MODELS`
- `VLLM_PIPELINE_PARALLEL_SIZE`
- `VLLM_PORT`
- `VLLM_REQUEST_TIMEOUT`
- `VLLM_TENSOR_PARALLEL`
- `VLLM_TENSOR_PARALLEL_SIZE`
- `VRAM_GB`
- `VRAM_RESERVED_FOR_SYSTEM_GB`
- `WAN_IP`
- `WEBHOOK_URL` (secret)
- `WORKER_3060_OLLAMA_PORT`
- `WORKER_3090TI_MODEL`
- `WORKER_3090TI_VLLM_PORT`
- `WORKER_5090_API_KEY` (secret)
- `WORKER_5090_MAX_CONCURRENT`
- `WORKER_5090_MODEL`
- `WORKER_5090_MODELS`
- `WORKER_5090_PRIMARY_USE`
- `WORKER_5090_PRIORITY`
- `WORKER_5090_SPECIALIZATION`
- `WORKER_5090_URL`
- `WORKER_5090_VLLM_PORT`
- `WORKER_CAPABILITIES`
- `WORKER_ID`
- `WORKER_NAME`
- `WORKER_ROLE`
- `WORKER_RTX5090_DEV_UI_PORT`
- `WORKER_RTX5090_GPU_MONITOR_PORT`
- `WORKER_RTX5090_JUPYTER_PORT`
- `WORKER_RTX5090_MLFLOW_PORT`
- `WORKER_RTX5090_OPENAI_BASE_URL`
- `WORKER_RTX5090_VSCODE_PORT`
- `WORKER_SPECIALIZATION`

## App-specific secret/env lists (`apps/*`)

### apps/admin
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_ARCHON_UI_URL`
- `NEXT_PUBLIC_GRAFANA_URL`
- `NEXT_PUBLIC_NEXUS_URL`
- `NEXT_PUBLIC_PORTAINER_URL`
- `NEXT_PUBLIC_TAILSCALE_DASHBOARD_URL`
- `NODE_ENV`
- `PORT`

### apps/docs
- `NEXT_PUBLIC_DOCS_BASE_URL`
- `NEXT_PUBLIC_SUPPORT_EMAIL`
- `NODE_ENV`
- `PORT`

### apps/landing
- `NEXT_PUBLIC_QUOTE_API_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_TWENTYCRM_URL`
- `NEXT_PUBLIC_WEBAPP_URL`
- `NODE_ENV`
- `NODE_VERSION`
- `PORT`

### apps/shared
- `ADMIN_API_KEY` (secret)
- `ADMIN_DASHBOARD_URL`
- `ASSET_CDN_URL`
- `AUDIT_LOG_ENABLED`
- `AWS_ACCESS_KEY_ID` (secret)
- `AWS_REGION`
- `AWS_SECRET_ACCESS_KEY` (secret)
- `BACKUP_ENABLED`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_S3_BUCKET`
- `BACKUP_SCHEDULE`
- `CAMPAIGN_ENGINE_URL`
- `CPU_LIMIT`
- `CUSTOM_NODES_PATH`
- `DB_TYPE`
- `DEBUG_MODE`
- `DEFAULT_COMPLIANCE_EMAIL`
- `DEFAULT_LOAN_OFFICER_EMAIL`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_FROM_NAME`
- `EQUIFAX_API_KEY` (secret)
- `EXPERIAN_API_KEY` (secret)
- `FANNIE_MAE_API_KEY` (secret)
- `FREDDIE_MAC_API_KEY` (secret)
- `GENERIC_TIMEZONE`
- `HMDA_LAR_SUBMISSION_ENABLED`
- `HMDA_REPORTING_ENABLED`
- `HMDA_REPORTING_KEY` (secret)
- `LANG`
- `LC_ALL`
- `LEAD_CAPTURE_URL`
- `LEAD_SCORE_THRESHOLD_A`
- `LEAD_SCORE_THRESHOLD_B`
- `LEAD_SCORE_THRESHOLD_C`
- `MEMORY_LIMIT`
- `MORTGAGE_ADMIN_EMAIL`
- `N8N_BACKUP_PATH`
- `N8N_BASIC_AUTH_ACTIVE` (secret)
- `N8N_BASIC_AUTH_PASSWORD` (secret)
- `N8N_BASIC_AUTH_USER` (secret)
- `N8N_BINARY_DATA_TTL`
- `N8N_COMMUNITY_PACKAGES_ENABLED`
- `N8N_DATA_PATH`
- `N8N_DB_HOST`
- `N8N_DB_NAME`
- `N8N_DB_PASSWORD` (secret)
- `N8N_DB_PORT`
- `N8N_DB_USER`
- `N8N_DEFAULT_BINARY_DATA_MODE`
- `N8N_DISABLE_UI`
- `N8N_EDITOR_BASE_URL`
- `N8N_ENCRYPTION_KEY` (secret)
- `N8N_EXECUTIONS_DATA_MAX_AGE`
- `N8N_EXECUTIONS_DATA_PRUNE`
- `N8N_EXECUTIONS_TIMEOUT`
- `N8N_EXECUTIONS_TIMEOUT_MAX`
- `N8N_EXTRA_PACKAGES`
- `N8N_HOST`
- `N8N_LOG_FILE`
- `N8N_LOG_LEVEL`
- `N8N_LOG_OUTPUT`
- `N8N_METRICS`
- `N8N_METRICS_PREFIX`
- `N8N_PORT`
- `N8N_PROTOCOL`
- `N8N_WEBHOOK_URL` (secret)
- `NEXUS_MCP_URL`
- `NEXUS_ROUTER_URL`
- `NMLS_VALIDATION_ENABLED`
- `NODE_ENV`
- `PII_ENCRYPTION_ENABLED`
- `QUEUE_BULL_REDIS_HOST`
- `QUEUE_BULL_REDIS_PASSWORD` (secret)
- `QUEUE_BULL_REDIS_PORT`
- `QUOTE_ENGINE_URL`
- `RATE_CHANGE_THRESHOLD`
- `RATE_CHECK_INTERVAL_MINUTES`
- `RATE_LIMIT_ENABLED`
- `RATE_LIMIT_MAX_REQUESTS`
- `RATE_LIMIT_WINDOW_MINUTES`
- `RESPA_TIMELINE_DAYS`
- `RETENTION_POLICY_DAYS`
- `SECURITY_SERVICE_URL`
- `SHARED_SCHEMA_VERSION`
- `SMTP_HOST`
- `SMTP_PASSWORD` (secret)
- `SMTP_PORT`
- `SMTP_USER`
- `STATE_COMPLIANCE_ENABLED`
- `TEMPLATES_PATH`
- `TILA_DISCLOSURE_DAYS`
- `TRANSUNION_API_KEY` (secret)
- `TRID_API_KEY` (secret)
- `TRID_DISCLOSURE_ENABLED`
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_URL`
- `TWENTY_CRM_WORKSPACE_ID`
- `TWENTY_DB_HOST`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_PORT`
- `TWENTY_DB_USER`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `TWILIO_PHONE_NUMBER`
- `TZ`
- `WEBHOOK_ALLOWED_ORIGINS` (secret)
- `WEBHOOK_SECURITY_ENABLED` (secret)
- `WEBHOOK_TUNNEL_URL` (secret)

### apps/twenty
- `APP_SECRET` (secret)
- `NODE_ENV`
- `PG_DATABASE_URL`
- `PORT`
- `REDIS_URL`
- `SERVER_URL`
- `STORAGE_TYPE`

### apps/twenty-crm
- `ACCESS_TOKEN_SECRET` (secret)
- `ACTIVEPIECES_API_KEY` (secret)
- `ACTIVEPIECES_WEBHOOK_URL` (secret)
- `ALERT_EMAIL`
- `API_RATE_LIMITING_REQUEST_COUNT`
- `API_RATE_LIMITING_TTL`
- `API_VERSION`
- `AUTO_MIGRATE`
- `AUTO_SEED_DATA`
- `BACKUP_ENABLED`
- `BACKUP_RETENTION_DAYS`
- `BACKUP_SCHEDULE`
- `CALENDAR_DRIVER`
- `CAPTCHA_DRIVER`
- `CLAUDE_API_KEY` (secret)
- `CONFLICT_STRATEGY`
- `CORS_ALLOWED_ORIGINS`
- `CSP_ENABLED`
- `DB_IDLE_TIMEOUT`
- `DB_MAX_CONNECTIONS`
- `DB_MIN_CONNECTIONS`
- `DEBUG_MODE`
- `DEFAULT_QUOTE_EXPIRY_DAYS`
- `EMAIL_DRIVER`
- `EMAIL_FROM_ADDRESS`
- `EMAIL_SYSTEM_ADDRESS`
- `ENABLE_DEV_TOOLS`
- `EQUIFAX_API_KEY` (secret)
- `EXPERIAN_API_KEY` (secret)
- `FILE_TOKEN_SECRET` (secret)
- `FORCE_HTTPS`
- `FRONT_BASE_URL`
- `GRAPHQL_INTROSPECTION`
- `GRAPHQL_PLAYGROUND`
- `HEALTH_CHECK_ENABLED`
- `HEALTH_CHECK_INTERVAL_MINUTES`
- `HEALTH_CHECK_TIMEOUT`
- `HELMET_ENABLED`
- `HMDA_REPORTING_ENABLED`
- `IS_MULTIWORKSPACE_ENABLED`
- `LEAD_SCORE_ASSETS_WEIGHT`
- `LEAD_SCORE_CREDIT_WEIGHT`
- `LEAD_SCORE_DEBT_WEIGHT`
- `LEAD_SCORE_EMPLOYMENT_WEIGHT`
- `LEAD_SCORE_INCOME_WEIGHT`
- `LOGIN_TOKEN_SECRET` (secret)
- `LOG_FORMAT`
- `LOG_LEVEL`
- `MAX_DTI_RATIO`
- `MAX_RETRY_ATTEMPTS`
- `MCP_ENABLED`
- `MCP_SERVER_HOST`
- `MCP_SERVER_PORT`
- `MESSAGE_QUEUE_TYPE`
- `METRICS_ENABLED`
- `METRICS_PORT`
- `MIN_CREDIT_SCORE`
- `N8N_API_KEY` (secret)
- `N8N_WEBHOOK_URL` (secret)
- `NODE_ENV`
- `NYRA_API_KEY` (secret)
- `NYRA_CAMPAIGN_AUTOMATION_ENABLED`
- `NYRA_CAMPAIGN_ENGINE_URL`
- `NYRA_COMPLIANCE_TRACKING_ENABLED`
- `NYRA_INTEGRATION_ENABLED`
- `NYRA_LEAD_SCORING_ENABLED`
- `NYRA_NEXUS_ROUTER_URL`
- `NYRA_QUOTE_ENGINE_URL`
- `NYRA_QUOTE_INTEGRATION_ENABLED`
- `NYRA_WEBHOOK_SECRET` (secret)
- `PG_DATABASE_URL`
- `PORT`
- `QUEUE_DEFAULT_JOB_OPTIONS`
- `RATE_LOCK_DURATION_DAYS`
- `REDIS_MAX_CONNECTIONS`
- `REDIS_MIN_CONNECTIONS`
- `REDIS_URL`
- `REFRESH_TOKEN_DURATION` (secret)
- `REFRESH_TOKEN_SECRET` (secret)
- `RESPA_TIMELINE_DAYS`
- `RETRY_DELAY_MS`
- `SEED_SAMPLE_DATA`
- `SERVER_URL`
- `SESSION_DURATION`
- `SIGN_IN_PREFILLED`
- `SMTP_HOST`
- `SMTP_PASS` (secret)
- `SMTP_PORT`
- `SMTP_USER`
- `SSL_CERT_PATH` (secret)
- `SSL_KEY_PATH` (secret)
- `STORAGE_LOCAL_PATH`
- `STORAGE_TYPE`
- `SUPPORT_CHAT_ENABLED`
- `SYNC_BATCH_SIZE`
- `SYNC_INTERVAL_MINUTES`
- `TELEMETRY_ENABLED`
- `TILA_DISCLOSURE_DAYS`
- `TRANSUNION_API_KEY` (secret)
- `TWENTYCRM_API_KEY` (secret)
- `TWENTYCRM_API_URL`
- `TWENTYCRM_WEBHOOK_SECRET` (secret)
- `TWENTY_ACCESS_TOKEN_SECRET` (secret)
- `TWENTY_CRM_API_KEY` (secret)
- `TWENTY_CRM_WORKSPACE_ID`
- `TWENTY_DB_HOST`
- `TWENTY_DB_NAME`
- `TWENTY_DB_PASSWORD` (secret)
- `TWENTY_DB_PORT`
- `TWENTY_DB_USER`
- `TWENTY_FILE_TOKEN_SECRET` (secret)
- `TWENTY_LOGIN_TOKEN_SECRET` (secret)
- `TWENTY_REDIS_HOST`
- `TWENTY_REDIS_PASSWORD` (secret)
- `TWENTY_REDIS_PORT`
- `TWENTY_REFRESH_TOKEN_SECRET` (secret)
- `TWENTY_WEBHOOK_SECRET` (secret)
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN` (secret)
- `TWILIO_PHONE_NUMBER`
- `WEBHOOK_BASE_URL` (secret)
- `WORKER_CONCURRENCY`

### apps/utilities
- `DEFAULT_THEME`
- `MAGIC_UI_ENABLED`
- `NODE_ENV`
- `SHADCN_REGISTRY_URL`
- `TWEAKCN_PRESET`

### apps/webapp
- `NEXT_PUBLIC_ACTIVEPIECES_URL`
- `NEXT_PUBLIC_MEM0_PROXY_URL`
- `NEXT_PUBLIC_N8N_URL`
- `NEXT_PUBLIC_OPENCLAW_URL`
- `NEXT_PUBLIC_QUOTE_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_WEBHOOK_URL` (secret)
- `NODE_ENV`
- `NYRA_CHAT_INTERNAL_PROXY_TOKEN` (secret)
- `OPENCLAW_CHAT_PATH`
- `OPENCLAW_DEFAULT_MODEL`
- `OPENCLAW_GATEWAY_TOKEN` (secret)
- `OPENCLAW_PUBLIC_BASE_URL`
- `PORT`

