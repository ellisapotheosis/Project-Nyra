# Webapp Route Implementation Blueprints

## Purpose

This is the page-by-page implementation blueprint for `apps/nyra-webapp`. It complements `02-webapp-command-center-spec.md` with a more direct build checklist.

## Global Data Disclosure

Every route should show one of these states where relevant:

- Live.
- Cached.
- Demo.
- Fallback.
- Offline.
- Not connected.

Do not let mock data look production-real without a label.

## Overview Route `/`

Build sections:

- Daily command header with date, broker identity, and service health.
- KPI cards: active leads, reply-paused leads, active campaigns, quotes pending, pipeline value, compliance blocks.
- Today queue: tasks grouped by first touch, quote follow-up, docs, rate lock, campaign pause.
- Campaign timeline: next scheduled touches.
- Lead queue: top five priority leads.
- Quote preview: expiring locks and recent quote packages.
- CRM sync: last sync, failures, queue.
- Quick actions.

Empty states:

- No leads: prompt to import/capture lead.
- No campaigns: prompt to create campaign.
- CRM offline: read-only banner.

## Assistant Route `/assistant`

Build sections:

- Active leads rail.
- Timeline rail.
- Main chat.
- Lead context card.
- Safe action panel.
- Tool/model status.

Safe actions:

- Summarize lead.
- Draft SMS/email.
- Explain quote.
- Create broker task.
- Recommend next touch.

Disabled until services exist:

- Send SMS/email.
- Mutate CRM.
- Lock rate.
- Publish campaign.

## Campaigns Route `/campaigns`

Build sections:

- Campaign KPI row.
- Campaign cards.
- Enrollment table.
- Timeline.
- Assignment queue.
- Compliance block queue.
- Analytics preview.

Actions:

- New campaign.
- Open builder.
- Pause/resume enrollment.
- Assign campaign.
- Export performance.

Health states:

- Campaign engine offline.
- n8n offline.
- Provider degraded.

## Campaign Builder `/campaigns/builder`

Build sections:

- Campaign metadata.
- Audience/loan-purpose selector.
- Step cards.
- Add touchpoint drawer.
- Template preview.
- Validation panel.
- Save/validate/publish controls.

Validation checks:

- Missing template.
- Missing channel consent.
- Unsupported provider.
- Quiet-hour risk.
- Missing disclosure.
- Duplicate sends.

## Leads `/leads`

Build sections:

- Lead metrics.
- Search/filter/sort.
- Lead cards/table.
- Bulk actions.
- Compliance state chips.

Fields:

- Name.
- Loan purpose.
- Amount.
- Stage.
- Source.
- Score/grade.
- Campaign.
- Next touch.
- Consent state.

## Lead Cockpit `/leads/[leadId]`

Build sections:

- Lead header.
- Contact/consent.
- Loan scenario.
- Campaign enrollment.
- Timeline.
- Quote history.
- Application/documents.
- Compliance log.
- Assistant sidecar.

Actions:

- Draft outreach.
- Assign campaign.
- Pause automation.
- Start quote.
- Create task.
- Open CRM.

## Quotes `/quotes`

Build sections:

- Live/fallback rate status banner.
- KPI row.
- Current rate sheet.
- Recent quotes.
- Expiring locks.
- Pricing engine comparison.
- Generate quote CTA.
- Export comparison image.

Provider states:

- Connected.
- Not connected.
- Stale.
- Error.

## Quote Detail `/quotes/[quoteId]`

Build sections:

- Borrower and loan context.
- Scenario comparison.
- Payment/cost breakdown.
- Assumptions.
- Expiration.
- Approval state.
- CRM attachment state.
- PDF/export/send controls.

## Pipeline `/pipeline`

Build sections:

- KPI row from mortgage-crm.
- Kanban lanes.
- Filters.
- Stage counts.
- Lead cards.
- Activity feed.

Initial lanes:

- New.
- Contacted.
- Qualified.
- Application.
- Processing.
- Underwriting.
- Clear to close.
- Closed/Lost.

## Applications `/applications`

Build sections:

- Application cards/table.
- Stage filter.
- Required docs.
- Disclosure/e-sign status.
- Milestones.
- Broker owner.
- Linked lead and CRM record.

## CRM `/crm`

Build sections:

- Sync health hero.
- Object map.
- Recent writes.
- Recent failures.
- Field mapping summary.
- Twenty deep link.

## CRM Settings `/crm/settings`

Build sections:

- Credential checks.
- Required secrets.
- Webhook endpoint state.
- Field mapping editor.
- Object mapping table.
- Dry-run sync test.
- Owner action checklist.

## Admin `/admin`

Build sections:

- Operations metrics.
- Recent activity.
- System alerts.
- Rate lock alerts.
- Campaign performance alerts.
- Quick actions.

## Integrations `/admin/integrations`

Build sections:

- Tool grid.
- Service health.
- Required secret state.
- Owner actions.
- Failed jobs.
- Deep links.

Cards:

- Twenty.
- CRM API.
- Nexus.
- OpenClaw.
- n8n.
- Activepieces.
- Twilio.
- SendGrid.
- OpenMemory.
- Cloudflare.
- Grafana.
- Gitea.
- Portainer.
- Paperclip.

## Tool Routes

`/tools/openclaw`:

- Chat proxy.
- Gateway health.
- Studio link.
- Model route.
- Allowed tools.

`/tools/nexus`:

- Neon console.
- Groups/tools/routing/LiteLLM/environment/config.
- Status/settings endpoints.

`/tools/n8n`:

- Workflow health.
- Recent runs.
- Failures.
- Deep link.

`/tools/activepieces`:

- Connector health.
- Approval queue.
- Deep link.

`/tools/openmemory`:

- Memory status.
- Deep link.

`/tools/paperclip`:

- Document pipeline status.
- Deep link.

## Build Order

1. Shared route shell and nav.
2. Overview command center.
3. Campaigns and builder.
4. Leads and lead cockpit.
5. Quotes and quote detail.
6. Pipeline and applications.
7. CRM and settings.
8. Tool routes.
9. Integration hub.
10. Real service wiring and health states.
