# Cloudflared Hostname Map (Access-Protected)

> All hostnames below should be protected by Cloudflare Access policies. The only unauthenticated public surface is the Cloudflare Pages landing site.

| Hostname | Tunnel service target | Backing compose evidence | Access policy |
|---|---|---|---|
| gitea.nyra.example.com | http://orchestrator:3100 | docker-compose.gitea.yml (`gitea`) | Required |
| infisical.nyra.example.com | http://orchestrator:3201 | docker-compose.infisical.yml (`infisical`) | Required |
| archon.nyra.example.com | http://orchestrator:3737 | infra/compose/docker-compose.archon.yml (`archon`) | Required |
| n8n.nyra.example.com | http://oracle:5678 | infra/hosts/oracle-vps/docker-compose.oracle.yml (`n8n`) | Required |
| activepieces.nyra.example.com | http://oracle:8080 | infra/hosts/oracle-vps/docker-compose.oracle.yml (`activepieces`) | Required |
| twentycrm.nyra.example.com | http://oracle:3000 | infra/hosts/oracle-vps/docker-compose.oracle.yml (`twenty`) | Required |
| grafana.nyra.example.com | http://oracle:3003 | infra/hosts/oracle-vps/docker-compose.oracle.yml (`grafana`) | Required |
| openwebui.nyra.example.com | http://orchestrator:8088 | infra/docker-compose.yml (`openwebui`) | Required |
| nexus.nyra.example.com | http://orchestrator:7000 | infra/docker-compose.yml (`nexus-router`) | Required |

## DNS records

For each hostname above:
- **Type:** CNAME
- **Target:** `REPLACE_ME_TUNNEL_UUID.cfargotunnel.com`
- **Proxy status:** Proxied (orange cloud)

CLI alternative:

```bash
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID gitea.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID infisical.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID archon.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID n8n.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID activepieces.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID twentycrm.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID grafana.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID openwebui.nyra.example.com
cloudflared tunnel route dns REPLACE_ME_TUNNEL_NAME_OR_UUID nexus.nyra.example.com
```

## Explicit non-routes (safety)

No tunnel routes and no DNS hostnames are created for datastores, queues, or vector services such as:
- postgres
- redis
- mongo
- falkordb
- qdrant
- neo4j
