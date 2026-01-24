# Project Nyra - Claude Code Configuration (Claude Flow V3)

> **AI-Powered Mortgage Automation Platform**
> Multi-agent orchestration for mortgage operations with strict compliance requirements

## 🏠 PROJECT CONTEXT

**Mission**: AI-powered mortgage brokerage automation handling lead-to-close workflows with 80% reduction in manual work.

**Domain**: Mortgage operations including lead intake, quote generation, document processing, drip campaigns, compliance validation, and borrower assistance.

**Architecture**: Dual-orchestrator system combining Claude Flow (planning/SPARC) with Archon OS (task execution) serving mortgage brokerage with ~100-500 monthly leads.

**Infrastructure**: 4-PC local LAN cluster (1 orchestrator mini + 3 GPU workers with RTX 5090/3090/3060) running local LLMs via Ollama with cloud fallback.

### 🔒 Locked Architecture Components

**DO NOT MODIFY** these finalized decisions:

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **LLM Gateway** | Nexus Router + LiteLLM | 6000 | Model routing, OpenRouter integration |
| **CRM** | TwentyCRM | 3000 | System of record for leads/pipeline |
| **Memory** | Letta + Graphiti + Mem0 + RuVector | Multiple | Multi-system memory architecture |
| **Workflows** | n8n + Activepieces | 5678 | Campaign automation, integrations |
| **Chat UI** | Dify | 3001 | Borrower-facing chat interface |
| **Observability** | Prometheus + Grafana + Loki | 9090/3005/3100 | Monitoring stack |

### 📚 Documentation References

- **Whitepaper**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- **SPARC Workflows**: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`
- **Capabilities**: `.claude-flow/CAPABILITIES.md`

### 🎯 Mortgage-Specific Requirements

**Compliance-First Development**: Every mortgage feature MUST include:
- TILA/RESPA/TRID disclosure validation
- Anti-steering policy enforcement
- Fair lending law compliance
- State-specific regulations (50 states)
- CFPB examination standards

**Domain-Specific Agents**:
- `mortgage-quote-agent` - Rate calculation, lender comparison
- `loan-qualification-agent` - DTI, credit, eligibility analysis
- `document-processor-agent` - OCR, validation, extraction
- `compliance-agent` - Regulatory verification
- `borrower-communication-agent` - Email, SMS, call automation

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

### 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms (var→const, add-types, remove-console) |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks, bug fixes, low complexity |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Architecture, security, complex reasoning |

**Before spawning agents, get routing recommendation:**
```bash
npx @claude-flow/cli@latest hooks pre-task --description "[task description]"
```

**When you see these recommendations:**

1. `[AGENT_BOOSTER_AVAILABLE]` → Skip LLM entirely, use Edit tool directly
   - Intent types: `var-to-const`, `add-types`, `add-error-handling`, `async-await`, `add-logging`, `remove-console`

2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool:
```javascript
Task({
  prompt: "...",
  subagent_type: "coder",
  model: "haiku"  // ← USE THE RECOMMENDED MODEL (haiku/sonnet/opus)
})
```

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks

---

### 🛡️ Anti-Drift Config (PREFERRED)

**Use this to prevent agent drift:**
```bash
# Small teams (6-8 agents) - use hierarchical for tight control
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Large teams (10-15 agents) - use hierarchical-mesh for V3 queen + peer communication
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized
```

**Valid Topologies:**
- `hierarchical` - Queen controls workers directly (anti-drift for small teams)
- `hierarchical-mesh` - V3 queen + peer communication (recommended for 10+ agents)
- `mesh` - Fully connected peer network
- `ring` - Circular communication pattern
- `star` - Central coordinator with spokes
- `hybrid` - Dynamic topology switching

**Anti-Drift Guidelines:**
- **hierarchical**: Coordinator catches divergence
- **max-agents 6-8**: Smaller team = less drift
- **specialized**: Clear roles, no overlap
- **consensus**: raft (leader maintains state)

---

### 🔄 Auto-Start Swarm Protocol (Background Execution)

When the user requests a complex task, **spawn agents in background and WAIT for completion:**

```javascript
// STEP 1: Initialize swarm coordination (anti-drift config)
Bash("npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized")

// STEP 2: Spawn ALL agents IN BACKGROUND in a SINGLE message
// Use run_in_background: true so agents work concurrently
Task({
  prompt: "Research requirements, analyze codebase patterns, store findings in memory",
  subagent_type: "researcher",
  description: "Research phase",
  run_in_background: true  // ← CRITICAL: Run in background
})
Task({
  prompt: "Design architecture based on research. Document decisions.",
  subagent_type: "system-architect",
  description: "Architecture phase",
  run_in_background: true
})
Task({
  prompt: "Implement the solution following the design. Write clean code.",
  subagent_type: "coder",
  description: "Implementation phase",
  run_in_background: true
})
Task({
  prompt: "Write comprehensive tests for the implementation.",
  subagent_type: "tester",
  description: "Testing phase",
  run_in_background: true
})
Task({
  prompt: "Review code quality, security, and best practices.",
  subagent_type: "reviewer",
  description: "Review phase",
  run_in_background: true
})

// STEP 3: WAIT - Tell user agents are working, then STOP
// Say: "I've spawned 5 agents to work on this in parallel. They'll report back when done."
// DO NOT check status repeatedly. Just wait for user or agent responses.
```

### ⏸️ CRITICAL: Spawn and Wait Pattern

**After spawning background agents:**

1. **TELL USER** - "I've spawned X agents working in parallel on: [list tasks]"
2. **STOP** - Do not continue with more tool calls
3. **WAIT** - Let the background agents complete their work
4. **RESPOND** - When agents return results, review and synthesize

**Example response after spawning:**
```
I've launched 5 concurrent agents to work on this:
- 🔍 Researcher: Analyzing requirements and codebase
- 🏗️ Architect: Designing the implementation approach
- 💻 Coder: Implementing the solution
- 🧪 Tester: Writing tests
- 👀 Reviewer: Code review and security check

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

## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
```bash
# 1. Search memory for relevant patterns from past successes
Bash("npx @claude-flow/cli@latest memory search --query '[task keywords]' --namespace patterns")

# 2. Check if similar task was done before
Bash("npx @claude-flow/cli@latest memory search --query '[task type]' --namespace tasks")

# 3. Load learned optimizations
Bash("npx @claude-flow/cli@latest hooks route --task '[task description]'")
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern for future reference
Bash("npx @claude-flow/cli@latest memory store --namespace patterns --key '[pattern-name]' --value '[what worked]'")

# 2. Train neural patterns on the successful approach
Bash("npx @claude-flow/cli@latest hooks post-edit --file '[main-file]' --train-neural true")

# 3. Record task completion with metrics
Bash("npx @claude-flow/cli@latest hooks post-task --task-id '[id]' --success true --store-results true")

# 4. Trigger optimization worker if performance-related
Bash("npx @claude-flow/cli@latest hooks worker dispatch --trigger optimize")
```

### Continuous Improvement Triggers

| Trigger | Worker | When to Use |
|---------|--------|-------------|
| After major refactor | `optimize` | Performance optimization |
| After adding features | `testgaps` | Find missing test coverage |
| After security changes | `audit` | Security analysis |
| After API changes | `document` | Update documentation |
| Every 5+ file changes | `map` | Update codebase map |
| Complex debugging | `deepdive` | Deep code analysis |

### Memory-Enhanced Development

**ALWAYS check memory before:**
- Starting a new feature (search for similar implementations)
- Debugging an issue (search for past solutions)
- Refactoring code (search for learned patterns)
- Performance work (search for optimization strategies)

**ALWAYS store in memory after:**
- Solving a tricky bug (store the solution pattern)
- Completing a feature (store the approach)
- Finding a performance fix (store the optimization)
- Discovering a security issue (store the vulnerability pattern)

### 📋 Agent Routing (Anti-Drift)

| Code | Task | Agents |
|------|------|--------|
| 1 | Bug Fix | coordinator, researcher, coder, tester |
| 3 | Feature | coordinator, architect, coder, tester, reviewer |
| 5 | Refactor | coordinator, architect, coder, reviewer |
| 7 | Performance | coordinator, perf-engineer, coder |
| 9 | Security | coordinator, security-architect, auditor |
| 11 | Docs | researcher, api-docs |

**Codes 1-9: hierarchical/specialized (anti-drift). Code 11: mesh/balanced**

### 🎯 Task Complexity Detection

**AUTO-INVOKE SWARM when task involves:**
- Multiple files (3+)
- New feature implementation
- Refactoring across modules
- API changes with tests
- Security-related changes
- Performance optimization
- Database schema changes

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Configuration changes
- Quick questions/exploration

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories
4. **USE CLAUDE CODE'S TASK TOOL** for spawning agents concurrently, not just MCP

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

## 📋 Scope Note: TodoWrite vs Archon

**In Claude Flow context (this file)**:
- **TodoWrite**: For in-session task tracking within Claude Code's task management system. Use for immediate work organization and progress tracking during a single conversation.
- **Archon**: For cross-session project management and team coordination. Refer to `tools/archon/CLAUDE.md` for Archon-specific workflows.

**When to Use TodoWrite**: Quick task lists during active development, coordinating multi-agent work within one session
**When to Use Archon**: Project planning, persistent task tracking, team collaboration, knowledge management

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool (Claude Code)**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/src` - Source code files
- `/tests` - Test files
- `/docs` - Documentation and markdown files
- `/config` - Configuration files
- `/scripts` - Utility scripts
- `/examples` - Example code
- `/apps` - Frontend applications (Next.js/React)
- `/services` - Backend microservices (FastAPI/NestJS)
- `/mcp-servers` - MCP server implementations
- `/infra` - Infrastructure as Code (Docker, K8s, Terraform)

### 🏗️ Polyglot Architecture

Project Nyra uses multiple languages requiring component-level CLAUDE.md files:

**Python Services (FastAPI)**:
- Location: `/services/quote-api`, `/services/quote-engine`, `/services/campaign-engine`
- CLAUDE.md: Include FastAPI patterns, Pydantic models, async/await, pytest strategies
- Pattern: Mesh topology for data processing
- Example: `services/quote-api/CLAUDE.md`, `services/campaign-engine/CLAUDE.md`

**TypeScript Applications (Next.js/React)**:
- Location: `/apps/web`, `/apps/web/crm-dashboard`, `/apps/landing`
- CLAUDE.md: Include Server Components, tRPC, Zustand, Tailwind patterns
- Pattern: Star topology for type propagation
- Example: `apps/web/CLAUDE.md`, `apps/landing/CLAUDE.md`

**Node.js Services (NestJS)**:
- Location: `/services/nyra-orchestrator`, `/services/orchestrator`, `/services/auth-service`
- CLAUDE.md: Include modules, providers, dependency injection patterns
- Pattern: Hierarchical with domain-driven design
- Example: `services/nyra-orchestrator/CLAUDE.md`, `services/auth-service/CLAUDE.md`

### 🧠 Memory System Integration

Project Nyra uses **5 memory systems** with specific use cases:

#### Memory Priority Order
1. **RuVector** (Primary) - Fast vector search, code retrieval, document similarity
2. **Letta** - Conversational memory, agent state, task context
3. **Graphiti** - Temporal knowledge graphs, relationship tracking, loan evolution
4. **Mem0** - User personalization, borrower preferences across apps
5. **OpenMemory** - Shared collaborative memory, team knowledge

#### When to Use Each System

| Use Case | System | Command |
|----------|--------|---------|
| Find similar mortgage quotes | RuVector | `ruvector_search(query, k=5)` |
| Remember borrower conversation | Letta | `letta_update_memory(agent_id, content)` |
| Track loan status changes | Graphiti | `graphiti_get_evolution(loan_id, timerange)` |
| Store borrower preferences | Mem0 | `mem0_update_profile(borrower_id, prefs)` |
| Share compliance patterns | OpenMemory | `openmemory_share(pattern, agents)` |
| Search mortgage documents | RuVector | `ruvector_index(doc, metadata)` |
| Query relationship history | Graphiti | `graphiti_query(cypher_query)` |

#### Memory Coordination Pattern

```bash
# Before any mortgage task, check relevant memory
npx @claude-flow/cli@latest memory search --query "conventional loan qualification" --namespace mortgage-patterns

# After successful task, store pattern
npx @claude-flow/cli@latest memory store --key "pattern-dti-calculation" --value "Verified DTI formula with CFPB guidelines" --namespace mortgage-patterns

# Update agent memory
letta_update_memory(borrower_agent_id, {
  last_quote_amount: 350000,
  preferred_loan_type: "conventional",
  target_down_payment: 20
})

# Track in knowledge graph
graphiti_add_node({
  type: "MortgageQuote",
  properties: { amount, rate, lender },
  relationships: [{ type: "QUOTED_FOR", targetId: borrower_id }]
})
```

## Project Config (Anti-Drift Defaults)

- **Topology**: hierarchical (prevents drift)
- **Max Agents**: 8 (smaller = less drift)
- **Strategy**: specialized (clear roles)
- **Consensus**: raft
- **Memory**: hybrid
- **HNSW**: Enabled
- **Neural**: Enabled

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `init` | 4 | Project initialization with wizard, presets, skills, hooks |
| `agent` | 8 | Agent lifecycle (spawn, list, status, stop, metrics, pool, health, logs) |
| `swarm` | 6 | Multi-agent swarm coordination and orchestration |
| `memory` | 11 | AgentDB memory with vector search (150x-12,500x faster) |
| `mcp` | 9 | MCP server management and tool execution |
| `task` | 6 | Task creation, assignment, and lifecycle |
| `session` | 7 | Session state management and persistence |
| `config` | 7 | Configuration management and provider setup |
| `status` | 3 | System status monitoring with watch mode |
| `workflow` | 6 | Workflow execution and template management |
| `hooks` | 17 | Self-learning hooks + 12 background workers |
| `hive-mind` | 6 | Queen-led Byzantine fault-tolerant consensus |

### Advanced Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `daemon` | 5 | Background worker daemon (start, stop, status, trigger, enable) |
| `neural` | 5 | Neural pattern training (train, status, patterns, predict, optimize) |
| `security` | 6 | Security scanning (scan, audit, cve, threats, validate, report) |
| `performance` | 5 | Performance profiling (benchmark, profile, metrics, optimize, report) |
| `providers` | 5 | AI providers (list, add, remove, test, configure) |
| `plugins` | 5 | Plugin management (list, install, uninstall, enable, disable) |
| `deployment` | 5 | Deployment management (deploy, rollback, status, environments, release) |
| `embeddings` | 4 | Vector embeddings (embed, batch, search, init) - 75x faster with agentic-flow |
| `claims` | 4 | Claims-based authorization (check, grant, revoke, list) |
| `migrate` | 5 | V2 to V3 migration with rollback support |
| `doctor` | 1 | System diagnostics with health checks |
| `completions` | 4 | Shell completions (bash, zsh, fish, powershell) |

### Quick CLI Examples

```bash
# Initialize project
npx @claude-flow/cli@latest init --wizard

# Start daemon with background workers
npx @claude-flow/cli@latest daemon start

# Spawn an agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# Initialize swarm
npx @claude-flow/cli@latest swarm init --v3-mode

# Search memory (HNSW-indexed)
npx @claude-flow/cli@latest memory search --query "authentication patterns"

# System diagnostics
npx @claude-flow/cli@latest doctor --fix

# Security scan
npx @claude-flow/cli@latest security scan --depth full

# Performance benchmark
npx @claude-flow/cli@latest performance benchmark --suite all
```

## 🚀 Available Agents (60+ Types)

### Core Development
`coder`, `reviewer`, `tester`, `planner`, `researcher`

### V3 Specialized Agents
`security-architect`, `security-auditor`, `memory-specialist`, `performance-engineer`

### 🔐 @claude-flow/security
CVE remediation, input validation, path security:
- `InputValidator` - Zod validation
- `PathValidator` - Traversal prevention
- `SafeExecutor` - Injection protection

### Swarm Coordination
`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`, `collective-intelligence-coordinator`, `swarm-memory-manager`

### Consensus & Distributed
`byzantine-coordinator`, `raft-manager`, `gossip-coordinator`, `consensus-builder`, `crdt-synchronizer`, `quorum-manager`, `security-manager`

### Performance & Optimization
`perf-analyzer`, `performance-benchmarker`, `task-orchestrator`, `memory-coordinator`, `smart-agent`

### GitHub & Repository
`github-modes`, `pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`, `workflow-automation`, `project-board-sync`, `repo-architect`, `multi-repo-swarm`

### SPARC Methodology
`sparc-coord`, `sparc-coder`, `specification`, `pseudocode`, `architecture`, `refinement`

### Specialized Development
`backend-dev`, `mobile-dev`, `ml-developer`, `cicd-engineer`, `api-docs`, `system-architect`, `code-analyzer`, `base-template-generator`

### Testing & Validation
`tdd-london-swarm`, `production-validator`

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)

### All Available Hooks

| Hook | Description | Key Options |
|------|-------------|-------------|
| `pre-edit` | Get context before editing files | `--file`, `--operation` |
| `post-edit` | Record editing outcome for learning | `--file`, `--success`, `--train-neural` |
| `pre-command` | Assess risk before commands | `--command`, `--validate-safety` |
| `post-command` | Record command execution outcome | `--command`, `--track-metrics` |
| `pre-task` | Record task start, get agent suggestions | `--description`, `--coordinate-swarm` |
| `post-task` | Record task completion for learning | `--task-id`, `--success`, `--store-results` |
| `session-start` | Start/restore session (v2 compat) | `--session-id`, `--auto-configure` |
| `session-end` | End session and persist state | `--generate-summary`, `--export-metrics` |
| `session-restore` | Restore a previous session | `--session-id`, `--latest` |
| `route` | Route task to optimal agent | `--task`, `--context`, `--top-k` |
| `route-task` | (v2 compat) Alias for route | `--task`, `--auto-swarm` |
| `explain` | Explain routing decision | `--topic`, `--detailed` |
| `pretrain` | Bootstrap intelligence from repo | `--model-type`, `--epochs` |
| `build-agents` | Generate optimized agent configs | `--agent-types`, `--focus` |
| `metrics` | View learning metrics dashboard | `--v3-dashboard`, `--format` |
| `transfer` | Transfer patterns via IPFS registry | `store`, `from-project` |
| `list` | List all registered hooks | `--format` |
| `intelligence` | RuVector intelligence system | `trajectory-*`, `pattern-*`, `stats` |
| `worker` | Background worker management | `list`, `dispatch`, `status`, `detect` |
| `progress` | Check V3 implementation progress | `--detailed`, `--format` |
| `statusline` | Generate dynamic statusline | `--json`, `--compact`, `--no-color` |
| `coverage-route` | Route based on test coverage gaps | `--task`, `--path` |
| `coverage-suggest` | Suggest coverage improvements | `--path` |
| `coverage-gaps` | List coverage gaps with priorities | `--format`, `--limit` |
| `pre-bash` | (v2 compat) Alias for pre-command | Same as pre-command |
| `post-bash` | (v2 compat) Alias for post-command | Same as post-command |

### 12 Background Workers

| Worker | Priority | Description |
|--------|----------|-------------|
| `ultralearn` | normal | Deep knowledge acquisition |
| `optimize` | high | Performance optimization |
| `consolidate` | low | Memory consolidation |
| `predict` | normal | Predictive preloading |
| `audit` | critical | Security analysis |
| `map` | normal | Codebase mapping |
| `preload` | low | Resource preloading |
| `deepdive` | normal | Deep code analysis |
| `document` | normal | Auto-documentation |
| `refactor` | normal | Refactoring suggestions |
| `benchmark` | normal | Performance benchmarking |
| `testgaps` | normal | Test coverage analysis |

### Essential Hook Commands

```bash
# Core hooks
npx @claude-flow/cli@latest hooks pre-task --description "[task]"
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
npx @claude-flow/cli@latest hooks post-edit --file "[file]" --train-neural true

# Session management
npx @claude-flow/cli@latest hooks session-start --session-id "[id]"
npx @claude-flow/cli@latest hooks session-end --export-metrics true
npx @claude-flow/cli@latest hooks session-restore --session-id "[id]"

# Intelligence routing
npx @claude-flow/cli@latest hooks route --task "[task]"
npx @claude-flow/cli@latest hooks explain --topic "[topic]"

# Neural learning
npx @claude-flow/cli@latest hooks pretrain --model-type moe --epochs 10
npx @claude-flow/cli@latest hooks build-agents --agent-types coder,tester

# Background workers
npx @claude-flow/cli@latest hooks worker list
npx @claude-flow/cli@latest hooks worker dispatch --trigger audit
npx @claude-flow/cli@latest hooks worker status

# Coverage-aware routing
npx @claude-flow/cli@latest hooks coverage-gaps --format table
npx @claude-flow/cli@latest hooks coverage-route --task "[task]"

# Statusline (for Claude Code integration)
npx @claude-flow/cli@latest hooks statusline
npx @claude-flow/cli@latest hooks statusline --json
```

## 🔄 Migration (V2 to V3)

```bash
# Check migration status
npx @claude-flow/cli@latest migrate status

# Run migration with backup
npx @claude-flow/cli@latest migrate run --backup

# Rollback if needed
npx @claude-flow/cli@latest migrate rollback

# Validate migration
npx @claude-flow/cli@latest migrate validate
```

## 🧠 Intelligence System (RuVector)

V3 includes the RuVector Intelligence System:
- **SONA**: Self-Optimizing Neural Architecture (<0.05ms adaptation)
- **MoE**: Mixture of Experts for specialized routing
- **HNSW**: 150x-12,500x faster pattern search
- **EWC++**: Elastic Weight Consolidation (prevents forgetting)
- **Flash Attention**: 2.49x-7.47x speedup

The 4-step intelligence pipeline:
1. **RETRIEVE** - Fetch relevant patterns via HNSW
2. **JUDGE** - Evaluate with verdicts (success/failure)
3. **DISTILL** - Extract key learnings via LoRA
4. **CONSOLIDATE** - Prevent catastrophic forgetting via EWC++

## 📦 Embeddings Package (v3.0.0-alpha.12)

Features:
- **sql.js**: Cross-platform SQLite persistent cache (WASM, no native compilation)
- **Document chunking**: Configurable overlap and size
- **Normalization**: L2, L1, min-max, z-score
- **Hyperbolic embeddings**: Poincaré ball model for hierarchical data
- **75x faster**: With agentic-flow ONNX integration
- **Neural substrate**: Integration with RuVector

## 🐝 Hive-Mind Consensus

### Topologies
- `hierarchical` - Queen controls workers directly
- `mesh` - Fully connected peer network
- `hierarchical-mesh` - Hybrid (recommended)
- `adaptive` - Dynamic based on load

### Consensus Strategies
- `byzantine` - BFT (tolerates f < n/3 faulty)
- `raft` - Leader-based (tolerates f < n/2)
- `gossip` - Epidemic for eventual consistency
- `crdt` - Conflict-free replicated data types
- `quorum` - Configurable quorum-based

## V3 Performance Targets

| Metric | Target |
|--------|--------|
| Flash Attention | 2.49x-7.47x speedup |
| HNSW Search | 150x-12,500x faster |
| Memory Reduction | 50-75% with quantization |
| MCP Response | <100ms |
| CLI Startup | <500ms |
| SONA Adaptation | <0.05ms |

## 📊 Performance Optimization Protocol

### Automatic Performance Tracking
```bash
# After any significant operation, track metrics
Bash("npx @claude-flow/cli@latest hooks post-command --command '[operation]' --track-metrics true")

# Periodically run benchmarks (every major feature)
Bash("npx @claude-flow/cli@latest performance benchmark --suite all")

# Analyze bottlenecks when performance degrades
Bash("npx @claude-flow/cli@latest performance profile --target '[component]'")
```

### Session Persistence (Cross-Conversation Learning)
```bash
# At session start - restore previous context
Bash("npx @claude-flow/cli@latest session restore --latest")

# At session end - persist learned patterns
Bash("npx @claude-flow/cli@latest hooks session-end --generate-summary true --persist-state true --export-metrics true")
```

### Neural Pattern Training
```bash
# Train on successful code patterns
Bash("npx @claude-flow/cli@latest neural train --pattern-type coordination --epochs 10")

# Predict optimal approach for new tasks
Bash("npx @claude-flow/cli@latest neural predict --input '[task description]'")

# View learned patterns
Bash("npx @claude-flow/cli@latest neural patterns --list")
```

## 🔧 Environment Variables

```bash
# Configuration
CLAUDE_FLOW_CONFIG=./claude-flow.config.json
CLAUDE_FLOW_LOG_LEVEL=info

# Provider API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# MCP Server
CLAUDE_FLOW_MCP_PORT=3000
CLAUDE_FLOW_MCP_HOST=localhost
CLAUDE_FLOW_MCP_TRANSPORT=stdio

# Memory
CLAUDE_FLOW_MEMORY_BACKEND=hybrid
CLAUDE_FLOW_MEMORY_PATH=./data/memory
```

## 🔍 Doctor Health Checks

Run `npx @claude-flow/cli@latest doctor` to check:
- Node.js version (20+)
- npm version (9+)
- Git installation
- Config file validity
- Daemon status
- Memory database
- API keys
- MCP servers
- Disk space
- TypeScript installation

## 🚀 Quick Setup

```bash
# Add MCP servers (auto-detects MCP mode when stdin is piped)
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest
claude mcp add ruv-swarm -- npx -y ruv-swarm mcp start  # Optional
claude mcp add flow-nexus -- npx -y flow-nexus@latest mcp start  # Optional

# Start daemon
npx @claude-flow/cli@latest daemon start

# Run doctor
npx @claude-flow/cli@latest doctor --fix
```

## 🎯 Claude Code vs CLI Tools

### Claude Code Handles ALL EXECUTION:
- **Task tool**: Spawn and run agents concurrently
- File operations (Read, Write, Edit, MultiEdit, Glob, Grep)
- Code generation and programming
- Bash commands and system operations
- TodoWrite and task management
- Git operations

### CLI Tools Handle Coordination (via Bash):
- **Swarm init**: `npx @claude-flow/cli@latest swarm init --topology <type>`
- **Swarm status**: `npx @claude-flow/cli@latest swarm status`
- **Agent spawn**: `npx @claude-flow/cli@latest agent spawn -t <type> --name <name>`
- **Memory store**: `npx @claude-flow/cli@latest memory store --key "mykey" --value "myvalue" --namespace patterns`
- **Memory search**: `npx @claude-flow/cli@latest memory search --query "search terms"`
- **Memory list**: `npx @claude-flow/cli@latest memory list --namespace patterns`
- **Memory retrieve**: `npx @claude-flow/cli@latest memory retrieve --key "mykey" --namespace patterns`
- **Hooks**: `npx @claude-flow/cli@latest hooks <hook-name> [options]`

## 📝 Memory Commands Reference (IMPORTANT)

### Store Data (ALL options shown)
```bash
# REQUIRED: --key and --value
# OPTIONAL: --namespace (default: "default"), --ttl, --tags
npx @claude-flow/cli@latest memory store --key "pattern-auth" --value "JWT with refresh tokens" --namespace patterns
npx @claude-flow/cli@latest memory store --key "bug-fix-123" --value "Fixed null check" --namespace solutions --tags "bugfix,auth"
```

### Search Data (semantic vector search)
```bash
# REQUIRED: --query (full flag, not -q)
# OPTIONAL: --namespace, --limit, --threshold
npx @claude-flow/cli@latest memory search --query "authentication patterns"
npx @claude-flow/cli@latest memory search --query "error handling" --namespace patterns --limit 5
```

### List Entries
```bash
# OPTIONAL: --namespace, --limit
npx @claude-flow/cli@latest memory list
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
# REQUIRED: --key
# OPTIONAL: --namespace (default: "default")
npx @claude-flow/cli@latest memory retrieve --key "pattern-auth"
npx @claude-flow/cli@latest memory retrieve --key "pattern-auth" --namespace patterns
```

### Initialize Memory Database
```bash
npx @claude-flow/cli@latest memory init --force --verbose
```

**KEY**: CLI coordinates the strategy via Bash, Claude Code's Task tool executes with real agents.

## 🖥️ Local LLM Infrastructure

### GPU Worker Cluster

Project Nyra uses a **local-first LLM strategy** with 3 GPU workers:

| Worker | GPU | VRAM | Models | Purpose |
|--------|-----|------|--------|---------|
| **Worker-5090** | RTX 5090 | 48GB | DeepSeek-R1 236B, Qwen 2.5 72B | Complex reasoning, compliance analysis |
| **Worker-3090** | RTX 3090 Ti | 24GB | Llama 3.1 70B, Mistral Large 123B | General purpose, quote generation |
| **Worker-3060** | RTX 3060 | 12GB | CodeLlama 34B, Qwen 32B, Gemma 2 27B | Document processing, embeddings |

**LLM Routing Strategy**:
1. **Local-First**: Route 80%+ requests to GPU workers via Ollama
2. **Cloud Fallback**: OpenRouter DeepSeek-R1 for overflow
3. **Critical Tasks**: Anthropic Claude Sonnet 4 for compliance, legal, complex mortgage logic

**Cost Optimization**:
- Local inference: $0/request (electricity only)
- DeepSeek-R1: $0.14/1M input, $0.55/1M output (99% cheaper than GPT-4)
- Claude Sonnet 4: Reserve for high-stakes decisions only

### Accessing GPU Workers

```bash
# Check worker availability
curl http://worker-5090.tail-net.ts.net:11434/v1/models
curl http://worker-3090.tail-net.ts.net:11434/v1/models
curl http://worker-3060.tail-net.ts.net:11434/v1/models

# Route via Nexus
curl -X POST http://localhost:6000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ollama/deepseek-r1:236b",
    "messages": [{"role": "user", "content": "Calculate DTI for income $8000, debts $3000"}]
  }'
```

## 🎯 Nyra-Specific Performance Targets

### Business Metrics
| Metric | Target | Monitoring |
|--------|--------|------------|
| Lead conversion rate | >15% | TwentyCRM pipeline |
| Time to quote generation | <2 minutes | Quote API metrics |
| Documents processed/hour | >50 | Document processor logs |
| Email/SMS open rates | >40% | Campaign engine analytics |
| Borrower satisfaction | >4.5/5 | Dify chat feedback |

### Technical Metrics
| Metric | Target | Tool |
|--------|--------|------|
| API response time (p95) | <200ms | Prometheus |
| LLM routing local vs cloud | >80% local | Nexus logs |
| Memory system read latency | <50ms | AgentDB metrics |
| Agent task completion rate | >95% | Claude Flow dashboard |
| System uptime | >99.9% | Grafana alerts |

### Compliance Metrics
| Metric | Target | Tool |
|--------|--------|------|
| Disclosure generation success | 100% | Compliance agent logs |
| Audit log completeness | 100% | Loki queries |
| TRID timeline adherence | 100% | Campaign engine validation |
| Data encryption coverage | 100% PII | Security scan |

## 🏠 Mortgage Workflow Examples

### Lead-to-Quote Workflow
```bash
# 1. Initialize swarm for new lead
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# 2. Spawn mortgage workflow agents (in ONE message)
Task({
  prompt: "Analyze lead data, check credit requirements, store borrower profile in Letta and Mem0",
  subagent_type: "loan-qualification-agent",
  description: "Qualify borrower for loan types",
  run_in_background: true
})
Task({
  prompt: "Generate multi-lender quote using Rocket Mortgage and LenderPrice APIs, store in RuVector",
  subagent_type: "mortgage-quote-agent",
  description: "Create mortgage quote",
  run_in_background: true
})
Task({
  prompt: "Validate TILA/RESPA disclosure requirements, check state regulations",
  subagent_type: "compliance-agent",
  description: "Compliance validation",
  run_in_background: true
})
Task({
  prompt: "Create Graphiti knowledge graph relationships: Lead → Borrower → Quote",
  subagent_type: "memory-specialist",
  description: "Memory coordination",
  run_in_background: true
})

# 3. Agents work in parallel, coordinator synthesizes results
```

### Document Processing Workflow
```bash
# Process borrower documents with OCR and validation
npx @claude-flow/cli@latest workflow run document-processing \
  --borrower-id 12345 \
  --files "paystub.pdf,w2.pdf,bank_statement.pdf" \
  --agents "document-processor-agent,compliance-agent" \
  --parallel true
```

### Drip Campaign Workflow
```bash
# Start automated drip sequence
npx @claude-flow/cli@latest workflow run drip-campaign \
  --borrower-id 12345 \
  --sequence "pre-approval-nurture" \
  --channels "email,sms" \
  --compliance-check true
```

## 📚 Full Capabilities Reference

For a comprehensive overview of all Claude Flow V3 features, agents, commands, and integrations, see:

**`.claude-flow/CAPABILITIES.md`** - Complete reference generated during init

This includes:
- All 60+ agent types with routing recommendations
- All 26 CLI commands with 140+ subcommands
- All 27 hooks + 12 background workers
- RuVector intelligence system details
- Hive-Mind consensus mechanisms
- Integration ecosystem (agentic-flow, agentdb, ruv-swarm, flow-nexus, agentic-jujutsu)
- Performance targets and status

### Component-Specific Documentation

Each service and application has its own CLAUDE.md:

**Backend Services**:
- `services/quote-api/CLAUDE.md` - FastAPI quote calculations
- `services/nyra-orchestrator/CLAUDE.md` - Multi-agent orchestration
- `services/mem0/CLAUDE.md` - Memory system implementation
- `services/mem0-mcp/CLAUDE.md` - Memory MCP server
- `services/letta-integration/CLAUDE.md` - Letta memory integration
- `services/graphiti-knowledge/CLAUDE.md` - Temporal knowledge graphs
- `services/auth-service/CLAUDE.md` - Authentication service

**Frontend Applications**:
- `apps/landing/CLAUDE.md` - Next.js public rate site
- `apps/web/CLAUDE.md` - Main web application
- `apps/web/crm-dashboard/CLAUDE.md` - CRM admin dashboard
- `apps/web/mortgage-assistant/CLAUDE.md` - Mortgage assistant interface

**Infrastructure & MCP**:
- `infra/CLAUDE.md` - Docker Compose and infrastructure patterns
- `infra/git-mcp/CLAUDE.md` - Git MCP server implementation
- `infra/infisical-mcp/CLAUDE.md` - Secrets management MCP
- `infra/bitwarden-mcp/CLAUDE.md` - Bitwarden MCP integration
- `services/ruvector-search/CLAUDE.md` - Vector search implementation

## 🏆 Development Priorities

### Phase 1: Core Infrastructure (Week 1)
- All Docker services healthy and networked
- Nexus Router routing to all 3 LLM providers
- TwentyCRM initialized with test data
- Observability dashboards showing metrics

### Phase 2: Business Services (Week 2)
- Quote Engine calculating rates accurately
- Campaign Engine integrating with n8n + Twilio
- Nyra Orchestrator validating compliance
- All services with comprehensive health checks

### Phase 3: Frontend Applications (Week 3)
- RateHunter public site with rate calculator
- Nyra Admin dashboard with lead management
- Dify chat interface embedded in both apps
- Mobile-responsive design throughout

### Phase 4: Integration & Testing (Week 4)
- LendingTree/FreeRateUpdate API integration
- Twilio SMS/voice/email working
- Full workflow testing (lead → quote → campaign → conversion)
- 90%+ test coverage

## 📚 Support & Resources

### Claude Flow V3
- **Documentation**: https://github.com/ruvnet/claude-flow
- **Issues**: https://github.com/ruvnet/claude-flow/issues
- **Capabilities**: `.claude-flow/CAPABILITIES.md`

### Project Nyra
- **Whitepaper**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/WHITEPAPER.md`
- **Architecture**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/whitepaper/ARCHITECTURE.md`
- **SPARC Workflows**: `ToDo/whitepaper-workflow/Nyra-Truth-and-Standards/MORTGAGE-SPARC-WORKFLOWS.md`
- **Compliance Guide**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/COMPLIANCE_GUARDRAILS.md`
- **Stack Decisions**: `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/STACK_DECISIONS.md`

### MCP Integrations
- **Nexus Router**: https://nexusrouter.com/docs
- **Dify**: https://docs.dify.ai/en/use-dify/build/mcp
- **Activepieces**: https://www.activepieces.com/blog/model-context-protocol-mcp
- **Graphiti**: https://help.getzep.com/graphiti/getting-started/mcp-server
- **Letta**: https://docs.letta.com/advanced/memory-management/

### Quick Reference Commands

```bash
# System health check
npx @claude-flow/cli@latest doctor --fix

# Initialize memory systems
npx @claude-flow/cli@latest memory init --all-systems

# Start daemon with background workers
npx @claude-flow/cli@latest daemon start

# Spawn swarm for mortgage workflow
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8

# Check GPU workers
curl http://worker-5090.tail-net.ts.net:11434/v1/models

# View system status
npx @claude-flow/cli@latest status --watch

# Search memory for patterns
npx @claude-flow/cli@latest memory search --query "mortgage patterns" --namespace patterns
```

---

**Remember: Claude Flow CLI coordinates, Claude Code Task tool creates!**

---

# IMPORTANT INSTRUCTION REMINDERS

## Core Principles
1. **Do what has been asked; nothing more, nothing less.**
2. **NEVER create files unless absolutely necessary for achieving your goal.**
3. **ALWAYS prefer editing an existing file to creating a new one.**
4. **NEVER proactively create documentation files (*.md) or README files.** Only create documentation files if explicitly requested by the User.
5. **Never save working files, text/mds and tests to the root folder.** Use appropriate subdirectories (`/docs`, `/tests`, `/apps`, `/services`, etc.).

## Mortgage Domain Rules
6. **Every mortgage feature MUST include compliance validation** (TILA, RESPA, TRID, state regulations).
7. **DO NOT MODIFY locked architecture components** without explicit approval (Nexus, TwentyCRM, Dify, n8n, Letta, Graphiti).
8. **Use local LLMs first** (80%+ on GPU workers), fallback to cloud only when necessary.
9. **Store all sensitive borrower data encrypted** (SSN, income, credit scores, financial documents).
10. **Maintain complete audit trails** for all mortgage operations (quotes, disclosures, communications).

## 🚨 SWARM EXECUTION RULES (CRITICAL)
1. **SPAWN IN BACKGROUND**: Use `run_in_background: true` for all agent Task calls
2. **SPAWN ALL AT ONCE**: Put ALL agent Task calls in ONE message for parallel execution
3. **TELL USER**: After spawning, list what each agent is doing (use emojis for clarity)
4. **STOP AND WAIT**: After spawning, STOP - do NOT add more tool calls or check status
5. **NO POLLING**: Never poll TaskOutput or check swarm status - trust agents to return
6. **SYNTHESIZE**: When agent results arrive, review ALL results before proceeding
7. **NO CONFIRMATION**: Don't ask "should I check?" - just wait for results

Example spawn message:
```
"I've launched 4 agents in background:
- 🔍 Researcher: [task]
- 💻 Coder: [task]
- 🧪 Tester: [task]
- 👀 Reviewer: [task]
Working in parallel - I'll synthesize when they complete."
```
