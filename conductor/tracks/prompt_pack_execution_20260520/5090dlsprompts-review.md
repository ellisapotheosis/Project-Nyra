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

| Prompt                                                       | Status            | Repo Evidence                                                                                                                                                                                                                                                                       | Remaining Work                                                                                                                                                   |
| ------------------------------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `claude_desktop_ui_decision_prompt.md`                       | Quarantined       | `UI_DESIGN_MASTER_PROMPT_QUARANTINED.md`; current task is non-UI/product/infra.                                                                                                                                                                                                     | Execute only under Prompt 03/UI lane after service boundaries are stable.                                                                                        |
| `prompt_01_foundation_repo_environment_architecture.md`      | Tracked follow-on | Host compose roots under `infra/hosts/`; setup/architecture docs in `docs/MASTER_ARCHITECTURE.md`, `docs/EXECUTION_PLAN_INFRA.md`, `docs/infra/HOST-COMPOSE-INVENTORY.md`, `docs/infra/CONTAINER-SERVICE-MATRIX.md`; prompt path/domain mapping in `docs/PROMPT_PACK_EXECUTION.md`. | Validate `.gitmodules`/OpenClaw upstream handling, root setup/health commands, and any stale non-host compose guidance in a dedicated infra PR.                  |
| `prompt_02_ai_agents_routing_memory.md`                      | Tracked follow-on | Agent/memory routing appears in `AGENTS.md`, `docs/MASTER_ARCHITECTURE.md`, `docs/ops/WORKER_ROUTING.md`, host compose files, and Nexus/OpenClaw service roots.                                                                                                                     | Add one canonical agent-routing/MCP exposure matrix if existing docs do not already cover borrower-vs-operator tool restrictions end to end.                     |
| `prompt_03_crm_twentycrm_lead_ingestion.md`                  | Locally validated | `services/crm-api` write-plan execution/audit boundary; `services/lead-ingestion` CRM write-plan handoff; `packages/crm-types`; lead ingestion and CRM API tests.                                                                                                                   | Finish live Twenty custom object provisioning and production endpoint smoke tests once credentials/runtime are available.                                        |
| `prompt_05_comms_campaigns_twilio_sendgrid.md`               | Tracked follow-on | Service roots exist for `services/campaign-service`, `services/compliance-service`, `services/communication-service`, and Twilio integration.                                                                                                                                       | Build inbound reply/STOP webhook normalization, pause/stop campaign state transitions, provider event logging, and tests.                                        |
| `prompt_06_workflow_automation_n8n_activepieces_composio.md` | Tracked follow-on | Workflow specs and compose roots exist; n8n/Activepieces are present as execution substrates.                                                                                                                                                                                       | Create/finish workflow IR and workflow-consumer contracts so workflow JSON is not canonical business truth.                                                      |
| `prompt_07_backend_apis_webhooks_contracts.md`               | Tracked follow-on | Service boundaries and typed packages exist; PR #440 strengthens CRM/lead ingestion contracts.                                                                                                                                                                                      | Add endpoint contract inventory, webhook auth/idempotency matrix, and provider mocks around campaign/comms/quote flows.                                          |
| `prompt_08_auth_security_secrets_compliance.md`              | Tracked follow-on | Infisical docs and sidecar compose wiring exist; ADR auth decision now points to Nyra-controlled auth boundaries; compliance service roots exist.                                                                                                                                   | Validate every host compose stack against the Infisical sidecar pattern and add missing secret names to staging examples.                                        |
| `prompt_09_admin_portal_behavior_non_ui.md`                  | Tracked follow-on | `apps/projectnyra` is canonical internal app; service roots exist for backend behavior.                                                                                                                                                                                             | Produce route/API/action contract for lead, quote, campaign, health, assistant, and integration pages before UI styling work.                                    |
| `prompt_10_devops_gitea_waveterm_operator_tooling.md`        | Tracked follow-on | Gitea/Paperclip/worker/operator docs and compose files exist; Makefile has multiple operational targets.                                                                                                                                                                            | Validate Gitea runner/webhooks, Paperclip placement, WaveTerm/Zellij command deck, SearXNG/Browserless deployment intent, and Infisical refresh troubleshooting. |
| `prompt_12_final_integration_synthesis.md`                   | Closed for import | This track now holds source prompt archive, prompt mapping, risk register, validation matrix, and this status review.                                                                                                                                                               | No untriaged prompt text remains; unresolved execution belongs to the follow-on work named above.                                                                |

## Duplicate Handling

The folder includes `- Copy.md` and `(1)` duplicates. Canonical execution uses the non-copy filenames above. Duplicates are preserved as raw source material and should not create duplicate work items.

## Follow-On Execution Order

1. Complete Prompt 08 infra/security validation: host compose Infisical sidecar coverage, env examples, and owner manual actions.
2. Complete Prompt 05/07 together: inbound SendGrid/Twilio reply handling, STOP/unsubscribe normalization, campaign pause/stop, audit events, and tests.
3. Complete Prompt 06: workflow IR and n8n/Activepieces consumer contract.
4. Complete Prompt 02: canonical agent/MCP exposure matrix if repo docs remain split.
5. Complete Prompt 09: internal webapp route/action/API contract.
6. Revisit Prompt 01/10 infra/operator gaps after the service contracts are stable.
7. Keep UI prompt quarantined until explicitly scheduled.
