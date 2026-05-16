# Idea Queue

## Purpose

This queue stores creative ideas for future approval. Ideas here are not implementation authority unless their approval state is `approved` or the user explicitly approves the current run’s creative scope.

## Approval States

- `proposed`: captured for later review.
- `approved`: allowed in a future scoped run.
- `implemented`: shipped or documented as complete.
- `rejected`: intentionally not pursuing.

## Approved / Integrated Ideas

The user explicitly approved this queue on 2026-05-12 with: "yes please integrate all of this, there was nobody saying 'no'." Treat the entries below as approved creative scope. Items marked `implemented` have a first-pass UI or documentation integration; later runs may deepen the implementation without re-approval if they remain within the listed risk/dependency boundaries.

### Landing Hero Signal Layer

- Destination: `apps/ratehunter-landing`.
- Why it helps: Combines the Apotheosis public brand with borrower trust signals, Market Pulse context, and a faster path into quote intake.
- Risk: Too much motion could distract from lead capture.
- Dependencies: Theme token extraction, reduced-motion audit.
- Suggested stage: Run 03.
- Approval state: implemented.
- Integration note: Added to Run 03 landing prompt scope and the approved idea integration ledger as a public-only hero signal requirement.

### Broker Morning Brief Command Card

- Destination: `apps/nyra-webapp` overview.
- Why it helps: Gives the broker a single “what matters today” card with lead urgency, quote locks, replies, compliance blocks, and CRM sync health.
- Risk: Requires clear mock/live state labeling until backend services are wired.
- Dependencies: Webapp mock data and future service adapters.
- Suggested stage: Run 04.
- Approval state: implemented.
- Integration note: Added `BrokerMorningBrief` to `apps/nyra-webapp` overview with explicit mock/live labeling.

### Compliance Heat Strip

- Destination: Webapp overview, campaigns, leads, assistant, and quote routes.
- Why it helps: Makes TCPA/CAN-SPAM/STOP/DNC/quiet-hours/consent visible before actions, reinforcing “compliance is code.”
- Risk: Can become visual noise if every card repeats the same warning.
- Dependencies: Safety gate contracts.
- Suggested stage: Runs 04, 05, 06, 09.
- Approval state: implemented.
- Integration note: Added reusable `ComplianceHeatStrip` and placed it on overview, assistant, leads, campaigns, and quote routes.

### Quote Confidence Ribbon

- Destination: `/quotes` and `/quotes/[quoteId]`.
- Why it helps: Clearly separates mock/fallback/provider/live pricing and prevents accidental overclaiming.
- Risk: Needs disciplined copy so it does not look like a rate guarantee.
- Dependencies: Quote service boundary and source labels.
- Suggested stage: Run 07.
- Approval state: implemented.
- Integration note: Added reusable `QuoteConfidenceRibbon` to quote list and quote detail routes.

### Nexus Safe Mode Console

- Destination: `/tools/nexus`.
- Why it helps: Preserves the neon console mood while making raw endpoints private and exposing only safe health/routing summaries.
- Risk: Operators may expect full Nexus admin functionality inside the webapp; copy must state wrapper versus actual admin tool.
- Dependencies: Nexus health endpoint or mock.
- Suggested stage: Run 08.
- Approval state: implemented.
- Integration note: Replaced the generic Nexus tool link with a safe-mode console wrapper for broker-safe summaries and gated admin handoff.

### Integration Failure Inbox

- Destination: `/admin/integrations`.
- Why it helps: Groups failed Twilio, SendGrid, Activepieces, n8n, Twenty, OpenClaw, Nexus, and Cloudflare events into one broker/operator triage lane.
- Risk: Needs service contracts to avoid fabricated state.
- Dependencies: Integration mocks then real health adapters.
- Suggested stage: Runs 08, 11.
- Approval state: implemented.
- Integration note: Added `IntegrationFailureInbox` to `/admin/integrations` with mock/live contract labeling.

### Agent Run Ledger

- Destination: `apps/guidance/master-guidance/reports/**`.
- Why it helps: Each Codex run appends a small factual ledger entry with changed files, validations, blockers, and next prompt.
- Risk: Can become stale if agents skip updates.
- Dependencies: Runbook discipline.
- Suggested stage: Every run.
- Approval state: implemented.
- Integration note: Added a factual run ledger under `apps/guidance/master-guidance/reports/`.

### RateHunter Asset Picker

- Destination: docs first, then landing/webapp assets.
- Why it helps: Prevents random logo/image copy sprawl by selecting canonical nav, hero, footer, mobile, CRM, and email variants.
- Risk: Requires visual review of many assets.
- Dependencies: Asset inventory and screenshot review.
- Suggested stage: Run 03 or visual audit.
- Approval state: implemented.
- Integration note: Added docs-first canonical asset picker guidance in the approved integration ledger and Run 03 prompt.

### Owner Action Dashboard

- Destination: `docs/OWNER_MANUAL_ACTIONS.md` first, then `/admin/integrations`.
- Why it helps: Converts credential, MFA, provider verification, Cloudflare, Vercel, GitHub, Infisical, and Twenty setup into trackable action items.
- Risk: Must not include secrets or private URLs.
- Dependencies: Hygiene and integration runs.
- Suggested stage: Runs 01, 08, 10.
- Approval state: implemented.
- Integration note: Extended `docs/OWNER_MANUAL_ACTIONS.md` and surfaced owner-action triage through `/admin/integrations`.

### Branch Import Quarantine

- Destination: `apps/guidance/master-guidance/reports/**`.
- Why it helps: Allows branch files from Vercel/GitHub/deployment branches to be classified before merging, blocking deprecated Claude-Flow or archive-deletion imports.
- Risk: Adds process overhead before big merges.
- Dependencies: Git branch inventory.
- Suggested stage: Run 00.
- Approval state: implemented.
- Integration note: Added branch import quarantine procedure to the approved integration ledger and run ledger.
