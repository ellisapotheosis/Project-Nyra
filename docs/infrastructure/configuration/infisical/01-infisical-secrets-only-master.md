# Infisical Master List — **Secrets + High-Value Tunables Only**

Scope: this list intentionally excludes low-priority host/port/url churn variables and keeps only:
1) sensitive secrets/tokens/credentials, and
2) high-value model/runtime knobs that are worth centralizing in Infisical.

## 1) Global secrets (store once, reuse by environment)

- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENV`
- `INFISICAL_PATH`
- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `LITELLM_MASTER_KEY`
- `NEXUS_JWT_SECRET`
- `NEXUS_ADMIN_TOKEN`
- `AUTH_SECRET`
- `JWT_SECRET`
- `API_SECRET`
- `API_KEY`
- `API_KEY_PC2`
- `API_KEY_PC3`
- `API_KEY_PC4`

## 2) External provider/API secrets

- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_API_KEY`
- `HF_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `SENDGRID_API_KEY`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_TUNNEL_TOKEN`
- `CF_TUNNEL_TOKEN`
- `CF_ACCESS_CLIENT_SECRET`

## 3) Workflow/CRM/App secrets

- `TWENTY_API_KEY`
- `TWENTY_ENCRYPTION_SECRET`
- `TWENTY_JWT_SECRET`
- `TWENTY_PASSWORD_SALT`
- `TWENTY_APP_SECRET`
- `AP_ENCRYPTION_KEY`
- `AP_JWT_SECRET`
- `AP_POSTGRES_PASSWORD`
- `N8N_ENCRYPTION_KEY`
- `N8N_BASIC_AUTH_PASSWORD`
- `N8N_BASIC_AUTH_USER`
- `WEBHOOK_URL` (treat as secret endpoint)
- `QUOTE_API_SECRET`
- `LEADMAILBOX_API_KEY`
- `LENDINGTREE_WEBHOOK_SECRET`
- `FREERATEUPDATER_WEBHOOK_SECRET`
- `CLAWDBOT_GATEWAY_TOKEN`

## 4) High-value non-secret tunables worth keeping in Infisical

These are not secrets, but are operationally useful to keep centrally managed.

### vLLM + caching
- `VLLM_MODEL`
- `VLLM_MAX_MODEL_LEN`
- `VLLM_GPU_MEMORY_UTILIZATION`
- `VLLM_TENSOR_PARALLEL_SIZE`
- `VLLM_ENABLE_PREFIX_CACHING`  <!-- context pre-warming related -->
- `VLLM_ENABLE_CHUNKED_PREFILL` <!-- context pre-warming related -->
- `VLLM_MAX_NUM_BATCHED_TOKENS`
- `VLLM_KV_CACHE_DTYPE`
- `VLLM_ENFORCE_EAGER_EXECUTION`
- `LMCACHE_ENABLED`
- `LMCACHE_MAX_SIZE`
- `LMCACHE_CHUNK_SIZE`
- `LMCACHE_TTL`
- `LMCACHE_REDIS_URL`

### Ollama worker tuning
- `OLLAMA_NUM_GPU`
- `OLLAMA_NUM_PARALLEL`
- `OLLAMA_MAX_LOADED_MODELS`
- `OLLAMA_KEEP_ALIVE`
- `OLLAMA_FLASH_ATTENTION`

### Shared reliability flags
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `REQUEST_TIMEOUT`
- `BATCH_TIMEOUT_MS`
- `BATCH_WAIT_TIMEOUT_MS`
- `RECOVERY_CHECK_INTERVAL`
