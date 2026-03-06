# Tailscale ACL Notes

- Oracle VM exposes only subscriber/public services through Cloudflared.
- Orchestrator and workers stay tailnet-only.
- Databases and worker inference endpoints must not be exposed publicly.
