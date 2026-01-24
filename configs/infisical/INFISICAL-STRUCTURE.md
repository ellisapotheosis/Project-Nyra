# Infisical Secrets Organization - Project Nyra
**Project ID:** `8374cea9-e5e8-4050-bda4-b91f25ab30ef`
**Environment:** `dev`
**Strategy:** Hierarchical with /shared as aggregation point

---

## 📁 DIRECTORY STRUCTURE

```
/ (root - default project-nyra path)
├── shared/              # ⭐ PRIMARY - Aggregates all imported paths
│   ├── → /clients/*     # Imported from clients
│   ├── → /providers/*   # Imported from providers
│   ├── → /databases/*   # Imported from databases
│   ├── → /monitoring/*  # Imported from monitoring
│   ├── → /security/*    # Imported from security
│   └── → /github/*      # Imported from github
│
├── clients/             # MCP servers & services
│   ├── claude-flow/     # Claude Flow orchestration
│   ├── claude-code/     # Claude Code CLI
│   ├── nexus-router/    # LLM routing gateway
│   ├── cloudflare/      # Cloudflare tunnels & Pages
│   ├── agentic-flow/    # Agentic Flow MCP
│   ├── ruv-swarm/       # Ruv-Swarm MCP
│   ├── flow-nexus/      # Flow Nexus platform
│   ├── agentdb/         # AgentDB MCP
│   ├── ruvector/        # RuVector vector search
│   ├── letta/           # Letta memory system
│   ├── graphiti/        # Graphiti knowledge graphs
│   ├── mem0/            # Mem0 memory system
│   ├── bitwarden/       # Bitwarden MCP
│   ├── supabase/        # Supabase MCP
│   └── n8n/             # n8n workflow automation
│
├── providers/           # AI/LLM providers
│   ├── anthropic/       # Claude API keys
│   ├── openai/          # OpenAI API keys
│   ├── google/          # Google/Gemini API keys
│   ├── openrouter/      # OpenRouter API keys
│   └── deepseek/        # DeepSeek API keys
│
├── machines/            # Per-PC configurations
│   ├── orchestrator-mini/   # Area51 (orchestrator)
│   ├── worker-rtx3060/      # PC2 (code tasks)
│   ├── worker-rtx3090ti/    # PC4 (analysis)
│   └── worker-rtx5090/      # PC3 (large models - primary)
│
├── monitoring/          # Observability stack
│   ├── grafana/         # Grafana dashboards
│   ├── prometheus/      # Prometheus metrics
│   ├── loki/            # Loki log aggregation
│   ├── alertmanager/    # Alert routing
│   ├── langfuse/        # LLM observability
│   └── cadvisor/        # Container metrics
│
├── databases/           # Database credentials
│   ├── postgres/        # PostgreSQL (Supabase)
│   ├── redis/           # Redis cache
│   ├── falkordb/        # FalkorDB graph database
│   └── qdrant/          # Qdrant vector database
│
├── security/            # Security services
│   ├── infisical/       # Infisical service tokens
│   ├── vault/           # HashiCorp Vault (if using)
│   └── auth/            # Authentication secrets
│
├── github/              # GitHub integration
│   └── tokens/          # PATs, app tokens
│
└── apps/                # Separate applications
    ├── twenty/          # TwentyCRM
    ├── ratehunter/      # RateHunter landing page
    ├── dify/            # Dify chat interface
    └── nexus-dashboard/ # Nexus dashboard
```

---

## 🗂️ SECRET MAPPING BY PATH

### `/shared` (Aggregation Point)
**Purpose:** Contains ALL secrets imported from other paths
**Use Case:** Export complete .env for entire project
**Import From:**
- All /clients/* paths
- All /providers/* paths
- All /databases/* paths
- All /monitoring/* paths
- /security/infisical
- /github/tokens

**Secrets:** ~200-250 variables (aggregated)

---

### `/clients/claude-flow/`
**Purpose:** Claude Flow V3 orchestration configuration

```bash
# Core Settings
CLAUDE_FLOW_MODE=orchestrator
CLAUDE_FLOW_TELEMETRY_ENABLED=true
CLAUDE_FLOW_AUTO_LEARNING=true
CLAUDE_FLOW_NEURAL_OPTIMIZATION=true
CLAUDE_FLOW_HOOKS_ENABLED=true
CLAUDE_FLOW_GITHUB_INTEGRATION=true
CLAUDE_FLOW_CHECKPOINTS_ENABLED=true
CLAUDE_FLOW_MEMORY_PERSISTENCE=true
CLAUDE_FLOW_AUTO_SECRETS=true
CLAUDE_FLOW_AUTO_COMMIT=true
CLAUDE_FLOW_AUTO_PUSH=false
CLAUDE_FLOW_PERFORMANCE_MODE=optimized

# Daemon & Workers
CLAUDE_FLOW_DAEMON_PORT=3001
CLAUDE_FLOW_WORKER_COUNT=5

# API Keys (references to providers)
# These might reference /providers/anthropic, etc.
```

---

### `/clients/claude-code/`
**Purpose:** Claude Code CLI configuration

```bash
# Core Settings
CLAUDECODE=1
CLAUDE_CODE_ENTRYPOINT=cli
CLAUDE_CODE_VERBOSE=true
CLAUDE_CODE_TELEMETRY=true
CLAUDE_EXTENDED_THINKING=true
CLAUDE_AUTO_APPROVE=1

# Git Integration
CLAUDE_CODE_GIT_BASH_PATH=C:\Program Files\Git\usr\bin\bash.exe

# MCP Configuration
# References to MCP servers in /clients/*
```

---

### `/clients/nexus-router/`
**Purpose:** Nexus Router LLM gateway

```bash
# Core Configuration
NEXUS_ROUTER_ENABLED=true
NEXUS_ROUTER_PORT=8000
NEXUS_URL=http://localhost:8000
NEXT_PUBLIC_NEXUS_URL=http://localhost:8000

# Authentication
NEXUS_JWT_SECRET=<generate-with-openssl-rand-hex-32>
NEXUS_ADMIN_TOKEN=<generate-with-openssl-rand-hex-32>
NEXUS_API_KEY=<generate-with-openssl-rand-hex-32>

# Load Balancing
NEXUS_LOAD_BALANCING=least-loaded
NEXUS_HEALTH_CHECK_INTERVAL=30
NEXUS_FALLBACK_ENABLED=true

# Model Routing
MODEL_ROUTING_STRATEGY=cost-optimized
MODEL_ROUTING_PREFER_LOCAL=true
MODEL_ROUTING_FALLBACK_CLOUD=true

# Worker URLs (references to /machines/*)
NEXUS_WORKER_3060_URL=${GPU_WORKER_3060_URL}
NEXUS_WORKER_3090_URL=${GPU_WORKER_3090_URL}
NEXUS_WORKER_5090_URL=${GPU_WORKER_5090_URL}

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${REDIS_PASSWORD}  # From /databases/redis
```

---

### `/clients/cloudflare/`
**Purpose:** Cloudflare Tunnels, Pages, DNS

```bash
# Account
CLOUDFLARE_API_TOKEN=<your-cloudflare-api-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
CLOUDFLARE_ZONE_ID=<your-zone-id-for-ratehunter.net>

# Tunnels
CLOUDFLARE_TUNNEL_TOKEN=<tunnel-token-for-area51>
CLOUDFLARE_TUNNEL_ID=<tunnel-id>
CLOUDFLARE_TUNNEL_ORCHESTRATOR_TOKEN=<orchestrator-tunnel-token>
CLOUDFLARE_TUNNEL_WORKER_3060_TOKEN=<worker-3060-tunnel-token>
CLOUDFLARE_TUNNEL_WORKER_3090_TOKEN=<worker-3090-tunnel-token>
CLOUDFLARE_TUNNEL_WORKER_5090_TOKEN=<worker-5090-tunnel-token>

# Pages
CLOUDFLARE_PAGES_PROJECT_NAME=ratehunter-landing
CLOUDFLARE_PAGES_BRANCH=main

# DNS
CLOUDFLARE_DNS_ZONE=ratehunter.net
```

---

### `/clients/supabase/`
**Purpose:** Supabase backend services

```bash
# Project
SUPABASE_PROJECT_ID=bttmpxdgjjnhqmqfnygy
SUPABASE_URL=https://bttmpxdgjjnhqmqfnygy.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_ACCESS_TOKEN=<your-supabase-access-token>

# Database (also in /databases/postgres)
DATABASE_URL=postgresql://postgres.bttmpxdgjjnhqmqfnygy:<password>@aws-0-us-west-1.pooler.supabase.com:6543/postgres

# Auth
SUPABASE_JWT_SECRET=<your-jwt-secret>
```

---

### `/clients/n8n/`
**Purpose:** n8n workflow automation

```bash
# Core
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
N8N_WEBHOOK_BASE_URL=https://n8n.your-domain.com

# Database (references /databases/postgres)
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_HOST=${POSTGRES_HOST}
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=${POSTGRES_USER}
DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}

# Encryption
N8N_ENCRYPTION_KEY=<generate-with-openssl-rand-hex-32>

# Authentication
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=<strong-password>
```

---

### `/providers/anthropic/`
**Purpose:** Claude API credentials

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
ANTHROPIC_MAX_TOKENS=4096
ANTHROPIC_TIMEOUT=120000
ANTHROPIC_BASE_URL=https://api.anthropic.com/v1
```

---

### `/providers/openai/`
**Purpose:** OpenAI API credentials

```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
OPENAI_TIMEOUT=120000
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_ORGANIZATION=<your-org-id>
```

---

### `/providers/google/`
**Purpose:** Google Gemini API credentials

```bash
GOOGLE_API_KEY=AIzaSy...
GOOGLE_GEMINI_MODEL=gemini-2.0-flash-exp
GOOGLE_PROJECT_ID=<your-gcp-project-id>
VERTEX_AI_PROJECT=<your-gcp-project-id>
VERTEX_AI_LOCATION=us-central1
```

---

### `/providers/openrouter/`
**Purpose:** OpenRouter multi-model API

```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=deepseek/deepseek-r1
OPENROUTER_SITE_URL=https://ratehunter.net
OPENROUTER_SITE_NAME=Project Nyra
OPENROUTER_FALLBACK_MODELS=anthropic/claude-3.5-sonnet,google/gemini-2.0-flash-exp
```

---

### `/machines/orchestrator-mini/`
**Purpose:** Area51 orchestrator-specific config

```bash
# Role
HOST_ROLE=orchestrator
HOSTNAME=Area51
CLAUDE_FLOW_MODE=orchestrator

# Hardware
GPU_ENABLED=false
CPU_CORES=16
RAM_GB=64

# Services to Run
SERVICES_TO_RUN=nexus,archon,twentycrm,n8n,dify,grafana,prometheus

# Local LLM Routing
OLLAMA_HOST=http://localhost:11434  # Routes to workers
LOCAL_LLM_ENABLED=true
LOCAL_LLM_PRIORITY=true

# Tailscale
TAILSCALE_HOSTNAME=orchestrator-mini.tail-net.ts.net
TAILSCALE_IP=100.x.x.x
```

---

### `/machines/worker-rtx3060/`
**Purpose:** PC2 - RTX 3060 (Code tasks)

```bash
# Role
HOST_ROLE=gpu-worker
HOSTNAME=Worker-RTX3060
CLAUDE_FLOW_MODE=worker

# Hardware
GPU_TYPE=RTX_3060
GPU_VRAM=12GB
GPU_ENABLED=true
GPU_DEVICE_ID=0

# Ollama
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=codellama:34b-q8,qwen2.5:32b-q8,gemma2:27b
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=2

# Worker Priority
WORKER_PRIORITY=3
WORKER_MAX_CONCURRENT=2
WORKER_SPECIALIZATION=code-generation

# Tailscale
TAILSCALE_HOSTNAME=worker-3060.tail-net.ts.net
GPU_WORKER_3060_URL=http://worker-3060.tail-net.ts.net:11434
```

---

### `/machines/worker-rtx5090/`
**Purpose:** PC3 - RTX 5090 (Large models - PRIMARY)

```bash
# Role
HOST_ROLE=gpu-worker-primary
HOSTNAME=Worker-RTX5090
CLAUDE_FLOW_MODE=worker

# Hardware
GPU_TYPE=RTX_5090
GPU_VRAM=32GB
GPU_ENABLED=true
GPU_DEVICE_ID=0

# Ollama
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=deepseek-r1:236b-q4,qwen2.5:72b-q8,llama3.3:70b-q8
OLLAMA_NUM_PARALLEL=3
OLLAMA_MAX_LOADED_MODELS=3

# Worker Priority
WORKER_PRIORITY=1
WORKER_MAX_CONCURRENT=3
WORKER_SPECIALIZATION=large-models,reasoning

# Tailscale
TAILSCALE_HOSTNAME=worker-5090.tail-net.ts.net
GPU_WORKER_5090_URL=http://worker-5090.tail-net.ts.net:11434
```

---

### `/machines/worker-rtx3090ti/`
**Purpose:** PC4 - RTX 3090 Ti (Analysis - SECONDARY)

```bash
# Role
HOST_ROLE=gpu-worker-secondary
HOSTNAME=Worker-RTX3090Ti
CLAUDE_FLOW_MODE=worker

# Hardware
GPU_TYPE=RTX_3090_TI
GPU_VRAM=24GB
GPU_ENABLED=true
GPU_DEVICE_ID=0

# Ollama
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_MODELS=llama3.1:70b-q4,mistral-large:123b-q4,mixtral:8x22b-q4
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=2

# Worker Priority
WORKER_PRIORITY=2
WORKER_MAX_CONCURRENT=2
WORKER_SPECIALIZATION=analysis,embedding

# Tailscale
TAILSCALE_HOSTNAME=worker-3090.tail-net.ts.net
GPU_WORKER_3090_URL=http://worker-3090.tail-net.ts.net:11434
```

---

### `/databases/postgres/`
**Purpose:** PostgreSQL (Supabase) credentials

```bash
# Connection
POSTGRES_HOST=aws-0-us-west-1.pooler.supabase.com
POSTGRES_PORT=6543
POSTGRES_USER=postgres.bttmpxdgjjnhqmqfnygy
POSTGRES_PASSWORD=<generate-strong-password>
POSTGRES_DB=postgres
POSTGRES_SSL=true

# Full URL
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
DATABASE_DIRECT_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db.bttmpxdgjjnhqmqfnygy.supabase.co:5432/${POSTGRES_DB}

# Pooling
PGBOUNCER_ENABLED=true
PGBOUNCER_POOL_MODE=transaction
```

---

### `/databases/redis/`
**Purpose:** Redis cache credentials

```bash
# Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<generate-with-openssl-rand-hex-32>
REDIS_DB=0
REDIS_TLS=false

# Full URL
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}

# Configuration
REDIS_MAX_MEMORY=2gb
REDIS_MAX_MEMORY_POLICY=allkeys-lru
REDIS_PERSISTENCE=aof
```

---

### `/monitoring/grafana/`
**Purpose:** Grafana dashboard credentials

```bash
# Server
GRAFANA_HOST=localhost
GRAFANA_PORT=3005
GRAFANA_PROTOCOL=http

# Auth
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=<strong-password>
GF_SECURITY_SECRET_KEY=<generate-with-openssl-rand-hex-32>

# Database (uses Postgres)
GF_DATABASE_TYPE=postgres
GF_DATABASE_HOST=${POSTGRES_HOST}
GF_DATABASE_NAME=grafana
GF_DATABASE_USER=${POSTGRES_USER}
GF_DATABASE_PASSWORD=${POSTGRES_PASSWORD}
```

---

### `/monitoring/prometheus/`
**Purpose:** Prometheus metrics

```bash
# Server
PROMETHEUS_PORT=9090
PROMETHEUS_RETENTION=15d
PROMETHEUS_STORAGE_PATH=/prometheus/data

# Scrape Configuration
PROMETHEUS_SCRAPE_INTERVAL=15s
PROMETHEUS_EVALUATION_INTERVAL=15s

# Targets
PROMETHEUS_TARGETS=localhost:3000,localhost:8000,localhost:5678
```

---

### `/monitoring/langfuse/`
**Purpose:** LLM observability

```bash
# Server
LANGFUSE_HOST=https://cloud.langfuse.com
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...

# Project
LANGFUSE_PROJECT_ID=<your-project-id>

# Integration
LANGFUSE_ENABLED=true
LANGFUSE_SAMPLE_RATE=1.0
```

---

### `/security/infisical/`
**Purpose:** Infisical service tokens

```bash
# Project
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENVIRONMENT=dev
INFISICAL_PATH=/shared

# Service Tokens (per machine)
INFISICAL_TOKEN_ORCHESTRATOR=<service-token-for-orchestrator>
INFISICAL_TOKEN_WORKER_3060=<service-token-for-worker-3060>
INFISICAL_TOKEN_WORKER_3090=<service-token-for-worker-3090>
INFISICAL_TOKEN_WORKER_5090=<service-token-for-worker-5090>

# API
INFISICAL_API_URL=https://app.infisical.com/api
```

---

### `/github/`
**Purpose:** GitHub integration tokens

```bash
# Personal Access Token
GITHUB_TOKEN=ghp_...
GITHUB_PAT=ghp_...

# App Credentials (if using GitHub App)
GITHUB_APP_ID=<app-id>
GITHUB_APP_PRIVATE_KEY=<private-key-base64>
GITHUB_APP_CLIENT_ID=<client-id>
GITHUB_APP_CLIENT_SECRET=<client-secret>

# Repository
GITHUB_OWNER=ellisapotheosis
GITHUB_REPO=Project-Nyra
GITHUB_REPO_URL=https://github.com/ellisapotheosis/Project-Nyra
```

---

### `/apps/twenty/`
**Purpose:** TwentyCRM application

```bash
# Server
TWENTY_SERVER_URL=http://localhost:3000
TWENTY_FRONT_BASE_URL=http://localhost:3001

# Database (separate from main Postgres)
TWENTY_POSTGRES_HOST=${POSTGRES_HOST}
TWENTY_POSTGRES_PORT=5432
TWENTY_POSTGRES_USER=twenty
TWENTY_POSTGRES_PASSWORD=<generate-strong-password>
TWENTY_POSTGRES_DB=twenty

# Auth
TWENTY_ACCESS_TOKEN_SECRET=<generate-with-openssl-rand-hex-64>
TWENTY_REFRESH_TOKEN_SECRET=<generate-with-openssl-rand-hex-64>
TWENTY_LOGIN_TOKEN_SECRET=<generate-with-openssl-rand-hex-64>

# Storage (Supabase)
TWENTY_STORAGE_TYPE=s3
TWENTY_STORAGE_S3_REGION=us-west-1
TWENTY_STORAGE_S3_BUCKET=twenty-storage
TWENTY_STORAGE_S3_ENDPOINT=${SUPABASE_URL}/storage/v1/s3
```

---

## 📊 COMPLETE VARIABLE COUNT BY PATH

| Path | Variables | Priority |
|------|-----------|----------|
| `/shared` | ~250 | ⭐ Primary (aggregated) |
| `/clients/claude-flow` | ~15 | High |
| `/clients/nexus-router` | ~20 | High |
| `/clients/cloudflare` | ~12 | High |
| `/clients/supabase` | ~8 | High |
| `/providers/anthropic` | ~5 | Critical |
| `/providers/openai` | ~6 | Critical |
| `/providers/google` | ~5 | Medium |
| `/providers/openrouter` | ~5 | Medium |
| `/machines/orchestrator-mini` | ~15 | High |
| `/machines/worker-rtx3060` | ~12 | High |
| `/machines/worker-rtx5090` | ~12 | High |
| `/machines/worker-rtx3090ti` | ~12 | High |
| `/databases/postgres` | ~10 | Critical |
| `/databases/redis` | ~8 | High |
| `/monitoring/grafana` | ~8 | Medium |
| `/monitoring/prometheus` | ~6 | Medium |
| `/security/infisical` | ~8 | Critical |
| `/github` | ~6 | High |
| `/apps/twenty` | ~12 | Medium |

---

## 🔄 IMPORT STRATEGY

Infisical's import feature allows you to reference secrets from other paths in `/shared`:

```yaml
# In /shared path, import from:
- /clients/claude-flow/*
- /clients/nexus-router/*
- /clients/cloudflare/*
- /clients/supabase/*
- /providers/anthropic/*
- /providers/openai/*
- /databases/postgres/*
- /databases/redis/*
- /security/infisical/*
- /github/*
```

This way `/shared` becomes a complete aggregation of all secrets needed for the project.

---

## ✅ NEXT STEPS

1. **Populate individual paths** with secrets (see export/import scripts)
2. **Import paths into /shared** using Infisical UI
3. **Export /shared to .env** for complete project secrets
4. **Export machine-specific paths** to per-PC .env files

See: `scripts/infisical-export-all.sh` for automation
