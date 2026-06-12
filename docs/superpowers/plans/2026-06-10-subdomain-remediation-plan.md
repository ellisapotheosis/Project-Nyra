# Subdomain Exposure and Tailscale Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cleanly align all public and private subdomains for Project Nyra under the `.projectnyra.com` domain namespace, exposing machine MCP servers privately via Tailscale, setting up Composio on port 2700, and securing public interfaces with Cloudflare Access Policies.

**Architecture:** Use Cloudflared tunnels on Oracle VPS and Orchestrator for public, access-gated traffic (with group policy bypasses for Supabase Auth gateway). Expose private administrative and MCP services strictly via unproxied (grey-cloud) DNS-only records pointing to their respective Tailscale IPs (`100.64.0.3` for Oracle, `100.64.0.2` for Orchestrator, etc.).

**Tech Stack:** Cloudflared, Cloudflare DNS, Cloudflare Access Groups, Tailscale, Docker Compose, YAML/JSON configurations.

---

## File Structure & Responsibility

- `infra/cloudflare/desired-state/exposure-matrix.yml`: The master configuration mapping public tunnels and private exposures.
- `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json`: Local ingress rules for the public-facing cloud tunnel.
- `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json`: Ingress rules for local/LAN proxying.
- `infra/cloudflare/generated-remote/dns-records.desired.json`: Desired DNS records pointing CNAMEs to tunnels, and private subdomains to Tailscale IPs (unproxied/grey-cloud).
- `infra/cloudflare/generated-remote/access-apps.desired.json`: Cloudflare Access applications mapping hostnames to their exact Group IDs.

---

## Bite-Sized Tasks

### Task 1: Update the Master Exposure Matrix

**Files:**

- Modify: `infra/cloudflare/desired-state/exposure-matrix.yml`

- [ ] **Step 1: Modify the Exposure Matrix**
      Update `exposure-matrix.yml` to reflect all public Access-gated routes, open Supabase gateway, private Tailscale subdomains, and the newly added Composio service.

  _Implementation Content to replace in `infra/cloudflare/desired-state/exposure-matrix.yml`:_

  ```yaml
  # Project Nyra Cloudflare exposure matrix.
  # Policy:
  # - UI/admin/dashboard routes require Cloudflare Access.
  # - API/MCP routes require service-token or signed-request controls unless noted.
  # - raw databases, caches, vector stores, worker model ports, and Docker sockets are not tunneled.

  domain: projectnyra.com
  management_mode: api_managed_tunnels_with_docker_connectors

  tunnels:
    orchestrator:
      secret_token: ORCHESTRATOR_TUNNEL_TOKEN
      secret_id: ORCHESTRATOR_TUNNEL_ID
      infisical_path: /machines/orchestrator
      known_active_tunnel_id: ae0bd53a-f22e-4414-8593-5b765dcd044b
    oracle:
      secret_token: ORACLE_TUNNEL_TOKEN
      secret_id: ORACLE_TUNNEL_ID
      infisical_path: /machines/oracle-vps

  pages:
    - hostname: ratehunter.net
      target: cloudflare_pages
      access: public

  routes:
    - hostname: app.projectnyra.com
      tunnel: oracle
      origin: http://webapp:3001
      exposure: public_auth_group_3
      notes: Broker/customer webapp. Protected by Supabase Auth and Access Group 3.
    - hostname: supabase.projectnyra.com
      tunnel: oracle
      origin: http://supabase-kong:8000
      exposure: public_supabase_gateway
      notes: Public API gateway (Kong) for client Auth and DB REST. No Access gate.
    - hostname: crm.projectnyra.com
      tunnel: oracle
      origin: http://twenty:3000
      exposure: public_auth_group_3
      notes: Public multi-tenant CRM gateway.
    - hostname: nexus-ui.projectnyra.com
      tunnel: oracle
      origin: http://nexus-ui:3016
      exposure: public_auth_group_1
      notes: Human control interface for Nexus.
    - hostname: gitea.projectnyra.com
      tunnel: oracle
      origin: http://gitea:3000
      exposure: public_auth_group_1
    - hostname: activepieces.projectnyra.com
      tunnel: oracle
      origin: http://activepieces:80
      exposure: public_auth_group_1
    - hostname: linkwarden.projectnyra.com
      tunnel: orchestrator
      origin: http://100.64.0.2:3007
      exposure: public_auth_group_3
    - hostname: composio.projectnyra.com
      tunnel: oracle
      origin: http://localhost:2700
      exposure: public_service_token_group_2
      notes: Machine gateway for AI Agent tool invocation. Only allows Service Tokens.

  tailscale_routes:
    - hostname: nexus.projectnyra.com
      target: 100.64.0.3:6000
    - hostname: openmemory.projectnyra.com
      target: 100.64.0.3:8765
    - hostname: openwebui.projectnyra.com
      target: 100.64.0.3:8088
    - hostname: wol.projectnyra.com
      target: 100.64.0.2:8765
    - hostname: portainer-oracle.projectnyra.com
      target: 100.64.0.3:9443
    - hostname: portainer.projectnyra.com
      target: 100.64.0.2:9443
    - hostname: portainer-5090.projectnyra.com
      target: 100.64.0.7:9443
    - hostname: portainer-3090.projectnyra.com
      target: 100.64.0.6:9443
    - hostname: portainer-3060.projectnyra.com
      target: 100.64.0.5:9443
    - hostname: syncthing-orchestrator.projectnyra.com
      target: 100.64.0.2:8384
    - hostname: syncthing-5090.projectnyra.com
      target: 100.64.0.7:8384
    - hostname: syncthing-3090.projectnyra.com
      target: 100.64.0.6:8384
    - hostname: syncthing-3060.projectnyra.com
      target: 100.64.0.5:8384
    - hostname: infisical-mcp.projectnyra.com
      target: 100.64.0.3:8766
    - hostname: gitea-mcp.projectnyra.com
      target: 100.64.0.3:3101
    - hostname: letta-mcp.projectnyra.com
      target: 100.64.0.3:8284
    - hostname: activepieces-mcp.projectnyra.com
      target: 100.64.0.3:8779
    - hostname: memos-mcp.projectnyra.com
      target: 100.64.0.3:8095
  ```

- [ ] **Step 2: Commit changes**
      Run:
  ```bash
  git add infra/cloudflare/desired-state/exposure-matrix.yml
  git commit -m "infra: update exposure matrix with public/private Tailscale split"
  ```

---

### Task 2: Update the Oracle Tunnel Config Payload

**Files:**

- Modify: `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json`

- [ ] **Step 1: Write the Oracle Tunnel Config Payload**
      Modify `oracle-tunnel.config.payload.json` to expose `app`, `supabase`, `crm`, `nexus-ui`, `gitea`, `activepieces`, and `composio`. Keep all other admin services strictly routed privately.

  _File Content for `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json`:_

  ```json
  {
    "config": {
      "ingress": [
        { "hostname": "app.projectnyra.com", "service": "http://webapp:3001" },
        {
          "hostname": "supabase.projectnyra.com",
          "service": "http://supabase-kong:8000"
        },
        { "hostname": "crm.projectnyra.com", "service": "http://twenty:3000" },
        {
          "hostname": "nexus-ui.projectnyra.com",
          "service": "http://nexus-ui:3016"
        },
        { "hostname": "gitea.projectnyra.com", "service": "http://gitea:3000" },
        {
          "hostname": "activepieces.projectnyra.com",
          "service": "http://activepieces:80"
        },
        {
          "hostname": "composio.projectnyra.com",
          "service": "http://localhost:2700"
        },
        { "service": "http_status:404" }
      ],
      "warp-routing": {
        "enabled": false
      }
    }
  }
  ```

- [ ] **Step 2: Commit changes**
      Run:
  ```bash
  git add infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json
  git commit -m "infra: restrict oracle tunnel payload to public endpoints and Composio"
  ```

---

### Task 3: Update the Orchestrator Tunnel Config Payload

**Files:**

- Modify: `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json`

- [ ] **Step 1: Write the Orchestrator Tunnel Config Payload**
      Modify `orchestrator-tunnel.config.payload.json` to only proxy `linkwarden.projectnyra.com`.

  _File Content for `infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json`:_

  ```json
  {
    "config": {
      "ingress": [
        {
          "hostname": "linkwarden.projectnyra.com",
          "service": "http://100.64.0.2:3007"
        },
        { "service": "http_status:404" }
      ],
      "warp-routing": {
        "enabled": false
      }
    }
  }
  ```

- [ ] **Step 2: Commit changes**
      Run:
  ```bash
  git add infra/cloudflare/generated-remote/orchestrator-tunnel.config.payload.json
  git commit -m "infra: restrict orchestrator tunnel payload to Linkwarden"
  ```

---

### Task 4: Update the Desired DNS Records Configuration

**Files:**

- Modify: `infra/cloudflare/generated-remote/dns-records.desired.json`

- [ ] **Step 1: Write the Desired DNS Records**
      Configure DNS mapping: Public CNAME records should proxy through their respective Cloudflare Tunnels. All private subdomains (MCPs, Syncthing, Portainer, internal APIs) must point directly to private Tailscale IPs and be marked `"proxied": false` (Grey Cloud).

  _File Content for `infra/cloudflare/generated-remote/dns-records.desired.json`:_

  ```json
  {
    "zone_name": "projectnyra.com",
    "note": "Public CNAMES point to tunnels. Private subdomains point to Tailscale CGNAT IPs with proxied=false.",
    "records": [
      {
        "name": "app",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "supabase",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "crm",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "nexus-ui",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "gitea",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "activepieces",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "composio",
        "type": "CNAME",
        "content": "${ORACLE_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },
      {
        "name": "linkwarden",
        "type": "CNAME",
        "content": "${ORCHESTRATOR_TUNNEL_ID}.cfargotunnel.com",
        "proxied": true
      },

      {
        "name": "nexus",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "openmemory",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "openwebui",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      { "name": "wol", "type": "A", "content": "100.64.0.2", "proxied": false },

      {
        "name": "portainer-oracle",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "portainer",
        "type": "A",
        "content": "100.64.0.2",
        "proxied": false
      },
      {
        "name": "portainer-5090",
        "type": "A",
        "content": "100.64.0.7",
        "proxied": false
      },
      {
        "name": "portainer-3090",
        "type": "A",
        "content": "100.64.0.6",
        "proxied": false
      },
      {
        "name": "portainer-3060",
        "type": "A",
        "content": "100.64.0.5",
        "proxied": false
      },

      {
        "name": "syncthing-orchestrator",
        "type": "A",
        "content": "100.64.0.2",
        "proxied": false
      },
      {
        "name": "syncthing-5090",
        "type": "A",
        "content": "100.64.0.7",
        "proxied": false
      },
      {
        "name": "syncthing-3090",
        "type": "A",
        "content": "100.64.0.6",
        "proxied": false
      },
      {
        "name": "syncthing-3060",
        "type": "A",
        "content": "100.64.0.5",
        "proxied": false
      },

      {
        "name": "infisical-mcp",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "gitea-mcp",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "letta-mcp",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "activepieces-mcp",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      },
      {
        "name": "memos-mcp",
        "type": "A",
        "content": "100.64.0.3",
        "proxied": false
      }
    ]
  }
  ```

- [ ] **Step 2: Commit changes**
      Run:
  ```bash
  git add infra/cloudflare/generated-remote/dns-records.desired.json
  git commit -m "infra: update desired DNS mapping with private Tailscale A records"
  ```

---

### Task 5: Update Cloudflare Access Applications Policy

**Files:**

- Modify: `infra/cloudflare/generated-remote/access-apps.desired.json`

- [ ] **Step 1: Write Access Policy Configuration**
      Update the Cloudflare Access applications configuration to align exact hostnames with your three Group IDs. Ensure `supabase.projectnyra.com` is explicitly bypassed.

  _File Content for `infra/cloudflare/generated-remote/access-apps.desired.json`:_

  ```json
  {
    "team_name": "${CF_ACCESS_TEAM_NAME}",
    "domain": "projectnyra.com",
    "default_ui_policy": "allow Google Workspace/domain-approved users, require MFA where available",
    "service_token_policy": "allow only named Cloudflare Access service tokens for API/MCP machine access",
    "applications": [
      {
        "name": "Nyra Owner Only Infra",
        "hostnames": [
          "nexus-ui.projectnyra.com",
          "gitea.projectnyra.com",
          "activepieces.projectnyra.com"
        ],
        "type": "self_hosted",
        "policy_group_id": "6290c676-cb4b-4482-a87e-fe048d4cab8a",
        "notes": "Group 1: Personal Admin. 2FA Required."
      },
      {
        "name": "Nyra Service APIs",
        "hostnames": ["composio.projectnyra.com"],
        "type": "self_hosted",
        "policy_group_id": "04f027b4-5377-4a95-821c-fc76ed97e177",
        "notes": "Group 2: Machine/Agent Service Token Access."
      },
      {
        "name": "Nyra Client Surface",
        "hostnames": [
          "app.projectnyra.com",
          "crm.projectnyra.com",
          "linkwarden.projectnyra.com"
        ],
        "type": "self_hosted",
        "policy_group_id": "0e6f3dd6-61ac-4bc1-aa94-044d21215128",
        "notes": "Group 3: Friends, Family & Subscribers."
      }
    ],
    "excluded_from_access": [
      "supabase.projectnyra.com",
      "nexus.projectnyra.com",
      "openmemory.projectnyra.com",
      "openwebui.projectnyra.com",
      "wol.projectnyra.com",
      "portainer-oracle.projectnyra.com",
      "portainer.projectnyra.com",
      "portainer-5090.projectnyra.com",
      "portainer-3090.projectnyra.com",
      "portainer-3060.projectnyra.com",
      "syncthing-orchestrator.projectnyra.com",
      "syncthing-5090.projectnyra.com",
      "syncthing-3090.projectnyra.com",
      "syncthing-3060.projectnyra.com",
      "infisical-mcp.projectnyra.com",
      "gitea-mcp.projectnyra.com",
      "letta-mcp.projectnyra.com",
      "activepieces-mcp.projectnyra.com",
      "memos-mcp.projectnyra.com"
    ]
  }
  ```

- [ ] **Step 2: Commit changes**
      Run:
  ```bash
  git add infra/cloudflare/generated-remote/access-apps.desired.json
  git commit -m "infra: map public subdomains to exact Access Group IDs and exclude Tailscale routes"
  ```
