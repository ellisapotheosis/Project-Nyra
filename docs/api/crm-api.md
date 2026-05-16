# CRM API

`services/crm-api` is the app and workflow boundary for Twenty CRM. Apps, agents, n8n, and Activepieces should call this service instead of mutating Twenty records directly.

## Lead Endpoints

### `POST /api/leads`

Creates or updates the Twenty person/contact by email or phone, then creates a `mortgageLead` custom object.

Required input:

- `firstName` or `first_name`
- `lastName` or `last_name`
- `email` or `phone`

Optional mortgage input:

- `loanPurpose`
- `loanAmount`
- `propertyState`
- `creditScore`
- `source`

Response:

```json
{
  "success": true,
  "personId": "twenty-person-id",
  "mortgageLeadId": "twenty-mortgage-lead-id"
}
```

### `GET /api/leads`

Returns the latest mortgage leads from Twenty.

### `GET /api/leads/:id`

Returns the Twenty `mortgageLead` plus local `nyra_integration.lead_metadata` when present.

### `PATCH /api/leads/:id/status`

Updates the local loan status mirror and forwards the status change to workflow glue when `N8N_WEBHOOK_URL` is configured.

### `POST /api/leads/:id/quote`

Calls the quote engine, mirrors the generated quote to Twenty, and writes local quote metadata. The quote engine remains the calculation owner.

## Campaign Endpoints

### `POST /api/leads/:id/campaigns/enroll`

Body:

```json
{
  "campaignName": "New Lead Nurture",
  "channelPreferences": ["email", "sms"]
}
```

Behavior:

- Inserts a local campaign enrollment mirror.
- Sets the Twenty mortgage lead campaign status to `ACTIVE`.
- Emits `campaign-enroll` workflow payload when `N8N_WEBHOOK_URL` is configured.

### `POST /api/leads/:id/campaigns/pause`

Body:

```json
{
  "reason": "manual_pause",
  "notes": "Borrower requested callback tomorrow."
}
```

Behavior:

- Pauses active or pending local enrollments.
- Sets the Twenty mortgage lead campaign status to `PAUSED`.
- Emits `campaign-pause` workflow payload when configured.

## Reply Webhook

### `POST /api/webhooks/reply`

Body:

```json
{
  "leadId": "twenty-mortgage-lead-id",
  "channel": "sms",
  "body": "Stop texting me",
  "providerMessageId": "provider-message-id",
  "receivedAt": "2026-05-14T18:00:00.000Z"
}
```

Behavior:

- Logs inbound communication metadata when local lead metadata exists.
- Pauses active or pending campaign enrollment.
- Sets Twenty campaign status to `PAUSED` for ordinary replies.
- Sets Twenty campaign status to `STOPPED` and records STOP audit evidence for STOP, unsubscribe, remove, cancel, opt-out, or DNC intent.

## Security

- Set `CRM_API_KEY` to require `x-crm-api-key` on all API calls.
- Do not expose this service without Cloudflare Access or an internal gateway.
- This service must not calculate official quote values or send borrower communications directly.
