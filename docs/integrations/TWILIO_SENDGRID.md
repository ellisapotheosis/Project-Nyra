# TWILIO_SENDGRID.md

## Role

Outbound and inbound communication transport.

## Twilio (SMS/Voice)

- **Account SID**: `TWILIO_ACCOUNT_SID`
- **Auth Token**: `TWILIO_AUTH_TOKEN`
- **From Number**: `TWILIO_FROM_NUMBER`

## SendGrid (Email)

- **API Key**: `SENDGRID_API_KEY`

## Compliance

All outbound traffic must check for a `DO_NOT_CONTACT` flag in the CRM before dispatch.
