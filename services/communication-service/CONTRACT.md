# Communication Service Contract

`services/communication-service` is the canonical borrower communication boundary for SMS, email, voice, voicemail, provider callbacks, and timeline writes.

## Implementation Status

The service now has a local deterministic core in `src/index.ts` for outbound compliance gating and inbound event normalization. `services/twilio-integration` and SendGrid adapters remain provider plumbing behind this boundary until live credentials/webhooks are configured.

## Responsibilities

- Verify Twilio and SendGrid webhook signatures.
- Enforce compliance preflight before every outbound borrower communication.
- Dispatch SMS, email, calls, and voicemail through provider adapters.
- Normalize inbound replies, STOP, unsubscribe, delivery, call, recording, and voicemail callbacks into `CommunicationEvent` records.
- Notify campaign engine for STOP, unsubscribe, reply-pause, send failures, and delivery state.
- Append timeline and CRM communication logs through CRM API.

## Forbidden

- No provider callback may directly mutate UI state, CRM state, or campaign state without service-mediated audit.
- No send endpoint may bypass compliance.
- Raw media or inference endpoints must not be public.

## Frontend Calls

- `POST /api/messages`
- `GET /api/leads/:leadId/messages`
- `POST /api/calls`
- `POST /api/voicemails`
- `GET /api/inbox`

## Webhooks

- `POST /webhooks/twilio/sms`
- `POST /webhooks/twilio/voice`
- `POST /webhooks/sendgrid/events`

Webhook handlers require signature verification and idempotency keys.
