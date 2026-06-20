# Project Nyra App Surface Audit

## Current Conclusion

`apps/projectnyra` is the canonical Project Nyra product app. It already embeds
the main pages expected from the older app roots: admin, assistant, CRM, leads,
lead detail, applications, quotes, pipeline, campaigns, and campaign builder.

`apps/ratehunter/landing` is the canonical RateHunter personal brokerage landing
page. It should remain the only `ratehunter.net` app surface.

The other app roots are not deleted because they still serve as migration
sources or separate operational tools.

## App Root Classification

| Path                             | Classification                    | What It Contains                                                                        | Decision                                                                                                     |
| -------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `apps/projectnyra`               | Canonical product app             | Public launch page, broker routes, admin route group, assistant route group, API routes | Keep and continue building here                                                                              |
| `apps/ratehunter/landing`        | Canonical personal landing        | Public RateHunter lead-capture site                                                     | Keep isolated for `ratehunter.net`                                                                           |
| `apps/ratehunter/landing-legacy` | Legacy reference                  | Older RateHunter landing implementation                                                 | Keep temporarily until landing migration is verified                                                         |
| `apps/mortgage-crm`              | Migration source                  | Standalone CRM prototype, lead detail view, Kanban board, mortgage domain/services      | Do not deploy as canonical app; migrate useful pieces into `apps/projectnyra`, `services/*`, or `packages/*` |
| `apps/admin`                     | Migration source                  | Standalone admin dashboard prototype, quote/leads pages, auth wrapper                   | Do not treat as canonical; Project Nyra admin belongs under `apps/projectnyra/app/(admin)`                   |
| `apps/nexusUI`                   | Separate active control-plane app | Nexus Router settings and status UI                                                     | Keep separate and link from Project Nyra as an Access-gated operational tool                                 |
| `apps/twenty`                    | Temporary bootstrap shell         | Minimal Twenty shell/source placeholder                                                 | Keep isolated until detached or replaced by images                                                           |
| `apps/twenty-crm`                | Temporary integration package     | TwentyCRM integration scripts, setup docs, MCP support                                  | Keep as bootstrap/integration support; runtime Compose files stay under `infra/hosts`                        |

## Project Nyra Embedded Coverage

| Expected Surface              | Current Project Nyra Route                | Source/Notes                                                                       |
| ----------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| Project Nyra launch surface   | `/`                                       | Landing/launch page links to product and protected tools                           |
| Admin page                    | `/admin`                                  | Exists under `(admin)`; needs richer operator workflows migrated from `apps/admin` |
| Assistant                     | `/assistant`                              | Exists under `(assistant)` and calls internal OpenClaw proxy                       |
| OpenClaw tooling              | `/tools/openclaw`                         | Internal proxy test panel                                                          |
| CRM UI / Mortgage CRM         | `/crm`                                    | Exists under `(broker)` and explicitly frames Twenty as system of record           |
| Lead list                     | `/leads`                                  | Exists and uses the app API client                                                 |
| Lead detail                   | `/leads/[id]`                             | Exists and includes timeline, attribution, tags, and communication actions         |
| Applications                  | `/applications`                           | Exists and reads consolidated CRM workspace data                                   |
| Quote desk                    | `/quotes`                                 | Exists and uses quote API comparison/approval client                               |
| Pipeline dashboard            | `/pipeline`                               | Exists; adapted from admin/mortgage CRM concepts                                   |
| Campaign list                 | `/campaigns`                              | Exists                                                                             |
| Campaign builder              | `/campaigns/builder`                      | Exists; should be wired to campaign/compliance services next                       |
| Settings/platform assumptions | `/settings`                               | Exists                                                                             |
| Nexus Router UI               | External `https://nexus.projectnyra.com`  | Correctly separate control-plane app                                               |
| Twenty CRM UI                 | External `https://twenty.projectnyra.com` | Correctly separate system-of-record app                                            |

## Migration Notes

### `apps/mortgage-crm`

Useful material:

- Lead Kanban board and pipeline interaction model.
- Lead detail layout with borrower info, documents, timeline, and quick notes.
- Domain entities for lead, document, and loan application.
- Compliance and document generation service ideas.
- TwentyCRM service adapter concepts.

Target destinations:

- UI patterns move into `apps/projectnyra`.
- Domain entities and validators move into `packages/crm-types`,
  `packages/compliance-domain`, `packages/quote-domain`, or new package modules.
- Service implementations move into `services/crm-api`, `services/quote-service`,
  `services/compliance-service`, or `services/lead-ingestion`.

Do not preserve Clerk/Prisma direct app ownership as the default architecture.
The target app should route mutations through Nyra services and keep Twenty CRM
as system of record.

### `apps/admin`

Useful material:

- Operator dashboard metrics.
- Lead and quote admin layouts.
- Auth wrapper patterns if they can be adapted to the final auth stack.

Target destinations:

- Admin UI moves into `apps/projectnyra/app/(admin)`.
- Shared controls move into `packages/ui` only when there is real reuse.
- Operational status for Nexus/LiteLLM remains in `apps/nexusUI`.

### `apps/nexusUI`

This is not old product UI. Keep it separate because it controls Nexus Router,
MCP visibility, LiteLLM settings, and control-plane state. Project Nyra should
link to it, not absorb it into broker/customer routes.

### `apps/twenty` and `apps/twenty-crm`

These are bootstrap/integration assets for Twenty CRM. They are not Project Nyra
product pages. Keep runtime deployment in `infra/hosts/<host-name>/` and do not
put new Compose files under `apps`.

## Local Dev URLs

When developing locally:

- Project Nyra: `http://localhost:3001`
- RateHunter landing: `http://localhost:3002`
- Nexus UI, if needed separately: `http://localhost:3016`
- Standalone admin prototype, if intentionally inspected: `http://localhost:3008`

## Next Implementation Priorities

1. Expand `/admin` in `apps/projectnyra` using the best operator workflows from
   `apps/admin`.
2. Compare `apps/mortgage-crm` domain/services against `services/*` and
   `packages/*`; migrate reusable business logic out of the old app root.
3. Wire `/campaigns/builder` to `services/campaign-service` and
   `services/compliance-service` contracts.
4. Replace remaining mock KPI/dashboard data with service-backed summaries.
5. Add route/link smoke tests for the Project Nyra app shell.
