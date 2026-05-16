# Webapp Command Center Spec

## Intent

`apps/nyra-webapp` is the internal broker command center. It should become the one place a broker can see what needs attention, work a lead, start or pause campaigns, generate or review quote options, inspect CRM sync state, and jump to operational tools.

The current webapp shell is the correct destination, but the current route content is still shallow. Future work should deepen the routes instead of creating more standalone apps.

## Visual Direction

The webapp should use a dark, premium operations-cockpit base with RateHunter/Nyra branding, glassy cards, strong data density, and visible service states.

Use these visual sources:

- Current webapp screenshots for shell, navigation, and route structure.
- Mortgage-crm screenshot for pipeline kanban, large rounded cards, and spacious CRM data presentation.
- Nexus UI screenshot for neon console treatment on tool pages.
- Legacy HTML screenshot/source for dense campaign operations, timeline, communication drawer, and lender quick-connect panels.
- Admin source for metric tiles, quote desk, alerts, and quick actions.

Do not copy the broken nyra-admin visual state or the bare Twenty shell.

## Shared Shell Requirements

- Persistent top nav: Overview, Assistant, Campaigns, Leads, Quotes, Pipeline, CRM, Applications, Admin, OpenClaw, Nexus, Integrations.
- Use active route highlighting and compact domain badge `NYRA.RATEHUNTER.NET`.
- Add a global search/command palette concept in the guidance for future implementation: search lead, open quote, start campaign, jump to tool, create broker task.
- Add service status strip on the overview and integrations pages.
- Keep pages responsive, but optimize desktop first for broker operations.
- Use shared card, badge, button, tabs, input, and select components wired to the TweakCN/shadcn token contract.

## `/` Overview Blueprint

Purpose:

- First screen for daily broker operations.

Source material:

- Current webapp `index.png`.
- Legacy HTML campaign dashboard metrics and recent leads/timeline.
- Admin metrics and alerts.

UI blocks:

- Hero command card with active leads, live campaigns, applications, pipeline value, and assistant CTA.
- Today queue with leads needing first touch, quote follow-up, disclosures, rate locks, and campaign pauses.
- Campaign timeline showing next scheduled SMS/email/voice/broker task, channel, provider, lead, and compliance state.
- Quote desk preview with current average rate, expiring locks, recent quotes, and “open quote desk”.
- CRM sync status card with last sync, failures, queue length, and Twenty link.
- Service health strip for Nexus, OpenClaw, CRM API, campaign engine, quote API, Twilio, SendGrid, n8n, Activepieces, Cloudflared.
- Quick actions: add lead, generate quote, assign campaign, pause automation, open assistant, open integrations.

Backing data:

- Initially use current `mock-data` patterns where services are not ready.
- Mark every mocked card visibly as local fallback or demo state until wired.

Out of scope:

- Direct CRM writes from overview.
- Direct workflow-node execution from overview.

## `/assistant` Blueprint

Purpose:

- Lead-aware Nyra assistant for broker work.

Source material:

- Current webapp assistant route.
- OpenClaw service spec.
- Legacy HTML communication drawer.

UI blocks:

- Left rail active leads with campaign state, loan purpose, urgency, and CRM sync badge.
- Unified timeline below lead list: inbound/outbound messages, quote events, CRM updates, compliance events, campaign steps.
- Main assistant conversation panel with selected lead context.
- Safe action cards: draft SMS, draft email, summarize lead, explain quote, create broker task, recommend campaign, request docs.
- Dangerous actions disabled until service approval path exists: send message, mutate CRM, lock rate, publish campaign.
- Model/tool status row: Nexus route, OpenClaw status, memory status, CRM status.

Backing services:

- `/api/leads` and `/api/leads/[id]/conversation` while local adapters exist.
- OpenClaw proxy route for assistant response.
- CRM API for canonical lead/timeline data when available.

Compliance:

- Any draft outreach must show consent, DNC, STOP, unsubscribe, quiet-hours, and reply-pause indicators.

## `/campaigns` Blueprint

Purpose:

- Manage campaign templates, active enrollments, health, and performance.

Source material:

- Legacy HTML campaign dashboard.
- Current webapp campaigns table.
- Shared campaign docs and n8n workflow docs.

UI blocks:

- KPI row: total leads in campaigns, active campaigns, today’s calls, emails sent, paused by reply, blocked by compliance.
- Campaign cards: status, lead count, completion, response rate, channel mix, failure count.
- Active enrollment table: lead, campaign, stage, last touch, next touch, pause reason, action.
- Campaign timeline: upcoming communications grouped by day and provider.
- Recent leads needing assignment.
- Compliance queue: blocked sends and reasons.
- Builder entry cards by loan purpose: purchase, refinance, cash-out, HELOC, government, post-close.

Actions:

- Assign lead to campaign.
- Pause/resume enrollment.
- Open builder.
- View failures.
- Export campaign performance.

Out of scope:

- Sending messages directly from this page without campaign/compliance service.

## `/campaigns/builder` Blueprint

Purpose:

- Build and edit mortgage campaign sequences.

Source material:

- Current builder route.
- Legacy HTML campaign builder.
- Campaign Day 1-5 and Day 6-36 shared docs.

UI blocks:

- Campaign metadata: name, loan purpose, audience, active/draft state, owner.
- Step list with timing, channel, template, provider, compliance disclosure, and retry behavior.
- Add touchpoint panel with step types: SMS, email, voice call, voicemail, missed-call ping, broker task, wait, condition, quote reminder, document request, AI summary, CRM update, webhook.
- Preview panel showing borrower-facing copy and compliance footer.
- Validation panel: missing template, missing consent channel, quiet-hour risk, unsupported provider, duplicate sends.
- Publish controls: save draft, validate, publish, pause all.

Backing services:

- Campaign engine owns campaign DSL and schedule decisions.
- n8n/Activepieces execute approved steps.

## `/leads` Blueprint

Purpose:

- Lead inbox and prioritization surface.

Source material:

- Current webapp leads route.
- Admin lead scoring source.
- Mortgage-crm lead cards and kanban.

UI blocks:

- Summary cards: total leads, new leads, qualified, average score, blocked, reply paused.
- Filters: source, loan purpose, stage, credit band, consent state, assigned broker, campaign status.
- Lead cards or table rows with name, purpose, loan amount, stage, lead score/grade, contact, source, next touch, compliance flags.
- Bulk actions: assign campaign, assign broker, export, pause automation.
- Empty state by filter.

Out of scope:

- Browser-side direct Twenty mutation.

## `/leads/[leadId]` Blueprint

Purpose:

- Full lead cockpit.

Source material:

- Mortgage-crm lead detail route.
- Current assistant timeline behavior.
- CRM API spec.

UI blocks:

- Header with lead identity, stage, source, score, assigned broker, CRM ID, sync state.
- Contact and consent panel.
- Loan scenario panel.
- Campaign enrollment panel.
- Communication timeline.
- Quote history.
- Application/documents panel.
- Compliance/audit log.
- Assistant sidecar with safe actions.

Required degraded states:

- CRM offline: show cached data and disable CRM-write actions.
- Campaign service offline: show campaign state but disable pause/resume.
- Quote service offline: show history but disable new quote.

## `/quotes` Blueprint

Purpose:

- Operational quote desk and rate intelligence surface.

Source material:

- Admin quote desk source.
- Current webapp quotes route.
- Landing `market-data.ts`.
- Legacy HTML pricing engine comparison.

UI blocks:

- Rate status banner: live websocket connected, API fallback, or static demo fallback.
- KPI row: active quotes, locked rates, average rate, expiring soon, quote approvals pending.
- Current rate sheet cards: product, rate, APR, points, trend, source, last updated.
- Recent quotes: borrower, product, loan amount, payment, status, lock expiration.
- Pricing engine comparison: Rocket Mortgage, LenderPrice, Advantage Credit or configured providers.
- Generate rate comparison image/export action.
- Quote generation entry point with lead selector and assumptions.

Compliance:

- Quote outputs must be labeled scenario/indicative until approved by quote service and broker.

## `/quotes/[quoteId]` Blueprint

Purpose:

- Review one quote scenario package.

UI blocks:

- Borrower/lead/loan context.
- Scenario options and assumptions.
- Payment/cost breakdown.
- Source/last updated/expiration.
- Broker approval state.
- CRM attachment state.
- PDF/export/send controls gated by compliance and approval.

## `/pipeline` Blueprint

Purpose:

- Kanban and metric view of lead/application progress.

Source material:

- Mortgage-crm screenshot and `KanbanBoard`.
- Admin metrics.

UI blocks:

- KPI row: active pipeline, lead conversion, new leads, average cycle time.
- Kanban lanes: new, contacted, qualified, application, processing, underwriting, clear to close, closed/lost.
- Lead cards with amount, urgency, product type, contact buttons, assigned broker, last/next touch.
- Sorting and filters: all, conventional, government, HELOC, purchase, refinance.
- Drag-and-drop may remain future work; initial implementation can use static lanes and service actions.

## `/applications` Blueprint

Purpose:

- Application and document collection visibility.

Source material:

- Mortgage-crm application domain.
- Current webapp applications route.

UI blocks:

- Application list with borrower, product, amount, stage, milestone, owner, doc state.
- Required docs checklist.
- Disclosure status.
- e-sign status.
- Link to lead cockpit and CRM record.

## `/crm` And `/crm/settings` Blueprint

Purpose:

- Broker-safe CRM mirror and operator integration controls.

Source material:

- Current CRM route.
- `apps/twenty-crm` docs/scripts/integration service.
- `services/crm-api/SPEC.md`.

UI blocks:

- CRM sync health.
- Object mapping status.
- Recent writes and failures.
- Field mapping summary.
- Webhook status.
- Twenty deep link.
- Credential health.
- Dry-run sync test.

Out of scope:

- Rebuilding full Twenty UI.

## `/admin` And `/admin/integrations` Blueprint

Purpose:

- Operator controls inside the webapp, not a separate admin product.

Source material:

- Admin/nyra-admin metrics, alerts, quick actions.
- Tool/service map.

UI blocks:

- Operations metrics.
- System alerts.
- Rate lock warnings.
- Campaign performance alerts.
- Integration hub with setup state, health state, required secrets, links, owner actions.

## Tool Routes

`/tools/openclaw`:

- Keep current proxy test panel but restyle into the webapp system.
- Add health, upstream URL status, model route, allowed tools, and recent failures.

`/tools/nexus`:

- Build from `apps/nexusUI`: groups, tools, routing, LiteLLM, environment, config.
- Use neon console visual language.
- Provide save/apply only after backend adapter exists.

`/tools/n8n`:

- Show workflow health, recent runs, failed executions, retry queue, and access-gated deep link.

`/tools/activepieces`:

- Show connector catalog, approval queue, failed pieces, and access-gated deep link.

`/tools/openmemory`:

- Link/status only unless a product workflow requires native memory management.

`/tools/paperclip`:

- Link/status for document extraction/upload workflow if deployed.

## Implementation Rule

When implementing a webapp route, add source comments or docs that identify whether data is real, mocked, cached, or fallback. The UI should be honest about its wiring state.
