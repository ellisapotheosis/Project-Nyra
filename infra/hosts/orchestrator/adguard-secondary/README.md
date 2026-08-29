# Secondary AdGuard Home (orchestrator)

This stack is a second resolver for the Home Assistant Green AdGuard instance.
It binds the orchestrator's currently discovered ICS/LAN address and Tailscale
address, while keeping the dashboard setup endpoint separate from port 80.

## Start

```bash
cd infra/hosts/orchestrator/adguard-secondary
cp .env.example .env
docker compose --env-file .env up -d
docker compose ps
```

Open `http://192.168.137.253:3004` from the LAN, or
`http://100.64.0.10:3004` over Tailscale, and complete the AdGuard first-run
wizard. In the wizard, set the DNS listen interface to the addresses above.

Do not point router DHCP at this resolver until both addresses have been tested
from a separate LAN client and the Home Assistant resolver remains reachable.
Use the Home Assistant Green resolver as primary and this instance as secondary
in DHCP; do not use the Oracle VPS as a LAN DNS server.

## Verify

```bash
dig @192.168.137.253 example.com
dig @100.64.0.10 example.com
curl -fsS http://127.0.0.1:8084/control/status
```

The first two commands should return an answer section after the wizard is
complete. The dashboard status endpoint may require authentication.

## Rollback

```bash
docker compose down
```

Persistent data is retained in the named volumes and can be removed separately
only when intentionally resetting this instance.
