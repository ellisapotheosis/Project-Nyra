# discord-alerts

Audited Discord operator alert boundary for Project Nyra.

The service validates high-value operator alerts, redacts obvious PII, dedupes
and throttles repeated alerts, and sends only audit-safe payloads to a Discord
webhook.

Supported alert types:

- `hot_lead`
- `quote_viewed_repeatedly`
- `reply_ready`
- `lendingpad_milestone_change`
- `failed_send_provider`
- `service_down`
- `lock_expiration`

Validation:

```bash
pnpm -C services/discord-alerts test
pnpm -C services/discord-alerts typecheck
pnpm -C services/discord-alerts build
```

REST-compatible handlers:

- `POST /alerts/discord`
- `GET /alerts/discord/:id/status`

Secrets:

- `DISCORD_ALERT_WEBHOOK_URL`
- `DISCORD_ALERT_MIN_SEVERITY`
- `DISCORD_ALERT_THROTTLE_SECONDS`
- `DISCORD_ALERT_TRACE_BASE_URL`
