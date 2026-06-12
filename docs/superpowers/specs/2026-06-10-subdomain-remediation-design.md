# Design Spec: Subdomain Exposure and Tailscale Remediation

**Date**: 2026-06-10  
**Author**: Gemini CLI  
**Status**: Approved & Ready for Implementation

---

## 🎯 Executive Goal

To ensure that all services, database APIs, Model Context Protocol (MCP) servers, and administrative dashboards across the Project Nyra network are cleanly exposed under the `.projectnyra.com` domain namespace.

- **Public Services** are exposed via **Cloudflared Tunnels** and secured via **Cloudflare Access** (using specific Group ID policies).
- **Private Services** (such as sensitive MCP servers and administrative panels) are exposed via **Tailscale Private DNS** (grey-cloud, unproxied Cloudflare DNS records pointing to private `100.64.x.y` Tailscale IPs).
- **Zero Exposure Gaps**: Ensure that every active service in the Docker Compose files has at least a private Tailscale subdomain for secure owner access.

---

## 🔒 Cloudflare Access Policy Groups

To protect public subdomains, we will leverage your three established Access Group IDs:

1.  **Group 1: Owner / Personal Admin**
    - **Group ID**: `6290c676-cb4b-4482-a87e-fe048d4cab8a`
    - **Policy**: Approves `@ratehunter.net`, `@projectnyra.com`, and `edaneandersen@gmail.com` with **2FA Required**.
    - **Applies to**: `nexus-ui.projectnyra.com`, `gitea.projectnyra.com`, `activepieces.projectnyra.com`.

2.  **Group 2: Machine / AI Agents**
    - **Group ID**: `04f027b4-5377-4a95-821c-fc76ed97e177`
    - **Policy**: Requires a secure **Cloudflare Access Service Token**.
    - **Applies to**: `composio.projectnyra.com` (for agent tool invocation), webhook hooks, and API gateways.

3.  **Group 3: Family, Friends & Subscribers**
    - **Group ID**: `0e6f3dd6-61ac-4bc1-aa94-044d21215128`
    - **Policy**: Whitelists friends/family emails; enables access request via email to `ellisandersen@ratehunter.net`.
    - **Applies to**: `app.projectnyra.com` (Main webapp), `crm.projectnyra.com` (SaaS client CRM dashboard), `linkwarden.projectnyra.com`.

---

## 🌐 The Master Subdomain Map

### 1. Public Subdomains (Cloudflared Tunnel + Access Gated)

| Subdomain        | Public Target URL           | Tunnel | Access Group ID                        | Tailscale Private Fallback           |
| :--------------- | :-------------------------- | :----- | :------------------------------------- | :----------------------------------- |
| **app**          | `http://webapp:3001`        | Oracle | `0e6f3dd6-61ac-4bc1-aa94-044d21215128` | `app-local.projectnyra.com`          |
| **crm**          | `http://twenty:3000`        | Oracle | `0e6f3dd6-61ac-4bc1-aa94-044d21215128` | `crm-local.projectnyra.com`          |
| **nexus-ui**     | `http://nexus-ui:3016`      | Oracle | `6290c676-cb4b-4482-a87e-fe048d4cab8a` | `nexus-ui-local.projectnyra.com`     |
| **supabase**     | `http://supabase-kong:8000` | Oracle | **None (Bypassed for Auth & DB REST)** | `supabase-local.projectnyra.com`     |
| **gitea**        | `http://gitea:3000`         | Oracle | `6290c676-cb4b-4482-a87e-fe048d4cab8a` | `gitea-local.projectnyra.com`        |
| **activepieces** | `http://activepieces:80`    | Oracle | `6290c676-cb4b-4482-a87e-fe048d4cab8a` | `activepieces-local.projectnyra.com` |
| **linkwarden**   | `http://100.64.0.2:3007`    | Oracle | `0e6f3dd6-61ac-4bc1-aa94-044d21215128` | `linkwarden-local.projectnyra.com`   |
| **composio**     | `http://localhost:2700`     | Oracle | `04f027b4-5377-4a95-821c-fc76ed97e177` | `composio-local.projectnyra.com`     |

---

### 2. Private Subdomains (Tailscale Only - Grey-Cloud DNS)

These subdomains point directly to the private CGNAT IPs (`100.64.x.y`) of each node on your Tailnet. They resolve _only_ when connected to Tailscale.

#### 🔧 Core API & Dashboard Endpoints

- **`nexus.projectnyra.com`** ➜ `100.64.0.3:6000` (Oracle VPS - Private master API gateway)
- **`openmemory.projectnyra.com`** ➜ `100.64.0.3:8765` (Oracle VPS - OpenMemory container backend)
- **`openwebui.projectnyra.com`** ➜ `100.64.0.3:8088` (Oracle VPS - OpenWebUI portal)
- **`wol.projectnyra.com`** ➜ `100.64.0.2:8765` (Orchestrator - WOL Power API)

#### 🛠️ Portainer Dashboards

- **`portainer-oracle.projectnyra.com`** ➜ `100.64.0.3:9443` (Oracle VPS Portainer CE)
- **`portainer.projectnyra.com`** ➜ `100.64.0.2:9443` (Orchestrator Portainer Agent)
- **`portainer-5090.projectnyra.com`** ➜ `100.64.0.7:9443` (RTX 5090 Portainer Agent)
- **`portainer-3090.projectnyra.com`** ➜ `100.64.0.6:9443` (RTX 3090 Ti Portainer Agent)
- **`portainer-3060.projectnyra.com`** ➜ `100.64.0.5:9443` (RTX 3060 Portainer Agent)

#### 🔄 Syncthing Cluster Sync Nodes

- **`syncthing-orchestrator.projectnyra.com`** ➜ `100.64.0.2:8384` (Orchestrator Syncthing UI)
- **`syncthing-5090.projectnyra.com`** ➜ `100.64.0.7:8384` (RTX 5090 Syncthing UI)
- **`syncthing-3090.projectnyra.com`** ➜ `100.64.0.6:8384` (RTX 3090 Ti Syncthing UI)
- **`syncthing-3060.projectnyra.com`** ➜ `100.64.0.5:8384` (RTX 3060 Syncthing UI)

#### 🤖 Private MCP Server Connectors (No "mcp" in public, but allowed in private)

- **`infisical-mcp.projectnyra.com`** ➜ `100.64.0.3:8766`
- **`gitea-mcp.projectnyra.com`** ➜ `100.64.0.3:3101`
- **`letta-mcp.projectnyra.com`** ➜ `100.64.0.3:8284`
- **`activepieces-mcp.projectnyra.com`** ➜ `100.64.0.3:8779`
- **`memos-mcp.projectnyra.com`** ➜ `100.64.0.3:8095`

---

## 🛠️ Implementation Plan

1.  **Update `exposure-matrix.yml`**: Ensure all subdomain rules, targets, ports, and Access Group associations are cleanly defined according to this spec.
2.  **Update `oracle-tunnel.config.payload.json`**: Apply target mappings for `composio`, `supabase`, `nexus-ui`, and clean up any obsolete aliases.
3.  **Update `orchestrator-tunnel.config.payload.json`**: Clean up obsolete routes and align linkwarden, app, and local nodes.
4.  **Update `dns-records.desired.json`**:
    - Map public CNAME endpoints to tunnels.
    - Map private services to Tailscale IPs (`100.64.x.y`) with `"proxied": false` (Grey Cloud).
5.  **Update `access-apps.desired.json`**: Apply Group policy configurations aligned with the exact Access Group IDs provided.
