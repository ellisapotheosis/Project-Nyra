# PORTAINER_SYNCTHING_RUNBOOK

Last updated: 2026-05-24

## Critical Rule

`docker-compose.persistent.yml` exists on **every host** and contains only Portainer
and Syncthing. These services must **never** be stopped by routine application stack
operations. Running `make persistent-down` or `docker compose ... down` against the
persistent stack is forbidden.

---

## Portainer

### Topology

| Host             | Container                                    | Image                         | Port                       | Role         |
| ---------------- | -------------------------------------------- | ----------------------------- | -------------------------- | ------------ |
| oracle-vps       | nyra-persistent-oracle-portainer-ce          | portainer/portainer-ce:2.27.9 | 9000 (HTTP) / 9443 (HTTPS) | Control node |
| orchestrator     | nyra-persistent-orchestrator-portainer-agent | portainer/agent:2.27.9        | 9001                       | Edge agent   |
| worker-rtx5090   | nyra-persistent-5090-portainer-agent         | portainer/agent:2.27.9        | 9001                       | Edge agent   |
| worker-rtx3090ti | nyra-persistent-3090ti-portainer-agent       | portainer/agent:2.27.9        | 9001                       | Edge agent   |
| worker-rtx3060   | nyra-persistent-3060-portainer-agent         | portainer/agent:2.27.9        | 9001                       | Edge agent   |

### Access

- Portainer UI: `https://100.64.0.3:9443` (Tailscale) or via cloudflare tunnel
- Login credentials: stored in Vaultwarden (homeassistant-green)
- Edge agents connect back to the Portainer CE instance on oracle-vps

### Deploy / Update Portainer

```bash
# Deploy persistent stack on oracle-vps
ssh user@100.64.0.3
cd infra/hosts/oracle-vps
docker compose -f docker-compose.persistent.yml up -d

# Deploy agent on a worker (example: worker-rtx5090)
docker --context worker-5090 compose \
  -f docker-compose.persistent.yml up -d

# Sync the Oracle application bundle into Portainer from the repo
PORTAINER_API_KEY=... PORTAINER_INSECURE_TLS=1 make oracle-portainer-sync
```

The sync target renders the Oracle compose bundle from Git and pushes it into the
Portainer CE API. Keep the live stack in Portainer, but keep the compose files in
Git as the source of truth.

### Volume Pinning

Portainer CE data volume:

```yaml
volumes:
  portainer_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /data/portainer # host path; survives container restarts
```

Ensure `/data/portainer` exists on oracle-vps before first deploy:

```bash
sudo mkdir -p /data/portainer
```

---

## Syncthing

### Topology

Syncthing runs on every host and maintains a mesh sync of designated folders
(config, shared secrets bootstrap, documentation snapshots).

| Host                | Port (UI) | Port (Sync)   |
| ------------------- | --------- | ------------- |
| oracle-vps          | 8384      | 22000/TCP+UDP |
| orchestrator        | 8384      | 22000/TCP+UDP |
| worker-rtx5090      | 8384      | 22000/TCP+UDP |
| worker-rtx3090ti    | 8384      | 22000/TCP+UDP |
| worker-rtx3060      | 8384      | 22000/TCP+UDP |
| homeassistant-green | 8384      | 22000/TCP+UDP |

Syncthing communicates peer-to-peer over Tailscale. Relay servers are disabled;
all transfers are direct Tailscale paths.

### Access Syncthing UI

```
http://<tailscale-ip>:8384
```

Credentials stored in Vaultwarden. Do not expose Syncthing UI to public internet.

### Deploy Syncthing

```bash
# Same persistent stack as Portainer
docker compose -f docker-compose.persistent.yml up -d syncthing
```

---

## Operational Commands

```bash
# Check persistent stack status on oracle-vps
ssh user@100.64.0.3 "docker compose -f infra/hosts/oracle-vps/docker-compose.persistent.yml ps"

# Check via Docker context (from orchestrator)
docker --context oracle-vps compose \
  -f docker-compose.persistent.yml ps

# NEVER run this:
# docker compose -f docker-compose.persistent.yml down   ← FORBIDDEN
```

---

## If Portainer Goes Down

1. SSH to oracle-vps directly: `ssh user@100.64.0.3`
2. `cd infra/hosts/oracle-vps`
3. `docker compose -f docker-compose.persistent.yml up -d`
4. Verify `nyra-persistent-oracle-portainer-ce` is running
5. Confirm edge agents reconnect within 60 seconds in the Portainer UI

## If Syncthing Goes Down on a Host

1. Connect to the host via Docker context or SSH
2. `docker compose -f docker-compose.persistent.yml restart syncthing`
3. Verify sync resumes by checking Syncthing UI on that host
