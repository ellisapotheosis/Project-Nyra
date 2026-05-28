# Cloudflare Tunnel + Infisical - Quick Start Guide

5-minute setup guide for Cloudflare tunnel integration with Infisical secret management.

## Prerequisites Checklist

- [ ] Docker and Docker Compose installed
- [ ] Infisical server running (`docker-compose up -d infisical`)
- [ ] Cloudflare account with tunnel access
- [ ] Infisical CLI installed

## Quick Setup (5 Steps)

### Step 1: Install Infisical CLI (30 seconds)

**macOS:**

```bash
brew install infisical/get-cli/infisical
```

**Linux:**

```bash
curl -1sLf https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh | sudo -E bash
sudo apt-get install infisical
```

### Step 2: Create Cloudflare Tunnels (2 minutes)

```bash
# Login to Cloudflare
cloudflared login

# Create tunnels (adjust names as needed)
cloudflared tunnel create nyra-orchestrator
cloudflared tunnel create nyra-worker-rtx5090
cloudflared tunnel create nyra-worker-rtx3060
cloudflared tunnel create nyra-worker-rtx3090ti
```

### Step 3: Setup Infisical Service Accounts (1 minute)

1. Open Infisical dashboard: http://localhost:8080
2. Go to **Project Settings** → **Service Accounts**
3. Create 4 service accounts:
   - `orchestrator-cloudflare`
   - `worker-rtx5090-cloudflare`
   - `worker-rtx3060-cloudflare`
   - `worker-rtx3090ti-cloudflare`
4. Copy Client ID and Client Secret for each

### Step 4: Configure Environment (30 seconds)

Create `.env` file with your service account credentials:

```bash
# Copy example
cp .env.example .env

# Edit with your values
nano .env

# Add these lines:
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENV=production

INFISICAL_UNIVERSAL_AUTH_CLIENT_ID=your-client-id
INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET=your-client-secret
```

### Step 5: Store Tokens and Deploy (1 minute)

```bash
# Get tunnel tokens and store them
cloudflared tunnel token nyra-orchestrator > /tmp/token-orchestrator.txt
cloudflared tunnel token nyra-worker-rtx5090 > /tmp/token-worker1.txt
# ... (repeat for all tunnels)

# Login to Infisical with Universal Auth
export INFISICAL_TOKEN="$(infisical login --method=universal-auth --client-id="$INFISICAL_UNIVERSAL_AUTH_CLIENT_ID" --client-secret="$INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET" --silent --plain)"

# Create .env.cloudflare with your tokens
cat > .env.cloudflare <<EOF
CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR=$(cat /tmp/token-orchestrator.txt)
CLOUDFLARE_TUNNEL_NAME_ORCHESTRATOR=nyra-orchestrator

CLOUDFLARE_TUNNEL_TOKEN_WORKER_RTX5090=$(cat /tmp/token-worker1.txt)
CLOUDFLARE_TUNNEL_NAME_WORKER_RTX5090=nyra-worker-rtx5090
# ... (add other tokens)
EOF

# Store tokens in Infisical
./scripts/infisical/store-cloudflare-tokens.sh production

# Validate
./scripts/infisical/validate-cloudflare-tokens.sh production

# Deploy
docker-compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d

# Cleanup (IMPORTANT!)
rm .env.cloudflare /tmp/token-*.txt
```

## Verify Everything Works

```bash
# Check all containers are running
docker-compose ps

# Check tunnel logs
docker logs nyra-cloudflared-orchestrator

# Should see:
# "Connection established connIndex=0"
# "Registered tunnel connection"
```

## What Just Happened?

1. ✅ Cloudflare tunnels created for each node
2. ✅ Tunnel tokens stored securely in Infisical
3. ✅ Infisical agents injecting secrets into containers
4. ✅ Cloudflared tunnels running with secure tokens
5. ✅ No plaintext secrets in git or filesystems

## Common Issues

### Issue: "INFISICAL_UNIVERSAL_AUTH_CLIENT_ID required"

**Solution:** Check your `.env` file has all required credentials:

```bash
grep INFISICAL_UNIVERSAL_AUTH_CLIENT .env
```

### Issue: "Token format validation failed"

**Solution:** Ensure tunnel token is complete (200+ characters):

```bash
echo $CLOUDFLARE_TUNNEL_TOKEN_ORCHESTRATOR | wc -c
```

### Issue: "Tunnel authentication failed"

**Solution:** Verify token is stored correctly in Infisical:

```bash
infisical secrets get --env=production --path=/nyra/orchestrator CLOUDFLARE_TUNNEL_TOKEN --plain
```

## Next Steps

- [ ] Configure tunnel routes in Cloudflare dashboard
- [ ] Set up DNS records for your tunnels
- [ ] Enable audit logging in Infisical
- [ ] Schedule secret rotation (90 days)
- [ ] Add monitoring alerts for tunnel disconnections

## Security Checklist

- [ ] `.env.cloudflare` is in `.gitignore`
- [ ] `.env.cloudflare` file deleted after storing tokens
- [ ] Temporary token files deleted
- [ ] Infisical audit logging enabled
- [ ] Service accounts use least-privilege permissions

## Architecture Overview

```
[Cloudflare Edge]
       ↓
[Your Domain/DNS]
       ↓
[Cloudflare Tunnel] ← (Token from Infisical)
       ↓
[Nyra Services]
```

## Files Created

```
├── scripts/infisical/
│   ├── store-cloudflare-tokens.sh      # Store tokens in Infisical
│   └── validate-cloudflare-tokens.sh   # Validate token storage
├── bootstrap/configs/infisical/
│   ├── cloudflare-secrets-schema.json  # Secret structure definition
│   ├── agent-orchestrator.yaml         # Orchestrator agent config
│   ├── agent-worker-rtx5090.yaml       # Worker 1 agent config
│   ├── agent-worker-rtx3060.yaml       # Worker 2 agent config
│   └── agent-worker-rtx3090ti.yaml     # Worker 3 agent config
├── docker-compose.cloudflare.yml       # Tunnel services + agents
└── .env.cloudflare.example             # Example configuration
```

## Full Documentation

For detailed information, see:

- [CLOUDFLARE-INFISICAL-INTEGRATION.md](./CLOUDFLARE-INFISICAL-INTEGRATION.md)
- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Infisical Docs](https://infisical.com/docs)

## Support

If you encounter issues:

1. Check logs: `docker-compose logs -f cloudflared-orchestrator agent-cloudflare-orchestrator`
2. Validate setup: `./scripts/infisical/validate-cloudflare-tokens.sh production --verbose`
3. Review troubleshooting guide in main documentation

---

**Time to complete:** ~5 minutes
**Difficulty:** Easy
**Prerequisites:** Docker, Cloudflare account, Infisical running
