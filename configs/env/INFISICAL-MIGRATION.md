# Infisical Migration Guide

**Generated**: 2026-01-18
**Project**: Project Nyra
**Infisical Project ID**: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Infisical Project Structure](#infisical-project-structure)
4. [Variable Classification](#variable-classification)
5. [Migration Steps](#migration-steps)
6. [Secrets vs Config Variables](#secrets-vs-config-variables)
7. [Path Organization](#path-organization)
8. [Bulk Import Commands](#bulk-import-commands)
9. [Runtime Integration](#runtime-integration)
10. [Security Best Practices](#security-best-practices)

---

## Overview

This guide documents the migration of environment variables from local `.env` files to Infisical secrets management for **Project Nyra**.

**Benefits of Infisical:**
- Centralized secret management across 4 PCs
- Automatic secret rotation
- Audit logging of secret access
- Role-based access control (RBAC)
- Version control for secrets
- Integration with CI/CD pipelines

---

## Prerequisites

1. **Install Infisical CLI**:
   ```bash
   npm install -g @infisical/cli
   # OR
   brew install infisical/get-cli/infisical  # macOS
   ```

2. **Authenticate**:
   ```bash
   infisical login
   ```

3. **Set Project Context**:
   ```bash
   infisical init --project-id 8374cea9-e5e8-4050-bda4-b91f25ab30ef
   ```

---

## Infisical Project Structure

```
Project Nyra (8374cea9-e5e8-4050-bda4-b91f25ab30ef)
│
├── Environments
│   ├── development/
│   ├── staging/
│   └── production/
│
└── Paths (within each environment)
    ├── /shared                 # Common across all services
    ├── /orchestrator           # PC1 orchestrator-specific
    ├── /worker-rtx3060         # PC2 worker-specific
    ├── /worker-rtx5090         # PC3 worker-specific
    ├── /worker-rtx3090ti       # PC4 worker-specific
    ├── /databases              # Database credentials
    ├── /ai-providers           # LLM API keys
    ├── /communication          # Twilio, SendGrid
    ├── /networking             # Tailscale, Cloudflare
    ├── /mortgage               # Mortgage integrations
    └── /monitoring             # Grafana, Sentry
```

---

## Variable Classification

### Category 1: **SECRETS** (Store in Infisical)
These contain sensitive credentials and should NEVER be committed to git:

- **API Keys**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, `GOOGLE_API_KEY`
- **Database Passwords**: `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `FALKORDB_PASSWORD`
- **Encryption Keys**: `ENCRYPTION_KEY`, `JWT_SECRET`, `SESSION_SECRET`
- **Service Passwords**: `LETTA_API_KEY`, `DIFY_SECRET_KEY`, `N8N_ENCRYPTION_KEY`
- **Communication**: `TWILIO_AUTH_TOKEN`, `SENDGRID_API_KEY`
- **Networking**: `TAILSCALE_AUTH_KEY`, `CLOUDFLARE_TUNNEL_TOKEN`
- **Third-party**: `GITHUB_TOKEN`, `SUPABASE_SERVICE_KEY`, `BITWARDEN_PASSWORD`

**Total Secrets**: ~120 variables

### Category 2: **CONFIG** (Can store locally or in Infisical)
These are non-sensitive configuration:

- **URLs**: `NEXUS_URL`, `DIFY_API_URL`, `N8N_URL`
- **Ports**: `POSTGRES_PORT`, `REDIS_PORT`, `NEXUS_ROUTER_PORT`
- **Feature Flags**: `FEATURE_AI_CHATBOT`, `FEATURE_DRIP_CAMPAIGNS`
- **Resource Limits**: `MAX_CONCURRENT_REQUESTS`, `DB_POOL_MAX`
- **Project Settings**: `PROJECT_NAME`, `NODE_ENV`, `LOG_LEVEL`

**Total Config**: ~330 variables

---

## Secrets vs Config Variables

| Type | Examples | Store in Infisical? | Reasoning |
|------|----------|---------------------|-----------|
| **Secrets** | `ANTHROPIC_API_KEY`, `POSTGRES_PASSWORD` | ✅ YES | Sensitive, must be encrypted |
| **Tokens** | `JWT_SECRET`, `SESSION_SECRET` | ✅ YES | Used for security |
| **URLs** | `NEXUS_URL`, `POSTGRES_HOST` | ⚠️ OPTIONAL | Not sensitive, but centralizes config |
| **Ports** | `POSTGRES_PORT`, `REDIS_PORT` | ❌ NO | Non-sensitive, can be in .env locally |
| **Feature Flags** | `FEATURE_AI_CHATBOT` | ❌ NO | Application config, not secret |
| **Log Levels** | `LOG_LEVEL`, `DEBUG` | ❌ NO | Development/debugging config |

**Recommendation**: Store **all secrets** in Infisical, keep **config** in local `.env` for development flexibility.

---

## Migration Steps

### Step 1: Generate All Required Secrets

```bash
# Generate encryption keys
openssl rand -hex 32  # Copy output for ENCRYPTION_KEY
openssl rand -hex 32  # JWT_SECRET
openssl rand -hex 32  # SESSION_SECRET
openssl rand -hex 32  # NEXUS_JWT_SECRET
openssl rand -hex 32  # NEXUS_ADMIN_TOKEN

# Generate database passwords
openssl rand -hex 32  # POSTGRES_PASSWORD
openssl rand -hex 32  # REDIS_PASSWORD
openssl rand -hex 32  # FALKORDB_PASSWORD

# Generate service-specific secrets
openssl rand -hex 32  # LETTA_API_KEY
openssl rand -hex 32  # DIFY_SECRET_KEY
openssl rand -hex 32  # DIFY_ENCRYPTION_KEY
openssl rand -hex 32  # N8N_ENCRYPTION_KEY
openssl rand -hex 32  # ACTIVEPIECES_API_KEY
openssl rand -hex 32  # AP_ENCRYPTION_KEY
openssl rand -hex 32  # AP_JWT_SECRET
openssl rand -hex 32  # TWENTY_ACCESS_TOKEN_SECRET
openssl rand -hex 32  # TWENTY_LOGIN_TOKEN_SECRET
openssl rand -hex 32  # TWENTY_REFRESH_TOKEN_SECRET
openssl rand -hex 32  # TWENTY_FILE_TOKEN_SECRET
```

### Step 2: Set Secrets in Infisical

#### Option A: Web UI (Recommended for initial setup)
1. Go to https://app.infisical.com
2. Select project: **Project Nyra**
3. Choose environment: **production**
4. Navigate to path: **/shared**
5. Click "Add Secret"
6. Enter key-value pairs

#### Option B: CLI (Recommended for bulk import)
```bash
# Set individual secret
infisical secrets set ANTHROPIC_API_KEY="sk-ant-..." \
  --env production \
  --path /ai-providers

# Bulk import from file (see Step 3)
```

### Step 3: Bulk Import Preparation

Create temporary files for bulk import (NEVER commit these):

#### `secrets-ai-providers.txt`
```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_API_KEY=AIzaSy...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=csk-...
MISTRAL_API_KEY=...
HUGGINGFACE_API_KEY=hf_...
```

#### `secrets-databases.txt`
```bash
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
FALKORDB_PASSWORD=...
NEO4J_PASSWORD=...
QDRANT_API_KEY=...
```

#### `secrets-encryption.txt`
```bash
ENCRYPTION_KEY=...
JWT_SECRET=...
SESSION_SECRET=...
NEXUS_JWT_SECRET=...
NEXUS_ADMIN_TOKEN=...
```

### Step 4: Bulk Import Commands

```bash
# AI Providers
infisical secrets set --env production --path /ai-providers \
  --from-file secrets-ai-providers.txt

# Databases
infisical secrets set --env production --path /databases \
  --from-file secrets-databases.txt

# Encryption Keys
infisical secrets set --env production --path /shared \
  --from-file secrets-encryption.txt

# Communication Services
infisical secrets set --env production --path /communication \
  TWILIO_ACCOUNT_SID="..." \
  TWILIO_AUTH_TOKEN="..." \
  TWILIO_PHONE_NUMBER="+15551234567" \
  SENDGRID_API_KEY="..."

# Networking
infisical secrets set --env production --path /networking \
  TAILSCALE_AUTH_KEY="..." \
  CLOUDFLARE_TUNNEL_TOKEN="..."

# GitHub
infisical secrets set --env production --path /shared \
  GITHUB_TOKEN="ghp_..."

# Service-Specific Secrets
infisical secrets set --env production --path /shared \
  LETTA_API_KEY="..." \
  LETTA_SERVER_PASS="..." \
  DIFY_SECRET_KEY="..." \
  DIFY_ENCRYPTION_KEY="..." \
  N8N_BASIC_AUTH_PASSWORD="..." \
  N8N_ENCRYPTION_KEY="..." \
  ACTIVEPIECES_API_KEY="..." \
  AP_ENCRYPTION_KEY="..." \
  AP_JWT_SECRET="..." \
  TWENTY_ACCESS_TOKEN_SECRET="..." \
  TWENTY_LOGIN_TOKEN_SECRET="..." \
  TWENTY_REFRESH_TOKEN_SECRET="..." \
  TWENTY_FILE_TOKEN_SECRET="..."

# Monitoring
infisical secrets set --env production --path /monitoring \
  GRAFANA_ADMIN_PASSWORD="..." \
  SENTRY_DSN="..."
```

### Step 5: Delete Temporary Files

```bash
# CRITICAL: Securely delete temporary files
rm -P secrets-*.txt  # macOS (secure delete)
# OR
shred -u secrets-*.txt  # Linux (secure delete)
```

---

## Path Organization

### Recommended Infisical Paths

| Path | Purpose | Variables |
|------|---------|-----------|
| `/shared` | Common across all services | `PROJECT_NAME`, `NODE_ENV`, core secrets |
| `/ai-providers` | LLM API keys | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc. |
| `/databases` | Database credentials | `POSTGRES_PASSWORD`, `REDIS_PASSWORD` |
| `/orchestrator` | PC1-specific | Orchestrator-only variables |
| `/worker-rtx3060` | PC2-specific | Worker 3060 tunnel tokens |
| `/worker-rtx5090` | PC3-specific | Worker 5090 tunnel tokens |
| `/worker-rtx3090ti` | PC4-specific | Worker 3090Ti tunnel tokens |
| `/communication` | Twilio, SendGrid | `TWILIO_AUTH_TOKEN`, `SENDGRID_API_KEY` |
| `/networking` | Tailscale, Cloudflare | `TAILSCALE_AUTH_KEY`, tunnel tokens |
| `/mortgage` | Mortgage integrations | `ROCKET_MORTGAGE_API_KEY`, etc. |
| `/monitoring` | Observability | `GRAFANA_ADMIN_PASSWORD`, `SENTRY_DSN` |

---

## Runtime Integration

### Option 1: CLI Injection (Development)

```bash
# Run any command with Infisical secrets injected
infisical run --env production --path /shared -- npm start

# Docker Compose
infisical run --env production --path /shared -- docker-compose up

# Specific service with multiple paths
infisical run --env production --path /shared --path /databases -- npm run dev
```

### Option 2: SDK Integration (Production)

#### JavaScript/TypeScript
```typescript
import { InfisicalClient } from "@infisical/sdk";

const client = new InfisicalClient({
  clientId: process.env.INFISICAL_CLIENT_ID,
  clientSecret: process.env.INFISICAL_CLIENT_SECRET,
});

// Fetch secrets
const secrets = await client.listSecrets({
  environment: "production",
  projectId: "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  path: "/shared",
});

// Apply to process.env
secrets.forEach(({ secretKey, secretValue }) => {
  process.env[secretKey] = secretValue;
});
```

#### Python (FastAPI services)
```python
from infisical import InfisicalClient

client = InfisicalClient(
    client_id=os.getenv("INFISICAL_CLIENT_ID"),
    client_secret=os.getenv("INFISICAL_CLIENT_SECRET"),
)

secrets = client.list_secrets(
    environment="production",
    project_id="8374cea9-e5e8-4050-bda4-b91f25ab30ef",
    path="/shared",
)

for secret in secrets:
    os.environ[secret.secret_key] = secret.secret_value
```

### Option 3: Docker Integration

#### Dockerfile
```dockerfile
FROM node:20-alpine

# Install Infisical CLI
RUN apk add --no-cache curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | sh && \
    apk add infisical

# Copy application
COPY . /app
WORKDIR /app

# Start with Infisical
CMD ["infisical", "run", "--env", "production", "--", "npm", "start"]
```

#### docker-compose.yml
```yaml
services:
  app:
    build: .
    environment:
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
    command: infisical run --env production --path /shared -- npm start
```

---

## Security Best Practices

### 1. **Least Privilege Access**
- Create service accounts with minimal permissions
- Use machine identities (Universal Auth) for programmatic access
- Rotate credentials regularly

### 2. **Environment Separation**
- Use `development` for local development
- Use `staging` for pre-production testing
- Use `production` for live services
- NEVER share secrets between environments

### 3. **Audit Logging**
- Enable audit logs in Infisical dashboard
- Monitor secret access patterns
- Set up alerts for unusual activity

### 4. **Secret Rotation**
```bash
# Rotate API key
infisical secrets update ANTHROPIC_API_KEY="new-key" \
  --env production \
  --path /ai-providers

# Rotate database password
infisical secrets update POSTGRES_PASSWORD="new-password" \
  --env production \
  --path /databases

# Then update PostgreSQL
psql -U postgres -c "ALTER USER postgres PASSWORD 'new-password';"
```

### 5. **Backup Strategy**
```bash
# Export secrets (encrypted)
infisical export --env production --path /shared > backup-$(date +%Y%m%d).enc

# Store backup in secure location (NOT in git)
```

### 6. **Local Development**
For development, use `.env.development`:
```bash
# .env.development (safe to commit with placeholders)
NODE_ENV=development
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
# Actual secrets pulled from Infisical at runtime
```

Run with:
```bash
infisical run --env development -- npm run dev
```

---

## Verification Checklist

After migration, verify:

- [ ] All secrets removed from git history (use `git filter-branch` if needed)
- [ ] `.env` files added to `.gitignore`
- [ ] Infisical CLI working on all 4 PCs
- [ ] Services start successfully with Infisical injection
- [ ] Database connections work with Infisical passwords
- [ ] LLM API calls succeed with Infisical keys
- [ ] Monitoring dashboards accessible with Infisical credentials
- [ ] Audit logs enabled in Infisical dashboard
- [ ] Team members have appropriate access levels
- [ ] Backup/export process tested

---

## Rollback Plan

If issues occur:

1. **Immediate**: Use local `.env.optimal` as fallback
   ```bash
   cp configs/env/.env.optimal .env
   npm start
   ```

2. **Temporary**: Export from Infisical to local file
   ```bash
   infisical export --env production --path /shared > .env
   ```

3. **Investigate**: Check Infisical audit logs for issues

---

## Complete Secret List by Category

### AI/LLM Providers (20 secrets)
```
ANTHROPIC_API_KEY
OPENAI_API_KEY
OPENAI_API_KEY_TERMINAL
OPENAI_API_KEY_CREWAI
OPENAI_API_KEY_NYRA
OPENROUTER_API_KEY
OPENROUTER_API_KEY_DYAD
GOOGLE_API_KEY
GOOGLE_GEMINI_API_KEY
GOOGLE_SEARCH_API_KEY
GROQ_API_KEY
CEREBRAS_API_KEY
MISTRAL_API_KEY
HUGGINGFACE_API_KEY
SAMBANOVA_API_KEY
MORPHLLM_API_KEY
LLAMAINDEX_API_KEY
CONTEXT7_API_KEY
ELEVENLABS_API_KEY
GEMINI_API_KEY (MCP)
```

### Databases (8 secrets)
```
POSTGRES_PASSWORD
POSTGRES_ROOT_PASSWORD
REDIS_PASSWORD
FALKORDB_PASSWORD
NEO4J_PASSWORD
QDRANT_API_KEY
MONGO_ROOT_PASSWORD
LITELLM_DATABASE_PASSWORD
```

### Encryption & Security (15 secrets)
```
ENCRYPTION_KEY
JWT_SECRET
SESSION_SECRET
NEXUS_JWT_SECRET
NEXUS_ADMIN_TOKEN
INFISICAL_CLIENT_ID
INFISICAL_CLIENT_SECRET
INFISICAL_TOKEN
LITELLM_MASTER_KEY
PASSWORDLESS_PUBLIC_KEY
PASSWORDLESS_SECRET_KEY
GITEA_SECRET_KEY
GITEA_INTERNAL_TOKEN
GITEA_ADMIN_PASSWORD
BITWARDEN_PASSWORD
```

### Service-Specific (30 secrets)
```
LETTA_API_KEY
LETTA_SERVER_PASS
LETTA_POSTGRES_PASSWORD
DIFY_SECRET_KEY
DIFY_ENCRYPTION_KEY
DIFY_POSTGRES_PASSWORD
N8N_BASIC_AUTH_PASSWORD
N8N_ENCRYPTION_KEY
N8N_POSTGRES_PASSWORD
ACTIVEPIECES_API_KEY
ACTIVEPIECES_POSTGRES_PASSWORD
AP_ENCRYPTION_KEY
AP_JWT_SECRET
TWENTY_ACCESS_TOKEN_SECRET
TWENTY_LOGIN_TOKEN_SECRET
TWENTY_REFRESH_TOKEN_SECRET
TWENTY_FILE_TOKEN_SECRET
TWENTY_POSTGRES_PASSWORD
MEM0_API_KEY
OPENMEMORY_DB_PASSWORD
GRAPHITI_API_KEY
...
```

### Communication (10 secrets)
```
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
SENDGRID_API_KEY
RESEND_API_KEY
SMTP_USER
SMTP_PASSWORD
```

### Networking (10 secrets)
```
TAILSCALE_AUTH_KEY
CLOUDFLARE_TUNNEL_TOKEN
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3060
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI
CLOUDFLARE_ACCOUNT_ID
```

### Monitoring (5 secrets)
```
GRAFANA_ADMIN_PASSWORD
SENTRY_DSN
PAGERDUTY_INTEGRATION_KEY
SLACK_WEBHOOK_URL
```

### Mortgage Integrations (10 secrets)
```
FREE_RATE_UPDATE_API_KEY
LENDING_TREE_API_KEY
LENDER_PRICE_API_KEY
ROCKET_MORTGAGE_API_KEY
ROCKET_MORTGAGE_PARTNER_ID
```

### Third-Party (10 secrets)
```
GITHUB_TOKEN
GITHUB_PAT
SUPABASE_URL
SUPABASE_SERVICE_KEY
BITWARDEN_CLIENT_ID
BITWARDEN_CLIENT_SECRET
DOCKERHUB_TOKEN
VIRUSTOTAL_API_KEY
ATLASSIAN_API_TOKEN
NOTION_API_KEY
```

**Total Secrets to Migrate**: ~120

---

## Support

- **Infisical Docs**: https://infisical.com/docs
- **Infisical CLI**: https://infisical.com/docs/cli/overview
- **Support**: https://infisical.com/slack

---

**Last Updated**: 2026-01-18
**Maintained By**: Project Nyra Infrastructure Team
