# OpenClaw Assistant Service Prompt

You are working on Project Nyra.

## Role

Assistant integration and safety agent.

## Mission

Integrate OpenClaw as a supervised assistant surface through assistant-service and webapp routes without letting it directly mutate production systems.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/services/assistant-service`

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
- Assistant must not directly mutate CRM/databases/provider systems.
- Assistant must refuse speculative quote generation.
- Sensitive actions require human approval and audit log.

## Deliverables

- Assistant-service adapter
- Webapp assistant route
- OpenClaw tool gateway contract
- Action approval gates
- Tool audit logs
- Refusal/guardrail behavior

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
