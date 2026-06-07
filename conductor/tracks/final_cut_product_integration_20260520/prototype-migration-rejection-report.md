# Prototype Migration/Rejection Report

Date: 2026-05-20

## Decision

Do not archive additional prototype/source-material folders in this pass.

## Reviewed Locations

- `apps/guidance/references/`
- `data/app-guidance/`
- `data/project-requirements/`

## Disposition

These folders are source snapshots and requirements/reference material, not
runtime app surfaces. The active product implementation lives under
`apps/projectnyra`, `apps/ratehunter`, `services/*`, `packages/*`, and
`infra/hosts/*`.

Archive movement should happen only after each source snapshot has a named
replacement or an explicit rejection entry. No additional local archive action
was taken because the current folders still contain mortgage workflow,
campaign, quote, compliance, and source-upload material that may be needed for
owner review.

## Follow-Up Rule

Future archive work should use this rule:

- Migrate useful product requirements into `docs/`, `services/*`, or
  `packages/*` with direct file references.
- Record rejected prototype behavior in this report or a successor report.
- Only then move the old source folder to a dated archive slice.
