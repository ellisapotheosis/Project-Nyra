# Webhook Verification

Webhook routes are untrusted public ingress until provider identity, freshness, and idempotency are verified.

## Twilio

- Require `X-Twilio-Signature`.
- Validate with the Twilio auth token, the exact configured webhook URL, and all request parameters.
- Preserve the raw request body where the framework requires it for validation.
- Reject invalid signatures before normalization or side effects.

Reference: https://www.twilio.com/docs/usage/webhooks/webhooks-security

## SendGrid

- Enable Signed Event Webhook.
- Require signature and timestamp headers.
- Verify the ECDSA signature against the configured SendGrid public key.
- Reject stale timestamps and duplicate event IDs.
- Do not put PII in `category` or `unique_args`; SendGrid documents these fields as not treated as PII.

Reference: https://www.twilio.com/docs/sendgrid/for-developers/tracking-events/event

## Twenty/Internal Webhooks

- Require a shared internal signature or service token.
- Validate source route and tenant.
- Derive idempotency from source object ID, event type, and source event timestamp.

## n8n and Activepieces

- Workflow webhook endpoints must be private or protected.
- Workflows may call Nyra services, not provider APIs directly.
- Workflow payloads must include correlation ID and idempotency key.

## Replay Handling

Store verification result, provider event ID, derived idempotency key, and decision. Replays inside the retention window must return the stored decision without repeating side effects.
