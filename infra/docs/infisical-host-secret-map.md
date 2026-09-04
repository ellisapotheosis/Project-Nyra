# Infisical Host Secret Map

## Resolution Architecture (Two-Hop Import Chain)

```
Canonical paths          /llm-providers/litellm
(values live here)       /external/tailscale
                         /external/portainer  ...
                              ↓ folder imports
                         /hosts/shared        ← aggregator for 3+ host paths
                              ↓ folder import
                         /hosts/{hostname}    ← host-specific refs + config
                              ↓ injected at runtime
                         docker compose up
```

**`/hosts/shared`** uses Infisical's **secret import** feature (whole-folder symlinks)
to pull in every canonical path needed by 3+ hosts. Each `/hosts/{hostname}` then
imports `/hosts/shared` in one operation — that single import carries all shared
secrets transitively.

**`/agent-vault`** imports everything: `/hosts/shared` + all remaining canonical
paths + per-host paths. Use it for personal CLI injection and agent-vault sync.

**Rule:** Canonical values live once (at the source path). Hosts reference them.
Never store a duplicate canonical value in `/hosts/*`.

---

## /hosts/shared — Folder Imports (set once, inherited by all hosts)

| Source Path                       | Why shared                                                    |
| --------------------------------- | ------------------------------------------------------------- |
| `/llm-providers/litellm`          | LITELLM_MASTER_KEY + LLXPRT_BRIDGE_API_KEY across all 7 nodes |
| `/llm-providers/anthropic`        | ANTHROPIC_API_KEY — oracle, orchestrator, 3090ti, 5090        |
| `/llm-providers/openrouter`       | OPENROUTER_API_KEY — oracle, orchestrator                     |
| `/llm-providers/huggingface`      | HF_TOKEN — 3090ti, 5090 + agent use                           |
| `/external/tailscale`             | TAILSCALE_AUTHKEY — all 3 worker nodes                        |
| `/security/infisical/local`       | INFISICAL_PROJECT_ID + TOKEN — 4+ hosts                       |
| `/security/infisical/agent-vault` | UA client creds — oracle + agents                             |
| `/external/portainer`             | PORTAINER_EDGE_ID/KEY — orchestrator + 3 workers              |
| `/external/mem0`                  | MEM0_API_KEY/URL — all 3 workers                              |
| `/external/nexus`                 | NEXUS_ADMIN_TOKEN/JWT — orchestrator, 3090ti, 5090            |
| `/external/openclaw`              | OPENCLAW_GATEWAY_TOKEN — orchestrator, 5090                   |
| `/external/hermes`                | MCP_GATEWAY_TOKEN — oracle, orchestrator                      |
| `/external/tavily`                | TAVILY_API_KEY — oracle, orchestrator                         |
| `/external/firecrawl`             | FIRECRAWL_API_KEY — oracle, orchestrator                      |
| `/databases/postgres`             | POSTGRES_* — oracle, orchestrator, homeassistant              |
| `/databases/redis`                | REDIS_PASSWORD — oracle, orchestrator                         |
| `/observability/grafana`          | GRAFANA_ADMIN_* — orchestrator, 3060                          |

Each `/hosts/{hostname}` has one secret import pointing at `/hosts/shared`.
This single import makes all of the above available in that host's resolved secret set.

---

## /agent-vault — All-in-One Dev + Agent Surface

Imports everything: `/hosts/shared` + remaining LLM providers + all `/external/*` +
all databases + security + per-host paths. Use with:

```bash
# CLI injection (personal dev)
INFISICAL_TOKEN=<tok> infisical run --path /agent-vault -- <command>

# Agent-vault sync — mount this path in your agent-vault instance
INFISICAL_PATH=/agent-vault
```

---

## Path Taxonomy

| Prefix                      | Purpose                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `/llm-providers/*`          | LLM API keys (anthropic, openai, openrouter, litellm, huggingface, google/gemini, etc.) |
| `/external/*`               | Third-party services (letta, nexus, portainer, gitea, n8n, tavily, mem0, …)             |
| `/external/cloudflare`      | Cloudflare API + tunnel tokens (moved from /security/cloudflare 2026-07-26)             |
| `/external/tailscale`       | Tailscale auth keys (moved from /security/tailscale 2026-07-26)                         |
| `/security/infisical/*`     | Infisical bootstrap creds + agent-vault UA identity                                     |
| `/observability/grafana`    | Grafana admin credentials                                                               |
| `/observability/logfire`    | Logfire tokens                                                                          |
| `/databases/postgres`       | Shared Postgres credentials                                                             |
| `/databases/redis`          | Redis credentials                                                                       |
| `/databases/qdrant-local`   | Qdrant API key                                                                          |
| `/databases/supabase/cloud` | Supabase cloud anon + service role keys                                                 |
| `/databases/supabase/local` | Supabase local DB password                                                              |
| `/llm-providers/omniroute`  | Omniroute canonical secrets (migrated from /oracle-vps/omniroute 2026-07-25)            |
| `/hosts/shared`             | Values shared across 3+ hosts (INFISICAL_ENV, PROJECTNYRA_DOMAIN, TWENTY_CRM_*)         |
| `/hosts/{hostname}`         | Per-host references + host-specific config                                              |

---

## HOST: oracle-vps

**Infisical path:** `/hosts/oracle-vps`

### References (point to canonical source)

| Variable                               | Canonical Path                       |
| -------------------------------------- | ------------------------------------ |
| AGENT_VAULT_MASTER_PASSWORD            | `/security/infisical/agent-vault`    |
| AGENT_VAULT_UA_CLIENT_ID               | `/security/infisical/agent-vault`    |
| AGENT_VAULT_UA_CLIENT_SECRET           | `/security/infisical/agent-vault`    |
| ANTHROPIC_API_KEY                      | `/llm-providers/anthropic`           |
| AP_ENCRYPTION_KEY                      | `/external/activepieces`             |
| AP_JWT_SECRET                          | `/external/activepieces`             |
| BROWSERLESS_TOKEN                      | `/external/browserless`              |
| CF_TUNNEL_TOKEN                        | `/external/cloudflare`               |
| CLOUDFLARED_TUNNEL_TOKEN               | `/external/cloudflare`               |
| CLOUDFLARE_API_TOKEN                   | `/external/cloudflare`               |
| COMPOSIO_API_KEY                       | `/external/composio`                 |
| FIRECRAWL_API_KEY                      | `/external/firecrawl`                |
| FORGEJO_DB_PASSWORD                    | `/hosts/oracle-vps` (canonical here) |
| FORGEJO_INTERNAL_TOKEN                 | `/external/gitea`                    |
| FORGEJO_JWT_SECRET                     | `/external/gitea`                    |
| FORGEJO_SECRET_KEY                     | `/external/gitea`                    |
| GEMINI_API_KEY                         | `/llm-providers/google/gemini`       |
| GITEA_INTERNAL_TOKEN                   | `/external/gitea`                    |
| GITEA_JWT_SECRET                       | `/external/gitea`                    |
| GITEA_SECRET_KEY                       | `/external/gitea`                    |
| GITEA_TOKEN                            | `/external/gitea`                    |
| GITHUB_TOKEN                           | `/external/github`                   |
| GRAFANA_ADMIN_PASSWORD                 | `/observability/grafana`             |
| GRAFANA_ADMIN_USER                     | `/observability/grafana`             |
| INFISICAL_ENV                          | `/hosts/shared`                      |
| INFISICAL_PROJECT_ID                   | `/security/infisical/local`          |
| INFISICAL_TOKEN                        | `/security/infisical/local`          |
| INFISICAL_UNIVERSAL_AUTH_CLIENT_ID     | `/security/infisical/agent-vault`    |
| INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET | `/security/infisical/agent-vault`    |
| LETTA_DB_PASSWORD                      | `/hosts/oracle-vps` (canonical here) |
| LETTA_SERVER_PASSWORD                  | `/external/letta`                    |
| LITELLM_BASE_URL                       | `/llm-providers/litellm`             |
| LITELLM_DATABASE_URL                   | `/llm-providers/litellm`             |
| LITELLM_MASTER_KEY                     | `/llm-providers/litellm`             |
| LLXPRT_BRIDGE_API_KEY                  | `/llm-providers/litellm`             |
| MCP_GATEWAY_TOKEN                      | `/external/hermes`                   |
| N8N_DB_PASSWORD                        | `/hosts/oracle-vps` (canonical here) |
| N8N_ENCRYPTION_KEY                     | `/external/n8n`                      |
| NEXUS_ROUTER_URL                       | `/external/nexus`                    |
| OMNIROUTE_API_KEY                      | `/llm-providers/omniroute`           |
| OMNIROUTE_API_KEY_SECRET               | `/llm-providers/omniroute`           |
| OMNIROUTE_INITIAL_PASSWORD             | `/llm-providers/omniroute`           |
| OMNIROUTE_JWT_SECRET                   | `/llm-providers/omniroute`           |
| OPENAI_API_KEY                         | `/llm-providers/litellm`             |
| OPENROUTER_API_KEY                     | `/llm-providers/openrouter`          |
| ORACLE_TUNNEL_TOKEN                    | `/external/cloudflare`               |
| PAPERCLIP_API_KEY                      | `/external/paperclip`                |
| POSTGRES_DB                            | `/databases/postgres`                |
| POSTGRES_PASSWORD                      | `/databases/postgres`                |
| POSTGRES_USER                          | `/databases/postgres`                |
| QDRANT_API_KEY                         | `/databases/qdrant-local`            |
| SEARXNG_SECRET                         | `/external/searxng`                  |
| SUPABASE_ANON_KEY                      | `/databases/supabase/cloud`          |
| SUPABASE_DB_PASSWORD                   | `/databases/supabase/local`          |
| SUPABASE_SERVICE_ROLE_KEY              | `/databases/supabase/cloud`          |
| TAVILY_API_KEY                         | `/external/tavily`                   |
| TWENTY_ACCESS_TOKEN_SECRET             | `/hosts/oracle-vps` (canonical here) |
| TWENTY_APP_SECRET                      | `/hosts/oracle-vps` (canonical here) |
| TWENTY_CRM_API_KEY                     | `/hosts/shared`                      |
| TWENTY_CRM_URL                         | `/hosts/shared`                      |
| TWENTY_DB_PASSWORD                     | `/hosts/oracle-vps` (canonical here) |
| TWENTY_FILE_TOKEN_SECRET               | `/hosts/oracle-vps` (canonical here) |
| TWENTY_LOGIN_TOKEN_SECRET              | `/hosts/oracle-vps` (canonical here) |
| TWENTY_REFRESH_TOKEN_SECRET            | `/hosts/oracle-vps` (canonical here) |
| TWILIO_ACCOUNT_SID                     | `/external/twilio`                   |
| TWILIO_AUTH_TOKEN                      | `/external/twilio`                   |

### Unclassified (need values before deployment)

These are oracle-vps-local values with no external canonical source yet:
`ACTIVEPIECES_API_KEY`, `AGENT_VAULT_ADDR`, `AGENT_VAULT_ADMIN_EMAIL`,
`AGENT_VAULT_ADMIN_PASSWORD`, `AGENT_VAULT_IDENTITY_ID`, `AGENT_VAULT_ORG_ID`,
`AGENT_VAULT_SMTP_FROM`, `AGENT_VAULT_SMTP_HOST`, `AGENT_VAULT_SMTP_PASSWORD`,
`AGENT_VAULT_TRUSTED_PROXIES`, `AP_POSTGRES_HOST`, `AP_REDIS_HOST`,
`GITEA_DB_PASSWORD`, `INFISICAL_AUTH_SECRET`, `INFISICAL_DB_PASSWORD`,
`INFISICAL_ENCRYPTION_KEY`, `INFISICAL_GATEWAY_CLIENT_ID`,
`INFISICAL_GATEWAY_CLIENT_SECRET`, `INFISICAL_REDIS_PASSWORD`,
`MEM0_HOST_PORT`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXUS_MCP_URL`,
`OPENWEBUI_SECRET_KEY`, `ORACLE_TAILSCALE_IP`, `TWENTY_REDIS_PASSWORD`

---

## HOST: orchestrator

**Infisical path:** `/hosts/orchestrator`

### References

| Variable                 | Canonical Path              |
| ------------------------ | --------------------------- |
| ANTHROPIC_API_KEY        | `/llm-providers/anthropic`  |
| FIRECRAWL_API_KEY        | `/external/firecrawl`       |
| GRAFANA_ADMIN_PASSWORD   | `/observability/grafana`    |
| GRAFANA_ADMIN_USER       | `/observability/grafana`    |
| INFISICAL_ENV            | `/hosts/shared`             |
| INFISICAL_PROJECT_ID     | `/security/infisical/local` |
| LITELLM_BASE_URL         | `/llm-providers/litellm`    |
| LITELLM_MASTER_KEY       | `/llm-providers/litellm`    |
| LLXPRT_BRIDGE_API_KEY    | `/llm-providers/litellm`    |
| NEXUS_API_KEY            | `/external/nexus`           |
| OMNIROUTE_API_KEY        | `/llm-providers/omniroute`  |
| OPENAI_API_KEY           | `/llm-providers/litellm`    |
| OPENCLAW_GATEWAY_TOKEN   | `/external/openclaw`        |
| OPENROUTER_API_KEY       | `/llm-providers/openrouter` |
| PAPERCLIP_API_KEY        | `/external/paperclip`       |
| PORTAINER_ADMIN_PASSWORD | `/external/portainer`       |
| PORTAINER_EDGE_ID        | `/external/portainer`       |
| PORTAINER_EDGE_KEY       | `/external/portainer`       |
| POSTGRES_DB              | `/databases/postgres`       |
| POSTGRES_PASSWORD        | `/databases/postgres`       |
| POSTGRES_USER            | `/databases/postgres`       |
| REDIS_PASSWORD           | `/databases/redis`          |
| TAVILY_API_KEY           | `/external/tavily`          |

### Host-specific (canonical here)

`LITELLM_HERMES_KEY`, `LITELLM_PORT=4010`, `LITELLM_DB_NAME`, `LITELLM_DB_PASSWORD`,
`LITELLM_DB_USER`, `NATS_PORT`, `ALERTMANAGER_PAGERDUTY_KEY`,
`ALERTMANAGER_SLACK_WEBHOOK_URL`, `OPENLIT_NEXTAUTH_SECRET`,
`OPENLIT_VAULT_ENCRYPTION_KEY`, `MEM0_API_URL`, `MEMPALACE_URL`

### Unclassified

`CLICKHOUSE_PASSWORD`, `INFISICAL_MCP_TOKEN`, `INFISICAL_PATH`, `NEXUS_API_URL`

---



### References

| Variable               | Canonical Path              |
| ---------------------- | --------------------------- |
| GRAFANA_ADMIN_PASSWORD | `/observability/grafana`    |
| GRAFANA_ADMIN_USER     | `/observability/grafana`    |
| INFISICAL_ENV          | `/hosts/shared`             |
| INFISICAL_PROJECT_ID   | `/security/infisical/local` |
| INFISICAL_TOKEN        | `/security/infisical/local` |
| LITELLM_MASTER_KEY     | `/llm-providers/litellm`    |
| LLXPRT_BRIDGE_API_KEY  | `/llm-providers/litellm`    |
| MEM0_API_URL           | `/external/mem0`            |
| PORTAINER_EDGE_ID      | `/external/portainer`       |
| PORTAINER_EDGE_KEY     | `/external/portainer`       |
| TAILSCALE_AUTHKEY      | `/external/tailscale`       |

### Host-specific (canonical here)

`COMPOSE_PROJECT_NAME=`, `OLLAMA_HOST`, `OLLAMA_MODELS`,
`OLLAMA_PORT=11434`, `LOKI_URL`, `NEXUS_ROUTER_URL`, `QUOTE_ENGINE_URL`,
`WORKER_ID`

---

## HOST: worker-rtx3090ti

**Infisical path:** `/hosts/worker-rtx3090ti`

### References

| Variable             | Canonical Path               |
| -------------------- | ---------------------------- |
| ANTHROPIC_API_KEY    | `/llm-providers/anthropic`   |
| HF_TOKEN             | `/llm-providers/huggingface` |
| INFISICAL_ENV        | `/hosts/shared`              |
| INFISICAL_PROJECT_ID | `/security/infisical/local`  |
| INFISICAL_TOKEN      | `/security/infisical/local`  |
| LITELLM_MASTER_KEY   | `/llm-providers/litellm`     |
| MEM0_API_KEY         | `/external/mem0`             |
| MEM0_API_URL         | `/external/mem0`             |
| PORTAINER_EDGE_ID    | `/external/portainer`        |
| PORTAINER_EDGE_KEY   | `/external/portainer`        |
| TAILSCALE_AUTHKEY    | `/external/tailscale`        |
| TWENTY_CRM_API_KEY   | `/hosts/shared`              |
| TWENTY_CRM_URL       | `/hosts/shared`              |

### Host-specific (canonical here)

`COMPOSE_PROJECT_NAME=worker-rtx3090ti`, `VLLM_MODEL`, `VLLM_HOST`,
`VLLM_PORT=8000`, `VLLM_MAX_MODEL_LEN`, `VLLM_GPU_MEMORY_UTILIZATION`,
`VLLM_TENSOR_PARALLEL_SIZE`, `WORKER_ID`, `MODEL_ID`, `DATABASE_URL`,
`ORCHESTRATOR_URL`, `LOKI_URL`, `NEXUS_ADMIN_TOKEN`

---

## HOST: worker-rtx5090

**Infisical path:** `/hosts/worker-rtx5090`

### References

| Variable               | Canonical Path               |
| ---------------------- | ---------------------------- |
| ANTHROPIC_API_KEY      | `/llm-providers/anthropic`   |
| CLOUDFLARED_TOKEN      | `/external/cloudflare`       |
| HF_TOKEN               | `/llm-providers/huggingface` |
| INFISICAL_ENV          | `/hosts/shared`              |
| INFISICAL_PROJECT_ID   | `/security/infisical/local`  |
| INFISICAL_TOKEN        | `/security/infisical/local`  |
| LITELLM_DATABASE_URL   | `/llm-providers/litellm`     |
| LITELLM_MASTER_KEY     | `/llm-providers/litellm`     |
| MEM0_API_KEY           | `/external/mem0`             |
| MEM0_API_URL           | `/external/mem0`             |
| NEXUS_ADMIN_TOKEN      | `/external/nexus`            |
| NEXUS_JWT_SECRET       | `/external/nexus`            |
| NEXUS_ROUTER_URL       | `/external/nexus`            |
| OPENCLAW_GATEWAY_TOKEN | `/external/openclaw`         |
| PORTAINER_EDGE_ID      | `/external/portainer`        |
| PORTAINER_EDGE_KEY     | `/external/portainer`        |
| TAILSCALE_AUTHKEY      | `/external/tailscale`        |
| TAILSCALE_KEY          | `/external/tailscale`        |
| TWENTY_CRM_API_KEY     | `/hosts/shared`              |
| TWENTY_CRM_URL         | `/hosts/shared`              |

### Host-specific (canonical here)

`COMPOSE_PROJECT_NAME=worker-rtx5090`, `VLLM_MODEL`, `VLLM_HOST`,
`VLLM_PORT=8000`, `VLLM_MAX_MODEL_LEN`, `VLLM_GPU_MEMORY_UTILIZATION`,
`VLLM_TENSOR_PARALLEL_SIZE`, `WORKER_ID`, `DATABASE_URL`, `ORCHESTRATOR_URL`,
`NERVE_UI_PORT`, `LOKI_URL`, `CLOUDFLARED_HOSTNAME`,
`CLOUDFLARED_LITELLM_HOSTNAME`

---

## HOST: homeassistant

**Infisical path:** `/hosts/homeassistant`

### References

| Variable          | Canonical Path        |
| ----------------- | --------------------- |
| GITHUB_TOKEN      | `/external/github`    |
| POSTGRES_DB       | `/databases/postgres` |
| POSTGRES_PASSWORD | `/databases/postgres` |
| POSTGRES_USER     | `/databases/postgres` |

### Host-specific / Unclassified (all service endpoint URLs, no secrets)

These are non-secret service endpoint URLs — store as plain config here:
`HOMEASSISTANT_URL`, `HOMEASSISTANT_IP`, `GRAFANA_URL`, `LETTA_URL`,
`N8N_URL`, `NEXUS_URL`, `NEXUS_ADMIN_URL`, `OPEN_WEBUI_URL`,
`PORTAINER_URL`, `PROMETHEUS_URL`, `QDRANT_URL`, `LOKI_URL`,
`ARCHON_URL`, `ACTIVEPIECES_URL`, `MEM0_URL`, `LANDING_URL`,
`WEBAPP_URL`, `LINKWARDEN_URL`, `LINKWARDEN_PORT`,
`LINKWARDEN_TOKEN`, `MEILI_MASTER_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

---

## SHARED: /hosts/shared

Values consumed by 3+ hosts — stored once here, referenced everywhere.

| Variable           | Value                                        |
| ------------------ | -------------------------------------------- |
| INFISICAL_ENV      | `dev` / `staging` / `prod` (per environment) |
| PROJECTNYRA_DOMAIN | `projectnyra.com`                            |
| TWENTY_CRM_API_KEY | canonical value (set in Infisical)           |
| TWENTY_CRM_URL     | canonical value (set in Infisical)           |

---

## SERVICE: /llm-providers/omniroute

Omniroute service credentials — canonical here (migrated from /oracle-vps/omniroute 2026-07-25),
referenced from `/hosts/oracle-vps` and `/hosts/orchestrator`.

| Key                        | Notes                                 |
| -------------------------- | ------------------------------------- |
| OMNIROUTE_API_KEY          | `omni_*` format, generated 2026-07-25 |
| OMNIROUTE_INITIAL_PASSWORD | service admin password                |
| OMNIROUTE_JWT_SECRET       | 128-char hex                          |
| OMNIROUTE_API_KEY_SECRET   | 128-char hex                          |

---

## Inject Pattern

Each host's `.env` file should only contain:

```bash
# Bootstrap — only these 3 are needed to fetch everything else
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=dev
INFISICAL_PATH=/hosts/<hostname>
```

Then `infisical run -- docker compose up` resolves all references at startup.
