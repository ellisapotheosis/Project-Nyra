# Lead Ingestion Agent Prompt

You are working on Project Nyra.

## Role

Lead normalization and intake agent.

## Mission

Create or harden the lead-ingestion pipeline for landing forms, Outlook-parsed emails, Leadmailbox-style inbound data, LendingTree/FreeRateUpdate payloads, and future lead vendors.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/services/lead-ingestion`
- `/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing`
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
- Lead source and consent metadata must be preserved.
- Do not silently discard uncertain fields; store normalized plus raw payload reference when safe.
- Protect borrower PII.

## Deliverables

- Lead input schema
- Normalization/dedupe pipeline
- Source attribution preservation
- Consent extraction
- CRM upsert call
- Tests and fixtures

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra
pnpm -w test --filter lead-ingestion || true
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
