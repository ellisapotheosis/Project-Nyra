# Project Nyra - Claude Code Configuration (Archon OS)

> **AI-Powered Mortgage Automation Platform**
> Multi-agent orchestration for mortgage operations with strict compliance requirements

## 🏠 PROJECT CONTEXT

**Mission**: AI-powered mortgage brokerage automation handling lead-to-close workflows with 80% reduction in manual work.

**Architecture**: Orchestration system powered by Archon OS (planning/SPARC/task execution) serving ~100-500 monthly leads.

**Stack**: React + TypeScript + Node.js + PostgreSQL | TDD + Microservices | Containerized (Docker/K8s)

## 🎯 CORE CONFIGURATION

**Orchestration**: Archon OS workflows and task management
**Testing**: TDD (Red-Green-Refactor) | 90%+ test coverage mandatory
**Architecture**: Microservices with clear service boundaries
**Memory**: Hybrid (RuVector primary, Letta)

## 🔒 Locked Architecture Components

DO NOT MODIFY without explicit approval:

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **LLM Gateway** | Nexus Router + LiteLLM | 7000 | Model routing, OpenRouter integration |
| **CRM** | TwentyCRM | 3000 | System of record for leads/pipeline |
| **Memory** | Letta + RuVector | Multiple | Multi-system memory architecture |
| **Workflows** | n8n + Activepieces | 5678 | Campaign automation, integrations |
| **Observability** | Prometheus + Grafana + Loki | 9090/3003/3100 | Monitoring stack |

---

## 🚨 CRITICAL: SWARM EXECUTION RULES

**MANDATORY when spawning agents:**

1. **SPAWN IN BACKGROUND**: Use `run_in_background: true` for all Task calls
2. **SPAWN ALL AT ONCE**: Put ALL agent Task calls in ONE message
3. **TELL USER**: List what each agent is doing
4. **STOP AND WAIT**: Do NOT add more tool calls or check status afterward
5. **NO POLLING**: Never poll TaskOutput or check swarm status
6. **SYNTHESIZE**: Review ALL results when agents return
7. **NO CONFIRMATION**: Don't ask "should I check?" - just wait

**Example spawn message:**
```
I've launched 5 agents in mesh topology:
- 🧪 Tester: Writing failing tests (Red phase)
- 🔍 Researcher: Analyzing requirements
- 🏗️ Architect: Designing microservices API
- 💻 Coder: Minimal implementation (Green phase)
- 👀 Reviewer: Refactoring and optimization
Working with peer-to-peer coordination - I'll synthesize when they complete.
```

## 🚨 AUTOMATIC ORCHESTRATION

**When user requests complex work:**

1. Use Archon workflows: `archon workflow list` to see available patterns.
2. Run relevant workflow: `archon workflow run [name] "[task]"`
3. Monitor progress via CLI or UI (http://localhost:3737)

### 🤖 3-Tier Model Routing (ADR-026)

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Local Small (Qwen 32B) | <1ms | $0 | Simple transforms (var→const, add-types) |
| **2** | Local Large (DeepSeek R1) | ~500ms | $0 | Simple tasks, bug fixes |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Architecture, security, complex reasoning |

**Before starting, check routing via Nexus Router.**

---

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
- Search memory for relevant patterns using Letta or RuVector.
- Check past conversations in Archon UI.

### After Completing Any Task Successfully
- Record completion metrics in Archon.
- Store successful patterns in Letta.

### Continuous Improvement Triggers

| Trigger | Worker | Purpose |
|---------|--------|---------|
| After major refactor | `optimize` | Performance optimization |
| After adding features | `testgaps` | Missing test coverage |
| After security changes | `audit` | Security analysis |
| Every 5+ file changes | `map` | Codebase mapping |
| Complex debugging | `deepdive` | Deep code analysis |

### Memory-Enhanced Development

**ALWAYS check memory before:**
- Starting a new feature (search for similar implementations)
- Debugging an issue (search for past solutions)
- Refactoring code (search for learned patterns)

**ALWAYS store in memory after:**
- Solving a tricky bug
- Completing a feature
- Finding a performance fix
- Discovering a security issue

---

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES:**
1. ALL operations MUST be concurrent/parallel in single message
2. **NEVER save working files to root folder** - use subdirectories
3. Use Task tool for spawning agents concurrently
4. **⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

### 📁 File Organization
**NEVER save to root. Use:**
- `/src` - Source code
- `/tests` - Test files (TDD: write tests first!)
- `/docs` - Documentation
- `/config` - Configuration
- `/scripts` - Utility scripts
- `/apps` - Frontend (Next.js/React)
- `/services` - Backend microservices (FastAPI/NestJS)
- `/mcp-servers` - MCP implementations
- `/infra` - Infrastructure (Docker, K8s)

### 📋 Mandatory Patterns
- **TodoWrite**: Batch ALL todos in ONE call (5-10+ minimum)
- **Task tool**: Spawn ALL agents in ONE message with full instructions
- **File operations**: Batch ALL reads/writes/edits in ONE message
- **Bash commands**: Batch ALL terminal operations in ONE message
- **Memory**: Batch ALL memory store/retrieve in ONE message

---

## 🧪 TDD PROTOCOL

**MANDATORY TDD Workflow for ALL Features:**

1. **RED**: Create failing tests using Jest/Vitest.
2. **GREEN**: Implement minimal code to pass tests.
3. **REFACTOR**: Improve code quality while keeping tests green.

**Test Coverage Requirements:**
- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: All API endpoints and service boundaries
- **E2E Tests**: Critical user workflows

### 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Multiple files (3+)
- New feature implementation (TDD)
- Refactoring across modules
- API changes with tests
- Security-related changes
- Performance optimization
- Database schema changes

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Quick questions/exploration

---

## 📋 Agent Routing (TDD + Microservices)

| Code | Task | Agents | Topology |
|------|------|--------|----------|
| 1 | Bug Fix | tester, coder, reviewer | mesh |
| 3 | Feature (TDD) | tester, researcher, architect, coder, reviewer | mesh |
| 5 | Refactor | tester, architect, coder, reviewer | mesh |
| 7 | Performance | tester, perf-engineer, coder | mesh |
| 9 | Security | security-architect, auditor, compliance-agent | hierarchical |
| 11 | Docs | researcher, api-docs | mesh |
| 13 | Microservice | architect, coder, tester, reviewer | mesh |

---

## 🏗️ Microservices Architecture

**Service Communication Patterns:**
- **API Gateway**: Nexus Router routes and load balances
- **Service Mesh**: Direct service-to-service via mesh topology
- **Event-Driven**: Message queues for async workflows (n8n, Activepieces)
- **Data Ownership**: Each service owns its data (PostgreSQL, Redis)

**TypeScript/Node.js Services (NestJS):**
- Location: `/services/nyra-orchestrator`, `/services/orchestrator`, `/services/auth-service`
- Pattern: Mesh topology for service coordination

**Python Services (FastAPI):**
- Location: `/services/quote-api`, `/services/quote-engine`, `/services/campaign-engine`
- Pattern: Mesh topology for data processing

**TypeScript Applications (Next.js/React):**
- Location: `/apps/web`, `/apps/web/crm-dashboard`, `/apps/landing`
- Pattern: Star topology for type propagation

---

## 🧠 Memory System Integration

**Priority Order:**
1. **RuVector** (Primary) - Fast vector search, code retrieval, document similarity
2. **Letta** - Conversational memory, agent state, task context

**Search (RuVector):**
Check `services/ruvector-search` for integration patterns.

---

## 🚀 Archon OS CLI Commands

**Core Commands:**
`archon workflow`, `archon agent`, `archon config`, `archon status`

**Quick Examples:**
```bash
# List workflows
archon workflow list

# Run a specific workflow
archon workflow run assist "task description"

# Check system health
make health-orchestrator
```

---

## 🧠 Intelligence System (RuVector)

V3 includes RuVector with:
- **SONA**: Self-Optimizing Neural Architecture (<0.05ms adaptation)
- **MoE**: Mixture of Experts for specialized routing
- **HNSW**: 150x-12,500x faster pattern search
- **EWC++**: Elastic Weight Consolidation (prevents forgetting)
- **Flash Attention**: 2.49x-7.47x speedup

**4-Step Intelligence Pipeline:**
1. **RETRIEVE** - Fetch relevant patterns via HNSW
2. **JUDGE** - Evaluate with verdicts (success/failure)
3. **DISTILL** - Extract key learnings via LoRA
4. **CONSOLIDATE** - Prevent catastrophic forgetting

---

## 🖥️ Local LLM Infrastructure

**GPU Worker Cluster:**

| Worker | GPU | VRAM | Models | Purpose |
|--------|-----|------|--------|---------|
| **Worker-5090** | RTX 5090 | 48GB | DeepSeek-R1 236B, Qwen 2.5 72B | Complex reasoning, compliance |
| **Worker-3090** | RTX 3090 Ti | 24GB | Llama 3.1 70B, Mistral 123B | General purpose, quotes |
| **Worker-3060** | RTX 3060 | 12GB | CodeLlama 34B, Qwen 32B | Document processing, embeddings |

**LLM Routing Strategy:**
1. Local-First: 80%+ to GPU workers via Ollama
2. Cloud Fallback: DeepSeek-R1 for overflow ($0.14/1M input, $0.55/1M output)
3. Critical Tasks: Claude Sonnet 4 for compliance/legal

**Cost Optimization:**
- Local inference: $0/request
- DeepSeek: 99% cheaper than GPT-4
- Claude Sonnet 4: High-stakes decisions only

---

## 📚 Documentation References

**Project Documentation:**
- Whitepaper: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- Architecture: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- SPARC Workflows: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`
- Compliance Guide: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/COMPLIANCE_GUARDRAILS.md`
- Stack Decisions: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/STACK_DECISIONS.md`
- Full Capabilities: `.claude-flow/CAPABILITIES.md`

**Mortgage-Specific Documentation:**
- See: `/docs/MORTGAGE_DOMAIN.md` (compliance, agents, workflows, metrics)

**MCP Integrations:**
- Nexus Router: https://nexusrouter.com/docs
- Dify: https://docs.dify.ai/en/use-dify/build/mcp
- Activepieces: https://www.activepieces.com/blog/model-context-protocol-mcp
- Graphiti: https://help.getzep.com/graphiti/getting-started/mcp-server
- Letta: https://docs.letta.com/advanced/memory-management/

---

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently
- File operations (Read, Write, Edit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- TodoWrite and task management
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: `npx @claude-flow/cli@latest swarm init --topology <type>`
- **Agent spawn**: `npx @claude-flow/cli@latest agent spawn -t <type> --name <name>`
- **Memory store/search/retrieve**: Memory operations
- **Hooks**: `npx @claude-flow/cli@latest hooks <hook-name> [options]`

**KEY**: CLI coordinates strategy via Bash, Task tool agents execute!

---

## 🔧 Environment Variables

```bash
# Configuration
CLAUDE_FLOW_CONFIG=./claude-flow.config.json
CLAUDE_FLOW_LOG_LEVEL=info

# Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# MCP Server
CLAUDE_FLOW_MCP_PORT=3000
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_TRANSPORT=stdio

# Memory
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

---

## 🚀 Quick Setup

```bash
# Add MCP servers
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest

# Start daemon
npx @claude-flow/cli@latest daemon start

# System diagnostics
npx @claude-flow/cli@latest doctor --fix
```

---

## 📋 Scope Note: TodoWrite vs Archon

**In Archon OS context (this file):**
- **TodoWrite**: In-session task tracking within Claude Code. Use for immediate work organization.
- **Archon**: Cross-session project management. Refer to `tools/archon/CLAUDE.md` for workflows.

---

## # IMPORTANT INSTRUCTION REMINDERS

### Core Principles
1. **Do what has been asked; nothing more, nothing less.**
2. **NEVER create files unless absolutely necessary.**
3. **ALWAYS prefer editing existing files.**
4. **NEVER proactively create documentation files (*.md)** - only if explicitly requested.
5. **Never save working files to root folder** - use subdirectories.

### TDD Principles
6. **ALWAYS write tests FIRST** before implementing (Red-Green-Refactor).
7. **90%+ test coverage** mandatory for all business logic.
8. **Use mesh topology** for TDD workflows.

### Mortgage Domain Rules
9. **Every mortgage feature MUST include compliance validation** (TILA, RESPA, TRID, state regulations).
10. **DO NOT MODIFY locked architecture components** without explicit approval.
11. **Use local LLMs first** (80%+ on GPU workers), fallback to cloud only when necessary.
12. **Store all sensitive borrower data encrypted** (SSN, income, credit scores).
13. **Maintain complete audit trails** for all mortgage operations.

### Microservices Rules
14. **Each microservice owns its data** - No shared databases across services.
15. **Use mesh topology** for service-to-service coordination.
16. **All services MUST be containerized** with Docker and have health check endpoints.

---

**Remember: Archon OS CLI coordinates, Claude Code Task tool creates!**
