# Landing Page Agent Prompt

You are working on Project Nyra.

## Role

Borrower-facing landing page implementation agent.

## Mission

Finalize `ratehunter.net` as a polished borrower-facing Cloudflare Pages landing site that preserves Carrd identity while improving UI and lead capture.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing`
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
- No internal broker/admin/CRM routes in the landing app.
- Preserve phone, Calendly, links, bio, job titles, and borrower messaging.
- Do not import server-only internal webapp modules.

## Implementation steps

1. Inventory current Carrd-derived content and section order.
2. Inventory borrower-facing content from localhost:3101/source app if available.
3. Migrate theme tokens carefully without breaking current identity.
4. Build lead form with UTM/referrer/consent metadata.
5. Ensure server route posts only to approved lead-ingestion endpoint.

## Deliverables

- Carrd-preserving landing UI
- Borrower-only routing
- Lead form validation
- Attribution capture
- Consent capture
- Cloudflare Pages build notes

## Validation

```bash
cd /home/ellisapotheosis/repos/project-nyra/apps/landing/ratehunter-landing
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
