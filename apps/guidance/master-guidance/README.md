# Project Nyra Master Guidance

This folder is the finish-line operating manual for consolidating Project Nyra's UI and app surfaces. It exists so a zero-context agent can understand what each app is, what should be harvested, what should be ignored, and what should be built next without rereading every scattered prototype first.

This package does not delete, replace, or move the older guidance under `apps/guidance`. Older guidance remains useful source material. This package is the executive decision layer on top of it.

## Canonical Outcomes

- Public site: `apps/ratehunter-landing` becomes the polished borrower-facing RateHunter site.
- Internal product: `apps/nyra-webapp` becomes the single broker-facing command center at `app.projectnyra.com`.
- CRM system of record: Twenty CRM remains separate and is linked/access-gated where needed.
- Integration/config reference: `apps/twenty-crm` informs CRM/MCP/webhook setup, but is not the final UI shell.
- Tool consoles: Nexus, OpenClaw, n8n, Activepieces, OpenMemory, Grafana, Gitea, Portainer, and Paperclip are linked or wrapped from the webapp according to the tool strategy.
- Source apps: admin, mortgage-crm, nexusUI, and legacy HTML are harvest sources. They do not remain independent product destinations.

## Read Order By Agent Type

Landing implementation agent:

1. `03-landing-and-lead-capture-spec.md`
2. `11-landing-market-ticker-and-finishing-touches.md`
3. `10-design-system-assets-and-branding.md`
4. `prompts/landing-finish-line-agent.md`

Internal webapp consolidation agent:

1. `02-webapp-command-center-spec.md`
2. `09-component-harvest-matrix.md`
3. `12-webapp-route-implementation-blueprints.md`
4. `prompts/webapp-consolidation-agent.md`

CRM/service integration agent:

1. `04-crm-twenty-integration-spec.md`
2. `06-service-integration-map.md`
3. `07-campaign-compliance-quote-spec.md`
4. `prompts/service-integration-agent.md`

Visual/design audit agent:

1. `15-theme-system-and-ui-acceptance.md`
2. `08-screenshot-audit-and-current-state.md`
3. `10-design-system-assets-and-branding.md`
4. `09-component-harvest-matrix.md`
5. `prompts/visual-audit-agent.md`

Orchestration agent:

1. `00-agent-operating-contract.md`
2. `01-product-architecture-finish-line.md`
3. `14-canonical-integration-checklist.md`
4. `15-theme-system-and-ui-acceptance.md`
5. `16-context-window-prompt-runbook.md`
6. `17-current-progress-and-remaining-checklist.md`
7. `idea-queue.md`
8. `reports/run-00-worktree-and-branch-inventory.md` when present
9. `13-agent-workpack-sequence.md`
10. Existing `apps/guidance/00-master-build-brief.md`

## Source Material Map

Screenshots:

- `screenshots/landing-main/index.png`: public landing visual baseline.
- `screenshots/landing-legacy/index.png`: broken build screen; ignore visually unless source has missing unique content.
- `screenshots/webapp/*.png`: canonical destination shell and current shallow route states.
- `screenshots/mortgage-crm/*.png`: strongest pipeline/kanban visual reference.
- `screenshots/nexus-ui/index.png`: strongest tool-console visual reference.
- `screenshots/admin-shell/*.png` and `screenshots/admin/*.png`: build errors; harvest concepts from source only.
- `screenshots/nyra-admin/index.png`: CSS/layout broken; harvest metrics, alerts, quick actions.
- `screenshots/twenty-shell/index.png`: placeholder shell; link to real Twenty instead of merging.

Source apps:

- `apps/nyra-webapp`: final internal app destination.
- `apps/ratehunter-landing`: final public landing destination.
- `apps/admin/app`: quote desk, metrics, alerts, auth/websocket cautionary source.
- `apps/mortgage-crm`: pipeline/kanban, domain entities, Twenty service references.
- `apps/nexusUI`: Nexus console UI and status/settings API reference.
- `apps/twenty`: do not modify.
- `apps/twenty-crm`: CRM stack, integration, MCP, scripts, and env reference.
- `apps/shared/assets/webapp-v1-source-material/index.html`: legacy Nyra Mortgage Suite source for campaign dashboard, lender links, communication drawer, pricing comparison, timeline, and theme switcher ideas.

Existing guidance:

- `apps/guidance/00-master-build-brief.md`: product split and initial decisions.
- `apps/guidance/01-reference-map.md`: exact source paths.
- `apps/guidance/components/*.md`: landing, webapp route, and theme briefs.
- `apps/guidance/prompts/*.md`: earlier agent breakdowns.
- `apps/shared/docs/**`: architecture, campaign migration, tool decisions, and compliance.

Assets:

- `apps/shared/assets/Ratehunter_Logo_Final/**`: RateHunter logo system and social/business variants.
- `apps/shared/assets/PFP_New/**`: Nyra/persona/profile visual candidates.
- `apps/shared/assets/source_uploads/**` and `apps/shared/assets/uploads/**`: calculator, broker flow, campaign, soft quote, declaration, video, and business card source material.
- Current app public assets in `apps/ratehunter-landing/public` and `apps/nyra-webapp/public`.

## What To Build Next

1. Repo hygiene pass: preserve current local work, resolve only assigned conflict markers, and decide whether to keep the regenerated `pnpm-lock.yaml`.
2. Theme identity pass: finish named token extraction for Midnight, Mint Midnight, Mint Midnight Glow, and Apotheosis after source token values are confirmed.
3. Landing finish pass: keep the landing-main identity, verify Apotheosis tokens in `apps/ratehunter-landing`, tighten copy, and preserve compliance disclaimers.
4. Webapp command center pass: replace shallow overview cards with lead queue, campaign timeline, quote preview, CRM sync, service health, and quick actions.
5. Campaign pass: merge the legacy HTML campaign dashboard concepts into `/campaigns` and turn `/campaigns/builder` into a real sequence-builder blueprint.
6. CRM/pipeline pass: use mortgage-crm's kanban and domain model to deepen `/pipeline`, `/leads`, `/applications`, and `/crm`.
7. Quote pass: use admin quote desk plus landing market data to deepen `/quotes` and provide operational rate intelligence.
8. Tooling pass: add or deepen `/tools/nexus`, `/tools/openclaw`, `/tools/n8n`, `/tools/activepieces`, `/tools/openmemory`, and `/admin/integrations`.
9. Backend/integration pass: implement contracts, mocks, safety gates, tests, and service docs without changing UI.
10. Infra/ops pass: compose profiles, health scripts, Infisical docs, worker routing, exposure matrix, and runbooks.
11. Verification pass: document stub versus real data, health endpoints, degraded modes, owner-only manual actions, and build/test status.

## Source Precedence

1. Current implementation source wins for exact import paths, package scripts, and available components.
2. Screenshots win for current visual state and broken-build evidence.
3. This master guidance wins for product decisions and integration targets.
4. Existing `apps/guidance` docs win for old source paths when this package references them.
5. Service docs win for service-specific intent unless they mention deprecated RuVector or Graphiti.
6. External prompt packs are background context, not a higher authority than repo source.

## Non-Negotiables

- Do not move existing docs in `apps/guidance`.
- Do not delete source apps just because their concepts are harvested.
- Do not modify `apps/twenty` unless a task explicitly targets Twenty itself.
- Do not merge landing routes into the internal webapp.
- Do not expose internal tool URLs publicly without Cloudflare Access or equivalent gating.
- Do not use market/rate ticker content as a binding quote.
- Do not let assistants directly mutate CRM, databases, or quote terms.
