# Infisical PAM Gateway Deployment & SSH CA Distribution

## Overview

The Infisical-gateway container acts as the egress relay for SSH access across the Project Nyra cluster without exposing individual SSH services to the public internet. It:

1. **Distributes SSH CA Public Key** to all cluster nodes for certificate validation
2. **Proxies SSH Connections** from clients through the Tailscale mesh
3. **Records Audit Logs** of all SSH access in Infisical for compliance
4. **Manages Certificate Revocation** if needed (via revocation lists)

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Infisical-gateway (oracle-vps, docker-compose.infisical.yml) │
│                                                              │
│  - Authenticates to Infisical backend via machine identity   │
│  - Listens for outbound SSH connections from clients         │
│  - Routes SSH to target hosts (orchestrator, workers)        │
│  - Logs all access to Infisical audit trail                  │
└──────────────────────────────────────────────────────────────┘
                            ↓
          ┌─────────────────┬─────────────────┐
          ↓                 ↓                 ↓
    ┌──────────────┐  ┌──────────────┐ ┌──────────────┐
    │ orchestrator │  │ worker-5090  │ │ worker-3060  │
    │ (sshd + CA)  │  │ (sshd + CA)  │ │ (sshd + CA)  │
    └──────────────┘  └──────────────┘ └──────────────┘
```

## Prerequisites

- [ ] Infisical backend deployed and healthy (`docker-compose.infisical.yml`)
- [ ] Machine identity credentials for gateway (INFISICAL_GATEWAY_CLIENT_ID/SECRET)
- [ ] Tailscale mesh connectivity between all nodes
- [ ] SSH service running on all target hosts with sshd_config.infisical-ca

## Step 1: Create Machine Identity for Gateway

The gateway needs to authenticate to the Infisical backend. Create a machine identity in Infisical UI:

```bash
# 1. Log into Infisical web UI at https://infisical.trex-fiordland.ts.net
# 2. Navigate: Settings > Machine Identities > Create Machine Identity
# 3. Name: "oracle-vps-gateway"
# 4. Role: Read secrets (for SSH CA configuration)
# 5. Copy CLIENT_ID and CLIENT_SECRET
# 6. Store in .env.infisical:
#
#    INFISICAL_GATEWAY_CLIENT_ID=<copied-id>
#    INFISICAL_GATEWAY_CLIENT_SECRET=<copied-secret>
```

## Step 2: Deploy Gateway Container

The gateway is already defined in `docker-compose.infisical.yml`:

```yaml
infisical-gateway:
  image: infisical/gateway:latest
  environment:
    INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: ${INFISICAL_GATEWAY_CLIENT_ID}
    INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: ${INFISICAL_GATEWAY_CLIENT_SECRET}
    INFISICAL_API_URL: http://infisical-backend:8080
    INFISICAL_GATEWAY_NAME: oracle-vps-gateway
  cap_add:
    - NET_ADMIN  # Required for TUN device
  devices:
    - /dev/net/tun:/dev/net/tun
```

Deploy with:

```bash
docker --context oracle-vps compose \
  -f infra/hosts/oracle-vps/docker-compose.infisical.yml \
  up -d infisical-gateway
```

Verify health:

```bash
docker --context oracle-vps exec nyra-infisical-gateway \
  curl -s http://localhost:8080/health | jq .
```

## Step 3: Distribute SSH CA Public Key to All Nodes

The gateway distributes Infisical's SSH CA public key. Each target node trusts this key in `TrustedUserCAKeys`.

### 3a: Download CA Public Key (Local)

```bash
# From your workstation with Tailscale access:
curl -k https://infisical.trex-fiordland.ts.net/api/v1/ssh-ca/public-key \
  > ./infisical-ca.pub

# Verify the key format:
cat infisical-ca.pub
# Should output: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxx...
```

### 3b: Deploy to Each Node

For each cluster node (orchestrator, worker-rtx5090, worker-rtx3060, worker-rtx3090ti):

```bash
# Option A: Manual deployment via SSH (requires existing SSH access)
scp ./infisical-ca.pub user@orchestrator:/tmp/
ssh user@orchestrator 'sudo mv /tmp/infisical-ca.pub /etc/ssh/ && \
                       sudo chmod 644 /etc/ssh/infisical-ca.pub'

# Option B: Automated via Infisical-gateway (once SSH CA is established)
# Use Infisical CLI with machine identity to distribute via secure channel
```

### 3c: Verify Deployment

```bash
# On each target node:
ssh user@orchestrator 'cat /etc/ssh/infisical-ca.pub'
# Should match the key from step 3a
```

## Step 4: Deploy sshd_config to All Nodes

Copy the template to each node and validate:

```bash
# Backup existing config
ssh user@orchestrator 'sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%s)'

# Deploy template
scp ./sshd_config.infisical-ca user@orchestrator:/tmp/
ssh user@orchestrator 'sudo mv /tmp/sshd_config.infisical-ca /etc/ssh/sshd_config'

# Validate syntax
ssh user@orchestrator 'sudo sshd -T'
# Should output config with no errors

# Restart SSH
ssh user@orchestrator 'sudo systemctl restart ssh'
```

## Step 5: Test Certificate-Based SSH Login

### 5a: Request SSH Certificate from Infisical

```bash
# Using Infisical CLI (requires authentication):
infisical ssh cert request \
  --username root \
  --hostname orchestrator.trex-fiordland.ts.net \
  --ttl 8h

# Or via Infisical web UI:
# 1. Log in to https://infisical.trex-fiordland.ts.net
# 2. Dashboard > SSH Certificates > Request Certificate
# 3. Fill in: Hostname, Username, TTL
# 4. Download certificate (ssh-cert.pub)
```

### 5b: Add Certificate to SSH Config

```bash
# ~/.ssh/config on your workstation:
Host orchestrator
    HostName orchestrator.trex-fiordland.ts.net
    User root
    IdentityFile ~/.ssh/id_ed25519
    CertificateFile ~/.ssh/infisical-cert-orchestrator.pub  # From step 5a
```

### 5c: Test SSH Login

```bash
ssh -v orchestrator
# Expected output should include:
#   Offering public key: ... (certificate)
#   Server accepts key: ... (certificate)
#   Authentications that can continue: publickey
#   Authenticated with certificate
```

## Step 6: Audit & Monitoring

All SSH access via certificates is logged in Infisical. View audit trail:

```bash
# Via Infisical web UI:
# Settings > Audit Logs > Filter: SSH Certificate Access

# Or via API:
curl -k https://infisical.trex-fiordland.ts.net/api/v1/audit-logs \
  -H "Authorization: Bearer ${INFISICAL_TOKEN}" | jq .
```

## Step 7: Troubleshooting

### SSH connection fails with "permission denied (publickey)"

**Cause**: sshd cannot verify certificate against CA public key

**Fix**:
```bash
# 1. Verify CA public key is present and readable:
ssh user@orchestrator 'cat /etc/ssh/infisical-ca.pub'

# 2. Verify sshd is using it:
ssh user@orchestrator 'grep TrustedUserCAKeys /etc/ssh/sshd_config'
# Should output: TrustedUserCAKeys /etc/ssh/infisical-ca.pub

# 3. Check sshd logs:
ssh user@orchestrator 'journalctl -u ssh -n 50'
# Look for errors about certificate validation
```

### Gateway cannot connect to backend

**Cause**: Machine identity credentials invalid or gateway not in network

**Fix**:
```bash
# 1. Verify credentials:
docker --context oracle-vps exec nyra-infisical-gateway \
  env | grep INFISICAL_

# 2. Verify network connectivity:
docker --context oracle-vps exec nyra-infisical-gateway \
  curl -s http://infisical-backend:8080/api/status

# 3. Check gateway logs:
docker --context oracle-vps logs -f nyra-infisical-gateway
```

### Certificate expired

**Cause**: SSH certificate TTL exceeded (default 8h)

**Fix**:
```bash
# Request new certificate from Infisical
infisical ssh cert request \
  --username root \
  --hostname orchestrator.trex-fiordland.ts.net \
  --ttl 8h

# Update ~/.ssh/config with new certificate path
# Retry SSH login
```

## Security Considerations

1. **SSH CA Public Key Rotation**: Monitored by Infisical. When rotated, all nodes must update `/etc/ssh/infisical-ca.pub` before old certificates expire.

2. **Machine Identity Rotation**: Periodically rotate INFISICAL_GATEWAY_CLIENT_SECRET via Infisical UI to prevent key compromise.

3. **Short-Lived Certificates**: Default 8h TTL forces certificate refresh, limiting blast radius of compromised keys.

4. **Audit Trail**: All SSH access is logged. Review regularly for unauthorized activity.

5. **Network Isolation**: Gateway only accessible within Tailscale mesh. No public SSH exposure.

## Production Checklist

- [ ] Infisical backend deployed and healthy
- [ ] Gateway container running with valid machine identity
- [ ] SSH CA public key distributed to all cluster nodes
- [ ] sshd_config deployed and validated on all nodes
- [ ] SSH service restarted on all nodes
- [ ] Test certificate-based login on all nodes
- [ ] Audit logs verified for successful access
- [ ] Backup of original sshd_config on all nodes
- [ ] Documentation shared with team

## References

- Infisical SSH CA: https://infisical.com/docs/features/ssh-ca
- OpenSSH Certificate Format: https://man.openbsd.org/ssh-keygen#CERTIFICATES
- Infisical Gateway: https://infisical.com/docs/features/pam

