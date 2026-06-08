# Domain Inventory

Created: 2026-05-28 (Prompt 00 deliverable, referenced by Prompts 03–07)

This file is the single source of truth for all domains and their routing.

---

## Domains

| Domain | Purpose | DNS Authority | Hosting |
|--------|---------|---------------|---------|
| `ratehunter.net` | Public mortgage landing page | Cloudflare DNS | Cloudflare Pages (`ratehunter-landing`) |
| `projectnyra.com` | Primary platform domain — apps, services, tunnels | Cloudflare DNS | Cloudflared tunnels (orchestrator + oracle) |

---

## Nameservers

| Domain | NS1 | NS2 |
|--------|-----|-----|
| `ratehunter.net` | `mcgrory.ns.cloudflare.com` | `zita.ns.cloudflare.com` |
| `projectnyra.com` | `mcgrory.ns.cloudflare.com` | `zita.ns.cloudflare.com` |

---

## projectnyra.com Subdomain Inventory

### Oracle VPS Tunnel (`ORACLE_TUNNEL_ID.cfargotunnel.com`)

| Subdomain | Service | Access |
|-----------|---------|--------|
| `app` | Broker webapp | CF Access gated |
| `api` | Supabase Kong | Public (JWT) |
| `hooks` | n8n webhook ingress | Signed webhooks |
| `twenty` | Twenty CRM | CF Access |
| `crm` | Twenty CRM alias | CF Access |
| `n8n` | n8n UI | CF Access |
| `gitea` | Gitea UI | CF Access |
| `activepieces` | Activepieces UI | CF Access |
| `grafana` | Grafana | CF Access |
| `openlit` | OpenLIT | Owner-only |
| `prometheus` | Prometheus | Owner-only |
| `cadvisor` | cAdvisor | Owner-only |
| `openwebui` | Open WebUI | CF Access |
| `nexus` | Nexus UI | CF Access |
| `nexus-router` | Nexus Router API | Service token |
| `litellm` | LiteLLM | Owner-only |
| `paperclip` | Paperclip | CF Access |
| `clawteam` | ClawTeam | CF Access |
| `portainer-oracle` | Oracle Portainer | Owner-only |
| `git-ssh` | Gitea SSH | Access SSH |
| `uptime` | Uptime Kuma | CF Access |
| `public-status` | Uptime Kuma (public) | Public |
| `oracle` | Oracle Caddy gateway | Public (fallback) |

### Orchestrator Tunnel (`ORCHESTRATOR_TUNNEL_ID.cfargotunnel.com`)

| Subdomain | Service | Access |
|-----------|---------|--------|
| `links` | HA Green Linkwarden | CF Access |
| `linkwarden` | Linkwarden alias | CF Access |
| `ha` | Home Assistant | CF Access |
| `portainer` | Orchestrator Portainer | Owner-only |
| `litellm` | LiteLLM via Tailscale | Owner-only |
| `nexus` | Nexus Router via Tailscale | CF Access |
| `nexus-router` | Nexus Router API via Tailscale | Service token |
| `letta` | Letta via Tailscale | CF Access |
| `crm-ui` | CRM UI via Tailscale | CF Access |
| `openclaw-gateway` | OpenClaw Gateway | CF Access |
| `router.openclaw` | OpenClaw Router alias | CF Access |
| `admin` | Admin portal | CF Access |
| `chat` | Chat UI | CF Access |
| `borrower-chat` | Borrower Chat | CF Access |
| `campaigns` | Campaign engine | CF Access |
| `quotes` | Quote API | CF Access |
| `status` | Status dashboard | CF Access |
| `gastown` | GasTown | CF Access |
| `gasteam` | GasTeam | CF Access |
| `nerve-5090` | Worker RTX 5090 Nerve UI | CF Access |
| `claw-5090` | Worker RTX 5090 Claw UI | CF Access |
| `nerve-3090` | Worker RTX 3090 Ti Nerve UI | CF Access |
| `claw-3090` | Worker RTX 3090 Ti Claw UI | CF Access |
| `nerve-3060` | Worker RTX 3060 Nerve UI | CF Access |
| `picoclaw-3060` | Worker RTX 3060 PicoClaw UI | CF Access |

### Cloudflare Pages

| Domain | Project | Notes |
|--------|---------|-------|
| `ratehunter.net` | `ratehunter-landing` | Next.js app at `apps/ratehunter/` |
| `www.ratehunter.net` | `ratehunter-landing` | Alias |

---

## Environment Variables Reference

```bash
# Domains
RATEHUNTER_DOMAIN=ratehunter.net
PROJECTNYRA_DOMAIN=projectnyra.com

# Cloudflare NS (do not change unless CF reassigns)
CF_NS1=mcgrory.ns.cloudflare.com
CF_NS2=zita.ns.cloudflare.com

# Cloudflare API (store in Infisical, never commit)
CLOUDFLARE_ACCOUNT_ID=REPLACE_ME
CLOUDFLARE_ZONE_ID_RATEHUNTER=REPLACE_ME
CLOUDFLARE_ZONE_ID_PROJECTNYRA=REPLACE_ME
CLOUDFLARE_API_TOKEN=REPLACE_ME

# Tunnel identifiers (store in Infisical, never commit)
ORCHESTRATOR_TUNNEL_NAME=REPLACE_ME
ORCHESTRATOR_TUNNEL_ID=REPLACE_ME
ORCHESTRATOR_CREDENTIALS_FILE=/etc/cloudflared/ORCHESTRATOR_TUNNEL_ID.json
ORACLE_TUNNEL_NAME=REPLACE_ME
ORACLE_TUNNEL_ID=REPLACE_ME
ORACLE_CREDENTIALS_FILE=/etc/cloudflared/ORACLE_TUNNEL_ID.json
```
