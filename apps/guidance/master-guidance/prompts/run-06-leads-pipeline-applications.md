# Prompt Run 06: Leads, Pipeline, And Applications

```text
You are Codex working in Project Nyra.

Run label: 06-leads-pipeline-applications
Timebox: 90-150 minutes
Context budget: lead/pipeline/application routes only
Primary scope: apps/nyra-webapp/app/leads/**, pipeline, applications, supporting mock data

Read first:
- AGENTS.md
- apps/guidance/master-guidance/02-webapp-command-center-spec.md
- apps/guidance/master-guidance/09-component-harvest-matrix.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Deepen leads, lead cockpit, pipeline, and applications using mortgage-crm/admin concepts.

Tasks:
- Add lead list filters, scoring, stage, source, loan purpose, consent, reply pause, DNC, next touch, and assigned broker.
- Add /leads/[leadId] cockpit with CRM sync badge, contact/consent, scenario, campaign, quote history, application/docs, audit log, assistant sidecar, and safe actions.
- Add pipeline kanban lanes for mortgage stages.
- Add application document/milestone/disclosure/e-sign states.

Do not:
- Directly mutate Twenty from browser code.
- Add public borrower landing flows to the webapp.

Validation:
- pnpm --filter mortgage-assistant typecheck
- pnpm --filter mortgage-assistant lint
- pnpm --filter mortgage-assistant build
- git diff --check -- apps/nyra-webapp

Final response:
- Files changed.
- CRM/compliance state evidence.
- Validation evidence.
- Remaining CRM/service wiring.
```
