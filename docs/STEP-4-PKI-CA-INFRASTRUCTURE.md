# STEP 4: PKI & CA Infrastructure for Fluid SSH Mobility

**Status**: IMPLEMENTATION GUIDE
**Date**: 2026-05-28
**Component**: Infisical PKI, SSH CA, PAM Gateway
**Technology**: Infisical v0.x + TLS 1.3 + Ed25519 Keys

---

## Overview

STEP 4 establishes a **Certificate Authority (CA) infrastructure** enabling passwordless SSH across all 5 cluster nodes without manual key management. Uses Infisical's built-in PKI engine to:

1. **Generate and manage SSH CA** (Certificate Authority)
2. **Issue short-lived SSH certificates** to workers and orchestrator
3. **Configure PAM Gateway** for multi-host credential access
4. **Bootstrap machine identities** for inter-cluster authentication

**Key Benefits:**

- 🔐 **Passwordless SSH**: No SSH keys needed on nodes; CA-signed certs only
- ⏱️ **Short-lived certificates**: 8-hour TTL reduces compromise window
- 🔄 **Centralized issuance**: All certificates issued from oracle-vps CA
- 🚀 **Fluid mobility**: Jump between any cluster node without auth setup
- 📋 **Audit trail**: All certificate issuance logged in Infisical

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│              Infisical PKI Backend                   │
│   (oracle-vps, port 8200 via Caddy)                  │
│  ┌─────────────────────────────────────────────────┐ │
│  │ Root CA (Ed25519)                               │ │
│  │ • Encrypted storage in PostgreSQL               │ │
│  │ • Unwrapped copy in /app/pki for speed          │ │
│  │ • Not exposed over network                      │ │
│  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────┐ │
│  │ SSH CA (subordinate to Root CA)                 │ │
│  │ • Issues short-lived SSH certs (8h default)     │ │
│  │ • Principals: deploy, root, orchestrator       │ │
│  │ • Extensions: permit-pty, permit-port-forward   │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
              ▲              ▲              ▲
              │              │              │
    ┌─────────┴────┐   ┌─────┴──────┐  ┌───┴──────────┐
    │ Orchestrator │   │  Worker    │  │   PAM        │
    │              │   │  Nodes     │  │   Gateway    │
    │ • SSH config │   │            │  │              │
    │ • trusted-   │   │ • sshd_config  │ • Reverse   │
    │   user-ca    │   │ • trusted-user │   proxy SSH │
    │ • Certificate│   │   -ca-keys     │ • Auth      │
    │   signed     │   │               │   delegation │
    └──────────────┘   └────────────────┘  └───────────┘
```

---

## Phase 1: Bootstrap Infisical PKI

### Prerequisites

✅ Infisical deployed and running (`make infisical-deploy`)
✅ Infisical backend accessible via https://infisical.trex-fiordland.ts.net
✅ Initial workspace + admin user created in Infisical UI

### Step 1: Initialize Root CA

**On oracle-vps, via Infisical UI:**

```
1. Navigate to: https://infisical.trex-fiordland.ts.net
2. Login with admin credentials
3. Go to: Admin Console → PKI / Certificate Manager
4. Click: "Initialize Root CA"
5. Configuration:
   - Key Algorithm: Ed25519 (already set via env)
   - Organization: Project Nyra
   - Common Name: nyra-root-ca.trex-fiordland.ts.net
   - TTL: 10 years
6. Review and confirm
```

**Infisical will:**

- Generate Ed25519 private key
- Store encrypted in PostgreSQL + unencrypted working copy in `/app/pki`
- Issue root certificate
- Make available for subordinate CA issuance

### Step 2: Create SSH CA (Subordinate)

**In Infisical UI → PKI → Certificate Authorities:**

```
1. Click: "Create Certificate Authority"
2. Authority Type: SSH CA (subordinate to Root CA)
3. Configuration:
   - Parent CA: nyra-root-ca
   - Key Algorithm: Ed25519
   - Common Name: nyra-ssh-ca.trex-fiordland.ts.net
   - TTL: 5 years
4. SSH-Specific Settings:
   - Key Type: ssh-ed25519
   - Default TTL: 8h (for issued certificates)
   - Allow Role Issuance: ✓
5. Principals (allowed users):
   - deploy
   - root
   - orchestrator
   - nllarson (ops user)
6. Extensions:
   - permit-pty
   - permit-port-forward
   - permit-user-rc
```

---

## Phase 2: Configure SSH Trust

### Oracle-VPS (CA Host) Configuration

**File: `/etc/ssh/sshd_config.d/ca-trust.conf`**

```bash
# Trust Infisical-issued SSH CA for all principals
TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem

# Force use of CA certificates (disable password/pubkey fallback)
PubkeyAuthentication yes
PasswordAuthentication no

# Certificate-specific options
AuthenticationMethods publickey

# Permit forwarding and TTY for certificate holders
PermitTTY yes
PermitOpen any
PermitUserEnvironment no
```

**Fetch CA public key from Infisical and install:**

```bash
# Via Infisical API (after machine identity setup)
curl -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  https://infisical.trex-fiordland.ts.net/api/v1/pki/ca/nyra-ssh-ca/public-key \
  -o /etc/ssh/trusted-user-ca-keys.pem

# Secure permissions
chmod 644 /etc/ssh/trusted-user-ca-keys.pem
chown root:root /etc/ssh/trusted-user-ca-keys.pem
```

### Worker Nodes Configuration

**Same as oracle-vps, but also set reverse DNS for jump host:**

```bash
# File: /etc/ssh/sshd_config.d/ca-trust.conf
TrustedUserCAKeys /etc/ssh/trusted-user-ca-keys.pem

# Allow SSH through PAM Gateway (see Phase 3)
PermitTunnel yes
AllowTcpForwarding yes
X11Forwarding no
```

---

## Phase 3: PAM Gateway Setup

### Architecture

PAM Gateway is Infisical's proxy that:

- Sits between users and private SSH/RDP/database targets
- Dials out to backend (no inbound expose)
- Requires machine identity from requesting service
- Logs all access (audit trail)

### Configuration

**In Infisical UI → Admin → PAM Gateway:**

```
1. Machine Identity for Gateway:
   - Create: "oracle-vps-gateway"
   - Type: Service Account
   - Permissions: SSH access to all machines

2. Gateway Environment:
   - INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: <provided>
   - INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: <provided>
   - INFISICAL_GATEWAY_NAME: oracle-vps-gateway
   - INFISICAL_API_URL: http://infisical-backend:8080
```

**Already deployed in docker-compose.infisical.yml:**

```yaml
infisical-gateway:
  image: infisical/gateway:latest
  environment:
    INFISICAL_UNIVERSAL_AUTH_CLIENT_ID: ${INFISICAL_GATEWAY_CLIENT_ID:-}
    INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET: ${INFISICAL_GATEWAY_CLIENT_SECRET:-}
    INFISICAL_API_URL: http://infisical-backend:8080
    INFISICAL_GATEWAY_NAME: oracle-vps-gateway
  cap_add:
    - NET_ADMIN
  devices:
    - /dev/net/tun:/dev/net/tun
```

### SSH Access via PAM Gateway

Users no longer SSH directly to worker nodes. Instead:

```bash
# Old way (direct SSH, no audit):
ssh deployer@worker-rtx5090.trex-fiordland.ts.net

# New way (via PAM Gateway, with audit):
ssh -o ProxyCommand="infisical-gateway ssh %h %p" deployer@worker-rtx5090.trex-fiordland.ts.net
```

---

## Phase 4: Machine Identity Bootstrap

### Create Machine Identities per Worker

**In Infisical UI → Admin → Machine Identities:**

For each machine (orchestrator, oracle-vps, worker-rtx5090, worker-rtx3090ti, worker-rtx3060):

```
1. Create Identity:
   - Name: ${HOSTNAME}
   - Type: Service Account
   - Authentication: Universal Auth (for container environments)

2. Assign to machine profile (e.g., `/machines/orchestrator`):
   - Grant read access to all required secrets
   - Grant SSH certificate issuance permission

3. Generate Credentials:
   - CLIENT_ID: provided
   - CLIENT_SECRET: provided
   - Store securely in Infisical (inside the machine profile)
```

### Per-Machine Bootstrap Script

**File: `infra/scripts/bootstrap/pki-init.sh`**

```bash
#!/bin/bash
set -euo pipefail

MACHINE_NAME="${1:?machine name required}"
INFISICAL_API="${INFISICAL_API_URL:-https://infisical.trex-fiordland.ts.net}"
CERT_DIR="${2:-/etc/ssh/certs}"

# 1. Fetch machine identity from Infisical
echo "📋 Fetching machine identity for $MACHINE_NAME..."
IDENTITY=$(curl -s -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  "${INFISICAL_API}/api/v1/machine-identities/${MACHINE_NAME}")

CLIENT_ID=$(echo $IDENTITY | jq -r '.clientId')
CLIENT_SECRET=$(echo $IDENTITY | jq -r '.clientSecret')

# 2. Request SSH certificate from SSH CA
echo "🔐 Requesting SSH certificate..."
CERT_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  "${INFISICAL_API}/api/v1/pki/ca/nyra-ssh-ca/issue" \
  -d "{
    \"publicKey\": \"$(ssh-keyscan localhost 2>/dev/null | awk '{print $3}')\",
    \"ttl\": \"8h\",
    \"principals\": [\"deploy\", \"root\"]
  }")

SSH_CERT=$(echo $CERT_RESPONSE | jq -r '.certificate')

# 3. Install certificate
mkdir -p $CERT_DIR
echo "$SSH_CERT" > ${CERT_DIR}/id_ed25519-cert.pub
chmod 644 ${CERT_DIR}/id_ed25519-cert.pub

# 4. Update SSH config
cat >> /etc/ssh/ssh_config.d/infisical-ca.conf <<EOF
Host *.trex-fiordland.ts.net
    User deploy
    IdentityFile ${CERT_DIR}/id_ed25519-cert.pub
    StrictHostKeyChecking accept-new
    UserKnownHostsFile /etc/ssh/known_hosts
EOF

echo "✅ PKI bootstrap complete for $MACHINE_NAME"
```

**Run on each node during startup:**

```bash
bash infra/scripts/bootstrap/pki-init.sh orchestrator
bash infra/scripts/bootstrap/pki-init.sh worker-rtx5090
bash infra/scripts/bootstrap/pki-init.sh worker-rtx3090ti
bash infra/scripts/bootstrap/pki-init.sh worker-rtx3060
```

---

## Phase 5: Verification

### Test Root CA

```bash
# From Windows 11 workstation (via Tailscale):
curl -v https://infisical.trex-fiordland.ts.net/api/v1/pki/ca/nyra-root-ca/certificate

# Should return PEM-encoded certificate
# Verify issuer: Infisical Root CA v1
```

### Test SSH CA Certificate Issuance

```bash
# From orchestrator (with INFISICAL_TOKEN set):
curl -X POST \
  -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  https://infisical.trex-fiordland.ts.net/api/v1/pki/ca/nyra-ssh-ca/issue \
  -d '{
    "publicKey": "ssh-ed25519 AAAA...",
    "ttl": "8h",
    "principals": ["deploy"]
  }'

# Should return signed certificate with:
# - 8h validity
# - Principal: deploy
# - Extensions: permit-pty, permit-port-forward
```

### Test SSH Access (Post-Bootstrap)

```bash
# From orchestrator to worker:
ssh deploy@worker-rtx5090.trex-fiordland.ts.net

# Should connect without password/key prompt
# Auth via SSH certificate signed by nyra-ssh-ca

# Verify certificate details:
ssh-keygen -L -f ~/.ssh/id_ed25519-cert.pub
```

### Test PAM Gateway

```bash
# Configure local SSH client to use PAM Gateway:
ssh -o ProxyCommand="infisical-gateway ssh %h %p" \
    deploy@worker-rtx5090.trex-fiordland.ts.net

# Access logged in Infisical audit trail:
# Infisical UI → Admin → Audit Logs → Filter: SSH Access
```

---

## Operational Commands

### Makefile Targets

```bash
# Initialize PKI infrastructure
make pki-init

# Generate SSH CA (one-time)
make pki-ssh-ca-init

# Issue certificate for a machine
make pki-issue-cert MACHINE=orchestrator TTL=8h

# Revoke certificate
make pki-revoke-cert CERT_ID=<id>

# View CA public key
make pki-ca-pubkey

# List all issued certificates
make pki-list-certs

# Verify certificate details
make pki-verify-cert CERT=<path-to-cert>

# Fetch and install CA key on local system
make pki-install-ca-key

# Bootstrap PKI on all workers
make pki-bootstrap-all

# Health check PKI infrastructure
make pki-health
```

### Manual Certificate Issuance

```bash
# Issue new certificate via API
INFISICAL_TOKEN=$(cat ~/.zsh/99-secrets.zsh | grep INFISICAL_TOKEN)

curl -X POST https://infisical.trex-fiordland.ts.net/api/v1/pki/ca/nyra-ssh-ca/issue \
  -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  -d '{
    "publicKey": "ssh-ed25519 ...",
    "ttl": "8h",
    "principals": ["deploy", "root"]
  }' | jq .certificate -r > /tmp/id_ed25519-cert.pub
```

---

## Security Considerations

### Key Rotation

Root CA private key is **non-rotatable** — losing it requires reissuing all certificates. Mitigations:

- ✅ Encrypted storage in PostgreSQL (ENCRYPTION_KEY protection)
- ✅ Unencrypted working copy only in `/app/pki` (local to container)
- ✅ Access via Infisical RBAC (no direct export)
- ✅ Offline backup: `make infisical-backup`

### Certificate Revocation

SSH CA supports certificate revocation. If a certificate is compromised:

```bash
# Revoke via Infisical UI or API
curl -X POST https://infisical.trex-fiordland.ts.net/api/v1/pki/ca/revoke \
  -H "Authorization: Bearer ${INFISICAL_TOKEN}" \
  -d '{"serialNumber": "..."}'

# sshd will reject revoked certificates immediately (no TTL countdown)
```

### Audit & Compliance

All certificate operations logged:

- Certificate issuance (who, when, principals)
- Certificate revocation (who, when, reason)
- CA key access (if enabled)
- PAM Gateway access (all SSH sessions)

Access logs at: `Infisical UI → Admin → Audit Logs`

---

## Troubleshooting

| Issue                              | Cause                    | Solution                                    |
| ---------------------------------- | ------------------------ | ------------------------------------------- |
| "Certificate not found"            | CA not initialized       | Run `make pki-init`                         |
| SSH: "Permission denied"           | Certificate expired      | Issue new cert via `make pki-issue-cert`    |
| "Public key rejected"              | sshd doesn't trust CA    | Verify `TrustedUserCAKeys` installed        |
| PAM Gateway won't start            | Machine identity missing | Create in Infisical UI → Machine Identities |
| Certificate revocation not working | sshd_config missing      | Update to include CRL check                 |

---

## Next: STEP 5 (Master Makefile Alignment)

STEP 5 consolidates all 5 docker contexts with unified fleet commands:

```bash
# Deploy full cluster
make fleet-deploy

# Health check all nodes
make fleet-health

# Unified logs across all hosts
make fleet-logs SERVICE=nexus

# Restart service on specific workers
make fleet-restart-worker HOST=worker-rtx5090 SERVICE=ollama
```

---

**Generated**: 2026-05-28 | **Status**: Ready for Deployment
**Maintained By**: Claude Code | **Next**: STEP 5 Makefile Consolidation
