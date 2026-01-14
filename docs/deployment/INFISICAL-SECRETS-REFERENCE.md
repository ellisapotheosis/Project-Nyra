# Infisical Secrets Reference - Project Nyra

**Project ID**: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
**Path**: `/shared`
**Environments**: `dev`, `staging`, `prod`

## Quick Setup

### Option 1: Interactive Script (Recommended)
```powershell
cd infra/infisical
.\set-all-secrets.ps1 -Environment dev
```

### Option 2: Batch Command File
```bash
cd infra/infisical
infisical secrets set --env=dev --path=/shared $(cat secrets-batch.txt)
```

### Option 3: Manual Entry (see commands below)

---

## Core Secrets Required

### 🔐 Database Credentials

```bash
infisical secrets set \
  POSTGRES_USER=nyra \
  POSTGRES_PASSWORD=<YOUR_SECURE_PASSWORD> \
  POSTGRES_DB=nyra_production \
  POSTGRES_HOST=localhost \
  POSTGRES_PORT=5432 \
  LETTA_DB_NAME=letta \
  TWENTY_DB_NAME=twenty \
  DIFY_DB_NAME=dify \
  N8N_DB_NAME=n8n \
  --env=dev --path="/shared"
```

**Generate strong password**:
```powershell
# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

### 🔐 Redis & Cache

```bash
infisical secrets set \
  REDIS_PASSWORD=<YOUR_REDIS_PASSWORD> \
  REDIS_HOST=localhost \
  REDIS_PORT=6379 \
  REDIS_DB=0 \
  REDIS_MAX_MEMORY=4GB \
  REDIS_EVICTION_POLICY=allkeys-lru \
  REDIS_URL=redis://:YOUR_REDIS_PASSWORD@redis:6379 \
  --env=dev --path="/shared"
```

### 🔐 FalkorDB (Graph Database)

```bash
infisical secrets set \
  FALKORDB_PASSWORD=<YOUR_FALKORDB_PASSWORD> \
  FALKORDB_PORT=6380 \
  FALKORDB_AOF_SYNC=everysec \
  FALKORDB_MAX_MEMORY=2GB \
  --env=dev --path="/shared"
```

### 🔐 Qdrant (Vector Database)

```bash
infisical secrets set \
  QDRANT_API_KEY=<YOUR_QDRANT_KEY_OR_EMPTY> \
  QDRANT_PORT=6333 \
  --env=dev --path="/shared"
```

**Note**: Qdrant API key is optional for local development

### 🔐 AI Model APIs

```bash
infisical secrets set \
  ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY> \
  ANTHROPIC_MODEL=claude-sonnet-4-20250514 \
  ANTHROPIC_MAX_TOKENS=4096 \
  OPENROUTER_API_KEY=<YOUR_OPENROUTER_KEY> \
  OPENROUTER_BASE_URL=https://openrouter.ai/api/v1 \
  OPENROUTER_FALLBACK_MODEL=deepseek/deepseek-r1 \
  --env=dev --path="/shared"
```

**Get API keys**:
- Anthropic: https://console.anthropic.com/settings/keys
- OpenRouter: https://openrouter.ai/keys

### 🔐 Letta Memory System

```bash
infisical secrets set \
  LETTA_SERVER_PASSWORD=<YOUR_LETTA_PASSWORD> \
  LETTA_DB_PASSWORD=<YOUR_LETTA_DB_PASSWORD> \
  LETTA_POSTGRES_URI=postgresql://letta:YOUR_LETTA_DB_PASSWORD@postgresql:5432/letta \
  --env=dev --path="/shared"
```

---

## Service Configuration (No secrets)

### Claude Flow
```bash
infisical secrets set \
  CLAUDE_FLOW_PORT=9000 \
  CLAUDE_FLOW_MODE=orchestrator \
  CLAUDE_FLOW_TELEMETRY_ENABLED=true \
  CLAUDE_FLOW_PERFORMANCE_MODE=optimized \
  CLAUDE_FLOW_AUTO_COMMIT=true \
  CLAUDE_FLOW_HOOKS_ENABLED=true \
  CLAUDE_FLOW_NEURAL_OPTIMIZATION=true \
  --env=dev --path="/shared"
```

### Archon OS
```bash
infisical secrets set \
  ARCHON_PORT=9001 \
  ARCHON_MCP_PORT=3333 \
  ARCHON_TOPOLOGY=hierarchical \
  ARCHON_MAX_DEPTH=5 \
  ARCHON_PARALLEL_BRANCHES=true \
  --env=dev --path="/shared"
```

### Nexus Router
```bash
infisical secrets set \
  NEXUS_ROUTER_PORT=8000 \
  NEXUS_ROUTER_MCP_PORT=4001 \
  MODEL_ROUTING_STRATEGY=cost-optimized \
  MODEL_ROUTING_PREFER_LOCAL=true \
  MODEL_ROUTING_FALLBACK_CLOUD=true \
  MODEL_ROUTING_COST_THRESHOLD=0.10 \
  --env=dev --path="/shared"
```

### GPU Workers
```bash
infisical secrets set \
  WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434 \
  WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0 \
  WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434 \
  WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M \
  WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434 \
  WORKER_3060_MODELS=codellama:34b-instruct-q8_0,qwen2.5:32b-instruct-q8_0 \
  --env=dev --path="/shared"
```

### Database URL
```bash
infisical secrets set \
  DATABASE_URL=postgresql://nyra:YOUR_POSTGRES_PASSWORD@postgresql:5432/nyra_production \
  --env=dev --path="/shared"
```

### MCP Server URLs
```bash
infisical secrets set \
  CLAUDE_FLOW_MCP_URL=http://claude-flow:9000/mcp \
  ARCHON_MCP_URL=http://archon-os:9001/mcp \
  INFISICAL_MCP_URL=http://infisical-mcp:4002 \
  BITWARDEN_MCP_URL=http://bitwarden-mcp:4003 \
  --env=dev --path="/shared"
```

---

## Optional Integrations

### GitHub (Optional)
```bash
infisical secrets set \
  GITHUB_TOKEN=<YOUR_GITHUB_PAT> \
  GITHUB_REPO=Project-Nyra \
  GITHUB_OWNER=<YOUR_GITHUB_USERNAME> \
  --env=dev --path="/shared"
```

**Create token**: https://github.com/settings/tokens
**Scopes needed**: `repo`, `workflow`

### Twilio (Optional - for SMS/Voice)
```bash
infisical secrets set \
  TWILIO_ACCOUNT_SID=<YOUR_TWILIO_SID> \
  TWILIO_AUTH_TOKEN=<YOUR_TWILIO_TOKEN> \
  TWILIO_PHONE_NUMBER=<YOUR_TWILIO_NUMBER> \
  --env=dev --path="/shared"
```

### SendGrid (Optional - for emails)
```bash
infisical secrets set \
  SENDGRID_API_KEY=<YOUR_SENDGRID_KEY> \
  SENDGRID_FROM_EMAIL=noreply@ratehunter.net \
  --env=dev --path="/shared"
```

### Tailscale (Optional - for secure networking)
```bash
infisical secrets set \
  TAILSCALE_AUTH_KEY=<YOUR_TAILSCALE_KEY> \
  --env=dev --path="/shared"
```

### Cloudflare Tunnel (Optional - for public access)
```bash
infisical secrets set \
  CLOUDFLARE_TUNNEL_TOKEN=<YOUR_CF_TOKEN> \
  CLOUDFLARE_ACCOUNT_ID=<YOUR_CF_ACCOUNT> \
  --env=dev --path="/shared"
```

---

## Verification

### Check all secrets are set
```bash
infisical secrets get --env=dev --path=/shared
```

### Check specific secret
```bash
infisical secrets get POSTGRES_PASSWORD --env=dev --path=/shared
```

### Export secrets to .env file (for local testing)
```bash
infisical secrets --env=dev --path=/shared --output=dotenv > .env.local
```

---

## Environment-Specific Values

### Development Environment
- `POSTGRES_PASSWORD`: Simple password for local dev
- `NODE_ENV=development`
- `LOG_LEVEL=debug`
- `CLAUDE_FLOW_TELEMETRY_ENABLED=false`

### Staging Environment
- Use production-like secrets
- `NODE_ENV=staging`
- `LOG_LEVEL=info`

### Production Environment
- **Strong passwords** (32+ characters, random)
- `NODE_ENV=production`
- `LOG_LEVEL=warn`
- Enable monitoring and audit logging

---

## Security Best Practices

1. **Never commit secrets to git**
2. **Use strong, unique passwords** for each service
3. **Rotate secrets** every 90 days
4. **Use different secrets** for dev/staging/prod
5. **Enable MFA** on Infisical account
6. **Audit secret access** regularly
7. **Use Machine Identity** for CI/CD pipelines

---

## Troubleshooting

### "Invalid project ID"
Check that you're using the correct project ID:
```bash
8374cea9-e5e8-4050-bda4-b91f25ab30ef
```

### "No secrets found"
Ensure you're logged in:
```bash
infisical login
```

### "Permission denied"
Check you have access to the `/shared` path in Infisical web UI

### "Connection refused"
Verify Infisical API is accessible:
```bash
curl https://app.infisical.com/api/status
```

---

## Next Steps After Setting Secrets

1. **Verify secrets**: `infisical secrets get --env=dev --path=/shared`
2. **Start services**: `cd infra/docker && .\start-all.ps1 -Environment dev`
3. **Check health**: `curl http://localhost:8000/health`
4. **View logs**: `docker compose logs -f nexus-router`

---

## Complete Minimal Secret List (Copy-Paste Ready)

For a **minimal working setup**, you need these secrets:

```bash
# Required for basic operation
infisical secrets set \
  POSTGRES_PASSWORD=your_secure_pg_pass_here \
  REDIS_PASSWORD=your_secure_redis_pass_here \
  FALKORDB_PASSWORD=your_secure_falkor_pass_here \
  ANTHROPIC_API_KEY=sk-ant-your-key-here \
  OPENROUTER_API_KEY=sk-or-your-key-here \
  LETTA_SERVER_PASSWORD=your_letta_pass_here \
  LETTA_DB_PASSWORD=your_letta_db_pass_here \
  --env=dev --path="/shared" --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

**That's it!** These 7 secrets will get the system running.

---

**Documentation**: `docs/deployment/QUICK-START.md`
**Full Setup Script**: `infra/infisical/set-all-secrets.ps1`
