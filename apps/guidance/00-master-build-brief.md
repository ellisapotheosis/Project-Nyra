# Master Build Brief

## Product Split

There are two separate products:

1. Public site: `ratehunter.net`
   - Target app: [apps/ratehunter/landing](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing)
   - Audience: borrowers and clients
   - Deployment target: Cloudflare Pages
   - Must not contain internal broker/admin/CRM routes

2. Internal app: `app.projectnyra.com`
   - Target app: [apps/projectnyra](/home/ellisapotheosis/repos/project-nyra/apps/projectnyra)
   - Audience: Ellis, coworkers, mortgage brokers, real estate brokers, branch-manager-facing workflows
   - Must become a single multi-page app with consolidated internal routes

## Keep / Do Not Touch

- Keep public landing separate from internal app
- Leave [apps/twenty](/home/ellisapotheosis/repos/project-nyra/apps/twenty) untouched
- Preserve `/home/ellisapotheosis/repos/webapp-merge` as backup source
- Use [apps/guidance/references/webapp-merge-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot) as the in-repo frozen copy of that source material

## What The Existing Apps Mean

- [apps/ratehunter/landing](/home/ellisapotheosis/repos/project-nyra/apps/ratehunter/landing)
  Real public landing page target. Borrower-facing only.

- [apps/projectnyra](/home/ellisapotheosis/repos/project-nyra/apps/projectnyra)
  Main internal app candidate. Contains assistant, campaigns, active leads, analytics, and some CRM-connected assumptions.

- [apps/admin/app](/home/ellisapotheosis/repos/project-nyra/apps/admin/app)
  Internal dashboard prototype. Useful for pipeline, stats, quote desk, internal widgets. Should be merged into the webapp, not preserved as separate product.

- [apps/mortgage-crm](/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm)
  CRM-oriented app/prototype. Should become an internal page or feature area in the webapp, not a standalone product. Purpose is to surface leads, applications, and pipeline views backed by TwentyCRM data.

- [apps/twenty](/home/ellisapotheosis/repos/project-nyra/apps/twenty)
  Leave untouched. Current shell tied to existing TwentyCRM setup.

- [apps/twenty-crm](/home/ellisapotheosis/repos/project-nyra/apps/twenty-crm)
  Infrastructure/config/integration package around the TwentyCRM Docker stack. Not the frontend app to visually merge. Use as reference for integration points, env vars, compose, and scripts.

## Final Webapp Route Direction

Recommended internal app routes under `app.projectnyra.com`:

- `/`
- `/assistant`
- `/campaigns`
- `/campaigns/builder`
- `/leads`
- `/applications`
- `/quotes`
- `/pipeline`
- `/crm`
- `/settings`
- `/tools/openclaw`

## Public Landing Direction

Public site must:

- preserve Carrd identity, content, bio, job titles, phone, buttons, links, Calendly, and borrower-facing messaging
- incorporate the best borrower-facing content from the current `localhost:3101` app
- keep Carrd background/look/section ordering as source of truth
- replace generic elements with shadcn + magicUI where appropriate
- stay isolated from internal app routing

## Theme Direction

Desired design-system source for both public and internal UI:

- TweakCN/shadCN theme from:
  [references/webapp-merge-snapshot/next-app](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app)

Why it is not showing up now:

- the theme lives in the `webapp-merge` scaffold, not in the currently running `project-nyra/apps/*` apps
- the live apps use their own `globals.css`, Tailwind configs, and component libraries
- `index.css` or `globals.css` usually contains the CSS variables, but the full theme migration requires:
  - copying/importing the token CSS
  - wiring components to those tokens
  - removing conflicting local styles

## Required Backup Rule

Before modifying any major app:

- preserve `/home/ellisapotheosis/repos/webapp-merge`
- also keep the copied reference snapshot under:
  [apps/guidance/references/webapp-merge-snapshot](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot)

## Recommended Agent Breakdown

1. Backup + Inventory
2. Landing Page
3. Webapp Shell + Theme
4. CRM + Pipeline + Quotes
5. Auth + Platform Cleanup
6. Integration Orchestrator
