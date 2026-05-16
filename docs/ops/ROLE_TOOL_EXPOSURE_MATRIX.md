# Role Tool Exposure Matrix

| Role | Read tools | Write tools | Approval required | Explicitly denied |
| --- | --- | --- | --- | --- |
| borrower-assistant | borrower profile summary, uploaded document status, quote records selected for borrower | none | N/A | CRM write, provider send, raw MCP list, worker inference URLs, internal health details |
| broker-assistant | lead summary, timeline, quote history, campaign state, compliance state | draft proposed reply, draft quote request | required for send, CRM mutation, quote delivery, campaign changes | direct provider API, direct database, secret access |
| broker-operator | all broker-assistant reads, fleet summaries, runbook links | pause/resume campaign through service, approve send, approve quote delivery | required for high-risk or external side effects | raw worker exposure, direct datastore mutation |
| system-service | service-owned reads | service-owned writes | service contract decides | browser-origin requests, human impersonation |
| dev-agent | repo/docs/tests/local scripts | local code edits and non-destructive validation | production changes require owner runbook | production sends, secret readback, destructive infra |
| owner-operator | all protected operator reads | production rollout, secret rotation, infra mutation | owner authenticated session | none outside legal/security constraints |

## Required Implementation Checks

- Browser-origin clients receive only borrower or broker BFF tools.
- Write-class tool calls require service-side authorization even if Nexus allowed the route.
- Provider sends can only execute through `services/communication-service`.
- Quote generation can only execute through `services/quote-api`.
- Campaign state changes can only execute through `services/campaign-engine`.
- CRM writes can only execute through `services/crm-api`.
