# ORACLE DEPLOYMENT

## Deploy steps
```bash
cp infra/.env.example .env
# set CF_TUNNEL_TOKEN and core secrets

docker compose -f infra/oracle/compose.oracle.yml up -d
docker compose -f infra/oracle/compose.oracle.yml ps
```

## Tailscale notes
- Join Oracle node to tailnet using `TAILSCALE_AUTHKEY`.
- Worker endpoints remain tailnet-only and are not exposed by tunnel ingress.

## Cloudflared notes
- Use `CF_TUNNEL_TOKEN` from Cloudflare Zero Trust tunnel.
- Validate ingress config against `infra/cloudflared/config.yml`.

## Verify commands
```bash
docker compose -f infra/oracle/compose.oracle.yml config
```
