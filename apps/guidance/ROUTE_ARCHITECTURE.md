# Route Architecture

Path note: filesystem examples that originally used `apps/webapp/app` now map to the active `apps/nyra-webapp` package. Public unauthenticated landing routes now live in `apps/ratehunter-landing`.

## Information Architecture

Use one authenticated product shell with role-aware route groups. The URL can stay simple while the filesystem becomes clearer.

Recommended Next.js route groups:

```text
apps/nyra-webapp/app/
  (broker)/
  (borrower)/
  (ops)/
  (tools)/
  api/
```

## Top-Level Routes

| Route | Purpose | Primary users | Major modules | Integrations |
| --- | --- | --- | --- | --- |
| `/` | Broker cockpit landing | Broker, admin | KPI strip, hot leads, tasks, campaign alerts, quote queue, assistant dock | CRM API, campaign engine, communication service, quote API |
| `/leads` | Lead work queue | Broker, admin | Filters, lead table/cards, score, source, consent, owner, next touch | CRM API, lead ingestion |
| `/leads/[id]` | Record command center | Broker, admin, agent-only | Profile, timeline, campaign, quotes, docs, notes, tasks, assistant sidecar, compliance | CRM API, communication service, campaign engine, quote API, assistant service |
| `/applications` | Loan/application tracking | Broker, borrower subset | Application list, milestones, docs, missing items | CRM API, document service |
| `/pipeline` | Revenue/pipeline view | Broker, admin | Stage board, value metrics, conversion, SLA | CRM API, analytics events |
| `/quotes` | Quote desk | Broker, admin | Quote request, comparison, approval, history | Quote API, CRM API, communication service |
| `/campaigns` | Campaign management | Broker, admin | Template library, performance, enrollment state | Campaign engine, CRM API |
| `/campaigns/builder` | New campaign builder | Broker, admin | Step editor, channel preview, compliance simulation, version notes | Campaign engine, compliance service |
| `/campaigns/builder/[id]` | Edit campaign version | Broker, admin | Versioned editor, test sends, preview, publish controls | Campaign engine, compliance service |
| `/assistant` | Broker assistant workspace | Broker, admin | Lead selector, chat, action chips, proposed actions, timeline context | OpenClaw proxy, Nexus, assistant service, CRM API |
| `/inbox` | Multi-channel communications | Broker, admin | SMS/email/call inbox, replies, assignments, SLA | Communication service, Twilio, SendGrid |
| `/voice` | Polished live voice control | Broker, internal ops | Call session, transcript, TTS/STT controls, handoff | Communication service, Twilio voice, Kyutai/PocketTTS |
| `/tasks` | Daily action queue | Broker, admin | Tasks, follow-ups, approvals, SLA | CRM API, assistant service |
| `/crm` | CRM mirror | Broker, admin | Twenty-backed projections, sync status, deep links | CRM API, Twenty |
| `/documents` | Document workflow | Borrower, broker | Upload status, requested docs, secure links | Document service, storage, CRM |
| `/settings` | Product settings | Admin/internal ops | Env summary, provider status, business rules | Auth, CRM API, provider services |
| `/settings/users` | User/team/role admin | Admin | Users, teams, roles, permissions | Auth service/Supabase |
| `/settings/integrations` | Integration accounts | Admin/internal ops | CRM, Twilio, SendGrid, OpenClaw, Nexus health | Provider adapters |
| `/settings/compliance` | Compliance policy | Admin/compliance | Quiet hours, STOP policy, consent language | Compliance service |
| `/agent-control` | AI control room | Admin, agent-only | Runs, tool approvals, memories, model health | Assistant service, Nexus, Mem0/Letta/OpenMemory |
| `/tools/openclaw` | Raw internal OpenClaw proxy lab | Internal ops, agent-only | Chat proxy test panel | OpenClaw proxy |
| `/tools/health` | Internal system health | Internal ops | Service health matrix, links | Nexus, services, Grafana |

## Borrower Routes

Public unauthenticated borrower routes stay in `apps/ratehunter-landing`.

Authenticated borrower routes should live in the main app when implemented:

| Route | Purpose | Components | Integrations |
| --- | --- | --- | --- |
| `/portal` | Borrower home | Status, next steps, broker contact, assistant | CRM API, assistant service |
| `/portal/quote` | Quote review | Quote cards, explanation, approval/request changes | Quote API, CRM API |
| `/portal/documents` | Documents | Upload status, requested docs, secure upload links | Document service |
| `/portal/messages` | Borrower communication | Threaded messages, appointment links | Communication service |
| `/portal/application` | Loan milestone tracker | Checklist, milestone, missing info | CRM API |

Do not expose internal campaign builder, CRM mirror, agent control, or tool pages to borrower roles.

## Lead Detail Page: Flagship Workspace

`/leads/[id]` should become the product's central object page.

Required modules:

- Header: borrower/contact identity, source, stage, owner, consent/DNC/quiet-hours badges.
- Summary rail: loan purpose, amount, property, credit band, readiness, important warnings.
- Timeline: all inbound/outbound SMS, email, calls, voicemail, quote, document, campaign, assistant, compliance events.
- Campaign panel: current enrollment, next step, pause/resume/stop, reply pause, compliance gate status.
- Quote panel: readiness meter, request quote, latest 3-option quote, send/approval state.
- Communication composer: SMS/email/call actions gated by compliance preflight.
- Docs/tasks panel: missing docs, task queue, broker assignment.
- Assistant sidecar: lead-aware chat, proposed actions, approval cards.
- Audit tab: raw event trail for admin/compliance.

Upstream/downstream:

- Reads lead/contact/application from CRM API.
- Reads/writes timeline through CRM API and communication service.
- Requests quote from quote API.
- Updates campaign state through campaign engine.
- Sends messages through communication service only.
- Invokes assistant through assistant service/OpenClaw proxy.

## Navigation

Use grouped navigation, not one flat row:

- Work: Cockpit, Leads, Pipeline, Applications, Tasks.
- Revenue: Quotes, Campaigns, Inbox.
- Assistant: Assistant, Agent Control.
- Platform: CRM, Settings, Tools.

The nav should adapt by role:

- Broker: Work + Revenue + Assistant.
- Admin: all groups.
- Borrower: portal-specific minimal nav.
- Agent-only/internal ops: Tools and Agent Control.

## API Route Direction

Keep Next.js API routes as BFF/proxy boundaries, not business logic homes:

- `/api/internal/openclaw/*`: server-side proxy to assistant infrastructure.
- `/api/leads/*`: temporary BFF to CRM API; long term should forward to `services/crm-api`.
- `/api/campaigns/*`: BFF to campaign engine.
- `/api/quote/*`: BFF to quote API.
- `/api/webhooks/*`: only when Next.js is explicitly the correct webhook receiver; otherwise use service webhooks.

Rule:

If an API route needs retries, idempotency, provider verification, queueing, or durable audit, move it to a service.
