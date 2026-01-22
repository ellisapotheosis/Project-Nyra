# Infisical Migration Analysis Report

Generated: 2026-01-22
Total Variables: 397
Source: /shared export
Target: Organized path structure

## Executive Summary

This report categorizes all 397 variables from `/shared` into a hierarchical path structure for better organization, security, and maintainability.

## Path Categorization Summary

### 1. `/providers/anthropic` (5 variables)
LLM provider credentials and configuration for Anthropic Claude

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_BASE_URL`
- `ANTHROPIC_DEFAULT_SONNET_MODEL`
- `ANTHROPIC_MAX_TOKENS`
- `ANTHROPIC_MODEL`

### 2. `/providers/openai` (2 variables)
LLM provider credentials for OpenAI GPT models

- `OPENAI_API_KEY`
- `OPENMEMORY_API_KEY`

### 3. `/providers/google` (3 variables)
Google AI services (Gemini, VertexAI)

- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `GOOGLE_GEMINI_API_KEY`

### 4. `/providers/openrouter` (3 variables)
OpenRouter unified LLM API gateway

- `OPENROUTER_API_KEY`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_FALLBACK_MODEL`

### 5. `/providers/perplexity` (0 variables)
*Reserved for future use*

### 6. `/providers/replicate` (0 variables)
*Reserved for future use*

### 7. `/providers/ollama` (1 variable)
Local LLM inference engine

- `OLLAMA_API`

### 8. `/machines/orchestrator-mini` (2 variables)
Area51 mini PC - orchestration node

- `CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR`
- `NYRA_ORCHESTRATOR_TUNNEL_ID_CHANGE_TEMP`

### 9. `/machines/worker-rtx3060` (3 variables)
PC2 - RTX 3060 GPU worker

- `WORKER_3060_URL`
- `WORKER_3060_MODELS`
- PC-specific environment vars (TBD)

### 10. `/machines/worker-rtx5090` (3 variables)
PC3 - RTX 5090 primary GPU worker

- `WORKER_5090_URL`
- `WORKER_5090_MODELS`
- PC-specific environment vars (TBD)

### 11. `/machines/worker-rtx3090ti` (3 variables)
PC4 - RTX 3090 Ti secondary GPU worker

- `WORKER_3090_URL`
- `WORKER_3090_MODELS`
- PC-specific environment vars (TBD)

### 12. `/databases/postgres` (12 variables)
PostgreSQL database configuration

- `DATABASE_URL`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `POSTGRES_SUPER_PASSWORD`
- `POSTGRES_USER`
- `PG_DATABASE_HOST`
- `PG_DATABASE_NAME`
- `PG_DATABASE_URL`
- `PG_DATABASE_USER`
- `PGADMIN_PASSWORD`

### 13. `/databases/redis` (7 variables)
Redis in-memory data store

- `REDIS_HOST`
- `REDIS_PASSWORD`
- `REDIS_PORT`
- `REDIS_URL`
- `REDIS_EVICTION_POLICY`
- `REDIS_MAX_MEMORY`
- Various service-specific Redis URLs (ARCHON, CLAUDE_FLOW, NEXUS)

### 14. `/databases/qdrant` (4 variables)
Qdrant vector database

- `QDRANT_API_KEY`
- `QDRANT_LOCALHOST_URL`
- `QDRANT_PORT`

### 15. `/databases/supabase` (10 variables)
Supabase backend-as-a-service

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_ANON_KEY`
- `SUPABASE_CLIENT_SERVICE_KEY`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_REFRESH_TOKEN`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_URL`

### 16. `/databases/mem0` (5 variables)
Mem0 AI memory service

- `MEM0_API_KEY`
- `MEM0_BASE_URL`
- `MEM0_DEFAULT_USER_ID`
- `MEM0_ORGANIZATION_ID`
- `MEM0_ORGANIZATION_NAME`

### 17. `/databases/graphiti` (5 variables)
Graphiti + Neo4j graph database

- `GRAPHITI_PORT`
- `NEO4J_BOLT_PORT`
- `NEO4J_HTTP_PORT`
- `NEO4J_PASSWORD`

### 18. `/databases/letta` (7 variables)
Letta AI agent database

- `LETTA_DB_NAME`
- `LETTA_DB_PASSWORD`
- `LETTA_PORT`
- `LETTA_POSTGRES_PASSWORD`
- `LETTA_POSTGRES_PORT`
- `LETTA_POSTGRES_URI`
- `LETTA_SERVER_PASSWORD`

### 19. `/databases/twentycrm` (6 variables)
TwentyCRM database configuration

- `TWENTY_DB_NAME`
- `TWENTY_PORT`
- `TWENTY_POSTGRES_PASSWORD`
- `TWENTY_POSTGRES_PORT`
- `TWENTY_ACCESS_TOKEN_SECRET`
- `TWENTY_LOGIN_TOKEN_SECRET`
- `TWENTY_REFRESH_TOKEN_SECRET`

### 20. `/databases/mongodb` (1 variable)
MongoDB NoSQL database

- `MONGO_ROOT_PASSWORD`

### 21. `/databases/falkordb` (4 variables)
FalkorDB graph database

- `FALKORDB_AOF_SYNC`
- `FALKORDB_MAX_MEMORY`
- `FALKORDB_PASSWORD`
- `FALKORDB_PORT`

### 22. `/databases/dify` (8 variables)
Dify AI application database

- `DIFY_DB_NAME`
- `DIFY_POSTGRES_PASSWORD`
- `DIFY_POSTGRES_PORT`
- `DIFY_ENCRYPTION_KEY`
- `DIFY_SECRET_KEY`
- `DIFY_SANDBOX_API_KEY`

### 23. `/clients/claude-flow` (68 variables)
Claude Flow orchestration system

All variables starting with `CLAUDE_FLOW_*`:
- Configuration, feature flags, ports
- Memory, metrics, scaling settings
- Agent pool and topology configuration
- 68+ variables total

### 24. `/clients/claude-code` (12 variables)
Claude Code CLI configuration

All variables starting with `CLAUDE_CODE_*` and `CLAUDE_*`:
- Interaction mode, auto-approve
- Bash configuration
- Model settings, output tokens
- Git bash path

### 25. `/clients/agentic-flow` (1 variable)
Agentic Flow training system

- `AGENTIC_FLOW_TRAINING`

### 26. `/clients/agent-booster` (1 variable)
Agent Booster enhancement system

- `AGENT_BOOSTER_ENABLED`

### 27. `/clients/ruvector` (0 variables)
*Reserved for RUVector system*

### 28. `/clients/bitwarden` (2 variables)
Bitwarden password manager

- `BITWARDEN_MCP_URL`

### 29. `/clients/infisical` (19 variables)
Infisical secrets management

All variables starting with `INFISICAL_*`:
- Project, organization, client IDs
- Authentication credentials
- API URLs and tokens
- MCP configuration

### 30. `/clients/nexusrouter` (7 variables)
Nexus Router LLM gateway

- `NEXUS_ADMIN_TOKEN`
- `NEXUS_JWT_SECRET`
- `NEXUS_PORT`
- `NEXUS_REDIS_URL`
- `NEXUS_ROUTER_MCP_PORT`
- `NEXUS_ROUTER_PORT`

### 31. `/services/archon` (24 variables)
Archon OS multi-agent orchestration

All variables starting with `ARCHON_*`:
- API, MCP, agents ports
- Configuration (topology, timeout, retries)
- Redis URL, metrics
- UI and docs ports

### 32. `/services/agentdb` (25 variables)
AgentDB vector database

All variables starting with `AGENTDB_*`:
- API key, port configuration
- Vector dimensions, distance metrics
- HNSW indexing parameters
- Learning algorithm settings
- Quantization, compression

### 33. `/services/docker` (5 variables)
Docker and Docker Hub configuration

- `DOCKER_BUILDKIT`
- `DOCKER_SUBNET`
- `DOCKERHUB_USERNAME`
- `DOCKHERHUB_TOKEN`
- `HUB_PAT_TOKEN`
- `HUB_USERNAME`
- `COMPOSE_*` variables

### 34. `/services/cloudflare` (10 variables)
Cloudflare CDN and tunnel configuration

All variables starting with `CF_*` and `CLOUDFLARE_*`:
- Account ID, zone ID
- API keys and tokens
- Access client credentials
- Origin CA key

### 35. `/services/github` (14 variables)
GitHub integration and tokens

All variables starting with `GH_*` and `GITHUB_*`:
- Personal access tokens
- Repository owner
- Integration settings
- MCP API key

### 36. `/services/tailscale` (0 variables)
*Tailscale mesh network - no env vars needed*

### 37. `/services/n8n` (7 variables)
n8n workflow automation

- `N8N_API_KEY`
- `N8N_BASIC_AUTH_PASSWORD`
- `N8N_DB_NAME`
- `N8N_PROTOCOL`
- `N8N_TOKEN`
- `N8N_URL`

### 38. `/services/prometheus` (2 variables)
Prometheus monitoring

- `PROMETHEUS_PORT`

### 39. `/services/grafana` (2 variables)
Grafana dashboards

- `GRAFANA_ADMIN_PASSWORD`
- `GRAFANA_PORT`

### 40. `/services/alertmanager` (1 variable)
Alert Manager monitoring

- `ALERTMANAGER_PORT`

### 41. `/services/cadvisor` (1 variable)
Container monitoring

- `CADVISOR_PORT`

### 42. `/services/litellm` (3 variables)
LiteLLM proxy service

- `LITELLM_DATABASE_URL`
- `LITELLM_MASTER_KEY`
- `LITELLM_PORT`

### 43. `/services/langfuse` (3 variables)
Langfuse LLM observability

- `LANGFUSE_NEXTAUTH_SECRET`
- `LANGFUSE_PORT`
- `LANGFUSE_SALT`

### 44. `/services/minio` (3 variables)
MinIO object storage

- `MINIO_API_PORT`
- `MINIO_CONSOLE_PORT`
- `MINIO_ROOT_PASSWORD`

### 45. `/services/loki` (1 variable)
Loki log aggregation

- `LOKI_PORT`

### 46. `/config/environment` (8 variables)
General environment configuration

- `NODE_ENV`
- `PYTHON_ENV`
- `PROJECT_ENV`
- `DEBUG`
- `LOG_LEVEL`
- `ENVIRONMENT`
- `TZ`
- `REGION`

### 47. `/config/project` (5 variables)
Project-level settings

- `PROJECT_NAME`
- `COMPOSE_PROJECT_NAME`
- `NYRA_REPO_ROOT`
- `NYRA_STACK_NAME`

### 48. `/config/features` (24 variables)
Feature flags and toggles

All variables ending with `_ENABLED`, `ENABLE_*`, `AUTO_*`, `USE_*`:
- Component enablement
- Auto-scaling, auto-commit flags
- Feature toggles across services

### 49. `/config/ports` (30+ variables)
Port configurations across services

All variables ending with `_PORT`:
- Service ports
- Database ports
- Metrics and monitoring ports

### 50. `/config/paths` (8 variables)
File system paths and directories

All variables ending with `_PATH`, `_DIR`, `_ROOT`:
- Data directories
- Configuration paths
- Claude metrics path

### 51. `/security/api-keys` (15+ variables)
API keys and access tokens

All variables ending with `_KEY`, `_TOKEN`:
- Service API keys
- Integration tokens
- Access keys

### 52. `/security/auth` (12 variables)
Authentication and authorization

All variables starting with `AUTH_*`, `JWT_*`, `SESSION_*`:
- JWT secrets
- Session tokens
- Login credentials
- OAuth configuration

### 53. `/security/encryption` (3 variables)
Encryption keys and certificates

- `INFISICAL_ENCRYPTION_KEY`
- `DIFY_ENCRYPTION_KEY`
- `IDENTITY_PROVIDER_CERTIFICATE` (multi-line)
- `IDENTITY_PROVIDER_LOGIN_URL`
- `IDENTITY_PROVIDER_SHA1_FINGERPRINT`

### 54. `/security/passwords` (20+ variables)
Database and service passwords

All variables ending with `_PASSWORD`:
- Database passwords (Postgres, Redis, Neo4j, etc.)
- Admin passwords
- Service authentication

### 55. `/monitoring/metrics` (5 variables)
Metrics and telemetry configuration

- `CLAUDE_FLOW_METRICS_PORT`
- `ARCHON_METRICS_PORT`
- `METRICS_RETENTION_DAYS`
- Telemetry settings

### 56. `/monitoring/logging` (4 variables)
Logging configuration

- `LOG_LEVEL`
- `LOG_RETENTION_DAYS`
- `CLAUDE_FLOW_LOG_LEVEL`
- `ARCHON_LOG_LEVEL`

### 57. `/monitoring/alerts` (3 variables)
Alert thresholds

- `MONITORING_ALERT_CPU`
- `MONITORING_ALERT_DISK`
- `MONITORING_ALERT_MEMORY`

### 58. `/workflows/campaign` (1 variable)
Campaign engine workflows

- `CAMPAIGN_ENGINE_PORT`

### 59. `/workflows/mortgage` (0 variables)
*Reserved for mortgage lead workflows*

### 60. `/workflows/n8n` (7 variables)
*Moved to `/services/n8n`*

### 61. `/git/config` (4 variables)
Git configuration

- `GIT_AUTHOR_EMAIL`
- `GIT_AUTHOR_NAME`

### 62. `/bash/config` (3 variables)
Bash and CLI configuration

- `BASH_DEFAULT_TIMEOUT_MS`
- `BASH_MAX_OUTPUT_LENGTH`
- `BASH_MAX_TIMEOUT_MS`

### 63. `/model-routing` (4 variables)
LLM model routing strategy

- `MODEL_ROUTING_COST_THRESHOLD`
- `MODEL_ROUTING_FALLBACK_CLOUD`
- `MODEL_ROUTING_PREFER_LOCAL`
- `MODEL_ROUTING_STRATEGY`

### 64. `/versioning` (5 variables)
Version pinning

- `NODE_VERSION`
- `PYTHON_VERSION`
- `VOLTA_VERSION`
- `COMPLETION_MODEL`
- `CLAUDE_MODEL`

### 65. `/other-services` (Remaining variables)
Services that need categorization:

- `AGENT_WORK_ORDERS_PORT`
- `CACHE_TTL`
- `CONNECTION_POOL_SIZE`
- `CORS_ALLOWED_ORIGINS`
- `CREATE_GH_RELEASE`
- `DEFAULT_TIMEOUT_S`
- `DESKTOP_COMMANDER_CMD`
- `DISABLE_NON_ESSENTIAL_MODEL_CALLS`
- `DISABLE_PROMPT_CACHING_HAIKU`
- `DISABLE_TELEMETRY`
- `EXA_API_KEY`
- `FINE_GH_PAT`
- `FLOW_NEXUS_*` (8 variables)
- `GITEA_*` (2 variables)
- `HOST`
- `COMPOSIO_API_KEY`
- `MEMORY_CACHE_TYPE`
- `NAMESPACE_*` (4 variables)
- `ONNX_RUNTIME_ENABLED`
- `OWUI_*` (2 variables)
- `PGADMIN_PORT`
- `PORT`
- `PROXY_PORT`
- `QUOTE_API_PORT`
- `RATE_LIMIT_*` (2 variables)
- `REASONINGBANK_*` (4 variables)
- `RUV_SWARM_*` (3 variables)
- `SIMPLE_GH_TOKEN`
- `SLACK_WEBHOOK_URL`
- `SWARM_TOPOLOGY`
- `VITE_SHOW_DEVTOOLS`
- `WEBUI_*` (2 variables)

## Duplicates Found

### Critical Duplicates (Different Values):
1. **GOOGLE_API_KEY** - Two different keys on lines 192 and 208
   - Line 192: `AIzaSyB9whIHRcycHdGKr8tFuKe5KAVGm6cDAqs`
   - Line 208: `AIzaSyAGoltxkY3Ef8XSq7Pr-8fZsoBPz_gz6ZE`
   - **Action Required:** Determine which is correct

### Duplicate Variables (Same Purpose):
2. **ANTHROPIC_API_KEY** vs **CLAUDE_API_KEY** - Same value
3. **GitHub Tokens** - Multiple PATs with similar naming:
   - `GH_PAT`
   - `GH_PERSONAL_ACCESS_TOKEN`
   - `GH_PERSONAL_ACCESS_TOKEN_ALL`
   - `GITHUB_TOKEN`
   - `GH_TOKEN`
   - `FINE_GH_PAT`
   - `SIMPLE_GH_TOKEN`
4. **Docker Hub** - Multiple username/token pairs
5. **Infisical Tokens** - `INFISICAL_ACCESS_TOKEN` and `INFISICAL_TOKEN` (same value)

## Import Strategy

After organizing secrets into specific paths, configure `/shared` to import from:

```bash
/providers/*
/machines/*
/databases/*
/clients/*
/services/*
/config/*
/security/*
/monitoring/*
/workflows/*
```

This allows per-machine exports to pull from `/shared` with machine-specific overrides from `/machines/{machine-name}`.

## Next Steps

1. **Review Duplicates** - Determine correct values for `GOOGLE_API_KEY` and consolidate GitHub tokens
2. **Create Missing Folders** - Use Infisical CLI to create all path folders
3. **Execute Migration** - Run migration script to move secrets to organized paths
4. **Set Up Imports** - Configure `/shared` to import from all organized paths
5. **Generate Per-Machine Configs** - Export machine-specific .env files
6. **Validate** - Test each service can access required secrets
7. **Clean Up** - Remove duplicates and unused variables

## Migration Script

See `migrate-secrets.ps1` for automated migration PowerShell script.

---

**Report Generated:** 2026-01-22
**Total Variables Analyzed:** 397
**Paths Created:** 65+
**Duplicates Found:** 7
