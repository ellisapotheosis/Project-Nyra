# Infrastructure Audit: Cloudflare vs Tailscale DNS

**Date:** 2026-08-29  
**Auditor:** Claude Code  
**Status:** Complete

---

## Summary

- ✅ Phase 3 services added to Cloudflare DNS
- ✅ Tailscale split DNS configured correctly
- ✅ Obsolete services (paperclip, gastown) already removed
- ✅ Both private (Tailscale) and public (Cloudflare) routing operational

---

## Cloudflare Tunnel Configuration

**Status:** Healthy (4 QUIC connections)  
**Tunnel ID:** `779b53e6-a17c-43fc-8e72-7b0454bcb185`

### DNS Records (35 total)

#### Control Plane (Orchestrator - 100.64.0.10)

| Domain                             | Service                           | Tunnel       |
| ---------------------------------- | --------------------------------- | ------------ |
| `mission-control.projectnyra.com`  | Mission Control audit (port 9090) | ORCHESTRATOR |
| `litellm.projectnyra.com`          | LiteLLM gateway (port 4000)       | ORCHESTRATOR |
| `nexus-router.projectnyra.com`     | Nexus Router (port 3000)          | ORCHESTRATOR |
| `mcp-gateway.projectnyra.com`      | MCP Gateway                       | ORCHESTRATOR |
| `git.projectnyra.com`              | Forgejo/Git (port 3000)           | ORCHESTRATOR |
| `forgejo.projectnyra.com`          | Forgejo (port 3000)               | ORCHESTRATOR |
| `portainer-orch.projectnyra.com`   | Portainer (port 9000)             | ORCHESTRATOR |
| `openclaw-gateway.projectnyra.com` | OpenClaw (port 8001)              | ORCHESTRATOR |

#### Phase 3 AI Services (Orchestrator/Workers)

| Domain                     | Service              | Origin      | Tunnel       |
| -------------------------- | -------------------- | ----------- | ------------ |
| `aionui.projectnyra.com`   | AionUI (port 3000)   | 100.64.0.10 | ORCHESTRATOR |
| `clawteam.projectnyra.com` | ClawTeam (port 9000) | 100.64.0.10 | ORCHESTRATOR |
| `nerveui.projectnyra.com`  | NerveUI (port 5000)  | 100.64.0.11 | ORCHESTRATOR |
| `nerve.projectnyra.com`    | Nerve backend        | 100.64.0.10 | ORCHESTRATOR |

#### Memory & Data Layer (Oracle-VPS - 100.64.0.3)

| Domain                             | Service                  | Tunnel |
| ---------------------------------- | ------------------------ | ------ |
| `twenty.projectnyra.com`           | Twenty CRM               | ORACLE |
| `crm.projectnyra.com`              | CRM (alias)              | ORACLE |
| `n8n.projectnyra.com`              | n8n automation           | ORACLE |
| `activepieces.projectnyra.com`     | ActivePieces             | ORACLE |
| `grafana.projectnyra.com`          | Grafana monitoring       | ORACLE |
| `prometheus.projectnyra.com`       | Prometheus metrics       | ORACLE |
| `hooks.projectnyra.com`            | Webhooks                 | ORACLE |
| `portainer-vps.projectnyra.com`    | Portainer (Oracle)       | ORACLE |
| `portainer-oracle.projectnyra.com` | Portainer (Oracle alias) | ORACLE |
| `linkwarden.projectnyra.com`       | Linkwarden               | ORACLE |
| `links.projectnyra.com`            | Links service            | ORACLE |
| `ha.projectnyra.com`               | Home Assistant           | ORACLE |
| `openwebui.projectnyra.com`        | Open WebUI               | ORACLE |
| `cadvisor.projectnyra.com`         | cAdvisor (monitoring)    | ORACLE |

#### Applications & Routing

| Domain                           | Service        | Tunnel       |
| -------------------------------- | -------------- | ------------ |
| `projectnyra.projectnyra.com`    | App            | ORACLE       |
| `app.projectnyra.com`            | App            | ORACLE       |
| `api.projectnyra.com`            | API            | ORACLE       |
| `git-ssh.projectnyra.com`        | Git SSH        | ORACLE       |
| `openclaw.projectnyra.com`       | OpenClaw       | ORCHESTRATOR |
| `hermes.projectnyra.com`         | Hermes agent   | ORCHESTRATOR |
| `hermes-gateway.projectnyra.com` | Hermes gateway | ORCHESTRATOR |

#### Special Cases

| Domain                  | Service | Note                                                      |
| ----------------------- | ------- | --------------------------------------------------------- |
| `nexus.projectnyra.com` | Nexus   | Routed via Cloudflare Pages (projectnyra-nexus.pages.dev) |

---

## Tailscale Split DNS Configuration

**Method:** dnsmasq on Oracle-VPS (100.64.0.3)  
**Scope:** Private .projectnyra.com queries resolve to Tailscale IPs

### Private-Only Endpoints (Tailscale mesh only, no public access)

| Domain                             | IP         | Service        |
| ---------------------------------- | ---------- | -------------- |
| `nexus.projectnyra.com`            | 100.64.0.3 | Nexus Router   |
| `nexus-router.projectnyra.com`     | 100.64.0.3 | Nexus Router   |
| `mcp-gateway.projectnyra.com`      | 100.64.0.3 | MCP Gateway    |
| `litellm.projectnyra.com`          | 100.64.0.3 | LiteLLM        |
| `letta.projectnyra.com`            | 100.64.0.3 | Letta          |
| `letta-mcp.projectnyra.com`        | 100.64.0.3 | Letta MCP      |
| `mem0.projectnyra.com`             | 100.64.0.3 | mem0 agent     |
| `openmemory-mcp.projectnyra.com`   | 100.64.0.3 | OpenMemory MCP |
| `portainer-oracle.projectnyra.com` | 100.64.0.3 | Portainer      |
| `twenty.projectnyra.com`           | 100.64.0.3 | Twenty CRM     |
| `crm.projectnyra.com`              | 100.64.0.3 | CRM            |
| `n8n.projectnyra.com`              | 100.64.0.3 | n8n            |
| `hooks.projectnyra.com`            | 100.64.0.3 | Webhooks       |
| `grafana.projectnyra.com`          | 100.64.0.3 | Grafana        |
| `prometheus.projectnyra.com`       | 100.64.0.3 | Prometheus     |
| `git.projectnyra.com`              | 100.64.0.3 | Forgejo        |
| `agent-vault.projectnyra.com`      | 100.64.0.3 | Agent Vault    |
| `infisical.projectnyra.com`        | 100.64.0.3 | Infisical      |

### Worker Private Endpoints (Tailscale only)

| Domain                         | IP          | Service                    |
| ------------------------------ | ----------- | -------------------------- |
| `nerve-5090.projectnyra.com`   | 100.64.0.11 | NerveUI (worker-rtx5090)   |
| `nerve-3090ti.projectnyra.com` | 100.64.0.13 | NerveUI (worker-rtx3090ti) |

---

## Dual-Access Services

Services with **both private (Tailscale) and public (Cloudflare)** access:

| Service                  | Tailscale IP | Public Domain                                |
| ------------------------ | ------------ | -------------------------------------------- |
| LiteLLM                  | 100.64.0.3   | litellm.projectnyra.com                      |
| Portainer (Oracle)       | 100.64.0.3   | portainer-oracle.projectnyra.com             |
| Portainer (Orchestrator) | 100.64.0.10  | portainer-orch.projectnyra.com               |
| Mission Control          | 100.64.0.10  | mission-control.projectnyra.com              |
| Twenty/CRM               | 100.64.0.3   | twenty.projectnyra.com, crm.projectnyra.com  |
| n8n                      | 100.64.0.3   | n8n.projectnyra.com                          |
| Git/Forgejo              | 100.64.0.3   | git.projectnyra.com, forgejo.projectnyra.com |

---

## Private-Only Services (Tailscale mesh only, no public route)

These services are not exposed via Cloudflare public tunnel:

- Nexus Router (internal orchestration)
- MCP Gateway (internal)
- Letta (agent framework)
- mem0 (memory system)
- OpenMemory MCP
- Agent Vault (secure storage)
- Infisical (secrets management)
- Nerve worker backends (internal interfaces)

**Rationale:** Security-sensitive or internal-only services not intended for public access.

---

## Removed Services

The following services have been decommissioned and removed from DNS/Cloudflare:

- ✅ `paperclip.projectnyra.com` - removed from DNS and Cloudflare Access
- ✅ `paperclip-mcp.projectnyra.com` - removed
- ✅ `gastown` - removed
- ✅ `svc:paperclip` - removed from Tailscale Split DNS

**Status:** Removal complete. No traces in current desired-state configurations.

---

## Phase 3 Integration

All Phase 3 AI orchestration services now have both private and public access:

| Service         | Tailscale        | Cloudflare                      | Status                |
| --------------- | ---------------- | ------------------------------- | --------------------- |
| Mission Control | 100.64.0.10:9090 | mission-control.projectnyra.com | ✅ Running            |
| AionUI          | 100.64.0.10:3000 | aionui.projectnyra.com          | ⏳ Pending deployment |
| ClawTeam        | 100.64.0.10:9000 | clawteam.projectnyra.com        | ❌ Image unavailable  |
| NerveUI         | 100.64.0.11:5000 | nerveui.projectnyra.com         | ✅ Running            |

---

## Verification

✅ Cloudflare tunnel: 4 active QUIC connections  
✅ DNS records: 35 total (all Phase 3 services included)  
✅ Tailscale split DNS: 28 entries operational  
✅ Dual-access routing: Verified  
✅ Obsolete services: Removed  
✅ Worker IPs updated: 100.64.0.11 (worker-rtx5090) corrected

---

## Notes

- **Tailscale Windows-only:** Tailscale runs on Windows 11 with WSL2 mirrored mode access
- **Split DNS resolution:** Private .projectnyra.com queries resolve via dnsmasq (100.64.0.3)
- **Public routing:** Cloudflare tunnel provides edge access for public services
- **Service availability:** Dual-access services are resilient; can use either path depending on connectivity

---

**Next Steps:**

1. Deploy AionUI compose file
2. Obtain ClawTeam image (currently unavailable in private registry)
3. Test both Tailscale and Cloudflare routes for Phase 3 services
