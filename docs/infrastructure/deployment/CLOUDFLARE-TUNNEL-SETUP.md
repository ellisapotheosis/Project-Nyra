# Cloudflare Tunnel Setup Guide

## Overview

The React GUI Installer now includes integrated Cloudflare Tunnel setup to expose services securely without port forwarding or VPN configuration.

## Features

- **Zero Trust Security**: All traffic routed through Cloudflare's network
- **No Port Forwarding**: No need to open firewall ports
- **Automatic SSL**: Built-in HTTPS encryption
- **DDoS Protection**: Cloudflare's network protects against attacks
- **Easy Remote Access**: Access services from anywhere with a URL

## Installation Flow

The Cloudflare Tunnel setup is integrated at phase 6 (after Docker setup):

1. Selection → 2. Environment → 3. Components → 4. MCP Servers → 5. Docker
6. **Cloudflare Tunnels** ← New phase
7. Configuration → 8. Shims → 9. Deployment → 10. Health Check → 11. Complete

## Components

### CloudflareTunnelSetup.tsx
Main orchestration component that manages the tunnel setup flow.

### TunnelConfigForm.tsx
Form for API token input, tunnel naming, and service selection.

### TunnelStatusDisplay.tsx
Displays active tunnel information, service URLs, and connection tests.

## Available Services by PC Type

### Common Services (All PCs)
- Claude Desktop (Port 3000)
- Docker API (Port 2375)
- SSH Access (Port 22)

### Orchestrator-Specific
- Gitea (Port 3300)
- n8n (Port 5678)

### Worker-Specific (GPU Workers)
- Ollama API (Port 11434)

## Usage

1. Enter Cloudflare API token (create at https://dash.cloudflare.com/profile/api-tokens)
2. Provide tunnel name
3. Select services to expose
4. Click "Configure Tunnel"
5. Test connections
6. Continue to next phase

## API Token Setup

Required permissions:
- Account: Cloudflare Tunnel (Read, Edit)
- Zone: DNS (Read, Edit) - optional for custom domains

## Files Created

- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\components\CloudflareTunnelSetup.tsx`
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\components\TunnelConfigForm.tsx`
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\components\TunnelStatusDisplay.tsx`
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\services\cloudflareTunnel.ts`

## Updated Files

- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\types\manifest.ts` - Added Cloudflare types
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\store\installStore.ts` - Added state management
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\App.tsx` - Integrated into flow
- `C:\Dev\Projects\Repos\Project-Nyra\bootstrap\installer\src\components\index.ts` - Added exports

## Troubleshooting

### Token Validation Failed
- Verify token has correct permissions
- Check token hasn't expired
- Create new token with Cloudflare Tunnel template

### Connection Tests Failing
- Verify services are running locally
- Check firewall rules
- Review tunnel logs

## References

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)
