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
- Never reintroduce RuVector or Graphiti into the current architecture.
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
- OpenClaw Gateway
- OpenClaw Studio
- Pocket TTS
- Syncthing (Cluster Sync)
- Open WebUI
- Mem0
- Cloudflared Tunnel (Public Ingress)

#### Oracle-VPS (Cloud)

- Twenty CRM (System of Record)
- Gitea
- Activepieces
- Qdrant / FalkorDB
- Mem0
- Quote API
- Campaign Engine

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
- `worker-rtx3060` → Embeddings, Extraction, Background Tasks, Summarization

### Memory

- Mem0 is the primary selected assistant/runtime memory layer.
- OpenMemory MCP is allowed and supported as part of the memory plane.
- FalkorDB is used as a Mem0 graph backend where graph memory is needed.
- Qdrant is allowed as the vector backend for Mem0/OpenMemory where configured.
- Mempalace, ClaudeMem, and MemoryTensor/MemOS are allowed memory infrastructure components.
- Letta is allowed as a memory-manager agent and long-term agent memory integration.

### Workflow engine

- n8n is allowed as internal automation glue.
- Activepieces is allowed as internal automation glue where explicitly deployed.
- n8n is not the customer-facing product UI.
- n8n is not the business brain.

### Assistant surfaces

- OpenClaw Gateway + OpenClaw Studio are the primary assistant runtime/dashboard.
- Open WebUI is internal-only model/tool workbench.
- apps/cockpit should use the OpenClaw chat experience for the assistant surface.

## Product invariants

- Twenty CRM is the system of record.
- Compliance is explicit code with tests.
- **Safety Gates**: All outbound communication MUST pass through `ComplianceService` (STOP detection) and `ApprovalService` (HITL).
- **Audit Mandate**: Every mutation or communication MUST log an `AuditEvent` via `AuditLogger` to the CRM timeline.
- **Logical Scaffolding**: Use `@nyra/domain-models` for all type contracts and `@nyra/integration-adapters` for all 3rd party SDK calls.
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

- **Visual Identity (High Fidelity)**: Strictly adhere to the **Dark Mode / Indigo / Seafoam / Neon Pink** palette.
  - Primary: Indigo/Purple (Indigo-500/600).
  - Secondary: Seafoam/Turquoise (Turquoise-400/500).
  - Alerts: Neon Pink (Pink-400/500).
  - Component Pattern: High professional density, ShadCN tokens, oklch colors. No light mode.
- Use the shared tweakcn/shadcn/Magic UI design language.
- Avoid random inline colors and one-off styling decisions.
- Keep broker-facing UI professional, modern, and fast.

## Directory routing

Agents must place work in the correct location.

### Repo roots

- `apps/projectnyra` → (projectnyra.com) Unified broker and operations command hub.
- `apps/ratehunter` → (ratehunter.net) Public mortgage broker landing page (Isolated).

- `services/*` → backend business services
- `packages/*` → shared libraries, types, domain modules
- `workflows/n8n/*` → n8n workflow JSONs
- `infra/hosts/<host-name>/*` → the only valid per-host Docker Compose and deployment files
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

EXECUTION_PLAN_APPS.md
Software engineering playbook for Project Nyra.
Scope
This document covers:
CRM integration
lead ingestion
campaign runtime
compliance logic
communication logging
quote engine
admin UI
landing page
broker cockpit
OpenClaw assistant integration
Product rules
Twenty CRM is the system of record.
n8n is internal glue, not the business brain.
OpenClaw is the assistant surface, not the CRM.
Compliance logic is explicit code, with tests.
Target repo layout

```text
apps/
  admin/
  webapp/
  landing/

services/
  api-gateway/
  crm-api/
  lead-ingestion/
  campaign-service/
  compliance-service/
  communication-service/
  quote-service/
  assistant-service/
  webhook-service/

packages/
  crm-types/
  compliance-domain/
  campaign-domain/
  quote-domain/
  shared/
  ui/

workflows/
  n8n/
```

Phase 1 — CRM data layer
Goals
Deploy and stabilize Twenty CRM
Model mortgage-specific objects
Build shared CRM client package and service wrapper
Core objects
`LOAN`
`CAMPAIGN_ENROLLMENT`
`COMMUNICATION_LOG`
`QUOTE`
Contact extensions
consent_email
consent_sms
consent_voice
consent_timestamp
lead_source
lead_score
do_not_contact
Required package
`packages/crm-client`
`services/crm-api`
Phase 2 — Lead ingestion
Build `services/lead-ingestion` to:
accept raw lead payloads
normalize and validate fields
dedupe against Twenty CRM
write cleaned records
assign campaign eligibility
log ingestion audit events
Expected routes:
`POST /api/leads`
`POST /api/leads/ingest`
`GET /api/leads/:id`
Phase 3 — Campaign engine
Build `services/campaign-service` to own:
campaign definitions
scheduled steps
pause/resume
reply-based pausing
STOP-based cancellation
quiet hours
per-channel eligibility
enrollment state
n8n may execute steps, but campaign logic belongs here.
Phase 4 — Compliance
Build `services/compliance-service` to own:
STOP/unsubscribe handling
do-not-contact enforcement
channel consent
quiet hours
suppression audit logs
contact-level compliance state
Required invariants:
STOP must halt all future outreach immediately
unsubscribe must be honored immediately
reply must pause automation and notify broker
Phase 5 — Communication service
Build `services/communication-service` to own:
outbound send requests
provider callbacks
inbound replies
message/call logging
CRM timeline sync
Channels:
email
sms
voice / voicemail
Phase 6 — Quote engine
Build `services/quote-service` to own:
3-option quote generation
payment calculations
cost breakdowns
quote PDFs
quote history and expiration
Important:
quotes come from the quote service only
assistant must never fabricate quote terms
Phase 7 — App surfaces
apps/cockpit
Build the internal command center and broker application with:
dashboard
lead list/detail
campaign management
quote management
communications timeline
compliance controls
assistant tooling panel
provider/settings pages
apps/cockpit
Build the broker/customer-facing application with:
intake
status
quote views
document collection
assistant/chat experience via OpenClaw
apps/landing
Build the marketing and lead-capture landing experience.
UI standards
Use everywhere:
Next.js App Router
TypeScript
Tailwind
shadcn/ui
Magic UI
shared tweakcn palette/tokens
Acceptance criteria
Applications are considered ready when:
lead ingestion writes correct CRM records
campaign engine schedules and stops correctly
STOP/reply/unsubscribe rules work immediately
quote engine outputs deterministic 3-option scenarios
admin UI exposes operational controls
cockpit integrates the OpenClaw chat surface
all domain logic has tests

EXECUTION_PLAN_INFRA.md
DevOps playbook for Project Nyra.
Scope
This document covers:
infrastructure validation
node topology
Docker Desktop + WSL2 assumptions
per-node Docker Compose bring-up
worker GPU serving
LiteLLM model routing
Cloudflared ingress policy
monitoring and health checks
security hardening
Current topology
Orchestrator
`orchestrator.trex-fiordland.ts.net`
`100.64.0.10`
Workers
`worker-rtx5090.trex-fiordland.ts.net`
`worker-rtx3090ti.trex-fiordland.ts.net`
`worker-rtx3060.trex-fiordland.ts.net`
Use MagicDNS hostnames as the default addressing layer.
Do not hardcode LAN IPs as primary service endpoints.
Infrastructure rules
Use Docker Compose per node.
Live Docker Compose source files must live only under `infra/hosts/<host-name>/`.
Do not use `infra/deploy`, `infra/compose`, `infra/stacks`, `infra/workers`, `infra/homeassistant`, `infra/cleanup_archive`, or `infra/ingest` as runtime Compose sources.
Do not use Docker Swarm right now.
Do not use Kubernetes right now.
Keep workers private over Tailscale.
Run Cloudflared only on the orchestrator.
Use Portainer Server on the orchestrator to manage environments.
Phase 0 — Infrastructure validation
Baseline checks
Run on each node where relevant:

```bash
wsl --update
docker version
docker compose version
```

GPU workers:

```bash
nvidia-smi
docker run --rm --gpus all nvidia/cuda:12.9.0-base-ubuntu22.04 nvidia-smi
```

Tailscale and routing:

```bash
tailscale status
tailscale ping orchestrator.trex-fiordland.ts.net
tailscale ping worker-rtx5090.trex-fiordland.ts.net
tailscale ping worker-rtx3090ti.trex-fiordland.ts.net
tailscale ping worker-rtx3060.trex-fiordland.ts.net
```

Health-check script
Install and use:

```bash
chmod +x ops/scripts/health-check.sh
bash ops/scripts/health-check.sh
```

See `ops/scripts/health-check.sh` in this pack.
Worker deployment
worker-rtx3060 — Ollama

```bash
docker compose -f infra/hosts/worker-rtx3060/docker-compose.yml up -d
docker logs -f nyra-ollama-3060
curl http://localhost:11434/api/tags
```

worker-rtx5090 — vLLM

```bash
docker compose -f infra/hosts/worker-rtx5090/docker-compose.yml up -d
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

worker-rtx3090ti — vLLM

```bash
docker compose -f infra/hosts/worker-rtx3090ti/docker-compose.yml up -d
curl http://localhost:8000/health
curl http://localhost:8000/v1/models
```

Orchestrator bring-up

```bash
docker compose -f infra/hosts/orchestrator/docker-compose.yml up -d
bash ops/scripts/health-check.sh
```

LiteLLM routing model
Use LiteLLM to unify:
Anthropic / Claude
OpenAI / Codex API if used
Gemini / Vertex or Gemini API
local vLLM 5090
local vLLM 3090 Ti
local Ollama 3060
Default routing pattern:
primary coding: Claude
secondary coding: Codex / Gemini
heavy local/private tasks: vLLM
small local utility tasks: Ollama
Cloudflared policy
Tunnel only orchestrator-facing services.
Public
`app.projectnyra.com`
`api.projectnyra.com`
`hooks.projectnyra.com`
Access-gated
`gitea.projectnyra.com`
`twenty.projectnyra.com`
`n8n.projectnyra.com`
`grafana.projectnyra.com`
`bot.projectnyra.com`
Never tunnel publicly
worker inference endpoints
Postgres
Redis
FalkorDB
raw MCP internals
Portainer
Recommended pattern:
Portainer Server on orchestrator
add each worker as an environment
keep Portainer behind Cloudflare Access
Security hardening
Required
gitignore all `.env` files with secrets
Cloudflare Access on admin surfaces
Tailscale-only access to workers
no public datastore exposure
explicit compliance logging for workflow-triggering services
Manual-owner-only tasks
Anything requiring:
Cloudflare dashboard login
Twilio account setup
provider domain verification
OAuth/MFA
must be documented in `docs/OWNER_MANUAL_ACTIONS.md`.
Acceptance criteria
Infrastructure is considered ready when:
orchestrator control plane services are reachable
worker inference endpoints are healthy over Tailscale
LiteLLM can route to local and cloud providers
Cloudflared is configured on orchestrator only
health-check script passes
no deprecated components are deployed

MASTER_ARCHITECTURE.md
Authoritative architecture reference for Project Nyra.
This document exists to give future agents and humans one top-to-bottom picture of the current target system.

1. System overview
   Project Nyra is an AI-powered mortgage lead automation platform with a strict separation between:
   control plane → orchestrator-hosted routing, workflows, memory policy, observability, admin surfaces
   compute plane → GPU workers serving private local models
   Nyra’s product objective is to automate lead intake, follow-up, quote generation, and broker assistance without making the workflow engine or the assistant the system of record.
2. Core design principles
   2.1 CRM is the system of record
   Twenty CRM owns core business records.
   2.2 n8n is replaceable
   Use n8n for execution glue, not for the business brain.
   2.3 Assistant is bounded
   OpenClaw is the assistant surface. All critical mutations happen through Nyra services.
   2.4 Compliance first
   STOP, reply pauses, unsubscribe, quiet hours, and audit logging are platform features.
3. Node roles
   orchestrator
   always-on control plane
   public ingress via Cloudflared
   internal services and dashboards
   routing, observability, CRM, memory substrate
   worker-rtx5090
   primary vLLM node
   mobile admin battlestation if needed
   worker-rtx3090ti
   secondary vLLM node
   heavy offline/reasoning jobs
   worker-rtx3060
   Ollama utility node
   summarization, extraction, small models, ingestion helpers
4. Control plane services
   These should live on the orchestrator:
   Nexus Router
   LiteLLM
   Langfuse
   Prometheus
   Loki
   Grafana
   Portainer Server
   n8n
   Twenty CRM
   OpenClaw Gateway
   OpenClaw Studio
   Open WebUI
   Mem0
   FalkorDB
   Postgres
   Redis
   Cloudflared
5. Networking model
   Private
   Tailscale mesh
   MagicDNS hostnames preferred
   worker services remain private
   Public
   Cloudflare Tunnel only from orchestrator
   admin surfaces behind Cloudflare Access
6. Memory model
   Use:
   Mem0 for selected assistant/runtime memory
   OpenMemory MCP where shared MCP memory tools are needed
   FalkorDB as the Mem0 graph backend where graph memory is needed
   Qdrant as the Mem0/OpenMemory vector backend where configured
   Mempalace, ClaudeMem, and MemoryTensor/MemOS as allowed memory infrastructure
   Letta as a memory-manager agent and long-term agent memory integration
   Do not reintroduce:
   RuVector
   Graphiti
7. Model serving and routing
   Local model serving
   vLLM on 5090 and 3090 Ti
   Ollama on 3060
   Cloud model use
   Claude Code remains the primary coding engine
   Codex CLI can consume ChatGPT / Codex subscription usage in parallel
   Gemini CLI can consume Google subscription / free quota in parallel
   Routing approach
   one frontend session should route one request to one backend at a time
   parallel subagents are preferred over trying to make one conversation span all GPUs directly
8. App surfaces
   apps/cockpit
   Unified internal command center and broker application.
   apps/landing
   Public marketing and lead capture.
   OpenClaw
   Broker/customer assistant surface.
   OpenClaw Studio
   Assistant dashboard.
   Open WebUI
   Internal-only LLM workbench.
9. Repo placement guidance
   `apps/*` → frontends
   `services/*` → business services
   `packages/*` → shared libs
   `workflows/n8n/*` → workflow JSON
   `infra/hosts/<host-name>/*` → infra per host; the only valid Docker Compose source location
   `ops/*` → scripts, tmux, profiles
   `docs/*` → architecture and execution plans
10. Non-goals
    no Docker Swarm for now
    no Kubernetes for now
    no public worker inference
    no assistant-direct database mutations
    no resurrecting deprecated memory stack pieces

<claude-mem-context>
# Memory Context

# [project-nyra] recent context, 2026-05-09 6:56am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (19,715t read) | 2,074,417t work | 99% savings

### Apr 28, 2026

S14 SSH cluster configuration fix for multi-machine homelab — user also issued permanent autonomy directive requiring Claude to run all executable commands without delegating back to user (Apr 28, 6:11 AM)
S16 SSH completely unresponsive on worker-rtx5090 (Windows) — requires local PowerShell fix to restore sshd_config and restart service on port 2224 (Apr 28, 6:15 AM)
S19 Project-nyra cluster network remediation — Oracle VPS SSH bootstrap problem: correct IP/port found but authentication blocked, awaiting user input on key injection method (Apr 28, 6:15 AM)
S17 Full stack health audit + access guide for project-nyra: Wave AI + llxprt + OpenClaw + Zellij orchestrator, plus Paperclip, ClawTeam, NerveUI, and Gitea — user uncertain about whether a prior agent's Makefile run left everything healthy (Apr 28, 9:00 AM)

### Apr 29, 2026

S18 Oracle VPS SSH debugging — oci_api_key.pem format conversion attempt, still failing; user clarified correct IP is 100.64.0.3 (Apr 29, 1:11 AM)
S20 Project-nyra cluster remediation — Oracle VPS SSH bootstrap blocked; session paused awaiting user choice of key injection method (OCI Console vs Infisical project ID) (Apr 29, 1:24 AM)
S22 omc-setup — environment inspected, awaiting user config target choice (Apr 29, 1:30 AM)

### May 3, 2026

S23 Fix invalid approval_policy enum values in three Codex config.toml files (May 3, 5:40 AM)
S21 omc-setup — initializing OMC for project-nyra (May 3, 5:40 AM)

### May 4, 2026

134 10:13a 🔵 Windows Codex Config Bug: `approval_mode = "never"` Invalid in `[apps]` Section
135 " 🔵 Ubuntu vs Windows Codex Config Key Name Divergence: `sandbox` vs `sandbox_mode`
136 " 🔵 Codex 0.128.0 Feature Flag Inventory — All Stable and Experimental Flags
138 10:14a 🔵 Ubuntu Codex `default.rules` Is 52% Larger Than Windows — Rule Sets Have Diverged
139 " 🔵 Windows `.tmp` Cache Has OMC Marketplace Clone With Full oh-my-claudecode Repo Structure
140 " ✅ Ubuntu Codex Config Backed Up Before Autonomy/Permission Changes
141 " 🔴 Both Codex Configs Rebuilt — Bug Fixed, Full Autonomy and Feature Parity Applied
142 " 🔴 Both Codex Configs Verified Working — Windows Config No Longer Errors on Load
143 " ⚖️ GitHub CLI Auth Switched from Token Env Vars to SSH-based CLI Auth
144 2:21p ✅ New infra/zellij/scripts changes queued for PR from secondary PC

### May 5, 2026

145 8:35a 🔵 Working tree change scope far larger than initial assessment — 274 files across infrastructure reorganization
146 8:36a 🔴 pnpm-lock.yaml has hundreds of leftover conflict markers blocking commit on new branch
152 9:11a 🟣 Superpowers Extension Installed for Gemini CLI
153 " 🔵 Project-Nyra Monorepo Structure Mapped
154 " 🔵 Project-Nyra Multi-Host Infrastructure Port Registry Documented
155 9:13a 🔵 Project-Nyra Apps With package.json vs. Empty/Static Dirs Identified
147 10:45a 🔵 Invalid approval_policy value in Codex config files
148 10:46a 🔴 Fixed invalid approval_policy in three Codex config files
149 " 🔵 Codex approval_policy schema documented in knowledge graph
S24 Fix invalid approval_policy enum values in three Codex config.toml files across different locations (May 5, 10:46 AM)
150 10:59a 🔵 Oracle VPS Secret Migration: Identified All OCI Credentials and Config Files Requiring Update
156 " 🔵 Oracle VPS Infrastructure Reduction Requiring Secrets Rotation
162 " 🔵 Infisical CLI Confirmed Installed Locally (v0.43.79)
151 11:00a 🔵 Oracle VPS terraform.tfvars Missing; Infisical Confirmed as Secrets Backend; Full Secret Checklist Assembled
157 11:04a ✅ Gemini CLI Superpowers Extension Installation
160 " 🔵 project-nyra Monorepo App Structure
158 11:05a 🔵 Oracle VPS Stack Architecture and Required Secrets Inventory
159 " 🔵 SSH and OCI API Keys Confirmed Present Locally
161 " 🔵 project-nyra App Port Assignments and Tech Stack Confirmed
163 " 🔵 project-nyra Turbo Config and Environment State
164 " 🟣 All 7 project-nyra Apps Launched as Background Processes
165 11:06a 🔵 project-nyra App Routes Mapped from page.tsx Files
166 " 🔵 App Startup Failures: Next.js 15 Port Flag Bug and Pre-occupied Port 3016
167 " 🟣 Four More Apps Started Successfully via PORT= Env Var Fix
168 11:07a 🔵 port 3016 EADDRINUSE Root Cause: workerd Process from Cloudflare Wrangler
169 " 🟣 project-nyra Dev Environment Successfully Stood Up (6 of 7 Apps)
170 " 🔵 Project-Nyra Complete Application Port Map
171 " 🟣 Playwright Screenshot Script for All App Routes
172 " 🔴 Three App Build Fixes: PostCSS, Root Layout, Missing Utils
173 " 🔵 Mortgage-CRM UI Component Library Structure
174 3:35p 🔴 Mortgage-CRM Hydration Mismatch Fixed with suppressHydrationWarning
175 3:36p 🔴 Landing-Legacy PostCSS Config Was CJS Not ESM — Re-fixed
176 " 🔴 Nyra-Admin Root Layout CSS Import Path Fixed
177 3:38p ✅ Session Summary: Project-Nyra Full App Audit and Build Stabilization 2026-05-05
178 3:39p ⚖️ Mine Workflow Complete: project-nyra Migration Readiness Confirmed
179 " 🔵 Cockpit V1 Original Design Source Material Located
180 5:32p ⚖️ Cockpit Migration Strategy: Build Campaign Management Dashboard Based on V1 Vision
181 5:34p 🔵 Rich Shared Asset Library in packages/assets/ Contains Multiple Design Reference Directories
182 5:37p 🔵 RTK Tool Limitation: Does Not Support Compound find Predicates
183 " 🔵 Complete Image Asset Inventory for Project-Nyra Shared Assets
184 " ⚖️ Session Checkpoint: Project-Nyra Phase 2 Planning State 2026-05-06

Access 2074k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>

<!-- OMX:AGENTS:START -->
<!-- AUTONOMY DIRECTIVE — DO NOT REMOVE -->

YOU ARE AN AUTONOMOUS CODING AGENT. EXECUTE TASKS TO COMPLETION WITHOUT ASKING FOR PERMISSION.
DO NOT STOP TO ASK "SHOULD I PROCEED?" — PROCEED. DO NOT WAIT FOR CONFIRMATION ON OBVIOUS NEXT STEPS.
IF BLOCKED, TRY AN ALTERNATIVE APPROACH. ONLY ASK WHEN TRULY AMBIGUOUS OR DESTRUCTIVE.
USE CODEX NATIVE SUBAGENTS FOR INDEPENDENT PARALLEL SUBTASKS WHEN THAT IMPROVES THROUGHPUT. THIS IS COMPLEMENTARY TO OMX TEAM MODE.

<!-- END AUTONOMY DIRECTIVE -->
<!-- omx:generated:agents-md -->

# oh-my-codex - Intelligent Multi-Agent Orchestration

You are running with oh-my-codex (OMX), a coordination layer for Codex CLI.
This AGENTS.md is the top-level operating contract for the workspace.
Role prompts under `prompts/*.md` are narrower execution surfaces. They must follow this file, not override it.
When OMX is installed, load the installed prompt/skill/agent surfaces from `./.codex/prompts`, `./.codex/skills`, and `./.codex/agents` (or the project-local `./.codex/...` equivalents when project scope is active).

<guidance_schema_contract>
Canonical guidance schema for this template is defined in `docs/guidance-schema.md`.

Required schema sections and this template's mapping:

- **Role & Intent**: title + opening paragraphs.
- **Operating Principles**: `<operating_principles>`.
- **Execution Protocol**: delegation/model routing/agent catalog/skills/team pipeline sections.
- **Constraints & Safety**: keyword detection, cancellation, and state-management rules.
- **Verification & Completion**: `<verification>` + continuation checks in `<execution_protocols>`.
- **Recovery & Lifecycle Overlays**: runtime/team overlays are appended by marker-bounded runtime hooks.

Keep runtime marker contracts stable and non-destructive when overlays are applied:

- `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`
- `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`
  </guidance_schema_contract>

<operating_principles>

- Solve the task directly when you can do so safely and well.
- Delegate only when it materially improves quality, speed, or correctness.
- Keep progress short, concrete, and useful.
- Prefer evidence over assumption; verify before claiming completion.
- Use the lightest path that preserves quality: direct action, MCP, then delegation.
- Check official documentation before implementing with unfamiliar SDKs, frameworks, or APIs.
- Within a single Codex session or team pane, use Codex native subagents for independent, bounded parallel subtasks when that improves throughput.
<!-- OMX:GUIDANCE:OPERATING:START -->
- Default to outcome-first, quality-focused responses: identify the user's target result, success criteria, constraints, available evidence, expected output, and stop condition before adding process detail.
- Keep collaboration style short and direct. Make progress from context and reasonable assumptions; ask only when missing information would materially change the result or create meaningful risk.
- Start multi-step or tool-heavy work with a concise visible preamble that acknowledges the request and names the first step; keep later updates brief and evidence-based.
- Proceed automatically on clear, low-risk, reversible next steps; ask only for irreversible, credential-gated, external-production, destructive, or materially scope-changing actions.
- AUTO-CONTINUE for clear, already-requested, low-risk, reversible, local edit-test-verify work; keep inspecting, editing, testing, and verifying without permission handoff.
- ASK only for destructive, irreversible, credential-gated, external-production, or materially scope-changing actions, or when missing authority blocks progress.
- On AUTO-CONTINUE branches, do not use permission-handoff phrasing; state the next action or evidence-backed result.
- Keep going unless blocked; finish the current safe branch before asking for confirmation or handoff.
- Ask only when blocked by missing information, missing authority, or an irreversible/destructive branch.
- Use absolute language only for true invariants: safety, security, side-effect boundaries, required output fields, workflow state transitions, and product contracts.
- Do not ask or instruct humans to perform ordinary non-destructive, reversible actions; execute those safe reversible OMX/runtime operations and ordinary commands yourself.
- Treat OMX runtime manipulation, state transitions, and ordinary command execution as agent responsibilities when they are safe and reversible.
- Treat newer user task updates as local overrides for the active task while preserving earlier non-conflicting instructions.
- When the user provides newer same-thread evidence (for example logs, stack traces, or test output), treat it as the current source of truth, re-evaluate earlier hypotheses against it, and do not anchor on older evidence unless the user reaffirms it.
- Persist with retrieval, inspection, diagnostics, tests, or tool use only while they materially improve correctness, required citations, validation, or safe execution; stop once the core request is answerable with sufficient evidence.
- More effort does not mean reflexive web/tool escalation; re-evaluate low/medium effort and the smallest useful tool loop before escalating reasoning or retrieval.
  <!-- OMX:GUIDANCE:OPERATING:END -->
  </operating_principles>

## Working agreements

- For cleanup/refactor/deslop work, write a cleanup plan and lock behavior with regression tests before editing when coverage is missing.
- Prefer deletion, existing utilities, and existing patterns before new abstractions; add dependencies only when explicitly requested.
- Keep diffs small, reviewable, and reversible.
- Verify with lint, typecheck, tests, and static analysis after changes; final reports include changed files, simplifications, and remaining risks.

<lore_commit_protocol>

## Lore Commit Protocol

Every commit message must follow the Lore protocol: a concise decision record using git-native trailers.

### Format

```
<intent line: why the change was made, not what changed>

<optional concise body: constraints and approach rationale>

Constraint: <external constraint that shaped the decision>
Rejected: <alternative considered> | <reason for rejection>
Confidence: <low|medium|high>
Scope-risk: <narrow|moderate|broad>
Directive: <forward-looking warning for future modifiers>
Tested: <what was verified>
Not-tested: <known gaps in verification>
```

### Rules

- Intent line first; describe why, not what.
- Use trailers only when they add decision context.
- Use `Rejected:` for alternatives future agents should not re-explore.
- Use `Directive:` for warnings, `Constraint:` for external forces, and `Not-tested:` for known verification gaps.
- Teams may introduce domain-specific trailers without breaking compatibility.
  </lore_commit_protocol>

---

<delegation_rules>
Default posture: work directly.

Choose the lane before acting:

- `$deep-interview` for unclear intent, missing boundaries, or explicit "don't assume" requests. This mode clarifies and hands off; it does not implement.
- `$ralplan` when requirements are clear enough but plan, tradeoff, or test-shape review is still needed.
- `$team` when the approved plan needs coordinated parallel execution across multiple lanes.
- `$ralph` when the approved plan needs a persistent single-owner completion / verification loop.
- **Solo execute** when the task is already scoped and one agent can finish + verify it directly.

Delegate only when it materially improves quality, speed, or safety. Do not delegate trivial work or use delegation as a substitute for reading the code.
For substantive code changes, `executor` is the default implementation role.
Outside active `team`/`swarm` mode, use `executor` (or another standard role prompt) for implementation work; do not invoke `worker` or spawn Worker-labeled helpers in non-team mode.
Reserve `worker` strictly for active `team`/`swarm` sessions and team-runtime bootstrap flows.
Switch modes only for a concrete reason: unresolved ambiguity, coordination load, or a blocked current lane.
</delegation_rules>

<child_agent_protocol>
Leader responsibilities:

1. Pick the mode and keep the user-facing brief current.
2. Delegate only bounded, verifiable subtasks with clear ownership.
3. Integrate results, decide follow-up, and own final verification.

Worker responsibilities:

1. Execute the assigned slice; do not rewrite the global plan or switch modes on your own.
2. Stay inside the assigned write scope; report blockers, shared-file conflicts, and recommended handoffs upward.
3. Ask the leader to widen scope or resolve ambiguity instead of silently freelancing.

Rules:

- Max 6 concurrent child agents.
- Child prompts stay under AGENTS.md authority.
- `worker` is a team-runtime surface, not a general-purpose child role.
- Child agents should report recommended handoffs upward.
- Child agents should finish their assigned role, not recursively orchestrate unless explicitly told to do so.
- Prefer inheriting the leader model by omitting `spawn_agent.model` unless a task truly requires a different model.
- Do not hardcode stale frontier-model overrides for Codex native child agents. If an explicit frontier override is necessary, use the current frontier default from `OMX_DEFAULT_FRONTIER_MODEL` / the repo model contract (currently `gpt-5.5`), not older values such as `gpt-5.2`.
- Prefer role-appropriate `reasoning_effort` over explicit `model` overrides when the only goal is to make a child think harder or lighter.
  </child_agent_protocol>

<invocation_conventions>

- `$name` — invoke a workflow skill
- `/skills` — browse available skills
- Prefer skill invocation and keyword routing as the primary user-facing workflow surface
  </invocation_conventions>

<model_routing>
Match role to task shape:

- Low complexity: `explore`, `style-reviewer`, `writer`
- Research/discovery: `explore` for repo lookup, `researcher` for official docs/reference gathering, `dependency-expert` for SDK/API/package evaluation
- Standard: `executor`, `debugger`, `test-engineer`
- High complexity: `architect`, `executor`, `critic`

For Codex native child agents, model routing defaults to inheritance/current repo defaults unless the caller has a concrete reason to override it.
</model_routing>

<specialist_routing>
Leader/workflow routing contract:

<!-- OMX:GUIDANCE:SPECIALIST-ROUTING:START -->

- Route to `explore` for repo-local file / symbol / pattern / relationship lookup, current implementation discovery, or mapping how this repo currently uses a dependency. `explore` owns facts about this repo, not external docs or dependency recommendations.
- Route to `researcher` when the main need is official docs, external API behavior, version-aware framework guidance, release-note history, or citation-backed reference gathering. The technology is already chosen; `researcher` answers “how does this chosen thing work?” and is not the default dependency-comparison role.
- Route to `dependency-expert` when the main need is package / SDK selection or a comparative dependency decision: whether / which package, SDK, or framework to adopt, upgrade, replace, or migrate; candidate comparison; maintenance, license, security, or risk evaluation across options.
- Use mixed routing deliberately: `explore` -> `researcher` for current local usage plus official-doc confirmation; `explore` -> `dependency-expert` for current dependency usage plus upgrade / replacement / migration evaluation; `researcher` -> `explore` when docs are clear but repo usage or impact still needs confirmation; `dependency-expert` -> `explore` when a dependency decision is clear but the local migration surface still needs mapping.
- Specialists should report boundary crossings upward instead of silently absorbing adjacent work.
- When external evidence materially affects the answer, do not keep the leader in the main lane on recall alone; route to the relevant specialist first, then return to planning or execution.
  <!-- OMX:GUIDANCE:SPECIALIST-ROUTING:END -->
  </specialist_routing>

---

<agent_catalog>
Key roles: `explore` (repo search/mapping), `planner` (plans/sequencing), `architect` (read-only design/diagnosis), `debugger` (root cause), `executor` (implementation/refactoring), and `verifier` (completion evidence).

Research/discovery specialists:

- `explore` — first-stop repository lookup and symbol/file mapping
- `researcher` — official docs, references, and external fact gathering
- `dependency-expert` — SDK/API/package evaluation before adopting or changing dependencies

Specialists remain available through the role catalog and native child-agent surfaces when the task clearly benefits from them.
</agent_catalog>

---

<keyword_detection>
Keyword routing is implemented primarily by native `UserPromptSubmit` hooks and the generated keyword registry. Treat hook-injected routing context as authoritative for the current turn, then load the named `SKILL.md` or prompt file as instructed.

Fallback behavior when hook context is unavailable:

- Explicit `$name` invocations run left-to-right and override implicit keywords.
- Bare skill names do not activate skills by themselves; skill-name activation requires explicit `$skill` invocation. Natural-language routing phrases may still map to a workflow when they are not just the bare skill name. Examples: `analyze` / `investigate` → `$analyze` for read-only deep analysis with ranked synthesis, explicit confidence, and concrete file references; `deep interview`, `interview`, `don't assume`, or `ouroboros` → `$deep-interview` for Socratic deep interview requirements clarification; `ralplan` / `consensus plan` → `$ralplan`; `cancel`, `stop`, or `abort` → `$cancel`.
- Keep the detailed keyword list in `src/hooks/keyword-registry.ts`; do not duplicate that table here.

Runtime availability gate:

- Treat `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `team`/`swarm`, and `ecomode` as **OMX runtime workflows**, not generic prompt aliases.
- Auto-activate runtime workflows only when the current session is actually running under OMX CLI/runtime (for example, launched via `omx`, with OMX session overlay/runtime state available, or when the user explicitly asks to run `omx ...` in the shell).
- In Codex App or plain Codex sessions without OMX runtime, do **not** treat those keywords alone as activation. Explain that they require OMX CLI runtime support and are not directly available there, and continue with the nearest App-safe surface (`deep-interview`, `ralplan`, `plan`, or native subagents) unless the user explicitly wants you to launch OMX CLI from shell first.
- When deep-interview is active in attached-tmux OMX CLI/runtime, ask each interview round via `omx question` as a temporary popup-style renderer over the leader pane; after launching `omx question` in a background terminal, wait for that terminal to finish and read the JSON answer before continuing; preserve the leader pane with `OMX_QUESTION_RETURN_PANE=$TMUX_PANE` (or an explicit `%pane` value) when invoking it through Bash/tool paths, prefer `answers[0].answer` / `answers[]` from the response and use legacy `answer` only as fallback, and respect Stop-hook blocking while a deep-interview question obligation is pending. Deep-interview remains one question per round; do not batch multiple interview rounds into one `questions[]` form. Outside tmux or native surfaces that cannot render `omx question` should use the native structured question path when available, otherwise ask exactly one concise plain-text question and wait for the answer.

<triage_routing>

## Triage: advisory prompt-routing context

The keyword detector is the first and deterministic routing surface. Triage runs only when no keyword matches.

When active, triage emits **advisory prompt-routing context** — a developer-context string that the model may follow. It does not activate a skill or workflow by itself. It is a best-effort hint, not a guarantee.

Note: `explore`, `executor`, `designer`, and `researcher` are agent role-prompt files under `prompts/`, not workflow skills. `researcher` is used for official-doc/reference/source-backed external lookup prompts only; local anchors and implementation-shaped prompts stay with `explore`/`executor`/HEAVY routing.

Explicit keywords remain the deterministic control surface when you want explicit, guaranteed routing — use them whenever exact behavior matters.

To opt out per prompt with phrases such as `no workflow`, `just chat`, or `plain answer` — the triage layer will suppress context injection for that prompt.
</triage_routing>

Ralph / Ralplan execution gate:

- Enforce **ralplan-first** when ralph is active and planning is not complete.
- Planning is complete only after both `.omx/plans/prd-*.md` and `.omx/plans/test-spec-*.md` exist.
- Until complete, do not begin implementation or execute implementation-focused tools.
  </keyword_detection>

---

<skills>
Skills are workflow commands. Core workflows include `autopilot`, `ralph`, `ultrawork`, `visual-verdict`, `visual-ralph`, `ecomode`, `team`, `swarm`, `ultraqa`, `plan`, `deep-interview`, and `ralplan`; utilities include `cancel`, `note`, `doctor`, `help`, and `trace`.
</skills>

---

<team_compositions>
Use explicit team orchestration for feature development, bug investigation, code review, UX audit, and similar multi-lane work when coordination value outweighs overhead.
</team_compositions>

---

<team_pipeline>
Team mode is the structured multi-agent surface.
Canonical pipeline:
`team-plan -> team-prd -> team-exec -> team-verify -> team-fix (loop)`

Use it when durable staged coordination is worth the overhead. Otherwise, stay direct.
Terminal states: `complete`, `failed`, `cancelled`.
</team_pipeline>

---

<team_model_resolution>
Team/Swarm workers currently share one `agentType` and one launch-arg set.
Model precedence:

1. Explicit model in `OMX_TEAM_WORKER_LAUNCH_ARGS`
2. Inherited leader `--model`
3. Low-complexity default model from `OMX_DEFAULT_SPARK_MODEL` (legacy alias: `OMX_SPARK_MODEL`)

Normalize model flags to one canonical `--model <value>` entry.
Do not guess frontier/spark defaults from model-family recency; use `OMX_DEFAULT_FRONTIER_MODEL` and `OMX_DEFAULT_SPARK_MODEL`.
</team_model_resolution>

<!-- OMX:MODELS:START -->

## Model Capability Table

Auto-generated by `omx setup` from the current `config.toml` plus OMX model overrides.

| Role                        | Model                 | Reasoning Effort | Use Case                                                                                                                                |
| --------------------------- | --------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Frontier (leader)           | `gpt-5.5`             | high             | Primary leader/orchestrator for planning, coordination, and frontier-class reasoning.                                                   |
| Spark (explorer/fast)       | `gpt-5.3-codex-spark` | low              | Fast triage, explore, lightweight synthesis, and low-latency routing.                                                                   |
| Standard (subagent default) | `gpt-5.5`             | high             | Default standard-capability model for installable specialists and secondary worker lanes unless a role is explicitly frontier or spark. |
| `explore`                   | `gpt-5.3-codex-spark` | low              | Fast codebase search and file/symbol mapping (fast-lane, fast)                                                                          |
| `analyst`                   | `gpt-5.5`             | medium           | Requirements clarity, acceptance criteria, hidden constraints (frontier-orchestrator, frontier)                                         |
| `planner`                   | `gpt-5.5`             | medium           | Task sequencing, execution plans, risk flags (frontier-orchestrator, frontier)                                                          |
| `architect`                 | `gpt-5.5`             | high             | System design, boundaries, interfaces, long-horizon tradeoffs (frontier-orchestrator, frontier)                                         |
| `debugger`                  | `gpt-5.5`             | high             | Root-cause analysis, regression isolation, failure diagnosis (deep-worker, standard)                                                    |
| `executor`                  | `gpt-5.5`             | medium           | Code implementation, refactoring, feature work (deep-worker, standard)                                                                  |
| `team-executor`             | `gpt-5.5`             | medium           | Supervised team execution for conservative delivery lanes (deep-worker, frontier)                                                       |
| `verifier`                  | `gpt-5.5`             | high             | Completion evidence, claim validation, test adequacy (frontier-orchestrator, standard)                                                  |
| `code-reviewer`             | `gpt-5.5`             | high             | Comprehensive review across all concerns (frontier-orchestrator, frontier)                                                              |
| `dependency-expert`         | `gpt-5.5`             | high             | External SDK/API/package evaluation (frontier-orchestrator, standard)                                                                   |
| `test-engineer`             | `gpt-5.5`             | medium           | Test strategy, coverage, flaky-test hardening (deep-worker, frontier)                                                                   |
| `designer`                  | `gpt-5.5`             | high             | UX/UI architecture, interaction design (deep-worker, standard)                                                                          |
| `writer`                    | `gpt-5.5`             | high             | Documentation, migration notes, user guidance (fast-lane, standard)                                                                     |
| `git-master`                | `gpt-5.5`             | high             | Commit strategy, history hygiene, rebasing (deep-worker, standard)                                                                      |
| `code-simplifier`           | `gpt-5.5`             | high             | Simplifies recently modified code for clarity and consistency without changing behavior (deep-worker, frontier)                         |
| `researcher`                | `gpt-5.5`             | high             | External documentation and reference research (fast-lane, standard)                                                                     |
| `critic`                    | `gpt-5.5`             | high             | Plan/design critical challenge and review (frontier-orchestrator, frontier)                                                             |
| `vision`                    | `gpt-5.5`             | low              | Image/screenshot/diagram analysis (fast-lane, frontier)                                                                                 |

<!-- OMX:MODELS:END -->

---

<verification>
Verify before claiming completion.

Sizing guidance:

- Small changes: lightweight verification
- Standard changes: standard verification
- Large or security/architectural changes: thorough verification

<!-- OMX:GUIDANCE:VERIFYSEQ:START -->

Verification loop: define the claim and success criteria, run the smallest validation that can prove it, read the output, then report with evidence. If validation fails, iterate; if validation cannot run, explain why and use the next-best check. Keep evidence summaries concise but sufficient.

- Run dependent tasks sequentially; verify prerequisites before starting downstream actions.
- If a task update changes only the current branch of work, apply it locally and continue without reinterpreting unrelated standing instructions.
- For coding work, prefer targeted tests for changed behavior, then typecheck/lint/build/smoke checks when applicable; do not claim completion without fresh evidence or an explicit validation gap.
- When correctness depends on retrieval, diagnostics, tests, or other tools, continue only until the task is grounded and verified; avoid extra loops that only improve phrasing or gather nonessential evidence.
  <!-- OMX:GUIDANCE:VERIFYSEQ:END -->
  </verification>

<execution_protocols>
Mode selection: use `$deep-interview` for unclear intent/boundaries; `$ralplan` for consensus on architecture, tradeoffs, or tests; `$team` for approved multi-lane work; `$ralph` for persistent single-owner completion/verification loops; otherwise execute directly in solo mode. Switch modes only when evidence shows the current lane is mismatched or blocked.

Command routing:

- When `USE_OMX_EXPLORE_CMD` enables advisory routing, strongly prefer `omx explore` as the default surface for simple read-only repository lookup tasks (files, symbols, patterns, relationships).
- For simple file/symbol lookups, use `omx explore` FIRST before attempting full code analysis.

Use `omx explore --prompt ...` for simple read-only lookups through the shell-only, allowlisted, read-only path. Use `omx sparkshell` for noisy read-only shell commands, bounded verification, repo-wide listing/search, or explicit `omx sparkshell --tmux-pane` summaries. Treat sparkshell as explicit opt-in. When to use what: keep ambiguous, implementation-heavy, edit-heavy, diagnostics, tests, MCP/web, and complex shell work on the normal path; if `omx explore` or `omx sparkshell` is incomplete, retry narrower or gracefully fall back to the normal path.

Leader vs worker:

- The leader chooses the mode, keeps the brief current, delegates bounded work, and owns verification plus stop/escalate calls.
- Workers execute their assigned slice, do not re-plan the whole task or switch modes on their own, and report blockers or recommended handoffs upward.
- Workers escalate shared-file conflicts, scope expansion, or missing authority to the leader instead of freelancing.

Stop / escalate:

- Stop when the task is verified complete, the user says stop/cancel, or no meaningful recovery path remains.
- Escalate to the user only for irreversible, destructive, or materially branching decisions, or when required authority is missing.
- Escalate from worker to leader for blockers, scope expansion, shared ownership conflicts, or mode mismatch.
- `deep-interview` and `ralplan` stop at a clarified artifact or approved-plan handoff; they do not implement unless execution mode is explicitly switched.

Output contract:

- Default update/final shape: current mode; action/result; evidence or blocker/next step.
- Keep rationale once; do not restate the full plan every turn.
- Expand only for risk, handoff, or explicit user request.

Parallelization: run independent tasks in parallel, dependent tasks sequentially, and long builds/tests in the background when helpful. Prefer Team mode only when coordination value outweighs overhead. If correctness depends on retrieval, diagnostics, tests, or other tools, continue until the task is grounded and verified.

Anti-slop workflow:

- Cleanup/refactor/deslop work still follows the same `$deep-interview` -> `$ralplan` -> `$team`/`$ralph` path; use `$ai-slop-cleaner` as a bounded helper inside the chosen execution lane, not as a competing top-level workflow.
- Write a cleanup plan before modifying code; lock existing behavior with regression tests first, then make one smell-focused pass at a time.
- Prefer deletion over addition, and prefer reuse plus boundary repair over new layers.
- No new dependencies without explicit request.
- Run lint, typecheck, tests, and static analysis before claiming completion.
- Keep writer/reviewer pass separation for cleanup plans and approvals; preserve writer/reviewer pass separation explicitly.

Visual iteration gate:

- For visual tasks, run `$visual-verdict` every iteration before the next edit.
- Persist verdict JSON in `.omx/state/{scope}/ralph-progress.json`.

Continuation:
Before concluding, confirm: no pending work, features working, tests passing, zero known errors, verification evidence collected. If not, continue.

Ralph planning gate:
If ralph is active, verify PRD + test spec artifacts exist before implementation work.
</execution_protocols>

<cancellation>
Use the `cancel` skill to end execution modes.
Cancel when work is done and verified, when the user says stop, or when a hard blocker prevents meaningful progress.
Do not cancel while recoverable work remains.
</cancellation>

---

<state_management>
Hooks own normal skill-active and workflow-state persistence under `.omx/state/`.

OMX persists runtime state under `.omx/`:

- `.omx/state/` — mode state
- `.omx/notepad.md` — session notes
- `.omx/project-memory.json` — cross-session memory
- `.omx/plans/` — plans
- `.omx/logs/` — logs

Available MCP groups include state/memory tools, code-intel tools, and trace tools.

Agents may use OMX state/MCP tools for explicit lifecycle transitions, recovery, checkpointing, cancellation cleanup, or compaction resilience.
Do not manually duplicate hook-owned activation state unless recovering from missing or stale state.
</state_management>

---

## Nyra Non-UI Foundation (2026-05-11)

- **Status**: Logic Scaffold Complete.
- **Rules**:
  - Strictly Dark Mode / Indigo / Seafoam palette for all UI.
  - All outbound communication MUST pass through `ComplianceService`.
  - All mutations MUST log an `AuditEvent` via `AuditLogger`.
  - Use `@nyra/domain-models` for all type contracts.
  - Use `@nyra/integration-adapters` for all 3rd party SDK calls.
  - Follow `docs/ops/WORKER_ROUTING.md` for AI task assignment.

## Development Workflow

...
