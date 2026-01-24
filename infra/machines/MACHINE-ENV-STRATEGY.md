# Machine-Specific Environment Variable Strategy

## Overview

Project Nyra uses a **two-tier Infisical structure** to separate machine-specific configurations from shared project configurations:

```
Infisical Project: Project-Nyra
├── /shared              # Shared variables (API keys, database, Redis, etc.)
└── /machines
    ├── /orchestrator-mini    # Mini PC orchestrator
    ├── /worker-5090          # RTX 5090 GPU worker
    ├── /worker-3090          # RTX 3090 Ti GPU worker
    └── /worker-3060          # RTX 3060 GPU worker
```

## Variable Categories

### 🌐 Machine-Specific Variables (in `/machines/<hostname>/`)

These vary per PC and MUST be stored separately:

| Variable | Description | Example |
|----------|-------------|---------|
| **`MACHINE_HOSTNAME`** | System hostname | `AlienApotheosis` |
| **`MACHINE_ROLE`** | Worker type | `worker-rtx3060` |
| **`MACHINE_IP_ETHERNET`** | Wired LAN IP | `192.168.1.50` |
| **`MACHINE_IP_WIFI`** | Wireless LAN IP (if applicable) | `192.168.1.221` |
| **`MACHINE_IP_TAILSCALE`** | Tailscale VPN IP | `100.83.23.49` |
| **`MACHINE_MAC_ETHERNET`** | Ethernet MAC address | `04:bf:1b:29:a3:f3` |
| **`MACHINE_MAC_WIFI`** | WiFi MAC address | `c2:b3:b9:2f:4c:d2` |
| **`MACHINE_GPU_TYPE`** | GPU model | `rtx_3060` |
| **`MACHINE_GPU_VRAM_GB`** | GPU VRAM in GB | `12` |
| **`MACHINE_GPU_NAME`** | Full GPU name | `NVIDIA GeForce RTX 3060 Laptop GPU` |
| **`OLLAMA_HOST`** | Ollama bind address | `0.0.0.0` or `127.0.0.1` |
| **`OLLAMA_PORT`** | Ollama API port | `11434` |
| **`OLLAMA_MODELS`** | Installed models | `qwen2.5-coder:7b,llama3.1:8b` |
| **`WORKER_SPECIALIZATION`** | Worker role | `code`, `reasoning`, `embeddings` |

### For Nexus Router Configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| **`WORKER_3060_URL`** | URL for Nexus to reach this worker | `http://100.83.23.49:11434` |
| **`WORKER_3060_MODELS`** | Models available | `qwen2.5-coder:7b,llama3.1:8b` |
| **`WORKER_3060_SPECIALIZATION`** | Primary use case | `code` |

### 🔒 Shared Variables (in `/shared`)

These are the same across all machines:

#### Database & Cache
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_URL`
- `REDIS_MAX_MEMORY`, `REDIS_EVICTION_POLICY`
- `NEXUS_REDIS_URL`, `CLAUDE_FLOW_REDIS_URL`, `ARCHON_REDIS_URL`
- `FALKORDB_PORT`, `FALKORDB_PASSWORD`
- `QDRANT_PORT`, `QDRANT_API_KEY`

#### API Keys & Tokens
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`
- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`, `GOOGLE_GEMINI_API_KEY`
- `GITHUB_TOKEN`, `GH_PAT`, `GITHUB_OWNER`, `GITHUB_REPO`

#### Service Configuration
- `CLAUDE_FLOW_PORT`, `CLAUDE_FLOW_MODE`
- `ARCHON_PORT`, `ARCHON_MCP_PORT`
- `NEXUS_ROUTER_PORT`, `NEXUS_ROUTER_MCP_PORT`
- `MODEL_ROUTING_STRATEGY`, `MODEL_ROUTING_PREFER_LOCAL`
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
- `LETTA_API_URL`, `LETTA_SERVER_PASSWORD`

#### General
- `NODE_ENV`, `LOG_LEVEL`
- `NEXUS_JWT_SECRET`, `NEXUS_ADMIN_TOKEN`

## Infisical Path Structure

### Orchestrator Mini (`/machines/orchestrator-mini/`)

```bash
MACHINE_HOSTNAME=orchestrator-mini
MACHINE_ROLE=orchestrator
MACHINE_IP_ETHERNET=192.168.1.100
MACHINE_IP_TAILSCALE=100.115.69.115
MACHINE_MAC_ETHERNET=xx:xx:xx:xx:xx:xx
# No GPU variables for orchestrator
```

### Worker RTX 5090 (`/machines/worker-5090/`)

```bash
MACHINE_HOSTNAME=<to-be-determined>
MACHINE_ROLE=worker-5090
MACHINE_IP_ETHERNET=192.168.1.101
MACHINE_IP_TAILSCALE=<to-be-determined>
MACHINE_MAC_ETHERNET=<to-be-determined>
MACHINE_GPU_TYPE=rtx_5090
MACHINE_GPU_VRAM_GB=48
MACHINE_GPU_NAME=NVIDIA GeForce RTX 5090
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_MODELS=deepseek-r1:236b,qwen2.5:72b
WORKER_SPECIALIZATION=reasoning
WORKER_5090_URL=http://<tailscale-ip>:11434
WORKER_5090_MODELS=deepseek-r1:236b-q4_K_M,qwen2.5:72b-instruct-q8_0
WORKER_5090_SPECIALIZATION=reasoning
```

### Worker RTX 3090 (`/machines/worker-3090/`)

```bash
MACHINE_HOSTNAME=<to-be-determined>
MACHINE_ROLE=worker-3090
MACHINE_IP_ETHERNET=192.168.1.102
MACHINE_IP_TAILSCALE=<to-be-determined>
MACHINE_MAC_ETHERNET=<to-be-determined>
MACHINE_GPU_TYPE=rtx_3090ti
MACHINE_GPU_VRAM_GB=24
MACHINE_GPU_NAME=NVIDIA GeForce RTX 3090 Ti
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_MODELS=llama3.1:70b,mistral-large:123b
WORKER_SPECIALIZATION=general
WORKER_3090_URL=http://<tailscale-ip>:11434
WORKER_3090_MODELS=llama3.1:70b-instruct-q4_K_M,mistral-large:123b-instruct-2407-q4_K_M
WORKER_3090_SPECIALIZATION=general
```

### Worker RTX 3060 (`/machines/worker-3060/`)

```bash
MACHINE_HOSTNAME=AlienApotheosis
MACHINE_ROLE=worker-rtx3060
MACHINE_IP_ETHERNET=<not-connected>
MACHINE_IP_WIFI=192.168.1.221
MACHINE_IP_TAILSCALE=100.83.23.49
MACHINE_MAC_ETHERNET=04:bf:1b:29:a3:f3
MACHINE_MAC_WIFI=c2:b3:b9:2f:4c:d2
MACHINE_GPU_TYPE=rtx_3060
MACHINE_GPU_VRAM_GB=12
MACHINE_GPU_NAME=NVIDIA GeForce RTX 3060 Laptop GPU
OLLAMA_HOST=0.0.0.0
OLLAMA_PORT=11434
OLLAMA_MODELS=qwen2.5-coder:7b,llama3.1:8b,nomic-embed-text
WORKER_SPECIALIZATION=code
WORKER_3060_URL=http://100.83.23.49:11434
WORKER_3060_MODELS=qwen2.5-coder:7b,llama3.1:8b,nomic-embed-text
WORKER_3060_SPECIALIZATION=code
```

## Usage Workflow

### 1. Bootstrap New Machine

On each PC, run:
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\machines
.\generate-machine-env.ps1
```

This generates:
- `.env.machine` - Machine-specific variables
- `machine-info.json` - Full system info for reference

### 2. Upload to Infisical

```bash
# Upload machine-specific vars
infisical secrets set --path="/machines/worker-rtx3060" --env="prod" --file=.env.machine

# Upload shared vars (once, from orchestrator)
infisical secrets set --path="/shared" --env="prod" --file=.env.shared
```

### 3. Pull Variables on Each Machine

```bash
# Pull both shared and machine-specific
infisical run --path="/shared" --path="/machines/worker-rtx3060" --env="prod" -- docker compose up
```

Or create a merged .env:
```bash
# Pull shared
infisical secrets get --path="/shared" --env="prod" > .env

# Pull machine-specific and append
infisical secrets get --path="/machines/worker-rtx3060" --env="prod" >> .env
```

## Security Notes

1. **Never commit machine-specific .env files to git** - Add to `.gitignore`
2. **API keys stay in `/shared`** - Don't duplicate across machines
3. **Rotate passwords regularly** - Update in Infisical, then pull on all machines
4. **Use Tailscale IPs for worker URLs** - More secure than public IPs
5. **Keep GPU worker specs up to date** - Update after model changes

## Maintenance

### When Adding a New Machine

1. Run `generate-machine-env.ps1` on the new machine
2. Upload to Infisical: `infisical secrets set --path="/machines/<hostname>"`
3. Update Nexus Router shared config with new worker URL
4. Test connectivity from orchestrator

### When Changing Models

1. Update `OLLAMA_MODELS` and `WORKER_<ID>_MODELS` in machine-specific env
2. Upload to Infisical
3. Pull on orchestrator and restart Nexus Router

### When Rotating API Keys

1. Update in `/shared` path only
2. Pull on all machines: `infisical secrets pull --path="/shared"`
3. Restart services that use the keys

## Reference

- **Collection Script**: `generate-machine-env.ps1`
- **Upload Script**: `upload-to-infisical.sh`
- **Templates**: `templates/`
- **Documentation**: This file

## Troubleshooting

**Q: Machine-specific vars not loading?**
A: Ensure you're pulling from both paths: `--path="/shared"` AND `--path="/machines/<hostname>"`

**Q: Worker URL not working?**
A: Check Tailscale connection: `tailscale status` and verify IP matches `WORKER_<ID>_URL`

**Q: Duplicate variables?**
A: Machine-specific vars take precedence. Remove duplicates from `/shared` if they should be machine-specific.
