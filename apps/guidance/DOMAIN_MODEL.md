# Domain + Data Model Summary

## Ownership Principle

Twenty CRM owns durable business records. Nyra services own behavior, policy, calculations, communication transport, and audit. The main app owns user experience and projections, not source-of-truth mutation.

## Core Entities

### Lead

Definition: inbound mortgage opportunity before full application.

Owner: Twenty CRM via `services/crm-api`.

Relationships:

- Has one primary contact/borrower.
- May have co-borrowers.
- May have one or more loan scenarios.
- May be enrolled in campaigns.
- Has timeline events.
- Has compliance state.

Key fields:

- `id`, `crmRecordId`, `source`, `stage`, `ownerId`, `leadScore`, `createdAt`, `updatedAt`.
- `loanPurpose`, `loanAmount`, `propertyValue`, `propertyType`, `occupancy`, `state`.
- `consentSms`, `consentEmail`, `consentVoice`, `doNotContact`.

### Contact / Borrower

Definition: person record tied to lead/application.

Owner: Twenty CRM.

Relationships:

- Can have many leads/applications over time.
- Can have communication events.
- Can have consent and channel preferences.

Borrower and contact may map to the same CRM person, but borrower carries mortgage-specific role semantics.

### Co-Borrower

Definition: secondary applicant/contact on a loan scenario.

Owner: Twenty CRM/custom object.

Relationships:

- Belongs to a loan/application.
- Has separate contact/credit/income/document requirements.

### Loan Scenario

Definition: structured loan request context.

Owner: CRM API / quote API contract; stored in CRM when promoted.

Relationships:

- Belongs to lead/application.
- Produces quotes.
- References pricing scenarios.

Fields:

- `loanPurpose`, `loanType`, `loanAmount`, `propertyValue`, `downPayment`, `ltv`, `creditScore`, `income`, `dti`, `state`, `occupancy`.

### Quote

Definition: official quote artifact or comparison result.

Owner: `services/quote-api`; persisted/logged through CRM API.

Relationships:

- Belongs to lead/application/loan scenario.
- Contains pricing scenarios.
- May produce PDF/doc event.
- May be sent through communication service.

Invariant:

All official quote values come from quote service.

### Pricing Scenario

Definition: one option inside a quote.

Owner: quote API.

Examples:

- Lowest payment.
- Balanced.
- Lowest cost.

Fields:

- `rate`, `apr`, `points`, `monthlyPayment`, `cashToClose`, `closingCosts`, `breakEven`, `assumptions`, `calculationTrace`.

### Campaign

Definition: versioned automation template.

Owner: campaign engine.

Relationships:

- Has campaign steps.
- Has enrollments.
- Produces communication events.

Fields:

- `id`, `name`, `version`, `status`, `loanPurpose`, `audience`, `steps`, `createdBy`, `publishedAt`.

### Campaign Step

Definition: scheduled action in a campaign.

Owner: campaign engine.

Fields:

- `day`, `offset`, `channel`, `templateId`, `body`, `guardrails`, `quietHoursPolicy`, `requiresApproval`, `stopOnReply`.

### Campaign Enrollment

Definition: lead/contact instance of a campaign.

Owner: campaign engine; mirrored in CRM.

States:

- Draft, active, paused, replied, stopped, completed, failed.

Invariant:

STOP/unsubscribe forces terminal stopped state immediately.

### Communication Event

Definition: normalized record of inbound/outbound communication lifecycle.

Owner: communication service; appended to CRM timeline.

Relationships:

- Belongs to lead/contact.
- May belong to campaign step.
- May belong to quote/document/task.

Fields:

- `id`, `leadId`, `channel`, `direction`, `body`, `provider`, `providerMessageId`, `status`, `timestamp`, `correlationId`, `complianceDecision`.

### Message

Definition: SMS/email/chat message body and metadata.

Owner: communication service for borrower communications; assistant service for assistant chat transcripts.

### Call

Definition: voice session lifecycle.

Owner: communication/voice service.

Fields:

- `callId`, `leadId`, `from`, `to`, `direction`, `status`, `recordingUrl`, `transcriptId`, `duration`, `cost`, `consentSnapshot`.

### Voicemail

Definition: voicemail drop or received voicemail.

Owner: communication/voice service.

Fields:

- `scriptId`, `audioAssetId`, `providerId`, `transcript`, `campaignStepId`, `consentDecision`.

### Note

Definition: human or assistant note tied to a record.

Owner: CRM API.

Fields:

- `author`, `body`, `visibility`, `source`, `createdAt`.

### Task

Definition: actionable work item.

Owner: CRM API or task service; mirrored in CRM.

Fields:

- `assigneeId`, `leadId`, `type`, `dueAt`, `priority`, `status`, `sourceEventId`.

### Document

Definition: borrower or loan document.

Owner: document service/storage; metadata mirrored in CRM.

Fields:

- `documentType`, `status`, `storageKey`, `uploadedBy`, `requestedBy`, `expiresAt`, `auditTrail`.

### Agent Run

Definition: assistant/agent execution instance.

Owner: assistant service / Nexus/OpenClaw layer.

Relationships:

- May propose actions.
- May read lead context.
- May create notes/tasks through approval flow.

Fields:

- `runId`, `actor`, `model`, `tools`, `riskLevel`, `inputContext`, `output`, `proposedActions`, `approvalStatus`.

### Memory Object

Definition: reusable assistant memory.

Owner: memory service via Nexus.

Fields:

- `id`, `scope`, `subjectId`, `content`, `confidence`, `sourceEventId`, `createdAt`, `expiresAt`, `tags`.

Invariant:

Memory writes need source attribution and deletion/correction path.

### Integration Account

Definition: provider connection or credential metadata.

Owner: integration/config service; secrets in secret manager.

Fields:

- `provider`, `status`, `tenantId`, `lastHealthCheck`, `capabilities`, `secretRef`.

### Compliance Event

Definition: audit record for consent/suppression/quiet-hour/send decisions.

Owner: compliance service.

Fields:

- `decision`, `reason`, `policyVersion`, `channel`, `leadId`, `contactId`, `inputSnapshot`, `timestamp`.

### User / Team / Role

Definition: product identity and authorization.

Owner: auth service/Supabase direction.

Fields:

- `userId`, `teamId`, `role`, `permissions`, `tenantId`, `status`.

### Timeline Event

Definition: read model for any lead/application activity.

Owner: generated projection from CRM, communication, campaign, quote, document, compliance, and assistant events.

Fields:

- `eventId`, `entityId`, `type`, `source`, `actor`, `summary`, `details`, `timestamp`, `correlationId`, `riskLevel`.

## Conceptual Relationship Map

```text
User/Team/Role
  -> owns Leads, Tasks, Campaigns

Contact/Borrower
  -> has Leads
  -> has Communication Events
  -> has Compliance State

Lead
  -> has Loan Scenarios
  -> has Campaign Enrollments
  -> has Quotes
  -> has Documents
  -> has Tasks
  -> has Timeline Events
  -> has Agent Runs

Campaign
  -> has Campaign Steps
  -> creates Campaign Enrollments
  -> triggers Communication Events

Quote
  -> has Pricing Scenarios
  -> creates Documents/PDFs
  -> creates Timeline Events

Communication Event
  -> references Provider Message/Call
  -> references Compliance Event
  -> writes Timeline Event

Agent Run
  -> reads Lead/Timeline/Memory
  -> proposes Actions
  -> creates Audit Events after approval
```

## Source of Truth Table

| Entity | Source of truth | App responsibility |
| --- | --- | --- |
| Lead/contact/application | Twenty via CRM API | Display, filter, initiate approved mutations |
| Campaign template/enrollment | Campaign engine, mirrored in CRM | Build, preview, control |
| Communication event | Communication service, appended to CRM | Display timeline/inbox, initiate gated sends |
| Quote/pricing scenario | Quote API, persisted via CRM | Request, compare, approve, send |
| Compliance decision | Compliance service | Show decision and block unsafe actions |
| Agent run/proposed action | Assistant service/Nexus | Chat, review, approve/reject |
| Memory object | Mem0/OpenMemory/Letta via Nexus | Read/explain/control with permissions |
| User/team/role | Auth service/Supabase | Admin UI and route gating |
| Provider config | Integration service/secret manager | Health/status/settings only |
