# Composio Action Bridge

Composio is allowed as a server-side SaaS and MCP action bridge for Project Nyra. It is not a replacement for campaign, compliance, quote, CRM, or communication services.

## Boundary

Composio can execute scoped external actions after a Nyra backend service authorizes the action and records audit context.

Allowed examples:

- create an internal broker task
- post an internal notification
- fetch SaaS context for assistant summarization
- prepare a draft action for human approval

Disallowed examples:

- send borrower SMS/email directly
- mutate Twenty CRM directly from an assistant action
- generate quote terms
- apply STOP/unsubscribe state outside compliance and campaign services
- expose OAuth tokens or API keys to the browser

## Request Contract

```json
{
  "action": "broker.task.create",
  "actorId": "user_123",
  "leadId": "lead_123",
  "correlationId": "audit_123",
  "requiresApproval": true,
  "payload": {
    "title": "Call borrower about rate options",
    "dueAt": "2026-05-12T18:00:00.000Z"
  }
}
```

Required checks before dispatch:

- action is allowlisted
- actor is authorized
- referenced lead/contact exists
- audit correlation ID exists
- approval is present when the action changes external state
- secrets are loaded server-side only

## Environment Variables

Use secret manager or gitignored `.env` files for:

- `COMPOSIO_API_KEY`
- `COMPOSIO_WEBHOOK_SECRET`
- provider-specific OAuth credentials managed by Composio

Do not commit real values.

## Audit Requirements

Every Composio action must record:

- requested action
- actor
- target entity
- approval state
- external provider result
- correlation ID
- timestamp

Failures must record the same correlation ID and be safe to retry only when the action is idempotent.
