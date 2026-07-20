# Tailscale-Served Services (Split DNS)

Updated: 2026-06-19

Services documented here are accessible **only inside the Tailscale tailnet** — they are
not exposed via Cloudflare tunnels and have no public DNS records. Each gets two private
hostnames:

1. **MagicDNS** (`*.trex-fiordland.ts.net`) — automatic once the device joins the tailnet
2. **Split DNS** (`*.projectnyra.com`) — private resolution inside the tailnet via Tailscale Split DNS

Machine-readable desired state: `infra/cloudflare/desired-state/exposure-matrix.yml` → `tailscale_private` section.

---

## Current Services

| Name               | MagicDNS Hostname                        | Split DNS Hostname                  | Port | Description                              |
| ------------------ | ---------------------------------------- | ----------------------------------- | ---- | ---------------------------------------- |
| `spline-mcp`       | `spline-mcp.trex-fiordland.ts.net`       | `spline-mcp.projectnyra.com`        | 8779 | Spline 3D design tool MCP server         |
| `meshy-mcp`        | `meshy-mcp.trex-fiordland.ts.net`        | `meshy-mcp.projectnyra.com`         | 8780 | Meshy AI 3D generation MCP server        |
| `loki-website-mcp` | `loki-website-mcp.trex-fiordland.ts.net` | `loki-website-mcp.projectnyra.com`  | 8781 | Loki website builder MCP (not Grafana Loki) |
| `litellm-router` | `litellm-router.trex-fiordland.ts.net` | `litellm-router.projectnyra.com` | 4000 | Private OpenAI-compatible LiteLLM routing gateway |
| `a2a` | `a2a.trex-fiordland.ts.net` | `a2a.projectnyra.com` | 20128 | Private A2A integration endpoint; use `/a2a` |

> **Port note**: Ports 8765–8778 are used by existing Cloudflare-tunneled MCP servers
> (see `mcp_policy.direct_candidates` in `exposure-matrix.yml`). Tailscale-private MCPs
> start at 8779 to keep ranges distinct.

---

## How It Works

```
Agent or tool (on any tailnet device)
    │
    ▼
  DNS query: spline-mcp.projectnyra.com
    │
    ▼  [Tailscale Split DNS intercepts *.projectnyra.com queries]
    │
    ▼
  Resolves to: Tailscale IP of spline-mcp device (100.x.x.x)
    │
    ▼
  Traffic travels over WireGuard (Tailscale mesh) — never hits internet
    │
    ▼
  spline-mcp Docker container → port 8779
```

MagicDNS (`spline-mcp.trex-fiordland.ts.net`) works the same way but is provided
automatically by Tailscale without any DNS configuration.

---

## Setup: Step 1 — MagicDNS via Tailscale Sidecar

Each MCP must register as its own Tailscale device to get a unique `*.trex-fiordland.ts.net`
hostname. Use the Docker Compose sidecar pattern:

```yaml
# Paste into the relevant docker-compose overlay or mcp compose file.
# Repeat with different names/ports for each MCP.

services:
  spline-mcp-tailscale:
    image: tailscale/tailscale:latest
    hostname: spline-mcp
    environment:
      - TS_AUTHKEY=${TS_AUTHKEY_SPLINE_MCP}
      - TS_HOSTNAME=spline-mcp
      - TS_STATE_DIR=/var/lib/tailscale
      - TS_EXTRA_ARGS=--accept-routes
    volumes:
      - spline-mcp-ts-state:/var/lib/tailscale
    cap_add:
      - NET_ADMIN
      - SYS_MODULE
    devices:
      - /dev/net/tun:/dev/net/tun
    network_mode: service:spline-mcp   # shares network namespace with MCP container
    restart: unless-stopped

  spline-mcp:
    image: ghcr.io/spline-io/spline-mcp:latest   # placeholder; update with real image
    restart: unless-stopped
    # No ports: block here — accessed via Tailscale only

volumes:
  spline-mcp-ts-state:
```

**Auth keys**: Generate ephemeral, pre-authorized keys tagged `tag:mcp-server` in the
Tailscale admin console (Settings → Keys). Store in Infisical under `/mcp/tailscale/`.

After `docker compose up -d`, the device appears in the Tailscale admin console within
~30 seconds and receives MagicDNS hostname `spline-mcp.trex-fiordland.ts.net` automatically.

Repeat the sidecar pattern for `meshy-mcp` (port 8780), `loki-website-mcp` (port 8781),
`litellm-router` (port 4000), and `a2a` (port 20128), substituting the appropriate auth
key env var and hostname. For the existing Oracle services, the sidecar may instead be
implemented with Tailscale VIP Services named `svc:litellm-router` and `svc:a2a` that
forward to `127.0.0.1:4000` and `127.0.0.1:20128` respectively.

The A2A hostname is intentionally separate from LiteLLM. Route only OmniRoute's
`/a2a` surface there; do not expose its dashboard, provider-management APIs, or the
LiteLLM master key to A2A clients. The Nyra token broker and read-only skill allowlist
must be in place before onboarding another agent.

---

## Setup: Step 2 — `tailscale serve` for HTTPS on MagicDNS (Optional)

If the MCP server only speaks plain HTTP, `tailscale serve` wraps it in HTTPS on the
MagicDNS hostname. Run from inside the sidecar container or from the orchestrator WSL
shell (if the sidecar shares its network):

```bash
# HTTPS on MagicDNS hostname, port 443 → localhost:8779
tailscale serve --bg https / http://localhost:8779

# Verify
tailscale serve status
# Expected output:
# https://spline-mcp.trex-fiordland.ts.net/
#   |-- / http://localhost:8779
```

Repeat for meshy-mcp and loki-website-mcp.

For the two Oracle VIP services, configure the equivalent forwards:

```bash
tailscale serve --service=svc:litellm-router --https=443 --yes http://127.0.0.1:4000
tailscale serve --service=svc:a2a --https=443 --yes http://127.0.0.1:20128/a2a
```

The A2A client URL is `https://a2a.projectnyra.com/a2a` after split DNS is active.

---

## Setup: Step 3 — Split DNS for `*.projectnyra.com`

Split DNS makes `spline-mcp.projectnyra.com` resolve inside the tailnet to the same
Tailscale IP as `spline-mcp.trex-fiordland.ts.net`.

### Option A — Point Split DNS to Tailscale MagicDNS (Simplest)

1. Open [Tailscale Admin → DNS](https://login.tailscale.com/admin/dns)
2. Scroll to **Nameservers** → **Add nameserver** → **Custom**
3. Enter IP: `100.100.100.100` (Tailscale's MagicDNS resolver)
4. Set **Restricted to domain**: `projectnyra.com`
5. Click **Save**

Within the tailnet, `*.projectnyra.com` queries now go to Tailscale MagicDNS.
`spline-mcp.projectnyra.com` resolves to the same IP as `spline-mcp.trex-fiordland.ts.net`
because Tailscale MagicDNS resolves device short names as well as FQDN.

> **Caveat**: This makes ALL `*.projectnyra.com` resolution inside the tailnet go through
> MagicDNS. Public Cloudflare-hosted subdomains (`app.projectnyra.com`, etc.) still resolve
> correctly because MagicDNS passes unknown names upstream to Cloudflare's public DNS.

### Option B — Local CoreDNS with Explicit Records (More Control)

If you need precise control or want Split DNS only for specific subdomains:

`infra/docker-compose/coredns.yml`:
```yaml
services:
  coredns:
    image: coredns/coredns:1.11
    ports:
      - "53:53/udp"
      - "53:53/tcp"
    volumes:
      - ./coredns/Corefile:/Corefile
      - ./coredns/zones:/zones
    restart: unless-stopped
```

`infra/docker-compose/coredns/Corefile`:
```
projectnyra.com:53 {
    file /zones/projectnyra.com.db
    log
    errors
}

.:53 {
    forward . 1.1.1.1 8.8.8.8
    cache 30
    log
    errors
}
```

`infra/docker-compose/coredns/zones/projectnyra.com.db`:
```zone
$ORIGIN projectnyra.com.
@ 300 IN SOA ns1 admin 2026061901 3600 900 604800 300

; Tailscale-private MCP servers — update IPs after `tailscale status`
spline-mcp       300 IN A <tailscale-ip-of-spline-mcp>
meshy-mcp        300 IN A <tailscale-ip-of-meshy-mcp>
loki-website-mcp 300 IN A <tailscale-ip-of-loki-website-mcp>
litellm-router    300 IN A <tailscale-ip-of-litellm-router>
a2a               300 IN A <tailscale-ip-of-a2a>
```

Then in Tailscale Admin → DNS → Custom nameserver:
- IP: `<orchestrator Tailscale IP>` (e.g., `100.64.0.10`), port 53
- Restricted to domain: `projectnyra.com`

---

## Verification

```bash
# 1. Confirm devices appear in tailnet
tailscale status | grep -E "spline-mcp|meshy-mcp|loki-website-mcp"

# 2. MagicDNS resolution (from any tailnet device)
dig spline-mcp.trex-fiordland.ts.net +short
dig meshy-mcp.trex-fiordland.ts.net +short
dig loki-website-mcp.trex-fiordland.ts.net +short

# 3. Split DNS resolution (from any tailnet device)
dig spline-mcp.projectnyra.com +short        # should return same Tailscale IP
dig meshy-mcp.projectnyra.com +short
dig loki-website-mcp.projectnyra.com +short
dig litellm-router.projectnyra.com +short
dig a2a.projectnyra.com +short

# 4. Reachability
curl http://spline-mcp.trex-fiordland.ts.net:8779/
curl http://spline-mcp.projectnyra.com:8779/

# If using tailscale serve (HTTPS):
curl https://spline-mcp.trex-fiordland.ts.net/
curl https://litellm-router.projectnyra.com/health/readiness
curl https://a2a.projectnyra.com/a2a
```

---

## Infisical Secret Paths

| Secret                    | Infisical Path                      | Notes                                 |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `TS_AUTHKEY_SPLINE_MCP`   | `/mcp/tailscale/spline-mcp`         | Ephemeral, tag:mcp-server             |
| `TS_AUTHKEY_MESHY_MCP`    | `/mcp/tailscale/meshy-mcp`          | Ephemeral, tag:mcp-server             |
| `TS_AUTHKEY_LOKI_WEBSITE_MCP` | `/mcp/tailscale/loki-website-mcp` | Ephemeral, tag:mcp-server           |

---

## Related Files

- `infra/cloudflare/desired-state/exposure-matrix.yml` — `tailscale_private` section (source of truth)
- `docs/cloudflared/hostname-matrix.md` — Tailscale-only section
- `docs/network/NETWORK-MAP.md` — Tailscale mesh table
- `docs/ORCHESTRATOR-NETWORKING-SETUP.md` — Tailscale sidecar setup steps
