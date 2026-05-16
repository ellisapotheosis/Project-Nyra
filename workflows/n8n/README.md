# n8n Workflows

n8n is the durable execution layer for Project Nyra mortgage workflow orchestration. It executes backend-approved steps and webhook fan-out, but it does not own campaign logic, compliance rules, quote truth, or message copy.

## Prompt 06 Scaffolds

- `campaign-engine-dispatch.scaffold.json` dispatches validated campaign steps to the communication service.
- `reply-handling.scaffold.json` applies unified inbox directives to the campaign engine and CRM sync.
- `quote-triggered-message.scaffold.json` validates quote-triggered send requests through the quote service before campaign dispatch.
- `crm-sync.scaffold.json` writes communication timeline and audit events through `services/crm-api`.

## Legacy Reference

`mortgage-drip.json` predates the template-id based campaign contract and contains direct provider send nodes. Do not use it as a production source of borrower message text. Migrate any useful scheduling ideas into validated campaign-builder JSON and communication-service templates.

## Required Runtime Environment

- `COMMUNICATION_SERVICE_URL`
- `CAMPAIGN_ENGINE_URL`
- `CRM_API_URL`
- `QUOTE_SERVICE_URL`
- provider credentials loaded by backend services, not n8n workflow JSON

All workflow calls must include an `Idempotency-Key` header where the upstream payload provides one.
