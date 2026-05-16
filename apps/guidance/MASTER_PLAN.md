# Project Nyra Master Plan

Path note: this plan was drafted before the app consolidation rename. The active internal app path is `apps/nyra-webapp`; the active public landing path is `apps/ratehunter-landing`.

## A. Executive Thesis

Project Nyra should ship as one cohesive mortgage operating system anchored by `apps/nyra-webapp`, plus a separate public landing site and a set of backend services that own irreversible business capabilities. The user's instinct is correct for product surfaces: admin UI, broker dashboard, lead workspace, campaign builder, quote desk, chat, assistant, communication timelines, campaign status, lead status, agent actions, and polished voice controls belong in one primary authenticated web application.

The final internal product should feel like a command center for mortgage revenue operations, not a set of demos. Fragmentation only earns its place where it protects operational boundaries:

- `apps/nyra-webapp`: main authenticated app at `app.projectnyra.com`; owns user experience, navigation, page composition, broker/admin workflows, borrower workspace views that require login, assistant/chat shells, and control panels.
- `apps/ratehunter-landing`: public marketing and lead capture at `ratehunter.net`; remains separate because it has different risk, caching, SEO, deployment, auth, and audience constraints.
- Twenty CRM: system of record; remains external/semi-external and is surfaced through the app, not visually merged as the app itself.
- Quote service: separate deterministic backend service; the app displays, requests, approves, and explains quotes but never calculates or invents them client-side.
- Communication, compliance, campaign, voice, memory, model routing, workflow engines, observability, and auth: backend or infrastructure services with UI modules in the main app where they help operators.

The strongest product architecture is a single webapp shell with role-aware workspaces:

- Broker Cockpit: daily work, leads, pipeline, quote desk, assistant, tasks.
- Lead/Loan Workspace: one record page with timeline, communications, campaign enrollment, quote readiness, documents, notes, and assistant context.
- Automation Studio: campaign templates, steps, enrollment rules, compliance gates, analytics.
- Communications Hub: inbox, calls, SMS, email, voice controls, callbacks, SLA.
- AI Control Room: polished assistant settings, agent runs, memory visibility, tool approval queue, OpenClaw/Nexus health.
- Platform Settings: integrations, users, roles, auth, CRM sync, provider credentials, audit policy.

## B. Current State Audit

The repo is not greenfield. It already contains the right strategic direction, but it is spread across active apps, prototypes, generated guidance, shared reference material, and older service experiments.

High-signal current state:

- `apps/guidance/README.md` and `apps/guidance/00-master-build-brief.md` already define the major split: public landing stays isolated, internal broker tools consolidate into `apps/webapp/app`, `apps/admin/app` should be merged, and `apps/twenty` remains untouched.
- `apps/webapp/app` is the strongest active product base. It already has routes for `/`, `/assistant`, `/campaigns`, `/campaigns/builder`, `/leads`, `/leads/[id]`, `/applications`, `/quotes`, `/pipeline`, `/crm`, `/settings`, and `/tools/openclaw`.
- `apps/admin/app` is a useful prototype, not a final app. Its dashboard, lead, quote, sidebar, auth, and operations widgets should be mined into webapp modules.
- `apps/landing/ratehunter-landing` is a real public site with borrower-facing content, lead capture, contact links, and borrower chat. It should not absorb broker/admin routes.
- `apps/twenty` and `apps/twenty-crm` are CRM shell/integration assets. They are not the product shell.
- `apps/shared` contains valuable assets, campaign source material, quote migration notes, n8n workflows, compliance docs, brand assets, and TweakCN reference assets. This is a source library, not a runtime app.
- `services/*` includes many candidate service boundaries. Some are canonical or near-canonical (`crm-api`, `campaign-engine`, `quote-api`, `nexus-router`, `twilio-integration`, `websocket-hub`, `nyra-orchestrator`); others overlap and need consolidation.
- `packages/domain-models`, `packages/crm-client`, `packages/integration-adapters`, `packages/twenty-custom-objects`, and `packages/websocket-client` are the right direction for shared contracts.

Incomplete:

- Main app pages still mix real API clients, mock fallbacks, and static UI.
- Several routes use light-mode slate styling inside a dark TweakCN shell.
- Lead detail and assistant actions can call campaign updates but need compliance-aware service contracts and audit trails before production use.
- Campaign builder exists, but needs a durable schema, validation, preview, compliance simulation, versioning, and test fixtures.
- Quote UI exists, but quote ownership must remain in `services/quote-api`; current UI should become a quote request/approval surface.
- Voice appears in campaign channels and timeline concepts, but live voice control is not yet a productized module.
- Memory/agent management exists as infra concepts and OpenClaw tooling, but not yet as a polished role-aware control room.

Duplicated or outdated:

- `apps/admin/app` duplicates app-shell, dashboard, lead, quote, auth, and UI primitives.
- `apps/guidance/references/webapp-merge-snapshot` is a frozen source snapshot and should not become active code.
- CRM concepts appear in `apps/twenty-crm`, `services/twentycrm-integration`, `services/twenty-crm-mcp-server`, `services/twenty-mcp-jezweb`, `packages/crm-client`, and current webapp API clients. These need one canonical CRM service boundary.
- Quote capabilities appear in `services/quote-api`, `services/quote-engine`, `services/rate-comparison-engine`, and `packages/integration-adapters/src/quote-engine.ts`. The canonical production target should be `services/quote-api`; other engines should be documented as references or retired.
- Communication/service logic appears across `twilio-integration`, `sendgrid-integration`, `mortgage-assistant-api`, `campaign-engine`, and workflow JSON. The app needs one communication service contract.

Preserve:

- `apps/nyra-webapp` as canonical internal app.
- `apps/ratehunter-landing` as separate public app.
- TweakCN/shadCN token approach and RateHunter brand assets.
- Current webapp route map and OpenClaw proxy routes.
- Current lead detail timeline direction.
- Campaign source documents and JSON/YAML conversions.
- Quote formula migration material.
- Twenty custom objects and CRM client direction.
- Compliance invariants in docs and packages.

Merge:

- `apps/admin/app/src/app/page.tsx` dashboard concepts into `/pipeline` and `/ops`.
- `apps/admin/app/src/app/leads/page.tsx` scoring/filtering ideas into `/leads`.
- `apps/admin/app/src/app/quotes/page.tsx` desk widgets into `/quotes`.
- Admin sidebar/header patterns only if rewritten against the webapp shell and tokens.
- `apps/mortgage-crm` concepts, if present in this checkout, into `/crm`, `/leads`, `/applications`, and `/pipeline`.

Deprecate:

- Standalone admin product deployment.
- Any product path where assistant directly mutates CRM/database without service mediation.
- Any route where n8n or Activepieces becomes business-brain/system-of-record.
- Raw internal experimentation pages in the main nav unless labeled as internal tools under `/tools`.

## C. Feature + Capability Matrix

See `FEATURE_MATRIX.md` for the normalized matrix. The critical path is lead intake, CRM sync, lead workspace, compliance, campaign controls, communication timeline, deterministic quote flow, and assistant actions with approval gates.

## D. Main App vs Separate Services Decision Table

See `APP_BOUNDARIES.md`. The short answer: unify UI surfaces, separate irreversible runtime capability.

## E. Final Recommended Product Architecture

### Product Shell

Use `apps/webapp/app` as the single authenticated app shell. Implement a role-aware navigation model rather than separate deployments:

- Borrower: intake, portal, quote/doc status, assistant, appointment scheduling.
- Broker: cockpit, leads, quotes, campaigns, inbox, tasks, assistant, pipeline.
- Admin/internal ops: users, roles, integrations, audit logs, provider health, agent controls.
- Agent-only: tool approval queue, run traces, memory reads, proposed actions.

The main app can include borrower-facing authenticated experiences, but public unauthenticated marketing stays in `apps/landing/ratehunter-landing`.

### Backend Services

Use service boundaries for all stateful, high-risk, or provider-specific capabilities:

- `services/crm-api`: single app-facing boundary for Twenty CRM and custom objects.
- `services/lead-ingestion`: normalize, dedupe, consent capture, lead scoring, source attribution.
- `services/compliance-service` or `packages/integration-adapters/src/compliance.ts` promoted behind a service: STOP, unsubscribe, DNC, quiet hours, channel eligibility.
- `services/campaign-engine`: campaign definitions, enrollments, scheduling, state transitions.
- `services/communication-service`: outbound/inbound SMS, email, voice, voicemail, provider callbacks, timeline writes.
- `services/quote-api`: deterministic quote generation, PDFs, quote history.
- `services/assistant-service` or `nyra-orchestrator`: assistant-safe action orchestration and approval gates.
- `services/nexus-router`, LiteLLM, OpenClaw, memory services: AI/model/tool control plane.

### Deployment

- `ratehunter.net`: Cloudflare Pages public landing.
- `app.projectnyra.com`: authenticated Next.js app on Oracle VPS or equivalent app runtime behind Cloudflare Access/WAF.
- CRM, workflow engines, databases, memory stores, and auth stay private or access-gated.
- Worker inference endpoints remain private over Tailscale.

## F. Route Map / Information Architecture

See `ROUTE_ARCHITECTURE.md`.

## G. Design System Consolidation Plan

See `DESIGN_SYSTEM_PLAN.md`.

## H. Domain + Data Model Summary

See `DOMAIN_MODEL.md`.

## I. Integration/Service Map

See `INTEGRATION_ARCHITECTURE.md`.

## J. Recommended Repo Structure

See `IMPLEMENTATION_PLAN.md` for the directory tree and migration plan.

## K. Build Phases

See `BUILD_PHASES.md`.

## L. File-by-File Refactor / Creation Plan

See `IMPLEMENTATION_PLAN.md`.

## M. Immediate Next Actions

1. Freeze `apps/webapp/app` as the only internal product shell in docs and CI.
2. Normalize the webapp shell and route groups: `(broker)`, `(borrower)`, `(ops)`, `(tools)`.
3. Move reusable admin widgets into webapp components, then mark `apps/admin/app` as deprecated source material.
4. Replace static/mock data on `/leads`, `/applications`, `/pipeline`, and `/assistant` with typed CRM API adapters and explicit mock-mode banners.
5. Add shared domain contracts in `packages/domain-models` for lead, campaign, communication, quote, compliance, agent run, memory object, and timeline event.
6. Make compliance checks an explicit precondition in campaign, assistant action, and communication service contracts.
7. Create a production-style lead detail workspace as the first flagship page: profile, timeline, campaign, quotes, docs, tasks, assistant context, and compliance panel.
8. Convert campaign builder to a real template editor backed by `services/campaign-engine`.
9. Wire quote desk only to `services/quote-api`; remove any UI-side quote math.
10. Keep `/tools/openclaw` as an internal lab, then promote only polished assistant patterns into `/assistant` and lead workspace sidebars.
