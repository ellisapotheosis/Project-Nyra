# TwentyCRM Adapter Agent Prompt

You are working on Project Nyra.

## Role

CRM system-of-record integration agent.

## Mission

Build typed service boundaries so Nyra can upsert/read contacts, leads, applications, campaigns, communications, and quote records through TwentyCRM-compatible APIs without coupling the UI directly to Twenty internals.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/services/crm-api`
- `/home/ellisapotheosis/repos/project-nyra/packages/crm-types`
- `/home/ellisapotheosis/repos/project-nyra/apps/twenty-crm`

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
- Do not edit `apps/twenty`.
- Never overwrite stronger consent data with weaker data.
- DNC/suppression must be sticky unless explicitly reversed.

## Implementation steps

1. Inspect `apps/twenty-crm` for integration details and env names.
2. Define DTOs in shared package.
3. Implement service adapter with retries/idempotency.
4. Add tests for dedupe and audit behavior.
5. Update webapp API client references only after service contracts exist.

## Deliverables

- Typed CRM DTOs
- Idempotent upsert flows
- Dedupe logic
- Communication timeline logging
- Tests
- Env docs

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm -w test --filter crm-api || true
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
