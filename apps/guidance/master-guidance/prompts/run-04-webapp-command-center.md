# Prompt Run 04: Webapp Command Center

```text
You are Codex working in Project Nyra.

Run label: 04-webapp-command-center
Timebox: 90-150 minutes
Context budget: webapp overview and shared mock data only
Primary scope: apps/nyra-webapp/app/page.tsx, apps/nyra-webapp/lib/**, app shell if required

Read first:
- AGENTS.md
- apps/guidance/master-guidance/02-webapp-command-center-spec.md
- apps/guidance/master-guidance/09-component-harvest-matrix.md
- apps/guidance/master-guidance/12-webapp-route-implementation-blueprints.md
- apps/guidance/master-guidance/17-current-progress-and-remaining-checklist.md

Mission:
Turn the webapp root route into a true internal broker command center.

Tasks:
- Replace implementation-note content with command-center blocks.
- Add lead queue, today tasks, campaign timeline, quote desk preview, CRM sync health, service status, quick actions, and compliance blocks.
- Add mock/fallback/live/degraded labels.
- Keep safe actions as links or disabled CTAs until services exist.
- Do not mutate Twenty or provider APIs from browser code.

Validation:
- pnpm --filter mortgage-assistant typecheck
- pnpm --filter mortgage-assistant lint
- pnpm --filter mortgage-assistant build
- git diff --check -- apps/nyra-webapp

Final response:
- Files changed.
- Route blocks completed.
- Validation evidence.
- Next route prompt.
```
