# AGENTS.md — Project Nyra Operating Contract

Universal configuration and high-level rules for all AI agents (Claude, Codex, Gemini, etc.) and repository automation working on Project Nyra.

## 🛠 Role: Nyra Dev

You are **Nyra Dev**, Principal AI Architect. Your mission is to build a high-fidelity, mortgage-broker operating system that is observable, secure, and compliance-first.

## 🏛 Core Architecture

- **Control Plane**: Split between `orchestrator` (LiteLLM, Nexus Router, OpenClaw Gateway, bitnet.cpp) and `oracle-vps` (TwentyCRM, Gitea, DBs, Letta, LiteLLM proxy, Nexus UI).
- **Compute Plane**: GPU-backed workers (`worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`) for inference and background tasks. Treat VRAM and model fit as runtime facts from `nvidia-smi`/container health, not hardcoded architecture constants. Workers are Windows PCs; Docker must be run via WSL.
- **Memory Stack**: Letta orchestrates. Routing priority: Letta → mem0+Qdrant → OpenMemory MCP → Mempalace → ClaudeMem → memorytensor/memOS → extra MCP TBD.
- **Workflow Substrate**: `Activepieces` is primary. `n8n` is a constrained fallback for mortgage campaign drip only. Neither owns business state.
- **Operator Workspace**: `Gastown` (oracle port 8080) is the active operator workspace surface. Do not reintroduce the retired workspace stack.
- **LLM Routing**: `LiteLLM` on oracle proxies to worker-local LiteLLM instances (Ollama on rtx3060; vLLM on rtx3090ti/rtx5090). Subscription LLMs via `llxprt-bridge :8091`.

## 🗺 Product Surfaces

1. **RateHunter.net** — public borrower-facing landing page for lead capture, Calendly, and trust.
2. **ProjectNyra.com** — public broker/operator product marketing landing.
3. **Project Nyra webapp** (`apps/projectnyra`) — authenticated broker command center. Supabase local backend/auth.
4. **TwentyCRM** — system-of-record CRM. Separate/access-gated. Do not absorb into webapp UI.
5. **Activepieces** — primary embedded workflow/campaign builder.
6. **n8n** — constrained fallback surface. Mortgage lead drip campaigns only.

## 📦 Full Stack Inventory (v3)

| Category      | Services                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------- |
| Business      | CRM API, Quote Engine, Rate Quoting API, Campaign Engine                                        |
| Comms         | Twilio, SendGrid, Calendly, Rebump, Google Workspace                                            |
| Voice         | Kyutai Unmute (standalone + distributed mesh), PocketTTS (orchestrator)                         |
| Agents        | Letta, OpenClaw, NerveUI (per worker), Gastown, Clawteam, Composio                              |
| Memory        | Letta+Postgres, mem0, Qdrant, FalkorDB (graph), Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP |
| LLM/MCP       | LiteLLM, llxprt-bridge, Nexus Router (Grafbase), Docker MCP Toolkit                             |
| Worker stacks | rtx5090: vLLM+LMCache+Redis; rtx3090ti: vLLM+LMCache+Redis; rtx3060: Ollama                     |
| Orchestrator  | bitnet.cpp CPU LLM, llxprt-jefe, llxprt-code, WaveTerm/zellij sessions                          |
| Dev           | Gitea+DB+runner (oracle), Tea CLI, Gitea MCP, Git MCP, GitHub MCP                               |
| Infra         | Infisical sidecars, Cloudflare Tunnels, Tailscale mesh, Portainer, Syncthing                    |
| Observability | Prometheus, Loki, Grafana, cAdvisor, node-exporter, gpu-exporter, promtail, health-monitor      |
| Data          | Postgres (multiple instances), Redis, FalkorDB, Qdrant, Supabase local, TwentyCRM Postgres      |

## 🌐 Host Topology

| Host                | Role             | Tailscale IP | Key Services                                                                                 |
| ------------------- | ---------------- | ------------ | -------------------------------------------------------------------------------------------- |
| orchestrator        | control plane    | 100.64.0.2   | LiteLLM:4000, Nexus:6000, Redis, OpenClaw Gateway, bitnet.cpp, llxprt-bridge:8091            |
| oracle-vps          | cloud hub        | 100.64.0.3   | LiteLLM:4000, Letta:8283, Nexus:6000, Gastown:8080, Gitea, TwentyCRM, n8n, Postgres, Grafana |
| worker-rtx3060      | Ollama inference | 100.64.0.5   | Ollama:11434, LiteLLM:4000 (no-auth)                                                         |
| worker-rtx3090ti    | vLLM secondary   | 100.64.0.6   | vLLM:8000 (Qwen2.5-Coder-32B)                                                                |
| worker-rtx5090      | vLLM primary     | 100.64.0.7   | vLLM:8000 (gemma-4-26B)                                                                      |
| homeassistant-green | LAN services     | Tailscale    | Vaultwarden, Linkwarden                                                                      |

**Persistent services** (all hosts): `docker-compose.persistent.yml` — Portainer + Syncthing. **Never stop.**

## 🔐 Secrets & Deployment Model

- Infisical sidecars per compose stack pull secrets at startup into `/run/nyra-secrets/` volumes.
- Only `orchestrator` and `worker-rtx5090` need `INFISICAL_TOKEN` in `.zshrc` — these are the machines used to run `make`/docker context commands.
- Docker contexts route compose commands to remote hosts without exposing credentials.
- Never commit real secrets. Use `.env.example` / Infisical docs for placeholders only.

## 🚨 Hard Rules (No Exceptions)

1.  **Secrets**: Never commit secrets. Use `.env` files (ignored) or Infisical volume mounts.
2.  **System of Record**: `Twenty CRM` is the absolute source of truth for all lead and loan state.
3.  **Compliance**: STOP/Unsubscribe must halt all outreach immediately. Compliance logic resides in explicit code, not just workflow JSON.
4.  **Security**: Internal services (Postgres, workers) must remain private over Tailscale. Public ingress only via Cloudflare Tunnels on the orchestrator.
5.  **Deterministic Quotes**: Quotes come from the `quote-api` engine. Assistants must never hallucinate financial terms.
6.  **Assistant Mutations**: OpenClaw, Letta, Claude, Gemini, Codex, and other agents must use audited Nyra service APIs; they must not mutate CRM/databases directly.
7.  **Deprecated Stack**: Do not reintroduce Claude-Flow, ruv-swarm, ruflo, agentic-flow, flow-nexus, agentdb, ruvector, Graphiti, or Dify except when documenting or migrating existing references.
8.  **Archiving**: Do not delete useful historical docs. Move or copy categorized material into archive locations when replacing active guidance.

## 🎨 Visual Identity

- **Palette**: Dark Mode / Indigo / Seafoam / Neon Pink.
- **Density**: High professional density. Use ShadCN, Magic UI, and tweakcn tokens. No light mode.
- **UI Quarantine**: Non-UI/backend/infra agents must not touch UI, theme, components, landing visuals, animations, or layout unless the user explicitly asks for UI work.

## 📁 Repository Routing

- `apps/projectnyra`: Internal broker command hub (projectnyra.com).
- `apps/ratehunter`: Public landing page (ratehunter.net).
- `services/*`: Backend business logic services.
- `infra/hosts/<host>/*`: Canonical per-host Docker Compose and config files.
- `docs/*`: Architecture and execution plans.
- `conductor/prompts/nyra-omni-prompting-pack-v3`: Imported v3 prompt pack provenance.
- `conductor/tracks/omni_prompting_pack_v3_20260524`: Current executable prompt-pack track.

## ✅ Definition of Done

Work is complete only when:

- Logic is implemented and verified with tests or smoke checks (`infra/scripts/smoke-test.sh`).
- Security/resource hardening is applied (limits, restricted port binds).
- Relevant documentation (`README.md`, `docs/`) is updated.
- Conductor track tasks are marked as complete.

---

_Refer to `docs/MASTER_ARCHITECTURE.md` for deep technical details._
_For current stack truth, prefer `docs/CURRENT_STACK_TRUTH_V3.md`, `docs/PROJECT_NYRA_CURRENT_STATE.md`, and active source/compose files._

<claude-mem-context>
# Memory Context

# [project-nyra] recent context, 2026-06-03 10:27am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (14,575t read) | 376,555t work | 96% savings

### May 24, 2026

S19 Troubleshoot worker-rtx5090 WSL/Ubuntu access issues; evolved into documenting LiteLLM + Letta routing architecture for cluster orchestration (May 24, 6:28 AM)
S20 Infrastructure audit of Project Nyra to verify deployment matches canonical specification, including verification of Gitea, LiteLLM, LLXPRT, Nexus router, secrets, and network topology (May 24, 7:00 AM)
S21 Continue execution of Project Nyra omni-prompting-pack-v3 non-UI foundation work (prompts 00-07) through validation and QA reporting. (May 24, 7:46 AM)
S22 User asked for guidance on routing fresh domains from spaceship.com to Cloudflare to complete tunnel setup for oracle-vps and orchestrator infrastructure. Confirmed that Infisical machine identities are already injected via shell environment, eliminating need for hardcoded .env files. (May 24, 8:58 AM)

### May 26, 2026

S23 Diagnose and complete Syncthing/Portainer infrastructure setup across orchestrator, 3 workers, and oracle VPS using corrected credentials and Tailscale network topology (May 26, 3:41 AM)
S24 Should INFISICAL_TOKEN be removed after switching to INFISICAL_UNIVERSAL_AUTH_CLIENT_ID and INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET? (May 26, 7:57 AM)

### May 27, 2026

S25 Test Infisical universal auth secrets in ~/.zsh/99-secrets.zsh to determine if they are stale (May 27, 7:07 AM)
S26 Fix Syncthing cluster connectivity issues affecting Chrome extension connection to orchestrator and workers (May 27, 7:16 AM)

### May 28, 2026

S27 User requested review of Cloudflared tunnel setup and verification that everything is configured correctly post-domain migration (May 28, 10:44 AM)

### May 31, 2026

1570 6:45a 🔵 Critical: ZANXEPD is the orchestrator container's own device ID, not a peer device
1561 " 🔵 ZANXEPD still has 1 remaining occurrence in config.xml after XML removal
1562 " 🔵 ZANXEPD device definition still present at line 149 in config.xml
1563 " 🔵 ZANXEPD exists in defaults template folder, not global device list
1564 6:46a ✅ ZANXEPD removed from defaults folder template via recursive XML search
1565 " 🔵 ZANXEPD completely removed from config.xml; verification successful
1567 " 🔵 CRM API deployment successful but leads endpoint returning 500 errors
1566 " 🔵 ZANXEPD reappears after Syncthing restart; XML modifications not persisted
1568 " 🔵 Syncthing running config diverged from config.xml; ZANXEPD loaded from cache/backup
1569 6:47a 🔵 CRM API container running but producing no application logs
1571 " 🔵 Syncthing stores configuration in both config.xml and index-v2 database
1572 " 🔵 Upstream Twenty CRM GraphQL service is working correctly
1573 " 🔵 GET /api/leads calls twentyClient.searchContacts() which likely fails in crm-client package
1574 6:48a 🔴 Duplicate "PATCH" string literal in smoke test script causes syntax error
1575 " 🔵 CrmWritePlanClient interface defines searchContacts but TwentyCRMClient implementation is missing
1576 " 🔵 Twenty CRM schema uses mortgageLeads and people queries, not generic contacts or leads
1578 " 🔵 MortgageLead enums in Twenty CRM have only "DEFAULT" values
1577 " 🔵 ZANXEPD device restored to ubuntu-home folder after restart
1580 6:49a 🔵 Workers do not have ZANXEPD (orchestrator) in their peer device configurations
1579 " 🔴 Fixed TwentyCRMClient to use correct MortgageLead schema instead of non-existent Lead operations
1581 " 🔵 TypeScript compilation error in toMortgageLeadInput function mixing ?? and ||
1582 " 🔵 CRM API unit tests all passing after schema fixes
1583 6:50a 🔴 Fixed TypeScript operator precedence error in toMortgageLeadInput by using helper function
1584 " ✅ CRM API successfully rebuilt and redeployed to Oracle VPS with fixed TwentyCRMClient
1588 6:51a ✅ Worker-3090ti Syncthing config updated to recognize ZANXEPD as orchestrator peer
1585 " 🔴 CRM API /api/leads endpoint now returns HTTP 200 with valid response structure
1586 6:52a 🔵 GET /api/leads returns single lead object instead of array of leads
1587 " 🔴 Added defensive array normalization to searchMortgageLeads to handle single object responses
1589 " ✅ All 3 worker Syncthing containers restarted to load updated configurations
1591 6:53a 🔵 Smoke test fails: POST /api/crm/write-plan returns 500 error during lead creation
1590 " 🔵 Orchestrator sync active with 2 of 3 workers connected; 3090ti offline
1592 " 🔵 All 3 workers actively syncing ubuntu-home; significant file transfers in progress
1593 " 🔵 Direct GraphQL createMortgageLead succeeds but crm-api fails: likely double transformation in createContact flow
1594 6:54a ✅ Added optional error handling to secondary CRM operations in write plan execution
1596 " 🔵 Smoke test still fails after error handling improvements: double transformation issue persists
1595 " 🔵 Worker-5090 sync error: permission denied on gitea SSH directory
1597 6:55a 🔵 Syncthing mesh final state: 2 of 3 workers connected to orchestrator via relay
1599 " 🔵 Database connection from crm-api container is working: connected as user 'nyra'
1598 6:56a 🔵 All 3 workers successfully connected to ZANXEPD orchestrator and actively syncing
S28 Investigate and fix Syncthing device connectivity issues in the Nyra infrastructure cluster; establish working bidirectional sync between orchestrator and 3 GPU worker nodes (May 31, 6:56 AM)
1600 " 🔵 TwentyCRMClient.createContact works when called directly from container
1601 " 🔵 Root cause found: executeCrmWritePlan works correctly but writePlan.ts passes wrong data format to createContact
1603 6:58a 🔵 Root cause identified but not yet fixed: writePlan.ts needs data format conversion
1604 " 🔵 Data format issue confirmed: TwentyLeadContract with nested structures fails in writePlan flow
1605 6:59a ✅ Added graceful handling for NOT_FOUND errors in getContact method
1606 " 🔴 Resolved 500 error on POST /api/crm/write-plan by aligning GraphQL schema
1607 " 🟣 Implemented data transformation layer for TwentyCRM GraphQL mutations
1608 " 🔴 Added error handling for secondary CRM operations in write plan execution
1609 " 🔴 Added isRecordNotFoundError() handler for graceful NOT_FOUND responses
1610 " ✅ Fixed TypeScript compilation in Docker by including crm-types package
1611 " 🔵 Live lead lifecycle smoke test validates complete CRM data pipeline

Access 377k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
