# App Boundaries Decision Document

## Decision

Project Nyra should use one cohesive authenticated main app for product surfaces and separate backend services for risky or provider-specific capabilities.

> Current path note: this guidance originally used `apps/webapp/app`. The active consolidated broker app is now `apps/nyra-webapp`, and the active public landing app is `apps/ratehunter-landing`.

## Main App: `apps/nyra-webapp`

Belongs inside:

- Broker cockpit/dashboard.
- Admin/operator views that are product workflow views.
- Borrower authenticated portal views.
- Leads list and lead detail workspace.
- Applications and loan status.
- Quote request, quote comparison, quote approval workflow.
- Campaign template builder and enrollment controls.
- Communication timeline and inbox UI.
- AI assistant chat and proposed action approval UI.
- Polished voice controls once backed by stable service contracts.
- Memory/agent run read views for admins/internal ops.
- Integration settings and health summaries.
- Tool lab links under `/tools/*`.

Why:

- The broker works record-by-record and needs context continuity.
- Lead, quote, timeline, campaign, and assistant context are one workflow.
- A shared shell reduces product confusion, auth duplication, and design drift.
- Future SaaS packaging benefits from a role-aware app, not separate mini-apps.

Risks:

- Main app can become bloated if raw infra tools are promoted too early.
- Role separation must be strong.
- Backend service boundaries must remain real; the UI must not absorb business logic.

Guardrail:

The main app owns orchestration UX, not source-of-truth persistence or provider execution.

## Separate Public App: `apps/ratehunter-landing`

Belongs outside:

- Public marketing.
- Public borrower lead capture.
- Public contact, Calendly, document upload links, licensing trust content.
- Lightweight borrower chat widget with restricted tools.

Why:

- Different audience, SEO, performance, cache, conversion, auth, and security posture.
- Public app must not carry internal nav, CRM, or provider secrets.
- Cloudflare Pages/static-friendly deployment is appropriate.

Do not split further:

- Do not create separate microsites for every borrower flow until traffic or compliance requires it.

## CRM: Twenty

Belongs outside as system of record:

- Contacts, companies, opportunities, activities.
- Mortgage custom objects where Twenty is the selected persistent owner.
- CRM admin screens and raw CRM configuration.

Belongs inside the main app:

- CRM mirror views.
- Lead/application/quote/timeline projections.
- Deep links to Twenty.
- Health/sync status.

Why:

- The product needs a mortgage-specific workflow shell; Twenty is not that shell.
- Rebuilding CRM admin inside Nyra would waste time.
- Direct DB mutation must stay prohibited.

## Quote Engine

Belongs outside as `services/quote-api`:

- Deterministic loan calculations.
- Rate sheets.
- 3-option quote generation.
- PDF generation.
- Calculation traces and audit records.

Belongs inside the main app:

- Quote request form.
- Quote readiness meter.
- Quote comparison grid.
- Approval/send controls.
- Quote history.

Why:

- Quote logic must be deterministic, testable, auditable, and isolated from UI.
- Assistant and UI must never hallucinate mortgage terms.

Mistake to avoid:

- Do not duplicate quote formulas in React components.

## Campaign Engine

Belongs outside:

- Campaign definitions as versioned records.
- Scheduling and execution state.
- Enrollment state transitions.
- STOP/reply-pause enforcement.
- Workflow engine interaction.

Belongs inside:

- Campaign builder.
- Channel previews.
- Enrollment controls.
- Analytics.
- Compliance simulation.

Why:

- Campaign runtime is high-risk and asynchronous.
- UI needs rich editing, but execution must be service-owned.

Mistake to avoid:

- Do not let n8n or Activepieces become the canonical campaign brain.

## Communication/Voice

Belongs outside:

- Twilio/SendGrid provider adapters.
- Webhook verification.
- Inbound reply processing.
- SMS/email/voice dispatch.
- Recording/transcription/TTS/STT processing.
- Cost/rate limiting.

Belongs inside:

- Inbox.
- Timeline.
- Compose/send UI.
- Call controls.
- Voicemail review.
- Live voice panel after service hardening.

Why:

- Providers are volatile and security-sensitive.
- The product value is the operator surface and audit state, not raw provider plumbing.

Mistake to avoid:

- Do not expose raw media/inference endpoints publicly.

## Assistant, Agents, Memory, and Tooling

Belongs outside:

- Nexus Router.
- OpenClaw Gateway/Studio.
- LiteLLM.
- Mem0/OpenMemory/Letta/FalkorDB/Qdrant.
- Worker model serving.
- Tool execution policy.

Belongs inside:

- Assistant chat.
- Lead-context sidecar.
- Proposed action cards.
- Approval queue.
- Agent run history.
- Memory read/explain views.
- Tool health dashboard.

Why:

- Operators need agent accountability in the product.
- Raw agent infrastructure should remain operational, private, and replaceable.

Mistake to avoid:

- Do not promote every experimental tool page into customer-facing navigation.

## Auth and Tenanting

Belongs outside/behind service boundary:

- Auth provider/runtime.
- Session management.
- RBAC claims.
- Tenant isolation.

Belongs inside:

- User/team/role management UI.
- Access audit.
- Integration account assignment.

Decision:

Use the Oracle VPS Supabase/auth direction already documented unless superseded by a later explicit auth decision.

## Decision Table

| Module | Main app | Separate service | Public app | External dependency | Decision |
| --- | --- | --- | --- | --- | --- |
| Broker dashboard | Yes | No | No | No | Main app |
| Admin/operator workflow | Yes | No | No | No | Main app role area |
| Borrower portal | Yes | No | No | No | Main app role area |
| Public landing | No | No | Yes | No | Separate public app |
| Lead capture form | Partial | Yes | Yes | No | Public UI + ingestion service |
| CRM records | Projection only | CRM API | No | Twenty | Twenty owns |
| Quote calculation | Request/display only | Yes | No | Pricing/rates if added | Quote service owns |
| Campaign builder | Yes | Runtime service | No | n8n/AP as glue | UI in app, runtime in service |
| SMS/email send | Compose UI only | Yes | No | Twilio/SendGrid | Communication service owns |
| Live voice | Control UI only | Yes | No | Twilio/Kyutai/PocketTTS | Service first |
| Assistant chat | Yes | Assistant service/Nexus | Limited widget | OpenClaw/LiteLLM | Main app plus backend |
| Memory management | Read/control UI | Yes | No | Mem0/Letta/etc. | Internal control room |
| Observability | Summary links | Yes | No | Grafana/Loki/etc. | External dashboards plus app status |

## Boundary Rule

If a feature is mostly context, workflow, review, or operator decision-making, it belongs in the main app. If it mutates durable records, sends borrower communications, calculates quotes, schedules automation, routes models, stores memory, or touches provider credentials, it belongs behind a service boundary with the main app as the control surface.
