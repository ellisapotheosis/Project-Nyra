# AGENTS.md

Universal configuration for AI agents working on Project Nyra.

This file is the global contract for Claude Code, Codex CLI, Gemini CLI, Cursor, Copilot, Aider, Serena-aware agents, and any repo automation.

## Nyra Dev system prompt

Use this as the baseline system prompt for any coding/build agent:

```text
You are Nyra Dev, an expert DevEx Engineer and Principal AI Architect for Project Nyra.

Mission:
- Build and maintain an AI-powered mortgage automation platform.
- Treat compliance as first-class domain logic.
- Keep the control plane stable and workers replaceable.
- Prefer small, verifiable, production-quality changes.

Hard rules:
- Never commit secrets.
- Never expose worker inference endpoints publicly.
- Never make n8n the system-of-record or the business brain.
- Never let the assistant directly mutate CRM or databases.
- Never reintroduce RuVector, Graphiti, Letta, openmemory, or Activepieces into the current architecture.
- If a step requires owner login/MFA/dashboard action, document it in docs/OWNER_MANUAL_ACTIONS.md and continue.

If uncertain:
- Use conservative defaults.
- Mark assumptions explicitly.
- Add validation commands, tests, and smoke checks.
```

## Current target architecture

### Control plane
The control plane is split between the local **orchestrator** (MinisForum) and the **oracle-vps** (Cloud).

#### Orchestrator (LAN)
- Nexus Router
- LiteLLM
- Prometheus / Loki / Grafana (LAN)
- Portainer Server
- n8n (Internal)
- OpenClaw Gateway / Studio
- Pocket TTS
- Syncthing (Cluster Sync)

#### Oracle-VPS (Cloud)
- Twenty CRM (System of Record)
- Gitea
- Activepieces
- Qdrant / FalkorDB
- Open WebUI
- Quote API
- Campaign Engine
- Mem0
- Cloudflared Tunnel (Public Ingress)

### Data Synchronization
- **Syncthing** is used across all 4 local nodes (orchestrator, rtx5090, rtx3090ti, rtx3060) to sync the `~/` folder.
- All Syncthing containers mount `/home/ellisapotheosis` to `/var/syncthing/data/home`.
- **Note**: Syncthing is NOT present on oracle-vps.

### Memory & Orchestration Endpoint
- **Nexus Router** (on orchestrator:6000) is the **singular endpoint** for all agents (Claude Code, Gemini CLI, OpenClaw, etc.).
- It aggregates LLM routing and all MCP tools, including the memory stack on oracle-vps.
- **Memory Stack (Oracle VPS + Local)**: mem0 + FalkorDB, OpenMemory MCP, Letta (Memory Manager), memOS, Mempalace, and claudemem.
- All agent memory interactions should go through Nexus to ensure cross-agent context sharing.

### Compute plane
Workers are GPU appliances:

- `worker-rtx5090` → primary vLLM, OpenClaw + Nerve UI
- `worker-rtx3090ti` → secondary vLLM, OpenClaw + Hermes UI
- `worker-rtx3060` → Ollama, ingestion helpers, summarization, extraction, smaller local tasks

### Memory
- Archon OS is the workflow/context/project memory manager.
- Mem0 + FalkorDB is used only for selected assistant/runtime memory.
- Do not add RuVector / Graphiti / Letta / openmemory back into the stack.

### Workflow engine
- n8n is allowed as internal automation glue.
- n8n is not the customer-facing product UI.
- n8n is not the business brain.

### Assistant surfaces
- OpenClaw Gateway + OpenClaw Studio are the primary assistant runtime/dashboard.
- Open WebUI is internal-only model/tool workbench.
- apps/webapp should use the OpenClaw chat experience for the assistant surface.

## Product invariants

- Twenty CRM is the system of record.
- Compliance is explicit code with tests.
- STOP / unsubscribe / reply pauses must be enforced immediately across channels.
- The quote engine owns quote generation. The assistant must not hallucinate rates or costs.
- All communications are logged with metadata and tied back to CRM records.

## Stack preferences

### Languages
- Primary: **TypeScript**
- Secondary: **Python** only where it clearly helps (batch utilities, ingestion, LLM helpers)
- Shell: Bash + PowerShell where appropriate

### Frameworks
- Next.js App Router for apps
- Node.js 20+ for backend services
- Tailwind + shadcn/ui + Magic UI for interfaces
- Zod for validation
- Structured JSON logging
- Docker Compose per node

### UI conventions
- Use a shared tweakcn-driven design token palette
- Keep a consistent shadcn + Magic UI system across admin, landing, and webapp
- Avoid random inline colors and one-off styling decisions
- Keep broker-facing UI professional, modern, and fast

## Directory routing

Agents must place work in the correct location.

### Repo roots
- `apps/admin` → internal operator/admin UI
- `apps/webapp` → broker/customer web application
- `apps/landing` → landing and lead capture
- `services/*` → backend business services
- `packages/*` → shared libraries, types, domain modules
- `workflows/n8n/*` → n8n workflow JSONs
- `deploy/*` → per-node deployment files
- `ops/*` → scripts, tmux, profiles, operational helpers
- `docs/*` → architecture, execution plans, manual steps

### Services responsibility map
- `services/lead-ingestion` → normalize + dedupe inbound leads
- `services/campaign-service` → campaign scheduling and state transitions
- `services/compliance-service` → consent, suppression, STOP/unsubscribe, quiet hours
- `services/communication-service` → provider send/receive logging
- `services/quote-service` → quote generation and PDFs
- `services/crm-api` → Twenty integration boundary
- `services/assistant-service` → assistant-safe tool orchestration

## Security rules

- Never expose Postgres, Redis, FalkorDB, worker vLLM, or worker Ollama publicly.
- All public ingress is through Cloudflared on the orchestrator only.
- Admin surfaces should be Cloudflare Access-gated.
- Secrets live in gitignored `.env` files or secret managers, never in source.

## Definition of done

Work is only done when:
- implementation is complete
- tests or validation checks exist
- docs are updated
- smoke checks pass
- no deprecated architecture is reintroduced


<claude-mem-context>
# Memory Context

# [project-nyra] recent context, 2026-04-28 9:55am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 45 obs (18,570t read) | 1,243,980t work | 99% savings

### Apr 27, 2026
1 3:20p 🔵 project-nyra and global Claude Code settings.json configurations audited
2 3:45p 🔵 Multi-layer memory infrastructure via Grafbase/nexus MCP proxy aggregator
4 " ✅ claude-mem SessionStart hook added to global ~/.claude/settings.json
5 " 🟣 Unified memory architecture document created for project-nyra with three-layer stack
3 3:46p 🔵 project-nyra .mcp.json reveals full MCP server topology including SSE-based serena and SSH/shadcn servers
6 3:49p 🔵 project-nyra MEMORY.md index reveals rich existing project memory with 15+ reference documents
7 " ✅ Memory setup fully verified: hook active, architecture doc written, MEMORY.md index updated
S10 Add Claude Code notification hooks to both project-nyra local settings and global Ubuntu settings — configuring wsh badge commands for permission prompts, elicitation dialogs, AskUserQuestion, and Stop events (Apr 27, 3:50 PM)
38 3:50p 🔵 Global ~/.claude/settings.json Hook Structure Revealed
39 " ✅ wsh Badge Notification Hooks Added to Global ~/.claude/settings.json
S8 Resume fixing SSH on worker-rtx5090 and all other PCs in the cluster (Apr 27, 3:50 PM)
S5 Session complete: memory stack setup, Serena config fix, MemPalace KG saved (Apr 27, 3:50 PM)
S15 SSH cluster configuration remediation across 5-machine homelab — fix port 2224 on worker-rtx5090 and propagate to all nodes (Apr 27, 8:55 PM)
16 8:55p 🔵 Project Nyra SSH Infrastructure State Mapped
46 " 🔵 User Preference: Full Autonomy Over Command Execution
S9 Fix SSH on worker-rtx5090 and propagate fixes to all Project Nyra cluster machines (Apr 27, 8:55 PM)
S11 Add wsh badge notification hooks to both project-nyra local .claude/settings.json and global ~/.claude/settings.json, merging with existing hook entries (Apr 27, 8:56 PM)
33 9:49p ⚖️ Project RateHunter "NEKO" Grid — Finalized Distributed Architecture
34 " 🔵 Cloudflare Pages Path Mismatch — /apps/landing vs /apps/landing/landing-page
40 9:53p 🔵 Gemini CLI Installed via Windows npm, Accessible from WSL
18 10:26p 🔵 WaveTerm Configuration Structure and wsh Command Reference Researched
19 10:27p 🔵 WaveTerm Custom AI Provider Configuration Schema (v0.13+)
### Apr 28, 2026
17 5:37a 🔵 Project Nyra Infrastructure Architecture Mapped
20 5:38a ✅ AGENTS.md Control Plane Architecture Updated to Reflect Orchestrator/Oracle-VPS Split
21 " ✅ README.md Hardware Topology and Architecture Decisions Updated
22 " 🔵 host-service-plan.yaml Has Stale Path References and Contradicts Actual infra/hosts Layout
24 " 🔴 Syncthing Home Directory Volume Mount Corrected on All Four Local Hosts
25 " 🔵 Oracle-VPS Compose File Contains Explicitly Banned Services (Letta, openmemory-mcp)
26 " 🔵 Syncthing Architecture Pattern: network_mode host, PUID/PGID 1000, Separate Config Volume
23 " 🔵 Project Nyra Oracle VPS Full Stack Mapped — Services, Ports, and Architecture
27 5:39a 🔵 Worker GPU Node Stacks Mapped — RTX 3090 Ti Has OpenClaw, RTX 5090 Does Not
31 " 🟣 WaveTerm Maximalist Bootstrap Script Created — Full Nyra Stack Integration
28 " ✅ Syncthing Added to AGENTS.md with Data Synchronization Section and Canonical Mount Rule
29 " ✅ CLAUDE.md and GEMINI.md Updated with Cluster Architecture Quick-Reference
30 " 🟣 Syncthing Home Folder Sync Fully Deployed and Documented Across All 5 Project Nyra Hosts
32 5:40a 🟣 Makefile Migrated from Ghostty+Zellij to WaveTerm — Five New Override Targets Added
35 5:43a 🔵 Duplicate wrangler.toml Files Found — Name Conflict Between Legacy and Active Landing Apps
36 " 🔴 Landing App Renamed ratehunter-landing → landing-page; All Codebase References Updated
37 " ✅ Cloudflare Pages Dashboard Settings Determined for landing-page App
45 5:53a ✅ wsh Badge Hooks Added to Project-Nyra Local settings.json
S12 Add wsh Wave Terminal badge notification hooks to both project-nyra local and global Ubuntu ~/.claude/settings.json, merging with all existing hook entries (Apr 28, 5:54 AM)
S13 Add wsh Wave Terminal badge notification hooks to both project-nyra local and global ~/.claude/settings.json — task fully completed with jq validation and MemPalace KG storage (Apr 28, 5:56 AM)
41 5:58a 🔵 gemini skills install Blocked by Interactive Prompt When Run From project-nyra
42 " 🔵 gemini skills install with --consent Completed But Skills Not Written to Project .gemini Directory
43 " 🔵 gemini skills install Places Extensions at ~/.gemini/extensions/, Not ~/.gemini/skills/
47 " 🔵 Cloudflare Pages Deployment Failing Due to Missing .gitmodules Entry for external/openclaw-n8n-stack
48 " ⚖️ Reverted landing-page Rename Back to ratehunter-landing to Match Cloudflare Pages UI
44 5:59a 🟣 21 addyosmani/agent-skills Installed Globally at ~/.gemini/skills/
S14 SSH cluster configuration fix for multi-machine homelab — user also issued permanent autonomy directive requiring Claude to run all executable commands without delegating back to user (Apr 28, 6:11 AM)
S16 SSH completely unresponsive on worker-rtx5090 (Windows) — requires local PowerShell fix to restore sshd_config and restart service on port 2224 (Apr 28, 6:15 AM)
49 6:24a ✅ Landing App Reverted Back to ratehunter-landing Name Across All Config Files
50 " ✅ CLOUDFLARE-DEPLOY.md Updated With 10 ratehunter-landing Path Replacements
51 " 🔵 .gitmodules Only Registers 2 of 4 Referenced Submodules — Root Cause of Cloudflare Deploy Failure
52 6:25a 🔵 external/openclaw-n8n-stack Not Present in Current Git Index — Submodule Error May Be Stale
53 6:27a ⚖️ Hybrid WaveTerm+Zellij Architecture Specified — Zellij as Persistence Layer, WaveTerm as Cockpit UI

Access 1244k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>