# Component Brief: Unified Internal Webapp

Canonical destination:
- [apps/webapp/app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)

Primary sources:
- [webapp-merge merged scaffold](/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app)
- [current webapp app](/home/ellisapotheosis/repos/project-nyra/apps/webapp/app)
- [admin prototype](/home/ellisapotheosis/repos/project-nyra/apps/admin/app)
- [mortgage-crm prototype](/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm)

Target routes:
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

Expected feature sourcing:
- `assistant`, `campaigns`, `openclaw`: from `apps/webapp/app`
- `pipeline`, `quotes`, `stats`: from `apps/admin/app`
- `crm`, `applications`, `lead overviews`: from `apps/mortgage-crm`
- route structure, branding merge, and shared shell: from `webapp-merge/next-app`

Hard constraints:
- single internal product on `app.projectnyra.com`
- no separate admin app in final product
- no Clerk in final product
- leave `apps/twenty` untouched
