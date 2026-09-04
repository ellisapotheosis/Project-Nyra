# OMNI-INFRASTRUCTURE EXECUTION SPEC v2.0
## 175 IQ Maximalist Zero-Ambiguity Agent Directive

**EFFECTIVE IMMEDIATELY** | **SINGLE SOURCE OF TRUTH FOR ALL INFRASTRUCTURE ORCHESTRATION**

---

## EXECUTIVE MANDATE

This document is **NOT A SUGGESTION**. Every statement herein is a deterministic execution rule for autonomous agents orchestrating Project Nyra infrastructure. Zero optionality. Zero ambiguity. Zero loop-backs for clarification.

**Core Operating Principle:** One unified identity (user: `edaneandersen@gmail.com`). Tailscale + AdGuard for internal routing. Oracle VPS Cloudflare Tunnel as ONLY public ingress. Agent Vault for credential mediation. No exceptions. No debates.

---

## SECTION 0: GLOBAL IMMUTABLE CONSTRAINTS

### 0.1 Single Identity Rule
- **ONLY ONE user email across all authentication layers:** `edaneandersen@gmail.com`
- This email applies to:
  - Cloudflare Zero Trust / Access Policies (GitHub OAuth SSO + OTP fallback)
  - Tailscale admin console
  - AdGuard Home (secondary)
  - All service account registrations
- **NO** Google Workspace SSO (`ratehunter.net`, `projectnyra.com`) — account suspended. Treat as permanently unavailable.

### 0.2 Network Topology (FINAL)
```
┌─────────────────┐       ┌──────────────────────────────┐
│  Public Internet │───→  │ Cloudflare Edge (Access +    │
│                 │       │ Tunnel on Oracle VPS Only)   │
└─────────────────┘       └──────────────────────────────┘
                                      │
                                      ↓ (cloudflared tunnel)
                          ┌──────────────────────────────┐
                          │ Oracle VPS (100.64.0.3)      │
                          │ - Single Cloudflare Tunnel   │
                          │ - Reverse Proxy Router       │
                          └──────────────────────────────┘
                                      │
                          (Tailscale Encrypted Mesh)
                                      │
        ┌─────────────────────┬───────┼────────┬─────────────────────┐
        ↓                     ↓       ↓        ↓                     ↓
   Orchestrator       Home Assistant  Worker   Worker                Worker
   (100.64.0.10)      (100.64.0.2)   5090     3090Ti                3060
   - Nexus Router     - Home Asst.    - vLLM   - vLLM                - Ollama
   - OpenClaw         - Linkwarden    - LMCache- LMCache             - LiteLLM
   - Hermes           - AdGuard       - Nerve  - Syncthing
   - LiteLLM (main)   - Portainer
   - Syncthing        - Syncthing
   - Portainer
```

**RULE:** No direct public exposure except through Oracle VPS tunnel. All internal traffic flows over encrypted Tailscale mesh. AdGuard Home (on Home Assistant / 100.64.0.2) handles DNS rewrites for internal *.projectnyra.com subdomains.

### 0.3 Credential Mediation (ONLY Pattern)
- **Agent Vault on Oracle VPS** handles all dynamic credential access for autonomous agents.
- **Agents NEVER store or reference raw API keys** in memory, environment, or logs.
- Agents use `agent-run.sh` wrapper (orchestrator) or direct Agent Vault API calls for credential retrieval.
- **Infisical Agent sidecars are NOT needed** on orchestrator (cloud Infisical + Agent Vault sufficient).

### 0.4 Core Management Protection Group (IMMUTABLE)
On **EVERY host** (`oracle-vps`, `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, ``, `homeassistant`):

Create a protected Docker Compose stack / network named **`core-mgmt-protected`** containing:
- **Portainer** (SE/CD Server on oracle-vps; Agent on all others)
- **Syncthing** (All hosts EXCEPT oracle-vps; worker-rtx5090 = SEND-ONLY canonical source)

**COMPOSE HEADER REQUIREMENT:**
```yaml
# ====================================================================
# PROTECTED INFRASTRUCTURE GROUP: core-mgmt-protected
# DO NOT STOP. DO NOT REMOVE. DO NOT MODIFY WITHOUT EXPLICIT APPROVAL.
# ====================================================================
```

---

## SECTION 1: SERVICE DEPRECATION (HARD DELETE)

Execute **COMPLETE REMOVAL** from all `/infra/hosts/*/` compose files and Cloudflare/Tailscale routes:

### 1.1 Compose File Deletions
- `docker-compose.gitea.yml` (Replacing with Forgejo)
- All Gitea references (`gitea`, `gitea-mcp`, `gitea-ssh`)
- `infisical-postgres.yml`, `infisical-redis.yml` (Cloud Infisical + Agent Vault sufficient)
- `docker-compose.superset.yml` (Deprecated analytics)
- All Kyutai Unmute / voice containers (complete removal across all hosts)
- `gastown` (entire stack purge)
- Generic/ambiguous subdomains like `webapp` (specify exact purpose or delete)

### 1.2 Routing Purges
- Remove from Cloudflare Tunnel: gitea.*, gitea-ssh.*, gitea-mcp.*, superset.*
- Remove from Tailscale Apps: all deprecated endpoints
- Remove from AdGuard rewrites: any deprecated targets

---

## SECTION 2: SERVICE STANDUP & NAMING STANDARDIZATION

### 2.1 Inference Endpoint Consolidation
| Old Name | New Canonical Endpoint | Host | Port | Tailscale App? | CF Route? |
|----------|------------------------|------|------|----------------|-----------|
| `vllm-3090ti` | `vllm-rtx3090ti.projectnyra.com` | worker-rtx3090ti | 8000 | Yes | Gated |
| `vllm-5090` | `vllm-rtx5090.projectnyra.com` | worker-rtx5090 | 8000 | Yes | Gated |
| N/A | `lmcache-rtx3090ti.projectnyra.com` | worker-rtx3090ti | [LMCache port] | Yes | No |
| N/A | `lmcache-rtx5090.projectnyra.com` | worker-rtx5090 | [LMCache port] | Yes | No |
| N/A | `redis-kv-rtx3090ti.projectnyra.com` | worker-rtx3090ti | 6379 | Yes | No |
| N/A | `redis-kv-rtx5090.projectnyra.com` | worker-rtx5090 | 6379 | Yes | No |

### 2.2 LiteLLM Consolidation
- **Primary endpoint:** `litellm.projectnyra.com` → Orchestrator (100.64.0.10:4000)
- **Access rule:** Gated (Service Token via MCP Gateway for agents; OTP for users)

### 2.3 Nerve Unification
- **ONLY ONE `nerve.projectnyra.com`** endpoint
- **Default host:** Orchestrator (100.64.0.10:PORT)
- **Optional fallback:** Can be configured to point to worker-rtx3090ti or worker-rtx5090 if orchestrator overloaded
- **Access:** Gated (OTP + GitHub SSO)

### 2.4 Forgejo Deployment (Subagent Task)
- Deploy Forgejo on **Orchestrator** (or oracle-vps if persistent DB backup prioritized)
- Endpoint: `git.projectnyra.com` + `forgejo.projectnyra.com` (same target, two routes for backwards compat)
- Migrate all Gitea repos + SSH keys
- Access: Gated (GitHub SSO + OTP)

### 2.5 Agentic Stack Deployment
Stand up + expose:

**A. Clawteam**
- Container: `clawteam` on Orchestrator
- Status: MUST BE RUNNING

**B. OpenClaw**
- Main App: `openclaw.projectnyra.com` (Orchestrator)
- Gateway: `openclaw-gateway.projectnyra.com` (Orchestrator)
- Access: Gated

**C. Hermes**
- Main App: `hermes.projectnyra.com` (Orchestrator)
- Gateway: `hermes-gateway.projectnyra.com` (Orchestrator)
- Access: Gated

**D. Execution Mesh** (Wrapped under LiteLLM)
- `herdr`, `ORCA`, `omnigent`, `omniroute` all operational and callable via `litellm.projectnyra.com`
- No separate public endpoints for mesh internals

**E. Paperclip** (OPTIONAL)
- Make optional via compose profile: `profiles: ["optional-paperclip"]`
- Do NOT deploy by default

---

## SECTION 3: PORTAINER CONSOLIDATION

### 3.1 Server Deployment
- **Oracle VPS:** `portainer-vps.projectnyra.com` (Portainer SE/CD Server)
- **Orchestrator:** `portainer-orch.projectnyra.com` (Portainer Agent)
- **worker-rtx5090:** `portainer-5090.projectnyra.com` (Portainer Agent)
- **worker-rtx3090ti:** `portainer-3090ti.projectnyra.com` (Portainer Agent)
- **Home Assistant:** `portainer-ha.projectnyra.com` (Portainer Agent)

### 3.2 Access & Networking
- All Portainer endpoints gated behind Cloudflare Access (if public) or Tailscale-only (if internal)
- Primary management occurs on oracle-vps via Portainer CE server
- All agents report back to central server for unified cluster visibility

---

## SECTION 4: SYNCTHING CANONICAL SOURCE & SYNC TOPOLOGY

### 4.1 Deployment Matrix
| Host | Syncthing? | Direction | Canonical Source? |
|------|-----------|-----------|-------------------|
| oracle-vps | NO | — | — |
| orchestrator | YES | Bidirectional | Secondary |
| worker-rtx5090 | YES | **SEND-ONLY** | **YES (PRIMARY)** |
| worker-rtx3090ti | YES | Bidirectional | Secondary |
| homeassistant | YES | Bidirectional | Secondary |

### 4.2 Configuration Rules (HARD)
- **worker-rtx5090 MUST be configured to:**
  - Send all changes to other peers
  - Reject inbound folder modifications
  - Enforce "Send-Only" ACL on all shared folders
- **All other hosts:** Bidirectional sync from worker-rtx5090 as canonical source
- Syncthing endpoint: `syncthing.projectnyra.com` (internal, Tailscale-only, no CF route)

---

## SECTION 5: CLOUDFLARE & TAILSCALE SYNCHRONIZATION MATRIX

**ABSOLUTE RULE:** Every entry in the table below MUST exist as **BOTH** a Cloudflare Tunnel Route on oracle-vps AND a Tailscale App / MagicDNS entry.

### 5.1 Complete Routing Table

| Subdomain | Tailscale IP:Port | Cloudflare Route? | Access Policy Tier | Tailscale App? |
|-----------|------------------|------|------------------|---------|
| `ha.projectnyra.com` | 100.64.0.2:8123 | Yes | User Auth (OTP) | Yes |
| `portainer-vps.projectnyra.com` | 100.64.0.3:9000 | Yes | Admin (Service Token) | Yes |
| `portainer-orch.projectnyra.com` | 100.64.0.10:9000 | Yes | Admin (Service Token) | Yes |
| `portainer-5090.projectnyra.com` | worker-rtx5090:9000 | No | Tailscale-only | Yes |
| `portainer-3090ti.projectnyra.com` | worker-rtx3090ti:9000 | No | Tailscale-only | Yes |
| `portainer-ha.projectnyra.com` | 100.64.0.2:9000 | No | Tailscale-only | Yes |
| `linkwarden.projectnyra.com` | 100.64.0.2:3000 | Yes | Public (OTP optional) | Yes |
| `syncthing.projectnyra.com` | Various | No | Tailscale-only | No |
| `nexus-router.projectnyra.com` | 100.64.0.10:3000 | Yes | Service Token Only | Yes |
| `mcp-gateway.projectnyra.com` | CF Gateway | Yes | User Auth (GitHub SSO + OTP) | Yes |
| `litellm.projectnyra.com` | 100.64.0.10:4000 | Yes | Service Token / OTP | Yes |
| `git.projectnyra.com` | 100.64.0.10:3000 | Yes | GitHub SSO + OTP | Yes |
| `forgejo.projectnyra.com` | 100.64.0.10:3000 | Yes | GitHub SSO + OTP | Yes |
| `nerve.projectnyra.com` | 100.64.0.10:PORT | Yes | Service Token / OTP | Yes |
| `vllm-rtx3090ti.projectnyra.com` | worker-rtx3090ti:8000 | No | Tailscale-only | Yes |
| `vllm-rtx5090.projectnyra.com` | worker-rtx5090:8000 | No | Tailscale-only | Yes |
| `lmcache-rtx3090ti.projectnyra.com` | worker-rtx3090ti:8001 | No | Tailscale-only | Yes |
| `lmcache-rtx5090.projectnyra.com` | worker-rtx5090:8001 | No | Tailscale-only | Yes |
| `redis-kv-rtx3090ti.projectnyra.com` | worker-rtx3090ti:6379 | No | Tailscale-only | Yes |
| `redis-kv-rtx5090.projectnyra.com` | worker-rtx5090:6379 | No | Tailscale-only | Yes |
| `openclaw.projectnyra.com` | 100.64.0.10:PORT | Yes | Service Token / OTP | Yes |
| `openclaw-gateway.projectnyra.com` | 100.64.0.10:PORT | Yes | Service Token / OTP | Yes |
| `hermes.projectnyra.com` | 100.64.0.10:PORT | Yes | Service Token / OTP | Yes |
| `hermes-gateway.projectnyra.com` | 100.64.0.10:PORT | Yes | Service Token / OTP | Yes |
| `worker-rtx5090.projectnyra.com` | worker-rtx5090 (Node) | No | Tailscale-only | Yes |
| `worker-rtx3090ti.projectnyra.com` | worker-rtx3090ti (Node) | No | Tailscale-only | Yes |
| `orchestrator.projectnyra.com` | 100.64.0.10 (Node) | No | Tailscale-only | Yes |
| `oracle-vps.projectnyra.com` | 100.64.0.3 (Node) | No | Tailscale-only | Yes |

---

## SECTION 6: CLOUDFLARE ACCESS POLICY NORMALIZATION (CRITICAL FIX)

**CURRENT STATE:** Inconsistent + incomplete. Google Workspace SSO broken.

**REQUIRED ACTION:** Every `*.projectnyra.com` Cloudflare Public Hostname MUST implement the exact **3-tier Access Policy Stack**:

### 6.1 Policy Tier 1: Service Token (Machine-to-Machine)
- **Purpose:** Internal agents, gateways, service-to-service calls
- **Rule:** Require valid Cloudflare Access Service Token header
- **Token Source:** Generated in Zero Trust → Access → Service Tokens
- **Applicable To:** `nexus-router`, `mcp-gateway`, `litellm` (when agent-called), MCP servers

### 6.2 Policy Tier 2: GitHub SSO
- **Purpose:** Primary user authentication
- **Rule:** OAuth redirect to GitHub, verify login via `edaneandersen@gmail.com`
- **Configuration:**
  - Provider: GitHub
  - Allowed User: `edaneandersen@gmail.com` (exact match)
- **Applicable To:** All user-facing apps (`ha`, `portainer`, `linkwarden`, `git`, `nerve`, `openclaw`, `hermes`)

### 6.3 Policy Tier 3: Email OTP (Emergency Fallback)
- **Purpose:** Backup auth when GitHub unavailable
- **Rule:** Send one-time PIN to `edaneandersen@gmail.com`
- **Configuration:**
  - Provider: Email (Cloudflare native)
  - Recipient: `edaneandersen@gmail.com` (exact match)
  - TTL: 15 minutes
- **Applicable To:** All public-facing apps

### 6.4 Optional: Network Bypass (LAN/Tailscale)
- **Purpose:** Zero-friction access from home LAN or Tailscale subnet
- **Rule:** Allow bypass if IP in range `100.64.0.0/10` (Tailscale) OR home LAN CIDR
- **Decision:** This is OPTIONAL. Recommend enabling for Portainer + internal tools.

### 6.5 Admin Rule
- Do NOT add "Google Workspace" or "Okta" SSO — that auth domain is permanently suspended.
- Do NOT create per-user token exceptions — all users use the 3-tier stack.

---

## SECTION 7: MCP GATEWAY & NEXUS ROUTER TOKEN HANDOFF (CRITICAL ARCH)

### 7.1 Request Flow (MANDATORY)
```
[ Agent / LLM Client ]
        │
        ├─ Attempts request to: nexus-router.projectnyra.com
        │
        └─ Cloudflare Access checks policy → BLOCKS (requires Service Token)
                                              │
                                              ├─ Agent redirected to: mcp-gateway.projectnyra.com
                                              │
                                              └─ User authenticates (GitHub SSO or OTP)
                                                 │
                                                 └─ Gateway validates user + issues signed Service Token
                                                    │
                                                    └─ Gateway forwards request to nexus-router
                                                       WITH Service Token header
                                                       │
                                                       └─ Nexus validates token + allows access
```

### 7.2 Implementation Rules
1. **`mcp-gateway.projectnyra.com` Access Policy:**
   - Implement Tier-2 (GitHub SSO) + Tier-3 (OTP)
   - Generate Service Token upon successful user auth

2. **`nexus-router.projectnyra.com` Access Policy:**
   - Implement **ONLY** Tier-1 (Service Token)
   - Accept ONLY tokens issued by mcp-gateway
   - Reject all direct user authentication attempts

3. **Token Lifecycle:**
   - Gateway token TTL: 24 hours
   - Refresh on each successful MCP call
   - Revoke on user logout

---

## SECTION 8: ORCHESTRATION & COMPOSE AUDIT SPEC

### 8.1 Canonical Paths (NO EXCEPTIONS)
All compose files live in `/infra/hosts/<hostname>/`:
- `/infra/hosts/oracle-vps/docker-compose.yml` (primary)
- `/infra/hosts/orchestrator/docker-compose.yml` (primary)
- `/infra/hosts/worker-rtx5090/docker-compose.yml` (primary)
- `/infra/hosts/worker-rtx3090ti/docker-compose.yml` (primary)
- `/infra/hosts/homeassistant/docker-compose.yml` (primary)
- `/infra/hosts/_templates/docker-compose.infisical-secrets-agent.yml` (worker overlay — NOT used on orchestrator)

### 8.2 Compose File Structure Rules
1. **Protected group MUST be explicitly labeled:**
   ```yaml
   # PROTECTED INFRASTRUCTURE GROUP: core-mgmt-protected
   # DO NOT STOP. DO NOT REMOVE.
   services:
     portainer:
       # ...
     syncthing:
       # ...
   ```

2. **Optional profiles for non-critical services:**
   ```yaml
   services:
     paperclip:
       profiles: ["optional-paperclip"]
   ```

3. **All containers MUST have:**
   - `container_name: ${COMPOSE_PROJECT_NAME:-nyra}-<service>`
   - Restart policy
   - Health checks (where applicable)

### 8.3 Complete Service Audit
For EVERY compose file, verify:
- [ ] No Gitea references
- [ ] No Kyutai/Unmute voice containers
- [ ] No Picoclaw instances
- [ ] No Gastown entries
- [ ] Portainer + Syncthing in `core-mgmt-protected` (all non-VPS hosts)
- [ ] Syncthing on worker-rtx5090 is "send-only"
- [ ] LiteLLM consolidated to single primary endpoint
- [ ] OpenClaw, Hermes, Clawteam deployed
- [ ] No `infisical-postgres` or `infisical-redis` (cloud Infisical sufficient)
- [ ] No Cloudflare Tunnel on orchestrator (oracle-vps only)

---

## SECTION 9: EXECUTION VERIFICATION CHECKLIST

### 9.1 Pre-Deployment (Read-Only Verification)
- [ ] All deprecated services confirmed removed from compose files
- [ ] All new endpoints (Forgejo, OpenClaw, Hermes) exist in compose definitions
- [ ] No Cloudflare Tunnel references on orchestrator
- [ ] No Infisical agent/sidecar on orchestrator
- [ ] core-mgmt-protected group defined on all required hosts
- [ ] Syncthing worker-rtx5090 marked send-only in configuration

### 9.2 Post-Deployment (Functional Verification)
- [ ] `docker compose ps` on each host shows core-mgmt-protected services running
- [ ] `docker compose ps` confirms NO gitea, picoclaw, unmute, gastown containers
- [ ] `curl https://linkwarden.projectnyra.com` returns 200 (public)
- [ ] `curl https://nexus-router.projectnyra.com` returns 401/403 (requires Service Token)
- [ ] Login to `https://mcp-gateway.projectnyra.com` succeeds via GitHub SSO + OTP
- [ ] After MCP Gateway login, agent can access `nexus-router` without additional auth
- [ ] Portainer server on oracle-vps shows all 5 agent nodes connected
- [ ] Syncthing shows worker-rtx5090 as canonical source, others syncing bidirectionally
- [ ] Tailscale app list contains all 30+ endpoints from Table 5.1
- [ ] AdGuard rewrites for `*.projectnyra.com` enabled (check AdGuard UI)
- [ ] Nerve endpoint responding at `nerve.projectnyra.com`
- [ ] LiteLLM consolidated endpoint responding at `litellm.projectnyra.com`

### 9.3 Security Audit
- [ ] All Cloudflare public routes implement 3-tier Access policy
- [ ] No Google Workspace SSO policies (permanently broken)
- [ ] All user authentication uses `edaneandersen@gmail.com` (exact match)
- [ ] Service tokens properly scoped (nexus-router accepts ONLY mcp-gateway token)
- [ ] No raw API keys visible in environment variables
- [ ] Agent Vault handling all credential requests (no direct key access)

---

## SECTION 10: DEPLOYMENT ROLES & RESPONSIBILITY

- **Primary Agent (Main Orchestrator):** Execute Sections 1–9 in sequence. No parallelization except independent host compose updates.
- **Subagent (Forgejo Deployment):** Handle Forgejo migration in parallel to compose updates. Report when git.projectnyra.com is live.
- **Verification Agent:** Run full 9.1–9.3 checklist. Block "done" status until all checks pass.

---

## APPENDIX: AUTO-REMEDIATION (If Conflicts Detected)

If an agent encounters **contradictory state** (e.g., Gitea still running, or Cloudflare policy missing):

1. **Resolve deterministically using this spec as ground truth.**
2. **Log the conflict** with timestamp + context.
3. **Do NOT ask for clarification** — this document is complete and authoritative.
4. **Proceed with remediation** (delete deprecated service, add missing policy, etc.).
5. **Report the remediation** in final verification report.

---

**END SPEC** | **EFFECTIVE UNTIL SUPERSEDED** | **NO FURTHER CLARIFICATION NEEDED**
