# Prompt: Unified Webapp Shell + Theme Agent

You are responsible for the broker-facing product at `app.projectnyra.com`.

## Canonical Destination

- [apps/webapp/app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)

## Source Material

- merged scaffold/theme base:
  [guidance snapshot next-app](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app)

- current internal webapp:
  [apps/webapp/app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)

- admin prototype:
  [apps/admin/app](/home/ellisapotheosis/repos/project-nyra/apps/admin/app)

- CRM prototype:
  [apps/mortgage-crm](/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm)

## Hard Constraints

1. This app is internal broker/coworker facing
2. It must become a single multi-page app
3. Do not leave it as fragmented apps/subdomains
4. Do not touch `apps/twenty`
5. Do not integrate public landing-site routes into the internal app
6. Preserve `/home/ellisapotheosis/repos/webapp-merge` as backup source only

## Responsibilities

- Establish canonical route structure
- Port the TweakCN/shadCN theme system into the actual destination app
- Migrate branding assets
- Build a consistent shell, nav, layout, and route hierarchy
- Prepare the app to receive functionality from admin and CRM prototypes

## Target Routes

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

## Theme Requirements

Theme source:
- [theme migration brief](/home/ellisapotheosis/repos/project-nyra/apps/guidance/components/03-theme-migration-brief.md)

Ensure:
- TweakCN variables are actually imported
- components use the shared token contract
- current old globals do not override the theme

## Deliverables

1. Unified internal app shell
2. Working route structure
3. TweakCN/shadCN theme actually active
4. Branding/logo sizing corrected
5. Clear notes on what is still stubbed vs real
