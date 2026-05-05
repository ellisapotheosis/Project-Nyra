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
- Quote API
- Campaign Engine
- Mem0
- Cloudflared Tunnel (Public Ingress)

#### Oracle-VPS (Cloud)
- Twenty CRM (System of Record)
- Gitea
- Activepieces
- Qdrant / FalkorDB
- Mem0

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
broker/customer webapp
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
apps/admin
Build the operator/admin portal with:
dashboard
lead list/detail
campaign management
quote management
communications timeline
compliance controls
assistant tooling panel
provider/settings pages
apps/webapp
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
webapp integrates the OpenClaw chat surface
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
`nyra.ratehunter.net`
`api.ratehunter.net`
`hooks.ratehunter.net`
Access-gated
`gitea.ratehunter.net`
`twenty.ratehunter.net`
`n8n.ratehunter.net`
`grafana.ratehunter.net`
`bot.ratehunter.net`
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
apps/admin
Internal operator/admin UI.
apps/webapp
Broker/customer web application.
apps/landing
Marketing and lead capture.
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
