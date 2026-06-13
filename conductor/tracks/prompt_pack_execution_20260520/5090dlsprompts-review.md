# 5090 DLS Prompt Review

Reviewed and triaged on 2026-05-20 from `conductor/prompts/5090dlsprompts/`.

## Scope Rule

The 5090 prompt files are preserved as source prompts, not higher-priority architecture. Execute them through current repo truth:

- `apps/projectnyra` owns the internal platform/webapp surface.
- `apps/ratehunter` owns the public broker landing page.
- `projectnyra.com` owns product/platform domains; `ratehunter.net` stays public landing only.
- Twenty CRM and the Nyra audit ledger outrank prompt text, memory, and workflow tools.
- RuVector, Graphiti, Archon, AgentDB, Flow-Nexus, Sona, Epic SDK, and `claude-flow` remain deprecated.
- The UI design prompt remains quarantined until an explicit UI execution lane is active.

## Prompt Status

| Prompt                                                       | Status            | Repo Evidence                                                                                                                                                                                                                                                                       | Remaining Work                                                                                                            |
| ------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `claude_desktop_ui_decision_prompt.md`                       | Quarantined       | `UI_DESIGN_MASTER_PROMPT_QUARANTINED.md`; current task is non-UI/product/infra.                                                                                                                                                                                                     | Execute only under Prompt 03/UI lane after service boundaries are stable.                                                 |
| `prompt_01_foundation_repo_environment_architecture.md`      | Locally closed    | Host compose roots under `infra/hosts/`; setup/architecture docs in `docs/MASTER_ARCHITECTURE.md`, `docs/EXECUTION_PLAN_INFRA.md`, `docs/infra/HOST-COMPOSE-INVENTORY.md`, `docs/infra/CONTAINER-SERVICE-MATRIX.md`; prompt path/domain mapping in `docs/PROMPT_PACK_EXECUTION.md`. | Live host smoke remains owner-gated after secrets and runtime access are present.                                         |
| `prompt_02_ai_agents_routing_memory.md`                      | Locally closed    | Agent/memory routing appears in `AGENTS.md`, `docs/MASTER_ARCHITECTURE.md`, `docs/ops/WORKER_ROUTING.md`, host compose files, Nexus/OpenClaw service roots, and `docs/ops/AGENT_MCP_EXPOSURE_MATRIX.md`.                                                                            | Live Nexus/MCP exposure testing remains owner-gated.                                                                      |
| `prompt_03_crm_twentycrm_lead_ingestion.md`                  | Locally validated | `services/crm-api` write-plan execution/audit boundary; `services/lead-ingestion` CRM write-plan handoff; `packages/crm-types`; lead ingestion and CRM API tests.                                                                                                                   | Finish live Twenty custom object provisioning and production endpoint smoke tests once credentials/runtime are available. |
| `prompt_05_comms_campaigns_twilio_sendgrid.md`               | Locally closed    | Service roots exist for `services/campaign-service`, `services/compliance-service`, `services/communication-service`, Twilio integration, and workflow IR/callback contracts.                                                                                                       | Live Twilio/SendGrid provider smoke remains owner-gated.                                                                  |
| `prompt_06_workflow_automation_n8n_activepieces_composio.md` | Locally closed    | Workflow specs, compose roots, n8n exports, and `docs/webapp/workflows/WORKFLOW_IR_CONTRACT.md` define n8n/Activepieces as execution substrates.                                                                                                                                    | Live workflow import remains owner-gated.                                                                                 |
| `prompt_07_backend_apis_webhooks_contracts.md`               | Locally closed    | Service boundaries and typed packages exist; PR #440 strengthens CRM/lead ingestion contracts; workflow idempotency/callback contract is documented.                                                                                                                                | Live provider webhook verification remains owner-gated.                                                                   |
| `prompt_08_auth_security_secrets_compliance.md`              | Locally closed    | Infisical docs and sidecar compose wiring exist; ADR auth decision now points to Nyra-controlled auth boundaries; compliance service roots exist; Cloudflare Access plan covers memory/MCP diagnostics.                                                                             | Live Cloudflare/Infisical verification remains owner-gated.                                                               |
| `prompt_09_admin_portal_behavior_non_ui.md`                  | Locally closed    | `apps/projectnyra` is canonical internal app; service roots exist for backend behavior; integrations hub exposes protected memory diagnostic links.                                                                                                                                 | Live route smoke remains owner-gated after deployment.                                                                    |
| `prompt_10_devops_gitea_waveterm_operator_tooling.md`        | Locally closed    | Gitea/Paperclip/worker/operator docs and compose files exist; Makefile has operational targets; MCP exposure matrix defines owner diagnostic boundaries.                                                                                                                            | Live Gitea runner, WaveTerm/Zellij, and Infisical refresh checks remain owner-gated.                                      |
| `prompt_12_final_integration_synthesis.md`                   | Closed for import | This track now holds source prompt archive, prompt mapping, risk register, validation matrix, and this status review.                                                                                                                                                               | No untriaged prompt text remains; unresolved execution belongs to the follow-on work named above.                         |

## Duplicate Handling

The folder includes `- Copy.md` and `(1)` duplicates. Canonical execution uses the non-copy filenames above. Duplicates are preserved as raw source material and should not create duplicate work items.

## Follow-On Execution Order

No untriaged local prompt-pack work remains. Owner-gated live checks are tracked
in `docs/OWNER_MANUAL_ACTIONS.md`.
