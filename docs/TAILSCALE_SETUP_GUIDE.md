# Tailscale Endpoint Registration Guide

**Project**: Nyra GPU Cluster
**Date**: 2026-05-27
**Tailnet**: `trex-fiordland.ts.net`
**Executor**: Windows 11 PowerShell
**Status**: Ready for deployment

---

## Overview

This guide walks through registering all 129+ services across your Project Nyra GPU cluster in Tailscale with individual service endpoints (e.g., `letta-mcp.trex-fiordland.ts.net`, `quote-api.trex-fiordland.ts.net`) without requiring port numbers in the endpoint name.

**Key principle**: Each service gets its own DNS alias, making direct service-to-service communication seamless across hosts.

---

## Prerequisites

### Windows 11 Client Setup

1. **Tailscale Installed**

   ```powershell
   # Verify Tailscale is installed
   tailscale version

   # Expected output: Tailscale v1.XX.X ...
   ```

2. **Connected to Tailnet**

   ```powershell
   # Check connection status
   tailscale ip -4

   # Expected output: 100.64.x.x (your Windows 11 Tailscale IP)
   ```

3. **PowerShell 7.0+**

   ```powershell
   $PSVersionTable.PSVersion

   # Expected output: Major=7, Minor=x
   ```

### Repository Setup

- All scripts are in `/scripts/` directory
- Manifest file: `docs/TAILSCALE_REGISTRATION_MANIFEST.json`
- Tailscale IP mapping in `docs/TAILSCALE_MAGICDNS_ENDPOINT_MAPPING.md`

---

## Infrastructure Overview

### Hosts and Tailscale IPs

| Host                 | Tailscale IP | MagicDNS                               | Docker Context   |
| -------------------- | ------------ | -------------------------------------- | ---------------- |
| **oracle-vps**       | 100.64.0.3   | oracle-vps.trex-fiordland.ts.net       | oracle-vps       |
| **orchestrator**     | 100.64.0.10  | orchestrator.trex-fiordland.ts.net     | orchestrator     |
| **worker-rtx5090**   | 100.64.0.11  | worker-rtx5090.trex-fiordland.ts.net   | worker-rtx5090   |
| **worker-rtx3090ti** | 100.64.0.13  | worker-rtx3090ti.trex-fiordland.ts.net | worker-rtx3090ti |
| **worker-rtx3060**   | 100.64.0.12  | worker-rtx3060.trex-fiordland.ts.net   | worker-rtx3060   |
| **homeassistant**    | 100.64.0.2   | homeassistant.trex-fiordland.ts.net    | N/A              |
| **iphone**           | 100.64.0.4   | iphone.trex-fiordland.ts.net           | N/A              |

### Service Categories

**Oracle-VPS** (57 services):

- 17 MCP Servers (letta-mcp, mempalace-mcp, infisical-mcp, etc.)
- 4 Core APIs (quote-api, crm-api, nexus, litellm)
- 3 Memory Systems (letta, mem0, redis)
- 3 CRM/Data services (twenty-crm, twenty-db, supabase-kong)
- 3 Observability services (prometheus, grafana, loki)
- 2 Workflow services (n8n, activepieces)
- 6+ Application UIs

**Workers** (21 services each):

- vllm inference servers
- OpenClaw model runners
- Clawteam API endpoints
- Each service prefixed with hostname (e.g., vllm-5090, openclaw-3090ti)

---

## Registration Methods

### Method 1: Tailscale Admin Console (Recommended for Manual Setup)

1. **Login to Tailscale Admin Console**

   ```
   https://login.tailscale.com/admin/dns
   ```

2. **Navigate to DNS → Split DNS**

3. **For Each Service**:
   - Add DNS Rule
   - Domain: `service-name.trex-fiordland.ts.net`
   - Targets: `hostname.trex-fiordland.ts.net:port`

   **Example for letta-mcp**:
   - Domain: `letta-mcp.trex-fiordland.ts.net`
   - Targets: `oracle-vps.trex-fiordland.ts.net:8284`

4. **Save**

### Method 2: Tailscale API (Programmatic)

Requires API key from Tailscale account settings.

```powershell
# Set your API key
$apiKey = "tskey-..."

# Create DNS alias via API
$headers = @{
    Authorization = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

$body = @{
    name = "letta-mcp"
    description = "Letta MCP Server"
    target = "oracle-vps.trex-fiordland.ts.net:8284"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Method POST `
    -Uri "https://api.tailscale.com/v2/dns/preferred-routes" `
    -Headers $headers `
    -Body $body
```

### Method 3: PowerShell Registration Scripts

#### Step 1: Validate Setup

```powershell
cd C:\Users\YOUR_USERNAME\repos\project-nyra

# Run validation (tests connectivity, DNS, docker contexts)
.\scripts\Validate-TailscaleSetup.ps1
```

**Expected output**:

```
✓ Tailscale CLI installed
✓ Connected to tailnet
✓ Manifest file found
✓ DNS resolution tests
✓ Docker context validation
```

#### Step 2: Dry Run (Preview what will be registered)

```powershell
# Preview all registrations without making changes
.\scripts\Register-TailscaleEndpoints.ps1 -DryRun $true
```

**Expected output**:

```
[DRY RUN] Would register: letta-mcp.trex-fiordland.ts.net -> 100.64.0.3:8284 (mcp)
[DRY RUN] Would register: mempalace-mcp.trex-fiordland.ts.net -> 100.64.0.3:8002 (mcp)
...
```

#### Step 3: Register All Endpoints

```powershell
# Execute actual registration
.\scripts\Register-TailscaleEndpoints.ps1
```

#### Step 4: Test Connectivity (Optional)

```powershell
# Test connectivity to all registered endpoints
.\scripts\Register-TailscaleEndpoints.ps1 -TestConnectivity $true

# Or test specific host
.\scripts\Validate-TailscaleSetup.ps1 -HostFilter oracle-vps
```

---

## Verification Steps

### Test DNS Resolution

```powershell
# Test individual service resolution
nslookup letta-mcp.trex-fiordland.ts.net
nslookup quote-api.trex-fiordland.ts.net
nslookup vllm-5090.trex-fiordland.ts.net

# Expected output: Should resolve to Tailscale IP (100.64.x.x)
```

### Test TCP Connectivity

```powershell
# Test connection to service port
Test-NetConnection -ComputerName letta-mcp.trex-fiordland.ts.net -Port 8284

# Expected output: TcpTestSucceeded = True
```

### Test Service Health

```powershell
# HTTP endpoint test (example for quote-api)
$response = Invoke-WebRequest -Uri "http://quote-api.trex-fiordland.ts.net:7070/health"
$response.StatusCode  # Expected: 200

# Or using curl if available
curl -v http://quote-api.trex-fiordland.ts.net:7070/health
```

### Docker Context Validation

```powershell
# List all docker contexts
docker context ls

# Expected contexts:
# - oracle-vps
# - orchestrator
# - worker-rtx5090
# - worker-rtx3090ti
# - worker-rtx3060

# Use context to run commands
docker --context oracle-vps ps
```

---

## Service Endpoint Reference

### Oracle-VPS Services

**MCP Servers** (no port in endpoint):

```
letta-mcp.trex-fiordland.ts.net          → 100.64.0.3:8284
mempalace-mcp.trex-fiordland.ts.net      → 100.64.0.3:8002
infisical-mcp.trex-fiordland.ts.net      → 100.64.0.3:8766
twenty-mcp.trex-fiordland.ts.net         → 100.64.0.3:8400
codebase-index-mcp.trex-fiordland.ts.net → 100.64.0.3:8778
git-mcp.trex-fiordland.ts.net            → 100.64.0.3:8773
```

**Core APIs** (no port in endpoint):

```
quote-api.trex-fiordland.ts.net   → 100.64.0.3:7070
crm-api.trex-fiordland.ts.net     → 100.64.0.3:4001
nexus.trex-fiordland.ts.net       → 100.64.0.3:6000
litellm.trex-fiordland.ts.net     → 100.64.0.3:4000
```

**Management UIs**:

```
grafana-oracle.trex-fiordland.ts.net → 100.64.0.3:3003
prometheus-oracle.trex-fiordland.ts.net → 100.64.0.3:9090
twenty-crm.trex-fiordland.ts.net    → 100.64.0.3:3020
```

### Worker Services

**Worker-RTX5090** (multi-host prefix pattern):

```
vllm-5090.trex-fiordland.ts.net        → 100.64.0.11:8000
openclaw-5090.trex-fiordland.ts.net    → 100.64.0.11:8001
clawteam-5090.trex-fiordland.ts.net    → 100.64.0.11:8003
```

**Worker-RTX3090Ti**:

```
vllm-3090ti.trex-fiordland.ts.net      → 100.64.0.13:8000
openclaw-3090ti.trex-fiordland.ts.net  → 100.64.0.13:8001
```

**Worker-RTX3060**:

```
vllm-3060.trex-fiordland.ts.net        → 100.64.0.12:8000
openclaw-3060.trex-fiordland.ts.net    → 100.64.0.12:8001
```

---

## Infisical Secret Path Mapping

Each service has a corresponding Infisical path for secret management:

```
Pattern: /machines/{HOSTNAME}/{SERVICE_NAME}

Examples:
/machines/oracle-vps/letta-mcp
/machines/oracle-vps/quote-api
/machines/worker-rtx5090/vllm
/machines/orchestrator/clawteam
```

---

## Cloudflare Tunnel Integration

Most services tunnel via Cloudflare in addition to Tailscale:

**Cloudflare Tunnel Backends** (using MagicDNS):

```yaml
routes:
  - hostname: quote-api.ratehunter.net
    service: http://quote-api.trex-fiordland.ts.net:7070

  - hostname: crm-api.projectnyra.com
    service: http://crm-api.trex-fiordland.ts.net:4001

  - hostname: twenty.projectnyra.com
    service: http://twenty-crm.trex-fiordland.ts.net:3020
```

This allows:

1. **Internal access** via Tailscale MagicDNS (no port required)
2. **External access** via Cloudflare public domains (with authentication)

---

## Troubleshooting

### DNS Not Resolving

```powershell
# Check if Tailscale is connected
tailscale status

# Force MagicDNS refresh
tailscale up --accept-dns=true

# Check nameservers
ipconfig /all | grep -A 5 "DNS Servers"
```

### Can't Connect to Service

```powershell
# 1. Verify DNS resolution
nslookup service-name.trex-fiordland.ts.net

# 2. Check port is open on remote host
Test-NetConnection -ComputerName service-name.trex-fiordland.ts.net -Port 8284

# 3. Check Tailscale routing
tailscale routes

# 4. View Tailscale logs
# Windows: %USERPROFILE%\.local\share\Tailscale\logs
```

### Split DNS Not Working

```powershell
# Disable and re-enable MagicDNS
tailscale up --accept-dns=false
tailscale up --accept-dns=true

# Or check admin console at:
# https://login.tailscale.com/admin/dns
```

### Docker Context Issues

```powershell
# Verify context configuration
docker context inspect oracle-vps

# Should show:
# - Host: ssh://user@oracle-vps.trex-fiordland.ts.net
# - BuildKit: enabled

# Test context
docker --context oracle-vps ps
```

---

## Migration Checklist

- [x] Migrated old `oracle.trex-fiordland.ts.net` → `oracle-vps.trex-fiordland.ts.net`
- [x] Updated all 59 references in configuration files
- [x] Standardized docker contexts in Makefile
- [x] Created Tailscale endpoint mapping document
- [ ] Register all endpoints in Tailscale admin console OR via API
- [ ] Validate DNS resolution for all 129+ services
- [ ] Validate TCP connectivity tests
- [ ] Test Cloudflare tunnel backends
- [ ] Verify SSH connectivity via MagicDNS
- [ ] Update any environment variables referencing old hostnames (check Infisical)

---

## Quick Reference Commands

```powershell
# Validation
.\scripts\Validate-TailscaleSetup.ps1

# Dry run registration
.\scripts\Register-TailscaleEndpoints.ps1 -DryRun $true

# Test specific host
.\scripts\Validate-TailscaleSetup.ps1 -HostFilter oracle-vps

# Check Tailscale status
tailscale status
tailscale ip -4

# List docker contexts
docker context ls

# Test service
nslookup letta-mcp.trex-fiordland.ts.net
Test-NetConnection -ComputerName letta-mcp.trex-fiordland.ts.net -Port 8284
```

---

## Support & Documentation

- **Tailscale Admin**: https://login.tailscale.com/admin
- **Tailscale DNS Docs**: https://tailscale.com/kb/1081/magicdns
- **Project Nyra Docs**: See `/docs/MASTER_ARCHITECTURE.md`
- **Infrastructure Mapping**: See `docs/TAILSCALE_MAGICDNS_ENDPOINT_MAPPING.md`

---

**Last Updated**: 2026-05-27
**Status**: Ready for production registration
