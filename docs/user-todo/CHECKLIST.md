# User TODO Checklist

Last consolidated: 2026-05-22

## 1. Infisical And Provider Secrets

- [ ] Import or update the missing Infisical variables listed in
      `INFISICAL-MISSING-SECRETS.md`.
- [ ] Use the private generated-value file outside the repo only if temporary
      test values are acceptable:
      `/home/ellisapotheosis/repos/PROJECT_NYRA_INFISICAL_MISSING_SECRETS.md`.
- [ ] Replace temporary generated values with real provider values before any
      production borrower, broker, CRM, SMS, email, or auth smoke.
- [ ] Confirm Infisical paths exist for `/machines/*`, `/apps/*`,
      `/services/*`, and `/providers/*`.

## 2. Cloudflare DNS, Tunnels, And Access

- [ ] Confirm Cloudflare zones and nameservers for `projectnyra.com` and
      `ratehunter.net`.
- [ ] Keep `ratehunter.net` limited to the public mortgage broker landing page.
- [ ] Keep `projectnyra.com` as the canonical domain for app, API, tools, MCP,
      CRM, and internal service hostnames.
- [ ] Apply Cloudflare Access OIDC/MFA policies to all admin and internal
      surfaces.
- [ ] Apply Cloudflare Access service-token protection to Nexus Router MCP/API
      paths and other machine/API surfaces.

## 3. Supabase, Auth, And App Runtime

- [ ] Confirm Supabase project URL, publishable/anon key, service-role key, and
      JWT secret are present in Infisical.
- [ ] Configure Supabase auth redirect URLs for local, preview, and production
      Project Nyra app URLs.
- [ ] Confirm production app writes fail closed unless CRM, lead ingestion,
      quote, and campaign service URLs and secrets are configured.

## 4. Twenty CRM And Workflow Runtime

- [ ] Create or confirm Twenty CRM API credentials and mortgage custom fields.
- [ ] Confirm lead, quote, communication, campaign, consent, and audit timeline
      objects/fields exist in the live CRM workspace.
- [ ] Import Activepieces/n8n workflows only after provider secrets are present.
- [ ] Confirm n8n and Activepieces remain automation glue, not system of record.

## 5. Messaging, Workers, And Live Smoke

- [ ] Complete Twilio A2P/phone/webhook setup before SMS or voice smoke.
- [ ] Complete SendGrid sender/domain authentication before email smoke.
- [ ] Approve Tailscale devices and confirm GPU worker endpoints remain private.
- [ ] Run live smoke after secrets and Access policies are applied.
- [ ] Record completion evidence in this checklist or
      `docs/OWNER_MANUAL_ACTIONS.md` without raw secrets.
