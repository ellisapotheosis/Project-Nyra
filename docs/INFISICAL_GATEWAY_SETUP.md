# Infisical Agent Gateway Deployment

Complete guide for deploying Infisical Agent Gateway on oracle-vps with token-based authentication to Agent Vault, dynamic secrets, and API connectors.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│ Agent Vault (oracle-vps:8080)           │
│ Core secret store                       │
│ - Stores all secrets                    │
│ - Machine identity authentication       │
│ - REST API                              │
└────────────────▲────────────────────────┘
                 │ (machine-identity token)
                 │
┌────────────────┴────────────────────────┐
│ Agent Gateway (oracle-vps:8200)         │
│ - Caches secrets locally (memory)       │
│ - Generates dynamic DB credentials      │
│ - API connectors: Twilio, SendGrid, etc │
│ - Exposes REST API for apps             │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┬──────────────┐
        │                 │              │
    ┌───▼───┐        ┌────▼──┐      ┌───▼──┐
    │ App A │        │ App B │      │Other │
    │       │        │       │      │Apps  │
    └───────┘        └───────┘      └──────┘
    (Docker network)
```

**Three-Layer Model:**
1. **Agent Vault** — Canonical secret store (already running)
2. **Agent Gateway** — Operational layer (this deployment)
   - Local in-memory cache for performance
   - Dynamic credential generation
   - API connectors for third-party services
3. **Apps** — Call gateway directly via Docker network or public endpoints

---

## File Structure

```
security/infisical/
├── agent-vault/
│   ├── dev.env
│   ├── staging.env
│   └── prod.env
├── agent-gateway/
│   ├── dev.env          ← FILL WITH YOUR SECRETS
│   ├── staging.env      ← FILL WITH YOUR SECRETS
│   └── prod.env         ← FILL WITH YOUR SECRETS
└── agent-proxy/
    ├── dev.env
    ├── staging.env
    └── prod.env

infra/hosts/oracle-vps/
├── docker-compose.yml   (main stack)
├── docker-compose.infisical-gateway.yml  ← NEW overlay
└── ...

infra/configs/infisical/
├── infisical-agent-gateway-config.yaml   ← NEW config
└── ...

infra/configs/tailscale-proxy/
└── Caddyfile            (now includes infisical-gateway routes)
```

---

## Step 1: Gather Machine Identity Credentials

Get these from Infisical admin panel:

```bash
# In Infisical web UI:
# 1. Navigate to Settings → Machine Identities
# 2. Create or select the machine identity for Agent Gateway
# 3. Copy:
#    - Machine Identity ID (UUID)
#    - Machine Identity Key (long string)
#
# These go into the .env files as:
# INFISICAL_BACKEND_MACHINE_IDENTITY_ID=<id>
# INFISICAL_BACKEND_MACHINE_IDENTITY_KEY=<key>
```

---

## Step 2: Fill in Environment Files

Edit each .env file in `security/infisical/agent-gateway/`:

### Dev Environment

```bash
# security/infisical/agent-gateway/dev.env

# Machine Identity (from Infisical admin)
INFISICAL_BACKEND_MACHINE_IDENTITY_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
INFISICAL_BACKEND_MACHINE_IDENTITY_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Database Admin Credentials (for dynamic credential generation)
INFISICAL_POSTGRES_ADMIN_PASSWORD=dev_postgres_admin_password_here

# API Keys (Twilio)
INFISICAL_TWILIO_ACCOUNT_SID=AC...
INFISICAL_TWILIO_AUTH_TOKEN=...

# API Keys (SendGrid)
INFISICAL_SENDGRID_API_KEY=SG....

# API Keys (LLM)
INFISICAL_ANTHROPIC_API_KEY=sk-ant-...
```

### Staging Environment

Copy dev template to staging, update values to staging credentials.

### Production Environment

Copy dev template to prod, update values to production credentials. **RESTRICT ACCESS STRICTLY.**

---

## Step 3: Deploy Gateway Container

### Option A: Start on oracle-vps

```bash
# SSH to oracle-vps
ssh ubuntu@oracle-vps.trex-fiordland.ts.net

# Navigate to project
cd ~/project-nyra

# Start gateway overlay (dev environment)
COMPOSE_PROJECT_NAME=nyra ENVIRONMENT=dev docker compose \
  --env-file /dev/null \
  -f infra/hosts/oracle-vps/docker-compose.yml \
  -f infra/hosts/oracle-vps/docker-compose.infisical-gateway.yml \
  up -d

# Verify running
docker ps --filter name=infisical-gateway
docker logs nyra-infisical-gateway
```

### Option B: Staging / Production

```bash
# Staging
COMPOSE_PROJECT_NAME=nyra ENVIRONMENT=staging docker compose \
  -f infra/hosts/oracle-vps/docker-compose.infisical-gateway.yml \
  up -d

# Production
COMPOSE_PROJECT_NAME=nyra ENVIRONMENT=prod docker compose \
  -f infra/hosts/oracle-vps/docker-compose.infisical-gateway.yml \
  up -d
```

---

## Step 4: Verify Health

```bash
# From oracle-vps
docker exec nyra-infisical-gateway curl -s http://localhost:8200/health | jq .

# Expected output:
{
  "status": "healthy",
  "uptime": "00:05:32",
  "version": "0.x.x"
}
```

---

## Step 5: Test Gateway Access

### Internal (Docker network)

Apps on the same `nyra_net` network can now call:

```bash
# Inside app container
curl http://infisical-gateway:8200/api/v1/secrets

# Expected: Returns cached secrets from Agent Vault
{
  "database_password": "***",
  "api_key_twilio": "***",
  ...
}
```

### Private Tailscale Endpoint

```bash
# From Windows 11 (Tailscale)
curl http://infisical-gateway.p.projectnyra.com/api/v1/secrets

# Note: Requires Tailscale split DNS configured (see Phase 3)
```

### Public (Cloudflare + Access)

```bash
# Public endpoint
curl https://infisical-gateway.projectnyra.com/api/v1/secrets

# Requires Cloudflare Access authentication (browser login)
```

---

## Step 6: Dynamic Secrets (Database)

Once gateway is running, query dynamic DB credentials:

```bash
# Request dynamic role
curl -X POST http://infisical-gateway:8200/api/v1/dynamic-secrets/postgres \
  -H "Content-Type: application/json" \
  -d '{ "ttl_hours": 1 }'

# Response:
{
  "username": "dev_app_abc123",
  "password": "randomized_password",
  "expires_at": "2026-07-23T16:34:00Z"
}

# App uses these credentials to connect to postgres
psql -U dev_app_abc123 -W -d my_database -h postgres
```

---

## Step 7: API Connectors

### Twilio SMS Example

```bash
curl -X POST http://infisical-gateway:8200/api/v1/twilio/send-sms \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+1234567890",
    "body": "Hello from Infisical Gateway!"
  }'

# Gateway uses cached TWILIO_ACCOUNT_SID and AUTH_TOKEN to send
```

### SendGrid Email Example

```bash
curl -X POST http://infisical-gateway:8200/api/v1/sendgrid/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Test",
    "body": "Hello!"
  }'
```

### LLM (Anthropic) Example

```bash
curl -X POST http://infisical-gateway:8200/api/v1/anthropic/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4-1",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'

# Gateway injects ANTHROPIC_API_KEY automatically
```

---

## Step 8: Monitoring & Logs

```bash
# Tail gateway logs
docker logs -f nyra-infisical-gateway

# Cache hit rate
docker exec nyra-infisical-gateway curl -s http://localhost:8200/metrics | grep cache_hits

# Audit trail
docker logs nyra-infisical-gateway | grep "audit"
```

---

## Tailscale & Cloudflare Integration

### Private Endpoints (Tailscale only)

**Not needed:** Gateway is internal-only by design. Apps call it directly via Docker network.

### Public Endpoints (Cloudflare tunnel)

**Cloudflare tunnel already routes:**
- `infisical-gateway.projectnyra.com` → Caddy (100.64.0.3:80) → infisical-gateway:8200
- Requires Cloudflare Access authentication (policy-based)

**To add Access policy:**
1. [Cloudflare Zero Trust → Access → Apps](https://one.dash.cloudflare.com/)
2. **New Application** → **Self-hosted**
3. Application Name: `infisical-gateway`
4. Domain: `infisical-gateway.projectnyra.com`
5. Add policy:
   - Name: `admin`
   - Decision: Allow
   - Allow: `edaneandersen@gmail.com`, `@projectnyra.com`, `@ratehunter.net`
6. Save

---

## Troubleshooting

### Gateway can't connect to Agent Vault

```bash
# Check Agent Vault is running
docker ps --filter name=agent-vault

# Check network connectivity
docker exec nyra-infisical-gateway curl -s http://agent-vault:8080/health

# Check machine identity credentials in dev.env
# Are INFISICAL_BACKEND_MACHINE_IDENTITY_ID and KEY set?
docker exec nyra-infisical-gateway env | grep INFISICAL_BACKEND
```

### Cache empty / no secrets returned

```bash
# 1. Check secret paths in config
#    Should match where you stored secrets in Agent Vault
# 2. Check machine identity has permission to read those paths
# 3. Check vault token is valid (not expired)
# 4. Inspect cache
docker exec nyra-infisical-gateway curl -s http://localhost:8200/cache | jq .
```

### Database credential generation fails

```bash
# Check Postgres is running
docker exec nyra-postgres psql -U postgres -c "SELECT 1"

# Check admin credentials in dev.env are correct
# Test manually:
psql -U postgres -W -h postgres -c "CREATE ROLE test_role LOGIN PASSWORD 'test';"

# Check gateway has permission
docker logs nyra-infisical-gateway | grep "postgres\|dynamic"
```

---

## Security Best Practices

1. **Never commit .env files** — added to `.gitignore`
2. **Rotate machine identity keys** — Infisical admin panel every 90 days
3. **Use staging first** — test in staging environment before production
4. **Restrict Cloudflare Access** — only allow known users/emails
5. **Monitor audit logs** — gateway logs all secret access
6. **Cache TTL** — set to 15 min (dev) to 15 min (prod) for security
7. **Database roles** — temporary roles with 1-24 hour TTL, auto-cleanup

---

## Next Steps

- [ ] Fill in dev.env with machine identity credentials
- [ ] Deploy and test on oracle-vps
- [ ] Fill in staging.env and deploy to staging
- [ ] Test dynamic DB credentials generation
- [ ] Test API connectors (Twilio, SendGrid)
- [ ] Fill in prod.env (restrict access strictly)
- [ ] Deploy to production
- [ ] Add Cloudflare Access policy
- [ ] Document app integration patterns

---

## Related

- [Agent Vault Setup](./AGENT_VAULT_SETUP.md)
- [Tailscale Split DNS](./OWNER_MANUAL_ACTIONS.md#configure-tailscale-split-dns)
- [Cloudflare Access](./docs/cloudflare/OWNER_MANUAL_ACTIONS.md)
