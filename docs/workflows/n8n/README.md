# n8n Workflows

This is the single documentation location for n8n workflow JSON exports.

## Layout

| Folder                                       | Contents                                                                                                                                          |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`internal/`](internal/)                     | Nyra-owned internal workflow exports such as lead ingest, campaign execution, opt-out, response handling, compliance checks, and quote follow-up. |
| [`external/campaigns/`](external/campaigns/) | Campaign-focused workflow exports gathered from external/reference docs.                                                                          |
| [`external/workflows/`](external/workflows/) | Reference workflow exports for call scheduling, drip steps, email, SMS, and mortgage lead intake.                                                 |
| [`external/n8n/`](external/n8n/)             | Other n8n workflow exports.                                                                                                                       |

## Rules

- Keep campaign logic in `services/campaign-service` and compliance logic in `services/compliance-service`.
- n8n may execute workflow steps, but it must not become the business brain.
- STOP, unsubscribe, and reply-pausing workflows must call the compliance boundary immediately.
