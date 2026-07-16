# Domain Policy

Project Nyra uses two domains with strict separation.

## RateHunter

`ratehunter.net` and `www.ratehunter.net` are reserved for the public RateHunter mortgage brokerage landing page only.

- Canonical app location: `apps/ratehunter/landing`
- Deployment target: Cloudflare Pages
- Do not attach app, admin, API, MCP, tunnel, database, or worker hostnames to this domain.

## Project Nyra

`projectnyra.com` is the public 3D Project Nyra landing page. The primary
webapp lives on `app.projectnyra.com`.

- 3D landing page: `projectnyra.com` and `www.projectnyra.com`
- Landing app location: `apps/projectnyra-landing`
- Primary webapp: `app.projectnyra.com`
- Primary webapp location: `apps/projectnyra`
- Public API gateway: `api.projectnyra.com`
- Webhooks: `hooks.projectnyra.com`
- Admin/internal UIs: `*.projectnyra.com` behind Cloudflare Access unless explicitly public
- Nexus MCP endpoint: `nexus-router.projectnyra.com`

## Compose Placement

Runtime Docker Compose files must live under `infra/hosts/<host-name>/`.
The only allowed non-host exception is `external/` for external vendored projects.
