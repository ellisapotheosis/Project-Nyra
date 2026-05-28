# Prompt 01 — Codex Foundation Non-UI Pass

```text
You are Codex CLI operating inside the Project Nyra repository.

MISSION:
Perform a non-UI foundation pass. Do not touch UI, theme, colors, shadcn, tweakcn, visual components, frontend layouts, 3D visuals, icons, animations, or styling.

ABSOLUTE CONTEXT:
Project Nyra is a broker-facing AI mortgage operations platform and future SaaS. It unifies RateHunter.net public lead capture, ProjectNyra.com product marketing, authenticated Project Nyra broker webapp, TwentyCRM system-of-record, Activepieces primary workflow builder, optional constrained n8n fallback, Supabase local auth/backend, CRM API, Quote Engine, Rate Quoting API, Campaign Engine, Letta, OpenClaw, NerveUI, Gastown, Clawteam, Composio, memorytensor/memOS, mem0+Qdrant, Mempalace, ClaudeMem, OpenMemory MCP, Letta MCP, Nexus Router/Grafbase/Hive, LiteLLM/OpenRouter/local workers, Infisical sidecars, Docker Contexts, Tailscale, Cloudflare Tunnel, Portainer, Syncthing, Gitea, and observability.

HARD RULES:
- No UI/theme work.
- No secrets.
- No deletion of docs; archive categorized copies before replacing.
- Do not reintroduce Claude-Flow, ruv-swarm, ruflo, agentic-flow, flow-nexus, agentdb, ruvector, Dify.
- STOP/DNC/consent/human approval/audit are mandatory.

REQUIRED ACTIONS:
1. Inventory repo structure, package manager, languages, apps, packages, services, scripts, compose files, tests, env examples, docs.
2. Verify `/infra/hosts/<host>` structure and report missing host folders for orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, oracle, homeassistant-green, optional worker-rtx4060.
3. Create/update docs:
   - docs/PROJECT_NYRA_CONTEXT.md
   - docs/ARCHITECTURE_NON_UI.md
   - docs/STACK_DECISIONS.md
   - docs/DEPRECATED_STACK_DO_NOT_USE.md
   - docs/DOMAIN_MODEL.md
   - docs/INTEGRATION_CONTRACTS.md
   - docs/SECURITY_AND_COMPLIANCE_GUARDRAILS.md
   - docs/RAG_ANYTHING_ARCHIVE_STAGING.md
   - docs/AGENT_HANDOFFS.md
   - docs/CURRENT_STACK_TRUTH_V3.md
4. Create/update typed domain contracts in the idiomatic package location.
5. Define entities: Lead, Borrower, RealtorPartner, LoanOpportunity, MortgageScenario, QuoteRequest, QuoteOption, RateQuoteRequest, RateQuoteResult, DripCampaign, CampaignEnrollment, CommunicationEvent, ConsentState, DoNotContactState, AgentSession, AgentToolCall, MemoryRecord, AuditEvent, IntegrationHealth, WorkerNode, ModelRoute, VoiceJob, HostStack, SecretMount, MCPServer.
6. Define enums: LeadStage, Channel, ConsentStatus, CampaignStatus, AgentActionRisk, WorkerRole, HostRole, WorkerCapability, IntegrationStatus, VoiceJobStatus.
7. Add validation schemas if Zod or equivalent exists. If not, add no-new-dependency TypeScript types and runtime guards.
8. Create `.env.example` or update existing examples with all env vars from the prompting package.
9. Add tests for domain validation and compliance gates if test harness exists.
10. Add final report with files changed, checks run, failures, and handoff next steps.

VALIDATION:
Run available typecheck/lint/test only after inspecting package manager. Do not install packages blindly unless lockfiles and workspace conventions are clear.

FINAL RESPONSE:
Summarize changes, checks, blockers, and next agent prompt to run.
```
