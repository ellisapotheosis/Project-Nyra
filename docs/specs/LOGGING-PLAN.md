# Project Nyra Structured Logging Plan

## Log Format (JSON)

All logs must be emitted as single-line JSON to `stdout`.

```json
{
  "level": "info" | "warn" | "error",
  "message": "Human readable message",
  "context": {
    "service": "campaign-service",
    "correlationId": "uuid",
    "leadId": "uuid",
    "requestId": "uuid"
  },
  "metadata": { ... },
  "timestamp": "ISO-8601"
}
```

## Level Guidelines

- `debug`: Verbose info for development.
- `info`: Normal operational events (e.g., "Lead ingested").
- `warn`: Recoverable issues (e.g., "Retrying CRM write").
- `error`: Non-recoverable issues requiring attention.

## PII Protection

- **DO NOT LOG**: Names, Emails, Phones, SSNs, Physical Addresses.
- Use `leadId` or `hashed_email` for correlation.
- Scrub any raw request bodies before logging in `error` stacks.
