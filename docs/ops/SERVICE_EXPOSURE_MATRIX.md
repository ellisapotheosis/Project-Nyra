# SERVICE_EXPOSURE_MATRIX.md

## Exposure Levels

| Service                  | Level     | Public Hostname                                     | Notes                                                    |
| :----------------------- | :-------- | :-------------------------------------------------- | :------------------------------------------------------- |
| **TwentyCRM**            | Protected | `crm.ratehunter.net`                                | Cloudflare Access required.                              |
| **WebApp**               | Public    | `nyra.ratehunter.net`                               | Primary broker/customer interface.                       |
| **Activepieces**         | Protected | `activepieces.ratehunter.net`                       | Internal automation dashboard.                           |
| **n8n**                  | Protected | `n8n.ratehunter.net`                                | Internal automation.                                     |
| **Gitea**                | Protected | `gitea.ratehunter.net`                              | Repository hosting.                                      |
| **Grafana**              | Protected | `grafana.ratehunter.net`                            | Monitoring.                                              |
| **Linkwarden**           | Protected | `links.ratehunter.net`, `linkwarden.ratehunter.net` | Home Assistant Green origin through orchestrator tunnel. |
| **Nexus UI**             | Protected | `nexus.ratehunter.net`                              | Operator UI.                                             |
| **Nexus Router API/MCP** | Protected | `nexus-router.ratehunter.net`                       | Service-token preferred; agent entrypoint.               |
| **LiteLLM**              | Protected | `litellm.ratehunter.net`                            | Owner-only model router.                                 |
| **vLLM / Ollama**        | Private   | N/A                                                 | Tailscale only.                                          |
| **Postgres / Redis**     | Private   | N/A                                                 | Never expose publicly.                                   |
| **FalkorDB / Qdrant**    | Private   | N/A                                                 | Never expose publicly.                                   |

## Access Policy

1. **Public**: Accessible by anyone with a browser (RateHunter landing/login).
2. **Protected**: Accessible only via Cloudflare Access (SSO/Email required).
3. **Private**: Accessible only via Tailscale (MagicDNS/Private Mesh).
4. **Internal**: Accessible only within the Docker network (No host port exposure).
