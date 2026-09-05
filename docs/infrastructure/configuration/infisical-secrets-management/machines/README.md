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

|Machine|Hostname|Role|Specialization|GPU|VRAM|Status|
|-|-|-|-|-|-|-|
|**PC1**|orchestrator-mini|orchestrator|coordination|None|0GB|✅ Connected|
|**PC3**|TO\_BE\_COLLECTED|worker-rtx5090|reasoning|RTX 5090|32GB|⏳ Pending|
|**PC4**|TO\_BE\_COLLECTED|worker-rtx3090ti|analysis|RTX 3090 Ti|24GB|⏳ Pending|

## 📁 Files in This Directory

### Machine-Specific .env Files

* **`orchestrator-mini.env`** - Orchestrator PC configuration

  * Network bindings (Postgres, Redis, Nexus Router)
  * Worker connection URLs
  * Service coordination settings
  * RuVector leader configuration
* **`worker-rtx5090.env`** - RTX 5090 worker (Primary GPU) ⏳ PLACEHOLDERS

  * 24GB VRAM configuration
  * Large model settings (DeepSeek-R1, Qwen 72B)
  * vLLM production inference config
  * TO\_BE\_COLLECTED network values
* **`worker-rtx3090ti.env`** - RTX 3090 Ti worker (Secondary GPU) ⏳ PLACEHOLDERS

  * 24GB VRAM configuration
  * Analysis models (Llama 70B, Mistral Large)
  * TO\_BE\_COLLECTED network values

### Automation Scripts

* **`upload-machines-to-infisical.ps1`** - Upload machine configs to Infisical
* **`generate-combined-env.ps1`** - Generate combined .env files (shared + machine-specific)

## 🚀 Quick Start

### 1\. Upload Machine Configurations to Infisical

First, ensure you have `INFISICAL\_ACCESS\_TOKEN` set in your environment:

```powershell
# Check if token is set
$env:INFISICAL\_ACCESS\_TOKEN

# If not set, export from Infisical /shared first
cd C:\\Dev\\Projects\\Repos\\Project-Nyra\\infisical-path-plan-kit
infisical export --path="/shared" --format=dotenv-export | Invoke-Expression
```

Then upload all machine configurations:

```powershell
cd machines

# Dry run first (recommended)
.\\upload-machines-to-infisical.ps1 -DryRun -Verbose

# Upload for real
.\\upload-machines-to-infisical.ps1 -Verbose
```

### 2\. Generate Combined .env Files

After uploading, generate combined .env files that merge `/shared` + `/hosts/<pc>`:

```powershell
# Generate all combined files
.\\generate-combined-env.ps1 -OutputToFiles

# Preview a specific machine (no file output)
.\\generate-combined-env.ps1 -MachineRole "orchestrator-mini"

# Generate only for specific machine
.\\generate-combined-env.ps1 -MachineRole -OutputToFiles
```

This creates files in `combined/`:

* `combined/orchestrator-mini.env`
* `combined/worker-rtx5090.env`
* `combined/worker-rtx3090ti.env`

### 3\. Deploy to Each PC

Copy the generated combined .env file to each machine:

**On orchestrator-mini (PC1):**

```powershell
# Copy combined .env
Copy-Item combined/orchestrator-mini.env $env:PROJECT\_ROOT\\.env

# Start services
docker compose -f infra/cluster-setup/docker-compose.orchestrator.yml up -d
```

```powershell
# Copy combined .env
Copy-Item combined/ $env:PROJECT\_ROOT\\.env

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

* **Identity**: `MACHINE\_HOSTNAME`, `MACHINE\_ROLE`, `MACHINE\_PURPOSE`
* **Hardware**: `MACHINE\_CPU`, `MACHINE\_RAM\_GB`, `MACHINE\_GPU\_\*`
* **Networking**: `MACHINE\_IP\_\*`, `MACHINE\_MAC\_\*`, `TAILSCALE\_\*`
* **GPU Config**: `NVIDIA\_VISIBLE\_DEVICES`, GPU memory settings
* **Service Bindings**: `OLLAMA\_BIND`, `VLLM\_BIND`, port assignments
* **Ollama**: `OLLAMA\_MODELS`, `OLLAMA\_GPU\_LAYERS`, model-specific settings
* **Worker Endpoints**: `WORKER\_\*\_URL`, `WORKER\_\*\_MODELS`
* **Orchestrator**: `NEXUS\_ROUTER\_URL`, `ORCHESTRATOR\_URL` (connections to coordinator)
* **RuVector**: `RUVECTOR\_MODE`, `RUVECTOR\_PEER\_ID`, `RUVECTOR\_LEADER`
* **Cloudflare Tunnels**: `CLOUDFLARE\_TUNNEL\_TOKEN\_\*` (PC-specific tokens)
* **Docker**: `DOCKER\_SUBNET\_\*` (unique subnet per machine)
* **Dev Ports**: Machine-specific UI and monitoring ports

### Shared Variables (in /shared)

Common across all machines:

* **API Keys**: `ANTHROPIC\_API\_KEY`, `OPENAI\_API\_KEY`, `GOOGLE\_API\_KEY`
* **Database**: `POSTGRES\_PASSWORD`, `POSTGRES\_USER`, `POSTGRES\_DB`
* **Redis**: `REDIS\_PASSWORD`
* **Auth**: `JWT\_SECRET`, `CLERK\_SECRET\_KEY`
* **External Services**: Supabase, Stripe, GitHub, n8n credentials
* **Project Info**: `PROJECT\_ID`, `PROJECT\_NAME`, `ENV`

## 🔄 Workflow Diagrams

### Upload Workflow

```
Local .env files          Infisical Paths
─────────────────         ───────────────
orchestrator-mini.env  →  /hosts/orchestrator
 → /hosts/
worker-rtx5090.env     →  /hosts/worker-rtx5090
worker-rtx3090ti.env   →  /hosts/worker-rtx3090ti

\[upload-machines-to-infisical.ps1]
```

### Download \& Merge Workflow

```
Infisical Paths              Combined Output
───────────────              ───────────────
/shared              ┐
                     ├─ merge →  combined/orchestrator-mini.env
/machines/orch...    ┘

/shared              ┐
 ├─ merge → combined/
/machines/worker-3060┘

\[generate-combined-env.ps1]
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
cd C:\\Dev\\Projects\\Repos\\Project-Nyra\\infra\\machines

# Run collector script
.\\PC-INFO-COLLECTOR.ps1

# This generates machine-info.json with:
# - Hostname
# - Network IPs (Ethernet, WiFi, Tailscale)
# - MAC addresses
# - GPU information
# - System specs
```

### Step 3: Update .env Files

Take the values from `machine-info.json` and replace placeholders in:

* `worker-rtx5090.env` - Replace all `TO\_BE\_COLLECTED` values
* `worker-rtx3090ti.env` - Replace all `TO\_BE\_COLLECTED` values

### Step 4: Re-upload to Infisical

```powershell
# Re-run upload script
.\\upload-machines-to-infisical.ps1 -Verbose
```

## 🛠️ Script Reference

### upload-machines-to-infisical.ps1

**Purpose**: Parse machine-specific .env files and upload each variable to Infisical.

**Parameters**:

* `-DryRun` - Preview what would be uploaded without making changes
* `-Verbose` - Show detailed output for each variable

**Usage Examples**:

```powershell
# Test run (no uploads)
.\\upload-machines-to-infisical.ps1 -DryRun

# Upload with detailed logging
.\\upload-machines-to-infisical.ps1 -Verbose

# Production upload
.\\upload-machines-to-infisical.ps1
```

**What it does**:

1. Reads each machine's .env file
2. Parses variables (skips comments and empty lines)
3. Uploads to `/hosts/<pc-name>` path in Infisical
4. Reports success/failure counts
5. Skips `TO\_BE\_\*` placeholders in dry-run mode

**Output**:

```
📁 Uploading orchestrator-mini (orchestrator-mini.env)
   Found 67 variables
   Setting MACHINE\_HOSTNAME... ✓
   Setting MACHINE\_ROLE... ✓
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

* `-MachineRole <name>` - Generate only for specific machine
* `-OutputToFiles` - Write to `combined/` directory (otherwise just preview)

**Usage Examples**:

```powershell
# Preview orchestrator config (first 10 lines)
.\\generate-combined-env.ps1 -MachineRole "orchestrator-mini"

# Generate all combined files
.\\generate-combined-env.ps1 -OutputToFiles

.\\generate-combined-env.ps1 -MachineRole -OutputToFiles
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

ANTHROPIC\_API\_KEY=sk-ant-...
POSTGRES\_PASSWORD=...
...

# ==============================================================================
# MACHINE-SPECIFIC VARIABLES (from /hosts/orchestrator)
# ==============================================================================
# These override shared variables if there are conflicts

MACHINE\_HOSTNAME=orchestrator-mini
MACHINE\_ROLE=orchestrator
NEXUS\_ROUTER\_BIND=0.0.0.0:7000
...
```

## 🐛 Troubleshooting

### Issue: "INFISICAL\_ACCESS\_TOKEN not set"

**Solution**: Export token from Infisical `/shared`:

```powershell
cd C:\\Dev\\Projects\\Repos\\Project-Nyra\\infisical-path-plan-kit
infisical export --path="/shared" --format=dotenv-export | Invoke-Expression
```

### Issue: "Invalid secret path" errors

**Cause**: Git Bash path translation (converts `/shared` to `C:\\Program Files\\Git\\shared`)

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
infisical secrets set "TEST\_VAR" "test\_value" --path="/hosts/orchestrator" --env=dev --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef"
```

3. **Run upload script with verbose**:

```powershell
.\\upload-machines-to-infisical.ps1 -Verbose
```

### Issue: Combined .env missing variables

**Cause**: Variables not uploaded to Infisical yet

**Solution**: Run upload script first:

```powershell
.\\upload-machines-to-infisical.ps1
.\\generate-combined-env.ps1 -OutputToFiles
```

### Issue: Placeholders in production

**Cause**: PC3/PC4 not connected yet, still have `TO\_BE\_COLLECTED` values

**Solution**:

1. Connect PCs to Tailscale
2. Run `PC-INFO-COLLECTOR.ps1` on each PC
3. Update .env files with actual values
4. Re-run upload script

## 📋 Deployment Checklist

* \[ ] Export `INFISICAL\_ACCESS\_TOKEN` from `/shared`
* \[ ] Review machine-specific .env files for accuracy
* \[ ] Run upload script with `-DryRun` to preview
* \[ ] Upload machine configs to Infisical
* \[ ] Generate combined .env files
* \[ ] Copy combined .env to orchestrator-mini
* \[ ] Test orchestrator services start correctly
* \[ ] Test worker services start correctly
* \[ ] Verify Tailscale connectivity between PCs
* \[ ] Connect worker-rtx5090 to Tailscale (PC3)
* \[ ] Connect worker-rtx3090ti to Tailscale (PC4)
* \[ ] Collect actual values for PC3 and PC4
* \[ ] Update .env files with actual values
* \[ ] Re-upload machine configs for PC3/PC4
* \[ ] Deploy combined .env to PC3/PC4
* \[ ] Verify full cluster connectivity

## 🔐 Security Notes

1. **Never commit combined .env files** - They contain actual secrets
2. **Use `-DryRun` first** - Always preview before uploading
3. **Rotate Cloudflare tunnel tokens** - Set unique token per machine
4. **Keep Infisical token secure** - Never commit `INFISICAL\_ACCESS\_TOKEN`
5. **Review before deployment** - Check combined .env files for sensitive data

## 📚 Related Documentation

* **`../README.md`** - Parent directory overview and migration guide
* **`../../infra/machines/MACHINE-ENV-STRATEGY.md`** - Variable separation strategy
* **`../../infra/machines/README.md`** - Machine infrastructure documentation
* **`../../infra/cluster-setup/CURRENT-STATUS.md`** - Current cluster status
* **`../../configs/env/ENV-CONSOLIDATION-SUMMARY.md`** - Full environment variable catalog

## 🎯 Next Steps

1. **For PC1 \& PC2 (Already Connected)**:

   * Upload configs: `.\\upload-machines-to-infisical.ps1`
   * Generate combined: `.\\generate-combined-env.ps1 -OutputToFiles`
   * Deploy to machines
   * Test services
2. **For PC3 \& PC4 (Pending Connection)**:

   * Connect to Tailscale
   * Run `PC-INFO-COLLECTOR.ps1`
   * Update .env files with actual values
   * Re-upload to Infisical
   * Deploy to machines
3. **Ongoing**:

   * Monitor service health across cluster
   * Update secrets in Infisical (auto-propagates to combined .env)
   * Add new machines by creating new .env file and adding to scripts

