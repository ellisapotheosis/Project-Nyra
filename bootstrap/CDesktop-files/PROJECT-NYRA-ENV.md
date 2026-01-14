# Project Nyra - Environment Variables Guide

## Core Services

### Anthropic Claude
```bash
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_MAX_TOKENS=8192
```

### LiteLLM + OpenRouter
```bash
LITELLM_MASTER_KEY=sk-...
LITELLM_DATABASE_URL=postgresql://...
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_DEFAULT_MODEL=anthropic/claude-sonnet-4
```

### Nexus Router (grafbase/nexus)
```bash
NEXUS_PORT=4000
NEXUS_MCP_PORT=4001
NEXUS_LOG_LEVEL=info
NEXUS_ALLOWED_ORIGINS=http://localhost:3000,https://ratehunter.net
```

### Dify
```bash
DIFY_API_URL=http://localhost:5001
DIFY_API_KEY=app-...
DIFY_CONSOLE_URL=http://localhost:3000
DIFY_POSTGRES_HOST=localhost
DIFY_POSTGRES_PORT=5432
DIFY_POSTGRES_USER=postgres
DIFY_POSTGRES_PASSWORD=...
DIFY_POSTGRES_DB=dify
DIFY_REDIS_HOST=localhost
DIFY_REDIS_PORT=6379
DIFY_REDIS_PASSWORD=...
```

### n8n
```bash
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_ENCRYPTION_KEY=...
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=...
WEBHOOK_URL=https://n8n.ratehunter.net
```

### Activepieces
```bash
AP_ENGINE_EXECUTABLE_PATH=/usr/local/bin/activepieces
AP_FRONTEND_URL=http://localhost:4200
AP_POSTGRES_DATABASE=activepieces
AP_POSTGRES_HOST=localhost
AP_POSTGRES_PORT=5432
AP_POSTGRES_USERNAME=postgres
AP_POSTGRES_PASSWORD=...
AP_REDIS_HOST=localhost
AP_REDIS_PORT=6379
AP_REDIS_PASSWORD=...
AP_ENCRYPTION_KEY=...
AP_JWT_SECRET=...
```

## Memory Systems

### Graphiti
```bash
GRAPHITI_NEO4J_URI=bolt://localhost:7687
GRAPHITI_NEO4J_USER=neo4j
GRAPHITI_NEO4J_PASSWORD=...
GRAPHITI_EMBEDDING_MODEL=openai/text-embedding-3-small
GRAPHITI_LLM_MODEL=anthropic/claude-sonnet-4
```

### Letta (formerly MemGPT)
```bash
LETTA_SERVER_URL=http://localhost:8283
LETTA_API_KEY=sk-letta-...
LETTA_POSTGRES_URI=postgresql://localhost:5432/letta
LETTA_EMBEDDING_MODEL=openai/text-embedding-3-small
LETTA_DEFAULT_LLM=anthropic/claude-sonnet-4
```

### Qdrant (Vector DB)
```bash
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_API_KEY=...
QDRANT_COLLECTION_NAME=nyra-embeddings
QDRANT_GRPC_PORT=6334
```

## TwentyCRM
```bash
TWENTY_CRM_DATABASE_URL=postgresql://localhost:5432/twenty
TWENTY_CRM_API_KEY=...
TWENTY_CRM_WEBHOOK_SECRET=...
TWENTY_CRM_FRONTEND_URL=http://localhost:3001
```

## Cloudflare & Networking

### Cloudflare Tunnel
```bash
CLOUDFLARE_TUNNEL_TOKEN=...
CLOUDFLARE_TUNNEL_NAME=project-nyra
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_ZONE_ID=...
```

### Tailscale
```bash
TAILSCALE_AUTHKEY=tskey-auth-...
TAILSCALE_HOSTNAME=nyra-orchestrator
```

## Mortgage-Specific APIs

### Quote API (Internal FastAPI)
```bash
QUOTE_API_URL=http://localhost:8000
QUOTE_API_KEY=...
ROCKET_MORTGAGE_API_KEY=...
LENDER_PRICE_API_KEY=...
```

### Lead Sources
```bash
FREERATEUPDATE_API_KEY=...
LENDINGTREE_API_KEY=...
LENDINGTREE_WEBHOOK_SECRET=...
LEADMAILBOX_API_KEY=...
```

### LOS Integration
```bash
LENDINGPAD_API_URL=https://api.lendingpad.com
LENDINGPAD_API_KEY=...
LENDINGPAD_USER_ID=...
```

## Development Tools

### Infisical (Secrets Management)
```bash
INFISICAL_CLIENT_ID=...
INFISICAL_CLIENT_SECRET=...
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=dev  # or prod, staging
```

### Claude Flow (Optional - for advanced orchestration)
```bash
CLAUDE_FLOW_API_KEY=...
CLAUDE_FLOW_MEMORY_BACKEND=postgres
CLAUDE_FLOW_SEMANTIC_SEARCH=true
```

### Archon MCP (Optional - for task orchestration)
```bash
ARCHON_MCP_PORT=3333
ARCHON_MCP_LOG_LEVEL=debug
ARCHON_MCP_MAX_WORKERS=4
```

## Production Overrides

### Security
```bash
NODE_ENV=production
SECURE_COOKIES=true
CORS_ORIGIN=https://ratehunter.net
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60000
```

### Monitoring
```bash
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...
LOG_LEVEL=info
```

## Quick Setup Commands

### Development
```bash
# Copy template
cp .env.example .env.development

# Sync from Infisical
infisical secrets export --env=dev > .env.development
```

### Production  
```bash
# Use Infisical injection
infisical run --env=prod -- pnpm start
```

## Security Notes

1. **NEVER commit `.env` files**
2. Use Infisical for all environments
3. Rotate keys quarterly
4. Use separate keys for dev/staging/prod
5. Audit access logs monthly

## Validation Script

```bash
#!/bin/bash
# validate-env.sh

required_vars=(
  "ANTHROPIC_API_KEY"
  "LITELLM_MASTER_KEY"
  "NEXUS_PORT"
  "DIFY_API_KEY"
  "N8N_ENCRYPTION_KEY"
  "GRAPHITI_NEO4J_URI"
  "LETTA_API_KEY"
  "TWENTY_CRM_DATABASE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  echo "❌ Missing required environment variables:"
  printf '  %s\n' "${missing_vars[@]}"
  exit 1
else
  echo "✅ All required environment variables are set"
fi
```
