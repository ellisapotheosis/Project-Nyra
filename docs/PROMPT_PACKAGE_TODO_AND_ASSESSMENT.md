# 12-Prompt Mortgage Automation Platform — Comprehensive TODO and Assessment

Generated: 2026-05-19
Status: Initial assessment and execution planning

## Executive Summary

The 12-prompt package specifies a complete AI mortgage automation platform with:

- Distributed infrastructure (orchestrator + 3 GPU workers + Oracle VPS)
- AI routing and memory architecture (OpenClaw/Nerve/LiteLLM/Nexus)
- CRM backbone (TwentyCRM as system-of-record)
- Mortgage quote engine (deterministic math)
- Campaign automation (Twilio/SendGrid + n8n/Activepieces)
- Backend APIs and webhooks (shared contracts)
- Security/auth/compliance (Infisical/Tailscale/Zero Trust)
- Admin webapp (non-visual behavior specified)
- DevOps tooling (Gitea/WaveTerm/Zellij/Paperclip)
- Testing and observability (health checks, contract tests, telemetry)
- Integration and synthesis (final reconciliation)

## Prompt Dependency Map

```
Prompt 01 (Foundation)
  ├─ Prompt 02 (AI Routing/Memory)
  │  ├─ Prompt 07 (Backend APIs)
  │  │  ├─ Prompt 03 (CRM)
  │  │  ├─ Prompt 04 (Quote Engine)
  │  │  ├─ Prompt 05 (Campaigns)
  │  │  ├─ Prompt 06 (Workflow Automation)
  │  │  └─ Prompt 09 (Admin Portal)
  │  │
  │  ├─ Prompt 08 (Auth/Security)
  │  ├─ Prompt 10 (DevOps)
  │  └─ Prompt 11 (Testing/Observability)
  │
  └─ Prompt 12 (Final Integration) — depends on 1-11 completion

Critical path: 01 → 02 → 03/04/05/06/07 → 08/09/10/11 → 12
```

## Prompt-by-Prompt Assessment

### PROMPT 01 — Foundation, Repo, Environment, Architecture

**Purpose**: Create or validate base infrastructure plan and repo scaffolding

**Required Outputs**:

- [ ] Validated host/topology documentation (`/infra/host-layout.yaml` or similar)
- [ ] Health check scripts and patterns (`/infra/scripts/health-check.sh`)
- [ ] Network assumptions documented
- [ ] Makefile with standard targets (health, deploy, logs, etc.)
- [ ] README_SETUP.md with deployment commands
- [ ] Strict hostname enforcement (orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, oracle-vps)
- [ ] Docker Compose structure per host (already exists: `infra/hosts/{host}/docker-compose.yml`)
- [ ] Cloudflare Pages `.gitmodules` fix for `external/openclaw-n8n-stack`

**Current Repo Status**: ~40% complete

- ✅ Host directories exist and are in use (orchestrator, oracle-vps, 3 workers)
- ✅ Makefile exists but may need health/deploy targets
- ✅ Docker Compose overlays are extensive
- ❌ No centralized health-check.sh
- ❌ No network-map.sh or topology documentation
- ❌ README_SETUP.md not found
- ❌ .gitmodules issue with external/openclaw-n8n-stack (known from audit)

**Priority**: CRITICAL — Foundation for all downstream work

---

### PROMPT 02 — AI Agent Stack, Model Routing, MCP, Memory

**Purpose**: Consolidate AI routing (OpenClaw/Nerve/LiteLLM) and memory architecture

**Required Outputs**:

- [ ] OpenClaw deployment (model-agnostic, on orchestrator)
- [ ] Nerve UI cockpit configuration
- [ ] LiteLLM configuration with local GPU endpoint routing
- [ ] Nexus/Hive-style MCP router at `http://100.64.0.10:4000/mcp/sse`
- [ ] ClawTeam server setup
- [ ] vLLM endpoints configured on worker-rtx5090, worker-rtx3090ti
- [ ] Memory architecture decision (Letta vs Mem0/FalkorDB)
- [ ] Memory tier documentation (session, conversation, persistent)
- [ ] MCP tool aggregation and fuzzy search capability

**Current Repo Status**: ~30% complete

- ❌ OpenClaw not yet integrated (referenced but not deployed)
- ❌ Nerve UI not deployed
- ❌ LiteLLM configuration sparse
- ❌ Nexus/Hive MCP router not found
- ❌ Memory architecture conflict unresolved (Letta vs Mem0)
- ✅ Docker Compose overlays reference GPU worker endpoints
- ✅ Project memory shows awareness of memory tiers

**Priority**: HIGH — Blocks all agent-dependent workflows (Prompts 3-7)

---

### PROMPT 03 — CRM, TwentyCRM, Lead Ingestion

**Purpose**: Build CRM/data backbone with Contact, Loan, Campaign, Quote, LeadSource objects

**Required Outputs**:

- [ ] TwentyCRM schema extension (custom fields for mortgage domain)
- [ ] Lead ingestion API specification
- [ ] Contact/Borrower object model
- [ ] Loan/LoanScenario object model
- [ ] CampaignEnrollment object model
- [ ] CommunicationLog object model
- [ ] Quote object model
- [ ] LeadSource/LeadEvent tracking
- [ ] Inbound email/LeadMailbox integration
- [ ] CRM sync validation tests

**Current Repo Status**: ~20% complete

- ✅ TwentyCRM is deployed (compose references)
- ❌ Custom mortgage schema not documented
- ❌ Lead ingestion API not specified
- ❌ CRM sync tests not found
- ❌ LeadSource/LeadEvent tracking not visible

**Priority**: HIGH — Core data backbone

---

### PROMPT 04 — Mortgage Quote Engine

**Purpose**: Deterministic quote math service (3-option comparison, validation)

**Required Outputs**:

- [ ] Quote service implementation (Node.js/Express or documented pattern)
- [ ] Quote calculation logic (P&I, taxes, insurance, HOA, PMI, total payment)
- [ ] Input validation (reject impossible values)
- [ ] 3-option output (standard, buy-down, lender-credit)
- [ ] `/health` endpoint
- [ ] `/api/v1/quote` endpoint
- [ ] Structured JSON response
- [ ] Edge case tests (0% interest, PMI threshold, bad inputs)
- [ ] PDF/export capability

**Current Repo Status**: ~25% complete

- ❌ Quote service not located
- ❌ Quote calculation tests missing
- ❌ 3-option comparison logic not visible
- ⚠️ Quote logic may exist in n8n workflows (not yet verified)

**Priority**: HIGH — Revenue-critical business logic

---

### PROMPT 05 — Communications, Campaigns, Twilio/SendGrid

**Purpose**: SMS/email templates, drip campaigns, auto-stop-on-reply, CRM sync

**Required Outputs**:

- [ ] Campaign template library (7-day, 30-day, 45-60 day nurture, rate alert, re-engagement)
- [ ] Twilio SMS integration (inbound/outbound, STOP/opt-out handling)
- [ ] SendGrid email integration (opens, clicks, bounces, unsubscribes)
- [ ] Reply detection and campaign pause logic
- [ ] Opt-out/STOP compliance enforcement
- [ ] Multi-channel orchestration (SMS + email)
- [ ] Campaign enrollment workflow
- [ ] CRM sync for campaign state
- [ ] Reply inbox unified surface

**Current Repo Status**: ~20% complete

- ✅ Twilio/SendGrid credentials referenced (Infisical)
- ✅ Campaign template data file exists (`data/campaign-templates.json`)
- ❌ Campaign pause-on-reply logic not visible
- ❌ Reply detection and STOP handling not implemented
- ❌ Unified inbox not found

**Priority**: HIGH — Revenue-critical, compliance-heavy

---

### PROMPT 06 — Workflow Automation (n8n/Activepieces/Composio)

**Purpose**: Division of labor between automation engines

**Required Outputs**:

- [ ] n8n deployment (heavy logic, complex transformations, webhook-driven)
- [ ] Activepieces deployment (light triggers, quick integrations)
- [ ] Composio integration (OAuth/SaaS bridges: Slack, Gmail, Jira, etc.)
- [ ] n8n workflow templates (lead normalization, campaign execution, sync)
- [ ] Activepieces trigger specifications
- [ ] Custom campaign builder specification (JSON → n8n webhook)
- [ ] Workflow error handling and retry logic
- [ ] Audit logging for automations

**Current Repo Status**: ~50% complete

- ✅ n8n is deployed (compose references, ports configured)
- ✅ Activepieces referenced
- ❌ Composio integration not visible
- ❌ Custom campaign builder not implemented
- ❌ Workflow templates sparse or internal to n8n

**Priority**: HIGH — Core automation engine

---

### PROMPT 07 — Backend APIs, Webhooks, Service Contracts

**Purpose**: Shared API contracts for all services

**Required Outputs**:

- [ ] Lead ingestion API (`POST /api/v1/leads`)
- [ ] Quote API (`POST /api/v1/quotes`)
- [ ] Campaign API (`POST /api/v1/campaigns`)
- [ ] Webhook handlers (Twilio, SendGrid, n8n, Activepieces)
- [ ] Service-to-service contracts (CRM sync, state updates)
- [ ] Unified inbox API
- [ ] Health aggregation API
- [ ] OpenAPI/Swagger documentation
- [ ] Request/response validation (Zod, TypeBox, etc.)
- [ ] Error response standards

**Current Repo Status**: ~15% complete

- ❌ Centralized API layer not yet visible
- ❌ OpenAPI docs missing
- ❌ Webhook handler standardization missing
- ⚠️ May exist in scattered services (need inventory)

**Priority**: HIGH — Integration surface for all services

---

### PROMPT 08 — Auth, Security, Secrets, Compliance, Audit Logging

**Purpose**: Harden around secrets, borrower data, admin access

**Required Outputs**:

- [ ] Infisical integration (secret injection for all services)
- [ ] Cloudflare Zero Trust setup documentation
- [ ] Tailscale network trust model
- [ ] Admin webapp authentication (MFA, session management)
- [ ] Borrower PII protection (encryption at rest, in transit)
- [ ] Audit logging (all mutations, admin actions, campaign sends)
- [ ] Least-privilege agent tool restrictions
- [ ] Data classification (public, internal, sensitive, PII)
- [ ] Compliance validation hooks (TILA, RESPA, TRID, state regs)
- [ ] Secret rotation procedures

**Current Repo Status**: ~30% complete

- ✅ Infisical referenced extensively
- ✅ Cloudflare tunnel/Zero Trust in use
- ✅ Tailscale network mentioned
- ❌ Audit logging framework not visible
- ❌ Compliance validation hooks missing
- ❌ PII encryption strategy not documented
- ❌ Admin auth not yet implemented

**Priority**: CRITICAL — Compliance and risk management

---

### PROMPT 09 — Admin Portal Behavior (Non-Visual)

**Purpose**: Webapp routes, data loaders, actions, health surfaces (no final UI design)

**Required Outputs**:

- [ ] Route specification (`/dashboard`, `/leads`, `/campaigns`, `/quotes`, `/inbox`, etc.)
- [ ] Data loader contracts (how data is fetched and validated)
- [ ] Server action specifications (create campaign, pause campaign, enroll lead, etc.)
- [ ] Permission model (role-based access)
- [ ] Lead cockpit behavior (detail view, timeline, actions)
- [ ] Campaign builder behavior (configuration, validation, scheduling)
- [ ] Quote desk behavior (request, calculation, presentation)
- [ ] Unified inbox behavior (reply detection, categorization)
- [ ] Health aggregation dashboard (service status, error rates)
- [ ] Next.js app structure

**Current Repo Status**: ~25% complete

- ✅ App directory exists (`apps/nyra-admin` or similar)
- ✅ Some page structure in place
- ❌ Data loader patterns not standardized
- ❌ Server action contracts not documented
- ❌ Health aggregation surface missing
- ❌ Permission model not visible
- ❌ Final route map missing

**Priority**: MEDIUM-HIGH — User-facing surface (non-blocking since UI design is quarantined)

---

### PROMPT 10 — DevOps, Gitea, WaveTerm, Operator Tooling

**Purpose**: Developer/operator cockpit: Gitea, AI reviewer, WaveTerm, Paperclip

**Required Outputs**:

- [ ] Gitea local mirror setup (HTTP 3100, SSH 2222)
- [ ] Gitea AI reviewer webhook (`/webhook/gitea`)
- [ ] WaveTerm/Wave terminal command deck
- [ ] Zellij layouts (agent panes, worker SSH panes)
- [ ] Paperclip strategy/ticket dashboard
- [ ] Sentry-to-Paperclip auto-ticketing
- [ ] SearXNG local search
- [ ] Browserless headless scraping
- [ ] Lazydocker integration
- [ ] Process monitoring dashboard

**Current Repo Status**: ~20% complete

- ✅ Gitea is deployed
- ✅ Paperclip referenced
- ❌ AI reviewer webhook not integrated
- ❌ WaveTerm command deck not configured
- ❌ Zellij layouts not visible
- ❌ SearXNG/Browserless not clearly deployed
- ❌ Sentry-to-Paperclip automation missing

**Priority**: LOW-MEDIUM — Developer experience (doesn't block revenue)

---

### PROMPT 11 — Testing, Observability, Deployment, Hardening

**Purpose**: Validation, health checks, observability, backup/restore, hardening

**Required Outputs**:

- [ ] Health check matrix (every service)
- [ ] Contract tests (API endpoints, webhooks)
- [ ] Quote math validation tests
- [ ] Campaign stop-condition tests
- [ ] Docker Compose validation per host
- [ ] CI/Gitea Actions setup
- [ ] Sentry error capture integration
- [ ] Langfuse/Phoenix/OTLP observability
- [ ] Backup and restore procedures
- [ ] Rollback runbook
- [ ] Load test baseline
- [ ] Security hardening checklist

**Current Repo Status**: ~30% complete

- ✅ Docker Compose overlays extensive (validation partly done)
- ✅ Project memory mentions testing framework (vitest, playwright)
- ❌ Health check coverage incomplete
- ❌ Contract tests sparse
- ❌ Sentry integration not verified
- ❌ Backup/restore procedures missing
- ❌ Hardening checklist not comprehensive

**Priority**: MEDIUM — Reliability and observability

---

### PROMPT 12 — Final Integration and System Synthesis

**Purpose**: Synthesize outputs from 1-11, resolve conflicts, produce integrated plan

**Expected Inputs**: Outputs from Prompts 1-11

**Required Outputs**:

- [ ] Integrated architecture diagram (all systems mapped)
- [ ] Conflict resolution decisions (esp. Letta vs Mem0)
- [ ] Prioritized execution roadmap
- [ ] Dependency graph with safe first steps
- [ ] Risk assessment
- [ ] Next agent handoff instructions
- [ ] Acceptance criteria for each prompt's completion

**Current Repo Status**: 0% — Cannot begin without 1-11 completion

**Priority**: FINAL STAGE — Synthesis only after foundation work

---

## Consolidated TODO List (Prioritized by Criticality and Dependency)

### Phase 1: Foundation (Prompts 01-02) — CRITICAL

These must be done first; they unblock all downstream work.

#### Prompt 01 Tasks

- [ ] 01.1 Create `/infra/scripts/health-check.sh` — validate all 5 hosts are reachable and services healthy
- [ ] 01.2 Create `/infra/scripts/network-map.sh` — document network topology and trust model
- [ ] 01.3 Create `docs/INFRASTRUCTURE_REFERENCE.md` — document host placement, services per host, port allocation
- [ ] 01.4 Fix `.gitmodules` for `external/openclaw-n8n-stack` — resolve Cloudflare Pages missing URL issue
- [ ] 01.5 Create/update `README_SETUP.md` with:
  - [ ] 01.5a Prerequisites (Docker, Tailscale, credentials)
  - [ ] 01.5b Host initialization (orchestrator, workers, oracle)
  - [ ] 01.5c Service startup sequence
  - [ ] 01.5d Validation commands
- [ ] 01.6 Update `Makefile` with targets: `health`, `deploy`, `logs`, `rollback`, `test-infra`

#### Prompt 02 Tasks

- [ ] 02.1 Document memory architecture decision (Letta vs Mem0/FalkorDB) — CREATE `docs/MEMORY_ARCHITECTURE_DECISION.md`
- [ ] 02.2 Deploy/document OpenClaw on orchestrator
  - [ ] 02.2a OpenClaw Docker Compose overlay
  - [ ] 02.2b Model-agnostic routing configuration
  - [ ] 02.2c Health check
- [ ] 02.3 Deploy/document Nerve UI (cockpit over OpenClaw sessions)
- [ ] 02.4 Configure LiteLLM routing:
  - [ ] 02.4a Route local tasks to worker GPU endpoints (vLLM)
  - [ ] 02.4b Fallback to cloud providers (DeepSeek, Claude Sonnet)
  - [ ] 02.4c Cost tracking
- [ ] 02.5 Implement Nexus/Hive MCP router:
  - [ ] 02.5a Endpoint at `http://100.64.0.10:4000/mcp/sse`
  - [ ] 02.5b Tool aggregation and semantic search
  - [ ] 02.5c Authorization token pattern (Bearer token + Hive headers)
- [ ] 02.6 Deploy vLLM endpoints on workers
  - [ ] 02.6a worker-rtx5090 (primary, heavy reasoning)
  - [ ] 02.6b worker-rtx3090ti (secondary, steady-state)
  - [ ] 02.6c worker-rtx3060 (embeddings, small models)
- [ ] 02.7 Document memory system (Letta optional, Mem0/FalkorDB as data substrate, Postgres as durable system-of-record)
- [ ] 02.8 ClawTeam server setup (if needed for multi-agent coordination)

### Phase 2: Core Data & Mortgage Logic (Prompts 03-04) — HIGH PRIORITY

These are the revenue-critical business logic. Can be done in parallel with Phase 1 completion.

#### Prompt 03 Tasks (CRM)

- [ ] 03.1 Extend TwentyCRM schema with mortgage-specific objects
  - [ ] 03.1a Contact/Borrower (name, email, phone, address, credit score, income)
  - [ ] 03.1b Loan/LoanScenario (loan amount, property value, down payment, term, rate, scenario variants)
  - [ ] 03.1c CampaignEnrollment (enrollment date, campaign ID, status, pause reason)
  - [ ] 03.1d CommunicationLog (type: SMS/email/call, timestamp, direction, status)
  - [ ] 03.1e Quote (loan ID, monthly payment, 3 options, created date)
  - [ ] 03.1f LeadSource/LeadEvent (source, touchpoint, timestamp)
  - [ ] 03.1g InboxEvent/ReplyEvent (inbound SMS/email, sentiment, campaign pause trigger)
  - [ ] 03.1h Suppression/OptOut (reason, timestamp, channels opted out)
- [ ] 03.2 Create CRM API wrapper (`services/crm-api` or similar)
  - [ ] 03.2a Contact CRUD + search
  - [ ] 03.2b Lead ingestion (`POST /api/v1/leads`)
  - [ ] 03.2c CRM sync interface (used by campaigns, quote engine, automations)
- [ ] 03.3 Implement lead ingestion channels
  - [ ] 03.3a Landing form → CRM
  - [ ] 03.3b API/webhook ingestion
  - [ ] 03.3c Email/LeadMailbox ingestion
  - [ ] 03.3d Manual entry
  - [ ] 03.3e Future: LendingPad/provider sync
- [ ] 03.4 Create CRM sync validation tests
  - [ ] 03.4a Lead creation tests
  - [ ] 03.4b Field validation
  - [ ] 03.4c Sync error handling
- [ ] 03.5 Document pipeline stages: inquiry → pre-qualified → pre-approved → application → processing → clear-to-close → closed/denied

#### Prompt 04 Tasks (Quote Engine)

- [ ] 04.1 Implement quote service
  - [ ] 04.1a Node.js/Express service or serverless function
  - [ ] 04.1b P&I calculation (principal + interest per loan term)
  - [ ] 04.1c Property tax estimation
  - [ ] 04.1d Homeowner insurance estimation
  - [ ] 04.1e HOA estimation (if applicable)
  - [ ] 04.1f PMI calculation (if LTV > threshold)
  - [ ] 04.1g Total monthly payment aggregation
  - [ ] 04.1h Total interest over loan term
- [ ] 04.2 Implement input validation
  - [ ] 04.2a Reject down payment ≥ property value
  - [ ] 04.2b Reject negative or zero loan terms
  - [ ] 04.2c Reject impossible rates/terms
  - [ ] 04.2d Validate LTV
- [ ] 04.3 Implement 3-option comparison
  - [ ] 04.3a Option 1: Standard/par rate
  - [ ] 04.3b Option 2: Buy-down (1% rate reduction via upfront cost)
  - [ ] 04.3c Option 3: Lender credit (lender pays costs, rate increases)
- [ ] 04.4 Create endpoints
  - [ ] 04.4a `/health` — service health
  - [ ] 04.4b `/api/v1/quote` — quote calculation
- [ ] 04.5 Add edge case tests
  - [ ] 04.5a 0% interest edge case
  - [ ] 04.5b PMI threshold tests
  - [ ] 04.5c Bad input rejection
  - [ ] 04.5d 3-option consistency validation
- [ ] 04.6 Add PDF/export capability (used by campaigns, email sends)
- [ ] 04.7 Document as educational/indicative (not binding commitments)

### Phase 3: Communication & Automation (Prompts 05-06) — HIGH PRIORITY

Revenue-critical campaigns and workflow automation.

#### Prompt 05 Tasks (Campaigns)

- [ ] 05.1 Create campaign template library
  - [ ] 05.1a New Lead Nurture (7-day, every 2 days)
  - [ ] 05.1b Pre-Approval Follow-Up (30-day, varied frequency)
  - [ ] 05.1c Application-in-Progress (weekly check-ins)
  - [ ] 05.1d Post-Close Delight (12-month review/referral)
  - [ ] 05.1e Rate Alert (market/event-driven)
  - [ ] 05.1f Re-Engagement (21-day, escalating)
  - [ ] 05.1g Long nurture (45-60 day, low frequency)
- [ ] 05.2 Implement Twilio SMS integration
  - [ ] 05.2a Outbound SMS via Twilio API
  - [ ] 05.2b Inbound SMS webhook handler
  - [ ] 05.2c STOP/opt-out compliance (auto-pause campaign, log suppression)
  - [ ] 05.2d Conversation threading
- [ ] 05.3 Implement SendGrid email integration
  - [ ] 05.3a Outbound email via SendGrid API
  - [ ] 05.3b Open/click tracking webhook
  - [ ] 05.3c Bounce/complaint handling
  - [ ] 05.3d Unsubscribe compliance
  - [ ] 05.3e List management
- [ ] 05.4 Implement reply detection and campaign pause
  - [ ] 05.4a Detect inbound SMS replies
  - [ ] 05.4b Detect inbound email replies
  - [ ] 05.4c Pause active campaign on first reply
  - [ ] 05.4d Create reply inbox event
  - [ ] 05.4e Sentiment detection (if AI-enhanced)
- [ ] 05.5 Implement opt-out enforcement
  - [ ] 05.5a Suppress contacts who reply STOP
  - [ ] 05.5b Suppress contacts who unsubscribe (email)
  - [ ] 05.5c Suppress list persistence (no re-enrollment without explicit opt-in)
  - [ ] 05.5d Audit logging
- [ ] 05.6 Implement multi-channel orchestration
  - [ ] 05.6a SMS + email coordination (no duplicate messaging within 2 hours)
  - [ ] 05.6b Channel-specific templates
- [ ] 05.7 Implement campaign enrollment workflow
  - [ ] 05.7a Trigger enrollment on lead creation
  - [ ] 05.7b Enrollment validation
  - [ ] 05.7c Schedule first message
- [ ] 05.8 Implement CRM sync for campaign state
  - [ ] 05.8a Update CampaignEnrollment status
  - [ ] 05.8b Log all sends to CommunicationLog
  - [ ] 05.8c Sync replies back to CRM
- [ ] 05.9 Build unified inbox for all inbound messages
  - [ ] 05.9a Aggregated SMS + email
  - [ ] 05.9b Categorization (reply, bounce, complaint, etc.)
  - [ ] 05.9c Lead lookup and context
  - [ ] 05.9d Quick-reply actions

#### Prompt 06 Tasks (Workflow Automation)

- [ ] 06.1 Document automation division of labor:
  - [ ] 06.1a n8n: heavy logic, transformations, complex branching
  - [ ] 06.1b Activepieces: light triggers, quick integrations
  - [ ] 06.1c Composio: OAuth/SaaS bridges (Slack, Gmail, etc.)
- [ ] 06.2 Ensure n8n deployment
  - [ ] 06.2a Verify n8n running on oracle-vps (port 5678)
  - [ ] 06.2b n8n database (postgres or internal)
  - [ ] 06.2c Health check
- [ ] 06.3 Ensure Activepieces deployment
  - [ ] 06.3a Verify Activepieces running (if separate from n8n)
  - [ ] 06.3b Trigger library (webhook, schedule, manual)
- [ ] 06.4 Implement core n8n workflows
  - [ ] 06.4a Lead normalization (parse inbound, standardize fields)
  - [ ] 06.4b Campaign execution (read n8n webhook config, trigger sends via Twilio/SendGrid)
  - [ ] 06.4c CRM sync (sync campaign state, communication logs)
  - [ ] 06.4d Reply processing (detect reply, pause campaign, notify inbox)
- [ ] 06.5 Integrate Composio for SaaS actions
  - [ ] 06.5a Gmail read/send (for email leads, future expansion)
  - [ ] 06.5b Slack notifications (error alerts)
  - [ ] 06.5c Jira/Paperclip integration (ticket creation for errors)
- [ ] 06.6 Implement custom campaign builder
  - [ ] 06.6a JSON schema for campaign config (steps, conditions, sends)
  - [ ] 06.6b Webapp campaign builder UI (non-visual behavior specified in Prompt 09)
  - [ ] 06.6c Webhook to n8n to trigger campaign execution
  - [ ] 06.6d Validation (start date < end date, at least one message, etc.)
- [ ] 06.7 Implement workflow error handling
  - [ ] 06.7a Retry logic (exponential backoff)
  - [ ] 06.7b Dead-letter queue for failed sends
  - [ ] 06.7c Error notifications to Sentry
- [ ] 06.8 Implement audit logging
  - [ ] 06.8a Every send logged with timestamp, recipient, template, result
  - [ ] 06.8b Every workflow execution logged

### Phase 4: Backend Integration Layer (Prompt 07) — HIGH PRIORITY

Shared API contracts that everything else depends on.

#### Prompt 07 Tasks (APIs & Webhooks)

- [ ] 07.1 Create lead ingestion API
  - [ ] 07.1a POST `/api/v1/leads` — create/update lead
  - [ ] 07.1b Request schema (name, email, phone, property value, down payment, loan amount)
  - [ ] 07.1c Response (lead ID, CRM contact ID, campaign enrollment ID)
  - [ ] 07.1d Error handling (validation, duplicate detection)
- [ ] 07.2 Create quote API
  - [ ] 07.2a POST `/api/v1/quotes` — calculate quote
  - [ ] 07.2b Request schema (property value, down payment, loan amount, term, rate)
  - [ ] 07.2c Response schema (3-option comparison, monthly payment, total interest)
  - [ ] 07.2d Validation
- [ ] 07.3 Create campaign API
  - [ ] 07.3a POST `/api/v1/campaigns` — create campaign
  - [ ] 07.3b GET `/api/v1/campaigns/{id}` — read campaign
  - [ ] 07.3c PUT `/api/v1/campaigns/{id}` — update campaign
  - [ ] 07.3d POST `/api/v1/campaigns/{id}/pause` — pause campaign
  - [ ] 07.3e GET `/api/v1/campaigns/{id}/status` — campaign status
- [ ] 07.4 Create webhook handlers
  - [ ] 07.4a Twilio SMS inbound (`POST /webhooks/twilio/sms`)
  - [ ] 07.4b SendGrid events (`POST /webhooks/sendgrid/events`)
  - [ ] 07.4c n8n webhook notification (`POST /webhooks/n8n/notify`)
  - [ ] 07.4d Activepieces trigger (`POST /webhooks/activepieces`)
- [ ] 07.5 Create unified inbox API
  - [ ] 07.5a GET `/api/v1/inbox` — list inbound messages
  - [ ] 07.5b GET `/api/v1/inbox/{id}` — message detail
  - [ ] 07.5c POST `/api/v1/inbox/{id}/reply` — quick reply
  - [ ] 07.5d POST `/api/v1/inbox/{id}/resolve` — mark resolved
- [ ] 07.6 Create health aggregation API
  - [ ] 07.6a GET `/api/v1/health` — system health (all services)
  - [ ] 07.6b GET `/api/v1/health/services` — per-service status
  - [ ] 07.6c Timeout and error count tracking
- [ ] 07.7 Create OpenAPI/Swagger documentation
  - [ ] 07.7a Complete API specification
  - [ ] 07.7b Example requests/responses
  - [ ] 07.7c Error codes and meanings
- [ ] 07.8 Implement request/response validation
  - [ ] 07.8a Use Zod, TypeBox, or similar
  - [ ] 07.8b Standardized error responses
  - [ ] 07.8c Type-safe client generation (OpenAPI → TypeScript)
- [ ] 07.9 Create service-to-service contract specs
  - [ ] 07.9a CRM sync events and acknowledgments
  - [ ] 07.9b Campaign state propagation
  - [ ] 07.9c Idempotency requirements

### Phase 5: Security & Compliance (Prompt 08) — CRITICAL

Hard requirements for borrower data protection and regulatory compliance.

#### Prompt 08 Tasks (Auth/Security/Compliance)

- [ ] 08.1 Infisical integration
  - [ ] 08.1a Document required secrets (API keys, DB passwords, JWT secrets, Twilio/SendGrid tokens)
  - [ ] 08.1b Infisical folders per environment (dev, staging, prod)
  - [ ] 08.1c Secret injection into Docker Compose (environment block)
  - [ ] 08.1d Secret rotation policy (quarterly minimum for API keys)
- [ ] 08.2 Cloudflare Zero Trust setup
  - [ ] 08.2a Admin webapp behind Cloudflare Access
  - [ ] 08.2b n8n/Activepieces protected by auth token
  - [ ] 08.2c Internal API endpoints protected
- [ ] 08.3 Tailscale network trust model
  - [ ] 08.3a Document which services are Tailscale-only
  - [ ] 08.3b Document which services are public/Cloudflare-protected
  - [ ] 08.3c ACL policy per service
- [ ] 08.4 Implement admin authentication
  - [ ] 08.4a OAuth provider (Google, GitHub, or OIDC)
  - [ ] 08.4b MFA requirement (TOTP)
  - [ ] 08.4c Session management (expires in 8 hours)
  - [ ] 08.4d Password policy (if password-based)
- [ ] 08.5 Implement borrower PII protection
  - [ ] 08.5a Encryption at rest (TwentyCRM database)
  - [ ] 08.5b Encryption in transit (HTTPS for all APIs)
  - [ ] 08.5c Data classification schema (public, internal, sensitive, PII)
  - [ ] 08.5d Access controls (staff view full SSN only on approval)
  - [ ] 08.5e Anonymization for logs/debugging
- [ ] 08.6 Implement audit logging
  - [ ] 08.6a Log all mutations (create/update/delete in CRM, campaigns, quotes)
  - [ ] 08.6b Log all admin actions (login, campaign pause, lead update)
  - [ ] 08.6c Log all campaign sends (timestamp, recipient, template, result)
  - [ ] 08.6d Immutable audit log (append-only database or sidecar)
  - [ ] 08.6e Query audit logs for compliance checks
- [ ] 08.7 Implement compliance validation hooks
  - [ ] 08.7a TILA (Truth in Lending Act) — include APR, finance charges
  - [ ] 08.7b RESPA (Real Estate Settlement Procedures Act) — no kickbacks, proper disclosures
  - [ ] 08.7c TRID (Integrated Disclosure) — Closing Disclosure form
  - [ ] 08.7d State regulations (interest rate caps, escrow requirements)
  - [ ] 08.7e CAN-SPAM (email marketing compliance)
  - [ ] 08.7f TCPA (Telephone Consumer Protection Act) — consent tracking for SMS
- [ ] 08.8 Implement least-privilege agent tool restrictions
  - [ ] 08.8a Document which OpenClaw agents can call which APIs
  - [ ] 08.8b Implement per-agent API scopes (no agent can call all APIs)
  - [ ] 08.8c Rate limits per agent (prevent runaway loops)
  - [ ] 08.8d Audit logs for all agent API calls
- [ ] 08.9 Implement secret rotation procedures
  - [ ] 08.9a Scheduled rotation (quarterly for API keys)
  - [ ] 08.9b Zero-downtime rotation (dual-key validation period)
  - [ ] 08.9c Rotation notifications and status tracking

### Phase 6: User-Facing Systems (Prompts 09-10) — MEDIUM PRIORITY

Non-blocking for core revenue functionality, but needed for operator experience.

#### Prompt 09 Tasks (Admin Portal Behavior)

- [ ] 09.1 Define route map (non-visual)
  - [ ] 09.1a `/dashboard` — overview, key metrics
  - [ ] 09.1b `/leads` — lead list, search
  - [ ] 09.1c `/leads/{id}` — lead detail, timeline, actions
  - [ ] 09.1d `/campaigns` — campaign list, status
  - [ ] 09.1e `/campaigns/new` — campaign builder
  - [ ] 09.1f `/campaigns/{id}` — campaign detail, messages sent, performance
  - [ ] 09.1g `/campaigns/{id}/pause` — pause campaign
  - [ ] 09.1h `/quotes` — quote list, search
  - [ ] 09.1i `/quotes/{id}` — quote detail, 3 options, export
  - [ ] 09.1j `/inbox` — unified inbox, replies and inbound
  - [ ] 09.1k `/integrations` — tool dashboard, API keys, status
  - [ ] 09.1l `/health` — system health, service status
  - [ ] 09.1m `/audit-logs` — audit log search and export
- [ ] 09.2 Define data loader contracts
  - [ ] 09.2a Lead list loader (pagination, search, filtering)
  - [ ] 09.2b Lead detail loader (with related campaigns, quotes, communication history)
  - [ ] 09.2c Campaign list loader
  - [ ] 09.2d Campaign detail loader (with message schedule, performance metrics)
  - [ ] 09.2e Inbox loader (with pagination, filtering, lead lookup)
  - [ ] 09.2f Health dashboard loader (aggregated service status)
- [ ] 09.3 Define server action contracts
  - [ ] 09.3a Create campaign (`createCampaign(config)`)
  - [ ] 09.3b Update campaign (`updateCampaign(id, config)`)
  - [ ] 09.3c Pause campaign (`pauseCampaign(id, reason)`)
  - [ ] 09.3d Resume campaign (`resumeCampaign(id)`)
  - [ ] 09.3e Enroll lead in campaign (`enrollLeadInCampaign(leadId, campaignId)`)
  - [ ] 09.3f Quote request (`requestQuote(leadId, loanAmount, ...)`)
  - [ ] 09.3g Reply to inbox message (`replyToInbox(inboxId, message)`)
  - [ ] 09.3h Pause inbound campaign on reply (`pauseOnReply(inboxId)`)
- [ ] 09.4 Define permission model
  - [ ] 09.4a Admin (full access)
  - [ ] 09.4b Broker (can view leads, campaigns, quotes; cannot modify settings)
  - [ ] 09.4c Operator (read-only dashboard)
  - [ ] 09.4d API (service account for automations)
- [ ] 09.5 Define lead cockpit behavior
  - [ ] 09.5a Detail view (all borrower fields from CRM)
  - [ ] 09.5b Timeline (all events: lead source, quotes, campaign enrollments, replies)
  - [ ] 09.5c Quick actions (quote, pause campaign, send email, etc.)
  - [ ] 09.5d Linked records (active campaigns, recent quotes, latest communication)
- [ ] 09.6 Define campaign builder behavior (non-visual)
  - [ ] 09.6a Configuration schema (name, start date, end date, channels, steps)
  - [ ] 09.6b Step types (delay, send SMS, send email, condition branch, pause on reply)
  - [ ] 09.6c Validation (at least one message, valid date range, etc.)
  - [ ] 09.6d Preview (show schedule and estimated sends)
  - [ ] 09.6e Save to n8n webhook for execution
- [ ] 09.7 Define quote desk behavior
  - [ ] 09.7a Quote request form (loan amount, property value, etc.)
  - [ ] 09.7b Quote calculation and display (3 options with comparison)
  - [ ] 09.7c Actions (email to contact, embed in campaign, create PDF, etc.)
- [ ] 09.8 Define unified inbox behavior
  - [ ] 09.8a Aggregated SMS + email in one feed
  - [ ] 09.8b Categorization (reply, bounce, complaint, etc.)
  - [ ] 09.8c Lead lookup and context (show lead name, active campaigns)
  - [ ] 09.8d Quick reply UI (send SMS or email response)
  - [ ] 09.8e Auto-pause campaign on reply (with confirmation)
- [ ] 09.9 Define health aggregation dashboard
  - [ ] 09.9a Service status (green/yellow/red)
  - [ ] 09.9b Key metrics (error rate, latency, last sync)
  - [ ] 09.9c Recent errors (linked to Sentry)
  - [ ] 09.9d Resource usage (if available)
- [ ] 09.10 Create Next.js app structure
  - [ ] 09.10a App directory layout
  - [ ] 09.10b Layout components (navigation, header, sidebar)
  - [ ] 09.10c Page stubs (with route map and data loaders)
  - [ ] 09.10d Server action stubs (with parameter/response types)
  - [ ] 09.10e TypeScript types for data models

#### Prompt 10 Tasks (DevOps & Operator Tooling)

- [ ] 10.1 Gitea local mirror setup
  - [ ] 10.1a Verify Gitea running (HTTP 3100, SSH 2222)
  - [ ] 10.1b Create mirror of main GitHub repo
  - [ ] 10.1c SSH key setup for CI/agent access
  - [ ] 10.1d Health check endpoint
- [ ] 10.2 Gitea AI reviewer webhook
  - [ ] 10.2a Create `/webhook/gitea` endpoint
  - [ ] 10.2b Trigger AI review on PR creation
  - [ ] 10.2c Post review comment to PR
  - [ ] 10.2d Link to Sentry/Paperclip for issues found
- [ ] 10.3 WaveTerm command deck
  - [ ] 10.3a WaveTerm/Wave AI terminal setup
  - [ ] 10.3b Tmux/Zellij pane layout
  - [ ] 10.3c SSH panes to each host (orchestrator, workers, oracle)
  - [ ] 10.3d Docker Compose pane for service logs
- [ ] 10.4 Zellij layouts
  - [ ] 10.4a Agent panes (OpenClaw, Nerve, ClawTeam status)
  - [ ] 10.4b Worker SSH panes (rtx5090, rtx3090ti, rtx3060 stats)
  - [ ] 10.4c Logs pane (aggregated service logs)
  - [ ] 10.4d Dashboard pane (health, errors)
- [ ] 10.5 Paperclip strategy/ticket dashboard
  - [ ] 10.5a Deployment targets (dev, staging, prod)
  - [ ] 10.5b Goal/milestone tracking
  - [ ] 10.5c Auto-ticket on Sentry error (if configured)
- [ ] 10.6 Sentry-to-Paperclip automation
  - [ ] 10.6a Webhook from Sentry to Paperclip
  - [ ] 10.6b Auto-create ticket on new critical error
  - [ ] 10.6c Link error details in ticket
- [ ] 10.7 SearXNG local search
  - [ ] 10.7a Verify SearXNG deployed on oracle-vps
  - [ ] 10.7b Configuration (privacy, safe search)
  - [ ] 10.7c Health check
- [ ] 10.8 Browserless headless scraping
  - [ ] 10.8a Verify Browserless deployed on oracle-vps
  - [ ] 10.8b API endpoint and authentication
  - [ ] 10.8c Health check
- [ ] 10.9 Lazydocker integration
  - [ ] 10.9a Lazydocker CLI setup
  - [ ] 10.9b Pane in WaveTerm for container management
- [ ] 10.10 Process/resource monitoring
  - [ ] 10.10a `htop` or similar monitoring tool
  - [ ] 10.10b Memory/CPU alerts if threshold exceeded

### Phase 7: Validation & Observability (Prompt 11) — MEDIUM PRIORITY

Testing and hardening that prevents silent failures.

#### Prompt 11 Tasks (Testing/Observability/Hardening)

- [ ] 11.1 Create health check matrix
  - [ ] 11.1a orchestrator: OpenClaw, Nerve, LiteLLM, Nexus, n8n webhook receiver, Cloudflared
  - [ ] 11.1b worker-rtx5090: vLLM endpoint, Redis, LMCache
  - [ ] 11.1c worker-rtx3090ti: vLLM/Ollama endpoint, Redis, ClawTeam node
  - [ ] 11.1d worker-rtx3060: Ollama endpoint, embeddings service
  - [ ] 11.1e oracle-vps: TwentyCRM, Gitea, n8n, Activepieces, Letta/Mem0, Postgres, FalkorDB, Traefik
- [ ] 11.2 Create contract tests (API endpoints)
  - [ ] 11.2a Lead ingestion API contract test
  - [ ] 11.2b Quote API contract test
  - [ ] 11.2c Campaign API contract test
  - [ ] 11.2d Inbox API contract test
  - [ ] 11.2e Health API contract test
  - [ ] 11.2f Webhook handlers (Twilio, SendGrid) contract test
- [ ] 11.3 Create quote math validation tests
  - [ ] 11.3a P&I calculation test (known values)
  - [ ] 11.3b PMI calculation test (PMI threshold)
  - [ ] 11.3c 3-option consistency test (buy-down and lender-credit compare correctly)
  - [ ] 11.3d Edge case test (0% interest, min/max LTV)
  - [ ] 11.3e Input rejection test (invalid values)
- [ ] 11.4 Create campaign stop-condition tests
  - [ ] 11.4a Reply detection pauses campaign
  - [ ] 11.4b STOP/opt-out pauses campaign
  - [ ] 11.4c Campaign respects scheduled pause
  - [ ] 11.4d Resume after pause works correctly
- [ ] 11.5 Create Docker Compose validation per host
  - [ ] 11.5a Syntax validation (`docker-compose config`)
  - [ ] 11.5b Port conflict check
  - [ ] 11.5c Service dependency check
  - [ ] 11.5d Network connectivity test (containers can reach each other)
- [ ] 11.6 Setup CI/Gitea Actions
  - [ ] 11.6a Run tests on every commit
  - [ ] 11.6b Run linting (ESLint, TypeScript)
  - [ ] 11.6c Build Docker images
  - [ ] 11.6d Deploy to staging on merge
- [ ] 11.7 Sentry error capture
  - [ ] 11.7a Integrate Sentry SDK into all services
  - [ ] 11.7b Error reporting (unhandled exceptions, HTTP errors)
  - [ ] 11.7c Breadcrumbs (request tracing)
  - [ ] 11.7d Alert rules (critical errors to Paperclip)
- [ ] 11.8 Observability (Langfuse/Phoenix/OTLP)
  - [ ] 11.8a Langfuse setup (LLM cost tracking, trace logging)
  - [ ] 11.8b OTLP exporter from all services
  - [ ] 11.8c Dashboard (requests/errors/latency)
  - [ ] 11.8d Alert rules (latency SLO breaches)
- [ ] 11.9 Backup and restore procedures
  - [ ] 11.9a TwentyCRM backup (daily, incremental)
  - [ ] 11.9b Postgres backup (daily, incremental)
  - [ ] 11.9c FalkorDB backup (daily)
  - [ ] 11.9d Restore test (quarterly dry-run)
  - [ ] 11.9e RTO/RPO documentation (recovery targets)
- [ ] 11.10 Rollback runbook
  - [ ] 11.10a Pre-deployment checklist (backup, approval)
  - [ ] 11.10b Deployment steps (canary → rolling)
  - [ ] 11.10c Health check after deploy
  - [ ] 11.10d Rollback trigger conditions (error rate spike, SLO breach)
  - [ ] 11.10e Rollback steps (Docker Compose revert, database state revert if needed)
- [ ] 11.11 Load test baseline
  - [ ] 11.11a 100 leads/day ingestion capacity
  - [ ] 11.11b 1000 SMS sends/hour capacity
  - [ ] 11.11c Quote API latency (p50, p95, p99)
  - [ ] 11.11d Identify bottlenecks
- [ ] 11.12 Security hardening checklist
  - [ ] 11.12a No hardcoded secrets (scan with TruffleHog)
  - [ ] 11.12b No SQL injection (parameterized queries only)
  - [ ] 11.12c No XSS (CSP headers, input sanitization)
  - [ ] 11.12d No CSRF (CSRF tokens or SameSite cookies)
  - [ ] 11.12e Rate limiting on public endpoints
  - [ ] 11.12f CORS properly configured
  - [ ] 11.12g TLS 1.2+ only
  - [ ] 11.12h Secrets rotation completed
  - [ ] 11.12i Audit logs enabled and tested

### Phase 8: Integration & Synthesis (Prompt 12) — FINAL

Synthesize outputs from 1-11, resolve conflicts, produce final integrated plan.

#### Prompt 12 Tasks (Final Integration)

- [ ] 12.1 Create integrated architecture diagram
  - [ ] 12.1a All 5 hosts (orchestrator, workers, oracle)
  - [ ] 12.1b All services and their ports
  - [ ] 12.1c Network flows (public, Tailscale, internal)
  - [ ] 12.1d Data flows (lead ingestion, campaign execution, CRM sync)
- [ ] 12.2 Resolve memory architecture conflict
  - [ ] 12.2a Document Letta vs Mem0 decision
  - [ ] 12.2b Define which system stores what (session, conversation, persistent)
  - [ ] 12.2c Integration points with OpenClaw agents
- [ ] 12.3 Create prioritized execution roadmap
  - [ ] 12.3a Week 1-2: Foundation (Prompts 01-02)
  - [ ] 12.3b Week 3-4: Core data (Prompts 03-04)
  - [ ] 12.3c Week 5-6: Campaigns (Prompts 05-06)
  - [ ] 12.3d Week 7: Backend (Prompt 07)
  - [ ] 12.3e Week 8: Security (Prompt 08)
  - [ ] 12.3f Week 9: Portal (Prompt 09)
  - [ ] 12.3g Week 10: DevOps (Prompt 10)
  - [ ] 12.3h Week 11: Testing (Prompt 11)
  - [ ] 12.3i Week 12: Integration (Prompt 12)
- [ ] 12.4 Create dependency graph
  - [ ] 12.4a Critical path (01 → 02 → 03/04 → 07 → 05/06)
  - [ ] 12.4b Parallel tracks (08, 09, 10, 11 can start after 07)
  - [ ] 12.4c Blocking issues (memory decision, .gitmodules fix)
- [ ] 12.5 Identify risk areas
  - [ ] 12.5a Memory system conflicts (decision deferred, integration risk)
  - [ ] 12.5b Cloudflare Pages .gitmodules issue (blocks deployment)
  - [ ] 12.5c Compliance validation (complex, regulatory risk)
  - [ ] 12.5d Campaign compliance (TCPA, CAN-SPAM, TRID)
- [ ] 12.6 Create safe first steps
  - [ ] 12.6a Fix .gitmodules (unblocks repo operations)
  - [ ] 12.6b Implement health checks (enables monitoring)
  - [ ] 12.6c Document infrastructure (shared knowledge)
  - [ ] 12.6d Decide memory architecture (enables agent work)
  - [ ] 12.6e Implement lead/quote APIs (foundational for all downstream)
- [ ] 12.7 Create next agent handoff instructions
  - [ ] 12.7a Successful completion criteria for each prompt
  - [ ] 12.7b Test/validation procedures
  - [ ] 12.7c Integration checkpoints
  - [ ] 12.7d Go/no-go decision criteria before moving to next phase
- [ ] 12.8 Create acceptance criteria
  - [ ] 12.8a Prompt 01: Health checks pass, infrastructure documented
  - [ ] 12.8b Prompt 02: OpenClaw/LiteLLM/Nexus running, memory architecture decided
  - [ ] 12.8c Prompt 03: TwentyCRM extended, CRM API implemented
  - [ ] 12.8d Prompt 04: Quote engine running, tests passing
  - [ ] 12.8e Prompt 05: Campaigns active, TCPA compliance verified
  - [ ] 12.8f Prompt 06: n8n workflows running, Activepieces integrated
  - [ ] 12.8g Prompt 07: All APIs operational, OpenAPI docs complete
  - [ ] 12.8h Prompt 08: Secrets managed, audit logging active, compliance hooks deployed
  - [ ] 12.8i Prompt 09: Routes/data loaders/actions defined, webapp structure created
  - [ ] 12.8j Prompt 10: Gitea/WaveTerm/Paperclip running
  - [ ] 12.8k Prompt 11: Tests passing, health checks green, SLOs defined
  - [ ] 12.8l Prompt 12: Integrated architecture diagram, roadmap, risk assessment complete

---

## Current Blocker and First Actions

### Blocker: Cloudflare Pages `.gitmodules` Issue

**Status**: Known from previous audit
**Fix**: Add missing URL for `external/openclaw-n8n-stack` in `.gitmodules`

```bash
# Check current state:
git config -f .gitmodules --list
# Fix:
git config -f .gitmodules submodule.external/openclaw-n8n-stack.url https://github.com/user/openclaw-n8n-stack.git
git add .gitmodules
git commit -m "fix(infra): add missing submodule URL for openclaw-n8n-stack"
```

### Blocker: Memory Architecture Decision

**Status**: Unresolved (Letta vs Mem0/FalkorDB)
**Recommendation**: Deploy Letta as optional protected memory manager; keep Postgres (TwentyCRM) and Mem0/FalkorDB (optional enhancement)
**Action**: Document in `docs/MEMORY_ARCHITECTURE_DECISION.md`

### First Safe Steps (Non-Blocking)

1. **Fix .gitmodules** — unblocks all repo operations
2. **Create health-check.sh** — enables monitoring
3. **Document infrastructure** — shared knowledge base
4. **Decide memory architecture** — enables agent work
5. **Implement lead/quote APIs** — foundational for campaigns

---

## Summary Table

| Prompt | Phase       | Status | Priority | Est. Effort | Blocker                |
| ------ | ----------- | ------ | -------- | ----------- | ---------------------- |
| 01     | Foundation  | 40%    | CRITICAL | 40h         | .gitmodules fix        |
| 02     | Foundation  | 30%    | HIGH     | 60h         | Memory decision        |
| 03     | Data        | 20%    | HIGH     | 50h         | Prompt 02              |
| 04     | Logic       | 25%    | HIGH     | 40h         | Prompt 03              |
| 05     | Campaigns   | 20%    | HIGH     | 80h         | Prompts 03, 07         |
| 06     | Automation  | 50%    | HIGH     | 40h         | Prompts 05, 07         |
| 07     | Integration | 15%    | HIGH     | 60h         | Prompts 03, 04, 05, 06 |
| 08     | Security    | 30%    | CRITICAL | 50h         | Prompt 07              |
| 09     | Portal      | 25%    | MEDIUM   | 70h         | Prompts 07, 08         |
| 10     | DevOps      | 20%    | MEDIUM   | 50h         | Prompts 01, 07         |
| 11     | Testing     | 30%    | MEDIUM   | 60h         | Prompts 04, 05, 07     |
| 12     | Integration | 0%     | FINAL    | 30h         | All others             |

**Total Estimated Effort**: ~580 hours (~14 weeks with full team, less with parallelization)

---

## Next Actions

1. ✅ Read all 12 prompts (completed in previous session)
2. ✅ Create comprehensive TODO (this document)
3. ⏳ **Begin Phase 1 implementation (Prompt 01-02) immediately**
4. ⏳ Run parallel Phases 3-7 after Prompt 02 completion
5. ⏳ Synthesize outputs in Prompt 12 after all others complete
