# Infisical Secret Management Integration - Project Nyra

> **Comprehensive secret management for the entire Project Nyra stack**
> Secure, centralized secrets with automatic synchronization across orchestrator and worker PCs

## 🎯 Overview

This directory contains the complete Infisical integration for Project Nyra, managing secrets across:
- **Orchestrator PC** (PC1): Central coordination, databases, MCP servers
- **Worker RTX 5090** (PC3): High-performance inference
- **Worker RTX 3090 Ti** (PC4): General purpose, quote generation
- **Worker RTX 3060** (PC2): Code generation, document processing

### Architecture

```
Infisical Cloud (https://app.infisical.com)
│
├── /shared                 # Shared secrets (all PCs)
│   ├── POSTGRES_PASSWORD
│   ├── REDIS_PASSWORD
│   ├── ANTHROPIC_API_KEY
│   ├── OPENAI_API_KEY
│   └── ... (40+ shared secrets)
│
├── /worker-5090           # RTX 5090 specific
│   ├── MACHINE_HOSTNAME
│   ├── OLLAMA_MODELS
│   └── WORKER_5090_URL
│
├── /worker-3090           # RTX 3090 Ti specific
│   ├── MACHINE_HOSTNAME
│   ├── OLLAMA_MODELS
│   └── WORKER_3090_URL
│
└── /worker-3060           # RTX 3060 specific
    ├── MACHINE_HOSTNAME
    ├── OLLAMA_MODELS
    └── WORKER_3060_URL
```

## 📦 Contents

| File | Purpose |
|------|---------|
| **setup-infisical-orchestrator.ps1** | Initial setup on orchestrator PC |
| **sync-secrets.ps1** | Upload local secrets to Infisical |
| **validate-secrets.ps1** | Verify all required secrets exist |
| **docker-compose.infisical.yml** | Infisical Agent as Docker service |
| **infisical-config.yaml** | Enhanced agent configuration |
| **agent-config.yaml** | Legacy agent config (kept for compatibility) |
| **secrets/** | Machine Identity credentials (gitignored) |
| **templates/** | Secret rendering templates |

## 🚀 Quick Start

### 1. Initial Setup (Run Once on Orchestrator)

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\infisical

# Setup Infisical CLI, authentication, and Machine Identity
.\setup-infisical-orchestrator.ps1
```

This will:
- ✅ Install Infisical CLI (if needed)
- ✅ Authenticate with Infisical Cloud
- ✅ Configure Machine Identity credentials
- ✅ Test connectivity to all secret paths
- ✅ Create `.infisical.json` project config

### 2. Upload Secrets to Infisical

```powershell
# Dry run first (preview without uploading)
.\sync-secrets.ps1 -DryRun

# Upload all secrets
.\sync-secrets.ps1

# Upload only shared secrets
.\sync-secrets.ps1 -PathsOnly shared

# Upload specific worker secrets
.\sync-secrets.ps1 -PathsOnly worker-3060
```

### 3. Validate Secrets

```powershell
# Validate all paths
.\validate-secrets.ps1

# Validate with verbose output
.\validate-secrets.ps1 -Verbose

# Validate specific path
.\validate-secrets.ps1 -PathsOnly shared
```

### 4. Start Infisical Agent (Auto-Sync)

```powershell
# Start as Docker service
docker-compose -f docker-compose.infisical.yml up -d

# View logs
docker logs infisical-agent -f

# Check status
docker-compose -f docker-compose.infisical.yml ps
```

The agent will:
- 🔄 Sync secrets every 60 seconds
- 📁 Render to `.env.rendered` files
- 🔒 Authenticate via Machine Identity
- ♻️ Auto-restart on failure

## 📚 Detailed Usage

### Script Details

#### `setup-infisical-orchestrator.ps1`

Enhanced setup for the orchestrator PC with multi-path configuration.

```powershell
# Basic setup
.\setup-infisical-orchestrator.ps1

# Skip login (if already authenticated)
.\setup-infisical-orchestrator.ps1 -SkipLogin

# Setup and start agent
.\setup-infisical-orchestrator.ps1 -StartAgent

# Test mode only
.\setup-infisical-orchestrator.ps1 -TestOnly
```

**What it does:**
- Checks/installs Infisical CLI
- Authenticates with Infisical Cloud
- Creates Machine Identity credential files
- Tests all secret paths (`/shared`, `/worker-5090`, `/worker-3090`, `/worker-3060`)
- Creates `.infisical.json` project configuration
- Optionally starts Infisical Agent via Docker

#### `sync-secrets.ps1`

Upload secrets from local `.env` files to Infisical Cloud.

```powershell
# Interactive mode (with confirmations)
.\sync-secrets.ps1

# Auto-confirm all uploads
.\sync-secrets.ps1 -AutoConfirm

# Dry run (preview only)
.\sync-secrets.ps1 -DryRun

# Upload specific path
.\sync-secrets.ps1 -PathsOnly shared
.\sync-secrets.ps1 -PathsOnly worker-5090

# Different environment
.\sync-secrets.ps1 -Environment prod
```

**What it uploads:**
- `/shared` ← `../machines/.env.shared.template` (40+ shared secrets)
- `/worker-5090` ← `../machines/.env.worker-5090` (if exists)
- `/worker-3090` ← `../machines/.env.worker-3090` (if exists)
- `/worker-3060` ← `../machines/.env.machine` (current machine)

**Smart features:**
- ✅ Skips placeholder values (`CHANGE_ME`, `TODO`, `<value>`)
- ✅ Skips empty values
- ✅ Shows progress for each secret
- ✅ Summary with upload/skip/error counts

#### `validate-secrets.ps1`

Verify all required secrets exist in Infisical.

```powershell
# Validate all paths
.\validate-secrets.ps1

# Verbose output (show all secret names)
.\validate-secrets.ps1 -Verbose

# Validate specific path
.\validate-secrets.ps1 -PathsOnly shared

# Different environment
.\validate-secrets.ps1 -Environment prod
```

**Validation checks:**
- ✅ All required secrets present
- ⚠️ Placeholder values detected
- ❌ Missing secrets identified
- 📊 Summary statistics per path

**Exit codes:**
- `0` - All secrets valid
- `1` - Missing required secrets

### Docker Compose Integration

#### Method 1: Infisical Agent (Recommended)

The Infisical Agent runs as a sidecar container, automatically syncing secrets to `.env.rendered` files.

```bash
# Start agent
docker-compose -f infra/infisical/docker-compose.infisical.yml up -d

# Use rendered secrets in main stack
cd infra/docker
docker-compose --env-file .env.rendered up -d
```

**Benefits:**
- ✅ Automatic secret rotation
- ✅ Real-time sync (60-second interval)
- ✅ No manual intervention needed
- ✅ Works with Docker Compose and Kubernetes

#### Method 2: Infisical Run Command

Inject secrets directly when starting services.

```bash
# Full stack with Infisical injection
cd infra/docker
infisical run --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef \
              --env=dev \
              --path=/shared \
              -- docker-compose up -d

# Specific service
infisical run --path=/shared -- docker-compose up postgres redis
```

#### Method 3: Environment Variable Injection

Reference secrets directly in `docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
```

Then run:
```bash
infisical run --path=/shared -- docker-compose up -d
```

## 🔒 Security Best Practices

### Machine Identity Setup

1. **Create Machine Identity** in Infisical Dashboard:
   - Go to Organization Settings → Machine Identities
   - Click "Create Identity"
   - Name: `Project-Nyra-Orchestrator`
   - Auth Method: **Universal Auth**
   - Grant access to project: `8374cea9-e5e8-4050-bda4-b91f25ab30ef`

2. **Set Permissions**:
   - Environment: `dev`, `staging`, `prod`
   - Paths: `/shared`, `/worker-5090`, `/worker-3090`, `/worker-3060`
   - Permission: **Read** (Agent only needs read access)

3. **Store Credentials Securely**:
   ```powershell
   # Credentials stored in gitignored directory
   infra/infisical/secrets/
   ├── infisical-client-id        # Machine Identity Client ID
   └── infisical-client-secret    # Machine Identity Client Secret
   ```

### Secret Rotation

To rotate secrets:

1. **Update in Infisical Dashboard** → Secrets page
2. **Secrets sync automatically** (if using Infisical Agent)
3. **Restart services** to pick up new values:
   ```bash
   docker-compose restart postgres redis
   ```

### Least Privilege

- **Orchestrator PC**: Read access to all paths
- **Worker PCs**: Read access to `/shared` + their specific `/worker-*` path
- **CI/CD**: Separate Machine Identity with minimal permissions

## 📁 Secret Organization

### `/shared` - Shared Across All Machines

```bash
# Database
POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
DATABASE_URL

# Redis
REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_URL
NEXUS_REDIS_URL, CLAUDE_FLOW_REDIS_URL, ARCHON_REDIS_URL

# AI Providers
ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY
OPENROUTER_API_KEY, OPENROUTER_BASE_URL

# Services
NEXUS_ROUTER_PORT, NEXUS_JWT_SECRET, NEXUS_ADMIN_TOKEN
CLAUDE_FLOW_PORT, ARCHON_PORT, LETTA_API_URL

# General
NODE_ENV, LOG_LEVEL
```

### `/worker-5090` - RTX 5090 Specific

```bash
MACHINE_HOSTNAME=<hostname>
MACHINE_ROLE=worker-5090
MACHINE_GPU_TYPE=rtx_5090
MACHINE_GPU_VRAM_GB=48
MACHINE_IP_TAILSCALE=<tailscale-ip>

OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_MODELS=deepseek-r1:236b,qwen2.5:72b

WORKER_SPECIALIZATION=reasoning
WORKER_5090_URL=http://<tailscale-ip>:11434
```

### `/worker-3090` - RTX 3090 Ti Specific

Similar structure, specialized for general-purpose workloads.

### `/worker-3060` - RTX 3060 Specific

Similar structure, specialized for code generation and embeddings.

## 🔄 Worker PC Setup

On each worker PC:

```powershell
# 1. Generate machine-specific environment
cd C:\Dev\Projects\Repos\Project-Nyra\infra\machines
.\generate-machine-env.ps1

# 2. Upload to Infisical (from orchestrator or worker)
cd ..\infisical
.\sync-secrets.ps1 -PathsOnly worker-3060  # Or worker-5090, worker-3090

# 3. Download secrets on worker PC
cd ..\machines
.\download-from-infisical.ps1 -MachineRole worker-3060
```

## 🛠️ Troubleshooting

### Agent Not Starting

```bash
# Check logs
docker logs infisical-agent -f

# Verify credentials
ls -la infra/infisical/secrets/

# Test authentication
infisical secrets list --projectId=8374cea9-e5e8-4050-bda4-b91f25ab30ef --env=dev --path=/shared
```

### Secrets Not Syncing

1. **Verify Machine Identity permissions** in Infisical Dashboard
2. **Check paths exist** and have secrets
3. **Restart agent**:
   ```bash
   docker-compose -f infra/infisical/docker-compose.infisical.yml restart
   ```

### Missing Secrets

```powershell
# Validate and identify missing secrets
.\validate-secrets.ps1

# Upload missing secrets
.\sync-secrets.ps1

# Or manually set in Infisical Dashboard
# https://app.infisical.com/project/8374cea9-e5e8-4050-bda4-b91f25ab30ef/secrets/dev
```

### Permission Denied

```bash
# Fix rendered file permissions
chmod 644 ../docker/.env.rendered

# Fix secrets directory permissions
chmod 700 secrets/
chmod 600 secrets/infisical-client-*
```

## 📖 Additional Resources

- **Infisical Documentation**: https://infisical.com/docs
- **Machine Strategy**: `../machines/MACHINE-ENV-STRATEGY.md`
- **Docker Usage**: `../docker/README.md`
- **Project Whitepaper**: `../../ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`

## 🔗 Related Scripts

| Location | Purpose |
|----------|---------|
| `../machines/generate-machine-env.ps1` | Collect machine-specific env vars |
| `../machines/upload-to-infisical.ps1` | Upload machine-specific secrets |
| `../machines/download-from-infisical.ps1` | Download secrets on worker PCs |
| `../docker/start-all.ps1` | Start full stack with Infisical |

## 📝 Environment Reference

| Environment | Purpose | Usage |
|-------------|---------|-------|
| `dev` | Development | Local testing, integration work |
| `staging` | Staging | Pre-production validation |
| `prod` | Production | Live mortgage operations |

Current configuration uses: **`dev`**

To change environment, update scripts:
```powershell
.\setup-infisical-orchestrator.ps1 -Environment staging
.\sync-secrets.ps1 -Environment staging
.\validate-secrets.ps1 -Environment staging
```

---

**Project Nyra** | Infisical Secret Management v1.0
