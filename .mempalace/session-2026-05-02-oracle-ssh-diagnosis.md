# Oracle VPS SSH Diagnosis & Recovery — 2026-05-02

## Executive Summary
Oracle VPS instance is RUNNING but SSH daemon is DOWN. SSH keys retrieved from Infisical. Attempted OCI Instance Console Connection but hit auth barriers. Need manual SSH service restart via OCI Console.

## Confirmed Facts

### Infrastructure Status
- **Instance State**: RUNNING (verified via OCI CLI)
- **Instance IDs**: 
  - Primary: ocid1.instance.oc1.us-sanjose-1.anzwuljro7i7hqycbvvh3otboafcvqcvs5egk227iwpb3b4u6ece4ihdiy2q
  - Secondary: ocid1.instance.oc1.us-sanjose-1.anzwuljro7i7hqycwyikalutrtd4pwek62a3yem2gmdfjn6x6mz2udh2xcuq
- **Instance Name**: nyra-oracle-a1
- **Region**: us-sanjose-1
- **Tailscale IP**: 100.64.0.31
- **Network**: Reachable via ping (RTT ~0.068ms)

### SSH Service Status
```
All ports REFUSED:
Port 22:   ✗ Connection refused
Port 2223: ✗ Connection refused
Port 2224: ✗ Connection refused (was OPEN earlier)
Port 2225: ✗ Connection refused
Port 8000: ✗ Connection refused
Port 8080: ✗ Connection refused
```

**Diagnosis**: SSH daemon crashed, stopped, or Docker container exited.

## SSH Keys (Infisical)

### Retrieved Successfully
- **Private Key**: RSA format, /tmp/oracle_ssh_key.pem
- **Public Key**: ssh-rsa AAAAB3NzaC1yc2E...
- **Infisical Path**: /machines/oracle-vps/SSH_PRIVATE_KEY
- **Infisical Flags**: --projectId="8374cea9-e5e8-4050-bda4-b91f25ab30ef" --env="dev" --path="/machines/oracle-vps"

### Still Needed for authorized_keys
- **Orchestrator ED25519 Public**: ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEa7lsboDjyi5+lRqLWlx691mA9IvYOUXqGNWYVo7ZLq edane@MinisApotheosis

## OCI Console Connection

### Created
- **Connection ID**: ocid1.instanceconsoleconnection.oc1.us-sanjose-1.anzwuljro7i7hqyc2loejl7sfybtacw3x4joyyonkkml4xf5l55q2tvkyatq
- **State**: CREATING
- **Service Host Key Fingerprint**: SHA256:wqiJKyZ+oEH1+sKRLS/lC36gY8A3i0IDvQIWQUSM1Ug

### Connection String
```bash
ssh -i /tmp/oracle_ssh_key.pem \
  -o ProxyCommand='ssh -W %h:%p -p 443 ocid1.instanceconsoleconnection.oc1.us-sanjose-1.anzwuljro7i7hqyc2loejl7sfybtacw3x4joyyonkkml4xf5l55q2tvkyatq@instance-console.us-sanjose-1.oci.oraclecloud.com' \
  ocid1.instance.oc1.us-sanjose-1.anzwuljro7i7hqycbvvh3otboafcvqcvs5egk227iwpb3b4u6ece4ihdiy2q
```

### Auth Failed
- **Error**: Permission denied (publickey)
- **Root Cause**: Console connection expects different key or auth mechanism
- **Status**: Blocked

## OCI CLI Findings

### Valid Actions
- start, stop, reset, softreset, softstop, diagnosticreboot
- NOT: REBOOT

### Constraints
- All instance queries require --compartment-id (tenancy ID)
- Field names use hyphens (display-name, lifecycle-state)
- JMESPath requires escaped field names: ["display-name"]

## Recovery Options (User Action Required)

### Option A: OCI Console Web Interface (Recommended)
1. Log into Oracle Cloud Console
2. Compute → Instances → nyra-oracle-a1
3. Click "Instance Console Connections" tab
4. Use web console to access instance serial console
5. Run: `sudo systemctl restart ssh` OR `sudo systemctl restart sshd`
6. Or: `sudo systemctl status ssh` to check if service running
7. If Docker: `docker restart <container-name>`

### Option B: OCI CLI Soft Reset
```bash
oci compute instance action --action softreset \
  --instance-id ocid1.instance.oc1.us-sanjose-1.anzwuljro7i7hqycbvvh3otboafcvqcvs5egk227iwpb3b4u6ece4ihdiy2q
```
(Will reboot instance; SSH should auto-restart if configured in startup scripts)

### Option C: Investigate Root Cause
1. SSH service crashed (check logs)
2. Docker container stopped (check container status)
3. Network reconfiguration (check firewall rules)
4. Port conflict (something else on 2224)

## Next Steps After SSH Restart
1. Verify SSH is listening on 2224: `nc -zv 100.64.0.31 2224`
2. Test SSH: `ssh -i /tmp/oracle_ssh_key.pem -p 2224 ubuntu@100.64.0.31`
3. Add orchestrator key to authorized_keys:
   ```bash
   echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEa7lsboDjyi5+lRqLWlx691mA9IvYOUXqGNWYVo7ZLq edane@MinisApotheosis" >> ~/.ssh/authorized_keys
   ```
4. Then: Full SSH cluster standardization (all nodes to port 2224, public keys synced)

## OCI CLI Commands Reference

### List instances
```bash
oci compute instance list \
  --region us-sanjose-1 \
  --compartment-id ocid1.tenancy.oc1..aaaaaaaawvnpdemjgl25dpnoxqmaplxrpoi34kxhbuum2gntzoz2kxsfabyq \
  --query 'data[]' \
  --output json
```

### Instance action
```bash
oci compute instance action \
  --action softreset \
  --instance-id <INSTANCE_OCID>
```

### Tenancy OCID
ocid1.tenancy.oc1..aaaaaaaawvnpdemjgl25dpnoxqmaplxrpoi34kxhbuum2gntzoz2kxsfabyq
