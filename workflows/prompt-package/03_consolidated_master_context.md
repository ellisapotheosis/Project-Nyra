# 03 Consolidated Master Context


# Canonical Project Context

## Project family

Project Nyra / RateHunter / Project Apotheosis-adjacent AI infrastructure.

## Mission

Build a distributed AI mortgage operating system that combines lead capture, CRM, mortgage quoting, campaign automation, AI assistant workflows, local GPU inference, memory systems, and a unified broker command center. The platform should convert mortgage/real-estate leads into managed borrower journeys while giving Ellis a secure, high-leverage command layer over CRM, campaigns, quotes, agent tasks, and infrastructure.

## Business purpose

Nyra is intended to become a revenue-generating mortgage automation platform: ingest leads, normalize/contact them, quote them, nurture them for 45–60+ days, stop appropriately on replies/opt-outs, sync statuses to TwentyCRM, and surface all important work through a command-center webapp. It should reduce manual follow-up, improve response speed, and provide an AI-assisted operational layer for mortgage brokerage work.

## Core product surfaces

- Public RateHunter landing page and lead-capture funnel.
- Internal RateHunter/Nyra webapp command center.
- TwentyCRM as the CRM/system-of-record surface or linked CRM backend.
- Campaign builder and campaign status surfaces.
- Quote desk / quote engine surface.
- Agent/operator console for OpenClaw/Nerve/Paperclip/ClawTeam and infrastructure tools.
- Automation surfaces for n8n, Activepieces, Composio, Twilio, SendGrid, and webhooks.
- Memory/knowledge surfaces for Letta/Mem0/FalkorDB/Graphiti/OpenMemory-derived components, with final memory architecture treated as a conflict/default decision.

## Canonical production topology default

| Node | Role | Default services |
|---|---|---|
| `orchestrator` | Local CPU control plane / low-latency command center | OpenClaw gateways, Nerve UIs, ClawTeam server, LiteLLM, Nexus/Hive MCP gateway, WaveTerm/Zellij control, Cloudflared where local routing is required |
| `worker-rtx5090` | Heavy inference / coding / complex mortgage reasoning | vLLM OpenAI-compatible server, LMCache/Redis cache, ClawTeam node, optional voice/agent worker profile |
| `worker-rtx3090ti` | Secondary/steady inference / production agent workload | vLLM or Ollama endpoint, LMCache/Redis, ClawTeam node, lead parsing/normalization workload |
| `worker-rtx3060` | Utility GPU node | Embeddings, small Ollama models, STT/TTS/voice utilities, vector preprocessing, lightweight background tasks |
| `oracle-vps` | Always-on cloud plane / public webhooks / durable automation | n8n, Activepieces, Gitea, Letta/Mem0/FalkorDB/Postgres/Redis as selected, SearXNG, Browserless, Traefik/Nginx/Cloudflared, public webhook receiver |

## Critical implementation stance

The cleanest default is **split brain / split muscle**:

- UI, routing, orchestration, and durable public webhook endpoints live on CPU/cloud nodes.
- Raw GPU inference lives on GPU workers.
- Browser-facing apps talk to server-side APIs/proxies; secrets remain server-side.
- The webapp may embed or link specialist tools, but mortgage-critical workflows should eventually be broker-safe wrapper pages rather than raw admin UIs.
- UI/design specifics are intentionally quarantined from implementation until the Claude Desktop design pass is complete.



## Universal agent operating rules

- Treat this as a consolidated multi-agent project package, not a brainstorming note.
- Do not ask basic clarification questions. Make safe assumptions, document them, and continue.
- Prefer additive implementation: new files, overlays, wrappers, docs, interfaces, and tests before broad rewrites.
- Never hardcode secrets. Use Infisical, Vaultwarden, environment placeholders, or secret mounts.
- Never expose provider/API credentials to browser-side code.
- Keep visual UI/design decisions quarantined unless the prompt is explicitly in the UI quarantine folder.
- Preserve strict hostnames: `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Do not use the deprecated placeholder names `Titan` or `Atlas`.
- Do not implement Hermes containers unless a later explicit decision reverses the current final plan.
- Use vLLM/OpenAI-compatible endpoints for primary GPU inference and LiteLLM/Nexus/Hive-compatible routing where possible.
- Keep mortgage compliance constraints visible: rate/quote outputs are estimates, not binding commitments; opt-outs must be honored; borrower data must be protected.
- Use official/authorized CLIs and APIs only. Do not automate around access controls, metering, rate limits, or third-party terms of service.


## A. Project mission and strategic goals

Nyra should operate as a practical AI mortgage platform, not a toy. The implementation priority is revenue-facing reliability: leads get captured, contacts get created, borrowers are followed up with automatically, replies stop automation, statuses sync to CRM, quotes are generated consistently, and Ellis can see/control the entire system from one command center.

Strategic objectives:

- Replace manual lead follow-up with structured CRM + campaign automation.
- Consolidate lead, borrower, loan, quote, communication, and campaign state into one coherent system.
- Use local GPU inference where it saves cost and improves speed, with cloud fallback only where appropriate.
- Keep mortgage compliance and data protection visible at every layer.
- Make agent workflows inspectable and controllable rather than opaque.
- Build the system as modular services connected through APIs/MCP/webhooks, not as one brittle monolith.

## B. System architecture

Default architecture is hybrid cloud/local:

- Oracle VPS receives public webhooks and hosts always-on automation/state services.
- Orchestrator coordinates gateways, MCP routing, local operator tooling, and worker endpoints.
- GPU workers serve model endpoints; they should not waste VRAM on heavy UI containers.
- Webapp surfaces can embed/link specialist tools temporarily, but final broker workflows need app-native wrappers.
- Tailscale provides private mesh connectivity between nodes. Cloudflare/Cloudflared/Traefik/Nginx expose selected public or access-gated routes.

## C. Local hardware / network / infrastructure

Known/assumed nodes:

- `orchestrator`: MinisForum UM680 / Ryzen 7 6800H / Windows 11 + WSL2 + Docker. Limited RAM; low-latency local control plane.
- `worker-rtx5090`: heavy inference, coding, complex quote/mortgage reasoning, vLLM + LMCache.
- `worker-rtx3090ti`: steady production inference / secondary worker, vLLM/Ollama + LMCache.
- `worker-rtx3060`: utility node for embeddings, STT/TTS, small models, vector preprocessing.
- `oracle-vps`: Ubuntu cloud node with about 24GB RAM; durable public webhooks and automation.

Network defaults:

- Tailscale mesh across all nodes.
- Cloudflare/Cloudflared for `ratehunter.net` routes.
- Private service calls over Tailscale/LAN where possible.
- Public admin UIs should sit behind Cloudflare Zero Trust or equivalent access gate.

## D. Windows / WSL2 / Docker environment

- Prefer Windows/WSL2 commands and paths when writing implementation instructions.
- Use Docker Compose per host rather than one giant compose file.
- Use host networking where required for WSL2 GPU/vLLM performance, but document risk and alternatives.
- Use root Makefile targets to orchestrate deployment:
  - `make status`
  - `make health`
  - `make deploy-orch`
  - `make deploy-5090`
  - `make deploy-3090`
  - `make deploy-3060`
  - `make deploy-oracle`
  - `make swarm-up`
  - `make swarm-down`

## E. AI models / agents / routing

- OpenClaw is the model-agnostic local agent execution layer.
- Nerve is a UI/cockpit over OpenClaw sessions/gateways.
- ClawTeam coordinates worker agents; server default on orchestrator, nodes on GPU workers.
- LiteLLM/OpenRouter/cloud models act as routing/fallback layers where allowed.
- Nexus/Hive/Grafbase-style MCP router acts as the centralized tool gateway where practical.
- Tool search/fuzzy tool find should hide irrelevant tools to save context.
- Mortgage borrower-facing agents must not expose filesystem/dev tools.
- Coding agents may get repo/GitHub/Gitea tools but should not get borrower PII tools unless necessary.

## F. Memory systems

The source material conflicts on final memory choice. The safe default is tiered and profile-based:

- Durable system of record: Postgres/TwentyCRM for lead/contact/loan/quote/campaign data.
- Hot transient memory: Redis.
- Graph relationships: FalkorDB or Graphiti-backed graph layer.
- Vector/RAG archival: Postgres pgvector or approved vector store.
- Conversational/persona memory: Mem0/OpenMemory-derived layer where useful, but async/backgrounded to avoid blocking.
- Letta: optional/default-enabled memory manager agent and UI on Oracle or orchestrator, protected by Zero Trust. Do not make Letta the only durable system-of-record.

## G. Backend services

Core backend services:

- CRM API wrapper over TwentyCRM.
- Quote engine API.
- Template rendering service.
- Campaign/controller API.
- Unified inbox/event normalization API.
- MCP/router service.
- Agent gateway/proxy APIs.
- Health/status API for webapp command center.

## H. Databases / data model

Primary data concepts:

- Contact / borrower.
- Lead source and lead event.
- Loan scenario / loan file.
- Campaign enrollment.
- Communication log.
- Quote / quote option / viewed/sent status.
- Task/ticket/agent work item.
- Inbox event / reply event.
- Opt-out/suppression state.
- Integration health event.

## I. TwentyCRM / CRM system of record

TwentyCRM is the main CRM candidate. It must support mortgage-specific objects/fields and must be wrapped by a shared API client so other services do not each invent their own CRM integration.

Required custom objects/fields from sources:

- Loan / loan scenario with property value, loan amount, LTV, program, status, borrower/contact relation.
- CampaignEnrollment with campaign name/type, current step, status, stop reason, active/inactive, timestamps.
- CommunicationLog with channel, provider, direction, body/summary, provider message ID, related lead/loan/campaign.
- Quote with three-option matrix, sent/viewed timestamps, scenario metadata.
- Contact extensions for borrower fields, lead source, consent, status, FICO-ish input if collected, timeline/notes.

## J. Lead ingestion

Lead ingestion sources include landing page, inbound email/LeadMailbox, ads, manual CRM entry, webhook/API payloads, and future provider integrations.

Default ingestion flow:

1. Receive inbound lead event.
2. Validate fields.
3. Normalize borrower/contact data.
4. Deduplicate by phone/email and possibly address.
5. Create/update Contact and Loan/Lead objects.
6. Record source and raw event metadata.
7. Enroll into default campaign if allowed.
8. Trigger quote generation when sufficient scenario inputs exist.
9. Notify Ellis for high-priority or ambiguous cases.

## K. Mortgage quote API / Excel parity

Quote engine must be deterministic and defensive. It should not rely on LLM math.

Minimum API:

- `GET /health`
- `POST /api/v1/quote`
- `POST /api/quotes/generate`
- Optional quote PDF/export endpoint.

Minimum inputs:

- propertyValue
- downPayment or loanAmount
- baseInterestRate
- termYears
- annualTaxes
- annualInsurance
- monthlyHoa
- program/type where known

Minimum outputs:

- principal
- LTV
- final interest rate
- monthly P&I
- monthly taxes/insurance/HOA
- estimated PMI if applicable
- total monthly payment
- total interest over life
- three-option comparison: standard, buydown, lender credit

LLMs may format/explain quotes, but all arithmetic must come from the quote API.

## L. Campaign automation

Canonical campaign logic:

- 7-day new lead nurture campaign.
- 30-day pre-approval follow-up.
- Application-in-progress weekly follow-up.
- 12-month post-close review/referral/anniversary campaign.
- Rate alert / market improvement campaign.
- 21-day re-engagement campaign.
- 45–60 day mortgage drip expansion.

Non-negotiable stop conditions:

- Lead replies to any message.
- Lead texts STOP/unsubscribe.
- Lead status changes to qualified/pre-approved/application/closed as appropriate.
- Compliance or consent state disallows outreach.
- Manual pause/resume/kill switch by Ellis.

## M. Twilio / SMS

Twilio handles SMS and possibly voice/ringless/phone integrations later. SMS must respect opt-out semantics. Incoming replies must normalize into unified inbox/events, update CRM, and pause campaigns. Message templates should be short and personalized but not deceptive or over-promissory.

## N. SendGrid / Email

SendGrid handles email campaigns and transactional messages. Templates should use MJML/Handlebars or equivalent. Email events should track sent/delivered/open/click/bounce/unsubscribe where available. Email unsubscribe events must update suppression state and campaign enrollment.

## O. n8n / Activepieces / Composio workflows

Default division:

- n8n: heavier mortgage drip logic, data transformations, dynamic campaign engine, complex branching, custom webhook endpoints.
- Activepieces: simpler trigger/action automations, SaaS integrations, quick alerts, embedded low-code automation UI.
- Composio: external SaaS action bridge/MCP where useful, especially if it reduces OAuth/custom connector burden.

Custom campaign builder should eventually write JSON configuration to a backend/n8n webhook rather than exposing raw n8n graph editing to daily users.

## P. Admin portal behavior

Nonvisual app behavior to preserve:

- Dashboard/overview with lead queue, tasks, campaign timeline, quote desk preview, CRM sync health, service status, and quick actions.
- Leads/cockpit with source, score, status, last communication, next action, quote eligibility.
- Campaigns with enrollments, stop reasons, response metrics, pause/resume/kill switch.
- Quote desk with quote generation, recent quotes, export/send/viewed status.
- Tools/integrations hub for n8n, Activepieces, Twenty, OpenClaw/Nerve, Nexus/Hive, Letta/Mem0, Gitea, Grafana/observability, Paperclip, Portainer if present.
- Agent/operator console for internal use only.

Visual layout, colors, R3F, glassmorphism, typography, and exact component choices are quarantined.

## Q. Auth / security / secrets

- Use Infisical/Vaultwarden/secret mounts; never commit secrets.
- Admin/tool UIs behind Cloudflare Zero Trust, Tailscale, or both.
- Browser talks to server-side proxy routes, not directly to internal services with secrets.
- No provider keys in frontend bundles.
- Mortgage PII must stay in approved databases and logs must avoid sensitive raw payloads.
- AI agents receive least-privilege tools based on role.
- All campaign sends should be auditable.

## R. APIs / webhooks / contracts

Important endpoints/contracts from sources:

- `POST /api/leads` — create/update contact and auto-enroll if allowed.
- `POST /api/leads/:id/quote` — trigger quote generation.
- `POST /api/templates/render` — render email/SMS templates.
- `POST /api/v1/quote` — defensive quote API.
- n8n campaign update webhook: `https://n8n.ratehunter.net/webhook/update-campaign`.
- n8n save campaign webhook: `https://n8n.ratehunter.net/webhook/save-campaign`.
- Nexus MCP SSE endpoint pattern: `/mcp/sse` protected by bearer token.

## S. Repo structure / file paths

Common planned paths:

```text
/infra/hosts/orchestrator/docker-compose.yml
/infra/hosts/worker-rtx5090/docker-compose.gpu.yml
/infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml
/infra/hosts/worker-rtx3060/docker-compose.gpu.yml
/infra/hosts/oracle-vps/docker-compose.yml
/services/quote-engine/
/services/crm-api/
/services/template-engine/
/apps/webapp/
/apps/landing/ratehunter-landing/
/apps/guidance/master-guidance/
```

## T. Environment variables

See `08_env_vars_and_secrets_register.md`.

## U. DevOps / deployment

- Use per-host compose files and Makefile targets.
- Add health checks and status outputs.
- Document Cloudflare tunnel/subdomain map.
- Include Gitea local mirror and AI reviewer if selected.
- Validate `.gitmodules` before Cloudflare Pages builds; missing submodule URLs are known failure mode.

## V. Testing / validation

Required categories:

- Service health checks.
- API contract tests.
- Quote math deterministic tests and Excel parity tests.
- Campaign stop-condition tests.
- Twilio/SendGrid sandbox tests.
- CRM object CRUD tests.
- Docker compose config validation.
- Secret exposure scans.
- Browser/server boundary tests.

## W. Observability / logging

- Structured logs per service.
- Sentry or equivalent error capture.
- Sentry-to-Paperclip ticket creation is a high-value automation.
- Langfuse/Phoenix/OpenTelemetry for LLM tracing where feasible.
- Hive/Grafbase telemetry headers for MCP/router tracing where applicable.
- Webapp service status indicators should use real health APIs.

## X. Agent orchestration

- Category prompts should be dispatched to specialized agents.
- Parallel-safe work: quote engine, CRM client, WaveTerm configs, Gitea setup, UI quarantine, docs.
- Sequential dependencies: infra inventory before deployment; CRM objects before campaigns; quote engine before quote-driven drip messages; auth/secrets before exposing admin UIs.

## Y. Prompting / memory strategy

- Use large category prompts, not micro-prompts.
- Each agent must produce a completion report: files changed, commands run, tests run, assumptions, issues, recommended next prompt.
- Codex/Codex CLI memory should ingest canonical context and conflicts first, then category prompts.
- UI/design material must remain separate until final design decision package exists.

## Z. Business rules / compliance / edge cases

- Rate quotes are estimates unless reviewed/locked through appropriate lender process.
- Credit/borrower sensitive data handling must be conservative.
- STOP/unsubscribe means stop all automated outreach immediately.
- Replies should pause campaigns and notify Ellis/human owner.
- Lead status changes can transition/pause campaigns automatically.
- Agent-facing tools must not send borrower messages without explicit workflow rules.
