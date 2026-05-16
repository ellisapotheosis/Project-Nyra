# Agent Workpack Sequence

## Purpose

This document sequences the finish-line build into workpacks that can be handed to separate agents. Each workpack has a destination, source material, outputs, and verification.

## Workpack 0: Backup And Inventory

Destination:

- Docs/inventory only unless backups are explicitly requested.

Sources:

- `apps/guidance/prompts/01-backup-and-inventory-agent.md`
- Current app folders.
- Screenshot folders.

Outputs:

- Inventory of apps, scripts, ports, build state, and final disposition.
- Confirm `apps/twenty` is untouched.

Verification:

- No app code changed unless explicitly scoped.

## Workpack 1: Landing Finish Line

Destination:

- `apps/ratehunter-landing`.

Sources:

- `03-landing-and-lead-capture-spec.md`
- `11-landing-market-ticker-and-finishing-touches.md`
- `10-design-system-assets-and-branding.md`
- `screenshots/landing-main/index.png`

Outputs:

- Polished landing.
- Top Market Pulse ticker.
- Lower Market Pulse section.
- Preserved wizard/chat/contact/compliance.

Verification:

- Landing build/typecheck/lint where available.
- No internal routes.
- Disclaimers visible.

## Workpack 2: Webapp Shell And Command Center

Destination:

- `apps/nyra-webapp`.

Sources:

- Current webapp.
- `02-webapp-command-center-spec.md`
- `12-webapp-route-implementation-blueprints.md`

Outputs:

- Overview route converted into real command center.
- Shared nav/shell refined.
- Service health placeholders.

Verification:

- Webapp build/typecheck/lint where available.
- Routes remain navigable.

## Workpack 3: Campaigns And Builder

Destination:

- `/campaigns`
- `/campaigns/builder`

Sources:

- Legacy HTML prototype.
- Campaign shared docs.
- `07-campaign-compliance-quote-spec.md`

Outputs:

- Campaign dashboard cards, timeline, enrollments, compliance queue.
- Sequence-builder blueprint.

Verification:

- No send actions bypass compliance.
- Publish actions disabled until service path exists.

## Workpack 4: Leads, Pipeline, Applications

Destination:

- `/leads`
- `/leads/[leadId]`
- `/pipeline`
- `/applications`

Sources:

- `apps/mortgage-crm`.
- Admin leads source.
- Current webapp routes.

Outputs:

- Lead inbox.
- Lead cockpit.
- Pipeline kanban.
- Application/document status.

Verification:

- CRM sync labels present.
- Mock/fallback state labeled.

## Workpack 5: Quotes And Market Intelligence

Destination:

- `/quotes`
- `/quotes/[quoteId]`

Sources:

- Admin quote desk.
- Landing market data.
- Legacy pricing comparison.
- Quote services specs.

Outputs:

- Quote desk.
- Current rate sheet.
- Provider comparison.
- Lock expiration queue.
- Quote detail blueprint.

Verification:

- Quote values carry source/assumption labels.
- No binding-rate language without backend proof.

## Workpack 6: CRM And Twenty Integration

Destination:

- `/crm`
- `/crm/settings`
- `/admin/integrations`

Sources:

- `apps/twenty-crm`.
- `services/crm-api/SPEC.md`.
- Mortgage-crm Twenty service.

Outputs:

- CRM sync health.
- Object/field mapping pages.
- Twenty deep link.
- Integration hub cards.

Verification:

- No browser direct Twenty mutation.
- Owner manual actions documented.

## Workpack 7: Tool Routes

Destination:

- `/tools/openclaw`
- `/tools/nexus`
- `/tools/n8n`
- `/tools/activepieces`
- `/tools/openmemory`
- `/tools/paperclip`

Sources:

- `apps/nexusUI`.
- Current OpenClaw route.
- Shared n8n/Activepieces docs.

Outputs:

- Tool wrappers.
- Health/status/deep links.
- Degraded states.

Verification:

- Internal tools are linked/access-gated.
- No raw worker endpoints are public.

## Workpack 8: Service Wiring

Destination:

- App API adapters and service clients.

Sources:

- `06-service-integration-map.md`.
- Service docs.

Outputs:

- Typed read adapters.
- Health cards.
- Idempotent write paths.

Verification:

- Writes go through service boundaries.
- Offline states work.

## Workpack 9: Final Verification

Checks:

- Landing build.
- Webapp build.
- Targeted lint/typecheck.
- Route smoke screenshots.
- Conflict marker scan.
- Public/internal route separation.
- Docs updated.
- Owner manual actions documented.

Acceptance:

- Source apps can remain in repo, but final product navigation points to landing and webapp.
- Every visible route has real purpose, source, state labels, and safe actions.
