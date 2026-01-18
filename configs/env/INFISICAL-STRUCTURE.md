# Infisical Secrets Structure - Project Nyra

**Last Updated**: 2026-01-18
**Version**: 1.0.0
**Architecture**: 4-PC Distributed System

---

## 📋 Table of Contents

- [Overview](#overview)
- [Secrets Hierarchy](#secrets-hierarchy)
- [Variable Categorization](#variable-categorization)
- [Access Control Matrix](#access-control-matrix)
- [Migration Guide](#migration-guide)
- [CLI Commands Reference](#cli-commands-reference)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

Project Nyra uses a 4-PC distributed architecture with centralized secrets management via Infisical. This document defines the complete secrets organization strategy across:

- **PC1 (Orchestrator)**: Mini PC - MCP servers, databases, n8n, monitoring
- **PC2 (Worker RTX 3060)**: Ollama for local LLM inference
- **PC3 (Worker RTX 5090)**: vLLM + LMCache for high-performance inference
- **PC4 (Worker RTX 3090 Ti)**: vLLM + LMCache for distributed inference

### Architecture Principles

1. **Shared Secrets**: API keys, tokens shared across all PCs
2. **PC-Specific Secrets**: Database passwords, encryption keys per PC
3. **Service Isolation**: Each service gets only required secrets
4. **Environment Separation**: development, staging, production
5. **Role-Based Access**: Read-only for workers, full access for orchestrator

---

## 🗂️ Secrets Hierarchy

```
/project-nyra
│
├── /shared                          # Shared across all PCs (read-only for workers)
│   ├── ANTHROPIC_API_KEY            # Claude API for reasoning tasks
│   ├── GOOGLE_API_KEY               # Gemini for cost-efficient tasks
│   ├── OPENROUTER_API_KEY           # Fallback LLM provider
│   ├── CONTEXT7_API_KEY             # Enhanced context management
│   ├── GITHUB_TOKEN                 # GitHub operations (repos, PRs, issues)
│   ├── DOMAIN                       # ratehunter.net
│   ├── SUBDOMAIN_NYRA               # nyra.ratehunter.net
│   ├── SUBDOMAIN_API                # api.ratehunter.net
│   ├── SUBDOMAIN_ADMIN              # admin.ratehunter.net
│   └── NODE_ENV                     # development/staging/production
│
├── /orchestrator                    # PC1 (Mini PC) - Full access
│   │
│   ├── /database                    # Database credentials
│   │   ├── POSTGRES_USER            # postgres
│   │   ├── POSTGRES_PASSWORD        # Generate: openssl rand -hex 32
│   │   ├── POSTGRES_PORT            # 5432
│   │   ├── REDIS_PASSWORD           # Generate: openssl rand -hex 32
│   │   ├── REDIS_PORT               # 6380 (avoid FalkorDB conflict)
│   │   └── FALKORDB_PASSWORD        # Generate: openssl rand -hex 32
│   │
│   ├── /nexus                       # Nexus Router (MCP + LLM Gateway)
│   │   ├── NEXUS_ROUTER_PORT        # 7000
│   │   ├── NEXUS_URL                # http://localhost:7000
│   │   ├── NEXUS_JWT_SECRET         # Generate: openssl rand -hex 32
│   │   └── NEXUS_ADMIN_TOKEN        # Generate: openssl rand -hex 32
│   │
│   ├── /n8n                         # Workflow Automation
│   │   ├── PORT_N8N                 # 5678
│   │   ├── N8N_URL                  # http://localhost:5678
│   │   ├── N8N_BASIC_AUTH_USER      # admin
│   │   ├── N8N_BASIC_AUTH_PASSWORD  # Strong password
│   │   ├── N8N_ENCRYPTION_KEY       # Generate: openssl rand -hex 32
│   │   └── N8N_HOST                 # localhost
│   │
│   ├── /activepieces                # Low-Code Automation
│   │   ├── PORT_ACTIVEPIECES        # 3002
│   │   ├── ACTIVEPIECES_API_KEY     # Generate: openssl rand -hex 32
│   │   ├── AP_ENCRYPTION_KEY        # Generate: openssl rand -hex 32
│   │   └── AP_JWT_SECRET            # Generate: openssl rand -hex 32
│   │
│   ├── /dify                        # AI Chat Platform
│   │   ├── PORT_DIFY                # 3001
│   │   ├── DIFY_URL                 # http://localhost:3001
│   │   ├── DIFY_SECRET_KEY          # Generate: openssl rand -hex 32
│   │   └── DIFY_ENCRYPTION_KEY      # Generate: openssl rand -hex 32
│   │
│   ├── /twentycrm                   # CRM System
│   │   ├── PORT_TWENTYCRM           # 3010
│   │   ├── TWENTY_CRM_URL           # http://localhost:3010
│   │   ├── TWENTY_ACCESS_TOKEN_SECRET    # Generate: openssl rand -hex 32
│   │   ├── TWENTY_LOGIN_TOKEN_SECRET     # Generate: openssl rand -hex 32
│   │   ├── TWENTY_REFRESH_TOKEN_SECRET   # Generate: openssl rand -hex 32
│   │   └── TWENTY_FILE_TOKEN_SECRET      # Generate: openssl rand -hex 32
│   │
│   ├── /letta                       # Memory Server
│   │   ├── PORT_LETTA               # 8283
│   │   ├── LETTA_URL                # http://localhost:8283
│   │   ├── LETTA_API_KEY            # Generate: openssl rand -hex 32
│   │   └── LETTA_SERVER_PASS        # Strong password
│   │
│   ├── /mem0                        # Vector Memory
│   │   ├── MEM0_API_KEY             # Optional - cloud mode
│   │   ├── MEM0_PORT                # 8081
│   │   ├── MEM0_URL                 # http://localhost:4321
│   │   ├── MEM0_DEFAULT_USER_ID     # default
│   │   └── MEM0_BASE_URL            # https://api.mem0.ai
│   │
│   ├── /graphiti                    # Graph Memory
│   │   ├── GRAPHITI_API_KEY         # Optional - cloud mode
│   │   ├── GRAPHITI_TEMPORAL_TRACKING        # true
│   │   └── GRAPHITI_RELATIONSHIP_INFERENCE   # true
│   │
│   ├── /litellm                     # LLM Proxy (Legacy)
│   │   ├── PORT_LITELLM             # 4000
│   │   └── LITELLM_MASTER_KEY       # Generate: openssl rand -hex 32
│   │
│   ├── /monitoring                  # Prometheus + Grafana
│   │   ├── PROMETHEUS_PORT          # 9090
│   │   ├── PROMETHEUS_RETENTION     # 15d
│   │   ├── GRAFANA_PORT             # 3000
│   │   ├── GRAFANA_ADMIN_USER       # admin
│   │   └── GRAFANA_ADMIN_PASSWORD   # Strong password
│   │
│   ├── /communication               # Twilio + Email
│   │   ├── TWILIO_ACCOUNT_SID       # From console.twilio.com
│   │   ├── TWILIO_AUTH_TOKEN        # From console.twilio.com
│   │   ├── TWILIO_PHONE_NUMBER      # +15551234567
│   │   ├── SMTP_HOST                # smtp.gmail.com
│   │   ├── SMTP_PORT                # 587
│   │   ├── SMTP_USER                # Email address
│   │   ├── SMTP_PASSWORD            # App-specific password
│   │   ├── SMTP_FROM_EMAIL          # From address
│   │   └── SMTP_FROM_NAME           # RateHunter Team
│   │
│   ├── /business-services           # Quote/Campaign Engines
│   │   ├── QUOTE_ENGINE_PORT        # 8001
│   │   ├── QUOTE_ENGINE_URL         # http://localhost:8001
│   │   ├── QUOTE_ENGINE_HOST        # 0.0.0.0
│   │   ├── CAMPAIGN_ENGINE_PORT     # 8002
│   │   ├── CAMPAIGN_ENGINE_URL      # http://localhost:8002
│   │   ├── CAMPAIGN_ENGINE_HOST     # 0.0.0.0
│   │   ├── NYRA_ORCHESTRATOR_PORT   # 8003
│   │   ├── ORCHESTRATOR_URL         # http://localhost:8010
│   │   ├── NYRA_ORCHESTRATOR_HOST   # 0.0.0.0
│   │   └── LOG_LEVEL                # INFO
│   │
│   ├── /mcp-servers                 # Individual MCP Port Assignments
│   │   ├── MCP_VSCODE_PORT          # 8081
│   │   ├── MCP_TWENTYCRM_PORT       # 8082
│   │   ├── MCP_DIFY_PORT            # 8083
│   │   ├── MCP_FILESYSTEM_PORT      # 8084
│   │   ├── MCP_GITHUB_PORT          # 8085
│   │   ├── MCP_BRAVE_SEARCH_PORT    # 8086
│   │   ├── MCP_BITWARDEN_PORT       # 8087
│   │   ├── MCP_GITLAB_PORT          # 8088
│   │   ├── MCP_GOOGLE_MAPS_PORT     # 8089
│   │   ├── MCP_SENTRY_PORT          # 8090
│   │   ├── MCP_SLACK_PORT           # 8091
│   │   └── MCP_POSTGRES_PORT        # 8092
│   │
│   ├── /bitwarden                   # Bitwarden Secrets Vault
│   │   ├── BITWARDEN_CLIENT_ID      # From Bitwarden
│   │   ├── BITWARDEN_CLIENT_SECRET  # From Bitwarden
│   │   ├── BITWARDEN_PASSWORD       # Master password
│   │   └── BW_SESSION               # Session token
│   │
│   ├── /cloudflare                  # Cloudflare Tunnels
│   │   ├── CLOUDFLARED_TUNNEL_TOKEN # Orchestrator tunnel token
│   │   └── CLOUDFLARED_TUNNEL_NAME  # nyra-tunnel
│   │
│   └── /infisical                   # Infisical Self-Config
│       ├── INFISICAL_PROJECT_ID     # Project ID
│       └── INFISICAL_ENVIRONMENT    # development/staging/production
│
├── /worker-rtx3060                  # PC2 (Ollama) - Read-only access to shared
│   │
│   ├── /ollama                      # Local LLM Inference
│   │   ├── OLLAMA_HOST              # 0.0.0.0:11434
│   │   ├── OLLAMA_PORT              # 11434
│   │   ├── OLLAMA_ORIGINS           # *
│   │   ├── OLLAMA_NUM_PARALLEL      # 2 (RTX 3060 memory constraint)
│   │   └── OLLAMA_MAX_LOADED_MODELS # 2
│   │
│   ├── /worker-config
│   │   ├── NYRA_PC_ID               # worker-rtx3060
│   │   ├── NYRA_GPU_TYPE            # rtx_3060
│   │   ├── NYRA_WORKER_ID           # 2
│   │   ├── ORCHESTRATOR_URL         # http://orchestrator:8000
│   │   └── CUDA_VISIBLE_DEVICES     # 0
│   │
│   └── /cloudflare
│       ├── CLOUDFLARED_TOKEN_WORKER_RTX3060    # Worker 2 tunnel token
│       └── CLOUDFLARE_TUNNEL_NAME_WORKER_2     # nyra-worker-rtx3060
│
├── /worker-rtx5090                  # PC3 (vLLM + LMCache) - Read-only access to shared
│   │
│   ├── /vllm                        # Fast LLM Inference
│   │   ├── VLLM_API_KEY             # Generate: openssl rand -hex 32
│   │   ├── VLLM_HOST                # 0.0.0.0
│   │   ├── VLLM_PORT                # 8000
│   │   ├── VLLM_TENSOR_PARALLEL     # 1 (single GPU)
│   │   ├── VLLM_GPU_MEMORY_UTILIZATION  # 0.95
│   │   └── VLLM_MAX_MODEL_LEN       # 32768
│   │
│   ├── /lmcache                     # KV Cache Optimization
│   │   ├── LMCACHE_CONFIG           # /app/config/lmcache.yaml
│   │   ├── LMCACHE_CACHE_SIZE_GB    # 16 (RTX 5090 has 32GB VRAM)
│   │   ├── LMCACHE_BACKEND          # redis
│   │   └── LMCACHE_REDIS_URL        # redis://orchestrator:6380
│   │
│   ├── /worker-config
│   │   ├── NYRA_PC_ID               # worker-rtx5090
│   │   ├── NYRA_GPU_TYPE            # rtx_5090
│   │   ├── NYRA_WORKER_ID           # 3
│   │   ├── ORCHESTRATOR_URL         # http://orchestrator:8000
│   │   └── CUDA_VISIBLE_DEVICES     # 0
│   │
│   └── /cloudflare
│       ├── CLOUDFLARED_TOKEN_WORKER_RTX5090    # Worker 3 tunnel token
│       └── CLOUDFLARE_TUNNEL_NAME_WORKER_3     # nyra-worker-rtx5090
│
└── /worker-rtx3090ti                # PC4 (vLLM + LMCache) - Read-only access to shared
    │
    ├── /vllm                        # Fast LLM Inference
    │   ├── VLLM_API_KEY             # Generate: openssl rand -hex 32
    │   ├── VLLM_HOST                # 0.0.0.0
    │   ├── VLLM_PORT                # 8000
    │   ├── VLLM_TENSOR_PARALLEL     # 1 (single GPU)
    │   ├── VLLM_GPU_MEMORY_UTILIZATION  # 0.95
    │   └── VLLM_MAX_MODEL_LEN       # 32768
    │
    ├── /lmcache                     # KV Cache Optimization
    │   ├── LMCACHE_CONFIG           # /app/config/lmcache.yaml
    │   ├── LMCACHE_CACHE_SIZE_GB    # 16 (RTX 3090 Ti has 24GB VRAM)
    │   ├── LMCACHE_BACKEND          # redis
    │   └── LMCACHE_REDIS_URL        # redis://orchestrator:6380
    │
    ├── /worker-config
    │   ├── NYRA_PC_ID               # worker-rtx3090ti
    │   ├── NYRA_GPU_TYPE            # rtx_3090ti
    │   ├── NYRA_WORKER_ID           # 4
    │   ├── ORCHESTRATOR_URL         # http://orchestrator:8000
    │   └── CUDA_VISIBLE_DEVICES     # 0
    │
    └── /cloudflare
        ├── CLOUDFLARED_TOKEN_WORKER_RTX3090TI  # Worker 4 tunnel token
        └── CLOUDFLARE_TUNNEL_NAME_WORKER_4     # nyra-worker-rtx3090ti
```

---

## 📊 Variable Categorization

### Category 1: Shared Secrets (All PCs - Read Access)

**Location**: `/shared`
**Access**: All PCs (read-only for workers)
**Purpose**: API keys and credentials used across all services

| Variable | Type | Source | Used By |
|----------|------|--------|---------|
| `ANTHROPIC_API_KEY` | API Key | console.anthropic.com | All agents for complex reasoning |
| `GOOGLE_API_KEY` | API Key | aistudio.google.com/apikey | All agents for cost-efficient tasks |
| `OPENROUTER_API_KEY` | API Key | openrouter.ai | Fallback LLM provider |
| `CONTEXT7_API_KEY` | API Key | context7.ai | Enhanced context management |
| `GITHUB_TOKEN` | PAT | github.com/settings/tokens | GitHub MCP, version control |
| `DOMAIN` | Config | Static | All web services |
| `SUBDOMAIN_*` | Config | Static | Service routing |
| `NODE_ENV` | Config | Static | Environment detection |

### Category 2: Orchestrator Secrets (PC1 Only - Full Access)

**Location**: `/orchestrator/*`
**Access**: PC1 only (full read/write)
**Purpose**: Database passwords, service encryption keys, admin credentials

#### Databases (Critical - Never share with workers)
- `POSTGRES_PASSWORD` - 32+ char hex string
- `REDIS_PASSWORD` - 32+ char hex string
- `FALKORDB_PASSWORD` - 32+ char hex string

#### Service Encryption Keys (Critical)
- `NEXUS_JWT_SECRET` - JWT signing
- `NEXUS_ADMIN_TOKEN` - Admin access
- `N8N_ENCRYPTION_KEY` - Workflow secrets encryption
- `DIFY_ENCRYPTION_KEY` - Dify data encryption
- `AP_ENCRYPTION_KEY` - Activepieces encryption
- `LITELLM_MASTER_KEY` - LLM proxy auth

#### Admin Credentials (High Risk)
- `N8N_BASIC_AUTH_PASSWORD` - n8n admin
- `GRAFANA_ADMIN_PASSWORD` - Monitoring admin
- `LETTA_SERVER_PASS` - Memory server admin

#### Communication Secrets
- `TWILIO_AUTH_TOKEN` - SMS/Voice API
- `SMTP_PASSWORD` - Email delivery

### Category 3: Worker Secrets (PC-Specific)

**Location**: `/worker-<gpu-type>/*`
**Access**: Respective PC only
**Purpose**: Worker-specific API keys, GPU configurations

#### PC2 (RTX 3060) - Ollama
- `OLLAMA_*` - Local inference config
- `NYRA_PC_ID=worker-rtx3060`
- `CLOUDFLARED_TOKEN_WORKER_RTX3060`

#### PC3 (RTX 5090) - vLLM + LMCache
- `VLLM_API_KEY` - Unique per worker
- `LMCACHE_CONFIG` - Cache optimization
- `NYRA_PC_ID=worker-rtx5090`
- `CLOUDFLARED_TOKEN_WORKER_RTX5090`

#### PC4 (RTX 3090 Ti) - vLLM + LMCache
- `VLLM_API_KEY` - Unique per worker
- `LMCACHE_CONFIG` - Cache optimization
- `NYRA_PC_ID=worker-rtx3090ti`
- `CLOUDFLARED_TOKEN_WORKER_RTX3090TI`

---

## 🔐 Access Control Matrix

| Path | PC1 (Orchestrator) | PC2 (RTX 3060) | PC3 (RTX 5090) | PC4 (RTX 3090 Ti) |
|------|-------------------|----------------|----------------|-------------------|
| `/shared` | Read/Write | **Read Only** | **Read Only** | **Read Only** |
| `/orchestrator` | **Full Access** | ❌ No Access | ❌ No Access | ❌ No Access |
| `/worker-rtx3060` | Read Only | **Full Access** | ❌ No Access | ❌ No Access |
| `/worker-rtx5090` | Read Only | ❌ No Access | **Full Access** | ❌ No Access |
| `/worker-rtx3090ti` | Read Only | ❌ No Access | ❌ No Access | **Full Access** |

### Access Levels Explained

- **Full Access**: Can create, read, update, delete secrets
- **Read Only**: Can read secrets but not modify
- **No Access**: Cannot see or access secrets (403 Forbidden)

---

## 🚀 Migration Guide

### Prerequisites

1. **Install Infisical CLI**:
```bash
# Windows (PowerShell)
npm install -g @infisical/cli

# Verify installation
infisical --version
```

2. **Login to Infisical**:
```bash
infisical login
```

3. **Create Project** (if not exists):
```bash
infisical projects create --name "project-nyra"
```

4. **Get Project ID**:
```bash
infisical projects list
# Copy the project ID for project-nyra
```

### Step 1: Export Current Secrets

Create a backup of your current `.env` file:

```bash
# Windows PowerShell
Copy-Item .env .env.backup.$(Get-Date -Format "yyyyMMdd-HHmmss")
```

### Step 2: Bulk Upload - Shared Secrets

Create a file: `scripts/infisical/upload-shared-secrets.ps1`

```powershell
# Upload shared secrets (read by all PCs)
$sharedSecrets = @{
    "ANTHROPIC_API_KEY" = $env:ANTHROPIC_API_KEY
    "GOOGLE_API_KEY" = $env:GOOGLE_API_KEY
    "OPENROUTER_API_KEY" = $env:OPENROUTER_API_KEY
    "CONTEXT7_API_KEY" = $env:CONTEXT7_API_KEY
    "GITHUB_TOKEN" = $env:GITHUB_TOKEN
    "DOMAIN" = "ratehunter.net"
    "SUBDOMAIN_NYRA" = "nyra.ratehunter.net"
    "SUBDOMAIN_API" = "api.ratehunter.net"
    "SUBDOMAIN_ADMIN" = "admin.ratehunter.net"
    "NODE_ENV" = "development"
}

foreach ($key in $sharedSecrets.Keys) {
    $value = $sharedSecrets[$key]
    if ($value) {
        infisical secrets set $key $value --path /shared --env development
        Write-Host "✅ Set $key in /shared" -ForegroundColor Green
    } else {
        Write-Warning "⚠️ Skipping $key (not set in current environment)"
    }
}
```

### Step 3: Bulk Upload - Orchestrator Secrets

Create: `scripts/infisical/upload-orchestrator-secrets.ps1`

```powershell
# Database secrets
$dbSecrets = @{
    "POSTGRES_USER" = "postgres"
    "POSTGRES_PASSWORD" = $env:POSTGRES_PASSWORD
    "POSTGRES_PORT" = "5432"
    "REDIS_PASSWORD" = $env:REDIS_PASSWORD
    "REDIS_PORT" = "6380"
    "FALKORDB_PASSWORD" = $env:FALKORDB_PASSWORD
}

foreach ($key in $dbSecrets.Keys) {
    infisical secrets set $key $dbSecrets[$key] --path /orchestrator/database --env development
}
Write-Host "✅ Database secrets uploaded" -ForegroundColor Green

# Nexus Router
$nexusSecrets = @{
    "NEXUS_ROUTER_PORT" = "7000"
    "NEXUS_URL" = "http://localhost:7000"
    "NEXUS_JWT_SECRET" = $env:NEXUS_JWT_SECRET
    "NEXUS_ADMIN_TOKEN" = $env:NEXUS_ADMIN_TOKEN
}

foreach ($key in $nexusSecrets.Keys) {
    infisical secrets set $key $nexusSecrets[$key] --path /orchestrator/nexus --env development
}
Write-Host "✅ Nexus secrets uploaded" -ForegroundColor Green

# n8n
$n8nSecrets = @{
    "PORT_N8N" = "5678"
    "N8N_URL" = "http://localhost:5678"
    "N8N_BASIC_AUTH_USER" = "admin"
    "N8N_BASIC_AUTH_PASSWORD" = $env:N8N_BASIC_AUTH_PASSWORD
    "N8N_ENCRYPTION_KEY" = $env:N8N_ENCRYPTION_KEY
    "N8N_HOST" = "localhost"
}

foreach ($key in $n8nSecrets.Keys) {
    infisical secrets set $key $n8nSecrets[$key] --path /orchestrator/n8n --env development
}
Write-Host "✅ n8n secrets uploaded" -ForegroundColor Green

# TwentyCRM
$twentySecrets = @{
    "PORT_TWENTYCRM" = "3010"
    "TWENTY_CRM_URL" = "http://localhost:3010"
    "TWENTY_ACCESS_TOKEN_SECRET" = $env:TWENTY_ACCESS_TOKEN_SECRET
    "TWENTY_LOGIN_TOKEN_SECRET" = $env:TWENTY_LOGIN_TOKEN_SECRET
    "TWENTY_REFRESH_TOKEN_SECRET" = $env:TWENTY_REFRESH_TOKEN_SECRET
    "TWENTY_FILE_TOKEN_SECRET" = $env:TWENTY_FILE_TOKEN_SECRET
}

foreach ($key in $twentySecrets.Keys) {
    infisical secrets set $key $twentySecrets[$key] --path /orchestrator/twentycrm --env development
}
Write-Host "✅ TwentyCRM secrets uploaded" -ForegroundColor Green

# Letta
$lettaSecrets = @{
    "PORT_LETTA" = "8283"
    "LETTA_URL" = "http://localhost:8283"
    "LETTA_API_KEY" = $env:LETTA_API_KEY
    "LETTA_SERVER_PASS" = $env:LETTA_SERVER_PASS
}

foreach ($key in $lettaSecrets.Keys) {
    infisical secrets set $key $lettaSecrets[$key] --path /orchestrator/letta --env development
}
Write-Host "✅ Letta secrets uploaded" -ForegroundColor Green

# Communication (Twilio + Email)
$commSecrets = @{
    "TWILIO_ACCOUNT_SID" = $env:TWILIO_ACCOUNT_SID
    "TWILIO_AUTH_TOKEN" = $env:TWILIO_AUTH_TOKEN
    "TWILIO_PHONE_NUMBER" = $env:TWILIO_PHONE_NUMBER
    "SMTP_HOST" = "smtp.gmail.com"
    "SMTP_PORT" = "587"
    "SMTP_USER" = $env:SMTP_USER
    "SMTP_PASSWORD" = $env:SMTP_PASSWORD
    "SMTP_FROM_EMAIL" = $env:SMTP_FROM_EMAIL
    "SMTP_FROM_NAME" = "RateHunter Team"
}

foreach ($key in $commSecrets.Keys) {
    infisical secrets set $key $commSecrets[$key] --path /orchestrator/communication --env development
}
Write-Host "✅ Communication secrets uploaded" -ForegroundColor Green

# Monitoring
$monitoringSecrets = @{
    "PROMETHEUS_PORT" = "9090"
    "PROMETHEUS_RETENTION" = "15d"
    "GRAFANA_PORT" = "3000"
    "GRAFANA_ADMIN_USER" = "admin"
    "GRAFANA_ADMIN_PASSWORD" = $env:GRAFANA_ADMIN_PASSWORD
}

foreach ($key in $monitoringSecrets.Keys) {
    infisical secrets set $key $monitoringSecrets[$key] --path /orchestrator/monitoring --env development
}
Write-Host "✅ Monitoring secrets uploaded" -ForegroundColor Green

Write-Host "`n🎉 All orchestrator secrets uploaded successfully!" -ForegroundColor Cyan
```

### Step 4: Bulk Upload - Worker Secrets

Create: `scripts/infisical/upload-worker-secrets.ps1`

```powershell
# Worker RTX 3060 (Ollama)
$worker2Secrets = @{
    "OLLAMA_HOST" = "0.0.0.0:11434"
    "OLLAMA_PORT" = "11434"
    "OLLAMA_ORIGINS" = "*"
    "OLLAMA_NUM_PARALLEL" = "2"
    "OLLAMA_MAX_LOADED_MODELS" = "2"
    "NYRA_PC_ID" = "worker-rtx3060"
    "NYRA_GPU_TYPE" = "rtx_3060"
    "NYRA_WORKER_ID" = "2"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
    "CLOUDFLARED_TOKEN_WORKER_RTX3060" = $env:CLOUDFLARED_TOKEN_WORKER_2
    "CLOUDFLARE_TUNNEL_NAME_WORKER_2" = "nyra-worker-rtx3060"
}

foreach ($key in $worker2Secrets.Keys) {
    infisical secrets set $key $worker2Secrets[$key] --path /worker-rtx3060/worker-config --env development
}
Write-Host "✅ Worker RTX 3060 secrets uploaded" -ForegroundColor Green

# Worker RTX 5090 (vLLM + LMCache)
$worker3Secrets = @{
    "VLLM_API_KEY" = (openssl rand -hex 32)
    "VLLM_HOST" = "0.0.0.0"
    "VLLM_PORT" = "8000"
    "VLLM_TENSOR_PARALLEL" = "1"
    "VLLM_GPU_MEMORY_UTILIZATION" = "0.95"
    "VLLM_MAX_MODEL_LEN" = "32768"
    "LMCACHE_CONFIG" = "/app/config/lmcache.yaml"
    "LMCACHE_CACHE_SIZE_GB" = "16"
    "LMCACHE_BACKEND" = "redis"
    "LMCACHE_REDIS_URL" = "redis://orchestrator:6380"
    "NYRA_PC_ID" = "worker-rtx5090"
    "NYRA_GPU_TYPE" = "rtx_5090"
    "NYRA_WORKER_ID" = "3"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
    "CLOUDFLARED_TOKEN_WORKER_RTX5090" = $env:CLOUDFLARED_TOKEN_WORKER_3
    "CLOUDFLARE_TUNNEL_NAME_WORKER_3" = "nyra-worker-rtx5090"
}

foreach ($key in $worker3Secrets.Keys) {
    infisical secrets set $key $worker3Secrets[$key] --path /worker-rtx5090/worker-config --env development
}
Write-Host "✅ Worker RTX 5090 secrets uploaded" -ForegroundColor Green

# Worker RTX 3090 Ti (vLLM + LMCache)
$worker4Secrets = @{
    "VLLM_API_KEY" = (openssl rand -hex 32)
    "VLLM_HOST" = "0.0.0.0"
    "VLLM_PORT" = "8000"
    "VLLM_TENSOR_PARALLEL" = "1"
    "VLLM_GPU_MEMORY_UTILIZATION" = "0.95"
    "VLLM_MAX_MODEL_LEN" = "32768"
    "LMCACHE_CONFIG" = "/app/config/lmcache.yaml"
    "LMCACHE_CACHE_SIZE_GB" = "16"
    "LMCACHE_BACKEND" = "redis"
    "LMCACHE_REDIS_URL" = "redis://orchestrator:6380"
    "NYRA_PC_ID" = "worker-rtx3090ti"
    "NYRA_GPU_TYPE" = "rtx_3090ti"
    "NYRA_WORKER_ID" = "4"
    "ORCHESTRATOR_URL" = "http://orchestrator:8000"
    "CUDA_VISIBLE_DEVICES" = "0"
    "CLOUDFLARED_TOKEN_WORKER_RTX3090TI" = $env:CLOUDFLARED_TOKEN_WORKER_4
    "CLOUDFLARE_TUNNEL_NAME_WORKER_4" = "nyra-worker-rtx3090ti"
}

foreach ($key in $worker4Secrets.Keys) {
    infisical secrets set $key $worker4Secrets[$key] --path /worker-rtx3090ti/worker-config --env development
}
Write-Host "✅ Worker RTX 3090 Ti secrets uploaded" -ForegroundColor Green

Write-Host "`n🎉 All worker secrets uploaded successfully!" -ForegroundColor Cyan
```

### Step 5: Master Upload Script

Create: `scripts/infisical/upload-all-secrets.ps1`

```powershell
#!/usr/bin/env pwsh

<#
.SYNOPSIS
Master script to upload all secrets to Infisical

.DESCRIPTION
Uploads all Project Nyra secrets to Infisical in the correct hierarchy:
- /shared - Shared across all PCs
- /orchestrator/* - PC1 only
- /worker-rtx3060/* - PC2 only
- /worker-rtx5090/* - PC3 only
- /worker-rtx3090ti/* - PC4 only

.PARAMETER Environment
Target environment (development, staging, production)

.PARAMETER DryRun
Preview what would be uploaded without actually uploading

.EXAMPLE
.\upload-all-secrets.ps1 -Environment development

.EXAMPLE
.\upload-all-secrets.ps1 -Environment production -DryRun
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development",

    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ScriptDir = $PSScriptRoot

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warn { Write-Host $args -ForegroundColor Yellow }
function Write-Err { Write-Host $args -ForegroundColor Red }

Write-Info "========================================="
Write-Info "Project Nyra - Infisical Secrets Upload"
Write-Info "========================================="
Write-Info "Environment: $Environment"
Write-Info "Dry Run: $DryRun"
Write-Info "========================================="

# Check Infisical CLI is installed
try {
    $version = infisical --version
    Write-Success "✅ Infisical CLI installed: $version"
} catch {
    Write-Err "❌ Infisical CLI not found. Install with: npm install -g @infisical/cli"
    exit 1
}

# Check if logged in
try {
    infisical user me | Out-Null
    Write-Success "✅ Logged in to Infisical"
} catch {
    Write-Err "❌ Not logged in to Infisical. Run: infisical login"
    exit 1
}

# Load current .env file
if (Test-Path "$ScriptDir\..\..\..\.env") {
    Write-Info "📄 Loading .env file..."
    Get-Content "$ScriptDir\..\..\..\.env" | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Success "✅ Environment variables loaded"
} else {
    Write-Warn "⚠️ No .env file found at root. Using system environment variables."
}

# Execute sub-scripts
$scripts = @(
    "upload-shared-secrets.ps1",
    "upload-orchestrator-secrets.ps1",
    "upload-worker-secrets.ps1"
)

foreach ($script in $scripts) {
    $scriptPath = Join-Path $ScriptDir $script
    if (Test-Path $scriptPath) {
        Write-Info "`n▶️ Running $script..."
        if ($DryRun) {
            Write-Warn "   [DRY RUN] Would execute: $scriptPath"
        } else {
            & $scriptPath -Environment $Environment
        }
    } else {
        Write-Warn "⚠️ Script not found: $script"
    }
}

Write-Info "`n========================================="
Write-Success "✅ Secrets upload complete!"
Write-Info "========================================="
Write-Info "Next steps:"
Write-Info "1. Verify secrets in Infisical dashboard"
Write-Info "2. Set INFISICAL_TOKEN in each PC's environment"
Write-Info "3. Test secret retrieval: infisical secrets --path /shared --env $Environment"
Write-Info "4. Update docker-compose.yml to use Infisical"
Write-Info "========================================="
```

---

## 📖 CLI Commands Reference

### Basic Operations

```bash
# List all secrets in a path
infisical secrets --path /shared --env development

# Get specific secret
infisical secrets get ANTHROPIC_API_KEY --path /shared --env development

# Set a secret
infisical secrets set MY_SECRET "my-value" --path /shared --env development

# Delete a secret
infisical secrets delete MY_SECRET --path /shared --env development

# Export all secrets to .env format
infisical secrets --path /orchestrator/database --env development --format dotenv > .env.db
```

### Docker Integration

```bash
# Run docker-compose with Infisical secrets injection
infisical run --env=development --path=/orchestrator -- docker-compose up -d

# Run specific service with secrets
infisical run --env=production --path=/orchestrator/n8n -- docker-compose up n8n

# Run command with multiple paths (shared + orchestrator)
infisical run --env=development --path=/shared --path=/orchestrator/database -- docker-compose up postgres
```

### Service-Specific Commands

```bash
# PC1 (Orchestrator) - Start all services
infisical run --env=production --path=/shared --path=/orchestrator -- docker-compose -f docker-compose.orchestrator.yml up -d

# PC2 (RTX 3060) - Start worker services
infisical run --env=production --path=/shared --path=/worker-rtx3060 -- docker-compose -f docker-compose.worker-rtx3060.yml up -d

# PC3 (RTX 5090) - Start worker services
infisical run --env=production --path=/shared --path=/worker-rtx5090 -- docker-compose -f docker-compose.worker-rtx5090.yml up -d

# PC4 (RTX 3090 Ti) - Start worker services
infisical run --env=production --path=/shared --path=/worker-rtx3090ti -- docker-compose -f docker-compose.worker-rtx3090ti.yml up -d
```

### Validation Commands

```bash
# Check if secret exists
infisical secrets get POSTGRES_PASSWORD --path /orchestrator/database --env development >/dev/null 2>&1 && echo "✅ Secret exists" || echo "❌ Secret missing"

# Count secrets in a path
infisical secrets --path /shared --env development --format json | jq '. | length'

# List all paths
infisical secrets --path / --env development --format json | jq -r '.[].secretPath' | sort -u

# Audit: List all secret keys (without values)
infisical secrets --path / --env development --format json | jq -r '.[].secretKey' | sort
```

---

## 🔒 Security Best Practices

### 1. Secret Generation

```bash
# Always use cryptographically secure random values
openssl rand -hex 32

# For passwords, use strong password generator
openssl rand -base64 24
```

### 2. Rotation Policy

- **Database Passwords**: Every 90 days
- **API Keys**: When compromised or every 180 days
- **JWT Secrets**: Every 180 days
- **Admin Passwords**: Every 60 days

### 3. Access Control

```bash
# Grant read-only access to worker PCs
infisical access grant user@example.com --role viewer --path /shared

# Grant full access to orchestrator admins
infisical access grant admin@example.com --role admin --path /orchestrator

# Revoke access
infisical access revoke user@example.com --path /shared
```

### 4. Audit Logging

```bash
# View audit logs
infisical audit-logs --limit 50

# Filter by action
infisical audit-logs --action secret_read --limit 20

# Export audit logs
infisical audit-logs --format json > audit-$(date +%Y%m%d).json
```

### 5. Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="./backups/infisical"

mkdir -p $BACKUP_DIR

# Backup shared secrets
infisical secrets --path /shared --env production --format json > $BACKUP_DIR/shared-$DATE.json

# Backup orchestrator secrets
infisical secrets --path /orchestrator --env production --format json > $BACKUP_DIR/orchestrator-$DATE.json

# Encrypt backups
tar -czf $BACKUP_DIR/secrets-$DATE.tar.gz $BACKUP_DIR/*-$DATE.json
gpg --encrypt --recipient admin@ratehunter.net $BACKUP_DIR/secrets-$DATE.tar.gz

# Delete unencrypted JSON
rm $BACKUP_DIR/*-$DATE.json
```

---

## 🛠️ Troubleshooting

### Issue 1: "Infisical token not found"

**Solution**:
```bash
# Login again
infisical login

# Or set token explicitly
export INFISICAL_TOKEN="your-token-here"
```

### Issue 2: "Secret not found at path"

**Solution**:
```bash
# List all available paths
infisical secrets --path / --env development --format json | jq -r '.[].secretPath' | sort -u

# Check if secret exists in different path
infisical secrets --path /shared --env development | grep -i "ANTHROPIC"
```

### Issue 3: Docker compose fails to fetch secrets

**Solution**:
```bash
# Test Infisical injection
infisical run --env=development --path=/shared -- env | grep ANTHROPIC

# Check Infisical CLI version (requires v0.12.0+)
infisical --version

# Update Infisical CLI
npm install -g @infisical/cli@latest
```

### Issue 4: Permission denied on specific path

**Solution**:
```bash
# Check your access level
infisical user me

# Request access from admin
# Admin grants access:
infisical access grant your-email@example.com --role viewer --path /orchestrator
```

### Issue 5: Worker can't access shared secrets

**Solution**:
```bash
# Verify NYRA_PC_ID environment variable is set
echo $NYRA_PC_ID

# Test secret retrieval
infisical secrets --path /shared --env development

# Check Infisical project ID
infisical projects list
```

---

## 📝 Next Steps

1. **Run Upload Script**:
   ```bash
   cd C:\Dev\Projects\Repos\Project-Nyra\scripts\infisical
   .\upload-all-secrets.ps1 -Environment development
   ```

2. **Verify in Dashboard**:
   - Login to Infisical web console
   - Navigate to "project-nyra" project
   - Check each path has correct secrets

3. **Update Docker Compose**:
   - Add `infisical run` wrapper to docker-compose commands
   - Test each PC's service startup

4. **Configure Access Control**:
   - Set up role-based access for team members
   - Restrict worker PCs to read-only

5. **Set Up Rotation**:
   - Create rotation calendar
   - Document rotation procedures

6. **Test Failover**:
   - Verify workers can access shared secrets
   - Test service restart with Infisical injection

---

## 📚 Related Documentation

- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Complete variable reference
- [4PC-DISTRIBUTED-ARCHITECTURE.md](../architecture/4PC-DISTRIBUTED-ARCHITECTURE.md) - System architecture
- [docker-compose.infisical.yml](../../docker-compose.infisical.yml) - Infisical integration

---

**Last Updated**: 2026-01-18
**Maintained By**: Security-Architect Agent
**Review Cycle**: Every 30 days
