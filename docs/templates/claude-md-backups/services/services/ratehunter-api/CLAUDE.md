# RateHunter API - Claude Flow V3 Configuration

> **Mortgage Rate Quotes & Lead Capture API**
>
> Landing page API for mortgage rate quotes and lead generation

## 🏠 PROJECT CONTEXT

**Service**: RateHunter API (Landing Page Backend)
**Purpose**: Public-facing API for mortgage rate quotes, lead capture, and quote management
**Tech Stack**: Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis, Nodemailer, Swagger/OpenAPI
**Port**: 3004 (configured in docker-compose)
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

**Key Features**:
- Rate quote generation with product matching
- Lead capture from public landing pages
- Lead form validation and submission
- Email notifications for quote inquiries
- Quote history and management
- Rate caching for fast retrieval
- Swagger API documentation
- CORS configuration for web frontend
- Rate limiting for abuse prevention

---

## 🚨 AUTOMATIC SWARM ORCHESTRATION

**When starting work on complex tasks, Claude Code MUST automatically:**

1. **Initialize the swarm** using CLI tools via Bash
2. **Spawn concurrent agents** using Claude Code's Task tool
3. **Coordinate via hooks** and memory

### 🚨 CRITICAL: CLI + Task Tool in SAME Message

**When user says "spawn swarm" or requests complex work, Claude Code MUST in ONE message:**
1. Call CLI tools via Bash to initialize coordination
2. **IMMEDIATELY** call Task tool to spawn REAL working agents
3. Both CLI and Task calls must be in the SAME response

**CLI coordinates, Task tool agents do the actual work!**

---

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms (var→const, add-types, remove-console) |
| **2** | Haiku | ~500ms | $0.0002 | API endpoints, lead form validation |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Quote engine design, lead matching logic |

**Before spawning agents, get routing recommendation:**
```bash
npx @claude-flow/cli@latest hooks pre-task --description "[task description]"
```

**When you see recommendations:**
1. `[AGENT_BOOSTER_AVAILABLE]` → Use Edit tool directly for simple transforms
2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks

---

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

**Use this configuration to prevent agent drift:**
```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Queen controls workers directly (recommended for landing page API)
- `hierarchical-mesh` - V3 queen + peer communication
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence early
- **max-agents 6**: Landing page API team
- **specialized**: Clear roles (quote-engine, lead-capture, notification)
- **consensus**: raft (leader maintains state)

---

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)

When implementing quote and lead capture features:

```javascript
// STEP 1: Initialize swarm with anti-drift config
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in ONE message
Task({
  prompt: "Analyze quote engine requirements, lead capture workflows, and API design patterns",
  subagent_type: "researcher",
  description: "Research quote/lead features",
  run_in_background: true
})
Task({
  prompt: "Design API architecture, quote matching, lead workflow, and integration strategy",
  subagent_type: "system-architect",
  description: "Architecture quote API",
  run_in_background: true
})
Task({
  prompt: "Implement quote endpoints, lead capture, validation, and notification system",
  subagent_type: "coder",
  description: "Implement quote features",
  run_in_background: true
})
Task({
  prompt: "Write tests for quote accuracy, lead validation, API endpoints, and workflows",
  subagent_type: "tester",
  description: "Test quote features",
  run_in_background: true
})
Task({
  prompt: "Review code quality, security (lead data protection), and API design",
  subagent_type: "reviewer",
  description: "Review quote code",
  run_in_background: true
})

// STEP 3: WAIT - Tell user agents are working, then STOP
```

---

## ⏸️ CRITICAL: Spawn and Wait Pattern

**After spawning background agents:**

1. **TELL USER** - "I've spawned X agents working in parallel"
2. **STOP** - Do not continue with more tool calls
3. **WAIT** - Let agents complete their work
4. **RESPOND** - When agents return results, review and synthesize

**Example response after spawning:**
```
I've launched 5 concurrent agents to work on this:
- 🔍 Researcher: Analyzing quote and lead workflows
- 🏗️ Architect: Designing API and quote matching
- 💻 Coder: Implementing quote endpoints
- 🧪 Tester: Testing quote accuracy
- 👀 Reviewer: Security and design review

They're working in parallel. I'll synthesize their results when they complete.
```

### 🚫 DO NOT:
- Continuously check swarm status
- Poll TaskOutput repeatedly
- Add more tool calls after spawning
- Ask "should I check on the agents?"

### ✅ DO:
- Spawn all agents in ONE message
- Tell user what's happening
- Wait for agent results to arrive
- Synthesize results when they return

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
```bash
# 1. Search memory for quote and lead patterns
npx @claude-flow/cli@latest memory search --query "quote generation lead capture patterns" --namespace patterns

# 2. Check if similar feature was done
npx @claude-flow/cli@latest memory search --query "rate quote validation form" --namespace tasks

# 3. Load learned optimizations
npx @claude-flow/cli@latest hooks route --task "quote generation"
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern
npx @claude-flow/cli@latest memory store --namespace patterns --key "quote-generation" --value "Match rates to loan programs, include APR, fees, and monthly payment calculations"

# 2. Train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file "src/services/QuoteService.ts" --train-neural true

# 3. Record task completion
npx @claude-flow/cli@latest hooks post-task --task-id "[task-id]" --success true --store-results true

# 4. Trigger optimization for public API
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After quote improvements | `optimize` | Performance optimization |
| After lead field additions | `testgaps` | Coverage for new fields |
| After API changes | `document` | Update Swagger docs |
| After lead data protection | `audit` | Security review |
| Every 5+ file changes | `map` | Update codebase map |

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Lead Capture & Data Protection
- **Consent Management**: Capture explicit opt-in for communications
- **Privacy Compliance**: GDPR, CCPA, state privacy laws
- **Data Validation**: All lead fields required and validated
- **Rate Limiting**: Prevent automated form submission abuse
- **Lead Quality**: Duplicate detection and spam filtering

### Quote Accuracy & Compliance
- Quotes must include all costs (APR, fees, payments)
- Rates from rate-comparison-engine must be current
- Loan program matching based on borrower qualification
- TRID compliance for quote presentation
- Disclosures included in all quotes

### API Security & Performance
- JWT authentication for internal access
- CORS restricted to ratehunter.com and localhost
- Rate limiting per IP (100 requests/15 min)
- Input validation with Joi for all endpoints
- HTTPS enforcement in production

### Integration with Core Services
- Fetches rates from rate-comparison-engine
- Sends leads to mortgage-assistant-api
- Queues documents for doc-management-api
- Respects rate caching (Redis TTL)

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. NEVER save working files to root folder - use `/src` for source code
3. Tests go in `/tests`, prisma schema in `/prisma`
4. USE CLAUDE CODE'S TASK TOOL for spawning agents, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: Batch ALL todos in ONE call
- **Task tool**: Spawn ALL agents in ONE message with full instructions
- **File operations**: Batch ALL reads/writes/edits in ONE message
- **Bash commands**: Batch ALL terminal operations in ONE message
- **Memory operations**: Batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

```
services/ratehunter-api/
├── src/
│   ├── controllers/     # Route handlers (quotes, leads)
│   ├── services/        # Quote engine, lead capture
│   ├── middleware/      # Auth, validation, CORS
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Validators, formatters
│   ├── routes/          # API routes
│   └── server.ts        # Express app
├── prisma/              # Prisma schema and migrations
├── tests/               # Jest test files
├── docs/                # Swagger/API documentation
└── config/              # Configuration
```

---

## 📋 Agent Routing (Anti-Drift)

| Code | Task | Agents |
|------|------|--------|
| 1 | Bug Fix (1-2 files) | coder, tester |
| 3 | Feature (quote endpoint, lead form) | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor (quote engine, validation) | coordinator, architect, coder, reviewer |
| 7 | Performance (caching, API optimization) | coordinator, perf-engineer, coder |
| 9 | Security (lead data, rate limiting) | coordinator, security-architect, auditor |

**Code 1-7: Use hierarchical. Code 9: Use mesh for security review.**

---

## 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Quote generation algorithm changes
- Lead form field additions
- New loan product support
- Integration changes with core services
- API endpoint additions with testing
- Security or compliance changes

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration-only changes

---

## Project Config (Anti-Drift Defaults)

- **Topology**: hierarchical (prevents drift)
- **Max Agents**: 6 (landing page API team)
- **Strategy**: specialized (clear roles)
- **Consensus**: raft
- **Memory**: hybrid (AgentDB + HNSW)
- **Neural**: Enabled for pattern learning

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands for RateHunter API

```bash
# Swarm management
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
npx @claude-flow/cli@latest swarm status

# Memory operations (vector search with 150x-12,500x speedup)
npx @claude-flow/cli@latest memory search --query "quote generation lead capture patterns"
npx @claude-flow/cli@latest memory store --key "lead-form-validation" --value "All fields required, email format validation, phone format validation"

# Agent management
npx @claude-flow/cli@latest agent spawn -t coder --name quote-api
npx @claude-flow/cli@latest agent list

# Task execution
npx @claude-flow/cli@latest task create --description "Add quote history endpoint"
npx @claude-flow/cli@latest task assign --task-id [id] --agent-id [agent-id]

# Hooks for learning
npx @claude-flow/cli@latest hooks pre-task --description "Improve quote matching accuracy"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
```

---

## 🚀 Available Agents for RateHunter API

### Core Development
- `coder` - Quote endpoints, lead capture, validation
- `tester` - API testing, quote accuracy, form validation
- `reviewer` - Code quality, security, API design
- `system-architect` - API and quote engine design
- `researcher` - Quote requirements, lead capture patterns

### Specialized Agents
- `security-architect` - Lead data protection, CORS
- `security-auditor` - Privacy compliance, rate limiting
- `perf-engineer` - API performance, caching
- `api-docs` - Swagger documentation

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### Essential Hooks for RateHunter API

```bash
# Pre-task hooks (get routing recommendation)
npx @claude-flow/cli@latest hooks pre-task --description "Add quote comparison endpoint"

# Post-edit hooks (learn from successful edits)
npx @claude-flow/cli@latest hooks post-edit --file "src/services/QuoteService.ts" --train-neural true

# Post-task hooks (record completion)
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true

# Background workers for continuous improvement
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize    # API performance
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit       # Security/privacy
npx @claude-flow/cli@latest hooks worker dispatch --trigger testgaps    # Test coverage
npx @claude-flow/cli@latest hooks worker dispatch --trigger document    # Swagger update

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "ratehunter-api-session"
npx @claude-flow/cli@latest hooks session-end --export-metrics true
```

---

## 🔄 Session Persistence (Cross-Conversation Learning)

**At session start - restore previous context:**
```bash
npx @claude-flow/cli@latest session restore --latest
```

**At session end - persist learned patterns:**
```bash
npx @claude-flow/cli@latest hooks session-end --generate-summary true --persist-state true --export-metrics true
```

---

## 🧠 Neural Pattern Training

**Train on successful quote and lead patterns:**
```bash
npx @claude-flow/cli@latest neural train --pattern-type quote-matching --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type lead-validation --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type api-design --epochs 10

# Predict optimal approach for new features
npx @claude-flow/cli@latest neural predict --input "Add rate comparison feature"

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list
```

---

## 🧠 Memory Management

**Key memory patterns to maintain:**
- `quote-matching` - Loan product to rate matching algorithm
- `lead-validation` - Form field validation rules
- `api-security` - CORS, rate limiting, authentication
- `rate-integration` - Fetching from rate-comparison-engine
- `lead-handoff` - Sending leads to mortgage-assistant-api
- `swagger-docs` - API documentation structure

---

## 🎯 PROJECT CONTEXT

**Service Architecture**: RateHunter API (Landing Page)
- **Infrastructure**: 4-PC local LAN cluster with Archon OS orchestration
- **Integration**: Public-facing, connects to mortgage-assistant-api and rate-comparison-engine
- **Compliance**: Lead capture compliance, quote accuracy
- **Scale**: Handles 100-500 leads monthly through public landing pages

**Key Dependencies**:
- `@prisma/client` (5.9.0) - ORM for PostgreSQL
- `express` (4.18.2) - REST API framework
- `express-validator` (7.0.1) - Request validation
- `redis` (4.6.12) - Rate and quote caching
- `nodemailer` (6.9.8) - Email notifications
- `joi` (17.12.1) - Schema validation
- `swagger-ui-express` (5.0.0) - Swagger documentation
- `swagger-jsdoc` (6.2.8) - Swagger definition generator
- `winston` (3.11.0) - Logging
- `helmet` (7.1.0) - Security headers
- `morgan` (1.10.0) - HTTP logging

---

## 🔧 Development Patterns

### TypeScript Configuration
```bash
# Strict TypeScript for type safety
tsconfig.json: strict: true, esModuleInterop: true
```

### Prisma Schema Patterns
```prisma
// Core entities: Quote, Lead, QuoteHistory
// Relationships: Lead → Quote → RateSnapshot
// Timestamps: createdAt, updatedAt
// Indices on leadEmail, quoteId for fast lookup
```

### API Endpoint Pattern
```typescript
// Quote Endpoints:
// POST /api/v1/quotes - Generate quote
// GET /api/v1/quotes/:id - Get quote details
// GET /api/v1/quotes - List quotes for lead

// Lead Endpoints:
// POST /api/v1/leads - Capture lead
// GET /api/v1/leads/:id - Get lead info
// POST /api/v1/leads/:id/quotes - Get quotes for lead
```

### Swagger Documentation
```javascript
// JSDoc comments with @swagger tags
// Automatic OpenAPI 3.0 generation
// Schema definitions for request/response
// Examples for all endpoints
```

### Redis Caching Strategy
```typescript
// Cache keys: quote:{leadId}, rates:{timestamp}
// TTL: 300s for rates, 3600s for quotes
// Invalidation on new quotes or rate updates
```

### Error Handling
```typescript
// Express error middleware
// Structured error responses
// Winston logging for all errors
// Proper HTTP status codes
```

### Testing Strategy
```bash
npm run test                      # Jest unit tests
npm run test:watch               # Watch mode
npm run test:e2e                 # End-to-end API tests
npm run test:coverage            # Coverage reporting
```

---

## 🚀 Deployment & CI/CD

**Docker Container:**
```dockerfile
# Multi-stage build
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3004
CMD ["npm", "start"]
```

**Environment Variables Required:**
- `PORT=3004`
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL with Prisma format
- `REDIS_HOST`, `REDIS_PORT` - Redis cache
- `JWT_SECRET` - Token signing
- `CORS_ORIGIN` - Frontend domain(s)
- `RATE_COMPARISON_API_URL` - Rate engine
- `MORTGAGE_ASSISTANT_API_URL` - Lead submission
- `SMTP_*` - Email configuration

**Health Check:**
```bash
GET /health - Service health
GET /health/db - Database connectivity
GET /health/redis - Redis cache
GET /health/rate-api - Rate engine
```

---

## 🔒 Security & Compliance

### Lead Data Protection
- All lead data encrypted at rest
- HTTPS enforcement in production
- GDPR/CCPA compliance for lead storage
- Right to be forgotten implementation
- Lead data deletion after retention period

### Form Security
- CSRF protection with tokens
- Rate limiting per IP (100 req/15 min)
- Input validation with express-validator
- Spam filtering and duplicate detection
- Bot detection (captcha if needed)

### API Security
- JWT authentication for internal access
- CORS restricted to ratehunter.com
- Security headers via Helmet
- Rate limiting on quote generation
- API key validation for integrations

### Compliance & Privacy
- Privacy policy agreement in lead form
- Explicit SMS/Email opt-in
- Do-not-call list compliance
- State privacy law compliance
- Lead source tracking for attribution

---

## 🔧 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3004
API_VERSION=v1

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ratehunter?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@ratehunter.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3001,https://ratehunter.com

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this
API_KEY=your-api-key-for-internal-services

# Logging
LOG_LEVEL=info

# Cache TTL (seconds)
CACHE_TTL_RATES=300
CACHE_TTL_CALCULATOR=600

# Integration APIs
RATE_COMPARISON_API_URL=http://localhost:3003
MORTGAGE_ASSISTANT_API_URL=http://localhost:3001
DOC_MANAGEMENT_API_URL=http://localhost:3002
```

---

## 🩺 Doctor Health Checks

Run `npx @claude-flow/cli@latest doctor` to check:
```bash
✓ Node.js version (18+)
✓ npm version (9+)
✓ PostgreSQL connectivity
✓ Redis connectivity
✓ Prisma schema validity
✓ Email service (SMTP)
✓ Rate comparison API
✓ Mortgage assistant API
✓ TypeScript compilation
```

---

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with local values

# Generate Prisma client
npm run prisma:generate

# Setup database
npm run prisma:migrate

# Start development
npm run dev

# Run tests
npm run test
npm run test:e2e

# Build for production
npm run build
npm start
```

---

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn agents for quote features
- File operations (Read, Write, Edit)
- Code generation and implementation
- Bash commands and deployments
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: Initialize landing page API team
- **Memory store**: Store quote patterns, lead validation
- **Hooks**: Pre/post task learning
- **Session management**: Cross-conversation state

**KEY**: CLI coordinates the strategy via Bash, Claude Code's Task tool executes with real agents.

---

## 📝 Memory Commands Reference (IMPORTANT)

### Store Data
```bash
# Store quote generation pattern
npx @claude-flow/cli@latest memory store --key "quote-matching-algorithm" \
  --value "Match rates by loan program, calculate APR including fees, compute monthly payment" \
  --namespace patterns

# Store lead validation
npx @claude-flow/cli@latest memory store --key "lead-form-validation" \
  --value "Email required, phone required, name required, property ZIP required, loan amount required" \
  --namespace patterns --tags "form,validation"
```

### Search Data (semantic vector search)
```bash
# Find quote patterns
npx @claude-flow/cli@latest memory search --query "quote matching algorithm" --namespace patterns

# Find lead capture patterns
npx @claude-flow/cli@latest memory search --query "lead form validation" --limit 5
```

### List Entries
```bash
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
npx @claude-flow/cli@latest memory retrieve --key "quote-matching-algorithm" --namespace patterns
```

---

## 🚀 V3 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Quote Generation | <100ms | With rate lookup |
| Lead Submission | <200ms | With validation |
| Quote Retrieval | <50ms | From cache |
| API Response | <200ms | Standard endpoints |
| Email Send | <5s | Async via queue |
| Form Validation | <50ms | Input validation |
| Swagger Docs | <100ms | Auto-generated |

---

## 🚨 SWARM EXECUTION RULES (CRITICAL)

1. **SPAWN IN BACKGROUND**: Use `run_in_background: true` for all agent Task calls
2. **SPAWN ALL AT ONCE**: Put ALL agent Task calls in ONE message for parallel execution
3. **TELL USER**: After spawning, list what each agent is doing
4. **STOP AND WAIT**: After spawning, STOP - do NOT add more tool calls or check status
5. **NO POLLING**: Never poll TaskOutput or check swarm status - trust agents to return
6. **SYNTHESIZE**: When agent results arrive, review ALL results before proceeding

---

## Support & Resources

- **Project Nyra**: `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`
- **V3 Template**: `C:\Dev\Projects\Repos\Project-Nyra\docs\development\CLAUDE-MD-V3-TEMPLATE-GUIDE.md`
- **Capabilities**: `.claude-flow/CAPABILITIES.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`

---

*Last Updated: 2026-01-22*
*Version: 1.0 (Claude Flow V3)*
*Type: API Service Configuration*
