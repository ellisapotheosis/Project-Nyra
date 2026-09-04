# Project Nyra — Current State Summary

**Branch:** `chore/nyra-infra-harmonization-20260725`
**Date:** 2026-07-25
**Phase:** 0 — Discovery (pre-mutation)

---

## 1. Tailnet Identity

- **Tailnet name:** `trex-fiordland.ts.net`
- **Primary domain:** `projectnyra.com`
- **Oracle VPS Tailscale IP:** `100.64.0.3`
- **Orchestrator Tailscale IP:** `100.64.0.10`
- **Home Assistant IP:** `100.64.0.2`
- **Worker IPs:** DISCOVER (not yet confirmed from live host)

---

## 2. Tunnel Topology (Current)

Two active tunnel references exist:

| Tunnel       | ID (known)                           | Primary host | Status                                                            |
| ------------ | ------------------------------------ | ------------ | ----------------------------------------------------------------- |
| oracle       | unknown                              | oracle-vps   | Active — canonical                                                |
| orchestrator | ae0bd53a-f22e-4414-8593-5b765dcd044b | orchestrator | Partially active — still routes links/linkwarden/openclaw-gateway |

**Orchestrator tunnel must NOT be blindly deleted** — still handles 3 routes:

- `links.projectnyra.com` → `http://100.64.0.2:3007`
- `linkwarden.projectnyra.com` → `http://100.64.0.2:3007`
- `openclaw-gateway.projectnyra.com` → `http://nyra-openclaw-gateway:8001`

Action required: migrate these 3 routes to oracle tunnel, then retire orchestrator tunnel.

A backup file exists at:
`infra/hosts/orchestrator/docker-compose.cloudflared.yml.bak.20260715-074223`
(This confirms the orchestrator tunnel cloudflared was already disabled on 2026-07-15.)

---

## 3. Oracle VPS — Service Inventory (docker-compose.yml)

Oracle is the canonical always-on host. 40+ services defined in main compose:

### Core Data

| Service     | Image                       | Host Port     | Status |
| ----------- | --------------------------- | ------------- | ------ |
| postgres    | postgres:15                 | internal only | OK     |
| redis-cache | redis:7-alpine              | internal only | OK     |
| twenty-db   | postgres:15                 | internal only | OK     |
| supabase-db | supabase/postgres:15.1.1.78 | 54322:5432    | OK     |

### Application

| Service         | Image                              | Host Port | Notes                     |
| --------------- | ---------------------------------- | --------- | ------------------------- |
| twenty          | twentycrm/twenty:latest            | 3000:3000 | `latest` tag — not pinned |
| twenty-worker   | twentycrm/twenty:latest            | none      | `latest` — not pinned     |
| twenty-mcp      | nyra-network-twenty-mcp:latest     | 8400:8400 | custom build              |
| activepieces    | activepieces/activepieces:latest   | 8080:80   | `latest` — not pinned     |
| n8n             | build (infra/images/n8n/)          | 5678:5678 | custom build              |
| quote-api       | build (services/quote-api)         | 7070:7070 | custom build              |
| crm-api         | build (services/crm-api)           | 4001:4001 | custom build              |
| quote_engine    | build (services/quote-engine)      | 8089:5000 | profile: apps             |
| campaign_engine | build (services/campaign-engine)   | 8020:8020 | profile: apps             |
| openwebui       | ghcr.io/open-webui/open-webui:main | 8088:8080 | not pinned                |

### AI/MCP Gateway

| Service   | Image                                 | Host Port                 | Notes                   |
| --------- | ------------------------------------- | ------------------------- | ----------------------- |
| litellm   | ghcr.io/berriai/litellm:v1.92.0       | **127.0.0.1:4010:4000**   | loopback-only           |
| nexus     | ghcr.io/grafbase/nexus:0.6.0          | **127.0.0.1:6000:3000**   | loopback-only           |
| omniroute | diegosouzapw/omniroute@sha256:...     | **127.0.0.1:20128:20128** | pinned digest ✓         |
| ha-mcp    | ghcr.io/homeassistant-ai/ha-mcp:7.4.0 | internal                  | pinned ✓                |
| paperclip | ghcr.io/paperclipai/paperclip:latest  | 3111:3100                 | NOT in optional profile |

### MCP Servers (20+ services, all via supergateway on oracle)

Ports 8766–8778: infisical-mcp, mempalace-mcp, git-mcp, paperclip-mcp, magicui-mcp, shadcn-mcp,
sequential-thinking-mcp, playwright-mcp, firecrawl-mcp, next-devtools-mcp, tavily-mcp, wcgw-mcp,
gitingest-mcp, codebase-index-mcp

### Management

| Service         | Image                          | Host Port            | Notes             |
| --------------- | ------------------------------ | -------------------- | ----------------- |
| portainer-se    | portainer/portainer-ce:2.27.9  | **8000, 9000, 9443** | ⚠️ PORT COLLISION |
| secrets-init    | build (infisical-secrets-init) | none                 | one-shot          |
| infisical-agent | build (infisical-secrets-init) | none                 | sidecar           |
| cloudflared     | cloudflare/cloudflared:latest  | none                 | not pinned        |

### Observability

prometheus (9090), loki (3100), grafana (3003:3000), cadvisor (8081), openlit (3004), openlit-clickhouse

### Supabase Stack

supabase-db (54322), supabase-auth, supabase-rest, supabase-kong (**8000:8000**)

### Syncthing

- Profile: sync
- **CRITICAL:** Mounts `/run/desktop/mnt/host/wsl/...` — broken WSL2 path
- OMNIBUS: Syncthing must NOT run on oracle-vps

---

## 4. CRITICAL PORT COLLISIONS — Oracle VPS

| Port     | Service A         | Service B                            | Severity                                        |
| -------- | ----------------- | ------------------------------------ | ----------------------------------------------- |
| **8000** | portainer-se:8000 | supabase-kong:8000                   | CRITICAL — one fails to start                   |
| **3000** | twenty (internal) | nexus (127.0.0.1:6000→3000 internal) | OK — nexus is loopback, different internal port |

Resolution needed for port 8000:

- Option A: Move portainer-se to port 9000 only (or different host port)
- Option B: Move supabase-kong to 8443 or similar
- Preferred: portainer uses 9443 (HTTPS), change 8000 mapping; supabase-kong stays at 8000

---

## 5. Orchestrator — Service Inventory

**File:** `infra/hosts/orchestrator/docker-compose.yml`

| Service              | Image                      | Host Port  | Notes                                            |
| -------------------- | -------------------------- | ---------- | ------------------------------------------------ |
| openclaw-gateway     | build (services/openclaw)  | 8001:18789 | profile: apps                                    |
| postgres-client      | postgres:16-alpine         | none       | profile: debug                                   |
| portainer-edge-agent | portainer/agent:2.27.9     | none       | no public port                                   |
| syncthing            | syncthing/syncthing:latest | host mode  | profile: sync; SEND_ONLY=false → should be false |

**Overlay files:**

- `docker-compose.hermes-gateway.yml` — hermes-gateway (8763 public!), hermes-metrics
- `docker-compose.clawteam.yml` — clawteam services
- `docker-compose.observability.yml` — observability stack
- `docker-compose.bitnet.yml` — BitNet inference
- `docker-compose.llxprt.yml` — LLxprt adapters
- `docker-compose.ai-gateway-faststart.yml` — AI gateway fast-start

**Hermes Gateway issue:** Image `docker.io/a2a-labs/hermes-gateway:latest` — verify image exists.
LiteLLM URL in hermes config is `http://127.0.0.1:4010/v1` — but LiteLLM is on oracle-vps, not orchestrator.
This will fail unless there's a local port forward or a separate LiteLLM on orchestrator.

---

## 6. Forgejo — Already Deployed

`infra/hosts/oracle-vps/docker-compose.forgejo.yml`:

- Image: `codeberg.org/forgejo/forgejo:10.0.1-rootless` ✓ pinned
- HTTP: `127.0.0.1:3101:3000`
- SSH: `127.0.0.1:2223:2222`
- Network: isolated `forgejo_net`
- Status: Compose defined; need live health check to confirm running

Gitea status: need to verify if gitea is still running alongside Forgejo.

---

## 7. Cloudflare Exposure Matrix — Current Routes

**Oracle tunnel (primary):**
app, api, hooks, twenty, crm, n8n, git, activepieces, grafana, prometheus, cadvisor,
openwebui, nexus-router, mcp-gateway, litellm, paperclip, clawteam, agent-vault,
infisical, letta, portainer-oracle, git-ssh

**Orchestrator tunnel (partially active, to be migrated):**
links, linkwarden, openclaw-gateway

**Cloudflare Pages (no tunnel):**
ratehunter.net, www.ratehunter.net, projectnyra.com, www.projectnyra.com, nexus.projectnyra.com

---

## 8. MCP Architecture

- `mcp-gateway.projectnyra.com` → oracle tunnel → `nexus:3000` (Grafbase Nexus 0.6.0)
- `nexus-router.projectnyra.com` → oracle tunnel → `nexus:3000` (same origin — legacy alias)
- Preferred internal: `http://oracle-vps.trex-fiordland.ts.net:3000/mcp`
- Nexus aggregates: 20+ MCP servers via supergateway bridges
- LiteLLM is at oracle-vps:4010 (loopback) → Cloudflare exposes via tunnel on port 4000 internal

---

## 9. Known Issues / Blockers

| ID    | Severity | Issue                                                                                         | Action                                        |
| ----- | -------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| B-001 | CRITICAL | Port 8000 collision: portainer-se vs supabase-kong                                            | Remap portainer port                          |
| B-002 | HIGH     | Syncthing on oracle has broken WSL2 mount path                                                | Remove/fix syncthing from oracle              |
| B-003 | HIGH     | Hermes-gateway LiteLLM URL points to 127.0.0.1:4010 on orchestrator, but LiteLLM is on oracle | Fix URL to oracle Tailscale IP                |
| B-004 | MEDIUM   | Orchestrator tunnel still active for 3 routes                                                 | Migrate to oracle tunnel then retire          |
| B-005 | MEDIUM   | Paperclip not in optional profile (should be)                                                 | Add `profiles: [optional-paperclip]`          |
| B-006 | MEDIUM   | `cloudflared:latest` image — not pinned                                                       | Pin to specific version                       |
| B-007 | MEDIUM   | `twenty:latest`, `openwebui:main` — not pinned                                                | Pin versions                                  |
| B-008 | LOW      | `hermes-gateway:latest` image — verify exists                                                 | Test pull                                     |
| B-009 | INFO     | Gitea removal status                                                                          | Verify Gitea is not running alongside Forgejo |
| B-010 | INFO     | No infra/service-registry.yaml exists                                                         | Create in Phase 1                             |

---

## 10. Orchestration Tools Summary

| Tool      | Role                                               | Access                     | Host                   |
| --------- | -------------------------------------------------- | -------------------------- | ---------------------- |
| Herdr     | CLI terminal multiplexer, operator cockpit         | Terminal/WSL2              | Operator machine       |
| ORCA      | GUI worktree-native IDE & review surface           | Desktop app                | Operator machine       |
| Omnigent  | Policy-aware dev orchestration harness             | Dev surface                | RTX 5090               |
| OpenClaw  | Worker-local assistant gateway                     | Nerve + local assistant UI | RTX 5090 worker        |
| OmniRoute | LLM provider router (private upstream for LiteLLM) | Internal only              | Oracle VPS             |
| Nerve     | Agent UI                                           | Web                        | RTX 5090/3090Ti        |
| ClawTeam  | Multi-agent coordination                           | API                        | Orchestrator (primary) |

---

## 11. What Exists in Repo but Needs Verification

- [ ] Deploy and verify the orchestrator ClawTeam primary; Oracle definition is legacy/profile-gated
- [ ] `docker-compose.memory.yml` — Letta+Mem0+FalkorDB+Qdrant status
- [ ] Worker compose files — GPU inference status
- [ ] Portainer agent connection status on all workers
- [ ] Syncthing peer configuration on workers
- [ ] Forgejo vs Gitea live status

---

_Next phase: Create service-registry.yaml from this inventory. Resolve B-001 (port collision) before any deployment._
