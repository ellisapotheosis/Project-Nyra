# Campaign Builder + Campaign Service Prompt

You are working on Project Nyra.

## Role

Campaign product and state-machine agent.

## Mission

Build the Nyra-owned campaign builder and campaign-service so follow-up logic is canonical in Nyra, while n8n remains execution-only.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/services/campaign-service`
- `/home/ellisapotheosis/repos/project-nyra/packages/campaign-domain`
- `/home/ellisapotheosis/repos/project-nyra/workflows/n8n`

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
- n8n is not the campaign source of truth.
- Stop-on-reply and STOP/unsubscribe are mandatory.
- Do not autonomously enable external sends without compliance gates.

## Implementation steps

1. Define campaign schema and validation.
2. Create builder UI for draft/active/paused/archived campaigns.
3. Implement state transitions.
4. Emit execution jobs for n8n/provider layer.
5. Log every execution result back to service/CRM timeline.

## Deliverables

- CampaignDefinition schema
- Builder UI
- Campaign state machine
- Enrollment rules
- n8n execution job contract
- Tests

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm -w test --filter campaign-service || true
pnpm -w build
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
