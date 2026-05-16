# Service Integration Map

## Intent

This document maps app pages to backend services and integration responsibilities. It prevents future agents from wiring product UI directly to workflow nodes, raw databases, or external tools when a service boundary should own the decision.

## Frontend To Service Ownership

| UI area | Primary services | Notes |
| --- | --- | --- |
| Landing lead wizard | `lead-capture-api`, `ratehunter-api`, `crm-api` | Browser submits to intake boundary, not Twenty |
| Landing borrower chat | `mortgage-assistant-api`, OpenClaw/Nexus proxy | Educational only, no CRM mutation |
| Landing market pulse | `market-data.ts`, future quote/rate services | Indicative, non-binding |
| Webapp overview | CRM API, campaign engine, quote API, websocket hub, health endpoints | Mix of live and cached cards |
| Assistant | OpenClaw, Nexus Router, CRM API, communication logs | Safe actions only |
| Leads | CRM API, lead-capture-api, campaign engine | Lead scoring and consent state required |
| Lead detail | CRM API, communication service, quote API, campaign service | Canonical cockpit |
| Campaigns | campaign-engine, n8n-workflows, Activepieces, CRM API | Services decide, runners execute |
| Quotes | quote-api, quote-engine, rate-comparison-engine, CRM API | Quote values are service-owned |
| Pipeline/applications | CRM API, document services, mortgage-crm domain concepts | Twenty is canonical |
| CRM pages | CRM API, twenty-crm integration, Twenty MCP | Broker-safe mirror and setup |
| Tool pages | Nexus, OpenClaw, n8n, Activepieces, OpenMemory, Cloudflare, observability | Health/status/deep links |

## Core Services

`services/crm-api`:

- Boundary around Twenty CRM.
- Owns normalized writes and reads for contacts, leads, loans, campaigns, communications, quotes, and compliance events.
- Webapp should prefer this boundary over raw Twenty.

`services/lead-capture-api`:

- Captures public and partner leads.
- Validates contact data, consent, source, lead scoring, duplicate detection, and CRM sync.
- Landing wizard should submit here or through `ratehunter-api`.

`services/ratehunter-api`:

- Public landing API facade for quote/lead flows.
- Good candidate for landing lead intake and educational rate endpoints.

`services/mortgage-assistant-api`:

- Backend for assistant-style borrower/broker workflows.
- Should stay bounded by compliance and CRM service contracts.

`services/campaign-engine`:

- Owns campaign DSL/templates/enrollment decisions.
- Should produce execution payloads for n8n/Activepieces, not send directly unless explicitly implemented.

`services/quote-api` and `services/quote-engine`:

- Own quote generation, quote scenarios, payment/cost breakdowns, quote PDFs/exports, and expiration.
- Webapp and assistant must not invent quote values.

`services/rate-comparison-engine`:

- Owns rate comparison, lender/rate intelligence, cache, and alerts.
- Good backend for quote desk rate cards and pricing engine comparison.

`services/webhooks`:

- Canonical callback ingress for providers and partners.
- Should route Twilio, SendGrid, CRM, workflow, and partner events to the proper service.

`services/websocket-hub`:

- Real-time updates for webapp status, service events, MCP status, GPU metrics, and agent events.
- UI must gracefully fall back when websocket is unavailable.

## Integration Services

`services/n8n-workflows`:

- Workflow definitions and execution glue.
- Must call services for business decisions and CRM writes.

`services/twilio-integration`:

- SMS/voice sending and provider callbacks.
- Must enforce opt-out/STOP behavior with compliance services.

`services/sendgrid-integration`:

- Email templates, sending, events, unsubscribe handling.
- Must attach events to communication logs.

`services/openclaw`:

- Assistant runtime/gateway.
- Must use bounded tools and handoff behavior.

`services/nexus-router`:

- LLM/MCP routing and tool ingress.
- Browser UIs should interact through safe server routes, not raw worker endpoints.

`services/letta-integration`:

- Allowed as memory-manager integration only.
- Any RuVector references are stale.

`services/litellm-proxy`:

- Model provider unification behind Nexus/LiteLLM policy.

`apps/twenty-crm/mcp-servers` and `services/twenty-mcp-jezweb`:

- MCP/Twenty integration references.
- Must not become direct public browser write paths.

## Health Endpoint Expectations

Every service integrated into webapp should expose or document:

- `GET /health` or equivalent.
- Version/build info if available.
- Dependency status.
- Last successful provider check.
- Queue/backlog count where applicable.
- Safe error message for UI.

If no endpoint exists yet, page docs should say “not wired” and show a disabled/fallback UI.

## Degraded UI Rules

CRM offline:

- Read cached/mock data only.
- Disable write actions.
- Show CRM sync banner.

Campaign engine offline:

- Disable publish, pause/resume, and assignment.
- Keep historical campaign data visible.

Quote service offline:

- Disable generate quote.
- Keep recent quotes and market snapshot visible with stale labels.

Websocket offline:

- Show static fallback and last refresh time.
- Do not present rates/events as live.

Provider offline:

- Disable send actions for that channel.
- Keep draft actions available.

## CRM Write Boundary

Allowed writers:

- `crm-api`.
- Dedicated Twenty integration service.
- Controlled backend jobs that call a CRM boundary.

Disallowed writers:

- Browser components.
- Assistant direct tool calls without service approval.
- n8n nodes that bypass validation/dedupe/compliance.
- Static landing page code.

## Implementation Priority

1. Add service health status to webapp cards.
2. Replace hardcoded route stubs with typed mock adapters.
3. Wire read-only service data.
4. Add idempotent write actions.
5. Add retries/dead-letter surfaces.
6. Add owner manual action docs for dashboard/provider steps.
