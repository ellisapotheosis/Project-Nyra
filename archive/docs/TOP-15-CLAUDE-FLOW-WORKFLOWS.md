# Top 15 Claude Flow Workflows for Project Nyra

This document catalogs the most essential claude-flow workflows for the Project Nyra mortgage automation pipeline. These workflows leverage SPARC methodology, hive-mind coordination, and parallel execution patterns.

## 🎯 Workflow Categories

1. **SPARC Workflows** - Structured development methodology
2. **Hive-Mind Operations** - Multi-agent coordination
3. **Batch Operations** - Parallel task execution
4. **MLE-STAR** - Machine learning engineering workflow
5. **Automation** - Self-healing and smart agent spawning

---

## 1. SPARC Complete Development Cycle

**Purpose**: Full-stack feature development using SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion)

**Command**:
```bash
npx claude-flow sparc run all "Build mortgage rate calculator API"
```

**What It Does**:
- **Specification**: Analyzes requirements and creates detailed spec
- **Pseudocode**: Designs algorithm logic without implementation details
- **Architecture**: Plans system architecture, patterns, and tech stack
- **Refinement**: Iteratively improves design based on constraints
- **Completion**: Implements working code with tests

**Use Cases**:
- New microservices (Quote Engine, Campaign Engine)
- Complex features (compliance validation, rate calculation)
- Full-stack implementations (RateHunter frontend + backend)

**Example Output**:
```
✓ Specification completed: mortgage_rate_calculator_spec.md
✓ Pseudocode generated: rate_calculation_algorithm.pseudo
✓ Architecture designed: api_architecture.md
✓ Refinement applied: optimization_plan.md
✓ Implementation complete: src/quote-engine/rate_calculator.py
```

---

## 2. SPARC TDD Workflow

**Purpose**: Test-Driven Development with automatic test generation before implementation

**Command**:
```bash
npx claude-flow sparc tdd "Implement APR calculation for mortgage quotes"
```

**What It Does**:
- Generates comprehensive test suite FIRST
- Defines expected behavior and edge cases
- Implements code to pass tests
- Validates test coverage (target: 90%+)

**Use Cases**:
- Critical calculation logic (APR, LTV, debt-to-income ratios)
- Compliance validation functions
- Financial calculations requiring precision

**Example**:
```python
# Generated tests BEFORE implementation
def test_apr_calculation_conventional_loan():
    assert calculate_apr(loan_amount=300000, rate=6.5, term=360) == 6.72

def test_apr_with_points():
    assert calculate_apr(loan_amount=300000, rate=6.5, term=360, points=1) == 6.85

# Implementation follows tests
def calculate_apr(loan_amount, rate, term, points=0):
    # Implementation to pass tests
    pass
```

---

## 3. Hive-Mind Swarm Initialization

**Purpose**: Create multi-agent swarm for distributed task execution

**Command**:
```bash
npx @claude-flow/cli@latest hive-mind init --topology hierarchical --max-agents 31
```

**What It Does**:
- Initializes hierarchical swarm with Queen coordinator
- Spawns worker agents based on task requirements
- Establishes communication channels between agents
- Implements consensus mechanisms for decisions

**Use Cases**:
- Large-scale consolidation projects (NyraDocs cleanup)
- Multi-repository operations
- Parallel document generation
- Distributed testing across services

**Configuration**:
```json
{
  "topology": "hierarchical",
  "maxAgents": 31,
  "consensusMechanism": "majority",
  "communicationProtocol": "message-bus",
  "autoScaling": true
}
```

---

## 4. Parallel Document Analysis

**Purpose**: Analyze multiple documents simultaneously with specialized agents

**Command**:
```bash
npx @claude-flow/cli@latest swarm "Analyze all mortgage compliance documents" \
  --agents researcher,compliance-sentinel,coder --parallel
```

**What It Does**:
- Spawns 3 specialized agents in parallel
- Researcher: Gathers document metadata
- Compliance sentinel: Validates regulatory adherence
- Coder: Extracts code examples and patterns

**Use Cases**:
- Compliance document review
- Multi-file codebase analysis
- Research paper processing
- API documentation generation

**Output Structure**:
```
Analysis Results:
├── researcher_findings.md (document structure, key concepts)
├── compliance_report.md (TILA/RESPA violations, risk assessment)
└── code_examples/ (extracted patterns, reusable snippets)
```

---

## 5. SPARC Batch Processing

**Purpose**: Execute SPARC phases on multiple tasks in parallel

**Command**:
```bash
npx claude-flow sparc batch specification,architecture,completion \
  "Create Quote Engine, Campaign Engine, Nyra Orchestrator" --parallel
```

**What It Does**:
- Processes 3 microservices simultaneously
- Runs specified SPARC phases for each
- Aggregates results into consolidated report
- Identifies cross-service dependencies

**Modes Available**:
- `specification` - Requirements analysis
- `pseudocode` - Algorithm design
- `architecture` - System design
- `refinement` - Iterative improvement
- `completion` - Implementation
- `all` - Complete SPARC cycle

**Performance**:
- Sequential: ~45 minutes for 3 services
- Parallel: ~15 minutes with 3 agents

---

## 6. Smart Agent Auto-Spawning

**Purpose**: Automatically detect task type and spawn optimal agent

**Command**:
```bash
npx claude-flow automation auto-agent --task "Optimize database queries in Quote Engine"
```

**What It Does**:
- Analyzes task description using NLP
- Determines optimal agent type (researcher/coder/tester/reviewer)
- Spawns agent with appropriate capabilities
- Routes task to agent automatically

**Agent Selection Logic**:
```
"Optimize database" → coder (backend specialist)
"Research mortgage regulations" → researcher (domain expert)
"Test API endpoints" → tester (QA specialist)
"Review code quality" → reviewer (code quality expert)
```

**Use Cases**:
- Dynamic workflow adaptation
- User-initiated tasks without manual routing
- Experimentation and prototyping

---

## 7. Memory Batch Storage

**Purpose**: Store multiple items in persistent memory simultaneously

**Command**:
```bash
npx claude-flow memory batch-store --data mortgage_concepts.json --parallel
```

**What It Does**:
- Loads JSON file with key-value pairs
- Stores items in parallel (10x faster than sequential)
- Uses AgentDB for HNSW-indexed vector search
- Enables semantic memory retrieval

**Example Data**:
```json
{
  "mortgage/loan-types": ["conventional", "FHA", "VA", "USDA", "jumbo", "non-QM"],
  "mortgage/closing-costs": "2-5% of loan amount",
  "compliance/tila-requirements": "APR disclosure within 3 days",
  "business/lead-sources": ["freerateupdate.com", "lendingtree.com", "direct web"]
}
```

**Performance**: 150x faster search with HNSW indexing

---

## 8. MLE-STAR Workflow (Machine Learning Engineering)

**Purpose**: Complete ML engineering workflow from research to deployment

**Command**:
```bash
npx claude-flow mle-star "Build lead scoring model for mortgage qualification"
```

**What It Does**:
1. **Web Search Phase**: Research ML approaches for lead scoring
2. **Foundation Model**: Create baseline model (logistic regression)
3. **Ablation Analysis**: Test feature importance and model variants
4. **Targeted Refinement**: Optimize hyperparameters and features
5. **Ensemble Creation**: Combine multiple models for better performance
6. **Comprehensive Validation**: Cross-validation, holdout testing, performance metrics

**Use Cases**:
- Lead qualification prediction
- Loan approval probability estimation
- Churn prediction for mortgage renewals
- Fraud detection in applications

**Output**:
```
Models Generated:
├── baseline_model.pkl (accuracy: 72%)
├── random_forest_model.pkl (accuracy: 81%)
├── gradient_boost_model.pkl (accuracy: 84%)
└── ensemble_model.pkl (accuracy: 87%) ← BEST
```

---

## 9. Hive-Mind Task Coordination

**Purpose**: Coordinate complex tasks across multiple worker agents

**Command**:
```bash
npx @claude-flow/cli@latest hive-mind spawn \
  "Generate API documentation for all 6 microservices" \
  --workers 6 --claude
```

**What It Does**:
- Queen agent decomposes task into 6 subtasks
- Spawns 6 worker agents (one per microservice)
- Each worker generates OpenAPI documentation
- Queen aggregates results and ensures consistency

**Coordination Features**:
- Consensus voting on design decisions
- Shared memory for cross-service patterns
- Automatic conflict resolution
- Progress tracking and status updates

**Microservices**:
1. Quote Engine (port 8001)
2. Campaign Engine (port 8002)
3. Nyra Orchestrator (port 8010)
4. Mem0 REST API (port 4321)
5. RateHunter Backend (port 3100)
6. Nyra Admin Backend (port 3101)

---

## 10. SPARC Pipeline with Concurrency

**Purpose**: Execute SPARC workflow with concurrent phase execution

**Command**:
```bash
npx claude-flow sparc pipeline "Build TwentyCRM integration" --concurrent
```

**What It Does**:
- Runs independent SPARC phases simultaneously
- Specification + Research in parallel
- Architecture + Pseudocode when specs ready
- Completion + Testing concurrently
- Refinement based on test results

**Timeline Comparison**:
```
Sequential Pipeline: 60 minutes
├── Specification: 15 min
├── Pseudocode: 10 min
├── Architecture: 15 min
├── Completion: 15 min
└── Refinement: 5 min

Concurrent Pipeline: 25 minutes (2.4x faster)
├── [Spec + Research]: 15 min (parallel)
├── [Arch + Pseudo]: 10 min (parallel)
└── [Complete + Test + Refine]: 10 min (parallel)
```

---

## 11. Self-Healing Workflow Automation

**Purpose**: Automatically detect and fix workflow failures

**Command**:
```bash
npx claude-flow automation self-healing --monitor all-workflows
```

**What It Does**:
- Monitors all active claude-flow workflows
- Detects failures (timeouts, errors, crashes)
- Analyzes root cause using logs and traces
- Attempts automatic remediation:
  - Retry with exponential backoff
  - Spawn replacement agent
  - Adjust resource allocation
  - Escalate to human if unrecoverable

**Healing Strategies**:
```
API Timeout → Increase timeout, retry with backoff
Out of Memory → Spawn agent with more memory
Agent Crash → Spawn replacement, restore state from checkpoint
Network Error → Switch to backup network route
```

**Use Cases**:
- Production workflow reliability
- Long-running batch jobs
- Critical business processes (mortgage approvals)

---

## 12. Comprehensive Code Review Swarm

**Purpose**: Multi-agent code review with specialized reviewers

**Command**:
```bash
npx @claude-flow/cli@latest swarm code-review --target services/quote-engine \
  --reviewers security,performance,style,tests
```

**What It Does**:
- Spawns 4 specialized reviewer agents
- **Security Reviewer**: Scans for vulnerabilities (SQL injection, XSS, secrets)
- **Performance Reviewer**: Identifies bottlenecks, inefficient algorithms
- **Style Reviewer**: Enforces coding standards, consistency
- **Test Reviewer**: Validates test coverage, edge cases

**Review Report**:
```
Security: ✓ PASS (no critical issues)
Performance: ⚠ WARNING (3 slow queries identified)
Style: ✓ PASS (follows PEP 8)
Tests: ✗ FAIL (coverage: 67%, target: 90%)

Action Items:
1. Add indexes to Quote.created_at and Quote.borrower_id
2. Implement connection pooling for database
3. Increase test coverage to 90%+
```

---

## 13. Multi-Repository Synchronization

**Purpose**: Synchronize changes across multiple repositories

**Command**:
```bash
npx @claude-flow/cli@latest swarm multi-repo-sync \
  --repos Project-Nyra,NyraDocs,NYRA-AIO-Bootstrap \
  --sync-targets configs,docs,workflows
```

**What It Does**:
- Scans all 3 repositories for specified sync targets
- Identifies conflicts and version differences
- Proposes merge strategy (theirs/ours/manual)
- Applies changes with git commits
- Creates sync report with change summary

**Sync Targets**:
- `configs`: .env templates, Docker Compose, MCP configs
- `docs`: CLAUDE.md, README.md, architecture docs
- `workflows`: GitHub Actions, n8n workflows, SPARC templates

**Output**:
```
Sync Report:
├── Configs: 15 files updated, 3 conflicts resolved
├── Docs: 8 files merged, 2 duplicates removed
└── Workflows: 5 workflows synchronized

Conflicts Resolved:
1. CLAUDE.md: merged user-facing + technical sections
2. docker-compose.yml: combined service definitions
3. .env.example: unified variable list
```

---

## 14. Distributed Testing Across Services

**Purpose**: Run comprehensive tests across all microservices in parallel

**Command**:
```bash
npx @claude-flow/cli@latest swarm test-all-services \
  --services quote,campaign,orchestrator,mem0,ratehunter,admin \
  --test-types unit,integration,e2e
```

**What It Does**:
- Spawns 6 tester agents (one per service)
- Each agent runs unit, integration, and E2E tests
- Aggregates test results and coverage metrics
- Generates unified test report
- Identifies cross-service integration issues

**Test Execution**:
```
Quote Engine: 156 tests (✓ 154, ✗ 2) - 89% coverage
Campaign Engine: 203 tests (✓ 203) - 94% coverage
Nyra Orchestrator: 98 tests (✓ 95, ✗ 3) - 82% coverage
Mem0 API: 67 tests (✓ 67) - 91% coverage
RateHunter: 189 tests (✓ 187, ✗ 2) - 86% coverage
Nyra Admin: 145 tests (✓ 143, ✗ 2) - 88% coverage

Total: 858 tests (✓ 849, ✗ 9) - 88% average coverage
```

**Performance**: 6x faster than sequential testing

---

## 15. Workflow Template Generation

**Purpose**: Generate reusable workflow templates from completed workflows

**Command**:
```bash
npx claude-flow automation generate-template \
  --from-workflow "Build Quote Engine" \
  --template-name "FastAPI Microservice Template"
```

**What It Does**:
- Analyzes completed workflow execution
- Extracts reusable patterns and structure
- Generates parameterized template
- Includes placeholders for customization
- Stores in workflow template library

**Generated Template**:
```yaml
name: FastAPI Microservice Template
description: Complete FastAPI service with Docker, tests, and CI/CD
parameters:
  - name: service_name
    description: Name of the microservice
    type: string
  - name: port
    description: Service port
    type: integer
    default: 8000
  - name: database
    description: Database type
    type: enum
    values: [postgresql, mysql, mongodb]

steps:
  - sparc_specification:
      input: "Build ${service_name} microservice"
  - sparc_architecture:
      patterns: [clean_architecture, dependency_injection]
  - sparc_completion:
      framework: fastapi
      database: ${database}
  - docker_containerization:
      port: ${port}
  - test_generation:
      coverage_target: 90
  - ci_cd_setup:
      platform: github_actions
```

**Use Cases**:
- Standardize microservice creation
- Onboard new developers faster
- Ensure consistent patterns across team
- Reduce time to deploy new services

---

## 🎯 Workflow Selection Guide

### For New Features:
1. Start with **SPARC Complete Development Cycle** (#1)
2. Use **SPARC TDD Workflow** (#2) for critical logic
3. Apply **Code Review Swarm** (#12) before merging

### For Large-Scale Operations:
1. Initialize **Hive-Mind Swarm** (#3)
2. Use **SPARC Batch Processing** (#5) for parallel tasks
3. Enable **Self-Healing Automation** (#11) for reliability

### For Machine Learning:
1. Execute **MLE-STAR Workflow** (#8)
2. Store model metadata with **Memory Batch Storage** (#7)

### For Quality Assurance:
1. Run **Distributed Testing** (#14) across all services
2. Use **Code Review Swarm** (#12) for comprehensive review
3. Monitor with **Self-Healing Automation** (#11)

### For Multi-Repository Work:
1. Use **Multi-Repo Synchronization** (#13)
2. Coordinate with **Hive-Mind Task Coordination** (#9)

---

## 💡 Best Practices

### 1. **Always Use SPARC for Complex Features**
Don't jump straight to code. The Specification → Architecture → Completion flow prevents technical debt.

### 2. **Leverage Parallel Execution**
Use `--parallel` flag whenever tasks are independent. Can achieve 2-6x speedup.

### 3. **Store Domain Knowledge in Memory**
Use **Memory Batch Storage** (#7) to store mortgage concepts, compliance rules, and business logic for faster agent reasoning.

### 4. **Enable Self-Healing in Production**
Always run **Self-Healing Automation** (#11) for critical workflows.

### 5. **Generate Templates for Repeated Patterns**
Use **Workflow Template Generation** (#15) to standardize common tasks.

---

## 📊 Performance Metrics

| Workflow | Sequential Time | Parallel Time | Speedup |
|----------|----------------|---------------|---------|
| SPARC Batch (3 services) | 45 min | 15 min | 3x |
| Distributed Testing | 18 min | 3 min | 6x |
| Document Analysis | 12 min | 4 min | 3x |
| Multi-Repo Sync | 8 min | 3 min | 2.7x |
| Code Review Swarm | 10 min | 3 min | 3.3x |

**Average Speedup: 3.6x with parallel execution**

---

## 🔗 Related Documentation

- **SPARC Methodology Guide**: `docs/sparc/METHODOLOGY.md`
- **Hive-Mind Architecture**: `docs/architecture/HIVE-MIND.md`
- **Memory System**: `docs/memory/AGENTDB-INTEGRATION.md`
- **Workflow Templates**: `.claude/workflows/templates/`
- **Agent Configurations**: `.claude/agents/`

---

*Last Updated: 2026-01-13*
*Version: 1.0*
*Maintainer: Project Nyra Team*
