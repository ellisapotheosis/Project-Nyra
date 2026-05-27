# Plan: Omni Prompting Pack V3 Execution

## Phase A: Import And Normalize

- [x] Import raw v3 prompting pack into `conductor/prompts/nyra-omni-prompting-pack-v3`.
- [x] Create this Conductor execution track.
- [x] Normalize executable truth: Gastown replaces the retired workspace stack; UI/theme remains quarantined until explicitly assigned.

## Phase B: Prompt 00-01 Foundation

- [x] Update root agent contract (AGENTS.md) with full v3 stack truth, product surfaces, host topology, secrets model, full stack inventory.
- [x] Create `infra/env/nyra.env.v3.example` with all v3 env var placeholders.
- [x] Create `docs/CURRENT_STACK_TRUTH_V3.md` — 149 lines.
- [x] Verify/update existing foundation docs (PROJECT_NYRA_CONTEXT.md, ARCHITECTURE_NON_UI.md, DOMAIN_MODEL.md, INTEGRATION_CONTRACTS.md, SECURITY_AND_COMPLIANCE_GUARDRAILS.md) — all verified V3-accurate, no stale Gastown/webapp references.

## Phase C: Prompt 02 Integrations

- [x] All 11 integration adapter stubs verified present in `packages/integration-adapters/src/index.ts` (SupabaseAuth, SupabaseData, Twenty, Activepieces, N8nConstrained, NexusRouter, Letta, Mem0, OpenClaw, Nerve, Composio).
- [x] STOP/DNC gate tests verified passing in compliance.test.ts — 10 tests, 0 failures.

## Phase D: Prompt 03 Infra

- [x] `/infra/hosts/<host>` layout verified — all canonical compose files present across all 5 hosts.
- [x] Create per-host READMEs — oracle-vps/README.md (119 lines) + homeassistant-green/README.md (102 lines) created.
- [x] Create docs/ops/HOST_TOPOLOGY.md — 105 lines.
- [x] Create docs/ops/INFISICAL_DOCKER_CONTEXT_FLOW.md — 128 lines.
- [x] Create docs/ops/VOICE_MESH_RUNBOOK.md — 116 lines.
- [x] Create docs/ops/PORTAINER_SYNCTHING_RUNBOOK.md — 126 lines.
- [x] Create docs/ops/N8N_FALLBACK_POLICY.md — 101 lines.
- [x] Create docs/ops/NEXUS_HIVE_MIGRATION_NOTES.md — 97 lines.
- [x] Create docs/ops/SUPABASE_LOCAL_RUNBOOK.md — 129 lines.
- [x] Create docs/ops/BACKUP_AND_ARCHIVE_RUNBOOK.md — 121 lines.
- [x] Create docs/ops/INCIDENT_RESPONSE_RUNBOOK.md — 120 lines.
- [x] Add `context-list` and `all-health` convenience aliases to Makefile.

## Phase E: Prompt 04 Orchestration

- [x] Create docs/agents/LETTA_ORCHESTRATION.md — 136 lines.
- [x] Create docs/agents/OPENCLAW_NERVE_WORKER_MODEL.md — 123 lines.
- [x] Create docs/agents/GASTOWN_CLAWTEAM_COMPOSIO.md — 133 lines.
- [x] Create docs/agents/OPENCLAW_CRON_JOBS.md — 125 lines.
- [x] Create docs/memory/MEMORY_STACK_ROUTING.md — 113 lines.
- [x] Create docs/voice/KYUTAI_UNMUTE_MESH.md — 134 lines.

## Phase F: Prompt 05 Observability And Git

- [x] Create docs/ops/OBSERVABILITY_STACK.md — 92 lines.
- [x] Create docs/ops/METRICS_AND_LOGGING_CONVENTIONS.md — 110 lines.
- [x] Create docs/ops/GITEA_TEA_MCP_STRATEGY.md — 126 lines.
- [x] Create docs/ops/DEV_AGENT_TERMINAL_TOPOLOGY.md — 89 lines.

## Phase G: Prompt 06 Mortgage Services

- [x] Create docs/services/CRM_API.md — 277 lines.
- [x] Create docs/services/RATE_QUOTING.md — 252 lines.
- [x] Create docs/services/QUOTE_ENGINE.md — 226 lines.
- [x] Create docs/services/CAMPAIGN_ENGINE.md — 234 lines.
- [x] Create docs/services/MORTGAGE_EVENT_SCHEMA.md — 485 lines.

## Phase H: Prompt 07 QA

- [x] Run targeted typecheck/tests and config scans.
- [x] Scan for conflict markers and no secrets.
- [x] Produce `docs/reports/NON_UI_FOUNDATION_QA_REPORT.md`.
- [x] Update `docs/AGENT_HANDOFFS.md` with completion status.

## Owner-Gated Remaining Work

- [~] Renew Infisical machine tokens and run live `secrets-init` completion checks on every host — owner-gated.
- [~] Finish Cloudflare DNS, Access, gtunnel, and service-token setup for the new domains — owner-gated.
- [~] Run live lead lifecycle, provider callback, and domain smoke tests after secrets/domains are ready — owner-gated.
- [x] Execute the explicitly assigned prompt 08 safe slice: dependency validation and theme registry/provider/switcher.
- [~] Continue broader UI work only after a future explicit assignment: landing polish, webapp shell, component matrices, and design artifacts.
