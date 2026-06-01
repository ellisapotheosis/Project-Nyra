# Tailscale Policy Notes

- Oracle VM exposes only subscriber/public services through Cloudflared.
- Orchestrator and workers stay tailnet-only.
- Databases and worker inference endpoints must not be exposed publicly.
- Prefer Tailscale grants for new access rules.
- Tailscale Services need both host-side advertisement and tailnet policy approval.
- Tailscale Services also need tailnet-level VIP service definitions before host advertisements can become active.
- The Oracle service policy overlay is `infra/tailscale/oracle-services-policy.hujson`.
- VIP service definitions are managed by `scripts/infra/sync-tailscale-vip-services.py`.
- The GitHub Actions workflow `.github/workflows/tailscale-policy-sync.yml` merges that overlay into the live policy, then runs Tailscale's GitOps ACL action in `test` or `apply` mode. Apply mode also reconciles the VIP service definitions.
