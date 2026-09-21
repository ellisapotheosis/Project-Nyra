# Master .env Compilation Guide

**Generated**: 2026-09-11  
**Total Variables**: 729 across 5 hosts  
**Secrets**: 73 (protected values)  
**Config**: ~200 standard configuration variables

## What Was Generated

Comprehensive master .env files for each Project Nyra host, combining:

- Current .env.example files (existing configuration baseline)
- Environment variable inventory (1,040 discovered variables)
- Host-specific service requirements (docker-compose stacks)
- Infisical integration structure (Cloud secrets management)

### Files Created

| Host                 | File                           | Variables | Secrets |
| -------------------- | ------------------------------ | --------- | ------- |
| **oracle-vps**       | `.env.master.oracle-vps`       | 112       | 42      |
| **orchestrator**     | `.env.master.orchestrator`     | 46        | 18      |
| **worker-rtx3060**   | `.env.master.worker-rtx3060`   | 24        | 4       |
| **worker-rtx3090ti** | `.env.master.worker-rtx3090ti` | 21        | 4       |
| **worker-rtx5090**   | `.env.master.worker-rtx5090`   | 25        | 5       |

## Organization by Host

### Oracle-VPS (112 variables)

**Primary services**: Twenty CRM, Activepieces, Gitea, n8n, LiteLLM, Letta, mem0, FalkorDB, Home Assistant

**Secrets** (42):

- Database: `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `AP_POSTGRES_PASSWORD`, `LETTA_DB_PASSWORD`, `FALKORDB_PASSWORD`
- API Keys: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`
- Service auth: `GITEA_DB_PASSWORD`, `GITEA_SECRET_KEY`, `N8N_ENCRYPTION_KEY`, `TWENTY_APP_SECRET`
- Infrastructure: `ORACLE_TUNNEL_TOKEN`, `INFISICAL_TOKEN`, `HOMEASSISTANT_TOKEN`
- Encryption: `AP_ENCRYPTION_KEY`, `AP_JWT_SECRET`, `AGENT_VAULT_MASTER_PASSWORD`

**Config** (70):

- Container naming: `COMPOSE_PROJECT_NAME=oracle-vps`, `ORACLE_MAIN_NETWORK`
- Service URLs: Twenty, Activepieces, n8n, Gitea, LiteLLM endpoints
- Database: Host, port, user config for PostgreSQL, Redis, FalkorDB
- Infisical: `INFISICAL_PATH=/hosts/oracle-vps`, `INFISICAL_ENV=prod`

### Orchestrator (46 variables)

**Primary services**: LiteLLM control plane, Prometheus+Grafana, Redis cache, OpenLIT telemetry

**Secrets** (18):

- API: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`
- Auth: `N8N_BASIC_AUTH_PASSWORD`, `N8N_ENCRYPTION_KEY`, `GRAFANA_ADMIN_PASSWORD`
- Infisical: `INFISICAL_TOKEN`
- Memory: `MEM0_API_KEY`
- Tunneling: `ORCHESTRATOR_TUNNEL_TOKEN`, `CLOUDFLARED_TUNNEL_TOKEN`

**Config** (28):

- Container naming: `COMPOSE_PROJECT_NAME=orchestrator`
- LiteLLM: `LITELLM_MASTER_KEY`, port, base URL
- Monitoring: Prometheus, Grafana, AlertManager ports + URLs
- Memory: mem0 integration, Mempalace, MEM0_HOST_PORT
- Tailscale: `TAILSCALE_AUTHKEY`, `TAILSCALE_HOSTNAME`

### Worker-RTX3060 (24 variables)

**Primary services**: Ollama (inference 12GB), distributed voice STT

**Secrets** (4):

- `INFISICAL_TOKEN`
- `TAILSCALE_AUTHKEY`
- Two others (minimal — workers don't store secrets)

**Config** (20):

- Container naming: `COMPOSE_PROJECT_NAME=worker-rtx3060`
- Inference: `OLLAMA_BASE_URL`, `OLLAMA_PORT`, `OLLAMA_NUM_GPU`
- Orchestrator coordination: `ORCHESTRATOR_URL`, `ORCHESTRATOR_LITELLM_URL`
- Logging: `LOG_LEVEL`

### Worker-RTX3090ti (21 variables)

**Primary services**: vLLM inference (24GB), distributed voice TTS

**Secrets** (4):

- `INFISICAL_TOKEN`, `TAILSCALE_AUTHKEY`

**Config** (17):

- Container naming: `COMPOSE_PROJECT_NAME=worker-rtx3090ti`
- Inference: `VLLM_MODEL`, `VLLM_GPU_MEMORY_UTILIZATION`, `VLLM_PORT`
- Caching: `LMCACHE_ENABLED`, `LMCACHE_PORT`
- Orchestrator: `ORCHESTRATOR_URL`, `ORCHESTRATOR_LITELLM_URL`

### Worker-RTX5090 (25 variables)

**Primary services**: vLLM primary inference (32GB), distributed voice LLM

**Secrets** (5):

- `INFISICAL_TOKEN`, `TAILSCALE_AUTHKEY`

**Config** (20):

- Inference: `VLLM_MODEL`, `VLLM_GPU_MEMORY_UTILIZATION`, `VLLM_PORT`
- Caching: `LMCACHE_ENABLED`, `LMCACHE_PORT`, `LMCACHE_DEVICE`
- NerveUI: `NERVE_ENABLED`, `NERVE_PORT`, `NERVE_AUTH_TOKEN`
- Orchestrator: `ORCHESTRATOR_URL`, `ORCHESTRATOR_LITELLM_URL`

## How to Use

### Local Development Setup

```bash
# 1. Copy master file to active .env
cp infra/hosts/oracle-vps/.env.master.oracle-vps infra/hosts/oracle-vps/.env

# 2. Open in editor and fill CHANGE_ME values
# Secrets: use `openssl rand -hex 32 | sed 's/^/sk-/'` for API keys
#          use `pwgen -s 32 1` for passwords
vim infra/hosts/oracle-vps/.env

# 3. Start services
make up
# or specific host:
docker compose -f infra/hosts/oracle-vps/docker-compose.yml up -d
```

### Production Setup (Infisical)

```bash
# 1. Upload all secrets to Infisical Cloud
cd scripts/infisical
./upload-all-secrets.ps1 -Environment production

# 2. Verify secrets in Infisical dashboard
infisical secrets --path /hosts/oracle-vps --env production

# 3. Run docker compose with Infisical injection
infisical run \
  --token=$INFISICAL_TOKEN \
  --projectId=$INFISICAL_PROJECT_ID \
  --path=/shared \
  --path=/hosts/oracle-vps \
  -- docker compose -f docker-compose.yml up -d
```

### Makefile Integration

Current Makefile targets already reference these paths:

```bash
# Uses INFISICAL_ENV (prod/staging/dev) to select which .env to load
make up-oracle              # Oracle VPS stack
make up-orchestrator        # Orchestrator stack
make up-workers             # All workers

# Host-specific
docker --context oracle-vps compose -f infra/hosts/oracle-vps/docker-compose.yml config
```

## Secret Generation Examples

### API Keys (48+ chars with sk- prefix)

```bash
# Anthropic / OpenAI style
echo "sk-$(openssl rand -hex 32)"

# GitHub / Generic token
openssl rand -hex 24 | tr '[:lower:]' '[:upper:]'
```

### Passwords (32 chars, mixed)

```bash
# Strong password
openssl rand -base64 24 | sed 's/[=/+]//g'

# Or using pwgen
pwgen -s 32 1
```

### JWT/Encryption Secrets

```bash
# Node.js style
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or openssl
openssl rand -hex 32
```

### Database Passwords

```bash
# PostgreSQL/MySQL safe (no special chars)
openssl rand -hex 16 | tr '[:upper:]' '[:lower:]'
```

## Security Checklist

Before deploying:

- [ ] All `CHANGE_ME` values replaced with real secrets
- [ ] Secrets generated using secure randomization (not simple sequences)
- [ ] `.env` files NOT committed to git (should be .gitignored)
- [ ] `.env` files encrypted or stored only in Infisical
- [ ] Secrets rotated at least quarterly
- [ ] Infisical access control configured per environment
- [ ] Audit logging enabled in Infisical
- [ ] No secrets logged in compose output (`docker compose config` should not leak secrets)

## Variable Reference

### By Category

**Database Connection**

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `FALKORDB_PASSWORD`

**LLM Routing & Observability**

- `LITELLM_MASTER_KEY` — authentication for all LiteLLM clients
- `LITELLM_BASE_URL` — internal service URL
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`

**AI Inference (Workers)**

- `VLLM_MODEL` — HuggingFace model identifier
- `VLLM_GPU_MEMORY_UTILIZATION` — 0.0–1.0 (default 0.9)
- `OLLAMA_NUM_GPU` — number of GPU layers to offload

**Memory Plane (Letta + mem0 + FalkorDB)**

- `LETTA_DB_PASSWORD` — Letta PostgreSQL auth
- `FALKORDB_PASSWORD` — Graph DB auth
- `MEM0_API_KEY` — mem0 cloud sync key
- `MEM0_BASE_URL` — self-hosted mem0 endpoint

**Infrastructure**

- `ORACLE_TUNNEL_TOKEN` — Cloudflare tunnel authentication
- `INFISICAL_TOKEN` — Service token for secret injection
- `INFISICAL_PATH` — Secrets path (e.g., `/hosts/oracle-vps`)
- `TAILSCALE_AUTHKEY` — VPN authentication

**Telemetry & Monitoring**

- `GRAFANA_ADMIN_PASSWORD` — Dashboard access
- `OPENLIT_NEXTAUTH_SECRET` — OpenLIT session auth
- `PROMETHEUS_RETENTION` — metrics retention window

## Troubleshooting

### Compose fails with "missing environment variable"

```bash
# Check what docker-compose expects
docker compose -f infra/hosts/oracle-vps/docker-compose.yml config | grep -i "change"

# Load .env into current shell and retry
export $(cat infra/hosts/oracle-vps/.env | xargs)
docker compose ... up -d
```

### Infisical injection not working

```bash
# Verify credentials
infisical token validate --token=$INFISICAL_TOKEN

# Test path access
infisical secrets --path /hosts/oracle-vps --env production

# Check Infisical CLI version compatibility
infisical --version
```

### Secrets rotated but containers didn't update

```bash
# Restart services to pick up new secrets
docker --context oracle-vps compose -f docker-compose.yml restart

# Or full recreate
docker --context oracle-vps compose -f docker-compose.yml down
infisical run ... docker compose -f docker-compose.yml up -d
```

## Next Steps

1. **Copy master files to active .env**:

   ```bash
   for host in oracle-vps orchestrator worker-rtx3060 worker-rtx3090ti worker-rtx5090; do
     cp infra/hosts/$host/.env.master.$host infra/hosts/$host/.env
   done
   ```

2. **Generate all secrets**:

   ```bash
   python3 scripts/env_inventory/generate_secrets.py  # Create this if needed
   ```

3. **Upload to Infisical**:

   ```bash
   cd scripts/infisical
   ./upload-all-secrets.ps1 -Environment production
   ```

4. **Verify docker-compose uses the .env**:

   ```bash
   docker compose config | head -20
   ```

5. **Test stack startup**:
   ```bash
   make up-oracle  # Start Oracle stack with all secrets injected
   ```

---

**Documentation Updated**: 2026-09-11  
**Maintenance**: Update when new services added or Infisical structure changes
