# Home Assistant Linkwarden Route Report

Updated: 2026-05-08

Target hostname:

- `links.ratehunter.net`

Current live state:

- The active orchestrator tunnel config currently has `linkwarden.ratehunter.net -> http://100.64.0.2:3007`.
- That origin timed out during the last smoke test.

Desired state:

- Add `links.ratehunter.net -> http://100.64.0.2:3007` on the orchestrator tunnel.
- Keep `linkwarden.ratehunter.net` temporarily as a compatibility alias or redirect it later.
- Protect both hostnames with Cloudflare Access.

Validation before go-live:

```bash
docker exec nyra-cloudflared-orchestrator wget -S -O- http://100.64.0.2:3007
curl -I https://links.ratehunter.net
curl -I https://linkwarden.ratehunter.net
```

If `100.64.0.2:3007` continues to time out, validate the Home Assistant Green Tailscale IP, service port, and whether Linkwarden is bound to LAN/Tailscale interfaces.
