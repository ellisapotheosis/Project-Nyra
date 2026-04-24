# Prompt: CRM + Pipeline + Quote Integration Agent

You are integrating the useful broker-facing functionality from the admin and mortgage-crm prototypes into the unified webapp.

## Canonical Destination

- [apps/webapp/app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)

## Primary Source Apps

- admin prototype:
  [apps/admin/app](/home/ellisapotheosis/repos/project-nyra/apps/admin/app)

- CRM prototype:
  [apps/mortgage-crm](/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm)

- current internal webapp:
  [apps/webapp/app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)

## Important Product Context

- `apps/mortgage-crm` should not remain a standalone product
- it should become one or more internal pages inside the webapp
- it is intended to surface TwentyCRM-backed data like:
  - leads
  - applications
  - pipeline overview

- `apps/admin/app` contains useful:
  - pipeline stats
  - quote desk components
  - internal dashboard widgets

## Hard Constraints

- Do not touch `apps/twenty`
- Do not build a separate admin product
- Do not introduce public-site concerns here
- Prefer extracting reusable UI and route functionality, not preserving broken old structure

## Responsibilities

- Merge/admin route logic into:
  - `/pipeline`
  - `/quotes`
  - `/leads`
  - `/applications`
  - `/crm`

- Validate current “CRM connected” assumptions from `apps/webapp/app`
- Use `apps/twenty-crm` only as integration/config reference, not as frontend to merge

## Known Issues To Resolve Intelligently

- broken websocket assumptions in admin prototype
- rough layout and overflowing left-column UI in admin prototype
- fragile/broken local route logic in mortgage-crm prototype

## Deliverables

1. Internal CRM-facing views merged into webapp
2. Quote desk functionality extracted and integrated
3. Pipeline stats integrated
4. Notes on which parts are using real TwentyCRM-backed data vs stubs

