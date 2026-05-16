# Team Kickoff: Master Guidance Runs

Date: 2026-05-11

## Coordinator Notes

This team run was requested from a Codex App session outside tmux. The coordinator bootstrapped a tmux-backed OMX team run from the shell and created this assignment note so workers can choose distinct lanes without overlapping.

OMX runtime note:

- `tmux` and `omx` were available, but `omx team` refused to launch because this bbaa worktree is dirty and the installed team runtime always provisions dedicated worker worktrees.
- The exact runtime blocker was `leader_workspace_dirty_for_worktrees ... commit_or_stash_before_omx_team`.
- Because the runbook forbids staging/committing/stashing/resetting for these runs, the coordinator did not alter Git state to satisfy that precondition.
- Fallback execution uses native Codex executor agents with the same lane map and reporting contract.

Shared context snapshot:

- `.omx/context/master-guidance-team-20260511T141923Z.md`

Standing rules:

- Preserve unrelated local changes.
- Do not reset, checkout, bulk-merge, stage, commit, push, deploy, or open PRs.
- Do not delete docs, prompts, archives, source material, or user work.
- Update `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md` before reporting complete.
- Write or update a lane report under `apps/guidance/master-guidance/reports/`.
- Keep public landing, internal webapp, CRM, quote, compliance, and infrastructure boundaries from `AGENTS.md` and `00-agent-operating-contract.md`.

## Worker Lane Map

### worker-1: Hygiene And Preservation

Prompt:

- `apps/guidance/master-guidance/prompts/run-01-repo-hygiene-preservation.md`

Primary write scope:

- `docs/OWNER_MANUAL_ACTIONS.md`
- `apps/guidance/master-guidance/reports/run-01-hygiene-report.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`
- `.gitignore` only if needed for narrow unignore rules

Do not edit app UI.

### worker-2: Landing Finish Line

Prompt:

- `apps/guidance/master-guidance/prompts/run-03-landing-finish-line.md`
- Reference: `apps/guidance/master-guidance/prompts/landing-finish-line-agent.md`

Primary write scope:

- `apps/ratehunter-landing/**`
- `apps/guidance/master-guidance/reports/run-03-landing-finish-line.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`

Do not add internal admin/tool links to the public landing app.

### worker-3: Webapp Command Center

Prompt:

- `apps/guidance/master-guidance/prompts/run-04-webapp-command-center.md`
- Reference: `apps/guidance/master-guidance/prompts/webapp-consolidation-agent.md`

Primary write scope:

- `apps/nyra-webapp/app/page.tsx`
- `apps/nyra-webapp/lib/**`
- app shell/header only if required
- `apps/guidance/master-guidance/reports/run-04-webapp-command-center.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`

Do not add direct CRM mutation or raw workflow links.

### worker-4: Campaigns, Leads, And Quotes

Prompts:

- `apps/guidance/master-guidance/prompts/run-05-campaigns-builder.md`
- `apps/guidance/master-guidance/prompts/run-06-leads-pipeline-applications.md`
- `apps/guidance/master-guidance/prompts/run-07-quotes-rate-intelligence.md`

Primary write scope:

- `apps/nyra-webapp/app/campaigns/**`
- `apps/nyra-webapp/app/leads/**`
- `apps/nyra-webapp/app/pipeline/**`
- `apps/nyra-webapp/app/applications/**`
- `apps/nyra-webapp/app/quotes/**`
- related route-local mock/domain data
- `apps/guidance/master-guidance/reports/run-05-07-workflow-routes.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`

Keep send/publish/quote actions disabled or service-boundary only unless backing service contracts exist.

### worker-5: CRM, Tools, Contracts, And Integration Mocks

Prompts:

- `apps/guidance/master-guidance/prompts/run-08-crm-integrations-tools.md`
- `apps/guidance/master-guidance/prompts/run-09-non-ui-contracts-integrations.md`
- Reference: `apps/guidance/master-guidance/prompts/service-integration-agent.md`

Primary write scope:

- `apps/nyra-webapp/app/crm/**`
- `apps/nyra-webapp/app/admin/integrations/**`
- `apps/nyra-webapp/app/tools/**`
- `packages/**`
- `services/**` only where contracts already exist or are clearly scoped
- `apps/guidance/master-guidance/reports/run-08-09-integrations-contracts.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`

Keep Twenty as system of record and do not expose raw model/database/MCP endpoints.

### worker-6: Infra, Ops, CI, And Verification

Prompt:

- `apps/guidance/master-guidance/prompts/run-10-infra-ops-ci.md`

Primary write scope:

- `.github/workflows/**`
- `.github/codeql-config.yml`
- `scripts/ci/**`
- `infra/hosts/**`
- `ops/**`
- `docs/**`
- `apps/guidance/master-guidance/reports/run-10-infra-ops-ci.md`
- `apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md`

Do not expose worker inference, raw databases, Redis, FalkorDB, Qdrant, Portainer, raw MCP internals, or private GPU services.

## Completion Evidence Required From Each Worker

- Files changed.
- What was completed.
- What remains.
- Validation command output or clear reason validation could not run.
- Any blockers requiring owner/user action.
