# Project Nyra - Configuration Guide

**Version**: 2.0.0
**Last Updated**: 2026-01-21

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Files](#environment-files)
3. [Configuration Files](#configuration-files)
4. [Service Configuration](#service-configuration)
5. [PC-Specific Configuration](#pc-specific-configuration)
6. [Security Configuration](#security-configuration)
7. [Configuration Management](#configuration-management)

---

## Overview

Project Nyra uses a multi-layered configuration system spanning 4 PCs with different roles and capabilities. This guide covers all configuration aspects from environment variables to service-specific settings.

### Configuration Architecture

```
.env files (per PC)
├── API Keys & Secrets
├── PC Identity & Role
├── Network Configuration
└── Service Toggles

Config Files (by service)
├── nexus.toml - LLM Gateway
├── litellm-config.yaml - Model Routing
├── claude-flow.config.json - Orchestration
├── docker-compose.yml - Infrastructure
└── Service-specific configs
```

---

## Environment Files

### File Organization

| Environment | File | Use Case | PC |
|-------------|------|----------|-----|
| **Orchestrator** | `.env.orchestrator` | Main coordinator | PC1 (Mini PC) |
| **Worker 5090** | `.env.worker-5090` | Large models | PC3 (RTX 5090) |
| **Worker 3090Ti** | `.env.worker-3090ti` | Analysis | PC4 (RTX 3090 Ti) |
| **Worker 3060** | `.env.worker-3060` | Coding | PC2 (RTX 3060) |
| **Development** | `.env.development` | Local dev/testing | Any PC |
| **Production** | `.env.production` | Live deployment | PC1 (orchestrator) |
| **CI/CD** | `.env.ci` | GitHub Actions | CI server |

### Master Environment Template

```bash
# ============================================================================
# PROJECT NYRA - MASTER ENVIRONMENT CONFIGURATION
# ============================================================================
# Copy this to .env and customize for your environment
# Generated: 2026-01-21

# ============================================================================
# SECTION 1: PC IDENTITY & NETWORK
# ============================================================================
# CRITICAL: Set correctly for each PC

PC_NAME=orchestrator                 # orchestrator, worker-2, worker-3, worker-4
PC_ROLE=orchestrator                 # orchestrator or worker
LAN_IP=10.0.0.1                     # Static IP or Tailscale IP
TAILSCALE_IP=100.100.100.1          # Optional: Tailscale mesh IP
HOSTNAME=orchestrator.nyra.local    # DNS hostname

# Network Environment
NODE_ENV=production                  # development, production, test
CLAUDE_FLOW_MODE=orchestrator       # orchestrator or worker

# ============================================================================
# SECTION 2: LLM API KEYS
# ============================================================================
# At least ANTHROPIC_API_KEY is required

# Anthropic (Claude models) - PRIMARY
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# OpenRouter (multi-provider access) - RECOMMENDED
OPENROUTER_API_KEY=sk-or-v1-xxxxx

# Google Gemini (cost-effective) - OPTIONAL
GOOGLE_API_KEY=AIzaSyxxxxx

# OpenAI (GPT models) - OPTIONAL
OPENAI_API_KEY=sk-xxxxx

# Groq (fast inference) - OPTIONAL
GROQ_API_KEY=gsk-xxxxx

# ============================================================================
# SECTION 3: COMMUNICATION SERVICES
# ============================================================================

# Twilio (SMS/Voice)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+1xxxxx

# SendGrid (Email)
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@ratehunter.net

# ============================================================================
# SECTION 4: DATABASE CONFIGURATION
# ============================================================================

# PostgreSQL (Main Database)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=nyra
POSTGRES_PASSWORD=changeme_strong_password
POSTGRES_DB=nyra

# Letta PostgreSQL
LETTA_PG_HOST=localhost
LETTA_PG_PORT=5433
LETTA_PG_USER=letta
LETTA_PG_PASSWORD=changeme_letta_password
LETTA_PG_DB=letta

# TwentyCRM PostgreSQL
TWENTY_PG_HOST=localhost
TWENTY_PG_PORT=5434
TWENTY_PG_USER=twentycrm
TWENTY_PG_PASSWORD=changeme_twenty_password
TWENTY_PG_DB=twentycrm

# n8n PostgreSQL
N8N_PG_HOST=localhost
N8N_PG_PORT=5435
N8N_PG_USER=n8n
N8N_PG_PASSWORD=changeme_n8n_password
N8N_PG_DB=n8n

# Dify PostgreSQL
DIFY_PG_HOST=localhost
DIFY_PG_PORT=5436
DIFY_PG_USER=dify
DIFY_PG_PASSWORD=changeme_dify_password
DIFY_PG_DB=dify

# Redis (Cache & Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=changeme_redis_password
REDIS_DB=0

# Neo4j (Graph Database)
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme_neo4j_password

# ============================================================================
# SECTION 5: APPLICATION SECRETS
# ============================================================================
# Generate with: openssl rand -hex 32

# JWT & Session
JWT_SECRET=changeme_generate_with_openssl_rand_hex_32
JWT_ALGORITHM=HS256
JWT_EXPIRATION=24h
SESSION_SECRET=changeme_generate_with_openssl_rand_hex_32
ENCRYPTION_KEY=changeme_generate_with_openssl_rand_hex_32

# Dify Secrets
DIFY_SECRET_KEY=changeme_generate_with_openssl_rand_hex_32
DIFY_ENCRYPTION_KEY=changeme_generate_with_openssl_rand_hex_32

# Infisical (Secrets Manager)
INFISICAL_ENCRYPTION_KEY=changeme_32_char_random
INFISICAL_JWT_SECRET=changeme_32_char_random
INFISICAL_CLIENT_ID=your_client_id
INFISICAL_CLIENT_SECRET=your_client_secret

# ============================================================================
# SECTION 6: SERVICE PORTS
# ============================================================================
# Port allocation across 4-PC infrastructure

# Orchestrator Services (PC1)
NEXUS_ROUTER_PORT=6000
CLAUDE_FLOW_PORT=6100
ARCHON_OS_PORT=6200
LETTA_PORT=8283
MEM0_PORT=4321
AGENTDB_PORT=8080
RUVECTOR_PORT=8888
INFISICAL_PORT=8080

# Business Logic Services
QUOTE_ENGINE_PORT=8001
CAMPAIGN_ENGINE_PORT=8002
ORCHESTRATOR_API_PORT=8010

# Worker 2 Services (PC2)
TWENTYCRM_PORT=3000
N8N_PORT=5678
DIFY_API_PORT=3001
DIFY_WEB_PORT=3002

# Worker 3 Services (PC3)
OLLAMA_PORT=11434
NEO4J_BROWSER_PORT=7474
NEO4J_BOLT_PORT=7687
FALKORDB_PORT=6379

# Worker 4 Services (PC4)
PROMETHEUS_PORT=9090
GRAFANA_PORT=3005
LOKI_PORT=3100
ALERTMANAGER_PORT=9093

# Frontend Applications
RATEHUNTER_PORT=3100
NYRA_ADMIN_PORT=3101

# ============================================================================
# SECTION 7: CLAUDE FLOW V3 CONFIGURATION
# ============================================================================

# Core Settings
CLAUDE_FLOW_CONFIG=./claude-flow.config.json
CLAUDE_FLOW_LOG_LEVEL=info
CLAUDE_FLOW_DEBUG=false

# Swarm Configuration
SWARM_TOPOLOGY=hierarchical-mesh    # hierarchical, mesh, ring, star, hierarchical-mesh
SWARM_MAX_AGENTS=35
SWARM_STRATEGY=specialized          # balanced, specialized, adaptive
SWARM_CONSENSUS=byzantine           # byzantine, raft, gossip

# Memory Backend
CLAUDE_FLOW_MEMORY_BACKEND=hybrid   # hybrid, agentdb, filesystem
CLAUDE_FLOW_MEMORY_PATH=./.swarm/memory.db
AGENTDB_SYNC_FROM=                  # Orchestrator URL for workers

# Neural Learning
NEURAL_ENABLED=true
NEURAL_FLASH_ATTENTION=true
NEURAL_MODEL=moe                    # base, moe, sona

# MCP Server
CLAUDE_FLOW_MCP_PORT=3000
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_TRANSPORT=stdio

# Daemon
DAEMON_AUTO_START=true
DAEMON_MAX_WORKERS=2
DAEMON_WORKER_TRIGGERS=map,audit,optimize,consolidate,testgaps

# ============================================================================
# SECTION 8: GPU CONFIGURATION (Workers Only)
# ============================================================================
# Set on PC2, PC3, PC4 only

GPU_ENABLED=true                     # false on orchestrator
GPU_MODEL="RTX 3060"                # RTX 3060, RTX 5090, RTX 3090 Ti
GPU_VRAM=12GB                       # 12GB, 48GB, 24GB
GPU_PRIORITY=3                      # 1 (highest) to 3 (lowest)
WORKER_SPECIALIZATION=coding        # coding, large-models, analysis

# Ollama Configuration
OLLAMA_HOST=localhost
OLLAMA_PORT=11434
OLLAMA_MAX_LOADED_MODELS=3
OLLAMA_NUM_PARALLEL=2
OLLAMA_NUM_GPU=1

# ============================================================================
# SECTION 9: MONITORING & OBSERVABILITY
# ============================================================================

# Prometheus
PROMETHEUS_RETENTION=15d
PROMETHEUS_SCRAPE_INTERVAL=15s

# Grafana
GRAFANA_USER=admin
GRAFANA_PASSWORD=changeme_grafana_password
GRAFANA_ALLOW_EMBEDDING=true

# Loki
LOKI_RETENTION_PERIOD=30d

# Sentry (Error Tracking)
SENTRY_DSN=
SENTRY_ENABLED=false
SENTRY_ENVIRONMENT=production

# ============================================================================
# SECTION 10: RATE LIMITING & SECURITY
# ============================================================================

# Rate Limiting
RATE_LIMITING_ENABLED=true
RATE_LIMIT_WINDOW=60s
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=*                       # Change to specific domain in production
CORS_CREDENTIALS=true
AIDEFENCE_ENABLED=true              # AI Defense (AIMDS)
INPUT_VALIDATION=strict

# ============================================================================
# SECTION 11: DEVELOPMENT & TESTING
# ============================================================================

# Development Mode
DEBUG=false
VERBOSE_LOGGING=false
PRETTY_LOGS=true

# Testing
TEST_DATABASE_URL=:memory:
TEST_MOCK_EXTERNAL_APIS=true
CI=false

# ============================================================================
# SECTION 12: BACKUP & DISASTER RECOVERY
# ============================================================================

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_SCHEDULE=0 2 * * *           # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_STORAGE_PATH=/backups

# ============================================================================
# END OF CONFIGURATION
# ============================================================================
```

---

## Configuration Files

### 1. Claude Flow Configuration (`claude-flow.config.json`)

```json
{
  "version": "3.0.0-alpha.125",
  "mode": "orchestrator",
  "cluster": {
    "name": "project-nyra",
    "topology": "hierarchical-mesh",
    "maxAgents": 35,
    "strategy": "specialized"
  },
  "providers": {
    "primary": "anthropic",
    "fallback": "openrouter",
    "models": {
      "reasoning": "claude-sonnet-4-20250514",
      "coding": "claude-3-5-sonnet-20241022",
      "cheap": "gemini-1.5-flash",
      "local": "ollama/llama3.1:8b"
    }
  },
  "swarm": {
    "topology": "hierarchical-mesh",
    "consensus": "byzantine",
    "maxAgents": 35,
    "strategy": "specialized",
    "coordinator": {
      "type": "queen",
      "capabilities": ["coordination", "consensus", "arbitration"]
    }
  },
  "memory": {
    "backend": "hybrid",
    "agentdb": {
      "enabled": true,
      "path": ".swarm/memory.db",
      "hnsw": {
        "enabled": true,
        "M": 16,
        "efConstruction": 200,
        "efSearch": 100
      },
      "quantization": "int8",
      "sync": {
        "enabled": true,
        "protocol": "quic",
        "interval": 30000
      }
    }
  },
  "neural": {
    "enabled": true,
    "model": "sona",
    "flashAttention": true,
    "moe": {
      "enabled": true,
      "numExperts": 8,
      "topK": 2
    },
    "training": {
      "pretrain": true,
      "continual": true,
      "ewc": true
    }
  },
  "hooks": {
    "enabled": true,
    "preTask": true,
    "postTask": true,
    "preEdit": true,
    "postEdit": true,
    "sessionStart": true,
    "sessionEnd": true
  },
  "daemon": {
    "autoStart": true,
    "maxWorkers": 2,
    "workers": {
      "map": { "enabled": true, "priority": "normal" },
      "audit": { "enabled": true, "priority": "high" },
      "optimize": { "enabled": true, "priority": "high" },
      "consolidate": { "enabled": true, "priority": "low" },
      "testgaps": { "enabled": true, "priority": "normal" }
    }
  },
  "observability": {
    "prometheus": {
      "enabled": true,
      "port": 9090,
      "endpoint": "/metrics"
    },
    "grafana": {
      "enabled": true,
      "port": 3005
    },
    "loki": {
      "enabled": true,
      "port": 3100
    }
  },
  "security": {
    "aiDefense": true,
    "inputValidation": "strict",
    "rateLimiting": true,
    "encryption": "AES-256-GCM"
  }
}
```

### 2. Nexus Router Configuration (`configs/nexus/nexus.toml`)

```toml
[server]
host = "0.0.0.0"
port = 6000
workers = 4
keepalive = 60

[llm]
default_provider = "anthropic"
fallback_provider = "openrouter"
timeout = 120
max_retries = 3

[[providers]]
name = "anthropic"
type = "anthropic"
api_key_env = "ANTHROPIC_API_KEY"
base_url = "https://api.anthropic.com"
models = [
  "claude-3-5-sonnet-20241022",
  "claude-sonnet-4-20250514",
  "claude-3-5-haiku-20241022"
]
rate_limit = 50
tier = "premium"

[[providers]]
name = "openrouter"
type = "openrouter"
api_key_env = "OPENROUTER_API_KEY"
base_url = "https://openrouter.ai/api/v1"
models = [
  "anthropic/claude-3.5-sonnet",
  "deepseek/deepseek-r1",
  "meta-llama/llama-3.1-70b-instruct"
]
rate_limit = 100
tier = "balanced"

[[providers]]
name = "gemini"
type = "google"
api_key_env = "GOOGLE_API_KEY"
base_url = "https://generativelanguage.googleapis.com/v1beta"
models = [
  "gemini-1.5-flash",
  "gemini-1.5-pro"
]
rate_limit = 300
tier = "cheap"

[[providers]]
name = "ollama"
type = "ollama"
base_url = "http://10.0.0.3:11434"
models = [
  "llama3.1:8b",
  "mistral:7b",
  "codellama:13b"
]
rate_limit = 1000
tier = "local"

[routing]
strategy = "cost-based"  # cost-based, latency, round-robin
cost_threshold = 0.01    # Switch to cheaper model above this
latency_threshold = 5000 # Switch to faster model above this (ms)

[cache]
enabled = true
backend = "redis"
ttl = 3600              # 1 hour

[mcp]
enabled = true
proxy_mode = true
aggregation = true

[[mcp.servers]]
name = "claude-flow"
command = "npx"
args = ["@claude-flow/cli@latest"]
env = { "CLAUDE_FLOW_MCP_PORT" = "3000" }

[[mcp.servers]]
name = "flow-nexus"
command = "npx"
args = ["flow-nexus@latest", "mcp", "start"]

[logging]
level = "info"
format = "json"
output = "stdout"

[metrics]
enabled = true
port = 9091
endpoint = "/metrics"
```

### 3. LiteLLM Configuration (`configs/litellm/config.yaml`)

```yaml
router_settings:
  routing_strategy: cost-based
  num_retries: 3
  timeout: 120
  allowed_fails: 5
  cooldown_time: 300

model_list:
  # Premium Models (High Cost, Best Quality)
  - model_name: premium
    litellm_params:
      model: anthropic/claude-sonnet-4-20250514
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      tier: premium
      cost_per_token: 0.000015

  - model_name: premium
    litellm_params:
      model: anthropic/claude-3-5-sonnet-20241022
      api_key: os.environ/ANTHROPIC_API_KEY
    model_info:
      tier: premium
      cost_per_token: 0.000003

  # Balanced Models (Medium Cost, Good Quality)
  - model_name: balanced
    litellm_params:
      model: openrouter/meta-llama/llama-3.1-70b-instruct
      api_key: os.environ/OPENROUTER_API_KEY
    model_info:
      tier: balanced
      cost_per_token: 0.0000007

  - model_name: balanced
    litellm_params:
      model: openrouter/mistralai/mistral-large
      api_key: os.environ/OPENROUTER_API_KEY
    model_info:
      tier: balanced
      cost_per_token: 0.000002

  # Cheap Models (Low Cost, Fast)
  - model_name: cheap
    litellm_params:
      model: gemini/gemini-1.5-flash
      api_key: os.environ/GOOGLE_API_KEY
    model_info:
      tier: cheap
      cost_per_token: 0.00000005

  - model_name: cheap
    litellm_params:
      model: openrouter/deepseek/deepseek-r1
      api_key: os.environ/OPENROUTER_API_KEY
    model_info:
      tier: cheap
      cost_per_token: 0.00000014

  # Local Models (Zero Cost)
  - model_name: local
    litellm_params:
      model: ollama/llama3.1:8b
      api_base: http://10.0.0.3:11434
    model_info:
      tier: local
      cost_per_token: 0

model_group_alias:
  gpt-4: ["premium"]
  gpt-3.5-turbo: ["balanced", "cheap"]
  code: ["balanced", "local"]
  reasoning: ["premium", "balanced"]
  cheap: ["cheap", "local"]

litellm_settings:
  drop_params: true
  set_verbose: false
  telemetry: false
  success_callback: ["prometheus"]
  failure_callback: ["sentry"]
  cache: true
  cache_params:
    type: redis
    host: localhost
    port: 6379
    ttl: 3600
```

---

## Service Configuration

### TwentyCRM Configuration

**Location**: `configs/twentycrm/config.json`

```json
{
  "database": {
    "url": "${TWENTY_PG_HOST}:${TWENTY_PG_PORT}",
    "name": "${TWENTY_PG_DB}",
    "user": "${TWENTY_PG_USER}",
    "password": "${TWENTY_PG_PASSWORD}"
  },
  "pipeline": {
    "stages": [
      "New Lead",
      "Contacted",
      "Qualified",
      "Quote Sent",
      "Application Started",
      "Application Submitted",
      "Underwriting",
      "Approved",
      "Closed Won",
      "Closed Lost"
    ]
  },
  "custom_fields": {
    "loan_amount": "number",
    "property_value": "number",
    "credit_score": "number",
    "loan_type": "select",
    "property_state": "text",
    "property_zip": "text"
  }
}
```

### n8n Configuration

**Location**: `configs/n8n/config.json`

```json
{
  "database": {
    "type": "postgresdb",
    "host": "${N8N_PG_HOST}",
    "port": ${N8N_PG_PORT},
    "database": "${N8N_PG_DB}",
    "user": "${N8N_PG_USER}",
    "password": "${N8N_PG_PASSWORD}"
  },
  "executions": {
    "process": "main",
    "mode": "regular",
    "timeout": 300,
    "maxTimeout": 3600,
    "saveDataOnError": "all",
    "saveDataOnSuccess": "all",
    "saveDataManualExecutions": true,
    "pruneData": true,
    "pruneDataMaxAge": 336
  },
  "credentials": {
    "overwrite": {
      "endpoint": "${CREDENTIALS_ENDPOINT}"
    }
  },
  "generic": {
    "timezone": "America/Los_Angeles"
  }
}
```

### Prometheus Configuration

**Location**: `configs/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: project-nyra
    environment: production

scrape_configs:
  # Nexus Router
  - job_name: nexus-router
    static_configs:
      - targets: ['10.0.0.1:9091']
        labels:
          service: nexus-router
          pc: orchestrator

  # Quote Engine
  - job_name: quote-engine
    static_configs:
      - targets: ['10.0.0.1:8001']
        labels:
          service: quote-engine
          pc: orchestrator

  # Campaign Engine
  - job_name: campaign-engine
    static_configs:
      - targets: ['10.0.0.1:8002']
        labels:
          service: campaign-engine
          pc: orchestrator

  # Ollama
  - job_name: ollama
    static_configs:
      - targets: ['10.0.0.3:11434']
        labels:
          service: ollama
          pc: worker-3
          gpu: rtx-5090

  # Node Exporter (all PCs)
  - job_name: node-exporter
    static_configs:
      - targets:
        - '10.0.0.1:9100'
        - '10.0.0.2:9100'
        - '10.0.0.3:9100'
        - '10.0.0.4:9100'
        labels:
          service: node-exporter

  # Docker Containers
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: [__meta_docker_container_name]
        target_label: container
```

---

## PC-Specific Configuration

### PC1 - Orchestrator Configuration

```bash
# .env.orchestrator
PC_NAME=orchestrator
PC_ROLE=orchestrator
LAN_IP=10.0.0.1

CLAUDE_FLOW_MODE=orchestrator
SWARM_TOPOLOGY=hierarchical-mesh
SWARM_MAX_AGENTS=35

# Services enabled on this PC
ENABLE_NEXUS_ROUTER=true
ENABLE_LETTA=true
ENABLE_MEM0=true
ENABLE_CLAUDE_FLOW=true
ENABLE_ARCHON_OS=true

GPU_ENABLED=false
```

### PC2 - Worker (RTX 3060) Configuration

```bash
# .env.worker-3060
PC_NAME=worker-2
PC_ROLE=worker
LAN_IP=10.0.0.2

CLAUDE_FLOW_MODE=worker
SWARM_WORKER_ID=worker-3060
WORKER_SPECIALIZATION=coding

# Services enabled on this PC
ENABLE_TWENTYCRM=true
ENABLE_N8N=true
ENABLE_DIFY=true

GPU_ENABLED=true
GPU_MODEL="RTX 3060"
GPU_VRAM=12GB
GPU_PRIORITY=3
```

### PC3 - Worker (RTX 5090) Configuration

```bash
# .env.worker-5090
PC_NAME=worker-3
PC_ROLE=worker
LAN_IP=10.0.0.3

CLAUDE_FLOW_MODE=worker
SWARM_WORKER_ID=worker-5090
WORKER_SPECIALIZATION=large-models

# Services enabled on this PC
ENABLE_OLLAMA=true
ENABLE_NEO4J=true
ENABLE_FALKORDB=true

GPU_ENABLED=true
GPU_MODEL="RTX 5090"
GPU_VRAM=48GB
GPU_PRIORITY=1

# Ollama settings for large models
OLLAMA_MAX_LOADED_MODELS=2
OLLAMA_NUM_PARALLEL=1
OLLAMA_NUM_GPU=1
OLLAMA_GPU_LAYERS=99
```

### PC4 - Worker (RTX 3090 Ti) Configuration

```bash
# .env.worker-3090ti
PC_NAME=worker-4
PC_ROLE=worker
LAN_IP=10.0.0.4

CLAUDE_FLOW_MODE=worker
SWARM_WORKER_ID=worker-3090ti
WORKER_SPECIALIZATION=analysis

# Services enabled on this PC
ENABLE_PROMETHEUS=true
ENABLE_GRAFANA=true
ENABLE_LOKI=true
ENABLE_ALERTMANAGER=true

GPU_ENABLED=true
GPU_MODEL="RTX 3090 Ti"
GPU_VRAM=24GB
GPU_PRIORITY=2
```

---

## Security Configuration

### Secrets Generation

```bash
#!/bin/bash
# Generate all required secrets

echo "Generating secure secrets..."

echo "JWT_SECRET=$(openssl rand -hex 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo "SESSION_SECRET=$(openssl rand -hex 32)"
echo "DIFY_SECRET_KEY=$(openssl rand -hex 32)"
echo "INFISICAL_ENCRYPTION_KEY=$(openssl rand -hex 32)"
echo ""
echo "Database passwords:"
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 32)"
echo "LETTA_PG_PASSWORD=$(openssl rand -base64 32)"
echo "TWENTY_PG_PASSWORD=$(openssl rand -base64 32)"
echo "N8N_PG_PASSWORD=$(openssl rand -base64 32)"
echo "DIFY_PG_PASSWORD=$(openssl rand -base64 32)"
echo "NEO4J_PASSWORD=$(openssl rand -base64 32)"
```

### Infisical Configuration

```bash
# Install Infisical CLI
npm install -g @infisical/cli

# Login
infisical login

# Create project
infisical projects create --name "Project Nyra"

# Set secrets
infisical secrets set ANTHROPIC_API_KEY "sk-ant-api03-xxxxx"
infisical secrets set OPENROUTER_API_KEY "sk-or-v1-xxxxx"
infisical secrets set POSTGRES_PASSWORD "your-secure-password"

# Run with secrets injection
infisical run -- docker compose up -d
```

---

## Configuration Management

### Environment Switching

```bash
# Development
cp .env.development .env
docker compose -f docker-compose.dev.yml up -d

# Production
cp .env.production .env
docker compose -f docker-compose.yml up -d

# Testing
cp .env.ci .env
npm test
```

### Configuration Validation

```bash
# Validate Claude Flow config
npx @claude-flow/cli@latest config validate

# List current configuration
npx @claude-flow/cli@latest config list

# Get specific value
npx @claude-flow/cli@latest config get swarm.maxAgents
```

### Configuration Backup

```bash
# Backup all configs
tar czf config-backup-$(date +%Y%m%d).tar.gz \
  .env \
  configs/ \
  claude-flow.config.json \
  infra/docker/*.yml

# Restore from backup
tar xzf config-backup-20260121.tar.gz
```

---

## Troubleshooting Configuration

### Common Configuration Issues

**Issue: Environment variables not loading**
```bash
# Check .env file exists
ls -la .env

# Check syntax
cat .env | grep -v '^#' | grep -v '^$'

# Reload environment
source .env
```

**Issue: Docker can't find environment variables**
```bash
# Verify docker-compose can read .env
docker compose config

# Check specific service environment
docker compose config | grep -A 20 "service-name:"
```

**Issue: Claude Flow config not loading**
```bash
# Check config file
cat claude-flow.config.json | jq .

# Validate config
npx @claude-flow/cli@latest config validate

# Reset to defaults
npx @claude-flow/cli@latest config reset
```

---

## Related Documentation

- [Setup Guide](SETUP-GUIDE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [API Reference](API-REFERENCE.md)

---

**Configuration Guide Version**: 2.0.0
**Last Updated**: 2026-01-21
**Maintainer**: Project Nyra Team
