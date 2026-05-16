# @nyra/domain-models Contracts

`@nyra/domain-models` is the canonical TypeScript/Zod contract package for Project Nyra service and app boundaries.

## Ownership Rules

- Twenty CRM owns durable business records.
- Nyra services own behavior, policy, calculations, communication transport, and audit.
- The webapp consumes these schemas as request/response contracts; it must not calculate quotes, bypass compliance, or mutate CRM directly.

## Entity Modules

- `lead.ts`: `LeadSchema`, `LeadStageSchema`
- `contact.ts`: `ContactSchema`, `BorrowerSchema`, `CoBorrowerSchema`
- `loanScenario.ts`: `LoanScenarioSchema`
- `quote.ts`: `QuoteRequestSchema`, `QuoteSchema`, `PricingScenarioSchema`
- `campaign.ts`: `CampaignSchema`, `CampaignStepSchema`, `CampaignEnrollmentSchema`
- `communication.ts`: `CommunicationEventSchema`, `MessageSchema`, `CallSchema`, `VoicemailSchema`
- `workItems.ts`: `DocumentSchema`, `TaskSchema`
- `compliance.ts`: `ComplianceEventSchema`, `ComplianceDecisionSchema`, quiet-hours and STOP helpers
- `agent.ts`: `AgentRunSchema`, `ProposedActionSchema`, risk helpers
- `memory.ts`: `MemoryObjectSchema`
- `integration.ts`: `IntegrationAccountSchema`, `IntegrationHealthSchema`
- `timeline.ts`: `TimelineEventSchema`
- `user.ts`: `UserSchema`, `TeamSchema`, `RoleSchema`

## High-Risk Invariants

- `isStopRequest()` and `isUnsubscribeRequest()` are shared parsing helpers for inbound provider webhooks and compliance preflight.
- `isWithinQuietHours()` gates outbound communication before Twilio, SendGrid, campaign execution, or assistant action execution.
- `applyCampaignEnrollmentEvent()` keeps `STOPPED` and `COMPLETED` terminal for campaign enrollments.
- `QuoteSchema` requires exactly three pricing scenarios: lowest payment, balanced, and lowest cost.
- `requiresHumanApproval()` marks CRM mutation, borrower communication, and compliance-critical assistant actions as approval-gated.

## Compatibility

`src/index.ts` remains the public export surface. Existing legacy names such as `LeadSchema`, `BorrowerSchema`, `MortgageScenarioSchema`, `CampaignEnrollmentSchema`, `CommunicationEventSchema`, `AgentSessionSchema`, `MemoryRecordSchema`, and `AuditEventSchema` remain exported while newer service contracts adopt the more explicit schemas.
