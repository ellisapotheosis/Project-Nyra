# Machine-Specific Environment Variable Management

This directory contains scripts and templates for managing machine-specific environment variables across the Project Nyra 4-PC cluster.

## Overview

Project Nyra uses **Infisical** with a two-tier structure:

```
Infisical Project: Project-Nyra (pbcskpxyqtysbxjvecfo)
├── /shared              # Shared variables (API keys, databases, etc.)
└── /machines            # Machine-specific variables
    ├── /orchestrator-mini
    ├── /worker-5090
    ├── /worker-3090
    └── /worker-3060
```

## Quick Start

**Note:** All scripts are available in both PowerShell (.ps1) and Bash (.sh) versions. Use whichever is more convenient for your environment.

### 1. Bootstrap a New Machine

On each PC, run:

**PowerShell:**
```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\machines
.\generate-machine-env.ps1
```

**Git Bash:**
```bash
cd /c/Dev/Projects/Repos/Project-Nyra/infra/machines
./generate-machine-env.sh
```

This generates:
- `.env.machine` - Machine-specific variables to upload
- `machine-info.json` - Full system info for reference

### 2. Upload Machine-Specific Variables

**PowerShell:**
```powershell
# Auto-detects role from machine-info.json
.\upload-to-infisical.ps1

# Or specify role manually
.\upload-to-infisical.ps1 -MachineRole worker-rtx3060
```

**Git Bash:**
```bash
# Auto-detects role from machine-info.json
./upload-to-infisical.sh

# Or specify role manually
./upload-to-infisical.sh worker-rtx3060
```

### 3. Upload Shared Variables (Once, from Orchestrator)

```bash
# Copy template and fill in real values
cp .env.shared.template .env.shared
# Edit .env.shared with real API keys and passwords
nano .env.shared

# Upload to Infisical
infisical secrets set --path="/shared" --env="prod" --file=.env.shared
```

### 4. Download Variables on Each Machine

**PowerShell:**
```powershell
# Downloads both /shared and /machines/<role> into .env
.\download-from-infisical.ps1 -MachineRole worker-rtx3060

# Or auto-detect role
.\download-from-infisical.ps1
```

**Git Bash:**
```bash
# Downloads both /shared and /machines/<role> into .env
./download-from-infisical.sh worker-rtx3060

# Or auto-detect role
./download-from-infisical.sh
```

### 5. Use Variables

```bash
# Option 1: Use generated .env file
docker compose --env-file .env up

# Option 2: Run directly with Infisical (recommended)
infisical run --projectId='pbcskpxyqtysbxjvecfo' --env='prod' \
  --path='/shared' --path='/machines/worker-rtx3060' -- \
  docker compose up
```

## Files

| File | Purpose |
|------|---------|
| `generate-machine-env.ps1` / `.sh` | Collects system info and generates `.env.machine` |
| `upload-to-infisical.ps1` / `.sh` | Uploads `.env.machine` to Infisical |
| `download-from-infisical.ps1` / `.sh` | Downloads merged `.env` from Infisical |
| `.env.shared.template` | Template for shared variables |
| `MACHINE-ENV-STRATEGY.md` | Complete documentation of variable strategy |

**Note:** All scripts are available in both PowerShell (`.ps1`) and Bash (`.sh`) versions.

## Machine-Specific Variables

Generated automatically by `generate-machine-env.ps1`:

- `MACHINE_HOSTNAME` - System hostname
- `MACHINE_ROLE` - Worker type (`worker-rtx3060`, etc.)
- `MACHINE_IP_ETHERNET` - Wired LAN IP
- `MACHINE_IP_WIFI` - Wireless LAN IP
- `MACHINE_IP_TAILSCALE` - Tailscale VPN IP
- `MACHINE_MAC_ETHERNET` - Ethernet MAC address
- `MACHINE_MAC_WIFI` - WiFi MAC address
- `MACHINE_GPU_TYPE` - GPU model (`rtx_3060`, etc.)
- `MACHINE_GPU_VRAM_GB` - GPU VRAM in GB
- `OLLAMA_HOST` - Ollama bind address
- `OLLAMA_PORT` - Ollama API port
- `OLLAMA_MODELS` - Installed models
- `WORKER_3060_URL` - URL for Nexus to reach this worker
- `WORKER_3060_MODELS` - Models available on this worker

## Shared Variables

Must be set up once in Infisical `/shared` path:

- Database credentials (PostgreSQL, Redis, FalkorDB, Qdrant)
- API keys (Anthropic, OpenAI, Google, OpenRouter)
- GitHub tokens
- Service ports and configurations
- Nexus Router settings

See `.env.shared.template` for complete list.

## Workflow for Each PC

### Orchestrator Mini

```bash
# 1. Generate machine env
./generate-machine-env.ps1

# 2. Upload machine-specific vars
./upload-to-infisical.sh orchestrator-mini

# 3. Set up shared vars (ONCE from this machine)
cp .env.shared.template .env.shared
# Edit with real API keys
./upload-shared-to-infisical.sh

# 4. Download merged env
./download-from-infisical.sh orchestrator-mini

# 5. Start services
docker compose up
```

### Worker RTX 5090 / 3090 / 3060

```bash
# 1. Generate machine env
./generate-machine-env.ps1

# 2. Upload machine-specific vars
./upload-to-infisical.sh  # Auto-detects worker-rtx5090, etc.

# 3. Download merged env
./download-from-infisical.sh

# 4. Start worker services
docker compose -f workers/docker-compose.worker-rtx5090.yml up
```

## Updating Variables

### Update Shared Variables

```bash
# From orchestrator-mini
infisical secrets set ANTHROPIC_API_KEY "sk-ant-new-key" \
  --projectId='pbcskpxyqtysbxjvecfo' --env='prod' --path='/shared'

# Pull on all machines
./download-from-infisical.sh
```

### Update Machine-Specific Variables

```bash
# On the specific machine
nano .env.machine  # Edit values
./upload-to-infisical.sh
```

## Security Best Practices

1. **Never commit .env files to git**
   - `.env`, `.env.machine`, `.env.shared` are in `.gitignore`

2. **Use Infisical for secrets**
   - Don't hardcode API keys in docker-compose files

3. **Rotate passwords regularly**
   - Update in Infisical `/shared`
   - Pull on all machines

4. **Use Tailscale IPs for worker URLs**
   - More secure than exposing to internet

5. **Separate environments**
   - Use `--env='dev'` for development
   - Use `--env='prod'` for production

## Troubleshooting

### Machine-specific vars not loading?

Ensure you're pulling from both paths:
```bash
infisical run --path='/shared' --path='/machines/worker-rtx3060' -- docker compose up
```

### Worker URL not working?

1. Check Tailscale: `tailscale status`
2. Verify IP in `.env.machine` matches Tailscale IP
3. Re-run `./generate-machine-env.ps1` if IP changed

### Infisical auth issues?

```bash
# Login to Infisical
infisical login

# Or use service token
export INFISICAL_TOKEN=st.xxx.yyy.zzz
```

### Variables not updating?

1. Upload: `./upload-to-infisical.sh`
2. Download: `./download-from-infisical.sh`
3. Restart services: `docker compose restart`

## Advanced Usage

### Export to multiple formats

```bash
# Export as dotenv
infisical secrets get --path='/shared' --format=dotenv > .env.shared

# Export as JSON
infisical secrets get --path='/machines/worker-rtx3060' --format=json > machine-vars.json

# Export as YAML
infisical secrets get --path='/shared' --format=yaml > shared-vars.yaml
```

### Use in scripts

```bash
# Source variables
source <(infisical secrets get --path='/shared' --format=dotenv)

# Use in docker-compose
infisical run --path='/shared' --path='/machines/worker-rtx3060' -- \
  docker compose -f docker-compose.yml -f workers/docker-compose.worker-rtx3060.yml up
```

### Backup Infisical secrets

```bash
# Backup all secrets
infisical secrets get --path='/shared' --format=dotenv > backup-shared.env
infisical secrets get --path='/machines/worker-rtx3060' --format=dotenv > backup-worker-rtx3060.env
```

## Reference

- **Infisical Docs**: https://infisical.com/docs
- **Infisical CLI**: https://infisical.com/docs/cli/overview
- **Project Strategy**: `MACHINE-ENV-STRATEGY.md`
- **Cluster Setup**: `../cluster-setup/CLUSTER-SETUP-GUIDE.md`

## Support

For issues, see:
- Infisical Dashboard: https://app.infisical.com
- Project Nyra Issues: https://github.com/your-repo/Project-Nyra/issues
