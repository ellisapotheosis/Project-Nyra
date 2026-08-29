# OpenClaw Device Approval Guide

**Date:** 2026-08-25  
**Device ID:** `3df0601a-8c73-417b-8030-8f586eadb92c`  
**Status:** Awaiting approval

---

## What This Does

OpenClaw uses devices to identify and authenticate connected nodes (orchestrator PC, worker PCs, etc.). Before agents can run tasks, both machines must be approved as trusted devices.

**Approval:** Authorizes this device to participate in the Nyra cluster.

---

## Prerequisites

You need SSH access to the orchestrator PC:

```bash
ssh orchestrator
# Or if using IP
ssh root@192.168.x.x
```

---

## Method 1: SSH to Orchestrator (Recommended)

Run on the orchestrator machine:

```bash
ssh orchestrator

# Now you're logged into the orchestrator
# Run device approval command
docker exec orchestrator-openclaw-gateway openclaw devices approve 3df0601a-8c73-417b-8030-8f586eadb92c

# Expected output:
# Device 3df0601a-8c73-417b-8030-8f586eadb92c: APPROVED
```

---

## Method 2: Direct SSH Command

Run from your local machine:

```bash
ssh orchestrator "docker exec orchestrator-openclaw-gateway openclaw devices approve 3df0601a-8c73-417b-8030-8f586eadb92c"

# Expected output:
# Device 3df0601a-8c73-417b-8030-8f586eadb92c: APPROVED
```

---

## Method 3: Windows PowerShell (If orchestrator is Windows)

```powershell
# Connect via SSH
ssh orchestrator

# Then run the approval command (same as Method 1)
docker exec orchestrator-openclaw-gateway openclaw devices approve 3df0601a-8c73-417b-8030-8f586eadb92c
```

---

## Verify Approval

Check that device is now approved:

```bash
docker exec orchestrator-openclaw-gateway openclaw devices list

# Output should show:
# ID: 3df0601a-8c73-417b-8030-8f586eadb92c
# Status: APPROVED
# Hostname: [your-machine-name]
# Last seen: 2026-08-25T...
```

---

## If Approval Fails

### Error: "Docker daemon not responding"

```bash
# Make sure Docker is running
systemctl status docker

# Or restart if needed
sudo systemctl restart docker
```

### Error: "Container not found"

```bash
# Check if OpenClaw container is running
docker ps | grep openclaw

# If not running, start it
docker compose up -d openclaw-gateway
```

### Error: "Device already approved"

```bash
# Device is already approved, no action needed
# Verify with:
docker exec orchestrator-openclaw-gateway openclaw devices list
```

### Error: "Permission denied"

```bash
# Add yourself to docker group (one-time)
sudo usermod -aG docker $USER
newgrp docker

# Then retry the command
```

---

## Next Steps

After approval:

1. **Verify both nodes are connected**

   ```bash
   docker exec orchestrator-openclaw-gateway openclaw cluster status
   # Should show all nodes as "CONNECTED"
   ```

2. **Check node roles**

   ```bash
   docker exec orchestrator-openclaw-gateway openclaw nodes list
   # Should show orchestrator and workers with their capabilities
   ```

3. **Trigger first task**
   ```bash
   docker exec orchestrator-openclaw-gateway openclaw task create \
     --description "Hello from Nyra" \
     --agent-type test
   ```

---

## What "APPROVED" Means

Once approved:

- ✓ Device can join the Nyra cluster
- ✓ Device can request tasks from OpenClaw
- ✓ Device can report results back
- ✓ Device participates in consensus (if configured)
- ✗ Device cannot modify cluster configuration (needs additional admin permissions)

---

## To Revoke Approval (Later)

If needed:

```bash
docker exec orchestrator-openclaw-gateway openclaw devices revoke 3df0601a-8c73-417b-8030-8f586eadb92c

# Device will be disconnected
# Must be re-approved to participate
```

---

## Troubleshooting

| Issue                    | Solution                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| SSH connection refused   | Check network connectivity, verify SSH key permissions (600)      |
| Docker command not found | Install Docker, or use sudo docker                                |
| Device ID not recognized | Verify device ID is correct (64 hex chars)                        |
| OpenClaw container fails | Check container logs: `docker logs orchestrator-openclaw-gateway` |

---

## When Complete

Once device is approved and connected:

- Cluster shows both nodes as "READY"
- Agents can spawn on either node
- Tasks can be routed to workers
- Multi-agent coordination works

**Status:** Ready for production cluster operations.

---

**Execute the approval command above, then verify with the checklist.**
