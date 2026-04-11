# 06 Cloudflared Tunnels + DNS (Regenerated, Zero Datastore Exposure)

## Source files
- `infra/cloudflared/config.yml`
- `infra/cloudflared/hostname-map.md`

## Ingress policy
- HTTP/S applications only.
- All tunneled apps require Cloudflare Access.
- Marketing landing remains Cloudflare Pages and is public.
- Mandatory terminal rule:

```yaml
- service: http_status:404
```

## Routed hostnames
- gitea.nyra.example.com -> orchestrator:3100
- infisical.nyra.example.com -> orchestrator:3201
- archon.nyra.example.com -> orchestrator:3737
- n8n.nyra.example.com -> oracle:5678
- activepieces.nyra.example.com -> oracle:8080
- twentycrm.nyra.example.com -> oracle:3000
- grafana.nyra.example.com -> oracle:3003
- openwebui.nyra.example.com -> orchestrator:8088
- nexus.nyra.example.com -> orchestrator:7000

## Explicitly excluded from ingress
- postgres
- redis
- mongo
- falkordb
- qdrant
- neo4j
- any raw TCP datastore endpoint

## DNS record model
For each routed hostname:
- Type: CNAME
- Target: `REPLACE_ME_TUNNEL_UUID.cfargotunnel.com`
- Proxy: enabled

CLI alternative:

```bash
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID <hostname>
```
