# Project Nyra - Claude Flow Implementation Plans

**Generated:** 2026-01-10
**Source Analysis:** Claude Flow UI, Examples, and Wiki repositories
**Priority System:** 🔴 High | 🟡 Medium | 🟢 Low

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [UI Components & Monitoring](#ui-components--monitoring)
3. [Workflow Orchestration](#workflow-orchestration)
4. [Agent Coordination](#agent-coordination)
5. [Memory & Persistence](#memory--persistence)
6. [Development Patterns](#development-patterns)
7. [Testing & Validation](#testing--validation)
8. [Integration Opportunities](#integration-opportunities)
9. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Key Findings

After comprehensive analysis of three Claude Flow resources, the following high-value components and patterns have been identified for Project Nyra integration:

**Most Valuable Components:**
1. ✅ **Real-time Monitoring Dashboard** - AgentsPanel, MemoryPanel, CommandsPanel
2. ✅ **SQLite-based Memory System** - Persistent cross-session coordination
3. ✅ **Stream-JSON Chaining** - 40-60% faster agent-to-agent communication
4. ✅ **SPARC Methodology** - Structured TDD workflow for mortgage calculations
5. ✅ **64 Specialized Agents** - Reusable agent profiles for different tasks

**Quick Wins (Implement First):**
- Monitoring dashboard for lead capture pipeline
- Memory coordination for multi-service state
- Workflow templates for rate updates
- Agent profiles for mortgage calculations

---

## UI Components & Monitoring

### 🔴 Priority: HIGH - Real-Time Monitoring Dashboard

**Source:** `C:/Dev/Projects/Repos/claude-flow-ui-main/src/components/monitoring/`

#### Components to Extract

##### 1. AgentsPanel Component
**File:** `AgentsPanel.tsx`
**Purpose:** Real-time agent status monitoring

```typescript
// Key features to extract:
- Agent state tracking (initializing, idle, busy, error, terminated)
- Health metrics (responsiveness, performance, reliability)
- Task assignment tracking
- WebSocket-based real-time updates

// Nyra Implementation:
interface NyraAgent {
  id: string;
  type: 'lead-capture' | 'rate-scraper' | 'qualification' | 'crm-sync';
  state: 'idle' | 'busy' | 'error';
  currentTask?: string;
  metrics: {
    leadsProcessed: number;
    avgProcessingTime: number;
    errorRate: number;
  };
}
```

**Benefits for Nyra:**
- Monitor lead capture pipeline in real-time
- Track rate update scraper status
- View CRM synchronization health
- Debug mortgage calculation errors

**Implementation Location:** `apps/nyra-admin/src/components/monitoring/AgentsPanel.tsx`

##### 2. MemoryPanel Component
**File:** `MemoryPanel.tsx`
**Purpose:** Memory usage and efficiency tracking

```typescript
// Extract features:
- Memory usage visualization
- Efficiency metrics
- Visual history charts
- Namespace monitoring

// Nyra Use Cases:
- Track shared state between services
- Monitor mortgage calculation cache
- View lead processing pipeline state
- Debug cross-service coordination
```

**Implementation Location:** `apps/nyra-admin/src/components/monitoring/MemoryPanel.tsx`

##### 3. CommandsPanel Component
**File:** `CommandsPanel.tsx`
**Purpose:** Active command tracking

```typescript
// Nyra Integration:
- Track API endpoint calls
- Monitor n8n workflow executions
- View rate scraper commands
- Debug Twenty CRM operations
```

**Implementation Location:** `apps/nyra-admin/src/components/monitoring/CommandsPanel.tsx`

##### 4. PromptPanel Component
**File:** `PromptPanel.tsx`
**Purpose:** AI prompt tracking and history

```typescript
// Nyra Use Cases:
- Track Letta AI conversations
- Monitor mortgage calculation prompts
- View Graphiti knowledge queries
- Debug AI-powered lead qualification
```

**Implementation Location:** `apps/nyra-admin/src/components/monitoring/PromptPanel.tsx`

#### Supporting Infrastructure

##### WebSocket Integration
**File:** `C:/Dev/Projects/Repos/claude-flow-ui-main/src/hooks/useWebSocket.ts`

```typescript
// Extract WebSocket client pattern
export function useWebSocket() {
  const on = (event: string, handler: (data: any) => void) => { ... }
  const off = (event: string, handler?: (data: any) => void) => { ... }
  const emit = (event: string, data?: any) => { ... }
  const isConnected: boolean
  return { on, off, emit, isConnected }
}

// Nyra Events:
- 'lead:captured'
- 'rate:updated'
- 'qualification:complete'
- 'crm:synced'
- 'error:occurred'
```

**Implementation Location:** `packages/shared-hooks/src/useWebSocket.ts`

##### State Management with Zustand
**File:** `C:/Dev/Projects/Repos/claude-flow-ui-main/src/lib/state/`

```typescript
// Zustand store pattern for Nyra
interface NyraMonitoringState {
  agents: Map<string, NyraAgent>;
  memory: MemoryMetrics;
  commands: Command[];
  prompts: Prompt[];
  // Actions
  updateAgent: (agent: NyraAgent) => void;
  logCommand: (command: Command) => void;
}
```

**Implementation Location:** `packages/shared-state/src/monitoring.store.ts`

### 🟡 Priority: MEDIUM - Terminal Interface

**File:** `C:/Dev/Projects/Repos/claude-flow-ui-main/src/hooks/useTerminal.ts`

```typescript
// Optional: Add terminal for admin debugging
// Use xterm.js for interactive terminal
// Connect to service logs via WebSocket

// Nyra Use Case:
- Debug service issues in production
- Run manual rate updates
- Test mortgage calculations
- View real-time logs
```

**Implementation Location:** `apps/nyra-admin/src/components/terminal/Terminal.tsx`

---

## Workflow Orchestration

### 🔴 Priority: HIGH - Workflow Templates

**Source:** `C:/Dev/Projects/Repos/claude-flow-clone/examples/automation-examples.md`

#### 1. Lead Capture Workflow

```json
{
  "name": "Lead Capture & Qualification",
  "version": "1.0.0",
  "description": "Process incoming leads through qualification pipeline",
  "agents": [
    {
      "id": "lead_validator",
      "type": "validator",
      "config": {
        "capabilities": ["email_validation", "phone_validation", "data_cleaning"]
      }
    },
    {
      "id": "mortgage_qualifier",
      "type": "analyzer",
      "config": {
        "capabilities": ["income_analysis", "credit_estimation", "affordability_calc"]
      }
    },
    {
      "id": "crm_syncer",
      "type": "integrator",
      "config": {
        "capabilities": ["twenty_crm", "letta_context", "graphiti_knowledge"]
      }
    }
  ],
  "tasks": [
    {
      "id": "validate_lead",
      "name": "Validate Lead Data",
      "assignTo": "lead_validator",
      "timeout": 30
    },
    {
      "id": "qualify_lead",
      "name": "Mortgage Pre-Qualification",
      "assignTo": "mortgage_qualifier",
      "depends": ["validate_lead"],
      "timeout": 60
    },
    {
      "id": "sync_crm",
      "name": "Sync to Twenty CRM",
      "assignTo": "crm_syncer",
      "depends": ["qualify_lead"],
      "timeout": 30
    }
  ],
  "settings": {
    "maxConcurrency": 3,
    "timeout": 180,
    "failurePolicy": "continue"
  }
}
```

**Implementation Location:** `config/workflows/lead-capture-workflow.json`

#### 2. Rate Update Workflow

```json
{
  "name": "Mortgage Rate Update Pipeline",
  "description": "Scrape, compare, and update mortgage rates",
  "agents": [
    {
      "id": "rate_scraper",
      "type": "scraper",
      "config": {
        "capabilities": ["web_scraping", "rate_extraction", "data_normalization"],
        "sources": ["bankrate", "freddie_mac", "zillow"]
      }
    },
    {
      "id": "rate_comparator",
      "type": "analyzer",
      "config": {
        "capabilities": ["trend_analysis", "market_comparison", "alert_generation"]
      }
    },
    {
      "id": "notification_manager",
      "type": "notifier",
      "config": {
        "capabilities": ["email_alerts", "sms_notifications", "webhook_triggers"]
      }
    }
  ],
  "tasks": [
    {
      "id": "scrape_rates",
      "name": "Scrape Current Rates",
      "assignTo": "rate_scraper",
      "parallel": true
    },
    {
      "id": "analyze_trends",
      "name": "Analyze Rate Trends",
      "assignTo": "rate_comparator",
      "depends": ["scrape_rates"]
    },
    {
      "id": "send_alerts",
      "name": "Send Rate Alerts",
      "assignTo": "notification_manager",
      "depends": ["analyze_trends"],
      "condition": "significantChange === true"
    }
  ]
}
```

**Implementation Location:** `config/workflows/rate-update-workflow.json`

#### 3. Stream-JSON Chaining (NEW!)

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/Workflow-Orchestration.md`

```bash
# Enable real-time agent-to-agent communication
# 40-60% faster than file-based handoffs

# Nyra Use Case: Lead Processing Pipeline
Lead Validator → (stream-json) → Mortgage Qualifier → (stream-json) → CRM Syncer

# Benefits:
- ✅ No intermediate file storage
- ✅ Real-time processing
- ✅ Full context preservation
- ✅ Reduced latency
```

**Configuration:**
```json
{
  "tasks": [
    {
      "id": "validate",
      "description": "Validate lead and output structured data as stream-json"
    },
    {
      "id": "qualify",
      "depends": ["validate"],  // ← Automatic stream chaining
      "description": "Receive validated lead via stream-json, perform qualification"
    }
  ]
}
```

**Implementation Location:** `config/workflows/stream-chained-lead-processing.json`

### 🟡 Priority: MEDIUM - Workflow Orchestration Engine

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/Workflow-Orchestration.md`

#### Orchestration Patterns

1. **Parallel Execution**
```typescript
// Execute independent tasks simultaneously
const parallelTasks = {
  rateUpdate: scrapeMortgageRates(),
  leadValidation: validateLeads(),
  crmSync: syncToCRM()
};
await Promise.all(Object.values(parallelTasks));
```

2. **Sequential with Dependencies**
```typescript
// Tasks with dependencies execute in order
const pipeline = [
  { task: 'capture', deps: [] },
  { task: 'validate', deps: ['capture'] },
  { task: 'qualify', deps: ['validate'] },
  { task: 'sync', deps: ['qualify'] }
];
```

3. **Adaptive Execution**
```typescript
// Adjust strategy based on load
if (leadQueue.length > 100) {
  strategy = 'parallel';
  workers = 10;
} else {
  strategy = 'sequential';
  workers = 3;
}
```

**Implementation Location:** `services/workflow-engine/src/orchestrator.ts`

---

## Agent Coordination

### 🔴 Priority: HIGH - Specialized Agent Profiles

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/Agent-System-Overview.md`

#### Nyra-Specific Agent Profiles

##### 1. Lead Capture Agent
```yaml
---
name: lead-capture-agent
type: integrator
color: "#4CAF50"
description: Validates and processes incoming leads from multiple sources
capabilities:
  - email_validation
  - phone_validation
  - duplicate_detection
  - data_enrichment
priority: high
integration:
  - lead-capture-api
  - twenty-crm
  - letta-integration
---

# Lead Capture Agent

Specialized agent for processing incoming mortgage leads with validation,
enrichment, and CRM integration.

## Responsibilities
- Validate email and phone formats
- Check for duplicate leads
- Enrich with demographic data
- Route to appropriate loan officer
- Sync to Twenty CRM
- Create Letta context

## Usage
```bash
Task("Process incoming lead", "Validate and enrich lead data...", "lead-capture-agent")
```
```

**Implementation Location:** `config/agents/lead-capture-agent.yaml`

##### 2. Mortgage Calculator Agent
```yaml
---
name: mortgage-calculator-agent
type: analyzer
color: "#2196F3"
description: Performs mortgage calculations, affordability analysis, and pre-qualification
capabilities:
  - monthly_payment_calculation
  - affordability_analysis
  - pmi_calculation
  - amortization_schedule
  - pre_qualification
priority: high
---

# Mortgage Calculator Agent

## Calculations Supported
- Monthly payment (principal, interest, taxes, insurance)
- Total loan cost over term
- Amortization schedules
- Affordability analysis (DTI ratios)
- PMI requirements
- Pre-qualification scoring

## Integration
- Uses current rates from rate-comparison-engine
- Stores results in ruvector-search for similarity matching
- Creates affordability reports for loan officers
```

**Implementation Location:** `config/agents/mortgage-calculator-agent.yaml`

##### 3. Rate Comparison Agent
```yaml
---
name: rate-comparison-agent
type: scraper
color: "#FF9800"
description: Scrapes and compares mortgage rates from multiple lenders
capabilities:
  - web_scraping
  - rate_extraction
  - trend_analysis
  - alert_generation
  - market_comparison
priority: high
---

# Rate Comparison Agent

## Data Sources
- Bankrate.com
- Freddie Mac Primary Mortgage Market Survey
- Zillow Mortgage Marketplace
- Local lenders via API

## Features
- Real-time rate tracking
- Historical trend analysis
- Rate drop alerts
- Lender comparison reports
```

**Implementation Location:** `config/agents/rate-comparison-agent.yaml`

##### 4. CRM Sync Agent
```yaml
---
name: crm-sync-agent
type: integrator
color: "#9C27B0"
description: Synchronizes data between services and Twenty CRM
capabilities:
  - twenty_crm_api
  - letta_integration
  - graphiti_knowledge
  - bidirectional_sync
  - conflict_resolution
priority: medium
---

# CRM Sync Agent

## Sync Operations
- Lead data to Twenty CRM
- Conversation history to Letta
- Knowledge graphs to Graphiti
- Updates back from CRM
- Conflict resolution

## Scheduling
- Real-time for new leads
- Batch sync every 15 minutes
- Full reconciliation daily
```

**Implementation Location:** `config/agents/crm-sync-agent.yaml`

### 🟡 Priority: MEDIUM - Multi-Agent Coordination

**Source:** `C:/Dev/Projects/Repos/claude-flow-clone/examples/memory-coordination-example.md`

#### Memory Coordination Protocol

```javascript
// MANDATORY MEMORY WRITES for agent coordination

// Agent 1: Lead Validator
mcp__claude-flow__memory_usage {
  action: "store",
  key: "swarm/lead-validator/status",
  namespace: "coordination",
  value: JSON.stringify({
    agent: "lead-validator",
    status: "processing",
    leadsInQueue: 15,
    validationRate: 25 // leads per minute
  })
}

// Share validated lead data
mcp__claude-flow__memory_usage {
  action: "store",
  key: "swarm/shared/validated-lead-123",
  namespace: "coordination",
  value: JSON.stringify({
    leadId: "lead-123",
    email: "user@example.com",
    phone: "+1234567890",
    validationStatus: "passed",
    enrichedData: { ... }
  })
}

// Agent 2: Mortgage Qualifier checks for validated lead
const leadData = mcp__claude-flow__memory_usage {
  action: "retrieve",
  key: "swarm/shared/validated-lead-123",
  namespace: "coordination"
}

// Share qualification results
mcp__claude-flow__memory_usage {
  action: "store",
  key: "swarm/shared/qualification-lead-123",
  namespace: "coordination",
  value: JSON.stringify({
    leadId: "lead-123",
    qualified: true,
    maxLoanAmount: 450000,
    estimatedRate: 6.75,
    dtiRatio: 0.32
  })
}

// Agent 3: CRM Syncer retrieves both
const validated = retrieve("swarm/shared/validated-lead-123")
const qualified = retrieve("swarm/shared/qualification-lead-123")
// Sync to Twenty CRM
```

**Implementation Location:** `services/coordination/src/memory-protocol.ts`

---

## Memory & Persistence

### 🔴 Priority: HIGH - SQLite Memory System

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/Memory-System.md`

#### Database Schema for Nyra

```sql
-- Create Nyra-specific memory tables
CREATE TABLE lead_pipeline_state (
    lead_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    stage TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mortgage_calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    loan_amount REAL NOT NULL,
    interest_rate REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    calculation_data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lead_id) REFERENCES lead_pipeline_state(lead_id)
);

CREATE TABLE rate_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rate_type TEXT NOT NULL,
    rate_value REAL NOT NULL,
    lender TEXT,
    source TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE agent_coordination (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    task_type TEXT NOT NULL,
    status TEXT NOT NULL,
    data TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
);

CREATE TABLE service_sync_state (
    service_name TEXT PRIMARY KEY,
    last_sync TEXT NOT NULL,
    sync_status TEXT NOT NULL,
    error_count INTEGER DEFAULT 0,
    data TEXT
);
```

**Implementation Location:** `infra/database/memory-schema.sql`

#### Memory Operations for Nyra

```typescript
// Lead Pipeline State Management
class NyraMemoryService {
  async storeLeadState(leadId: string, state: LeadState) {
    await this.memory.store(`lead/${leadId}`, state, {
      namespace: 'pipeline',
      ttl: 86400 // 24 hours
    });
  }

  async getLeadState(leadId: string): Promise<LeadState> {
    return await this.memory.retrieve(`lead/${leadId}`, {
      namespace: 'pipeline'
    });
  }

  async storeMortgageCalculation(leadId: string, calc: Calculation) {
    await this.db.run(`
      INSERT INTO mortgage_calculations
      (lead_id, loan_amount, interest_rate, monthly_payment, calculation_data)
      VALUES (?, ?, ?, ?, ?)
    `, [leadId, calc.loanAmount, calc.rate, calc.monthlyPayment, JSON.stringify(calc)]);
  }

  async getCachedRate(rateType: string): Promise<number | null> {
    const cached = await this.memory.retrieve(`rate/${rateType}`, {
      namespace: 'rates'
    });

    if (cached && this.isFresh(cached.timestamp, 300)) {
      return cached.value;
    }
    return null;
  }

  async coordinateAgents(task: string, agents: string[]) {
    // Store coordination state
    await this.memory.updateSharedState(`task/${task}`, {
      assignedAgents: agents,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    });
  }
}
```

**Implementation Location:** `services/memory-service/src/nyra-memory.service.ts`

### 🟡 Priority: MEDIUM - Cross-Session Persistence

```typescript
// Session Management for Admin Dashboard
class SessionService {
  async saveSession(userId: string, sessionData: any) {
    await this.memory.createSession({
      userId,
      project: 'nyra-admin',
      context: sessionData,
      expiresAt: new Date(Date.now() + 7 * 86400000) // 7 days
    });
  }

  async resumeSession(userId: string) {
    const sessions = await this.memory.query(`
      SELECT * FROM sessions
      WHERE data LIKE '%"userId":"${userId}"%'
      AND expires_at > datetime('now')
      ORDER BY last_accessed DESC
      LIMIT 1
    `);
    return sessions[0];
  }
}
```

**Implementation Location:** `apps/nyra-admin/src/services/session.service.ts`

---

## Development Patterns

### 🔴 Priority: HIGH - SPARC Methodology for Mortgage Calculations

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/SPARC-Methodology.md`

#### SPARC Workflow for Mortgage Features

##### 1. Specification Phase
```markdown
## Mortgage Payment Calculator Specification

### Functional Requirements
1. Calculate monthly payment including:
   - Principal + Interest (P&I)
   - Property taxes
   - Homeowners insurance
   - PMI (if down payment < 20%)
   - HOA fees (optional)

2. Input Validation:
   - Loan amount: $50,000 - $5,000,000
   - Interest rate: 0.1% - 20%
   - Loan term: 10, 15, 20, 25, 30 years
   - Down payment: 0% - 50%

3. Output Format:
   - Monthly payment breakdown
   - Total loan cost
   - Amortization schedule (first 12 months)
   - APR calculation

### Test Scenarios
- Standard 30-year fixed with 20% down
- FHA loan with 3.5% down (requires PMI)
- Jumbo loan scenarios
- Edge cases (minimum/maximum values)
```

**Implementation Location:** `docs/specs/mortgage-calculator-spec.md`

##### 2. Pseudocode Phase
```
FUNCTION calculateMonthlyPayment(loanAmount, annualRate, termYears, downPayment):
    // Calculate principal
    principal = loanAmount - downPayment

    // Convert annual rate to monthly
    monthlyRate = annualRate / 12 / 100

    // Total number of payments
    numPayments = termYears * 12

    // Calculate P&I using amortization formula
    IF monthlyRate == 0:
        monthlyPI = principal / numPayments
    ELSE:
        monthlyPI = principal * (monthlyRate * (1 + monthlyRate)^numPayments)
                    / ((1 + monthlyRate)^numPayments - 1)

    // Calculate PMI if down payment < 20%
    downPaymentPercent = (downPayment / loanAmount) * 100
    IF downPaymentPercent < 20:
        pmi = (principal * 0.01) / 12  // 1% annual PMI
    ELSE:
        pmi = 0

    // Estimate taxes and insurance (1.2% of home value annually)
    monthlyTaxesInsurance = (loanAmount * 0.012) / 12

    // Total monthly payment
    totalMonthly = monthlyPI + pmi + monthlyTaxesInsurance

    RETURN {
        principalAndInterest: monthlyPI,
        pmi: pmi,
        taxesAndInsurance: monthlyTaxesInsurance,
        totalMonthly: totalMonthly
    }
END FUNCTION
```

**Implementation Location:** `docs/specs/mortgage-calculator-pseudocode.md`

##### 3. Architecture Phase
```typescript
// Domain-Driven Design for Mortgage System

// Domain: Mortgage Calculation
interface MortgageCalculator {
  calculatePayment(params: LoanParams): PaymentBreakdown;
  generateAmortizationSchedule(params: LoanParams): AmortizationSchedule;
  calculateAPR(params: LoanParams): number;
}

// Value Objects
class LoanParams {
  constructor(
    public readonly loanAmount: number,
    public readonly downPayment: number,
    public readonly interestRate: number,
    public readonly termYears: number,
    public readonly propertyTax?: number,
    public readonly insurance?: number,
    public readonly hoaFees?: number
  ) {
    this.validate();
  }

  private validate() {
    if (this.loanAmount < 50000 || this.loanAmount > 5000000) {
      throw new Error('Loan amount must be between $50k and $5M');
    }
    // ... more validations
  }
}

// Service Layer
class MortgageCalculatorService implements MortgageCalculator {
  calculatePayment(params: LoanParams): PaymentBreakdown {
    const principal = params.loanAmount - params.downPayment;
    const monthlyRate = params.interestRate / 12 / 100;
    const numPayments = params.termYears * 12;

    // Calculation logic...
  }
}

// Repository Pattern
interface IMortgageRepository {
  saveCalculation(leadId: string, calc: PaymentBreakdown): Promise<void>;
  getCalculationHistory(leadId: string): Promise<PaymentBreakdown[]>;
}
```

**Implementation Location:** `services/mortgage-assistant-api/src/domain/mortgage-calculator.ts`

##### 4. Refinement Phase (TDD)
```typescript
// RED: Write failing test
describe('MortgageCalculator', () => {
  it('should calculate monthly payment for 30-year fixed loan', () => {
    const calculator = new MortgageCalculatorService();
    const params = new LoanParams(
      300000,  // loan amount
      60000,   // down payment (20%)
      6.5,     // interest rate
      30       // term in years
    );

    const result = calculator.calculatePayment(params);

    expect(result.principalAndInterest).toBeCloseTo(1516.16, 2);
    expect(result.pmi).toBe(0); // 20% down, no PMI
    expect(result.totalMonthly).toBeGreaterThan(1516.16);
  });

  it('should include PMI for loans with less than 20% down', () => {
    const calculator = new MortgageCalculatorService();
    const params = new LoanParams(
      300000,  // loan amount
      30000,   // down payment (10%)
      6.5,     // interest rate
      30       // term in years
    );

    const result = calculator.calculatePayment(params);

    expect(result.pmi).toBeGreaterThan(0);
    expect(result.principalAndInterest).toBeCloseTo(1707.00, 2);
  });
});

// GREEN: Minimal implementation (shown above)

// REFACTOR: Improve code quality
class MortgageCalculatorService implements MortgageCalculator {
  calculatePayment(params: LoanParams): PaymentBreakdown {
    const components = {
      pi: this.calculatePrincipalAndInterest(params),
      pmi: this.calculatePMI(params),
      ti: this.calculateTaxesAndInsurance(params)
    };

    return new PaymentBreakdown(components);
  }

  private calculatePrincipalAndInterest(params: LoanParams): number {
    // Extracted for clarity
  }

  private calculatePMI(params: LoanParams): number {
    // Extracted for clarity
  }

  private calculateTaxesAndInsurance(params: LoanParams): number {
    // Extracted for clarity
  }
}
```

**Implementation Location:** `services/mortgage-assistant-api/src/domain/__tests__/mortgage-calculator.test.ts`

### 🟡 Priority: MEDIUM - Development Best Practices

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/Development-Patterns.md`

#### Patterns to Adopt

1. **Concurrent Agent Deployment**
```bash
# Deploy full lead processing pipeline concurrently
Task("Validate lead", "...", "lead-validator")
Task("Qualify mortgage", "...", "mortgage-qualifier")
Task("Check credit", "...", "credit-checker")
Task("Generate report", "...", "report-generator")
Task("Sync CRM", "...", "crm-syncer")
```

2. **Memory-First Development**
```typescript
// Store architectural decisions
await memory.store('architecture/rate-engine', {
  decision: 'Real-time scraping with 15-min cache',
  rationale: 'Balance freshness with API rate limits',
  alternatives: ['Daily batch', 'Webhook-based'],
  date: new Date()
});
```

3. **Repository Pattern**
```typescript
// Clean architecture for lead management
interface ILeadRepository {
  save(lead: Lead): Promise<void>;
  findById(id: string): Promise<Lead | null>;
  findByEmail(email: string): Promise<Lead[]>;
}

class LeadRepository implements ILeadRepository {
  constructor(private db: Database) {}

  async save(lead: Lead): Promise<void> {
    await this.db.leads.upsert({
      where: { id: lead.id },
      create: lead.toJSON(),
      update: lead.toJSON()
    });
  }
}
```

**Implementation Location:** `services/lead-capture-api/src/repositories/`

---

## Testing & Validation

### 🔴 Priority: HIGH - TDD for Critical Components

**Source:** `C:/Dev/Projects/Repos/claude-flow.wiki/SPARC-Methodology.md`

#### London School TDD for Mortgage Calculations

```typescript
// Mock-driven testing for loan qualification
describe('LoanQualificationService', () => {
  let service: LoanQualificationService;
  let mockCalculator: jest.Mocked<MortgageCalculator>;
  let mockCreditService: jest.Mocked<CreditService>;
  let mockIncomeVerifier: jest.Mocked<IncomeVerifier>;

  beforeEach(() => {
    mockCalculator = createMock<MortgageCalculator>();
    mockCreditService = createMock<CreditService>();
    mockIncomeVerifier = createMock<IncomeVerifier>();

    service = new LoanQualificationService(
      mockCalculator,
      mockCreditService,
      mockIncomeVerifier
    );
  });

  it('should qualify borrower with good credit and income', async () => {
    // Given
    mockCreditService.getScore.mockResolvedValue(750);
    mockIncomeVerifier.verify.mockResolvedValue({
      verified: true,
      monthlyIncome: 8000
    });
    mockCalculator.calculatePayment.mockReturnValue({
      totalMonthly: 2000
    });

    // When
    const result = await service.qualify({
      loanAmount: 300000,
      downPayment: 60000,
      income: 8000
    });

    // Then
    expect(result.qualified).toBe(true);
    expect(result.dtiRatio).toBe(0.25); // 2000 / 8000
    expect(mockCreditService.getScore).toHaveBeenCalled();
    expect(mockIncomeVerifier.verify).toHaveBeenCalled();
  });

  it('should reject borrower with high DTI ratio', async () => {
    // Given
    mockCreditService.getScore.mockResolvedValue(720);
    mockIncomeVerifier.verify.mockResolvedValue({
      verified: true,
      monthlyIncome: 4000
    });
    mockCalculator.calculatePayment.mockReturnValue({
      totalMonthly: 2500
    });

    // When
    const result = await service.qualify({
      loanAmount: 400000,
      downPayment: 40000,
      income: 4000
    });

    // Then
    expect(result.qualified).toBe(false);
    expect(result.dtiRatio).toBe(0.625); // 2500 / 4000 (> 43% limit)
    expect(result.rejectionReason).toBe('DTI ratio too high');
  });
});
```

**Implementation Location:** `services/mortgage-assistant-api/src/__tests__/loan-qualification.test.ts`

#### Chicago School TDD for Lead Processing

```typescript
// State-based testing with real implementations
describe('LeadProcessingPipeline (Integration)', () => {
  let database: TestDatabase;
  let pipeline: LeadProcessingPipeline;

  beforeEach(async () => {
    database = await createTestDatabase();
    const validator = new LeadValidator();
    const enricher = new DataEnricher(externalApiClient);
    const crmClient = new TwentyCRMClient(testConfig);

    pipeline = new LeadProcessingPipeline(
      validator,
      enricher,
      crmClient,
      database
    );
  });

  it('should process valid lead through full pipeline', async () => {
    // Given
    const rawLead = {
      email: 'john@example.com',
      phone: '+1234567890',
      name: 'John Doe',
      loanAmount: 300000
    };

    // When
    const result = await pipeline.process(rawLead);

    // Then - Verify end state
    expect(result.status).toBe('completed');
    expect(result.leadId).toBeDefined();

    // Verify in database
    const savedLead = await database.leads.findById(result.leadId);
    expect(savedLead).toBeDefined();
    expect(savedLead.email).toBe('john@example.com');
    expect(savedLead.status).toBe('qualified');

    // Verify enrichment occurred
    expect(savedLead.enrichedData).toBeDefined();
    expect(savedLead.enrichedData.location).toBeDefined();

    // Verify CRM sync
    const crmRecord = await testCRMClient.getContact(savedLead.email);
    expect(crmRecord).toBeDefined();
    expect(crmRecord.leadSource).toBe('website');
  });
});
```

**Implementation Location:** `services/lead-capture-api/src/__tests__/integration/pipeline.test.ts`

### 🟡 Priority: MEDIUM - E2E Testing Strategy

```typescript
// Playwright tests for admin dashboard
import { test, expect } from '@playwright/test';

test.describe('Nyra Admin Dashboard', () => {
  test('should display real-time lead metrics', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/dashboard');

    // Wait for WebSocket connection
    await page.waitForSelector('[data-testid="monitoring-panel"]');

    // Verify agent status panel
    const agentsPanel = page.locator('[data-testid="agents-panel"]');
    await expect(agentsPanel).toBeVisible();

    // Check for active agents
    const activeAgents = page.locator('[data-status="busy"]');
    await expect(activeAgents).toHaveCount(3); // lead-validator, qualifier, crm-syncer

    // Verify memory panel shows coordination
    const memoryPanel = page.locator('[data-testid="memory-panel"]');
    await expect(memoryPanel).toContainText('coordination');
  });

  test('should update when new lead is processed', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/dashboard');

    // Submit test lead via API
    await fetch('http://localhost:3001/api/leads', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        phone: '+1234567890'
      })
    });

    // Verify command appears in commands panel
    await page.waitForSelector('[data-testid="command-lead-validate"]');

    // Verify lead appears in leads table
    const leadsTable = page.locator('[data-testid="leads-table"]');
    await expect(leadsTable).toContainText('test@example.com');
  });
});
```

**Implementation Location:** `apps/nyra-admin/tests/e2e/dashboard.spec.ts`

---

## Integration Opportunities

### 🔴 Priority: HIGH - Immediate Integrations

#### 1. Lead Capture API + Memory Coordination

```typescript
// Enhance lead-capture-api with memory coordination
import { NyraMemoryService } from '@nyra/memory-service';

class LeadCaptureController {
  constructor(
    private memory: NyraMemoryService,
    private validator: LeadValidator
  ) {}

  async captureLead(req: Request, res: Response) {
    const lead = req.body;

    // Store in pipeline memory
    await this.memory.storeLeadState(lead.id, {
      stage: 'validation',
      status: 'processing',
      data: lead
    });

    // Validate
    const validated = await this.validator.validate(lead);

    // Share with other agents
    await this.memory.store(`swarm/shared/validated-lead-${lead.id}`, validated, {
      namespace: 'coordination'
    });

    // Emit event for real-time dashboard
    websocket.emit('lead:validated', { leadId: lead.id, validated });

    res.json({ success: true, leadId: lead.id });
  }
}
```

**Implementation Location:** `services/lead-capture-api/src/controllers/lead.controller.ts`

#### 2. Rate Comparison Engine + Stream Chaining

```typescript
// Use stream-chaining for rate updates
// Rate Scraper → Analyzer → Alert Generator

// 1. Scraper outputs stream-json
class RateScraper {
  async scrape(): Promise<void> {
    for await (const rate of this.scrapeRates()) {
      // Output as stream-json for next agent
      console.log(JSON.stringify({
        type: 'rate_update',
        lender: rate.lender,
        rate: rate.value,
        timestamp: new Date().toISOString()
      }));
    }
  }
}

// 2. Analyzer receives stream-json input
class RateAnalyzer {
  async analyze(input: NodeJS.ReadableStream): Promise<void> {
    for await (const line of input) {
      const rate = JSON.parse(line);
      const trend = this.analyzeTrend(rate);

      // Output analyzed data as stream-json
      console.log(JSON.stringify({
        type: 'rate_analysis',
        ...rate,
        trend,
        significantChange: trend.change > 0.25
      }));
    }
  }
}

// 3. Alert Generator receives analyzed stream
class AlertGenerator {
  async generateAlerts(input: NodeJS.ReadableStream): Promise<void> {
    for await (const line of input) {
      const analysis = JSON.parse(line);

      if (analysis.significantChange) {
        await this.sendAlert({
          type: 'rate_drop',
          lender: analysis.lender,
          newRate: analysis.rate,
          change: analysis.trend.change
        });
      }
    }
  }
}
```

**Implementation Location:** `services/rate-comparison-engine/src/stream-pipeline.ts`

#### 3. Mortgage Assistant + SPARC Workflow

```typescript
// Apply SPARC methodology to mortgage calculations
class MortgageAssistantSPARC {
  async executeWorkflow(lead: Lead): Promise<MortgageReport> {
    // 1. Specification
    const requirements = await this.specifyRequirements(lead);

    // 2. Pseudocode (algorithm selection)
    const algorithm = this.selectCalculationAlgorithm(requirements);

    // 3. Architecture (data flow design)
    const dataFlow = this.designDataFlow(requirements);

    // 4. Refinement (TDD calculation)
    const calculation = await this.calculateWithTDD(
      lead,
      algorithm,
      dataFlow
    );

    // 5. Completion (report generation)
    return await this.generateReport(calculation);
  }

  private async calculateWithTDD(
    lead: Lead,
    algorithm: Algorithm,
    dataFlow: DataFlow
  ): Promise<Calculation> {
    // Run tests first
    const tests = this.generateTests(lead, algorithm);
    await this.runTests(tests);

    // Implement
    const result = algorithm.calculate(lead);

    // Verify
    await this.verifyResults(result, tests);

    return result;
  }
}
```

**Implementation Location:** `services/mortgage-assistant-api/src/workflows/sparc-workflow.ts`

### 🟡 Priority: MEDIUM - Enhanced Integrations

#### 1. n8n Workflows + Claude Flow Orchestration

```typescript
// Replace n8n workflows with Claude Flow orchestration
// Better type safety, easier debugging, agent coordination

// Current n8n workflow
// n8n workflow: Lead Capture → Validation → CRM Sync

// Proposed Claude Flow workflow
const leadProcessingWorkflow = {
  name: "Lead Processing",
  agents: [
    { id: "validator", type: "validator" },
    { id: "enricher", type: "enricher" },
    { id: "qualifier", type: "analyzer" },
    { id: "crm", type: "integrator" }
  ],
  tasks: [
    {
      id: "validate",
      assignTo: "validator",
      description: "Validate lead data"
    },
    {
      id: "enrich",
      assignTo: "enricher",
      depends: ["validate"],
      description: "Enrich with external data"
    },
    {
      id: "qualify",
      assignTo: "qualifier",
      depends: ["enrich"],
      description: "Pre-qualify for mortgage"
    },
    {
      id: "sync",
      assignTo: "crm",
      depends: ["qualify"],
      description: "Sync to Twenty CRM"
    }
  ]
};
```

**Implementation Location:** `config/workflows/replace-n8n-lead-processing.json`

#### 2. Letta Integration + Memory System

```typescript
// Integrate Letta with shared memory
class LettaIntegrationService {
  constructor(
    private memory: NyraMemoryService,
    private lettaClient: LettaClient
  ) {}

  async createConversationContext(leadId: string): Promise<void> {
    // Get lead data from memory
    const leadState = await this.memory.getLeadState(leadId);
    const mortgageCalc = await this.memory.getMortgageCalculation(leadId);

    // Create Letta context
    await this.lettaClient.createContext({
      userId: leadId,
      context: {
        leadData: leadState.data,
        mortgageCalculation: mortgageCalc,
        conversationHistory: [],
        preferences: {}
      }
    });

    // Store Letta context reference in memory
    await this.memory.store(`letta/context/${leadId}`, {
      contextId: lettaClient.contextId,
      createdAt: new Date()
    });
  }

  async syncConversation(leadId: string, message: Message): Promise<void> {
    // Store in memory for other agents
    await this.memory.store(`conversation/${leadId}/${message.id}`, message, {
      namespace: 'letta'
    });

    // Send to Letta
    await this.lettaClient.addMessage(leadId, message);
  }
}
```

**Implementation Location:** `services/letta-integration/src/memory-integration.ts`

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2) 🔴

**Goal:** Set up monitoring and memory infrastructure

1. **Week 1: Monitoring Dashboard**
   - [ ] Extract AgentsPanel component
   - [ ] Extract MemoryPanel component
   - [ ] Extract CommandsPanel component
   - [ ] Set up WebSocket server
   - [ ] Integrate with nyra-admin app

2. **Week 2: Memory System**
   - [ ] Set up SQLite database
   - [ ] Implement NyraMemoryService
   - [ ] Create Nyra-specific schemas
   - [ ] Add memory coordination protocol
   - [ ] Test cross-service memory sharing

**Deliverables:**
- ✅ Real-time monitoring dashboard
- ✅ Persistent memory system
- ✅ Agent coordination infrastructure

### Phase 2: Workflows & Agents (Weeks 3-4) 🔴

**Goal:** Implement core workflows and agent profiles

1. **Week 3: Workflow Orchestration**
   - [ ] Create lead capture workflow
   - [ ] Create rate update workflow
   - [ ] Implement stream-JSON chaining
   - [ ] Add workflow engine
   - [ ] Test parallel execution

2. **Week 4: Agent Profiles**
   - [ ] Create lead-capture-agent profile
   - [ ] Create mortgage-calculator-agent profile
   - [ ] Create rate-comparison-agent profile
   - [ ] Create crm-sync-agent profile
   - [ ] Test agent coordination

**Deliverables:**
- ✅ Automated lead processing pipeline
- ✅ Rate update automation
- ✅ Specialized agent profiles

### Phase 3: SPARC & Testing (Weeks 5-6) 🟡

**Goal:** Apply SPARC methodology to critical features

1. **Week 5: Mortgage Calculator SPARC**
   - [ ] Write specifications
   - [ ] Design pseudocode
   - [ ] Define architecture
   - [ ] Implement with TDD
   - [ ] Complete integration

2. **Week 6: Testing Infrastructure**
   - [ ] Set up London School TDD
   - [ ] Create Chicago School integration tests
   - [ ] Add E2E tests for dashboard
   - [ ] Implement test automation
   - [ ] Achieve 80%+ coverage

**Deliverables:**
- ✅ Production-ready mortgage calculator
- ✅ Comprehensive test suite
- ✅ TDD workflow established

### Phase 4: Advanced Features (Weeks 7-8) 🟢

**Goal:** Enhance with advanced patterns

1. **Week 7: Advanced Integrations**
   - [ ] Replace n8n with Claude Flow workflows
   - [ ] Integrate Letta with memory system
   - [ ] Add Graphiti knowledge coordination
   - [ ] Implement vector search integration
   - [ ] Test full system integration

2. **Week 8: Performance & Optimization**
   - [ ] Implement caching strategies
   - [ ] Add performance monitoring
   - [ ] Optimize database queries
   - [ ] Add load balancing
   - [ ] Performance testing

**Deliverables:**
- ✅ Fully integrated system
- ✅ Optimized performance
- ✅ Production-ready platform

---

## Quick Reference

### File Locations Summary

| Component | Source Repository | Destination in Nyra |
|-----------|------------------|---------------------|
| AgentsPanel | `claude-flow-ui-main/src/components/monitoring/AgentsPanel.tsx` | `apps/nyra-admin/src/components/monitoring/AgentsPanel.tsx` |
| MemoryPanel | `claude-flow-ui-main/src/components/monitoring/MemoryPanel.tsx` | `apps/nyra-admin/src/components/monitoring/MemoryPanel.tsx` |
| useWebSocket | `claude-flow-ui-main/src/hooks/useWebSocket.ts` | `packages/shared-hooks/src/useWebSocket.ts` |
| Memory System | `claude-flow.wiki/Memory-System.md` | `services/memory-service/` |
| SPARC Workflow | `claude-flow.wiki/SPARC-Methodology.md` | `docs/development/sparc-methodology.md` |
| Agent Profiles | `claude-flow.wiki/Agent-System-Overview.md` | `config/agents/` |
| Workflow Templates | `claude-flow-clone/examples/automation-examples.md` | `config/workflows/` |

### Priority Legend

- 🔴 **HIGH**: Critical for core functionality, implement first
- 🟡 **MEDIUM**: Important enhancements, implement after HIGH
- 🟢 **LOW**: Nice-to-have features, implement if time permits

### Code Snippet Reference

All code examples in this document are extracted from:
1. `C:/Dev/Projects/Repos/claude-flow-ui-main` - UI components and hooks
2. `C:/Dev/Projects/Repos/claude-flow-clone/examples` - Workflow templates and patterns
3. `C:/Dev/Projects/Repos/claude-flow.wiki` - Documentation and best practices

### Next Steps

1. **Review** this implementation plan with the team
2. **Prioritize** features based on business needs
3. **Prototype** monitoring dashboard (Phase 1, Week 1)
4. **Iterate** based on feedback and learnings

---

**Document Version:** 1.0
**Last Updated:** 2026-01-10
**Maintainer:** Research Agent
**Status:** ✅ Ready for Review
