# Cloudflare Access And DNS Owner Guide

These actions require Cloudflare dashboard/API authority, DNS ownership, or
Cloudflare Zero Trust permissions.

## References

- `docs/CLOUDFLARE_UI_DNS_WALKTHROUGH.md`
- `docs/infra/CLOUDFLARE-ACCESS-POLICY-PLAN.md`
- `infra/hosts/orchestrator/cloudflared-config.yml`
- `infra/hosts/oracle-vps/cloudflared-config.yml`
- `docs/cloudflare-tunnel-discovery-delta.md`

## Required Owner Actions

1. Change `projectnyra.com` authoritative nameservers at Spaceship to
   `mcgrory.ns.cloudflare.com` and `zita.ns.cloudflare.com`.
2. Confirm orchestrator and Oracle VPS tunnel IDs and tokens.
3. Store tunnel tokens in Infisical under the matching machine paths.
4. Public hostnames for Project Nyra app/API/hook surfaces were applied by the
   agent on 2026-05-22.
5. After `projectnyra.com` becomes active in Cloudflare, protect
   admin/internal surfaces with Cloudflare Access OIDC plus MFA.
6. Protect machine/API paths with Cloudflare Access service tokens.
7. Run live URL smoke checks from a Tailscale-authenticated shell.

## Access Policy Baseline

Browser admin surfaces should require owner identity plus MFA.

Machine/API surfaces should require Cloudflare service tokens and should not be
reachable as unauthenticated public endpoints.

## Must Stay Private

- Worker vLLM endpoints
- Worker Ollama endpoints
- Postgres
- Redis
- FalkorDB
- Qdrant
- Raw MCP internals
- Portainer unless explicitly Access-gated

## Completion Evidence

Record:

- hostname tested
- expected access mode
- observed HTTP status or Access challenge
- date
- shell location used for the smoke check

Do not record tunnel tokens, service-token values, API keys, cookies, or JWTs.
