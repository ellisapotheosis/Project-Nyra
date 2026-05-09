# Implementation Plan: Campaign Builder MVP

## Phase 1: Editor Interface

- [x] Task: Upgrade `/campaigns/builder/[id]` with card-based step editing
- [x] Task: Implement drag-and-drop or manual reordering of steps
- [x] Task: Add validation for timing (steps must be chronological)

## Phase 2: Channel Specifics

- [x] Task: Create specific UI for SMS, Email, and Voicemail steps
- [x] Task: Implement template selection for each touchpoint
- [x] Task: Add preview functionality for messages

## Phase 3: Integration and Persistence

- [ ] Task: Connect Save button to `campaignApi.createCampaign` and `updateCampaign`
- [ ] Task: Implement Delete template functionality
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Integration and Persistence' (Protocol in workflow.md)
