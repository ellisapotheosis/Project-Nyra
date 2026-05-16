# Approved Idea Integrations

Date: 2026-05-12

## Authority

The idea queue in `apps/guidance/master-guidance/idea-queue.md` is approved for integration. Future agents may implement these ideas when their work stays inside the listed destinations, risks, and dependencies.

## UI Integrations

### Broker Morning Brief Command Card

- First-pass destination: `apps/nyra-webapp/app/page.tsx`.
- Contract: show a single broker summary card for hot replies, quote locks, compliance blocks, and CRM sync health.
- Required label: any placeholder value must clearly state mock/future-live status until service adapters are wired.

### Compliance Heat Strip

- First-pass destination: overview, assistant, leads, campaigns, and quotes routes.
- Contract: make TCPA, DNC, quiet hours, consent, and audit posture visible before outreach or quote actions.
- Constraint: do not repeat full legal copy in every card. Use compact state signals and route-specific context.

### Quote Confidence Ribbon

- First-pass destination: `/quotes` and `/quotes/[id]`.
- Contract: label the quote source as mock/fallback, provider, or live before broker approval.
- Constraint: never present quoted terms as a guarantee, rate lock, approval, or credit decision.

### Nexus Safe Mode Console

- First-pass destination: `/tools/nexus`.
- Contract: preserve the console feel while exposing only safe routing, MCP, and memory health summaries.
- Constraint: raw endpoints, secrets, traces, and full admin controls stay outside the broker webapp.

### Integration Failure Inbox

- First-pass destination: `/admin/integrations`.
- Contract: group Twilio, SendGrid, Activepieces, n8n, Twenty, OpenClaw, Nexus, and Cloudflare failures into one triage lane.
- Constraint: label mocked or inferred health clearly until real service contracts are connected.

## Docs / Process Integrations

### Landing Hero Signal Layer

- Destination: `apps/ratehunter-landing`.
- Contract: combine Apotheosis public brand, borrower trust signals, Market Pulse context, and fast quote intake.
- Constraint: keep motion restrained and reduced-motion safe. Keep public-only boundaries intact.

### RateHunter Asset Picker

- Destination: docs first, then landing/webapp assets.
- Canonical asset decision fields:
  - nav logo
  - hero mark
  - footer mark
  - mobile favicon/app icon
  - CRM/admin mark
  - email header mark
- Constraint: avoid random copy sprawl. Do not import `Zone.Identifier` files.

### Owner Action Dashboard

- Destination: `docs/OWNER_MANUAL_ACTIONS.md` first, then `/admin/integrations`.
- Contract: credential, MFA, provider verification, Cloudflare, Vercel, GitHub, Infisical, and Twenty setup must be trackable without secrets.

### Branch Import Quarantine

- Destination: `apps/guidance/master-guidance/reports/**`.
- Procedure:
  1. Inventory candidate branch files before merge.
  2. Classify files as import, inspect, reject, or quarantine.
  3. Block deprecated Claude-Flow imports and destructive archive deletions.
  4. Import only reviewed slices with validation evidence.

### Agent Run Ledger

- Destination: `apps/guidance/master-guidance/reports/**`.
- Minimum fields:
  - date
  - scope
  - changed files
  - validation run
  - blockers
  - next prompt or handoff
