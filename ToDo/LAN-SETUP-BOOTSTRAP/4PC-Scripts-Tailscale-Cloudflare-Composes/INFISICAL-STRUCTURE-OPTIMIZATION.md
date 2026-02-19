# Infisical Structure Optimization & Environment Variables Consolidation

**Generated**: 2026-02-10  
**Status**: Comprehensive Analysis + Proposed Restructuring  
**Scope**: All environment variables across Project Nyra infrastructure

---

## Executive Summary

Your current Infisical structure requires significant optimization:

### Current Issues
1. **Mixing concerns**: `/shared` contains both static config and secrets
2. **Port/Host segregation**: Scattered across multiple paths
3. **CICD separation**: `/apps/claude-flow-ci` and `/CI-CD` both exist (duplication)
4. **Missing paths**: No `/base/network`, `/base/ports`, or `/services`
5. **Environment parity**: Staging may not have all prod/dev variables

### Proposed Solution
Restructure into 7 core path groups:
- `/base/` - Fundamental config (non-secret, static)
- `/shared/` - Shared secrets and auth keys only
- `/machines/` - Per-machine hardware + network overrides
- `/services/` - Service-specific configuration
- `/clients/` - External integrations (keep existing)
- `/databases/` - Database credentials (keep existing)
- `/providers/` - AI provider keys (keep existing)

---

## Part 1: Variable Classification

### 1.1 Environment Variables (Non-Secret, Keep Local or in `/base`)

These are frequently changed, non-sensitive, and should be easy to modify:

```
# Logging & Debugging
LOG_LEVEL=info|debug|warn|error
DEBUG=true|false
VERBOSE_LOGGING=true|false

# Ports (NEW: Move to /base/ports)
DEFAULT_PORT=3000
ORCHESTRATOR_PORT=6100
VLLM_PORT=8000
OLLAMA_PORT=11434
NEXUS_ROUTER_PORT=4000
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
N8N_PORT=5678
DIFY_PORT=5001
POSTGRES_PORT=5432
REDIS_PORT=6379
QDRANT_PORT=6333

# Hosts (NEW: Move to /base/network)
ORCHESTRATOR_HOST=localhost|0.0.0.0|100.115.69.115
ORCHESTRATOR_HOSTNAME=MINISAPOTHEOSIS
TAILSCALE_HOSTNAME=orchestrator-mini
POSTGRES_HOST=localhost
REDIS_HOST=localhost
QDRANT_HOST=localhost

# MCP Configuration (NEW: Move to /base/mcp)
MCP_STDIO_ENABLED=true|false
MCP_HTTPS_ENABLED=true|false
MCP_PORT=6000
MCP_HOST=0.0.0.0
MCP_TYPE=stdio|https|websocket
NEXUS_MCP_PORT=4001

# Feature Flags (Move to /shared/features)
FEATURE_VLLM=true|false
FEATURE_OLLAMA=true|false
FEATURE_LMCACHE=true|false
FEATURE_LETTA=true|false
FEATURE_GRAPHITI=true|false
FEATURE_QDRANT=true|false
FEATURE_DEEPSEEK_R1=true|false
FEATURE_CLAUDE_FLOW_CI=true|false

# Performance Tuning (Move to /shared/performance)
MAX_CONCURRENT_REQUESTS=10|25|100
WORKER_TIMEOUT_SECONDS=30|60|300
BATCH_SIZE=10|50|256
GPU_MEMORY_UTILIZATION=0.80|0.90|0.95
VLLM_ATTENTION_BACKEND=flashinfer|xformers

# Environment Context (Keep in /shared/base)
NODE_ENV=development|staging|production
ENVIRONMENT=dev|staging|prod
NAMESPACE_ENVIRONMENT=development|staging|production
NYRA_STACK_NAME=nyra-orchestrator
NAMESPACE_PREFIX=nyra
```

### 1.2 Secrets (Must be in Infisical)

These should NEVER be in `.env.example` or version control:

```
# Database Passwords
POSTGRES_PASSWORD=<generated_secret>
REDIS_PASSWORD=<generated_secret>
FALKORDB_PASSWORD=<generated_secret>
NEO4J_PASSWORD=<generated_secret>

# API Keys (Secrets YOU Set)
JWT_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_secret>
ENCRYPTION_KEY=<generated_secret>
ENCRYPTION_IV=<generated_secret>

# Service Authentication
ORCHESTRATOR_API_KEY=<generated_secret>
LETTA_API_KEY=<generated_secret>
QDRANT_API_KEY=<generated_secret>
NEXUS_ADMIN_TOKEN=<generated_secret>

# Cloud Provider Keys (You set these from provider)
ANTHROPIC_API_KEY=<from_anthropic>
OPENAI_API_KEY=<from_openai>
GOOGLE_API_KEY=<from_google>
HUGGINGFACE_TOKEN=<from_huggingface>
GITHUB_TOKEN=<from_github>

# VPN & Tunneling
TAILSCALE_API_KEY=<from_tailscale>
TAILSCALE_AUTH_KEY=<from_tailscale>
CLOUDFLARE_API_TOKEN=<from_cloudflare>
CLOUDFLARE_TUNNEL_TOKEN=<from_cloudflare>

# Webhook Secrets
GITHUB_WEBHOOK_SECRET=<generated_secret>
N8N_WEBHOOK_SECRET=<generated_secret>
```

---

## Part 2: Proposed Infisical Path Restructuring

### ✅ KEEP (No Changes)
```
/clients/
  cloudflare/
  tailscale/
  github/
  claude-flow/          ← Keep, add claude-flow-ci env vars here
  archon/
  epic-llm/
  letta/
  
/databases/
  postgres/
  redis/
  qdrant/
  falkordb/
  
/providers/
  anthropic/
  openai/
  google/
  huggingface/
```

### 🔄 RESTRUCTURE (Consolidate & Clarify)

#### **DELETE: `/security` → MERGE INTO `/shared/security`**
```
# Current (DELETE):
/security/
  secrets/
  master-encryption-key/

# New (MERGE):
/shared/security/
  MASTER_ENCRYPTION_KEY=<secret>
  API_KEY_ROTATION_INTERVAL_DAYS=90
  SECURITY_AUDIT_ENABLED=true
```

#### **DELETE: `/CI-CD` & `/apps/claude-flow-ci` → MERGE INTO `/services/cicd`**
```
# Current (DELETE both):
/CI-CD/
/apps/claude-flow-ci/

# New (CONSOLIDATE):
/services/cicd/
  # GitHub Actions
  CI=true
  GITHUB_TOKEN=<secret>
  GITHUB_REPOSITORY=your-org/project-nyra
  SEMANTIC_RELEASE_ENABLED=true
  CREATE_GH_RELEASE=true
  
  # Claude-Flow CI
  CLAUDE_FLOW_CICD_ENABLED=true
  CLAUDE_FLOW_MODEL=claude-opus-4-20250514
  CLAUDE_FLOW_TIMEOUT_MINUTES=60
  CLAUDE_FLOW_AUTO_COMMIT=true
  CLAUDE_FLOW_AUTO_PUSH=false
  
  # Docker Build
  DOCKER_BUILDKIT=1
  DOCKER_BUILD_TIMEOUT=1800
```

#### **CREATE NEW: `/base/` → Static, Non-Secret Config**
```
/base/
  /network/              ← Network topology (non-secret)
    INTERNAL_NETWORK=192.168.1.0/24
    INTERNAL_NETWORK_GATEWAY=192.168.1.254
    INTERNAL_NETWORK_DNS_PRIMARY=192.168.1.254
    INTERNAL_NETWORK_DNS_SECONDARY=2600:1700:65f0:8960::1
    TAILSCALE_SUBNET=100.0.0.0/8
  
  /ports/                ← All port configurations
    ORCHESTRATOR_PORT=6100
    ORCHESTRATOR_HEALTH_PORT=6101
    ORCHESTRATOR_METRICS_PORT=9999
    VLLM_PORT=8000
    OLLAMA_PORT=11434
    NEXUS_ROUTER_PORT=4000
    NEXUS_MCP_PORT=4001
    PROMETHEUS_PORT=9090
    GRAFANA_PORT=3000
    N8N_PORT=5678
    DIFY_PORT=5001
    POSTGRES_PORT=5432
    REDIS_PORT=6379
    QDRANT_PORT=6333
    VECTORDB_PORT=6380
    CHROMADB_PORT=8000
  
  /hosts/                ← All host configurations
    ORCHESTRATOR_HOST=0.0.0.0
    POSTGRES_HOST=localhost|orchestrator-mini
    REDIS_HOST=localhost|orchestrator-mini
    QDRANT_HOST=localhost|orchestrator-mini
    N8N_HOST=0.0.0.0
    DIFY_HOST=0.0.0.0
    GRAFANA_HOST=0.0.0.0
    PROMETHEUS_HOST=0.0.0.0
  
  /mcp/                  ← MCP Server Configuration
    MCP_STDIO_ENABLED=true
    MCP_HTTPS_ENABLED=false
    MCP_PORT=6000
    MCP_HOST=0.0.0.0
    MCP_ROUTER_TYPE=nexus|metamcp
    NEXUS_MCP_PORT=4001
    NEXUS_ROUTER_BIND=0.0.0.0:4000
  
  /performance/          ← Tuning parameters
    MAX_CONCURRENT_REQUESTS=100
    WORKER_TIMEOUT_SECONDS=300
    BATCH_SIZE=256
    GPU_MEMORY_UTILIZATION=0.90
    VLLM_ATTENTION_BACKEND=flashinfer
    OLLAMA_NUM_PARALLEL=4
    OLLAMA_NUM_THREADS=16
  
  /features/             ← Feature flags
    FEATURE_VLLM=true
    FEATURE_OLLAMA=true
    FEATURE_LMCACHE=true
    FEATURE_LETTA=true
    FEATURE_GRAPHITI=true
    FEATURE_QDRANT=true
    FEATURE_DEEPSEEK_R1=true
    FEATURE_CLAUDE_FLOW_CI=true
    FEATURE_STREAMING=true
    FEATURE_VOICE_AUTOMATION=true
  
  /runtime/              ← Runtime configuration
    NODE_ENV=development|staging|production
    LOG_LEVEL=info|debug|warn|error
    DEBUG=false
    VERBOSE_LOGGING=false
    CACHE_TTL=300
    REQUEST_TIMEOUT=30000
```

#### **RENAME: `/shared/` → `/shared/secrets/` (Contains ONLY Secrets)**

Move non-secret items OUT of `/shared`:
```
# DELETE from /shared:
- DEFAULT_TIMEOUT_S          → Move to /base/runtime
- LOG_LEVEL                  → Move to /base/runtime
- NYRA_STACK_NAME            → Keep in /base/runtime (rename to PROJECT_NAME)
- NAMESPACE_PREFIX           → Move to /base/runtime
- NAMESPACE_ENVIRONMENT      → Move to /base/runtime
- Network IPs                → Move to /base/network

# KEEP in /shared/secrets (secret-only path):
- JWT_SECRET
- JWT_REFRESH_SECRET
- ENCRYPTION_KEY
- ENCRYPTION_IV
- All passwords
- All API keys you generate yourself
```

#### **CREATE NEW: `/services/` → Service-Specific Config**
```
/services/
  /claude-flow/
    CLAUDE_FLOW_ENABLED=true
    CLAUDE_FLOW_MODE=orchestrator|agent|batch
    CLAUDE_FLOW_AUTO_COMMIT=true|false
    CLAUDE_FLOW_AUTO_PUSH=true|false
    CLAUDE_FLOW_HOOKS_ENABLED=true
    CLAUDE_FLOW_TELEMETRY_ENABLED=true
    CLAUDE_FLOW_REMOTE_EXECUTION=true
    CLAUDE_FLOW_CHECKPOINT_ENABLED=true
    CLAUDE_FLOW_MEMORY_PERSISTENCE=true
    CLAUDE_FLOW_CACHE_ENABLED=true
    CLAUDE_FLOW_PARALLEL_PROCESSING=true
    CLAUDE_FLOW_MAX_AGENTS=20
  
  /letta/
    LETTA_ENABLED=true
    LETTA_SERVER_URL=http://orchestrator-mini:8283
    LETTA_AGENT_POOLING=true
    LETTA_MAX_AGENTS=20
    LETTA_CONTEXT_WINDOW=32000
    LETTA_ARCHIVAL_MEMORY=true
    LETTA_CORE_MEMORY_LIMIT=8192
  
  /ruvector/
    RUVECTOR_ENABLED=true
    RUVECTOR_MODE=distributed
    RUVECTOR_HOST=localhost
    RUVECTOR_PORT=7000
    RUVECTOR_GRPC_PORT=7001
    RUVECTOR_CONSENSUS_ENABLED=true
    RUVECTOR_PERSISTENCE_DIR=./memory/ruvector
    RUVECTOR_WAL_ENABLED=true
    RUVECTOR_SNAPSHOT_ENABLED=true
  
  /graphiti/
    GRAPHITI_ENABLED=true
    GRAPHITI_BACKEND=falkordb
    GRAPHITI_GRAPH_NAME=nyra_knowledge
    GRAPHITI_TEMPORAL_TRACKING=true
    GRAPHITI_RELATIONSHIP_INFERENCE=true
    GRAPHITI_AUTO_INDEX=true
  
  /n8n/
    N8N_ENABLED=true
    N8N_PORT=5678
    N8N_HOST=0.0.0.0
    N8N_WEBHOOK_URL=https://n8n.ratehunter.net
    N8N_BASIC_AUTH_ACTIVE=true
    N8N_BASIC_AUTH_USER=admin
    N8N_EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
    N8N_EXECUTIONS_DATA_SAVE_ON_ERROR=all
  
  /dify/
    DIFY_ENABLED=true
    DIFY_API_URL=http://localhost:5001
    DIFY_CONSOLE_URL=http://localhost:3000
  
  /nexus-router/
    NEXUS_ROUTER_ENABLED=true
    NEXUS_ROUTER_PORT=4000
    NEXUS_MCP_PORT=4001
    NEXUS_LOAD_BALANCING=least-loaded
    NEXUS_HEALTH_CHECK_ENABLED=true
    NEXUS_HEALTH_CHECK_INTERVAL=30000
    NEXUS_CIRCUIT_BREAKER_ENABLED=true
  
  /archon/
    ARCHON_ENABLED=true
    ARCHON_API_URL=http://localhost:7070
    ARCHON_AUTH_ENABLED=true
    ARCHON_MAX_AGENTS=50
  
  /gitea/
    GITEA_ENABLED=true
    GITEA_HOST=localhost
    GITEA_PORT=3000
    GITEA_PROTOCOL=http|https
```

#### **ENHANCE: `/machines/` → Add Missing Machine-Level Envs**

```
/machines/orchestrator/
  # Network & Hardware (existing)
  ORCHESTRATOR_IP=192.168.1.232
  ORCHESTRATOR_TAILSCALE_IP=100.115.69.115
  ORCHESTRATOR_HOSTNAME=MINISAPOTHEOSIS
  
  # NEW: Hardware Specs
  MACHINE_CPU_NAME=<from_PC_INFO_COLLECTOR>
  MACHINE_CPU_CORES=4
  MACHINE_CPU_THREADS=8
  MACHINE_RAM_GB=16
  MACHINE_RAM_SPEED=6400
  MACHINE_OS=Windows 11 Home
  MACHINE_OS_BUILD=26200
  
  # NEW: Network - MAC Addresses (WAN + Ethernet)
  MACHINE_LAN_MAC_ADDRESS=<collected>
  MACHINE_WIFI_MAC_ADDRESS=<collected>
  MACHINE_LAN_IPV4=192.168.1.232
  MACHINE_LAN_IPV6=2600:1700:65f0:8960::1
  MACHINE_WIFI_IPV4=192.168.1.232
  MACHINE_WIFI_IPV6=2600:1700:65f0:8960::2
  MACHINE_WAN_PUBLIC_IP=<external_ip>
  
  # NEW: Tailscale
  MACHINE_TAILSCALE_IP=100.115.69.115
  MACHINE_TAILSCALE_IPV6=fd7a:115c:a1e0::1:4d73
  TAILSCALE_FQDN=orchestrator.tail558973.ts.net

/machines/worker-rtx3060/
  WORKER_HOSTNAME=ALIENAPOTHEOSIS
  WORKER_IP=192.168.1.233
  WORKER_LAN_MAC=<collected>
  WORKER_WIFI_MAC=<collected>
  WORKER_TAILSCALE_IP=100.126.61.37
  MACHINE_GPU_TYPE=rtx_3060
  MACHINE_GPU_VRAM_GB=12
  WORKER_SPECIALIZATION=code

/machines/worker-rtx5090/
  WORKER_HOSTNAME=AREA51
  WORKER_IP=192.168.1.234
  WORKER_LAN_MAC=e8-cf-83-ed-e4-95
  WORKER_WIFI_MAC=8e-4c-d1-e6-0b-42
  WORKER_TAILSCALE_IP=TO_BE_COLLECTED
  MACHINE_GPU_TYPE=rtx_5090
  MACHINE_GPU_VRAM_GB=48
  WORKER_SPECIALIZATION=reasoning

/machines/worker-rtx3090ti/
  WORKER_HOSTNAME=RTX3090TI-WORKER
  WORKER_IP=192.168.1.236
  WORKER_LAN_MAC=<collected>
  WORKER_WIFI_MAC=<collected>
  WORKER_TAILSCALE_IP=TO_BE_COLLECTED
  MACHINE_GPU_TYPE=rtx_3090ti
  MACHINE_GPU_VRAM_GB=24
  WORKER_SPECIALIZATION=analysis
```

---

## Part 3: Environment-Specific Variables (dev/staging/prod)

### Variables That Should Differ Across Environments

```
# Should be DIFFERENT per environment:
ANTHROPIC_MODEL=claude-sonnet-4-20250514 (dev) vs claude-opus-4-20250514 (prod)
LOG_LEVEL=debug (dev) vs info (prod)
DEBUG=true (dev) vs false (prod)
VERBOSE_LOGGING=true (dev) vs false (prod)
GPU_MEMORY_UTILIZATION=0.85 (dev) vs 0.95 (prod)
MAX_CONCURRENT_REQUESTS=5 (dev) vs 25 (prod)
CACHE_TTL=60 (dev) vs 300 (prod)
WORKER_TIMEOUT_SECONDS=30 (dev) vs 300 (prod)
FEATURE_*=true (dev) vs mixed (prod)
NODE_ENV=development vs production

# Database Hosts:
POSTGRES_HOST=localhost (dev) vs orchestrator-mini (prod)
REDIS_HOST=localhost (dev) vs orchestrator-mini (prod)

# URLs & Endpoints:
ORCHESTRATOR_URL=http://localhost:6100 (dev) vs http://orchestrator-mini:6100 (prod)
LETTA_URL=http://localhost:8283 (dev) vs http://orchestrator-mini:8283 (prod)
```

### Strategy for Infisical Environments

✅ **Recommended**: Create ALL three environments (dev, staging, prod) with:
- **dev**: High concurrency, debug logging, loose timeouts
- **staging**: Prod-like config, but with staging API keys
- **prod**: Conservative concurrency, minimal logging, tight security

---

## Part 4: Variables Still Needing Configuration

### 🔴 CRITICAL - You Must Provide These Values

These cannot be auto-generated and require manual configuration:

```
# From Anthropic
ANTHROPIC_API_KEY=<YOUR_ANTHROPIC_KEY>
ANTHROPIC_ORG_ID=<YOUR_ORG_ID>

# From OpenAI
OPENAI_API_KEY=<YOUR_OPENAI_KEY>
OPENAI_ORG_ID=<YOUR_ORG_ID>

# From Google
GOOGLE_API_KEY=<YOUR_GOOGLE_KEY>
GOOGLE_PROJECT_ID=<YOUR_PROJECT_ID>

# From Hugging Face
HUGGINGFACE_TOKEN=<YOUR_HF_TOKEN>

# From GitHub
GITHUB_TOKEN=<YOUR_GH_TOKEN>
GITHUB_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>

# From Tailscale (generated via CLI once on each PC)
TAILSCALE_API_KEY=<Generate from Tailscale dashboard>
TAILSCALE_AUTH_KEY=<Generate from Tailscale dashboard>

# From Cloudflare
CLOUDFLARE_API_TOKEN=<YOUR_CF_TOKEN>
CLOUDFLARE_ZONE_ID=<YOUR_ZONE_ID>
CLOUDFLARE_TUNNEL_TOKEN=<Generated during tunnel creation>

# From Other Services
STRIPE_SECRET_KEY=<YOUR_STRIPE_KEY>
N8N_WEBHOOK_SECRET=<YOU_GENERATE>
GITHUB_WEBHOOK_SECRET=<YOU_GENERATE>
SUPABASE_SERVICE_KEY=<YOUR_SUPABASE_KEY>
```

### 🟡 SEMI-CRITICAL - Collect from Each PC

Run `PC-INFO-COLLECTOR.ps1` on each machine to populate:

```
# Hardware Specs
MACHINE_CPU_NAME
MACHINE_CPU_CORES
MACHINE_RAM_GB
MACHINE_GPU_TYPE
MACHINE_GPU_VRAM_GB

# Network Addresses
MACHINE_LAN_MAC_ADDRESS
MACHINE_WIFI_MAC_ADDRESS
MACHINE_TAILSCALE_IP (after Tailscale install)
MACHINE_WAN_PUBLIC_IP
```

---

## Part 5: Recommended Infisical Structure (Complete)

```
/base/                                    ← Non-secret, static config
  /network/                               INTERNAL_NETWORK, DNS, etc.
  /ports/                                 All port mappings
  /hosts/                                 All host mappings
  /mcp/                                   MCP routing & config
  /performance/                           Tuning parameters
  /features/                              Feature flags
  /runtime/                               Log levels, timeouts, etc.

/shared/
  /secrets/                               ← ONLY secrets go here
    JWT_SECRET
    ENCRYPTION_KEY
    POSTGRES_PASSWORD
    REDIS_PASSWORD
    etc.
  /security/                              ← Security config
    API_KEY_ROTATION_INTERVAL_DAYS
    etc.

/machines/
  /orchestrator/                          ORCHESTRATOR_IP, MAC, CPU, RAM, etc.
  /worker-rtx3060/                        Worker-specific overrides
  /worker-rtx3090ti/                      Worker-specific overrides
  /worker-rtx5090/                        Worker-specific overrides

/services/                                ← Service-specific config
  /claude-flow/                           Claude-Flow settings
  /letta/                                 Letta AI settings
  /ruvector/                              RuVector settings
  /graphiti/                              Graphiti settings
  /n8n/                                   N8N settings
  /dify/                                  Dify settings
  /nexus-router/                          Nexus Router settings
  /archon/                                Archon settings
  /gitea/                                 Gitea settings
  /cicd/                                  CI/CD (GitHub Actions + Claude-Flow CI)

/clients/                                 ← KEEP EXISTING
  /cloudflare/
  /tailscale/
  /github/
  /claude-flow/
  /archon/
  /epic-llm/
  /letta/
  /litellm/
  /openrouter/

/databases/                               ← KEEP EXISTING
  /postgres/
  /redis/
  /qdrant/
  /falkordb/
  /neo4j/

/providers/                               ← KEEP EXISTING
  /anthropic/
  /openai/
  /google/
  /huggingface/
```

---

## Part 6: Implementation Checklist

### Phase 1: Infisical Restructuring
- [ ] Create `/base/` paths (network, ports, hosts, mcp, performance, features, runtime)
- [ ] Rename `/shared/` structure → Move to `/shared/secrets/` (secrets-only)
- [ ] Move non-secrets from `/security/` → `/shared/security/`
- [ ] Delete `/CI-CD/` and `/apps/claude-flow-ci/` 
- [ ] Create `/services/cicd/` with consolidated CI variables
- [ ] Create `/services/<service>/` for each major service
- [ ] Enhance `/machines/` with hardware + network MAC addresses
- [ ] Verify all dev/staging/prod environments have necessary variables

### Phase 2: Environment Variables Collection
- [ ] Run `PC-INFO-COLLECTOR.ps1` on all 4 machines → Collect hardware specs + MACs
- [ ] Gather all missing API keys from providers (Anthropic, OpenAI, etc.)
- [ ] Generate Tailscale auth keys on each PC (after install)
- [ ] Collect public WAN IP for each machine
- [ ] Create summary document of all needed secrets

### Phase 3: Migration
- [ ] Export current Infisical config (backup)
- [ ] Create new folder structure in Infisical
- [ ] Migrate variables to new paths
- [ ] Update all `.env` templates to reference new paths
- [ ] Test with bulk-import script
- [ ] Deploy to all machines

### Phase 4: Verification
- [ ] All services start correctly with new env structure
- [ ] All 3 environments (dev/staging/prod) have required variables
- [ ] Machine-specific overrides work correctly
- [ ] CICD pipeline picks up correct variables
- [ ] No "undefined variable" errors in logs

---

## Part 7: Files to Update/Create

### Create These New `.env` Template Files

```
# New paths needing templates:
/base/network.env
/base/ports.env
/base/hosts.env
/base/mcp.env
/base/performance.env
/base/features.env
/base/runtime.env

/services/claude-flow.env
/services/letta.env
/services/ruvector.env
/services/graphiti.env
/services/n8n.env
/services/dify.env
/services/nexus-router.env
/services/archon.env
/services/gitea.env
/services/cicd.env

/shared/security.env (consolidate from /security)
```

### Update These Existing Templates

```
/machines/orchestrator.env        ← Add hardware + MAC addresses
/machines/worker-rtx3060.env      ← Add hardware + MAC addresses
/machines/worker-rtx3090ti-complete.env  ← Add hardware + MAC addresses
/machines/worker-rtx5090-complete.env    ← Add hardware + MAC addresses
```

---

## Summary Table: Variable Ownership

| Category | Current Location | Should Move To | Keep Secret? |
|----------|------------------|----------------|-------------|
| Ports | scattered | `/base/ports/` | No |
| Hosts | scattered | `/base/hosts/` | No |
| Network IPs | `/shared/` | `/base/network/` | No |
| Feature Flags | missing | `/base/features/` | No |
| Log Level | `/shared/` | `/base/runtime/` | No |
| Timeout/Perf | missing | `/base/performance/` | No |
| API Keys (yours) | `/shared/` → `/shared/secrets/` | `/shared/secrets/` | **Yes** |
| Passwords | `/databases/` | Keep | **Yes** |
| GPU Config | `/machines/` | Keep | No |
| Service Config | scattered | `/services/<service>/` | No |
| CICD Config | `/CI-CD` + `/apps/claude-flow-ci/` | `/services/cicd/` | Partially |
| Machine Hardware | missing | `/machines/<machine>/` | No |
| Machine MACs | missing | `/machines/<machine>/` | No |

---

## Next Steps

1. **Provide Missing Secrets** (see Part 4) - Create file listing what you need
2. **Run PC-Info Collector** on all 4 machines
3. **Approve Restructuring** - Review this proposal before implementing
4. **I'll create consolidated env files** ready for Infisical import
5. **Bulk import to new structure** via updated script

---

**Status**: Awaiting your feedback on:
- [ ] Approve proposed path structure?
- [ ] Provide API keys and critical secrets?
- [ ] Run PC-INFO-COLLECTOR on all machines?
- [ ] Any adjustments to the classification?
