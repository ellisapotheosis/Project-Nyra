# Project Nyra UI Design Decision Artifact

Status: implementation-ready decision artifact, no visual implementation performed.

Source prompts:

- `workflows/prompt-package/06_ui_design_quarantine/UI_DESIGN_MASTER_PROMPT_QUARANTINED.md`
- `workflows/prompt-package/06_ui_design_quarantine/claude_desktop_ui_decision_prompt.md`
- `workflows/prompt-package/10_agent_handoff_notes.md`
- `workflows/prompt-package/07_conflicts_and_missing_info.md`

Supporting guidance:

- `apps/guidance/DESIGN_SYSTEM_PLAN.md`
- `apps/guidance/master-guidance/10-design-system-assets-and-branding.md`
- `apps/guidance/master-guidance/15-theme-system-and-ui-acceptance.md`
- `docs/visual/UI_STYLE_GUIDE.md`
- `docs/visual/INSPIRATION_BOARD.md`

## Decision Summary

Resolve the quarantined visual direction into a split system:

- Public RateHunter landing: premium dark mortgage trust, polished and borrower-safe.
- Internal Nyra cockpit: dense broker command center, dramatic enough to feel alive, but readable and compliance-first.
- Tool consoles: contained neon/status-heavy surfaces for technical operators only.

Do not implement visual UI from this artifact directly unless the receiving agent is explicitly assigned an implementation prompt. This artifact resolves direction, constraints, rejects, and route-level handoff requirements.

## Framework And Implementation Context

Detected framework from current repo package files:

- Monorepo package manager: `pnpm`.
- App framework: Next.js App Router.
- UI stack: React, Tailwind, Radix/shadcn-style primitives, `@nyra/ui`, Lucide, Framer Motion, Magic UI-compatible motion patterns, and R3F/Three in the cockpit dependency surface.
- Public landing package: `apps/landing` as `ratehunter-landing`.
- Internal command app package: `apps/cockpit` as `nyra-cockpit`.

Path drift note: several older guidance files still name `apps/nyra-webapp` and `apps/ratehunter-landing`. Treat those as historical names unless the live repo proves otherwise. Current implementation handoff should target `apps/cockpit` for the broker cockpit and `apps/landing` for the public landing, while preserving guidance references.

## Design Direction Options

### Option 1: Premium Mortgage Night Desk

Purpose: maximize borrower trust and broker credibility.

Tone: deep black financial workstation, premium personal broker brand, low-glare glass, restrained color.

Strengths:

- Best for public conversion and compliance stakeholders.
- Keeps mortgage workflows serious.
- Easy to keep accessible.

Weaknesses:

- Less memorable internally if used everywhere.
- Underuses the Nyra command-center identity.

Best use: public landing, borrower quote/status surfaces, compliance-heavy pages.

### Option 2: Frosted Obsidian Command Center

Purpose: make the authenticated broker cockpit feel like a fast operating system for leads, quotes, campaigns, and AI routing.

Tone: dark dense command deck, indigo control states, seafoam live/healthy states, neon pink risk and interruption states.

Strengths:

- Fits broker daily operations.
- Supports high information density.
- Allows Magic UI motion without making the app unserious.

Weaknesses:

- Requires strict token discipline to avoid color sprawl.
- Can become visually noisy if every panel glows.

Best use: internal cockpit default.

### Option 3: Neon Tool Console

Purpose: expose technical AI fleet, Nexus, OpenClaw, n8n, Activepieces, memory, and observability state without pretending these are borrower workflows.

Tone: terminal maximalism, status lights, monospace diagnostics, sharp contrast, contained neon.

Strengths:

- Matches operator/dev tool expectations.
- Distinguishes raw infrastructure from broker workflows.
- Useful for degraded states and live status checks.

Weaknesses:

- Too technical for public or daily broker pages.
- Mortgage users may read it as experimental if overused.

Best use: `/tools/*`, agent console, memory/tools pages, diagnostics panels.

## Recommended Final Direction

Adopt a three-lane visual system with one shared token contract:

1. Public landing default: Premium Mortgage Night Desk with Apotheosis influence.
2. Internal cockpit default: Frosted Obsidian Command Center using Mint Midnight influence.
3. Tool consoles: Neon Tool Console as a contained route family, never the global app look.

This resolves the main quarantine conflict: the product can be futuristic without making borrower-facing mortgage surfaces look unserious.

## Public Landing Visual Spec

Surface: `ratehunter.net`, implemented from `apps/landing`.

Visual stance:

- Dark-only, premium, borrower-safe.
- Product signal in first viewport: RateHunter / mortgage offer / broker identity must be visible immediately.
- Borrower trust beats cyberpunk spectacle.

Composition:

- Full-viewport dark glass hero with a real brand/person/contact signal, not a generic gradient.
- First viewport must reveal a hint of the next section on desktop and mobile.
- Lead capture and market/rate pulse can be prominent but must include visible estimate/disclaimer language.
- Use QR/contact card and West Capital Lending context where appropriate.

Palette:

- Base: deep black / obsidian.
- Primary: indigo.
- Active/trust accent: seafoam.
- Special CTA/risk accent: neon pink, used sparingly.
- Error/blocked states: red only for true destructive or compliance-blocked conditions.

Typography:

- Recommended UI/body font: Satoshi or Manrope, depending on available project font loading.
- Recommended data/display accent: Monaspace Krypton or a close local monospace for ticker/rate/data surfaces.
- Do not use hero-scale typography inside compact cards.

Motion:

- Gentle reveal, ticker, and background texture only.
- Ticker must pause on hover/focus or provide a static fallback.
- Reduced motion must disable ticker motion, beams, canvas effects, and scrambled text.

Borrower compliance:

- Rate and market content must state estimates are informational and not binding commitments.
- Form labels, validation messages, privacy posture, and opt-out language must be visible.
- No raw AI, worker, memory, or tool-route language on public borrower surfaces.

## Internal Webapp Visual Spec

Surface: `app.projectnyra.com`, implemented from `apps/cockpit`.

Visual stance:

- Dense broker cockpit, desktop-first, dark-only.
- Professional operational shell rather than landing-page marketing.
- Compliance state is always near send, campaign, quote, and assistant actions.

Composition:

- Compact sidebar or rail, top status strip, main data workspace, optional inspector/action rail.
- Page sections are unframed layouts or full-width bands; cards are for repeated items, metrics, modals, and framed tools.
- No nested cards.
- Tables and list rows prioritize scan speed, status, owner, next action, and source system.

Palette:

- Base: `--background`, `--card`, `--muted`, `--border` from TweakCN/shadcn tokens.
- Primary action/selected: indigo.
- Healthy/live/AI-active: seafoam.
- Risk, interruption, STOP, failed send, failed webhook: neon pink or destructive red depending on severity.
- Warning/quiet-hours/pending approval: amber semantic token.

Typography:

- UI/body: Satoshi or Manrope.
- Terminal/log/data surfaces: Monaspace Krypton.
- Page titles: 28-32px desktop.
- Section titles: 16-20px.
- Table/list text: 13-14px.
- Metadata: 11-12px, uppercase only when it improves scanning.

Motion:

- Motion must clarify state changes.
- Use pulse/glow only for live health, lead arrival, active campaign step, and risk escalation.
- No constant full-page data rain on dense workflow pages.
- Reduced motion must tame or disable marquee, beam, glow, meteor, vortex, canvas, and scrambled-text effects.

## Design-System Decisions

### shadcn/ui

Use shadcn/Radix-style primitives as the component foundation:

- App shell: sidebar, scroll area, tabs, command palette, dialog, drawer/sheet, tooltip, popover.
- Data pages: table, badge, select, tabs, dropdown menu, separator, skeleton, toast.
- Forms: input, textarea, label, select, switch, radio group, checkbox, form messages.
- Workflow: drawer/sheet for campaign step editing, dialog for high-risk confirmation, toast for background results.

Customize:

- Badge/status grammar.
- Card/panel surfaces.
- Command palette.
- Data table rows.
- Timeline and campaign builder nodes.
- Tool wrapper cards.

Leave standard:

- Basic labels, inputs, selects, switches, scroll areas, tabs, tooltips, and dialogs unless usability requires a local variant.

### TweakCN

TweakCN owns the token contract. Do not hardcode page-level color palettes.

Required semantic token families:

- Base: `--background`, `--foreground`, `--card`, `--card-foreground`, `--popover`, `--border`, `--input`, `--ring`.
- Action: `--primary`, `--primary-foreground`, `--secondary`, `--accent`, `--muted`, `--muted-foreground`.
- Risk: `--destructive`, `--warning`, `--success`, `--risk`.
- Domain: `--status-live`, `--status-degraded`, `--status-paused`, `--status-blocked`, `--timeline-email`, `--timeline-sms`, `--timeline-call`, `--timeline-quote`, `--timeline-compliance`, `--timeline-assistant`.

Allowed named themes:

- Public landing default: `apotheosis`.
- Internal cockpit default: `mint-midnight`.
- Conservative fallback: `midnight`.
- Demo/sizzle only: `mint-midnight-glow`.

### Magic UI And Motion Libraries

Use Magic UI for high-impact but bounded effects:

- Landing: subtle background beams, ticker/marquee, gentle reveal, testimonials/cards if needed.
- Cockpit: status glow, animated border for active AI/action states, timeline trace, health pulse.
- Tool consoles: terminal-like status glow, card spotlight, tracing beam, animated route/status changes.

Do not use Magic UI to replace core workflow clarity.

### Icons

Use Lucide icons for standard commands and status labels:

- Send, pause, stop, refresh, save, filter, search, upload, call, mail, message, shield, warning, check, activity, database, server, route, bot.

Text-only buttons should be reserved for clear domain actions where the label matters.

## Component Decisions

Core components to define before broad route implementation:

- `AppShell`: compact authenticated layout.
- `PageHeader`: title, summary, actions, status context.
- `WorkspaceGrid`: responsive dense grids.
- `InspectorRail`: lead/campaign/quote context.
- `MetricStrip`: compact KPIs.
- `StatusBadge`: normalized state badge.
- `ComplianceBadge`: consent, DNC, STOP, quiet-hours, approval, send gate.
- `SourceBadge`: Twenty, quote service, campaign service, provider, manual, assistant.
- `TimelineShell`: communication/audit timeline.
- `ActionDock`: assistant/actions composer with approval state.
- `ToolStatusCard`: link/status/degraded config card for tools.
- `CampaignRail`: metro-line campaign timeline.
- `QuoteScenarioCard`: deterministic 3-option quote display with source and expiration.

## Embed, Link, Native Decisions

Native broker pages:

- Dashboard/overview.
- Leads and lead detail.
- Campaigns and campaign builder.
- Quote desk and quote detail.
- Pipeline/Kanban.
- Unified inbox/communications timeline.
- Compliance controls and approval queues.
- Provider/integration health overview.

Tool wrapper/status pages:

- OpenClaw.
- Nexus.
- n8n.
- Activepieces.
- OpenMemory / memory tools.
- Paperclip/documents if deployed.
- Grafana.
- Gitea.
- Portainer if exposed at all.

Deep link only until explicitly scoped:

- Raw n8n editor.
- Raw Activepieces editor.
- Grafana dashboards.
- Gitea repository operations.
- Portainer infrastructure admin.
- Raw OpenMemory editing.

Do not expose:

- Worker vLLM/Ollama endpoints.
- Raw MCP internals.
- Databases, Redis, Qdrant, FalkorDB.
- Secrets, provider keys, model routes, or private internal endpoint details in browser-visible code.

## Route-Level Visual Specs

### Landing

Goal: convert borrower leads while preserving mortgage trust.

Required visual elements:

- RateHunter brand signal in first viewport.
- Broker/company/legal context.
- Lead capture path.
- Market/rate pulse with visible disclaimer.
- Contact/QR/profile card.
- Trust proof, review links, and West Capital Lending resources where approved.

Avoid:

- Raw command deck visuals.
- Neon terminal panels.
- Unqualified rate promises.

### Overview

Goal: broker morning command center.

Layout:

- Top health strip: leads, campaigns, quote queue, compliance blocks, service health.
- Priority queue: next best actions and stuck items.
- Activity timeline: recent inbound replies, quote views, campaign pauses.
- Assistant/action rail: suggestions rendered as approval cards, not direct mutations.

Critical states:

- Mock mode.
- Degraded provider.
- STOP/DNC blocked sends.
- Missing CRM sync.

### Leads

Goal: high-speed lead triage.

Layout:

- Dense table/list with saved views, filters, source, score, status, next action, owner, compliance state.
- Mobile collapses to cards with the same status hierarchy.
- Row click opens detail; row actions remain explicit.

Visual emphasis:

- Source and compliance badges.
- Freshness and response urgency.
- No decorative card grid as default.

### Lead Detail

Goal: one-record operating view.

Layout:

- Record header with identity, source, consent, owner, status, and primary action.
- Left/main timeline for communications, campaign, quote, assistant, and audit events.
- Right inspector for loan facts, docs, quote eligibility, campaign enrollment, compliance gates.
- Action dock for contact, quote, pause, assign, and assistant proposal review.

Compliance:

- Send controls disabled or risk-marked when STOP, DNC, quiet hours, missing consent, or approval-required.

### Campaigns

Goal: manage campaigns without exposing raw n8n complexity.

Layout:

- Campaign list with state, active enrollments, pause/error counts, channel mix, last run, next step.
- Builder view uses metro-line timeline with nodes for delay, SMS, email, call, voicemail, condition, approval, stop.
- Clicking a node opens a drawer with copy, timing, channel, eligibility, and compliance gates.

Raw n8n:

- Admin/tool deep link only, not daily broker workflow.

### Quote Desk

Goal: deterministic quote workbench, never hallucinated numbers.

Layout:

- Intake/borrower facts panel.
- Three quote scenario cards.
- Comparison table.
- Expiration/source banner.
- Send/export/approval actions.
- Viewed/sent timeline.

Compliance:

- Show quote-service source, generated timestamp, expiration, and estimate/non-binding language.
- Assistant can explain but cannot invent quote terms.

### Pipeline

Goal: operational pipeline scanning.

Layout:

- Dark Kanban adapted from mortgage CRM structure.
- Columns map to domain stages.
- Cards show borrower, loan status, next action, quote/campaign state, risk/compliance state.
- Drag/drop only if backend mutation/approval contract exists; otherwise read-only reordering is not allowed.

### Integrations

Goal: broker-safe service health and owner action queue.

Layout:

- Tool cards with connected/degraded/missing-config/unauthorized/offline/link-only states.
- Health strip by provider: Twenty, Twilio, SendGrid, Gmail/Outlook, Cloudflare, n8n, Activepieces, OpenClaw, Nexus.
- Manual action checklist with docs links.

Security:

- Do not render secrets.
- Do not expose raw internal URLs unless access-gated and intended for the current role.

### Agent Console

Goal: expose OpenClaw/Nexus assistant routing safely.

Layout:

- Chat/test panel.
- Allowed tool list.
- Current model route and gateway health.
- Recent upstream errors.
- CRM-safe action policy.
- Approval cards for proposed mutations.

Visual lane:

- Neon Tool Console is allowed here, but it must stay contained to this route family.

### Memory And Tools

Goal: show memory/tool status without turning memory editing into a broker workflow.

Layout:

- Provider health: Mem0, OpenMemory, FalkorDB/Qdrant where configured, Letta if present.
- Recent memory/tool errors.
- Nexus route status.
- Links to protected tool UIs.

Default:

- Read/status first. Native editing only after explicit scope and safety design.

## Motion Rules

Allowed:

- Lead arrival pulse.
- Active campaign step glow.
- Service live/degraded pulse.
- Timeline trace for newly appended events.
- Drawer/dialog transitions.
- Landing ticker with pause/fallback.
- Subtle landing background texture.

Rejected:

- Constant data rain on broker workflow pages.
- Full-page neon scanlines in public/borrower surfaces.
- Motion that hides or delays compliance state.
- Hover effects that shift layout.
- Effects that do not respect reduced motion.

## Accessibility Rules

- Dark mode only, but contrast must pass WCAG AA for body text, inputs, tables, buttons, and status labels.
- Color cannot be the only indicator of status.
- All icon-only buttons need accessible labels and tooltips for unfamiliar actions.
- Focus states must be visible on all controls.
- Ticker/marquee content must pause on hover/focus or provide static fallback.
- Text must fit in cards, buttons, headers, and table cells at mobile and desktop widths.
- Mobile may simplify density but must preserve compliance and primary action visibility.
- QR/contact content must also be available as text.

## Conflicts Resolved

- Raw n8n embed vs custom campaign builder: choose custom native campaign builder for daily broker work; raw n8n is a protected admin/tool deep link.
- Tool iframe vs native wrapper: choose native wrappers/status cards for broker workflows; temporary embeds only for protected tool pages when access-gated and clearly labeled.
- Cyberpunk vs mortgage professionalism: choose professional public landing and dense broker cockpit; keep cyberpunk/neon visual language contained to tool consoles.
- Landing baseline: use current dark premium landing direction as baseline; mine legacy sources only for missing concepts, assets, ticker, and contact/profile ideas.
- Internal density: choose high-density cockpit with tokenized surfaces and readable tables; no marketing hero layouts inside the broker app.
- Borrower vs broker split: borrower surfaces are trustworthy and restrained; broker surfaces can be more operational and dramatic; operator tools can be technical.

## Rejected Ideas

- No light mode for first-pass Project Nyra UI.
- No global cyberpunk skin across public landing and broker cockpit.
- No raw n8n as the primary campaign UX.
- No assistant-direct CRM/database mutation.
- No hardcoded provider/API secrets or internal endpoints in browser-visible code.
- No one-off inline color sprawl.
- No nested card layouts.
- No generic marketing hero inside the cockpit.
- No quote values without source, timestamp, expiration, and non-binding/estimate posture.
- No public exposure of worker inference, raw MCP internals, databases, Redis, Qdrant, FalkorDB, Portainer, or model routes.

## Unresolved Blockers

- Final token source files for all four named TweakCN themes have not been verified in this pass.
- Exact selected public brand assets must be chosen before implementation copies assets into app public directories.
- Mortgage compliance copy for rate/quote/market disclaimers needs owner/legal review before public launch.
- Live screenshots should be refreshed before implementation starts if route visuals have drifted.
- Tool availability, health endpoints, and access-gated URLs must be verified before building status pages that claim live state.
- Font loading method needs implementation decision: local checked-in files vs provider-backed `next/font` sources.

## UI-To-Implementation Handoff Skeleton

Use this for the next implementation prompt:

```text
You are implementing finalized UI/design decisions for Project Nyra.

Read first:
- docs/visual/UI_DESIGN_DECISION_ARTIFACT.md
- apps/guidance/DESIGN_SYSTEM_PLAN.md
- apps/guidance/master-guidance/10-design-system-assets-and-branding.md
- apps/guidance/master-guidance/15-theme-system-and-ui-acceptance.md
- docs/visual/UI_STYLE_GUIDE.md

Scope:
- Implement visual UI only in the assigned route group.
- Preserve Next.js App Router, Tailwind, shadcn/Radix, @nyra/ui, TweakCN tokens, Lucide icons, and Magic UI-compatible effects.
- Keep public landing and internal cockpit visual lanes separate.
- Keep dark mode only.

Hard constraints:
- Do not move business logic, quote math, compliance decisions, provider dispatch, or assistant mutation policy into React components.
- Do not expose secrets, provider keys, worker endpoints, raw MCP internals, databases, Redis, Qdrant, FalkorDB, Portainer, or model routes to browser-side code.
- Quotes must come from quote-service contracts only.
- Outbound communication actions must show compliance and approval state.
- Use semantic tokens, not hardcoded color sprawl.
- Respect reduced motion.
- Do not implement raw n8n as daily campaign UX.

Implementation order:
1. Verify live target paths and package scripts.
2. Inspect existing components and token files.
3. Implement shared layout/status primitives only as needed by the assigned route group.
4. Implement the assigned route group.
5. Add empty/loading/error/degraded/mock states.
6. Run targeted typecheck/lint/build or the closest available validation.
7. Capture screenshots for desktop and mobile if route UI changed.

Report:
- Files changed.
- Visual decisions applied.
- Accessibility and motion checks.
- Commands run.
- Tests/builds run.
- Known blockers.
```
