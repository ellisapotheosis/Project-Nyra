# Cloudflared Edge Pack Export

## Included files
- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`
- `docs/06_cloudflared_tunnels_dns.md`

## Security posture
- Cloudflared ingress includes HTTP/S applications only.
- Datastores are explicitly excluded from ingress and DNS planning.
- Cloudflare Access is required for all tunneled operational apps.
- Final fail-closed ingress rule is present: `http_status:404`.

## Apply commands

```bash
# Validate syntax
cloudflared tunnel ingress validate --config infra/cloudflared/config.yml

# Docker-based validation (portable)
docker run --rm -v "$(pwd)/infra/cloudflared:/etc/cloudflared" cloudflare/cloudflared:latest \
  tunnel ingress validate --config /etc/cloudflared/config.yml

# Run tunnel (after placing credentials JSON)
cloudflared tunnel --config infra/cloudflared/config.yml run REPLACE_ME_TUNNEL_NAME_OR_UUID
```

## DNS model
Each routed hostname should be a proxied CNAME to:
- `REPLACE_ME_TUNNEL_UUID.cfargotunnel.com`

Use CLI route commands listed in `infra/cloudflared/hostname-map.md`.
