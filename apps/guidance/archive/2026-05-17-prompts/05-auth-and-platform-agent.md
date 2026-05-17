# Prompt: Auth + Platform Cleanup Agent

You own platform cleanup for the unified internal webapp.

## Canonical Destination

- [apps/projectnyra](/home/ellisapotheosis/repos/project-nyra/apps/projectnyra)

## Source Material

- current webapp:
  [apps/projectnyra](/home/ellisapotheosis/repos/project-nyra/apps/projectnyra)

- admin auth references:
  [apps/admin/app/src/contexts/AuthContext.tsx](/home/ellisapotheosis/repos/project-nyra/apps/admin/app/src/contexts/AuthContext.tsx)

- TwentyCRM integration/config references:
  [apps/twenty-crm](/home/ellisapotheosis/repos/project-nyra/apps/twenty-crm)

## Hard Decisions

- Clerk should be removed from the final broker-facing app
- preferred direction is local-first auth with Supabase hosted on Oracle VPS
- internal app must remain broker/coworker facing

## Responsibilities

- identify all Clerk dependencies and auth touchpoints
- propose and/or implement Supabase-compatible auth replacement path
- remove dead or costly SaaS auth assumptions
- document required env vars and deployment assumptions for Oracle VPS hosting
- audit websocket dependencies and classify which are real requirements vs placeholder assumptions

## Deliverables

1. Auth dependency audit
2. Clerk removal plan or implementation
3. Supabase local/VPS integration plan
4. Websocket dependency audit
5. Platform env/config notes for Oracle deployment
