# Audit Logging Schema

Audit events must be structured enough to reconstruct who acted, what changed, which service owned the change, and why the decision was allowed or denied.

## Required Fields

| Field | Description |
| --- | --- |
| `id` | Audit event ID. |
| `timestamp` | Server-side timestamp. |
| `entityType` | Lead, contact, campaign, quote, message, webhook, assistant action, or infra action. |
| `entityId` | Target entity ID. |
| `action` | Typed action from the taxonomy below. |
| `riskLevel` | Agent action risk classification. |
| `actorId` | Human, service, or system actor. |
| `actorRole` | Borrower, broker, operator, service, dev, or owner. |
| `sourceSurface` | Cockpit, landing, webhook, Nexus, n8n, Activepieces, CLI, or service. |
| `correlationId` | Request chain ID. |
| `idempotencyKey` | Replay-safe operation key. |
| `decision` | Allowed, denied, queued, approved, rejected, executed, failed. |
| `details` | Redacted structured metadata. |

## Action Taxonomy

- `lead.created`
- `lead.updated`
- `lead.deduped`
- `campaign.enrolled`
- `campaign.paused`
- `campaign.resumed`
- `campaign.cancelled`
- `quote.generated`
- `quote.approved`
- `quote.delivered`
- `message.drafted`
- `message.sent`
- `message.received`
- `compliance.stop_detected`
- `compliance.unsubscribe_detected`
- `compliance.quiet_hours_blocked`
- `assistant.tool_listed`
- `assistant.tool_denied`
- `assistant.tool_called`
- `webhook.received`
- `webhook.verified`
- `webhook.rejected`

## Redaction

Do not persist provider tokens, API keys, raw OAuth payloads, full payment details, or raw model prompts containing unneeded PII. Store references and hashes where possible.
