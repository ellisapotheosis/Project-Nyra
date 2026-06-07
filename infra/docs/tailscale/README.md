# Tailscale Notes

- Oracle, orchestrator, and all workers must join the same tailnet.
- DB/cache services remain tailnet-internal only.
- Use grants for new tailnet policy rules. Legacy ACLs can remain in existing policy until migrated.
- Oracle browser/service endpoints are advertised with Tailscale Services from `infra/hosts/oracle-vps/scripts/configure-tailscale-services.sh`.
- Service definitions are reconciled with `scripts/infra/sync-tailscale-vip-services.py`.
- Service auto-approval and access grants live in `infra/tailscale/oracle-services-policy.hujson`.
- `.github/workflows/tailscale-policy-sync.yml` fetches the current tailnet policy, merges the Oracle service overlay, tests it on pull requests, and applies policy plus VIP service definitions on `main` pushes or manual workflow dispatch with `apply=true`.

Required GitHub configuration:

- Tailnet name: `TS_TAILNET`, `TAILSCALE_TAILNET`, or the default `trex-fiordland.ts.net`.
- Preferred credentials: `TS_OAUTH_CLIENT_ID` and `TS_OAUTH_SECRET` secrets for a Tailscale OAuth client with policy-file write access.
- Fallback credential: `TS_API_KEY` or `TAILSCALE_API_KEY` secret.
