# SERVICE_EXPOSURE_MATRIX.md

## Exposure Levels

| Service                  | Level     | Public Hostname                                       | Notes                                                    |
| :----------------------- | :-------- | :---------------------------------------------------- | :------------------------------------------------------- |
| **TwentyCRM**            | Protected | `crm.projectnyra.com`                                 | Cloudflare Access required.                              |
| **3D Landing Page**      | Public    | `projectnyra.com`                                     | Public Project Nyra landing surface.                     |
| **WebApp**               | Protected | `app.projectnyra.com`                                 | Primary broker/customer interface.                       |
| **Activepieces**         | Protected | `activepieces.projectnyra.com`                        | Internal automation dashboard.                           |
| **n8n**                  | Protected | `n8n.projectnyra.com`                                 | Internal automation.                                     |
| **Forgejo**              | Protected | `git.projectnyra.com`                                 | Repository hosting.                                      |
| **Grafana**              | Protected | `grafana.projectnyra.com`                             | Monitoring.                                              |
| **OpenLIT**              | Protected | `openlit.projectnyra.com`                             | Owner-only observability dashboard.                      |
| **Linkwarden**           | Protected | `links.projectnyra.com`, `linkwarden.projectnyra.com` | Home Assistant Green origin through orchestrator tunnel. |
| **Nexus UI**             | Protected | `nexus.projectnyra.com`                               | Operator UI.                                             |
| **Nexus Router API/MCP** | Protected | `nexus-router.projectnyra.com`                        | Service-token preferred; agent entrypoint.               |
| **LiteLLM**              | Protected | `litellm.projectnyra.com`                             | Owner-only model router.                                 |
| **vLLM / Ollama**        | Private   | N/A                                                   | Tailscale only.                                          |
| **Postgres / Redis**     | Private   | N/A                                                   | Never expose publicly.                                   |
| **FalkorDB / Qdrant**    | Private   | N/A                                                   | Never expose publicly.                                   |

## Access Policy

1. **Public**: Accessible by anyone with a browser (Project Nyra 3D landing and RateHunter landing/login).
2. **Protected**: Accessible only via Cloudflare Access (SSO/Email required).
3. **Private**: Accessible only via Tailscale (MagicDNS/Private Mesh).
4. **Internal**: Accessible only within the Docker network (No host port exposure).
