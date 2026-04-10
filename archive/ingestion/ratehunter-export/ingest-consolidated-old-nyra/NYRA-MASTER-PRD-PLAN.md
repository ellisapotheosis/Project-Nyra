# PROJECT NYRA — MASTER PRD & SPARC WORKFLOW PLAN

**Version:** 2.0  
**Date:** January 2026  
**Purpose:** Consolidate all project goals, architecture decisions, and implementation workflows

---

## TABLE OF CONTENTS

1. [Architecture Decisions](#1-architecture-decisions)
2. [Tool Positioning Matrix](#2-tool-positioning-matrix)
3. [PRD: Lead Ingestion Pipeline](#3-prd-lead-ingestion-pipeline)
4. [PRD: Campaign Automation Engine](#4-prd-campaign-automation-engine)
5. [PRD: Quote Generation System](#5-prd-quote-generation-system)
6. [PRD: Nyra Admin UI](#6-prd-nyra-admin-ui)
7. [PRD: Nyra Ops Assistant (Dify)](#7-prd-nyra-ops-assistant)
8. [SPARC Master Workflow](#8-sparc-master-workflow)
9. [Claude-Flow Configuration](#9-claude-flow-configuration)
10. [Archon OS Integration](#10-archon-os-integration)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. ARCHITECTURE DECISIONS

### 1.1 Confirmed Stack Decisions

| Layer | Tool | Decision | Rationale |
|-------|------|----------|-----------|
| **CRM** | Twenty CRM (main repo) | USE as-is, don't fork | v1.11+ has native workflows, AI, live updates |
| **CRM Integration** | n8n-nodes-twenty | USE | Community node works with ANY Twenty instance |
| **MCP (AI Access)** | KonstiDoll/twenty-crm-mcp-server | USE | Best GraphQL-based MCP (29 tools) |
| **MCP (Custom)** | Fork jezweb/twenty-mcp | FORK separately | For Nyra-specific mortgage tools |
| **Automation** | n8n | USE | Campaign execution, drip workflows |
| **Connectors** | Activepieces | USE alongside n8n | Team-friendly UI, connector catalog |
| **Chat UI** | Dify (embedded) | USE | Embed into Nyra Admin, not Twenty |
| **Admin UI** | Nyra Admin (shadcn) | BUILD custom | Campaign builder, lead timeline |
| **Landing** | RateHunter.net | BUILD | Cloudflare Pages deployment |
| **MCP Aggregator** | Nexus Router | USE | Single entry point for all MCP tools |
| **LLM Routing** | claude-flow providers | USE | Replaces need for separate LiteLLM |
| **Secrets** | Infisical | USE both CLI + MCP | CLI for infra, MCP for agents |
| **Dev Orchestration** | Claude-flow (SPARC) | USE | Code generation, swarms |
| **Knowledge/Tasks** | Archon OS | USE | Project knowledge base, task tracking |
| **Memory** | Graphiti + Letta | USE | Temporal knowledge graph |

### 1.2 Yes, n8n-nodes-twenty Works with Regular Twenty

**Confirmation:** `shodgson/n8n-nodes-twenty` is a community n8n node that:
- Connects to ANY Twenty CRM instance via API
- Uses OpenAPI spec to dynamically discover schema
- Supports all standard objects AND custom objects
- Compatible with Twenty v1.0.3+ (you're on v1.11+)

```bash
# Install in n8n
cd ~/.n8n/custom
npm install n8n-nodes-twenty

# Or via n8n UI: Settings → Community Nodes → Install → n8n-nodes-twenty
```

### 1.3 Claude-Flow Positioning

**Claude-flow lives OUTSIDE Nexus Router.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT TIME                                 │
│  ┌─────────────────┐                                                │
│  │   Claude-Flow   │ ← Your local dev machine                       │
│  │    (SPARC)      │                                                │
│  │                 │                                                │
│  │  - Swarms       │     Calls Anthropic API directly              │
│  │  - Agents       │──────────────────────────────────►  Claude    │
│  │  - GOAP         │                                                │
│  └─────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      RUNTIME (Production)                            │
│                                                                      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │
│  │   Nyra Admin    │────►│  Nexus Router   │────►│  MCP Servers  │ │
│  │   (Frontend)    │     │  (Aggregator)   │     │               │ │
│  └─────────────────┘     │                 │     │ - Twenty MCP  │ │
│                          │  - MCP routing  │     │ - Graphiti    │ │
│  ┌─────────────────┐     │  - LLM routing  │     │ - Filesystem  │ │
│  │   Dify Apps     │────►│  - Auth/limits  │     │ - GitHub      │ │
│  │   (Chat UI)     │     │  - Observability│     └───────────────┘ │
│  └─────────────────┘     └────────┬────────┘                       │
│                                   │                                 │
│                                   ▼                                 │
│                          ┌─────────────────┐                       │
│                          │  LLM Providers  │                       │
│                          │ Claude/GPT/etc  │                       │
│                          └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Claude-flow is a **development tool** that runs on your machine. Nexus Router is a **runtime infrastructure** that handles production AI calls.

### 1.4 Infisical: Use BOTH CLI and MCP

| Use Case | Tool | Example |
|----------|------|---------|
| Docker compose secrets | Infisical CLI | `infisical run -- docker compose up` |
| n8n workflow secrets | Infisical CLI | Inject at container start |
| AI agent needs a secret | Infisical MCP | Agent calls `get_secret("TWILIO_AUTH")` |
| CI/CD pipelines | Infisical CLI | GitHub Actions integration |

```bash
# CLI for infrastructure
infisical run --env=prod -- docker compose up

# MCP for agents (in Nexus Router config)
mcpServers:
  infisical:
    command: npx
    args: [-y, @anthropic/infisical-mcp-server]
    env:
      INFISICAL_TOKEN: ${INFISICAL_UNIVERSAL_AUTH_TOKEN}
```

### 1.5 Archon OS: Knowledge + Tasks, NOT Second Orchestrator

**Decision:** Use Archon as your **knowledge management and task tracking backbone**, not as a competing orchestrator.

**Archon provides:**
- Web crawling for documentation (mortgage guidelines, API docs)
- Document processing (uploaded PDFs, compliance docs)
- Vector search with RAG for AI assistants
- Task management with hierarchical projects
- MCP server for Claude Code/Cursor integration

**You should NOT:**
- Use Archon to replace claude-flow's SPARC methodology
- Run Archon as a "second orchestrator" for code generation
- Duplicate task management in both Archon and Twenty CRM

**Integration Pattern:**
```
┌─────────────────────────────────────────────────────────────┐
│                     ARCHON OS                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Knowledge   │  │    Task      │  │     MCP      │      │
│  │    Base      │  │  Management  │  │   Server     │      │
│  │              │  │              │  │              │      │
│  │ - Docs       │  │ - Project    │  │ Tools for    │      │
│  │ - Guidelines │  │   features   │  │ Claude Code  │      │
│  │ - API refs   │  │ - Tasks      │  │ Cursor, etc  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    Supabase PostgreSQL                      │
│                    (separate from Twenty)                   │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ MCP Protocol
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Claude Code  │  │   Cursor     │  │  Claude-Flow │      │
│  │  (Terminal)  │  │    (IDE)     │  │   (SPARC)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│  All can query Archon for:                                 │
│  - Project documentation                                    │
│  - Current task assignments                                 │
│  - Mortgage industry knowledge                              │
│  - API references                                           │
└─────────────────────────────────────────────────────────────┘
```

### 1.6 Database Strategy

**DO NOT merge Archon and Twenty databases.**

| Database | Purpose | Technology |
|----------|---------|------------|
| Twenty DB | CRM data (leads, contacts, pipeline) | PostgreSQL |
| Archon DB | Knowledge + tasks for dev | Supabase PostgreSQL + pgvector |
| Nyra AI DB | Memory (Graphiti/Letta) + embeddings | PostgreSQL + pgvector |

**Why separate:**
- Different lifecycle (CRM data is business-critical, dev knowledge is more transient)
- Different backup strategies
- Avoid schema conflicts
- Archon uses Supabase-specific features

---

## 2. TOOL POSITIONING MATRIX

| Goal | Primary Tool | Why Not Alternatives |
|------|-------------|---------------------|
| **Project specs → code** | Claude-flow SPARC | Maestro lacks SPARC methodology |
| **Task tracking for dev** | Archon OS | Twenty CRM is for business data |
| **Knowledge base** | Archon OS | Built-in RAG, vector search |
| **Swarm orchestration** | Claude-flow swarms | Native multi-agent support |
| **MCP aggregation** | Nexus Router | Single control plane |
| **LLM routing** | Claude-flow providers | Simpler than LiteLLM for dev |
| **Secrets management** | Infisical (CLI + MCP) | Both runtime and agent access |
| **CRM workflows** | n8n + Twenty native | Activepieces for simple connectors |
| **AI chat UI** | Dify embedded | Open-source, customizable |
| **Campaign execution** | n8n | Scheduling, branching, timers |

---

## 3. PRD: LEAD INGESTION PIPELINE

### 3.1 Overview

**Product:** Automated lead ingestion system that receives leads from multiple sources, normalizes data, creates CRM records, and initiates campaigns.

### 3.2 Problem Statement

- Mortgage leads arrive from 5+ sources with different schemas
- Manual entry causes delays (industry average: 47 hours to first contact)
- No standardized deduplication
- Consent tracking is inconsistent

### 3.3 Goals

| Metric | Target |
|--------|--------|
| Ingestion latency | < 60 seconds |
| First outreach | < 5 minutes |
| Deduplication accuracy | > 99% |
| Source coverage | 5 sources (LeadMailbox, LendingTree, FreeRateUpdate, RateHunter, Email) |

### 3.4 User Stories

1. **As a broker**, I want leads to appear in my CRM within 1 minute of submission so I can respond faster than competitors.
2. **As a broker**, I want duplicate leads merged automatically so I don't waste time on the same person.
3. **As a compliance officer**, I want consent timestamps recorded for every lead source.

### 3.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| LI-001 | Receive webhooks from LeadMailbox, LendingTree, FreeRateUpdate | P0 |
| LI-002 | Receive form submissions from RateHunter.net | P0 |
| LI-003 | Poll IMAP inbox for email leads | P1 |
| LI-004 | Normalize all leads to canonical schema | P0 |
| LI-005 | Dedupe by email and phone | P0 |
| LI-006 | Create Person + MortgageLead in Twenty CRM | P0 |
| LI-007 | Assign campaign based on loanPurpose | P0 |
| LI-008 | Emit event to Redis for real-time dashboard | P1 |
| LI-009 | Queue quote generation job | P2 |

### 3.6 Data Schema

```typescript
interface CanonicalLead {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;                    // E.164 format
  
  loanPurpose: 'PURCHASE' | 'REFI_RATE' | 'REFI_CASH' | 'HELOC' | 'COMMERCIAL';
  loanAmount: number;
  propertyValue?: number;
  propertyState: string;            // 2-letter code
  propertyType?: 'SFR' | 'CONDO' | 'MULTI' | 'MANUFACTURED';
  creditScore?: number;
  employmentType?: 'W2' | 'SELF_EMPLOYED' | 'RETIRED';
  
  source: string;
  sourceLeadId?: string;
  consentTimestamp: Date;
}
```

### 3.7 Non-Functional Requirements

- **Availability:** 99.9% uptime for webhook endpoints
- **Security:** Webhook signature validation, API key auth
- **Compliance:** TCPA consent tracking, CCPA data handling

---

## 4. PRD: CAMPAIGN AUTOMATION ENGINE

### 4.1 Overview

**Product:** Multi-channel drip campaign system that executes timed sequences across voice, SMS, and email, with automatic termination on response.

### 4.2 Problem Statement

- Manual follow-up is inconsistent and slow
- No unified view of all communication channels
- Compliance violations from improper opt-out handling
- Campaigns continue after borrower responds (wastes money, annoys prospects)

### 4.3 Goals

| Metric | Target |
|--------|--------|
| Campaign execution accuracy | 100% scheduled actions delivered |
| Response termination latency | < 30 seconds |
| STOP processing latency | < 10 seconds |
| Contact rate | > 45% |
| Compliance violations | 0 |

### 4.4 User Stories

1. **As a broker**, I want campaigns to automatically stop when a borrower responds so I can have a real conversation.
2. **As a broker**, I want STOP requests processed immediately to stay compliant.
3. **As a broker**, I want to see all communications in one timeline per lead.

### 4.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| CA-001 | Execute voice calls via Twilio | P0 |
| CA-002 | Drop voicemails via Twilio | P0 |
| CA-003 | Send SMS via Twilio | P0 |
| CA-004 | Send emails via SendGrid | P0 |
| CA-005 | Detect incoming responses (any channel) | P0 |
| CA-006 | Terminate campaign on response | P0 |
| CA-007 | Process STOP keywords immediately | P0 |
| CA-008 | Respect time-of-day restrictions (8 AM - 9 PM) | P0 |
| CA-009 | Support Day 0 offset timing (from intake) | P0 |
| CA-010 | Support Day 1+ scheduled timing | P0 |
| CA-011 | Log all activities to Twenty CRM | P0 |
| CA-012 | Support campaign templates per loan purpose | P1 |

### 4.6 Campaign Template Structure

```typescript
interface CampaignTemplate {
  id: string;
  name: string;
  loanPurpose: string;
  steps: CampaignStep[];
}

interface CampaignStep {
  order: number;
  day: number;              // 0 = intake day, 1+ = scheduled
  offsetMinutes?: number;   // For day 0: minutes from intake
  scheduledTime?: string;   // For day 1+: "07:00", "11:00"
  channel: 'voice' | 'sms' | 'email' | 'missed_call_ping';
  templateId: string;
  voicemailAudio?: string;  // URL for voicemail drop
}
```

---

## 5. PRD: QUOTE GENERATION SYSTEM

### 5.1 Overview

**Product:** Automated quote generation that produces multi-option rate quotes with PDF output, integrated with campaign delivery.

### 5.2 Problem Statement

- Quote generation is manual (Excel spreadsheets)
- Inconsistent formatting
- No audit trail
- Slow turnaround (hours to days)

### 5.3 Goals

| Metric | Target |
|--------|--------|
| Quote generation time | < 5 minutes |
| Calculation accuracy | Excel parity (± $0.01) |
| Options per quote | 3 (lowest rate, lowest cost, balanced) |

### 5.4 User Stories

1. **As a broker**, I want quotes generated automatically when I have sufficient lead data.
2. **As a broker**, I want 3 options to present to borrowers.
3. **As a compliance officer**, I want all quotes logged with calculation details.

### 5.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| QG-001 | Calculate PMT (monthly payment) | P0 |
| QG-002 | Calculate APR (annual percentage rate) | P0 |
| QG-003 | Calculate cash-to-close | P0 |
| QG-004 | Generate 3 options (rate/cost/balanced) | P0 |
| QG-005 | Output JSON for API consumption | P0 |
| QG-006 | Generate PDF quote sheet | P1 |
| QG-007 | Store quote in Twenty CRM | P0 |
| QG-008 | Audit trail with calculation inputs | P0 |

---

## 6. PRD: NYRA ADMIN UI

### 6.1 Overview

**Product:** Broker dashboard with unified lead timeline, campaign builder, quote preview, and embedded AI assistant.

### 6.2 Problem Statement

- Twenty CRM provides generic views, not mortgage-specific
- No unified communication timeline (AgentLegend-style)
- Campaign building requires technical knowledge
- No AI assistance for lead research

### 6.3 Goals

| Metric | Target |
|--------|--------|
| Lead detail load time | < 2 seconds |
| Campaign creation time | < 5 minutes |
| AI response time | < 3 seconds |

### 6.4 User Stories

1. **As a broker**, I want to see all calls, texts, emails for a lead in one timeline.
2. **As a broker**, I want to build campaigns with drag-and-drop.
3. **As a broker**, I want to ask an AI assistant questions about my leads.

### 6.5 Key Components

| Component | Description |
|-----------|-------------|
| LeadList | Searchable, filterable list of leads |
| LeadDetail | Unified timeline + lead info + actions |
| CampaignBuilder | Visual campaign step editor |
| CampaignTemplates | Pre-built templates by loan purpose |
| QuotePreview | Generated quote with PDF download |
| ChatWidget | Dify-embedded Nyra Ops assistant |
| Settings | Twenty API config, Twilio/SendGrid keys |

### 6.6 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + tweakcn + Magic UI
- **State:** TanStack Query
- **Styling:** Tailwind CSS
- **Chat:** Dify embed.js

---

## 7. PRD: NYRA OPS ASSISTANT

### 7.1 Overview

**Product:** AI assistant embedded in Nyra Admin that can query CRM data, draft messages, and provide mortgage knowledge.

### 7.2 Problem Statement

- Brokers need quick access to lead information during calls
- Drafting personalized messages is time-consuming
- Mortgage guidelines are complex and change frequently

### 7.3 Goals

| Metric | Target |
|--------|--------|
| Query response time | < 3 seconds |
| Lead lookup accuracy | 100% |
| Message draft quality | Usable with minimal editing |

### 7.4 User Stories

1. **As a broker**, I want to ask "What's John Smith's credit score?" and get an instant answer.
2. **As a broker**, I want to say "Draft a follow-up email for Jane Doe" and get a personalized message.
3. **As a broker**, I want to ask "What are FHA loan limits in California?" and get current information.

### 7.5 Dify App Configuration

```yaml
name: Nyra Ops
type: chatbot
model: claude-sonnet-4-20250514

tools:
  - twenty_crm_mcp:
      - get_person
      - search_people
      - get_mortgage_lead
      - search_opportunities
      - create_note
      
  - archon_mcp:
      - search_knowledge
      - get_task
      
knowledge_bases:
  - mortgage_guidelines    # FHA, VA, Conventional rules
  - company_templates      # Email/SMS templates
  - compliance_docs        # TCPA, CAN-SPAM, CFPB guidance

system_prompt: |
  You are Nyra Ops, an AI assistant for mortgage brokers.
  You have access to CRM data via Twenty MCP and knowledge via Archon.
  
  Guidelines:
  - Be concise and actionable
  - Always verify lead data before drafting messages
  - Never provide rate advice (escalate to human)
  - Include compliance disclaimers when appropriate
```

---

## 8. SPARC MASTER WORKFLOW

### 8.1 Initialize SPARC Project

```bash
# In project-nyra directory
npx claude-flow@alpha init --sparc

# Initialize goal module for complex planning
npx claude-flow@alpha goal init

# Verify setup
npx claude-flow@alpha status
```

### 8.2 SPARC Workflow Files

Create these files in `project-nyra/.sparc/`:

#### 8.2.1 `specs/lead-ingestion.md`
```markdown
# SPARC: Lead Ingestion Pipeline

## S - Specification
[Copy from PRD Section 3]

## P - Pseudocode
```
FUNCTION ingest_lead(source, payload):
    lead = normalize(payload, source)
    existing = search_twenty(lead.email, lead.phone)
    IF existing:
        person_id = update_twenty(existing.id, lead)
    ELSE:
        person_id = create_person(lead)
    mortgage_lead = create_mortgage_lead(person_id, lead)
    campaign = select_campaign(mortgage_lead.loanPurpose)
    trigger_campaign(mortgage_lead.id, campaign.id)
    RETURN success
```

## A - Architecture
- n8n Webhook → Code Node → Twenty Node → Execute Workflow

## R - Refinement
- [ ] E.164 phone normalization
- [ ] Idempotency keys
- [ ] Error handling with retry

## C - Completion
- [ ] Deploy workflow to n8n
- [ ] Test with sample leads from each source
- [ ] Monitor for 24 hours
```

#### 8.2.2 `specs/campaign-engine.md`
```markdown
# SPARC: Campaign Automation Engine

## S - Specification
[Copy from PRD Section 4]

## P - Pseudocode
```
FUNCTION execute_campaign(leadId, campaignId):
    lead = get_lead(leadId)
    steps = get_campaign_steps(campaignId)
    
    FOR EACH step IN steps:
        delay = calculate_delay(step, lead.createdAt)
        WAIT(delay)
        
        IF lead.campaignStatus != "ACTIVE":
            BREAK
            
        SWITCH step.channel:
            CASE "voice": twilio_call(lead.phone, step.template)
            CASE "sms": twilio_sms(lead.phone, step.template)
            CASE "email": sendgrid_email(lead.email, step.template)
        
        log_activity(leadId, step)
```

## A - Architecture
[See campaign architecture diagram]

## R - Refinement
- [ ] Time-of-day restrictions
- [ ] Timezone handling
- [ ] Retry on delivery failure

## C - Completion
- [ ] Test campaigns for each loan purpose
- [ ] Verify response termination
- [ ] Verify STOP processing
```

### 8.3 GOAP Goals

```bash
# Create the entire lead pipeline
@agent-goal-planner "Deploy lead ingestion pipeline with:
1. n8n webhook for 5 lead sources
2. Normalization to canonical schema
3. Twenty CRM Person + MortgageLead creation
4. Campaign assignment by loan purpose
5. Full test coverage with sample leads"

# Create the campaign system
@agent-goal-planner "Deploy campaign automation with:
1. n8n scheduled workflow execution
2. Twilio voice/SMS integration
3. SendGrid email integration
4. Response detection and termination
5. STOP keyword processing
6. Activity logging to Twenty CRM"
```

---

## 9. CLAUDE-FLOW CONFIGURATION

### 9.1 Environment Setup

```powershell
# set-claude-env.ps1
$env:CLAUDE_PROJECT_TYPE = "web-development"
$env:CLAUDE_STACK = "react,typescript,node,postgres"
$env:CLAUDE_TEAM_SIZE = "small"
$env:CLAUDE_METHODOLOGY = "agile"
$env:CLAUDE_PROJECT_NAME = "project-nyra"
$env:CLAUDE_ARCHITECTURE = "microservices"
$env:CLAUDE_TESTING = "tdd"
$env:CLAUDE_DEPLOYMENT = "containerized"
```

### 9.2 Template Config

```yaml
# .claude-flow/template-config.yml
project:
  type: web-development
  stack: [react, typescript, node, postgres]
  methodology: agile
  team_size: small
  name: "Project Nyra"
  description: "AI-augmented mortgage operations platform"

swarm:
  topology: mesh
  max_agents: 8
  coordination: parallel
  pools:
    architect:
      count: 1
      model: claude-sonnet-4-20250514
      skills: [system-design, api-design, database-design]
    developer:
      count: 4
      model: claude-sonnet-4-20250514
      skills: [typescript, react, nestjs, n8n]
    reviewer:
      count: 2
      model: claude-sonnet-4-20250514
      skills: [code-review, security, compliance]
    researcher:
      count: 1
      model: gemini-2.0-flash
      skills: [documentation, mortgage-industry]

patterns:
  testing: tdd
  architecture: microservices
  deployment: containerized
  code_style:
    formatting: prettier
    linting: eslint
    type_checking: strict

routing:
  # Task routing rules
  simple:
    provider: ollama
    model: phi3:mini
    patterns: ["explain", "summarize", "format"]
  standard:
    provider: anthropic
    model: claude-sonnet-4-20250514
    patterns: ["implement", "refactor", "review"]
  complex:
    provider: anthropic
    model: claude-opus-4-20250514
    patterns: ["architect", "security-audit", "compliance"]
  
memory:
  provider: graphiti
  embedding_model: nomic-embed-text
  persistence: true

claude_md:
  sections:
    - project_overview
    - architecture
    - tech_stack
    - development_guidelines
    - testing_strategy
    - deployment
    - team_conventions
  custom_rules:
    - "Use tweakcn/shadcn for all UI components"
    - "Follow Nyra color palette (navy #1B365D primary)"
    - "All API endpoints must have OpenAPI documentation"
    - "Mortgage calculations must match Excel parity tests"
    - "Never provide rate advice without human approval"
    - "Log all PII access for compliance audit"
```

### 9.3 Provider Configuration

```yaml
# .claude-flow/providers.yml
providers:
  anthropic:
    enabled: true
    api_key: ${ANTHROPIC_API_KEY}
    default_model: claude-sonnet-4-20250514
    
  openrouter:
    enabled: true
    api_key: ${OPENROUTER_API_KEY}
    models:
      - anthropic/claude-3.5-sonnet
      - google/gemini-2.0-flash
      - deepseek/deepseek-chat
      
  ollama:
    enabled: true
    base_url: http://100.x.x.x:11434  # Tailscale IP of GPU worker
    models:
      - phi3:mini
      - llama3.2:3b
      - nomic-embed-text
      
  vllm:
    enabled: true
    base_url: http://100.x.x.x:8000  # Tailscale IP of RTX 5090
    models:
      - meta-llama/Llama-3.1-70B-Instruct
```

---

## 10. ARCHON OS INTEGRATION

### 10.1 Setup

```bash
# Clone Archon (stable branch)
git clone -b stable https://github.com/coleam00/archon.git ~/archon
cd ~/archon

# Configure environment
cp .env.example .env
# Edit .env:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-key

# Run database migration
# In Supabase SQL Editor, run: migration/complete_setup.sql

# Start Archon
docker compose up --build -d
```

### 10.2 Configure MCP Connection

Add Archon MCP to your AI tools:

```json
// Claude Desktop / Cursor config
{
  "mcpServers": {
    "archon": {
      "command": "node",
      "args": ["/path/to/archon/python/src/mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your-key"
      }
    }
  }
}
```

Or connect via HTTP (if running Archon server):
```json
{
  "mcpServers": {
    "archon": {
      "url": "http://localhost:8051/mcp"
    }
  }
}
```

### 10.3 Populate Knowledge Base

1. **Crawl Mortgage Documentation:**
   - Go to http://localhost:3737 → Knowledge Base → Crawl Website
   - Enter: https://www.hud.gov/program_offices/housing/sfh/ins/insured_loans
   - Crawl FHA guidelines

2. **Upload Company Docs:**
   - Upload your email/SMS templates
   - Upload compliance policies
   - Upload pricing matrices

3. **Create Project Structure:**
   - Projects → New Project: "Project Nyra"
   - Features:
     - Lead Ingestion Pipeline
     - Campaign Automation
     - Quote Engine
     - Nyra Admin UI
     - Nyra Ops Assistant
   - Tasks: Import from SPARC specs

### 10.4 Integration with Claude-Flow

When using claude-flow for development, your agents can query Archon:

```bash
# In claude-flow session
@researcher "Search Archon for FHA loan limits documentation"
@developer "Check Archon for the current Lead Ingestion tasks"
```

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)

| Task | Owner | Dependencies |
|------|-------|--------------|
| Deploy Twenty CRM | DevOps | Docker, PostgreSQL |
| Create custom objects | Backend | Twenty CRM running |
| Install n8n-nodes-twenty | Backend | n8n running |
| Set up Archon OS | DevOps | Supabase account |
| Initialize claude-flow SPARC | All | Local dev setup |

### Phase 2: Lead Pipeline (Week 3-4)

| Task | Owner | Dependencies |
|------|-------|--------------|
| Build WF_LEAD_INGEST | Backend | n8n-nodes-twenty |
| Configure lead source webhooks | Backend | Cloudflare tunnel |
| Implement normalization | Backend | Canonical schema |
| Build campaign assignment | Backend | Campaign templates |

### Phase 3: Campaign System (Week 5-6)

| Task | Owner | Dependencies |
|------|-------|--------------|
| Build WF_CAMPAIGN_EXECUTE | Backend | Twilio, SendGrid |
| Build WF_RESPONSE_HANDLER | Backend | Twilio webhooks |
| Implement STOP processing | Backend | Compliance review |
| Create campaign templates | Business | Template design |

### Phase 4: Nyra Admin (Week 7-8)

| Task | Owner | Dependencies |
|------|-------|--------------|
| Scaffold Next.js app | Frontend | Design mockups |
| Build LeadDetail timeline | Frontend | Twenty API |
| Build CampaignBuilder | Frontend | Campaign schema |
| Embed Dify chat | Frontend | Dify app |

### Phase 5: Quote & Polish (Week 9-10)

| Task | Owner | Dependencies |
|------|-------|--------------|
| Build Quote API | Backend | Pricing formulas |
| Build QuotePreview UI | Frontend | Quote API |
| Configure Dify Nyra Ops | AI | Twenty MCP, Archon MCP |
| Deploy RateHunter.net | DevOps | Cloudflare Pages |

### Phase 6: Launch (Week 11-12)

| Task | Owner | Dependencies |
|------|-------|--------------|
| End-to-end testing | QA | All systems |
| Performance optimization | Backend | Load testing |
| Documentation | All | - |
| Team training | All | - |
| Production deployment | DevOps | All tests passing |

---

## APPENDIX: Command Reference

### Claude-Flow Commands

```bash
# Initialize project with SPARC
npx claude-flow@alpha init --sparc

# Start a development session
npx claude-flow@alpha session start

# Create a swarm for parallel development
npx claude-flow@alpha swarm create --topology mesh --agents 4

# Use GOAP planning
npx claude-flow@alpha goal init
@agent-goal-planner "Your complex goal here"

# Run SPARC workflow
npx claude-flow@alpha sparc run specs/lead-ingestion.md
```

### Archon Commands

```bash
# Start Archon
docker compose up -d

# Check logs
docker compose logs -f archon-server

# Reset database (DESTRUCTIVE)
# Run migration/RESET_DB.sql in Supabase
# Then run migration/complete_setup.sql
```

### Infisical Commands

```bash
# Login
infisical login

# Run with secrets
infisical run --env=prod -- docker compose up

# Export secrets
infisical export --env=prod > .env.prod
```

---

**Document Status:** APPROVED  
**Next Review:** February 2026
