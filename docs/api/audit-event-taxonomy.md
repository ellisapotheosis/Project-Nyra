# Audit Event Taxonomy

Audit event names are dot-separated, service-owned, and stable. Free-form action strings may still exist in older schemas, but new code should use these names.

## Lead

- `lead.created`
- `lead.updated`
- `lead.deduped`
- `lead.assigned`
- `lead.enrollment_eligible`
- `lead.enrollment_blocked`

## Campaign

- `campaign.created`
- `campaign.enrolled`
- `campaign.step_queued`
- `campaign.step_dispatched`
- `campaign.paused`
- `campaign.resumed`
- `campaign.cancelled`
- `campaign.completed`

## Quote

- `quote.requested`
- `quote.generated`
- `quote.approval_requested`
- `quote.approved`
- `quote.rejected`
- `quote.delivered`
- `quote.expired`

## Message

- `message.drafted`
- `message.approval_requested`
- `message.approved`
- `message.sent`
- `message.delivered`
- `message.failed`
- `message.received`

## Compliance

- `compliance.consent_checked`
- `compliance.stop_detected`
- `compliance.unsubscribe_detected`
- `compliance.quiet_hours_blocked`
- `compliance.suppression_created`
- `compliance.send_blocked`

## Assistant

- `assistant.tool_listed`
- `assistant.tool_called`
- `assistant.tool_denied`
- `assistant.action_proposed`
- `assistant.action_rejected`

## Webhook

- `webhook.received`
- `webhook.verified`
- `webhook.rejected`
- `webhook.replayed`
- `webhook.dispatched`
