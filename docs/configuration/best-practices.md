# Project Nyra - Best Practices & Utilization Guide

**Optimizing Mortgage Automation with Claude Flow Multi-Agent Orchestration**

Version: 1.0
Last Updated: 2026-01-13
Maintainer: Project Nyra Team

---

## 🎯 Overview

This guide provides proven best practices for maximizing the effectiveness of the Project Nyra 4-PC mortgage automation platform. Learn how to leverage multi-agent orchestration, optimize costs, ensure compliance, and scale your operations.

---

## 📊 Table of Contents

1. [Multi-Agent Orchestration](#multi-agent-orchestration)
2. [Memory Management](#memory-management)
3. [Cost Optimization](#cost-optimization)
4. [Compliance-First Development](#compliance-first-development)
5. [Performance Optimization](#performance-optimization)
6. [Workflow Automation](#workflow-automation)
7. [Error Handling & Resilience](#error-handling--resilience)
8. [Security Best Practices](#security-best-practices)
9. [Monitoring & Observability](#monitoring--observability)
10. [Scaling Strategies](#scaling-strategies)

---

## 1. Multi-Agent Orchestration

### 🐝 Swarm Topology Selection

**Rule of Thumb**: Match topology to task complexity and coordination needs.

#### Hierarchical Topology (Queen-Worker)
**Best for**: Complex, multi-step workflows requiring central coordination

```bash
# Initialize hierarchical swarm
npx @claude-flow/cli@latest hive-mind init --topology hierarchical --max-agents 31

# Example: End-to-end loan processing
npx @claude-flow/cli@latest hive-mind spawn \
  "Process 50 loan applications: validate, quote, and campaign" \
  --workers 15 --parallel
```

**Use Cases**:
- Batch processing (50+ leads)
- Multi-phase workflows (validate → quote → campaign)
- Complex decision trees requiring orchestration
- Tasks requiring rollback coordination

**Performance**: 3-5x faster than sequential processing

---

#### Mesh Topology (Peer-to-Peer)
**Best for**: Independent parallel tasks with minimal coordination

```bash
# Mesh for document analysis
npx @claude-flow/cli@latest swarm "Analyze 100 mortgage documents" \
  --topology mesh --agents 20 --parallel
```

**Use Cases**:
- Document analysis/classification
- Rate comparison across lenders
- Lead scoring/qualification
- Independent API calls

**Performance**: 10-15x faster than sequential (limited by API rate limits)

---

#### Adaptive Topology (Dynamic Switching)
**Best for**: Variable workloads with unknown complexity

```bash
# Adaptive topology switches based on task
npx claude-flow hive init --topology adaptive --max-agents 31
```

**How it works**: Starts as mesh, switches to hierarchical if coordination needed.

**Use Cases**:
- General-purpose automation
- Unknown/variable task complexity
- Production systems with mixed workloads

---

### 🎯 Agent Selection Guidelines

**Match agent type to task domain for 20-30% efficiency gain.**

| Task Type | Recommended Agent | Reason |
|-----------|-------------------|--------|
| Code generation | `coder` | Specialized in syntax, patterns |
| Research/analysis | `researcher` | Web search, document analysis |
| Architecture design | `planner` | System-level thinking |
| Quality assurance | `reviewer` | Pattern detection, standards |
| Testing | `tester` | Test generation, coverage |

#### Example: Quote Engine Development
```bash
# GOOD: Use specialized agents
npx claude-flow sparc run all "Build Quote Engine FastAPI service" \
  --agents planner,coder,tester

# BAD: Generic agent for everything
npx claude-flow task "Build Quote Engine" --agent researcher
```

---

### 🔄 Parallel Execution Patterns

**Always execute independent operations in parallel.**

#### ✅ CORRECT: Batch Operations
```bash
# Deploy multiple services simultaneously
npx claude-flow task "Deploy Quote Engine, Campaign Engine, Orchestrator" \
  --parallel --agents coder,coder,coder

# Result: 3 services deployed in time of 1
```

#### ❌ WRONG: Sequential Operations
```bash
# Don't do this!
npx claude-flow task "Deploy Quote Engine"
npx claude-flow task "Deploy Campaign Engine"
npx claude-flow task "Deploy Orchestrator"

# Result: 3x slower
```

---

### 🧠 Task Decomposition Strategy

**Break complex tasks into 3-7 subtasks for optimal agent coordination.**

#### Example: New Feature Development
```bash
# GOOD: Decomposed into phases
npx claude-flow sparc run specification "Add OCR document upload"
npx claude-flow sparc run architecture "Add OCR document upload"
npx claude-flow sparc run completion "Add OCR document upload"

# Uses SPARC methodology: Specification → Architecture → Completion
```

#### Anti-Pattern: Monolithic Task
```bash
# BAD: Single massive task
npx claude-flow task "Build entire loan origination system with OCR, validation, quote generation, compliance, and UI"

# Result: Poor quality, missed requirements
```

**Optimal subtask size**: 10-30 minutes of work per agent

---

## 2. Memory Management

### 🗄️ AgentDB HNSW Optimization

**Use HNSW indexing for 150x-12,500x faster vector search.**

#### Configuration
```javascript
// .claude/settings.json
{
  "memory": {
    "backend": "agentdb",
    "hnsw": {
      "M": 16,              // Connections per node (16 recommended)
      "efConstruction": 200, // Build quality (higher = better)
      "efSearch": 50         // Search quality (50-100 for production)
    },
    "quantization": "scalar", // Reduce memory by 4x
    "cacheSize": 1000         // Cache top 1000 searches
  }
}
```

**Performance Impact**:
- M=16: Balanced speed/accuracy (recommended)
- M=32: +20% accuracy, -15% speed
- efConstruction=400: +10% accuracy, 2x build time

---

### 📝 ReasoningBank Pattern Learning

**Store reusable patterns for 30-40% quality improvement on repeat tasks.**

#### Store Successful Patterns
```javascript
// After successful quote generation
await claudeFlow.reasoningBank.store({
  pattern: "mortgage-quote-conventional",
  trajectory: quoteGenerationSteps,
  verdict: "success",
  confidence: 0.95,
  metadata: {
    loanType: "conventional",
    creditScore: 720,
    ltv: 0.8
  }
});
```

#### Retrieve Patterns for Similar Tasks
```javascript
// Before processing new conventional loan
const patterns = await claudeFlow.reasoningBank.search({
  query: "conventional loan quote",
  filters: { loanType: "conventional" },
  topK: 5
});

// Apply learned patterns
const bestPattern = patterns[0];
quoteEngine.applyPattern(bestPattern);
```

**Use Cases**:
- Loan type-specific quote logic
- Compliance validation rules
- Drip campaign sequences
- Rate comparison strategies

---

### 🔄 Memory Persistence Strategy

**Persist critical state to survive restarts.**

#### What to Persist
✅ **Always Persist**:
- Loan application state
- Borrower conversation history
- Compliance validation results
- Quote calculations and disclosures

❌ **Never Persist**:
- API rate limit counters
- Temporary file paths
- In-flight API requests
- Cached HTML responses

#### Implementation
```javascript
// High-priority persistence (Letta)
await letta.store("borrower-conversation", {
  leadId: "L12345",
  messages: conversationHistory,
  context: borrowerContext,
  ttl: 90 * 24 * 60 * 60 // 90 days
});

// Universal memory (Mem0)
await mem0.store("loan-application", {
  leadId: "L12345",
  status: "quote-generated",
  loanAmount: 350000,
  creditScore: 720
});
```

---

### 🧹 Memory Cleanup Best Practices

**Implement automatic cleanup to prevent database bloat.**

```javascript
// Cleanup old conversations (>90 days)
await letta.cleanup({
  olderThan: 90 * 24 * 60 * 60,
  preserveIfActive: true
});

// Cleanup temporary patterns (low confidence)
await reasoningBank.cleanup({
  confidenceThreshold: 0.6,
  olderThan: 30 * 24 * 60 * 60
});
```

**Cleanup Schedule**:
- **Daily**: Temporary caches, session data
- **Weekly**: Low-confidence patterns, expired conversations
- **Monthly**: Archived leads, old logs

---

## 3. Cost Optimization

### 💰 LLM Provider Routing Strategy

**Use Nexus Router to minimize costs while maintaining quality.**

#### Routing Rules
```yaml
# nexus-router configuration
routing:
  default: gemini-2.0-flash  # $0.075/1M tokens (cheapest)

  fallback:
    - provider: openrouter
      model: anthropic/claude-3-5-sonnet  # $3/1M tokens
      trigger: gemini_rate_limit

    - provider: anthropic
      model: claude-3-5-sonnet-20241022  # $3/1M tokens
      trigger: complex_reasoning_required

  rules:
    # Cheap for simple tasks
    - match: { task_type: "document_classification" }
      provider: gemini-2.0-flash

    # Sonnet for compliance (quality critical)
    - match: { task_type: "compliance_validation" }
      provider: anthropic
      model: claude-3-5-sonnet-20241022

    # Opus for complex reasoning only
    - match: { task_type: "architecture_design" }
      provider: anthropic
      model: claude-opus-4-5-20251101  # $15/1M tokens
```

**Cost Savings**: 60-80% reduction vs always using Claude Sonnet

---

### 📊 Token Usage Optimization

**Reduce token consumption by 50-75% with these techniques.**

#### 1. Use Streaming for Long Operations
```javascript
// BAD: Wait for full response
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: longPrompt }]
});

// GOOD: Stream and cache
const stream = await anthropic.messages.stream({
  model: "claude-3-5-sonnet-20241022",
  messages: [{ role: "user", content: longPrompt }]
});

for await (const chunk of stream) {
  await cache.append(requestId, chunk);
}
```

#### 2. Aggressive Prompt Caching
```javascript
// Cache system prompts (5 min TTL)
const systemPrompt = await cache.get("system-prompt-mortgage-v1", async () => {
  return await fs.readFile("prompts/mortgage-system.txt");
}, { ttl: 300 });

// Cache common mortgage scenarios
const scenarios = await cache.get("mortgage-scenarios-2026", async () => {
  return await fetchMortgageScenarios();
}, { ttl: 3600 });
```

**Token Savings**:
- System prompt caching: 30-40% reduction
- Scenario caching: 20-30% reduction
- Combined: 50-70% total reduction

#### 3. Batch API Calls
```bash
# Process 50 leads in batch (1 API call instead of 50)
npx claude-flow batch "Score and qualify 50 leads from freerateupdate.com" \
  --batch-size 50 --parallel
```

**Cost Impact**:
- 50 individual calls: $3.00 (50 × $0.06)
- 1 batch call: $0.60 (80% savings)

---

### 🎯 Cost Monitoring

**Set up cost tracking and alerts to avoid surprises.**

```javascript
// Track costs per operation
const costTracker = {
  quoteGeneration: { tokens: 15000, cost: 0.045 },  // $0.045 per quote
  leadScoring: { tokens: 5000, cost: 0.015 },       // $0.015 per lead
  campaign: { tokens: 3000, cost: 0.009 }           // $0.009 per campaign
};

// Alert if daily costs exceed threshold
if (dailyCost > 50) {
  await alertmanager.send({
    severity: "warning",
    summary: "Daily LLM costs exceeding $50",
    details: { cost: dailyCost, threshold: 50 }
  });
}
```

**Grafana Dashboard Metrics**:
- Tokens used per operation type
- Cost per lead/quote/campaign
- Provider breakdown (Gemini vs Claude vs OpenRouter)
- Daily/monthly cost trends

---

## 4. Compliance-First Development

### ⚖️ Regulatory Requirements Matrix

**Every mortgage feature MUST pass compliance validation.**

#### Federal Requirements
| Regulation | Requirement | Validation |
|-----------|-------------|------------|
| **TILA** | APR disclosure accuracy | ±0.125% tolerance |
| **RESPA** | Good faith estimate | 3-day delivery |
| **ECOA** | No discriminatory pricing | Audit all decisions |
| **FCRA** | Credit pull authorization | Written consent |
| **CFPB** | Know Before You Owe | Use official forms |

#### State-Specific Requirements
```javascript
// Example: California requires additional disclosures
const stateRequirements = {
  CA: {
    disclosures: ["CA-RMLA", "CA-DBO-1"],
    maxFees: { originationFee: 0.01 },  // 1% max
    coolingOffPeriod: 3  // 3 business days
  },
  TX: {
    disclosures: ["TX-50-A-6"],
    cashOutRefi: { maxLTV: 0.8 },  // 80% max
    homesteadProtections: true
  }
  // ... 48 more states
};
```

---

### 🔍 Compliance Validation Workflow

**Validate compliance at EVERY stage, not just at closing.**

#### Validation Points
```bash
# 1. Lead intake - Verify no discriminatory factors
npx claude-flow task "Validate lead intake compliance" \
  --agent compliance-sentinel \
  --rules tila,respa,ecoa

# 2. Quote generation - Verify APR accuracy
npx claude-flow task "Validate quote compliance" \
  --agent compliance-sentinel \
  --rules tila,cfpb \
  --tolerance 0.00125  # ±0.125%

# 3. Disclosure generation - Verify forms are current
npx claude-flow task "Validate disclosure forms" \
  --agent compliance-sentinel \
  --rules tila,respa,cfpb \
  --form-version 2026-01

# 4. Campaign automation - Verify no prohibited content
npx claude-flow task "Validate campaign messages" \
  --agent compliance-sentinel \
  --rules tcpa,cfpb \
  --consent-verified true
```

---

### 📋 Audit Logging Requirements

**Log every compliance-relevant action for examination readiness.**

```javascript
// Comprehensive audit log entry
await auditLog.write({
  timestamp: new Date().toISOString(),
  eventType: "quote_generated",
  leadId: "L12345",
  userId: "LO-456",  // Loan officer

  // Decision factors (for ECOA compliance)
  inputs: {
    creditScore: 720,
    income: 120000,
    loanAmount: 350000,
    loanType: "conventional"
  },

  // Quote details
  outputs: {
    interestRate: 6.75,
    apr: 6.85,
    monthlyPayment: 2268,
    closingCosts: 7500
  },

  // Compliance validation
  compliance: {
    tilaCompliant: true,
    respaCompliant: true,
    aprAccuracy: 0.0001,  // Well within ±0.125%
    disclosuresGenerated: ["TILA-2026", "GFE-2026"]
  },

  // Tamper detection
  dataHash: "sha256:abc123..."
});
```

**Retention**: 7 years (CFPB requirement)

---

### 🚫 Anti-Steering Policy Enforcement

**Ensure fair lending with automated anti-steering checks.**

```javascript
// Detect potential steering
async function detectSteering(quote, alternatives) {
  const complianceAgent = await claudeFlow.spawn("compliance-sentinel");

  const analysis = await complianceAgent.analyze({
    primaryQuote: quote,
    alternatives: alternatives,

    checks: [
      "Is borrower presented with lower-cost options?",
      "Are all eligible loan types shown?",
      "Is loan officer incentivized against borrower interest?",
      "Does quote maximize fees without borrower benefit?"
    ]
  });

  if (analysis.steeringDetected) {
    await alertmanager.send({
      severity: "critical",
      summary: "Potential steering detected",
      leadId: quote.leadId,
      loanOfficer: quote.userId,
      recommendation: "Present all options to borrower"
    });

    // Block quote until reviewed
    return { approved: false, reason: "steering_suspected" };
  }

  return { approved: true };
}
```

---

## 5. Performance Optimization

### ⚡ Response Time Targets

**Maintain these SLAs for production mortgage automation.**

| Operation | Target | P95 | P99 |
|-----------|--------|-----|-----|
| Quote generation | 1.5s | 2.0s | 3.0s |
| Lead scoring | 0.5s | 1.0s | 1.5s |
| Document classification | 0.3s | 0.5s | 1.0s |
| Compliance validation | 1.0s | 1.5s | 2.0s |
| Campaign trigger | 0.2s | 0.5s | 1.0s |

#### Optimization Techniques
```javascript
// 1. Parallel validation (2x speedup)
const [tilaValid, respaValid, ecoaValid] = await Promise.all([
  validateTILA(quote),
  validateRESPA(quote),
  validateECOA(quote)
]);

// 2. Aggressive caching (3x speedup for repeat scenarios)
const rateTable = await cache.get(`rates-${date}-${loanType}`, async () => {
  return await fetchRatesFromAPI(date, loanType);
}, { ttl: 300 });  // 5 min cache

// 3. Async non-critical operations
// Don't wait for campaign logging
campaignLogger.log(campaignEvent).catch(console.error);
return { success: true };  // Return immediately
```

---

### 🔥 Ollama GPU Optimization

**Maximize local LLM inference throughput on GPU workers.**

#### Configuration (PC3 - RTX 5090)
```yaml
# ollama configuration
OLLAMA_NUM_PARALLEL=4       # Run 4 models concurrently
OLLAMA_MAX_LOADED_MODELS=3  # Keep 3 models in VRAM
OLLAMA_GPU_LAYERS=50        # Offload 50 layers to GPU
OLLAMA_FLASH_ATTENTION=1    # Enable Flash Attention (7x speedup)
```

**Performance Impact**:
- 4 parallel requests: 4x throughput
- Flash Attention: 2.5x faster per request
- **Combined**: 10x faster than sequential CPU inference

#### Model Selection
```bash
# Fast models for simple tasks (50-80 tokens/sec)
docker exec ollama ollama run llama3.1:8b  # 8B parameters
docker exec ollama ollama run mistral:7b   # 7B parameters

# Powerful models for complex reasoning (20-30 tokens/sec)
docker exec ollama ollama run llama3.1:70b  # 70B parameters
docker exec ollama ollama run codellama:34b # 34B parameters
```

**Routing Strategy**:
- Document classification: llama3.1:8b (fast)
- Quote generation: mistral:7b (balanced)
- Compliance reasoning: llama3.1:70b (quality)

---

### 📈 Database Query Optimization

**Optimize PostgreSQL for mortgage workload.**

#### Indexing Strategy
```sql
-- TwentyCRM lead lookup (most common query)
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status_created ON leads(status, created_at DESC);

-- Quote history lookup
CREATE INDEX idx_quotes_lead_created ON quotes(lead_id, created_at DESC);

-- Campaign performance
CREATE INDEX idx_campaigns_status_sent ON campaigns(status, sent_at DESC);

-- Composite index for common filters
CREATE INDEX idx_leads_composite ON leads(status, loan_type, credit_score)
  WHERE status IN ('new', 'qualified', 'quoted');
```

**Query Performance**:
- Before indexing: 500-1000ms
- After indexing: 10-50ms (10-50x faster)

#### Connection Pooling
```yaml
# PostgreSQL connection pool (for TwentyCRM)
POSTGRES_MAX_CONNECTIONS=100
POSTGRES_POOL_SIZE=20
POSTGRES_POOL_TIMEOUT=10000
POSTGRES_IDLE_TIMEOUT=30000
```

---

## 6. Workflow Automation

### 🔄 n8n Drip Campaign Best Practices

**Design resilient, compliant mortgage drip campaigns.**

#### Campaign Structure
```
Lead Intake (Webhook)
  ↓
Qualification Check (HTTP Request to Quote Engine)
  ↓ (if qualified)
Day 1: Welcome Email (SendGrid)
  ↓ (wait 1 day)
Day 2: Rate Comparison Email (SendGrid)
  ↓ (wait 2 days)
Day 4: Application Reminder (Twilio SMS)
  ↓ (wait 3 days)
Day 7: Follow-up Call (Twilio Voice)
  ↓ (if no response, wait 7 days)
Day 14: Re-engagement Email (SendGrid)
```

#### Compliance Safeguards
```javascript
// n8n workflow node: TCPA consent validation
function validateTCPAConsent() {
  if (!leadData.smsConsent) {
    return { skip: true, reason: "No SMS consent" };
  }

  if (!leadData.callConsent) {
    return { skip: true, reason: "No call consent" };
  }

  // Check do-not-call registry
  const isOnDNC = await checkDNCRegistry(leadData.phone);
  if (isOnDNC) {
    return { skip: true, reason: "On DNC registry" };
  }

  return { proceed: true };
}
```

---

### 🎯 Trigger Optimization

**Use event-driven triggers for instant response.**

#### Webhook-Based Triggers (Best)
```javascript
// Trigger immediately when lead submits form
app.post("/api/lead/submit", async (req, res) => {
  const lead = req.body;

  // Trigger n8n workflow via webhook
  await axios.post("http://10.0.0.2:5678/webhook/lead-intake", {
    leadId: lead.id,
    source: lead.source,
    loanType: lead.loanType
  });

  res.json({ success: true, leadId: lead.id });
});
```

**Response time**: < 100ms

#### Polling-Based Triggers (Fallback)
```javascript
// Poll TwentyCRM for new leads every 5 minutes
setInterval(async () => {
  const newLeads = await twentyCRM.getLeads({
    status: "new",
    createdAfter: lastPollTime
  });

  for (const lead of newLeads) {
    await triggerWorkflow("lead-intake", lead);
  }

  lastPollTime = Date.now();
}, 5 * 60 * 1000);  // 5 minutes
```

**Response time**: 0-5 minutes (average 2.5 min delay)

**Recommendation**: Use webhooks for all real-time workflows.

---

### 🔁 Workflow Error Handling

**Implement retry logic with exponential backoff.**

```javascript
// n8n workflow node: Retry with backoff
async function sendEmailWithRetry(email, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sendgrid.send(email);
      return { success: true };
    } catch (error) {
      if (attempt === maxRetries) {
        // Log to Grafana + alert
        await grafana.logError({
          workflow: "mortgage-drip-campaign",
          step: "email-send",
          error: error.message,
          leadId: email.leadId
        });

        return { success: false, error: error.message };
      }

      // Exponential backoff: 2^attempt seconds
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
}
```

**Retry Schedule**:
- Attempt 1: Immediate
- Attempt 2: +2 seconds
- Attempt 3: +4 seconds
- Attempt 4: +8 seconds (max)

---

## 7. Error Handling & Resilience

### 🛡️ Circuit Breaker Pattern

**Prevent cascade failures with circuit breakers.**

```javascript
class CircuitBreaker {
  constructor(failureThreshold = 5, timeout = 60000) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = "CLOSED";  // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() < this.nextAttempt) {
        throw new Error("Circuit breaker is OPEN");
      }
      this.state = "HALF_OPEN";
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = "CLOSED";
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = Date.now() + this.timeout;
    }
  }
}

// Usage: Protect external API calls
const freerateUpdateBreaker = new CircuitBreaker(5, 60000);

const rates = await freerateUpdateBreaker.execute(async () => {
  return await fetch("https://api.freerateupdate.com/rates");
});
```

**Protection**: After 5 failures, stop calling API for 60 seconds.

---

### 🔄 Graceful Degradation

**Maintain service even when dependencies fail.**

```javascript
// Quote generation with fallback strategy
async function generateQuote(leadData) {
  try {
    // Primary: Claude Sonnet (high quality)
    return await claudeSonnet.generateQuote(leadData);
  } catch (error) {
    console.warn("Claude failed, trying Gemini...");

    try {
      // Fallback 1: Gemini Flash (fast, cheap)
      return await geminiFlash.generateQuote(leadData);
    } catch (error2) {
      console.warn("Gemini failed, using rule-based...");

      // Fallback 2: Rule-based calculation (guaranteed)
      return await ruleBased.calculateQuote(leadData);
    }
  }
}
```

**Quality Trade-off**:
- Claude Sonnet: 95% accuracy, $0.045/quote
- Gemini Flash: 90% accuracy, $0.001/quote
- Rule-based: 85% accuracy, $0.000/quote

**Recommendation**: Always have a guaranteed fallback.

---

### 📊 Health Check Monitoring

**Implement comprehensive health checks for all services.**

```javascript
// Health check endpoint (FastAPI)
@app.get("/health")
async def health_check():
    checks = {
        "database": await check_database(),
        "redis": await check_redis(),
        "nexus": await check_nexus_router(),
        "agentdb": await check_agentdb(),
        "disk_space": await check_disk_space(),
        "memory": await check_memory()
    }

    all_healthy = all(check["status"] == "healthy" for check in checks.values())
    status_code = 200 if all_healthy else 503

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if all_healthy else "unhealthy",
            "checks": checks,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

**Health Check Schedule**:
- Prometheus: Every 15 seconds
- Grafana alerting: < 90% healthy triggers alert
- Automated restart: 3 consecutive failures

---

## 8. Security Best Practices

### 🔐 Secrets Management

**NEVER commit secrets to Git. Use Infisical for all credentials.**

#### Infisical Configuration
```bash
# Initialize Infisical in project
npm install -g @infisical/cli
infisical init

# Store secrets
infisical secrets set ANTHROPIC_API_KEY sk-ant-xxxxx --env production
infisical secrets set OPENROUTER_API_KEY sk-or-xxxxx --env production
infisical secrets set DATABASE_PASSWORD xxxxx --env production

# Inject secrets at runtime
infisical run --env=production -- npm start
```

#### Environment Variable Validation
```javascript
// Validate all required secrets at startup
const requiredSecrets = [
  "ANTHROPIC_API_KEY",
  "OPENROUTER_API_KEY",
  "DATABASE_PASSWORD",
  "REDIS_PASSWORD",
  "JWT_SECRET"
];

for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    console.error(`Missing required secret: ${secret}`);
    process.exit(1);
  }
}
```

---

### 🔒 Data Encryption

**Encrypt all PII at rest and in transit.**

#### Encryption at Rest
```javascript
// Encrypt sensitive fields before storing
const crypto = require("crypto");

function encryptPII(data, key) {
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encrypted,
    authTag: cipher.getAuthTag().toString("hex"),
    iv: iv.toString("hex")
  };
}

// Store encrypted borrower data
await db.leads.create({
  id: leadId,
  email: lead.email,  // Not PII, store plaintext for lookup
  ssn: encryptPII(lead.ssn, encryptionKey),  // PII, encrypt
  income: encryptPII(lead.income, encryptionKey),  // PII, encrypt
  assets: encryptPII(lead.assets, encryptionKey)  // PII, encrypt
});
```

#### Encryption in Transit
```yaml
# Enforce TLS 1.3 for all external connections
services:
  nginx:
    image: nginx:latest
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    environment:
      - SSL_PROTOCOLS=TLSv1.3
      - SSL_CIPHERS=HIGH:!aNULL:!MD5
```

---

### 🛡️ API Rate Limiting

**Protect services from abuse with rate limiting.**

```javascript
// Express rate limiting middleware
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});

app.use("/api/", limiter);

// Stricter limit for quote generation (resource-intensive)
const quoteLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5,  // 5 quotes per minute per IP
  message: "Quote generation rate limit exceeded"
});

app.use("/api/quote/generate", quoteLimiter);
```

---

### 🔍 Security Scanning

**Automated vulnerability scanning in CI/CD pipeline.**

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 0 * * 0"  # Weekly on Sunday

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Scan dependencies for vulnerabilities
      - name: npm audit
        run: npm audit --audit-level=high

      # Scan Docker images
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'ghcr.io/yourusername/quote-engine:latest'
          severity: 'CRITICAL,HIGH'

      # Scan secrets in code
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 9. Monitoring & Observability

### 📈 Key Metrics to Track

**Monitor these metrics in Grafana dashboards.**

#### Business Metrics
| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Leads per day | 10-50 | < 5 (low volume) |
| Quotes generated | 20-100 | < 10 (low conversion) |
| Campaigns sent | 50-500 | < 25 (automation issue) |
| Conversion rate | 5-15% | < 3% (quality issue) |

#### System Metrics
| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| API latency (p95) | < 500ms | > 1000ms |
| Error rate | < 1% | > 5% |
| CPU usage | < 70% | > 90% |
| Memory usage | < 80% | > 95% |
| Disk usage | < 80% | > 90% |

#### LLM Metrics
| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Tokens per quote | 10-20K | > 30K (inefficient) |
| Cost per quote | $0.03-0.05 | > $0.10 |
| Nexus uptime | 99.9% | < 99% |
| Fallback rate | < 5% | > 20% |

---

### 🚨 Alerting Strategy

**Configure Alertmanager for critical issues.**

```yaml
# alertmanager.yml
route:
  receiver: "team-email"
  group_by: ["alertname", "cluster", "service"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    # Critical: Page immediately
    - match:
        severity: critical
      receiver: "pagerduty"
      repeat_interval: 15m

    # Warning: Email team
    - match:
        severity: warning
      receiver: "team-email"
      repeat_interval: 4h

    # Info: Slack notification
    - match:
        severity: info
      receiver: "slack"

receivers:
  - name: "pagerduty"
    pagerduty_configs:
      - service_key: "YOUR_PAGERDUTY_KEY"

  - name: "team-email"
    email_configs:
      - to: "team@ratehunter.net"

  - name: "slack"
    slack_configs:
      - api_url: "YOUR_SLACK_WEBHOOK"
        channel: "#nyra-alerts"
```

---

### 📊 Grafana Dashboard Design

**Create focused dashboards for different audiences.**

#### Operations Dashboard (DevOps Team)
- Service health (all 22 services)
- System resource usage (CPU, memory, disk)
- Network latency between PCs
- Docker container status
- Backup status and age

#### Business Dashboard (Management)
- Leads by source (freerateupdate, lendingtree, direct)
- Conversion funnel (lead → qualified → quoted → closed)
- Revenue projection
- Top loan officers by volume
- Campaign performance

#### Compliance Dashboard (Compliance Team)
- TILA compliance rate (must be 100%)
- Disclosure generation time (must be < 3 days)
- Anti-steering violations (must be 0)
- Audit log completeness
- Suspicious activity flags

---

## 10. Scaling Strategies

### 📈 Horizontal Scaling

**Scale beyond 4 PCs for higher throughput.**

#### Adding Worker Nodes
```bash
# PC5 - Additional worker for peak load
docker-compose -f infra/docker-compose.worker.yml \
  --profile worker-2 \
  up -d

# Configure static IP: 10.0.0.5
./scripts/configure-static-ip.sh PC5

# Join Tailscale mesh
tailscale up --accept-routes
```

**Capacity Increase**:
- 4 PCs: 100 leads/day
- 6 PCs: 150 leads/day (+50%)
- 8 PCs: 200 leads/day (+100%)

---

### ⚡ Load Balancing

**Distribute traffic across multiple service instances.**

```yaml
# nginx load balancer configuration
upstream quote_engine {
  least_conn;  # Send to least loaded server

  server 10.0.0.2:8001 max_fails=3 fail_timeout=30s;
  server 10.0.0.5:8001 max_fails=3 fail_timeout=30s;  # PC5
  server 10.0.0.6:8001 max_fails=3 fail_timeout=30s;  # PC6
}

server {
  listen 80;
  server_name quote.ratehunter.local;

  location / {
    proxy_pass http://quote_engine;
    proxy_next_upstream error timeout http_503;
    proxy_connect_timeout 5s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }
}
```

---

### 🔄 Autoscaling Strategy

**Automatically scale workers based on queue depth.**

```javascript
// Monitor task queue depth
setInterval(async () => {
  const queueDepth = await redis.llen("task-queue");
  const activeWorkers = await getActiveWorkerCount();

  // Scale up if queue is growing
  if (queueDepth > 100 && activeWorkers < 8) {
    console.log("High queue depth, scaling up...");
    await scaleWorkers(activeWorkers + 2);
  }

  // Scale down if queue is empty
  if (queueDepth < 10 && activeWorkers > 4) {
    console.log("Low queue depth, scaling down...");
    await scaleWorkers(Math.max(4, activeWorkers - 2));
  }
}, 60000);  // Check every minute
```

**Scaling Rules**:
- Minimum workers: 4 (baseline capacity)
- Maximum workers: 8 (cost constraint)
- Scale up trigger: Queue > 100 tasks
- Scale down trigger: Queue < 10 tasks for 5 minutes

---

### 🎯 Database Sharding

**Shard TwentyCRM database by lead source for higher throughput.**

```javascript
// Route leads to appropriate shard
function getShardForLead(lead) {
  const shards = {
    "freerateupdate": "shard-1",  // PC2
    "lendingtree": "shard-2",     // PC5
    "direct": "shard-3"           // PC6
  };

  return shards[lead.source] || "shard-1";  // Default shard
}

// Write to appropriate shard
const shard = getShardForLead(lead);
await db[shard].leads.create(lead);

// Query across all shards for reporting
const allLeads = await Promise.all([
  db["shard-1"].leads.find(query),
  db["shard-2"].leads.find(query),
  db["shard-3"].leads.find(query)
]);
```

**Performance Impact**:
- Before sharding: 500 writes/sec (single database)
- After sharding (3 shards): 1500 writes/sec (3x throughput)

---

## 📚 Additional Resources

### Documentation
- **[Complete Setup Guide](../setup-guides/00-MASTER-SETUP-GUIDE.md)** - 7-phase deployment
- **[Troubleshooting Guide](../troubleshooting/CLAUDE-FLOW-ZOD-FIX.md)** - Issue solutions
- **[Claude Flow Workflows](../workflows/TOP-15-CLAUDE-FLOW-WORKFLOWS.md)** - Essential workflows
- **[Version Comparison](../CLAUDE-FLOW-VERSION-COMPARISON.md)** - Migration guide

### External Resources
- **Claude Flow Documentation**: https://docs.claude-flow.dev
- **TwentyCRM Docs**: https://docs.twenty.com
- **n8n Workflow Library**: https://n8n.io/workflows
- **CFPB Compliance**: https://www.consumerfinance.gov/compliance

---

## 🎯 Quick Reference Checklist

### Daily Operations
- [ ] Run health check: `./scripts/health-check-all.sh`
- [ ] Check Grafana dashboards for anomalies
- [ ] Review failed campaign messages
- [ ] Monitor LLM token usage and costs

### Weekly Maintenance
- [ ] Review and restart unhealthy services
- [ ] Update Docker images: `docker compose pull && docker compose up -d`
- [ ] Check disk space usage on all PCs
- [ ] Review compliance audit logs
- [ ] Rotate API keys (monthly schedule)

### Monthly Review
- [ ] Test backup restoration procedure
- [ ] Review and optimize slow queries (PostgreSQL)
- [ ] Update system packages and security patches
- [ ] Review capacity planning and scaling needs
- [ ] Conduct compliance self-audit

---

**Last Updated**: 2026-01-13
**Version**: 1.0
**Maintainer**: Project Nyra Team

For questions or support: support@ratehunter.net
