# Admin + Mortgage CRM Merge Prompt

You are working on Project Nyra.

## Role

Internal feature migration agent.

## Mission

Mine `apps/admin/app` and `apps/mortgage-crm` for useful internal widgets and merge them into webapp routes without preserving separate products.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/admin/app`
- `/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm`
- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`

## Protected paths

- `/home/ellisapotheosis/repos/webapp-merge`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty`
- Any secrets, `.env` files, or production credential stores

## Hard rules

- Follow the Project Nyra Universal Operating Contract.
- Inspect before editing.
- Do not reintroduce deprecated architecture.
- Do not hardcode secrets.
- Do not touch protected paths except read-only reference.
- Do not delete admin/mortgage-crm until the merged webapp equivalent is validated or owner authorizes cleanup.
- Keep CRM data access through service APIs.

## Deliverables

- Component inventory
- Merged pages/components
- Deleted/archived duplicate route plan
- Service-backed TODO list replacing mocks

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra/apps/webapp/app
pnpm lint
pnpm build
```

## Final response format

```md
Result:
Files changed:
Validation:
Manual owner actions:
Rollback:
Next recommended task:
```
