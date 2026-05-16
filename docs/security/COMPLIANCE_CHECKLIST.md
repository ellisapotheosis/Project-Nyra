# Compliance Checklist

Use this checklist before enabling any workflow, agent action, or provider integration that can contact a borrower or mutate durable records.

## Communication Gates

- Confirm channel consent before send.
- Check do-not-contact and suppression records.
- Detect STOP, unsubscribe, remove, cancel, opt-out, and DNC intent.
- Enforce quiet hours.
- Require broker or owner approval before outbound send.
- Log communication request, decision, and provider result.

## Quote Gates

- Generate quote through quote service only.
- Mark quote as estimate until broker approval.
- Do not let assistant invent rates, costs, or lender terms.
- Log generated, approved, delivered, and expired quote events.

## Campaign Gates

- Campaign logic lives in campaign service.
- n8n and Activepieces execute service-approved steps only.
- Replies pause automation and notify broker.
- STOP/unsubscribe cancels future outreach immediately.
- Retries must be idempotent and bounded.

## Webhook Gates

- Verify Twilio `X-Twilio-Signature` using the configured public URL and request parameters.
- Verify SendGrid Signed Event Webhook using signature, timestamp, and configured public key.
- Reject stale timestamps and duplicate idempotency keys.
- Store raw bodies only where necessary and redact before general logs.
