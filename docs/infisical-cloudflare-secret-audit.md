# Infisical Cloudflare Secret Audit

Updated: 2026-05-08

No secret values were printed or stored in this report.

Required Infisical paths and variables:

`/machines/orchestrator`

- `ORCHESTRATOR_TUNNEL_ID`
- `ORCHESTRATOR_TUNNEL_TOKEN`

`/machines/oracle-vps`

- `ORACLE_TUNNEL_ID`
- `ORACLE_TUNNEL_TOKEN`

Cloudflare API desired-state apply identity:

- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`
- `CF_ZONE_ID`
- `CF_TEAM_NAME`
- `CF_ACCESS_TEAM_NAME`

Optional Access automation:

- `CF_ACCESS_ADMIN_EMAIL`
- `CF_ACCESS_GOOGLE_WORKSPACE_DOMAIN`
- `CF_ACCESS_SERVICE_TOKEN_DURATION`

Findings:

- The orchestrator connector is currently running from an exposed token that was pasted in chat. Rotate `ORCHESTRATOR_TUNNEL_TOKEN` after the desired-state setup is complete.
- The repo should not depend on GitHub repository secrets for tunnel runtime. Tunnel runtime secrets belong in Infisical machine paths.
- For API apply, use a Cloudflare token with Tunnel edit, Access edit, DNS edit, and Zone read permissions.
