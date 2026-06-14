# Pipeline + Applications Prompt

You are working on Project Nyra.

## Role

Internal broker operations UI agent.

## Mission

Build service-backed leads, applications, pipeline, and CRM pages inside the internal webapp.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/services/crm-api`

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
- Do not use mock data as final behavior.
- Mutations should go through typed service APIs.
- Preserve audit trail for status changes.

## Deliverables

- Lead list/detail
- Application list/detail
- Pipeline board
- CRM page
- Service-backed data hooks
- Empty/loading/error states

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
