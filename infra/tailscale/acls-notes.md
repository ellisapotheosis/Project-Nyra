# Tailscale ACL Notes

- Oracle VM exposes only subscriber/public services through Cloudflared.
- Orchestrator and workers stay tailnet-only.
- Databases and worker inference endpoints must not be exposed publicly.
- SSH/admin access should stay tailnet-private:
  - Windows-native SSH uses MagicDNS hostnames, for example `oracle.trex-fiordland.ts.net:23`.
  - WSL/bootstrap SSH uses stable Tailscale IPs where required, for example Oracle `100.64.0.3:23`.
- Current Oracle SSH requirement:
  - Allow TCP from Windows admin/orchestrator/worker endpoints to `oracle.trex-fiordland.ts.net` on ports `23` and `2223`.
  - Keep Gitea SSH on `2222` separate from host SSH.
- 2026-05-16 verification found Tailscale peer connectivity to Oracle working, but ordinary TCP from `worker-rtx5090` to `100.64.0.3:23`/`:2223` did not reach `tailscale0` on Oracle. Treat this as a Tailscale ACL/policy issue until admin-console policy confirms otherwise.
