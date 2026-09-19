# App Deployment Matrix — 2026-09-19

## Canonical app roots

| App | Canonical path | Intended surface | Deployment |
|---|---|---|---|
| RateHunter | `apps/ratehunter/` | `ratehunter.net` | Cloudflare Pages |
| Project Nyra landing | `apps/projectnyra-landing/` | `projectnyra.com` | Cloudflare edge deployment; verify current target before changing |
| Project Nyra webapp | `apps/projectnyra/` | `app.projectnyra.com` | Frontend/edge deployment may be separate from Oracle backend |
| RateHunter 3D | `apps/ratehunter-3d/` | `3d.ratehunter.net` | Cloudflare Pages |
| Admin | `apps/admin/` | legacy source | Do not create new routes |
| Mortgage CRM | `apps/mortgage-crm/` | legacy source | Do not create new routes |

## Critical separation

`ratehunter.net` must never become an entry point for Project Nyra CRM, admin, MCP, worker, database, or orchestration services.

Project Nyra webapp authentication and backend services are hosted on Oracle VPS through the self-hosted Supabase stack. The browser should use the HTTPS Supabase endpoint; raw Postgres remains private.

## Cloudflare rule

Each intentionally deployed app gets its own Cloudflare project/worker contract, root directory, build command, output directory, custom domains, and environment variables. Do not rely on a monorepo-root Pages build to discover the correct app.

Before changing a deployment adapter, verify the current framework/runtime requirements and preserve a rollback path. Keep Cloudflare ingress configuration separate from application code.

## Verification

Every app deployment should prove:

1. correct repository path;
2. correct build output;
3. correct Cloudflare project name;
4. correct custom domain;
5. expected homepage content;
6. no leakage of protected Project Nyra hostnames into RateHunter;
7. no secrets committed to the repository.
