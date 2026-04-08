# PROJECT NYRA — TOP-TO-BOTTOM AGENT PROMPTING PLAN

## Executive Summary

This document is your sequenced execution playbook. Each phase contains **ready-to-fire prompts** for your agent stack (claude-code, claude-flow, Antigravity, Archon OS) with clear dependencies, acceptance criteria, and the exact order to ship Project Nyra.

**Current State**: Infrastructure partially deployed (Tailscale mesh, Docker containers, LiteLLM, GPU workers operational). Core business apps (Twenty CRM, Activepieces, OpenClaw/MoltBot, landing page, drip campaigns) are designed but not built.

**Target State**: Fully operational mortgage lead automation platform generating revenue.

---

## GPU Strategy: EXO vs Current Setup

### TL;DR — Don't Use EXO. Keep Your Current Architecture.

**Why EXO won't work for you right now:**

1. **Linux/NVIDIA = CPU-only inference in EXO.** The RDMA/GPU acceleration that makes EXO impressive is Mac-only (MLX runtime). On your NVIDIA GPUs, EXO falls back to tinygrad on CPU. This is dramatically slower than your current vLLM/Ollama setup.
2. **EXO uses 2-3x more VRAM than Ollama** for identical models (benchmarked: Llama 3.2 1B uses 5.5GB on EXO vs 2.1GB on Ollama).
3. **Single-GPU-per-node limitation.** EXO can't see multiple GPUs in one machine — there's an open feature request for this.
4. **Production readiness concerns.** An October 2025 deep-dive analysis concluded: "Suitable for research and development. Not production-ready." Bugs, no multi-GPU per node, no auth, no fault tolerance.

**Your current setup is already better:**

| Metric | Your Setup (vLLM + Ollama + LiteLLM) | EXO Cluster |
|--------|---------------------------------------|-------------|
| VRAM efficiency | Native CUDA, quantized models | 2-3x overhead |
| Multi-GPU per node | Yes (vLLM tensor parallel) | No |
| Model routing | LiteLLM smart routing by task | Round-robin only |
| Production ready | Yes | No |
| Token throughput | Full GPU acceleration | CPU fallback on Linux |

**Recommendation: Use EXO only for experimentation** if you ever want to test pooling the 3090Ti + 3060 (36GB combined) to run a single large model. But for production inference, your LiteLLM → vLLM/Ollama architecture is strictly superior on NVIDIA hardware.

**For development specifically:** If you want to run a 70B+ model that doesn't fit on a single card, use vLLM's tensor parallelism (requires GPUs in the same machine) or Ollama's automatic CPU offloading. LMCache distributed caching across your workers is the right approach for your multi-machine setup.

---

## Phase 0: Infrastructure Validation (Day 1-2)
*Ensure the foundation is solid before building on it.*

### Prompt 0.1 — Health Check & Service Inventory

**Agent**: claude-code (on orchestrator)
**Estimated Time**: 30 minutes

```
You are performing a health check audit of Project Nyra's distributed infrastructure.

ENVIRONMENT:
- Orchestrator: MinisForum UM680 (Ryzen 7 6800H, 16GB RAM) running Docker via WSL2
- Worker 1 (RTX 3060, 12GB VRAM): Ollama serving small models
- Worker 2 (RTX 5090, 24GB VRAM): vLLM serving Qwen2.5-14B-Instruct-AWQ
- Worker 3 (RTX 3090Ti, 24GB VRAM): Ollama serving medium models
- Networking: Tailscale mesh, 2.5GbE LAN, Cloudflare tunnels on ratehunter.net
- WSL2: Mirrored networking mode

TASKS:
1. Create a script `health-check.sh` that tests connectivity and service status for ALL of the following:
   - Tailscale mesh (ping each node by Tailscale IP)
   - Docker daemon on each node
   - LiteLLM proxy endpoint (port 4000)
   - Ollama endpoints on workers (port 11434)
   - vLLM endpoint on worker-5090 (port 8000)
   - PostgreSQL (port 5432)
   - Redis (port 6379)
   - Cloudflare tunnel status
   - Available VRAM on each GPU worker (nvidia-smi)
   
2. Output a JSON status report with:
   - service_name, endpoint, status (up/down/degraded), latency_ms, details
   
3. Create a `docker-compose.health.yml` that defines healthcheck directives for every service

4. Identify any services from the architecture docs that are NOT yet deployed and list them as "pending"

ACCEPTANCE CRITERIA:
- Script runs from orchestrator and reaches all 3 workers
- JSON report is parseable and complete
- Any failures are clearly flagged with remediation steps
```

### Prompt 0.2 — Tailscale + Cloudflare Tunnel Verification

**Agent**: claude-code
**Estimated Time**: 20 minutes

```
Verify and document the current Tailscale mesh and Cloudflare tunnel configuration for Project Nyra.

TASKS:
1. Run `tailscale status` and capture all node IPs, hostnames, and connection status
2. Run `cloudflared tunnel list` and map each tunnel to its subdomain on ratehunter.net
3. Create/update a NETWORK-MAP.md that documents:
   - Each machine's Tailscale IP, hostname, and role
   - Each Cloudflare tunnel with its public URL and target service
   - Port allocations per machine (no conflicts)
4. Verify the following subdomains are routable (or flag as not yet configured):
   - ratehunter.net (landing page)
   - crm.ratehunter.net (Twenty CRM)
   - flows.ratehunter.net (Activepieces)
   - chat.ratehunter.net (OpenClaw/MoltBot)
   - api.ratehunter.net (API gateway / LiteLLM)
   
OUTPUT: NETWORK-MAP.md with full topology diagram (ASCII or Mermaid)
```

---

## Phase 1: Core Data Layer (Days 3-7)
*Twenty CRM is the backbone. Everything else reads/writes to it.*

### Prompt 1.1 — Twenty CRM Deployment & Custom Mortgage Objects

**Agent**: claude-code or claude-flow (multi-step)
**Estimated Time**: 2-3 hours
**Dependencies**: Phase 0 complete

```
Deploy Twenty CRM and configure it for mortgage brokerage operations.

CONTEXT:
Twenty CRM is our primary data layer. All leads, contacts, deals, and loan data live here.
It's an open-source CRM (React + Node.js + PostgreSQL) that supports custom objects.

TASKS:

1. DEPLOY Twenty CRM via Docker Compose on the orchestrator:
   - Use the official twenty Docker image
   - Connect to the existing PostgreSQL instance (or deploy a dedicated one)
   - Expose on port 3000, tunnel via crm.ratehunter.net
   - Configure environment variables per Twenty docs
   - Ensure data persistence via Docker volumes

2. CREATE custom objects for mortgage domain (via Twenty's API or admin UI):

   a) LOAN object:
      - loan_id (auto-generated)
      - borrower (relation → Contact)
      - co_borrower (relation → Contact, optional)
      - loan_type (enum: conventional, FHA, VA, USDA, HELOC, jumbo, commercial)
      - loan_purpose (enum: purchase, refinance, cash_out_refi)
      - loan_amount (currency)
      - property_value (currency)
      - ltv_ratio (calculated: loan_amount / property_value)
      - interest_rate (decimal)
      - apr (decimal)
      - term_months (integer, default 360)
      - monthly_payment (currency, calculated)
      - status (enum: inquiry, pre_qualified, pre_approved, in_underwriting, 
                conditional_approval, clear_to_close, funded, closed, denied, withdrawn)
      - lock_expiration (date)
      - estimated_close_date (date)
      - assigned_lo (relation → User, default Ellis)
      - source (enum: website, referral, zillow, google_ads, facebook, partner, manual)
      - credit_score (integer)
      - dti_ratio (decimal)
      - notes (rich text)

   b) CAMPAIGN_ENROLLMENT object:
      - contact (relation → Contact)
      - campaign_name (text)
      - campaign_type (enum: new_lead_nurture, pre_approval, application_progress, 
                       post_close, rate_alert, re_engagement)
      - enrolled_at (datetime)
      - current_step (integer)
      - status (enum: active, paused, completed, unsubscribed)
      - last_touch (datetime)
      - next_touch (datetime)
      - channel_preferences (multi-select: email, sms, voice, voicemail)

   c) COMMUNICATION_LOG object:
      - contact (relation → Contact)
      - loan (relation → Loan, optional)
      - channel (enum: email, sms, voice_call, voicemail, in_app_chat)
      - direction (enum: inbound, outbound)
      - content_preview (text, max 500 chars)
      - full_content (rich text)
      - sent_at (datetime)
      - delivered (boolean)
      - opened (boolean)
      - clicked (boolean)
      - replied (boolean)
      - campaign_enrollment (relation → CampaignEnrollment, optional)

   d) QUOTE object:
      - loan (relation → Loan)
      - generated_at (datetime)
      - scenarios (JSON — array of rate/payment/cost combinations)
      - pdf_url (url)
      - sent_to_borrower (boolean)
      - expires_at (datetime)
      - status (enum: draft, sent, viewed, expired, accepted)

3. CONFIGURE Contact object extensions (add fields to built-in Contact):
   - nmls_id (text, for loan officers)
   - credit_score (integer)
   - annual_income (currency)
   - employment_status (enum: employed, self_employed, retired, unemployed)
   - consent_email (boolean, default false) — TCPA compliance
   - consent_sms (boolean, default false) — TCPA compliance
   - consent_voice (boolean, default false) — TCPA compliance
   - consent_timestamp (datetime) — when consent was given
   - lead_score (integer, 0-100)
   - lead_source (enum matching Loan.source)
   - do_not_contact (boolean, default false)

4. CONFIGURE pipeline stages (via Twenty's deal pipeline):
   - Inquiry → Pre-Qualification → Pre-Approval → Application → 
     Underwriting → Conditional Approval → Clear to Close → Funded → Closed

5. TEST: Create 5 sample contacts with loan records, verify all custom fields work

ACCEPTANCE CRITERIA:
- Twenty CRM accessible at crm.ratehunter.net with auth
- All 4 custom objects created with correct field types and relations
- Pipeline stages configured
- Sample data created and queryable via Twenty's API
- Docker volumes persisting data across restarts
```

### Prompt 1.2 — Twenty CRM API Integration Layer

**Agent**: claude-code
**Estimated Time**: 1-2 hours
**Dependencies**: Prompt 1.1

```
Create a reusable API client library for Twenty CRM that other services will use.

CONTEXT:
Multiple services need to read/write CRM data: Activepieces workflows, OpenClaw/MoltBot,
the quote engine, and the landing page. We need a shared client.

TASKS:

1. Create a TypeScript package `@nyra/crm-client` with:
   - TwentyCRMClient class that wraps Twenty's GraphQL API
   - Methods for all CRUD operations on our custom objects:
     * contacts: create, get, search, update, bulkUpdate
     * loans: create, get, getByContact, update, transitionStatus
     * campaignEnrollments: enroll, pause, resume, complete, getActive
     * communicationLogs: log, getByContact, getByLoan, getConversation
     * quotes: create, get, markSent, markViewed
   - Built-in pagination support
   - Rate limiting (respect Twenty's API limits)
   - Error handling with typed errors
   - Authentication via API key

2. Create a REST wrapper (Express/Fastify) that exposes simplified endpoints:
   - POST /api/leads — create contact + auto-enroll in campaign
   - GET /api/leads/:id/conversation — unified view of all comms
   - POST /api/leads/:id/quote — trigger quote generation
   - PATCH /api/leads/:id/status — transition loan status
   - GET /api/dashboard/pipeline — pipeline summary stats

3. Add webhook handlers for Twenty CRM events:
   - contact.created → trigger lead qualification
   - loan.status_changed → trigger appropriate campaign transitions
   - contact.updated → sync to external services

4. Dockerize as `nyra-crm-api` container

OUTPUT:
- /packages/crm-client/ (TypeScript library)
- /services/crm-api/ (REST wrapper + webhooks)
- docker-compose.crm-api.yml
- API documentation (OpenAPI spec)

ACCEPTANCE CRITERIA:
- All CRUD operations work against Twenty CRM
- REST endpoints return correct data
- Webhook handlers fire on CRM events
- OpenAPI spec is complete and accurate
```

---

## Phase 2: Workflow Automation Engine (Days 8-14)
*Activepieces powers all campaigns, triggers, and integrations.*

### Prompt 2.1 — Activepieces Deployment & Configuration

**Agent**: claude-code
**Estimated Time**: 1-2 hours
**Dependencies**: Phase 1 complete

```
Deploy Activepieces and configure it as the workflow automation engine for Project Nyra.

CONTEXT:
Activepieces (MIT license) replaces Zapier/n8n for production workflows. It has native
MCP integration, meaning our AI agents can invoke workflows as tools. It handles all
drip campaigns, triggers, and third-party integrations.

TASKS:

1. DEPLOY Activepieces via Docker Compose:
   - Use official activepieces Docker image
   - PostgreSQL backend (can share instance or dedicate)
   - Redis for queue management
   - Expose on port 8080, tunnel via flows.ratehunter.net
   - Configure environment variables:
     * AP_EXECUTION_MODE=UNSANDBOXED (for MCP server access)
     * AP_WEBHOOK_URL=https://flows.ratehunter.net
     * AP_FRONTEND_URL=https://flows.ratehunter.net
   - Enable MCP server mode

2. CREATE foundational pieces/connections:
   - Twenty CRM connection (API key auth to our CRM API)
   - Twilio connection (for SMS/voice — use sandbox credentials initially)
   - SendGrid connection (for email campaigns)
   - Webhook triggers (for receiving leads from external sources)

3. BUILD core workflow templates (not full campaigns yet — those come in Phase 4):

   a) "Lead Intake" flow:
      Trigger: Webhook (POST from landing page or external source)
      → Validate required fields (name, email, phone, loan_amount)
      → Check for duplicates in CRM
      → Create Contact + Loan in Twenty CRM
      → Set initial lead_score based on completeness
      → Trigger "New Lead Nurture" campaign enrollment
      → Send notification to Ellis (Slack/email)

   b) "Status Change Handler" flow:
      Trigger: Webhook (from CRM API on loan.status_changed)
      → Route based on new status:
        - pre_qualified → pause nurture, start pre-approval campaign
        - denied → send adverse action notice, pause all campaigns
        - clear_to_close → send celebration email, schedule closing
        - closed → start post-close campaign, request review

   c) "Inbound Message Router" flow:
      Trigger: Webhook (from Twilio on SMS reply or email reply)
      → Log to Communication_Log in CRM
      → Pause active campaigns for this contact
      → Notify Ellis for manual follow-up
      → If message contains "STOP" → set do_not_contact, unsubscribe all

4. CONFIGURE Activepieces MCP server endpoint so AI agents can:
   - List available flows
   - Trigger flows with parameters
   - Check flow execution status

ACCEPTANCE CRITERIA:
- Activepieces running at flows.ratehunter.net
- MCP server accessible from LiteLLM/agents
- All 3 foundational flows created and testable via webhook
- Twilio + SendGrid connections configured (sandbox OK)
```

### Prompt 2.2 — Email & SMS Template Engine

**Agent**: claude-code
**Estimated Time**: 2 hours
**Dependencies**: Prompt 2.1

```
Build the email and SMS template engine for mortgage lead campaigns.

CONTEXT:
We need branded, TCPA/CAN-SPAM compliant email and SMS templates that can be
personalized with borrower data. Templates are used by Activepieces flows.

TASKS:

1. Create an email template service:
   - MJML-based responsive email templates (compiles to HTML)
   - Templates needed:
     * new_lead_welcome — personalized quote + CTA to schedule call
     * rate_alert — rate drop notification with updated savings
     * pre_approval_letter — congratulations + next steps
     * document_reminder — missing docs checklist
     * closing_scheduled — celebration + closing details
     * post_close_thank_you — review request + referral incentive
     * re_engagement — "still looking?" with updated rates
   - Each template supports merge variables: {{first_name}}, {{rate}}, 
     {{monthly_payment}}, {{loan_amount}}, etc.
   - All templates include:
     * Physical mailing address (CAN-SPAM)
     * Unsubscribe link
     * NMLS disclosure
     * Equal Housing Lender logo
   - Branding: West Capital Lending / Ellis D Andersen
     * Primary color: #6C5CE7 (purple gradient)
     * Secondary: #0984E3 (blue)
     * CTA: #00B894 (green)

2. Create SMS templates (160 char limit per segment):
   - new_lead_welcome
   - rate_alert
   - appointment_reminder
   - document_reminder
   - pre_approval_expiring
   - STOP instructions in every message

3. Build a template rendering service:
   - POST /api/templates/render with { template_name, channel, merge_data }
   - Returns rendered HTML (email) or text (SMS)
   - Validates all required merge variables are present
   - Tracks which templates are sent to whom (for compliance)

4. Dockerize as `nyra-template-engine`

OUTPUT:
- /services/template-engine/ (Node.js service)
- /templates/email/ (MJML files)
- /templates/sms/ (text files with variable placeholders)
- docker-compose.templates.yml

ACCEPTANCE CRITERIA:
- All templates render correctly with sample data
- Emails pass HTML email validation (Litmus-compatible)
- SMS templates stay within 160 char segments
- CAN-SPAM and TCPA elements present in all templates
- Template service responds in <100ms
```

---

## Phase 3: AI Assistant — OpenClaw/MoltBot (Days 15-21)
*Your personal mortgage AI assistant, replacing Dify.*

### Prompt 3.1 — OpenClaw/MoltBot Deployment

**Agent**: claude-code
**Estimated Time**: 2-3 hours
**Dependencies**: Phase 1 (CRM API available)

```
Deploy OpenClaw/MoltBot as the Nyra AI mortgage assistant with ChatUI.

CONTEXT:
OpenClaw/MoltBot replaces Dify in our stack. It serves as:
1. Personal AI assistant for Ellis (internal, non-borrower-facing initially)
2. Chat interface for interacting with the entire Nyra system
3. Eventually: borrower-facing AI assistant
4. Eventually: voice-enabled via Kyutai Unmute on local GPUs

TASKS:

1. DEPLOY OpenClaw/MoltBot containers:
   - Chat UI container (React-based frontend)
   - Backend/API container
   - Connect to LiteLLM endpoint for model routing
   - Expose Chat UI at chat.ratehunter.net (with auth — internal only for now)

2. CONFIGURE model routing through LiteLLM:
   - Default model: Claude Sonnet (via Anthropic API) for complex reasoning
   - Fallback: Qwen2.5-14B on RTX 5090 for routine queries
   - Gemini Flash for bulk/cheap operations
   - System prompt for "Nyra" persona:

   ```
   You are Nyra, an AI mortgage assistant for Ellis D Andersen at West Capital Lending.
   
   YOUR CAPABILITIES:
   - Look up lead/borrower information in the CRM
   - Check loan pipeline status
   - Generate mortgage quotes (rate comparisons, monthly payments)
   - Trigger drip campaigns or pause/resume them
   - Draft emails and SMS messages for review
   - Analyze rate sheets and suggest optimal loan products
   - Answer mortgage industry questions
   - Help with compliance checks (TILA, RESPA, TCPA)
   
   YOUR TOOLS (via MCP):
   - twenty_crm: Search contacts, loans, view pipeline
   - activepieces: Trigger workflows, check campaign status
   - quote_engine: Generate loan comparisons
   - web_search: Look up current rates, guidelines
   
   YOUR PERSONALITY:
   - Professional but approachable
   - Proactive — suggest next steps
   - Compliance-aware — flag potential issues
   - Data-driven — cite specific numbers
   
   IMPORTANT:
   - Never provide binding rate quotes to borrowers (only estimates)
   - Always include appropriate disclaimers
   - Flag anything that might violate fair lending rules
   - If unsure, say so and recommend Ellis review manually
   ```

3. CONNECT MCP tools:
   - Register CRM API as MCP tool (via Nexus Router)
   - Register Activepieces MCP server
   - Register web search tool
   - Register quote engine (once built in Phase 5)

4. CONFIGURE conversation memory:
   - Use Qdrant for semantic search of past conversations
   - Use Graphiti for entity relationships (borrower ↔ loan ↔ status)
   - Conversations persist across sessions

5. TEST with sample scenarios:
   - "Show me all hot leads from this week"
   - "What's the status on the Johnson loan?"
   - "Draft a follow-up email for leads who haven't responded in 3 days"
   - "What are today's rates for a 30-year conventional?"

ACCEPTANCE CRITERIA:
- MoltBot Chat UI accessible at chat.ratehunter.net (auth-protected)
- Nyra persona responds correctly to mortgage queries
- MCP tools connected and callable from chat
- Conversation memory persists across sessions
- Model routing works (Claude for complex, local for routine)
```

### Prompt 3.2 — Nyra Voice Integration (Future-Ready Scaffolding)

**Agent**: claude-code
**Estimated Time**: 1 hour
**Dependencies**: Prompt 3.1

```
Create the scaffolding for Nyra's voice capabilities. NOT full implementation yet —
just the interfaces and configuration so voice can be plugged in later.

CONTEXT:
Eventually Nyra will support real-time voice conversation using:
- STT: Whisper (local on GPU) or Google Cloud Speech
- TTS: Kyutai Unmute (local on RTX 5090) with ElevenLabs as cloud fallback
- The RTX 5090 (24GB) will handle TTS inference
- LiteLLM routes voice processing to the 5090 specifically

TASKS:

1. Create voice interface definitions:
   - VoiceInput interface: { audio_stream, format, sample_rate, language }
   - VoiceOutput interface: { text_response, audio_stream, model_used }
   - VoiceConfig: { stt_provider, tts_provider, tts_model, voice_id, 
                     local_gpu_endpoint, cloud_fallback }

2. Create a voice routing config in LiteLLM:
   - Route "voice-stt" tasks → Worker with Whisper loaded
   - Route "voice-tts" tasks → RTX 5090 (Kyutai Unmute)
   - Fallback: ElevenLabs API

3. Add a "voice" page placeholder in MoltBot UI:
   - Microphone button (disabled with "Coming Soon" badge)
   - Audio playback area
   - Real-time transcription display
   - Toggle: "Hold to Talk" vs "Always Listening"

4. Document the voice integration plan in VOICE-INTEGRATION.md

OUTPUT:
- /services/voice-gateway/ (stub service with interfaces)
- /docs/VOICE-INTEGRATION.md
- LiteLLM voice routing config

This is scaffolding only — actual voice implementation is Phase 7.
```

---

## Phase 4: Drip Campaign Engine (Days 22-35)
*The revenue-generating core — automated multi-channel lead nurturing.*

### Prompt 4.1 — New Lead Nurture Campaign (7-Day Sequence)

**Agent**: claude-flow (multi-agent for parallel work)
**Estimated Time**: 3-4 hours
**Dependencies**: Phases 1-3 complete

```
Build the complete "New Lead Nurture" 7-day drip campaign in Activepieces.

CONTEXT:
This is the primary revenue driver. When a new lead comes in (via website form, API, 
or inbound email), this campaign automatically engages them with a personalized sequence
across email, SMS, and (eventually) voice channels.

SEQUENCE:
Day 0 (Immediate):
  - Generate personalized quote via quote engine
  - Send welcome email with quote PDF attachment
  - Send welcome SMS with rate highlight
  - Log all communications in CRM
  
Day 1:
  - Send "First-Time Homebuyer Guide" email (PDF attachment)
  - If Day 0 email was opened → bump lead score +10
  
Day 3:
  - Send success story SMS with video link
  - If no engagement yet → send "Did you see our quote?" reminder email
  
Day 5:
  - Send rate update email with urgency ("rates may increase")
  - If lead clicked quote but didn't schedule → send SMS reminder to book call
  
Day 7:
  - Send personal video email from Ellis (Loom/BombBomb link)
  - If no response to anything → move to "re-engagement" campaign
  - If any response → pause automation, notify Ellis

EXIT CONDITIONS (check before every step):
  - Lead replied to ANY message → PAUSE campaign, notify Ellis
  - Lead unsubscribed → STOP all campaigns, update CRM
  - Lead status changed to "qualified" or beyond → transition to Pre-Approval campaign
  - Lead marked do_not_contact → STOP everything
  - consent_email or consent_sms is false → skip that channel

TASKS:

1. Build Activepieces flow: "New Lead Nurture - Controller"
   - Trigger: CRM webhook (contact.created with status=new)
   - Validates consent flags
   - Enrolls in CampaignEnrollment
   - Triggers Day 0 actions immediately
   - Schedules Day 1, 3, 5, 7 actions via delayed triggers

2. Build individual day flows:
   - Each day flow checks exit conditions FIRST
   - Each flow calls template engine for rendering
   - Each flow calls SendGrid (email) or Twilio (SMS)
   - Each flow logs to Communication_Log in CRM
   - Each flow updates CampaignEnrollment.current_step

3. Build engagement tracking flow:
   - SendGrid webhook → email opened/clicked → update CRM + lead score
   - Twilio webhook → SMS delivered/replied → update CRM
   - If reply detected → pause campaign + notify Ellis

4. Build A/B testing framework:
   - Randomly assign leads to variant A or B for subject lines
   - Track open rates per variant
   - After 100 sends, auto-select winner

ACCEPTANCE CRITERIA:
- Full 7-day sequence executes end-to-end with test data
- Exit conditions properly halt campaign
- All communications logged in CRM
- Lead score updates on engagement
- Ellis gets notified on replies within 2 minutes
- Unsubscribe immediately stops all outreach
- A/B test framework tracks variant performance
```

### Prompt 4.2 — Additional Campaign Sequences

**Agent**: claude-flow
**Estimated Time**: 2-3 hours per campaign
**Dependencies**: Prompt 4.1 (use same patterns)

```
Build the remaining drip campaign sequences using the same architecture as 
the New Lead Nurture campaign.

BUILD THESE IN ORDER:

1. PRE-APPROVAL FOLLOW-UP (30-day):
   Trigger: loan.status changes to "pre_approved"
   Cadence: Day 0, 7, 14, 21, 30
   Focus: Keep buyer engaged, rate lock reminders, realtor referrals
   Special: If rate drops >0.25% → immediate alert regardless of schedule

2. APPLICATION IN-PROGRESS (weekly):
   Trigger: loan.status changes to "in_underwriting"  
   Cadence: Weekly check-ins
   Focus: Document checklist progress, milestone updates
   Special: Auto-pause if all docs uploaded; alert Ellis if 5 days of no activity

3. POST-CLOSE DELIGHT (12-month):
   Trigger: loan.status changes to "closed"
   Cadence: Day 0, 30, 90, Month 6, Month 12
   Focus: Thank you, review request, satisfaction survey, refinance check
   Special: Google Review request with direct link; referral incentive tracking

4. RATE ALERT (event-driven):
   Trigger: Market rate change >0.25% from any active lead's quoted rate
   NOT a timed sequence — fires on rate events
   Focus: Updated savings calculation, urgency messaging
   Special: Only fires if lead has active loan inquiry

5. RE-ENGAGEMENT (21-day):
   Trigger: Lead has had zero engagement for 14+ days
   Cadence: Day 0, 7, 14, 21
   Focus: "Still looking?" messaging, updated market info
   Special: After Day 21 with no response → mark as cold, archive

For EACH campaign, follow the same pattern:
- Controller flow with enrollment
- Individual step flows with exit condition checks
- Engagement tracking
- CRM logging
- Compliance checks (consent verification before every touch)
```

---

## Phase 5: Quote Engine & Pricing (Days 36-42)
*Automated quote generation replaces manual Excel spreadsheets.*

### Prompt 5.1 — Mortgage Quote Engine

**Agent**: claude-code
**Estimated Time**: 3-4 hours
**Dependencies**: Phase 1 (CRM), Phase 3 (Nyra assistant)

```
Build the mortgage quote generation engine that replaces Ellis's Excel-based quoting.

CONTEXT:
Ellis currently prices loans manually using an Excel spreadsheet that shows comparisons,
monthly payments, and pricing across multiple scenarios. We're automating this.

Eventually, Nyra (via OpenClaw/MoltBot) will scrape rates from sources like 
rocketmortgage.com until we get direct API access to pricing engines. For now,
we'll build the calculation engine and use manually-entered rate sheets.

TASKS:

1. Create the Quote Engine service:

   INPUT (from CRM or direct):
   - loan_amount (required)
   - property_value (required) → calculates LTV
   - credit_score (required) → determines rate adjustments
   - loan_purpose: purchase | refinance | cash_out
   - loan_type: conventional | FHA | VA | USDA | jumbo
   - term: 15yr | 20yr | 25yr | 30yr
   - property_type: single_family | condo | townhouse | multi_unit
   - occupancy: primary | secondary | investment
   - dti_ratio (optional)
   - down_payment_percent (optional, calculated from LTV if not provided)

   PROCESSING:
   - Load current rate sheet (JSON config, manually updated by Ellis or 
     eventually auto-scraped)
   - Apply LLPAs (Loan Level Price Adjustments) based on:
     * Credit score bands (740+, 720-739, 700-719, 680-699, 660-679, <660)
     * LTV bands (<=60%, 60.01-70%, 70.01-75%, 75.01-80%, 80.01-85%, etc.)
     * Property type adjustments
     * Occupancy adjustments
     * Cash-out adjustments
   - Calculate for MULTIPLE scenarios (3-5 options):
     * Scenario 1: Best rate (highest cost/points)
     * Scenario 2: Par rate (zero cost)
     * Scenario 3: No-cost option (lender credit covers closing)
     * Scenario 4: Lowest payment (longest term)
     * Scenario 5: Fastest payoff (shortest term)

   OUTPUT per scenario:
   - interest_rate (%)
   - apr (%)
   - monthly_principal_interest ($)
   - monthly_taxes_estimate ($)
   - monthly_insurance_estimate ($)
   - monthly_pmi ($ if applicable — auto-calculate based on LTV)
   - total_monthly_payment ($)
   - total_closing_costs ($)
   - lender_credit ($)
   - points_cost ($)
   - cash_to_close ($)
   - total_interest_over_life ($)

2. Create PDF quote generator:
   - Professional PDF with West Capital Lending branding
   - Side-by-side scenario comparison table
   - Monthly payment breakdown pie chart
   - Amortization schedule highlights (Year 1, 5, 10, 15, 30)
   - Disclaimers and disclosures
   - Valid-for date (7 days from generation)
   - Ellis's contact info and NMLS#

3. Create API endpoints:
   - POST /api/quotes/generate → returns JSON + triggers PDF generation
   - GET /api/quotes/:id → returns quote data
   - GET /api/quotes/:id/pdf → returns PDF download
   - POST /api/quotes/:id/send → sends to borrower via email

4. Register as MCP tool for Nyra:
   - "generate_quote" tool with the input schema above
   - Nyra can say "Generate a quote for a $500K conventional purchase, 
     740 credit score, 20% down" and get results

5. Create rate sheet management:
   - Admin endpoint to upload/update rate sheets (JSON)
   - Rate sheet schema: { effective_date, base_rates: { term: rate }, 
     llpas: { adjustment_type: { condition: adjustment } } }
   - Eventually: auto-populate from web scraping (Phase 7+)

OUTPUT:
- /services/quote-engine/ (Node.js or Python service)
- /services/quote-engine/pdf-generator/ 
- docker-compose.quote-engine.yml
- MCP tool definition for Nexus Router

ACCEPTANCE CRITERIA:
- Generates accurate quotes matching manual Excel calculations
- PDF output is professional and branded
- All 5 scenarios calculate correctly
- PMI auto-calculates when LTV > 80%
- API responds in <2 seconds
- MCP tool works from Nyra chat
- Rate sheet is easily updatable
```

---

## Phase 6: Landing Page & Lead Capture (Days 43-49)
*ratehunter.net — the public face that feeds leads into the system.*

### Prompt 6.1 — RateHunter Landing Page

**Agent**: claude-code or Antigravity
**Estimated Time**: 3-4 hours
**Dependencies**: Phase 2 (webhook endpoint for lead intake)

```
Build the RateHunter.net landing page — the primary lead capture interface.

CONTEXT:
This is the public-facing website at ratehunter.net. It needs to:
- Look professional and trustworthy (mortgage industry)
- Capture leads with a quote request form
- Provide Ellis's contact info and scheduling
- Be FAST (<3 second load, target 30%+ visitor-to-lead conversion)
- Be SEO-optimized for "mortgage broker [location]" keywords

TECH STACK:
- Next.js 14 (static generation for speed)
- Tailwind CSS + shadcn/ui components
- Deployed via Docker, tunneled through Cloudflare

TASKS:

1. BUILD the landing page with these sections:

   a) HERO SECTION:
      - Headline: "Find Your Best Mortgage Rate in Minutes"
      - Subhead: "AI-powered rate comparison from 50+ lenders"
      - CTA button: "Get My Free Quote" (scrolls to form)
      - Trust badges: NMLS, Equal Housing, BBB, star rating

   b) QUOTE REQUEST FORM (the lead capture):
      - Step 1: Loan purpose (purchase/refinance/cash-out) — big buttons
      - Step 2: Property details (value, type, location)
      - Step 3: Loan details (amount, down payment slider)
      - Step 4: Your info (name, email, phone, credit score range)
      - Step 5: Consent checkboxes (TCPA compliant):
        * "I consent to receive marketing emails" (required for email)
        * "I consent to receive SMS messages" (required for SMS)  
        * "I consent to receive phone calls" (required for calls)
        * Link to privacy policy and terms
      - Submit → POST to Activepieces webhook (Lead Intake flow)
      - Success: "Your quote is being generated! Check your email in 2 minutes."
      - Multi-step wizard UX (not one long form)

   c) SOCIAL PROOF:
      - Google Reviews integration (4.9 stars, 200+ reviews)
      - Client testimonials (3-4 cards)
      - "Trusted by X homebuyers" counter

   d) HOW IT WORKS:
      - Step 1: Tell us about your loan (2 min)
      - Step 2: Get personalized quotes (instant)
      - Step 3: Compare and choose (your pace)
      - Step 4: Close with confidence (avg 21 days)

   e) ABOUT ELLIS:
      - Professional photo placeholder
      - Bio: 15+ years experience, NMLS#, DRE#
      - Specialties: first-time buyers, investment, jumbo, FHA/VA
      - Calendly embed for scheduling

   h) RATE CALCULATOR WIDGET:
      - Simple embedded calculator
      - Loan amount + rate + term → monthly payment
      - "Want a real quote? Get started above"

   i) FOOTER:
      - Contact info, social links
      - NMLS disclosure, Equal Housing logo
      - Privacy Policy, Terms of Service links
      - Physical address (CAN-SPAM)

2. SEO CONFIGURATION:
   - Meta tags, Open Graph, Twitter cards
   - Schema.org markup (LocalBusiness, FinancialService)
   - Sitemap.xml, robots.txt
   - Target keywords: "mortgage broker southern california", 
     "best mortgage rates LA", "home loan [city]"

3. ANALYTICS:
   - Plausible Analytics integration (self-hosted on Oracle Cloud)
   - Form conversion tracking
   - UTM parameter capture (stored with lead data)

4. DEPLOYMENT:
   - Dockerfile for production build
   - Cloudflare tunnel to ratehunter.net
   - CDN caching for static assets
   - SSL via Cloudflare

OUTPUT:
- /apps/landing/ (Next.js project)
- docker-compose.landing.yml
- Cloudflare tunnel config

ACCEPTANCE CRITERIA:
- Page loads in <3 seconds on mobile
- Form submits successfully to Activepieces webhook
- Lead appears in Twenty CRM within 30 seconds of submission
- TCPA consent checkboxes work correctly
- Mobile responsive (test on iPhone, Android)
- Lighthouse score >90 for Performance, SEO, Accessibility
- Calendly scheduling works
```

---

## Phase 7: Unified Conversation UI (Days 50-60)
*The "Agent Legend / Bonzo replacement" — all comms in one place.*

### Prompt 7.1 — Borrower Conversation Hub

**Agent**: claude-flow (full-stack feature)
**Estimated Time**: 4-6 hours
**Dependencies**: All previous phases

```
Build the unified conversation interface that shows all borrower communications 
(email, SMS, voice, chat) in a single threaded view — like Agent Legend or Bonzo.

CONTEXT:
In mortgage brokerage, you need to see ALL interactions with a borrower in one place:
texts, emails, voicemails, and calls displayed as a unified conversation thread.
This is the feature that makes tools like AgentLegend and Bonzo indispensable.

OPTIONS FOR IMPLEMENTATION:
A) Build as a custom page/extension inside Twenty CRM
B) Build as a standalone React app
C) Build as a page within the MoltBot/OpenClaw UI

RECOMMENDED: Option A — extend Twenty CRM. The CRM already has the data, and building
it there keeps everything in one place. If Twenty's extension system is too limiting,
fall back to Option B with CRM API calls.

TASKS:

1. CREATE "Conversations" view in Twenty CRM (or standalone):

   a) LEFT PANEL — Contact List:
      - Search/filter contacts
      - Sort by: last message, lead score, campaign status
      - Visual indicators: unread messages (badge), hot lead (fire icon),
        active campaign (automation icon)
      - Quick filters: "Needs Response", "Hot Leads", "All Active"

   b) CENTER PANEL — Conversation Thread:
      - Unified timeline showing ALL channels:
        * Email (full HTML render or text preview)
        * SMS (chat bubble style)
        * Voice call (duration, recording link if available)
        * Voicemail (playback widget)
        * AI chat messages (from Nyra, labeled as "AI")
      - Each message shows: channel icon, timestamp, direction (in/out),
        delivery status (sent/delivered/opened/clicked)
      - Messages grouped by date
      - "Load more" for history

   c) RIGHT PANEL — Contact Context:
      - Borrower info card (name, phone, email, credit score)
      - Active loan summary (amount, rate, status, stage)
      - Campaign status (which campaign, current step, next touch)
      - Lead score with history graph
      - Quick actions: "Call", "Text", "Email", "Pause Campaign",
        "Generate Quote", "Transfer to Nyra"

   d) COMPOSE AREA (bottom of center panel):
      - Channel selector: Email | SMS | Internal Note
      - Rich text editor for email, simple text for SMS
      - Template selector (pull from template engine)
      - "Send" button with confirmation
      - "Ask Nyra" button — Nyra drafts a response for review

2. REAL-TIME UPDATES:
   - WebSocket connection for live message updates
   - When borrower texts back → message appears instantly
   - When email is opened → "Seen" indicator updates
   - Push notification to Ellis's browser

3. INTEGRATION POINTS:
   - Twilio webhooks → new inbound SMS/calls appear in real-time
   - SendGrid webhooks → email opens/clicks update in real-time
   - CRM Communication_Log is the source of truth
   - Compose actions call Twilio/SendGrid directly (with CRM logging)

4. MOBILE-RESPONSIVE:
   - Works on phone browsers (Ellis checks leads on the go)
   - Single-column layout on mobile (contact list → thread → details)

ACCEPTANCE CRITERIA:
- All channels visible in unified thread per contact
- Real-time message delivery (< 5 second delay)
- Compose and send email/SMS directly from UI
- Template insertion works
- "Ask Nyra" generates contextual draft
- Mobile-responsive
- Contact list sorts correctly by urgency
```

---

## Phase 8: Integration Testing & Production Hardening (Days 61-70)

### Prompt 8.1 — End-to-End Integration Test Suite

**Agent**: claude-flow
**Estimated Time**: 3-4 hours

```
Create comprehensive end-to-end tests that validate the entire Nyra pipeline.

TEST SCENARIOS:

1. "Happy Path" — New lead through to closed loan:
   - Submit form on ratehunter.net with test data
   - Verify: Lead appears in CRM within 30s
   - Verify: Welcome email sent with quote
   - Verify: Welcome SMS sent
   - Verify: Campaign enrollment created
   - Simulate: Day 1 email fires on schedule
   - Simulate: Lead replies to SMS
   - Verify: Campaign pauses, Ellis notified
   - Manually: Move lead to pre-approved
   - Verify: Pre-approval campaign starts
   - Continue through: closing → post-close campaign

2. "Compliance" — TCPA/CAN-SPAM checks:
   - Submit lead with SMS consent = false
   - Verify: No SMS sent, only email
   - Submit lead, then unsubscribe
   - Verify: All campaigns stop immediately
   - Verify: do_not_contact flag set in CRM
   - Submit same email again
   - Verify: Duplicate detection prevents re-enrollment

3. "Error Handling" — Service failures:
   - Kill Twilio connection → emails still send, SMS failures logged
   - Kill SendGrid → SMS still sends, email failures logged  
   - Kill CRM → leads queue for retry
   - Kill Activepieces → webhook returns 503, landing page shows error

4. "Performance" — Load testing:
   - Simulate 50 simultaneous lead submissions
   - Verify: All processed within 5 minutes
   - Verify: No duplicate sends
   - Verify: CRM handles concurrent writes

5. "Nyra AI" — Assistant accuracy:
   - Ask "Show me today's hot leads" → returns correct list
   - Ask "Generate quote for $400K purchase, 720 credit" → accurate calc
   - Ask "What campaigns is John Smith enrolled in?" → correct answer
   - Ask "Draft a follow-up for leads with no response in 5 days" → 
     reasonable email draft

OUTPUT:
- /tests/e2e/ (test scripts using Playwright + API calls)
- /tests/load/ (k6 or Artillery load test configs)
- Test results report
- List of bugs/issues found
```

### Prompt 8.2 — Security & Compliance Hardening

**Agent**: claude-code
**Estimated Time**: 2-3 hours

```
Perform security hardening and compliance audit for production deployment.

TASKS:

1. AUTHENTICATION & AUTHORIZATION:
   - All admin UIs behind authentication (Twenty CRM, Activepieces, MoltBot)
   - API endpoints require API key or JWT
   - Rate limiting on all public endpoints
   - CORS configured correctly (only ratehunter.net origins)

2. DATA PROTECTION:
   - PII encryption at rest (borrower SSN, DOB if stored)
   - TLS everywhere (Cloudflare handles external, verify internal)
   - Audit log for all data access
   - Secrets management via environment variables (not in code)
   - Database backups automated (daily to Oracle Cloud or S3)

3. COMPLIANCE:
   - TCPA: Consent verification before every outbound message
   - CAN-SPAM: Physical address + unsubscribe in every email
   - TILA: Loan Estimate timing tracked in CRM
   - HMDA: Demographic data collection configured
   - Fair Lending: No discriminatory fields in lead scoring
   - GDPR (if international): Data deletion endpoint
   - CCPA (California): Privacy policy + data access request handling

4. MONITORING:
   - Uptime monitoring via Uptime Kuma (Oracle Cloud)
   - Error alerting → Ellis's phone (via Slack/Telegram)
   - Campaign anomaly detection (sudden spike in unsubscribes)
   - Rate limit alerting (Twilio/SendGrid quota warnings)

OUTPUT:
- SECURITY-AUDIT.md with findings and remediations
- Updated Docker Compose with security configs
- Monitoring dashboard config (Grafana)
- Backup scripts and cron jobs
```

---

## Phase 9: Launch & Iterate (Days 71+)

### Prompt 9.1 — Production Launch Checklist

**Agent**: claude-code
**Estimated Time**: 1-2 hours

```
Create and execute the production launch checklist for Project Nyra.

CHECKLIST:

PRE-LAUNCH:
[ ] All services passing health checks
[ ] SSL certificates valid on all subdomains
[ ] Twilio production credentials configured (not sandbox)
[ ] SendGrid production credentials and domain verification
[ ] Rate sheets loaded with current market rates
[ ] All email templates proofread and branded
[ ] NMLS number correct in all templates
[ ] Physical address correct in email footers
[ ] Privacy policy and terms of service published
[ ] Unsubscribe endpoint tested
[ ] Database backups running on schedule
[ ] Monitoring alerts configured and tested
[ ] Load test passed (50 concurrent leads)
[ ] Ellis has reviewed and approved all borrower-facing content

LAUNCH DAY:
[ ] DNS propagation verified for all subdomains
[ ] Landing page live at ratehunter.net
[ ] Submit test lead through full pipeline
[ ] Verify quote email arrives with correct data
[ ] Verify SMS arrives with correct content
[ ] Verify CRM shows lead with all data
[ ] Verify campaign enrollment is active
[ ] Enable Google Ads / Facebook campaigns to drive traffic
[ ] Monitor first 10 real leads manually

POST-LAUNCH (Week 1):
[ ] Review all sent emails for accuracy
[ ] Check unsubscribe rates (target <2%)
[ ] Check email deliverability (target >95%)
[ ] Check SMS delivery rates
[ ] Review Nyra AI responses for accuracy
[ ] Collect feedback from first borrower interactions
[ ] Fix any bugs found
[ ] Optimize slow queries or API calls

OUTPUT:
- LAUNCH-CHECKLIST.md (with checkboxes)
- Launch day runbook
- Rollback procedures if critical issues found
```

---

## Prompt Sequencing Summary

| Phase | Prompts | Days | Dependencies | Revenue Impact |
|-------|---------|------|-------------|----------------|
| 0: Infrastructure | 0.1, 0.2 | 1-2 | None | Foundation |
| 1: CRM Data Layer | 1.1, 1.2 | 3-7 | Phase 0 | Foundation |
| 2: Workflow Engine | 2.1, 2.2 | 8-14 | Phase 1 | Foundation |
| 3: AI Assistant | 3.1, 3.2 | 15-21 | Phase 1 | Productivity |
| 4: Drip Campaigns | 4.1, 4.2 | 22-35 | Phases 1-3 | **HIGH — Lead nurturing** |
| 5: Quote Engine | 5.1 | 36-42 | Phases 1, 3 | **HIGH — Quote automation** |
| 6: Landing Page | 6.1 | 43-49 | Phase 2 | **HIGH — Lead capture** |
| 7: Conversation UI | 7.1 | 50-60 | All prior | **CRITICAL — Daily operations** |
| 8: Hardening | 8.1, 8.2 | 61-70 | All prior | Compliance/Trust |
| 9: Launch | 9.1 | 71+ | All prior | **GO LIVE** |

**Parallelization opportunities:**
- Phases 3 + 5 can run in parallel (different teams/agents)
- Phase 6 (landing page) can start as early as Phase 2 completion
- Phase 8 testing can begin partially during Phases 5-7

**Critical path:** 1 → 2 → 4 → 7 → 8 → 9

---

## Agent Assignment Guide

| Agent Tool | Best For | Use In Phases |
|-----------|----------|---------------|
| **claude-code** | Single-service implementation, Docker configs, API development | 0, 1, 2, 3, 5, 6, 8 |
| **claude-flow** | Multi-agent parallel work, full-stack features, integration testing | 4, 7, 8 |
| **Antigravity (Gemini)** | Frontend UI work, landing page, bulk code generation | 6, 7 |
| **Archon OS** | Prompt management, task tracking, memory management | All (as project manager) |

---

## Archon OS Task Management Setup

Use Archon OS to track progress across all phases:

```
PROJECT: Nyra MVP
PHASES: 9
TOTAL PROMPTS: 15

For each prompt, track:
- Status: not_started | in_progress | blocked | review | complete
- Agent: which tool is executing
- Started: datetime
- Completed: datetime
- Blockers: list of issues
- Output artifacts: list of files/services created
- Test status: pass | fail | not_tested
```

---

*Document Version: 1.0*
*Created: 2026-03-06*
*Owner: Ellis D Andersen / Project Nyra*
