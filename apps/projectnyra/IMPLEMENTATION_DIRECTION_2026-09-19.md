# Project Nyra Webapp — Implementation Direction

This file supplements the existing app README. It is the current direction for implementation work.

## Canonical ownership

- `apps/projectnyra/` is the only destination for new Project Nyra broker/customer/operator pages.
- `apps/admin/` and `apps/mortgage-crm/` are source material only.
- Twenty CRM remains the system of record for CRM business records.
- Supabase on Oracle VPS owns webapp authentication and application backend data that belongs in Supabase.

## Planned product surfaces

`/admin`, `/assistant`, `/crm`, `/campaigns`, `/campaigns/builder`, `/leads`, `/quotes`, `/pipeline`, `/applications`, and `/settings` should converge here.

## Backend boundary

Browser code should use typed clients under `apps/projectnyra/lib/api/` and the appropriate service boundary. Do not scatter direct database calls or direct Twenty mutations through UI components. Keep business mutations behind service APIs.

## Agent boundary

The assistant may read, reason, and propose actions. CRM, quote, campaign, and communication mutations must pass through their service contracts and compliance gates.

## UI freeze

Do not make broad visual-system, shadcn, tweakcn, layout, theme, or component-library decisions from this document. Those decisions are intentionally quarantined until the separate UI/design decision package is finalized.

## Deployment direction

The app frontend and the Oracle-hosted backend are separate concerns. Cloudflare can front the public web surface while Supabase, Twenty, quote/campaign services, and durable orchestration remain on Oracle. Do not move backend state into Cloudflare merely to simplify frontend deployment.
