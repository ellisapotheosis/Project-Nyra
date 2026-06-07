# Agent Vault Setup \& Integration — Project Nyra

**Status**: Implementation Guide
**Date**: 2026-05-28
**Component**: Infisical Agent Vault (Credential Proxy)
**Technology**: Agent Vault v1.x + Caddy Reverse Proxy

\---

## Overview

Agent Vault is a **credential broker** that prevents AI agents and services from directly accessing secrets. Instead of giving services credentials, you:

1. Store credentials in Agent Vault (local encrypted store or Infisical)
2. Configure services to route HTTP requests through Agent Vault via `HTTPS\\\_PROXY`
3. Agent Vault intercepts requests and injects credentials before forwarding

**Key Benefit**: AI agents cannot exfiltrate secrets via prompt injection or other exploits — they never see the real credentials.

```
┌──────────────┐         ┌──────────────────────────┐         ┌─────────┐
│  AI Service  │ HTTP    │   Agent Vault (Proxy)    │ HTTP    │  API    │
│              ├────────▶│  - Credential Store      ├────────▶│  (e.g.  │
│  Uses        │         │  - Request Interceptor   │         │  GitHub)│
│  HTTPS\\\_PROXY │ (with   │  - Auth Header Injection │ (with   │         │
│              │ dummy   │  - Audit Logging         │ real    │         │
└──────────────┘ creds)  │                          │ creds)  └─────────┘
                         └──────────────────────────┘
```

\---

## Phase 1: Bootstrap Agent Vault on Oracle-VPS

### Prerequisites

- ✅ Docker contexts configured (oracle-vps, orchestrator, etc.)
- ✅ Caddy reverse proxy running on oracle-vps
- ✅ Tailscale mesh active (for internal DNS)

### Step 1: Configure Environment

```bash
# Copy environment template
cp infra/hosts/oracle-vps/.env.agent-vault.template infra/hosts/oracle-vps/.env.agent-vault

# Edit .env.agent-vault and set AGENT\\\_VAULT\\\_MASTER\\\_PASSWORD
# Use: openssl rand -base64 32
nano infra/hosts/oracle-vps/.env.agent-vault
```

**Key Variables:**

```bash
AGENT\\\_VAULT\\\_MASTER\\\_PASSWORD=<random-strong-password>
AGENT\\\_VAULT\\\_ADDR=https://agent-vault.trex-fiordland.ts.net
```

### Step 2: Deploy Agent Vault

```bash
# Start Agent Vault container
make agent-vault-up

# Verify it's running
make agent-vault-health

# Check logs
make agent-vault-logs
```

**Expected Output:**

```
📊 Agent Vault Health Check
============================
CONTAINER ID   IMAGE                    STATUS           PORTS
...            infisical/agent-vault    Up (healthy)     14321/tcp

✅ Agent Vault responding
```

### Step 3: Verify Caddy Reverse Proxy

Agent Vault is now accessible at:

```
https://agent-vault.trex-fiordland.ts.net
```

Test from any Tailscale device:

```bash
curl -s https://agent-vault.trex-fiordland.ts.net/health
# Should return: OK
```

\---

## Phase 2: Create Credential Vaults

### Option A: Create Local Vault (Simple)

```bash
# SSH into Agent Vault container
make agent-vault-shell

# Inside container, create a vault
agent-vault create-vault \\\\
  --name nyra-services \\\\
  --credential-store=local \\\\
  --parent-domain="\\\*.trex-fiordland.ts.net"

# Exit container
exit
```

### Option B: Use Infisical Backend (Enterprise)

If you want Agent Vault to fetch credentials from Infisical:

1. **Update `.env.agent-vault`:**

```bash
INFISICAL\\\_URL=https://infisical.trex-fiordland.ts.net
INFISICAL\\\_TOKEN=<your-infisical-token>
```

2. **Restart Agent Vault:**

```bash
make agent-vault-restart
```

3. **Create vault with Infisical backend:**

```bash
make agent-vault-shell

agent-vault create-vault \\\\
  --name nyra-services-infisical \\\\
  --credential-store=infisical \\\\
  --parent-domain="\\\*.trex-fiordland.ts.net" \\\\
  --infisical-path=/agent-vault/vaults/nyra-services
```

\---

## Phase 3: Configure Services to Use Agent Vault

### Pattern: Enable HTTPS_PROXY

For any service that makes HTTP/HTTPS requests, configure:

```bash
# In docker-compose.yml or .env
HTTPS\\\_PROXY=http://agent-vault:14321
HTTP\\\_PROXY=http://agent-vault:14321
NO\\\_PROXY=localhost,127.0.0.1,169.254.169.254
```

### Example: CRM API Service

In `infra/hosts/oracle-vps/docker-compose.yml`:

```yaml
services:
  crm-api:
    image: crm-api:latest
    container\\\_name: ${COMPOSE\\\_PROJECT\\\_NAME:-nyra}-crm-api
    environment:
      # Route requests through Agent Vault
      HTTPS\\\_PROXY: http://agent-vault:14321
      HTTP\\\_PROXY: http://agent-vault:14321
      NO\\\_PROXY: localhost,127.0.0.1

      # Instead of storing credentials here, store them in Agent Vault
      # Requests to external APIs (GitHub, OpenAI, etc.) are intercepted
      # and credentials injected by Agent Vault
      GITHUB\\\_API\\\_URL: https://api.github.com
      OPENAI\\\_BASE\\\_URL: https://api.openai.com

      # Optional: Service identifier for audit logs
      SERVICE\\\_NAME: crm-api
    depends\\\_on:
      - agent-vault
    networks:
      - nyra-internal
```

\---

## Phase 4: Store Credentials in Agent Vault

### Add Credential via Web UI

```bash
# Access Agent Vault web interface
https://agent-vault.trex-fiordland.ts.net

# Login with master password
# Navigate: Credentials → Add New Credential
# Fill in:
#   Name: github-pat
#   Value: ghp\\\_xxxxxxxxxxxx
#   Service: nyra-services
```

### Add Credential via CLI

```bash
make agent-vault-shell

# Inside container
agent-vault add-credential \\\\
  --vault=nyra-services \\\\
  --credential-name=github-pat \\\\
  --credential-value=ghp\\\_xxxxxxxxxxxx \\\\
  --service=github.com
```

\---

## Phase 5: Test End-to-End

### Verify Service Can Access API Through Vault

```bash
# SSH to oracle-vps
docker --context orchestrator exec -it nyra-crm-api bash

# Inside CRM API container, test GitHub API through Agent Vault
curl -s -H "Authorization: Bearer dummy" \\\\
  https://api.github.com/user \\\\
  --proxy http://agent-vault:14321

# Agent Vault will:
# 1. Intercept the request
# 2. Replace dummy token with real github-pat from vault
# 3. Forward to api.github.com
# 4. Return response to service
```

**Expected Result:**

- ✅ Request succeeds with real credentials
- ✅ Service never sees the real token
- ✅ Audit log records the request

\---

## Operational Commands

### Basic Management

```bash
# Deploy Agent Vault
make agent-vault-up

# Stop Agent Vault
make agent-vault-down

# Restart Agent Vault
make agent-vault-restart

# View logs
make agent-vault-logs

# Health check
make agent-vault-health

# SSH into container
make agent-vault-shell

# View processes
make agent-vault-ps
```

### Create Vaults

```bash
# Create local vault
make agent-vault-create-service-vault

# Manual vault creation with full options
make agent-vault-setup-vault
```

\---

## Security Considerations

### Master Password

- 🔐 **Never commit `.env.agent-vault` to git** — store in Infisical or secrets manager
- 🔐 **Use strong, random password**: `openssl rand -base64 32`
- 🔐 **Backup the master password** in your password manager
- 🔐 **If compromised, all credentials are at risk** — rotate immediately

### Trusted Proxies

The `AGENT\\\_VAULT\\\_TRUSTED\\\_PROXIES` setting controls which proxies can set `X-Forwarded-\\\*` headers:

```bash
# Current setting (docker networks)
AGENT\\\_VAULT\\\_TRUSTED\\\_PROXIES=10.0.0.0/8,172.16.0.0/12,192.168.0.0/16

# In production with specific Caddy IP:
AGENT\\\_VAULT\\\_TRUSTED\\\_PROXIES=10.64.0.3/32
```

### Audit Trail

Agent Vault logs all credential access:

```bash
# View audit logs
make agent-vault-logs | grep -i "credential\\\\|request"

# Example log entry:
# \\\[2026-05-28T10:30:45Z] Request intercepted: crm-api → api.github.com
# \\\[2026-05-28T10:30:45Z] Credential injected: github-pat
# \\\[2026-05-28T10:30:45Z] Response forwarded (200 OK)
```

\---

## Troubleshooting

### Issue: Agent Vault Won't Start

**Error**: `AGENT\\\_VAULT\\\_MASTER\\\_PASSWORD not set`

**Solution**:

```bash
# Ensure .env.agent-vault exists and is sourced
ls -la infra/hosts/oracle-vps/.env.agent-vault
export $(cat infra/hosts/oracle-vps/.env.agent-vault | grep AGENT\\\_VAULT\\\_MASTER\\\_PASSWORD)
make agent-vault-up
```

### Issue: Services Can't Access Agent Vault

**Error**: `Connection refused` when accessing through proxy

**Solution**:

1. Verify Agent Vault is running: `make agent-vault-health`
2. Verify service can reach Agent Vault: `docker exec -it nyra-service curl http://agent-vault:14321/health`
3. Check HTTPS_PROXY environment in service: `docker exec -it nyra-service env | grep PROXY`

### Issue: Credentials Not Being Injected

**Error**: Service gets `401 Unauthorized` despite credential stored in vault

**Solution**:

1. Verify credential exists: `docker exec -it nyra-agent-vault agent-vault list-credentials --vault=nyra-services`
2. Check vault bindings: Ensure service name matches vault configuration
3. Review logs: `make agent-vault-logs | grep -i "credential\\\\|inject"`

### Issue: Performance Degradation

**Symptom**: Services slower when using Agent Vault proxy

**Solution**:

1. Agent Vault adds \~5-10ms per request (credential injection overhead)
2. If unacceptable, consider local encrypted credentials for non-sensitive APIs
3. Use Infisical backend for credential refresh without full proxy overhead

\---

## Integration with Project Nyra Stack

### With Nexus Router

Agent Vault sits **upstream** of Nexus:

```
┌─────────────────┐
│  AI Service     │ HTTPS\\\_PROXY
│  (e.g. Claude)  │
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │   Agent Vault        │ intercepts, injects creds
    │   Port 14321         │
    └────┬─────────────────┘
         │
    ┌────▼──────────┐
    │  Nexus Router │ routes to LLM providers
    │  Port 6000    │
    └────┬──────────┘
         │
    ┌────▼────────────────────┐
    │  LLM Providers          │
    │  (OpenAI, Anthropic...)│
    └─────────────────────────┘
```

### With Worker Nodes

Worker nodes (GPU inference) can also use Agent Vault:

```bash
# On worker-rtx5090, etc.
docker --context worker-rtx5090 compose exec vllm bash

# Set proxy and test
export HTTPS\\\_PROXY=http://oracle-vps:14321
curl -s https://api.huggingface.co/repos --proxy http://oracle-vps:14321
```

### With Infisical

If using Infisical PKI + SSH CA:

```bash
# Agent Vault fetches credentials from Infisical
# Infisical PKI signs the Agent Vault's request certificates
# Multi-layer security: PKI + credential brokering
```

\---

## Next Steps

1. ✅ Deploy Agent Vault: `make agent-vault-up`
2. ✅ Create service vault: `make agent-vault-create-service-vault`
3. ✅ Add credentials: Access web UI or use CLI
4. ✅ Configure one service to use proxy: Add `HTTPS\\\_PROXY` to docker-compose
5. ✅ Test end-to-end: Verify requests flow through Agent Vault
6. ✅ Roll out to remaining services gradually

\---

## References

- **Agent Vault Docs**: https://docs.agent-vault.dev
- **Installation Guide**: https://docs.agent-vault.dev/installation
- **Tutorial**: https://docs.agent-vault.dev/tutorial
- **GitHub**: https://github.com/infisical/agent-vault
- **Launch Blog**: https://infisical.com/blog/agent-vault-the-open-source-credential-proxy-and-vault-for-agents

\---

**Generated**: 2026-05-28 | **Status**: Ready for Deployment
**Maintained By**: Claude Code | **Next**: Service integration \& credential population
