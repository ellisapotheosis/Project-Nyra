# Project Nyra - Environment Variables Guide

**Last Updated**: January 18, 2026
**Version**: 5.0.0
**Total Variables**: 80+ configurations

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Per-PC Variable Distribution](#per-pc-variable-distribution)
4. [Infisical Migration](#infisical-migration)
5. [Complete Variable Reference](#complete-variable-reference)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Overview

Project Nyra uses a centralized environment variable system with:
- **Master template**: `.env.example` (80+ variables documented)
- **PC-specific configs**: Per-PC environment files
- **Infisical integration**: Production secrets management
- **Docker integration**: All compose files reference .env
- **Security**: Secrets never committed to git

### Environment Hierarchy

```
Production (Infisical)
    ↓ overrides
Per-PC .env files
    ↓ overrides
.env (local development)
    ↓ uses
.env.example (master template)
```

---

## Quick Start

### 1. Initial Setup

```bash
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra

# Copy master template
cp .env.example .env

# Generate secrets (on Windows with Git Bash)
openssl rand -hex 32

# Or on PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Fill in REQUIRED values in .env
notepad .env
```

### 2. Validate Configuration

```bash
# Use validation script
./scripts/validate-env.sh

# Or manually check for required variables
grep "REQUIRED" .env.example
```

### 3. Start Services

```bash
# Start with environment file
docker compose --env-file .env up -d

# Or start specific stack
docker compose -f infra/docker/docker-compose.orchestration.yml up -d
```

---

## Per-PC Variable Distribution

### 🖥️ PC1 - Orchestrator (Mini PC)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\.env`

**Required Variables:**
```bash
# === ORCHESTRATOR-SPECIFIC ===
NYRA_PC_ID=orchestrator
NYRA_ENVIRONMENT=production
NODE_ENV=production

# === DATABASES (Orchestrator Only) ===
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<generate-with-openssl>
POSTGRES_PORT=5432
REDIS_PASSWORD=<generate-with-openssl>
REDIS_PORT=6380
FALKORDB_PASSWORD=<generate-with-openssl>

# === MCP SERVERS (Orchestrator Only) ===
NEXUS_ROUTER_PORT=7000
NEXUS_JWT_SECRET=<generate-with-openssl>
NEXUS_ADMIN_TOKEN=<generate-with-openssl>
MCP_VSCODE_PORT=8081
MCP_TWENTYCRM_PORT=8082
MCP_DIFY_PORT=8083
MCP_FILESYSTEM_PORT=8084
MCP_GITHUB_PORT=8085
[... 8 more MCP ports ...]

# === ORCHESTRATION (Orchestrator Only) ===
LETTA_API_KEY=<generate-with-openssl>
LETTA_SERVER_PASS=<strong-password>
GRAPHITI_API_KEY=<optional-for-cloud>
MEM0_API_KEY=<optional-for-cloud>

# === MONITORING (Orchestrator Only) ===
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
GRAFANA_ADMIN_PASSWORD=<strong-password>

# === SHARED (All PCs) ===
ANTHROPIC_API_KEY=<from-console.anthropic.com>
GOOGLE_API_KEY=<from-aistudio.google.com>
OPENROUTER_API_KEY=<optional-from-openrouter.ai>

# === INFISICAL (All PCs) ===
INFISICAL_TOKEN=<production-only>
INFISICAL_PROJECT_ID=<production-only>
INFISICAL_ENVIRONMENT=production
```

**Services Running:**
- PostgreSQL (pgvector)
- Redis
- FalkorDB
- Qdrant
- Letta
- Grafana
- Prometheus
- Loki
- Claude Flow daemon
- Nexus Router (MCP gateway)
- All 12 MCP servers

**Total Variables**: ~60

---

### 🎮 PC2 - Worker 1 (RTX 4090)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\configs\.env.worker1`

**Required Variables:**
```bash
# === WORKER-SPECIFIC ===
NYRA_PC_ID=worker-1
NYRA_MODE=worker
NYRA_GPU_TYPE=rtx_4090
NYRA_WORKER_ID=1
NODE_ENV=production

# === ORCHESTRATOR CONNECTION ===
ORCHESTRATOR_URL=https://nyra-orchestrator.ratehunter.net
METAMCP_GATEWAY_URL=http://172.20.0.50:8005

# === CLOUDFLARE TUNNEL ===
CLOUDFLARED_TOKEN=<worker-1-tunnel-token>
CLOUDFLARE_TUNNEL_NAME=nyra-worker-1

# === LOCAL GPU INFERENCE ===
OLLAMA_PORT=11434
VLLM_PORT=8001
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*

# === SHARED (All PCs) ===
ANTHROPIC_API_KEY=<from-console.anthropic.com>
GOOGLE_API_KEY=<from-aistudio.google.com>
OPENROUTER_API_KEY=<optional>

# === INFISICAL (All PCs) ===
INFISICAL_TOKEN=<production-only>
INFISICAL_PROJECT_ID=<production-only>
INFISICAL_ENVIRONMENT=production
```

**Services Running:**
- Ollama (GPU)
- vLLM (GPU)
- Worker agent daemon
- Cloudflared tunnel

**Total Variables**: ~15

---

### 🎮 PC3 - Worker 2 (RTX 4090)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\configs\.env.worker2`

**Required Variables:**
```bash
# === WORKER-SPECIFIC ===
NYRA_PC_ID=worker-2
NYRA_MODE=worker
NYRA_GPU_TYPE=rtx_4090
NYRA_WORKER_ID=2
NODE_ENV=production

# === ORCHESTRATOR CONNECTION ===
ORCHESTRATOR_URL=https://nyra-orchestrator.ratehunter.net
METAMCP_GATEWAY_URL=http://172.20.0.50:8005

# === CLOUDFLARE TUNNEL ===
CLOUDFLARED_TOKEN=<worker-2-tunnel-token>
CLOUDFLARE_TUNNEL_NAME=nyra-worker-2

# === LOCAL GPU INFERENCE ===
OLLAMA_PORT=11434
VLLM_PORT=8001
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*

# === SHARED (All PCs) ===
ANTHROPIC_API_KEY=<from-console.anthropic.com>
GOOGLE_API_KEY=<from-aistudio.google.com>
OPENROUTER_API_KEY=<optional>

# === INFISICAL (All PCs) ===
INFISICAL_TOKEN=<production-only>
INFISICAL_PROJECT_ID=<production-only>
INFISICAL_ENVIRONMENT=production
```

**Services Running:**
- Ollama (GPU)
- vLLM (GPU)
- Worker agent daemon
- Cloudflared tunnel

**Total Variables**: ~15

---

### 🎮 PC4 - Worker 3 (RTX 4090)

**Location**: `C:\Dev\Projects\Repos\Project-Nyra\configs\.env.worker3`

**Required Variables:**
```bash
# === WORKER-SPECIFIC ===
NYRA_PC_ID=worker-3
NYRA_MODE=worker
NYRA_GPU_TYPE=rtx_4090
NYRA_WORKER_ID=3
NODE_ENV=production

# === ORCHESTRATOR CONNECTION ===
ORCHESTRATOR_URL=https://nyra-orchestrator.ratehunter.net
METAMCP_GATEWAY_URL=http://172.20.0.50:8005

# === CLOUDFLARE TUNNEL ===
CLOUDFLARED_TOKEN=<worker-3-tunnel-token>
CLOUDFLARE_TUNNEL_NAME=nyra-worker-3

# === LOCAL GPU INFERENCE ===
OLLAMA_PORT=11434
VLLM_PORT=8001
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*

# === SHARED (All PCs) ===
ANTHROPIC_API_KEY=<from-console.anthropic.com>
GOOGLE_API_KEY=<from-aistudio.google.com>
OPENROUTER_API_KEY=<optional>

# === INFISICAL (All PCs) ===
INFISICAL_TOKEN=<production-only>
INFISICAL_PROJECT_ID=<production-only>
INFISICAL_ENVIRONMENT=production
```

**Services Running:**
- Ollama (GPU)
- vLLM (GPU)
- Worker agent daemon
- Cloudflared tunnel

**Total Variables**: ~15

---

## Infisical Migration

### Why Infisical?

**Benefits:**
- ✅ Centralized secrets management
- ✅ Per-PC secret isolation
- ✅ Automatic secret rotation
- ✅ Audit logging
- ✅ No .env files needed in production
- ✅ Secrets never committed to git
- ✅ Team collaboration with access control

### Migration Steps

#### 1. Install Infisical CLI

```powershell
# Windows (PowerShell)
Invoke-WebRequest -Uri https://infisical.com/cli/install.ps1 -OutFile install.ps1
.\install.ps1

# Or with Scoop
scoop bucket add infisical https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

```bash
# Linux (Bash)
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install infisical
```

#### 2. Login to Infisical

```bash
# Interactive login
infisical login

# Or use service token
infisical login --service-token <your-service-token>
```

#### 3. Create Project Structure

```bash
# Create project
infisical project create --name "Project Nyra"

# Get project ID
infisical project list
# Copy the project ID

# Set in .env
echo "INFISICAL_PROJECT_ID=<project-id>" >> .env
```

#### 4. Create Environments

```bash
# Create production environment
infisical environments create --project-id <project-id> --name production

# Create development environment
infisical environments create --project-id <project-id> --name development

# Create per-PC paths
# /nyra/orchestrator
# /nyra/worker-1
# /nyra/worker-2
# /nyra/worker-3
```

#### 5. Import Existing Secrets

```bash
# Navigate to project root
cd C:\Dev\Projects\Repos\Project-Nyra

# Import from .env to orchestrator path
infisical secrets upload \
  --env production \
  --path /nyra/orchestrator \
  --file .env

# Import worker-specific secrets
infisical secrets upload \
  --env production \
  --path /nyra/worker-1 \
  --file configs/.env.worker1

infisical secrets upload \
  --env production \
  --path /nyra/worker-2 \
  --file configs/.env.worker2

infisical secrets upload \
  --env production \
  --path /nyra/worker-3 \
  --file configs/.env.worker3
```

#### 6. Test Infisical Integration

```bash
# Test orchestrator secrets
infisical run --env production --path /nyra/orchestrator -- env | grep POSTGRES_PASSWORD

# Test worker secrets
infisical run --env production --path /nyra/worker-1 -- env | grep OLLAMA_PORT
```

#### 7. Update Docker Compose

Already configured in `docker-compose.infisical.yml`:

```yaml
services:
  nyra-orchestrator:
    # ... other config ...
    command: >
      sh -c "infisical run --env=production --path=/nyra/orchestrator --
             node src/orchestrator/main.js"
```

#### 8. Generate Service Tokens

```bash
# Generate token for PC1 (orchestrator)
infisical token create \
  --name "PC1-Orchestrator" \
  --project-id <project-id> \
  --env production \
  --path /nyra/orchestrator

# Save token to PC1 .env
echo "INFISICAL_TOKEN=<token>" > .env.infisical

# Repeat for each worker PC
```

### Infisical Best Practices

**DO:**
- ✅ Use service tokens for production
- ✅ Use separate tokens per PC
- ✅ Rotate tokens every 90 days
- ✅ Use different environments (dev/prod)
- ✅ Use paths for PC isolation (/nyra/orchestrator, /nyra/worker-1)
- ✅ Enable audit logging
- ✅ Set up secret rotation schedules

**DON'T:**
- ❌ Share service tokens between PCs
- ❌ Commit INFISICAL_TOKEN to git
- ❌ Use same token for dev and prod
- ❌ Give broad access to tokens
- ❌ Disable audit logging
- ❌ Use plain text .env in production

---

## Complete Variable Reference

### Category 1: Infisical Integration

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `INFISICAL_TOKEN` | Prod | All | - | Service token for Infisical auth |
| `INFISICAL_PROJECT_ID` | Prod | All | - | Project Nyra project ID |
| `INFISICAL_ENVIRONMENT` | No | All | development | Environment: development/staging/production |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_ID` | No | All | - | Alternative universal auth ID |
| `INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET` | No | All | - | Alternative universal auth secret |

### Category 2: Database (PostgreSQL)

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `POSTGRES_USER` | Yes | Orch | postgres | PostgreSQL superuser |
| `POSTGRES_PASSWORD` | Yes | Orch | - | PostgreSQL password (generate) |
| `POSTGRES_PORT` | No | Orch | 5432 | PostgreSQL port |
| `POSTGRES_DB` | No | Orch | nyra_db | Default database name |

**Auto-created databases**: dify, twenty, letta, n8n, litellm, nyra, activepieces

### Category 3: Redis

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `REDIS_PASSWORD` | Yes | Orch | - | Redis password (generate) |
| `REDIS_PORT` | No | Orch | 6380 | Redis port (6380 to avoid FalkorDB conflict) |

### Category 4: FalkorDB

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `FALKORDB_PASSWORD` | Yes | Orch | - | FalkorDB password (generate) |

### Category 5: LLM API Keys

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `ANTHROPIC_API_KEY` | Yes | All | - | Claude API key from console.anthropic.com |
| `GOOGLE_API_KEY` | Yes | All | - | Gemini API key from aistudio.google.com |
| `GOOGLE_GEMINI_API_KEY` | No | All | - | Alias for GOOGLE_API_KEY |
| `OPENROUTER_API_KEY` | No | All | - | OpenRouter fallback API key |
| `CONTEXT7_API_KEY` | No | All | - | Context7 enhanced context API key |

### Category 6: Nexus Router

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `NEXUS_ROUTER_PORT` | No | Orch | 7000 | Nexus unified gateway port |
| `NEXUS_URL` | No | Orch | http://localhost:7000 | Nexus base URL |
| `NEXUS_JWT_SECRET` | Yes | Orch | - | JWT signing secret (generate) |
| `NEXUS_ADMIN_TOKEN` | Yes | Orch | - | Admin API token (generate) |

### Category 7: N8N Workflow Automation

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PORT_N8N` | No | Orch | 5678 | N8N web UI port |
| `N8N_URL` | No | Orch | http://localhost:5678 | N8N base URL |
| `N8N_BASIC_AUTH_USER` | No | Orch | admin | N8N admin username |
| `N8N_BASIC_AUTH_PASSWORD` | Yes | Orch | - | N8N admin password |
| `N8N_ENCRYPTION_KEY` | Yes | Orch | - | N8N data encryption key (generate) |
| `N8N_HOST` | No | Orch | localhost | N8N hostname |

### Category 8: Activepieces

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PORT_ACTIVEPIECES` | No | Orch | 3002 | Activepieces UI port |
| `ACTIVEPIECES_API_KEY` | Yes | Orch | - | Activepieces API key (generate) |
| `AP_ENCRYPTION_KEY` | Yes | Orch | - | Encryption key (generate) |
| `AP_JWT_SECRET` | Yes | Orch | - | JWT secret (generate) |

### Category 9: Dify AI

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PORT_DIFY` | No | Orch | 3001 | Dify web UI port |
| `DIFY_URL` | No | Orch | http://localhost:3001 | Dify base URL |
| `DIFY_SECRET_KEY` | Yes | Orch | - | Dify secret key (generate) |
| `DIFY_ENCRYPTION_KEY` | Yes | Orch | - | Dify encryption key (generate) |

### Category 10: TwentyCRM

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PORT_TWENTYCRM` | No | Orch | 3010 | TwentyCRM UI port |
| `TWENTY_CRM_URL` | No | Orch | http://localhost:3010 | TwentyCRM base URL |
| `TWENTY_ACCESS_TOKEN_SECRET` | Yes | Orch | - | Access token secret (generate) |
| `TWENTY_LOGIN_TOKEN_SECRET` | Yes | Orch | - | Login token secret (generate) |
| `TWENTY_REFRESH_TOKEN_SECRET` | Yes | Orch | - | Refresh token secret (generate) |
| `TWENTY_FILE_TOKEN_SECRET` | Yes | Orch | - | File token secret (generate) |

### Category 11: Letta Memory

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PORT_LETTA` | No | Orch | 8283 | Letta API port |
| `LETTA_URL` | No | Orch | http://localhost:8283 | Letta base URL |
| `LETTA_API_KEY` | Yes | Orch | - | Letta API key (generate) |
| `LETTA_SERVER_PASS` | Yes | Orch | - | Letta admin password |

### Category 12: Graphiti MCP

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `GRAPHITI_API_KEY` | No | Orch | - | Graphiti cloud API key (optional) |
| `GRAPHITI_TEMPORAL_TRACKING` | No | Orch | true | Enable temporal tracking |
| `GRAPHITI_RELATIONSHIP_INFERENCE` | No | Orch | true | Enable relationship inference |

### Category 13: Mem0

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `MEM0_API_KEY` | No | Orch | - | Mem0 cloud API key (optional) |
| `MEM0_PORT` | No | Orch | 8081 | Mem0 local port |
| `MEM0_URL` | No | Orch | http://localhost:4321 | Mem0 base URL |
| `MEM0_DEFAULT_USER_ID` | No | Orch | default | Default user ID |
| `MEM0_BASE_URL` | No | Orch | https://api.mem0.ai | Mem0 cloud base URL |

### Category 14: Monitoring

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `PROMETHEUS_PORT` | No | Orch | 9090 | Prometheus metrics port |
| `PROMETHEUS_RETENTION` | No | Orch | 15d | Metrics retention period |
| `GRAFANA_PORT` | No | Orch | 3000 | Grafana UI port |
| `GRAFANA_ADMIN_USER` | No | Orch | admin | Grafana admin username |
| `GRAFANA_ADMIN_PASSWORD` | Yes | Orch | - | Grafana admin password |

### Category 15: MCP Servers (12 ports)

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `MCP_VSCODE_PORT` | No | Orch | 8081 | VSCode MCP port |
| `MCP_TWENTYCRM_PORT` | No | Orch | 8082 | TwentyCRM MCP port |
| `MCP_DIFY_PORT` | No | Orch | 8083 | Dify MCP port |
| `MCP_FILESYSTEM_PORT` | No | Orch | 8084 | Filesystem MCP port |
| `MCP_GITHUB_PORT` | No | Orch | 8085 | GitHub MCP port |
| `MCP_BRAVE_SEARCH_PORT` | No | Orch | 8086 | Brave Search MCP port |
| `MCP_BITWARDEN_PORT` | No | Orch | 8087 | Bitwarden MCP port |
| `MCP_GITLAB_PORT` | No | Orch | 8088 | GitLab MCP port |
| `MCP_GOOGLE_MAPS_PORT` | No | Orch | 8089 | Google Maps MCP port |
| `MCP_SENTRY_PORT` | No | Orch | 8090 | Sentry MCP port |
| `MCP_SLACK_PORT` | No | Orch | 8091 | Slack MCP port |
| `MCP_POSTGRES_PORT` | No | Orch | 8092 | PostgreSQL MCP port |

### Category 16: Worker Configuration

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `NYRA_PC_ID` | Yes | All | - | PC identifier (orchestrator/worker-1/worker-2/worker-3) |
| `NYRA_MODE` | Yes | Workers | worker | Operating mode (orchestrator/worker) |
| `NYRA_GPU_TYPE` | Yes | Workers | - | GPU type (rtx_4090/rtx_3060/rtx_3090ti) |
| `NYRA_WORKER_ID` | Yes | Workers | - | Worker number (1/2/3) |
| `ORCHESTRATOR_URL` | Yes | Workers | - | Orchestrator endpoint URL |
| `OLLAMA_PORT` | No | Workers | 11434 | Ollama inference port |
| `VLLM_PORT` | No | Workers | 8001 | vLLM inference port |
| `OLLAMA_HOST` | No | Workers | 0.0.0.0:11434 | Ollama bind address |
| `OLLAMA_ORIGINS` | No | Workers | * | Ollama CORS origins |

### Category 17: Cloudflare Tunnels

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `CLOUDFLARED_TOKEN` | Yes | All | - | Cloudflare tunnel token (unique per PC) |
| `CLOUDFLARE_TUNNEL_NAME` | No | All | nyra-tunnel | Tunnel name |

### Category 18: Domain Configuration

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `DOMAIN` | No | Orch | ratehunter.net | Primary domain |
| `SUBDOMAIN_NYRA` | No | Orch | nyra.ratehunter.net | Nyra subdomain |
| `SUBDOMAIN_API` | No | Orch | api.ratehunter.net | API subdomain |
| `SUBDOMAIN_ADMIN` | No | Orch | admin.ratehunter.net | Admin subdomain |

### Category 19: Communication Services

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `TWILIO_ACCOUNT_SID` | Yes | Orch | - | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Orch | - | Twilio auth token |
| `TWILIO_PHONE_NUMBER` | Yes | Orch | - | Twilio phone number (+15551234567) |
| `SMTP_HOST` | No | Orch | smtp.gmail.com | SMTP server hostname |
| `SMTP_PORT` | No | Orch | 587 | SMTP server port |
| `SMTP_USER` | Yes | Orch | - | SMTP username/email |
| `SMTP_PASSWORD` | Yes | Orch | - | SMTP password/app-specific password |
| `SMTP_FROM_EMAIL` | Yes | Orch | - | From email address |
| `SMTP_FROM_NAME` | No | Orch | RateHunter Team | From display name |

### Category 20: General Configuration

| Variable | Required | PC | Default | Description |
|----------|----------|----|---------| ------------|
| `NODE_ENV` | No | All | development | Node environment (development/staging/production) |
| `ENVIRONMENT` | No | All | development | Application environment |
| `DEBUG` | No | All | claude-flow:*,archon:* | Debug namespaces |
| `LOG_LEVEL` | No | All | INFO | Logging level (DEBUG/INFO/WARN/ERROR) |

---

## Security Best Practices

### 1. Secret Generation

**DO:**
```bash
# ✅ Use cryptographically secure random generation
openssl rand -hex 32

# ✅ Use different secrets for each service
POSTGRES_PASSWORD=$(openssl rand -hex 32)
REDIS_PASSWORD=$(openssl rand -hex 32)
NEXUS_JWT_SECRET=$(openssl rand -hex 32)

# ✅ Store in password manager
# Copy to Bitwarden/1Password before use
```

**DON'T:**
```bash
# ❌ Use weak or predictable passwords
POSTGRES_PASSWORD=password123

# ❌ Reuse secrets across services
REDIS_PASSWORD=mypassword
POSTGRES_PASSWORD=mypassword

# ❌ Use short secrets
NEXUS_JWT_SECRET=abc123
```

### 2. File Permissions

```bash
# Set restrictive permissions on .env files
chmod 600 .env
chmod 600 configs/.env.*

# Verify permissions
ls -la .env
# Should show: -rw------- (600)
```

### 3. Git Security

```bash
# Ensure .env files are in .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
echo "!.env.example" >> .gitignore

# Verify not tracked
git status --ignored

# If accidentally committed
git rm --cached .env
git commit -m "Remove .env from git tracking"
```

### 4. Secret Rotation Schedule

| Secret Type | Rotation Frequency | Method |
|-------------|-------------------|--------|
| Database passwords | Every 90 days | Update .env + restart services |
| API keys (external) | When compromised | Regenerate at provider |
| JWT secrets | Every 180 days | Update .env + invalidate sessions |
| Service tokens | Every 60 days | Regenerate + update services |
| Infisical tokens | Every 90 days | Regenerate in dashboard |

### 5. Access Control

**Production Environment:**
- ✅ Use Infisical for all secrets
- ✅ Use service tokens with minimal permissions
- ✅ Use different tokens per PC
- ✅ Enable audit logging
- ✅ Implement role-based access control (RBAC)
- ✅ Review access logs monthly

**Development Environment:**
- ✅ Use local .env files
- ✅ Never use production credentials
- ✅ Use mock/test API keys when possible
- ✅ Rotate dev secrets every 6 months

---

## Troubleshooting

### Issue 1: Services Can't Find Environment Variables

**Symptoms:**
- Service fails to start
- Error: "Environment variable X not found"
- Database connection refused

**Solutions:**
```bash
# 1. Verify .env file exists
ls -la .env

# 2. Check variable is in .env
grep POSTGRES_PASSWORD .env

# 3. Restart services with explicit env file
docker compose --env-file .env up -d

# 4. Check Docker can read .env
docker compose config | grep POSTGRES

# 5. If using Infisical, verify token
infisical secrets list --env production --path /nyra/orchestrator
```

### Issue 2: Infisical Token Expired

**Symptoms:**
- Error: "Invalid or expired token"
- Services fail to fetch secrets
- Infisical authentication error

**Solutions:**
```bash
# 1. Generate new service token
infisical token create --name "New-Token" --project-id <id> --env production

# 2. Update .env
echo "INFISICAL_TOKEN=<new-token>" > .env.infisical

# 3. Restart services
docker compose restart

# 4. Verify token works
infisical run --env production --path /nyra/orchestrator -- env | grep POSTGRES_PASSWORD
```

### Issue 3: Wrong Secrets on Wrong PC

**Symptoms:**
- Worker tries to start orchestrator services
- Database connection errors on workers
- Port conflicts

**Solutions:**
```bash
# 1. Verify NYRA_PC_ID is set correctly
grep NYRA_PC_ID .env

# 2. Check using correct .env file
ls -la configs/.env.worker1

# 3. If using Infisical, verify correct path
# PC1 should use: /nyra/orchestrator
# PC2 should use: /nyra/worker-1
# PC3 should use: /nyra/worker-2
# PC4 should use: /nyra/worker-3

# 4. Update Infisical path in docker-compose
grep "infisical run" docker-compose.infisical.yml
```

### Issue 4: Missing Required Variables

**Symptoms:**
- Validation script fails
- Service starts but doesn't function
- Authentication errors

**Solutions:**
```bash
# 1. Run validation
./scripts/validate-env.sh

# 2. Check against .env.example
diff <(sort .env.example | grep "REQUIRED") <(sort .env | grep "REQUIRED")

# 3. Generate missing secrets
openssl rand -hex 32

# 4. Add to .env
echo "MISSING_VAR=<generated-value>" >> .env

# 5. Restart affected services
docker compose restart <service-name>
```

### Issue 5: Variable Override Not Working

**Symptoms:**
- Changes to .env don't take effect
- Service uses old value
- Cached environment

**Solutions:**
```bash
# 1. Stop all services
docker compose down

# 2. Remove containers (not volumes)
docker compose rm -f

# 3. Clear Docker build cache
docker builder prune

# 4. Restart with fresh build
docker compose up -d --build

# 5. Verify new value
docker exec <container-name> env | grep <VARIABLE_NAME>
```

---

## Quick Reference Cards

### Orchestrator .env (Minimal)

```bash
# Copy this for quickstart - replace <generate> with: openssl rand -hex 32
NYRA_PC_ID=orchestrator
POSTGRES_PASSWORD=<generate>
REDIS_PASSWORD=<generate>
FALKORDB_PASSWORD=<generate>
ANTHROPIC_API_KEY=<from-console.anthropic.com>
GOOGLE_API_KEY=<from-aistudio.google.com>
NEXUS_JWT_SECRET=<generate>
NEXUS_ADMIN_TOKEN=<generate>
LETTA_API_KEY=<generate>
LETTA_SERVER_PASS=<strong-password>
GRAFANA_ADMIN_PASSWORD=<strong-password>
N8N_BASIC_AUTH_PASSWORD=<strong-password>
N8N_ENCRYPTION_KEY=<generate>
```

### Worker .env (Minimal)

```bash
# Copy this for worker - replace values
NYRA_PC_ID=worker-1
NYRA_GPU_TYPE=rtx_4090
NYRA_WORKER_ID=1
ORCHESTRATOR_URL=https://nyra-orchestrator.ratehunter.net
CLOUDFLARED_TOKEN=<from-cloudflare-dashboard>
ANTHROPIC_API_KEY=<same-as-orchestrator>
GOOGLE_API_KEY=<same-as-orchestrator>
```

---

**Last Updated**: January 18, 2026
**Maintained By**: Project Nyra Team
**Next Review**: April 2026 (90 days)
