# Project Nyra App Development Plan

## Objective

Make `projectnyra.com` the canonical product and platform domain while keeping
`ratehunter.net` reserved for the personal mortgage brokerage landing page.

The Project Nyra app should become the first useful surface for all product
workflows: public product landing, broker workspace, admin console, assistant,
CRM mirror, campaign builder, quote workflows, and links to protected platform
tools.

## Domain Boundaries

| Domain            | Purpose                                                          | Rule                                                                             |
| ----------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `ratehunter.net`  | Personal mortgage brokerage landing page and lead capture        | No platform apps, MCP servers, admin tools, CRM tools, workers, or observability |
| `projectnyra.com` | Product, platform, apps, services, MCP, and protected dashboards | Canonical domain for every Project Nyra surface                                  |

Required public or protected hostnames:

- `projectnyra.com` for the Project Nyra landing page.
- `app.projectnyra.com` for the broker/customer app.
- `api.projectnyra.com` for public API ingress.
- `hooks.projectnyra.com` for signed provider webhooks.
- `nexus.projectnyra.com` for Nexus UI.
- `nexus-router.projectnyra.com` for the canonical MCP/router endpoint.
- `twenty.projectnyra.com` and `crm.projectnyra.com` for Twenty CRM.
- `n8n.projectnyra.com`, `activepieces.projectnyra.com`, `openlit.projectnyra.com`,
  `grafana.projectnyra.com`, and related internal tools behind Cloudflare Access.

## Canonical App Layout

```text
apps/
  projectnyra/
    app/
      (public)/
      (broker)/
      (admin)/
      (assistant)/
      api/
  ratehunter/
    landing-legacy/
```

`apps/projectnyra` is the product surface. `apps/ratehunter` is the
personal brokerage landing page. Runtime Docker Compose files must remain under
`infra/hosts/<host-name>/` only, with `external/` as the only accepted
non-host exception.

## Phase 1: App Shell And Navigation

Goal: make Project Nyra feel like a real product front door instead of a
placeholder workspace.

Tasks:

- Keep the public Project Nyra landing page as a launch surface for admin,
  Nexus, CRM, campaign builder, assistant, and platform tools.
- Add route-level pages for missing expected surfaces:
  - `/admin`
  - `/assistant`
  - `/crm`
  - `/campaigns`
  - `/campaigns/builder`
  - `/leads`
  - `/quotes`
  - `/pipeline`
  - `/applications`
  - `/settings`
- Replace mock landing metrics with data loaded through service clients once
  backend contracts are stable.
- Keep all external dashboard links explicitly marked as protected or
  access-gated.

Acceptance checks:

- `pnpm --filter projectnyra typecheck`
- `pnpm --filter projectnyra lint`
- Browser smoke: landing links resolve or intentionally open protected
  projectnyra.com destinations.

## Phase 2: Product Landing Page

Goal: give `projectnyra.com` its own product landing page that explains the
platform without conflicting with the RateHunter brokerage site.

Tasks:

- Create a public marketing/product narrative for Project Nyra:
  - mortgage lead automation
  - compliance-first campaigns
  - bounded assistant workflows
  - deterministic quote generation
  - CRM as system of record
- Keep calls to action directed to the app, admin, or gated demos.
- Avoid RateHunter branding except for clear separation language.
- Add metadata, Open Graph, robots, and sitemap entries for the Project Nyra
  domain.

Acceptance checks:

- `projectnyra.com` copy does not describe itself as the personal brokerage
  site.
- `ratehunter.net` copy does not link to platform admin, CRM, MCP, or worker
  surfaces.

## Phase 3: CRM And Mortgage CRM Consolidation

Goal: clarify what lives in Twenty CRM, what lives in the Project Nyra app, and
what happens to the older `apps/mortgage-crm` surface.

Tasks:

- Decide whether `apps/mortgage-crm` is a legacy reference, an active app, or a
  feature source to migrate into `apps/projectnyra`.
- If active, add a clear route/link from Project Nyra and a deployment target
  under `projectnyra.com`.
- If legacy, document it and prevent it from being confused with the canonical
  CRM route.
- Move reusable lead/application UI into `packages/ui` or
  `apps/projectnyra/components` only when reuse is real.
- Route all CRM mutations through `services/crm-api`; the assistant must not
  directly mutate Twenty or databases.

Acceptance checks:

- A broker can identify the canonical CRM surface from the Project Nyra landing
  page.
- Twenty remains the system of record.
- No route implies that n8n or the assistant owns business records.

## Phase 4: Campaign Builder And Compliance

Goal: make campaign creation useful while preserving compliance invariants.

Tasks:

- Connect `/campaigns/builder` to `services/campaign-service` contracts.
- Model campaign states with `packages/campaign-domain`.
- Enforce STOP, unsubscribe, reply pause, and quiet-hours checks through
  `services/compliance-service`.
- Add visible compliance state to campaign preview and lead enrollment views.
- Keep n8n as execution glue only.

Acceptance checks:

- STOP and unsubscribe tests pass.
- Campaign builder cannot create a route that bypasses compliance checks.
- Campaign DTOs validate through shared package schemas.

## Phase 5: Assistant And Nexus Integration

Goal: make the assistant useful without giving it unsafe write authority.

Tasks:

- Keep Nexus Router as the canonical MCP and agent endpoint.
- Point app assistant surfaces to OpenClaw/Nexus-backed APIs.
- Add proposed-action review UI for CRM, quote, and campaign actions.
- Require service-mediated mutations for CRM, campaign, quote, and
  communication workflows.
- Keep raw worker inference endpoints private.

Acceptance checks:

- Assistant can explain or propose actions.
- Assistant cannot directly mutate CRM or databases.
- MCP endpoint references use `nexus-router.projectnyra.com`.

## Phase 6: Quote And Communication Workflows

Goal: make borrower-facing and broker-facing workflows deterministic and
auditable.

Tasks:

- Route quote generation through `services/quote-service`.
- Expose quote history, three-option quote views, and expiration state.
- Route outbound and inbound communications through
  `services/communication-service`.
- Log communication metadata back to CRM via `services/crm-api`.

Acceptance checks:

- Assistant never fabricates rates, fees, or quote terms.
- Quote calculations have deterministic tests.
- Communications are linked to CRM records.

## Phase 7: Deployment And Cloudflare Hygiene

Goal: make the app split operationally obvious and hard to regress.

Tasks:

- Keep all host Compose files under `infra/hosts/<host-name>/`.
- Keep Cloudflared routes for app/platform surfaces on `projectnyra.com`.
- Keep RateHunter deployment isolated to the landing page.
- Document any Cloudflare dashboard, DNS, OAuth, MFA, or provider setup in
  `docs/OWNER_MANUAL_ACTIONS.md`.
- Add a domain-policy check script that fails if protected platform hostnames
  are added under `ratehunter.net`.

Acceptance checks:

- Compose placement scan passes.
- Domain policy scan passes.
- Cloudflared docs and generated configs agree on public/protected exposure.

## Immediate Next Work

1. Decide whether `apps/mortgage-crm` should be migrated into
   `apps/projectnyra` or formally archived as legacy/reference code.
2. Add real Project Nyra product landing copy and metadata for
   `projectnyra.com`.
3. Replace mock landing KPIs with API-backed summaries through the CRM,
   campaign, and quote services.
4. Add tests for the Project Nyra landing links and the domain-boundary copy.
5. Add a domain policy scan to prevent future `ratehunter.net` platform
   hostnames.
