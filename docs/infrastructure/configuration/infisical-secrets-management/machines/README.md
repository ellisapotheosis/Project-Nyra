# Machine-Specific Environment Configuration

This directory contains machine-specific environment variable configurations for the Project-Nyra 4-PC distributed GPU cluster. Each machine has its own `.env` file that gets uploaded to Infisical under `/hosts/<pc-name>` paths.

## 🏗️ Architecture Overview

### Two-Tier Infisical Structure

```
Infisical Project: apotheosis (8374cea9-e5e8-4050-bda4-b91f25ab30ef)
└── dev environment
    ├── /shared                          # Shared variables (API keys, passwords, database)
    └── /hosts/
        ├── orchestrator-mini            # Orchestrator-specific variables
 ├── # RTX 3060 worker variables
        ├── worker-rtx5090              # RTX 5090 worker variables
        └── worker-rtx3090ti            # RTX 3090 Ti worker variables
```

### Machine Roles

| Machine | Hostname          | Role             | Specialization | GPU         | VRAM | Status       |
| ------- | ----------------- | ---------------- | -------------- | ----------- | ---- | ------------ |
| **PC1** | orchestrator-mini | orchestrator     | coordination   | None        | 0GB  | ✅ Connected |
| **PC3** | TO_BE_COLLECTED   | worker-rtx5090   | reasoning      | RTX 5090    | 32GB | ⏳ Pending   |
| **PC4** | TO_BE_COLLECTED   | worker-rtx3090ti | analysis       | RTX 3090 Ti | 24GB | ⏳ Pending   |

## 📁 Files in This Directory

### Machine-Specific .env Files

- **`orchestrator-mini.env`** - Orchestrator PC configuration
  - Network bindings (Postgres, Redis, Nexus Router)
  - Worker connection URLs
  - Service coordination settings
  - RuVector leader configuration

- **`worker-rtx5090.env`** - RTX 5090 worker (Primary GPU) ⏳ PLACEHOLDERS
  - 32GB VRAM configuration
  - Large model settings (DeepSeek-R1, Qwen 72B)
  - vLLM production inference config
  - TO_BE_COLLECTED network values

- **`worker-rtx3090ti.env`** - RTX 3090 Ti worker (Secondary GPU) ⏳ PLACEHOLDERS
  - 24GB VRAM configuration
  - Analysis models (Llama 70B, Mistral Large)
  - TO_BE_COLLECTED network values

### Automation Scripts

- **`upload-machines-to-infisical.ps1`** - Upload machine configs to Infisical
- **`generate-combined-env.ps1`** - Generate combined .env files (shared + machine-specific)

## 🚀 Quick Start

### 1. Upload Machine Configurations to Infisical

First, ensure you have `INFISICAL_ACCESS_TOKEN` set in your environment:

```powershell
# Check if token is set
$env:INFISICAL_ACCESS_TOKEN

# If not set, export from Infisical /shared first
cd C:\Dev\Projects\Repos\Project-Nyra\infisical-path-plan-kit
infisical export --path="/shared" --format=dotenv-export | Invoke-Expression
```

Then upload all machine configurations:

```powershell
cd machines

# Dry run first (recommended)
.\upload-machines-to-infisical.ps1 -DryRun -Verbose

# Upload for real
.\upload-machines-to-infisical.ps1 -Verbose
```

### 2. Generate Combined .env Files

After uploading, generate combined .env files that merge `/shared` + `/hosts/<pc>`:

```powershell
# Generate all combined files
.\generate-combined-env.ps1 -OutputToFiles

# Preview a specific machine (no file output)
.\generate-combined-env.ps1 -MachineRole "orchestrator-mini"

# Generate only for specific machine
.\generate-combined-env.ps1 -MachineRole -OutputToFiles
```

This creates files in `combined/`:

- `combined/orchestrator-mini.env`
- `combined/worker-rtx5090.env`
- `combined/worker-rtx3090ti.env`

### 3. Deploy to Each PC

Copy the generated combined .env file to each machine:

**On orchestrator-mini (PC1):**

```powershell
# Copy combined .env
Copy-Item combined/orchestrator-mini.env $env:PROJECT_ROOT\.env

# Start services
docker compose -f infra/cluster-setup/docker-compose.orchestrator.yml up -d
```

```powershell
# Copy combined .env
Copy-Item combined/ $env:PROJECT_ROOT\.env

# Start services
docker compose -f infra/cluster-setup/docker-compose.worker.yml up -d
```

**On worker-rtx5090 (PC3) and worker-rtx3090ti (PC4):**

```powershell
# After collecting actual values, same deployment process
```

## 📊 Variable Categories

### Machine-Specific Variables (in /hosts/<pc>)

These override shared variables and are unique per machine:

- **Identity**: `MACHINE_HOSTNAME`, `MACHINE_ROLE`, `MACHINE_PURPOSE`
- **Hardware**: `MACHINE_CPU`, `MACHINE_RAM_GB`, `MACHINE_GPU_*`
- **Networking**: `MACHINE_IP_*`, `MACHINE_MAC_*`, `TAILSCALE_*`
- **GPU Config**: `NVIDIA_VISIBLE_DEVICES`, GPU memory settings
- **Service Bindings**: `OLLAMA_BIND`, `VLLM_BIND`, port assignments
- **Ollama**: `OLLAMA_MODELS`, `OLLAMA_GPU_LAYERS`, model-specific settings
- **Worker Endpoints**: `WORKER_*_URL`, `WORKER_*_MODELS`
- **Orchestrator**: `NEXUS_ROUTER_URL`, `ORCHESTRATOR_URL` (connections to coordinator)
- **RuVector**: `RUVECTOR_MODE`, `RUVECTOR_PEER_ID`, `RUVECTOR_LEADER`
- **Cloudflare Tunnels**: `CLOUDFLARE_TUNNEL_TOKEN_*` (PC-specific tokens)
- **Docker**: `DOCKER_SUBNET_*` (unique subnet per machine)
- **Dev Ports**: Machine-specific UI and monitoring ports

### Shared Variables (in /shared)

Common across all machines:

- **API Keys**: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`
- **Database**: `POSTGRES_PASSWORD`, `POSTGRES_USER`, `POSTGRES_DB`
- **Redis**: `REDIS_PASSWORD`
- **Auth**: `JWT_SECRET`, `CLERK_SECRET_KEY`
- **External Services**: Supabase, Stripe, GitHub, n8n credentials
- **Project Info**: `PROJECT_ID`, `PROJECT_NAME`, `ENV`

## 🔄 Workflow Diagrams

### Upload Workflow

```
Local .env files          Infisical Paths
─────────────────         ───────────────
orchestrator-mini.env  →  /hosts/orchestrator
 → /hosts/
worker-rtx5090.env     →  /hosts/worker-rtx5090
worker-rtx3090ti.env   →  /hosts/worker-rtx3090ti

[upload-machines-to-infisical.ps1]
```

### Download & Merge Workflow

```
Infisical Paths              Combined Output
───────────────              ───────────────
/shared              ┐
                     ├─ merge →  combined/orchestrator-mini.env
/machines/orch...    ┘

/shared              ┐
 ├─ merge → combined/
/machines/worker-3060┘

[generate-combined-env.ps1]
```

## 🔧 Collecting Missing Values

For PC3 (worker-rtx5090) and PC4 (worker-rtx3090ti), you need to collect actual values:

### Step 1: Connect PCs to Tailscale

On each PC, install and authenticate Tailscale:

```powershell
# Install Tailscale
winget install Tailscale.Tailscale

# Connect to tailnet
tailscale up
```

### Step 2: Run PC Info Collector

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\machines

# Run collector script
.\PC-INFO-COLLECTOR.ps1

# This generates machine-info.json with:
# - Hostname
# - Network IPs (Ethernet, WiFi, Tailscale)
# - MAC addresses
# - GPU information
# - System specs
```

### Step 3: Update .env Files

Take the values from `machine-info.json` and replace placeholders in:

- `worker-rtx5090.env` - Replace all `TO_BE_COLLECTED` values
- `worker-rtx3090ti.env` - Replace all `TO_BE_COLLECTED` values

### Step 4: Re-upload to Infisical

```powershell
# Re-run upload script
.\upload-machines-to-infisical.ps1 -Verbose
```

## 🛠️ Script Reference

### upload-machines-to-infisical.ps1

**Purpose**: Parse machine-specific .env files and upload each variable to Infisical.

**Parameters**:

- `-DryRun` - Preview what would be uploaded without making changes
- `-Verbose` - Show detailed output for each variable

**Usage Examples**:

```powershell
# Test run (no uploads)
.\upload-machines-to-infisical.ps1 -DryRun

# Upload with detailed logging
.\upload-machines-to-infisical.ps1 -Verbose

# Production upload
.\upload-machines-to-infisical.ps1
```

**What it does**:

1. Reads each machine's .env file
2. Parses variables (skips comments and empty lines)
3. Uploads to `/hosts/<pc-name>` path in Infisical
4. Reports success/failure counts
5. Skips `TO_BE_*` placeholders in dry-run mode

**Output**:

```
📁 Uploading orchestrator-mini (orchestrator-mini.env)
   Found 67 variables
   Setting MACHINE_HOSTNAME... ✓
   Setting MACHINE_ROLE... ✓
   ...
========================================
Total:    268
Success:  268
Failed:   0
Skipped:  0
```

### generate-combined-env.ps1

**Purpose**: Download variables from Infisical and merge `/shared` + `/hosts/<pc>` into single .env file.

**Parameters**:

- `-MachineRole <name>` - Generate only for specific machine
- `-OutputToFiles` - Write to `combined/` directory (otherwise just preview)

**Usage Examples**:

```powershell
# Preview orchestrator config (first 10 lines)
.\generate-combined-env.ps1 -MachineRole "orchestrator-mini"

# Generate all combined files
.\generate-combined-env.ps1 -OutputToFiles

.\generate-combined-env.ps1 -MachineRole -OutputToFiles
```

**What it does**:

1. Exports variables from `/shared` using Infisical CLI
2. Exports variables from `/hosts/<pc-name>` using Infisical CLI
3. Merges into single .env file (machine-specific overrides shared)
4. Adds header comments documenting structure
5. Saves to `combined/<machine>.env` if `-OutputToFiles` specified

**Output Format**:

```env
# ==============================================================================
# COMBINED ENVIRONMENT VARIABLES: orchestrator-mini
# Generated: 2026-01-22 15:30:00
# ==============================================================================
# This file combines:
#   1. /shared - Shared project variables (API keys, database, etc.)
#   2. /hosts/orchestrator - Machine-specific overrides
# ==============================================================================

# ==============================================================================
# SHARED VARIABLES (from /shared)
# ==============================================================================

ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_PASSWORD=...
...

# ==============================================================================
# MACHINE-SPECIFIC VARIABLES (from /hosts/orchestrator)
# ==============================================================================
# These override shared variables if there are conflicts

MACHINE_HOSTNAME=orchestrator-mini
MACHINE_ROLE=orchestrator
NEXUS_ROUTER_BIND=0.0.0.0:7000
...
```

## 🐛 Troubleshooting

### Issue: "INFISICAL_ACCESS_TOKEN not set"

**Solution**: Export token from Infisical `/shared`:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infisical-path-plan-kit
infisical export --path="/shared" --format=dotenv-export | Invoke-Expression
```

### Issue: "Invalid secret path" errors

**Cause**: Git Bash path translation (converts `/shared` to `C:\Program Files\Git\shared`)

**Solution**: Use PowerShell instead of Git Bash, or CD to project directory first:

```bash
cd /c/Dev/Projects/Repos/Project-Nyra/infisical-path-plan-kit
infisical export --path="/shared" --format=dotenv
```

### Issue: Variables not uploading

**Debug steps**:

1. **Verify token is valid**:

```powershell
infisical secrets list --path="/shared" --env=dev --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

2. **Test uploading single variable**:

```powershell
infisical secrets set "TEST_VAR" "test_value" --path="/hosts/orchestrator" --env=dev --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

3. **Run upload script with verbose**:

```powershell
.\upload-machines-to-infisical.ps1 -Verbose
```

### Issue: Combined .env missing variables

**Cause**: Variables not uploaded to Infisical yet

**Solution**: Run upload script first:

```powershell
.\upload-machines-to-infisical.ps1
.\generate-combined-env.ps1 -OutputToFiles
```

### Issue: Placeholders in production

**Cause**: PC3/PC4 not connected yet, still have `TO_BE_COLLECTED` values

**Solution**:

1. Connect PCs to Tailscale
2. Run `PC-INFO-COLLECTOR.ps1` on each PC
3. Update .env files with actual values
4. Re-run upload script

## 📋 Deployment Checklist

- [ ] Export `INFISICAL_ACCESS_TOKEN` from `/shared`
- [ ] Review machine-specific .env files for accuracy
- [ ] Run upload script with `-DryRun` to preview
- [ ] Upload machine configs to Infisical
- [ ] Generate combined .env files
- [ ] Copy combined .env to orchestrator-mini
- [ ] Test orchestrator services start correctly
- [ ] Test worker services start correctly
- [ ] Verify Tailscale connectivity between PCs
- [ ] Connect worker-rtx5090 to Tailscale (PC3)
- [ ] Connect worker-rtx3090ti to Tailscale (PC4)
- [ ] Collect actual values for PC3 and PC4
- [ ] Update .env files with actual values
- [ ] Re-upload machine configs for PC3/PC4
- [ ] Deploy combined .env to PC3/PC4
- [ ] Verify full cluster connectivity

## 🔐 Security Notes

1. **Never commit combined .env files** - They contain actual secrets
2. **Use `-DryRun` first** - Always preview before uploading
3. **Rotate Cloudflare tunnel tokens** - Set unique token per machine
4. **Keep Infisical token secure** - Never commit `INFISICAL_ACCESS_TOKEN`
5. **Review before deployment** - Check combined .env files for sensitive data

## 📚 Related Documentation

- **`../README.md`** - Parent directory overview and migration guide
- **`../../infra/machines/MACHINE-ENV-STRATEGY.md`** - Variable separation strategy
- **`../../infra/machines/README.md`** - Machine infrastructure documentation
- **`../../infra/cluster-setup/CURRENT-STATUS.md`** - Current cluster status
- **`../../configs/env/ENV-CONSOLIDATION-SUMMARY.md`** - Full environment variable catalog

## 🎯 Next Steps

1. **For PC1 & PC2 (Already Connected)**:
   - Upload configs: `.\upload-machines-to-infisical.ps1`
   - Generate combined: `.\generate-combined-env.ps1 -OutputToFiles`
   - Deploy to machines
   - Test services

2. **For PC3 & PC4 (Pending Connection)**:
   - Connect to Tailscale
   - Run `PC-INFO-COLLECTOR.ps1`
   - Update .env files with actual values
   - Re-upload to Infisical
   - Deploy to machines

3. **Ongoing**:
   - Monitor service health across cluster
   - Update secrets in Infisical (auto-propagates to combined .env)
   - Add new machines by creating new .env file and adding to scripts
