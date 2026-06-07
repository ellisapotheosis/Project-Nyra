# Project Nyra Guidance Context

Project Nyra is an AI-powered mortgage lead automation and broker operations platform. The live system must turn raw leads into conversations, quote-ready borrower records, booked calls, active loans, and funded deals.

## Domain Split

- `ratehunter.net`: public/personal mortgage broker landing only.
- `projectnyra.com`: platform/product domain for the internal broker app, APIs, services, MCP/gateway surfaces, tunnels, and internal tools.

## Canonical Apps

- `apps/ratehunter`: active public landing.
- `apps/projectnyra`: active internal broker command center.
- `apps/nexusUI`: specialist standalone tool.
- `apps/twenty`: protected CRM shell/system-of-record UI.
- `apps/twenty-crm`: CRM integration/config material.
- `apps/admin/app` and `apps/mortgage-crm`: prototype/source material.

## Current Integration Truth

- Supabase Auth is already wired into `apps/projectnyra` through `@supabase/ssr`, auth pages, callback/session/signout routes, middleware, and `/api/supabase/health`.
- Supabase backend services are present in `infra/hosts/oracle-vps/docker-compose.yml` behind Kong/PostgREST/Auth.
- RateHunter screenshots and Project Nyra route screenshots are stored under `apps/guidance/screenshots/20260517-092747-current-pages-after-asset-fix/`.

## Non-Negotiables

- Twenty CRM plus Nyra event/audit ledgers outrank prompts, workflow tools, and assistant recollections.
- Compliance is code and tests.
- Quotes are deterministic and tool-backed.
- Secrets live in Infisical/gitignored env files, never source.
- Private worker and datastore endpoints stay private.
