# Current State Audit

Path note: this audit predates the app consolidation rename. The active internal app is `apps/nyra-webapp`; the active public landing app is `apps/ratehunter-landing`. Legacy references to `apps/webapp/app`, `apps/admin/app`, and `apps/landing/ratehunter-landing` are historical source material unless the path exists in the current checkout.

## Scope

Audited active app structure, guidance docs, core architecture docs, service/package inventory, route files, API clients, design tokens, and relevant shared docs under:

- `apps/guidance`
- `apps/webapp/app`
- `apps/admin/app`
- `apps/landing/ratehunter-landing`
- `apps/shared`
- `apps/twenty`
- `apps/twenty-crm`
- `docs`
- `packages`
- `services`
- `infra/hosts`

## Active Product Surfaces

### `apps/webapp/app`

Status: partial canonical internal app.

Evidence:

- Has active Next.js App Router routes for assistant, campaigns, campaign builder, leads, lead detail, applications, quotes, pipeline, CRM, settings, and OpenClaw tools.
- Has `components/site-header.tsx` with main navigation.
- Has API clients for CRM, campaigns, and quote service under `lib/api`.
- Has `lib/crm-data.ts` with fallback source selection across CRM API, Twenty MCP, Twenty GraphQL, and mock data.
- Has OpenClaw proxy endpoints under `/api/internal/openclaw`.

Preserve:

- Route direction.
- Assistant + lead-context layout.
- Lead profile timeline concept.
- Quote request/comparison components.
- OpenClaw proxy abstraction.
- TweakCN/shadCN token setup in `app/globals.css`.

Problems:

- Styling is inconsistent: some routes use dark token classes; campaign and lead detail pages still use slate/light prototype classes.
- Several pages use hard-coded or mock records.
- Navigation is flat and does not distinguish broker, borrower, ops, and tools.
- Lead and campaign actions are not yet visibly compliance-gated.
- API clients have overlapping ownership between `crmApi` and `campaignApi`.

### `apps/admin/app`

Status: prototype to merge, not a final deployment.

Preserve:

- Dashboard metric cards.
- Recent activity/alert patterns.
- Lead scoring presentation.
- Quote desk concepts.
- Admin shell ideas only after restyling to the webapp design system.

Problems:

- Duplicates shell, UI primitives, auth, leads, quotes, and dashboard.
- Uses separate package and styling conventions.
- Would split operator workflows if deployed as a standalone product.

Decision:

Use as source material. Do not preserve as separate final product.

### `apps/landing/ratehunter-landing`

Status: active public-facing app.

Preserve:

- Borrower-facing marketing content.
- RateHunter brand identity.
- Lead capture wizard.
- Borrower chat widget.
- Contact, Calendly, application portal, document upload, and trust content.

Decision:

Keep separate from the internal app. Public landing has different SEO, cache, auth, risk, and deployment needs.

### `apps/twenty` and `apps/twenty-crm`

Status: CRM shell/config/integration material.

Preserve:

- Twenty deployment/config files.
- Custom object scripts.
- Integration examples.
- CRM env and setup notes.

Decision:

Twenty remains the system of record. It should be surfaced through CRM API and embedded links/status where useful, not merged into the webapp as the app shell.

### `apps/shared`

Status: source library and reference archive.

Preserve:

- Brand assets.
- TweakCN comparisons.
- Campaign source documents and converted JSON/markdown.
- n8n workflow examples.
- Compliance and quote migration docs.

Decision:

Promote reusable assets into packages or app public folders as needed. Do not treat all shared content as active runtime code.

## Service State

Canonical or near-canonical:

- `services/crm-api`: app-facing CRM boundary.
- `services/lead-ingestion`: new pipeline direction.
- `services/campaign-engine`: campaign runtime candidate.
- `services/quote-api`: strongest deterministic quote service.
- `services/nexus-router`: AI/model/tool routing.
- `services/twilio-integration`: SMS/voice transport source.
- `services/websocket-hub`: real-time app infrastructure candidate.
- `services/nyra-orchestrator`: assistant/compliance policy direction.

Overlapping or needs consolidation:

- `services/quote-engine` and `services/rate-comparison-engine` overlap with `services/quote-api`.
- `services/lead-capture-api`, `services/ratehunter-api`, and `services/crm-api` overlap around lead intake and CRM writes.
- `services/twentycrm-integration`, `services/twenty-crm-mcp-server`, and `services/twenty-mcp-jezweb` overlap around CRM access.
- `services/mortgage-assistant-api`, `services/nyra-orchestrator`, OpenClaw, Nexus, and webapp `/assistant` overlap around assistant execution.

## Package State

Preserve and strengthen:

- `packages/domain-models`: should become canonical Zod/TS contract package.
- `packages/crm-client`: should become the Twenty CRM adapter used by `services/crm-api`.
- `packages/integration-adapters`: good home for provider adapter interfaces and deterministic mocks.
- `packages/twenty-custom-objects`: good home for Twenty schema provisioning.
- `packages/websocket-client`: useful for real-time event panels.
- `packages/ui`: should become the shared shadCN/Magic UI component package.

## Design State

Current direction:

- TweakCN/shadCN.
- Dark-mode professional broker cockpit.
- Lucide icons.
- RateHunter brand assets.
- Magic UI for restrained motion.

Problem:

- `apps/webapp/app/app/globals.css` has a token layer but not all pages honor it.
- `tailwind.config.js` still extends older color scales.
- `apps/admin/app` uses separate component styling.
- Landing has a stronger public brand system than internal routes.

Decision:

Keep one internal token system and adapt landing with compatible brand variables without forcing the internal cockpit density onto public marketing pages.

## Deprecated / Do Not Reintroduce

- Separate production `apps/admin/app`.
- App routes that expose worker inference endpoints publicly.
- Assistant-direct CRM/database mutation.
- n8n as business brain or system of record.
- Quote math inside UI.
- RuVector or Graphiti.
- Compose runtime sources outside `infra/hosts/<host-name>`.

## Audit Conclusion

The repo already contains the right product direction. The next work is not a broad rewrite; it is consolidation:

1. Make `apps/webapp/app` the product shell.
2. Mine admin and reference apps for useful UI.
3. Promote contracts into packages.
4. Move irreversible business behavior into services.
5. Enforce one design system and one navigation language.
6. Treat raw tools as `/tools/*`, not as first-class customer product.
