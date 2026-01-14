# Infisical Deployment Strategy

Complete strategy for deploying Project Nyra with Infisical secrets management across multiple PCs (orchestrator + 3 GPU workers + VPS).

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup Infisical](#setup-infisical)
- [Multi-PC Deployment](#multi-pc-deployment)
- [Environment Management](#environment-management)
- [Secret Rotation](#secret-rotation)
- [Security Best Practices](#security-best-practices)

---

## Overview

**Why Infisical?**

- **Centralized Secrets**: Single source of truth for all environment variables
- **Environment Separation**: Development, staging, production configurations
- **Secret Rotation**: Automated credential rotation
- **Access Control**: Role-based access to secrets
- **Audit Logging**: Track who accessed which secrets when
- **Multi-PC Sync**: Synchronize secrets across orchestrator + workers

**Alternative Approaches**:
- `.env` files: Simple but insecure, manual distribution
- HashiCorp Vault: Enterprise-grade but complex setup
- AWS Secrets Manager: Cloud-only, vendor lock-in
- **Infisical**: Best balance of features and ease of use

---

## Architecture

### Physical Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Orchestrator Mini PC (Control Node)                        │
│  - Nyra services (orchestrator, quote, campaign)            │
│  - Databases (PostgreSQL, Redis, FalkorDB, Neo4j)           │
│  - Workflow automation (n8n, Activepieces)                  │
│  - CRM (TwentyCRM)                                          │
│  - Monitoring (Grafana, Prometheus, Langfuse)              │
│  - Infisical Agent (pulls secrets, injects into services)   │
└─────────────────────────────────────────────────────────────┘
                           ↓ Cloudflare Tunnel
┌──────────────────┬──────────────────┬──────────────────────┐
│ GPU Worker 1     │ GPU Worker 2     │ GPU Worker 3         │
│ - Ollama         │ - Ollama         │ - Ollama (embeddings)│
│ - vLLM           │ - vLLM           │ - Mem0 local         │
│ - Letta          │ - Dify           │                      │
│ - Infisical      │ - Infisical      │ - Infisical          │
└──────────────────┴──────────────────┴──────────────────────┘
                           ↓ Internet
┌─────────────────────────────────────────────────────────────┐
│  VPS (Public-Facing)                                        │
│  - RateHunter landing page                                  │
│  - Nyra Admin dashboard                                     │
│  - Cloudflare Tunnel ingress                                │
│  - Nginx reverse proxy                                      │
│  - Infisical Agent                                          │
└─────────────────────────────────────────────────────────────┘
```

### Secrets Distribution Strategy

**Development** (Local `.env`):
- Use `.env` files for local development
- Secrets committed to Infisical for team sync
- Automatic validation via `validate-env.sh`

**Production** (Infisical):
- All secrets stored in Infisical cloud
- Infisical Agent runs on each machine
- Secrets injected at runtime, never stored on disk
- Automatic secret rotation every 90 days

---

## Setup Infisical

### 1. Create Infisical Account

1. Visit [Infisical Cloud](https://app.infisical.com)
2. Sign up with email or GitHub
3. Verify email

**Pricing** (as of 2026):
- **Free**: 5 users, unlimited secrets, 3 environments
- **Pro**: $18/user/month, RBAC, audit logs, secret rotation
- **Enterprise**: Custom pricing, SSO, dedicated support

**Recommendation**: Start with Free, upgrade to Pro for production

### 2. Create Project

1. Click **New Project**
2. Enter details:
   - **Name**: Project Nyra
   - **Description**: Mortgage automation platform
3. Click **Create Project**

### 3. Configure Environments

Infisical projects have 3 default environments. Customize them:

**Development**:
- Used for local development
- Secrets accessible to all developers
- No secret rotation

**Staging**:
- Pre-production testing environment
- Mirrored from production with test credentials
- Optional secret rotation

**Production**:
- Live production environment
- Restricted access (admin only)
- Automatic secret rotation enabled
- Audit logging enabled

### 4. Add Secrets

Navigate to **Development** environment and add secrets:

```
# Core Database Secrets
POSTGRES_PASSWORD=<generate-random-32-char>
REDIS_PASSWORD=<generate-random-32-char>
FALKORDB_PASSWORD=<generate-random-32-char>

# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Nexus Router
NEXUS_JWT_SECRET=<generate-random-32-char>
NEXUS_ADMIN_TOKEN=<generate-random-32-char>

# ... (continue with all secrets from ENVIRONMENT_VARIABLES.md)
```

**Tip**: Use Infisical's built-in secret generator:
- Click **Generate** button next to value field
- Select length (16, 32, 64 characters)
- Include/exclude special characters

### 5. Replicate to Other Environments

1. Select all secrets in **Development**
2. Click **Actions** → **Copy to Environment**
3. Select **Production**
4. Review and confirm

**Important**: Change production secrets to real credentials (not test values)

---

## Multi-PC Deployment

### Install Infisical CLI

**Linux / macOS**:
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

**Windows** (via Chocolatey):
```powershell
choco install infisical
```

### Authenticate Infisical CLI

**Option 1: Universal Auth (Recommended for Production)**

1. In Infisical dashboard, go to **Project Settings** → **Access Tokens**
2. Click **Create Token**
3. Configure:
   - **Name**: Orchestrator Token
   - **Environment**: Production
   - **TTL**: Never expire (or 90 days with rotation)
4. Copy token

On orchestrator mini PC:
```bash
export INFISICAL_TOKEN=<your-token>
infisical secrets
```

**Option 2: Machine Identity (Service Accounts)**

1. Go to **Organization Settings** → **Machine Identities**
2. Click **Create Identity**
3. Configure:
   - **Name**: nyra-orchestrator
   - **Description**: Orchestrator mini PC
4. Generate and save client ID/secret

```bash
infisical login --method=universal-auth \
  --client-id=<client-id> \
  --client-secret=<client-secret>
```

### Deploy to Orchestrator Mini PC

1. **Install Docker & Docker Compose**:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

2. **Clone Repository**:
```bash
git clone https://github.com/yourusername/Project-Nyra.git
cd Project-Nyra
```

3. **Authenticate Infisical**:
```bash
export INFISICAL_TOKEN=<orchestrator-token>
```

4. **Run Services with Infisical**:
```bash
infisical run --env=production -- \
  docker-compose -f infra/docker-compose.dev.yml -p nyra up -d
```

This injects all Infisical secrets as environment variables before starting Docker Compose.

### Deploy to GPU Workers

Repeat for each GPU worker (3 total):

1. **Wake Machine** (Magic Packet from orchestrator):
```bash
wakeonlan AA:BB:CC:DD:EE:FF  # Worker 1 MAC address
```

2. **SSH into Worker**:
```bash
ssh user@gpu-worker-1.local
```

3. **Install Infisical CLI**:
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install -y infisical
```

4. **Create Worker-Specific Token**:
- In Infisical, create token: `GPU Worker 1 Token`
- Restrict to production environment
- Export on worker: `export INFISICAL_TOKEN=<token>`

5. **Run GPU Services**:
```bash
cd Project-Nyra
infisical run --env=production -- \
  docker-compose -f infra/docker-compose.dev.yml -p nyra up -d \
    ollama vllm letta dify
```

### Deploy to VPS

1. **SSH into VPS**:
```bash
ssh root@ratehunter.net
```

2. **Setup Infisical**:
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get install -y infisical

export INFISICAL_TOKEN=<vps-token>
```

3. **Deploy Frontend**:
```bash
cd Project-Nyra/apps/ratehunter
infisical run --env=production -- npm run build
infisical run --env=production -- npm run start
```

---

## Environment Management

### Local Development Workflow

Developers use `.env` files locally:

```bash
# Pull latest secrets from Infisical to .env
infisical secrets --env=development > .env

# Verify secrets
bash scripts/validate-env.sh

# Run services locally
docker-compose up -d
```

### Continuous Integration (CI/CD)

**GitHub Actions** example:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Infisical
        run: |
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get install -y infisical

      - name: Deploy with Infisical
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          infisical run --env=production -- \
            ./scripts/deployment/deploy-orchestrator.sh production
```

### Environment Variable Overrides

For local testing with production-like config:

```bash
# Pull production secrets but override specific values
infisical secrets --env=production > .env.prod
echo "DATABASE_URL=postgresql://localhost:5432/nyra_test" >> .env.prod

docker-compose --env-file .env.prod up -d
```

---

## Secret Rotation

### Automatic Rotation (Pro Plan)

1. Go to **Project Settings** → **Secret Rotation**
2. Enable for critical secrets:
   - Database passwords
   - API keys
   - JWT secrets
3. Configure rotation period: 30, 60, or 90 days
4. Set up rotation webhook to notify services

### Manual Rotation

**Example: Rotate PostgreSQL Password**

1. Generate new password:
```bash
NEW_PASSWORD=$(openssl rand -hex 32)
```

2. Update in Infisical:
```bash
infisical secrets set POSTGRES_PASSWORD="${NEW_PASSWORD}" --env=production
```

3. Update in PostgreSQL:
```bash
docker exec -it nyra-postgres psql -U postgres -c \
  "ALTER USER postgres WITH PASSWORD '${NEW_PASSWORD}';"
```

4. Restart services:
```bash
infisical run --env=production -- \
  docker-compose -f infra/docker-compose.dev.yml restart
```

### Rotation Webhook

Configure webhook to notify services of rotation:

```bash
# Infisical webhook sends POST to:
https://nyra.yourdomain.com/webhooks/secret-rotation

# Payload:
{
  "event": "secret.rotated",
  "secret": "POSTGRES_PASSWORD",
  "environment": "production",
  "timestamp": "2026-01-13T10:30:00Z"
}
```

**Handler** (FastAPI):

```python
@app.post("/webhooks/secret-rotation")
async def handle_secret_rotation(request: Request):
    payload = await request.json()

    secret_name = payload['secret']

    if secret_name == "POSTGRES_PASSWORD":
        # Reload PostgreSQL connection pool
        await reload_database_connection()

    return {"status": "processed"}
```

---

## Security Best Practices

### 1. Never Commit Secrets

Add to `.gitignore`:

```gitignore
.env
.env.*
!.env.example
*.pem
*.key
service-account-*.json
```

### 2. Restrict Access

**Principle of Least Privilege**:
- Developers: Read-only access to development environment
- DevOps: Read/write access to staging
- Admin: Full access to production

**Infisical RBAC**:
1. Go to **Project Settings** → **Members**
2. Invite team member
3. Select role:
   - **Viewer**: Read-only
   - **Developer**: Read/write development
   - **Admin**: Full access

### 3. Audit Logging

Enable in **Project Settings** → **Audit Logs**:

- Track all secret access
- Log environment changes
- Monitor failed authentication attempts

**Review regularly**:
```bash
# Export audit logs
infisical audit-logs --env=production --start-date=2026-01-01
```

### 4. Backup Secrets

**Automated Backup**:

```bash
# Backup all secrets to encrypted file
infisical secrets --env=production --format=json > secrets-backup.json.enc
gpg --encrypt --recipient admin@yourdomain.com secrets-backup.json.enc
```

**Store backup**:
- Bitwarden vault (encrypted)
- Offline USB drive (encrypted)
- Physical safe (printed, sealed envelope)

### 5. Disaster Recovery

**Recovery Plan**:

1. **Lost Infisical Access**:
   - Restore from encrypted backup
   - Regenerate all secrets
   - Re-deploy to all machines

2. **Compromised Secrets**:
   - Rotate all affected secrets immediately
   - Review audit logs for unauthorized access
   - Notify affected users

3. **Infisical Service Outage**:
   - Fall back to cached secrets (Infisical Agent)
   - Use emergency `.env` file (stored offline)
   - Contact Infisical support

---

## Cost Analysis

### Infisical Pricing

**Free Tier**:
- 5 users
- Unlimited secrets
- 3 environments
- **Cost**: $0/month
- **Suitable for**: Development, small teams

**Pro Tier**:
- Unlimited users
- RBAC, audit logs
- Secret rotation
- Priority support
- **Cost**: $18/user/month (5 users = $90/month)
- **Suitable for**: Production, compliance requirements

**Annual Savings**:
- Avoid manual secret distribution: ~10 hours/month × $100/hour = $1,000/month saved
- Prevent security breaches: Priceless

**ROI**: Pays for itself in 1 month

---

## Troubleshooting

### Error: `Failed to authenticate with Infisical`

**Cause**: Invalid or expired token

**Solution**:
```bash
# Re-authenticate
infisical login
# Or set new token
export INFISICAL_TOKEN=<new-token>
```

### Error: `Secret not found`

**Cause**: Secret doesn't exist in selected environment

**Solution**:
```bash
# List all secrets
infisical secrets --env=production

# Add missing secret
infisical secrets set SECRET_NAME="value" --env=production
```

### Error: `Rate limit exceeded`

**Cause**: Too many API calls to Infisical

**Solution**:
- Use Infisical Agent for caching
- Reduce frequency of secret pulls
- Upgrade to Pro plan (higher rate limits)

---

## Resources

- [Infisical Documentation](https://infisical.com/docs)
- [CLI Reference](https://infisical.com/docs/cli/overview)
- [Kubernetes Integration](https://infisical.com/docs/integrations/platforms/kubernetes)
- [GitHub Actions Integration](https://infisical.com/docs/integrations/cicd/githubactions)
- [Security Best Practices](https://infisical.com/docs/security)

---

**Generated**: 2026-01-13
**Maintained by**: Project Nyra Development Team
