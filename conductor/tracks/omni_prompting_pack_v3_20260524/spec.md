# Spec: Omni Prompting Pack V3 Execution

## Objective

Integrate every prompt, stack map, TODO, acceptance criterion, and handoff from the downloaded v3 prompting pack into Conductor, then execute all non-UI runnable work until only validated-complete or owner-gated tasks remain.

## Scope

- Preserve raw prompting pack under `conductor/prompts/nyra-omni-prompting-pack-v3`.
- Convert agent prompts 00-07 into an executable Conductor plan.
- Execute prompt 08 only when explicitly assigned; completed safe slice is dependency validation and theme registry/provider/switcher.
- Patch repo contracts, docs, scripts, tests, and handoff reports.

## Supersessions

- Raw source references to the retired workspace are treated as legacy. The active implementation uses Gastown.
- Raw source references to `/apps/webapp` are treated as stale where the active app is `apps/projectnyra`.
- Oracle live service validation depends on owner-provided Infisical and Cloudflare/domain state.

## Done

- All prompt files exist in Conductor.
- All non-UI prompts are either executed, already satisfied by repo state, or explicitly tracked as owner-gated.
- Validation output is captured in `docs/reports/NON_UI_FOUNDATION_QA_REPORT.md`.
