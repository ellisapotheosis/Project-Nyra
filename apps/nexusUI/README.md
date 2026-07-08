# Nyra Nexus UI

Operator console for the Project Nyra control plane.

This app is the separate surface for:

- Nexus Router controls and MCP visibility
- LiteLLM routing intent
- Grafana, Prometheus, Loki, and OpenLIT links
- worker host status and private Nerve UI links
- access and hostname policy

It is intentionally separate from `apps/projectnyra`.

The same `*.projectnyra.com` hostname can be served in two ways:

- public through Cloudflared plus Cloudflare Access
- private through Tailscale SplitDNS for the same hostname

The hostname does not need to change when the access path changes.

## Run

```bash
pnpm install
pnpm --filter @nyra/nexus-ui dev
```

Default local URL:

```text
http://localhost:3016
```

## Build

```bash
pnpm --filter @nyra/nexus-ui typecheck
pnpm --filter @nyra/nexus-ui build
```

## Environment

Copy `.env.example` to `.env.local` if you want to override defaults.

```bash
cp .env.example .env.local
```

The app is designed to be usable with Cloudflare Access, Cloudflared tunneling, or a Pages-style deployment fronting the same control plane.

## Hostname split

- `projectnyra.com`: public landing page
- `app.projectnyra.com`: product app
- `nexus.projectnyra.com`: control-plane console
- `nexus-router.projectnyra.com`: raw MCP/router entrypoint
- `openmemory.projectnyra.com`: memory UI

## Notes

This UI only renders desired state and live probes. It should not be used to store raw tokens or secret values.
