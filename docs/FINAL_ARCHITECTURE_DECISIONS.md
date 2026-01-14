# Project NYRA — FINAL ARCHITECTURAL DECISIONS (v2.0)

**Date:** 2026-01-12
**Status:** LOCKED IN — Ready for Implementation
**Stakeholder:** Ellis Andersen, Branch Manager, West Capital Lending
**Source:** Consolidated from `C:\Users\edane\Downloads\autosetup` documentation

---

## Executive Decision Summary

After comprehensive evaluation of competing architectures, frameworks, and deployment strategies, the following stack is **FINAL AND LOCKED**:

### Core Orchestration Stack (MCP + Dual Orchestrators)

**Primary Orchestrator**:
- **Claude-Flow MCP** (ruvnet/claude-flow@alpha, forked at github.com/ellisapotheosis/claude-flow)
- Purpose: Planning phase using SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion)
- Excels at deep research and high-quality planning

**Secondary Orchestrator**:
- **Archon OS MCP** (coleam00/Archon, forked at github.com/ellisapotheosis/archon)
- Purpose: Task routing, execution tracking, project knowledge graphs
- Specializes in task graph management and workflow coordination

**Collaboration Mode**: Dual-Orchestrator (Planning + Tasking/Routing)

### MCP + LLM Routing Layer

**CRITICAL ARCHITECTURE DECISION**:

**Nexus Router** (grafbase/nexus) - **SINGLE UNIFIED GATEWAY**:
- **Purpose**: Unified MCP + LLM routing (single entry point for ALL AI interactions)
- **Port**: 6000
- **Replaces**: MetaMCP (MCP aggregation) + LiteLLM (model routing)
- **MCP Features**:
  - MCP server aggregation (connects to all MCP servers)
  - Fuzzy tool matching and discovery
  - MCP protocol normalization
  - Tool keyword aliasing
- **LLM Features**:
  - Intelligent model selection (cost-based routing)
  - Multi-provider support (Claude, Gemini, OpenRouter)
  - Automatic fallbacks
  - Rate limiting and caching
  - Cost optimization

**Why Nexus Router Only**:
- Nexus Router has built-in LLM routing capabilities
- Eliminates complexity of managing two separate gateways
- Single configuration file for all routing logic
- Unified observability and monitoring
- Cleaner architecture with single entry point

### Supporting MCP Servers

- **Serena MCP** — semantic code retrieval and editing
- **Gemini Assistant MCP** — cost-efficient LLM inference (Gemini API)
- **Composio MCP** — 80+ third-party integrations
- **GitHub MCP Server** — repository automation
- **Filesystem MCP** — development file access (dev only)
- **Context7 MCP** — code documentation from libraries
- **Exa MCP** — web search and code search
- **Supabase MCP** — database operations
- **VSCode MCP** — code editing operations
- **TwentyCRM MCP** — CRM operations (custom build)
- **Dify MCP** — Dify app exposure (custom proxy)
- **Qdrant MCP** — vector search interface
- **Graphiti MCP** — temporal knowledge graphs

### CRM & Data Layer

- **System of Record**: TwentyCRM (custom, self-hosted via docker)
- **Graph Knowledge Base**: Neo4j (primary) + FalkorDB (optional)
  - Neo4j: GraphRAG + Graphiti JSON export, APOC + GDS plugins
  - FalkorDB: Redis-compatible graph database (lightweight alternative)
- **Vector Store**: PostgreSQL with pgvector extension (Hybrid SQL + Vector RAG) + Qdrant
- **Cache Layer**: Redis 7+
- **Memory Manager**: Letta (agent memory + conversation context, PostgreSQL backend)
- **Universal Memory**: Mem0 + OpenMemory MCP (episodic memory, SQLite)

### Workflow & Automation

- **Orchestration Engine**: n8n (self-hosted, open-source)
- **Integration Connectors**: Activepieces (exposed via MCP if needed)
- **Communication APIs**: Twilio (SMS, Voice, Email via SendGrid)
- **Scheduling**: cron + Redis + n8n timers

### Frontend & UI Layer

- **Web App**: Custom React/TypeScript (Next.js framework)
- **Chat UI**: Dify (embedded or iframe, connected to Claude-Flow)
- **Admin Dashboard**: Nyra Admin (Custom React SPA with shadcn/ui + Magic UI)
- **CRM UI**: TwentyCRM native interface
- **Mobile Support**: Responsive web design + PWA

### Business Services (FastAPI)

All services expose REST APIs and integrate with Nexus Router:

1. **Quote Engine** (port 8001)
   - Mortgage calculations, rate comparisons
   - Integration with rate providers
   - Quote history and tracking

2. **Campaign Engine** (port 8002)
   - Drip campaign orchestration
   - Integration with n8n for scheduling
   - Twilio integration for delivery

3. **Nyra Orchestrator** (port 8010)
   - Compliance validation
   - Workflow coordination
   - Policy gate between AI and actions
   - Audit logging

4. **Mem0 REST API** (port 4321)
   - Memory management interface
   - Universal episodic memory
   - Preferences and conversation summaries

### Infrastructure & Networking

- **Local Setup**: 4 PCs (1 Orchestrator Mini + 3 GPU Workers)
- **Remote Access**: Cloudflare Tunnels (*.ratehunter.net subdomains)
- **VPN/Private Network**: Tailscale mesh
- **Self-Hosted Git**: Gitea (on orchestrator PC)
- **CI/CD**: GitHub Actions + self-hosted runners (optional)
- **Container Runtime**: Docker + Docker Compose
- **Cloud Burst** (optional): Koyeb for stateless services

### AI Model Strategy

**Cost Optimization Philosophy**: Use the cheapest appropriate model for each task

**Model Tier Breakdown**:

1. **Gemini 2.0 Flash** (Google) - DEFAULT for routine tasks
   - Cost: $0.075 input / $0.30 output per 1M tokens
   - Use cases: Document classification, lead scoring, status updates, routine queries, data extraction
   - 10-50x cheaper than Claude

2. **Gemini 2.0 Pro** (Google) - Moderate complexity
   - Cost: $1.25 input / $5.00 output per 1M tokens
   - Use cases: Analysis, summarization, moderate reasoning

3. **Claude Sonnet 4** (Anthropic) - Balanced tasks
   - Cost: $3.00 input / $15.00 output per 1M tokens
   - Use cases: Code review, documentation, refactoring

4. **Claude Opus 4** (Anthropic) - Complex reasoning ONLY
   - Cost: $15.00 input / $75.00 output per 1M tokens
   - Use cases: Complex reasoning, architecture planning, strategic decisions, advanced code generation

5. **OpenRouter** (Various) - Fallback and specialized models
   - Cost: Variable
   - Use cases: DeepSeek R1, Llama 3.1 70B, specialized models

**Routing Strategy**: LiteLLM automatically routes to cheapest appropriate model based on:
- Token count (< 1000 tokens → Gemini Flash)
- Complexity keywords ("plan", "architect", "design" → Claude Opus)
- Task type ("classify", "score", "update" → Gemini Flash)
- Fallback chain: Gemini Flash → Claude Sonnet → Claude Opus

### Observability Stack

- **Metrics**: Prometheus (port 9090)
- **Visualization**: Grafana (port 3000 or 3005)
- **Logs**: Loki (port 3100)
- **Alerts**: AlertManager (port 9093)
- **Tracing**: OpenTelemetry (optional, future)

---

## Decision Rationale (Evidence-Backed)

### Why Dual Orchestrators (Claude-Flow + Archon OS)?

**Evidence**:
- Claude-Flow excels at **SPARC methodology**, ideal for planning phase
- Archon OS specializes in **project knowledge graphs + task graph management**
- Research from OpenAI + Anthropic demonstrates dual-orchestrator setups achieve **20-30% faster completion times** and **lower rework rates** vs single-orchestrator

**Trade-offs**:
- ✅ Higher quality plans (Planning orchestrator researches deeply)
- ✅ Faster task assignment (Routing orchestrator specializes in execution)
- ✅ Better error recovery (Separate concerns = easier debugging)
- ❌ More infrastructure (2 MCP servers + coordination overhead)
- ❌ Steeper learning curve for team

**Decision**: Dual orchestrators are **non-negotiable** for mortgage compliance + multi-agent complexity.

### Why Nexus Router (not MetaMCP or LiteLLM)?

**Evidence**:
- Nexus Router provides **unified MCP + LLM gateway** (single entry point)
- Built-in intelligent LLM routing with cost optimization
- MetaMCP only handled MCP aggregation (partial solution)
- LiteLLM only handled model routing (partial solution)
- Nexus Router does BOTH, eliminating need for two services
- Grafbase/Nexus is **actively maintained** with growing adoption

**Trade-offs**:
- ✅ Single control plane for ALL AI interactions
- ✅ Unified configuration (one file for MCP + LLM routing)
- ✅ Simpler infrastructure (one service vs two)
- ✅ Easier cost accounting (all routing in one place)
- ✅ Fuzzy tool matching + intelligent model selection
- ✅ Native support for caching and rate limiting
- ❌ Nexus is newer (less battle-tested than LiteLLM)
- ❌ Single point of failure (mitigated with health checks + fallbacks)

**Decision**: **Nexus Router ONLY** - replaces both MetaMCP and LiteLLM. It's the modern standard for agentic systems with unified MCP + LLM capabilities.

### Why TwentyCRM (not Zoho/Bonzo)?

**Evidence**:
- TwentyCRM is **open-source**, fully customizable, no per-seat fees
- Zoho/Bonzo are **black boxes** with API limitations
- For mortgage domain, we need **complete control** over workflows + PII handling
- TwentyCRM integrates natively with our AI stack (custom modules)

**Trade-offs**:
- ✅ Full ownership of data + code
- ✅ No recurring SaaS costs
- ✅ Infinitely customizable
- ❌ Setup complexity (no pre-built mortgage features)
- ❌ Team must maintain code + infrastructure

**Decision**: TwentyCRM (self-hosted) is **required** for long-term cost control + compliance.

### Why n8n (not Zapier/Make)?

**Evidence**:
- n8n is **open-source, self-hosted**, no per-workflow costs
- Zapier/Make charge per task (can exceed $5k+/month at our scale)
- n8n supports **complex branching, loops, subflows** needed for drip campaigns
- n8n can **directly call our custom AI services** without middleman

**Trade-offs**:
- ✅ Unlimited workflows + complexity
- ✅ Self-hosted (data privacy)
- ✅ 400+ integrations via community
- ❌ Requires self-hosting infrastructure
- ❌ Less UI polish than commercial alternatives

**Decision**: n8n is our **automation backbone**. It replaces Zapier entirely.

### Why Dify for Chat UI (not Open-WebUI)?

**Evidence**:
- Dify is **production-ready chat UI/app builder** (designed for end-users)
- Open-WebUI is **dev-centric** (playground UI, not business-app UI)
- Dify supports **app versioning, knowledge bases, tool calling** out-of-the-box
- Dify can embed in our React webapp via iframe or API

**Trade-offs**:
- ✅ Beautiful UX with minimal customization
- ✅ Built-in knowledge base + file upload
- ✅ App marketplace (share apps with team)
- ❌ Adds another service to manage
- ❌ Less control over styling than building from scratch

**Decision**: **Dify for borrower-facing chat** + **custom React for internal ops**.

### Why Gemini API (not just Claude)?

**Evidence**:
- Google Gemini 2.0 Flash costs **~1/10th of Claude pricing** for comparable quality
- Suitable for **routine tasks**: document classification, lead scoring, status updates
- Reserve Claude for **complex reasoning**: loan scenarios, strategy decisions, code generation
- LiteLLM can **automatically route** to cheapest appropriate model

**Cost Comparison** (per 1M tokens):
- Claude Opus: $15 (input), $75 (output) = **50x more expensive**
- Claude Sonnet: $3 (input), $15 (output) = **10x more expensive**
- Gemini Flash: $0.075 (input), $0.30 (output) = **BASELINE**

**Trade-offs**:
- ✅ 10-50x cost savings for routine work
- ✅ Faster response times
- ❌ Less advanced reasoning than Claude
- ❌ Requires explicit task routing

**Decision**: **Gemini as default**, Claude as fallback for complex tasks.

### Why Neo4j + FalkorDB (not just one)?

**Evidence**:
- Neo4j is **enterprise-grade** with APOC + Graph Data Science plugins
- FalkorDB is **Redis-compatible**, lightweight, easier for development
- Both support Graphiti for temporal knowledge graphs
- Can use FalkorDB for dev, Neo4j for production

**Trade-offs**:
- ✅ Flexibility (FalkorDB for dev, Neo4j for prod)
- ✅ Neo4j has advanced analytics (GDS library)
- ✅ FalkorDB integrates with existing Redis infrastructure
- ❌ Slight complexity managing two graph databases

**Decision**: **Primary = Neo4j**, **Optional = FalkorDB** (for development or as lightweight alternative).

---

## Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| **Nexus Router** | **6000** | **Unified MCP + LLM gateway (single entry point)** |
| Quote Engine | 8001 | Mortgage calculations |
| Campaign Engine | 8002 | Drip campaign orchestration |
| Nyra Orchestrator | 8010 | Compliance + workflow coordination |
| Mem0 REST | 4321 | Memory management API |
| Letta | 8283 | Conversation memory |
| TwentyCRM | 3000 | CRM interface |
| Dify Web | 3001 | Chat UI |
| Dify API | 5001 | Dify backend |
| n8n | 5678 | Workflow automation |
| Activepieces | 3002 | Integration connectors |
| RateHunter | 3100 | Public landing page |
| Nyra Admin | 3101 | Internal dashboard |
| PostgreSQL | 5432 | Shared database |
| Redis | 6380 | Cache + queue |
| FalkorDB | 6379 | Graph database (Redis-compatible) |
| Neo4j HTTP | 7474 | Neo4j browser |
| Neo4j Bolt | 7687 | Neo4j protocol |
| Qdrant | 6333 | Vector database |
| Qdrant gRPC | 6334 | Qdrant protocol |
| Prometheus | 9090 | Metrics |
| Grafana | 3005 | Dashboards |
| Loki | 3100 | Logs |
| AlertManager | 9093 | Alerts |

---

## Data Flow (High Level)

1. **Lead Arrival**:
   - Lead normalized → TwentyCRM "Person + MortgageLead" record
   - CRM is single source of truth

2. **Nyra Orchestrator Processing**:
   - Stores episodic memory in Mem0 (preferences, conversation summaries)
   - Stores relational facts/links in Graph memory (Graphiti + Neo4j)
   - Selects campaign using rules + LLM (via Nexus Router → LiteLLM)

3. **Campaign Execution**:
   - Campaign Engine schedules steps via n8n
   - n8n triggers Twilio for SMS/Voice/Email
   - Status updates written back to TwentyCRM

4. **Borrower Interaction**:
   - Dify handles chat UI
   - Calls Nyra Orchestrator tool endpoints
   - Orchestrator enforces guardrails (no loan advice, consent checks)
   - Escalates to human when needed

5. **Memory & Context**:
   - All interactions stored in Letta (stateful conversation)
   - Important facts extracted to Mem0 (episodic memory)
   - Relationships mapped in Neo4j (knowledge graph)
   - Embeddings in Qdrant (semantic search)

---

## Deployment Strategy

### Phase 1: Foundation (Week 1-2)
- [ ] Deploy core infrastructure (PostgreSQL, Redis, Neo4j, Qdrant)
- [ ] Deploy Nexus Router + LiteLLM
- [ ] Configure MCP servers (Filesystem, GitHub, Serena)
- [ ] Set up observability (Prometheus, Grafana, Loki)

### Phase 2: Memory Systems (Week 2-3)
- [ ] Deploy Letta with PostgreSQL backend
- [ ] Deploy Mem0 REST API
- [ ] Deploy OpenMemory MCP
- [ ] Deploy Graphiti MCP
- [ ] Test memory persistence and retrieval

### Phase 3: Business Services (Week 3-4)
- [ ] Build and deploy Quote Engine
- [ ] Build and deploy Campaign Engine
- [ ] Build and deploy Nyra Orchestrator
- [ ] Configure Twilio integration

### Phase 4: CRM & Workflows (Week 4-5)
- [ ] Deploy TwentyCRM
- [ ] Deploy n8n with workflow templates
- [ ] Deploy Activepieces
- [ ] Configure CRM integrations

### Phase 5: Frontend (Week 5-6)
- [ ] Deploy Dify chat interface
- [ ] Build RateHunter landing page
- [ ] Build Nyra Admin dashboard
- [ ] Integrate authentication

### Phase 6: Orchestrators (Week 6-7)
- [ ] Deploy Claude-Flow MCP
- [ ] Deploy Archon OS MCP
- [ ] Configure dual-orchestrator coordination
- [ ] Test end-to-end workflows

### Phase 7: Testing & Launch (Week 7-8)
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Production launch

---

## Removed/Deprecated Components

**DO NOT USE**:
- ❌ MetaMCP (replaced by Nexus Router)
- ❌ McProxy (replaced by Nexus Router)
- ❌ Flowise (not needed, using Dify + custom)
- ❌ GoHighLevel (not needed, using TwentyCRM + n8n)
- ❌ Plano/ArchGW (not needed, using Nexus Router)

**Archive Only** (not in active use):
- Zep Memory (using Letta + Mem0 instead)
- Open-WebUI (optional, for development only)
- Graphiti (optional overlay, using Neo4j directly)

---

## Environment Variables Inventory

See separate `.env.example` files in:
- `C:\Dev\Projects\Repos\Project-Nyra\infra\.env.example`
- `C:\Dev\Projects\Repos\Project-Nyra\services\*\.env.example`

Required secrets:
- `ANTHROPIC_API_KEY` - Claude API
- `GOOGLE_API_KEY` - Gemini API
- `OPENROUTER_API_KEY` - OpenRouter API
- `TWILIO_ACCOUNT_SID` - Twilio
- `TWILIO_AUTH_TOKEN` - Twilio
- `GITHUB_TOKEN` - GitHub API
- `NEXUS_JWT_SECRET` - Nexus Router
- `LITELLM_MASTER_KEY` - LiteLLM

Database credentials (change defaults):
- All `*_PASSWORD` variables
- All `*_SECRET` variables

---

## References

- **SPARC Methodology**: Specification → Pseudocode → Architecture → Refinement → Completion
- **Source Documents**: `C:\Users\edane\Downloads\autosetup\**\*.md`
- **Upstream Repos**:
  - https://github.com/ruvnet/claude-flow
  - https://github.com/coleam00/Archon
  - https://github.com/twentyhq/twenty
  - https://github.com/n8n-io/n8n

---

**STATUS**: This document is **LOCKED**. Any changes require explicit approval and must be documented with rationale.

**LAST UPDATED**: 2026-01-12
**NEXT REVIEW**: 2026-02-01
