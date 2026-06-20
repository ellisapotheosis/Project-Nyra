# 05 Cloudflare Pages Landing

Updated: 2026-04-27

## Landing policy

The marketing landing property should stay on Cloudflare Pages unless a product decision explicitly moves it into the Oracle app stack.

| Item                   | Current policy                             |
| ---------------------- | ------------------------------------------ |
| Canonical app location | `apps/ratehunter`                          |
| Public domain          | `ratehunter.net` / `www.ratehunter.net`    |
| Preferred deployment   | Cloudflare Pages project + branch previews |
| Public access          | unauthenticated marketing surface only     |

## Current edge config note

`infra/hosts/oracle-vps/cloudflared-config.yml` currently includes fallback hostname examples for `ratehunter.net` and `www.ratehunter.net` pointing to `nyra-landing:3003`.

Use those only if the landing site is intentionally moved from Pages to a container. Otherwise:

- keep the apex and `www` records on Pages,
- keep app/admin/operator hostnames on the Cloudflared tunnel,
- do not add datastore, worker inference, or raw media ports to public DNS.

## Why this split exists

1. Static marketing uptime stays independent from Docker stack health.
2. Public attack surface stays limited to a static site.
3. Authenticated app traffic can remain Cloudflare Access-gated.

## Non-goals

- No direct datastore connectivity from the landing runtime.
- No direct worker inference calls from public browser code.
- No SSH, Gitea admin, Portainer, Grafana, or workflow admin exposure without Access.

## Related infrastructure

| Purpose                           | File                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| Oracle tunnel backup hostname map | `infra/hosts/oracle-vps/cloudflared-config.yml`                   |
| Orchestrator tunnel runner        | `infra/hosts/orchestrator/docker-compose.cloudflared.yml`         |
| Oracle tunnel runner              | `infra/hosts/oracle-vps/docker-compose.yml` service `cloudflared` |

## Verification checklist

- [ ] `ratehunter.net` resolves to the Pages origin when Pages is the active deployment.
- [ ] `www.ratehunter.net` resolves consistently with the apex.
- [ ] Production deploy verification fetches `https://ratehunter.net/` and confirms the live homepage contains `Ellis Andersen`.
- [ ] A successful Pages deploy is not treated as complete unless the custom domain serves the same landing app content as the deployment URL.
- [ ] App/admin/operator hostnames use the Oracle or orchestrator tunnel.
- [ ] Every non-landing hostname is Cloudflare Access-protected unless deliberately public.
- [ ] No datastore or worker inference hostname exists in Cloudflare DNS.

## Current 404 diagnostic

If `https://ratehunter.net/` returns the branded `404 Page Not Found` page while the GitHub/Cloudflare deployment says
it succeeded, treat it as a routing or adapter issue rather than an application build issue.

First check the Cloudflare Pages custom domain binding:

1. `ratehunter.net` and `www.ratehunter.net` must be active custom domains on the `ratehunter-landing` project.
2. No Worker route or Cloudflared tunnel route should intercept the apex hostname unless the landing site has been
   intentionally moved off Pages.
3. The deployment URL returned by GitHub Actions must serve the homepage text `Ellis Andersen`; if it does not, inspect
   the Pages upload/output directory and OpenNext deploy adapter before changing DNS.

## Change management

Any move from Pages to containerized hosting is a security-impacting change. Document the reason, new origin, Access/WAF posture, rollback path, and DNS changes before switching production traffic.
