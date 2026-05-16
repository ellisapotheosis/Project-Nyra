# Canonical Integration Checklist

This is the master checklist for merging Project Nyra materials into the canonical public landing app, canonical internal webapp, and Twenty CRM integration surface. It covers components, code, examples, snippets, themes, banners, images, links, phrasing, logos, slogans, tickers, forms, clocks, provider panels, status states, and integration concepts mentioned across `apps/guidance/**` and its reference children.

## Canonical Destinations

- [ ] Public borrower site is `apps/ratehunter-landing`.
- [ ] Internal broker command center is `apps/nyra-webapp`.
- [ ] Twenty CRM remains the system of record and is linked/access-gated, not visually merged.
- [ ] `apps/twenty-crm` remains integration/config/MCP reference material for `/crm`, `/crm/settings`, and `/admin/integrations`.
- [ ] `apps/twenty` remains untouched unless the work explicitly targets Twenty itself.
- [ ] Existing `apps/guidance` docs and reference paths remain unmoved.

## Source Inventory

- [ ] `apps/guidance/00-master-build-brief.md`.
- [ ] `apps/guidance/01-reference-map.md`.
- [ ] `apps/guidance/components/01-public-landing-component-brief.md`.
- [ ] `apps/guidance/components/02-webapp-route-map.md`.
- [ ] `apps/guidance/components/03-theme-migration-brief.md`.
- [ ] `apps/guidance/prompts/01-backup-and-inventory-agent.md`.
- [ ] `apps/guidance/prompts/02-landing-page-agent.md`.
- [ ] `apps/guidance/prompts/03-webapp-shell-and-theme-agent.md`.
- [ ] `apps/guidance/prompts/04-crm-pipeline-and-quote-agent.md`.
- [ ] `apps/guidance/prompts/05-auth-and-platform-agent.md`.
- [ ] `apps/guidance/prompts/06-integration-orchestrator-agent.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/next-app`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/admin`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/webapp`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/ratehunter.carrd.co-landing-page-webscraped-code`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/BUSINESS_GOALS.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/CRM_REQUIREMENTS.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/LEAD_DRIP_CAMPAIGNS.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/MORTGAGE_BROKER_WORKFLOWS.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/NYRA_ASSISTANT_FEATURES.md`.
- [ ] `apps/guidance/references/webapp-merge-snapshot/ellisapotheosis-apotheosis-mortgage-lead-campaign/nyra-master-prompt-package/project-requirements/RATEHUNTER_LANDING_PAGE.md`.
- [ ] `apps/shared/docs/**`.
- [ ] `apps/shared/data/**`.
- [ ] `apps/shared/n8n-shared/**`.
- [ ] `apps/shared/assets/**`.
- [ ] `/home/ellisapotheosis/repos/project-nyra/screenshots/**`.
- [ ] `/home/ellisapotheosis/repos/project-nyra/apps/shared/assets/webapp-v1-source-material/index.html`.

## Landing App Checklist

Destination and boundaries:

- [ ] Merge into `apps/ratehunter-landing`.
- [ ] Keep public-only borrower/client audience.
- [ ] Do not add internal broker routes.
- [ ] Do not add CRM/admin/tool pages.
- [ ] Do not expose internal API, worker, MCP, database, or provider-dashboard URLs.

Visual identity:

- [ ] Keep `landing-main` dark Carrd-style layout.
- [ ] Keep rounded dark-glass cards.
- [ ] Keep purple/blue accent system.
- [ ] Keep dotted/starfield/animated background texture.
- [ ] Keep large monospaced headline typography.
- [ ] Keep uppercase tracking micro-label typography.
- [ ] Keep premium personal advisory tone instead of generic SaaS tone.
- [ ] Preserve responsive hero, wizard, cards, contact blocks, ticker, and chat.
- [ ] Add reduced-motion fallback for animated background and ticker.

Branding and logos:

- [ ] Use RateHunter nav logo.
- [ ] Use RateHunter footer logo.
- [ ] Use RateHunter transparent/original SVG or PNG variants from `apps/shared/assets/Ratehunter_Logo_Final/**`.
- [ ] Use West Capital Lending logo/context in advisory/licensing section.
- [ ] Keep Ellis Andersen identity.
- [ ] Keep Branch Manager title.
- [ ] Keep Mortgage Broker title.
- [ ] Keep Real Estate Agent title.
- [ ] Keep West Capital Lending association.
- [ ] Keep RateHunter positioning.
- [ ] Keep NMLS/company licensing text.
- [ ] Keep DRE/company DRE text where present.

Hero and profile:

- [ ] Keep split hero with profile/contact card on left and borrower intake on right.
- [ ] Keep Ellis profile image/card.
- [ ] Keep QR/contact card.
- [ ] Keep “Start your quote without the usual friction” direction.
- [ ] Keep borrower intake wizard as primary conversion surface.
- [ ] Keep “Schedule Time With Me” CTA.
- [ ] Keep “Start Quote Intake” CTA.
- [ ] Keep “Call Me” CTA.
- [ ] Keep “Text Me” CTA.
- [ ] Keep direct contact details.
- [ ] Keep office/address block.
- [ ] Keep licensing block.

Landing phrasing and slogans:

- [ ] Preserve “Borrower-facing mortgage and real estate advisory.”
- [ ] Preserve “Your trusted mortgage partner for residential, commercial, refinance, HELOC, and real estate strategy.”
- [ ] Preserve wholesale lender shopping language.
- [ ] Preserve “Tailored solutions, faster execution, and one advisor across the process.”
- [ ] Preserve “Mortgage guidance that feels personal, but still moves with real operational speed.”
- [ ] Preserve “Everything borrowers need, in one place.”
- [ ] Preserve borrower-first guidance phrasing.
- [ ] Preserve secure intake/document guidance phrasing.
- [ ] Preserve educational chat/intake disclaimers.

Trust, services, and action blocks:

- [ ] Keep approved lenders/investors trust card.
- [ ] Keep BBB/review reputation trust card.
- [ ] Keep borrower chat, quote intake, and document guidance trust card.
- [ ] Keep licensed mortgage and real estate guidance trust card.
- [ ] Keep Purchase Mortgage Strategy service card.
- [ ] Keep Refinance & Equity service card.
- [ ] Keep Residential & Commercial service card.
- [ ] Keep Fast Borrower-Friendly Execution service card.
- [ ] Include HELOC/fixed-rate HELOC content.
- [ ] Include cash-out refinance content.
- [ ] Include reverse/specialty option language only where legally safe.
- [ ] Keep Schedule Time With Me / Calendly booking.
- [ ] Keep Mortgage Quote/Application Portal.
- [ ] Keep Fixed Rate HELOC Quote.
- [ ] Keep Encrypted Document Uploads.
- [ ] Keep West Capital Lending company profile.
- [ ] Keep Save Contact Info / digital contact card.
- [ ] Keep Instagram, LinkedIn, NMLS Licensee Verification, and Company NMLS Verification links.

Lead wizard:

- [ ] Keep `LeadCaptureWizard`.
- [ ] Capture purchase/refinance/cash-out/HELOC intent.
- [ ] Capture property and loan context.
- [ ] Capture borrower name, email, phone.
- [ ] Capture preferred contact method.
- [ ] Capture SMS/email/voice consent.
- [ ] Include consent disclosure text.
- [ ] Include timestamp/disclosure version in implementation.
- [ ] Preserve success state: Nyra analyzing scenario/current rate sheets.
- [ ] Route submissions through lead intake boundary, not direct Twenty browser writes.

Borrower chat:

- [ ] Keep `BorrowerChatWidget`.
- [ ] Keep “Ask Nyra” launcher.
- [ ] Keep prompts about rates, APR, documents, closing, and next steps.
- [ ] Keep chat educational only.
- [ ] Prevent final-rate, approval, or legal/tax promises.
- [ ] Prevent chat from covering primary mobile CTA.

Market ticker and Market Pulse:

- [ ] Add slim top Market Pulse ticker.
- [ ] Add lower Market Pulse section.
- [ ] Include 10Y Treasury.
- [ ] Include 30Y Conventional.
- [ ] Include 15Y Conventional.
- [ ] Include 30Y FHA.
- [ ] Include 30Y VA.
- [ ] Include HELOC Variable.
- [ ] Include HELOAN Fixed.
- [ ] Show product label.
- [ ] Show indicative rate/yield.
- [ ] Show APR where available.
- [ ] Show trend up/down/flat.
- [ ] Show source label.
- [ ] Show last-updated/fallback state.
- [ ] Use `fetchTreasury10Y`.
- [ ] Use `buildRateCards`.
- [ ] Use `getNewsFeed`.
- [ ] Use fallback values if remote feeds fail.
- [ ] Add top ticker disclaimer: educational snapshot only, not loan estimate or commitment.
- [ ] Add lower full market disclaimer.
- [ ] Ensure ticker pauses on hover/focus.
- [ ] Ensure ticker has mobile horizontal-scroll fallback.

Landing assets:

- [ ] Select final nav logo from shared/current public assets.
- [ ] Select final footer logo from shared/current public assets.
- [ ] Evaluate profile/PFP assets before replacing current profile.
- [ ] Evaluate business card assets for Save Contact section.
- [ ] Evaluate intro video for optional future media.
- [ ] Avoid copying entire logo folders into app public assets.
- [ ] Avoid copying `Zone.Identifier` sidecars.

Landing compliance and validation:

- [ ] Mortgage services subject to lender review.
- [ ] Borrower qualification and market conditions disclaimer.
- [ ] Equal Housing Opportunity text.
- [ ] NMLS/license text.
- [ ] Chat and intake are educational/routing tools.
- [ ] No binding credit decision.
- [ ] No final rate/approval promise.
- [ ] No “lowest rate” claim without substantiation.
- [ ] Build passes.
- [ ] Typecheck passes.
- [ ] Lint passes or known existing issues are documented.
- [ ] No internal routes or internal tool links.

## Webapp Checklist

Destination and shell:

- [ ] Merge into `apps/nyra-webapp`.
- [ ] Keep internal broker/coworker audience.
- [ ] Keep existing top nav and route shell.
- [ ] Keep `NYRA.RATEHUNTER.NET` internal domain badge.
- [ ] Keep dark command-center theme.
- [ ] Add Integrations route/link.
- [ ] Add active route state.
- [ ] Add command/search palette concept.
- [ ] Add broker identity area.
- [ ] Add service health strip.
- [ ] Add visible live/cached/demo/fallback/offline data labels.

Overview `/`:

- [ ] Replace self-referential implementation note with real command dashboard.
- [ ] Add active leads, reply-paused leads, live campaigns, applications, pipeline value, and compliance block KPIs.
- [ ] Add today queue.
- [ ] Add next-touch campaign timeline.
- [ ] Add recent leads needing assignment.
- [ ] Add quote desk preview.
- [ ] Add CRM sync status card.
- [ ] Add service health cards.
- [ ] Add quick actions: add lead, generate quote, assign campaign, pause automation, open assistant, open integrations.
- [ ] Pull campaign dashboard concepts from legacy HTML.
- [ ] Pull metrics, alerts, and quick actions from admin/nyra-admin.

Assistant `/assistant`:

- [ ] Keep active leads rail.
- [ ] Keep unified timeline rail.
- [ ] Keep main chat panel.
- [ ] Keep OpenClaw/Nexus model status row.
- [ ] Add selected lead context card.
- [ ] Add safe action cards: draft SMS, draft email, explain quote, summarize lead, create broker task, recommend next touch.
- [ ] Disable send/mutate/lock/publish until service approval path exists.
- [ ] Add consent/DNC/STOP/reply-pause/quiet-hours indicators.
- [ ] Harvest communication drawer concept from legacy HTML.

Campaigns `/campaigns`:

- [ ] Replace shallow table-only route with campaign operations dashboard.
- [ ] Add total leads, active campaigns, today’s calls, emails sent, paused-by-reply, and blocked-by-compliance KPIs.
- [ ] Add campaign cards with status, lead count, completion, response rate, channel mix, and failure count.
- [ ] Add active enrollment table.
- [ ] Add recent leads assignment queue.
- [ ] Add campaign timeline.
- [ ] Add provider badges: Twilio, Gmail, Outlook, SendGrid.
- [ ] Add compliance block queue.
- [ ] Add campaign analytics preview.
- [ ] Harvest Refinance Blitz, Home Equity Pro, Purchase Power concepts.

Campaign builder `/campaigns/builder`:

- [ ] Upgrade placeholder into sequence builder.
- [ ] Add campaign metadata, loan-purpose/audience selector, step cards, add touchpoint panel, template preview, validation panel, save draft, validate, and publish controls.
- [ ] Add timing/day field.
- [ ] Add channel selector.
- [ ] Add template selector.
- [ ] Add provider selector.
- [ ] Add compliance disclosure indicator.
- [ ] Add retry policy.
- [ ] Add step types: SMS, email, voice call, voicemail, missed-call ping, broker task, broker alert, wait, condition, quote reminder, document request, AI summary, CRM update, webhook.
- [ ] Use Campaign Day 1-5 and Day 6-36 source docs.

Leads `/leads`:

- [ ] Keep dark lead-card baseline.
- [ ] Add total leads, new leads, qualified leads, average score, blocked leads, and reply-paused metrics.
- [ ] Add filters: source, loan purpose, stage, credit band, consent, assigned broker, campaign status.
- [ ] Add admin lead score and lead grade.
- [ ] Add location, assigned broker, source, next touch, compliance flags.
- [ ] Add bulk assign campaign and bulk pause automation.
- [ ] Add lead detail link.
- [ ] Harvest mortgage-crm card/kanban concepts.

Lead cockpit `/leads/[leadId]`:

- [ ] Add route if absent.
- [ ] Add lead header, CRM ID/sync badge, contact/consent panel, loan scenario panel, campaign enrollment panel, unified communication timeline, quote history, application/document panel, compliance/audit log, assistant sidecar, and safe actions.
- [ ] Add CRM offline, campaign offline, and quote offline degraded states.

Quotes `/quotes`:

- [ ] Keep current quote desk baseline.
- [ ] Keep websocket fallback warning.
- [ ] Add live/fallback/stale rate status banner.
- [ ] Add active quotes, locked rates, average rate, expiring soon, and approvals pending KPIs.
- [ ] Add current rate sheet, recent quotes, rate trend icons, lock expiration queue.
- [ ] Add pricing engine comparison with Rocket Mortgage, LenderPrice, Advantage Credit, and internal/manual rate sheet provider cards.
- [ ] Add provider not-connected state.
- [ ] Add generate quote CTA.
- [ ] Add export/generate rate comparison image action.
- [ ] Add quote source/assumption labels.
- [ ] Harvest admin quote desk and legacy pricing comparison.

Quote detail `/quotes/[quoteId]`:

- [ ] Add route if absent.
- [ ] Add borrower/lead/loan context, scenario comparison, payment/cost breakdown, assumptions, rate source, expiration, approval state, CRM attachment state, PDF/export, and send controls disabled until approval/compliance path exists.

Pipeline `/pipeline`:

- [ ] Upgrade metrics-only route with kanban.
- [ ] Add active pipeline, lead conversion, new leads, average cycle time, pipeline value, and compliance score KPIs.
- [ ] Add lanes: New, Contacted, Qualified, Application, Processing, Underwriting, Clear to Close, Closed/Lost.
- [ ] Add filters: all, conventional, government, HELOC, purchase, refinance.
- [ ] Add lead cards with amount, urgency, product, contact buttons, assigned broker, last/next touch.
- [ ] Harvest mortgage-crm kanban and adapt to dark webapp shell.

Applications `/applications`:

- [ ] Add stage filter, document checklist, disclosure status, e-sign status, milestone, assigned broker/processor, linked lead, and CRM record link.

CRM `/crm`:

- [ ] Replace shallow mirror with CRM sync command page.
- [ ] Add connected/offline/degraded state, last sync, queue depth, failures, object map, recent writes, recent failures, data freshness labels, Twenty deep link, field mapping summary, and webhook status.
- [ ] Use `services/crm-api/SPEC.md`.
- [ ] Use `apps/twenty-crm` docs/scripts as reference.

CRM settings `/crm/settings`:

- [ ] Add route if absent.
- [ ] Add credential health, required secrets list, webhook endpoint state, field mapping table, object mapping table, sync policy state, dry-run sync tester, and owner manual action checklist.
- [ ] Ensure no browser direct Twenty mutation.

Admin `/admin`:

- [ ] Keep operator route inside webapp, not separate product.
- [ ] Add operations metrics, recent activity, system alerts, rate-lock warnings, campaign performance alerts, and quick actions.
- [ ] Harvest nyra-admin/admin metric concepts.
- [ ] Ignore broken nyra-admin styling.

Integrations `/admin/integrations`:

- [ ] Add route if absent.
- [ ] Add integration hub with tool/service grid, health state, required secret state, owner actions, failed jobs/runs, and deep links.
- [ ] Include Twenty, CRM API, Nexus, OpenClaw, n8n, Activepieces, Twilio, SendGrid, Gmail, Outlook, OpenMemory, Cloudflare, Grafana, Gitea, Portainer, and Paperclip.

Tool routes:

- [ ] `/tools/openclaw`: proxy chat, gateway health, Studio link, allowed tool list, current model route, CRM-safe action policy, recent upstream errors.
- [ ] `/tools/nexus`: harvest `apps/nexusUI`, neon console visual language, groups/tools/providers cards, side nav, fuzzy find, smart routing, privacy mode, apply adapter, refresh, save disabled until backend adapter.
- [ ] `/tools/n8n`: workflow health, lead ingest, campaign execute, response handler, STOP handler, quote/doc reminders, recent runs, failed executions, retry queue, access-gated deep link.
- [ ] `/tools/activepieces`: connector catalog, approval queue, failed pieces, Gmail, Outlook, Twilio, SendGrid, Twenty, webhook, Cloudflare, Google Drive, access-gated deep link.
- [ ] `/tools/openmemory`: link/status page, memory provider health, Nexus memory route, recent memory errors.
- [ ] `/tools/paperclip`: document pipeline status, upload/extraction status, recent document queue, storage/security destination, deep link.

Communication drawer:

- [ ] Rebuild legacy HTML fixed communication panel as webapp side panel.
- [ ] Use from `/assistant` and `/leads/[leadId]`.
- [ ] Show selected lead conversation.
- [ ] Draft SMS/email/voice note.
- [ ] Include STOP instruction checkbox/concept for SMS.
- [ ] Disable send until compliance/provider service is wired.
- [ ] Log future sends to CRM communication log.

Quick-connect lender/provider panel:

- [ ] Rebuild legacy Quick Connect concept.
- [ ] Include Rocket Mortgage, LenderPrice, Advantage Credit, and internal/manual rate sheet.
- [ ] Include provider access mode: iframe/link/API/not connected.
- [ ] Place in quote desk or integrations, not public landing.

Theme switcher:

- [ ] Preserve concept from legacy HTML.
- [ ] Include light/dark variants after token system is stable.
- [ ] Do not prioritize before route consolidation.

Webapp validation:

- [ ] Build passes.
- [ ] Typecheck passes.
- [ ] Lint passes or known issues are documented.
- [ ] Routes are navigable.
- [ ] Mock/fallback states are labeled.
- [ ] No internal worker/raw MCP/data-store public URLs.

## Twenty CRM Checklist

Do not merge visually:

- [ ] Do not copy `apps/twenty` bare shell.
- [ ] Do not modify `apps/twenty` unless explicitly scoped.
- [ ] Do not rebuild full Twenty UI in webapp.

Link/access-gate:

- [ ] Add “Open Twenty CRM” deep link from `/crm`.
- [ ] Add “Open Twenty CRM” deep link from lead cockpit.
- [ ] Add “Open Twenty CRM” deep link from `/admin/integrations`.
- [ ] Ensure links are access-gated in deployment docs.

Use `apps/twenty-crm` as reference:

- [ ] Docker compose scripts.
- [ ] Setup scripts.
- [ ] Metadata provisioning.
- [ ] Backup/restore scripts.
- [ ] Integration package.
- [ ] MCP server package.
- [ ] Webhook documentation.
- [ ] Field/object mapping references.
- [ ] Env var references.
- [ ] Health command references.

CRM object mapping:

- [ ] Contact.
- [ ] Lead.
- [ ] Loan/Application.
- [ ] Campaign Enrollment.
- [ ] Communication Log.
- [ ] Quote.
- [ ] Compliance Event.
- [ ] Broker Task.

CRM safety:

- [ ] Browser UI does not directly mutate Twenty.
- [ ] Assistant does not directly mutate Twenty.
- [ ] n8n does not own CRM state.
- [ ] CRM writes go through `crm-api` or dedicated Twenty integration.
- [ ] CRM offline state disables writes.
- [ ] Sync failures are visible.

## Shared Asset Checklist

RateHunter logo assets:

- [ ] Original on transparent.
- [ ] White on transparent.
- [ ] Black on transparent.
- [ ] Footer/nav-sized variants.
- [ ] Social variants only where needed.
- [ ] Business tool variants only where needed.

Nyra/PFP assets:

- [ ] Select one assistant/avatar image if used.
- [ ] Avoid mixing many generated personas.
- [ ] Use only in assistant/internal contexts unless brand-approved.

Uploaded business materials:

- [ ] `All in One Calculator.xls` informs quote/calculator logic.
- [ ] `Broker Flow - Ellis Anderson.xlsm` informs broker workflow logic.
- [ ] `Campaign Day 1 to 5.docx` informs campaign templates.
- [ ] `Campaign 6 to 36.docx` informs longer campaign templates.
- [ ] `SOFT QUOTE BROKERFLOW.docx` informs quote workflow and copy.
- [ ] `DECLARATIONS QUESTIONS.pdf` informs document/application requirements.
- [ ] `FIGURE LINK.docx` review for link/copy assets.
- [ ] `My Intro Video.mp4` consider for landing media later.
- [ ] `bus card.png` and `Copy of Copy of Digital Business Card Editable.png` inform save-contact/business-card UI.
- [ ] `Project Nyra Implementation Package.docx` review before final implementation pass.

## Source App Disposition Checklist

- [ ] `apps/ratehunter-landing`: canonical public landing; keep and enhance.
- [ ] `apps/landing/app`: legacy landing; use only for missing unique public content.
- [ ] `apps/nyra-webapp`: canonical internal webapp; keep and deepen.
- [ ] `apps/admin/app`: harvest metrics, quote desk, lead scoring, alerts, quick actions; do not preserve as final product.
- [ ] `apps/admin`: old/admin prototype; harvest only unique working concepts.
- [ ] `apps/mortgage-crm`: harvest pipeline/kanban, lead/application/domain entities, Twenty service concepts; do not preserve as standalone product; Clerk is not final direction.
- [ ] `apps/nexusUI`: harvest neon console design and status/settings API shape into `/tools/nexus`.
- [ ] `apps/twenty`: leave untouched and link/access-gate.
- [ ] `apps/twenty-crm`: use as integration/config/MCP reference; do not visually merge.
- [ ] Legacy HTML prototype: harvest campaign dashboard, fixed communication panel, campaign types sidebar, Quick Connect, integrations list, campaign timeline, pricing engine comparison, campaign builder cards, and theme switcher concept; do not copy CDN Tailwind/FontAwesome directly.

## Compliance And Safety Checklist

Outreach:

- [ ] Consent state visible.
- [ ] DNC state visible.
- [ ] STOP state visible.
- [ ] Unsubscribe state visible.
- [ ] Reply pause state visible.
- [ ] Quiet-hours state visible.
- [ ] Provider credential state visible.
- [ ] Idempotency required before sends.
- [ ] CRM communication log required after sends.

Quotes/rates:

- [ ] Rate source visible.
- [ ] Assumptions visible.
- [ ] Last updated visible.
- [ ] Stale/fallback labels visible.
- [ ] No “guaranteed.”
- [ ] No “approved.”
- [ ] No “locked” without lock proof.
- [ ] Public landing rates are educational.
- [ ] Webapp quote desk rates are operational but source-labeled.

Assistant:

- [ ] Cannot mutate CRM directly.
- [ ] Cannot mutate database directly.
- [ ] Cannot send outreach directly without approval/service path.
- [ ] Cannot fabricate quote terms.
- [ ] Can draft, summarize, explain, and recommend.

Infrastructure:

- [ ] No public worker inference endpoints.
- [ ] No public raw MCP internals.
- [ ] No public databases.
- [ ] No public Redis/FalkorDB/Qdrant.
- [ ] No public Portainer.
- [ ] Tool links are access-gated.

## Implementation Tracking Checklist

Phase 1 inventory:

- [ ] Complete this checklist.
- [ ] Confirm app source locations.
- [ ] Confirm screenshot/source material availability.
- [ ] Confirm selected canonical destinations.

Phase 2 landing:

- [ ] Add Market Pulse ticker.
- [ ] Add lower Market Pulse section.
- [ ] Tighten landing assets/copy.
- [ ] Validate landing build.

Phase 3 webapp shell/overview:

- [ ] Add integration route link.
- [ ] Add command center overview.
- [ ] Add service health/status models.
- [ ] Validate webapp build.

Phase 4 campaigns/leads/quotes:

- [ ] Upgrade campaigns.
- [ ] Upgrade builder.
- [ ] Upgrade leads.
- [ ] Add lead cockpit.
- [ ] Upgrade quotes.
- [ ] Add quote detail.

Phase 5 CRM/pipeline/tools:

- [ ] Upgrade pipeline.
- [ ] Upgrade applications.
- [ ] Upgrade CRM.
- [ ] Add CRM settings.
- [ ] Add integrations hub.
- [ ] Add Nexus tool route.
- [ ] Add n8n/Activepieces/OpenMemory/Paperclip wrappers.

Phase 6 service wiring:

- [ ] Wire read adapters.
- [ ] Wire health endpoints.
- [ ] Add idempotent write paths.
- [ ] Add degraded states.
- [ ] Add owner manual actions.

Phase 7 verification:

- [ ] Landing build/typecheck/lint.
- [ ] Webapp build/typecheck/lint.
- [ ] Route smoke checks.
- [ ] Public/internal route separation check.
- [ ] Secret scan.
- [ ] Workflow token scan.
- [ ] Docs conflict-marker scan.
