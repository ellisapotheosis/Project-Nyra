# 05 Cloudflare Pages Landing (Public Internet Surface)

## Landing policy

The marketing landing property stays on Cloudflare Pages and does not rely on Docker runtime exposure.

- Canonical app location: `apps/landing`
- Public domain: `ratehunter.net`
- Deployment pattern: Cloudflare Pages project + branch previews
- Security stance: this is the only intentionally unauthenticated public endpoint in the edge plan

## Why this split exists

1. Keeps static marketing uptime independent from private service stack health.
2. Reduces attack surface by avoiding direct exposure of backend containers.
3. Aligns with Access-first policy for all authenticated app traffic.

## Non-goals

- No direct datastore connectivity from landing page runtime.
- No direct Cloudflared ingress entry for the apex pages site.
- No SSH/git/admin endpoints exposed without Access.

## Related infrastructure

- Tunnel ingress definitions: `infra/cloudflared/config.yml`
- Hostname map: `infra/cloudflared/hostname-map.md`
- DNS runbook: `docs/06_cloudflared_tunnels_dns.md`

## Verification checklist

- [ ] `ratehunter.net` resolves to Pages origin
- [ ] all app/API hostnames resolve to tunnel CNAME
- [ ] every non-landing hostname is Access-protected
- [ ] no datastore hostname exists in DNS

## Operational checks
- Ensure Pages project is mapped to the landing app output.
- Ensure tunnel hostnames do not overlap with landing hostname.
- Ensure Access policy is not applied to the apex marketing domain unless required by product.

## Change management
- Any move from Pages to containerized hosting must be treated as a security-impacting change.
- If moved, add explicit edge/WAF policy and documented rollback plan.
- Keep SEO-sensitive redirects in versioned config.

## Evidence
- Related DNS and tunnel mappings are documented in cloudflared docs in this patch set.
