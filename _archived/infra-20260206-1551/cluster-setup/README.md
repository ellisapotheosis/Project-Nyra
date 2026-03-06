# Project Nyra - Cluster Setup Scripts

This directory contains scripts and documentation for setting up the Project Nyra 4-PC GPU cluster with Tailscale mesh VPN and Cloudflare tunnels.

## Quick Start

### 1. Gather Information from All PCs

Run on **each of the 4 PCs**:

```powershell
cd C:\Dev\Projects\Repos\Project-Nyra\infra\cluster-setup
.\PC-INFO-COLLECTOR.ps1
```

This saves a file `PC-INFO-<hostname>-<timestamp>.txt` with network details.

### 2. Review the Setup Guide

Read the complete setup guide:
- **[CLUSTER-SETUP-GUIDE.md](./CLUSTER-SETUP-GUIDE.md)** - Step-by-step instructions

### 3. Install Tailscale on All PCs

```powershell
scoop install tailscale
tailscale login
tailscale status
```

### 4. Test Connectivity

After all PCs are connected to Tailscale:

```powershell
.\TEST-CLUSTER-CONNECTIVITY.ps1 -Verbose
```

### 5. Configure Cloudflared Tunnels

Follow Phase 3-5 in the [CLUSTER-SETUP-GUIDE.md](./CLUSTER-SETUP-GUIDE.md).

## Files

| File | Purpose |
|------|---------|
| `CLUSTER-SETUP-GUIDE.md` | Complete setup documentation |
| `PC-INFO-COLLECTOR.ps1` | Gather network info from each PC |
| `TEST-CLUSTER-CONNECTIVITY.ps1` | Test connectivity between all PCs |
| `cloudflared-config-template.yaml` | Template for cloudflared configuration |

## Current Status

**As of 2026-01-22**:

✅ **Connected (2/4)**:
- `orchestrator-mini` (100.115.69.115)
- `worker-rtx3060` (100.83.23.49) - Current PC (AlienApotheosis)

❓ **Not Connected (2/4)**:
- `worker-5090` (RTX 5090, 48GB VRAM)
- `worker-3090` (RTX 3090 Ti, 24GB VRAM)

## Next Steps

1. **Install Tailscale** on worker-5090 and worker-3090
2. **Run PC-INFO-COLLECTOR.ps1** on all 4 PCs
3. **Update IP addresses** in TEST-CLUSTER-CONNECTIVITY.ps1
4. **Configure Ollama** on all 3 GPU workers
5. **Set up Cloudflared tunnels** following the guide
6. **Test end-to-end** connectivity

## Architecture Reference

See `CLAUDE.md` for the complete Project Nyra architecture and:
- GPU worker specifications
- LLM model distribution
- Nexus Router configuration
- Memory system integration

## Support

For issues, see:
- Tailscale KB: https://tailscale.com/kb/
- Cloudflared docs: https://developers.cloudflare.com/cloudflare-one/
- Project Nyra whitepaper: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/`
