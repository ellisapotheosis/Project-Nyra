# Automation Division of Labor

Prompt 06 defines how n8n, Activepieces, Composio, OpenClaw, and Nyra backend services cooperate without moving mortgage business logic into workflow tools.

## Decision

- n8n owns heavy dynamic mortgage workflow execution: campaign step dispatch, webhook fan-out, reply handling, quote-triggered message orchestration, CRM sync, retries, and operational error routing.
- Activepieces owns simple triggers and admin-friendly integrations: notifications, lightweight internal alerts, non-critical SaaS glue, and optionally embedding/linking an admin console.
- Composio is a server-side SaaS/action bridge for authenticated external tools. It must not expose raw user secrets to the browser or let an assistant mutate CRM directly.
- OpenClaw is the assistant surface and reasoning layer. It can propose actions and call approved backend tools, but deterministic scheduling, sending, compliance, audit, and CRM mutation stay in Nyra services.
- Nyra backend services remain the source of truth for compliance, campaign state, quotes, communication sends, and audit records.

## Current Inventory

- `workflows/n8n/mortgage-drip.json` is an older direct-provider workflow. Treat it as a legacy reference until migrated to template-id based dispatch.
- `workflows/n8n/campaign-engine-dispatch.scaffold.json` is the Prompt 06 dynamic dispatch scaffold.
- `workflows/n8n/reply-handling.scaffold.json` is the unified inbox campaign action scaffold.
- `workflows/n8n/quote-triggered-message.scaffold.json` is the quote-message orchestration scaffold.
- `workflows/n8n/crm-sync.scaffold.json` is the CRM timeline/audit sync scaffold.
- `workflows/activepieces/README.md` documents simple integration boundaries.
- `workflows/activepieces/simple-notifications.scaffold.json` is the safe alert/notification scaffold.

## Workflow Type Assignment

| Workflow type | Owner | Reason |
| --- | --- | --- |
| Campaign step scheduling | `services/campaign-engine` + n8n | Backend owns state; n8n executes durable fan-out. |
| Message send | `services/communication-service` | Server-side compliance preflight and provider adapters required. |
| Twilio inbound replies | communication service + n8n + campaign engine | Normalize first, then pause/stop state through campaign engine. |
| SendGrid events | communication service + n8n | Delivery events are provider callbacks, not product logic. |
| Quote-triggered messages | quote service + campaign engine + n8n | Quote service owns quote truth; n8n only dispatches approved template sends. |
| CRM timeline sync | crm-api + n8n | CRM remains system of record; workflow can batch/sync normalized logs. |
| Internal notifications | Activepieces | Simple alerting does not need n8n campaign logic. |
| SaaS action bridge | Composio | Centralized server-side auth and scoped actions. |
| Assistant proposal/reasoning | OpenClaw | Assistant can suggest but not directly mutate records. |

## Headless Campaign Builder Contract

The webapp/cockpit saves dynamic campaign timelines as JSON. The backend validates and persists them. n8n reads the validated step payload at execution time.

Required payload shape:

```json
{
  "campaignId": "campaign_new_lead",
  "idempotencyKey": "builder:campaign_new_lead:v1",
  "steps": [
    {
      "id": "step_sms_1",
      "channel": "sms",
      "offset_minutes": 5,
      "templateId": "tmpl_new_lead_sms_intro"
    }
  ]
}
```

Rules:

- Steps reference `templateId`; they do not include message body or subject copy.
- Backend validation rejects inline `body`, `subject`, `message`, or `copy` fields.
- Campaign engine emits dispatch payloads with `campaign:${enrollmentId}:step:${stepId}` idempotency keys.
- n8n calls the communication service with `templateId`, `mergeContextRef`, and campaign linkage.
- Communication service renders templates, performs compliance preflight, sends through adapters, and logs/audits.

## Unified Inbox Protocol

All inbound and provider events normalize into the `UnifiedInboxEvent` envelope documented in `docs/api/comms-campaign-contracts.md`.

Campaign engine action mapping:

- `STOP` -> `STOP_ENROLLMENT`
- `UNSUBSCRIBE` -> `STOP_ENROLLMENT`
- `REPLY_PAUSE` -> `PAUSE_AND_NOTIFY_OWNER`
- `BOUNCE_SUPPRESSION` -> `SUPPRESS_CHANNEL`
- `DELIVERY_EVENT` -> `RECORD_ONLY`

## Retry and Idempotency Plan

n8n workflows should set the idempotency key on every service call and only retry transient provider failures.

Retryable:

- provider timeout
- provider 5xx
- rate limited

Not retryable:

- invalid signature
- compliance blocked
- STOP/unsubscribe already applied
- template missing required variables
- missing destination
- bad campaign-builder payload

Default retry budget:

- three attempts
- backoff of 60, 300, and 900 seconds
- on final failure, record audit event and notify broker/admin

## Activepieces Admin Strategy

Activepieces can be linked or embedded for internal admins after auth is configured. It should expose lightweight operational recipes, not raw campaign state machines.

Allowed Activepieces usage:

- Slack/internal notification fan-out.
- New lead admin notification.
- Failed workflow alert.
- Daily summary trigger.
- Lightweight SaaS integration that does not mutate CRM directly.

Not allowed:

- Direct outbound borrower send without communication service.
- Direct CRM mutation outside `services/crm-api`.
- Quote generation.
- STOP or unsubscribe state changes outside compliance/campaign services.

## Composio Strategy

Composio actions are server-side integrations only. Use scoped credentials from the secret manager and call them through a backend boundary.

Allowed:

- Create draft tasks or broker notifications.
- Fetch contextual SaaS data for assistant summarization.
- Execute approved non-critical admin actions.

Not allowed:

- Browser-side API keys.
- Assistant-direct CRM writes.
- Assistant-direct communication sends.
- Provider credential exposure in workflow JSON.

## Security Notes

- Provider signatures must be verified before side effects.
- All public webhook URLs must be HTTPS and preferably Cloudflare Access or provider-signature protected where applicable.
- Workflow JSON must not contain Twilio, SendGrid, Activepieces, or Composio secrets.
- The assistant can request an action, but compliance, approval, audit, and mutation boundaries remain in backend services.
