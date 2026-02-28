# PROJECT NYRA: MASTER ARCHITECTURE WHITEPAPER

**A Hybrid Mortgage CRM Platform Combining Cloud System-of-Record with Edge AI Inference**

**Version**: 3.0  
**Last Updated**: February 2026  
**Status**: Production-Ready

---

## EXECUTIVE SUMMARY

Project Nyra is a complete end-to-end mortgage origination system that bifurcates infrastructure into:

1. **Cloud Plane (Oracle ARM A1)** — Always-on system of record (Postgres, TwentyCRM, Activepieces, Mem0)
2. **Control Plane (Minisforum)** — Local AI orchestration (Nexus Router, LiteLLM, Claude-Flow, OpenClaw)
3. **Compute Plane (GPU Workers)** — Distributed inference (vLLM on RTX 5090/3090Ti, Ollama on RTX 3060)

**Key Innovation**: Fuzzy MCP tool selection minimizes token usage while maintaining agent autonomy. Smart model routing (heavy reasoning → 5090, code → 3090Ti, fast → 3060) optimizes latency & cost.

---

## SECTION 1: TOPOLOGY & INFRASTRUCTURE

### 1.1 The Three Planes

```
┌────────────────────────────────────────────────────────────────┐
│  ORACLE CLOUD PLANE (Always-On, 24/7)                          │
│  Region: Oracle Cloud Free Tier (ARM A1)                       │
│  Role: System of Record + Public Ingress                       │
├────────────────────────────────────────────────────────────────┤
│ Services:                                                       │
│  • Postgres 16 (w/ pgvector)  → TwentyCRM, Mem0, Quotes      │
│  • TwentyCRM (Headless CRM)   → Lead Management              │
│  • Activepieces (Embedded)     → Drip Campaigns, Webhooks    │
│  • Quote Engine (Node.js API)  → Mortgage Pricing            │
│  • Mem0 (Self-Hosted)          → Borrower Context Memory     │
│  • Gitea (Self-Hosted)         → Source Control + CI/CD      │
│  • Cloudflared Tunnel          → Public DNS (crm.*, etc.)    │
└────────────────────────────────────────────────────────────────┘
                         ↓ (Tailscale VPN)
┌────────────────────────────────────────────────────────────────┐
│  CONTROL PLANE (Orchestrator, Local)                           │
│  Hardware: Minisforum (Ryzen 6800H, 16GB RAM)                  │
│  Role: AI Traffic Cop + Agent Coordination                     │
├────────────────────────────────────────────────────────────────┤
│ Services:                                                       │
│  • Nexus Router (Port 6000)      → MCP Aggregator + Routing  │
│  • LiteLLM (Port 4000)            → Model Routing + Cost      │
│  • Claude-Flow (Port 8080)        → Dev Orchestrator Agent    │
│  • OpenClaw (Port 9000)           → Borrower Mortgage Agent   │
│  • Archon OS (Port 4001)          → Knowledge Base + Planning │
│  • Docker MCP Toolkit (Port 8811) → Filesystem + GitHub       │
│  • Infisical Sidecar              → Secrets Injection         │
│  • Redis (Port 6379)              → Session Cache             │
│  • Tailscale VPN                  → Mesh Networking           │
└────────────────────────────────────────────────────────────────┘
                    ↓ (Tailscale Mesh, 100.x.x.x)
┌────────────────────────────────────────────────────────────────┐
│  COMPUTE PLANE (GPU Workers)                                   │
│  Network: Tailscale (Private, Encrypted)                       │
│  Role: Distributed Inference                                   │
├────────────────────────────────────────────────────────────────┤
│ Worker 1: Area-51 (RTX 5090, 24GB VRAM)                       │
│  Engine: vLLM w/ LMCache + Prefix Caching                     │
│  Model: Mistral-7B (FP16)                                      │
│  Purpose: Heavy Reasoning (mortgage analysis, context)        │
│  Port: 8000 (OpenAI-compatible API)                           │
├────────────────────────────────────────────────────────────────┤
│ Worker 2: RTX 3090Ti (24GB VRAM)                              │
│  Engine: vLLM                                                  │
│  Model: Mistral-7B (FP16)                                      │
│  Purpose: Code Generation (repo edits, PRs)                   │
│  Port: 8000                                                    │
├────────────────────────────────────────────────────────────────┤
│ Worker 3: m15r7 RTX 3060 (6GB VRAM)                           │
│  Engine: Ollama (simpler inference loop)                       │
│  Model: Mistral-7B (Q4, ~4.5GB quantized)                     │
│  Purpose: Fast Utility (drafting, embeddings)                 │
│  Port: 11434                                                   │
└────────────────────────────────────────────────────────────────┘
```

### 1.2 Networking Architecture

**Tailscale Mesh VPN**:

- All 5 PCs + Oracle cloud connected via Tailscale
- Private IP space: `100.64.0.0/10`
- MagicDNS: `trex-fiordland.ts.net`
- No public IPs for internal services (security)
- Cloudflared tunnels handle public ingress only

**Docker Bridge Networks** (per compose stack):

- **Oracle**: `172.30.0.0/16` (postgres, redis, twenty, etc.)
- **Orchestrator**: `172.20.0.0/16` (nexus, litellm, claude-flow)
- **Workers**: `172.25.0.0/16` (vllm, ollama, prometheus)

**Connectivity Flow**:

```
Borrower SMS → Twilio Webhook → Cloudflared Tunnel → Oracle:3002 (Activepieces)
                                                        ↓
                                                  Create Lead in Postgres
                                                        ↓
                                         Webhook → Tailscale → Orchestrator:9000
                                                        ↓
                                         OpenClaw Agent (Claude-3.5)
                                                        ↓
                                         Route to LiteLLM (localhost:4000)
                                                        ↓
                                         LiteLLM routes to vLLM (100.x.x.1:8000)
                                                        ↓
                                         RTX 5090 inference
                                                        ↓
                                         Response → Activepieces → Twilio → Borrower
```

---

## SECTION 2: THE NEXUS ROUTER PATTERN

### 2.1 What Nexus Does

Grafbase Nexus is the **single entry point** for all agent calls. It:

1. **Aggregates MCP Servers** — Docker, TwentyCRM, Gitea, Archon, etc. all register with Nexus
2. **Fuzzy Tool Selection** — If OpenClaw needs "generate quote", Nexus finds the Quote Engine tool even if called differently
3. **Context Filtering** — Dev tools (file write, docker) hidden from borrower-facing agents
4. **Request Routing** — Sends calls to appropriate MCP servers
5. **Token Budgeting** — Tracks context window usage across agents

### 2.2 Nexus Configuration (nexus.toml)

```toml
[server]
port = 6000

[llm.providers]
# Routes to Claude or LiteLLM depending on agent
"anthropic" = { api_key = "$ANTHROPIC_API_KEY" }
"litellm" = { base_url = "http://litellm:4000/v1" }

[mcp.servers]
# Register all available tools
"docker-toolkit" = { context = "development" }
"twenty-crm" = { context = "production" }
"quote-engine" = { context = "production" }
"mem0" = { context = "production" }
"gitea" = { context = "development" }

[tool_filtering.production]
# OpenClaw only sees CRM + quotes, not filesystem
allowed_servers = ["twenty-crm", "quote-engine", "mem0", "activepieces"]

[tool_filtering.development]
# Claude-Flow sees everything
allowed_servers = ["docker-toolkit", "gitea", "twenty-crm", "archon-os"]
```

### 2.3 LiteLLM Model Routing

**LiteLLM** sits between Nexus and actual models. It:

- Maintains list of available models (local + cloud)
- Applies router rules (heavy → 5090, code → 3090Ti, fast → 3060)
- Tracks spend, rate limits, fallbacks
- Logs all requests for compliance

```yaml
# litellm-config.yaml
model_list:
  - model_name: "vllm-mistral-area51"
    api_base: "http://100.x.x.1:8000"     # Area-51 RTX 5090
  - model_name: "vllm-mistral-3090ti"
    api_base: "http://100.x.x.2:8000"     # RTX 3090Ti
  - model_name: "ollama-mistral-3060"
    api_base: "http://100.x.x.3:11434"    # m15r7 RTX 3060
  - model_name: "claude-3-sonnet"
    api_key: "${ANTHROPIC_API_KEY}"       # Cloud fallback

router:
  fallback_order:
    - "vllm-mistral-area51"     # Try local first
    - "claude-3-sonnet"          # Then cloud
    - "grok-2-mini"              # Finally ultra-cheap

  tag_routing:
    heavy:
      models: ["vllm-mistral-area51"]
      reason: "Mortgage analysis → RTX 5090"
    code:
      models: ["vllm-mistral-3090ti"]
      reason: "Code gen → RTX 3090Ti"
    fast:
      models: ["ollama-mistral-3060"]
      reason: "Drafting → RTX 3060"
```

---

## SECTION 3: MEMORY STACK (Lean & Tiered)

### 3.1 Memory Hierarchy

**Hot/Transient** (seconds):
- Redis (session cache, workflow state)
- Orchestrator local cache

**Working** (hours):
- Claude context window during conversation
- n8n workflow variables

**Conversational** (days):
- Mem0 (self-hosted on Oracle)
- Stores: borrower FICO, income, goals, previous quotes
- Used by: OpenClaw to personalize responses

**Persistent/Archival** (forever):
- Postgres (TwentyCRM)
- Quote history, lead status, engagement timeline

**Knowledge Graph**:
- Graphiti (event log) + FalkorDB (on Redis)
- Maps: Borrower → applied for → FHA → Property

### 3.2 Mem0 Integration

```python
# OpenClaw calls Mem0 to fetch borrower context
from mem0 import Memory

mem0 = Memory(
    api_url="http://oracle-mem0:9100",
    llm_api_url="http://litellm:4000/v1"  # Uses local inference!
)

# Borrower sends: "What's my rate?"
borrower_facts = mem0.get(borrower_id="borrow_123")
# Returns: { fico: 750, income: 150000, down_payment: 100000, ... }

# OpenClaw uses this to:
# 1. Fetch quote for their specific situation
# 2. Reference previous rates discussed
# 3. Personalize tone (e.g., "Hi John, great news for your FHA...")
```

**Key Innovation**: Mem0 uses LiteLLM for summarization, so it's **free** (uses local inference).

---

## SECTION 4: AGENT ARCHITECTURE

### 4.1 Claude-Flow (Dev Orchestrator)

**Role**: Automate repo management, code changes, PR creation

**Capabilities**:
- Clone repos from Gitea
- Edit files (Dockerfile, config, source)
- Run tests
- Create PRs
- Commit + push changes

**Triggered by**:
- Webhook from Gitea (push events)
- Manual prompt ("Deploy new Quote Engine version")
- Scheduled cron (daily health check)

**Tools**:
- Docker Toolkit (file operations, docker build)
- Gitea (repo access, PR creation)
- TwentyCRM (if PR affects CRM schema)

### 4.2 OpenClaw (Mortgage Assistant Agent)

**Role**: Borrower-facing mortgage assistant (SMS/web chat)

**Capabilities**:
- Answer mortgage questions
- Generate loan quotes
- Explain rates + terms
- Collect borrower info
- Schedule callbacks

**Tools**:
- Nexus Router (for all calls)
- Quote Engine (`/api/v1/quote`)
- TwentyCRM (read lead, update status)
- Mem0 (fetch + update borrower memory)
- Activepieces (trigger workflows)

**Memory**:
- Each message loads borrower context from Mem0
- Responses are logged back to Mem0 for future personalization

**Compliance**:
- Any rate advice auto-routed to human approval
- STOP words trigger immediate opt-out
- All interactions logged with timestamp + user ID

### 4.3 Archon OS (Knowledge Base)

**Role**: Store patterns, decisions, templates for Claude-Flow + OpenClaw

**Capabilities**:
- Store mortgage guidelines (FHA, VA, USDA rules)
- Track past decisions (e.g., "When FICO < 620, recommend...")
- Manage prompt templates
- Plan agent tasks

**Used by**:
- Claude-Flow: Retrieve mortgage guidelines before PR
- OpenClaw: Look up guidelines before rate quote

---

## SECTION 5: DATA FLOW (Borrower Journey)

### 5.1 Lead Ingestion

```
SOURCES
├─ Email (ParseMail)
├─ Webhook (LeadMailbox, custom APIs)
├─ CSV Upload (n8n or Activepieces manual trigger)
└─ SMS (Twilio webhook)
  ↓
NORMALIZATION (n8n Workflow: WF_LEAD_INGEST)
  • Parse phone, email, name
  • Extract loan amount, property value
  • Deduplicate (check TwentyCRM for existing)
  ↓
WRITE TO TwentyCRM
  • Create Mortgage Lead (custom object)
  • Set status = "New"
  • Link Contact record
  ↓
TRIGGER DRIP CAMPAIGN (Activepieces)
  • Based on loan_type (FHA, Conventional, etc.)
  • 45-60 day multi-channel sequence
  • Start day 1: SMS intro + rate quote
```

### 5.2 Drip Campaign Execution

```
ACTIVEPIECES WORKFLOW (WF_CAMPAIGN_EXECUTE)
  Every 6 hours, cron triggers:
  
  1. Fetch leads with status = "Active Campaign"
  2. For each lead:
     a. Check response detection (WF_RESPONSE_DETECT)
        • SMS reply?
        • Email open?
        • Portal login?
        → If YES: Stop campaign, escalate to sales
     b. Check STOP words (WF_OPTOUT_PROCESS)
        → If YES: Set DNC, alert compliance
     c. Send next message in sequence
        • Randomize content to avoid filter lists
        • Log delivery status
     d. Update lead timestamp
```

### 5.3 Conversation Flow (OpenClaw)

```
Borrower: "What's my payment on a $500k house?"
  ↓
OpenClaw receives via Twilio webhook
  ↓
1. LOOKUP CONTEXT
   mem0.get(phone="+1234567890")
   → { fico: 740, income: 150k, ... }

2. LOOKUP MEMORY
   "Last time we talked, they asked about FHA..."

3. CALL QUOTE ENGINE (via Nexus Router)
   POST /api/v1/quote
   { propertyValue: 500000, downPayment: 100000, baseInterestRate: 6.5 }
   ← { standard: $2864/mo, buyDown: $2795/mo, lenderCredit: $2935/mo }

4. FORMAT RESPONSE
   OpenClaw (Claude-3.5) drafts:
   "Hi John! Based on your profile (740 FICO), here are your options:
    Standard: $2,864/mo (6.5% rate)
    Buy-Down: $2,795/mo (6.0%, costs ~$8k points)
    Lender Credit: $2,935/mo (7.0%, we cover closing)"

5. LOG TO MEM0
   mem0.add(event="quote_generated", amount=500000, timestamp=now())
   → Next time: "As we discussed, the $500k house..."

6. SEND SMS
   Via Activepieces → Twilio
   Character limit: Truncate to 160 chars
```

---

## SECTION 6: COMPLIANCE & AUDITING

### 6.1 PII Access Logging

Every access to Postgres (borrower SSN, income, etc.) is logged:

```sql
-- PostgreSQL audit trigger
CREATE TRIGGER log_pii_access
AFTER SELECT ON contacts
FOR EACH ROW EXECUTE log_event(
  user_id,           -- Which agent/user
  'READ',             -- Type of access
  'contacts',         -- Table
  contact_id,         -- Record
  now()               -- Timestamp
);

-- Auditors can query:
SELECT * FROM pii_access_log
WHERE table = 'contacts' AND accessed_at > '2026-01-01'
ORDER BY accessed_at DESC;
```

### 6.2 Rate Advice Approval

```
if response contains "rate":
  → Flag as "rate_advice_pending"
  → SMS NOT sent yet
  → Notifications to sales + compliance
  → Human reviews + approves/rejects
  → If approved: send SMS + log approval ID
  → If rejected: OpenClaw rephrased without rate
```

### 6.3 STOP Word Handling

```
if "STOP" in message or "UNSUBSCRIBE" in message:
  1. Immediately:
     - Set lead status = "Opted Out"
     - Add phone to DNC list
     - Stop all workflows
  2. Log event:
     { phone, timestamp, message, agent }
  3. Alert:
     - Compliance team
     - Telemarketing supervisor
```

### 6.4 Data Retention

```
30 days  → Hot (PostgreSQL, Redis)
90 days  → Warm (Archive to S3)
7 years  → Cold (Regulatory hold in Glacier)

Compliance can:
- Export PII access logs
- Audit loan decision trees
- Verify rate accuracy
```

---

## SECTION 7: DEPLOYMENT & OPERATIONS

### 7.1 Bootstrap Process

```bash
# 1. Validate prerequisites
bash infra/scripts/bootstrap.sh

# Detects:
- Docker + Compose version
- WSL2 configuration
- Tailscale connectivity
- Available disk space

# 2. Build images
docker build services/quote-engine  # Node.js
docker build apps/claude-flow       # Python
docker build apps/openclaw          # Python
docker build services/nexus-router  # Rust (pre-built)

# 3. Deploy Oracle stack
make oracle-up
# Postgres init, TwentyCRM schema, Activepieces seed

# 4. Deploy Orchestrator
make orchestrator-up
# Nexus starts, LiteLLM loaded, agents ready

# 5. Deploy Workers (run on each GPU PC)
make workers-up
# vLLM/Ollama download models from Hugging Face
```

### 7.2 Health Monitoring

```bash
# Automated checks (make health)
- Docker daemon: running?
- Postgres: accessible?
- Redis: ping?
- Tailscale: all nodes connected?
- Nexus: responding on 6000?
- LiteLLM: models loaded?
- OpenClaw: accepting requests?

# Logs aggregation
make logs
# Tails all docker-compose services
# Filter by container name: | grep openclaw
```

### 7.3 Scaling Notes

**Current Limits**:
- Oracle: 200GB disk, 24GB RAM (handles ~500 active leads)
- Orchestrator: 16GB RAM (handles 3 agents, ~50 concurrent chats)
- Workers: VRAM limits model sizes

**To Scale**:
- Add more workers (just new GPU PCs + Tailscale)
- Switch to managed database (Oracle Autonomous DB)
- Use Kubernetes (helm charts for orch + workers)

---

## SECTION 8: SECURITY CONSIDERATIONS

### 8.1 Secrets Management

```
Infisical Vault (self-hosted or cloud)
  ├─ ANTHROPIC_API_KEY
  ├─ OPENROUTER_API_KEY
  ├─ ORACLE_DATABASE_PASSWORD
  ├─ TAILSCALE_AUTHKEY
  └─ CLOUDFLARE_TUNNEL_TOKEN
  
Injected via Infisical Sidecar → .env (Docker)
Never committed to git
Rotated monthly via Infisical dashboard
```

### 8.2 Network Isolation

- **Oracle** → Only Cloudflared tunnel + Tailscale (no direct internet)
- **Orchestrator** → Tailscale mesh only (no public IPs)
- **Workers** → Tailscale mesh only
- **TwentyCRM** → Behind Cloudflared tunnel (rate-limited, IP whitelisted)

### 8.3 Credential Handling

```
Do NOT:
- Hardcode API keys
- Log tokens to stdout
- Store in source control
- Use single-use keys for local dev

Do:
- Use Infisical for rotation
- Implement request signing (HMAC)
- Audit all API calls
- Restrict scopes (read-only where possible)
```

---

## SECTION 9: COST ANALYSIS

### 9.1 Infrastructure Costs

| Component | Cost | Notes |
|-----------|------|-------|
| Oracle Cloud A1 | $0/month | Free tier (4 CPU, 24GB, 200GB) |
| Tailscale | $0/month | Free tier (3 devices) |
| Cloudflare | $20/month | Pro tier (tunnel + workers) |
| Anthropic API | ~$50/month | Claude-3.5 + compliance calls |
| Domain | $12/year | ratehunter.net |
| **TOTAL** | ~$70/month | |

### 9.2 Inference Costs

**Local (Free)**:
- RTX 5090: ~80W running → ~$7/month electricity (at $0.12/kWh)
- RTX 3090Ti: ~40W → $3/month
- RTX 3060: ~10W → $1/month

**Cloud Fallback** (only if local models unavailable):
- Grok-2-Mini: ~$0.0005/1K tokens (cheapest)
- Claude-3.5-Sonnet: ~$0.003/1K input (premium)

**Typical Borrower Interaction**:
- Prompt: 500 tokens (borrower question + context)
- Response: 200 tokens (quote + explanation)
- **Cost**: ~0¢ if routed to 5090, ~0.2¢ if cloud

### 9.3 Per-Lead Cost

```
Ingest: $0
Campaign (SMS × 12): ~$1.20 (Twilio: $0.01/SMS)
Quotes (vLLM × 3): $0
Mem0 summarization: $0 (uses LiteLLM free)
Total: ~$1.20/lead

Revenue if closed: $5,000 (mortgage origination)
ROI: 400x+
```

---

## SECTION 10: FUTURE ENHANCEMENTS

### 10.1 Planned Features

1. **Regulatory Dashboard**
   - TRID compliance checker
   - ECOA auditing
   - State-specific rules engine

2. **Advanced Underwriting**
   - Debt-to-income auto-calculation
   - Property appraisal integration
   - Credit report auto-pull

3. **Borrower Portal**
   - Self-service document upload
   - Rate lock visualization
   - Scenario comparisons (buy-down vs. lender credit)

4. **Team Collaboration**
   - Loan officer workbench
   - Processor checklists
   - Underwriter flags

### 10.2 Model Upgrades

- DeepSeek-R1-Distill 32B (if 5090 VRAM allows)
- Llama-3.1-405B via OpenRouter (premium reasoning)
- Custom fine-tuned mortgage domain model

---

## SECTION 11: CONCLUSION

Project Nyra demonstrates a **modern approach to fintech**:

- **Hybrid cloud** (Oracle always-on + local orchestration)
- **AI-first** (Claude agents handle reasoning, compliance, conversation)
- **Cost-optimized** (local inference when possible, cloud when necessary)
- **Compliant** (PII logging, STOP handling, rate approval workflows)
- **Scalable** (Tailscale mesh + containerized workers)

The Nexus Router pattern provides a **single abstraction** for all agent tooling, while fuzzy matching and context filtering minimize token waste. Mem0 provides **persistent borrower memory** without vendor lock-in.

**Key Metrics**:
- **Lead acquisition**: 1-2 seconds (SMS → Postgres)
- **Quote generation**: 300ms (5090 vLLM)
- **Compliance audit**: Real-time (PII access logs)
- **Monthly cost**: ~$70 (infrastructure) + API usage
- **Borrower satisfaction**: Immediate responses, personalized context

---

## APPENDICES

### A. Quick Reference: Important Ports

| Service | Port | URL |
|---------|------|-----|
| Nexus Router | 6000 | http://localhost:6000 |
| LiteLLM | 4000 | http://localhost:4000 |
| Claude-Flow | 8080 | http://localhost:8080 |
| OpenClaw | 9000 | http://localhost:9000 |
| TwentyCRM | 3000 | https://crm.ratehunter.net |
| Activepieces | 3002 | https://workflows.ratehunter.net |
| Quote Engine | 8089 | http://oracle:8089 |
| vLLM (Area-51) | 8000 | http://100.x.x.1:8000 |
| Ollama (m15r7) | 11434 | http://100.x.x.3:11434 |

### B. Environment Variables

See `.env.example` for complete list. **Minimum required**:

```bash
ANTHROPIC_API_KEY=sk-ant-...
TAILSCALE_AUTHKEY=tskey-auth-...
ORACLE_DATABASE_PASSWORD=...
```

### C. Makefile Commands

```bash
make help              # Show all commands
make bootstrap        # One-click setup
make oracle-up        # Start Oracle
make orchestrator-up  # Start Orchestrator
make workers-up       # Start Workers
make logs             # Tail logs
make health           # Diagnostics
make down             # Stop all
```

---

**Document Version**: 3.0  
**Generated**: February 28, 2026  
**Next Review**: August 2026
