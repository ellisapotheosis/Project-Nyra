# Repository Consolidation Plan (Pending Owner Confirmation)

Status: **Planning complete; destructive implementation is intentionally paused for your approval.**

## Objective
Consolidate Project Nyra into a clear three-app stack:
1. Landing Page (`docs/landing-page`)
2. Webapp / Mortgage Assistant core (`docs/webapp`)
3. Twenty CRM (`docs/twenty-crm`)

## Scope Covered in This Planning Pass
- Built a top-level execution plan for phased cleanup and migration.
- Created canonical documentation roots for the three-app structure.
- Produced a full Webapp spec/whitepaper and a Zero-Question agent prompting plan.
- Defined the canonical workflow docs location under `docs/webapp/workflows`.

## Legacy Target Set for Purge (Phase 1)
The following legacy stacks are flagged for removal from docs/infra/scripts references and artifacts:
- ruflo
- claude-flow
- ruvector
- flow-nexus
- ruv-swarm
- agentic-flow
- agentdb
- agent booster
- epic sdk
- sona

## Proposed Destructive Actions (Not Yet Executed)
After confirmation, the implementation pass will:
- Delete legacy docs and integration notes that target retired stacks.
- Remove obsolete script branches and dead commands that only serve legacy components.
- Keep current utility scripts functional while stripping legacy pathways.
- Rehome n8n workflow documentation under:
  - `docs/webapp/workflows/n8n`

## Inventory Findings (High Signal)
- Legacy references are widespread across `docs`, `infra/docs`, and `scripts` and need an orchestrated sweep.
- Active automation still includes n8n in multiple places, which is in-scope as internal glue and should be retained for Webapp orchestration.
- Activepieces references are legacy/deprecated and should not be reintroduced into the target architecture.
- Existing workflow docs are split between `docs/n8n-consolidation` and `infra/n8n-workflows`; these should be mirrored into the new docs webapp workflow canon during migration.

## Execution Safety Guardrails
- No removal of Twilio / SendGrid / n8n / Twenty CRM pathways.
- No mutation of compliance enforcement semantics.
- No secret exposure in docs/scripts.
- Every destructive change will be accompanied by validation checks and rollback notes.

## Confirmation Gate
Reply with **"Approved: proceed with implementation"** and I will execute Phase 1/2/4 refactors and cleanup in commit-sized steps with validation after each step.
