# Cloudflare Access Policy Matrix

## No Access policy by default (public endpoints)
- `nyra.ratehunter.net`
- `api.ratehunter.net`
- `hooks.ratehunter.net`

## Access required (must be protected)
- `gitea.ratehunter.net`
- `twenty.ratehunter.net`
- `activepieces.ratehunter.net`
- `n8n.ratehunter.net`
- `grafana.ratehunter.net`
- `archon.ratehunter.net`
- `bot.ratehunter.net`

## Recommended baseline policy
- Include: owner emails + approved team group
- Session duration: 12 hours
- Identity provider: Cloudflare One default IdP
- Block countries/ranges not used by operators (optional)

## Notes
Access policy creation requires Cloudflare dashboard/API credentials and is listed in `MANUAL_STEPS_ON_RETURN.md`.
