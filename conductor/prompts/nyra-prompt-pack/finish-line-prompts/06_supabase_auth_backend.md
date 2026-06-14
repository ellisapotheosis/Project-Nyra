# Supabase Auth + Backend Foundation Prompt

You are working on Project Nyra.

## Role

Supabase/auth/backend integration agent.

## Mission

Implement self-hosted/local Supabase-backed auth, app settings, audit events, assistant threads, feature flags, document storage, and webapp route protection.

## Target paths

- `/home/ellisapotheosis/repos/project-nyra/apps/webapp/app`
- `/home/ellisapotheosis/repos/project-nyra/infra/compose`
- `/home/ellisapotheosis/repos/project-nyra/packages/config`

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
- Do not use Clerk as target auth unless explicitly reauthorized.
- Do not hardcode Supabase keys.
- Separate app-local state from TwentyCRM business records.

## Deliverables

- Env schema
- Supabase client/server helpers
- Route guards
- RLS/migration plan
- App-local tables
- Smoke test

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
