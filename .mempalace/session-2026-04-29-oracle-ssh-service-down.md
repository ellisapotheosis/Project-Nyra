# Oracle VPS SSH Service Status — 2026-04-29 Session 2

## Critical Finding: SSH Service Down

**Timeline:**
- Earlier: Port 2224 OPEN (netcat succeeded)
- Minutes later: All SSH ports REFUSED

### Current Status
```
Host reachable:   YES (ping succeeds, RTT ~0.068ms)
Port 22:          REFUSED ✗
Port 2223:        REFUSED ✗
Port 2224:        REFUSED ✗ (was OPEN)
Port 2225:        REFUSED ✗
Port 8000:        REFUSED ✗
Port 8080:        REFUSED ✗
```

### Root Cause Analysis
- SSH service crashed/stopped
- Docker container may have stopped
- Instance may have rebooted
- Service didn't auto-restart

## Infisical SSH Key Retrieved
- **Path**: /machines/oracle-vps/SSH_PRIVATE_KEY
- **Format**: RSA private key (-----BEGIN RSA PRIVATE KEY-----)
- **Status**: Successfully fetched, but cannot use (service down)
- **Infisical Project ID**: 8374cea9-e5e8-4050-bda4-b91f25ab30ef
- **Flag for future use**: --projectId (camelCase, not --project-id)

## Recovery Options

### Option A: OCI Console Check
1. Check instance state (running vs stopped)
2. Check compute metrics/logs
3. Check if startup scripts configured

### Option B: OCI CLI Instance Status
```bash
oci compute instance list --region us-sanjose-1
oci compute instance-console-connection create \
  --instance-id <OCID> \
  --public-key-file ~/.ssh/id_rsa.pub
```

### Option C: If Instance Rebooted
- May need to wait for auto-startup scripts
- Or manually connect via console and restart sshd

## Key Material
**Orchestrator ED25519 public key** (still needed for authorized_keys):
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEa7lsboDjyi5+lRqLWlx691mA9IvYOUXqGNWYVo7ZLq edane@MinisApotheosis
```

**OCI Region**: us-sanjose-1
**Instance Name**: nyra-oracle-a1
**Tailscale IP**: 100.64.0.31
