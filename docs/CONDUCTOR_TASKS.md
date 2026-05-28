# Conductor Tasks

Last updated: 2026-05-27

This is the human-readable backlog mirror for the current finish-line tracks under `conductor/tracks/`.

## Completed In This Pass

- [x] Replace the retired workspace stack with Gastown in active Oracle compose, docs, desired Cloudflare state, service registry, and app surfaces.
- [x] Import `nyra_omni_prompting_pack_v3` into Conductor and execute non-UI prompts 00-07.
- [x] Reconcile the May 26 Z-drive-requested prompt pack copy into Conductor and confirm no new runnable non-UI prompts remain.
- [x] Add non-UI prompt-pack domain/integration contracts, docs, scripts, tests, and QA report.
- [x] Add `secrets-init` to all canonical host compose files.
- [x] Standardize worker baselines for promtail, health-monitor, model-switcher, node-exporter, cAdvisor, and GPU exporter.
- [x] Stand up RTX3060 Ollama utility lane and preload embedding/extraction/summarization models.
- [x] Stand up RTX3090Ti and RTX5090 vLLM/LiteLLM/Redis baselines with non-gated default models.
- [x] Stand up orchestrator Docker MCP Gateway and route Oracle Nexus to `/mcp`.
- [x] Document centralized observability and Redis/Postgres/Mongo decisions.
- [x] Clean active repo-truth docs for current app names and runtime-verified worker capacity assumptions.
- [x] Expand `/admin/integrations` from static cards to read-only service health using `/api/health/services`.
- [x] Add typed webapp clients for OpenClaw and health endpoints, and remove raw fetch calls from broker/admin/assistant components.
- [x] Route campaign, lead, pipeline, and quote broker views through typed service APIs, with mock reads fail-closed in production unless `NYRA_ENABLE_MOCKS=true`.
- [x] Wire assistant operational proposals to action cards and a visible audit trail; verified assistant-service approval/audit tests.
- [x] Verify the gated Playwright happy-path smoke in local mock mode for Project Nyra and RateHunter.
- [x] Stand up and smoke Oracle memory stack: Letta, Letta Postgres, Letta MCP, mem0, Qdrant, FalkorDB, OpenMemory MCP, MemPalace MCP, MemOS API, and MemOS MCP. mem0 add/search also passed against the `mem0-nyra-768` Qdrant collection.
- [x] Execute the explicitly assigned UI prompt 08 safe slice: restore dependency validation and wire theme registry/provider/switcher defaults with RateHunter=`apotheosis` and ProjectNyra=`mint-midnight`.
- [x] Extend the ProjectNyra CRM command center with broker action queues for compliance checks, campaign review, quote follow-up, and CRM sync warnings.
- [x] Replace the deprecated `/api/crm` placeholder with a live/mock-aware CRM workspace snapshot endpoint.
- [x] Wire the authenticated broker command deck to the shared `/api/crm` workspace snapshot instead of static mock-only dashboard data.
- [x] Mark CRM-backed server pages dynamic so production builds pass without live CRM credentials while runtime reads still fail closed when mocks are disabled.
- [x] Reconcile Conductor prompt-pack source directories so they no longer contain runnable unchecked prompt tasks or stale launch-command wording.
- [x] Demote superseded broad backlog inventories in `docs/PROMPT_PACKAGE_TODO_AND_ASSESSMENT.md` and `infra/REPO-CATCHUP.md` to historical source material; current executable work remains here, in `conductor/tracks/`, or in `docs/user-todo/` for owner-only gates.
- [x] Reconcile May 19 status/handoff snapshots and `docs/decisions/OPEN_TASKS.md` against the current task surface.
- [x] Add `docs/TASK_SURFACE_AUDIT_2026-05-26.md` documenting active task sources, historical sources, owner-only gates, and stop condition.
- [x] Demote `docs/ai/context/handoff.md` and `docs/next-steps/NEXT_STEPS.md` from active-looking task sources to template/historical context.
- [x] Implement repo-governance guardrails for root-level Docker Compose drift and unapproved top-level directory creation via `scripts/infra/validate-repo-policy.sh`.

## Incomplete Local Repo Tasks

- [~] Regenerate Cloudflare desired/generated files after the owner finishes new domain and gtunnel decisions.
- [~] Execute `conductor/tracks/post_domain_cloudflared_validation_20260527/plan.md` after DNS, Cloudflare Access, and gtunnel setup is complete.
- [x] Update `services/quote-api/SPEC.md` to match the active Python/FastAPI implementation.
- [x] Verify campaign runtime guardrails with tests for consent, STOP, DNC, quiet hours, and reply pause.
- [~] Verify Oracle Loki reachability from all worker promtail containers; Oracle Loki is healthy, but worker WSL/Tailscale paths time out or are logged out.

## Owner-Gated Tasks

- [~] Renew Infisical machine token for orchestrator and verify `secrets-init` completes.
- [~] Finish Cloudflare DNS, Access, gtunnel, and service-token setup for the new domains.
- [~] Provide/verify live CRM, Twilio, SendGrid, Activepieces, n8n, OpenClaw, and quote service credentials.
- [~] Run live lead lifecycle smoke after domains, secrets, and provider credentials are ready.
- [x] UI/theme prompt 08 safe slice explicitly started on 2026-05-26 and completed through dependency validation plus theme registry/provider/switcher.
- [~] Continue broader UI work only after the next explicit UI assignment: landing polish, webapp shell, component plans, and visual artifacts.

## Current Validation Evidence

- [x] `rg -n "^- \\[ \\]" conductor docs/PROMPT_PACKAGE_TODO_AND_ASSESSMENT.md infra/REPO-CATCHUP.md --glob '!conductor/workflow.md'` returns no active unchecked prompt/catch-up tasks.
- [x] `rg -n "^\\s*- \\[ \\]" docs/PROMPT_PACKAGE_TODO_AND_ASSESSMENT.md infra/REPO-CATCHUP.md docs/PROMPTS_OVERVIEW_AND_STATUS_2026-05-19.md docs/AGENT_HANDOFF_PROMPT_2026-05-19.md docs/IMPLEMENTATION_STATUS_2026-05-19.md docs/decisions/OPEN_TASKS.md` returns no unchecked historical prompt/status items.
- [x] Source-code `TODO/FIXME/XXX/HACK` scan found no actionable local implementation TODOs; remaining matches are status enum literals, lockfile integrity strings, templates, or reference/spec docs.
- [x] `bash scripts/infra/validate-repo-policy.sh` passes and is available as `pnpm infra:check:repo-policy`.
- [x] `bash scripts/ci/validate-infra.sh` passes; both `.github/workflows/infra-validate.yml` and `.gitea/workflows/infra-validate.yml` now call this same validator.
- [x] `git diff --check` passes for the Conductor prompt-pack docs, `docs/CONDUCTOR_TASKS.md`, `docs/PROMPT_PACKAGE_TODO_AND_ASSESSMENT.md`, and `infra/REPO-CATCHUP.md`.
- [x] `rg -n "^- \\[ \\]" docs/user-todo conductor/tracks docs/CONDUCTOR_TASKS.md` shows remaining unchecked boxes only under `docs/user-todo/`, which is the owner-only task surface by design.
