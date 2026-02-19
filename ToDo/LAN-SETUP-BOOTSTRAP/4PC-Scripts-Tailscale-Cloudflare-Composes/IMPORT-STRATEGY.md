# Smart Import Strategy

This document explains how `bulk-import-smart.ps1` intelligently routes your network secrets to the correct Infisical paths.

## Problem Solved

Your network export files contain **all** variables mixed together:
- Hardware specs (CPU_NAME, GPU_VRAM_GB)
- Network configuration (LAN_IPV4_ADDRESS, WIFI_MAC_ADDRESS)
- System IDs (PC_HOSTNAME, TAILSCALE_IPV4_ADDRESS)

**Goal**: Route each variable to its correct Infisical path based on intelligent detection.

## Solution: Prefix-Based Routing

### Route Detection Hierarchy

The script uses a **3-layer routing system**:

#### Layer 1: Prefix Matching (Highest Priority)
```
Variable Name          → Infisical Path
WORKER_RTX5090_*       → /machines/worker-rtx5090
WORKER_RTX3060_*       → /machines/worker-rtx3060
ORCHESTRATOR_*         → /machines/orchestrator
CLOUDFLARE_API_*       → /clients/cloudflare
REDIS_*                → /databases/redis
POSTGRES_*             → /databases/postgres
HF_TOKEN               → /providers/huggingface
NEXUS_*                → /router/nexus
```

#### Layer 2: Hostname/Source Detection
```
Source File: network-worker-rtx5090.env
If variable has no prefix:
  LAN_*     → /machines/worker-rtx5090
  WIFI_*    → /machines/worker-rtx5090
  HYPERV_*  → /machines/worker-rtx5090
```

#### Layer 3: Fallback to Shared
```
If no match found:
  → /shared/shared-base (default catch-all)
```

## Example: RTX 5090 Network Export

**Input File**: `network-worker-rtx5090.env`
```
PC_HOSTNAME=AREA51
LAN_IPV4_ADDRESS=192.168.1.234
WIFI_IPV4_ADDRESS=192.168.1.235
GPU_PRIMARY_VRAM_GB=48
```

**Routing Decision**:
```
PC_HOSTNAME
  → No prefix match
  → Source is "worker-rtx5090"
  → No hostname prefix match
  → Fallback: /shared/shared-base  ❌

LAN_IPV4_ADDRESS
  → Prefix "LAN_" matches
  → Source is "worker-rtx5090"
  → Route: /machines/worker-rtx5090  ✅

WIFI_IPV4_ADDRESS
  → Prefix "WIFI_" matches
  → Source is "worker-rtx5090"
  → Route: /machines/worker-rtx5090  ✅

GPU_PRIMARY_VRAM_GB
  → No prefix match
  → Source is "worker-rtx5090"
  → No hostname prefix match
  → Fallback: /shared/shared-base  ❌
```

## Path Organization Logic

### Shared Paths (Global)
```
/shared/shared-base
  ├─ LOG_LEVEL
  ├─ DEFAULT_TIMEOUT_S
  ├─ NYRA_STACK_NAME
  └─ (non-machine-specific defaults)

/shared/shared-network
  ├─ INTERNAL_NETWORK
  ├─ GATEWAY_*
  └─ DNS_*
```

### Machine Paths (Per-Machine)
```
/machines/orchestrator
  ├─ ORCHESTRATOR_IP
  ├─ ORCHESTRATOR_TAILSCALE_IP
  └─ ORCHESTRATOR_PORT

/machines/worker-rtx5090
  ├─ WORKER_RTX5090_IP
  ├─ WORKER_RTX5090_TAILSCALE_IP
  ├─ LAN_* (from network config)
  ├─ WIFI_* (from network config)
  └─ GPU_* (from network config)
```

### Service Paths (Per-Integration)
```
/clients/cloudflare
  ├─ CLOUDFLARE_API_TOKEN
  ├─ CLOUDFLARE_TUNNEL_ID
  └─ CLOUDFLARE_TUNNEL_TOKEN

/databases/redis
  ├─ REDIS_HOST
  ├─ REDIS_PORT
  ├─ REDIS_PASSWORD
  └─ REDIS_URL

/providers/anthropic
  ├─ ANTHROPIC_API_KEY
  └─ ANTHROPIC_BASE_URL
```

## Quote Handling

### Problem
Network exports might contain values with quotes:
```
VALUE="my value"
VALUE='my value'
ESCAPED_VALUE=\"quoted\"
```

### Solution
The script cleans all values automatically:

```powershell
function Format-SecretForInfisical {
    param([string]$Value)
    
    # Remove outer quotes
    $value = $value -replace '^["'']|["'']$', ''
    
    # Unescape JSON-style escaping
    $value = $value -replace '\\"', '"'
    $value = $value -replace '\\\\', '\'
    
    return $value
}
```

**Examples**:
```
Input:  VALUE="my secret"
Output: my secret

Input:  VALUE='{"key":"value"}'
Output: {"key":"value"}

Input:  PATH=C:\\Users\\Data
Output: C:\Users\Data
```

## Placeholder Filtering

Variables with placeholder values are **automatically skipped**:

```powershell
if ($value -match 'TO_BE_COLLECTED|PENDING|PLACEHOLDER') {
    # Skip this variable
    continue
}
```

**Examples of skipped values**:
```
TAILSCALE_IPV4_ADDRESS=TO_BE_COLLECTED
CLOUDFLARE_TUNNEL_ID=PENDING_INSTALLATION
POSTGRESQL_PASSWORD=PLACEHOLDER
```

This prevents incomplete data from entering Infisical.

## Execution Flow

### 1. Initialization
```
✅ Load paths-mapping.json
✅ Load routing table
✅ Cache or prompt for Project ID
```

### 2. Parsing Phase
```
For each .env file in network/exports/:
  ├─ Parse KEY=VALUE pairs
  ├─ Filter out comments
  ├─ Filter out placeholders
  ├─ Clean quotes/escaping
  └─ Store in memory
```

### 3. Routing Phase
```
For each parsed variable:
  ├─ Check prefix rules (Layer 1)
  ├─ Check source/hostname (Layer 2)
  ├─ Fallback to /shared/shared-base (Layer 3)
  └─ Group by destination path
```

### 4. Display Phase
```
Show organized summary:
  /machines/orchestrator: 15 secrets
  /machines/worker-rtx5090: 42 secrets
  /clients/cloudflare: 4 secrets
  ...
```

### 5. Confirmation
```
Ask user: Continue with import? (y/n)
```

### 6. Upload Phase
```
For each path:
  └─ For each secret in path:
      └─ Call: infisical secrets set --path=<path> --env=<env> KEY VALUE
```

## Dry Run Mode

Test the routing without uploading:

```powershell
.\bulk-import-smart.ps1 -Env dev -DryRun
```

**Output shows**:
```
[*] Organized by Infisical path:
  /clients/cloudflare : 4 secrets
  /databases/postgres : 6 secrets
  /machines/orchestrator : 12 secrets
  /machines/worker-rtx5090 : 38 secrets

[DRY RUN] Would set: REDIS_HOST = 100.115.69.115
[DRY RUN] Would set: POSTGRES_PASSWORD = ***
[DRY RUN] Would set: ORCHESTRATOR_IP = 192.168.1.232
...
```

## Multi-Environment Support

Upload the same routing to different environments:

```powershell
# dev environment
.\bulk-import-smart.ps1 -Env dev

# staging environment
.\bulk-import-smart.ps1 -Env staging

# prod environment
.\bulk-import-smart.ps1 -Env prod
```

Each environment maintains its own values. Use this when:
- **dev**: local IPs (192.168.1.x)
- **staging**: internal IPs (10.0.x.x)
- **prod**: public IPs / DNS names

## Troubleshooting

### Variables going to wrong path

Check the routing table in the script:
```powershell
$pathPrefixMap = @{
    '/machines/worker-rtx5090' = @('WORKER_RTX5090_', 'AREA51', 'LAN_', 'WIFI_', ...)
    ...
}
```

If you're seeing variables routed incorrectly:
1. Check if prefix exists in mapping
2. Add custom prefix to mapping if needed
3. Rerun import

### Some secrets missing

Check if they're being filtered as placeholders:
```
Run: .\bulk-import-smart.ps1 -Env dev -DryRun | grep "Skipping"
```

If skipped by mistake, edit the `.env` file to replace placeholder values.

### Different values per environment

Each environment is **independent**. After uploading to all 3 environments, you can edit individual paths per environment in Infisical UI:

```
Infisical UI:
  → Project: Nyra
    → Environment: dev
      → Path: /machines/orchestrator
        → ORCHESTRATOR_IP = 192.168.1.232  ✅
    → Environment: staging
      → Path: /machines/orchestrator
        → ORCHESTRATOR_IP = 10.20.30.232   ✅
    → Environment: prod
      → Path: /machines/orchestrator
        → ORCHESTRATOR_IP = 203.0.113.232  ✅
```

## Performance Notes

- **Parsing**: ~100ms per .env file
- **Routing**: ~1ms per variable
- **Upload**: ~200ms per secret (network dependent)

For ~150 secrets across 3 environments: ~2-3 minutes total.

## Next Steps After Import

1. **Verify in Infisical UI**:
   ```
   Infisical → Project → Secrets → Path → /machines/orchestrator
   Verify values are correct
   ```

2. **Set up Infisical Agent on each machine** (optional but recommended)

3. **Use Secret Imports** to reduce duplication:
   - Import `/shared/shared-base` into each `/machines/*` path
   - Edit only machine-specific overrides

4. **Test with docker-compose**:
   ```powershell
   infisical run -- docker compose up
   ```
