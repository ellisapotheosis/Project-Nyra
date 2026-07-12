# App Secret Inventory

This file lists app-layer keys that should exist in Infisical for the active
Project Nyra app surfaces. It intentionally contains key names only.

## Live Comparison Status

Live Infisical comparison was attempted from WSL, but the configured Infisical
host did not resolve from this shell:

`infisical.trex-fiordland.ts.net`

After DNS/Tailscale resolution is restored, compare Infisical key names against
[`apps/.env.example`](./.env.example). Do not print or commit secret values.

## Project Nyra Required Keys

- `CRM\\\\\\\_API\\\\\\\_URL`
- `CRM\\\\\\\_API\\\\\\\_KEY`
- `LEAD\\\\\\\_INGESTION\\\\\\\_API\\\\\\\_URL`
- `LEAD\\\\\\\_INGESTION\\\\\\\_API\\\\\\\_KEY`
- `CAMPAIGN\\\\\\\_ENGINE\\\\\\\_URL`
- `QUOTE\\\\\\\_API\\\\\\\_URL`
- `QUOTE\\\\\\\_API\\\\\\\_SECRET`
- `NEXUS\\\\\\\_ROUTER\\\\\\\_URL`
- `LITELLM\\\\\\\_PROXY\\\\\\\_URL`
- `GRAFBASE\\\\\\\_URL`
- `GRAFANA\\\\\\\_URL`
- `LITELLM\\\\\\\_MASTER\\\\\\\_KEY`
- `OPENCLAW\\\\\\\_PUBLIC\\\\\\\_BASE\\\\\\\_URL`
- `OPENCLAW\\\\\\\_CHAT\\\\\\\_PATH`
- `OPENCLAW\\\\\\\_GATEWAY\\\\\\\_TOKEN`
- `OPENCLAW\\\\\\\_DEFAULT\\\\\\\_MODEL`
- `NYRA\\\\\\\_CHAT\\\\\\\_INTERNAL\\\\\\\_PROXY\\\\\\\_TOKEN`
- `NYRA\\\\\\\_INTERNAL\\\\\\\_API\\\\\\\_RATE\\\\\\\_LIMIT`
- `NYRA\\\\\\\_INTERNAL\\\\\\\_PROXY\\\\\\\_EXPOSE\\\\\\\_UPSTREAM\\\\\\\_BODY`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_PUBLISHABLE\\\\\\\_KEY`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_SUPABASE\\\\\\\_ANON\\\\\\\_KEY`
- `SUPABASE\\\\\\\_SERVICE\\\\\\\_ROLE\\\\\\\_KEY`
- `SUPABASE\\\\\\\_JWT\\\\\\\_SECRET`
- `TWENTY\\\\\\\_CRM\\\\\\\_URL`
- `TWENTY\\\\\\\_CRM\\\\\\\_API\\\\\\\_KEY`
- `TWENTY\\\\\\\_MCP\\\\\\\_URL`
- `TWENTY\\\\\\\_API\\\\\\\_KEY`
- `TWENTY\\\\\\\_ACCESS\\\\\\\_TOKEN`
- `TWENTY\\\\\\\_APP\\\\\\\_SECRET`
- `TWENTY\\\\\\\_DB\\\\\\\_USER`
- `TWENTY\\\\\\\_DB\\\\\\\_PASSWORD`
- `TWENTY\\\\\\\_DB\\\\\\\_NAME`

## Project Nyra Browser-Safe URLs

These may be exposed to the browser but should still be managed consistently:

- `NEXT\\\\\\\_PUBLIC\\\\\\\_APP\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_NYRA\\\\\\\_DEMO\\\\\\\_AUTH`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_NEXUS\\\\\\\_ROUTER\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_LITELLM\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_GRAFBASE\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_GRAFANA\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_ACTIVEPIECES\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_N8N\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_TWENTY\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_OPENMEMORY\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_PAPERCLIP\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_OPENCLAW\\\\\\\_URL`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_NYRA\\\\\\\_WEBSOCKET\\\\\\\_URL`

## RateHunter Required Keys

- `NEXT\\\\\\\_PUBLIC\\\\\\\_SITE\\\\\\\_NAME`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_SITE\\\\\\\_URL`
- `OPENCLAW\\\\\\\_BORROWER\\\\\\\_API\\\\\\\_URL`
- `OPENCLAW\\\\\\\_BORROWER\\\\\\\_API\\\\\\\_KEY`
- `N8N\\\\\\\_INGEST\\\\\\\_WEBHOOK\\\\\\\_URL`

## RateHunter Optional Keys

- `NEXT\\\\\\\_PUBLIC\\\\\\\_GA\\\\\\\_ID`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_PLAUSIBLE\\\\\\\_DOMAIN`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_BORROWER\\\\\\\_CHAT\\\\\\\_ENDPOINT`
- `NEXT\\\\\\\_PUBLIC\\\\\\\_BORROWER\\\\\\\_CHAT\\\\\\\_API\\\\\\\_URL`
- `BORROWER\\\\\\\_CHAT\\\\\\\_API\\\\\\\_URL`
- `DATABASE\\\\\\\_URL`
- `SMTP\\\\\\\_HOST`
- `SMTP\\\\\\\_PORT`
- `SMTP\\\\\\\_USER`
- `SMTP\\\\\\\_PASSWORD`
- `CONTACT\\\\\\\_EMAIL`
- `API\\\\\\\_SECRET\\\\\\\_KEY`
- `ENABLE\\\\\\\_ANALYTICS`
- `ENABLE\\\\\\\_PWA`

## Platform / Deploy Keys

- `CLOUDFLARE\\\\\\\_API\\\\\\\_TOKEN`
- `CLOUDFLARE\\\\\\\_ACCOUNT\\\\\\\_ID`
- `OPENLIT\\\\\\\_DB\\\\\\\_PASSWORD`
- `OPENLIT\\\\\\\_NEXTAUTH\\\\\\\_SECRET`
- `OPENLIT\\\\\\\_VAULT\\\\\\\_ENCRYPTION\\\\\\\_KEY`
- `PAPERCLIP\\\\\\\_API\\\\\\\_KEY`
