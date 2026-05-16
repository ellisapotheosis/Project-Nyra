# SERVICE_EXPOSURE_MATRIX.md

## Exposure Levels

| Service                  | Level     | Public Hostname                                     | Notes                                                    |
| :----------------------- | :-------- | :-------------------------------------------------- | :------------------------------------------------------- |
| **Landing Page**         | Public    | `ratehunter.net`                                    | Hosted on Cloudflare Pages.                              |
| **Lead Capture API**     | Public    | `capture.projectnyra.com`                            | Webhook Ingress (Oracle VPS).                            |
| **WebApp**               | Public    | `app.projectnyra.com`                               | Broker/Customer interface (Oracle VPS).                 |
| **TwentyCRM**            | Protected | `crm.projectnyra.com`                                | Cloudflare Access required (Oracle VPS).                 |
| **Activepieces**         | Protected | `activepieces.projectnyra.com`                       | Internal automation (Oracle VPS).                        |
| **n8n**                  | Protected | `n8n.projectnyra.com`                                | Internal automation (Oracle VPS).                        |
| **Gitea**                | Protected | `gitea.projectnyra.com`                              | Repository hosting (Oracle VPS).                         |
| **Nexus Router API/MCP** | Protected | `nexus.projectnyra.com`                              | Single entrypoint (Oracle VPS).                          |
| **Nexus Console UI**     | Protected | `nexus-ui.projectnyra.com`                           | Operator dashboard (Oracle VPS).                         |
| **LiteLLM**              | Protected | `litellm.projectnyra.com`                            | Model router (Oracle VPS).                               |
| **vLLM / Ollama**        | Private   | N/A                                                 | Tailscale only (Local GPU Workers).                      |
| **Postgres / Redis**     | Private   | N/A                                                 | Tailscale only (Oracle VPS / Local).                     |
| **FalkorDB / Qdrant**    | Private   | N/A                                                 | Tailscale only (Oracle VPS).                             |

## Access Policy

1. **Public**: Accessible by anyone with a browser (RateHunter landing/login).
2. **Protected**: Accessible only via Cloudflare Access (SSO/Email required).
3. **Private**: Accessible only via Tailscale (MagicDNS/Private Mesh).
4. **Internal**: Accessible only within the Docker network (No host port exposure).
