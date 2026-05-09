# Implementation Plan: Assistant Hardening and Landing Lead Capture

## Phase 1: Assistant Safety

- [ ] Task: Implement token verification in `/api/internal/openclaw/chat`
- [ ] Task: Create `ProposedActionCard` UI component
- [ ] Task: Implement audit logging for assistant tool requests in `openclaw` service

## Phase 2: Landing Page Integration

- [ ] Task: Standardize lead capture payload structure
- [ ] Task: Connect landing page form to `crmApi.ingestLead`
- [ ] Task: Implement thank-you page with appointment booking handoff

## Phase 3: Compliance and Attribution

- [ ] Task: Add mandatory consent checkboxes to landing forms
- [ ] Task: Ensure lead source and UTM parameters are captured and stored in Twenty CRM
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Compliance and Attribution' (Protocol in workflow.md)
