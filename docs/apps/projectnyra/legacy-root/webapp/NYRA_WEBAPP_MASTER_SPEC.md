# Nyra Webapp Master Spec + Whitepaper + Zero-Question Prompting Plan

## 1) Executive Definition

Nyra Webapp is the broker/customer-facing Mortgage Assistant core. It is responsible for:

- secure conversational guidance,
- lead progression and nurture orchestration,
- quote-request coordination (not quote hallucination),
- compliance-aware communications across SMS/email/voice,
- CRM-first persistence through Twenty CRM.

The webapp is the **product brain surface**; Twenty CRM remains the **system-of-record**.

---

## 2) Product & System Boundaries

### 2.1 Responsibilities (Webapp owns)

- Assistant UX and conversational state machine
- Broker and borrower dashboards
- Task orchestration to internal services
- Retrieval and presentation of compliant next-best-actions
- Workflow trigger contracts to n8n + Activepieces

### 2.2 Responsibilities (Webapp does not own)

- Golden customer record persistence (Twenty CRM owns)
- Rate generation math and official quote documents (Quote Service owns)
- Raw provider operations for delivery channels (communication services + workflow engines own)

### 2.3 Guardrails

- Assistant cannot directly mutate CRM or DB bypassing service boundaries.
- STOP/unsubscribe/reply-pause logic is mandatory pre-send.
- Every outbound message must have audit metadata.

---

## 3) Capability Architecture

### 3.1 Functional Domains

1. **Lead Intake + Qualification**
   - Capture structured mortgage profile
   - Validate missing fields
   - Consent and channel preferences capture
2. **Campaign Intelligence**
   - Drip sequence orchestration
   - Milestone and inactivity triggers
3. **Assistant Orchestration**
   - Tool-safe invocation layer
   - Human handoff and escalation
4. **Compliance Runtime**
   - Consent checks
   - Suppression checks
   - Quiet hours and jurisdiction policy checks
5. **Quote Coordination**
   - Request quote via quote-service
   - Display quote artifacts

### 3.2 Core Integrations

- **n8n**: deterministic workflow routing and webhook choreography
- **Activepieces**: event automation and fallback glue workflows
- **Twilio**: SMS/telephony transport
- **SendGrid**: email transport and event callbacks
- **Kyutai Moshi**: low-latency voice loop for live broker-assistant interactions

---

## 4) Deployment Model

### 4.1 Runtime Topology

- Webapp: Next.js App Router app with API routes and server actions
- Services: `services/*` boundaries for compliance, communication, quote, CRM API
- Workflow engines: n8n + Activepieces as internal automations
- Data authority: Twenty CRM

### 4.2 Environments

- Local: webapp + mock adapters + sandbox Twilio/SendGrid webhooks
- Staging: realistic providers with restricted sends and masked PII
- Production: strict Cloudflare-protected ingress and full audit logging

---

## 5) Data Contracts (High Level)

### 5.1 Lead Envelope

Required fields:

- `leadId`
- `contactChannels` (sms/email/voice)
- `consentStatus`
- `mortgageIntent`
- `timeline`
- `source`
- `crmRecordId`

### 5.2 Message Attempt Envelope

Required fields:

- `messageId`
- `leadId`
- `channel`
- `templateId`
- `complianceDecision` (allow/deny + reason)
- `providerMessageId`
- `workflowExecutionId`
- `timestampUtc`

---

## 6) Whitepaper: Technical Strategy

### 6.1 Why this architecture

- Keeps UI velocity high while preserving compliance and CRM integrity.
- Separates product-facing logic from provider and automation variability.
- Enables autonomous agents to ship features safely via contract-defined boundaries.

### 6.2 Reliability Strategy

- Idempotent workflow triggers (dedupe keys)
- Retry policies with dead-letter queues
- Replay-safe webhook processors
- Synthetic smoke tests for each channel

### 6.3 Security & Compliance Strategy

- PII minimization in logs
- Strict secret handling via env/secret manager
- Policy checks before every outbound transport invocation
- Immutable audit events linked to CRM record IDs

### 6.4 Observability Strategy

- Trace IDs propagated across webapp → workflow engine → provider callback
- Structured logs with channel + lead + campaign dimensions
- Operational dashboards: send success rate, STOP enforcement latency, response SLA

---

## 7) Zero-Question Prompting Plan (Autonomous Agent Ready)

Use this as the baseline agent prompt for implementation tasks.

### 7.1 Context Package

- Product: Mortgage Assistant for brokers and borrowers
- Main apps: Landing, Webapp, Twenty CRM
- Integrations: n8n, Activepieces, Twilio, SendGrid, Kyutai Moshi
- Invariants:
  1. Twenty CRM is source of truth
  2. Compliance checks gate every outbound message
  3. Quote values must come from quote-service only
  4. All communication events are logged with correlation IDs

### 7.2 Execution Rules for Agents

1. Implement smallest safe change with tests
2. Add/update docs for any behavior change
3. Never bypass CRM API boundary
4. Never emit messages before compliance approval
5. Prefer deterministic workflow contracts over ad-hoc logic

### 7.3 Done Criteria for Every Task

- Feature implemented
- Unit/integration tests added or updated
- Lint/typecheck pass
- Docs updated
- Smoke check commands included

### 7.4 Canonical Task Order

1. Define/extend contract types (Zod + TS)
2. Implement server-side business logic
3. Wire UI changes
4. Connect n8n/Activepieces triggers
5. Add Twilio/SendGrid/Moshi adapters
6. Add tests and smoke scripts
7. Update runbook and rollback steps

### 7.5 Prompt Template

"Implement <feature> in Nyra Webapp using existing service boundaries. Enforce consent/quiet-hour/STOP checks before outbound actions. Persist and read lead state only through CRM API contracts. Use n8n or Activepieces only as workflow glue. Include tests, observability fields, and rollback notes."

---

## 8) Workflow Documentation Canon

All workflow specs and examples should be documented under:

- `docs/webapp/workflows/n8n`
- `docs/webapp/workflows/activepieces`

During migration, legacy workflow docs should be copied/adapted from scattered locations and normalized to one schema format.

---

## 9) Three Innovative Ideas for the Unified Nyra Ecosystem

### Idea 1: Compliance Copilot Timeline

A timeline panel that predicts upcoming compliance constraints (quiet hours, consent expiry, jurisdictional windows) and auto-suggests compliant next actions before agents message a lead.

### Idea 2: Multi-Channel Intent Fusion Scoring

Fuse SMS replies, email engagement, and voice-call sentiment into one continuously updated intent score that prioritizes broker tasks and triggers adaptive workflow branches.

### Idea 3: Conversational Quote Readiness Meter

A live readiness score in webapp that tells brokers exactly what data is still missing before quote request, reducing quote failures and back-and-forth.

---

## 10) Migration Checklist (Implementation Pass)

- [ ] Remove legacy references/assets listed in purge target set
- [ ] Consolidate docs into landing/webapp/twenty-crm roots
- [ ] Normalize n8n + Activepieces workflow docs under `docs/webapp/workflows`
- [ ] Refactor scripts with legacy-specific branching
- [ ] Update `.gitignore` and secret hygiene patterns
- [ ] Run full lint/test/smoke validation
