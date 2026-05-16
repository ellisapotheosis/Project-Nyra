# Build Phases

Path note: this plan was drafted before the app consolidation rename. Read `apps/nyra-webapp` as the internal product shell and `apps/ratehunter-landing` as the public landing app.

## Phase 0: Freeze Architecture and Stop Drift

Goal:

Make the repo agree that `apps/nyra-webapp` is the internal product shell and `apps/ratehunter-landing` is public.

Why now:

The repo already has the direction but still contains duplicate apps and scattered docs.

Deliverables:

- This planning package in `apps/guidance`.
- Deprecation note for `apps/admin/app` as source material.
- Docs index from old guidance to new master plan.
- Route ownership table.

Dependencies:

- None.

Risks:

- Agents continue to patch admin or reference snapshots as if active.

Exit criteria:

- New implementation tasks can identify active target paths without ambiguity.

## Phase 1: Webapp Shell + Design System Normalization

Goal:

Make the internal app feel like one coherent product.

Deliverables:

- `AppShell` with grouped nav and role-aware route metadata.
- Shared `PageHeader`, `MetricStrip`, `StatusBadge`, `ComplianceBadge`, `TimelineShell`.
- Convert `/campaigns` and `/leads/[id]` away from light slate prototype styling.
- Shared token import strategy prepared for `packages/ui`.
- Mock-mode/source badges standardized.

Dependencies:

- Current `apps/nyra-webapp` route map.

Risks:

- Over-refactoring before contracts are stable.

Exit criteria:

- Existing routes render under one shell and token system.
- No internal route looks like a separate product.

## Phase 2: Domain Contracts and CRM Boundary

Goal:

Make the app and services speak the same domain language.

Deliverables:

- Expand `packages/domain-models` with lead, contact, loan scenario, quote, campaign, communication, compliance, timeline, agent action.
- Align `apps/nyra-webapp/lib/api/*` with domain contracts.
- Harden `services/crm-api` as the single app-facing CRM boundary.
- Document Twenty custom object mapping.

Dependencies:

- Phase 1 shell can show source states.

Risks:

- Existing CRM/MCP/GraphQL paths diverge.

Exit criteria:

- Webapp reads lead/application/timeline data through typed CRM API adapters.
- Direct Twenty access is contained to service/adapters.

## Phase 3: Flagship Lead Workspace

Goal:

Build the record page brokers will live in.

Deliverables:

- `/leads/[id]` redesigned as command workspace.
- Profile, timeline, compliance, campaign, quote, documents, tasks, and assistant sidecar.
- Timeline event model with channel filters.
- Action buttons disabled/gated by compliance and permissions.

Dependencies:

- Domain models.
- CRM API boundary.

Risks:

- Trying to wire every provider before the workspace is usable.

Exit criteria:

- Broker can inspect a lead, see context, understand next action, and avoid unsafe sends.

## Phase 4: Campaign Runtime and Builder

Goal:

Turn campaign UI from prototype to production workflow.

Deliverables:

- Versioned campaign schema.
- Campaign builder with steps, channels, templates, guardrails, preview.
- Compliance simulation.
- Enrollment controls on lead workspace.
- Campaign service endpoints for create/update/publish/enroll/pause/resume/stop.
- Tests for STOP/reply/quiet-hours behavior.

Dependencies:

- Compliance contract.
- Communication event schema.

Risks:

- Letting n8n/Activepieces own business state.

Exit criteria:

- Campaign can be built, validated, published, enrolled, paused, stopped, and audited.

## Phase 5: Communication Service and Inbox

Goal:

Normalize borrower communications across SMS, email, voice, and voicemail.

Deliverables:

- `services/communication-service`.
- Twilio and SendGrid adapters.
- Webhook verification and idempotency.
- `/inbox` route.
- Timeline writes for sends, replies, calls, voicemail, failures.
- STOP/unsubscribe/reply-pause integration.

Dependencies:

- Compliance service.
- CRM API.
- Campaign engine.

Risks:

- Provider callbacks mutate state without audit.

Exit criteria:

- Inbound and outbound events appear in timeline with provider IDs and compliance decisions.

## Phase 6: Quote Desk and Borrower Quote Review

Goal:

Make deterministic quoting usable in daily workflow.

Deliverables:

- Quote readiness meter.
- Quote request form tied to lead data.
- Quote comparison grid using `services/quote-api`.
- Quote approval and send flow.
- Quote history in lead workspace.
- PDF/document handoff.
- Golden scenario tests from spreadsheet examples.

Dependencies:

- Quote API.
- CRM API.
- Communication service.

Risks:

- Spreadsheet parity is large; start with minimal deterministic scenario set.

Exit criteria:

- Broker can generate and approve 3-option quote without UI-side math.

## Phase 7: Assistant Action System

Goal:

Make Nyra assistant useful and safe.

Deliverables:

- Assistant service risk model.
- Proposed action cards with payload diff, risk, approval, execution result.
- Lead-aware assistant sidecar.
- Tool approval queue.
- Agent run history.
- Read-only borrower assistant tool scope.

Dependencies:

- CRM, campaign, quote, communication, compliance service contracts.

Risks:

- Assistant bypasses service boundaries or hides risk.

Exit criteria:

- Assistant can summarize, recommend, and propose actions; mutations require approval and audit.

## Phase 8: Voice Productization

Goal:

Promote stable voice capabilities into polished product controls.

Deliverables:

- `/voice` route or embedded voice panel.
- Call state machine.
- Transcript and recording timeline events.
- TTS/STT health indicators.
- Consent/recording policy gate.
- Internal raw audio diagnostics kept under `/tools`.

Dependencies:

- Communication service.
- Twilio voice.
- Kyutai/PocketTTS runtime stability.

Risks:

- Raw voice infra complexity leaks into broker UI.

Exit criteria:

- Broker can place/monitor calls with clear state, consent, transcript, and audit.

## Phase 9: SaaS Hardening

Goal:

Prepare for resale/multi-tenant operation.

Deliverables:

- Tenant model.
- User/team/role management.
- Integration account scoping.
- Audit log UI.
- Deployment/staging/prod runbooks.
- Billing/packaging hooks if needed.

Dependencies:

- Single-tenant product workflows stable.

Risks:

- Premature multi-tenancy slowing core product.

Exit criteria:

- Product can safely onboard another brokerage without code forks.
