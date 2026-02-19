# Project Nyra Bootstrap - Quick Start (Tailscale Already Configured)

## ⚡ Assumptions
✅ Tailscale is already set up with static IPs:
- Orchestrator: 100.64.0.1
- Worker-3060: 100.64.0.11
- Worker-3090Ti: 100.64.0.12
- Worker-5090: 100.64.0.10

✅ Docker Desktop installed on all PCs  
✅ NVIDIA drivers installed on GPU workers

---

## 🚀 Step 1: Collect PC Information (All PCs)

Open PowerShell **as Administrator**:

```powershell
cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force
.\scripts\pc-info-collection\collect-all-pcs.ps1
```

**Output**: Creates JSON in `C:\Users\edane\OneDrive\LANShare\PC-Inventory\machines\{COMPUTERNAME}.json`

**Run on all 4 PCs**, then proceed.

---

## 🖥️ Step 2: Deploy Orchestrator (Minisforum UH680)

### 2.1 Create Environment File

Copy and fill in (replace placeholders):

**File**: `C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap\configs\env-templates\.env.orchestrator`

```bash
# === TAILSCALE (PRE-CONFIGURED) ===
TAILSCALE_IP=100.64.0.1
TAILSCALE_HOSTNAME=orchestrator-mini.tail-net.ts.net

# === SERVICE PORTS ===
NEXUS_ROUTER_PORT=6000
ARCHON_API_PORT=4000
ARCHON_UI_PORT=3737
INFISICAL_PORT=8080
GITEA_HTTP_PORT=3001
GRAFANA_ADMIN_PASSWORD=your-secure-password
N8N_ENCRYPTION_KEY=your-random-string
DIFY_SECRET_KEY=your-random-string

# === DATABASE PASSWORDS (Generate random, strong passwords) ===
ARCHON_DB_PASSWORD=random-password-here
GITEA_DB_PASSWORD=random-password-here
INFISICAL_DB_PASSWORD=random-password-here
ZEP_DB_PASSWORD=random-password-here
N8N_DB_PASSWORD=random-password-here
DIFY_DB_PASSWORD=random-password-here

# === JWT SECRETS (Generate random strings) ===
JWT_SIGNUP_SECRET=random-string-1
JWT_REFRESH_SECRET=random-string-2
JWT_AUTH_SECRET=random-string-3

# === API KEYS (From Infisical or external services) ===
HF_TOKEN=hf_your_token_here
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
QDRANT_API_KEY=random-string

# === LOGGING ===
NEXUS_LOG_LEVEL=info
NODE_ENV=production
```

### 2.2 Start Orchestrator Services

```powershell
cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"

# Load environment
$envPath = "configs\env-templates\.env.orchestrator"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Start services
cd docker-composes
docker-compose -f orchestrator-complete.yml up -d
```

**Wait 60 seconds for services to initialize.**

### 2.3 Verify Orchestrator

```powershell
# Check containers running
docker ps | findstr "nyra-"

# Health checks
curl http://localhost:6000/health           # Nexus Router
curl http://localhost:4000/api/health       # Archon
curl http://localhost:8080/api/v1/health    # Infisical
curl http://localhost:3001/api/v1/repos     # Gitea
curl http://localhost:3000/api/health       # Grafana

# From another PC
curl http://100.64.0.1:6000/health
```

**Expected**: All return HTTP 200

### 2.4 Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Grafana** | http://100.64.0.1:3000 | admin / (from .env) |
| **Gitea** | http://100.64.0.1:3001 | admin (first login) |
| **Infisical** | http://100.64.0.1:8080 | Setup on first access |
| **Nexus Router** | http://100.64.0.1:6000 | API gateway |

---

## 👷 Step 3: Deploy Worker-3060 (Alienware M15R7 - RTX 3060)

### 3.1 Verify GPU

```powershell
nvidia-smi
# Should show: NVIDIA RTX 3060, 12GB VRAM
```

### 3.2 Create Environment

**File**: `C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap\configs\env-templates\.env.worker-3060`

```bash
# === TAILSCALE (PRE-CONFIGURED) ===
TAILSCALE_IP=100.64.0.11
TAILSCALE_HOSTNAME=worker-rtx3060.tail-net.ts.net

# === WORKER SETTINGS ===
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_NUM_PARALLEL=2
OLLAMA_MAX_LOADED_MODELS=3
OLLAMA_PRIMARY_MODEL=qwen2.5:7b-q4_K_M
OLLAMA_SECONDARY_MODEL=mistral:7b-q4
OLLAMA_TERTIARY_MODEL=llama3.2:3b
EMBEDDINGS_MODEL=nomic-embed-text

# === WORKER INFO ===
WORKER_ID=worker-3060
WORKER_TIER=1
GPU_TYPE=RTX3060
GPU_VRAM_GB=12
MAX_CONCURRENT_REQUESTS=2
ORCHESTRATOR_API_KEY=your-api-key
```

### 3.3 Start Worker

```powershell
cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"

# Load environment
$envPath = "configs\env-templates\.env.worker-3060"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Start
cd docker-composes
docker-compose -f worker-rtx3060-complete.yml up -d

# Wait for Ollama to initialize (2-3 minutes)
```

### 3.4 Verify Worker-3060

```powershell
# Check Ollama is running
curl http://localhost:11434/api/tags

# Should show models downloading/loaded
# Wait for model pulls to complete (~15 mins for all 4 models)
```

---

## 👷 Step 4: Deploy Worker-3090Ti (Desktop i7-12700 - RTX 3090 Ti)

### 4.1 Verify GPU

```powershell
nvidia-smi
# Should show: NVIDIA RTX 3090 Ti, 24GB VRAM
```

### 4.2 Create Environment

**File**: `C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap\configs\env-templates\.env.worker-3090ti`

```bash
# === TAILSCALE (PRE-CONFIGURED) ===
TAILSCALE_IP=100.64.0.12
TAILSCALE_HOSTNAME=worker-rtx3090ti.tail-net.ts.net

# === VLLM SETTINGS ===
VLLM_HOST=0.0.0.0:8000
VLLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
VLLM_TENSOR_PARALLEL=1
VLLM_MAX_MODEL_LEN=16384
VLLM_GPU_MEMORY_UTILIZATION=0.85

# === LMCACHE SETTINGS ===
LMCACHE_HOST=0.0.0.0:6379
LMCACHE_MAX_SIZE=5GB
LMCACHE_TTL=3600

# === WORKER INFO ===
WORKER_ID=worker-3090ti
WORKER_TIER=2
GPU_TYPE=RTX3090Ti
GPU_VRAM_GB=24
MAX_CONCURRENT_REQUESTS=4
ORCHESTRATOR_API_KEY=your-api-key
```

### 4.3 Start Worker

```powershell
cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"

# Load environment
$envPath = "configs\env-templates\.env.worker-3090ti"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Start
cd docker-composes
docker-compose -f worker-rtx3090ti-complete.yml up -d
```

### 4.4 Verify Worker-3090Ti

```powershell
# Check VLLM is responding
curl http://localhost:8000/v1/models

# Should show model downloading/ready
# Model download: ~20-30 mins for 70B quantized
```

---

## 👷 Step 5: Deploy Worker-5090 (Alienware Area-51 - RTX 5090)

### 5.1 Verify GPU

```powershell
nvidia-smi
# Should show: NVIDIA RTX 5090, 32GB VRAM
```

### 5.2 Create Environment

**File**: `C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap\configs\env-templates\.env.worker-5090`

```bash
# === TAILSCALE (PRE-CONFIGURED) ===
TAILSCALE_IP=100.64.0.10
TAILSCALE_HOSTNAME=worker-rtx5090.tail-net.ts.net

# === VLLM SETTINGS ===
VLLM_HOST=0.0.0.0:8000
VLLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
VLLM_TENSOR_PARALLEL=1
VLLM_MAX_MODEL_LEN=32768
VLLM_GPU_MEMORY_UTILIZATION=0.90
VLLM_ENABLE_CHUNKED_PREFILL=true

# === LMCACHE SETTINGS ===
LMCACHE_HOST=0.0.0.0:6379
LMCACHE_MAX_SIZE=8GB
LMCACHE_TTL=3600

# === WORKER INFO ===
WORKER_ID=worker-5090
WORKER_TIER=3
GPU_TYPE=RTX5090
GPU_VRAM_GB=32
MAX_CONCURRENT_REQUESTS=6
ORCHESTRATOR_API_KEY=your-api-key
```

### 5.3 Start Worker

```powershell
cd "C:\Users\edane\OneDrive\LANShare\LAN-PC-Bootstrap"

# Load environment
$envPath = "configs\env-templates\.env.worker-5090"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2])
        }
    }
}

# Start
cd docker-composes
docker-compose -f worker-rtx5090-complete.yml up -d
```

### 5.4 Verify Worker-5090

```powershell
# Check VLLM is responding
curl http://localhost:8000/v1/models
```

---

## ✅ Step 6: Final Verification

### From Orchestrator

```powershell
# Test all workers via Tailscale IPs
curl http://100.64.0.11:11434/api/tags       # Worker-3060 Ollama
curl http://100.64.0.12:8000/v1/models       # Worker-3090Ti VLLM
curl http://100.64.0.10:8000/v1/models       # Worker-5090 VLLM
```

### From Any PC

```powershell
# Ping all PCs
ping orchestrator-mini.tail-net.ts.net
ping worker-rtx3060.tail-net.ts.net
ping worker-rtx3090ti.tail-net.ts.net
ping worker-rtx5090.tail-net.ts.net
```

### Docker Status

```powershell
# On each PC
docker ps --filter "name=nyra"
docker-compose logs -f nyra-nexus-router    # Orchestrator
docker-compose logs -f worker-3060-ollama   # Worker-3060
```

---

## 📊 Service Status Dashboard

### Orchestrator (100.64.0.1)

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Nexus Router | 6000 | http://100.64.0.1:6000 | ✅ MCP + LLM gateway |
| Archon | 4000 | http://100.64.0.1:4000 | ✅ Knowledge hub |
| Infisical | 8080 | http://100.64.0.1:8080 | ✅ Secrets |
| Gitea | 3001 | http://100.64.0.1:3001 | ✅ Git mirror |
| Grafana | 3000 | http://100.64.0.1:3000 | ✅ Monitoring |

### Worker-3060 (100.64.0.11)

| Service | Port | Models | Status |
|---------|------|--------|--------|
| Ollama | 11434 | qwen2.5:7b, mistral:7b, llama3.2:3b | ✅ Running |

### Worker-3090Ti (100.64.0.12)

| Service | Port | Model | Status |
|---------|------|-------|--------|
| VLLM | 8000 | Llama-3.1-70B-Q4 | ✅ Running |
| LMCache | 6379 | KV-cache | ✅ Running |

### Worker-5090 (100.64.0.10)

| Service | Port | Model | Status |
|---------|------|-------|--------|
| VLLM | 8000 | Llama-3.1-70B-Q4 | ✅ Running |
| LMCache | 6379 | KV-cache | ✅ Running |

---

## 🔧 Troubleshooting

### "Port already in use"
```powershell
# Find what's using the port
netstat -ano | findstr :6000

# If needed, change port in docker-compose.yml
# Then restart: docker-compose down && docker-compose up -d
```

### "GPU not detected"
```powershell
# Verify drivers
nvidia-smi

# Verify Docker GPU support
docker run --rm --gpus all nvidia/cuda:12.0-runtime nvidia-smi
```

### "Services not healthy"
```powershell
# Check logs
docker logs nyra-nexus-router
docker logs worker-3060-ollama

# Wait longer (up to 5 minutes for first start)
# Models take time to download
```

### "Can't reach other PC"
```powershell
# Verify Tailscale connectivity
tailscale status

# Ping via Tailscale
ping orchestrator-mini.tail-net.ts.net

# Check firewall
# Windows Defender Firewall should allow Docker containers
```

---

## 📋 Post-Deployment Checklist

- [ ] All 4 PCs have PC info collected in `PC-Inventory/machines/`
- [ ] Orchestrator services all healthy (HTTP 200)
- [ ] Worker-3060 Ollama models loaded (4+ models)
- [ ] Worker-3090Ti VLLM model loaded and responding
- [ ] Worker-5090 VLLM model loaded and responding
- [ ] All workers reachable via Tailscale IPs
- [ ] Grafana dashboard accessible
- [ ] Gitea accessible and initialized
- [ ] Nexus Router at 100.64.0.1:6000 responding

---

## 🚀 What's Next?

1. **Setup Gitea Mirror**
   - Go to http://100.64.0.1:3001
   - Create admin user
   - Mirror project-nyra from GitHub

2. **Configure Nexus Router**
   - Setup MCP servers in Nexus Router UI
   - Configure LLM routing
   - Map worker endpoints

3. **Initialize Infisical**
   - Go to http://100.64.0.1:8080
   - Create organization and project
   - Store secrets referenced in PORT-MAPPING-REFERENCE.md

4. **Setup Cloudflare Tunnels** (separate task)
   - Create tunnels for each service
   - Configure DNS records
   - Setup Access policies

5. **Integrate with Project-Nyra**
   - Register worker endpoints
   - Update Nexus Router config
   - Test distributed inference

---

## 📞 Support

**Stuck?** Check these files in order:
1. `00-START-HERE.md` - General overview
2. `01-PORT-MAPPING-REFERENCE.md` - Service details
3. `02-QUICKSTART-BY-PC.md` - Detailed per-PC guide
4. `METAMCP-ELIMINATION-SUMMARY.md` - Architecture changes

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-02-12  
**Version**: 1.0 (Tailscale-Optional)
