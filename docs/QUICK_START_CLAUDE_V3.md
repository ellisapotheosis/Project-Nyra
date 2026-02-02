# Quick Start: Claude Flow V3 Operations

This quick reference card covers essential Claude Flow V3 operations. Refer to `CLAUDE.md` for comprehensive documentation.

---

## Critical Rules (MUST FOLLOW)

### Swarm Execution Rules

```
1. SPAWN IN BACKGROUND: run_in_background: true
2. SPAWN ALL AT ONCE: All agents in ONE message
3. TELL USER: List what agents are doing
4. STOP AND WAIT: Don't add more tool calls
5. NO POLLING: Never check swarm status
6. SYNTHESIZE: Review all results together
7. NO CONFIRMATION: Just wait for results
```

### File Organization

```
NEVER save to root folder. Use:
/src - Source code
/tests - Test files (TDD first!)
/docs - Documentation
/config - Configuration
/apps - Frontend apps
/services - Backend services
/infra - Infrastructure
```

### Concurrent Execution

**GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"**

Batch all of:
- TodoWrite todos (5-10+ together)
- Task tool agents (all in one message)
- File operations (read/write/edit together)
- Bash commands (together)
- Memory operations (together)

---

## TDD Workflow (Red-Green-Refactor)

```bash
# 1. Initialize mesh swarm
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 6

# 2. Write failing tests (RED)
Task({
  prompt: "Write comprehensive unit tests. Tests should FAIL.",
  subagent_type: "tester",
  run_in_background: true
})

# 3. Minimal implementation (GREEN)
Task({
  prompt: "Write minimal code to pass tests. No over-engineering.",
  subagent_type: "coder",
  run_in_background: true
})

# 4. Quality improvements (REFACTOR)
Task({
  prompt: "Refactor for readability, performance. Keep tests green.",
  subagent_type: "reviewer",
  run_in_background: true
})
```

**Coverage**: 90%+ mandatory for all business logic

---

## Memory Operations

```bash
# Search (semantic vector search)
npx @claude-flow/cli@latest memory search --query "pattern keywords"

# Store pattern
npx @claude-flow/cli@latest memory store --key "name" --value "content" --namespace patterns

# Retrieve specific entry
npx @claude-flow/cli@latest memory retrieve --key "name" --namespace patterns

# List entries
npx @claude-flow/cli@latest memory list --namespace patterns --limit 10
```

**Priority**: RuVector > Letta > Graphiti > Mem0 > OpenMemory

---

## Swarm Topologies

### Mesh (DEFAULT for TDD/Microservices)

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 8 --strategy balanced
```
- Peer-to-peer coordination
- Use for: TDD, microservices, parallel features

### Hierarchical (Compliance-Critical)

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```
- Queen controls workers
- Use for: compliance validation, audit trails

### Hierarchical-Mesh (10+ Agents)

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical-mesh --max-agents 15 --strategy specialized
```
- Hybrid: queen + peer communication
- Use for: campaign orchestration, large workflows

---

## CLI Commands Quick Reference

### Core Operations

```bash
# Initialize project
npx @claude-flow/cli@latest init --wizard

# Start daemon
npx @claude-flow/cli@latest daemon start

# System health check
npx @claude-flow/cli@latest doctor --fix

# Check routing
npx @claude-flow/cli@latest hooks pre-task --description "[task description]"

# Record task completion
npx @claude-flow/cli@latest hooks post-task --task-id "[id]" --success true
```

### Agent Operations

```bash
# Spawn agent
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder

# List agents
npx @claude-flow/cli@latest agent list

# Check agent status
npx @claude-flow/cli@latest agent status
```

### Memory Operations

```bash
# Search
npx @claude-flow/cli@latest memory search --query "pattern"

# Store
npx @claude-flow/cli@latest memory store --key "name" --value "content" --namespace patterns

# Initialize memory
npx @claude-flow/cli@latest memory init --force --verbose
```

### Performance & Security

```bash
# Security scan
npx @claude-flow/cli@latest security scan --depth full

# Performance benchmark
npx @claude-flow/cli@latest performance benchmark --suite all

# Coverage gaps
npx @claude-flow/cli@latest hooks coverage-gaps --format table
```

---

## Agent Routing Quick Reference

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

## When to Auto-Invoke Swarm

**SPAWN SWARM when:**
- Multiple files (3+)
- New feature (TDD)
- Refactoring across modules
- API changes with tests
- Security-related changes
- Performance optimization
- Database schema changes

**SKIP SWARM for:**
- Single file edits
- Simple bug fixes (1-2 lines)
- Documentation updates
- Quick questions

---

## Auto-Learning Pattern

### Before Starting Task

```bash
# Search for similar patterns
npx @claude-flow/cli@latest memory search --query '[task keywords]' --namespace patterns

# Check routing recommendation
npx @claude-flow/cli@latest hooks route --task '[task description]'
```

### After Completing Task

```bash
# Store successful pattern
npx @claude-flow/cli@latest memory store --key 'pattern-name' --value 'what worked' --namespace patterns

# Train neural patterns
npx @claude-flow/cli@latest hooks post-edit --file '[main-file]' --train-neural true

# Record completion
npx @claude-flow/cli@latest hooks post-task --task-id '[id]' --success true --store-results true
```

---

## Mortgage-Specific Rules (CRITICAL)

1. **Compliance First**: Every mortgage feature MUST include TILA/RESPA/TRID validation
2. **No Locked Component Modification**: Nexus, TwentyCRM, Dify, n8n, Letta, Graphiti
3. **Local LLMs First**: 80%+ on GPU workers, fallback to cloud only when needed
4. **Encrypt Sensitive Data**: SSN, income, credit scores, financial documents
5. **Audit Trails**: Complete audit logs for all mortgage operations

**More Details**: See `/docs/MORTGAGE_DOMAIN.md`

---

## Microservices Rules

1. **Data Ownership**: Each service owns its data (no shared databases)
2. **Mesh Topology**: Use for service-to-service coordination
3. **Containerization**: All services MUST be containerized with Docker and have health checks

---

## Environment Setup

```bash
# MCP servers
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest

# Start daemon
npx @claude-flow/cli@latest daemon start

# Health check
npx @claude-flow/cli@latest doctor --fix
```

---

## Model Routing Tiers

| Tier | Handler | Latency | Cost | Use Cases |
|------|---------|---------|------|-----------|
| 1 | Agent Booster | <1ms | $0 | var→const, add-types |
| 2 | Haiku | 500ms | $0.0002 | Simple tasks, bug fixes |
| 3 | Sonnet/Opus | 2-5s | $0.003+ | Architecture, security, reasoning |

**Check routing before spawning**: `npx @claude-flow/cli@latest hooks pre-task --description "[task]"`

---

## GPU Worker Access

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
    "messages": [{"role": "user", "content": "your prompt"}]
  }'
```

---

## Documentation

| File | Content |
|------|---------|
| `CLAUDE.md` | Core Claude Flow V3 configuration (READ FIRST) |
| `docs/MORTGAGE_DOMAIN.md` | Mortgage-specific content, workflows, agents |
| `docs/CLAUDE_REFACTORING_SUMMARY.md` | What was refactored and why |
| `docs/REFACTORING_VALIDATION.md` | Detailed validation report |
| `docs/QUICK_START_CLAUDE_V3.md` | This file - quick reference |
| `.claude-flow/CAPABILITIES.md` | Full feature reference |

---

## Common Tasks

### Start TDD Feature Development

```bash
npx @claude-flow/cli@latest swarm init --topology mesh --max-agents 6
# Then spawn 3 agents: tester (RED), coder (GREEN), reviewer (REFACTOR)
```

### Search Memory for Pattern

```bash
npx @claude-flow/cli@latest memory search --query "authentication patterns"
```

### Create Mortgage Quote

```bash
npx @claude-flow/cli@latest workflow run lead-to-quote \
  --borrower-id 12345 \
  --topology mesh \
  --compliance-check true
```

### Health Check

```bash
npx @claude-flow/cli@latest doctor --fix
```

### Performance Benchmark

```bash
npx @claude-flow/cli@latest performance benchmark --suite all
```

---

## Support

- **Main Documentation**: See `CLAUDE.md`
- **Mortgage Details**: See `docs/MORTGAGE_DOMAIN.md`
- **Full Features**: See `.claude-flow/CAPABILITIES.md`
- **Project Architecture**: See `ToDo/whitepaper-workflow/nyra-mcp-infisical-patchkit-v1/docs/`

---

**Remember**: CLI coordinates strategy, Task tool agents execute!
