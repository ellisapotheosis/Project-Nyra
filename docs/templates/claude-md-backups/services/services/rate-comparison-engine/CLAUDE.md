# Rate Comparison Engine - Claude Flow V3 Configuration

> **Automated Mortgage Rate Scraping, Caching & Comparison**
>
> Real-time mortgage rate collection, caching, and comparison with alerts

## 🏠 PROJECT CONTEXT

**Service**: Mortgage Rate Comparison Engine
**Purpose**: Continuously scrape mortgage rates from lenders, maintain cached rates, enable comparison, and alert on rate changes
**Tech Stack**: Express.js (JavaScript), PostgreSQL, Redis, Web Scraping (Axios, Cheerio), Node-Cron, Bull Queue
**Port**: 3003 (configured in docker-compose)
**Domain**: Part of Project Nyra 4-PC mortgage automation platform

**Key Features**:
- Automated rate scraping from mortgage lenders (cron-scheduled)
- Rate caching with configurable TTL
- Rate comparison engine with product matching
- Price alert system with webhook/email notifications
- Web scraping with Cheerio for HTML parsing
- Job queue management with Bull
- Lender rate tracking and historical comparison
- Rate lock period tracking
- Product availability monitoring

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
| **2** | Haiku | ~500ms | $0.0002 | Bug fixes, scraper tweaks, caching logic |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Scraper design, algorithm optimization, comparison logic |

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
- `hierarchical` - Queen controls workers directly (recommended for scraper team)
- `hierarchical-mesh` - V3 queen + peer communication
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence early
- **max-agents 6**: Rate scraping team size
- **specialized**: Clear roles (scraper, cacher, comparator, alerter)
- **consensus**: raft (leader maintains state)

---

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)

When implementing rate scraping or comparison features:

```javascript
// STEP 1: Initialize swarm with anti-drift config
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in ONE message
Task({
  prompt: "Analyze rate scraping requirements, lender targets, HTML patterns, and comparison logic",
  subagent_type: "researcher",
  description: "Research rate scraping",
  run_in_background: true
})
Task({
  prompt: "Design scraper architecture, caching strategy, job queue design, and alert system",
  subagent_type: "system-architect",
  description: "Architecture rate engine",
  run_in_background: true
})
Task({
  prompt: "Implement scrapers, caching logic, comparison engine, and alert notifications",
  subagent_type: "coder",
  description: "Implement scrapers",
  run_in_background: true
})
Task({
  prompt: "Write tests for scraper accuracy, caching, comparisons, and alerts",
  subagent_type: "tester",
  description: "Test rate engine",
  run_in_background: true
})
Task({
  prompt: "Review code quality, scraper reliability, performance, and alert accuracy",
  subagent_type: "reviewer",
  description: "Review scraper code",
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
- 🔍 Researcher: Analyzing rate scraping requirements
- 🏗️ Architect: Designing scraper and cache architecture
- 💻 Coder: Implementing scrapers and comparison
- 🧪 Tester: Testing scraper accuracy
- 👀 Reviewer: Code quality and reliability review

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
# 1. Search memory for scraper patterns
npx @claude-flow/cli@latest memory search --query "web scraper Cheerio patterns" --namespace patterns

# 2. Check if similar feature was done
npx @claude-flow/cli@latest memory search --query "rate caching comparison logic" --namespace tasks

# 3. Load learned optimizations
npx @claude-flow/cli@latest hooks route --task "rate scraping"
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern
npx @claude-flow/cli@latest memory store --namespace patterns --key "rate-scraper-pattern" --value "Axios + Cheerio for HTML parsing, node-cron for scheduling, Bull for job queue, Redis for caching"

# 2. Train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file "src/services/scraper/ScraperScheduler.js" --train-neural true

# 3. Record task completion
npx @claude-flow/cli@latest hooks post-task --task-id "[task-id]" --success true --store-results true

# 4. Trigger optimization for scraping logic
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After scraper improvements | `optimize` | Performance optimization |
| After adding lenders | `testgaps` | Coverage for new lenders |
| After API changes | `document` | Update docs |
| After scraper changes | `audit` | Reliability review |
| Every 5+ file changes | `map` | Update codebase map |

---

## 🚨 CRITICAL DEVELOPMENT RULES

### Scraper Reliability & Performance
- **Rate Limit Handling**: Implement exponential backoff for 429/503 responses
- **HTML Selector Stability**: Monitor for DOM changes in lender websites
- **Data Validation**: Verify scraped rates make sense (e.g., not negative)
- **Error Handling**: Graceful degradation when scraper fails
- **Timeout Management**: Configurable timeout (default 30s) with kill switch

### Data Quality & Accuracy
- Validate all scraped rates before caching
- Track data freshness (timestamp for all rates)
- Implement rate sanity checks (realistic ranges)
- Compare against known baseline rates
- Alert on unexpected rate jumps

### Caching Strategy
- TTL: 60 minutes for most rates (configurable)
- Cache invalidation: On new scrape or manual trigger
- Fallback: Serve stale data if scraper fails
- Eviction: LRU policy for memory management
- Replication: Multi-instance cache consistency

### Alert System
- Webhook notifications to mortgage-assistant-api
- Email alerts for significant rate changes
- Do-not-alert windows (e.g., after-hours)
- Alert thresholds: Configurable per product/lender

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. NEVER save working files to root folder - use `/src` for source code
3. Tests go in `/tests`, migrations in `/migrations`
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
services/rate-comparison-engine/
├── src/
│   ├── services/
│   │   ├── scraper/         # ScraperScheduler.js, lender scrapers
│   │   ├── comparison/      # ComparisonEngine.js
│   │   └── alert/           # AlertService.js
│   ├── routes/              # API routes for rates
│   ├── models/              # Database models (lenders, rates, history)
│   ├── middleware/          # Auth, validation, logging
│   ├── utils/               # Validators, formatters
│   └── server.js            # Entry point
├── migrations/              # Database migrations
├── tests/                   # Jest test files
├── logs/                    # Application logs
├── docs/                    # API documentation
└── config/                  # Configuration
```

---

## 📋 Agent Routing (Anti-Drift)

| Code | Task | Agents |
|------|------|--------|
| 1 | Bug Fix (1-2 files) | coder, tester |
| 3 | Feature (new scraper, alert system) | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor (scraper, cache, comparison) | coordinator, architect, coder, reviewer |
| 7 | Performance (caching, scraping speed) | coordinator, perf-engineer, coder |
| 9 | Security (rate accuracy, data validation) | coordinator, security-architect, auditor |

**Code 1-7: Use hierarchical. Code 9: Use mesh for reliability review.**

---

## 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- New lender scraper implementation
- Comparison algorithm changes
- Alert system modifications
- Caching strategy changes
- Job queue restructuring
- Rate validation rule changes
- Integration with mortgage-assistant-api

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration-only changes

---

## Project Config (Anti-Drift Defaults)

- **Topology**: hierarchical (prevents drift)
- **Max Agents**: 6 (rate scraping team)
- **Strategy**: specialized (clear roles)
- **Consensus**: raft
- **Memory**: hybrid (AgentDB + HNSW)
- **Neural**: Enabled for pattern learning

---

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands for Rate Engine

```bash
# Swarm management
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
npx @claude-flow/cli@latest swarm status

# Memory operations (vector search with 150x-12,500x speedup)
npx @claude-flow/cli@latest memory search --query "rate scraper patterns"
npx @claude-flow/cli@latest memory store --key "cheerio-scraper" --value "Use Axios + Cheerio for HTML parsing"

# Agent management
npx @claude-flow/cli@latest agent spawn -t coder --name rate-scraper
npx @claude-flow/cli@latest agent list

# Task execution
npx @claude-flow/cli@latest task create --description "Add new lender scraper"
npx @claude-flow/cli@latest task assign --task-id [id] --agent-id [agent-id]

# Hooks for learning
npx @claude-flow/cli@latest hooks pre-task --description "Improve comparison accuracy"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
```

---

## 🚀 Available Agents for Rate Engine

### Core Development
- `coder` - Scraper implementation, caching, comparison
- `tester` - Scraper accuracy, alert testing
- `reviewer` - Code quality, scraper reliability
- `system-architect` - Scraper and cache design
- `researcher` - Lender scraping requirements

### Specialized Agents
- `security-architect` - Data validation, rate accuracy
- `security-auditor` - Scraper reliability auditing
- `perf-engineer` - Caching optimization, scraper speed
- `database-expert` - Query optimization

---

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### Essential Hooks for Rate Engine

```bash
# Pre-task hooks (get routing recommendation)
npx @claude-flow/cli@latest hooks pre-task --description "Implement new lender scraper"

# Post-edit hooks (learn from successful edits)
npx @claude-flow/cli@latest hooks post-edit --file "src/services/scraper/ScraperScheduler.js" --train-neural true

# Post-task hooks (record completion)
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true --store-results true

# Background workers for continuous improvement
npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize    # Caching optimization
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit       # Scraper reliability
npx @claude-flow/cli@latest hooks worker dispatch --trigger testgaps    # Test coverage
npx @claude-flow/cli@latest hooks worker dispatch --trigger map         # Codebase mapping

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "rate-api-session"
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

**Train on successful rate scraping patterns:**
```bash
npx @claude-flow/cli@latest neural train --pattern-type scraper-design --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type caching-strategy --epochs 10
npx @claude-flow/cli@latest neural train --pattern-type rate-comparison --epochs 10

# Predict optimal approach for new lenders
npx @claude-flow/cli@latest neural predict --input "Add new mortgage lender scraper"

# View learned patterns
npx @claude-flow/cli@latest neural patterns --list
```

---

## 🧠 Memory Management

**Key memory patterns to maintain:**
- `cheerio-scraper` - Web scraping with Axios + Cheerio
- `redis-caching` - Rate caching with TTL management
- `bull-queue` - Job queue for async scraping
- `rate-comparison` - Comparison algorithm
- `alert-system` - Rate change alerts
- `node-cron-scheduling` - Cron-based scraping

---

## 🎯 PROJECT CONTEXT

**Service Architecture**: Rate Comparison Engine
- **Infrastructure**: 4-PC local LAN cluster with Archon OS orchestration
- **Integration**: Works with mortgage-assistant-api for rate lookup
- **Compliance**: Accurate rate representation required
- **Scale**: Handles 100-500 mortgage leads monthly with frequent rate queries

**Key Dependencies**:
- `express` (4.18.2) - REST API framework
- `pg` (8.11.3) - PostgreSQL client
- `redis` (4.6.11) - Caching
- `axios` (1.6.2) - HTTP client for scraping
- `cheerio` (1.0.0-rc.12) - jQuery-like HTML parsing
- `node-cron` (3.0.3) - Cron job scheduling
- `bull` (4.12.0) - Job queue
- `joi` (17.11.0) - Validation
- `winston` (3.11.0) - Logging
- `helmet` (7.1.0) - Security
- `cors` (2.8.5) - CORS handling

---

## 🔧 Development Patterns

### JavaScript/Node.js Configuration
```bash
# Standard Node.js setup
Node 18+ required for performance
Standard npm scripts for dev/build/test
```

### Web Scraping Pattern
```javascript
// 1. HTTP request with Axios (timeout, retries, headers)
// 2. HTML parsing with Cheerio (selectors, DOM traversal)
// 3. Data extraction and validation
// 4. Store in PostgreSQL for history
// 5. Cache in Redis for quick lookup
```

### Cron Job Scheduling
```javascript
// Schedule: Every 60 minutes (configurable)
// Tasks: Trigger scrapers, update cache, check alerts
// Error handling: Retry on failure, log to Winston
// State: Track last run time, success/failure
```

### Bull Queue Pattern
```javascript
// Queue name: 'rate-scraping'
// Job types: scrape-rates, update-cache, send-alerts
// Concurrency: Configurable (default 5 concurrent scrapers)
// Retry: 3 attempts with exponential backoff
```

### Error Handling
```javascript
// Winston logging for all operations
// Structured error responses
// Graceful degradation on scraper failures
// Alert notifications for critical errors
```

### Testing Strategy
```bash
npm run test                      # Jest unit tests
npm run test:watch               # Watch mode
npm run test:integration         # Integration tests
npm run test:coverage            # Coverage reporting
```

---

## 🚀 Deployment & CI/CD

**Docker Container:**
```dockerfile
# Single-stage build (JavaScript, no compilation)
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

**Environment Variables Required:**
- `PORT=3003`
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME` - PostgreSQL
- `REDIS_HOST`, `REDIS_PORT` - Redis cache
- `SCRAPER_INTERVAL_MINUTES` - Cron interval (default 60)
- `ALERT_WEBHOOK_URL` - Notification endpoint
- `LOG_LEVEL` - Logging level

**Health Check:**
```bash
GET /health - Service health
GET /health/db - Database connectivity
GET /health/redis - Redis cache
GET /health/scrapers - Last scraper run status
```

---

## 🔒 Security & Compliance

### Web Scraping Ethics
- Respect robots.txt and scraping policies
- Implement rate limiting to avoid server overload
- Use appropriate User-Agent headers
- Cache aggressively to minimize requests
- Implement backoff strategies for 429/503 responses

### Data Accuracy
- Validate all scraped rates (sanity checks)
- Compare against baseline rates
- Track data freshness timestamps
- Alert on suspicious rate changes
- Maintain scraping accuracy metrics

### API Security
- JWT authentication for sensitive endpoints
- Rate limiting on API (100 req/15 min)
- HTTPS enforcement
- CORS configuration for mortgag-assistant-api
- Input validation with Joi

### Data Privacy
- Don't store sensitive borrower data
- No personal information in rate history
- GDPR compliance for any user tracking
- Rate data retention policy

---

## 🔧 Environment Variables

```bash
# Server
PORT=3003
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mortgage_rates
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Rate Scraping
SCRAPER_INTERVAL_MINUTES=60
SCRAPER_TIMEOUT_MS=30000
MAX_CONCURRENT_SCRAPERS=5

# Cache Settings
CACHE_TTL_SECONDS=3600
RATE_CACHE_KEY_PREFIX=rate:

# Alert Settings
ALERT_CHECK_INTERVAL_MINUTES=30
ALERT_EMAIL_ENABLED=false
ALERT_WEBHOOK_URL=

# API Settings
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

---

## 🩺 Doctor Health Checks

Run `npx @claude-flow/cli@latest doctor` to check:
```bash
✓ Node.js version (18+)
✓ npm version (9+)
✓ PostgreSQL connectivity
✓ Redis connectivity
✓ Scraper dependencies (Axios, Cheerio)
✓ Job queue setup (Bull)
✓ Cron scheduler
✓ Network connectivity for scraping
✓ Disk space for logs
```

---

## 🚀 Quick Setup

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with local values

# Setup database
npm run migrate

# Start development
npm run dev

# Start scraper service (separate terminal)
npm run scraper:start

# Run tests
npm run test
npm run test:integration

# Production build
npm run build
npm start
```

---

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn agents for scraper features
- File operations (Read, Write, Edit)
- Code generation and implementation
- Bash commands and deployments
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: Initialize scraping team
- **Memory store**: Store scraper patterns, comparison logic
- **Hooks**: Pre/post task learning
- **Session management**: Cross-conversation state

**KEY**: CLI coordinates the strategy via Bash, Claude Code's Task tool executes with real agents.

---

## 📝 Memory Commands Reference (IMPORTANT)

### Store Data
```bash
# Store scraper pattern
npx @claude-flow/cli@latest memory store --key "cheerio-scraper-pattern" \
  --value "Use Axios with timeout, retry on 429, Cheerio for DOM, validate rates" \
  --namespace patterns

# Store caching strategy
npx @claude-flow/cli@latest memory store --key "rate-caching-ttl" \
  --value "60 minutes default TTL, Redis key: rate:{product}:{lender}, LRU eviction" \
  --namespace patterns --tags "redis,caching"
```

### Search Data (semantic vector search)
```bash
# Find scraper patterns
npx @claude-flow/cli@latest memory search --query "web scraping HTML parsing" --namespace patterns

# Find comparison patterns
npx @claude-flow/cli@latest memory search --query "rate comparison algorithm" --limit 5
```

### List Entries
```bash
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
npx @claude-flow/cli@latest memory retrieve --key "cheerio-scraper-pattern" --namespace patterns
```

---

## 🚀 V3 Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Scraper Run | <30s | Per lender |
| Cache Hit | <10ms | Redis lookup |
| Comparison Query | <50ms | In-memory |
| Rate Accuracy | 99%+ | Validated against baseline |
| Alert Latency | <5min | From rate change detection |
| Data Freshness | <60min | Maximum age of cached rates |
| Scraper Success | 95%+ | Across all lenders |

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
