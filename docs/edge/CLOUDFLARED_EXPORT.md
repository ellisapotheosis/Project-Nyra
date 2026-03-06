# Cloudflared Export (Owner Summary)

## Files

- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`
- `docs/06_cloudflared_tunnels_dns.md`

## DNS Records to Create

Use proxied CNAME records:

- `n8n.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `activepieces.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `twentycrm.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `litellm.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `nexus.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `grafana.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `gitea.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`
- `infisical.<domain>` -> `<CF_TUNNEL_UUID>.cfargotunnel.com`

CLI alternative:

```bash
cloudflared tunnel route dns <NAME_OR_UUID> n8n.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> activepieces.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> twentycrm.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> litellm.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> nexus.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> grafana.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> gitea.<domain>
cloudflared tunnel route dns <NAME_OR_UUID> infisical.<domain>
```

## Security posture

- Access protection is required for all tunnel hostnames.
- Landing site (`ratehunter.net`) remains Pages-public.
- No datastore ingress rules are included.
