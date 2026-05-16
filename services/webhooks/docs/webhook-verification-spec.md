# Webhook Verification Spec

## Required Test Fixtures

| Provider | Fixture | Expected result |
| --- | --- | --- |
| Twilio SMS inbound | Valid signature and fresh request | accepted and normalized |
| Twilio SMS inbound | Invalid signature | rejected before side effect |
| SendGrid event | Valid signed event payload | accepted and normalized |
| SendGrid event | Stale timestamp | rejected |
| Twenty/internal | Valid service token/signature | accepted |
| n8n/Activepieces | Missing correlation ID | rejected or quarantined |

## Side Effect Rules

- Verification happens before parsing for business side effects.
- Idempotency is checked before dispatch.
- STOP/unsubscribe events route to compliance service.
- Ordinary replies route to communication service and pause campaigns.
- Rejected webhooks are audited without executing downstream mutations.
