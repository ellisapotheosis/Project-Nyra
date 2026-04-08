# 19 Cloud Offload Recommendations

## Default strategy
- Keep static marketing/public landing on Cloudflare Pages.
- Publish only approved control-plane HTTP apps through Cloudflared + Access.
- Keep databases and GPU inference backends private.

## Candidate matrix
| Component class | Current location | Offload recommendation | Rationale |
|---|---|---|---|
| Marketing landing | `apps/landing` via Pages workflows | keep on Cloudflare Pages | cheap, static, public-safe |
| Operator/admin UIs | orchestrator/oracle HTTP apps | Cloudflared + Access | centralized auth and edge controls |
| Gateway APIs | orchestrator | selective tunnel if needed | avoid broad API surface exposure |
| Datastores | oracle/internal stacks | no public offload endpoint | reduce leak risk/compliance risk |
| Worker inference | worker nodes | private network only | cost/perf/privacy and attack-surface control |

## Guardrails
1. No datastore ingress rules in `infra/cloudflared/config.yml`.
2. All non-marketing hostnames require Cloudflare Access.
3. Keep final catch-all ingress `http_status:404`.
4. Route DNS through tunnel CNAME only for approved hostnames.

## Suggested automation additions
- CI check that blocks ingress entries pointing to known datastore services.
- Periodic diff between active ports registry and tunnel hostname map.
- Pre-merge lint to reject accidental raw TCP ingress without explicit Access design.
- Post-merge smoke checks for each approved hostname health endpoint.

## Risk watchlist
- Drift between compose host ports and cloudflared local origin targets.
- Accidental reuse of public hostname for an internal-only service.
- Unreviewed app additions in compose profiles bypassing exposure review.

## Evidence
- `docs/02_ports_registry.md`
- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`
- `docs/06_cloudflared_tunnels_dns.md`
