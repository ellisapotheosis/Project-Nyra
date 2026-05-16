# File-by-File Refactor / Creation Plan

Path note: the active app layout has been consolidated since this plan was drafted. Current active app paths are `apps/nyra-webapp` and `apps/ratehunter-landing`.

## Recommended Repo Structure

Target structure from current state:

```text
apps/
  ratehunter-landing/
  nyra-webapp/
  guidance/
  shared/
packages/
  domain-models/
  ui/
  crm-client/
  integration-adapters/
  twenty-custom-objects/
  websocket-client/
services/
  crm-api/
  lead-ingestion/
  compliance-service/
  campaign-engine/
  communication-service/
  quote-api/
  document-service/
  assistant-service/
  nexus-router/
  websocket-hub/
workflows/
  n8n/
docs/
  architecture/
  integrations/
  ops/
infra/
  hosts/
ops/
  scripts/
```

## Create

Planning docs created by this pass:

- `apps/guidance/MASTER_PLAN.md`
- `apps/guidance/CURRENT_STATE_AUDIT.md`
- `apps/guidance/FEATURE_MATRIX.md`
- `apps/guidance/APP_BOUNDARIES.md`
- `apps/guidance/ROUTE_ARCHITECTURE.md`
- `apps/guidance/DESIGN_SYSTEM_PLAN.md`
- `apps/guidance/DOMAIN_MODEL.md`
- `apps/guidance/INTEGRATION_ARCHITECTURE.md`
- `apps/guidance/BUILD_PHASES.md`
- `apps/guidance/IMPLEMENTATION_PLAN.md`

Next implementation files to create:

- `apps/nyra-webapp/app/(broker)/layout.tsx`
- `apps/nyra-webapp/app/(broker)/page.tsx`
- `apps/nyra-webapp/app/(broker)/leads/page.tsx`
- `apps/nyra-webapp/app/(broker)/leads/[id]/page.tsx`
- `apps/nyra-webapp/app/(broker)/campaigns/page.tsx`
- `apps/nyra-webapp/app/(broker)/campaigns/builder/page.tsx`
- `apps/nyra-webapp/app/(broker)/quotes/page.tsx`
- `apps/nyra-webapp/app/(broker)/inbox/page.tsx`
- `apps/nyra-webapp/app/(broker)/tasks/page.tsx`
- `apps/webapp/app/app/(ops)/settings/page.tsx`
- `apps/webapp/app/app/(ops)/agent-control/page.tsx`
- `apps/webapp/app/app/(tools)/tools/openclaw/page.tsx`
- `apps/webapp/app/components/layout/app-shell.tsx`
- `apps/webapp/app/components/layout/nav-model.ts`
- `apps/webapp/app/components/layout/page-header.tsx`
- `apps/webapp/app/components/status/status-badge.tsx`
- `apps/webapp/app/components/status/compliance-badge.tsx`
- `apps/webapp/app/components/timeline/timeline-shell.tsx`
- `apps/webapp/app/components/timeline/timeline-event-row.tsx`
- `apps/webapp/app/components/assistant/action-approval-card.tsx`
- `apps/webapp/app/components/lead/lead-workspace.tsx`
- `apps/webapp/app/components/lead/lead-summary-rail.tsx`
- `apps/webapp/app/components/lead/lead-compliance-panel.tsx`
- `apps/webapp/app/components/campaigns/campaign-step-editor.tsx`
- `apps/webapp/app/components/campaigns/compliance-simulator.tsx`
- `apps/webapp/app/components/voice/call-control-panel.tsx`
- `packages/domain-models/src/lead.ts`
- `packages/domain-models/src/contact.ts`
- `packages/domain-models/src/loanScenario.ts`
- `packages/domain-models/src/quote.ts`
- `packages/domain-models/src/campaign.ts`
- `packages/domain-models/src/communication.ts`
- `packages/domain-models/src/compliance.ts`
- `packages/domain-models/src/timeline.ts`
- `packages/domain-models/src/agent.ts`
- `packages/domain-models/src/memory.ts`
- `packages/ui/src/styles/tokens.css`
- `services/compliance-service/src/server.ts`
- `services/communication-service/src/server.ts`
- `services/assistant-service/src/server.ts`

## Move / Route Group

Move current active webapp routes into route groups after shell is ready:

- `apps/webapp/app/app/page.tsx` -> `apps/webapp/app/app/(broker)/page.tsx`
- `apps/webapp/app/app/leads` -> `apps/webapp/app/app/(broker)/leads`
- `apps/webapp/app/app/applications` -> `apps/webapp/app/app/(broker)/applications`
- `apps/webapp/app/app/pipeline` -> `apps/webapp/app/app/(broker)/pipeline`
- `apps/webapp/app/app/quotes` -> `apps/webapp/app/app/(broker)/quotes`
- `apps/webapp/app/app/campaigns` -> `apps/webapp/app/app/(broker)/campaigns`
- `apps/webapp/app/app/assistant` -> `apps/webapp/app/app/(broker)/assistant`
- `apps/webapp/app/app/crm` -> `apps/webapp/app/app/(ops)/crm`
- `apps/webapp/app/app/settings` -> `apps/webapp/app/app/(ops)/settings`
- `apps/webapp/app/app/tools` -> `apps/webapp/app/app/(tools)/tools`

Keep URL paths stable during moves.

## Merge

From `apps/admin/app` into `apps/webapp/app`:

- `src/app/page.tsx`: extract dashboard metrics/activity/alerts into broker cockpit modules.
- `src/app/leads/page.tsx`: extract score/grade/filter presentation into lead list components.
- `src/app/quotes/page.tsx`: extract quote desk concepts into `/quotes`.
- `src/components/layout/Sidebar.tsx`: use as reference for grouped nav, not as direct copy.
- `src/components/layout/Header.tsx`: use search/notification/profile ideas after token rewrite.

From `apps/shared`:

- Campaign JSON/markdown into campaign engine seed fixtures.
- Quote migration reports into quote API test fixture docs.
- Brand assets into app public folders or a documented assets package.
- TweakCN references into token package.

From `apps/twenty-crm`:

- Custom object/config documentation into CRM API and `packages/twenty-custom-objects`.
- Integration examples into service tests where still valid.

## Refactor

High-priority refactors:

- `apps/webapp/app/app/campaigns/page.tsx`: remove light slate styling, replace hard-coded campaigns with API/model-driven cards.
- `apps/webapp/app/app/leads/[id]/page.tsx`: redesign into tokenized lead workspace and route all actions through service wrappers.
- `apps/webapp/app/app/assistant/page.tsx`: split into lead selector, timeline context, chat panel, action approval queue.
- `apps/webapp/app/app/quotes/page.tsx`: ensure all calculations come from quote API and approvals write audit events.
- `apps/webapp/app/lib/api/crm.ts`: align with `packages/domain-models` and remove `any` surfaces.
- `apps/webapp/app/lib/api/campaigns.ts`: align with campaign engine schema.
- `apps/webapp/app/lib/api/quotes.ts`: align with quote API response contract.
- `apps/webapp/app/lib/crm-data.ts`: keep explicit mock mode but avoid silent fallback in production.
- `packages/domain-models/src/index.ts`: split into entity modules and export Zod schemas plus TS types.
- `packages/integration-adapters/src/compliance.ts`: promote from package-only utility to service-backed contract or shared core.

## Delete / Archive Later

Do not delete immediately while migration is active. After extraction and verification:

- Archive `apps/admin/app` as `docs/archive/apps/admin-prototype` or leave with deprecation README.
- Archive redundant quote services after `services/quote-api` is canonical.
- Archive redundant CRM MCP/integration experiments after `services/crm-api` path is production.
- Remove stale docs that contradict app boundaries only after cross-linking to the new guidance package.

Never delete:

- `apps/guidance/references/webapp-merge-snapshot` during current consolidation.
- `/home/ellisapotheosis/repos/webapp-merge`.
- `apps/twenty` without explicit owner decision.

## Docs to Write First

Already created:

- Master planning package in `apps/guidance`.

Next docs:

- `apps/admin/DEPRECATED_SOURCE_MATERIAL.md`
- `apps/webapp/ARCHITECTURE.md`
- `apps/webapp/ROUTES.md`
- `packages/domain-models/CONTRACTS.md`
- `services/crm-api/CONTRACT.md`
- `services/campaign-engine/CONTRACT.md`
- `services/communication-service/CONTRACT.md`
- `services/quote-api/CONTRACT.md`

## Immediate Structural Scaffolding

Only after this planning package is accepted by implementation:

1. Add route groups without changing URLs.
2. Add nav model and AppShell.
3. Tokenize campaigns and lead detail pages.
4. Add domain model schemas.
5. Add service contract docs and test fixtures.

## Validation Plan

For doc pass:

- Confirm all planning docs exist.
- Confirm docs point to active paths.
- Confirm no active code changed.

For implementation pass:

- `pnpm --filter mortgage-assistant lint`
- `pnpm --filter mortgage-assistant typecheck`
- `pnpm --filter @nyra/domain-models test`
- targeted Playwright/screenshot check for key routes after UI refactors.
