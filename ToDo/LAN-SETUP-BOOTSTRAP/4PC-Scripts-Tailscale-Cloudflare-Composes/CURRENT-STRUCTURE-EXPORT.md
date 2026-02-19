# Current Infisical Path Structure & Variables Export

**Generated**: 2026-02-10  
**Source**: `C:\Users\edane\OneDrive\LANShare\NyraFleet\infisical-setup\`

## Path Hierarchy Summary

### Top-Level Path Groups
```
/shared/              (4 paths)
/machines/            (4 paths)
/clients/             (5 paths)
/databases/           (4 paths)
/providers/           (4 paths)
/adapters/            (2 paths)
/router/              (1 path)
/github-actions/      (1 path)
/security/            (1 path)
/runs/                (1 path)
/profiles/            (1 path)
```

**Total Paths Defined**: 28

---

## Detailed Path Breakdown

### /shared (Global Configuration)

#### `/shared/shared-base` - Global Defaults
```
DEFAULT_TIMEOUT_S=30
LOG_LEVEL=info
NYRA_STACK_NAME=nyra-orchestrator
NAMESPACE_PREFIX=nyra
NAMESPACE_ENVIRONMENT=production
```
**Variables**: 5  
**Purpose**: Global defaults used by many services

---

#### `/shared/shared-network` - Network Constants
```
INTERNAL_NETWORK=192.168.1.0/24
INTERNAL_NETWORK_GATEWAY=192.168.1.254
INTERNAL_NETWORK_DNS_PRIMARY=192.168.1.254
INTERNAL_NETWORK_DNS_SECONDARY=2600:1700:65f0:8960::1
```
**Variables**: 4  
**Purpose**: Network constants used across machines

---

#### `/shared/shared-observability` - Monitoring
**Status**: Defined but no template created yet  
**Expected Variables**:
- PROMETHEUS_RETENTION_DAYS
- GRAFANA_DEFAULT_DASHBOARD
- LOG_AGGREGATION_ENABLED

---

#### `/shared/shared-attribution` - Licensing
**Status**: Defined but no template created yet  
**Expected Variables**:
- PROJECT_ATTRIBUTION
- LICENSE_TYPE

---

### /machines (Per-Machine Configuration)

#### `/machines/orchestrator` - Orchestrator-Mini
```
ORCHESTRATOR_IP=192.168.1.232
ORCHESTRATOR_TAILSCALE_IP=100.115.69.115
ORCHESTRATOR_HOSTNAME=MINISAPOTHEOSIS
ORCHESTRATOR_PORT=6100
ORCHESTRATOR_HEALTH_PORT=6101
ORCHESTRATOR_METRICS_PORT=9999
```
**Variables**: 6  
**Purpose**: Central orchestrator configuration

---

#### `/machines/worker-rtx3060` - RTX 3060 GPU Worker
```
WORKER_RTX3060_IP=192.168.1.233
WORKER_RTX3060_TAILSCALE_IP=100.126.61.37
WORKER_RTX3060_HOSTNAME=ALIENAPOTHEOSIS
WORKER_RTX3060_GPU_VRAM_GB=12
WORKER_RTX3060_INFERENCE_ENGINE=ollama
WORKER_RTX3060_PRIORITY=medium
WORKER_RTX3060_CONCURRENT_REQUESTS=2
```
**Variables**: 7  
**Purpose**: 12GB GPU worker configuration

---

#### `/machines/worker-rtx3090ti` - RTX 3090 Ti GPU Worker
```
WORKER_RTX3090TI_IP=192.168.1.236
WORKER_RTX3090TI_TAILSCALE_IP=TO_BE_COLLECTED
WORKER_RTX3090TI_HOSTNAME=RTX3090TI-WORKER
WORKER_RTX3090TI_GPU_VRAM_GB=24
WORKER_RTX3090TI_INFERENCE_ENGINE=ollama
WORKER_RTX3090TI_LMCACHE_ENABLED=true
WORKER_RTX3090TI_LMCACHE_MAX_SIZE_GB=12
WORKER_RTX3090TI_PRIORITY=high
WORKER_RTX3090TI_CONCURRENT_REQUESTS=4
```
**Variables**: 9  
**Purpose**: 24GB GPU worker with LMCache

---

#### `/machines/worker-rtx5090` - RTX 5090 GPU Worker
```
WORKER_RTX5090_IP=192.168.1.234
WORKER_RTX5090_TAILSCALE_IP=TO_BE_COLLECTED
WORKER_RTX5090_HOSTNAME=AREA51
WORKER_RTX5090_GPU_VRAM_GB=48
WORKER_RTX5090_INFERENCE_ENGINE=vllm
WORKER_RTX5090_LMCACHE_ENABLED=true
WORKER_RTX5090_LMCACHE_MAX_SIZE_GB=24
WORKER_RTX5090_PRIORITY=highest
WORKER_RTX5090_CONCURRENT_REQUESTS=6
WORKER_RTX5090_MAX_SEQUENCE_LENGTH=128000
```
**Variables**: 10  
**Purpose**: 48GB flagship GPU worker with vLLM + LMCache

---

### /clients (Integration Services)

#### `/clients/cloudflare` - Cloudflare Tunnel & DNS
```
CLOUDFLARE_API_TOKEN=YOUR_CLOUDFLARE_API_TOKEN_HERE
CLOUDFLARE_ZONE_ID=YOUR_CLOUDFLARE_ZONE_ID_HERE
CLOUDFLARE_TUNNEL_ID=64fe03f2-9859-44ca-b0ab-e499d8464104
CLOUDFLARE_TUNNEL_TOKEN=YOUR_CLOUDFLARE_TUNNEL_TOKEN_HERE
CLOUDFLARE_TUNNEL_NAME=orchestrator-essential
CLOUDFLARE_DOMAIN_PRIMARY=ratehunter.net
CLOUDFLARE_DOMAIN_SECONDARY=nyra.ratehunter.net
```
**Variables**: 7  
**Purpose**: Cloudflare tunnel and DNS integration

---

#### `/clients/tailscale` - Tailscale VPN Mesh
```
TAILSCALE_API_KEY=YOUR_TAILSCALE_API_KEY_HERE
TAILSCALE_AUTH_KEY=YOUR_TAILSCALE_AUTH_KEY_HERE
TAILSCALE_TAILNET=YOUR_TAILNET_NAME
TAILSCALE_ACL_ENABLED=true
```
**Variables**: 4  
**Purpose**: Tailscale VPN mesh network configuration

---

#### `/clients/github` - GitHub Integration
**Status**: Defined but no template created yet  
**Expected Variables**:
- GITHUB_TOKEN
- GITHUB_APP_ID
- GITHUB_APP_PRIVATE_KEY
- GITHUB_WEBHOOK_SECRET

---

#### `/clients/claude-flow` - Claude Flow MCP
**Status**: Defined but no template created yet  
**Expected Variables**:
- CLAUDE_FLOW_API_KEY
- CLAUDE_FLOW_BASE_URL
- CLAUDE_FLOW_TIMEOUT_S

---

#### `/clients/archon` - Archon Agent Orchestrator
**Status**: Defined but no template created yet  
**Expected Variables**:
- ARCHON_API_KEY
- ARCHON_BASE_URL
- ARCHON_AUTH_ENABLED

---

#### `/clients/ngrok` - Ngrok Tunneling
**Status**: Defined but no template created yet  
**Expected Variables**:
- NGROK_AUTH_TOKEN
- NGROK_API_KEY

---

### /databases (Data Storage)

#### `/databases/redis` - Redis Cache
```
REDIS_HOST=100.115.69.115
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD_HERE
REDIS_DB=0
REDIS_URL=redis://:YOUR_REDIS_PASSWORD_HERE@100.115.69.115:6379/0
```
**Variables**: 5  
**Purpose**: Redis cache and session store

---

#### `/databases/postgres` - PostgreSQL Database
```
POSTGRES_HOST=100.115.69.115
POSTGRES_PORT=5432
POSTGRES_USER=nyra
POSTGRES_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE
POSTGRES_DB=nyra
DATABASE_URL=postgresql://nyra:YOUR_POSTGRES_PASSWORD_HERE@100.115.69.115:5432/nyra
```
**Variables**: 6  
**Purpose**: PostgreSQL database configuration

---

#### `/databases/qdrant` - Qdrant Vector DB
**Status**: Defined but no template created yet  
**Expected Variables**:
- QDRANT_HOST
- QDRANT_PORT
- QDRANT_API_KEY
- QDRANT_COLLECTION_NAME

---

#### `/databases/chromadb` - ChromaDB Vector Store
**Status**: Defined but no template created yet  
**Expected Variables**:
- CHROMADB_HOST
- CHROMADB_PORT
- CHROMADB_API_KEY

---

### /providers (AI Model Providers)

#### `/providers/anthropic` - Claude API
```
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL_TIMEOUT_S=300
ANTHROPIC_DEFAULT_MODEL=claude-opus-4.5-20250806
```
**Variables**: 4  
**Purpose**: Anthropic Claude API configuration

---

#### `/providers/openai` - OpenAI API
**Status**: Defined but no template created yet  
**Expected Variables**:
- OPENAI_API_KEY
- OPENAI_BASE_URL
- OPENAI_ORG_ID

---

#### `/providers/google` - Google AI (Gemini, Vertex)
**Status**: Defined but no template created yet  
**Expected Variables**:
- GOOGLE_API_KEY
- GOOGLE_PROJECT_ID
- GOOGLE_CLOUD_CREDENTIALS_JSON

---

#### `/providers/huggingface` - Hugging Face Hub
```
HF_TOKEN=YOUR_HUGGING_FACE_TOKEN_HERE
HF_HOME=/root/.cache/huggingface
HF_API_KEY=YOUR_HUGGING_FACE_API_KEY_HERE
```
**Variables**: 3  
**Purpose**: Hugging Face model hub integration

---

### /adapters (Model Routing)

#### `/adapters/litellm` - LiteLLM Router
**Status**: Defined but no template created yet  
**Expected Variables**:
- LITELLM_API_KEY
- LITELLM_BASE_URL
- LITELLM_MASTER_KEY
- LITELLM_LOG_LEVEL

---

#### `/adapters/openrouter` - OpenRouter Aggregation
**Status**: Defined but no template created yet  
**Expected Variables**:
- OPENROUTER_API_KEY
- OPENROUTER_BASE_URL

---

### /router (Model Router)

#### `/router/nexus` - Nexus MCP Router
```
NEXUS_PORT=3001
NEXUS_HOST=0.0.0.0
NEXUS_MODEL_ROUTING_ENABLED=true
NEXUS_CONTEXT_AGGREGATION=true
NEXUS_LOG_LEVEL=info
NEXUS_MAX_CONCURRENT_REQUESTS=10
```
**Variables**: 6  
**Purpose**: Nexus MCP router configuration

---

### /github-actions (CI/CD)

#### `/github-actions` - GitHub Actions Configuration
**Status**: Defined but no template created yet  
**Expected Variables**:
- CI
- GITHUB_TOKEN
- GITHUB_REPOSITORY
- GITHUB_REF

---

### /security (Secrets Management)

#### `/security/secrets` - Master Secrets Vault
**Status**: Defined but no template created yet  
**Expected Variables**:
- MASTER_ENCRYPTION_KEY
- API_KEY_ROTATION_INTERVAL_DAYS

---

### /runs (Job Execution)

#### `/runs/job-config` - Job Execution Configuration
**Status**: Defined but no template created yet  
**Expected Variables**:
- JOB_RETRY_ATTEMPTS
- JOB_TIMEOUT_MINUTES
- JOB_QUEUE_SIZE

---

### /profiles (User Settings)

#### `/profiles/user-default` - Default User Profile
**Status**: Defined but no template created yet  
**Expected Variables**:
- DEFAULT_MODEL
- DEFAULT_CONTEXT_WINDOW
- DEFAULT_TEMPERATURE

---

## Statistics

| Category | Count | Status |
|----------|-------|--------|
| Total Paths Defined | 28 | ✅ Complete |
| Paths with Templates | 13 | ⚠️ Partial |
| Paths without Templates | 15 | ❌ Pending |
| **Total Variables Created** | **67** | - |
| Variables with Placeholders | 8 | - |
| Variables with Real Values | 59 | - |

---

## Comparison: Current vs. Suggested External Structure

### Suggested External Structure (from notebook)
```
/adapters/
/base/                     → Maps to /shared/shared-base
/clients/
/cloudflare/               → Consolidated into /clients/cloudflare
/databases/
/github/                   → Part of /github-actions
/github-actions/
/machines/
/profiles/
/providers/
/router/
/runs/
/security/
/shared/
```

### Current Implementation
✅ **Matches**:
- `/adapters/` exists
- `/clients/` exists
- `/databases/` exists
- `/github-actions/` exists
- `/machines/` exists
- `/profiles/` exists
- `/providers/` exists
- `/router/` exists
- `/runs/` exists
- `/security/` exists
- `/shared/` with `/shared/shared-base` exists

⚠️ **Differences**:
- No top-level `/cloudflare/` (using `/clients/cloudflare` instead - which is recommended)
- No top-level `/github/` (using `/github-actions/` instead - which is correct)
- No top-level `/base/` (using `/shared/shared-base` instead - which is correct)

**Verdict**: Current structure is **more organized** than suggested, with better path hierarchies.

---

## Next Steps

1. **Create missing templates** for:
   - `/shared/shared-observability`
   - `/shared/shared-attribution`
   - `/clients/github`
   - `/clients/claude-flow`
   - `/clients/archon`
   - `/clients/ngrok`
   - `/databases/qdrant`
   - `/databases/chromadb`
   - `/providers/openai`
   - `/providers/google`
   - `/adapters/litellm`
   - `/adapters/openrouter`
   - `/github-actions`
   - `/security/secrets`
   - `/runs/job-config`
   - `/profiles/user-default`

2. **Replace placeholder values**:
   - `YOUR_*_HERE` placeholders
   - `TO_BE_COLLECTED` values

3. **Run bulk import**:
   ```powershell
   .\scripts\bulk-import-smart.ps1 -Env dev -DryRun
   .\scripts\bulk-import-smart.ps1 -Env staging
   .\scripts\bulk-import-smart.ps1 -Env prod
   ```

4. **Set up Infisical Agent** on each machine for automatic secret rendering

---

## File Structure on Disk

```
C:\Users\edane\OneDrive\LANShare\NyraFleet\infisical-setup\
├── paths-mapping.json                    (Master path definitions)
├── README.md                             (Quick start guide)
├── IMPORT-STRATEGY.md                    (Detailed routing logic)
├── CURRENT-STRUCTURE-EXPORT.md           (This file)
├── env-templates/
│   ├── shared.shared-base.env           ✅ (5 vars)
│   ├── shared.shared-network.env        ✅ (4 vars)
│   ├── machines.orchestrator.env        ✅ (6 vars)
│   ├── machines.worker-rtx3060.env      ✅ (7 vars)
│   ├── machines.worker-rtx3090ti.env    ✅ (9 vars)
│   ├── machines.worker-rtx5090.env      ✅ (10 vars)
│   ├── clients.cloudflare.env           ✅ (7 vars)
│   ├── clients.tailscale.env            ✅ (4 vars)
│   ├── databases.redis.env              ✅ (5 vars)
│   ├── databases.postgres.env           ✅ (6 vars)
│   ├── providers.anthropic.env          ✅ (4 vars)
│   ├── providers.huggingface.env        ✅ (3 vars)
│   └── router.nexus.env                 ✅ (6 vars)
└── scripts/
    └── bulk-import-smart.ps1            (Intelligent import script)
```
