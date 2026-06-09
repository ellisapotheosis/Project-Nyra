# 12-Prompt Mortgage Automation Platform — Comprehensive TODO and Assessment

Generated: 2026-05-19
Status: Superseded historical assessment

## Current Status — 2026-05-26

This document is preserved as source assessment material for the original
12-prompt mortgage automation package. It is not the active task queue.

Current executable status now lives in:

- `conductor/tracks/`
- `conductor/tracks.md`
- `docs/CONDUCTOR_TASKS.md`
- `docs/user-todo/CHECKLIST.md` for owner-only gates

Do not treat the checklist-shaped inventory below as open agent work unless a
future Conductor track explicitly promotes an item back into scope. The
prompt-pack reconciliation completed the non-UI Prompt 00-07 sequence, resolved
the memory-stack direction around Letta + mem0 + FalkorDB + Qdrant, and left
live-provider, DNS, credential, worker-access, and broad UI work gated in the
owner/user task package.

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
- DevOps tooling (Gitea/WaveTerm/Zellij/Gastown)
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

- [historical] Validated host/topology documentation (`/infra/host-layout.yaml` or similar)
- [historical] Health check scripts and patterns (`/infra/scripts/health-check.sh`)
- [historical] Network assumptions documented
- [historical] Makefile with standard targets (health, deploy, logs, etc.)
- [historical] README_SETUP.md with deployment commands
- [historical] Strict hostname enforcement (orchestrator, worker-rtx5090, worker-rtx3090ti, worker-rtx3060, oracle-vps)
- [historical] Docker Compose structure per host (already exists: `infra/hosts/{host}/docker-compose.yml`)
- [historical] Cloudflare Pages `.gitmodules` fix for `external/openclaw-n8n-stack`

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

- [historical] OpenClaw deployment (model-agnostic, on orchestrator)
- [historical] Nerve UI cockpit configuration
- [historical] LiteLLM configuration with local GPU endpoint routing
- [historical] Nexus/Hive-style MCP router at `http://100.64.0.10:4000/mcp/sse`
- [historical] ClawTeam server setup
- [historical] vLLM endpoints configured on worker-rtx5090, worker-rtx3090ti
- [historical] Memory architecture decision (Letta vs Mem0/FalkorDB)
- [historical] Memory tier documentation (session, conversation, persistent)
- [historical] MCP tool aggregation and fuzzy search capability

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

- [historical] TwentyCRM schema extension (custom fields for mortgage domain)
- [historical] Lead ingestion API specification
- [historical] Contact/Borrower object model
- [historical] Loan/LoanScenario object model
- [historical] CampaignEnrollment object model
- [historical] CommunicationLog object model
- [historical] Quote object model
- [historical] LeadSource/LeadEvent tracking
- [historical] Inbound email/LeadMailbox integration
- [historical] CRM sync validation tests

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

- [historical] Quote service implementation (Node.js/Express or documented pattern)
- [historical] Quote calculation logic (P&I, taxes, insurance, HOA, PMI, total payment)
- [historical] Input validation (reject impossible values)
- [historical] 3-option output (standard, buy-down, lender-credit)
- [historical] `/health` endpoint
- [historical] `/api/v1/quote` endpoint
- [historical] Structured JSON response
- [historical] Edge case tests (0% interest, PMI threshold, bad inputs)
- [historical] PDF/export capability

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

- [historical] Campaign template library (7-day, 30-day, 45-60 day nurture, rate alert, re-engagement)
- [historical] Twilio SMS integration (inbound/outbound, STOP/opt-out handling)
- [historical] SendGrid email integration (opens, clicks, bounces, unsubscribes)
- [historical] Reply detection and campaign pause logic
- [historical] Opt-out/STOP compliance enforcement
- [historical] Multi-channel orchestration (SMS + email)
- [historical] Campaign enrollment workflow
- [historical] CRM sync for campaign state
- [historical] Reply inbox unified surface

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

- [historical] n8n deployment (heavy logic, complex transformations, webhook-driven)
- [historical] Activepieces deployment (light triggers, quick integrations)
- [historical] Composio integration (OAuth/SaaS bridges: Slack, Gmail, Jira, etc.)
- [historical] n8n workflow templates (lead normalization, campaign execution, sync)
- [historical] Activepieces trigger specifications
- [historical] Custom campaign builder specification (JSON → n8n webhook)
- [historical] Workflow error handling and retry logic
- [historical] Audit logging for automations

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

- [historical] Lead ingestion API (`POST /api/v1/leads`)
- [historical] Quote API (`POST /api/v1/quotes`)
- [historical] Campaign API (`POST /api/v1/campaigns`)
- [historical] Webhook handlers (Twilio, SendGrid, n8n, Activepieces)
- [historical] Service-to-service contracts (CRM sync, state updates)
- [historical] Unified inbox API
- [historical] Health aggregation API
- [historical] OpenAPI/Swagger documentation
- [historical] Request/response validation (Zod, TypeBox, etc.)
- [historical] Error response standards

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

- [historical] Infisical integration (secret injection for all services)
- [historical] Cloudflare Zero Trust setup documentation
- [historical] Tailscale network trust model
- [historical] Admin webapp authentication (MFA, session management)
- [historical] Borrower PII protection (encryption at rest, in transit)
- [historical] Audit logging (all mutations, admin actions, campaign sends)
- [historical] Least-privilege agent tool restrictions
- [historical] Data classification (public, internal, sensitive, PII)
- [historical] Compliance validation hooks (TILA, RESPA, TRID, state regs)
- [historical] Secret rotation procedures

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

- [historical] Route specification (`/dashboard`, `/leads`, `/campaigns`, `/quotes`, `/inbox`, etc.)
- [historical] Data loader contracts (how data is fetched and validated)
- [historical] Server action specifications (create campaign, pause campaign, enroll lead, etc.)
- [historical] Permission model (role-based access)
- [historical] Lead cockpit behavior (detail view, timeline, actions)
- [historical] Campaign builder behavior (configuration, validation, scheduling)
- [historical] Quote desk behavior (request, calculation, presentation)
- [historical] Unified inbox behavior (reply detection, categorization)
- [historical] Health aggregation dashboard (service status, error rates)
- [historical] Next.js app structure

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

**Purpose**: Developer/operator cockpit: Gitea, AI reviewer, WaveTerm, Gastown

**Required Outputs**:

- [historical] Gitea local mirror setup (HTTP 3100, SSH 2222)
- [historical] Gitea AI reviewer webhook (`/webhook/gitea`)
- [historical] WaveTerm/Wave terminal command deck
- [historical] Zellij layouts (agent panes, worker SSH panes)
- [historical] Gastown strategy/ticket dashboard
- [historical] Sentry-to-Gastown auto-ticketing
- [historical] SearXNG local search
- [historical] Browserless headless scraping
- [historical] Lazydocker integration
- [historical] Process monitoring dashboard

**Current Repo Status**: ~20% complete

- ✅ Gitea is deployed
- ✅ Gastown referenced
- ❌ AI reviewer webhook not integrated
- ❌ WaveTerm command deck not configured
- ❌ Zellij layouts not visible
- ❌ SearXNG/Browserless not clearly deployed
- ❌ Sentry-to-Gastown automation missing

**Priority**: LOW-MEDIUM — Developer experience (doesn't block revenue)

---

### PROMPT 11 — Testing, Observability, Deployment, Hardening

**Purpose**: Validation, health checks, observability, backup/restore, hardening

**Required Outputs**:

- [historical] Health check matrix (every service)
- [historical] Contract tests (API endpoints, webhooks)
- [historical] Quote math validation tests
- [historical] Campaign stop-condition tests
- [historical] Docker Compose validation per host
- [historical] CI/Gitea Actions setup
- [historical] Sentry error capture integration
- [historical] Langfuse/Phoenix/OTLP observability
- [historical] Backup and restore procedures
- [historical] Rollback runbook
- [historical] Load test baseline
- [historical] Security hardening checklist

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

- [historical] Integrated architecture diagram (all systems mapped)
- [historical] Conflict resolution decisions (esp. Letta vs Mem0)
- [historical] Prioritized execution roadmap
- [historical] Dependency graph with safe first steps
- [historical] Risk assessment
- [historical] Next agent handoff instructions
- [historical] Acceptance criteria for each prompt's completion

**Current Repo Status**: 0% — Cannot begin without 1-11 completion

**Priority**: FINAL STAGE — Synthesis only after foundation work

---

## Consolidated TODO List (Prioritized by Criticality and Dependency)

### Phase 1: Foundation (Prompts 01-02) — CRITICAL

These must be done first; they unblock all downstream work.

#### Prompt 01 Tasks

- [historical] 01.1 Create `/infra/scripts/health-check.sh` — validate all 5 hosts are reachable and services healthy
- [historical] 01.2 Create `/infra/scripts/network-map.sh` — document network topology and trust model
- [historical] 01.3 Create `docs/INFRASTRUCTURE_REFERENCE.md` — document host placement, services per host, port allocation
- [historical] 01.4 Fix `.gitmodules` for `external/openclaw-n8n-stack` — resolve Cloudflare Pages missing URL issue
- [historical] 01.5 Create/update `README_SETUP.md` with:
  - [historical] 01.5a Prerequisites (Docker, Tailscale, credentials)
  - [historical] 01.5b Host initialization (orchestrator, workers, oracle)
  - [historical] 01.5c Service startup sequence
  - [historical] 01.5d Validation commands
- [historical] 01.6 Update `Makefile` with targets: `health`, `deploy`, `logs`, `rollback`, `test-infra`

#### Prompt 02 Tasks

- [historical] 02.1 Document memory architecture decision (Letta vs Mem0/FalkorDB) — CREATE `docs/MEMORY_ARCHITECTURE_DECISION.md`
- [historical] 02.2 Deploy/document OpenClaw on orchestrator
  - [historical] 02.2a OpenClaw Docker Compose overlay
  - [historical] 02.2b Model-agnostic routing configuration
  - [historical] 02.2c Health check
- [historical] 02.3 Deploy/document Nerve UI (cockpit over OpenClaw sessions)
- [historical] 02.4 Configure LiteLLM routing:
  - [historical] 02.4a Route local tasks to worker GPU endpoints (vLLM)
  - [historical] 02.4b Fallback to cloud providers (DeepSeek, Claude Sonnet)
  - [historical] 02.4c Cost tracking
- [historical] 02.5 Implement Nexus/Hive MCP router:
  - [historical] 02.5a Endpoint at `http://100.64.0.10:4000/mcp/sse`
  - [historical] 02.5b Tool aggregation and semantic search
  - [historical] 02.5c Authorization token pattern (Bearer token + Hive headers)
- [historical] 02.6 Deploy vLLM endpoints on workers
  - [historical] 02.6a worker-rtx5090 (primary, heavy reasoning)
  - [historical] 02.6b worker-rtx3090ti (secondary, steady-state)
  - [historical] 02.6c worker-rtx3060 (embeddings, small models)
- [historical] 02.7 Document memory system (Letta optional, Mem0/FalkorDB as data substrate, Postgres as durable system-of-record)
- [historical] 02.8 ClawTeam server setup (if needed for multi-agent coordination)

### Phase 2: Core Data & Mortgage Logic (Prompts 03-04) — HIGH PRIORITY

These are the revenue-critical business logic. Can be done in parallel with Phase 1 completion.

#### Prompt 03 Tasks (CRM)

- [historical] 03.1 Extend TwentyCRM schema with mortgage-specific objects
  - [historical] 03.1a Contact/Borrower (name, email, phone, address, credit score, income)
  - [historical] 03.1b Loan/LoanScenario (loan amount, property value, down payment, term, rate, scenario variants)
  - [historical] 03.1c CampaignEnrollment (enrollment date, campaign ID, status, pause reason)
  - [historical] 03.1d CommunicationLog (type: SMS/email/call, timestamp, direction, status)
  - [historical] 03.1e Quote (loan ID, monthly payment, 3 options, created date)
  - [historical] 03.1f LeadSource/LeadEvent (source, touchpoint, timestamp)
  - [historical] 03.1g InboxEvent/ReplyEvent (inbound SMS/email, sentiment, campaign pause trigger)
  - [historical] 03.1h Suppression/OptOut (reason, timestamp, channels opted out)
- [historical] 03.2 Create CRM API wrapper (`services/crm-api` or similar)
  - [historical] 03.2a Contact CRUD + search
  - [historical] 03.2b Lead ingestion (`POST /api/v1/leads`)
  - [historical] 03.2c CRM sync interface (used by campaigns, quote engine, automations)
- [historical] 03.3 Implement lead ingestion channels
  - [historical] 03.3a Landing form → CRM
  - [historical] 03.3b API/webhook ingestion
  - [historical] 03.3c Email/LeadMailbox ingestion
  - [historical] 03.3d Manual entry
  - [historical] 03.3e Future: LendingPad/provider sync
- [historical] 03.4 Create CRM sync validation tests
  - [historical] 03.4a Lead creation tests
  - [historical] 03.4b Field validation
  - [historical] 03.4c Sync error handling
- [historical] 03.5 Document pipeline stages: inquiry → pre-qualified → pre-approved → application → processing → clear-to-close → closed/denied

#### Prompt 04 Tasks (Quote Engine)

- [historical] 04.1 Implement quote service
  - [historical] 04.1a Node.js/Express service or serverless function
  - [historical] 04.1b P&I calculation (principal + interest per loan term)
  - [historical] 04.1c Property tax estimation
  - [historical] 04.1d Homeowner insurance estimation
  - [historical] 04.1e HOA estimation (if applicable)
  - [historical] 04.1f PMI calculation (if LTV > threshold)
  - [historical] 04.1g Total monthly payment aggregation
  - [historical] 04.1h Total interest over loan term
- [historical] 04.2 Implement input validation
  - [historical] 04.2a Reject down payment ≥ property value
  - [historical] 04.2b Reject negative or zero loan terms
  - [historical] 04.2c Reject impossible rates/terms
  - [historical] 04.2d Validate LTV
- [historical] 04.3 Implement 3-option comparison
  - [historical] 04.3a Option 1: Standard/par rate
  - [historical] 04.3b Option 2: Buy-down (1% rate reduction via upfront cost)
  - [historical] 04.3c Option 3: Lender credit (lender pays costs, rate increases)
- [historical] 04.4 Create endpoints
  - [historical] 04.4a `/health` — service health
  - [historical] 04.4b `/api/v1/quote` — quote calculation
- [historical] 04.5 Add edge case tests
  - [historical] 04.5a 0% interest edge case
  - [historical] 04.5b PMI threshold tests
  - [historical] 04.5c Bad input rejection
  - [historical] 04.5d 3-option consistency validation
- [historical] 04.6 Add PDF/export capability (used by campaigns, email sends)
- [historical] 04.7 Document as educational/indicative (not binding commitments)

### Phase 3: Communication & Automation (Prompts 05-06) — HIGH PRIORITY

Revenue-critical campaigns and workflow automation.

#### Prompt 05 Tasks (Campaigns)

- [historical] 05.1 Create campaign template library
  - [historical] 05.1a New Lead Nurture (7-day, every 2 days)
  - [historical] 05.1b Pre-Approval Follow-Up (30-day, varied frequency)
  - [historical] 05.1c Application-in-Progress (weekly check-ins)
  - [historical] 05.1d Post-Close Delight (12-month review/referral)
  - [historical] 05.1e Rate Alert (market/event-driven)
  - [historical] 05.1f Re-Engagement (21-day, escalating)
  - [historical] 05.1g Long nurture (45-60 day, low frequency)
- [historical] 05.2 Implement Twilio SMS integration
  - [historical] 05.2a Outbound SMS via Twilio API
  - [historical] 05.2b Inbound SMS webhook handler
  - [historical] 05.2c STOP/opt-out compliance (auto-pause campaign, log suppression)
  - [historical] 05.2d Conversation threading
- [historical] 05.3 Implement SendGrid email integration
  - [historical] 05.3a Outbound email via SendGrid API
  - [historical] 05.3b Open/click tracking webhook
  - [historical] 05.3c Bounce/complaint handling
  - [historical] 05.3d Unsubscribe compliance
  - [historical] 05.3e List management
- [historical] 05.4 Implement reply detection and campaign pause
  - [historical] 05.4a Detect inbound SMS replies
  - [historical] 05.4b Detect inbound email replies
  - [historical] 05.4c Pause active campaign on first reply
  - [historical] 05.4d Create reply inbox event
  - [historical] 05.4e Sentiment detection (if AI-enhanced)
- [historical] 05.5 Implement opt-out enforcement
  - [historical] 05.5a Suppress contacts who reply STOP
  - [historical] 05.5b Suppress contacts who unsubscribe (email)
  - [historical] 05.5c Suppress list persistence (no re-enrollment without explicit opt-in)
  - [historical] 05.5d Audit logging
- [historical] 05.6 Implement multi-channel orchestration
  - [historical] 05.6a SMS + email coordination (no duplicate messaging within 2 hours)
  - [historical] 05.6b Channel-specific templates
- [historical] 05.7 Implement campaign enrollment workflow
  - [historical] 05.7a Trigger enrollment on lead creation
  - [historical] 05.7b Enrollment validation
  - [historical] 05.7c Schedule first message
- [historical] 05.8 Implement CRM sync for campaign state
  - [historical] 05.8a Update CampaignEnrollment status
  - [historical] 05.8b Log all sends to CommunicationLog
  - [historical] 05.8c Sync replies back to CRM
- [historical] 05.9 Build unified inbox for all inbound messages
  - [historical] 05.9a Aggregated SMS + email
  - [historical] 05.9b Categorization (reply, bounce, complaint, etc.)
  - [historical] 05.9c Lead lookup and context
  - [historical] 05.9d Quick-reply actions

#### Prompt 06 Tasks (Workflow Automation)

- [historical] 06.1 Document automation division of labor:
  - [historical] 06.1a n8n: heavy logic, transformations, complex branching
  - [historical] 06.1b Activepieces: light triggers, quick integrations
  - [historical] 06.1c Composio: OAuth/SaaS bridges (Slack, Gmail, etc.)
- [historical] 06.2 Ensure n8n deployment
  - [historical] 06.2a Verify n8n running on oracle-vps (port 5678)
  - [historical] 06.2b n8n database (postgres or internal)
  - [historical] 06.2c Health check
- [historical] 06.3 Ensure Activepieces deployment
  - [historical] 06.3a Verify Activepieces running (if separate from n8n)
  - [historical] 06.3b Trigger library (webhook, schedule, manual)
- [historical] 06.4 Implement core n8n workflows
  - [historical] 06.4a Lead normalization (parse inbound, standardize fields)
  - [historical] 06.4b Campaign execution (read n8n webhook config, trigger sends via Twilio/SendGrid)
  - [historical] 06.4c CRM sync (sync campaign state, communication logs)
  - [historical] 06.4d Reply processing (detect reply, pause campaign, notify inbox)
- [historical] 06.5 Integrate Composio for SaaS actions
  - [historical] 06.5a Gmail read/send (for email leads, future expansion)
  - [historical] 06.5b Slack notifications (error alerts)
  - [historical] 06.5c Jira/Gastown integration (ticket creation for errors)
- [historical] 06.6 Implement custom campaign builder
  - [historical] 06.6a JSON schema for campaign config (steps, conditions, sends)
  - [historical] 06.6b Webapp campaign builder UI (non-visual behavior specified in Prompt 09)
  - [historical] 06.6c Webhook to n8n to trigger campaign execution
  - [historical] 06.6d Validation (start date < end date, at least one message, etc.)
- [historical] 06.7 Implement workflow error handling
  - [historical] 06.7a Retry logic (exponential backoff)
  - [historical] 06.7b Dead-letter queue for failed sends
  - [historical] 06.7c Error notifications to Sentry
- [historical] 06.8 Implement audit logging
  - [historical] 06.8a Every send logged with timestamp, recipient, template, result
  - [historical] 06.8b Every workflow execution logged

### Phase 4: Backend Integration Layer (Prompt 07) — HIGH PRIORITY

Shared API contracts that everything else depends on.

#### Prompt 07 Tasks (APIs & Webhooks)

- [historical] 07.1 Create lead ingestion API
  - [historical] 07.1a POST `/api/v1/leads` — create/update lead
  - [historical] 07.1b Request schema (name, email, phone, property value, down payment, loan amount)
  - [historical] 07.1c Response (lead ID, CRM contact ID, campaign enrollment ID)
  - [historical] 07.1d Error handling (validation, duplicate detection)
- [historical] 07.2 Create quote API
  - [historical] 07.2a POST `/api/v1/quotes` — calculate quote
  - [historical] 07.2b Request schema (property value, down payment, loan amount, term, rate)
  - [historical] 07.2c Response schema (3-option comparison, monthly payment, total interest)
  - [historical] 07.2d Validation
- [historical] 07.3 Create campaign API
  - [historical] 07.3a POST `/api/v1/campaigns` — create campaign
  - [historical] 07.3b GET `/api/v1/campaigns/{id}` — read campaign
  - [historical] 07.3c PUT `/api/v1/campaigns/{id}` — update campaign
  - [historical] 07.3d POST `/api/v1/campaigns/{id}/pause` — pause campaign
  - [historical] 07.3e GET `/api/v1/campaigns/{id}/status` — campaign status
- [historical] 07.4 Create webhook handlers
  - [historical] 07.4a Twilio SMS inbound (`POST /webhooks/twilio/sms`)
  - [historical] 07.4b SendGrid events (`POST /webhooks/sendgrid/events`)
  - [historical] 07.4c n8n webhook notification (`POST /webhooks/n8n/notify`)
  - [historical] 07.4d Activepieces trigger (`POST /webhooks/activepieces`)
- [historical] 07.5 Create unified inbox API
  - [historical] 07.5a GET `/api/v1/inbox` — list inbound messages
  - [historical] 07.5b GET `/api/v1/inbox/{id}` — message detail
  - [historical] 07.5c POST `/api/v1/inbox/{id}/reply` — quick reply
  - [historical] 07.5d POST `/api/v1/inbox/{id}/resolve` — mark resolved
- [historical] 07.6 Create health aggregation API
  - [historical] 07.6a GET `/api/v1/health` — system health (all services)
  - [historical] 07.6b GET `/api/v1/health/services` — per-service status
  - [historical] 07.6c Timeout and error count tracking
- [historical] 07.7 Create OpenAPI/Swagger documentation
  - [historical] 07.7a Complete API specification
  - [historical] 07.7b Example requests/responses
  - [historical] 07.7c Error codes and meanings
- [historical] 07.8 Implement request/response validation
  - [historical] 07.8a Use Zod, TypeBox, or similar
  - [historical] 07.8b Standardized error responses
  - [historical] 07.8c Type-safe client generation (OpenAPI → TypeScript)
- [historical] 07.9 Create service-to-service contract specs
  - [historical] 07.9a CRM sync events and acknowledgments
  - [historical] 07.9b Campaign state propagation
  - [historical] 07.9c Idempotency requirements

### Phase 5: Security & Compliance (Prompt 08) — CRITICAL

Hard requirements for borrower data protection and regulatory compliance.

#### Prompt 08 Tasks (Auth/Security/Compliance)

- [historical] 08.1 Infisical integration
  - [historical] 08.1a Document required secrets (API keys, DB passwords, JWT secrets, Twilio/SendGrid tokens)
  - [historical] 08.1b Infisical folders per environment (dev, staging, prod)
  - [historical] 08.1c Secret injection into Docker Compose (environment block)
  - [historical] 08.1d Secret rotation policy (quarterly minimum for API keys)
- [historical] 08.2 Cloudflare Zero Trust setup
  - [historical] 08.2a Admin webapp behind Cloudflare Access
  - [historical] 08.2b n8n/Activepieces protected by auth token
  - [historical] 08.2c Internal API endpoints protected
- [historical] 08.3 Tailscale network trust model
  - [historical] 08.3a Document which services are Tailscale-only
  - [historical] 08.3b Document which services are public/Cloudflare-protected
  - [historical] 08.3c ACL policy per service
- [historical] 08.4 Implement admin authentication
  - [historical] 08.4a OAuth provider (Google, GitHub, or OIDC)
  - [historical] 08.4b MFA requirement (TOTP)
  - [historical] 08.4c Session management (expires in 8 hours)
  - [historical] 08.4d Password policy (if password-based)
- [historical] 08.5 Implement borrower PII protection
  - [historical] 08.5a Encryption at rest (TwentyCRM database)
  - [historical] 08.5b Encryption in transit (HTTPS for all APIs)
  - [historical] 08.5c Data classification schema (public, internal, sensitive, PII)
  - [historical] 08.5d Access controls (staff view full SSN only on approval)
  - [historical] 08.5e Anonymization for logs/debugging
- [historical] 08.6 Implement audit logging
  - [historical] 08.6a Log all mutations (create/update/delete in CRM, campaigns, quotes)
  - [historical] 08.6b Log all admin actions (login, campaign pause, lead update)
  - [historical] 08.6c Log all campaign sends (timestamp, recipient, template, result)
  - [historical] 08.6d Immutable audit log (append-only database or sidecar)
  - [historical] 08.6e Query audit logs for compliance checks
- [historical] 08.7 Implement compliance validation hooks
  - [historical] 08.7a TILA (Truth in Lending Act) — include APR, finance charges
  - [historical] 08.7b RESPA (Real Estate Settlement Procedures Act) — no kickbacks, proper disclosures
  - [historical] 08.7c TRID (Integrated Disclosure) — Closing Disclosure form
  - [historical] 08.7d State regulations (interest rate caps, escrow requirements)
  - [historical] 08.7e CAN-SPAM (email marketing compliance)
  - [historical] 08.7f TCPA (Telephone Consumer Protection Act) — consent tracking for SMS
- [historical] 08.8 Implement least-privilege agent tool restrictions
  - [historical] 08.8a Document which OpenClaw agents can call which APIs
  - [historical] 08.8b Implement per-agent API scopes (no agent can call all APIs)
  - [historical] 08.8c Rate limits per agent (prevent runaway loops)
  - [historical] 08.8d Audit logs for all agent API calls
- [historical] 08.9 Implement secret rotation procedures
  - [historical] 08.9a Scheduled rotation (quarterly for API keys)
  - [historical] 08.9b Zero-downtime rotation (dual-key validation period)
  - [historical] 08.9c Rotation notifications and status tracking

### Phase 6: User-Facing Systems (Prompts 09-10) — MEDIUM PRIORITY

Non-blocking for core revenue functionality, but needed for operator experience.

#### Prompt 09 Tasks (Admin Portal Behavior)

- [historical] 09.1 Define route map (non-visual)
  - [historical] 09.1a `/dashboard` — overview, key metrics
  - [historical] 09.1b `/leads` — lead list, search
  - [historical] 09.1c `/leads/{id}` — lead detail, timeline, actions
  - [historical] 09.1d `/campaigns` — campaign list, status
  - [historical] 09.1e `/campaigns/new` — campaign builder
  - [historical] 09.1f `/campaigns/{id}` — campaign detail, messages sent, performance
  - [historical] 09.1g `/campaigns/{id}/pause` — pause campaign
  - [historical] 09.1h `/quotes` — quote list, search
  - [historical] 09.1i `/quotes/{id}` — quote detail, 3 options, export
  - [historical] 09.1j `/inbox` — unified inbox, replies and inbound
  - [historical] 09.1k `/integrations` — tool dashboard, API keys, status
  - [historical] 09.1l `/health` — system health, service status
  - [historical] 09.1m `/audit-logs` — audit log search and export
- [historical] 09.2 Define data loader contracts
  - [historical] 09.2a Lead list loader (pagination, search, filtering)
  - [historical] 09.2b Lead detail loader (with related campaigns, quotes, communication history)
  - [historical] 09.2c Campaign list loader
  - [historical] 09.2d Campaign detail loader (with message schedule, performance metrics)
  - [historical] 09.2e Inbox loader (with pagination, filtering, lead lookup)
  - [historical] 09.2f Health dashboard loader (aggregated service status)
- [historical] 09.3 Define server action contracts
  - [historical] 09.3a Create campaign (`createCampaign(config)`)
  - [historical] 09.3b Update campaign (`updateCampaign(id, config)`)
  - [historical] 09.3c Pause campaign (`pauseCampaign(id, reason)`)
  - [historical] 09.3d Resume campaign (`resumeCampaign(id)`)
  - [historical] 09.3e Enroll lead in campaign (`enrollLeadInCampaign(leadId, campaignId)`)
  - [historical] 09.3f Quote request (`requestQuote(leadId, loanAmount, ...)`)
  - [historical] 09.3g Reply to inbox message (`replyToInbox(inboxId, message)`)
  - [historical] 09.3h Pause inbound campaign on reply (`pauseOnReply(inboxId)`)
- [historical] 09.4 Define permission model
  - [historical] 09.4a Admin (full access)
  - [historical] 09.4b Broker (can view leads, campaigns, quotes; cannot modify settings)
  - [historical] 09.4c Operator (read-only dashboard)
  - [historical] 09.4d API (service account for automations)
- [historical] 09.5 Define lead cockpit behavior
  - [historical] 09.5a Detail view (all borrower fields from CRM)
  - [historical] 09.5b Timeline (all events: lead source, quotes, campaign enrollments, replies)
  - [historical] 09.5c Quick actions (quote, pause campaign, send email, etc.)
  - [historical] 09.5d Linked records (active campaigns, recent quotes, latest communication)
- [historical] 09.6 Define campaign builder behavior (non-visual)
  - [historical] 09.6a Configuration schema (name, start date, end date, channels, steps)
  - [historical] 09.6b Step types (delay, send SMS, send email, condition branch, pause on reply)
  - [historical] 09.6c Validation (at least one message, valid date range, etc.)
  - [historical] 09.6d Preview (show schedule and estimated sends)
  - [historical] 09.6e Save to n8n webhook for execution
- [historical] 09.7 Define quote desk behavior
  - [historical] 09.7a Quote request form (loan amount, property value, etc.)
  - [historical] 09.7b Quote calculation and display (3 options with comparison)
  - [historical] 09.7c Actions (email to contact, embed in campaign, create PDF, etc.)
- [historical] 09.8 Define unified inbox behavior
  - [historical] 09.8a Aggregated SMS + email in one feed
  - [historical] 09.8b Categorization (reply, bounce, complaint, etc.)
  - [historical] 09.8c Lead lookup and context (show lead name, active campaigns)
  - [historical] 09.8d Quick reply UI (send SMS or email response)
  - [historical] 09.8e Auto-pause campaign on reply (with confirmation)
- [historical] 09.9 Define health aggregation dashboard
  - [historical] 09.9a Service status (green/yellow/red)
  - [historical] 09.9b Key metrics (error rate, latency, last sync)
  - [historical] 09.9c Recent errors (linked to Sentry)
  - [historical] 09.9d Resource usage (if available)
- [historical] 09.10 Create Next.js app structure
  - [historical] 09.10a App directory layout
  - [historical] 09.10b Layout components (navigation, header, sidebar)
  - [historical] 09.10c Page stubs (with route map and data loaders)
  - [historical] 09.10d Server action stubs (with parameter/response types)
  - [historical] 09.10e TypeScript types for data models

#### Prompt 10 Tasks (DevOps & Operator Tooling)

- [historical] 10.1 Gitea local mirror setup
  - [historical] 10.1a Verify Gitea running (HTTP 3100, SSH 2222)
  - [historical] 10.1b Create mirror of main GitHub repo
  - [historical] 10.1c SSH key setup for CI/agent access
  - [historical] 10.1d Health check endpoint
- [historical] 10.2 Gitea AI reviewer webhook
  - [historical] 10.2a Create `/webhook/gitea` endpoint
  - [historical] 10.2b Trigger AI review on PR creation
  - [historical] 10.2c Post review comment to PR
  - [historical] 10.2d Link to Sentry/Gastown for issues found
- [historical] 10.3 WaveTerm command deck
  - [historical] 10.3a WaveTerm/Wave AI terminal setup
  - [historical] 10.3b Tmux/Zellij pane layout
  - [historical] 10.3c SSH panes to each host (orchestrator, workers, oracle)
  - [historical] 10.3d Docker Compose pane for service logs
- [historical] 10.4 Zellij layouts
  - [historical] 10.4a Agent panes (OpenClaw, Nerve, ClawTeam status)
  - [historical] 10.4b Worker SSH panes (rtx5090, rtx3090ti, rtx3060 stats)
  - [historical] 10.4c Logs pane (aggregated service logs)
  - [historical] 10.4d Dashboard pane (health, errors)
- [historical] 10.5 Gastown strategy/ticket dashboard
  - [historical] 10.5a Deployment targets (dev, staging, prod)
  - [historical] 10.5b Goal/milestone tracking
  - [historical] 10.5c Auto-ticket on Sentry error (if configured)
- [historical] 10.6 Sentry-to-Gastown automation
  - [historical] 10.6a Webhook from Sentry to Gastown
  - [historical] 10.6b Auto-create ticket on new critical error
  - [historical] 10.6c Link error details in ticket
- [historical] 10.7 SearXNG local search
  - [historical] 10.7a Verify SearXNG deployed on oracle-vps
  - [historical] 10.7b Configuration (privacy, safe search)
  - [historical] 10.7c Health check
- [historical] 10.8 Browserless headless scraping
  - [historical] 10.8a Verify Browserless deployed on oracle-vps
  - [historical] 10.8b API endpoint and authentication
  - [historical] 10.8c Health check
- [historical] 10.9 Lazydocker integration
  - [historical] 10.9a Lazydocker CLI setup
  - [historical] 10.9b Pane in WaveTerm for container management
- [historical] 10.10 Process/resource monitoring
  - [historical] 10.10a `htop` or similar monitoring tool
  - [historical] 10.10b Memory/CPU alerts if threshold exceeded

### Phase 7: Validation & Observability (Prompt 11) — MEDIUM PRIORITY

Testing and hardening that prevents silent failures.

#### Prompt 11 Tasks (Testing/Observability/Hardening)

- [historical] 11.1 Create health check matrix
  - [historical] 11.1a orchestrator: OpenClaw, Nerve, LiteLLM, Nexus, n8n webhook receiver, Cloudflared
  - [historical] 11.1b worker-rtx5090: vLLM endpoint, Redis, LMCache
  - [historical] 11.1c worker-rtx3090ti: vLLM/Ollama endpoint, Redis, ClawTeam node
  - [historical] 11.1d worker-rtx3060: Ollama endpoint, embeddings service
  - [historical] 11.1e oracle-vps: TwentyCRM, Gitea, n8n, Activepieces, Letta/Mem0, Postgres, FalkorDB, Traefik
- [historical] 11.2 Create contract tests (API endpoints)
  - [historical] 11.2a Lead ingestion API contract test
  - [historical] 11.2b Quote API contract test
  - [historical] 11.2c Campaign API contract test
  - [historical] 11.2d Inbox API contract test
  - [historical] 11.2e Health API contract test
  - [historical] 11.2f Webhook handlers (Twilio, SendGrid) contract test
- [historical] 11.3 Create quote math validation tests
  - [historical] 11.3a P&I calculation test (known values)
  - [historical] 11.3b PMI calculation test (PMI threshold)
  - [historical] 11.3c 3-option consistency test (buy-down and lender-credit compare correctly)
  - [historical] 11.3d Edge case test (0% interest, min/max LTV)
  - [historical] 11.3e Input rejection test (invalid values)
- [historical] 11.4 Create campaign stop-condition tests
  - [historical] 11.4a Reply detection pauses campaign
  - [historical] 11.4b STOP/opt-out pauses campaign
  - [historical] 11.4c Campaign respects scheduled pause
  - [historical] 11.4d Resume after pause works correctly
- [historical] 11.5 Create Docker Compose validation per host
  - [historical] 11.5a Syntax validation (`docker-compose config`)
  - [historical] 11.5b Port conflict check
  - [historical] 11.5c Service dependency check
  - [historical] 11.5d Network connectivity test (containers can reach each other)
- [historical] 11.6 Setup CI/Gitea Actions
  - [historical] 11.6a Run tests on every commit
  - [historical] 11.6b Run linting (ESLint, TypeScript)
  - [historical] 11.6c Build Docker images
  - [historical] 11.6d Deploy to staging on merge
- [historical] 11.7 Sentry error capture
  - [historical] 11.7a Integrate Sentry SDK into all services
  - [historical] 11.7b Error reporting (unhandled exceptions, HTTP errors)
  - [historical] 11.7c Breadcrumbs (request tracing)
  - [historical] 11.7d Alert rules (critical errors to Gastown)
- [historical] 11.8 Observability (Langfuse/Phoenix/OTLP)
  - [historical] 11.8a Langfuse setup (LLM cost tracking, trace logging)
  - [historical] 11.8b OTLP exporter from all services
  - [historical] 11.8c Dashboard (requests/errors/latency)
  - [historical] 11.8d Alert rules (latency SLO breaches)
- [historical] 11.9 Backup and restore procedures
  - [historical] 11.9a TwentyCRM backup (daily, incremental)
  - [historical] 11.9b Postgres backup (daily, incremental)
  - [historical] 11.9c FalkorDB backup (daily)
  - [historical] 11.9d Restore test (quarterly dry-run)
  - [historical] 11.9e RTO/RPO documentation (recovery targets)
- [historical] 11.10 Rollback runbook
  - [historical] 11.10a Pre-deployment checklist (backup, approval)
  - [historical] 11.10b Deployment steps (canary → rolling)
  - [historical] 11.10c Health check after deploy
  - [historical] 11.10d Rollback trigger conditions (error rate spike, SLO breach)
  - [historical] 11.10e Rollback steps (Docker Compose revert, database state revert if needed)
- [historical] 11.11 Load test baseline
  - [historical] 11.11a 100 leads/day ingestion capacity
  - [historical] 11.11b 1000 SMS sends/hour capacity
  - [historical] 11.11c Quote API latency (p50, p95, p99)
  - [historical] 11.11d Identify bottlenecks
- [historical] 11.12 Security hardening checklist
  - [historical] 11.12a No hardcoded secrets (scan with TruffleHog)
  - [historical] 11.12b No SQL injection (parameterized queries only)
  - [historical] 11.12c No XSS (CSP headers, input sanitization)
  - [historical] 11.12d No CSRF (CSRF tokens or SameSite cookies)
  - [historical] 11.12e Rate limiting on public endpoints
  - [historical] 11.12f CORS properly configured
  - [historical] 11.12g TLS 1.2+ only
  - [historical] 11.12h Secrets rotation completed
  - [historical] 11.12i Audit logs enabled and tested

### Phase 8: Integration & Synthesis (Prompt 12) — FINAL

Synthesize outputs from 1-11, resolve conflicts, produce final integrated plan.

#### Prompt 12 Tasks (Final Integration)

- [historical] 12.1 Create integrated architecture diagram
  - [historical] 12.1a All 5 hosts (orchestrator, workers, oracle)
  - [historical] 12.1b All services and their ports
  - [historical] 12.1c Network flows (public, Tailscale, internal)
  - [historical] 12.1d Data flows (lead ingestion, campaign execution, CRM sync)
- [historical] 12.2 Resolve memory architecture conflict
  - [historical] 12.2a Document Letta vs Mem0 decision
  - [historical] 12.2b Define which system stores what (session, conversation, persistent)
  - [historical] 12.2c Integration points with OpenClaw agents
- [historical] 12.3 Create prioritized execution roadmap
  - [historical] 12.3a Week 1-2: Foundation (Prompts 01-02)
  - [historical] 12.3b Week 3-4: Core data (Prompts 03-04)
  - [historical] 12.3c Week 5-6: Campaigns (Prompts 05-06)
  - [historical] 12.3d Week 7: Backend (Prompt 07)
  - [historical] 12.3e Week 8: Security (Prompt 08)
  - [historical] 12.3f Week 9: Portal (Prompt 09)
  - [historical] 12.3g Week 10: DevOps (Prompt 10)
  - [historical] 12.3h Week 11: Testing (Prompt 11)
  - [historical] 12.3i Week 12: Integration (Prompt 12)
- [historical] 12.4 Create dependency graph
  - [historical] 12.4a Critical path (01 → 02 → 03/04 → 07 → 05/06)
  - [historical] 12.4b Parallel tracks (08, 09, 10, 11 can start after 07)
  - [historical] 12.4c Blocking issues (memory decision, .gitmodules fix)
- [historical] 12.5 Identify risk areas
  - [historical] 12.5a Memory system conflicts (decision deferred, integration risk)
  - [historical] 12.5b Cloudflare Pages .gitmodules issue (blocks deployment)
  - [historical] 12.5c Compliance validation (complex, regulatory risk)
  - [historical] 12.5d Campaign compliance (TCPA, CAN-SPAM, TRID)
- [historical] 12.6 Create safe first steps
  - [historical] 12.6a Fix .gitmodules (unblocks repo operations)
  - [historical] 12.6b Implement health checks (enables monitoring)
  - [historical] 12.6c Document infrastructure (shared knowledge)
  - [historical] 12.6d Decide memory architecture (enables agent work)
  - [historical] 12.6e Implement lead/quote APIs (foundational for all downstream)
- [historical] 12.7 Create next agent handoff instructions
  - [historical] 12.7a Successful completion criteria for each prompt
  - [historical] 12.7b Test/validation procedures
  - [historical] 12.7c Integration checkpoints
  - [historical] 12.7d Go/no-go decision criteria before moving to next phase
- [historical] 12.8 Create acceptance criteria
  - [historical] 12.8a Prompt 01: Health checks pass, infrastructure documented
  - [historical] 12.8b Prompt 02: OpenClaw/LiteLLM/Nexus running, memory architecture decided
  - [historical] 12.8c Prompt 03: TwentyCRM extended, CRM API implemented
  - [historical] 12.8d Prompt 04: Quote engine running, tests passing
  - [historical] 12.8e Prompt 05: Campaigns active, TCPA compliance verified
  - [historical] 12.8f Prompt 06: n8n workflows running, Activepieces integrated
  - [historical] 12.8g Prompt 07: All APIs operational, OpenAPI docs complete
  - [historical] 12.8h Prompt 08: Secrets managed, audit logging active, compliance hooks deployed
  - [historical] 12.8i Prompt 09: Routes/data loaders/actions defined, webapp structure created
  - [historical] 12.8j Prompt 10: Gitea/WaveTerm/Gastown running
  - [historical] 12.8k Prompt 11: Tests passing, health checks green, SLOs defined
  - [historical] 12.8l Prompt 12: Integrated architecture diagram, roadmap, risk assessment complete

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
