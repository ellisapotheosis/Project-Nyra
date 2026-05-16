# Activepieces Workflows

Activepieces is used for lightweight internal automations and admin-friendly integrations. It does not own mortgage campaign state, compliance decisions, quote generation, or borrower communication sends.

## Allowed

- broker/admin notifications
- failed workflow alerts
- daily summary triggers
- non-critical SaaS glue
- links or embedded admin access for trusted operators

## Not Allowed

- direct Twilio or SendGrid borrower sends
- direct Twenty CRM mutation outside `services/crm-api`
- STOP/unsubscribe handling outside `services/compliance-service` and `services/campaign-engine`
- quote generation
- storing secrets in exported workflow JSON

## Campaign Mapping

| Event | Activepieces role | Backend authority |
| --- | --- | --- |
| New lead captured | Notify broker/admin | `services/lead-ingestion` and CRM API |
| Campaign dispatch failed | Notify operator | `services/campaign-engine` and n8n |
| STOP/unsubscribe applied | Notify broker after backend state changes | compliance service and campaign engine |
| Daily campaign summary | Send internal summary | campaign engine read model |

## Scaffolds

- `simple-notifications.scaffold.json` receives internal events and posts server-approved notifications.

Use `AP_WEBHOOK_URL` and `AP_FRONTEND_URL` from the environment/secrets register. Keep credentials in `.env` or the selected secret manager.
