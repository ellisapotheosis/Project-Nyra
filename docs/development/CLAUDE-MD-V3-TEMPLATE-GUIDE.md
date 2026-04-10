# Claude Flow V3 CLAUDE.md Template Guide

## 📋 Purpose

This guide provides the recommended structure and content for creating CLAUDE.md files using Claude Flow V3 features. Use this as a reference when setting up new projects or migrating from V2.

---

## 🏗️ V3 CLAUDE.md Structure

### Recommended Section Order

```markdown
# Project Title - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION
[Critical instructions for automatic swarm spawning]

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)
[Model routing tier system and usage]

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)
[Topology and strategy configurations]

## 🔄 AUTO-START SWARM PROTOCOL (Background Execution)
[Spawn and wait pattern]

## ⏸️ CRITICAL: Spawn and Wait Pattern
[Background execution rules]

## 🧠 AUTO-LEARNING PROTOCOL
[Before/after task patterns for learning]

## 🚨 CRITICAL DEVELOPMENT RULES
[Project-specific critical rules]

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT
[Parallel execution and file organization]

## ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"
[Batching requirements]

## 📋 Agent Routing (Anti-Drift)
[Routing codes and agent recommendations]

## 🎯 Task Complexity Detection
[When to invoke swarm vs single agent]

## Project Config (Anti-Drift Defaults)
[Default configurations]

## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)
[CLI reference with examples]

## 🚀 Available Agents (60+ Types)
[Agent types by category]

## 🪝 V3 Hooks System (27 Hooks + 12 Workers)
[Complete hooks reference]

## 🔄 Migration (V2 to V3)
[Migration instructions if applicable]

## 🧠 Intelligence System (RuVector)
[RuVector features and usage]

## 📦 Embeddings Package
[Embeddings features if using vector search]

## 🐝 Hive-Mind Consensus
[Consensus strategies]

## 📊 Performance Targets
[V3 specific performance metrics]

## 📊 Performance Optimization Protocol
[Automatic tracking and optimization]

## 🔄 Session Persistence
[Cross-conversation learning setup]

## 🧠 Neural Pattern Training
[Neural training commands]

## 🧠 Memory Management
[Memory usage patterns]

## 🎯 Project Context
[Project-specific information]

## 🔧 Development Patterns
[Language/framework specific patterns]

## 🚀 Deployment & CI/CD
[Deployment strategies]

## 🔒 Security & Compliance
[Security requirements]

## 🔧 Environment Variables
[Required environment variables]

## 🩺 Doctor Health Checks
[Health check information]

## 🚀 Quick Setup
[Getting started instructions]

## 🎯 Claude Code vs CLI Tools
[Clear separation of concerns]

## 📝 Memory Commands Reference
[Complete memory CLI commands]

## 🚨 Swarm Execution Rules
[Critical swarm rules]
```

---

## 📝 Section Templates

### 1. Automatic Swarm Orchestration

```markdown
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
```

### 2. Intelligent Model Routing

```markdown
## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

**The routing system has 3 tiers for optimal cost/performance:**

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| **1** | Agent Booster | <1ms | $0 | Simple transforms (var→const, add-types, remove-console) |
| **2** | Haiku | ~500ms | $0.0002 | Simple tasks, bug fixes, low complexity |
| **3** | Sonnet/Opus | 2-5s | $0.003-$0.015 | Architecture, security, complex reasoning |

**Before spawning agents, get routing recommendation:**
```bash
npx @archon-os/cli@latest hooks pre-task --description "[task description]"
```

**When you see these recommendations:**

1. `[AGENT_BOOSTER_AVAILABLE]` → Skip LLM entirely, use Edit tool directly
   - Intent types: `var-to-const`, `add-types`, `add-error-handling`, `async-await`, `add-logging`, `remove-console`

2. `[TASK_MODEL_RECOMMENDATION] Use model="X"` → Use that model in Task tool:
```javascript
Task({
  prompt: "...",
  subagent_type: "coder",
  model: "haiku"  // ← USE THE RECOMMENDED MODEL
})
```

**Benefits:** 75% cost reduction, 352x faster for Tier 1 tasks
```

### 3. Anti-Drift Configuration

```markdown
## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

**Use this to prevent agent drift:**
```bash
# Small teams (6-8 agents) - use hierarchical for tight control
npx @archon-os/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized

# Large teams (10-15 agents) - use hierarchical-mesh for V3 queen + peer communication
npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized
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
```

### 4. Auto-Learning Protocol

```markdown
## 🧠 AUTO-LEARNING PROTOCOL

### Before Starting Any Task
```bash
# 1. Search memory for relevant patterns from past successes
npx @archon-os/cli@latest memory search --query '[task keywords]' --namespace patterns

# 2. Check if similar task was done before
npx @archon-os/cli@latest memory search --query '[task type]' --namespace tasks

# 3. Load learned optimizations
npx @archon-os/cli@latest hooks route --task '[task description]'
```

### After Completing Any Task Successfully
```bash
# 1. Store successful pattern for future reference
npx @archon-os/cli@latest memory store --namespace patterns --key '[pattern-name]' --value '[what worked]'

# 2. Train neural patterns on the successful approach
npx @archon-os/cli@latest hooks post-edit --file '[main-file]' --train-neural true

# 3. Record task completion with metrics
npx @archon-os/cli@latest hooks post-task --task-id '[id]' --success true --store-results true

# 4. Trigger optimization worker if performance-related
npx @archon-os/cli@latest hooks worker dispatch --trigger optimize
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
```

### 5. Spawn and Wait Pattern

```markdown
## ⏸️ CRITICAL: Spawn and Wait Pattern

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
```

### 6. CLI Commands Reference

```markdown
## 🚀 V3 CLI Commands (26 Commands, 140+ Subcommands)

### Core Commands

| Command | Subcommands | Description |
|---------|-------------|-------------|
| `init` | 4 | Project initialization with wizard, presets, skills, hooks |
| `agent` | 8 | Agent lifecycle (spawn, list, status, stop, metrics, pool, health, logs) |
| `swarm` | 6 | Multi-agent swarm coordination and orchestration |
| `memory` | 11 | ruvector memory with vector search (150x-12,500x faster) |
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
| `embeddings` | 4 | Vector embeddings (embed, batch, search, init) - 75x faster with archon-os |
| `claims` | 4 | Claims-based authorization (check, grant, revoke, list) |
| `migrate` | 5 | V2 to V3 migration with rollback support |
| `doctor` | 1 | System diagnostics with health checks |
| `completions` | 4 | Shell completions (bash, zsh, fish, powershell) |

### Essential Hook Commands

```bash
# Core hooks
npx @archon-os/cli@latest hooks pre-task --description "[task]"
npx @archon-os/cli@latest hooks post-task --task-id "[id]" --success true
npx @archon-os/cli@latest hooks post-edit --file "[file]" --train-neural true

# Session management
npx @archon-os/cli@latest hooks session-start --session-id "[id]"
npx @archon-os/cli@latest hooks session-end --export-metrics true
npx @archon-os/cli@latest hooks session-restore --session-id "[id]"

# Intelligence routing
npx @archon-os/cli@latest hooks route --task "[task]"
npx @archon-os/cli@latest hooks explain --topic "[topic]"

# Neural learning
npx @archon-os/cli@latest hooks pretrain --model-type moe --epochs 10
npx @archon-os/cli@latest hooks build-agents --agent-types coder,tester

# Background workers
npx @archon-os/cli@latest hooks worker list
npx @archon-os/cli@latest hooks worker dispatch --trigger audit
npx @archon-os/cli@latest hooks worker status
```
```

### 7. Memory Commands Reference

```markdown
## 📝 Memory Commands Reference (IMPORTANT)

### Store Data (ALL options shown)
```bash
# REQUIRED: --key and --value
# OPTIONAL: --namespace (default: "default"), --ttl, --tags
npx @archon-os/cli@latest memory store --key "pattern-auth" --value "JWT with refresh tokens" --namespace patterns
npx @archon-os/cli@latest memory store --key "bug-fix-123" --value "Fixed null check" --namespace solutions --tags "bugfix,auth"
```

### Search Data (semantic vector search)
```bash
# REQUIRED: --query (full flag, not -q)
# OPTIONAL: --namespace, --limit, --threshold
npx @archon-os/cli@latest memory search --query "authentication patterns"
npx @archon-os/cli@latest memory search --query "error handling" --namespace patterns --limit 5
```

### List Entries
```bash
# OPTIONAL: --namespace, --limit
npx @archon-os/cli@latest memory list
npx @archon-os/cli@latest memory list --namespace patterns --limit 10
```

### Retrieve Specific Entry
```bash
# REQUIRED: --key
# OPTIONAL: --namespace (default: "default")
npx @archon-os/cli@latest memory retrieve --key "pattern-auth"
npx @archon-os/cli@latest memory retrieve --key "pattern-auth" --namespace patterns
```

### Initialize Memory Database
```bash
npx @archon-os/cli@latest memory init --force --verbose
```
```

### 8. Performance Targets

```markdown
## 🚀 V3 Performance Targets

| Metric | Target |
|--------|--------|
| Flash Attention | 2.49x-7.47x speedup |
| HNSW Search | 150x-12,500x faster |
| Memory Reduction | 50-75% with quantization |
| MCP Response | <100ms |
| CLI Startup | <500ms |
| SONA Adaptation | <0.05ms |
```

### 9. Environment Variables

```markdown
## 🔧 Environment Variables

```bash
# Configuration
CLAUDE_FLOW_CONFIG=./archon-os.config.json
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
```

---

## 🎨 Complete Example: Full-Stack Web App

```markdown
# Full-Stack Web App - Claude Flow V3 Configuration

## 🚨 AUTOMATIC SWARM ORCHESTRATION

When user requests complex development:
1. Initialize swarm using CLI
2. Spawn concurrent agents using Task tool
3. Coordinate via hooks and memory

## 🤖 INTELLIGENT 3-TIER MODEL ROUTING (ADR-026)

[Include routing table from section 2 above]

## 🛡️ ANTI-DRIFT CONFIG (PREFERRED)

**For this full-stack project, use hierarchical-mesh:**
```bash
npx @archon-os/cli@latest swarm init --topology hierarchical-mesh --max-agents 12 --strategy specialized
```

## 🎯 PROJECT CONTEXT

**Stack**: React + TypeScript + Node.js + PostgreSQL
**Architecture**: Microservices with API gateway
**Scale**: Medium team (6-10 developers)
**Deployment**: Docker + Kubernetes

## 📋 Agent Routing

| Code | Task | Agents |
|------|------|--------|
| 3 | Feature | coordinator, architect, frontend-dev, backend-dev, tester, reviewer |
| 5 | Refactor | coordinator, architect, frontend-dev, backend-dev, reviewer |
| 7 | Performance | coordinator, perf-engineer, frontend-dev, backend-dev |

## 🧠 AUTO-LEARNING PROTOCOL

[Include before/after task patterns from section 4 above]

## 🚀 Available Agents for This Project

**Frontend**: react-dev, typescript-expert, ui-ux-designer
**Backend**: nodejs-dev, api-architect, database-expert
**DevOps**: docker-specialist, kubernetes-expert
**Quality**: tester, security-auditor, performance-engineer

## 🔧 Development Patterns

### Frontend (React + TypeScript)
- Strict TypeScript configuration
- Component-based architecture
- State management with Redux Toolkit
- Testing with Jest + React Testing Library

### Backend (Node.js + Express)
- RESTful API design
- JWT authentication
- PostgreSQL with TypeORM
- Comprehensive error handling

### DevOps
- Multi-stage Docker builds
- Kubernetes manifests
- CI/CD with GitHub Actions
- Monitoring with Prometheus + Grafana

## 📝 Memory Commands Reference

[Include memory commands from section 7 above]

## 🚀 V3 Performance Targets

[Include performance targets from section 8 above]

## 🔧 Environment Variables

[Include environment variables from section 9 above]
```

---

## ✅ Checklist for V3 CLAUDE.md

- [ ] Includes automatic swarm orchestration section
- [ ] Includes 3-tier model routing (ADR-026)
- [ ] Includes anti-drift configuration
- [ ] Includes auto-learning protocol (before/after patterns)
- [ ] Includes spawn and wait pattern
- [ ] Includes agent routing codes
- [ ] Includes V3 CLI commands reference
- [ ] Includes hooks system reference (27 hooks + 12 workers)
- [ ] Includes memory commands reference
- [ ] Includes performance targets
- [ ] Includes session persistence instructions
- [ ] Includes neural pattern training commands
- [ ] Includes environment variables
- [ ] Includes project-specific context
- [ ] Includes development patterns
- [ ] Includes security requirements
- [ ] Includes deployment strategies

---

## 🔄 Migration from V2

If migrating from V2 CLAUDE.md:

1. **Keep existing sections:**
   - Project Context
   - Development Patterns
   - Security & Compliance
   - Language-specific guidelines

2. **Add new V3 sections (in order):**
   - Automatic Swarm Orchestration (at top)
   - Intelligent Model Routing
   - Anti-Drift Config
   - Auto-Learning Protocol
   - V3 CLI Commands
   - Hooks System
   - Performance Targets
   - Session Persistence
   - Neural Pattern Training
   - Memory Commands Reference

3. **Enhance existing patterns:**
   - Add hooks to agent coordination
   - Add model routing to task spawning
   - Add auto-learning to workflows
   - Update memory patterns with CLI commands

---

## 📚 Additional Resources

- **Full V2 vs V3 Analysis**: `C:\Dev\Projects\Repos\Project-Nyra\docs\development\CLAUDE-MD-V2-VS-V3-ANALYSIS.md`
- **Root CLAUDE.md (V3 Example)**: `C:\Dev\Projects\Repos\Project-Nyra\CLAUDE.md`
- **Wiki Templates**: `C:\Dev\Projects\Repos\Project-Nyra\docs\references\archon-os-wiki\CLAUDE-MD-Templates.md`
- **Version Comparison**: `C:\Dev\Projects\Repos\Project-Nyra\docs\archon-os-VERSION-COMPARISON.md`

---

*Last Updated: 2026-01-21*
*Version: 1.0*
*Type: V3 Template Guide*
