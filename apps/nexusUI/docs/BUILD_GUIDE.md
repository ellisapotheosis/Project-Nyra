# Nexus UI Build Guide

## Local

```bash
pnpm install
pnpm --filter @nyra/nexus-ui dev
```

## Validation

```bash
pnpm --filter @nyra/nexus-ui typecheck
pnpm --filter @nyra/nexus-ui build
```

## Deployment model

The console should be reachable at:

```text
nexus.projectnyra.com
```

It is a control-plane surface and should stay behind Cloudflare Access or an equivalent private ingress layer.

The same hostname may also resolve privately over Tailscale SplitDNS. Keep the hostname stable and vary the transport/access path, not the name.

If the app is hosted on Cloudflare Pages, keep the same hostname and point the Pages project at the built Next app. If the app is hosted on Oracle VPS, place it behind the existing Cloudflared tunnel.

## Links used by the console

- `NEXT_PUBLIC_WEBAPP_URL=https://app.projectnyra.com`
- `NEXT_PUBLIC_NEXUS_ROUTER_URL=https://nexus-router.projectnyra.com`
- `NEXT_PUBLIC_GRAFANA_URL=https://grafana.projectnyra.com`
- `NEXT_PUBLIC_OPENLIT_URL=https://openlit.projectnyra.com`
