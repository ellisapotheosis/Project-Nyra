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

- `apps/projectnyra-landing` → (projectnyra.com) Public 3D Project Nyra landing page.
- `apps/projectnyra` → (app.projectnyra.com) Primary broker/customer webapp and operations command hub.
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

# [project-nyra] recent context, 2026-07-17 10:45am PDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 50 obs (17,958t read) | 935,336t work | 98% savings

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

S28 Investigate and fix Syncthing device connectivity issues in the Nyra infrastructure cluster; establish working bidirectional sync between orchestrator and 3 GPU worker nodes (May 31, 6:56 AM)

### Jul 17, 2026

1915 1:21a 🔵 Docker Compose config validation caught DNS name used as IP address; non-critical configuration issue
1916 " 🔵 Root cause of docker-compose validation error: ORACLE_TAILSCALE_IP set to DNS hostname instead of IP
1917 " ✅ Infisical secret corrected: ORACLE_TAILSCALE_IP set to IP address 100.64.0.3
1918 1:22a 🟣 Docker Compose validation now passes with corrected Infisical secrets
1919 " 🟣 Infrastructure repair completed end-to-end; 364 validated secrets deployed to oracle-vps
1920 " 🟣 Remote infrastructure validation complete; critical services healthy and operational
1926 2:27a 🔵 Oracle Tailscale IP hardcoded as 100.64.0.3 throughout codebase
1927 " 🔵 Tailscale IP address mismatch for oracle-vps across documentation
1928 " 🔵 Current WSL Tailscale endpoint hostname differs from requested configuration
1929 2:29a ✅ Documentation cleanup begun on oracle setup and repair scripts
1930 " ✅ Bulk oracle documentation standardization: IP and path consolidated to 100.64.0.3 and /hosts/oracle-vps
1931 " 🔵 Oracle documentation cleanup incomplete: bulk-replace failed silently on critical files
1932 2:30a ✅ Oracle documentation standardization completed successfully across 39+ files
1933 " ✅ Oracle documentation cleanup finalized: Gitea configs standardized to 100.64.0.3, public routing preserved
1934 2:31a ✅ Oracle documentation standardization completed: All problematic references eliminated
1935 " ✅ Oracle infrastructure cleanup committed: 40 files standardized with 228 insertions across all layers
1936 " ✅ Oracle Caddyfile standardized for internal Tailscale routing with 100.64.0.3 IP hostnames
1937 " ✅ Caddyfile monitoring hostnames standardized to public domains for HTTPS termination
1938 2:32a ✅ Oracle infrastructure cleanup COMPLETE: Zero problematic references remaining, all validations passing
1939 " 🔵 Oracle cleanup verification: Remaining references only in archived/reference directories (acceptable)
1940 " ✅ Oracle cleanup extended to archived directories: ALL problematic patterns eliminated from entire codebase
1941 2:33a ✅ Oracle infrastructure cleanup FINALIZED: 46 files standardized, zero problematic patterns globally
1942 2:38a ✅ Tailscale hostname changed from MiniApotheosis-wsl to orchestrator-wsl
1943 2:39a 🔵 Hostname Strategy Clarified: Windows Default, -win Suffixes Remain
1944 " 🔵 Tailscale Cluster DNS State Inventory
1945 " ✅ Cloudflare A Record Created for orchestrator-wsl.projectnyra.com
1946 " ✅ HOSTNAME_CONFIG.md Updated with Current Tailscale Topology
1947 2:50a 🔵 DNS Resolution Dual-Path for orchestrator-wsl: Public Cloudflare vs. Tailscale Internal
1948 " ✅ Config Files: -win Suffix Removal & IP Updates (Partially Incorrect)
1949 " ✅ Orchestrator IP Assignment Error: 100.64.0.10 vs. Required 100.64.0.1
1950 " 🔵 Tailscale Cluster Topology: Actual IPs Verified, orchestrator-wsl on Separate Range
1951 6:29a 🔵 Cloudflare platform overview and product decision trees reviewed
1952 " 🔵 Project Nyra Cloudflare infrastructure context: R2, disclosure files, and Access target apps identified
1953 6:30a 🔵 Cloudflare infrastructure context and credentials available; Project Nyra has established tunnel and Pages setup
1954 " 🔵 Extensive Cloudflare and Infisical integration established across Project Nyra infrastructure
1955 " 🔵 Cloudflare Access policy automation infrastructure: two approaches (API + browser), existing app definitions missing Nyra Personal/Family/Agents/DASH
1956 6:31a 🔵 Cloudflare Access policies "Nyra Agents", "Nyra Family", "Nyra Owner" already deployed to 40+ apps; no "Nyra Personal" policy found yet; DASH app not yet identified
1957 " 🔵 Policies are reusable account-level resources; cannot update via app endpoint; need account-level policy update
1958 6:32a 🔵 Account-level policy endpoint path identified: /accounts/{id}/access/policies/{policy_id}
1959 " 🔵 Verified: correct account-level policy endpoint is /accounts/{id}/access/policies/{policy_id}
1960 " 🔵 Account-level reusable policy structure verified; Nyra Owner applied to 32 apps
1961 6:33a ✅ Nyra Owner policy successfully renamed to Nyra Personal via account-level PUT endpoint
1962 " 🔵 Policy rename incomplete: 32 apps auto-updated, 7 apps still reference old policy names; DASH app not yet identified in 39-app list
1963 " 🔵 Two policy types coexist: reusable (32 apps, auto-updated) vs non-reusable per-app policies (5 apps, manual update needed)
1964 " 🔵 MCP-Gateway payload prepared with three reusable policies (Agents, Family, Personal) at precedences 1/2/3
1965 6:34a ✅ MCP-Gateway successfully updated with three reusable policies (Agents, Family, Personal)
1966 " ✅ Batch update: 3/4 drifted apps transitioned to reusable policies; nexus-router requires destinations field
1967 6:35a ✅ nexus-router successfully updated with reusable policies; transitioned from non-reusable Nyra Owner to Personal/Family/Agents
1968 " 🔵 Final validation: 35/35 non-dashboard apps have Personal/Family/Agents policies; 4 dashboard exceptions identified as DASH equivalent
1969 " ✅ Access policy configuration complete; 30 API artifacts generated and validated in infra/cloudflare/apply-results/access-groups-20260717

Access 935k tokens of past work via get_observations([IDs]) or mem-search skill.
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

## Evidence-based skill progression

Telemetry through 2026-07-18 supports exactly three advanced progression vectors for work in `/apps` and `/infra`. The dated PR observations below are historical examples; re-check current branch rules, workflow definitions, and provider status before applying them to a new change. In this section, a **boundary** is an independently reviewable application, deployment target, or recovery slice with its own build and verification contract; **preview preflight** is the repository check that validates that contract before provider deployment; **OIDC** is the short-lived identity handoff from CI to an identity, secrets, or deployment provider; and **automated reviewers** are the Sourcery, Greptile, and CodeRabbit PR review bots.

### 1. Provenance-aware recovery and review-budget decomposition

**Target.** Recover only traceable source material into the configured app root, in slices small enough for the available reviewers and automation.

**Evidence.**

- [PR #742](https://github.com/ellisapotheosis/Project-Nyra/pull/742) restored 460 files and 76,629 additions, including a candidate `apps/projectnyra/src/app` tree.
- [PR #743](https://github.com/ellisapotheosis/Project-Nyra/pull/743) immediately removed overlapping files from that candidate root, moved the application surface back under the canonical `apps/projectnyra/app`, `components`, and `lib` roots, and removed embedded `.omc/state` runtime artifacts. Its preview preflight then failed on unresolved imports including `./rateLimit`, `@/lib/campaign-contract`, `@/lib/api/rateLimit`, and `@/lib/privacy/redaction`.
- Automated review exceeded its practical capacity: Sourcery could not fetch PR #742's 460-file diff and rejected PR #743 for exceeding its diff-character limit. [PR #766](https://github.com/ellisapotheosis/Project-Nyra/pull/766) and [PR #767](https://github.com/ellisapotheosis/Project-Nyra/pull/767) repeated the pattern: 566- and 584-file integrations exceeded Sourcery's 300-file API limit, Greptile's 100-file limit, and CodeRabbit's 150-file limit.
- [PR #769](https://github.com/ellisapotheosis/Project-Nyra/pull/769) combined five CI/workflow files, eleven service Dockerfiles, test-harness configuration, and CRDT, cache, and monitoring changes in one 33-file “CI failures” change. CodeRabbit was rate-limited, while Sourcery found a nonexistent `mergeVectorClock` call and inconsistent 0-1 versus 0-100 utilization units in the same review.
- [PR #770](https://github.com/ellisapotheosis/Project-Nyra/pull/770) mixed infra and secret-path changes with 123 `.omc` memory, session, checkpoint, and state files in a 165-file, +19,589/-10,639 sync. Greptile rejected the 165-file diff against its 100-file limit, Sourcery could not fetch it, CodeRabbit's review failed, and no substantive review comment was recorded before merge.
- [PR #772](https://github.com/ellisapotheosis/Project-Nyra/pull/772) was smaller at 76 files but still strained reviewer capacity: Sourcery reported its 500,000-diff-character weekly limit, CodeRabbit first reported its PR review limit and later failed, and Greptile produced its route-drift finding only after repeated retriggers. File-count compliance alone therefore does not reserve enough review budget for an integration PR.

**Practice.**

- Inventory every candidate path against the target boundary's source of truth before restoring a stash, archive, or orphaned commit: for an app, use its `next.config.*`, `tsconfig.json`, workspace manifest, and current app root; for infra, use `infra/COMPOSE_SOURCE_OF_TRUTH.md`, the owning `infra/hosts/<host-name>` configuration, and `scripts/ci/validate-infra.sh`.
- Recover one boundary at a time, record the source commit or blob in the PR, and reject `.omc`, cache, generated, and other runtime-state files.
- Run `git diff --stat` and `git diff --name-only`, then look up the affected package or host in the deployment matrix and execute its validation command before opening the PR; for app boundaries use the matrix-defined build command (e.g., `pnpm --filter <package> build`) and for infra boundaries run `bash scripts/ci/validate-infra.sh`.
- Split recovery work whenever a boundary would exceed reviewer file, diff, or account-level review limits; reserve capacity for a final-head rerun after fixes.

**Graduation criteria.** For the next three recovery slices that are actually required, preserve the canonical target root, record source provenance, exclude runtime-state artifacts, avoid follow-up path relocation, and produce a green boundary-specific validation result: an affected-package build for an app slice or `bash scripts/ci/validate-infra.sh` for an infra slice.

### 2. Required-check release governance and asynchronous merge lifecycle ownership

**Target.** Own each PR until its defined checks and review threads finish, and separate baseline failures from change-attributable failures before merging.

**Evidence.**

- PR #742 merged 21 seconds after creation and PR #743 merged 13 seconds after creation; both accumulated failures after merge. PR #743's CodeRabbit review then reported that review failed because the PR was already closed.
- PR #743 subsequently showed failures in preview preflight, `Build & Deploy`, `crm-api`, `twenty-mcp-jezweb`, Cloudflare Pages, and Vercel, while the repository's `main` rules required thread resolution but did not require status checks.
- The next Dependabot series, [PR #744](https://github.com/ellisapotheosis/Project-Nyra/pull/744) through [PR #763](https://github.com/ellisapotheosis/Project-Nyra/pull/763), repeated zero-review closures and a shared `validate-compose-gitea-infisical` failure caused by `infra/mcp-gateway/nexus-router-docker-compose.yml` living outside `infra/hosts/*`.
- PR #766 merged 26 seconds after creation with failed repository-policy, Docker, Cloudflare, and Vercel checks. PR #767 merged after 60 seconds with the same failure classes; its repository CI workflow's lint, test, security, and build jobs were skipped while CircleCI lint, test, and typecheck passed.
- PR #769 repeated that split-gate state before merge: CircleCI lint, test, and typecheck passed, but repository CI lint, test, security, and build were skipped while `actionlint`, `validate-compose-gitea-infisical`, Docker builds, all three Cloudflare previews, and Vercel failed.
- PR #770 merged with an unchecked tunnel-authentication test-plan item after `validate-compose-gitea-infisical`, Docker detection/completion, CircleCI lint, all three Cloudflare previews, and Vercel had already failed; repository CI lint, test, security, and build were skipped, and the CircleCI workflow was still in progress.
- [PR #768](https://github.com/ellisapotheosis/Project-Nyra/pull/768) merged with Greptile's non-outdated P1 on `scripts/ci/test-repository-policy.sh:33` still unresolved: the policy test accepted `APP_DIR: apps/ratehunter/landing` while validating the old `apps/ratehunter` root, allowing deployment preflight to skip a missing app directory without failing repository policy.
- PR #772 merged at 21:41 UTC before its exact-head provider checks finished. Vercel ultimately failed, followed by `projectnyra-app` and `projectnyra-nexus` Cloudflare Pages failures at 21:47 and 21:48; Greptile had also reported desired-versus-generated route drift. A successful repository-policy check therefore did not establish release readiness.

**Practice.**

- Define an `/apps` and `/infra` merge gate comprising preview preflight, the target-app build, the relevant provider preview, scoped container builds, and completed review threads. Until `scripts/github/review-and-merge-prs.sh` enforces every check conclusion, treat the preview, build, provider, and container portions as manual gates in addition to its automated metadata and review-thread checks.
- Use `gh pr checks --watch` until every required check passes (not merely reaches a terminal state). A failed required check blocks merge even when it also fails on the base SHA; keep that baseline failure blocked until it is resolved in a separate change or formally waived by the repository owner. A missing conclusion, skipped result, or neutral required check is also a blocker unless the repository's documented policy explicitly permits it.
- Before an auto-PR or deployment workflow fetches a base or source ref, prove that the configured branch exists in the remote; PR #769's auto-PR job mapped `fix/*` to a missing `develop` branch.
- Compare failures with the base SHA before assigning causality. Treat skipped or neutral required checks as blockers unless the repository's documented policy explicitly permits that conclusion; record permitted skips or neutral results in the PR before merge.
- Merge only after automated and human feedback is complete. Treat a repository-owned baseline failure as a tracked blocker, not as evidence that an unrelated dependency change caused it.

**Graduation criteria.** Land three consecutive `/apps` or `/infra` PRs only after the defined gates and review threads complete, with no change-attributable post-merge failure and an explicit base-versus-change attribution for every failed check.

### 3. App-to-deployment contract parity and cross-provider failure forensics

**Target.** Make local, preflight, and provider execution use one app contract, then diagnose failures at the exact boundary where that contract breaks.

**Evidence.**

- In PR #743, CircleCI lint, test, and typecheck passed while preview preflight and deploy checks failed. The RateHunter OpenNext workflow completed its Cloudflare build and uploaded `.open-next`, but deployment failed with GitHub API status 422 because no ref remained for the already merged and closed recovery branch.
- A separate `Build & Deploy` workflow on PR #743 failed earlier during Infisical OIDC secret retrieval and its `build:cf` path.
- In PR #742, six RateHunter tests passed while both the OpenNext Cloudflare build and fallback Next.js build exited nonzero, and the workflow hid diagnostic output with `2>/dev/null`.
- PRs #766 and #767 both failed `Build crm-api` because the Docker build contract referenced missing `/packages/crm-types/tsconfig.json`, while their Cloudflare app, landing, and Nexus previews and Vercel checks also failed.
- PR #769 attempted Dockerfile repairs across eleven service images plus broader CI workflow repairs, yet twelve scoped image builds still failed alongside the app, landing, and Nexus Cloudflare previews and Vercel. That change confirms that editing container paths without proving the repository-policy, build-context, and provider contracts together does not restore release readiness.
- PR #770 changed Cloudflared tunnel-token handling but left its sole PR test-plan item unchecked; the same PR failed Docker detection, infra validation, every Cloudflare app preview, Vercel, and CircleCI lint. Because those boundaries failed together and provider logs were not captured in the PR, the telemetry proves missing end-to-end contract evidence but does not support assigning one shared root cause.
- PR #772's merged `scripts/deploy-cloudflare-pages.js` still called `deployProject(..., "apps/nexusUI", ...)` even though that target was absent from the active workspace; the corresponding `projectnyra-nexus` Cloudflare Pages preview later failed. The review thread was marked resolved, so thread state alone did not prove that the deployed path matched the workspace contract.
- PR #772 exposed desired-versus-generated drift inside one infra delivery path: `infra/cloudflare/desired-state/exposure-matrix.yml` and `infra/cloudflare/generated-local/oracle/cloudflared.yml` contained `agent-vault.projectnyra.com`, `infisical.projectnyra.com`, and `letta.projectnyra.com`, while `infra/cloudflare/generated-remote/oracle-tunnel.config.payload.json` omitted them. In a separate live health-probe contradiction, Greptile reproduced `scripts/verify-supabase.sh` receiving HTTP 403 with `cf-mitigated: challenge` from `/auth/v1/health`, contradicting the PR documentation's HTTP 200 claim.
- Together, these failures show that package validation, repository preflight, container context, and provider execution are not exercising the same contract or ref lifecycle.

**Practice.**

- Maintain a per-app deployment matrix covering the package script, exact build command, output directory, provider project, OIDC or secret source, workflow, and owning host under `infra/hosts/*`.
- For every changed service image, record and test the exact `{Dockerfile, build context, COPY source}` tuple from the Docker matrix; PR #769's repository-relative `COPY services/...` repairs still failed when the workflow context did not contain those paths.
- Make local validation, preview preflight, container builds, and provider jobs call the same script and consume the same output.
- Generate remote provider payloads from the reviewed desired state, diff generated-local and generated-remote host inventories before apply, and run machine-authenticated health probes through the same Cloudflare policy path used by CI.
- Never suppress build stderr, and correlate each failure to the exact commit SHA.
- Classify failures as repository build, container context, ref lifecycle, auth handoff, provider configuration, or provider runtime before changing code.

**Graduation criteria.** Establish matching local/preflight/provider contracts for `projectnyra` and `ratehunter`; prove generated-local and generated-remote route parity for three consecutive Cloudflare changes; use non-production fixtures or dry runs to prove that build, ref, auth, configuration, and runtime failures are classified correctly; retain the check URL or relevant log for each result; and produce green previews from the same commands documented in the matrix.

<!-- TODO: Awaiting further telemetry on closed /apps and /infra issues -->
