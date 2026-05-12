# Implementation Plan: Lead Cockpit MVP

## Phase 1: Cockpit Layout and Profile

- [x] Task: Create `/leads/[id]` route structure 03b3557
- [x] Task: Implement Lead Profile card with full metadata f5ead7a
- [x] Task: Add source attribution and tag display

## Phase 2: Unified Timeline

- [x] Task: Implement `TimelineActivity` component for different event types (SMS, Email, Call)
- [x] Task: Wire timeline to `crmApi.getLeadConversation`
- [x] Task: Add filter and search within the timeline

## Phase 3: Compliance and Controls

- [x] Task: Add visual compliance badges (Consent, DNC, Quiet Hours)
- [x] Task: Implement campaign enrollment and state toggle buttons
- [x] Task: Conductor - User Manual Verification 'Phase 3: Compliance and Controls' (Protocol in workflow.md) — verified with `pnpm --dir apps/webapp/app typecheck`, `pnpm --dir apps/webapp/app lint`, and Playwright screenshot of `/leads/1`.
