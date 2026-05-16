# Project Nyra Prompt Package

Generated from the uploaded `BIG_Prompt_Condense(1).7z` archive.

## What this package is

This is a consolidated multi-agent prompting package created from 23 uploaded text/markdown source files. It converts scattered conversations, planning notes, agent prompts, infrastructure ideas, implementation details, and UI/design notes into large category-specific prompts designed to keep a capable agent working for 25+ minutes without constant micro-prompting.

## How to use

1. Start with `10_agent_handoff_notes.md`.
2. Read `02_canonical_project_context.md`.
3. Send category prompts from `05_category_prompts/` in the dispatch order from `09_dispatch_order.md`.
4. Keep `06_ui_design_quarantine/` separate until UI/design decisions are finalized in Claude Desktop or a design-focused agent.
5. Use `07_conflicts_and_missing_info.md` before destructive implementation.
6. Use `08_env_vars_and_secrets_register.md` when writing `.env`, Infisical, Docker Compose, or CI/CD configs.

## Strong recommendation

Use these prompts as **work orders**, not chatty requests. Each one includes mission, context, tasks, outputs, acceptance criteria, and completion report format.

## Agent mode note

For this consolidation task, normal file-processing mode was enough. Agent Mode would be better for a later phase where you want the system to actually inspect the live GitHub/Vercel state, modify repo files, create branches, run builds/tests, inspect deployment logs, and push PRs. This package did not modify your repo or Vercel deployment.

## Package tree

```text
prompt-package/
├─ README.md
├─ 00_executive_summary.md
├─ 01_source_map.md
├─ 02_canonical_project_context.md
├─ 03_consolidated_master_context.md
├─ 04_task_category_matrix.md
├─ 05_category_prompts/
├─ 06_ui_design_quarantine/
├─ 07_conflicts_and_missing_info.md
├─ 08_env_vars_and_secrets_register.md
├─ 09_dispatch_order.md
├─ 10_agent_handoff_notes.md
├─ MASTER_PROMPT_PACKAGE.md
└─ 99_raw_source_inventory/
```

## Non-negotiables


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



# 00 Executive Summary

## Processing result

- Source files processed: **23**.
- Major source clusters detected: **10**.
- UI/design content found: **yes**; quarantined into `06_ui_design_quarantine/`.
- Meaningful conflicts found: **yes**; see `07_conflicts_and_missing_info.md`.
- Implementation-critical missing info found: **yes**, but safe defaults are provided.
- Live repo/Vercel changes made: **none**.

## Major clusters discovered

1. Distributed infrastructure: orchestrator, worker GPUs, Oracle VPS, Tailscale, Cloudflare/Cloudflared, Traefik/Nginx, Docker Compose, Makefile.
2. AI/agent stack: OpenClaw, Nerve, ClawTeam, Paperclip, LiteLLM, Nexus/Hive/Grafbase, MCP, OpenRouter/cloud fallback, vLLM/Ollama.
3. Memory stack: Letta, Letta MCP, Mem0/OpenMemory, FalkorDB, Graphiti, Redis, pgvector, mcp-memory-service.
4. CRM and mortgage operations: TwentyCRM, LeadMailbox, LendingPad, contacts, loans, campaign enrollments, quote records, pipeline stages.
5. Comms and campaigns: Twilio, SendGrid, n8n, Activepieces, templates, opt-out/STOP handling, 45–60 day nurture logic.
6. Quote engine: TypeScript/Node stateless service, Zod validation, amortization math, 3-option quote comparison, PDF/export path.
7. Dev/operator tooling: WaveTerm, Zellij, Gitea, AI reviewer, Infisical, Sentry/Paperclip, Browserless, SearXNG, local dashboards.
8. App consolidation: landing, webapp, admin app, mortgage CRM app, Nexus UI, Twenty shell, legacy HTML prototype.
9. UI/design: shadcn/TweakCN, R3F, terminal maximalism, command deck, campaign builder visuals, landing visual finish line.
10. Prompting/orchestration strategy: category prompts, Codex/Codex CLI memory chunks, multi-agent dispatch, source maps, conflict registers.

## Recommended dispatch order

1. `prompt_01_foundation_repo_environment_architecture.md`
2. `prompt_02_ai_agents_routing_memory.md`
3. `prompt_03_crm_twentycrm_lead_ingestion.md`
4. `prompt_04_mortgage_quote_engine.md`
5. `prompt_05_comms_campaigns_twilio_sendgrid.md`
6. `prompt_06_workflow_automation_n8n_activepieces_composio.md`
7. `prompt_07_backend_apis_webhooks_contracts.md`
8. `prompt_08_auth_security_secrets_compliance.md`
9. `prompt_09_admin_portal_behavior_non_ui.md`
10. `prompt_10_devops_gitea_waveterm_operator_tooling.md`
11. `prompt_11_testing_observability_deployment_hardening.md`
12. `prompt_12_final_integration_synthesis.md`

UI/design should run separately using `06_ui_design_quarantine/claude_desktop_ui_decision_prompt.md`.


# 01 Source Map

|Source ID|File|Size|Likely topic|Useful extracted content|UI/design present?|Implementation relevance|
|---|---|---|---|---|---|---|
|SRC-001|ABSOLUTE_PROMPTING_PLAN.md|46312 bytes / 1250 lines|Top-to-bottom execution playbook|Infrastructure validation, Tailscale/Cloudflare mapping, TwentyCRM deployment/custom objects, CRM API client, Activepieces, template engine, OpenClaw/MoltBot, voice scaffolding, drip campaigns, quote engine, landing, conversation hub, testing, monitoring, Archon task tracking. Strong implementation relevance.|yes|high|
|SRC-002|am i able to use the new grafbasene.txt|128640 bytes / 1717 lines|Large Grafbase/Nexus/Hive + Letta convo|Current Nexus/Hive resources, Hive router migration, Letta MCP, OpenMemory/Mem0 improvements, WaveTerm bridge, subscription proxy snippets, unified Gateway/Memory/Automation prompts.|mixed|high|
|SRC-003|am i able to use the new grafbasene2222.txt|27179 bytes / 341 lines|Follow-up Nexus/Hive/Letta prompting|Expanded router/memory/composio/waveterm details, cloud/edge deployment, gateway config, advanced features, autonomous lifecycle.|mixed|high|
|SRC-004|am i able to use the new grafbasene3333.txt|9277 bytes / 111 lines|Condensed Nexus/Hive migration prompt|Key resources/URLs and prompt for migrating Oracle-hosted Nexus stack to Hive-integrated Grafbase ecosystem with cognitive mapping and validation.|mixed|high|
|SRC-005|Based on the ratehunter-landing dep.txt|6943 bytes / 101 lines|Cloudflare build issue + infra placement|Fix .gitmodules submodule URL for external/openclaw-n8n-stack. Assign Paperclip/SearXNG/Browserless to Oracle, ClawTeam/Zellij/llxprt to orchestrator, 3060 to embeddings/TTS. Adds Makefile, WaveTerm, Zellij, Sentry-to-Paperclip, Gitea, Langfuse ideas.|mixed|high|
|SRC-006|composes-gemini.txt|13342 bytes / 342 lines|Quote engine code + converged stack|Node/TypeScript quote engine with Zod validation, mortgageMath, /api/v1/quote, Dockerfile, test curl. Also contains alternate final stack: Oracle system-of-record, Orchestrator as traffic cop, GPU workers, tiered memory, Nexus as main MCP.|mixed|high|
|SRC-007|composio_wave_letta.txt|57801 bytes / 909 lines|Composio/Wave/Letta/voice mesh|Composio as external MCP/action bridge, Letta-MCP Rust build, WaveTerm/Zellij master config, Kyutai Unmute base and mesh overrides, Makefile targets, authentication notes, two-worker prompt split.|mixed|high|
|SRC-008|Conversation with Gemini.txt|49067 bytes / 633 lines|Grafbase/Nexus/Hive + Letta + Wave snippets|Nexus/Hive router migration, Letta MCP, OpenMemory/Mem0 async, mcp-memory-service, Graphiti/RuVector, WaveTerm command bridge, subscription CLI proxy concepts, LendingPad/LeadMailbox, FRED/MBS market sniper, autonomous PR loop.|mixed|high|
|SRC-009|CRM-And-Drip-Future-Iterations-n-Features.md|78934 bytes / 235 lines|Mortgage CRM product blueprint|Agent Legend/Bonzo-inspired multi-channel campaigns, power dialer, lead/contact management, loan pipeline automation, integrations, analytics, ad intake, AI lead scoring, personal assistant, workflow automation, UI, compliance, cost/stack selections.|mixed|high|
|SRC-010|gitea-setup.txt|54482 bytes / 855 lines|Gitea local mirror + AI reviewer|Gitea docker compose, root URL/ports, actions runner, webhook to AI reviewer, Infisical secrets, pre-clone checklist, troubleshooting, local mirror flow.|mixed|high|
|SRC-011|N8N-AP_PROMPTING_CONVO_GEMINI.md|55950 bytes / 710 lines|Nerve/OpenClaw/n8n/Activepieces architecture|Nerve as UI cockpit, OpenClaw gateways, split-brain topology, Oracle vs orchestrator placement, custom campaign builder, iframe strategy, unified inbox, n8n heavy logic, Activepieces quick triggers, UI aesthetic notes.|mixed|high|
|SRC-012|nexus-hive_letta_overhaul_apps_crm.txt|120129 bytes / 1613 lines|Unclassified source|Source requires manual review.|mixed|high|
|SRC-013|now write me an all in one prompt t.txt|3095 bytes / 51 lines|Condensed three-snippet prompt|Gateway/Hive migration, secret staging, observability, Letta master memory, OpenClaw orchestration, Kyutai voice, mcp-memory-service, mortgage logic.|mixed|high|
|SRC-014|PLAN.md|9744 bytes / 98 lines|Master guidance rebuild plan|apps/guidance/master-guidance documentation plan; canonical app ownership; landing/webapp/Twenty/nexus/source-material decisions; screenshot/source audit; route blueprints; component harvest matrix. Mostly UI/design guidance and repo-doc prompts.|yes|high|
|SRC-015|Role Act as a Senior DevOps Archite.txt|12943 bytes / 337 lines|OpenClaw subsystem MVP prompt|Additive compose overlays, cloud-backed MVP, Mem0 cloud integration, Kyutai Unmute optional voice profile, internal operator UI, channel/skill operations, docs, hardening, future LiteLLM/Nexus/local GPU migration.|mixed|high|
|SRC-016|SYSTEM_BLUEPRINT.md|1167 bytes / 28 lines|Compact implementation blueprint|Blueprint category-to-component mapping for campaigns, messaging, CRM, automation, quote, assistant, integrations, UI, and security.|mixed|high|
|SRC-017|THE NYRA-NERVE OMNI-BLUEPRINT PHASE.txt|3612 bytes / 49 lines|Nerve/OpenClaw decision notes|Nerve as cockpit, OpenClaw gateway separation, local/Tailscale access, TwentyCRM status updates from agent events, hardware duty-cycle guidance.|yes|high|
|SRC-018|THE NYRA-NERVE OMNI-BLUEPRINT PHASE2.txt|3521 bytes / 49 lines|Nerve/OpenClaw/Twenty loop|Single pane of glass, Nerve session trees, mortgage quote skill, Nexus/LiteLLM gateway, TwentyCRM updates, security/persistence with encrypted graph/memory storage.|yes|high|
|SRC-019|The Project Nyra Alpha-Omega Setup.txt|17819 bytes / 332 lines|WaveTerm/terminal command deck|WaveTerm install, theme/config, Claude Code badges, widgets, custom icons/backgrounds, laz ydocker/Infisical/Redis monitor/Activepieces web deck, process viewer, terminal HUD.|yes|high|
|SRC-020|This is the Finalized Master Plan..txt|7112 bytes / 128 lines|Final corrected Neko Grid plan|Strict final topology: orchestrator/openclaw gateways/nerve/paperclip/clawteam-server; workers vLLM/LMCache/clawteam-node; 3060 utility; Oracle n8n/Activepieces/Letta/Gitea/Traefik. No Hermes. UI/design notes quarantined.|yes|high|
|SRC-021|Untitled.txt|2375 bytes / 5 lines|All-in-one app prompting request|Need Landing, Webapp, TwentyCRM, Activepieces/n8n/Composio/OpenClaw docs; consolidate app services and old apps; landing rate ticker, Market Pulse, About Ellis/WCL, QR/save contact/reviews/resources; pending approval separation.|yes|high|
|SRC-022|Untitled2.txt|2153 bytes / 41 lines|Distributed Nexus Router MCP config|Custom HTTP/SSE MCP server nyra-nexus-router at /mcp/sse, Authorization bearer token, x-grafbase headers, semantic/fuzzy tool search, Hive observability, mcp.json priority, tool listing test.|yes|high|
|SRC-023|● ✅ PHASE 5 COMPLETE — OpenClaw int.txt|66980 bytes / 879 lines|OpenClaw/Nerve/Neko grid finalization|Final strict hostnames, no Hermes, Nerve/Paperclip/ClawTeam placement, webapp embedding, custom n8n campaign builder, make targets, R3F/spatial UI aesthetic notes quarantined.|yes|high|

## Notes

- Source labels are file-level labels from the extracted archive.
- Some files include multiple conversations and repeated prompts; provenance inside those files is not always exact.
- UI/design material was separated where possible, but source files themselves often mix implementation and visual design.



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


# 09 Prompt Dispatch Order

## Recommended sequential order

1. **PROMPT 01 — Foundation, Repo, Environment, and Architecture**
   - Send to: Codex CLI / Claude Code DevOps agent.
   - Why first: everything needs stable paths, hostnames, health checks, and deployment layout.

2. **PROMPT 02 — AI Agent Stack, Model Routing, MCP, and Memory Systems**
   - Send to: systems/AI infrastructure agent.
   - Depends on: initial infrastructure assumptions.

3. **PROMPT 03 — CRM, TwentyCRM, Lead Ingestion, and Contact Data Model**
   - Send to: backend/CRM agent.
   - Depends on: system-of-record placement decision.

4. **PROMPT 04 — Mortgage Quote Engine, Quote API, and Excel Parity**
   - Send to: backend/API agent.
   - Can run partly parallel with Prompt 03.

5. **PROMPT 05 — Twilio, SendGrid, Drip Campaigns, and Auto-Stop-on-Reply Logic**
   - Send to: automation/backend agent.
   - Depends on: CRM contracts; quote engine if quote text is included.

6. **PROMPT 06 — n8n, Activepieces, Composio, and Workflow Automation**
   - Send to: workflow automation agent.
   - Depends on: campaign contracts and infrastructure placement.

7. **PROMPT 07 — Backend APIs, Webhooks, Service Contracts, and Data Flows**
   - Send to: backend architect.
   - Can run parallel after CRM/quote initial outputs.

8. **PROMPT 08 — Auth, Secrets, Security, Compliance, and Audit Logging**
   - Send to: security/platform agent.
   - Should run early before exposing anything.

9. **PROMPT 09 — Admin Portal and Webapp Behavior — Non-Visual Only**
   - Send to: full-stack behavior agent.
   - Depends on: API contracts; does not depend on final UI design.

10. **PROMPT 10 — Gitea, WaveTerm, Zellij, Paperclip, and Operator Tooling**
    - Send to: DevEx/platform agent.
    - Can run in parallel once foundation is known.

11. **PROMPT 11 — Testing, Observability, Deployment, and Hardening**
    - Send to: QA/platform agent.
    - Run after core categories produce contracts.

12. **PROMPT 12 — Final Integration and System Synthesis**
    - Send to: integrator agent.
    - Must run after category outputs are complete.

## Parallel-safe prompts

- Prompt 03 and Prompt 04 can run in parallel after Prompt 01.
- Prompt 08 can run early in parallel with Prompt 02.
- Prompt 10 can run parallel as DevEx/operator tooling.
- UI quarantine prompt can run in Claude Desktop while nonvisual backend work proceeds.

## Sequential prompts

- Prompt 05 should wait for CRM contract from Prompt 03.
- Prompt 06 should use outputs from Prompts 03 and 05.
- Prompt 09 should use API contracts from Prompt 07.
- Prompt 12 should wait for all category outputs.

## Blocked by UI/design quarantine

- Final visual implementation of landing page.
- Final visual implementation of internal webapp dashboard.
- shadcn/TweakCN/Magic UI component decisions.
- R3F/3D/animation choices.
- Final command deck aesthetic.

Nonvisual route behavior, API contracts, auth, service integration, and data flow can proceed now.


# 07 Conflicts and Missing Information

## Conflict Register

### CONFLICT-001 — Letta vs Mem0/OpenMemory as final memory stack

- Conflicting versions: Several sources say Letta is master memory manager via Letta MCP; one converged stack says Letta was dropped in favor of Mem0/Postgres/FalkorDB/Graphiti.
- Likely best default: Keep Letta as an optional/protected memory-manager agent/UI profile while using Postgres/Twenty for durable records and Mem0/FalkorDB/Graphiti for memory substrate.
- Impact if wrong: Overbuilds memory stack or removes a desired memory control layer.
- Affected prompts: 02, 06, 08, 09, 12.

### CONFLICT-002 — TwentyCRM on orchestrator vs Oracle VPS

- Conflicting versions: Earlier plan deploys Twenty on orchestrator; later converged stack puts core state on Oracle.
- Likely best default: Production/default TwentyCRM on Oracle for 24/7 availability; local/orchestrator instance allowed for dev only.
- Impact if wrong: Public leads may fail if home machine is down, or local latency improves but uptime suffers.
- Affected prompts: 01, 03, 07, 08.

### CONFLICT-003 — Paperclip on Oracle vs orchestrator

- Conflicting versions: One source assigns Paperclip to Oracle as async dashboard; later final Neko grid assigns Paperclip to orchestrator.
- Likely best default: If Paperclip is operational/ticket dashboard integrated with OpenClaw/Nerve, run it on orchestrator. If it is pure async goal/ticket database, run on Oracle. Implement with compose profiles so placement can change.
- Impact if wrong: Latency vs uptime tradeoff.
- Affected prompts: 01, 10.

### CONFLICT-004 — OpenClaw gateway on workers vs orchestrator

- Conflicting versions: Some conversations place gateway with GPU workers; final topology places two gateways on orchestrator targeting worker vLLM endpoints.
- Likely best default: Gateways on orchestrator, vLLM/compute on workers. This preserves VRAM and centralizes operator control.
- Impact if wrong: More UI/service bloat on GPU machines or higher network complexity.
- Affected prompts: 01, 02, 10.

### CONFLICT-005 — Nerve placement and count

- Conflicting versions: Run Nerve on workers vs orchestrator; one Nerve vs two Nerve instances.
- Likely best default: Two Nerve instances on orchestrator, one targeting 5090 gateway and one targeting 3090Ti gateway.
- Impact if wrong: Config swapping, unclear console targeting, wasted worker resources.
- Affected prompts: 01, 02, 09.

### CONFLICT-006 — n8n vs Activepieces primary automation engine

- Conflicting versions: Activepieces replaces Zapier/n8n in one plan; later plans use n8n for heavy mortgage drip and Activepieces for triggers.
- Likely best default: n8n for heavy dynamic mortgage campaign logic; Activepieces for simple triggers/integrations/admin access.
- Impact if wrong: Either overcomplicates simple automations or underpowers complex mortgage flows.
- Affected prompts: 05, 06, 09.

### CONFLICT-007 — Hermes usage

- Conflicting versions: Older sources mention Hermes; later user correction says no Hermes.
- Likely best default: Do not use Hermes. Use vLLM/OpenAI-compatible model serving and OpenClaw.
- Impact if wrong: Builds deprecated/unwanted containers.
- Affected prompts: 01, 02.

### CONFLICT-008 — Raw n8n embed vs custom campaign builder

- Conflicting versions: Embed n8n in webapp vs custom campaign builder controlling n8n headlessly.
- Likely best default: Custom campaign builder for daily campaign management; raw n8n admin view only in tools/admin section.
- Impact if wrong: Broker workflow becomes brittle and too technical.
- Affected prompts: 06, 09, UI quarantine.

### CONFLICT-009 — Public/professional mortgage UX vs cyberpunk command deck

- Conflicting versions: Dramatic terminal/cyberpunk visuals vs mortgage trust/compliance/professional landing.
- Likely best default: Public landing remains professional with tasteful tech polish; internal app can use stronger command-deck styling.
- Impact if wrong: Public trust and conversion suffer.
- Affected prompts: UI quarantine.

### CONFLICT-010 — External project facts and repo availability

- Conflicting versions: Sources include claims about new Nexus/Hive/Grafbase/Letta repos and 2026 statuses that may require live verification.
- Likely best default: Treat uploaded claims as planning context, but verify external repo URLs/docs before implementation.
- Impact if wrong: Agent builds against outdated/hallucinated APIs.
- Affected prompts: 02, 06, 10, 12.

## Missing Information Register

| Missing item | Why it matters | Suggested default | Can proceed? | Affected areas | Risk |
|---|---|---|---|---|---|
| Exact private repo state | Needed before file edits | Inspect repo before changes; use additive scaffolds | yes | all implementation | medium |
| Actual host IPs/Tailscale names | Needed for compose/env routing | Use hostnames/placeholders and document substitutions | yes | infra/routing | medium |
| Final domain/subdomain map | Needed for Cloudflare/Traefik | Use ratehunter.net defaults from sources | yes | deployment | medium |
| Exact upstream URL for `external/openclaw-n8n-stack` | Needed to fix `.gitmodules` | Add placeholder and block build until verified | partial | Cloudflare Pages | high |
| Final memory architecture decision | Avoid duplicate memory bloat | Optional Letta + durable Mem0/Postgres/FalkorDB substrate | yes | memory/agents | medium |
| Twilio/SendGrid account details | Needed for real sends | Sandbox placeholders | yes | comms | medium |
| Mortgage compliance copy | Needed for public/borrower messages | Conservative estimates-only disclaimers | yes | quote/campaign | medium |
| Final UI design | Needed for visuals | Quarantine and run Claude Desktop design prompt | yes for nonvisual | UI | high |
| Model names/paths | Needed for vLLM containers | Use `MODEL_PATH` placeholders | yes | GPU workers | medium |
| Live Vercel/Cloudflare build logs | Needed to confirm current failures | Do not alter; inspect in agent mode later | yes | deploy | low/medium |


# 08 Environment Variables and Secrets Register

Never commit actual secret values. Replace with placeholders, Infisical references, Docker secrets, or Vaultwarden-managed values.

|Variable / Config|Purpose|Required?|Safe placeholder/default|Where used|Source/notes|
|---|---|---|---|---|---|
|ORCHESTRATOR_TUNNEL_TOKEN|Bearer token for central MCP/SSE router access|yes|${ORCHESTRATOR_TUNNEL_TOKEN}|MCP client/router config|Untitled2|
|INFISICAL_PROJECT_ID|Infisical project reference|yes|${INFISICAL_PROJECT_ID}|Secret sync/injection|Gitea/setup sources|
|INFISICAL_TOKEN|Infisical auth token; should be short-lived or machine token|yes|${INFISICAL_TOKEN}|Secret sync/injection|Gitea/setup sources|
|OPENAI_API_KEY|Cloud-backed LLM or OpenClaw MVP if used|optional|${OPENAI_API_KEY}|OpenClaw/LiteLLM|Role prompt|
|OPENROUTER_API_KEY|Cloud model fallback/router|optional|${OPENROUTER_API_KEY}|LiteLLM/OpenRouter|multiple sources|
|TWILIO_SID|Twilio SMS integration|yes for SMS|${TWILIO_SID}|Twilio sends/webhooks|multiple sources|
|SENDGRID_API_KEY|SendGrid email integration|yes for email|${SENDGRID_API_KEY}|SendGrid sends/webhooks|inferred from sources|
|LENDINGPAD_API_KEY|LendingPad integration|optional|${LENDINGPAD_API_KEY}|LOS sync|Gemini sources|
|LEADMAILBOX_AUTH|LeadMailbox integration/auth|optional|${LEADMAILBOX_AUTH}|Lead ingestion|Gemini sources|
|LEADMAILBOX_TOKEN|LeadMailbox token|optional|${LEADMAILBOX_TOKEN}|Lead ingestion|extracted|
|LETTA_API_URL|Letta service URL|optional/profile|https://letta.ratehunter.net|Memory manager|multiple sources|
|LETTA_MASTER_PWD|Letta admin/master password|optional/profile|${LETTA_MASTER_PWD}|Letta admin/auth|multiple sources|
|MEM0_API_KEY|Mem0 cloud/platform key if cloud mode|optional|${MEM0_API_KEY}|Mem0 memory|Role prompt|
|HIVE_SCHEMA_REGISTRY_TOKEN|Hive/Grafbase observability/schema token|optional|${HIVE_SCHEMA_REGISTRY_TOKEN}|Hive router/telemetry|Nexus sources|
|CLOUDFLARE_ZERO_TRUST_TOKEN|Cloudflare access/tunnel token|yes for exposed admin UIs|${CLOUDFLARE_ZERO_TRUST_TOKEN}|Cloudflare/Zero Trust|multiple sources|
|ORCHESTRATOR_TUNNEL_TOKEN|MCP router auth token|yes|${ORCHESTRATOR_TUNNEL_TOKEN}|MCP SSE endpoint|Untitled2|
|GITEA_PORT|Gitea HTTP port|optional|3100|Gitea|gitea setup|
|GITEA_SSH_PORT|Gitea SSH port|optional|2222|Gitea|gitea setup|
|GITEA_ROOT_URL|Public/root URL for Gitea|optional|https://git.ratehunter.net/|Gitea|gitea setup|
|GITEA_RUNNER_TOKEN|Gitea runner token|optional|${GITEA_RUNNER_TOKEN}|Gitea Actions|gitea setup|
|GITEA_SSH_KEY|SSH key path/token ref for Gitea|optional|${GITEA_SSH_KEY}|Gitea mirror|gitea setup|
|REVIEW_MODEL|AI reviewer model|optional|anthropic/claude-3.5-sonnet or approved model|Gitea AI reviewer|gitea setup|
|REVIEW_MAX_CHARS|AI reviewer context limit|optional|18000|Gitea AI reviewer|gitea setup|
|N8N_EDITOR_BASE_URL|n8n public/editor URL|yes for n8n|https://n8n.ratehunter.net|n8n|final plan|
|N8N_PAYLOAD_SIZE_MAX|n8n payload size limit|optional|256|n8n|final plan|
|N8N_DISABLE_UI_SECURITY|n8n embed/security toggle; use carefully|optional|false|n8n admin/embed|extracted|
|AP_WEBHOOK_URL|Activepieces webhook URL|yes for AP|https://activepieces.ratehunter.net|Activepieces|absolute plan|
|AP_FRONTEND_URL|Activepieces frontend URL|yes for AP|https://activepieces.ratehunter.net|Activepieces|absolute plan|
|LLM_ENDPOINT|OpenClaw gateway target LLM endpoint|yes|http://worker-rtx5090:8000/v1|OpenClaw gateway|final plan|
|LLM_BASE_URL|LLM router/base URL|optional|http://litellm:4000/v1|LiteLLM/OpenClaw|extracted|
|MODEL_PATH|vLLM model path/name|yes for vLLM|${MODEL_PATH}|GPU workers|final plan|
|SERVER_URL|ClawTeam server URL for worker nodes|yes for ClawTeam|http://orchestrator:8080|ClawTeam node|final plan|
|OPENCLAW_API_URL|OpenClaw API/gateway URL|optional|http://orchestrator:PORT|Nerve/webapp|extracted|
|KYUTAI_UNMUTE_CFG|Kyutai Unmute config|optional/profile|${KYUTAI_UNMUTE_CFG}|Voice/TTS/STT|multiple sources|
|UNMUTE_OPENAI_API_KEY|Unmute/OpenAI-compatible API key if needed|optional|${UNMUTE_OPENAI_API_KEY}|Voice pipeline|extracted|
|SLACK_WEBHOOK|Slack notification webhook|optional|${SLACK_WEBHOOK}|Composio/alerts|extracted|

## Additional uppercase tokens extracted from archive

These appeared in the source material and may need review if implementation agents encounter them:

```text
ABSURD_MAXIMALISM
AI_REVIEW_SETUP
ANYTHING_RAG
CLAUDE_CONFIG_DIR
CLAUDE_PLUGIN_ROOT
CLOUDFLARE_ZERO_TRUST_TOKEN
COGNITIVE_STATE_ENGINE
COGNITIVE_STATE_ENGINE_V4
CONSOLIDATION_INDEX
DOMAIN_MAP
EXECUTION_COMMAND
EXECUTION_MODE
EXECUTION_STRICTNESS
GENERIC_TIMEZONE
GITEA_MIRROR_URL
GITEA_PORT
GITEA_ROOT_URL
GITEA_RUNNER_REGISTRATION_TOKEN
GITEA_RUNNER_TOKEN
GITEA_SSH_KEY
GITEA_SSH_PORT
GRID
GROQ_API_KEY
HIVE_SCHEMA_REGISTRY_TOKEN
HUB_DIR
HYBRID
INFISICAL_PROJECT_ID
INFISICAL_TOKEN
KEY
KYUTAI_RAID_CFG
KYUTAI_UNMUTE_CFG
LEADMAILBOX_AUTH
LEADMAILBOX_TOKEN
LENDINGPAD_API_KEY
LETTA_API_URL
LETTA_MASTER_PWD
LETTA_PWD
LLM_BASE_URL
LLM_ENDPOINT
LLM_PROVIDER_URL
LOCAL_LLM_KEY
MARKET_SNIPER_V4
MEM0_API_KEY
MODEL_PATH
MORTGAGE_DATA_SENTINEL
MORTGAGE_SNIPER_V3
N8N_DISABLE_UI_SECURITY
N8N_EDITOR_BASE_URL
N8N_PAYLOAD_SIZE_MAX
NEKO_ENGINEER_GOD
NODE_ENV
NYRA_GATEWAY_SINGULARITY
NYRA_UI_DESIGN_CONSOLIDATION
OMC_PLUGIN_ROOT
OMNIPOTENT_INFRA_ARCHITECT
OMNIPOTENT_INFRA_ARCHITECT_MODE
OMNI_LIFECYCLE_ORCHESTRATOR
OPENAI_API_KEY
OPENCLAW_API_URL
OPENCLAW_BASE_URL
OPENCLAW_CHAT_UI_PLAN
OPENCLAW_FUTURE_ROUTING
OPENCLAW_INTEGRATION
OPENCLAW_INTEGRATION_PLAN
OPENCLAW_OPERATIONS
OPENROUTER_API_KEY
ORCHESTRATOR_TUNNEL_TOKEN
OUTPUT_DIR
OUTPUT_REQUIREMENT
PERFECTIONIST_MAXIMALISM
PORT
PRE_CLONE_CHECKLIST
PROJECT_NYRA_APOTHEOSIS_V4
PROJECT_NYRA_GATEWAY
PROJECT_NYRA_SINGULARITY_PROMPT
RAG_OUTPUT
RAID
README_SETUP
RECURSIVE_ARCHITECT_MODE
REVIEW_MAX_CHARS
REVIEW_MODEL
SECRET
SERVER_URL
SLACK_WEBHOOK
STAGING_DIR
SUBSCRIPTION_API_SERVER_3060
SUBSCRIPTION_PROXY_GATEWAY
SYSTEM_ACTIVATE
TELEPHONIC_AI_NEGOTIATOR
TUNNEL_AUTH_KEY
TWILIO_SID
UNMUTE_OPENAI_API_KEY
VCS_STATUS_
VCS_STATUS_LOCAL_BRANCH
VCS_STATUS_NUM_UNTRACKED
WORKFLOW_CUSTOMIZATION
YOUR_3060_CONTEXT_NAME
YOUR_LINUX_USERNAME
YOUR_MODEL
YOUR_USERNAME
YOUR_WINDOWS_USERNAME
```


# 10 Agent Handoff Notes

Paste this before any category prompt if the receiving agent has no prior context.

```text
You are receiving a large category-specific work prompt from a consolidated Project Nyra / RateHunter multi-agent prompt package.

Do not ask basic clarification questions.
Use the provided context.
Make safe assumptions and document them.
Preserve project constraints.
Do not touch quarantined UI/design decisions unless this is specifically a UI/design prompt.
Do not expose secrets or provider keys to browser-side code.
Do not delete existing files without explicit instruction.
Prefer additive scaffolding, interfaces, tests, docs, and safe compose overlays.
Produce concrete outputs.
Report files changed, assumptions, tests, security notes, and next recommended prompt.
```

## Universal constraints


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


## Completion report every agent must use

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```




# ===== prompt_01_foundation_repo_environment_architecture.md =====

# PROMPT 01 — Foundation, Repo, Environment, and Architecture

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Create or validate the base infrastructure plan and repo scaffolding so every later agent has stable paths, host placement, health checks, network assumptions, and deployment commands.

## Context to ingest


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


### Category-specific context


The source material repeatedly converges on a hybrid architecture: local orchestrator for low-latency control, GPU workers for inference, Oracle VPS for always-on state/webhooks, and Cloudflare/Tailscale for access. The final strict naming convention removes Titan/Atlas and uses only `worker-rtx5090`, `worker-rtx3090ti`, and `worker-rtx3060`. A known Cloudflare Pages issue exists: `.gitmodules` is missing a URL for `external/openclaw-n8n-stack`, causing `fatal: No url found for submodule path`.

Recommended infra tree:

```text
/infra/hosts/orchestrator/docker-compose.yml
/infra/hosts/worker-rtx5090/docker-compose.gpu.yml
/infra/hosts/worker-rtx3090ti/docker-compose.gpu.yml
/infra/hosts/worker-rtx3060/docker-compose.gpu.yml
/infra/hosts/oracle-vps/docker-compose.yml
/infra/shared/cloudflared/
/infra/shared/traefik/
/infra/scripts/health-check.sh
/infra/scripts/network-map.sh
/Makefile
/README_SETUP.md
```

Default placement:

- Orchestrator: OpenClaw gateways, Nerve instances, ClawTeam server, LiteLLM/Nexus gateway, Cloudflared if local UIs are exposed, WaveTerm/Zellij operator layer.
- worker-rtx5090: vLLM server, LMCache/Redis, ClawTeam node, heavy coding/reasoning.
- worker-rtx3090ti: vLLM/Ollama server, LMCache/Redis, ClawTeam node, steady production inference.
- worker-rtx3060: embeddings, STT/TTS, small Ollama utility models, vector preprocessing.
- oracle-vps: n8n, Activepieces, Gitea, Letta/Mem0/FalkorDB/Postgres/Redis as selected, SearXNG, Browserless, Traefik/Nginx/Cloudflared.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect the repo for existing `/infra`, Docker Compose files, Makefile, `.gitmodules`, Cloudflare/Tailscale docs, and service directories.
2. Produce a repo-safe foundation plan showing what exists, what is missing, and what should be created.
3. Fix or specify the `.gitmodules` URL problem for `external/openclaw-n8n-stack` without inventing an unknown upstream URL; if URL is unknown, add a clear placeholder and fail-safe instructions.
4. Create or propose per-host compose files for orchestrator, workers, and Oracle VPS.
5. Create a root Makefile with targets: `status`, `health`, `deploy-orch`, `deploy-5090`, `deploy-3090`, `deploy-3060`, `deploy-oracle`, `swarm-up`, `swarm-down`, `logs`, `pull-secrets`.
6. Create a health-check script that checks Docker containers, Tailscale reachability, vLLM/Ollama endpoints, LiteLLM/Nexus endpoints, Cloudflare tunnel status, and major service HTTP health endpoints.
7. Create `NETWORK-MAP.md` with hostnames, expected IPs/placeholders, ports, subdomains, and internal/external routing.
8. Add README setup instructions that work from Windows/WSL2 and do not assume prior context.


## Expected outputs


- `Makefile` or Makefile patch.
- Per-host compose files or scaffolds.
- `README_SETUP.md`.
- `NETWORK-MAP.md`.
- `health-check.sh`.
- `.gitmodules` fix plan.
- Deployment order and rollback notes.


## Acceptance criteria


- No Titan/Atlas names remain.
- Host placement follows the split brain/default topology.
- Health script can run from orchestrator and produce parseable output.
- Compose configs are additive and do not destroy existing services.
- Secrets are placeholders or secret references only.
- Known Cloudflare Pages submodule issue is addressed or clearly blocked by missing URL.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_02_ai_agents_routing_memory.md =====

# PROMPT 02 — AI Agent Stack, Model Routing, MCP, and Memory Systems

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Consolidate and implement the AI routing and memory architecture: OpenClaw/Nerve/ClawTeam, LiteLLM, Nexus/Hive/Grafbase-style MCP routing, local GPU endpoints, cloud fallback, and tiered memory.

## Context to ingest


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


### Category-specific context


Important source details:

- OpenClaw should be model-agnostic and useful for local LLMs.
- Nerve is a cockpit/UI layer over OpenClaw/gateway sessions, not a replacement gateway.
- Current final topology favors two OpenClaw gateways on orchestrator, each targeting a GPU worker endpoint.
- vLLM/OpenAI-compatible endpoints serve worker GPUs. LiteLLM routes tasks to local/cloud endpoints.
- Nexus/Hive/Grafbase-style MCP router should aggregate tools and enable fuzzy/semantic tool search so agents do not load every tool into context.
- MCP router endpoint pattern from source: `http://100.64.0.10:4000/mcp/sse` with `Authorization: Bearer ${{ORCHESTRATOR_TUNNEL_TOKEN}}` and Hive/Grafbase telemetry headers.
- Memory has conflicts: some sources prefer Letta as master memory manager; one converged source says drop Letta and use Mem0/Postgres/FalkorDB. Safe default: deploy Letta as protected optional memory manager while keeping Postgres/Twenty as durable system of record and Mem0/FalkorDB/Graphiti as data substrate.
- OpenMemory/Mem0 synchronous blocking must be avoided; use async/background workers.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inventory existing agent/routing/memory files and docs.
2. Define a clear service map for OpenClaw gateways, Nerve UIs, ClawTeam server/nodes, LiteLLM, Nexus/Hive MCP router, vLLM/Ollama endpoints, and memory services.
3. Create or propose MCP router config that centralizes tools and supports role-based/fuzzy tool exposure.
4. Add or document MCP client configs for Claude Code/Codex/Gemini/OpenClaw where appropriate.
5. Configure model routing defaults:
   - heavy/code/reasoning → worker-rtx5090
   - steady/draft/production parsing → worker-rtx3090ti
   - embeddings/fast utility/STT/TTS → worker-rtx3060
   - cloud fallback → OpenRouter/Anthropic/OpenAI only when allowed and secreted.
6. Create memory architecture docs/configs:
   - durable CRM data in Twenty/Postgres
   - Redis hot memory/cache
   - Mem0/OpenMemory async memory extraction
   - FalkorDB/Graphiti graph relation layer
   - Letta protected optional memory-manager UI/agent
7. Add guardrails so borrower-facing agents do not receive dev/filesystem tools.
8. Add health checks for model/router/memory endpoints.


## Expected outputs


- `AGENT_ROUTING.md`.
- `MCP_ROUTER_CONFIG.md` or actual config files if repo patterns exist.
- LiteLLM/Nexus/Hive config stubs.
- Memory architecture doc and compose/profile recommendations.
- Role-based tool exposure matrix.
- Health check endpoints and validation commands.


## Acceptance criteria


- Agent routing prevents tool bloat and role leakage.
- Memory stack avoids synchronous blocking on lead workflows.
- No hardcoded API keys.
- Letta/Mem0/FalkorDB conflict is documented and implemented with optional profiles or clear default.
- Router can list available tools through a test query.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_03_crm_twentycrm_lead_ingestion.md =====

# PROMPT 03 — CRM, TwentyCRM, Lead Ingestion, and Contact Data Model

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Build the CRM/data backbone for mortgage leads, borrower contacts, loan records, campaign enrollments, communication logs, quote records, and lead-source tracking.

## Context to ingest


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


### Category-specific context


TwentyCRM is repeatedly identified as the CRM/system-of-record candidate. The source material wants mortgage-specific CRM objects and a reusable API wrapper so landing page, campaigns, OpenClaw, quote engine, and automation tools all read/write through consistent contracts.

Core objects:

- Contact/Borrower.
- Loan / LoanScenario.
- CampaignEnrollment.
- CommunicationLog.
- Quote.
- LeadSource / LeadEvent.
- InboxEvent / ReplyEvent.
- Suppression/OptOut state.

Pipeline stages from sources include variants of inquiry, pre-qualified, pre-approved, application, processing/underwriting, clear-to-close, closed, denied/lost.

Lead ingestion must support landing form, API/webhook, inbound email/LeadMailbox, ads, manual entry, and future LendingPad/provider sync.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect existing TwentyCRM/Twenty/app directories and integration docs.
2. Define the canonical CRM schema and object mapping.
3. Create or specify migrations/custom object setup steps for TwentyCRM.
4. Create a reusable `@nyra/crm-client` or equivalent backend client around Twenty's API/GraphQL.
5. Create simplified service endpoints:
   - `POST /api/leads`
   - `GET /api/leads/:id`
   - `PATCH /api/leads/:id/status`
   - `POST /api/leads/:id/quote`
   - `POST /api/leads/:id/campaigns/enroll`
   - `POST /api/leads/:id/campaigns/pause`
   - `POST /api/webhooks/reply`
6. Implement or document deduplication by email/phone and optional property/address.
7. Implement campaign enrollment hooks after lead creation if consent permits.
8. Implement reply/status webhooks that pause/transition campaigns.
9. Add sample data and test commands.


## Expected outputs


- CRM schema/mapping document.
- API client scaffold or implementation.
- Endpoint contracts.
- Sample lead/contact/loan/quote/campaign data.
- Webhook contract docs.
- Tests for create/update/dedupe/status/campaign enrollment.


## Acceptance criteria


- A lead can be created from one API call and appears in the CRM.
- Duplicate lead submission updates or links instead of creating chaos.
- Campaign enrollment is created only when consent/rules allow.
- Reply/STOP/status changes pause or transition campaigns.
- Other services have one consistent CRM API to use.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_04_mortgage_quote_engine.md =====

# PROMPT 04 — Mortgage Quote Engine, Quote API, and Excel Parity

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Implement or refine a deterministic mortgage quote engine that replaces spreadsheet-style quoting for API/agent/campaign use while avoiding LLM math errors.

## Context to ingest


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


### Category-specific context


The archive contains a concrete quote-engine concept: Node.js/TypeScript service, Express, Zod validation, deterministic mortgage math, Dockerfile, `/health`, and `/api/v1/quote`. It generates a 3-option comparison: standard/par, buy-down, and lender-credit. It validates inputs so hallucinated or impossible LLM payloads fail cleanly.

Required behavior:

- Calculate principal, LTV, interest rate, P&I, taxes, insurance, HOA, estimated PMI, total monthly payment, and total interest.
- Reject impossible values such as down payment >= property value.
- Return structured JSON suitable for OpenClaw, Activepieces/n8n, CRM records, and PDF/export.
- Keep outputs educational/indicative unless reviewed/locked through actual lender process.
- Add tests for 0% interest edge case, PMI threshold, bad inputs, and three-option consistency.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect existing quote-engine services or mortgage math utilities.
2. Create/update `services/quote-engine/` with TypeScript, strict validation, Dockerfile, and tests.
3. Implement Zod schema for quote input.
4. Implement amortization math without LLM involvement.
5. Implement 3-option matrix: standard, buyDown, lenderCredit. Use configurable rate adjustments rather than hardcoding only one set.
6. Add `/health` and `/api/v1/quote` endpoints.
7. Add optional `POST /api/quotes/generate` wrapper if the repo already has an app API namespace.
8. Add integration notes for CRM quote records and MCP tool registration.
9. Add test curl and automated tests.
10. Document compliance copy: estimates only, subject to lender review, taxes/insurance/PMI assumptions.


## Expected outputs


- Quote engine code or implementation plan.
- API schema docs.
- Dockerfile/compose snippet.
- Unit tests and sample curl.
- MCP tool registration spec.
- CRM Quote object integration spec.
- Compliance/disclaimer language.


## Acceptance criteria


- Bad or missing numeric inputs return clean validation errors.
- Math tests pass.
- API returns three quote options in structured JSON.
- OpenClaw/n8n/Activepieces can call it safely.
- No browser-side secret exposure.
- The service does not claim binding mortgage terms.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_05_comms_campaigns_twilio_sendgrid.md =====

# PROMPT 05 — Twilio, SendGrid, Drip Campaigns, and Auto-Stop-on-Reply Logic

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Build the mortgage communication and campaign layer: SMS/email templates, drip campaigns, event tracking, reply handling, opt-outs, and CRM synchronization.

## Context to ingest


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


### Category-specific context


Campaign automation is one of the most important revenue loops. Source material emphasizes Agent Legend/Bonzo-like multi-channel campaigns enhanced with AI workflows. The core requirement is not just sending messages; it is lifecycle-aware automation that stops when borrowers reply or opt out.

Campaigns to support:

- New Lead Nurture: 7-day sequence.
- Pre-Approval Follow-Up: 30-day sequence.
- Application-in-Progress: weekly updates/check-ins.
- Post-Close Delight: 12-month review/referral/anniversary sequence.
- Rate Alert: market/event-driven.
- Re-Engagement: 21-day sequence.
- Long 45–60 day nurture logic.

Channels:

- Twilio SMS, replies, opt-out/STOP events.
- SendGrid email, opens/clicks/bounces/unsubscribes where available.
- Future voice/ringless/video should remain optional/profiled.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Define canonical Campaign, CampaignStep, CampaignEnrollment, CommunicationLog, and Suppression data contracts.
2. Build or specify a template engine for SMS/email with merge variables and validation.
3. Create Twilio inbound webhook handler for replies and STOP/opt-out.
4. Create SendGrid event webhook handler for delivered/open/click/bounce/unsubscribe.
5. Implement campaign stop/pause rules:
   - any lead reply pauses active campaigns and notifies Ellis
   - STOP/unsubscribe suppresses future sends
   - status transitions trigger campaign movement
   - manual kill switch stops campaign immediately
6. Build the New Lead Nurture flow as the first reference sequence.
7. Add placeholders/specs for the other sequences.
8. Connect quote engine outputs into campaign templates only when enough scenario data exists.
9. Add sandbox-mode test flows for Twilio/SendGrid.
10. Add audit logs for sends, stops, replies, and campaign transitions.


## Expected outputs


- Campaign data model.
- Template service or template specs.
- Twilio webhook handler/contract.
- SendGrid webhook handler/contract.
- New Lead Nurture reference flow.
- Stop-condition tests.
- Compliance notes and sandbox test plan.


## Acceptance criteria


- A new lead can be enrolled and sent scheduled messages.
- A reply pauses campaign and notifies human owner.
- STOP/unsubscribe prevents future automated sends.
- Campaign state syncs to CRM.
- Message templates fail if required merge variables are missing.
- All sends and stops are logged.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_06_workflow_automation_n8n_activepieces_composio.md =====

# PROMPT 06 — n8n, Activepieces, Composio, and Workflow Automation

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Define and implement the automation engine split so n8n, Activepieces, Composio, and agent workflows complement each other instead of duplicating or fighting.

## Context to ingest


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


### Category-specific context


The source material debates n8n vs Activepieces but converges on a division of labor:

- n8n is the heavy mortgage logic engine for complex transformations, dynamic campaign steps, headless campaign execution, and webhook-driven workflows.
- Activepieces is a lighter trigger/integration engine for quick SaaS actions, simple event chains, and embeddable workflow access.
- Composio can act as an external SaaS/MCP action bridge for tools like Slack/Jira/Gmail/CRM where OAuth connector burden would otherwise slow implementation.
- OpenClaw can replace some n8n functionality for agentic reasoning/tasks, but deterministic scheduling, audit logs, and send rules should remain workflow/API controlled.

Daily users should not be forced to edit raw n8n graphs. The webapp should eventually expose a custom campaign builder that saves JSON config to backend/n8n webhooks.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inventory existing n8n, Activepieces, Composio, and automation docs/configs.
2. Create a decision document assigning each workflow type to n8n, Activepieces, Composio, OpenClaw, or backend API.
3. Create n8n workflow specs for campaign engine, reply handling, quote-triggered messages, and CRM sync.
4. Create Activepieces specs for simple triggers, external integrations, notifications, and embedded admin access.
5. Create Composio MCP/action-bridge setup docs with safe authentication guidance.
6. Define headless campaign builder contract:
   - webapp saves timeline JSON
   - backend validates and persists config
   - n8n reads config dynamically
   - no hardcoded message text inside workflow graph
7. Define unified inbox protocol: inbound Twilio/SendGrid/other events normalize into one table/contract.
8. Add iframe/link strategy for Activepieces and n8n admin access, but keep final visual design quarantined.
9. Add tests for workflow payloads, idempotency, retries, and error logging.


## Expected outputs


- Automation division-of-labor matrix.
- n8n workflow specs or JSON scaffolds.
- Activepieces connection/workflow specs.
- Composio MCP/action setup doc.
- Campaign builder JSON schema.
- Unified inbox event schema.
- Retry/idempotency/error-handling plan.


## Acceptance criteria


- Agents know which automation tool to use for which job.
- n8n workflows are dynamic and config-driven.
- Activepieces is used for quick integrations without becoming the core mortgage logic engine.
- Composio is authenticated safely and not exposed client-side.
- Workflow errors create logs/tickets and do not silently drop borrower events.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_07_backend_apis_webhooks_contracts.md =====

# PROMPT 07 — Backend APIs, Webhooks, Service Contracts, and Data Flows

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Create the shared backend contract layer that lets the landing page, webapp, CRM, quote engine, automations, and AI agents communicate safely.

## Context to ingest


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


### Category-specific context


Multiple sources call for a shared API layer rather than each tool directly mutating state. This prompt should create or specify a clean service contract map.

Core flows:

- Landing lead form → backend lead API → CRM → campaign enrollment → notification.
- Twilio/SendGrid inbound event → webhook → unified inbox → campaign pause/update → CRM sync.
- Quote request → quote API → quote record → PDF/export/send path → campaign template merge.
- Agent request → MCP router → approved tool/API → result → audit log.
- Webapp action → server-side proxy/API → internal service; no browser secrets.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect existing backend/API route structure.
2. Define the canonical API namespace and service contracts.
3. Add OpenAPI/Markdown contract docs for all major endpoints.
4. Create server-side proxy patterns for embedded/internal tools.
5. Define webhook verification/auth patterns.
6. Define idempotency keys for external webhooks and lead ingestion.
7. Define audit log events for borrower-impacting actions.
8. Create integration sequence diagrams or Mermaid diagrams.
9. Add typed schemas using Zod or equivalent where appropriate.
10. Add tests/mocks for external providers.


## Expected outputs


- API contract docs.
- Schema files or typed interfaces.
- Webhook verification spec.
- Data-flow diagrams.
- Server-side proxy guidelines.
- Audit event taxonomy.
- Test/mocking plan.


## Acceptance criteria


- No service relies on undocumented payloads.
- Browser never receives internal provider secrets.
- Webhooks are authenticated/verified where possible.
- Lead/quote/campaign/reply flows are traceable end-to-end.
- Agent tool calls can be audited.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_08_auth_security_secrets_compliance.md =====

# PROMPT 08 — Auth, Secrets, Security, Compliance, and Audit Logging

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Harden the platform around secrets, borrower data, admin access, campaign compliance, auditability, and least-privilege agent tooling.

## Context to ingest


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


### Category-specific context


Project Nyra handles mortgage lead/borrower data. The source material repeatedly references Infisical, Cloudflare Zero Trust, Tailscale, protected admin UIs, and no hardcoded secrets. This category must make security operational, not theoretical.

Critical surfaces:

- Public landing/API endpoints.
- Admin webapp.
- Embedded tools: n8n, Activepieces, Letta, Gitea, Nerve, Paperclip.
- Twilio/SendGrid webhooks.
- CRM and borrower PII.
- AI agent tool access.
- Docker secret injection.
- Gitea/AI reviewer tokens.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inventory required secrets and classify them.
2. Define Infisical/Vaultwarden secret naming and injection pattern.
3. Replace raw `.env` assumptions with placeholders or secret mounts.
4. Add Cloudflare Zero Trust/Tailscale access policy docs for admin/internal UIs.
5. Define role-based agent tool access and borrower-facing tool restrictions.
6. Add audit log requirements for sends, CRM writes, quote generation, campaign pauses/resumes, opt-outs, and agent actions.
7. Add compliance checks for SMS/email opt-out, estimate disclaimers, and PII logging.
8. Add secret exposure scan commands.
9. Add backup/persistence notes for Postgres/CRM/memory/Gitea.
10. Add incident response notes for compromised token, bad campaign send, or service outage.


## Expected outputs


- Secrets register.
- Security architecture doc.
- Auth/access-gating plan.
- Agent least-privilege matrix.
- Audit logging schema.
- Compliance checklist.
- Backup/restore notes.
- Secret scanning commands.


## Acceptance criteria


- No hardcoded secrets are introduced.
- All browser-facing routes keep provider secrets server-side.
- Admin UIs have access-gating strategy.
- Campaign opt-out and STOP are enforced.
- Audit trail exists for borrower-impacting actions.
- Agents cannot access irrelevant dangerous tools by default.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_09_admin_portal_behavior_non_ui.md =====

# PROMPT 09 — Admin Portal and Webapp Behavior — Non-Visual Only

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Specify and/or implement the internal webapp behavior without finalizing visual design choices: routes, data flows, actions, health surfaces, CRM/campaign/quote behavior, and integrations.

## Context to ingest


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


### Category-specific context


This is nonvisual behavior only. The source material has many UI/design ideas, but the current task intentionally quarantines final UI/design decisions. Agents can still build route contracts, server actions, data loaders, API calls, permissions, schemas, and wrapper behavior.

Behavioral surfaces:

- Overview command center.
- Lead queue and lead detail/cockpit.
- Campaigns and campaign builder behavior.
- Quote desk.
- Pipeline/Kanban behavior.
- CRM sync status.
- Unified inbox.
- Integrations/tools hub.
- Agent/operator console.
- Embedded specialist tools via safe wrapper pages.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect existing app routes and app ownership decisions.
2. Create a route map for internal webapp behavior.
3. Define required data loaders/API calls per route.
4. Define actions per route: create lead, update status, generate quote, pause campaign, resume campaign, kill campaign, send test message, open tool, view health.
5. Create or specify server-side proxy routes for internal tools.
6. Define health/status API aggregation for services.
7. Create schemas for dashboard cards/tables/timelines without final visual styling.
8. Keep Twenty itself linked/access-gated unless building a broker-safe wrapper.
9. Keep n8n raw UI out of daily campaign builder; use custom behavior contract saving JSON config.
10. Write route-level acceptance criteria.


## Expected outputs


- Nonvisual route map.
- Data/action contract per route.
- Integration proxy specs.
- Health/status aggregator spec.
- Campaign builder behavior schema.
- Lead detail/cockpit behavior spec.
- Quote desk behavior spec.


## Acceptance criteria


- Every route has purpose, data requirements, actions, and backing services.
- No visual theme decisions are finalized.
- Embedded tools are server-proxied or access-gated.
- Campaign builder behavior can save/publish configs without raw n8n graph editing.
- CRM/quote/campaign actions are audited.


## Edge cases

If existing apps conflict, keep `apps/webapp/app` as canonical internal app and `apps/landing/ratehunter-landing` as canonical public app unless repo reality proves otherwise.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_10_devops_gitea_waveterm_operator_tooling.md =====

# PROMPT 10 — Gitea, WaveTerm, Zellij, Paperclip, and Operator Tooling

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Build the developer/operator cockpit and local code operations layer: Gitea mirror, AI reviewer, WaveTerm/Zellij command deck, Paperclip/Sentry integration, SearXNG/Browserless, and safe CLI orchestration.

## Context to ingest


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


### Category-specific context


Source material contains extensive DevEx/operator tooling ideas. Keep this separate from core mortgage workflows so it does not block revenue-critical services.

Key tools:

- Gitea local mirror at `git.ratehunter.net` or `gitea.ratehunter.net`.
- Gitea ports: HTTP `3100`, SSH `2222` from sources.
- Gitea AI reviewer webhook at `/webhook/gitea` pattern.
- Infisical secret injection for tokens.
- WaveTerm/Wave AI terminal command deck.
- Zellij layouts for agent panes and worker SSH panes.
- Paperclip as strategy/ticket/goal dashboard.
- Sentry-to-Paperclip auto-ticketing.
- SearXNG local search and Browserless headless scraping on Oracle.
- Lazydocker, Redis/Falkor monitor, process viewer, Activepieces web deck widgets.

Important safety: Use official/authorized CLI and API sessions. Do not build tooling to bypass access controls, provider metering, or terms.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inspect repo for existing Gitea, WaveTerm, Zellij, Paperclip, Sentry, and operator docs.
2. Create Gitea setup plan/compose with safe defaults, actions runner, AI reviewer webhook, and Infisical secrets.
3. Create WaveTerm/Zellij config prompts or files for a local command deck.
4. Add widgets/commands for health, Docker status, worker SSH, logs, quote API, memory stream, and campaign kill switch.
5. Add Paperclip placement decision: default orchestrator for low-latency operator dashboard; Oracle if treating it as always-on async ticket store. Document conflict.
6. Add Sentry-to-Paperclip automation spec.
7. Add SearXNG/Browserless compose/service specs on Oracle.
8. Add safe CLI orchestration guidance for Codex/Gemini/Claude Code sessions without bypassing provider controls.
9. Add troubleshooting docs for Gitea runner, webhook, ports, and Infisical token refresh.


## Expected outputs


- Gitea compose/setup docs.
- AI reviewer webhook spec.
- WaveTerm/Zellij config package or prompt.
- Operator widgets list/config.
- Paperclip/Sentry automation spec.
- SearXNG/Browserless compose spec.
- Troubleshooting guide.


## Acceptance criteria


- Operator tooling can start without touching core app logic.
- Gitea and AI reviewer use secret placeholders only.
- WaveTerm/Zellij layout gives access to agents, workers, logs, and health commands.
- Sentry errors can create actionable tickets.
- Tooling does not encode bypasses around third-party access rules.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_11_testing_observability_deployment_hardening.md =====

# PROMPT 11 — Testing, Observability, Deployment, and Hardening

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

Create the validation, deployment, observability, rollback, and hardening layer that keeps the system from silently failing.

## Context to ingest


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


### Category-specific context


The platform has many services and async workflows. Without tests and observability, failures will be invisible: campaigns may keep sending, leads may not sync, quote math may drift, webhooks may fail, or agent tools may overreach.

Focus areas:

- Health checks for every service.
- Contract tests for APIs/webhooks.
- Quote math tests.
- Campaign stop-condition tests.
- Docker Compose validation per host.
- CI/Gitea Actions where applicable.
- Sentry/error capture.
- Langfuse/Phoenix/OpenTelemetry/OTLP/Hive telemetry where applicable.
- Backups and restore drills.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Inventory test framework and CI/deployment patterns.
2. Add or specify tests for quote engine, CRM API, lead ingestion, campaign stop rules, Twilio/SendGrid webhooks, and template rendering.
3. Create health-check endpoints and compose healthcheck directives.
4. Create deployment validation commands per host.
5. Create smoke test suite after deploy.
6. Add observability plan: structured logs, error capture, LLM tracing, service status aggregation.
7. Add backup/restore plan for Postgres, CRM, Gitea, memory, Redis/Falkor where applicable.
8. Add rollback plan for failed deployment and bad campaign configuration.
9. Add compliance test cases: STOP, unsubscribe, no consent, invalid quote, private data in logs.
10. Create a final hardening checklist.


## Expected outputs


- Test matrix.
- Healthcheck compose snippets.
- Smoke test commands.
- Observability/logging plan.
- Backup/restore plan.
- Rollback procedures.
- Hardening checklist.


## Acceptance criteria


- Quote, CRM, webhook, campaign, and template tests exist or are fully specified.
- Every major service has a health check.
- Deploy can be validated by commands.
- Campaign failures are observable.
- Bad sends and bad configs have rollback/kill-switch paths.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== prompt_12_final_integration_synthesis.md =====

# PROMPT 12 — Final Integration and System Synthesis

## Role

You are a senior implementation agent working on Project Nyra / RateHunter. You are expected to operate with high agency, preserve constraints, and produce concrete artifacts.

## Mission

After category agents finish, synthesize their outputs into one coherent implementation plan, resolve conflicts, sequence remaining work, and produce the next safe repo changes.

## Context to ingest


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


### Category-specific context


This prompt should be used after running the major category prompts or after ingesting their outputs. It is the integrator prompt. It should not implement UI/design until the quarantined UI decision prompt is complete.

It must reconcile:

- Infrastructure placement.
- CRM/lead/quote/campaign contracts.
- Automation division of labor.
- Agent routing/memory conflicts.
- Security/compliance requirements.
- Dev/operator tooling.
- Test/deployment/hardening tasks.



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


## Systems involved

Infer from the context above and explicitly account for all systems that touch this category. At minimum, consider Docker/WSL2/Tailscale/Cloudflare, the relevant app/service directories, Infisical secrets, health checks, and downstream agent/webhook consumers.

## What has already been decided

- Strict hostnames are `orchestrator`, `worker-rtx5090`, `worker-rtx3090ti`, `worker-rtx3060`, `oracle-vps`.
- Use additive files/overlays where possible.
- Visual UI/design choices are quarantined unless this prompt explicitly says otherwise.
- Secrets must remain server-side or in secret management.
- Mortgage calculations must be deterministic and validated, not freehand LLM math.
- Campaign automation must stop/pause on replies, STOP/unsubscribe, status transitions, or manual kill switch.

## Assumptions

- The active repo may already contain partial implementations. Inspect before changing.
- If exact service images or versions are unknown, use stable placeholders and document them.
- If a dependency is missing, create a clear scaffold plus README instructions rather than blocking.
- If source material conflicts, use the defaults in `07_conflicts_and_missing_info.md`.

## Do not touch / do not decide

- Do not finalize colors, theme, animation, R3F, shadcn/TweakCN, visual dashboard design, typography, or visual layout.
- Do not delete existing files without explicit instruction.
- Do not expose secrets to client-side code.
- Do not implement bypasses around third-party access controls or terms.

## Exact work to perform


1. Read all completed category prompt outputs.
2. Create a single integrated architecture summary.
3. Identify contradictions between agent outputs and choose safe defaults.
4. Produce a prioritized execution roadmap with exact next repo/file changes.
5. Separate immediate safe tasks from tasks blocked by missing info or UI/design quarantine.
6. Produce a dependency graph.
7. Produce a final commit/PR plan.
8. Produce a smoke test plan for the first integrated deployment.
9. Produce a handoff prompt for the next implementation agent.


## Expected outputs


- Integrated architecture summary.
- Conflict resolution log.
- Dependency graph.
- Next repo/file changes.
- PR/branch plan.
- Smoke test plan.
- Next-agent implementation prompt.


## Acceptance criteria


- The plan is coherent across all systems.
- No UI/design finalization leaks into implementation.
- First implementation task is safe, additive, and valuable.
- Remaining blockers are explicit.
- The next agent can proceed without asking basic questions.


## Edge cases

Document edge cases found during work. Respect opt-outs, secrets, and no-UI-design quarantine.

## Dependencies

None

## Completion report format

When finished, report exactly:

```text
Completed:
Files changed:
Commands run:
Tests run:
Assumptions made:
Conflicts encountered:
Issues found:
Security notes:
Recommended next prompt:
```

## Final instruction

Do not ask clarification questions. Make safe assumptions, document them, and proceed. Produce implementation-grade outputs, not generic advice.




# ===== UI QUARANTINE =====

# UI_DESIGN_MASTER_PROMPT_QUARANTINED

This prompt is intentionally quarantined from the main implementation prompting package because final UI/design decisions are not complete yet.

Use this to consolidate, critique, and finalize visual/design-system direction before sending any UI implementation instructions to Codex or implementation agents.

Do not produce final implementation code unless explicitly asked.

## A. Visual direction ideas from sources

The sources contain strong visual ideas but they are not final:

- “Terminal Maximalism meets Minority Report.”
- “Cyberpunk Void” / “Frosted Obsidian.”
- Deep black backgrounds, glassmorphism, faint grids, data rain, R3F/3D neural/globe visuals.
- Electric violet, seafoam, hot pink, red error states.
- Monaspace Krypton for terminal/log/data surfaces; Inter for UI labels.
- Command Deck / Spatial OS / Neko Command Deck concepts.
- Campaign builder as subway/metro-line timeline.
- Active GPU/service status lights.
- Embedded tool wrappers for Nerve, Activepieces, Letta, Paperclip.
- Landing market/rate ticker and Market Pulse section.
- Borrower chat, profile/QR/contact cards, review links, West Capital Lending resources.

## B. shadcn/ui ideas

Sources mention shadcn as the likely component base. Design agent should decide:

- Which shadcn primitives are used for app shell, cards, drawers, dialogs, tables, toasts, tabs, accordions, forms, timelines, badges, and command palette.
- Which components should be customized vs left standard.
- How to keep broker-facing workflows polished without overbuilding visual noise.

## C. TweakCN ideas

Sources mention TweakCN variant/theme strategy. Decide:

- Whether TweakCN should define the main token system.
- Which theme tokens are final.
- Which variants are allowed for production pages.
- How to preserve accessible contrast.

## D. Magic UI / motion ideas

Potential but not final:

- Animated grid/background.
- Globe/neural network hero.
- Ticker animations.
- Pulsing service status.
- Micro-interactions on lead arrival, campaign pause, errors.

Design agent must separate tasteful motion from distraction.

## E. App shell / dashboard visual ideas

Candidate internal webapp pages:

- Overview command center.
- Leads cockpit.
- Lead detail.
- Campaigns.
- Campaign builder.
- Quote desk.
- Pipeline/Kanban.
- Unified inbox.
- Integrations/tools hub.
- OpenClaw/Nerve console pages.
- Nexus/Hive tool router page.
- Memory page.
- Gitea/Paperclip/observability links.

## F. Component aesthetics

Candidate components:

- Status light / health pill.
- GPU endpoint card.
- Lead queue card.
- Campaign timeline.
- Quote comparison cards.
- Integration embed frame.
- CRM sync health card.
- Kill-switch button.
- Command palette.
- Drawer for editing campaign steps.
- Unified inbox item.

## G. Typography / color / theme ideas

Unfinalized values from sources:

```text
Deep black: #020204 or #050505
Electric violet: #7c3aed
Seafoam: #99f6e4
Hot pink: #db2777
Error red: #ef4444
Data/grid dark blue: #0f172a
```

Fonts:

- Monaspace Krypton for terminal/log/data.
- Inter for labels/general UI.

## H. Motion / animation ideas

- Sidebar active-state pulse for active GPU/service.
- Red flash/border for service error.
- Lead arrival pulse.
- Scrolling market/rate ticker.
- Subtle data rain/grid background.
- Campaign timeline active-node glow.

## I. UX interaction ideas

- Campaign builder: click a step/node to open drawer and edit message/timing/channel.
- Overview: quick actions for create lead, generate quote, pause campaign, view service health.
- Tools hub: embed or link specialist tools with clear auth/degraded states.
- Lead cockpit: show status, source, communication history, quote eligibility, next action.
- Quote desk: generate, compare, send/export, show viewed status.

## J. Visual references / source material

Sources mention current screenshots and repo paths:

```text
/home/ellisapotheosis/repos/project-nyra/screenshots/**
apps/webapp
apps/landing/ratehunter-landing
apps/admin
apps/mortgage-crm
apps/nexusUI
apps/twenty
apps/twenty-crm
apps/shared/assets/**
apps/shared/assets/webapp-v1-source-material/index.html
```

Use these as planning references only until the repo is actually inspected.

## K. Conflicts / undecided design choices

- Raw n8n embed vs custom campaign builder: source default is custom campaign builder for daily use; raw n8n only admin/tool page.
- Tool iframe strategy vs native wrappers: temporary embeds are allowed, final broker workflows should be native wrappers.
- Dense cyberpunk aesthetic vs mortgage-professional trust: final design must not look unserious to borrowers or compliance stakeholders.
- Landing visual baseline: current landing-main is preferred; legacy landing is mined for missing concepts only.
- Webapp command deck can be dramatic internally; public landing must remain professional.

## L. Design questions to resolve

Do not ask the user immediately. First make defaults and produce options:

1. Final theme/token set.
2. Component library choices and overrides.
3. Which tools are embedded vs linked vs rebuilt natively.
4. Landing ticker placement and disclaimer language.
5. Internal webapp density level.
6. Borrower-facing vs broker-only visual split.
7. Accessibility and mobile behavior.

## M. Recommended design-decision workflow

1. Audit screenshots and existing apps.
2. Decide public landing visual baseline.
3. Decide internal command center visual system.
4. Decide component library/theme tokens.
5. Produce route-by-route wireframes.
6. Produce final UI implementation prompt for Codex.
7. Only then allow implementation agents to build visual components.

## N. Final UI-to-Codex handoff skeleton

```text
You are implementing finalized UI/design decisions for Project Nyra.
The visual design has now been approved.
Use the following theme tokens, component choices, route specs, and screenshots.
Do not revisit design direction unless implementation reveals a concrete accessibility or feasibility issue.
Implement incrementally, preserve existing app behavior, keep secrets server-side, and run tests/builds after each route group.
```




# ===== CLAUDE UI DECISION PROMPT =====

# Claude Desktop UI Decision Prompt

## Role

You are a senior product designer, frontend architect, and design-system strategist. You are helping finalize the Project Nyra / RateHunter UI direction before any implementation agent touches visual components.

## Mission

Review the quarantined UI/design context and produce a final design-decision package that can later be handed to Codex or Claude Code for implementation.

## Context

UI/design decisions are not complete. Do not write final implementation code yet. Decide the visual system first.

Use the quarantined context from `UI_DESIGN_MASTER_PROMPT_QUARANTINED.md`.

## Work to perform

1. Consolidate all visual ideas into 2–3 coherent design directions.
2. Identify contradictions or ideas that would make the platform look unprofessional for mortgage use.
3. Recommend one final direction for public landing and one final direction for internal webapp.
4. Decide shadcn/ui, TweakCN, Magic UI, and custom component roles.
5. Decide theme tokens, typography, motion rules, and accessibility constraints.
6. Decide which tools get embedded, linked, or rebuilt as native pages.
7. Produce route-level visual specs for landing, overview, leads, campaigns, quote desk, pipeline, integrations, agent console, and memory/tools pages.
8. Produce a final Codex-ready UI implementation prompt.

## Output format

```text
Design direction options:
Recommended final direction:
Public landing visual spec:
Internal webapp visual spec:
Design-system decisions:
Component decisions:
Motion rules:
Accessibility rules:
Embed/link/native decisions:
Conflicts resolved:
Final UI implementation prompt:
```

## Hard constraints

- Do not implement code yet.
- Do not weaken mortgage professionalism just to make it look futuristic.
- Keep borrower-facing surfaces more polished/trustworthy than internal operator surfaces.
- The internal command deck can be more dramatic, but it must remain usable.
