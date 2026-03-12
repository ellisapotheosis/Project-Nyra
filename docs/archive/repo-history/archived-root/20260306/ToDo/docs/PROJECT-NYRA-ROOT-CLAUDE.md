# 🏠 Project Nyra - AI-Powered Mortgage Automation Platform

## 📋 CRITICAL RULES & GOLDEN STANDARDS

### **GOLDEN RULE: One Message = All Operations**
**When executing multiple operations, ALWAYS batch them in a SINGLE message for 300% performance gain.**

```bash
# ❌ WRONG (Multiple messages)
git add file1.js
[wait for response]
git add file2.js
[wait for response]
git commit -m "update"

# ✅ CORRECT (Single message with all operations)
git add file1.js file2.js && git commit -m "update" && git push
```

### **Memory Systems Priority Order**
1. **RuVector** → Fast vector search, code retrieval, similarity matching
2. **Letta** → Conversational memory, agent state, task context
3. **Graphiti** → Temporal knowledge graphs, relationship tracking, evolution
4. **Mem0** → User personalization, cross-app profiles
5. **OpenMemory** → Shared collaborative memory, team knowledge

### **Local-First LLM Strategy**
- **Primary**: GPU workers (5090 → 3090 → 3060)
- **Fallback**: OpenRouter DeepSeek-R1
- **Critical**: Anthropic Claude Sonnet 4 (compliance, quotes, legal)

---

## 🎯 PROJECT CONTEXT

### **Mission**
Build a comprehensive mortgage automation platform that handles the complete loan lifecycle from lead capture through closing, leveraging AI orchestration to reduce manual work by 80% while improving conversion rates.

### **Domain: Mortgage Brokerage Operations**

**Daily Workflows:**
- Lead intake from LendingTree, FreeRateUpdate
- Quote generation via Rocket Mortgage, LenderPrice, Optimal Blue
- Drip campaigns (email, SMS, voicemail) via Twilio, SendGrid
- Document collection and OCR processing
- Loan status tracking and borrower communication
- Underwriting condition management
- Pre-approval to clear-to-close pipeline

**Core Features:**
1. **Lead Management** - Capture, qualify, nurture, convert
2. **Quote Engine** - Multi-lender rate comparison, eligibility calculation
3. **Campaign Automation** - Drip sequences, missed call automation
4. **Mortgage Assistant Chatbot** - AI-powered borrower support
5. **Document Processing** - Upload, OCR, validation, LOS integration
6. **CRM Integration** - TwentyCRM pipeline management
7. **Compliance** - TRID, TILA, RESPA adherence

### **Technology Stack**

**Frontend:**
- Next.js 14 (App Router, Server Components, Streaming)
- React 18 + TypeScript
- Shadcn/ui + Tailwind CSS
- Zustand (state management)
- tRPC (type-safe API)
- Clerk (authentication)

**Backend:**
- FastAPI (Python) - Quote API, document processing
- NestJS (TypeScript) - Campaign engine, orchestration
- PostgreSQL - Primary database
- Redis - Caching, queues
- Neo4j/FalkorDB - Knowledge graphs
- Qdrant - Vector storage

**AI Orchestration:**
- Claude Flow + Archon MCP - Multi-agent coordination
- Nexus Router - LLM routing and load balancing
- Dify - Chat interface and workflow builder

**Memory Systems:**
- **RuVector** - Distributed vector search (Rust, WASM-optimized)
- **Letta** - Agent memory (OS-like RAM vs archival storage)
- **Graphiti** - Temporal knowledge graphs on FalkorDB
- **Mem0** - User personalization across apps
- **OpenMemory** - Shared collaborative memory

**Local LLM Infrastructure:**
- Worker-5090 (RTX 5090, 48GB) - DeepSeek-R1 236B, Qwen 2.5 72B
- Worker-3090 (RTX 3090 Ti, 24GB) - Llama 3.1 70B, Mistral Large 123B
- Worker-3060 (RTX 3060, 12GB) - CodeLlama 34B, Qwen 32B, Gemma 2 27B
- Ollama - LLM serving with GPU acceleration
- Tailscale - Mesh VPN for worker connectivity

**Workflow Automation:**
- n8n - Visual workflow builder
- Activepieces - Lightweight automation
- BullMQ - Job queues

**External Integrations:**
- **Mortgage APIs**: Rocket Mortgage, LenderPrice, Optimal Blue
- **Lead Sources**: LendingTree, FreeRateUpdate
- **CRM**: TwentyCRM, LeadMailbox, LendingPad
- **Communication**: Twilio (SMS, voice), SendGrid (email)
- **Infrastructure**: Docker, Kubernetes, Cloudflare Tunnel

---

## 🏗️ REPOSITORY STRUCTURE

```
Project-Nyra/
├── apps/                          # Frontend applications
│   ├── webapp/                    # Main mortgage assistant app (Next.js)
│   ├── landing/                   # Marketing landing page
│   ├── ratehunter/                # Public rate display site
│   ├── crm-dashboard/             # CRM admin panel (React)
│   ├── mortgage-assistant/        # AI chatbot interface (Dify)
│   ├── nyra-admin/                # System admin panel
│   └── ratehunter-landing/        # RateHunter brand site
│
├── services/                      # Backend microservices
│   ├── quote-api/                 # Mortgage quote calculation (FastAPI)
│   ├── quote-engine/              # Multi-lender aggregation (Python)
│   ├── campaign-engine/           # Drip campaign automation (NestJS)
│   ├── nyra-orchestrator/         # AI agent coordination (NestJS)
│   └── mem0-mcp/                  # Memory MCP server (Python)
│
├── mcp-servers/                   # Model Context Protocol servers
│   ├── letta/                     # Letta memory MCP
│   ├── graphiti/                  # Graphiti knowledge graph MCP
│   ├── ruvector/                  # RuVector distributed search MCP
│   └── openmemory/                # OpenMemory collaborative MCP
│
├── infra/                         # Infrastructure as Code
│   ├── docker/                    # Docker Compose configurations
│   ├── kubernetes/                # K8s manifests
│   └── terraform/                 # Cloud infrastructure
│
├── .github/workflows/             # CI/CD pipelines
├── coordination/                  # Agent coordination configs
├── memory/                        # Memory system storage
├── orchestration/                 # Swarm orchestration configs
├── tests/                         # Test suites
└── docs/                          # Documentation

```

---

## 🧠 MEMORY SYSTEM USAGE GUIDE

### **When to Use Each System**

| Use Case | System | Why |
|----------|--------|-----|
| "Find code similar to X" | RuVector | Fast vector similarity search |
| "Remember this conversation context" | Letta | Agent conversational memory |
| "How has this loan status changed?" | Graphiti | Temporal tracking |
| "What are this user's preferences?" | Mem0 | User personalization |
| "Share knowledge with other agents" | OpenMemory | Collaborative memory |
| "Search mortgage documents" | RuVector | Vector-based document search |
| "Track borrower relationship history" | Graphiti | Relationship evolution |

### **Memory Integration Patterns**

```typescript
// Example: Store mortgage quote in multiple systems
async function storeMortgageQuote(quote: MortgageQuote) {
  // 1. Vector search for similar quotes (RuVector)
  await ruvector.index({
    id: quote.id,
    vector: await embed(quote.description),
    metadata: { borrower_id: quote.borrowerId, amount: quote.loanAmount }
  });
  
  // 2. Update borrower conversation context (Letta)
  await letta.updateCoreMemory(quote.borrowerId, {
    lastQuoteAmount: quote.loanAmount,
    lastQuoteRate: quote.rate,
    lastQuoteDate: new Date()
  });
  
  // 3. Track quote evolution over time (Graphiti)
  await graphiti.addNode({
    type: 'MortgageQuote',
    id: quote.id,
    properties: quote,
    timestamp: new Date(),
    relationships: [
      { type: 'QUOTED_FOR', targetId: quote.borrowerId }
    ]
  });
  
  // 4. Update user preferences (Mem0)
  await mem0.updateUserProfile(quote.borrowerId, {
    preferredLoanType: quote.loanType,
    targetDownPayment: quote.downPayment
  });
}
```

---

## 🔄 SWARM ORCHESTRATION

### **Available Agent Types (54 total)**

**Mortgage Domain Experts (8):**
- `mortgage-quote-agent` - Rate calculation, lender comparison
- `loan-qualification-agent` - DTI, credit, eligibility analysis
- `document-processor-agent` - OCR, validation, extraction
- `compliance-agent` - TRID, TILA, RESPA verification
- `underwriting-agent` - Condition management
- `closing-coordinator-agent` - Clear-to-close orchestration
- `borrower-communication-agent` - Email, SMS, call automation
- `lead-nurture-agent` - Drip campaign management

**Development Agents (20+):**
- `coordinator` - Task breakdown and delegation
- `coder` - Code implementation
- `researcher` - Information gathering
- `analyst` - Data analysis
- `tester` - Test generation and execution
- `debugger` - Error diagnosis and fixing
- `reviewer` - Code review
- `documenter` - Documentation generation
- `architect` - System design
- (see `.claude/agents/` for complete list)

### **Swarm Topologies**

**Mesh (Default):**
- All agents can communicate directly
- Best for: Complex mortgage workflows with many interdependencies
- Example: Pre-approval requiring quote, document, compliance checks

**Hierarchical:**
- Coordinator → Specialists → Workers
- Best for: Structured workflows with clear delegation
- Example: Lead intake → qualification → quote → campaign

**Adaptive:**
- Topology changes based on task complexity
- Best for: Variable workloads with unpredictable patterns
- Example: Responding to underwriter conditions (varies per loan)

### **Concurrent Execution Patterns**

```bash
# ❌ Sequential (SLOW - 5 minutes)
npx claude-flow swarm execute --task "analyze-loan-123" --agent quote-agent
npx claude-flow swarm execute --task "check-compliance-123" --agent compliance-agent
npx claude-flow swarm execute --task "process-docs-123" --agent document-agent

# ✅ Parallel (FAST - 1 minute)
npx claude-flow swarm execute-batch \
  --tasks "analyze-loan-123,check-compliance-123,process-docs-123" \
  --agents "quote-agent,compliance-agent,document-agent" \
  --parallel true \
  --max-concurrent 3
```

---

## 📝 DEVELOPMENT PATTERNS

### **File Organization**

Each directory should have its own `CLAUDE.md` with:
- Purpose and scope
- Technology stack specifics
- Common patterns and utilities
- Testing requirements
- Deployment instructions

**Example Structure:**
```
apps/webapp/
├── CLAUDE.md                      # Next.js + React patterns
├── app/                           # Next.js App Router
├── components/                    # React components
├── lib/                           # Utilities and helpers
├── public/                        # Static assets
└── tests/                         # Test suites
```

### **Coding Standards**

**TypeScript:**
- Strict mode enabled
- Explicit return types for functions
- Interface over type for object shapes
- Descriptive variable names (no abbreviations except common ones)

**React:**
- Functional components only (no class components)
- Custom hooks for reusable logic
- Server Components by default (Next.js)
- Client Components only when needed (interactivity, hooks)

**Python:**
- Type hints for all function signatures
- Docstrings for classes and functions
- Black formatter, isort for imports
- Pydantic models for data validation

**API Design:**
- RESTful conventions for HTTP APIs
- tRPC for type-safe Next.js → API communication
- GraphQL for complex data fetching (if needed)
- Versioning: /api/v1/, /api/v2/

### **Testing Requirements**

**Minimum Coverage: 85%**

```bash
# Unit tests (fast, isolated)
pnpm test:unit

# Integration tests (API, database)
pnpm test:integration

# E2E tests (full user flows)
pnpm test:e2e

# All tests
pnpm test:all
```

**Test Patterns:**
- Unit: Pure functions, utilities, calculations
- Integration: API endpoints, database operations
- E2E: User registration, quote generation, document upload

---

## 🚀 SPARC DEVELOPMENT METHODOLOGY

### **Available SPARC Modes**

| Mode | Purpose | When to Use |
|------|---------|-------------|
| `architect` | System design, architecture decisions | Starting new features, refactoring |
| `code` | Implementation, writing code | Building features |
| `tdd` | Test-driven development | Creating testable, reliable code |
| `debug` | Error diagnosis and fixing | Troubleshooting issues |
| `security-review` | Security analysis, vulnerability scanning | Before production deployment |
| `performance-optimizer` | Speed and efficiency improvements | Slow endpoints, heavy operations |
| `refactor` | Code quality improvements | Technical debt reduction |
| `documentation` | Generate docs, comments, guides | Knowledge sharing |
| `mortgage-domain-expert` | Mortgage-specific logic | Quote calculations, compliance |

### **SPARC Workflow Example**

```bash
# 1. Architecture phase
npx claude-flow sparc architect --feature "borrower-document-upload"

# 2. TDD phase (write tests first)
npx claude-flow sparc tdd --component "DocumentUploader"

# 3. Code phase (implement)
npx claude-flow sparc code --implement-tests

# 4. Security review
npx claude-flow sparc security-review --scope "document-upload"

# 5. Performance optimization
npx claude-flow sparc performance --target "upload-endpoint"
```

---

## 🔌 MCP TOOLS AVAILABLE

### **Memory Systems**
- `ruvector_search(query, k=5)` - Fast vector similarity search
- `ruvector_index(content, metadata)` - Add to vector index
- `letta_update_memory(agent_id, memory_type, content)` - Update agent memory
- `letta_recall(agent_id, query)` - Search agent memory
- `graphiti_add_node(type, properties, relationships)` - Add knowledge graph node
- `graphiti_query(cypher_query)` - Query temporal graph
- `graphiti_get_evolution(entity_id, timerange)` - Track changes over time
- `mem0_get_user_profile(user_id)` - Get user preferences
- `mem0_update_profile(user_id, updates)` - Update preferences
- `openmemory_share(content, agents)` - Share knowledge with agents

### **Mortgage Domain Tools**
- `calculate_dti(income, debts)` - Debt-to-income ratio
- `check_eligibility(borrower, loan_type)` - Loan qualification
- `generate_quote(loan_params)` - Multi-lender quote
- `validate_documents(files, loan_type)` - Document requirement check
- `calculate_apr(rate, fees, amount, term)` - APR calculation
- `check_compliance(loan, regulation)` - Regulatory compliance

### **CRM & Communication**
- `twenty_create_lead(data)` - Add lead to CRM
- `twenty_update_pipeline(lead_id, stage)` - Move pipeline stage
- `twilio_send_sms(to, message)` - Send SMS
- `twilio_make_call(to, message)` - Automated call
- `sendgrid_send_email(to, subject, body)` - Send email

---

## 🎛️ ORCHESTRATION COMMANDS

### **Quick Actions**

```bash
# Initialize new borrower workflow
npx claude-flow workflow run lead-to-quote --borrower-id 12345

# Generate mortgage quote
npx claude-flow mortgage quote --borrower-id 12345 --loan-type conventional

# Process uploaded documents
npx claude-flow documents process --borrower-id 12345 --files paystub.pdf,w2.pdf

# Run drip campaign
npx claude-flow campaign start --borrower-id 12345 --sequence pre-approval

# Check loan status
npx claude-flow loan status --loan-id 67890

# Agent coordination
npx claude-flow swarm coordinate --task "complete-pre-approval" --loan-id 67890
```

### **Memory Operations**

```bash
# Query vector memory
npx claude-flow memory search --system ruvector --query "conventional loan 3.5% down"

# Get borrower conversation history
npx claude-flow memory recall --system letta --agent-id borrower-12345

# Track loan evolution
npx claude-flow memory evolution --system graphiti --entity-id loan-67890

# Sync all memory systems
npx claude-flow memory sync --all --bidirectional
```

---

## 📊 MONITORING & PERFORMANCE

### **Key Metrics to Track**

**Business Metrics:**
- Lead conversion rate (target: >15%)
- Time to quote generation (<2 minutes)
- Documents processed per hour (>50)
- Email/SMS open rates (>40%)
- Borrower satisfaction (>4.5/5)

**Technical Metrics:**
- API response time (<200ms p95)
- LLM routing local vs cloud (>80% local)
- Memory system latency (<50ms read)
- Agent task completion rate (>95%)
- System uptime (>99.9%)

### **Health Checks**

```bash
# Check all services
docker-compose ps

# Memory systems health
curl http://localhost:7000/health  # RuVector
curl http://localhost:8283/health  # Letta
curl http://localhost:6379/ping    # FalkorDB
curl http://localhost:8081/health  # Mem0
curl http://localhost:8080/health  # OpenMemory

# GPU workers
curl http://worker-5090.tail-net.ts.net:11434/v1/models
curl http://worker-3090.tail-net.ts.net:11434/v1/models
curl http://worker-3060.tail-net.ts.net:11434/v1/models
```

---

## 🔒 COMPLIANCE & SECURITY

### **TRID Requirements**
- Loan Estimate within 3 business days of application
- Closing Disclosure 3 days before closing
- Revised LE if APR changes >0.125%

### **Data Protection**
- Encrypt all PII (SSN, DOB, financials)
- Secure document storage (S3 with encryption)
- API authentication via JWT
- Rate limiting on all endpoints

### **Audit Trail**
- Log all quote generations
- Track document access
- Record borrower communications
- Maintain compliance evidence

---

## 🎯 PRIORITY GUIDELINES

### **What to Build FIRST (Revenue-Generating)**
1. Lead webhook integration (LendingTree, FreeRateUpdate)
2. Quote API integration (Rocket Mortgage)
3. Basic drip campaign (email sequence)
4. TwentyCRM pipeline setup
5. Document upload portal

### **What to Build SECOND (Efficiency)**
6. AI chatbot (Dify + Claude)
7. Multi-lender quote comparison
8. SMS automation (Twilio)
9. Document OCR (Claude Vision)
10. Voicemail drops

### **What to Build LATER (Advanced)**
11. Graphiti temporal tracking
12. Advanced agent orchestration
13. Predictive analytics
14. Custom workflow builder
15. Mobile app

---

## 🛠️ TROUBLESHOOTING

### **Common Issues**

**Memory system not responding:**
```bash
# Check Docker containers
docker-compose ps

# Restart specific service
docker-compose restart ruvector
docker-compose restart letta
```

**GPU worker unreachable:**
```bash
# Check Tailscale connection
tailscale status

# Ping worker
ping worker-5090.tail-net.ts.net

# Check Ollama service
curl http://worker-5090.tail-net.ts.net:11434/v1/models
```

**Claude Flow errors:**
```bash
# Clear cache
npx claude-flow cache clear

# Reinitialize memory
npx claude-flow memory init --all-systems

# Validate configuration
npx claude-flow config validate
```

---

## 📚 ADDITIONAL RESOURCES

- **Project Documentation**: `/docs/`
- **API Reference**: `/docs/api/`
- **Mortgage Operations Guide**: `/docs/mortgage-ops/`
- **Memory Systems Guide**: `/docs/memory/`
- **Deployment Guide**: `/docs/deployment/`
- **Agent Catalog**: `.claude/agents/`
- **Workflow Templates**: `.claude/workflows/`

---

## ⚡ QUICK START CHECKLIST

- [ ] Environment variables configured (`.env`)
- [ ] Docker services running (`docker-compose up -d`)
- [ ] Memory systems initialized (`npx claude-flow memory init --all`)
- [ ] GPU workers accessible (Tailscale)
- [ ] Infisical secrets synced
- [ ] First test lead created in TwentyCRM
- [ ] Quote API responding
- [ ] Drip campaign workflow tested

**Remember: Build features that close deals, not features that impress engineers. Revenue validates everything.**

---

*This CLAUDE.md is the source of truth for Project Nyra development. Update it as the project evolves.*
