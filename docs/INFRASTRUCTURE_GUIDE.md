# Project Nyra Infrastructure Guide

This document provides the canonical steps for configuring Cloudflare Tunnels, Zero Trust Access (OIDC), and Network restrictions.

## 1. Cloudflare Tunnels (Web-Managed)

We use two primary tunnels. Configure these via the [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/).

### Tunnel: Oracle-VPS
| Subdomain | Service | Internal URL |
| :--- | :--- | :--- |
| `crm.ratehunter.net` | Twenty CRM | `http://localhost:3000` |
| `n8n.ratehunter.net` | n8n Automation | `http://localhost:5678` |
| `ap.ratehunter.net` | Activepieces | `http://localhost:8080` |
| `git.ratehunter.net` | Gitea | `http://localhost:3001` |
| `archon.ratehunter.net` | Archon OS | `http://localhost:3737` |
| `paperclip.ratehunter.net` | Paperclip UI | `http://localhost:3111` |
| `memory.ratehunter.net` | OpenMemory | `http://localhost:8765` |
| `chat.ratehunter.net` | Open WebUI | `http://localhost:8088` |
| `grafana.ratehunter.net` | Grafana | `http://localhost:3003` |
| `portainer-vps.ratehunter.net` | Portainer | `http://localhost:9000` |

### Tunnel: Orchestrator-Trex
| Subdomain | Service | Internal URL |
| :--- | :--- | :--- |
| `claw.ratehunter.net` | OpenClaw | `http://localhost:8001` |
| `llm.ratehunter.net` | LiteLLM UI | `http://localhost:4000` |
| `portainer-trex.ratehunter.net` | Portainer | `http://localhost:9000` |
| `landing.ratehunter.net` | Landing Page | `http://localhost:3005` |

---

## 2. Setting up OIDC (Google Access)

1.  **Dashboard**: Go to **Settings > Authentication > Login methods**.
2.  **Add Google**: Provide Client ID and Client Secret from your Google Cloud Console.
3.  **Application Configuration**:
    *   Go to **Access > Applications**.
    *   Add a **Self-hosted** application for each subdomain.
    *   Assign the **Google** provider.

## 3. Access Policies & Restrictions

For every application (except the Landing Page), create a policy with these rules:

### Allowed Emails
*   `edaneandersen@gmail.com`
*   `ellisandersen@ratehunter.net`

### Network Restrictions (Include Rules)
*   **Tailscale Mesh**: `100.64.0.0/10` (Allows access from any device on your Tailscale network).
*   **Local LAN**: `192.168.1.0/24` (Adjust if your LAN subnet is different).

---

## 4. Cross-Host Proxying (e.g., HomeAssistant)

If you have a device like **HomeAssistant Green** that doesn't run its own tunnel, you can proxy it through the Orchestrator tunnel.

1.  In the `Orchestrator-Trex` tunnel settings, add a hostname: `home.ratehunter.net`.
2.  Point it to the **Tailscale IP** of the HomeAssistant box: `http://100.64.0.20:3007`.

## 5. Deployment Checks

To verify your tunnels are working, run the following command on the host:
```bash
docker compose logs -f cloudflared
```
Look for lines saying: `Connection ... registered`.
