# 18 UI Registry (Active Surfaces)

| UI service | Source compose | Host port(s) | Access stance | Proposed hostname |
|---|---|---|---|---|
| Gitea | docker-compose.gitea.yml | 3100 | Access required | gitea.nyra.example.com |
| Infisical | docker-compose.infisical.yml | 3201 | Access required | infisical.nyra.example.com |
| Archon UI | infra/compose/docker-compose.archon.yml | 3737 | Access required | archon.nyra.example.com |
| n8n | infra/hosts/oracle-vps/docker-compose.oracle.yml | 5678 | Access required | n8n.nyra.example.com |
| Activepieces | infra/hosts/oracle-vps/docker-compose.oracle.yml | 8080 | Access required | activepieces.nyra.example.com |
| Twenty CRM | infra/hosts/oracle-vps/docker-compose.oracle.yml | 3000 | Access required | twentycrm.nyra.example.com |
| Grafana | infra/hosts/oracle-vps/docker-compose.oracle.yml | 3003 | Access required | grafana.nyra.example.com |
| Open WebUI | infra/docker-compose.yml | 8088 | Access required | openwebui.nyra.example.com |

Marketing landing remains the only public unauthenticated surface (Cloudflare Pages).
