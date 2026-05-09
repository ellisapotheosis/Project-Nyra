# Cloudflare Tunnel Runtime Discovery

Updated: 2026-05-08

Runtime facts from local inspection:

- Current local host: `AlienApoth51`.
- Local host is not the SSH target named `orchestrator`.
- SSH to `orchestrator.trex-fiordland.ts.net:2223` timed out.
- Tailscale reported coordination/DNS health warnings, so peer reachability may be stale.
- Local Docker has `nyra-cloudflared-orchestrator` running on `nyra-network`.
- `nyra-cloudflared-orchestrator` registered tunnel `ae0bd53a-f22e-4414-8593-5b765dcd044b` over `http2`.
- Active remote config pushed by Cloudflare currently contains only:
  - `linkwarden.ratehunter.net -> http://100.64.0.2:3007`
  - catch-all `http_status:404`
- The Linkwarden origin logged a proxy cancellation and previous smoke tests timed out, so the origin at `100.64.0.2:3007` still needs validation from the connector network.

Docker contexts found:

- `default`
- `desktop-linux`
- `oracle`
- `oracle-vps-oci`
- `orchestrator`
- `worker-rtx3060`
- `worker-rtx3090ti`
- `worker-rtx5090`

Blocked runtime checks:

- `docker --context oracle ps` failed because SSH to `oracle.trex-fiordland.ts.net:23` timed out.
- `docker --context orchestrator ps` failed because SSH to `orchestrator.trex-fiordland.ts.net:2223` timed out.
- Do not assume Oracle runtime containers are healthy until `docker --context oracle ps` returns successfully.
