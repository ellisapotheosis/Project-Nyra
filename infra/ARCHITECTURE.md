# Project Nyra: Master Architecture Whitepaper

**Version**: 3.0 (Consolidated)  
**Date**: February 28, 2026  
**Status**: MVP Ready for Production

---

## Executive Summary

Project Nyra is a **distributed, AI-powered mortgage lead automation platform** designed to:
1. **Ingest & normalize** mortgage leads from multiple sources (email, webhooks, LeadMailbox)
2. **Deduplicate & enrich** lead data and store in TwentyCRM (system of record)
3. **Execute intelligent drip campaigns** (45–60 day multi-channel sequences with STOP compliance)
4. **Generate accurate loan quotes** via a stateless Quote API (mathematical parity with Excel)
5. **Maintain memory without PII exposure** using letta + Mem0 + RuVector
6. **Route AI workloads intelligently** across local GPU workers (5090, 3090Ti, 3060) and cloud
7. **Expose all capabilities** via Nexus Router (MCP aggregator) to agents (archon-os, OpenClaw, Archon-OS)

The system is **bifurcated** into:
- **Cloud Plane (Oracle Always Free)**: TwentyCRM, Postgres, Redis, Activepieces, Mem0, Infisical
- **Edge Plane (Home LAN)**: Orchestrator (Nexus, LiteLLM), 3 GPU workers, Claude agents

All nodes communicate via **Tailscale mesh VPN** (private, no port forwarding needed).

---

## 1. System Architecture (Macro View)

### 1.1 The Bifurcated Topology

```
┌──────────────────── ORACLE CLOUD (Always-On) ──────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PUBLIC INGRESS (Cloudflare Tunnels)                     │   │
│  │  → crm.ratehunter.net → TwentyCRM (port 3000)           │   │
│  │  → api.ratehunter.net → Quote Engine (port 8089)        │   │
│  │  → leads.ratehunter.net → Lead Ingestion (port 8090)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SYSTEM OF RECORD LAYER                                  │   │
│  │  • TwentyCRM (headless, custom objects for mortgages)   │   │
│  │  • Postgres 17 w/ pgvector (leads, quotes, campaigns)   │   │
│  │  • Redis Stack (cache, FalkorDB for knowledge graphs)   │   │
│  │  • Mem0 (self-hosted, borrower memory persistence)      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ WORKFLOW & INTEGRATION LAYER                            │   │
│  │  • Activepieces (embedded automation, drip campaigns)   │   │
│  │  • Quote Engine (stateless Node.js/TS service)          │   │
│  │  • Lead Ingestion Service (email, webhook handlers)     │   │
│  │  • Gitea (source code, CI/CD via Act Runner)            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SECURITY & SECRETS                                      │   │
│  │  • Infisical (centralized vault, no plaintext env)      │   │
│  │  • Secrets synced to all nodes via sidecar              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                         ↑↓ (Tailscale VPN, port 41641 WireGuard)
┌──────────── HOME LAN: ORCHESTRATOR (Minisforum) ────────────────┐
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ SINGLE ENTRY POINT: NEXUS ROUTER (Grafbase/Nexus)      │   │
│  │  Port: 6000                                             │   │
│  │  Role: MCP proxy aggregator + fuzzy tool selection      │   │
│  │  Features:                                              │   │
│  │    • Routes all MCP tool calls                          │   │
│  │    • Reduces context window by hiding irrelevant tools  │   │
│  │    • Authenticates agents before tool access           │   │
│  │    • Logs all tool invocations for audit               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MODEL ROUTING LAYER: LiteLLM (OpenRouter Proxy)        │   │
│  │  Port: 4000                                             │   │
│  │  Role: Smart model selection + spend control            │   │
│  │  Routing Logic:                                         │   │
│  │    [code, heavy] tasks → RTX 5090 (DeepSeek-R1 32B)    │   │
│  │    [coding] tasks → RTX 3090Ti (DeepSeek-Coder)         │   │
│  │    [fast, draft] tasks → RTX 3060 (Qwen 7B)             │   │
│  │    [compliance] tasks → Claude 3 Sonnet (OpenRouter)    │   │
│  │    Fallback → Anthropic API (cost control)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ AGENTS & ORCHESTRATORS                                  │   │
│  │  • archon-os (dev/build orchestrator)                 │   │
│  │  • OpenClaw (borrower-facing mortgage assistant)        │   │
│  │  • Archon-OS (knowledge/task management)                │   │
│  │  All agents talk ONLY to Nexus Router (single point)    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ TOOLKIT & LOCAL ACCESS                                  │   │
│  │  • Docker MCP Toolkit (filesystem, Docker Compose)      │   │
│  │  • GitHub Toolkit (repo management, CI/CD)              │   │
│  │  • Oracle Database Toolkit (Tailscale tunnel to DB)     │   │
│  │  • Infisical Agent Sidecar (inject secrets on demand)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓ (Tailscale)
┌─────────────────── GPU WORKER NODES (Tailscale Mesh) ─────────────┐
│                                                                     │
│  Worker 1: RTX 5090 (32GB VRAM)                                    │
│    • vLLM OpenAI-compatible server (port 8000)                     │
│    • Models: DeepSeek-R1-Distill 32B (for heavy reasoning)         │
│    • Inference: Prefix caching, batch optimization                 │
│    • Tailscale IP: 100.x.x.1                                       │
│                                                                     │
│  Worker 2: RTX 3090Ti (24GB VRAM)                                  │
│    • vLLM OpenAI-compatible server (port 8000)                     │
│    • Models: DeepSeek-Coder 16B, Llama 2 13B                       │
│    • Inference: Code generation, context retrieval                 │
│    • Tailscale IP: 100.x.x.2                                       │
│                                                                     │
│  Worker 3: RTX 3060 (12GB VRAM)                                    │
│    • Ollama server (port 11434)                                    │
│    • Models: Qwen 2.5 7B (GGUF Q4), embeddings (Nomic)             │
│    • Inference: Fast, utility, drafting                            │
│    • Tailscale IP: 100.x.x.3                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow: A Borrower's SMS to Quote Response

1. **Borrower texts** "What's my payment on a $500k house?"
   - SMS hits Twilio → Webhook to Oracle Lead Ingestion Service (port 8090)

2. **Ingestion normalizes** the lead
   - Extracts property value, loan purpose
   - Stores in Postgres (Oracle)
   - Publishes to TwentyCRM via API

3. **Activepieces triggers** drip campaign
   - Checks if STOP is in message (TCPA compliance)
   - If not STOP, queues SMS response workflow

4. **Response needs a quote**
   - Activepieces calls Quote Engine API (Oracle, port 8089)
   - Input: propertyValue=500000, downPayment=?, rate=current
   - Output: 3-option comparison (standard, buy-down, lender-credit)

5. **But if human review needed** (e.g., rate quote discussion):
   - Message forwarded to OpenClaw (Orchestrator)
   - OpenClaw asks LiteLLM (port 4000) for advice
   - LiteLLM routes to RTX 5090 for DeepSeek-R1 reasoning
   - RTX 5090 streams back nuanced rate recommendation
   - OpenClaw drafts response, stores in Mem0 (Oracle) for next interaction

6. **Response sent back**
   - SMS reply: "Your estimated payment is $2,685/mo (standard rate 6.5%)"
   - Borrower memory saved: "Interested in $500k, standard rate 6.5%"
   - Campaign continues with email follow-up (Activepieces cron)

---

## 2. Key Components

### 2.1 Nexus Router (MCP Aggregator)

**What it is**: Single entry point for all agent-to-tool communication.

**Why it matters**:
- Agents (archon-os, OpenClaw, Archon) use ONE endpoint
- No scattered tool definitions across codebase
- Context-aware: hides irrelevant tools to save tokens
- Audit trail: logs every tool invocation

**Architecture**:
```toml
# infra/nexus/nexus.toml
[server]
port = 6000
log_level = "info"

[mcp.servers.docker-toolkit]
url = "http://localhost:8811/sse"  # Docker MCP Gateway

[mcp.servers.oracle-twenty-crm]
url = "tailscale://oracle.trex-fiordland.ts.net:3000"  # CRM API
auth = "bearer-token"

[mcp.servers.archon-os]
url = "http://localhost:8080/mcp"  # Knowledge backbone

[tool_routing]
fuzzy_selection = true  # Find tools by intent, not exact name
max_candidates = 10
similarity_threshold = 0.6
```

**Key endpoints**:
- `POST /api/tools` — List available tools (context-aware)
- `POST /api/invoke` — Execute a tool with agent context
- `GET /health` — Health check

### 2.2 LiteLLM Router (Model Routing)

**What it is**: OpenAI-compatible endpoint that routes requests to appropriate model.

**Why it matters**:
- Agents don't know which GPU they're hitting
- Intelligent fallback: if 5090 overloaded, try 3090Ti
- Cost control: routes expensive tasks to local GPUs first
- Spend tracking: logs tokens, costs per task

**Routing matrix**:
```yaml
# infra/litellm/config.yaml
model_list:
  - model_name: "deep-think"  # Heavy reasoning
    provider: "vllm"
    base_url: "http://100.x.x.1:8000"
    model: "deepseek-r1-distill-32b"
    max_tokens: 8000
    
  - model_name: "coder"  # Code generation
    provider: "vllm"
    base_url: "http://100.x.x.2:8000"
    model: "deepseek-coder-16b"
    max_tokens: 4096
    
  - model_name: "fast-draft"  # Quick responses
    provider: "ollama"
    base_url: "http://100.x.x.3:11434"
    model: "qwen:7b"
    max_tokens: 2048
    
  - model_name: "compliance-check"  # TCPA/regulatory
    provider: "anthropic"
    model: "claude-3-sonnet-20240229"
    api_key: "${ANTHROPIC_API_KEY}"
    max_tokens: 1024
```

**Usage from agents**:
```typescript
// All agents use same interface
const response = await litellm.post('/v1/chat/completions', {
  model: 'deep-think',  // LiteLLM picks the 5090
  messages: [...],
  temperature: 0.7
});
```

### 2.3 TwentyCRM (System of Record)

**What it is**: Headless, API-first CRM customized for mortgages.

**Custom Objects**:
```sql
-- Postgres schema (Oracle)
CREATE TABLE nyra_mortgage_lead (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone VARCHAR,
  property_value DECIMAL(12,2),
  down_payment DECIMAL(12,2),
  loan_purpose VARCHAR,  -- 'purchase', 'refinance', 'heloc'
  fico_score INT,
  created_at TIMESTAMP,
  last_contacted TIMESTAMP,
  campaign_status VARCHAR,  -- 'active', 'paused', 'stop', 'won', 'lost'
  stop_reason VARCHAR,  -- 'explicit_stop', 'no_response', 'other'
  memory_id UUID  -- Links to Mem0
);

CREATE TABLE nyra_quote (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES nyra_mortgage_lead,
  property_value DECIMAL,
  rate DECIMAL(5,3),
  monthly_payment DECIMAL(10,2),
  quote_type VARCHAR,  -- 'standard', 'buydown', 'lender_credit'
  valid_until TIMESTAMP,
  created_at TIMESTAMP
);

CREATE TABLE nyra_campaign (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES nyra_mortgage_lead,
  campaign_type VARCHAR,  -- 'drip_sms', 'drip_email', etc.
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  total_touches INT DEFAULT 0,
  engagement_count INT DEFAULT 0,
  status VARCHAR  -- 'active', 'paused', 'completed'
);
```

**APIs exposed**:
- `GET /api/leads` — List all leads
- `POST /api/leads` — Create lead (called by ingestion service)
- `PUT /api/leads/:id` — Update lead (Activepieces updates campaign status)
- `GET /api/quotes/:leadId` — Fetch lead's quotes

### 2.4 Activepieces (Drip Campaign Orchestration)

**What it is**: Low-code automation engine for SMS/email workflows.

**Key workflows**:
1. **WF_LEAD_INGEST**: Email → Normalize → TwentyCRM
2. **WF_CAMPAIGN_EXECUTE**: Cron (daily) → Select eligible leads → Send SMS/email
3. **WF_RESPONSE_DETECT**: Webhook (incoming SMS/email) → Extract intent → Update campaign status
4. **WF_OPTOUT_PROCESS**: Detect "STOP" → DNC list → Pause campaign
5. **WF_QUOTE_GENERATE**: User requests quote → Quote Engine API → Inject into SMS

**Piece blocks used**:
- Email trigger (IMAP)
- Webhook trigger (incoming SMS via Twilio)
- Code block (text parsing, lead extraction)
- HTTP request (Quote Engine, TwentyCRM API)
- SMS sending (Twilio)
- Conditional branches (STOP detection, campaign eligibility)
- Loop (multi-step drip sequence)

### 2.5 Quote Engine (Stateless Microservice)

**What it is**: Node.js/TypeScript REST API that calculates mortgage payments.

**Endpoints**:
```
POST /api/v1/quote
Input:
  {
    "propertyValue": 500000,
    "downPayment": 100000,
    "baseInterestRate": 6.5,
    "termYears": 30,
    "annualTaxes": 6000,
    "annualInsurance": 1200,
    "monthlyHoa": 0
  }

Output:
  {
    "success": true,
    "data": {
      "scenario": "3-Option Comparison",
      "options": {
        "standard": {
          "principal": 400000,
          "ltv": 80.0,
          "interestRate": 6.5,
          "monthlyPrincipalAndInterest": 2527.48,
          "monthlyTaxes": 500.00,
          "monthlyInsurance": 100.00,
          "monthlyHoa": 0.00,
          "estimatedPmi": 250.00,
          "totalMonthlyPayment": 3377.48,
          "totalInterestOverLife": 509490.40
        },
        "buyDown": { ... },  // -0.5% rate
        "lenderCredit": { ... }  // +0.5% rate
      }
    }
  }
```

**Math**: Standard amortization formula (PMT calculation), validated by Zod input schema.

### 2.6 Mem0 (Conversational Memory)

**What it is**: Self-hosted memory service for storing borrower facts.

**Features**:
- Automatically extracts key info from conversations
- Uses LiteLLM to summarize (no API cost, uses local GPUs)
- Stores in Postgres (pgvector embeddings)
- Queryable: "What property is borrower interested in?"

**Integration with OpenClaw**:
```typescript
// OpenClaw startup
const mem0 = new Mem0Client({
  apiUrl: "http://oracle.trex-fiordland.ts.net:3000",
  userId: borrowerId,
  sessionId: conversationId
});

// During conversation
const facts = await mem0.query("What's the borrower's FICO score?");
// Returns: "750" (learned from earlier conversation)

// After response
await mem0.add({
  role: "assistant",
  content: "Your payment would be $2,685/mo at 6.5% rate.",
  metadata: { topic: "payment_quote", property_value: 500000 }
});
```

### 2.7 archon-os (Dev Orchestrator)

**What it is**: Autonomous coding + build orchestrator.

**Capabilities**:
- Receives task: "Implement drip campaign workflow #5"
- Talks to Nexus for tools (Docker, GitHub, Activepieces APIs)
- Writes code, commits to Gitea
- Runs tests, deploys to orchestrator
- Updates status in Archon-OS

**Tools it uses via Nexus**:
- Docker MCP Toolkit (build images, manage compose)
- GitHub Toolkit (clone repos, create PRs)
- Oracle Database Toolkit (run migrations)

### 2.8 OpenClaw (Borrower-Facing Agent)

**What it is**: Agentic mortgage assistant with memory & compliance.

**Capabilities**:
- Answers mortgage questions in natural language
- Calculates quotes using Quote Engine
- Remembers borrower facts via Mem0
- Respects STOP/DNC
- Drafts compliant responses (no rate advice without caveat)

**Tools it uses via Nexus**:
- Quote Engine API
- Mem0 memory query
- TwentyCRM lead lookup
- Compliance checker (rate advice requires human approval)

---

## 3. Data & Security

### 3.1 PII Handling (Compliance)

**What is PII?** Name, email, phone, FICO, property address, loan amount.

**Our approach**:
1. **Minimal extraction**: Only ingest PII needed (phone, email, property value)
2. **No PII in logs**: archon-os, OpenClaw strip PII before logging
3. **Encryption at rest**: Postgres encrypted, Redis has no PII (only IDs)
4. **Memory audit**: Mem0 logs all PII access with timestamp + user
5. **TCPA compliance**: STOP detection, DNC list enforcement

### 3.2 Memory Isolation (No Model Fine-Tuning on PII)

**Mistake to avoid**: Fine-tuning local models on borrower data.

**Our approach**:
- Local LLMs (vLLM, Ollama) are **stateless inference only**
- Borrower facts live in Mem0 + Postgres only
- If a borrower's data is deleted, it's gone everywhere
- No continual learning on private data

### 3.3 Secrets Management (Infisical)

**No plaintext .env files in git.**

**Process**:
1. Secrets stored in Infisical vault (centralized)
2. Each PC runs Infisical sidecar agent
3. Agent syncs secrets on startup + periodically
4. Docker containers inherit secrets from env (injected, not visible in image)
5. Audit trail: who accessed what secret, when

**Secrets managed**:
- `ANTHROPIC_API_KEY` — Claude API
- `OPENROUTER_API_KEY` — Fallback LLM routing
- `DATABASE_URL` — Postgres on Oracle
- `TWILIO_AUTH_TOKEN` — SMS sending
- `GITEA_WEBHOOK_SECRET` — Repo CI/CD
- `MEM0_API_KEY` — Mem0 server
- `INFISICAL_TOKEN` — Machine token for sidecar

---

## 4. Deployment & Operations

### 4.1 Orchestrator (Minisforum) Startup

```bash
cd ProjectNyra/infra
make orchestrator-up
```

**Order of operations**:
1. Infisical sidecar starts (injects secrets)
2. Postgres client library initializes (connects to Oracle)
3. Nexus Router starts (waits for secrets, validates tool registry)
4. LiteLLM starts (validates all worker endpoints reachable)
5. archon-os starts (registers MCP capabilities with Nexus)
6. OpenClaw starts (loads Mem0 context)
7. Archon-OS starts (initializes knowledge graph)
8. Health check: `bash infra/scripts/health-check.sh`

### 4.2 Worker (GPU PC) Startup

```bash
# On RTX 5090
cd ProjectNyra/infra
make workers-up WORKER=rtx-5090
```

**What happens**:
1. WSL2 boots (docker.sock mounted)
2. Docker Compose starts vLLM container
3. vLLM loads model from disk/cache
4. OpenAI-compatible API listens on port 8000
5. Registers with LiteLLM via Tailscale IP

### 4.3 Oracle (Cloud) Startup

```bash
ssh -i oracle-key.pem ubuntu@oracle-vm
cd ProjectNyra/infra
make oracle-up
```

**Services**:
- Postgres 17 (system of record)
- Redis (cache + FalkorDB)
- TwentyCRM (API listening on port 3000)
- Activepieces (automation on port 3001)
- Quote Engine (API on port 8089)
- Lead Ingestion (API on port 8090)
- Mem0 (port 5000)
- Gitea (port 3000, internal only)

**Cloudflare Tunnels**:
```
crm.ratehunter.net → oracle:3000 (TwentyCRM)
api.ratehunter.net → oracle:8089 (Quote Engine)
leads.ratehunter.net → oracle:8090 (Lead Ingestion)
```

### 4.4 Health Checks

```bash
bash infra/scripts/health-check.sh
```

**Checks**:
- Orchestrator: Nexus `/health`, LiteLLM `/health`
- Workers: vLLM model loading, port 8000/11434 accessible
- Oracle: Postgres connection, Redis ping, TwentyCRM API
- Tailscale: All 5 nodes visible, latency < 50ms
- Secrets: Infisical agent running, key env vars present

---

## 5. Design Principles

### 5.1 Stateless Services

Every service (Quote Engine, Lead Ingestion, Activepieces workflows) is **idempotent**.

**Example**: Lead ingestion receives same email twice.
- Deduplication by email + timestamp
- Second insert returns 409 Conflict (idempotent)
- Workflow retries safely (no duplicate lead created)

### 5.2 Single Source of Truth

**TwentyCRM + Postgres** is authoritative.

- Lead doesn't exist in CRM? It doesn't exist.
- Agent shouldn't write to Redis expecting it to persist.
- All reads go to Postgres (Redis is cache only).

### 5.3 Async-First

Long-running tasks (quote API, email sends) happen **asynchronously**.

- Borrower texts → Ingestion returns 202 Accepted immediately
- Activepieces runs async (event-driven)
- Agent doesn't block on Quote Engine (streams response as it calculates)

### 5.4 Graceful Degradation

If a service fails, platform continues.

- Oracle down? Orchestrator still works (local inference, memory cached locally)
- RTX 5090 offline? LiteLLM routes to RTX 3090Ti or falls back to Claude
- Mem0 slow? OpenClaw continues (just less context)

---

## 6. Scaling & Future Roadmap

### 6.1 Horizontal Scaling

**Add more GPU workers**: New vLLM instance → Register with LiteLLM → Automatically routed

**Add more databases**: Postgres replication, read replicas in different regions

### 6.2 Vertical Scaling

**Upgrade GPUs**: Swap RTX 3060 for RTX 4090 → Same docker-compose, just change PCIE pass-through config

### 6.3 Multi-Tenant (Future)

- Separate schemas per broker (same Postgres, different data)
- Separate Mem0 databases per borrower
- Rate limiting by tenant in Nexus

---

## 7. Conclusion

Project Nyra is a **production-grade distributed system** that balances:
- **Performance** (local GPUs for inference)
- **Reliability** (always-on cloud hub)
- **Privacy** (minimal PII extraction, audit logging)
- **Cost** (local inference saves API costs)
- **Maintainability** (Makefile-driven, clean separation of concerns)

The **Nexus Router + LiteLLM** architecture ensures agents don't need to know about infrastructure. They talk to Nexus, Nexus routes to the right tool/model, and everything scales transparently.

---

**Document Version**: 3.0  
**Last Updated**: Feb 28, 2026  
**Next Review**: After Oracle integration complete
