# 06 Cloudflared Tunnels and DNS

| Subdomain | Internal target | Access gate |
|---|---|---|
| app.ratehunter.net | webapp:3000 | required |
| admin.ratehunter.net | admin:3000 | required |
| api.ratehunter.net | quote-api:3001 | required |
| hooks.ratehunter.net | webhooks:3005 | required |
| nexus.ratehunter.net | nexus-router:3010 | required |
| litellm.ratehunter.net | litellm:4000 | required |

DNS: create proxied CNAME records to the tunnel UUID host; keep worker and database endpoints private.
