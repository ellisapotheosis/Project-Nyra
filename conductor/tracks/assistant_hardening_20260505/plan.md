# Implementation Plan: Assistant Hardening and Landing Lead Capture

## Phase 1: Assistant Safety

- [ ] Task: Implement token verification in `/api/internal/openclaw/chat`
- [ ] Task: Create `ProposedActionCard` UI component
- [ ] Task: Implement audit logging for assistant tool requests in `openclaw` service

## Phase 2: Landing Page Integration

- [x] Task: Standardize lead capture payload structure
- [x] Task: Connect landing page form to `crmApi.ingestLead`
- [x] Task: Implement thank-you page with appointment booking handoff

## Phase 3: Compliance and Attribution

- [x] Task: Add mandatory consent checkboxes to landing forms
- [x] Task: Ensure lead source and UTM parameters are captured and stored in Twenty CRM
- [x] Task: Conductor - User Manual Verification 'Phase 3: Compliance and Attribution' (Protocol in workflow.md)
