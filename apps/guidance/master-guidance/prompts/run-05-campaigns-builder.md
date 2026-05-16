# Prompt Run 05: Campaigns And Builder

```text
You are Codex working in Project Nyra.

Run label: 05-campaigns-builder
Timebox: 90-150 minutes
Context budget: campaigns routes only
Primary scope: apps/nyra-webapp/app/campaigns/** plus route-local mock data/components if needed

Read first:
- AGENTS.md
- apps/guidance/master-guidance/07-campaign-compliance-quote-spec.md
- apps/guidance/master-guidance/09-component-harvest-matrix.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Harvest legacy campaign dashboard concepts into webapp campaigns and builder routes.

Tasks:
- Add campaign KPI cards, campaign cards, active enrollment table, recent leads assignment queue, timeline, provider badges, response metrics, compliance block queue.
- Build sequence-builder blueprint with timing, channel, template, provider, compliance badge, retry policy, step cards, save draft, validate, and disabled publish state.
- Include step types for SMS, email, voice call, voicemail, broker task, wait, condition, quote reminder, document request, AI summary, CRM update, and webhook.

Do not:
- Send real SMS/email.
- Bypass consent/DNC/quiet-hours checks.
- Treat n8n/Activepieces as product UI.

Validation:
- pnpm --filter mortgage-assistant typecheck
- pnpm --filter mortgage-assistant lint
- pnpm --filter mortgage-assistant build
- git diff --check -- apps/nyra-webapp

Final response:
- Files changed.
- Campaign safety gates visible.
- Validation evidence.
- Remaining campaign wiring.
```
