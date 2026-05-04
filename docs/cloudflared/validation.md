# Cloudflared Validation

Updated: 2026-04-30

## Local-Managed YAML Validation

After replacing placeholders in the YAML files:

```bash
cloudflared tunnel ingress validate docs/cloudflared/cloudflared-oracle.yml
cloudflared tunnel ingress validate docs/cloudflared/cloudflared-worker-ui.yml
```

Check route selection:

```bash
cloudflared tunnel ingress rule https://nyra.ratehunter.net
cloudflared tunnel ingress rule https://crm.ratehunter.net
cloudflared tunnel ingress rule https://n8n.ratehunter.net
cloudflared tunnel ingress rule https://nerve-5090.ratehunter.net
```

## Drift Checks

These commands check for routes that violate the current exposure policy:

```bash
rg -n "postgres|redis|falkordb|qdrant|vllm|ollama|9835|9100|11434|6379|5432|6333" docs/cloudflared/*.yml
rg -n "hostname:|service:" docs/cloudflared/*.yml
```

The first command should not find active ingress services except in comments or
policy text.

## Runtime Smoke Checks

From the tunnel host:

```bash
curl -I http://webapp:3001
curl -I http://twenty:3000
curl -I http://n8n:5678
curl -I http://activepieces:80
curl -I http://grafana:3000
curl -I http://paperclip:3100
curl -I http://nexus:3000
```

For worker UI routes, verify Tailscale resolution first:

```bash
tailscale ping orchestrator.trex-fiordland.ts.net
tailscale ping worker-rtx5090.trex-fiordland.ts.net
tailscale ping worker-rtx3090ti.trex-fiordland.ts.net
```

## Cloudflare Access Checks

Every hostname except `ratehunter.net` and `www.ratehunter.net` should have an
Access application or a service-token-only policy. Owner-only routes should be
more restrictive than normal operator routes.
