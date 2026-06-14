# ProjectNyra.com Webapp Design Brief

## Purpose

The Project Nyra webapp is the subscriber and operator command center. It is not
a marketing page. It should help brokers and operations staff repeatedly manage
leads, campaigns, quotes, compliance, CRM state, assistant actions, and service
health with speed and confidence.

## Audience

- Mortgage brokers using Nyra daily.
- Loan operations staff triaging leads, documents, quotes, and campaigns.
- Admins monitoring integrations, compliance gates, and runtime health.

## Product Boundary

- Twenty CRM is the system of record.
- Nyra services own business logic.
- n8n and Activepieces are execution glue only.
- Assistant surfaces propose or route safe actions; they do not directly mutate
  CRM or databases.
- Quote values come from deterministic quote services, not assistant language.

## Experience Goals

- Dense but readable operational control plane.
- Fast scanning of lead urgency, compliance state, campaign progress, quote
  status, and CRM sync.
- Clear difference between live, cached, mock, degraded, and blocked states.
- Every risky action shows approval, compliance, audit, and rollback context.
- Navigation supports daily repetition without marketing-style page sections.

## Visual Direction

- Theme: dark operational console using Project Nyra indigo, seafoam, and neon
  pink.
- Mood: precise, fast, professional, high-density.
- Palette:
  - Background: dark graphite/black.
  - Primary: indigo/purple for primary action and brand.
  - Secondary: seafoam/turquoise for healthy/live states.
  - Alert: neon pink for STOP, DNC, blocked, expired, or compliance risk.
  - Warning: amber for expiring locks or degraded sync.
  - Surfaces: semantic shadcn tokens, no random inline colors.
- Typography:
  - Compact operational headings.
  - Monospace only for IDs, traces, timestamps, route labels, and system state.
  - No oversized hero typography inside dashboards.

## Global Layout

1. Sticky header with NYRA Operations identity.
2. Primary nav: Home, Admin, Assistant, Campaigns, Builder, Leads, Quotes,
   Pipeline, CRM, Applications, Settings, OpenClaw.
3. Secondary/external links: Nexus and Twenty behind Access.
4. Theme switcher present but dense workflow pages default to restrained dark
   tokens.
5. Main content max-width tuned for dashboard readability.

## Route-Level Design

### Home / Command Deck

- Command stats, priority queue, lead radar, service state, compliance blockers.
- Primary use: start the day and choose the next highest-risk action.

### Leads

- Lead queue with status, source, urgency, consent, campaign, and CRM sync.
- Lead detail shows timeline, conversation, compliance state, campaign state,
  quote context, and audit trail.

### Campaigns

- Campaign operations dashboard with enrollment health, reply pauses, STOP/DNC
  blocks, and performance.
- Builder supports sequence design but publish/send actions remain gated.

### Quotes

- Quote desk with deterministic options, assumptions, lock expiration, provider
  comparison, and approval state.
- No quote value should appear without source/assumption labeling.

### Pipeline

- Mortgage pipeline board for stages, bottlenecks, document needs, and next
  broker action.

### Applications

- Borrower/application progress, document state, milestone state, and blockers.

### CRM

- Twenty-backed CRM overview and sync health.
- Make data source and staleness visible.

### Assistant / OpenClaw

- Assistant tooling panel with safe proposed actions.
- Every mutation-capable proposal must show service boundary, approval status,
  and audit context.

### Admin / Integrations / Settings

- Provider health, required secrets, failed runs, Access status, and owner-only
  actions.
- Never display raw secrets.

## Component Rules

- Use shadcn tokens and local UI primitives.
- Use icons for compact commands and status.
- Use badges for state labels.
- Use tabs for dense alternate views.
- Use skeletons for loading states.
- Avoid cards inside cards.
- Keep repeated list items stable in height.
- Avoid marketing hero sections after login.
- Keep disabled actions visibly disabled with reason text.

## State Labels

Use consistent labels:

- `Live` - current service data.
- `Cached` - recent retained data.
- `Mock` - non-production placeholder data.
- `Degraded` - service exists but is partially unavailable.
- `Blocked` - compliance, auth, Access, secret, or provider gate prevents
  action.

## Accessibility And Safety

- Keyboard navigation must work for route navigation and command buttons.
- Alerts must not rely only on color.
- Tables/cards must fit mobile without text overlap.
- Never expose raw secrets, bearer tokens, JWTs, borrower PII in diagnostics, or
  raw provider payloads.
- Mutations must have audit trail and rollback notes.

## Success Criteria

- Daily broker workflow can be completed without leaving the webapp except for
  protected external CRM/tool links.
- Compliance blockers are impossible to miss.
- Quote, campaign, assistant, and CRM boundaries are visible.
- Lint, tests, build, dry-run smoke, and release check pass.
