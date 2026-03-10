# Cloudflare Access Policy Checklist for Project Nyra
Generated: 2026-03-06 04:39:15

## Goal
Expose Nyra public apps safely for paying subscribers (brokers/coworkers) without opening inbound ports.
Use Cloudflare Tunnel + Cloudflare Access for auth, and Service Tokens for machine-to-machine access.

## Recommended hostnames (example)
- app.ratehunter.net        (public marketing + signup)
- admin.ratehunter.net      (Nyra Admin UI) — Access protected
- crm.ratehunter.net        (TwentyCRM UI) — Access protected
- n8n.ratehunter.net        (n8n UI) — Access protected
- webhooks.ratehunter.net   (Twilio/Lead source inbound) — Service Token OR app-layer HMAC
- bot.ratehunter.net        (Moltbot/OpenClaw) — Access protected
- nexus.ratehunter.net      (Nexus Router UI/API) — Access protected
- grafana.ratehunter.net    (Observability) — Access protected

## Access apps (Zero Trust)
Create a "Self-hosted" app for each hostname.
- Humans: Allow emails from your workspace domain; optionally require TOTP/device posture.
- Services: Use Service Tokens. Requests authenticate via:
  - CF-Access-Client-Id
  - CF-Access-Client-Secret

## Subscription scaling
- Create Access groups: Brokers, Admins, Support
- Map IdP groups to Access policies (Google Workspace recommended)
- Keep marketing site public; keep operational UIs protected.
