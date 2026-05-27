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

# [project-nyra] recent context, 2026-05-27 5:46am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (17,288t read) | 345,948t work | 95% savings

### May 23, 2026

S14 Configure multi-host Syncthing mesh with worker-rtx5090 as source of truth; decommission oracle; clarify sync behavior and whitelist strategy; provide Codex prompt for browser-based UI completion (May 23, 6:02 AM)
S15 SSH into worker-rtx5090 Windows PC and diagnose/fix WSL access errors (ubuntu not accessible, invalid address, permission issues) (May 23, 9:19 AM)

### May 24, 2026

S16 Investigate and fix Hyper-V/WSL/Docker Desktop failure on worker-rtx5090 (AlienApoth51): wsl commands timing out with "CommandTimedOut" error, Docker Desktop unable to restart, system unresponsive. (May 24, 3:20 AM)
S17 Disable fgfast (fast startup) on all PCs via SSH, apply hardening recommendations, and set up autonomous power management for a 4-node GPU cluster via WoL magic packets controlled by the orchestrator's bitnet.cpp LLM (May 24, 3:50 AM)
S18 Troubleshoot WSL access errors on worker-rtx5090, leading to comprehensive memory orchestration system upgrade and Nyra agent deployment (May 24, 4:44 AM)
S19 Troubleshoot worker-rtx5090 WSL/Ubuntu access issues; evolved into documenting LiteLLM + Letta routing architecture for cluster orchestration (May 24, 6:28 AM)
S20 Infrastructure audit of Project Nyra to verify deployment matches canonical specification, including verification of Gitea, LiteLLM, LLXPRT, Nexus router, secrets, and network topology (May 24, 7:00 AM)
S21 Continue execution of Project Nyra omni-prompting-pack-v3 non-UI foundation work (prompts 00-07) through validation and QA reporting. (May 24, 7:46 AM)
S22 User asked for guidance on routing fresh domains from spaceship.com to Cloudflare to complete tunnel setup for oracle-vps and orchestrator infrastructure. Confirmed that Infisical machine identities are already injected via shell environment, eliminating need for hardcoded .env files. (May 24, 8:58 AM)

### May 26, 2026

1190 5:06a ⚖️ UI/theme/design work explicitly quarantined as separate concern; three themes configured (apotheosis, mint-midnight, mint-midnight-glow)
1191 5:09a 🟣 CRM operations queue system for compliance and task prioritization
1192 5:10a ✅ Integrated CRM operations builder into all workspace data sources
1193 " 🟣 Broker action queue and CRM control gates UI components
1194 " 🟣 Test suite for CRM operations queue system
1196 5:11a 🔵 TypeScript compilation error: operations property missing from WorkspaceData type
1197 " 🔵 Stale duplicate crm-data.ts file blocking TypeScript compilation
1198 " 🔴 Updated stale crm-data.ts file with CRM operations feature
1200 5:12a 🔵 Oracle memory-stack smoke tests passing on 2026-05-26
1201 " 🟣 Reactivated /api/crm route to serve CRM workspace data
1202 " ✅ Infrastructure refactoring: Paperclip → Gastown, OpenLIT observability, PicoClaws addition
1204 " 🔴 Vector dimension mismatch in mem0-Qdrant integration during memory stack smoke test
1211 5:14a 🔵 CRM operations fully integrated into existing CRM, campaign, and quote infrastructure
1212 " ✅ Memory stack successfully rebuilt and redeployed after vector dimension fix
1213 " 🔵 Broker command deck dashboard fully integrated with CRM operations
1214 5:15a 🔵 Memory stack partial operational status: ADD succeeds but SEARCH still fails on mem0
1215 5:16a 🔵 mem0 search endpoint API compatibility bug: user_id parameter placement
1216 " 🔵 mem0 library API asymmetry: search/get_all require filters dict, add/delete_all accept top-level params
1217 " 🔴 mem0 wrapper API compatibility layer fixed for v2.0.2 filters requirement
1218 5:17a 🔵 Memory stack smoke tests now passing: both ADD and SEARCH endpoints operational
1219 5:25a ✅ Consolidated executable work inventory and demoted superseded backlog documentation
1220 5:26a ✅ Recorded validation evidence for backlog consolidation completion in CONDUCTOR_TASKS.md
1221 " ✅ Consolidated external secret inventory and removed stale infrastructure guidance
1222 5:28a ✅ Updated current blockers with completion status of Conductor reconciliation and memory-stack validation
1223 " ✅ Session plan transitioned to inventory and classify remaining unchecked task markers
1224 " 🔵 Inventoried task, prompt, status, and handoff files across project
1225 7:46a 🔵 Dual Syncthing Instances on Orchestrator Causing Configuration Ambiguity
1226 " 🔵 Worker-rtx5090 Disconnected From Syncthing Mesh
1227 " 🔵 Portainer Accessibility Issues Across Network Segments
1228 " ✅ User Provided Tailscale and Credential Configuration Specifics
1229 7:47a 🔵 Persistent Orchestrator Syncthing Container Confirmed Running
1230 " 🔵 Two Native Syncthing Processes Running Outside Docker
1231 " 🔵 Persistent Docker Container Has Wrong Device Identity
1232 7:48a 🔵 Persistent Container Runtime Identity Corrected Despite Mismatched Config
1233 " 🔵 Only One Native Syncthing Process Actively Listening; Other Process Dormant
1234 7:49a 🔵 PID 2158 is Orphaned/Headless Syncthing Process Without Configuration
1235 7:50a 🔵 Port 8384 Serves MiniApotheosis, Not Real Orchestrator ZANXEPD
1236 " 🔵 Native Syncthing Process Uses Same Config as Persistent Docker Container
1238 7:51a ✅ Added Three Worker Devices to MiniApotheosis Configuration
1237 7:52a 🔵 MiniApotheosis Instance Completely Unconfigured—No Devices or Folders
1239 7:53a ✅ Worker-rtx3060 Reconfigured from ZANXEPD to OBN2HMP Orchestrator
1240 7:54a 🔵 Docker Context for Worker-rtx5090 Unreachable
1241 " 🔵 Docker Context for Worker-rtx5090 Configured via SSH but SSH Connection Failing
1242 " ✅ Created ubuntu-home Folder on MiniApotheosis Orchestrator
1243 " ✅ Updated ubuntu-home Folder on Worker-rtx3060 to Include OBN2HMP
1244 7:55a ✅ Orchestrator Device Renamed and GUI Credentials Set
1245 " 🔵 Worker-rtx5090 Unreachable via SSH; Device Reconfiguration Failed
1246 7:56a ✅ Set GUI Credentials on Worker-rtx3060
1247 " 🔵 Orchestrator Final Configuration State Verified
1248 " 🔵 Worker-rtx3060 Final Configuration State Verified
S23 Diagnose and complete Syncthing/Portainer infrastructure setup across orchestrator, 3 workers, and oracle VPS using corrected credentials and Tailscale network topology (May 26, 7:57 AM)
**Investigated**: - Dual Syncthing instances on orchestrator: MiniApotheosis (OBN2HMP, unconfigured) vs ZANXEPD (real, relay-connected) - Device configuration state: config.xml mismatches, device ID discovery across all nodes - Network accessibility: browser reaches only MiniApotheosis; workers connect to ZANXEPD via oracle relay - Docker context connectivity: worker-rtx3060 accessible via Docker context; worker-rtx5090 SSH available but Docker daemon down - Port conflicts between native Syncthing processes (PID 2205) and persistent Docker container - Worker topology and device registration state

**Learned**: - Orchestrator has three Syncthing instances: Docker persistent container (ZANXEPD) + 2 native processes (PID 2158 orphaned, PID 2205 active MiniApotheosis) - MiniApotheosis (OBN2HMP) is fresh/isolated, browser-accessible at localhost:8384; serves as new topology anchor - ZANXEPD is real orchestrator but only reachable via relay at oracle VPS (216.146.25.26:22067) - Earlier configuration attempts applied to wrong instance (MiniApotheosis instead of ZANXEPD) - Device identity corruption: config.xml had worker-rtx5090 ID but runtime reports ZANXEPD (environment override in effect) - Worker-rtx3060 successfully transitioned from ZANXEPD to OBN2HMP topology - Worker paths differ: orchestrator /var/syncthing/data/home vs workers /var/syncthing

**Completed**: - Configured orchestrator (OBN2HMP): added 3 worker devices (5QAPMTU, ZE3VRPG, UDR6IHT), created ubuntu-home folder with all 4 devices (paused), set GUI user/password (ellisapotheosis/1th7aa6ch8oA1!), renamed device to "orchestrator" - Reconfigured worker-rtx3060: deleted ZANXEPD, added OBN2HMP as orchestrator, updated ubuntu-home folder devices, set GUI credentials - Verified worker-rtx3060 final state: all devices registered, folder configured, ready to sync (paused) - Diagnosed worker-rtx5090 unreachability: Docker context SSH alias exists (5090-wsl) but Docker daemon not running, attempted reconfiguration failed (HTTP 000) - Created comprehensive browser prompt with all device IDs, API keys, credentials, Tailscale addresses, and step-by-step tasks

**Next Steps**: Task A (active): Restart Docker daemon on worker-rtx5090 (via Docker Desktop or WSL systemctl/service)
Task B: Configure worker-rtx5090 Syncthing UI (remove ZANXEPD, add OBN2HMP, verify ubuntu-home folder is active/not-paused as source of truth)
Task C: Begin initial sync from worker-rtx5090 → orchestrator → worker-rtx3060 (in sequence, with paused states managed per step)
Task D: Configure worker-rtx3090ti when it comes online (currently offline)
Task E: Set up Portainer CE on oracle VPS with edge agents for all 4 hosts

Access 346k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>
