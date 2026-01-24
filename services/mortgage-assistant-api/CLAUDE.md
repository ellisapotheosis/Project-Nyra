# Mortgage Assistant API - Claude Flow V3 Configuration

> **AI-Powered Mortgage Assistance Core Application Backend**
>
> Central mortgage processing engine for lead qualification, quote generation, and borrower communication

## 🏠 PROJECT CONTEXT

**Service**: Mortgage Assistant API (Core Backend)
**Purpose**: Central mortgage processing engine handling lead qualification, loan calculation, document collection, and borrower communication
**Tech Stack**: Express.js, TypeScript, Prisma ORM, PostgreSQL, Redis, Nodemailer, Twilio
**Port**: 3001 (configured in docker-compose)
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

**Key Features**:
- Lead management and qualification
- Mortgage loan calculation and APR computation
- Document collection workflow management
- Email and SMS communication via Nodemailer/Twilio
- Redis caching for rates and calculations
- Multi-channel borrower communication
- Application state management
- Loan product matching
- Compliance tracking for TILA/RESPA

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
| **2** | Haiku | ~500ms | $0.0002 | Bug fixes, validation, database queries |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Loan algorithms, compliance logic, communication workflows |

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
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Queen controls workers directly (recommended for mortgage core)
- `hierarchical-mesh` - V3 queen + peer communication
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence early
- **max-agents 8**: Core mortgage team size
- **specialized**: Clear roles (loan-calc, lead-mgmt, communication, compliance)
- **consensus**: raft (leader maintains state)

---

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)

When implementing mortgage processing features:

```javascript
// STEP 1: Initialize swarm with anti-drift config
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in ONE message
Task({
  prompt: "Analyze mortgage business requirements, lead qualification criteria, loan products, and compliance needs",
  subagent_type: "researcher",
  description: "Research mortgage requirements",
  run_in_background: true
})
Task({
  prompt: "Design loan calculation engine, lead workflow, state machine, and integration architecture",
  subagent_type: "system-architect",
  description: "Architecture mortgage engine",
  run_in_background: true
})
Task({
  prompt: "Implement loan calculations, lead management, communication workflows, and state transitions",
  subagent_type: "coder",
  description: "Implement mortgage features",
  run_in_background: true
})
Task({
  prompt: "Write tests for loan calculations, qualification logic, workflows, and API endpoints",
  subagent_type: "tester",
  description: "Test mortgage features",
  run_in_background: true
})
Task({
  prompt: "Review code quality, compliance logic, security, and calculation accuracy",
  subagent_type: "reviewer",
  description: "Review mortgage code",
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
- 🔍 Researcher: Analyzing mortgage requirements
- 🏗️ Architect: Designing calculation engine
- 💻 Coder: Implementing loan features
- 🧪 Tester: Testing calculations
- 👀 Reviewer: Compliance and security review

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
# 1. Search memory for mortgage calculation patterns
npx @claude-flow/cli@latest memory search --query "loan calculation DTI APR algorithms" --namespace patterns

# 2. Check if similar feature was done
npx @claude-flow/cli@latest memory search --query "lead qualification workflow" --namespace tasks

# 3. Load learned optimizations
npx @claude-flow/cli@latest hooks route --task "mortgage calculation"
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern
npx @claude-flow/cli@latest memory store --namespace patterns --key "dti-calculation" --value "Gross monthly income / total monthly debt obligations, compliance with Fannie Mae guidelines"

# 2. Train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file "src/services/LoanCalculationService.ts" --train-neural true

# 3. Record task completion
npx @claude-flow/cli@latest hooks post-task --task-id "[task-id]" --success true --store-results true

# 4. Trigger optimization for lending logic
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After loan algorithm changes | `optimize` | Performance optimization |
| After new loan products added | `testgaps` | Coverage for new products |
| After API changes | `document` | Update docs |
| After compliance changes | `audit` | Regulatory review |
| Every 5+ file changes | `map` | Update codebase map |

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Mortgage Calculation Accuracy
- **DTI Calculation**: Must follow Fannie Mae guidelines (monthly debt / gross income)
- **APR Computation**: Include all fees, use actual/360 day count
- **Rate Locks**: Manage rate lock periods and price adjustments
- **Loan Programs**: Support FHA, VA, Conventional, USDA loans

### Compliance Requirements (TILA/RESPA/TRID)
- TILA-RESPA Integrated Disclosure (TRID) for all quotes
- Loan Estimate (LE) within 3 days of application
- Closing Disclosure (CD) minimum 3 days before closing
- Anti-steering documentation
- Fair lending compliance logging
- State-specific regulation validation

### Lead Management
- Capture all required fields per state regulations
- Track lead source and attribution
- Manage lead assignment rules
- Implement lead follow-up workflows
- Privacy compliance (GDPR, CCPA)

### Communication Workflows
- Email templates for compliance-approved messaging
- SMS length restrictions (160 characters)
- Do-not-call list enforcement
- Opt-in/opt-out management
- TRID compliance in all communications

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
services/mortgage-assistant-api/
├── src/
│   ├── controllers/     # Route handlers (leads, loans, quotes)
│   ├── services/        # Business logic (calculations, workflows)
│   ├── middleware/      # Auth, validation, logging
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Utilities (validators, formatters)
│   ├── routes/          # API routes
│   └── index.ts         # App entry point
├── prisma/              # Prisma schema and migrations
├── tests/               # Jest test files
├── docs/                # API documentation
└── config/              # Configuration files
```

---

## 📋 Agent Routing (Anti-Drift)

| Code | Task | Agents |
|------|------|--------|
| 1 | Bug Fix (1-2 files) | coder, tester |
| 3 | Feature (loan calc, lead mgmt, communication) | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor (services, models, APIs) | coordinator, architect, coder, reviewer |
| 7 | Performance (caching, query optimization) | coordinator, perf-engineer, coder |
| 9 | Security/Compliance (TILA/RESPA validation) | coordinator, security-architect, auditor |

**Code 1-7: Use hierarchical. Code 9: Use mesh for compliance review.**

---

## 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Loan calculation algorithm changes
- Lead qualification workflow changes
- New loan product support
- State-specific compliance requirements
- Communication template additions
- Borrower workflow changes
- Integration with rate-comparison-engine

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes only

---

## Project Config (Anti-Drift Defaults)

- **Topology**: hierarchical (prevents drift)
- **Max Agents**: 8 (mortgage core team)
- **Strategy**: specialized (clear roles)
- **Consensus**: raft
- **Memory**: hybrid (AgentDB + HNSW)
- **Neural**: Enabled for pattern learning

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands for Mortgage API

```bash
# Swarm management
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
npx @claude-flow/cli@latest swarm status

# Memory operations (vector search with 150x-12,500x speedup)
npx @claude-flow/cli@latest memory search --query "loan calculation algorithms"
npx @claude-flow/cli@latest memory store --key "dti-calculation" --value "Monthly debt / gross monthly income"

# Agent management
npx @claude-flow/cli@latest agent spawn -t coder --name loan-calculator
npx @claude-flow/cli@latest agent list

# Task execution
npx @claude-flow/cli@latest task create --description "Add FHA loan support"
npx @claude-flow/cli@latest task assign --task-id [id] --agent-id [agent-id]

# Hooks for learning
npx @claude-flow/cli@latest hooks pre-task --description "Implement APR calculation"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
```

---

## 🚀 Available Agents for Mortgage API

### Core Development
- `coder` - Loan calculations, lead management, workflows
- `tester` - Calculation accuracy, workflow testing
- `reviewer` - Code quality, compliance review
- `system-architect` - Loan engine design, state machine
- `researcher` - Mortgage requirements, loan products

### Specialized Agents
- `security-architect` - Authentication, data protection
- `security-auditor` - Compliance auditing, fair lending
- `perf-engineer` - Redis optimization, query performance
- `database-expert` - Prisma optimization, schema design

### Mortgage-Specific Agents
- `mortgage-quote-agent` - Rate calculation, product comparison
- `loan-qualification-agent` - DTI, credit, eligibility
- `compliance-agent` - TILA/RESPA/TRID validation
- `borrower-communication-agent` - Email, SMS automation

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### Essential Hooks for Mortgage API

```bash
# Pre-task hooks (get routing recommendation)
npx @claude-flow/cli@latest hooks pre-task --description "Implement VA loan support"

# Post-edit hooks (learn from successful edits)
npx @claude-flow/cli@latest hooks post-edit --file "src/services/LoanCalculationService.ts" --train-neural true

# Post-task hooks (record completion)
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true

# Background workers for continuous improvement
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize    # Performance optimization
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit       # Compliance review
npx @claude-flow/cli@latest hooks worker dispatch --trigger testgaps    # Test coverage
npx @claude-flow/cli@latest hooks worker dispatch --trigger map         # Codebase mapping

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "mortgage-api-session"
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

**Train on successful mortgage processing patterns:**
```bash
npx @claude-flow/cli@latest neural train --pattern-type loan-calculation --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type lead-qualification --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type compliance-checking --epochs 10

# Predict optimal approach for new features
npx @claude-flow/cli@latest neural predict --input "Add USDA loan support"

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list
```

---

## 🧠 Memory Management

**Key memory patterns to maintain:**
- `dti-calculation` - Debt-to-income ratio calculation method
- `apr-computation` - APR calculation including fees
- `loan-products` - Supported loan programs (FHA, VA, Conventional, USDA)
- `lead-qualification` - Credit score, debt, income requirements
- `compliance-rules` - TILA/RESPA/TRID validation
- `rate-integration` - Integration with rate-comparison-engine
- `communication-templates` - Approved borrower messaging

---

## 🎯 PROJECT CONTEXT

**Service Architecture**: Mortgage Assistant API (Core Engine)
- **Infrastructure**: 4-PC local LAN cluster with Archon OS orchestration
- **Integration**: Central hub for doc-management-api, rate-comparison-engine, ratehunter-api
- **Compliance**: Strict TILA/RESPA/TRID requirements
- **Scale**: Handles 100-500 mortgage leads monthly

**Key Dependencies**:
- `@prisma/client` (5.8.0) - ORM for PostgreSQL
- `express` (4.18.2) - REST API framework
- `redis` (4.6.12) - Caching for rates, leads
- `nodemailer` (6.9.7) - Email communication
- `twilio` (4.20.0) - SMS communication
- `bcryptjs` (2.4.3) - Password hashing
- `jsonwebtoken` (9.0.2) - JWT authentication
- `joi` (17.11.0) - Input validation
- `date-fns` (3.0.6) - Date calculations
- `winston` (3.11.0) - Logging

---

## 🔧 Development Patterns

### TypeScript Configuration
```bash
# Strict TypeScript with mortgage domain types
tsconfig.json: strict: true, esModuleInterop: true
```

### Prisma Schema Patterns
```prisma
// Core entities: Lead, Application, Loan, Payment
// Relationships: Lead → Application → Loan → Document
// Audit fields: createdAt, updatedAt, createdBy, auditLog
// Compliance tracking: disclosure status, calculation records
```

### Service Layer Pattern
```typescript
// LoanCalculationService - DTI, APR, qualification
// LeadManagementService - Lead CRUD, workflow state
// CommunicationService - Email, SMS via Nodemailer/Twilio
// ComplianceService - TILA/RESPA/TRID validation
```

### Redis Caching Strategy
```typescript
// Cache keys: rate:{loanType}:{term}, lead:{leadId}, product:{productId}
// TTL: 300s for rates, 3600s for products
// Invalidation on rate updates or product changes
```

### Error Handling
```typescript
// Winston logging for all operations
// Structured error responses with compliance codes
// Mortgage-specific error types
// Audit trail for all lead changes
```

### Testing Strategy
```bash
npm run test                    # Jest unit tests
npm run test:unit              # Unit tests only
npm run test:integration       # API and workflow tests
npm run test:e2e               # End-to-end scenarios
npm run test:coverage          # Coverage reporting
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
EXPOSE 3001
CMD ["npm", "start"]
```

**Environment Variables Required:**
- `PORT=3001`
- `NODE_ENV=production`
- `DATABASE_URL` - PostgreSQL with Prisma format
- `REDIS_HOST`, `REDIS_PORT` - Redis cache
- `JWT_SECRET` - Token signing
- `TWILIO_*` - SMS configuration
- `SMTP_*` - Email configuration
- `RATE_COMPARISON_API_URL` - Rate engine integration
- `DOC_MANAGEMENT_API_URL` - Document API integration

**Health Check:**
```bash
GET /health - Service health
GET /health/db - Database connectivity
GET /health/redis - Redis cache
GET /health/rate-api - Rate comparison engine
```

---

## 🔒 Security & Compliance

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Loan Officer, Manager, Admin)
- Secure password hashing with bcryptjs
- Session management with Redis

### Data Security
- All sensitive fields encrypted at rest
- HTTPS for all API communication
- CORS configured for frontend origin
- Rate limiting on all endpoints
- Input validation with Joi schemas

### Mortgage Compliance
- TILA-RESPA Integrated Disclosure (TRID) compliance
- Loan Estimate generation within 3 days
- Closing Disclosure minimum 3 days before close
- Anti-steering documentation
- Fair lending monitoring
- State-specific regulations (50 states)
- CFPB examination standards

### Audit & Monitoring
- Complete audit trail for all lead changes
- Compliance logging for all calculations
- Rate lock history tracking
- Communication logging
- Disclosure status tracking

---

## 🔧 Environment Variables

```bash
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mortgage_assistant?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password
EMAIL_FROM="Mortgage Assistant <noreply@mortgage-assistant.com>"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
ALLOWED_FILE_TYPES=.pdf,.jpg,.jpeg,.png,.doc,.docx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3001

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Integration APIs
RATE_COMPARISON_API_URL=http://localhost:3003
DOC_MANAGEMENT_API_URL=http://localhost:3002
RATE_HUNTER_API_URL=http://localhost:3004
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
✓ Email service connectivity
✓ Twilio credentials
✓ Rate comparison API
✓ Document management API
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
npm run test:integration

# Build for production
npm run build
npm start
```

---

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn agents for mortgage features
- File operations (Read, Write, Edit)
- Code generation and implementation
- Bash commands and deployments
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: Initialize mortgage processing team
- **Memory store**: Store calculation patterns, workflows
- **Hooks**: Pre/post task learning
- **Session management**: Cross-conversation state

**KEY**: CLI coordinates the strategy via Bash, Claude Code's Task tool executes with real agents.

---

## 📝 Memory Commands Reference (IMPORTANT)

### Store Data
```bash
# Store DTI calculation pattern
npx @claude-flow/cli@latest memory store --key "dti-calculation" \
  --value "Gross monthly income / total monthly debt obligations, Fannie Mae guidelines" \
  --namespace patterns

# Store loan product support
npx @claude-flow/cli@latest memory store --key "loan-products-supported" \
  --value "FHA (min credit 580), VA (no min credit), Conventional (min 620), USDA (no down payment)" \
  --namespace patterns --tags "loans,products"
```

### Search Data (semantic vector search)
```bash
# Find calculation patterns
npx @claude-flow/cli@latest memory search --query "loan calculation algorithms" --namespace patterns

# Find compliance patterns
npx @claude-flow/cli@latest memory search --query "TILA RESPA TRID disclosure" --limit 5
```

### List Entries
```bash
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
npx @claude-flow/cli@latest memory retrieve --key "dti-calculation" --namespace patterns
```

---

## 🚀 V3 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Loan Calculation | <100ms | DTI, APR, qualification |
| Lead Creation | <200ms | With duplicate check |
| Quote Generation | <500ms | With rate lookup |
| API Response | <200ms | Standard endpoints |
| Redis Cache Hit | <10ms | Rate and product lookups |
| Email Send | <5s | Via Nodemailer |
| SMS Send | <3s | Via Twilio |

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
