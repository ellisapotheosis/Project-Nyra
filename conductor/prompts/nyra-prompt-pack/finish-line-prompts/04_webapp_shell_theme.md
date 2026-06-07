# Webapp Shell + Theme Agent Prompt

You are working on Project Nyra.

## Role

Internal app shell and design-system agent.

## Mission

Turn `apps/webapp/app` into the unified internal shell for broker/admin/assistant/CRM/quote workflows and migrate the TweakCN/shadcn theme.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/apps/admin/app`
- `/home/ellisapotheosis/repos/project-nyra/apps/mortgage-crm`
- `/home/ellisapotheosis/repos/project-nyra/apps/guidance/references/webapp-merge-snapshot/next-app`

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
- Do not collapse landing into webapp.
- Do not preserve `apps/admin` as a standalone product.
- Read admin/mortgage-crm as source material; merge useful parts into webapp.

## Implementation steps

1. Inventory current webapp routes and components.
2. Inventory admin and mortgage-crm reusable widgets.
3. Create target internal route tree.
4. Import token CSS from snapshot and resolve Tailwind/global conflicts.
5. Centralize shell components under components/shell.
6. Keep page components thin.

## Deliverables

- Route shell
- Navigation/sidebar/topbar
- Theme token migration
- Reusable layout components
- Loading/error/empty states
- Build validation

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
