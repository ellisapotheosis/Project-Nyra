# Integration + Service Architecture

## Architecture Rule

The main app is a control surface. Services own business behavior. External systems own provider-specific infrastructure. Every high-risk operation must flow through a typed service contract with audit metadata.

## Primary Request Flow

```text
Browser
  -> apps/webapp/app
  -> Next.js BFF/proxy route or server action
  -> Nyra service boundary
  -> provider/external dependency
  -> service audit/event
  -> CRM/timeline projection
  -> webapp realtime/update
```

## CRM: Twenty

UI-facing module:

- `/crm`, lead/application projections, CRM sync badges, deep links.

Backend service:

- `services/crm-api`.
- Uses `packages/crm-client`.
- Owns GraphQL/REST mapping, field normalization, custom object access, and CRM write audit.

External dependency:

- Twenty CRM on Oracle VPS.

Rules:

- No direct database access from the app.
- No assistant-direct CRM mutation.
- CRM layer stores records; it does not own campaign/compliance/quote business logic.

## Quote Engine

UI-facing module:

- `/quotes`, quote panel in `/leads/[id]`, borrower quote portal.

Backend service:

- `services/quote-api`.
- Owns deterministic calculations, 3-option scenarios, PDFs, calculation traces.

External dependency:

- Rate sheets/pricing inputs if added later.

Rules:

- UI can request and display quotes.
- Assistant can explain quote data returned by quote API.
- No UI or assistant-generated official terms.

## Twilio / Voice / SMS

UI-facing module:

- Inbox, lead timeline, lead communication composer, voice panel.

Backend service:

- Future `services/communication-service`, drawing from `services/twilio-integration`.
- Owns SMS/voice dispatch, webhook verification, inbound replies, recordings, transcriptions, cost, provider IDs.

External dependency:

- Twilio.

Rules:

- Pre-send compliance decision required.
- STOP/reply webhooks must update campaign state and CRM timeline immediately.
- Voice controls stay disabled when consent/recording policy is missing.

## Email

UI-facing module:

- Inbox, email composer, campaign step preview, timeline.

Backend service:

- Communication service / SendGrid adapter.

External dependency:

- SendGrid or selected email provider.

Rules:

- Unsubscribe must be immediate.
- Provider webhooks must be signature-verified.
- Email campaign execution must log template, campaign step, provider ID, and compliance decision.

## Campaign Runtime

UI-facing module:

- `/campaigns`, `/campaigns/builder`, campaign panel on lead detail.

Backend service:

- `services/campaign-engine`.
- Owns template versions, schedules, enrollment state, pause/resume/stop, reply-pause, STOP cancellation.

External dependencies:

- n8n/Activepieces as execution glue only.

Rules:

- Campaign engine is the business brain.
- n8n/Activepieces can execute steps but not own canonical state.
- Every outbound step calls compliance before communication service.

## Assistant / Agent Orchestration

UI-facing module:

- `/assistant`, lead assistant sidecar, proposed action cards, `/agent-control`.

Backend services:

- `services/assistant-service` or `services/nyra-orchestrator`.
- `services/nexus-router`.
- OpenClaw Gateway/Studio.

External/infrastructure:

- LiteLLM.
- Local/cloud model providers.
- Worker model endpoints over private network.

Rules:

- Assistant may read context through approved tools.
- Mutations become proposed actions.
- Risky actions require human approval and audit.
- Borrower assistant has a much smaller tool scope than broker assistant.

## Memory Systems

UI-facing module:

- `/agent-control/memory` read/explain/correct view.

Backend/infrastructure:

- Mem0, OpenMemory MCP, Letta, FalkorDB, Qdrant through Nexus.

Rules:

- Memory reads can support assistant context.
- Memory writes need source event, scope, confidence, and deletion/correction path.
- Do not expose raw memory database UIs as product pages.

## Auth

UI-facing module:

- Login/session, settings/users, role management.

Backend/external:

- Supabase/auth direction from current docs unless later replaced.

Rules:

- Role-aware route access.
- Tenant-aware records for SaaS path.
- Admin actions audited.

## Storage / Documents

UI-facing module:

- `/documents`, borrower portal document status, lead detail docs panel.

Backend service:

- `services/doc-management-api` or new document service.

External:

- S3-compatible storage or selected secure storage provider.

Rules:

- Store metadata in CRM.
- Store files in secure object storage.
- Log upload/request/review events.

## Observability

UI-facing module:

- Health summaries and deep links under `/tools/health` or `/settings/integrations`.

Backend/infrastructure:

- Prometheus, Loki, Grafana, Langfuse, service logs.

Rules:

- Do not rebuild full observability in the product app.
- Surface actionable status: service healthy, provider degraded, webhook failing, queue backed up.

## Webhooks

Webhook sources:

- Twilio inbound SMS/call/status.
- SendGrid events.
- Twenty CRM events.
- Landing lead capture.
- Workflow engine callbacks.

Rules:

- Verify signatures.
- Use idempotency keys.
- Write normalized events.
- Do not execute provider callbacks directly in UI components.

## Data Flow Examples

### New lead

```text
Landing lead form
  -> lead ingestion service
  -> validation + consent capture + dedupe
  -> CRM API / Twenty
  -> campaign eligibility decision
  -> timeline event
  -> webapp lead queue
```

### Campaign SMS step

```text
Campaign engine due step
  -> compliance service preflight
  -> communication service send SMS
  -> Twilio
  -> provider callback
  -> communication event
  -> CRM timeline
  -> webapp timeline/inbox
```

### Quote request

```text
Broker or borrower requests quote
  -> app validates input
  -> quote API generates 3 options
  -> CRM API stores quote record
  -> app displays comparison
  -> broker approves send
  -> compliance service preflight
  -> communication service sends quote link/PDF
```

### Assistant proposed action

```text
Assistant reads lead context
  -> proposes pause campaign/send message/request docs/create quote
  -> app renders action card with risk and payload
  -> broker approves
  -> assistant service executes through service boundary
  -> audit + timeline event
```

## Service Consolidation Target

Canonical service names:

- `services/crm-api`
- `services/lead-ingestion`
- `services/compliance-service`
- `services/campaign-engine`
- `services/communication-service`
- `services/quote-api`
- `services/document-service`
- `services/assistant-service`
- `services/nexus-router`
- `services/websocket-hub`

Existing overlapping services should be mapped into these or archived after behavior is migrated.
