# Agent Vault Deployment Checklist

**Purpose**: Step-by-step validation before running agent-vault in production  
**Owner**: DevOps / Infra Team  
**Date**: 2026-05-28

---

## Pre-Deployment Validation

### Infrastructure Prerequisites

- [ ] Docker contexts configured (oracle-vps, orchestrator, workers)
- [ ] Caddy reverse proxy running on oracle-vps: `make caddy-health`
- [ ] Tailscale mesh active and MagicDNS working
- [ ] Disk space available on oracle-vps: `df -h /data` (recommend 10GB+)
- [ ] Network connectivity tested: `ping agent-vault.trex-fiordland.ts.net` (will fail before startup, expected)

### Files Deployed

- [ ] `infra/hosts/oracle-vps/docker-compose.agent-vault.yml` exists
- [ ] `infra/hosts/oracle-vps/.env.agent-vault.template` exists
- [ ] `infra/hosts/oracle-vps/Caddyfile` includes agent-vault reverse proxy config
- [ ] `docs/AGENT-VAULT-SETUP.md` is readable
- [ ] Makefile includes agent-vault targets: `make agent-vault-help` (or check grep)

---

## Deployment Steps

### Step 1: Environment Configuration

```bash
# [ ] Copy template to actual env file
cp infra/hosts/oracle-vps/.env.agent-vault.template infra/hosts/oracle-vps/.env.agent-vault

# [ ] Generate strong master password
MASTER_PASSWORD=$(openssl rand -base64 32)
echo "Generated master password: $MASTER_PASSWORD"

# [ ] Edit .env.agent-vault and set AGENT_VAULT_MASTER_PASSWORD
# [ ] Verify password is strong (32+ chars, mixed case/numbers/symbols)
# [ ] Store password securely (e.g., Infisical, 1Password, LastPass)
# [ ] DO NOT commit .env.agent-vault to git
```

### Step 2: Start Agent Vault

```bash
# [ ] Verify Caddy is running
make caddy-health

# [ ] Source environment
export $(cat infra/hosts/oracle-vps/.env.agent-vault | xargs)

# [ ] Deploy Agent Vault
make agent-vault-up

# Expected output:
# 🔐 Starting Agent Vault (credential proxy for AI agents)...
# ✅ Agent Vault started
# 🌐 Access: https://agent-vault.trex-fiordland.ts.net
# 📊 Health: https://agent-vault.trex-fiordland.ts.net/health
```

### Step 3: Verify Deployment

```bash
# [ ] Check container is running
make agent-vault-ps
# Expected: CONTAINER STATUS = Up (healthy)

# [ ] Verify health check
make agent-vault-health
# Expected: ✅ Agent Vault responding

# [ ] Check logs for errors
make agent-vault-logs | head -50
# Expected: No ERROR or FATAL messages

# [ ] Test from Tailscale device
curl -s https://agent-vault.trex-fiordland.ts.net/health
# Expected: OK (HTTP 200)
```

### Step 4: Configure Credential Stores

#### Option A: Local Encrypted Store (Simple)

```bash
# [ ] Create default vault
make agent-vault-create-service-vault

# [ ] Verify vault creation
make agent-vault-shell
agent-vault list-vaults
# Expected: nyra-services vault listed
exit
```

#### Option B: Infisical Backend (Enterprise)

```bash
# [ ] Obtain Infisical URL and token
# INFISICAL_URL: https://infisical.trex-fiordland.ts.net
# INFISICAL_TOKEN: <from Infisical admin console>

# [ ] Update .env.agent-vault with Infisical credentials
# [ ] Uncomment INFISICAL_URL and INFISICAL_TOKEN lines
# [ ] Restart Agent Vault
make agent-vault-restart

# [ ] Verify Infisical connection
make agent-vault-logs | grep -i "infisical\|connect"
# Expected: No connection errors
```

### Step 5: Add Initial Credentials

```bash
# [ ] Access web UI (from Tailscale device)
# https://agent-vault.trex-fiordland.ts.net
# Login with master password

# [ ] Create test credential
# Name: test-github-pat
# Value: ghp_test1234567890
# Service: github.com

# [ ] Or use CLI method
make agent-vault-shell
agent-vault add-credential \
  --vault=nyra-services \
  --credential-name=test-github-pat \
  --credential-value=ghp_test1234567890 \
  --service=github.com
exit

# [ ] Verify credential stored
make agent-vault-shell
agent-vault get-credential \
  --vault=nyra-services \
  --credential-name=test-github-pat
# Expected: Credential details displayed
exit
```

---

## Integration Testing

### Test 1: Direct Agent Vault Connection

```bash
# [ ] SSH into agent-vault container
make agent-vault-shell

# [ ] Test health endpoint inside container
wget -q -O- http://localhost:14321/health
# Expected: OK

# [ ] Test vault accessibility
agent-vault list-vaults
# Expected: nyra-services listed
exit
```

### Test 2: Reverse Proxy Access

```bash
# [ ] From Tailscale device, test reverse proxy
curl -s -I https://agent-vault.trex-fiordland.ts.net/health
# Expected: HTTP 200

# [ ] Test from another machine on tailnet
ssh user@orchestrator
curl -s https://agent-vault.trex-fiordland.ts.net/health
exit
```

### Test 3: Service Integration (Phase 2)

```bash
# [ ] Update one service to use Agent Vault proxy (e.g., crm-api)
# Add to docker-compose.yml:
#   HTTPS_PROXY: http://agent-vault:14321
#   HTTP_PROXY: http://agent-vault:14321

# [ ] Restart service
docker --context oracle-vps compose -f infra/hosts/oracle-vps/docker-compose.yml restart crm-api

# [ ] Test service can access external API through Agent Vault
docker --context oracle-vps exec crm-api bash
curl -s https://api.github.com/user --proxy http://agent-vault:14321
# Expected: Request succeeds (credentials injected by Agent Vault)
exit
```

---

## Security Validation

- [ ] Master password is strong (32+ characters, mixed case/numbers/symbols)
- [ ] Master password is NOT in version control (.gitignore is correct)
- [ ] Master password is stored securely in password manager
- [ ] `.env.agent-vault` file has correct permissions: `600` (read/write owner only)
- [ ] Trusted proxies configuration is appropriate: `AGENT_VAULT_TRUSTED_PROXIES`
- [ ] Log level is set appropriately: `LOG_LEVEL=info` (not debug in production)
- [ ] HTTPS/TLS is enforced (Caddy handles this, HTTP fallback disabled)
- [ ] Audit logs are accessible: `make agent-vault-logs`

---

## Post-Deployment Validation

- [ ] Agent Vault has been running for 24+ hours without restarts
- [ ] No ERROR or FATAL messages in logs
- [ ] Health checks consistently pass: `make agent-vault-health`
- [ ] Services successfully routing through Agent Vault proxy
- [ ] Credentials are being injected correctly (verify in logs and service behavior)
- [ ] Performance is acceptable (Agent Vault adds ~5-10ms per request)
- [ ] Backup of master password confirmed in secure location

---

## Rollback Plan

If deployment fails:

```bash
# [ ] Stop Agent Vault
make agent-vault-down

# [ ] Remove volumes (if data corruption suspected)
docker volume rm nyra-agent-vault-data || true

# [ ] Verify Caddy still works (reverse proxy for other services)
make caddy-health

# [ ] Investigate logs and retry
make agent-vault-logs | tail -100
```

---

## Sign-Off

- **Deployed By**: _________________ (Name)
- **Deployment Date**: _________________ (YYYY-MM-DD)
- **Verified By**: _________________ (Name)
- **Verification Date**: _________________ (YYYY-MM-DD)
- **Notes**: _____________________________________________________________

---

## Next: Service Integration

Once validated, proceed to integrate remaining services:

1. CRM API → Agent Vault proxy
2. Lead Ingestion → Agent Vault proxy
3. Campaign Service → Agent Vault proxy
4. Communication Service → Agent Vault proxy
5. Quote Service → Agent Vault proxy
6. Assistant Service → Agent Vault proxy

See `docs/AGENT-VAULT-SETUP.md` Phase 3 for per-service configuration.
