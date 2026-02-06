# Project Nyra - 4-PC Cluster Setup Guide

## Overview

This guide covers setting up the Project Nyra 4-PC LAN cluster with:
- **Tailscale**: Secure mesh VPN for inter-PC communication
- **Cloudflared**: Cloudflare Tunnel for exposing services to the internet
- **Ollama**: Local LLM inference on GPU workers

## Cluster Architecture

Based on CLAUDE.md specifications:

| PC Name | Role | GPU | VRAM | Purpose |
|---------|------|-----|------|---------|
| **orchestrator-mini** | Coordinator | Integrated | 2-8GB | Claude Flow, n8n, TwentyCRM, coordination |
| **worker-5090** | Primary Worker | RTX 5090 | 48GB | DeepSeek-R1 236B, Qwen 2.5 72B |
| **worker-3090** | Secondary Worker | RTX 3090 Ti | 24GB | Llama 3.1 70B, Mistral Large 123B |
| **worker-3060** | Tertiary Worker | RTX 3060 | 12GB | CodeLlama 34B, Qwen 32B, Gemma 2 27B |

### Current Status (As of 2026-01-22)

**Connected PCs (2/4)**:
1. ✅ **AlienApotheosis** (worker-rtx3060)
   - Hostname: `AlienApotheosis`
   - Model: Alienware m15 R7
   - GPU: RTX 3060 Laptop (12GB VRAM)
   - Tailscale IP: `100.83.23.49`
   - LAN IP: `192.168.1.221` (Wi-Fi)
   - Status: Tailscale connected, Cloudflared installed

2. ✅ **orchestrator-mini**
   - Tailscale IP: `100.115.69.115`
   - Status: Tailscale connected (idle)
   - Note: Need to verify Ollama installation

**Missing PCs (2/4)**:
3. ❓ **worker-5090** (RTX 5090)
   - Status: Not yet connected to Tailscale
   - Action needed: Install Tailscale, configure Ollama

4. ❓ **worker-3090** (RTX 3090 Ti)
   - Status: Not yet connected to Tailscale
   - Action needed: Install Tailscale, configure Ollama

## Network Configuration

### Tailscale (Mesh VPN)

**Tailnet**: `tail558973.ts.net`
**MagicDNS**: Enabled

Each PC gets:
- A unique `100.x.x.x` IP address
- MagicDNS hostname: `<hostname>.tail558973.ts.net`
- Automatic WireGuard-encrypted peer-to-peer connections

### Cloudflare Tunnels

**Existing Tunnels**:
- `M15R7` (ID: 1dd404f8-31e0-4c56-bf3f-6befde8d5c1d)
- `Project-Nyra-CF-Tunnel` (ID: 505504bb-c6c6-46d7-b713-3ee0f8fba1ee)
- `mcp-github` (ID: 8e8a44e0-204a-4333-843e-5e6300fd8f79)
- `worker-rtx3060` (ID: 33d0dc8b-4a1f-4f31-b482-5309171ffdf8)

**Note**: None of these tunnels are currently active (0 connections)

## Step-by-Step Setup

### Phase 1: Information Gathering

**Run on each PC** to collect network information:

```powershell
# Navigate to the cluster setup directory
cd C:\Dev\Projects\Repos\Project-Nyra\infra\cluster-setup

# Run the info collector (saves output to file)
.\PC-INFO-COLLECTOR.ps1
```

This creates a file `PC-INFO-<hostname>-<timestamp>.txt` with:
- Hostname and user
- GPU information
- Network interfaces (IP, MAC addresses)
- Tailscale status
- Cloudflared status
- Ollama status

**Collect this file from all 4 PCs** before proceeding to Phase 2.

### Phase 2: Tailscale Installation (All PCs)

#### On Windows PCs:

1. **Install Tailscale**:
   ```powershell
   # Option 1: Using scoop (recommended)
   scoop install tailscale

   # Option 2: Download installer from https://tailscale.com/download/windows
   ```

2. **Login and connect**:
   ```powershell
   tailscale login
   # Opens browser for authentication

   # Verify connection
   tailscale status
   tailscale ip -4
   ```

3. **Enable features**:
   ```powershell
   # Enable MagicDNS (should be auto-enabled)
   # Enable subnet routing if needed
   tailscale up --accept-routes
   ```

#### Verify all PCs are connected:

```bash
# On any PC in the tailnet
tailscale status

# Should show all 4 PCs:
# 100.x.x.x  orchestrator-mini   ...
# 100.x.x.x  worker-5090         ...
# 100.x.x.x  worker-3090         ...
# 100.x.x.x  worker-rtx3060      ...
```

### Phase 3: Cloudflared Setup

#### Install on all PCs:

```powershell
# Windows (scoop)
scoop install cloudflared

# Verify
cloudflared --version
```

#### Authenticate (ONLY on orchestrator-mini):

```bash
# Login to Cloudflare (opens browser)
cloudflared tunnel login

# This creates ~/.cloudflared/cert.pem
```

#### Create tunnels for each PC:

**On orchestrator-mini**, create a tunnel for each PC:

```bash
# Create tunnel for orchestrator
cloudflared tunnel create orchestrator-mini

# Create tunnel for each worker
cloudflared tunnel create worker-5090
cloudflared tunnel create worker-3090
cloudflared tunnel create worker-3060

# List all tunnels
cloudflared tunnel list
```

#### Copy tunnel credentials to each PC:

```bash
# Copy the tunnel JSON file to each respective PC
# Example: Copy orchestrator-mini's JSON to orchestrator
# Copy worker-5090's JSON to worker-5090, etc.

# Location: ~/.cloudflared/<tunnel-id>.json
```

### Phase 4: Ollama Installation (GPU Workers)

Install Ollama on all 3 GPU workers:

```powershell
# Download and install from https://ollama.ai/download/windows

# Verify installation
ollama --version

# Ollama will automatically start on port 11434
```

#### Pull models based on VRAM:

**worker-5090 (48GB VRAM)**:
```bash
ollama pull deepseek-r1:236b
ollama pull qwen2.5:72b
```

**worker-3090 (24GB VRAM)**:
```bash
ollama pull llama3.1:70b
ollama pull mistral-large:123b
```

**worker-3060 (12GB VRAM)**:
```bash
ollama pull codellama:34b
ollama pull qwen2.5:32b
ollama pull gemma2:27b
```

### Phase 5: Service Configuration

#### Configure Cloudflared tunnels for Ollama:

Create `~/.cloudflared/config.yaml` on **each GPU worker**:

**worker-5090**:
```yaml
tunnel: <worker-5090-tunnel-id>
credentials-file: ~/.cloudflared/<worker-5090-tunnel-id>.json

ingress:
  - hostname: worker-5090.ratehunter.net
    service: http://localhost:11434
  - service: http_status:404
```

**worker-3090**:
```yaml
tunnel: <worker-3090-tunnel-id>
credentials-file: ~/.cloudflared/<worker-3090-tunnel-id>.json

ingress:
  - hostname: worker-3090.ratehunter.net
    service: http://localhost:11434
  - service: http_status:404
```

**worker-3060**:
```yaml
tunnel: <worker-3060-tunnel-id>
credentials-file: ~/.cloudflared/<worker-3060-tunnel-id>.json

ingress:
  - hostname: worker-3060.ratehunter.net
    service: http://localhost:11434
  - service: http_status:404
```

#### Start the tunnels:

```bash
# On each worker, run:
cloudflared tunnel run <tunnel-name>

# Or install as a service:
cloudflared service install
```

### Phase 6: Testing & Validation

#### Test Tailscale connectivity:

```bash
# From any PC, ping all others
tailscale ping 100.115.69.115  # orchestrator-mini
tailscale ping <worker-5090-ip>
tailscale ping <worker-3090-ip>
tailscale ping 100.83.23.49     # worker-3060

# Test Ollama via Tailscale
curl http://<worker-ip>.tail558973.ts.net:11434/api/tags
```

#### Test Cloudflared tunnels:

```bash
# From anywhere on the internet (once DNS is configured)
curl https://worker-5090.ratehunter.net/api/tags
curl https://worker-3090.ratehunter.net/api/tags
curl https://worker-3060.ratehunter.net/api/tags
```

#### Test LLM inference:

```bash
# Via Tailscale (local)
curl http://worker-5090.tail558973.ts.net:11434/api/generate -d '{
  "model": "deepseek-r1:236b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'

# Via Cloudflare Tunnel (public)
curl https://worker-5090.ratehunter.net/api/generate -d '{
  "model": "deepseek-r1:236b",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

## Nexus Router Configuration

Configure Nexus Router to route to all Ollama workers:

**Location**: `infra/docker/docker-compose.orchestration.yml`

Add environment variables for each worker:

```yaml
services:
  nexus:
    environment:
      - OLLAMA_WORKER_5090=http://worker-5090.tail558973.ts.net:11434
      - OLLAMA_WORKER_3090=http://worker-3090.tail558973.ts.net:11434
      - OLLAMA_WORKER_3060=http://worker-3060.tail558973.ts.net:11434
```

Or configure in Nexus settings to load balance across workers.

## Troubleshooting

### Tailscale issues:

```bash
# Check status
tailscale status

# Restart
tailscale down
tailscale up

# Check DNS
nslookup orchestrator-mini.tail558973.ts.net
```

### Cloudflared issues:

```bash
# Check tunnel status
cloudflared tunnel info <tunnel-name>

# Check running tunnels
cloudflared tunnel list

# View logs
cloudflared tunnel run <tunnel-name> --loglevel debug
```

### Ollama issues:

```bash
# Check if running
curl http://localhost:11434/api/tags

# View logs (Windows)
# Check Event Viewer or Ollama app

# Restart service
# Stop and start Ollama application
```

## Security Considerations

1. **Tailscale ACLs**: Configure access control lists in Tailscale admin console
2. **Cloudflared Authentication**: Add Cloudflare Access for protected endpoints
3. **Firewall**: Windows Firewall should allow Tailscale and Ollama ports
4. **API Keys**: Store API keys in Infisical (already configured in Project Nyra)

## Next Steps

After cluster setup is complete:

1. Configure Nexus Router for intelligent LLM routing
2. Set up Claude Flow swarm coordination
3. Configure n8n workflows to use GPU workers
4. Test end-to-end mortgage workflows
5. Set up monitoring (Prometheus + Grafana)

## Reference

- Tailscale docs: https://tailscale.com/kb/
- Cloudflared docs: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/
- Ollama docs: https://github.com/ollama/ollama/blob/main/docs/
- Project Nyra Architecture: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
