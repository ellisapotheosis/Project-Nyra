# Cloudflare Access Policy Plan

## Public

- `ratehunter.net`
- `ratehunter.net`
- Optionally `projectnyra.com` once an app portal exists

## Protected

- `app.projectnyra.com`
- `crm.projectnyra.com` / `twenty.projectnyra.com`
- `n8n.projectnyra.com`
- `gitea.projectnyra.com`
- `openwebui.projectnyra.com`
- `campaigns.projectnyra.com`
- `quotes.projectnyra.com`

## Highly protected

- `portainer.projectnyra.com`
- `nexus.projectnyra.com` and `nexus-router.projectnyra.com`
- `litellm.projectnyra.com`
- worker UI hostnames
- monitoring surfaces such as Prometheus/cAdvisor

Use owner identity plus MFA for browser access. Use Cloudflare service tokens for machine/API paths.
