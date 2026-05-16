# Design System Consolidation Plan

Path note: this plan predates the app rename. Read `apps/nyra-webapp` for the internal command-center app and `apps/ratehunter-landing` for the public site.

Current quarantine resolution: `docs/visual/UI_DESIGN_DECISION_ARTIFACT.md` is the implementation-ready design decision artifact for the quarantined UI prompt package. Use it to resolve the older visual-direction conflicts before assigning visual implementation work. Current live app packages should be re-verified before implementation; this pass detected `apps/cockpit` for the broker cockpit and `apps/landing` for the public landing.

## Design Thesis

Project Nyra should look like a professional mortgage operations cockpit: dark, dense, precise, and fast. It should not feel like a generic SaaS template, a marketing landing page inside the admin app, or a pile of disconnected prototypes.

Use TweakCN/shadCN/Magic UI as the system foundation, with RateHunter brand assets and restrained motion.

## Current Sources

- `apps/nyra-webapp/app/globals.css`: current token layer and shadCN CSS variable mapping.
- `apps/nyra-webapp/components.json`: shadCN config.
- `docs/UI_STYLE_GUIDE.md`: dark-mode product direction.
- `apps/guidance/components/03-theme-migration-brief.md`: migration requirements.
- `apps/shared/assets/TweakCN_Theme_Compare/*`: visual reference material.
- `apps/shared/assets/ratehunter_logos` and `apps/shared/assets/Ratehunter_Logo_Final`: brand assets.
- `apps/ratehunter-landing`: stronger public brand execution.

## Core Rules

- Internal app is dark-first.
- Use CSS variables and shadCN tokens, not ad hoc colors.
- Use Lucide icons for standard UI actions.
- Use Magic UI only for subtle state, borders, and alive-feeling feedback.
- Keep density high but readable.
- Use 8px or less card radius by default unless the existing token explicitly defines otherwise.
- No nested cards.
- No marketing hero layouts in the broker cockpit.
- No raw slate/blue light-mode islands inside the internal app.
- No quote values, compliance statuses, or send readiness shown without source/decision clarity.

## Token Strategy

Promote one token source:

```text
packages/ui/src/styles/tokens.css
packages/ui/src/styles/globals.css
apps/nyra-webapp/app/globals.css
apps/ratehunter-landing/src/app/globals.css
```

Internal app should import the shared token layer and define app-specific surface rules.

Recommended semantic tokens:

- `--background`: app base.
- `--foreground`: primary text.
- `--card`: panel surface.
- `--muted`: secondary surface.
- `--primary`: decisive action / selected state.
- `--accent`: active/automation/AI highlight.
- `--destructive`: compliance/risk stop.
- `--warning`: quiet hours, missing docs, pending approval.
- `--success`: consent, sent, funded, healthy.
- `--risk`: DNC, STOP, failed webhook, send blocked.
- `--timeline-*`: event channel colors.

## Layout Primitives

Create reusable primitives in `packages/ui` or `apps/nyra-webapp/components/layout` first:

- `AppShell`: sidebar/header/content layout with role-aware nav.
- `PageHeader`: title, summary, primary action, secondary actions.
- `WorkspaceGrid`: two/three-column responsive page grids.
- `RecordHeader`: identity, status, badges, owner, key actions.
- `InspectorRail`: right-side context panel.
- `TimelineShell`: vertical event feed with filters and empty/loading/error states.
- `ActionDock`: sticky assistant/actions composer.
- `DataToolbar`: filters, search, saved views, exports.
- `MetricStrip`: compact KPI rows.
- `StatusBadge`: normalized status rendering.
- `ComplianceBadge`: consent/DNC/quiet-hours/send-gate status.
- `SourceBadge`: source system and sync status.

## Component Vocabulary

Panels:

- Use panels for grouped controls and record context.
- Avoid decorative cards around page sections.
- Cards are for repeated items, metrics, modals, and framed tools.

Tables/lists:

- Leads and communications need scan-friendly rows.
- Use column density, filters, saved views, status badges, and row actions.
- Mobile can collapse to cards.

Forms:

- Use step sections for quote intake and campaign builder.
- Validate with Zod/domain contracts.
- Show field source when prefilled from CRM.

Chat:

- Broker assistant: docked/right panel or full route, always context-aware.
- Borrower assistant: simpler, restricted, friendly, no raw tool language.
- Proposed actions must render as approval cards with risk level and expected mutation.
- Never hide compliance state when action involves borrower communication.

Timeline:

- Normalize event anatomy: channel icon, actor, timestamp, event type, body, provider status, correlation id, compliance decision.
- Filters: all, SMS, email, call, voicemail, quote, document, campaign, assistant, compliance.

Voice:

- Live voice UI should look like a call center control surface, not a raw audio lab.
- Required states: idle, dialing, ringing, live, muted, recording, transcribing, ended, failed.
- Show consent and recording policy before call controls.
- Keep raw TTS/STT/provider diagnostics under `/tools` until stable.

## Typography

Use a restrained hierarchy:

- Page title: 28-32px desktop, not hero-scale.
- Section title: 16-20px.
- Metric value: 24-32px.
- Table/list text: 13-14px.
- Metadata: 11-12px uppercase only where it aids scan.
- Letter spacing: avoid negative tracking; use subtle uppercase tracking for labels only.

## Route Cleanup Priorities

1. Convert `/campaigns` from light slate classes to token classes.
2. Convert `/leads/[id]` from light slate classes to token classes.
3. Normalize `Card` radius and background usage across `/assistant`, `/quotes`, `/pipeline`, and `/crm`.
4. Replace hard-coded blue/green/red with semantic status components.
5. Move shared UI primitives into `packages/ui` after patterns stabilize in webapp.

## Public Landing

Landing can be more expressive than the internal app but should share:

- Brand assets.
- Button grammar.
- Form controls.
- Chat widget styling family.
- Trust/compliance tone.

Landing should not inherit the dense broker cockpit layout.

## Design QA Checklist

- No light-mode page islands in internal app.
- No raw hard-coded color sprawl.
- Buttons use icons where expected.
- Text fits in cards/buttons at mobile and desktop widths.
- Status colors are semantic and consistent.
- Assistant actions show risk and approval state.
- Compliance status is visible near send/campaign/quote actions.
- Voice controls show call and consent state clearly.
- Empty, loading, error, offline, and mock-mode states exist.
