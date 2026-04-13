# Cloudflare Tunnel Setup Guide

## Overview

This guide explains how to set up Cloudflare tunnels for the Project Nyra distributed AI infrastructure. Each PC (orchestrator and workers) has a dedicated tunnel setup script with comprehensive error handling, logging, and rollback capabilities.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Network                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               Cloudflare Tunnel Service               │  │
│  └──────────────────────────────────────────────────────┘  │
└───┬──────────┬──────────┬──────────┬──────────────────────┘
    │          │          │          │
    │ HTTPS    │ HTTPS    │ HTTPS    │ HTTPS
    │          │          │          │
┌───▼─────┐ ┌─▼────────┐ ┌▼────────┐ ┌▼────────┐
│ Orch    │ │ Worker 1 │ │Worker 2 │ │Worker 3 │
│ Mini    │ │ RTX 3060 │ │RTX 5090 │ │RTX 3090Ti
└─────────┘ └──────────┘ └─────────┘ └─────────┘
```

## PC Configuration

| PC ID | Type | GPU | Tunnel Name | Worker ID | Service Port |
|-------|------|-----|-------------|-----------|--------------|
| orchestrator-mini | orchestrator | N/A | nyra-orchestrator | N/A | 8000 |
| worker-rtx3060 | worker | RTX 3060 | nyra-worker-1 | 1 | 8000 |
| worker-rtx5090 | worker | RTX 5090 | nyra-worker-2 | 2 | 8000 |
| worker-rtx3090ti | worker | RTX 3090Ti | nyra-worker-3 | 3 | 8000 |

## Prerequisites

### Required Software

1. **cloudflared** - Cloudflare Tunnel daemon
   ```bash
   # Linux
   wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb

   # macOS
   brew install cloudflared

   # Windows (via WSL)
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
   sudo chmod +x /usr/local/bin/cloudflared
   ```

2. **curl** - HTTP client
   ```bash
   sudo apt-get install curl  # Ubuntu/Debian
   brew install curl          # macOS
   ```

3. **jq** - JSON processor
   ```bash
   sudo apt-get install jq    # Ubuntu/Debian
   brew install jq            # macOS
   ```

4. **Docker & Docker Compose** - Container runtime
   ```bash
   # See official Docker documentation
   # https://docs.docker.com/engine/install/
   ```

5. **Infisical CLI** (orchestrator only)
   ```bash
   # Linux
   curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
   sudo apt-get update && sudo apt-get install -y infisical

   # macOS
   brew install infisical/get-cli/infisical
   ```

### Required Environment Variables

#### All PCs

Create a `.env` file or export these variables:

```bash
# Cloudflare API credentials
export CLOUDFLARE_API_TOKEN="your-cloudflare-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-cloudflare-account-id"
export CLOUDFLARE_ZONE_ID="your-cloudflare-zone-id"
export CLOUDFLARE_DOMAIN="yourdomain.com"
```

#### Orchestrator Only (Additional)

```bash
# Infisical credentials
export INFISICAL_TOKEN="your-infisical-token"
export INFISICAL_PROJECT_ID="your-infisical-project-id"
```

### Getting Cloudflare Credentials

1. **API Token**:
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create token with these permissions:
     - Account > Cloudflare Tunnel: Edit
     - Zone > DNS: Edit
     - Account > Account Settings: Read

2. **Account ID**:
   - Go to Cloudflare Dashboard → Select your domain
   - Scroll down to API section on the right sidebar
   - Copy Account ID

3. **Zone ID**:
   - Go to Cloudflare Dashboard → Select your domain
   - Scroll down to API section on the right sidebar
   - Copy Zone ID

### Getting Infisical Credentials (Orchestrator)

1. **Infisical Token**:
   - Log in to Infisical dashboard
   - Go to Project Settings → Access Tokens
   - Create a new service token with read/write permissions

2. **Project ID**:
   - Visible in the Infisical project settings
   - Or in the URL when viewing your project

## Script Locations

```
bootstrap/
├── orchestrator-mini/
│   └── scripts/
│       └── setup-cloudflare-tunnel.sh    # Orchestrator with Infisical
├── worker-rtx3060/
│   └── scripts/
│       └── setup-cloudflare-tunnel.sh    # Worker 1 (RTX 3060)
├── worker-rtx5090/
│   └── scripts/
│       └── setup-cloudflare-tunnel.sh    # Worker 2 (RTX 5090)
└── worker-rtx3090ti/
    └── scripts/
        └── setup-cloudflare-tunnel.sh    # Worker 3 (RTX 3090Ti)
```

## Setup Instructions

### 1. Orchestrator Setup (Run First)

The orchestrator script includes Infisical integration for centralized secret management.

```bash
# Navigate to orchestrator scripts directory
cd bootstrap/orchestrator-mini/scripts

# Set environment variables (or source .env file)
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_ZONE_ID="..."
export CLOUDFLARE_DOMAIN="yourdomain.com"
export INFISICAL_TOKEN="..."
export INFISICAL_PROJECT_ID="..."

# Run the setup script
./setup-cloudflare-tunnel.sh
```

**What it does:**
1. Creates/verifies Cloudflare tunnel: `nyra-orchestrator`
2. Generates tunnel token
3. Stores credentials in Infisical:
   - `CLOUDFLARED_TOKEN`
   - `CLOUDFLARE_TUNNEL_ID`
   - `CLOUDFLARE_TUNNEL_NAME`
4. Updates Docker Compose configuration
5. Configures DNS record: `nyra-orchestrator.yourdomain.com`
6. Validates tunnel connectivity
7. Creates local credentials files

### 2. Worker Setup (Run on Each Worker PC)

Worker scripts store credentials locally (they read from orchestrator's Infisical in production).

#### Worker 1 (RTX 3060)

```bash
cd bootstrap/worker-rtx3060/scripts

# Set environment variables
export CLOUDFLARE_API_TOKEN="..."
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_ZONE_ID="..."
export CLOUDFLARE_DOMAIN="yourdomain.com"

# Run the setup script
./setup-cloudflare-tunnel.sh
```

#### Worker 2 (RTX 5090)

```bash
cd bootstrap/worker-rtx5090/scripts

# Set environment variables (same as above)
export CLOUDFLARE_API_TOKEN="..."
# ... (other vars)

./setup-cloudflare-tunnel.sh
```

#### Worker 3 (RTX 3090Ti)

```bash
cd bootstrap/worker-rtx3090ti/scripts

# Set environment variables (same as above)
export CLOUDFLARE_API_TOKEN="..."
# ... (other vars)

./setup-cloudflare-tunnel.sh
```

## Script Features

### 1. Comprehensive Logging

All scripts create detailed log files with timestamps:

```bash
# Log location
bootstrap/<pc-id>/logs/cloudflare-tunnel-setup-<timestamp>.log

# Example
bootstrap/orchestrator-mini/logs/cloudflare-tunnel-setup-20260115_143022.log
```

### 2. Automatic Rollback

If any step fails, scripts automatically:
- Restore Docker Compose backups
- Log detailed error information
- Provide recovery instructions

### 3. Idempotent Operations

Scripts can be run multiple times safely:
- Checks if tunnel already exists before creating
- Updates existing DNS records instead of creating duplicates
- Preserves existing configurations

### 4. Credential Management

**Orchestrator:**
- Stores tokens in Infisical (centralized secret management)
- Creates local credentials files as backup

**Workers:**
- Store tokens in local `.env.tunnel` files
- Create Docker Compose override files
- Generate cloudflared config files

### 5. Configuration Files Generated

Each script creates:

```
bootstrap/<pc-id>/
├── config/
│   ├── .env.tunnel                    # Environment variables (workers only)
│   └── cloudflared/
│       ├── <tunnel-id>.json           # Tunnel credentials
│       └── config.yml                 # Cloudflared configuration
├── logs/
│   └── cloudflare-tunnel-setup-*.log  # Setup logs
└── backups/
    └── docker-compose.infisical.yml.*.bak  # Configuration backups
```

## Post-Setup Steps

### 1. Verify Tunnel Creation

Check Cloudflare dashboard:
```
https://dash.cloudflare.com/ → Zero Trust → Access → Tunnels
```

You should see:
- `nyra-orchestrator`
- `nyra-worker-1`
- `nyra-worker-2`
- `nyra-worker-3`

### 2. Verify DNS Records

Check your Cloudflare DNS settings:
```
https://dash.cloudflare.com/ → Your Domain → DNS → Records
```

You should see CNAME records:
- `nyra-orchestrator.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`
- `nyra-worker-1.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`
- `nyra-worker-2.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`
- `nyra-worker-3.yourdomain.com` → `<tunnel-id>.cfargotunnel.com`

### 3. Start Tunnels

#### Orchestrator

```bash
cd /path/to/Project-Nyra

# Start orchestrator with tunnel
docker compose --profile orchestrator --profile tunnels up -d

# Check status
docker compose ps
docker logs nyra-cloudflared-orchestrator
```

#### Workers

```bash
cd /path/to/Project-Nyra

# Worker 1
docker compose --profile worker-1 up -d

# Worker 2
docker compose --profile worker-2 up -d

# Worker 3
docker compose --profile worker-3 up -d
```

### 4. Test Connectivity

```bash
# Test orchestrator
curl https://nyra-orchestrator.yourdomain.com/health

# Test workers
curl https://nyra-worker-1.yourdomain.com/health
curl https://nyra-worker-2.yourdomain.com/health
curl https://nyra-worker-3.yourdomain.com/health
```

## Troubleshooting

### Issue: "Required command not found"

**Solution:**
Install missing dependencies. See [Prerequisites](#required-software).

### Issue: "Missing required environment variables"

**Solution:**
Ensure all environment variables are set:
```bash
# Check current environment
env | grep CLOUDFLARE
env | grep INFISICAL

# Or create a .env file
cat > .env <<EOF
CLOUDFLARE_API_TOKEN="..."
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_ZONE_ID="..."
CLOUDFLARE_DOMAIN="yourdomain.com"
INFISICAL_TOKEN="..."  # Orchestrator only
INFISICAL_PROJECT_ID="..."  # Orchestrator only
EOF

# Source it
source .env
```

### Issue: "Failed to create tunnel"

**Possible causes:**
1. Invalid API token or insufficient permissions
2. Tunnel name already exists
3. Network connectivity issues

**Solution:**
```bash
# Verify API token permissions
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

# List existing tunnels
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
```

### Issue: "Failed to store token in Infisical"

**Solution:**
```bash
# Verify Infisical CLI is installed
infisical --version

# Test Infisical authentication
infisical secrets list --projectId="${INFISICAL_PROJECT_ID}" --env=production

# Check token permissions in Infisical dashboard
```

### Issue: "Tunnel not connecting"

**Solution:**
```bash
# Check tunnel status
docker logs nyra-cloudflared-orchestrator

# Verify network connectivity
ping <tunnel-id>.cfargotunnel.com

# Restart tunnel
docker restart nyra-cloudflared-orchestrator

# Check cloudflared logs for errors
docker exec nyra-cloudflared-orchestrator cloudflared tunnel info
```

### Issue: "DNS resolution not working"

**Solution:**
```bash
# Check DNS propagation
nslookup nyra-orchestrator.yourdomain.com

# Force DNS cache clear
sudo systemd-resolve --flush-caches  # Linux
dscacheutil -flushcache               # macOS

# Wait for DNS propagation (can take up to 5 minutes)
```

## Security Best Practices

### 1. Protect Credentials

```bash
# Ensure .env files are not committed to git
echo "**/.env.tunnel" >> .gitignore
echo "**/config/cloudflared/*.json" >> .gitignore

# Set restrictive permissions
chmod 600 bootstrap/*/config/.env.tunnel
chmod 600 bootstrap/*/config/cloudflared/*.json
```

### 2. Use Infisical for Production

For production deployments:
- Store all tunnel tokens in Infisical (orchestrator handles this)
- Workers retrieve tokens at runtime via Infisical MCP
- Never commit tunnel tokens to version control

### 3. Rotate Credentials Regularly

```bash
# Regenerate tunnel token
# 1. Delete old token in Cloudflare dashboard
# 2. Re-run setup script to generate new token
# 3. Update Infisical with new token
# 4. Restart services
```

### 4. Monitor Tunnel Access

- Review Cloudflare Access logs regularly
- Set up alerts for unusual traffic patterns
- Monitor tunnel connection status

## Advanced Configuration

### Custom Service URLs

Modify the scripts to change service URLs:

```bash
# Edit the script
nano bootstrap/orchestrator-mini/scripts/setup-cloudflare-tunnel.sh

# Change SERVICE_URL
SERVICE_URL="http://custom-service:9000"

# Re-run the script
./setup-cloudflare-tunnel.sh
```

### Multiple Ingress Rules

Edit the generated `config.yml` to add multiple routes:

```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: nyra-orchestrator.yourdomain.com
    service: http://nyra-orchestrator:8000
  - hostname: api.yourdomain.com
    service: http://api-service:3000
  - hostname: admin.yourdomain.com
    service: http://admin-service:8080
  - service: http_status:404
```

### Custom DNS Configuration

For subdomain-specific configurations:

```bash
# Edit the tunnel routing configuration
# Modify the configure_tunnel_routing() function in the script

# Example: Add path-based routing
{
  "config": {
    "ingress": [
      {
        "hostname": "nyra-orchestrator.yourdomain.com",
        "path": "/api/*",
        "service": "http://api-service:3000"
      },
      {
        "hostname": "nyra-orchestrator.yourdomain.com",
        "service": "http://nyra-orchestrator:8000"
      },
      {
        "service": "http_status:404"
      }
    ]
  }
}
```

## Maintenance

### View Logs

```bash
# View setup logs
tail -f bootstrap/orchestrator-mini/logs/cloudflare-tunnel-setup-*.log

# View tunnel runtime logs
docker logs -f nyra-cloudflared-orchestrator
```

### Update Tunnel Configuration

```bash
# 1. Make changes to config files
nano bootstrap/orchestrator-mini/config/cloudflared/config.yml

# 2. Restart tunnel
docker restart nyra-cloudflared-orchestrator

# 3. Verify changes
docker logs nyra-cloudflared-orchestrator
```

### Delete Tunnels

```bash
# Delete via Cloudflare API
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"

# Or via Cloudflare dashboard
# Navigate to Zero Trust → Access → Tunnels → Delete
```

## Integration with Docker Compose

The setup scripts automatically configure Docker Compose to use the tunnels. The main `docker-compose.infisical.yml` includes:

```yaml
services:
  cloudflared-orchestrator:
    profiles: ["orchestrator", "tunnels"]
    image: cloudflare/cloudflared:latest
    container_name: nyra-cloudflared-orchestrator
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARED_TOKEN}
    command: tunnel run --url http://nyra-orchestrator:8000
    depends_on:
      - nyra-orchestrator
    networks:
      - nyra-network
    restart: unless-stopped
```

Tokens are injected via:
- **Orchestrator**: Infisical (retrieved at runtime)
- **Workers**: Local `.env.tunnel` files or Docker Compose overrides

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review script logs in `bootstrap/<pc-id>/logs/`
3. Check Cloudflare dashboard for tunnel status
4. Verify Docker container logs
5. Open an issue on the Project Nyra repository

## References

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflare API Documentation](https://api.cloudflare.com/)
- [Infisical Documentation](https://infisical.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Version:** 1.0
**Last Updated:** 2026-01-15
**Maintainer:** Project Nyra Team
