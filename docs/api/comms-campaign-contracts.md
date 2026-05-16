# Communication and Campaign Contracts

This document captures the Prompt 05 service boundary for borrower outreach, provider webhooks, STOP handling, reply pauses, and campaign dispatch.

## Ownership

- `services/communication-service` owns outbound message creation, template rendering, Twilio inbound normalization, SendGrid event normalization, provider idempotency keys, communication logs, and suppression records.
- `services/campaign-engine` owns campaign definitions, enrollment state, scheduling, retry policy, and applying unified inbox directives.
- `services/compliance-service` remains the required preflight and inbound classifier for consent, STOP, unsubscribe, quiet hours, and do-not-contact checks.
- CRM timeline writes must be performed server-side after communication/campaign events are normalized and audited.

## Core Contracts

### Campaign

Campaign definitions are versioned schedules of template-backed steps. The workflow graph must not contain borrower message copy.

Required fields:

- `id`
- `name`
- `version`
- `steps[]`
- `status`

### Campaign Step

Required fields:

- `id`
- `channel`: `sms`, `email`, or `voicemail`
- `offset_minutes`
- `templateId`
- optional `mergeContextRef`

Disallowed in dynamic workflow payloads:

- `body`
- `subject`
- `message`
- `copy`

### Campaign Enrollment

Required fields:

- `id`
- `campaignId`
- `leadId` or `contactId`
- `status`
- `currentStep`
- `idempotencyKey`

State rules:

- `STOP` and unsubscribe events are terminal.
- Borrower replies pause automation and notify the broker.
- Delivery events are recorded but do not advance business state by themselves.
- Bounces suppress the affected channel and require broker review before retrying.

### Communication Log

Required fields:

- `idempotencyKey`
- `leadId`
- `channel`
- `direction`
- `provider`
- `providerMessageId`
- `status`
- `occurredAt`

Optional campaign linkage:

- `campaignEnrollmentId`
- `campaignStepId`
- `templateId`

### Suppression Record

Required fields:

- `leadId`
- `channel`
- `reason`: `STOP`, `UNSUBSCRIBE`, `BOUNCE`, or `SPAM_REPORT`
- `source`
- `providerEventId`
- `idempotencyKey`
- `occurredAt`

## Unified Inbox Event

All Twilio, SendGrid, and future provider callbacks normalize into one event envelope before campaign handling.

```json
{
  "id": "twilio:SM123",
  "provider": "twilio",
  "providerEventId": "SM123",
  "idempotencyKey": "twilio:sms:SM123",
  "leadId": "lead_123",
  "campaignEnrollmentId": "enroll_123",
  "campaignStepId": "step_sms_1",
  "channel": "SMS",
  "direction": "INBOUND",
  "eventType": "MESSAGE_RECEIVED",
  "campaignDirective": "REPLY_PAUSE",
  "occurredAt": "2026-05-11T18:00:00.000Z",
  "from": "+15550001111",
  "to": "+15550002222",
  "body": "Can you call tomorrow?",
  "metadata": {}
}
```

Campaign directive mapping:

- `STOP` -> terminal stop, suppress SMS.
- `UNSUBSCRIBE` -> terminal stop or channel suppression depending on channel policy; suppress email.
- `REPLY_PAUSE` -> pause enrollment, set reply snapshot, notify Ellis/broker.
- `BOUNCE_SUPPRESSION` -> suppress channel and log delivery failure.
- `DELIVERY_EVENT` -> record only.

## Server-Side Provider Scaffolds

### Twilio Inbound Webhook

Endpoint shape:

```http
POST /webhooks/twilio/inbound
```

Required safeguards:

- Verify Twilio signature before parsing side effects.
- Normalize `MessageSid`, `From`, `To`, and `Body` with `normalizeTwilioInboundWebhook`.
- Deduplicate by `twilio:sms:${MessageSid}`.
- Run inbound compliance classification.
- For STOP or unsubscribe language, create a suppression record and stop active enrollments.
- For non-STOP borrower replies, pause active enrollments and notify the broker.
- Append an audit event and CRM timeline entry.

### SendGrid Event Webhook

Endpoint shape:

```http
POST /webhooks/sendgrid/events
```

Required safeguards:

- Verify SendGrid event webhook signature.
- Process each array item independently.
- Deduplicate by `sendgrid:${providerEventId}:${event}`.
- Map unsubscribe/group_unsubscribe to suppression.
- Map bounce/dropped/spamreport to channel suppression.
- Record delivered/open/click as non-mutating delivery events.
- Append audit events and CRM timeline entries.

## Template Rules

Templates live server-side and are referenced by `templateId`. Rendering must fail if required merge variables are missing.

Example required variables:

- `firstName`
- `broker.name`
- `loanGoal`
- `applicationLink`

The current implementation exposes `renderTemplate` in `services/communication-service/src/index.ts`.

## New Lead Nurture Reference Flow

The first active reference sequence is `new-lead-nurture-v1`:

- 5 minutes after capture: SMS intro template.
- 30 minutes after capture: email next-step checklist template.
- 1 day after capture: SMS follow-up template if no borrower reply or manual broker takeover happened.

Additional sequences remain placeholders until product copy and trigger rules are approved:

- pre-approval follow-up
- application in progress
- post-close delight
- rate alert
- re-engagement
- long nurture

## Retry and Idempotency

Use stable idempotency keys at each boundary:

- Campaign step dispatch: `campaign:${enrollmentId}:step:${stepId}`
- Twilio inbound: `twilio:sms:${MessageSid}`
- SendGrid event: `sendgrid:${providerEventId}:${event}`

Default retry policy:

- `maxAttempts`: 3
- backoff seconds: `60`, `300`, `900`
- retry only: provider timeout, provider 5xx, and rate-limited errors

Do not retry:

- compliance blocks
- template validation failures
- missing destination
- invalid webhook signatures
- STOP or unsubscribe mutations after they have already been applied

## Sandbox Verification

Minimum safe test flow before live credentials:

1. Render each template with complete merge variables.
2. Confirm missing merge variables fail before provider send.
3. Simulate Twilio `STOP`; verify suppression and terminal enrollment state.
4. Simulate Twilio ordinary reply; verify pause and broker notification payload.
5. Simulate SendGrid unsubscribe and bounce; verify suppression records.
6. Simulate delivered/open/click; verify CRM timeline record only.
7. Re-send each provider event with the same idempotency key; verify no duplicate mutation.

## Required Environment Variables

- `TWILIO_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `TWILIO_MESSAGING_SERVICE_SID`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_WEBHOOK_PUBLIC_KEY`
- `SENDGRID_WEBHOOK_SIGNATURE_KEY`
- `N8N_EDITOR_BASE_URL`
- `AP_WEBHOOK_URL`
- `AP_FRONTEND_URL`
- optional `SLACK_WEBHOOK` for broker notifications

Secrets must remain in `.env` files or the selected secret manager, never in source.
