# homeassistant-green

Last updated: 2026-05-24

## Host Role

homeassistant-green is a Home Assistant Green hardware appliance on the local network,
also connected to the Tailscale mesh. It hosts non-mortgage-operational services that
require persistent, always-on availability with minimal maintenance:

- **Vaultwarden** — self-hosted Bitwarden-compatible password manager for the operator
- **Linkwarden** — self-hosted bookmark and link archive manager

This host does **not** run any Nyra application services, AI inference, or mortgage
workflow components.

---

## Network

| Property        | Value                                     |
| --------------- | ----------------------------------------- |
| Location        | Local network (LAN)                       |
| Tailscale       | Connected (hostname: homeassistant-green) |
| Public exposure | None — Tailscale access only              |
| OS              | Home Assistant OS                         |

---

## Services

### Vaultwarden

Self-hosted Bitwarden-compatible server. Stores credentials for all Nyra hosts,
services, and operator accounts including:

- Portainer login
- Syncthing credentials
- Gitea admin credentials
- Grafana admin credentials
- Any operator passwords not managed by Infisical

Access: Tailscale only. Use the Bitwarden browser extension or mobile app pointed at
the Vaultwarden instance URL.

### Linkwarden

Self-hosted bookmark and link archiver. Used to preserve reference links, vendor docs,
architecture references, and research URLs relevant to Project Nyra.

Access: Tailscale only. Browser UI.

### Home Assistant

Standard Home Assistant instance running on the Green hardware. Manages home automation
integrations. Not integrated with Nyra application services (separate concern).

---

## Compose File

If Vaultwarden and Linkwarden are containerised separately from HA (via the
Home Assistant Docker add-on mechanism or a companion compose stack), the compose file
would live at:

```
infra/hosts/homeassistant-green/docker-compose.yml
```

Check the actual running configuration on the device — Home Assistant Green may run
these as HA add-ons rather than standalone Docker containers. Verify before modifying.

---

## Access

```bash
# Ping via Tailscale
ping homeassistant-green

# SSH (if enabled on HA Green — may require HA SSH add-on)
ssh root@homeassistant-green

# Vaultwarden UI
http://homeassistant-green:<vaultwarden-port>

# Linkwarden UI
http://homeassistant-green:<linkwarden-port>
```

Ports are stored in Vaultwarden itself (meta-stored) and Infisical.

---

## Operational Notes

- This host is not part of the GPU inference cluster and does not run Portainer Agent.
- Syncthing may run on this host for config/backup replication — check the persistent
  stack if configured.
- Do not deploy Nyra application services or LLM workloads here — this is a low-power
  appliance not suited for those workloads.
- HA OS updates are managed through the Home Assistant UI, not via Docker or shell.
- Credentials stored in Vaultwarden are the recovery path if Infisical is unavailable.
