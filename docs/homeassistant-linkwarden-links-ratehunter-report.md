# Home Assistant Linkwarden Route Report

Updated: 2026-05-11

Target hostname:

- `links.ratehunter.net`

Current live state:

- The active orchestrator tunnel config has:
  - `links.ratehunter.net -> http://100.64.0.2:3007`
  - `linkwarden.ratehunter.net -> http://100.64.0.2:3007`
- DNS records for both hostnames point to the orchestrator tunnel ID `ae0bd53a-f22e-4414-8593-5b765dcd044b.cfargotunnel.com`.
- Cloudflare Access apps exist for both hostnames.
- The origin still needs validation from a Tailscale-authenticated machine or from inside the orchestrator tunnel container.

2026-05-11 verification from the current Codex App session:

```bash
curl --http1.1 -I --max-time 12 https://links.ratehunter.net
curl --http1.1 -I --max-time 12 https://linkwarden.ratehunter.net
curl -I --max-time 12 http://100.64.0.2:3007
ping -c 2 -W 3 100.64.0.2
tailscale status
```

Observed:

- Public hostname requests returned an empty reply / HTTP2 protocol error from this session.
- Direct `http://100.64.0.2:3007` timed out.
- `ping 100.64.0.2` had 100% packet loss.
- `tailscale status` reported this local session is logged out, so this session cannot prove whether the Home Assistant Green origin is healthy on the tailnet.

Desired state:

- Keep `links.ratehunter.net -> http://100.64.0.2:3007` on the orchestrator tunnel.
- Keep `linkwarden.ratehunter.net` temporarily as a compatibility alias or redirect it later.
- Protect both hostnames with Cloudflare Access.

Remaining validation:

```bash
docker exec nyra-cloudflared-orchestrator wget -S -O- http://100.64.0.2:3007
curl -I https://links.ratehunter.net
curl -I https://linkwarden.ratehunter.net
```

If `100.64.0.2:3007` continues to time out from the orchestrator tunnel container, validate the Home Assistant Green Tailscale IP, service port, and whether Linkwarden is bound to LAN/Tailscale interfaces. If orchestrator-to-Home-Assistant routing cannot be made reliable, use the prompt-pack fallback: approve a dedicated Home Assistant tunnel and provision `HOMEASSISTANT_TUNNEL_ID` / `HOMEASSISTANT_TUNNEL_TOKEN` in Infisical.
