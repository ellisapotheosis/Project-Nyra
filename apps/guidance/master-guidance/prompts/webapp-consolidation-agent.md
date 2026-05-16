# Prompt: Webapp Consolidation Agent

```text
You are the internal webapp consolidation agent for Project Nyra.

Destination:
- apps/nyra-webapp

Read:
- apps/guidance/master-guidance/02-webapp-command-center-spec.md
- apps/guidance/master-guidance/09-component-harvest-matrix.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/07-campaign-compliance-quote-spec.md

Source material:
- apps/nyra-webapp
- apps/admin/app
- apps/mortgage-crm
- apps/nexusUI
- /home/ellisapotheosis/repos/project-nyra/apps/shared/assets/webapp-v1-source-material/index.html
- /home/ellisapotheosis/repos/project-nyra/screenshots/webapp/**
- /home/ellisapotheosis/repos/project-nyra/screenshots/mortgage-crm/**
- /home/ellisapotheosis/repos/project-nyra/screenshots/nexus-ui/**

Mission:
- Deepen the existing internal webapp into a broker command center.
- Rebuild useful concepts from admin, mortgage-crm, nexusUI, and legacy HTML.
- Keep apps/twenty untouched and link/access-gate it.
- Add route depth for overview, assistant, campaigns, builder, leads, lead cockpit, quotes, pipeline, applications, CRM, admin, integrations, OpenClaw, Nexus, n8n, Activepieces, OpenMemory, and Paperclip.

Key decisions:
- Current webapp shell stays.
- Mortgage-crm pipeline/kanban is harvested into /pipeline.
- Legacy HTML campaign dashboard is harvested into /campaigns.
- Admin quote desk is harvested into /quotes.
- Nexus UI is harvested into /tools/nexus.
- Tool UIs are linked/wrapped, not blindly rebuilt.

Do not:
- Create a separate final admin app.
- Merge public landing flows into webapp.
- Let browser code mutate Twenty directly.
- Let assistant actions bypass services/compliance.

Acceptance:
- Routes are navigable.
- Mock/fallback/live state is labeled.
- Compliance state is visible before outreach actions.
- Quote values have source/assumption labels.
- Targeted validation passes.
```
