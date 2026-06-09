# Portainer & Syncthing Setup — Project Nyra

Completed: 2026-05-28
Credentials for all Portainer and Syncthing instances.

---

## Credentials (all instances)

| Service | Username | Password |
|---------|----------|----------|
| Portainer (all) | ellisapotheosis | 1th7aa6ch8oA1! |
| Syncthing (all) | ellisapotheosis | 1th7aa6ch8oA1! |

---

## Portainer

### Central Server — oracle-vps

| Item | Value |
|------|-------|
| URL | http://oracle-vps.trex-fiordland.ts.net:9000 |
| HTTPS | https://oracle-vps.trex-fiordland.ts.net:9443 |
| Tailscale IP | 100.64.0.3:9000 |
| Edge tunnel port | 8050 (host) → 8000 (container) |
| **API Token** | `ptr_w5BiYEUjE5pRHaQtnhv3tmE25A60bEhwBtDS9ytDekY=` |
| Container | nyra-persistent-oracle-portainer-ce |

#### Connected Environments

| ID | Name | Type | Status |
|----|------|------|--------|
| 1 | oracle-local | Docker (local socket) | CONNECTED |
| 6 | orchestrator | Edge Agent | CONNECTED |
| 7 | worker-rtx3060 | Edge Agent | CONNECTED |
| 8 | worker-rtx3090ti | Edge Agent | CONNECTED |
| 9 | worker-rtx5090 | Edge Agent | CONNECTED |

### Standalone Portainer CE — worker-rtx3060

| Item | Value |
|------|-------|
| URL | https://worker-rtx3060.trex-fiordland.ts.net:9443 |
| **API Token** | `ptr_HTbhv0wX0vmFhmFukKYvJu1YXxkn219yxzYNucvRUAE=` |
| Container | portainer-ce |

---

## Portainer Edge Keys (for agent containers)

These are stored in `infra/hosts/<host>/.env` as `PORTAINER_EDGE_KEY`.

| Host | Portainer Endpoint ID | Edge Key (base64) |
|------|-----------------------|-------------------|
| orchestrator | 6 | `aHR0cDovL29yYWNsZS12cHMudHJleC1maW9yZGxhbmQudHMubmV0OjkwMDB8b3JhY2xlLXZwcy50cmV4LWZpb3JkbGFuZC50cy5uZXQ6ODA1MHxFdm4vN1NiZVJsb2xDNkpydWtYNlVLandJU2VYQS9HUDJFenRFYmRySGhjPXw2` |
| worker-rtx3060 | 7 | `aHR0cDovL29yYWNsZS12cHMudHJleC1maW9yZGxhbmQudHMubmV0OjkwMDB8b3JhY2xlLXZwcy50cmV4LWZpb3JkbGFuZC50cy5uZXQ6ODA1MHxFdm4vN1NiZVJsb2xDNkpydWtYNlVLandJU2VYQS9HUDJFenRFYmRySGhjPXw3` |
| worker-rtx3090ti | 8 | `aHR0cDovL29yYWNsZS12cHMudHJleC1maW9yZGxhbmQudHMubmV0OjkwMDB8b3JhY2xlLXZwcy50cmV4LWZpb3JkbGFuZC50cy5uZXQ6ODA1MHxFdm4vN1NiZVJsb2xDNkpydWtYNlVLandJU2VYQS9HUDJFenRFYmRySGhjPXw4` |
| worker-rtx5090 | 9 | `aHR0cDovL29yYWNsZS12cHMudHJleC1maW9yZGxhbmQudHMubmV0OjkwMDB8b3JhY2xlLXZwcy50cmV4LWZpb3JkbGFuZC50cy5uZXQ6ODA1MHxFdm4vN1NiZVJsb2xDNkpydWtYNlVLandJU2VYQS9HUDJFenRFYmRySGhjPXw5` |

Edge key decoded format: `http://oracle-vps.trex-fiordland.ts.net:9000|oracle-vps.trex-fiordland.ts.net:8050|<credential>|<endpoint_id>`

---

## Syncthing

### Device IDs

| Host | Device ID (first 7) | Full Device ID |
|------|---------------------|----------------|
| orchestrator | OBN2HMP | OBN2HMP-LPA7IQ4-3FJSZJK-UAQVRDT-JC4XZTQ-NVHCG2T-APHP32U-NIOBNQQ |
| worker-rtx3060 | 5QAPMTU | 5QAPMTU-AAJ54CT-E5QJAJP-VQKGRWQ-SPF3IEX-LZDCAHP-3HQKVEQ-6CWTSAC |
| worker-rtx3090ti | GGHBN47 | GGHBN47-V5RG62Y-OKAFGYP-W6BDCCY-P2NDINX-QHKKQGD-YMRZHT4-L3FJLAI |
| worker-rtx5090 | UDR6IHT | UDR6IHT-SHYLKTA-64S5OXJ-6K5O4NA-HQ2SPSI-F7RFZ72-SGBA3DH-7WY76AX |

**Note**: worker-rtx3090ti ID changed from ZE3VRPG to GGHBN47 (container was reset).

### API Keys (from config.xml)

| Host | API Key |
|------|---------|
| orchestrator | `4CcGMzyMLkW3VwXCcZpnGb339fzF75d7` |
| worker-rtx3060 | `TDrSQE4bkQZbzg4M96e3DYqLnrRZFHx6` |
| worker-rtx3090ti | `e5VEtfTofc7CQLGRSmGxPgRLKrhUYJgK` |
| worker-rtx5090 | `2XsQiAzzjxcGQwoVADAZcXjxRKiHJUsW` |

### Syncthing UI URLs

| Host | URL |
|------|-----|
| orchestrator | http://orchestrator.trex-fiordland.ts.net:8384 |
| worker-rtx3060 | http://worker-rtx3060.trex-fiordland.ts.net:8384 |
| worker-rtx3090ti | http://worker-rtx3090ti.trex-fiordland.ts.net:8384 |
| worker-rtx5090 | http://worker-rtx5090.trex-fiordland.ts.net:8384 |

### Folder Configuration

| Folder ID | Path | Sharing | Status |
|-----------|------|---------|--------|
| ubuntu-home | /var/syncthing/data/home | All 4 hosts | Active (initial scan in progress) |

Sync order: worker-rtx5090 (1.3M files, source of truth) → orchestrator (348K files) → worker-rtx3060 → worker-rtx3090ti

---

## Persistent Stack Deployment

Compose files: `infra/hosts/<host>/docker-compose.persistent.yml`
Env files: `infra/hosts/<host>/.env`
Project name: `nyra-persistent`

### Redeploy command (per host)
```bash
docker compose \
  --context <host> \
  -p nyra-persistent \
  -f infra/hosts/<host>/docker-compose.persistent.yml \
  --env-file infra/hosts/<host>/.env \
  up -d --force-recreate portainer-edge-agent
```

---

## Notes

- oracle-vps does NOT run Syncthing (by design)
- A pending Syncthing connection from `nyra-oracle-vnic` (AHOQL44, IP 194.110.175.47) was observed — may be a remnant from an old oracle Syncthing instance. Dismiss or block if unwanted.
- `ZANXEPD-Q7CQLZD` (old orchestrator device ID) is removed from config.xml but may appear transiently in Syncthing's in-memory cluster state — harmless, will clear on next sync cycle.
