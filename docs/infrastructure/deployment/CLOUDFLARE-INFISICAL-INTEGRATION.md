# Cloudflare Tunnel Integration with Infisical

Comprehensive guide for managing Cloudflare tunnel secrets using Infisical in Project Nyra's distributed 4-PC cluster.

## Overview

This integration provides secure, centralized management of Cloudflare tunnel tokens across all nodes in the Project Nyra infrastructure. Secrets are stored in Infisical and automatically injected into services using the sidecar pattern.

### Key Features

- **Zero Plaintext Storage**: Tunnel tokens never stored in plaintext in git or filesystems
- **Automatic Secret Injection**: Infisical agents automatically inject secrets into containers
- **Centralized Management**: Single source of truth for all tunnel configurations
- **Rotation Support**: Easy secret rotation without service restarts
- **Audit Logging**: Complete audit trail of secret access
- **Multi-Environment**: Support for development, staging, and production environments

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Infisical Server                         │
│  (Centralized Secret Management)                            │
│                                                              │
│  Paths:                                                      │
│  /nyra/orchestrator     → Orchestrator tunnel token         │
│  /nyra/worker-rtx5090   → Worker RTX 5090 tunnel token     │
│ /nyra/ → Worker RTX 3060 tunnel token │
│  /nyra/worker-rtx3090ti → Worker RTX 3090Ti tunnel token   │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┬───────────────────┬──────────┐
       │                       │                   │          │
       ▼                       ▼                   ▼          ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐  ...
│ Agent        │     │ Agent        │    │ Agent        │
│ Orchestrator │     │ RTX 5090     │    │ RTX 3060     │
│              │     │              │    │              │
│ Injects →    │     │ Injects →    │    │ Injects →    │
│ /secrets/    │     │ /secrets/    │    │ /secrets/    │
└──────┬───────┘     └──────┬───────┘    └──────┬───────┘
       │                    │                   │
       ▼                    ▼                   ▼
┌──────────────┐     ┌──────────────┐    ┌──────────────┐
│ Cloudflared  │     │ Cloudflared  │    │ Cloudflared  │
│ Tunnel       │     │ Tunnel       │    │ Tunnel       │
│ Orchestrator │     │ Worker 1     │    │ Worker 2     │
└──────────────┘     └──────────────┘    └──────────────┘
```

## Prerequisites

### 1. Infisical Server

Ensure Infisical server is running:

```bash
docker-compose up -d infisical
```

Verify it's accessible:

```bash
curl http://localhost:8080/api/status
```

### 2. Infisical CLI

Install the Infisical CLI:

**macOS:**

```bash
brew install infisical/get-cli/infisical
```

**Linux:**

```bash
curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo -E bash
sudo apt-get install infisical
```

**Windows:**

```powershell
scoop bucket add infisical https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

### 3. Cloudflare Tunnel Tokens

Create Cloudflare tunnels for each node:

```bash
# Login to Cloudflare
cloudflared login

# Create tunnels
cloudflared tunnel create nyra-orchestrator
cloudflared tunnel create nyra-worker-rtx5090
cloudflared tunnel create nyra-
cloudflared tunnel create nyra-worker-rtx3090ti

# Get tunnel tokens (these will be stored in Infisical)
cloudflared tunnel token nyra-orchestrator
cloudflared tunnel token nyra-worker-rtx5090
cloudflared tunnel token nyra-
cloudflared tunnel token nyra-worker-rtx3090ti
```

### 4. Infisical Authentication

Create service accounts in Infisical for each service:

1. Navigate to Infisical dashboard: http://localhost:8080
2. Go to Project Settings → Service Accounts
3. Create service accounts:
   - `orchestrator-cloudflare`
   - `worker-rtx5090-cloudflare`
   - `worker-rtx3090ti-cloudflare`
4. Save the Client ID and Client Secret for each

## Setup Guide

### Step 1: Configure Environment Variables

Create `.env` file with Infisical credentials:

```bash
# Infisical Server Configuration
INFISICAL_PROJECT_ID=8374cea9-e5e8-4050-bda4-b91f25ab30ef
INFISICAL_ENV=production

# Orchestrator Infisical Credentials
INFISICAL_CLIENT_ID_ORCHESTRATOR=your-orchestrator-client-id
INFISICAL_CLIENT_SECRET_ORCHESTRATOR=your-orchestrator-client-secret

# Worker RTX 5090 Infisical Credentials
INFISICAL_CLIENT_ID_WORKER_RTX5090=your-worker-rtx5090-client-id
INFISICAL_CLIENT_SECRET_WORKER_RTX5090=your-worker-rtx5090-client-secret

# Worker RTX 3060 Infisical Credentials

# Worker RTX 3090Ti Infisical Credentials
INFISICAL_CLIENT_ID_WORKER_RTX3090TI=your-worker-rtx3090ti-client-id
INFISICAL_CLIENT_SECRET_WORKER_RTX3090TI=your-worker-rtx3090ti-client-secret
```

### Step 2: Store Cloudflare Tunnel Tokens

**Option A: Using Environment File**

Create `.env.cloudflare` (DO NOT COMMIT TO GIT):

```bash
# Orchestrator
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=eyJhIjoiYWJj...
CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR=nyra-orchestrator

# Worker RTX 5090
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090=eyJhIjoiZGVm...
CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090=nyra-worker-rtx5090

# Worker RTX 3060

# Worker RTX 3090Ti
CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX3090TI=eyJhIjoiamts...
CLOUDFLARE_TUNNEL_NAME_WORKER_RTX3090TI=nyra-worker-rtx3090ti
```

Run the storage script:

```bash
# Set Infisical token
export INFISICAL_TOKEN=$(infisical login)

# Store tokens
./scripts/infisical/store-cloudflare-tokens.sh production
```

**Option B: Interactive Mode**

If you don't have a `.env.cloudflare` file:

```bash
export INFISICAL_TOKEN=$(infisical login)
./scripts/infisical/store-cloudflare-tokens.sh production
```

The script will prompt you to enter each token interactively.

### Step 3: Validate Token Storage

Verify tokens are properly stored and accessible:

```bash
./scripts/infisical/validate-cloudflare-tokens.sh production --verbose
```

Expected output:

```
╔═══════════════════════════════════════════════════════════════════════╗
║   Project Nyra - Cloudflare Tunnel Token Validation                  ║
╚═══════════════════════════════════════════════════════════════════════╝

[INFO] Checking prerequisites...
[✓] Infisical CLI found: infisical version 0.8.0
[✓] INFISICAL_TOKEN is set
[✓] Docker found: Docker version 24.0.5

Environment: production
Verbose: true

[INFO] Validating secrets in Infisical...

Checking orchestrator...
[✓] orchestrator: CLOUDFLARE_TUNNEL_TOKEN exists
[✓] orchestrator: Token format is valid
[✓] orchestrator: CLOUDFLARE_TUNNEL_NAME exists
[✓] orchestrator: Agent config file is valid
[✓] orchestrator: Agent container is running
[✓] orchestrator: Secrets volume exists

...

╔═══════════════════════════════════════════════════════════════╗
║              Validation Summary Report                        ║
╚═══════════════════════════════════════════════════════════════╝

Environment:      production
Total Checks:     24
Passed:           24
Failed:           0
Warnings:         0

✓ All critical validations passed!
```

### Step 4: Deploy Services

Start the Cloudflare tunnel services:

```bash
# Start base infrastructure (if not already running)
docker-compose up -d

# Start Cloudflare tunnel integration
docker-compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d
```

Verify all services are running:

```bash
docker-compose ps
```

### Step 5: Verify Tunnel Connectivity

Check tunnel status for each node:

```bash
# Check orchestrator tunnel
docker logs nyra-cloudflared-orchestrator

# Check worker tunnels
docker logs nyra-cloudflared-worker-rtx5090
docker logs nyra-cloudflared-
docker logs nyra-cloudflared-worker-rtx3090ti
```

Look for messages like:

```
INF Connection established connIndex=0
INF Registered tunnel connection
```

## Secret Rotation

### Manual Rotation

1. Generate new tunnel token in Cloudflare dashboard
2. Update token in Infisical:
   ```bash
   infisical secrets set \
     --env=production \
     --path=/nyra/orchestrator \
     CLOUDFLARE_TUNNEL_TOKEN=new-token-here
   ```
3. Restart the Infisical agent to reload secrets:
   ```bash
   docker restart nyra-agent-cloudflare-orchestrator
   ```
4. Restart the tunnel service:
   ```bash
   docker restart nyra-cloudflared-orchestrator
   ```

### Automated Rotation

The schema includes rotation policies. To enable automated rotation:

1. Configure rotation interval in Infisical dashboard
2. Set up webhook notifications
3. Implement rotation script (example in `scripts/infisical/rotate-cloudflare-tokens.sh`)

## Troubleshooting

### Issue: Tunnel Fails to Connect

**Symptoms:**

- Cloudflared container keeps restarting
- Logs show "authentication failed"

**Solutions:**

1. Verify token format:
   ```bash
   ./scripts/infisical/validate-cloudflare-tokens.sh production
   ```
2. Check Infisical agent logs:
   ```bash
   docker logs nyra-agent-cloudflare-orchestrator
   ```
3. Manually test token:
   ```bash
   docker run --rm cloudflare/cloudflared:latest tunnel run --token YOUR_TOKEN
   ```

### Issue: Infisical Agent Not Injecting Secrets

**Symptoms:**

- `/secrets/cloudflare.env` file not created
- Cloudflared logs show "missing token"

**Solutions:**

1. Check agent configuration:
   ```bash
   cat bootstrap/configs/infisical/agent-orchestrator.yaml
   ```
2. Verify Infisical server is accessible:
   ```bash
   docker exec nyra-agent-cloudflare-orchestrator curl http://nyra-infisical:8080/api/status
   ```
3. Check volume permissions:
   ```bash
   docker exec nyra-agent-cloudflare-orchestrator ls -la /secrets/
   ```

### Issue: Token Format Validation Fails

**Symptoms:**

- Validation script reports "Token format may be invalid"

**Solutions:**

1. Ensure token is base64-encoded
2. Check for extra whitespace or newlines
3. Regenerate token from Cloudflare:
   ```bash
   cloudflared tunnel token nyra-orchestrator
   ```

## Security Best Practices

1. **Never Commit Secrets**: Ensure `.env.cloudflare` is in `.gitignore`
2. **Rotate Regularly**: Set up 90-day rotation schedule
3. **Audit Access**: Monitor Infisical audit logs
4. **Restrict Permissions**: Use least-privilege service accounts
5. **Encrypt at Rest**: Enable Infisical encryption at rest
6. **Use TLS**: Always use TLS for Infisical communication
7. **Backup Secrets**: Regular Infisical database backups
8. **Monitor Tunnels**: Set up alerts for tunnel disconnections

## File Structure

```
Project-Nyra/
├── bootstrap/
│   └── configs/
│       └── infisical/
│           ├── cloudflare-secrets-schema.json
│           ├── agent-orchestrator.yaml
│           ├── agent-worker-rtx5090.yaml
│ ├── agent-
│           └── agent-worker-rtx3090ti.yaml
├── scripts/
│   └── infisical/
│       ├── store-cloudflare-tokens.sh
│       └── validate-cloudflare-tokens.sh
├── docker-compose.yml
├── docker-compose.cloudflare.yml
└── .env (with Infisical credentials)
```

## Environment Variable Reference

| Variable                    | Description                                   | Required |
| --------------------------- | --------------------------------------------- | -------- |
| `INFISICAL_PROJECT_ID`      | Infisical project UUID                        | Yes      |
| `INFISICAL_ENV`             | Environment (production/development)          | Yes      |
| `INFISICAL_CLIENT_ID_*`     | Service account client ID                     | Yes      |
| `INFISICAL_CLIENT_SECRET_*` | Service account client secret                 | Yes      |
| `CLOUDFLARE_TUNNEL_TOKEN_*` | Cloudflare tunnel token (stored in Infisical) | Yes      |
| `CLOUDFLARE_TUNNEL_NAME_*`  | Tunnel name                                   | No       |
| `CLOUDFLARE_TUNNEL_ID_*`    | Tunnel UUID                                   | No       |
| `CLOUDFLARE_ACCOUNT_ID`     | Cloudflare account ID                         | No       |
| `CLOUDFLARE_ZONE_ID`        | Cloudflare zone ID                            | No       |

## API Endpoints

### Infisical Agent Health Check

```bash
curl http://localhost:8080/api/status
```

### Check Secret Availability

```bash
docker exec nyra-agent-cloudflare-orchestrator cat /secrets/cloudflare.env
```

## Monitoring

### Metrics

Cloudflared tunnels expose metrics on port 2000:

```bash
# Add to docker-compose.cloudflare.yml for each tunnel
ports:
  - "2000:2000"

# Query metrics
curl http://localhost:2000/metrics
```

### Logging

All components log to stdout. Collect logs with:

```bash
# View all tunnel logs
docker-compose logs -f cloudflared-orchestrator cloudflared-worker-rtx5090

# View Infisical agent logs
docker-compose logs -f agent-cloudflare-orchestrator
```

## References

- [Infisical Documentation](https://infisical.com/docs)
- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Project Nyra Infrastructure Guide](./INFRASTRUCTURE_STATUS.md)

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review Infisical server logs
3. Check Cloudflare tunnel dashboard
4. Contact Project Nyra infrastructure team
