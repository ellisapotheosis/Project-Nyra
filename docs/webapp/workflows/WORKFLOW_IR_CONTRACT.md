# Workflow IR Contract

Project Nyra services own business state. n8n and Activepieces execute approved steps only after a Nyra service emits a workflow invocation record.

## Required Envelope

Every workflow invocation must use this shape:

```json
{
  "id": "wf_01H...",
  "workflow": "campaign.step.dispatch",
  "version": 1,
  "idempotencyKey": "campaignEnrollmentId:stepId:attempt",
  "sourceService": "campaign-service",
  "requestedAt": "2026-05-22T00:00:00.000Z",
  "actor": {
    "type": "service",
    "id": "campaign-service"
  },
  "subject": {
    "contactId": "twenty-contact-id",
    "leadId": "twenty-lead-id"
  },
  "compliance": {
    "preflightDecisionId": "compliance-decision-id",
    "approvalId": "approval-id-or-null",
    "quietHoursChecked": true,
    "stopSuppressionChecked": true
  },
  "payload": {},
  "callback": {
    "url": "https://api.projectnyra.com/api/workflows/callbacks",
    "tokenSecretName": "WORKFLOW_CALLBACK_TOKEN"
  }
}
```

## Consumer Rules

- Consumers must reject invocations without `id`, `workflow`, `version`, `idempotencyKey`, `sourceService`, `requestedAt`, `subject`, and `compliance`.
- Consumers must treat `idempotencyKey` as the replay boundary and return the previous result for duplicate deliveries.
- Consumers must not calculate mortgage rates, mutate CRM records directly, or decide campaign/compliance state.
- Consumers may call provider APIs only for the approved action in `workflow`.
- Consumers must callback with provider IDs, timestamps, and terminal status. They must not write final business state themselves.

## Supported Workflow Names

| Workflow                  | Owner                   | Executor            | Purpose                                                                             |
| ------------------------- | ----------------------- | ------------------- | ----------------------------------------------------------------------------------- |
| `lead.ingest.notify`      | `lead-ingestion`        | n8n                 | Notify internal operators after a normalized lead write plan is accepted.           |
| `campaign.step.dispatch`  | `campaign-service`      | Activepieces or n8n | Execute one approved email/SMS/voice step after compliance and approval gates pass. |
| `campaign.reply.pause`    | `communication-service` | n8n                 | Notify brokers after an inbound reply pauses automation.                            |
| `quote.followup.schedule` | `quote-service`         | Activepieces or n8n | Schedule approved quote follow-up reminders without recalculating quote terms.      |
| `document.request.send`   | `communication-service` | Activepieces or n8n | Send an approved document request and report provider status.                       |

## Callback Contract

Callbacks must include:

```json
{
  "workflowInvocationId": "wf_01H...",
  "idempotencyKey": "campaignEnrollmentId:stepId:attempt",
  "status": "succeeded",
  "provider": "sendgrid",
  "providerMessageId": "provider-id",
  "completedAt": "2026-05-22T00:00:05.000Z",
  "metadata": {}
}
```

Allowed statuses are `accepted`, `succeeded`, `failed`, `suppressed`, and `retrying`.

## Validation

- Static JSON exports must pass `jq empty`.
- Workflow docs must list trigger, inputs, outputs, compliance gates, idempotency, retries, and replay.
- Live imports require owner/provider credentials and stay tracked in `docs/OWNER_MANUAL_ACTIONS.md`.
